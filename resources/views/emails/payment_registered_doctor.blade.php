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
        .info-card { background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { padding: 10px 0; border-bottom: 1px solid #cbd5e1; }
        .info-table tr:last-child td { border-bottom: none; }
        .label { font-weight: 700; color: #475569; font-size: 12px; text-transform: uppercase; width: 40%; }
        .value { font-weight: 600; color: #1e293b; text-align: right; width: 60%; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-top: 10px; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .button { display: inline-block; padding: 14px 28px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; margin-top: 20px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
        .doctor-signature { border-top: 2px solid #2563eb; display: inline-block; padding-top: 10px; margin-top: 30px; font-weight: 800; color: #2563eb; font-size: 18px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Noticia de Pago Pendiente</h1>
        </div>
        <div class="content">
            <p>Estimado/a <strong>Dr. {{ $doctor_name }}</strong>,</p>
            <p>Se ha registrado un nuevo intento de pago para una cita médica. La misma se encuentra actualmente en <strong>estatus pendiente</strong> de validación administrativa.</p>
            
            <div class="info-card">
                <table class="info-table">
                    <tr><td class="label">Paciente</td><td class="value">{{ $patient_name }}</td></tr>
                    <tr><td class="label">Patología / Motivo</td><td class="value">{{ $reason }}</td></tr>
                    <tr><td class="label">Fecha de Cita</td><td class="value">{{ $appointment_date }}</td></tr>
                    <tr><td class="label">Hora de Cita</td><td class="value">{{ $appointment_time }}</td></tr>
                </table>
            </div>

            <p style="font-size: 14px; color: #64748b;">
                <strong>Nota Importante:</strong> El administrador está verificando el comprobante de pago. Una vez confirmado, la cita pasará a estatus "Programada" y usted podrá verla en su agenda principal. Si tiene alguna duda urgente, por favor comuníquese con el administrador del sistema.
            </p>

            <a href="{{ $login_url }}" class="button">IR AL PANEL MÉDICO</a>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} VilSalud. Todos los derechos reservados.
        </div>
    </div>
</body>
</html>
