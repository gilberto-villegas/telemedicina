import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft, Calendar, User as UserIcon, Video,
  FileText, CreditCard, Pill, AlertCircle, CheckCircle2, CheckCircle,
  XCircle, Phone, Stethoscope, Activity, Heart, Thermometer,
  Shield, ChevronRight, History, Printer, MessageSquare, DollarSign,
  FileSearch, DownloadCloud, Download
} from 'lucide-react';
import { BodyMap } from '@/components/medical/BodyMap';

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
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    document_id: string;
    date_of_birth: string;
    gender: string;
  };
  doctor?: {
    id: string;
    first_name: string;
    last_name: string;
    specialty: any;
    specialty_name?: string;
    email: string;
    digital_signature?: string;
    mpps_number?: string;
  };
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
    attachments?: { id: string; file_name: string; file_url: string }[];
  } | null;
  prescription?: {
    id: string;
    medications: Array<{ name: string; dosage: string; frequency: string; duration: string; instructions?: string }>;
    instructions: string;
    valid_until: string;
    created_at: string;
  } | null;
  payment?: {
    id: string;
    amount_usd: number;
    method: string;
    status: string;
    reference: string;
  } | null;
  medical_responses?: Array<{ id: string; question: { question_text: string }; response_text: string; body_parts: string[] | null }>;
  attachments?: Array<{ id: string; file_url: string; file_name: string; file_type: string }>;
  unread_messages_count?: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  scheduled:            { label: 'Programada',       color: 'text-blue-600',   bg: 'bg-blue-50/50 border-blue-100', icon: Calendar },
  in_progress:          { label: 'En Curso',         color: 'text-emerald-600', bg: 'bg-emerald-50/50 border-emerald-100', icon: Activity },
  completed:            { label: 'Finalizada',       color: 'text-slate-600',  bg: 'bg-slate-50 border-slate-200', icon: CheckCircle2 },
  cancelled:            { label: 'Cancelada',        color: 'text-rose-600',    bg: 'bg-rose-50 border-rose-100', icon: XCircle },
  pending_payment:      { label: 'Pago Pendiente',   color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', icon: CreditCard },
  pending_verification: { label: 'Verificando Pago', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100', icon: Shield },
};

const SOAP_SECTIONS = [
  { key: 'subjective', label: 'S — Subjetivo',  desc: 'Síntomas y motivo',     color: 'border-l-indigo-500',  bg: 'bg-indigo-50/30' },
  { key: 'objective',  label: 'O — Objetivo',   desc: 'Hallazgos del examen',   color: 'border-l-fuchsia-500', bg: 'bg-fuchsia-50/30' },
  { key: 'assessment', label: 'A — Evaluación', desc: 'Diagnóstico clínico',   color: 'border-l-amber-500',   bg: 'bg-amber-50/30' },
  { key: 'plan',       label: 'P — Plan',        desc: 'Tratamiento a seguir',  color: 'border-l-emerald-500', bg: 'bg-emerald-50/30' },
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
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
        </div>
        {action}
      </div>
      <div className="relative p-8">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 py-3.5 border-b border-slate-50 last:border-0 group">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest sm:w-40 flex-shrink-0 transition-colors group-hover:text-blue-400">{label}</span>
      <span className="text-sm text-slate-700 font-semibold leading-relaxed">{value || '—'}</span>
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
          Consulta el: ${fmtDate}
        </div>
      </div>
    </div>
  `;
}

function buildMedicalRecordHtml(record: NonNullable<AppointmentData['medical_record']>): string {
  const soapItems = SOAP_SECTIONS.map(s => `
    <div class="soap-card">
      <div class="soap-label">${s.label}</div>
      <div class="soap-val">${record[s.key as keyof typeof record] || '—'}</div>
    </div>
  `).join('');

  const vitals: string[] = [];
  if (record.blood_pressure) vitals.push(`<div class="vital-tag">Presión: <span>${record.blood_pressure}</span></div>`);
  if (record.heart_rate) vitals.push(`<div class="vital-tag">FC: <span>${record.heart_rate} bpm</span></div>`);
  if (record.temperature) vitals.push(`<div class="vital-tag">Temp: <span>${record.temperature} °C</span></div>`);

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

export default function DoctorAppointmentDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) { navigate('/auth/login'); return; }
    const currentUser = authService.getUser();
    if (!currentUser || currentUser.type !== 'doctor') {
      navigate(`/dashboard/${currentUser?.type || 'patient'}`);
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

  const printFullReport = () => {
    if (!appointment) return;
    let body = buildHeaderHtml(appointment, 'Informe Médico Completo');
    if (appointment.medical_record) body += buildMedicalRecordHtml(appointment.medical_record);
    if (appointment.prescription) body += '<div style="margin: 40px 0; border-top: 1px dashed #e2e8f0;"></div>' + buildPrescriptionHtml(appointment.prescription);
    body += buildFooterHtml(appointment.doctor);
    openPrintWindow(body);
  };

  const printPrescription = () => {
    if (!appointment || !appointment.prescription) return;
    let body = buildHeaderHtml(appointment, 'Récipe Médico / Prescripción');
    body += buildPrescriptionHtml(appointment.prescription);
    body += buildFooterHtml(appointment.doctor);
    openPrintWindow(body);
  };

  const startAppointment = async () => {
    if (!appointment) return;
    try {
      await api.post(`/appointments/${id}/join`);
      if (appointment.type === 'videoconsulta') {
        navigate(`/dashboard/doctor/appointments/${id}/video`);
      } else {
        navigate(`/dashboard/doctor/chat?patient=${appointment.patient?.id}&appointment=${id}`);
      }
    } catch {
      alert('Error al iniciar la consulta');
    }
  };

  const endTeleconsulta = async () => {
    if (!appointment) return;
    if (!confirm('¿Estás seguro de finalizar esta teleconsulta?')) return;
    try {
      await api.post(`/appointments/${id}/finalize`);
      await loadAppointment();
    } catch {
      alert('Error al finalizar la teleconsulta');
    }
  };

  const cancelAppointment = async () => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) return;
    try {
      await api.put(`/appointments/${id}/cancel`);
      await loadAppointment();
    } catch {
      alert('Error al cancelar la cita');
    }
  };

  const handleVerify = async (action: 'approve' | 'reject') => {
    let reason = '';
    if (action === 'reject') reason = prompt('Motivo del rechazo:') || 'Pago no verificado';
    try {
      await api.post(`/payments/${appointment?.payment?.id}/verify`, { action, reason });
      await loadAppointment();
    } catch { alert('Error al procesar la verificación'); }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <DashboardLayout user={user}>
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-xl">
          <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800">{error || 'Cita no encontrada'}</h2>
          <Link to="/dashboard/doctor/appointments" className="mt-8 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold transition-all hover:bg-slate-800 active:scale-95">
            Volver a la agenda
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
  const endTimeFormatted = appointment.end_time ? format(new Date(appointment.end_time), 'HH:mm') : '—';

  return (
    <DashboardLayout user={user}>
      <div className="max-w-5xl mx-auto pb-20">
        {/* Header Section */}
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <Link
            to="/dashboard/doctor/appointments"
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
                  Gestión de <span className="text-blue-600">Consulta</span>
                </h1>
                <p className="text-lg text-slate-500 font-medium">
                  {formattedDate} de {formattedYear} <span className="mx-2 text-slate-300">•</span> {formattedTime} — {endTimeFormatted} hrs
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {statusName === 'scheduled' && (
                <>
                  <button
                    onClick={startAppointment}
                    className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 active:scale-95 group"
                  >
                    {appointment.type === 'videoconsulta' ? 
                      <Video className="h-5 w-5 transition-transform group-hover:scale-110" /> : 
                      <MessageSquare className="h-5 w-5 transition-transform group-hover:scale-110" />
                    }
                    <span>{appointment.type === 'videoconsulta' ? 'Iniciar Videoconsulta' : 'Iniciar Teleconsulta'}</span>
                  </button>
                  <button
                    onClick={cancelAppointment}
                    className="flex items-center gap-3 px-6 py-4 border border-rose-200 text-rose-600 rounded-2xl font-bold transition-all hover:bg-rose-50 active:scale-95"
                  >
                    <XCircle className="h-5 w-5" />
                    <span>Cancelar</span>
                  </button>
                  <button
                    onClick={endTeleconsulta}
                    className="flex items-center gap-3 px-6 py-4 border-2 border-slate-900 text-slate-900 rounded-2xl font-bold transition-all hover:bg-slate-900 hover:text-white hover:shadow-xl active:scale-95"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Finalizar Consulta</span>
                  </button>
                </>
              )}
              {statusName === 'in_progress' && (
                <div className="flex flex-wrap gap-3">
                  {appointment.type === 'videoconsulta' ? (
                    <Link to={`/dashboard/doctor/appointments/${id}/video`} className="w-full sm:w-auto">
                      <button className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold transition-all hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-200 active:scale-95">
                        <Video className="h-5 w-5" />
                        <span>Continuar Videoconsulta</span>
                      </button>
                    </Link>
                  ) : (
                    <Link to={`/dashboard/doctor/chat?patient=${appointment.patient?.id}&appointment=${id}`} className="w-full sm:w-auto">
                      <button className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold transition-all hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-200 active:scale-95">
                        <MessageSquare className="h-5 w-5" />
                        <span>Ir al Chat</span>
                      </button>
                    </Link>
                  )}
                  <button
                    onClick={endTeleconsulta}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 border-2 border-slate-900 text-slate-900 rounded-2xl font-bold transition-all hover:bg-slate-900 hover:text-white hover:shadow-xl active:scale-95"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Finalizar Consulta</span>
                  </button>
                </div>
              )}
              {statusName === 'completed' && !appointment.medical_record && (
                <Link to={`/dashboard/doctor/appointments/${id}/post-consultation`} className="w-full sm:w-auto">
                  <button className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 active:scale-95">
                    <History className="h-5 w-5" />
                    <span>Completar Informe</span>
                  </button>
                </Link>
              )}
              {statusName === 'completed' && appointment.prescription && (
                <button
                  onClick={printPrescription}
                  className="flex items-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold transition-all hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-200 active:scale-95 group"
                >
                  <Pill className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span>Imprimir Récipe</span>
                </button>
              )}
              {statusName === 'completed' && appointment.medical_record && (
                <button
                  onClick={printFullReport}
                  className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200 active:scale-95 group"
                >
                  <Printer className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span>Imprimir Informe</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Patient Info */}
            <PremiumCard title="Detalles del Paciente" icon={UserIcon} action={
              appointment.patient && (
                <Link to={`/dashboard/doctor/chat?patient=${appointment.patient.id}&appointment=${appointment.id}`}>
                  <button className="relative p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm group/chat">
                    <MessageSquare className="h-5 w-5" />
                    {Number(appointment.unread_messages_count) > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg border-2 border-white animate-bounce">
                        {appointment.unread_messages_count}
                      </span>
                    )}
                  </button>
                </Link>
              )
            }>
              {appointment.patient ? (
                <div className="space-y-1">
                  <InfoRow label="Nombre Completo" value={`${appointment.patient.first_name} ${appointment.patient.last_name}`} />
                  <InfoRow label="Identificación" value={appointment.patient.document_id} />
                  <InfoRow label="Contacto" value={
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-blue-500" />
                        {appointment.patient.phone || 'No registrado'}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <FileText className="h-3.5 w-3.5 text-blue-500" />
                        {appointment.patient.email}
                      </div>
                    </div>
                  } />
                  <InfoRow label="Nacimiento" value={
                    appointment.patient.date_of_birth 
                      ? format(new Date(appointment.patient.date_of_birth), "d 'de' MMMM, yyyy", { locale: es }) 
                      : '—'
                  } />
                  <InfoRow label="Género" value={
                    appointment.patient.gender === 'male' ? '👨 Masculino' : 
                    appointment.patient.gender === 'female' ? '👩 Femenino' : 'Otro'
                  } />
                </div>
              ) : (
                <p className="text-slate-400 italic">No hay información del paciente disponible.</p>
              )}
            </PremiumCard>

            {/* ========== MEDICAL QUESTIONNAIRE RESULTS ========== */}
            {appointment.medical_responses && appointment.medical_responses.length > 0 && (
              <PremiumCard title="Triage / Información Pre-Consulta" icon={FileSearch}>
                <div className="space-y-10">
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-8">
                      {appointment.medical_responses.map((resp) => (
                        <div key={resp.id} className="space-y-4 group">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest transition-colors group-hover:text-blue-500">
                            {resp.question?.question_text || 'Pregunta Médica'}
                          </h4>
                          <div className="flex gap-10">
                            <div className="flex-1 p-5 rounded-2xl bg-slate-50 border border-slate-100/50 text-slate-700 font-medium leading-relaxed shadow-sm">
                              {resp.response_text || 'Sin respuesta'}
                            </div>
                            {Array.isArray(resp.body_parts) && resp.body_parts.length > 0 && (
                               <div className="w-64 flex-shrink-0">
                                  <BodyMap selectedParts={resp.body_parts} readOnly />
                               </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {appointment.attachments && appointment.attachments.length > 0 && (
                      <div className="space-y-6">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                            <DownloadCloud className="h-5 w-5 text-blue-500" />
                            Archivos del Paciente ({appointment.attachments.length})
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          {appointment.attachments.map((file) => (
                            <a 
                                key={file.id} 
                                href={file.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-800 line-clamp-1">{file.file_name}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">{file.file_type ? file.file_type.split('/')[1] : 'FILE'}</p>
                                </div>
                              </div>
                              <Download className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </PremiumCard>
            )}

            {/* Medical Record */}
            {appointment.medical_record ? (
              <PremiumCard title="Resultado de Evaluación" icon={Stethoscope}>
                <div className="space-y-8">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {SOAP_SECTIONS.map(({ key, label, desc, color, bg }) => {
                      const value = appointment.medical_record![key as keyof typeof appointment.medical_record] as string;
                      if (!value) return null;
                      return (
                        <div key={key} className={`${bg} border-l-4 ${color} rounded-2xl p-6 transition-all hover:translate-y-[-2px]`}>
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">{label}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-4 italic opacity-70">{desc}</p>
                          <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{value}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Vitals */}
                  <div className="pt-8 border-t border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                       <Activity className="h-4 w-4" /> Biometría Registrada
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {appointment.medical_record.blood_pressure && (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                           <Heart className="h-5 w-5 text-rose-500 mb-2" />
                           <p className="text-[10px] font-bold text-slate-400 uppercase">Presión</p>
                           <p className="text-sm font-black text-slate-900 tracking-tighter">{appointment.medical_record.blood_pressure}</p>
                        </div>
                      )}
                      {appointment.medical_record.heart_rate && (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                           <Activity className="h-5 w-5 text-pink-500 mb-2" />
                           <p className="text-[10px] font-bold text-slate-400 uppercase">Frecuencia</p>
                           <p className="text-sm font-black text-slate-900 tracking-tighter">{appointment.medical_record.heart_rate} bpm</p>
                        </div>
                      )}
                      {appointment.medical_record.temperature && (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                           <Thermometer className="h-5 w-5 text-amber-500 mb-2" />
                           <p className="text-[10px] font-bold text-slate-400 uppercase">Temp.</p>
                           <p className="text-sm font-black text-slate-900 tracking-tighter">{appointment.medical_record.temperature} °C</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </PremiumCard>
            ) : statusName === 'completed' && (
              <div className="p-12 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center text-center">
                 <FileText className="h-12 w-12 text-slate-300 mb-4" />
                 <h3 className="font-bold text-slate-800">Informe Médico Pendiente</h3>
                 <p className="text-slate-500 text-sm mb-8">Esta cita ha finalizado pero aún no has registrado el informe SOAP.</p>
                 <Link to={`/dashboard/doctor/appointments/${id}/post-consultation`}>
                   <button className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold transition-all hover:bg-blue-700 shadow-lg shadow-blue-200">
                     Crear Informe Ahora
                   </button>
                 </Link>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Payment Verification Section */}
            {statusName === 'pending_verification' && appointment.payment && (
              <PremiumCard title="Verificación de Pago" icon={CreditCard}>
                <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-orange-600">
                           <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-orange-400 uppercase tracking-widest leading-none mb-1">Monto a verificar</p>
                          <p className="text-3xl font-black text-orange-900">${appointment.payment.amount_usd} USD</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/50 rounded-2xl border border-white">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Método</p>
                           <p className="text-sm font-bold text-slate-700 capitalize">{(appointment.payment.method || '').replace('_', ' ') || 'N/A'}</p>
                        </div>
                        <div className="p-4 bg-white/50 rounded-2xl border border-white">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Referencia</p>
                           <p className="text-sm font-bold text-slate-700 font-mono">{appointment.payment.reference || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 justify-center">
                      <button
                        onClick={() => handleVerify('approve')}
                        className="px-8 py-4 bg-green-600 text-white rounded-2xl font-black text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        Aprobar Pago
                      </button>
                      <button
                        onClick={() => handleVerify('reject')}
                        className="px-8 py-4 border border-rose-200 text-rose-600 bg-white rounded-2xl font-black text-sm hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle className="h-5 w-5" />
                        Rechazar Pago
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-orange-100/50 flex items-center gap-2 text-orange-600/70 italic text-sm font-medium">
                     <AlertCircle className="h-4 w-4" />
                     Al aprobar el pago, la cita se marcará automáticamente como programada.
                  </div>
                </div>
              </PremiumCard>
            )}

            {/* Consultation Summary Card */}
            <PremiumCard title="Datos de la Cita" icon={Calendar}>
               <div className="space-y-1">
                 <InfoRow label="Modalidad" value={appointment.type === 'videoconsulta' ? '🎥 Videoconsulta' : '📞 Teleconsulta'} />
                 <InfoRow label="Motivo" value={appointment.reason || 'General'} />
                 {appointment.price_usd && (
                   <InfoRow label="Honorarios" value={`$${parseFloat(String(appointment.price_usd)).toFixed(2)} USD`} />
                 )}
               </div>
            </PremiumCard>

            {/* Prescription Card */}
            {appointment.prescription && (
              <PremiumCard title="Tratamiento Emitido" icon={Pill}>
                 <div className="space-y-6">
                    <div className="space-y-4">
                       {appointment.prescription.medications.map((med, i) => (
                         <div key={i} className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 group transition-all hover:bg-blue-100/50">
                            <h5 className="font-extrabold text-blue-900 mb-2 flex items-center gap-2">
                               <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-[10px] flex items-center justify-center font-black">
                                  {i + 1}
                               </span>
                               {med.name}
                            </h5>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-700 font-bold opacity-80 uppercase tracking-tighter">
                               <span>Dosis: {med.dosage}</span>
                               <span>Frec: {med.frequency}</span>
                               <span>Dur: {med.duration}</span>
                            </div>
                         </div>
                       ))}
                    </div>

                    {appointment.prescription.instructions && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Instrucciones Generales</p>
                         <p className="text-xs text-slate-600 font-medium leading-relaxed italic">"{appointment.prescription.instructions}"</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vigencia</span>
                       <span className="text-xs font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
                          {format(new Date(appointment.prescription.valid_until), "d 'de' MMM, yyyy", { locale: es })}
                       </span>
                    </div>
                 </div>
              </PremiumCard>
            )}

            {/* Support/Quick Links */}
            <div className="p-8 rounded-3xl bg-slate-900 flex flex-col gap-4 shadow-xl">
               <h4 className="text-white font-black text-lg tracking-tight flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-500" /> Ayuda Profesional
               </h4>
               <p className="text-slate-400 text-xs leading-relaxed">
                  Para soporte técnico urgente durante la consulta o problemas con las recetas digitales, contacte con nuestra línea exclusiva.
               </p>
               <button className="w-full py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-white/10 active:scale-95 group">
                  <span className="text-sm">Contactar Soporte</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
               </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
