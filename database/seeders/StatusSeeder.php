<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Status;

class StatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            // Appointment Statuses
            ['name' => 'scheduled', 'label' => 'Programada', 'type' => 'appointment', 'color' => 'blue'],
            ['name' => 'in_progress', 'label' => 'En Curso', 'type' => 'appointment', 'color' => 'indigo'],
            ['name' => 'completed', 'label' => 'Completada', 'type' => 'appointment', 'color' => 'green'],
            ['name' => 'cancelled', 'label' => 'Cancelada', 'type' => 'appointment', 'color' => 'red'],
            ['name' => 'no_show', 'label' => 'No Asistió', 'type' => 'appointment', 'color' => 'gray'],
            ['name' => 'pending_payment', 'label' => 'Pendiente de Pago', 'type' => 'appointment', 'color' => 'yellow'],
            ['name' => 'pending_verification', 'label' => 'Pendiente de Verificación', 'type' => 'appointment', 'color' => 'orange'],

            // Payment Statuses
            ['name' => 'payment_pending', 'label' => 'Pendiente', 'type' => 'payment', 'color' => 'gray'],
            ['name' => 'payment_processing', 'label' => 'Procesando', 'type' => 'payment', 'color' => 'blue'],
            ['name' => 'payment_completed', 'label' => 'Completado', 'type' => 'payment', 'color' => 'green'],
            ['name' => 'payment_failed', 'label' => 'Fallido', 'type' => 'payment', 'color' => 'red'],
            ['name' => 'payment_refunded', 'label' => 'Reembolsado', 'type' => 'payment', 'color' => 'purple'],

            // Prescription Statuses
            ['name' => 'prescription_issued', 'label' => 'Emitida', 'type' => 'prescription', 'color' => 'blue'],
            ['name' => 'prescription_filled', 'label' => 'Surtida', 'type' => 'prescription', 'color' => 'green'],
            ['name' => 'prescription_partially_filled', 'label' => 'Surtida Parcialmente', 'type' => 'prescription', 'color' => 'yellow'],
            ['name' => 'prescription_expired', 'label' => 'Vencida', 'type' => 'prescription', 'color' => 'red'],
        ];

        foreach ($statuses as $status) {
            Status::updateOrCreate(['name' => $status['name']], $status);
        }
    }
}
