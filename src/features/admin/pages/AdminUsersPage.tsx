import React from 'react';
import { MOCK_USERS } from '../../../mocks/index';
import { formatDateTime } from '../../../utils/formatters';

export const AdminUsersPage: React.FC = () => {
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
            {MOCK_USERS.map((usr) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
