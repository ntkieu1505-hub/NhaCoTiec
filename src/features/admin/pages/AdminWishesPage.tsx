import React, { useState, useMemo } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { MOCK_WISHES } from '../../../mocks/index';
import { Wish } from '../../../types';
import { formatDateTime } from '../../../utils/formatters';
import { AdminOutletContext } from '../../../components/layouts/AdminLayout';

export const AdminWishesPage: React.FC = () => {
  const outletCtx = useOutletContext<AdminOutletContext>() || {};
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || outletCtx.searchQuery || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const [wishes, setWishes] = useState<Wish[]>(MOCK_WISHES);

  const toggleApproval = (id: string) => {
    setWishes(
      wishes.map((w) => (w.id === id ? { ...w, isApproved: !w.isApproved } : w))
    );
  };

  const togglePin = (id: string) => {
    setWishes(
      wishes.map((w) => (w.id === id ? { ...w, isPinned: !w.isPinned } : w))
    );
  };

  const deleteWish = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lời chúc này không?')) {
      setWishes(wishes.filter((w) => w.id !== id));
    }
  };

  const filteredWishes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return wishes;
    return wishes.filter(
      (w) =>
        w.senderName.toLowerCase().includes(q) ||
        w.message.toLowerCase().includes(q) ||
        w.orderId.toLowerCase().includes(q) ||
        (w.relationship && w.relationship.toLowerCase().includes(q))
    );
  }, [wishes, searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-deep-espresso">
            07. Kiểm Duyệt Lời Chúc (Guestbook)
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Kiểm duyệt và quản lý lưu bút ngày cưới gửi đến các cặp đôi (Đo lường thời gian thực)
          </p>
        </div>
      </div>

      {/* Real-time Search & Counter Bar */}
      <div className="bg-surface-card p-3 rounded-2xl border border-border-delicate flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên người gửi, nội dung lời chúc, mã đơn..."
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
            Hiển thị: <strong>{filteredWishes.length}</strong> / {wishes.length} lời chúc
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Realtime
          </span>
        </div>
      </div>

      {filteredWishes.length === 0 ? (
        <div className="p-12 text-center text-text-muted bg-surface-card rounded-2xl border border-border-delicate flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-full bg-surface-subtle flex items-center justify-center text-text-muted">
            <Icon name="chat_bubble_outline" className="text-[28px]" />
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <h3 className="font-serif font-bold text-base text-deep-espresso">
              Chưa có lời chúc mừng nào
            </h3>
            <p className="text-xs text-text-muted">
              Hệ thống đang hoạt động ở chế độ thời gian thực (0 dữ liệu giả định). Khi khách mời gửi lời chúc qua thiệp cưới trực tuyến, bạn có thể kiểm duyệt và ghim hiển thị ngay tại đây.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWishes.map((w) => (
            <div
              key={w.id}
              className="p-4 rounded-2xl bg-surface-card border border-border-delicate flex flex-col justify-between gap-3 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-deep-espresso text-sm">{w.senderName}</span>
                    {w.relationship && (
                      <span className="text-[10px] text-text-muted bg-surface-subtle px-1.5 py-0.2 rounded">
                        {w.relationship}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-text-muted">
                    Đơn #{w.orderId} • {formatDateTime(w.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePin(w.id)}
                    className="text-gold-foil hover:scale-110 transition-transform p-1"
                    title={w.isPinned ? 'Bỏ ghim' : 'Ghim lời chúc'}
                  >
                    <Icon name={w.isPinned ? 'star' : 'star_outline'} className="text-[20px]" />
                  </button>
                  <button
                    onClick={() => deleteWish(w.id)}
                    className="text-text-muted hover:text-rose-600 transition-colors p-1"
                    title="Xóa lời chúc"
                  >
                    <Icon name="delete" className="text-[18px]" />
                  </button>
                </div>
              </div>

              <p className="italic text-xs text-deep-espresso bg-surface-subtle/40 p-3 rounded-xl border border-border-delicate leading-relaxed">
                "{w.message}"
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-border-delicate text-xs">
                <span
                  className={`text-[11px] font-semibold ${
                    w.isApproved ? 'text-emerald-700' : 'text-amber-800'
                  }`}
                >
                  {w.isApproved ? '● Đã hiển thị trên thiệp' : '○ Tạm ẩn'}
                </span>

                <button
                  onClick={() => toggleApproval(w.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                    w.isApproved
                      ? 'bg-surface-subtle text-deep-espresso border-border-delicate hover:bg-surface-container-high'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  }`}
                >
                  {w.isApproved ? 'Ẩn lời chúc' : 'Duyệt hiển thị'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
