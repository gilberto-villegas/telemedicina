<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'id' => \Illuminate\Support\Str::uuid(),
                'uuid' => \Illuminate\Support\Str::uuid(),
                'type' => 'admin',
                'first_name' => 'Soporte',
                'last_name' => 'Administrador',
                'phone' => '0000000000',
                'document_id' => 'V00000000',
                'password' => \Illuminate\Support\Facades\Hash::make('123456789'),
                'is_verified' => true,
                'document_verified' => true,
            ]
        );
    }
}
