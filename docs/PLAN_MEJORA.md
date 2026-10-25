# PLAN DE MEJORA Y ESCALABILIDAD A PRODUCCIÓN MUNDIAL - VILSALUD TELEMEDICINA

---

## 1. SUGERENCIAS DE FUNCIONALIDAD (COMPETITIVIDAD Y MERCADO)

Para posicionar a VilSalud al nivel de plataformas internacionales líderes de telemedicina (como Teladoc, Kry o Doctolib), se recomienda incorporar las siguientes capacidades funcionales:

### 1.1. Pasarela de Pagos Automatizada con Webhooks e Idempotencia
- **Situación Actual**: Los pagos dependen de la carga manual de capturas de pantalla (`proof_url`) y posterior verificación visual humana por parte del administrador.
- **Propuesta**:
  - Integrar pasarelas automatizadas para el mercado venezolano con soporte de Pago Móvil C2P (Cobro de Comercio a Persona con token SMS) y transferencias inmediatas interbancarias vía API bancaria directa o agregadores autorizados.
  - Habilitar pasarelas internacionales (Stripe, Binance Pay, Zinli o PayPal) procesadas mediante **Webhooks asíncronos** protegidos por firma criptográfica HMAC y claves de idempotencia para evitar doble cobro.

### 1.2. Generación Automatizada de Recetas e Informes Médicos en PDF
- **Situación Actual**: Las recetas se consultan como objetos JSON en pantalla y el código QR solo retorna datos en texto plano.
- **Propuesta**:
  - Implementar un generador de documentos médicos estándar (utilizando `barryvdh/laravel-dompdf` o `spatie/browsershot`).
  - Cada receta debe emitirse en un PDF inviolable con membrete formal, firma digitalizada, sello del especialista, código QR con firma HMAC que permita a farmacias validar la autenticidad del documento sin autenticarse en el sistema, y fecha de caducidad farmacológica.

### 1.3. Servidor WebRTC / TURN Propio de Alta Disponibilidad
- **Situación Actual**: En [`VideoCallController::getTurnToken`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/VideoCallController.php#L41-L51), el endpoint retorna código `HTTP 501` ("Funcionalidad en desarrollo").
- **Propuesta**:
  - Desplegar una instancia dedicada de **Coturn** (o contratar servicios como Twilio Network Traversal / Metered TURN) para garantizar la negociación de videollamadas peer-to-peer en usuarios detrás de CGNAT o redes móviles simétricas (Digitel/Movistar/Cantv) con generación dinámica de credenciales TURN de duración limitada (HMAC ephemeral credentials).

### 1.4. Trazabilidad y Logs de Auditoría Inmutables (Audit Trail)
- **Situación Actual**: No existe registro de qué usuario leyó o descargó información médica.
- **Propuesta**:
  - Instalar y configurar `spatie/laravel-activitylog` para registrar de manera estricta e inmutable en base de datos: quién consultó la historia clínica, desde qué dirección IP, con qué User-Agent y en qué fecha/hora exacta, cumpliendo con los estándares de trazabilidad médica internacional.

### 1.5. Recordatorios y Alarmas Automáticas en Segundo Plano
- **Situación Actual**: El método [`AppointmentController::sendReminder`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/AppointmentController.php#L317) retorna `HTTP 501`.
- **Propuesta**:
  - Programar comandos en el Scheduler de Laravel (`routes/console.php`) ejecutados cada 10 minutos para despachar notificaciones automáticas vía WhatsApp y Email a las 24 horas y a los 60 minutos previos al inicio de la cita médica.

---

## 2. SUGERENCIAS DE ARQUITECTURA Y SEGURIDAD

### 2.1. Erradicación Inmediata de Vulnerabilidades BOLA / IDOR (Laravel Policies)
Crear la carpeta `app/Policies` y registrar Policies para cada recurso sensible:

1. **`ChatPolicy`**:
   - `viewMessages(User $user, Appointment $appointment)`:
     ```php
     return $appointment->patient_id === $user->id || $appointment->doctor_id === $user->id;
     ```
   - Aplicar en [`ChatController::messages`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/ChatController.php#L126) y [`ChatController::sendMessage`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/ChatController.php#L145):
     ```php
     $this->authorize('viewMessages', $appointment);
     ```
2. **`MedicalQuestionnairePolicy`**:
   - `viewResponses(User $user, Appointment $appointment)`:
     ```php
     return $appointment->patient_id === $user->id || $appointment->doctor_id === $user->id;
     ```
   - Aplicar en [`MedicalQuestionController::getResponses`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/MedicalQuestionController.php#L95) para bloquear la fuga de cuestionarios a terceros.
3. **`AppointmentPolicy`**, **`MedicalRecordPolicy`** y **`PrescriptionPolicy`**:
   - Centralizar todas las comprobaciones de permisos en Policies invocadas desde `$this->authorize(...)` en los controladores, eliminando los `if ($appointment->patient_id !== $user->id)` manuales.

### 2.2. Almacenamiento Seguro de Expedientes y Archivos Médicos
- **Migración a Disco Privado**: Cambiar en [`PatientController`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/PatientController.php#L104) y [`PaymentController`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/PaymentController.php#L197) el disco de almacenamiento de `'public'` a `'private'` o bucket S3 no público.
- **Acceso por URLs Temporales Firmadas**:
  - Implementar un endpoint dedicado protegido por Policies:
    ```
    GET /api/medical-records/{record}/attachments/{attachment}/download
    ```
  - Que genere una URL temporal firmada (`Storage::disk('private')->temporaryUrl($path, now()->addMinutes(15))`) o transmita el archivo vía `response()->streamDownload()`.

### 2.3. Adopción de FormRequests Especializados
Eliminar las validaciones inline de los controladores y moverlas a `app/Http/Requests`:
- `StoreAppointmentRequest`: Reglas de fecha futura, validación de franjas y tipos de cita.
- `CreatePaymentIntentRequest` y `ConfirmPaymentRequest`: Validación de métodos bancarios y formatos de comprobante.
- `StoreMedicalRecordRequest`: Validación de códigos diagnósticos CIE-10 y parámetros de signos vitales.
- `StorePrescriptionRequest`: Validación de medicamentos, posología y caducidad.

### 2.4. Resolución de Cuellos de Botella (N+1 Queries e Indexación)
1. **Optimización en `AppointmentController::index`**:
   - Modificar la consulta para precargar relaciones requeridas:
     ```php
     $query->with(['patient', 'doctor.specialty_ref', 'status'])
     ```
2. **Optimización en `ChatController::index`**:
   - Reemplazar las consultas individuales dentro del `map()` por subconsultas agregadas de Eloquent:
     ```php
     $appointments = Appointment::where(...)
         ->with(['doctor', 'patient', 'status'])
         ->withCount(['messages as unread_messages_count' => function ($q) use ($user) {
             $q->where('receiver_id', $user->id)->whereNull('read_at');
         }])
         ->get();
     ```
3. **Recreación de Índices Compuestos en Base de Datos**:
   - Crear una migración que agregue índices compuestos explícitos tras el refactor a claves foráneas:
     ```php
     $table->index(['doctor_id', 'status_id', 'start_time'], 'idx_appointments_doctor_status_time');
     $table->index(['patient_id', 'status_id', 'start_time'], 'idx_appointments_patient_status_time');
     ```

### 2.5. Desacoplamiento Asíncrono de Notificaciones (`ShouldQueue`)
- Implementar la interfaz `Illuminate\Contracts\Queue\ShouldQueue` en:
  - [`PaymentRegisteredDoctorNotification`](file:///c:/laragon/www/telemedicina/app/Notifications/PaymentRegisteredDoctorNotification.php)
  - [`PaymentRegisteredAdminNotification`](file:///c:/laragon/www/telemedicina/app/Notifications/PaymentRegisteredAdminNotification.php)
  - [`PaymentRegisteredPatientNotification`](file:///c:/laragon/www/telemedicina/app/Notifications/PaymentRegisteredPatientNotification.php)
  - [`PaymentVerifiedNotification`](file:///c:/laragon/www/telemedicina/app/Notifications/PaymentVerifiedNotification.php)
- Configurar Redis con **Laravel Horizon** para supervisar colas, reintentos exponenciales y alertas ante fallos de entrega.

### 2.6. Estandarización de Respuestas con API Resources (Transformers)
- Crear clases `JsonResource` para desacoplar los modelos Eloquent de la capa de transporte JSON:
  - `AppointmentResource`, `DoctorResource`, `MedicalRecordResource`, `PrescriptionResource`.
- Ocultar campos de auditoría interna, metadatos innecesarios y evitar la dependencia frágil de propiedades virtuales agregadas en `$appends`.

---

## 3. SUGERENCIAS DE TESTING Y ASEGURAMIENTO DE CALIDAD CONTINUO

1. **Pipeline de Integración Continua (CI/CD)**:
   - Configurar un workflow de GitHub Actions o GitLab CI que ejecute en cada commit o Pull Request:
     - Detección de estilo de código: `vendor/bin/pint --test`
     - Análisis estático: `vendor/bin/phpstan analyse --level=8`
     - Suite de pruebas de seguridad y regresión: `php artisan test`
2. **Pruebas de Concurrencia y Bloqueos Pesimistas (Race Conditions)**:
   - Crear pruebas para simular dos pacientes intentando reservar el mismo horario (`slot`) al mismo milisegundo. Implementar `lockForUpdate()` en la transacción de reserva para garantizar que ninguna cita pueda duplicarse.
3. **Pruebas de Billetera y Cálculos Financieros**:
   - Tests unitarios exhaustivos para [`WalletController`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/WalletController.php) que validen el cálculo de porcentajes de comisión de plataforma (`platform_fee_percent`), retenciones, conversión a tasa BCV y actualización atómica del estado a `paid`.
4. **Pruebas de Cobertura de Mutación (Infection PHP)**:
   - Aplicar pruebas de mutación para comprobar que las Policies y aserciones de autorización no puedan eludirse si un desarrollador altera accidentalmente una condición booleana en el código.
