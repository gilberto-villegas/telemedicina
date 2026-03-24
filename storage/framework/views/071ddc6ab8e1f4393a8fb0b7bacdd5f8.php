<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
        .header { background: #1e293b; padding: 40px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }
        .content { padding: 40px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 11px; border-top: 1px solid #e2e8f0; }
        .info-card { background: #ffffff; border-radius: 12px; padding: 20px; margin: 20px 0; border: 2px solid #f1f5f9; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 8px; }
        .info-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .label { font-weight: 700; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
        .value { font-weight: 800; color: #0f172a; text-align: right; font-size: 14px; }
        .financial-strip { background: #2563eb; color: white; border-radius: 8px; padding: 15px; margin-top: 10px; text-align: center; }
        .financial-val { display: block; font-size: 22px; font-weight: 900; }
        .financial-sub { font-size: 10px; font-weight: 700; opacity: 0.8; text-transform: uppercase; }
        .proof-container { margin-top: 30px; border-radius: 12px; overflow: hidden; border: 2px solid #e2e8f0; position: relative; }
        .proof-container img { width: 100%; display: block; }
        .button { display: inline-block; width: 100%; padding: 16px; background: #2563eb; color: white; text-align: center; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 14px; margin-top: 25px; text-transform: uppercase; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3); }
        .highlight-box { border-left: 4px solid #2563eb; background: #f8fafc; padding: 15px; margin: 20px 0; font-size: 13px; font-weight: 600; color: #334155; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Nueva Solicitud de Validación de Pago</h1>
        </div>
        <div class="content">
            <p>Se ha registrado un nuevo pago en la plataforma. Por favor, proceda a verificar los datos y el comprobante adjunto para activar la cita correspondiente.</p>
            
            <div class="highlight-box">
                DATOS DEL PACIENTE: <?php echo e($patient_name); ?> (<?php echo e($patient_document); ?>)<br/>
                MÉDICO ASIGNADO: Dr. <?php echo e($doctor_name); ?>

            </div>

            <div class="info-card">
                <div class="info-row">
                    <span class="label">Método de Pago</span>
                    <span class="value"><?php echo e($method); ?></span>
                </div>
                <div class="info-row">
                    <span class="label">Referencia #</span>
                    <span class="value"><?php echo e($reference); ?></span>
                </div>
                <div class="info-row">
                    <span class="label">Fecha del Pago</span>
                    <span class="value"><?php echo e($payment_date); ?></span>
                </div>
                <div class="info-row">
                    <span class="label">Teléfono Origen</span>
                    <span class="value"><?php echo e($payment_phone); ?></span>
                </div>
                <div class="info-row">
                    <span class="label">Tasa BCV del día</span>
                    <span class="value"><?php echo e($exchange_rate); ?> VES</span>
                </div>
            </div>

            <div class="financial-strip">
                <span class="financial-sub">Monto Total Recibido</span>
                <span class="financial-val">$<?php echo e($amount_usd); ?> USD</span>
                <span class="financial-sub">≈ <?php echo e($amount_ves); ?> VES</span>
            </div>

            <?php if($proof_url): ?>
            <p class="label" style="margin-top: 30px; display: block; text-align: center;">Comprobante Adjunto</p>
            <div class="proof-container">
                <a href="<?php echo e($proof_url); ?>" target="_blank">
                    <img src="<?php echo e($proof_url); ?>" alt="Comprobante de Pago" />
                </a>
            </div>
            <?php endif; ?>

            <a href="<?php echo e($admin_url); ?>" class="button">IR A VALIDACIÓN DE PAGOS</a>
        </div>
        <div class="footer">
            &copy; <?php echo e(date('Y')); ?> Telemedicina - Panel de Administración
        </div>
    </div>
</body>
</html>
<?php /**PATH C:\laragon\www\telemedicina\resources\views/emails/payment_registered_admin.blade.php ENDPATH**/ ?>