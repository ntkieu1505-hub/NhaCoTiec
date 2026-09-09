import { useState, useEffect } from 'react';
import { Notification, NotificationType } from '../types/notification';

const STORAGE_KEY = 'nha_co_tiec_notifications_v1';

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'noti-001',
    userId: '01',
    orderId: 'NCT01',
    title: 'Thanh toán đã được xác nhận',
    message: 'Đơn hàng NCT01 của bạn đã được Admin xác nhận thanh toán.',
    type: 'payment',
    createdAt: '2026-09-08T09:30:00.000Z',
    isRead: false,
    readAt: null,
    actionUrl: '/dashboard/don-hang/NCT01',
  },
  {
    id: 'noti-002',
    userId: '01',
    orderId: 'NCT01',
    title: 'Đã nhận thông tin lễ cưới',
    message: 'Nhà Có Tiệc đã nhận đầy đủ thông tin và hình ảnh của bạn.',
    type: 'order',
    createdAt: '2026-09-08T11:00:00.000Z',
    isRead: false,
    readAt: null,
    actionUrl: '/dashboard/don-hang/NCT01',
  },
  {
    id: 'noti-003',
    userId: '01',
    orderId: 'NCT01',
    title: 'Thiệp đang được thiết kế',
    message: 'Đội ngũ Nhà Có Tiệc đã bắt đầu thiết kế thiệp của bạn.',
    type: 'design',
    createdAt: '2026-09-08T12:00:00.000Z',
    isRead: true,
    readAt: '2026-09-08T14:20:00.000Z',
    actionUrl: '/dashboard#invitations',
  },
  {
    id: 'noti-004',
    userId: '01',
    orderId: 'NCT01',
    title: 'File khách mời đã sẵn sàng',
    message: 'Admin đã gửi file Excel khách mời. Bạn có thể tải xuống.',
    type: 'guest',
    createdAt: '2026-09-08T16:00:00.000Z',
    isRead: false,
    readAt: null,
    actionUrl: '/dashboard/don-hang/NCT01',
  },
  {
    id: 'noti-005',
    userId: '02',
    orderId: 'NCT02',
    title: 'Thiệp đã bàn giao',
    message: 'Thiệp của bạn đã hoàn thành và đang chờ bạn kiểm tra.',
    type: 'invitation',
    createdAt: '2026-09-07T15:00:00.000Z',
    isRead: false,
    readAt: null,
    actionUrl: '/dashboard#invitations',
  },
  {
    id: 'noti-006',
    userId: '03',
    orderId: 'NCT03',
    title: 'Có yêu cầu bổ sung thông tin',
    message: 'Vui lòng kiểm tra thông tin đơn hàng để bổ sung dữ liệu cần thiết.',
    type: 'revision',
    createdAt: '2026-09-06T09:00:00.000Z',
    isRead: true,
    readAt: '2026-09-06T10:00:00.000Z',
    actionUrl: '/dashboard/don-hang/NCT03',
  },
];

let notifications: Notification[] = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load notifications from localStorage', e);
  }
  return INITIAL_NOTIFICATIONS;
})();

const listeners = new Set<() => void>();

function notify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to save notifications to localStorage', e);
  }
  listeners.forEach((listener) => listener());
}

export function getNotifications(): Notification[] {
  return [...notifications];
}

export function getUserNotifications(userId: string): Notification[] {
  return notifications.filter((n) => n.userId === userId);
}

export function markNotificationAsRead(id: string): void {
  const now = new Date().toISOString();
  notifications = notifications.map((n) =>
    n.id === id ? { ...n, isRead: true, readAt: n.readAt || now } : n
  );
  notify();
}

export function markAllNotificationsAsRead(userId: string): void {
  const now = new Date().toISOString();
  notifications = notifications.map((n) =>
    n.userId === userId ? { ...n, isRead: true, readAt: n.readAt || now } : n
  );
  notify();
}

export function createNotification(
  data: Omit<Notification, 'id' | 'createdAt' | 'isRead'> & {
    id?: string;
    createdAt?: string;
    isRead?: boolean;
  }
): Notification {
  const newNoti: Notification = {
    id: data.id || `noti-${Date.now()}`,
    userId: data.userId,
    orderId: data.orderId,
    title: data.title,
    message: data.message,
    type: data.type,
    createdAt: data.createdAt || new Date().toISOString(),
    isRead: data.isRead ?? false,
    readAt: null,
    actionUrl: data.actionUrl,
  };
  notifications = [newNoti, ...notifications];
  notify();
  return newNoti;
}

export function deleteNotification(id: string): void {
  notifications = notifications.filter((n) => n.id !== id);
  notify();
}

/**
 * Creates a system notification triggered by order events, with de-duplication to prevent spamming.
 */
export function createSystemNotification(
  type: NotificationType,
  orderId: string,
  userId: string,
  title: string,
  message: string,
  actionUrl?: string
): Notification | null {
  // De-duplication check: if notification with same type, orderId and title already exists, skip
  const existing = notifications.find(
    (n) => n.userId === userId && n.orderId === orderId && n.type === type && n.title === title
  );
  if (existing) {
    return null;
  }

  return createNotification({
    userId,
    orderId,
    type,
    title,
    message,
    actionUrl,
    isRead: false,
  });
}

/**
 * Reactive hook for customer or admin notifications
 */
export function useNotifications(userId?: string) {
  const [data, setData] = useState<Notification[]>(() =>
    userId ? getUserNotifications(userId) : getNotifications()
  );

  useEffect(() => {
    const handler = () => {
      setData(userId ? getUserNotifications(userId) : getNotifications());
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, [userId]);

  const unreadCount = data.filter((n) => !n.isRead).length;

  return {
    notifications: data,
    unreadCount,
    markAsRead: markNotificationAsRead,
    markAllAsRead: () => {
      if (userId) {
        markAllNotificationsAsRead(userId);
      }
    },
    createNotification,
    deleteNotification,
  };
}
