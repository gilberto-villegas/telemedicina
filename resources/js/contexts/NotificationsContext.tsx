'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUnreadNotificationsCount } from '../lib/hooks/useNotifications';
import { useFCMToken } from '../lib/hooks/useFCMToken';
import { subscribeToNotifications } from '../lib/notifications/socket';
import { Notification, notificationService } from '../lib/api/notifications';

interface NotificationsContextType {
  unreadCount: number;
  isLoading: boolean;
  addNotification: (notification: Notification) => void;
  refreshCount: () => void;
  fcmToken: string | null;
  fcmPermission: NotificationPermission;
  isFCMLoading: boolean;
  incomingCall: Notification | null;
  setIncomingCall: (call: Notification | null) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Solo cargar notificaciones si hay token
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const hasToken = !!token;
  
  const { count, isLoading, refetch } = useUnreadNotificationsCount();
  const { token: fcmToken, permission: fcmPermission, isLoading: isFCMLoading } = useFCMToken();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [incomingCall, setIncomingCall] = useState<Notification | null>(null);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    // Refrescar contador
    refetch();

    // Si es una videollamada entrante, activarla
    if (notification.type === 'videocall_incoming') {
      setIncomingCall(notification);
    }
  }, [refetch]);

  const refreshCount = useCallback(() => {
    refetch();
  }, [refetch]);

  // Polling como fallback ante falta de websockets
  useEffect(() => {
    if (!hasToken) return;

    const poll = async () => {
      try {
        const result = await notificationService.list({ unread: true, per_page: 5 });
        const pendingCall = result.data.find(n => n.type === 'videocall_incoming');
        
        if (pendingCall && (!incomingCall || pendingCall.id !== incomingCall.id)) {
          setIncomingCall(pendingCall);
        }
      } catch (error) {
        // Silenciar errores de red en polling
      }
    };

    poll(); // Ejecutar inmediatamente al montar/token cambiado
    const pollInterval = setInterval(poll, 6000);

    return () => clearInterval(pollInterval);
  }, [hasToken, incomingCall]);

  // Suscribirse a notificaciones en tiempo real vía WebSocket (solo si hay token)
  useEffect(() => {
    if (!hasToken) {
      return;
    }
    
    const unsubscribe = subscribeToNotifications((notification) => {
      addNotification(notification);
    });

    return () => {
      unsubscribe?.();
    };
  }, [addNotification, hasToken]);

  const value: NotificationsContextType = {
    unreadCount: count,
    isLoading,
    addNotification,
    refreshCount,
    fcmToken,
    fcmPermission,
    isFCMLoading,
    incomingCall,
    setIncomingCall,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotificationsContext debe usarse dentro de NotificationsProvider');
  }
  return context;
};
