<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Obtener appointments del usuario
        $appointments = \App\Models\Appointment::where(function($query) use ($user) {
                if ($user->isPatient()) {
                    $query->where('patient_id', $user->id);
                } else {
                    $query->where('doctor_id', $user->id);
                }
            })
            ->with(['doctor', 'patient', 'status'])
            ->orderBy('created_at', 'desc')
            ->get();

        $chats = $appointments->map(function($appointment) use ($user) {
            // Obtener último mensaje
            $lastMessage = \App\Models\Message::where('appointment_id', $appointment->id)
                ->orderBy('created_at', 'desc')
                ->first();

            // Solo mostrar si tiene mensajes O si está activo (programado o en curso)
            $isVisible = $lastMessage !== null || 
                        ($appointment->status && in_array($appointment->status->name, ['scheduled', 'in_progress']));

            if (!$isVisible) {
                return null;
            }

            // Contar no leídos
            $unreadCount = \App\Models\Message::where('appointment_id', $appointment->id)
                ->where('receiver_id', $user->id)
                ->whereNull('read_at')
                ->count();

            return [
                'id' => $appointment->id,
                'doctor' => $appointment->doctor ? [
                    'id' => $appointment->doctor->id,
                    'first_name' => $appointment->doctor->first_name,
                    'last_name' => $appointment->doctor->last_name,
                    'specialty' => $appointment->doctor->specialty_name,
                ] : null,
                'patient' => $appointment->patient ? [
                    'id' => $appointment->patient->id,
                    'first_name' => $appointment->patient->first_name,
                    'last_name' => $appointment->patient->last_name,
                ] : null,
                'last_message' => $lastMessage ? [
                    'message' => $lastMessage->message,
                    'created_at' => $lastMessage->created_at->toISOString(),
                ] : null,
                'unread_count' => $unreadCount,
                'status' => $appointment->status?->name,
                'start_time' => $appointment->start_time->toISOString(),
            ];
        })->filter()->values();

        return response()->json($chats);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $doctorId = $request->input('doctor_id');
        $patientId = $request->input('patient_id');

        // Crear o encontrar chat basado en appointment
        $appointment = null;
        if ($request->has('appointment_id')) {
            $appointment = \App\Models\Appointment::find($request->appointment_id);
        }

        if (!$appointment) {
            if ($user->isPatient() && $doctorId) {
                $appointment = \App\Models\Appointment::where('patient_id', $user->id)
                    ->where('doctor_id', $doctorId)
                    ->orderBy('created_at', 'desc')
                    ->first();
            } elseif ($user->isDoctor() && $patientId) {
                $appointment = \App\Models\Appointment::where('doctor_id', $user->id)
                    ->where('patient_id', $patientId)
                    ->orderBy('created_at', 'desc')
                    ->first();
            }
        }

        if (!$appointment) {
            return response()->json(['message' => 'No se encontró cita relacionada'], 404);
        }

        $otherUserId = $user->isPatient() 
            ? ($doctorId ?: $appointment->doctor_id)
            : ($patientId ?: $appointment->patient_id);

        $otherUser = User::find($otherUserId);

        return response()->json([
            'id' => $appointment->id,
            'doctor' => $user->isPatient() ? [
                'id' => $otherUser->id ?? null,
                'first_name' => $otherUser->first_name ?? null,
                'last_name' => $otherUser->last_name ?? null,
                'specialty' => $otherUser->specialty ?? null,
            ] : null,
            'patient' => $user->isDoctor() ? [
                'id' => $otherUser->id ?? null,
                'first_name' => $otherUser->first_name ?? null,
                'last_name' => $otherUser->last_name ?? null,
            ] : null,
        ]);
    }

    public function messages(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        
        $messages = \App\Models\Message::where('appointment_id', $id)
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get();

        // Marcar como leídos los mensajes para este usuario en este chat
        \App\Models\Message::where('appointment_id', $id)
            ->where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json($messages);
    }

    public function sendMessage(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $text = $request->input('message');

        $appointment = \App\Models\Appointment::findOrFail($id);
        
        // El receptor es el otro participante de la cita
        $receiverId = ($user->id === $appointment->patient_id) 
            ? $appointment->doctor_id 
            : $appointment->patient_id;

        $message = \App\Models\Message::create([
            'appointment_id' => $id,
            'sender_id' => $user->id,
            'receiver_id' => $receiverId,
            'message' => $text,
        ]);

        return response()->json($message->load('sender'));
    }
}

