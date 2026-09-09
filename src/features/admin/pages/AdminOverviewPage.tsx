import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { useOrders } from '../../../mocks/orderStore';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { StatusChip } from '../../../components/common/StatusChip';
import { useActivityLogs } from '../../../services/activityLogService';

export const AdminOverviewPage: React.FC = () => {
  const orders = useOrders();
  const activityLogs = useActivityLogs(10);
  const pendingPayments = orders.filter((o) => o.paymentStatus === 'pending_confirmation');
  return (
    <div className="flex flex-col gap-8">
      {/* 1. Top Header & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="w-2 h-2 rounded-full bg-gold-foil animate-pulse"></span>
            <span className="font-label-caps uppercase tracking-wider text-burgundy-wine font-semibold">
              Bảng điều hành Nhà Có Tiệc
            </span>
            <span>·</span>
            <span>Dữ liệu thời gian thực (08/09/2026)</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-deep-espresso tracking-tight">
            01. Tổng quan Vận hành
          </h1>
          <p className="text-xs sm:text-sm text-text-muted max-w-2xl">
            Theo dõi nhịp độ kinh doanh, quản lý luồng thiệp cưới 8 giai đoạn và chuyển đổi lượt truy cập công khai của Nhà Có Tiệc Studio.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Đã xuất báo cáo tổng quan ngày (.xlsx)')}
            className="px-4 py-2 rounded-full bg-surface-card hover:bg-surface-subtle text-deep-espresso border border-border-delicate text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Icon name="file_download" className="text-[16px] text-text-muted" />
            <span>Xuất báo cáo</span>
          </button>
          <Link
            to="/admin/don-hang"
            className="px-5 py-2 rounded-full bg-burgundy-wine hover:bg-secondary text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Icon name="shopping_bag" className="text-[16px]" />
            <span>Quản lý đơn hàng</span>
          </Link>
        </div>
      </div>

      {/* 2. Priority Action Banner (Urgent SLA 2h/24h) */}
      <section className="relative overflow-hidden rounded-2xl bg-burgundy-wine text-white shadow-md p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3 relative z-10">
          <div className="p-2.5 rounded-full bg-surface-cream/10 text-gold-foil shrink-0 flex items-center justify-center">
            <Icon name="notification_important" className="text-[24px]" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-label-caps text-[10px] px-2 py-0.5 rounded-full bg-gold-foil/30 text-gold-foil font-bold uppercase tracking-wider">
                Yêu cầu ưu tiên cao
              </span>
              <span className="text-xs text-white/80 font-medium">SLA: Cần phản hồi trong vòng 2 giờ</span>
            </div>
            {pendingPayments.length > 0 ? (
              <p className="text-xs sm:text-sm text-surface-cream leading-snug">
                <strong>{pendingPayments.length} đơn hàng đang chờ xác nhận chuyển khoản:</strong>{' '}
                Mã {pendingPayments.map((p) => `#${p.id}`).join(', ')} đã gửi thông tin chuyển khoản, đang chờ Admin đối soát và phê duyệt để chuyển sang bước thiết kế.
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-surface-cream leading-snug">
                <strong>Hệ thống hoạt động ổn định:</strong> Tất cả các đơn hàng đều đang trong tiến trình xử lý bình thường theo cam kết SLA 24h.
              </p>
            )}
          </div>
        </div>

        {pendingPayments.length > 0 ? (
          <Link
            to="/admin/don-hang"
            className="relative z-10 px-5 py-2 rounded-full bg-surface-cream text-burgundy-wine hover:bg-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <span>Duyệt {pendingPayments.length} đơn chờ</span>
            <Icon name="arrow_forward" className="text-[16px]" />
          </Link>
        ) : (
          <Link
            to="/admin/don-hang"
            className="relative z-10 px-5 py-2 rounded-full bg-surface-cream text-burgundy-wine hover:bg-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <span>Xem đơn hàng</span>
            <Icon name="arrow_forward" className="text-[16px]" />
          </Link>
        )}
      </section>

      {/* 3. Executive Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="rounded-2xl bg-surface-card p-4 shadow-xs border border-border-delicate flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-[11px] text-text-muted uppercase">Đơn hàng hôm nay</span>
            <span className="p-1.5 rounded-full bg-surface-cream text-burgundy-wine">
              <Icon name="shopping_cart" className="text-[18px]" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold text-deep-espresso">12</span>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded-full">
                +4 đơn
              </span>
            </div>
            <p className="text-[11px] text-text-muted mt-1">100% thanh toán chuyển khoản</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl bg-surface-card p-4 shadow-xs border border-border-delicate flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-[11px] text-text-muted uppercase">Đang thiết kế</span>
            <span className="p-1.5 rounded-full bg-surface-subtle text-deep-espresso">
              <Icon name="draw" className="text-[18px]" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-2xl font-bold text-deep-espresso">6</span>
              <span className="text-xs text-text-muted">bản thảo</span>
            </div>
            <p className="text-[11px] text-text-muted mt-1">Cam kết hoàn thiện &le; 24h</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl bg-surface-card p-4 shadow-xs border border-border-delicate flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-[11px] text-text-muted uppercase">Thiệp đang online</span>
            <span className="p-1.5 rounded-full bg-surface-subtle text-gold-foil">
              <Icon name="mark_email_read" className="text-[18px]" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-2xl font-bold text-deep-espresso">48</span>
              <span className="text-xs text-text-muted">thiệp</span>
            </div>
            <p className="text-[11px] text-text-muted mt-1">Đang đón nhận phản hồi RSVP</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl bg-surface-card p-4 shadow-xs border border-border-delicate flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-[11px] text-text-muted uppercase">Doanh thu tháng</span>
            <span className="p-1.5 rounded-full bg-rose-50 text-burgundy-wine">
              <Icon name="payments" className="text-[18px]" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-2xl font-bold text-burgundy-wine">15.8M</span>
              <span className="text-[11px] text-text-muted">VNĐ</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">+18.4% so tháng trước</p>
          </div>
        </div>
      </div>

      {/* 4. Recent Orders Table */}
      <div className="bg-surface-card rounded-2xl p-5 shadow-xs border border-border-delicate flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-border-delicate">
          <div className="flex items-center gap-2">
            <Icon name="receipt_long" className="text-[20px] text-burgundy-wine" />
            <h2 className="font-serif text-lg font-bold text-deep-espresso">
              Đơn hàng gần đây (Luồng 8 giai đoạn)
            </h2>
          </div>
          <Link
            to="/admin/don-hang"
            className="text-xs text-burgundy-wine font-semibold hover:underline"
          >
            Xem tất cả &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-delicate text-text-muted font-label-caps uppercase text-[10px]">
                <th className="py-2.5 px-3">Mã đơn</th>
                <th className="py-2.5 px-3">Khách hàng</th>
                <th className="py-2.5 px-3">Mẫu thiệp</th>
                <th className="py-2.5 px-3">Giá trị</th>
                <th className="py-2.5 px-3">Trạng thái (1-8)</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-delicate">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-surface-subtle/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-deep-espresso">
                    #{ord.id}
                  </td>
                  <td className="py-3 px-3 font-medium text-deep-espresso">
                    {ord.customerName}
                    <div className="text-[11px] text-text-muted">{ord.customerPhone}</div>
                  </td>
                  <td className="py-3 px-3 text-deep-espresso">
                    {ord.templateName}
                  </td>
                  <td className="py-3 px-3 font-serif font-bold text-burgundy-wine">
                    {formatCurrency(ord.price)}
                  </td>
                  <td className="py-3 px-3">
                    <StatusChip stage={ord.currentStage} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      to={`/dashboard/don-hang/${ord.id}`}
                      className="px-3 py-1 rounded-full bg-surface-subtle hover:bg-surface-container-high text-deep-espresso text-xs font-semibold inline-flex items-center gap-1 border border-border-delicate"
                    >
                      <Icon name="visibility" className="text-[14px]" />
                      <span>Xem</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Real-time Activity Logs (Cloud Firestore) */}
      <div className="bg-surface-card rounded-2xl p-5 shadow-xs border border-border-delicate flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-border-delicate">
          <div className="flex items-center gap-2">
            <Icon name="history" className="text-[20px] text-burgundy-wine" />
            <h2 className="font-serif text-lg font-bold text-deep-espresso">
              Nhật ký hoạt động & Chỉnh sửa (Firebase Cloud Firestore)
            </h2>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Thời gian thực (Live Sync)</span>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-border-delicate">
          {activityLogs.length === 0 ? (
            <div className="py-6 text-center text-xs text-text-muted">
              Chưa có nhật ký hoạt động nào được ghi nhận.
            </div>
          ) : (
            activityLogs.map((log) => {
              const isCustomer = log.actorRole === 'customer';
              return (
                <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        log.type === 'order_created'
                          ? 'bg-blue-50 text-blue-700'
                          : log.type === 'payment_approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : log.type === 'payment_rejected'
                          ? 'bg-rose-50 text-rose-700'
                          : log.type === 'payment_submitted'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-surface-subtle text-deep-espresso'
                      }`}
                    >
                      <Icon
                        name={
                          log.type === 'order_created'
                            ? 'shopping_bag'
                            : log.type === 'payment_approved'
                            ? 'verified'
                            : log.type === 'payment_rejected'
                            ? 'cancel'
                            : log.type === 'payment_submitted'
                            ? 'payments'
                            : 'edit_note'
                        }
                        className="text-[18px]"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-deep-espresso">{log.title}</span>
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                            isCustomer
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-purple-50 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {log.actorName}
                        </span>
                        {log.orderId && (
                          <Link
                            to={`/admin/don-hang/${log.orderId}`}
                            className="font-mono font-bold text-burgundy-wine hover:underline"
                          >
                            #{log.orderId}
                          </Link>
                        )}
                      </div>
                      <p className="text-text-muted leading-relaxed">{log.description}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-text-muted shrink-0 whitespace-nowrap">
                    {formatDateTime(log.timestamp)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
