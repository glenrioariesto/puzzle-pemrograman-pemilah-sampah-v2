import React from 'react';
import Modal from '../../../../components/ui/Modal';

interface LevelFailModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameResult: string | null;
  onRetry: () => void;
  onShowHints: () => void;
  playSound: (sound: 'click') => void;
}

export default function LevelFailModal({
  isOpen,
  onClose,
  gameResult,
  onRetry,
  onShowHints,
  playSound
}: LevelFailModalProps) {
  // Pastikan pesan yang tampil adalah pesan Bahasa Indonesia yang santun dan edukatif
  const displayMessage =
    !gameResult || gameResult === 'FAILED'
      ? 'Tukang Sampah belum berhasil menyelesaikan tugas pemilahan dengan tepat. Yuk periksa kembali urutan langkahmu!'
      : gameResult;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      title={
        <div>
          <h3 className="font-extrabold text-stone-800 text-lg font-heading">AYO COBA LAGI!</h3>
          <p className="text-stone-500 text-xs font-sans">Semua ahli pemrograman pernah salah, mari evaluasi langkahmu.</p>
        </div>
      }
    >
      <div className="space-y-4 text-center">
        <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium rounded-xl leading-relaxed text-left">
          {displayMessage}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={() => { playSound('click'); onRetry(); }}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm border-b-4 border-amber-700 active:translate-y-0.5 cursor-pointer"
          >
            Susun Ulang Program
          </button>

          <button
            type="button"
            onClick={() => { playSound('click'); onShowHints(); }}
            className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            Pelajari Petunjuk Level
          </button>
        </div>
      </div>
    </Modal>
  );
}
