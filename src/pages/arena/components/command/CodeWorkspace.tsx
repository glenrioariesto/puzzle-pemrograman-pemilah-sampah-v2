import React from 'react';
import { Instruction, GameLevel } from '../../../../types';
import InstructionBlock from '../InstructionBlock';

interface CodeWorkspaceProps {
  level: GameLevel;
  instructions: Instruction[];
  activeInstructionId: string | null;
  isExecuting: boolean;
  onUpdateInstructions: (updated: Instruction[]) => void;
  onDeleteCommand: (id: string) => void;
  onMoveCommandUp: (index: number) => void;
  onMoveCommandDown: (index: number) => void;
  onClearInstructions: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export default function CodeWorkspace({
  level,
  instructions,
  activeInstructionId,
  isExecuting,
  onUpdateInstructions,
  onDeleteCommand,
  onMoveCommandUp,
  onMoveCommandDown,
  onClearInstructions,
  onDragOver,
  onDrop,
}: CodeWorkspaceProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="flex-1 bg-[#FAF5EE] rounded-3xl p-3.5 border border-[#EED4B7] shadow-sm flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#EED4B7]/60">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-stone-700 uppercase tracking-wider font-mono">
            📜 URUTAN KODE
          </span>
          <span className="text-[10px] bg-amber-100 text-amber-800 font-mono font-bold px-2 py-0.5 rounded-full border border-amber-200">
            {instructions.length} Blok
          </span>
        </div>

        {instructions.length > 0 && (
          <button
            type="button"
            disabled={isExecuting}
            onClick={onClearInstructions}
            className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-200"
          >
            🗑️ Hapus Semua
          </button>
        )}
      </div>

      {/* List / Empty State */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {instructions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-[#EED4B7] rounded-2xl bg-white/50 text-stone-400">
            <span className="text-3xl mb-2">🧩</span>
            <p className="text-xs font-bold text-stone-500">Area Kode Masih Kosong</p>
            <p className="text-[11px] text-stone-400 max-w-xs mt-1">
              Klik atau drag & drop tombol perintah dari palet di atas untuk menyusun algoritma pemilahan.
            </p>
          </div>
        ) : (
          instructions.map((inst) => (
            <InstructionBlock
              key={inst.id}
              instruction={inst}
              activeInstructionId={activeInstructionId}
            />
          ))
        )}
      </div>
    </div>
  );
}
