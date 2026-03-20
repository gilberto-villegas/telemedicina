import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { authService, User } from '@/lib/auth';
import { api } from '@/lib/api';
import { Check, X, Clock, User as UserIcon, Calendar, DollarSign, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Payment {
  id: string;
  status: { id: number; name: string; label: string; };
  method: string;
  amount_usd: string;
  amount_ves: string;
  reference_number: string;
  payment_phone?: string;
  payment_date?: string;
  created_at: string;
  user: { first_name: string; last_name: string; email: string; };
  appointment: { id: string; start_time: string; status: string; };
}

const METHOD_LABELS: Record<string, string> = {
  pago_movil: 'Pago Móvil',
  bank_transfer: 'Transferencia',
  cash: 'Efectivo',
  card: 'Tarjeta',
};

function StatusPill({ name, label }: { name: string; label: string }) {
  const styles: Record<string, string> = {
    payment_completed:  'bg-green-50 border-green-200 text-green-700',
    payment_processing: 'bg-blue-50 border-blue-200 text-blue-700',
    payment_failed:     'bg-red-50 border-red-200 text-red-700',
    payment_pending:    'bg-gray-100 border-gray-200 text-gray-500',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[name] || 'bg-gray-50 border-gray-200 text-gray-700'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${name === 'payment_completed' ? 'bg-green-500' : name === 'payment_processing' ? 'bg-blue-500' : name === 'payment_failed' ? 'bg-red-500' : 'bg-gray-400'}`} />
      {name === 'payment_pending' ? 'Sin Confirmar' : label}
    </span>
  );
}

export default function DoctorPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = authService.getUser();
    setUser(currentUser);
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await api.get('/payments/doctor');
      setPayments(response.data);
    } catch { } finally { setLoading(false); }
  };

  const handleVerify = async (paymentId: string, action: 'approve' | 'reject') => {
    let reason = '';
    if (action === 'reject') reason = prompt('Motivo del rechazo:') || 'Pago no verificado';
    try {
      await api.post(`/payments/${paymentId}/verify`, { action, reason });
      loadPayments();
    } catch { alert('Error al procesar la verificación'); }
  };

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  const pending = payments.filter(p => p.status.name === 'payment_processing');
  const history = payments.filter(p => p.status.name !== 'payment_processing');
  const totalRevenue = payments
    .filter(p => p.status.name === 'payment_completed')
    .reduce((s, p) => s + parseFloat(p.amount_usd || '0'), 0);

  return (
    <DashboardLayout user={user}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Validación de Pagos</h1>
          <p className="text-gray-500 mt-0.5">Revisa y aprueba los pagos registrados por tus pacientes</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Por Verificar', value: pending.length, Icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Aprobados', value: history.filter(p => p.status.name === 'payment_completed').length, Icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Total USD', value: `$${totalRevenue.toFixed(0)}`, Icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          ].map(({ label, value, Icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-5 flex items-center gap-3`}>
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <div className={`text-2xl font-black ${color}`}>{value}</div>
                <div className="text-xs text-gray-500 font-medium">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pending payments */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-700 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            Pendientes de Verificación
            {pending.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{pending.length}</span>
            )}
          </h2>

          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-green-50 rounded-2xl border border-green-100">
              <CheckCircle className="h-10 w-10 text-green-500 mb-3" />
              <p className="font-semibold text-green-700">¡Todo al día!</p>
              <p className="text-sm text-green-600 mt-1">No hay pagos pendientes de verificación</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((payment) => (
                <div key={payment.id} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                    {/* Patient info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                        {payment.user.first_name[0]}{payment.user.last_name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{payment.user.first_name} {payment.user.last_name}</p>
                        <p className="text-xs text-gray-500">{payment.user.email}</p>
                      </div>
                    </div>

                    {/* Payment details */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-blue-600" />
                        <span className="font-black text-blue-700">{payment.amount_usd} USD</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-600">
                          {format(new Date(payment.appointment.start_time), "d MMM, HH:mm", { locale: es })}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-lg px-3 py-1.5">
                        <span className="text-gray-600 capitalize">{METHOD_LABELS[payment.method] || payment.method}</span>
                      </div>
                      {payment.reference_number && (
                        <div className="bg-gray-50 rounded-lg px-3 py-1.5">
                          <span className="text-xs text-gray-500 font-mono">Ref: {payment.reference_number}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleVerify(payment.id, 'reject')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition-all"
                      >
                        <X className="h-4 w-4" />
                        Rechazar
                      </button>
                      <button
                        onClick={() => handleVerify(payment.id, 'approve')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-all shadow-sm"
                      >
                        <Check className="h-4 w-4" />
                        Aprobar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History table */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-700">Historial de Pagos</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Paciente</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Método</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Sin registros en el historial</td></tr>
                  ) : history.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-gray-500">{format(new Date(payment.created_at), 'dd/MM/yyyy')}</td>
                      <td className="px-5 py-3.5 font-medium text-gray-900">{payment.user.first_name} {payment.user.last_name}</td>
                      <td className="px-5 py-3.5 font-bold text-gray-900">${payment.amount_usd}</td>
                      <td className="px-5 py-3.5 text-gray-600">{METHOD_LABELS[payment.method] || payment.method}</td>
                      <td className="px-5 py-3.5"><StatusPill name={payment.status.name} label={payment.status.label} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
