import { io, Socket } from 'socket.io-client';
import { authService } from '../auth';

let socket: Socket | null = null;

export const initializeNotificationSocket = (): Socket | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  const token = authService.getToken();
  if (!token) {
    return null;
  }

  const ENABLE_SOCKETS = import.meta.env.VITE_ENABLE_SOCKETS === 'true';
  if (!ENABLE_SOCKETS) {
    return null;
  }

  const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

  try {
    socket = io(WS_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 2, // Solo 2 intentos para notificaciones (opcional)
      timeout: 5000,
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Socket de notificaciones conectado');
    });

    socket.on('disconnect', (reason) => {
      // Solo loggear si no es un error de conexión esperado
      if (reason !== 'io server disconnect' && reason !== 'transport close') {
        // Silenciar desconexiones normales
      }
    });

    socket.on('connect_error', () => {
      // Silenciar errores de conexión - las notificaciones son opcionales
      // Si falla, podemos marcarlo como fallido para no reintentar infinitamente en esta sesión
      if (socket) {
        (socket as any)._connectionFailed = true;
      }
    });

    socket.on('error', (error) => {
      // Solo loggear errores críticos, no errores de conexión
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = String(error.message);
        if (!errorMessage.includes('xhr poll error') &&
          !errorMessage.includes('websocket error') &&
          !errorMessage.includes('Connection refused')) {
          console.error('Error en socket de notificaciones:', error);
        }
      }
    });

    return socket;
  } catch (error) {
    return null;
  }
};

export const subscribeToNotifications = (
  callback: (notification: any) => void
): (() => void) | null => {
  const socket = initializeNotificationSocket();

  if (!socket) {
    // Socket no disponible, retornar función vacía para evitar errores
    return () => { };
  }

  socket.on('notification:new', (notification) => {
    callback(notification);
  });

  return () => {
    socket?.off('notification:new');
  };
};

export const disconnectNotificationSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
