<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'uuid' => (string) Str::uuid(),
            'type' => 'patient',
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'document_id' => fake()->numerify('V-########'),
            'document_verified' => false,
            'password' => Hash::make('password'),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'birth_date' => fake()->date(),
            'is_verified' => true,
        ];
    }

    public function doctor(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'doctor',
            'mpps_number' => fake()->numerify('MPPS-#######'),
            'specialty' => fake()->randomElement(['Medicina General', 'Cardiología', 'Pediatría', 'Dermatología']),
            'consultation_price_usd' => fake()->randomFloat(2, 20, 50),
            'is_verified' => true,
            'document_verified' => true,
        ]);
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'admin',
            'is_verified' => true,
            'document_verified' => true,
        ]);
    }
}
