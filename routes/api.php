<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\VideoCallController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\MedicalRecordController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\NotificationPreferencesController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/up', function () {
    return response()->json(['status' => 'ok']);
});

Route::get('/specialties', [App\Http\Controllers\SpecialtyController::class, 'index']);
Route::get('/public/doctors', [DoctorController::class, 'index']);

// Autenticación pública
Route::group(['prefix' => 'auth'], function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Rutas autenticadas
Route::middleware('auth:sanctum')->group(function () {
    
    // Médicos - Rutas específicas con /me PRIMERO (antes de cualquier otro grupo)
    Route::get('/doctors/me/availability', [DoctorController::class, 'availability']);
    Route::post('/doctors/me/availability', [DoctorController::class, 'updateAvailability']);
    Route::get('/doctors/me/patients', [DoctorController::class, 'patients']);
    Route::get('/doctors/me/patients/{id}', [DoctorController::class, 'patientDetail']);
    
    // Autenticación
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/me', [AuthController::class, 'updateProfile']);
        Route::post('/avatar', [AuthController::class, 'uploadAvatar']);
    });

    // Pacientes
    Route::prefix('patients')->group(function () {
        Route::get('/me', [PatientController::class, 'me']);
        Route::put('/me', [PatientController::class, 'update']);
        Route::get('/me/medical-records', [PatientController::class, 'medicalRecords']);
        Route::post('/me/medical-records/attachments', [PatientController::class, 'uploadAttachment']);
    });
    
    // Médicos - Resto de rutas
    Route::prefix('doctors')->group(function () {
        Route::get('/', [DoctorController::class, 'index']);
        Route::get('/{id}', [DoctorController::class, 'show']);
        Route::get('/{id}/slots', [DoctorController::class, 'slots']);
        Route::post('/{id}/appointments', [AppointmentController::class, 'store']);
    });

    // Consultas/Appointments
    Route::prefix('appointments')->group(function () {
        Route::get('/', [AppointmentController::class, 'index']);
        Route::get('/{id}', [AppointmentController::class, 'show']);
        Route::post('/', [AppointmentController::class, 'store']);
        Route::put('/{id}/cancel', [AppointmentController::class, 'cancel']);
        Route::post('/{id}/join', [AppointmentController::class, 'join']);
        Route::post('/{id}/finalize', [AppointmentController::class, 'finalize']);
        Route::post('/{id}/reminder', [AppointmentController::class, 'sendReminder']);
    });

    // Videollamadas
    Route::prefix('video-calls')->group(function () {
        Route::post('/session', [VideoCallController::class, 'createSession']);
        Route::get('/{id}/token', [VideoCallController::class, 'getTurnToken']);
        Route::post('/{id}/record', [VideoCallController::class, 'startRecording']);
        Route::delete('/{id}/record', [VideoCallController::class, 'stopRecording']);
    });

    // Pagos
    Route::prefix('payments')->group(function () {
        Route::post('/intent', [PaymentController::class, 'createIntent']);
        Route::get('/{id}/instructions', [PaymentController::class, 'getInstructions']);
        Route::post('/upload-proof', [PaymentController::class, 'uploadProof']);
        Route::post('/{id}/confirm', [PaymentController::class, 'confirm']);
        Route::get('/invoices', [PaymentController::class, 'invoices']);
        Route::get('/doctor', [PaymentController::class, 'doctorPayments']);
        Route::post('/{id}/verify', [PaymentController::class, 'verify']);
    });

    // Billetera del Doctor
    Route::prefix('wallet')->group(function () {
        Route::get('/balance', [\App\Http\Controllers\WalletController::class, 'balance']);
        Route::post('/request-withdrawal', [\App\Http\Controllers\WalletController::class, 'requestWithdrawal']);
        Route::get('/history', [\App\Http\Controllers\WalletController::class, 'history']);
    });

    Route::get('/exchange-rate', function (\App\Services\BcvService $bcvService) {
        return response()->json(['rate' => $bcvService->getExchangeRate()]);
    });

    // Recetas
    Route::prefix('prescriptions')->group(function () {
        Route::get('/', [PrescriptionController::class, 'index']);
        Route::post('/', [PrescriptionController::class, 'store']);
        Route::get('/{id}', [PrescriptionController::class, 'show']);
        Route::get('/{id}/qr', [PrescriptionController::class, 'getQr']);
        Route::post('/{id}/fill', [PrescriptionController::class, 'fill']); // Para farmacias
    });

    // Historial médico
    Route::prefix('medical-records')->group(function () {
        Route::get('/', [MedicalRecordController::class, 'index']);
        Route::get('/{id}', [MedicalRecordController::class, 'show']);
        Route::post('/', [MedicalRecordController::class, 'store']);
        Route::put('/{id}', [MedicalRecordController::class, 'update']);
    });

    // Chats
    Route::prefix('chats')->group(function () {
        Route::get('/', [App\Http\Controllers\ChatController::class, 'index']);
        Route::post('/', [App\Http\Controllers\ChatController::class, 'store']);
        Route::get('/{id}/messages', [App\Http\Controllers\ChatController::class, 'messages']);
        Route::post('/{id}/messages', [App\Http\Controllers\ChatController::class, 'sendMessage']);
    });

    // Notificaciones
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'getUnreadCount']);
        Route::get('/{id}', [NotificationController::class, 'show']);
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::post('/test', [NotificationController::class, 'test']); // Solo admin
    });

    // Preferencias de notificaciones
    Route::prefix('notification-preferences')->group(function () {
        Route::get('/', [NotificationPreferencesController::class, 'show']);
        Route::put('/', [NotificationPreferencesController::class, 'update']);
    });

    // Cuestionarios Médicos
    Route::prefix('medical-questions')->group(function () {
        Route::get('/', [App\Http\Controllers\MedicalQuestionController::class, 'index']);
        Route::post('/sync', [App\Http\Controllers\MedicalQuestionController::class, 'updateQuestions']);
    });
    Route::prefix('appointments/{id}/responses')->group(function () {
        Route::get('/', [App\Http\Controllers\MedicalQuestionController::class, 'getResponses']);
        Route::post('/', [App\Http\Controllers\MedicalQuestionController::class, 'storeResponses']);
    });

    // Administración
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/stats', [App\Http\Controllers\AdminController::class, 'stats']);
        
        // Médicos
        Route::get('/doctors', [App\Http\Controllers\AdminController::class, 'indexDoctors']);
        Route::post('/doctors/{doctor}/verify', [App\Http\Controllers\AdminController::class, 'verifyDoctor']);
        
        // Pacientes
        Route::get('/patients', [App\Http\Controllers\AdminController::class, 'indexPatients']);
        
        // Usuarios (Bloqueo/Eliminación)
        Route::post('/users/{user}/block', [App\Http\Controllers\AdminController::class, 'blockUser']);
        Route::delete('/users/{user}', [App\Http\Controllers\AdminController::class, 'deleteUser']);
        
        // Especialidades
        Route::get('/specialties', [App\Http\Controllers\AdminController::class, 'indexSpecialties']);
        Route::post('/specialties', [App\Http\Controllers\AdminController::class, 'storeSpecialty']);
        Route::put('/specialties/{specialty}', [App\Http\Controllers\AdminController::class, 'updateSpecialty']);
        Route::delete('/specialties/{specialty}', [App\Http\Controllers\AdminController::class, 'deleteSpecialty']);
        
        // Administradores
        Route::get('/admins', [App\Http\Controllers\AdminController::class, 'indexAdmins']);
        Route::post('/admins', [App\Http\Controllers\AdminController::class, 'storeAdmin']);
        Route::put('/admins/{admin}', [App\Http\Controllers\AdminController::class, 'updateAdmin']);

        // Bancos (CRUD Admin)
        Route::post('/banks', [App\Http\Controllers\BankController::class, 'store']);
        Route::put('/banks/{bank}', [App\Http\Controllers\BankController::class, 'update']);
        Route::delete('/banks/{bank}', [App\Http\Controllers\BankController::class, 'destroy']);
        Route::get('/payments', [PaymentController::class, 'adminPayments']);

        // Billetera y Pagos a Médicos
        Route::get('/wallet-requests', [\App\Http\Controllers\WalletController::class, 'getAdminRequests']);
        Route::post('/wallet-requests/{id}/approve', [\App\Http\Controllers\WalletController::class, 'approveRequest']);
        
        // Configuraciones
        Route::get('/settings', function () {
            // Transformar en array para fácil acceso {key: value} en el frontend
            $settings = \App\Models\Setting::all()->pluck('value', 'key');
            return response()->json($settings);
        });
        Route::post('/settings', function (\Illuminate\Http\Request $request) {
            $data = $request->all();
            foreach ($data as $key => $value) {
                \App\Models\Setting::updateOrCreate(['key' => $key], ['value' => $value]);
            }
            return response()->json(['message' => 'Settings updated']);
        });
    });

    // Bancos (Acceso general para selects)
    Route::get('/banks', [App\Http\Controllers\BankController::class, 'index']);
});

