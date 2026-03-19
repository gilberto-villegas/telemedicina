import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Pill, Calendar, QrCode, Download, X, Stethoscope, Clock, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';

interface Prescription {
  id: string;
  appointment_id: string;
  medications: Array<{ name: string; dosage: string; frequency: string; duration: string; instructions?: string; }>;
  qr_code: string;
  status: 'pending' | 'filled' | 'expired';
  created_at: string;
  appointment?: { doctor: { first_name: string; last_name: string; }; };
}

const STATUS_MAP = {
  pending: { label: 'Vigente',     bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-700',  dot: 'bg-green-500' },
  filled:  { label: 'Dispensada',  bg: 'bg-gray-50',   border: 'border-gray-200',  text: 'text-gray-700',   dot: 'bg-gray-400' },
  expired: { label: 'Vencida',     bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-700',    dot: 'bg-red-500' },
};

export default function PrescriptionsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState<Prescription | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) { navigate('/auth/login'); return; }
    const currentUser = authService.getUser();
    if (!currentUser || currentUser.type !== 'patient') { navigate(`/dashboard/${currentUser?.type || 'patient'}`); return; }
    setUser(currentUser);
    api.get('/prescriptions')
      .then(r => setPrescriptions(Array.isArray(r.data) ? r.data : []))
      .catch(() => setPrescriptions([]))
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
          <h1 className="text-2xl font-bold text-gray-900">Mis Recetas</h1>
          <p className="text-gray-500 mt-0.5">Recetas médicas digitales con código QR verificable</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', value: prescriptions.length, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Vigentes', value: prescriptions.filter(p => p.status === 'pending').length, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Dispensadas', value: prescriptions.filter(p => p.status === 'filled').length, color: 'text-gray-600', bg: 'bg-gray-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
              <div className={`text-3xl font-black ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 font-medium mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* List */}
        {prescriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <Pill className="h-8 w-8 text-blue-500" />
            </div>
            <p className="font-semibold text-gray-700">Sin recetas médicas</p>
            <p className="text-sm text-gray-500 mt-1">Las recetas aparecerán aquí luego de tus consultas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((rx) => {
              const statusCfg = STATUS_MAP[rx.status] || STATUS_MAP.pending;
              const doctor = rx.appointment?.doctor;
              return (
                <div key={rx.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                  {/* Header */}
                  <div className="p-5 border-b border-gray-50">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                          <Pill className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Receta Médica</p>
                          {doctor && (
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Stethoscope className="h-3 w-3" />
                              Dr. {doctor.first_name} {doctor.last_name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.bg} ${statusCfg.border} ${statusCfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          {statusCfg.label}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(rx.created_at), 'd MMM yyyy', { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Medications */}
                  <div className="p-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Medicamentos — {rx.medications.length} ítem{rx.medications.length !== 1 ? 's' : ''}
                    </p>
                    <div className="space-y-2">
                      {rx.medications.map((med, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                              <p className="font-bold text-gray-900">{med.name}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 ml-7 text-sm text-gray-600">
                            <span><span className="font-medium">Dosis:</span> {med.dosage}</span>
                            <span><span className="font-medium">Frecuencia:</span> {med.frequency}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {med.duration}</span>
                            {med.instructions && <span className="w-full text-gray-500 italic">{med.instructions}</span>}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* QR row */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                      <div className="bg-white p-2 rounded-xl border border-gray-200">
                        <QRCodeSVG value={rx.qr_code} size={72} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-2">Código QR para farmacia</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setQrModal(rx)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-all"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                            Ver QR Completo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-lg">Código QR de Receta</h3>
              <button onClick={() => setQrModal(null)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex justify-center bg-gray-50 rounded-2xl p-6 mb-4">
              <QRCodeSVG value={qrModal.qr_code} size={220} />
            </div>
            <p className="text-sm text-gray-500 text-center">Muestra este código en la farmacia para dispensar tus medicamentos</p>
            <button onClick={() => setQrModal(null)} className="mt-4 w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
