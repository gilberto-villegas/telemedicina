<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Appointment extends Model
{
    use HasFactory, HasUuids;

    const TYPE_VIDEO = 'videoconsulta';
    const TYPE_TELE = 'teleconsulta';

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'start_time',
        'end_time',
        'reason',
        'status_id',
        'type',
        'price_usd',
        'price_ves',
        'exchange_rate',
        'video_room_id',
        'video_duration',
        'recording_url',
        'medical_record_id',
        'prescription_id',
        'payment_id',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time' => 'datetime',
            'price_usd' => 'decimal:2',
            'price_ves' => 'decimal:2',
            'exchange_rate' => 'decimal:4',
            'video_duration' => 'integer',
        ];
    }

    // Relaciones
    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(Status::class, 'status_id');
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function medicalRecord(): HasOne
    {
        return $this->hasOne(MedicalRecord::class, 'appointment_id');
    }

    public function prescription(): HasOne
    {
        return $this->hasOne(Prescription::class, 'appointment_id');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class, 'appointment_id');
    }

    // Scopes
    public function scopeUpcoming($query)
    {
        return $query->where('start_time', '>', now())
            ->whereHas('status', function($q) {
                $q->where('name', 'scheduled');
            });
    }

    public function scopeForDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    public function scopeForPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    // Helpers
    public function isVirtual(): bool
    {
        return in_array($this->type, [self::TYPE_VIDEO, self::TYPE_TELE]);
    }

    public function isVideo(): bool
    {
        return $this->type === self::TYPE_VIDEO;
    }

    public function isTeleconsulta(): bool
    {
        return $this->type === self::TYPE_TELE;
    }


    public function isCompleted(): bool
    {
        return $this->status && $this->status->name === 'completed';
    }

    public function canBeCancelled(): bool
    {
        return $this->status && in_array($this->status->name, ['scheduled']) 
            && $this->start_time->isFuture()
            && $this->start_time->diffInHours(now()) >= 24;
    }
}

