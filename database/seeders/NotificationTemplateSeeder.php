<?php

namespace Database\Seeders;

use App\Models\NotificationTemplate;
use Illuminate\Database\Seeder;

class NotificationTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'type' => 'appointment_reminder',
                'name' => 'Recordatorio de Cita',
                'subject' => 'Recordatorio: Cita con {{doctor_name}}',
                'body' => 'Hola {{user_name}}, tienes una cita programada con Dr. {{doctor_name}} el {{appointment_date}}.',
                'whatsapp_template' => 'Hola {{user_name}}, tienes una cita programada con Dr. {{doctor_name}} el {{appointment_date}}.',
                'push_title' => 'Recordatorio de Cita',
                'push_body' => 'Cita con Dr. {{doctor_name}} el {{appointment_date}}',
                'variables' => ['user_name', 'doctor_name', 'appointment_date', 'appointment_id'],
                'is_active' => true,
            ],
            [
                'type' => 'payment_confirmation',
                'name' => 'Confirmación de Pago',
                'subject' => 'Pago Confirmado - ${{amount_usd}} USD',
                'body' => 'Hola {{user_name}}, tu pago de ${{amount_usd}} USD ha sido confirmado exitosamente. Método: {{method}}.',
                'whatsapp_template' => 'Hola {{user_name}}, tu pago de ${{amount_usd}} USD ha sido confirmado. Método: {{method}}.',
                'push_title' => 'Pago Confirmado',
                'push_body' => 'Tu pago de ${{amount_usd}} USD ha sido confirmado',
                'variables' => ['user_name', 'amount_usd', 'amount_ves', 'method', 'payment_id'],
                'is_active' => true,
            ],
            [
                'type' => 'prescription_ready',
                'name' => 'Receta Despachada',
                'subject' => 'Tu Receta Está Lista',
                'body' => 'Hola {{user_name}}, tu receta ha sido despachada y está lista para retirar.',
                'whatsapp_template' => 'Hola {{user_name}}, tu receta ha sido despachada y está lista para retirar.',
                'push_title' => 'Receta Despachada',
                'push_body' => 'Tu receta está lista para retirar',
                'variables' => ['user_name', 'prescription_id', 'pharmacy_id'],
                'is_active' => true,
            ],
            [
                'type' => 'medical_record_created',
                'name' => 'Nuevo Registro Médico',
                'subject' => 'Nuevo Registro Médico Disponible',
                'body' => 'Hola {{user_name}}, se ha creado un nuevo registro médico de tu consulta del {{appointment_date}}.',
                'whatsapp_template' => 'Hola {{user_name}}, se ha creado un nuevo registro médico de tu consulta.',
                'push_title' => 'Nuevo Registro Médico',
                'push_body' => 'Se ha creado un nuevo registro médico de tu consulta',
                'variables' => ['user_name', 'medical_record_id', 'appointment_id', 'appointment_date'],
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            NotificationTemplate::updateOrCreate(
                ['type' => $template['type']],
                $template
            );
        }
    }
}
