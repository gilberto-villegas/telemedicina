import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CreditCard, Calendar, CheckCircle, XCircle, Clock, TrendingUp, Stethoscope, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Payment {
  id: string;
  appointment_id: string;
  amount_usd: string;
  amount_ves: string;
  currency: string;
  method: string;
  status: { id: number; name: string; label: string; };
  transaction_id?: string;
  created_at: string;
  invoice_number?: string;
  appointment?: {
    doctor: { first_name: string; last_name: string; };
    appointment_date: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; border: string; text: string; dot: string; }> = {
  payment_pending:    { label: 'Pendiente',    bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  payment_processing: { label: 'Verificando',  bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  payment_completed:  { label: 'Completado',   bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  dot: 'bg-green-500' },
  payment_failed:     { label: 'Fallido',      bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    dot: 'bg-red-500' },
};

const METHOD_LABELS: Record<string, string> = {
  pago_movil: 'Pago Móvil',
  bank_transfer: 'Transferencia',
  cash: 'Efectivo',
  card: 'Tarjeta',
};

function StatusPill({ name, label }: { name: string; label: string }) {
  const cfg = STATUS_CONFIG[name] || { label, bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function PatientPaymentsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) { navigate('/auth/login'); return; }
    const currentUser = authService.getUser();
    if (!currentUser || currentUser.type !== 'patient') { navigate(`/dashboard/${currentUser?.type || 'patient'}`); return; }
    setUser(currentUser);
    loadPayments();
  }, [navigate]);

  const loadPayments = async () => {
    try {
      const response = await api.get('/payments/invoices');
      setPayments(Array.isArray(response.data) ? response.data : []);
    } catch { setPayments([]); } finally { setLoading(false); }
  };

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  const totalPaid = payments
    .filter(p => p.status.name === 'payment_completed')
    .reduce((s, p) => s + parseFloat(p.amount_usd || '0'), 0);

  const pendingCount = payments.filter(p => p.status.name === 'payment_pending').length;
  const completedCount = payments.filter(p => p.status.name === 'payment_completed').length;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <Link to="/dashboard/patient" className="group inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-4">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-bold uppercase tracking-widest">Panel Principal</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Mis Pagos</h1>
          <p className="text-gray-500 mt-0.5">Historial de pagos y facturas</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Pagado', value: `$${totalPaid.toFixed(0)}`, sublabel: 'USD', color: 'text-blue-700', bg: 'from-blue-600 to-indigo-600', textColor: 'text-white' },
            { label: 'Completados', value: completedCount, sublabel: 'pagos', color: 'text-green-700', bg: 'bg-green-50', textColor: 'text-green-600' },
            { label: 'Pendientes', value: pendingCount, sublabel: 'en proceso', color: 'text-yellow-700', bg: 'bg-yellow-50', textColor: 'text-yellow-600' },
          ].map(({ label, value, sublabel, bg, textColor }, i) => (
            i === 0 ? (
              <div key={label} className={`bg-gradient-to-br ${bg} rounded-2xl p-5 text-white`}>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 opacity-80" />
                  <span className="text-xs font-medium opacity-80">{label}</span>
                </div>
                <div className="text-3xl font-black">{value}</div>
                <div className="text-xs opacity-70 mt-0.5">{sublabel}</div>
              </div>
            ) : (
              <div key={label} className={`${bg} rounded-2xl p-5`}>
                <div className={`text-3xl font-black ${textColor}`}>{value}</div>
                <div className="text-xs text-gray-500 font-medium mt-1">{label}</div>
                <div className="text-xs text-gray-400">{sublabel}</div>
              </div>
            )
          ))}
        </div>

        {/* Payments list */}
        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
            <p className="font-semibold text-gray-700">Sin pagos registrados</p>
            <p className="text-sm text-gray-500 mt-1">Los pagos de tus consultas aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => {
              const doctor = payment.appointment?.doctor;
              const amount = parseFloat(payment.amount_usd || '0');
              return (
                <div key={payment.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg font-black text-gray-900">${amount.toFixed(2)}</span>
                          <span className="text-xs text-gray-400">{payment.currency?.toUpperCase()}</span>
                          <StatusPill name={payment.status.name} label={payment.status.label} />
                        </div>
                        {doctor && (
                          <p className="text-sm text-gray-600 mt-0.5">
                            Consulta con Dr. {doctor.first_name} {doctor.last_name}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(payment.created_at), "d 'de' MMMM yyyy", { locale: es })}
                          </span>
                          <span>{METHOD_LABELS[payment.method] || payment.method}</span>
                          {payment.invoice_number && <span>Factura: {payment.invoice_number}</span>}
                          {payment.transaction_id && <span>Trans: {payment.transaction_id}</span>}
                        </div>
                      </div>
                    </div>

                    {payment.status.name === 'payment_pending' && (
                      <button
                        onClick={async () => {
                          try { await api.post(`/payments/${payment.id}/confirm`); loadPayments(); }
                          catch { alert('Error al confirmar pago'); }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all flex-shrink-0"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Confirmar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
