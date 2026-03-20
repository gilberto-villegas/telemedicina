import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { authService, User } from '@/lib/auth';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Check, AlertCircle, Stethoscope, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Slot {
  time: string;
  available: boolean;
  is_booked?: boolean;
}

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  consultation_price_usd: number;
}

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get('type') || 'videoconsulta'; // Default to video if not specified
  const [user, setUser] = useState<User | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState('');
  
  // Payment States
  const [step, setStep] = useState<'datetime' | 'payment' | 'confirmation'>('datetime');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentInstructions, setPaymentInstructions] = useState<any>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState({
    reference: '',
    phone: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    const currentUser = authService.getUser();
    if (!currentUser || currentUser.type !== 'patient') {
      navigate('/auth/login');
      return;
    }
    setUser(currentUser);
    loadDoctor();
  }, [id]);

  useEffect(() => {
    if (doctor) {
      loadSlots();
    }
  }, [selectedDate, doctor]);

  const loadDoctor = async () => {
    try {
      const response = await api.get(`/doctors/${id}`);
      setDoctor(response.data);
    } catch (error) {
      console.error('Error loading doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async () => {
    setLoadingSlots(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const response = await api.get(`/doctors/${id}/slots`, {
        params: { date: formattedDate }
      });
      setSlots(response.data.slots || []);
      setSelectedSlot(null);
      setStep('datetime');
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleCreateAppointmentAndPayment = async () => {
    if (!selectedSlot || !selectedMethod) return;

    setSubmitting(true);
    try {
      // 1. Create Appointment (status: scheduled, but pending payment)
      const appointmentDate = `${format(selectedDate, 'yyyy-MM-dd')} ${selectedSlot}:00`;
      const appoResponse = await api.post('/appointments', {
        doctor_id: id,
        appointment_date: appointmentDate,
        reason: 'Consulta médica',
        duration_minutes: 30,
        type: type // Send selected type to backend
      });

      const appointmentId = appoResponse.data.appointment.id;
      setAppointmentId(appointmentId);

      // 2. Create Payment Intent
      const paymentResponse = await api.post('/payments/intent', {
        appointment_id: appointmentId,
        method: selectedMethod
      });

      setPaymentId(paymentResponse.data.payment.id);
      setPaymentInstructions(paymentResponse.data.instructions);
      setStep('payment');
    } catch (error: any) {
      console.error('Error in flow:', error);
      alert(error.response?.data?.message || 'Error al procesar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentId || !paymentData.reference) return;

    setSubmitting(true);
    try {
      await api.post(`/payments/${paymentId}/confirm`, {
        reference_number: paymentData.reference,
        payment_date: paymentData.date,
        payment_phone: paymentData.phone,
      });
      setStep('confirmation');
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      alert('Error al confirmar el pago.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToQuestionnaire = async () => {
    if (appointmentId) {
      navigate(`/dashboard/patient/appointments/${appointmentId}/questionnaire`);
    } else {
      navigate('/dashboard/patient/appointments');
    }
  };

  const handleFinalBooking = async () => {
    navigate('/dashboard/patient/appointments');
  };

  if (loading || !user || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i));

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link 
          to="/dashboard/patient/doctors"
          className="group inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-bold uppercase tracking-widest">Volver a Médicos</span>
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Doctor Info Sidebar */}
          <div className="space-y-6">
            <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-b from-primary/5 to-background">
              <CardContent className="p-6 text-center space-y-4">
                <div className="h-24 w-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                  <Stethoscope className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Dr. {doctor.first_name} {doctor.last_name}</h2>
                  <p className="text-primary font-medium">{doctor.specialty}</p>
                </div>
                <div className="pt-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                    type === 'videoconsulta' ? "bg-blue-100 text-blue-600" :
                    type === 'teleconsulta' ? "bg-emerald-100 text-emerald-600" :
                    "bg-indigo-100 text-indigo-600"
                  )}>
                    {type === 'videoconsulta' ? 'Videoconsulta' : 'Teleconsulta'}
                  </span>
                </div>
                <div className="pt-4 border-t border-primary/10">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Costo de Consulta</p>
                  <p className="text-3xl font-black text-primary">${doctor.consultation_price_usd}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Nota importante</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Las citas tienen una duración estándar de 30 minutos. Asegúrate de estar disponible 5 minutos antes de la hora seleccionada.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-6">
            {step === 'datetime' && (
              <>
                <Card className="border-none shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">1. Selecciona una Fecha</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                      {next7Days.map((date) => (
                        <button
                          key={date.toISOString()}
                          onClick={() => setSelectedDate(date)}
                          className={cn(
                            "flex flex-col items-center justify-center min-w-[80px] h-24 rounded-2xl border-2 transition-all duration-300",
                            isSameDay(date, selectedDate)
                              ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                              : "bg-card border-muted hover:border-primary/30 hover:bg-primary/5"
                          )}
                        >
                          <span className="text-xs font-bold uppercase opacity-70">
                            {format(date, 'eee', { locale: es })}
                          </span>
                          <span className="text-2xl font-bold">{format(date, 'd')}</span>
                          <span className="text-xs font-medium">{format(date, 'MMM', { locale: es })}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">2. Horarios Disponibles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingSlots ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="text-center py-12 space-y-3 bg-muted/30 rounded-2xl">
                        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground font-medium">No hay horarios disponibles para este día.</p>
                      </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {slots.map((slot) => (
                          <button
                            key={slot.time}
                            disabled={!slot.available}
                            onClick={() => setSelectedSlot(slot.time)}
                            className={cn(
                              "flex flex-col items-center justify-center py-3 px-2 rounded-xl font-bold border-2 transition-all min-h-[64px]",
                              selectedSlot === slot.time
                                ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                                : slot.available
                                  ? "bg-card border-muted hover:border-primary/50 hover:bg-primary/5"
                                  : slot.is_booked
                                    ? "bg-red-50 border-red-100 text-red-400 cursor-not-allowed"
                                    : "bg-muted/50 border-transparent text-muted-foreground cursor-not-allowed"
                            )}
                          >
                            <span className="text-sm">{slot.time}</span>
                            {slot.is_booked && <span className="text-[10px] uppercase mt-1">Reservado</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedSlot && (
                  <Card className="border-none shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold">3. Método de Pago</CardTitle>
                      <p className="text-sm text-muted-foreground">Selecciona cómo deseas pagar la consulta</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { id: 'pago_movil', name: 'Pago Móvil', icon: <Clock className="h-5 w-5" /> },
                          { id: 'zelle', name: 'Zelle', icon: <Check className="h-5 w-5" /> },
                          { id: 'bank_transfer', name: 'Transferencia', icon: <CalendarIcon className="h-5 w-5" /> },
                        ].map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setSelectedMethod(m.id)}
                            className={cn(
                              "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                              selectedMethod === m.id
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-muted hover:border-primary/30"
                            )}
                          >
                            <div className="mb-2">{m.icon}</div>
                            <span className="font-bold text-sm">{m.name}</span>
                          </button>
                        ))}
                      </div>

                      <Button 
                        className="w-full h-14 rounded-xl text-lg font-bold shadow-xl shadow-primary/20"
                        disabled={submitting || !selectedMethod}
                        onClick={handleCreateAppointmentAndPayment}
                      >
                        {submitting ? 'Procesando...' : 'Continuar al Pago'}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {step === 'payment' && (
              <Card className="border-none shadow-2xl animate-in fade-in duration-500">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-primary">Información de Pago</CardTitle>
                  <p className="text-muted-foreground">Realiza el pago a los siguientes datos:</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Instructions Display */}
                  <div className="bg-primary/5 p-6 rounded-2xl border-2 border-primary/20 space-y-4">
                    {selectedMethod === 'pago_movil' && paymentInstructions && (
                      <div className="text-center space-y-2">
                        <p className="text-xs font-bold uppercase text-primary">Datos para Pago Móvil</p>
                        <p className="text-2xl font-black">{paymentInstructions.details.bank}</p>
                        <p className="text-xl font-bold">{paymentInstructions.details.phone}</p>
                        <p className="text-lg font-medium">{paymentInstructions.details.document_id}</p>
                      </div>
                    )}
                    {selectedMethod === 'zelle' && paymentInstructions && (
                      <div className="text-center space-y-2">
                        <p className="text-xs font-bold uppercase text-primary">Datos para Zelle</p>
                        <p className="text-2xl font-black">{paymentInstructions.details.email}</p>
                        <p className="text-xl font-bold">{paymentInstructions.details.holder}</p>
                      </div>
                    )}
                    {selectedMethod === 'bank_transfer' && paymentInstructions && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase text-primary text-center">Datos para Transferencia</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="text-muted-foreground">Banco:</span>
                          <span className="font-bold">{paymentInstructions.details.bank_name}</span>
                          <span className="text-muted-foreground">Cuenta:</span>
                          <span className="font-bold break-all">{paymentInstructions.details.account_number}</span>
                          <span className="text-muted-foreground">Titular:</span>
                          <span className="font-bold">{paymentInstructions.details.account_holder}</span>
                          <span className="text-muted-foreground">Documento:</span>
                          <span className="font-bold">{paymentInstructions.details.document_id}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Data Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase">Referencia de Pago</label>
                      <Input
                        placeholder="Introduce los últimos 6 dígitos o ID"
                        value={paymentData.reference}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentData({ ...paymentData, reference: e.target.value })}
                      />
                    </div>
                    {selectedMethod === 'pago_movil' && (
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-muted-foreground uppercase">Teléfono Emisor</label>
                        <Input
                          placeholder="Desde qué número pagaste"
                          value={paymentData.phone}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentData({ ...paymentData, phone: e.target.value })}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase">Captura de pantalla (Opcional)</label>
                      <div className="border-2 border-dashed border-muted rounded-xl p-8 text-center hover:border-primary/50 transition-all cursor-pointer">
                        <Check className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground font-medium">Haz clic para subir o arrastra tu comprobante</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-14 rounded-xl text-lg font-bold shadow-xl shadow-primary/20"
                    disabled={submitting || !paymentData.reference}
                    onClick={handleConfirmPayment}
                  >
                    {submitting ? 'Verificando...' : 'Confirmar Registro de Pago'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 'confirmation' && (
              <Card className="border-none shadow-2xl animate-in zoom-in duration-500 text-center">
                <CardHeader>
                  <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-10 w-10 text-green-600" />
                  </div>
                  <CardTitle className="text-3xl font-bold">¡Casi Listos!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2 text-muted-foreground">
                    <p>Tu solicitud de cita para el <strong>{format(selectedDate, "d 'de' MMMM", { locale: es })}</strong> a las <strong>{selectedSlot}</strong> ha sido registrada.</p>
                    <p>Estamos validando tu pago con el doctor e inmediatamente te notificaremos.</p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-muted/50">
                    <p className="text-sm font-bold text-slate-700 bg-amber-50 p-4 rounded-xl border border-amber-100 italic">
                      Para ayudar a tu doctor a preparar la consulta, es muy importante que completes un breve cuestionario sobre tus síntomas actuales.
                    </p>
                    
                    <Button 
                      className="w-full h-14 rounded-xl text-lg font-bold shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                      disabled={submitting}
                      onClick={handleGoToQuestionnaire}
                    >
                      Completar Cuestionario de Triage
                    </Button>

                    <Button 
                      variant="outline"
                      className="w-full h-12 rounded-xl font-bold text-slate-500 hover:text-slate-800"
                      disabled={submitting}
                      onClick={handleFinalBooking}
                    >
                      Hacerlo más tarde (Ir a mis citas)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
