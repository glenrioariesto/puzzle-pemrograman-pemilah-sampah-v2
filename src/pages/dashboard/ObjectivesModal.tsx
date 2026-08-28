/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Target, CheckCircle2, ListOrdered, Layers, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ObjectivesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Slide {
  icon: React.ReactNode;
  title: string;
  items: { keyword: string; text: string }[];
}

const ACCENT = '#00ADEF';

const slides: Slide[] = [
  {
    icon: <Target className="w-3.5 h-3.5 sm:w-5 sm:h-5" />,
    title: 'Tujuan Pembelajaran',
    items: [
      {
        keyword: 'Berpikir Komputasional',
        text: 'Belajar memilah dan membuang sampah ke tempat yang tepat dengan menyusun blok perintah.',
      },
    ],
  },
  {
    icon: <ListOrdered className="w-3.5 h-3.5 sm:w-5 sm:h-5" />,
    title: 'Setelah Misi Ini, Kamu Mampu',
    items: [
      {
        keyword: 'Dekomposisi',
        text: 'Memecah rute menjadi langkah-langkah kecil (maju belok, ambil, buang).',
      },
      {
        keyword: 'Pengenalan Pola',
        text: 'Mengenali pola sampah yang sama untuk diselesaikan berulang.',
      },
    ],
  },
  {
    icon: <Layers className="w-3.5 h-3.5 sm:w-5 sm:h-5" />,
    title: 'Setelah Misi Ini, Kamu Mampu',
    items: [
      {
        keyword: 'Abstraksi',
        text: 'Memahami aturan tumpukan tas (LIFO): yang terakhir diambil, dibuang paling dulu.',
      },
      {
        keyword: 'Algoritma',
        text: 'Menyusun urutan blok perintah terbaik agar Petugas Sampah sampai tujuan.',
      },
    ],
  },
];

interface TileProps {
  accent: string | null;
  icon: React.ReactNode;
}

export default function ObjectivesModal({ isOpen, onClose }: ObjectivesModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slide = slides[currentSlide];
  const total = slides.length;
  const isFirst = currentSlide === 0;
  const isLast = currentSlide === total - 1;

  const goNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentSlide(p => p + 1);
    }
  };

  const goPrev = () => {
    if (!isFirst) setCurrentSlide(p => p - 1);
  };

  const goToSlide = (index: number) => setCurrentSlide(index);

  return (
    <div
      id="objectives-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div id="objectives-modal-overlay" className="absolute inset-0 bg-white/40 backdrop-blur-md" />

      <div
        id="objectives-modal-card"
        className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[82vh] sm:max-h-[85vh] bg-[#FAF5EE] border-4 border-[#EED4B7] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div id="objectives-modal-header" className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 px-2.5 sm:px-4 md:px-5 pt-2 sm:pt-4 md:pt-5 pb-1.5 sm:pb-3 md:pb-4 border-b border-[#EED4B7]/70 shrink-0 bg-gradient-to-r from-amber-100/60 to-orange-100/60">
          <div className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm" style={{ backgroundColor: ACCENT }}>
            {slide.icon}
          </div>
          <h2 id="objectives-modal-title" className="text-[8px] sm:text-sm md:text-base lg:text-lg font-black font-display tracking-wide text-amber-950 flex-1 leading-none">
            {slide.title}
          </h2>
          <span id="objectives-modal-counter" className="text-[7px] sm:text-[10px] md:text-xs lg:text-sm font-black text-[#00ADEF] tracking-wider font-display shrink-0 px-1.5 sm:px-2.5 md:px-3 py-0.5 md:py-1 rounded-full bg-[#00ADEF]/10 border border-[#00ADEF]/20">
            {currentSlide + 1}/{total}
          </span>
          <button
            id="objectives-modal-close-btn"
            onClick={onClose}
            className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-white/80 border border-[#EED4B7] hover:bg-stone-100 rounded-full flex items-center justify-center transition-colors shrink-0 ml-0.5 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-stone-500" />
          </button>
        </div>

        {/* Body */}
        <div id="objectives-modal-body" className="p-2.5 sm:p-4 md:p-5 flex flex-col gap-1.5 sm:gap-2.5 bg-[#FAF5EE] flex-1 min-h-0 overflow-y-auto scrollbar-none">
          {slide.items.map((item, i) => (
            <div
              key={i}
              className={`flex items-start gap-1.5 sm:gap-2.5 md:gap-3 border rounded-lg sm:rounded-xl md:rounded-2xl p-1.5 sm:p-3 md:p-4 bg-white border-[#EED4B7]/70 shadow-sm`}
            >
              <CheckCircle2 className="w-3 h-3 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 shrink-0 mt-0.5 text-[#00ADEF]" />
              <span className="text-stone-700 text-[7.5px] sm:text-[11.5px] md:text-sm lg:text-[15px] font-medium leading-snug sm:leading-relaxed font-sans">
                <strong className="font-extrabold text-amber-950" style={{ color: '#00ADEF' }}>{item.keyword}:</strong>{' '}
                {item.text}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div id="objectives-modal-footer" className="px-2.5 sm:px-4 md:px-5 pt-2 sm:pt-3 pb-2.5 sm:pb-4 border-t border-[#EED4B7]/70 shrink-0 flex flex-col gap-1.5 sm:gap-2.5">
          {/* Dot Indicators */}
          <div id="objectives-modal-dots" className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentSlide
                    ? 'w-3.5 sm:w-4 md:w-5 h-1 sm:h-1.5 md:h-2'
                    : 'w-1 sm:w-1.5 md:w-2 h-1 sm:h-1.5 md:h-2 bg-[#EED4B7] hover:bg-amber-300'
                }`}
                style={i === currentSlide ? { backgroundColor: ACCENT } : undefined}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div id="objectives-modal-nav" className="flex items-center gap-1.5 sm:gap-3 md:gap-4">
            {!isFirst && (
              <button
                id="objectives-modal-prev-btn"
                onClick={goPrev}
                className="flex-1 py-1 sm:py-2 md:py-2.5 lg:py-3 px-2.5 sm:px-4 md:px-5 rounded-xl sm:rounded-2xl text-stone-700 font-bold text-[8px] sm:text-[11px] md:text-sm lg:text-base flex items-center justify-center gap-0.5 sm:gap-1 bg-white hover:bg-stone-100 border border-[#EED4B7] transition-all font-display tracking-wider cursor-pointer"
              >
                <ChevronLeft className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                Kembali
              </button>
            )}
            <button
              id="objectives-modal-next-btn"
              onClick={goNext}
              className="flex-1 py-1 sm:py-2 md:py-2.5 lg:py-3 px-2.5 sm:px-4 md:px-5 rounded-xl sm:rounded-2xl text-white font-bold text-[8px] sm:text-[11px] md:text-sm lg:text-base flex items-center justify-center gap-0.5 sm:gap-1 transition-all font-display tracking-wider cursor-pointer shadow-md"
              style={{ backgroundColor: ACCENT }}
            >
              {isLast ? 'Mulai Bermain' : 'Lanjut'}
              {!isLast && <ChevronRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
