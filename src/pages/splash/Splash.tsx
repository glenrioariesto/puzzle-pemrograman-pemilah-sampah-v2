/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import logoPusbuk from '@/assets/logo-pusbuk.webp';
import bgBackground from '@/assets/background.webp';
import imgTitleTop from '@/assets/title-top.webp';
import imgTitleBottom from '@/assets/title-bottom.webp';

interface SplashProps {
  onStart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export default function Splash({ onStart, isMuted, onToggleMute }: SplashProps) {
  return (
    <div className="relative max-h-screen h-screen w-full flex flex-col items-center justify-center p-6 text-center overflow-hidden selection:bg-indigo-500/30 font-sans leading-relaxed bg-stone-900">
      {/* Background Image with blur & opacity-60 */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-60 backdrop-blur-md pointer-events-none"
        style={{ backgroundImage: `url(${bgBackground})` }}
      />

      {/* Pusbuk Logo on Absolute Top Left */}
      <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-50 shrink-0 animate-fade-in">
        <img 
          src={logoPusbuk} 
          alt="Logo Pusbuk" 
          className="h-10 sm:h-14 md:h-16 w-auto object-contain"
        />
      </div>

      {/* Sound Toggle Button on Absolute Top Right */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-2 animate-fade-in">
        <button
          onClick={onToggleMute}
          className="p-2.5 rounded-xl border border-[#EED4B7] bg-white/90 hover:bg-white text-stone-600 transition-all cursor-pointer shadow-md"
          title={isMuted ? 'Nyalakan Audio' : 'Matikan Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>

      {/* Centered Splash Hero Panel */}
      <div className="z-10 max-w-2xl flex flex-col items-center gap-6 animate-scale-up">
        {/* Title Graphic (title-top.webp) */}
        <img 
          src={imgTitleTop} 
          alt="Title Top" 
          className="w-auto max-w-[85vw] sm:max-w-md md:max-w-lg lg:max-w-xl h-auto object-contain drop-shadow-2xl"
        />

        {/* Separated Start Button Graphic (title-bottom.webp) */}
        <button
          onClick={onStart}
          className="group relative cursor-pointer active:scale-95 transition-transform duration-200"
        >
          <img 
            src={imgTitleBottom} 
            alt="Mulai" 
            className="w-auto max-w-[65vw] sm:max-w-xs md:max-w-sm h-auto object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-200"
          />
        </button>
      </div>
    </div>
  );
}

