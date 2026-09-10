import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

export type FontTheme = 'modern' | 'classic';

const STORAGE_KEY = 'nha_co_tiec_font_theme';

export const FontSwitcher: React.FC = () => {
  const [currentFont, setCurrentFont] = useState<FontTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as FontTheme;
      if (saved === 'classic' || saved === 'modern') return saved;
    } catch {}
    return 'modern'; // Default to modern minimalist
  });

  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-font', currentFont);
    try {
      localStorage.setItem(STORAGE_KEY, currentFont);
    } catch {}
  }, [currentFont]);

  return (
    <aside aria-label="Bộ chọn giao diện font" className="fixed bottom-5 right-5 z-[9999]">
      {isOpen ? (
        <div className="bg-surface-card/95 backdrop-blur-md border border-border-delicate rounded-2xl shadow-xl p-3.5 sm:p-4 w-[290px] flex flex-col gap-3 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between border-b border-border-delicate pb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-burgundy-wine text-white flex items-center justify-center text-xs font-bold font-serif">
                Aa
              </span>
              <span className="text-xs font-bold text-deep-espresso">
                Thử nghiệm Font chữ
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
            {/* Option 1: Hiện đại / Tối giản (Mới) */}
            <button
              type="button"
              onClick={() => setCurrentFont('modern')}
              className={`p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 transition-all ${
                currentFont === 'modern'
                  ? 'bg-burgundy-wine/10 border-burgundy-wine shadow-2xs'
                  : 'bg-surface-subtle/50 border-border-delicate hover:bg-surface-subtle'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-deep-espresso flex items-center gap-1.5">
                  <span>Hiện đại / Tối giản</span>
                  {currentFont === 'modern' && (
                    <span className="text-[10px] bg-burgundy-wine text-white px-1.5 py-0.2 rounded-full">
                      Đang bật
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-text-muted mt-0.5 font-sans">
                  Montserrat • Be Vietnam Pro
                </span>
                <span className="text-[10px] text-text-muted italic">
                  Không chân, sắc nét, trẻ trung & tinh tế
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

            {/* Option 2: Cổ điển / Sang trọng (Gốc) */}
            <button
              type="button"
              onClick={() => setCurrentFont('classic')}
              className={`p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 transition-all ${
                currentFont === 'classic'
                  ? 'bg-burgundy-wine/10 border-burgundy-wine shadow-2xs'
                  : 'bg-surface-subtle/50 border-border-delicate hover:bg-surface-subtle'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-deep-espresso flex items-center gap-1.5">
                  <span>Cổ điển / Sang trọng</span>
                  {currentFont === 'classic' && (
                    <span className="text-[10px] bg-burgundy-wine text-white px-1.5 py-0.2 rounded-full">
                      Đang bật
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-text-muted mt-0.5 font-serif">
                  Playfair Display • Plus Jakarta
                </span>
                <span className="text-[10px] text-text-muted italic">
                  Font gốc ban đầu: Có chân, quý phái, tạp chí cưới
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
          <span>Thử Font: <strong>{currentFont === 'modern' ? 'Hiện đại' : 'Cổ điển'}</strong></span>
        </button>
      )}
    </aside>
  );
};
