<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalResponse extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'appointment_id',
        'question_id',
        'response_text',
        'body_parts',
    ];

    protected $casts = [
        'body_parts' => 'array',
    ];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function question()
    {
        return $this->belongsTo(MedicalQuestion::class, 'question_id');
    }
}
