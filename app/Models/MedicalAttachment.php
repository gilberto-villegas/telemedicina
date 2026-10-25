<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicalAttachment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'record_id',
        'user_id',
        'file_name',
        'file_type',
        'file_size',
        'storage_path',
        'thumbnail_path',
        'category',
        'metadata',
    ];

    protected $appends = ['file_url'];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'file_size' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    // Relaciones
    public function record(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class, 'record_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Accessor para obtener la URL del endpoint seguro de descarga
    public function getFileUrlAttribute(): ?string
    {
        if (!$this->id) {
            return null;
        }

        return url('/api/medical-attachments/' . $this->id . '/download');
    }
}
