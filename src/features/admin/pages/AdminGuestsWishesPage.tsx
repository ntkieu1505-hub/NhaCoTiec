import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import {
  useOrders,
  adminUploadExcel,
  adminSendExcelToCustomer,
  useAllCustomerExports,
} from '../../../mocks/orderStore';
import { formatDateTime } from '../../../utils/formatters';
import { matchOrder, matchQuery } from '../../../utils/searchHelper';
import { AdminOutletContext } from '../../../components/layouts/AdminLayout';

export const AdminGuestsWishesPage: React.FC = () => {
  const outletCtx = useOutletContext<AdminOutletContext>() || {};
  const orders = useOrders();
  const allExports = useAllCustomerExports();

  // Filter & Search state
  const [selectedOrderId, setSelectedOrderId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(outletCtx.searchQuery || '');

  useEffect(() => {
    if (outletCtx.searchQuery !== undefined && outletCtx.searchQuery !== searchQuery) {
      setSearchQuery(outletCtx.searchQuery);
    }
  }, [outletCtx.searchQuery]);

  // Excel Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTargetOrderId, setUploadTargetOrderId] = useState<string>('NCT01');
  const [stagedFile, setStagedFile] = useState<{ name: string; size: string; fileObj?: File } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Send Confirmation Modal State
  const [isSendConfirmOpen, setIsSendConfirmOpen] = useState(false);
  const [sendTargetOrderId, setSendTargetOrderId] = useState<string>('NCT01');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Selected Order Object (if not 'all')
  const selectedOrder = useMemo(() => {
    if (selectedOrderId === 'all') return null;
    return orders.find((o) => o.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  // Excel Handover Statistics
  const excelStats = useMemo(() => {
    const totalOrders = orders.length;
    let sentCount = 0;
    let uploadedCount = 0;
    let draftCount = 0;

    orders.forEach((ord) => {
      const exp = allExports[ord.id];
      if (exp?.status === 'sent') {
        sentCount++;
      } else if (exp?.status === 'uploaded') {
        uploadedCount++;
      } else {
        draftCount++;
      }
    });

    return {
      totalOrders,
      sentCount,
      uploadedCount,
      draftCount,
    };
  }, [orders, allExports]);

  // Filtered Orders for the Table
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (selectedOrderId !== 'all' && ord.id !== selectedOrderId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        const exp = allExports[ord.id];
        const matchOrd = matchOrder(ord, q);
        const matchFile = matchQuery(exp?.fileName, q);
        if (!matchOrd && !matchFile) {
          return false;
        }
      }
      return true;
    });
  }, [orders, selectedOrderId, searchQuery, allExports]);

  // Handlers for Excel Upload
  const openUploadModal = (orderId: string) => {
    setUploadTargetOrderId(orderId);
    setStagedFile(null);
    setIsUploadModalOpen(true);
  };

  const handleFileSelect = (file: File) => {
    const ext = file.name.toLowerCase();
    if (!ext.endsWith('.xlsx') && !ext.endsWith('.xls') && !ext.endsWith('.csv')) {
      alert('Vui lòng chọn file định dạng Excel (.xlsx, .xls) hoặc .csv');
      return;
    }
    const sizeInKb = Math.round(file.size / 1024);
    const sizeStr = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`;
    setStagedFile({
      name: file.name,
      size: sizeStr,
      fileObj: file,
    });
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleConfirmUpload = () => {
    if (!stagedFile) {
      fileInputRef.current?.click();
      return;
    }
    setIsUploading(true);

    const onComplete = (fileDataUrl?: string) => {
      try {
        adminUploadExcel(uploadTargetOrderId, {
          fileName: stagedFile.name,
          fileSize: stagedFile.size,
          fileUrl: fileDataUrl,
          fileDataUrl: fileDataUrl,
        });
        setIsUploadModalOpen(false);
        setActionSuccessMessage(`Đã tải lên file "${stagedFile.name}" cho đơn hàng #${uploadTargetOrderId}!`);
        setTimeout(() => setActionSuccessMessage(null), 4000);
      } catch (err) {
        console.error('Lỗi khi tải file lên:', err);
        setIsUploadModalOpen(false);
        setActionSuccessMessage(`Đã cập nhật file "${stagedFile.name}" cho đơn hàng #${uploadTargetOrderId}!`);
        setTimeout(() => setActionSuccessMessage(null), 4000);
      } finally {
        setIsUploading(false);
        setStagedFile(null);
      }
    };

    if (stagedFile.fileObj) {
      const reader = new FileReader();
      reader.onload = () => {
        onComplete(reader.result as string);
      };
      reader.onerror = () => {
        onComplete(undefined);
      };
      reader.readAsDataURL(stagedFile.fileObj);
    } else {
      onComplete(undefined);
    }
  };

  // Handlers for Send Excel to Customer
  const openSendConfirmModal = (orderId: string) => {
    setSendTargetOrderId(orderId);
    setIsSendConfirmOpen(true);
  };

  const handleConfirmSend = () => {
    adminSendExcelToCustomer(sendTargetOrderId);
    setIsSendConfirmOpen(false);
    setActionSuccessMessage(`Đã gửi file Excel cho khách hàng đơn #${sendTargetOrderId}! Khách hàng có thể tải file ngay.`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  // Mock download excel handler
  const handleDownloadExcel = (fileName: string) => {
    const dummyContent = `Mã đơn hàng,Tên khách mời,Số điện thoại,Phản hồi,Người đi kèm,Ghi chú\nNCT01,Nguyễn Văn Tuấn,0908 123 456,Tham dự,1,Có 1 bé nhỏ 3 tuổi\n`;
    const blob = new Blob([dummyContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-subtle text-gold-foil font-label-caps text-[10px] tracking-widest uppercase font-semibold mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-foil"></span>
            Quản lý dữ liệu tiệc cưới • Chuyển giao file Excel
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-deep-espresso">
              06. Chuyển Giao File Excel
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-burgundy-wine/10 text-burgundy-wine font-label-caps text-[11px] font-bold">
              Khách mời &amp; Lời chúc
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1 max-w-2xl leading-relaxed">
            Quản lý tải lên, cập nhật và bàn giao file dữ liệu Excel tổng hợp khách tham dự (RSVP) &amp; lưu bút lời chúc cho từng đơn hàng của các cặp đôi.
          </p>
        </div>

        {/* Global Action: Download template */}
        <button
          type="button"
          onClick={() => handleDownloadExcel('file_mau_tong_hop_khach_moi_nha_co_tiec.xlsx')}
          className="px-4 py-2 rounded-full bg-surface-card hover:bg-surface-subtle text-deep-espresso border border-border-delicate text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
          title="Tải file Excel mẫu cấu trúc chuẩn của Nhà Có Tiệc"
        >
          <Icon name="file_download" className="text-[16px] text-text-muted" />
          <span>Tải file Excel mẫu</span>
        </button>
      </div>

      {/* Action Notification Alert (Fixed Floating Toast) */}
      {actionSuccessMessage && (
        <div className="fixed top-20 right-6 z-50 max-w-md p-4 rounded-2xl bg-emerald-800 text-white text-xs flex items-center justify-between gap-3 shadow-2xl border border-emerald-600 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-2.5">
            <Icon name="check_circle" className="text-[22px] text-emerald-200 flex-shrink-0" />
            <span className="font-semibold leading-relaxed">{actionSuccessMessage}</span>
          </div>
          <button
            onClick={() => setActionSuccessMessage(null)}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-emerald-700 transition-colors ml-2"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
      )}

      {/* 2. Filter & Search Bar */}
      <div className="bg-surface-card rounded-2xl p-4 shadow-xs border border-border-delicate flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Order Dropdown Filter */}
          <div className="md:col-span-5 flex flex-col gap-1">
            <label className="text-[10px] font-label-caps font-bold uppercase tracking-wider text-text-muted">
              Lọc theo đơn hàng
            </label>
            <div className="relative">
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full h-10 pl-3 pr-8 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-semibold text-deep-espresso appearance-none focus:outline-none focus:border-burgundy-wine focus:ring-1 focus:ring-burgundy-wine cursor-pointer"
              >
                <option value="all">Tất cả đơn hàng ({orders.length})</option>
                {orders.map((ord) => (
                  <option key={ord.id} value={ord.id}>
                    #{ord.id} — {ord.customerName} ({ord.weddingInfo ? `${ord.weddingInfo.groomName} & ${ord.weddingInfo.brideName}` : ord.templateName})
                  </option>
                ))}
              </select>
              <Icon
                name="arrow_drop_down"
                className="absolute right-2.5 top-2.5 text-[20px] text-text-muted pointer-events-none"
              />
            </div>
          </div>

          {/* Search Input */}
          <div className="md:col-span-7 flex flex-col gap-1">
            <label className="text-[10px] font-label-caps font-bold uppercase tracking-wider text-text-muted">
              Tìm kiếm nhanh (Khách mời, SĐT, Lời chúc, Bàn tiệc)
            </label>
            <div className="relative">
              <Icon
                name="search"
                className="absolute left-3 top-2.5 text-[18px] text-text-muted pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  outletCtx.setSearchQuery?.(e.target.value);
                }}
                placeholder="Nhập tên khách mời, số điện thoại hoặc từ khóa..."
                className="w-full h-10 pl-9 pr-8 rounded-xl bg-surface-subtle border border-border-delicate text-xs text-deep-espresso placeholder:text-text-muted/70 focus:outline-none focus:border-burgundy-wine focus:ring-1 focus:ring-burgundy-wine"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    outletCtx.setSearchQuery?.('');
                  }}
                  className="absolute right-2.5 top-2.5 text-text-muted hover:text-deep-espresso"
                >
                  <Icon name="close" className="text-[16px]" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Selected Order Summary Banner */}
        {selectedOrder && (
          <div className="mt-1 p-3 rounded-xl bg-surface-subtle/70 border border-border-delicate flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-burgundy-wine/10 text-burgundy-wine flex items-center justify-center font-serif font-bold text-xs">
                #{selectedOrder.id}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-deep-espresso text-xs">
                    {selectedOrder.customerName}
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-50 text-burgundy-wine font-medium border border-rose-200">
                    {selectedOrder.templateName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5">
                  <span>Cô dâu/Chú rể: <strong>{selectedOrder.weddingInfo ? `${selectedOrder.weddingInfo.groomName} & ${selectedOrder.weddingInfo.brideName}` : 'Chưa nhập'}</strong></span>
                  <span>•</span>
                  <span>SĐT: {selectedOrder.customerPhone}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setSelectedOrderId('all')}
                className="text-[11px] text-burgundy-wine hover:underline font-semibold flex items-center gap-1"
              >
                <Icon name="close" className="text-[14px]" />
                <span>Xem tất cả đơn hàng</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. KPI Summary Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Tổng đơn hàng */}
        <div className="p-4 rounded-2xl bg-surface-card border border-border-delicate flex flex-col justify-between gap-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-label-caps uppercase font-bold text-text-muted">
              Tổng đơn hàng
            </span>
            <div className="w-8 h-8 rounded-full bg-surface-subtle text-deep-espresso flex items-center justify-center">
              <Icon name="shopping_bag" className="text-[17px]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-serif text-2xl font-bold text-deep-espresso">
              {excelStats.totalOrders}
            </span>
            <span className="text-[11px] text-text-muted">hợp đồng tiệc</span>
          </div>
        </div>

        {/* Card 2: Đã bàn giao cho khách */}
        <div className="p-4 rounded-2xl bg-surface-card border border-border-delicate flex flex-col justify-between gap-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-label-caps uppercase font-bold text-emerald-800">
              Đã gửi khách hàng
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Icon name="check_circle" className="text-[17px]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-serif text-2xl font-bold text-emerald-800">
              {excelStats.sentCount}
            </span>
            <span className="text-[11px] text-emerald-700/80 font-medium">file hoàn tất</span>
          </div>
        </div>

        {/* Card 3: Đã tải lên (chờ gửi) */}
        <div className="p-4 rounded-2xl bg-surface-card border border-border-delicate flex flex-col justify-between gap-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-label-caps uppercase font-bold text-amber-900">
              Đã tải lên — chờ gửi
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Icon name="hourglass_top" className="text-[17px]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-serif text-2xl font-bold text-amber-900">
              {excelStats.uploadedCount}
            </span>
            <span className="text-[11px] text-amber-800/80 font-medium">file sẵn sàng</span>
          </div>
        </div>

        {/* Card 4: Chưa có file Excel */}
        <div className="p-4 rounded-2xl bg-surface-card border border-border-delicate flex flex-col justify-between gap-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-label-caps uppercase font-bold text-text-muted">
              Chưa có file
            </span>
            <div className="w-8 h-8 rounded-full bg-surface-subtle text-text-muted flex items-center justify-center border border-border-delicate">
              <Icon name="pending_actions" className="text-[17px]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-serif text-2xl font-bold text-deep-espresso">
              {excelStats.draftCount}
            </span>
            <span className="text-[11px] text-text-muted">chờ xuất dữ liệu</span>
          </div>
        </div>
      </div>

      {/* 4. MAIN EXCEL MANAGEMENT WORKFLOW */}
      <div className="flex flex-col gap-6">
            {/* Context Notice / Permission Rule Card */}
            <div className="p-4 rounded-xl bg-surface-subtle/80 border border-border-delicate text-xs flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold text-deep-espresso">
                <Icon name="verified_user" className="text-[18px] text-gold-foil" />
                <span>Quy tắc chuyển giao &amp; Phân quyền dữ liệu Excel:</span>
              </div>
              <p className="text-text-muted leading-relaxed">
                • <strong>Chưa có file</strong> hoặc <strong>Đã tải lên — chưa gửi khách</strong>: Phía Khách hàng hoàn toàn KHÔNG THỂ tải hay xem dữ liệu, màn hình hiển thị <em>"Đang chờ dữ liệu"</em>.<br />
                • <strong>Đã gửi khách hàng</strong>: Chỉ sau khi Admin bấm xác nhận <em>"Gửi khách hàng"</em>, file mới mở quyền cho cặp đôi tải về trên Cổng Khách Hàng.
              </p>
            </div>

            {/* IF A SINGLE ORDER IS SELECTED: Detailed Dedicated Box */}
            {selectedOrder ? (
              (() => {
                const exp = allExports[selectedOrder.id] || {
                  id: `exp-${selectedOrder.id}`,
                  orderId: selectedOrder.id,
                  fileName: `Danh_sach_khach_moi_${selectedOrder.id}.xlsx`,
                  fileUrl: '#',
                  fileSize: '2.4 MB',
                  status: 'draft',
                  deadline: '3 ngày trước ngày cưới',
                };

                return (
                  <div className="bg-surface-card rounded-2xl p-6 shadow-xs border border-border-delicate flex flex-col gap-5">
                    <div className="flex items-center justify-between pb-3 border-b border-border-delicate flex-wrap gap-2">
                      <div>
                        <span className="font-label-caps text-[10px] uppercase tracking-wider font-bold text-burgundy-wine block">
                          Quản lý file Excel cho đơn #{selectedOrder.id}
                        </span>
                        <h2 className="font-serif text-lg font-bold text-deep-espresso">
                          File Excel khách mời &amp; Lời chúc — {selectedOrder.customerName}
                        </h2>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {exp.status === 'sent' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-label-caps text-xs font-bold shadow-2xs">
                            <Icon name="check_circle" className="text-[15px] text-emerald-700" />
                            Đã gửi khách hàng
                          </span>
                        ) : exp.status === 'uploaded' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-label-caps text-xs font-bold shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            Đã tải lên — chưa gửi khách
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-subtle text-text-muted border border-border-delicate font-label-caps text-xs font-bold">
                            <Icon name="hourglass_empty" className="text-[15px]" />
                            Chưa có file
                          </span>
                        )}
                      </div>
                    </div>

                    {/* State 1: "Chưa có file" */}
                    {exp.status === 'draft' && (
                      <div className="border-2 border-dashed border-border-delicate rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center bg-surface-subtle/30">
                        <div className="w-14 h-14 rounded-full bg-surface-subtle text-text-muted flex items-center justify-center border border-border-delicate shadow-2xs">
                          <Icon name="upload_file" className="text-[28px]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-serif text-base font-bold text-deep-espresso">
                            Chưa có file Excel cho đơn này
                          </span>
                          <span className="text-xs text-text-muted mt-0.5">
                            Tải lên file tổng hợp khách mời và lời chúc để chuẩn bị bàn giao cho khách.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => openUploadModal(selectedOrder.id)}
                          className="mt-2 px-5 py-2.5 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
                        >
                          <Icon name="add" className="text-[18px]" />
                          <span>+ Upload Excel</span>
                        </button>
                      </div>
                    )}

                    {/* State 2: "Đã tải lên — chưa gửi khách" */}
                    {exp.status === 'uploaded' && (
                      <div className="flex flex-col gap-4">
                        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-300/80 text-xs flex items-center gap-2 text-amber-950 font-medium">
                          <Icon name="info" className="text-[18px] text-amber-700 flex-shrink-0" />
                          <span>
                            File đã được tải lên hệ thống. Khách hàng <strong>CHƯA THỂ THẤY HOẶC TẢI VỀ</strong>. Hãy kiểm tra kỹ trước khi bấm "Gửi khách hàng".
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-surface-subtle/70 border border-border-delicate flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center flex-shrink-0">
                              <Icon name="table_view" className="text-[24px]" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-deep-espresso text-sm truncate">
                                {exp.fileName}
                              </span>
                              <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                                <span>{exp.fileSize}</span>
                                <span>•</span>
                                <span>Upload: {exp.uploadedAt ? formatDateTime(exp.uploadedAt) : 'Vừa xong'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => openUploadModal(selectedOrder.id)}
                              className="px-4 py-2 rounded-full bg-surface-card hover:bg-surface-subtle text-deep-espresso border border-border-delicate text-xs font-semibold transition-colors"
                            >
                              Thay file
                            </button>
                            <button
                              type="button"
                              onClick={() => openSendConfirmModal(selectedOrder.id)}
                              className="px-5 py-2 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <Icon name="send" className="text-[16px]" />
                              <span>Gửi khách hàng</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* State 3: "Đã gửi khách hàng" */}
                    {exp.status === 'sent' && (
                      <div className="flex flex-col gap-4">
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs flex items-center gap-2 text-emerald-950 font-medium">
                          <Icon name="check_circle" className="text-[18px] text-emerald-700 flex-shrink-0" />
                          <span>
                            File đã được chuyển giao thành công! Khách hàng đang có quyền xem dữ liệu và tải file Excel trên Cổng Khách Hàng.
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-surface-subtle/70 border border-border-delicate flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center justify-center flex-shrink-0">
                              <Icon name="table_view" className="text-[24px]" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-deep-espresso text-sm truncate">
                                {exp.fileName}
                              </span>
                              <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                                <span>{exp.fileSize}</span>
                                <span>•</span>
                                <span>Đã gửi: {exp.sentAt ? formatDateTime(exp.sentAt) : '08/09/2026'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleDownloadExcel(exp.fileName || 'Danh_Sach_Khach_Moi.xlsx')}
                              className="px-4 py-2 rounded-full bg-surface-card hover:bg-surface-subtle text-deep-espresso border border-border-delicate text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <Icon name="download" className="text-[16px]" />
                              <span>Tải về thử</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openUploadModal(selectedOrder.id)}
                              className="px-4 py-2 rounded-full bg-surface-card hover:bg-surface-subtle text-deep-espresso border border-border-delicate text-xs font-semibold transition-colors"
                            >
                              Thay file
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              /* IF "ALL ORDERS" IS SELECTED: Global Overview Table of All Excel Files */
              <div className="bg-surface-card rounded-2xl shadow-xs border border-border-delicate overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border-delicate flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="font-serif text-base font-bold text-deep-espresso">
                      Tình trạng chuyển giao file Excel ({filteredOrders.length} đơn hàng)
                    </h2>
                    <p className="text-xs text-text-muted">
                      Theo dõi và thực hiện thao tác tải lên hoặc bàn giao file cho từng cặp đôi
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-surface-subtle/60 border-b border-border-delicate text-text-muted font-label-caps uppercase text-[10px]">
                        <th className="py-3 px-4">Đơn hàng</th>
                        <th className="py-3 px-4">Khách hàng</th>
                        <th className="py-3 px-4">Trạng thái Excel</th>
                        <th className="py-3 px-4">Tên file</th>
                        <th className="py-3 px-4">Dung lượng</th>
                        <th className="py-3 px-4">Thời gian</th>
                        <th className="py-3 px-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-delicate">
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((ord) => {
                          const exp = allExports[ord.id] || {
                            id: `exp-${ord.id}`,
                            orderId: ord.id,
                            fileName: `Danh_sach_khach_moi_${ord.id}.xlsx`,
                            fileUrl: '#',
                            fileSize: '—',
                            status: 'draft',
                            deadline: '3 ngày trước ngày cưới',
                          };

                          return (
                            <tr key={ord.id} className="hover:bg-surface-subtle/30 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-burgundy-wine">
                                #{ord.id}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-deep-espresso">{ord.customerName}</div>
                                <span className="text-[10px] text-text-muted">{ord.templateName}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                {exp.status === 'sent' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold font-label-caps">
                                    <Icon name="check_circle" className="text-[12px]" />
                                    Đã gửi khách hàng
                                  </span>
                                ) : exp.status === 'uploaded' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold font-label-caps">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                    Đã tải lên — chưa gửi
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-subtle text-text-muted border border-border-delicate text-[10px] font-bold font-label-caps">
                                    Chưa có file
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-deep-espresso truncate max-w-xs">
                                {exp.status === 'draft' ? '—' : exp.fileName}
                              </td>
                              <td className="py-3.5 px-4 text-text-muted">
                                {exp.status === 'draft' ? '—' : exp.fileSize}
                              </td>
                              <td className="py-3.5 px-4 text-[11px] text-text-muted">
                                {exp.sentAt
                                  ? `Gửi: ${formatDateTime(exp.sentAt)}`
                                  : exp.uploadedAt
                                  ? `Tải: ${formatDateTime(exp.uploadedAt)}`
                                  : '—'}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {exp.status === 'draft' ? (
                                    <button
                                      type="button"
                                      onClick={() => openUploadModal(ord.id)}
                                      className="px-2.5 py-1 rounded-full bg-burgundy-wine text-white text-[11px] font-semibold hover:bg-[#851622] transition-colors"
                                    >
                                      + Upload
                                    </button>
                                  ) : exp.status === 'uploaded' ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => openUploadModal(ord.id)}
                                        className="px-2 py-1 rounded-full bg-surface-subtle text-deep-espresso border border-border-delicate text-[11px] font-medium hover:bg-surface-cream"
                                      >
                                        Thay file
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => openSendConfirmModal(ord.id)}
                                        className="px-2.5 py-1 rounded-full bg-burgundy-wine text-white text-[11px] font-semibold hover:bg-[#851622] transition-colors"
                                      >
                                        Gửi khách
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadExcel(exp.fileName || 'Danh_Sach_Khach_Moi.xlsx')}
                                        className="p-1 text-text-muted hover:text-deep-espresso"
                                        title="Tải file"
                                      >
                                        <Icon name="download" className="text-[16px]" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => openUploadModal(ord.id)}
                                        className="px-2 py-1 rounded-full bg-surface-subtle text-deep-espresso border border-border-delicate text-[11px] font-medium hover:bg-surface-cream"
                                      >
                                        Thay file
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-xs text-text-muted">
                            Không tìm thấy đơn hàng nào phù hợp với từ khóa &quot;{searchQuery}&quot;.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

      {/* ==================================================================== */}
      {/* MODAL 1: UPLOAD EXCEL INTERFACE */}
      {/* ==================================================================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-deep-espresso/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-card rounded-2xl max-w-md w-full p-6 shadow-xl border border-border-delicate flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-border-delicate">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Icon name="upload_file" className="text-[20px]" />
                </div>
                <h3 className="font-serif font-bold text-deep-espresso text-base">
                  Upload file Excel dữ liệu
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-text-muted hover:text-deep-espresso"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>

            <p className="text-xs text-text-muted">
              Tải lên file Excel tổng hợp cho đơn hàng <strong>#{uploadTargetOrderId}</strong>. File hỗ trợ: <code>.xlsx</code>, <code>.xls</code>, <code>.csv</code>.
            </p>

            {/* Hidden native file input placed OUTSIDE the clickable dropzone to prevent recursive bubbling / double invocation */}
            <input
              type="file"
              ref={fileInputRef}
              onClick={(e) => {
                (e.target as HTMLInputElement).value = '';
              }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileSelect(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-burgundy-wine bg-burgundy-wine/5 ring-4 ring-burgundy-wine/10'
                  : stagedFile
                  ? 'border-emerald-500/60 bg-emerald-50/20'
                  : 'border-border-delicate bg-surface-subtle/50 hover:bg-surface-cream hover:border-burgundy-wine/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xs ${
                stagedFile ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-subtle text-text-muted'
              }`}>
                <Icon name={stagedFile ? "task_alt" : "cloud_upload"} className="text-[28px]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-deep-espresso">
                  {stagedFile ? 'Đã chọn file thành công' : 'Kéo thả file vào đây hoặc bấm để duyệt file'}
                </span>
                <span className="text-[11px] text-text-muted mt-0.5">
                  {stagedFile ? stagedFile.name : 'Dung lượng tối đa: 15MB (.xlsx, .xls, .csv)'}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-1 px-4 py-1.5 rounded-full bg-surface-card border border-border-delicate text-deep-espresso text-xs font-semibold hover:bg-surface-subtle shadow-2xs transition-colors"
              >
                {stagedFile ? 'Chọn file khác' : 'Chọn file từ máy tính'}
              </button>
            </div>

            {/* Staged File Info */}
            {stagedFile && (
              <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-300 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center flex-shrink-0">
                    <Icon name="description" className="text-[20px]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-deep-espresso truncate">
                      {stagedFile.name}
                    </span>
                    <span className="text-[11px] text-emerald-800 font-medium">
                      {stagedFile.size} • Sẵn sàng tải lên
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStagedFile(null)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-rose-700 hover:bg-rose-50 transition-colors"
                  title="Gỡ bỏ"
                >
                  <Icon name="delete" className="text-[18px]" />
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-delicate">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-full bg-surface-card text-deep-espresso border border-border-delicate text-xs font-medium hover:bg-surface-subtle transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isUploading}
                onClick={handleConfirmUpload}
                className={`px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs ${
                  stagedFile
                    ? 'bg-burgundy-wine text-white hover:bg-[#851622] active:scale-95 cursor-pointer'
                    : 'bg-surface-card hover:bg-surface-subtle text-burgundy-wine border border-burgundy-wine/40 cursor-pointer'
                }`}
              >
                <Icon
                  name={isUploading ? "progress_activity" : (stagedFile ? "check_circle" : "upload")}
                  className={`text-[16px] ${isUploading ? 'animate-spin' : ''}`}
                />
                <span>
                  {isUploading
                    ? 'Đang lưu file...'
                    : (stagedFile ? 'Xác nhận Upload file' : 'Chọn file để upload')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: SEND CONFIRMATION MODAL */}
      {/* ==================================================================== */}
      {isSendConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-deep-espresso/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-card rounded-2xl max-w-sm w-full p-6 shadow-xl border border-border-delicate flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-burgundy-wine pb-2 border-b border-border-delicate">
              <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center">
                <Icon name="forward_to_inbox" className="text-[20px]" />
              </div>
              <h3 className="font-serif font-bold text-deep-espresso text-base">
                Xác nhận chuyển giao dữ liệu
              </h3>
            </div>

            <p className="text-xs text-deep-espresso leading-relaxed">
              Bạn có chắc chắn muốn gửi file này cho khách hàng đơn <strong>#{sendTargetOrderId}</strong>? Khách hàng sẽ có thể xem và tải file ngay lập tức trên Cổng Khách Hàng.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-delicate">
              <button
                type="button"
                onClick={() => setIsSendConfirmOpen(false)}
                className="px-4 py-2 rounded-full bg-surface-card text-deep-espresso border border-border-delicate text-xs font-medium hover:bg-surface-subtle"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmSend}
                className="px-5 py-2 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Xác nhận gửi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
