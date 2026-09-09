import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { StatusChip } from '../../../components/common/StatusChip';
import {
  useOrders,
  adminConfirmPayment,
  adminRejectPayment,
  adminAdvanceStage,
  resetOrders
} from '../../../mocks/orderStore';
import { ORDER_STAGES, PAYMENT_STATUS_META, BANK_INFO } from '../../../utils/constants';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { OrderStatusStage } from '../../../types/order';

export const AdminOrdersPage: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<number | 'all'>('all');
  const orders = useOrders();

  const filteredOrders = selectedStage === 'all'
    ? orders
    : orders.filter((o) => o.currentStage === selectedStage);

  const pendingConfirmations = orders.filter((o) => o.paymentStatus === 'pending_confirmation');

  const handleQuickAdvance = (orderId: string, current: OrderStatusStage) => {
    if (current < 8) {
      const next = (current + 1) as OrderStatusStage;
      adminAdvanceStage(orderId, next);
    }
  };

  const handleReject = (orderId: string) => {
    const reason = window.prompt(
      'Nhập nội dung/lý do yêu cầu khách kiểm tra lại thanh toán:',
      'Số tiền hoặc nội dung chuyển khoản chưa trùng khớp, vui lòng kiểm tra lại sao kê hoặc gửi lại ảnh biên lai.'
    );
    if (reason !== null) {
      adminRejectPayment(orderId, reason.trim() || undefined);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="font-label-caps uppercase tracking-wider text-burgundy-wine font-semibold">
              Hệ thống vận hành
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-deep-espresso mt-0.5">
            02. Quản Lý Đơn Hàng
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Điều phối và giám sát đơn hàng theo quy trình 8 bước chuẩn &amp; kiểm soát giao dịch chuyển khoản ngân hàng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Đặt lại toàn bộ dữ liệu đơn hàng về trạng thái mẫu ban đầu?')) {
                resetOrders();
              }
            }}
            className="px-3 py-2 rounded-full bg-surface-card hover:bg-surface-subtle text-text-muted border border-border-delicate text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
            title="Đặt lại dữ liệu mẫu để thử nghiệm quy trình từ đầu"
          >
            <Icon name="refresh" className="text-[15px]" />
            <span>Đặt lại mẫu</span>
          </button>
          <button
            type="button"
            onClick={() => alert('Xuất danh sách đơn hàng ra file Excel')}
            className="px-4 py-2 rounded-full bg-surface-card hover:bg-surface-subtle text-deep-espresso border border-border-delicate text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Icon name="file_download" className="text-[16px] text-text-muted" />
            <span>Xuất danh sách</span>
          </button>
        </div>
      </div>

      {/* DEDICATED ADMIN FLOW SECTION: ĐANG CHỜ XÁC NHẬN THANH TOÁN */}
      {pendingConfirmations.length > 0 && (
        <section className="bg-amber-50/80 border-2 border-amber-300/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Icon name="hourglass_top" className="text-[18px]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-label-caps text-[10px] font-bold text-amber-950 uppercase tracking-wider bg-amber-200 px-2 py-0.5 rounded-full border border-amber-300">
                    Cần Admin xác nhận
                  </span>
                  <span className="text-xs text-amber-900 font-semibold">
                    {pendingConfirmations.length} yêu cầu chuyển khoản chờ duyệt
                  </span>
                </div>
                <h2 className="font-serif text-base font-bold text-deep-espresso mt-0.5">
                  Khách hàng đã gửi xác nhận chuyển khoản ngân hàng
                </h2>
              </div>
            </div>
            <span className="text-[11px] text-amber-800 font-medium">
              Khách hàng chưa thể tự đánh dấu đơn là Đã thanh toán
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingConfirmations.map((ord) => (
              <div
                key={ord.id}
                className="bg-surface-card rounded-xl p-4 border border-amber-200 shadow-2xs flex flex-col justify-between gap-3"
              >
                <div className="flex flex-col gap-2.5">
                  {/* Row 1: Code & Price */}
                  <div className="flex items-center justify-between border-b border-border-delicate pb-2">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/don-hang/${ord.id}`}
                        className="font-mono font-bold text-burgundy-wine text-sm hover:underline"
                        title="Xem chi tiết đơn hàng"
                      >
                        #{ord.id}
                      </Link>
                      <span className="text-xs text-text-muted font-medium">({ord.templateName})</span>
                    </div>
                    <span className="font-serif font-bold text-burgundy-wine text-base">
                      {formatCurrency(ord.price)}
                    </span>
                  </div>

                  {/* Row 2: Customer & Submission Time */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[11px] text-text-muted block">Khách hàng:</span>
                      <span className="font-medium text-deep-espresso block">
                        {typeof ord.customerName === 'string' ? ord.customerName : 'Khách hàng'}
                      </span>
                      <span className="text-[10px] text-text-muted block">
                        {typeof ord.customerPhone === 'string' ? ord.customerPhone : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-text-muted block">Thời gian gửi xác nhận:</span>
                      <span className="font-medium text-deep-espresso block">
                        {formatDateTime(ord.paymentSubmissionTime || ord.updatedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Row 3: Payment Info, Note, Proof */}
                  <div className="p-2.5 rounded-lg bg-surface-subtle/80 text-[11px] flex flex-col gap-1.5 border border-border-delicate">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Thông tin thụ hưởng:</span>
                      <span className="font-mono font-semibold text-deep-espresso">
                        {BANK_INFO.bankName} • {BANK_INFO.accountNumber} ({BANK_INFO.accountHolder})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Nội dung chuyển khoản chuẩn:</span>
                      <span className="font-mono font-bold text-burgundy-wine">#{ord.id}</span>
                    </div>
                    {ord.paymentNote && (
                      <div className="pt-1 border-t border-border-delicate/60 flex flex-col">
                        <span className="text-text-muted">Ghi chú từ khách:</span>
                        <span className="text-deep-espresso italic">"{ord.paymentNote}"</span>
                      </div>
                    )}
                    {ord.paymentProof && (
                      <div className="flex items-center gap-1.5 mt-0.5 text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                        <Icon name="attach_file" className="text-[14px]" />
                        <span>Bằng chứng giao dịch: <strong>{ord.paymentProof}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 4: 2 Admin Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-border-delicate">
                  <button
                    type="button"
                    onClick={() => adminConfirmPayment(ord.id)}
                    className="flex-1 h-9 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Icon name="check_circle" className="text-[16px]" />
                    <span>Xác nhận thanh toán</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(ord.id)}
                    className="px-3.5 h-9 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    title="Yêu cầu khách hàng kiểm tra lại giao dịch"
                  >
                    <Icon name="cancel" className="text-[15px]" />
                    <span>Yêu cầu kiểm tra lại</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8-Stage Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedStage('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            selectedStage === 'all'
              ? 'bg-burgundy-wine text-white shadow-xs'
              : 'bg-surface-card text-deep-espresso border border-border-delicate hover:bg-surface-subtle'
          }`}
        >
          Tất cả ({orders.length})
        </button>
        {([1, 2, 3, 4, 5, 6, 7, 8] as OrderStatusStage[]).map((stg) => {
          const count = orders.filter((o) => o.currentStage === stg).length;
          return (
            <button
              key={stg}
              onClick={() => setSelectedStage(stg)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                selectedStage === stg
                  ? 'bg-burgundy-wine text-white shadow-xs'
                  : 'bg-surface-card text-deep-espresso border border-border-delicate hover:bg-surface-subtle'
              }`}
            >
              <span>{stg}. {ORDER_STAGES[stg].name}</span>
              {count > 0 && (
                <span className="w-4 h-4 rounded-full bg-surface-subtle text-deep-espresso text-[9px] flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-surface-card rounded-2xl shadow-xs border border-border-delicate overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle/50 border-b border-border-delicate text-text-muted font-label-caps uppercase text-[10px]">
                <th className="py-3 px-4">Mã đơn</th>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Mẫu thiệp &amp; Giá</th>
                <th className="py-3 px-4">Thanh toán</th>
                <th className="py-3 px-4">Tiến trình (1-8)</th>
                <th className="py-3 px-4">Cập nhật lúc</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-delicate">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-surface-subtle/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-deep-espresso">
                    #{ord.id}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-deep-espresso">
                    <div>{typeof ord.customerName === 'string' ? ord.customerName : 'Khách hàng'}</div>
                    <div className="text-[11px] text-text-muted">{typeof ord.customerPhone === 'string' ? ord.customerPhone : ''}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-deep-espresso font-medium">{typeof ord.templateName === 'string' ? ord.templateName : 'Mẫu thiệp'}</div>
                    <div className="text-burgundy-wine font-serif font-bold text-xs">
                      {formatCurrency(ord.price)}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-label-caps text-[10px] px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                        PAYMENT_STATUS_META[ord.paymentStatus]?.colorClass || 'bg-surface-subtle text-text-muted border-border-delicate'
                      }`}
                    >
                      <Icon
                        name={PAYMENT_STATUS_META[ord.paymentStatus]?.icon || 'help'}
                        className="text-[12px]"
                      />
                      <span>{PAYMENT_STATUS_META[ord.paymentStatus]?.label || ord.paymentStatus}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusChip stage={ord.currentStage} />
                  </td>
                  <td className="py-3.5 px-4 text-text-muted text-[11px]">
                    {formatDateTime(ord.updatedAt)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {ord.paymentStatus === 'pending_confirmation' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => adminConfirmPayment(ord.id)}
                            className="px-2.5 py-1 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            title="Xác nhận thanh toán"
                          >
                            <Icon name="check" className="text-[14px]" />
                            <span>Duyệt</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(ord.id)}
                            className="px-2 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            title="Yêu cầu kiểm tra lại"
                          >
                            <Icon name="close" className="text-[14px]" />
                            <span>Từ chối</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuickAdvance(ord.id, ord.currentStage)}
                          disabled={ord.currentStage === 8 || ord.paymentStatus !== 'paid'}
                          className="px-2.5 py-1 rounded-full bg-surface-subtle hover:bg-surface-container-high text-deep-espresso text-[11px] font-medium border border-border-delicate disabled:opacity-30 disabled:cursor-not-allowed"
                          title={
                            ord.paymentStatus !== 'paid'
                              ? 'Chưa thể chuyển bước khi chưa thanh toán'
                              : 'Chuyển sang bước tiếp theo'
                          }
                        >
                          +1 Bước
                        </button>
                      )}
                      <Link
                        to={`/admin/don-hang/${ord.id}`}
                        className="px-3 py-1 rounded-full bg-burgundy-wine text-white text-[11px] font-semibold hover:bg-[#851622] transition-colors shadow-xs"
                      >
                        Chi tiết
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
