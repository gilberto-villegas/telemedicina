<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class VideoCallController extends Controller
{
    public function createSession(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
        ]);

        $appointment = Appointment::findOrFail($validated['appointment_id']);
        $user = $request->user();

        // Verificar permisos
        if ($appointment->patient_id !== $user->id && $appointment->doctor_id !== $user->id) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        // Generar room ID si no existe
        if (!$appointment->video_room_id) {
            $appointment->update([
                'video_room_id' => Str::random(32),
                'status' => 'in_progress'
            ]);
        }

        return response()->json([
            'session_id' => $appointment->video_room_id,
            'appointment_id' => $appointment->id,
            'room_id' => $appointment->video_room_id,
        ]);
    }

    public function getTurnToken(Request $request, string $id): JsonResponse
    {
        // TODO: Implementar generación de TURN credentials
        // Usar coturn o servicio TURN externo
        return response()->json([
            'message' => 'Funcionalidad en desarrollo',
            'turn_server' => env('TURN_SERVER'),
            'username' => 'temp_user',
            'credential' => 'temp_credential',
        ], 501);
    }

    public function startRecording(Request $request, string $id): JsonResponse
    {
        $appointment = Appointment::findOrFail($id);
        $user = $request->user();

        // Verificar permisos (solo doctor puede iniciar grabación)
        if (!$user->isDoctor() || $appointment->doctor_id !== $user->id) {
            return response()->json(['message' => 'Solo el doctor puede iniciar la grabación'], 403);
        }

        // TODO: Implementar inicio de grabación WebRTC
        return response()->json([
            'message' => 'Grabación iniciada',
            'recording_id' => Str::uuid(),
        ]);
    }

    public function stopRecording(Request $request, string $id): JsonResponse
    {
        $appointment = Appointment::findOrFail($id);
        $user = $request->user();

        // Verificar permisos
        if (!$user->isDoctor() || $appointment->doctor_id !== $user->id) {
            return response()->json(['message' => 'Solo el doctor puede detener la grabación'], 403);
        }

        // TODO: Implementar detención de grabación y guardar URL
        return response()->json([
            'message' => 'Grabación detenida',
        ]);
    }
}

