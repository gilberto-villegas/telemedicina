<?php

namespace App\Http\Controllers;

use App\Models\UserNotificationPreferences;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationPreferencesController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        $preferences = $user->notificationPreferences;

        if (!$preferences) {
            // Crear preferencias por defecto
            $preferences = UserNotificationPreferences::create([
                'user_id' => $user->id,
                'channels' => UserNotificationPreferences::getDefaultPreferences()['channels'],
                'categories' => null,
                'quiet_hours' => UserNotificationPreferences::getDefaultPreferences()['quiet_hours'],
            ]);
        }

        return response()->json($preferences);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'channels' => 'sometimes|array',
            'channels.*' => 'in:email,push,whatsapp',
            'categories' => 'sometimes|nullable|array',
            'quiet_hours' => 'sometimes|nullable|array',
            'quiet_hours.start' => 'required_with:quiet_hours|string|regex:/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/',
            'quiet_hours.end' => 'required_with:quiet_hours|string|regex:/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/',
        ]);

        $preferences = $user->notificationPreferences;

        if (!$preferences) {
            $preferences = UserNotificationPreferences::create([
                'user_id' => $user->id,
                ...$validated,
            ]);
        } else {
            $preferences->update($validated);
        }

        return response()->json([
            'message' => 'Preferencias actualizadas',
            'preferences' => $preferences->fresh()
        ]);
    }
}
