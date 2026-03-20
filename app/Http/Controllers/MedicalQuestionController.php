<?php

namespace App\Http\Controllers;

use App\Models\MedicalQuestion;
use App\Models\MedicalResponse;
use App\Models\Appointment;
use App\Models\AppointmentAttachment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class MedicalQuestionController extends Controller
{
    /**
     * Get questions for a specific doctor or global questions
     */
    public function index(Request $request): JsonResponse
    {
        $doctorId = $request->query('doctor_id');

        $query = MedicalQuestion::query();
        
        if ($doctorId) {
            $query->where(function ($q) use ($doctorId) {
                $q->where('doctor_id', $doctorId)
                  ->orWhereNull('doctor_id');
            });
        } else {
            $query->whereNull('doctor_id');
        }

        $questions = $query->orderBy('order')->get();

        return response()->json($questions);
    }

    /**
     * Save questionnaire responses
     */
    public function storeResponses(Request $request, string $appointmentId): JsonResponse
    {
        $appointment = Appointment::findOrFail($appointmentId);
        $user = $request->user();

        if ($appointment->patient_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $responsesRaw = $request->input('responses');
        $responses = is_string($responsesRaw) ? json_decode($responsesRaw, true) : ($responsesRaw ?? []);
        
        if (!is_array($responses)) {
            $responses = [];
        }

        foreach ($responses as $resp) {
            MedicalResponse::updateOrCreate(
                [
                    'appointment_id' => $appointment->id,
                    'question_id' => $resp['question_id'],
                ],
                [
                    'response_text' => $resp['response_text'] ?? null,
                    'body_parts' => $resp['body_parts'] ?? null,
                ]
            );
        }

        // Handle file uploads if any
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('public/appointments/' . $appointment->id, $filename);
                $url = asset('storage/appointments/' . $appointment->id . '/' . $filename);

                AppointmentAttachment::create([
                    'id' => Str::uuid(),
                    'appointment_id' => $appointment->id,
                    'file_url' => $url,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        return response()->json(['message' => 'Cuestionario guardado exitosamente']);
    }

    /**
     * Get responses for an appointment (for doctor view)
     */
    public function getResponses(string $appointmentId): JsonResponse
    {
        $appointment = Appointment::with(['medicalResponses.question', 'attachments'])->findOrFail($appointmentId);
        
        return response()->json([
            'responses' => $appointment->medicalResponses,
            'attachments' => $appointment->attachments
        ]);
    }

    /**
     * Doctor management: Update their questions
     */
    public function updateQuestions(Request $request): JsonResponse
    {
        $doctor = $request->user();
        if (!$doctor->isDoctor()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $questions = $request->input('questions', []);

        // Optional: Remove old questions if needed, or just sync
        // For simplicity, we'll just updateOrCreate
        foreach ($questions as $q) {
            MedicalQuestion::updateOrCreate(
                ['id' => $q['id'] ?? Str::uuid()],
                [
                    'doctor_id' => $doctor->id,
                    'question_text' => $q['question_text'],
                    'type' => $q['type'] ?? 'text',
                    'options' => $q['options'] ?? null,
                    'order' => $q['order'] ?? 0,
                    'is_required' => $q['is_required'] ?? true,
                ]
            );
        }

        return response()->json(['message' => 'Preguntas actualizadas']);
    }
}
