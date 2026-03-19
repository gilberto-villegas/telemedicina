import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ArrowLeft, User as UserIcon, Phone, Mail, CreditCard, 
  Calendar, ChevronRight, Activity, Stethoscope,
  Pill, Clock, AlertCircle, Shield, History as HistoryIcon
} from 'lucide-react';

interface PatientData {
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    document_id: string;
    email: string;
    phone: string;
    birth_date?: string;
    gender?: string;
  };
  appointments: Array<{
    id: string;
    appointment_date: string;
    status: string;
    status_name: string;
    reason: string;
    medical_record?: any;
    prescription?: any;
  }>;
}

function PremiumCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/40 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="px-8 py-5 border-b border-slate-100/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
          <Icon className="h-5 w-5 text-slate-400" />
        </div>
        <h3 className="font-bold text-slate-800 tracking-tight">{title}</h3>
      </div>
      <div className="p-8">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: any }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 py-4 border-b border-slate-50 last:border-0">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest sm:w-40 flex-shrink-0 flex items-center gap-2">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </span>
      <span className="text-sm text-slate-700 font-semibold">{value || '—'}</span>
    </div>
  );
}

export default function DoctorPatientDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) { navigate('/auth/login'); return; }
    const currentUser = authService.getUser();
    if (!currentUser || currentUser.type !== 'doctor') { navigate('/dashboard'); return; }
    setUser(currentUser);
    loadPatientData();
  }, [id]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/doctors/me/patients/${id}`);
      setData(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cargar datos del paciente');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout user={user}>
        <div className="max-w-4xl mx-auto py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-xl">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">{error || 'Paciente no encontrado'}</h2>
          <Link to="/dashboard/doctor/patients" className="mt-8 inline-block px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold">
            Volver a mi lista
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const { patient, appointments } = data;

  return (
    <DashboardLayout user={user}>
      <div className="max-w-5xl mx-auto pb-20">
        {/* Back Button */}
        <Link 
          to="/dashboard/doctor/patients" 
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-blue-600 transition-all mb-8 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-semibold">Regresar a Pacientes</span>
        </Link>

        {/* Header Profile */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-blue-600 rounded-[3rem] -rotate-1 opacity-[0.03] scale-105 pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-center gap-8 bg-white/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white shadow-2xl shadow-blue-500/5">
            <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-500/20">
              {patient.first_name[0]}{patient.last_name[0]}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
                  {patient.first_name} <span className="text-blue-600">{patient.last_name}</span>
                </h1>
                <div className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 mx-auto md:mx-0">
                  Paciente Verificado
                </div>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-slate-500 font-medium">
                <span className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-blue-400" /> CI: {patient.document_id}</span>
                <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-blue-400" /> {patient.email}</span>
                <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-blue-400" /> {patient.phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Personal Info */}
          <div className="space-y-8">
            <PremiumCard title="Ficha del Paciente" icon={UserIcon}>
              <div className="space-y-1">
                <InfoRow label="Género" value={patient.gender === 'male' ? 'Masculino' : 'Femenino'} />
                <InfoRow label="F. Nacimiento" value={patient.birth_date ? format(new Date(patient.birth_date), "d 'de' MMMM, yyyy", { locale: es }) : '—'} />
                <InfoRow label="Edad" value={patient.birth_date ? `${new Date().getFullYear() - new Date(patient.birth_date).getFullYear()} años` : '—'} />
              </div>
            </PremiumCard>

            <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10 transition-transform group-hover:scale-110 duration-500">
                <Shield className="h-40 w-40" />
              </div>
              <div className="relative z-10">
                <h4 className="font-black text-xl mb-4 italic flex items-center gap-3">
                  <Activity className="h-6 w-6 text-blue-400" />
                  Estado Clínico
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                    <span className="text-slate-400">Total Consultas</span>
                    <span className="font-bold text-blue-400">{appointments.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                    <span className="text-slate-400">Última Visita</span>
                    <span className="font-bold">{appointments[0] ? format(new Date(appointments[0].appointment_date), "dd/MM/yyyy") : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Appointment History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2 px-2">
              <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <HistoryIcon className="h-6 w-6 text-blue-600" />
                Historial de Consultas
              </h2>
            </div>

            {appointments.length === 0 ? (
              <div className="p-20 bg-white rounded-[2.5rem] border border-slate-100 text-center shadow-xl">
                 <Calendar className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                 <p className="text-slate-400 font-medium">No hay consultas previas con este paciente.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div key={apt.id} className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 p-7">
                      <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-2xl min-w-[80px]">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(apt.appointment_date), "MMM", { locale: es })}</span>
                        <span className="text-2xl font-black text-slate-900 tracking-tighter">{format(new Date(apt.appointment_date), "dd")}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            apt.status_name === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                            apt.status_name === 'cancelled' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                            {apt.status}
                          </span>
                          <span className="text-[10px] font-bold text-slate-300 uppercase">ID: #{apt.id.slice(0, 8)}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-lg mb-1">{apt.reason || 'Consulta General'}</h4>
                        <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-blue-400" /> {format(new Date(apt.appointment_date), "HH:mm")} hrs</span>
                          {apt.medical_record && <span className="flex items-center gap-1.5 text-emerald-600"><Stethoscope className="h-3.5 w-3.5" /> Informe SOAP</span>}
                          {apt.prescription && <span className="flex items-center gap-1.5 text-pink-600"><Pill className="h-3.5 w-3.5" /> Receta emitida</span>}
                        </div>
                      </div>
                      <Link to={`/dashboard/doctor/appointments/${apt.id}`}>
                        <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 rounded-xl font-bold transition-all group-hover:translate-x-1">
                          Detalles
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
