<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Contraseña - VilSalud</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            color: #1e293b;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            padding: 40px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 10px 0 0;
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.02em;
        }
        .content {
            padding: 40px;
            line-height: 1.6;
        }
        .content p {
            margin-bottom: 20px;
            font-size: 16px;
            color: #475569;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            background: #2563eb;
            color: #ffffff !important;
            padding: 16px 32px;
            border-radius: 14px;
            text-decoration: none;
            font-weight: 700;
            font-size: 16px;
            display: inline-block;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
            transition: transform 0.2s;
        }
        .footer {
            padding: 30px;
            background: #f1f5f9;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
        }
        .divider {
            height: 1px;
            background: #e2e8f0;
            margin: 30px 0;
        }
        .warning {
            font-size: 13px;
            color: #94a3b8;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <svg style="height: 48px; width: 48px; fill: white;" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-8.5 15.5l-3.5-3.5 1.4-1.4 2.1 2.1 4.6-4.6 1.4 1.4-6 6z"/>
            </svg>
            <h1>VilSalud VE</h1>
        </div>
        <div class="content">
            <h2 style="color: #0f172a; font-size: 22px; font-weight: 700;">¿Olvidaste tu contraseña?</h2>
            <p>Hola,</p>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en nuestra plataforma de telemedicina.</p>
            <div class="button-container">
                <a href="{{ $url }}" class="button">Restablecer Contraseña</a>
            </div>
            <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura. El enlace expirará en 60 minutos.</p>
            <div class="divider"></div>
            <p class="warning">
                Si tienes problemas para hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:<br>
                <span style="word-break: break-all; color: #2563eb;">{{ $url }}</span>
            </p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} VilSalud. Todos los derechos reservados.</p>
            <p>Este correo fue enviado automáticamente por nuestro sistema de seguridad.</p>
        </div>
    </div>
</body>
</html>
