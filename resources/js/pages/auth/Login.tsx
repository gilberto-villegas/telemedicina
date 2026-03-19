import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Stethoscope, Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      navigate(`/dashboard/${response.user.type}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    'Consultas con médicos certificados MPPS',
    'Historial clínico digital seguro',
    'Disponible 24/7 desde cualquier lugar',
    'Pagos con Pago Móvil y transferencias',
  ];

  return (
    <div className="min-h-screen hero-gradient flex overflow-hidden">
      {/* Animated orbs */}
      <div className="absolute top-20 left-10 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-400/15 rounded-full blur-3xl animate-float delay-400 pointer-events-none" />

      {/* Left panel — branding & benefits (hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-14 relative z-10">
        <Link to="/" className="flex items-center gap-3 group w-fit">
          <div className="p-2.5 bg-blue-500 rounded-xl animate-pulse-glow group-hover:scale-105 transition-transform">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            Telemedicina <span className="text-blue-300">VE</span>
          </span>
        </Link>

        <div className="space-y-8">
          <div className="animate-fade-in-up">
            <h2 className="text-5xl font-black text-white leading-tight mb-4">
              Bienvenido<br />
              <span className="text-gradient">de vuelta</span>
            </h2>
            <p className="text-blue-200 text-lg leading-relaxed">
              Accede a tu panel de salud y conecta con tus médicos desde donde estés.
            </p>
          </div>

          <div className="space-y-4 animate-fade-in-up delay-200">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <div className="p-1 bg-blue-500/30 rounded-full">
                  <CheckCircle className="h-4 w-4 text-blue-300" />
                </div>
                <span className="text-blue-100 text-sm">{b}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 animate-fade-in-up delay-300">
            {[
              { num: '12K+', label: 'Pacientes' },
              { num: '350+', label: 'Médicos' },
              { num: '98%',  label: 'Satisfacción' },
            ].map(({ num, label }) => (
              <div key={label} className="glass-blue rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-white">{num}</div>
                <div className="text-xs text-blue-300">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-400 text-xs">
          © 2024 Telemedicina Venezuela. Todos los derechos reservados.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-xl">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Telemedicina VE</span>
            </Link>
          </div>

          <div className="glass rounded-3xl p-8 shadow-2xl animate-fade-in-up">
            <div className="mb-8">
              <h1 className="text-2xl font-black text-gray-900">Iniciar Sesión</h1>
              <p className="text-gray-500 mt-1 text-sm">
                Accede a tu cuenta de Telemedicina Venezuela
              </p>
            </div>

            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 rounded-xl border-gray-200 focus:border-blue-400 h-11"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contraseña
                  </label>
                  <Link to="/auth/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9 pr-9 rounded-xl border-gray-200 focus:border-blue-400 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 mt-2"
              >
                {loading ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Iniciando sesión...</>
                ) : (
                  <>Iniciar Sesión <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              ¿No tienes cuenta?{' '}
              <Link to="/auth/register" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
