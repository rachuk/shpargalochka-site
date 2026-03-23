'use client';

import { useEffect, useRef, useCallback, type ReactNode } from 'react';

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: string;
  children: ReactNode;
  headerRight?: ReactNode;
}

export default function SlideOver({ open, onClose, title, width = 'max-w-xl', children, headerRight }: SlideOverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    if (diff > 0 && panelRef.current) {
      panelRef.current.style.transform = `translateY(${diff}px)`;
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    const diff = currentY.current - startY.current;
    if (panelRef.current) panelRef.current.style.transform = '';
    if (diff > 120) onClose();
    startY.current = 0;
    currentY.current = 0;
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity" onClick={onClose} />

      {/* Desktop: right panel */}
      <div className={`hidden md:flex absolute right-0 top-0 h-full w-full ${width} flex-col bg-white shadow-2xl
        animate-[slideInRight_0.3s_ease]`}>
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--dash-border)] shrink-0">
            <h2 className="text-lg font-bold text-[var(--dash-text)]">{title}</h2>
            <div className="flex items-center gap-3">
              {headerRight}
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-[var(--dash-text-muted)] transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>

      {/* Mobile: bottom sheet */}
      <div
        ref={panelRef}
        className="md:hidden absolute bottom-0 left-0 right-0 max-h-[92vh] bg-white rounded-t-2xl shadow-2xl flex flex-col
          animate-[slideInUp_0.3s_ease]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-4 pb-3 border-b border-[var(--dash-border)] shrink-0">
            <h2 className="text-base font-bold text-[var(--dash-text)]">{title}</h2>
            <div className="flex items-center gap-2">
              {headerRight}
              <button onClick={onClose} className="p-1 text-[var(--dash-text-muted)]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
