'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  Stethoscope,
  LayoutDashboard,
  Calendar,
  FileText,
  CreditCard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Pill,
  MessageSquare,
  Clock
} from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { AIAssistant } from '@/components/dashboard/AIAssistant';
import { useNotificationsContext } from '@/contexts/NotificationsContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

interface NavItem {
  href: string;
  icon: any;
  label: string;
  id?: string;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const pathname = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { unreadCount } = useNotificationsContext();

  const handleLogout = () => {
    authService.logout();
    navigate('/auth/login');
  };

  useEffect(() => {
    // Si es doctor y no tiene avatar_url, y no está ya en settings, redirigir
    if (user.type === 'doctor' && !user.avatar_url && !pathname.pathname.includes('/settings')) {
      navigate(`/dashboard/doctor/settings`, { replace: true });
    }
  }, [user.avatar_url, user.type, pathname.pathname, navigate]);

  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      { href: `/dashboard/${user.type}`, icon: LayoutDashboard, label: 'Dashboard', id: 'nav-dashboard' },
    ];

    if (user.type === 'patient') {
      return [
        ...baseItems,
        { href: `/dashboard/${user.type}/doctors`, icon: Stethoscope, label: 'Buscar Médicos', id: 'nav-doctors' },
        { href: `/dashboard/${user.type}/appointments`, icon: Calendar, label: 'Mis Citas', id: 'nav-appointments' },
        { href: `/dashboard/${user.type}/medical-records`, icon: FileText, label: 'Historial Clínico', id: 'nav-medical-records' },
        { href: `/dashboard/${user.type}/prescriptions`, icon: Pill, label: 'Recetas', id: 'nav-prescriptions' },
        { href: `/dashboard/${user.type}/payments`, icon: CreditCard, label: 'Pagos', id: 'nav-payments' },
        { href: `/dashboard/${user.type}/chat`, icon: MessageSquare, label: 'Mensajes', id: 'nav-chat' },
        { href: `/dashboard/${user.type}/settings`, icon: Settings, label: 'Configuración', id: 'nav-settings' },
      ];
    }

    if (user.type === 'doctor') {
      return [
        ...baseItems,
        { href: `/dashboard/${user.type}/appointments`, icon: Calendar, label: 'Agenda', id: 'nav-doctor-agenda' },
        { href: `/dashboard/${user.type}/patients`, icon: Users, label: 'Pacientes', id: 'nav-doctor-patients' },
        { href: `/dashboard/${user.type}/payments`, icon: CreditCard, label: 'Validar Pagos', id: 'nav-doctor-payments' },
        { href: `/dashboard/${user.type}/availability`, icon: Clock, label: 'Disponibilidad', id: 'nav-doctor-availability' },
        { href: `/dashboard/${user.type}/chat`, icon: MessageSquare, label: 'Mensajes', id: 'nav-doctor-chat' },
        { href: `/dashboard/${user.type}/settings`, icon: Settings, label: 'Configuración', id: 'nav-doctor-settings' },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();
  const isActive = (href: string) => pathname.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              <span className="font-bold text-primary">Telemedicina</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  id={item.id}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.href)
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:border-r">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-primary">Telemedicina</span>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                id={item.id}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.href)
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1">{item.label}</span>
                {item.label === 'Mensajes' && unreadCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center px-1 rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm group-hover:bg-red-600 transition-colors">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>

              <div className="flex items-center gap-4 ml-auto">
                <NotificationBell />
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user.type}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-sm overflow-hidden">
                  <div className="w-full h-full rounded-[0.55rem] bg-white flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-blue-600">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8" id="dashboard-main">
          {children}
        </main>

        {/* AI Assistant for Patients */}
        {user.type === 'patient' && <AIAssistant />}
      </div>
    </div>
  );
}
