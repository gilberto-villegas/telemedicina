import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import {
  Stethoscope, Loader2, Mail, Lock, Eye, EyeOff, ArrowRight,
  CheckCircle, Baby, Heart, Shield, Star,
} from 'lucide-react';

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

  const features = [
    { icon: Baby,        text: 'Atención Neonatal Especializada' },
    { icon: Heart,       text: 'Consultas con especialistas MPPS' },
    { icon: Shield,      text: 'Historial clínico digital y seguro' },
    { icon: CheckCircle, text: 'Disponible 24/7, desde donde estés' },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ── LEFT PANEL ── image, fix position so text in image doesn't get cut */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden">
        <img
          src="/images/login_bg.png"
          alt="Dra. Glennys Villegas - Neonatología"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '30% center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-slate-900/80 to-indigo-950/88" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-56 h-56 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full p-14">
          <Link to="/" className="flex items-center gap-3 group w-fit">
            <div className="p-2.5 bg-blue-500 rounded-xl group-hover:scale-105 transition-transform shadow-lg shadow-blue-500/30">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white drop-shadow-lg">
              VilSalud <span className="text-blue-300">VE</span>
            </span>
          </Link>

          <div className="space-y-8">
            {/* Doctor attribution badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white text-xs font-black uppercase tracking-widest">
                Dra. Glennys Villegas · Neonatología
              </span>
            </div>
            <div>
              <h2 className="text-5xl font-black text-white leading-tight mb-4" style={{textShadow:'0 2px 12px rgba(0,0,0,0.7)'}}>
                Salud en tus<br />
                <span className="text-blue-300">manos</span>
              </h2>
              <p className="text-white text-lg leading-relaxed max-w-sm font-medium" style={{textShadow:'0 1px 8px rgba(0,0,0,0.8)'}}>
                Plataforma oficial de telemedicina. Conecta con especialistas desde cualquier parte de Venezuela.
              </p>
            </div>
            <div className="space-y-3">
              {features.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-500/50 backdrop-blur-sm rounded-full border border-blue-400/50">
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-white text-sm font-semibold" style={{textShadow:'0 1px 6px rgba(0,0,0,0.8)'}}>{text}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { num: '12K+', label: 'Pacientes' },
                { num: '350+', label: 'Médicos' },
                { num: '98%',  label: 'Satisfacción' },
              ].map(({ num, label }) => (
                <div key={label} className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center border border-white/30">
                  <div className="text-2xl font-black text-white" style={{textShadow:'0 2px 8px rgba(0,0,0,0.6)'}}>{num}</div>
                  <div className="text-xs text-blue-200 font-bold">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-blue-400/70 text-xs">
            © 2024 VilSalud. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── premium patterned background */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #1a2744 40%, #1e1f3a 100%)',
      }}>

        {/* SVG dot grid pattern overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, #3b82f620 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        {/* Large decorative medical cross */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.035] pointer-events-none select-none"
          style={{ fontSize: '420px', lineHeight: 1, color: '#2563eb', fontWeight: 900 }}>
          +
        </div>

        {/* Gradient accent orbs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #bfdbfe80, transparent 70%)' }} />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #c7d2fe70, transparent 70%)' }} />
        <div className="absolute top-1/3 right-0 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #ddd6fe50, transparent 70%)' }} />

        {/* Top accent stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 flex-shrink-0" />

        {/* Mobile logo */}
        <div className="lg:hidden flex justify-center pt-10 pb-4 relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-bold text-slate-800">VilSalud</span>
          </Link>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-8 py-10 relative z-10">
          <div className="w-full max-w-[400px]">

            {/* Form card with glass effect */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-100/80 border border-white">

              {/* Heading */}
              <div className="mb-7 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Portal Médico Seguro</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 leading-tight">Bienvenido de vuelta</h1>
                <p className="text-slate-400 mt-1.5 text-sm">Accede a tu cuenta de VilSalud</p>
              </div>

              {error && (
                <div className="mb-5 bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-2xl text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 bg-blue-50 rounded-lg">
                      <Mail className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-11 rounded-2xl border-slate-200 bg-slate-50/80 hover:bg-white focus:bg-white focus:border-blue-400 h-12 text-slate-800 placeholder:text-slate-300 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Contraseña
                    </label>
                    <Link to="/auth/forgot-password" className="text-xs text-blue-500 hover:text-blue-700 font-semibold hover:underline transition-colors">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 bg-blue-50 rounded-lg">
                      <Lock className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-11 pr-11 rounded-2xl border-slate-200 bg-slate-50/80 hover:bg-white focus:bg-white focus:border-blue-400 h-12 text-slate-800 placeholder:text-slate-300 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-blue-300/40 hover:shadow-xl hover:shadow-blue-400/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 mt-2"
                >
                  {loading ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Iniciando sesión...</>
                  ) : (
                    <>Iniciar Sesión <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">¿Primera vez aquí?</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Register CTA */}
              <Link
                to="/auth/register"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border-2 border-slate-200 hover:border-blue-300 bg-white/60 hover:bg-blue-50 text-slate-600 hover:text-blue-700 font-bold text-sm transition-all duration-200"
              >
                Crear cuenta gratis
              </Link>
            </div>

            {/* Trust badges below card */}
            <div className="flex items-center justify-center gap-6 mt-6 text-center">
              {[
                { icon: Shield, label: 'Datos Seguros', sub: 'Cifrado SSL' },
                { icon: Star,   label: 'Cert. MPPS', sub: 'Venezuela' },
                { icon: Heart,  label: '24/7', sub: 'Atención' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <Icon className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wide leading-tight">{label}</p>
                  <p className="text-[9px] text-slate-400 font-medium">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
