<?php

namespace Tests\QA;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class TestAuthFlow extends TestCase
{
    use RefreshDatabase;

    public function test_register_patient()
    {
        $response = $this->postJson('/api/auth/register', [
            'type' => 'patient',
            'email' => 'test_patient_qa@test.com',
            'phone' => '+584121111111',
            'document_id' => 'V-11111111',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'first_name' => 'Test',
            'last_name' => 'Patient',
            'birth_date' => '1990-01-01',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message',
            'user' => ['id', 'email', 'type'],
            'token',
        ]);
        
        $user = $response->json('user');
        $this->assertIsString($user['id']);
        $this->assertEquals(36, strlen($user['id'])); // UUID length
        $this->assertEquals('patient', $user['type']);
    }

    public function test_login_with_valid_credentials()
    {
        $user = User::create([
            'uuid' => \Illuminate\Support\Str::uuid(),
            'type' => 'doctor',
            'email' => 'test_doctor_qa@test.com',
            'phone' => '+584122222222',
            'document_id' => 'V-22222222',
            'password' => Hash::make('password123'),
            'first_name' => 'Test',
            'last_name' => 'Doctor',
            'mpps_number' => 'MPPS-TEST',
            'specialty' => 'Cardiología',
            'is_verified' => true,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test_doctor_qa@test.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'user' => ['id', 'email'],
            'token',
        ]);
        
        $token = $response->json('token');
        $this->assertNotEmpty($token);
    }

    public function test_get_me_with_token()
    {
        $user = User::create([
            'uuid' => \Illuminate\Support\Str::uuid(),
            'type' => 'patient',
            'email' => 'test_me@test.com',
            'phone' => '+584123333333',
            'document_id' => 'V-33333333',
            'password' => Hash::make('password123'),
            'first_name' => 'Test',
            'last_name' => 'Me',
            'is_verified' => true,
        ]);

        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->getJson('/api/auth/me', [
            'Authorization' => "Bearer $token",
        ]);

        $response->assertStatus(200);
        $this->assertEquals($user->id, $response->json('user.id'));
    }

    public function test_logout()
    {
        $user = User::create([
            'uuid' => \Illuminate\Support\Str::uuid(),
            'type' => 'patient',
            'email' => 'test_logout@test.com',
            'phone' => '+584124444444',
            'document_id' => 'V-44444444',
            'password' => Hash::make('password123'),
            'first_name' => 'Test',
            'last_name' => 'Logout',
            'is_verified' => true,
        ]);

        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->postJson('/api/auth/logout', [], [
            'Authorization' => "Bearer $token",
        ]);

        $response->assertStatus(200);
        
        // Verificar que el token fue eliminado
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'test_token',
        ]);
    }
}
