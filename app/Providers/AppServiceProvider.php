<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Gate;
use App\Models\Appointment;
use App\Models\MedicalAttachment;
use App\Policies\ChatPolicy;
use App\Policies\MedicalQuestionnairePolicy;
use App\Policies\MedicalAttachmentPolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Appointment::class, ChatPolicy::class);
        Gate::policy(MedicalAttachment::class, MedicalAttachmentPolicy::class);

        Gate::define('viewResponses', [MedicalQuestionnairePolicy::class, 'viewResponses']);
        Gate::define('submitResponses', [MedicalQuestionnairePolicy::class, 'submitResponses']);

        if (config('app.env') !== 'local' || str_contains(config('app.url'), 'ngrok') || str_starts_with(config('app.url'), 'https://')) {
            URL::forceScheme('https');
        }
    }
}
