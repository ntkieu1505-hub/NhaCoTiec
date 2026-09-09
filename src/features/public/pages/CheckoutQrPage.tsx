import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { formatCurrency } from '../../../utils/formatters';
import { usePaymentSettings } from '../../../mocks/paymentSettingsStore';
import { customerSubmitPaymentConfirmation, useOrder } from '../../../mocks/orderStore';

export const CheckoutQrPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateSlug = searchParams.get('template') || 'minh-anh-tuan-kiet';

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const paymentSettings = usePaymentSettings();
  const orderId = 'NCT01';
  const order = useOrder(orderId);

  const amount = templateSlug.includes('thanh-xuan') || templateSlug.includes('moc-tra') ? 59000 : 79000;

  // If order is already pending confirmation or paid
  useEffect(() => {
    if (order?.paymentStatus === 'pending_confirmation') {
      setIsSubmitted(true);
    }
  }, [order?.paymentStatus]);

  const handleCopy = (text: string, field: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleCustomerSubmitPayment = () => {
    // IMPORTANT BUSINESS LOGIC:
    // Customer clicking "Tôi đã hoàn tất chuyển khoản" MUST NOT mark the order as paid!
    // Instead, sets paymentStatus to 'pending_confirmation' and keeps orderStatus as 'pending_payment'.
    customerSubmitPaymentConfirmation(orderId, {
      note: `Khách hàng đã chuyển khoản ${formatCurrency(amount)} qua ngân hàng ${paymentSettings.bankName}`,
      proof: 'chuyen_khoan_receipt_nct01.jpg',
    });
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 w-full flex flex-col gap-5">
      {/* Back button */}
      <div>
        <Link
          to="/mau-thiep"
          className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-deep-espresso"
        >
          <Icon name="arrow_back" className="text-[16px]" />
          <span>Quay lại Bộ sưu tập mẫu thiệp</span>
        </Link>
      </div>

      {/* Confirmation State UI when customer clicked "Tôi đã hoàn tất chuyển khoản" */}
      {isSubmitted ? (
        <div className="bg-surface-card rounded-2xl p-6 shadow-xl border border-border-delicate flex flex-col items-center gap-5 text-center animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 border-2 border-amber-400 flex items-center justify-center shadow-xs">
            <Icon name="hourglass_top" className="text-[32px] animate-pulse" />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-label-caps text-[11px] px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-bold tracking-wider mx-auto">
              Đang chờ xác nhận thanh toán
            </span>
            <h1 className="font-serif text-2xl font-bold text-deep-espresso mt-2">
              Thanh toán đã được gửi.
            </h1>
            <p className="text-sm font-medium text-burgundy-wine">
              Nhà Có Tiệc đang kiểm tra giao dịch của bạn.
            </p>
          </div>

          <div className="w-full bg-surface-subtle/70 p-4 rounded-xl border border-border-delicate text-xs text-left flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-text-muted">Mã đơn hàng:</span>
              <span className="font-mono font-bold text-deep-espresso">#{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Số tiền chuyển khoản:</span>
              <span className="font-serif font-bold text-burgundy-wine">{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Ngân hàng thụ hưởng:</span>
              <span className="font-semibold text-deep-espresso">{paymentSettings.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Thời gian gửi:</span>
              <span className="font-medium text-deep-espresso">Vừa xong</span>
            </div>
            <div className="pt-2 border-t border-border-delicate text-[11px] text-text-muted leading-relaxed">
              Thông tin chuyển khoản của bạn đã được ghi nhận vào hệ thống đối soát. Admin sẽ kiểm tra giao dịch và kích hoạt trạng thái "Đã thanh toán" để bạn bắt đầu điền thông tin cưới.
            </div>
          </div>

          <div className="w-full flex flex-col gap-2 pt-2">
            <button
              onClick={() => navigate(`/dashboard/don-hang/${orderId}`)}
              className="w-full h-11 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white font-label-md text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Icon name="visibility" className="text-[18px]" />
              <span>Xem tiến trình đơn hàng</span>
            </button>
          </div>
        </div>
      ) : (
        /* Unpaid QR Scan State - Static QR uploaded by Admin */
        <>
          {/* Header */}
          <div className="text-center">
            <span className="font-label-caps text-xs text-burgundy-wine tracking-widest font-bold">
              Chuyển khoản ngân hàng
            </span>
            <h1 className="font-serif text-2xl font-bold text-deep-espresso mt-1">
              Quét mã thanh toán dịch vụ.
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Mã đơn hàng: <strong className="text-burgundy-wine font-mono">#{orderId}</strong>
            </p>
          </div>

          {/* Static QR Code Container */}
          <div className="bg-surface-card rounded-2xl p-6 shadow-md border border-border-delicate flex flex-col items-center gap-4 text-center">
            {/* Instruction badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-subtle text-deep-espresso border border-border-delicate text-xs font-semibold">
              <Icon name="qr_code_2" className="text-[16px] text-burgundy-wine" />
              <span>Quét mã QR từ ứng dụng ngân hàng của bạn</span>
            </div>

            {/* Static QR Code Box (Uploaded by Admin) */}
            <div className="p-4 bg-white rounded-2xl border-2 border-gold-foil/50 shadow-inner flex flex-col items-center">
              <img
                src={paymentSettings.qrImageUrl}
                alt="Mã QR thanh toán Nhà Có Tiệc"
                className="w-60 h-60 object-contain rounded-xl"
              />
              <span className="text-[11px] text-text-muted mt-2 font-medium">
                Mã QR tài khoản ngân hàng chính thức
              </span>
            </div>

            {/* Transfer details */}
            <div className="w-full flex flex-col gap-2 pt-2 text-left text-xs border-t border-border-delicate">
              <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-surface-subtle/50">
                <span className="text-text-muted">Ngân hàng:</span>
                <span className="font-semibold text-deep-espresso">{paymentSettings.bankName}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-surface-subtle/50">
                <span className="text-text-muted">Số tài khoản:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-deep-espresso">{paymentSettings.accountNumber}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(paymentSettings.accountNumber, 'acc')}
                    className="text-[11px] text-burgundy-wine font-semibold hover:underline"
                  >
                    {copiedField === 'acc' ? 'Đã chép' : 'Sao chép'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-surface-subtle/50">
                <span className="text-text-muted">Chủ tài khoản:</span>
                <span className="font-semibold text-deep-espresso">{paymentSettings.accountHolder}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-surface-subtle/50">
                <span className="text-text-muted">Số tiền thanh toán:</span>
                <span className="font-serif font-bold text-burgundy-wine text-sm">
                  {formatCurrency(amount)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-surface-subtle/50">
                <span className="text-text-muted">Nội dung chuyển khoản:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-burgundy-wine bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {orderId}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(orderId, 'code')}
                    className="text-[11px] text-burgundy-wine font-semibold hover:underline"
                  >
                    {copiedField === 'code' ? 'Đã chép' : 'Sao chép'}
                  </button>
                </div>
              </div>
            </div>

            {/* Notice for Customer */}
            <div className="p-3 rounded-xl bg-surface-subtle border border-border-delicate text-left text-[11px] text-text-muted leading-relaxed">
              <span className="font-bold text-deep-espresso block mb-0.5">Lưu ý quan trọng:</span>
              {paymentSettings.paymentNote}
            </div>

            {/* CTA Button: "Tôi đã hoàn tất chuyển khoản" */}
            <button
              onClick={handleCustomerSubmitPayment}
              className="w-full h-12 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white font-label-md text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 mt-1"
            >
              <Icon name="check_circle" className="text-[18px]" />
              <span>Tôi đã hoàn tất chuyển khoản</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
