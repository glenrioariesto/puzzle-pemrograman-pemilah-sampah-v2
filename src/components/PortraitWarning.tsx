import React, { useEffect, useState } from 'react';
import { RotateCw, Smartphone } from 'lucide-react';

export function PortraitWarning() {
  const [isPortrait, setIsPortrait] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerHeight > window.innerWidth || window.matchMedia('(orientation: portrait)').matches;
  });

  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth || window.matchMedia('(orientation: portrait)').matches;
      setIsPortrait(portrait);
    };

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    // Attempt to automatically lock to landscape on supported mobile devices
    const tryLockLandscape = async () => {
      try {
        const orientation = (screen as any).orientation;
        if (orientation && typeof orientation.lock === 'function') {
          await orientation.lock('landscape');
        }
      } catch {
        // Ignored if device/browser requires manual permission or user gesture
      }
    };
    tryLockLandscape();

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const handleManualLock = async () => {
    try {
      const orientation = (screen as any).orientation;
      if (orientation && typeof orientation.lock === 'function') {
        await orientation.lock('landscape');
      }
    } catch {
      // Ignored
    }
  };

  if (!isPortrait) return null;

  return (
    <div
      id="portrait-warning-overlay"
      className="fixed inset-0 z-[9999] bg-[#0F172A]/98 backdrop-blur-md text-slate-100 flex flex-col items-center justify-center text-center p-6 select-none animate-fade-in"
    >
      <div id="portrait-phone-animation" className="relative w-24 h-24 mb-8 flex items-center justify-center">
        {/* Phone frame with custom rotate animation */}
        <div 
          id="portrait-phone-frame"
          className="w-12 h-20 border-4 border-slate-600 rounded-2xl bg-slate-800 flex items-center justify-center shadow-lg transition-transform" 
          style={{ 
            animation: 'portraitRotate 1.6s ease-in-out infinite' 
          }}
        >
          <Smartphone className="w-6 h-6 text-amber-400" />
        </div>
        
        {/* Curved arrow indicator */}
        <RotateCw className="w-8 h-8 text-amber-500 absolute -top-1 -right-1 animate-spin" style={{ animationDuration: '4s' }} />
      </div>

      <h2 id="portrait-warning-title" className="text-base sm:text-lg font-black tracking-wider text-white mb-2 uppercase font-sans">
        Gunakan Orientasi Lanskap (Horizontal)
      </h2>
      <p id="portrait-warning-desc" className="text-xs sm:text-sm text-slate-300 max-w-xs leading-relaxed font-sans mb-6">
        Silakan putar perangkat Anda ke posisi <strong>horizontal (landscape)</strong> untuk kenyamanan bermain dan menyusun logika pemilah sampah.
      </p>

      {/* Button to try lock orientation on user click */}
      <button
        type="button"
        onClick={handleManualLock}
        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer"
      >
        Kunci Mode Lanskap
      </button>

      {/* Embedded keyframes for custom phone rotation animation */}
      <style>{`
        @keyframes portraitRotate {
          0%, 20% { transform: rotate(0deg); }
          50%, 80% { transform: rotate(-90deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}

export default PortraitWarning;
