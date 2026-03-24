import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import {
  Stethoscope, Loader2, User, Mail, Phone, CreditCard,
  Lock, Calendar, Award, Eye, EyeOff, CheckCircle, ArrowRight,
  BookOpen, Video, Globe, HeartPulse, Shield,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    type: 'patient',
    email: '',
    phone: '',
    document_id: '',
    password: '',
    password_confirmation: '',
    first_name: '',
    last_name: '',
    birth_date: '',
    mpps_number: '',
    specialty: '',
    specialty_id: '',
  });
  const [specialties, setSpecialties] = useState<{id: string, name: string}[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type) setFormData(prev => ({ ...prev, type }));
    loadSpecialties();
  }, [searchParams]);

  const loadSpecialties = async () => {
    try {
      const response = await api.get('/specialties');
      setSpecialties(response.data);
    } catch (err) {
      console.error('Error loading specialties:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authService.register(formData);
      navigate(`/dashboard/${response.user.type}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const features = [
    { icon: Video,      text: 'Videoconsultas en tiempo real' },
    { icon: HeartPulse, text: 'Seguimiento médico personalizado' },
    { icon: Globe,      text: 'Especialistas desde toda Venezuela' },
    { icon: Shield,     text: 'Datos clínicos cifrados y seguros' },
    { icon: CheckCircle,text: 'Pagos con Pago Móvil y transferencia' },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ── LEFT PANEL ── videocall background image */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 relative overflow-hidden">
        <img
          src="/images/register_bg.png"
          alt="Videoconsulta médica en vivo"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '40% center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950/88 via-slate-900/80 to-blue-950/88" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full p-12">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group w-fit">
            <div className="p-2.5 bg-teal-500 rounded-xl group-hover:scale-105 transition-transform shadow-lg shadow-teal-500/30">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white drop-shadow-lg">
              Telemedicina <span className="text-teal-300">VE</span>
            </span>
          </Link>

          {/* Middle content */}
          <div className="space-y-7">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
              <span className="text-white text-xs font-black uppercase tracking-widest">
                Consulta médica online · 24/7
              </span>
            </div>

            <div>
              <h2 className="text-4xl font-black text-white leading-tight mb-3" style={{textShadow:'0 2px 12px rgba(0,0,0,0.7)'}}>
                Tu salud en<br />
                <span className="text-teal-300">manos expertas</span>
              </h2>
              <p className="text-white/90 text-base leading-relaxed max-w-xs font-medium" style={{textShadow:'0 1px 8px rgba(0,0,0,0.8)'}}>
                Únete a más de 12,000 venezolanos que ya acceden a atención médica premium desde casa.
              </p>
            </div>

            <div className="space-y-3">
              {features.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="p-1.5 bg-teal-500/50 backdrop-blur-sm rounded-full border border-teal-400/50">
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-white text-sm font-semibold" style={{textShadow:'0 1px 6px rgba(0,0,0,0.8)'}}>{text}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { num: '12K+', label: 'Pacientes' },
                { num: '350+', label: 'Médicos' },
                { num: '98%',  label: 'Satisfacción' },
              ].map(({ num, label }) => (
                <div key={label} className="bg-white/20 backdrop-blur-md rounded-2xl p-3 text-center border border-white/30">
                  <div className="text-xl font-black text-white" style={{textShadow:'0 2px 8px rgba(0,0,0,0.6)'}}>{num}</div>
                  <div className="text-xs text-teal-200 font-bold">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-teal-400/70 text-xs">
            © 2024 Telemedicina Venezuela. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── premium patterned background */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #1a2744 40%, #1e1f3a 100%)',
      }}>

        {/* Dot grid pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, #3b82f620 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        {/* Decorative cross watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none"
          style={{ fontSize: '360px', lineHeight: 1, color: '#2563eb', fontWeight: 900 }}>
          +
        </div>

        {/* Gradient orbs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #bfdbfe70, transparent 70%)' }} />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #c7d2fe60, transparent 70%)' }} />

        {/* Top accent stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 flex-shrink-0" />

        {/* Mobile logo */}
        <div className="lg:hidden flex justify-center pt-10 pb-4 relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="p-2 bg-teal-600 rounded-xl shadow-lg">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-bold text-slate-800">Telemedicina VE</span>
          </Link>
        </div>

        {/* Scrollable form area */}
        <div className="flex-1 flex items-start justify-center px-8 py-8 overflow-y-auto relative z-10">
          <div className="w-full max-w-[480px]">

            {/* Glass card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-100/80 border border-white">

              <div className="mb-6 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                  <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Registro Gratuito</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900">Crear tu cuenta</h1>
                <p className="text-slate-400 mt-1 text-sm">
                  Regístrate gratis y comienza a cuidar tu salud
                </p>
              </div>

              {error && (
                <div className="mb-5 bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-2xl text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tipo de usuario */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tipo de Usuario</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'patient', label: '👤 Paciente' },
                      { value: 'doctor',  label: '🩺 Médico' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, type: value }))}
                        className={`py-2.5 px-4 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${
                          formData.type === value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white/60 text-slate-600 hover:border-blue-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nombre *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <Input id="first_name" name="first_name" placeholder="Juan" value={formData.first_name} onChange={handleChange} required className="pl-9 rounded-xl border-slate-200 bg-slate-50/80 focus:bg-white focus:border-blue-400 h-11" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Apellido *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <Input id="last_name" name="last_name" placeholder="Pérez" value={formData.last_name} onChange={handleChange} required className="pl-9 rounded-xl border-slate-200 bg-slate-50/80 focus:bg-white focus:border-blue-400 h-11" />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Correo Electrónico *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                    <Input id="email" name="email" type="email" placeholder="tu@email.com" value={formData.email} onChange={handleChange} required className="pl-9 rounded-xl border-slate-200 bg-slate-50/80 focus:bg-white focus:border-blue-400 h-11" />
                  </div>
                </div>

                {/* Phone + CI */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Teléfono *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <Input id="phone" name="phone" type="tel" placeholder="+58 412..." value={formData.phone} onChange={handleChange} required className="pl-9 rounded-xl border-slate-200 bg-slate-50/80 focus:bg-white focus:border-blue-400 h-11" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cédula/RIF *</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <Input id="document_id" name="document_id" placeholder="V-12345678" value={formData.document_id} onChange={handleChange} required className="pl-9 rounded-xl border-slate-200 bg-slate-50/80 focus:bg-white focus:border-blue-400 h-11" />
                    </div>
                  </div>
                </div>

                {/* Patient birth date */}
                {formData.type === 'patient' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fecha de Nacimiento *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <Input id="birth_date" name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} required className="pl-9 rounded-xl border-slate-200 bg-slate-50/80 focus:bg-white focus:border-blue-400 h-11" />
                    </div>
                  </div>
                )}

                {/* Doctor-only fields */}
                {formData.type === 'doctor' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Número MPPS *</label>
                      <div className="relative">
                        <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                        <Input id="mpps_number" name="mpps_number" placeholder="MPPS-12345" value={formData.mpps_number} onChange={handleChange} required className="pl-9 rounded-xl border-slate-200 bg-slate-50/80 focus:bg-white focus:border-blue-400 h-11" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Especialidad *</label>
                      <div className="relative">
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                        <select
                          id="specialty_id"
                          name="specialty_id"
                          value={formData.specialty_id}
                          onChange={(e) => {
                            const id = e.target.value;
                            const name = specialties.find(s => s.id === id)?.name || '';
                            setFormData(prev => ({ ...prev, specialty_id: id, specialty: name }));
                          }}
                          required
                          className="w-full pl-9 h-11 rounded-xl border border-slate-200 bg-slate-50/80 text-sm focus:border-blue-400 outline-none transition-all appearance-none"
                        >
                          <option value="">Selecciona especialidad</option>
                          {specialties.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <ArrowRight className="h-4 w-4 rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Passwords */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contraseña *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleChange} required minLength={8} className="pl-9 pr-9 rounded-xl border-slate-200 bg-slate-50/80 focus:bg-white focus:border-blue-400 h-11" />
                      <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Confirmar *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <Input id="password_confirmation" name="password_confirmation" type="password" placeholder="••••••••" value={formData.password_confirmation} onChange={handleChange} required className="pl-9 rounded-xl border-slate-200 bg-slate-50/80 focus:bg-white focus:border-blue-400 h-11" />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-blue-300/40 hover:shadow-xl hover:shadow-blue-400/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 mt-1"
                >
                  {loading ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Creando cuenta...</>
                  ) : (
                    <>Crear Mi Cuenta Gratis <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">¿Ya tienes cuenta?</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <Link
                to="/auth/login"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border-2 border-slate-200 hover:border-blue-300 bg-white/60 hover:bg-blue-50 text-slate-600 hover:text-blue-700 font-bold text-sm transition-all duration-200"
              >
                Inicia sesión aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
