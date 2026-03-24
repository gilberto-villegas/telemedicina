<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\User;
use App\Models\Status;
use App\Services\BcvService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    protected $bcvService;

    public function __construct(BcvService $bcvService)
    {
        $this->bcvService = $bcvService;
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            $query = Appointment::query();

            // Filtrar según tipo de usuario
            if ($user->isPatient()) {
                $query->where('patient_id', $user->id);
            } elseif ($user->isDoctor()) {
                $query->where('doctor_id', $user->id);
            }

            // Filtros opcionales
            if ($request->has('status')) {
                $query->whereHas('status', function($q) use ($request) {
                    $q->where('name', $request->status);
                });
            }

            if ($request->has('upcoming')) {
                $query->upcoming();
            }

            // Filtro por fecha si se proporciona
            if ($request->has('date')) {
                $query->whereDate('start_time', $request->date);
            }

            $appointments = $query->with(['patient', 'doctor'])
                ->orderBy('start_time', 'desc')
                ->get()
                ->map(function($apt) {
                    return [
                        'id' => $apt->id,
                        'appointment_date' => $apt->start_time ? $apt->start_time->toISOString() : null,
                        'status' => $apt->status ? $apt->status->label : 'Desconocido',
                        'status_name' => $apt->status ? $apt->status->name : null,
                        'reason' => $apt->reason ?? '',
                        'type' => $apt->type,
                        'duration_minutes' => ($apt->start_time && $apt->end_time) ? $apt->start_time->diffInMinutes($apt->end_time) : 0,
                        'price_usd' => $apt->price_usd ?? 0,
                        'patient' => $apt->patient ? [
                            'id' => $apt->patient->id,
                            'first_name' => $apt->patient->first_name,
                            'last_name' => $apt->patient->last_name,
                            'document_id' => $apt->patient->document_id,
                        ] : null,
                        'doctor' => $apt->doctor ? [
                            'id' => $apt->doctor->id,
                            'first_name' => $apt->doctor->first_name,
                            'last_name' => $apt->doctor->last_name,
                            'specialty' => $apt->doctor->specialty_name ?? ($apt->doctor->specialty_ref?->name ?? $apt->doctor->specialty),
                            'mpps_number' => $apt->doctor->mpps_number,
                            'avatar_url' => $apt->doctor->avatar_url,
                            'digital_signature' => $apt->doctor->digital_signature,
                        ] : null,
                    ];
                });

            return response()->json($appointments);
        } catch (\Exception $e) {
            \Log::error('Error en AppointmentController@index: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al cargar las citas',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    public function show(string $id): JsonResponse
    {
        $appointment = Appointment::with([
            'patient',
            'doctor.specialty_ref',
            'medicalRecord.attachments',
            'prescription',
            'payment',
            'medicalResponses.question',
            'attachments'
        ])->findOrFail($id);

        // Verificar permisos
        $user = request()->user();
        if (!$user->isPatient() && !$user->isDoctor()) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        if ($user->isPatient() && $appointment->patient_id !== $user->id) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        if ($user->isDoctor() && $appointment->doctor_id !== $user->id) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        // Formatear respuesta para incluir appointment_date
        $appointment->load(['status', 'patient', 'payment.status', 'medicalResponses', 'attachments']);
        $appointmentData = $appointment->toArray();
        $appointmentData['status_label'] = $appointment->status ? $appointment->status->label : 'Desconocido';
        
        // Manejo robusto de fechas para evitar Error 500 si no es objeto Carbon
        $startTime = $appointment->start_time;
        if ($startTime instanceof \Carbon\Carbon) {
            $appointmentData['appointment_date'] = $startTime->toISOString();
        } elseif (is_string($startTime)) {
            $appointmentData['appointment_date'] = \Carbon\Carbon::parse($startTime)->toISOString();
        } else {
            $appointmentData['appointment_date'] = null;
        }

        // Fallback: Si no se cargó por relación (por inconsistencia de IDs), buscar por appointment_id
        if (empty($appointmentData['medical_record'])) {
            $record = \App\Models\MedicalRecord::where('appointment_id', $appointment->id)->first();
            if ($record) {
                $record->load('attachments');
                $appointmentData['medical_record'] = $record->toArray();
            }
        }

        if (empty($appointmentData['prescription'])) {
            $prescription = \App\Models\Prescription::where('appointment_id', $appointment->id)->first();
            if ($prescription) {
                $appointmentData['prescription'] = $prescription->toArray();
            }
        }

        // Contador de mensajes no leídos para este appointment
        $appointmentData['unread_messages_count'] = \App\Models\Message::where('appointment_id', $appointment->id)
            ->where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return response()->json($appointmentData);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isPatient()) {
            return response()->json([
                'message' => 'Solo los pacientes pueden agendar citas'
            ], 403);
        }

        $validated = $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'appointment_date' => 'required|date|after:now',
            'reason' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:15|max:120',
            'type' => 'required|string|in:videoconsulta,teleconsulta',
        ]);

        // Verificar que el doctor existe y es válido
        $doctor = User::doctors()->verified()->findOrFail($validated['doctor_id']);

        // Parsear la fecha y asegurarse de que esté en la zona horaria del servidor
        $appointmentDate = Carbon::parse($validated['appointment_date'])->setTimezone(config('app.timezone'));
        
        // Verificar nuevamente que sea futura (por si acaso hay problemas de zona horaria)
        if (!$appointmentDate->isFuture()) {
            return response()->json([
                'message' => 'La fecha y hora seleccionada debe ser futura'
            ], 422);
        }
        
        $duration = $validated['duration_minutes'] ?? 30;
        $startTime = $appointmentDate;
        $endTime = $appointmentDate->copy()->addMinutes($duration);

        // Verificar disponibilidad
        $conflicting = Appointment::where('doctor_id', $doctor->id)
            ->whereHas('status', function($query) {
                $query->whereNotIn('name', ['cancelled', 'pending_payment']);
            })
            ->where(function($query) use ($startTime, $endTime) {
                $query->where(function($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<', $endTime)
                      ->where('end_time', '>', $startTime);
                });
            })
            ->exists();

        if ($conflicting) {
            return response()->json([
                'message' => 'El horario seleccionado no está disponible'
            ], 409);
        }

        // Obtener tasa de cambio oficial del BCV
        $exchangeRate = $this->bcvService->getExchangeRate();

        $appointment = Appointment::create([
            'patient_id' => $user->id,
            'doctor_id' => $doctor->id,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'reason' => $validated['reason'] ?? null,
            'type' => $validated['type'],
            'status_id' => Status::where('name', 'pending_payment')->first()->id,
            'price_usd' => $doctor->consultation_price_usd ?? 25.00,
            'price_ves' => ($doctor->consultation_price_usd ?? 25.00) * $exchangeRate,
            'exchange_rate' => $exchangeRate,
        ]);

        return response()->json([
            'message' => 'Cita agendada exitosamente',
            'appointment' => $appointment->load(['doctor.specialty_ref', 'patient'])
        ], 201);
    }

    public function cancel(string $id): JsonResponse
    {
        $appointment = Appointment::findOrFail($id);
        $user = request()->user();

        // Verificar permisos
        if ($appointment->patient_id !== $user->id && $appointment->doctor_id !== $user->id) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        if (!$appointment->canBeCancelled()) {
            return response()->json([
                'message' => 'Esta cita no puede ser cancelada'
            ], 400);
        }

        $appointment->update([
            'status_id' => Status::where('name', 'cancelled')->first()->id
        ]);

        return response()->json([
            'message' => 'Cita cancelada exitosamente',
            'appointment' => $appointment
        ]);
    }

    public function join(string $id): JsonResponse
    {
        $appointment = Appointment::findOrFail($id);
        $user = request()->user();

        // Verificar permisos
        if ($appointment->patient_id !== $user->id && $appointment->doctor_id !== $user->id) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        // Generar room ID si es Videoconsulta y no existe
        if ($appointment->type === Appointment::TYPE_VIDEO && !$appointment->video_room_id) {
            $appointment->video_room_id = Str::random(32);
        }

        // Marcar como en progreso si está programada
        if ($appointment->status->name === 'scheduled') {
            $appointment->status_id = Status::where('name', 'in_progress')->first()->id;
        }

        if ($appointment->isDirty()) {
            $appointment->save();
        }

        return response()->json([
            'room_id' => $appointment->video_room_id,
            'appointment' => $appointment->load('status')
        ]);
    }

    public function sendReminder(string $id): JsonResponse
    {
        // TODO: Implementar envío de recordatorios (WhatsApp, Email, Push)
        return response()->json([
            'message' => 'Funcionalidad en desarrollo'
        ], 501);
    }

    public function finalize(string $id): JsonResponse
    {
        $appointment = Appointment::findOrFail($id);
        $user = request()->user();

        // Verificar permisos - solo el doctor puede finalizar
        if (!$user->isDoctor() || $appointment->doctor_id !== $user->id) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        // Verificar que la cita esté en progreso o programada
        if (!in_array($appointment->status->name, ['in_progress', 'scheduled'])) {
            return response()->json([
                'message' => 'Solo se pueden finalizar citas en progreso o programadas'
            ], 400);
        }

        // Actualizar estado y tiempo de finalización
        $appointment->update([
            'status_id' => Status::where('name', 'completed')->first()->id,
            'end_time' => now(),
        ]);

        return response()->json([
            'message' => 'Cita finalizada exitosamente',
            'appointment' => $appointment->load(['patient', 'doctor', 'medicalRecord', 'prescription'])
        ]);
    }
}

