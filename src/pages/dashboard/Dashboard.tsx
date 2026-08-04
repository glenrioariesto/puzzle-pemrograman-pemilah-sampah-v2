/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameLevel, LevelHighScore } from '../../types';
import { ChevronRight, Volume2, VolumeX } from 'lucide-react';
import logoPusbuk from '@/assets/logo-pusbuk.webp';
import bgBackground from '@/assets/background.webp';

interface DashboardProps {
  levels: GameLevel[];
  highScores: { [key: number]: LevelHighScore };
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const difficultyLabel = (id: number) => {
  if (id === 1) return { label: 'Mudah', color: 'bg-emerald-100 text-emerald-800 border border-emerald-300' };
  if (id === 2) return { label: 'Sedang', color: 'bg-amber-100 text-amber-800 border border-amber-300' };
  return { label: 'Sulit', color: 'bg-rose-100 text-rose-800 border border-rose-300' };
};

const levelGradients = (id: number) => {
  if (id === 1) return {
    bg: 'from-emerald-400 to-teal-500',
    cardBg: 'bg-emerald-50/90 backdrop-blur-md border-[3px] border-[#0f5a31]',
    hoverBorder: 'hover:border-[#16a34a]',
    hoverGlow: 'hover:shadow-emerald-500/10',
    btnBg: 'bg-[#0f5a31] hover:bg-[#0b4826] border-b-3 border-[#073019] active:border-b-0 active:translate-y-[3px]',
    badgeBg: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    statsBg: 'bg-emerald-100/60 text-emerald-900 border border-emerald-300/50',
    accentText: 'text-[#0f5a31]',
    hoverTitle: 'group-hover:text-[#0f5a31]',
  };
  if (id === 2) return {
    bg: 'from-amber-400 to-orange-500',
    cardBg: 'bg-amber-50/90 backdrop-blur-md border-[3px] border-[#b45309]',
    hoverBorder: 'hover:border-[#ea580c]',
    hoverGlow: 'hover:shadow-amber-500/10',
    btnBg: 'bg-[#b45309] hover:bg-[#9a3412] border-b-3 border-[#7c2d12] active:border-b-0 active:translate-y-[3px]',
    badgeBg: 'bg-amber-100 text-amber-800 border border-amber-200',
    statsBg: 'bg-amber-100/60 text-amber-900 border border-amber-300/50',
    accentText: 'text-[#b45309]',
    hoverTitle: 'group-hover:text-[#b45309]',
  };
  return {
    bg: 'from-rose-400 to-pink-500',
    cardBg: 'bg-rose-50/90 backdrop-blur-md border-[3px] border-[#be123c]',
    hoverBorder: 'hover:border-[#e11d48]',
    hoverGlow: 'hover:shadow-rose-500/10',
    btnBg: 'bg-[#be123c] hover:bg-[#9f1239] border-b-3 border-[#881337] active:border-b-0 active:translate-y-[3px]',
    badgeBg: 'bg-rose-100 text-rose-800 border border-rose-200',
    statsBg: 'bg-rose-100/60 text-rose-900 border border-rose-300/50',
    accentText: 'text-[#be123c]',
    hoverTitle: 'group-hover:text-[#be123c]',
  };
};

export default function Dashboard({
  levels,
  highScores,
  onSelectLevel,
  onBack,
  isMuted,
  onToggleMute
}: DashboardProps) {
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center relative overflow-hidden antialiased py-0 px-0 lg:py-6 lg:px-6 xl:py-8 xl:px-8 select-none bg-stone-900">
      {/* Background Image with blur & opacity-60 */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-60 backdrop-blur-md pointer-events-none"
        style={{ backgroundImage: `url(${bgBackground})` }}
      />
      {/* Pusbuk Logo - Top Left */}
      <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 md:top-6 md:left-6 z-30">
        <img 
          src={logoPusbuk} 
          alt="Logo Pusbuk" 
          className="h-7 sm:h-10 md:h-14 lg:h-16 w-auto object-contain transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Sound Toggle - Top Right */}
      <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 md:top-6 md:right-6 z-30 flex items-center gap-2 sm:gap-2.5">
        <button
          onClick={onToggleMute}
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/80 backdrop-blur-md border border-[#EED4B7] rounded-xl sm:rounded-2xl flex items-center justify-center text-stone-600 hover:text-amber-600 hover:bg-white hover:border-amber-300 hover:shadow-lg transition-all duration-300 active:scale-90 cursor-pointer group"
          title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 text-rose-500" />
          ) : (
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 text-indigo-600" />
          )}
        </button>
      </div>

      {/* Main Container Wrapper */}
      <div className="z-10 w-full max-w-5xl bg-transparent lg:bg-white/50 lg:backdrop-blur-md border-0 lg:border-[3px] md:border-[5px] border-transparent lg:border-[#0f5a31] rounded-none lg:rounded-2xl md:rounded-[24px] shadow-none lg:shadow-2xl lg:overflow-hidden flex flex-col p-2 lg:p-10 justify-center min-h-0 animate-fade-in transition-all duration-500">
        
        {/* Header Title */}
        <header className="w-fit lg:max-w-none mx-auto flex flex-col items-center text-center shrink-0 bg-white/80 backdrop-blur-md border-[3px] border-[#0f5a31] rounded-2xl shadow-md py-1.5 px-6 mb-3 lg:bg-transparent lg:backdrop-blur-none lg:border-0 lg:shadow-none lg:p-0 lg:mb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black font-display tracking-wide text-amber-950 leading-tight drop-shadow-sm select-none">
            Pilih Level
          </h1>
        </header>

        {/* 3 Level Cards Grid */}
        <main className="w-full min-h-0">
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 px-0 pb-0 min-h-0">
            {levels.slice(0, 3).map((level) => {
              const diff = difficultyLabel(level.id);
              const theme = levelGradients(level.id);
              const score = highScores[level.id];
              const isCompleted = score?.completed;

              return (
                <div
                  key={level.id}
                  onClick={() => onSelectLevel(level.id)}
                  className={`${theme.cardBg} rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 text-left flex flex-col justify-between shadow-sm hover:shadow-xl ${theme.hoverBorder} ${theme.hoverGlow} hover:-translate-y-1.5 transition-all duration-500 active:scale-98 group cursor-pointer relative overflow-hidden w-full min-h-[160px] sm:min-h-[200px] md:min-h-[260px]`}
                >
                  {/* Card Top: Level Number + Difficulty Badge */}
                  <div className="flex items-start justify-between shrink-0">
                    <div className="flex flex-col">
                      <span className="text-[9px] lg:text-[10px] font-black text-stone-500 tracking-wider uppercase font-display mb-0.5">
                        Level
                      </span>
                      <span className={`text-2xl lg:text-4xl font-black font-display leading-none bg-gradient-to-br ${theme.bg} bg-clip-text text-transparent`}>
                        {level.id < 10 ? `0${level.id}` : level.id}
                      </span>
                    </div>
                    <span className={`text-[10px] lg:text-xs font-black px-2.5 sm:px-3 py-0.5 lg:py-1 rounded-full ${diff.color}`}>
                      {diff.label}
                    </span>
                  </div>

                  {/* Level Title & Description */}
                  <div className="my-2 lg:my-4 shrink-0">
                    <h3 className={`font-black text-amber-955 text-sm sm:text-base md:text-lg leading-tight font-display tracking-wide ${theme.hoverTitle} transition-colors`}>
                      {level.name.replace(/^\d+\.\s*/, '')}
                    </h3>
                  </div>

                  {/* Stats Badges + Action Button */}
                  <div className="mt-auto shrink-0">
                    <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3">
                      <span className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl ${theme.statsBg} font-bold text-[9px] lg:text-xs`}>
                        📦 {level.trashItems.length} Sampah
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl ${theme.statsBg} font-bold text-[9px] lg:text-xs`}>
                        🧩 Max {level.maxInstructions} Blok
                      </span>
                    </div>

                    <button className={`w-full py-2 sm:py-2.5 pl-3 sm:pl-5 pr-2 rounded-xl sm:rounded-2xl text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-md transition-all duration-300 hover:shadow-lg active:scale-98 cursor-pointer group/btn border border-white/10 ${theme.btnBg}`}>
                      <span className="font-display tracking-wider">
                        {isCompleted ? 'Main Ulang' : 'Mulai Bermain'}
                      </span>
                      <span className="w-6 h-6 sm:w-7 sm:h-7 bg-white/20 rounded-full flex items-center justify-center group-hover/btn:bg-white/35 group-hover/btn:translate-x-0.5 transition-all shrink-0">
                        <ChevronRight className="w-4 h-4 text-white" />
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
