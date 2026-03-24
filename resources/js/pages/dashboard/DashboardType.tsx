import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    FileText,
    CreditCard,
    Stethoscope,
    Clock,
    TrendingUp,
    Users,
    ChevronRight,
    Settings,
} from 'lucide-react';
import { api } from '@/lib/api';

interface DashboardStats {
    upcomingAppointments?: number;
    totalAppointments?: number;
    totalPatients?: number;
    totalRevenue?: number;
}

export default function DashboardType() {
    const navigate = useNavigate();
    const { type } = useParams<{ type: string }>();

    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<DashboardStats>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            navigate('/auth/login');
            return;
        }

        const currentUser = authService.getUser();
        // If type is provided in URL, it must match user type. 
        // If not provided (index route), we trust the user type.
        if (!currentUser || (type && currentUser.type !== type)) {
            navigate(`/dashboard/${currentUser?.type || 'patient'}`);
            return;
        }

        if (currentUser.type === 'admin') {
            navigate('/dashboard/admin');
            return;
        }

        setUser(currentUser);
        loadStats(currentUser.type);
    }, [type, navigate]);

    const loadStats = async (userType: string) => {
        try {
            const response = await api.get('/appointments');
            const appointments = Array.isArray(response.data) ? response.data : [];

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const todayApts = appointments.filter((apt: any) => {
                if (!apt.appointment_date) return false;
                const aptDate = new Date(apt.appointment_date);
                return aptDate >= today && aptDate < tomorrow && apt.status_name !== 'cancelled';
            });

            setStats({
                upcomingAppointments: todayApts.length,
                totalAppointments: appointments.length,
                totalPatients: userType === 'doctor' ? new Set(appointments.map((apt: any) => apt.patient?.id).filter(Boolean)).size : 0,
                totalRevenue: userType === 'doctor' ? appointments
                    .filter((apt: any) => apt.status_name === 'completed')
                    .reduce((sum: number, apt: any) => sum + Number(apt.price_usd || 0), 0) : 0,
            });
        } catch (error) {
            console.error('Error loading stats:', error);
            setStats({
                upcomingAppointments: 0,
                totalAppointments: 0,
                totalPatients: 0,
                totalRevenue: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }
    const StatCard = ({ title, value, icon: Icon, sub, color }: { title: string, value: any, icon: any, sub: string, color: string }) => (
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
                    <p className="text-white/60 text-xs mt-4 flex items-center gap-1 group-hover:text-white/80 transition-colors">
                        <TrendingUp className="h-3 w-3" />
                        {sub}
                    </p>
                </div>
            </CardContent>
        </Card>
    );

    const QuickActionButton = ({ to, icon: Icon, label, color, sub }: { to: string, icon: any, label: string, color: string, sub: string }) => (
        <Link to={to} className="block group">
            <div className={`flex items-center gap-4 p-4 rounded-[2rem] border border-slate-100 bg-white hover:bg-slate-50 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300`}>
                <div className={`h-14 w-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="h-7 w-7" />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{label}</p>
                    <p className="text-xs text-slate-500">{sub}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
        </Link>
    );

    if (user.type === 'patient') {
        return (
            <DashboardLayout user={user}>
                <div className="max-w-7xl mx-auto space-y-10 pb-12">
                    {/* Header Section */}
                    <div className="relative overflow-hidden rounded-[3rem] p-10 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-2xl shadow-blue-500/20">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full -ml-20 -mb-20 blur-3xl" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-xs font-bold uppercase tracking-widest">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    Sistema Activo
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                                    ¡Hola, {user.first_name}! 👋
                                </h1>
                                <p className="text-blue-100 text-lg md:text-xl max-w-xl font-medium leading-relaxed">
                                    Bienvenido a tu portal de salud. Estamos listos para cuidar de ti hoy.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <Link to={`/dashboard/${user.type}/doctors`}>
                                    <Button size="lg" className="h-16 px-8 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 text-lg font-bold shadow-xl shadow-blue-900/20 border-none group">
                                        Agendar Cita
                                        <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard 
                            title="Próximas Citas" 
                            value={stats.upcomingAppointments || 0} 
                            icon={Calendar} 
                            sub="Citas programadas para hoy"
                            color="from-blue-600 to-blue-500"
                        />
                        <StatCard 
                            title="Total Citas" 
                            value={stats.totalAppointments || 0} 
                            icon={Clock} 
                            sub="Historial médico completo"
                            color="from-indigo-600 to-indigo-500"
                        />
                        <StatCard 
                            title="Recetas" 
                            value="-" 
                            icon={FileText} 
                            sub="Prescripciones emitidas"
                            color="from-emerald-600 to-emerald-500"
                        />
                        <StatCard 
                            title="Pagos" 
                            value="-" 
                            icon={CreditCard} 
                            sub="Historial financiero"
                            color="from-rose-600 to-rose-500"
                        />
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Quick Actions */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-2xl font-black text-slate-800">Acciones Rápidas</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <QuickActionButton 
                                    to={`/dashboard/${user.type}/doctors`}
                                    icon={Stethoscope}
                                    label="Buscar Médico"
                                    sub="Especialistas de primer nivel"
                                    color="bg-blue-600"
                                />
                                <QuickActionButton 
                                    to={`/dashboard/${user.type}/appointments`}
                                    icon={Calendar}
                                    label="Mis Citas"
                                    sub="Ver agenda y videollamadas"
                                    color="bg-indigo-600"
                                />
                                <QuickActionButton 
                                    to={`/dashboard/${user.type}/medical-records`}
                                    icon={FileText}
                                    label="Historial"
                                    sub="Accede a tus informes médicos"
                                    color="bg-emerald-600"
                                />
                                <QuickActionButton 
                                    to={`/dashboard/${user.type}/settings`}
                                    icon={Users}
                                    label="Mi Perfil"
                                    sub="Datos personales y avisos"
                                    color="bg-rose-600"
                                />
                            </div>
                        </div>

                        {/* Side Card */}
                        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200 bg-white overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
                            <CardHeader className="p-8">
                                <CardTitle className="text-xl font-black">Agenda Médica</CardTitle>
                                <CardDescription className="text-slate-500">¿Necesitas atención?</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-6">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                                    <p className="text-slate-500 text-sm italic">
                                        "La salud es el regalo más grande, la mayor riqueza."
                                    </p>
                                </div>
                                <Link to={`/dashboard/${user.type}/doctors`}>
                                    <Button className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl transition-all">
                                        Explorar Especialistas
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (user.type === 'doctor') {
        return (
            <DashboardLayout user={user}>
                <div className="max-w-7xl mx-auto space-y-10 pb-12">
                    {/* Header Section */}
                    <div className="relative overflow-hidden rounded-[3rem] p-10 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-2xl shadow-blue-500/20">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl animate-pulse" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full -ml-20 -mb-20 blur-3xl" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-xs font-bold uppercase tracking-widest">
                                    Panel de Especialista
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                                    Bienvenido, Dr. {user.last_name}
                                </h1>
                                <p className="text-blue-100 text-lg font-medium leading-relaxed max-w-xl">
                                    Gestiona tu práctica médica y atiende a tus pacientes con la mejor tecnología.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Link to={`/dashboard/${user.type}/appointments`}>
                                    <Button size="lg" className="h-16 px-8 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 text-lg font-bold shadow-xl shadow-blue-900/20 border-none group">
                                        Ver Agenda de Hoy
                                        <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Alert for incomplete profile */}
                    {(!user.consultation_price_usd || !user.pago_movil_phone) && (
                        <div className="relative group overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-[2.5rem] p-8 shadow-xl shadow-amber-500/5 transition-all hover:shadow-amber-500/10">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Clock className="h-40 w-40 -mr-10 -mt-10" />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-5">
                                    <div className="p-4 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-500/30">
                                        <Clock className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-rose-900">Foto de Perfil Obligatoria</h3>
                                        <p className="text-rose-800/70 mt-1 font-medium max-w-md uppercase text-xs tracking-wider">
                                            Debes subir una foto de perfil profesional para poder activar tu cuenta y recibir pacientes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Alert for incomplete payment profile */}
                    {user.avatar_url && (!user.consultation_price_usd || !user.pago_movil_phone) && (
                        <div className="relative group overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-[2.5rem] p-8 shadow-xl shadow-amber-500/5 transition-all hover:shadow-amber-500/10">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Clock className="h-40 w-40 -mr-10 -mt-10" />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-5">
                                    <div className="p-4 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-500/30">
                                        <Clock className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-amber-900">Configuración Incompleta</h3>
                                        <p className="text-amber-800/70 mt-1 font-medium max-w-md uppercase text-xs tracking-wider">
                                            Debes configurar tu precio y métodos de pago para poder recibir citas de pacientes.
                                        </p>
                                    </div>
                                </div>
                                <Link to={`/dashboard/${user.type}/settings`}>
                                    <Button className="h-14 px-10 rounded-2xl bg-amber-900 hover:bg-amber-800 text-white font-bold shadow-xl shadow-amber-900/20 border-none transition-all active:scale-95">
                                        Completar Ahora
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard 
                            title="Citas Hoy" 
                            value={stats.upcomingAppointments || 0} 
                            icon={Calendar} 
                            sub="Consultas programadas"
                            color="from-blue-600 to-blue-500"
                        />
                        <StatCard 
                            title="Total Mensual" 
                            value={stats.totalAppointments || 0} 
                            icon={TrendingUp} 
                            sub="Citas realizadas este mes"
                            color="from-indigo-600 to-indigo-500"
                        />
                        <StatCard 
                            title="Pacientes" 
                            value={stats.totalPatients || 0} 
                            icon={Users} 
                            sub="Pacientes activos"
                            color="from-emerald-600 to-emerald-500"
                        />
                        <StatCard 
                            title="Ingresos" 
                            value={`$${stats.totalRevenue || 0}`} 
                            icon={CreditCard} 
                            sub="Total acumulado mensual"
                            color="from-rose-600 to-rose-500"
                        />
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="text-2xl font-black text-slate-800 px-2">Gestión Médica</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <QuickActionButton 
                                    to={`/dashboard/${user.type}/appointments`}
                                    icon={Calendar}
                                    label="Ver Agenda"
                                    sub="Gestiona tus citas diarias"
                                    color="bg-blue-600"
                                />
                                <QuickActionButton 
                                    to={`/dashboard/${user.type}/payments`}
                                    icon={CreditCard}
                                    label="Validar Pagos"
                                    sub="Verificar pagos de pacientes"
                                    color="bg-orange-600"
                                />
                                <QuickActionButton 
                                    to={`/dashboard/${user.type}/availability`}
                                    icon={Clock}
                                    label="Disponibilidad"
                                    sub="Configura tus horarios"
                                    color="bg-indigo-600"
                                />
                                <QuickActionButton 
                                    to={`/dashboard/${user.type}/patients`}
                                    icon={Users}
                                    label="Mis Pacientes"
                                    sub="Ver historial y documentos"
                                    color="bg-emerald-600"
                                />
                                <QuickActionButton 
                                    to={`/dashboard/${user.type}/settings`}
                                    icon={Settings}
                                    label="Mi Tarifa y Cobros"
                                    sub="Control financiero y perfil"
                                    color="bg-rose-600"
                                />
                            </div>
                        </div>

                        {/* Recent Appointments Placeholder or Side info */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-slate-800 px-2">Próximas Citas</h2>
                            <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200 bg-white overflow-hidden p-8 text-center space-y-4">
                                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-dashed border-slate-200">
                                    <Calendar className="h-8 w-8 text-slate-300" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-700">Sin citas para hoy</p>
                                    <p className="text-slate-500 text-sm">Aprovecha para revisar tus pendientes o configurar tus horarios.</p>
                                </div>
                                <Link to={`/dashboard/${user.type}/appointments`}>
                                    <Button variant="outline" className="w-full h-14 rounded-2xl font-bold transition-all border-slate-200 hover:bg-slate-50">
                                        Ver Agenda Completa
                                    </Button>
                                </Link>
                            </Card>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout user={user}>
            <div className="max-w-4xl mx-auto py-20 text-center space-y-6">
                <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <Stethoscope className="h-12 w-12 text-blue-600" />
                </div>
                <h1 className="text-4xl font-black text-slate-800">Dashboard</h1>
                <p className="text-xl text-slate-500">Bienvenido a Telemedicina Venezuela</p>
            </div>
        </DashboardLayout>
    );
}
