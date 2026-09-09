import { OrderStageMetadata, OrderStatusStage, PaymentStatus, OrderStatus } from '../types/order';

export const ORDER_STAGES: Record<OrderStatusStage, OrderStageMetadata> = {
  1: {
    stage: 1,
    code: 'cho_thanh_toan',
    orderStatus: 'pending_payment',
    name: 'Chờ thanh toán',
    title: 'Chờ thanh toán',
    message: 'Hoàn tất thanh toán để Nhà Có Tiệc bắt đầu xử lý đơn hàng.',
    icon: 'pending',
    tag: 'Chờ chuyển khoản',
    description: 'Tạo đơn & chuyển khoản phí dịch vụ'
  },
  2: {
    stage: 2,
    code: 'da_thanh_toan',
    orderStatus: 'paid',
    name: 'Đã thanh toán',
    title: 'Thanh toán đã được xác nhận',
    message: 'Đơn hàng của bạn đã được tiếp nhận an toàn qua chuyển khoản ngân hàng.',
    icon: 'verified',
    tag: 'Đã thanh toán',
    description: 'Xác nhận giao dịch thành công'
  },
  3: {
    stage: 3,
    code: 'da_nhan_thong_tin',
    orderStatus: 'information_received',
    name: 'Đã nhận thông tin',
    title: 'Nhà Có Tiệc đã nhận thông tin',
    message: 'Chúng mình đã nhận đủ hình ảnh và thông tin tiệc cưới, sẵn sàng dựng bản thiết kế.',
    icon: 'mark_email_read',
    tag: 'Tiếp nhận thông tin',
    description: 'Đã tiếp nhận ảnh cưới & chi tiết tiệc'
  },
  4: {
    stage: 4,
    code: 'dang_thiet_ke',
    orderStatus: 'designing',
    name: 'Đang thiết kế',
    title: 'Chiếc thiệp đang được thiết kế',
    message: 'Đội ngũ Nhà Có Tiệc đang chăm chút từng chi tiết cho chiếc thiệp của bạn.',
    icon: 'draw',
    tag: 'Đang thiết kế',
    description: 'Hoàn thiện website và giao diện RSVP'
  },
  5: {
    stage: 5,
    code: 'ban_giao_thiet_ke',
    orderStatus: 'design_delivered',
    name: 'Bàn giao thiết kế',
    title: 'Thiết kế đã sẵn sàng',
    message: 'Nhà Có Tiệc đã hoàn thiện bản thiết kế. Hãy xem lại thiệp và gửi yêu cầu chỉnh sửa nếu cần.',
    icon: 'celebration',
    tag: 'Bàn giao thiết kế',
    description: 'Gửi bản duyệt xem thử cho dâu rể kiểm tra'
  },
  6: {
    stage: 6,
    code: 'chinh_sua',
    orderStatus: 'revision',
    name: 'Chỉnh sửa thiết kế',
    title: 'Đang chỉnh sửa thiết kế',
    message: 'Nhà Có Tiệc đang xử lý yêu cầu chỉnh sửa của bạn theo ghi chú.',
    icon: 'history_edu',
    tag: 'Chỉnh sửa thiết kế',
    description: 'Căn chỉnh câu chữ và thứ tự hình ảnh'
  },
  7: {
    stage: 7,
    code: 'hoan_tat',
    orderStatus: 'completed',
    name: 'Hoàn tất',
    title: 'Chiếc thiệp đã hoàn tất',
    message: 'Thiệp của bạn đã sẵn sàng chia sẻ đến bạn bè và người thân yêu!',
    icon: 'favorite',
    tag: 'Hoàn tất xuất bản',
    description: 'Thiệp sẵn sàng gửi đến khách mời'
  },
  8: {
    stage: 8,
    code: 'da_het_han',
    orderStatus: 'expired',
    name: 'Đã hết hạn',
    title: 'Đơn hàng đã hoàn thành lưu trữ',
    message: 'Thiệp đã kết thúc thời gian hiển thị sau ngày cưới và được lưu trữ an toàn trong kỷ niệm.',
    icon: 'schedule',
    tag: 'Lưu trữ kỷ niệm',
    description: 'Lưu trữ kỷ niệm sau đám cưới'
  }
};

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  { label: string; tag: string; colorClass: string; icon: string }
> = {
  unpaid: {
    label: 'Chưa thanh toán',
    tag: 'Chưa thanh toán',
    colorClass: 'bg-surface-subtle text-text-muted border-border-delicate',
    icon: 'schedule'
  },
  pending_confirmation: {
    label: 'Đang chờ xác nhận thanh toán',
    tag: 'Chờ Admin xác nhận',
    colorClass: 'bg-amber-50 text-amber-900 border-amber-300 font-bold',
    icon: 'hourglass_top'
  },
  paid: {
    label: 'Đã thanh toán',
    tag: 'Đã thanh toán',
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
    icon: 'check_circle'
  },
  rejected: {
    label: 'Yêu cầu kiểm tra lại',
    tag: 'Cần kiểm tra lại',
    colorClass: 'bg-rose-100 text-rose-900 border-rose-300 font-bold',
    icon: 'error'
  }
};

export const ORDER_STATUS_META: Record<OrderStatus, { name: string; stage: OrderStatusStage }> = {
  pending_payment: { name: 'Chờ thanh toán', stage: 1 },
  paid: { name: 'Đã thanh toán', stage: 2 },
  information_received: { name: 'Đã nhận thông tin', stage: 3 },
  designing: { name: 'Đang thiết kế', stage: 4 },
  design_delivered: { name: 'Bàn giao thiết kế', stage: 5 },
  revision: { name: 'Chỉnh sửa thiết kế', stage: 6 },
  completed: { name: 'Hoàn tất', stage: 7 },
  expired: { name: 'Đã hết hạn', stage: 8 }
};

export const REVISION_TOPICS = [
  '📷 Đổi ảnh / Album',
  '📍 Ngày giờ & Địa điểm',
  '🎵 Nhạc nền',
  '✍️ Lời ngỏ & Họ tên',
  '💳 Mã QR Mừng cưới',
  '💌 Chỉnh câu từ RSVP'
];

export const BANK_INFO = {
  bankName: 'MB Bank',
  accountNumber: '0982123456',
  accountHolder: 'NHA CO TIEC VIETNAM',
  qrTemplate: 'compact'
};
