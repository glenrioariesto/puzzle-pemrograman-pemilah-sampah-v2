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

// Import custom hook
import { useArenaGame } from './hooks/useArenaGame';

// Icons
import { X } from 'lucide-react';

import charOrganik from '@/assets/hijau-angkat.svg';
import charAnorganik from '@/assets/kuning-angkat.svg';
import charB3 from '@/assets/merah-angkat.svg';

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

  React.useEffect(() => {
    if (showHintsModal) {
      setActiveHintSlide(0);
    }
  }, [showHintsModal]);

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
    };
  });

  // Dev Auto-Solve Helper function for testing all 6 levels
  const handleDevAutoSolve = () => {
    playSound('click');
    const levelId = level.id;
    
    // Helper to generate instructions with random unique IDs
    const createInstructions = (actions: CommandAction[]): Instruction[] => {
      return actions.map(act => ({ id: Math.random().toString(36).substring(2, 9), type: act }));
    };

    let organicActions: CommandAction[] = [];
    let recyclableActions: CommandAction[] = [];
    let b3Actions: CommandAction[] = [];

    if (levelId === 1) {
      organicActions = ['RIGHT', 'RIGHT', 'DOWN', 'PICK', 'UP', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DROP'];
      recyclableActions = ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'UP', 'PICK', 'DOWN', 'RIGHT', 'RIGHT', 'RIGHT', 'DROP'];
      b3Actions = ['RIGHT', 'RIGHT', 'RIGHT', 'UP', 'UP', 'UP', 'RIGHT', 'RIGHT', 'RIGHT', 'PICK', 'DOWN', 'DOWN', 'DOWN', 'RIGHT', 'DROP'];
    } else if (levelId === 2) {
      organicActions = ['RIGHT', 'RIGHT', 'PICK', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DROP'];
      recyclableActions = ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'PICK', 'RIGHT', 'RIGHT', 'RIGHT', 'DROP'];
      b3Actions = ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'PICK', 'RIGHT', 'RIGHT', 'DROP'];
    } else if (levelId === 3) {
      organicActions = ['RIGHT', 'RIGHT', 'UP', 'PICK', 'DOWN', 'RIGHT', 'RIGHT', 'RIGHT', 'PICK', 'RIGHT', 'RIGHT', 'DROP'];
      recyclableActions = ['RIGHT', 'RIGHT', 'PICK', 'RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'PICK', 'UP', 'UP', 'RIGHT', 'RIGHT', 'DROP'];
      b3Actions = ['UP', 'DOWN', 'RIGHT', 'RIGHT', 'UP', 'PICK', 'DOWN', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DROP'];
    } else if (levelId === 4) {
      organicActions = ['RIGHT', 'DOWN', 'DOWN', 'DOWN', 'DOWN', 'PICK', 'UP', 'UP', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'PICK', 'UP', 'UP', 'RIGHT', 'RIGHT', 'DROP'];
      recyclableActions = ['RIGHT', 'RIGHT', 'PICK', 'RIGHT', 'UP', 'UP', 'PICK', 'RIGHT', 'UP', 'PICK', 'DOWN', 'DOWN', 'DOWN', 'RIGHT', 'RIGHT', 'RIGHT', 'DROP'];
      b3Actions = ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'PICK', 'RIGHT', 'RIGHT', 'DROP'];
    } else if (levelId === 5) {
      organicActions = ['RIGHT', 'RIGHT', 'UP', 'PICK', 'DOWN', 'DOWN', 'DOWN', 'DOWN', 'DOWN', 'PICK', 'UP', 'UP', 'UP', 'UP', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DROP'];
      recyclableActions = ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'UP', 'UP', 'UP', 'PICK', 'DOWN', 'DOWN', 'DOWN', 'DOWN', 'DOWN', 'DOWN', 'PICK', 'UP', 'UP', 'UP', 'RIGHT', 'RIGHT', 'DROP'];
      b3Actions = ['RIGHT', 'RIGHT', 'UP', 'UP', 'PICK', 'DOWN', 'RIGHT', 'RIGHT', 'RIGHT', 'PICK', 'DOWN', 'RIGHT', 'RIGHT', 'DROP'];
    } else if (levelId === 6) {
      organicActions = ['RIGHT', 'RIGHT', 'UP', 'PICK', 'DOWN', 'DOWN', 'DOWN', 'PICK', 'UP', 'UP', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DROP'];
      recyclableActions = ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'UP', 'UP', 'PICK', 'DOWN', 'DOWN', 'PICK', 'RIGHT', 'RIGHT', 'DROP'];
      b3Actions = ['RIGHT', 'RIGHT', 'RIGHT', 'PICK', 'RIGHT', 'RIGHT', 'PICK', 'RIGHT', 'RIGHT', 'DROP'];
    }

    handleUpdateInstructions('ORGANIC', createInstructions(organicActions));
    handleUpdateInstructions('RECYCLABLE', createInstructions(recyclableActions));
    handleUpdateInstructions('B3', createInstructions(b3Actions));
  };

  return (
    <div className="h-dvh overflow-hidden bg-[#FEF8F0] text-[#1C1917] flex flex-col selection:bg-indigo-500/30 font-sans leading-relaxed">
      <RotateDevicePrompt />

      {/* Floating Developer Auto-Solve Button */}
      <button
        onClick={handleDevAutoSolve}
        className="fixed top-3 left-3 z-50 px-3 py-2 bg-indigo-650 hover:bg-indigo-600 border border-indigo-700 text-white text-[11px] font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 hover:scale-[1.02]"
        title="Auto-fill correct steps for this level"
      >
        🛠️ Dev Auto-Solve
      </button>

      {/* Main Core Layout Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 flex flex-col min-h-0">
        {/* Main Grid: Canvas responsive */}
        <div className="flex-1 grid grid-cols-12 gap-2 min-h-0">
          {/* Left workspace: Command builder */}
          <div className="col-span-5 flex flex-col min-h-0" id="left-workspace">
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

          {/* Right workspace: Canvas map */}
          <div className="col-span-7 flex flex-col min-h-0" id="right-workspace">
            <GridMap
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
        </div>
      </main>

      {/* Modal: Game Results */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto animate-fade-in" id="game-results-modal-backdrop">
          <div className="bg-white border border-[#EED4B7] rounded-3xl p-6 sm:p-8 max-w-sm w-full max-h-[90vh] sm:max-h-[85vh] shadow-2xl relative text-center flex flex-col my-auto animate-scale-up" id="game-results-modal">
            <div className="flex-1 overflow-y-auto custom-scrollbar-light pr-1 py-1 space-y-6">
              {gameResult === 'SUCCESS' ? (
                <div className="space-y-4" id="modal-success-screen">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-md animate-bounce-slow">
                    🎉
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold font-sans text-emerald-600">Misi Selesai!</h3>
                    <p className="text-xs text-gray-500 font-medium">Semua sampah terpilah sempurna!</p>
                  </div>
                  {/* Stars */}
                  <div className="flex justify-center items-center gap-2" id="star-rewards">
                    {[1, 2, 3].map((star) => (
                      <div key={star} className="relative group">
                        <StarIcon className={`w-9 h-9 transition-all ${star <= resultStars ? 'text-amber-500 fill-amber-500 scale-110' : 'text-stone-200'}`} />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-stone-700 font-bold px-4 py-2.5 bg-[#FEF8F0] rounded-xl border border-[#EED4B7]">
                    Total langkah karakter: <b>{totalSteps} langkah</b>
                    <br />
                    <span className="text-[10px] text-stone-500 font-mono italic">
                      (Target Bintang 3: ≤ {level.starsThreshold.three} lgh)
                    </span>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button onClick={() => { playSound('click'); handleReset(); setShowResultModal(false); }}
                      className="flex-1 py-3 border border-[#EED4B7] bg-white text-stone-700 text-xs font-bold rounded-xl cursor-pointer hover:bg-stone-50 shadow-sm">
                      Ulangi Rute 🔄
                    </button>
                    <button onClick={() => { playSound('click'); setShowResultModal(false); onNextLevel(); }}
                      className="flex-1 py-3 bg-[#00ADEF] hover:bg-[#009CD7] border border-[#009CD7] font-bold text-xs text-white rounded-xl shadow-sm cursor-pointer transition-colors">
                      Misi Berikutnya ➡️
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4" id="modal-failed-screen">
                  <div className="w-16 h-16 rounded-full bg-rose-50 border-2 border-rose-500 text-rose-500 flex items-center justify-center mx-auto text-3xl shadow-md">
                    💥
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold font-sans text-rose-500">Karakter Berhenti!</h3>
                    <p className="text-xs text-stone-500 font-medium">Eksekusi gagal — periksa program karakter.</p>
                  </div>
                  <div className="p-3 bg-[#FEF8F0] rounded-xl border border-[#EED4B7] text-left text-xs space-y-1">
                    <span className="font-bold text-rose-700">Catatan:</span>
                    <p className="text-stone-600 leading-normal text-[11px]">
                      {logs[logs.length - 1] || 'Pastikan setiap karakter mengambil sampah yang benar dan membuang ke tong yang sesuai.'}
                    </p>
                  </div>
                  <div className="flex gap-2.5 pt-2">
                    <button onClick={() => { playSound('click'); setShowResultModal(false); }}
                      className="flex-1 py-3 border border-[#EED4B7] bg-white rounded-xl text-xs font-bold text-stone-500 hover:text-stone-700 cursor-pointer hover:bg-stone-50 shadow-sm">
                      Kembali Kode
                    </button>
                    <button onClick={() => { playSound('click'); handleReset(); setShowResultModal(false); }}
                      className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm">
                      Coba Lagi 🔄
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Hints */}
      {showHintsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto animate-fade-in" id="level-hints-modal-backdrop">
          <div className="bg-white border border-[#EED4B7] rounded-3xl p-6 sm:p-8 max-w-lg w-full min-h-[380px] sm:min-h-[420px] shadow-2xl relative flex flex-col my-auto animate-scale-up" id="level-hints-modal">
            {/* Floating Close Button */}
            <button onClick={() => { playSound('click'); setShowHintsModal(false); }}
              className="absolute top-4 right-4 z-10 p-1.5 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-850 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            
            {/* Slide Body Wrapper */}
            <div className="flex-1 pr-1 py-4 flex flex-col justify-center min-h-[220px] sm:min-h-[260px] text-xs sm:text-sm text-stone-600 leading-relaxed font-sans mt-3">
              {activeHintSlide === 0 && (
                <div className="space-y-3 bg-[#FEF8F0] p-4 rounded-2xl border border-[#EED4B7]/70 flex-1 flex flex-col justify-center animate-fade-in">
                  <span className="font-extrabold text-indigo-700 flex items-center gap-1.5 text-xs tracking-wider uppercase font-mono">
                    🎯 TUJUAN MISI
                  </span>
                  <p className="text-stone-700 text-xs leading-relaxed">{level.description}</p>
                  
                  {/* Character starting position info */}
                  <div className="pt-2 border-t border-[#EED4B7]/40 space-y-1.5 mt-auto">
                    <span className="font-bold text-indigo-700 text-[10px] tracking-wider uppercase font-mono">🧹 Posisi Mulai Karakter</span>
                    <div className="grid grid-cols-3 gap-2">
                      {level.characters?.map(r => {
                        const img = CHARACTER_IMAGES[r.id];
                        return (
                          <div key={r.id} className="flex flex-col items-center p-1.5 bg-white border border-[#EED4B7]/40 rounded-xl text-center">
                            <img src={img} alt={r.name} className="w-6 h-6 object-contain mb-1" />
                            <span className="font-extrabold text-[9px] text-stone-700">{r.name}</span>
                            <span className="text-[9px] text-stone-500 font-mono">({r.startPos.x}, {r.startPos.y})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeHintSlide === 1 && (
                <div className="space-y-4 bg-[#FEF8F0] p-4 rounded-2xl border border-[#EED4B7]/70 flex-1 flex flex-col justify-center animate-fade-in">
                  <span className="font-extrabold text-indigo-700 flex items-center gap-1.5 text-xs tracking-wider uppercase font-mono">
                    ⭐ TARGET EFISIENSI BINTANG
                  </span>
                  <p className="text-stone-600 text-xs">
                    Selesaikan level dengan sesedikit mungkin blok instruksi untuk mendapatkan bintang maksimal!
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="p-3 bg-white border border-[#EED4B7]/40 rounded-2xl shadow-sm text-center">
                      <div className="flex justify-center gap-0.5 text-amber-500 mb-1">
                        <StarIcon className="w-4.5 h-4.5 fill-amber-500 text-amber-500" />
                        <StarIcon className="w-4.5 h-4.5 fill-amber-500 text-amber-500" />
                        <StarIcon className="w-4.5 h-4.5 fill-amber-500 text-amber-500" />
                      </div>
                      <span className="block font-extrabold text-xs text-stone-700">3 Bintang</span>
                      <span className="font-mono text-[10px] text-stone-500">Total blok ≤ {level.starsThreshold.three}</span>
                    </div>

                    <div className="p-3 bg-white border border-[#EED4B7]/40 rounded-2xl shadow-sm text-center">
                      <div className="flex justify-center gap-0.5 text-amber-500 mb-1">
                        <StarIcon className="w-4.5 h-4.5 fill-amber-500 text-amber-500" />
                        <StarIcon className="w-4.5 h-4.5 fill-amber-500 text-amber-500" />
                        <StarIcon className="w-4.5 h-4.5 text-stone-200" />
                      </div>
                      <span className="block font-extrabold text-xs text-stone-700">2 Bintang</span>
                      <span className="font-mono text-[10px] text-stone-500">Total blok ≤ {level.starsThreshold.two}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeHintSlide === 2 && (
                <div className="space-y-3 bg-[#FEF8F0] p-4 rounded-2xl border border-[#EED4B7]/70 flex-1 flex flex-col justify-start overflow-y-auto animate-fade-in">
                  <span className="font-extrabold text-indigo-700 flex items-center gap-1.5 text-xs tracking-wider uppercase font-mono">
                    🧠 PETUNJUK PENYELESAIAN
                  </span>
                  <ul className="space-y-2 mt-1">
                    {level.hints.map((hint, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-stone-600 text-xs leading-normal">
                        <span className="text-indigo-600 font-extrabold mt-0.5">•</span>
                        <span>{hint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Slide Navigation Bottom Bar */}
            <div className="pt-4 border-t border-[#EED4B7]/50 flex items-center justify-between mt-auto flex-shrink-0">
              <button
                type="button"
                disabled={activeHintSlide === 0}
                onClick={() => { playSound('click'); setActiveHintSlide(prev => Math.max(0, prev - 1)); }}
                className={`px-3.5 py-2 border border-[#EED4B7] bg-white rounded-xl text-xs font-bold text-stone-600 cursor-pointer hover:bg-stone-50 transition-colors shadow-sm ${activeHintSlide === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                ⬅️ Sebelumnya
              </button>

              {/* Dots */}
              <div className="flex gap-1.5">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { playSound('click'); setActiveHintSlide(idx); }}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${idx === activeHintSlide ? 'bg-indigo-650 scale-110' : 'bg-stone-200'}`}
                  />
                ))}
              </div>

              {activeHintSlide < 2 ? (
                <button
                  type="button"
                  onClick={() => { playSound('click'); setActiveHintSlide(prev => Math.min(2, prev + 1)); }}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 border border-amber-500 text-stone-900 rounded-xl text-xs font-extrabold transition-colors cursor-pointer shadow-sm"
                >
                  Selanjutnya ➡️
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { playSound('click'); setShowHintsModal(false); }}
                  className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 border border-emerald-500 text-stone-950 rounded-xl text-xs font-extrabold transition-colors cursor-pointer shadow-sm flex items-center gap-1"
                >
                  Mulai Misi! 🎮
                </button>
              )}
            </div>
          </div>
        </div>
      )}
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
