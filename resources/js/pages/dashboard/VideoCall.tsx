import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, CheckCircle, MessageSquare } from 'lucide-react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';

import io from 'socket.io-client';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function VideoCallPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [showChat, setShowChat] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/auth/login');
      return;
    }
    const currentUser = authService.getUser();
    setUser(currentUser);
    loadAppointment();

    // Socket para notificaciones de chat en vivo
    const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    const socket = io(WS_URL);
    
    socket.on('connect', () => {
      if (currentUser) socket.emit('join-user', currentUser.id);
    });

    socket.on('new-message', () => {
        setHasNewMessage(true);
    });

    // Cargar script de Jitsi
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
      socket.disconnect();
      document.body.removeChild(script);
    };
  }, [id]);

  const loadAppointment = async () => {
    try {
      const response = await api.get(`/appointments/${id}`);
      let aptData = response.data;
      const statusName = aptData.status?.name || aptData.status_name;

      // Si la cita está en 'scheduled', hacer join automáticamente para pasarla a 'in_progress'
      if (statusName === 'scheduled') {
        try {
          await api.post(`/appointments/${id}/join`);
          // Recargar la cita para obtener el estado actualizado
          const updatedResponse = await api.get(`/appointments/${id}`);
          aptData = updatedResponse.data;
        } catch (joinError) {
          console.error('Error al unirse a la cita:', joinError);
        }
      }

      setAppointment(aptData);
    } catch (error) {
      console.error('Error loading appointment:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && appointment && user && jitsiContainerRef.current) {
      const domain = 'meet.jit.si';
      const options = {
        roomName: appointment.video_room_id || `Telemed-${appointment.id}`,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: `${user.first_name} ${user.last_name}`,
          email: user.email
        },
        lang: 'es',
        configOverwrite: {
          prejoinPageEnabled: true, // Habilitar para que el usuario pueda seleccionar dispositivos
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableDeepLinking: true,
          enableWelcomePage: false,
          enableNoAudioDetection: true,
          enableNoVideoDetection: true,
          resolution: 480,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'hangup', 'profile', 'chat', 'recording',
            'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'tileview', 'videobackgroundblur', 'help', 'mute-everyone',
            'security'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_REMOTE_DISPLAY_NAME: 'Paciente',
        },
        featureFlags: {
            'call-stats.enabled': true,
            'pip.enabled': true,
            'ios.screensharing.enabled': true,
            'prejoinpage.enabled': true,
            'welcomepage.enabled': false,
            'chrome-extension-banner.enabled': false,
        }
      };

      // Esperar a que el script de Jitsi se cargue si no está listo
      const initJitsi = () => {
        if (window.JitsiMeetExternalAPI) {
          try {
            apiRef.current = new window.JitsiMeetExternalAPI(domain, options);
            
            apiRef.current.addEventListeners({
              readyToClose: () => {
                navigate(`/dashboard/${user.type}/appointments`);
              },
              videoConferenceLeft: () => {
                navigate(`/dashboard/${user.type}/appointments`);
              }
            });
          } catch (err) {
            console.error('Error al inicializar Jitsi:', err);
          }
        } else {
          setTimeout(initJitsi, 500);
        }
      };

      initJitsi();
    }
  }, [loading, appointment, user]);

  const finalizeConsultation = async () => {
    if (confirm('¿Estás seguro de finalizar la consulta? Se marcará como completada.')) {
      try {
        await api.post(`/appointments/${id}/finalize`);
        if (apiRef.current) apiRef.current.dispose();
        navigate(`/dashboard/doctor/appointments/${id}/post-consultation`);
      } catch (error) {
        alert('Error al finalizar la consulta');
      }
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="flex flex-col h-[calc(100vh-120px)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Consulta Virtual</h1>
            <p className="text-sm text-gray-600">
              {user.type === 'doctor' ? `Paciente: ${appointment?.patient?.first_name} ${appointment?.patient?.last_name}` : `Dr. ${appointment?.doctor?.first_name} ${appointment?.doctor?.last_name}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
                variant={showChat ? "default" : "outline"} 
                onClick={() => {
                    setShowChat(!showChat);
                    setHasNewMessage(false);
                }}
                className={hasNewMessage && !showChat ? "animate-bounce border-blue-500 text-blue-600" : ""}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat {hasNewMessage && !showChat && "(+1)"}
            </Button>
            {user.type === 'doctor' && (
              <Button variant="default" onClick={finalizeConsultation} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Finalizar Consulta
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate(-1)}>
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden relative">
          <Card className="flex-1 overflow-hidden bg-black relative">
            <CardContent className="p-0 h-full">
              <div ref={jitsiContainerRef} className="h-full w-full" />
            </CardContent>
          </Card>

          {showChat && appointment && (
            <div className="hidden lg:block h-full">
               <ChatSidebar 
                  appointmentId={appointment.id} 
                  userId={user.id} 
                  onClose={() => setShowChat(false)} 
               />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
