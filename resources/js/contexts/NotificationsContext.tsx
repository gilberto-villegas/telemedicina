'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUnreadNotificationsCount } from '../lib/hooks/useNotifications';
import { useFCMToken } from '../lib/hooks/useFCMToken';
import { subscribeToNotifications } from '../lib/notifications/socket';
import { Notification } from '../lib/api/notifications';

interface NotificationsContextType {
  unreadCount: number;
  isLoading: boolean;
  addNotification: (notification: Notification) => void;
  refreshCount: () => void;
  fcmToken: string | null;
  fcmPermission: NotificationPermission;
  isFCMLoading: boolean;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Solo cargar notificaciones si hay token
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('auth_token');
  const { count, isLoading, refetch } = useUnreadNotificationsCount();
  const { token: fcmToken, permission: fcmPermission, isLoading: isFCMLoading } = useFCMToken();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    // Refrescar contador
    refetch();
  }, [refetch]);

  const refreshCount = useCallback(() => {
    refetch();
  }, [refetch]);

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
