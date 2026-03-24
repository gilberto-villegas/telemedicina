import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
    Users, 
    Stethoscope, 
    BookOpen, 
    ShieldCheck, 
    ChevronRight,
    UserPlus,
    AlertCircle,
    Settings
} from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdminStats {
    total_doctors: number;
    total_patients: number;
    pending_doctors: number;
    total_specialties: number;
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            navigate('/auth/login');
            return;
        }

        const currentUser = authService.getUser();
        if (!currentUser || currentUser.type !== 'admin') {
            navigate(`/dashboard/${currentUser?.type || 'patient'}`);
            return;
        }

        setUser(currentUser);
        loadStats();
    }, [navigate]);

    const loadStats = async () => {
        try {
            const response = await api.get('/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error loading admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: any, icon: any, color: string }) => (
        <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-0">
                <div className={`p-6 bg-gradient-to-br ${color} relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-white/80 text-sm font-medium uppercase tracking-wider">{title}</p>
                            <h3 className="text-3xl font-black text-white mt-1">{value}</h3>
                        </div>
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl group-hover:rotate-12 transition-transform shadow-lg border border-white/30">
                            <Icon className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const AdminAction = ({ to, icon: Icon, label, color, sub }: { to: string, icon: any, label: string, color: string, sub: string }) => (
        <Link to={to} className="block group">
            <div className="flex items-center gap-4 p-4 rounded-[2rem] border border-slate-100 bg-white hover:bg-slate-50 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
                <div className={`h-14 w-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="h-7 w-7" />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{label}</p>
                    <p className="text-xs text-slate-500">{sub}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
        </Link>
    );

    return (
        <DashboardLayout user={user}>
            <div className="max-w-7xl mx-auto space-y-10 pb-12 uppercase">
                {/* Header Section */}
                <div className="relative overflow-hidden rounded-[3rem] p-10 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 shadow-2xl shadow-slate-500/20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full -ml-20 -mb-20 blur-3xl" />
                    
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-xs font-bold uppercase tracking-widest mb-6">
                            Panel de Control Administrativo
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                            Bienvenido, Administrador
                        </h1>
                        <p className="text-blue-100 text-lg md:text-xl max-w-xl font-medium leading-relaxed mt-4">
                            Supervisión y gestión global del sistema de telemedicina Venezuela.
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard 
                        title="Médicos" 
                        value={stats?.total_doctors || 0} 
                        icon={Stethoscope} 
                        color="from-blue-600 to-blue-500"
                    />
                    <StatCard 
                        title="Pacientes" 
                        value={stats?.total_patients || 0} 
                        icon={Users} 
                        color="from-emerald-600 to-emerald-500"
                    />
                    <StatCard 
                        title="Pendientes" 
                        value={stats?.pending_doctors || 0} 
                        icon={AlertCircle} 
                        color="from-amber-600 to-amber-500"
                    />
                    <StatCard 
                        title="Especialidades" 
                        value={stats?.total_specialties || 0} 
                        icon={BookOpen} 
                        color="from-indigo-600 to-indigo-500"
                    />
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-black text-slate-800 px-2 tracking-tighter">GESTIÓN DEL SISTEMA</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <AdminAction 
                                to="/dashboard/admin/doctors"
                                icon={Stethoscope}
                                label="Gestionar Médicos"
                                sub="Verificar, bloquear o editar"
                                color="bg-blue-600"
                            />
                            <AdminAction 
                                to="/dashboard/admin/patients"
                                icon={Users}
                                label="Gestionar Pacientes"
                                sub="Control de acceso y perfiles"
                                color="bg-emerald-600"
                            />
                            <AdminAction 
                                to="/dashboard/admin/specialties"
                                icon={BookOpen}
                                label="Especialidades"
                                sub="CRUD de especialidades médicas"
                                color="bg-indigo-600"
                            />
                            <AdminAction 
                                to="/dashboard/admin/admins"
                                icon={ShieldCheck}
                                label="Administradores"
                                sub="Gestionar equipo administrativo"
                                color="bg-slate-900"
                            />
                            <AdminAction 
                                to="/dashboard/admin/settings"
                                icon={Settings}
                                label="Mi Configuración"
                                sub="Perfil y datos de pago"
                                color="bg-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-slate-800 px-2 tracking-tighter">ACCESO RÁPIDO</h2>
                        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200 bg-white overflow-hidden p-8 text-center space-y-6">
                            <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto border border-dashed border-blue-200">
                                <UserPlus className="h-8 w-8 text-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <p className="font-black text-slate-900 text-lg">NUEVO ADMINISTRADOR</p>
                                <p className="text-slate-500 text-xs font-bold leading-relaxed px-4">
                                    CREA CUENTAS PARA TU EQUIPO DE TRABAJO CON TODOS LOS PRIVILEGIOS.
                                </p>
                            </div>
                            <Link to="/dashboard/admin/admins">
                                <Button className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xl transition-all">
                                    CREAR CUENTA
                                </Button>
                            </Link>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
