import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Send, Info, MessageSquareText, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Mensaje de contacto recibido (modo demo):', formData);
    setSubmitted(true);
  };

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
      <main className="container mx-auto px-6 py-12 max-w-5xl flex-1">
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full mb-3 border border-blue-100">
            <MessageSquareText className="h-4 w-4" />
            Atención al Usuario
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Contáctanos
          </h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">
            Estamos a tu disposición para atender inquietudes, soporte técnico e información médica institucional.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8 items-start">
          {/* Columna Izquierda: Información de Contacto */}
          <div className="md:col-span-2 space-y-4">
            <Card className="rounded-2xl border-slate-200/70 shadow-sm bg-gradient-to-br from-blue-900 to-indigo-950 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-white font-bold">Información Directa</CardTitle>
                <CardDescription className="text-slate-300 text-xs">
                  Canales oficiales de atención al paciente y especialistas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 text-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/10 rounded-xl mt-0.5">
                    <Mail className="h-4 w-4 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Correo Electrónico</p>
                    <a href="mailto:[EMAIL CONTACTO]" className="hover:underline text-white font-medium">
                      [EMAIL CONTACTO]
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/10 rounded-xl mt-0.5">
                    <Phone className="h-4 w-4 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Teléfono / WhatsApp</p>
                    <p className="font-medium text-white">[TELÉFONO]</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/10 rounded-xl mt-0.5">
                    <MapPin className="h-4 w-4 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Sede Institucional</p>
                    <p className="text-slate-200 leading-snug">
                      [RAZÓN SOCIAL]<br />
                      [DIRECCIÓN]
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Info className="h-4 w-4 text-amber-600 flex-shrink-0" />
                Horario de Atención Soporte
              </p>
              <p className="text-amber-800 leading-relaxed pl-5">
                Lunes a Viernes de 8:00 AM a 6:00 PM. Las videoconsultas médicas están disponibles según la agenda de cada especialista las 24 horas.
              </p>
            </div>
          </div>

          {/* Columna Derecha: Formulario de Contacto */}
          <div className="md:col-span-3">
            <Card className="rounded-2xl border-slate-200/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Envíanos un mensaje</CardTitle>
                <CardDescription>
                  Completa los siguientes campos y nuestro equipo responderá a la brevedad.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Nota visible exigida */}
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5 text-blue-800 text-xs">
                  <Info className="h-4 w-4 flex-shrink-0 text-blue-600" />
                  <span>
                    <strong>Aviso:</strong> Formulario en modo demostración, se habilitará próximamente.
                  </span>
                </div>

                {submitted ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">¡Mensaje registrado!</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                      Hemos recibido tu información en la consola de demostración. Gracias por comunicarte con VilSalud.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', email: '', message: '' });
                      }}
                      className="rounded-xl mt-2"
                    >
                      Enviar otro mensaje
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Nombre Completo
                      </label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Ej. Juan Pérez"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Correo Electrónico
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="message" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Mensaje o Consulta
                      </label>
                      <Textarea
                        id="message"
                        rows={4}
                        placeholder="Escribe tu consulta o requerimiento aquí..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        className="rounded-xl"
                      />
                    </div>

                    <Button type="submit" className="w-full gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                      <Send className="h-4 w-4" />
                      Enviar Mensaje
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
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
            <Link to="/terms" className="hover:text-white transition-colors">Términos</Link>
            <Link to="/contact" className="text-white font-medium transition-colors">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
