import React, { useState, useEffect } from 'react';
import { Icon } from '../../../components/common/Icon';
import { WeddingInformation } from '../../../types/order';

interface WeddingInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialInfo?: WeddingInformation;
  onSave: (data: Partial<WeddingInformation>) => void;
}

export const WeddingInfoModal: React.FC<WeddingInfoModalProps> = ({
  isOpen,
  onClose,
  initialInfo,
  onSave,
}) => {
  const [groomName, setGroomName] = useState('');
  const [brideName, setBrideName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [weddingDate, setWeddingDate] = useState('');
  const [weddingTime, setWeddingTime] = useState('');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [googleMapUrl, setGoogleMapUrl] = useState('');

  const [invitationMessage, setInvitationMessage] = useState('');
  const [loveStory, setLoveStory] = useState('');
  const [groomParents, setGroomParents] = useState('');
  const [brideParents, setBrideParents] = useState('');
  const [timeline, setTimeline] = useState('');
  const [designerNotes, setDesignerNotes] = useState('');

  const [videoUrl, setVideoUrl] = useState('');
  const [videoNotes, setVideoNotes] = useState('');

  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (initialInfo) {
      setGroomName(initialInfo.groomName || 'Trần Đức Minh');
      setBrideName(initialInfo.brideName || 'Nguyễn Minh Anh');
      setCustomerEmail(initialInfo.customerEmail || 'minhanh.wedding@gmail.com');
      setCustomerPhone(initialInfo.customerPhone || '0982 123 456');

      setWeddingDate(initialInfo.weddingDate || '2026-12-28');
      setWeddingTime(initialInfo.weddingTime || '18:00');
      setVenueName(initialInfo.venueName || 'Trung tâm Hội nghị Tiệc cưới GEM Center');
      setVenueAddress(initialInfo.venueAddress || 'Số 8 Nguyễn Bỉnh Khiêm, P. Đa Kao, Quận 1, TP. Hồ Chí Minh');
      setGoogleMapUrl(initialInfo.googleMapUrl || 'https://maps.google.com/?q=GEM+Center');

      setInvitationMessage(
        initialInfo.invitationMessage ||
          'Tình yêu là khi hai trái tim cùng chung một nhịp đập. Trân trọng kính mời bạn đến chung vui cùng chúng mình trong ngày trọng đại nhất.'
      );
      setLoveStory(
        initialInfo.loveStory ||
          'Gặp nhau vào một chiều thu Hà Nội năm 2021, từ hai người xa lạ chúng mình đã đồng hành qua bao vui buồn để viết nên cái kết viên mãn hôm nay.'
      );
      setGroomParents(initialInfo.groomParents || 'Ông Trần Văn Hùng & Bà Lê Thị Mai');
      setBrideParents(initialInfo.brideParents || 'Ông Nguyễn Văn An & Bà Vũ Thị Cúc');
      setTimeline(
        initialInfo.timeline ||
          '17:30: Đón khách & Chụp ảnh lưu niệm • 18:30: Khai lễ vu quy • 19:00: Khai tiệc mừng & Giao lưu • 20:30: Ném hoa cưới'
      );
      setDesignerNotes(initialInfo.designerNotes || 'Vui lòng nhấn mạnh tone màu kem linen và phông chữ thanh lịch.');

      setVideoUrl(initialInfo.videoUrl || '');
      setVideoNotes(initialInfo.videoNotes || '');
    }
  }, [initialInfo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groomName.trim() || !brideName.trim()) {
      alert('Vui lòng nhập tên cô dâu và chú rể');
      return;
    }
    if (!weddingDate || !weddingTime) {
      alert('Vui lòng chọn ngày và giờ cưới');
      return;
    }
    if (!venueName.trim() || !venueAddress.trim()) {
      alert('Vui lòng nhập thông tin địa điểm cưới');
      return;
    }

    onSave({
      groomName: groomName.trim(),
      brideName: brideName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      weddingDate,
      weddingTime,
      venueName: venueName.trim(),
      venueAddress: venueAddress.trim(),
      googleMapUrl: googleMapUrl.trim(),
      invitationMessage: invitationMessage.trim(),
      loveStory: loveStory.trim(),
      groomParents: groomParents.trim(),
      brideParents: brideParents.trim(),
      timeline: timeline.trim(),
      designerNotes: designerNotes.trim(),
      videoUrl: videoUrl.trim(),
      videoNotes: videoNotes.trim(),
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-espresso/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-surface-card rounded-2xl border border-border-delicate shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-delicate flex items-center justify-between bg-surface-cream/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-burgundy-wine text-white flex items-center justify-center shadow-xs">
              <Icon name="assignment" className="text-[18px]" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-deep-espresso">
                Điền Thông Tin Lễ Cưới
              </h2>
              <p className="text-[11px] text-text-muted">
                Dữ liệu để Designer Nhà Có Tiệc đưa vào bản thiết kế thiệp cưới số của bạn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-subtle text-text-muted hover:text-deep-espresso transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {isSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center gap-2 text-emerald-900 text-xs font-semibold animate-in fade-in">
            <Icon name="check_circle" className="text-[20px] text-emerald-700" />
            <span>Thông tin lễ cưới đã được gửi cho Nhà Có Tiệc.</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 text-xs text-deep-espresso">
          {/* SECTION 1: CUSTOMER INFORMATION */}
          <div className="flex flex-col gap-3">
            <span className="font-label-caps text-[10px] uppercase font-bold text-burgundy-wine tracking-wider border-b border-border-delicate pb-1 flex items-center gap-1.5">
              <Icon name="person" className="text-[14px]" />
              1. Thông Tin Dâu Rể (Customer Information)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-deep-espresso">
                  Tên cô dâu <span className="text-burgundy-wine">*</span>
                </label>
                <input
                  type="text"
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Minh Anh"
                  required
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-deep-espresso">
                  Tên chú rể <span className="text-burgundy-wine">*</span>
                </label>
                <input
                  type="text"
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  placeholder="Ví dụ: Trần Đức Minh"
                  required
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-deep-espresso">
                  Số điện thoại liên hệ <span className="text-burgundy-wine">*</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0982 123 456"
                  required
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-deep-espresso">
                  Email nhận bản duyệt thiệp <span className="text-burgundy-wine">*</span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="minhanh.wedding@gmail.com"
                  required
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: WEDDING INFORMATION */}
          <div className="flex flex-col gap-3">
            <span className="font-label-caps text-[10px] uppercase font-bold text-burgundy-wine tracking-wider border-b border-border-delicate pb-1 flex items-center gap-1.5">
              <Icon name="calendar_month" className="text-[14px]" />
              2. Thời Gian &amp; Địa Điểm Tiệc Cưới (Wedding Information)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-deep-espresso">
                  Ngày tổ chức cưới <span className="text-burgundy-wine">*</span>
                </label>
                <input
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  required
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-deep-espresso">
                  Giờ đón khách / Khai tiệc <span className="text-burgundy-wine">*</span>
                </label>
                <input
                  type="time"
                  value={weddingTime}
                  onChange={(e) => setWeddingTime(e.target.value)}
                  required
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="font-semibold text-deep-espresso">
                  Tên địa điểm / Trung tâm tiệc cưới <span className="text-burgundy-wine">*</span>
                </label>
                <input
                  type="text"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="Ví dụ: Trung tâm Hội nghị Tiệc cưới GEM Center (Sảnh Grand Ballroom)"
                  required
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="font-semibold text-deep-espresso">
                  Địa chỉ chi tiết <span className="text-burgundy-wine">*</span>
                </label>
                <input
                  type="text"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  placeholder="Số 8 Nguyễn Bỉnh Khiêm, P. Đa Kao, Quận 1, TP. Hồ Chí Minh"
                  required
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="font-semibold text-deep-espresso">
                  Link Google Maps chỉ đường
                </label>
                <input
                  type="url"
                  value={googleMapUrl}
                  onChange={(e) => setGoogleMapUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=GEM+Center"
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: INVITATION CONTENT */}
          <div className="flex flex-col gap-3">
            <span className="font-label-caps text-[10px] uppercase font-bold text-burgundy-wine tracking-wider border-b border-border-delicate pb-1 flex items-center gap-1.5">
              <Icon name="draw" className="text-[14px]" />
              3. Nội Dung Thiệp &amp; Thông Điệp (Invitation Content)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-deep-espresso">
                  Họ tên Cha Mẹ Nhà Trai
                </label>
                <input
                  type="text"
                  value={groomParents}
                  onChange={(e) => setGroomParents(e.target.value)}
                  placeholder="Ông Trần Văn Hùng & Bà Lê Thị Mai"
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-deep-espresso">
                  Họ tên Cha Mẹ Nhà Gái
                </label>
                <input
                  type="text"
                  value={brideParents}
                  onChange={(e) => setBrideParents(e.target.value)}
                  placeholder="Ông Nguyễn Văn An & Bà Vũ Thị Cúc"
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="font-semibold text-deep-espresso">
                  Lời ngỏ / Lời mời thiệp cưới
                </label>
                <textarea
                  rows={2}
                  value={invitationMessage}
                  onChange={(e) => setInvitationMessage(e.target.value)}
                  placeholder="Lời mời thân thương gửi tới khách..."
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="font-semibold text-deep-espresso">
                  Câu chuyện tình yêu (Love Story)
                </label>
                <textarea
                  rows={2}
                  value={loveStory}
                  onChange={(e) => setLoveStory(e.target.value)}
                  placeholder="Kỷ niệm đẹp hoặc cột mốc đáng nhớ của hai bạn..."
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="font-semibold text-deep-espresso">
                  Lịch trình tiệc cưới (Timeline)
                </label>
                <input
                  type="text"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  placeholder="17:30 Đón khách • 18:30 Khai lễ • 19:00 Khai tiệc..."
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="font-semibold text-deep-espresso">
                  Ghi chú riêng cho Designer
                </label>
                <input
                  type="text"
                  value={designerNotes}
                  onChange={(e) => setDesignerNotes(e.target.value)}
                  placeholder="Yêu cầu về tông màu, phông chữ, thứ tự bài viết..."
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: MEDIA */}
          <div className="flex flex-col gap-3">
            <span className="font-label-caps text-[10px] uppercase font-bold text-burgundy-wine tracking-wider border-b border-border-delicate pb-1 flex items-center gap-1.5">
              <Icon name="movie" className="text-[14px]" />
              4. Video Pre-wedding (Nếu có)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="font-semibold text-deep-espresso">
                  Link Video cưới (Youtube / Vimeo / Drive)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="font-semibold text-deep-espresso">
                  Ghi chú về video
                </label>
                <input
                  type="text"
                  value={videoNotes}
                  onChange={(e) => setVideoNotes(e.target.value)}
                  placeholder="Ví dụ: Tự động phát khi cuộn tới mục Video cưới..."
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-border-delicate flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-border-delicate hover:bg-surface-subtle text-text-muted hover:text-deep-espresso font-semibold text-xs transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white font-semibold text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <Icon name="save" className="text-[16px]" />
              <span>Lưu thông tin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
