export type RsvpStatus = 'attending' | 'declined' | 'pending';

export interface Guest {
  id: string;
  orderId: string;
  name: string;
  phone?: string;
  rsvpStatus: RsvpStatus;
  companionCount: number; // số người đi kèm
  tableNumber?: string;
  notes?: string;
  submittedAt: string;
}

export interface Wish {
  id: string;
  orderId: string;
  senderName: string;
  relationship?: string; // e.g. "Bạn chú rể"
  message: string;
  createdAt: string;
  isApproved: boolean;
  isPinned: boolean;
  adminReply?: string;
}

export interface User {
  id: string;
  fullName: string;
  phone?: string;
  email: string;
  role: 'customer' | 'admin' | 'designer';
  orderCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
}

export interface AnalyticsSummary {
  totalVisitors: number;
  totalSessions: number;
  totalPageViews: number;
  avgDuration: string;
  bounceRate: string;
  activeInvitations: number;
  totalRevenue: number;
  orderCount: number;
  vietQrSuccessRate: string;
}

export * from './auth';
