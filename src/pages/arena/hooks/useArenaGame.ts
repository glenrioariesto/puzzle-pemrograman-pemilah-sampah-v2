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
  TrashType
} from '../../../types';

import { playSfx, SoundType } from '../../../utils/audio';

// Per-character execution state
export interface CharacterState {
  pos: GridPos;
  facingDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  instructions: Instruction[];
  compiledSteps: { instructionId: string; action: CommandAction }[];
  playbackIndex: number;
  activeInstructionId: string | null;
  isDumping: boolean;
  dumpingCanType: TrashType | null;
  isPicking: boolean;
  backpack: any[];
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
  const createInitialCharacterStates = (preserveInstructions?: Record<CharacterId, Instruction[]>): Record<CharacterId, CharacterState> => {
    const states: Record<string, CharacterState> = {};
    for (const character of level.characters) {
      states[character.id] = {
        pos: { ...character.startPos },
        facingDir: 'RIGHT',
        instructions: preserveInstructions?.[character.id] ? [...preserveInstructions[character.id]] : [],
        compiledSteps: [],
        playbackIndex: 0,
        activeInstructionId: null,
        isDumping: false,
        dumpingCanType: null,
        isPicking: false,
        backpack: [],
        trailPositions: [{ ...character.startPos }],
        finished: false,
        hasErrored: false,
      };
    }
    return states as Record<CharacterId, CharacterState>;
  };

  const [activeCharacter, setActiveCharacter] = useState<CharacterId>('ORGANIC');
  const [characterStates, setCharacterStates] = useState<Record<CharacterId, CharacterState>>(() => createInitialCharacterStates());

  // Simulation execution tracking states
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTrash, setActiveTrash] = useState<TrashOnGrid[]>([]);

  // Track whether execution was paused via STOP button so MULAI can resume from current position
  const isPausedRef = useRef<boolean>(false);

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

  // Physics tracking state for continuous platformer movement
  const physicsStateRef = useRef<Record<CharacterId, {
    x: number;
    y: number;
    vx: number;
    vy: number;
    isOnGround: boolean;
    frameTicks: number;
    playbackIndex: number;
    activeInstructionId: string | null;
    isDumping: boolean;
    dumpingCanType: TrashType | null;
    isPicking: boolean;
    backpack: any[];
    finished: boolean;
    hasErrored: boolean;
  }>>({
    ORGANIC: { x: 0, y: 3, vx: 0, vy: 0, isOnGround: true, frameTicks: 0, playbackIndex: 0, activeInstructionId: null, isDumping: false, dumpingCanType: null, isPicking: false, backpack: [], finished: false, hasErrored: false },
    RECYCLABLE: { x: 0, y: 3, vx: 0, vy: 0, isOnGround: true, frameTicks: 0, playbackIndex: 0, activeInstructionId: null, isDumping: false, dumpingCanType: null, isPicking: false, backpack: [], finished: false, hasErrored: false },
    B3: { x: 0, y: 3, vx: 0, vy: 0, isOnGround: true, frameTicks: 0, playbackIndex: 0, activeInstructionId: null, isDumping: false, dumpingCanType: null, isPicking: false, backpack: [], finished: false, hasErrored: false }
  });

  const resetPhysicsToStart = () => {
    for (const character of level.characters) {
      physicsStateRef.current[character.id] = {
        x: character.startPos.x,
        y: character.startPos.y,
        vx: 0,
        vy: 0,
        isOnGround: true,
        frameTicks: 0,
        playbackIndex: 0,
        activeInstructionId: null,
        isDumping: false,
        dumpingCanType: null,
        isPicking: false,
        backpack: [],
        finished: false,
        hasErrored: false
      };
    }
  };

  // Initialize level upon load
  const getCharacterLabel = (_id: CharacterId) => {
    return 'Petugas Sampah';
  };

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsExecuting(false);
    isPausedRef.current = false;
    const initial = createInitialCharacterStates();
    setCharacterStates(initial);
    characterStatesRef.current = initial;
    resetPhysicsToStart();
    const trash = level.trashItems.map(t => ({ ...t, collected: false }));
    setActiveTrash(trash);
    activeTrashRef.current = trash;
    setLogs([
      `[Sistem] Memuat Level ${level.id}: ${level.name}`,
      `[Sistem] Petugas Sampah siap! 🤖`,
      `[Sistem] Susun program untuk mengendalikan Petugas Sampah.`
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
    isPausedRef.current = false;
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
  const playSound = (type: SoundType) => {
    playSfx(type, isMuted);
  };

  // --- Compilation ---
  const compileInstructions = (instList: Instruction[]): { instructionId: string; action: CommandAction }[] => {
    return instList.map(item => ({ instructionId: item.id, action: item.type }));
  };

  // --- Execution Control ---
  const handleStartExecution = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Check if any character has a program
    const hasProgram = Object.values(characterStatesRef.current).some(c => c.instructions.length > 0);
    if (!hasProgram) {
      playSound('fail');
      setLogs([`[Peringatan] Program masih kosong! Tambahkan blok perintah terlebih dahulu.`]);
      return;
    }
    playSound('click');

    // Check if we can resume from a paused state (STOP -> MULAI continues directly)
    const canResume = isPausedRef.current && level.characters.some(ch => {
      const phys = physicsStateRef.current[ch.id];
      const st = characterStatesRef.current[ch.id];
      const totalInst = st?.instructions.length || 0;
      return phys && !phys.hasErrored && (phys.playbackIndex < totalInst || phys.frameTicks > 0);
    });

    if (canResume) {
      const resumedCharacters: Record<CharacterId, CharacterState> = {} as Record<CharacterId, CharacterState>;
      for (const character of level.characters) {
        const state = characterStatesRef.current[character.id] || characterStates[character.id];
        const phys = physicsStateRef.current[character.id];
        const compiled = compileInstructions(state?.instructions || []);

        // If the currently active instruction was edited/replaced while paused, reset frameTicks for the current step
        const currentStep = compiled[phys.playbackIndex];
        if (!currentStep || currentStep.instructionId !== phys.activeInstructionId) {
          phys.frameTicks = 0;
          phys.vx = 0;
          phys.vy = 0;
          phys.isDumping = false;
          phys.dumpingCanType = null;
          phys.isPicking = false;
          phys.activeInstructionId = currentStep ? currentStep.instructionId : null;
        }
        phys.finished = phys.playbackIndex >= compiled.length;
        phys.hasErrored = false;

        resumedCharacters[character.id] = {
          ...state,
          compiledSteps: compiled,
          playbackIndex: phys.playbackIndex,
          activeInstructionId: phys.activeInstructionId,
          isDumping: phys.isDumping,
          dumpingCanType: phys.dumpingCanType,
          isPicking: phys.isPicking,
          finished: phys.finished,
          hasErrored: false,
        };
      }

      isPausedRef.current = false;
      setCharacterStates(resumedCharacters);
      characterStatesRef.current = resumedCharacters;
      setGameResult(null);
      setShowResultModal(false);
      setIsExecuting(true);
      setLogs(prev => [...prev, `[Sistem] Melanjutkan eksekusi program...`]);
      return;
    }

    // Fresh start from the beginning
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
        isDumping: false,
        dumpingCanType: null,
        isPicking: false,
        backpack: [],
        trailPositions: [{ ...character.startPos }],
        finished: false,
        hasErrored: false,
      };
    }

    isPausedRef.current = false;
    resetPhysicsToStart();
    setCharacterStates(newCharacters);
    characterStatesRef.current = newCharacters;
    const trash = level.trashItems.map(t => ({ ...t, collected: false }));
    setActiveTrash(trash);
    activeTrashRef.current = trash;
    setGameResult(null);
    setShowResultModal(false);
    setIsExecuting(true);

    const totalCmds = Object.values(newCharacters).reduce((s, c) => s + c.compiledSteps.length, 0);
    setLogs([
      `[Sistem] Memulai simulasi...`,
      `[Sistem] Petugas Sampah: ${totalCmds} langkah terkompilasi.`
    ]);
  };

  const handleStopExecution = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    playSound('click');
    isPausedRef.current = true;
    setIsExecuting(false);
    setLogs(prev => [...prev, `[Sistem] Eksekusi dihentikan sementara. Klik Mulai untuk meneruskan.`]);
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    isPausedRef.current = false;
    setIsExecuting(false);

    const resetChars = createInitialCharacterStates();
    resetPhysicsToStart();
    setCharacterStates(resetChars);
    characterStatesRef.current = resetChars;

    const trash = level.trashItems.map(t => ({ ...t, collected: false }));
    setActiveTrash(trash);
    activeTrashRef.current = trash;
    setGameResult(null);
    setShowResultModal(false);
    setLogs([
      `[Sistem] Reset: Simulasi diatur ulang & program dikosongkan.`,
      `[Sistem] Susun program untuk menyusun langkah Petugas Sampah.`
    ]);
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

  // --- Continuous Physics Execution Loop ---
  useEffect(() => {
    if (!isExecuting) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const intervalTime = 20; // 20ms physics tick loop (50 FPS)

    intervalRef.current = setInterval(() => {
      const currentCharacters = { ...characterStatesRef.current };
      const currentTrash = [...activeTrashRef.current];
      const newLogs: string[] = [];
      let allFinished = true;
      let hasError = false;

      // Process physics updates for each character
      for (const characterId of Object.keys(currentCharacters) as CharacterId[]) {
        const character = { ...currentCharacters[characterId] };
        const physics = physicsStateRef.current[characterId];

        if (physics.finished || physics.hasErrored) continue;

        if (physics.playbackIndex >= character.compiledSteps.length) {
          physics.finished = true;
          physics.vx = 0;
          physics.vy = 0;
          physics.isDumping = false;
          physics.dumpingCanType = null;
          physics.isPicking = false;
          character.finished = true;
          character.playbackIndex = physics.playbackIndex;
          character.activeInstructionId = null;
          character.isDumping = false;
          character.dumpingCanType = null;
          character.isPicking = false;
          currentCharacters[characterId] = character;
          continue;
        }

        allFinished = false;
        const step = character.compiledSteps[physics.playbackIndex];
        physics.activeInstructionId = step.instructionId;
        character.activeInstructionId = step.instructionId;

        const characterLabel = getCharacterLabel(characterId);
        const stepNum = physics.playbackIndex + 1;

        // Apply constant gravity
        physics.vy += 0.012;

        // Process instruction state machine
        physics.frameTicks++;

        if (step.action === 'RIGHT') {
          physics.isDumping = false;
          physics.dumpingCanType = null;
          physics.isPicking = false;
          physics.vx = 0.0351;
          character.facingDir = 'RIGHT';
          if (physics.frameTicks >= 28.5) {
            physics.vx = 0;
            physics.frameTicks = 0;
            physics.playbackIndex++;
            newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Melangkah ke kanan.`);
          }
        } else if (step.action === 'LEFT') {
          physics.isDumping = false;
          physics.dumpingCanType = null;
          physics.isPicking = false;
          physics.vx = -0.0351;
          character.facingDir = 'LEFT';
          if (physics.frameTicks >= 28.5) {
            physics.vx = 0;
            physics.frameTicks = 0;
            physics.playbackIndex++;
            newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Melangkah ke kiri.`);
          }
        } else if (step.action === 'UP') {
          physics.isDumping = false;
          physics.dumpingCanType = null;
          physics.isPicking = false;
          if (physics.frameTicks === 1) {
            if (physics.isOnGround) {
              playSound('jump');
              physics.vy = -0.17;
              physics.isOnGround = false;
            }
          }
          physics.vx = character.facingDir === 'RIGHT' ? 0.066 : -0.066;

          if (physics.frameTicks > 5 && physics.isOnGround) {
            physics.vx = 0;
            physics.frameTicks = 0;
            physics.playbackIndex++;
            newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Melompat dan mendarat.`);
          }
        } else if (step.action === 'DOWN') {
          physics.isDumping = false;
          physics.dumpingCanType = null;
          physics.isPicking = false;
          physics.vy += 0.02;
          if (physics.frameTicks >= 10 || physics.isOnGround) {
            physics.frameTicks = 0;
            physics.playbackIndex++;
            newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Turun.`);
          }
        } else if (step.action === 'PICK') {
          physics.isDumping = false;
          physics.dumpingCanType = null;

          // Frame 1: Check if trash is present & capacity is available before playing PICK animation
          if (physics.frameTicks === 1) {
            const targetX = physics.x;
            const targetY = physics.y;
            const foundIdx = currentTrash.findIndex(
              t => Math.abs(t.pos.x - targetX) <= 0.75 && Math.abs(t.pos.y - targetY) <= 0.6 && !t.collected
            );

            if (foundIdx !== -1) {
              const targetTrash = currentTrash[foundIdx];
              if (physics.backpack.length >= level.maxCapacity) {
                playSound('fail');
                physics.isPicking = false;
                physics.hasErrored = true;
                character.hasErrored = true;
                hasError = true;
                newLogs.push(`[Aksi] ${characterLabel} langkah ${stepNum}: Ingin mengambil ${targetTrash.item.name}.`);
                newLogs.push(`[Kesalahan] ${characterLabel} gagal! Tas penuh! Kapasitas maksimal ${level.maxCapacity}.`);
              } else {
                physics.isPicking = true;
              }
            } else {
              physics.isPicking = false;
              newLogs.push(`[Perhatian] ${characterLabel} langkah ${stepNum}: Tidak ada sampah di posisi ini!`);
            }
          }

          // Frame 35 (~0.7s): Mid-animation when character bends down & reaches trash
          if (physics.frameTicks === 35 && physics.isPicking && !physics.hasErrored) {
            const targetX = physics.x;
            const targetY = physics.y;
            const foundIdx = currentTrash.findIndex(
              t => Math.abs(t.pos.x - targetX) <= 0.75 && Math.abs(t.pos.y - targetY) <= 0.6 && !t.collected
            );

            if (foundIdx !== -1) {
              const targetTrash = currentTrash[foundIdx];
              playSound('collect');
              currentTrash[foundIdx] = { ...targetTrash, collected: true };
              physics.backpack = [...physics.backpack, targetTrash.item];
              character.backpack = [...character.backpack, targetTrash.item];
              newLogs.push(`[Aksi] ${characterLabel} langkah ${stepNum}: Mengambil "${targetTrash.item.name}" ${targetTrash.item.emoji}.`);
            }
          }

          const pickDuration = physics.isPicking ? 100 : 15;
          if (physics.frameTicks >= pickDuration || physics.hasErrored) {
            physics.isPicking = false;
            physics.frameTicks = 0;
            physics.playbackIndex++;
          }
        } else if (step.action === 'DROP') {
          physics.isPicking = false;

          // Frame 1: Must carry trash AND stand at matching trash can to trigger DROP animations
          if (physics.frameTicks === 1) {
            const targetX = physics.x;
            const targetY = physics.y;
            const foundCan = level.trashCans.find(
              tc => Math.abs(tc.pos.x - targetX) <= 0.65 && Math.abs(tc.pos.y - targetY) <= 0.8
            );

            if (foundCan) {
              if (physics.backpack.length > 0) {
                const lastPickedItem = physics.backpack[physics.backpack.length - 1];
                if (lastPickedItem.type === foundCan.type) {
                  // Valid dump: character has matching trash in backpack!
                  physics.isDumping = true;
                  physics.dumpingCanType = foundCan.type;
                } else {
                  physics.isDumping = false;
                  physics.dumpingCanType = null;
                  playSound('fail');
                  newLogs.push(`[Aksi Gagal] ${characterLabel} langkah ${stepNum}: Sampah teratas di tas ("${lastPickedItem.name}" ${lastPickedItem.emoji}) tidak cocok dengan Tong ${foundCan.label} ${foundCan.emoji}! (Sampah yang terakhir diambil harus dibuang lebih dulu)`);
                }
              } else {
                // Empty backpack: do NOT trigger character or trash can dump animation!
                physics.isDumping = false;
                physics.dumpingCanType = null;
                playSound('fail');
                newLogs.push(`[Aksi Gagal] ${characterLabel} langkah ${stepNum}: Tas kosong, tidak ada sampah untuk dibuang!`);
              }
            } else {
              physics.isDumping = false;
              physics.dumpingCanType = null;
              playSound('click');
              newLogs.push(`[Perhatian] ${characterLabel} langkah ${stepNum}: Membuang sampah di tanah kosong!`);
            }
          }

          // Frame 35 (~0.7s): Mid-animation when character drops item into container
          if (physics.frameTicks === 35 && physics.isDumping && !physics.hasErrored) {
            const targetX = physics.x;
            const targetY = physics.y;
            const foundCan = level.trashCans.find(
              tc => Math.abs(tc.pos.x - targetX) <= 0.65 && Math.abs(tc.pos.y - targetY) <= 0.8
            );

            if (foundCan && physics.backpack.length > 0) {
              const lastPickedItem = physics.backpack[physics.backpack.length - 1];
              if (lastPickedItem.type === foundCan.type) {
                playSound('dump');
                const updatedBackpack = [...physics.backpack];
                const droppedItem = updatedBackpack.pop();
                physics.backpack = updatedBackpack;
                character.backpack = updatedBackpack;
                newLogs.push(`[Pilah Sukses] ${characterLabel} langkah ${stepNum}: Membuang "${droppedItem.name}" ${droppedItem.emoji} (Sampah teratas tas / terakhir diambil) ke Tong ${foundCan.label} ${foundCan.emoji}!`);
              }
            }
          }

          // Only wait full 100 ticks (2.0s) if actually dumping trash; otherwise finish quickly without buggy animation
          const dropDuration = physics.isDumping ? 100 : 15;
          if (physics.frameTicks >= dropDuration || physics.hasErrored) {
            physics.isDumping = false;
            physics.dumpingCanType = null;
            physics.frameTicks = 0;
            physics.playbackIndex++;
          }
        }

        // Apply velocities
        physics.x += physics.vx;
        physics.y += physics.vy;

        // Apply boundaries
        if (physics.x < 0) { physics.x = 0; physics.vx = 0; }
        if (physics.x > 15) { physics.x = 15; physics.vx = 0; }

        // Floor boundary collision
        if (physics.y >= 3.0) {
          physics.y = 3.0;
          physics.vy = 0;
          physics.isOnGround = true;
        }

        // Obstacles collision detection
        level.obstacles.forEach(obs => {
          const ox = obs.pos.x;
          const oy = obs.pos.y;
          const obstacleTopY = oy - 0.8;

          const isHorizontalOverlap = physics.x >= ox - 0.45 && physics.x <= ox + 0.45;
          if (isHorizontalOverlap) {
            if (physics.vy >= 0 && physics.y >= obstacleTopY && physics.y - physics.vy <= obstacleTopY + 0.15) {
              physics.y = obstacleTopY;
              physics.vy = 0;
              physics.isOnGround = true;
            } else if (physics.y > obstacleTopY + 0.05) {
              if (physics.vx > 0 && physics.x > ox - 0.45) {
                physics.x = ox - 0.45;
                physics.vx = 0;
              } else if (physics.vx < 0 && physics.x < ox + 0.45) {
                physics.x = ox + 0.45;
                physics.vx = 0;
              }
            }
          }
        });

        // Sync coordinates & animation flags back to character state
        character.pos = { x: parseFloat(physics.x.toFixed(3)), y: parseFloat(physics.y.toFixed(3)) };
        character.playbackIndex = physics.playbackIndex;
        character.isDumping = physics.isDumping;
        character.dumpingCanType = physics.dumpingCanType;
        character.isPicking = physics.isPicking;

        // Add trail position if moved significantly
        const lastTrail = character.trailPositions[character.trailPositions.length - 1];
        if (!lastTrail || Math.abs(lastTrail.x - character.pos.x) > 0.3 || Math.abs(lastTrail.y - character.pos.y) > 0.3) {
          character.trailPositions = [...character.trailPositions, { ...character.pos }];
        }

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
        isPausedRef.current = false;
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
