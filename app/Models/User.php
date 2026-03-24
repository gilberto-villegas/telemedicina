<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'uuid',
        'type',
        'email',
        'phone',
        'document_id',
        'document_verified',
        'password',
        'birth_date',
        'blood_type',
        'allergies',
        'mpps_number',
        'specialty',
        'specialty_id',
        'consultation_price_usd',
        'rating',
        'is_verified',
        'first_name',
        'last_name',
        'avatar_url',
        'fcm_token',
        'phone_verified_at',
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        'bank_document_id',
        'bank_account_type',
        'pago_movil_phone',
        'pago_movil_document_id',
        'pago_movil_bank',
        'zelle_email',
        'zelle_holder',
        'digital_signature',
        'is_blocked',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['full_name', 'specialty_name'];

    public function getSpecialtyNameAttribute(): string
    {
        // Si tenemos ID y la relación está cargada o podemos acceder a ella
        if ($this->specialty_id) {
            return $this->specialty_ref?->name ?? ($this->attributes['specialty'] ?? '');
        }
        return $this->attributes['specialty'] ?? '';
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'document_verified' => 'boolean',
            'is_verified' => 'boolean',
            'birth_date' => 'date',
            'consultation_price_usd' => 'decimal:2',
            'rating' => 'decimal:2',
            'is_blocked' => 'boolean',
        ];
    }

    // Relaciones
    public function appointmentsAsPatient()
    {
        return $this->hasMany(Appointment::class, 'patient_id');
    }

    public function appointmentsAsDoctor()
    {
        return $this->hasMany(Appointment::class, 'doctor_id');
    }

    public function medicalRecords()
    {
        return $this->hasMany(MedicalRecord::class, 'patient_id');
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class, 'patient_id');
    }

    public function availability()
    {
        return $this->hasMany(DoctorAvailability::class, 'doctor_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function unreadNotifications()
    {
        return $this->hasMany(Notification::class)->whereNull('read_at');
    }

    public function specialty_ref()
    {
        return $this->belongsTo(Specialty::class, 'specialty_id');
    }

    public function notificationPreferences()
    {
        return $this->hasOne(UserNotificationPreferences::class);
    }

    public function medicalQuestions()
    {
        return $this->hasMany(MedicalQuestion::class, 'doctor_id');
    }

    // Scopes
    public function scopeDoctors($query)
    {
        return $query->where('type', 'doctor');
    }

    public function scopePatients($query)
    {
        return $query->where('type', 'patient');
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    // Helpers
    public function isDoctor(): bool
    {
        return $this->type === 'doctor';
    }

    public function isPatient(): bool
    {
        return $this->type === 'patient';
    }

    public function isClinicAdmin(): bool
    {
        return $this->type === 'clinic_admin';
    }

    public function isAdmin(): bool
    {
        return $this->type === 'admin';
    }

    public function isPharmacy(): bool
    {
        return $this->type === 'pharmacy';
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    // Notification helpers
    public function sendCustomNotification(string $type, array $data = [], array $channels = []): ?Notification
    {
        return app(\App\Services\Notifications\NotificationService::class)
            ->send($this, $type, $data, $channels);
    }

    public function hasUnreadNotifications(): bool
    {
        return $this->unreadNotifications()->exists();
    }

    public function unreadNotificationsCount(): int
    {
        return $this->unreadNotifications()->count();
    }

    public function unreadMessagesCount(): int
    {
        return \App\Models\Message::where('receiver_id', $this->id)
            ->whereNull('read_at')
            ->count();
    }

    public function canReceiveWhatsApp(): bool
    {
        return $this->phone_verified_at !== null && !empty($this->phone);
    }

    public function canReceivePush(): bool
    {
        return !empty($this->fcm_token);
    }
}

