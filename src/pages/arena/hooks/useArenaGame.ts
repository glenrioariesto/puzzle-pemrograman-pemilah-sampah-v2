/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import {
  GameLevel,
  Instruction,
  CommandAction,
  CharacterId,
  GridPos,
  TrashOnGrid,
  Character
} from '../../../types';

import clickSfx from '../../../../assets/click.mp3';

// Per-character execution state
interface CharacterState {
  pos: GridPos;
  facingDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  instructions: Instruction[];
  compiledSteps: { instructionId: string; action: CommandAction }[];
  playbackIndex: number;
  activeInstructionId: string | null;
  backpack: any[]; // using simplified representation
  trailPositions: GridPos[];
  finished: boolean;
  hasErrored: boolean;
}

const uuid = () => Math.random().toString(36).substring(2, 9);

export function useArenaGame(
  level: GameLevel,
  isMuted: boolean,
  onSaveHighScore: (levelId: number, stars: number, minSteps: number) => void
) {
  // --- Initial Character States Helper ---
  const createInitialCharacterStates = (): Record<CharacterId, CharacterState> => {
    const states: Record<string, CharacterState> = {};
    for (const character of level.characters) {
      states[character.id] = {
        pos: { ...character.startPos },
        facingDir: 'RIGHT',
        instructions: [],
        compiledSteps: [],
        playbackIndex: 0,
        activeInstructionId: null,
        backpack: [],
        trailPositions: [{ ...character.startPos }],
        finished: false,
        hasErrored: false,
      };
    }
    return states as Record<CharacterId, CharacterState>;
  };

  const [activeCharacter, setActiveCharacter] = useState<CharacterId>('ORGANIC');
  const [characterStates, setCharacterStates] = useState<Record<CharacterId, CharacterState>>(createInitialCharacterStates);

  // Simulation execution tracking states
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTrash, setActiveTrash] = useState<TrashOnGrid[]>([]);

  // Logs for console terminal
  const [logs, setLogs] = useState<string[]>([]);

  // Results State
  const [gameResult, setGameResult] = useState<'SUCCESS' | 'FAILED' | null>(null);
  const [resultStars, setResultStars] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);

  // Guide overlay states
  const [showHintsModal, setShowHintsModal] = useState(false);

  // Execution refs — mutable state during interval to avoid stale closures
  const characterStatesRef = useRef<Record<CharacterId, CharacterState>>(characterStates);
  characterStatesRef.current = characterStates;
  const activeTrashRef = useRef<TrashOnGrid[]>(activeTrash);
  activeTrashRef.current = activeTrash;
  const logsRef = useRef<string[]>(logs);
  logsRef.current = logs;

  // Simulation Timer Ref
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [execSpeed, setExecSpeed] = useState(1);

  // Initialize level upon load
  const getCharacterLabel = (id: CharacterId) => {
    return 'Robot Pemilah';
  };

  useEffect(() => {
    const initial = createInitialCharacterStates();
    setCharacterStates(initial);
    characterStatesRef.current = initial;
    const trash = level.trashItems.map(t => ({ ...t, collected: false }));
    setActiveTrash(trash);
    activeTrashRef.current = trash;
    setLogs([
      `[Sistem] Memuat Level ${level.id}: ${level.name}`,
      `[Sistem] Robot Pemilah siap! 🤖`,
      `[Sistem] Susun program untuk mengendalikan robot.`
    ]);
    setGameResult(null);
    setShowResultModal(false);
    setShowHintsModal(true);
  }, [level.id]);

  // Helper labels
  const getIndonesianLabel = (action: CommandAction) => {
    switch (action) {
      case 'UP': return 'Atas ⬆️';
      case 'DOWN': return 'Bawah ⬇️';
      case 'LEFT': return 'Kiri ⬅️';
      case 'RIGHT': return 'Kanan ➡️';
      case 'PICK': return 'Ambil Sampah 👐';
      case 'DROP': return 'Buang Sampah 🗑️';
      default: return '';
    }
  };

  // --- Character Program Handlers ---
  const handleAddCommand = (action: CommandAction) => {
    playSound('click');
    setCharacterStates(prev => {
      const state = prev[activeCharacter];
      const newInst: Instruction = { id: uuid(), type: action };
      return {
        ...prev,
        [activeCharacter]: {
          ...state,
          instructions: [...state.instructions, newInst]
        }
      };
    });
    setLogs(prev => [...prev, `[Sistem] ${getCharacterLabel(activeCharacter)}: Menambahkan blok: ${getIndonesianLabel(action)}`]);
  };

  const handleClearInstructions = () => {
    playSound('click');
    setCharacterStates(prev => ({
      ...prev,
      [activeCharacter]: { ...prev[activeCharacter], instructions: [] }
    }));
    setLogs(prev => [...prev, `[Sistem] ${getCharacterLabel(activeCharacter)}: Program dikosongkan.`]);
  };

  const handleUpdateInstructions = (characterId: CharacterId, updated: Instruction[]) => {
    setCharacterStates(prev => ({
      ...prev,
      [characterId]: {
        ...prev[characterId],
        instructions: updated
      }
    }));
  };

  const handleDeleteCommand = (id: string) => {
    playSound('click');
    setCharacterStates(prev => ({
      ...prev,
      [activeCharacter]: { ...prev[activeCharacter], instructions: prev[activeCharacter].instructions.filter(item => item.id !== id) }
    }));
  };

  const handleMoveCommandUp = (index: number) => {
    if (index === 0) return;
    playSound('click');
    setCharacterStates(prev => {
      const copy = [...prev[activeCharacter].instructions];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return { ...prev, [activeCharacter]: { ...prev[activeCharacter], instructions: copy } };
    });
  };

  const handleMoveCommandDown = (index: number) => {
    if (index >= characterStates[activeCharacter].instructions.length - 1) return;
    playSound('click');
    setCharacterStates(prev => {
      const copy = [...prev[activeCharacter].instructions];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return { ...prev, [activeCharacter]: { ...prev[activeCharacter], instructions: copy } };
    });
  };

  // --- Audio ---
  const playSound = (type: 'click' | 'jump' | 'collect' | 'success' | 'fail' | 'dump' | 'crash') => {
    if (isMuted) return;
    try {
      if (type === 'click') {
        const audio = new Audio(clickSfx);
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'jump') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
      } else if (type === 'collect') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
      } else if (type === 'dump') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now); osc.stop(now + 0.25);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        osc.frequency.setValueAtTime(1046.50, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.55);
        osc.start(now); osc.stop(now + 0.55);
      } else if (type === 'fail' || type === 'crash') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.4);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
        osc.start(now); osc.stop(now + 0.4);
      }
    } catch (e) { /* audio not available */ }
  };

  // --- Compilation ---
  const compileInstructions = (instList: Instruction[]): { instructionId: string; action: CommandAction }[] => {
    return instList.map(item => ({ instructionId: item.id, action: item.type }));
  };

  // --- Execution Control ---
  const handleStartExecution = () => {
    // Check if any character has a program
    const hasProgram = Object.values(characterStatesRef.current).some(c => c.instructions.length > 0);
    if (!hasProgram) return;
    playSound('click');

    const newCharacters: Record<CharacterId, CharacterState> = {} as Record<CharacterId, CharacterState>;
    for (const character of level.characters) {
      const state = characterStatesRef.current[character.id] || characterStates[character.id];
      newCharacters[character.id] = {
        pos: { ...character.startPos },
        facingDir: 'RIGHT',
        instructions: state?.instructions || [],
        compiledSteps: compileInstructions(state?.instructions || []),
        playbackIndex: 0,
        activeInstructionId: null,
        backpack: [],
        trailPositions: [{ ...character.startPos }],
        finished: false,
        hasErrored: false,
      };
    }

    setCharacterStates(newCharacters);
    characterStatesRef.current = newCharacters;
    const trash = level.trashItems.map(t => ({ ...t, collected: false }));
    setActiveTrash(trash);
    activeTrashRef.current = trash;
    setIsExecuting(true);

    const totalCmds = Object.values(newCharacters).reduce((s, c) => s + c.compiledSteps.length, 0);
    setLogs([
      `[Sistem] Memulai simulasi...`,
      `[Sistem] Robot Pemilah: ${totalCmds} langkah terkompilasi.`
    ]);
  };

  const handleStopExecution = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    playSound('fail');
    setIsExecuting(false);
    setLogs(prev => [...prev, `[Sistem] Eksekusi dihentikan oleh pengguna.`]);
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsExecuting(false);
    // Clear all user programs and reset positions/backpacks/trails
    setCharacterStates(prev => {
      const updated: Record<string, CharacterState> = {};
      for (const character of level.characters) {
        updated[character.id] = {
          pos: { ...character.startPos },
          facingDir: 'RIGHT',
          instructions: [],
          compiledSteps: [],
          playbackIndex: 0,
          activeInstructionId: null,
          backpack: [],
          trailPositions: [{ ...character.startPos }],
          finished: false,
          hasErrored: false,
        };
      }
      return updated as Record<CharacterId, CharacterState>;
    });

    const trash = level.trashItems.map(t => ({ ...t, collected: false }));
    setActiveTrash(trash);
    activeTrashRef.current = trash;
    setGameResult(null);
    setShowResultModal(false);
    setLogs([
      `[Sistem] Reset: Simulasi diatur ulang & program dikosongkan.`,
      `[Sistem] Susun program untuk menyusun langkah Robot Pemilah.`
    ]);
  };

  // --- Collision detection ---
  const checkCollision = (
    targetX: number, targetY: number,
    characters: Record<CharacterId, CharacterState>,
    currentCharacterId: CharacterId
  ): 'OK' | 'WALL' | 'OBSTACLE' | 'CHARACTER' => {
    if (targetX < 0 || targetX >= level.gridSize.width || targetY < 0 || targetY >= level.gridSize.height) {
      return 'WALL';
    }
    const obstacle = level.obstacles.find(o => o.pos.x === targetX && o.pos.y === targetY);
    if (obstacle) return 'OBSTACLE';
    // Check if another character is already at target position (active, finished, or errored)
    const otherCharacter = Object.entries(characters).find(([id, c]) => id !== currentCharacterId && c.pos.x === targetX && c.pos.y === targetY);
    if (otherCharacter) return 'CHARACTER';
    return 'OK';
  };

  // Clone character states for React state (avoids mutation issues)
  const cloneCharacterStates = (states: Record<CharacterId, CharacterState>): Record<CharacterId, CharacterState> => {
    const cloned: Record<string, CharacterState> = {};
    for (const [id, s] of Object.entries(states)) {
      cloned[id] = {
        ...s,
        pos: { ...s.pos },
        instructions: [...s.instructions],
        compiledSteps: [...s.compiledSteps],
        backpack: [...s.backpack],
        trailPositions: [...s.trailPositions],
      };
    }
    return cloned as Record<CharacterId, CharacterState>;
  };

  // --- Result Evaluation ---
  const evaluateGameResult = (finalCharacters: Record<CharacterId, CharacterState>, finalTrash: TrashOnGrid[]) => {
    const someTrashLeaking = finalTrash.some(t => !t.collected);
    const backpackNotEmpty = Object.values(finalCharacters).some(c => c.backpack.length > 0);
    const anyError = Object.values(finalCharacters).some(c => c.hasErrored);

    if (someTrashLeaking || backpackNotEmpty || anyError) {
      playSound('fail');
      setLogs(prev => [
        ...prev,
        `[Kesalahan] Misi gagal! Beberapa sampah masih berserakan atau karakter membawa sampah di tas.`
      ]);
      setGameResult('FAILED');
      setShowResultModal(true);
    } else {
      playSound('success');
      const codeSizeUsed = Object.values(finalCharacters).reduce((sum, c) => sum + c.compiledSteps.length, 0);

      let stars = 1;
      if (codeSizeUsed <= level.starsThreshold.three) {
        stars = 3;
      } else if (codeSizeUsed <= level.starsThreshold.two) {
        stars = 2;
      }

      setResultStars(stars);
      setTotalSteps(codeSizeUsed);
      setGameResult('SUCCESS');
      setShowResultModal(true);
      setLogs(prev => [
        ...prev, '',
        `[Pilah Sukses] SELAMAT! Taman bersih! Total ${codeSizeUsed} langkah karakter! 🎉`,
        `[Pilah Sukses] Peringkat: ${stars} / 3 Bintang.`
      ]);
      onSaveHighScore(level.id, stars, codeSizeUsed);
    }
  };

  // --- Parallel Execution Loop ---
  useEffect(() => {
    if (!isExecuting) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const intervalTime = 650 / execSpeed;

    intervalRef.current = setInterval(() => {
      const currentCharacters = { ...characterStatesRef.current };
      const currentTrash = [...activeTrashRef.current];
      const newLogs: string[] = [];
      let allFinished = true;
      let hasError = false;

      // Process each character's next step
      for (const characterId of Object.keys(currentCharacters) as CharacterId[]) {
        const character = { ...currentCharacters[characterId] };
        if (character.finished || character.hasErrored) continue;

        if (character.playbackIndex >= character.compiledSteps.length) {
          character.finished = true;
          currentCharacters[characterId] = character;
          continue;
        }

        allFinished = false;
        const step = character.compiledSteps[character.playbackIndex];
        character.activeInstructionId = step.instructionId;

        const characterLabel = getCharacterLabel(characterId);
        const stepNum = character.playbackIndex + 1;

        switch (step.action) {
          case 'UP': {
            playSound('jump');
            const targetX = character.pos.x;
            const targetY = character.pos.y - 1;
            character.facingDir = 'UP';

            const collision = checkCollision(targetX, targetY, currentCharacters, characterId);
            if (collision === 'WALL') {
              playSound('crash'); character.hasErrored = true; currentCharacters[characterId] = character; hasError = true;
              newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Bergerak ke atas...`);
              newLogs.push(`[Kesalahan] ${characterLabel} menabrak dinding taman di (${targetX}, ${targetY})! 💥`);
              break;
            }
            if (collision === 'OBSTACLE') {
              playSound('crash'); character.hasErrored = true; currentCharacters[characterId] = character; hasError = true;
              newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Bergerak ke atas...`);
              const obs = level.obstacles.find(o => o.pos.x === targetX && o.pos.y === targetY);
              newLogs.push(`[Kesalahan] ${characterLabel} menabrak rintangan ${obs?.emoji || '?'} di (${targetX}, ${targetY})! 💥`);
              break;
            }
            if (collision === 'CHARACTER') {
              playSound('crash'); character.hasErrored = true; currentCharacters[characterId] = character; hasError = true;
              newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Bergerak ke atas...`);
              newLogs.push(`[Kesalahan] ${characterLabel} bertabrakan dengan karakter lain di (${targetX}, ${targetY})! 💥`);
              break;
            }

            character.pos = { x: targetX, y: targetY };
            character.trailPositions = [...character.trailPositions, { x: targetX, y: targetY }];
            newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Melangkah ke (${targetX}, ${targetY}).`);
            break;
          }

          case 'DOWN': {
            playSound('jump');
            const targetX = character.pos.x;
            const targetY = character.pos.y + 1;
            character.facingDir = 'DOWN';

            const collision = checkCollision(targetX, targetY, currentCharacters, characterId);
            if (collision === 'WALL') {
              playSound('crash'); character.hasErrored = true; currentCharacters[characterId] = character; hasError = true;
              newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Bergerak ke bawah...`);
              newLogs.push(`[Kesalahan] ${characterLabel} menabrak dinding taman di (${targetX}, ${targetY})! 💥`);
              break;
            }
            if (collision === 'OBSTACLE') {
              playSound('crash'); character.hasErrored = true; currentCharacters[characterId] = character; hasError = true;
              newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Bergerak ke bawah...`);
              const obs = level.obstacles.find(o => o.pos.x === targetX && o.pos.y === targetY);
              newLogs.push(`[Kesalahan] ${characterLabel} menabrak rintangan ${obs?.emoji || '?'} di (${targetX}, ${targetY})! 💥`);
              break;
            }
            if (collision === 'CHARACTER') {
              playSound('crash'); character.hasErrored = true; currentCharacters[characterId] = character; hasError = true;
              newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Bergerak ke bawah...`);
              newLogs.push(`[Kesalahan] ${characterLabel} bertabrakan dengan karakter lain di (${targetX}, ${targetY})! 💥`);
              break;
            }

            character.pos = { x: targetX, y: targetY };
            character.trailPositions = [...character.trailPositions, { x: targetX, y: targetY }];
            newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Melangkah ke (${targetX}, ${targetY}).`);
            break;
          }

          case 'LEFT': {
            playSound('jump');
            const targetX = character.pos.x - 1;
            const targetY = character.pos.y;
            character.facingDir = 'LEFT';

            const collision = checkCollision(targetX, targetY, currentCharacters, characterId);
            if (collision === 'WALL') {
              playSound('crash'); character.hasErrored = true; currentCharacters[characterId] = character; hasError = true;
              newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Bergerak ke kiri...`);
              newLogs.push(`[Kesalahan] ${characterLabel} menabrak dinding taman di (${targetX}, ${targetY})! 💥`);
              break;
            }
            if (collision === 'OBSTACLE') {
              playSound('crash'); character.hasErrored = true; currentCharacters[characterId] = character; hasError = true;
              newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Bergerak ke kiri...`);
              const obs = level.obstacles.find(o => o.pos.x === targetX && o.pos.y === targetY);
              newLogs.push(`[Kesalahan] ${characterLabel} menabrak rintangan ${obs?.emoji || '?'} di (${targetX}, ${targetY})! 💥`);
              break;
            }
            if (collision === 'CHARACTER') {
              playSound('crash'); character.hasErrored = true; currentCharacters[characterId] = character; hasError = true;
              newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Bergerak ke kiri...`);
              newLogs.push(`[Kesalahan] ${characterLabel} bertabrakan dengan karakter lain di (${targetX}, ${targetY})! 💥`);
              break;
            }

            character.pos = { x: targetX, y: targetY };
            character.trailPositions = [...character.trailPositions, { x: targetX, y: targetY }];
            newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Melangkah ke (${targetX}, ${targetY}).`);
            break;
          }

          case 'RIGHT': {
            playSound('jump');
            const targetX = character.pos.x + 1;
            const targetY = character.pos.y;
            character.facingDir = 'RIGHT';

            const collision = checkCollision(targetX, targetY, currentCharacters, characterId);
            if (collision === 'WALL') {
              playSound('crash'); character.hasErrored = true; currentCharacters[characterId] = character; hasError = true;
              newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Bergerak ke kanan...`);
              newLogs.push(`[Kesalahan] ${characterLabel} menabrak dinding taman di (${targetX}, ${targetY})! 💥`);
              break;
            }
            if (collision === 'OBSTACLE') {
              playSound('crash'); character.hasErrored = true; currentCharacters[characterId] = character; hasError = true;
              newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Bergerak ke kanan...`);
              const obs = level.obstacles.find(o => o.pos.x === targetX && o.pos.y === targetY);
              newLogs.push(`[Kesalahan] ${characterLabel} menabrak rintangan ${obs?.emoji || '?'} di (${targetX}, ${targetY})! 💥`);
              break;
            }
            if (collision === 'CHARACTER') {
              playSound('crash'); character.hasErrored = true; currentCharacters[characterId] = character; hasError = true;
              newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Bergerak ke kanan...`);
              newLogs.push(`[Kesalahan] ${characterLabel} bertabrakan dengan karakter lain di (${targetX}, ${targetY})! 💥`);
              break;
            }

            character.pos = { x: targetX, y: targetY };
            character.trailPositions = [...character.trailPositions, { x: targetX, y: targetY }];
            newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Melangkah ke (${targetX}, ${targetY}).`);
            break;
          }

          case 'PICK': {
            const foundIdx = currentTrash.findIndex(
              t => t.pos.x === character.pos.x && t.pos.y === character.pos.y && !t.collected
            );
            if (foundIdx !== -1) {
              const targetTrash = currentTrash[foundIdx];
              if (character.backpack.length >= level.maxCapacity) {
                playSound('fail');
                character.hasErrored = true; currentCharacters[characterId] = character; hasError = true;
                newLogs.push(`[Aksi] ${characterLabel} langkah ${stepNum}: Ingin mengambil ${targetTrash.item.name} di (${character.pos.x}, ${character.pos.y}).`);
                newLogs.push(`[Kesalahan] ${characterLabel} gagal! Tas penuh! Kapasitas maksimal ${level.maxCapacity}.`);
                break;
              }
              playSound('collect');
              currentTrash[foundIdx] = { ...targetTrash, collected: true };
              character.backpack = [...character.backpack, targetTrash.item];
              newLogs.push(`[Aksi] ${characterLabel} langkah ${stepNum}: Mengambil "${targetTrash.item.name}" ${targetTrash.item.emoji} di (${character.pos.x}, ${character.pos.y}).`);
            } else {
              newLogs.push(`[Perhatian] ${characterLabel} langkah ${stepNum}: Tidak ada sampah di (${character.pos.x}, ${character.pos.y})!`);
            }
            break;
          }

          case 'DROP': {
            const foundCan = level.trashCans.find(
              tc => tc.pos.x === character.pos.x && tc.pos.y === character.pos.y
            );
            if (foundCan) {
              const matchingItems = character.backpack.filter(item => item.type === foundCan.type);
              if (matchingItems.length > 0) {
                playSound('dump');
                character.backpack = character.backpack.filter(item => item.type !== foundCan.type);
                newLogs.push(`[Pilah Sukses] ${characterLabel} langkah ${stepNum}: ${matchingItems.length} sampah ${foundCan.label} dibuang ke tong ${foundCan.emoji}!`);
              } else {
                playSound('fail');
                newLogs.push(`[Aksi] ${characterLabel} langkah ${stepNum}: Karakter di atas Tong ${foundCan.label} ${foundCan.emoji} tapi tidak membawa sampah jenis ini!`);
              }
            } else {
              playSound('click');
              newLogs.push(`[Perhatian] ${characterLabel} langkah ${stepNum}: Karakter membuang sampah di tanah kosong!`);
            }
            break;
          }
        }

        character.playbackIndex++;
        currentCharacters[characterId] = character;
      }

      characterStatesRef.current = currentCharacters;
      activeTrashRef.current = currentTrash;

      setCharacterStates(cloneCharacterStates(currentCharacters));
      setActiveTrash([...currentTrash]);
      if (newLogs.length > 0) {
        setLogs(prev => [...prev, ...newLogs]);
      }

      if (allFinished || hasError) {
        clearInterval(intervalRef.current!);
        setIsExecuting(false);

        if (hasError) {
          setGameResult('FAILED');
          setShowResultModal(true);
        } else {
          evaluateGameResult(cloneCharacterStates(currentCharacters), currentTrash);
        }
      }
    }, intervalTime);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isExecuting, execSpeed, level]);

  // Total blocks programmed across all characters
  const totalBlockCount = Object.values(characterStates).reduce((sum, c) => sum + c.instructions.length, 0);

  return {
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
  };
}
