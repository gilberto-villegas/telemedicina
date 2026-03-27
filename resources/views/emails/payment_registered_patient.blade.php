<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
        .header { background: #2563eb; padding: 40px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
        .content { padding: 40px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }
        .info-card { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px dashed #cbd5e1; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .info-table tr:last-child td { border-bottom: none; }
        .label { font-weight: 700; color: #64748b; font-size: 11px; text-transform: uppercase; width: 40%; }
        .value { font-weight: 700; color: #1e293b; text-align: right; width: 60%; }
        .status-pill { display: inline-block; padding: 5px 15px; background: #dcfce7; color: #166534; border-radius: 20px; font-weight: 800; font-size: 11px; text-transform: uppercase; margin-bottom: 20px; }
        .button { display: inline-block; width: 100%; box-sizing: border-box; padding: 16px; background: #2563eb; color: white; text-align: center; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 14px; margin-top: 25px; text-transform: uppercase; }
        .step-table { width: 100%; margin-top: 15px; }
        .step-table td { vertical-align: top; padding-bottom: 15px; }
        .step-num { width: 24px; height: 24px; background: #2563eb; color: #ffffff; border-radius: 50%; font-size: 12px; font-weight: 700; text-align: center; line-height: 24px; display: block; }
        .step-text { padding-left: 12px; font-size: 13px; color: #475569; line-height: 1.4; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Pago Registrado, {{ $patient_name }}!</h1>
        </div>
        <div class="content">
            <div style="text-align: center;">
                <span class="status-pill">Estatus: Verificando Pago</span>
            </div>
            
            <p>Hemos recibido correctamente los datos de tu pago. Nuestro equipo administrativo está validando la transacción en este momento para activar tu cita.</p>

            <div class="info-card">
                <table class="info-table">
                    <tr><td class="label">Referencia</td><td class="value">#{{ $reference }}</td></tr>
                    <tr><td class="label">Monto Pagado</td><td class="value">${{ $amount_usd }} USD</td></tr>
                    <tr><td class="label">Conversión</td><td class="value">≈ {{ $amount_ves }} VES</td></tr>
                    <tr><td class="label">Doctor</td><td class="value">Dr. {{ $doctor_name }}</td></tr>
                    <tr><td class="label">Cita</td><td class="value">{{ $appointment_date }} a las {{ $appointment_time }}</td></tr>
                </table>
            </div>

            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #2563eb; margin-top: 30px;">Próximos Pasos:</h3>
            
            <table class="step-table">
                <tr>
                    <td><div class="step-num">1</div></td>
                    <td class="step-text"><strong>Validación Administrativa:</strong> Verificaremos tu comprobante en un plazo máximo de 1 hora (dentro de horario laboral).</td>
                </tr>
                <tr>
                    <td><div class="step-num">2</div></td>
                    <td class="step-text"><strong>Confirmación Final:</strong> Recibirás un nuevo correo confirmando que tu cita ha sido <strong>Activada</strong>.</td>
                </tr>
                <tr>
                    <td><div class="step-num">3</div></td>
                    <td class="step-text"><strong>Agenda tus síntomas:</strong> Si aún no lo has hecho, completa el cuestionario de síntomas en tu panel.</td>
                </tr>
            </table>

            <a href="{{ $appointments_url }}" class="button">IR A MIS CITAS</a>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} VilSalud. Soporte: soporte@telemedicina.test
        </div>
    </div>
</body>
</html>
