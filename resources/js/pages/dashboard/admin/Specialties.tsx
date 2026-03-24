import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
    BookOpen, 
    Plus, 
    Pencil, 
    Trash2, 
    ChevronLeft,
    CheckCircle2,
    X
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Specialty {
    id: string;
    name: string;
}

export default function AdminSpecialties() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newSpecialtyName, setNewSpecialtyName] = useState('');

    useEffect(() => {
        const currentUser = authService.getUser();
        if (!currentUser || currentUser.type !== 'admin') {
            navigate('/dashboard');
            return;
        }
        setUser(currentUser);
        loadSpecialties();
    }, []);

    const loadSpecialties = async () => {
        try {
            const response = await api.get('/admin/specialties');
            setSpecialties(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error loading specialties:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newSpecialtyName.trim()) return;
        try {
            await api.post('/admin/specialties', { name: newSpecialtyName });
            setNewSpecialtyName('');
            setIsAdding(false);
            loadSpecialties();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al agregar especialidad');
        }
    };

    const handleUpdate = async (id: string) => {
        if (!newSpecialtyName.trim()) return;
        try {
            await api.put(`/admin/specialties/${id}`, { name: newSpecialtyName });
            setNewSpecialtyName('');
            setEditingId(null);
            loadSpecialties();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al actualizar especialidad');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Deseas eliminar esta especialidad?')) return;
        try {
            await api.delete(`/admin/specialties/${id}`);
            loadSpecialties();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al eliminar especialidad');
        }
    };

    if (loading || !user) {
        return <div className="p-20 text-center uppercase font-black tracking-widest text-slate-400">Cargando especialidades...</div>;
    }

    return (
        <DashboardLayout user={user}>
            <div className="max-w-4xl mx-auto space-y-8 pb-20 uppercase font-bold">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard/admin" className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                            <ChevronLeft className="h-5 w-5 text-slate-500" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">ESPECIALIDADES</h1>
                            <p className="text-slate-500 text-sm tracking-widest">CONFIGURACIÓN DE CATÁLOGO MÉDICO</p>
                        </div>
                    </div>
                    <Button 
                        onClick={() => { setIsAdding(true); setEditingId(null); setNewSpecialtyName(''); }}
                        className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-xl shadow-blue-500/20 gap-2 border-none transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> AGREGAR NUEVA
                    </Button>
                </div>

                {/* Content */}
                <div className="grid gap-4">
                    {isAdding && (
                        <Card className="rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50/30 overflow-hidden animate-in fade-in slide-in-from-top-4">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <input 
                                    type="text" 
                                    autoFocus
                                    placeholder="NOMBRE DE LA ESPECIALIDAD..."
                                    className="flex-1 h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    value={newSpecialtyName}
                                    onChange={(e) => setNewSpecialtyName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleAdd} className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 w-12 rounded-xl p-0">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </Button>
                                    <Button onClick={() => setIsAdding(false)} variant="ghost" className="text-rose-500 hover:bg-rose-50 h-12 w-12 rounded-xl p-0">
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-4">
                        {specialties.length === 0 ? (
                            <div className="p-20 text-center text-slate-400 tracking-widest font-black uppercase bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white/40">NO HAY ESPECIALIDADES CONFIGURADAS</div>
                        ) : (
                            specialties.map(spec => (
                                <div key={spec.id} className="group p-6 flex items-center justify-between bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-lg shadow-slate-200/20 hover:scale-[1.01] transition-all hover:shadow-blue-500/10">
                                    {editingId === spec.id ? (
                                        <div className="flex-1 flex items-center gap-4">
                                            <input 
                                                type="text" 
                                                autoFocus
                                                className="flex-1 h-14 bg-white/50 border border-blue-200 rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                value={newSpecialtyName}
                                                onChange={(e) => setNewSpecialtyName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdate(spec.id)}
                                            />
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleUpdate(spec.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 w-12 rounded-xl p-0">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </Button>
                                                <Button onClick={() => setEditingId(null)} variant="ghost" className="text-slate-400 hover:bg-slate-100 h-12 w-12 rounded-xl p-0">
                                                    <X className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-blue-50/50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                                    <BookOpen className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 group-hover:text-blue-700 transition-colors tracking-tight text-xl leading-tight">{spec.name}</div>
                                                    <div className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em] mt-1">REGISTRO SISTEMA</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button 
                                                    onClick={() => { setEditingId(spec.id); setNewSpecialtyName(spec.name); setIsAdding(false); }}
                                                    variant="ghost" 
                                                    className="h-12 w-12 p-0 rounded-2xl hover:bg-blue-50 hover:text-blue-600 hover:scale-110 transition-all"
                                                >
                                                    <Pencil className="w-5 h-5" />
                                                </Button>
                                                <Button 
                                                    onClick={() => handleDelete(spec.id)}
                                                    variant="ghost" 
                                                    className="h-12 w-12 p-0 rounded-2xl hover:bg-rose-50 hover:text-rose-600 hover:scale-110 transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
