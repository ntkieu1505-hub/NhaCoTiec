import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { useAuth } from '../../mocks/authStore';

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
    { number: '06', name: 'Khách mời & lời chúc', path: '/admin/khach-moi-loi-chuc', icon: 'recent_actors' },
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
            <div className="hidden md:flex relative items-center">
              <Icon name="search" className="absolute left-3 text-text-muted text-[18px]" />
              <input
                type="text"
                placeholder="Tìm kiếm đơn, khách, thiệp..."
                className="w-56 lg:w-64 pl-9 pr-4 py-1.5 rounded-full bg-surface-subtle text-on-surface text-xs placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-burgundy-wine transition-all"
              />
            </div>

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

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1160px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
