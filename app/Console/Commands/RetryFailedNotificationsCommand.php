<?php

namespace App\Console\Commands;

use App\Jobs\RetryFailedNotifications;
use Illuminate\Console\Command;

class RetryFailedNotificationsCommand extends Command
{
    protected $signature = 'notifications:retry-failed';
    protected $description = 'Reintentar notificaciones fallidas';

    public function handle(): int
    {
        $this->info('Reintentando notificaciones fallidas...');

        RetryFailedNotifications::dispatch();

        $this->info('Job de reintento despachado.');

        return Command::SUCCESS;
    }
}
