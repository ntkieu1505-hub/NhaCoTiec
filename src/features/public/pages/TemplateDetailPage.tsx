import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { Badge } from '../../../components/common/Badge';
import { useTemplates } from '../../../mocks/templateStore';
import { formatCurrency } from '../../../utils/formatters';
import { OrderFormModal } from '../components/OrderFormModal';

export const TemplateDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const templates = useTemplates();
  const template = templates.find((t) => t.slug === slug) || templates[0];

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-6">
      {/* Back button link */}
      <div>
        <Link
          to="/mau-thiep"
          className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-deep-espresso font-medium transition-colors"
        >
          <Icon name="arrow_back" className="text-[16px]" />
          <span>Quay lại Bộ sưu tập mẫu thiệp</span>
        </Link>
      </div>

      {/* Main Grid: Left preview mockup, Right details & ordering */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Mobile phone mockup preview (5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center">
          {/* Realistic smartphone frame with modern 9:19.5 viewport ratio */}
          <div
            className="relative w-full max-w-[260px] sm:max-w-[270px] aspect-phone rounded-[38px] bg-[#181513] p-2.5 shadow-2xl border-[3.5px] border-gold-foil/40 ring-4 sm:ring-8 ring-deep-espresso/10 flex flex-col"
            style={{ aspectRatio: '9 / 19.5' }}
          >
            {/* Phone top notch & speaker bar */}
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-20 sm:w-22 h-3.5 bg-[#181513] rounded-full z-20 flex items-center justify-center pointer-events-none shadow-sm border border-white/5">
              <div className="w-2 h-2 rounded-full bg-black/70 mr-2" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#1c2d42]/70" />
            </div>

            {/* Screen inner - Modern tall smartphone viewport with template thumbnail */}
            <div className="w-full h-full rounded-[28px] overflow-hidden relative bg-[#181513]">
              <img
                src={template.thumbnailUrl}
                alt={template.name}
                className="w-full h-full object-cover"
                style={{ objectPosition: template.thumbnailPosition || 'center 30%' }}
              />
            </div>
          </div>

          {/* Concept B: Real Template Demonstration */}
          <a
            href={template.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3.5 px-4 py-2.5 rounded-full bg-surface-card hover:bg-surface-subtle text-burgundy-wine border border-border-delicate text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:shadow transition-all"
            title="Mở đường link xem thử demo thực tế của mẫu thiệp"
          >
            <Icon name="open_in_new" className="text-[15px]" />
            <span>Mở thiệp xem thử (Bản demo thực tế)</span>
          </a>
          <p className="text-[11px] text-text-muted mt-1.5 text-center">
            Mô phỏng hiển thị trên smartphone của khách mời
          </p>
        </div>

        {/* Right: Template Details & Action (7 cols) */}
        <div className="md:col-span-7 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={template.category === 'premium' ? 'premium' : 'basic'}>
                {template.category === 'premium' ? 'Gói Cao cấp' : 'Gói Cơ bản'}
              </Badge>
              <span className="text-xs text-gold-foil font-semibold flex items-center gap-1">
                <Icon name="grade" className="text-[16px]" /> {template.rating || 5.0} ({template.reviewCount || 1} đánh giá)
              </span>
            </div>

            <h1 className="font-serif text-3xl font-bold text-deep-espresso">
              {template.name}
            </h1>
            <p className="text-xs text-text-muted leading-relaxed">
              {template.description}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-surface-cream border border-border-delicate flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-text-muted">Chi phí trọn gói hoàn thiện</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-serif text-3xl font-bold text-burgundy-wine">
                  {formatCurrency(template.price)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-text-muted font-medium">
                (Lưu trữ 1 năm)
              </span>
            </div>
          </div>

          {/* Audio preview player box */}
          <div className="p-4 rounded-2xl bg-surface-card border border-border-delicate flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isPlayingAudio
                    ? 'bg-burgundy-wine text-white'
                    : 'bg-surface-subtle text-deep-espresso hover:bg-surface-container-high'
                }`}
                title="Nghe thử nhạc nền mẫu"
              >
                <Icon name={isPlayingAudio ? 'pause' : 'play_arrow'} className="text-[22px]" />
              </button>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-deep-espresso">
                  {template.musicTitle || 'A Thousand Years'}
                </span>
                <span className="text-[11px] text-text-muted">
                  {template.musicArtist || 'Nhà Có Tiệc Studio'} • Nhạc nền phát tự động
                </span>
              </div>
            </div>
            {isPlayingAudio && (
              <span className="text-[11px] font-semibold text-burgundy-wine animate-pulse">
                Đang phát...
              </span>
            )}
          </div>

          {/* Features check list & Service commitments */}
          <div className="flex flex-col gap-4 p-5 rounded-2xl bg-surface-subtle/60 border border-border-delicate">
            {/* 1. Tính năng của mẫu thiệp */}
            {template.features && template.features.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="font-label-caps text-xs text-deep-espresso font-semibold tracking-wider">
                  Tính năng bao gồm trong mẫu này:
                </span>
                <div className="grid grid-cols-1 gap-2 mt-0.5">
                  {template.features.map((feat, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs text-deep-espresso">
                      <Icon name="check_circle" className="text-[16px] text-burgundy-wine shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Cam kết dịch vụ */}
            <div className={`flex flex-col gap-2 ${template.features && template.features.length > 0 ? 'pt-3 border-t border-border-delicate/60' : ''}`}>
              <span className="font-label-caps text-xs text-deep-espresso font-semibold tracking-wider">
                Cam kết dịch vụ:
              </span>
              <div className="grid grid-cols-1 gap-2 mt-0.5">
                <div className="flex items-start gap-2 text-xs text-deep-espresso">
                  <Icon name="verified" className="text-[16px] text-gold-foil shrink-0 mt-0.5" />
                  <span>Designer Nhà Có Tiệc trực tiếp căn chỉnh và hoàn thiện trong 24h</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-deep-espresso">
                  <Icon name="edit_note" className="text-[16px] text-gold-foil shrink-0 mt-0.5" />
                  <span>Miễn phí 1 lần yêu cầu chỉnh sửa khi bàn giao</span>
                </div>
              </div>
            </div>
          </div>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOrderModalOpen(true)}
              className="w-full sm:flex-1 h-12 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white font-label-md text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-rose-950/20 active:scale-95 transition-all"
            >
              <Icon name="shopping_bag" className="text-[20px]" />
              <span>Chọn mẫu này • {formatCurrency(template.price)}</span>
            </button>
            <a
              href="https://zalo.me"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto h-12 px-6 rounded-full bg-surface-card hover:bg-surface-subtle text-deep-espresso border border-border-delicate font-label-md text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Icon name="chat" className="text-[18px] text-gold-foil" />
              <span>Tư vấn Zalo 24/7</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mandatory Pre-checkout Order Information Modal */}
      {isOrderModalOpen && (
        <OrderFormModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          template={template}
        />
      )}
    </div>
  );
};
