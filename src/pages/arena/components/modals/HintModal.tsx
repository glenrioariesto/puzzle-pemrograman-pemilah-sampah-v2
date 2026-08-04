import React from 'react';
import Modal from '../../../../components/ui/Modal';
import { GameLevel, CharacterId } from '../../../../types';

import charOrganik from '@/assets/hijau-angkat.svg';
import charAnorganik from '@/assets/kuning-angkat.svg';
import charB3 from '@/assets/merah-angkat.svg';

const CHARACTER_IMAGES: Record<CharacterId, string> = {
  ORGANIC: charOrganik,
  RECYCLABLE: charAnorganik,
  B3: charB3,
};

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
      maxWidth="max-w-lg"
      title={
        <div className="flex items-center gap-2">
          <div>
            <h3 className="font-extrabold text-stone-800 text-lg font-heading">PANDUAN & PETUNJUK LEVEL</h3>
            <p className="text-stone-500 text-xs font-sans">Pelajari misi dan strategi penyelesaian level ini.</p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-[320px] justify-between">
        {/* Slide Content */}
        <div className="flex-1 flex flex-col justify-center">
          {activeHintSlide === 0 && (
            <div className="space-y-3 bg-[#FEF8F0] p-4 rounded-2xl border border-[#EED4B7]/70 flex-1 flex flex-col justify-center animate-fade-in">
              <span className="font-extrabold text-indigo-700 flex items-center gap-1.5 text-xs tracking-wider uppercase font-mono">
                TUJUAN MISI
              </span>
              <p className="text-stone-700 text-xs leading-relaxed">{level.description}</p>
              
              {/* Character starting position info */}
              <div className="pt-2 border-t border-[#EED4B7]/40 space-y-1.5 mt-auto">
                <span className="font-bold text-indigo-700 text-[10px] tracking-wider uppercase font-mono">Posisi Mulai Karakter</span>
                <div className="flex justify-center gap-2">
                  {level.characters?.map(r => {
                    const img = CHARACTER_IMAGES[r.id];
                    return (
                      <div key={r.id} className="flex flex-col items-center p-2 bg-white border border-[#EED4B7]/40 rounded-xl text-center w-24">
                        <img src={img} alt={r.name} className="w-6 h-6 object-contain mb-1" />
                        <span className="font-extrabold text-[9px] text-stone-700">{r.name}</span>
                        <span className="text-[9px] text-stone-500 font-mono">({r.startPos.x}, {r.startPos.y})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeHintSlide === 1 && (
            <div className="space-y-4 bg-[#FEF8F0] p-4 rounded-2xl border border-[#EED4B7]/70 flex-1 flex flex-col justify-center animate-fade-in">
              <span className="font-extrabold text-indigo-700 flex items-center gap-1.5 text-xs tracking-wider uppercase font-mono">
                TARGET EFISIENSI BINTANG
              </span>
              <p className="text-stone-600 text-xs">
                Selesaikan level dengan sesedikit mungkin blok instruksi untuk mendapatkan bintang maksimal!
              </p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-3 bg-white border border-[#EED4B7]/40 rounded-2xl shadow-sm text-center">
                  <div className="flex justify-center gap-0.5 text-amber-500 mb-1">
                    <StarIcon className="w-4.5 h-4.5 fill-amber-500 text-amber-500" />
                    <StarIcon className="w-4.5 h-4.5 fill-amber-500 text-amber-500" />
                    <StarIcon className="w-4.5 h-4.5 fill-amber-500 text-amber-500" />
                  </div>
                  <span className="block font-extrabold text-xs text-stone-700">3 Bintang</span>
                  <span className="font-mono text-[10px] text-stone-500">Total blok ≤ {level.starsThreshold.three}</span>
                </div>

                <div className="p-3 bg-white border border-[#EED4B7]/40 rounded-2xl shadow-sm text-center">
                  <div className="flex justify-center gap-0.5 text-amber-500 mb-1">
                    <StarIcon className="w-4.5 h-4.5 fill-amber-500 text-amber-500" />
                    <StarIcon className="w-4.5 h-4.5 fill-amber-500 text-amber-500" />
                    <StarIcon className="w-4.5 h-4.5 text-stone-200" />
                  </div>
                  <span className="block font-extrabold text-xs text-stone-700">2 Bintang</span>
                  <span className="font-mono text-[10px] text-stone-500">Total blok ≤ {level.starsThreshold.two}</span>
                </div>
              </div>
            </div>
          )}

          {activeHintSlide === 2 && (
            <div className="space-y-3 bg-[#FEF8F0] p-4 rounded-2xl border border-[#EED4B7]/70 flex-1 flex flex-col justify-start overflow-y-auto animate-fade-in">
              <span className="font-extrabold text-indigo-700 flex items-center gap-1.5 text-xs tracking-wider uppercase font-mono">
                PETUNJUK PENYELESAIAN
              </span>
              <ul className="space-y-2 mt-1">
                {level.hints.map((hint, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-stone-600 text-xs leading-normal">
                    <span className="text-indigo-600 font-extrabold mt-0.5">•</span>
                    <span>{hint}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Navigation Bar */}
        <div className="pt-4 border-t border-[#EED4B7]/50 flex items-center justify-between mt-auto flex-shrink-0">
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
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { playSound('click'); setActiveHintSlide(idx); }}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${idx === activeHintSlide ? 'bg-indigo-600 scale-110' : 'bg-stone-200'}`}
              />
            ))}
          </div>

          {activeHintSlide < 2 ? (
            <button
              type="button"
              onClick={() => { playSound('click'); setActiveHintSlide(prev => Math.min(2, prev + 1)); }}
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

function StarIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.195-.572 1.045-.572 1.24 0l1.98 5.8 6.13.43c.613.043.86.82.387 1.218l-4.577 3.82 1.488 5.75c.149.576-.484 1.037-1.026.712L12 18.16l-5.02 2.87c-.542.325-1.175-.136-1.026-.712l1.488-5.75L2.865 10.95c-.473-.399-.226-1.175.387-1.218l6.13-.43 1.98-5.8z" />
    </svg>
  );
}
