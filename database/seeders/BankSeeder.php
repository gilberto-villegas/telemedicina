<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Bank;

class BankSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $banks = [
            ['name' => 'Banco de Venezuela', 'code' => '0102'],
            ['name' => 'Banesco', 'code' => '0134'],
            ['name' => 'Mercantil', 'code' => '0105'],
            ['name' => 'Provincial', 'code' => '0108'],
            ['name' => 'BNC National Cooperative Bank', 'code' => '0191'],
            ['name' => 'Bancaribe', 'code' => '0114'],
            ['name' => 'Banco Exterior', 'code' => '0115'],
            ['name' => 'Banco del Tesoro', 'code' => '0163'],
            ['name' => 'Banco Agrícola de Venezuela', 'code' => '0166'],
            ['name' => 'Banco Bicentenario', 'code' => '0175'],
            ['name' => 'Banplus', 'code' => '0174'],
            ['name' => 'Banco Activo', 'code' => '0171'],
            ['name' => 'Banco Plaza', 'code' => '0138'],
            ['name' => 'Sofitasa', 'code' => '0137'],
            ['name' => 'Banfanb', 'code' => '0177'],
            ['name' => 'Banco del Sur', 'code' => '0157'],
            ['name' => 'Mi Banco', 'code' => '0169'],
            ['name' => 'Bangente', 'code' => '0146'],
            ['name' => '100% Banco', 'code' => '0156'],
            ['name' => 'Bancamiga', 'code' => '0172'],
        ];

        foreach ($banks as $bank) {
            Bank::firstOrCreate(['code' => $bank['code']], $bank);
        }
    }
}
