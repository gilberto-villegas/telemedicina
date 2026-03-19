<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SpecialtySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $specialties = [
            ['name' => 'Pediatría', 'slug' => 'pediatria'],
            ['name' => 'Cardiología', 'slug' => 'cardiologia'],
            ['name' => 'Ginecología y Obstetricia', 'slug' => 'ginecologia-y-obstetricia'],
            ['name' => 'Dermatología', 'slug' => 'dermatologia'],
            ['name' => 'Psiquiatría', 'slug' => 'psiquiatria'],
            ['name' => 'Oftalmología', 'slug' => 'oftalmologia'],
            ['name' => 'Otorrinolaringología', 'slug' => 'otorrinolaringologia'],
            ['name' => 'Traumatología', 'slug' => 'traumatologia'],
            ['name' => 'Medicina Interna', 'slug' => 'medicina-interna'],
            ['name' => 'Urología', 'slug' => 'urologia'],
            ['name' => 'Neurología', 'slug' => 'neurologia'],
            ['name' => 'Endocrinología', 'slug' => 'endocrinologia'],
            ['name' => 'Gastroenterología', 'slug' => 'gastroenterologia'],
            ['name' => 'Neumonología', 'slug' => 'neumonologia'],
            ['name' => 'Nefrología', 'slug' => 'nefrologia'],
            ['name' => 'Oncología', 'slug' => 'oncologia'],
            ['name' => 'Hematología', 'slug' => 'hematologia'],
            ['name' => 'Reumatología', 'slug' => 'reumatologia'],
            ['name' => 'Infectología', 'slug' => 'infectologia'],
            ['name' => 'Psicología', 'slug' => 'psicologia'],
            ['name' => 'Nutrición', 'slug' => 'nutricion'],
            ['name' => 'Cirugía General', 'slug' => 'cirugia-general'],
        ];

        foreach ($specialties as $specialty) {
            \App\Models\Specialty::updateOrCreate(
                ['slug' => $specialty['slug']],
                $specialty
            );
        }
    }
}
