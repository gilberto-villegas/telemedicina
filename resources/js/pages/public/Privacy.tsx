import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, FileText, UserCheck, Clock, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
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
            <ShieldCheck className="h-4 w-4" />
            Protección de Datos y Privacidad
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Política de Privacidad
          </h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">
            Última actualización: {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200/70 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="p-2 bg-blue-100/60 text-blue-700 rounded-xl">
                <FileText className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">1. Responsable del Tratamiento</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-600 space-y-2">
              <p>
                El responsable del tratamiento de los datos personales recabados a través de la plataforma VilSalud es{' '}
                <strong className="text-slate-800">[RAZÓN SOCIAL]</strong>, con RIF <strong className="text-slate-800">[RIF]</strong>, y domicilio legal en{' '}
                <strong className="text-slate-800">[DIRECCIÓN]</strong>.
              </p>
              <p>
                VilSalud garantiza la estricta confidencialidad de la información clínica y personal conforme a la legislación nacional aplicable y a los más altos estándares internacionales en salud digital.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/70 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="p-2 bg-indigo-100/60 text-indigo-700 rounded-xl">
                <UserCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">2. Datos Recogidos</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-600 space-y-2">
              <p>Para la correcta prestación de servicios de telemedicina, recopilamos las siguientes categorías de datos:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Datos identificativos y de contacto:</strong> Nombres, apellidos, número de cédula o documento de identidad, correo electrónico, teléfono y fecha de nacimiento.</li>
                <li><strong>Datos de salud (Especialmente protegidos):</strong> Motivo de consulta, historial médico, antecedentes, respuestas a cuestionarios de salud, signos vitales, notas clínicas SOAP y recetas médicas emitidas por profesionales certificados.</li>
                <li><strong>Datos transaccionales:</strong> Montos, moneda, tasa de cambio BCV aplicada y referencias de comprobantes de pago (sin almacenar datos de tarjetas).</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/70 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="p-2 bg-emerald-100/60 text-emerald-700 rounded-xl">
                <Lock className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">3. Finalidad del Tratamiento</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-600 space-y-2">
              <p>Tratamos sus datos para las siguientes finalidades esenciales:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Gestión de citas médicas y realización de teleconsultas y videollamadas con especialistas debidamente certificados ante el MPPS.</li>
                <li>Emisión, firma y verificación de récipes y recetas médicas electrónicas con validación QR.</li>
                <li>Gestión administrativa y liquidación de pagos conforme a normativas vigentes.</li>
                <li>Notificaciones esenciales sobre recordatorios de consulta y confirmación de servicios.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/70 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="p-2 bg-amber-100/60 text-amber-700 rounded-xl">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">4. Derechos del Usuario</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-600 space-y-2">
              <p>
                Los usuarios tienen derecho a acceder a su información personal e historial clínico digital, rectificar datos inexactos, solicitar la supresión de datos no sujetos a custodia obligatoria por ley médica, así como revocar el consentimiento en cualquier momento sin efectos retroactivos.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/70 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="p-2 bg-purple-100/60 text-purple-700 rounded-xl">
                <Clock className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">5. Conservación de los Datos</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-600 space-y-2">
              <p>
                Los datos clínicos e historiales de salud serán conservados durante los plazos mínimos exigidos por la legislación sanitaria nacional y regulaciones sobre historias médicas, garantizando en todo momento su archivo seguro bajo estrictos controles de acceso y cifrado.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/70 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="p-2 bg-sky-100/60 text-sky-700 rounded-xl">
                <Mail className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">6. Contacto del Delegado de Protección de Datos (DPO)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-600 space-y-2">
              <p>
                Para cualquier solicitud relativa a la privacidad de sus datos o el ejercicio de sus derechos, puede comunicarse directamente con nuestro Delegado de Protección de Datos escribiendo al correo:{' '}
                <a href="mailto:[EMAIL DPO]" className="text-blue-600 font-semibold underline underline-offset-2">
                  [EMAIL DPO]
                </a>.
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
            <Link to="/privacy" className="text-white font-medium transition-colors">Privacidad</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Términos</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
