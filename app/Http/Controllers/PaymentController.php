<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Appointment;
use App\Models\Status;
use App\Notifications\PaymentVerifiedNotification;
use App\Services\BcvService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Models\Notification;
use App\Notifications\PaymentRegisteredDoctorNotification;
use App\Notifications\PaymentRegisteredAdminNotification;
use App\Notifications\PaymentRegisteredPatientNotification;

class PaymentController extends Controller
{
    protected $bcvService;

    public function __construct(BcvService $bcvService)
    {
        $this->bcvService = $bcvService;
    }

    public function createIntent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'method' => 'required|in:pago_movil,bank_transfer,zelle,paypal,wise,cash',
            'provider' => 'sometimes|string|nullable',
        ]);

        $appointment = Appointment::with('doctor')->findOrFail($validated['appointment_id']);
        $user = $request->user();
        $doctor = $appointment->doctor;

        // Verificar que el usuario es el paciente
        if ($appointment->patient_id !== $user->id) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        // Verificar que no existe un pago completado
        if ($appointment->payment_id) {
            $existingPayment = Payment::find($appointment->payment_id);
            if ($existingPayment && $existingPayment->isCompleted()) {
                return response()->json([
                    'message' => 'Este appointment ya tiene un pago completado'
                ], 400);
            }
        }

        // Obtener tasa de cambio oficial del BCV
        $exchangeRate = $this->bcvService->getExchangeRate();

        $payment = Payment::create([
            'id' => Str::uuid(),
            'appointment_id' => $appointment->id,
            'user_id' => $user->id,
            'amount_usd' => $appointment->price_usd,
            'amount_ves' => $appointment->price_usd * $exchangeRate,
            'exchange_rate' => $exchangeRate,
            'currency' => 'USD',
            'method' => $validated['method'],
            'status_id' => Status::where('name', 'payment_pending')->first()->id,
        ]);

        // Actualizar appointment con payment_id
        $appointment->update(['payment_id' => $payment->id]);

        return response()->json([
            'message' => 'Intención de pago creada',
            'payment' => $payment,
            'instructions' => $this->getPaymentInstructions($validated['method'], $doctor)
        ], 201);
    }

    public function getInstructions(Request $request, string $id): JsonResponse
    {
        $payment = Payment::with('appointment.doctor')->where('appointment_id', $id)->firstOrFail();
        
        // Verificar que el usuario es el paciente
        if ($payment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        return response()->json([
            'instructions' => $this->getPaymentInstructions($payment->method, $payment->appointment->doctor)
        ]);
    }

    public function confirm(Request $request, string $id): JsonResponse
    {
        $payment = Payment::findOrFail($id);
        $user = $request->user();

        // Verificar permisos
        if ($payment->user_id !== $user->id) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        $validated = $request->validate([
            'reference_number' => 'required|string|max:100',
            'payment_date' => 'sometimes|nullable|date',
            'payment_phone' => 'sometimes|nullable|string|max:20',
            'transaction_id' => 'sometimes|nullable|string|max:100',
            'proof_url' => 'sometimes|nullable|string|max:500',
        ]);

        $payment->update([
            'reference_number' => $validated['reference_number'],
            'payment_date' => $validated['payment_date'] ?? now()->toDateString(),
            'payment_phone' => $validated['payment_phone'] ?? null,
            'transaction_id' => $validated['transaction_id'] ?? null,
            'proof_url' => $validated['proof_url'] ?? null,
            'status_id' => Status::where('name', 'payment_processing')->first()->id,
        ]);

        // AL CONFIRMAR EL PAGO, ya podemos poner la cita como "pending_verification"
        if ($payment->appointment) {
            $payment->appointment->update([
                'status_id' => Status::where('name', 'pending_verification')->first()->id
            ]);
        }

        // Enviar Notificaciones
        try {
            $patientName = $user->full_name;

            // 1. Al Médico
            if ($payment->appointment && $payment->appointment->doctor) {
                $doctor = $payment->appointment->doctor;
                $doctor->notify(new PaymentRegisteredDoctorNotification($payment));
                
                // Registro manual en la tabla notifications para el Dashboard
                Notification::create([
                    'user_id' => $doctor->id,
                    'type' => 'payment_registered',
                    'title' => 'Nuevo Pago Registrado',
                    'message' => 'Se ha registrado un pago para tu cita con ' . $patientName . '.',
                    'data' => ['payment_id' => $payment->id],
                    'channels' => ['email', 'database'],
                    'sent_at' => now(),
                ]);
            }

            // 2. A los Administradores
            $admins = User::where('type', 'admin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new PaymentRegisteredAdminNotification($payment));
                
                Notification::create([
                    'user_id' => $admin->id,
                    'type' => 'payment_awaiting_validation',
                    'title' => 'Validación de Pago Requerida',
                    'message' => 'El paciente ' . $patientName . ' ha registrado un pago por $' . $payment->amount_usd . ' USD.',
                    'data' => ['payment_id' => $payment->id],
                    'channels' => ['email', 'database'],
                    'sent_at' => now(),
                ]);
            }

            // 3. Al Paciente
            $user->notify(new PaymentRegisteredPatientNotification($payment));
            
            Notification::create([
                'user_id' => $user->id,
                'type' => 'payment_registered',
                'title' => 'Pago en Proceso de Verificación',
                'message' => 'Hemos recibido tu pago. Tu cita será activada una vez sea validada.',
                'data' => ['payment_id' => $payment->id],
                'channels' => ['email', 'database'],
                'sent_at' => now(),
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error enviando notificaciones de pago: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Pago confirmado, en proceso de verificación por el administrador',
            'payment' => $payment
        ]);
    }

    public function uploadProof(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,pdf|max:2048',
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('proofs', 'public');
            $url = asset('storage/' . $path);

            return response()->json([
                'url' => $url,
                'message' => 'Archivo subido exitosamente'
            ]);
        }

        return response()->json(['message' => 'Error al subir el archivo'], 400);
    }

    /**
     * Listar pagos para el administrador (Todos los pagos del sistema)
     */
    public function adminPayments(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        $payments = Payment::with(['user', 'appointment.doctor', 'status'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($payments);
    }

    /**
     * Verificar un pago (Aprobar o Rechazar)
     */
    public function verify(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isDoctor() && !$user->isAdmin()) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        $payment = Payment::with('appointment.patient')->findOrFail($id);

        if ($user->isDoctor() && $payment->appointment->doctor_id !== $user->id) {
            return response()->json(['message' => 'Este pago no pertenece a sus citas'], 403);
        }

        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
            'reason' => 'nullable|string|max:500',
        ]);

        if ($validated['action'] === 'approve') {
            $payment->update([
                'status_id' => Status::where('name', 'payment_completed')->first()->id
            ]);
            $payment->appointment->update([
                'status_id' => Status::where('name', 'scheduled')->first()->id
            ]);
            
            
            // Enviar notificación al paciente
            try {
                $payment->appointment->patient->notify(new PaymentVerifiedNotification($payment->appointment->load('status')));
            } catch (\Exception $e) {
                \Log::warning('Error enviando notificación de pago: ' . $e->getMessage());
            }
        } else {
            $payment->update([
                'status_id' => Status::where('name', 'payment_failed')->first()->id,
                'failure_reason' => $validated['reason'] ?? 'Pago rechazado por el doctor'
            ]);
            $payment->appointment->update([
                'status_id' => Status::where('name', 'cancelled')->first()->id
            ]);
        }

        return response()->json([
            'message' => $validated['action'] === 'approve' ? 'Pago aprobado exitosamente' : 'Pago rechazado',
            'payment' => $payment->load('appointment')
        ]);
    }

    public function invoices(Request $request): JsonResponse
    {
        return $this->myPayments($request);
    }

    /**
     * Todos los pagos del paciente autenticado (sin filtros restrictivos)
     */
    public function myPayments(Request $request): JsonResponse
    {
        $user = $request->user();

        $payments = Payment::with(['appointment.doctor', 'status'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($payments);
    }

    private function getPaymentInstructions(string $method, $doctor): array
    {
        $data = [];
        
        // Cargar relaciones bancarias si existen los IDs
        if ($doctor->pago_movil_bank_id) {
            $doctor->load('pagoMovilBank');
        }
        if ($doctor->bank_id) {
            $doctor->load('bank');
        }
        
        switch ($method) {
            case 'pago_movil':
                $data = [
                    'phone' => $doctor->pago_movil_phone,
                    'document_id' => $doctor->pago_movil_document_id,
                    'bank' => $doctor->pago_movil_bank,
                    'bank_code' => $doctor->pagoMovilBank?->code,
                ];
                break;
            case 'bank_transfer':
                $data = [
                    'bank_name' => $doctor->bank_name,
                    'bank_code' => $doctor->bank?->code,
                    'account_number' => $doctor->bank_account_number,
                    'account_holder' => $doctor->bank_account_holder,
                    'document_id' => $doctor->bank_document_id,
                    'account_type' => $doctor->bank_account_type,
                ];
                break;
            case 'zelle':
                $data = [
                    'email' => $doctor->zelle_email,
                    'holder' => $doctor->zelle_holder,
                ];
                break;
        }

        return [
            'method' => $method,
            'details' => $data,
            'message' => 'Por favor, realice el pago y adjunte el comprobante.'
        ];
    }
}
