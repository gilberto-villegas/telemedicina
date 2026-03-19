import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft, Calendar, Clock,
  FileText, Pill, AlertCircle,
  Printer, Download, Stethoscope, Activity, Heart, Thermometer,
  Shield, CheckCircle2, ChevronRight, User as UserIcon, MessageSquare
} from 'lucide-react';

interface AppointmentData {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  reason: string;
  type: string;
  price_usd: number;
  status_label: string;
  status?: { id: number; name: string; label: string };
  patient?: { id: string; first_name: string; last_name: string; document_id: string; date_of_birth: string; };
  doctor?: { id: string; first_name: string; last_name: string; specialty: any; specialty_name?: string; email: string; avatar_url?: string; digital_signature?: string; };
  medical_record?: {
    id: string;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    blood_pressure: string;
    heart_rate: number;
    temperature: number;
    weight: number;
    height: number;
    created_at: string;
  } | null;
  prescription?: {
    id: string;
    medications: Array<{ name: string; dosage: string; frequency: string; duration: string; instructions?: string }>;
    instructions: string;
    valid_until: string;
    created_at: string;
  } | null;
  payment?: { id: string; amount_usd: number; method: string; status: string; reference: string; } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  scheduled: { label: 'Programada', color: 'text-blue-600', bg: 'bg-blue-50/50 border-blue-100', icon: Calendar },
  in_progress: { label: 'En Curso', color: 'text-emerald-600', bg: 'bg-emerald-50/50 border-emerald-100', icon: Activity },
  completed: { label: 'Finalizada', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelada', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100', icon: AlertCircle },
  pending_payment: { label: 'Pago Pendiente', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', icon: AlertCircle },
  pending_verification: { label: 'Verificando Pago', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100', icon: Shield },
};

const SOAP_SECTIONS = [
  { key: 'subjective', label: 'S — Subjetivo', desc: 'Síntomas y motivo', color: 'border-l-indigo-500', bg: 'bg-indigo-50/30', printColor: '#6366f1' },
  { key: 'objective', label: 'O — Objetivo', desc: 'Hallazgos del examen', color: 'border-l-fuchsia-500', bg: 'bg-fuchsia-50/30', printColor: '#d946ef' },
  { key: 'assessment', label: 'A — Evaluación', desc: 'Diagnóstico clínico', color: 'border-l-amber-500', bg: 'bg-amber-50/30', printColor: '#f59e0b' },
  { key: 'plan', label: 'P — Plan', desc: 'Tratamiento a seguir', color: 'border-l-emerald-500', bg: 'bg-emerald-50/30', printColor: '#10b981' },
] as const;

function PremiumCard({ title, icon: Icon, children, action }: { title: string; icon: any; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="group relative bg-white/70 backdrop-blur-md rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
      <div className="relative px-8 py-6 border-b border-slate-100/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center transition-colors group-hover:bg-blue-50">
            <Icon className="h-6 w-6 text-slate-400 transition-colors group-hover:text-blue-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg leading-tight">{title}</h3>
          </div>
        </div>
        {action}
      </div>
      <div className="relative p-8">{children}</div>
    </div>
  );
}

// ==================== PRINT FUNCTIONS ====================

function getPrintStyles(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; color: #1e293b; line-height: 1.6; background: #fff; }
    .page { padding: 40px 50px; }
    
    .doc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 25px; border-bottom: 2px solid #f1f5f9; }
    .brand h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .brand p { font-size: 13px; color: #64748b; font-weight: 500; }
    
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 99px; background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 35px; }
    .meta-box h4 { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .meta-content { font-size: 14px; color: #334155; }
    .meta-name { font-weight: 700; color: #0f172a; display: block; margin-bottom: 2px; }
    
    .section-title { font-size: 15px; font-weight: 800; color: #0f172a; margin: 30px 0 15px 0; display: flex; align-items: center; gap: 10px; }
    .section-title::after { content: ''; flex: 1; height: 1px; background: #f1f5f9; }
    
    .soap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .soap-card { padding: 18px; border-radius: 12px; background: #f8fafc; border-left: 4px solid #cbd5e1; }
    .soap-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px; }
    .soap-val { font-size: 13px; color: #334155; white-space: pre-wrap; }
    
    .vital-strip { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
    .vital-tag { padding: 8px 14px; background: #f1f5f9; border-radius: 8px; font-size: 12px; color: #475569; }
    .vital-tag span { font-weight: 800; color: #0f172a; margin-left: 5px; }
    
    .prescription-list { border: 1px solid #f1f5f9; border-radius: 16px; overflow: hidden; }
    .prescription-item { padding: 15px 20px; border-bottom: 1px solid #f1f5f9; }
    .prescription-item:last-child { border-bottom: none; }
    .med-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; }
    .med-name { font-weight: 800; color: #0f172a; font-size: 14px; }
    .med-dose { font-size: 12px; color: #64748b; font-weight: 600; }
    .med-meta { font-size: 12px; color: #334155; }
    .med-instr { font-size: 12px; color: #94a3b8; font-style: italic; margin-top: 5px; }
    
    .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #f1f5f9; text-align: center; }
    .footer p { font-size: 11px; color: #94a3b8; margin-bottom: 5px; }
    .qr-placeholder { margin-top: 20px; font-size: 10px; color: #cbd5e1; }

    .signature-box { margin-top: 30px; text-align: right; }
    .signature-img { max-height: 80px; max-width: 200px; display: block; margin-left: auto; margin-bottom: 5px; }
    .signature-name { font-size: 13px; font-weight: 800; color: #0f172a; border-top: 1px solid #f1f5f9; padding-top: 5px; display: inline-block; min-width: 200px; }
    .signature-specialty { font-size: 11px; color: #64748b; display: block; }
    
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `;
}

interface DoctorPrintInfo {
  first_name?: string;
  last_name?: string;
  specialty?: any;
  specialty_name?: string;
  email?: string;
  digital_signature?: string;
  mpps_number?: string;
}

function buildHeaderHtml(apt: AppointmentData, title: string): string {
  const doctor = apt.doctor as DoctorPrintInfo;
  const patient = apt.patient;
  const dateStr = apt.appointment_date || apt.start_time;
  const fmtDate = dateStr ? format(new Date(dateStr), "d 'de' MMMM, yyyy — HH:mm", { locale: es }) : '';

  return `
    <div class="doc-header">
      <div class="brand">
        <h1>🏥 Telemedicina</h1>
        <p>Atención Médica Digital Premium</p>
      </div>
      <div style="text-align: right">
        <div class="status-badge">${title}</div>
        <p style="font-size: 11px; color: #94a3b8; margin-top: 8px;">ID Cita: #${apt.id.slice(0, 8)}</p>
      </div>
    </div>
    
    <div class="meta-grid">
      <div class="meta-box">
        <h4>Profesional de la Salud</h4>
        <div class="meta-content">
          <span class="meta-name">Dr. ${doctor?.first_name} ${doctor?.last_name}</span>
          ${typeof doctor?.specialty === 'object' ? (doctor.specialty?.name || '') : (doctor?.specialty_name || doctor?.specialty || '')}<br>
          MPPS: ${doctor?.mpps_number || ''}<br>
          ${doctor?.email || ''}
        </div>
      </div>
      <div class="meta-box">
        <h4>Paciente</h4>
        <div class="meta-content">
          <span class="meta-name">${patient?.first_name} ${patient?.last_name}</span>
          Documento: ${patient?.document_id || 'N/A'}<br>
          Consulta el: ${fmtDate}
        </div>
      </div>
    </div>
  `;
}

function buildMedicalRecordHtml(record: NonNullable<AppointmentData['medical_record']>): string {
  const soapItems = SOAP_SECTIONS.map(s => `
    <div class="soap-card" style="border-left-color: ${s.printColor}; background: #fafafa; margin-bottom: 10px;">
      <div class="soap-label">${s.label}</div>
      <div class="soap-val">${record[s.key as keyof typeof record] || '—'}</div>
    </div>
  `).join('');

  const vitals: string[] = [];
  if (record.blood_pressure) vitals.push(`<div class="vital-tag">Presión: <span>${record.blood_pressure}</span></div>`);
  if (record.heart_rate) vitals.push(`<div class="vital-tag">FC: <span>${record.heart_rate} bpm</span></div>`);
  if (record.temperature) vitals.push(`<div class="vital-tag">Temp: <span>${record.temperature} °C</span></div>`);
  if (record.weight) vitals.push(`<div class="vital-tag">Peso: <span>${record.weight} kg</span></div>`);
  if (record.height) vitals.push(`<div class="vital-tag">Altura: <span>${record.height} cm</span></div>`);

  return `
    <div class="section-title">Informe Clínico SOAP</div>
    <div class="soap-grid">${soapItems}</div>
    ${vitals.length > 0 ? `<div class="section-title">Constantes Vitales</div><div class="vital-strip">${vitals.join('')}</div>` : ''}
  `;
}

function buildPrescriptionHtml(prescription: NonNullable<AppointmentData['prescription']>): string {
  const medsHtml = prescription.medications.map((med) => `
    <div class="prescription-item">
      <div class="med-row">
        <span class="med-name">${med.name}</span>
        <span class="med-dose">${med.dosage}</span>
      </div>
      <div class="med-meta">${med.frequency} • Durante ${med.duration}</div>
      ${med.instructions ? `<div class="med-instr">${med.instructions}</div>` : ''}
    </div>
  `).join('');

  let validStr = '';
  try { validStr = format(new Date(prescription.valid_until), "d 'de' MMM, yyyy", { locale: es }); } catch { /* empty */ }

  return `
    <div class="section-title">Receta y Medicación</div>
    <div class="prescription-list">${medsHtml}</div>
    ${prescription.instructions ? `
      <div class="meta-box" style="margin-top: 20px;">
        <h4>Instrucciones Generales</h4>
        <div class="meta-content">${prescription.instructions}</div>
      </div>
    ` : ''}
    <div style="margin-top: 20px; font-size: 11px; color: #64748b; font-weight: 500;">
      Vigencia hasta: <span style="color:#0f172a; font-weight:700;">${validStr}</span>
    </div>
  `;
}

function buildFooterHtml(doctor: DoctorPrintInfo | undefined): string {
  return `
    <div class="footer">
      <div class="signature-box" style="margin-bottom: 40px;">
        ${doctor?.digital_signature ? `<img src="${doctor.digital_signature}" class="signature-img" alt="Firma">` : '<div style="height: 60px;"></div>'}
        <div class="signature-name">Dr. ${doctor?.first_name} ${doctor?.last_name}</div>
        <div class="signature-specialty">${typeof doctor?.specialty === 'object' ? (doctor.specialty?.name || '') : (doctor?.specialty_name || doctor?.specialty || '')} - MPPS: ${doctor?.mpps_number || ''}</div>
      </div>
      <p>© Telemedicina — Consulta Digital Certificada</p>
      <p style="color:#cbd5e1;">Fecha de emisión: ${new Date().toLocaleDateString('es-VE')}</p>
      <div class="qr-placeholder">CÓDIGO DE VERIFICACIÓN DIGITAL — #${Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
    </div>
  `;
}

function openPrintWindow(htmlBody: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) { alert('Por favor permite las ventanas emergentes para imprimir'); return; }
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Documento Médico</title>
        <style>${getPrintStyles()}</style>
      </head>
      <body>
        <div class="page">${htmlBody}</div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 500);
}

// ==================== COMPONENT ====================

export default function PatientAppointmentDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) { navigate('/auth/login'); return; }
    const currentUser = authService.getUser();
    if (!currentUser || currentUser.type !== 'patient') {
      navigate(`/dashboard/${currentUser?.type || 'doctor'}`);
      return;
    }
    setUser(currentUser);
    loadAppointment();
  }, [id, navigate]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/appointments/${id}`);
      setAppointment(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cargar la cita');
    } finally {
      setLoading(false);
    }
  };

  const printMedicalRecord = () => {
    if (!appointment?.medical_record) return;
    const html = buildHeaderHtml(appointment, 'Informe Médico') + buildMedicalRecordHtml(appointment.medical_record) + buildFooterHtml(appointment.doctor);
    openPrintWindow(html);
  };

  const printPrescription = () => {
    if (!appointment?.prescription) return;
    const html = buildHeaderHtml(appointment, 'Receta Médica') + buildPrescriptionHtml(appointment.prescription) + buildFooterHtml(appointment.doctor);
    openPrintWindow(html);
  };

  const printAll = () => {
    if (!appointment) return;
    let body = buildHeaderHtml(appointment, 'Resumen de Consulta');
    if (appointment.medical_record) body += buildMedicalRecordHtml(appointment.medical_record);
    if (appointment.prescription) body += '<div style="margin: 40px 0; border-top: 1px dashed #e2e8f0;"></div>' + buildPrescriptionHtml(appointment.prescription);
    body += buildFooterHtml(appointment.doctor);
    openPrintWindow(body);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <DashboardLayout user={user}>
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-6">
            <AlertCircle className="h-10 w-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops! Algo salió mal</h2>
          <p className="text-slate-500 mb-8 max-w-xs text-center">{error || 'No pudimos encontrar los detalles de esta cita.'}</p>
          <Link to="/dashboard/patient/appointments" className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-semibold transition-all hover:bg-slate-800 shadow-lg shadow-slate-900/20 active:scale-95">
            Volver a mis citas
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const statusName = appointment.status?.name || '';
  const statusCfg = STATUS_CONFIG[statusName] || STATUS_CONFIG['scheduled'];
  const StatusIcon = statusCfg.icon;
  const appointmentDate = appointment.appointment_date || appointment.start_time;
  const formattedDate = appointmentDate ? format(new Date(appointmentDate), "EEEE, d 'de' MMMM", { locale: es }) : '—';
  const formattedYear = appointmentDate ? format(new Date(appointmentDate), "yyyy") : '';
  const formattedTime = appointmentDate ? format(new Date(appointmentDate), 'HH:mm') : '—';

  const record = appointment.medical_record;
  const prescription = appointment.prescription;

  return (
    <DashboardLayout user={user}>
      <div className="max-w-5xl mx-auto pb-20">
        {/* Header Section */}
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <Link
            to="/dashboard/patient/appointments"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-blue-600 hover:border-blue-100 transition-all mb-8 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-semibold">Regresar</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`px-4 py-1.5 rounded-full border ${statusCfg.bg} ${statusCfg.color} flex items-center gap-2`}>
                  <StatusIcon className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">{statusCfg.label}</span>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  #{appointment.id.slice(0, 8)}
                </div>
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-2 uppercase">
                  Detalle de <span className="text-blue-600">Consulta</span>
                </h1>
                <p className="text-lg text-slate-500 font-medium">
                  {formattedDate} de {formattedYear} <span className="mx-2 text-slate-300">•</span> {formattedTime} hrs
                </p>
              </div>
            </div>

            {(record || prescription) && (
              <div className="flex items-center gap-3">
                <button
                  onClick={printAll}
                  className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200 active:scale-95 group"
                >
                  <Printer className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span>Descargar Todo</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Appointment Info */}
            <PremiumCard title="Resumen de Consulta" icon={Calendar}>
              <div className="grid sm:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Motivo de Consulta</p>
                    <p className="text-slate-800 font-semibold leading-relaxed text-lg">
                      {appointment.reason || 'Consulta médica general'}
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Duración</p>
                      <p className="text-slate-800 font-bold">30 - 45 Minutos</p>
                    </div>
                  </div>
                </div>

                {appointment.doctor && (
                  <div className="space-y-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Profesional Asignado</p>
                    <div className="flex items-center gap-5 p-2 pr-6 rounded-3xl bg-blue-50/50 border border-blue-100/50">
                      <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl overflow-hidden">
                        {appointment.doctor.avatar_url ? (
                          <img src={appointment.doctor.avatar_url} alt="Dr." className="w-full h-full object-cover" />
                        ) : <UserIcon className="h-8 w-8" />}
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-900 font-extrabold text-lg leading-tight">
                              Dr. {appointment.doctor.first_name} {appointment.doctor.last_name}
                            </p>
                            <p className="text-blue-600 font-bold text-sm tracking-wide">
                              {typeof appointment.doctor.specialty === 'object' 
                                ? (appointment.doctor.specialty?.name || 'Generalista')
                                : (appointment.doctor.specialty_name || appointment.doctor.specialty || 'Generalista')}
                            </p>
                          </div>
                          <Link to={`/dashboard/patient/chat?doctor=${appointment.doctor.id}`} className="ml-4">
                            <button className="p-3 bg-white text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100">
                              <MessageSquare className="h-5 w-5" />
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </PremiumCard>

            {/* ========== MEDICAL RECORD ========== */}
            {record ? (
              <PremiumCard
                title="Informe Clínico Digital"
                icon={Stethoscope}
                action={
                  <button
                    onClick={printMedicalRecord}
                    className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    title="Imprimir informe"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                }
              >
                <div className="space-y-8">
                  {/* SOAP Sections */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {SOAP_SECTIONS.map(({ key, label, desc, color, bg }) => {
                      const value = record[key as keyof typeof record] as string;
                      if (!value) return null;
                      return (
                        <div key={key} className={`${bg} border-l-4 ${color} rounded-2xl p-6 transition-transform hover:scale-[1.02] duration-300`}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter">{label}</h4>
                            <CheckCircle2 className="h-4 w-4 text-slate-300" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 italic">{desc}</p>
                          <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{value}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Vitals */}
                  {(record.blood_pressure || record.heart_rate || record.temperature || record.weight || record.height) && (
                    <div className="pt-8 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                          <Activity className="h-5 w-5 text-blue-500" />
                          Biometría y Constantes
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                        {record.blood_pressure && (
                          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex flex-col items-center justify-center text-center group cursor-default">
                            <Heart className="h-6 w-6 text-rose-500 mb-2 transition-transform group-hover:scale-110" />
                            <p className="text-[10px] font-bold text-rose-400 uppercase">Presión</p>
                            <p className="text-sm font-black text-rose-900 tracking-tighter">{record.blood_pressure}</p>
                          </div>
                        )}
                        {record.heart_rate && (
                          <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 flex flex-col items-center justify-center text-center group cursor-default">
                            <Activity className="h-6 w-6 text-pink-500 mb-2 transition-transform group-hover:scale-110" />
                            <p className="text-[10px] font-bold text-pink-400 uppercase">Frecuencia</p>
                            <p className="text-sm font-black text-pink-900 tracking-tighter">{record.heart_rate} <span className="text-[10px]">bpm</span></p>
                          </div>
                        )}
                        {record.temperature && (
                          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex flex-col items-center justify-center text-center group cursor-default">
                            <Thermometer className="h-6 w-6 text-amber-500 mb-2 transition-transform group-hover:scale-110" />
                            <p className="text-[10px] font-bold text-amber-500 uppercase">Temp.</p>
                            <p className="text-sm font-black text-amber-900 tracking-tighter">{record.temperature} <span className="text-[10px]">°C</span></p>
                          </div>
                        )}
                        {record.weight && (
                          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col items-center justify-center text-center group cursor-default">
                            <div className="h-6 w-6 bg-blue-500 rounded-lg flex items-center justify-center text-white text-[10px] font-black mb-2 transition-transform group-hover:scale-110">KG</div>
                            <p className="text-[10px] font-bold text-blue-400 uppercase">Peso</p>
                            <p className="text-sm font-black text-blue-900 tracking-tighter">{record.weight}</p>
                          </div>
                        )}
                        {record.height && (
                          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col items-center justify-center text-center group cursor-default">
                            <div className="h-6 w-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-[10px] font-black mb-2 transition-transform group-hover:scale-110">CM</div>
                            <p className="text-[10px] font-bold text-emerald-400 uppercase">Altura</p>
                            <p className="text-sm font-black text-emerald-900 tracking-tighter">{record.height}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </PremiumCard>
            ) : statusName === 'completed' && (
              <div className="p-10 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center bg-slate-50/50">
                <FileText className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="font-bold text-slate-700">Informe Médico Pendiente</h3>
                <p className="text-slate-500 text-sm max-w-xs mt-2">El doctor está redactando su informe. Estará disponible en unos instantes.</p>
              </div>
            )}
          </div>

          {/* Right Column: Prescription & Others */}
          <div className="space-y-8">
            {/* ========== PRESCRIPTION ========== */}
            {prescription ? (
              <PremiumCard
                title="Receta Médica"
                icon={Pill}
                action={
                  <button
                    onClick={printPrescription}
                    className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    title="Imprimir receta"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                }
              >
                <div className="space-y-6">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                    Medicamentos
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-[10px]">
                      {prescription.medications.length} ÍTEMS
                    </span>
                  </p>

                  <div className="space-y-4">
                    {prescription.medications.map((med, i) => (
                      <div key={i} className="relative p-5 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden group hover:border-blue-200 transition-colors">
                        <div className="absolute right-[-10px] top-[-10px] text-slate-50 group-hover:text-blue-50 transition-colors">
                          <Pill className="h-20 w-20" />
                        </div>
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                              {i + 1}
                            </div>
                            <h5 className="font-extrabold text-slate-900 transition-colors group-hover:text-blue-600">{med.name}</h5>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Dosis</p>
                              <p className="text-xs font-bold text-slate-700">{med.dosage}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Frecuencia</p>
                              <p className="text-xs font-bold text-slate-700">{med.frequency}</p>
                            </div>
                          </div>
                          {med.instructions && (
                            <p className="mt-3 pt-3 border-t border-slate-50 text-[11px] text-slate-500 font-medium italic">
                              "{med.instructions}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {prescription.instructions && (
                    <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100/50">
                      <p className="text-xs font-bold text-blue-600 uppercase mb-2">Instrucciones</p>
                      <p className="text-xs text-blue-800 font-medium leading-relaxed">{prescription.instructions}</p>
                    </div>
                  )}

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Vencimiento</span>
                    <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
                      {format(new Date(prescription.valid_until), "d 'de' MMM, yyyy", { locale: es })}
                    </span>
                  </div>
                </div>
              </PremiumCard>
            ) : statusName === 'completed' && (
              <div className="p-8 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center bg-slate-50/50">
                <Pill className="h-10 w-10 text-slate-300 mb-3" />
                <h4 className="font-bold text-slate-700 text-sm">Receta no emitida</h4>
                <p className="text-slate-400 text-xs mt-1">Si el doctor indicó medicación, aparecerá aquí.</p>
              </div>
            )}

            {/* Support Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10 transition-transform group-hover:scale-110 duration-500">
                <Shield className="h-40 w-40" />
              </div>
              <div className="relative z-10">
                <h4 className="font-black text-xl mb-2 italic">Ayuda Médica</h4>
                <p className="text-blue-100 text-xs font-medium mb-6 leading-relaxed">
                  Si tiene dudas sobre su tratamiento o presenta efectos secundarios, contacte a soporte.
                </p>
                <a
                  href="https://wa.me/584242107027"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black flex items-center justify-center gap-3 transition-all hover:bg-blue-50 active:scale-95 shadow-lg shadow-blue-500/10"
                >
                  Contactar Soporte
                  <ChevronRight className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
