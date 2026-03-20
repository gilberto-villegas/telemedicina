import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Calendar, Clock, Video, Stethoscope, CheckCircle, XCircle, ArrowLeft, Plus, MessageSquare, Phone } from 'lucide-react';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Appointment {
  id: string;
  appointment_date: string;
  status: string;
  status_name: string;
  reason: string;
  type: 'videoconsulta' | 'teleconsulta';
  duration_minutes: number;
  doctor?: { id: string; first_name: string; last_name: string; specialty: any; avatar_url?: string; };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  scheduled:            { label: 'Programada',       color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',     dot: 'bg-blue-500' },
  in_progress:          { label: 'En Curso',          color: 'text-green-700',  bg: 'bg-green-50 border-green-200',   dot: 'bg-green-500' },
  completed:            { label: 'Completada',        color: 'text-gray-700',   bg: 'bg-gray-50 border-gray-200',     dot: 'bg-gray-400' },
  cancelled:            { label: 'Cancelada',         color: 'text-red-700',    bg: 'bg-red-50 border-red-200',       dot: 'bg-red-500' },
  pending_payment:      { label: 'Pago Pendiente',    color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', dot: 'bg-yellow-500' },
  pending_verification: { label: 'Verificando Pago', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', dot: 'bg-orange-500' },
};

function StatusBadge({ statusName, status }: { statusName: string; status: string }) {
  const cfg = STATUS_CONFIG[statusName] || { label: status, color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function AppointmentCard({ apt, onCancel }: {
  apt: Appointment; onCancel: (id: string) => void; isPatient: boolean;
}) {
  const date = new Date(apt.appointment_date);
  const persona = apt.doctor ? `Dr. ${apt.doctor.first_name} ${apt.doctor.last_name}` : 'Médico';
  const specialty = apt.doctor?.specialty;
  const videoBase = `/dashboard/patient/appointments/${apt.id}/video`;

  const TypeIcon = apt.type === 'videoconsulta' ? Video : Phone;
  const typeLabel = apt.type === 'videoconsulta' ? 'Videoconsulta' : 'Teleconsulta';
  const typeColor = apt.type === 'videoconsulta' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="flex items-stretch">
        {/* Date strip */}
        <div className="bg-gradient-to-b from-blue-600 to-indigo-600 flex flex-col items-center justify-center px-4 py-5 min-w-[72px] text-white text-center">
          <span className="text-xs font-medium opacity-80 uppercase">{format(date, 'MMM', { locale: es })}</span>
          <span className="text-2xl font-black">{format(date, 'd')}</span>
          <span className="text-xs opacity-70">{format(date, 'HH:mm')}</span>
        </div>

        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-100">
                  {apt.doctor?.avatar_url ? (
                    <img src={apt.doctor.avatar_url} alt="Dr." className="w-full h-full object-cover" />
                  ) : (
                    <Stethoscope className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <h3 className="font-bold text-gray-900">{persona}</h3>
                <StatusBadge statusName={apt.status_name} status={apt.status} />
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${typeColor}`}>
                  <TypeIcon className="w-3 h-3" />
                  {typeLabel}
                </span>
              </div>
              {specialty && (
                <p className="text-xs text-gray-500 ml-10 mt-0.5">
                  {typeof specialty === 'object' ? (specialty?.name || 'Médico General') : (specialty || 'Médico General')}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 ml-10 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{apt.duration_minutes} min</span>
              </div>
              {apt.reason && (
                <p className="text-sm text-gray-600 mt-2 ml-10">
                  <span className="font-medium">Motivo:</span> {apt.reason}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              {apt.status_name === 'scheduled' && (
                <>
                  {apt.type === 'videoconsulta' && (
                    <Link to={videoBase}>
                      <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-all w-full">
                        <Video className="h-3.5 w-3.5" />
                        Unirse
                      </button>
                    </Link>
                  )}
                  {apt.type === 'teleconsulta' && (
                    <Link to={`/dashboard/patient/chat?doctor=${apt.doctor?.id}&appointment=${apt.id}`}>
                      <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-all w-full">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Chat
                      </button>
                    </Link>
                  )}
                  <button
                    onClick={() => onCancel(apt.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition-all"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancelar
                  </button>
                </>
              )}
              {apt.status_name === 'in_progress' && (
                <Link to={videoBase}>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-all">
                    <Video className="h-3.5 w-3.5" />
                    Entrar
                  </button>
                </Link>
              )}
              {apt.status_name === 'completed' && (
                <Link to={`/dashboard/patient/appointments/${apt.id}`}>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all w-full">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    Ver
                  </button>
                </Link>
              )}
              <Link to={`/dashboard/patient/chat?doctor=${apt.doctor?.id}&appointment=${apt.id}`} className="w-full">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all w-full">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Chat
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PatientAppointmentsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [typeFilter, setTypeFilter] = useState<'all' | 'videoconsulta' | 'teleconsulta'>('all');

  useEffect(() => {
    if (!authService.isAuthenticated()) { navigate('/auth/login'); return; }
    const currentUser = authService.getUser();
    if (!currentUser || currentUser.type !== 'patient') { navigate(`/dashboard/${currentUser?.type || 'patient'}`); return; }
    setUser(currentUser);
    loadAppointments();
  }, [navigate]);

  const loadAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(Array.isArray(response.data) ? response.data : []);
    } catch { setAppointments([]); } finally { setLoading(false); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('¿Estás seguro de cancelar esta cita?')) return;
    try { await api.put(`/appointments/${id}/cancel`); loadAppointments(); }
    catch { alert('Error al cancelar la cita'); }
  };

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
        <p className="mt-3 text-gray-500 text-sm">Cargando citas...</p>
      </div>
    </div>
  );

  const upcoming = appointments.filter(a =>
    new Date(a.appointment_date) > new Date() && !['cancelled', 'completed'].includes(a.status_name)
  ).sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());

  const past = appointments.filter(a =>
    new Date(a.appointment_date) <= new Date() || ['completed', 'cancelled'].includes(a.status_name)
  ).sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());

  const displayed = activeTab === 'upcoming' 
    ? upcoming.filter(a => typeFilter === 'all' || a.type === typeFilter)
    : past.filter(a => typeFilter === 'all' || a.type === typeFilter);

  return (
    <DashboardLayout user={user}>
      <div className="max-w-5xl mx-auto pb-20">
        {/* Header */}
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <Link
            to="/dashboard/patient"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-blue-600 hover:border-blue-100 transition-all mb-8 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-semibold">Regresar</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-2 uppercase">
                Mis <span className="text-blue-600">Consultas</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium">Gestiona tu historial y próximas citas médicas</p>
            </div>
            <Link to="/dashboard/patient/doctors">
              <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200 active:scale-95 group">
                <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                <span>Nueva Cita</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Próximas', value: upcoming.length, color: 'text-blue-600', bg: 'bg-blue-50/50', icon: Calendar },
            { label: 'Completadas', value: appointments.filter(a => a.status_name === 'completed').length, color: 'text-emerald-600', bg: 'bg-emerald-50/50', icon: CheckCircle },
            { label: 'Canceladas', value: appointments.filter(a => a.status_name === 'cancelled').length, color: 'text-rose-600', bg: 'bg-rose-50/50', icon: XCircle },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className={`${bg} rounded-3xl p-6 border border-white shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]`}>
              <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <div className={`text-2xl font-black ${color}`}>{value}</div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs and Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div className="flex gap-1 bg-slate-100/50 backdrop-blur-sm p-1.5 rounded-2xl w-fit border border-slate-200/50">
            {(['upcoming', 'past'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-white text-slate-900 shadow-md' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab === 'upcoming' ? `Próximas` : `Historial`}
              </button>
            ))}
          </div>

          <div className="flex gap-1 bg-white p-1 rounded-2xl w-fit border border-slate-200 shadow-sm">
            {(['all', 'videoconsulta', 'teleconsulta'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                  typeFilter === t 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t === 'all' ? 'Todas' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6">
                <Calendar className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                {activeTab === 'upcoming' ? 'No tienes citas próximas' : 'Sin historial de citas'}
              </h3>
              <p className="text-slate-400 mt-2 max-w-xs text-center">
                {activeTab === 'upcoming' 
                  ? 'Agenda una consulta con uno de nuestros especialistas.' 
                  : 'Tus consultas finalizadas aparecerán aquí.'}
              </p>
              {activeTab === 'upcoming' && (
                <Link to="/dashboard/patient/doctors" className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold transition-all hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-500/20">
                  Buscar médico
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {displayed.map((apt) => (
                <AppointmentCard key={apt.id} apt={apt} onCancel={handleCancel} isPatient={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
