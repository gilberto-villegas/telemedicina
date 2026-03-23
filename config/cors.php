<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'backend/api/*', 'backend/sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:8000,http://localhost:3000,http://telemedicina.test,https://telemedicina.test')),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
