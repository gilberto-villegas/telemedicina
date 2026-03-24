import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { authService, User } from '@/lib/auth';
import { api } from '@/lib/api';
import { 
    Building2, 
    Plus, 
    Edit2, 
    Trash2, 
    Search,
    CheckCircle2,
    X,
    Save,
    ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Bank {
    id: string;
    name: string;
    code: string;
    is_active: boolean;
}

export default function AdminBanks() {
    const [user, setUser] = useState<User | null>(null);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBank, setEditingBank] = useState<Bank | null>(null);
    const [formData, setFormData] = useState({ name: '', code: '', is_active: true });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const currentUser = authService.getUser();
        setUser(currentUser);
        loadBanks();
    }, []);

    const loadBanks = async () => {
        try {
            const response = await api.get('/banks');
            setBanks(response.data);
        } catch (error) {
            console.error('Error loading banks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingBank) {
                await api.put(`/admin/banks/${editingBank.id}`, formData);
            } else {
                await api.post('/admin/banks', formData);
            }
            setIsModalOpen(false);
            setEditingBank(null);
            setFormData({ name: '', code: '', is_active: true });
            loadBanks();
        } catch (error) {
            alert('Error al guardar el banco. Verifica que el código no esté duplicado.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este banco?')) return;
        try {
            await api.delete(`/admin/banks/${id}`);
            loadBanks();
        } catch (error) {
            alert('Error al eliminar el banco.');
        }
    };

    const openEditModal = (bank: Bank) => {
        setEditingBank(bank);
        setFormData({ name: bank.name, code: bank.code, is_active: bank.is_active });
        setIsModalOpen(true);
    };

    const filteredBanks = banks.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.code.includes(searchTerm)
    );

    if (loading || !user) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <DashboardLayout user={user}>
            <div className="max-w-7xl mx-auto space-y-10 pb-12 relative z-10">
                {/* Header Section */}
                <div className="relative overflow-hidden rounded-[3rem] p-10 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-2xl shadow-blue-500/20">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl animate-pulse" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-4">
                            <Link to="/dashboard/admin" className="group inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                                <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
                                Regresar
                            </Link>
                            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight uppercase">
                                Gestión de <span className="text-blue-200">Bancos</span>
                            </h1>
                            <p className="text-blue-100 text-lg max-w-xl font-medium uppercase tracking-tight">
                                Administra las entidades bancarias disponibles para pagos y configuraciones.
                            </p>
                        </div>
                        <button 
                            onClick={() => { setEditingBank(null); setFormData({ name: '', code: '', is_active: true }); setIsModalOpen(true); }}
                            className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all flex items-center gap-3 active:scale-95"
                        >
                            <Plus className="h-5 w-5" />
                            Agregar Banco
                        </button>
                    </div>
                </div>

                {/* Filters & Content */}
                <div className="space-y-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar por nombre o código..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all font-medium text-slate-700"
                        />
                    </div>

                    <div className="overflow-hidden">
                        <table className="w-full border-separate border-spacing-y-3">
                            <thead>
                                <tr className="text-slate-500">
                                    <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-[0.2em] first:rounded-l-2xl last:rounded-r-2xl bg-white/50 backdrop-blur-md border border-white/40 shadow-sm">Entidad Bancaria</th>
                                    <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-[0.2em] bg-white/50 backdrop-blur-md border border-white/40 shadow-sm">Código</th>
                                    <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-[0.2em] bg-white/50 backdrop-blur-md border border-white/40 shadow-sm">Estado</th>
                                    <th className="px-8 py-5 text-right text-[11px] font-black uppercase tracking-[0.2em] first:rounded-l-2xl last:rounded-r-2xl bg-white/50 backdrop-blur-md border border-white/40 shadow-sm">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBanks.map((bank) => (
                                    <tr key={bank.id} className="group transition-all hover:scale-[1.01]">
                                        <td className="px-8 py-6 bg-white/70 backdrop-blur-xl border-y border-l border-white/40 first:rounded-l-[2.5rem]">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                                                    <Building2 className="h-6 w-6" />
                                                </div>
                                                <span className="font-black text-slate-800 uppercase text-sm tracking-tighter">{bank.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 bg-white/70 backdrop-blur-xl border-y border-white/40">
                                            <span className="font-mono font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-lg tracking-widest">{bank.code}</span>
                                        </td>
                                        <td className="px-8 py-6 bg-white/70 backdrop-blur-xl border-y border-white/40">
                                            {bank.is_active ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-black uppercase tracking-widest">
                                                    <X className="h-3 w-3" />
                                                    Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 bg-white/70 backdrop-blur-xl border-y border-r border-white/40 last:rounded-r-[2.5rem] text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => openEditModal(bank)}
                                                    className="p-3 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl transition-all shadow-sm border border-white group/btn"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(bank.id)}
                                                    className="p-3 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl transition-all shadow-sm border border-white"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white w-full max-w-lg p-10 space-y-8 animate-in zoom-in-95 duration-300">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                                    {editingBank ? 'Editar Banco' : 'Nuevo Banco'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="h-6 w-6 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre de la Entidad</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all font-bold uppercase"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Código Bancario</label>
                                        <input 
                                            type="text" 
                                            required
                                            maxLength={4}
                                            placeholder="XXXX"
                                            value={formData.code}
                                            onChange={(e) => setFormData({...formData, code: e.target.value.replace(/\D/g, '')})}
                                            className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all font-black"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Estado</label>
                                        <select 
                                            value={formData.is_active ? 'true' : 'false'}
                                            onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                                            className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all font-bold"
                                        >
                                            <option value="true">ACTIVO</option>
                                            <option value="false">INACTIVO</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 rounded-2xl border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> : <Save className="h-4 w-4" />}
                                        {editingBank ? 'Actualizar' : 'Guardar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
