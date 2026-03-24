import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
    Save, 
    User as UserIcon, 
    Landmark, 
    Send, 
    CreditCard, 
    CheckCircle, 
    ArrowLeft, 
    Camera, 
    Loader2,
    Mail,
    Phone,
    Wallet,
    Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_holder: string;
  bank_document_id: string;
  bank_account_type: string;
  pago_movil_phone: string;
  pago_movil_document_id: string;
  pago_movil_bank: string;
  zelle_email: string;
  zelle_holder: string;
};

export default function AdminSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    first_name: '', last_name: '', email: '', phone: '',
    avatar_url: '',
    bank_name: '', bank_account_number: '', bank_account_holder: '',
    bank_document_id: '', bank_account_type: '',
    pago_movil_phone: '', pago_movil_document_id: '', pago_movil_bank: '',
    zelle_email: '', zelle_holder: '',
  });
  
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const currentUser = authService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
        navigate('/dashboard');
        return;
    }
    setUser(currentUser);
    
    api.get('/auth/me').then(r => {
      const u = r.data.user;
      setFormData({
        first_name: u.first_name || '',
        last_name: u.last_name || '',
        email: u.email || '',
        phone: u.phone || '',
        avatar_url: u.avatar_url || '',
        bank_name: u.bank_name || '',
        bank_account_number: u.bank_account_number || '',
        bank_account_holder: u.bank_account_holder || '',
        bank_document_id: u.bank_document_id || '',
        bank_account_type: u.bank_account_type || '',
        pago_movil_phone: u.pago_movil_phone || '',
        pago_movil_document_id: u.pago_movil_document_id || '',
        pago_movil_bank: u.pago_movil_bank || '',
        zelle_email: u.zelle_email || '',
        zelle_holder: u.zelle_holder || '',
      });
    }).finally(() => setLoading(false));
  }, [navigate]);

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('avatar', file);

    setUploading(true);
    try {
      const response = await api.post('/auth/avatar', uploadData);
      setFormData(prev => ({ ...prev, avatar_url: response.data.url }));
    } catch (err: any) {
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/me', formData);
      const updatedUser = { ...authService.getUser(), ...formData } as User;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
        alert(error.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
        setSaving(false);
    }
  };

  if (loading || !user) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-slate-400 font-black tracking-widest uppercase text-xs">Preparando Experiencia Premium...</p>
        </div>
    </div>
  );

  const InputField = ({ label, icon: Icon, value, onChange, placeholder, type = "text", required = false }: any) => (
    <div className="space-y-2 group">
      <label className="text-[10px] font-black text-slate-400 ml-2 tracking-widest uppercase">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />}
        <input 
          required={required}
          type={type}
          placeholder={placeholder}
          className={`w-full h-14 ${Icon ? 'pl-12' : 'px-4'} pr-4 bg-white/50 backdrop-blur-sm border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-sm font-bold placeholder:text-slate-300 uppercase tracking-tighter`}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );

  return (
    <DashboardLayout user={user}>
      <div className="max-w-6xl mx-auto space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Modern Header Section */}
        <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-12 shadow-2xl shadow-slate-200">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                    <div className="w-40 h-40 rounded-[2.5rem] p-1.5 bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-2xl shadow-blue-500/20 group-hover:scale-105 transition-all duration-500">
                        <div className="w-full h-full rounded-[2.2rem] bg-white flex items-center justify-center overflow-hidden relative border-4 border-slate-900">
                            {formData.avatar_url ? (
                                <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                            ) : (
                                <span className="text-5xl font-black text-slate-900">
                                    {formData.first_name?.[0]}{formData.last_name?.[0]}
                                </span>
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center">
                                    <Loader2 className="h-10 w-10 text-white animate-spin" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Camera className="h-10 w-10 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-900 border-2 border-slate-50 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-6 h-6 text-blue-500" />
                    </div>
                </div>

                <div className="flex-1 text-center lg:text-left">
                    <Link to="/dashboard/admin" className="group inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span className="text-[10px] font-black tracking-[0.3em] uppercase">Panel Administrativo</span>
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-4 lowercase">
                        {formData.first_name} {formData.last_name}
                        <span className="block text-blue-500 text-lg tracking-[0.5em] uppercase mt-2 font-bold opacity-80">MI CONFIGURACIÓN</span>
                    </h1>
                </div>

                <Button 
                    onClick={(e) => handleSubmit(e)}
                    disabled={saving}
                    className={`h-20 px-12 rounded-[1.5rem] text-sm font-black tracking-widest transition-all active:scale-95 shadow-2xl border-none ${
                        saved ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 hover:bg-slate-100'
                    }`}
                >
                    {saved ? <CheckCircle className="w-6 h-6 mr-3" /> : saving ? <Loader2 className="w-6 h-6 mr-3 animate-spin" /> : <Save className="w-6 h-6 mr-3" />}
                    {saved ? 'DATOS GUARDADOS' : saving ? 'GUARDANDO...' : 'ACTUALIZAR PERFIL'}
                </Button>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-10">
                <Card className="rounded-[2.5rem] border-none bg-white shadow-2xl shadow-slate-200 overflow-hidden">
                    <div className="bg-slate-50 p-8 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-2xl shadow-sm">
                                <UserIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="font-black text-slate-900 tracking-tighter leading-tight uppercase">Datos Personales</h2>
                                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Identidad de la cuenta</p>
                            </div>
                        </div>
                    </div>
                    <CardContent className="p-8 space-y-6">
                        <InputField 
                            label="Nombre" value={formData.first_name} 
                            onChange={handleInputChange('first_name')} required 
                        />
                        <InputField 
                            label="Apellido" value={formData.last_name} 
                            onChange={handleInputChange('last_name')} required 
                        />
                        <InputField 
                            label="Correo Electrónico" icon={Mail} 
                            value={formData.email} onChange={handleInputChange('email')} 
                            type="email" required 
                        />
                        <InputField 
                            label="Teléfono" icon={Phone} 
                            value={formData.phone} onChange={handleInputChange('phone')} 
                            type="tel" required 
                        />
                    </CardContent>
                </Card>

                <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-125 transition-transform duration-700">
                        <Wallet className="w-32 h-32" />
                    </div>
                    <h3 className="text-2xl font-black tracking-tighter mb-4 italic leading-tight lowercase">
                        Tus ingresos <br/> en un solo lugar
                    </h3>
                    <p className="text-white/60 text-xs font-bold leading-relaxed uppercase tracking-wider">
                        Configura tus métodos de pago para recibir recaudaciones de manera segura.
                    </p>
                </div>
            </div>

            {/* Main Content Column */}
            <div className="lg:col-span-8 space-y-10">
                <Card className="rounded-[3rem] border-none bg-white shadow-2xl shadow-slate-200 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <CreditCard className="w-64 h-64 text-slate-900 rotate-12" />
                    </div>

                    <CardContent className="p-12 space-y-12 relative z-10">
                        
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-blue-600 rounded-[1.5rem] shadow-xl shadow-blue-500/20">
                                <Wallet className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Métodos de Recaudación</h2>
                                <p className="text-slate-500 font-medium mt-1">Configura cómo deseas percibir los ingresos del sistema</p>
                            </div>
                        </div>

                        {/* Transferencia Section */}
                        <div className="space-y-8 bg-slate-50/50 backdrop-blur-sm p-10 rounded-[2.5rem] border border-slate-100">
                            <div className="flex items-center gap-4 text-blue-600">
                                <div className="p-2 bg-blue-100 rounded-xl">
                                    <Landmark className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Transferencia Bancaria (Bs.)</span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <InputField label="Banco" value={formData.bank_name} onChange={handleInputChange('bank_name')} placeholder="EJ. BANESCO" />
                                <InputField label="Cuenta Bancaria (20 dígitos)" value={formData.bank_account_number} onChange={handleInputChange('bank_account_number')} />
                                <InputField label="Titular de la Cuenta" value={formData.bank_account_holder} onChange={handleInputChange('bank_account_holder')} />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Cédula/RIF" value={formData.bank_document_id} onChange={handleInputChange('bank_document_id')} />
                                    <InputField label="Tipo de Cuenta" value={formData.bank_account_type} onChange={handleInputChange('bank_account_type')} placeholder="CORRIENTE" />
                                </div>
                            </div>
                        </div>

                        {/* Two Columns for PM and Zelle */}
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Pago Movil */}
                            <div className="space-y-8 bg-emerald-50/50 backdrop-blur-sm p-10 rounded-[2.5rem] border border-emerald-100">
                                <div className="flex items-center gap-4 text-emerald-600">
                                    <div className="p-2 bg-emerald-100 rounded-xl">
                                        <Send className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Pago Móvil</span>
                                </div>
                                <div className="space-y-6">
                                    <InputField label="Banco" value={formData.pago_movil_bank} onChange={handleInputChange('pago_movil_bank')} placeholder="EJ. MERCANTIL" />
                                    <InputField label="Teléfono Receptor" value={formData.pago_movil_phone} onChange={handleInputChange('pago_movil_phone')} />
                                    <InputField label="Cédula de Identidad" value={formData.pago_movil_document_id} onChange={handleInputChange('pago_movil_document_id')} />
                                </div>
                            </div>

                            {/* Zelle */}
                            <div className="space-y-8 bg-purple-50/50 backdrop-blur-sm p-10 rounded-[2.5rem] border border-purple-100">
                                <div className="flex items-center gap-4 text-purple-600">
                                    <div className="p-2 bg-purple-100 rounded-xl">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Zelle (Dólares)</span>
                                </div>
                                <div className="space-y-6">
                                    <InputField label="Email Zelle" value={formData.zelle_email} onChange={handleInputChange('zelle_email')} type="email" placeholder="example@zelle.com" />
                                    <InputField label="Nombre del Titular" value={formData.zelle_holder} onChange={handleInputChange('zelle_holder')} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-50">
                            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                <CheckCircle className="w-3 h-3 text-emerald-500" /> Todos los datos de pago se manejan bajo protocolos de seguridad PCI
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
