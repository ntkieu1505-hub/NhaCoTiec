import React, { useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import {
  useOrder,
  adminConfirmPayment,
  adminRejectPayment,
  adminAdvanceStage,
  adminCompleteDesign,
  adminUploadExcel,
  adminSendExcelToCustomer,
  useCustomerExport,
} from '../../../mocks/orderStore';
import { MOCK_GUESTS, MOCK_WISHES } from '../../../mocks/index';
import { ORDER_STAGES, PAYMENT_STATUS_META, BANK_INFO } from '../../../utils/constants';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { OrderStatusStage } from '../../../types/order';

export const AdminOrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const activeOrderId = orderId || 'NCT01';
  const order = useOrder(activeOrderId);
  const exportData = useCustomerExport(activeOrderId);

  const [isConfirmSendModalOpen, setIsConfirmSendModalOpen] = useState(false);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fallback if order not found
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-burgundy-wine flex items-center justify-center">
          <Icon name="search_off" className="text-[32px]" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold text-deep-espresso">
            Không tìm thấy đơn hàng #{activeOrderId}
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Đơn hàng có thể đã bị xoá hoặc mã đơn không tồn tại trong hệ thống.
          </p>
        </div>
        <Link
          to="/admin/don-hang"
          className="px-4 py-2 rounded-full bg-burgundy-wine text-white text-xs font-semibold shadow-xs hover:bg-[#851622] transition-colors"
        >
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  const stageMeta = ORDER_STAGES[order.currentStage];
  const [customInvitationUrl, setCustomInvitationUrl] = useState('');

  const defaultInvitationUrl = order.invitationUrl || `https://nhacotiec.vn/invitation/${
    order.weddingInfo
      ? `${order.weddingInfo.groomName}-${order.weddingInfo.brideName}`
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
      : 'minhanh-ducminh'
  }`;

  const handleCompleteDesign = () => {
    if (order.paymentStatus !== 'paid') {
      alert('Cần xác nhận thanh toán trước khi hoàn thành thiết kế.');
      return;
    }
    const finalUrl = customInvitationUrl.trim() || order.invitationUrl || defaultInvitationUrl;
    adminCompleteDesign(order.id, finalUrl);
    setSendSuccessMessage(
      `Đã hoàn thành thiết kế đơn hàng #${order.id}! Trạng thái chuyển sang "Hoàn tất" (Bước 7), đường dẫn "${finalUrl}" đã kích hoạt nút "Mở thiệp" trên Cổng Khách Hàng.`
    );
    setTimeout(() => setSendSuccessMessage(null), 6000);
  };

  const handleQuickAdvance = () => {
    if (order.currentStage < 8) {
      const next = (order.currentStage + 1) as OrderStatusStage;
      adminAdvanceStage(order.id, next);
    }
  };

  const handleRejectPayment = () => {
    const reason = window.prompt(
      'Nhập lý do yêu cầu khách hàng kiểm tra lại thanh toán:',
      'Số tiền hoặc nội dung chuyển khoản chưa trùng khớp với sao kê ngân hàng.'
    );
    if (reason !== null) {
      adminRejectPayment(order.id, reason.trim() || undefined);
    }
  };

  const handleFileUpload = (file: File) => {
    const sizeInKb = (file.size / 1024).toFixed(0);
    adminUploadExcel(order.id, {
      fileName: file.name,
      fileSize: `${sizeInKb} KB`,
      fileUrl: `/exports/${file.name}`,
    });
    setSendSuccessMessage('Đã tải file Excel lên hệ thống. Hãy kiểm tra và bấm "Gửi khách hàng" để hoàn tất.');
    setTimeout(() => setSendSuccessMessage(null), 4000);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleConfirmSendToCustomer = () => {
    adminSendExcelToCustomer(order.id);
    setIsConfirmSendModalOpen(false);
    setSendSuccessMessage('Đã gửi file dữ liệu thành công cho khách hàng! Khách hàng có thể xem và tải về ngay bây giờ.');
    setTimeout(() => setSendSuccessMessage(null), 5000);
  };

  return (
    <div className="flex flex-col gap-6 text-deep-espresso pb-16">
      {/* 1. BREADCRUMBS & TOP NAV */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border-delicate">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Link to="/admin/tong-quan" className="hover:text-burgundy-wine transition-colors">
              Admin Hub
            </Link>
            <span>/</span>
            <Link to="/admin/don-hang" className="hover:text-burgundy-wine transition-colors">
              Quản lý đơn hàng
            </Link>
            <span>/</span>
            <span className="font-semibold text-deep-espresso">#{order.id}</span>
          </div>
          <div className="flex items-center gap-2.5 mt-0.5">
            <h1 className="font-serif text-2xl font-bold text-deep-espresso">
              Chi tiết đơn hàng #{order.id}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-label-caps font-bold border ${
                order.paymentStatus === 'paid'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : order.paymentStatus === 'pending_confirmation'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                  : order.paymentStatus === 'rejected'
                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                  : 'bg-rose-50 text-burgundy-wine border-rose-200'
              }`}
            >
              {PAYMENT_STATUS_META[order.paymentStatus]?.label || 'Chưa thanh toán'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/don-hang"
            className="px-3.5 py-2 rounded-full bg-surface-card hover:bg-surface-subtle text-deep-espresso border border-border-delicate text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Icon name="arrow_back" className="text-[16px]" />
            <span>Quay lại danh sách</span>
          </Link>
          <a
            href={`/dashboard/don-hang/${order.id}`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-full bg-surface-card hover:bg-surface-subtle text-burgundy-wine border border-burgundy-wine/30 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Icon name="open_in_new" className="text-[16px]" />
            <span>Góc nhìn khách hàng</span>
          </a>
        </div>
      </div>

      {/* Success alert message */}
      {sendSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 font-medium shadow-xs animate-in fade-in">
          <Icon name="check_circle" className="text-[18px] text-emerald-700 flex-shrink-0" />
          <span className="flex-1">{sendSuccessMessage}</span>
          <button
            onClick={() => setSendSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <Icon name="close" className="text-[16px]" />
          </button>
        </div>
      )}

      {/* PENDING PAYMENT ACTION BANNER (IF APPLICABLE) */}
      {order.paymentStatus === 'pending_confirmation' && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <Icon name="hourglass_top" className="text-[20px] text-amber-700 animate-spin" />
              <span>Khách hàng yêu cầu đối soát thanh toán chuyển khoản ngân hàng</span>
            </div>
            <span className="text-xs text-amber-900">
              Gửi lúc: {formatDateTime(order.paymentSubmissionTime || order.updatedAt)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-surface-card/80 border border-amber-200 text-xs flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Tài khoản thụ hưởng:</span>
              <span className="font-mono font-semibold text-deep-espresso">
                {BANK_INFO.bankName} • {BANK_INFO.accountNumber} ({BANK_INFO.accountHolder})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Nội dung chuyển khoản cần khớp:</span>
              <span className="font-mono font-bold text-burgundy-wine">#{order.id}</span>
            </div>
            {order.paymentNote && (
              <div className="pt-1 border-t border-border-delicate flex flex-col">
                <span className="text-text-muted">Ghi chú từ khách:</span>
                <span className="italic text-deep-espresso">"{order.paymentNote}"</span>
              </div>
            )}
            {order.paymentProof && (
              <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 w-fit">
                <Icon name="attach_file" className="text-[14px]" />
                <span>Bằng chứng chuyển khoản: <strong>{order.paymentProof}</strong></span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => adminConfirmPayment(order.id)}
              className="px-5 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <Icon name="check_circle" className="text-[18px]" />
              <span>Xác nhận thanh toán (Chuyển sang Đã thanh toán)</span>
            </button>
            <button
              type="button"
              onClick={handleRejectPayment}
              className="px-4 h-10 rounded-full bg-surface-card hover:bg-rose-50 text-rose-800 border border-rose-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Icon name="cancel" className="text-[16px]" />
              <span>Yêu cầu kiểm tra lại</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. ORDER SUMMARY & CUSTOMER OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Khách hàng */}
        <div className="bg-surface-card rounded-2xl p-4 shadow-xs border border-border-delicate flex flex-col gap-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border-delicate">
            <Icon name="person" className="text-[18px] text-burgundy-wine" />
            <h3 className="font-serif text-sm font-bold text-deep-espresso">
              Thông tin khách hàng
            </h3>
          </div>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Cặp đôi:</span>
              <span className="font-semibold text-deep-espresso text-right">{order.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Điện thoại:</span>
              <span className="font-mono text-deep-espresso">{order.customerPhone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Email:</span>
              <span className="text-deep-espresso text-right truncate max-w-[180px]">{order.customerEmail}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Ngày tạo đơn:</span>
              <span className="text-deep-espresso">{formatDateTime(order.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Sản phẩm & Giá */}
        <div className="bg-surface-card rounded-2xl p-4 shadow-xs border border-border-delicate flex flex-col gap-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border-delicate">
            <Icon name="style" className="text-[18px] text-gold-foil" />
            <h3 className="font-serif text-sm font-bold text-deep-espresso">
              Mẫu thiệp &amp; Chi phí
            </h3>
          </div>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Mẫu thiệp:</span>
              <span className="font-semibold text-deep-espresso truncate max-w-[180px]">{order.templateName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Phân loại:</span>
              <span className="font-label-caps text-[10px] uppercase font-bold text-gold-foil bg-gold-foil/10 px-2 py-0.5 rounded">
                {order.category === 'premium' ? 'Cao cấp' : 'Tiêu chuẩn'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Tổng chi phí:</span>
              <span className="font-serif font-bold text-burgundy-wine text-sm">
                {formatCurrency(order.price)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Phương thức:</span>
              <span className="font-medium text-deep-espresso uppercase">{order.paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Tiến độ & Điều phối Admin */}
        <div className="bg-surface-card rounded-2xl p-4 shadow-xs border border-border-delicate flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-border-delicate">
            <div className="flex items-center gap-2">
              <Icon name="route" className="text-[18px] text-burgundy-wine" />
              <h3 className="font-serif text-sm font-bold text-deep-espresso">
                Tiến trình 8 bước
              </h3>
            </div>
            <span className="font-label-caps text-[11px] font-bold text-burgundy-wine bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              Bước {order.currentStage} / 8
            </span>
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <span className="font-semibold text-deep-espresso">
              {stageMeta.name}
            </span>
            <span className="text-text-muted text-[11px] leading-relaxed line-clamp-2">
              {stageMeta.message}
            </span>
          </div>

          <div className="pt-2 mt-auto border-t border-border-delicate flex flex-col gap-2">
            <button
              type="button"
              onClick={handleQuickAdvance}
              disabled={order.currentStage === 8 || order.paymentStatus !== 'paid'}
              className="w-full h-9 rounded-full bg-burgundy-wine text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#851622] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon name="step" className="text-[16px]" />
              <span>Chuyển sang Bước {order.currentStage < 8 ? order.currentStage + 1 : 8}</span>
            </button>

            {order.paymentStatus === 'paid' && order.currentStage !== 7 && (
              <button
                type="button"
                onClick={handleCompleteDesign}
                className="w-full h-9 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                title="Hoàn thành thiết kế và xuất bản URL thiệp cưới"
              >
                <Icon name="check_circle" className="text-[16px]" />
                <span>Hoàn thành thiết kế</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. 8-STEP WORKFLOW STEPPER BAR */}
      <div className="bg-surface-card rounded-2xl p-4 shadow-xs border border-border-delicate flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-[10px] uppercase tracking-wider font-bold text-text-muted">
            Quy trình điều phối 8 bước chính thức:
          </span>
          <span className="text-[11px] text-text-muted">
            Click vào bước để điều phối trực tiếp
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {([1, 2, 3, 4, 5, 6, 7, 8] as OrderStatusStage[]).map((stg) => {
            const isCompleted = stg < order.currentStage;
            const isCurrent = stg === order.currentStage;
            const meta = ORDER_STAGES[stg];
            return (
              <button
                key={stg}
                type="button"
                onClick={() => {
                  if (order.paymentStatus !== 'paid' && stg > 1) {
                    alert('Cần xác nhận thanh toán trước khi chuyển sang các bước tiếp theo.');
                    return;
                  }
                  if (stg === 7) {
                    handleCompleteDesign();
                    return;
                  }
                  adminAdvanceStage(order.id, stg);
                }}
                className={`p-2 rounded-xl text-left border flex flex-col gap-1 transition-all ${
                  isCurrent
                    ? 'border-burgundy-wine bg-burgundy-wine text-white shadow-xs'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                    : 'border-border-delicate bg-surface-subtle/50 text-text-muted hover:bg-surface-cream'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold font-mono">#{stg}</span>
                  <Icon
                    name={isCompleted ? 'check_circle' : isCurrent ? meta.icon : 'radio_button_unchecked'}
                    className="text-[14px]"
                  />
                </div>
                <span className="font-semibold text-[11px] truncate">{meta.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. SUBMITTED WEDDING INFORMATION & PHOTO ALBUM (FROM CUSTOMER) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Thông tin tiệc cưới khách đã điền */}
        <div className="bg-surface-card rounded-2xl p-5 shadow-xs border border-border-delicate flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-delicate">
            <div className="flex items-center gap-2">
              <Icon name="favorite" className="text-[20px] text-burgundy-wine" />
              <div>
                <span className="font-label-caps text-[9px] uppercase tracking-wider font-bold text-burgundy-wine block">
                  Dữ liệu khách hàng điền
                </span>
                <h3 className="font-serif text-base font-bold text-deep-espresso">
                  Thông tin tiệc cưới
                </h3>
              </div>
            </div>
            {order.weddingInfoSubmitted ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-label-caps font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <Icon name="check_circle" className="text-[13px]" />
                Khách đã điền
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-label-caps font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                <Icon name="hourglass_empty" className="text-[13px]" />
                Chưa điền thông tin
              </span>
            )}
          </div>

          {order.weddingInfo ? (
            <div className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-surface-subtle/50 border border-border-delicate">
                <div>
                  <span className="text-text-muted text-[10px] uppercase font-bold block">Chú rể</span>
                  <span className="font-semibold text-deep-espresso text-sm">{order.weddingInfo.groomName}</span>
                </div>
                <div>
                  <span className="text-text-muted text-[10px] uppercase font-bold block">Cô dâu</span>
                  <span className="font-semibold text-deep-espresso text-sm">{order.weddingInfo.brideName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-surface-subtle/30 border border-border-delicate">
                  <span className="text-text-muted text-[10px] block">Thời gian làm lễ</span>
                  <span className="font-semibold text-deep-espresso">
                    {order.weddingInfo.weddingTime} • {order.weddingInfo.weddingDate}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-subtle/30 border border-border-delicate">
                  <span className="text-text-muted text-[10px] block">Tên sảnh / Nhà hàng</span>
                  <span className="font-semibold text-deep-espresso truncate block">
                    {order.weddingInfo.venueName}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-subtle/30 border border-border-delicate flex flex-col gap-1">
                <span className="text-text-muted text-[10px] block">Địa chỉ tổ chức</span>
                <span className="text-deep-espresso leading-relaxed">{order.weddingInfo.venueAddress}</span>
                {order.weddingInfo.googleMapUrl && (
                  <a
                    href={order.weddingInfo.googleMapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-burgundy-wine hover:underline text-[11px] font-semibold flex items-center gap-1 mt-0.5"
                  >
                    <Icon name="map" className="text-[14px]" />
                    <span>Mở link Google Maps</span>
                  </a>
                )}
              </div>

              {order.weddingInfo.invitationMessage && (
                <div className="p-2.5 rounded-xl bg-surface-subtle/30 border border-border-delicate flex flex-col gap-1">
                  <span className="text-text-muted text-[10px] block">Thông điệp / Lời ngỏ</span>
                  <p className="italic text-deep-espresso leading-relaxed">
                    "{order.weddingInfo.invitationMessage}"
                  </p>
                </div>
              )}

              {order.weddingInfo.loveStory && (
                <div className="p-2.5 rounded-xl bg-surface-subtle/30 border border-border-delicate flex flex-col gap-1">
                  <span className="text-text-muted text-[10px] block">Câu chuyện tình yêu</span>
                  <p className="italic text-deep-espresso leading-relaxed">
                    "{order.weddingInfo.loveStory}"
                  </p>
                </div>
              )}

              {order.weddingInfo.designerNotes && (
                <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 flex flex-col gap-1">
                  <span className="text-amber-900 font-bold text-[10px] uppercase">Ghi chú cho Designer</span>
                  <p className="text-deep-espresso leading-relaxed">
                    {order.weddingInfo.designerNotes}
                  </p>
                </div>
              )}

              {order.weddingInfo.videoUrl && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-subtle/40 border border-border-delicate">
                  <span className="text-text-muted">Link Video cưới:</span>
                  <a
                    href={order.weddingInfo.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-burgundy-wine font-semibold hover:underline truncate max-w-[200px]"
                  >
                    {order.weddingInfo.videoUrl}
                  </a>
                </div>
              )}

              {order.weddingInfo.submittedAt && (
                <span className="text-[11px] text-text-muted text-right pt-1">
                  Gửi lúc: {formatDateTime(order.weddingInfo.submittedAt)}
                </span>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-text-muted bg-surface-subtle/40 rounded-xl border border-dashed border-border-delicate flex flex-col items-center gap-2">
              <Icon name="edit_note" className="text-[28px] text-text-muted/60" />
              <span>Khách hàng chưa gửi thông tin lễ cưới.</span>
            </div>
          )}
        </div>

        {/* Right: Album ảnh khách hàng đã tải */}
        <div className="bg-surface-card rounded-2xl p-5 shadow-xs border border-border-delicate flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-delicate">
            <div className="flex items-center gap-2">
              <Icon name="photo_library" className="text-[20px] text-gold-foil" />
              <div>
                <span className="font-label-caps text-[9px] uppercase tracking-wider font-bold text-burgundy-wine block">
                  Dữ liệu đa phương tiện
                </span>
                <h3 className="font-serif text-base font-bold text-deep-espresso">
                  Album ảnh cưới
                </h3>
              </div>
            </div>
            <span className="text-xs font-semibold text-deep-espresso">
              {order.weddingInfo?.albumPhotos?.length || 0} ảnh đã tải
            </span>
          </div>

          {order.weddingInfo?.albumPhotos && order.weddingInfo.albumPhotos.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {order.weddingInfo.albumPhotos.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedPhotoPreview(url)}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-border-delicate cursor-pointer bg-surface-subtle hover:ring-2 hover:ring-burgundy-wine transition-all"
                  >
                    <img
                      src={url}
                      alt={`Ảnh ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                      <Icon name="zoom_in" className="text-[20px]" />
                    </div>
                  </div>
                ))}
              </div>
              <span className="text-[11px] text-text-muted text-right">
                Bấm vào ảnh để phóng to xem chi tiết
              </span>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-text-muted bg-surface-subtle/40 rounded-xl border border-dashed border-border-delicate flex flex-col items-center gap-2">
              <Icon name="add_photo_alternate" className="text-[28px] text-text-muted/60" />
              <span>Khách hàng chưa tải album ảnh lên hệ thống.</span>
            </div>
          )}
        </div>
      </div>

      {/* 4B. THIẾT KẾ & XUẤT BẢN THIỆP CƯỚI (INVITATION URL) */}
      <section className="bg-surface-card rounded-2xl p-5 sm:p-6 shadow-xs border border-border-delicate flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-delicate">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-burgundy-wine/10 text-burgundy-wine flex items-center justify-center flex-shrink-0">
              <Icon name="palette" className="text-[22px]" />
            </div>
            <div>
              <span className="font-label-caps text-[10px] uppercase tracking-wider font-bold text-burgundy-wine block">
                Điều phối thiết kế &amp; Xuất bản
              </span>
              <h2 className="font-serif text-lg font-bold text-deep-espresso">
                Thiết kế thiệp cưới &amp; Đường dẫn riêng (Invitation URL)
              </h2>
            </div>
          </div>

          {/* Status Badge */}
          {order.orderStatus === 'completed' && Boolean(order.invitationUrl) ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-label-caps text-xs font-bold shadow-xs">
              <Icon name="check_circle" className="text-[16px] text-emerald-700" />
              Thiết kế đã hoàn thành • URL đã kích hoạt
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-label-caps text-xs font-bold shadow-xs">
              <Icon name="hourglass_top" className="text-[16px] text-amber-700 animate-pulse" />
              Chưa hoàn thành thiết kế (Khách chỉ thấy "Mẫu đã chọn")
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Left info */}
          <div className="p-4 rounded-xl bg-surface-subtle/70 border border-border-delicate text-xs flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold text-deep-espresso">
              <Icon name="info" className="text-[16px] text-gold-foil" />
              <span>Quy tắc hiển thị phía khách hàng:</span>
            </div>
            <p className="text-text-muted leading-relaxed">
              {order.orderStatus === 'completed' && Boolean(order.invitationUrl)
                ? 'Đơn hàng đang ở trạng thái Hoàn tất. Khách hàng đã thấy huy hiệu "Thiệp đã hoàn thiện" và nút "Mở thiệp" để xem liên kết cá nhân hoá chính thức.'
                : 'Trước khi Admin bấm "Hoàn thành thiết kế", khách hàng KHÔNG THỂ thấy đường dẫn riêng hay nút "Mở thiệp". Khách hàng chỉ thấy thông tin mẫu và nút "Mẫu đã chọn" (xem demo).'}
            </p>
          </div>

          {/* Right form & action */}
          <div className="p-4 rounded-xl bg-surface-subtle/50 border border-border-delicate flex flex-col gap-3 text-xs">
            <label className="font-semibold text-deep-espresso flex items-center justify-between">
              <span>Đường dẫn thiệp cưới cá nhân hoá (invitationUrl):</span>
              <span className="text-[11px] text-text-muted font-normal">Domain chính thức</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={defaultInvitationUrl}
                value={customInvitationUrl || order.invitationUrl || ''}
                onChange={(e) => setCustomInvitationUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-surface-card border border-border-delicate text-xs font-mono text-deep-espresso focus:outline-hidden focus:border-burgundy-wine shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCompleteDesign}
                className="flex-1 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Icon name="check_circle" className="text-[16px]" />
                <span>
                  {order.orderStatus === 'completed' && Boolean(order.invitationUrl)
                    ? 'Cập nhật lại thiết kế & URL'
                    : 'Hoàn thành thiết kế'}
                </span>
              </button>

              {order.invitationUrl && (
                <a
                  href={order.invitationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 h-10 rounded-full bg-surface-card hover:bg-surface-subtle text-burgundy-wine border border-burgundy-wine/40 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Icon name="open_in_new" className="text-[15px]" />
                  <span>Xem thiệp</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. EXCEL DELIVERY WORKFLOW: KHÁCH MỜI & LỜI CHÚC */}
      <section className="bg-surface-card rounded-2xl p-5 sm:p-6 shadow-xs border border-border-delicate flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-delicate">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-burgundy-wine/10 text-burgundy-wine flex items-center justify-center flex-shrink-0">
              <Icon name="table_view" className="text-[22px]" />
            </div>
            <div>
              <span className="font-label-caps text-[10px] uppercase tracking-wider font-bold text-burgundy-wine block">
                Quy trình chuyển giao dữ liệu
              </span>
              <h2 className="font-serif text-lg font-bold text-deep-espresso">
                Khách mời &amp; Lời chúc (Chuyển giao dữ liệu Excel)
              </h2>
            </div>
          </div>

          {/* Export Status Badge */}
          <div className="flex items-center gap-2">
            {exportData?.status === 'sent' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-label-caps text-xs font-bold shadow-xs">
                <Icon name="check_circle" className="text-[16px] text-emerald-700" />
                Đã gửi khách hàng
              </span>
            ) : exportData?.status === 'uploaded' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-300 font-label-caps text-xs font-bold shadow-xs">
                <Icon name="upload_file" className="text-[16px] text-blue-700" />
                Đã tải lên — chưa gửi khách
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-label-caps text-xs font-bold shadow-xs">
                <Icon name="hourglass_empty" className="text-[16px] text-amber-700" />
                Đang chờ dữ liệu
              </span>
            )}
          </div>
        </div>

        {/* Status Explanation Card */}
        <div className="p-4 rounded-xl bg-surface-subtle/70 border border-border-delicate text-xs flex flex-col gap-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-semibold text-deep-espresso flex items-center gap-1.5">
              <Icon name="info" className="text-[16px] text-gold-foil" />
              Quy định hiển thị phía Khách Hàng:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Hạn chót tổng hợp:</span>
              <span className="font-semibold text-burgundy-wine bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {exportData?.deadline || '25/12/2026'}
              </span>
            </div>
          </div>
          <p className="text-text-muted leading-relaxed">
            {exportData?.status === 'sent'
              ? 'Khách hàng đã nhận được file và đang có quyền xem bảng dữ liệu khách mời, lời chúc và bấm "Tải file Excel" trên Cổng Khách Hàng.'
              : exportData?.status === 'uploaded'
              ? 'File Excel đã sẵn sàng trong hệ thống nhưng KHÁCH HÀNG CHƯA THỂ THẤY. Khách hàng vẫn đang thấy trạng thái "Đang chờ dữ liệu". Hãy bấm "Gửi khách hàng" để chuyển giao chính thức.'
              : 'Hiện chưa có file dữ liệu nào được tải lên. Trên Cổng Khách Hàng, danh sách khách mời và lời chúc đang được ẩn hoàn toàn để bảo mật thông tin trước ngày cưới.'}
          </p>
        </div>

        {/* Upload Zone & File Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* Box 1: Tải lên / Cập nhật file Excel */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-burgundy-wine bg-burgundy-wine/5 ring-4 ring-burgundy-wine/10'
                : 'border-border-delicate bg-surface-subtle/40 hover:bg-surface-cream hover:border-burgundy-wine/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-2xs">
              <Icon name="upload_file" className="text-[24px]" />
            </div>
            <div>
              <span className="font-semibold text-deep-espresso text-xs block">
                {exportData?.status === 'draft' ? 'Tải lên file Excel tổng hợp' : 'Thay file Excel khác'}
              </span>
              <span className="text-[11px] text-text-muted mt-0.5 block">
                Kéo thả file vào đây hoặc bấm để chọn từ máy tính (.xlsx, .xls, .csv)
              </span>
            </div>
            <button
              type="button"
              className="mt-1 px-4 py-1.5 rounded-full bg-surface-card border border-border-delicate text-deep-espresso text-xs font-semibold hover:bg-surface-subtle shadow-2xs"
            >
              Chọn file từ máy
            </button>
          </div>

          {/* Box 2: Thông tin file hiện tại & Nút Gửi Khách Hàng */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-surface-subtle/50 border border-border-delicate">
            <div className="flex items-center justify-between pb-2 border-b border-border-delicate">
              <span className="font-label-caps text-[10px] uppercase font-bold text-text-muted">
                Tình trạng file trong hệ thống
              </span>
              <span className="text-[11px] text-text-muted">
                {exportData?.status === 'sent' ? 'Đã công bố' : 'Bản nội bộ'}
              </span>
            </div>

            {exportData && exportData.fileName ? (
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-card border border-border-delicate shadow-2xs">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                    <Icon name="table_view" className="text-[22px]" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold text-deep-espresso truncate">
                      {exportData.fileName}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      Dung lượng: {exportData.fileSize || '184 KB'}
                      {exportData.uploadedAt && ` • Tải lên: ${formatDateTime(exportData.uploadedAt)}`}
                    </span>
                  </div>
                </div>

                {exportData.status === 'sent' && exportData.sentAt && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5">
                    <Icon name="done_all" className="text-[15px]" />
                    <span>Đã gửi cho khách lúc: <strong>{formatDateTime(exportData.sentAt)}</strong></span>
                  </div>
                )}

                {/* Main Action Buttons */}
                <div className="flex flex-col gap-2 pt-1">
                  {exportData.status !== 'sent' ? (
                    <button
                      type="button"
                      onClick={() => setIsConfirmSendModalOpen(true)}
                      className="w-full h-11 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-colors"
                    >
                      <Icon name="send" className="text-[18px]" />
                      <span>Gửi khách hàng</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsConfirmSendModalOpen(true)}
                      className="w-full h-10 rounded-full bg-surface-card hover:bg-surface-subtle text-burgundy-wine border border-burgundy-wine/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Icon name="sync" className="text-[16px]" />
                      <span>Gửi lại bản cập nhật mới cho khách hàng</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-text-muted flex flex-col items-center gap-2">
                <Icon name="folder_off" className="text-[24px] text-text-muted/60" />
                <span>Chưa có file nào được tải lên. Hãy chọn file ở ô bên trái.</span>
              </div>
            )}
          </div>
        </div>

        {/* Preview of data contained in export */}
        <div className="mt-2 pt-4 border-t border-border-delicate flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-[10px] uppercase font-bold text-text-muted">
              Xem trước tập dữ liệu sẽ bàn giao cho khách:
            </span>
            <span className="text-[11px] text-burgundy-wine font-semibold">
              {MOCK_GUESTS.length} khách mời • {MOCK_WISHES.length} lời chúc
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Column 1: Sample Guests */}
            <div className="p-3 rounded-xl bg-surface-subtle/40 border border-border-delicate flex flex-col gap-2">
              <span className="font-semibold text-deep-espresso flex items-center gap-1">
                <Icon name="recent_actors" className="text-[16px] text-burgundy-wine" />
                Danh sách khách tham dự ({MOCK_GUESTS.length})
              </span>
              <div className="divide-y divide-border-delicate/60">
                {MOCK_GUESTS.slice(0, 3).map((g) => (
                  <div key={g.id} className="py-1.5 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-deep-espresso">{g.name}</span>
                    <span className="text-text-muted">{g.rsvpStatus === 'attending' ? 'Tham dự' : 'Chờ phản hồi'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Sample Wishes */}
            <div className="p-3 rounded-xl bg-surface-subtle/40 border border-border-delicate flex flex-col gap-2">
              <span className="font-semibold text-deep-espresso flex items-center gap-1">
                <Icon name="favorite" className="text-[16px] text-burgundy-wine" />
                Lời chúc mừng ({MOCK_WISHES.length})
              </span>
              <div className="divide-y divide-border-delicate/60">
                {MOCK_WISHES.slice(0, 3).map((w) => (
                  <div key={w.id} className="py-1.5 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-deep-espresso truncate max-w-[140px]">{w.senderName}</span>
                    <span className="italic text-text-muted truncate max-w-[150px]">"{w.message}"</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CONFIRMATION PROMPT MODAL BEFORE SENDING EXCEL */}
      {isConfirmSendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-surface-card rounded-2xl shadow-xl border border-border-delicate p-5 flex flex-col gap-4 text-deep-espresso">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-burgundy-wine/10 text-burgundy-wine flex items-center justify-center flex-shrink-0">
                <Icon name="send" className="text-[22px]" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold">
                  Xác nhận gửi file cho khách hàng
                </h3>
                <span className="text-xs text-text-muted">
                  Đơn hàng #{order.id} • {order.customerName}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle/70 border border-border-delicate text-xs flex flex-col gap-2 text-deep-espresso leading-relaxed">
              <p>
                Bạn có chắc chắn muốn gửi file Excel{' '}
                <strong className="text-burgundy-wine">"{exportData?.fileName || 'danh-sach.xlsx'}"</strong>{' '}
                cho khách hàng?
              </p>
              <div className="pt-1.5 border-t border-border-delicate/80 flex flex-col gap-1 text-[11px] text-text-muted">
                <span className="flex items-center gap-1 text-deep-espresso font-semibold">
                  <Icon name="verified" className="text-[14px] text-emerald-700" />
                  Hiệu lực ngay lập tức:
                </span>
                <span>• Trạng thái trên Cổng Khách Hàng chuyển sang <strong>"Đã có dữ liệu"</strong>.</span>
                <span>• Khách hàng có thể bấm <strong>"Xem dữ liệu"</strong> và <strong>"Tải file Excel"</strong>.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsConfirmSendModalOpen(false)}
                className="px-4 py-2 rounded-full bg-surface-subtle hover:bg-surface-cream text-deep-espresso text-xs font-semibold border border-border-delicate transition-colors"
              >
                Huỷ bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmSendToCustomer}
                className="px-5 py-2 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-colors"
              >
                <Icon name="check" className="text-[16px]" />
                <span>Xác nhận gửi ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. LIGHTBOX MODAL FOR PHOTO PREVIEW */}
      {selectedPhotoPreview && (
        <div
          onClick={() => setSelectedPhotoPreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl bg-black">
            <img
              src={selectedPhotoPreview}
              alt="Ảnh cưới xem lớn"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setSelectedPhotoPreview(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <Icon name="close" className="text-[18px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
