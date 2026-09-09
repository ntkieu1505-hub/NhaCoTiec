import React from 'react';
import { Icon } from '../../../components/common/Icon';
import { SocialIcon, SOCIAL_PLATFORMS_LIST } from '../../../components/common/SocialIcon';
import { useCmsContent, DEFAULT_CMS_CONTENT } from '../../../mocks/cmsStore';

export const ContactPage: React.FC = () => {
  const cms = useCmsContent();
  const { contact } = cms;

  const socialConfig = cms.socialLinks || DEFAULT_CMS_CONTENT.socialLinks;
  const activeSocials = SOCIAL_PLATFORMS_LIST.map((platform) => {
    const item = socialConfig?.[platform.id];
    return {
      id: platform.id,
      name: platform.name,
      enabled: item?.enabled ?? false,
      url: item?.url?.trim() || '',
    };
  }).filter((item) => item.enabled && item.url.length > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full flex flex-col gap-8">
      <div className="text-center max-w-xl mx-auto">
        <span className="font-label-caps text-xs text-burgundy-wine tracking-widest font-bold">
          {contact.eyebrow || 'Đồng hành cùng hôn lễ của bạn'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-deep-espresso mt-2">
          {contact.title || 'Liên hệ Nhà Có Tiệc'}
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-2 leading-relaxed">
          {contact.description || 'Đội ngũ chăm sóc cô dâu & chú rể luôn sẵn sàng lắng nghe mọi ý tưởng và giải đáp chi tiết các khâu chuẩn bị thiệp cưới online.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Hotline */}
        <div className="bg-surface-card p-6 rounded-2xl border border-border-delicate flex flex-col gap-3 shadow-xs items-center text-center">
          <div className="w-12 h-12 rounded-full bg-surface-subtle text-burgundy-wine flex items-center justify-center">
            <Icon name="call" className="text-[24px]" />
          </div>
          <h3 className="font-serif text-lg font-bold text-deep-espresso">Hotline trực tiếp</h3>
          <p className="text-xs text-text-muted">Hỗ trợ khẩn cấp ngày tiệc và tư vấn nhanh</p>
          <a
            href={`tel:${(contact.hotline || contact.phone || '0982 123 456').replace(/\s+/g, '')}`}
            className="text-base font-bold text-burgundy-wine hover:underline mt-2 font-serif"
          >
            {contact.hotline || contact.phone || '0982 123 456'}
          </a>
          <span className="text-[11px] text-text-muted">{contact.workingHours}</span>
        </div>

        {/* Card 2: Zalo */}
        <div className="bg-surface-card p-6 rounded-2xl border border-border-delicate flex flex-col gap-3 shadow-xs items-center text-center">
          <div className="w-12 h-12 rounded-full bg-surface-subtle text-gold-foil flex items-center justify-center">
            <Icon name="chat" className="text-[24px]" />
          </div>
          <h3 className="font-serif text-lg font-bold text-deep-espresso">Zalo CSKH 24/7</h3>
          <p className="text-xs text-text-muted">Gửi ảnh cưới, trao đổi trực tiếp với Designer</p>
          <a
            href={contact.zaloUrl || 'https://zalo.me/0982123456'}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2 rounded-full bg-burgundy-wine text-white text-xs font-semibold shadow-xs hover:bg-[#851622] transition-colors mt-2"
          >
            Nhắn Zalo ngay
          </a>
          <span className="text-[11px] text-text-muted">{contact.zaloHandle || 'Phản hồi ≤ 15 phút'}</span>
        </div>

        {/* Card 3: Email & Studio */}
        <div className="bg-surface-card p-6 rounded-2xl border border-border-delicate flex flex-col gap-3 shadow-xs items-center text-center">
          <div className="w-12 h-12 rounded-full bg-surface-subtle text-deep-espresso flex items-center justify-center">
            <Icon name="mail" className="text-[24px]" />
          </div>
          <h3 className="font-serif text-lg font-bold text-deep-espresso">Hòm thư Studio</h3>
          <p className="text-xs text-text-muted">Gửi file dung lượng lớn và hợp tác thương hiệu</p>
          <a
            href={`mailto:${contact.email}`}
            className="text-sm font-semibold text-deep-espresso hover:underline mt-2"
          >
            {contact.email}
          </a>
          <span className="text-[11px] text-text-muted">{contact.address || 'nhacotiec.vn'}</span>
        </div>
      </div>

      {/* Social Media Links Section - Lấy từ CMS socialLinks */}
      {activeSocials.length > 0 && (
        <div className="bg-surface-card p-6 rounded-2xl border border-border-delicate flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex flex-col text-center sm:text-left">
            <h4 className="font-serif text-sm font-bold text-deep-espresso">
              Kết nối mạng xã hội với Nhà Có Tiệc.
            </h4>
            <p className="text-xs text-text-muted">
              Theo dõi các mẫu thiệp mới nhất và câu chuyện tình yêu truyền cảm hứng.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            {activeSocials.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                aria-label={s.name}
                title={s.name}
                className="w-10 h-10 rounded-full bg-surface-subtle hover:bg-burgundy-wine hover:text-white text-deep-espresso border border-border-delicate flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95"
              >
                <SocialIcon platform={s.id} className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* SLA Commitment Banner */}
      <div className="bg-burgundy-wine text-surface-cream p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gold-foil shrink-0">
            <Icon name="verified" className="text-[22px]" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-base">{contact.slaCommitmentTitle || 'Cam kết thời gian bàn giao (SLA) 24h.'}</h4>
            <p className="text-xs text-surface-cream/80">
              {contact.slaCommitmentDesc || 'Nhà Có Tiệc cam kết gửi link website thiệp cưới xem thử trong vòng 24 giờ kể từ khi nhận đủ ảnh và nội dung.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

