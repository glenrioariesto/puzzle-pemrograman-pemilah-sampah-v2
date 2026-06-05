/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Instruction, CommandAction, GameLevel, RobotId } from '../../../types';
import InstructionBlock from './InstructionBlock';
import { Star, AlertCircle, Play, Square } from 'lucide-react';

// Import robot character images
import charOrganik from '../../../../assets/char-organik.webp';
import charAnorganik from '../../../../assets/char-anorganik.webp';
import charB3 from '../../../../assets/char-b3.webp';

// Import command button images
import imgAtas from '../../../../assets/atas.webp';
import imgBawah from '../../../../assets/bawah.webp';
import imgKiri from '../../../../assets/kiri.webp';
import imgKanan from '../../../../assets/kanan.webp';
import imgAmbil from '../../../../assets/ambil.webp';
import imgBuang from '../../../../assets/buang.webp';
import imgReset from '../../../../assets/reset.webp';
import imgMulai from '../../../../assets/mulai.webp';

interface CommandPanelProps {
  level: GameLevel;
  activeRobot: RobotId;
  instructions: Instruction[];
  onAddCommand: (action: CommandAction) => void;
  onClearInstructions: () => void;
  onDeleteCommand: (id: string) => void;
  onMoveCommandUp: (index: number) => void;
  onMoveCommandDown: (index: number) => void;
  onSelectRobot: (robotId: RobotId) => void;

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
}

const ROBOT_META: Record<RobotId, { label: string; image: string; bgClass: string; activeBgClass: string; borderClass: string }> = {
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
    bgClass: 'bg-violet-50 hover:bg-violet-100 text-violet-800',
    activeBgClass: 'bg-violet-600 text-white shadow-md border-violet-600',
    borderClass: 'border-violet-400',
  },
};

export default function CommandPanel({
  level,
  activeRobot,
  instructions,
  onAddCommand,
  onClearInstructions,
  onDeleteCommand,
  onMoveCommandUp,
  onMoveCommandDown,
  onSelectRobot,
  isExecuting,
  onStartExecution,
  onStopExecution,
  activeInstructionId,
  execSpeed,
  onSetExecSpeed,
  onReset,
  totalBlockCount,
}: CommandPanelProps) {

  const blockCount = totalBlockCount;
  const isOverBlockLimit = level.maxInstructions ? blockCount > level.maxInstructions : false;

  // Toolbox item definitions — includes Reset as part of the same list
  type ToolboxItem = { action: CommandAction | 'RESET'; image: string; title: string };
  const toolboxItems: ToolboxItem[] = [
    { action: 'UP', image: imgAtas, title: 'Maju' },
    { action: 'DOWN', image: imgBawah, title: 'Mundur' },
    { action: 'LEFT', image: imgKiri, title: 'Belok Kiri' },
    { action: 'RIGHT', image: imgKanan, title: 'Belok Kanan' },
    { action: 'PICK', image: imgAmbil, title: 'Ambil Sampah' },
    { action: 'DROP', image: imgBuang, title: 'Buang Sampah' },
    { action: 'RESET', image: imgReset, title: 'Reset Semua Robot & Sampah' },
  ];

  return (
    <div className="bg-[#FCDCB5]/70 border border-[#E9BE91] rounded-2xl sm:rounded-3xl p-3 shadow-xl flex flex-col h-full space-y-1.5 md:space-y-3 overflow-y-auto" id="command-panel-card">

      {/* Main Grid: Left side spawned block panel, Right side active stack */}
      <div className="grid grid-cols-12 gap-1 sm:gap-2 flex-1 min-h-0" id="command-panel-inner-grid">
        {/* Left side toolbox column */}
        <div className="col-span-4 space-y-1 sm:space-y-3" id="toolbox-container">
          <div className="flex flex-col gap-1.5">
            {toolboxItems.map((item) => (
              <button
                key={item.action}
                onClick={() => item.action === 'RESET' ? onReset?.() : onAddCommand(item.action as CommandAction)}
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
          </div>

          {/* Level Stars Targets explanation */}
          <div className="bg-white border border-[#EED4B7] p-0.5 sm:p-3.5 rounded-lg sm:rounded-2xl space-y-0.5 sm:space-y-2.5 text-[9px] sm:text-xs shadow-sm" id="level-stars-legend">
            <div className="flex flex-col gap-0.5 sm:gap-1 font-mono text-[8px] sm:text-[11px] text-stone-600">
              <span className="lg:hidden text-[10px] leading-none">⭐⭐⭐</span>
              <span className="lg:hidden text-[10px] text-stone-700">Bintang 3:</span>
              <span className="hidden lg:inline">⭐⭐⭐ Bintang 3:</span>
              <span className="text-amber-900 font-bold">≤ {level.starsThreshold.three}</span>
              <span className="lg:hidden text-[10px] leading-none mt-0.5">⭐⭐</span>
              <span className="lg:hidden text-[10px] text-stone-700">Bintang 2:</span>
              <span className="hidden lg:inline">⭐⭐ Bintang 2:</span>
              <span className="text-stone-500 font-bold">≤ {level.starsThreshold.two}</span>
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
          {/* Robot Selector Tabs — above the program stack */}
          <div className="flex gap-1 sm:gap-2 mb-1.5 sm:mb-3" id="robot-selector-tabs">
            {(level.robots || []).map((robot) => {
              const meta = ROBOT_META[robot.id];
              const isActive = activeRobot === robot.id;
              return (
                <button
                  key={robot.id}
                  type="button"
                  onClick={() => onSelectRobot(robot.id)}
                  disabled={isExecuting}
                  className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-1.5 md:px-2 py-1.5 md:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold font-mono border transition-all cursor-pointer ${
                    isActive
                      ? `${meta.activeBgClass} ${meta.borderClass} scale-105 shadow-inner`
                      : `${meta.bgClass} ${meta.borderClass} opacity-75 hover:opacity-100`
                  } ${isExecuting ? 'opacity-40 cursor-not-allowed' : ''}`}
                  id={`robot-tab-${robot.id}`}
                >
                  <img
                    src={meta.image}
                    alt={meta.label}
                    className="h-8 sm:h-10 w-auto object-contain flex-shrink-0"
                  />
                  {/* <span className="truncate">{meta.label}</span> */}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end items-center mb-0.5 sm:mb-3">
            {instructions.length > 0 && (
              <button
                type="button"
                onClick={onClearInstructions}
                disabled={isExecuting}
                className="text-[8px] sm:text-[10px] text-rose-750 font-bold bg-white hover:bg-stone-50 border border-[#EED4B7] px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg cursor-pointer transition-colors disabled:opacity-40 shadow-sm"
              >
                Hapus Semua 🔄
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-0.5 sm:space-y-2 pr-0.5 sm:pr-1 custom-scrollbar min-h-0 max-h-[220px] sm:max-h-[360px]">
            {instructions.length === 0 ? (
              <div className="h-full min-h-[60px] sm:min-h-[180px] flex flex-col items-center justify-center text-center p-1.5 sm:p-6 select-none">
                <span className="text-xl sm:text-3xl mb-1 sm:mb-2.5">📂</span>
                <p className="font-bold text-[9px] sm:text-xs text-amber-950">Program Kosong</p>
                <p className="hidden sm:block text-[10px] text-gray-500 mt-1 max-w-[200px] leading-relaxed">
                  Pilih instruksi di samping untuk mulai.
                </p>
              </div>
            ) : (
              instructions.map((inst, index) => (
                <InstructionBlock
                  key={inst.id}
                  instruction={inst}
                  onDelete={onDeleteCommand}
                  onMoveUp={index > 0 ? () => onMoveCommandUp(index) : undefined}
                  onMoveDown={index < instructions.length - 1 ? () => onMoveCommandDown(index) : undefined}
                  activeInstructionId={activeInstructionId}
                />
              ))
            )}
          </div>

          {/* Running speed controls — stacked on mobile, row on desktop */}
          <div className="mt-0.5 md:mt-4 pt-0.5 md:pt-3 border-t border-[#EED4B7] flex flex-col items-stretch gap-1 md:gap-2 w-full min-w-0">
            {/* Blok badge */}
            <div className="flex flex-col sm:flex-col md:flex-row md:items-center gap-0 md:gap-1 bg-white border border-[#EED4B7] px-1.5 sm:px-2.5 py-0.5 rounded-md sm:rounded-lg shadow-sm w-full md:w-auto min-w-0">
              <span className="text-[7px] sm:text-[9px] text-amber-900/85 uppercase font-mono tracking-widest font-bold whitespace-nowrap">Blok Struktur</span>
              <span className={`text-[10px] sm:text-[12px] font-mono font-extrabold ${isOverBlockLimit ? 'text-rose-600 font-black animate-pulse' : 'text-amber-950'}`}>
                {blockCount}/{level.maxInstructions}
              </span>
            </div>
            {/* Speed controls */}
            <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-1.5 bg-white border border-[#EED4B7] px-1 sm:px-1.5 py-0.5 rounded-md sm:rounded-lg shadow-sm w-full md:w-auto min-w-0">
              <span className="text-[7px] sm:text-[9px] font-bold text-stone-500 uppercase font-mono whitespace-nowrap">S<span className="hidden sm:inline">peed</span></span>
              <div className="flex flex-row flex-wrap items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onSetExecSpeed(1)}
                  className={`px-1 sm:px-2 py-0.5 text-[9px] sm:text-[10px] rounded-md font-mono transition-colors cursor-pointer ${execSpeed === 1 ? 'bg-indigo-600 text-white font-bold' : 'text-stone-500 hover:text-indigo-600'}`}
                >
                  1x
                </button>
                <button
                  type="button"
                  onClick={() => onSetExecSpeed(1.5)}
                  className={`px-1 sm:px-2 py-0.5 text-[9px] sm:text-[10px] rounded-md font-mono transition-colors cursor-pointer ${execSpeed === 1.5 ? 'bg-indigo-600 text-white font-bold' : 'text-stone-500 hover:text-indigo-600'}`}
                >
                  1.5x
                </button>
                <button
                  type="button"
                  onClick={() => onSetExecSpeed(2)}
                  className={`px-1 sm:px-2 py-0.5 text-[9px] sm:text-[10px] rounded-md font-mono transition-colors cursor-pointer ${execSpeed === 2 ? 'bg-indigo-600 text-white font-bold' : 'text-stone-500 hover:text-indigo-600'}`}
                >
                  2x
                </button>
              </div>
            </div>
            {/* Run Button */}
            {isExecuting ? (
              <button
                type="button"
                onClick={onStopExecution}
                className="px-1.5 sm:px-4 py-1 sm:py-2 bg-rose-600 hover:bg-rose-500 border border-rose-450 text-white rounded-md sm:rounded-xl text-[9px] sm:text-xs font-bold flex items-center justify-center gap-1 animate-pulse cursor-pointer shadow-md w-full md:w-auto"
                id="stop-execution-btn"
              >
                <Square className="w-3 h-3 sm:w-4 sm:h-4 fill-white" /> <span className="hidden sm:inline">Hentikan</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onStartExecution}
                disabled={instructions.length === 0}
                className="cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all w-full md:w-auto p-0 bg-transparent border-none outline-none flex justify-center hover:scale-[1.02] active:scale-98"
                id="run-execution-btn"
              >
                <img src={imgMulai} alt="Mulai" className="h-8 sm:h-10 w-auto object-contain" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
