# ANÁLISIS INTEGRAL DEL SISTEMA - VILSALUD TELEMEDICINA

---

## 1. ¿QUÉ ES Y PARA QUÉ SIRVE?

**VilSalud** es una plataforma tecnológica integral de telemedicina diseñada para el mercado de salud venezolano, que conecta de manera directa y segura a pacientes con médicos especialistas debidamente certificados ante el Ministerio del Poder Popular para la Salud (MPPS). La solución opera como una aplicación web moderna (SPA en React 19 servida por un backend Laravel 11), permitiendo la búsqueda y filtrado de profesionales por especialidad, la reserva automatizada de turnos médicos en intervalos de 30 minutos, la recolección de cuestionarios y antecedentes pre-consulta, la ejecución de teleconsultas/videollamadas en tiempo real y la emisión digital estructurada de notas de evolución médica (SOAP) junto con recetas farmacológicas verificables mediante código QR.

Asimismo, el sistema resuelve la complejidad financiera y operativa del entorno venezolano al incorporar una pasarela de reportes de pago bimonetaria (USD y Bolívares calculados dinámicamente con la tasa oficial del Banco Central de Venezuela vía `BcvService`), un módulo de billetera virtual para la liquidación de honorarios médicos con retención de comisiones de plataforma (`WalletController`), y un panel de administración centralizado que audita pagos, gestiona el catálogo de instituciones bancarias y especialidades, y verifica las credenciales de los profesionales de la salud antes de autorizar su disponibilidad pública.

---

## 2. CORRIDO DEL SISTEMA (PASO A PASO POR ROL)

El sistema maneja tres perfiles principales codificados en el atributo `type` del modelo [`User`](file:///c:/laragon/www/telemedicina/app/Models/User.php#L23): **Paciente** (`patient`), **Médico** (`doctor`) y **Administrador** (`admin`).

### 2.1. Flujo de Autenticación y Redirección Global

1. **Ingreso / Registro Público**:
   - El visitante accede a la interfaz SPA en `/auth/login` o `/auth/register` ([`resources/js/router.tsx`](file:///c:/laragon/www/telemedicina/resources/js/router.tsx#L51-L56)).
   - En el registro ([`AuthController::register`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/AuthController.php#L26-L86)):
     - Si es paciente (`type=patient`), `is_verified` se establece automáticamente en `true`.
     - Si es médico (`type=doctor`), se valida el número de registro ministerial vía [`MppsValidationService`](file:///c:/laragon/www/telemedicina/app/Services/MppsValidationService.php) y se almacena con `is_verified=false` a la espera de auditoría administrativa.
   - En el inicio de sesión ([`AuthController::login`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/AuthController.php#L88-L123)):
     - Se valida correo y contraseña con `Hash::check`.
     - Se comprueba la bandera `is_blocked` (retornando `403` si la cuenta está suspendida).
     - Se genera un token Bearer con Laravel Sanctum (`createToken('auth_token')->plainTextToken`).
     - El cliente almacena el token en `localStorage` y ejecuta la redirección según el rol devuelto:
       ```
       navigate('/dashboard/' + response.user.type)
       ```
       ([`resources/js/pages/auth/Login.tsx`](file:///c:/laragon/www/telemedicina/resources/js/pages/auth/Login.tsx#L24)).

---

### 2.2. Flujo del Rol Paciente (`type = 'patient'`)

| Paso | Acción del Paciente | Rutas y Controladores Involucrados | Modelos de BD Afectados |
| :--- | :--- | :--- | :--- |
| **P1** | **Exploración de Especialistas** | `GET /api/doctors`<br>[`DoctorController::index`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/DoctorController.php#L15) | Consulta `User` (scope `doctors()->verified()`), relación `Specialty`. |
| **P2** | **Consulta de Slots Disponibles** | `GET /api/doctors/{id}/slots`<br>[`DoctorController::slots`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/DoctorController.php#L73) | Lee `DoctorAvailability` y excluye solapamientos en `Appointment`. |
| **P3** | **Agendamiento de la Cita** | `POST /api/appointments`<br>[`AppointmentController::store`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/AppointmentController.php#L161) | Inserta en `Appointment` (estado `pending_payment`), vincula `patient_id` y `doctor_id`. |
| **P4** | **Llenado de Anamnesis / Cuestionario** | `GET /api/medical-questions`<br>`POST /api/appointments/{id}/responses`<br>[`MedicalQuestionController::storeResponses`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/MedicalQuestionController.php#L42) | Consulta `MedicalQuestion`, crea/actualiza en `MedicalResponse` y `AppointmentAttachment`. |
| **P5** | **Generación de Intención y Pago** | `POST /api/payments/intent`<br>`GET /api/payments/{id}/instructions`<br>`POST /api/payments/upload-proof`<br>`POST /api/payments/{id}/confirm`<br>[`PaymentController`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/PaymentController.php#L29-L100) | Inserta en `Payment` (estado `payment_pending`), almacena comprobante en `Storage` (`payments/proofs`), actualiza `Appointment.payment_id` y consulta tasa vía `BcvService`. Dispara notificaciones a Doctor y Admin. |
| **P6** | **Ingreso a la Teleconsulta** | `POST /api/appointments/{id}/join`<br>`POST /api/video-calls/session`<br>[`VideoCallController::createSession`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/VideoCallController.php#L12)<br>`GET/POST /api/chats/{id}/messages` | Actualiza `Appointment.video_room_id` e intercambia registros en `Message`. |
| **P7** | **Revisión de Recetas y Expediente** | `GET /api/prescriptions`<br>`GET /api/prescriptions/{id}/qr`<br>[`PrescriptionController`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/PrescriptionController.php#L13-L76)<br>`GET /api/patients/me/medical-records`<br>[`PatientController::medicalRecords`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/PatientController.php#L58) | Consulta registros en `Prescription` y `MedicalRecord` con sus `MedicalAttachment`. |
| **P8** | **Cierre de Sesión** | `POST /api/auth/logout`<br>[`AuthController::logout`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/AuthController.php#L125) | Revoca el token en `personal_access_tokens` y purga `localStorage`. |

---

### 2.3. Flujo del Rol Médico (`type = 'doctor'`)

| Paso | Acción del Médico | Rutas y Controladores Involucrados | Modelos de BD Afectados |
| :--- | :--- | :--- | :--- |
| **D1** | **Configuración de Perfil y Finanzas** | `PUT /api/auth/me`<br>`POST /api/auth/stamp`<br>[`AuthController::updateProfile`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/AuthController.php#L141), `uploadStamp` | Actualiza `User` con cuentas bancarias, Pago Móvil, Zelle, firma y sello digital (`digital_stamp`). |
| **D2** | **Gestión de Agenda y Horarios** | `GET /api/doctors/me/availability`<br>`POST /api/doctors/me/availability`<br>[`DoctorController::updateAvailability`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/DoctorController.php#L170) | Elimina y recrea franjas horarias semanales en la tabla `DoctorAvailability`. |
| **D3** | **Monitoreo de Consultas Asignadas** | `GET /api/appointments`<br>`GET /api/appointments/{id}`<br>[`AppointmentController::index`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/AppointmentController.php#L24), `show` | Consulta `Appointment` filtrando por `doctor_id`, cargando paciente, pagos y respuestas médicas. |
| **D4** | **Atención en Sala de Consulta** | `POST /api/appointments/{id}/join`<br>`POST /api/video-calls/session`<br>`POST /api/chats/{id}/messages` | Lee y escribe en `Appointment`, `Message` y notificaciones en tiempo real. |
| **D5** | **Registro Clínico SOAP y Receta** | `POST /api/medical-records`<br>[`MedicalRecordController::store`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/MedicalRecordController.php#L57)<br>`POST /api/prescriptions`<br>[`PrescriptionController::store`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/PrescriptionController.php#L78) | Inserta en `MedicalRecord` (diagnósticos CIE, signos vitales) e inserta en `Prescription` (medicamentos JSON, token único `qr_secret`). |
| **D6** | **Finalización de la Consulta** | `POST /api/appointments/{id}/finalize`<br>[`AppointmentController::finalize`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/AppointmentController.php#L282) | Transiciona estado en `Appointment` a `completed`, calcula desglose financiero (`price_usd`, `doctor_earnings_usd`, `platform_fee_amount_usd`) y marca `doctor_payment_status='pending'`. |
| **D7** | **Billetera y Solicitud de Retiro** | `GET /api/wallet/balance`<br>`POST /api/wallet/request-withdrawal`<br>[`WalletController`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/WalletController.php#L23-L100) | Suma honorarios pendientes en `Appointment`, crea registro en `WithdrawalRequest` y actualiza citas a `doctor_payment_status='requested'`. |
| **D8** | **Cierre de Sesión** | `POST /api/auth/logout`<br>[`AuthController::logout`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/AuthController.php#L125) | Destruye el token activo en `personal_access_tokens`. |

---

### 2.4. Flujo del Rol Administrador (`type = 'admin'`)

| Paso | Acción del Administrador | Rutas y Controladores Involucrados | Modelos de BD Afectados |
| :--- | :--- | :--- | :--- |
| **A1** | **Monitoreo Global de Plataforma** | `GET /api/admin/stats`<br>[`AdminController::stats`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/AdminController.php#L15) | Agregaciones de conteo sobre `User` (médicos totales, pendientes, pacientes) y `Specialty`. |
| **A2** | **Verificación y Auditoría Médica** | `GET /api/admin/doctors`<br>`POST /api/admin/doctors/{doctor}/verify`<br>[`AdminController::verifyDoctor`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/AdminController.php#L31) | Actualiza `User`: `is_verified=true`, `verified_at=now()`, `verified_by=admin_id`. |
| **A3** | **Auditoría de Pagos de Pacientes** | `GET /api/admin/payments`<br>`POST /api/payments/{id}/verify`<br>[`PaymentController::adminPayments`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/PaymentController.php#L273), `verify` | Inspecciona comprobante físico, cambia estado de `Payment` a `completed`, y actualiza `Appointment` a `confirmed`. |
| **A4** | **Aprobación de Retiros a Médicos** | `GET /api/admin/wallet-requests`<br>`POST /api/admin/wallet-requests/{id}/approve`<br>[`WalletController::approveRequest`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/WalletController.php#L120) | Valida comprobante de liquidación bancaria, marca `WithdrawalRequest` como `completed` y citas asociadas como `paid`. |
| **A5** | **Gobierno de Catálogos y Usuarios** | `CRUD /api/admin/specialties`<br>`CRUD /api/admin/banks`<br>`POST /api/admin/users/{user}/block`<br>`DELETE /api/admin/users/{user}` | Mutaciones directas sobre `Specialty`, `Bank` y `User` (con salvaguarda para no bloquear al único admin). |
| **A6** | **Configuración de Variables Globales** | `GET /api/admin/settings`<br>`POST /api/admin/settings` ([`routes/api.php`](file:///c:/laragon/www/telemedicina/routes/api.php#L201-L212)) | Lectura y actualización key-value sobre el modelo `Setting` (ej. porcentaje de comisión). |
| **A7** | **Cierre de Sesión** | `POST /api/auth/logout`<br>[`AuthController::logout`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/AuthController.php#L125) | Revoca el token en `personal_access_tokens`. |

---

## 3. ARQUITECTURA DETECTADA

### 3.1. Patrón Arquitectónico
- **Monolito Híbrido SPA + API REST**:
  - **Backend**: Laravel 11 estructurado en controladores orientados a acciones API JSON sin renderizado de plantillas Blade para el negocio.
  - **Autenticación**: Laravel Sanctum mediante tokens de acceso personal en cabecera `Authorization: Bearer <token>` ([`bootstrap/app.php`](file:///c:/laragon/www/telemedicina/bootstrap/app.php#L16)).
  - **Frontend**: Aplicación en React 19 + TypeScript integrada en el mismo repositorio dentro de `resources/js/`, compilada con Vite 5 y servida a través de una ruta catch-all en Blade ([`routes/web.php`](file:///c:/laragon/www/telemedicina/routes/web.php#L5-L7)).
  - **Consumo de Datos**: Cliente HTTP Axios con interceptores de token ([`resources/js/lib/api.ts`](file:///c:/laragon/www/telemedicina/resources/js/lib/api.ts)), Zustand para estados globales y TanStack Query para caché de servidor.

### 3.2. Paquetes y Componentes Clave

```
[composer.json]
├── php: ^8.2
├── laravel/framework: ^11.0
├── laravel/sanctum: ^4.0
├── predis/predis: ^2.2
└── spatie/laravel-ignition (dev)

[package.json]
├── react / react-dom: ^19.2.4
├── react-router-dom: ^7.13.1
├── @tanstack/react-query: ^5.90.21
├── zustand: ^5.0.11
├── tailwindcss: ^3.4.1
├── @radix-ui/* (componentes headless accesibles)
├── firebase: ^12.10.0 (FCM Push Notifications)
├── socket.io-client: ^4.8.3
└── qrcode.react: ^4.2.0
```

### 3.3. Estructura de Carpetas Relevante

```
c:\laragon\www\telemedicina\
├── app\
│   ├── Http\
│   │   ├── Controllers\         # 17 controladores que concentran validación y persistencia
│   │   │   ├── AdminController.php
│   │   │   ├── AppointmentController.php
│   │   │   ├── AuthController.php
│   │   │   ├── DoctorController.php
│   │   │   ├── MedicalRecordController.php
│   │   │   ├── PatientController.php
│   │   │   ├── PaymentController.php
│   │   │   ├── PrescriptionController.php
│   │   │   ├── VideoCallController.php
│   │   │   └── WalletController.php
│   │   └── Middleware\
│   │       └── AdminMiddleware.php  # Verificación estricta de tipo 'admin'
│   ├── Models\                  # 20 modelos Eloquent (User, Appointment, Payment, etc.)
│   └── Services\                # Servicios auxiliares de dominio
│       ├── BcvService.php       # Scraping y cálculo de divisas oficiales
│       ├── MppsValidationService.php # Lógica de verificación médica
│       └── Notifications\       # Canales multicanal (Email, Push, WhatsApp)
├── database\
│   ├── migrations\              # 41 migraciones evolutivas
│   └── seeders\                 # Semillas iniciales (Admin, Bancos, Especialidades)
├── resources\
│   └── js\
│       ├── components\          # Primitivas UI y componentes modulares
│       ├── contexts\            # Contextos React (Notificaciones)
│       ├── lib\                 # Cliente API Axios y helpers de autenticación
│       ├── pages\               # Vistas desacopladas por rol (/admin, /doctor, /patient)
│       └── router.tsx           # Definición centralizada de rutas frontend
└── routes\
    ├── api.php                  # Todas las rutas REST protegidas con auth:sanctum y admin
    └── web.php                  # Punto de entrada catch-all hacia la vista Blade
```

### 3.4. Mecanismo de Control de Acceso (RBAC) Detectado
1. **Rutas Administrativas**: Protegidas en bloque a nivel de enrutador mediante el middleware alias `'admin'` ([`AdminMiddleware`](file:///c:/laragon/www/telemedicina/app/Http/Middleware/AdminMiddleware.php#L18)):
   ```php
   Route::middleware('admin')->prefix('admin')->group(...)
   ```
2. **Rutas de Paciente y Doctor**: No cuentan con un middleware de rol a nivel de ruta en `routes/api.php`; la autorización se evalúa manualmente dentro de los métodos de cada controlador mediante comprobaciones condicionales como `$user->isPatient()` o `$user->isDoctor()`, o mediante comparación de claves foráneas (`$appointment->patient_id !== $user->id`).
