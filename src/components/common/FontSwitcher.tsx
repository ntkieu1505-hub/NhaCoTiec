import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

export type FontTheme = 'vintage' | 'korean' | 'romantic' | 'royal' | 'modern' | 'classic';

const STORAGE_KEY = 'nha_co_tiec_font_theme';

export const FontSwitcher: React.FC = () => {
  const [currentFont, setCurrentFont] = useState<FontTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as FontTheme;
      if (
        saved === 'vintage' ||
        saved === 'korean' ||
        saved === 'romantic' ||
        saved === 'royal' ||
        saved === 'modern' ||
        saved === 'classic'
      ) {
        return saved;
      }
    } catch {}
    return 'vintage'; // Default to Vintage Serif + Be Vietnam Pro
  });

  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-font', currentFont);
    try {
      localStorage.setItem(STORAGE_KEY, currentFont);
    } catch {}
  }, [currentFont]);

  const getThemeLabel = (theme: FontTheme) => {
    if (theme === 'vintage') return 'Vintage Serif';
    if (theme === 'korean') return 'Hàn Quốc';
    if (theme === 'romantic') return 'Viết tay';
    if (theme === 'royal') return 'Quý tộc';
    if (theme === 'modern') return 'Hiện đại';
    return 'Cổ điển';
  };

  return (
    <aside aria-label="Bộ chọn giao diện font" className="fixed bottom-5 right-5 z-[9999]">
      {isOpen ? (
        <div className="bg-surface-card/95 backdrop-blur-md border border-border-delicate rounded-2xl shadow-xl p-3.5 sm:p-4 w-[320px] max-h-[90vh] overflow-y-auto no-scrollbar flex flex-col gap-3 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between border-b border-border-delicate pb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-burgundy-wine text-white flex items-center justify-center text-xs font-bold font-serif">
                Aa
              </span>
              <span className="text-xs font-bold text-deep-espresso">
                Thử nghiệm Font chữ (6 Phong cách)
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
            {/* Option 1: Vintage Serif + Be Vietnam Pro (Mới theo yêu cầu) */}
            <button
              type="button"
              onClick={() => setCurrentFont('vintage')}
              className={`p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 transition-all ${
                currentFont === 'vintage'
                  ? 'bg-burgundy-wine/10 border-burgundy-wine shadow-2xs'
                  : 'bg-surface-subtle/50 border-border-delicate hover:bg-surface-subtle'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-deep-espresso flex items-center gap-1.5">
                  <span>📜 Vintage Serif • Be Vietnam Pro</span>
                  {currentFont === 'vintage' && (
                    <span className="text-[10px] bg-burgundy-wine text-white px-1.5 py-0.2 rounded-full font-sans">
                      Đang bật
                    </span>
                  )}
                </span>
                <span className="text-[12px] text-burgundy-wine mt-0.5 font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                  Fraunces (Vintage) • Be Vietnam Pro
                </span>
                <span className="text-[10px] text-text-muted italic mt-0.5">
                  Ấm áp, hoài niệm, cổ điển quý phái & dễ đọc
                </span>
              </div>
              <div className="mt-0.5">
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  currentFont === 'vintage' ? 'border-burgundy-wine bg-burgundy-wine text-white' : 'border-border-delicate'
                }`}>
                  {currentFont === 'vintage' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
              </div>
            </button>

            {/* Option 2: Thơ mộng / Trong veo Hàn Quốc */}
            <button
              type="button"
              onClick={() => setCurrentFont('korean')}
              className={`p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 transition-all ${
                currentFont === 'korean'
                  ? 'bg-burgundy-wine/10 border-burgundy-wine shadow-2xs'
                  : 'bg-surface-subtle/50 border-border-delicate hover:bg-surface-subtle'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-deep-espresso flex items-center gap-1.5">
                  <span>🌸 Thơ mộng Hàn Quốc</span>
                  {currentFont === 'korean' && (
                    <span className="text-[10px] bg-burgundy-wine text-white px-1.5 py-0.2 rounded-full font-sans">
                      Đang bật
                    </span>
                  )}
                </span>
                <span className="text-[12px] text-burgundy-wine mt-0.5 font-medium" style={{ fontFamily: "'Lora', serif" }}>
                  Lora • Be Vietnam Pro
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

            {/* Option 3: Viết tay uốn lượn lãng mạn */}
            <button
              type="button"
              onClick={() => setCurrentFont('romantic')}
              className={`p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 transition-all ${
                currentFont === 'romantic'
                  ? 'bg-burgundy-wine/10 border-burgundy-wine shadow-2xs'
                  : 'bg-surface-subtle/50 border-border-delicate hover:bg-surface-subtle'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-deep-espresso flex items-center gap-1.5">
                  <span>💖 Viết tay lãng mạn</span>
                  {currentFont === 'romantic' && (
                    <span className="text-[10px] bg-burgundy-wine text-white px-1.5 py-0.2 rounded-full font-sans">
                      Đang bật
                    </span>
                  )}
                </span>
                <span className="text-base text-burgundy-wine mt-0.5 leading-tight" style={{ fontFamily: "'Alex Brush', cursive" }}>
                  Alex Brush • Great Vibes
                </span>
                <span className="text-[10px] text-text-muted italic mt-0.5">
                  Nét chữ mềm mại, bay bổng, thư pháp tình yêu
                </span>
              </div>
              <div className="mt-0.5">
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  currentFont === 'romantic' ? 'border-burgundy-wine bg-burgundy-wine text-white' : 'border-border-delicate'
                }`}>
                  {currentFont === 'romantic' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
              </div>
            </button>

            {/* Option 4: Quý tộc / Hoàng gia */}
            <button
              type="button"
              onClick={() => setCurrentFont('royal')}
              className={`p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 transition-all ${
                currentFont === 'royal'
                  ? 'bg-burgundy-wine/10 border-burgundy-wine shadow-2xs'
                  : 'bg-surface-subtle/50 border-border-delicate hover:bg-surface-subtle'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-deep-espresso flex items-center gap-1.5">
                  <span>👑 Quý tộc / Hoàng gia</span>
                  {currentFont === 'royal' && (
                    <span className="text-[10px] bg-burgundy-wine text-white px-1.5 py-0.2 rounded-full font-sans">
                      Đang bật
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-text-muted mt-0.5 font-serif" style={{ fontFamily: "'Bodoni Moda', serif" }}>
                  Bodoni Moda • Cormorant
                </span>
                <span className="text-[10px] text-text-muted italic">
                  Đài các, hoàng gia châu Âu, tương phản cao
                </span>
              </div>
              <div className="mt-0.5">
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  currentFont === 'royal' ? 'border-burgundy-wine bg-burgundy-wine text-white' : 'border-border-delicate'
                }`}>
                  {currentFont === 'royal' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
              </div>
            </button>

            {/* Option 5: Hiện đại / Tối giản */}
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
                  <span>✨ Hiện đại / Tối giản</span>
                  {currentFont === 'modern' && (
                    <span className="text-[10px] bg-burgundy-wine text-white px-1.5 py-0.2 rounded-full font-sans">
                      Đang bật
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-text-muted mt-0.5 font-sans" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Montserrat • Be Vietnam Pro
                </span>
                <span className="text-[10px] text-text-muted italic">
                  Không chân, sắc nét, trẻ trung & tối giản
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

            {/* Option 6: Cổ điển / Sang trọng (Gốc) */}
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
                  <span>🏛️ Cổ điển / Trang nhã</span>
                  {currentFont === 'classic' && (
                    <span className="text-[10px] bg-burgundy-wine text-white px-1.5 py-0.2 rounded-full font-sans">
                      Đang bật
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-text-muted mt-0.5 font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Playfair Display • Plus Jakarta
                </span>
                <span className="text-[10px] text-text-muted italic">
                  Font gốc ban đầu: Lãng mạn, tạp chí cưới
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
