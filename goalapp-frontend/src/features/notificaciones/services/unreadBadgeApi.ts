import { useState, useEffect } from 'react';
import { loadNotifications } from './notificationsApi';
import type { Notification } from '../types';

export function useNotificationsBadge() {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const updateUnreadCount = async () => {
    setIsLoading(true);
    try {
      const notifications: Notification[] = await loadNotifications();
      const count = notifications.filter(n => !n.leido).length;
      setUnreadCount(count);
    } catch (err) {
      console.error('Error loading unread count:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updateUnreadCount();
    const interval = setInterval(updateUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const triggerUpdate = async () => {
    await updateUnreadCount();
  };

  return { unreadCount, isLoading, triggerUpdate, reload: updateUnreadCount };
}
