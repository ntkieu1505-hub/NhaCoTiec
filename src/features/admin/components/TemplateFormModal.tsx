import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../../../components/common/Icon';
import { Template, TemplateStatus } from '../../../types/template';
import { formatCurrency } from '../../../utils/formatters';
import { uploadTemplatePhoto } from '../../../services/storageService';

interface TemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Template | null;
  onSave: (data: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const STYLE_PRESETS = [
  'Editorial Vintage',
  'Cổ Điển Romance',
  'Tối Giản Minimalist',
  'Hôn Lễ Vườn Hoa',
  'Indochine Á Đông',
  'Thanh Lịch',
  'Hiện Đại Cinematic'
];

const SAMPLE_THUMBNAILS = [
  {
    label: 'Kem Linen Editorial',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcG33avYwElbHhGDTVlVQuUc9s8BeaI5EA8z3jNIjrsioWsyO-2DPCazpkn2HVwq7tVS47QsuNo_CwKjZAOKBgy-m9ot3yGbRdL2GEgYpPmaz4pgfzcRk3NFUolvvSwLIKyOqVtcrcHq5wRHyWtaNIllb5lC1xxgHkoSc2v0x3MPqJJdPkf8w2uQj-JFcm-oeiOLNkvM2IMKlwmT3FtjKlxmmbPfQaKP_Y9vwbI-JgzCE-hpmkCbN2'
  },
  {
    label: 'Châu Âu Cổ Điển',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvjdLmPVealNAO7tDQw4gra8T4Zgn7TDfthbSfkJ2CKwiNYUKYuufvWfJXrIO7tHjQRnM6lacAeTHBnBHh6qB6Bm_lZi8DQ_ZlE3eQ0DRoHJMbhD8WFQoVKBjo8sTes61jTIhYIZ7iktWwLL04jM3AarWdfUShOb8iURjXD0sEU92zr6qRkclc8Ovz-jW9G5FiOeXLgdB_x1bREgsvYoaQjcXN7JZLZXEbZvYTvfzqZz2iw3o4cGyo'
  },
  {
    label: 'Tối Giản Minimalist',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnb6nBcez5yJYvYR70lHYOMKVREd8AzQ_zapPUkFFN82eS-9OY5ntYCC4vDY3kzT6RLCOml9zp95IBAGuBUHEyf_L3l3gkd7SVwsT7_gDJa2qnuAGISnh4GsA6HyeJHIIUq6bsJNk4bx2uyRkJzKToMfnh_cdh7l0yemGJ_dU5aMPwqhw7FXilbvC6bPq3p9ZI2l7a9w564JUfljq7QMjecquwiK1beMwthFEDkOFGOaa2PdigQrol'
  },
  {
    label: 'Màu Phim 90s',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpXKlSfTGty-PGubJdHXwzvpNLe8cuWV-jvA6kHaI4GVCxASSifIC8yGtLn1joBZ2BXHwDDJmO5w8jwRnpWktnO9p03jRcmmy7K8KGjzhLyUypKsH_QZn73Lhx7HBUpqjS2EYa_DYgMKh4VAI7Bpfgrzu341AnUXJdn1JhDyQq1Opk6zgmFUnEK8fbiMa1zmEBFh8kjzFZkpD47zygb2J8kqhUaV6DV-M99hnxtg34F588D-bEr-7J'
  }
];

export const TemplateFormModal: React.FC<TemplateFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave
}) => {
  const isEdit = Boolean(initialData);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [style, setStyle] = useState('Thanh Lịch');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(79000);
  const [thumbnailUrl, setThumbnailUrl] = useState(SAMPLE_THUMBNAILS[0].url);
  const [thumbnailPosition, setThumbnailPosition] = useState('center 30%');
  const [previewUrl, setPreviewUrl] = useState('https://nhacotiec.vn/demo/mau-moi');
  const [status, setStatus] = useState<TemplateStatus>('published');
  const [isPinned, setIsPinned] = useState(false);
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);

  const DEFAULT_FEATURES = [
    'Thiết kế chuẩn tỉ lệ smartphone, hiển thị hoàn hảo trên mọi thiết bị',
    'Tích hợp nhạc nền tự động phát lãng mạn',
    'Sổ lưu bút & xác nhận tham dự (RSVP) trực tuyến thời gian thực',
    'Tích hợp bản đồ Google Maps chỉ đường chuẩn xác đến sảnh tiệc',
    'Đếm ngược ngày cưới & lưu lịch Google / Apple Calendar tiện lợi'
  ];

  const [musicTitle, setMusicTitle] = useState('A Thousand Years');
  const [musicArtist, setMusicArtist] = useState('Nhà Có Tiệc Studio');
  const [features, setFeatures] = useState<string[]>(DEFAULT_FEATURES);
  const [newFeatureText, setNewFeatureText] = useState('');

  // Helper to extract vertical percentage from object-position string
  const getYPercent = (posStr: string): number => {
    if (!posStr) return 30;
    if (posStr.includes('top')) return 0;
    if (posStr.includes('bottom')) return 100;
    const match = posStr.match(/(\d+)%/);
    if (match) return parseInt(match[1], 10);
    return 30;
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSlug(initialData.slug || '');
      setStyle(initialData.style || 'Thanh Lịch');
      setDescription(initialData.description || '');
      setPrice(initialData.price || 79000);
      setThumbnailUrl(initialData.thumbnailUrl || SAMPLE_THUMBNAILS[0].url);
      setThumbnailPosition(initialData.thumbnailPosition || 'center 30%');
      setPreviewUrl(initialData.previewUrl || 'https://nhacotiec.vn/demo/mau-moi');
      setStatus(initialData.status || (initialData.isActive ? 'published' : 'draft'));
      setIsPinned(Boolean(initialData.isPinned));
      setMusicTitle(initialData.musicTitle || 'A Thousand Years');
      setMusicArtist(initialData.musicArtist || 'Nhà Có Tiệc Studio');
      setFeatures(
        initialData.features && initialData.features.length > 0
          ? initialData.features
          : DEFAULT_FEATURES
      );
      setSlugEditedManually(true);
    } else {
      setName('');
      setSlug('');
      setStyle('Thanh Lịch');
      setDescription('');
      setPrice(79000);
      setThumbnailUrl(SAMPLE_THUMBNAILS[0].url);
      setThumbnailPosition('center 30%');
      setPreviewUrl('https://nhacotiec.vn/demo/mau-moi');
      setStatus('published');
      setIsPinned(false);
      setMusicTitle('A Thousand Years');
      setMusicArtist('Nhà Có Tiệc Studio');
      setFeatures(DEFAULT_FEATURES);
      setSlugEditedManually(false);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Auto-generate slug from name if not manually modified
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!slugEditedManually && !isEdit) {
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
      setPreviewUrl(`https://nhacotiec.vn/demo/${generatedSlug || 'mau-moi'}`);
    }
  };

  // Helper to quickly compress image locally
  const compressImageLocally = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxWidth = 1000;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            resolve((e.target?.result as string) || '');
          }
        };
        img.onerror = () => resolve((e.target?.result as string) || '');
        img.src = (e.target?.result as string) || '';
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Upload thumbnail: render instantly locally, then optionally upload to Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumb(true);
    try {
      // 1. Render thumbnail IMMEDIATELY (< 50ms) so user never sees a broken/empty image
      const fastPreview = await compressImageLocally(file);
      if (fastPreview) {
        setThumbnailUrl(fastPreview);
      }

      // 2. Try background upload to Firebase Storage with a strict 3-second timeout
      const uploadPromise = uploadTemplatePhoto(slug || 'template', file);
      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Storage not yet active or timed out')), 3000)
      );

      Promise.race([uploadPromise, timeoutPromise])
        .then((remoteUrl) => {
          if (remoteUrl && remoteUrl.startsWith('http')) {
            setThumbnailUrl(remoteUrl);
          }
        })
        .catch(() => {
          // Gracefully keep fastPreview (no interruption to user)
        });
    } catch (err) {
      console.warn('Failed to load image preview:', err);
    } finally {
      setIsUploadingThumb(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên mẫu thiệp');
      return;
    }
    if (!slug.trim()) {
      alert('Vui lòng nhập mã định danh slug');
      return;
    }
    if (!description.trim()) {
      alert('Vui lòng nhập mô tả phong cách thiệp');
      return;
    }
    if (!previewUrl.trim()) {
      alert('Vui lòng nhập link xem thử demo thiệp');
      return;
    }

    onSave({
      name: name.trim(),
      title: name.trim(),
      slug: slug.trim().toLowerCase(),
      style: style.trim(),
      description: description.trim(),
      price: Number(price) || 79000,
      thumbnailUrl,
      thumbnailPosition,
      previewUrl: previewUrl.trim(),
      status,
      isPinned,
      isDeleted: false,
      category: price >= 79000 ? 'premium' : 'basic',
      rating: initialData?.rating || 5.0,
      reviewCount: initialData?.reviewCount || 1,
      badgeText: price >= 79000 ? 'Cao cấp' : 'Cơ bản',
      musicTitle: musicTitle.trim() || 'A Thousand Years',
      musicArtist: musicArtist.trim() || 'Nhà Có Tiệc Studio',
      features: features.map((f) => f.trim()).filter(Boolean)
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-espresso/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-surface-card rounded-2xl border border-border-delicate shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border-delicate flex items-center justify-between bg-surface-cream/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-burgundy-wine text-white flex items-center justify-center shadow-xs">
              <Icon name={isEdit ? 'edit_note' : 'add'} className="text-[18px]" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-deep-espresso">
                {isEdit ? 'Chỉnh Sửa Mẫu Thiệp' : 'Thêm Mẫu Thiệp Mới'}
              </h2>
              <p className="text-[11px] text-text-muted">
                Tương thích Firestore collection: <strong>templates</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-subtle text-text-muted hover:text-deep-espresso transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 text-xs text-deep-espresso">
          {/* SECTION 1: BASIC INFORMATION */}
          <div className="flex flex-col gap-3">
            <span className="font-label-caps text-[10px] uppercase font-bold text-burgundy-wine tracking-wider border-b border-border-delicate pb-1 flex items-center gap-1.5">
              <Icon name="info" className="text-[14px]" />
              1. Thông Tin Cơ Bản (Basic Information)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Tên mẫu */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-deep-espresso">
                  Tên mẫu thiệp <span className="text-burgundy-wine">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Ví dụ: Minh Anh Editorial, Cổ Điển Romance..."
                  required
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                />
              </div>

              {/* Mã Slug */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-deep-espresso">
                  Mã Slug (/mau-thiep/...) <span className="text-burgundy-wine">*</span>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugEditedManually(true);
                  }}
                  placeholder="minh-anh-editorial"
                  required
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Phong cách */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-deep-espresso">
                  Phong cách thiết kế (Style) <span className="text-burgundy-wine">*</span>
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    placeholder="Thanh lịch, Editorial..."
                    required
                    className="flex-1 px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                  />
                  <select
                    onChange={(e) => {
                      if (e.target.value) setStyle(e.target.value);
                    }}
                    value=""
                    className="px-2 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs text-text-muted cursor-pointer"
                    title="Chọn từ gợi ý"
                  >
                    <option value="" disabled>Gợi ý</option>
                    {STYLE_PRESETS.map((preset) => (
                      <option key={preset} value={preset}>{preset}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Giá bán lẻ (Price) */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-deep-espresso">
                    Giá niêm yết (VNĐ) <span className="text-burgundy-wine">*</span>
                  </label>
                  <span className="font-serif font-bold text-burgundy-wine">
                    Hiển thị: {formatCurrency(price)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="1000"
                    min="10000"
                    max="1000000"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value) || 0)}
                    required
                    className="flex-1 px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                  />
                  <button
                    type="button"
                    onClick={() => setPrice(59000)}
                    className={`px-2.5 py-2 rounded-xl border text-[11px] font-semibold transition-colors ${
                      price === 59000 ? 'bg-burgundy-wine text-white border-burgundy-wine' : 'bg-surface-subtle border-border-delicate text-text-muted hover:bg-surface-card'
                    }`}
                  >
                    59k
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrice(79000)}
                    className={`px-2.5 py-2 rounded-xl border text-[11px] font-semibold transition-colors ${
                      price === 79000 ? 'bg-burgundy-wine text-white border-burgundy-wine' : 'bg-surface-subtle border-border-delicate text-text-muted hover:bg-surface-card'
                    }`}
                  >
                    79k
                  </button>
                </div>
                <span className="text-[10px] text-text-muted">
                  * Giá được lưu ở dạng số nguyên ({price}), không lưu dạng chuỗi định dạng.
                </span>
              </div>
            </div>

            {/* Mô tả */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-deep-espresso">
                Mô tả mẫu thiệp <span className="text-burgundy-wine">*</span>
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Phong cách tối giản, sang trọng, thanh lịch với tone màu kem linen trang nhã..."
                required
                className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine leading-relaxed"
              />
            </div>
          </div>

          {/* SECTION 2: MEDIA & THUMBNAIL */}
          <div className="flex flex-col gap-3 pt-2">
            <span className="font-label-caps text-[10px] uppercase font-bold text-burgundy-wine tracking-wider border-b border-border-delicate pb-1 flex items-center gap-1.5">
              <Icon name="image" className="text-[14px]" />
              2. Ảnh Bìa Đại Diện (Thumbnail)
            </span>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 rounded-xl bg-surface-subtle/70 border border-border-delicate">
              {/* Image Preview with 9:16 aspect ratio & live alignment */}
              <div className="relative w-28 aspect-[9/16] rounded-xl overflow-hidden bg-surface-card border-2 border-border-delicate shadow-xs shrink-0 group">
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover transition-all duration-300"
                  style={{ objectPosition: thumbnailPosition }}
                />
                <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono pointer-events-none">
                  9:16
                </span>
                <div className="absolute inset-0 bg-deep-espresso/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <Icon name="visibility" className="text-white text-[20px]" />
                </div>
              </div>

              {/* Action replace photo */}
              <div className="flex flex-col gap-2 flex-1 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingThumb}
                    className="px-3.5 py-1.5 rounded-full bg-burgundy-wine hover:bg-[#851622] disabled:opacity-50 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Icon name={isUploadingThumb ? 'hourglass_top' : 'upload'} className={`text-[16px] ${isUploadingThumb ? 'animate-spin' : ''}`} />
                    <span>{isUploadingThumb ? 'Đang tải ảnh...' : 'Tải ảnh từ máy'}</span>
                  </button>
                  <span className="text-[11px] text-text-muted">
                    Hỗ trợ tải ảnh từ máy lên Cloud Storage hoặc dán link bên dưới
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Direct Image URL input */}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="Dán link ảnh https://..."
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-card border border-border-delicate text-[11px] font-mono text-deep-espresso focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-text-muted font-medium">Kho ảnh mẫu sẵn có:</span>
                  {SAMPLE_THUMBNAILS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setThumbnailUrl(sample.url)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                        thumbnailUrl === sample.url
                          ? 'bg-burgundy-wine text-white border-burgundy-wine'
                          : 'bg-surface-card text-text-muted border-border-delicate hover:text-deep-espresso'
                      }`}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* MỤC CĂN CHỈNH THUMBNAIL (Thumbnail Alignment) */}
            <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-surface-cream/80 border border-border-delicate">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-deep-espresso">
                  <Icon name="tune" className="text-[16px] text-burgundy-wine" />
                  <span>Căn chỉnh vị trí hiển thị (Thumbnail Alignment)</span>
                </div>
                <span className="text-[11px] font-mono text-burgundy-wine font-semibold bg-surface-card px-2 py-0.5 rounded-md border border-border-delicate">
                  {thumbnailPosition}
                </span>
              </div>

              <p className="text-[11px] text-text-muted leading-relaxed">
                Chọn điểm trọng tâm để ảnh thiệp hiển thị cân đối nhất trong khung card tỉ lệ 9:16 trên toàn bộ website.
              </p>

              {/* Quick Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Căn trên (15%)', val: 'center 15%', icon: 'vertical_align_top', desc: 'Đầu thiệp & tên' },
                  { label: 'Căn chuẩn (30%)', val: 'center 30%', icon: 'filter_center_focus', desc: 'Chuẩn studio' },
                  { label: 'Căn giữa (50%)', val: 'center 50%', icon: 'vertical_align_center', desc: 'Trọng tâm giữa' },
                  { label: 'Căn dưới (75%)', val: 'center 75%', icon: 'vertical_align_bottom', desc: 'Ngày & địa điểm' },
                ].map((pos) => (
                  <button
                    key={pos.val}
                    type="button"
                    onClick={() => setThumbnailPosition(pos.val)}
                    className={`p-2 rounded-xl border text-left transition-all flex flex-col gap-0.5 ${
                      thumbnailPosition === pos.val
                        ? 'bg-burgundy-wine text-white border-burgundy-wine shadow-xs ring-1 ring-burgundy-wine'
                        : 'bg-surface-card text-deep-espresso border-border-delicate hover:bg-surface-subtle'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Icon name={pos.icon} className="text-[14px]" />
                      <span className="text-xs font-semibold">{pos.label}</span>
                    </div>
                    <span className={`text-[10px] ${thumbnailPosition === pos.val ? 'text-white/80' : 'text-text-muted'}`}>
                      {pos.desc}
                    </span>
                  </button>
                ))}
              </div>

              {/* Fine-tuning Slider (0% - 100%) */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-muted font-medium">Kéo thanh trượt căn chỉnh dọc chi tiết (Vertical Offset):</span>
                  <span className="font-semibold text-deep-espresso">{getYPercent(thumbnailPosition)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-text-muted">Đầu ảnh (0%)</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={getYPercent(thumbnailPosition)}
                    onChange={(e) => setThumbnailPosition(`center ${e.target.value}%`)}
                    className="flex-1 accent-burgundy-wine cursor-pointer h-1.5 bg-border-delicate rounded-lg"
                  />
                  <span className="text-[10px] text-text-muted">Đáy ảnh (100%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: PREVIEW URL & STATUS */}
          <div className="flex flex-col gap-3 pt-2">
            <span className="font-label-caps text-[10px] uppercase font-bold text-burgundy-wine tracking-wider border-b border-border-delicate pb-1 flex items-center gap-1.5">
              <Icon name="link" className="text-[14px]" />
              3. Link Xem Thử &amp; Trạng Thái Phát Hành
            </span>

            {/* Preview URL */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-deep-espresso">
                Đường link xem thử mẫu trực tiếp (Preview URL) <span className="text-burgundy-wine">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={previewUrl}
                  onChange={(e) => setPreviewUrl(e.target.value)}
                  placeholder="https://nhacotiec.vn/demo/minh-anh"
                  required
                  className="flex-1 px-3.5 py-2 rounded-xl bg-surface-subtle border border-border-delicate text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                />
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle hover:bg-surface-cream text-burgundy-wine border border-border-delicate font-semibold text-xs flex items-center gap-1 transition-colors shrink-0"
                  title="Mở thiệp xem thử trong tab mới"
                >
                  <Icon name="open_in_new" className="text-[16px]" />
                  <span>Mở xem thử</span>
                </a>
              </div>
              <p className="text-[10px] text-text-muted leading-tight">
                * Đây là URL xem bản demo trực tiếp của <strong>MẪU THIỆP</strong>, không phải thiệp của từng khách hàng riêng lẻ.
              </p>
            </div>

            {/* SECTION: BACKGROUND MUSIC */}
            <div className="p-4 rounded-xl bg-surface-subtle/70 border border-border-delicate flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-burgundy-wine/15 text-burgundy-wine flex items-center justify-center">
                  <Icon name="music_note" className="text-[14px]" />
                </div>
                <h3 className="font-serif text-sm font-bold text-deep-espresso">
                  Nhạc Nền Mẫu Thiệp (Background Music)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-deep-espresso">
                    Tên bài hát <span className="text-burgundy-wine">*</span>
                  </label>
                  <input
                    type="text"
                    value={musicTitle}
                    onChange={(e) => setMusicTitle(e.target.value)}
                    placeholder="Ví dụ: A Thousand Years, Until I Found You..."
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-card border border-border-delicate text-xs font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-deep-espresso">
                    Ca sĩ / Nghệ sĩ / Mô tả
                  </label>
                  <input
                    type="text"
                    value={musicArtist}
                    onChange={(e) => setMusicArtist(e.target.value)}
                    placeholder="Ví dụ: Christina Perri, Nhà Có Tiệc Studio..."
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-card border border-border-delicate text-xs font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                  />
                </div>
              </div>
            </div>

            {/* SECTION: TEMPLATE FEATURES */}
            <div className="p-4 rounded-xl bg-surface-subtle/70 border border-border-delicate flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-burgundy-wine/15 text-burgundy-wine flex items-center justify-center">
                    <Icon name="verified" className="text-[14px]" />
                  </div>
                  <h3 className="font-serif text-sm font-bold text-deep-espresso">
                    Mô Tả Tính Năng Mẫu Thiệp (Features / Checklist)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setFeatures(DEFAULT_FEATURES)}
                  className="text-[11px] text-burgundy-wine hover:underline font-medium"
                >
                  + Nạp 5 tính năng mẫu chuẩn
                </button>
              </div>
              <p className="text-[11px] text-text-muted">
                Các tính năng này sẽ hiển thị trong mục "Tính năng bao gồm trong mẫu này" trên trang xem chi tiết thiệp của khách.
              </p>

              {/* Feature items */}
              <div className="flex flex-col gap-2">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-surface-card border border-border-delicate">
                    <Icon name="check_circle" className="text-[16px] text-burgundy-wine shrink-0" />
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => {
                        const updated = [...features];
                        updated[idx] = e.target.value;
                        setFeatures(updated);
                      }}
                      className="flex-1 bg-transparent text-xs text-deep-espresso focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setFeatures(features.filter((_, i) => i !== idx))}
                      className="text-text-muted hover:text-red-600 transition-colors p-1"
                      title="Xóa dòng tính năng này"
                    >
                      <Icon name="close" className="text-[15px]" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add new feature input */}
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  placeholder="Nhập tính năng mới (ví dụ: Tích hợp hiệu ứng hạt hoa bay)..."
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const trimmed = newFeatureText.trim();
                      if (trimmed) {
                        setFeatures([...features, trimmed]);
                        setNewFeatureText('');
                      }
                    }
                  }}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-surface-card border border-border-delicate text-xs font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-wine"
                />
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = newFeatureText.trim();
                    if (trimmed) {
                      setFeatures([...features, trimmed]);
                      setNewFeatureText('');
                    }
                  }}
                  disabled={!newFeatureText.trim()}
                  className="px-4 py-2 rounded-xl bg-burgundy-wine text-white text-xs font-semibold hover:bg-[#851622] disabled:opacity-40 transition-colors flex items-center gap-1 shadow-xs shrink-0"
                >
                  <Icon name="add" className="text-[16px]" />
                  <span>Thêm tính năng</span>
                </button>
              </div>
            </div>

            {/* Status Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-deep-espresso">
                Trạng thái hiển thị (Status) <span className="text-burgundy-wine">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Published */}
                <label
                  className={`p-2.5 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                    status === 'published'
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-600'
                      : 'border-border-delicate bg-surface-subtle hover:bg-surface-card'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={status === 'published'}
                      onChange={() => setStatus('published')}
                      className="accent-emerald-700"
                    />
                    <span className="font-bold text-emerald-900 text-xs">Published</span>
                  </div>
                  <span className="text-[10px] text-emerald-800 leading-snug">
                    Đang mở bán, hiển thị trên website công khai.
                  </span>
                </label>

                {/* Draft */}
                <label
                  className={`p-2.5 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                    status === 'draft'
                      ? 'border-amber-600 bg-amber-50/60 shadow-xs ring-1 ring-amber-600'
                      : 'border-border-delicate bg-surface-subtle hover:bg-surface-card'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={status === 'draft'}
                      onChange={() => setStatus('draft')}
                      className="accent-amber-700"
                    />
                    <span className="font-bold text-amber-950 text-xs">Draft</span>
                  </div>
                  <span className="text-[10px] text-amber-900 leading-snug">
                    Bản nháp, chưa xuất hiện ra ngoài catalog khách.
                  </span>
                </label>

                {/* Hidden */}
                <label
                  className={`p-2.5 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                    status === 'hidden'
                      ? 'border-slate-500 bg-slate-100 shadow-xs ring-1 ring-slate-500'
                      : 'border-border-delicate bg-surface-subtle hover:bg-surface-card'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="status"
                      value="hidden"
                      checked={status === 'hidden'}
                      onChange={() => setStatus('hidden')}
                      className="accent-slate-700"
                    />
                    <span className="font-bold text-slate-800 text-xs">Hidden</span>
                  </div>
                  <span className="text-[10px] text-slate-600 leading-snug">
                    Tạm ẩn / Lưu trữ, chỉ quản trị viên xem được.
                  </span>
                </label>
              </div>
            </div>

            {/* Ghim lên Trang Chủ (Bộ sưu tập nổi bật) */}
            <div className="p-3.5 rounded-xl border border-amber-300/80 bg-amber-50/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Icon name="push_pin" className="text-[18px]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-deep-espresso flex items-center gap-1.5">
                    Ghim lên Bộ sưu tập nổi bật ở Trang chủ
                    {isPinned && (
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-semibold px-1.5 py-0.2 rounded">
                        Đang ghim
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-text-muted leading-tight mt-0.5">
                    Mẫu thiệp này sẽ được chọn hiển thị trực tiếp trong mục nổi bật tại trang chủ của khách hàng.
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-border-delicate peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-border-delicate flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-border-delicate hover:bg-surface-subtle text-text-muted hover:text-deep-espresso font-semibold text-xs transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white font-semibold text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <Icon name="check" className="text-[16px]" />
              <span>{isEdit ? 'Cập nhật mẫu thiệp' : 'Lưu mẫu thiệp mới'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
