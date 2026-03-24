import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
    ShieldCheck, 
    UserPlus, 
    Trash2, 
    ChevronLeft,
    Mail,
    Phone,
    User as UserIcon,
    Lock,
    Pencil,
    ShieldAlert
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminAdmins() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [admins, setAdmins] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
    
    // New admin form
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: ''
    });

    useEffect(() => {
        const currentUser = authService.getUser();
        if (!currentUser || currentUser.type !== 'admin') {
            navigate('/dashboard');
            return;
        }
        setUser(currentUser);
        loadAdmins();
    }, []);

    const loadAdmins = async () => {
        try {
            const response = await api.get('/admin/admins');
            setAdmins(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error loading admins:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAdmin) {
                await api.put(`/admin/admins/${editingAdmin.id}`, formData);
            } else {
                await api.post('/admin/admins', formData);
            }
            
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                password: '',
                password_confirmation: ''
            });
            setIsAdding(false);
            setEditingAdmin(null);
            loadAdmins();
        } catch (error: any) {
            const errorData = error.response?.data;
            if (errorData?.errors) {
                const messages = Object.values(errorData.errors).flat().join('\n');
                alert(`ERRORES DE VALIDACIÓN:\n${messages}`);
            } else {
                alert(errorData?.message || 'Error al procesar solicitud');
            }
        }
    };

    const handleEdit = (adm: User) => {
        setEditingAdmin(adm);
        setFormData({
            first_name: adm.first_name || '',
            last_name: adm.last_name || '',
            email: adm.email,
            phone: adm.phone || '',
            password: '',
            password_confirmation: ''
        });
        setIsAdding(true);
    };

    const handleBlock = async (id: string, currentlyBlocked: boolean) => {
        if (id === user?.id) {
            alert('No puedes bloquearte a ti mismo.');
            return;
        }
        if (!confirm(`¿Deseas ${currentlyBlocked ? 'desbloquear' : 'bloquear'} a este administrador?`)) return;
        try {
            await api.post(`/admin/users/${id}/block`);
            loadAdmins();
        } catch (error) {
            alert('Error al cambiar estado de bloqueo');
        }
    };

    const handleDelete = async (id: string) => {
        if (admins.length <= 1) {
            alert('No puedes eliminar al único administrador del sistema.');
            return;
        }
        if (!confirm('¿Deseas eliminar este administrador?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            loadAdmins();
        } catch (error) {
            alert('Error al eliminar administrador');
        }
    };

    if (loading || !user) {
        return <div className="p-20 text-center uppercase font-black tracking-widest text-slate-400">Cargando equipo administrativo...</div>;
    }

    return (
        <DashboardLayout user={user}>
            <div className="max-w-6xl mx-auto space-y-8 pb-20 uppercase font-bold">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard/admin" className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                            <ChevronLeft className="h-5 w-5 text-slate-500" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">EQUIPO ADMINISTRATIVO</h1>
                            <p className="text-slate-500 text-sm tracking-widest">CONTROL DE ACCESO TOTAL AL SISTEMA</p>
                        </div>
                    </div>
                    {!isAdding && (
                        <Button 
                            onClick={() => setIsAdding(true)}
                            className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black shadow-xl gap-2 border-none transition-all active:scale-95"
                        >
                            <UserPlus className="w-5 h-5" /> NUEVO ADMINISTRADOR
                        </Button>
                    )}
                </div>

                {isAdding ? (
                    <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                        <CardHeader className="bg-slate-900 text-white p-8">
                            <CardTitle className="text-2xl font-black">{editingAdmin ? 'EDITAR ADMINISTRADOR' : 'REGISTRAR NUEVO ADMIN'}</CardTitle>
                            <CardDescription className="text-slate-400 font-bold tracking-widest uppercase">
                                {editingAdmin ? 'MODIFICA LOS PRIVILEGIOS Y DATOS DE ACCESO' : 'ESTA CUENTA TENDRÁ TODOS LOS PRIVILEGIOS'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleCreateOrUpdate} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 ml-2">NOMBRE</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                            <input 
                                                required
                                                type="text" 
                                                className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900/5 transition-all text-sm font-bold"
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 ml-2">APELLIDO</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                            <input 
                                                required
                                                type="text" 
                                                className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900/5 transition-all text-sm font-bold"
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 ml-2">CORREO ELECTRÓNICO</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                            <input 
                                                required
                                                type="email" 
                                                className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900/5 transition-all text-sm font-bold"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 ml-2">TELÉFONO</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                            <input 
                                                required
                                                type="tel" 
                                                className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900/5 transition-all text-sm font-bold"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 ml-2">CONTRASEÑA</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                            <input 
                                                required={!editingAdmin}
                                                type="password" 
                                                placeholder={editingAdmin ? "DEJAR EN BLANCO PARA NO CAMBIAR" : ""}
                                                className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900/5 transition-all text-sm font-bold"
                                                value={formData.password}
                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 ml-2">CONFIRMAR CONTRASEÑA</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                            <input 
                                                required={!editingAdmin && !!formData.password}
                                                type="password" 
                                                placeholder={editingAdmin ? "DEJAR EN BLANCO PARA NO CAMBIAR" : ""}
                                                className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900/5 transition-all text-sm font-bold"
                                                value={formData.password_confirmation}
                                                onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <Button type="submit" className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-xl shadow-blue-500/10">
                                        {editingAdmin ? 'GUARDAR CAMBIOS' : 'GUARDAR ADMINISTRADOR'}
                                    </Button>
                                    <Button type="button" onClick={() => { setIsAdding(false); setEditingAdmin(null); }} variant="ghost" className="px-8 h-14 rounded-2xl border border-slate-200 font-black">
                                        CANCELAR
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {admins.map(adm => (
                            <Card key={adm.id} className={`rounded-[2.5rem] border border-white/40 shadow-2xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group overflow-hidden bg-white/70 backdrop-blur-xl ${adm.is_blocked ? 'opacity-60 grayscale' : ''}`}>
                                <div className="h-2 bg-slate-900" />
                                <CardContent className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                <ShieldCheck className="w-10 h-10" />
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 text-lg leading-tight uppercase">{adm.first_name} {adm.last_name}</div>
                                                <div className="text-[10px] text-blue-600 font-black tracking-[0.2em] mt-1">SOPORTE ADMIN</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                onClick={() => handleEdit(adm)}
                                                variant="ghost" 
                                                className="h-10 w-10 p-0 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            {adm.email !== user?.email && (
                                                <Button 
                                                    onClick={() => handleBlock(adm.id, !!adm.is_blocked)}
                                                    variant="ghost" 
                                                    className={`h-10 w-10 p-0 rounded-xl transition-all ${adm.is_blocked ? 'text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600'}`}
                                                >
                                                    {adm.is_blocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <Mail className="w-4 h-4" />
                                            <span className="text-[10px] font-black lowercase">{adm.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <Phone className="w-4 h-4" />
                                            <span className="text-[10px] font-black">{adm.phone}</span>
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <span className="text-[10px] text-emerald-500 font-black flex items-center gap-1.5">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> ACTIVO
                                        </span>
                                        {adm.email !== user?.email && (
                                            <Button 
                                                onClick={() => handleDelete(adm.id)}
                                                variant="ghost" 
                                                className="h-10 w-10 p-0 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
