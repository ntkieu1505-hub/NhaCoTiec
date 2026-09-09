import React, { useState } from 'react';
import { Icon } from '../../../components/common/Icon';
import { MOCK_WISHES } from '../../../mocks/index';
import { formatDateTime } from '../../../utils/formatters';

export const AdminWishesPage: React.FC = () => {
  const [wishes, setWishes] = useState(MOCK_WISHES);

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-deep-espresso">
            07. Kiểm Duyệt Lời Chúc (Guestbook)
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Kiểm duyệt và quản lý lưu bút ngày cưới gửi đến các cặp đôi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wishes.map((w) => (
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

              <button
                onClick={() => togglePin(w.id)}
                className="text-gold-foil hover:scale-110 transition-transform p-1"
                title={w.isPinned ? 'Bỏ ghim' : 'Ghim lời chúc'}
              >
                <Icon name={w.isPinned ? 'star' : 'star_outline'} className="text-[20px]" />
              </button>
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
    </div>
  );
};
