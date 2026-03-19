<?php

namespace App\Console\Commands;

use App\Listeners\SendAppointmentReminderNotification;
use Illuminate\Console\Command;

class SendAppointmentReminders extends Command
{
    protected $signature = 'notifications:send-appointment-reminders';
    protected $description = 'Enviar recordatorios de citas (24h y 1h antes)';

    public function handle(): int
    {
        $this->info('Enviando recordatorios de citas...');

        SendAppointmentReminderNotification::sendReminders();

        $this->info('Recordatorios enviados exitosamente.');

        return Command::SUCCESS;
    }
}
