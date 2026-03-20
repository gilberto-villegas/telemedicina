<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalQuestion extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'doctor_id',
        'question_text',
        'type',
        'options',
        'order',
        'is_required',
    ];

    protected $casts = [
        'options' => 'array',
        'is_required' => 'boolean',
    ];

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function responses()
    {
        return $this->hasMany(MedicalResponse::class, 'question_id');
    }
}
