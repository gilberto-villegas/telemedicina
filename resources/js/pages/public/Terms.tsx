import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, AlertTriangle, CreditCard, RefreshCw, Scale, Stethoscope } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800">
      {/* Header Público */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50 py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-blue-600 rounded-xl group-hover:scale-105 transition-transform">
              <img
                src="/assets/branding/logo.png"
                alt="VilSalud"
                className="h-6 w-6 object-contain invert brightness-0"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">VilSalud</span>
          </Link>

          <Button asChild variant="outline" size="sm" className="gap-2 rounded-xl">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl flex-1">
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full mb-3 border border-blue-100">
            <BookOpen className="h-4 w-4" />
            Condiciones de Servicio
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Términos y Condiciones de Uso
          </h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">
            Última actualización: {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200/70 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="p-2 bg-blue-100/60 text-blue-700 rounded-xl">
                <BookOpen className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">1. Objeto y Alcance del Servicio</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-600 space-y-2">
              <p>
                Los presentes Términos regulan el acceso y uso de la plataforma digital VilSalud, operada por <strong className="text-slate-800">[RAZÓN SOCIAL]</strong>. VilSalud constituye una herramienta tecnológica de intermediación que permite a los usuarios pacientes agendar, pagar y mantener teleconsultas y videoconsultas con médicos profesionales certificados de forma remota.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/70 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="p-2 bg-emerald-100/60 text-emerald-700 rounded-xl">
                <Scale className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">2. Uso Aceptable y Elegibilidad</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-600 space-y-2">
              <p>
                El usuario declara ser mayor de edad con plena capacidad legal para obligarse o actuar como representante legal o tutor debidamente autorizado de un menor de edad. El usuario se compromete a proporcionar información fidedigna, exacta y actualizada sobre su identidad y estado de salud. Queda expresamente prohibido el uso no autorizado de identidades ajenas o la falsificación de comprobantes de pago.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/70 shadow-sm border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="p-2 bg-amber-100/60 text-amber-700 rounded-xl">
                <Stethoscope className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">3. Responsabilidad Médica y Limitaciones de la Telemedicina</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-600 space-y-2">
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-amber-800 text-xs sm:text-sm font-medium flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" />
                <span>
                  <strong>ADVERTENCIA ANTE URGENCIAS:</strong> La plataforma VilSalud no es un servicio de emergencias médicas de riesgo vital inmediato. En caso de paro cardiorrespiratorio, traumatismo severo, dificultad respiratoria aguda o hemorragia masiva, acuda de inmediato a un centro hospitalario presencial de urgencias.
                </span>
              </div>
              <p>
                El médico especialista actúa con total independencia diagnóstica y terapéutica amparado en su número de matrícula y certificación profesional ante el Ministerio del Poder Popular para la Salud (MPPS). VilSalud provee la infraestructura tecnológica segura, sin interferir en el criterio clínico emitido por el facultativo.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/70 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="p-2 bg-purple-100/60 text-purple-700 rounded-xl">
                <CreditCard className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">4. Pagos, Tarifas y Facturación</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-600 space-y-2">
              <p>
                Las tarifas fijadas por consulta son establecidas de forma transparente por cada especialista. Los importes pueden visualizarse en dólares estadounidenses (USD) y abonarse en Bolívares (VES) calculados al tipo de cambio oficial publicado por el Banco Central de Venezuela (BCV) en el momento del registro de la cita. Toda cita queda condicionada a la validación satisfactoria del comprobante de pago reportado.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/70 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="p-2 bg-indigo-100/60 text-indigo-700 rounded-xl">
                <RefreshCw className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">5. Política de Cancelaciones y Reprogramaciones</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-600 space-y-2">
              <p>
                El paciente podrá solicitar la reprogramación o cancelación de una consulta con al menos <strong>2 horas de anticipación</strong> a la hora pautada a través de la plataforma. Si el médico cancela la consulta por razones de fuerza mayor o indisponibilidad imprevista, el paciente tendrá derecho a reprogramar sin costo o solicitar el reintegro total del saldo conforme a las políticas vigentes de la plataforma.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/70 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
                <Scale className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">6. Ley Aplicable y Jurisdicción</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-600 space-y-2">
              <p>
                Los presentes Términos y Condiciones se rigen e interpretan con arreglo a las leyes de la República Bolivariana de Venezuela. Cualquier controversia, discrepancia o reclamación dimanante del uso del sistema será sometida con renuncia a cualquier otro fuero a los tribunales competentes de <strong className="text-slate-800">[JURISDICCIÓN]</strong>.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer Público */}
      <footer className="bg-gray-900 text-gray-400 py-10 mt-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <img
                src="/assets/branding/logo.png"
                alt="VilSalud"
                className="h-5 w-5 object-contain invert brightness-0"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">VilSalud</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} VilSalud. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacidad</Link>
            <Link to="/terms" className="text-white font-medium transition-colors">Términos</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
