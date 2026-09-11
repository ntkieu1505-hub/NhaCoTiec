import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { Badge } from '../../../components/common/Badge';
import { usePublicTemplates } from '../../../mocks/templateStore';
import { useCmsContent } from '../../../mocks/cmsStore';
import { formatCurrency } from '../../../utils/formatters';

export const HomePage: React.FC = () => {
  const publicTemplates = usePublicTemplates();
  const cms = useCmsContent();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'basic' | 'premium'>('all');

  const filteredTemplates = selectedCategory === 'all'
    ? publicTemplates
    : publicTemplates.filter((t) => (t.category || (t.price >= 79000 ? 'premium' : 'basic')) === selectedCategory);

  const activeFeatures = (cms.features || [])
    .filter((f) => f.enabled)
    .sort((a, b) => (a.order ?? a.displayOrder ?? 0) - (b.order ?? b.displayOrder ?? 0));

  const activeTestimonials = (cms.testimonials || [])
    .filter((t) => t.enabled)
    .sort((a, b) => (a.order ?? a.displayOrder ?? 0) - (b.order ?? b.displayOrder ?? 0));

  return (
    <div className="flex flex-col w-full">
      {/* 1. Full-bleed Artistic Hero Section (CMS Dynamic) */}
      <section className="relative w-full min-h-[580px] sm:min-h-[660px] md:min-h-[720px] lg:min-h-[780px] flex items-center justify-center overflow-hidden bg-[#12100f] text-white">
        {/* Full-bleed Hero Image extending from edge to edge of Hero frame */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <img
            src={cms.hero.coverImageUrl}
            alt={cms.hero.headline}
            className="w-full h-full object-cover object-[center_35%] sm:object-[center_28%]"
          />
          {/* Subtle neutral dark vignette for text readability - strictly NO red/burgundy tint */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25" />
        </div>

        {/* Centered, balanced Hero content with widened container (800–1000px) */}
        <div className="relative z-10 w-full max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col items-center text-center">
          {/* 1. Tên thương hiệu - Dòng riêng nằm ngay bên trên tiêu đề */}
          <p className="font-serif text-sm sm:text-base md:text-lg text-gold-foil font-medium tracking-[0.15em] mb-3 sm:mb-4 select-none drop-shadow-sm">
            Nhà Có Tiệc
          </p>

          {/* 2. Tiêu đề chính Hero - Bố cục cố định chính xác 2 dòng */}
          {(() => {
            const rawHeadline = cms.hero.headline?.trim() || '';
            let lines = [
              'Lưu giữ khoảnh khắc',
              'thiêng liêng với website thiệp cưới',
            ];

            if (rawHeadline) {
              const cleanHeadline = rawHeadline.replace(/\.+$/, '');
              if (cleanHeadline.includes('\n')) {
                lines = cleanHeadline.split('\n').map((l) => l.trim().replace(/\.+$/, '')).filter(Boolean);
              } else if (cleanHeadline.includes('thiêng liêng')) {
                const idx = cleanHeadline.indexOf('thiêng liêng');
                lines = [cleanHeadline.substring(0, idx).trim(), cleanHeadline.substring(idx).trim().replace(/\.+$/, '')];
              } else {
                lines = [cleanHeadline];
              }
            }

            return (
              <h1 className="font-serif text-[20px] min-[390px]:text-[22px] sm:text-2xl md:text-3xl lg:text-[42px] xl:text-[46px] font-bold leading-[1.32] sm:leading-[1.35] md:leading-[1.38] text-white drop-shadow-md max-w-4xl mx-auto flex flex-col gap-1 sm:gap-1.5 md:gap-2 items-center">
                {lines.map((line, idx) => (
                  <span
                    key={idx}
                    className={`block ${
                      idx === 0
                        ? 'tracking-[0.035em] sm:tracking-[0.04em]'
                        : 'tracking-tight'
                    }`}
                  >
                    {line}
                  </span>
                ))}
              </h1>
            );
          })()}

          {/* 3. Phần mô tả */}
          {cms.hero.subtext && (
            <p className="text-white/85 text-sm sm:text-base md:text-lg mt-4 sm:mt-5 leading-relaxed max-w-2xl font-sans drop-shadow-sm font-normal text-balance whitespace-pre-line">
              {cms.hero.subtext}
            </p>
          )}

          {/* 4. Primary CTA - "Xem mẫu thiệp" */}
          <a
            href={cms.hero.ctaLink || '#danh-sach-mau'}
            className="mt-8 px-8 sm:px-10 h-12 sm:h-[50px] rounded-full bg-burgundy-wine hover:bg-[#851622] text-white font-label-md text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-xl shadow-black/50 hover:scale-[1.02] active:scale-95 transition-all border border-white/10"
          >
            <span>{cms.hero.ctaText || 'Xem mẫu thiệp'}</span>
            <Icon name="arrow_downward" className="text-[18px]" />
          </a>

          {/* 5. Supporting Value Points - Chỉ hiển thị khi có nhãn trong CMS */}
          {cms.hero.badges && cms.hero.badges.length > 0 ? (
            <div className="flex items-center justify-center gap-2.5 sm:gap-3 mt-6 text-xs sm:text-sm text-white/80 font-sans tracking-wide flex-wrap">
              {cms.hero.badges.map((badge, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-white/40 select-none">•</span>}
                  <span className="font-normal">{badge}</span>
                </React.Fragment>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* 2. Curated Templates Grid (Bộ sưu tập tuyển chọn) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full" id="danh-sach-mau">
        <div className="flex flex-col items-center text-center gap-2 mb-8">
          <span className="font-label-caps text-xs text-burgundy-wine tracking-widest font-bold">
            {cms.featuredTemplates.eyebrow}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-deep-espresso">
            {cms.featuredTemplates.title ? cms.featuredTemplates.title.replace(/\.+$/, '') : 'Mẫu thiệp cưới độc bản'}
          </h2>
          <p className="text-sm text-text-muted max-w-md">
            {cms.featuredTemplates.description}
          </p>

          {/* Filter Pills: Đúng 3 mục "Tất cả", "Cao cấp", "Cơ bản" */}
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-surface-subtle border border-border-delicate mt-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-burgundy-wine text-white shadow-xs'
                  : 'text-deep-espresso hover:bg-surface-card'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedCategory('premium')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === 'premium'
                  ? 'bg-burgundy-wine text-white shadow-xs'
                  : 'text-deep-espresso hover:bg-surface-card'
              }`}
            >
              Cao cấp
            </button>
            <button
              onClick={() => setSelectedCategory('basic')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === 'basic'
                  ? 'bg-burgundy-wine text-white shadow-xs'
                  : 'text-deep-espresso hover:bg-surface-card'
              }`}
            >
              Cơ bản
            </button>
          </div>
        </div>

        {/* Templates Grid Cards - Consistent 9:19.5 Modern Smartphone Ratio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <article
              key={template.id}
              className="flex flex-col bg-surface-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border-delicate/60"
            >
              <div
                className="relative w-full aspect-phone bg-surface-subtle overflow-hidden"
                style={{ aspectRatio: '9 / 16' }}
              >
                <Link to={`/mau-thiep/${template.slug}`} className="block w-full h-full">
                  <img
                    src={template.thumbnailUrl}
                    alt={template.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    style={{ objectPosition: template.thumbnailPosition || 'center 30%' }}
                  />
                </Link>
                <span className="absolute top-3 left-3 pointer-events-none">
                  <Badge variant={template.category === 'premium' ? 'premium' : 'basic'}>
                    {template.category === 'premium' ? 'Cao cấp' : 'Cơ bản'}
                  </Badge>
                </span>
                <span className="absolute bottom-3 right-3 bg-burgundy-wine text-surface-cream font-serif text-sm font-semibold px-3 py-1 rounded-lg shadow-md pointer-events-none">
                  {formatCurrency(template.price)}
                </span>
              </div>

              <div className="pt-3.5 px-4 pb-4 flex-1 flex flex-col justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <Link to={`/mau-thiep/${template.slug}`} className="min-w-0 flex-1">
                      <h3 className="font-serif text-[16px] sm:text-[17px] font-bold text-deep-espresso hover:text-burgundy-wine transition-colors line-clamp-2 leading-[1.3] min-h-[42px] flex items-center">
                        {template.name}
                      </h3>
                    </Link>
                    <span className="text-xs text-gold-foil font-semibold flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full bg-gold-foil/10 border border-gold-foil/25 mt-0.5">
                      <Icon name="star" className="text-[13px]" />
                      <span>{template.rating || 5.0}</span>
                    </span>
                  </div>
                  <p className="text-xs text-text-muted line-clamp-2 min-h-[34px] leading-relaxed">
                    {template.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border-delicate">
                  <Link
                    to={`/mau-thiep/${template.slug}`}
                    className="flex-1 h-9 rounded-full bg-surface-subtle hover:bg-surface-container-high text-deep-espresso text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                  >
                    <Icon name="visibility" className="text-[16px]" />
                    <span>Xem mẫu</span>
                  </Link>
                  <Link
                    to={`/mau-thiep/${template.slug}`}
                    className="flex-1 h-9 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-sm transition-all"
                  >
                    <Icon name="shopping_bag" className="text-[16px]" />
                    <span>Chọn mẫu</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. SECTION B — CAM KẾT GIÁ TRỊ TRỌN VẸN (CMS Dynamic) */}
      <section className="bg-surface-card py-16 border-y border-border-delicate relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-foil/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-burgundy-wine/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-2">
            <span className="font-label-caps text-xs text-burgundy-wine tracking-widest font-bold">
              Cam kết giá trị trọn vẹn
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-deep-espresso">
              Tất cả những gì cặp đôi cần cho ngày chung đôi
            </h2>
            <p className="text-sm text-text-muted">
              Không chỉ dừng lại ở một tấm thiệp điện tử, Nhà Có Tiệc mang đến trải nghiệm toàn diện và lưu giữ trọn vẹn kỷ niệm ngày cưới.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeFeatures.map((feat) => (
              <div
                key={feat.id}
                className="p-6 rounded-2xl bg-surface-cream/80 border border-border-delicate hover:border-gold-foil/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-4 group"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-burgundy-wine text-surface-cream flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                      <Icon name={feat.icon || 'star'} className="text-[24px]" />
                    </div>
                    {feat.subtitle && (
                      <span className="text-[11px] font-semibold text-gold-foil bg-gold-foil/10 px-2.5 py-1 rounded-full border border-gold-foil/20">
                        {feat.subtitle}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-lg font-bold text-deep-espresso mt-1">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-text-muted leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border-delicate/60 flex items-center gap-1.5 text-xs text-burgundy-wine font-medium">
                  <Icon name="check_circle" className="text-[16px] text-emerald-700" />
                  <span>Cam kết chuẩn Studio Nhà Có Tiệc</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Quy Trình Thực Hiện 4 Bước (CMS Dynamic Intro) */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12 flex flex-col gap-2">
          <span className="font-label-caps text-xs text-burgundy-wine tracking-widest font-bold">
            {cms.intro.eyebrow}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-deep-espresso">
            {cms.intro.title ? cms.intro.title.replace(/\.+$/, '') : '4 bước sở hữu website thiệp cưới'}
          </h2>
          <p className="text-sm text-text-muted">
            {cms.intro.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(cms.intro?.steps && cms.intro.steps.length === 4 ? cms.intro.steps : [
            {
              step: '01',
              title: 'Chọn mẫu',
              desc: 'Xem và chọn mẫu thiệp phù hợp với câu chuyện của bạn.',
            },
            {
              step: '02',
              title: 'Gửi thông tin',
              desc: 'Cung cấp thông tin và hình ảnh để Nhà Có Tiệc bắt đầu thiết kế.',
            },
            {
              step: '03',
              title: 'Duyệt thiệp',
              desc: 'Xem bản thiết kế và gửi yêu cầu chỉnh sửa nếu cần.',
            },
            {
              step: '04',
              title: 'Nhận thiệp',
              desc: 'Nhận link thiệp hoàn chỉnh và chia sẻ cùng khách mời.',
            },
          ]).map((item) => (
            <div
              key={item.step}
              className="p-6 rounded-2xl bg-surface-card border border-border-delicate flex flex-col gap-3 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-baseline gap-2.5 sm:gap-3">
                <span className="font-serif text-xl sm:text-2xl font-bold text-burgundy-wine shrink-0 select-none">
                  {item.step}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-deep-espresso leading-snug">
                  {item.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SECTION A — LỜI CHÚC & PHẢN HỒI (CMS Dynamic Testimonials) */}
      <section className="bg-gradient-to-b from-surface-cream to-surface-subtle/60 py-16 border-t border-border-delicate relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-2">
            <span className="font-label-caps text-xs text-burgundy-wine tracking-widest font-bold">
              Hạnh phúc lan tỏa
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-deep-espresso">
              Lời chúc &amp; phản hồi từ các cặp đôi
            </h2>
            <p className="text-sm text-text-muted">
              Lắng nghe cảm xúc thật từ những cặp đôi đã đồng hành cùng Nhà Có Tiệc để trao gửi tấm thiệp ngày chung đôi đến những người thân thương.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeTestimonials.map((review) => (
              <div
                key={review.id}
                className="bg-surface-card p-6 rounded-2xl border border-border-delicate shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-3">
                  {/* Rating Stars */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-gold-foil">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Icon
                          key={i}
                          name="star"
                          className={`text-[16px] ${
                            i < review.rating ? 'text-gold-foil' : 'text-border-delicate'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-label-caps text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                      Đã xác thực
                    </span>
                  </div>

                  {/* Quote */}
                  <p className="text-xs sm:text-sm text-deep-espresso italic leading-relaxed font-serif pt-1">
                    &ldquo;{review.quote}&rdquo;
                  </p>
                </div>

                {/* Couple Profile */}
                <div className="pt-4 border-t border-border-delicate flex items-center gap-3">
                  <img
                    src={review.avatarUrl}
                    alt={review.coupleName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gold-foil/40 shadow-xs shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-serif font-bold text-sm text-deep-espresso truncate">
                      {review.coupleName}
                    </span>
                    <span className="text-[11px] text-text-muted truncate">
                      {review.location} • {review.weddingDate}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 w-full">
        <div className="text-center mb-10">
          <span className="font-label-caps text-xs text-burgundy-wine tracking-widest font-bold">
            Thắc mắc phổ biến
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-deep-espresso mt-1">
            Câu hỏi thường gặp
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {[
            {
              q: 'Chi phí mua thiệp cưới tại Nhà Có Tiệc được tính như thế nào?',
              a: 'Nhà Có Tiệc áp dụng mô hình bán theo sản phẩm đơn chiếc (59.000đ cho mẫu Cơ bản, 79.000đ cho mẫu Cao cấp). Không có phí duy trì định kỳ, không subscription, thanh toán 1 lần duy nhất.'
            },
            {
              q: 'Tôi có phải tự thiết kế thiệp hay canh chỉnh layout không?',
              a: 'Không. Đội ngũ designer của Nhà Có Tiệc sẽ trực tiếp dàn trang hình ảnh, căn chỉnh phông chữ, tối ưu hóa hiển thị và tích hợp âm nhạc cho bạn. Bạn chỉ cần gửi nội dung tiệc cưới.'
            },
            {
              q: 'Thời gian hoàn thiện và gửi bản duyệt là bao lâu?',
              a: 'Chúng tôi cam kết SLA hoàn thiện bản duyệt đầu tiên trong vòng tối đa 24 giờ sau khi tiếp nhận đủ thông tin và ảnh cưới.'
            },
            {
              q: 'Nếu cần sửa lại ngày giờ hoặc thay ảnh thì sao?',
              a: 'Mỗi đơn hàng có sẵn 01 lần yêu cầu chỉnh sửa hoàn toàn miễn phí ngay trên Cổng Khách Hàng khi bàn giao bản thảo.'
            },
            {
              q: 'Thiệp cưới online được lưu trữ trong bao lâu?',
              a: 'Mỗi thiệp được lưu trữ và hiển thị trực tuyến 365 ngày (01 năm kể từ ngày cưới) để lưu giữ kỷ niệm và lưu bút của khách mời.'
            }
          ].map((faq, index) => (
            <details
              key={index}
              className="group bg-surface-card rounded-xl p-4 border border-border-delicate open:border-burgundy-wine/30 transition-all cursor-pointer"
            >
              <summary className="font-serif font-semibold text-deep-espresso text-sm flex items-center justify-between list-none">
                <span>{faq.q}</span>
                <Icon name="expand_more" className="text-[20px] text-burgundy-wine group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-xs text-text-muted mt-3 pt-3 border-t border-border-delicate leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
};
