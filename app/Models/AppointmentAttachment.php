<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppointmentAttachment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'appointment_id',
        'file_url',
        'file_name',
        'file_type',
        'file_size',
    ];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
}
