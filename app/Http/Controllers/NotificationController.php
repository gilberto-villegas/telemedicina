<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use App\Services\Notifications\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Notification::forUser($user->id);

        // Filtros
        if ($request->has('unread')) {
            $query->unread();
        }

        if ($request->has('type')) {
            $query->byType($request->type);
        }

        $notifications = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        // Inyectar notificaciones de chat si estamos en la primera página
        if ($notifications->currentPage() === 1) {
            $unreadChats = \App\Models\Appointment::where(function($q) use ($user) {
                    if ($user->isPatient()) $q->where('patient_id', $user->id);
                    else $q->where('doctor_id', $user->id);
                })
                ->whereHas('messages', function($q) use ($user) {
                    $q->where('receiver_id', $user->id)->whereNull('read_at');
                })
                ->with(['doctor', 'patient'])
                ->get();

            $chatNotifications = $unreadChats->map(function($apt) use ($user) {
                $otherUser = $user->isPatient() ? $apt->doctor : $apt->patient;
                $unreadCount = \App\Models\Message::where('appointment_id', $apt->id)
                    ->where('receiver_id', $user->id)
                    ->whereNull('read_at')
                    ->count();

                return [
                    'id' => "chat-{$apt->id}",
                    'type' => 'chat_message',
                    'title' => "Mensajes de " . ($otherUser ? $otherUser->full_name : 'Médico'),
                    'message' => "Tienes {$unreadCount} mensaje(s) nuevo(s). Haz clic para ver el chat.",
                    'data' => [
                        'appointment_id' => $apt->id,
                        'is_chat' => true,
                        'url' => $user->isPatient() 
                            ? "/dashboard/patient/chat?doctor={$apt->doctor_id}&appointment={$apt->id}"
                            : "/dashboard/doctor/chat?patient={$apt->patient_id}&appointment={$apt->id}"
                    ],
                    'created_at' => now()->toIso8601String(),
                    'read_at' => null,
                ];
            });

            // Combinar (las de chat primero por ser "nuevas")
            $items = $notifications->getCollection();
            foreach ($chatNotifications as $cn) {
                $items->prepend($cn);
            }
        }

        return response()->json($notifications);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $notification = Notification::findOrFail($id);

        // Verificar ownership
        if ($notification->user_id !== $user->id) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        return response()->json($notification->load('logs'));
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        // Manejar notificación virtual de chat
        if (str_starts_with($id, 'chat-')) {
            $appointmentId = str_replace('chat-', '', $id);
            \App\Models\Message::where('appointment_id', $appointmentId)
                ->where('receiver_id', $user->id)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);
            
            return response()->json(['message' => 'Chat marcado como leído']);
        }

        $notification = Notification::findOrFail($id);

        // Verificar ownership
        if ($notification->user_id !== $user->id) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        $notification->markAsRead();

        return response()->json([
            'message' => 'Notificación marcada como leída',
            'notification' => $notification
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();

        $count = Notification::forUser($user->id)
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json([
            'message' => "{$count} notificaciones marcadas como leídas",
            'count' => $count
        ]);
    }

    public function getUnreadCount(Request $request): JsonResponse
    {
        $user = $request->user();

        $notificationsCount = $user->unreadNotificationsCount();
        $messagesCount = $user->unreadMessagesCount();

        return response()->json([
            'count' => $notificationsCount + $messagesCount,
            'notifications_count' => $notificationsCount,
            'messages_count' => $messagesCount
        ]);
    }

    public function test(Request $request): JsonResponse
    {
        $user = $request->user();

        // Solo admins pueden enviar notificaciones de prueba
        if (!$user->isClinicAdmin()) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        $validated = $request->validate([
            'type' => 'required|string',
            'channels' => 'sometimes|array',
            'channels.*' => 'in:email,push,whatsapp',
        ]);

        $notification = $this->notificationService->send(
            $user,
            $validated['type'],
            [
                'title' => 'Notificación de Prueba',
                'message' => 'Esta es una notificación de prueba del sistema',
            ],
            $validated['channels'] ?? []
        );

        if ($notification) {
            return response()->json([
                'message' => 'Notificación de prueba enviada',
                'notification' => $notification
            ], 201);
        }

        return response()->json([
            'message' => 'Error al enviar notificación de prueba'
        ], 500);
    }
}
