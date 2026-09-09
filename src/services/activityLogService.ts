import { useState, useEffect } from 'react';
import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

export interface ActivityLog {
  id: string;
  timestamp: string;
  type:
    | 'order_created'
    | 'payment_submitted'
    | 'payment_approved'
    | 'payment_rejected'
    | 'stage_advanced'
    | 'design_completed'
    | 'wedding_info_updated'
    | 'album_uploaded'
    | 'admin_setting_changed'
    | 'system';
  actorName: string;
  actorRole: 'admin' | 'customer' | 'system';
  title: string;
  description: string;
  orderId?: string;
  details?: Record<string, any>;
}

import { toIsoDateString } from '../utils/formatters';

const STORAGE_KEY = 'nha_co_tiec_activity_logs_v1';

// Initial mock activities
const DEFAULT_ACTIVITIES: ActivityLog[] = [
  {
    id: 'log-01',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    type: 'payment_approved',
    actorName: 'Admin (kieumllnn@gmail.com)',
    actorRole: 'admin',
    title: 'Xác nhận thanh toán đơn hàng',
    description: 'Admin đã duyệt chuyển khoản 79.000đ cho đơn hàng #NCT01.',
    orderId: 'NCT01',
  },
  {
    id: 'log-02',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    type: 'order_created',
    actorName: 'Nguyễn Minh Anh & Trần Đức Minh',
    actorRole: 'customer',
    title: 'Khách hàng đặt thiệp cưới mới',
    description: 'Đã hoàn tất điền form thông tin cưới và chuyển sang thanh toán QR.',
    orderId: 'NCT01',
  },
  {
    id: 'log-03',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    type: 'admin_setting_changed',
    actorName: 'Admin (kieumllnn@gmail.com)',
    actorRole: 'admin',
    title: 'Cập nhật cấu hình thanh toán',
    description: 'Thay đổi thông tin số tài khoản và mã VietQR chính thức.',
  },
];

let currentLogs: ActivityLog[] = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          ...item,
          timestamp: toIsoDateString(item?.timestamp),
        }));
      }
    }
  } catch (e) {}
  return DEFAULT_ACTIVITIES;
})();

const listeners = new Set<() => void>();

function notifyLogs() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentLogs));
  } catch (e) {}
  listeners.forEach((fn) => fn());
}

/**
 * Log a new activity to Firestore and local state
 */
export async function logActivity(
  data: Omit<ActivityLog, 'id' | 'timestamp'>
): Promise<ActivityLog> {
  const timestamp = new Date().toISOString();
  const id = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const newLog: ActivityLog = {
    ...data,
    id,
    timestamp,
  };

  currentLogs = [newLog, ...currentLogs.slice(0, 99)];
  notifyLogs();

  // Save to Firestore collection 'activity_logs'
  if (db) {
    try {
      await setDoc(doc(db, 'activity_logs', id), newLog);
    } catch (error) {
      console.warn('Failed to persist activity log to Firestore:', error);
    }
  }

  return newLog;
}

/**
 * Live hook to subscribe to activity logs (synced with Firestore in real-time)
 */
export function useActivityLogs(limitCount = 20) {
  const [logs, setLogs] = useState<ActivityLog[]>(() => currentLogs.slice(0, limitCount));

  useEffect(() => {
    // 1. Local listener
    const handleLocalUpdate = () => {
      setLogs(currentLogs.slice(0, limitCount));
    };
    listeners.add(handleLocalUpdate);

    // 2. Firestore real-time listener
    let unsubscribe: (() => void) | undefined;
    if (db) {
      try {
        const q = query(
          collection(db, 'activity_logs'),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (!snapshot.empty) {
              const remoteLogs: ActivityLog[] = [];
              snapshot.forEach((docSnap) => {
                const raw = docSnap.data() as any;
                remoteLogs.push({
                  ...raw,
                  id: docSnap.id,
                  timestamp: toIsoDateString(raw?.timestamp),
                });
              });
              currentLogs = remoteLogs;
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(currentLogs));
              } catch (e) {}
              setLogs(remoteLogs);
            }
          },
          (err) => {
            console.info('Firestore activity_logs live sync notice:', err.message);
          }
        );
      } catch (e) {}
    }

    return () => {
      listeners.delete(handleLocalUpdate);
      if (unsubscribe) unsubscribe();
    };
  }, [limitCount]);

  return logs;
}
