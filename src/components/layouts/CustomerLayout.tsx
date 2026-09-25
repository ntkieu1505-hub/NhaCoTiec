import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { useZaloSupportUrl } from '../../mocks/cmsStore';
import { useNotifications } from '../../mocks/notificationStore';
import { NotificationType } from '../../types/notification';
import { useAuth } from '../../mocks/authStore';
import { useOrders, getLastCustomerOrderId } from '../../mocks/orderStore';

export const CustomerLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const zaloUrl = useZaloSupportUrl();
  const { user, logout } = useAuth();
  const allOrders = useOrders();
  const lastOrderId = getLastCustomerOrderId();
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

  // Dynamically resolve customer's orders:
  const customerOrders = React.useMemo(() => {
    let list: typeof allOrders = [];
    if (user) {
      list = allOrders.filter(
        (o) =>
          (o.userId && o.userId === user.id) ||
          (user.email && o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase()) ||
          (user.phone && o.customerPhone && o.customerPhone === user.phone)
      );
    }
    if (list.length === 0 && lastOrderId) {
      const last = allOrders.find((o) => o.id === lastOrderId);
      if (last) {
        list = allOrders.filter(
          (o) =>
            o.id === lastOrderId ||
            (last.customerPhone && o.customerPhone === last.customerPhone) ||
            (last.customerEmail && o.customerEmail && o.customerEmail.toLowerCase() === last.customerEmail.toLowerCase())
        );
      }
    }
    return list;
  }, [allOrders, user, lastOrderId]);

  const activeOrder = customerOrders[0];
  const displayName = activeOrder?.customerName || user?.name || (user?.email ? user.email.split('@')[0] : 'Khách hàng');

  const avatarInitials = React.useMemo(() => {
    if (activeOrder?.customerName) {
      const parts = activeOrder.customerName.split('&');
      if (parts.length >= 2) {
        const p1 = parts[0].trim().split(/\s+/).pop()?.[0] || '';
        const p2 = parts[1].trim().split(/\s+/).pop()?.[0] || '';
        return `${p1}&${p2}`.toUpperCase() || 'M&M';
      }
    }
    if (displayName) {
      const words = displayName.trim().split(/\s+/);
      if (words.length >= 2) {
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
      }
      return displayName.slice(0, 2).toUpperCase();
    }
    return 'KH';
  }, [activeOrder, displayName]);

  const weddingDateDisplay = React.useMemo(() => {
    if (!activeOrder?.weddingInfo?.weddingDate) return null;
    try {
      return new Date(activeOrder.weddingInfo.weddingDate).toLocaleDateString('vi-VN');
    } catch {
      return null;
    }
  }, [activeOrder]);

  return (
    <div className="bg-surface-cream text-on-surface antialiased min-h-screen flex flex-col selection:bg-burgundy-wine selection:text-white">
      {/* 1. Header - Burgundy Wine (#6D141A) */}
      <header className="sticky top-0 z-50 bg-[#6D141A] text-[#FDF8EB] px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between shadow-md border-b border-white/15">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group">
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
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shadow-xs border border-white/20 group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="flex items-center font-playfair text-[16px] sm:text-[18px] md:text-[20px] font-bold tracking-[0.01em] text-[#FDF8EB] leading-none">
              <span>Nhà Có Tiệc</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 relative" ref={notificationRef}>
          {/* Zalo Support Button (Configurable) */}
          <a
            href={zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FDF8EB] text-xs font-semibold backdrop-blur-xs border border-white/20 transition-colors shadow-2xs"
            title="Nhắn tin hỗ trợ qua Zalo"
          >
            <Icon name="chat" className="text-[14px] text-amber-200" />
            <span className="text-[11px] sm:text-xs">Hỗ trợ</span>
          </a>

          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Thông báo"
            className="relative p-1 text-white hover:text-white/80 transition-colors flex items-center justify-center text-xs ml-0.5"
            title="Thông báo"
          >
            <Icon name="notifications" className="text-[20px]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold-foil text-deep-espresso text-[9px] font-bold flex items-center justify-center shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface-card rounded-2xl shadow-xl border border-border-delicate overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 text-deep-espresso">
              <div className="px-4 py-3 bg-surface-cream border-b border-border-delicate flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="notifications" className="text-[18px] text-burgundy-wine" />
                  <span className="font-serif font-bold text-sm text-deep-espresso">Thông báo đơn hàng</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-burgundy-wine/10 text-burgundy-wine text-[10px] font-bold">
                      {unreadCount} mới
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[11px] text-burgundy-wine hover:underline font-medium"
                  >
                    Đọc tất cả
                  </button>
                )}
              </div>

              <div className="max-h-[380px] overflow-y-auto divide-y divide-border-delicate/60">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-text-muted text-xs">
                    <Icon name="notifications_off" className="text-2xl mb-1 text-text-muted/60" />
                    <p>Chưa có thông báo nào</p>
                  </div>
                ) : (
                  notifications.map((noti) => {
                    const meta = getTypeMeta(noti.type);
                    return (
                      <div
                        key={noti.id}
                        onClick={() => handleNotificationClick(noti.id, noti.actionUrl)}
                        className={`p-3.5 hover:bg-surface-subtle/80 cursor-pointer transition-colors flex items-start gap-3 ${
                          !noti.isRead ? 'bg-burgundy-wine/[0.03]' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${meta.color}`}>
                          <Icon name={meta.icon} className="text-[16px]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="font-semibold text-xs text-deep-espresso line-clamp-1">
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
              <div className="w-12 h-12 rounded-full border-2 border-gold-foil/80 p-0.5 shadow-sm bg-surface-card flex items-center justify-center overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={displayName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-burgundy-wine text-white flex items-center justify-center font-serif text-sm font-semibold tracking-wider">
                    {avatarInitials}
                  </div>
                )}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] shadow-sm ring-1 ring-white ${
                activeOrder ? 'bg-gold-foil' : 'bg-emerald-600'
              }`}>
                <Icon name={activeOrder ? 'verified' : 'person'} className="text-[10px]" />
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-headline-sm text-[15px] font-serif font-semibold text-deep-espresso leading-tight truncate">
                  {displayName}
                </h2>
                <span className={`px-1.5 py-0.2 rounded font-label-caps text-[8px] tracking-wider uppercase flex-shrink-0 font-bold ${
                  activeOrder ? 'bg-burgundy-wine text-white' : 'bg-surface-subtle text-text-muted border border-border-delicate'
                }`}>
                  {activeOrder ? (activeOrder.category === 'premium' ? 'VIP' : 'TIÊU CHUẨN') : 'THÀNH VIÊN'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-0.5 truncate">
                {activeOrder ? (
                  <>
                    <span className="font-medium text-deep-espresso/80">Đơn hàng: #{activeOrder.id}</span>
                    {weddingDateDisplay && (
                      <>
                        <span>•</span>
                        <span className="text-gold-foil font-serif italic text-[11px]">
                          Cưới: {weddingDateDisplay}
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-text-muted truncate">{user?.email || 'Tài khoản khách'}</span>
                    <span>•</span>
                    <span className="text-amber-700 font-medium whitespace-nowrap">Chưa có đơn hàng</span>
                  </>
                )}
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
