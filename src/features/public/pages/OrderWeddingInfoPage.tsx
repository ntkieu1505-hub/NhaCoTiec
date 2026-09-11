import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { usePublicTemplates, getTemplateBySlug } from '../../../mocks/templateStore';
import { formatCurrency } from '../../../utils/formatters';
import { createOrder } from '../../../mocks/orderStore';
import { useAuth } from '../../../mocks/authStore';
import { useCmsContent } from '../../../mocks/cmsStore';

interface UploadedPhoto {
  id: string;
  url: string;
  name: string;
  size: string;
  note: string;
}

export const OrderWeddingInfoPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const cms = useCmsContent();
  const orderFormConfig = cms.orderForm;
  const templates = usePublicTemplates();
  const template = (slug ? getTemplateBySlug(slug) : undefined) || templates[0];

  // SECTION 1: Cô dâu & Chú rể
  const [groomName, setGroomName] = useState('');
  const [brideName, setBrideName] = useState('');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  // Auto-fill logged-in customer's contact details
  useEffect(() => {
    if (user?.email && !customerEmail) {
      setCustomerEmail(user.email);
    }
    if (user?.phone && !customerPhone) {
      setCustomerPhone(user.phone);
    }
  }, [user]);

  // Dynamically compute couple name & invitation title as user types
  const groomTrimmed = groomName.trim();
  const brideTrimmed = brideName.trim();
  const hasCoupleNames = Boolean(groomTrimmed || brideTrimmed);
  const coupleDisplayName = (groomTrimmed && brideTrimmed)
    ? `${groomTrimmed} & ${brideTrimmed}`
    : (groomTrimmed || brideTrimmed);

  // If auth is still checking
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-burgundy-wine border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-text-muted font-medium">Đang kiểm tra thông tin đăng nhập...</p>
        </div>
      </div>
    );
  }

  // Strictly require login before accessing the wedding info order page
  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/dang-nhap?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  // SECTION 2: Thời gian & Địa điểm (Để trống cho khách tự điền)
  const [weddingDate, setWeddingDate] = useState('');
  const [weddingTime, setWeddingTime] = useState('18:00');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [googleMapUrl, setGoogleMapUrl] = useState('');

  // SECTION 3: Nội dung & Thông điệp (Để trống cho khách tự điền)
  const [groomParents, setGroomParents] = useState('');
  const [brideParents, setBrideParents] = useState('');
  const [invitationMessage, setInvitationMessage] = useState('');
  const [loveStory, setLoveStory] = useState('');
  const [timeline, setTimeline] = useState('');

  // SECTION 4: Media & Photos (Bắt đầu với danh sách ảnh trống)
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [videoUrl, setVideoUrl] = useState('');

  // SECTION 5: RSVP & Sổ lưu bút
  const [rsvpDeadline, setRsvpDeadline] = useState('');

  // Terms & Submission
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Photo Upload (Multiple)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newPhotos: UploadedPhoto[] = newFiles.map((file, idx) => ({
        id: `photo-${Date.now()}-${idx}`,
        url: URL.createObjectURL(file),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        note: '',
      }));
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(photos.filter((p) => p.id !== id));
  };

  const handleUpdatePhotoNote = (id: string, note: string) => {
    setPhotos(photos.map((p) => (p.id === id ? { ...p, note } : p)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!groomName.trim() || !brideName.trim()) {
      setErrorMessage('Vui lòng nhập họ tên của cả Chú Rể và Cô Dâu.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!customerPhone.trim() || !customerEmail.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Số điện thoại Zalo và Email liên hệ.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!weddingDate || !weddingTime) {
      setErrorMessage('Vui lòng chọn ngày và giờ tổ chức hôn lễ.');
      return;
    }
    if (!venueName.trim() || !venueAddress.trim()) {
      setErrorMessage('Vui lòng nhập tên địa điểm và địa chỉ chi tiết sảnh tiệc.');
      return;
    }
    if (!agreedTerms) {
      setErrorMessage('Vui lòng tích chọn đồng ý cam kết điều khoản trước khi thanh toán.');
      return;
    }

    setIsSubmitting(true);

    const finalTemplateName = hasCoupleNames
      ? `Thiệp cưới ${coupleDisplayName} (${template.name})`
      : template.name;

    try {
      const newOrder = createOrder({
        userId: user?.id,
        templateId: template.id,
        templateName: finalTemplateName,
        category: template.category || (template.price >= 79000 ? 'premium' : 'basic'),
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
          loveStory: loveStory.trim() || undefined,
          timeline: timeline.trim() || undefined,
          albumPhotos: photos.map((p) => p.url),
          albumPhotoCount: photos.length,
          albumPhotoNotes: photos.map((p) => ({
            id: p.id,
            url: p.url,
            note: p.note,
            name: p.name,
            size: p.size,
          })),
          videoUrl: videoUrl.trim() || undefined,
          rsvpDeadline,
        },
      });

      // Navigate to checkout
      navigate(`/thanh-toan/${newOrder.id}?template=${template.slug}`);
    } catch (err: any) {
      console.error('Failed to create order', err);
      setErrorMessage('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-20 bg-surface-cream text-deep-espresso">
      {/* Sub-header Breadcrumb / Navigation Strip */}
      <div className="sticky top-0 z-40 bg-[#4a0d11] px-4 py-3 shadow-md flex items-center justify-between border-b border-rose-950/40 text-white">
        <Link
          to={`/mau-thiep/${template.slug}`}
          className="inline-flex items-center gap-1.5 text-white hover:text-rose-200 text-xs font-medium transition-colors"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          <span>Quay lại chi tiết mẫu</span>
        </Link>
        <span className="text-[11px] font-bold text-rose-200 uppercase tracking-wider">
          BƯỚC 2 / ĐIỀN THÔNG TIN
        </span>
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-xl mx-auto w-full">
        {/* Dynamic Form Header from CMS */}
        <div className="text-center space-y-1 mb-1">
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-deep-espresso">
            {orderFormConfig?.title || 'Điền Thông Tin Ngày Cưới'}
          </h1>
          <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto">
            {orderFormConfig?.subtitle || 'Cung cấp chi tiết để Nhà Có Tiệc hoàn thiện thiệp cưới hoàn hảo cho bạn'}
          </p>
        </div>

        {/* Hotline / Zalo Support Banner */}
        {orderFormConfig?.supportZalo && (
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs flex items-center justify-center gap-2 shadow-2xs">
            <Icon name="support_agent" className="text-[18px] text-amber-700 shrink-0" />
            <div className="flex items-center gap-1.5 font-medium text-xs sm:text-sm">
              <span>Hotline / Zalo hỗ trợ:</span>
              <a
                href={orderFormConfig.supportZaloLink || `https://zalo.me/${orderFormConfig.supportZalo.replace(/\s+/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-burgundy-wine font-bold underline hover:opacity-80"
              >
                {orderFormConfig.supportZalo}
              </a>
            </div>
          </div>
        )}

        {/* Progress Stepper */}
        <div className="bg-surface-card rounded-2xl p-4 shadow-xs border border-border-delicate">
          <div className="flex items-center justify-between text-center relative">
            {/* Step 1 */}
            <div className="flex-1 flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-burgundy-wine text-white flex items-center justify-center font-bold text-xs mb-1 shadow-2xs">
                <Icon name="check" className="text-[16px]" />
              </div>
              <span className="font-label-caps text-[11px] text-burgundy-wine font-semibold">
                Chọn mẫu
              </span>
            </div>

            <div className="w-12 h-0.5 bg-burgundy-wine" />

            {/* Step 2 */}
            <div className="flex-1 flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-burgundy-wine text-white flex items-center justify-center font-bold text-xs mb-1 shadow-2xs ring-4 ring-rose-900/10">
                2
              </div>
              <span className="font-label-caps text-[11px] text-burgundy-wine font-bold">
                Điền thông tin
              </span>
            </div>

            <div className="w-12 h-0.5 bg-border-delicate" />

            {/* Step 3 */}
            <div className="flex-1 flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-surface-subtle text-text-muted flex items-center justify-center font-semibold text-xs mb-1 border border-border-delicate">
                3
              </div>
              <span className="font-label-caps text-[11px] text-text-muted">
                Thanh toán
              </span>
            </div>
          </div>
        </div>

        {/* Selected Template Summary Box */}
        <div className="bg-surface-card rounded-2xl p-4 shadow-xs border border-border-delicate relative overflow-hidden">
          <div className="flex gap-4 items-center">
            <div className="w-20 h-24 rounded-xl overflow-hidden shrink-0 shadow-xs border border-border-delicate">
              <img
                src={template.thumbnailUrl}
                alt={template.name}
                className="w-full h-full object-cover"
                style={{ objectPosition: template.thumbnailPosition || 'center 30%' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-subtle text-burgundy-wine font-label-caps text-[10px] font-bold uppercase mb-1 border border-border-delicate">
                <Icon name="stars" className="text-[12px] text-gold-foil" />
                <span>{template.category === 'premium' ? 'Cao Cấp' : 'Cơ Bản'} • {template.style}</span>
              </div>
              <h2 className="font-serif text-base font-bold text-deep-espresso leading-snug">
                {hasCoupleNames ? (
                  <div>
                    <span className="text-burgundy-wine">Thiệp cưới: {coupleDisplayName}</span>
                    <span className="text-[11px] text-text-muted font-normal block mt-0.5">
                      Giao diện mẫu: {template.name}
                    </span>
                  </div>
                ) : (
                  <span>Mẫu thiệp: {template.name}</span>
                )}
              </h2>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-serif text-lg text-burgundy-wine font-bold">
                  {formatCurrency(template.price)}
                </span>
              </div>
              <Link
                to="/mau-thiep"
                className="inline-flex items-center gap-1 text-text-muted hover:text-burgundy-wine text-xs mt-1 transition-colors font-medium"
              >
                <Icon name="swap_horiz" className="text-[15px]" />
                <span>Đổi mẫu thiệp khác</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ERROR MESSAGE ALERT */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2.5 font-medium animate-in fade-in">
            <Icon name="error" className="text-[20px] text-rose-700 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* MAIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Cô dâu & Chú rể */}
          <section className="bg-surface-card rounded-2xl p-5 shadow-xs border border-border-delicate space-y-4">
            <div className="flex items-start gap-3 pb-2 border-b border-border-delicate">
              <div className="w-7 h-7 rounded-full bg-burgundy-wine text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-deep-espresso">
                  Thông tin Cô Dâu & Chú Rể
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Thông tin chính xác để hiển thị trang trọng trên toàn bộ thiệp mời số.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-semibold text-deep-espresso mb-1">
                  Họ & Tên Chú Rể <span className="text-burgundy-wine">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Tuấn Kiệt"
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-surface-subtle/70 text-deep-espresso text-xs font-medium focus:bg-surface-card border border-border-delicate focus:border-burgundy-wine focus:ring-1 focus:ring-burgundy-wine outline-none transition-all"
                  />
                  <Icon name="person" className="absolute right-3 top-2.5 text-text-muted text-[20px]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-deep-espresso mb-1">
                  Họ & Tên Cô Dâu <span className="text-burgundy-wine">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="VD: Trần Minh Anh"
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-surface-subtle/70 text-deep-espresso text-xs font-medium focus:bg-surface-card border border-border-delicate focus:border-burgundy-wine focus:ring-1 focus:ring-burgundy-wine outline-none transition-all"
                  />
                  <Icon name="favorite" className="absolute right-3 top-2.5 text-text-muted text-[20px]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-deep-espresso mb-1">
                  Số điện thoại liên hệ / Zalo nhận link thiệp <span className="text-burgundy-wine">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0912 345 678"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-surface-subtle/70 text-deep-espresso text-xs font-mono font-medium focus:bg-surface-card border border-border-delicate focus:border-burgundy-wine focus:ring-1 focus:ring-burgundy-wine outline-none transition-all"
                  />
                  <Icon name="call" className="absolute right-3 top-2.5 text-text-muted text-[20px]" />
                </div>
                <p className="text-[11px] text-text-muted mt-1">
                  Đội ngũ hỗ trợ sẽ gửi link demo và hỗ trợ tinh chỉnh qua số Zalo này.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-deep-espresso mb-1">
                  Email quản trị & sao lưu danh sách khách <span className="text-burgundy-wine">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="VD: kiet.minhanh@gmail.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-surface-subtle/70 text-deep-espresso text-xs font-medium focus:bg-surface-card border border-border-delicate focus:border-burgundy-wine focus:ring-1 focus:ring-burgundy-wine outline-none transition-all"
                  />
                  <Icon name="mail" className="absolute right-3 top-2.5 text-text-muted text-[20px]" />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: Thời Gian & Địa Điểm Tiệc Cưới */}
          <section className="bg-surface-card rounded-2xl p-5 shadow-xs border border-border-delicate space-y-4">
            <div className="flex items-start gap-3 pb-2 border-b border-border-delicate">
              <div className="w-7 h-7 rounded-full bg-burgundy-wine text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-deep-espresso">
                  Thời Gian & Địa Điểm Tiệc Cưới
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Giúp khách mời đồng bộ lịch điện thoại và chỉ đường Google Maps chính xác.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-deep-espresso mb-1">
                    Ngày tổ chức hôn lễ <span className="text-burgundy-wine">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={weddingDate}
                      onChange={(e) => setWeddingDate(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-surface-subtle/70 text-deep-espresso text-xs font-medium focus:bg-surface-card border border-border-delicate focus:border-burgundy-wine outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-deep-espresso mb-1">
                    Giờ cử hành / Đón khách <span className="text-burgundy-wine">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      required
                      value={weddingTime}
                      onChange={(e) => setWeddingTime(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-surface-subtle/70 text-deep-espresso text-xs font-medium focus:bg-surface-card border border-border-delicate focus:border-burgundy-wine outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-deep-espresso mb-1">
                  Tên Trung tâm tiệc cưới / Tư gia <span className="text-burgundy-wine">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="VD: Trung Tâm Hội Nghị & Tiệc Cưới White Palace"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-surface-subtle/70 text-deep-espresso text-xs font-medium focus:bg-surface-card border border-border-delicate focus:border-burgundy-wine outline-none"
                  />
                  <Icon name="storefront" className="absolute right-3 top-2.5 text-text-muted text-[20px]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-deep-espresso mb-1">
                  Địa chỉ chi tiết sảnh tiệc <span className="text-burgundy-wine">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="VD: 194 Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận, TP. HCM"
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-surface-subtle/70 text-deep-espresso text-xs font-medium focus:bg-surface-card border border-border-delicate focus:border-burgundy-wine outline-none"
                  />
                  <Icon name="home_pin" className="absolute right-3 top-2.5 text-text-muted text-[20px]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-deep-espresso mb-1">
                  Link Google Maps sảnh cưới (Tùy chọn)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://maps.app.goo.gl/..."
                    value={googleMapUrl}
                    onChange={(e) => setGoogleMapUrl(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-surface-subtle/70 text-deep-espresso text-xs font-medium focus:bg-surface-card border border-border-delicate focus:border-burgundy-wine outline-none"
                  />
                  <Icon name="map" className="absolute right-3 top-2.5 text-gold-foil text-[20px]" />
                </div>
                <p className="text-[11px] text-text-muted mt-1">
                  Dán link từ Google Maps để khách mời bấm nút "Chỉ đường" mở bản đồ ngay.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 3: Nội Dung & Thông Điệp Cưới */}
          <section className="bg-surface-card rounded-2xl p-5 shadow-xs border border-border-delicate space-y-4">
            <div className="flex items-start gap-3 pb-2 border-b border-border-delicate">
              <div className="w-7 h-7 rounded-full bg-burgundy-wine text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-deep-espresso">
                  Nội Dung & Thông Điệp Cưới
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Cá nhân hóa từng câu chữ tạo nên thiệp cưới tràn ngập tình yêu.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 pt-1 text-xs">
              {orderFormConfig?.showParentsSection !== false && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-deep-espresso mb-1">
                      Đại diện Nhà Trai (Phụ huynh)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ông: Nguyễn Văn A&#10;Bà: Lê Thị B"
                      value={groomParents}
                      onChange={(e) => setGroomParents(e.target.value)}
                      className="w-full p-3 rounded-xl bg-surface-subtle/70 text-deep-espresso focus:bg-surface-card border border-border-delicate focus:border-burgundy-wine outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-deep-espresso mb-1">
                      Đại diện Nhà Gái (Phụ huynh)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ông: Trần Văn C&#10;Bà: Phạm Thị D"
                      value={brideParents}
                      onChange={(e) => setBrideParents(e.target.value)}
                      className="w-full p-3 rounded-xl bg-surface-subtle/70 text-deep-espresso focus:bg-surface-card border border-border-delicate focus:border-burgundy-wine outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-deep-espresso mb-1">
                  Lời ngỏ / Lời mời cưới chân thành
                </label>
                <textarea
                  rows={3}
                  value={invitationMessage}
                  onChange={(e) => setInvitationMessage(e.target.value)}
                  placeholder="Ví dụ: Tình yêu không phải là tìm kiếm một người hoàn hảo, mà là học cách yêu thương người không hoàn hảo một cách trọn vẹn nhất. Hân hạnh chào đón bạn trong ngày hạnh phúc của chúng mình!"
                  className="w-full p-3 rounded-xl bg-surface-subtle/70 text-deep-espresso focus:bg-surface-card border border-border-delicate focus:border-burgundy-wine outline-none resize-none leading-relaxed"
                />
              </div>

              {orderFormConfig?.showLoveStorySection !== false && (
                <div>
                  <label className="block font-semibold text-deep-espresso mb-1">
                    Câu chuyện tình yêu (Love Story tóm tắt)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Gặp nhau mùa thu 2021 tại một quán cà phê quen..."
                    value={loveStory}
                    onChange={(e) => setLoveStory(e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-subtle/70 text-deep-espresso focus:bg-surface-card border border-border-delicate focus:border-burgundy-wine outline-none resize-none leading-relaxed"
                  />
                </div>
              )}

              {orderFormConfig?.showTimelineSection !== false && (
                <div>
                  <label className="block font-semibold text-deep-espresso mb-1">
                    Timeline lịch trình tiệc cưới
                  </label>
                  <textarea
                    rows={4}
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="Ví dụ:&#10;17:30 - Đón khách & Chụp ảnh lưu niệm&#10;18:30 - Khai tiệc & Nghi thức hôn lễ&#10;19:30 - Giao lưu & Trò chơi gắn kết&#10;20:30 - Tiệc After-party ấm cúng"
                    className="w-full p-3 rounded-xl bg-surface-subtle/70 text-deep-espresso focus:bg-surface-card border border-border-delicate focus:border-burgundy-wine outline-none resize-none leading-relaxed font-mono text-[11px]"
                  />
                </div>
              )}
            </div>
          </section>

          {/* SECTION 4: Tải Lên Media & Ghi Chú Từng Ảnh */}
          <section className="bg-surface-card rounded-2xl p-5 shadow-xs border border-border-delicate space-y-4">
            <div className="flex items-start gap-3 pb-2 border-b border-border-delicate">
              <div className="w-7 h-7 rounded-full bg-burgundy-wine text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                4
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-deep-espresso">
                  Tải Lên Media & Ghi Chú Từng Ảnh
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Tối đa 20 ảnh độ phân giải cao & 1 video kỷ niệm / teaser ngắn.
                </p>
              </div>
            </div>

            {/* Image Upload Tap Box */}
            <label className="p-5 rounded-2xl bg-surface-subtle border-2 border-dashed border-border-delicate text-center flex flex-col items-center justify-center cursor-pointer hover:bg-surface-subtle/80 transition-colors shadow-inner">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-surface-card flex items-center justify-center text-burgundy-wine mb-2 shadow-xs border border-border-delicate">
                <Icon name="add_photo_alternate" className="text-[26px]" />
              </div>
              <span className="text-xs text-deep-espresso font-bold">
                Chạm để tải ảnh từ điện thoại / máy tính
              </span>
              <span className="text-[11px] text-text-muted mt-0.5">
                Hỗ trợ định dạng JPG, PNG, HEIC (Đã có {photos.length} ảnh)
              </span>
            </label>

            {/* Thumbnail Gallery with Dedicated Notes */}
            <div className="space-y-3 pt-1">
              {photos.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-surface-subtle/60 border border-border-delicate flex flex-col gap-2 shadow-2xs"
                >
                  <div className="flex gap-3 items-center">
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 shadow-xs border border-border-delicate">
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-deep-espresso truncate">
                          {item.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(item.id)}
                          className="text-rose-600 hover:text-rose-800 p-1 transition-colors"
                          title="Xóa ảnh"
                        >
                          <Icon name="delete" className="text-[18px]" />
                        </button>
                      </div>
                      <span className="text-[10px] text-text-muted">{item.size} • Đã sẵn sàng</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={item.note}
                    onChange={(e) => handleUpdatePhotoNote(item.id, e.target.value)}
                    placeholder="Ghi chú cho ảnh này (vd: Đặt làm ảnh bìa, phần Love Story...)"
                    className="w-full h-9 px-3 rounded-lg bg-surface-card border border-border-delicate text-xs text-deep-espresso focus:border-burgundy-wine outline-none shadow-2xs"
                  />
                </div>
              ))}
            </div>

            {/* Video Upload Block */}
            {orderFormConfig?.showVideoSection !== false && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-deep-espresso mb-1">
                  Link Video kỷ niệm / Teaser cưới (Youtube / Drive / TikTok)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-surface-subtle/70 text-deep-espresso text-xs font-medium focus:bg-surface-card border border-border-delicate focus:border-burgundy-wine outline-none"
                  />
                  <Icon name="movie" className="absolute right-3 top-2.5 text-text-muted text-[20px]" />
                </div>
              </div>
            )}
          </section>

          {/* SECTION 5: Xác Nhận Tham Dự & Sổ Lưu Bút Online */}
          {orderFormConfig?.showRsvpSection !== false && (
            <section className="bg-surface-card rounded-2xl p-5 shadow-xs border border-border-delicate space-y-4">
              <div className="flex items-start gap-3 pb-2 border-b border-border-delicate">
                <div className="w-7 h-7 rounded-full bg-burgundy-wine text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  5
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-deep-espresso">
                    {orderFormConfig?.rsvpTitle || 'Xác Nhận Tham Dự (RSVP) & Sổ Lưu Bút Online'}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    {orderFormConfig?.rsvpSubtitle || 'Quản lý số lượng bàn tiệc dễ dàng từ phản hồi của khách trên thiệp.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-deep-espresso mb-1">
                    Hạn chót nhận phản hồi RSVP từ khách mời <span className="text-burgundy-wine">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={rsvpDeadline}
                      onChange={(e) => setRsvpDeadline(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-surface-subtle/70 text-deep-espresso text-xs font-medium focus:bg-surface-card border border-border-delicate focus:border-burgundy-wine outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-text-muted mt-1">
                    {orderFormConfig?.rsvpNote || 'Sau ngày này form RSVP sẽ tự động thông báo đóng nhận đăng ký thêm khách.'}
                  </p>
                </div>

                {/* Feature Perks Checklist - Dynamically configured from Admin CMS */}
                <div className="bg-surface-subtle/70 rounded-xl p-3.5 space-y-2 text-xs text-deep-espresso border border-border-delicate">
                  {(orderFormConfig?.rsvpFeatures && orderFormConfig.rsvpFeatures.length > 0
                    ? orderFormConfig.rsvpFeatures
                    : [
                        'Tự động thống kê số lượng khách đi cùng (vợ/chồng/con nhỏ)',
                        'Tích hợp bảng khảo sát món ăn kiêng / chay tiện lợi',
                        'Sổ lưu bút online kèm hiệu ứng thả tim lời chúc thời gian thực',
                      ]
                  ).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Icon name="check_circle" className="text-[18px] text-burgundy-wine shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Terms Checkbox */}
          <div className="bg-surface-card rounded-2xl p-4 shadow-xs border border-border-delicate">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="w-5 h-5 rounded mt-0.5 accent-burgundy-wine cursor-pointer shrink-0"
              />
              <span className="text-xs text-deep-espresso leading-relaxed font-medium">
                {orderFormConfig?.termsText ||
                  'Tôi xác nhận các thông tin trên là chính xác và hiểu rằng hệ thống sẽ khởi tạo bản mẫu ngay sau khi xác nhận chuyển khoản thành công.'}
              </span>
            </label>
          </div>

          {/* Bottom Action Area / Summary */}
          <div className="bg-surface-card rounded-2xl p-5 shadow-md border border-border-delicate space-y-4 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-border-delicate">
              <span className="text-xs text-text-muted font-medium">Tổng thanh toán:</span>
              <span className="font-serif text-xl text-burgundy-wine font-bold">
                {formatCurrency(template.price)}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white font-serif text-sm font-bold tracking-wide uppercase shadow-lg shadow-rose-950/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Đang khởi tạo đơn hàng...' : 'Tiếp tục thanh toán & Kích hoạt'}</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>

            {/* Guarantee Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-text-muted text-[11px] font-medium">
              <span className="inline-flex items-center gap-1">
                <Icon name="lock" className="text-[14px] text-gold-foil" />
                <span>Bảo mật thông tin</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon name="bolt" className="text-[14px] text-gold-foil" />
                <span>Kích hoạt tự động</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon name="support_agent" className="text-[14px] text-gold-foil" />
                <span>Hỗ trợ 24/7</span>
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
