<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Specialty extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
    ];

    public function doctors()
    {
        return $this->hasMany(User::class, 'specialty_id');
    }
}
