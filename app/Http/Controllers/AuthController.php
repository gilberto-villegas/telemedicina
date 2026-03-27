<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request, \App\Services\MppsValidationService $mppsService): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:patient,doctor,clinic_admin,pharmacy',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20',
            'document_id' => 'required|string|max:20',
            'password' => ['required', 'confirmed', Password::defaults()],
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            // Campos específicos según tipo
            'birth_date' => 'required_if:type,patient|date|nullable',
            'mpps_number' => 'required_if:type,doctor|string|nullable',
            'specialty' => 'nullable|string',
            'specialty_id' => 'required_if:type,doctor|exists:specialties,id|nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validación de formato MPPS para médicos
        if ($request->type === 'doctor' && $request->mpps_number) {
            $validation = $mppsService->verifyWithMinistry($request->mpps_number, $request->document_id);
            if (!$validation['success']) {
                return response()->json([
                    'message' => 'Error de validación MPPS',
                    'errors' => ['mpps_number' => [$validation['message']]]
                ], 422);
            }
        }

        // Laravel generará el 'id' automáticamente (auto-increment)
        $user = User::create([
            'uuid' => \Illuminate\Support\Str::uuid(),
            'type' => $request->type,
            'email' => $request->email,
            'phone' => $request->phone,
            'document_id' => $request->document_id,
            'password' => Hash::make($request->password),
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'birth_date' => $request->birth_date,
            'mpps_number' => $request->mpps_number,
            'specialty' => $request->specialty,
            'specialty_id' => $request->specialty_id,
            'document_verified' => false,
            'is_verified' => $request->type === 'patient', // Pacientes verificados automáticamente
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Usuario registrado exitosamente',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales inválidas'
            ], 401);
        }

        if ($user->is_blocked) {
            return response()->json([
                'message' => 'Tu cuenta ha sido bloqueada. Por favor, contacta al soporte.'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login exitoso',
            'user' => $user,
            'token' => $token
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'avatar_url' => 'sometimes|string|max:500|nullable',
            'birth_date' => 'sometimes|date',
            'blood_type' => 'sometimes|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'allergies' => 'sometimes|string',
            // Campos profesionales
            'specialty' => 'sometimes|string|max:255',
            'specialty_id' => 'sometimes|exists:specialties,id|nullable',
            'mpps_number' => 'sometimes|string|max:100',
            'consultation_price_usd' => 'sometimes|numeric',
            // Datos bancarios
            'bank_name' => 'sometimes|string|max:255|nullable',
            'bank_account_number' => 'sometimes|string|max:255|nullable',
            'bank_account_holder' => 'sometimes|string|max:255|nullable',
            'bank_document_id' => 'sometimes|string|max:255|nullable',
            'bank_account_type' => 'sometimes|string|max:255|nullable',
            'bank_id' => 'sometimes|exists:banks,id|nullable',
            // Pago Móvil
            'pago_movil_phone' => 'sometimes|string|max:255|nullable',
            'pago_movil_document_id' => 'sometimes|string|max:255|nullable',
            'pago_movil_bank' => 'sometimes|string|max:255|nullable',
            'pago_movil_bank_id' => 'sometimes|exists:banks,id|nullable',
            // Zelle
            'zelle_email' => 'sometimes|email|max:255|nullable',
            'zelle_holder' => 'sometimes|string|max:255|nullable',
            'digital_signature' => 'sometimes|string|nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only([
            'first_name', 'last_name', 'phone', 'avatar_url',
            'birth_date', 'blood_type', 'allergies',
            'specialty', 'specialty_id', 'mpps_number', 'consultation_price_usd',
            'bank_name', 'bank_account_number', 'bank_account_holder', 'bank_document_id', 'bank_account_type', 'bank_id',
            'pago_movil_phone', 'pago_movil_document_id', 'pago_movil_bank', 'pago_movil_bank_id',
            'zelle_email', 'zelle_holder', 'digital_signature'
        ]));

        return response()->json([
            'message' => 'Perfil actualizado exitosamente',
            'user' => $user->fresh()
        ]);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        Log::info('Upload Avatar Request:', [
            'has_file' => $request->hasFile('avatar'),
            'all_data' => $request->all(),
            'files' => $request->file()
        ]);

        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
        ]);

        if ($request->hasFile('avatar')) {
            $avatar = $request->file('avatar');
            $filename = time() . '.' . $avatar->getClientOriginalExtension();
            $path = $avatar->storeAs('public/avatars', $filename);
            $url = asset('storage/avatars/' . $filename);

            return response()->json([
                'url' => $url
            ]);
        }

        return response()->json(['message' => 'No se subió ningún archivo'], 400);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        // TODO: Implementar recuperación de contraseña
        return response()->json([
            'message' => 'Funcionalidad en desarrollo'
        ], 501);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        // TODO: Implementar reset de contraseña
        return response()->json([
            'message' => 'Funcionalidad en desarrollo'
        ], 501);
    }
}
