import { useState, useEffect } from 'react';
import {
  Order,
  OrderStatusStage,
  STAGE_TO_ORDER_STATUS,
  CustomerExport,
  WeddingInformation
} from '../types/order';
import { createSystemNotification } from './notificationStore';
import { db } from '../services/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { logActivity } from '../services/activityLogService';
import { toIsoDateString } from '../utils/formatters';
import { MOCK_TEMPLATES } from './mockTemplates';
import { resolveTemplateForOrder, resolveOrderThumbnail } from './templateStore';
import { trackPurchase } from '../services/analytics';

const STORAGE_KEY = 'nha_co_tiec_orders_v7_realtime';
const LAST_ORDER_KEY = 'nha_co_tiec_last_order_id';
const BROADCAST_CHANNEL_NAME = 'nha_co_tiec_orders_channel';

/**
 * Normalizes an order from any source (Firestore, localStorage, JSON)
 * ensuring all dates are ISO strings and no Timestamp objects exist.
 */
export function normalizeOrder(raw: any, idFallback = 'NCT-UNKNOWN'): Order {
  const id = String(raw?.id || idFallback);
  const stage = (typeof raw?.currentStage === 'number' && raw.currentStage >= 1 && raw.currentStage <= 8)
    ? (raw.currentStage as OrderStatusStage)
    : 1;

  let weddingInfo: WeddingInformation | undefined;
  if (raw?.weddingInfo) {
    const wi = raw.weddingInfo;
    weddingInfo = {
      ...wi,
      groomName: String(wi.groomName || ''),
      brideName: String(wi.brideName || ''),
      customerPhone: String(wi.customerPhone || raw?.customerPhone || ''),
      customerEmail: String(wi.customerEmail || raw?.customerEmail || ''),
      weddingDate: typeof wi.weddingDate === 'string' ? wi.weddingDate : toIsoDateString(wi.weddingDate, '2026-12-28'),
      weddingTime: String(wi.weddingTime || '18:00'),
      venueName: String(wi.venueName || ''),
      venueAddress: String(wi.venueAddress || ''),
      submittedAt: wi.submittedAt ? toIsoDateString(wi.submittedAt) : undefined,
    };
  }

  const defaultCustomerName = weddingInfo?.groomName && weddingInfo?.brideName
    ? `${weddingInfo.groomName} & ${weddingInfo.brideName}`
    : 'Khách hàng';

  const templateId = String(raw?.templateId || 'tpl-minh-anh');
  const matchedTpl = resolveTemplateForOrder(templateId, raw?.templateName);
  const templateThumbnail = resolveOrderThumbnail(matchedTpl, raw?.templateThumbnail);

  return {
    userId: '01',
    customerName: typeof raw?.customerName === 'string' && raw.customerName.trim()
      ? raw.customerName
      : defaultCustomerName,
    customerPhone: String(raw?.customerPhone || weddingInfo?.customerPhone || ''),
    customerEmail: String(raw?.customerEmail || weddingInfo?.customerEmail || ''),
    price: typeof raw?.price === 'number' ? raw.price : 79000,
    orderStatus: typeof raw?.orderStatus === 'string' ? raw.orderStatus : (STAGE_TO_ORDER_STATUS[stage] || 'pending_payment'),
    paymentStatus: typeof raw?.paymentStatus === 'string' ? raw.paymentStatus : 'unpaid',
    paymentMethod: typeof raw?.paymentMethod === 'string' ? raw.paymentMethod : 'vietqr',
    category: raw?.category === 'premium' ? 'premium' : 'basic',
    ...raw,
    id,
    templateId,
    templateName: typeof raw?.templateName === 'string' && raw.templateName.trim()
      ? raw.templateName
      : 'Minh Anh Editorial',
    templateThumbnail: templateThumbnail || MOCK_TEMPLATES[0].thumbnailUrl,
    currentStage: stage,
    createdAt: toIsoDateString(raw?.createdAt),
    updatedAt: toIsoDateString(raw?.updatedAt),
    paymentSubmissionTime: raw?.paymentSubmissionTime ? toIsoDateString(raw.paymentSubmissionTime) : undefined,
    paymentDate: raw?.paymentDate ? toIsoDateString(raw.paymentDate) : undefined,
    weddingInfo,
  };
}

// In-memory cache synced with localStorage
let currentOrders: Order[] = (() => {
  try {
    // Purge old mock storage key if present
    localStorage.removeItem('nha_co_tiec_orders_v6');
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((o) => normalizeOrder(o, o?.id));
      }
    }
  } catch (e) {
    console.error('Failed to load orders from localStorage', e);
  }
  // Zero mock orders: fully real-time mode
  return [];
})();

const listeners = new Set<() => void>();

// Cross-tab BroadcastChannel for 0ms instant multi-tab sync
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    broadcastChannel.onmessage = (event) => {
      if (event.data?.type === 'ORDERS_UPDATED' && Array.isArray(event.data?.orders)) {
        currentOrders = event.data.orders.map((o: any) => normalizeOrder(o, o?.id));
        listeners.forEach((fn) => fn());
      }
    };
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment', e);
}

// Window Storage Event listener for cross-tab sync
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (Array.isArray(parsed)) {
          currentOrders = parsed.map((o) => normalizeOrder(o, o?.id));
          listeners.forEach((fn) => fn());
        }
      } catch (e) {
        console.error('Failed to parse orders from storage event', e);
      }
    }
  });
}

/**
 * Recursively cleans an object for Firestore by converting undefined fields to null
 * or stripping them, as Firestore throws on undefined values.
 */
export function sanitizeForFirestore<T>(data: T): any {
  if (data === undefined) return null;
  if (data === null || typeof data !== 'object') return data;
  if (data instanceof Date) return data.toISOString();
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item));
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean;
}

export function syncOrderToFirestore(order: Order): Promise<void> {
  if (!db || !order?.id) return Promise.resolve();
  try {
    const cleanDoc = sanitizeForFirestore(order);
    return setDoc(doc(db, 'orders', order.id), cleanDoc, { merge: true }).catch((err) => {
      console.warn('Firestore setDoc failed for order ' + order.id + ':', err);
    });
  } catch (e) {
    console.warn('Failed to serialize order for Firestore:', e);
    return Promise.resolve();
  }
}

// Optional Firestore Real-time Sync (for multi-browser / incognito / cross-device)
let isFirestoreListening = false;
function initFirestoreSync() {
  if (isFirestoreListening || !db) return;
  try {
    isFirestoreListening = true;
    onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        const remoteList: Order[] = [];
        snapshot.forEach((docSnap) => {
          const raw = docSnap.data();
          remoteList.push(normalizeOrder(raw, docSnap.id));
        });

        // Merge smartly between remote Firestore and local storage:
        // Do NOT let an older Firestore snapshot overwrite newer approved/advanced local progress!
        const localMap = new Map<string, Order>(currentOrders.map((o) => [o.id, o]));
        const merged: Order[] = [];

        remoteList.forEach((remoteOrd) => {
          const localOrd = localMap.get(remoteOrd.id);
          if (!localOrd) {
            merged.push(remoteOrd);
          } else {
            const localStage = Number(localOrd.currentStage || 1);
            const remoteStage = Number(remoteOrd.currentStage || 1);
            const localIsPaid = localOrd.paymentStatus === 'paid';
            const remoteIsPaid = remoteOrd.paymentStatus === 'paid';

            const localUpdated = new Date(localOrd.updatedAt || localOrd.createdAt || 0).getTime();
            const remoteUpdated = new Date(remoteOrd.updatedAt || remoteOrd.createdAt || 0).getTime();

            if (
              (localIsPaid && !remoteIsPaid) ||
              localStage > remoteStage ||
              localUpdated > remoteUpdated + 500
            ) {
              // Local is more advanced or newer -> Keep local and re-sync to Firestore!
              merged.push(localOrd);
              syncOrderToFirestore(localOrd);
            } else {
              merged.push(remoteOrd);
            }
          }
          localMap.delete(remoteOrd.id);
        });

        // Retain any locally created orders not yet on Firestore and sync them up
        localMap.forEach((localOrd) => {
          merged.push(localOrd);
          syncOrderToFirestore(localOrd);
        });

        currentOrders = merged;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(currentOrders));
        } catch (e) {}
        listeners.forEach((fn) => fn());
      },
      (err) => {
        // Quietly fallback to localStorage if Firestore rules or offline
        console.info('Firestore live sync fallback to local storage:', err.message);
      }
    );
  } catch (e) {
    console.warn('Firestore sync setup error:', e);
  }
}

// Start Firestore sync
initFirestoreSync();

function notify(updatedOrder?: Order) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentOrders));
  } catch (e) {
    console.error('Failed to save orders to localStorage', e);
  }

  // Broadcast to other tabs in the same browser
  try {
    broadcastChannel?.postMessage({
      type: 'ORDERS_UPDATED',
      orders: currentOrders,
    });
  } catch (e) {}

  // Sync to Firestore for multi-browser / incognito / mobile
  if (updatedOrder) {
    syncOrderToFirestore(updatedOrder);
  } else {
    currentOrders.forEach((ord) => syncOrderToFirestore(ord));
  }

  listeners.forEach((fn) => fn());
}

export function deleteOrder(id: string): void {
  currentOrders = currentOrders.filter((o) => o.id !== id);
  notify();
  if (db) {
    try {
      deleteDoc(doc(db, 'orders', id)).catch(() => {});
    } catch (e) {}
  }
}

export function clearAllOrders(): void {
  const oldIds = currentOrders.map((o) => o.id);
  currentOrders = [];
  notify();
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('nha_co_tiec_orders_v6');
  } catch {}
  if (db) {
    oldIds.forEach((id) => {
      try {
        deleteDoc(doc(db, 'orders', id)).catch(() => {});
      } catch (e) {}
    });
  }
}

export function resetOrders(): void {
  clearAllOrders();
}

export function getAllOrders(): Order[] {
  return [...currentOrders];
}

export function getOrderById(id: string): Order | undefined {
  return currentOrders.find((o) => o.id === id);
}

export function getLastCustomerOrderId(): string | null {
  try {
    return localStorage.getItem(LAST_ORDER_KEY);
  } catch {
    return null;
  }
}

export function setLastCustomerOrderId(orderId: string): void {
  try {
    localStorage.setItem(LAST_ORDER_KEY, orderId);
  } catch {}
}

export interface CreateOrderParams {
  userId?: string;
  templateId: string;
  templateName: string;
  templateThumbnail?: string;
  category: 'basic' | 'premium';
  price: number;
  weddingInfo?: WeddingInformation;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

/**
 * Creates a brand new order with real-time operational status
 */
export function createOrder(params: CreateOrderParams): Order {
  const now = new Date().toISOString();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const orderId = `NCT${randomNum}`;

  const customerName = params.customerName || (params.weddingInfo ? `${params.weddingInfo.groomName} & ${params.weddingInfo.brideName}` : 'Khách hàng');
  const customerPhone = params.customerPhone || params.weddingInfo?.customerPhone || '';
  const customerEmail = params.customerEmail || params.weddingInfo?.customerEmail || '';

  const matchedTpl = resolveTemplateForOrder(params.templateId, params.templateName);
  const templateThumbnail = resolveOrderThumbnail(matchedTpl, params.templateThumbnail);

  const newOrder: Order = {
    id: orderId,
    userId: params.userId || `guest-${Date.now()}`,
    customerName,
    customerPhone,
    customerEmail,
    templateId: params.templateId,
    templateName: params.templateName,
    templateThumbnail,
    category: params.category,
    price: params.price,
    paymentStatus: 'unpaid',
    orderStatus: 'pending_payment',
    paymentMethod: 'vietqr',
    currentStage: 1, // Stage 1: Chờ thanh toán
    createdAt: now,
    updatedAt: now,
    weddingInfo: params.weddingInfo ? {
      ...params.weddingInfo,
      submittedAt: now,
    } : undefined,
    weddingInfoSubmitted: Boolean(params.weddingInfo),
    albumSubmitted: false,
    revisionRequests: [],
    slaRemainingHours: 24,
  };

  currentOrders = [newOrder, ...currentOrders];
  setLastCustomerOrderId(orderId);
  notify(newOrder);

  // Trigger system notification to admin
  createSystemNotification(
    'order',
    orderId,
    'admin',
    'Đơn hàng mới được khởi tạo',
    `Đơn hàng #${orderId} (${customerName}) vừa điền thông tin cưới và chuyển sang thanh toán QR.`,
    `/admin/don-hang/${orderId}`
  );

  // Log activity to Firestore
  logActivity({
    type: 'order_created',
    actorName: customerName,
    actorRole: 'customer',
    title: 'Khách hàng đặt thiệp cưới mới',
    description: `Đơn hàng #${orderId} (${params.templateName}) đã hoàn tất thông tin cưới và chuyển sang thanh toán QR.`,
    orderId,
  });

  return newOrder;
}

/**
 * Customer Action:
 * Customer clicks "Tôi đã hoàn tất chuyển khoản"
 * Changes paymentStatus to 'pending_confirmation' and keeps orderStatus as 'pending_payment'.
 */
export function customerSubmitPaymentConfirmation(
  orderId: string,
  info?: { note?: string; proof?: string }
): Order {
  const now = new Date().toISOString();
  let targetOrder: Order | undefined;

  currentOrders = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      targetOrder = {
        ...ord,
        paymentStatus: 'pending_confirmation',
        paymentSubmissionTime: now,
        paymentNote: info?.note || 'Đã quét mã QR chuyển khoản thanh toán',
        paymentProof: info?.proof || 'qr_transfer_proof.jpg',
        updatedAt: now,
        orderStatus: 'pending_payment',
        currentStage: 1,
      };
      return targetOrder;
    }
    return ord;
  });

  notify(targetOrder);

  // Log activity
  logActivity({
    type: 'payment_submitted',
    actorName: targetOrder?.customerName || 'Khách hàng',
    actorRole: 'customer',
    title: 'Khách hàng gửi xác nhận chuyển khoản',
    description: `Đơn hàng #${orderId} đã quét mã QR chuyển khoản và gửi yêu cầu đối soát thanh toán.`,
    orderId,
  });

  return getOrderById(orderId)!;
}

/**
 * Admin Action:
 * Admin clicks "Xác nhận thanh toán"
 * Changes paymentStatus to 'paid' AND orderStatus to 'paid' (Stage 2).
 */
export function adminConfirmPayment(orderId: string): Order {
  const now = new Date().toISOString();
  let customerUserId = '01';
  let targetOrder: Order | undefined;

  currentOrders = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      customerUserId = ord.userId || '01';
      targetOrder = {
        ...ord,
        paymentStatus: 'paid',
        orderStatus: 'paid',
        currentStage: 2, // 2: Đã thanh toán
        paymentDate: now,
        updatedAt: now,
      };
      return targetOrder;
    }
    return ord;
  });

  notify(targetOrder);

  // Track GA4 Ecommerce Purchase Event
  if (targetOrder) {
    trackPurchase({
      id: targetOrder.id,
      price: targetOrder.price || 79000,
      templateName: targetOrder.templateName,
      templateId: targetOrder.templateId,
      customerName: targetOrder.customerName,
    });
  }

  // Trigger system notification to customer
  createSystemNotification(
    'payment',
    orderId,
    customerUserId,
    'Thanh toán đã được xác nhận thành công 🎉',
    `Đơn hàng #${orderId} của bạn đã được Admin xác nhận thanh toán thành công. Đội ngũ Nhà Có Tiệc đã bắt đầu xử lý và thiết kế thiệp cưới cho bạn!`,
    `/dashboard/don-hang/${orderId}`
  );

  // Log activity to Firestore
  logActivity({
    type: 'payment_approved',
    actorName: 'Admin (Nhà Có Tiệc)',
    actorRole: 'admin',
    title: 'Xác nhận thanh toán thành công',
    description: `Admin đã duyệt chuyển khoản thành công cho đơn hàng #${orderId}. Chuyển sang giai đoạn Đã thanh toán.`,
    orderId,
  });

  return getOrderById(orderId)!;
}

/**
 * Admin Action:
 * Admin clicks "Yêu cầu kiểm tra lại"
 * Changes paymentStatus to 'rejected' and keeps orderStatus as 'pending_payment' (Stage 1).
 */
export function adminRejectPayment(orderId: string, reason?: string): Order {
  const now = new Date().toISOString();
  let targetOrder: Order | undefined;

  currentOrders = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      targetOrder = {
        ...ord,
        paymentStatus: 'rejected',
        orderStatus: 'pending_payment',
        currentStage: 1,
        paymentNote: reason || 'Số tiền hoặc nội dung chuyển khoản chưa trùng khớp, vui lòng kiểm tra lại.',
        updatedAt: now,
      };
      return targetOrder;
    }
    return ord;
  });

  notify(targetOrder);

  // Log activity
  logActivity({
    type: 'payment_rejected',
    actorName: 'Admin (Nhà Có Tiệc)',
    actorRole: 'admin',
    title: 'Yêu cầu kiểm tra lại thanh toán',
    description: `Đơn #${orderId} bị từ chối duyệt: ${reason || 'Chưa nhận được chuyển khoản tương ứng'}.`,
    orderId,
  });

  return getOrderById(orderId)!;
}

/**
 * Admin Action: Advance order stage (Stage 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8)
 */
export function adminAdvanceStage(orderId: string, nextStage: OrderStatusStage): Order {
  const now = new Date().toISOString();
  let targetOrder: Order | undefined;
  currentOrders = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      targetOrder = {
        ...ord,
        currentStage: nextStage,
        orderStatus: STAGE_TO_ORDER_STATUS[nextStage],
        paymentStatus: nextStage >= 2 ? 'paid' : ord.paymentStatus,
        paymentDate: nextStage >= 2 && !ord.paymentDate ? now : ord.paymentDate,
        updatedAt: now,
      };
      return targetOrder;
    }
    return ord;
  });

  notify(targetOrder);

  // Log activity
  logActivity({
    type: 'stage_advanced',
    actorName: 'Admin (Nhà Có Tiệc)',
    actorRole: 'admin',
    title: 'Chuyển bước tiến trình đơn hàng',
    description: `Đơn #${orderId} được Admin chuyển sang Giai đoạn ${nextStage} (${STAGE_TO_ORDER_STATUS[nextStage]}).`,
    orderId,
  });

  return getOrderById(orderId)!;
}

/**
 * Admin Action: Hoàn thành thiết kế
 * Sets orderStatus to 'completed', currentStage to 7, and ensures invitationUrl is set.
 */
export function adminCompleteDesign(orderId: string, customUrl?: string): Order {
  const now = new Date().toISOString();
  let customerUserId = '01';
  let targetOrder: Order | undefined;
  currentOrders = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      customerUserId = ord.userId || '01';
      const brideGroomSlug = ord.weddingInfo
        ? `${ord.weddingInfo.groomName}-${ord.weddingInfo.brideName}`
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
        : 'minhanh-ducminh';
      const defaultUrl = `https://nhacotiec.vn/invitation/${brideGroomSlug || 'khach-hang'}`;
      targetOrder = {
        ...ord,
        paymentStatus: 'paid',
        paymentDate: ord.paymentDate || now,
        currentStage: 7,
        orderStatus: 'completed',
        invitationUrl: customUrl || ord.invitationUrl || defaultUrl,
        updatedAt: now,
      };
      return targetOrder;
    }
    return ord;
  });

  notify(targetOrder);

  // Trigger system notification to customer
  createSystemNotification(
    'invitation',
    orderId,
    customerUserId,
    'Thiệp cưới đã hoàn thiện',
    `Thiệp cưới của bạn đã được thiết kế hoàn thiện. Hãy mở xem thiệp của bạn ngay!`,
    `/dashboard`
  );

  return getOrderById(orderId)!;
}

/**
 * Customer Action: Submit wedding information form
 * Saves customer-entered wedding details and marks weddingInfoSubmitted: true.
 * IMPORTANT: Does NOT automatically change orderStatus from Customer UI!
 */
export function customerSubmitWeddingInfo(
  orderId: string,
  data?: Partial<WeddingInformation>
): Order {
  const now = new Date().toISOString();
  let targetOrder: Order | undefined;
  currentOrders = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      targetOrder = {
        ...ord,
        weddingInfo: {
          ...(ord.weddingInfo || {
            groomName: 'Trần Đức Minh',
            brideName: 'Nguyễn Minh Anh',
            weddingDate: '2026-12-28',
            weddingTime: '18:00',
            venueName: 'Trung tâm Hội nghị Tiệc cưới GEM Center',
            venueAddress: 'Số 8 Nguyễn Bỉnh Khiêm, P. Đa Kao, Quận 1, TP. Hồ Chí Minh',
          }),
          ...data,
          submittedAt: now,
        },
        weddingInfoSubmitted: true,
        updatedAt: now,
      };
      return targetOrder;
    }
    return ord;
  });

  notify(targetOrder);
  return getOrderById(orderId)!;
}

/**
 * Customer Action: Submit photo album
 * Saves uploaded album images and marks albumSubmitted: true.
 * IMPORTANT: Does NOT automatically change orderStatus from Customer UI!
 */
export function customerSubmitAlbum(
  orderId: string,
  photos: string[]
): Order {
  const now = new Date().toISOString();
  let targetOrder: Order | undefined;
  currentOrders = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      const existingInfo = ord.weddingInfo || {
        groomName: 'Trần Đức Minh',
        brideName: 'Nguyễn Minh Anh',
        weddingDate: '2026-12-28',
        weddingTime: '18:00',
        venueName: 'Trung tâm Hội nghị Tiệc cưới GEM Center',
        venueAddress: 'Số 8 Nguyễn Bỉnh Khiêm, P. Đa Kao, Quận 1, TP. Hồ Chí Minh',
      };
      targetOrder = {
        ...ord,
        weddingInfo: {
          ...existingInfo,
          albumPhotos: photos,
          albumPhotoCount: photos.length,
          submittedAt: existingInfo.submittedAt || now,
        },
        albumSubmitted: true,
        updatedAt: now,
      };
      return targetOrder;
    }
    return ord;
  });

  notify(targetOrder);
  return getOrderById(orderId)!;
}

/**
 * Customer Action: Submit revision request (Stage 5 -> Stage 6)
 */
export function customerSubmitRevision(
  orderId: string,
  data: { topics: string[]; content: string; referenceUrl?: string }
): Order {
  const now = new Date().toISOString();
  let targetOrder: Order | undefined;
  currentOrders = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      const newRev = {
        id: `rev-${Date.now()}`,
        orderId,
        topics: data.topics,
        content: data.content,
        referenceUrl: data.referenceUrl || 'anh-tham-khao.jpg',
        createdAt: now,
        status: 'pending' as const,
      };
      targetOrder = {
        ...ord,
        currentStage: 6,
        orderStatus: 'revision',
        updatedAt: now,
        revisionRequests: [newRev, ...(ord.revisionRequests || [])],
      };
      return targetOrder;
    }
    return ord;
  });

  notify(targetOrder);
  return getOrderById(orderId)!;
}

/**
 * Customer Action: Complete Data Submission (Stage 2 -> Stage 3)
 * After filling in wedding info and/or album, customer confirms sending data to Studio.
 */
export function customerCompleteDataSubmission(orderId: string): Order {
  const now = new Date().toISOString();
  let targetOrder: Order | undefined;
  currentOrders = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      targetOrder = {
        ...ord,
        currentStage: 3,
        orderStatus: 'information_received',
        updatedAt: now,
      };
      return targetOrder;
    }
    return ord;
  });

  notify(targetOrder);

  createSystemNotification(
    'order',
    orderId,
    'admin',
    'Khách hàng đã gửi thông tin thiệp cưới',
    `Đơn hàng #${orderId} đã được khách hàng điền xong thông tin và album ảnh, sẵn sàng thiết kế.`,
    `/admin/don-hang/${orderId}`
  );

  return getOrderById(orderId)!;
}

/**
 * Customer Action: Approve Design (Stage 5 -> Stage 7)
 * Customer approves draft design and publishes official wedding invitation.
 */
export function customerApproveDesign(orderId: string): Order {
  const now = new Date().toISOString();
  let targetOrder: Order | undefined;
  currentOrders = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      const brideGroomSlug = ord.weddingInfo
        ? `${ord.weddingInfo.groomName}-${ord.weddingInfo.brideName}`
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
        : 'minhanh-ducminh';
      const defaultUrl = `https://nhacotiec.vn/invitation/${brideGroomSlug || 'khach-hang'}`;
      targetOrder = {
        ...ord,
        currentStage: 7,
        orderStatus: 'completed',
        invitationUrl: ord.invitationUrl || defaultUrl,
        updatedAt: now,
      };
      return targetOrder;
    }
    return ord;
  });

  notify(targetOrder);

  createSystemNotification(
    'invitation',
    orderId,
    'admin',
    'Khách hàng đã duyệt thiệp cưới',
    `Khách hàng đơn #${orderId} đã chính thức duyệt bản thiết kế thiệp cưới!`,
    `/admin/don-hang/${orderId}`
  );

  return getOrderById(orderId)!;
}


/**
 * Custom React Hook for live reactivity
 */
export function useOrder(orderId: string) {
  const [order, setOrder] = useState<Order | undefined>(() => getOrderById(orderId));

  useEffect(() => {
    setOrder(getOrderById(orderId));
    const handleUpdate = () => {
      setOrder(getOrderById(orderId));
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, [orderId]);

  return order;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(getAllOrders);

  useEffect(() => {
    const handleUpdate = () => {
      setOrders(getAllOrders());
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return orders;
}

// ============================================================================
// CUSTOMER EXPORTS (Excel Khách mời & Lời chúc - customerExports collection)
// ============================================================================

const EXPORTS_STORAGE_KEY = 'nha_co_tiec_exports_v1';

const DEFAULT_CUSTOMER_EXPORTS: Record<string, CustomerExport> = {
  NCT01: {
    id: 'exp-NCT01',
    orderId: 'NCT01',
    invitationId: 'tpl-minh-anh',
    userId: 'usr-01',
    fileName: 'Danh_Sach_Khach_Moi_Loi_Chuc_NCT01.xlsx',
    fileUrl: '#',
    fileSize: '248 KB',
    status: 'draft', // Initial state: "Chưa có file" / "Đang chờ dữ liệu"
    deadline: '25/12/2026 (3 ngày trước ngày cưới)',
    guestCount: 24,
    wishCount: 8,
    message: 'Nhà Có Tiệc sẽ gửi file dữ liệu khách mời sau khi hoàn tất tổng hợp.'
  },
  NCT02: {
    id: 'exp-NCT02',
    orderId: 'NCT02',
    invitationId: 'tpl-thanh-xuan',
    userId: 'usr-03',
    fileName: 'Danh_Sach_Khach_Moi_NCT02.xlsx',
    fileUrl: '#',
    fileSize: '180 KB',
    status: 'draft',
    deadline: '15/11/2026 (3 ngày trước ngày cưới)',
    guestCount: 15,
    wishCount: 4,
    message: 'Nhà Có Tiệc sẽ gửi file dữ liệu khách mời sau khi hoàn tất tổng hợp.'
  },
  NCT03: {
    id: 'exp-NCT03',
    orderId: 'NCT03',
    invitationId: 'tpl-ngoc-lan',
    userId: 'usr-04',
    fileName: 'Danh_Sach_Khach_Moi_NCT03.xlsx',
    fileUrl: '#',
    fileSize: '195 KB',
    status: 'draft',
    deadline: '20/12/2026 (3 ngày trước ngày cưới)',
    guestCount: 18,
    wishCount: 6,
    message: 'Nhà Có Tiệc sẽ gửi file dữ liệu khách mời sau khi hoàn tất tổng hợp.'
  },
  NCT04: {
    id: 'exp-NCT04',
    orderId: 'NCT04',
    invitationId: 'tpl-moc-tra',
    userId: 'usr-05',
    fileName: 'Danh_Sach_Khach_Moi_Loi_Chuc_NCT04.xlsx',
    fileUrl: '#',
    fileSize: '310 KB',
    status: 'sent', // Đơn đã hoàn tất -> Đã gửi khách
    deadline: '02/09/2026',
    uploadedAt: '2026-09-02T10:00:00Z',
    sentAt: '2026-09-02T14:30:00Z',
    guestCount: 50,
    wishCount: 22,
    message: 'File danh sách khách mời và lời chúc mừng hạnh phúc.'
  },
};

let currentExports: Record<string, CustomerExport> = (() => {
  try {
    const saved = localStorage.getItem(EXPORTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const normalized: Record<string, CustomerExport> = {};
      Object.keys(parsed).forEach((k) => {
        const exp = parsed[k];
        normalized[k] = {
          ...exp,
          uploadedAt: exp?.uploadedAt ? toIsoDateString(exp.uploadedAt) : undefined,
          sentAt: exp?.sentAt ? toIsoDateString(exp.sentAt) : undefined,
        };
      });
      return normalized;
    }
  } catch (e) {
    console.error('Failed to load exports from localStorage', e);
  }
  return DEFAULT_CUSTOMER_EXPORTS;
})();

const exportListeners = new Set<() => void>();

// Firestore Real-time Sync for Customer Exports
let isFirestoreExportsListening = false;
function initFirestoreExportsSync() {
  if (isFirestoreExportsListening || !db) return;
  try {
    isFirestoreExportsListening = true;
    onSnapshot(
      collection(db, 'customerExports'),
      (snapshot) => {
        if (!snapshot.empty) {
          snapshot.forEach((docSnap) => {
            const raw = docSnap.data() as any;
            currentExports[docSnap.id] = {
              ...raw,
              id: docSnap.id,
              uploadedAt: raw?.uploadedAt ? toIsoDateString(raw.uploadedAt) : undefined,
              sentAt: raw?.sentAt ? toIsoDateString(raw.sentAt) : undefined,
            };
          });
          try {
            localStorage.setItem(EXPORTS_STORAGE_KEY, JSON.stringify(currentExports));
          } catch (e) {}
          exportListeners.forEach((fn) => fn());
        }
      },
      (err) => {
        console.info('Firestore customer exports live sync fallback:', err.message);
      }
    );
  } catch (e) {
    console.warn('Firestore customer exports sync setup error:', e);
  }
}

initFirestoreExportsSync();

function notifyExports(updatedOrderId?: string) {
  try {
    localStorage.setItem(EXPORTS_STORAGE_KEY, JSON.stringify(currentExports));
  } catch (e) {
    console.error('Failed to save exports to localStorage', e);
  }

  // Sync to Firestore safely
  if (updatedOrderId && db && currentExports[updatedOrderId]) {
    try {
      const sanitized = JSON.parse(JSON.stringify(currentExports[updatedOrderId]));
      setDoc(doc(db, 'customerExports', updatedOrderId), sanitized, { merge: true }).catch((err) => {
        console.warn('Failed to sync customer export to Firestore:', err);
      });
    } catch (e) {
      console.warn('Failed to prepare customer export for Firestore:', e);
    }
  }

  exportListeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error('Export listener error:', e);
    }
  });
}

export function getCustomerExport(orderId: string): CustomerExport {
  if (!currentExports[orderId]) {
    currentExports[orderId] = {
      id: `exp-${orderId}`,
      orderId,
      fileName: `Danh_Sach_Khach_Moi_Loi_Chuc_${orderId}.xlsx`,
      fileUrl: '#',
      fileSize: '240 KB',
      status: 'draft',
      deadline: '3 ngày trước ngày cưới',
      guestCount: 20,
      wishCount: 5,
      message: 'Nhà Có Tiệc sẽ gửi file dữ liệu khách mời sau khi hoàn tất tổng hợp.'
    };
    notifyExports(orderId);
  }
  return currentExports[orderId];
}

/**
 * Admin Action: Upload Excel file
 * Transitions status to 'uploaded' ("Đã tải lên — chưa gửi khách")
 */
export function adminUploadExcel(
  orderId: string,
  fileData: { fileName: string; fileSize: string; fileUrl?: string; fileDataUrl?: string }
): CustomerExport {
  const now = new Date().toISOString();
  const existing = getCustomerExport(orderId);

  currentExports[orderId] = {
    ...existing,
    fileName: fileData.fileName,
    fileSize: fileData.fileSize,
    fileUrl: fileData.fileUrl || fileData.fileDataUrl || '#',
    fileDataUrl: fileData.fileDataUrl || existing.fileDataUrl,
    status: 'uploaded', // "Đã tải lên — chưa gửi khách"
    uploadedAt: now,
  };

  notifyExports(orderId);

  try {
    logActivity({
      type: 'admin_setting_changed',
      actorName: 'Admin',
      actorRole: 'admin',
      title: 'Tải lên file Excel khách mời',
      description: `Admin đã tải lên file "${fileData.fileName}" (${fileData.fileSize}) cho đơn hàng #${orderId}`,
      orderId,
    }).catch(() => {});
  } catch (e) {}

  return currentExports[orderId];
}

/**
 * Admin Action: Explicitly Send Excel to Customer
 * Transitions status to 'sent' ("Đã gửi khách hàng")
 * Customer can now see and download the file.
 */
export function adminSendExcelToCustomer(orderId: string): CustomerExport {
  const now = new Date().toISOString();
  const existing = getCustomerExport(orderId);

  currentExports[orderId] = {
    ...existing,
    status: 'sent', // "Đã gửi khách hàng"
    sentAt: now,
  };

  notifyExports(orderId);

  const ord = getOrderById(orderId);
  const targetUserId = ord?.userId || existing.userId || '01';
  createSystemNotification(
    'guest',
    orderId,
    targetUserId,
    'File khách mời & lời chúc đã sẵn sàng',
    `Admin đã gửi file Excel danh sách khách mời và lời chúc cho đơn hàng #${orderId}. Bạn có thể tải xuống trên Cổng Khách Hàng.`,
    `/dashboard/don-hang/${orderId}`
  );

  logActivity({
    type: 'admin_setting_changed',
    actorName: 'Admin',
    actorRole: 'admin',
    title: 'Bàn giao file Excel cho khách',
    description: `Admin đã chính thức bàn giao file Excel khách mời cho đơn hàng #${orderId}`,
    orderId,
  }).catch(() => {});

  return currentExports[orderId];
}

/**
 * Custom React Hook: Listens for CustomerExport updates
 */
export function useCustomerExport(orderId: string): CustomerExport {
  const [exp, setExp] = useState<CustomerExport>(() => getCustomerExport(orderId));

  useEffect(() => {
    const handleUpdate = () => {
      setExp(getCustomerExport(orderId));
    };
    exportListeners.add(handleUpdate);
    return () => {
      exportListeners.delete(handleUpdate);
    };
  }, [orderId]);

  return exp;
}

export function getAllCustomerExports(): Record<string, CustomerExport> {
  return { ...currentExports };
}

export function useAllCustomerExports(): Record<string, CustomerExport> {
  const [exportsMap, setExportsMap] = useState<Record<string, CustomerExport>>(() => ({ ...currentExports }));

  useEffect(() => {
    const handleUpdate = () => {
      setExportsMap({ ...currentExports });
    };
    exportListeners.add(handleUpdate);
    return () => {
      exportListeners.delete(handleUpdate);
    };
  }, []);

  return exportsMap;
}

