import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Users, Search, FileText, MessageSquare, Phone, Mail, CreditCard, Calendar, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  document_id: string;
  email: string;
  phone: string;
  birth_date?: string;
  total_appointments?: number;
  last_appointment?: string;
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
        <p className="mt-3 text-gray-500 text-sm">Cargando pacientes...</p>
      </div>
    </div>
  );
}

function getInitials(first: string, last: string) {
  return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
}

const AVATAR_COLORS = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-teal-500 to-cyan-600',
  'from-orange-500 to-rose-600',
  'from-green-500 to-emerald-600',
];

export default function PatientsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) { navigate('/auth/login'); return; }
    const currentUser = authService.getUser();
    if (!currentUser || currentUser.type !== 'doctor') { navigate(`/dashboard/${currentUser?.type || 'patient'}`); return; }
    setUser(currentUser);
    loadPatients();
  }, [navigate]);

  const loadPatients = async () => {
    try {
      const response = await api.get('/doctors/me/patients');
      setPatients(Array.isArray(response.data) ? response.data : []);
    } catch { setPatients([]); } finally { setLoading(false); }
  };

  if (loading || !user) return <LoadingState />;

  const filteredPatients = patients.filter(p =>
    p.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.document_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout user={user}>
      <div className="max-w-5xl mx-auto space-y-10 pb-20">
        {/* Header Section (Synced with other views) */}
        <div className="relative overflow-hidden rounded-[3rem] p-10 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-2xl shadow-blue-500/20 mb-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl animate-pulse" />
          
          <div className="relative z-10">
            <Link to="/dashboard/doctor" className="group inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all mb-6">
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
              Regresar al Panel
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight uppercase tracking-tight mb-2">
              Mis <span className="text-blue-200">Pacientes</span>
            </h1>
            <p className="text-blue-100 text-lg font-medium uppercase tracking-tight">
              {patients.length} pacientes registrados en tu historial médico
            </p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Pacientes', value: patients.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Resultado Búsqueda', value: filteredPatients.length, icon: Search, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Con Varias Consultas', value: patients.filter(p => (p.total_appointments || 0) > 1).length, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg}/70 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-white/20 transition-transform hover:scale-[1.02]`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-white shadow-sm`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <div className={`text-2xl font-black ${color}`}>{value}</div>
                  <div className="text-xs text-gray-500 font-medium">{label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Buscar por nombre, cédula o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 h-11 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Patients List */}
        <div>
          <p className="text-sm text-gray-500 mb-4">{filteredPatients.length} resultado{filteredPatients.length !== 1 ? 's' : ''}</p>

          {filteredPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/70 backdrop-blur-xl rounded-2xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <p className="font-semibold text-gray-700">
                {searchTerm ? 'No se encontraron pacientes' : 'Sin pacientes registrados'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm ? 'Prueba con otro término de búsqueda' : 'Los pacientes aparecerán aquí después de sus consultas'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPatients.map((patient, i) => {
                const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
                return (
                  <div key={patient.id} className="bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5">
                    <div className="flex items-start justify-between gap-4">
                      {/* Avatar + name */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                          {getInitials(patient.first_name, patient.last_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900">
                            {patient.first_name} {patient.last_name}
                          </h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <CreditCard className="h-3 w-3" />
                              {patient.document_id}
                            </span>
                            {patient.email && (
                              <span className="flex items-center gap-1 text-xs text-gray-500 truncate">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                {patient.email}
                              </span>
                            )}
                            {patient.phone && (
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Phone className="h-3 w-3" />
                                {patient.phone}
                              </span>
                            )}
                          </div>
                          {patient.total_appointments !== undefined && (
                            <div className="mt-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                <Calendar className="h-3 w-3" />
                                {patient.total_appointments} consulta{patient.total_appointments !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Link to={`/dashboard/doctor/patients/${patient.id}`}>
                          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all">
                            <FileText className="h-4 w-4" />
                            Historial
                          </button>
                        </Link>
                        <Link to={`/dashboard/doctor/chat?patient=${patient.id}`}>
                          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-all">
                            <MessageSquare className="h-4 w-4" />
                            Chat
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
