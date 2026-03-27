<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Specialty;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'total_doctors' => User::doctors()->count(),
            'total_patients' => User::patients()->count(),
            'pending_doctors' => User::doctors()->where('is_verified', false)->count(),
            'total_specialties' => Specialty::count(),
        ]);
    }

    public function indexDoctors(): JsonResponse
    {
        $doctors = User::doctors()->with(['specialty_ref', 'bank', 'pagoMovilBank'])->get();
        return response()->json($doctors);
    }

    public function verifyDoctor(Request $request, User $doctor): JsonResponse
    {
        $doctor->update([
            'is_verified' => true,
            'verified_at' => now(),
            'verified_by' => $request->user()->id,
        ]);
        return response()->json(['message' => 'Médico verificado exitosamente', 'user' => $doctor]);
    }

    public function indexPatients(): JsonResponse
    {
        $patients = User::patients()->get();
        return response()->json($patients);
    }

    public function blockUser(User $user): JsonResponse
    {
        if ($user->type === 'admin' && User::where('type', 'admin')->count() <= 1) {
            return response()->json(['message' => 'No puedes bloquear al único administrador.'], 403);
        }

        $user->update(['is_blocked' => !$user->is_blocked]);
        $status = $user->is_blocked ? 'bloqueado' : 'desbloqueado';
        return response()->json(['message' => "Usuario {$status} exitosamente", 'user' => $user]);
    }

    public function deleteUser(User $user): JsonResponse
    {
        if ($user->type === 'admin' && User::where('type', 'admin')->count() <= 1) {
            return response()->json(['message' => 'No puedes eliminar al único administrador.'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'Usuario eliminado exitosamente']);
    }

    // Specialties
    public function indexSpecialties(): JsonResponse
    {
        return response()->json(Specialty::all());
    }

    public function storeSpecialty(Request $request): JsonResponse
    {
        $request->validate(['name' => 'required|string|unique:specialties,name']);
        $specialty = Specialty::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
        ]);
        return response()->json($specialty, 201);
    }

    public function updateSpecialty(Request $request, Specialty $specialty): JsonResponse
    {
        $request->validate(['name' => 'required|string|unique:specialties,name,' . $specialty->id]);
        $specialty->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
        ]);
        return response()->json($specialty);
    }

    public function deleteSpecialty(Specialty $specialty): JsonResponse
    {
        if ($specialty->users()->exists()) {
            return response()->json(['message' => 'No se puede eliminar porque tiene médicos asociados.'], 422);
        }
        $specialty->delete();
        return response()->json(['message' => 'Especialidad eliminada']);
    }

    // Admin management
    public function indexAdmins(): JsonResponse
    {
        return response()->json(User::where('type', 'admin')->get());
    }

    public function storeAdmin(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $admin = User::create([
            'uuid' => Str::uuid(),
            'type' => 'admin',
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'document_id' => 'ADMIN-' . time(),
            'password' => Hash::make($request->password),
            'is_verified' => true,
            'document_verified' => true,
        ]);

        return response()->json($admin, 201);
    }

    public function updateAdmin(Request $request, User $admin): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $admin->id,
            'phone' => 'required|string|max:20',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = [
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $admin->update($data);

        return response()->json($admin);
    }
}
