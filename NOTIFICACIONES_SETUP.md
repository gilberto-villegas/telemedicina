# Setup del Sistema de Notificaciones

## Instalación Backend

### 1. Ejecutar Migraciones

```bash
php artisan migrate
```

### 2. Ejecutar Seeder de Templates

```bash
php artisan db:seed --class=NotificationTemplateSeeder
```

### 3. Configurar Variables de Entorno

Agregar al archivo `.env`:

```env
# Notificaciones
NOTIFICATION_QUEUE_CONNECTION=redis
NOTIFICATION_RATE_LIMIT=100

# Firebase Cloud Messaging (Push)
FIREBASE_API_KEY=tu_api_key_aqui
FIREBASE_PROJECT_ID=tu_project_id_aqui

# Twilio (WhatsApp)
TWILIO_SID=tu_sid_aqui
TWILIO_TOKEN=tu_token_aqui
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Mail (ya configurado)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@vilsalud.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### 4. Configurar Queue Workers

Agregar al `crontab` o usar Supervisor:

```bash
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

O ejecutar manualmente:

```bash
php artisan queue:work redis --queue=default
```

### 5. Configurar Scheduled Commands

Agregar a `app/Console/Kernel.php` (si existe) o crear un scheduled task:

```php
// En routes/console.php o crear Kernel.php
Schedule::command('notifications:send-appointment-reminders')->hourly();
Schedule::command('notifications:retry-failed')->daily();
```

## Uso

### Enviar Notificación Manualmente

```php
use App\Models\User;
use App\Services\Notifications\NotificationService;

$user = User::find(1);
$notificationService = app(NotificationService::class);

$notificationService->send($user, 'appointment_reminder', [
    'title' => 'Recordatorio de Cita',
    'message' => 'Tu cita es mañana',
    'appointment_id' => '123',
]);
```

### Usar Helper del Modelo User

```php
$user->notify('payment_confirmation', [
    'amount_usd' => 50.00,
    'method' => 'zelle',
]);
```

### Verificar Notificaciones No Leídas

```php
$count = $user->unreadNotificationsCount();
$hasUnread = $user->hasUnreadNotifications();
```

## API Endpoints

- `GET /api/notifications` - Listar notificaciones
- `GET /api/notifications/unread-count` - Contador de no leídas
- `GET /api/notifications/{id}` - Detalle de notificación
- `PUT /api/notifications/{id}/read` - Marcar como leída
- `PUT /api/notifications/read-all` - Marcar todas como leídas
- `GET /api/notification-preferences` - Obtener preferencias
- `PUT /api/notification-preferences` - Actualizar preferencias
- `POST /api/notifications/test` - Enviar notificación de prueba (solo admin)

## Testing

```bash
# Enviar recordatorios de citas
php artisan notifications:send-appointment-reminders

# Reintentar notificaciones fallidas
php artisan notifications:retry-failed
```

## Notas Importantes

1. El sistema funciona aunque servicios externos (Twilio, FCM) estén caídos gracias al Circuit Breaker
2. Las notificaciones se procesan de forma asíncrona mediante queues
3. Los templates se cachean en Redis por 1 hora
4. Las horas silenciosas se respetan automáticamente (excepto notificaciones urgentes)
