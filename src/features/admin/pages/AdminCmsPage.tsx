import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../../../components/common/Icon';
import { SocialIcon, SOCIAL_PLATFORMS_LIST } from '../../../components/common/SocialIcon';
import {
  useCmsContent,
  updateEntireCms,
  resetCmsToDefaults,
  DEFAULT_CMS_CONTENT,
} from '../../../mocks/cmsStore';
import { CmsContent, HomepageFeature, Testimonial } from '../../../types/cms';

export const AdminCmsPage: React.FC = () => {
  const currentCms = useCmsContent();
  const [formData, setFormData] = useState<CmsContent>(currentCms);
  const [activeTab, setActiveTab] = useState<'homepage' | 'orderForm' | 'contact' | 'social' | 'settings'>('homepage');
  const [activeHomepageSection, setActiveHomepageSection] = useState<
    'hero' | 'features' | 'testimonials' | 'intro' | 'templates' | 'cta' | 'footer'
  >('hero');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modals / sub-editing states
  const [editingFeature, setEditingFeature] = useState<HomepageFeature | null>(null);
  const [isAddingFeature, setIsAddingFeature] = useState(false);
  const [newFeature, setNewFeature] = useState<Partial<HomepageFeature>>({
    title: '',
    subtitle: '',
    description: '',
    icon: 'star',
    enabled: true,
  });

  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState<Partial<Testimonial>>({
    customerName: '',
    coupleName: '',
    weddingDate: '',
    location: '',
    quote: '',
    rating: 5,
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    enabled: true,
  });

  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const testimonialAvatarInputRef = useRef<HTMLInputElement>(null);
  const [newBadgeText, setNewBadgeText] = useState('');

  // Helper to compress uploaded image before storing into localStorage
  const compressImageFile = (file: File, maxWidth = 1200, quality = 0.75): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Track if user has unsaved edits
  const isDirty = JSON.stringify(formData) !== JSON.stringify(currentCms);
  const isDirtyRef = useRef(false);
  isDirtyRef.current = isDirty;

  // Synchronize form data when currentCms updates (only if user does NOT have unsaved edits)
  useEffect(() => {
    if (!isDirtyRef.current) {
      setFormData(currentCms);
    }
  }, [currentCms]);

  // Handle saving
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateEntireCms(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Handle image upload for Hero with automatic compression
  const handleHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImageFile(file, 1400, 0.8);
      if (compressed) {
        setFormData((prev) => ({
          ...prev,
          hero: { ...prev.hero, coverImageUrl: compressed },
        }));
      }
    }
  };

  // Handle image upload for Testimonial with automatic compression
  const handleTestimonialAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImageFile(file, 400, 0.8);
      if (compressed) {
        if (isEdit && editingTestimonial) {
          setEditingTestimonial({ ...editingTestimonial, avatarUrl: compressed });
        } else {
          setNewTestimonial((prev) => ({ ...prev, avatarUrl: compressed }));
        }
      }
    }
  };

  // Feature operations (Section B)
  const toggleFeatureEnabled = (id: string) => {
    setFormData((prev) => {
      const updated = prev.features.map((f) =>
        f.id === id ? { ...f, enabled: !f.enabled } : f
      );
      return { ...prev, features: updated };
    });
  };

  const deleteFeature = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa cam kết này?')) {
      setFormData((prev) => ({
        ...prev,
        features: prev.features.filter((f) => f.id !== id),
      }));
    }
  };

  const saveFeatureEdit = () => {
    if (!editingFeature) return;
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((f) => (f.id === editingFeature.id ? editingFeature : f)),
    }));
    setEditingFeature(null);
  };

  const addNewFeature = () => {
    if (!newFeature.title) return;
    const created: HomepageFeature = {
      id: `f-${Date.now()}`,
      title: newFeature.title || '',
      subtitle: newFeature.subtitle || '',
      description: newFeature.description || '',
      icon: newFeature.icon || 'verified',
      enabled: newFeature.enabled !== false,
      order: formData.features.length + 1,
    };
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, created],
    }));
    setIsAddingFeature(false);
    setNewFeature({ title: '', subtitle: '', description: '', icon: 'star', enabled: true });
  };

  // Testimonial operations (Section A)
  const toggleTestimonialEnabled = (id: string) => {
    setFormData((prev) => {
      const updated = prev.testimonials.map((t) =>
        t.id === id ? { ...t, enabled: !t.enabled } : t
      );
      return { ...prev, testimonials: updated };
    });
  };

  const deleteTestimonial = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa lời chúc / phản hồi này?')) {
      setFormData((prev) => ({
        ...prev,
        testimonials: prev.testimonials.filter((t) => t.id !== id),
      }));
    }
  };

  const saveTestimonialEdit = () => {
    if (!editingTestimonial) return;
    setFormData((prev) => ({
      ...prev,
      testimonials: prev.testimonials.map((t) =>
        t.id === editingTestimonial.id ? editingTestimonial : t
      ),
    }));
    setEditingTestimonial(null);
  };

  const addNewTestimonial = () => {
    if (!newTestimonial.coupleName || !newTestimonial.quote) return;
    const created: Testimonial = {
      id: `t-${Date.now()}`,
      customerName: newTestimonial.customerName || newTestimonial.coupleName || 'Dâu Rể',
      coupleName: newTestimonial.coupleName || '',
      weddingDate: newTestimonial.weddingDate || '2026',
      location: newTestimonial.location || 'Việt Nam',
      quote: newTestimonial.quote || '',
      rating: Number(newTestimonial.rating) || 5,
      avatarUrl:
        newTestimonial.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      enabled: newTestimonial.enabled !== false,
      order: formData.testimonials.length + 1,
    };
    setFormData((prev) => ({
      ...prev,
      testimonials: [...prev.testimonials, created],
    }));
    setIsAddingTestimonial(false);
    setNewTestimonial({
      customerName: '',
      coupleName: '',
      weddingDate: '',
      location: '',
      quote: '',
      rating: 5,
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      enabled: true,
    });
  };

  // Reset handler
  const handleResetDefaults = () => {
    if (
      window.confirm(
        'Bạn có chắc muốn khôi phục toàn bộ nội dung CMS về cài đặt mẫu mặc định ban đầu?'
      )
    ) {
      resetCmsToDefaults();
      setFormData(currentCms);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-label-caps text-xs text-burgundy-wine font-bold tracking-wider">
            Mục 08 • Hệ thống nội dung CMS
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-deep-espresso mt-1">
            08. Quản lý nội dung CMS
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Điều chỉnh toàn bộ nội dung hiển thị trên website công khai: Trang chủ, Trang liên hệ, Mạng xã hội và Cài đặt chung
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-full bg-surface-subtle hover:bg-surface-container-high text-text-muted hover:text-deep-espresso text-xs font-semibold border border-border-delicate transition-all"
            title="Khôi phục nội dung gốc ban đầu"
          >
            Khôi phục mặc định
          </button>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-full bg-surface-card hover:bg-surface-subtle text-deep-espresso border border-border-delicate text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Icon name="open_in_new" className="text-[16px] text-text-muted" />
            <span>Xem trang công khai</span>
          </a>
          <button
            type="button"
            onClick={() => handleSave()}
            className="px-5 py-2 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Icon name="save" className="text-[16px]" />
            <span>Lưu tất cả thay đổi</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert Banner */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Icon name="check_circle" className="text-[18px] text-emerald-700" />
            <span>Đã lưu thành công! Nội dung mới đã được cập nhật trực tiếp lên website công khai.</span>
          </div>
          <span className="text-[11px] text-emerald-700">Real-time CMS</span>
        </div>
      )}

      {/* 2. Main 4 Tabs Navigation */}
      <div className="flex items-center border-b border-border-delicate bg-surface-card rounded-2xl p-1.5 shadow-xs">
        <button
          onClick={() => setActiveTab('homepage')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'homepage'
              ? 'bg-burgundy-wine text-white shadow-xs'
              : 'text-text-muted hover:text-deep-espresso hover:bg-surface-subtle'
          }`}
        >
          <Icon name="home" className="text-[17px]" />
          <span>Trang chủ</span>
        </button>
        <button
          onClick={() => setActiveTab('orderForm')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'orderForm'
              ? 'bg-burgundy-wine text-white shadow-xs'
              : 'text-text-muted hover:text-deep-espresso hover:bg-surface-subtle'
          }`}
        >
          <Icon name="assignment" className="text-[17px]" />
          <span>Form Đặt Thiệp & Nhập Tin</span>
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'contact'
              ? 'bg-burgundy-wine text-white shadow-xs'
              : 'text-text-muted hover:text-deep-espresso hover:bg-surface-subtle'
          }`}
        >
          <Icon name="contact_support" className="text-[17px]" />
          <span>Trang liên hệ</span>
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'social'
              ? 'bg-burgundy-wine text-white shadow-xs'
              : 'text-text-muted hover:text-deep-espresso hover:bg-surface-subtle'
          }`}
        >
          <Icon name="share" className="text-[17px]" />
          <span>Mạng xã hội</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'settings'
              ? 'bg-burgundy-wine text-white shadow-xs'
              : 'text-text-muted hover:text-deep-espresso hover:bg-surface-subtle'
          }`}
        >
          <Icon name="tune" className="text-[17px]" />
          <span>Cài đặt chung</span>
        </button>
      </div>

      {/* TAB 1: TRANG CHỦ */}
      {activeTab === 'homepage' && (
        <div className="flex flex-col gap-6">
          {/* Sub-section pill selector for Homepage */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'hero', name: 'Hero Banner', icon: 'view_carousel' },
              { id: 'features', name: 'Cam kết giá trị (Mục B)', icon: 'workspace_premium' },
              { id: 'testimonials', name: 'Lời chúc & phản hồi (Mục A)', icon: 'forum' },
              { id: 'intro', name: 'Quy trình 4 bước', icon: 'alt_route' },
              { id: 'templates', name: 'Mẫu nổi bật', icon: 'style' },
              { id: 'cta', name: 'CTA cuối trang', icon: 'campaign' },
              { id: 'footer', name: 'Chân trang Footer', icon: 'border_bottom' },
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveHomepageSection(sec.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 border transition-all ${
                  activeHomepageSection === sec.id
                    ? 'bg-deep-espresso text-surface-cream border-deep-espresso shadow-xs'
                    : 'bg-surface-card text-text-muted border-border-delicate hover:border-burgundy-wine hover:text-deep-espresso'
                }`}
              >
                <Icon name={sec.icon} className="text-[15px]" />
                <span>{sec.name}</span>
              </button>
            ))}
          </div>

          {/* Section 1: Hero Banner */}
          {activeHomepageSection === 'hero' && (
            <div className="bg-surface-card p-6 rounded-2xl border border-border-delicate shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-border-delicate">
                <div className="flex items-center gap-2">
                  <Icon name="view_carousel" className="text-[22px] text-burgundy-wine" />
                  <h3 className="font-serif text-lg font-bold text-deep-espresso">
                    1. Khối Hero Banner Trang Chủ
                  </h3>
                </div>
                <span className="text-xs text-text-muted">Đầu trang chủ</span>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">
                    Tiêu đề chính (Headline)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.hero.headline}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, headline: e.target.value },
                      })
                    }
                    placeholder="Lưu giữ khoảnh khắc&#10;thiêng liêng với website thiệp cưới."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-delicate bg-surface text-xs text-deep-espresso font-serif font-semibold focus:border-burgundy-wine focus:outline-none"
                  />
                  <span className="text-[11px] text-text-muted">
                    Nhấn Enter để xuống dòng (hiển thị cố định 2 dòng trên trang chủ).
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">
                    Đoạn phụ đề (Subtext)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.hero.subtext}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, subtext: e.target.value },
                      })
                    }
                    className="w-full p-3 rounded-xl border border-border-delicate bg-surface text-xs text-deep-espresso focus:border-burgundy-wine focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Hero Cover Image Preview & Replacement */}
                <div className="flex flex-col gap-2 pt-2">
                  <label className="text-xs font-semibold text-deep-espresso">
                    Ảnh nền bìa Hero (Cover Image)
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-surface-subtle p-3.5 rounded-xl border border-border-delicate">
                    <img
                      src={formData.hero.coverImageUrl}
                      alt="Hero preview"
                      className="w-32 h-20 object-cover rounded-lg border border-border-delicate shadow-xs"
                    />
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        ref={heroImageInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleHeroImageChange}
                      />
                      <button
                        type="button"
                        onClick={() => heroImageInputRef.current?.click()}
                        className="px-4 py-2 rounded-full bg-surface-card hover:bg-white text-deep-espresso text-xs font-semibold border border-border-delicate shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <Icon name="photo_camera" className="text-[16px] text-burgundy-wine" />
                        <span>Thay ảnh bìa Hero</span>
                      </button>
                      <span className="text-[11px] text-text-muted">
                        Hỗ trợ PNG, JPG, WebP. Tỉ lệ khuyến nghị 16:9 hoặc ảnh phong cảnh cưới lãng mạn.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-espresso">
                      Nút bấm chính (CTA Text)
                    </label>
                    <input
                      type="text"
                      value={formData.hero.ctaText}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hero: { ...formData.hero, ctaText: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-delicate bg-surface text-xs text-deep-espresso focus:border-burgundy-wine focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-espresso">
                      Đường dẫn nút (CTA Link)
                    </label>
                    <input
                      type="text"
                      value={formData.hero.ctaLink}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hero: { ...formData.hero, ctaLink: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-delicate bg-surface text-xs text-deep-espresso focus:border-burgundy-wine focus:outline-none"
                    />
                  </div>
                </div>

                {/* Badges / Micro indicators */}
                <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-surface border border-border-delicate">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-deep-espresso">
                        Các nhãn cam kết nhanh (Badges dưới nút CTA)
                      </label>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Nếu xóa hết tất cả nhãn, hàng nhãn này sẽ ẩn hoàn toàn trên trang chủ.
                      </p>
                    </div>
                    {(formData.hero.badges || []).length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            hero: { ...formData.hero, badges: [] },
                          });
                        }}
                        className="text-[11px] text-red-600 hover:text-red-700 hover:underline font-medium"
                      >
                        Xóa tất cả nhãn
                      </button>
                    )}
                  </div>

                  {/* Danh sách nhãn hiện tại */}
                  <div className="flex items-center gap-2 flex-wrap min-h-[32px]">
                    {(formData.hero.badges || []).length === 0 ? (
                      <div className="flex items-center gap-2 py-1">
                        <span className="text-xs text-text-muted italic">
                          (Hiện chưa có nhãn nào — Hàng nhãn đang được ẩn trên trang chủ)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              hero: { ...formData.hero, badges: ['Tinh tế', 'Cá nhân', 'Dễ chia sẻ'] },
                            });
                          }}
                          className="text-xs text-burgundy-wine hover:underline font-medium ml-2"
                        >
                          + Thêm lại mẫu "Tinh tế, Cá nhân, Dễ chia sẻ"
                        </button>
                      </div>
                    ) : (
                      (formData.hero.badges || []).map((b, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full bg-gold-foil/15 border border-gold-foil/40 text-deep-espresso text-xs font-medium flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>{b}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newBadges = (formData.hero.badges || []).filter((_, i) => i !== idx);
                              setFormData({
                                ...formData,
                                hero: { ...formData.hero, badges: newBadges },
                              });
                            }}
                            className="text-text-muted hover:text-red-600 transition-colors"
                            title="Xóa nhãn này"
                          >
                            <Icon name="close" className="text-[14px]" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Ô thêm nhãn mới */}
                  <div className="flex items-center gap-2 pt-1 border-t border-border-delicate/60">
                    <input
                      type="text"
                      placeholder="Nhập tên nhãn muốn thêm (ví dụ: Tinh tế, Cá nhân, Dễ chia sẻ)..."
                      value={newBadgeText}
                      onChange={(e) => setNewBadgeText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const trimmed = newBadgeText.trim();
                          if (trimmed) {
                            const current = formData.hero.badges || [];
                            if (!current.includes(trimmed)) {
                              setFormData({
                                ...formData,
                                hero: { ...formData.hero, badges: [...current, trimmed] },
                              });
                            }
                            setNewBadgeText('');
                          }
                        }
                      }}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-border-delicate bg-surface-card text-xs text-deep-espresso focus:border-burgundy-wine focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = newBadgeText.trim();
                        if (trimmed) {
                          const current = formData.hero.badges || [];
                          if (!current.includes(trimmed)) {
                            setFormData({
                              ...formData,
                              hero: { ...formData.hero, badges: [...current, trimmed] },
                            });
                          }
                          setNewBadgeText('');
                        }
                      }}
                      disabled={!newBadgeText.trim()}
                      className="px-4 py-2 rounded-xl bg-burgundy-wine text-white text-xs font-semibold hover:bg-[#851622] disabled:opacity-40 transition-colors flex items-center gap-1 shadow-xs shrink-0"
                    >
                      <Icon name="add" className="text-[16px]" />
                      <span>Thêm nhãn</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Cam kết giá trị trọn vẹn (Section B) */}
          {activeHomepageSection === 'features' && (
            <div className="bg-surface-card p-6 rounded-2xl border border-border-delicate shadow-xs flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-delicate">
                <div className="flex items-center gap-2">
                  <Icon name="workspace_premium" className="text-[22px] text-burgundy-wine" />
                  <div>
                    <h3 className="font-serif text-lg font-bold text-deep-espresso">
                      2. Cam Kết Giá Trị Trọn Vẹn (Mục B)
                    </h3>
                    <p className="text-xs text-text-muted">
                      Các quyền lợi vượt trội: Lưu trữ 1 năm, Nhạc nền &amp; Album, Quản lý RSVP tự động, 3 lần chỉnh sửa...
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingFeature(true)}
                  className="px-4 py-2 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center gap-1 shadow-xs shrink-0 self-start sm:self-auto"
                >
                  <Icon name="add" className="text-[16px]" />
                  <span>Thêm cam kết mới</span>
                </button>
              </div>

              {/* Add New Feature Form */}
              {isAddingFeature && (
                <div className="p-4 rounded-2xl bg-surface-cream border border-gold-foil/40 flex flex-col gap-3">
                  <h4 className="font-serif text-sm font-bold text-deep-espresso">
                    Thêm Cam Kết Giá Trị Mới
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-deep-espresso">Tiêu đề</label>
                      <input
                        type="text"
                        placeholder="VD: Lưu trữ 1 năm miễn phí"
                        value={newFeature.title}
                        onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border-delicate bg-surface text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-deep-espresso">Phụ đề ngắn</label>
                      <input
                        type="text"
                        placeholder="VD: 365 ngày hiển thị trực tuyến"
                        value={newFeature.subtitle}
                        onChange={(e) => setNewFeature({ ...newFeature, subtitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border-delicate bg-surface text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-deep-espresso">Mô tả chi tiết</label>
                      <textarea
                        rows={2}
                        placeholder="Mô tả giá trị mang lại cho dâu rể..."
                        value={newFeature.description}
                        onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border-delicate bg-surface text-xs resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-deep-espresso">Biểu tượng Icon (Material Name)</label>
                      <input
                        type="text"
                        placeholder="cloud_done, music_note, contact_mail..."
                        value={newFeature.icon}
                        onChange={(e) => setNewFeature({ ...newFeature, icon: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border-delicate bg-surface text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={addNewFeature}
                      className="px-4 py-1.5 rounded-full bg-burgundy-wine text-white text-xs font-semibold"
                    >
                      Xác nhận thêm
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingFeature(false)}
                      className="px-4 py-1.5 rounded-full bg-surface-subtle text-deep-espresso text-xs font-semibold"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}

              {/* Edit Feature Modal */}
              {editingFeature && (
                <div className="fixed inset-0 bg-deep-espresso/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                  <div className="bg-surface-card rounded-2xl max-w-md w-full p-6 border border-border-delicate shadow-2xl flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2 border-b border-border-delicate">
                      <h4 className="font-serif text-base font-bold text-deep-espresso">
                        Chỉnh Sửa Cam Kết
                      </h4>
                      <button onClick={() => setEditingFeature(null)}>
                        <Icon name="close" className="text-[20px] text-text-muted" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="text-xs font-semibold text-deep-espresso">Tiêu đề</label>
                        <input
                          type="text"
                          value={editingFeature.title}
                          onChange={(e) =>
                            setEditingFeature({ ...editingFeature, title: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-border-delicate bg-surface text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-deep-espresso">Phụ đề</label>
                        <input
                          type="text"
                          value={editingFeature.subtitle}
                          onChange={(e) =>
                            setEditingFeature({ ...editingFeature, subtitle: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-border-delicate bg-surface text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-deep-espresso">Mô tả</label>
                        <textarea
                          rows={3}
                          value={editingFeature.description}
                          onChange={(e) =>
                            setEditingFeature({ ...editingFeature, description: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-border-delicate bg-surface text-xs resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-deep-espresso">Icon</label>
                        <input
                          type="text"
                          value={editingFeature.icon}
                          onChange={(e) =>
                            setEditingFeature({ ...editingFeature, icon: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-border-delicate bg-surface text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingFeature(null)}
                        className="px-4 py-2 rounded-full bg-surface-subtle text-deep-espresso text-xs font-semibold"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={saveFeatureEdit}
                        className="px-5 py-2 rounded-full bg-burgundy-wine text-white text-xs font-semibold"
                      >
                        Lưu thay đổi
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* List of Features */}
              <div className="grid grid-cols-1 gap-3">
                {formData.features.map((feat) => (
                  <div
                    key={feat.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                      feat.enabled
                        ? 'bg-surface border-border-delicate'
                        : 'bg-surface-subtle/60 border-dashed border-border-delicate opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-burgundy-wine text-surface-cream flex items-center justify-center shrink-0">
                        <Icon name={feat.icon || 'star'} className="text-[20px]" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-deep-espresso">
                            {feat.title}
                          </span>
                          {feat.subtitle && (
                            <span className="text-[10px] font-semibold text-gold-foil bg-gold-foil/10 px-2 py-0.5 rounded-full">
                              {feat.subtitle}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5 max-w-xl line-clamp-1">
                          {feat.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => toggleFeatureEnabled(feat.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          feat.enabled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-surface-subtle text-text-muted'
                        }`}
                      >
                        {feat.enabled ? 'Đang hiển thị' : 'Đã ẩn'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingFeature(feat)}
                        className="p-1.5 rounded-lg hover:bg-surface-subtle text-deep-espresso"
                        title="Chỉnh sửa"
                      >
                        <Icon name="edit" className="text-[18px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteFeature(feat.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-700"
                        title="Xóa"
                      >
                        <Icon name="delete" className="text-[18px]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Lời chúc & Phản hồi (Section A) */}
          {activeHomepageSection === 'testimonials' && (
            <div className="bg-surface-card p-6 rounded-2xl border border-border-delicate shadow-xs flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-delicate">
                <div className="flex items-center gap-2">
                  <Icon name="forum" className="text-[22px] text-burgundy-wine" />
                  <div>
                    <h3 className="font-serif text-lg font-bold text-deep-espresso">
                      3. Lời Chúc &amp; Phản Hồi Từ Các Cặp Đôi (Mục A)
                    </h3>
                    <p className="text-xs text-text-muted">
                      Đánh giá 5 sao, cảm nhận thực tế của các cô dâu chú rể đã tổ chức đám cưới với Nhà Có Tiệc
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingTestimonial(true)}
                  className="px-4 py-2 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold flex items-center gap-1 shadow-xs shrink-0 self-start sm:self-auto"
                >
                  <Icon name="add" className="text-[16px]" />
                  <span>Thêm lời chúc mới</span>
                </button>
              </div>

              {/* Add New Testimonial Form */}
              {isAddingTestimonial && (
                <div className="p-5 rounded-2xl bg-surface-cream border border-gold-foil/40 flex flex-col gap-4">
                  <h4 className="font-serif text-sm font-bold text-deep-espresso">
                    Thêm Lời Chúc &amp; Phản Hồi Mới
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-deep-espresso">
                        Tên cặp đôi
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Hoàng Long & Minh Thư"
                        value={newTestimonial.coupleName}
                        onChange={(e) =>
                          setNewTestimonial({ ...newTestimonial, coupleName: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border-delicate bg-surface text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-deep-espresso">
                        Tên khách hàng liên hệ
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Minh Thư"
                        value={newTestimonial.customerName}
                        onChange={(e) =>
                          setNewTestimonial({ ...newTestimonial, customerName: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border-delicate bg-surface text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-deep-espresso">
                        Ngày cưới (hoặc thời gian)
                      </label>
                      <input
                        type="text"
                        placeholder="VD: 18.12.2025"
                        value={newTestimonial.weddingDate}
                        onChange={(e) =>
                          setNewTestimonial({ ...newTestimonial, weddingDate: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border-delicate bg-surface text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-deep-espresso">
                        Địa điểm / Thành phố
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Hà Nội"
                        value={newTestimonial.location}
                        onChange={(e) =>
                          setNewTestimonial({ ...newTestimonial, location: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border-delicate bg-surface text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-deep-espresso">
                        Đánh giá (Sao)
                      </label>
                      <select
                        value={newTestimonial.rating}
                        onChange={(e) =>
                          setNewTestimonial({ ...newTestimonial, rating: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border-delicate bg-surface text-xs"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 sao - Tuyệt vời)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 sao - Rất tốt)</option>
                        <option value={3}>⭐⭐⭐ (3 sao - Khá)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-deep-espresso">
                        Ảnh đại diện dâu rể (Avatar URL hoặc Tải lên)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={testimonialAvatarInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleTestimonialAvatarChange(e, false)}
                        />
                        <button
                          type="button"
                          onClick={() => testimonialAvatarInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-surface-card border border-border-delicate text-xs font-semibold flex items-center gap-1 shrink-0"
                        >
                          <Icon name="upload" className="text-[14px]" />
                          <span>Tải ảnh</span>
                        </button>
                        <input
                          type="text"
                          placeholder="Hoặc dán URL ảnh..."
                          value={newTestimonial.avatarUrl}
                          onChange={(e) =>
                            setNewTestimonial({ ...newTestimonial, avatarUrl: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-border-delicate bg-surface text-xs"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-deep-espresso">
                        Nội dung phản hồi / Lời chúc
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Chia sẻ trải nghiệm thực tế..."
                        value={newTestimonial.quote}
                        onChange={(e) =>
                          setNewTestimonial({ ...newTestimonial, quote: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border-delicate bg-surface text-xs resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={addNewTestimonial}
                      className="px-4 py-1.5 rounded-full bg-burgundy-wine text-white text-xs font-semibold"
                    >
                      Xác nhận thêm
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingTestimonial(false)}
                      className="px-4 py-1.5 rounded-full bg-surface-subtle text-deep-espresso text-xs font-semibold"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}

              {/* Edit Testimonial Modal */}
              {editingTestimonial && (
                <div className="fixed inset-0 bg-deep-espresso/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                  <div className="bg-surface-card rounded-2xl max-w-lg w-full p-6 border border-border-delicate shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-2 border-b border-border-delicate">
                      <h4 className="font-serif text-base font-bold text-deep-espresso">
                        Chỉnh Sửa Lời Chúc / Phản Hồi
                      </h4>
                      <button onClick={() => setEditingTestimonial(null)}>
                        <Icon name="close" className="text-[20px] text-text-muted" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-deep-espresso">
                            Tên cặp đôi
                          </label>
                          <input
                            type="text"
                            value={editingTestimonial.coupleName}
                            onChange={(e) =>
                              setEditingTestimonial({
                                ...editingTestimonial,
                                coupleName: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-border-delicate bg-surface text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-deep-espresso">
                            Ngày cưới
                          </label>
                          <input
                            type="text"
                            value={editingTestimonial.weddingDate}
                            onChange={(e) =>
                              setEditingTestimonial({
                                ...editingTestimonial,
                                weddingDate: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-border-delicate bg-surface text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-deep-espresso">
                            Địa điểm
                          </label>
                          <input
                            type="text"
                            value={editingTestimonial.location}
                            onChange={(e) =>
                              setEditingTestimonial({
                                ...editingTestimonial,
                                location: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-border-delicate bg-surface text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-deep-espresso">Số sao</label>
                          <select
                            value={editingTestimonial.rating}
                            onChange={(e) =>
                              setEditingTestimonial({
                                ...editingTestimonial,
                                rating: Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-border-delicate bg-surface text-xs"
                          >
                            <option value={5}>5 sao</option>
                            <option value={4}>4 sao</option>
                            <option value={3}>3 sao</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-deep-espresso">
                          Ảnh đại diện dâu rể
                        </label>
                        <div className="flex items-center gap-3 mt-1">
                          <img
                            src={editingTestimonial.avatarUrl}
                            alt="avatar preview"
                            className="w-12 h-12 rounded-full object-cover border border-border-delicate"
                          />
                          <input
                            type="text"
                            value={editingTestimonial.avatarUrl}
                            onChange={(e) =>
                              setEditingTestimonial({
                                ...editingTestimonial,
                                avatarUrl: e.target.value,
                              })
                            }
                            className="flex-1 px-3 py-2 rounded-lg border border-border-delicate bg-surface text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-deep-espresso">
                          Nội dung phản hồi (Quote)
                        </label>
                        <textarea
                          rows={4}
                          value={editingTestimonial.quote}
                          onChange={(e) =>
                            setEditingTestimonial({
                              ...editingTestimonial,
                              quote: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-border-delicate bg-surface text-xs resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingTestimonial(null)}
                        className="px-4 py-2 rounded-full bg-surface-subtle text-deep-espresso text-xs font-semibold"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={saveTestimonialEdit}
                        className="px-5 py-2 rounded-full bg-burgundy-wine text-white text-xs font-semibold"
                      >
                        Lưu thay đổi
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Testimonials List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.testimonials.map((t) => (
                  <div
                    key={t.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                      t.enabled
                        ? 'bg-surface border-border-delicate'
                        : 'bg-surface-subtle/60 border-dashed border-border-delicate opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={t.avatarUrl}
                          alt={t.coupleName}
                          className="w-11 h-11 rounded-full object-cover border border-gold-foil/30 shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="font-serif font-bold text-sm text-deep-espresso">
                            {t.coupleName}
                          </span>
                          <span className="text-[11px] text-text-muted">
                            {t.location} • {t.weddingDate}
                          </span>
                          <div className="flex items-center gap-0.5 text-gold-foil mt-0.5">
                            {Array.from({ length: t.rating }).map((_, i) => (
                              <Icon key={i} name="star" className="text-[13px]" />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleTestimonialEnabled(t.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            t.enabled
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-surface-subtle text-text-muted'
                          }`}
                        >
                          {t.enabled ? 'Hiển thị' : 'Ẩn'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTestimonial(t)}
                          className="p-1 rounded-lg hover:bg-surface-subtle text-deep-espresso"
                        >
                          <Icon name="edit" className="text-[16px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTestimonial(t.id)}
                          className="p-1 rounded-lg hover:bg-red-50 text-red-700"
                        >
                          <Icon name="delete" className="text-[16px]" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-text-muted italic line-clamp-2 leading-relaxed">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Quy trình 4 bước */}
          {activeHomepageSection === 'intro' && (
            <div className="bg-surface-card p-6 rounded-2xl border border-border-delicate shadow-xs flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-3 border-b border-border-delicate">
                <Icon name="alt_route" className="text-[22px] text-burgundy-wine" />
                <h3 className="font-serif text-lg font-bold text-deep-espresso">
                  4. Quy Trình 4 Bước Hoàn Thiện
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Nhãn Eyebrow</label>
                  <input
                    type="text"
                    value={formData.intro.eyebrow}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        intro: { ...formData.intro, eyebrow: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Tiêu đề chính</label>
                  <input
                    type="text"
                    value={formData.intro.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        intro: { ...formData.intro, title: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs font-serif font-bold"
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Mô tả quy trình</label>
                  <textarea
                    rows={2}
                    value={formData.intro.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        intro: { ...formData.intro, description: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <span className="text-xs font-semibold text-deep-espresso">Chi tiết 4 bước:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(formData.intro.steps || []).map((st, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-border-delicate bg-surface flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-sm font-bold text-burgundy-wine">
                          Bước {st.step}: {st.title}
                        </span>
                        <Icon name={st.icon || 'star'} className="text-[18px] text-text-muted" />
                      </div>
                      <p className="text-xs text-text-muted">{st.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Mẫu nổi bật */}
          {activeHomepageSection === 'templates' && (
            <div className="bg-surface-card p-6 rounded-2xl border border-border-delicate shadow-xs flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-3 border-b border-border-delicate">
                <Icon name="style" className="text-[22px] text-burgundy-wine" />
                <h3 className="font-serif text-lg font-bold text-deep-espresso">
                  5. Tiêu Đề Mục Bộ Sưu Tập Tuyển Chọn
                </h3>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Eyebrow</label>
                  <input
                    type="text"
                    value={formData.featuredTemplates.eyebrow}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredTemplates: {
                          ...formData.featuredTemplates,
                          eyebrow: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Tiêu đề</label>
                  <input
                    type="text"
                    value={formData.featuredTemplates.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredTemplates: { ...formData.featuredTemplates, title: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs font-serif font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Đoạn mô tả ngắn</label>
                  <textarea
                    rows={2}
                    value={formData.featuredTemplates.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredTemplates: {
                          ...formData.featuredTemplates,
                          description: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 6: CTA Cuối Trang */}
          {activeHomepageSection === 'cta' && (
            <div className="bg-surface-card p-6 rounded-2xl border border-border-delicate shadow-xs flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-3 border-b border-border-delicate">
                <Icon name="campaign" className="text-[22px] text-burgundy-wine" />
                <h3 className="font-serif text-lg font-bold text-deep-espresso">
                  6. Khối Kêu Gọi Hành Động (CTA Cuối Trang)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Tiêu đề CTA</label>
                  <input
                    type="text"
                    value={formData.cta.headline}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cta: { ...formData.cta, headline: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs font-serif font-bold"
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Đoạn phụ đề</label>
                  <textarea
                    rows={2}
                    value={formData.cta.subtext}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cta: { ...formData.cta, subtext: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs resize-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Nút bấm CTA</label>
                  <input
                    type="text"
                    value={formData.cta.buttonText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cta: { ...formData.cta, buttonText: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Đường dẫn nút</label>
                  <input
                    type="text"
                    value={formData.cta.buttonLink}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cta: { ...formData.cta, buttonLink: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs"
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Dòng cam kết</label>
                  <input
                    type="text"
                    value={formData.cta.guaranteeText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cta: { ...formData.cta, guaranteeText: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 7: Footer info */}
          {activeHomepageSection === 'footer' && (
            <div className="bg-surface-card p-6 rounded-2xl border border-border-delicate shadow-xs flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-3 border-b border-border-delicate">
                <Icon name="border_bottom" className="text-[22px] text-burgundy-wine" />
                <h3 className="font-serif text-lg font-bold text-deep-espresso">
                  7. Thông Tin Chân Trang (Footer)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Tên thương hiệu</label>
                  <input
                    type="text"
                    value={formData.footer.brandName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, brandName: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Hotline</label>
                  <input
                    type="text"
                    value={formData.footer.hotline}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, hotline: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs"
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Slogan thương hiệu</label>
                  <input
                    type="text"
                    value={formData.footer.slogan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, slogan: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Email hỗ trợ</label>
                  <input
                    type="text"
                    value={formData.footer.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, email: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Giờ làm việc</label>
                  <input
                    type="text"
                    value={formData.footer.workingHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, workingHours: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs"
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Dòng bản quyền (Copyright)</label>
                  <input
                    type="text"
                    value={formData.footer.copyrightText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, copyrightText: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: FORM ĐẶT THIỆP & NHẬP TIN KHÁCH HÀNG */}
      {activeTab === 'orderForm' && (
        <div className="bg-surface-card p-6 rounded-2xl border border-border-delicate shadow-xs flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-delicate">
            <div className="flex items-center gap-2">
              <Icon name="assignment" className="text-[22px] text-burgundy-wine" />
              <div>
                <h3 className="font-serif text-lg font-bold text-deep-espresso">
                  Cấu Hình Form Điền Thông Tin Cưới Của Khách Hàng
                </h3>
                <p className="text-xs text-text-muted">
                  Tùy chỉnh tiêu đề, hướng dẫn dâu rể, số Zalo hỗ trợ và bật/tắt các mục thông tin trong form đặt thiệp.
                </p>
              </div>
            </div>
            <a
              href="/dat-thiep/tpl-minh-anh"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-full bg-surface-subtle hover:bg-surface-cream text-burgundy-wine border border-border-delicate font-semibold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <Icon name="open_in_new" className="text-[16px]" />
              <span>Xem form thực tế</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Tiêu đề & Lời dẫn */}
            <div className="md:col-span-2 p-4 rounded-xl bg-surface border border-border-delicate flex flex-col gap-3">
              <h4 className="font-serif text-sm font-bold text-deep-espresso flex items-center gap-1.5">
                <Icon name="title" className="text-[16px] text-burgundy-wine" />
                <span>1. Tiêu Đề & Lời Dẫn Form</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Tiêu đề chính của Form</label>
                  <input
                    type="text"
                    value={formData.orderForm?.title || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orderForm: {
                          ...(formData.orderForm || DEFAULT_CMS_CONTENT.orderForm!),
                          title: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-delicate bg-surface-card text-xs text-deep-espresso font-semibold focus:border-burgundy-wine focus:outline-none"
                    placeholder="Ví dụ: Điền Thông Tin Ngày Cưới"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Mô tả phụ / Lời dẫn cho dâu rể</label>
                  <input
                    type="text"
                    value={formData.orderForm?.subtitle || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orderForm: {
                          ...(formData.orderForm || DEFAULT_CMS_CONTENT.orderForm!),
                          subtitle: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-delicate bg-surface-card text-xs text-deep-espresso focus:border-burgundy-wine focus:outline-none"
                    placeholder="Ví dụ: Cung cấp chi tiết để Nhà Có Tiệc hoàn thiện thiệp cưới hoàn hảo cho bạn"
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Thông báo / Lưu ý thời gian xử lý (Notice banner)</label>
                  <textarea
                    rows={2}
                    value={formData.orderForm?.noticeText || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orderForm: {
                          ...(formData.orderForm || DEFAULT_CMS_CONTENT.orderForm!),
                          noticeText: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-delicate bg-surface-card text-xs text-deep-espresso focus:border-burgundy-wine focus:outline-none resize-none"
                    placeholder="Ví dụ: Designer Nhà Có Tiệc sẽ liên hệ qua Zalo trong vòng 1-2h để xác nhận..."
                  />
                </div>
              </div>
            </div>

            {/* 2. Kênh hỗ trợ & Giới hạn tải ảnh */}
            <div className="p-4 rounded-xl bg-surface border border-border-delicate flex flex-col gap-3">
              <h4 className="font-serif text-sm font-bold text-deep-espresso flex items-center gap-1.5">
                <Icon name="support_agent" className="text-[16px] text-burgundy-wine" />
                <span>2. Kênh Hỗ Trợ Dâu Rể</span>
              </h4>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Số Zalo / Hotline hỗ trợ</label>
                  <input
                    type="text"
                    value={formData.orderForm?.supportZalo || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orderForm: {
                          ...(formData.orderForm || DEFAULT_CMS_CONTENT.orderForm!),
                          supportZalo: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface-card text-xs text-deep-espresso focus:border-burgundy-wine focus:outline-none"
                    placeholder="0982 123 456"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Link Zalo trực tiếp</label>
                  <input
                    type="text"
                    value={formData.orderForm?.supportZaloLink || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orderForm: {
                          ...(formData.orderForm || DEFAULT_CMS_CONTENT.orderForm!),
                          supportZaloLink: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface-card text-xs text-deep-espresso focus:border-burgundy-wine focus:outline-none"
                    placeholder="https://zalo.me/0982123456"
                  />
                </div>
              </div>
            </div>

            {/* 3. Quy định tải ảnh cưới */}
            <div className="p-4 rounded-xl bg-surface border border-border-delicate flex flex-col gap-3">
              <h4 className="font-serif text-sm font-bold text-deep-espresso flex items-center gap-1.5">
                <Icon name="photo_library" className="text-[16px] text-burgundy-wine" />
                <span>3. Quy Định Tải Ảnh Cưới</span>
              </h4>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Số lượng ảnh tối đa cho phép tải</label>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={formData.orderForm?.maxPhotos || 15}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orderForm: {
                          ...(formData.orderForm || DEFAULT_CMS_CONTENT.orderForm!),
                          maxPhotos: Number(e.target.value) || 15,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface-card text-xs text-deep-espresso focus:border-burgundy-wine focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-deep-espresso">Lời nhắc / Hướng dẫn chọn ảnh gửi</label>
                  <textarea
                    rows={2}
                    value={formData.orderForm?.photoGuideNote || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orderForm: {
                          ...(formData.orderForm || DEFAULT_CMS_CONTENT.orderForm!),
                          photoGuideNote: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface-card text-xs text-deep-espresso focus:border-burgundy-wine focus:outline-none resize-none"
                    placeholder="Gợi ý: Tải từ 5 - 15 ảnh chất lượng cao..."
                  />
                </div>
              </div>
            </div>

            {/* 4. Bật / Tắt các phần trong Form */}
            <div className="md:col-span-2 p-4 rounded-xl bg-surface border border-border-delicate flex flex-col gap-3">
              <h4 className="font-serif text-sm font-bold text-deep-espresso flex items-center gap-1.5">
                <Icon name="toggle_on" className="text-[18px] text-burgundy-wine" />
                <span>4. Bật / Tắt Các Phần Thông Tin Tùy Chọn Trong Form</span>
              </h4>
              <p className="text-[11px] text-text-muted">
                Admin có thể chủ động ẩn bớt các mục không cần thiết để form của khách gọn gàng và dễ điền hơn.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {/* Parents Section */}
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border-delicate bg-surface-card cursor-pointer hover:bg-surface-subtle transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.orderForm?.showParentsSection !== false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orderForm: {
                          ...(formData.orderForm || DEFAULT_CMS_CONTENT.orderForm!),
                          showParentsSection: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-burgundy-wine focus:ring-burgundy-wine"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-deep-espresso">Thông tin song thân</span>
                    <span className="text-[10px] text-text-muted">Bố mẹ hai bên cô dâu & chú rể</span>
                  </div>
                </label>

                {/* Love Story Section */}
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border-delicate bg-surface-card cursor-pointer hover:bg-surface-subtle transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.orderForm?.showLoveStorySection !== false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orderForm: {
                          ...(formData.orderForm || DEFAULT_CMS_CONTENT.orderForm!),
                          showLoveStorySection: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-burgundy-wine focus:ring-burgundy-wine"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-deep-espresso">Câu chuyện tình yêu</span>
                    <span className="text-[10px] text-text-muted">Kỷ niệm hẹn hò của dâu rể</span>
                  </div>
                </label>

                {/* Timeline Section */}
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border-delicate bg-surface-card cursor-pointer hover:bg-surface-subtle transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.orderForm?.showTimelineSection !== false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orderForm: {
                          ...(formData.orderForm || DEFAULT_CMS_CONTENT.orderForm!),
                          showTimelineSection: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-burgundy-wine focus:ring-burgundy-wine"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-deep-espresso">Lịch trình hôn lễ</span>
                    <span className="text-[10px] text-text-muted">Timeline các mốc giờ đón khách, khai tiệc</span>
                  </div>
                </label>

                {/* Video Section */}
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border-delicate bg-surface-card cursor-pointer hover:bg-surface-subtle transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.orderForm?.showVideoSection !== false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orderForm: {
                          ...(formData.orderForm || DEFAULT_CMS_CONTENT.orderForm!),
                          showVideoSection: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-burgundy-wine focus:ring-burgundy-wine"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-deep-espresso">Video cưới (YouTube)</span>
                    <span className="text-[10px] text-text-muted">Link video pre-wedding</span>
                  </div>
                </label>

                {/* RSVP Section */}
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border-delicate bg-surface-card cursor-pointer hover:bg-surface-subtle transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.orderForm?.showRsvpSection !== false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orderForm: {
                          ...(formData.orderForm || DEFAULT_CMS_CONTENT.orderForm!),
                          showRsvpSection: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-burgundy-wine focus:ring-burgundy-wine"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-deep-espresso">Hạn chót RSVP</span>
                    <span className="text-[10px] text-text-muted">Hạn cuối khách mời xác nhận tham dự</span>
                  </div>
                </label>
              </div>
            </div>

            {/* 5. Điều khoản dịch vụ */}
            <div className="md:col-span-2 p-4 rounded-xl bg-surface border border-border-delicate flex flex-col gap-2">
              <label className="text-xs font-semibold text-deep-espresso">
                Lời xác nhận cam kết / Điều khoản dịch vụ cuối form
              </label>
              <textarea
                rows={2}
                value={formData.orderForm?.termsText || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    orderForm: {
                      ...(formData.orderForm || DEFAULT_CMS_CONTENT.orderForm!),
                      termsText: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-delicate bg-surface-card text-xs text-deep-espresso focus:border-burgundy-wine focus:outline-none resize-none"
                placeholder="Tôi xác nhận thông tin trên là chính xác..."
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRANG LIÊN HỆ */}
      {activeTab === 'contact' && (
        <div className="bg-surface-card p-6 rounded-2xl border border-border-delicate shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-border-delicate">
            <div className="flex items-center gap-2">
              <Icon name="contact_support" className="text-[22px] text-burgundy-wine" />
              <h3 className="font-serif text-lg font-bold text-deep-espresso">
                Nội Dung Trang Liên Hệ (/lien-he)
              </h3>
            </div>
            <span className="text-xs text-text-muted">Kênh tư vấn &amp; CSKH</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-espresso">Eyebrow</label>
              <input
                type="text"
                value={formData.contact.eyebrow}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, eyebrow: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-espresso">Tiêu đề chính</label>
              <input
                type="text"
                value={formData.contact.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, title: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs font-serif font-bold"
              />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-espresso">Mô tả trang liên hệ</label>
              <textarea
                rows={2}
                value={formData.contact.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, description: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-espresso">Hotline tư vấn</label>
              <input
                type="text"
                value={formData.contact.hotline}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, hotline: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs font-semibold text-burgundy-wine"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-espresso">Hòm thư Studio</label>
              <input
                type="text"
                value={formData.contact.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, email: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-espresso">Đường dẫn Zalo (zaloUrl)</label>
              <input
                type="text"
                value={formData.contact.zaloUrl}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, zaloUrl: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-espresso">Nhãn phụ Zalo (zaloHandle)</label>
              <input
                type="text"
                value={formData.contact.zaloHandle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, zaloHandle: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-espresso">Giờ hoạt động CSKH</label>
              <input
                type="text"
                value={formData.contact.workingHours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, workingHours: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-espresso">Địa chỉ văn phòng / Studio</label>
              <input
                type="text"
                value={formData.contact.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, address: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs"
              />
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1.5 pt-2">
              <label className="text-xs font-semibold text-deep-espresso">
                Tiêu đề cam kết thời gian SLA
              </label>
              <input
                type="text"
                value={formData.contact.slaCommitmentTitle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, slaCommitmentTitle: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs"
              />
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-espresso">
                Nội dung cam kết SLA
              </label>
              <textarea
                rows={2}
                value={formData.contact.slaCommitmentDesc}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, slaCommitmentDesc: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MẠNG XÃ HỘI */}
      {activeTab === 'social' && (
        <div className="bg-surface-card p-6 rounded-2xl border border-border-delicate shadow-xs flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-delicate">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-burgundy-wine/10 text-burgundy-wine flex items-center justify-center shrink-0">
                <Icon name="share" className="text-[20px]" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-deep-espresso">
                  Quản lý mạng xã hội
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Cấu hình đường dẫn và trạng thái hiển thị cho từng biểu tượng mạng xã hội tại trang Liên hệ và Chân trang (Footer).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSave()}
              className="px-5 py-2.5 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold shadow-md flex items-center gap-1.5 self-start sm:self-auto transition-all active:scale-95"
            >
              <Icon name="save" className="text-[16px]" />
              <span>Lưu thay đổi</span>
            </button>
          </div>

          {/* Danh sách từng nền tảng: [Icon] [Tên mạng xã hội] [Ô nhập liên kết] [Bật/Tắt] [Lưu] */}
          <div className="flex flex-col divide-y divide-border-delicate">
            {SOCIAL_PLATFORMS_LIST.map((platform) => {
              const currentConfig = formData.socialLinks?.[platform.id] || {
                enabled: true,
                url: platform.defaultUrl,
              };

              return (
                <div
                  key={platform.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* [Icon] [Tên mạng xã hội] */}
                  <div className="flex items-center gap-3 w-48 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-surface-subtle border border-border-delicate flex items-center justify-center text-burgundy-wine shrink-0">
                      <SocialIcon platform={platform.id} className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-deep-espresso block">
                        {platform.name}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        {currentConfig.enabled ? 'Đang hiển thị' : 'Đang ẩn'}
                      </span>
                    </div>
                  </div>

                  {/* [Ô nhập liên kết] */}
                  <div className="flex-1 max-w-xl">
                    <input
                      type="url"
                      value={currentConfig.url}
                      onChange={(e) => {
                        const newUrl = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          socialLinks: {
                            ...(prev.socialLinks || DEFAULT_CMS_CONTENT.socialLinks!),
                            [platform.id]: {
                              ...currentConfig,
                              url: newUrl,
                            },
                          },
                        }));
                      }}
                      placeholder={platform.placeholder}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-delicate bg-surface text-xs text-deep-espresso focus:border-burgundy-wine focus:outline-none transition-colors"
                    />
                  </div>

                  {/* [Bật/Tắt] [Lưu] */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={currentConfig.enabled}
                        onChange={(e) => {
                          const newEnabled = e.target.checked;
                          setFormData((prev) => ({
                            ...prev,
                            socialLinks: {
                              ...(prev.socialLinks || DEFAULT_CMS_CONTENT.socialLinks!),
                              [platform.id]: {
                                ...currentConfig,
                                enabled: newEnabled,
                              },
                            },
                          }));
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 relative"></div>
                      <span className="text-xs font-semibold text-deep-espresso min-w-[50px]">
                        {currentConfig.enabled ? 'Bật' : 'Tắt'}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleSave()}
                      className="px-3.5 py-2 rounded-xl bg-surface-subtle hover:bg-burgundy-wine hover:text-white text-deep-espresso text-xs font-semibold border border-border-delicate transition-all flex items-center gap-1 shadow-2xs active:scale-95"
                      title={`Lưu cấu hình ${platform.name}`}
                    >
                      <Icon name="save" className="text-[14px]" />
                      <span>Lưu</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border-delicate flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-muted">
            <span>* Khi bật một nền tảng, biểu tượng sẽ hiển thị tự động tại trang Liên hệ và Chân trang.</span>
            <button
              type="button"
              onClick={() => handleSave()}
              className="px-6 py-2.5 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold shadow-md flex items-center gap-2 self-end transition-all active:scale-95"
            >
              <Icon name="save" className="text-[16px]" />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: CÀI ĐẶT CHUNG */}
      {activeTab === 'settings' && (
        <div className="bg-surface-card p-6 rounded-2xl border border-border-delicate shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-border-delicate">
            <div className="flex items-center gap-2">
              <Icon name="tune" className="text-[22px] text-burgundy-wine" />
              <h3 className="font-serif text-lg font-bold text-deep-espresso">
                Cài Đặt Nhãn Thương Hiệu &amp; Thông Báo Toàn Trang
              </h3>
            </div>
            <span className="text-xs text-text-muted">Toàn hệ thống</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-espresso">Tên website</label>
              <input
                type="text"
                value={formData.settings.siteName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, siteName: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs font-serif font-bold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-espresso">Tagline định danh</label>
              <input
                type="text"
                value={formData.settings.tagline}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, tagline: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs"
              />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-espresso">
                Meta Description (Mô tả SEO)
              </label>
              <textarea
                rows={2}
                value={formData.settings.metaDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, metaDescription: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-border-delicate bg-surface text-xs resize-none"
              />
            </div>

            {/* Cấu hình Zalo hỗ trợ khách hàng */}
            <div className="sm:col-span-2 p-4 rounded-xl bg-surface-subtle border border-border-delicate flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border-delicate/60">
                <div className="w-7 h-7 rounded-lg bg-[#0068FF]/10 text-[#0068FF] flex items-center justify-center font-bold text-xs">
                  Z
                </div>
                <div>
                  <h4 className="text-xs font-bold text-deep-espresso">Cấu hình Hỗ Trợ Khách Hàng Qua Zalo</h4>
                  <p className="text-[11px] text-text-muted">
                    Khi khách hàng nhấn nút &quot;Hỗ trợ&quot; trên toàn bộ Cổng Khách Hàng, hệ thống sẽ mở trực tiếp liên kết Zalo này sang tab mới.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-deep-espresso">Đường dẫn Zalo (zaloSupportUrl)</label>
                  <input
                    type="url"
                    placeholder="https://zalo.me/0982123456"
                    value={formData.settings.zaloSupportUrl || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          zaloSupportUrl: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-border-delicate bg-surface text-xs mt-1"
                  />
                  <span className="text-[10px] text-text-muted">Ví dụ: https://zalo.me/0982123456</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-deep-espresso">Tên hiển thị (zaloDisplayName)</label>
                  <input
                    type="text"
                    placeholder="CSKH Nhà Có Tiệc"
                    value={formData.settings.zaloDisplayName || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          zaloDisplayName: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-border-delicate bg-surface text-xs mt-1"
                  />
                  <span className="text-[10px] text-text-muted">Tên hiển thị hỗ trợ viên</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-deep-espresso">Hotline Zalo (zaloPhone)</label>
                  <input
                    type="text"
                    placeholder="0982 123 456"
                    value={formData.settings.zaloPhone || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          zaloPhone: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-border-delicate bg-surface text-xs mt-1"
                  />
                  <span className="text-[10px] text-text-muted">Số điện thoại liên hệ</span>
                </div>
              </div>
            </div>

            {/* Announcement Banner */}
            <div className="sm:col-span-2 p-4 rounded-xl bg-surface-subtle border border-border-delicate flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="campaign" className="text-[20px] text-gold-foil" />
                  <span className="text-xs font-bold text-deep-espresso">
                    Thanh thông báo nổi (Announcement Banner)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        announcementBanner: {
                          enabled: !formData.settings.announcementBanner?.enabled,
                          text: formData.settings.announcementBanner?.text || '',
                          link: formData.settings.announcementBanner?.link || '',
                        },
                      },
                    })
                  }
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    formData.settings.announcementBanner?.enabled
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-surface-card text-text-muted border border-border-delicate'
                  }`}
                >
                  {formData.settings.announcementBanner?.enabled ? 'Đang bật' : 'Đang tắt'}
                </button>
              </div>

              {formData.settings.announcementBanner?.enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-deep-espresso">
                      Nội dung thông báo
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Ưu đãi mùa cưới 2026: Miễn phí hoàn toàn 3 lần duyệt thiết kế..."
                      value={formData.settings.announcementBanner.text}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            announcementBanner: {
                              ...formData.settings.announcementBanner!,
                              text: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-border-delicate bg-surface text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-deep-espresso">
                      Đường dẫn (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      placeholder="/mau-thiep"
                      value={formData.settings.announcementBanner.link || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            announcementBanner: {
                              ...formData.settings.announcementBanner!,
                              link: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-border-delicate bg-surface text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Action Bar */}
      <div className="fixed bottom-0 right-0 left-0 lg:left-72 bg-surface/90 backdrop-blur-md border-t border-border-delicate p-4 z-30 flex items-center justify-between max-w-[1160px] mx-auto">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Icon name="cloud_done" className="text-[16px] text-emerald-700" />
          <span className="hidden sm:inline">Dữ liệu sẵn sàng đồng bộ sang Firebase trong tương lai</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-full bg-surface-subtle hover:bg-surface-container-high text-deep-espresso text-xs font-semibold border border-border-delicate transition-all"
          >
            Xem thử trên Web
          </a>
          <button
            type="button"
            onClick={() => handleSave()}
            className="px-6 py-2 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Icon name="check" className="text-[16px]" />
            <span>Lưu tất cả thay đổi</span>
          </button>
        </div>
      </div>

      {/* Floating Sticky Save Bar when user has unsaved changes */}
      {isDirty && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#1f1b19] text-white shadow-2xl border border-gold-foil/40 ring-4 ring-black/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-semibold text-white/90">
              Bạn có thay đổi chưa lưu
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleSave()}
            className="px-4 py-1.5 rounded-full bg-burgundy-wine hover:bg-[#851622] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Icon name="save" className="text-[15px]" />
            <span>Lưu ngay</span>
          </button>
        </div>
      )}
    </div>
  );
};

