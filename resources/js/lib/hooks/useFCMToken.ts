import { useState, useEffect } from 'react';
import {
  initializeFirebase,
  requestNotificationPermission,
  getFCMToken,
  registerServiceWorker,
  onMessageListener,
} from '../notifications/fcm';

export const useFCMToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const setupFCM = async () => {
      try {
        setIsLoading(true);

        // Inicializar Firebase (puede ser null si no está configurado)
        const app = initializeFirebase();
        if (!app) {
          // Firebase no está configurado, no es un error crítico
          setIsLoading(false);
          return;
        }

        // Registrar Service Worker
        await registerServiceWorker();

        // Solicitar permiso
        const permissionStatus = await requestNotificationPermission();
        setPermission(permissionStatus);

        if (permissionStatus === 'granted') {
          // Obtener token
          const fcmToken = await getFCMToken();
          setToken(fcmToken);
        }
      } catch (err) {
        // Solo registrar error si es crítico, no si Firebase simplemente no está configurado
        if (err instanceof Error && !err.message.includes('Firebase no se pudo inicializar')) {
          setError(err);
          console.error('Error configurando FCM:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    setupFCM();
  }, []);

  // Escuchar mensajes en foreground
  useEffect(() => {
    if (permission === 'granted') {
      const unsubscribe = onMessageListener((payload) => {
        console.log('Mensaje recibido en foreground:', payload);
        // Aquí se puede mostrar una notificación o actualizar el estado
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(payload.notification?.title || 'Nueva notificación', {
            body: payload.notification?.body,
            icon: '/icon-192x192.png',
            tag: payload.data?.notification_id,
            data: payload.data,
          });
        }
      });

      return () => {
        unsubscribe?.();
      };
    }
  }, [permission]);

  return {
    token,
    permission,
    isLoading,
    error,
  };
};
