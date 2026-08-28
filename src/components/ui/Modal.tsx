import React from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string; // e.g. 'max-w-lg'
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-lg'
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className={`bg-[#FAF5EE] rounded-3xl border-4 border-[#EED4B7] shadow-2xl w-full ${maxWidth} overflow-hidden flex flex-col max-h-[90vh] transition-all transform scale-100`}>
        {/* Header */}
        {title && (
          <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-100/60 to-orange-100/60 border-b border-[#EED4B7]/70 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              {typeof title === 'string' ? (
                <h3 className="font-extrabold text-stone-800 text-lg sm:text-xl font-heading">{title}</h3>
              ) : (
                title
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/80 border border-[#EED4B7] hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
                aria-label="Tutup"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1 text-stone-800">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-[#EED4B7]/70 bg-amber-50/50 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
