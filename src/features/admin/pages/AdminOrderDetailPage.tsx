import React, { useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import {
  useOrder,
  useOrders,
  adminConfirmPayment,
  adminRejectPayment,
  adminAdvanceStage,
  adminCompleteDesign,
  adminUploadExcel,
  adminSendExcelToCustomer,
  useCustomerExport,
  customerSubmitAlbum,
  adminUpdateWeddingInfo,
  adminResolveRevision,
} from '../../../mocks/orderStore';
import { ORDER_STAGES, PAYMENT_STATUS_META, BANK_INFO } from '../../../utils/constants';
import { formatCurrency, formatDateTime, formatDate } from '../../../utils/formatters';
import { OrderStatusStage } from '../../../types/order';
import { resolveTemplateForOrder, resolveOrderThumbnail, useTemplates } from '../../../mocks/templateStore';
import { downloadImage, downloadAllImages } from '../../../utils/fileDownloader';
import { uploadOrderPhoto, fileToCompressedDataUrl } from '../../../services/storageService';
import { WeddingInfoModal } from '../../customer/components/WeddingInfoModal';

interface AlbumPhotoCardProps {
  url: string;
  index: number;
  orderId: string;
  isBlob: boolean;
  note?: string;
  name?: string;
  size?: string;
  onPreview: () => void;
  onDelete: () => void;
}

const AlbumPhotoCard: React.FC<AlbumPhotoCardProps> = ({
  url,
  index,
  orderId,
  isBlob,
  note,
  name,
  size,
  onPreview,
  onDelete,
}) => {
  const [hasError, setHasError] = useState(isBlob);

  if (hasError) {
    return (
      <div className="relative aspect-square rounded-xl overflow-hidden border border-rose-200 bg-rose-50/90 flex flex-col items-center justify-center p-2 text-center text-rose-700 shadow-2xs">
        <Icon name="broken_image" className="text-[24px] text-rose-500 mb-1" />
        <span className="font-semibold text-[11px] text-rose-800 leading-tight">Link ảnh đã hết hạn</span>
        <span className="text-[9px] text-rose-600/80 mt-0.5 line-clamp-1">(Phiên bản thử nghiệm cũ)</span>
        <button
          type="button"
          onClick={onDelete}
          className="mt-2 px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-semibold flex items-center gap-1 shadow-2xs transition-colors"
          title="Xoá ảnh hỏng này để dọn dẹp danh sách"
        >
          <Icon name="delete" className="text-[12px]" />
          <span>Xoá ngay</span>
        </button>
      </div>
    );
  }

  return (
    <div className="group relative rounded-xl overflow-hidden border border-border-delicate bg-surface-subtle hover:ring-2 hover:ring-burgundy-wine transition-all shadow-2xs flex flex-col">
      <div className="relative aspect-square w-full overflow-hidden bg-black/5">
        <img
          src={url}
          alt={note || `Ảnh ${index + 1}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
          onClick={onPreview}
          onError={() => setHasError(true)}
        />
        {/* Index badge */}
        <span className="absolute top-1.5 left-1.5 bg-black/65 backdrop-blur-xs text-white text-[10px] font-mono px-1.5 py-0.5 rounded font-bold pointer-events-none">
          #{index + 1}
        </span>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity text-white">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
            title="Phóng to ảnh"
          >
            <Icon name="zoom_in" className="text-[16px]" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              downloadImage(url, `anh-cuoi-${orderId}-${index + 1}.jpg`);
            }}
            className="w-7 h-7 rounded-full bg-burgundy-wine hover:bg-[#851622] flex items-center justify-center transition-colors"
            title="Tải ảnh này về máy"
          >
            <Icon name="file_download" className="text-[16px]" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Bạn có chắc muốn xoá ảnh này khỏi album?')) {
                onDelete();
              }
            }}
            className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center transition-colors"
            title="Xoá ảnh này"
          >
            <Icon name="delete" className="text-[15px]" />
          </button>
        </div>
      </div>

      {/* Photo Customer Note Footer */}
      {note ? (
        <div className="p-1.5 bg-amber-50/90 border-t border-amber-200 text-amber-950 text-[10px] leading-tight flex items-start gap-1" title={note}>
          <span className="text-amber-700 font-bold shrink-0">📌</span>
          <span className="truncate font-medium">{note}</span>
        </div>
      ) : (name || size) ? (
        <div className="p-1.5 bg-surface-card border-t border-border-delicate text-text-muted text-[10px] leading-tight truncate" title={`${name || ''} ${size ? `(${size})` : ''}`}>
          {name || ''} {size ? `(${size})` : ''}
        </div>
      ) : null}
    </div>
  );
};

export const AdminOrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const allOrders = useOrders();
  const activeOrderId = orderId || allOrders[0]?.id || 'NCT01';
  const orderFromHook = useOrder(activeOrderId);
  const order = orderFromHook || allOrders.find(o => o.id === activeOrderId) || (allOrders.length === 1 ? allOrders[0] : undefined);
  const exportData = useCustomerExport(order?.id || activeOrderId);

  const allTemplates = useTemplates();
  const matchedTemplate = resolveTemplateForOrder(order?.templateId, order?.templateName, allTemplates);
  const displayThumbnail = resolveOrderThumbnail(matchedTemplate, order?.templateThumbnail);

  const [isConfirmSendModalOpen, setIsConfirmSendModalOpen] = useState(false);
  const [isEditWeddingInfoOpen, setIsEditWeddingInfoOpen] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<{
    url: string;
    note?: string;
    name?: string;
    size?: string;
    index?: number;
  } | null>(null);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const albumFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAlbum, setIsUploadingAlbum] = useState(false);

  const handleCopyText = (text: string, msg = 'Đã sao chép vào bộ nhớ tạm!') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setSendSuccessMessage(msg);
      setTimeout(() => setSendSuccessMessage(null), 3000);
    }
  };

  const handleCopyAllWeddingInfo = () => {
    if (!order || !order.weddingInfo) return;
    const currentOrder = order;
    const wi = currentOrder.weddingInfo!;
    const lines = [
      `=== THÔNG TIN TIỆC CƯỚI ĐƠN HÀNG #${currentOrder.id} ===`,
      `Mẫu thiệp: ${currentOrder.templateName}`,
      `Chú rể: ${wi.groomName}`,
      `Cô dâu: ${wi.brideName}`,
      `Số điện thoại liên hệ / Zalo: ${wi.customerPhone || currentOrder.customerPhone || 'Chưa cung cấp'}`,
      `Email nhận thiệp: ${wi.customerEmail || currentOrder.customerEmail || 'Chưa cung cấp'}`,
      ``,
      `--- ĐẠI DIỆN PHỤ HUYNH HAI BÊN ---`,
      `Đại diện Nhà Trai (Bố Mẹ Chú Rể): ${wi.groomParents || 'Chưa cung cấp'}`,
      `Đại diện Nhà Gái (Bố Mẹ Cô Dâu): ${wi.brideParents || 'Chưa cung cấp'}`,
      wi.familyInfo ? `Thông tin hai họ / gia tộc: ${wi.familyInfo}` : null,
      ``,
      `--- THỜI GIAN & ĐỊA ĐIỂM TIỆC CƯỚI ---`,
      `Ngày tổ chức: ${wi.weddingDate}`,
      `Giờ đón khách / Khai lễ: ${wi.weddingTime}`,
      `Địa điểm: ${wi.venueName}`,
      `Địa chỉ: ${wi.venueAddress}`,
      wi.googleMapUrl ? `Link Google Maps: ${wi.googleMapUrl}` : null,
      wi.rsvpDeadline ? `Hạn chót RSVP: ${wi.rsvpDeadline}` : null,
      ``,
      `--- NỘI DUNG & THÔNG ĐIỆP ---`,
      wi.invitationMessage ? `Lời ngỏ / Lời mời: "${wi.invitationMessage}"` : null,
      wi.loveStory ? `Câu chuyện tình yêu: "${wi.loveStory}"` : null,
      wi.timeline ? `Timeline lịch trình:\n${wi.timeline}` : null,
      wi.designerNotes ? `GHI CHÚ CHO DESIGNER: ${wi.designerNotes}` : null,
      ``,
      `--- ĐA PHƯƠNG TIỆN & MỪNG CƯỚI ---`,
      wi.musicTitle ? `Bài hát yêu thích: ${wi.musicTitle}` : null,
      wi.videoUrl ? `Link Video cưới: ${wi.videoUrl}` : null,
      wi.videoNotes ? `Ghi chú video: ${wi.videoNotes}` : null,
      wi.albumDriveUrl ? `Google Drive ảnh cưới: ${wi.albumDriveUrl}` : null,
      wi.albumPhotos?.length ? `Số lượng ảnh album: ${wi.albumPhotos.length} ảnh` : null,
      wi.bankAccountGroom ? `Tài khoản Nhà Trai: ${wi.bankAccountGroom.bankName} - ${wi.bankAccountGroom.accountNumber} (${wi.bankAccountGroom.accountHolder})` : null,
      wi.bankAccountBride ? `Tài khoản Nhà Gái: ${wi.bankAccountBride.bankName} - ${wi.bankAccountBride.accountNumber} (${wi.bankAccountBride.accountHolder})` : null,
    ].filter(line => line !== null).join('\n');

    handleCopyText(lines, `Đã sao chép toàn bộ thông tin tiệc cưới của đơn hàng #${currentOrder.id}!`);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

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

  const stageMeta = (order.currentStage && ORDER_STAGES[order.currentStage])
    ? ORDER_STAGES[order.currentStage]
    : ORDER_STAGES[1];
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
      if (order.paymentStatus !== 'paid') {
        adminConfirmPayment(order.id);
      }
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
    const ext = file.name.toLowerCase();
    if (!ext.endsWith('.xlsx') && !ext.endsWith('.xls') && !ext.endsWith('.csv')) {
      alert('Vui lòng chọn file định dạng Excel (.xlsx, .xls) hoặc .csv');
      return;
    }
    const sizeInKb = (file.size / 1024).toFixed(0);
    const sizeStr = `${sizeInKb} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      const fileDataUrl = reader.result as string;
      adminUploadExcel(order.id, {
        fileName: file.name,
        fileSize: sizeStr,
        fileUrl: fileDataUrl,
        fileDataUrl: fileDataUrl,
      });
      setSendSuccessMessage('Đã tải file Excel lên hệ thống. Hãy kiểm tra và bấm "Gửi khách hàng" để hoàn tất.');
      setTimeout(() => setSendSuccessMessage(null), 4000);
    };
    reader.onerror = () => {
      alert('Không thể đọc file. Vui lòng thử lại!');
    };
  };

  const handleAdminAddPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingAlbum(true);
    const files = Array.from(e.target.files);
    try {
      const newUrls = await Promise.all(
        files.map(async (file) => {
          try {
            const uploaded = await uploadOrderPhoto(order.id, file);
            if (uploaded && !uploaded.startsWith('blob:')) return uploaded;
          } catch {
            // fallback
          }
          return fileToCompressedDataUrl(file);
        })
      );
      const existing = (order.weddingInfo?.albumPhotos || []).filter((u) => !u.startsWith('blob:'));
      const updated = [...existing, ...newUrls.filter(Boolean)];
      customerSubmitAlbum(order.id, updated);
      setSendSuccessMessage(`Đã thêm thành công ${newUrls.filter(Boolean).length} ảnh vào album.`);
      setTimeout(() => setSendSuccessMessage(null), 4000);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi tải ảnh lên album.');
    } finally {
      setIsUploadingAlbum(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleAdminDeletePhoto = (photoIndex: number) => {
    const existing = order.weddingInfo?.albumPhotos || [];
    const updated = existing.filter((_, idx) => idx !== photoIndex);
    customerSubmitAlbum(order.id, updated);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
          {order.paymentStatus !== 'paid' && (
            <button
              type="button"
              onClick={() => adminConfirmPayment(order.id)}
              className="px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Icon name="check_circle" className="text-[16px]" />
              <span>Duyệt thanh toán ngay</span>
            </button>
          )}
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

      {/* PAYMENT ACTION BANNER (FOR ANY UNPAID OR PENDING ORDER) */}
      {order.paymentStatus !== 'paid' && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <Icon
                name={order.paymentStatus === 'pending_confirmation' ? 'hourglass_top' : 'account_balance_wallet'}
                className="text-[20px] text-amber-700"
              />
              <span>
                {order.paymentStatus === 'pending_confirmation'
                  ? 'Khách hàng đã gửi yêu cầu đối soát thanh toán chuyển khoản'
                  : 'Đơn hàng đang ở trạng thái Chưa thanh toán - Admin có thể bấm Duyệt thanh toán ngay bên dưới'}
              </span>
            </div>
            <span className="text-xs text-amber-900">
              Cập nhật: {formatDateTime(order.paymentSubmissionTime || order.updatedAt)}
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
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <button
              type="button"
              onClick={() => adminConfirmPayment(order.id)}
              className="px-5 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Icon name="check_circle" className="text-[18px]" />
              <span>Xác nhận &amp; Duyệt thanh toán (Chuyển sang Đã thanh toán)</span>
            </button>
            {order.paymentStatus === 'pending_confirmation' && (
              <button
                type="button"
                onClick={handleRejectPayment}
                className="px-4 h-10 rounded-full bg-surface-card hover:bg-rose-50 text-rose-800 border border-rose-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Icon name="cancel" className="text-[16px]" />
                <span>Yêu cầu kiểm tra lại</span>
              </button>
            )}
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
          {displayThumbnail && (
            <div className="w-full h-24 rounded-xl overflow-hidden bg-surface-subtle mb-1 border border-border-delicate">
              <img
                src={displayThumbnail}
                alt={order.templateName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
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
            {order.paymentStatus !== 'paid' && (
              <button
                type="button"
                onClick={() => adminConfirmPayment(order.id)}
                className="w-full h-9 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                title="Duyệt thanh toán để mở khóa quy trình 8 bước"
              >
                <Icon name="check_circle" className="text-[16px]" />
                <span>Duyệt thanh toán ngay</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleQuickAdvance}
              disabled={order.currentStage === 8}
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
                  if (order.paymentStatus !== 'paid' && stg >= 2) {
                    adminConfirmPayment(order.id);
                    if (stg > 2) {
                      if (stg === 7) {
                        handleCompleteDesign();
                      } else {
                        adminAdvanceStage(order.id, stg);
                      }
                    }
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
      <section className="bg-surface-card rounded-2xl p-5 sm:p-6 shadow-xs border border-border-delicate flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-delicate">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-burgundy-wine/10 text-burgundy-wine flex items-center justify-center flex-shrink-0">
              <Icon name="favorite" className="text-[22px]" />
            </div>
            <div>
              <span className="font-label-caps text-[10px] uppercase tracking-wider font-bold text-burgundy-wine block">
                Dữ liệu khách hàng đã điền
              </span>
              <h2 className="font-serif text-lg font-bold text-deep-espresso">
                Toàn bộ thông tin tiệc cưới &amp; Album ảnh
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {order.weddingInfoSubmitted ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-label-caps font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full shadow-2xs">
                <Icon name="check_circle" className="text-[15px] text-emerald-700" />
                Khách đã gửi thông tin {order.weddingInfo?.submittedAt ? `(${formatDateTime(order.weddingInfo.submittedAt)})` : ''}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-label-caps font-bold text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full shadow-2xs">
                <Icon name="hourglass_empty" className="text-[15px] text-amber-700" />
                Khách chưa điền thông tin
              </span>
            )}

            {order.weddingInfo && (
              <button
                type="button"
                onClick={handleCopyAllWeddingInfo}
                className="px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-gold-foil/15 text-deep-espresso border border-border-delicate text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                title="Sao chép toàn bộ thông tin tiệc cưới vào bộ nhớ tạm"
              >
                <Icon name={copiedAll ? 'check' : 'content_copy'} className={`text-[15px] ${copiedAll ? 'text-emerald-600' : 'text-gold-foil'}`} />
                <span>{copiedAll ? 'Đã sao chép!' : 'Sao chép tất cả'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsEditWeddingInfoOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              title="Admin chỉnh sửa trực tiếp thông tin tiệc cưới nếu khách gửi thêm/thay đổi"
            >
              <Icon name="edit" className="text-[15px]" />
              <span>Chỉnh sửa thông tin</span>
            </button>
          </div>
        </div>

        {order.weddingInfo ? (
          <div className="flex flex-col gap-6">
            {/* THẺ 1: CÔ DÂU, CHÚ RỂ & ĐẠI DIỆN HAI BÊN (NHÀ TRAI & NHÀ GÁI) */}
            <div className="p-4 sm:p-5 rounded-xl bg-surface-subtle/50 border border-border-delicate flex flex-col gap-4">
              <div className="flex items-center gap-2 text-burgundy-wine font-serif font-bold text-sm border-b border-border-delicate pb-2">
                <Icon name="groups" className="text-[18px]" />
                <span>1. Đại diện hai họ &amp; Mừng cưới</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NHÀ TRAI */}
                <div className="p-4 rounded-xl bg-surface-card border border-border-delicate flex flex-col gap-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-border-delicate/60 pb-2">
                    <span className="font-label-caps text-[11px] uppercase font-bold text-burgundy-wine flex items-center gap-1">
                      <Icon name="man" className="text-[16px]" />
                      Nhà Trai
                    </span>
                    <span className="text-[10px] text-text-muted bg-surface-subtle px-2 py-0.5 rounded font-mono">
                      Chú rể
                    </span>
                  </div>

                  <div>
                    <span className="text-text-muted text-[10px] block uppercase font-medium">Họ &amp; Tên chú rể</span>
                    <span className="font-serif text-base font-bold text-deep-espresso">{order.weddingInfo.groomName || 'Chưa cung cấp'}</span>
                  </div>

                  <div>
                    <span className="text-text-muted text-[10px] block uppercase font-medium">Bố Mẹ / Đại diện Nhà Trai</span>
                    <span className="text-xs font-semibold text-deep-espresso whitespace-pre-line">
                      {order.weddingInfo.groomParents || <span className="text-text-muted italic">Chưa cung cấp</span>}
                    </span>
                  </div>

                  {/* Contact Info (if linked to order) */}
                  <div className="pt-1 flex flex-col gap-1 text-[11px] text-text-muted border-t border-border-delicate/40">
                    <div className="flex items-center justify-between">
                      <span>Số điện thoại / Zalo:</span>
                      <span className="font-mono font-medium text-deep-espresso flex items-center gap-1">
                        {order.weddingInfo.customerPhone || order.customerPhone || 'Chưa có'}
                        {(order.weddingInfo.customerPhone || order.customerPhone) && (
                          <button
                            type="button"
                            onClick={() => handleCopyText(order.weddingInfo?.customerPhone || order.customerPhone || '', 'Đã sao chép SĐT chú rể!')}
                            className="text-gold-foil hover:text-burgundy-wine p-0.5"
                            title="Sao chép SĐT"
                          >
                            <Icon name="content_copy" className="text-[12px]" />
                          </button>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Email nhận thiệp:</span>
                      <span className="font-medium text-deep-espresso truncate max-w-[180px]">
                        {order.weddingInfo.customerEmail || order.customerEmail || 'Chưa có'}
                      </span>
                    </div>
                  </div>

                  {/* Bank Account Groom */}
                  <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs flex flex-col gap-1">
                    <span className="font-bold text-[10px] uppercase text-emerald-900 flex items-center justify-between">
                      <span>Tài khoản mừng cưới (Nhà Trai)</span>
                      <Icon name="account_balance" className="text-[14px]" />
                    </span>
                    {order.weddingInfo.bankAccountGroom ? (
                      <div className="flex flex-col gap-0.5 text-[11px] text-emerald-950">
                        <div className="flex items-center justify-between font-medium">
                          <span>{order.weddingInfo.bankAccountGroom.bankName}</span>
                          <span className="font-mono font-bold flex items-center gap-1">
                            {order.weddingInfo.bankAccountGroom.accountNumber}
                            <button
                              type="button"
                              onClick={() => handleCopyText(order.weddingInfo?.bankAccountGroom?.accountNumber || '', 'Đã sao chép số tài khoản!')}
                              className="text-emerald-700 hover:text-emerald-900 p-0.5"
                              title="Sao chép số tài khoản"
                            >
                              <Icon name="content_copy" className="text-[12px]" />
                            </button>
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-800">
                          Chủ TK: {order.weddingInfo.bankAccountGroom.accountHolder}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-emerald-700/80 italic">Chưa cung cấp tài khoản mừng cưới</span>
                    )}
                  </div>
                </div>

                {/* NHÀ GÁI */}
                <div className="p-4 rounded-xl bg-surface-card border border-border-delicate flex flex-col gap-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-border-delicate/60 pb-2">
                    <span className="font-label-caps text-[11px] uppercase font-bold text-burgundy-wine flex items-center gap-1">
                      <Icon name="woman" className="text-[16px]" />
                      Nhà Gái
                    </span>
                    <span className="text-[10px] text-text-muted bg-surface-subtle px-2 py-0.5 rounded font-mono">
                      Cô dâu
                    </span>
                  </div>

                  <div>
                    <span className="text-text-muted text-[10px] block uppercase font-medium">Họ &amp; Tên cô dâu</span>
                    <span className="font-serif text-base font-bold text-deep-espresso">{order.weddingInfo.brideName || 'Chưa cung cấp'}</span>
                  </div>

                  <div>
                    <span className="text-text-muted text-[10px] block uppercase font-medium">Bố Mẹ / Đại diện Nhà Gái</span>
                    <span className="text-xs font-semibold text-deep-espresso whitespace-pre-line">
                      {order.weddingInfo.brideParents || <span className="text-text-muted italic">Chưa cung cấp</span>}
                    </span>
                  </div>

                  <div className="pt-1 flex flex-col gap-1 text-[11px] text-text-muted border-t border-border-delicate/40">
                    <span className="italic text-[10px]">Đại diện nhà gái phối hợp thiết kế &amp; gửi thiệp</span>
                  </div>

                  {/* Bank Account Bride */}
                  <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs flex flex-col gap-1">
                    <span className="font-bold text-[10px] uppercase text-emerald-900 flex items-center justify-between">
                      <span>Tài khoản mừng cưới (Nhà Gái)</span>
                      <Icon name="account_balance" className="text-[14px]" />
                    </span>
                    {order.weddingInfo.bankAccountBride ? (
                      <div className="flex flex-col gap-0.5 text-[11px] text-emerald-950">
                        <div className="flex items-center justify-between font-medium">
                          <span>{order.weddingInfo.bankAccountBride.bankName}</span>
                          <span className="font-mono font-bold flex items-center gap-1">
                            {order.weddingInfo.bankAccountBride.accountNumber}
                            <button
                              type="button"
                              onClick={() => handleCopyText(order.weddingInfo?.bankAccountBride?.accountNumber || '', 'Đã sao chép số tài khoản!')}
                              className="text-emerald-700 hover:text-emerald-900 p-0.5"
                              title="Sao chép số tài khoản"
                            >
                              <Icon name="content_copy" className="text-[12px]" />
                            </button>
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-800">
                          Chủ TK: {order.weddingInfo.bankAccountBride.accountHolder}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-emerald-700/80 italic">Chưa cung cấp tài khoản mừng cưới</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Thông tin hai họ / gia đình thêm */}
              {order.weddingInfo.familyInfo && (
                <div className="p-3 rounded-lg bg-surface-card border border-border-delicate text-xs flex flex-col gap-1">
                  <span className="text-text-muted text-[10px] uppercase font-bold">Thông tin hai họ / Gia tộc:</span>
                  <p className="text-deep-espresso whitespace-pre-line leading-relaxed">{order.weddingInfo.familyInfo}</p>
                </div>
              )}
            </div>

            {/* THẺ 2: THỜI GIAN, ĐỊA ĐIỂM & RSVP */}
            <div className="p-4 sm:p-5 rounded-xl bg-surface-subtle/50 border border-border-delicate flex flex-col gap-4">
              <div className="flex items-center gap-2 text-burgundy-wine font-serif font-bold text-sm border-b border-border-delicate pb-2">
                <Icon name="event" className="text-[18px]" />
                <span>2. Thời gian, Địa điểm tổ chức &amp; Hạn chót RSVP</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-surface-card border border-border-delicate flex flex-col gap-1">
                  <span className="text-text-muted text-[10px] uppercase font-bold">Giờ đón khách / Khai lễ</span>
                  <span className="font-semibold text-deep-espresso text-sm flex items-center gap-1">
                    <Icon name="schedule" className="text-[16px] text-gold-foil" />
                    {order.weddingInfo.weddingTime || 'Chưa định giờ'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-card border border-border-delicate flex flex-col gap-1">
                  <span className="text-text-muted text-[10px] uppercase font-bold">Ngày tổ chức hôn lễ</span>
                  <span className="font-semibold text-deep-espresso text-sm flex items-center gap-1">
                    <Icon name="calendar_today" className="text-[16px] text-gold-foil" />
                    {formatDate(order.weddingInfo.weddingDate) || String(order.weddingInfo.weddingDate || 'Chưa định ngày')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-card border border-border-delicate flex flex-col gap-1">
                  <span className="text-text-muted text-[10px] uppercase font-bold">Hạn chót xác nhận tham dự (RSVP)</span>
                  <span className="font-semibold text-burgundy-wine text-sm flex items-center gap-1">
                    <Icon name="alarm" className="text-[16px] text-burgundy-wine" />
                    {order.weddingInfo.rsvpDeadline ? (
                      formatDate(order.weddingInfo.rsvpDeadline) || String(order.weddingInfo.rsvpDeadline)
                    ) : (
                      <span className="text-text-muted font-normal italic text-xs">Không đặt hạn chót</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-card border border-border-delicate flex flex-col gap-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="text-text-muted text-[10px] uppercase font-bold block">Tên sảnh / Trung tâm tiệc cưới</span>
                    <span className="font-serif text-sm font-bold text-deep-espresso">{order.weddingInfo.venueName || 'Chưa có tên sảnh'}</span>
                  </div>
                  {order.weddingInfo.googleMapUrl && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyText(order.weddingInfo?.googleMapUrl || '', 'Đã sao chép link Google Maps!')}
                        className="px-2.5 py-1 rounded-md bg-surface-subtle hover:bg-gold-foil/10 text-deep-espresso text-[11px] font-medium border border-border-delicate flex items-center gap-1"
                        title="Sao chép liên kết Maps"
                      >
                        <Icon name="content_copy" className="text-[12px]" />
                        <span>Sao chép link</span>
                      </button>
                      <a
                        href={order.weddingInfo.googleMapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-md bg-burgundy-wine text-white hover:bg-[#851622] text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                      >
                        <Icon name="map" className="text-[13px]" />
                        <span>Mở Google Maps</span>
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border-delicate/60">
                  <span className="text-text-muted text-[10px] uppercase font-bold block">Địa chỉ chi tiết</span>
                  <span className="text-deep-espresso leading-relaxed font-medium">{order.weddingInfo.venueAddress || 'Chưa cung cấp địa chỉ'}</span>
                </div>
              </div>
            </div>

            {/* THẺ 3: NỘI DUNG, LỜI NGỎ, LOVE STORY, TIMELINE & GHI CHÚ DESIGNER */}
            <div className="p-4 sm:p-5 rounded-xl bg-surface-subtle/50 border border-border-delicate flex flex-col gap-4">
              <div className="flex items-center gap-2 text-burgundy-wine font-serif font-bold text-sm border-b border-border-delicate pb-2">
                <Icon name="menu_book" className="text-[18px]" />
                <span>3. Nội dung thiệp, Lời ngỏ &amp; Lịch trình</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Lời ngỏ */}
                <div className="p-3.5 rounded-xl bg-surface-card border border-border-delicate flex flex-col gap-1.5">
                  <span className="text-text-muted text-[10px] uppercase font-bold flex items-center gap-1">
                    <Icon name="format_quote" className="text-[14px] text-gold-foil" />
                    Thông điệp / Lời ngỏ mời cưới
                  </span>
                  {order.weddingInfo.invitationMessage ? (
                    <p className="italic text-deep-espresso leading-relaxed whitespace-pre-line">
                      "{order.weddingInfo.invitationMessage}"
                    </p>
                  ) : (
                    <span className="text-text-muted italic">Khách sử dụng lời ngỏ mặc định của mẫu thiệp</span>
                  )}
                </div>

                {/* Love Story */}
                <div className="p-3.5 rounded-xl bg-surface-card border border-border-delicate flex flex-col gap-1.5">
                  <span className="text-text-muted text-[10px] uppercase font-bold flex items-center gap-1">
                    <Icon name="auto_stories" className="text-[14px] text-gold-foil" />
                    Câu chuyện tình yêu (Love Story)
                  </span>
                  {order.weddingInfo.loveStory ? (
                    <p className="italic text-deep-espresso leading-relaxed whitespace-pre-line">
                      "{order.weddingInfo.loveStory}"
                    </p>
                  ) : (
                    <span className="text-text-muted italic">Khách chưa điền câu chuyện tình yêu</span>
                  )}
                </div>
              </div>

              {/* Timeline lịch trình */}
              <div className="p-3.5 rounded-xl bg-surface-card border border-border-delicate flex flex-col gap-1.5 text-xs">
                <span className="text-text-muted text-[10px] uppercase font-bold flex items-center gap-1">
                  <Icon name="timeline" className="text-[14px] text-gold-foil" />
                  Lịch trình tiệc cưới (Timeline)
                </span>
                {order.weddingInfo.timeline ? (
                  <div className="text-deep-espresso font-mono leading-relaxed whitespace-pre-line p-3 rounded-lg bg-surface-subtle/60 border border-border-delicate/60 text-xs">
                    {order.weddingInfo.timeline}
                  </div>
                ) : (
                  <span className="text-text-muted italic">Chưa nhập lịch trình cụ thể</span>
                )}
              </div>

              {/* Ghi chú riêng cho Designer */}
              {order.weddingInfo.designerNotes && (
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300 flex flex-col gap-1.5 text-xs shadow-2xs">
                  <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs uppercase tracking-wide">
                    <Icon name="assignment" className="text-[16px] text-amber-800" />
                    <span>Ghi chú riêng cho Designer &amp; Kỹ thuật</span>
                  </div>
                  <p className="text-amber-950 leading-relaxed whitespace-pre-line font-medium">
                    {order.weddingInfo.designerNotes}
                  </p>
                </div>
              )}
            </div>

            {/* THẺ 4: ĐA PHƯƠNG TIỆN (NHẠC & VIDEO) */}
            <div className="p-4 sm:p-5 rounded-xl bg-surface-subtle/50 border border-border-delicate flex flex-col gap-4">
              <div className="flex items-center gap-2 text-burgundy-wine font-serif font-bold text-sm border-b border-border-delicate pb-2">
                <Icon name="music_video" className="text-[18px]" />
                <span>4. Âm nhạc &amp; Video cưới</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Âm nhạc */}
                <div className="p-3.5 rounded-xl bg-surface-card border border-border-delicate flex flex-col gap-2">
                  <span className="text-text-muted text-[10px] uppercase font-bold flex items-center gap-1">
                    <Icon name="music_note" className="text-[14px] text-burgundy-wine" />
                    Bài hát yêu thích / Nhạc nền thiệp
                  </span>
                  {order.weddingInfo.musicTitle ? (
                    <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200 text-rose-950 font-semibold flex items-center gap-2">
                      <Icon name="graphic_eq" className="text-[16px] text-rose-700 animate-pulse" />
                      <span>{order.weddingInfo.musicTitle}</span>
                    </div>
                  ) : (
                    <span className="text-text-muted italic">Sử dụng nhạc mặc định của mẫu thiệp</span>
                  )}
                </div>

                {/* Video cưới */}
                <div className="p-3.5 rounded-xl bg-surface-card border border-border-delicate flex flex-col gap-2">
                  <span className="text-text-muted text-[10px] uppercase font-bold flex items-center gap-1">
                    <Icon name="smart_display" className="text-[14px] text-burgundy-wine" />
                    Video cưới (YouTube / Drive)
                  </span>
                  {order.weddingInfo.videoUrl ? (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-subtle border border-border-delicate">
                        <span className="font-mono text-[11px] truncate text-deep-espresso max-w-[200px]">
                          {order.weddingInfo.videoUrl}
                        </span>
                        <a
                          href={order.weddingInfo.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded bg-burgundy-wine text-white text-[10px] font-semibold flex items-center gap-1 shrink-0"
                        >
                          <Icon name="play_arrow" className="text-[12px]" />
                          <span>Mở xem</span>
                        </a>
                      </div>
                      {order.weddingInfo.videoNotes && (
                        <p className="text-[11px] text-text-muted italic">
                          Ghi chú: {order.weddingInfo.videoNotes}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-text-muted italic">Khách không sử dụng video cưới</span>
                  )}
                </div>
              </div>
            </div>

            {/* THẺ 5: ALBUM ẢNH CƯỚI & GHI CHÚ TỪNG ẢNH */}
            <div className="p-4 sm:p-5 rounded-xl bg-surface-subtle/50 border border-border-delicate flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-delicate pb-3">
                <div className="flex items-center gap-2 text-burgundy-wine font-serif font-bold text-sm">
                  <Icon name="photo_library" className="text-[18px] text-gold-foil" />
                  <span>5. Album ảnh cưới khách hàng ({order.weddingInfo.albumPhotos?.length || 0} ảnh)</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={albumFileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleAdminAddPhotos}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => albumFileInputRef.current?.click()}
                    disabled={isUploadingAlbum}
                    className="px-3 py-1.5 rounded-lg bg-surface-card hover:bg-gold-foil/10 text-deep-espresso hover:text-burgundy-wine border border-border-delicate text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors disabled:opacity-50"
                    title="Tải thêm ảnh vào album cho khách"
                  >
                    <Icon name={isUploadingAlbum ? "sync" : "add_photo_alternate"} className={`text-[15px] ${isUploadingAlbum ? 'animate-spin' : ''}`} />
                    <span>{isUploadingAlbum ? 'Đang tải...' : '+ Thêm ảnh'}</span>
                  </button>

                  {order.weddingInfo.albumPhotos && order.weddingInfo.albumPhotos.length > 0 && (
                    <button
                      type="button"
                      onClick={() => downloadAllImages(order.weddingInfo!.albumPhotos!, `anh-cuoi-${order.id}`)}
                      className="px-3 py-1.5 rounded-lg bg-burgundy-wine text-white hover:bg-[#851622] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                      title="Tải tất cả các ảnh trong album về máy tính"
                    >
                      <Icon name="download_for_offline" className="text-[15px]" />
                      <span>Tải tất cả ({order.weddingInfo.albumPhotos.length})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Thư mục Google Drive nếu có */}
              {order.weddingInfo.albumDriveUrl && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Icon name="folder_shared" className="text-[22px] text-blue-700" />
                    <div>
                      <span className="font-semibold text-blue-950 block">Thư mục Google Drive ảnh chất lượng cao</span>
                      <span className="text-[11px] text-blue-800/80 truncate max-w-[280px] sm:max-w-md block">
                        {order.weddingInfo.albumDriveUrl}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyText(order.weddingInfo?.albumDriveUrl || '', 'Đã sao chép link Google Drive!')}
                      className="px-2.5 py-1.5 rounded-lg bg-white text-blue-900 border border-blue-300 font-semibold text-xs flex items-center gap-1 hover:bg-blue-50"
                      title="Sao chép liên kết"
                    >
                      <Icon name="content_copy" className="text-[13px]" />
                      <span className="hidden sm:inline">Sao chép</span>
                    </button>
                    <a
                      href={order.weddingInfo.albumDriveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1 transition-colors shrink-0 shadow-2xs text-xs"
                    >
                      <span>Mở Drive</span>
                      <Icon name="open_in_new" className="text-[14px]" />
                    </a>
                  </div>
                </div>
              )}

              {/* Grid ảnh */}
              {order.weddingInfo.albumPhotos && order.weddingInfo.albumPhotos.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {order.weddingInfo.albumPhotos.map((url, i) => {
                      const isBlob = typeof url === 'string' && url.startsWith('blob:');
                      const noteItem = order.weddingInfo?.albumPhotoNotes?.[i];
                      const photoNote = typeof noteItem === 'string' ? noteItem : noteItem?.note;
                      const photoName = typeof noteItem === 'object' ? noteItem?.name : undefined;
                      const photoSize = typeof noteItem === 'object' ? noteItem?.size : undefined;

                      return (
                        <AlbumPhotoCard
                          key={`${order.id}-${i}-${url.slice(0, 30)}`}
                          url={url}
                          index={i}
                          orderId={order.id}
                          isBlob={isBlob}
                          note={photoNote}
                          name={photoName}
                          size={photoSize}
                          onPreview={() => setSelectedPhotoPreview({
                            url,
                            note: photoNote,
                            name: photoName,
                            size: photoSize,
                            index: i,
                          })}
                          onDelete={() => handleAdminDeletePhoto(i)}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[11px] text-text-muted text-right pt-1">
                    Bấm vào từng ảnh để xem phóng to kèm ghi chú của khách, tải về hoặc xoá bớt ảnh.
                  </span>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-text-muted bg-surface-card rounded-xl border border-dashed border-border-delicate flex flex-col items-center gap-2">
                  <Icon name="add_photo_alternate" className="text-[32px] text-text-muted/60" />
                  <span>Khách hàng chưa tải ảnh cưới lên hệ thống.</span>
                  <button
                    type="button"
                    onClick={() => albumFileInputRef.current?.click()}
                    disabled={isUploadingAlbum}
                    className="mt-1 px-3 py-1.5 rounded-lg bg-burgundy-wine text-white hover:bg-[#851622] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Icon name="upload" className="text-[14px]" />
                    <span>+ Tải ảnh lên cho đơn hàng này</span>
                  </button>
                </div>
              )}
            </div>

            {/* THẺ 6: YÊU CẦU CHỈNH SỬA TỪ KHÁCH HÀNG (REVISION REQUESTS) */}
            {order.revisionRequests && order.revisionRequests.length > 0 && (
              <div className="p-4 sm:p-5 rounded-xl bg-purple-50/50 border border-purple-200 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-purple-200/80 pb-3">
                  <div className="flex items-center gap-2 text-purple-950 font-serif font-bold text-sm">
                    <Icon name="rate_review" className="text-[18px] text-purple-700" />
                    <span>6. Yêu cầu chỉnh sửa từ khách hàng ({order.revisionRequests.length})</span>
                  </div>
                  <span className="text-xs font-medium text-purple-800">
                    {order.revisionRequests.filter(r => r.status === 'pending').length} đang chờ xử lý
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {order.revisionRequests.map((rev, revIdx) => {
                    const isPending = rev.status === 'pending';
                    return (
                      <div
                        key={rev.id || revIdx}
                        className={`p-3.5 rounded-xl border text-xs flex flex-col gap-2.5 transition-all ${
                          isPending
                            ? 'bg-white border-purple-300 shadow-2xs'
                            : 'bg-white/60 border-border-delicate opacity-85'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-[11px] text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                              #{revIdx + 1}
                            </span>
                            <span className="text-[11px] text-text-muted">
                              {rev.createdAt ? formatDateTime(rev.createdAt) : ''}
                            </span>
                            {/* Badges for topics */}
                            {rev.topics?.map((topic, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2 py-0.5 rounded-full bg-surface-subtle border border-border-delicate text-[10px] font-semibold text-deep-espresso"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            {isPending ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold flex items-center gap-1">
                                <Icon name="hourglass_top" className="text-[12px]" />
                                Đang chờ Admin sửa
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold flex items-center gap-1">
                                <Icon name="check_circle" className="text-[12px]" />
                                Đã giải quyết {rev.resolvedAt ? `(${formatDate(rev.resolvedAt)})` : ''}
                              </span>
                            )}

                            {isPending && (
                              <button
                                type="button"
                                onClick={() => {
                                  adminResolveRevision(order.id, rev.id);
                                  setSendSuccessMessage(`Đã đánh dấu hoàn thành yêu cầu chỉnh sửa #${revIdx + 1}`);
                                  setTimeout(() => setSendSuccessMessage(null), 3000);
                                }}
                                className="px-2.5 py-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] flex items-center gap-1 shadow-2xs transition-colors"
                              >
                                <Icon name="done_all" className="text-[13px]" />
                                <span>Đánh dấu xong</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-deep-espresso whitespace-pre-line leading-relaxed font-medium bg-surface-subtle/50 p-2.5 rounded-lg border border-border-delicate/40">
                          {rev.content || (rev as any).description}
                        </p>

                        {rev.referenceUrl && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="text-text-muted">Link tham khảo:</span>
                            <a
                              href={rev.referenceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-burgundy-wine font-semibold hover:underline flex items-center gap-1"
                            >
                              <span>{rev.referenceUrl}</span>
                              <Icon name="open_in_new" className="text-[12px]" />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-text-muted bg-surface-subtle/40 rounded-xl border border-dashed border-border-delicate flex flex-col items-center gap-3">
            <Icon name="edit_note" className="text-[32px] text-text-muted/60" />
            <span>Khách hàng chưa gửi biểu mẫu thông tin lễ cưới.</span>
            <button
              type="button"
              onClick={() => setIsEditWeddingInfoOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-burgundy-wine text-white hover:bg-[#851622] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Icon name="add" className="text-[15px]" />
              <span>+ Nhập thông tin thay cho khách</span>
            </button>
          </div>
        )}
      </section>

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
          {/* Hidden native file input placed outside dropzone */}
          <input
            type="file"
            ref={fileInputRef}
            onClick={(e) => {
              (e.target as HTMLInputElement).value = '';
            }}
            onChange={handleFileInputChange}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />

          {/* Box 1: Tải lên / Cập nhật file Excel */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-burgundy-wine bg-burgundy-wine/5 ring-4 ring-burgundy-wine/10'
                : 'border-border-delicate bg-surface-subtle/40 hover:bg-surface-cream hover:border-burgundy-wine/50'
            }`}
          >
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
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="mt-1 px-4 py-1.5 rounded-full bg-surface-card border border-border-delicate text-deep-espresso text-xs font-semibold hover:bg-surface-subtle shadow-2xs transition-colors"
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

      {/* 7. LIGHTBOX MODAL FOR PHOTO PREVIEW & DOWNLOAD */}
      {selectedPhotoPreview && (
        <div
          onClick={() => setSelectedPhotoPreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[92vh] rounded-2xl overflow-hidden shadow-2xl bg-black/95 flex flex-col cursor-default border border-white/10 w-full"
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-black/75 text-white border-b border-white/10 z-10 flex-wrap gap-2">
              <span className="text-xs font-medium text-white/90 flex items-center gap-1.5 flex-wrap">
                <Icon name="photo" className="text-[16px] text-gold-foil" />
                <span>
                  Xem chi tiết ảnh cưới {selectedPhotoPreview.index !== undefined ? `(#${selectedPhotoPreview.index + 1})` : ''}
                </span>
                {selectedPhotoPreview.name && (
                  <span className="text-white/60 text-[11px] truncate max-w-[200px]">
                    • {selectedPhotoPreview.name}
                  </span>
                )}
                {selectedPhotoPreview.size && (
                  <span className="text-white/50 text-[10px]">
                    ({selectedPhotoPreview.size})
                  </span>
                )}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    downloadImage(
                      selectedPhotoPreview.url,
                      `anh-cuoi-${order.id}-${(selectedPhotoPreview.index ?? 0) + 1}.jpg`
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Tải ảnh này về máy tính"
                >
                  <Icon name="file_download" className="text-[16px]" />
                  <span>Tải ảnh về máy</span>
                </button>

                <a
                  href={selectedPhotoPreview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
                  title="Mở ảnh trong tab mới"
                >
                  <Icon name="open_in_new" className="text-[16px]" />
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedPhotoPreview(null)}
                  className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors ml-1"
                  title="Đóng (Esc)"
                >
                  <Icon name="close" className="text-[18px]" />
                </button>
              </div>
            </div>

            {/* Note banner if customer added a note for this photo */}
            {selectedPhotoPreview.note && (
              <div className="px-4 py-2.5 bg-amber-500/20 text-amber-200 border-b border-amber-400/20 text-xs flex items-center gap-2">
                <Icon name="push_pin" className="text-[16px] text-amber-300 shrink-0" />
                <span>
                  <strong>Ghi chú của khách:</strong> {selectedPhotoPreview.note}
                </span>
              </div>
            )}

            {/* Photo Container */}
            <div className="flex items-center justify-center p-3 overflow-hidden max-h-[calc(90vh-80px)]">
              <img
                src={selectedPhotoPreview.url}
                alt={selectedPhotoPreview.note || 'Ảnh cưới xem lớn'}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL CHỈNH SỬA THÔNG TIN TIỆC CƯỚI CHO ADMIN */}
      <WeddingInfoModal
        isOpen={isEditWeddingInfoOpen}
        onClose={() => setIsEditWeddingInfoOpen(false)}
        initialInfo={order.weddingInfo}
        onSave={(data) => {
          adminUpdateWeddingInfo(order.id, data);
          setSendSuccessMessage('Đã cập nhật thành công thông tin tiệc cưới của khách hàng!');
          setTimeout(() => setSendSuccessMessage(null), 4000);
        }}
      />
    </div>
  );
};
