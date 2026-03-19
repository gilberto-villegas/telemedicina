<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Prescription extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'appointment_id',
        'medical_record_id',
        'qr_code',
        'qr_secret',
        'medications',
        'available_pharmacies',
        'reserved_pharmacy_id',
        'reservation_expires_at',
        'status_id',
        'filled_at',
        'pharmacy_id',
        'instructions',
        'valid_until',
    ];

    protected function casts(): array
    {
        return [
            'medications' => 'array',
            'available_pharmacies' => 'array',
            'reservation_expires_at' => 'datetime',
            'filled_at' => 'datetime',
            'valid_until' => 'date',
        ];
    }

    // Relaciones
    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class, 'medical_record_id');
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(Status::class, 'status_id');
    }

    // Helpers
    public function isExpired(): bool
    {
        return $this->valid_until->isPast();
    }

    public function canBeFilled(): bool
    {
        return $this->status?->name === 'prescription_issued' && !$this->isExpired();
    }
}

