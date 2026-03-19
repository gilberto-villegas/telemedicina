'use client';

import { Notification } from '@/lib/api/notifications';
import { notificationService } from '@/lib/api/notifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

export const NotificationItem = ({ notification, onClose }: NotificationItemProps) => {
  const router = useNavigate();
  const queryClient = useQueryClient();

  const isUnread = !notification.read_at;
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: es,
  });

  const handleClick = async () => {
    if (isUnread) {
      try {
        await notificationService.markAsRead(notification.id);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      } catch (error) {
        console.error('Error marcando notificación como leída:', error);
      }
    }

    // Deep linking basado en el tipo de notificación
    const data = notification.data || {};
    let url = '/dashboard/notifications';

    if (data.appointment_id) {
      url = `/dashboard/patient/appointments/${data.appointment_id}`;
    } else if (data.payment_id) {
      url = '/dashboard/patient/payments';
    } else if (data.prescription_id) {
      url = `/dashboard/patient/prescriptions/${data.prescription_id}`;
    } else if (data.medical_record_id) {
      url = `/dashboard/patient/medical-records/${data.medical_record_id}`;
    } else {
      url = `/dashboard/notifications/${notification.id}`;
    }

    router.push(url);
    onClose();
  };

  return (
    <div
      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
        isUnread ? 'bg-blue-50' : ''
      }`}
      onClick={handleClick}
      role="menuitem"
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 mt-1 ${isUnread ? 'text-blue-600' : 'text-gray-400'}`}>
          <Bell className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-medium ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
              {notification.title}
            </h4>
            {isUnread && (
              <span className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
          <p className="text-xs text-gray-400 mt-2">{timeAgo}</p>
        </div>
      </div>
    </div>
  );
};
