import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { authService, User } from '@/lib/auth';
import { api } from '@/lib/api';
import { Wallet, DollarSign, CheckCircle, Clock, Send, X, AlertCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface Appointment {
  id: string;
  start_time: string;
  price_usd: string;
  platform_fee_amount_usd: string;
  doctor_earnings_usd: string;
  doctor_earnings_ves: string;
  patient: { first_name: string; last_name: string; };
}

interface WithdrawalRequest {
  id: string;
  total_amount_usd: string;
  total_fee_usd: string;
  net_amount_usd: string;
  net_amount_ves: string;
  status: string;
  receipt_image_url: string | null;
  admin_notes: string | null;
  created_at: string;
  appointments: Appointment[];
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'completed') {
    return <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full border border-green-200">Aprobado / Pagado</span>;
  }
  if (status === 'rejected') {
    return <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider rounded-full border border-red-200">Rechazado</span>;
  }
  return <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-200">Pendiente de Pago</span>;
}

export default function DoctorWallet() {
  const [user, setUser] = useState<User | null>(null);
  const [balanceUsd, setBalanceUsd] = useState(0);
  const [balanceVes, setBalanceVes] = useState(0);
  const [platformFeePercent, setPlatformFeePercent] = useState(0);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'balance' | 'history'>('balance');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedApts, setSelectedApts] = useState<string[]>([]);

  useEffect(() => {
    setUser(authService.getUser());
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balanceRes, historyRes] = await Promise.all([
        api.get('/wallet/balance'),
        api.get('/wallet/history')
      ]);
      setBalanceUsd(balanceRes.data.balance_usd);
      setBalanceVes(balanceRes.data.balance_ves);
      setPlatformFeePercent(balanceRes.data.platform_fee_percent);
      setAppointments(balanceRes.data.appointments);
      setHistory(historyRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestWithdrawal = async () => {
    try {
      setRequesting(true);
      await api.post('/wallet/request-withdrawal', { appointment_ids: selectedApts });
      alert('Solicitud enviada exitosamente. El administrador la procesará a la brevedad.');
      setIsConfirmModalOpen(false);
      await fetchData();
      setSelectedApts([]);
      setActiveTab('history');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al solicitar retiro');
    } finally {
      setRequesting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedApts(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleOpenConfirm = () => {
    if (selectedApts.length === 0) {
      alert('Debes seleccionar al menos una cita para solicitar el pago.');
      return;
    }
    setIsConfirmModalOpen(true);
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

  const selectedAptData = appointments.filter(a => selectedApts.includes(a.id));
  const totalBrutoSelected = selectedAptData.reduce((acc, apt) => acc + parseFloat(apt.price_usd), 0);
  const totalNetoSelected = selectedAptData.reduce((acc, apt) => acc + parseFloat(apt.doctor_earnings_usd), 0);
  const totalFeeSelected = selectedAptData.reduce((acc, apt) => acc + parseFloat(apt.platform_fee_amount_usd), 0);
  const totalNetoVesSelected = selectedAptData.reduce((acc, apt) => acc + parseFloat(apt.doctor_earnings_ves), 0);

  return (
    <DashboardLayout user={user}>
      <div className="max-w-6xl mx-auto space-y-10 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Navigation */}
        <div className="flex items-center justify-between pointer-events-auto">
          <Link
            to="/dashboard/doctor"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-semibold">Regresar</span>
          </Link>
        </div>

        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-[3rem] p-10 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-2xl shadow-blue-500/20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full -ml-20 -mb-20 blur-3xl" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                <Wallet className="w-4 h-4" /> Billetera de Ganancias
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight uppercase tracking-tight">
                Mis <span className="text-blue-200">Ingresos</span>
              </h1>
              <p className="text-blue-100 text-lg max-w-xl font-medium leading-relaxed uppercase tracking-tight">
                Gestiona tus ganancias, revisa el saldo disponible y solicita retiros a tu cuenta bancaria.
              </p>
            </div>

            {/* Balances Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 min-w-[300px] text-center lg:text-right">
              <p className="text-blue-100 text-xs font-bold tracking-widest uppercase mb-2">Saldo Neto a Cobrar</p>
              <div className="text-5xl font-black text-white tracking-tighter mb-2">
                ${Number(balanceUsd).toFixed(2)}
              </div>
              <p className="text-blue-200 font-bold">~ Bs. {Number(balanceVes).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 p-2 bg-white/50 backdrop-blur-md rounded-2xl w-fit ring-1 ring-slate-100 mx-auto lg:mx-0">
          <button 
            onClick={() => setActiveTab('balance')} 
            className={`px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
              activeTab === 'balance' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Saldo por Cobrar
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
              activeTab === 'history' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Historial de Retiros
          </button>
        </div>

        {/* Content */}
        {activeTab === 'balance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
                Citas Finalizadas ({appointments.length})
              </h2>
              {appointments.length > 0 && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      if (selectedApts.length === appointments.length) setSelectedApts([]);
                      else setSelectedApts(appointments.map(a => a.id));
                    }}
                    className="px-4 py-2 bg-white/60 backdrop-blur-md border border-blue-100 rounded-xl text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-white hover:border-blue-300 transition-all shadow-sm"
                  >
                    {selectedApts.length === appointments.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                  </button>
                  <button
                    onClick={handleOpenConfirm}
                    disabled={requesting}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase text-xs tracking-wider transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                  >
                    Solicitar Pago {selectedApts.length > 0 && `(${selectedApts.length})`} <Send className="w-4 h-4 ml-2" />
                  </button>
                </div>
              )}
            </div>

            {appointments.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-16 bg-white/50 backdrop-blur-md rounded-3xl border border-slate-100">
                  <CheckCircle className="h-16 w-16 text-emerald-400 mb-4" />
                  <p className="text-xl font-black text-slate-700 uppercase tracking-tight">Todo cobrado</p>
                  <p className="text-slate-500 font-medium">No tienes saldo pendiente en este momento.</p>
               </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {appointments.map((apt) => (
                  <div 
                    key={apt.id} 
                    onClick={() => toggleSelect(apt.id)}
                    className={`p-6 bg-white rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden group ${
                      selectedApts.includes(apt.id) 
                        ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 shadow-blue-100' 
                        : 'border-slate-100 shadow-xl shadow-slate-200/50 hover:border-blue-200'
                    }`}
                  >
                    <div className="absolute top-2 right-6 z-20">
                       <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                         selectedApts.includes(apt.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-200 bg-white'
                       }`}>
                         {selectedApts.includes(apt.id) && <CheckCircle className="w-4 h-4 text-white" />}
                       </div>
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[5rem] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <div className="relative z-10 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Cita</p>
                          <p className="font-bold text-slate-900">{format(new Date(apt.start_time), "dd MMM, HH:mm", { locale: es })}</p>
                        </div>
                        <div className="text-right mr-8">
                          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Ganancia</p>
                          <p className="text-xl font-black text-blue-600">${parseFloat(apt.doctor_earnings_usd).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-50">
                        <p className="text-xs text-slate-500"><span className="font-bold">Paciente:</span> {apt.patient.first_name} {apt.patient.last_name}</p>
                        <p className="text-xs text-slate-400 flex justify-between mt-1 items-center">
                          <span>Precio: ${parseFloat(apt.price_usd).toFixed(2)}</span>
                          <span className="bg-red-50 text-red-600 px-2 rounded-full font-bold">-{parseFloat(apt.platform_fee_amount_usd).toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Confirm Modal */}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-white w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Detalle de tu Retiro</h3>
                  <button onClick={() => setIsConfirmModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Recaudado</span>
                    <span className="text-lg font-black text-slate-900">${totalBrutoSelected.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 text-red-600">
                    <span className="text-sm font-bold uppercase tracking-wider">Uso del Sistema ({platformFeePercent}%)</span>
                    <span className="text-lg font-black">-${totalFeeSelected.toFixed(2)}</span>
                  </div>
 
                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center space-y-1">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Total Neto a Recibir</span>
                    <div className="text-4xl font-black text-blue-700 tracking-tighter">${totalNetoSelected.toFixed(2)}</div>
                    <div className="text-sm font-bold text-blue-400">~ Bs. {totalNetoVesSelected.toFixed(2)}</div>
                  </div>
 
                  <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 font-medium leading-relaxed uppercase tracking-tight">
                      Al confirmar, solicitas el pago de <span className="font-bold">{selectedApts.length} citas</span> seleccionadas. El administrador verificará los datos y procesará el pago en las próximas 24-48 horas hábiles.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="flex-1 py-4 text-slate-500 hover:text-slate-700 font-black uppercase text-xs tracking-widest transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleRequestWithdrawal()}
                    disabled={requesting}
                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all hover:bg-indigo-700 active:scale-[0.98] shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {requesting ? 'Procesando...' : 'Confirmar Retiro'}
                    <Send className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab ... remains same ... */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              Retiros Solicitados
            </h2>

            {history.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-16 bg-white/50 backdrop-blur-md rounded-3xl border border-slate-100">
                  <Wallet className="h-16 w-16 text-slate-300 mb-4" />
                  <p className="text-xl font-black text-slate-700 uppercase tracking-tight">Sin historial</p>
                  <p className="text-slate-500 font-medium">No has realizado retiros aún.</p>
               </div>
            ) : (
              <div className="space-y-4">
                {history.map((req) => (
                  <div key={req.id} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                          Solicitado el {format(new Date(req.created_at), "dd MMM yyyy", { locale: es })}
                        </p>
                        <div className="flex items-center gap-4">
                           <div className="text-2xl font-black text-slate-900">${parseFloat(req.net_amount_usd).toFixed(2)} USD</div>
                           <div className="text-lg font-bold text-slate-400">~ Bs. {parseFloat(req.net_amount_ves).toFixed(2)}</div>
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase">{req.appointments.length} cita(s) finalizada(s)</p>
                      </div>

                      <div className="flex flex-col items-start lg:items-end gap-3">
                        <StatusBadge status={req.status} />
                        
                        {req.admin_notes && (
                          <div className="text-sm bg-slate-50 p-3 rounded-xl border border-slate-100 max-w-sm">
                            <span className="font-bold text-slate-700">Nota del admin:</span> {req.admin_notes}
                          </div>
                        )}
                        
                        {req.receipt_image_url && (
                          <a 
                            href={req.receipt_image_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                          >
                            Ver Comprobante
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
