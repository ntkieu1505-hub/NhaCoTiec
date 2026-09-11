import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

export type FontTheme = 'fraunces' | 'korean' | 'modern' | 'classic';

const STORAGE_KEY = 'nha_co_tiec_font_theme_v3';

export const FontSwitcher: React.FC = () => {
  const [currentFont, setCurrentFont] = useState<FontTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as FontTheme;
      if (
        saved === 'fraunces' ||
        saved === 'korean' ||
        saved === 'modern' ||
        saved === 'classic'
      ) {
        return saved;
      }
    } catch {}
    return 'fraunces'; // Default to Fraunces + Be Vietnam Pro
  });

  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-font', currentFont);
    try {
      localStorage.setItem(STORAGE_KEY, currentFont);
    } catch {}
  }, [currentFont]);

  const getThemeLabel = (theme: FontTheme) => {
    if (theme === 'fraunces') return 'Fraunces';
    if (theme === 'korean') return 'Hàn Quốc (Lora)';
    if (theme === 'modern') return 'Hiện đại (Montserrat)';
    return 'Cổ điển ban đầu';
  };

  return (
    <aside aria-label="Bộ chọn giao diện font" className="fixed bottom-5 right-5 z-[9999]">
      {isOpen ? (
        <div className="bg-surface-card/95 backdrop-blur-md border border-border-delicate rounded-2xl shadow-xl p-3.5 sm:p-4 w-[330px] max-h-[90vh] overflow-y-auto no-scrollbar flex flex-col gap-3 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between border-b border-border-delicate pb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-burgundy-wine text-white flex items-center justify-center text-xs font-bold font-serif">
                Aa
              </span>
              <span className="text-xs font-bold text-deep-espresso">
                Thử nghiệm Font chữ (4 Phong cách)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-full hover:bg-surface-subtle text-text-muted flex items-center justify-center transition-colors"
              title="Thu nhỏ"
            >
              <Icon name="close" className="text-[16px]" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {/* Option 1: Fraunces + Be Vietnam Pro */}
            <button
              type="button"
              onClick={() => setCurrentFont('fraunces')}
              className={`p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 transition-all ${
                currentFont === 'fraunces'
                  ? 'bg-burgundy-wine/10 border-burgundy-wine shadow-2xs ring-1 ring-burgundy-wine/30'
                  : 'bg-surface-subtle/50 border-border-delicate hover:bg-surface-subtle'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-deep-espresso flex items-center gap-1.5">
                  <span>📜 Fraunces & Be Vietnam Pro</span>
                  {currentFont === 'fraunces' && (
                    <span className="text-[10px] bg-burgundy-wine text-white px-1.5 py-0.2 rounded-full font-sans">
                      Đang chọn
                    </span>
                  )}
                </span>
                <span className="text-[13px] text-burgundy-wine mt-0.5 font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                  Tiêu đề Fraunces • Nội dung Be Vietnam Pro
                </span>
                <span className="text-[10px] text-text-muted italic mt-0.5">
                  Vintage Serif ấm áp hoài niệm, Be Vietnam Pro chuẩn dấu tiếng Việt siêu nét
                </span>
              </div>
              <div className="mt-0.5">
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  currentFont === 'fraunces' ? 'border-burgundy-wine bg-burgundy-wine text-white' : 'border-border-delicate'
                }`}>
                  {currentFont === 'fraunces' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
              </div>
            </button>

            {/* Option 2: Thơ mộng / Trong veo Hàn Quốc (Lora) */}
            <button
              type="button"
              onClick={() => setCurrentFont('korean')}
              className={`p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 transition-all ${
                currentFont === 'korean'
                  ? 'bg-burgundy-wine/10 border-burgundy-wine shadow-2xs ring-1 ring-burgundy-wine/30'
                  : 'bg-surface-subtle/50 border-border-delicate hover:bg-surface-subtle'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-deep-espresso flex items-center gap-1.5">
                  <span>🌸 Thơ mộng Hàn Quốc (Lora)</span>
                  {currentFont === 'korean' && (
                    <span className="text-[10px] bg-burgundy-wine text-white px-1.5 py-0.2 rounded-full font-sans">
                      Đang chọn
                    </span>
                  )}
                </span>
                <span className="text-[13px] text-burgundy-wine mt-0.5 font-medium" style={{ fontFamily: "'Lora', serif" }}>
                  Tiêu đề Lora • Nội dung Be Vietnam Pro
                </span>
                <span className="text-[10px] text-text-muted italic mt-0.5">
                  Dịu dàng, trong veo, thanh khiết như phim điện ảnh
                </span>
              </div>
              <div className="mt-0.5">
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  currentFont === 'korean' ? 'border-burgundy-wine bg-burgundy-wine text-white' : 'border-border-delicate'
                }`}>
                  {currentFont === 'korean' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
              </div>
            </button>

            {/* Option 3: Hiện đại / Tối giản (Montserrat) */}
            <button
              type="button"
              onClick={() => setCurrentFont('modern')}
              className={`p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 transition-all ${
                currentFont === 'modern'
                  ? 'bg-burgundy-wine/10 border-burgundy-wine shadow-2xs ring-1 ring-burgundy-wine/30'
                  : 'bg-surface-subtle/50 border-border-delicate hover:bg-surface-subtle'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-deep-espresso flex items-center gap-1.5">
                  <span>✨ Hiện đại / Tối giản</span>
                  {currentFont === 'modern' && (
                    <span className="text-[10px] bg-burgundy-wine text-white px-1.5 py-0.2 rounded-full font-sans">
                      Đang chọn
                    </span>
                  )}
                </span>
                <span className="text-[12px] text-text-muted mt-0.5 font-sans" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Tiêu đề Montserrat • Nội dung Be Vietnam Pro
                </span>
                <span className="text-[10px] text-text-muted italic mt-0.5">
                  Không chân, sắc nét, trẻ trung & phong cách hiện đại
                </span>
              </div>
              <div className="mt-0.5">
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  currentFont === 'modern' ? 'border-burgundy-wine bg-burgundy-wine text-white' : 'border-border-delicate'
                }`}>
                  {currentFont === 'modern' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
              </div>
            </button>

            {/* Option 4: Cổ điển ban đầu (Playfair Display) */}
            <button
              type="button"
              onClick={() => setCurrentFont('classic')}
              className={`p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 transition-all ${
                currentFont === 'classic'
                  ? 'bg-burgundy-wine/10 border-burgundy-wine shadow-2xs ring-1 ring-burgundy-wine/30'
                  : 'bg-surface-subtle/50 border-border-delicate hover:bg-surface-subtle'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-deep-espresso flex items-center gap-1.5">
                  <span>🏛️ Cổ điển ban đầu</span>
                  {currentFont === 'classic' && (
                    <span className="text-[10px] bg-burgundy-wine text-white px-1.5 py-0.2 rounded-full font-sans">
                      Đang chọn
                    </span>
                  )}
                </span>
                <span className="text-[12px] text-text-muted mt-0.5 font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Tiêu đề Playfair Display • Nội dung Plus Jakarta
                </span>
                <span className="text-[10px] text-text-muted italic mt-0.5">
                  Font gốc ban đầu của website: Lãng mạn, tạp chí cưới
                </span>
              </div>
              <div className="mt-0.5">
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  currentFont === 'classic' ? 'border-burgundy-wine bg-burgundy-wine text-white' : 'border-border-delicate'
                }`}>
                  {currentFont === 'classic' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
              </div>
            </button>
          </div>

          <p className="text-[10px] text-text-muted text-center pt-1 border-t border-border-delicate/60">
            Bấm chọn để đổi trực tiếp toàn bộ trang web ngay lập tức.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-3.5 py-2 rounded-full bg-surface-card border-2 border-burgundy-wine text-deep-espresso shadow-lg hover:shadow-xl text-xs font-bold flex items-center gap-2 transition-all group"
          title="Mở bảng chọn thử font"
        >
          <span className="w-5 h-5 rounded-full bg-burgundy-wine text-white text-[11px] flex items-center justify-center font-serif group-hover:scale-110 transition-transform">
            Aa
          </span>
          <span>Thử Font: <strong>{getThemeLabel(currentFont)}</strong></span>
        </button>
      )}
    </aside>
  );
};
