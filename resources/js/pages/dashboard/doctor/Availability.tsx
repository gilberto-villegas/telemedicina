import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plus, Trash2, Save, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

interface AvailabilitySlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const DAYS = [
  { label: 'Domingo',   short: 'Dom', weekend: true },
  { label: 'Lunes',     short: 'Lun', weekend: false },
  { label: 'Martes',    short: 'Mar', weekend: false },
  { label: 'Miércoles', short: 'Mié', weekend: false },
  { label: 'Jueves',    short: 'Jue', weekend: false },
  { label: 'Viernes',   short: 'Vie', weekend: false },
  { label: 'Sábado',    short: 'Sáb', weekend: true },
];

export default function AvailabilityPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) { navigate('/auth/login'); return; }
    const currentUser = authService.getUser();
    if (!currentUser || currentUser.type !== 'doctor') { navigate(`/dashboard/${currentUser?.type || 'patient'}`); return; }
    setUser(currentUser);
    loadAvailability();
  }, [navigate]);

  const loadAvailability = async () => {
    try {
      const response = await api.get('/doctors/me/availability');
      setAvailability(response.data || []);
    } catch { } finally { setLoading(false); }
  };

  const addSlot = (dayOfWeek: number) => {
    setAvailability([...availability, { day_of_week: dayOfWeek, start_time: '09:00', end_time: '17:00', is_available: true }]);
  };

  const removeSlot = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: any) => {
    const updated = [...availability];
    updated[index] = { ...updated[index], [field]: value };
    setAvailability(updated);
  };

  const handleSave = async () => {
    const hasInvalidSlots = availability.some(slot => slot.start_time >= slot.end_time);
    if (hasInvalidSlots) { alert('La hora de inicio debe ser anterior a la hora de fin en todos los horarios.'); return; }
    setSaving(true);
    try {
      await api.post('/doctors/me/availability', { slots: availability });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { alert('Error al guardar la disponibilidad'); } finally { setSaving(false); }
  };

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  const groupedByDay = availability.reduce((acc, slot, index) => {
    if (!acc[slot.day_of_week]) acc[slot.day_of_week] = [];
    acc[slot.day_of_week].push({ ...slot, _index: index });
    return acc;
  }, {} as Record<number, Array<AvailabilitySlot & { _index: number }>>);

  const totalSlots = availability.length;
  const activeDays = Object.keys(groupedByDay).length;

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link to="/dashboard/doctor" className="group inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-4">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-bold uppercase tracking-widest">Panel Principal</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Disponibilidad</h1>
            <p className="text-gray-500 mt-0.5">Configura tus horarios de atención</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg backdrop-blur-md transition-all ${
              saved
                ? 'bg-emerald-600/90 text-white'
                : 'bg-blue-600/90 hover:bg-blue-700 text-white hover:shadow-blue-500/20'
            } disabled:opacity-60`}
          >
            {saved ? (
              <><CheckCircle className="h-4 w-4" /> Guardado</>
            ) : saving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
            ) : (
              <><Save className="h-4 w-4" /> Guardar Cambios</>
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Días Activos', value: activeDays, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Horarios', value: totalSlots, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Horas Aprox.', value: `${availability.reduce((sum, s) => {
              const [sh, sm] = s.start_time.split(':').map(Number);
              const [eh, em] = s.end_time.split(':').map(Number);
              return sum + ((eh * 60 + em) - (sh * 60 + sm)) / 60;
            }, 0).toFixed(0)}h`, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg}/70 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/20 shadow-sm`}>
              <div className={`text-2xl font-black ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 font-medium mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="space-y-3">
          {DAYS.map((day, dayIndex) => {
            const daySlots = groupedByDay[dayIndex] || [];
            const isActive = daySlots.length > 0;
            return (
              <div
                key={dayIndex}
                className={`bg-white/70 backdrop-blur-xl rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isActive ? 'border-blue-200 shadow-lg' : 'border-gray-100'
                }`}
              >
                {/* Day header */}
                <div className={`flex items-center justify-between px-5 py-4 ${isActive ? 'bg-blue-50/50' : 'bg-gray-50/50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                    } ${day.weekend ? 'opacity-70' : ''}`}>
                      {day.short}
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{day.label}</p>
                      {day.weekend && <p className="text-xs text-gray-400">Fin de semana</p>}
                    </div>
                    {isActive && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {daySlots.length} horario{daySlots.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => addSlot(dayIndex)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-blue-300 text-blue-600 text-xs font-semibold hover:bg-blue-50 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar
                  </button>
                </div>

                {/* Slots */}
                {daySlots.length > 0 && (
                  <div className="px-5 py-4 space-y-2">
                    {daySlots.map((slot) => (
                      <div key={slot._index} className="flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                        <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <input
                          type="time"
                          value={slot.start_time}
                          onChange={(e) => updateSlot(slot._index, 'start_time', e.target.value)}
                          className="h-8 px-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300"
                        />
                        <span className="text-gray-400 text-sm font-medium">→</span>
                        <input
                          type="time"
                          value={slot.end_time}
                          onChange={(e) => updateSlot(slot._index, 'end_time', e.target.value)}
                          className="h-8 px-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300"
                        />
                        <button
                          onClick={() => removeSlot(slot._index)}
                          className="ml-auto p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
