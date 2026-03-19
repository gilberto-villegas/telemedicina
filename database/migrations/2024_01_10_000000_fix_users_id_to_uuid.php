<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Verificar el tipo de columna actual
        $columnInfo = DB::select("SHOW COLUMNS FROM users WHERE Field = 'id'");
        
        if (!empty($columnInfo)) {
            $columnType = $columnInfo[0]->Type;
            
            // Si es bigint, necesitamos cambiarla a UUID
            if (strpos(strtolower($columnType), 'bigint') !== false || strpos(strtolower($columnType), 'int') !== false) {
                // Solución más simple: eliminar y recrear la tabla
                // PERO primero verificamos si hay datos importantes
                $userCount = DB::table('users')->count();
                
                if ($userCount === 0) {
                    // No hay datos, podemos recrear la tabla fácilmente
                    // Primero eliminamos todas las claves foráneas que referencian a users
                    $this->dropForeignKeysReferencingUsers();
                    
                    // Ahora podemos eliminar y recrear la tabla
                    Schema::dropIfExists('users');
                    Schema::create('users', function (Blueprint $table) {
                        $table->uuid('id')->primary();
                        $table->uuid('uuid')->unique()->nullable();
                        $table->enum('type', ['patient', 'doctor', 'clinic_admin', 'pharmacy'])->index();
                        $table->string('email')->unique();
                        $table->string('phone');
                        $table->string('document_id', 20)->index();
                        $table->boolean('document_verified')->default(false);
                        $table->timestamp('email_verified_at')->nullable();
                        $table->string('password');
                        $table->rememberToken();
                        $table->date('birth_date')->nullable();
                        $table->enum('blood_type', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])->nullable();
                        $table->text('allergies')->nullable();
                        $table->string('mpps_number', 50)->nullable();
                        $table->string('specialty', 100)->nullable();
                        $table->decimal('consultation_price_usd', 8, 2)->nullable();
                        $table->decimal('rating', 3, 2)->default(0.00);
                        $table->boolean('is_verified')->default(false);
                        $table->string('first_name')->nullable();
                        $table->string('last_name')->nullable();
                        $table->string('avatar_url', 500)->nullable();
                        $table->timestamps();
                        $table->index(['type', 'specialty'], 'idx_doctor_specialty');
                        $table->index(['email', 'phone'], 'idx_email_phone');
                    });
                    
                    // Recrear las claves foráneas
                    $this->recreateForeignKeys();
                } else {
                    // Hay datos, necesitamos una migración más cuidadosa
                    // Por ahora, solo mostramos un mensaje
                    throw new \Exception("La tabla users tiene datos. Ejecuta 'php artisan migrate:fresh' para recrear todas las tablas con UUIDs, o migra los datos manualmente.");
                }
            }
        }
    }

    private function dropForeignKeysReferencingUsers(): void
    {
        $tables = [
            'appointments' => ['appointments_patient_id_foreign', 'appointments_doctor_id_foreign'],
            'medical_records' => ['medical_records_patient_id_foreign'],
            'prescriptions' => ['prescriptions_patient_id_foreign', 'prescriptions_doctor_id_foreign'],
            'payments' => ['payments_user_id_foreign'],
            'doctor_availability' => ['doctor_availability_doctor_id_foreign'],
            'notifications' => ['notifications_user_id_foreign'],
            'user_notification_preferences' => ['user_notification_preferences_user_id_foreign'],
            'medical_attachments' => ['medical_attachments_user_id_foreign'],
        ];

        foreach ($tables as $table => $foreignKeys) {
            if (Schema::hasTable($table)) {
                foreach ($foreignKeys as $foreignKey) {
                    try {
                        Schema::table($table, function (Blueprint $table) use ($foreignKey) {
                            $table->dropForeign($foreignKey);
                        });
                    } catch (\Exception $e) {
                        // Intentar con el nombre alternativo que Laravel genera
                        try {
                            DB::statement("ALTER TABLE `{$table}` DROP FOREIGN KEY `{$foreignKey}`");
                        } catch (\Exception $e2) {
                            // Si no existe, continuar
                        }
                    }
                }
            }
        }
        
        // También intentar eliminar por patrón (por si los nombres son diferentes)
        $tablesWithForeignKeys = ['appointments', 'medical_records', 'prescriptions', 'payments', 
                                   'doctor_availability', 'notifications', 'user_notification_preferences', 
                                   'medical_attachments'];
        
        foreach ($tablesWithForeignKeys as $tableName) {
            if (Schema::hasTable($tableName)) {
                $foreignKeys = DB::select("
                    SELECT CONSTRAINT_NAME 
                    FROM information_schema.KEY_COLUMN_USAGE 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = '{$tableName}' 
                    AND REFERENCED_TABLE_NAME = 'users'
                ");
                
                foreach ($foreignKeys as $fk) {
                    try {
                        DB::statement("ALTER TABLE `{$tableName}` DROP FOREIGN KEY `{$fk->CONSTRAINT_NAME}`");
                    } catch (\Exception $e) {
                        // Continuar si falla
                    }
                }
            }
        }
    }

    private function convertForeignKeysToUuid(): void
    {
        // Convertir todas las columnas que referencian a users de bigint a uuid
        $tablesToConvert = [
            'appointments' => ['patient_id', 'doctor_id'],
            'medical_records' => ['patient_id'],
            'prescriptions' => ['patient_id', 'doctor_id'],
            'payments' => ['user_id'],
            'doctor_availability' => ['doctor_id'],
            'notifications' => ['user_id'],
            'user_notification_preferences' => ['user_id'],
            'medical_attachments' => ['user_id'],
        ];

        foreach ($tablesToConvert as $tableName => $columns) {
            if (Schema::hasTable($tableName)) {
                foreach ($columns as $columnName) {
                    try {
                        DB::statement("ALTER TABLE `{$tableName}` MODIFY COLUMN `{$columnName}` CHAR(36) NOT NULL");
                    } catch (\Exception $e) {
                        // Si falla, intentar con uuid type
                        try {
                            DB::statement("ALTER TABLE `{$tableName}` MODIFY COLUMN `{$columnName}` CHAR(36)");
                        } catch (\Exception $e2) {
                            // Continuar si falla
                        }
                    }
                }
            }
        }
    }

    private function recreateForeignKeys(): void
    {
        // Primero convertir las columnas a UUID
        $this->convertForeignKeysToUuid();
        
        // Recrear claves foráneas después de recrear users
        if (Schema::hasTable('appointments')) {
            Schema::table('appointments', function (Blueprint $table) {
                $table->foreign('patient_id')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
        
        if (Schema::hasTable('medical_records')) {
            Schema::table('medical_records', function (Blueprint $table) {
                $table->foreign('patient_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
        
        if (Schema::hasTable('prescriptions')) {
            Schema::table('prescriptions', function (Blueprint $table) {
                $table->foreign('patient_id')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
        
        if (Schema::hasTable('payments')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
        
        if (Schema::hasTable('doctor_availability')) {
            Schema::table('doctor_availability', function (Blueprint $table) {
                $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
        
        if (Schema::hasTable('notifications')) {
            Schema::table('notifications', function (Blueprint $table) {
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
        
        if (Schema::hasTable('user_notification_preferences')) {
            Schema::table('user_notification_preferences', function (Blueprint $table) {
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
        
        if (Schema::hasTable('medical_attachments')) {
            Schema::table('medical_attachments', function (Blueprint $table) {
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        // No revertir, ya que esto es una corrección
    }
};

