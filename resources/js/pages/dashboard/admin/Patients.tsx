import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
    ShieldAlert, 
    Trash2, 
    ChevronLeft,
    Search,
    MoreHorizontal,
    XCircle,
    UserCircle,
    ShieldCheck
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

export default function AdminPatients() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [patients, setPatients] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const currentUser = authService.getUser();
        if (!currentUser || currentUser.type !== 'admin') {
            navigate('/dashboard');
            return;
        }
        setUser(currentUser);
        loadPatients();
    }, []);

    const loadPatients = async () => {
        try {
            const response = await api.get('/admin/patients');
            setPatients(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error loading patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBlock = async (id: string, currentlyBlocked: boolean) => {
        if (!confirm(`¿Deseas ${currentlyBlocked ? 'desbloquear' : 'bloquear'} a este paciente?`)) return;
        try {
            await api.post(`/admin/users/${id}/block`);
            loadPatients();
        } catch (error) {
            alert('Error al cambiar estado de bloqueo');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás SEGURO de eliminar este paciente? Esta acción no se puede deshacer.')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            loadPatients();
        } catch (error) {
            alert('Error al eliminar paciente');
        }
    };

    const filteredPatients = patients.filter(p => {
        return `${p.first_name} ${p.last_name} ${p.email} ${p.document_id}`.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading || !user) {
        return <div className="p-20 text-center uppercase font-black tracking-widest text-slate-400">Cargando pacientes...</div>;
    }

    return (
        <DashboardLayout user={user}>
            <div className="max-w-7xl mx-auto space-y-8 pb-20 uppercase font-bold">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard/admin" className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                            <ChevronLeft className="h-5 w-5 text-slate-500" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">PACIENTES REGISTRADOS</h1>
                            <p className="text-slate-500 text-sm tracking-widest">GESTIÓN DE USUARIOS DEL SISTEMA</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                    <CardContent className="p-6">
                        <div className="relative group flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="BUSCAR POR NOMBRE, EMAIL O CÉDULA..."
                                className="w-full h-14 pl-12 pr-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-bold tracking-tight"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 tracking-[0.2em]">PACIENTE</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 tracking-[0.2em]">CONTACTO / CI</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 tracking-[0.2em]">ESTADO</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 tracking-[0.2em]">ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredPatients.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-slate-400 tracking-widest font-black">NO SE ENCONTRARON PACIENTES</td>
                                    </tr>
                                ) : (
                                    filteredPatients.map(p => (
                                        <tr key={p.id} className={`group hover:bg-slate-50/50 transition-colors ${p.is_blocked ? 'opacity-60' : ''}`}>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-black">
                                                        {p.avatar_url ? (
                                                            <img src={p.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
                                                        ) : (
                                                            <UserCircle className="w-6 h-6" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-900 text-sm tracking-tight">{p.first_name} {p.last_name}</div>
                                                        <div className="text-[10px] text-slate-400 uppercase">IDENTIFICADOR: {p.id.slice(0,8)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-xs text-slate-900 font-bold">{p.email}</div>
                                                <div className="text-[10px] text-slate-400">CI: {p.document_id} | TLF: {p.phone}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-1">
                                                    {p.is_blocked ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-lg w-fit">
                                                            <XCircle className="w-3 h-3" /> BLOQUEADO
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg w-fit">
                                                            <ShieldCheck className="w-3 h-3" /> ACTIVO
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100">
                                                            <MoreHorizontal className="h-5 w-5 text-slate-400" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-100 shadow-xl uppercase font-black p-2">
                                                        <DropdownMenuLabel className="text-[10px] tracking-widest text-slate-400">OPCIONES</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleBlock(p.id, !!p.is_blocked)} className={`rounded-xl cursor-pointer ${p.is_blocked ? 'focus:bg-emerald-50 focus:text-emerald-600' : 'focus:bg-amber-50 focus:text-amber-600'}`}>
                                                            {p.is_blocked ? <ShieldCheck className="w-4 h-4 mr-2" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
                                                            {p.is_blocked ? 'DESBLOQUEAR' : 'BLOQUEAR ACCESO'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleDelete(p.id)} className="rounded-xl focus:bg-rose-50 focus:text-rose-600 cursor-pointer">
                                                            <Trash2 className="w-4 h-4 mr-2" /> ELIMINAR PACIENTE
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
