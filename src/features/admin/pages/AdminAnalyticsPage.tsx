import React, { useState } from 'react';
import { Icon } from '../../../components/common/Icon';
import { useOrders } from '../../../mocks/orderStore';
import { formatCurrency } from '../../../utils/formatters';

export const AdminAnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'traffic' | 'performance' | 'revenue'>('traffic');
  const orders = useOrders();

  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');
  const pendingOrders = orders.filter((o) => o.paymentStatus === 'pending_confirmation');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const avgOrderPrice = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;
  const onlineCount = orders.filter((o) => o.currentStage >= 5 || Boolean(o.invitationUrl)).length;
  const designingCount = orders.filter((o) => o.currentStage === 4).length;
  const completedCount = orders.filter((o) => o.currentStage === 8).length;
  const premiumCount = orders.filter((o) => o.category === 'premium' || o.price >= 79000).length;
  const premiumPercent = totalOrders > 0 ? Math.round((premiumCount / totalOrders) * 100) : 0;
  const paymentSuccessRate = totalOrders > 0 ? Math.round((paidOrders.length / totalOrders) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Title & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-label-caps text-xs text-emerald-800 font-bold uppercase tracking-wider">
              Dữ liệu vận hành &amp; Đo lường thời gian thực
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-deep-espresso">
            08. Phân Tích &amp; Báo Cáo Số Liệu
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-xl leading-relaxed">
            Giám sát trực tiếp lưu lượng truy cập thực tế qua Google Analytics 4, quản lý tiến độ thiệp đang online và doanh thu bán lẻ thời gian thực.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Icon name="open_in_new" className="text-[15px]" />
            <span>Google Analytics ↗</span>
          </a>
          <button
            onClick={() => alert(`Báo cáo tổng hợp: ${totalOrders} đơn hàng, doanh thu thực tế ${formatCurrency(totalRevenue)}.`)}
            className="px-4 py-2 rounded-full bg-surface-card hover:bg-surface-subtle text-deep-espresso border border-border-delicate text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Icon name="file_download" className="text-[16px] text-text-muted" />
            <span>Xuất số liệu</span>
          </button>
        </div>
      </div>

      {/* 3 Core Functional Tabs */}
      <div className="flex items-center gap-2 bg-surface-subtle p-1.5 rounded-2xl border border-border-delicate">
        <button
          type="button"
          onClick={() => setActiveTab('traffic')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'traffic'
              ? 'bg-surface-card text-burgundy-wine shadow-xs'
              : 'text-text-muted hover:text-deep-espresso'
          }`}
        >
          <Icon name="insights" className="text-[18px]" />
          <span>Lưu Lượng Web (GA4)</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
            Live GA4
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('performance')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'performance'
              ? 'bg-surface-card text-burgundy-wine shadow-xs'
              : 'text-text-muted hover:text-deep-espresso'
          }`}
        >
          <Icon name="mark_email_read" className="text-[18px]" />
          <span>Hiệu Suất Thiệp</span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container text-text-muted text-[10px] font-bold">
            {onlineCount} Online
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('revenue')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'revenue'
              ? 'bg-surface-card text-burgundy-wine shadow-xs'
              : 'text-text-muted hover:text-deep-espresso'
          }`}
        >
          <Icon name="payments" className="text-[18px]" />
          <span>Doanh Thu Thực Tế</span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container text-text-muted text-[10px] font-bold">
            {formatCurrency(totalRevenue)}
          </span>
        </button>
      </div>

      {/* TAB 1: WEBSITE TRAFFIC & GOOGLE ANALYTICS LIVE STREAM */}
      {activeTab === 'traffic' && (
        <div className="flex flex-col gap-5">
          {/* Live GA4 Status Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Icon name="sensors" className="text-2xl animate-pulse" />
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-emerald-950 text-sm">
                    Google Analytics 4 • Đo lường thời gian thực (Real-time Live)
                  </span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold">
                    G-Z2HW7GTQZK
                  </span>
                </div>
                <p className="text-xs text-emerald-800">
                  Thẻ Google Tag đã được kích hoạt trực tiếp trên toàn bộ website. Mọi lượt xem trang, thiết bị truy cập và nguồn giới thiệu được ghi nhận tự động.
                </p>
              </div>
            </div>
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shrink-0 inline-flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>Mở Báo cáo Thời gian thực (GA4)</span>
              <Icon name="open_in_new" className="text-[14px]" />
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate flex flex-col justify-between">
              <span className="text-[11px] text-text-muted uppercase font-label-caps">Tổng đơn phát sinh</span>
              <div className="font-serif text-2xl font-bold text-deep-espresso mt-2">
                {totalOrders} đơn
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1">Dữ liệu thời gian thực</span>
            </div>

            <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate flex flex-col justify-between">
              <span className="text-[11px] text-text-muted uppercase font-label-caps">Đơn đã thanh toán</span>
              <div className="font-serif text-2xl font-bold text-deep-espresso mt-2">
                {paidOrders.length} đơn
              </div>
              <span className="text-[11px] text-text-muted mt-1">Tỷ lệ {paymentSuccessRate}%</span>
            </div>

            <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate flex flex-col justify-between">
              <span className="text-[11px] text-text-muted uppercase font-label-caps">Chờ xác nhận CK</span>
              <div className="font-serif text-2xl font-bold text-amber-700 mt-2">
                {pendingOrders.length} đơn
              </div>
              <span className="text-[11px] text-amber-800 font-medium mt-1">Cần Admin phê duyệt</span>
            </div>

            <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate flex flex-col justify-between">
              <span className="text-[11px] text-text-muted uppercase font-label-caps">Mã luồng đo lường</span>
              <div className="font-mono text-base font-bold text-burgundy-wine mt-2">
                G-Z2HW7GTQZK
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1">Google Analytics 4 Live</span>
            </div>
          </div>

          <div className="bg-surface-card p-5 rounded-2xl border border-border-delicate flex flex-col gap-3">
            <h3 className="font-serif text-base font-bold text-deep-espresso">
              Hướng Dẫn Đo Lường Lưu Lượng Qua Google Analytics 4
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-deep-espresso">
              <div className="p-3 rounded-xl bg-surface-subtle/60 border border-border-delicate flex flex-col gap-1.5">
                <span className="font-bold flex items-center gap-1.5 text-burgundy-wine">
                  <Icon name="public" className="text-[16px]" />
                  1. Khách xem trang (Pageviews)
                </span>
                <p className="text-text-muted leading-relaxed">
                  Ghi nhận mỗi khi khách ghé thăm trang chủ, xem danh mục mẫu thiệp hoặc mở liên kết thiệp cưới cụ thể.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-surface-subtle/60 border border-border-delicate flex flex-col gap-1.5">
                <span className="font-bold flex items-center gap-1.5 text-burgundy-wine">
                  <Icon name="share" className="text-[16px]" />
                  2. Nguồn truy cập (Traffic Source)
                </span>
                <p className="text-text-muted leading-relaxed">
                  Phân loại lưu lượng khách đến từ Zalo, Facebook Messenger, tìm kiếm tự nhiên Google hoặc quét mã QR.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-surface-subtle/60 border border-border-delicate flex flex-col gap-1.5">
                <span className="font-bold flex items-center gap-1.5 text-burgundy-wine">
                  <Icon name="devices" className="text-[16px]" />
                  3. Thiết bị người dùng (Devices)
                </span>
                <p className="text-text-muted leading-relaxed">
                  Thống kê tỷ lệ khách mở thiệp bằng điện thoại iPhone, Android hoặc máy tính bảng để tối ưu hiển thị.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVITATION PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate">
              <span className="text-[11px] text-text-muted uppercase font-label-caps">Thiệp đang online</span>
              <div className="font-serif text-2xl font-bold text-deep-espresso mt-2">
                {onlineCount} bản
              </div>
              <span className="text-[11px] text-text-muted mt-1">Đã xuất bản liên kết công khai</span>
            </div>
            <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate">
              <span className="text-[11px] text-text-muted uppercase font-label-caps">Đang thiết kế (Stage 4)</span>
              <div className="font-serif text-2xl font-bold text-emerald-800 mt-2">
                {designingCount} bản thảo
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1">Cam kết hoàn thiện &le; 24h</span>
            </div>
            <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate">
              <span className="text-[11px] text-text-muted uppercase font-label-caps">Đã hoàn thành (Stage 8)</span>
              <div className="font-serif text-2xl font-bold text-gold-foil mt-2">
                {completedCount} đơn
              </div>
              <span className="text-[11px] text-text-muted mt-1">Bàn giao trọn gói thành công</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REVENUE */}
      {activeTab === 'revenue' && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate">
              <span className="text-[11px] text-text-muted uppercase font-label-caps">Tổng doanh thu thực tế</span>
              <div className="font-serif text-2xl font-bold text-burgundy-wine mt-2">
                {formatCurrency(totalRevenue)}
              </div>
              <span className="text-[11px] text-text-muted mt-1">{paidOrders.length} đơn đã thanh toán</span>
            </div>
            <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate">
              <span className="text-[11px] text-text-muted uppercase font-label-caps">Tổng số đơn hàng</span>
              <div className="font-serif text-2xl font-bold text-deep-espresso mt-2">
                {totalOrders} đơn
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1">{paidOrders.length} đã thanh toán ({paymentSuccessRate}%)</span>
            </div>
            <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate">
              <span className="text-[11px] text-text-muted uppercase font-label-caps">Giá trị trung bình / đơn</span>
              <div className="font-serif text-2xl font-bold text-deep-espresso mt-2">
                {formatCurrency(avgOrderPrice)}
              </div>
              <span className="text-[11px] text-gold-foil font-semibold mt-1">{premiumPercent}% chọn gói Cao cấp 79k</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
