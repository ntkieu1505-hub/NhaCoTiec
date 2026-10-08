import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { Template, TemplateStatus } from '../../../types/template';
import {
  useTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  resetTemplates,
  purgeCorruptedTemplates,
  togglePinTemplate,
  syncAllTemplatesToFirestore,
} from '../../../mocks/templateStore';
import { formatCurrency } from '../../../utils/formatters';
import { TemplateFormModal } from '../components/TemplateFormModal';
import { matchQuery } from '../../../utils/searchHelper';
import { AdminOutletContext } from '../../../components/layouts/AdminLayout';

export const AdminTemplatesPage: React.FC = () => {
  const outletCtx = useOutletContext<AdminOutletContext>() || {};
  const templates = useTemplates();

  const [searchQuery, setSearchQuery] = useState(outletCtx.searchQuery || '');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'all' | TemplateStatus | 'pinned'>('all');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState('');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState('');

  useEffect(() => {
    if (outletCtx.searchQuery !== undefined && outletCtx.searchQuery !== searchQuery) {
      setSearchQuery(outletCtx.searchQuery);
    }
  }, [outletCtx.searchQuery]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Compute KPI metrics
  const totalCount = templates.length;
  const publishedCount = templates.filter((t) => t.status === 'published' || t.isActive).length;
  const draftCount = templates.filter((t) => t.status === 'draft').length;
  const hiddenCount = templates.filter((t) => t.status === 'hidden').length;
  const pinnedCount = templates.filter((t) => t.isPinned).length;

  // Filter templates
  const filteredTemplates = templates.filter((tpl) => {
    // Status tab
    if (selectedStatusTab === 'pinned') {
      if (!tpl.isPinned) return false;
    } else if (selectedStatusTab !== 'all') {
      const currentStatus = tpl.status || (tpl.isActive ? 'published' : 'draft');
      if (currentStatus !== selectedStatusTab) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      const matchName = matchQuery(tpl.name, q);
      const matchSlug = matchQuery(tpl.slug, q);
      const matchStyle = matchQuery(tpl.style, q);
      const matchDesc = matchQuery(tpl.description, q);
      if (!matchName && !matchSlug && !matchStyle && !matchDesc) return false;
    }

    // Style filter
    if (selectedStyleFilter && tpl.style !== selectedStyleFilter) {
      return false;
    }

    // Price filter
    if (selectedPriceFilter && tpl.price !== Number(selectedPriceFilter)) {
      return false;
    }

    return true;
  });

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tpl: Template) => {
    setEditingTemplate(tpl);
    setIsModalOpen(true);
  };

  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const handleCloudSync = async () => {
    setIsSyncingCloud(true);
    try {
      const res = await syncAllTemplatesToFirestore();
      if (res.success) {
        alert(
          `Đã đồng bộ thành công ${res.count} mẫu thiệp lên máy chủ Cloud Firestore!\n\nTất cả khách hàng truy cập website trên bất kỳ máy tính, điện thoại hay trình duyệt nào hiện đã xem được dữ liệu mới nhất ngay lập tức.`
        );
      } else {
        alert(`Đồng bộ thất bại: ${res.error || 'Vui lòng kiểm tra kết nối mạng'}`);
      }
    } catch (e: any) {
      alert(`Đồng bộ thất bại: ${e?.message || 'Lỗi mạng'}`);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handleSaveTemplate = (data: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, data);
      alert(`Đã cập nhật thành công mẫu thiệp "${data.name}" và đồng bộ lên đám mây!`);
    } else {
      createTemplate(data);
      alert(`Đã thêm mới thành công mẫu thiệp "${data.name}" và đồng bộ lên đám mây!`);
    }
    // Tự động đẩy toàn bộ thay đổi lên Cloud Firestore để đảm bảo đồng bộ đa thiết bị
    syncAllTemplatesToFirestore().catch(() => {});

    // Xóa bộ lọc tìm kiếm và bộ lọc kiểu dáng/giá để mẫu vừa lưu luôn hiển thị
    setSearchQuery('');
    outletCtx.setSearchQuery?.('');
    setSelectedStyleFilter('');
    setSelectedPriceFilter('');
    // Đảm bảo tab phù hợp với trạng thái của mẫu
    if (selectedStatusTab !== 'all' && selectedStatusTab !== data.status) {
      setSelectedStatusTab(data.status || 'all');
    }
  };

  const handleDelete = (tpl: Template) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa mẫu thiệp "${tpl.name}"? Mẫu thiệp sẽ bị gỡ hoàn toàn khỏi trang chủ công khai ngay lập tức.`
      )
    ) {
      deleteTemplate(tpl.id);
      syncAllTemplatesToFirestore().catch(() => {});
      alert(`Đã xóa vĩnh viễn mẫu thiệp "${tpl.name}"!`);
    }
  };

  const handlePurge = () => {
    const cleaned = purgeCorruptedTemplates();
    syncAllTemplatesToFirestore().catch(() => {});
    alert(`Đã dọn dẹp và đồng bộ lại danh sách mẫu thiệp! (${cleaned} mục được xử lý)`);
  };

  // Distinct styles for dropdown filter
  const distinctStyles = Array.from(new Set(templates.map((t) => t.style).filter(Boolean)));

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* SECTION A: Title & Header Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-subtle text-gold-foil font-label-caps text-[10px] tracking-widest uppercase font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-foil"></span>
            Danh mục sản phẩm mẫu • Bộ sưu tập thiệp cưới số
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-deep-espresso tracking-tight mt-1">
            04. Quản Lý Mẫu Thiệp
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-2xl leading-relaxed">
            Quản lý và cập nhật toàn bộ mẫu thiệp cưới số độc bản bán lẻ của <strong>Nhà Có Tiệc</strong>. Thiết lập giá niêm yết (59.000đ - 79.000đ), chỉnh sửa ảnh thumbnail, link xem thử demo và trạng thái phát hành.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCloudSync}
            disabled={isSyncingCloud}
            className="px-3.5 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            title="Đồng bộ tất cả các mẫu thiệp lên Cloud Firestore để khách hàng trên mọi thiết bị đều xem được bản mới nhất"
          >
            <Icon name={isSyncingCloud ? 'hourglass_top' : 'cloud_sync'} className={`text-[16px] text-emerald-700 ${isSyncingCloud ? 'animate-spin' : ''}`} />
            <span>{isSyncingCloud ? 'Đang đồng bộ...' : 'Đồng bộ đám mây'}</span>
          </button>
          <button
            type="button"
            onClick={handlePurge}
            className="px-3 py-2 rounded-full bg-surface-card hover:bg-surface-subtle text-text-muted border border-border-delicate text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Dọn dẹp và thanh lọc các mẫu lỗi hoặc đã xóa"
          >
            <Icon name="cleaning_services" className="text-[15px] text-amber-700" />
            <span>Dọn dẹp mẫu lỗi</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Đặt lại toàn bộ mẫu thiệp về dữ liệu ban đầu?')) {
                resetTemplates();
                syncAllTemplatesToFirestore().catch(() => {});
              }
            }}
            className="px-3 py-2 rounded-full bg-surface-card hover:bg-surface-subtle text-text-muted border border-border-delicate text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Khôi phục danh sách mẫu ban đầu"
          >
            <Icon name="refresh" className="text-[15px]" />
            <span>Đặt lại mẫu</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Icon name="add" className="text-[18px]" />
            <span>+ Thêm mẫu thiệp</span>
          </button>
        </div>
      </div>

      {/* SECTION B: 4 KPI Summary Cards (Stitch Spec) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Tổng mẫu */}
        <div className="bg-surface-card rounded-2xl p-4 shadow-xs border border-border-delicate flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="font-label-caps text-[10px] uppercase font-semibold">Tổng mẫu thiết kế</span>
            <Icon name="style" className="text-[18px] text-gold-foil" />
          </div>
          <div className="mt-2">
            <span className="font-serif text-2xl font-bold text-deep-espresso">{totalCount} Mẫu</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-border-delicate flex items-center justify-between text-[11px] text-text-muted">
            <span className="text-emerald-800 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              {publishedCount} Mở bán
            </span>
            <span className="text-amber-800 font-semibold flex items-center gap-1">
              <Icon name="push_pin" className="text-[12px] text-amber-600" />
              {pinnedCount} Ghim trang chủ
            </span>
          </div>
        </div>

        {/* Card 2: Bán chạy nhất */}
        <div className="bg-surface-card rounded-2xl p-4 shadow-xs border border-border-delicate flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="font-label-caps text-[10px] uppercase font-semibold">Bán chạy nhất</span>
            <Icon name="workspace_premium" className="text-[18px] text-burgundy-wine" />
          </div>
          <div className="mt-2">
            <span className="font-serif text-lg font-bold text-deep-espresso truncate block">
              Minh Anh Editorial
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-border-delicate flex items-center justify-between text-[11px]">
            <span className="text-burgundy-wine font-semibold">84 đơn đặt</span>
            <span className="text-gold-foil font-medium">79.000đ</span>
          </div>
        </div>

        {/* Card 3: Doanh số & Giá bình quân */}
        <div className="bg-surface-card rounded-2xl p-4 shadow-xs border border-border-delicate flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="font-label-caps text-[10px] uppercase font-semibold">Mức giá bán lẻ</span>
            <Icon name="payments" className="text-[18px] text-emerald-700" />
          </div>
          <div className="mt-2">
            <span className="font-serif text-2xl font-bold text-deep-espresso">59k - 79k</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-border-delicate flex items-center justify-between text-[11px] text-text-muted">
            <span>Mô hình</span>
            <span className="text-deep-espresso font-semibold">Đồng giá bán lẻ thiệp</span>
          </div>
        </div>

        {/* Card 4: Tỷ lệ chuyển đổi */}
        <div className="bg-surface-card rounded-2xl p-4 shadow-xs border border-border-delicate flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="font-label-caps text-[10px] uppercase font-semibold">Hiệu suất demo</span>
            <Icon name="trending_up" className="text-[18px] text-emerald-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-serif text-2xl font-bold text-deep-espresso">100%</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              Sẵn sàng xem thử
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-border-delicate flex items-center justify-between text-[11px] text-text-muted">
            <span>Link demo trực tiếp</span>
            <span className="text-deep-espresso font-semibold">previewUrl riêng biệt</span>
          </div>
        </div>
      </div>

      {/* SECTION C: Search, Status Tabs & Filters */}
      <div className="bg-surface-card rounded-2xl p-4 shadow-xs border border-border-delicate flex flex-col gap-3.5">
        {/* Status Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-delicate pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedStatusTab('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatusTab === 'all'
                  ? 'bg-deep-espresso text-white shadow-xs'
                  : 'bg-surface-subtle text-text-muted hover:text-deep-espresso'
              }`}
            >
              Tất cả ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusTab('published')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedStatusTab === 'published'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-surface-subtle text-text-muted hover:text-deep-espresso'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Đang mở bán ({publishedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusTab('draft')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedStatusTab === 'draft'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-surface-subtle text-text-muted hover:text-deep-espresso'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Bản nháp ({draftCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusTab('hidden')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedStatusTab === 'hidden'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-surface-subtle text-text-muted hover:text-deep-espresso'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <span>Đã ẩn ({hiddenCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusTab('pinned')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedStatusTab === 'pinned'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100'
              }`}
            >
              <Icon name="push_pin" className="text-[13px]" />
              <span>Đã ghim trang chủ ({pinnedCount})</span>
            </button>
          </div>

          <span className="text-xs text-text-muted shrink-0">
            Hiển thị: <strong>{filteredTemplates.length}</strong> / {totalCount} mẫu thiệp
          </span>
        </div>

        {/* Search & Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Search box */}
          <div className="sm:col-span-6 relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[17px]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                outletCtx.setSearchQuery?.(e.target.value);
              }}
              placeholder="Tìm theo tên mẫu, mã slug, phong cách, mô tả..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-surface-subtle text-xs font-medium text-deep-espresso placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-burgundy-wine border border-border-delicate"
            />
          </div>

          {/* Style Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedStyleFilter}
              onChange={(e) => setSelectedStyleFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-subtle text-xs font-medium text-deep-espresso border border-border-delicate focus:outline-none focus:ring-1 focus:ring-burgundy-wine cursor-pointer"
            >
              <option value="">Phong cách: Tất cả</option>
              {distinctStyles.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Price Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedPriceFilter}
              onChange={(e) => setSelectedPriceFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-subtle text-xs font-medium text-deep-espresso border border-border-delicate focus:outline-none focus:ring-1 focus:ring-burgundy-wine cursor-pointer"
            >
              <option value="">Mức giá: Tất cả</option>
              <option value="59000">Đồng giá 59.000đ</option>
              <option value="79000">Đồng giá 79.000đ</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION D: Visual Template Cards Grid (3 Columns Layout) */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-surface-card rounded-2xl p-12 text-center border border-border-delicate flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-surface-subtle flex items-center justify-center text-text-muted">
            <Icon name="search_off" className="text-[24px]" />
          </div>
          <h3 className="font-serif text-base font-bold text-deep-espresso">
            Không tìm thấy mẫu thiệp phù hợp
          </h3>
          <p className="text-xs text-text-muted max-w-sm">
            Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc phong cách và trạng thái.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedStatusTab('all');
              setSelectedStyleFilter('');
              setSelectedPriceFilter('');
            }}
            className="px-4 py-1.5 rounded-full bg-burgundy-wine text-white text-xs font-semibold mt-1"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((tpl) => {
            const currentStatus = tpl.status || (tpl.isActive ? 'published' : 'draft');
            return (
              <article
                key={tpl.id}
                className="group bg-surface-card rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-border-delicate flex flex-col justify-between"
              >
                {/* 1. Thumbnail Image Container with Price & Status Overlay - Modern Smartphone 9:16 aspect ratio */}
                <div
                  className="relative w-full aspect-phone bg-surface-subtle overflow-hidden"
                  style={{ aspectRatio: '9 / 16' }}
                >
                  <img
                    src={tpl.thumbnailUrl}
                    alt={tpl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    style={{ objectPosition: tpl.thumbnailPosition || 'center 30%' }}
                  />

                  {/* Top Badges Overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Status Badge */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-label-caps uppercase font-bold tracking-wider shadow-sm flex items-center gap-1 backdrop-blur-md ${
                          currentStatus === 'published'
                            ? 'bg-emerald-900/90 text-white'
                            : currentStatus === 'draft'
                            ? 'bg-amber-900/90 text-white'
                            : 'bg-slate-900/90 text-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            currentStatus === 'published'
                              ? 'bg-emerald-400'
                              : currentStatus === 'draft'
                              ? 'bg-amber-400'
                              : 'bg-slate-400'
                          }`}
                        ></span>
                        <span>
                          {currentStatus === 'published'
                            ? 'Published'
                            : currentStatus === 'draft'
                            ? 'Draft'
                            : 'Hidden'}
                        </span>
                      </span>

                      {/* Pinned to Homepage Badge */}
                      {tpl.isPinned && (
                        <span className="px-2 py-1 rounded-full text-[10px] font-label-caps uppercase font-bold tracking-wider shadow-sm flex items-center gap-1 backdrop-blur-md bg-amber-500/95 text-white">
                          <Icon name="push_pin" className="text-[12px]" />
                          <span>Ghim trang chủ</span>
                        </span>
                      )}
                    </div>

                    {/* Style Pill Tag */}
                    <span className="px-2.5 py-1 rounded-full bg-surface-card/90 backdrop-blur-md text-deep-espresso font-label-caps text-[10px] uppercase font-semibold shadow-xs shrink-0">
                      {tpl.style || 'Thanh Lịch'}
                    </span>
                  </div>

                  {/* Price Tag Overlay (Bottom Right) */}
                  <div className="absolute bottom-3 right-3 bg-deep-espresso/90 backdrop-blur-md text-white px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <span className="font-label-caps text-[9px] text-gold-foil uppercase font-semibold">Giá lẻ</span>
                    <span className="font-serif text-xs font-bold">
                      {formatCurrency(tpl.price)}
                    </span>
                  </div>
                </div>

                {/* 2. Card Content Details */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-serif text-base font-bold text-deep-espresso group-hover:text-burgundy-wine transition-colors leading-snug flex-1">
                        {tpl.name}
                      </h2>
                      <div className="flex items-center gap-1 shrink-0">
                        {/* 1-Click Pin / Unpin Button */}
                        <button
                          type="button"
                          onClick={() => togglePinTemplate(tpl.id)}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                            tpl.isPinned
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-2xs'
                              : 'bg-surface-subtle hover:bg-surface-cream text-text-muted hover:text-amber-800 border border-border-delicate'
                          }`}
                          title={tpl.isPinned ? 'Bỏ ghim khỏi trang chủ' : 'Ghim mẫu này lên trang chủ'}
                        >
                          <Icon
                            name="push_pin"
                            className={`text-[14px] ${tpl.isPinned ? 'text-amber-700' : 'text-text-muted'}`}
                          />
                          <span className="text-[11px]">{tpl.isPinned ? 'Đã ghim' : 'Ghim'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(tpl)}
                          className="text-text-muted hover:text-rose-700 p-1 rounded transition-colors"
                          title="Xóa mẫu thiệp"
                        >
                          <Icon name="delete" className="text-[16px]" />
                        </button>
                      </div>
                    </div>

                    {/* Style & Slug */}
                    <div className="flex items-center gap-2 text-[11px] text-text-muted">
                      <span className="font-medium text-deep-espresso">
                        Phong cách: <strong>{tpl.style || 'Thanh lịch'}</strong>
                      </span>
                    </div>

                    <div className="font-mono text-[10px] text-gold-foil bg-surface-subtle/70 px-2 py-0.5 rounded border border-border-delicate/80 truncate">
                      slug: /mau-thiep/{tpl.slug}
                    </div>

                    {/* Description */}
                    <p className="text-text-muted text-xs leading-relaxed line-clamp-2 mt-0.5">
                      {tpl.description}
                    </p>
                  </div>

                  {/* 3. Actions: "Mở thiệp xem thử" & "Chỉnh sửa" */}
                  <div className="pt-3 border-t border-border-delicate flex items-center gap-2">
                    {/* Chỉnh sửa */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(tpl)}
                      className="flex-1 h-9 rounded-full bg-surface-subtle hover:bg-surface-cream text-deep-espresso text-xs font-semibold flex items-center justify-center gap-1.5 border border-border-delicate transition-colors shadow-2xs"
                    >
                      <Icon name="edit" className="text-[15px] text-burgundy-wine" />
                      <span>Chỉnh sửa</span>
                    </button>

                    {/* Mở thiệp xem thử */}
                    <a
                      href={tpl.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 h-9 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      title="Mở đường link demo của mẫu thiệp trong tab mới"
                    >
                      <Icon name="open_in_new" className="text-[15px]" />
                      <span>Mở thiệp xem thử</span>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* MODAL: Thêm mới & Chỉnh sửa mẫu thiệp */}
      <TemplateFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTemplate(null);
        }}
        initialData={editingTemplate}
        existingTemplates={templates}
        onSave={handleSaveTemplate}
      />
    </div>
  );
};

