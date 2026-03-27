<?php

namespace App\Services;

class MppsValidationService
{
    /**
     * Valida el formato de un número MPPS.
     * 
     * El formato esperado es "MPPS-XXXXX" o "XXXXX" donde X son dígitos.
     * Según estándares comunes en Venezuela, suele ser un prefijo seguido de 5 a 7 dígitos.
     *
     * @param string $mpps
     * @return bool
     */
    public function validateFormat(string $mpps): bool
    {
        // Limpiar espacios y convertir a mayúsculas
        $mpps = strtoupper(trim($mpps));

        // Patrón: Opcional "MPPS-" seguido de 5 a 8 dígitos
        // Algunos médicos antiguos tienen menos dígitos, otros más. 5-8 es un rango seguro.
        $pattern = '/^(MPPS-)?\d{5,8}$/';

        return (bool) preg_match($pattern, $mpps);
    }

    /**
     * (Opcional) Punto de entrada para validación externa real.
     * Por ahora solo valida el formato.
     *
     * @param string $mpps
     * @param string|null $documentId Cédula (opcional para cruce de datos)
     * @return array ['success' => bool, 'message' => string]
     */
    public function verifyWithMinistry(string $mpps, ?string $documentId = null): array
    {
        if (!$this->validateFormat($mpps)) {
            return [
                'success' => false,
                'message' => 'El formato del número MPPS no es válido (Ej: MPPS-123456).'
            ];
        }

        // TODO: En el futuro, si se obtiene acceso a una API o se implementa un scraper, iría aquí.
        // El portal oficial para consulta manual es: https://sistemas.sacs.gob.ve/consultas/prfsnal_salud
        // Dado el estado actual del ministerio, retornamos éxito si el formato es correcto,
        // pero indicamos que requiere verificación manual administrativa.
        
        return [
            'success' => true,
            'message' => 'Formato válido. Sujeto a verificación manual por el administrador.'
        ];
    }
}
