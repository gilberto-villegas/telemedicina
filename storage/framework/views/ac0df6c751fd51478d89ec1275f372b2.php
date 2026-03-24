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
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
        .info-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .label { font-weight: 700; color: #64748b; font-size: 11px; text-transform: uppercase; }
        .value { font-weight: 700; color: #1e293b; text-align: right; }
        .status-pill { display: inline-block; padding: 5px 15px; background: #dcfce7; color: #166534; border-radius: 20px; font-weight: 800; font-size: 11px; text-transform: uppercase; margin-bottom: 20px; }
        .button { display: inline-block; width: 100%; box-sizing: border-box; padding: 16px; background: #2563eb; color: white; text-align: center; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 14px; margin-top: 25px; text-transform: uppercase; }
        .step-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 15px; }
        .step-num { min-width: 24px; height: 24px; background: #2563eb; color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 12px; font-weight: 700; }
        .step-text { font-size: 13px; color: #475569; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Pago Registrado, <?php echo e($patient_name); ?>!</h1>
        </div>
        <div class="content">
            <div style="text-align: center;">
                <span class="status-pill">Estatus: Verificando Pago</span>
            </div>
            
            <p>Hemos recibido correctamente los datos de tu pago. Nuestro equipo administrativo está validando la transacción en este momento para activar tu cita.</p>

            <div class="info-card">
                <div class="info-row"><span class="label">Referencia</span><span class="value">#<?php echo e($reference); ?></span></div>
                <div class="info-row"><span class="label">Monto Pagado</span><span class="value">$<?php echo e($amount_usd); ?> USD</span></div>
                <div class="info-row"><span class="label">Conversión</span><span class="value">≈ <?php echo e($amount_ves); ?> VES</span></div>
                <div class="info-row"><span class="label">Doctor</span><span class="value">Dr. <?php echo e($doctor_name); ?></span></div>
                <div class="info-row"><span class="label">Cita</span><span class="value"><?php echo e($appointment_date); ?> a las <?php echo e($appointment_time); ?></span></div>
            </div>

            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #2563eb; margin-top: 30px;">Próximos Pasos:</h3>
            
            <div class="step-item">
                <div class="step-num">1</div>
                <div class="step-text"><strong>Validación Administrativa:</strong> Verificaremos tu comprobante en un plazo máximo de 1 hora (dentro de horario laboral).</div>
            </div>
            <div class="step-item">
                <div class="step-num">2</div>
                <div class="step-text"><strong>Confirmación Final:</strong> Recibirás un nuevo correo confirmando que tu cita ha sido <strong>Activada</strong>.</div>
            </div>
            <div class="step-item">
                <div class="step-num">3</div>
                <div class="step-text"><strong>Agenda tus síntomas:</strong> Si aún no lo has hecho, completa el cuestionario de síntomas en tu panel.</div>
            </div>

            <a href="<?php echo e($appointments_url); ?>" class="button">IR A MIS CITAS</a>
        </div>
        <div class="footer">
            &copy; <?php echo e(date('Y')); ?> Telemedicina. Soporte: soporte@telemedicina.test
        </div>
    </div>
</body>
</html>
<?php /**PATH C:\laragon\www\telemedicina\resources\views/emails/payment_registered_patient.blade.php ENDPATH**/ ?>