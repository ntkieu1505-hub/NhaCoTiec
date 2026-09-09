import React, { useState } from 'react';
import { Icon } from '../../../components/common/Icon';
import { MOCK_ANALYTICS } from '../../../mocks/index';
import { formatCurrency } from '../../../utils/formatters';

export const AdminAnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'traffic' | 'performance' | 'revenue'>('traffic');

  return (
    <div className="flex flex-col gap-6">
      {/* Title & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-label-caps text-xs text-burgundy-wine font-bold uppercase tracking-wider">
            Mục 08 • Báo Cáo Chuyên Sâu
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-deep-espresso mt-1">
            08. Phân Tích &amp; Báo Cáo Số Liệu
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-xl leading-relaxed">
            Theo dõi lưu lượng truy cập website, hiệu suất lan tỏa của 48 thiệp cưới đang hoạt động và chuyển đổi doanh thu bán lẻ thời gian thực.
          </p>
        </div>

        <button
          onClick={() => alert('Đã xuất báo cáo PDF / Excel')}
          className="px-4 py-2 rounded-full bg-burgundy-wine text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
        >
          <Icon name="file_download" className="text-[16px]" />
          <span>Xuất báo cáo</span>
        </button>
      </div>

      {/* 3 Core Functional Tabs (Stitch Aligned) */}
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
          <span>Website Traffic &amp; Khách</span>
          <span className="px-1.5 py-0.2 rounded-full bg-surface-subtle text-burgundy-wine text-[10px] font-bold">
            42.8k
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
          <span>Hiệu Suất Thiệp Cưới</span>
          <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-text-muted text-[10px]">
            48 Live
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
          <span>Doanh Thu &amp; Bán Lẻ</span>
          <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-text-muted text-[10px]">
            15.8M
          </span>
        </button>
      </div>

      {/* TAB 1: WEBSITE TRAFFIC */}
      {activeTab === 'traffic' && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate flex flex-col justify-between">
              <span className="text-[11px] text-text-muted uppercase font-label-caps">Tổng khách truy cập</span>
              <div className="font-serif text-2xl font-bold text-deep-espresso mt-2">
                {MOCK_ANALYTICS.totalVisitors.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1">+18.4% so tháng trước</span>
            </div>

            <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate flex flex-col justify-between">
              <span className="text-[11px] text-text-muted uppercase font-label-caps">Số phiên truy cập</span>
              <div className="font-serif text-2xl font-bold text-deep-espresso mt-2">
                {MOCK_ANALYTICS.totalSessions.toLocaleString()}
              </div>
              <span className="text-[11px] text-text-muted mt-1">1.36 phiên / khách</span>
            </div>

            <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate flex flex-col justify-between">
              <span className="text-[11px] text-text-muted uppercase font-label-caps">Lượt xem trang</span>
              <div className="font-serif text-2xl font-bold text-deep-espresso mt-2">
                {MOCK_ANALYTICS.totalPageViews.toLocaleString()}
              </div>
              <span className="text-[11px] text-text-muted mt-1">2.8 trang / phiên</span>
            </div>

            <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate flex flex-col justify-between">
              <span className="text-[11px] text-text-muted uppercase font-label-caps">Thời gian phiên TB</span>
              <div className="font-serif text-2xl font-bold text-burgundy-wine mt-2">
                {MOCK_ANALYTICS.avgDuration}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1">+28s thử demo nhạc</span>
            </div>
          </div>

          <div className="bg-surface-card p-5 rounded-2xl border border-border-delicate">
            <h3 className="font-serif text-base font-bold text-deep-espresso mb-2">
              Nguồn Lưu Lượng Truy Cập Chính
            </h3>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border-delicate">
                <span>Khách mời xem thiệp (Zalo / Messenger)</span>
                <span className="font-semibold">68.4% (29,300 lượt)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-delicate">
                <span>Tìm kiếm Google tự nhiên (SEO)</span>
                <span className="font-semibold">18.2% (7,800 lượt)</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Truy cập trực tiếp (Direct)</span>
                <span className="font-semibold">13.4% (5,750 lượt)</span>
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
              <div className="font-serif text-2xl font-bold text-deep-espresso mt-2">48 bản</div>
              <span className="text-[11px] text-text-muted mt-1">100% hoạt động mượt mà</span>
            </div>
            <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate">
              <span className="text-[11px] text-text-muted uppercase font-label-caps">Tỷ lệ phản hồi RSVP</span>
              <div className="font-serif text-2xl font-bold text-emerald-800 mt-2">78.4%</div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1">Hiệu quả cao hơn thiệp giấy</span>
            </div>
            <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate">
              <span className="text-[11px] text-text-muted uppercase font-label-caps">Lời chúc gửi vào</span>
              <div className="font-serif text-2xl font-bold text-gold-foil mt-2">1,248</div>
              <span className="text-[11px] text-text-muted mt-1">Được lưu giữ kỷ niệm</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REVENUE */}
      {activeTab === 'revenue' && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate">
              <span className="text-[11px] text-text-muted uppercase font-label-caps">Tổng doanh thu bán lẻ</span>
              <div className="font-serif text-2xl font-bold text-burgundy-wine mt-2">
                {formatCurrency(MOCK_ANALYTICS.totalRevenue)}
              </div>
              <span className="text-[11px] text-text-muted mt-1">Mô hình bán lẻ sản phẩm (50k - 100k)</span>
            </div>
            <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate">
              <span className="text-[11px] text-text-muted uppercase font-label-caps">Tổng số đơn hàng</span>
              <div className="font-serif text-2xl font-bold text-deep-espresso mt-2">
                {MOCK_ANALYTICS.orderCount} đơn
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1">100% chuyển khoản QR</span>
            </div>
            <div className="bg-surface-card p-4 rounded-2xl border border-border-delicate">
              <span className="text-[11px] text-text-muted uppercase font-label-caps">Giá trị trung bình / đơn</span>
              <div className="font-serif text-2xl font-bold text-deep-espresso mt-2">
                {formatCurrency(86800)}
              </div>
              <span className="text-[11px] text-gold-foil font-semibold mt-1">73% chọn gói Cao cấp 100k</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
