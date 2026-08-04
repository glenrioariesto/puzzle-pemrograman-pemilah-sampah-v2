/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Instruction, CommandAction, GameLevel, CharacterId } from '../../../types';
import InstructionBlock from './InstructionBlock';
import { AlertCircle, Square } from 'lucide-react';

// Import character images
import charOrganik from '../../../../assets/hijau-angkat.svg';
import charAnorganik from '../../../../assets/kuning-angkat.svg';
import charB3 from '../../../../assets/merah-angkat.svg';

// Import command button images
import imgAtas from '../../../../assets/tombol-atas.svg';
import imgBawah from '../../../../assets/tombol-bawah.svg';
import imgKiri from '../../../../assets/tombol-kiri.svg';
import imgKanan from '../../../../assets/tombol-kanan.svg';
import imgAmbil from '../../../../assets/tombol-ambil.svg';
import imgBuang from '../../../../assets/tombol-buang.svg';
import imgReset from '../../../../assets/tombol-reset.svg';
import imgMulai from '../../../../assets/tombol-mulai.svg';
import imgStop from '../../../../assets/tombol-stop.svg';

interface CommandPanelProps {
  level: GameLevel;
  activeCharacter: CharacterId;
  instructions: Instruction[];
  onUpdateInstructions: (updated: Instruction[]) => void;
  onAddCommand: (action: CommandAction) => void;
  onClearInstructions: () => void;
  onDeleteCommand: (id: string) => void;
  onMoveCommandUp: (index: number) => void;
  onMoveCommandDown: (index: number) => void;
  onSelectCharacter: (characterId: CharacterId) => void;

  // Execution states
  isExecuting: boolean;
  onStartExecution: () => void;
  onStopExecution: () => void;
  activeInstructionId: string | null;
  execSpeed: number;
  onSetExecSpeed: (speed: number) => void;

  // Reset
  onReset?: () => void;

  // Total blocks
  totalBlockCount: number;
  characterBlocksCount: Record<CharacterId, number>;
}

const CHARACTER_META: Record<CharacterId, { label: string; image: string; bgClass: string; activeBgClass: string; borderClass: string }> = {
  ORGANIC: {
    label: 'Organik',
    image: charOrganik,
    bgClass: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800',
    activeBgClass: 'bg-emerald-600 text-white shadow-md border-emerald-600',
    borderClass: 'border-emerald-400',
  },
  RECYCLABLE: {
    label: 'Daur Ulang',
    image: charAnorganik,
    bgClass: 'bg-amber-50 hover:bg-amber-100 text-amber-800',
    activeBgClass: 'bg-amber-500 text-white shadow-md border-amber-500',
    borderClass: 'border-amber-400',
  },
  B3: {
    label: 'B3',
    image: charB3,
    bgClass: 'bg-red-50 hover:bg-red-100 text-red-800',
    activeBgClass: 'bg-red-600 text-white shadow-md border-red-600',
    borderClass: 'border-red-400',
  },
};

export default function CommandPanel({
  level,
  activeCharacter,
  instructions,
  onUpdateInstructions,
  onAddCommand,
  onClearInstructions,
  onDeleteCommand,
  onMoveCommandUp,
  onMoveCommandDown,
  onSelectCharacter,
  isExecuting,
  onStartExecution,
  onStopExecution,
  activeInstructionId,
  execSpeed,
  onSetExecSpeed,
  onReset,
  totalBlockCount,
  characterBlocksCount,
}: CommandPanelProps) {

  const blockCount = totalBlockCount;
  const isOverBlockLimit = level.maxInstructions ? blockCount > level.maxInstructions : false;

  // --- Drag and Drop Pointer System (Escape Parking style) ---
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  itemRefs.current = []; // Reset on render

  // Hot-path refs — mutated imperatively, never cause re-renders
  const dragIdxRef      = useRef<number | null>(null);
  const hoverIdxRef     = useRef<number | null>(null);
  const isOutsideRef    = useRef(false);
  const dragStartX      = useRef(0);
  const dragStartY      = useRef(0);
  const dragScrollStart = useRef(0);
  const snapRects       = useRef<{ top: number; left: number; width: number; height: number }[]>([]);

  // React state — only className / child changes, minimal re-renders
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoverIndex,   setHoverIndex]   = useState<number | null>(null);
  const [isOutside,    setIsOutside]    = useState(false);

  const applyDragXY = (idx: number, x: number, y: number) => {
    const el = itemRefs.current[idx];
    if (el) {
      el.style.setProperty('--drag-x', `${x}px`);
      el.style.setProperty('--drag-y', `${y}px`);
      el.style.zIndex = '50';
    }
  };

  const clearDragEl = (idx: number) => {
    const el = itemRefs.current[idx];
    if (el) {
      el.style.removeProperty('--drag-x');
      el.style.removeProperty('--drag-y');
      el.style.zIndex = '';
    }
  };

  const resetAllDrag = (dragIdx: number | null) => {
    if (dragIdx !== null) clearDragEl(dragIdx);
    dragIdxRef.current   = null;
    hoverIdxRef.current  = null;
    isOutsideRef.current = false;
    setDraggedIndex(null);
    setHoverIndex(null);
    setIsOutside(false);
  };

  const getDragItemStyle = (idx: number): React.CSSProperties => {
    if (draggedIndex === null || hoverIndex === null) return {};
    if (idx === draggedIndex) {
      return { transform: 'translate3d(var(--drag-x, 0px), var(--drag-y, 0px), 0)', transition: 'none', zIndex: 55 };
    }
    return { transition: 'transform 150ms ease' };
  };

  // Window pointer event handlers defined for robust, un-cancellable dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, index: number) => {
    if (isExecuting || e.button !== 0) return;

    // Snapshot all item rects BEFORE any visual change (layout still pristine)
    const rects: { top: number; left: number; width: number; height: number }[] = [];
    for (let i = 0; i < instructions.length; i++) {
      const el = itemRefs.current[i];
      if (el) {
        const r = el.getBoundingClientRect();
        rects.push({ top: r.top, left: r.left, width: r.width, height: r.height });
      } else {
        rects.push({ top: 0, left: 0, width: 92, height: 44 });
      }
    }
    snapRects.current = rects;

    dragIdxRef.current      = index;
    hoverIdxRef.current     = index;
    dragStartX.current      = e.clientX;
    dragStartY.current      = e.clientY;
    dragScrollStart.current = containerRef.current?.scrollTop ?? 0;
    isOutsideRef.current    = false;

    applyDragXY(index, 0, 0);
    setDraggedIndex(index);
    setHoverIndex(index);
    setIsOutside(false);

    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerCancel);
  };

  const onWindowPointerMove = (e: PointerEvent) => {
    const dragIdx = dragIdxRef.current;
    if (dragIdx === null) return;

    const scrollDiff = (containerRef.current?.scrollTop ?? 0) - dragScrollStart.current;
    const deltaX = e.clientX - dragStartX.current;
    const deltaY = e.clientY - dragStartY.current;

    // Move dragged item using deltaX and deltaY + scrollDiff (for visual relative mapping inside scroll panel)
    applyDragXY(dragIdx, deltaX, deltaY + scrollDiff);

    // Outside detection
    if (containerRef.current) {
      const cr = containerRef.current.getBoundingClientRect();
      const margin = 44;
      const outside = e.clientY < cr.top - margin || e.clientY > cr.bottom + margin
        || e.clientX < cr.left - margin || e.clientX > cr.right + margin;
      if (outside !== isOutsideRef.current) {
        isOutsideRef.current = outside;
        setIsOutside(outside);
      }
    }

    // Hover-slot from stable snapshots (Euclidean 2D Distance Search)
    const snap = snapRects.current;
    if (!snap || !snap[dragIdx]) return;
    const draggedCenterX = snap[dragIdx].left + snap[dragIdx].width / 2 + deltaX;
    const draggedCenterY = snap[dragIdx].top + snap[dragIdx].height / 2 + deltaY;

    let closestIndex = dragIdx;
    let minDistance = Infinity;

    for (let i = 0; i < snap.length; i++) {
      const centerX = snap[i].left + snap[i].width / 2;
      const centerY = snap[i].top + snap[i].height / 2;
      
      const dx = draggedCenterX - centerX;
      const dy = draggedCenterY - centerY;
      const dist = dx * dx + dy * dy;

      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    const newHover = closestIndex;
    if (newHover !== hoverIdxRef.current) {
      hoverIdxRef.current = newHover;
      setHoverIndex(newHover);
    }
  };

  const onWindowPointerUp = (e: PointerEvent) => {
    const dragIdx = dragIdxRef.current;
    if (dragIdx === null) return;

    const hover   = hoverIdxRef.current ?? dragIdx;
    const outside = isOutsideRef.current;

    window.removeEventListener('pointermove', onWindowPointerMove);
    window.removeEventListener('pointerup', onWindowPointerUp);
    window.removeEventListener('pointercancel', onWindowPointerCancel);

    dragIdxRef.current = null;
    clearDragEl(dragIdx);

    if (outside) {
      const targetId = instructions[dragIdx].id;
      onDeleteCommand(targetId);
    } else if (hover !== dragIdx) {
      const updated = [...instructions];
      const [item] = updated.splice(dragIdx, 1);
      updated.splice(hover, 0, item);
      onUpdateInstructions(updated);
    }

    hoverIdxRef.current  = null;
    isOutsideRef.current = false;
    setDraggedIndex(null);
    setHoverIndex(null);
    setIsOutside(false);
  };

  const onWindowPointerCancel = () => {
    window.removeEventListener('pointermove', onWindowPointerMove);
    window.removeEventListener('pointerup', onWindowPointerUp);
    window.removeEventListener('pointercancel', onWindowPointerCancel);
    resetAllDrag(dragIdxRef.current);
  };

  // Cleanup on unmount if drag was active
  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerCancel);
    };
  }, []);

  const handleResetAll = () => {
    onReset?.();
    onClearInstructions();
  };

  // Toolbox item definitions
  type ToolboxItem = { action: CommandAction; image: string; title: string };
  const movementItems: ToolboxItem[] = [
    { action: 'UP', image: imgAtas, title: 'Loncat' },
    { action: 'LEFT', image: imgKiri, title: 'Kiri' },
    { action: 'RIGHT', image: imgKanan, title: 'Kanan' },
  ];
  const actionItems: ToolboxItem[] = [
    { action: 'PICK', image: imgAmbil, title: 'Ambil' },
    { action: 'DROP', image: imgBuang, title: 'Buang' },
  ];

  return (
    <div className="bg-[#FCDCB5]/70 border border-[#E9BE91] rounded-2xl sm:rounded-3xl p-3 shadow-xl flex flex-col h-full space-y-1.5 md:space-y-3 overflow-hidden" id="command-panel-card">
      {/* Main Grid: Left side spawned block panel, Right side active stack */}
      <div className="grid grid-cols-12 gap-1 sm:gap-2 flex-1 min-h-0" id="command-panel-inner-grid">
        <div className="col-span-3 flex flex-col justify-start items-center overflow-y-auto px-1.5 pr-0.5 custom-scrollbar min-h-0 h-full" id="toolbox-container">
          <div className="flex flex-col gap-1.5 items-center w-full">
            {/* Grid layout for 3 movements (left) and 3 actions (right) */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full justify-items-center" id="toolbox-buttons-grid">
              {/* Kolom Kiri: 3 Gerakan (Loncat, Kiri, Kanan) */}
              <div className="flex flex-col gap-1 sm:gap-1.5 items-center w-full" id="movements-column">
                {movementItems.map((item) => (
                  <button
                    key={item.action}
                    onClick={() => onAddCommand(item.action)}
                    disabled={isExecuting}
                    className={`w-full select-none flex items-center justify-center transition-all cursor-pointer p-0 bg-transparent border-none outline-none relative hover:z-10 ${
                      isExecuting ? 'opacity-40 cursor-not-allowed' : 'active:scale-95 hover:scale-[1.02]'
                    }`}
                    title={item.title}
                    id={`add-btn-${item.action}`}
                  >
                    <img src={item.image} alt={item.title} className="w-full h-auto object-contain" />
                  </button>
                ))}
              </div>

              {/* Kolom Kanan: 3 Aksi (Ambil, Buang, Reset) */}
              <div className="flex flex-col gap-1 sm:gap-1.5 items-center w-full" id="actions-column">
                {actionItems.map((item) => (
                  <button
                    key={item.action}
                    onClick={() => onAddCommand(item.action)}
                    disabled={isExecuting}
                    className={`w-full select-none flex items-center justify-center transition-all cursor-pointer p-0 bg-transparent border-none outline-none relative hover:z-10 ${
                      isExecuting ? 'opacity-40 cursor-not-allowed' : 'active:scale-95 hover:scale-[1.02]'
                    }`}
                    title={item.title}
                    id={`add-btn-${item.action}`}
                  >
                    <img src={item.image} alt={item.title} className="w-full h-auto object-contain" />
                  </button>
                ))}

                {/* Combined Reset & Clear Instructions Button as the 3rd action */}
                <button
                  type="button"
                  onClick={handleResetAll}
                  disabled={isExecuting}
                  className={`w-full select-none flex items-center justify-center transition-all cursor-pointer p-0 bg-transparent border-none outline-none relative hover:z-10 ${
                    isExecuting ? 'opacity-40 cursor-not-allowed' : 'active:scale-95 hover:scale-[1.02]'
                  }`}
                  title="Reset Level & Hapus Semua Langkah"
                  id="add-btn-RESET"
                >
                  <img src={imgReset} alt="Reset" className="w-full h-auto object-contain" />
                </button>
              </div>
            </div>

            {/* Mulai / Hentikan Button placed BELOW the grid */}
            <div className="w-full mt-1 flex justify-center" id="mulai-hentikan-wrapper">
              {isExecuting ? (
                <button
                  type="button"
                  onClick={onStopExecution}
                  className="w-[50%] select-none flex items-center justify-center transition-all cursor-pointer p-0 bg-transparent border-none outline-none active:scale-95 hover:scale-[1.02]"
                  id="stop-execution-btn"
                >
                  <img src={imgStop} alt="Hentikan" className="w-full h-auto object-contain" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onStartExecution}
                  disabled={instructions.length === 0}
                  className={`w-[50%] select-none flex items-center justify-center transition-all cursor-pointer p-0 bg-transparent border-none outline-none ${
                    instructions.length === 0 ? 'opacity-40 cursor-not-allowed' : 'active:scale-95 hover:scale-[1.02] animate-pulse-gentle'
                  }`}
                  id="run-execution-btn"
                >
                  <img src={imgMulai} alt="Mulai" className="w-full h-auto object-contain" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right side instruction stack column */}
        <div className="col-span-9 flex flex-col bg-[#FEF8F0] rounded-xl sm:rounded-2xl border border-[#E9BE91]/70 p-1 md:p-2 relative shadow-inner" id="program-stack-container">
          {/* Character Selector Tabs — above the program stack */}
          {(level.characters || []).length > 1 && (
            <div className="flex gap-1 sm:gap-2 mb-1.5 sm:mb-3" id="character-selector-tabs">
              {(level.characters || []).map((character) => {
                const meta = CHARACTER_META[character.id];
                const isActive = activeCharacter === character.id;
                const blockCountForChar = characterBlocksCount[character.id] || 0;
                return (
                  <button
                    key={character.id}
                    type="button"
                    onClick={() => onSelectCharacter(character.id)}
                    disabled={isExecuting}
                    className={`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-1.5 md:px-2 py-1.5 md:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold font-mono border transition-all cursor-pointer ${
                      isActive
                        ? `${meta.activeBgClass} ${meta.borderClass} scale-105 shadow-inner`
                        : `${meta.bgClass} ${meta.borderClass} opacity-75 hover:opacity-100`
                    } ${isExecuting ? 'opacity-40 cursor-not-allowed' : ''}`}
                    id={`character-tab-${character.id}`}
                  >
                    <img
                      src={meta.image}
                      alt={meta.label}
                      className="h-8 sm:h-10 w-auto object-contain flex-shrink-0"
                    />
                    {blockCountForChar > 0 && (
                      <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[8px] sm:text-[9px] min-w-[14px] sm:min-w-[16px] h-3.5 sm:h-4 px-1 rounded-full flex items-center justify-center font-extrabold border border-white shadow-sm">
                        {blockCountForChar}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div 
            ref={containerRef}
            className={`flex-1 overflow-y-auto flex flex-wrap gap-y-1 md:gap-y-2 items-start content-start p-1.5 pr-0.5 sm:pr-1 custom-scrollbar min-h-0 max-h-[90px] md:max-h-[360px] mt-1 sm:mt-2 transition-all duration-200 ${
              draggedIndex !== null && isOutside
                ? 'bg-rose-50/50 border border-dashed border-rose-350 rounded-2xl scale-[0.99] shadow-inner' 
                : ''
            }`}
            id="instructions-dropzone-scrollable"
          >
            {instructions.length === 0 ? (
              <div className="h-full min-h-[60px] lg:min-h-[180px] [@media(max-height:740px)]:lg:min-h-[100px] flex flex-col items-center justify-center text-center p-1.5 lg:p-6 select-none w-full">
                <span className="text-xl sm:text-3xl mb-1 sm:mb-2.5">📂</span>
                <p className="font-bold text-[9px] sm:text-xs text-amber-955">Program Kosong</p>
                <p className="hidden sm:block text-[10px] text-gray-500 mt-1 max-w-[200px] leading-relaxed mx-auto">
                  Pilih instruksi di samping untuk mulai.
                </p>
              </div>
            ) : (
              instructions.map((inst, index) => {
                const isDragged = draggedIndex === index;
                const isHoverTarget = hoverIndex === index;
                return (
                  <div
                    key={inst.id}
                    id={`step-item-${index}`}
                    ref={(el) => {
                      if (el) itemRefs.current[index] = el;
                    }}
                    onPointerDown={(e) => handlePointerDown(e, index)}
                    onDragStart={(e) => e.preventDefault()}
                    className={`relative z-0 flex items-center justify-between bg-transparent select-none touch-none cursor-grab active:cursor-grabbing hover:brightness-95 transition-all w-[92px] sm:w-[110px] flex-shrink-0 mr-[-4px] mb-1.5 ${
                      isDragged ? 'opacity-50' : 'opacity-100'
                    } ${
                      isHoverTarget && !isDragged ? 'ring-2 ring-indigo-500 rounded-xl scale-105 z-10 shadow-lg' : ''
                    }`}
                    style={getDragItemStyle(index)}
                  >
                    <InstructionBlock
                      instruction={inst}
                      activeInstructionId={activeInstructionId}
                      isDragged={isDragged}
                      isOutside={isOutside}
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* Drag out to delete overlay badge */}
          {draggedIndex !== null && isOutside && (
            <div className="absolute inset-0 bg-rose-50/95 border-2 border-dashed border-rose-500/80 rounded-2xl flex flex-col items-center justify-center text-rose-600 font-bold p-4 animate-pulse shadow-md z-20">
              <span className="text-2xl mb-1.5">🗑️</span>
              <span className="text-xs uppercase tracking-wider font-sans">Lepas untuk Hapus Blok</span>
            </div>
          )}

          {/* Running blocks badge */}
          <div className="mt-0.5 md:mt-4 pt-0.5 md:pt-3 border-t border-[#EED4B7] flex flex-col items-stretch gap-1 md:gap-2 w-full min-w-0">
            {/* Blok badge */}
            <div className="flex flex-col sm:flex-col md:flex-row md:items-center gap-0 md:gap-1 bg-white border border-[#EED4B7] px-1.5 sm:px-2.5 py-0.5 rounded-md sm:rounded-lg shadow-sm w-full md:w-auto min-w-0">
              <span className="text-[7px] sm:text-[9px] text-amber-900/85 uppercase font-mono tracking-widest font-bold whitespace-nowrap">Total Blok</span>
              <span className={`text-[10px] sm:text-[12px] font-mono font-extrabold ${isOverBlockLimit ? 'text-rose-600 font-black animate-pulse' : 'text-amber-955'}`}>
                {blockCount}/{level.maxInstructions}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
