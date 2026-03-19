<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MedicalRecord extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'patient_id',
        'appointment_id',
        'subjective',
        'objective',
        'assessment',
        'plan',
        'diagnosis_codes',
        'procedure_codes',
        'blood_pressure',
        'heart_rate',
        'temperature',
        'weight',
        'height',
    ];

    protected function casts(): array
    {
        return [
            'diagnosis_codes' => 'array',
            'procedure_codes' => 'array',
            'heart_rate' => 'integer',
            'temperature' => 'decimal:2',
            'weight' => 'decimal:2',
            'height' => 'decimal:2',
        ];
    }

    // Relaciones
    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(MedicalAttachment::class, 'record_id');
    }
}

