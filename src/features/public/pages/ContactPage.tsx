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
        <div className="bg-surface-card p-6 rounded-2xl border border-border-delicate flex flex-col justify-between gap-5 shadow-xs hover:border-gold-foil/40 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-burgundy-wine/10 text-burgundy-wine flex items-center justify-center border border-burgundy-wine/15">
                <Icon name="call" className="text-[24px]" />
              </div>
              <span className="text-[11px] font-semibold text-burgundy-wine bg-burgundy-wine/10 px-2.5 py-1 rounded-full border border-burgundy-wine/20">
                Hỗ trợ trực tiếp
              </span>
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-deep-espresso">Hotline trực tiếp</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Hỗ trợ khẩn cấp ngày tiệc, tư vấn dịch vụ và giải đáp nhanh mọi thắc mắc.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border-delicate/70 flex flex-col gap-1.5">
            <span className="text-[10px] text-text-muted font-label-caps uppercase font-semibold tracking-wider">
              Số điện thoại tư vấn
            </span>
            <a
              href={`tel:${(contact.hotline || contact.phone || '0982 123 456').replace(/\s+/g, '')}`}
              className="text-lg font-serif font-bold text-burgundy-wine hover:text-[#851622] transition-colors inline-flex items-center gap-2"
            >
              <Icon name="phone_in_talk" className="text-[18px]" />
              <span>{contact.hotline || contact.phone || '0982 123 456'}</span>
            </a>
            <span className="text-[11px] text-text-muted flex items-center gap-1.5 mt-0.5">
              <Icon name="schedule" className="text-[14px] text-gold-foil shrink-0" />
              <span>{contact.workingHours || '08:30 - 22:00 hàng ngày'}</span>
            </span>
          </div>
        </div>

        {/* Card 2: Zalo */}
        <div className="bg-surface-card p-6 rounded-2xl border border-border-delicate flex flex-col justify-between gap-5 shadow-xs hover:border-gold-foil/40 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gold-foil/15 text-deep-espresso flex items-center justify-center border border-gold-foil/25">
                <Icon name="chat" className="text-[24px] text-gold-foil" />
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Phản hồi nhanh
              </span>
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-deep-espresso">Zalo CSKH 24/7</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Gửi ảnh cưới độ nét cao, trao đổi ý tưởng và duyệt layout trực tiếp cùng Designer.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border-delicate/70 flex flex-col gap-2">
            <a
              href={contact.zaloUrl || 'https://zalo.me/0982123456'}
              target="_blank"
              rel="noreferrer"
              className="w-full h-10 px-4 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Icon name="chat" className="text-[16px]" />
              <span>Nhắn tin Zalo ngay</span>
            </a>
            <span className="text-[11px] text-text-muted flex items-center gap-1.5">
              <Icon name="bolt" className="text-[14px] text-emerald-600 shrink-0" />
              <span>{contact.zaloHandle || 'Phản hồi trong vòng ≤ 15 phút'}</span>
            </span>
          </div>
        </div>

        {/* Card 3: Email & Studio */}
        <div className="bg-surface-card p-6 rounded-2xl border border-border-delicate flex flex-col justify-between gap-5 shadow-xs hover:border-gold-foil/40 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-surface-subtle text-deep-espresso flex items-center justify-center border border-border-delicate">
                <Icon name="mail" className="text-[24px]" />
              </div>
              <span className="text-[11px] font-semibold text-text-muted bg-surface-subtle px-2.5 py-1 rounded-full border border-border-delicate">
                Hòm thư Studio
              </span>
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-deep-espresso">Hòm thư Studio</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Tiếp nhận file dung lượng lớn, link Google Drive ảnh cưới và hợp tác đối tác.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border-delicate/70 flex flex-col gap-1.5">
            <span className="text-[10px] text-text-muted font-label-caps uppercase font-semibold tracking-wider">
              Địa chỉ hòm thư
            </span>
            <a
              href={`mailto:${contact.email || 'chao@nhacotiec.vn'}`}
              className="text-sm font-semibold text-deep-espresso hover:text-burgundy-wine transition-colors inline-flex items-center gap-2 truncate"
            >
              <Icon name="alternate_email" className="text-[16px] text-gold-foil shrink-0" />
              <span className="truncate">{contact.email || 'chao@nhacotiec.vn'}</span>
            </a>
            <span className="text-[11px] text-text-muted flex items-start gap-1.5 mt-0.5">
              <Icon name="place" className="text-[14px] text-gold-foil shrink-0 mt-0.5" />
              <span className="line-clamp-1">{contact.address || 'Số 8 Nguyễn Bỉnh Khiêm, P. Đa Kao, Quận 1, TP. Hồ Chí Minh'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Social Media Links Section - Lấy từ CMS socialLinks */}
      {activeSocials.length > 0 && (
        <div className="bg-surface-card p-6 rounded-2xl border border-border-delicate flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex flex-col text-center sm:text-left">
            <h4 className="font-serif text-sm font-bold text-deep-espresso">
              Kết nối mạng xã hội với Nhà Có Tiệc
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
            <h4 className="font-serif font-bold text-base">{contact.slaCommitmentTitle ? contact.slaCommitmentTitle.replace(/\.+$/, '') : 'Cam kết thời gian bàn giao (SLA) 24h'}</h4>
            <p className="text-xs text-surface-cream/80">
              {contact.slaCommitmentDesc || 'Nhà Có Tiệc cam kết gửi link website thiệp cưới xem thử trong vòng 24 giờ kể từ khi nhận đủ ảnh và nội dung.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

