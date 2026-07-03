/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, Volume2, VolumeX, BookOpen } from 'lucide-react';
import logoPusbuk from '@/assets/logo-pusbuk.webp';

interface SplashProps {
  onStart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onShowHowToPlay: () => void;
}

export default function Splash({ onStart, isMuted, onToggleMute, onShowHowToPlay }: SplashProps) {
  return (
    <div className="relative max-h-screen h-screen w-full flex flex-col items-center justify-center p-6 text-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FCDCB5]/10 via-[#FEF8F0] to-[#FEF8F0] selection:bg-indigo-500/30 font-sans leading-relaxed">
      {/* Pusbuk Logo on Absolute Top Left */}
      <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-50 shrink-0 animate-fade-in">
        <img 
          src={logoPusbuk} 
          alt="Logo Pusbuk" 
          className="h-10 sm:h-14 md:h-16 w-auto object-contain"
        />
      </div>

      {/* Top Right Controls (Panduan & Sound) */}
      <div className="absolute top-6 right-6 flex items-center gap-2 animate-fade-in">
        <button
          onClick={onToggleMute}
          className="p-2.5 rounded-xl border border-[#EED4B7] bg-white hover:bg-stone-50 text-stone-600 transition-all cursor-pointer shadow-sm"
          title={isMuted ? 'Nyalakan Audio' : 'Matikan Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
        </button>

        <button
          onClick={onShowHowToPlay}
          className="px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-xs flex items-center gap-1.5 hover:bg-indigo-100 transition-colors cursor-pointer shadow-sm"
        >
          <BookOpen className="w-3.5 h-3.5" /> Cara Bermain
        </button>
      </div>

      {/* Background Decorative Glow Circles */}
      <div className="absolute -top-[20%] -left-[20%] w-[60%] aspect-square rounded-full bg-[#FCDCB5]/15 blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-[20%] -right-[20%] w-[60%] aspect-square rounded-full bg-[#00ADEF]/5 blur-[120px] pointer-events-none"></div>

      {/* Centered Splash Hero Panel */}
      <div className="z-10 max-w-xl flex flex-col items-center">
        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-amber-950 leading-tight mb-5 animate-scale-up">
          Pilah Sampah,<br className="sm:hidden" /> Kuasai Logika!
        </h1>

        {/* Shorter Subtext description */}
        <p className="text-xs sm:text-sm md:text-base text-gray-500 max-w-md sm:max-w-lg leading-relaxed mb-8 px-4 animate-scale-up" style={{ animationDelay: '100ms' }}>
          Rancang algoritme gerakan petugas kebersihan untuk mengambil dan memilah sampah sesuai wadah yang cocok.
        </p>

        {/* Start Button */}
        <div className="animate-scale-up" style={{ animationDelay: '200ms' }}>
          <button
            onClick={onStart}
            className="px-8 py-4 bg-[#00ADEF] hover:bg-[#009CD7] border border-[#009CD7] text-white font-bold text-sm sm:text-base rounded-2xl cursor-pointer shadow-lg active:scale-98 hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            Mulai Petualangan <ArrowRight className="w-5 h-5 animate-bounce-horizontal" />
          </button>
        </div>
      </div>
    </div>
  );
}
