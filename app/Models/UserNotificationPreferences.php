<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserNotificationPreferences extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'channels',
        'categories',
        'quiet_hours',
    ];

    protected function casts(): array
    {
        return [
            'channels' => 'array',
            'categories' => 'array',
            'quiet_hours' => 'array',
        ];
    }

    // Relaciones
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Helpers
    public function isChannelEnabled(string $channel): bool
    {
        return in_array($channel, $this->channels ?? []);
    }

    public function isCategoryEnabled(string $category): bool
    {
        if (empty($this->categories)) {
            return true; // Si no hay restricciones, todas están habilitadas
        }
        
        return in_array($category, $this->categories ?? []);
    }

    public function isQuietHours(): bool
    {
        if (empty($this->quiet_hours)) {
            return false;
        }

        $now = now();
        $currentTime = $now->format('H:i');
        $start = $this->quiet_hours['start'] ?? '22:00';
        $end = $this->quiet_hours['end'] ?? '08:00';

        // Si start > end, significa que cruza medianoche
        if ($start > $end) {
            return $currentTime >= $start || $currentTime < $end;
        }

        return $currentTime >= $start && $currentTime < $end;
    }

    public function getDefaultChannels(): array
    {
        return ['email', 'push'];
    }

    public static function getDefaultPreferences(): array
    {
        return [
            'channels' => ['email', 'push'],
            'categories' => null, // Todas habilitadas
            'quiet_hours' => [
                'start' => '22:00',
                'end' => '08:00',
            ],
        ];
    }
}
