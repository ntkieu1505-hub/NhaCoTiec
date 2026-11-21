import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { usePaymentSettings } from '../../../mocks/paymentSettingsStore';
import { useSystemSettings, updateSystemSettings } from '../../../mocks/systemSettingsStore';

export const AdminSettingsPage: React.FC = () => {
  const paymentSettings = usePaymentSettings();
  const systemSettings = useSystemSettings();

  const [basicPrice, setBasicPrice] = useState(systemSettings.basicPrice);
  const [premiumPrice, setPremiumPrice] = useState(systemSettings.premiumPrice);
  const [renewalPrice, setRenewalPrice] = useState(systemSettings.renewalPrice);
  const [slaHours, setSlaHours] = useState(systemSettings.slaHours);
  const [freeRevisions, setFreeRevisions] = useState(systemSettings.freeRevisions);
  const [saved, setSaved] = useState(false);

  // Sync state when systemSettings updates from Firestore / localStorage
  useEffect(() => {
    setBasicPrice(systemSettings.basicPrice);
    setPremiumPrice(systemSettings.premiumPrice);
    setRenewalPrice(systemSettings.renewalPrice);
    setSlaHours(systemSettings.slaHours);
    setFreeRevisions(systemSettings.freeRevisions);
  }, [systemSettings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      basicPrice,
      premiumPrice,
      renewalPrice,
      slaHours,
      freeRevisions,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border-delicate">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-subtle text-deep-espresso mb-1">
            <span className="w-2 h-2 rounded-full bg-gold-foil animate-pulse"></span>
            <span className="font-label-caps text-[10px] uppercase tracking-wider text-text-muted">
              Cấu hình điều hành lõi v3.4.2
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-deep-espresso">
            09. Cài Đặt Hệ Thống &amp; Vận Hành
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-xl">
            Thiết lập thông số giá bán lẻ 59k - 79k, cam kết SLA thiết kế 24h và cấu hình tài khoản chuyển khoản ngân hàng qua mã QR tĩnh.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-full bg-burgundy-wine text-white text-xs font-semibold shadow-md hover:bg-[#851622] transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Icon name="check_circle" className="text-[18px]" />
          <span>Lưu thay đổi cấu hình</span>
        </button>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          ✓ Đã lưu cấu hình vận hành thành công!
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column (8 cols): SLA & Pricing */}
        <div className="md:col-span-8 flex flex-col gap-6">
          {/* Block A: Pricing & SLA */}
          <div className="bg-surface-card rounded-2xl p-5 border border-border-delicate shadow-xs flex flex-col gap-5">
            <div className="flex items-center gap-3 pb-3 border-b border-border-delicate">
              <div className="w-9 h-9 rounded-full bg-surface-subtle flex items-center justify-center text-burgundy-wine">
                <Icon name="sell" className="text-[20px]" />
              </div>
              <div>
                <h2 className="font-serif text-base font-bold text-deep-espresso">
                  Khối A. Định Giá Bán Lẻ &amp; Cam Kết SLA Thiết Kế
                </h2>
                <p className="text-[11px] text-text-muted">
                  Chính sách bán theo sản phẩm và chuẩn thời gian hoàn thiện 24h
                </p>
              </div>
            </div>

            {/* Pricing Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-surface-cream border border-border-delicate flex flex-col gap-1.5">
                <label className="text-[11px] font-label-caps uppercase text-text-muted">
                  Giá Mẫu Cơ Bản
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={basicPrice}
                    onChange={(e) => setBasicPrice(e.target.value)}
                    className="w-full bg-surface-card border border-border-delicate rounded-lg px-2.5 py-1.5 text-xs font-semibold text-deep-espresso"
                  />
                  <span className="absolute right-2 text-[10px] text-text-muted">VNĐ</span>
                </div>
                <span className="text-[10px] text-text-muted">Bán lẻ đơn chiếc</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-cream border border-border-delicate flex flex-col gap-1.5">
                <label className="text-[11px] font-label-caps uppercase text-text-muted">
                  Giá Mẫu Cao Cấp
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={premiumPrice}
                    onChange={(e) => setPremiumPrice(e.target.value)}
                    className="w-full bg-surface-card border border-border-delicate rounded-lg px-2.5 py-1.5 text-xs font-semibold text-deep-espresso"
                  />
                  <span className="absolute right-2 text-[10px] text-text-muted">VNĐ</span>
                </div>
                <span className="text-[10px] text-text-muted">Full tính năng &amp; RSVP</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-cream border border-border-delicate flex flex-col gap-1.5">
                <label className="text-[11px] font-label-caps uppercase text-text-muted">
                  Gia Hạn Sau 1 Năm
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={renewalPrice}
                    onChange={(e) => setRenewalPrice(e.target.value)}
                    className="w-full bg-surface-card border border-border-delicate rounded-lg px-2.5 py-1.5 text-xs font-semibold text-deep-espresso"
                  />
                  <span className="absolute right-2 text-[10px] text-text-muted">/ 3 Th</span>
                </div>
                <span className="text-[10px] text-text-muted">Lưu trữ kỷ niệm</span>
              </div>
            </div>

            {/* SLA Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-surface-subtle border border-border-delicate flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-deep-espresso font-medium">Thời gian trả bản duyệt đầu:</span>
                  <span className="font-bold text-burgundy-wine font-serif">{slaHours} giờ</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="48"
                  value={slaHours}
                  onChange={(e) => setSlaHours(e.target.value)}
                  className="w-full accent-burgundy-wine cursor-pointer"
                />
                <span className="text-[10px] text-text-muted">
                  Cam kết gửi bản demo trong vòng {slaHours} giờ sau khi nhận đủ ảnh
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-subtle border border-border-delicate flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-deep-espresso font-medium">Số lần chỉnh sửa miễn phí:</span>
                  <span className="font-bold text-deep-espresso">{freeRevisions} lần</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={freeRevisions}
                    onChange={(e) => setFreeRevisions(e.target.value)}
                    className="w-16 px-2 py-1 rounded bg-surface-card text-xs font-semibold border border-border-delicate"
                  />
                  <span className="text-[11px] text-text-muted">lần chuẩn (+20.000đ từ lần 4)</span>
                </div>
                <span className="text-[10px] text-text-muted">
                  Thời hạn lưu trữ mặc định: 365 ngày
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Payment Settings & Static QR */}
        <div className="md:col-span-4 flex flex-col gap-5">
          {/* Payment Settings Card */}
          <div className="bg-surface-card rounded-2xl p-5 border border-border-delicate shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-border-delicate">
              <div className="flex items-center gap-2">
                <Icon name="qr_code_scanner" className="text-[18px] text-burgundy-wine" />
                <h3 className="font-serif text-sm font-bold text-deep-espresso">
                  Cài Đặt Thanh Toán (QR Tĩnh)
                </h3>
              </div>
              <span className="font-label-caps text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                {paymentSettings.isActive ? 'Đang bật' : 'Tạm ẩn'}
              </span>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-surface-cream/70 border border-border-delicate flex items-center gap-3">
                <div className="w-16 h-16 bg-white p-1 rounded-lg border border-border-delicate shrink-0 flex items-center justify-center">
                  <img
                    src={paymentSettings.qrImageUrl}
                    alt="Mã QR tĩnh"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-deep-espresso truncate">{paymentSettings.bankName}</span>
                  <span className="font-mono text-burgundy-wine font-semibold text-[11px]">{paymentSettings.accountNumber}</span>
                  <span className="text-[10px] text-text-muted uppercase truncate">{paymentSettings.accountHolder}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-[11px] text-text-muted leading-relaxed">
                <span>• Mã QR được tải lên thủ công, không sinh tự động.</span>
                <span>• Khách hàng quét ảnh QR tĩnh để chuyển khoản.</span>
              </div>

              <Link
                to="/admin/cai-dat-thanh-toan"
                className="w-full h-9 rounded-full bg-burgundy-wine text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#851622] transition-colors mt-1 shadow-2xs"
              >
                <Icon name="settings" className="text-[15px]" />
                <span>Quản lý chi tiết &amp; Thay ảnh QR</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
