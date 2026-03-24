<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class BcvService
{
    /**
     * Obtener la tasa de cambio oficial del BCV (USD a VES)
     */
    public function getExchangeRate(bool $forceRefresh = false): float
    {
        if ($forceRefresh) {
            Cache::forget('bcv_exchange_rate');
        }

        return Cache::remember('bcv_exchange_rate', 3600, function () {
            try {
                // El BCV a veces bloquea agentes de usuario por defecto de Guzzle/Laravel
                $response = Http::withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                    'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language' => 'es-ES,es;q=0.9,en;q=0.8',
                ])
                ->withoutVerifying()
                ->timeout(12)
                ->get('https://www.bcv.org.ve/');

                if ($response->successful()) {
                    $html = $response->body();
                    
                    // Regex mejorada para encontrar el valor del dólar en el sitio del BCV
                    // Estructura: <div id="dolar"> ... <strong> 459,45250000 </strong> ... </div>
                    if (preg_match('/id="dolar".*?<strong>\s*([\d,.]+)\s*<\/strong>/s', $html, $matches)) {
                        $rateStr = str_replace(',', '.', trim($matches[1]));
                        $rate = (float) $rateStr;
                        
                        if ($rate > 1.0) { // Validación básica
                            Log::info("Tasa BCV obtenida exitosamente: {$rate}");
                            return $rate;
                        }
                    } else {
                        Log::warning("No se pudo parsear el valor del dólar desde el HTML del BCV.");
                    }
                } else {
                    Log::error("Error en respuesta BCV: " . $response->status());
                }
            } catch (\Exception $e) {
                Log::error("Error conectando con el BCV: " . $e->getMessage());
            }

            // Fallback en caso de error extremo
            return (float) (env('BCV_FALLBACK_RATE', 450.00));
        });
    }
}
