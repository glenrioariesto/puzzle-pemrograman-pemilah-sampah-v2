/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
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
  const pointerIdRef    = useRef<number | null>(null);
  const isOutsideRef    = useRef(false);
  const dragStartY      = useRef(0);
  const dragScrollStart = useRef(0);
  const snapRects       = useRef<{ top: number; height: number }[]>([]);

  // React state — only className / child changes, minimal re-renders
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoverIndex,   setHoverIndex]   = useState<number | null>(null);
  const [isOutside,    setIsOutside]    = useState(false);

  const applyDragY = (idx: number, y: number) => {
    const el = itemRefs.current[idx];
    if (el) { el.style.setProperty('--drag-y', `${y}px`); el.style.zIndex = '50'; }
  };

  const clearDragEl = (idx: number) => {
    const el = itemRefs.current[idx];
    if (el) { el.style.removeProperty('--drag-y'); el.style.zIndex = ''; }
  };

  const resetAllDrag = (dragIdx: number | null) => {
    if (dragIdx !== null) clearDragEl(dragIdx);
    dragIdxRef.current   = null;
    hoverIdxRef.current  = null;
    pointerIdRef.current = null;
    isOutsideRef.current = false;
    setDraggedIndex(null);
    setHoverIndex(null);
    setIsOutside(false);
  };

  const getSlotH = () => {
    const s = snapRects.current;
    if (!s || s.length === 0) return 44;
    return s.length > 1 ? Math.abs(s[1].top - s[0].top) : (s[0]?.height ?? 44);
  };

  const getDragItemStyle = (idx: number): React.CSSProperties => {
    if (draggedIndex === null || hoverIndex === null) return {};
    if (idx === draggedIndex) {
      return { transform: 'translate3d(0, var(--drag-y, 0px), 0)', transition: 'none', zIndex: 50 };
    }
    const slotH = getSlotH();
    let shift = 0;
    if (draggedIndex < hoverIndex && idx > draggedIndex && idx <= hoverIndex) shift = -slotH;
    if (draggedIndex > hoverIndex && idx >= hoverIndex && idx < draggedIndex)  shift =  slotH;
    return shift !== 0
      ? { transform: `translateY(${shift}px)`, transition: 'transform 150ms ease' }
      : { transition: 'transform 150ms ease' };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, index: number) => {
    if (isExecuting || e.button !== 0) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }

    // Snapshot all item rects BEFORE any visual change (layout still pristine)
    const rects: { top: number; height: number }[] = [];
    for (let i = 0; i < instructions.length; i++) {
      const el = itemRefs.current[i];
      if (el) {
        const r = el.getBoundingClientRect();
        rects.push({ top: r.top, height: r.height });
      } else {
        rects.push({ top: 0, height: 44 });
      }
    }
    snapRects.current = rects;

    dragIdxRef.current      = index;
    hoverIdxRef.current     = index;
    pointerIdRef.current    = e.pointerId;
    dragStartY.current      = e.clientY;
    dragScrollStart.current = containerRef.current?.scrollTop ?? 0;
    isOutsideRef.current    = false;

    applyDragY(index, 0);
    setDraggedIndex(index);
    setHoverIndex(index);
    setIsOutside(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const dragIdx = dragIdxRef.current;
    if (dragIdx === null || e.pointerId !== pointerIdRef.current) return;

    const scrollDiff = (containerRef.current?.scrollTop ?? 0) - dragScrollStart.current;
    const deltaY = (e.clientY - dragStartY.current) + scrollDiff;

    // Move dragged item — pure DOM mutation, zero React re-render
    applyDragY(dragIdx, deltaY);

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

    // Hover-slot from stable snapshots
    const snap = snapRects.current;
    if (!snap || !snap[dragIdx]) return;
    const draggedCenterY = snap[dragIdx].top + snap[dragIdx].height / 2 + deltaY;
    let count = 0;
    for (let i = 0; i < snap.length; i++) {
      if (i === dragIdx) continue;
      if (snap[i].top + snap[i].height / 2 < draggedCenterY) count++;
    }
    const newHover = Math.max(0, Math.min(instructions.length - 1, count));
    if (newHover !== hoverIdxRef.current) {
      hoverIdxRef.current = newHover;
      setHoverIndex(newHover);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const dragIdx = dragIdxRef.current;
    if (dragIdx === null) return;

    const hover   = hoverIdxRef.current ?? dragIdx;
    const outside = isOutsideRef.current;

    dragIdxRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }

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
    pointerIdRef.current = null;
    isOutsideRef.current = false;
    setDraggedIndex(null);
    setHoverIndex(null);
    setIsOutside(false);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    resetAllDrag(dragIdxRef.current);
  };

  const handleLostPointerCapture = () => resetAllDrag(dragIdxRef.current);

  const handleResetAll = () => {
    onReset?.();
    onClearInstructions();
  };

  // Toolbox item definitions (Action blocks)
  type ToolboxItem = { action: CommandAction; image: string; title: string };
  const actionItems: ToolboxItem[] = [
    { action: 'UP', image: imgAtas, title: 'Atas' },
    { action: 'DOWN', image: imgBawah, title: 'Bawah' },
    { action: 'LEFT', image: imgKiri, title: 'Kiri' },
    { action: 'RIGHT', image: imgKanan, title: 'Kanan' },
    { action: 'PICK', image: imgAmbil, title: 'Ambil' },
    { action: 'DROP', image: imgBuang, title: 'Buang' },
  ];

  return (
    <div className="bg-[#FCDCB5]/70 border border-[#E9BE91] rounded-2xl sm:rounded-3xl p-3 shadow-xl flex flex-col h-full space-y-1.5 md:space-y-3 overflow-y-auto" id="command-panel-card">

      {/* Main Grid: Left side spawned block panel, Right side active stack */}
      <div className="grid grid-cols-12 gap-1 sm:gap-2 flex-1 min-h-0" id="command-panel-inner-grid">
        {/* Left side toolbox column */}
        <div className="col-span-4 flex flex-col justify-between" id="toolbox-container">
          <div className="flex flex-col gap-1.5">
            {/* Direction & Action Blocks */}
            {actionItems.map((item) => (
              <button
                key={item.action}
                onClick={() => onAddCommand(item.action)}
                disabled={isExecuting}
                className={`w-full select-none flex items-center justify-center transition-all cursor-pointer p-0 bg-transparent border-none outline-none ${
                  isExecuting ? 'opacity-40 cursor-not-allowed' : 'active:scale-95 hover:scale-[1.02]'
                }`}
                title={item.title}
                id={`add-btn-${item.action}`}
              >
                <img src={item.image} alt={item.title} className="w-full h-auto object-contain" />
              </button>
            ))}

            {/* Combined Reset & Clear Instructions Button */}
            <div className="w-full mt-1.5" id="reset-wrapper">
              <button
                type="button"
                onClick={handleResetAll}
                disabled={isExecuting}
                className={`w-full select-none flex items-center justify-center transition-all cursor-pointer p-0 bg-transparent border-none outline-none ${
                  isExecuting ? 'opacity-40 cursor-not-allowed' : 'active:scale-95 hover:scale-[1.02]'
                }`}
                title="Reset Level & Hapus Semua Langkah"
                id="add-btn-RESET"
              >
                <img src={imgReset} alt="Reset" className="w-full h-auto object-contain" />
              </button>
            </div>

            {/* Mulai / Hentikan Button placed BELOW Reset */}
            <div className="w-full mt-1" id="mulai-hentikan-wrapper">
              {isExecuting ? (
                <button
                  type="button"
                  onClick={onStopExecution}
                  className="w-full px-2 py-1.5 sm:py-2.5 bg-rose-600 hover:bg-rose-500 border border-rose-700 text-white rounded-lg text-[9px] sm:text-xs font-bold flex items-center justify-center gap-1 animate-pulse cursor-pointer shadow-md"
                  id="stop-execution-btn"
                >
                  <Square className="w-3 h-3 sm:w-4 sm:h-4 fill-white" /> <span className="font-extrabold">Hentikan</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onStartExecution}
                  disabled={instructions.length === 0}
                  className={`w-full select-none flex items-center justify-center transition-all cursor-pointer p-0 bg-transparent border-none outline-none ${
                    instructions.length === 0 ? 'opacity-40 cursor-not-allowed' : 'active:scale-95 hover:scale-[1.02] animate-pulse-gentle'
                  }`}
                  id="run-execution-btn"
                >
                  <img src={imgMulai} alt="Mulai" className="w-full h-auto object-contain" />
                </button>
              )}
            </div>
            
            {isOverBlockLimit && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] mt-1 sm:mt-2 flex items-start gap-1 sm:gap-1.5 leading-normal">
                <AlertCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 flex-shrink-0 mt-0.5" />
                <span>Blok kode melebihi kapasitas ({level.maxInstructions})! Hapus beberapa blok.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right side instruction stack column */}
        <div className="col-span-8 flex flex-col bg-[#FEF8F0] rounded-xl sm:rounded-2xl border border-[#E9BE91]/70 p-1 md:p-2 relative shadow-inner" id="program-stack-container">
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
            className={`flex-1 overflow-y-auto space-y-[-3px] sm:space-y-[-6px] pr-0.5 sm:pr-1 custom-scrollbar min-h-0 max-h-[220px] sm:max-h-[360px] mt-1 sm:mt-2 transition-all duration-200 ${
              draggedIndex !== null && isOutside
                ? 'bg-rose-50/50 border border-dashed border-rose-350 rounded-2xl scale-[0.99] shadow-inner' 
                : ''
            }`}
            id="instructions-dropzone-scrollable"
          >
            {instructions.length === 0 ? (
              <div className="h-full min-h-[60px] sm:min-h-[180px] flex flex-col items-center justify-center text-center p-1.5 sm:p-6 select-none">
                <span className="text-xl sm:text-3xl mb-1 sm:mb-2.5">📂</span>
                <p className="font-bold text-[9px] sm:text-xs text-amber-955">Program Kosong</p>
                <p className="hidden sm:block text-[10px] text-gray-500 mt-1 max-w-[200px] leading-relaxed">
                  Pilih instruksi di samping untuk mulai.
                </p>
              </div>
            ) : (
              instructions.map((inst, index) => {
                const isDragged = draggedIndex === index;
                return (
                  <div
                    key={inst.id}
                    id={`step-item-${index}`}
                    ref={(el) => {
                      if (el) itemRefs.current[index] = el;
                    }}
                    onPointerDown={(e) => handlePointerDown(e, index)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                    onLostPointerCapture={handleLostPointerCapture}
                    onDragStart={(e) => e.preventDefault()}
                    className={`relative z-0 flex items-center justify-between bg-transparent select-none touch-none cursor-grab active:cursor-grabbing hover:brightness-95 transition-all ${
                      isDragged ? 'opacity-50' : 'opacity-100'
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

          {/* Running speed controls — stacked on mobile, row on desktop */}
          <div className="mt-0.5 md:mt-4 pt-0.5 md:pt-3 border-t border-[#EED4B7] flex flex-col items-stretch gap-1 md:gap-2 w-full min-w-0">
            {/* Blok badge */}
            <div className="flex flex-col sm:flex-col md:flex-row md:items-center gap-0 md:gap-1 bg-white border border-[#EED4B7] px-1.5 sm:px-2.5 py-0.5 rounded-md sm:rounded-lg shadow-sm w-full md:w-auto min-w-0">
              <span className="text-[7px] sm:text-[9px] text-amber-900/85 uppercase font-mono tracking-widest font-bold whitespace-nowrap">Total Blok</span>
              <span className={`text-[10px] sm:text-[12px] font-mono font-extrabold ${isOverBlockLimit ? 'text-rose-600 font-black animate-pulse' : 'text-amber-955'}`}>
                {blockCount}/{level.maxInstructions}
              </span>
            </div>
            {/* Speed controls */}
            <div className="flex flex-col items-start bg-white border border-[#EED4B7] px-2.5 py-1.5 rounded-lg sm:rounded-xl shadow-sm w-full min-w-0 gap-1.5">
              <span className="text-[9px] sm:text-[10px] font-bold text-stone-500 uppercase font-mono tracking-wider">Kecepatan Simulasi</span>
              <div className="flex flex-row items-center justify-start gap-1 w-full">
                <button
                  type="button"
                  onClick={() => onSetExecSpeed(1)}
                  className={`px-2 py-0.5 text-[9px] sm:text-[10px] rounded-md font-mono transition-colors cursor-pointer ${execSpeed === 1 ? 'bg-indigo-600 text-white font-bold' : 'text-stone-500 hover:text-indigo-600'}`}
                >
                  1x
                </button>
                <button
                  type="button"
                  onClick={() => onSetExecSpeed(1.5)}
                  className={`px-2 py-0.5 text-[9px] sm:text-[10px] rounded-md font-mono transition-colors cursor-pointer ${execSpeed === 1.5 ? 'bg-indigo-600 text-white font-bold' : 'text-stone-500 hover:text-indigo-600'}`}
                >
                  1.5x
                </button>
                <button
                  type="button"
                  onClick={() => onSetExecSpeed(2)}
                  className={`px-2 py-0.5 text-[9px] sm:text-[10px] rounded-md font-mono transition-colors cursor-pointer ${execSpeed === 2 ? 'bg-indigo-600 text-white font-bold' : 'text-stone-500 hover:text-indigo-600'}`}
                >
                  2x
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
