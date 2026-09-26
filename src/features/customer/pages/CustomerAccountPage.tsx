import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { useOrders } from '../../../mocks/orderStore';
import { useZaloSupportUrl } from '../../../mocks/cmsStore';
import { useAuth } from '../../../mocks/authStore';

export const CustomerAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateCustomerProfile } = useAuth();
  const zaloUrl = useZaloSupportUrl();
  const allOrders = useOrders();
  
  // Find order strictly belonging to the logged in user
  const userOrder = user ? allOrders.find((o) => o.userId === user.id) : undefined;

  // Customer Profile State - STRICTLY from user profile, never auto-filled from other orders or dummy defaults!
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  // Keep state synced when user profile changes
  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.email) setCustomerEmail(user.email);
    }
  }, [user]);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string | null>(null);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState<string | null>(null);
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.id) {
      await updateCustomerProfile(user.id, {
        name: customerName.trim(),
        phone: customerPhone.trim(),
      });
    }
    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMessage(null);

    if (!currentPassword) {
      setPasswordErrorMessage('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordErrorMessage('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMessage('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    // Success mock
    setPasswordSuccessMessage('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowChangePasswordForm(false);
    setTimeout(() => setPasswordSuccessMessage(null), 4000);
  };

  return (
    <div className="flex flex-col w-full text-deep-espresso px-4 py-4 gap-5 pb-20">
      {/* 1. Sub-Header Navigation: Back to Dashboard */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between -mx-4 px-4 py-2.5 bg-[#4a0d11] text-white shadow-xs">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-white hover:text-rose-200 text-xs font-medium transition-colors"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span>Quay lại Cổng Khách Hàng</span>
          </Link>
        </div>

        <div className="flex items-baseline justify-between mt-2">
          <div>
            <h1 className="font-serif text-xl font-bold text-deep-espresso">
              Thông tin đăng nhập
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Quản lý thông tin tài khoản và bảo mật mật khẩu cho đơn hàng cưới
            </p>
          </div>
          {userOrder && (
            <div className="flex items-center px-2.5 py-1 rounded-lg bg-surface-subtle border border-border-delicate">
              <span className="font-serif text-xs font-bold text-burgundy-wine">
                #{userOrder.id}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Success / Error Alerts */}
      {isProfileSaved && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-medium animate-in fade-in">
          <Icon name="check_circle" className="text-[16px] text-emerald-700" />
          <span>Đã lưu thông tin tài khoản thành công!</span>
        </div>
      )}

      {passwordSuccessMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-medium animate-in fade-in">
          <Icon name="check_circle" className="text-[16px] text-emerald-700" />
          <span>{passwordSuccessMessage}</span>
        </div>
      )}

      {/* 2. CARD: THÔNG TIN TÀI KHOẢN */}
      <div className="bg-surface-card rounded-2xl p-5 shadow-xs border border-border-delicate flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-border-delicate">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-burgundy-wine/10 text-burgundy-wine flex items-center justify-center">
              <Icon name="person" className="text-[18px]" />
            </div>
            <div>
              <span className="font-label-caps text-[9px] uppercase tracking-wider font-bold text-burgundy-wine block">
                Hồ sơ cặp đôi
              </span>
              <h2 className="font-serif text-base font-bold text-deep-espresso">
                THÔNG TIN TÀI KHOẢN
              </h2>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-surface-subtle text-deep-espresso text-[10px] font-label-caps font-semibold border border-border-delicate">
            Đã xác thực
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="flex flex-col gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <label className="text-text-muted font-medium">Họ và tên đại diện:</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-subtle/70 border border-border-delicate focus:border-burgundy-wine focus:ring-1 focus:ring-burgundy-wine text-deep-espresso font-medium outline-none"
              placeholder="Chưa cập nhật — Nhập tên đại diện (VD: Minh Anh & Tuấn Kiệt)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-text-muted font-medium">Số điện thoại liên hệ:</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle/70 border border-border-delicate focus:border-burgundy-wine focus:ring-1 focus:ring-burgundy-wine text-deep-espresso font-mono outline-none"
                placeholder="Chưa cập nhật — Nhập SĐT để nhận hỗ trợ (VD: 0912 345 678)"
              />
              <span className="text-[10px] text-text-muted">
                Dùng để nhận tư vấn và thông báo hoàn thiện thiệp cưới qua Zalo.
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-text-muted font-medium">Email đăng nhập:</label>
              <input
                type="email"
                value={customerEmail}
                disabled
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle/40 border border-border-delicate text-text-muted cursor-not-allowed outline-none"
                placeholder="email@example.com"
              />
              <span className="text-[10px] text-text-muted">
                Email cố định dùng để đăng nhập vào tài khoản của bạn.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-surface-card hover:bg-surface-subtle text-deep-espresso border border-border-delicate text-xs font-semibold shadow-2xs transition-colors"
            >
              Lưu thay đổi thông tin
            </button>
          </div>
        </form>
      </div>

      {/* 3. CARD: THÔNG TIN ĐĂNG NHẬP & BẢO MẬT */}
      <div className="bg-surface-card rounded-2xl p-5 shadow-xs border border-border-delicate flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-border-delicate">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gold-foil/15 text-deep-espresso flex items-center justify-center">
              <Icon name="lock" className="text-[18px] text-gold-foil" />
            </div>
            <div>
              <span className="font-label-caps text-[9px] uppercase tracking-wider font-bold text-burgundy-wine block">
                Bảo mật đăng nhập
              </span>
              <h2 className="font-serif text-base font-bold text-deep-espresso">
                THÔNG TIN ĐĂNG NHẬP
              </h2>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-xs">
          {/* Row 1: Email đăng nhập */}
          <div className="p-3 rounded-xl bg-surface-subtle/60 border border-border-delicate flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted uppercase font-bold">Email đăng nhập</span>
              <span className="font-medium text-deep-espresso">{customerEmail}</span>
            </div>
            <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
              Đang hoạt động
            </span>
          </div>

          {/* Row 2: Mật khẩu */}
          <div className="p-3 rounded-xl bg-surface-subtle/60 border border-border-delicate flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted uppercase font-bold">Mật khẩu</span>
              <span className="font-mono text-text-muted tracking-widest">••••••••••••</span>
            </div>
            <button
              type="button"
              onClick={() => setShowChangePasswordForm(!showChangePasswordForm)}
              className="text-[11px] text-burgundy-wine font-semibold hover:underline flex items-center gap-1"
            >
              <Icon name="vpn_key" className="text-[14px]" />
              <span>{showChangePasswordForm ? 'Đóng biểu mẫu' : 'Thay đổi mật khẩu'}</span>
            </button>
          </div>

          {/* Collapsible Change Password Form */}
          {showChangePasswordForm && (
            <form
              onSubmit={handleChangePassword}
              className="p-4 rounded-xl bg-surface-cream border border-border-delicate flex flex-col gap-3 animate-in fade-in"
            >
              <h3 className="font-serif font-bold text-deep-espresso text-xs flex items-center gap-1.5">
                <Icon name="password" className="text-[16px] text-burgundy-wine" />
                <span>Đặt mật khẩu mới</span>
              </h3>

              {passwordErrorMessage && (
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium flex items-center gap-1.5">
                  <Icon name="error" className="text-[14px]" />
                  <span>{passwordErrorMessage}</span>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-text-muted text-[11px]">Mật khẩu hiện tại:</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-delicate focus:border-burgundy-wine text-deep-espresso outline-none text-xs"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-text-muted text-[11px]">Mật khẩu mới:</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-delicate focus:border-burgundy-wine text-deep-espresso outline-none text-xs"
                    placeholder="Ít nhất 6 ký tự"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-text-muted text-[11px]">Xác nhận mật khẩu mới:</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-delicate focus:border-burgundy-wine text-deep-espresso outline-none text-xs"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordForm(false)}
                  className="px-3 py-1.5 rounded-full bg-surface-card text-deep-espresso text-xs font-medium border border-border-delicate hover:bg-surface-subtle"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 4. CARD: HỖ TRỢ VÀ BẢO MẬT */}
      <div className="p-4 rounded-2xl bg-surface-subtle/70 border border-border-delicate text-xs flex flex-col gap-2">
        <div className="flex items-center gap-2 text-deep-espresso font-semibold">
          <Icon name="shield" className="text-[18px] text-gold-foil" />
          <span>Lưu ý bảo mật tài khoản tiệc cưới:</span>
        </div>
        <p className="text-text-muted leading-relaxed text-[11px]">
          Thông tin đăng nhập được dùng để quản lý đơn hàng, danh sách khách mời RSVP và những lời chúc kỷ niệm. Vui lòng không chia sẻ mật khẩu của bạn cho người lạ.
        </p>
        <div className="pt-2 border-t border-border-delicate flex items-center justify-between">
          <span className="text-text-muted text-[11px]">Cần cấp lại mật khẩu gấp?</span>
          <a
            href={zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="text-burgundy-wine font-semibold hover:underline text-[11px] flex items-center gap-1"
          >
            <Icon name="chat" className="text-[14px]" />
            <span>Liên hệ hỗ trợ Zalo 24/7</span>
          </a>
        </div>
      </div>

      {/* 5. CARD: ĐĂNG XUẤT */}
      <div className="p-4 rounded-2xl bg-surface-card border border-border-delicate flex items-center justify-between shadow-2xs">
        <div>
          <span className="text-xs font-semibold text-deep-espresso block">Đăng xuất tài khoản</span>
          <span className="text-[11px] text-text-muted">Kết thúc phiên làm việc trên Cổng Khách Hàng</span>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/', { replace: true });
          }}
          className="px-4 py-1.5 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Icon name="logout" className="text-[15px]" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};
