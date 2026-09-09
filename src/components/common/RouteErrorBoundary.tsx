import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import { Icon } from './Icon';

export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError() as any;
  console.error('Route error caught:', error);

  const handleResetCache = () => {
    try {
      localStorage.removeItem('nha_co_tiec_orders_v6');
      localStorage.removeItem('nha_co_tiec_activity_logs_v1');
    } catch {}
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-base">
      <div className="max-w-md w-full bg-surface-card rounded-2xl p-6 shadow-md border border-border-delicate text-center flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-burgundy-wine flex items-center justify-center shadow-xs">
          <Icon name="error_outline" className="text-3xl" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold text-deep-espresso">
            Đã xảy ra sự cố khi tải trang
          </h2>
          <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
            Hệ thống phát hiện lỗi hiển thị. Bạn có thể tải lại trang hoặc làm mới bộ nhớ cache để tiếp tục thao tác bình thường.
          </p>
        </div>

        {error?.message && (
          <div className="w-full p-2.5 rounded-lg bg-surface-subtle text-[11px] font-mono text-rose-800 text-left overflow-x-auto border border-border-delicate">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full mt-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full h-10 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Icon name="refresh" className="text-[16px]" />
            <span>Tải lại trang</span>
          </button>
          <button
            type="button"
            onClick={handleResetCache}
            className="w-full h-10 rounded-full bg-surface-subtle hover:bg-surface-container-high text-deep-espresso border border-border-delicate text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Icon name="cleaning_services" className="text-[16px]" />
            <span>Làm mới cache</span>
          </button>
        </div>

        <Link
          to="/"
          className="text-xs text-burgundy-wine hover:underline flex items-center gap-1 mt-1 font-medium"
        >
          <Icon name="arrow_back" className="text-[14px]" />
          <span>Quay về trang chủ</span>
        </Link>
      </div>
    </div>
  );
};
