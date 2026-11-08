export type PaymentStatus =
  | 'unpaid'               // Chưa thanh toán
  | 'pending_confirmation' // Đang chờ xác nhận thanh toán
  | 'paid'                 // Đã thanh toán
  | 'rejected';            // Yêu cầu kiểm tra lại / Bị từ chối

export type OrderStatus =
  | 'pending_payment'      // Chờ thanh toán (Stage 1)
  | 'paid'                 // Đã thanh toán (Stage 2)
  | 'information_received' // Đã nhận thông tin (Stage 3)
  | 'designing'            // Đang thiết kế (Stage 4)
  | 'design_delivered'     // Bàn giao thiết kế (Stage 5)
  | 'revision'             // Chỉnh sửa thiết kế (Stage 6)
  | 'completed'            // Hoàn tất (Stage 7)
  | 'expired';             // Đã hết hạn (Stage 8)

export type OrderStatusStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type OrderStatusCode =
  | 'cho_thanh_toan'    // 1. Chờ thanh toán
  | 'da_thanh_toan'     // 2. Đã thanh toán
  | 'da_nhan_thong_tin' // 3. Đã nhận thông tin
  | 'dang_thiet_ke'     // 4. Đang thiết kế
  | 'ban_giao_thiet_ke' // 5. Bàn giao thiết kế
  | 'chinh_sua'         // 6. Chỉnh sửa thiết kế
  | 'hoan_tat'          // 7. Hoàn tất
  | 'da_het_han';       // 8. Đã hết hạn

export const ORDER_STATUS_MAP: Record<OrderStatus, OrderStatusStage> = {
  pending_payment: 1,
  paid: 2,
  information_received: 3,
  designing: 4,
  design_delivered: 5,
  revision: 6,
  completed: 7,
  expired: 8,
};

export const STAGE_TO_ORDER_STATUS: Record<OrderStatusStage, OrderStatus> = {
  1: 'pending_payment',
  2: 'paid',
  3: 'information_received',
  4: 'designing',
  5: 'design_delivered',
  6: 'revision',
  7: 'completed',
  8: 'expired',
};

export interface OrderStageMetadata {
  stage: OrderStatusStage;
  code: OrderStatusCode;
  orderStatus: OrderStatus;
  name: string;
  title: string;
  message: string;
  icon: string;
  tag: string;
  description: string;
}

export interface RevisionRequest {
  id: string;
  orderId: string;
  topics: string[];
  content: string;
  referenceUrl?: string;
  referenceImage?: string;
  createdAt: string;
  status: 'pending' | 'in_progress' | 'resolved';
  resolvedAt?: string;
}

export interface WeddingInformation {
  groomName: string;
  brideName: string;
  customerEmail?: string;
  customerPhone?: string;
  groomParents?: string;
  brideParents?: string;
  weddingDate: string;
  weddingTime: string;
  venueName: string;
  venueAddress: string;
  googleMapUrl?: string;
  invitationMessage?: string; // Lời mời
  loveStory?: string;         // Câu chuyện tình yêu
  familyInfo?: string;        // Thông tin hai họ
  timeline?: string;          // Lộ trình lễ cưới
  designerNotes?: string;     // Ghi chú cho Designer
  videoUrl?: string;          // Video URL
  videoNotes?: string;        // Ghi chú về video
  albumPhotos?: string[];     // Danh sách ảnh album
  albumPhotoCount?: number;   // Số lượng ảnh đã tải
  albumPhotoNotes?: { id?: string; url: string; note: string; name?: string; size?: string }[];
  rsvpDeadline?: string;      // Hạn chót nhận phản hồi RSVP
  bankAccountGroom?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  bankAccountBride?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  musicTitle?: string;
  albumDriveUrl?: string;
  submittedAt?: string;
}

export type CustomerExportStatus = 'draft' | 'uploaded' | 'sent';

export interface CustomerExport {
  id: string; // e.g. "exp-NCT01"
  orderId: string; // "NCT01"
  invitationId?: string; // "tpl-minh-anh"
  userId?: string; // "usr-01"
  fileName?: string; // e.g. "Danh_Sach_Khach_Moi_Loi_Chuc_NCT01.xlsx"
  fileUrl?: string; // File URL / Mock Download
  fileDataUrl?: string; // Real Data URL / base64 of uploaded file
  fileSize?: string; // e.g. "248 KB"
  status: CustomerExportStatus; // 'draft' | 'uploaded' | 'sent'
  deadline: string; // e.g. "25/12/2026 (3 ngày trước ngày cưới)"
  uploadedAt?: string;
  sentAt?: string;
  guestCount?: number;
  wishCount?: number;
  message?: string;
}

export interface Order {
  id: string; // e.g. NCT01
  userId?: string; // e.g. '01' | 'usr-01'
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  templateId: string;
  templateName: string;
  templateThumbnail?: string;
  category: 'basic' | 'premium';
  price: number; // 59000 or 79000
  paymentStatus: PaymentStatus; // 'unpaid' | 'pending_confirmation' | 'paid' | 'rejected'
  orderStatus: OrderStatus;     // 'pending_payment' | 'paid' | ...
  paymentMethod: 'vietqr' | 'manual';
  paymentDate?: string;
  paymentSubmissionTime?: string;
  paymentProof?: string;
  paymentNote?: string;
  currentStage: OrderStatusStage;
  createdAt: string;
  updatedAt: string;
  invitationUrl?: string;
  weddingInfo?: WeddingInformation;
  weddingInfoSubmitted?: boolean;
  albumSubmitted?: boolean;
  revisionRequests?: RevisionRequest[];
  slaRemainingHours?: number;
}
