import React from 'react';
import { Icon } from '../../../components/common/Icon';
import { MOCK_GUESTS } from '../../../mocks/index';

export const AdminGuestsPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-deep-espresso">
            06. Quản Lý Khách Tham Dự (RSVP)
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Tổng hợp dữ liệu phản hồi tham dự cưới và danh sách xếp bàn tiệc
          </p>
        </div>
        <button
          onClick={() => alert('Đã xuất file danh sách khách mời (.xlsx)')}
          className="px-4 py-2 rounded-full bg-surface-card hover:bg-surface-subtle text-deep-espresso border border-border-delicate text-xs font-semibold flex items-center gap-1.5 shadow-xs"
        >
          <Icon name="file_download" className="text-[16px] text-text-muted" />
          <span>Xuất danh sách Excel</span>
        </button>
      </div>

      <div className="bg-surface-card rounded-2xl shadow-xs border border-border-delicate overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-surface-subtle/50 border-b border-border-delicate text-text-muted font-label-caps uppercase text-[10px]">
              <th className="py-3 px-4">Tên khách mời</th>
              <th className="py-3 px-4">Đơn hàng</th>
              <th className="py-3 px-4">Số điện thoại</th>
              <th className="py-3 px-4">Phản hồi</th>
              <th className="py-3 px-4">Đi kèm</th>
              <th className="py-3 px-4">Xếp bàn / Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-delicate">
            {MOCK_GUESTS.map((g) => (
              <tr key={g.id} className="hover:bg-surface-subtle/30 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-deep-espresso">
                  {g.name}
                </td>
                <td className="py-3.5 px-4 font-mono text-burgundy-wine font-bold">
                  #{g.orderId}
                </td>
                <td className="py-3.5 px-4 text-text-muted">
                  {g.phone || 'Chưa cung cấp'}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-label-caps font-semibold border ${
                      g.rsvpStatus === 'attending'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : g.rsvpStatus === 'declined'
                        ? 'bg-rose-50 text-burgundy-wine border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {g.rsvpStatus === 'attending' ? 'Tham dự' : g.rsvpStatus === 'declined' ? 'Bận việc' : 'Chờ xác nhận'}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-medium text-deep-espresso">
                  {g.companionCount > 0 ? `+${g.companionCount} người` : 'Đi một mình'}
                </td>
                <td className="py-3.5 px-4 text-text-muted">
                  <div>{g.tableNumber || 'Chưa xếp bàn'}</div>
                  {g.notes && <div className="text-[11px] text-gold-foil italic">{g.notes}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
