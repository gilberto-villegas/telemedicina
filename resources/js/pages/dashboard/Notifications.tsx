import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Bell, ArrowLeft, CheckCircle2, Clock, Calendar, MessageSquare, CreditCard, Stethoscope } from 'lucide-react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const ICON_MAP: Record<string, any> = {
  appointment: Calendar,
  chat: MessageSquare,
  payment: CreditCard,
  system: Bell,
  doctor: Stethoscope,
};

const COLOR_MAP: Record<string, string> = {
  appointment: 'bg-blue-50 text-blue-600',
  chat: 'bg-indigo-50 text-indigo-600',
  payment: 'bg-emerald-50 text-emerald-600',
  system: 'bg-slate-50 text-slate-600',
  doctor: 'bg-rose-50 text-rose-600',
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const { 
    notifications, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    isMarkingAllAsRead 
  } = useNotifications({ per_page: 50 });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/auth/login');
      return;
    }
    setUser(authService.getUser());
  }, [navigate]);

  if (!user) return null;

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          <Link
            to={`/dashboard/${user.type}`}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-blue-600 hover:border-blue-100 transition-all mb-6 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-semibold">Regresar al Panel</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">
                Centro de <span className="text-blue-600">Notificaciones</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium">Mantente al día con tus citas y mensajes</p>
            </div>
            {notifications.length > 0 && (
              <Button
                variant="outline"
                className="h-12 px-6 rounded-2xl border-slate-200 font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all group"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAllAsRead}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
          {isLoading ? (
            <div className="p-20 text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-slate-500 font-medium">Cargando tus notificaciones...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Bell className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">No tienes notificaciones</h3>
              <p className="text-slate-400 max-w-xs mx-auto">
                Te avisaremos cuando tengas una nueva cita, mensaje o actualización importante.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {notifications.map((notification) => {
                const Icon = ICON_MAP[notification.type] || Bell;
                const colorClass = COLOR_MAP[notification.type] || 'bg-slate-50 text-slate-600';
                
                return (
                  <div 
                    key={notification.id}
                    className={`p-6 flex items-start gap-4 hover:bg-slate-50/50 transition-colors group relative ${!notification.read_at ? 'bg-blue-50/30' : ''}`}
                  >
                    {!notification.read_at && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                    )}
                    <div className={`h-12 w-12 rounded-xl ${colorClass} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className={`font-bold text-slate-900 ${!notification.read_at ? 'text-blue-900' : ''}`}>
                            {notification.data?.title}
                          </h4>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {notification.data?.message}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
                          </p>
                          {!notification.read_at && (
                            <button 
                              onClick={() => markAsRead(notification.id)}
                              className="mt-2 text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-tighter"
                            >
                              Marcar leída
                            </button>
                          )}
                        </div>
                      </div>
                      {notification.data?.action_url && (
                        <Link 
                          to={notification.data.action_url}
                          className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-white border border-slate-100 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                        >
                          Ver detalles
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
