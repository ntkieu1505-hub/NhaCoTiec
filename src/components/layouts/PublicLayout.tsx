import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { SocialIcon, SOCIAL_PLATFORMS_LIST } from '../common/SocialIcon';
import { useCmsContent, DEFAULT_CMS_CONTENT, useZaloSupportUrl } from '../../mocks/cmsStore';
import { useAuth } from '../../mocks/authStore';

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const cms = useCmsContent();
  const zaloUrl = useZaloSupportUrl();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  const displayHotline =
    cms.settings?.hotline ||
    cms.contact?.hotline ||
    cms.contact?.phone ||
    cms.footer?.hotline ||
    cms.footer?.phone ||
    '0982 123 456';
  const displayZaloPhone =
    cms.settings?.zaloPhone ||
    cms.orderForm?.supportZalo ||
    cms.contact?.phone ||
    cms.settings?.hotline ||
    cms.footer?.phone ||
    cms.footer?.hotline ||
    displayHotline;

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

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Mẫu thiệp cưới', path: '/mau-thiep' },
    { name: 'Liên hệ', path: '/lien-he' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface-cream text-on-surface font-sans">
      {/* 1. Header / Navbar - Burgundy Wine (#6D141A) */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#6D141A]/95 backdrop-blur-md border-b border-white/15 transition-colors shadow-md pt-safe">
        <div className="h-14 sm:h-15 md:h-16 px-3 sm:px-4 md:px-8 max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Brand Logo & Title with Playfair Display matching logo font */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 md:gap-3 group shrink-0">
            <img
              src="/logo.png"
              alt="Nhà Có Tiệc Logo"
              loading="eager"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.retried) {
                  img.dataset.retried = '1';
                  img.src = '/logo.png?v=' + Date.now();
                }
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full object-cover shadow-sm border border-white/20 group-hover:scale-105 transition-transform shrink-0"
            />
            <span className="font-playfair text-[16px] sm:text-[18px] md:text-[23px] font-bold tracking-[0.01em] text-[#FDF8EB] leading-none drop-shadow-xs">
              Nhà Có Tiệc
            </span>
          </Link>

          {/* Desktop Navigation Links: Trang chủ, Mẫu thiệp cưới, Liên hệ */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive ? 'text-white font-semibold underline underline-offset-4' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: ONE main entry point "Đăng nhập" before login */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
            {!isAuthenticated ? (
              <Link
                to="/dang-nhap"
                className="px-3 py-1 sm:px-4 sm:py-1.5 md:px-5 md:py-2 text-[11px] sm:text-xs md:text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-full shadow-xs active:scale-95 transition-all"
              >
                Đăng nhập
              </Link>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  to={isAdmin ? '/admin/tong-quan' : '/dashboard'}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-full bg-gold-foil text-deep-espresso hover:brightness-105 transition-all flex items-center gap-1 shadow-sm shrink-0"
                >
                  <Icon name={isAdmin ? 'admin_panel_settings' : 'dashboard'} className="text-[13px] sm:text-[15px]" />
                  <span className="hidden sm:inline">{isAdmin ? 'Quản trị Admin' : 'Cổng Khách Hàng'}</span>
                  <span className="sm:hidden">{isAdmin ? 'Admin' : 'Cổng KH'}</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-full border border-white/20 transition-all shrink-0"
                  title="Đăng xuất"
                >
                  Đăng xuất
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
              className="md:hidden w-8 h-8 flex items-center justify-center text-white/90 hover:text-white active:scale-95 transition-transform"
            >
              <Icon name={mobileMenuOpen ? 'close' : 'menu'} className="text-[20px] sm:text-[22px]" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#530c12] border-t border-white/15 px-4 py-4 flex flex-col gap-3 animate-in fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/90 hover:text-white text-sm py-1.5 font-medium flex items-center justify-between"
              >
                <span>{link.name}</span>
                <Icon name="chevron_right" className="text-[16px] text-white/50" />
              </Link>
            ))}
            <div className="pt-3 border-t border-white/10">
              {!isAuthenticated ? (
                <Link
                  to="/dang-nhap"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold block border border-white/20"
                >
                  Đăng nhập
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to={isAdmin ? '/admin/tong-quan' : '/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center rounded-full bg-gold-foil text-deep-espresso text-xs font-semibold"
                  >
                    {isAdmin ? 'Quản trị Admin' : 'Cổng Khách Hàng'}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2 text-center rounded-full bg-white/10 text-white text-xs font-medium border border-white/20"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-14 sm:pt-15 md:pt-16 flex flex-col w-full">
        <Outlet />
      </main>

      {/* Public Footer (CMS Dynamic) */}
      <footer className="bg-deep-espresso text-surface-cream pt-5 sm:pt-8 md:pt-12 pb-8 border-t border-gold-foil/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-16 pb-8 border-b border-white/10">
            {/* Col 1: Brand info */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo.png"
                  alt="Nhà Có Tiệc Logo"
                  loading="eager"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.dataset.retried) {
                      img.dataset.retried = '1';
                      img.src = '/logo.png?v=' + Date.now();
                    }
                  }}
                  className="w-9 h-9 rounded-full object-cover shadow-sm border border-gold-foil/30 shrink-0"
                />
                <span className="font-playfair text-2xl font-bold text-surface-cream">
                  {cms.footer.brandName || 'Nhà Có Tiệc'}
                </span>
              </div>
              <p className="text-body-sm text-text-muted max-w-sm leading-relaxed">
                {cms.footer.slogan || 'Nền tảng thiệp cưới trực tuyến đồng hành cùng các cặp đôi. Đội ngũ thiết kế riêng theo từng câu chuyện tình yêu độc bản, hoàn thiện nhanh chóng trong 24h.'}
              </p>
              <div className="flex items-center gap-3 pt-2 text-xs text-gold-foil font-medium">
                <span className="flex items-center gap-1">
                  <Icon name="verified" className="text-[14px]" /> Cam kết 24h
                </span>
                <span>•</span>
                <span>Giá bán lẻ 59k - 79k</span>
              </div>

              {/* Social Media Links from CMS */}
              {activeSocials.length > 0 && (
                <div className="flex items-center gap-2 pt-2">
                  {activeSocials.map((s) => (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.name}
                      title={s.name}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-gold-foil hover:text-deep-espresso text-surface-cream flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95"
                    >
                      <SocialIcon platform={s.id} className="w-3.5 h-3.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Col 2: Support */}
            <div className="flex flex-col gap-2.5 md:pl-8 lg:pl-16">
              <span className="font-label-caps text-xs tracking-wider text-gold-foil font-semibold">
                Liên hệ hỗ trợ
              </span>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Icon name="call" className="text-[16px] text-gold-foil" />
                <a
                  href={`tel:${displayHotline.replace(/\s+/g, '')}`}
                  className="hover:text-surface-cream transition-colors"
                >
                  Hotline: {displayHotline}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Icon name="chat" className="text-[16px] text-gold-foil" />
                <a
                  href={zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-surface-cream transition-colors underline underline-offset-2 flex items-center gap-1.5"
                >
                  <span>Zalo: {displayZaloPhone}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold-foil/20 text-gold-foil font-medium">Hỗ trợ 24/7</span>
                </a>
              </div>
              {cms.footer.email && (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Icon name="mail" className="text-[16px] text-gold-foil" />
                  <a href={`mailto:${cms.footer.email}`} className="hover:text-surface-cream transition-colors">
                    {cms.footer.email}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Icon name="schedule" className="text-[16px] text-gold-foil" />
                <span>{cms.footer.workingHours}</span>
              </div>
              {cms.footer.address && (
                <div className="flex items-start gap-2 text-xs text-text-muted mt-1">
                  <Icon name="place" className="text-[15px] text-gold-foil shrink-0 mt-0.5" />
                  <span>{cms.footer.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-2">
            <p>{cms.footer.copyrightText || '© 2026 Nhà Có Tiệc (nhacotiec.vn). Bản quyền thuộc về Nhà Có Tiệc Studio.'}</p>
            <div className="flex items-center gap-4">
              <span>Bán theo sản phẩm</span>
              <span>•</span>
              <span>Chính sách bảo mật</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Mobile Simulator Switcher for Admin on Public Pages */}
      {isAdmin && (
        <div className="fixed bottom-5 right-5 z-40 hidden md:block">
          <Link
            to={`/admin/tong-quan?view=mobile&preview=${encodeURIComponent(location.pathname)}`}
            className="px-4 py-2.5 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold shadow-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border border-white/20"
            title="Mở Trình mô phỏng điện thoại xem trang này"
          >
            <Icon name="smartphone" className="text-[17px]" />
            <span>Mô phỏng Điện thoại</span>
          </Link>
        </div>
      )}
    </div>
  );
};
