<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MedicalQuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $questions = [
            [
                'question_text' => '1. ¿Qué problema de salud está motivando esta Videoconsulta?',
                'type' => 'text',
                'order' => 1,
                'is_required' => true,
            ],
            [
                'question_text' => '2. Describa cómo comenzó el problema, desde cuándo, sus características y su evolución.',
                'type' => 'text',
                'order' => 2,
                'is_required' => true,
            ],
            [
                'question_text' => '3. Señale en la figura humana el área del cuerpo donde presenta su problema de salud.',
                'type' => 'body_map',
                'order' => 3,
                'is_required' => true,
            ],
            [
                'question_text' => '4. Una vez aparezca la etiqueta del área seleccionada del cuerpo, entonces describa las características del problema de salud.',
                'type' => 'text',
                'order' => 4,
                'is_required' => true,
            ],
            [
                'question_text' => '5. ¿Tiene Ud. algún diagnóstico previo? Por favor indíquelo a continuación:',
                'type' => 'select',
                'options' => ['No', 'Sí, Hipertensión', 'Sí, Diabetes', 'Sí, Otros (especificar)'],
                'order' => 5,
                'is_required' => true,
            ],
            [
                'question_text' => '6. ¿Qué dudas quiere aclarar en esta Videoconsulta? Haga todas las preguntas que considere.',
                'type' => 'text',
                'order' => 6,
                'is_required' => true,
            ],
        ];

        foreach ($questions as $q) {
            \App\Models\MedicalQuestion::create($q + ['id' => \Illuminate\Support\Str::uuid()]);
        }
    }
}
