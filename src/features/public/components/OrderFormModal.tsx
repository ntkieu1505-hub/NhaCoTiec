import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { Template } from '../../../types/template';
import { formatCurrency } from '../../../utils/formatters';
import { createOrder } from '../../../mocks/orderStore';
import { useAuth } from '../../../mocks/authStore';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template;
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  isOpen,
  onClose,
  template,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Contact Info
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  // Wedding Core Details
  const [groomName, setGroomName] = useState('');
  const [brideName, setBrideName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [weddingTime, setWeddingTime] = useState('18:00');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [googleMapUrl, setGoogleMapUrl] = useState('');

  // Optional Details
  const [groomParents, setGroomParents] = useState('');
  const [brideParents, setBrideParents] = useState('');
  const [invitationMessage, setInvitationMessage] = useState('');
  const [designerNotes, setDesignerNotes] = useState('');
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // Form error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!groomName.trim() || !brideName.trim()) {
      setErrorMessage('Vui lòng nhập họ tên của cả Chú Rể và Cô Dâu.');
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMessage('Vui lòng nhập số điện thoại (Zalo) để nhận hỗ trợ và bản duyệt thiệp.');
      return;
    }

    if (!customerEmail.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ Email để nhận thông báo và link thiệp.');
      return;
    }

    if (!weddingDate) {
      setErrorMessage('Vui lòng chọn ngày tổ chức tiệc cưới.');
      return;
    }

    if (!weddingTime) {
      setErrorMessage('Vui lòng nhập giờ tổ chức tiệc cưới.');
      return;
    }

    if (!venueName.trim() || !venueAddress.trim()) {
      setErrorMessage('Vui lòng nhập tên địa điểm và địa chỉ tổ chức tiệc cưới.');
      return;
    }

    setIsSubmitting(true);

    const hasCoupleNames = Boolean(groomName.trim() || brideName.trim());
    const coupleDisplayName = (groomName.trim() && brideName.trim())
      ? `${groomName.trim()} & ${brideName.trim()}`
      : (groomName.trim() || brideName.trim());
    const finalTemplateName = hasCoupleNames
      ? `Thiệp cưới ${coupleDisplayName} (${template.name})`
      : template.name;

    try {
      // 1. Create order with all filled details
      const newOrder = createOrder({
        userId: user?.id,
        templateId: template.id,
        templateName: finalTemplateName,
        category: template.category || (template.price > 60000 ? 'premium' : 'basic'),
        price: template.price,
        weddingInfo: {
          groomName: groomName.trim(),
          brideName: brideName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          weddingDate,
          weddingTime,
          venueName: venueName.trim(),
          venueAddress: venueAddress.trim(),
          googleMapUrl: googleMapUrl.trim() || undefined,
          groomParents: groomParents.trim() || undefined,
          brideParents: brideParents.trim() || undefined,
          invitationMessage: invitationMessage.trim() || undefined,
          designerNotes: designerNotes.trim() || undefined,
        },
      });

      // 2. Navigate straight to payment QR page for this specific order
      onClose();
      navigate(`/thanh-toan/${newOrder.id}?template=${template.slug}`);
    } catch (err: any) {
      console.error('Failed to create order', err);
      setErrorMessage('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-surface-card rounded-2xl shadow-2xl border border-border-delicate w-full max-w-2xl max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 bg-[#4a0d11] text-white flex items-center justify-between border-b border-rose-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gold-foil">
              <Icon name="favorite" className="text-[22px]" />
            </div>
            <div>
              <span className="font-label-caps text-[10px] text-rose-200 tracking-wider uppercase font-bold">
                Bước 1: Điền thông tin đám cưới
              </span>
              <h2 className="font-serif text-lg font-bold text-white">
                Thông tin thiệp cưới & Đặt mẫu
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        {/* Selected Template Badge Banner */}
        <div className="px-5 py-3 bg-surface-subtle border-b border-border-delicate flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={template.thumbnailUrl}
              alt={template.name}
              className="w-12 h-12 object-cover rounded-lg border border-border-delicate shadow-2xs"
            />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-burgundy-wine">
                Mẫu đã chọn
              </span>
              <h3 className="font-serif text-sm font-bold text-deep-espresso line-clamp-1">
                {(groomName.trim() || brideName.trim())
                  ? `Thiệp cưới: ${(groomName.trim() && brideName.trim()) ? `${groomName.trim()} & ${brideName.trim()}` : (groomName.trim() || brideName.trim())}`
                  : template.name}
              </h3>
              <span className="text-xs text-text-muted">
                {(groomName.trim() || brideName.trim())
                  ? `Mẫu ${template.name} • Phong cách ${template.style}`
                  : `Phong cách ${template.style}`}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-text-muted block">Đơn giá</span>
            <span className="font-serif text-base font-bold text-burgundy-wine">
              {formatCurrency(template.price)}
            </span>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-deep-espresso">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
              <Icon name="error" className="text-[18px] text-rose-700 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SECTION 1: CÔ DÂU & CHÚ RỂ (BẮT BUỘC) */}
          <div className="bg-surface-subtle/40 p-4 rounded-xl border border-border-delicate space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-border-delicate">
              <Icon name="favorite" className="text-[16px] text-burgundy-wine" />
              <span className="font-serif font-bold text-sm text-deep-espresso">
                1. Thông tin Cô Dâu & Chú Rể <span className="text-rose-600">*</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-text-muted font-medium">
                  Họ & tên Chú Rể <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trần Đức Minh"
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-delicate focus:border-burgundy-wine text-xs outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted font-medium">
                  Họ & tên Cô Dâu <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Minh Anh"
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-delicate focus:border-burgundy-wine text-xs outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: THÔNG TIN LIÊN HỆ (BẮT BUỘC) */}
          <div className="bg-surface-subtle/40 p-4 rounded-xl border border-border-delicate space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-border-delicate">
              <Icon name="contacts" className="text-[16px] text-burgundy-wine" />
              <span className="font-serif font-bold text-sm text-deep-espresso">
                2. Thông tin liên hệ nhận thiệp <span className="text-rose-600">*</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-text-muted font-medium">
                  Số điện thoại Zalo <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0982 123 456"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-delicate focus:border-burgundy-wine text-xs outline-none font-mono font-medium"
                />
                <span className="text-[10px] text-text-muted">Dùng để Designer gửi bản duyệt và hỗ trợ</span>
              </div>

              <div className="space-y-1">
                <label className="text-text-muted font-medium">
                  Email nhận thông báo <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-delicate focus:border-burgundy-wine text-xs outline-none font-medium"
                />
                <span className="text-[10px] text-text-muted">Nhận link thiệp cưới và hóa đơn điện tử</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: THỜI GIAN & ĐỊA ĐIỂM TIỆC CƯỚI (BẮT BUỘC) */}
          <div className="bg-surface-subtle/40 p-4 rounded-xl border border-border-delicate space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-border-delicate">
              <Icon name="event" className="text-[16px] text-burgundy-wine" />
              <span className="font-serif font-bold text-sm text-deep-espresso">
                3. Thời gian & Địa điểm tiệc cưới <span className="text-rose-600">*</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-text-muted font-medium">
                  Ngày tổ chức tiệc <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="date"
                  required
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-delicate focus:border-burgundy-wine text-xs outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted font-medium">
                  Giờ tổ chức tiệc <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="time"
                  required
                  value={weddingTime}
                  onChange={(e) => setWeddingTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-delicate focus:border-burgundy-wine text-xs outline-none font-medium"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-text-muted font-medium">
                  Tên trung tâm tiệc cưới / Nhà hàng / Tư gia <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trung tâm Hội nghị Tiệc cưới GEM Center (Sảnh Grand Ballroom)"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-delicate focus:border-burgundy-wine text-xs outline-none font-medium"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-text-muted font-medium">
                  Địa chỉ chi tiết <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Số 8 Nguyễn Bỉnh Khiêm, P. Đa Kao, Quận 1, TP. Hồ Chí Minh"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-delicate focus:border-burgundy-wine text-xs outline-none font-medium"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-text-muted font-medium">
                  Link Google Maps địa điểm cưới (Tùy chọn):
                </label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/?q=..."
                  value={googleMapUrl}
                  onChange={(e) => setGoogleMapUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-delicate focus:border-burgundy-wine text-xs outline-none"
                />
              </div>
            </div>
          </div>

          {/* TOGGLE OPTIONAL FIELDS */}
          <div>
            <button
              type="button"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="inline-flex items-center gap-1.5 text-burgundy-wine hover:text-[#851622] font-semibold text-xs transition-colors"
            >
              <Icon name={showOptionalFields ? 'expand_less' : 'expand_more'} className="text-[18px]" />
              <span>
                {showOptionalFields
                  ? 'Thu gọn thông tin phụ huynh & lời mời'
                  : '+ Thêm tên phụ huynh hai bên & lời mời thiệp cưới (Tùy chọn)'}
              </span>
            </button>
          </div>

          {showOptionalFields && (
            <div className="bg-surface-subtle/30 p-4 rounded-xl border border-border-delicate space-y-3 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-text-muted font-medium">Họ tên Phụ huynh Nhà trai:</label>
                  <input
                    type="text"
                    placeholder="Ông Trần Văn Hùng & Bà Lê Thị Mai"
                    value={groomParents}
                    onChange={(e) => setGroomParents(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-delicate focus:border-burgundy-wine text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-text-muted font-medium">Họ tên Phụ huynh Nhà gái:</label>
                  <input
                    type="text"
                    placeholder="Ông Nguyễn Văn An & Bà Vũ Thị Cúc"
                    value={brideParents}
                    onChange={(e) => setBrideParents(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-delicate focus:border-burgundy-wine text-xs outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-text-muted font-medium">Lời mời thiệp cưới:</label>
                  <textarea
                    rows={2}
                    value={invitationMessage}
                    onChange={(e) => setInvitationMessage(e.target.value)}
                    placeholder="Tình yêu là khi hai trái tim cùng chung một nhịp đập. Trân trọng kính mời bạn đến chung vui cùng chúng mình trong ngày trọng đại..."
                    className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-delicate focus:border-burgundy-wine text-xs outline-none resize-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-text-muted font-medium">Ghi chú riêng cho Designer:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Tone màu hoa nhã nhặn, ưu tiên phong cách tối giản..."
                    value={designerNotes}
                    onChange={(e) => setDesignerNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-delicate focus:border-burgundy-wine text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border-delicate flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full border border-border-delicate text-deep-espresso hover:bg-surface-subtle font-medium transition-colors"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-rose-950/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Icon name="payment" className="text-[18px]" />
              <span>{isSubmitting ? 'Đang khởi tạo...' : 'Xác nhận & Tiến hành thanh toán'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
