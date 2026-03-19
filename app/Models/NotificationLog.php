<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'notification_id',
        'channel',
        'status',
        'provider_response',
        'error_message',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'provider_response' => 'array',
            'sent_at' => 'datetime',
        ];
    }

    // Relaciones
    public function notification(): BelongsTo
    {
        return $this->belongsTo(Notification::class);
    }

    // Scopes
    public function scopeByChannel($query, string $channel)
    {
        return $query->where('channel', $channel);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    // Helpers
    public function markAsSent(array $response = []): bool
    {
        return $this->update([
            'status' => 'sent',
            'provider_response' => $response,
            'sent_at' => now(),
        ]);
    }

    public function markAsFailed(string $errorMessage, array $response = []): bool
    {
        return $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'provider_response' => $response,
        ]);
    }
}
