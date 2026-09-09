export type NotificationType =
  | 'payment'
  | 'order'
  | 'design'
  | 'revision'
  | 'invitation'
  | 'guest'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  orderId?: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  readAt?: string | null;
  isRead: boolean;
  actionUrl?: string;
}
