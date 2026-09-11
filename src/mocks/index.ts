import { Guest, Wish, User, AnalyticsSummary } from '../types';

// Zero mock data: ready for real-time guest RSVP responses
export const MOCK_GUESTS: Guest[] = [];

// Zero mock data: ready for real-time guestbook submissions
export const MOCK_WISHES: Wish[] = [];

// Zero mock data: live user directory is derived dynamically from logged-in admin + actual customer orders
export const MOCK_USERS: User[] = [];

// Baseline real-time analytics summary
export const MOCK_ANALYTICS: AnalyticsSummary = {
  totalVisitors: 0,
  totalSessions: 0,
  totalPageViews: 0,
  avgDuration: '0m 00s',
  bounceRate: '0%',
  activeInvitations: 0,
  totalRevenue: 0,
  orderCount: 0,
  vietQrSuccessRate: '100%'
};
