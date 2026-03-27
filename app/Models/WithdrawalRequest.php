<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class WithdrawalRequest extends Model
{
    use HasUuids;

    protected $fillable = [
        'id', 'doctor_id', 'total_amount_usd', 'total_fee_usd', 
        'net_amount_usd', 'net_amount_ves', 'exchange_rate', 
        'status', 'receipt_image_url', 'admin_notes', 'paid_at'
    ];

    protected function casts(): array
    {
        return [
            'total_amount_usd' => 'decimal:2',
            'total_fee_usd'    => 'decimal:2',
            'net_amount_usd'   => 'decimal:2',
            'net_amount_ves'   => 'decimal:2',
            'exchange_rate'    => 'decimal:4',
            'paid_at'          => 'datetime',
        ];
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'withdrawal_request_id');
    }
}
