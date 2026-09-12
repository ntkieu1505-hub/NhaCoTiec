import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { Badge } from '../../../components/common/Badge';
import { usePublicTemplates } from '../../../mocks/templateStore';
import { formatCurrency } from '../../../utils/formatters';
import { Template } from '../../../types/template';
import { OrderFormModal } from '../components/OrderFormModal';
import { useAuth } from '../../../mocks/authStore';

export const TemplatesPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const publicTemplates = usePublicTemplates();
  const [filter, setFilter] = useState<'all' | 'basic' | 'premium'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplateForOrder, setSelectedTemplateForOrder] = useState<Template | null>(null);

  const filtered = useMemo(() => {
    return publicTemplates.filter((t) => {
      const matchCat = filter === 'all' || (t.category || (t.price >= 79000 ? 'premium' : 'basic')) === filter;
      if (!matchCat) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = t.name.toLowerCase().includes(q);
        const matchStyle = (t.style || '').toLowerCase().includes(q);
        const matchSlug = t.slug.toLowerCase().includes(q);
        if (!matchName && !matchStyle && !matchSlug) return false;
      }
      return true;
    });
  }, [publicTemplates, filter, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
      {/* Header section matching SCREEN_4 Stitch */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="font-label-caps text-xs text-burgundy-wine tracking-widest font-bold">
          Bộ sưu tập mẫu <span className="whitespace-nowrap">thiệp cưới</span> online
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-deep-espresso mt-2 text-balance">
          Chọn mẫu yêu thích của bạn.
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-2 leading-relaxed text-balance">
          Đội ngũ Nhà Có Tiệc sẽ tiếp nhận và tùy biến riêng từng câu chữ, ảnh cưới và âm nhạc theo thông điệp của bạn.
        </p>

        {/* Filters: Category tabs + Search bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          {/* 3 tabs filter: Tất cả, Cao cấp, Cơ bản */}
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-surface-subtle border border-border-delicate shadow-xs shrink-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-[#63141a] text-white shadow-sm'
                  : 'text-deep-espresso hover:bg-surface-card'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('premium')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                filter === 'premium'
                  ? 'bg-[#63141a] text-white shadow-sm'
                  : 'text-deep-espresso hover:bg-surface-card'
              }`}
            >
              Cao cấp
            </button>
            <button
              onClick={() => setFilter('basic')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                filter === 'basic'
                  ? 'bg-[#63141a] text-white shadow-sm'
                  : 'text-deep-espresso hover:bg-surface-card'
              }`}
            >
              Cơ bản
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[17px] text-text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, phong cách..."
              className="w-full h-9 pl-9 pr-8 rounded-full bg-surface-subtle border border-border-delicate text-xs text-deep-espresso placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-burgundy-wine focus:border-burgundy-wine"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-deep-espresso"
                title="Xóa tìm kiếm"
              >
                <Icon name="close" className="text-[14px]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-16 text-center bg-surface-card rounded-3xl border border-border-delicate flex flex-col items-center gap-2 max-w-md mx-auto">
          <Icon name="search_off" className="text-4xl text-text-muted/50" />
          <span className="font-serif text-base font-bold text-deep-espresso">
            Không tìm thấy mẫu thiệp phù hợp
          </span>
          <span className="text-xs text-text-muted">
            {searchQuery ? `Không có mẫu thiệp nào khớp với "${searchQuery}".` : 'Chưa có mẫu thiệp trong phân loại này.'}
          </span>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilter('all');
            }}
            className="mt-3 px-5 py-2 rounded-full bg-burgundy-wine text-white text-xs font-semibold hover:bg-burgundy-wine/90"
          >
            Xem tất cả mẫu thiệp
          </button>
        </div>
      ) : (
        /* Grid of Templates */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((template) => (
          <article
            key={template.id}
            className="flex flex-col bg-surface-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border-delicate/80 group"
          >
            {/* Image Preview Thumbnail - Modern Smartphone 9:16 aspect ratio */}
            <div
              className="relative w-full aspect-phone bg-surface-subtle overflow-hidden"
              style={{ aspectRatio: '9 / 16' }}
            >
              <Link to={`/mau-thiep/${template.slug}`} className="block w-full h-full">
                <img
                  src={template.thumbnailUrl}
                  alt={template.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ objectPosition: template.thumbnailPosition || 'center 30%' }}
                />
              </Link>
              <span className="absolute top-3 left-3 pointer-events-none">
                <Badge variant={template.category === 'premium' ? 'premium' : 'basic'}>
                  {template.category === 'premium' ? 'Cao cấp' : 'Cơ bản'}
                </Badge>
              </span>
              <span className="absolute bottom-3 right-3 bg-[#63141a] text-surface-cream font-serif text-sm font-semibold px-3 py-1 rounded-lg shadow-md pointer-events-none">
                {formatCurrency(template.price)}
              </span>
            </div>

            {/* Template Info */}
            <div className="pt-3.5 px-5 pb-5 flex-1 flex flex-col justify-between gap-3.5">
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <h2 className="font-serif text-[17px] sm:text-lg font-bold text-deep-espresso min-w-0 flex-1 line-clamp-2 leading-[1.3] min-h-[44px] flex items-center">
                    {template.name}
                  </h2>
                  <span className="text-xs text-gold-foil font-semibold flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full bg-gold-foil/10 border border-gold-foil/25 mt-0.5">
                    <Icon name="grade" className="text-[14px]" /> {template.rating || 5.0}
                  </span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed line-clamp-2 min-h-[34px]">
                  {template.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-border-delicate">
                <Link
                  to={`/mau-thiep/${template.slug}`}
                  className="flex-1 h-10 rounded-full bg-surface-subtle hover:bg-surface-container-high text-deep-espresso text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                >
                  <Icon name="visibility" className="text-[17px]" />
                  <span>Xem chi tiết</span>
                </Link>
                <Link
                  to={
                    isAuthenticated
                      ? `/dat-thiep/${template.slug}`
                      : `/dang-nhap?redirect=${encodeURIComponent(`/dat-thiep/${template.slug}`)}`
                  }
                  className="flex-1 h-10 rounded-full bg-[#63141a] hover:bg-deep-espresso text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-sm transition-all"
                >
                  <Icon name="shopping_bag" className="text-[17px]" />
                  <span>Chọn mẫu này</span>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      )}

      {/* Mandatory Pre-checkout Order Information Modal */}
      {selectedTemplateForOrder && (
        <OrderFormModal
          isOpen={Boolean(selectedTemplateForOrder)}
          onClose={() => setSelectedTemplateForOrder(null)}
          template={selectedTemplateForOrder}
        />
      )}
    </div>
  );
};
