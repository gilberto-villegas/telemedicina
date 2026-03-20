import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileText, Calendar, Stethoscope, Eye, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MedicalRecord {
  id: string;
  appointment_id: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  created_at: string;
  appointment?: {
    doctor: { first_name: string; last_name: string; specialty: string; };
    appointment_date: string;
  };
  attachments?: Array<{ id: string; file_name: string; file_url: string; file_type: string; }>;
}

const SOAP_SECTIONS = [
  { key: 'subjective',  label: 'S — Subjetivo',  color: 'border-l-blue-400',   bg: 'bg-blue-50',   desc: 'Síntomas reportados por el paciente' },
  { key: 'objective',   label: 'O — Objetivo',    color: 'border-l-purple-400', bg: 'bg-purple-50', desc: 'Hallazgos clínicos observados' },
  { key: 'assessment',  label: 'A — Evaluación',  color: 'border-l-orange-400', bg: 'bg-orange-50', desc: 'Diagnóstico y razonamiento clínico' },
  { key: 'plan',        label: 'P — Plan',         color: 'border-l-green-400',  bg: 'bg-green-50',  desc: 'Tratamiento y seguimiento' },
] as const;

function RecordCard({ record }: { record: MedicalRecord }) {
  const [expanded, setExpanded] = useState(false);
  const doctor = record.appointment?.doctor;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Card header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900">
              {doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Registro Médico'}
            </p>
            {doctor && <p className="text-sm text-blue-600 font-medium">{doctor.specialty}</p>}
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(record.created_at), "d 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>
        </div>
        <div className={`p-1.5 rounded-lg transition-colors ${expanded ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expanded SOAP notes */}
      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">
          <div className="grid md:grid-cols-2 gap-3">
            {SOAP_SECTIONS.map(({ key, label, color, bg, desc }) => {
              const value = record[key as keyof MedicalRecord] as string;
              return (
                <div key={key} className={`${bg} border-l-4 ${color} rounded-r-xl p-4`}>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-xs text-gray-400 mb-2">{desc}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{value || 'No especificado'}</p>
                </div>
              );
            })}
          </div>

          {/* Attachments */}
          {record.attachments && record.attachments.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Archivos Adjuntos</p>
              <div className="flex flex-wrap gap-2">
                {record.attachments.map((att) => (
                  <button
                    key={att.id}
                    onClick={() => window.open(att.file_url, '_blank')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-all"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {att.file_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-gray-100">
            <Link to={`/dashboard/patient/appointments/${record.appointment_id}`}>
              <button className="text-xs text-blue-600 hover:underline font-medium">
                Ver cita relacionada →
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MedicalRecordsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) { navigate('/auth/login'); return; }
    const currentUser = authService.getUser();
    if (!currentUser || currentUser.type !== 'patient') { navigate(`/dashboard/${currentUser?.type || 'patient'}`); return; }
    setUser(currentUser);
    api.get('/patients/me/medical-records')
      .then(r => setRecords(Array.isArray(r.data) ? r.data : (r.data?.data || [])))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <Link to="/dashboard/patient" className="group inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-4">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-bold uppercase tracking-widest">Panel Principal</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Historial Clínico</h1>
          <p className="text-gray-500 mt-0.5">Tu historial médico completo y seguro</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Registros', value: records.length, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Especialistas', value: new Set(records.map(r => r.appointment?.doctor?.specialty).filter(Boolean)).size, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Este Año', value: records.filter(r => new Date(r.created_at).getFullYear() === new Date().getFullYear()).length, color: 'text-green-600', bg: 'bg-green-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
              <div className={`text-3xl font-black ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 font-medium mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Records */}
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <p className="font-semibold text-gray-700">Sin registros médicos</p>
            <p className="text-sm text-gray-500 mt-1">Tus registros aparecerán aquí después de tus consultas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => <RecordCard key={record.id} record={record} />)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
