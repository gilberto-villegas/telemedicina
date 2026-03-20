<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Appointment;
use App\Models\Status;
use App\Notifications\PaymentVerifiedNotification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
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

        // Obtener tasa de cambio (TODO: Integrar API)
        $exchangeRate = 40.5; // Ajustado a valor más reciente aproximado

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
        $payment = Payment::with('appointment.doctor')->findOrFail($id);
        
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

        return response()->json([
            'message' => 'Pago confirmado, en proceso de verificación por el doctor',
            'payment' => $payment
        ]);
    }

    /**
     * Listar pagos para el doctor autenticado
     */
    public function doctorPayments(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isDoctor()) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        $payments = Payment::whereHas('appointment', function($q) use ($user) {
            $q->where('doctor_id', $user->id);
        })
        ->with(['user', 'appointment', 'status'])
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($payments);
    }

    /**
     * Verificar un pago (Aprobar o Rechazar)
     */
    public function verify(Request $request, string $id): JsonResponse
    {
        $doctor = $request->user();
        if (!$doctor->isDoctor()) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        $payment = Payment::with('appointment.patient')->findOrFail($id);

        if ($payment->appointment->doctor_id !== $doctor->id) {
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
        $user = $request->user();

        $payments = Payment::where('user_id', $user->id)
            ->completed()
            ->whereNotNull('invoice_number')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($payments);
    }

    private function getPaymentInstructions(string $method, $doctor): array
    {
        $data = [];
        
        switch ($method) {
            case 'pago_movil':
                $data = [
                    'phone' => $doctor->pago_movil_phone,
                    'document_id' => $doctor->pago_movil_document_id,
                    'bank' => $doctor->pago_movil_bank,
                ];
                break;
            case 'bank_transfer':
                $data = [
                    'bank_name' => $doctor->bank_name,
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
