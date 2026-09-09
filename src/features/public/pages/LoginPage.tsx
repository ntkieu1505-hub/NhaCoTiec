import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { useAuth } from '../../../mocks/authStore';

function getFirebaseErrorMessage(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';
    case 'auth/email-already-in-use':
      return 'Email này đã được đăng ký tài khoản. Vui lòng chuyển sang tab Đăng nhập.';
    case 'auth/weak-password':
      return 'Mật khẩu quá ngắn. Vui lòng đặt mật khẩu tối thiểu 6 ký tự.';
    case 'auth/invalid-email':
      return 'Địa chỉ email không đúng định dạng.';
    case 'auth/popup-closed-by-user':
      return 'Cửa sổ đăng nhập Google đã được đóng.';
    case 'auth/popup-blocked':
      return 'Trình duyệt đang chặn cửa sổ đăng nhập. Vui lòng cho phép mở popup trên trình duyệt.';
    case 'auth/operation-not-allowed':
      return 'Phương thức đăng nhập này chưa được kích hoạt trong Firebase Console. Vui lòng bật Email/Password hoặc Google trong Authentication > Sign-in method.';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra đường truyền và thử lại.';
    default:
      return error?.message || 'Đã xảy ra lỗi trong quá trình xác thực. Vui lòng thử lại.';
  }
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const { loginWithEmail, registerWithEmail, loginWithGoogle, isAuthenticated, isAdmin } = useAuth();

  const [authMode, setAuthMode] = useState<'login' | 'register'>(
    location.pathname === '/dang-ky' ? 'register' : 'login'
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // If user is already authenticated, redirect automatically
  useEffect(() => {
    if (isAuthenticated) {
      if (redirectUrl) {
        navigate(redirectUrl, { replace: true });
      } else {
        navigate(isAdmin ? '/admin/tong-quan' : '/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, redirectUrl, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email.');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    if (authMode === 'register') {
      if (password.length < 6) {
        setError('Mật khẩu cần tối thiểu 6 ký tự.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp. Vui lòng nhập lại.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (authMode === 'login') {
        const result = await loginWithEmail(email, password);
        navigate(redirectUrl || result.redirectTo, { replace: true });
      } else {
        const result = await registerWithEmail(email, password, name);
        navigate(redirectUrl || result.redirectTo, { replace: true });
      }
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      navigate(redirectUrl || result.redirectTo, { replace: true });
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setIsGoogleLoading(false);
    }
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
              ? 'Hệ thống bảo mật Firebase - Quản trị viên và Khách hàng đăng nhập an toàn.'
              : 'Tạo tài khoản để tạo và quản lý thiệp cưới trực tuyến của bạn.'}
          </p>
        </div>

        {/* Order Redirect Requirement Notice */}
        {redirectUrl && (redirectUrl.includes('/dat-thiep') || redirectUrl.includes('/thanh-toan')) && (
          <div className="p-3.5 rounded-xl bg-[#63141a]/5 border border-burgundy-wine/20 flex items-start gap-3 text-xs text-deep-espresso">
            <div className="w-7 h-7 rounded-full bg-burgundy-wine/10 text-burgundy-wine flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="lock" className="text-[16px]" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-burgundy-wine">Yêu cầu đăng nhập trước khi đặt thiệp</span>
              <span className="text-text-muted leading-relaxed">
                Vui lòng đăng nhập (hoặc chọn tab Đăng ký tài khoản mới) để bắt đầu điền thông tin và lưu trữ thiệp cưới của bạn.
              </span>
            </div>
          </div>
        )}

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

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <Icon name="error" className="text-[18px] shrink-0 text-red-600 mt-0.5" />
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isSubmitting}
          className="w-full h-11 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-deep-espresso text-xs font-semibold shadow-2xs active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGoogleLoading ? (
            <div className="w-4 h-4 border-2 border-burgundy-wine border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{isGoogleLoading ? 'Đang kết nối Google...' : 'Tiếp tục với tài khoản Google'}</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-border-delicate w-full" />
          <span className="bg-surface-card px-3 text-[11px] font-semibold tracking-wider uppercase text-text-muted absolute">
            Hoặc dùng Email
          </span>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {authMode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-espresso">
                Họ và tên / Tên cô dâu chú rể
              </label>
              <div className="relative flex items-center">
                <Icon name="person" className="absolute left-3 text-[18px] text-text-muted" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Minh Anh & Tuấn Kiệt"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-delicate bg-surface text-xs text-deep-espresso focus:outline-none focus:border-burgundy-wine"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-deep-espresso">
              Địa chỉ Email
            </label>
            <div className="relative flex items-center">
              <Icon name="mail" className="absolute left-3 text-[18px] text-text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten-ban@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-delicate bg-surface text-xs text-deep-espresso focus:outline-none focus:border-burgundy-wine"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-deep-espresso">
                Mật khẩu
              </label>
            </div>
            <div className="relative flex items-center">
              <Icon name="lock" className="absolute left-3 text-[18px] text-text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={authMode === 'register' ? 'Tối thiểu 6 ký tự' : 'Nhập mật khẩu'}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-delicate bg-surface text-xs text-deep-espresso focus:outline-none focus:border-burgundy-wine"
              />
            </div>
          </div>

          {authMode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-espresso">
                Nhập lại mật khẩu
              </label>
              <div className="relative flex items-center">
                <Icon name="lock_reset" className="absolute left-3 text-[18px] text-text-muted" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu vừa nhập"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-delicate bg-surface text-xs text-deep-espresso focus:outline-none focus:border-burgundy-wine"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isGoogleLoading}
            className="w-full h-11 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white font-label-md text-xs font-semibold shadow-md active:scale-95 transition-all mt-2 flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Icon name={authMode === 'login' ? 'login' : 'person_add'} className="text-[18px]" />
            )}
            <span>
              {isSubmitting
                ? 'Đang xử lý...'
                : authMode === 'login'
                ? 'Đăng Nhập Hệ Thống'
                : 'Tạo Tài Khoản Mới'}
            </span>
          </button>
        </form>

        {/* Switch mode hint */}
        <div className="text-center text-xs text-text-muted">
          {authMode === 'login' ? (
            <span>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setError(null);
                }}
                className="font-semibold text-burgundy-wine hover:underline"
              >
                Đăng ký ngay
              </button>
            </span>
          ) : (
            <span>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError(null);
                }}
                className="font-semibold text-burgundy-wine hover:underline"
              >
                Đăng nhập
              </button>
            </span>
          )}
        </div>

        {/* Security & Privacy Note */}
        <div className="pt-2 border-t border-border-delicate/60 flex items-center justify-center gap-1.5 text-[11px] text-text-muted text-center">
          <Icon name="verified_user" className="text-[14px] text-emerald-600 shrink-0" />
          <span>Bảo mật an toàn bởi Firebase Authentication</span>
        </div>
      </div>
    </div>
  );
};
