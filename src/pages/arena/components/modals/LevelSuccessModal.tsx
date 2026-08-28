import React from 'react';
import Modal from '../../../../components/ui/Modal';
import { GameLevel } from '../../../../types';

interface LevelSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  stars: number;
  totalSteps: number;
  level: GameLevel;
  onNextLevel: () => void;
  onBackToDashboard: () => void;
  onRetry: () => void;
  playSound: (sound: 'click') => void;
}

export default function LevelSuccessModal({
  isOpen,
  onClose,
  stars,
  totalSteps,
  level,
  onNextLevel,
  onBackToDashboard,
  onRetry,
  playSound
}: LevelSuccessModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      title={
        <div>
          <h3 className="font-extrabold text-stone-800 text-lg font-heading">MISI SELESAI!</h3>
          <p className="text-stone-500 text-xs font-sans">Hebat! Kamu berhasil memilah semua sampah.</p>
        </div>
      }
    >
      <div className="space-y-4 text-center">
        {/* Stars */}
        <div className="flex justify-center gap-2 py-2">
          {[1, 2, 3].map((starIndex) => {
            const isEarned = starIndex <= stars;
            return (
              <div
                key={starIndex}
                className={`transform transition-all duration-300 ${
                  isEarned ? 'scale-110 rotate-3' : 'scale-90 opacity-40 grayscale'
                }`}
              >
                <StarIcon className={`w-12 h-12 ${isEarned ? 'text-amber-400 fill-amber-400 drop-shadow-md' : 'text-stone-300'}`} />
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="bg-amber-50/80 border border-[#EED4B7] rounded-2xl p-3 flex justify-around text-stone-700">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Total Blok</span>
            <span className="font-mono font-extrabold text-lg text-indigo-700">{totalSteps}</span>
          </div>
          <div className="border-r border-[#EED4B7]/60" />
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Target Bintang 3</span>
            <span className="font-mono font-extrabold text-lg text-stone-700">≤ {level.starsThreshold.three}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 p-2">
          <button
            type="button"
            onClick={() => { playSound('click'); onNextLevel(); }}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm border-b-4 border-emerald-700 active:translate-y-0.5 cursor-pointer"
          >
            Level Selanjutnya
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { playSound('click'); onRetry(); }}
              className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl border border-stone-300 text-xs transition-colors cursor-pointer"
            >
              Coba Lagi
            </button>
            <button
              type="button"
              onClick={() => { playSound('click'); onBackToDashboard(); }}
              className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl border border-stone-300 text-xs transition-colors cursor-pointer"
            >
              Menu Utama
            </button>
          </div>
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
