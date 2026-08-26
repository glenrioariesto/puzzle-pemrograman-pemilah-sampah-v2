/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameLevel, LevelHighScore, CharacterId, CommandAction, Instruction } from '../../types';

// Import subcomponents
import GridMap, { CharacterRenderData } from './components/GridMap';
import CommandPanel from './components/CommandPanel';
import RotateDevicePrompt from './components/RotateDevicePrompt';
import Toast from './components/Toast';

// Import custom hook
import { useArenaGame } from './hooks/useArenaGame';

import LevelSuccessModal from './components/modals/LevelSuccessModal';
import LevelFailModal from './components/modals/LevelFailModal';
import HintModal from './components/modals/HintModal';

// Icons
import { X } from 'lucide-react';

import charOrganik from '@/assets/hijau-angkat.svg';
import charAnorganik from '@/assets/kuning-angkat.svg';
import charB3 from '@/assets/merah-angkat.svg';
import bgArenaGame from '@/assets/bg-arena-game.webp';

interface ArenaProps {
  level: GameLevel;
  highScores: { [key: number]: LevelHighScore };
  onSaveHighScore: (levelId: number, stars: number, minSteps: number) => void;
  onBackToDashboard: () => void;
  onNextLevel: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const CHARACTER_COLORS: Record<CharacterId, { bg: string; border: string }> = {
  ORGANIC: { bg: '#10B981', border: '#059669' },
  RECYCLABLE: { bg: '#F59E0B', border: '#D97706' },
  B3: { bg: '#EF4444', border: '#B91C1C' },
};

const CHARACTER_IMAGES: Record<CharacterId, string> = {
  ORGANIC: charOrganik,
  RECYCLABLE: charAnorganik,
  B3: charB3,
};

export default function Arena({
  level,
  highScores,
  onSaveHighScore,
  onBackToDashboard,
  onNextLevel,
  isMuted,
  onToggleMute
}: ArenaProps) {
  // Use custom hook to manage simulation states and event handlers
  const {
    activeCharacter,
    setActiveCharacter,
    characterStates,
    isExecuting,
    activeTrash,
    logs,
    gameResult,
    resultStars,
    totalSteps,
    showResultModal,
    setShowResultModal,
    showHintsModal,
    setShowHintsModal,
    execSpeed,
    setExecSpeed,
    totalBlockCount,
    handleAddCommand,
    handleClearInstructions,
    handleUpdateInstructions,
    handleDeleteCommand,
    handleMoveCommandUp,
    handleMoveCommandDown,
    handleStartExecution,
    handleStopExecution,
    handleReset,
    playSound
  } = useArenaGame(level, isMuted, onSaveHighScore);

  const [activeHintSlide, setActiveHintSlide] = React.useState(0);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const lastBlockCountRef = React.useRef(totalBlockCount);

  React.useEffect(() => {
    if (showHintsModal) {
      setActiveHintSlide(0);
    }
  }, [showHintsModal]);

  React.useEffect(() => {
    const isOverLimit = level.maxInstructions ? totalBlockCount > level.maxInstructions : false;
    if (isOverLimit) {
      if (totalBlockCount > lastBlockCountRef.current || !toastMessage) {
        setToastMessage(`Blok kode melebihi kapasitas (${level.maxInstructions})! Hapus beberapa blok.`);
      }
    } else {
      setToastMessage(null);
    }
    lastBlockCountRef.current = totalBlockCount;
  }, [totalBlockCount, level.maxInstructions, toastMessage]);

  // Build render data for GridMap
  const characterRenderData: CharacterRenderData[] = (level.characters || []).map(character => {
    const state = characterStates[character.id];
    const activeStep = state?.compiledSteps.find(s => s.instructionId === state.activeInstructionId);
    return {
      id: character.id,
      pos: state?.pos || character.startPos,
      facingDir: state?.facingDir || 'RIGHT',
      trailPositions: state?.trailPositions || [],
      backpack: state?.backpack || [],
      backpackCapacity: level.maxCapacity,
      activeAction: activeStep?.action || null,
      activeInstructionId: state?.activeInstructionId || null,
    };
  });

  // Dev Auto-Solve Helper function for testing all levels
  const handleDevAutoSolve = () => {
    playSound('click');
    const levelId = level.id;
    
    // Helper to generate instructions with random unique IDs
    const createInstructions = (actions: CommandAction[]): Instruction[] => {
      return actions.map(act => ({ id: Math.random().toString(36).substring(2, 9), type: act }));
    };

    let actions: CommandAction[] = [];

    if (levelId === 1) {
      // Level 1: Mulai x=0 -> KANAN 3x ke x=3 AMBIL (Apel) -> KANAN 1x ke x=4 LONCAT batu x=5 ke x=6 -> KANAN 1x ke x=7 AMBIL (Kaleng Minuman) -> KANAN 7x ke x=14 BUANG (Kaleng Minuman) -> KIRI 1x ke x=13 BUANG (Apel)
      actions = [
        'RIGHT', 'RIGHT', 'RIGHT', 'PICK',
        'RIGHT', 'UP', 'RIGHT', 'PICK',
        'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DROP',
        'LEFT', 'DROP'
      ];
    } else if (levelId === 2) {
      // Level 2: Mulai x=0 -> KANAN 3x ke x=3 AMBIL (Apel) -> KANAN 1x ke x=4 LONCAT batu x=5 ke x=6 -> KANAN 1x ke x=7 AMBIL (Kaleng Minuman) -> KANAN 1x ke x=8 LONCAT batu x=9 ke x=10 AMBIL (Baterai Bekas) -> KANAN 5x ke x=15 BUANG (Baterai Bekas) -> KIRI 1x ke x=14 BUANG (Kaleng Minuman) -> KIRI 1x ke x=13 BUANG (Apel)
      actions = [
        'RIGHT', 'RIGHT', 'RIGHT', 'PICK',
        'RIGHT', 'UP', 'RIGHT', 'PICK',
        'RIGHT', 'UP', 'PICK',
        'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DROP',
        'LEFT', 'DROP',
        'LEFT', 'DROP'
      ];
    } else if (levelId === 3) {
      // Level 3: Mulai x=0 -> KANAN 1x ke x=1 LONCAT batu x=2 ke x=3 AMBIL (Baterai Bekas) -> KANAN 1x ke x=4 LONCAT batu x=5 ke x=6 -> KANAN 1x ke x=7 AMBIL (Kaleng Minuman) -> KANAN 1x ke x=8 LONCAT batu x=9 ke x=10 -> KANAN 1x ke x=11 AMBIL (Sayur) -> KANAN 2x ke x=13 BUANG (Sayur) -> KANAN 1x ke x=14 BUANG (Kaleng Minuman) -> KANAN 1x ke x=15 BUANG (Baterai Bekas)
      actions = [
        'RIGHT', 'UP', 'PICK',
        'RIGHT', 'UP', 'RIGHT', 'PICK',
        'RIGHT', 'UP', 'RIGHT', 'PICK',
        'RIGHT', 'RIGHT', 'DROP',
        'RIGHT', 'DROP',
        'RIGHT', 'DROP'
      ];
    }

    handleUpdateInstructions('ORGANIC', createInstructions(actions));
  };

  return (
    <div className="relative h-dvh overflow-hidden bg-stone-900 text-[#1C1917] flex flex-col selection:bg-indigo-500/30 font-sans leading-relaxed">
      {/* Background Image with blur & opacity-60 */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-60 backdrop-blur-md pointer-events-none"
        style={{ backgroundImage: `url(${bgArenaGame})` }}
      />
      <RotateDevicePrompt />

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Floating Developer Auto-Solve Button */}
      <button
        onClick={handleDevAutoSolve}
        className="fixed bottom-3 left-3 z-50 px-3 py-2 bg-indigo-650 hover:bg-indigo-600 border border-indigo-700 text-white text-[11px] font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 hover:scale-[1.02] opacity-40 hover:opacity-100"
        title="Auto-fill correct steps for this level"
      >
        🛠️ Dev Auto-Solve
      </button>

      {/* Main Core Layout Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 flex flex-col gap-2 min-h-0">
        {/* Top workspace: Canvas map */}
        <div className="h-[46%] flex flex-col min-h-0" id="top-workspace">
          <GridMap
            levelId={level.id}
            width={level.gridSize.width}
            height={level.gridSize.height}
            characters={characterRenderData}
            trashItems={activeTrash}
            trashCans={level.trashCans}
            obstacles={level.obstacles}
            isExecuting={isExecuting}
            onShowHints={() => { playSound('click'); setShowHintsModal(true); }}
          />
        </div>

        {/* Bottom workspace: Command builder */}
        <div className="h-[54%] flex flex-col min-h-0" id="bottom-workspace">
          <CommandPanel
            level={level}
            activeCharacter={activeCharacter}
            instructions={characterStates[activeCharacter]?.instructions || []}
            onUpdateInstructions={(updated) => handleUpdateInstructions(activeCharacter, updated)}
            onAddCommand={handleAddCommand}
            onClearInstructions={handleClearInstructions}
            onDeleteCommand={handleDeleteCommand}
            onMoveCommandUp={handleMoveCommandUp}
            onMoveCommandDown={handleMoveCommandDown}
            onSelectCharacter={setActiveCharacter}
            isExecuting={isExecuting}
            onStartExecution={handleStartExecution}
            onStopExecution={handleStopExecution}
            activeInstructionId={characterStates[activeCharacter]?.activeInstructionId || null}
            execSpeed={execSpeed}
            onSetExecSpeed={setExecSpeed}
            onReset={handleReset}
            totalBlockCount={totalBlockCount}
            characterBlocksCount={{
              ORGANIC: characterStates.ORGANIC?.instructions.length || 0,
              RECYCLABLE: characterStates.RECYCLABLE?.instructions.length || 0,
              B3: characterStates.B3?.instructions.length || 0,
            }}
          />
        </div>
      </main>

      {/* Level Success Modal */}
      <LevelSuccessModal
        isOpen={showResultModal && gameResult === 'SUCCESS'}
        onClose={() => setShowResultModal(false)}
        stars={resultStars}
        totalSteps={totalSteps}
        level={level}
        onNextLevel={onNextLevel}
        onBackToDashboard={onBackToDashboard}
        onRetry={() => {
          setShowResultModal(false);
          handleReset();
        }}
        playSound={playSound}
      />

      {/* Level Fail Modal */}
      <LevelFailModal
        isOpen={showResultModal && gameResult === 'FAILED'}
        onClose={() => setShowResultModal(false)}
        gameResult={gameResult}
        onRetry={() => {
          setShowResultModal(false);
          handleReset();
        }}
        onShowHints={() => {
          setShowResultModal(false);
          setShowHintsModal(true);
        }}
        playSound={playSound}
      />

      {/* Hints Modal */}
      <HintModal
        isOpen={showHintsModal}
        onClose={() => setShowHintsModal(false)}
        level={level}
        playSound={playSound}
      />
    </div>
  );
}

function StarIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.195-.572 1.045-.572 1.24 0l1.98 5.8 6.13.43c.613.043.86.82.387 1.218l-4.577 3.82 1.488 5.75c.149.576-.484 1.037-1.026.712L12 18.16l-5.02 2.87c-.542.325-1.175-.136-1.026-.712l1.488-5.75L2.865 10.95c-.473-.399-.226-1.175.387-1.218l6.13-.43 1.98-5.8z" />
    </svg>
  );
}
