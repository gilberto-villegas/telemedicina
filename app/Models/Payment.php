<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'appointment_id',
        'user_id',
        'amount_usd',
        'amount_ves',
        'exchange_rate',
        'currency',
        'method',
        'provider',
        'reference_number',
        'transaction_id',
        'payment_phone',
        'payment_date',
        'status_id',
        'failure_reason',
        'proof_url',
        'invoice_number',
        'invoice_url',
        'invoice_generated_at',
    ];

    protected function casts(): array
    {
        return [
            'amount_usd' => 'decimal:2',
            'amount_ves' => 'decimal:2',
            'exchange_rate' => 'decimal:4',
            'invoice_generated_at' => 'datetime',
        ];
    }

    // Relaciones
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(Status::class, 'status_id');
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->whereHas('status', function($q) {
            $q->where('name', 'payment_completed');
        });
    }

    public function scopePending($query)
    {
        return $query->whereHas('status', function($q) {
            $q->where('name', 'payment_pending');
        });
    }

    // Helpers
    public function isCompleted(): bool
    {
        return $this->status && $this->status->name === 'payment_completed';
    }

    public function needsInvoice(): bool
    {
        return $this->isCompleted() && empty($this->invoice_number);
    }
}

