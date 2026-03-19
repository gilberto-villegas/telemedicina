import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { api } from '../api';

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export const initializeFirebase = (): FirebaseApp | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (app) {
    return app;
  }

  // Validar que todas las variables de entorno estén configuradas
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_SENDER_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;

  if (!apiKey || !projectId || !messagingSenderId || !appId) {
    // Firebase no está configurado, no es un error crítico
    return null;
  }

  const firebaseConfig = {
    apiKey,
    projectId,
    messagingSenderId,
    appId,
  };

  try {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    return app;
  } catch (error) {
    console.error('Error inicializando Firebase:', error);
    return null;
  }
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
};

export const getFCMToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!messaging) {
    initializeFirebase();
    if (!messaging) {
      return null;
    }
  }

  try {
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn('VAPID key no configurada');
      return null;
    }

    const token = await getToken(messaging, { vapidKey });

    if (token) {
      // Actualizar token en backend
      try {
        await api.put('/auth/me', { fcm_token: token });
      } catch (error) {
        console.error('Error actualizando FCM token en backend:', error);
      }
    }

    return token;
  } catch (error) {
    console.error('Error obteniendo FCM token:', error);
    return null;
  }
};

export const onMessageListener = (callback: (payload: any) => void): (() => void) | null => {
  if (typeof window === 'undefined' || !messaging) {
    return null;
  }

  try {
    const unsubscribe = onMessage(messaging, (payload) => {
      callback(payload);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error configurando listener de mensajes:', error);
    return null;
  }
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Service Worker registrado:', registration);
    return registration;
  } catch (error) {
    console.error('Error registrando Service Worker:', error);
    return null;
  }
};
