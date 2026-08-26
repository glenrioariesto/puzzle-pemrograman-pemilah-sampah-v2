/**
 * Audio Manager for Puzzle Pemrograman Pemilah Sampah
 * Menggunakan audio organik (akustik / kartun ramah anak), bukan synthesizer robotik.
 * 
 * BGM: "Carefree" by Kevin MacLeod (Ukulele, Marimba, Gitar Akustik, Glockenspiel & Perkusi)
 * SFX: UI SFX Organic & Rubber (Wood, water, stones, gentle rebound) - CC0 1.0 Universal
 */

import bgmUrl from '../../assets/audio/bgm.mp3';
import clickUrl from '../../assets/audio/click.mp3';
import jumpUrl from '../../assets/audio/jump.mp3';
import collectUrl from '../../assets/audio/collect.mp3';
import dumpUrl from '../../assets/audio/dump.mp3';
import successUrl from '../../assets/audio/success.mp3';
import failUrl from '../../assets/audio/fail.mp3';
import crashUrl from '../../assets/audio/crash.mp3';

export type SoundType = 'click' | 'jump' | 'collect' | 'success' | 'fail' | 'dump' | 'crash';

// Singleton BGM instance
let bgmAudio: HTMLAudioElement | null = null;
let isGloballyMuted = false;
let userHasInteracted = false;
const DEFAULT_BGM_VOLUME = 0.09;

const SFX_URLS: Record<SoundType, string> = {
  click: clickUrl,
  jump: jumpUrl,
  collect: collectUrl,
  dump: dumpUrl,
  success: successUrl,
  fail: failUrl,
  crash: crashUrl
};

const SFX_VOLUMES: Record<SoundType, number> = {
  click: 0.5,
  jump: 0.8,
  collect: 0.95, // Pop ambil sampah renyah, jelas & memuaskan
  dump: 0.85,
  success: 0.9,
  fail: 0.75,
  crash: 0.8
};

// SFX cache for fast, responsive playback
const sfxPool: Record<SoundType, HTMLAudioElement[]> = {
  click: [],
  jump: [],
  collect: [],
  dump: [],
  success: [],
  fail: [],
  crash: []
};

function getOrCreateSfx(type: SoundType): HTMLAudioElement {
  const pool = sfxPool[type];
  // Check for an idle audio element
  for (const audio of pool) {
    if (audio.paused || audio.ended) {
      audio.currentTime = 0;
      return audio;
    }
  }
  // Create a new one if pool limit not reached
  if (pool.length < 5) {
    const newAudio = new Audio(SFX_URLS[type]);
    newAudio.volume = SFX_VOLUMES[type];
    pool.push(newAudio);
    return newAudio;
  }
  // Reuse the first element
  const audio = pool[0];
  audio.currentTime = 0;
  return audio;
}

/**
 * Preload all SFX audio buffers for instantaneous playback
 */
export function preloadAudio() {
  if (typeof window === 'undefined') return;
  Object.keys(SFX_URLS).forEach(key => {
    const type = key as SoundType;
    if (sfxPool[type].length === 0) {
      const audio = new Audio(SFX_URLS[type]);
      audio.preload = 'auto';
      audio.volume = SFX_VOLUMES[type];
      sfxPool[type].push(audio);
    }
  });
}

/**
 * Get or initialize the background music element
 */
function getBgmAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!bgmAudio) {
    bgmAudio = new Audio(bgmUrl);
    bgmAudio.loop = true;
    bgmAudio.volume = DEFAULT_BGM_VOLUME;
    bgmAudio.preload = 'auto';
  }
  return bgmAudio;
}

/**
 * Play a specific organic sound effect
 */
export function playSfx(type: SoundType, mutedOverride?: boolean) {
  const muted = mutedOverride !== undefined ? mutedOverride : isGloballyMuted;
  if (muted || typeof window === 'undefined') return;

  try {
    const audio = getOrCreateSfx(type);
    audio.volume = SFX_VOLUMES[type];
    audio.play().catch(() => {
      // Audio playback might be restricted until user interacts
    });
  } catch (err) {
    console.warn('[Audio] Failed to play SFX:', type, err);
  }
}

/**
 * Start playing the cheerful background music
 */
export function startBgm() {
  if (typeof window === 'undefined' || isGloballyMuted) return;
  const audio = getBgmAudio();
  if (audio && audio.paused) {
    audio.play().catch(() => {
      // Browser autoplay policy might block this until user interacts
    });
  }
}

/**
 * Stop / pause the background music
 */
export function stopBgm() {
  if (bgmAudio) {
    bgmAudio.pause();
  }
}

/**
 * Sync audio manager mute state with application state
 */
export function syncBgmState(isMuted: boolean) {
  isGloballyMuted = isMuted;
  if (isMuted) {
    stopBgm();
  } else {
    if (userHasInteracted) {
      startBgm();
    }
  }
}

/**
 * Listen for the first user interaction to unlock browser autoplay policy smoothly
 */
export function initUserInteractionListener() {
  if (typeof window === 'undefined') return;

  preloadAudio();

  const handleFirstInteraction = () => {
    userHasInteracted = true;
    if (!isGloballyMuted) {
      startBgm();
    }
    window.removeEventListener('click', handleFirstInteraction);
    window.removeEventListener('touchstart', handleFirstInteraction);
    window.removeEventListener('keydown', handleFirstInteraction);
  };

  window.addEventListener('click', handleFirstInteraction, { passive: true });
  window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
  window.addEventListener('keydown', handleFirstInteraction, { passive: true });
}
