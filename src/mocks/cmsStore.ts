import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { logActivity } from '../services/activityLogService';
import {
  CmsContent,
  HomepageHero,
  HomepageIntro,
  HomepageFeaturedTemplates,
  HomepageFeature,
  Testimonial,
  HomepageCta,
  SiteFooter,
  ContactPageContent,
  SiteSettings,
  SocialLinksConfig,
  OrderFormConfig,
} from '../types/cms';

const STORAGE_KEY = 'nha_co_tiec_cms_v8';
const BROADCAST_CHANNEL_NAME = 'nha_co_tiec_cms_channel';

export const DEFAULT_ORDER_FORM_CONFIG: OrderFormConfig = {
  title: 'Điền Thông Tin Ngày Cưới',
  subtitle: 'Cung cấp chi tiết để Nhà Có Tiệc hoàn thiện thiệp cưới hoàn hảo cho bạn',
  noticeText: '',
  supportZalo: '0982 123 456',
  supportZaloLink: 'https://zalo.me/0982123456',
  photoGuideNote: 'Gợi ý: Tải từ 5 - 15 ảnh chất lượng cao (ảnh cổng, ảnh phóng lớn, khoảnh khắc chụp đôi) để website thiệp cưới hiển thị đẹp nhất.',
  maxPhotos: 15,
  showParentsSection: true,
  showLoveStorySection: true,
  showTimelineSection: true,
  showVideoSection: true,
  showRsvpSection: true,
  rsvpTitle: 'Xác Nhận Tham Dự (RSVP) & Sổ Lưu Bút Online',
  rsvpSubtitle: 'Quản lý số lượng bàn tiệc dễ dàng từ phản hồi của khách trên thiệp.',
  rsvpNote: 'Sau ngày này form RSVP sẽ tự động thông báo đóng nhận đăng ký thêm khách.',
  rsvpFeatures: [
    'Tự động thống kê số lượng khách đi cùng (vợ/chồng/con nhỏ)',
    'Tích hợp bảng khảo sát món ăn kiêng / chay tiện lợi',
    'Sổ lưu bút online kèm hiệu ứng thả tim lời chúc thời gian thực',
  ],
  termsText: 'Tôi xác nhận thông tin trên là chính xác và đồng ý điều khoản dịch vụ phát hành thiệp cưới của Nhà Có Tiệc.',
};

export const DEFAULT_CMS_CONTENT: CmsContent = {
  hero: {
    headline: 'Lưu giữ khoảnh khắc\nthiêng liêng với website thiệp cưới',
    subtext:
      'Một lời mời đẹp, một câu chuyện riêng\nvà những khoảnh khắc được lưu giữ\ntheo cách của bạn.',
    description: 'Nền tảng phát hành và vận hành website thiệp cưới cao cấp chỉn chu.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDpXKlSfTGty-PGubJdHXwzvpNLe8cuWV-jvA6kHaI4GVCxASSifIC8yGtLn1joBZ2BXHwDDJmO5w8jwRnpWktnO9p03jRcmmy7K8KGjzhLyUypKsH_QZn73Lhx7HBUpqjS2EYa_DYgMKh4VAI7Bpfgrzu341AnUXJdn1JhDyQq1Opk6zgmFUnEK8fbiMa1zmEBFh8kjzFZkpD47zygb2J8kqhUaV6DV-M99hnxtg34F588D-bEr-7J',
    coverImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDpXKlSfTGty-PGubJdHXwzvpNLe8cuWV-jvA6kHaI4GVCxASSifIC8yGtLn1joBZ2BXHwDDJmO5w8jwRnpWktnO9p03jRcmmy7K8KGjzhLyUypKsH_QZn73Lhx7HBUpqjS2EYa_DYgMKh4VAI7Bpfgrzu341AnUXJdn1JhDyQq1Opk6zgmFUnEK8fbiMa1zmEBFh8kjzFZkpD47zygb2J8kqhUaV6DV-M99hnxtg34F588D-bEr-7J',
    mobileCoverImageUrl: '/hero-mobile.jpg',
    ctaText: 'Xem mẫu thiệp',
    ctaUrl: '#danh-sach-mau',
    ctaLink: '#danh-sach-mau',
    secondaryCtaText: 'Tư vấn thiết kế',
    secondaryCtaUrl: '/lien-he',
    badge: '',
    badges: [],
    indicator1Text: '',
    indicator2Text: '',
    enabled: true,
  },
  intro: {
    title: '4 bước sở hữu website thiệp cưới',
    subtitle: 'Về Nhà Có Tiệc',
    eyebrow: 'Quy trình hoàn thiện',
    description:
      'Đội ngũ thiết kế Nhà Có Tiệc phụ trách toàn bộ khâu thẩm mỹ, bạn chỉ cần gửi thông tin tiệc và ảnh cưới.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDcG33avYwElbHhGDTVlVQuUc9s8BeaI5EA8z3jNIjrsioWsyO-2DPCazpkn2HVwq7tVS47QsuNo_CwKjZAOKBgy-m9ot3yGbRdL2GEgYpPmaz4pgfzcRk3NFUolvvSwLIKyOqVtcrcHq5wRHyWtaNIllb5lC1xxgHkoSc2v0x3MPqJJdPkf8w2uQj-JFcm-oeiOLNkvM2IMKlwmT3FtjKlxmmbPfQaKP_Y9vwbI-JgzCE-hpmkCbN2',
    buttonText: 'Xem câu chuyện thương hiệu',
    buttonUrl: '/lien-he',
    steps: [
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
    ],
    enabled: true,
  },
  featuredTemplates: {
    title: 'Mẫu thiệp cưới độc bản',
    subtitle: 'Bộ sưu tập tuyển chọn',
    eyebrow: 'Bộ sưu tập tuyển chọn',
    description:
      'Từng mẫu giao diện đều được chăm chút tỉ mỉ từ phông chữ serif lãng mạn đến hiệu ứng cuộn ảnh như trang tạp chí.',
    featuredTemplateIds: ['tpl-minh-anh', 'tpl-thanh-xuan', 'tpl-ngoc-lan', 'tpl-moc-tra'],
    enabled: true,
  },
  features: [
    {
      id: 'feat-1',
      title: 'Lưu trữ 1 năm miễn phí',
      subtitle: '365 ngày hiển thị trực tuyến',
      description:
        'Thiệp miễn phí trong suốt 365 ngày kể từ ngày cưới. Dâu rể an tâm lưu giữ kỷ niệm và hình ảnh mà không lo bị mất dữ liệu hay phát sinh phí duy trì.',
      icon: 'history',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
      enabled: true,
      displayOrder: 1,
      order: 1,
    },
    {
      id: 'feat-2',
      title: 'Album ảnh & Nhạc nền lãng mạn',
      subtitle: 'Trải nghiệm thị giác trọn vẹn',
      description:
        'Thiệp đẹp, gallery ảnh cưới chất lượng cao sắc nét kết hợp cùng giai điệu tình yêu tự chọn, mang đến trải nghiệm thị giác và cảm xúc trọn vẹn cho khách mời.',
      icon: 'library_music',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
      enabled: true,
      displayOrder: 2,
      order: 2,
    },
    {
      id: 'feat-3',
      title: 'Quản lý RSVP & Lời chúc tự động',
      subtitle: 'Tổng hợp & xuất Excel tức thì',
      description:
        'Khách mời dễ dàng xác nhận tham dự và gửi lời chúc tốt đẹp. Toàn bộ dữ liệu được hệ thống tự động tổng hợp thành file Excel bàn giao trực tiếp cho bạn.',
      icon: 'how_to_reg',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80',
      enabled: true,
      displayOrder: 3,
      order: 3,
    },
  ],
  testimonials: [
    {
      id: 'test-1',
      customerName: 'Nguyễn Minh Anh',
      coupleName: 'Minh Anh & Đức Minh',
      shortInfo: 'Tiệc cưới tại GEM Center, TP. Hồ Chí Minh',
      weddingDate: '18.12.2025',
      location: 'TP. Hồ Chí Minh',
      content:
        'Thiệp cưới online của Nhà Có Tiệc khiến cả gia đình và bạn bè chúng mình đều trầm trồ vì sự sang trọng. Nhạc phát rất mượt mà, khách điền RSVP tiện lợi và file Excel tổng hợp gửi lại cực kỳ chu đáo!',
      quote:
        'Thiệp cưới online của Nhà Có Tiệc khiến cả gia đình và bạn bè chúng mình đều trầm trồ vì sự sang trọng. Nhạc phát rất mượt mà, khách điền RSVP tiện lợi và file Excel tổng hợp gửi lại cực kỳ chu đáo!',
      rating: 5,
      avatarUrl:
        'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=300&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=300&q=80',
      enabled: true,
      displayOrder: 1,
      order: 1,
    },
    {
      id: 'test-2',
      customerName: 'Trần Thanh Thảo',
      coupleName: 'Thanh Thảo & Hoàng Nam',
      shortInfo: 'Lễ thành hôn phong cách Vintage, Hà Nội',
      weddingDate: '08.11.2025',
      location: 'Hà Nội',
      content:
        'Tone màu ấm áp và hiệu ứng cuộn ảnh như tạp chí điện ảnh đúng y như mong đợi của hai đứa. Đội ngũ thiết kế hỗ trợ nhiệt tình, nhận ảnh là hoàn thiện bản duyệt trong chưa đầy 24 giờ.',
      quote:
        'Tone màu ấm áp và hiệu ứng cuộn ảnh như tạp chí điện ảnh đúng y như mong đợi của hai đứa. Đội ngũ thiết kế hỗ trợ nhiệt tình, nhận ảnh là hoàn thiện bản duyệt trong chưa đầy 24 giờ.',
      rating: 5,
      avatarUrl:
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=300&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=300&q=80',
      enabled: true,
      displayOrder: 2,
      order: 2,
    },
    {
      id: 'test-3',
      customerName: 'Vũ Ngọc Lan',
      coupleName: 'Ngọc Lan & Quang Huy',
      shortInfo: 'Tiệc cưới tại White Palace, TP. Hồ Chí Minh',
      weddingDate: '26.01.2026',
      location: 'TP. Hồ Chí Minh',
      content:
        'Bạn bè ở xa nhận thiệp qua Zalo ai cũng khen nức nở. Thao tác gửi lời chúc và xác nhận số người đi cùng rất dễ dùng ngay cả với người lớn tuổi trong họ hàng.',
      quote:
        'Bạn bè ở xa nhận thiệp qua Zalo ai cũng khen nức nở. Thao tác gửi lời chúc và xác nhận số người đi cùng rất dễ dùng ngay cả với người lớn tuổi trong họ hàng.',
      rating: 5,
      avatarUrl:
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=300&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=300&q=80',
      enabled: true,
      displayOrder: 3,
      order: 3,
    },
  ],
  cta: {
    heading: 'Sẵn sàng gửi trọn yêu thương trong chiếc thiệp cưới độc bản?',
    headline: 'Sẵn sàng gửi trọn yêu thương trong chiếc thiệp cưới độc bản?',
    description:
      'Hãy để Nhà Có Tiệc đồng hành kiến tạo không gian thiệp cưới trực tuyến tinh tế, hoàn thiện trong 24 giờ.',
    subtext:
      'Hãy để Nhà Có Tiệc đồng hành kiến tạo không gian thiệp cưới trực tuyến tinh tế, hoàn thiện trong 24 giờ.',
    buttonText: 'Khám phá bộ sưu tập mẫu',
    buttonUrl: '/mau-thiep',
    buttonLink: '/mau-thiep',
    guaranteeText: 'Cam kết bàn giao trong 24 giờ • Hỗ trợ chỉnh sửa 1 lần miễn phí khi bàn giao',
    backgroundImageUrl:
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    enabled: true,
  },
  footer: {
    brandName: 'Nhà Có Tiệc',
    slogan:
      'Nền tảng thiệp cưới trực tuyến cao cấp đồng hành cùng các cặp đôi. Đội ngũ thiết kế riêng theo từng câu chuyện tình yêu độc bản, hoàn thiện nhanh chóng trong 24h.',
    brandDescription:
      'Nền tảng thiệp cưới trực tuyến cao cấp đồng hành cùng các cặp đôi. Đội ngũ thiết kế riêng theo từng câu chuyện tình yêu độc bản, hoàn thiện nhanh chóng trong 24h.',
    phone: '0982 123 456',
    hotline: '0982 123 456',
    email: 'chao@nhacotiec.vn',
    address: 'Số 8 Nguyễn Bỉnh Khiêm, P. Đa Kao, Quận 1, TP. Hồ Chí Minh',
    facebookUrl: 'https://facebook.com',
    tiktokUrl: 'https://tiktok.com',
    instagramUrl: 'https://instagram.com',
    threadsUrl: 'https://threads.net',
    zaloUrl: 'https://zalo.me',
    openingHours: '8:30 - 22:00 hàng ngày',
    workingHours: '8:30 - 22:00 hàng ngày',
    copyright: '© 2026 Nhà Có Tiệc (nhacotiec.vn). Bản quyền thuộc về Nhà Có Tiệc Studio.',
    copyrightText: '© 2026 Nhà Có Tiệc (nhacotiec.vn). Bản quyền thuộc về Nhà Có Tiệc Studio.',
  },
  contact: {
    eyebrow: 'Đồng Hành Cùng Hôn Lễ Của Bạn',
    title: 'Liên Hệ Nhà Có Tiệc',
    subtitle: 'Đồng Hành Cùng Hôn Lễ Của Bạn',
    description:
      'Đội ngũ chăm sóc cô dâu & chú rể luôn sẵn sàng lắng nghe mọi ý tưởng và giải đáp chi tiết các khâu chuẩn bị thiệp cưới online.',
    phone: '0982 123 456',
    hotline: '0982 123 456',
    email: 'chao@nhacotiec.vn',
    address: 'Số 8 Nguyễn Bỉnh Khiêm, P. Đa Kao, Quận 1, TP. Hồ Chí Minh',
    facebookUrl: 'https://facebook.com',
    tiktokUrl: 'https://tiktok.com',
    instagramUrl: 'https://instagram.com',
    threadsUrl: 'https://threads.net',
    zaloUrl: 'https://zalo.me',
    zaloHandle: 'Phản hồi ≤ 15 phút',
    mapUrl: 'https://maps.google.com/?q=GEM+Center',
    imageUrl:
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
    ctaText: 'Nhắn Zalo Ngay',
    ctaUrl: 'https://zalo.me',
    workingHours: '8:30 - 22:00 hàng ngày',
    slaCommitmentTitle: 'Cam kết thời gian bàn giao (SLA) 24h',
    slaCommitmentDesc:
      'Nhà Có Tiệc cam kết gửi link website thiệp cưới xem thử trong vòng 24 giờ kể từ khi nhận đủ ảnh và nội dung.',
    socialLinks: [
      { platform: 'Facebook', url: 'https://facebook.com' },
      { platform: 'TikTok', url: 'https://tiktok.com' },
      { platform: 'Instagram', url: 'https://instagram.com' },
      { platform: 'Threads', url: 'https://threads.net' },
      { platform: 'Zalo', url: 'https://zalo.me' },
    ],
  },
  settings: {
    siteName: 'Nhà Có Tiệc',
    siteSlogan: 'Thiệp Cưới Tinh Tế & Vận Hành Trọn Vẹn',
    tagline: 'Thiệp Cưới Tinh Tế & Vận Hành Trọn Vẹn',
    metaDescription: 'Website thiệp cưới online cao cấp cá nhân hóa, hoàn thiện trong 24h.',
    hotline: '0982 123 456',
    supportEmail: 'chao@nhacotiec.vn',
    zaloSupportUrl: 'https://zalo.me/0982123456',
    zaloDisplayName: 'Nhà Có Tiệc CSKH 24/7',
    zaloPhone: '0982 123 456',
    announcementBanner: {
      enabled: true,
      text: 'Ưu đãi mùa cưới 2026: Miễn phí 1 lần yêu cầu chỉnh sửa khi bàn giao và xuất file Excel RSVP.',
      link: '/mau-thiep',
    },
  },
  socialLinks: {
    facebook: {
      enabled: true,
      url: 'https://facebook.com/nhacotiec',
    },
    instagram: {
      enabled: true,
      url: 'https://instagram.com/nhacotiec',
    },
    tiktok: {
      enabled: true,
      url: 'https://tiktok.com/@nhacotiec',
    },
    threads: {
      enabled: true,
      url: 'https://threads.net/@nhacotiec',
    },
    zalo: {
      enabled: true,
      url: 'https://zalo.me/0982123456',
    },
  },
  orderForm: DEFAULT_ORDER_FORM_CONFIG,
};

let currentCmsContent: CmsContent = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_CMS_CONTENT,
        ...parsed,
        orderForm: {
          ...DEFAULT_ORDER_FORM_CONFIG,
          ...(parsed.orderForm || {}),
          noticeText:
            parsed.orderForm?.noticeText?.includes('Designer Nhà Có Tiệc')
              ? ''
              : (parsed.orderForm?.noticeText ?? ''),
          rsvpFeatures:
            Array.isArray(parsed.orderForm?.rsvpFeatures) && parsed.orderForm.rsvpFeatures.length > 0
              ? parsed.orderForm.rsvpFeatures
              : DEFAULT_ORDER_FORM_CONFIG.rsvpFeatures,
        },
      };
    }
  } catch (e) {
    console.error('Failed to load CMS content from localStorage', e);
  }
  return DEFAULT_CMS_CONTENT;
})();

const listeners = new Set<() => void>();

// Cross-tab BroadcastChannel for 0ms multi-tab sync
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    broadcastChannel.onmessage = (event) => {
      if (event.data?.type === 'CMS_UPDATED' && event.data?.cms) {
        currentCmsContent = event.data.cms;
        listeners.forEach((fn) => fn());
      }
    };
  }
} catch (e) {}

// Window Storage Event listener for cross-tab sync
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        currentCmsContent = JSON.parse(event.newValue);
        listeners.forEach((fn) => fn());
      } catch (e) {}
    }
  });
}

// Firestore Real-time Sync for settings/cms document
let isFirestoreCmsListening = false;
function initFirestoreCmsSync() {
  if (isFirestoreCmsListening || !db) return;
  try {
    isFirestoreCmsListening = true;
    onSnapshot(
      doc(db, 'settings', 'cms'),
      (docSnap) => {
        if (docSnap.exists()) {
          const remoteData = docSnap.data() as Partial<CmsContent>;
          currentCmsContent = {
            ...DEFAULT_CMS_CONTENT,
            ...remoteData,
            hero: { ...DEFAULT_CMS_CONTENT.hero, ...(remoteData.hero || {}) },
            intro: {
              ...DEFAULT_CMS_CONTENT.intro,
              ...(remoteData.intro || {}),
              steps: (remoteData.intro?.steps && Array.isArray(remoteData.intro.steps) && remoteData.intro.steps.length > 0)
                ? remoteData.intro.steps
                : DEFAULT_CMS_CONTENT.intro.steps,
            },
            features: (remoteData.features && Array.isArray(remoteData.features) && remoteData.features.length > 0)
              ? remoteData.features
              : DEFAULT_CMS_CONTENT.features,
            testimonials: (remoteData.testimonials && Array.isArray(remoteData.testimonials) && remoteData.testimonials.length > 0)
              ? remoteData.testimonials
              : DEFAULT_CMS_CONTENT.testimonials,
            featuredTemplates: { ...DEFAULT_CMS_CONTENT.featuredTemplates, ...(remoteData.featuredTemplates || {}) },
            footer: { ...DEFAULT_CMS_CONTENT.footer, ...(remoteData.footer || {}) },
            contact: { ...DEFAULT_CMS_CONTENT.contact, ...(remoteData.contact || {}) },
            settings: { ...DEFAULT_CMS_CONTENT.settings, ...(remoteData.settings || {}) },
            orderForm: {
              ...DEFAULT_ORDER_FORM_CONFIG,
              ...(remoteData.orderForm || {}),
              rsvpFeatures:
                Array.isArray(remoteData.orderForm?.rsvpFeatures) && remoteData.orderForm.rsvpFeatures.length > 0
                  ? remoteData.orderForm.rsvpFeatures
                  : DEFAULT_ORDER_FORM_CONFIG.rsvpFeatures,
            },
          };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentCmsContent));
          } catch (e) {}
          listeners.forEach((fn) => fn());
        }
      },
      (err) => {
        console.info('Firestore CMS live sync fallback:', err.message);
      }
    );
  } catch (e) {
    console.warn('Firestore CMS sync error:', e);
  }
}

initFirestoreCmsSync();

function notify(logReason?: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentCmsContent));
  } catch (e) {
    console.error('Failed to save CMS content to localStorage', e);
  }

  try {
    broadcastChannel?.postMessage({
      type: 'CMS_UPDATED',
      cms: currentCmsContent,
    });
  } catch (e) {}

  // Sync to Firestore
  if (db && logReason) {
    setDoc(doc(db, 'settings', 'cms'), currentCmsContent, { merge: true }).catch((err) => {
      console.warn('Failed to sync CMS to Firestore:', err);
    });

    logActivity({
      type: 'admin_setting_changed',
      actorName: 'Admin',
      actorRole: 'admin',
      title: 'Cập nhật nội dung website (CMS)',
      description: logReason,
    }).catch(() => {});
  }

  listeners.forEach((fn) => fn());
}

export function getCmsContent(): CmsContent {
  return { ...currentCmsContent };
}

export function updateHero(data: Partial<HomepageHero>): HomepageHero {
  currentCmsContent = {
    ...currentCmsContent,
    hero: { ...currentCmsContent.hero, ...data },
  };
  notify('Cập nhật nội dung banner Hero trang chủ');
  return { ...currentCmsContent.hero };
}

export function updateIntro(data: Partial<HomepageIntro>): HomepageIntro {
  currentCmsContent = {
    ...currentCmsContent,
    intro: { ...currentCmsContent.intro, ...data },
  };
  notify('Cập nhật nội dung giới thiệu & quy trình 4 bước');
  return { ...currentCmsContent.intro };
}

export function updateFeaturedTemplates(
  data: Partial<HomepageFeaturedTemplates>
): HomepageFeaturedTemplates {
  currentCmsContent = {
    ...currentCmsContent,
    featuredTemplates: { ...currentCmsContent.featuredTemplates, ...data },
  };
  notify('Cập nhật danh sách mẫu thiệp nổi bật trang chủ');
  return { ...currentCmsContent.featuredTemplates };
}

export function updateFeatures(features: HomepageFeature[]): HomepageFeature[] {
  currentCmsContent = {
    ...currentCmsContent,
    features: [...features],
  };
  notify('Cập nhật danh sách tính năng nổi bật');
  return [...currentCmsContent.features];
}

export function updateTestimonials(testimonials: Testimonial[]): Testimonial[] {
  currentCmsContent = {
    ...currentCmsContent,
    testimonials: [...testimonials],
  };
  notify('Cập nhật đánh giá của khách hàng');
  return [...currentCmsContent.testimonials];
}

export function updateCta(data: Partial<HomepageCta>): HomepageCta {
  currentCmsContent = {
    ...currentCmsContent,
    cta: { ...currentCmsContent.cta, ...data },
  };
  notify('Cập nhật lời kêu gọi hành động CTA');
  return { ...currentCmsContent.cta };
}

export function updateFooter(data: Partial<SiteFooter>): SiteFooter {
  currentCmsContent = {
    ...currentCmsContent,
    footer: { ...currentCmsContent.footer, ...data },
  };
  notify('Cập nhật thông tin chân trang Footer');
  return { ...currentCmsContent.footer };
}

export function updateContactContent(data: Partial<ContactPageContent>): ContactPageContent {
  const updatedContact = { ...currentCmsContent.contact, ...data };
  const updatedFooter = {
    ...currentCmsContent.footer,
    ...(data.hotline ? { hotline: data.hotline } : {}),
    ...(data.phone ? { phone: data.phone } : {}),
    ...(data.zaloUrl ? { zaloUrl: data.zaloUrl } : {}),
    ...(data.email ? { email: data.email } : {}),
    ...(data.address ? { address: data.address } : {}),
    ...(data.workingHours ? { workingHours: data.workingHours, openingHours: data.workingHours } : {}),
  };
  currentCmsContent = {
    ...currentCmsContent,
    contact: updatedContact,
    footer: updatedFooter,
  };
  notify('Cập nhật thông tin trang Liên hệ & hỗ trợ Zalo');
  return { ...currentCmsContent.contact };
}

export function updateSiteSettings(data: Partial<SiteSettings>): SiteSettings {
  const updatedSettings = { ...currentCmsContent.settings, ...data };
  const updatedFooter = {
    ...currentCmsContent.footer,
    ...(data.hotline ? { hotline: data.hotline } : {}),
    ...(data.zaloPhone ? { phone: data.zaloPhone } : {}),
    ...(data.zaloSupportUrl ? { zaloUrl: data.zaloSupportUrl } : {}),
    ...(data.supportEmail ? { email: data.supportEmail } : {}),
  };
  currentCmsContent = {
    ...currentCmsContent,
    settings: updatedSettings,
    footer: updatedFooter,
  };
  notify('Cập nhật cấu hình website & kênh hỗ trợ Zalo');
  return { ...currentCmsContent.settings };
}

export function updateSocialLinks(data: Partial<SocialLinksConfig>): SocialLinksConfig {
  const current = currentCmsContent.socialLinks || DEFAULT_CMS_CONTENT.socialLinks!;
  const updated = {
    ...current,
    ...data,
  };
  currentCmsContent = {
    ...currentCmsContent,
    socialLinks: updated,
  };
  notify('Cập nhật liên kết mạng xã hội');
  return { ...updated };
}

export function updateEntireCms(data: Partial<CmsContent>): CmsContent {
  currentCmsContent = {
    ...currentCmsContent,
    ...data,
  };
  notify('Cập nhật toàn bộ nội dung CMS');
  return { ...currentCmsContent };
}

export function resetCmsContent(): CmsContent {
  currentCmsContent = { ...DEFAULT_CMS_CONTENT };
  notify('Khôi phục nội dung CMS về mặc định');
  return { ...currentCmsContent };
}

export const resetCmsToDefaults = resetCmsContent;

export function useCmsContent(): CmsContent {
  const [cms, setCms] = useState<CmsContent>(getCmsContent);

  useEffect(() => {
    const handleUpdate = () => {
      setCms(getCmsContent());
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return cms;
}

export function useZaloSupportUrl(): string {
  const cms = useCmsContent();
  const candidates = [
    cms.settings?.zaloSupportUrl,
    cms.orderForm?.supportZaloLink,
    cms.contact?.zaloUrl,
    cms.socialLinks?.zalo?.url,
  ];

  for (const url of candidates) {
    if (url && typeof url === 'string') {
      const trimmed = url.trim();
      if (trimmed && trimmed !== 'https://zalo.me' && trimmed !== 'https://zalo.me/') {
        return trimmed;
      }
    }
  }

  const phoneCandidates = [
    cms.settings?.zaloPhone,
    cms.orderForm?.supportZalo,
    cms.settings?.hotline,
    cms.contact?.hotline,
    cms.contact?.phone,
  ];

  for (const phone of phoneCandidates) {
    if (phone && typeof phone === 'string') {
      const cleanDigits = phone.replace(/[^0-9]/g, '');
      if (cleanDigits.length >= 9) {
        return `https://zalo.me/${cleanDigits}`;
      }
    }
  }

  for (const url of candidates) {
    if (url && typeof url === 'string' && url.trim()) {
      return url.trim();
    }
  }

  return 'https://zalo.me/0982123456';
}
