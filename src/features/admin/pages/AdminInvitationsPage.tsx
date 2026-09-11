import React, { useState, useMemo } from 'react';
import { Icon } from '../../../components/common/Icon';
import { useOrders } from '../../../mocks/orderStore';

export const AdminInvitationsPage: React.FC = () => {
  const orders = useOrders();
  const [searchQuery, setSearchQuery] = useState('');

  const publishedInvitations = useMemo(() => {
    return orders.filter((o) => {
      if (o.currentStage < 5 && !o.invitationUrl) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchId = o.id.toLowerCase().includes(q);
        const matchName = (o.customerName || '').toLowerCase().includes(q);
        const matchTpl = (o.templateName || '').toLowerCase().includes(q);
        const matchUrl = (o.invitationUrl || '').toLowerCase().includes(q);
        if (!matchId && !matchName && !matchTpl && !matchUrl) return false;
      }
      return true;
    });
  }, [orders, searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-deep-espresso">
            03. Quản Lý Thiệp Cưới Khách Hàng
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Theo dõi liên kết, lượt xem và hạn lưu trữ của các ấn phẩm thiệp đang xuất bản
          </p>
        </div>
        <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          {publishedInvitations.length} Thiệp đang hoạt động
        </span>
      </div>

      {/* Search Input Bar */}
      <div className="bg-surface-card rounded-2xl p-3 sm:p-4 border border-border-delicate shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã thiệp (#NCT01), tên dâu rể, mẫu thiệp..."
            className="w-full h-10 pl-10 pr-9 rounded-xl bg-surface-subtle border border-border-delicate text-xs text-deep-espresso placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-burgundy-wine focus:border-burgundy-wine"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-deep-espresso"
              title="Xóa tìm kiếm"
            >
              <Icon name="close" className="text-[16px]" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>
            Hiển thị: <strong>{publishedInvitations.length}</strong> thiệp
          </span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-burgundy-wine font-semibold hover:underline text-[11px]"
            >
              (Xóa lọc)
            </button>
          )}
        </div>
      </div>

      {publishedInvitations.length === 0 ? (
        <div className="p-12 text-center bg-surface-card rounded-2xl border border-border-delicate flex flex-col items-center gap-2">
          <Icon name="search_off" className="text-3xl text-text-muted/60" />
          <span className="font-semibold text-deep-espresso">Không tìm thấy thiệp cưới nào phù hợp</span>
          <span className="text-xs text-text-muted">
            {searchQuery ? `Không có thiệp nào khớp với "${searchQuery}".` : 'Hiện chưa có thiệp nào trong trạng thái xuất bản.'}
          </span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-2 px-4 py-1.5 rounded-full bg-surface-subtle text-burgundy-wine text-xs font-semibold hover:bg-surface-cream border border-border-delicate"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {publishedInvitations.map((inv) => (
            <div
              key={inv.id}
              className="p-4 rounded-2xl bg-surface-card border border-border-delicate flex flex-col justify-between gap-3 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-burgundy-wine">#{inv.id}</span>
                  <h3 className="font-serif text-base font-bold text-deep-espresso mt-0.5">
                    {inv.customerName}
                  </h3>
                  <span className="text-xs text-text-muted">{inv.templateName}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-label-caps font-bold">
                  Đang online
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-subtle/50 border border-border-delicate flex items-center justify-between text-xs">
                <span className="font-mono text-burgundy-wine truncate">
                  {inv.invitationUrl || `https://nhacotiec.vn/invitation/${inv.id.toLowerCase()}`}
                </span>
                <a
                  href={inv.invitationUrl || `https://nhacotiec.vn/invitation/${inv.id.toLowerCase()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-deep-espresso font-semibold flex items-center gap-1 hover:underline shrink-0 ml-2"
                >
                  <Icon name="open_in_new" className="text-[14px]" />
                  <span>Mở</span>
                </a>
              </div>

              <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border-delicate">
                <span>Lượt xem: <strong>348 lượt</strong></span>
                <span>Hạn lưu trữ: <strong>365 ngày</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
