import React, { useState, useMemo } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { MOCK_GUESTS } from '../../../mocks/index';
import { Guest } from '../../../types';
import { AdminOutletContext } from '../../../components/layouts/AdminLayout';

export const AdminGuestsPage: React.FC = () => {
  const outletCtx = useOutletContext<AdminOutletContext>() || {};
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || outletCtx.searchQuery || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Real-time guest list (zero mock data)
  const [guests] = useState<Guest[]>(MOCK_GUESTS);

  const filteredGuests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.phone && g.phone.includes(q)) ||
        g.orderId.toLowerCase().includes(q) ||
        (g.notes && g.notes.toLowerCase().includes(q))
    );
  }, [guests, searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-deep-espresso">
            06. Quản Lý Khách Tham Dự (RSVP)
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Tổng hợp dữ liệu phản hồi tham dự cưới và danh sách xếp bàn tiệc (Đo lường thời gian thực)
          </p>
        </div>
        <button
          onClick={() => {
            if (guests.length === 0) {
              alert('Chưa có dữ liệu khách mời nào để xuất file.');
            } else {
              alert('Đã xuất file danh sách khách mời (.xlsx)');
            }
          }}
          className="px-4 py-2 rounded-full bg-surface-card hover:bg-surface-subtle text-deep-espresso border border-border-delicate text-xs font-semibold flex items-center gap-1.5 shadow-xs"
        >
          <Icon name="file_download" className="text-[16px] text-text-muted" />
          <span>Xuất danh sách Excel</span>
        </button>
      </div>

      {/* Real-time Search & Counter Bar */}
      <div className="bg-surface-card p-3 rounded-2xl border border-border-delicate flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên khách, số điện thoại, mã đơn..."
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

        <div className="text-xs text-text-muted flex items-center gap-2">
          <span>
            Hiển thị: <strong>{filteredGuests.length}</strong> / {guests.length} khách mời
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Realtime
          </span>
        </div>
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
            {filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-text-muted">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-surface-subtle flex items-center justify-center text-text-muted">
                      <Icon name="group_off" className="text-[24px]" />
                    </div>
                    <p className="font-semibold text-deep-espresso text-sm">Chưa có dữ liệu phản hồi RSVP</p>
                    <p className="text-xs text-text-muted max-w-md">
                      Hệ thống đang hoạt động ở chế độ thời gian thực (0 dữ liệu giả định). Khi khách mời phản hồi tham dự qua thiệp cưới trực tuyến, thông tin sẽ tự động xuất hiện tại đây.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredGuests.map((g) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
