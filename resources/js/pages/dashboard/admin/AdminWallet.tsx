import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { authService, User } from '@/lib/auth';
import { api } from '@/lib/api';
import { CheckCircle, Clock, Upload, X, ShieldCheck, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Bank {
  id: string;
  name: string;
  code: string;
}

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bank_account_number: string;
  bank_account_holder: string;
  bank_document_id: string;
  bank_account_type: string;
  pago_movil_phone: string;
  pago_movil_document_id: string;
  pago_movil_bank: string;
  zelle_email: string;
  zelle_holder: string;
  bank?: Bank;
}

interface Appointment {
  id: string;
  start_time: string;
  price_usd: string;
  platform_fee_amount_usd: string;
}

interface WithdrawalRequest {
  id: string;
  total_amount_usd: string;
  total_fee_usd: string;
  net_amount_usd: string;
  net_amount_ves: string;
  exchange_rate: string;
  status: string;
  receipt_image_url: string | null;
  admin_notes: string | null;
  created_at: string;
  appointments: Appointment[];
  doctor: Doctor;
}

export default function AdminWallet() {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setUser(authService.getUser());
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/wallet-requests');
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    
    try {
      setProcessing(true);
      await api.post(`/admin/wallet-requests/${selectedRequest.id}/approve`, {
        receipt_image_url: receiptUrl,
        admin_notes: adminNotes
      });
      alert('Pago registrado y notificado exitosamente.');
      await fetchData();
      setSelectedRequest(null);
      setReceiptUrl('');
      setAdminNotes('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al procesar el pago');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !user) {
    return (
      <DashboardLayout user={user || authService.getUser() as User}>
        <div className="flex h-64 items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  const pendingRequests = Array.isArray(requests) ? requests.filter(r => r.status === 'pending') : [];
  const completedRequests = Array.isArray(requests) ? requests.filter(r => r.status === 'completed') : [];

  return (
    <DashboardLayout user={user}>
      <div className="max-w-7xl mx-auto space-y-10 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-[3rem] p-10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full -mr-40 -mt-40 blur-3xl animate-pulse" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" /> Administración Financiera
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight uppercase tracking-tight">
                Pagos a <span className="text-blue-400">Médicos</span>
              </h1>
              <p className="text-slate-300 text-lg max-w-xl font-medium leading-relaxed uppercase tracking-tight">
                Revisa y procesa las solicitudes de retiro de ganancias de los médicos en la plataforma.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 min-w-[180px] text-center">
                <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-2">Por Pagar</p>
                <div className="text-4xl font-black text-white tracking-tighter">
                  {pendingRequests.length}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 min-w-[180px] text-center hidden md:block">
                <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-2">Completados</p>
                <div className="text-4xl font-black text-white tracking-tighter">
                  {completedRequests.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="space-y-10">
          
          {/* Solicitudes Pendientes */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              Solicitudes de Retiro Pendientes
            </h2>

            {pendingRequests.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-16 bg-white/50 backdrop-blur-md rounded-3xl border border-slate-100">
                  <CheckCircle className="h-16 w-16 text-emerald-400 mb-4" />
                  <p className="text-xl font-black text-slate-700 uppercase tracking-tight">Al día</p>
                  <p className="text-slate-500 font-medium">No hay solicitudes de pago pendientes.</p>
               </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-[5rem] -mr-8 -mt-8 pointer-events-none" />
                    
                    <div className="p-8 space-y-6 relative z-10">
                      
                      {/* Doctor Info */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-inner">
                          {req.doctor?.first_name?.[0] || 'D'}{req.doctor?.last_name?.[0] || 'R'}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Dr. {req.doctor?.first_name || 'Médico'} {req.doctor?.last_name || ''}</h3>
                          <p className="text-xs text-slate-500 font-bold tracking-wider">{req.doctor?.email || 'Sin correo'}</p>
                        </div>
                      </div>

                      {/* Amounts */}
                      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total a Pagar</p>
                          <p className="text-2xl font-black text-blue-600">${parseFloat(req.net_amount_usd || '0').toFixed(2)}</p>
                          <p className="text-xs font-bold text-slate-500">~ Bs. {parseFloat(req.net_amount_ves || '0').toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tasa Aplicada</p>
                          <p className="text-lg font-bold text-slate-700">{parseFloat(req.exchange_rate || '0').toFixed(2)}</p>
                          <p className="text-xs text-slate-400 mt-1">{req.appointments?.length || 0} citas incl.</p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all hover:bg-slate-800 active:scale-[0.98] shadow-lg shadow-slate-900/20"
                      >
                        Revisar y Efectuar Pago
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historial */}
          <div className="space-y-6 pt-10 border-t border-slate-200">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                <CheckCircle className="w-5 h-5" />
              </div>
              Pagos Completados
            </h2>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="overflow-x-auto p-2">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 rounded-l-2xl">Fecha</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Médico</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Monto Aprob.</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Estado</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 rounded-r-2xl">Comprobante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedRequests.map((req) => (
                      <tr key={req.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">
                          {req.created_at ? format(new Date(req.created_at), "dd MMM yyyy", { locale: es }) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 font-black text-slate-700 uppercase tracking-tight">
                          Dr. {req.doctor?.first_name || 'Médico'} {req.doctor?.last_name || ''}
                        </td>
                        <td className="px-6 py-4 font-black text-blue-600">
                          ${parseFloat(req.net_amount_usd || '0').toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200">
                            Pagado
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {req.receipt_image_url ? (
                            <a href={req.receipt_image_url} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">Ver Recibo</a>
                          ) : (
                            <span className="text-slate-400 font-bold">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {completedRequests.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest">
                          Aún no hay pagos registrados en el historial
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modal para Procesar Pago */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
              
              {/* Información del Médico y Cuentas (Left Side) */}
              <div className="flex-1 bg-slate-50 p-8 lg:p-10 border-r border-slate-200 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Datos de Pago</h3>
                  <button onClick={() => setSelectedRequest(null)} className="lg:hidden p-2 rounded-full bg-slate-200 text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">A pagar a:</p>
                    <p className="text-xl font-black text-slate-800 uppercase">Dr. {selectedRequest.doctor?.first_name} {selectedRequest.doctor?.last_name}</p>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {selectedRequest.doctor?.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {selectedRequest.doctor?.phone || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Zelle */}
                  {selectedRequest.doctor?.zelle_email && (
                    <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                      <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.3em] mb-3">Vía Zelle (USD)</p>
                      <p className="font-bold text-slate-700 text-sm mb-1">{selectedRequest.doctor?.zelle_email}</p>
                      <p className="text-xs text-slate-500">Titular: <span className="font-bold">{selectedRequest.doctor?.zelle_holder}</span></p>
                    </div>
                  )}

                  {/* Transferencia */}
                  {selectedRequest.doctor?.bank_account_number && (
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-3">Transferencia (VES)</p>
                      <p className="font-bold text-slate-700 text-sm mb-1">Banco: {selectedRequest.doctor?.bank?.name || 'N/A'}</p>
                      <p className="font-mono text-slate-600 text-xs mb-1 bg-white px-2 py-1 rounded inline-block">{selectedRequest.doctor?.bank_account_number}</p>
                      <div className="text-xs text-slate-500 grid gap-1 mt-2">
                        <p>Titular: <span className="font-bold">{selectedRequest.doctor?.bank_account_holder}</span></p>
                        <p>CI/RIF: <span className="font-bold">{selectedRequest.doctor?.bank_document_id}</span></p>
                        <p>Tipo: <span className="font-bold uppercase">{selectedRequest.doctor?.bank_account_type}</span></p>
                      </div>
                    </div>
                  )}

                  {/* Pago Movil */}
                  {selectedRequest.doctor?.pago_movil_phone && (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-3">Pago Móvil (VES)</p>
                      <p className="font-bold text-slate-700 text-sm mb-1">Del Banco: {selectedRequest.doctor?.pago_movil_bank || 'N/A'}</p>
                      <div className="text-xs text-slate-500 grid gap-1 mt-2">
                        <p>Teléfono: <span className="font-bold font-mono">{selectedRequest.doctor?.pago_movil_phone}</span></p>
                        <p>CI/RIF: <span className="font-bold font-mono">{selectedRequest.doctor?.pago_movil_document_id}</span></p>
                      </div>
                    </div>
                  )}

                  {/* Alerta de Cuentas */}
                  {!selectedRequest.doctor?.zelle_email && !selectedRequest.doctor?.bank_account_number && !selectedRequest.doctor?.pago_movil_phone && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200 text-sm font-bold text-center">
                      El médico no ha configurado ninguna cuenta para recibir pagos.
                    </div>
                  )}
                </div>
              </div>

              {/* Formulario de Aprobación (Right Side) */}
              <div className="flex-1 p-8 lg:p-10 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="flex items-center justify-between mb-8 hidden lg:flex">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ejecución del Pago</p>
                    <button onClick={() => setSelectedRequest(null)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-slate-900 rounded-2xl p-6 text-white text-center mb-8 shadow-xl shadow-slate-900/20">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Monto Neto a Transferir</p>
                    <p className="text-4xl font-black tracking-tighter text-blue-400">${parseFloat(selectedRequest.net_amount_usd || '0').toFixed(2)}</p>
                    <p className="text-sm font-bold text-slate-300 mt-2 bg-white/10 py-1 px-3 rounded-full inline-block">Ó Bs. {parseFloat(selectedRequest.net_amount_ves || '0').toFixed(2)}</p>
                  </div>

                  <form id="approve-form" onSubmit={handleApprove} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 ml-2 tracking-widest uppercase flex items-center gap-2">
                        <Upload className="w-3 h-3" /> URL del Comprobante de Pago
                      </label>
                      <input 
                        type="url" 
                        placeholder="https://ejemplo.com/comprobante.jpg"
                        className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold placeholder:text-slate-300"
                        value={receiptUrl}
                        onChange={(e) => setReceiptUrl(e.target.value)}
                        required
                      />
                      <p className="text-[10px] text-slate-400 font-bold ml-2">Sube la imagen a un servidor (ejm: Imgur) y pega el link.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 ml-2 tracking-widest uppercase">Notas adicionales (Opcional)</label>
                      <textarea 
                        className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold placeholder:text-slate-300 resize-none"
                        placeholder="Ej: Pago realizado vía Zelle desde la cuenta principal..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                      />
                    </div>
                  </form>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
                  <button 
                    onClick={() => setSelectedRequest(null)}
                    disabled={processing}
                    className="flex-1 py-4 text-slate-500 hover:text-slate-700 font-bold uppercase text-xs tracking-widest transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    form="approve-form"
                    disabled={processing}
                    className="flex-[2] py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {processing ? 'Confirmando...' : 'Confirmar Pago a Médico'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
