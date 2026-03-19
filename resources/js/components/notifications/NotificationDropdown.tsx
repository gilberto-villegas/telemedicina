'use client';

import { useEffect, useRef } from 'react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { NotificationSkeleton } from './NotificationSkeleton';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationDropdownProps {
  onClose: () => void;
}

export const NotificationDropdown = ({ onClose }: NotificationDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    isLoading,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useNotifications({ per_page: 10, unread: false });

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-96 rounded-lg border bg-white shadow-lg z-50 max-h-[600px] overflow-hidden flex flex-col"
      role="menu"
      aria-label="Notificaciones"
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-lg">Notificaciones</h3>
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              markAllAsRead();
            }}
            disabled={isMarkingAllAsRead}
          >
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay notificaciones
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-4 border-t text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.location.href = '/dashboard/notifications';
              onClose();
            }}
          >
            Ver todas las notificaciones
          </Button>
        </div>
      )}
    </div>
  );
};
