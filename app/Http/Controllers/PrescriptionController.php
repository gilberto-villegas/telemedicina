<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class PrescriptionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Prescription::query();

        if ($user->isPatient()) {
            $query->where('patient_id', $user->id);
        } elseif ($user->isDoctor()) {
            $query->where('doctor_id', $user->id);
        } elseif ($user->isPharmacy()) {
            $query->where('pharmacy_id', $user->id);
        }

        $prescriptions = $query->with(['patient', 'doctor'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($prescriptions);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $prescription = Prescription::with(['patient', 'doctor', 'appointment'])
            ->findOrFail($id);

        $user = $request->user();

        // Verificar permisos
        if ($user->isPatient() && $prescription->patient_id !== $user->id) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        if ($user->isDoctor() && $prescription->doctor_id !== $user->id) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        return response()->json($prescription);
    }

    public function getQr(Request $request, string $id): JsonResponse
    {
        $prescription = Prescription::findOrFail($id);
        $user = $request->user();

        // Verificar permisos
        if ($prescription->patient_id !== $user->id && !$user->isPharmacy()) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        // Generar datos del QR (sin generar imagen por ahora)
        $qrData = [
            'prescription_id' => $prescription->id,
            'secret' => $prescription->qr_secret,
            'patient_id' => $prescription->patient_id,
        ];

        // Retornar los datos del QR (el frontend puede generar el código QR)
        return response()->json([
            'qr_data' => $qrData,
            'qr_url' => config('app.url') . '/api/prescriptions/' . $prescription->id . '/qr',
            'prescription' => $prescription
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isDoctor()) {
            return response()->json(['message' => 'Solo doctores pueden emitir recetas'], 403);
        }

        $validated = $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'medications' => 'required|array|min:1',
            'medications.*.name' => 'required|string|max:255',
            'medications.*.dosage' => 'required|string|max:100',
            'medications.*.frequency' => 'required|string|max:100',
            'medications.*.duration' => 'required|string|max:100',
            'medications.*.instructions' => 'sometimes|string|max:500',
            'instructions' => 'sometimes|string|max:1000',
            'valid_until' => 'required|date|after:today',
        ]);

        $appointment = Appointment::findOrFail($validated['appointment_id']);

        // Verificar que el doctor es el del appointment
        if ($appointment->doctor_id !== $user->id) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        // Verificar que la cita esté completada
        $appointment->load('status');
        if (!$appointment->status || $appointment->status->name !== 'completed') {
            return response()->json([
                'message' => 'Solo se pueden emitir recetas para citas completadas'
            ], 400);
        }

        // Generar QR secret y código
        $qrSecret = Str::random(32);

        // Buscar status_id para 'prescription_issued'
        $statusId = \App\Models\Status::where('name', 'prescription_issued')->value('id');

        $prescription = Prescription::create([
            'patient_id' => $appointment->patient_id,
            'doctor_id' => $user->id,
            'appointment_id' => $appointment->id,
            'medical_record_id' => $appointment->medical_record_id,
            'medications' => $validated['medications'],
            'instructions' => $validated['instructions'] ?? null,
            'valid_until' => $validated['valid_until'],
            'status_id' => $statusId,
            'qr_secret' => $qrSecret,
            'qr_code' => null,
        ]);

        // Generar QR code URL ahora que tenemos el ID
        $prescription->update([
            'qr_code' => config('app.url') . '/api/prescriptions/' . $prescription->id . '/verify?secret=' . $qrSecret,
        ]);

        // Actualizar appointment con prescription_id
        $appointment->update(['prescription_id' => $prescription->id]);

        return response()->json([
            'message' => 'Receta emitida exitosamente',
            'prescription' => $prescription->load(['patient', 'doctor', 'appointment'])
        ], 201);
    }

    public function fill(Request $request, string $id): JsonResponse
    {
        $prescription = Prescription::findOrFail($id);
        $user = $request->user();

        if (!$user->isPharmacy()) {
            return response()->json(['message' => 'Solo farmacias pueden marcar recetas como despachadas'], 403);
        }

        if (!$prescription->canBeFilled()) {
            return response()->json([
                'message' => 'Esta receta no puede ser despachada'
            ], 400);
        }

        $prescription->update([
            'status' => 'filled',
            'pharmacy_id' => $user->id,
            'filled_at' => now(),
        ]);

        return response()->json([
            'message' => 'Receta marcada como despachada',
            'prescription' => $prescription
        ]);
    }
}

