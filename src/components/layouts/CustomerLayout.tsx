import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { useZaloSupportUrl } from '../../mocks/cmsStore';
import { useNotifications } from '../../mocks/notificationStore';
import { NotificationType } from '../../types/notification';
import { useAuth } from '../../mocks/authStore';

export const CustomerLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const zaloUrl = useZaloSupportUrl();
  const { user, logout } = useAuth();
  const currentUserId = user?.id || '01';
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(currentUserId);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const isDetailPage =
    location.pathname.includes('/don-hang/') ||
    location.pathname.includes('/thong-tin-dang-nhap');

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (id: string, actionUrl?: string) => {
    markAsRead(id);
    setShowNotifications(false);
    if (actionUrl) {
      if (actionUrl.startsWith('/')) {
        navigate(actionUrl);
      } else {
        window.location.href = actionUrl;
      }
    }
  };

  const getTypeMeta = (type: NotificationType) => {
    switch (type) {
      case 'payment':
        return { icon: 'payments', color: 'text-emerald-700 bg-emerald-50' };
      case 'design':
        return { icon: 'draw', color: 'text-indigo-700 bg-indigo-50' };
      case 'invitation':
        return { icon: 'favorite', color: 'text-burgundy-wine bg-rose-50' };
      case 'guest':
        return { icon: 'description', color: 'text-amber-700 bg-amber-50' };
      case 'revision':
        return { icon: 'edit_note', color: 'text-orange-700 bg-orange-50' };
      case 'order':
        return { icon: 'shopping_bag', color: 'text-blue-700 bg-blue-50' };
      default:
        return { icon: 'notifications', color: 'text-deep-espresso bg-surface-subtle' };
    }
  };

  const formatNotificationTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-surface-cream text-on-surface antialiased min-h-screen flex flex-col selection:bg-burgundy-wine selection:text-white">
      {/* 1. Header - Matching Hero Color (#12100f) */}
      <header className="sticky top-0 z-50 bg-[#12100f] text-[#FDF8EB] px-4 py-3 flex items-center justify-between shadow-md border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="Nhà Có Tiệc Logo"
              className="w-8 h-8 rounded-full object-cover shadow-xs border border-white/20 group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="flex items-center gap-1 font-playfair text-[20px] font-bold tracking-[0.01em] text-[#FDF8EB] leading-none">
              <span>Nhà Có Tiệc</span>
              <span className="text-gold-foil font-bold text-base">•</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 relative" ref={notificationRef}>
          {/* Zalo Support Button (Configurable) */}
          <a
            href={zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-3 py-1 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white text-[12px] font-medium transition-colors shadow-xs"
            title="Liên hệ hỗ trợ Zalo"
          >
            <Icon name="chat" className="text-[14px]" />
            <span>Hỗ trợ</span>
          </a>

          {/* Notification Bell 🔔 */}
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 rounded-full text-white hover:bg-white/10 transition-colors flex items-center justify-center"
            aria-label="Thông báo"
            title="Trung tâm thông báo"
          >
            <Icon name="notifications" className="text-[21px]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gold-foil text-deep-espresso font-bold text-[10px] flex items-center justify-center shadow-xs ring-2 ring-burgundy-wine animate-in zoom-in">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-surface-card rounded-2xl shadow-2xl border border-border-delicate text-on-surface z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Panel Header */}
              <div className="p-3.5 bg-surface-subtle border-b border-border-delicate flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="notifications" className="text-[18px] text-burgundy-wine" />
                  <span className="font-serif font-bold text-sm text-deep-espresso">
                    Thông báo ({notifications.length})
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold text-burgundy-wine bg-burgundy-wine/10 px-2 py-0.5 rounded-full">
                      {unreadCount} mới
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllAsRead()}
                    className="text-[11px] text-burgundy-wine font-semibold hover:underline"
                  >
                    Đã đọc tất cả
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-border-delicate/60 flex flex-col">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-text-muted flex flex-col items-center gap-2">
                    <Icon name="notifications_none" className="text-[28px] text-text-muted/50" />
                    <span>Chưa có thông báo nào dành cho bạn.</span>
                  </div>
                ) : (
                  notifications.map((noti) => {
                    const meta = getTypeMeta(noti.type);
                    return (
                      <div
                        key={noti.id}
                        onClick={() => handleNotificationClick(noti.id, noti.actionUrl)}
                        className={`p-3.5 flex items-start gap-3 hover:bg-surface-subtle/80 cursor-pointer transition-colors ${
                          !noti.isRead ? 'bg-burgundy-wine/5' : ''
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${meta.color}`}
                        >
                          <Icon name={meta.icon} className="text-[17px]" />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-xs leading-tight font-serif truncate ${
                                !noti.isRead
                                  ? 'font-bold text-deep-espresso'
                                  : 'font-semibold text-deep-espresso/85'
                              }`}
                            >
                              {noti.title}
                            </span>
                            {!noti.isRead && (
                              <span className="w-2 h-2 rounded-full bg-burgundy-wine shrink-0" />
                            )}
                          </div>

                          <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                            {noti.message}
                          </p>

                          <div className="flex items-center justify-between pt-1 text-[10px] text-text-muted">
                            <span>{formatNotificationTime(noti.createdAt)}</span>
                            {noti.actionUrl && (
                              <span className="text-burgundy-wine font-medium flex items-center gap-0.5">
                                <span>Chi tiết</span>
                                <Icon name="arrow_forward" className="text-[12px]" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          <Link
            to="/"
            className="p-1 text-white hover:text-white/80 transition-colors flex items-center justify-center text-xs ml-1"
            title="Về Trang chủ"
          >
            <Icon name="home" className="text-[20px]" />
          </Link>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/', { replace: true });
            }}
            className="p-1 text-white hover:text-rose-200 transition-colors flex items-center justify-center text-xs ml-0.5"
            title="Đăng xuất khỏi Cổng Khách Hàng"
          >
            <Icon name="logout" className="text-[19px]" />
          </button>
        </div>
      </header>

      {/* 2. Sub-Header: Cổng Khách Hàng Profile Summary (chỉ hiển thị ở dashboard chính) */}
      {!isDetailPage && (
        <div className="bg-gradient-to-r from-burgundy-wine/10 via-surface-cream to-burgundy-wine/5 border-b border-border-delicate/80 px-4 py-3.5 flex items-center justify-between max-w-xl mx-auto w-full">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full border-2 border-gold-foil/80 p-0.5 shadow-sm bg-surface-card flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-burgundy-wine text-white flex items-center justify-center font-serif text-sm font-semibold tracking-wider">
                  M&M
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-gold-foil text-white flex items-center justify-center text-[9px] shadow-sm ring-1 ring-white">
                <Icon name="verified" className="text-[10px]" />
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-headline-sm text-[15px] font-serif font-semibold text-deep-espresso leading-tight truncate">
                  Nguyễn Minh Anh &amp; Trần Đức Minh
                </h2>
                <span className="px-1.5 py-0.2 rounded bg-burgundy-wine text-white font-label-caps text-[8px] tracking-wider uppercase flex-shrink-0 font-bold">
                  VIP
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-0.5">
                <span className="font-medium text-deep-espresso/80">Đơn hàng: #NCT01</span>
                <span>•</span>
                <span className="text-gold-foil font-serif italic text-[11px]">Cưới: 28/12/2026</span>
              </div>
            </div>
          </div>

          <Link
            to="/dashboard/thong-tin-dang-nhap"
            aria-label="Thông tin đăng nhập"
            title="Thông tin đăng nhập"
            className="w-9 h-9 rounded-full bg-surface-card hover:bg-surface-subtle text-deep-espresso border border-border-delicate flex items-center justify-center shadow-sm transition-colors flex-shrink-0 ml-2"
          >
            <Icon name="settings" className="text-[19px] text-burgundy-wine" />
          </Link>
        </div>
      )}

      {/* 3. Main Outlet Container */}
      <main className="flex-1 w-full max-w-xl mx-auto flex flex-col">
        <Outlet />
      </main>

      {/* Bottom Floating Bar / Footer note */}
      <div className="max-w-xl mx-auto w-full py-4 text-center text-xs text-text-muted">
        <span>Cổng Khách Hàng Nhà Có Tiệc • Hotline kỹ thuật 24/7: 0982 123 456</span>
      </div>
    </div>
  );
};
