import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import {
  ArrowLeft, FileText, Pill, Plus, Trash2, Save,
  Thermometer, Heart, Activity, CheckCircle, AlertCircle
} from 'lucide-react';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

const emptyMedication = (): Medication => ({
  name: '', dosage: '', frequency: '', duration: '', instructions: ''
});

export default function PostConsultationFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedRecord, setSavedRecord] = useState(false);
  const [savedPrescription, setSavedPrescription] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SOAP fields
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');

  // Vitals
  const [bloodPressure, setBloodPressure] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  // Prescription
  const [medications, setMedications] = useState<Medication[]>([emptyMedication()]);
  const [prescriptionInstructions, setPrescriptionInstructions] = useState('');
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

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
      const response = await api.get(`/appointments/${id}`);
      setAppointment(response.data);
    } catch {
      setError('No se pudo cargar la información de la cita');
    } finally {
      setLoading(false);
    }
  };

  const addMedication = () => setMedications([...medications, emptyMedication()]);

  const removeMedication = (index: number) => {
    if (medications.length <= 1) return;
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjective && !objective && !assessment && !plan) {
      setError('Debes completar al menos un campo del informe médico');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // 1. Crear informe médico
      const recordPayload: any = {
        appointment_id: id,
        subjective: subjective || undefined,
        objective: objective || undefined,
        assessment: assessment || undefined,
        plan: plan || undefined,
      };
      if (bloodPressure) recordPayload.blood_pressure = bloodPressure;
      if (heartRate) recordPayload.heart_rate = parseInt(heartRate);
      if (temperature) recordPayload.temperature = parseFloat(temperature);
      if (weight) recordPayload.weight = parseFloat(weight);
      if (height) recordPayload.height = parseFloat(height);

      await api.post('/medical-records', recordPayload);
      setSavedRecord(true);

      // 2. Validar receta
      const activeMeds = medications.filter(m => m.name || m.dosage || m.frequency || m.duration);
      const validMeds = activeMeds.filter(m => m.name && m.dosage && m.frequency && m.duration);
      
      if (activeMeds.length > 0 && validMeds.length !== activeMeds.length) {
        setError('Por favor completa todos los campos (Nombre, Dosis, Frecuencia, Duración) de los medicamentos que has agregado.');
        setSaving(false);
        return;
      }

      if (validMeds.length > 0) {
        await api.post('/prescriptions', {
          appointment_id: id,
          medications: validMeds,
          instructions: prescriptionInstructions || undefined,
          valid_until: validUntil,
        });
        setSavedPrescription(true);
      }

      // Redirigir al detalle de la cita
      setTimeout(() => {
        navigate(`/dashboard/doctor/appointments/${id}`);
      }, 1500);

    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al guardar. Intenta nuevamente.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-gray-500 text-sm">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  if (error && !appointment) {
    return (
      <DashboardLayout user={user}>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
          <p className="font-semibold text-gray-700">{error}</p>
          <Link to="/dashboard/doctor/appointments" className="mt-4 text-sm text-blue-600 hover:underline">← Volver a la agenda</Link>
        </div>
      </DashboardLayout>
    );
  }

  // Success state
  if (savedRecord) {
    return (
      <DashboardLayout user={user}>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {savedPrescription ? 'Informe y Receta Guardados' : 'Informe Médico Guardado'}
          </h2>
          <p className="text-gray-500 text-sm">Redireccionando al detalle de la cita...</p>
        </div>
      </DashboardLayout>
    );
  }

  const patient = appointment?.patient;

  return (
    <DashboardLayout user={user}>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <Link
            to={`/dashboard/doctor/appointments/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al detalle
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Informe Post-Consulta</h1>
          {patient && (
            <p className="text-gray-500 mt-0.5">
              Paciente: <span className="font-medium text-gray-700">{patient.first_name} {patient.last_name}</span>
              {patient.document_id && <span className="ml-2 text-gray-400">CI: {patient.document_id}</span>}
            </p>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ========== INFORME MÉDICO (SOAP) ========== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <FileText className="h-5 w-5" />
            <h2 className="font-semibold">Informe Médico (SOAP)</h2>
          </div>

          <div className="p-6 space-y-5">
            {/* SOAP Fields */}
            {[
              { key: 'subjective', label: 'S — Subjetivo', desc: 'Síntomas reportados por el paciente, motivo de consulta', value: subjective, setter: setSubjective, color: 'border-l-blue-400' },
              { key: 'objective', label: 'O — Objetivo', desc: 'Hallazgos clínicos, observaciones del examen', value: objective, setter: setObjective, color: 'border-l-purple-400' },
              { key: 'assessment', label: 'A — Evaluación', desc: 'Diagnóstico, razonamiento clínico', value: assessment, setter: setAssessment, color: 'border-l-orange-400' },
              { key: 'plan', label: 'P — Plan', desc: 'Tratamiento, seguimiento, recomendaciones', value: plan, setter: setPlan, color: 'border-l-green-400' },
            ].map(({ key, label, desc, value, setter, color }) => (
              <div key={key} className={`border-l-4 ${color} pl-4`}>
                <label className="block text-sm font-bold text-gray-700 mb-0.5">{label}</label>
                <p className="text-xs text-gray-400 mb-2">{desc}</p>
                <textarea
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none transition-all"
                  placeholder={`Escribir ${label.toLowerCase()}...`}
                />
              </div>
            ))}

            {/* Vitals */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" /> Signos Vitales
                <span className="text-xs font-normal text-gray-400">(opcional)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { label: 'Presión Arterial', placeholder: '120/80', value: bloodPressure, setter: setBloodPressure, icon: Heart, type: 'text' },
                  { label: 'Frec. Cardíaca', placeholder: '72 bpm', value: heartRate, setter: setHeartRate, icon: Heart, type: 'number' },
                  { label: 'Temperatura', placeholder: '36.5 °C', value: temperature, setter: setTemperature, icon: Thermometer, type: 'number' },
                  { label: 'Peso (kg)', placeholder: '70', value: weight, setter: setWeight, icon: Activity, type: 'number' },
                  { label: 'Altura (cm)', placeholder: '170', value: height, setter: setHeight, icon: Activity, type: 'number' },
                ].map(({ label, placeholder, value, setter, type }) => (
                  <div key={label}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                    <input
                      type={type}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder={placeholder}
                      step={type === 'number' ? 'any' : undefined}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ========== RECETA MÉDICA ========== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white">
            <div className="flex items-center gap-2.5">
              <Pill className="h-5 w-5" />
              <h2 className="font-semibold">Receta Médica</h2>
            </div>
            <span className="text-xs opacity-80">Opcional — deja vacío si no aplica</span>
          </div>

          <div className="p-6 space-y-4">
            {/* Medications list */}
            {medications.map((med, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <span className="w-6 h-6 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center">{index + 1}</span>
                    Medicamento
                  </span>
                  {medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedication(index)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nombre del medicamento</label>
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder="Ej: Amoxicilina 500mg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Dosis</label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder="Ej: 1 cápsula"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Frecuencia</label>
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder="Ej: Cada 8 horas"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Duración</label>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder="Ej: 7 días"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Instrucciones adicionales (opcional)</label>
                  <input
                    type="text"
                    value={med.instructions}
                    onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="Ej: Tomar con alimentos"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addMedication}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 text-sm font-medium hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all w-full justify-center"
            >
              <Plus className="h-4 w-4" /> Agregar otro medicamento
            </button>

            {/* General instructions */}
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1">Instrucciones generales</label>
              <textarea
                value={prescriptionInstructions}
                onChange={(e) => setPrescriptionInstructions(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                placeholder="Indicaciones generales para el paciente..."
              />
            </div>

            {/* Valid until */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vigente hasta</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between gap-4 pt-2 pb-8">
          <Link
            to={`/dashboard/doctor/appointments/${id}`}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
          >
            Omitir por ahora
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Guardar Informe y Receta
              </>
            )}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
