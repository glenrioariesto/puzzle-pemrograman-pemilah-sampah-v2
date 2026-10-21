/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Centralized Asset Preloader — downloads and decodes all images, SVGs, fonts,
 * and RGBA WebP animation sprite sheets into GPU memory on initial app load so
 * there is zero black flash, zero Safari WebM alpha issue, and zero buffering delay.
 */

// Background & Branding Assets
import logoPusbuk from '../../assets/logo-jenama.webp';
import bgBackground from '../../assets/background.webp';
import bgArenaGame from '../../assets/bg-arena-game.webp';
import imgTitleTop from '../../assets/title-top.webp';
import imgTitleBottom from '../../assets/title-bottom.webp';
import imgButtonMulai from '../../assets/button-mulai.webp';
import bgGrid from '../../assets/bg-grid-v2.svg';

// Tutorial / Cara Main Slides
import slide1 from '../../assets/slide1-cara-main.webp';
import slide2 from '../../assets/slide2-cara-main.webp';
import slide3 from '../../assets/slide3-cara-main.webp';
import slide4 from '../../assets/slide4-cara-main.webp';

// Trash Cans & Hover Cards
import tongOrganik from '../../assets/Wadah Sampah Hijau.webp';
import tongAnorganik from '../../assets/Wadah Sampah Kuning.webp';
import tongB3 from '../../assets/Wadah Sampah Merah.webp';
import canOrganikHover from '../../assets/organic-hover.webp';
import canAnorganikHover from '../../assets/anorganik-hover.webp';
import canB3Hover from '../../assets/b3-hover.webp';

// RGBA WebP Animation Sprite Sheets (100% Safari, iOS, Chrome, Firefox compatible with true alpha)
import canOrganikSheet from '../../assets/wadah_sampah_hijau_sheet.webp';
import canAnorganikSheet from '../../assets/wadah_sampah_kuning_sheet.webp';
import canB3Sheet from '../../assets/wadah_sampah_merah_sheet.webp';
import charWalkSheet from '../../assets/char_organik_walk_sheet.webp';
import charPickSheet from '../../assets/char_organik_pick_sheet.webp';
import charDropSheet from '../../assets/char_organik_buang_sheet.webp';

// Trash Items
import webpApel from '../../assets/apel.webp';
import svgBaterai from '../../assets/baterai.svg';
import svgBotolAir from '../../assets/botol-air.svg';
import svgKalengBesi from '../../assets/kaleng-besi.svg';
import webpKalengMinuman from '../../assets/kaleng-minuman.webp';
import svgKertasKoran from '../../assets/kertas-koran.svg';
import svgKulitPisang from '../../assets/kulit-pisang.svg';
import svgLampu from '../../assets/lampu.svg';
import svgSayur from '../../assets/sayur.svg';

// Rock Wall Obstacles
import rock1 from '../../assets/rock-1.webp';
import rock2 from '../../assets/rock-2.webp';
import rock3 from '../../assets/rock-3.webp';
import rock4 from '../../assets/rock-4.webp';
import rock5 from '../../assets/rock-5.webp';
import rock6 from '../../assets/rock-6.webp';
import rock7 from '../../assets/rock-7.webp';
import rock8 from '../../assets/rock-8.webp';
import rock9 from '../../assets/rock-9.webp';

// Character & Command Button SVGs
import charOrganik from '../../assets/hijau-angkat.svg';
import charAnorganik from '../../assets/kuning-angkat.svg';
import charB3 from '../../assets/merah-angkat.svg';
import imgAtas from '../../assets/tombol-atas.svg';
import imgKiri from '../../assets/tombol-kiri.svg';
import imgKanan from '../../assets/tombol-kanan.svg';
import imgAmbil from '../../assets/tombol-ambil.svg';
import imgBuang from '../../assets/tombol-buang.svg';
import imgReset from '../../assets/tombol-reset.svg';
import imgMulaiBaru from '../../assets/tombolmulaibaru.svg';
import imgStopBaru from '../../assets/tombolstopbaru.svg';

// Global in-memory cache for instant access by GridMap & UI components
export const PRELOADED_IMAGES: Record<string, HTMLImageElement> = {};

export interface SpriteSheetSpec {
  key: string;
  frameWidth: number;
  frameHeight: number;
  cols: number;
  totalFrames: number;
  fps: number;
  loop: boolean;
}

export const SPRITE_SHEET_SPECS: Record<string, SpriteSheetSpec> = {
  canORGANIC_sheet: {
    key: 'canORGANIC_sheet',
    frameWidth: 181,
    frameHeight: 295,
    cols: 10,
    totalFrames: 60,
    fps: 30,
    loop: false,
  },
  canRECYCLABLE_sheet: {
    key: 'canRECYCLABLE_sheet',
    frameWidth: 181,
    frameHeight: 295,
    cols: 10,
    totalFrames: 60,
    fps: 30,
    loop: false,
  },
  canB3_sheet: {
    key: 'canB3_sheet',
    frameWidth: 181,
    frameHeight: 295,
    cols: 10,
    totalFrames: 60,
    fps: 30,
    loop: false,
  },
  char_walk_sheet: {
    key: 'char_walk_sheet',
    frameWidth: 319,
    frameHeight: 439,
    cols: 9,
    totalFrames: 36,
    fps: 12,
    loop: true,
  },
  char_pick_sheet: {
    key: 'char_pick_sheet',
    frameWidth: 301,
    frameHeight: 455,
    cols: 9,
    totalFrames: 36,
    fps: 12,
    loop: false,
  },
  char_drop_sheet: {
    key: 'char_drop_sheet',
    frameWidth: 410,
    frameHeight: 606,
    cols: 6,
    totalFrames: 18,
    fps: 24,
    loop: false,
  },
};

export const GRID_IMAGE_SOURCES: Record<string, string> = {
  ORGANIC_can: tongOrganik,
  RECYCLABLE_can: tongAnorganik,
  B3_can: tongB3,
  ORGANIC_can_hover: canOrganikHover,
  RECYCLABLE_can_hover: canAnorganikHover,
  B3_can_hover: canB3Hover,

  canORGANIC_sheet: canOrganikSheet,
  canRECYCLABLE_sheet: canAnorganikSheet,
  canB3_sheet: canB3Sheet,
  char_walk_sheet: charWalkSheet,
  char_pick_sheet: charPickSheet,
  char_drop_sheet: charDropSheet,

  banana: svgKulitPisang,
  sayur: svgSayur,
  apple: webpApel,
  can: webpKalengMinuman,
  botolAir: svgBotolAir,
  kertasKoran: svgKertasKoran,
  battery: svgBaterai,
  kalengBesi: svgKalengBesi,
  bulb: svgLampu,
  bgGrid: bgGrid,

  rock_1: rock1,
  rock_2: rock2,
  rock_3: rock3,
  rock_4: rock4,
  rock_5: rock5,
  rock_6: rock6,
  rock_7: rock7,
  rock_8: rock8,
  rock_9: rock9,
};

const EXTRA_UI_IMAGES: Record<string, string> = {
  logoPusbuk,
  bgBackground,
  bgArenaGame,
  imgTitleTop,
  imgTitleBottom,
  imgButtonMulai,
  slide1,
  slide2,
  slide3,
  slide4,
  charOrganik,
  charAnorganik,
  charB3,
  imgAtas,
  imgKiri,
  imgKanan,
  imgAmbil,
  imgBuang,
  imgReset,
  imgMulaiBaru,
  imgStopBaru,
};

let preloadPromise: Promise<void> | null = null;

function preloadSingleImage(key: string, src: string): Promise<void> {
  return new Promise((resolve) => {
    if (PRELOADED_IMAGES[key]) {
      resolve();
      return;
    }

    const timeout = setTimeout(() => resolve(), 10000);
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      PRELOADED_IMAGES[key] = img;
      PRELOADED_IMAGES[src] = img;
      if (typeof img.decode === 'function') {
        img.decode().catch(() => {}).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      } else {
        clearTimeout(timeout);
        resolve();
      }
    };
    img.onerror = () => {
      clearTimeout(timeout);
      resolve();
    };
    img.src = src;
  });
}

export function preloadAllGameAssets(onProgress?: (percent: number) => void): Promise<void> {
  if (preloadPromise) {
    onProgress?.(100);
    return preloadPromise;
  }

  preloadPromise = (async () => {
    const imageEntries = [
      ...Object.entries(GRID_IMAGE_SOURCES),
      ...Object.entries(EXTRA_UI_IMAGES),
    ];

    const totalTasks = imageEntries.length + 1; // +1 for fonts
    let completedTasks = 0;

    const report = () => {
      completedTasks++;
      const pct = Math.min(100, Math.round((completedTasks / totalTasks) * 100));
      onProgress?.(pct);
    };

    const allTasks: Promise<void>[] = [
      ...imageEntries.map(([key, src]) => preloadSingleImage(key, src).then(report)),
      (typeof document !== 'undefined' && document.fonts ? document.fonts.ready : Promise.resolve())
        .catch(() => {})
        .then(() => report()),
    ];

    await Promise.all(allTasks);
    onProgress?.(100);
  })();

  return preloadPromise;
}
