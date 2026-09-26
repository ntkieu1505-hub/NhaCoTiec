import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import {
  usePaymentSettings,
  updatePaymentSettings,
} from '../../../mocks/paymentSettingsStore';

// Helper to compress uploaded QR images to prevent oversized payload
const compressQrImage = (file: File, maxWidth = 900, quality = 0.9): Promise<string> => {
  return new Promise((resolve) => {
    // If SVG, keep raw data URL
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve((e.target?.result as string) || '');
        }
      };
      img.onerror = () => resolve((e.target?.result as string) || '');
      img.src = (e.target?.result as string) || '';
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export const AdminPaymentSettingsPage: React.FC = () => {
  const currentSettings = usePaymentSettings();

  const [bankName, setBankName] = useState(currentSettings.bankName);
  const [accountHolder, setAccountHolder] = useState(currentSettings.accountHolder);
  const [accountNumber, setAccountNumber] = useState(currentSettings.accountNumber);
  const [transferSyntax, setTransferSyntax] = useState(currentSettings.transferSyntax);
  const [paymentNote, setPaymentNote] = useState(currentSettings.paymentNote);
  const [isActive, setIsActive] = useState(currentSettings.isActive);
  const [qrImagePreview, setQrImagePreview] = useState(currentSettings.qrImageUrl);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDirtyRef = useRef(false);

  // Sync state if store updates from Firestore/another tab, BUT ONLY if user hasn't typed unsaved changes
  React.useEffect(() => {
    if (!isDirtyRef.current) {
      setBankName(currentSettings.bankName);
      setAccountHolder(currentSettings.accountHolder);
      setAccountNumber(currentSettings.accountNumber);
      setTransferSyntax(currentSettings.transferSyntax);
      setPaymentNote(currentSettings.paymentNote);
      setIsActive(currentSettings.isActive);
      setQrImagePreview(currentSettings.qrImageUrl);
    }
  }, [currentSettings]);

  const handleQrFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      isDirtyRef.current = true;
      const compressedDataUrl = await compressQrImage(file);
      if (compressedDataUrl) {
        setQrImagePreview(compressedDataUrl);
        setUploadMessage(`Đã chọn ảnh QR mới: ${file.name}. Vui lòng bấm "Lưu thay đổi" để áp dụng.`);
        setTimeout(() => setUploadMessage(null), 5000);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    isDirtyRef.current = false;
    updatePaymentSettings({
      bankName: bankName.trim(),
      accountHolder: accountHolder.trim(),
      accountNumber: accountNumber.trim(),
      transferSyntax: transferSyntax.trim(),
      paymentNote: paymentNote.trim(),
      isActive,
      qrImageUrl: qrImagePreview,
    });
    setSavedSuccess(true);
    setUploadMessage(null);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 text-deep-espresso pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-delicate">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
            <Link to="/admin/tong-quan" className="hover:text-burgundy-wine">Admin Hub</Link>
            <span>/</span>
            <Link to="/admin/cai-dat" className="hover:text-burgundy-wine">Cài đặt</Link>
            <span>/</span>
            <span className="font-semibold text-deep-espresso">Cài đặt thanh toán</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-deep-espresso">
            Cài Đặt Thanh Toán (Mã QR Tĩnh)
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-2xl">
            Cấu hình số tài khoản ngân hàng và tải ảnh mã QR tĩnh thủ công. Khách hàng sẽ quét trực tiếp hình ảnh này để chuyển khoản.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/thanh-toan/NCT01"
            target="_blank"
            className="px-4 py-2 rounded-full bg-surface-card hover:bg-surface-subtle text-burgundy-wine border border-burgundy-wine/30 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Icon name="open_in_new" className="text-[16px]" />
            <span>Xem màn thanh toán khách hàng</span>
          </Link>
        </div>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <Icon name="check_circle" className="text-[20px] text-emerald-700 shrink-0" />
          <span>Đã lưu thay đổi cấu hình thanh toán thành công! Dữ liệu đã đồng bộ ngay lập tức tới trang thanh toán của khách.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (7 cols): Bank & Account details */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="bg-surface-card rounded-2xl p-5 border border-border-delicate shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border-delicate">
              <div className="w-9 h-9 rounded-xl bg-burgundy-wine/10 text-burgundy-wine flex items-center justify-center">
                <Icon name="account_balance" className="text-[20px]" />
              </div>
              <div>
                <h2 className="font-serif text-base font-bold text-deep-espresso">
                  Thông Tin Tài Khoản Ngân Hàng
                </h2>
                <p className="text-[11px] text-text-muted">
                  Thông tin này sẽ hiển thị bên dưới mã QR để khách hàng kiểm tra hoặc sao chép
                </p>
              </div>
            </div>

            {/* Bank Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-espresso">
                Tên Ngân hàng (Bank Name)
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => {
                  isDirtyRef.current = true;
                  setBankName(e.target.value);
                }}
                placeholder="Ví dụ: MB Bank, Vietcombank, Techcombank..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-delicate bg-surface text-xs font-medium text-deep-espresso focus:outline-hidden focus:border-burgundy-wine"
                required
              />
            </div>

            {/* Account Holder */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-espresso">
                Tên chủ tài khoản (Account Holder)
              </label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => {
                  isDirtyRef.current = true;
                  setAccountHolder(e.target.value);
                }}
                placeholder="Ví dụ: NGUYEN VAN A"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-delicate bg-surface text-xs font-semibold uppercase text-deep-espresso focus:outline-hidden focus:border-burgundy-wine"
                required
              />
            </div>

            {/* Account Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-espresso">
                Số tài khoản (Account Number)
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => {
                  isDirtyRef.current = true;
                  setAccountNumber(e.target.value);
                }}
                placeholder="Ví dụ: 0982123456"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-delicate bg-surface text-xs font-mono font-bold text-deep-espresso focus:outline-hidden focus:border-burgundy-wine"
                required
              />
            </div>

            {/* Transfer Syntax */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-espresso flex items-center justify-between">
                <span>Cú pháp / Nội dung chuyển khoản mẫu (Transfer content)</span>
                <span className="text-[10px] text-text-muted font-normal">Mặc định hiển thị theo Mã đơn hàng</span>
              </label>
              <input
                type="text"
                value={transferSyntax}
                onChange={(e) => {
                  isDirtyRef.current = true;
                  setTransferSyntax(e.target.value);
                }}
                placeholder="Ví dụ: NCT01"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-delicate bg-surface text-xs font-mono font-bold text-burgundy-wine focus:outline-hidden focus:border-burgundy-wine"
              />
            </div>

            {/* Payment Note */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-espresso">
                Ghi chú hướng dẫn khách hàng (Payment note)
              </label>
              <textarea
                rows={3}
                value={paymentNote}
                onChange={(e) => {
                  isDirtyRef.current = true;
                  setPaymentNote(e.target.value);
                }}
                placeholder="Lời nhắc nhở dâu rể kiểm tra nội dung chuyển khoản..."
                className="w-full p-3 rounded-xl border border-border-delicate bg-surface text-xs text-deep-espresso focus:outline-hidden focus:border-burgundy-wine leading-relaxed resize-none"
              />
            </div>

            {/* Payment Status Toggle */}
            <div className="pt-2 border-t border-border-delicate flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-deep-espresso">Trạng thái cổng thanh toán</span>
                <span className="text-[11px] text-text-muted">Kích hoạt phương thức chuyển khoản ngân hàng qua mã QR</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => {
                    isDirtyRef.current = true;
                    setIsActive(e.target.checked);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-subtle peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-delicate after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Col (5 cols): Static QR Image Upload & Preview */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-surface-card rounded-2xl p-5 border border-border-delicate shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-delicate">
              <div className="flex items-center gap-2">
                <Icon name="qr_code_scanner" className="text-[20px] text-burgundy-wine" />
                <h2 className="font-serif text-base font-bold text-deep-espresso">
                  Hình Ảnh Mã QR Tĩnh
                </h2>
              </div>
              <span className="font-label-caps text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                Tải lên thủ công
              </span>
            </div>

            {/* Upload message if any */}
            {uploadMessage && (
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 text-xs flex items-center gap-1.5 font-medium">
                <Icon name="upload_file" className="text-[16px] text-blue-700" />
                <span>{uploadMessage}</span>
              </div>
            )}

            {/* QR Preview Box */}
            <div className="flex flex-col items-center gap-3 p-4 bg-surface-cream/60 rounded-2xl border border-border-delicate">
              <div className="p-3 bg-white rounded-xl border-2 border-gold-foil/40 shadow-inner flex items-center justify-center">
                <img
                  src={qrImagePreview}
                  alt="Ảnh QR tài khoản ngân hàng"
                  className="w-52 h-52 object-contain rounded-lg"
                />
              </div>

              <span className="text-[11px] text-text-muted text-center max-w-xs">
                Mã QR hiển thị trực tiếp cho khách hàng quét trên điện thoại. Không sử dụng API sinh mã động.
              </span>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleQrFileChange}
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
            />

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-10 rounded-full bg-surface-card hover:bg-surface-subtle text-burgundy-wine border border-burgundy-wine/40 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
              >
                <Icon name="photo_camera" className="text-[16px]" />
                <span>Thay ảnh QR</span>
              </button>

              <button
                type="submit"
                className="w-full h-11 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-colors active:scale-98"
              >
                <Icon name="save" className="text-[18px]" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
