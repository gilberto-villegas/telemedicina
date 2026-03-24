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
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 tracking-widest">DR. / ESPECIALIDAD</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 tracking-widest">EMAIL / TLF</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 tracking-widest">ESTADO</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 tracking-widest">ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredDoctors.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-slate-400">NO SE ENCONTRARON MÉDICOS</td>
                                    </tr>
                                ) : (
                                    filteredDoctors.map(doc => (
                                        <tr key={doc.id} className={`group hover:bg-slate-50/50 transition-colors ${doc.is_blocked ? 'opacity-60' : ''}`}>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black">
                                                        {doc.avatar_url ? (
                                                            <img src={doc.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
                                                        ) : (
                                                            <Stethoscope className="w-6 h-6" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-900">DR. {doc.first_name} {doc.last_name}</div>
                                                        <div className="text-[10px] text-blue-600">{doc.specialty || 'SIN ESPECIALIDAD'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-xs text-slate-900">{doc.email}</div>
                                                <div className="text-[10px] text-slate-400">{doc.phone}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-1">
                                                    {doc.is_verified ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg w-fit">
                                                            <ShieldCheck className="w-3 h-3" /> VERIFICADO
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-lg w-fit">
                                                            <ShieldAlert className="w-3 h-3" /> PENDIENTE
                                                        </span>
                                                    )}
                                                    {doc.is_blocked && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-lg w-fit">
                                                            <XCircle className="w-3 h-3" /> BLOQUEADO
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100">
                                                            <MoreHorizontal className="h-5 w-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-100 shadow-xl uppercase font-black p-2">
                                                        <DropdownMenuLabel className="text-[10px] tracking-widest text-slate-400">ACCIONES</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        {!doc.is_verified && (
                                                            <DropdownMenuItem onClick={() => handleVerify(doc.id)} className="rounded-xl focus:bg-emerald-50 focus:text-emerald-600 cursor-pointer">
                                                                <CheckCircle2 className="w-4 h-4 mr-2" /> VERIFICAR
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem onClick={() => handleBlock(doc.id, !!doc.is_blocked)} className={`rounded-xl cursor-pointer ${doc.is_blocked ? 'focus:bg-blue-50 focus:text-blue-600' : 'focus:bg-amber-50 focus:text-amber-600'}`}>
                                                            {doc.is_blocked ? <ShieldCheck className="w-4 h-4 mr-2" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
                                                            {doc.is_blocked ? 'DESBLOQUEAR' : 'BLOQUEAR'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="rounded-xl focus:bg-rose-50 focus:text-rose-600 cursor-pointer">
                                                            <Trash2 className="w-4 h-4 mr-2" /> ELIMINAR
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
