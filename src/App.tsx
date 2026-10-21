/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LevelHighScore } from './types';
import { LEVELS } from './levels';

// Import views/pages
import Splash from './pages/splash/Splash';
import Dashboard from './pages/dashboard/Dashboard';
import Arena from './pages/arena/Arena';
import PortraitWarning from './components/PortraitWarning';

import { playSfx, syncBgmState, initUserInteractionListener } from './utils/audio';
import { preloadAllGameAssets } from './utils/assetPreloader';

export default function App() {
  // Global screen state: 'splash' | 'dashboard' | 'arena'
  const [page, setPage] = useState<'splash' | 'dashboard' | 'arena'>('splash');

  // Asset preloading state — ensures all images & videos finish downloading first on initial open
  const [isAssetsLoaded, setIsAssetsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  // Fullscreen prompt modal
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);

  // Load levels highscores from LocalStorage if they exist
  const [highScores, setHighScores] = useState<{ [key: number]: LevelHighScore }>(() => {
    try {
      const stored = localStorage.getItem('pemilah_sampah_highscores');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // Gagal memuat, gunakan skor kosong
    }
    return {};
  });

  // Current Active Level
  const [activeLevelId, setActiveLevelId] = useState<number>(1);
  const activeLevel = LEVELS.find(l => l.id === activeLevelId) || LEVELS[0];

  // Sound / Audio effects muted state
  const [isMuted, setIsMuted] = useState(false);

  // Initialize audio listener & preload all visual/video assets on mount
  useEffect(() => {
    initUserInteractionListener();
    let mounted = true;
    preloadAllGameAssets((pct) => {
      if (mounted) setLoadProgress(pct);
    }).then(() => {
      if (mounted) {
        setIsAssetsLoaded(true);
        setShowFullscreenPrompt(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Sync mute state with background music
  useEffect(() => {
    syncBgmState(isMuted);
  }, [isMuted]);

  const handleSelectLevel = (levelId: number) => {
    playClickSound();
    setActiveLevelId(levelId);
    setPage('arena');
  };

  const handleSaveHighScore = (levelId: number, stars: number, minSteps: number) => {
    const oldScore = highScores[levelId];
    const betterStars = Math.max(oldScore?.stars || 0, stars);
    const betterSteps = oldScore?.minSteps
       ? Math.min(oldScore.minSteps, minSteps)
       : minSteps;

    const newScores = {
      ...highScores,
      [levelId]: {
        levelId,
        stars: betterStars,
        minSteps: betterSteps,
        completed: true
      }
    };
    setHighScores(newScores);
    localStorage.setItem('pemilah_sampah_highscores', JSON.stringify(newScores));
  };

  const handleNextLevel = () => {
    if (activeLevelId < LEVELS.length) {
      setActiveLevelId(prev => prev + 1);
    } else {
      setPage('dashboard');
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Sound click helper for routing
  const playClickSound = () => {
    playSfx('click', isMuted);
  };

  const handleStartFromSplash = () => {
    playClickSound();
    setPage('dashboard');
  };

  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen permission denied or not supported by browser", err);
    }
    setShowFullscreenPrompt(false);
  };

  const navigateToDashboard = () => {
    playClickSound();
    setPage('dashboard');
  };

  const navigateToSplash = () => {
    playClickSound();
    setPage('splash');
  };

  // Initial Asset Preloader Screen — warm cream/green background (never black!)
  if (!isAssetsLoaded) {
    return (
      <div className="h-screen w-screen overflow-hidden relative flex flex-col items-center justify-center bg-gradient-to-b from-[#E0F2FE] via-[#FEF8F0] to-[#DCFCE7] p-6 select-none">
        <div className="max-w-sm w-full bg-[#FEF8F0] border-2 border-[#EED4B7] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-3xl mb-4 animate-bounce">
            ♻️
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-amber-950 mb-1">
            Memuat Aset Permainan...
          </h2>
          <p className="text-xs text-stone-600 mb-4 font-medium">
            Menyiapkan gambar dan animasi ({loadProgress}%)
          </p>
          <div className="w-full h-3 bg-[#EED4B7]/50 rounded-full overflow-hidden border border-[#EED4B7]">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-[#00ADEF] transition-all duration-200 rounded-full"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
        <PortraitWarning />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-[#FEF8F0]">
      {/* Mode Layar Penuh Modal - Colors matching Splash page (#00ADEF, #EED4B7, #FEF8F0) */}
      {showFullscreenPrompt && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-amber-950/30 backdrop-blur-md p-4 select-none animate-fadeIn">
          <div className="relative max-w-sm w-full mx-auto bg-[#FEF8F0] border-2 border-[#EED4B7] shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center">
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute w-20 h-20 bg-[#00ADEF]/20 rounded-full animate-ping opacity-75" />
              <div className="w-16 h-16 bg-[#00ADEF]/10 border border-[#00ADEF]/30 rounded-2xl flex items-center justify-center text-3xl shadow-sm z-10">
                📺
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-amber-950 tracking-tight mb-2">
              Mode Layar Penuh
            </h3>
            
            <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed mb-6">
              Apakah Anda ingin masuk ke mode layar penuh?
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={enterFullscreen}
                className="flex-1 bg-[#00ADEF] hover:bg-[#009CD7] border border-[#009CD7] text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-[#00ADEF]/20 active:scale-95 cursor-pointer"
              >
                Yes
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowFullscreenPrompt(false);
                }}
                className="flex-1 bg-white hover:bg-stone-100 border border-[#EED4B7] text-stone-700 font-bold py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rendering screen routing based on active page state */}
      {page === 'splash' && (
        <Splash
          onStart={handleStartFromSplash}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {page === 'dashboard' && (
        <Dashboard
          levels={LEVELS}
          highScores={highScores}
          onSelectLevel={handleSelectLevel}
          onBack={navigateToSplash}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {page === 'arena' && (
        <Arena
          level={activeLevel}
          highScores={highScores}
          onSaveHighScore={handleSaveHighScore}
          onBackToDashboard={navigateToDashboard}
          onNextLevel={handleNextLevel}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Orientation Guard: Memastikan perangkat harus landscape di semua halaman */}
      <PortraitWarning />

      {/* Footer Copyright: Hanya tampil di halaman tanpa kontrol (Splash & Dashboard) */}
      {page !== 'arena' && (
        <footer className="fixed bottom-1.5 left-0 right-0 z-40 text-center pointer-events-none select-none text-[10px] sm:text-xs text-black font-['CCRegeneration'] tracking-wider">
          Copyright 2026 Pusat Perbukuan
        </footer>
      )}
    </div>
  );
}
