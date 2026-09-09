import React, { useState, useMemo, useRef } from 'react';
import { Icon } from '../../../components/common/Icon';
import { MOCK_GUESTS, MOCK_WISHES } from '../../../mocks/index';
import {
  useOrders,
  adminUploadExcel,
  adminSendExcelToCustomer,
  useAllCustomerExports,
} from '../../../mocks/orderStore';
import { formatDateTime } from '../../../utils/formatters';
import { Wish, RsvpStatus } from '../../../types';

export const AdminGuestsWishesPage: React.FC = () => {
  const orders = useOrders();
  const allExports = useAllCustomerExports();

  // Active Tab: 'guests' | 'wishes' | 'excel'
  const [activeTab, setActiveTab] = useState<'guests' | 'wishes' | 'excel'>('guests');

  // Filter & Search state
  const [selectedOrderId, setSelectedOrderId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rsvpFilter, setRsvpFilter] = useState<RsvpStatus | 'all'>('all');

  // Interactive Wishes State
  const [wishesList, setWishesList] = useState<Wish[]>(MOCK_WISHES);

  // Excel Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTargetOrderId, setUploadTargetOrderId] = useState<string>('NCT01');
  const [stagedFile, setStagedFile] = useState<{ name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Send Confirmation Modal State
  const [isSendConfirmOpen, setIsSendConfirmOpen] = useState(false);
  const [sendTargetOrderId, setSendTargetOrderId] = useState<string>('NCT01');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Toggle approval / pin for wishes
  const toggleWishApproval = (id: string) => {
    setWishesList((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isApproved: !w.isApproved } : w))
    );
  };

  const toggleWishPin = (id: string) => {
    setWishesList((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isPinned: !w.isPinned } : w))
    );
  };

  // Selected Order Object (if not 'all')
  const selectedOrder = useMemo(() => {
    if (selectedOrderId === 'all') return null;
    return orders.find((o) => o.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  // Filtered Guests
  const filteredGuests = useMemo(() => {
    return MOCK_GUESTS.filter((g) => {
      // Filter by Order
      if (selectedOrderId !== 'all' && g.orderId !== selectedOrderId) return false;

      // Filter by RSVP Status
      if (rsvpFilter !== 'all' && g.rsvpStatus !== rsvpFilter) return false;

      // Filter by Search Query (Name, Phone, OrderId, Note)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = g.name.toLowerCase().includes(q);
        const matchPhone = (g.phone || '').toLowerCase().includes(q);
        const matchOrder = g.orderId.toLowerCase().includes(q);
        const matchNote = (g.notes || '').toLowerCase().includes(q);
        const matchTable = (g.tableNumber || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchOrder && !matchNote && !matchTable) {
          return false;
        }
      }

      return true;
    });
  }, [selectedOrderId, rsvpFilter, searchQuery]);

  // Filtered Wishes
  const filteredWishes = useMemo(() => {
    return wishesList.filter((w) => {
      // Filter by Order
      if (selectedOrderId !== 'all' && w.orderId !== selectedOrderId) return false;

      // Filter by Search Query (Sender, Relationship, Message, OrderId)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSender = w.senderName.toLowerCase().includes(q);
        const matchRel = (w.relationship || '').toLowerCase().includes(q);
        const matchMsg = w.message.toLowerCase().includes(q);
        const matchOrder = w.orderId.toLowerCase().includes(q);
        if (!matchSender && !matchRel && !matchMsg && !matchOrder) {
          return false;
        }
      }

      return true;
    });
  }, [wishesList, selectedOrderId, searchQuery]);

  // Attendance Statistics (based on selected order or all)
  const stats = useMemo(() => {
    const relevantGuests =
      selectedOrderId === 'all'
        ? MOCK_GUESTS
        : MOCK_GUESTS.filter((g) => g.orderId === selectedOrderId);

    const relevantWishes =
      selectedOrderId === 'all'
        ? wishesList
        : wishesList.filter((w) => w.orderId === selectedOrderId);

    const totalGuests = relevantGuests.reduce(
      (acc, g) => acc + 1 + (g.rsvpStatus === 'attending' ? g.companionCount : 0),
      0
    );
    const totalResponses = relevantGuests.length;
    const attendingCount = relevantGuests.filter((g) => g.rsvpStatus === 'attending').length;
    const declinedCount = relevantGuests.filter((g) => g.rsvpStatus === 'declined').length;
    const pendingCount = relevantGuests.filter((g) => g.rsvpStatus === 'pending').length;

    return {
      totalGuests,
      totalResponses,
      attendingCount,
      declinedCount,
      pendingCount,
      wishesCount: relevantWishes.length,
    };
  }, [selectedOrderId, wishesList]);

  // Handlers for Excel Upload
  const openUploadModal = (orderId: string) => {
    setUploadTargetOrderId(orderId);
    setStagedFile(null);
    setIsUploadModalOpen(true);
  };

  const handleFileSelect = (file: File) => {
    const sizeInKb = Math.round(file.size / 1024);
    const sizeStr = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`;
    setStagedFile({
      name: file.name,
      size: sizeStr,
    });
  };

  const handleConfirmUpload = () => {
    if (!stagedFile) return;
    adminUploadExcel(uploadTargetOrderId, {
      fileName: stagedFile.name,
      fileSize: stagedFile.size,
    });
    setIsUploadModalOpen(false);
    setStagedFile(null);
    setActionSuccessMessage(`Đã tải lên file "${stagedFile.name}" cho đơn hàng #${uploadTargetOrderId}!`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
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
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-deep-espresso">
              06. Khách Mời &amp; Lời Chúc
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-burgundy-wine/10 text-burgundy-wine font-label-caps text-[11px] font-bold">
              Trung tâm dữ liệu
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Tổng hợp dữ liệu khách mời, phản hồi tham dự (RSVP), lời chúc cưới và quy trình chuyển giao file Excel
          </p>
        </div>

        {/* Global Action: Download current view */}
        <button
          onClick={() => handleDownloadExcel('danh-sach-khach-moi-va-loi-chuc.xlsx')}
          className="px-4 py-2 rounded-full bg-surface-card hover:bg-surface-subtle text-deep-espresso border border-border-delicate text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Icon name="file_download" className="text-[16px] text-text-muted" />
          <span>Xuất Excel hiện tại</span>
        </button>
      </div>

      {/* Action Notification Alert */}
      {actionSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Icon name="check_circle" className="text-[18px] text-emerald-700 flex-shrink-0" />
            <span className="font-medium">{actionSuccessMessage}</span>
          </div>
          <button
            onClick={() => setActionSuccessMessage(null)}
            className="text-emerald-800/70 hover:text-emerald-950 text-xs font-semibold"
          >
            Đóng
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên khách mời, số điện thoại hoặc từ khóa..."
                className="w-full h-10 pl-9 pr-8 rounded-xl bg-surface-subtle border border-border-delicate text-xs text-deep-espresso placeholder:text-text-muted/70 focus:outline-none focus:border-burgundy-wine focus:ring-1 focus:ring-burgundy-wine"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
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

      {/* 3. Summary Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: Tổng khách */}
        <div className="p-4 rounded-2xl bg-surface-card border border-border-delicate flex flex-col justify-between gap-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-label-caps uppercase font-bold text-text-muted">
              Tổng khách
            </span>
            <div className="w-7 h-7 rounded-full bg-surface-subtle text-deep-espresso flex items-center justify-center">
              <Icon name="group" className="text-[16px]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-serif text-2xl font-bold text-deep-espresso">
              {stats.totalGuests}
            </span>
            <span className="text-[11px] text-text-muted">
              ({stats.totalResponses} phản hồi)
            </span>
          </div>
        </div>

        {/* Card 2: Đã xác nhận tham dự */}
        <div className="p-4 rounded-2xl bg-surface-card border border-border-delicate flex flex-col justify-between gap-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-label-caps uppercase font-bold text-emerald-800">
              Đã xác nhận
            </span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Icon name="check_circle" className="text-[16px]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-serif text-2xl font-bold text-emerald-800">
              {stats.attendingCount}
            </span>
            <span className="text-[11px] text-emerald-700/80 font-medium">khách</span>
          </div>
        </div>

        {/* Card 3: Không tham dự */}
        <div className="p-4 rounded-2xl bg-surface-card border border-border-delicate flex flex-col justify-between gap-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-label-caps uppercase font-bold text-rose-800">
              Không tham dự
            </span>
            <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
              <Icon name="cancel" className="text-[16px]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-serif text-2xl font-bold text-rose-800">
              {stats.declinedCount}
            </span>
            <span className="text-[11px] text-rose-700/80 font-medium">khách</span>
          </div>
        </div>

        {/* Card 4: Chưa xác nhận */}
        <div className="p-4 rounded-2xl bg-surface-card border border-border-delicate flex flex-col justify-between gap-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-label-caps uppercase font-bold text-amber-900">
              Chưa xác nhận
            </span>
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Icon name="hourglass_empty" className="text-[16px]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-serif text-2xl font-bold text-amber-900">
              {stats.pendingCount}
            </span>
            <span className="text-[11px] text-amber-800/80 font-medium">chờ</span>
          </div>
        </div>

        {/* Card 5: Tổng lời chúc */}
        <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-surface-card border border-border-delicate flex flex-col justify-between gap-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-label-caps uppercase font-bold text-burgundy-wine">
              Tổng lời chúc
            </span>
            <div className="w-7 h-7 rounded-full bg-burgundy-wine/10 text-burgundy-wine flex items-center justify-center">
              <Icon name="favorite" className="text-[16px]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-serif text-2xl font-bold text-burgundy-wine">
              {stats.wishesCount}
            </span>
            <span className="text-[11px] text-text-muted">lưu bút</span>
          </div>
        </div>
      </div>

      {/* 4. Combined 3 Tabs: [ Khách mời ] [ Lời chúc ] [ File Excel ] */}
      <div className="flex flex-col gap-4">
        {/* Tab Navigation Buttons */}
        <div className="flex items-center gap-2 border-b border-border-delicate pb-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('guests')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'guests'
                ? 'bg-burgundy-wine text-white shadow-xs'
                : 'bg-surface-card text-deep-espresso border border-border-delicate hover:bg-surface-subtle'
            }`}
          >
            <Icon name="recent_actors" className="text-[16px]" />
            <span>Khách mời ({filteredGuests.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wishes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'wishes'
                ? 'bg-burgundy-wine text-white shadow-xs'
                : 'bg-surface-card text-deep-espresso border border-border-delicate hover:bg-surface-subtle'
            }`}
          >
            <Icon name="favorite" className="text-[16px]" />
            <span>Lời chúc ({filteredWishes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('excel')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'excel'
                ? 'bg-burgundy-wine text-white shadow-xs'
                : 'bg-surface-card text-deep-espresso border border-border-delicate hover:bg-surface-subtle'
            }`}
          >
            <Icon name="table_view" className="text-[16px]" />
            <span>File Excel (Chuyển giao dữ liệu)</span>
            <span className="w-2 h-2 rounded-full bg-gold-foil"></span>
          </button>
        </div>

        {/* ==================================================================== */}
        {/* TAB 1: KHÁCH MỜI (RSVP) */}
        {/* ==================================================================== */}
        {activeTab === 'guests' && (
          <div className="flex flex-col gap-4">
            {/* Quick RSVP Sub-filters */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-text-muted font-medium mr-1">Trạng thái RSVP:</span>
                {[
                  { id: 'all', label: `Tất cả (${stats.totalResponses})` },
                  { id: 'attending', label: `Tham dự (${stats.attendingCount})` },
                  { id: 'declined', label: `Không tham dự (${stats.declinedCount})` },
                  { id: 'pending', label: `Chờ xác nhận (${stats.pendingCount})` },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setRsvpFilter(item.id as any)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      rsvpFilter === item.id
                        ? 'bg-deep-espresso text-white font-semibold shadow-2xs'
                        : 'bg-surface-card text-text-muted border border-border-delicate hover:text-deep-espresso'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <span className="text-[11px] text-text-muted">
                Hiển thị {filteredGuests.length} khách mời
              </span>
            </div>

            {/* Guests Table */}
            <div className="bg-surface-card rounded-2xl shadow-xs border border-border-delicate overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-subtle/60 border-b border-border-delicate text-text-muted font-label-caps uppercase text-[10px]">
                      <th className="py-3 px-4">Tên khách mời</th>
                      <th className="py-3 px-4">Đơn hàng</th>
                      <th className="py-3 px-4">Số điện thoại</th>
                      <th className="py-3 px-4">Phản hồi RSVP</th>
                      <th className="py-3 px-4">Đi kèm</th>
                      <th className="py-3 px-4">Xếp bàn / Lời nhắn</th>
                      <th className="py-3 px-4 text-right">Ngày gửi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-delicate">
                    {filteredGuests.length > 0 ? (
                      filteredGuests.map((g) => (
                        <tr key={g.id} className="hover:bg-surface-subtle/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-deep-espresso">{g.name}</div>
                            <span className="text-[10px] text-text-muted font-mono">{g.id}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => setSelectedOrderId(g.orderId)}
                              className="font-mono text-burgundy-wine font-bold hover:underline"
                              title="Lọc theo đơn này"
                            >
                              #{g.orderId}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-text-muted font-mono">
                            {g.phone || '—'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-label-caps font-semibold border ${
                                g.rsvpStatus === 'attending'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : g.rsvpStatus === 'declined'
                                  ? 'bg-rose-50 text-burgundy-wine border-rose-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              <Icon
                                name={
                                  g.rsvpStatus === 'attending'
                                    ? 'check'
                                    : g.rsvpStatus === 'declined'
                                    ? 'close'
                                    : 'hourglass_empty'
                                }
                                className="text-[12px]"
                              />
                              {g.rsvpStatus === 'attending'
                                ? 'Tham dự'
                                : g.rsvpStatus === 'declined'
                                ? 'Không tham dự'
                                : 'Chưa xác nhận'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-deep-espresso">
                            {g.companionCount > 0 ? `+${g.companionCount} người` : 'Đi một mình'}
                          </td>
                          <td className="py-3.5 px-4 text-text-muted max-w-xs">
                            <div className="font-medium text-deep-espresso">{g.tableNumber || 'Chưa xếp bàn'}</div>
                            {g.notes && (
                              <div className="text-[11px] text-gold-foil italic truncate mt-0.5" title={g.notes}>
                                "{g.notes}"
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right text-[11px] text-text-muted">
                            {formatDateTime(g.submittedAt)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-xs text-text-muted">
                          Không tìm thấy khách mời nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: LỜI CHÚC (GUESTBOOK) */}
        {/* ==================================================================== */}
        {activeTab === 'wishes' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Hiển thị {filteredWishes.length} lời chúc lưu bút</span>
              <span>Bấm ngôi sao để ghim lời chúc nổi bật lên đầu thiệp cưới online</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWishes.length > 0 ? (
                filteredWishes.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-2xl bg-surface-card border border-border-delicate flex flex-col justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-deep-espresso text-sm">
                            {w.senderName}
                          </span>
                          {w.relationship && (
                            <span className="text-[10px] text-text-muted bg-surface-subtle border border-border-delicate px-2 py-0.2 rounded-md font-medium">
                              {w.relationship}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-0.5">
                          <button
                            onClick={() => setSelectedOrderId(w.orderId)}
                            className="font-mono text-burgundy-wine font-bold hover:underline"
                          >
                            #{w.orderId}
                          </button>
                          <span>•</span>
                          <span>{formatDateTime(w.createdAt)}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleWishPin(w.id)}
                        className="text-gold-foil hover:scale-110 transition-transform p-1"
                        title={w.isPinned ? 'Bỏ ghim' : 'Ghim lời chúc lên đầu'}
                      >
                        <Icon name={w.isPinned ? 'star' : 'star_outline'} className="text-[20px]" />
                      </button>
                    </div>

                    <p className="italic text-xs text-deep-espresso bg-surface-subtle/50 p-3 rounded-xl border border-border-delicate leading-relaxed">
                      "{w.message}"
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-border-delicate text-xs">
                      <span
                        className={`text-[11px] font-semibold flex items-center gap-1 ${
                          w.isApproved ? 'text-emerald-700' : 'text-amber-800'
                        }`}
                      >
                        <span className="text-[9px]">{w.isApproved ? '●' : '○'}</span>
                        <span>{w.isApproved ? 'Đã hiển thị trên thiệp' : 'Tạm ẩn'}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleWishApproval(w.id)}
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
                ))
              ) : (
                <div className="col-span-2 py-12 text-center text-xs text-text-muted bg-surface-card rounded-2xl border border-border-delicate">
                  Không tìm thấy lời chúc nào phù hợp.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: FILE EXCEL (EXCEL MANAGEMENT WORKFLOW) */}
        {/* ==================================================================== */}
        {activeTab === 'excel' && (
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
                              onClick={() => handleDownloadExcel(exp.fileName)}
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
                      Tình trạng chuyển giao file Excel ({orders.length} đơn hàng)
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
                      {orders.map((ord) => {
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
                                      onClick={() => handleDownloadExcel(exp.fileName)}
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
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileSelect(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-burgundy-wine bg-burgundy-wine/5'
                  : 'border-border-delicate bg-surface-subtle/50 hover:bg-surface-cream'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />
              <Icon name="cloud_upload" className="text-[32px] text-text-muted" />
              <span className="text-xs font-semibold text-deep-espresso">
                Kéo thả file vào đây hoặc bấm để duyệt file
              </span>
              <span className="text-[11px] text-text-muted">Dung lượng tối đa: 15MB</span>
            </div>

            {/* Staged File Info */}
            {stagedFile && (
              <div className="p-3 rounded-xl bg-surface-subtle border border-border-delicate flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon name="description" className="text-[20px] text-emerald-700 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-deep-espresso truncate">
                      {stagedFile.name}
                    </span>
                    <span className="text-[11px] text-text-muted">{stagedFile.size}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStagedFile(null)}
                  className="p-1 text-text-muted hover:text-rose-700"
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
                className="px-4 py-2 rounded-full bg-surface-card text-deep-espresso border border-border-delicate text-xs font-medium hover:bg-surface-subtle"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!stagedFile}
                onClick={handleConfirmUpload}
                className={`px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs ${
                  stagedFile
                    ? 'bg-burgundy-wine text-white hover:bg-[#851622]'
                    : 'bg-border-delicate text-text-muted cursor-not-allowed'
                }`}
              >
                <Icon name="upload" className="text-[16px]" />
                <span>Upload file</span>
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
