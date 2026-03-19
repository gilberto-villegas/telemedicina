import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Calendar, Clock, Video, User as UserIcon, CheckCircle, ArrowLeft, Activity } from 'lucide-react';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Appointment {
  id: string;
  appointment_date: string;
  status: string;
  status_name: string;
  reason: string;
  duration_minutes: number;
  patient?: { id: string; first_name: string; last_name: string; document_id: string; };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  scheduled:            { label: 'Programada',         color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',   dot: 'bg-blue-500' },
  in_progress:          { label: 'En Curso',            color: 'text-green-700',  bg: 'bg-green-50 border-green-200', dot: 'bg-green-500' },
  completed:            { label: 'Completada',          color: 'text-gray-700',   bg: 'bg-gray-50 border-gray-200',   dot: 'bg-gray-400' },
  cancelled:            { label: 'Cancelada',           color: 'text-red-700',    bg: 'bg-red-50 border-red-200',     dot: 'bg-red-500' },
  pending_payment:      { label: 'Pago Pendiente',      color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', dot: 'bg-yellow-500' },
  pending_verification: { label: 'Verificando Pago',   color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', dot: 'bg-orange-500' },
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

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
        <p className="mt-3 text-gray-500 text-sm">Cargando agenda...</p>
      </div>
    </div>
  );
}

export default function DoctorAppointmentsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) { navigate('/auth/login'); return; }
    const currentUser = authService.getUser();
    if (!currentUser || currentUser.type !== 'doctor') { navigate(`/dashboard/${currentUser?.type || 'patient'}`); return; }
    setUser(currentUser);
    loadAppointments();
  }, [navigate, selectedDate]);

  const loadAppointments = async () => {
    try {
      const response = await api.get(`/appointments?date=${selectedDate}`);
      setAppointments(Array.isArray(response.data) ? response.data : []);
    } catch { setAppointments([]); } finally { setLoading(false); }
  };

  const startAppointment = async (id: string) => {
    try { await api.post(`/appointments/${id}/join`); navigate(`/dashboard/doctor/appointments/${id}/video`); }
    catch { alert('Error al iniciar la consulta'); }
  };

  if (loading || !user) return <LoadingState />;

  const todayAppointments = appointments
    .filter(a => new Date(a.appointment_date).toISOString().split('T')[0] === selectedDate && a.status_name !== 'cancelled')
    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());

  const formattedDate = format(new Date(selectedDate + 'T12:00:00'), "EEEE, d 'de' MMMM yyyy", { locale: es });

  return (
    <DashboardLayout user={user}>
      <div className="max-w-5xl mx-auto pb-20">
        {/* Page Header */}
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <Link
            to="/dashboard/doctor"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-blue-600 hover:border-blue-100 transition-all mb-8 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-semibold">Regresar</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-2 uppercase">
                Mi <span className="text-blue-600">Agenda</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium capitalize">{formattedDate}</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-12 px-4 rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 shadow-sm transition-all"
              />
              <Link
                to="/dashboard/doctor/availability"
                className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                <Calendar className="h-5 w-5 text-blue-500" />
                <span>Horarios</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total hoy', value: todayAppointments.length, color: 'text-blue-600', bg: 'bg-blue-50/50', icon: Calendar },
            { label: 'En curso', value: todayAppointments.filter(a => a.status_name === 'in_progress').length, color: 'text-emerald-600', bg: 'bg-emerald-50/50', icon: Activity },
            { label: 'Completadas', value: todayAppointments.filter(a => a.status_name === 'completed').length, color: 'text-slate-600', bg: 'bg-slate-50/50', icon: CheckCircle },
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

        {/* Appointments List */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
              Citas Programadas — {todayAppointments.length}
            </h2>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6">
                <Calendar className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">No hay citas para hoy</h3>
              <p className="text-slate-400 mt-2">Disfruta de tu tiempo libre o revisa tu disponibilidad.</p>
              <Link to="/dashboard/doctor/availability" className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold transition-all hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-500/20">
                Configurar Horarios
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {todayAppointments.map((apt) => (
                <div key={apt.id} className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-stretch">
                    {/* Time strip */}
                    <div className="bg-slate-900 flex flex-col items-center justify-center px-6 py-6 sm:w-[100px] text-white transition-colors group-hover:bg-blue-600">
                      <Clock className="h-4 w-4 mb-2 opacity-50" />
                      <span className="text-xl font-black">{format(new Date(apt.appointment_date), 'HH:mm')}</span>
                      <span className="text-[10px] font-bold opacity-50 uppercase tracking-tighter mt-1">{apt.duration_minutes} min</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 flex-shrink-0 transition-colors group-hover:bg-blue-50 group-hover:text-blue-500">
                          <UserIcon className="h-7 w-7" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h3 className="font-extrabold text-slate-900 text-lg truncate">
                              {apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : 'Paciente'}
                            </h3>
                            <StatusBadge statusName={apt.status_name} status={apt.status} />
                          </div>
                          <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                            <span className="uppercase tracking-wider">CI: {apt.patient?.document_id || 'N/A'}</span>
                            {apt.reason && (
                              <>
                                <span className="text-slate-200 font-normal">•</span>
                                <span className="text-slate-500 truncate max-w-[200px]">{apt.reason}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        {apt.status_name === 'scheduled' && (
                          <>
                            <button
                              onClick={() => startAppointment(apt.id)}
                              className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-95 flex items-center gap-2"
                            >
                              <Video className="h-4 w-4" />
                              Iniciar
                            </button>
                            <Link to={`/dashboard/doctor/appointments/${apt.id}`}>
                              <button className="px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95">
                                Detalles
                              </button>
                            </Link>
                          </>
                        )}
                        {apt.status_name === 'in_progress' && (
                          <Link to={`/dashboard/doctor/appointments/${apt.id}/video`}>
                            <button className="px-8 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/10 active:scale-95 flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              Continuar
                            </button>
                          </Link>
                        )}
                        {apt.status_name === 'completed' && (
                          <Link to={`/dashboard/doctor/appointments/${apt.id}`}>
                            <button className="px-6 py-3 bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-emerald-500" />
                              Ver Registro
                            </button>
                          </Link>
                        )}
                        {apt.status_name === 'cancelled' && (
                           <span className="text-xs font-bold text-rose-500 uppercase tracking-widest px-4">Cancelada</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
