import React, { useEffect } from 'react';
import { Icon } from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  icon?: string;
  subtitle?: string;
  maxWidth?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  subtitle,
  maxWidth = 'max-w-md',
  children
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-deep-espresso/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
      <div
        className={`w-full ${maxWidth} bg-surface-card rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-border-delicate animate-in fade-in zoom-in-95`}
      >
        {/* Modal Header */}
        {(title || icon) && (
          <div className="flex items-start justify-between p-5 border-b border-border-delicate">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                {icon && <Icon name={icon} className="text-[22px] text-burgundy-wine" />}
                {title && (
                  <h2 className="font-headline-sm text-lg font-semibold text-deep-espresso font-serif">
                    {title}
                  </h2>
                )}
              </div>
              {subtitle && (
                <p className="text-body-sm text-[13px] text-text-muted mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 text-text-muted hover:text-deep-espresso rounded-full transition-colors active:scale-90"
              aria-label="Đóng"
            >
              <Icon name="close" className="text-[22px]" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
};
