import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Save, User as UserIcon, Mail, Phone, Calendar, Droplets, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

type FormData = {
  first_name: string; last_name: string; email: string; phone: string;
  birth_date: string; blood_type: string; allergies: string;
};

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function FieldGroup({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </label>
      {children}
    </div>
  );
}

export default function PatientSettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    first_name: '', last_name: '', email: '', phone: '',
    birth_date: '', blood_type: '', allergies: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) { navigate('/auth/login'); return; }
    const currentUser = authService.getUser();
    if (!currentUser) { navigate('/auth/login'); return; }
    setUser(currentUser);
    api.get('/auth/me').then(r => {
      const u = r.data.user || r.data;
      setFormData({
        first_name: u.first_name || '', last_name: u.last_name || '',
        email: u.email || '', phone: u.phone || '',
        birth_date: u.birth_date || '', blood_type: u.blood_type || '',
        allergies: u.allergies || '',
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [navigate]);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/me', formData);
      const updatedUser = { ...user!, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { alert('Error al actualizar el perfil'); } finally { setSaving(false); }
  };

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  const inputClass = "h-10 px-3 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 w-full bg-white";

  return (
    <DashboardLayout user={user}>
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {user.first_name?.[0]}{user.last_name?.[0]}
          </div>
          <div>
            <Link to="/dashboard/patient" className="group inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-4">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-bold uppercase tracking-widest">Panel Principal</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-500">Actualiza tu información personal y médica</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2 bg-blue-50 rounded-xl">
                <UserIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Información Personal</p>
                <p className="text-xs text-gray-500">Datos de tu cuenta</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FieldGroup label="Nombre" icon={UserIcon}>
                <input
                  value={formData.first_name}
                  onChange={set('first_name')}
                  required
                  className={inputClass}
                  placeholder="Juan"
                />
              </FieldGroup>
              <FieldGroup label="Apellido" icon={UserIcon}>
                <input
                  value={formData.last_name}
                  onChange={set('last_name')}
                  required
                  className={inputClass}
                  placeholder="Pérez"
                />
              </FieldGroup>
              <FieldGroup label="Correo Electrónico" icon={Mail}>
                <input
                  type="email"
                  value={formData.email}
                  onChange={set('email')}
                  required
                  className={inputClass}
                  placeholder="tu@email.com"
                />
              </FieldGroup>
              <FieldGroup label="Teléfono" icon={Phone}>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={set('phone')}
                  required
                  className={inputClass}
                  placeholder="+58 412..."
                />
              </FieldGroup>
            </div>
          </div>

          {/* Medical info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2 bg-rose-50 rounded-xl">
                <Droplets className="h-4 w-4 text-rose-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Información Médica</p>
                <p className="text-xs text-gray-500">Información relevante para tu atención médica</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FieldGroup label="Fecha de Nacimiento" icon={Calendar}>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={set('birth_date')}
                  className={inputClass}
                />
              </FieldGroup>
              <FieldGroup label="Tipo de Sangre" icon={Droplets}>
                <select
                  value={formData.blood_type}
                  onChange={set('blood_type')}
                  className={inputClass}
                >
                  <option value="">Seleccionar grupo sanguíneo</option>
                  {BLOOD_TYPES.map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </FieldGroup>
              <div className="md:col-span-2">
                <FieldGroup label="Alergias Conocidas" icon={AlertTriangle}>
                  <textarea
                    value={formData.allergies}
                    onChange={set('allergies')}
                    rows={3}
                    placeholder="Lista tus alergias conocidas a medicamentos, alimentos u otras sustancias..."
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 resize-none bg-white"
                  />
                </FieldGroup>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-base font-bold shadow-sm transition-all duration-300 ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:shadow-blue-500/20 hover:scale-[1.01]'
            } disabled:opacity-60 disabled:scale-100`}
          >
            {saved ? (
              <><CheckCircle className="h-5 w-5" /> ¡Perfil Actualizado!</>
            ) : saving ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
            ) : (
              <><Save className="h-5 w-5" /> Guardar Cambios</>
            )}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
