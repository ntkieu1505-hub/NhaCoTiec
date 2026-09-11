import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { useAuth } from '../../mocks/authStore';
import { useOrders } from '../../mocks/orderStore';
import { getAllTemplates } from '../../mocks/templateStore';
import { MOCK_USERS } from '../../mocks/index';
import { ORDER_STAGES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

export const AdminLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { number: '01', name: 'Tổng quan', path: '/admin/tong-quan', icon: 'dashboard' },
    { number: '02', name: 'Đơn hàng', path: '/admin/don-hang', icon: 'shopping_bag', badge: '3 Mới' },
    { number: '03', name: 'Thiệp', path: '/admin/thiep', icon: 'mail' },
    { number: '04', name: 'Mẫu thiệp', path: '/admin/mau-thiep', icon: 'style' },
    { number: '05', name: 'Người dùng', path: '/admin/nguoi-dung', icon: 'group' },
    { number: '06', name: 'File Excel (Dữ liệu tiệc)', path: '/admin/khach-moi-loi-chuc', icon: 'table_view' },
    { number: '07', name: 'Thông báo', path: '/admin/thong-bao', icon: 'notifications' },
    { number: '08', name: 'Phân tích', path: '/admin/phan-tich', icon: 'analytics' },
    { number: '09', name: 'Quản lý nội dung', path: '/admin/quan-ly-noi-dung', icon: 'article' },
    { number: '10', name: 'Cài đặt', path: '/admin/cai-dat', icon: 'settings' },
    { number: '11', name: 'Cài đặt thanh toán', path: '/admin/cai-dat-thanh-toan', icon: 'qr_code_2' },
  ];

  const getCurrentTitle = () => {
    const current = navItems.find((item) => location.pathname.startsWith(item.path));
    return current ? `${current.number}. ${current.name}` : 'Bảng điều hành Nhà Có Tiệc';
  };

  const orders = useOrders();
  const templates = getAllTemplates();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute search matches across orders, templates, users, and admin pages
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchedOrders = orders.filter((o) => {
      const matchId = o.id.toLowerCase().includes(q);
      const matchName = (o.customerName || '').toLowerCase().includes(q);
      const matchPhone = (o.customerPhone || '').toLowerCase().includes(q);
      const matchEmail = (o.customerEmail || '').toLowerCase().includes(q);
      const matchTpl = (o.templateName || '').toLowerCase().includes(q);
      return matchId || matchName || matchPhone || matchEmail || matchTpl;
    }).slice(0, 5);

    const matchedTemplates = templates.filter((t) => {
      return (
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        (t.style || '').toLowerCase().includes(q)
      );
    }).slice(0, 4);

    const matchedUsers = MOCK_USERS.filter((u) => {
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }).slice(0, 3);

    const matchedPages = navItems.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        item.number.includes(q)
      );
    });

    const totalCount =
      matchedOrders.length +
      matchedTemplates.length +
      matchedUsers.length +
      matchedPages.length;

    return {
      matchedOrders,
      matchedTemplates,
      matchedUsers,
      matchedPages,
      totalCount,
    };
  }, [searchQuery, orders, templates]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const q = searchQuery.trim();
      if (!q) return;

      if (searchResults && searchResults.matchedOrders.length > 0) {
        const exact = searchResults.matchedOrders.find((o) => o.id.toLowerCase() === q.toLowerCase());
        if (exact) {
          navigate(`/admin/don-hang/${exact.id}`);
          setIsSearchFocused(false);
          setMobileSearchOpen(false);
          return;
        }
      }

      navigate(`/admin/don-hang?search=${encodeURIComponent(q)}`);
      setIsSearchFocused(false);
      setMobileSearchOpen(false);
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
      setMobileSearchOpen(false);
    }
  };

  return (
    <div className="bg-surface font-sans text-on-surface antialiased min-h-screen flex">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-deep-espresso/50 backdrop-blur-xs z-50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* 1. Left Sidebar: Fixed w-72 (Desktop) & Slide-over (Mobile) */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex flex-col justify-between py-6 px-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform duration-300 overflow-y-auto ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-5">
          {/* Brand Header */}
          <div className="px-3 pt-1 flex flex-col gap-1 border-b border-border-delicate/80 pb-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold text-deep-espresso tracking-tight">
                  Nhà Có Tiệc
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-burgundy-wine"></span>
              </Link>
              <span className="px-2 py-0.5 rounded bg-surface-subtle text-on-surface-variant font-label-caps text-[10px] uppercase font-bold">
                Admin Hub
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-text-muted italic">Tớ Có Thiệp · nhacotiec.vn</span>
              <span className="w-2 h-2 rounded-full bg-gold-foil"></span>
            </div>
          </div>

          {/* Nav Section Label */}
          <div className="px-3">
            <span className="font-label-caps text-[10px] text-text-muted uppercase tracking-widest font-semibold">
              Menu điều hành
            </span>
          </div>

          {/* 10 Navigation Links */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl font-label-md text-sm transition-all ${
                    isActive
                      ? 'bg-burgundy-wine text-white font-semibold shadow-md'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon name={item.icon} className="text-[19px]" />
                  <span>{item.number}. {item.name}</span>
                </div>
                {item.badge && (
                  <span className="font-label-caps text-[10px] uppercase px-2 py-0.5 rounded-full bg-secondary text-white font-medium">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="flex flex-col gap-2 pt-6 border-t border-border-delicate">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <Icon name="open_in_new" className="text-[16px]" />
            <span>Xem trang khách (Public)</span>
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/', { replace: true });
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-700 hover:bg-rose-50 transition-colors w-full text-left font-medium"
          >
            <Icon name="logout" className="text-[16px]" />
            <span>Đăng xuất Admin</span>
          </button>
          <div className="px-3 pt-1">
            <p className="font-label-caps text-[10px] text-text-muted tracking-wider uppercase">
              © 2026 Nhà Có Tiệc
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">Hệ thống vận hành thiệp cưới</p>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area with Header */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Sticky Topbar */}
        <header className="sticky top-0 h-16 bg-surface/90 backdrop-blur-md shadow-xs z-40 flex items-center justify-between px-4 sm:px-8 border-b border-border-delicate">
          <div className="flex items-center gap-3 text-on-surface-variant">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg text-deep-espresso hover:bg-surface-container-high"
              aria-label="Toggle Menu"
            >
              <Icon name="menu" className="text-[22px]" />
            </button>
            <span className="hidden sm:inline font-label-md text-xs text-text-muted">Quản trị</span>
            <Icon name="chevron_right" className="hidden sm:inline text-[16px] text-text-muted" />
            <span className="font-label-md text-sm text-deep-espresso font-semibold">
              {getCurrentTitle()}
            </span>
          </div>

          {/* Topbar Right */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Desktop Search Input with Quick Jump Dropdown */}
            <div ref={searchContainerRef} className="relative items-center hidden md:flex">
              <Icon name="search" className="absolute left-3 text-text-muted text-[18px] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Tìm kiếm đơn (NCT01), khách, thiệp..."
                className="w-60 lg:w-72 pl-9 pr-8 py-1.5 rounded-full bg-surface-subtle text-on-surface text-xs placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-burgundy-wine/30 border border-border-delicate transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 p-0.5 text-text-muted hover:text-deep-espresso rounded-full"
                  title="Xóa tìm kiếm"
                >
                  <Icon name="close" className="text-[14px]" />
                </button>
              )}

              {/* Instant Search Results Dropdown */}
              {isSearchFocused && searchQuery.trim() && searchResults && (
                <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 md:w-[450px] bg-surface-card rounded-2xl shadow-2xl border border-border-delicate overflow-hidden z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2.5 bg-surface-subtle/80 border-b border-border-delicate flex items-center justify-between text-xs">
                    <span className="font-semibold text-deep-espresso">
                      Kết quả tìm kiếm cho "{searchQuery}"
                    </span>
                    <span className="text-[11px] text-text-muted font-medium">
                      {searchResults.totalCount} kết quả
                    </span>
                  </div>

                  <div className="max-h-[380px] overflow-y-auto divide-y divide-border-delicate/60 text-xs">
                    {searchResults.totalCount === 0 ? (
                      <div className="p-6 text-center text-text-muted flex flex-col items-center gap-2">
                        <Icon name="search_off" className="text-3xl text-text-muted/60" />
                        <span>Không tìm thấy dữ liệu nào phù hợp</span>
                        <Link
                          to={`/admin/don-hang?search=${encodeURIComponent(searchQuery)}`}
                          onClick={() => setIsSearchFocused(false)}
                          className="mt-1 text-xs text-burgundy-wine font-semibold hover:underline"
                        >
                          Tìm trong trang Quản lý đơn hàng &rarr;
                        </Link>
                      </div>
                    ) : (
                      <>
                        {/* 1. Orders Section */}
                        {searchResults.matchedOrders.length > 0 && (
                          <div className="p-2 flex flex-col gap-1">
                            <span className="px-2 pt-1 font-label-caps text-[10px] text-text-muted uppercase font-bold tracking-wider">
                              Đơn hàng ({searchResults.matchedOrders.length})
                            </span>
                            {searchResults.matchedOrders.map((ord) => (
                              <button
                                key={ord.id}
                                type="button"
                                onClick={() => {
                                  navigate(`/admin/don-hang/${ord.id}`);
                                  setIsSearchFocused(false);
                                }}
                                className="w-full text-left p-2 rounded-xl hover:bg-surface-subtle flex items-center justify-between gap-2 transition-colors group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-burgundy-wine/10 text-burgundy-wine flex items-center justify-center font-mono font-bold text-xs shrink-0 group-hover:bg-burgundy-wine group-hover:text-white transition-colors">
                                    #{ord.id}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-semibold text-deep-espresso truncate text-xs">
                                      {ord.customerName}
                                    </span>
                                    <span className="text-[11px] text-text-muted truncate">
                                      {ord.templateName} • {ord.customerPhone}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-50 text-burgundy-wine border border-rose-200">
                                    {ORDER_STAGES[ord.currentStage]?.name || 'Tiến trình'}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* 2. Templates Section */}
                        {searchResults.matchedTemplates.length > 0 && (
                          <div className="p-2 flex flex-col gap-1">
                            <span className="px-2 pt-1 font-label-caps text-[10px] text-text-muted uppercase font-bold tracking-wider">
                              Mẫu thiệp cưới ({searchResults.matchedTemplates.length})
                            </span>
                            {searchResults.matchedTemplates.map((tpl) => (
                              <button
                                key={tpl.id}
                                type="button"
                                onClick={() => {
                                  navigate(`/admin/mau-thiep?search=${encodeURIComponent(tpl.name)}`);
                                  setIsSearchFocused(false);
                                }}
                                className="w-full text-left p-2 rounded-xl hover:bg-surface-subtle flex items-center justify-between gap-2 transition-colors group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-gold-foil/15 text-gold-foil flex items-center justify-center text-xs shrink-0">
                                    <Icon name="style" className="text-[15px]" />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-semibold text-deep-espresso truncate text-xs">
                                      {tpl.name}
                                    </span>
                                    <span className="text-[11px] text-text-muted truncate">
                                      {tpl.style || 'Phong cách thanh lịch'}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-xs font-serif font-bold text-burgundy-wine shrink-0">
                                  {formatCurrency(tpl.price)}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* 3. Users Section */}
                        {searchResults.matchedUsers.length > 0 && (
                          <div className="p-2 flex flex-col gap-1">
                            <span className="px-2 pt-1 font-label-caps text-[10px] text-text-muted uppercase font-bold tracking-wider">
                              Người dùng &amp; Khách ({searchResults.matchedUsers.length})
                            </span>
                            {searchResults.matchedUsers.map((usr) => (
                              <button
                                key={usr.id}
                                type="button"
                                onClick={() => {
                                  navigate(`/admin/nguoi-dung?search=${encodeURIComponent(usr.fullName)}`);
                                  setIsSearchFocused(false);
                                }}
                                className="w-full text-left p-2 rounded-xl hover:bg-surface-subtle flex items-center justify-between gap-2 transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-surface-cream border border-border-delicate flex items-center justify-center text-xs shrink-0">
                                    <Icon name="person" className="text-[15px] text-text-muted" />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-semibold text-deep-espresso truncate text-xs">
                                      {usr.fullName}
                                    </span>
                                    <span className="text-[11px] text-text-muted truncate">
                                      {usr.phone} • {usr.email}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-subtle text-text-muted border border-border-delicate shrink-0">
                                  {usr.orderCount} đơn
                                </span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* 4. Pages Section */}
                        {searchResults.matchedPages.length > 0 && (
                          <div className="p-2 flex flex-col gap-1">
                            <span className="px-2 pt-1 font-label-caps text-[10px] text-text-muted uppercase font-bold tracking-wider">
                              Trang điều hướng ({searchResults.matchedPages.length})
                            </span>
                            {searchResults.matchedPages.map((pg) => (
                              <button
                                key={pg.path}
                                type="button"
                                onClick={() => {
                                  navigate(pg.path);
                                  setIsSearchFocused(false);
                                }}
                                className="w-full text-left p-2 rounded-xl hover:bg-surface-subtle flex items-center gap-2.5 transition-colors"
                              >
                                <Icon name={pg.icon} className="text-[16px] text-burgundy-wine shrink-0" />
                                <span className="font-medium text-deep-espresso text-xs">
                                  {pg.number}. {pg.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-2 bg-surface-subtle border-t border-border-delicate flex items-center justify-between text-[11px]">
                    <span className="text-text-muted">
                      Nhấn <strong>Enter</strong> để mở kết quả
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/admin/don-hang?search=${encodeURIComponent(searchQuery.trim())}`);
                        setIsSearchFocused(false);
                      }}
                      className="text-burgundy-wine font-semibold hover:underline"
                    >
                      Mở trong Quản lý đơn hàng &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Search Button Toggle */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
              title="Tìm kiếm"
            >
              <Icon name="search" className="text-[20px]" />
            </button>

            <button
              className="relative p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
              title="Thông báo SLA"
            >
              <Icon name="notifications" className="text-[20px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-burgundy-wine"></span>
            </button>

            <div className="flex items-center gap-2.5 pl-2 border-l border-border-delicate">
              <div className="hidden sm:flex flex-col items-end">
                <span className="font-label-md text-xs text-deep-espresso font-semibold leading-tight">
                  {user?.name || 'Admin Tuyết Nga'}
                </span>
                <span className="text-[11px] text-text-muted leading-tight">Quản trị vận hành</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-burgundy-wine text-white flex items-center justify-center font-serif text-xs font-bold shadow-xs">
                TN
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/', { replace: true });
                }}
                className="p-1.5 text-text-muted hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                title="Đăng xuất Admin"
              >
                <Icon name="logout" className="text-[18px]" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Search Input Bar */}
        {mobileSearchOpen && (
          <div className="md:hidden p-3 bg-surface border-b border-border-delicate flex items-center gap-2 animate-in slide-in-from-top-2 duration-150">
            <div className="relative flex-1">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[17px]" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Tìm mã đơn (NCT01), khách, thiệp..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-surface-subtle text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-burgundy-wine border border-border-delicate"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-deep-espresso"
                >
                  <Icon name="close" className="text-[14px]" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                if (searchQuery.trim()) {
                  navigate(`/admin/don-hang?search=${encodeURIComponent(searchQuery.trim())}`);
                }
                setMobileSearchOpen(false);
              }}
              className="px-3.5 py-2 rounded-xl bg-burgundy-wine text-white text-xs font-semibold shrink-0"
            >
              Tìm
            </button>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1160px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
