import { useState, useEffect } from 'react';
import {
  Order,
  OrderStatusStage,
  STAGE_TO_ORDER_STATUS,
  CustomerExport,
  WeddingInformation
} from '../types/order';
import { MOCK_ORDERS } from './mockOrders';
import { createSystemNotification } from './notificationStore';

const STORAGE_KEY = 'nha_co_tiec_orders_v5';

// In-memory cache synced with localStorage
let currentOrders: Order[] = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load orders from localStorage', e);
  }
  return MOCK_ORDERS;
})();

const listeners = new Set<() => void>();

function notify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentOrders));
  } catch (e) {
    console.error('Failed to save orders to localStorage', e);
  }
  listeners.forEach((fn) => fn());
}

export function resetOrders(): void {
  currentOrders = [...MOCK_ORDERS];
  notify();
}

export function getAllOrders(): Order[] {
  return [...currentOrders];
}

export function getOrderById(id: string): Order | undefined {
  return currentOrders.find((o) => o.id === id);
}

/**
 * Customer Action:
 * Customer clicks "Tôi đã hoàn tất chuyển khoản"
 * Must NOT change orderStatus to 'paid'!
 * Changes paymentStatus to 'pending_confirmation' and keeps orderStatus as 'pending_payment'.
 */
export function customerSubmitPaymentConfirmation(
  orderId: string,
  info?: { note?: string; proof?: string }
): Order {
  const now = new Date().toISOString();
  currentOrders = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      return {
        ...ord,
        paymentStatus: 'pending_confirmation',
        paymentSubmissionTime: now,
        paymentNote: info?.note || 'Đã quét mã QR chuyển khoản thanh toán',
        paymentProof: info?.proof || 'qr_transfer_proof.jpg',
        updatedAt: now,
        // Order remains in pending_payment stage (Chờ thanh toán)
        orderStatus: 'pending_payment',
        currentStage: 1,
      };
    }
    return ord;
  });

  notify();
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
  currentOrders = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      customerUserId = ord.userId || '01';
      return {
        ...ord,
        paymentStatus: 'paid',
        orderStatus: 'paid',
        currentStage: 2, // 2: Đã thanh toán
        paymentDate: now,
        updatedAt: now,
      };
    }
    return ord;
  });

  notify();

  // Trigger system notification to customer
  createSystemNotification(
    'payment',
    orderId,
    customerUserId,
    'Thanh toán đã được xác nhận',
    `Đơn hàng #${orderId} của bạn đã được Admin xác nhận thanh toán thành công.`,
    `/dashboard/don-hang/${orderId}`
  );

  return getOrderById(orderId)!;
}

/**
 * Admin Action:
 * Admin clicks "Yêu cầu kiểm tra lại"
 * Changes paymentStatus to 'rejected' and keeps orderStatus as 'pending_payment' (Stage 1).
 */
export function adminRejectPayment(orderId: string, reason?: string): Order {
  const now = new Date().toISOString();
  currentOrders = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      return {
        ...ord,
        paymentStatus: 'rejected',
        orderStatus: 'pending_payment',
        currentStage: 1,
        paymentNote: reason || 'Số tiền hoặc nội dung chuyển khoản chưa trùng khớp, vui lòng kiểm tra lại.',
        updatedAt: now,
      };
    }
    return ord;
  });

  notify();
  return getOrderById(orderId)!;
}

/**
 * Admin Action: Advance order stage (Stage 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8)
 */
export function adminAdvanceStage(orderId: string, nextStage: OrderStatusStage): Order {
  const now = new Date().toISOString();
  currentOrders = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      return {
        ...ord,
        currentStage: nextStage,
        orderStatus: STAGE_TO_ORDER_STATUS[nextStage],
        updatedAt: now,
      };
    }
    return ord;
  });

  notify();
  return getOrderById(orderId)!;
}

/**
 * Admin Action: Hoàn thành thiết kế
 * Sets orderStatus to 'completed', currentStage to 7, and ensures invitationUrl is set.
 */
export function adminCompleteDesign(orderId: string, customUrl?: string): Order {
  const now = new Date().toISOString();
  let customerUserId = '01';
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
      return {
        ...ord,
        currentStage: 7,
        orderStatus: 'completed',
        invitationUrl: customUrl || ord.invitationUrl || defaultUrl,
        updatedAt: now,
      };
    }
    return ord;
  });

  notify();

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
  currentOrders = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      return {
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
    }
    return ord;
  });

  notify();
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
      return {
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
    }
    return ord;
  });

  notify();
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
      return {
        ...ord,
        currentStage: 6,
        orderStatus: 'revision',
        updatedAt: now,
        revisionRequests: [newRev, ...(ord.revisionRequests || [])],
      };
    }
    return ord;
  });

  notify();
  return getOrderById(orderId)!;
}

/**
 * Customer Action: Complete Data Submission (Stage 2 -> Stage 3)
 * After filling in wedding info and/or album, customer confirms sending data to Studio.
 */
export function customerCompleteDataSubmission(orderId: string): Order {
  const now = new Date().toISOString();
  currentOrders = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      return {
        ...ord,
        currentStage: 3,
        orderStatus: 'information_received',
        updatedAt: now,
      };
    }
    return ord;
  });

  notify();

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
      return {
        ...ord,
        currentStage: 7,
        orderStatus: 'completed',
        invitationUrl: ord.invitationUrl || defaultUrl,
        updatedAt: now,
      };
    }
    return ord;
  });

  notify();

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
  const [order, setOrder] = useState<Order | undefined>(() => getOrderById(orderId) || currentOrders[0]);

  useEffect(() => {
    const handleUpdate = () => {
      setOrder(getOrderById(orderId) || currentOrders[0]);
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
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load exports from localStorage', e);
  }
  return DEFAULT_CUSTOMER_EXPORTS;
})();

const exportListeners = new Set<() => void>();

function notifyExports() {
  try {
    localStorage.setItem(EXPORTS_STORAGE_KEY, JSON.stringify(currentExports));
  } catch (e) {
    console.error('Failed to save exports to localStorage', e);
  }
  exportListeners.forEach((fn) => fn());
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
    notifyExports();
  }
  return currentExports[orderId];
}

/**
 * Admin Action: Upload Excel file
 * Transitions status to 'uploaded' ("Đã tải lên — chưa gửi khách")
 */
export function adminUploadExcel(
  orderId: string,
  fileData: { fileName: string; fileSize: string; fileUrl?: string }
): CustomerExport {
  const now = new Date().toISOString();
  const existing = getCustomerExport(orderId);

  currentExports[orderId] = {
    ...existing,
    fileName: fileData.fileName,
    fileSize: fileData.fileSize,
    fileUrl: fileData.fileUrl || '#',
    status: 'uploaded', // "Đã tải lên — chưa gửi khách"
    uploadedAt: now,
  };

  notifyExports();
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

  notifyExports();

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

