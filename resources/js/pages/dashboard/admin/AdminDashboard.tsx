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
    Settings,
    Activity,
    Clock,
    Building2,
    CreditCard
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
        <Card className="overflow-hidden border border-white/20 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group bg-white/80 backdrop-blur-xl">
            <CardContent className="p-0">
                <div className={`p-6 bg-gradient-to-br ${color} relative overflow-hidden opacity-90 group-hover:opacity-100 transition-opacity`}>
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
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
            <div className="flex items-center gap-5 p-5 rounded-[2.5rem] border border-white/40 bg-white/70 backdrop-blur-xl hover:bg-white/90 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-500">
                <div className={`h-14 w-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="h-7 w-7" />
                </div>
                <div className="flex-1">
                    <p className="font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tighter text-sm">{label}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{sub}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
        </Link>
    );

    return (
        <DashboardLayout user={user}>
            <div className="max-w-7xl mx-auto space-y-10 pb-12 uppercase relative z-10">
                {/* Header Section (Doctor Style Sync) */}
                <div className="relative overflow-hidden rounded-[3rem] p-10 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-2xl shadow-blue-500/20">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full -ml-20 -mb-20 blur-3xl" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-xs font-bold uppercase tracking-widest">
                                Panel de Control Administrativo
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight uppercase">
                                BIENVENIDO, <br/> ADMINISTRADOR
                            </h1>
                            <p className="text-blue-100 text-lg md:text-xl max-w-xl font-medium leading-relaxed uppercase tracking-tight">
                                Supervisión y gestión global del sistema de telemedicina Venezuela.
                            </p>
                        </div>
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
                                 to="/dashboard/admin/banks"
                                 icon={Building2}
                                 label="Bancos"
                                 sub="Gestión de entidades bancarias"
                                 color="bg-orange-600"
                             />
                            <AdminAction 
                                to="/dashboard/admin/payments"
                                icon={CreditCard}
                                label="Validar Pagos"
                                sub="Verificar transacciones del sistema"
                                color="bg-amber-600"
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
                        <h2 className="text-2xl font-black text-slate-800 px-6 tracking-tighter uppercase">ACCESO RÁPIDO</h2>
                        <Card className="rounded-[3rem] border border-white/40 shadow-2xl shadow-slate-200 bg-white/70 backdrop-blur-xl overflow-hidden p-10 text-center space-y-8 group hover:bg-white/90 transition-all duration-500">
                            <div className="h-24 w-24 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                <UserPlus className="h-10 w-10 text-white" />
                            </div>
                            <div className="space-y-3">
                                <p className="font-black text-slate-900 text-xl tracking-tighter uppercase leading-none">NUEVO <br/> ADMINISTRADOR</p>
                                <p className="text-slate-500 text-[10px] font-black leading-relaxed px-4 uppercase tracking-widest">
                                    CONCEDE PRIVILEGIOS TOTALES AL EQUIPO.
                                </p>
                            </div>
                            <Link to="/dashboard/admin/admins">
                                <Button className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs tracking-widest shadow-2xl transition-all uppercase">
                                    CREAR CUENTA
                                </Button>
                            </Link>
                        </Card>

                        {/* Recent Activity Mini Widget */}
                        <h2 className="text-xl font-black text-slate-800 px-6 tracking-tighter mt-12 uppercase">ACTIVIDAD RECIENTE</h2>
                        <Card className="rounded-[3rem] border border-white/40 shadow-2xl shadow-slate-100 bg-white/70 backdrop-blur-xl overflow-hidden p-8 hover:bg-white/90 transition-all duration-500">
                            <div className="space-y-5">
                                {[
                                    { text: "NUEVA ESPECIALIDAD: NEUROLOGÍA", time: "HACE 5 MIN", icon: Activity, color: "text-blue-500" },
                                    { text: "MÉDICO VALIDADO: DR. GARCÍA", time: "HACE 12 MIN", icon: Clock, color: "text-emerald-500" },
                                    { text: "SISTEMA ACTUALIZADO", time: "HACE 1 HORA", icon: ShieldCheck, color: "text-purple-500" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white transition-all">
                                        <div className={`p-3 rounded-xl bg-slate-100 ${item.color} shadow-sm`}>
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter leading-tight">{item.text}</p>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
