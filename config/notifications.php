<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Queue Connection
    |--------------------------------------------------------------------------
    |
    | Conexión de queue a usar para procesar notificaciones
    |
    */
    'queue_connection' => env('NOTIFICATION_QUEUE_CONNECTION', 'redis'),

    /*
    |--------------------------------------------------------------------------
    | Rate Limit
    |--------------------------------------------------------------------------
    |
    | Límite de notificaciones por hora por usuario
    |
    */
    'rate_limit' => env('NOTIFICATION_RATE_LIMIT', 100),

    /*
    |--------------------------------------------------------------------------
    | Firebase Cloud Messaging
    |--------------------------------------------------------------------------
    |
    | Configuración para FCM push notifications
    |
    */
    'firebase' => [
        'api_key' => env('FIREBASE_API_KEY'),
        'project_id' => env('FIREBASE_PROJECT_ID'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Twilio (WhatsApp)
    |--------------------------------------------------------------------------
    |
    | Configuración para Twilio WhatsApp API
    |
    */
    'twilio' => [
        'sid' => env('TWILIO_SID'),
        'token' => env('TWILIO_TOKEN'),
        'whatsapp_number' => env('TWILIO_WHATSAPP_NUMBER'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Channels
    |--------------------------------------------------------------------------
    |
    | Canales por defecto si el usuario no tiene preferencias
    |
    */
    'default_channels' => ['email', 'push'],

    /*
    |--------------------------------------------------------------------------
    | Circuit Breaker
    |--------------------------------------------------------------------------
    |
    | Configuración del circuit breaker para APIs externas
    |
    */
    'circuit_breaker' => [
        'max_failures' => 5,
        'timeout_seconds' => 300, // 5 minutos
    ],
];
