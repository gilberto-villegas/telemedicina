# REPORTE DE EJECUCIÓN DE PRUEBAS DE SEGURIDAD Y ROLES

---

## 1. RESUMEN EJECUTIVO DE EJECUCIÓN

- **Entorno de Ejecución**: PHP 8.3.30 CLI, MySQL 8.4.3 Community Server, PHPUnit 11.5.46.
- **Suite Ejecutada**: [`tests/Feature/RoleSecurityAuditTest.php`](file:///c:/laragon/www/telemedicina/tests/Feature/RoleSecurityAuditTest.php).
- **Métricas Globales**:
  - Total de Tests: 10
  - Tests Aprobados (Pass): 8
  - Tests con Vulnerabilidad Confirmada (Incomplete/Warning): 2
  - Aserciones Ejecutadas: 33
  - Tiempo de Ejecución: 1.07 segundos

---

## 2. RESULTADOS DETALLADOS POR CASO DE PRUEBA

| Método de Prueba | Rol Auditado | Resultado | Estado HTTP | Observación Técnica |
| :--- | :--- | :--- | :--- | :--- |
| `test_admin_can_access_administrative_endpoints` | **Admin** | **PASS** | `200 OK` | `AdminMiddleware` permite el acceso irrestricto a `/api/admin/*` con token admin válido. |
| `test_admin_can_manage_users_and_verify_doctor` | **Admin** | **PASS** | `200 OK` | Modificación exitosa de banderas de verificación (`is_verified`) y bloqueo (`is_blocked`). |
| `test_admin_is_denied_from_patient_and_doctor_exclusive_actions` | **Admin** | **PASS** | `403 Forbidden` | Los controladores de citas (`AppointmentController::store`), billetera (`WalletController::balance`) e historial clínico (`MedicalRecordController::store`) bloquean correctamente al administrador si intenta usurpar roles de paciente o médico. |
| `test_doctor_can_access_his_own_modules` | **Doctor** | **PASS** | `200 OK` | Acceso garantizado a configuración horaria, liquidaciones de billetera y citas asignadas. |
| `test_doctor_is_denied_access_to_admin_endpoints` | **Doctor** | **PASS** | `403 Forbidden` | `AdminMiddleware` bloquea intentos de penetración del médico hacia rutas de configuración y auditoría administrativa. |
| `test_patient_can_access_his_own_profile_and_records` | **Paciente** | **PASS** | `200 OK` | Acceso correcto a datos demográficos y expedientes de salud del propio usuario autenticado. |
| `test_patient_is_denied_access_to_admin_and_doctor_endpoints` | **Paciente** | **PASS** | `403 Forbidden` | Bloqueo a panel administrativo, emisión no autorizada de recetas y balances de liquidación. |
| `test_patient_cannot_view_or_cancel_other_patients_appointment` | **Paciente** | **PASS** | `403 Forbidden` | `AppointmentController::show` y `cancel` validan correctamente la pertenencia de la cita mediante comparación manual de `patient_id`. |
| `test_audit_chat_messages_vulnerability_unauthorized_user_can_read_chat` | **Auditoría Seguridad** | **VULNERABLE** | `200 OK`<br>*(Esperado: 403)* | **Fuga de Datos Crítica**: Un paciente no relacionado con la cita pudo listar y leer en texto claro todos los mensajes privados entre otro paciente y su médico tratante. |
| `test_audit_medical_questionnaire_vulnerability_unauthorized_user_can_read_responses` | **Auditoría Seguridad** | **VULNERABLE** | `200 OK`<br>*(Esperado: 403)* | **Fuga de Datos Médicos Crítica (BOLA)**: Un paciente ajeno obtuvo el cuestionario médico confidencial (síntomas íntimos, diagnóstico previo) y la lista de adjuntos de otra cita clínica. |

---

## 3. DEBILIDADES Y FUGAS DE DATOS DEMOSTRADAS EMPÍRICAMENTE

### 3.1. Fuga de Mensajería Médica (BOLA / IDOR en `ChatController`)
- **Evidencia en Prueba**:
  Al invocar `GET /api/chats/{appointment_id}/messages` autenticado como el Paciente A (`$patient`), enviando el ID de una cita perteneciente al Paciente B (`$otherPatient`) y el Médico C (`$doctor`), la API devolvió:
  ```json
  [
    {
      "id": 1,
      "appointment_id": "...",
      "sender_id": "patient-b-uuid",
      "receiver_id": "doctor-c-uuid",
      "message": "Doctor, tengo resultados confidenciales de VIH positivos."
    }
  ]
  ```
- **Causa Raíz**:
  En [`ChatController::messages`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/ChatController.php#L126), el método realiza `Message::where('appointment_id', $id)->get()` de forma directa sin consultar la tabla `appointments` para verificar si `auth()->id()` coincide con `patient_id` o `doctor_id`.

### 3.2. Fuga de Respuestas Clínicas (BOLA / IDOR en `MedicalQuestionController`)
- **Evidencia en Prueba**:
  Al invocar `GET /api/appointments/{appointment_id}/responses` autenticado como un usuario ajeno a la consulta, el servidor respondió con código `200 OK`:
  ```json
  {
    "responses": [
      {
        "appointment_id": "...",
        "response_text": "Sí, sufro de hepatitis B crónica desde hace 5 años."
      }
    ],
    "attachments": []
  }
  ```
- **Causa Raíz**:
  En [`MedicalQuestionController::getResponses`](file:///c:/laragon/www/telemedicina/app/Http/Controllers/MedicalQuestionController.php#L95-L102), no existe ninguna instrucción que compare el usuario de la sesión (`$request->user()`) con el doctor o paciente vinculados al `Appointment`.

---

## 4. CONCLUSIÓN DE LA FASE DE PRUEBAS
El control de acceso perimetral administrativo (`AdminMiddleware`) funciona adecuadamente y aísla el panel de control contra intrusiones de médicos y pacientes. Sin embargo, el control de acceso horizontal entre usuarios del mismo rol o entre médicos y pacientes ajenos en recursos secundarios (mensajería interna, cuestionarios médicos y adjuntos de salud) presenta vulnerabilidades de exposición masiva de datos (BOLA / IDOR) debido a la ausencia de **Laravel Policies** y middlewares de autorización a nivel de ruta.
