<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\MedicalRecord;
use App\Models\MedicalAttachment;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class PatientController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isPatient()) {
            return response()->json([
                'message' => 'Acceso denegado'
            ], 403);
        }

        return response()->json([
            'user' => $user->load(['appointmentsAsPatient', 'medicalRecords'])
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isPatient()) {
            return response()->json([
                'message' => 'Acceso denegado'
            ], 403);
        }

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'birth_date' => 'sometimes|date',
            'blood_type' => 'sometimes|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'allergies' => 'sometimes|string',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Perfil actualizado exitosamente',
            'user' => $user->fresh()
        ]);
    }

    public function medicalRecords(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isPatient()) {
            return response()->json([
                'message' => 'Acceso denegado'
            ], 403);
        }

        $records = MedicalRecord::where('patient_id', $user->id)
            ->with(['appointment.doctor', 'attachments'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($records);
    }

    public function uploadAttachment(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isPatient()) {
            return response()->json([
                'message' => 'Acceso denegado'
            ], 403);
        }

        $validated = $request->validate([
            'appointment_id' => 'required|uuid|exists:appointments,id',
            'file' => 'required|file|max:10240', // 10MB máximo
            'category' => 'required|in:lab_result,prescription,image,other',
            'description' => 'sometimes|string|max:500',
        ]);

        // Verificar que el paciente sea el dueño de la cita
        $appointment = Appointment::findOrFail($validated['appointment_id']);
        if ($appointment->patient_id !== $user->id) {
            return response()->json([
                'message' => 'No tienes permiso para subir archivos a esta cita'
            ], 403);
        }

        try {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('medical_attachments', $fileName, 'public');

            // Obtener o crear el registro médico para esta cita
            $medicalRecord = MedicalRecord::firstOrCreate(
                [
                    'appointment_id' => $appointment->id,
                    'patient_id' => $user->id,
                ],
                [
                    'subjective' => '',
                    'objective' => '',
                    'assessment' => '',
                    'plan' => '',
                ]
            );

            // Actualizar el medical_record_id en la cita si no está establecido
            if (!$appointment->medical_record_id) {
                $appointment->update(['medical_record_id' => $medicalRecord->id]);
            }

            // Crear el attachment
            $attachment = MedicalAttachment::create([
                'record_id' => $medicalRecord->id,
                'user_id' => $user->id,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'storage_path' => $filePath,
                'category' => $validated['category'],
                'metadata' => [
                    'description' => $validated['description'] ?? null,
                    'uploaded_at' => now()->toIso8601String(),
                ],
            ]);

            return response()->json([
                'message' => 'Archivo subido exitosamente',
                'attachment' => $attachment->load('record'),
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error subiendo archivo médico: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al subir el archivo: ' . $e->getMessage()
            ], 500);
        }
    }
}

