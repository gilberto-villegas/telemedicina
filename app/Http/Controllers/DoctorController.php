<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\DoctorAvailability;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DoctorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::doctors()->verified();

        // Filtros
        if ($request->has('specialty')) {
            $query->where('specialty', $request->specialty);
        }

        if ($request->has('specialty_id')) {
            $query->where('specialty_id', $request->specialty_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('specialty', 'like', "%{$search}%");
            });
        }

        $doctors = $query->with('specialty_ref')->paginate($request->input('per_page', 12));
        
        $doctors->getCollection()->transform(function($doctor) {
            return [
                'id' => $doctor->id,
                'first_name' => $doctor->first_name,
                'last_name' => $doctor->last_name,
                'specialty' => $doctor->specialty_ref?->name ?? $doctor->specialty,
                'specialty_id' => $doctor->specialty_id,
                'rating' => $doctor->rating !== null ? (float) $doctor->rating : null,
                'consultation_price_usd' => $doctor->consultation_price_usd !== null ? (float) $doctor->consultation_price_usd : null,
                'is_verified' => $doctor->is_verified,
                'avatar_url' => $doctor->avatar_url,
            ];
        });

        return response()->json($doctors);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        // Manejar caso especial /me/availability y /me/patients
        if ($id === 'me') {
            $path = $request->path();
            if (strpos($path, 'availability') !== false) {
                return $this->availability($request);
            } elseif (strpos($path, 'patients') !== false) {
                return $this->patients($request);
            }
        }
        
        $doctor = User::doctors()->verified()->findOrFail($id);

        return response()->json($doctor->load('availability'));
    }

    public function slots(Request $request, string $id): JsonResponse
    {
        $doctor = User::doctors()->verified()->findOrFail($id);
        $date = $request->input('date', Carbon::today()->toDateString());
        $selectedDate = Carbon::parse($date);
        $dayOfWeek = $selectedDate->dayOfWeek; // 0 = Domingo, 6 = Sábado

        // Obtener disponibilidad semanal del doctor para ese día
        $availabilities = DoctorAvailability::where('doctor_id', $doctor->id)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->get();

        // Si no hay disponibilidad configurada, retornar vacío
        if ($availabilities->isEmpty()) {
            return response()->json([
                'slots' => [],
                'date' => $date,
                'message' => 'El doctor no tiene horarios configurados para este día.'
            ]);
        }

        // Obtener todas las citas (no canceladas) para ese día
        $bookedAppointments = Appointment::where('doctor_id', $doctor->id)
            ->whereDate('start_time', $selectedDate->toDateString())
            ->whereHas('status', function ($query) {
                $query->whereNotIn('name', ['cancelled', 'pending_payment']);
            })
            ->get(['start_time', 'end_time']);

        $slots = [];
        foreach ($availabilities as $avail) {
            $start = Carbon::createFromTimeString($avail->start_time);
            $end = Carbon::createFromTimeString($avail->end_time);

            // Generar slots de 30 minutos
            while ($start->copy()->addMinutes(30)->lte($end)) {
                $slotStart = $selectedDate->copy()->setTimeFrom($start);
                $slotEnd = $slotStart->copy()->addMinutes(30);
                $timeStr = $start->format('H:i');

                // Verificar si este slot se solapa con alguna cita existente
                $isBooked = $bookedAppointments->contains(function ($appointment) use ($slotStart, $slotEnd) {
                    // Un slot está ocupado si se solapa con el rango de la cita
                    return $slotStart < $appointment->end_time && $slotEnd > $appointment->start_time;
                });

                // Si la fecha es hoy, no mostrar slots pasados
                $isPast = $selectedDate->isToday() && $slotStart->isPast();

                $slots[] = [
                    'time' => $timeStr,
                    'available' => !$isBooked && !$isPast,
                    'is_booked' => $isBooked,
                    'is_past' => $isPast
                ];

                $start->addMinutes(30);
            }
        }

        // Ordenar slots por hora
        usort($slots, fn($a, $b) => strcmp($a['time'], $b['time']));

        return response()->json([
            'slots' => $slots,
            'date' => $date,
        ]);
    }

    public function availability(Request $request): JsonResponse
    {
        try {
            $doctor = $request->user();
            
            if (!$doctor->isDoctor()) {
                return response()->json(['message' => 'No autorizado'], 403);
            }

            $availability = DoctorAvailability::where('doctor_id', $doctor->id)->get();

            return response()->json($availability);
        } catch (\Exception $e) {
            \Log::error('Error en DoctorController@availability: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al cargar la disponibilidad',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    public function updateAvailability(Request $request): JsonResponse
    {
        $doctor = $request->user();
        
        if (!$doctor->isDoctor()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $slots = $request->input('slots', []);

        // Eliminar disponibilidad existente
        DoctorAvailability::where('doctor_id', $doctor->id)->delete();

        // Crear nueva disponibilidad (usar updateOrCreate para evitar duplicados)
        foreach ($slots as $slot) {
            DoctorAvailability::updateOrCreate(
                [
                    'doctor_id' => $doctor->id,
                    'day_of_week' => $slot['day_of_week'],
                    'start_time' => $slot['start_time'],
                    'end_time' => $slot['end_time'],
                ],
                [
                    'is_available' => $slot['is_available'] ?? true,
                ]
            );
        }

        return response()->json(['message' => 'Disponibilidad actualizada']);
    }

    public function patients(Request $request): JsonResponse
    {
        $doctor = $request->user();
        
        if (!$doctor->isDoctor()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $patients = User::whereHas('appointmentsAsPatient', function($query) use ($doctor) {
            $query->where('doctor_id', $doctor->id);
        })
        ->withCount(['appointmentsAsPatient' => function($query) use ($doctor) {
            $query->where('doctor_id', $doctor->id);
        }])
        ->get()
        ->map(function($patient) use ($doctor) {
            $lastAppointment = Appointment::where('patient_id', $patient->id)
                ->where('doctor_id', $doctor->id)
                ->orderBy('start_time', 'desc')
                ->first();
            
            return [
                'id' => $patient->id,
                'first_name' => $patient->first_name,
                'last_name' => $patient->last_name,
                'document_id' => $patient->document_id,
                'email' => $patient->email,
                'phone' => $patient->phone,
                'birth_date' => $patient->birth_date,
                'total_appointments' => $patient->appointments_count,
                'last_appointment' => $lastAppointment?->start_time,
            ];
        });

        return response()->json($patients);
    }

    public function patientDetail(Request $request, string $id): JsonResponse
    {
        $doctor = $request->user();
        
        if (!$doctor->isDoctor()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $patient = User::whereHas('appointmentsAsPatient', function($query) use ($doctor) {
            $query->where('doctor_id', $doctor->id);
        })->findOrFail($id);

        $appointments = Appointment::where('patient_id', $patient->id)
            ->where('doctor_id', $doctor->id)
            ->with(['status', 'medicalRecord', 'prescription'])
            ->orderBy('start_time', 'desc')
            ->get()
            ->map(function($apt) {
                return [
                    'id' => $apt->id,
                    'appointment_date' => $apt->start_time ? $apt->start_time->toISOString() : null,
                    'status' => $apt->status ? $apt->status->label : 'Desconocido',
                    'status_name' => $apt->status ? $apt->status->name : null,
                    'reason' => $apt->reason ?? '',
                    'medical_record' => $apt->medicalRecord,
                    'prescription' => $apt->prescription,
                ];
            });

        return response()->json([
            'patient' => [
                'id' => $patient->id,
                'first_name' => $patient->first_name,
                'last_name' => $patient->last_name,
                'document_id' => $patient->document_id,
                'email' => $patient->email,
                'phone' => $patient->phone,
                'birth_date' => $patient->birth_date,
                'gender' => $patient->gender,
            ],
            'appointments' => $appointments
        ]);
    }
}

