import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { ORDER_STAGES } from '../../../utils/constants';
import { OrderStatusStage } from '../../../types/order';
import { RevisionModal } from '../components/RevisionModal';
import { WeddingInfoModal } from '../components/WeddingInfoModal';
import { PhotoAlbumModal } from '../components/PhotoAlbumModal';
import {
  useOrder,
  customerSubmitPaymentConfirmation,
  customerSubmitWeddingInfo,
  customerSubmitAlbum,
  customerSubmitRevision,
  customerCompleteDataSubmission,
  customerApproveDesign,
} from '../../../mocks/orderStore';
import { WeddingInformation } from '../../../types/order';
import { formatCurrency } from '../../../utils/formatters';
import { useZaloSupportUrl } from '../../../mocks/cmsStore';
import { useAuth } from '../../../mocks/authStore';

export const CustomerOrderDetailPage: React.FC = () => {
  const zaloUrl = useZaloSupportUrl();
  const { user } = useAuth();
  const { orderId } = useParams<{ orderId: string }>();
  const activeOrderId = orderId || 'NCT01';
  const order = useOrder(activeOrderId);

  // Authorization check: User can only view their own order
  const isOwner =
    !order ||
    user?.role === 'admin' ||
    !order.userId ||
    order.userId === user?.id ||
    order.userId.startsWith('guest-') ||
    (user?.id === '01' && activeOrderId === 'NCT01');

  // Fallback if not loaded yet
  const currentOrder = order || {
    id: activeOrderId,
    customerName: 'Nguyễn Minh Anh & Trần Đức Minh',
    customerPhone: '0982 123 456',
    customerEmail: 'minhanh.wedding@gmail.com',
    templateId: 'tpl-minh-anh',
    templateName: 'Minh Anh & Tuấn Kiệt (Suite Cao Cấp)',
    category: 'premium' as const,
    price: 79000,
    paymentStatus: 'unpaid' as const,
    orderStatus: 'pending_payment' as const,
    paymentMethod: 'vietqr' as const,
    currentStage: 1 as OrderStatusStage,
    createdAt: '2026-09-08T19:15:00Z',
    updatedAt: '2026-09-08T22:00:00Z',
  };

  // Real order stage
  const effectiveStage = currentOrder.currentStage;
  const stageMeta = ORDER_STAGES[effectiveStage];

  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isWeddingInfoModalOpen, setIsWeddingInfoModalOpen] = useState(false);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCustomerPaymentSubmit = () => {
    customerSubmitPaymentConfirmation(activeOrderId, {
      note: 'Khách hàng gửi yêu cầu đối soát sau khi quét mã QR',
      proof: 'vietqr_proof_nct01.jpg',
    });
  };

  const handleWeddingInfoSave = (data: Partial<WeddingInformation>) => {
    customerSubmitWeddingInfo(activeOrderId, data);
  };

  const handleAlbumSave = (photos: string[]) => {
    customerSubmitAlbum(activeOrderId, photos);
  };

  const handleRevisionSubmit = (data: { topics: string[]; content: string; referenceUrl?: string }) => {
    customerSubmitRevision(activeOrderId, data);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('https://nhacotiec.vn/invitation/minhanh-ducminh');
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[50vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-700 flex items-center justify-center shadow-xs">
          <Icon name="lock" className="text-[32px]" />
        </div>
        <h2 className="font-serif text-xl font-bold text-deep-espresso">
          Không Có Quyền Xem Đơn Hàng Này
        </h2>
        <p className="text-xs text-text-muted max-w-sm leading-relaxed">
          Đơn hàng #{activeOrderId} thuộc quyền sở hữu của một tài khoản khác. Bạn chỉ có quyền truy cập đơn hàng của chính mình.
        </p>
        <Link
          to="/dashboard"
          className="px-6 py-2.5 rounded-full bg-burgundy-wine text-white text-xs font-semibold hover:bg-[#851622] transition-colors shadow-xs"
        >
          Về danh sách đơn hàng của tôi
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full px-4 gap-5 text-deep-espresso pb-16 pt-3">
      {/* 1. Sub-Header Navigation */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between -mx-4 px-4 py-2.5 bg-[#4a0d11] text-white shadow-xs">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-white hover:text-rose-200 text-xs font-medium transition-colors"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span>Quay lại Tổng quan Cổng Khách Hàng</span>
          </Link>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <div>
            <h1 className="font-serif text-xl font-bold text-deep-espresso">
              Chi tiết đơn hàng
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Theo dõi hành trình hoàn thiện thiệp cưới theo 8 bước chuẩn
            </p>
          </div>
          <div className="flex items-center px-2.5 py-1 rounded-lg bg-surface-subtle border border-border-delicate">
            <span className="font-serif text-base font-bold text-burgundy-wine">
              #{currentOrder.id}
            </span>
          </div>
        </div>
      </div>

      {/* 3. ORDER SUMMARY CARD */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-card p-4 shadow-sm border border-border-delicate">
        <div className="flex gap-4 items-center">
          <div className="w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-surface-subtle relative shadow-xs">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBN-lETE9cSwp9Q4ZJO66RanMH7oVSO-tOR2U7E7RhhJ3zowI4eTrMcwcXqtRWErE4Gh-6XXrud9EmmrxBcjgVGw2yBsmE5pD9xl82T41rXVn21ISVBAmMPuujD5Uu1ZpYBqwieLGPAjwU4rMvVmu7bt62f0t6oGKqKWv47eg2AUDJplzQwcJjBa-xVVFj6CIo2xjNVAyMgxKNsGI13GETmHdXroKlRNk9QRjGF031UfdBsotq9FcGD"
              alt="Thiệp cưới mockup"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 left-1.5 text-[9px] font-label-caps uppercase text-surface-cream font-medium bg-deep-espresso/60 px-1 rounded">
              Cao cấp
            </span>
          </div>

          <div className="flex flex-col justify-between flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <div>
                <span className="font-label-caps text-[10px] text-gold-foil uppercase tracking-wider font-bold">
                  Mẫu Thiệp Điện Tử
                </span>
                <h2 className="font-serif text-base font-bold text-deep-espresso truncate">
                  {currentOrder.customerName}
                </h2>
              </div>
              {/* Payment Status Pill */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-label-caps font-semibold whitespace-nowrap border ${
                  currentOrder.paymentStatus === 'paid'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : currentOrder.paymentStatus === 'pending_confirmation'
                    ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold animate-pulse'
                    : currentOrder.paymentStatus === 'rejected'
                    ? 'bg-rose-100 text-rose-900 border-rose-300 font-bold'
                    : 'bg-rose-50 text-burgundy-wine border-rose-200'
                }`}
              >
                {currentOrder.paymentStatus === 'paid'
                  ? 'Đã thanh toán'
                  : currentOrder.paymentStatus === 'pending_confirmation'
                  ? 'Chờ xác nhận thanh toán'
                  : currentOrder.paymentStatus === 'rejected'
                  ? 'Cần kiểm tra lại'
                  : 'Chờ thanh toán'}
              </span>
            </div>

            <div className="mt-2.5 pt-2 flex items-center justify-between bg-surface-subtle/60 px-2.5 py-1.5 rounded-lg border border-border-delicate text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] text-text-muted">Tổng chi phí</span>
                <span className="font-serif font-bold text-deep-espresso">
                  {formatCurrency(currentOrder.price)}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-text-muted">Ngày khởi tạo</span>
                <span className="text-[11px] text-deep-espresso">07/09/2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CURRENT STATUS HERO CARD (Logic strictly aligned with user specification) */}
      <div className="relative rounded-2xl bg-surface-cream p-5 shadow-sm border border-border-delicate overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-burgundy-wine" />

        <div className="flex flex-col gap-3 pt-1">
          {/* Header of hero card */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Icon
                name={
                  currentOrder.paymentStatus === 'pending_confirmation' && effectiveStage === 1
                    ? 'hourglass_top'
                    : stageMeta.icon
                }
                className="text-[20px] text-burgundy-wine"
              />
              <span className="font-label-caps text-xs uppercase tracking-widest text-burgundy-wine font-bold">
                Trạng thái hiện tại
              </span>
            </div>
            <span className="text-[11px] font-label-caps px-2.5 py-0.5 rounded-full bg-surface-subtle text-burgundy-wine font-semibold border border-border-delicate">
              Bước {effectiveStage} / 8 • {stageMeta.name}
            </span>
          </div>

          {/* Conditional Content based on Payment Flow */}
          {effectiveStage === 1 && currentOrder.paymentStatus === 'pending_confirmation' ? (
            /* SPECIAL PAYMENT FLOW: Customer submitted payment -> "Đang chờ xác nhận thanh toán" */
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 border border-amber-300 text-xs font-bold w-fit">
                <Icon name="pending" className="text-[16px] text-amber-700 animate-spin" />
                <span>Đang chờ xác nhận thanh toán</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-deep-espresso">
                Thanh toán đã được gửi
              </h3>
              <p className="text-xs sm:text-sm text-burgundy-wine font-medium leading-relaxed">
                Nhà Có Tiệc đang kiểm tra giao dịch của bạn.
              </p>
              <div className="p-3.5 rounded-xl bg-surface-subtle/80 border border-border-delicate text-xs text-text-muted leading-relaxed flex flex-col gap-1.5">
                <div className="flex items-center gap-1 text-deep-espresso font-semibold">
                  <Icon name="info" className="text-[16px] text-gold-foil" />
                  <span>Quy trình đối soát an toàn:</span>
                </div>
                <span>
                  Giao dịch chuyển khoản của bạn đã được tiếp nhận. Đội ngũ quản trị Studio đang kiểm tra đối chiếu Napas. Sau khi Admin nhấn xác nhận, đơn hàng sẽ chính thức chuyển sang trạng thái <strong>Đã thanh toán</strong> để bạn bắt đầu điền thông tin tiệc cưới.
                </span>
                <span className="text-[11px] text-burgundy-wine font-semibold pt-1">
                  * Khách hàng không thể tự xác nhận thanh toán.
                </span>
              </div>

              {/* Support action */}
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={zaloUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-full bg-surface-card hover:bg-surface-subtle text-deep-espresso border border-border-delicate text-xs font-semibold shadow-xs transition-colors"
                >
                  <Icon name="chat" className="text-[18px] text-burgundy-wine" />
                  <span>Liên hệ Zalo hỗ trợ đối soát thanh toán 24/7</span>
                </a>
              </div>
            </div>
          ) : effectiveStage === 1 && currentOrder.paymentStatus === 'rejected' ? (
            /* SPECIAL REJECTED FLOW */
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-xs font-bold w-fit">
                <Icon name="error" className="text-[16px]" />
                <span>Yêu cầu kiểm tra lại thanh toán</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-deep-espresso">
                Giao dịch chưa khớp thông tin
              </h3>
              <p className="text-xs sm:text-sm text-deep-espresso/80 leading-relaxed">
                {currentOrder.paymentNote || 'Vui lòng kiểm tra lại số tài khoản hoặc liên hệ Zalo chăm sóc khách hàng.'}
              </p>
              <div className="pt-2 flex gap-2">
                <Link
                  to={`/thanh-toan/${currentOrder.id}`}
                  className="flex-1 h-11 flex items-center justify-center gap-1.5 rounded-full bg-burgundy-wine text-white text-xs font-semibold shadow-md"
                >
                  <Icon name="qr_code_scanner" className="text-[18px]" />
                  <span>Quét lại mã QR chuyển khoản</span>
                </Link>
                <a
                  href={zaloUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 h-11 flex items-center justify-center gap-1.5 rounded-full bg-surface-subtle text-deep-espresso text-xs font-semibold border border-border-delicate"
                >
                  <Icon name="chat" className="text-[18px]" />
                  <span>Hỗ trợ Zalo</span>
                </a>
              </div>
            </div>
          ) : (
            /* STANDARD 8-STAGE HERO DISPLAY */
            <div className="flex flex-col gap-1">
              <h3 className="font-serif text-xl font-bold text-deep-espresso">
                {stageMeta.title}
              </h3>
              <p className="text-xs sm:text-sm text-deep-espresso/80 leading-relaxed">
                {stageMeta.message}
              </p>

              {/* Dynamic Action Buttons */}
              <div className="pt-3 flex flex-col gap-2">
                {effectiveStage === 1 && (
                  <div className="flex flex-col gap-2">
                    <Link
                      to={`/thanh-toan/${currentOrder.id}`}
                      className="w-full h-11 flex items-center justify-center gap-2 rounded-full bg-burgundy-wine text-white text-xs font-semibold shadow-md hover:bg-[#851622] transition-colors"
                    >
                      <Icon name="account_balance_wallet" className="text-[18px]" />
                      <span>Thanh toán chuyển khoản ({formatCurrency(currentOrder.price)})</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleCustomerPaymentSubmit}
                      className="w-full h-10 flex items-center justify-center gap-1.5 rounded-full bg-surface-card hover:bg-surface-subtle text-deep-espresso border border-border-delicate text-xs font-medium transition-colors"
                    >
                      <Icon name="check_circle" className="text-[16px] text-emerald-700" />
                      <span>Tôi đã hoàn tất chuyển khoản</span>
                    </button>
                  </div>
                )}

                {effectiveStage === 2 && (
                  <div className="flex flex-col gap-2.5">
                    {currentOrder.paymentStatus !== 'paid' ? (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                        <Icon name="lock" className="text-[18px] text-amber-700 flex-shrink-0" />
                        <span>Chức năng điền thông tin và tải album ảnh chỉ mở sau khi Admin xác nhận thanh toán.</span>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setIsWeddingInfoModalOpen(true)}
                            className="h-11 flex items-center justify-center gap-2 rounded-full bg-deep-espresso text-white text-xs font-semibold shadow-sm hover:bg-black transition-colors"
                          >
                            <Icon name="edit_note" className="text-[18px] text-rose-200" />
                            <span>
                              {currentOrder.weddingInfoSubmitted ? 'Sửa thông tin lễ cưới' : 'Điền thông tin lễ cưới'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAlbumModalOpen(true)}
                            className="h-11 flex items-center justify-center gap-2 rounded-full bg-burgundy-wine text-white text-xs font-semibold shadow-sm hover:bg-[#851622] transition-colors"
                          >
                            <Icon name="photo_library" className="text-[18px] text-amber-200" />
                            <span>
                              {currentOrder.albumSubmitted
                                ? `Album ảnh (${currentOrder.weddingInfo?.albumPhotoCount || currentOrder.weddingInfo?.albumPhotos?.length || 0} ảnh)`
                                : 'Tải album ảnh'}
                            </span>
                          </button>
                        </div>
                        {(currentOrder.weddingInfoSubmitted || currentOrder.albumSubmitted) && (
                          <div className="flex flex-col gap-2 pt-0.5">
                            <div className="flex flex-wrap items-center gap-2 text-[11px]">
                              {currentOrder.weddingInfoSubmitted && (
                                <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
                                  <Icon name="check_circle" className="text-[14px]" />
                                  Đã lưu thông tin lễ cưới
                                </span>
                              )}
                              {currentOrder.albumSubmitted && (
                                <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
                                  <Icon name="check_circle" className="text-[14px]" />
                                  Đã tải {currentOrder.weddingInfo?.albumPhotoCount || currentOrder.weddingInfo?.albumPhotos?.length || 0} ảnh cưới
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => customerCompleteDataSubmission(activeOrderId)}
                              className="w-full h-11 flex items-center justify-center gap-2 rounded-full bg-burgundy-wine text-white text-xs font-semibold shadow-md hover:bg-[#851622] active:scale-95 transition-all mt-1"
                            >
                              <Icon name="send" className="text-[16px]" />
                              <span>Xác nhận hoàn tất &amp; Gửi cho Studio thiết kế</span>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {effectiveStage === 3 && (
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsWeddingInfoModalOpen(true)}
                        className="h-11 flex items-center justify-center gap-1.5 rounded-full bg-surface-subtle text-deep-espresso text-xs font-medium border border-border-delicate hover:bg-surface-cream transition-colors"
                      >
                        <Icon name="visibility" className="text-[16px]" />
                        <span>Xem / Sửa thông tin lễ cưới</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAlbumModalOpen(true)}
                        className="h-11 flex items-center justify-center gap-1.5 rounded-full bg-surface-subtle text-deep-espresso text-xs font-medium border border-border-delicate hover:bg-surface-cream transition-colors"
                      >
                        <Icon name="photo_library" className="text-[16px]" />
                        <span>Album ảnh ({currentOrder.weddingInfo?.albumPhotoCount || currentOrder.weddingInfo?.albumPhotos?.length || 0} ảnh)</span>
                      </button>
                    </div>
                    <a
                      href={zaloUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full h-10 flex items-center justify-center gap-1.5 rounded-full bg-burgundy-wine text-white text-xs font-semibold"
                    >
                      <Icon name="chat" className="text-[16px]" />
                      <span>Nhắn qua Zalo với Nhà Có Tiệc</span>
                    </a>
                  </div>
                )}

                {effectiveStage === 4 && (
                  <a
                    href={zaloUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full h-11 flex items-center justify-center gap-2 rounded-full bg-burgundy-wine text-white text-xs font-semibold shadow-md"
                  >
                    <Icon name="forum" className="text-[18px]" />
                    <span>Trao đổi cùng Designer Nhà Có Tiệc</span>
                  </a>
                )}

                {effectiveStage === 5 && (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => customerApproveDesign(activeOrderId)}
                      className="w-full h-11 flex items-center justify-center gap-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-md active:scale-95 transition-transform"
                    >
                      <Icon name="check_circle" className="text-[18px]" />
                      <span>Duyệt bản thiết kế này (Hoàn tất thiệp cưới)</span>
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <a
                        href={currentOrder.invitationUrl || "https://nhacotiec.vn/demo/minh-anh"}
                        target="_blank"
                        rel="noreferrer"
                        className="h-11 flex items-center justify-center gap-2 rounded-full bg-surface-card border border-burgundy-wine/40 text-deep-espresso text-xs font-semibold hover:bg-surface-subtle transition-colors"
                      >
                        <Icon name="visibility" className="text-[18px] text-burgundy-wine" />
                        <span>Xem bản duyệt thiết kế</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setIsRevisionModalOpen(true)}
                        className="h-11 flex items-center justify-center gap-2 rounded-full bg-surface-subtle text-deep-espresso text-xs font-semibold border border-border-delicate hover:bg-surface-cream transition-colors"
                      >
                        <Icon name="rate_review" className="text-[18px] text-burgundy-wine" />
                        <span>Yêu cầu chỉnh sửa thêm</span>
                      </button>
                    </div>
                  </div>
                )}

                {effectiveStage === 6 && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setIsRevisionModalOpen(true)}
                      className="w-full h-11 flex items-center justify-center gap-2 rounded-full bg-burgundy-wine text-white text-xs font-semibold shadow-md"
                    >
                      <Icon name="chat" className="text-[18px]" />
                      <span>Gửi thêm ghi chú chỉnh sửa</span>
                    </button>
                  </div>
                )}

                {effectiveStage === 7 && (
                  <div className="flex flex-col gap-2">
                    <a
                      href="https://nhacotiec.vn/invitation/minhanh-ducminh"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full h-11 flex items-center justify-center gap-2 rounded-full bg-burgundy-wine text-white text-xs font-semibold shadow-md"
                    >
                      <Icon name="open_in_new" className="text-[18px]" />
                      <span>Xem thiệp cưới chính thức</span>
                    </a>
                    <button
                      onClick={handleCopyLink}
                      className="w-full h-11 flex items-center justify-center gap-2 rounded-full bg-surface-subtle text-deep-espresso text-xs font-semibold border border-border-delicate hover:bg-surface-cream"
                    >
                      <Icon name="content_copy" className="text-[18px]" />
                      <span>{copiedLink ? 'Đã sao chép liên kết thiệp!' : 'Sao chép liên kết thiệp'}</span>
                    </button>
                  </div>
                )}

                {effectiveStage === 8 && (
                  <div className="p-3 rounded-xl bg-surface-subtle border border-border-delicate text-center text-xs text-text-muted">
                    Kỷ niệm ngày cưới đã được lưu trữ an toàn. Bạn có thể gia hạn bất cứ lúc nào.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4.5 SUBMITTED WEDDING INFO & ALBUM SUMMARY */}
      {(currentOrder.weddingInfoSubmitted || currentOrder.albumSubmitted || currentOrder.weddingInfo) && (
        <div className="rounded-2xl bg-surface-card p-4 shadow-xs border border-border-delicate flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-border-delicate">
            <div className="flex items-center gap-2">
              <Icon name="favorite" className="text-[20px] text-burgundy-wine" />
              <h3 className="font-serif text-base font-bold text-deep-espresso">
                Dữ liệu lễ cưới &amp; Album đã gửi
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              {currentOrder.weddingInfoSubmitted && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-label-caps font-bold">
                  Thông tin: Đã gửi
                </span>
              )}
              {currentOrder.albumSubmitted && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-label-caps font-bold">
                  Album: {currentOrder.weddingInfo?.albumPhotoCount || currentOrder.weddingInfo?.albumPhotos?.length || 0} ảnh
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-surface-subtle/60 border border-border-delicate">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Cặp đôi</span>
              <span className="font-semibold text-deep-espresso">
                {currentOrder.weddingInfo?.groomName || 'Trần Đức Minh'} &amp; {currentOrder.weddingInfo?.brideName || 'Nguyễn Minh Anh'}
              </span>
              <span className="text-[11px] text-text-muted">
                {currentOrder.weddingInfo?.weddingTime || '18:00'} • {currentOrder.weddingInfo?.weddingDate || '28/12/2026'}
              </span>
            </div>

            <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-surface-subtle/60 border border-border-delicate">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Địa điểm</span>
              <span className="font-semibold text-deep-espresso">
                {currentOrder.weddingInfo?.venueName || 'GEM Center'}
              </span>
              <span className="text-[11px] text-text-muted truncate">
                {currentOrder.weddingInfo?.venueAddress || 'Số 8 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM'}
              </span>
            </div>
          </div>

          {currentOrder.weddingInfo?.albumPhotos && currentOrder.weddingInfo.albumPhotos.length > 0 && (
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-text-muted">Ảnh trong album:</span>
                <span className="text-burgundy-wine font-semibold">{currentOrder.weddingInfo.albumPhotos.length} ảnh</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                {currentOrder.weddingInfo.albumPhotos.map((url, i) => (
                  <div key={i} className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-border-delicate">
                    <img src={url} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsWeddingInfoModalOpen(true)}
              className="px-3 py-1.5 rounded-full bg-surface-subtle hover:bg-surface-cream text-deep-espresso text-xs font-medium border border-border-delicate transition-colors"
            >
              Chỉnh sửa thông tin
            </button>
            <button
              type="button"
              onClick={() => setIsAlbumModalOpen(true)}
              className="px-3 py-1.5 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold transition-colors"
            >
              Quản lý album ảnh
            </button>
          </div>
        </div>
      )}

      {/* 5. REVISION HISTORY CARD (Hiển thị khi ở Stage 6 hoặc có lịch sử) */}
      {(effectiveStage === 6 || (currentOrder.revisionRequests && currentOrder.revisionRequests.length > 0)) && (
        <div className="flex flex-col rounded-2xl bg-surface-card p-4 shadow-xs border border-border-delicate gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-border-delicate">
            <div className="flex items-center gap-2">
              <Icon name="history_edu" className="text-[20px] text-burgundy-wine" />
              <h3 className="font-serif text-base font-bold text-deep-espresso">
                Lịch sử yêu cầu chỉnh sửa
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-burgundy-wine/10 text-burgundy-wine text-[10px] font-label-caps font-bold">
              Đang xử lý
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {(currentOrder.revisionRequests || []).map((rev) => (
              <div key={rev.id} className="flex flex-col gap-2 p-3 rounded-xl bg-surface-subtle/50 border border-border-delicate text-xs">
                <div className="flex items-center justify-between text-text-muted text-[11px]">
                  <span>Thời gian gửi:</span>
                  <span className="font-semibold text-deep-espresso">Vừa xong</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {rev.topics.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-surface-card text-[10px] text-burgundy-wine border border-border-delicate font-medium">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="italic text-deep-espresso bg-surface-card p-2.5 rounded-lg border border-border-delicate leading-relaxed">
                  "{rev.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. OFFICIAL 8-STAGE VERTICAL TIMELINE */}
      <div className="flex flex-col gap-3 p-5 rounded-2xl bg-surface-card shadow-xs border border-border-delicate">
        <div className="flex items-center justify-between pb-2 border-b border-border-delicate">
          <div className="flex items-center gap-2">
            <Icon name="route" className="text-[20px] text-deep-espresso" />
            <h3 className="font-serif text-base font-bold text-deep-espresso">
              Tiến trình đơn hàng
            </h3>
          </div>
          <span className="font-label-caps text-[10px] text-text-muted uppercase font-bold">
            Quy chuẩn 8 bước
          </span>
        </div>

        {/* Timeline Items List: 8 steps with clear Lock / Active / Completed states */}
        <div className="relative flex flex-col pl-3 pt-2">
          {([1, 2, 3, 4, 5, 6, 7, 8] as OrderStatusStage[]).map((stepNum) => {
            const isCompleted = stepNum < effectiveStage;
            const isCurrent = stepNum === effectiveStage;
            const isLocked = stepNum > effectiveStage;
            const meta = ORDER_STAGES[stepNum];

            return (
              <div key={stepNum} className="relative flex items-start gap-4 pb-6 last:pb-1">
                {stepNum !== 8 && (
                  <div
                    className={`absolute left-3 top-6 bottom-0 w-0.5 ${
                      isCompleted
                        ? 'bg-burgundy-wine'
                        : isCurrent
                        ? 'bg-gradient-to-b from-burgundy-wine to-border-delicate'
                        : 'bg-border-delicate/40'
                    }`}
                  />
                )}

                <div
                  className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[12px] flex-shrink-0 transition-all ${
                    isCompleted
                      ? 'bg-burgundy-wine text-white shadow-xs'
                      : isCurrent
                      ? 'bg-burgundy-wine text-white ring-4 ring-burgundy-wine/20 animate-pulse shadow-md'
                      : 'bg-surface-subtle text-text-muted/60 border border-border-delicate'
                  }`}
                >
                  {isCompleted ? (
                    <Icon name="check" className="text-[14px]" />
                  ) : isCurrent ? (
                    <Icon name={meta.icon} className="text-[14px]" />
                  ) : (
                    <Icon name="lock" className="text-[12px] text-text-muted/50" />
                  )}
                </div>

                <div className={`flex flex-col min-w-0 pt-0.5 flex-1 ${isLocked ? 'opacity-50 select-none' : ''}`}>
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <span
                      className={`text-xs ${
                        isCurrent
                          ? 'text-burgundy-wine font-bold text-sm'
                          : isCompleted
                          ? 'text-deep-espresso font-semibold'
                          : 'text-text-muted'
                      }`}
                    >
                      {stepNum}. {meta.name}
                    </span>
                    <span
                      className={`font-label-caps text-[9px] px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                          : isCurrent
                          ? 'bg-burgundy-wine text-white font-bold shadow-2xs'
                          : 'bg-surface-subtle text-text-muted/70 flex items-center gap-1 border border-border-delicate/60'
                      }`}
                    >
                      {isCompleted ? (
                        'Đã hoàn thành'
                      ) : isCurrent ? (
                        'Đang thực hiện'
                      ) : (
                        <>
                          <Icon name="lock" className="text-[10px]" />
                          <span>Đang khóa</span>
                        </>
                      )}
                    </span>
                  </div>
                  <span className="text-[11px] text-text-muted mt-0.5">
                    {isLocked ? 'Bước này sẽ tự động mở khóa sau khi bạn hoàn tất các bước trước.' : meta.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. DETAILED ORDER SPECIFICATION */}
      <div className="flex flex-col rounded-2xl bg-surface-card p-4 shadow-xs border border-border-delicate gap-3">
        <div className="flex items-center gap-2 pb-1 border-b border-border-delicate">
          <Icon name="receipt_long" className="text-[18px] text-gold-foil" />
          <h3 className="font-serif text-base font-bold text-deep-espresso">
            Thông số kỹ thuật đơn hàng
          </h3>
        </div>

        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between py-1.5 px-2.5 rounded bg-surface-subtle/40">
            <span className="text-text-muted">Mã đơn hàng:</span>
            <span className="font-mono font-bold text-deep-espresso">#{currentOrder.id}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 px-2.5">
            <span className="text-text-muted">Sản phẩm:</span>
            <span className="font-semibold text-deep-espresso">{currentOrder.templateName}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 px-2.5 rounded bg-surface-subtle/40">
            <span className="text-text-muted">Trạng thái thanh toán:</span>
            <span
              className={`font-semibold flex items-center gap-1 ${
                currentOrder.paymentStatus === 'paid'
                  ? 'text-emerald-800'
                  : currentOrder.paymentStatus === 'pending_confirmation'
                  ? 'text-amber-800 font-bold'
                  : 'text-burgundy-wine'
              }`}
            >
              <Icon
                name={
                  currentOrder.paymentStatus === 'paid'
                    ? 'check_circle'
                    : currentOrder.paymentStatus === 'pending_confirmation'
                    ? 'hourglass_top'
                    : 'pending'
                }
                className="text-[14px]"
              />
              <span>
                {currentOrder.paymentStatus === 'paid'
                  ? 'Đã xác nhận thanh toán'
                  : currentOrder.paymentStatus === 'pending_confirmation'
                  ? 'Đang chờ xác nhận thanh toán'
                  : 'Chưa thanh toán'}
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5 px-2.5">
            <span className="text-text-muted">Tổng chi phí:</span>
            <span className="font-serif font-bold text-burgundy-wine text-sm">
              {formatCurrency(currentOrder.price)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5 px-2.5 rounded bg-surface-subtle/40">
            <span className="text-text-muted">Thời hạn lưu trữ:</span>
            <span className="font-semibold text-deep-espresso flex items-center gap-1">
              <Icon name="schedule" className="text-[14px] text-gold-foil" />
              <span>365 ngày (đến 28/12/2027)</span>
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5 px-2.5">
            <span className="text-text-muted">Hạn chót gửi dữ liệu:</span>
            <span className="font-semibold text-burgundy-wine bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              25/12/2026 (3 ngày trước cưới)
            </span>
          </div>

          {(effectiveStage === 5 || effectiveStage === 6) && (
            <div className="pt-2 border-t border-border-delicate flex justify-end">
              <button
                type="button"
                onClick={() => setIsRevisionModalOpen(true)}
                className="px-4 py-2 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Icon name="edit_note" className="text-[16px]" />
                <span>Gửi yêu cầu chỉnh sửa</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 8. COZY SUPPORT CARD */}
      <div className="flex flex-col gap-2 p-4 rounded-2xl bg-surface-subtle border border-border-delicate text-deep-espresso">
        <div className="flex items-center gap-2">
          <Icon name="favorite" className="text-[20px] text-burgundy-wine" />
          <h4 className="font-serif font-bold text-sm">Cần hỗ trợ gấp cho ngày cưới?</h4>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          Đội ngũ chăm sóc cô dâu &amp; chú rể luôn túc trực để hỗ trợ điều chỉnh nội dung thiệp mời.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <a
            href="tel:0982123456"
            className="flex items-center justify-center gap-1 h-10 rounded-full bg-surface-card text-deep-espresso text-xs font-semibold shadow-xs hover:bg-surface-cream transition-colors"
          >
            <Icon name="call" className="text-[16px] text-gold-foil" />
            <span>Gọi hotline</span>
          </a>
          <a
            href={zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1 h-10 rounded-full bg-burgundy-wine text-white text-xs font-semibold shadow-xs hover:bg-[#851622] transition-colors"
          >
            <Icon name="chat" className="text-[16px]" />
            <span>Zalo 24/7</span>
          </a>
        </div>
      </div>

      {/* Revision Modal Popup */}
      <RevisionModal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        onSubmitRevision={handleRevisionSubmit}
      />

      {/* Wedding Information Modal */}
      <WeddingInfoModal
        isOpen={isWeddingInfoModalOpen}
        onClose={() => setIsWeddingInfoModalOpen(false)}
        initialInfo={currentOrder.weddingInfo}
        onSave={handleWeddingInfoSave}
      />

      {/* Photo Album Modal */}
      <PhotoAlbumModal
        isOpen={isAlbumModalOpen}
        onClose={() => setIsAlbumModalOpen(false)}
        existingPhotos={currentOrder.weddingInfo?.albumPhotos || []}
        onSave={handleAlbumSave}
      />
    </div>
  );
};
