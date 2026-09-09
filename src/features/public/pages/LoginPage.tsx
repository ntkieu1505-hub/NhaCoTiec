import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { useAuth } from '../../../mocks/authStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const { login, loginAsMockCustomer, loginAsMockAdmin } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('customer@example.com');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Vui lòng nhập email hoặc số điện thoại.');
      return;
    }

    const { redirectTo } = login(identifier);
    // If there is a specific redirect query and it matches permissions, use it; otherwise role default
    navigate(redirectUrl || redirectTo, { replace: true });
  };

  const handleQuickCustomer = () => {
    const { redirectTo } = loginAsMockCustomer();
    navigate(redirectUrl || redirectTo, { replace: true });
  };

  const handleQuickAdmin = () => {
    const { redirectTo } = loginAsMockAdmin();
    navigate(redirectUrl || redirectTo, { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-surface-cream">
      <div className="w-full max-w-md bg-surface-card rounded-2xl shadow-xl border border-border-delicate p-6 sm:p-8 flex flex-col gap-6">
        {/* Header with Rings Logo */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-burgundy-wine text-white flex items-center justify-center shadow-md">
            <Icon name="favorite" className="text-[24px]" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-deep-espresso mt-1">
            {authMode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản'}
          </h1>
          <p className="text-xs text-text-muted max-w-xs leading-relaxed">
            {authMode === 'login'
              ? 'Hệ thống tự động phân luồng theo vai trò tài khoản (Khách hàng hoặc Quản trị viên).'
              : 'Tạo tài khoản để bắt đầu lưu giữ khoảnh khắc thiêng liêng.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-full bg-surface-subtle p-1 border border-border-delicate">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all ${
              authMode === 'login'
                ? 'bg-burgundy-wine text-white shadow-xs'
                : 'text-deep-espresso hover:text-burgundy-wine'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all ${
              authMode === 'register'
                ? 'bg-burgundy-wine text-white shadow-xs'
                : 'text-deep-espresso hover:text-burgundy-wine'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <Icon name="error" className="text-[16px] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {authMode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-espresso">
                Họ và tên cô dâu / chú rể
              </label>
              <div className="relative flex items-center">
                <Icon name="person" className="absolute left-3 text-[18px] text-text-muted" />
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Minh Anh"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-delicate bg-surface text-xs text-deep-espresso focus:outline-none focus:border-burgundy-wine"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-deep-espresso">
              Email tài khoản
            </label>
            <div className="relative flex items-center">
              <Icon name="mail" className="absolute left-3 text-[18px] text-text-muted" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="email@domain.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-delicate bg-surface text-xs text-deep-espresso focus:outline-none focus:border-burgundy-wine"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-deep-espresso">
                Mật khẩu
              </label>
              {authMode === 'login' && (
                <button type="button" className="text-[11px] text-burgundy-wine hover:underline">
                  Quên mật khẩu?
                </button>
              )}
            </div>
            <div className="relative flex items-center">
              <Icon name="lock" className="absolute left-3 text-[18px] text-text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-delicate bg-surface text-xs text-deep-espresso focus:outline-none focus:border-burgundy-wine"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full h-11 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white font-label-md text-xs font-semibold shadow-md active:scale-95 transition-all mt-2 flex items-center justify-center gap-1.5"
          >
            <Icon name="login" className="text-[18px]" />
            <span>{authMode === 'login' ? 'Đăng Nhập Hệ Thống' : 'Tạo Tài Khoản Mới'}</span>
          </button>
        </form>

        {/* Developer / Testing Review Switcher */}
        <div className="bg-surface-subtle/70 p-3.5 rounded-xl border border-border-delicate text-center flex flex-col gap-2">
          <p className="text-[11px] text-text-muted font-medium">
            (Chế độ thử nghiệm nghiệm thu: Chọn nhanh vai trò tài khoản)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickCustomer}
              className="px-3 py-2 rounded-xl bg-surface-card border border-border-delicate text-deep-espresso text-xs font-semibold hover:bg-surface-subtle shadow-2xs flex items-center justify-center gap-1 transition-all"
            >
              <Icon name="favorite" className="text-[15px] text-burgundy-wine" />
              <span>Khách hàng</span>
            </button>
            <button
              type="button"
              onClick={handleQuickAdmin}
              className="px-3 py-2 rounded-xl bg-deep-espresso text-white text-xs font-semibold hover:bg-[#340b10] shadow-2xs flex items-center justify-center gap-1 transition-all"
            >
              <Icon name="admin_panel_settings" className="text-[15px] text-gold-foil" />
              <span>Quản trị Admin</span>
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <p className="text-[11px] text-text-muted text-center leading-tight">
          Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách quyền riêng tư của Nhà Có Tiệc.
        </p>
      </div>
    </div>
  );
};
