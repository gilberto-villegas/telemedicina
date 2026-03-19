import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import {
  Stethoscope, Loader2, User, Mail, Phone, CreditCard,
  Lock, Calendar, Award, Eye, EyeOff, CheckCircle, ArrowRight,
  BookOpen
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

  const benefits = [
    'Consultas con médicos certificados MPPS',
    'Historial clínico digital seguro',
    'Pagos en Bolívares y Pago Móvil',
    'Disponible 24/7 desde cualquier lugar',
  ];

  return (
    <div className="min-h-screen hero-gradient flex overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-20 left-10 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-400/15 rounded-full blur-3xl animate-float delay-400 pointer-events-none" />

      {/* Left panel — branding & benefits (hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 p-12 relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2.5 bg-blue-500 rounded-xl animate-pulse-glow group-hover:scale-105 transition-transform">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            Telemedicina <span className="text-blue-300">VE</span>
          </span>
        </Link>

        {/* Center content */}
        <div className="space-y-8">
          <div className="animate-fade-in-up">
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Tu salud en<br />
              <span className="text-gradient">manos expertas</span>
            </h2>
            <p className="text-blue-200 text-lg leading-relaxed">
              Únete a más de 12,000 venezolanos que ya acceden a atención médica premium desde casa.
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

          {/* Stats */}
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
        <div className="w-full max-w-xl">
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
            <div className="mb-7">
              <h1 className="text-2xl font-black text-gray-900">Crear tu cuenta</h1>
              <p className="text-gray-500 mt-1 text-sm">
                Regístrate gratis y comienza a cuidar tu salud
              </p>
            </div>

            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm flex items-center gap-2">
                <span className="inline-block w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">!</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Tipo de usuario */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Tipo de Usuario</label>
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
                          : 'border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Nombre *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="first_name" name="first_name" placeholder="Juan" value={formData.first_name} onChange={handleChange} required className="pl-9 rounded-xl border-gray-200 focus:border-blue-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Apellido *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="last_name" name="last_name" placeholder="Pérez" value={formData.last_name} onChange={handleChange} required className="pl-9 rounded-xl border-gray-200 focus:border-blue-400" />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Correo Electrónico *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="email" name="email" type="email" placeholder="tu@email.com" value={formData.email} onChange={handleChange} required className="pl-9 rounded-xl border-gray-200 focus:border-blue-400" />
                </div>
              </div>

              {/* Phone + CI */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Teléfono *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="phone" name="phone" type="tel" placeholder="+58 412..." value={formData.phone} onChange={handleChange} required className="pl-9 rounded-xl border-gray-200 focus:border-blue-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Cédula/RIF *</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="document_id" name="document_id" placeholder="V-12345678" value={formData.document_id} onChange={handleChange} required className="pl-9 rounded-xl border-gray-200 focus:border-blue-400" />
                  </div>
                </div>
              </div>

              {/* Patient-only: birth date */}
              {formData.type === 'patient' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Fecha de Nacimiento *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="birth_date" name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} required className="pl-9 rounded-xl border-gray-200 focus:border-blue-400" />
                  </div>
                </div>
              )}

              {/* Doctor-only fields */}
              {formData.type === 'doctor' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Número MPPS *</label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input id="mpps_number" name="mpps_number" placeholder="MPPS-12345" value={formData.mpps_number} onChange={handleChange} required className="pl-9 rounded-xl border-gray-200 focus:border-blue-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Especialidad *</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                        className="w-full pl-9 h-11 rounded-xl border border-gray-200 bg-white text-sm focus:border-blue-400 outline-none transition-all appearance-none"
                      >
                        <option value="">Selecciona especialidad</option>
                        {specialties.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ArrowRight className="h-4 w-4 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Passwords */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Contraseña *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleChange} required minLength={8} className="pl-9 pr-9 rounded-xl border-gray-200 focus:border-blue-400" />
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Confirmar *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="password_confirmation" name="password_confirmation" type="password" placeholder="••••••••" value={formData.password_confirmation} onChange={handleChange} required className="pl-9 rounded-xl border-gray-200 focus:border-blue-400" />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 mt-2"
              >
                {loading ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Creando cuenta...</>
                ) : (
                  <>Crear Mi Cuenta Gratis <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link to="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
