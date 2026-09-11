import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { MOCK_USERS } from '../../../mocks/index';
import { formatDateTime } from '../../../utils/formatters';
import { matchQuery } from '../../../utils/searchHelper';
import { AdminOutletContext } from '../../../components/layouts/AdminLayout';

export const AdminUsersPage: React.FC = () => {
  const outletCtx = useOutletContext<AdminOutletContext>() || {};
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || outletCtx.searchQuery || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  useEffect(() => {
    if (outletCtx.searchQuery !== undefined && outletCtx.searchQuery !== searchQuery) {
      setSearchQuery(outletCtx.searchQuery);
    }
  }, [outletCtx.searchQuery]);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
      outletCtx.setSearchQuery?.(q);
    }
  }, [searchParams]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    outletCtx.setSearchQuery?.(val);
    if (val.trim()) {
      setSearchParams({ search: val.trim() }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const filteredUsers = useMemo(() => {
    return MOCK_USERS.filter((usr) => {
      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        const matchName = matchQuery(usr.fullName, q);
        const matchPhone = matchQuery(usr.phone, q);
        const matchEmail = matchQuery(usr.email, q);
        const matchRole = matchQuery(usr.role === 'admin' ? 'Quản trị viên Admin' : 'Khách hàng', q);
        if (!matchName && !matchPhone && !matchEmail && !matchRole) return false;
      }
      return true;
    });
  }, [searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-deep-espresso">
            05. Quản Lý Người Dùng
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Danh sách tài khoản cô dâu, chú rể và đội ngũ quản trị Studio
          </p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-surface-card rounded-2xl p-3 sm:p-4 border border-border-delicate shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm theo họ tên, số điện thoại, email, vai trò..."
            className="w-full h-10 pl-10 pr-9 rounded-xl bg-surface-subtle border border-border-delicate text-xs text-deep-espresso placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-burgundy-wine focus:border-burgundy-wine"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-deep-espresso"
              title="Xóa tìm kiếm"
            >
              <Icon name="close" className="text-[16px]" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>
            Hiển thị: <strong>{filteredUsers.length}</strong> / {MOCK_USERS.length} người dùng
          </span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="text-burgundy-wine font-semibold hover:underline text-[11px]"
            >
              (Xóa lọc)
            </button>
          )}
        </div>
      </div>

      <div className="bg-surface-card rounded-2xl shadow-xs border border-border-delicate overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-surface-subtle/50 border-b border-border-delicate text-text-muted font-label-caps uppercase text-[10px]">
              <th className="py-3 px-4">Họ và tên</th>
              <th className="py-3 px-4">Liên hệ (SĐT / Email)</th>
              <th className="py-3 px-4">Vai trò</th>
              <th className="py-3 px-4">Số đơn hàng</th>
              <th className="py-3 px-4">Đăng nhập gần nhất</th>
              <th className="py-3 px-4 text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-delicate">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-text-muted">
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="search_off" className="text-3xl text-text-muted/50" />
                    <span className="font-semibold text-deep-espresso">Không tìm thấy người dùng phù hợp</span>
                    <span className="text-xs text-text-muted">
                      Không có tài khoản nào khớp với từ khóa "{searchQuery}".
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSearchChange('')}
                      className="mt-2 px-4 py-1.5 rounded-full bg-surface-subtle text-burgundy-wine text-xs font-semibold hover:bg-surface-cream border border-border-delicate"
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((usr) => (
                <tr key={usr.id} className="hover:bg-surface-subtle/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-deep-espresso">
                    {usr.fullName}
                  </td>
                  <td className="py-3.5 px-4 text-text-muted">
                    <div>{usr.phone}</div>
                    <div className="text-[11px]">{usr.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-label-caps font-bold uppercase ${
                        usr.role === 'admin'
                          ? 'bg-burgundy-wine text-white'
                          : 'bg-surface-subtle text-deep-espresso border border-border-delicate'
                      }`}
                    >
                      {usr.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-deep-espresso">
                    {usr.orderCount} đơn
                  </td>
                  <td className="py-3.5 px-4 text-text-muted">
                    {usr.lastLogin ? formatDateTime(usr.lastLogin) : 'Chưa đăng nhập'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-800 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>Hoạt động</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
