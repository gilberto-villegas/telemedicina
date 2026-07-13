import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import {
  Stethoscope, Loader2, Lock, Eye, EyeOff,
  Shield, CheckCircle2, ArrowRight
} from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || !email) {
      setStatus('error');
      setMessage('El enlace de recuperación es inválido o está incompleto.');
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setStatus('error');
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
      setStatus('success');
      setMessage(response.data.message);
      setTimeout(() => navigate('/auth/login'), 5000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Error al restablecer la contraseña');
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden">
        <img
          src="/images/login_bg.png"
          alt="Reset Password"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '30% center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-slate-900/80 to-indigo-950/88" />
        <div className="relative z-10 flex flex-col justify-between h-full p-14">
          <Link to="/" className="flex items-center gap-3 group w-fit">
            <div className="p-2.5 bg-blue-500 rounded-xl group-hover:scale-105 transition-transform shadow-lg shadow-blue-500/30">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white drop-shadow-lg">
              VilSalud <span className="text-blue-300">VE</span>
            </span>
          </Link>

          <div>
            <h2 className="text-5xl font-black text-white leading-tight mb-4" style={{textShadow:'0 2px 12px rgba(0,0,0,0.7)'}}>
              Nueva<br />
              <span className="text-blue-300">Seguridad</span>
            </h2>
            <p className="text-white text-lg max-w-sm font-medium" style={{textShadow:'0 1px 8px rgba(0,0,0,0.8)'}}>
              Elige una contraseña fuerte para proteger tu cuenta y tu información médica.
            </p>
          </div>

          <p className="text-blue-400/70 text-xs text-xs">
            © 2024 VilSalud. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #1a2744 40%, #1e1f3a 100%)',
      }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, #3b82f620 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

        <div className="flex-1 flex items-center justify-center px-8 py-10 relative z-10">
          <div className="w-full max-w-[400px]">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white">
              
              <div className="mb-7 text-center">
                 <h1 className="text-3xl font-black text-slate-900 leading-tight">Nueva contraseña</h1>
                 <p className="text-slate-400 mt-2 text-sm">Ingresa tu nueva clave de acceso</p>
              </div>

              {status === 'success' ? (
                <div className="space-y-6 text-center py-4">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm animate-bounce">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">¡Éxito!</h3>
                    <p className="text-slate-500 mt-2 text-sm px-4">
                      {message} Serás redirigido al inicio de sesión en unos segundos...
                    </p>
                  </div>
                  <Link
                    to="/auth/login"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-base transition-all hover:bg-blue-700 shadow-xl shadow-blue-500/20"
                  >
                    Ir al Login ahora
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {(status === 'error' || !token || !email) && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-2xl text-sm font-medium">
                      {message || 'Enlace inválido'}
                    </div>
                  )}

                  {token && email && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Nueva Contraseña
                        </label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 bg-blue-50 rounded-lg">
                            <Lock className="h-3.5 w-3.5 text-blue-500" />
                          </div>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mínimo 8 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pl-11 pr-11 rounded-2xl border-slate-200 bg-slate-50/80 hover:bg-white focus:bg-white focus:border-blue-400 h-14 text-slate-800 transition-all font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Confirmar Contraseña
                        </label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 bg-blue-50 rounded-lg">
                            <Lock className="h-3.5 w-3.5 text-blue-500" />
                          </div>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Repite tu contraseña"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                            className="pl-11 rounded-2xl border-slate-200 bg-slate-50/80 hover:bg-white focus:bg-white focus:border-blue-400 h-14 text-slate-800 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="group w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-blue-300/40 hover:shadow-xl hover:shadow-blue-400/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 mt-2"
                      >
                        {status === 'loading' ? (
                          <><Loader2 className="h-5 w-5 animate-spin" /> Actualizando...</>
                        ) : (
                          <>Actualizar Contraseña <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                        )}
                      </button>
                    </>
                  )}
                </form>
              )}
            </div>
            
            <div className="mt-10 flex items-center justify-center gap-4 text-center">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Conexión Cifrada de Extremo a Extremo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
