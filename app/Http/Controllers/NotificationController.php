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

        $count = $user->unreadNotificationsCount();

        return response()->json([
            'count' => $count
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
