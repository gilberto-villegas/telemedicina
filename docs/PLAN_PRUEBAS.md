# PLAN DE PRUEBAS DE SEGURIDAD Y ROLES (RBAC) - VILSALUD TELEMEDICINA

---

## 1. CONFIGURACIÓN DEL ENTORNO DE PRUEBAS

Para evaluar de forma determinista y sin comprometer datos de producción, se configuró un entorno de pruebas automatizado sobre MySQL y PHPUnit 11 en Laravel.

### 1.1. Matriz de Roles Evaluados
1. **Rol A: Super Administrador (`type = 'admin'`)**:
   - Atributos clave: `is_verified = true`, `document_verified = true`, `is_blocked = false`.
   - Propósito: Control gubernamental de la plataforma, verificación de credenciales de especialistas, supervisión de ingresos y liquidaciones bancarias, administración de catálogos y bloqueo de cuentas.
2. **Rol B: Médico Especialista / Staff (`type = 'doctor'`)**:
   - Atributos clave: `is_verified = true`, `mpps_number`, `specialty`, honorarios en USD y datos de pago.
   - Propósito: Atención de videoconsultas, configuración de disponibilidad horaria semanal, consulta de balance y solicitud de retiros en billetera virtual, emisión de recetas y registros clínicos SOAP.
3. **Rol C: Paciente / Cliente (`type = 'patient'`)**:
   - Atributos clave: `is_verified = true`, datos personales básicos, antecedentes clínicos.
   - Propósito: Búsqueda de médicos, reserva de turnos, llenado de anamnesis pre-consulta, pago de consultas, asistencia a salas de teleconsulta y revisión de recetas y expedientes propios.

### 1.2. Factories y Semillas Utilizadas
- [`database/factories/UserFactory.php`](file:///c:/laragon/www/telemedicina/database/factories/UserFactory.php):
  - Estado base: Paciente (`patient`).
  - Estado `doctor()`: Especialista médico con MPPS verificado y tarifa fijada.
  - Estado `admin()`: Administrador global de plataforma.
- Semillas de catálogo cargadas en base de pruebas:
  - [`StatusSeeder`](file:///c:/laragon/www/telemedicina/database/seeders/StatusSeeder.php): Estados de citas y pagos (`pending_payment`, `scheduled`, `in_progress`, `completed`, `cancelled`).
  - [`SpecialtySeeder`](file:///c:/laragon/www/telemedicina/database/seeders/SpecialtySeeder.php) y [`BankSeeder`](file:///c:/laragon/www/telemedicina/database/seeders/BankSeeder.php).

---

## 2. ESPECIFICACIÓN DE CASOS DE PRUEBA

| ID | Rol Evaluado | Caso de Prueba / Endpoint | Comportamiento Esperado | Tipo de Aserción |
| :--- | :--- | :--- | :--- | :--- |
| **TC-ADM-01** | **Admin** | `GET /api/admin/stats`<br>`GET /api/admin/doctors`<br>`GET /api/admin/patients`<br>`GET /api/admin/settings` | Acceso concedido (200 OK) con estructura de datos válida. | `assertStatus(200)` |
| **TC-ADM-02** | **Admin** | `POST /api/admin/doctors/{id}/verify`<br>`POST /api/admin/users/{id}/block` | Acceso concedido (200 OK) y modificación efectiva en la persistencia del usuario. | `assertStatus(200)` + `assertTrue()` |
| **TC-ADM-03** | **Admin** | `POST /api/appointments`<br>`GET /api/wallet/balance`<br>`POST /api/medical-records` | Acceso denegado (403 Forbidden). Un administrador no debe usurpar flujos clínicos propios de médicos o pacientes. | `assertStatus(403)` |
| **TC-DOC-01** | **Doctor** | `GET /api/doctors/me/availability`<br>`GET /api/wallet/balance`<br>`GET /api/appointments` | Acceso concedido (200 OK) únicamente a sus recursos médicos propios. | `assertStatus(200)` |
| **TC-DOC-02** | **Doctor** | `GET /api/admin/stats`<br>`GET /api/admin/doctors`<br>`POST /api/admin/users/{id}/block`<br>`GET /api/admin/settings` | Acceso denegado (403 Forbidden) mediante `AdminMiddleware`. | `assertStatus(403)` |
| **TC-PAT-01** | **Paciente** | `GET /api/patients/me`<br>`GET /api/patients/me/medical-records` | Acceso concedido (200 OK) retornando datos exclusivamente suyos. | `assertStatus(200)` |
| **TC-PAT-02** | **Paciente** | `GET /api/admin/stats`<br>`GET /api/wallet/balance`<br>`POST /api/prescriptions` | Acceso denegado (403 Forbidden). Un paciente no puede emitir recetas ni ver finanzas. | `assertStatus(403)` |
| **TC-PAT-03** | **Paciente** | `GET /api/appointments/{id_ajeno}`<br>`PUT /api/appointments/{id_ajeno}/cancel` | Acceso denegado (403 Forbidden). Un paciente no puede consultar ni cancelar citas de terceros. | `assertStatus(403)` |
| **TC-SEC-01** | **Auditoría** | `GET /api/chats/{id_cita_ajena}/messages` | Detección de BOLA / IDOR: Un usuario ajeno a la cita intenta leer la conversación privada. Debería dar 403 Forbidden. | Prueba de penetración |
| **TC-SEC-02** | **Auditoría** | `GET /api/appointments/{id_cita_ajena}/responses` | Detección de BOLA / IDOR: Un usuario ajeno a la cita intenta leer el cuestionario de salud íntimo y adjuntos. Debería dar 403 Forbidden. | Prueba de penetración |

---

## 3. SUITE DE PRUEBAS AUTOMATIZADA
Implementada y versionada en el archivo:
[`tests/Feature/RoleSecurityAuditTest.php`](file:///c:/laragon/www/telemedicina/tests/Feature/RoleSecurityAuditTest.php)

Comando de ejecución:
```bash
php artisan test --filter=RoleSecurityAuditTest
```
