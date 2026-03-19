import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, Notification } from '../api/notifications';
import { useEffect } from 'react';
import { subscribeToNotifications } from '../notifications/socket';

export const useNotifications = (params?: {
  page?: number;
  per_page?: number;
  unread?: boolean;
  type?: string;
}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationService.list(params),
    staleTime: 30000, // 30 segundos
  });

  // Suscribirse a notificaciones en tiempo real
  useEffect(() => {
    const unsubscribe = subscribeToNotifications((notification) => {
      // Invalidar queries para refrescar lista
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    });

    return () => {
      unsubscribe?.();
    };
  }, [queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  return {
    notifications: query.data?.data ?? [],
    pagination: query.data
      ? {
          current_page: query.data.current_page,
          last_page: query.data.last_page,
          per_page: query.data.per_page,
          total: query.data.total,
        }
      : null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};

export const useUnreadNotificationsCount = () => {
  const queryClient = useQueryClient();
  
  // Verificar si hay token antes de hacer la petición
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('auth_token');

  const query = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 10000, // 10 segundos
    refetchInterval: 30000, // Refrescar cada 30 segundos
    enabled: hasToken, // Solo hacer la petición si hay token
  });

  // Suscribirse a notificaciones en tiempo real
  useEffect(() => {
    const unsubscribe = subscribeToNotifications(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    });

    return () => {
      unsubscribe?.();
    };
  }, [queryClient]);

  return {
    count: query.data?.count ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
