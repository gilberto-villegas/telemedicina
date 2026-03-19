import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, NotificationPreferences } from '../api/notifications';

export const useNotificationPreferences = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => notificationService.getPreferences(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const updateMutation = useMutation({
    mutationFn: (preferences: Partial<NotificationPreferences>) =>
      notificationService.updatePreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    update: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};
