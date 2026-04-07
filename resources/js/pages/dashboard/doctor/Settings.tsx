import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Save, User as UserIcon, DollarSign, Award, Landmark, Send, CreditCard, CheckCircle, Lock, PenTool, ArrowLeft, Camera, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { SignaturePad } from '@/components/common/SignaturePad';

type FormData = {
  first_name: string; last_name: string; email: string; phone: string;
  avatar_url: string;
  specialty: string; specialty_id: string; mpps_number: string; consultation_price_usd: string;
  bank_name: string; bank_account_number: string; bank_account_holder: string;
  bank_document_id: string; bank_account_type: string;
  pago_movil_phone: string; pago_movil_document_id: string; pago_movil_bank: string;
  zelle_email: string; zelle_holder: string;
  digital_signature: string;
  digital_stamp: string;
  bank_id: string;
  pago_movil_bank_id: string;
};

interface Bank {
  id: string;
  name: string;
  code: string;
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, label, sub }: { icon: any; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
      <div className="p-2 bg-blue-50 rounded-xl">
        <Icon className="h-4 w-4 text-blue-600" />
      </div>
      <div>
        <p className="font-bold text-gray-900 text-sm">{label}</p>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </div>
    </div>
  );
}

interface Specialty { id: string; name: string; }

export default function DoctorSettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [formData, setFormData] = useState<FormData>({
    first_name: '', last_name: '', email: '', phone: '',
    avatar_url: '',
    specialty: '', specialty_id: '', mpps_number: '', consultation_price_usd: '',
    bank_name: '', bank_account_number: '', bank_account_holder: '',
    bank_document_id: '', bank_account_type: '',
    pago_movil_phone: '', pago_movil_document_id: '', pago_movil_bank: '',
    zelle_email: '', zelle_holder: '',
    digital_signature: '',
    digital_stamp: '',
    bank_id: '', pago_movil_bank_id: '',
  });
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);

  const copyRegistrationLink = () => {
    const link = `${window.location.origin}/auth/register?type=medico`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) { navigate('/auth/login'); return; }
    const currentUser = authService.getUser();
    if (!currentUser || currentUser.type !== 'doctor') { navigate(`/dashboard/${currentUser?.type || 'patient'}`); return; }
    setUser(currentUser);
    api.get('/specialties').then(r => setSpecialties(r.data)).catch(() => {});
    api.get('/auth/me').then(r => {
      const u = r.data.user;
      setFormData({
        first_name: u.first_name || '', last_name: u.last_name || '',
        email: u.email || '', phone: u.phone || '',
        avatar_url: u.avatar_url || '',
        specialty: u.specialty || '', specialty_id: u.specialty_id || '', mpps_number: u.mpps_number || '',
        consultation_price_usd: u.consultation_price_usd?.toString() || '',
        bank_name: u.bank_name || '', bank_account_number: u.bank_account_number || '',
        bank_account_holder: u.bank_account_holder || '', bank_document_id: u.bank_document_id || '',
        bank_account_type: u.bank_account_type || '',
        pago_movil_phone: u.pago_movil_phone || '', pago_movil_document_id: u.pago_movil_document_id || '',
        pago_movil_bank: u.pago_movil_bank || '',
        zelle_email: u.zelle_email || '', zelle_holder: u.zelle_holder || '',
        digital_signature: u.digital_signature || '',
        digital_stamp: u.digital_stamp || '',
        bank_id: u.bank_id || '', pago_movil_bank_id: u.pago_movil_bank_id || '',
      });
    }).catch(() => {}).finally(() => setLoading(false));

    api.get('/banks').then(r => setBanks(r.data)).catch(() => {});
  }, [navigate]);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('avatar', file);

    setUploading(true);
    try {
      const response = await api.post('/auth/avatar', formDataUpload);
      setFormData(prev => ({ ...prev, avatar_url: response.data.url }));
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al subir la imagen';
      const errors = err.response?.data?.errors;
      const detail = errors ? Object.values(errors).flat().join('\n') : '';
      alert(`${msg}\n${detail}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData, consultation_price_usd: parseFloat(formData.consultation_price_usd) || 0 };
      await api.put('/auth/me', payload);
      const updatedUser = { ...authService.getUser(), ...payload } as User;
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

  const inputClass = "h-10 px-3 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 w-full";
  const readonlyClass = `${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`;

  const BankSelect = ({ label, value, onChange }: any) => (
    <FieldGroup label={label}>
      <select
        value={value}
        onChange={(e) => {
          const bank = banks.find(b => b.id === e.target.value);
          onChange(e.target.value, bank?.name || '');
        }}
        className={`${inputClass} bg-white border-blue-100 focus:border-blue-400 font-bold uppercase`}
      >
        <option value="">Seleccione Banco</option>
        {banks.map(b => (
          <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
        ))}
      </select>
    </FieldGroup>
  );

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Header */}
        {/* Header Section (Revisado para Estilo Premium) */}
        <div className="relative overflow-hidden rounded-[2.5rem] p-8 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-2xl shadow-blue-500/20 mb-8">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-700" />
          
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-28 h-28 rounded-[2.2rem] bg-white/20 p-1 backdrop-blur-md shadow-2xl group-hover:scale-105 transition-all duration-500 overflow-hidden border border-white/30">
                <div className="w-full h-full rounded-[2rem] bg-white/10 flex items-center justify-center overflow-hidden relative">
                  {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                  ) : (
                    <span className="text-4xl font-black text-white/90">
                      {formData.first_name?.[0]}{formData.last_name?.[0]}
                    </span>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-blue-600/40 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-2xl shadow-xl flex items-center justify-center text-blue-600 border border-slate-100 group-hover:scale-110 transition-transform">
                <Camera className="h-5 w-5" />
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <Link to="/dashboard/doctor" className="group inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Panel Principal</span>
              </Link>
              <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight uppercase mb-2">
                Configuración <span className="text-blue-200">Profesional</span>
              </h1>
              <p className="text-blue-100/80 font-medium text-lg max-w-lg mb-6">Gestiona tu identidad digital, especialidad y métodos de recaudación.</p>
              
              <button
                type="button"
                onClick={copyRegistrationLink}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs tracking-widest transition-all uppercase shadow-xl ${
                  copied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20'
                }`}
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                {copied ? '¡ENLACE COPIADO!' : 'COMPARTIR REGISTRO PARA MÉDICOS'}
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal & Professional */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal info (readonly) */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6">
              <SectionTitle icon={UserIcon} label="Información Personal" sub="Solo lectura — no modificable" />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FieldGroup label="Nombre">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-300" />
                      <input readOnly value={formData.first_name} className={`${readonlyClass} pl-8`} />
                    </div>
                  </FieldGroup>
                  <FieldGroup label="Apellido">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-300" />
                      <input readOnly value={formData.last_name} className={`${readonlyClass} pl-8`} />
                    </div>
                  </FieldGroup>
                </div>
                <FieldGroup label="Email">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-300" />
                    <input readOnly value={formData.email} className={`${readonlyClass} pl-8`} />
                  </div>
                </FieldGroup>
                <FieldGroup label="Teléfono">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-300" />
                    <input readOnly value={formData.phone} className={`${readonlyClass} pl-8`} />
                  </div>
                </FieldGroup>
              </div>
            </div>

            {/* Professional */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6">
              <SectionTitle icon={Award} label="Información Profesional" sub="Precio actualizable" />
              <div className="space-y-4">
                <FieldGroup label="Especialidad *">
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 z-10" />
                    <select
                      value={formData.specialty_id}
                      onChange={set('specialty_id')}
                      className={`${inputClass} pl-9 appearance-none bg-white border-blue-200 focus:border-blue-400`}
                      required
                    >
                      <option value="">Seleccione una especialidad</option>
                      {specialties.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </FieldGroup>
                <FieldGroup label="Número MPPS">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-300" />
                    <input readOnly value={formData.mpps_number} className={`${readonlyClass} pl-8`} />
                  </div>
                </FieldGroup>
                <FieldGroup label="Precio de Consulta (USD) *">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                    <input
                      type="number" step="0.01" min="0"
                      value={formData.consultation_price_usd}
                      onChange={set('consultation_price_usd')}
                      className={`${inputClass} pl-9 border-blue-200 focus:border-blue-400`}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <p className="text-xs text-blue-600 mt-1">Este es el único campo editable en esta sección</p>
                </FieldGroup>
              </div>
            </div>
          </div>

          {/* Payment methods */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-blue-100 shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-600 rounded-xl">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Métodos de Pago</p>
                <p className="text-xs text-gray-500">Configura cómo recibirás los pagos de tus pacientes</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Transferencia bancaria */}
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100">
                  <Landmark className="h-4 w-4 text-blue-500" /> Transferencia Bancaria (Bolívares)
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <BankSelect 
                    label="Banco" 
                    value={formData.bank_id} 
                    onChange={(id: string, name: string) => setFormData(p => ({...p, bank_id: id, bank_name: name}))} 
                  />
                  <FieldGroup label="Número de Cuenta">
                    <input value={formData.bank_account_number} onChange={set('bank_account_number')} placeholder="0123..." className={inputClass} />
                  </FieldGroup>
                  <FieldGroup label="Titular">
                    <input value={formData.bank_account_holder} onChange={set('bank_account_holder')} className={inputClass} />
                  </FieldGroup>
                  <FieldGroup label="C.I. o RIF">
                    <input value={formData.bank_document_id} onChange={set('bank_document_id')} className={inputClass} />
                  </FieldGroup>
                  <FieldGroup label="Tipo de Cuenta">
                    <input value={formData.bank_account_type} onChange={set('bank_account_type')} placeholder="Corriente / Ahorro" className={inputClass} />
                  </FieldGroup>
                </div>
              </div>

              {/* Pago Móvil */}
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100">
                  <Send className="h-4 w-4 text-green-500" /> Pago Móvil
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <BankSelect 
                    label="Banco" 
                    value={formData.pago_movil_bank_id} 
                    onChange={(id: string, name: string) => setFormData(p => ({...p, pago_movil_bank_id: id, pago_movil_bank: name}))} 
                  />
                  <FieldGroup label="Teléfono">
                    <input value={formData.pago_movil_phone} onChange={set('pago_movil_phone')} placeholder="0424..." className={inputClass} />
                  </FieldGroup>
                  <FieldGroup label="C.I. o RIF">
                    <input value={formData.pago_movil_document_id} onChange={set('pago_movil_document_id')} className={inputClass} />
                  </FieldGroup>
                </div>
              </div>

              {/* Zelle */}
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100">
                  <CreditCard className="h-4 w-4 text-purple-500" /> Zelle (Dólares)
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <FieldGroup label="Correo Electrónico">
                    <input type="email" value={formData.zelle_email} onChange={set('zelle_email')} placeholder="email@zelle.com" className={inputClass} />
                  </FieldGroup>
                  <FieldGroup label="Titular">
                    <input value={formData.zelle_holder} onChange={set('zelle_holder')} className={inputClass} />
                  </FieldGroup>
                </div>
              </div>
            </div>
          </div>

          {/* Firma Digital */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-xl">
                <PenTool className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Firma Digital</p>
                <p className="text-xs text-gray-500">Esta firma aparecerá en tus informes y recetas impresas</p>
              </div>
            </div>

            <div className="space-y-6">
              {formData.digital_signature ? (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Firma Actual</p>
                  <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50 inline-block">
                    <img src={formData.digital_signature} alt="Firma" className="max-h-24" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, digital_signature: '' }))}
                    className="block text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    Eliminar y crear una nueva firma
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Crear Firma</p>
                  <SignaturePad
                    onSave={(sig) => setFormData(prev => ({ ...prev, digital_signature: sig }))}
                  />
                  <p className="text-[11px] text-slate-500 italic">
                    Use su mouse o dedo para firmar en el recuadro superior. Una vez confirme, los cambios se guardarán al pulsar el botón inferior.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sello Digital */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Sello Profesional</p>
                <p className="text-xs text-gray-500">Imagen de su sello que aparecerá al lado de su firma</p>
              </div>
            </div>

            <div className="space-y-4">
              {formData.digital_stamp ? (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sello Actual</p>
                  <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50 inline-block">
                    <img src={formData.digital_stamp} alt="Sello" className="max-h-32" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, digital_stamp: '' }))}
                    className="block text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    Eliminar sello actual
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subir Sello</p>
                  <div 
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = async (e: any) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const fd = new FormData();
                            fd.append('stamp', file);
                            try {
                                const res = await api.post('/auth/stamp', fd);
                                setFormData(prev => ({ ...prev, digital_stamp: res.data.url }));
                            } catch (err) {
                                alert('Error al subir el sello');
                            }
                        };
                        input.click();
                    }}
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2"
                  >
                    <Camera className="h-8 w-8 text-gray-400" />
                    <p className="text-sm font-bold text-gray-600">Haga clic para subir la imagen de su sello</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">PNG o JPG (Fondo transparente recomendado)</p>
                  </div>
                </div>
              )}
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
              <><CheckCircle className="h-5 w-5" /> ¡Cambios Guardados!</>
            ) : saving ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
            ) : (
              <><Save className="h-5 w-5" /> Guardar Todos los Cambios</>
            )}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
