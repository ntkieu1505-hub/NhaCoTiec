import React from 'react';
import { Icon } from '../../../components/common/Icon';
import { MOCK_ORDERS } from '../../../mocks/mockOrders';

export const AdminInvitationsPage: React.FC = () => {
  const publishedInvitations = MOCK_ORDERS.filter((o) => o.currentStage >= 5);

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
          48 Thiệp đang hoạt động
        </span>
      </div>

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
              <button
                onClick={() => alert(`Đã mở liên kết thiệp: ${inv.invitationUrl}`)}
                className="text-xs text-deep-espresso font-semibold flex items-center gap-1 hover:underline"
              >
                <Icon name="open_in_new" className="text-[14px]" />
                <span>Mở</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border-delicate">
              <span>Lượt xem: <strong>348 lượt</strong></span>
              <span>Hạn lưu trữ: <strong>365 ngày</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
