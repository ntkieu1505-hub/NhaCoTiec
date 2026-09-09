import React, { useState } from 'react';
import { Icon } from '../../../components/common/Icon';
import { useNotifications } from '../../../mocks/notificationStore';
import { NotificationType } from '../../../types/notification';

const MOCK_CUSTOMERS = [
  { id: '01', name: 'Nguyễn Minh Anh & Trần Đức Minh', orderId: 'NCT01' },
  { id: '02', name: 'Lê Hải Đăng & Vũ Mộc Trà', orderId: 'NCT02' },
  { id: '03', name: 'Phạm Hoàng Nam & Đỗ Thanh Thảo', orderId: 'NCT03' },
  { id: '04', name: 'Đỗ Quang Huy & Vũ Ngọc Lan', orderId: 'NCT04' },
];

const TYPE_CONFIG: Record<NotificationType, { label: string; icon: string; badgeClass: string }> = {
  payment: {
    label: 'Thanh toán',
    icon: 'payments',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  order: {
    label: 'Đơn hàng',
    icon: 'shopping_bag',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  design: {
    label: 'Thiết kế',
    icon: 'draw',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  revision: {
    label: 'Chỉnh sửa',
    icon: 'edit_note',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
  },
  invitation: {
    label: 'Thiệp cưới',
    icon: 'favorite',
    badgeClass: 'bg-rose-50 text-burgundy-wine border-rose-200',
  },
  guest: {
    label: 'Khách mời / Excel',
    icon: 'description',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  system: {
    label: 'Hệ thống',
    icon: 'notifications',
    badgeClass: 'bg-stone-100 text-deep-espresso border-stone-200',
  },
};

export const AdminNotificationsPage: React.FC = () => {
  const { notifications, createNotification, deleteNotification } = useNotifications();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedReadStatus, setSelectedReadStatus] = useState<string>('all');

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: '01',
    orderId: 'NCT01',
    title: '',
    message: '',
    type: 'payment' as NotificationType,
    actionUrl: '/dashboard/don-hang/NCT01',
  });
  const [successToast, setSuccessToast] = useState('');

  // Filtering
  const filteredNotifications = notifications.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.orderId && item.orderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.userId.includes(searchTerm);

    const matchType = selectedType === 'all' || item.type === selectedType;

    const matchRead =
      selectedReadStatus === 'all' ||
      (selectedReadStatus === 'read' && item.isRead) ||
      (selectedReadStatus === 'unread' && !item.isRead);

    return matchSearch && matchType && matchRead;
  });

  const handleCustomerChange = (userId: string) => {
    const matched = MOCK_CUSTOMERS.find((c) => c.id === userId);
    setFormData((prev) => ({
      ...prev,
      userId,
      orderId: matched?.orderId || '',
      actionUrl: matched ? `/dashboard/don-hang/${matched.orderId}` : '/dashboard',
    }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo.');
      return;
    }

    createNotification({
      userId: formData.userId,
      orderId: formData.orderId || undefined,
      title: formData.title.trim(),
      message: formData.message.trim(),
      type: formData.type,
      actionUrl: formData.actionUrl.trim() || undefined,
      isRead: false,
    });

    setIsCreateModalOpen(false);
    setFormData({
      userId: '01',
      orderId: 'NCT01',
      title: '',
      message: '',
      type: 'payment',
      actionUrl: '/dashboard/don-hang/NCT01',
    });

    setSuccessToast('Đã gửi thông báo đến Cổng Khách Hàng thành công!');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa thông báo này?')) {
      deleteNotification(id);
    }
  };

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* 1. Header with Title & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-label-caps text-xs text-burgundy-wine font-bold uppercase tracking-wider">
            Điều Phối Thông Báo • Cổng Khách Hàng
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-deep-espresso mt-1">
            Quản Lý Thông Báo Khách Hàng
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Theo dõi tình trạng gửi thông báo, tra cứu lịch sử đọc tin và chủ động tạo thông điệp điều phối đến dâu rể
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold shadow-md flex items-center gap-1.5 self-start sm:self-auto active:scale-95 transition-all"
        >
          <Icon name="add_alert" className="text-[17px]" />
          <span>+ Tạo thông báo</span>
        </button>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Icon name="check_circle" className="text-[18px] text-emerald-700" />
            <span>{successToast}</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">Real-time sync</span>
        </div>
      )}

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="font-label-caps text-[11px] uppercase">Tổng thông báo</span>
            <Icon name="notifications" className="text-[20px] text-burgundy-wine" />
          </div>
          <div className="font-serif text-2xl font-bold text-deep-espresso mt-2">
            {notifications.length}
          </div>
          <span className="text-[11px] text-text-muted mt-1">Đã lưu trữ hệ thống</span>
        </div>

        <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="font-label-caps text-[11px] uppercase">Chưa đọc</span>
            <Icon name="mark_email_unread" className="text-[20px] text-gold-foil" />
          </div>
          <div className="font-serif text-2xl font-bold text-deep-espresso mt-2">
            {unreadCount}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1">
            Đang chờ dâu rể xem
          </span>
        </div>

        <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="font-label-caps text-[11px] uppercase">Đã xem tin</span>
            <Icon name="drafts" className="text-[20px] text-emerald-700" />
          </div>
          <div className="font-serif text-2xl font-bold text-deep-espresso mt-2">
            {notifications.length - unreadCount}
          </div>
          <span className="text-[11px] text-text-muted mt-1">Tỷ lệ xem đạt 75%</span>
        </div>

        <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="font-label-caps text-[11px] uppercase">Tỷ lệ phát</span>
            <Icon name="verified" className="text-[20px] text-emerald-700" />
          </div>
          <div className="font-serif text-2xl font-bold text-emerald-800 mt-2">100%</div>
          <span className="text-[11px] text-text-muted mt-1">Không nghẽn mạng</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Icon
            name="search"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-text-muted"
          />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, nội dung, khách hàng, mã đơn (#NCT01)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-border-delicate text-xs text-deep-espresso focus:outline-none focus:border-burgundy-wine"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface border border-border-delicate text-xs text-deep-espresso font-medium focus:outline-none focus:border-burgundy-wine"
          >
            <option value="all">Tất cả loại tin</option>
            <option value="payment">Thanh toán</option>
            <option value="order">Đơn hàng</option>
            <option value="design">Thiết kế</option>
            <option value="revision">Chỉnh sửa</option>
            <option value="invitation">Thiệp cưới</option>
            <option value="guest">Khách mời / Excel</option>
            <option value="system">Hệ thống</option>
          </select>

          {/* Read Status Filter */}
          <select
            value={selectedReadStatus}
            onChange={(e) => setSelectedReadStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface border border-border-delicate text-xs text-deep-espresso font-medium focus:outline-none focus:border-burgundy-wine"
          >
            <option value="all">Mọi trạng thái đọc</option>
            <option value="unread">Chưa đọc</option>
            <option value="read">Đã đọc</option>
          </select>
        </div>
      </div>

      {/* 4. Notifications Table / List */}
      <div className="bg-surface-card rounded-2xl border border-border-delicate shadow-xs overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-text-muted flex flex-col items-center gap-2">
            <Icon name="notifications_off" className="text-[36px] text-text-muted/40" />
            <span className="text-xs">Không tìm thấy thông báo nào phù hợp với bộ lọc.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border-delicate text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <th className="py-3 px-4">Tiêu đề &amp; Nội dung</th>
                  <th className="py-3 px-4">Khách hàng / Đơn</th>
                  <th className="py-3 px-4">Loại thông báo</th>
                  <th className="py-3 px-4">Thời gian gửi</th>
                  <th className="py-3 px-4">Tình trạng đọc</th>
                  <th className="py-3 px-4">Phát hành</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-delicate text-xs text-deep-espresso">
                {filteredNotifications.map((item) => {
                  const typeMeta = TYPE_CONFIG[item.type] || TYPE_CONFIG.system;
                  const customer = MOCK_CUSTOMERS.find((c) => c.id === item.userId);

                  return (
                    <tr key={item.id} className="hover:bg-surface-subtle/50 transition-colors">
                      {/* Title & Message */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-sm">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-serif font-bold text-sm text-deep-espresso">
                            {item.title}
                          </span>
                          <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                            {item.message}
                          </p>
                          {item.actionUrl && (
                            <span className="text-[10px] text-burgundy-wine font-medium mt-0.5">
                              Đích đến: {item.actionUrl}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer & Order */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-deep-espresso">
                            {customer?.name || `Khách #${item.userId}`}
                          </span>
                          <span className="text-[11px] text-text-muted">
                            {item.orderId ? `Đơn: #${item.orderId}` : 'Không gắn đơn'}
                          </span>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${typeMeta.badgeClass}`}
                        >
                          <Icon name={typeMeta.icon} className="text-[14px]" />
                          <span>{typeMeta.label}</span>
                        </span>
                      </td>

                      {/* Created Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-text-muted">
                        {formatDateTime(item.createdAt)}
                      </td>

                      {/* Read Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.isRead ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                              <Icon name="done_all" className="text-[13px]" />
                              <span>Đã đọc</span>
                            </span>
                            {item.readAt && (
                              <span className="text-[10px] text-text-muted mt-0.5">
                                {formatDateTime(item.readAt)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-burgundy-wine bg-rose-50 px-2 py-0.5 rounded-full w-fit">
                            <Icon name="mark_email_unread" className="text-[13px]" />
                            <span>Chưa đọc</span>
                          </span>
                        )}
                      </td>

                      {/* Delivery status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <Icon name="check_circle" className="text-[14px]" />
                          <span>Đã gửi</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-700 transition-colors"
                          title="Xóa thông báo"
                        >
                          <Icon name="delete" className="text-[17px]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Create Notification Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-deep-espresso/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card rounded-2xl max-w-lg w-full p-6 border border-border-delicate shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border-delicate">
              <div className="flex items-center gap-2">
                <Icon name="add_alert" className="text-[20px] text-burgundy-wine" />
                <h3 className="font-serif text-lg font-bold text-deep-espresso">
                  Gửi Thông Báo Mới Đến Khách Hàng
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-subtle text-text-muted"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              {/* Select Customer */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-deep-espresso">
                  Khách hàng nhận thông báo <span className="text-burgundy-wine">*</span>
                </label>
                <select
                  value={formData.userId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-delicate bg-surface text-xs text-deep-espresso font-medium focus:outline-none focus:border-burgundy-wine"
                >
                  {MOCK_CUSTOMERS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Đơn #{c.orderId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Mã đơn hàng</label>
                  <input
                    type="text"
                    value={formData.orderId}
                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                    placeholder="VD: NCT01"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-delicate bg-surface text-xs text-deep-espresso focus:outline-none focus:border-burgundy-wine"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">
                    Loại thông báo <span className="text-burgundy-wine">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as NotificationType })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-delicate bg-surface text-xs text-deep-espresso font-medium focus:outline-none focus:border-burgundy-wine"
                  >
                    <option value="payment">Thanh toán</option>
                    <option value="order">Đơn hàng</option>
                    <option value="design">Thiết kế</option>
                    <option value="revision">Chỉnh sửa</option>
                    <option value="invitation">Thiệp cưới</option>
                    <option value="guest">Khách mời / Excel</option>
                    <option value="system">Hệ thống</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-deep-espresso">
                  Tiêu đề thông báo <span className="text-burgundy-wine">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Thiệp đã bàn giao / Thanh toán đã xác nhận"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-delicate bg-surface text-xs text-deep-espresso font-serif font-bold focus:outline-none focus:border-burgundy-wine"
                  required
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-deep-espresso">
                  Nội dung chi tiết <span className="text-burgundy-wine">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Nội dung gửi đến cặp đôi dâu rể..."
                  className="w-full p-3 rounded-xl border border-border-delicate bg-surface text-xs text-deep-espresso resize-none focus:outline-none focus:border-burgundy-wine leading-relaxed"
                  required
                />
              </div>

              {/* Destination URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-deep-espresso">
                  Đường dẫn điều hướng khi click (Action URL)
                </label>
                <input
                  type="text"
                  value={formData.actionUrl}
                  onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                  placeholder="VD: /dashboard/don-hang/NCT01 hoặc /dashboard#invitations"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-delicate bg-surface text-xs text-deep-espresso focus:outline-none focus:border-burgundy-wine"
                />
                <span className="text-[11px] text-text-muted">
                  Gợi ý: <code>/dashboard/don-hang/NCT01</code> (Chi tiết đơn), <code>/dashboard#invitations</code> (Thiệp của tôi)
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-delicate">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-surface-subtle hover:bg-surface-container-high text-deep-espresso text-xs font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Icon name="send" className="text-[16px]" />
                  <span>Gửi thông báo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
