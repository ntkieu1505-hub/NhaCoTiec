import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import {
  useOrder,
  useCustomerExport,
  customerSubmitPaymentConfirmation,
  customerSubmitWeddingInfo,
  customerSubmitAlbum,
  customerSubmitRevision,
} from '../../../mocks/orderStore';
import { getTemplateById, getTemplateBySlug, getAllTemplates } from '../../../mocks/templateStore';
import { MOCK_GUESTS, MOCK_WISHES } from '../../../mocks/index';
import { RevisionModal } from '../components/RevisionModal';
import { WeddingInfoModal } from '../components/WeddingInfoModal';
import { PhotoAlbumModal } from '../components/PhotoAlbumModal';
import { ORDER_STAGES, PAYMENT_STATUS_META } from '../../../utils/constants';
import { OrderStatusStage, ORDER_STATUS_MAP, WeddingInformation } from '../../../types/order';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';

export const CustomerDashboardPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isWeddingInfoModalOpen, setIsWeddingInfoModalOpen] = useState(false);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [wishes, setWishes] = useState(MOCK_WISHES);
  const [guests] = useState(MOCK_GUESTS);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [previewTab, setPreviewTab] = useState<'guests' | 'wishes'>('guests');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const liveOrder = useOrder('NCT01') || {
    id: 'NCT01',
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
    currentStage: 1 as const,
    createdAt: '2026-09-08T19:15:00Z',
    updatedAt: '2026-09-08T22:00:00Z',
  };

  // Data-driven current step strictly mapped from orderStatus
  const currentStep: OrderStatusStage =
    ORDER_STATUS_MAP[liveOrder.orderStatus] || liveOrder.currentStage || 1;
  const currentMeta = ORDER_STAGES[currentStep];

  const exportData = useCustomerExport(liveOrder.id);
  const isDataDelivered = exportData?.status === 'sent';

  const selectedTemplate =
    (liveOrder.templateId ? getTemplateById(liveOrder.templateId) : undefined) ||
    getTemplateBySlug('minh-anh-tuan-kiet') ||
    getAllTemplates()[0];

  // Business Rule: Personalized invitation URL is ONLY shown when orderStatus === 'completed' AND invitationUrl exists
  const isDesignCompleted = liveOrder.orderStatus === 'completed' && Boolean(liveOrder.invitationUrl);
  const templateDemoUrl = selectedTemplate?.previewUrl || 'https://nhacotiec.vn/demo/minh-anh';

  const handleWeddingInfoSave = (data: Partial<WeddingInformation>) => {
    customerSubmitWeddingInfo(liveOrder.id, data);
  };

  const handleAlbumSave = (photos: string[]) => {
    customerSubmitAlbum(liveOrder.id, photos);
  };

  const handleRevisionSubmit = (data: { topics: string[]; content: string; referenceUrl?: string }) => {
    customerSubmitRevision(liveOrder.id, data);
  };

  const togglePinWish = (id: string) => {
    setWishes(
      wishes.map((w) => (w.id === id ? { ...w, isPinned: !w.isPinned } : w))
    );
  };

  const handleCopy = () => {
    if (navigator.clipboard && liveOrder.invitationUrl) {
      navigator.clipboard.writeText(liveOrder.invitationUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDownloadFile = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
    const element = document.createElement('a');
    const file = new Blob([
      `Mã đơn,Tên khách mời,Số điện thoại,Trạng thái RSVP,Ghi chú\n` +
      `NCT01,Nguyễn Hoàng Long,0901234567,Tham dự,Ngồi gần bàn cô dâu\n` +
      `NCT01,Trần Bảo Ngọc,0912345678,Tham dự,Đi cùng 1 người\n` +
      `NCT01,Lê Tuấn Kiệt,0923456789,Chờ xác nhận,-\n` +
      `NCT01,Phạm Mai Anh,0934567890,Bận việc,-\n\n` +
      `Người gửi,Mối quan hệ,Lời chúc\n` +
      `Nguyễn Hoàng Long,Bạn chú rể,Chúc hai bạn trăm năm hạnh phúc, đầu bạc răng long!\n` +
      `Trần Bảo Ngọc,Em gái cô dâu,Chúc chị gái của em luôn xinh đẹp và hạnh phúc bên anh rể nhé!\n` +
      `Cô Lê Thị Mai,Bác ruột,Chúc hai cháu luôn yêu thương và thấu hiểu nhau suốt cuộc đời.\n`
    ], { type: 'text/csv;charset=utf-8;' });
    element.href = URL.createObjectURL(file);
    element.download = exportData?.fileName || 'danh-sach-khach-moi-va-loi-chuc-nct01.csv';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col w-full text-deep-espresso pb-20">
      {/* Sticky Anchor Navigation Chips */}
      <div className="sticky top-[52px] z-40 bg-surface-cream/95 backdrop-blur-md border-b border-border-delicate px-4 py-2.5 flex flex-col gap-2 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Icon name="dashboard" className="text-[15px] text-burgundy-wine" />
            <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-deep-espresso">
              CỔNG KHÁCH HÀNG
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-700/20 shadow-2xs">
              Mã đơn #{liveOrder.id}
            </span>
          </div>
        </div>

        {/* 3 Main Navigation Chips Only */}
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
          {[
            { id: 'overview', label: 'Tổng quan' },
            { id: 'invitations', label: 'Thiệp của tôi' },
            { id: 'orders', label: 'Thông tin đơn hàng' },
          ].map((tab) => (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 min-w-fit px-4 py-2 rounded-full text-xs font-semibold transition-all text-center ${
                activeSection === tab.id
                  ? 'bg-burgundy-wine text-white shadow-xs'
                  : 'bg-surface-card text-deep-espresso border border-border-delicate hover:bg-surface-subtle'
              }`}
            >
              <span>{tab.label}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Main Content Sections Container */}
      <div className="px-4 py-4 flex flex-col gap-5">
        {/* SECTION 1: #overview - TỔNG QUAN TÀI KHOẢN & ĐƠN HÀNG */}
        <section id="overview" className="scroll-mt-32 flex flex-col gap-4">
          <div className="bg-surface-card rounded-2xl p-5 shadow-xs border border-border-delicate flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-delicate">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-burgundy-wine/10 text-burgundy-wine flex items-center justify-center flex-shrink-0">
                  <Icon name="dashboard" className="text-[22px]" />
                </div>
                <div>
                  <span className="font-label-caps text-[9px] uppercase tracking-wider font-bold text-burgundy-wine block">
                    Cổng dịch vụ khách hàng
                  </span>
                  <h2 className="font-serif text-lg font-bold text-deep-espresso">
                    Tổng quan đơn hàng
                  </h2>
                </div>
              </div>
              <span className="font-label-caps text-[10px] px-2.5 py-1 rounded-full font-bold text-burgundy-wine bg-rose-50 border border-rose-200">
                Bước {currentStep} / 8 • {currentMeta.name}
              </span>
            </div>

            {/* Current Status Message Banner */}
            <div className="p-4 rounded-xl bg-surface-cream border border-border-delicate flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-burgundy-wine animate-ping" />
                <span className="font-semibold text-deep-espresso text-xs">
                  Trạng thái hiện tại: {currentMeta.name}
                </span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                {currentMeta.message}
              </p>
            </div>

            {/* Wedding Key Info Highlights */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border-delicate flex flex-col gap-0.5">
                <span className="text-[10px] text-text-muted uppercase font-bold">Cặp đôi</span>
                <span className="font-semibold text-deep-espresso truncate">{liveOrder.customerName}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border-delicate flex flex-col gap-0.5">
                <span className="text-[10px] text-text-muted uppercase font-bold">Ngày cưới</span>
                <span className="font-semibold text-deep-espresso">28/12/2026</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border-delicate flex flex-col gap-0.5">
                <span className="text-[10px] text-text-muted uppercase font-bold">Mẫu thiệp đã chọn</span>
                <span className="font-semibold text-deep-espresso truncate">
                  {liveOrder.templateName || selectedTemplate?.name || 'Minh Anh Editorial'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border-delicate flex flex-col gap-0.5">
                <span className="text-[10px] text-text-muted uppercase font-bold">Địa điểm tiệc</span>
                <span className="font-semibold text-deep-espresso truncate">GEM Center • TP. HCM</span>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="pt-2 border-t border-border-delicate flex flex-col sm:flex-row items-center gap-2">
              <a
                href="#invitations"
                onClick={() => setActiveSection('invitations')}
                className="flex-1 w-full h-10 rounded-full bg-surface-subtle hover:bg-surface-cream text-deep-espresso border border-border-delicate text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Icon name="favorite" className="text-[16px] text-burgundy-wine" />
                <span>Xem Thiệp của tôi</span>
              </a>
              <a
                href="#orders"
                onClick={() => setActiveSection('orders')}
                className="flex-1 w-full h-10 rounded-full bg-surface-subtle hover:bg-surface-cream text-deep-espresso border border-border-delicate text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Icon name="route" className="text-[16px] text-burgundy-wine" />
                <span>Xem Tiến độ 8 bước &amp; Đơn hàng</span>
              </a>
            </div>
          </div>
        </section>

        {/* SECTION 2: #invitations - THIỆP CỦA TÔI */}
        <section id="invitations" className="scroll-mt-32 bg-surface-card rounded-2xl p-5 shadow-xs border border-border-delicate flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-delicate">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-burgundy-wine/10 text-burgundy-wine flex items-center justify-center flex-shrink-0">
                <Icon name="favorite" className="text-[22px]" />
              </div>
              <div>
                <span className="font-label-caps text-[9px] uppercase tracking-wider font-bold text-burgundy-wine block">
                  Thiệp cưới trực tuyến
                </span>
                <h3 className="font-serif text-base font-bold text-deep-espresso">
                  Thiệp của tôi
                </h3>
              </div>
            </div>

            {/* Status Badge */}
            {isDesignCompleted ? (
              <span className="font-label-caps text-[10px] px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1 shadow-2xs">
                <Icon name="check_circle" className="text-[13px] text-emerald-700" />
                Thiệp đã hoàn thiện
              </span>
            ) : (
              <span className="font-label-caps text-[10px] px-3 py-1 rounded-full bg-amber-50 text-amber-900 font-semibold border border-amber-300 flex items-center gap-1">
                <Icon name="hourglass_top" className="text-[13px] text-amber-700 animate-pulse" />
                Mẫu đã chọn (Đang hoàn thiện thiết kế)
              </span>
            )}
          </div>

          {/* STATE B: Design Completed -> Show Personalized Invitation */}
          {isDesignCompleted ? (
            <div className="flex flex-col gap-4">
              {/* Personalized Card Mockup - Modern Smartphone 9:16 Viewport Ratio */}
              <div className="relative rounded-2xl bg-surface-cream p-5 flex flex-col items-center border border-border-delicate">
                <div
                  className="relative w-full max-w-[210px] sm:max-w-[220px] rounded-[32px] bg-[#181513] p-2 shadow-xl border-2 border-gold-foil/40 flex flex-col"
                  style={{ aspectRatio: '9 / 19.5' }}
                >
                  {/* Phone top notch & speaker bar */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-3 bg-[#181513] rounded-full z-20 flex items-center justify-center pointer-events-none shadow-sm border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-black/70 mr-1.5" />
                    <div className="w-1 h-1 rounded-full bg-[#1c2d42]/70" />
                  </div>
                  {/* Screen inner */}
                  <div className="w-full h-full rounded-[24px] overflow-hidden relative bg-[#181513]">
                    <img
                      src={selectedTemplate?.thumbnailUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuD2_62rMEgJ8nXC33r0uq3nJqEG9RgG5IEhjCegzLpgI6HPl3lHaJacV4PF85V8TW_q1Pg9kyilcFa790HqwY39FEd02rboRYswC73R6smVsOfBgcgMDlMyrFazP-mOPIqkFMI4TCBfIdEmC8ADLYACFyJrlozCAkRGMAdfG75Z-_4PZLBN4emzTykR8sW_6w5SgmUOnFXbHLPMVrFg3_24Vk6N4_0REnbiMNSz6xrU8E9Qyuavl1g2"}
                      alt="Wedding Invitation Preview"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: selectedTemplate?.thumbnailPosition || 'center 30%' }}
                    />
                  </div>
                </div>

                {/* Personalized Specs */}
                <div className="w-full flex flex-col gap-2 mt-4 pt-3 border-t border-border-delicate text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Tiêu đề thiệp:</span>
                    <span className="font-semibold text-deep-espresso">
                      {liveOrder.weddingInfo
                        ? `Thiệp cưới ${liveOrder.weddingInfo.groomName} & ${liveOrder.weddingInfo.brideName}`
                        : 'Thiệp cưới Minh Anh & Đức Minh'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Cặp đôi dâu rể:</span>
                    <span className="font-semibold text-deep-espresso">
                      {liveOrder.weddingInfo
                        ? `${liveOrder.weddingInfo.groomName} & ${liveOrder.weddingInfo.brideName}`
                        : liveOrder.customerName || 'Nguyễn Minh Anh & Trần Đức Minh'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Ngày cưới:</span>
                    <span className="font-medium text-deep-espresso">
                      {liveOrder.weddingInfo?.weddingDate || '28/12/2026'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Trạng thái:</span>
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300 inline-flex items-center gap-1 shadow-2xs">
                      <Icon name="check_circle" className="text-[12px] text-emerald-700" />
                      Hoàn tất
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Mẫu thiết kế:</span>
                    <span className="font-semibold text-deep-espresso">
                      {liveOrder.templateName || selectedTemplate?.name || 'Minh Anh Editorial'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Đường dẫn riêng của bạn:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-burgundy-wine font-bold text-[11px] truncate max-w-[190px]">
                        {liveOrder.invitationUrl}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="text-[10px] px-2 py-0.5 rounded bg-surface-subtle hover:bg-surface-cream text-burgundy-wine border border-burgundy-wine/30 font-medium transition-colors"
                      >
                        {copiedLink ? 'Đã chép' : 'Chép'}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Nhạc nền:</span>
                    <span className="font-medium text-deep-espresso">
                      {liveOrder.weddingInfo?.musicTitle || 'A Thousand Years - Christina Perri'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Action CTA: "Mở thiệp" */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <a
                  href={liveOrder.invitationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 w-full h-11 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Icon name="open_in_new" className="text-[18px]" />
                  <span>Mở thiệp</span>
                </a>
              </div>
            </div>
          ) : (
            /* STATE A: Before Design Completed -> Show Selected Template Info & "Mẫu đã chọn" CTA */
            <div className="flex flex-col gap-4">
              <div className="relative rounded-2xl bg-surface-cream p-5 flex flex-col items-center border border-border-delicate">
                {/* Template Demo Visual Preview - Modern Smartphone 9:16 Viewport Ratio */}
                <div
                  className="relative w-full max-w-[210px] sm:max-w-[220px] rounded-[32px] bg-[#181513] p-2 shadow-xl border-2 border-gold-foil/30 flex flex-col"
                  style={{ aspectRatio: '9 / 19.5' }}
                >
                  {/* Phone top notch & speaker bar */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-3 bg-[#181513] rounded-full z-20 flex items-center justify-center pointer-events-none shadow-sm border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-black/70 mr-1.5" />
                    <div className="w-1 h-1 rounded-full bg-[#1c2d42]/70" />
                  </div>
                  {/* Screen inner */}
                  <div className="w-full h-full rounded-[24px] overflow-hidden relative bg-[#181513]">
                    <img
                      src={selectedTemplate?.thumbnailUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuD2_62rMEgJ8nXC33r0uq3nJqEG9RgG5IEhjCegzLpgI6HPl3lHaJacV4PF85V8TW_q1Pg9kyilcFa790HqwY39FEd02rboRYswC73R6smVsOfBgcgMDlMyrFazP-mOPIqkFMI4TCBfIdEmC8ADLYACFyJrlozCAkRGMAdfG75Z-_4PZLBN4emzTykR8sW_6w5SgmUOnFXbHLPMVrFg3_24Vk6N4_0REnbiMNSz6xrU8E9Qyuavl1g2"}
                      alt="Template Preview"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: selectedTemplate?.thumbnailPosition || 'center 30%' }}
                    />
                  </div>
                </div>

                {/* Template Specifications */}
                <div className="w-full flex flex-col gap-2 mt-4 pt-3 border-t border-border-delicate text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Mẫu đã chọn:</span>
                    <span className="font-semibold text-deep-espresso">
                      {liveOrder.templateName || selectedTemplate?.name || 'Minh Anh Editorial'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Phong cách:</span>
                    <span className="font-medium text-deep-espresso">
                      {selectedTemplate?.style || 'Thanh lịch & Tối giản'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Giá mẫu thiệp:</span>
                    <span className="font-serif font-bold text-burgundy-wine">
                      {formatCurrency(liveOrder.price || 79000)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-subtle/70 border border-border-delicate flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-1.5 text-deep-espresso font-semibold">
                      <Icon name="lock" className="text-[14px] text-gold-foil" />
                      <span>Đường dẫn thiệp cưới riêng đang được bảo lưu</span>
                    </div>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      Đường dẫn thiệp cưới trực tuyến riêng của cặp đôi sẽ được kích hoạt tại mục này ngay khi đội ngũ Nhà Có Tiệc hoàn tất thiết kế chính thức.
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Action CTA: "Mẫu đã chọn" (opens demo URL, NOT personal finished URL) */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <a
                  href={templateDemoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 w-full h-11 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Icon name="visibility" className="text-[18px]" />
                  <span>Mẫu đã chọn</span>
                </a>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 3: #orders - THÔNG TIN ĐƠN HÀNG */}
        <section id="orders" className="scroll-mt-32 flex flex-col gap-4">
          {/* COMPLETE 8-STEP OFFICIAL TIMELINE STEPPER (Relocated from Thiệp của tôi / Tổng quan) */}
          <div className="bg-surface-card rounded-2xl p-4 sm:p-5 shadow-xs border border-border-delicate flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-delicate">
              <div className="flex items-center gap-2">
                <Icon name="route" className="text-[20px] text-burgundy-wine" />
                <div>
                  <span className="font-label-caps text-[9px] uppercase tracking-wider font-bold text-burgundy-wine block">
                    Quy trình vận hành chuẩn
                  </span>
                  <h3 className="font-serif text-base font-bold text-deep-espresso">
                    Tiến độ hoàn thiện thiệp
                  </h3>
                </div>
              </div>
              <span className="text-xs font-bold text-burgundy-wine bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                Bước {currentStep} / 8 • {currentMeta.name}
              </span>
            </div>

            {/* Stepper list: Only show current and completed steps */}
            <div className="flex flex-col relative pl-1 pt-1">
              {([1, 2, 3, 4, 5, 6, 7, 8] as OrderStatusStage[])
                .filter((stepNum) => stepNum <= currentStep)
                .map((stepNum) => {
                  const isCompleted = stepNum < currentStep;
                  const isCurrent = stepNum === currentStep;
                  const meta = ORDER_STAGES[stepNum];

                  return (
                    <div key={stepNum} className="relative flex items-start gap-3.5 pb-5 last:pb-1">
                      {/* Connecting line between steps */}
                      {stepNum < currentStep && (
                        <div className="absolute left-[13px] top-6 bottom-0 w-0.5 bg-burgundy-wine" />
                      )}

                    {/* Step Icon Indicator (✓, ●, ○) */}
                    <div
                      className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                        isCompleted
                          ? 'bg-burgundy-wine text-white shadow-xs'
                          : isCurrent
                          ? 'bg-burgundy-wine text-white ring-4 ring-burgundy-wine/25 shadow-sm animate-pulse'
                          : 'bg-surface-subtle text-text-muted/60 border border-border-delicate'
                      }`}
                    >
                      {isCompleted ? (
                        <span className="leading-none text-sm">✓</span>
                      ) : isCurrent ? (
                        <span className="leading-none text-xs">●</span>
                      ) : (
                        <span className="leading-none text-xs font-normal">○</span>
                      )}
                    </div>

                    {/* Step Information & Action */}
                    <div className="flex flex-col min-w-0 flex-1 pt-0.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span
                          className={`text-xs ${
                            isCurrent
                              ? 'font-bold text-burgundy-wine text-sm'
                              : isCompleted
                              ? 'font-semibold text-deep-espresso'
                              : 'font-normal text-text-muted/70'
                          }`}
                        >
                          {stepNum}. {meta.name}
                        </span>

                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 font-label-caps text-[10px] px-2.5 py-0.5 rounded-full bg-burgundy-wine text-white font-bold shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            Bạn đang ở bước này
                          </span>
                        ) : isCompleted ? (
                          <span className="font-label-caps text-[9px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                            Hoàn thành
                          </span>
                        ) : (
                          <span className="font-label-caps text-[9px] text-text-muted/60">
                            Chưa thực hiện
                          </span>
                        )}
                      </div>

                      {/* If Current Step: Show Message & Step-tailored Action */}
                      {isCurrent && (
                        <div className="mt-2.5 p-3.5 rounded-xl bg-surface-cream border border-border-delicate flex flex-col gap-2.5">
                          <p className="text-xs text-deep-espresso leading-relaxed">
                            {meta.message}
                          </p>

                          {/* Dynamic Actions for Current Step */}
                          <div className="pt-1">
                            {/* STEP 1: Chờ thanh toán */}
                            {currentStep === 1 && (
                              <div className="flex flex-col gap-2">
                                {liveOrder.paymentStatus === 'pending_confirmation' ? (
                                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 text-xs flex flex-col gap-1.5">
                                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                                      <Icon name="hourglass_top" className="text-[16px] text-amber-700 animate-spin" />
                                      <span>Đang chờ Admin xác nhận thanh toán</span>
                                    </div>
                                    <span className="text-[11px] text-text-muted leading-relaxed">
                                      Nhà Có Tiệc đang kiểm tra đối soát giao dịch của bạn. Đơn hàng sẽ tự động chuyển sang bước 2 sau khi Admin duyệt.
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-2">
                                    <Link
                                      to={`/thanh-toan/${liveOrder.id}`}
                                      className="w-full h-10 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                                    >
                                      <Icon name="qr_code_scanner" className="text-[16px]" />
                                      <span>Thanh toán chuyển khoản ngân hàng</span>
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() => customerSubmitPaymentConfirmation(liveOrder.id)}
                                      className="w-full h-9 rounded-full bg-surface-card hover:bg-surface-subtle text-deep-espresso border border-border-delicate text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                      <Icon name="check_circle" className="text-[15px] text-emerald-700" />
                                      <span>Tôi đã hoàn tất chuyển khoản</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* STEP 2: Đã thanh toán */}
                            {currentStep === 2 && (
                              <div className="flex flex-col gap-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setIsWeddingInfoModalOpen(true)}
                                    className="h-10 rounded-full bg-deep-espresso hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                                  >
                                    <Icon name="edit_note" className="text-[16px] text-rose-200" />
                                    <span>
                                      {liveOrder.weddingInfoSubmitted ? 'Sửa thông tin lễ cưới' : 'Điền thông tin lễ cưới'}
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setIsAlbumModalOpen(true)}
                                    className="h-10 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                                  >
                                    <Icon name="photo_library" className="text-[16px] text-amber-200" />
                                    <span>
                                      {liveOrder.albumSubmitted
                                        ? `Album (${liveOrder.weddingInfo?.albumPhotoCount || liveOrder.weddingInfo?.albumPhotos?.length || 0} ảnh)`
                                        : 'Tải album ảnh'}
                                    </span>
                                  </button>
                                </div>
                                {(liveOrder.weddingInfoSubmitted || liveOrder.albumSubmitted) && (
                                  <div className="flex items-center gap-2 text-[11px] text-emerald-800 pt-0.5">
                                    <Icon name="check_circle" className="text-[14px]" />
                                    <span>Dữ liệu đã được lưu và chuyển giao cho Nhà Có Tiệc.</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* STEP 3: Đã nhận thông tin */}
                            {currentStep === 3 && (
                              <div className="flex flex-col gap-2">
                                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-1.5 font-medium">
                                  <Icon name="check_circle" className="text-[16px] text-emerald-700" />
                                  <span>Thông tin đã được tiếp nhận</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setIsWeddingInfoModalOpen(true)}
                                    className="h-9 rounded-full bg-surface-card hover:bg-surface-subtle text-deep-espresso border border-border-delicate text-xs font-medium flex items-center justify-center gap-1"
                                  >
                                    <Icon name="visibility" className="text-[15px]" />
                                    <span>Xem thông tin cưới</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setIsAlbumModalOpen(true)}
                                    className="h-9 rounded-full bg-surface-card hover:bg-surface-subtle text-deep-espresso border border-border-delicate text-xs font-medium flex items-center justify-center gap-1"
                                  >
                                    <Icon name="photo_library" className="text-[15px]" />
                                    <span>Xem album ảnh</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* STEP 4: Đang thiết kế */}
                            {currentStep === 4 && (
                              <div className="flex flex-col gap-2">
                                <div className="p-2.5 rounded-lg bg-surface-subtle border border-border-delicate text-deep-espresso text-xs flex items-center gap-2">
                                  <Icon name="draw" className="text-[18px] text-gold-foil flex-shrink-0" />
                                  <span>Thiệp đang được thiết kế — Studio đang căn chỉnh bố cục và hiệu ứng.</span>
                                </div>
                                <a
                                  href="https://zalo.me"
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-full h-9 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                >
                                  <Icon name="chat" className="text-[15px]" />
                                  <span>Trao đổi với Designer</span>
                                </a>
                              </div>
                            )}

                            {/* STEP 5: Bàn giao thiết kế */}
                            {currentStep === 5 && (
                              <div className="flex flex-col gap-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <a
                                    href={templateDemoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="h-10 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                                  >
                                    <Icon name="visibility" className="text-[16px]" />
                                    <span>Xem bản nháp</span>
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => setIsRevisionModalOpen(true)}
                                    className="h-10 rounded-full bg-surface-card hover:bg-surface-subtle text-burgundy-wine border border-burgundy-wine/40 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                                  >
                                    <Icon name="edit_note" className="text-[16px]" />
                                    <span>Yêu cầu chỉnh sửa</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* STEP 6: Chỉnh sửa thiết kế */}
                            {currentStep === 6 && (
                              <div className="flex flex-col gap-2">
                                <div className="p-2.5 rounded-lg bg-surface-subtle border border-border-delicate text-deep-espresso text-xs flex items-center gap-2">
                                  <Icon name="history_edu" className="text-[18px] text-burgundy-wine flex-shrink-0" />
                                  <span>Yêu cầu chỉnh sửa đang được xử lý</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setIsRevisionModalOpen(true)}
                                  className="w-full h-9 rounded-full bg-surface-card hover:bg-surface-subtle text-burgundy-wine border border-burgundy-wine/40 text-xs font-semibold flex items-center justify-center gap-1.5"
                                >
                                  <Icon name="edit_note" className="text-[15px]" />
                                  <span>Gửi thêm ghi chú chỉnh sửa</span>
                                </button>
                              </div>
                            )}

                            {/* STEP 7: Hoàn tất */}
                            {currentStep === 7 && (
                              <div className="flex flex-col gap-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <a
                                    href={liveOrder.invitationUrl || templateDemoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="h-10 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                                  >
                                    <Icon name="open_in_new" className="text-[16px]" />
                                    <span>Mở thiệp</span>
                                  </a>
                                  {liveOrder.invitationUrl && (
                                    <button
                                      type="button"
                                      onClick={handleCopy}
                                      className="h-10 rounded-full bg-surface-card hover:bg-surface-subtle text-deep-espresso border border-border-delicate text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                                    >
                                      <Icon name="content_copy" className="text-[16px]" />
                                      <span>{copiedLink ? 'Đã chép link!' : 'Sao chép link thiệp'}</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* STEP 8: Đang hoạt động / Đã hết hạn */}
                            {currentStep === 8 && (
                              <div className="p-3 rounded-xl bg-surface-subtle border border-border-delicate text-center text-xs text-text-muted flex flex-col gap-1">
                                <span className="font-semibold text-deep-espresso">Thiệp đã hết hạn</span>
                                <span>Kỷ niệm ngày cưới đã được lưu trữ an toàn. Bạn có thể gia hạn bất cứ lúc nào.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {currentStep < 8 && (
              <div className="p-3 rounded-xl bg-surface-subtle/70 border border-border-delicate flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-text-muted">
                  <Icon name="lock" className="text-[15px] text-gold-foil shrink-0" />
                  <span>
                    Bước kế tiếp: <strong>Bước {currentStep + 1} • {ORDER_STAGES[(currentStep + 1) as OrderStatusStage].name}</strong>
                  </span>
                </div>
                <span className="text-[10px] text-text-muted italic hidden sm:inline">(Sẽ mở khi hoàn tất bước hiện tại)</span>
              </div>
            )}

            {/* Link to order detail */}
            <div className="pt-2 border-t border-border-delicate flex items-center justify-between text-xs">
              <span className="text-text-muted">Mã đơn hàng #{liveOrder.id}</span>
              <Link
                to={`/dashboard/don-hang/${liveOrder.id}`}
                className="text-burgundy-wine font-semibold hover:underline flex items-center gap-1"
              >
                <span>Xem chi tiết đơn hàng &amp; nhật ký</span>
                <Icon name="arrow_forward" className="text-[15px]" />
              </Link>
            </div>
          </div>

          {/* ORDER SPECIFICATIONS CARD */}
          <div className="bg-surface-card rounded-2xl p-4 shadow-xs border border-border-delicate flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-border-delicate">
              <div className="flex items-center gap-2">
                <Icon name="receipt_long" className="text-[20px] text-burgundy-wine" />
                <div>
                  <span className="font-label-caps text-[9px] uppercase tracking-wider font-bold text-burgundy-wine block">
                    Hợp đồng dịch vụ
                  </span>
                  <h3 className="font-serif text-base font-bold text-deep-espresso">
                    Thông tin đơn hàng
                  </h3>
                </div>
              </div>
              <span
                className={`font-label-caps text-[10px] px-2.5 py-0.5 rounded-full border ${
                  PAYMENT_STATUS_META[liveOrder.paymentStatus]?.colorClass || 'bg-surface-subtle text-text-muted border-border-delicate'
                }`}
              >
                {PAYMENT_STATUS_META[liveOrder.paymentStatus]?.label || 'Chưa thanh toán'}
              </span>
            </div>

            <div className="rounded-xl border border-border-delicate bg-surface-cream/50 divide-y divide-border-delicate text-xs">
              <div className="p-2.5 flex items-center justify-between">
                <span className="text-text-muted">Mã đơn:</span>
                <span className="font-mono font-bold text-deep-espresso">#{liveOrder.id}</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <span className="text-text-muted">Tổng chi phí:</span>
                <span className="font-serif font-bold text-deep-espresso">
                  {formatCurrency(liveOrder.price || 79000)}
                </span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <span className="text-text-muted">Tiến trình:</span>
                <span className="text-burgundy-wine font-semibold">
                  Bước {liveOrder.currentStage}/8 • {ORDER_STAGES[liveOrder.currentStage]?.name || 'Tiến trình'}
                </span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <span className="text-text-muted">Thời hạn lưu trữ thiệp:</span>
                <span className="font-semibold text-deep-espresso flex items-center gap-1">
                  <Icon name="schedule" className="text-[14px] text-gold-foil" />
                  <span>365 ngày (đến 28/12/2027)</span>
                </span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <span className="text-text-muted">Hạn chót gửi dữ liệu:</span>
                <span className="font-semibold text-burgundy-wine bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  25/12/2026
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <Link
                to={`/dashboard/don-hang/${liveOrder.id}`}
                className="flex-1 w-full h-10 rounded-full bg-surface-subtle text-deep-espresso text-xs font-semibold flex items-center justify-center gap-1.5 border border-border-delicate hover:bg-surface-container-high transition-colors"
              >
                <Icon name="route" className="text-[16px] text-burgundy-wine" />
                <span>Xem chi tiết tiến trình đơn hàng</span>
              </Link>

              {(currentStep === 5 || currentStep === 6) && (
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(true)}
                  className="w-full sm:w-auto px-4 h-10 rounded-full bg-surface-card hover:bg-surface-subtle text-burgundy-wine border border-burgundy-wine/40 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Icon name="edit_note" className="text-[16px]" />
                  <span>Yêu cầu chỉnh sửa</span>
                </button>
              )}
            </div>
          </div>

          {/* DỮ LIỆU ĐƠN HÀNG: KHÁCH MỜI, LỜI CHÚC & CHUYỂN GIAO FILE EXCEL */}
          <div className="bg-surface-card rounded-2xl p-4 shadow-xs border border-border-delicate flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-delicate">
              <div className="flex items-center gap-2">
                <Icon name="folder_shared" className="text-[20px] text-burgundy-wine" />
                <div>
                  <span className="font-label-caps text-[9px] uppercase tracking-wider font-bold text-burgundy-wine block">
                    Dữ liệu ngày cưới
                  </span>
                  <h3 className="font-serif text-base font-bold text-deep-espresso">
                    Khách mời &amp; Lời chúc
                  </h3>
                </div>
              </div>
              {/* Delivery Status Badge */}
              {isDataDelivered ? (
                <span className="inline-flex items-center gap-1 font-label-caps text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold">
                  <Icon name="check_circle" className="text-[13px] text-emerald-700" />
                  Dữ liệu khách mời đã sẵn sàng
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-label-caps text-[10px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-bold">
                  <Icon name="hourglass_top" className="text-[13px] text-amber-700 animate-pulse" />
                  Đang chờ dữ liệu
                </span>
              )}
            </div>

            {!isDataDelivered ? (
              /* INITIAL STATE: BEFORE ADMIN SENDS EXCEL */
              <div className="flex flex-col gap-3 py-2">
                <div className="p-4 rounded-xl bg-surface-subtle/70 border border-border-delicate flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-deep-espresso font-semibold text-xs">
                    <Icon name="hourglass_empty" className="text-[18px] text-gold-foil flex-shrink-0" />
                    <span>Nhà Có Tiệc sẽ gửi file khách mời sau khi hoàn tất tổng hợp</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Đội ngũ Nhà Có Tiệc đang thu thập phản hồi RSVP và lời chúc từ thiệp online của bạn. File tổng hợp Excel hoàn chỉnh sẽ được gửi trực tiếp tại mục này sau khi quá trình đối soát kết thúc.
                  </p>
                  <div className="mt-1 pt-2 border-t border-border-delicate/80 flex items-center justify-between text-xs">
                    <span className="text-text-muted font-medium">Hạn chót nhận dữ liệu:</span>
                    <span className="font-semibold text-burgundy-wine bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      {exportData?.deadline || '25/12/2026'}
                    </span>
                  </div>
                </div>

                {/* Informative notification: NO guest list, NO wishes, NO download button */}
                <div className="flex items-center justify-between text-[11px] text-text-muted px-2">
                  <span className="flex items-center gap-1">
                    <Icon name="lock" className="text-[14px] text-text-muted/70" />
                    Danh sách khách và lời chúc tạm ẩn để đảm bảo tính chuẩn xác trước ngày cưới.
                  </span>
                  <Link
                    to="/admin/khach-moi-loi-chuc"
                    className="text-burgundy-wine hover:underline font-semibold text-[11px] whitespace-nowrap ml-2"
                  >
                    Admin Hub (Demo gửi file) &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              /* DELIVERED STATE: AFTER ADMIN SENDS EXCEL */
              <div className="flex flex-col gap-4">
                {/* File details card */}
                <div className="p-3.5 rounded-xl bg-surface-subtle/70 border border-border-delicate flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center flex-shrink-0 border border-emerald-200">
                        <Icon name="table_view" className="text-[22px]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-deep-espresso text-xs truncate">
                          {exportData?.fileName || 'danh-sach-khach-moi-va-loi-chuc-nct01.xlsx'}
                        </span>
                        <span className="text-[11px] text-text-muted">
                          Dung lượng: {exportData?.fileSize || '184 KB'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-[10px] text-text-muted">Ngày gửi</span>
                      <span className="text-[11px] font-semibold text-deep-espresso">
                        {exportData?.sentAt ? formatDateTime(exportData.sentAt) : '08/09/2026 22:30'}
                      </span>
                    </div>
                  </div>

                  {downloadSuccess && (
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5 font-medium">
                      <Icon name="check_circle" className="text-[16px]" />
                      <span>Đã tải file thành công về thiết bị của bạn!</span>
                    </div>
                  )}

                  {/* Primary Actions: "Xem dữ liệu" & "Tải file" */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowDataPreview(!showDataPreview)}
                      className="h-10 rounded-full bg-surface-card hover:bg-surface-cream text-deep-espresso text-xs font-semibold border border-border-delicate flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Icon name={showDataPreview ? 'expand_less' : 'visibility'} className="text-[16px] text-burgundy-wine" />
                      <span>{showDataPreview ? 'Thu gọn dữ liệu' : 'Xem dữ liệu'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadFile}
                      className="h-10 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Icon name="download" className="text-[16px]" />
                      <span>Tải Excel</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Data Preview: Guests and Wishes */}
                {showDataPreview && (
                  <div className="flex flex-col gap-3 pt-1 border-t border-border-delicate">
                    {/* Tab switch for preview */}
                    <div className="flex items-center gap-2 bg-surface-subtle p-1 rounded-xl border border-border-delicate">
                      <button
                        type="button"
                        onClick={() => setPreviewTab('guests')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          previewTab === 'guests'
                            ? 'bg-surface-card text-burgundy-wine shadow-xs'
                            : 'text-text-muted hover:text-deep-espresso'
                        }`}
                      >
                        <Icon name="recent_actors" className="text-[15px]" />
                        <span>Khách tham dự ({guests.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab('wishes')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          previewTab === 'wishes'
                            ? 'bg-surface-card text-burgundy-wine shadow-xs'
                            : 'text-text-muted hover:text-deep-espresso'
                        }`}
                      >
                        <Icon name="favorite" className="text-[15px]" />
                        <span>Lời chúc ({wishes.length})</span>
                      </button>
                    </div>

                    {/* Tab 1: Guest List */}
                    {previewTab === 'guests' && (
                      <div className="flex flex-col gap-2">
                        {guests.map((g) => (
                          <div
                            key={g.id}
                            className="p-2.5 rounded-xl bg-surface-subtle/50 border border-border-delicate flex items-center justify-between text-xs"
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold text-deep-espresso">{g.name}</span>
                              <span className="text-[11px] text-text-muted">
                                {g.phone || 'Không có số ĐT'} {g.companionCount > 0 && `• +${g.companionCount} người`}
                              </span>
                              {g.notes && (
                                <span className="text-[10px] text-gold-foil italic mt-0.5">Ghi chú: {g.notes}</span>
                              )}
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-label-caps font-semibold border ${
                                g.rsvpStatus === 'attending'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : g.rsvpStatus === 'declined'
                                  ? 'bg-rose-50 text-burgundy-wine border-rose-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {g.rsvpStatus === 'attending' ? 'Tham dự' : g.rsvpStatus === 'declined' ? 'Bận việc' : 'Chờ xác nhận'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tab 2: Wishes List */}
                    {previewTab === 'wishes' && (
                      <div className="flex flex-col gap-2.5">
                        {wishes.map((w) => (
                          <div
                            key={w.id}
                            className="p-3 rounded-xl bg-surface-subtle/60 border border-border-delicate flex flex-col gap-1.5 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-deep-espresso">{w.senderName}</span>
                                {w.relationship && (
                                  <span className="text-[10px] text-text-muted bg-surface-card px-1.5 py-0.2 rounded border border-border-delicate">
                                    {w.relationship}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => togglePinWish(w.id)}
                                className="text-gold-foil hover:scale-110 transition-transform"
                                title={w.isPinned ? 'Bỏ ghim' : 'Ghim lời chúc lên đầu thiệp'}
                              >
                                <Icon name={w.isPinned ? 'star' : 'star_outline'} className="text-[16px]" />
                              </button>
                            </div>
                            <p className="text-text-muted italic leading-relaxed bg-surface-card p-2 rounded-lg border border-border-delicate">
                              "{w.message}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Revision Modal */}
      <RevisionModal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        onSubmitRevision={handleRevisionSubmit}
      />

      {/* Wedding Information Modal */}
      <WeddingInfoModal
        isOpen={isWeddingInfoModalOpen}
        onClose={() => setIsWeddingInfoModalOpen(false)}
        initialInfo={liveOrder.weddingInfo}
        onSave={handleWeddingInfoSave}
      />

      {/* Photo Album Modal */}
      <PhotoAlbumModal
        isOpen={isAlbumModalOpen}
        onClose={() => setIsAlbumModalOpen(false)}
        existingPhotos={liveOrder.weddingInfo?.albumPhotos || []}
        onSave={handleAlbumSave}
      />
    </div>
  );
};
