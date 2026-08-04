import React from 'react';
import { CommandAction, GameLevel } from '../../../../types';

import imgAtas from '../../../../assets/tombol-atas.svg';
import imgBawah from '../../../../assets/tombol-bawah.svg';
import imgKiri from '../../../../assets/tombol-kiri.svg';
import imgKanan from '../../../../assets/tombol-kanan.svg';
import imgAmbil from '../../../../assets/tombol-ambil.svg';
import imgBuang from '../../../../assets/tombol-buang.svg';

interface BlockPaletteProps {
  level: GameLevel;
  instructionsCount: number;
  isExecuting: boolean;
  onAddCommand: (action: CommandAction) => void;
  onDragStart: (e: React.DragEvent, action: CommandAction) => void;
}

const COMMAND_BUTTONS: { action: CommandAction; label: string; img: string; hotkey: string }[] = [
  { action: 'UP', label: 'MAJU (W)', img: imgAtas, hotkey: 'W' },
  { action: 'DOWN', label: 'MUNDUR (S)', img: imgBawah, hotkey: 'S' },
  { action: 'LEFT', label: 'KIRI (A)', img: imgKiri, hotkey: 'A' },
  { action: 'RIGHT', label: 'KANAN (D)', img: imgKanan, hotkey: 'D' },
  { action: 'PICK', label: 'AMBIL (E)', img: imgAmbil, hotkey: 'E' },
  { action: 'DROP', label: 'BUANG (Q)', img: imgBuang, hotkey: 'Q' },
];

export default function BlockPalette({
  level,
  instructionsCount,
  isExecuting,
  onAddCommand,
  onDragStart,
}: BlockPaletteProps) {
  // Count frequency of commands in current character's instructions
  const countActionInList = (action: CommandAction) => {
    // Note: If needed, count per current workspace
    return 0;
  };

  return (
    <div className="bg-[#FAF5EE] rounded-3xl p-3 border border-[#EED4B7] shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-extrabold text-stone-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
          <span>📦</span> PALET BLOK KODE
        </span>
        <span className="text-[10px] text-stone-600 font-sans font-bold">
          Klik atau Drag blok ke area penyusunan
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {COMMAND_BUTTONS.map((btn) => {
          const limit = level.blockLimits?.[btn.action];
          const isLimitReached = limit !== undefined && countActionInList(btn.action) >= limit;
          const isDisabled = isExecuting || isLimitReached;

          return (
            <div
              key={btn.action}
              draggable={!isDisabled}
              onDragStart={(e) => onDragStart(e, btn.action)}
              onClick={() => !isDisabled && onAddCommand(btn.action)}
              className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all select-none cursor-pointer ${
                isDisabled
                  ? 'bg-stone-100 border-stone-200 opacity-40 cursor-not-allowed'
                  : 'bg-white border-[#EED4B7] hover:border-amber-400 hover:shadow-md active:scale-95'
              }`}
            >
              <img src={btn.img} alt={btn.label} className="w-10 h-10 object-contain mb-1" />
              <span className="text-[10px] font-extrabold text-stone-700 text-center leading-tight">
                {btn.label}
              </span>
              {limit !== undefined && (
                <span className="absolute top-1 right-1 text-[9px] font-mono px-1 rounded bg-amber-100 text-amber-800 border border-amber-300">
                  {limit}x
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
