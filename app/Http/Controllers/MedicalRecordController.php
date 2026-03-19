<?php

namespace App\Http\Controllers;

use App\Models\MedicalRecord;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class MedicalRecordController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = MedicalRecord::query();

        if ($user->isPatient()) {
            $query->where('patient_id', $user->id);
        } elseif ($user->isDoctor()) {
            // Doctores pueden ver registros de sus pacientes
            $query->whereHas('appointment', function($q) use ($user) {
                $q->where('doctor_id', $user->id);
            });
        }

        $records = $query->with(['patient', 'appointment.doctor', 'attachments'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($records);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $record = MedicalRecord::with(['patient', 'appointment.doctor', 'attachments'])
            ->findOrFail($id);

        $user = $request->user();

        // Verificar permisos
        if ($user->isPatient() && $record->patient_id !== $user->id) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        if ($user->isDoctor()) {
            $appointment = $record->appointment;
            if (!$appointment || $appointment->doctor_id !== $user->id) {
                return response()->json(['message' => 'Acceso denegado'], 403);
            }
        }

        return response()->json($record);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isDoctor()) {
            return response()->json(['message' => 'Solo doctores pueden crear registros médicos'], 403);
        }

        $validated = $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'subjective' => 'sometimes|string',
            'objective' => 'sometimes|string',
            'assessment' => 'sometimes|string',
            'plan' => 'sometimes|string',
            'diagnosis_codes' => 'sometimes|array',
            'procedure_codes' => 'sometimes|array',
            'blood_pressure' => 'sometimes|string|max:10',
            'heart_rate' => 'sometimes|integer',
            'temperature' => 'sometimes|numeric',
            'weight' => 'sometimes|numeric',
            'height' => 'sometimes|numeric',
        ]);

        $appointment = Appointment::findOrFail($validated['appointment_id']);

        // Verificar que el doctor es el del appointment
        if ($appointment->doctor_id !== $user->id) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        $record = MedicalRecord::create([
            'id' => Str::uuid(),
            'patient_id' => $appointment->patient_id,
            'appointment_id' => $appointment->id,
            'subjective' => $validated['subjective'] ?? null,
            'objective' => $validated['objective'] ?? null,
            'assessment' => $validated['assessment'] ?? null,
            'plan' => $validated['plan'] ?? null,
            'diagnosis_codes' => $validated['diagnosis_codes'] ?? null,
            'procedure_codes' => $validated['procedure_codes'] ?? null,
            'blood_pressure' => $validated['blood_pressure'] ?? null,
            'heart_rate' => $validated['heart_rate'] ?? null,
            'temperature' => $validated['temperature'] ?? null,
            'weight' => $validated['weight'] ?? null,
            'height' => $validated['height'] ?? null,
        ]);

        // Actualizar appointment con medical_record_id
        $appointment->update(['medical_record_id' => $record->id]);

        return response()->json([
            'message' => 'Registro médico creado exitosamente',
            'record' => $record->load(['patient', 'appointment'])
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $record = MedicalRecord::findOrFail($id);
        $user = $request->user();

        if (!$user->isDoctor()) {
            return response()->json(['message' => 'Solo doctores pueden actualizar registros médicos'], 403);
        }

        $appointment = $record->appointment;
        if (!$appointment || $appointment->doctor_id !== $user->id) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        $validated = $request->validate([
            'subjective' => 'sometimes|string',
            'objective' => 'sometimes|string',
            'assessment' => 'sometimes|string',
            'plan' => 'sometimes|string',
            'diagnosis_codes' => 'sometimes|array',
            'procedure_codes' => 'sometimes|array',
            'blood_pressure' => 'sometimes|string|max:10',
            'heart_rate' => 'sometimes|integer',
            'temperature' => 'sometimes|numeric',
            'weight' => 'sometimes|numeric',
            'height' => 'sometimes|numeric',
        ]);

        $record->update($validated);

        return response()->json([
            'message' => 'Registro médico actualizado exitosamente',
            'record' => $record->fresh()
        ]);
    }
}

