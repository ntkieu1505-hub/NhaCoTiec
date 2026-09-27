import React, { useState } from 'react';
import { Icon } from '../../../components/common/Icon';
import { Guest, Wish } from '../../../types';
import { CustomerExport } from '../../../types/order';
import { formatDateTime } from '../../../utils/formatters';

interface GuestsWishesModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderTitle?: string;
  guests: Guest[];
  wishes: Wish[];
  exportData?: CustomerExport;
  onDownloadFile: () => void;
  onTogglePinWish?: (wishId: string) => void;
}

export const GuestsWishesModal: React.FC<GuestsWishesModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderTitle,
  guests,
  wishes,
  exportData,
  onDownloadFile,
  onTogglePinWish,
}) => {
  const [activeTab, setActiveTab] = useState<'guests' | 'wishes' | 'file'>('guests');

  if (!isOpen) return null;

  const attendingCount = guests.filter((g) => g.rsvpStatus === 'attending').length;
  const totalAttendees = guests
    .filter((g) => g.rsvpStatus === 'attending')
    .reduce((sum, g) => sum + 1 + (g.companionCount || 0), 0);
  const declinedCount = guests.filter((g) => g.rsvpStatus === 'declined').length;
  const pendingCount = guests.filter((g) => g.rsvpStatus === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-deep-espresso/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-surface-cream rounded-2xl shadow-2xl border border-border-delicate flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border-delicate/80 bg-surface-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center border border-emerald-300 shadow-2xs">
              <Icon name="table_view" className="text-[22px]" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-deep-espresso">
                Chi tiết Khách Mời &amp; Lời Chúc Mừng
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                Đơn hàng #{orderId} • {orderTitle || 'Khách hàng'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-subtle hover:bg-surface-cream text-text-muted hover:text-deep-espresso flex items-center justify-center transition-colors"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        {/* Statistical Summary Pills */}
        <div className="p-4 bg-surface-subtle/50 border-b border-border-delicate/80 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 rounded-xl bg-surface-card border border-border-delicate flex flex-col">
            <span className="text-[10px] text-text-muted font-label-caps uppercase">Tổng phản hồi</span>
            <span className="text-base font-bold text-deep-espresso mt-0.5">{guests.length} khách</span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-card border border-emerald-200 bg-emerald-50/40 flex flex-col">
            <span className="text-[10px] text-emerald-800 font-label-caps uppercase font-semibold">Xác nhận dự</span>
            <span className="text-base font-bold text-emerald-900 mt-0.5">
              {attendingCount} ({totalAttendees} người)
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-card border border-amber-200 bg-amber-50/40 flex flex-col">
            <span className="text-[10px] text-amber-800 font-label-caps uppercase font-semibold">Chờ / Bận việc</span>
            <span className="text-base font-bold text-amber-900 mt-0.5">{pendingCount} chờ • {declinedCount} bận</span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-card border border-rose-200 bg-rose-50/40 flex flex-col">
            <span className="text-[10px] text-burgundy-wine font-label-caps uppercase font-semibold">Lời chúc mừng</span>
            <span className="text-base font-bold text-burgundy-wine mt-0.5">{wishes.length} lời chúc</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 pt-3 border-b border-border-delicate/80 bg-surface-card flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('guests')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'guests'
                ? 'border-burgundy-wine text-burgundy-wine'
                : 'border-transparent text-text-muted hover:text-deep-espresso'
            }`}
          >
            <Icon name="recent_actors" className="text-[16px]" />
            <span>Khách tham dự ({guests.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wishes')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'wishes'
                ? 'border-burgundy-wine text-burgundy-wine'
                : 'border-transparent text-text-muted hover:text-deep-espresso'
            }`}
          >
            <Icon name="favorite" className="text-[16px]" />
            <span>Lời chúc ({wishes.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'file'
                ? 'border-burgundy-wine text-burgundy-wine'
                : 'border-transparent text-text-muted hover:text-deep-espresso'
            }`}
          >
            <Icon name="attach_file" className="text-[16px]" />
            <span>Tệp Excel đính kèm</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* TAB 1: GUESTS TABLE */}
          {activeTab === 'guests' && (
            <div>
              {guests.length === 0 ? (
                <div className="py-12 text-center text-xs text-text-muted flex flex-col items-center justify-center gap-2">
                  <Icon name="person_off" className="text-[32px] text-text-muted/60" />
                  <span className="font-semibold text-deep-espresso text-sm">Chưa có khách phản hồi</span>
                  <span className="text-[11px] text-text-muted">Danh sách sẽ tự động hiển thị khi khách mời RSVP qua thiệp.</span>
                </div>
              ) : (
                <div className="overflow-x-auto border border-border-delicate rounded-xl bg-surface-card">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-surface-subtle border-b border-border-delicate text-text-muted font-label-caps text-[10px] uppercase">
                        <th className="py-2.5 px-3 font-semibold w-10 text-center">STT</th>
                        <th className="py-2.5 px-3 font-semibold">Khách mời</th>
                        <th className="py-2.5 px-3 font-semibold">Điện thoại</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Đi cùng</th>
                        <th className="py-2.5 px-3 font-semibold">Trạng thái RSVP</th>
                        <th className="py-2.5 px-3 font-semibold">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-delicate/60 text-deep-espresso">
                      {guests.map((g, idx) => (
                        <tr key={g.id} className="hover:bg-surface-subtle/50 transition-colors">
                          <td className="py-2 px-3 text-center text-text-muted">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold">
                            {g.name}
                            {g.tableNumber && (
                              <span className="block text-[10px] text-gold-foil font-normal">{g.tableNumber}</span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px]">{g.phone || '—'}</td>
                          <td className="py-2 px-3 text-center">
                            {g.companionCount > 0 ? (
                              <span className="font-semibold text-emerald-800">+{g.companionCount}</span>
                            ) : (
                              <span className="text-text-muted">Đi 1 mình</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-label-caps font-semibold border ${
                                g.rsvpStatus === 'attending'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : g.rsvpStatus === 'declined'
                                  ? 'bg-rose-50 text-burgundy-wine border-rose-200'
                                  : 'bg-amber-50 text-amber-900 border-amber-200'
                              }`}
                            >
                              {g.rsvpStatus === 'attending'
                                ? 'Tham dự'
                                : g.rsvpStatus === 'declined'
                                ? 'Bận việc'
                                : 'Chờ xác nhận'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-[11px] text-text-muted max-w-[160px] truncate" title={g.notes}>
                            {g.notes || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WISHES LIST */}
          {activeTab === 'wishes' && (
            <div className="space-y-2.5">
              {wishes.length === 0 ? (
                <div className="py-12 text-center text-xs text-text-muted flex flex-col items-center justify-center gap-2">
                  <Icon name="chat_bubble_outline" className="text-[32px] text-text-muted/60" />
                  <span className="font-semibold text-deep-espresso text-sm">Chưa có lời chúc nào</span>
                  <span className="text-[11px] text-text-muted">Các lời chúc của khách mời gửi qua thiệp sẽ xuất hiện ở đây.</span>
                </div>
              ) : (
                wishes.map((w) => (
                  <div
                    key={w.id}
                    className="p-3.5 rounded-xl bg-surface-card border border-border-delicate flex flex-col gap-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-deep-espresso text-xs">{w.senderName}</span>
                        {w.relationship && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-subtle text-text-muted font-medium border border-border-delicate">
                            {w.relationship}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-text-muted">
                          {w.createdAt ? formatDateTime(w.createdAt) : ''}
                        </span>
                        {onTogglePinWish && (
                          <button
                            type="button"
                            onClick={() => onTogglePinWish(w.id)}
                            className="text-gold-foil hover:scale-110 transition-transform p-0.5"
                            title={w.isPinned ? 'Bỏ ghim lời chúc' : 'Ghim lời chúc lên đầu'}
                          >
                            <Icon name={w.isPinned ? 'star' : 'star_outline'} className="text-[15px]" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-deep-espresso/90 leading-relaxed italic bg-surface-cream/50 p-2.5 rounded-lg border border-border-delicate/40">
                      "{w.message}"
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: FILE EXCEL INFO */}
          {activeTab === 'file' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-surface-card border border-border-delicate flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300 flex-shrink-0">
                    <Icon name="table_chart" className="text-[26px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-deep-espresso text-sm">
                      {exportData?.fileName || `Danh_Sach_Khach_Moi_Loi_Chuc_${orderId}.xlsx`}
                    </span>
                    <span className="text-xs text-text-muted mt-0.5">
                      Dung lượng: {exportData?.fileSize || '184 KB'}
                    </span>
                    <span className="text-[11px] text-text-muted mt-0.5">
                      Thời gian bàn giao: {exportData?.sentAt ? formatDateTime(exportData.sentAt) : 'Mới cập nhật'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onDownloadFile}
                  className="px-5 py-2.5 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Icon name="download" className="text-[18px]" />
                  <span>Tải file Excel này</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-subtle/80 border border-border-delicate text-xs text-text-muted leading-relaxed">
                <div className="flex items-center gap-1.5 text-deep-espresso font-semibold mb-1">
                  <Icon name="info" className="text-[16px] text-gold-foil" />
                  <span>Lưu ý xem file:</span>
                </div>
                File Excel tổng hợp toàn bộ danh sách khách xác nhận tham dự, số người đi cùng, ghi chú và lời chúc mừng hạnh phúc. Bạn có thể mở trực tiếp trên máy tính bằng Microsoft Excel, Google Sheets hoặc trên điện thoại.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-border-delicate/80 bg-surface-card flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-surface-subtle hover:bg-surface-cream text-deep-espresso text-xs font-semibold border border-border-delicate transition-colors"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={onDownloadFile}
            className="px-5 py-2 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Icon name="download" className="text-[16px]" />
            <span>Tải file Excel về máy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
