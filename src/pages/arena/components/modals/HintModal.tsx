import React from 'react';
import Modal from '../../../../components/ui/Modal';
import { GameLevel } from '../../../../types';

import slide1 from '@/assets/slide1-cara-main.webp';
import slide2 from '@/assets/slide2-cara-main.webp';
import slide3 from '@/assets/slide3-cara-main.webp';
import slide4 from '@/assets/slide4-cara-main.webp';

const SLIDES = [slide1, slide2, slide3, slide4];

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: GameLevel;
  playSound: (sound: 'click') => void;
}

export default function HintModal({
  isOpen,
  onClose,
  level,
  playSound
}: HintModalProps) {
  const [activeHintSlide, setActiveHintSlide] = React.useState(0);

  React.useEffect(() => {
    if (isOpen) {
      setActiveHintSlide(0);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      title={
        <div className="flex items-center gap-2">
          <div>
            <h3 className="font-extrabold text-stone-800 text-lg font-heading">Panduan Cara Bermain</h3>
          </div>
        </div>
      }
    >
      <div className="flex flex-col">
        {/* Slide Image Content */}
        <div className="bg-[#FEF8F0] p-2 sm:p-3 border border-[#EED4B7]/70 animate-fade-in">
          <img
            key={activeHintSlide}
            src={SLIDES[activeHintSlide]}
            alt={`Panduan cara main ${activeHintSlide + 1}`}
            className="w-full max-h-[55vh] sm:max-h-[60vh] object-contain rounded-xl"
          />
        </div>

        {/* Navigation Bar */}
        <div className="px-3 pb-3 pt-2 border-t border-[#EED4B7]/50 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            disabled={activeHintSlide === 0}
            onClick={() => { playSound('click'); setActiveHintSlide(prev => Math.max(0, prev - 1)); }}
            className={`px-3.5 py-2 border border-[#EED4B7] bg-white rounded-xl text-xs font-bold text-stone-600 cursor-pointer hover:bg-stone-50 transition-colors shadow-sm ${activeHintSlide === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            Sebelumnya
          </button>

          {/* Dots */}
          <div className="flex gap-1.5">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { playSound('click'); setActiveHintSlide(idx); }}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${idx === activeHintSlide ? 'bg-indigo-600 scale-110' : 'bg-stone-200'}`}
              />
            ))}
          </div>

          {activeHintSlide < SLIDES.length - 1 ? (
            <button
              type="button"
              onClick={() => { playSound('click'); setActiveHintSlide(prev => Math.min(SLIDES.length - 1, prev + 1)); }}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 border border-amber-500 text-stone-900 rounded-xl text-xs font-extrabold transition-colors cursor-pointer shadow-sm"
            >
              Selanjutnya
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { playSound('click'); onClose(); }}
              className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 border border-emerald-500 text-stone-950 rounded-xl text-xs font-extrabold transition-colors cursor-pointer shadow-sm flex items-center gap-1"
            >
              Mulai Misi!
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
