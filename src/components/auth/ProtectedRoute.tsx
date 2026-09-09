import React from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../mocks/authStore';
import { Icon } from '../common/Icon';

/**
 * Admin Route Guard:
 * Strictly requires an authenticated user with 'admin' role.
 * Unauthorized customers or unauthenticated visitors are blocked.
 */
export const AdminRoute: React.FC = () => {
  const { isAuthenticated, isAdmin, user, logout, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-cream flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-burgundy-wine border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-text-muted font-medium">Đang xác thực quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/dang-nhap?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-surface-cream flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface-card rounded-2xl p-6 sm:p-8 border border-red-200 shadow-xl flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
            <Icon name="gpp_bad" className="text-[32px]" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-deep-espresso">
            Truy Cập Bị Từ Chối
          </h1>
          <p className="text-xs text-text-muted leading-relaxed">
            Tài khoản <strong className="text-deep-espresso">{user?.email}</strong> không có quyền truy cập khu vực Quản trị Admin. Vui lòng đăng nhập bằng tài khoản Quản trị viên được ủy quyền.
          </p>
          <div className="flex items-center gap-3 w-full pt-2">
            <Link
              to="/dashboard"
              className="flex-1 py-2.5 rounded-full bg-surface-subtle text-deep-espresso text-xs font-semibold hover:bg-surface-container-high transition-colors text-center"
            >
              Vào Cổng Khách Hàng
            </Link>
            <button
              onClick={() => logout()}
              className="flex-1 py-2.5 rounded-full bg-burgundy-wine text-white text-xs font-semibold hover:bg-[#851622] transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

/**
 * Customer Route Guard:
 * Requires authenticated user.
 * Unauthenticated visitors are redirected to login.
 */
export const CustomerRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-cream flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-burgundy-wine border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-text-muted font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/dang-nhap?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <Outlet />;
};
