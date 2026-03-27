import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { authService, User } from '@/lib/auth';
import { api } from '@/lib/api';
import { 
  Check, 
  X, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  User as UserIcon, 
  Eye, 
  ExternalLink,
  FileText,
  Phone,
  Calendar,
  Hash,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Payment {
  id: string;
  status: { id: number; name: string; label: string; };
  method: string;
  amount_usd: string;
  amount_ves: string;
  reference_number: string;
  payment_phone?: string;
  payment_date?: string;
  proof_url?: string;
  created_at: string;
  user: { first_name: string; last_name: string; email: string; };
  appointment: { 
    id: string; 
    start_time: string; 
    status: string;
    doctor: { first_name: string; last_name: string; specialty: string; };
  };
}

const METHOD_LABELS: Record<string, string> = {
  pago_movil: 'Pago Móvil',
  bank_transfer: 'Transferencia',
  cash: 'Efectivo',
  card: 'Tarjeta',
  zelle: 'Zelle',
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

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  // Modal state
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const currentUser = authService.getUser();
    setUser(currentUser);
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await api.get('/admin/payments');
      setPayments(response.data);
    } catch { } finally { setLoading(false); }
  };

  const handleVerify = async (paymentId: string, action: 'approve' | 'reject') => {
    let reason = '';
    if (action === 'reject') reason = prompt('Motivo del rechazo:') || 'Pago no verificado';
    try {
      await api.post(`/payments/${paymentId}/verify`, { action, reason });
      setIsModalOpen(false);
      loadPayments();
    } catch { alert('Error al procesar la verificación'); }
  };

  const openDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
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
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        {/* Premium Header Banner */}
        <div className="relative overflow-hidden rounded-[3rem] p-10 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 shadow-2xl shadow-blue-500/20 mb-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full -mr-40 -mt-40 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -ml-20 -mb-20 blur-3xl" />
          
          <div className="relative z-10 space-y-4">
            <Link to="/dashboard/admin" className="group inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all mb-2">
                <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
                Regresar
            </Link>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
              Control Financiero Central
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight uppercase tracking-tight">
              Validación Global de <br/> <span className="text-blue-400">Pagos</span>
            </h1>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Pendientes Verificación', value: pending.length, Icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/70 backdrop-blur-md border-amber-100' },
            { label: 'Transacciones Exitosas', value: history.filter(p => p.status.name === 'payment_completed').length, Icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50/70 backdrop-blur-md border-emerald-100' },
            { label: 'Recaudación Total USD', value: `$${totalRevenue.toLocaleString()}`, Icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50/70 backdrop-blur-md border-blue-100' },
          ].map(({ label, value, Icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-[2rem] p-6 flex items-center gap-5 border shadow-sm transition-all hover:shadow-md`}>
              <div className="p-4 bg-white/80 rounded-2xl shadow-sm capitalize">
                <Icon className={`h-7 w-7 ${color}`} />
              </div>
              <div>
                <div className={`text-3xl font-black ${color} tracking-tighter`}>{value}</div>
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pending payments */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
              <div className="p-2 bg-amber-500 rounded-xl text-white shadow-lg shadow-amber-500/20">
                <Clock className="h-6 w-6" />
              </div>
              Pagos por Validar
            </h2>
          </div>

          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-dashed border-slate-200">
              <div className="p-5 bg-emerald-50 rounded-full mb-4">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
              <p className="font-black text-slate-900 uppercase tracking-tighter text-xl">Sistema al día</p>
              <p className="text-slate-500 mt-2 font-medium">No se registran pagos pendientes de validación administrativa.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pending.map((payment) => (
                <div key={payment.id} className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50 p-7 transition-all hover:scale-[1.005] group">
                  <div className="flex flex-col xl:flex-row xl:items-center gap-6 justify-between">
                    
                    <div className="flex flex-col sm:flex-row gap-8 items-center">
                      {/* Patient info */}
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                          {payment.user.first_name[0]}{payment.user.last_name[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 uppercase leading-tight">{payment.user.first_name} {payment.user.last_name}</p>
                          <p className="text-xs text-slate-500 font-medium">{payment.user.email}</p>
                        </div>
                      </div>

                      {/* Doctor info */}
                      <div className="flex items-center gap-4 min-w-[200px] sm:border-l sm:border-slate-100 sm:pl-8">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black">
                          <UserIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Médico</p>
                          <p className="font-black text-indigo-900 uppercase leading-tight text-sm">Dr. {payment.appointment.doctor.last_name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-6">
                       <div className="text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto</p>
                          <p className="font-black text-blue-700 text-lg">${payment.amount_usd} USD</p>
                       </div>
                       <div className="h-8 w-px bg-slate-100" />
                       <div className="text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Método</p>
                          <p className="font-black text-slate-700 uppercase leading-tight text-xs">{METHOD_LABELS[payment.method] || payment.method}</p>
                       </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                       <Button 
                         onClick={() => openDetails(payment)}
                         variant="outline"
                         className="h-14 px-8 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                       >
                         <Eye className="h-4 w-4 mr-2" />
                         Ver Detalles
                       </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History table */}
        <div className="space-y-6 mt-16">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter px-2">Historial Completo</h2>
          <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] border border-white shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fecha</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Paciente</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Monto</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {history.length === 0 ? (
                    <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest">Sin registros históricos</td></tr>
                  ) : history.map((payment) => (
                    <tr key={payment.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold text-slate-600 uppercase italic">{format(new Date(payment.created_at), 'dd MMM yyyy', { locale: es })}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-black text-slate-900 uppercase text-xs">{payment.user.first_name} {payment.user.last_name}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-black text-blue-600">${payment.amount_usd}</div>
                        <div className="text-[10px] font-bold text-slate-400 tracking-tight">~ {Number(payment.amount_ves).toLocaleString('es-VE')} BS</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <StatusPill name={payment.status.name} label={payment.status.label} />
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => openDetails(payment)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-none rounded-[3rem] p-0 overflow-hidden shadow-2xl">
          {selectedPayment && (
            <>
              <DialogHeader className="p-8 pb-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="flex items-center gap-4 mb-4">
                   <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                      <FileText className="h-6 w-6" />
                   </div>
                   <div>
                      <DialogTitle className="text-2xl font-black uppercase tracking-tight">Detalles del Pago</DialogTitle>
                      <DialogDescription className="text-blue-100 font-medium">Revisa la información antes de validar la transacción.</DialogDescription>
                   </div>
                </div>
              </DialogHeader>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                {/* Summary Section */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Paciente</p>
                      <p className="font-black text-slate-900 uppercase">{selectedPayment.user.first_name} {selectedPayment.user.last_name}</p>
                      <p className="text-xs text-slate-500">{selectedPayment.user.email}</p>
                   </div>
                   <div className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Médico Destino</p>
                      <p className="font-black text-indigo-900 uppercase">Dr. {selectedPayment.appointment.doctor.last_name}</p>
                      <p className="text-[10px] text-indigo-600 font-black uppercase tracking-wider">{selectedPayment.appointment.doctor.specialty}</p>
                   </div>
                </div>

                {/* Technical Details */}
                <div className="space-y-4">
                   <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Hash className="h-4 w-4 text-blue-500" /> Datos de la Transacción
                   </h4>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fecha</p>
                         <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {selectedPayment.payment_date ? format(new Date(selectedPayment.payment_date), 'dd/MM/yyyy') : 'N/A'}
                         </p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Método</p>
                         <p className="text-sm font-black text-blue-600 uppercase">{METHOD_LABELS[selectedPayment.method] || selectedPayment.method}</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Referencia</p>
                         <p className="text-sm font-black text-slate-900 tracking-wider">#{selectedPayment.reference_number || 'S/N'}</p>
                      </div>
                      {selectedPayment.payment_phone && (
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Teléfono Origen</p>
                           <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                              {selectedPayment.payment_phone}
                           </p>
                        </div>
                      )}
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Monto</p>
                         <p className="text-lg font-black text-emerald-600">${selectedPayment.amount_usd} USD</p>
                         <p className="text-xs font-bold text-slate-400 tracking-tight">~ {Number(selectedPayment.amount_ves).toLocaleString('es-VE')} BS</p>
                      </div>
                   </div>
                </div>

                {/* Proof of payment */}
                <div className="space-y-4">
                   <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" /> Comprobante Adjunto
                   </h4>
                   {selectedPayment.proof_url ? (
                     <div className="relative group rounded-[2rem] overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center">
                        <img 
                          src={selectedPayment.proof_url} 
                          alt="Comprobante de pago" 
                          className="w-full h-full object-contain transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                           <a 
                             href={selectedPayment.proof_url} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="p-3 bg-white rounded-2xl shadow-xl text-slate-900 hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
                             title="Ver en pantalla completa"
                           >
                              <ExternalLink className="h-5 w-5" />
                           </a>
                        </div>
                     </div>
                   ) : (
                     <div className="py-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-center">
                        <X className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No se adjuntó comprobante visual</p>
                     </div>
                   )}
                </div>
              </div>

              {selectedPayment.status.name === 'payment_processing' && (
                <DialogFooter className="p-8 bg-slate-50 flex sm:justify-between items-center gap-4">
                  <Button
                    onClick={() => handleVerify(selectedPayment.id, 'reject')}
                    variant="ghost"
                    className="h-14 px-8 rounded-2xl text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-700 transition-all"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Rechazar Pago
                  </Button>
                  <Button
                    onClick={() => handleVerify(selectedPayment.id, 'approve')}
                    className="h-14 px-10 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all flex-1 sm:flex-none"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Validar y Activar Cita
                  </Button>
                </DialogFooter>
              )}
              
              {selectedPayment.status.name !== 'payment_processing' && (
                <DialogFooter className="p-8 bg-slate-50">
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    variant="outline"
                    className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-200"
                  >
                    Cerrar Detalles
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
