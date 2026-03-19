<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Verificar si la columna existe y es bigint
        if (Schema::hasTable('sessions')) {
            $columnInfo = DB::select("SHOW COLUMNS FROM sessions WHERE Field = 'user_id'");
            
            if (!empty($columnInfo)) {
                $columnType = $columnInfo[0]->Type;
                
                // Si es bigint, cambiarla a UUID
                if (strpos(strtolower($columnType), 'bigint') !== false) {
                    // Eliminar foreign key si existe
                    try {
                        $fks = DB::select("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sessions' AND COLUMN_NAME = 'user_id' AND REFERENCED_TABLE_NAME = 'users'");
                        foreach ($fks as $fk) {
                            DB::statement("ALTER TABLE sessions DROP FOREIGN KEY {$fk->CONSTRAINT_NAME}");
                        }
                    } catch (\Exception $e) {
                        // Continuar si no hay foreign key
                    }
                    
                    // Cambiar tipo de columna
                    DB::statement("ALTER TABLE sessions MODIFY COLUMN user_id CHAR(36) NULL");
                    
                    // Recrear foreign key
                    DB::statement("ALTER TABLE sessions ADD CONSTRAINT sessions_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE");
                }
            }
        }
    }

    public function down(): void
    {
        // Revertir a bigint (solo si es necesario)
        if (Schema::hasTable('sessions')) {
            try {
                $fks = DB::select("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sessions' AND COLUMN_NAME = 'user_id' AND REFERENCED_TABLE_NAME = 'users'");
                foreach ($fks as $fk) {
                    DB::statement("ALTER TABLE sessions DROP FOREIGN KEY {$fk->CONSTRAINT_NAME}");
                }
                DB::statement("ALTER TABLE sessions MODIFY COLUMN user_id BIGINT UNSIGNED NULL");
            } catch (\Exception $e) {
                // Ignorar si falla
            }
        }
    }
};
