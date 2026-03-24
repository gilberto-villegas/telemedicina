import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
    Stethoscope, 
    ShieldCheck, 
    ShieldAlert, 
    Trash2, 
    ChevronLeft,
    Search,
    MoreHorizontal,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminDoctors() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [doctors, setDoctors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');

    useEffect(() => {
        const currentUser = authService.getUser();
        if (!currentUser || currentUser.type !== 'admin') {
            navigate('/dashboard');
            return;
        }
        setUser(currentUser);
        loadDoctors();
    }, []);

    const loadDoctors = async () => {
        try {
            const response = await api.get('/admin/doctors');
            setDoctors(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error loading doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id: string) => {
        if (!confirm('¿Deseas verificar a este médico?')) return;
        try {
            await api.post(`/admin/doctors/${id}/verify`);
            loadDoctors();
        } catch (error) {
            alert('Error al verificar médico');
        }
    };

    const handleBlock = async (id: string, currentlyBlocked: boolean) => {
        if (!confirm(`¿Deseas ${currentlyBlocked ? 'desbloquear' : 'bloquear'} a este médico?`)) return;
        try {
            await api.post(`/admin/users/${id}/block`);
            loadDoctors();
        } catch (error) {
            alert('Error al cambiar estado de bloqueo');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás SEGURO de eliminar este médico? Esta acción no se puede deshacer.')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            loadDoctors();
        } catch (error) {
            alert('Error al eliminar médico');
        }
    };

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = `${doc.first_name} ${doc.last_name} ${doc.email} ${doc.specialty}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || (filter === 'verified' ? doc.is_verified : !doc.is_verified);
        return matchesSearch && matchesFilter;
    });

    if (loading || !user) {
        return <div className="p-20 text-center uppercase font-black">Cargando médicos...</div>;
    }

    return (
        <DashboardLayout user={user}>
            <div className="max-w-7xl mx-auto space-y-8 pb-20 uppercase font-bold">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard/admin" className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                            <ChevronLeft className="h-5 w-5 text-slate-500" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Médicos Registrados</h1>
                            <p className="text-slate-500 text-sm">GESTIÓN DE PROFESIONALES DE LA SALUD</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="BUSCAR POR NOMBRE, EMAIL O ESPECIALIDAD..."
                                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl">
                                {(['all', 'verified', 'pending'] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-6 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${filter === f ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
                                    >
                                        {f === 'all' ? 'TODOS' : f === 'verified' ? 'VERIFICADOS' : 'PENDIENTES'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <div className="overflow-hidden">
                    <div className="overflow-x-auto p-1">
                        <table className="w-full border-separate border-spacing-y-3">
                            <thead>
                                <tr className="text-slate-400">
                                    <th className="px-8 py-5 text-left text-[10px] font-black tracking-widest uppercase bg-white/30 backdrop-blur-md first:rounded-l-2xl last:rounded-r-2xl">DR. / ESPECIALIDAD</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black tracking-widest uppercase bg-white/30 backdrop-blur-md">EMAIL / TLF</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black tracking-widest uppercase bg-white/30 backdrop-blur-md">ESTADO</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black tracking-widest uppercase bg-white/30 backdrop-blur-md first:rounded-l-2xl last:rounded-r-2xl">ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDoctors.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-black bg-white/70 backdrop-blur-xl rounded-[2.5rem]">NO SE ENCONTRARON MÉDICOS</td>
                                    </tr>
                                ) : (
                                    filteredDoctors.map(doc => (
                                        <tr key={doc.id} className={`group transition-all hover:scale-[1.01] hover:shadow-xl shadow-slate-900/5 ${doc.is_blocked ? 'opacity-60' : ''}`}>
                                            <td className="px-8 py-6 bg-white/70 backdrop-blur-xl first:rounded-l-[2.5rem] border-y border-l border-white/40">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-blue-50/50 rounded-2xl flex items-center justify-center text-blue-600 font-black shadow-inner">
                                                        {doc.avatar_url ? (
                                                            <img src={doc.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                                                        ) : (
                                                            <Stethoscope className="w-7 h-7" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-900 text-lg tracking-tight leading-tight">DR. {doc.first_name} {doc.last_name}</div>
                                                        <div className="text-[10px] text-blue-600 font-bold tracking-widest mt-1">{doc.specialty || 'SIN ESPECIALIDAD'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 bg-white/70 backdrop-blur-xl border-y border-white/40">
                                                <div className="text-sm text-slate-900 font-bold">{doc.email}</div>
                                                <div className="text-[11px] text-slate-400 font-medium mt-1 uppercase tracking-tight">{doc.phone}</div>
                                            </td>
                                            <td className="px-8 py-6 bg-white/70 backdrop-blur-xl border-y border-white/40">
                                                <div className="flex flex-col gap-1.5">
                                                    {doc.is_verified ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/80 text-emerald-600 text-[10px] font-black rounded-lg w-fit border border-emerald-100 uppercase tracking-widest">
                                                            <ShieldCheck className="w-3.5 h-3.5" /> VERIFICADO
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50/80 text-amber-600 text-[10px] font-black rounded-lg w-fit border border-amber-100 uppercase tracking-widest">
                                                            <ShieldAlert className="w-3.5 h-3.5" /> PENDIENTE
                                                        </span>
                                                    )}
                                                    {doc.is_blocked && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50/80 text-rose-600 text-[10px] font-black rounded-lg w-fit border border-rose-100 uppercase tracking-widest">
                                                            <XCircle className="w-3.5 h-3.5" /> BLOQUEADO
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 bg-white/70 backdrop-blur-xl last:rounded-r-[2.5rem] border-y border-r border-white/40 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-12 w-12 p-0 rounded-2xl hover:bg-slate-100/50 hover:scale-110 transition-all">
                                                            <MoreHorizontal className="h-6 w-6 text-slate-400" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-60 rounded-[1.5rem] border-white/40 bg-white/90 backdrop-blur-xl shadow-2xl uppercase font-black p-3">
                                                        <DropdownMenuLabel className="text-[10px] tracking-widest text-slate-400 mb-2">ACCIONES PROFESIONALES</DropdownMenuLabel>
                                                        <DropdownMenuSeparator className="bg-slate-100/50 mb-2" />
                                                        {!doc.is_verified && (
                                                            <DropdownMenuItem onClick={() => handleVerify(doc.id)} className="rounded-xl focus:bg-emerald-50 focus:text-emerald-600 cursor-pointer py-3">
                                                                <CheckCircle2 className="w-4 h-4 mr-3" /> VERIFICAR CRÉDENCIALES
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem onClick={() => handleBlock(doc.id, !!doc.is_blocked)} className={`rounded-xl cursor-pointer py-3 ${doc.is_blocked ? 'focus:bg-blue-50 focus:text-blue-600' : 'focus:bg-amber-50 focus:text-amber-600'}`}>
                                                            {doc.is_blocked ? <ShieldCheck className="w-4 h-4 mr-3" /> : <ShieldAlert className="w-4 h-4 mr-3" />}
                                                            {doc.is_blocked ? 'RESTAURAR ACCESO' : 'SUSPENDER CUENTA'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-100/50 my-2" />
                                                        <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="rounded-xl focus:bg-rose-50 focus:text-rose-600 cursor-pointer py-3 text-rose-500">
                                                            <Trash2 className="w-4 h-4 mr-3" /> ELIMINAR REGISTRO
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
