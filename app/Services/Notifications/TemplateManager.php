<?php

namespace App\Services\Notifications;

use App\Models\NotificationTemplate;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class TemplateManager
{
    private const CACHE_TTL = 3600; // 1 hora

    public function getTemplate(string $type): ?NotificationTemplate
    {
        return Cache::remember(
            "notification_template_{$type}",
            self::CACHE_TTL,
            function () use ($type) {
                return NotificationTemplate::active()
                    ->byType($type)
                    ->first();
            }
        );
    }

    public function renderTemplate(string $type, array $variables): ?array
    {
        $template = $this->getTemplate($type);

        if (!$template) {
            Log::warning('TemplateManager: Template no encontrado', ['type' => $type]);
            return null;
        }

        return [
            'email' => $template->renderEmail($variables),
            'whatsapp' => $template->renderWhatsApp($variables),
            'push' => $template->renderPush($variables),
        ];
    }

    public function clearCache(string $type = null): void
    {
        if ($type) {
            Cache::forget("notification_template_{$type}");
        } else {
            // Limpiar todos los templates del cache
            $templates = NotificationTemplate::pluck('type');
            foreach ($templates as $templateType) {
                Cache::forget("notification_template_{$templateType}");
            }
        }
    }
}
