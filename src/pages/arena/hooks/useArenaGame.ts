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
    backpack: any[];
    finished: boolean;
    hasErrored: boolean;
  }>>({
    ORGANIC: { x: 0, y: 3, vx: 0, vy: 0, isOnGround: true, frameTicks: 0, playbackIndex: 0, activeInstructionId: null, backpack: [], finished: false, hasErrored: false },
    RECYCLABLE: { x: 0, y: 3, vx: 0, vy: 0, isOnGround: true, frameTicks: 0, playbackIndex: 0, activeInstructionId: null, backpack: [], finished: false, hasErrored: false },
    B3: { x: 0, y: 3, vx: 0, vy: 0, isOnGround: true, frameTicks: 0, playbackIndex: 0, activeInstructionId: null, backpack: [], finished: false, hasErrored: false }
  });

  // Initialize level upon load
  const getCharacterLabel = (id: CharacterId) => {
    return 'Tukang Sampah';
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
      `[Sistem] Tukang Sampah siap! 🤖`,
      `[Sistem] Susun program untuk mengendalikan Tukang Sampah.`
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
    if (!hasProgram) {
      playSound('fail');
      setLogs([`[Peringatan] Program masih kosong! Tambahkan blok perintah terlebih dahulu.`]);
      return;
    }
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

      // Initialize physics values
      physicsStateRef.current[character.id] = {
        x: character.startPos.x,
        y: character.startPos.y,
        vx: 0,
        vy: 0,
        isOnGround: true,
        frameTicks: 0,
        playbackIndex: 0,
        activeInstructionId: null,
        backpack: [],
        finished: false,
        hasErrored: false
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
      `[Sistem] Tukang Sampah: ${totalCmds} langkah terkompilasi.`
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

        // Reset physics variables
        physicsStateRef.current[character.id] = {
          x: character.startPos.x,
          y: character.startPos.y,
          vx: 0,
          vy: 0,
          isOnGround: true,
          frameTicks: 0,
          playbackIndex: 0,
          activeInstructionId: null,
          backpack: [],
          finished: false,
          hasErrored: false
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
      `[Sistem] Susun program untuk menyusun langkah Tukang Sampah.`
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
          character.finished = true;
          character.playbackIndex = physics.playbackIndex;
          character.activeInstructionId = null;
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
        physics.vy += 0.012; // Gravity pull

        // Process instruction state machine
        physics.frameTicks++;

        if (step.action === 'RIGHT') {
          physics.vx = 0.035;
          character.facingDir = 'RIGHT';
          // At 50 FPS, 30 ticks takes 600ms, moving 30 * 0.035 = 1.05 cells.
          if (physics.frameTicks >= 30) {
            physics.vx = 0;
            physics.frameTicks = 0;
            physics.playbackIndex++;
            newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Melangkah ke kanan.`);
          }
        } else if (step.action === 'LEFT') {
          physics.vx = -0.035;
          character.facingDir = 'LEFT';
          if (physics.frameTicks >= 30) {
            physics.vx = 0;
            physics.frameTicks = 0;
            physics.playbackIndex++;
            newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Melangkah ke kiri.`);
          }
        } else if (step.action === 'UP') { // Loncat / Jump forward in the facing direction
          // On start of jump, trigger vertical velocity
          if (physics.frameTicks === 1) {
            if (physics.isOnGround) {
              playSound('jump');
              physics.vy = -0.17; // Jump up force
              physics.isOnGround = false;
            }
          }
          // Move forward while jumping based on facing direction
          physics.vx = character.facingDir === 'RIGHT' ? 0.065 : -0.065;

          // Jump finishes only when landing back on ground
          if (physics.frameTicks > 5 && physics.isOnGround) {
            physics.vx = 0;
            physics.frameTicks = 0;
            physics.playbackIndex++;
            newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Melompat dan mendarat.`);
          }
        } else if (step.action === 'DOWN') { // Down/descend (optional fast drop)
          physics.vy += 0.02; // fast fall
          if (physics.frameTicks >= 10 || physics.isOnGround) {
            physics.frameTicks = 0;
            physics.playbackIndex++;
            newLogs.push(`[Gerakan] ${characterLabel} langkah ${stepNum}: Turun.`);
          }
        } else if (step.action === 'PICK') {
          if (physics.frameTicks === 1) {
            // Immediately check if near any uncollected trash at the start of pick step
            const targetX = physics.x;
            const targetY = physics.y;
            const foundIdx = currentTrash.findIndex(
              t => Math.abs(t.pos.x - targetX) <= 1.2 && Math.abs(t.pos.y - targetY) <= 0.6 && !t.collected
            );

            if (foundIdx !== -1) {
              const targetTrash = currentTrash[foundIdx];
              if (physics.backpack.length >= level.maxCapacity) {
                playSound('fail');
                physics.hasErrored = true;
                character.hasErrored = true;
                hasError = true;
                newLogs.push(`[Aksi] ${characterLabel} langkah ${stepNum}: Ingin mengambil ${targetTrash.item.name}.`);
                newLogs.push(`[Kesalahan] ${characterLabel} gagal! Tas penuh! Kapasitas maksimal ${level.maxCapacity}.`);
              } else {
                playSound('collect');
                currentTrash[foundIdx] = { ...targetTrash, collected: true };
                physics.backpack = [...physics.backpack, targetTrash.item];
                character.backpack = [...character.backpack, targetTrash.item];
                newLogs.push(`[Aksi] ${characterLabel} langkah ${stepNum}: Mengambil "${targetTrash.item.name}" ${targetTrash.item.emoji}.`);
              }
            } else {
              newLogs.push(`[Perhatian] ${characterLabel} langkah ${stepNum}: Tidak ada sampah di dekat karakter!`);
            }
          }

          // PICK animation delay (70 ticks @ 20ms = 1.4s)
          if (physics.frameTicks >= 70 || physics.hasErrored) {
            physics.frameTicks = 0;
            physics.playbackIndex++;
          }
        } else if (step.action === 'DROP') {
          if (physics.frameTicks === 1) {
            const targetX = physics.x;
            const targetY = physics.y;
            // Find if there is a trash can nearby
            const foundCan = level.trashCans.find(
              tc => Math.abs(tc.pos.x - targetX) <= 1.2 && Math.abs(tc.pos.y - targetY) <= 0.8
            );

            if (foundCan) {
              const matchingItems = physics.backpack.filter(item => item.type === foundCan.type);
              if (matchingItems.length > 0) {
                playSound('dump');
                physics.backpack = physics.backpack.filter(item => item.type !== foundCan.type);
                character.backpack = physics.backpack;
                newLogs.push(`[Pilah Sukses] ${characterLabel} langkah ${stepNum}: ${matchingItems.length} sampah ${foundCan.label} dibuang ke tong ${foundCan.emoji}!`);
              } else {
                playSound('fail');
                newLogs.push(`[Aksi] ${characterLabel} langkah ${stepNum}: Di dekat Tong ${foundCan.label} ${foundCan.emoji} tapi tidak membawa sampah jenis ini!`);
              }
            } else {
              playSound('click');
              newLogs.push(`[Perhatian] ${characterLabel} langkah ${stepNum}: Membuang sampah di tanah kosong!`);
            }
          }

          // DROP animation delay (50 ticks @ 20ms = 1.0s)
          if (physics.frameTicks >= 50) {
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
          const oy = obs.pos.y; // bottom floor obstacle has y=3, so top of obstacle is y=2.2 (height is ~0.8)
          const obstacleTopY = oy - 0.8; // top surface of obstacle

          // Check if character's feet land on top of the obstacle
          // Horizontal range of obstacle: [ox - 0.45, ox + 0.45]
          const isHorizontalOverlap = physics.x >= ox - 0.45 && physics.x <= ox + 0.45;
          if (isHorizontalOverlap) {
            // Landing detection: if character's feet are falling through the top of the obstacle
            if (physics.vy >= 0 && physics.y >= obstacleTopY && physics.y - physics.vy <= obstacleTopY + 0.15) {
              physics.y = obstacleTopY;
              physics.vy = 0;
              physics.isOnGround = true;
            }
            // Side collision: if feet are below the top of the obstacle, they run into the side!
            else if (physics.y > obstacleTopY + 0.05) {
              // Block walking into it
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

        // Sync coordinates back to character state
        character.pos = { x: parseFloat(physics.x.toFixed(3)), y: parseFloat(physics.y.toFixed(3)) };
        character.playbackIndex = physics.playbackIndex;
        
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
