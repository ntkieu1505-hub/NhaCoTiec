import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { useAuth } from '../../mocks/authStore';
import { useOrders } from '../../mocks/orderStore';
import { getAllTemplates } from '../../mocks/templateStore';
import { ORDER_STAGES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import { matchOrder, matchQuery } from '../../utils/searchHelper';

export interface AdminOutletContext {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export interface DeviceConfig {
  id: string;
  name: string;
  shortLabel: string;
  width: number;
  height: number;
  category: 'Apple' | 'Android';
  notchType: 'dynamic-island' | 'punch-hole' | 'classic-notch';
  borderRadius: number;
  bezelWidth: number;
}

export const REAL_DEVICES: Record<string, DeviceConfig> = {
  'iphone-15': {
    id: 'iphone-15',
    name: 'iPhone 15 / 16 Pro',
    shortLabel: 'iPhone 15 Pro (393px)',
    width: 393,
    height: 852,
    category: 'Apple',
    notchType: 'dynamic-island',
    borderRadius: 50,
    bezelWidth: 10,
  },
  'iphone-promax': {
    id: 'iphone-promax',
    name: 'iPhone 15 / 16 Pro Max',
    shortLabel: 'iPhone Pro Max (430px)',
    width: 430,
    height: 932,
    category: 'Apple',
    notchType: 'dynamic-island',
    borderRadius: 54,
    bezelWidth: 10,
  },
  'iphone-se': {
    id: 'iphone-se',
    name: 'iPhone SE / Mini',
    shortLabel: 'iPhone SE (375px)',
    width: 375,
    height: 667,
    category: 'Apple',
    notchType: 'classic-notch',
    borderRadius: 38,
    bezelWidth: 8,
  },
  'galaxy-s24': {
    id: 'galaxy-s24',
    name: 'Samsung Galaxy S24',
    shortLabel: 'Galaxy S24 (412px)',
    width: 412,
    height: 915,
    category: 'Android',
    notchType: 'punch-hole',
    borderRadius: 42,
    bezelWidth: 8,
  },
};

export interface PreviewPageItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  group: 'customer' | 'admin';
  description: string;
}

export const PREVIEW_PAGES: PreviewPageItem[] = [
  {
    id: 'home',
    label: 'Trang chủ',
    path: '/',
    icon: 'home',
    group: 'customer',
    description: 'Trang chủ đón khách, giới thiệu & quy trình',
  },
  {
    id: 'templates',
    label: 'Kho mẫu thiệp',
    path: '/mau-thiep',
    icon: 'collections',
    group: 'customer',
    description: 'Bộ sưu tập mẫu thiệp cưới trực quan',
  },
  {
    id: 'template-detail',
    label: 'Chi tiết & Đặt thiệp',
    path: '/mau-thiep/minh-anh-tuan-kiet',
    icon: 'auto_awesome',
    group: 'customer',
    description: 'Trang demo & form đặt thiệp mẫu',
  },
  {
    id: 'customer-dashboard',
    label: 'Cổng khách hàng',
    path: '/dashboard',
    icon: 'person',
    group: 'customer',
    description: 'Bảng quản lý đơn của cô dâu chú rể',
  },
  {
    id: 'admin-overview',
    label: 'Tổng quan Admin',
    path: '/admin/tong-quan',
    icon: 'dashboard',
    group: 'admin',
    description: 'Bảng điều hành thời gian thực',
  },
  {
    id: 'admin-orders',
    label: 'Đơn hàng Admin',
    path: '/admin/don-hang',
    icon: 'receipt_long',
    group: 'admin',
    description: 'Quản lý duyệt đơn trên mobile',
  },
];

export const AdminLayout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const orders = useOrders();
  const templates = getAllTemplates();

  const pendingCount = orders.filter((o) => o.paymentStatus === 'pending_confirmation').length;

  // View Mode: 'desktop' (full screen) vs 'mobile' (phone viewport simulator)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>(() => {
    try {
      if (searchParams.get('view') === 'mobile') return 'mobile';
      if (searchParams.get('view') === 'desktop') return 'desktop';
      const saved = localStorage.getItem('nha_co_tiec_admin_view_mode');
      return saved === 'mobile' ? 'mobile' : 'desktop';
    } catch {
      return 'desktop';
    }
  });

  // Simulator Device & Navigation State
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(() => {
    try {
      return localStorage.getItem('nha_co_tiec_admin_sim_device') || 'iphone-15';
    } catch {
      return 'iphone-15';
    }
  });

  const [previewPath, setPreviewPath] = useState<string>(() => {
    try {
      const qPreview = searchParams.get('preview');
      if (qPreview) return qPreview;
      return localStorage.getItem('nha_co_tiec_admin_sim_path') || '/';
    } catch {
      return '/';
    }
  });

  const [inputUrl, setInputUrl] = useState<string>(previewPath);

  useEffect(() => {
    const qView = searchParams.get('view');
    if (qView === 'mobile' || qView === 'desktop') {
      setViewMode(qView);
    }
    const qPreview = searchParams.get('preview');
    if (qPreview) {
      setPreviewPath(qPreview);
      setInputUrl(qPreview);
    }
  }, [searchParams]);
  const [scaleMode, setScaleMode] = useState<'fit' | '100' | '90' | '85'>(() => {
    try {
      const saved = localStorage.getItem('nha_co_tiec_admin_sim_scale');
      if (saved === '100' || saved === '90' || saved === '85' || saved === 'fit') return saved;
      return 'fit';
    } catch {
      return 'fit';
    }
  });

  const [iframeKey, setIframeKey] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [windowHeight, setWindowHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 900
  );

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeDevice = REAL_DEVICES[selectedDeviceId] || REAL_DEVICES['iphone-15'];

  const effectiveScale = useMemo(() => {
    if (scaleMode === '100') return 1;
    if (scaleMode === '90') return 0.9;
    if (scaleMode === '85') return 0.85;
    // 'fit' calculation
    const availableHeight = Math.max(450, windowHeight - 210);
    const calculated = availableHeight / activeDevice.height;
    return Math.min(1, Math.max(0.55, Number(calculated.toFixed(2))));
  }, [scaleMode, windowHeight, activeDevice.height]);

  const handleToggleViewMode = (mode: 'desktop' | 'mobile') => {
    setViewMode(mode);
    try {
      localStorage.setItem('nha_co_tiec_admin_view_mode', mode);
    } catch {}
  };

  const handleSelectDevice = (devId: string) => {
    setSelectedDeviceId(devId);
    try {
      localStorage.setItem('nha_co_tiec_admin_sim_device', devId);
    } catch {}
  };

  const handleSelectScale = (scale: 'fit' | '100' | '90' | '85') => {
    setScaleMode(scale);
    try {
      localStorage.setItem('nha_co_tiec_admin_sim_scale', scale);
    } catch {}
  };

  const handleNavigatePath = (newPath: string) => {
    setPreviewPath(newPath);
    setInputUrl(newPath);
    try {
      localStorage.setItem('nha_co_tiec_admin_sim_path', newPath);
    } catch {}
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let target = inputUrl.trim();
    if (!target) target = '/';
    if (!target.startsWith('/')) target = '/' + target;
    handleNavigatePath(target);
  };

  const handleIframeLoad = () => {
    try {
      const loc = iframeRef.current?.contentWindow?.location;
      if (loc && loc.pathname) {
        setInputUrl(loc.pathname + (loc.search || ''));
      }
    } catch {
      // Ignore cross-origin error if any
    }
  };

  const handleReloadIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleGoBack = () => {
    try {
      iframeRef.current?.contentWindow?.history.back();
    } catch {}
  };

  const handleGoForward = () => {
    try {
      iframeRef.current?.contentWindow?.history.forward();
    } catch {}
  };

  const handleOpenExternal = () => {
    window.open(previewPath, '_blank');
  };

  const navItems = [
    { number: '01', name: 'Tổng quan', path: '/admin/tong-quan', icon: 'dashboard' },
    {
      number: '02',
      name: 'Đơn hàng',
      path: '/admin/don-hang',
      icon: 'shopping_bag',
      badge: pendingCount > 0 ? `${pendingCount} Chờ duyệt` : undefined,
    },
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

  // When switching pages via sidebar, reset search query
  useEffect(() => {
    setSearchQuery('');
    setIsSearchFocused(false);
  }, [location.pathname]);

  // Compute search matches across orders, templates, users, and admin pages
  const searchResults = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return null;

    const matchedOrders = orders.filter((o) => matchOrder(o, q)).slice(0, 6);

    const matchedTemplates = templates.filter((t) => {
      return (
        matchQuery(t.name, q) ||
        matchQuery(t.slug, q) ||
        matchQuery(t.style, q) ||
        matchQuery(t.description, q)
      );
    }).slice(0, 4);

    const realUsers: { id: string; fullName: string; phone: string; email: string; role: string; orderCount: number }[] = [
      {
        id: user?.id || 'admin-01',
        fullName: user?.name || 'Admin Tuyết Nga',
        phone: user?.phone || '0901 000 999',
        email: user?.email || 'admin@nhacotiec.vn',
        role: 'admin',
        orderCount: 0,
      },
    ];
    orders.forEach((o) => {
      if (o.customerName && !realUsers.some((u) => u.fullName === o.customerName)) {
        const orderCount = orders.filter((x) => x.customerName === o.customerName).length;
        realUsers.push({
          id: `usr-${o.id}`,
          fullName: o.customerName,
          phone: o.customerPhone || '',
          email: o.customerEmail || '',
          role: 'customer',
          orderCount,
        });
      }
    });

    const matchedUsers = realUsers.filter((u) => {
      return (
        matchQuery(u.fullName, q) ||
        matchQuery(u.phone, q) ||
        matchQuery(u.email, q) ||
        matchQuery(u.role === 'admin' ? 'Quản trị viên Admin' : 'Khách hàng', q)
      );
    }).slice(0, 3);

    const matchedPages = navItems.filter((item) => {
      return (
        matchQuery(item.name, q) ||
        matchQuery(item.number, q)
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
      // On Enter, close dropdown so user can immediately view and interact with filtered items on current page
      setIsSearchFocused(false);
      setMobileSearchOpen(false);
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
      setMobileSearchOpen(false);
    }
  };

  // Helper: Sidebar Content
  const renderSidebarContent = (isMobileMode = false) => (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col gap-4 sm:gap-5">
        {/* Brand Header */}
        <div className="px-3 pt-1 flex flex-col gap-1 border-b border-border-delicate/80 pb-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Nhà Có Tiệc Logo"
                className="w-8 sm:w-9 h-8 sm:h-9 rounded-full object-cover shadow-xs border border-border-delicate shrink-0"
              />
              <span className="font-playfair text-lg sm:text-xl font-bold text-deep-espresso tracking-tight">
                Nhà Có Tiệc
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-burgundy-wine"></span>
            </Link>
            {isMobileMode ? (
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-text-muted hover:text-deep-espresso rounded-lg"
                title="Đóng menu"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            ) : (
              <span className="px-2 py-0.5 rounded bg-surface-subtle text-on-surface-variant font-label-caps text-[10px] uppercase font-bold">
                Admin Hub
              </span>
            )}
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

        {/* 11 Navigation Links */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 sm:py-2.5 rounded-xl font-label-md text-xs sm:text-sm transition-all ${
                  isActive
                    ? 'bg-burgundy-wine text-white font-semibold shadow-md'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`
              }
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Icon name={item.icon} className="text-[18px] sm:text-[19px]" />
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
      <div className="flex flex-col gap-2 pt-4 border-t border-border-delicate mt-4">
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
        <div className="px-3 pt-0.5">
          <p className="font-label-caps text-[10px] text-text-muted tracking-wider uppercase">
            © 2026 Nhà Có Tiệc
          </p>
          <p className="text-[11px] text-text-muted mt-0.5">Hệ thống vận hành thiệp cưới</p>
        </div>
      </div>
    </div>
  );

  // Helper: Topbar Header
  const renderHeader = (isMobileLayout = false) => (
    <header className="sticky top-0 h-16 bg-surface/90 backdrop-blur-md shadow-xs z-40 flex items-center justify-between px-3 sm:px-6 lg:px-8 border-b border-border-delicate shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 text-on-surface-variant min-w-0">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className={`${isMobileLayout ? 'block' : 'lg:hidden'} p-1.5 rounded-lg text-deep-espresso hover:bg-surface-container-high`}
          aria-label="Toggle Menu"
        >
          <Icon name="menu" className="text-[22px]" />
        </button>
        <Link to="/" className={`${isMobileLayout ? 'flex' : 'lg:hidden flex'} items-center gap-1.5 mr-1 shrink-0`}>
          <img
            src="/logo.png"
            alt="Nhà Có Tiệc Logo"
            className="w-7 h-7 rounded-full object-cover shadow-xs border border-border-delicate shrink-0"
          />
          <span className="font-playfair font-bold text-sm text-deep-espresso tracking-tight hidden min-[380px]:inline">
            Nhà Có Tiệc
          </span>
        </Link>
        {!isMobileLayout && (
          <>
            <span className="hidden sm:inline font-label-md text-xs text-text-muted">Quản trị</span>
            <Icon name="chevron_right" className="hidden sm:inline text-[16px] text-text-muted" />
          </>
        )}
        <span className="font-label-md text-xs sm:text-sm text-deep-espresso font-semibold truncate max-w-[100px] min-[360px]:max-w-[130px] sm:max-w-none">
          {getCurrentTitle()}
        </span>
      </div>

      {/* Topbar Right */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
        {/* Desktop Search Input with Quick Jump Dropdown */}
        {!isMobileLayout && (
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
              className="w-48 lg:w-72 pl-9 pr-8 py-1.5 rounded-full bg-surface-subtle text-on-surface text-xs placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-burgundy-wine/30 border border-border-delicate transition-all"
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
                <div className="px-4 py-2.5 bg-surface-subtle/90 border-b border-border-delicate flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-deep-espresso">
                    <span>Kết quả cho "{searchQuery}"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-text-muted font-medium">
                      {searchResults.totalCount} kết quả
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSearchFocused(false)}
                      className="p-1 text-text-muted hover:text-deep-espresso rounded-md"
                      title="Đóng (Esc)"
                    >
                      <Icon name="close" className="text-[14px]" />
                    </button>
                  </div>
                </div>

                <div className="max-h-[360px] overflow-y-auto divide-y divide-border-delicate/60 text-xs">
                  {searchResults.totalCount === 0 ? (
                    <div className="p-6 text-center text-text-muted flex flex-col items-center gap-2">
                      <Icon name="search_off" className="text-3xl text-text-muted/60" />
                      <span className="font-semibold text-deep-espresso">Không tìm thấy dữ liệu</span>
                    </div>
                  ) : (
                    <>
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
                              className="w-full text-left p-2 rounded-xl hover:bg-surface-subtle flex items-center justify-between gap-2 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-burgundy-wine/10 text-burgundy-wine flex items-center justify-center font-mono font-bold text-xs shrink-0">
                                  #{ord.id}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-semibold text-deep-espresso truncate text-xs">
                                    {ord.customerName}
                                  </span>
                                  <span className="text-[11px] text-text-muted truncate">
                                    {ord.templateName}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-50 text-burgundy-wine border border-rose-200 shrink-0">
                                {ORDER_STAGES[ord.currentStage]?.name || 'Tiến trình'}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.matchedTemplates.length > 0 && (
                        <div className="p-2 flex flex-col gap-1">
                          <span className="px-2 pt-1 font-label-caps text-[10px] text-text-muted uppercase font-bold tracking-wider">
                            Mẫu thiệp ({searchResults.matchedTemplates.length})
                          </span>
                          {searchResults.matchedTemplates.map((tpl) => (
                            <button
                              key={tpl.id}
                              type="button"
                              onClick={() => {
                                navigate('/admin/mau-thiep');
                                setIsSearchFocused(false);
                              }}
                              className="w-full text-left p-2 rounded-xl hover:bg-surface-subtle flex items-center gap-2.5 transition-colors"
                            >
                              <img
                                src={tpl.thumbnailUrl}
                                alt={tpl.name}
                                className="w-7 h-9 rounded object-cover border border-border-delicate shrink-0"
                              />
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="font-semibold text-deep-espresso truncate text-xs">{tpl.name}</span>
                                <span className="text-[11px] text-burgundy-wine font-serif font-bold">
                                  {formatCurrency(tpl.price)}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* View Mode Switcher Toggle: Desktop ↔ Mobile */}
        <div className="flex items-center p-0.5 rounded-full bg-surface-subtle border border-border-delicate shadow-2xs">
          <button
            type="button"
            onClick={() => handleToggleViewMode('desktop')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'desktop'
                ? 'bg-burgundy-wine text-white shadow-xs'
                : 'text-text-muted hover:text-deep-espresso'
            }`}
            title="Chuyển sang giao diện Desktop (Toàn màn hình)"
          >
            <Icon name="desktop_windows" className="text-[14px]" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleViewMode('mobile')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'mobile'
                ? 'bg-burgundy-wine text-white shadow-xs'
                : 'text-text-muted hover:text-deep-espresso'
            }`}
            title="Chuyển sang mô phỏng giao diện Điện thoại"
          >
            <Icon name="smartphone" className="text-[14px]" />
            <span className="hidden sm:inline">Điện thoại</span>
          </button>
        </div>

        {/* Mobile Search Button Toggle */}
        <button
          type="button"
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className={`${!isMobileLayout ? 'md:hidden' : 'block'} p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors`}
          title="Tìm kiếm"
        >
          <Icon name="search" className="text-[19px]" />
        </button>

        {/* SLA Notifications button */}
        <button
          className="relative p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
          title="Thông báo SLA"
        >
          <Icon name="notifications" className="text-[19px]" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-burgundy-wine"></span>
        </button>

        {/* User Info & Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 border-l border-border-delicate">
          <div className="hidden lg:flex flex-col items-end">
            <span className="font-label-md text-xs text-deep-espresso font-semibold leading-tight">
              {user?.name || 'Admin Tuyết Nga'}
            </span>
            <span className="text-[11px] text-text-muted leading-tight">Quản trị vận hành</span>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-burgundy-wine text-white flex items-center justify-center font-serif text-xs font-bold shadow-xs shrink-0">
            TN
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/', { replace: true });
            }}
            className="p-1 sm:p-1.5 text-text-muted hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
            title="Đăng xuất Admin"
          >
            <Icon name="logout" className="text-[17px]" />
          </button>
        </div>
      </div>
    </header>
  );

  // Helper: Mobile Search Bar
  const renderMobileSearchBar = () =>
    mobileSearchOpen && (
      <div className="p-3 bg-surface border-b border-border-delicate flex items-center gap-2 animate-in slide-in-from-top-2 duration-150">
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
            setMobileSearchOpen(false);
          }}
          className="px-3.5 py-2 rounded-xl bg-burgundy-wine text-white text-xs font-semibold shrink-0"
        >
          Lọc
        </button>
      </div>
    );

  // VIEW 1: MOBILE VIEWPORT SIMULATOR MODE
  if (viewMode === 'mobile') {
    return (
      <div className="min-h-screen bg-[#141211] text-white flex flex-col items-center py-3 px-2 sm:px-4 selection:bg-burgundy-wine selection:text-white font-sans">
        {/* Simulator Master Control Header */}
        <div className="w-full max-w-5xl mb-3 flex flex-col gap-2.5">
          {/* Row 1: Brand & Device presets & Scale & Switch Back */}
          <div className="px-4 py-2.5 rounded-2xl bg-[#221e1d] border border-white/10 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Title & Live Status */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-white tracking-tight">Mô phỏng Điện thoại Chuẩn Thực Tế</span>
              <span className="text-white/40 hidden sm:inline">·</span>
              <span className="text-white/70 hidden sm:inline">
                {activeDevice.name} ({activeDevice.width} × {activeDevice.height}px)
              </span>
            </div>

            {/* Controls: Devices + Zoom + Back to Desktop */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Device Selector */}
              <div className="flex items-center p-0.5 rounded-xl bg-black/40 border border-white/10 text-[11px]">
                {Object.values(REAL_DEVICES).map((dev) => (
                  <button
                    key={dev.id}
                    type="button"
                    onClick={() => handleSelectDevice(dev.id)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      selectedDeviceId === dev.id
                        ? 'bg-burgundy-wine text-white font-bold shadow-xs'
                        : 'text-white/60 hover:text-white'
                    }`}
                    title={`${dev.name} (${dev.width}×${dev.height}px)`}
                  >
                    {dev.shortLabel}
                  </button>
                ))}
              </div>

              {/* Scale / Zoom Control */}
              <div className="hidden md:flex items-center p-0.5 rounded-xl bg-black/40 border border-white/10 text-[11px]">
                {(['fit', '100', '90', '85'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSelectScale(s)}
                    className={`px-2 py-1 rounded-lg font-medium transition-all ${
                      scaleMode === s
                        ? 'bg-white/20 text-white font-bold'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {s === 'fit' ? `Tự chỉnh (${Math.round(effectiveScale * 100)}%)` : `${s}%`}
                  </button>
                ))}
              </div>

              {/* Back to Desktop */}
              <button
                type="button"
                onClick={() => handleToggleViewMode('desktop')}
                className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-1.5 transition-colors border border-white/15"
                title="Quay lại giao diện Desktop toàn màn hình"
              >
                <Icon name="desktop_windows" className="text-[14px]" />
                <span className="hidden sm:inline">Quay lại Desktop</span>
              </button>
            </div>
          </div>

          {/* Row 2: Quick Page Switcher (Trang Khách hàng & Trang Admin) */}
          <div className="px-4 py-2 rounded-2xl bg-[#221e1d]/90 border border-white/10 shadow-md flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-gold-foil uppercase tracking-wider flex items-center gap-1">
                <Icon name="touch_app" className="text-[14px]" />
                <span>Xem nhanh trang:</span>
              </span>

              {/* Customer Pages */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {PREVIEW_PAGES.filter((p) => p.group === 'customer').map((p) => {
                  const isActive = previewPath === p.path;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleNavigatePath(p.path)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-burgundy-wine text-white font-semibold shadow-xs'
                          : 'bg-black/30 text-white/80 hover:bg-black/50 hover:text-white border border-white/5'
                      }`}
                      title={p.description}
                    >
                      <Icon name={p.icon} className="text-[14px]" />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>

              <span className="text-white/30 hidden sm:inline">|</span>

              {/* Admin Pages */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {PREVIEW_PAGES.filter((p) => p.group === 'admin').map((p) => {
                  const isActive = previewPath === p.path;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleNavigatePath(p.path)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-gold-foil text-deep-espresso font-bold shadow-xs'
                          : 'bg-black/30 text-white/80 hover:bg-black/50 hover:text-white border border-white/5'
                      }`}
                      title={p.description}
                    >
                      <Icon name={p.icon} className="text-[14px]" />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulated Safari / Chrome Browser Navigation Bar */}
            <form onSubmit={handleUrlSubmit} className="flex items-center gap-1.5 flex-1 max-w-md min-w-[240px]">
              <div className="flex items-center gap-0.5 text-white/60">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="p-1 hover:text-white rounded hover:bg-white/10 transition-colors"
                  title="Quay lại (Back)"
                >
                  <Icon name="arrow_back" className="text-[15px]" />
                </button>
                <button
                  type="button"
                  onClick={handleGoForward}
                  className="p-1 hover:text-white rounded hover:bg-white/10 transition-colors"
                  title="Tiến tới (Forward)"
                >
                  <Icon name="arrow_forward" className="text-[15px]" />
                </button>
                <button
                  type="button"
                  onClick={handleReloadIframe}
                  className="p-1 hover:text-white rounded hover:bg-white/10 transition-colors"
                  title="Tải lại trang (F5)"
                >
                  <Icon name="refresh" className="text-[15px]" />
                </button>
              </div>

              <div className="relative flex-1">
                <Icon name="lock" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-400 text-[13px]" />
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="/, /mau-thiep..."
                  className="w-full pl-7 pr-7 py-1 rounded-xl bg-black/50 text-white text-xs border border-white/15 focus:outline-none focus:ring-1 focus:ring-gold-foil font-mono"
                  title="Nhập đường dẫn trang để xem trên điện thoại và bấm Enter"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-white/60 hover:text-white"
                  title="Chuyển tới trang"
                >
                  <Icon name="arrow_right_alt" className="text-[16px]" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleOpenExternal}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs transition-colors shrink-0"
                title="Mở trang này sang tab mới trên trình duyệt"
              >
                <Icon name="open_in_new" className="text-[14px]" />
              </button>
            </form>
          </div>
        </div>

        {/* Scaled Phone Container */}
        <div
          style={{
            width: `${activeDevice.width * effectiveScale}px`,
            height: `${activeDevice.height * effectiveScale}px`,
          }}
          className="relative flex items-center justify-center transition-all duration-200 mt-1"
        >
          <div
            style={{
              width: `${activeDevice.width}px`,
              height: `${activeDevice.height}px`,
              transform: `scale(${effectiveScale})`,
              transformOrigin: 'top center',
              borderRadius: `${activeDevice.borderRadius}px`,
              borderWidth: `${activeDevice.bezelWidth}px`,
            }}
            className="absolute top-0 border-[#292524] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)] ring-1 ring-white/15 bg-white text-on-surface flex flex-col overflow-hidden select-none"
          >
            {/* Dynamic Island / Notch */}
            {activeDevice.notchType === 'dynamic-island' && (
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#141211] rounded-full z-50 flex items-center justify-between px-3 pointer-events-none shadow-xs border border-white/5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#201d1c]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#172535] border border-white/10"></div>
              </div>
            )}

            {activeDevice.notchType === 'punch-hole' && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#141211] border border-white/10 z-50 pointer-events-none shadow-xs"></div>
            )}

            {activeDevice.notchType === 'classic-notch' && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#141211] rounded-full z-50 pointer-events-none shadow-xs"></div>
            )}

            {/* Phone Status Bar */}
            <div className="h-8 px-6 flex items-center justify-between text-[11px] font-semibold text-deep-espresso select-none shrink-0 pt-0.5 bg-surface-cream/80 backdrop-blur-md z-40 border-b border-border-delicate/40">
              <span className="font-mono">9:41</span>
              <div className="flex items-center gap-1.5 text-[13px] text-deep-espresso">
                <span className="text-[10px] font-bold text-text-muted mr-1">5G</span>
                <Icon name="signal_cellular_alt" className="text-[13px]" />
                <Icon name="wifi" className="text-[13px]" />
                <Icon name="battery_full" className="text-[14px]" />
              </div>
            </div>

            {/* The Real Phone Viewport: Isolated iframe */}
            <div className="relative flex-1 w-full overflow-hidden bg-white">
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={previewPath}
                title="Trình mô phỏng điện thoại Nhà Có Tiệc"
                className="w-full h-full border-0 bg-white"
                onLoad={handleIframeLoad}
              />
            </div>

            {/* Bottom iOS Home Bar */}
            <div className="h-4 bg-surface-cream/90 flex items-center justify-center shrink-0 border-t border-border-delicate/30">
              <div className="w-28 h-1 bg-deep-espresso/25 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 2: STANDARD FULL-WIDTH DESKTOP VIEW
  return (
    <div className="bg-surface font-sans text-on-surface antialiased min-h-screen flex">
      {/* Mobile Sidebar Overlay (for real mobile device screens) */}
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
        {renderSidebarContent(false)}
      </aside>

      {/* 2. Main Content Area with Header */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Sticky Topbar */}
        {renderHeader(false)}

        {/* Mobile Search Input Bar */}
        {renderMobileSearchBar()}

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1160px] mx-auto">
          <Outlet context={{ searchQuery, setSearchQuery } satisfies AdminOutletContext} />
        </main>
      </div>

      {/* Floating Action Button at Bottom-Right for Quick Mobile Switch */}
      <div className="fixed bottom-5 right-5 z-40 hidden md:block">
        <button
          type="button"
          onClick={() => handleToggleViewMode('mobile')}
          className="px-4 py-2.5 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold shadow-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border border-white/20"
          title="Xem mô phỏng giao diện Điện thoại"
        >
          <Icon name="smartphone" className="text-[17px]" />
          <span>Xem giao diện Điện thoại</span>
        </button>
      </div>
    </div>
  );
};
