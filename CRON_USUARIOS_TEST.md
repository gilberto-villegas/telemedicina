# Cron para Crear Usuarios de Prueba

## Comando Artisan

Se ha creado el comando `users:create-test` que crea automáticamente:
- **1 Médico** (doctor@test.com)
- **1 Paciente** (paciente@test.com)

## Uso Manual

```bash
# Crear usuarios de prueba
php artisan users:create-test

# Forzar recreación si ya existen
php artisan users:create-test --force
```

## Credenciales de Prueba

### Médico
- **Email:** doctor@test.com
- **Contraseña:** password123
- **Especialidad:** Cardiología
- **Precio consulta:** $50 USD
- **Verificado:** Sí

### Paciente
- **Email:** paciente@test.com
- **Contraseña:** password123
- **Tipo de sangre:** O+
- **Verificado:** Sí

## Configurar Cron

### Opción 1: Cron del Sistema (Recomendado)

Editar el crontab:
```bash
crontab -e
```

Agregar una de estas opciones:

**Ejecutar diariamente a las 2 AM:**
```cron
0 2 * * * cd /var/www/html/Telemedicina/backend && php artisan users:create-test --force >> /dev/null 2>&1
```

**Ejecutar cada hora:**
```cron
0 * * * * cd /var/www/html/Telemedicina/backend && php artisan users:create-test --force >> /dev/null 2>&1
```

**Ejecutar cada vez que se inicie el servidor:**
```cron
@reboot cd /var/www/html/Telemedicina/backend && php artisan users:create-test --force >> /dev/null 2>&1
```

### Opción 2: Usar Laravel Scheduler

Agregar en `app/Console/Kernel.php` (si existe) o crear el archivo:

```php
<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // Crear usuarios de prueba diariamente a las 2 AM
        $schedule->command('users:create-test --force')
            ->dailyAt('02:00')
            ->withoutOverlapping();
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
    }
}
```

Luego agregar al crontab del sistema:
```cron
* * * * * cd /var/www/html/Telemedicina/backend && php artisan schedule:run >> /dev/null 2>&1
```

## Verificar que Funciona

```bash
# Verificar usuarios creados
php artisan tinker
>>> User::whereIn('email', ['doctor@test.com', 'paciente@test.com'])->get(['email', 'type', 'is_verified']);

# Probar login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@test.com","password":"password123"}'
```

## Notas

- El comando usa `--force` para recrear usuarios si ya existen
- Los usuarios se crean con email verificado y documentos verificados
- Las contraseñas son `password123` (cambiar en producción)
- Los UUIDs se generan automáticamente
- El comando es idempotente: puede ejecutarse múltiples veces

## Seguridad

⚠️ **IMPORTANTE:** Este comando es solo para desarrollo/testing. En producción:
- No programar este cron
- Usar seeders en su lugar
- Cambiar las contraseñas por defecto
- No usar emails predecibles
