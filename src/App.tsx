/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LevelHighScore } from './types';
import { LEVELS } from './levels';

// Import views/pages
import Splash from './pages/splash/Splash';
import Dashboard from './pages/dashboard/Dashboard';
import Arena from './pages/arena/Arena';

import clickSfx from '../assets/click.mp3';

export default function App() {
  // Global screen state: 'splash' | 'dashboard' | 'arena'
  const [page, setPage] = useState<'splash' | 'dashboard' | 'arena'>('splash');

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

  // Global showHowToPlay trigger state that can be activated from splash or arena
  const [showHowToPlayOnArena, setShowHowToPlayOnArena] = useState(false);

  const handleSelectLevel = (levelId: number) => {
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
    if (isMuted) return;
    try {
      const audio = new Audio(clickSfx);
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch (e) {
      // ignore
    }
  };


  const navigateToDashboard = () => {
    playClickSound();
    setPage('dashboard');
  };

  const navigateToSplash = () => {
    playClickSound();
    setPage('splash');
  };

  // Rendering screen routing based on active page state
  if (page === 'splash') {
    return (
      <Splash
        onStart={navigateToDashboard}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onShowHowToPlay={() => {
          playClickSound();
          // We can trigger instructions alert or just standard guide modal
          setShowHowToPlayOnArena(true);
          setPage('arena');
        }}
      />
    );
  }

  if (page === 'dashboard') {
    return (
      <Dashboard
        levels={LEVELS}
        highScores={highScores}
        onSelectLevel={handleSelectLevel}
        onBack={navigateToSplash}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />
    );
  }

  // default page === 'arena'
  return (
    <Arena
      level={activeLevel}
      highScores={highScores}
      onSaveHighScore={handleSaveHighScore}
      onBackToDashboard={navigateToDashboard}
      onNextLevel={handleNextLevel}
      isMuted={isMuted}
      onToggleMute={handleToggleMute}
    />
  );
}
