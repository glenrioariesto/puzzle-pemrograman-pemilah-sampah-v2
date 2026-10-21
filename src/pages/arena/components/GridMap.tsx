/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Canvas-based grid renderer — multi-character version.
 * Supports zoom (scroll wheel), pan (drag), responsive sizing,
 * and renders all game elements (obstacles, trash, trash cans, 3 characters, trails)
 * with high performance for grids of any size.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Backpack, HelpCircle, Volume2, VolumeX, ArrowLeft, Info, X } from 'lucide-react';
import { GridPos, TrashOnGrid, TrashCanOnGrid, ObstacleOnGrid, TrashItem, CharacterId, CommandAction, TrashType } from '../../../types';
import { PRELOADED_IMAGES, GRID_IMAGE_SOURCES, SPRITE_SHEET_SPECS, SpriteSheetSpec } from '../../../utils/assetPreloader';

import tongOrganik from '../../../../assets/Wadah Sampah Hijau.webp';
import tongAnorganik from '../../../../assets/Wadah Sampah Kuning.webp';
import tongB3 from '../../../../assets/Wadah Sampah Merah.webp';

// Hover WebP assets for trash cans
import canOrganikHover from '../../../../assets/organic-hover.webp';
import canAnorganikHover from '../../../../assets/anorganik-hover.webp';
import canB3Hover from '../../../../assets/b3-hover.webp';

// Import trash item SVG assets
import webpApel from '../../../../assets/apel.webp';
import svgBaterai from '../../../../assets/baterai.svg';
import svgBotolAir from '../../../../assets/botol-air.svg';
import svgKalengBesi from '../../../../assets/kaleng-besi.svg';
import webpKalengMinuman from '../../../../assets/kaleng-minuman.webp';
import svgKertasKoran from '../../../../assets/kertas-koran.svg';
import svgKulitPisang from '../../../../assets/kulit-pisang.svg';
import svgLampu from '../../../../assets/lampu.svg';
import svgSayur from '../../../../assets/sayur.svg';
import bgGrid from '../../../../assets/bg-grid-v2.svg';

// Import rock wall grid assets (rock-1.webp to rock-9.webp)
import rock1 from '../../../../assets/rock-1.webp';
import rock2 from '../../../../assets/rock-2.webp';
import rock3 from '../../../../assets/rock-3.webp';
import rock4 from '../../../../assets/rock-4.webp';
import rock5 from '../../../../assets/rock-5.webp';
import rock6 from '../../../../assets/rock-6.webp';
import rock7 from '../../../../assets/rock-7.webp';
import rock8 from '../../../../assets/rock-8.webp';
import rock9 from '../../../../assets/rock-9.webp';

export interface CharacterRenderData {
  id: CharacterId;
  pos: GridPos;
  facingDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  trailPositions: GridPos[];
  backpack: TrashItem[];
  backpackCapacity: number;
  activeAction?: CommandAction | null;
  activeInstructionId?: string | null;
  isDumping?: boolean;
  dumpingCanType?: TrashType | null;
  isPicking?: boolean;
}

export interface ElementSetting {
  yOffset: number;   // Multiplier for vertical positioning relative to cell size
  xOffset?: number;  // Multiplier for horizontal positioning relative to cell size
  sizeScale: number; // Multiplier for size relative to cell size
  sizeScaleH?: number; // Optional height multiplier (for characters)
  sizeScaleW?: number; // Optional width multiplier (for characters)
}

// Per-asset default configurations (Y-offset & Size scale for EVERY specific asset item)
export const DEFAULT_ELEMENT_CONFIGS: {
  // Category defaults
  defaultCategory: {
    character: ElementSetting;
    trash: ElementSetting;
    trashCan: ElementSetting;
    obstacle: ElementSetting;
  };
  // Per-Character settings
  characters: Record<string, Partial<ElementSetting>>;
  // Per-Trash Item settings (by item.id: banana, sayur, apple, can, botolAir, kertasKoran, battery, kalengBesi, bulb)
  trashItems: Record<string, Partial<ElementSetting>>;
  // Per-Trash Can settings (by type: ORGANIC, RECYCLABLE, B3, RESIDUE)
  trashCans: Record<string, Partial<ElementSetting>>;
  // Per-Obstacle settings (by type: rock, bush, wall, water)
  obstacles: Record<string, Partial<ElementSetting>>;
  // Per-Rock Tile asset settings (by asset key: rock_1 to rock_9)
  rockTiles: Record<string, Partial<ElementSetting>>;
} = {
  defaultCategory: {
    character: { yOffset: 0.36, sizeScale: 1.0, sizeScaleW: 1.50, sizeScaleH: 3.00 },
    trash:     { yOffset: 0.67, sizeScale: 0.70 },
    trashCan:  { yOffset: 0.43, sizeScale: 1.08 },
    obstacle:  { yOffset: 0.50, xOffset: 0, sizeScale: 1.20 },
  },

  // Specific settings per character ID
  characters: {
    ORGANIC:    { yOffset: 0.36, sizeScaleW: 1.50, sizeScaleH: 3.00 },
    RECYCLABLE: { yOffset: 0.36, sizeScaleW: 1.50, sizeScaleH: 3.00 },
    B3:         { yOffset: 0.36, sizeScaleW: 1.50, sizeScaleH: 3.00 },
  },

  // Specific settings per trash item ID
  trashItems: {
    apple:     { yOffset: 0.67, sizeScale: 0.70 },
    banana:    { yOffset: 0.67, sizeScale: 0.70 },
    sayur:     { yOffset: 0.67, sizeScale: 0.70 },
    can:       { yOffset: 0.67, sizeScale: 0.70 },
    botolAir:  { yOffset: 0.67, sizeScale: 0.70 },
    kertasKoran: { yOffset: 0.67, sizeScale: 0.70 },
    battery:   { yOffset: 0.67, sizeScale: 0.70 },
    kalengBesi: { yOffset: 0.67, sizeScale: 0.70 },
    bulb:      { yOffset: 0.67, sizeScale: 0.70 },
  },

  // Specific settings per trash can type
  trashCans: {
    ORGANIC:    { yOffset: 0.43, sizeScale: 1.08 },
    RECYCLABLE: { yOffset: 0.43, sizeScale: 1.08 },
    B3:         { yOffset: 0.43, sizeScale: 1.08 },
    RESIDUE:    { yOffset: 0.43, sizeScale: 1.08 },
  },

  // Specific settings per obstacle type
  obstacles: {
    rock:  { yOffset: 0.50, xOffset: 0, sizeScale: 1.20 },
    bush:  { yOffset: 0.50, xOffset: 0, sizeScale: 0.90 },
    wall:  { yOffset: 0.50, xOffset: 0, sizeScale: 1.25 },
    water: { yOffset: 0.50, xOffset: 0, sizeScale: 0.90 },
  },

  // Custom position offsets (yOffset, xOffset) and enlarged sizeScale for rock assets rock-1 to rock-9
  rockTiles: {
    rock_1: { yOffset: 0.50, xOffset: 0, sizeScale: 1.20 },
    rock_2: { yOffset: 0.50, xOffset: 0, sizeScale: 1.20 },
    rock_3: { yOffset: 0.55, xOffset: 0, sizeScale: 1.20 },
    rock_4: { yOffset: 0.60 , xOffset: 0, sizeScale: 1.20 },
    rock_5: { yOffset: 0.50, xOffset: 0, sizeScale: 1.25 },
    rock_6: { yOffset: 0.50, xOffset: 0, sizeScale: 1.20 },
    rock_7: { yOffset: 0.50, xOffset: 0, sizeScale: 1.20 },
    rock_8: { yOffset: 0.50, xOffset: 0, sizeScale: 1.20 },
    rock_9: { yOffset: 0.50, xOffset: 0, sizeScale: 1.20 },
  },
};

// Legacy backward compatibility export
export const DEFAULT_ELEMENT_OFFSETS = {
  character: DEFAULT_ELEMENT_CONFIGS.defaultCategory.character.yOffset,
  trash: DEFAULT_ELEMENT_CONFIGS.defaultCategory.trash.yOffset,
  trashCan: DEFAULT_ELEMENT_CONFIGS.defaultCategory.trashCan.yOffset,
  obstacle: DEFAULT_ELEMENT_CONFIGS.defaultCategory.obstacle.yOffset,
  characterScaleW: DEFAULT_ELEMENT_CONFIGS.defaultCategory.character.sizeScaleW!,
  characterScaleH: DEFAULT_ELEMENT_CONFIGS.defaultCategory.character.sizeScaleH!,
  trashSizeScale: DEFAULT_ELEMENT_CONFIGS.defaultCategory.trash.sizeScale,
  trashCanSizeScale: DEFAULT_ELEMENT_CONFIGS.defaultCategory.trashCan.sizeScale,
  obstacleSizeScale: DEFAULT_ELEMENT_CONFIGS.defaultCategory.obstacle.sizeScale,
};

interface GridMapProps {
  width: number;
  height: number;
  characters: CharacterRenderData[];
  trashItems: TrashOnGrid[];
  trashCans: TrashCanOnGrid[];
  obstacles: ObstacleOnGrid[];
  isExecuting: boolean;
  onShowHints?: () => void;
  customOffsets?: Partial<typeof DEFAULT_ELEMENT_OFFSETS>;
  levelId?: number;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onBackToDashboard?: () => void;
}

// Hover tooltip image mapping
const TRASH_CAN_HOVER_IMAGES: Record<TrashType, string> = {
  ORGANIC: canOrganikHover,
  RECYCLABLE: canAnorganikHover,
  B3: canB3Hover,
  RESIDUE: canAnorganikHover,
};

const TRASH_CAN_INFO: Record<TrashType, { label: string; name: string; color: string }> = {
  ORGANIC: { label: 'Tong Hijau', name: 'Organik', color: '#16A34A' },
  RECYCLABLE: { label: 'Tong Kuning', name: 'Daur Ulang', color: '#CA8A04' },
  B3: { label: 'Tong Merah', name: 'B3', color: '#DC2626' },
  RESIDUE: { label: 'Tong Abu-abu', name: 'Residu', color: '#4B5563' },
};

const CHARACTER_COLORS: Record<CharacterId, { bg: string; border: string; eye: string; label: string }> = {
  ORGANIC: {
    bg: '#10B981', // emerald-500
    border: '#047857', // emerald-700
    eye: '#ffffff',
    label: 'Petugas Sampah',
  },
  RECYCLABLE: {
    bg: '#F59E0B', // amber-500
    border: '#B45309', // amber-700
    eye: '#ffffff',
    label: 'Daur Ulang',
  },
  B3: {
    bg: '#EF4444', // red-500
    border: '#B91C1C', // red-700
    eye: '#ffffff',
    label: 'B3',
  },
};

const COLORS = {
  gridBg: '#FAF5EF',
  cellBg: '#ffffff',
  cellBorder: '#EED4B7',
  cellActive: '#FEF3C7', // light amber
  cellActiveBorder: '#F59E0B',
  cellCan: '#ECFDF5', // light emerald (fallback)
  cellObstacle: '#F5F5F4', // light stone
  obstacleText: '#78716C',
  canLabelBg: '#ffffff',
  canLabelBorder: '#EED4B7',
  canLabelText: '#78350F',
};

// Per-type trash/can cell colors (shared for both trash items and trash cans)
const TRASH_TYPE_COLORS: Record<string, { bg: string; border: string; coord: string }> = {
  ORGANIC:    { bg: '#86EFAC', border: '#16A34A', coord: 'rgba(22,101,52,0.65)'   }, // bright green
  RECYCLABLE: { bg: '#FEF9C3', border: '#FACC15', coord: 'rgba(113,63,18,0.50)'  }, // yellow
  B3:         { bg: '#FCA5A5', border: '#DC2626', coord: 'rgba(153,27,27,0.65)'   }, // bright red
  RESIDUE:    { bg: '#F3F4F6', border: '#9CA3AF', coord: 'rgba(75,85,99,0.50)'    }, // grey
};

// Canvas Rounded Rect Helper
function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Draw image with object-fit: contain (centered, aspect-ratio preserved)
function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,   // center X
  cy: number,   // center Y
  maxW: number, // max bounding box width
  maxH: number  // max bounding box height
) {
  const naturalW = img.naturalWidth  || img.width  || maxW;
  const naturalH = img.naturalHeight || img.height || maxH;
  const ratio = Math.min(maxW / naturalW, maxH / naturalH);
  const dw = naturalW * ratio;
  const dh = naturalH * ratio;
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
}

// Draw a frame from a preloaded RGBA WebP sprite sheet with object-fit: contain (100% Safari & iOS compatible)
function drawSpriteFrameContain(
  ctx: CanvasRenderingContext2D,
  sheetImg: HTMLImageElement | undefined,
  spec: SpriteSheetSpec,
  frameIdx: number,
  cx: number,
  cy: number,
  maxW: number,
  maxH: number
): boolean {
  if (!sheetImg || !sheetImg.complete || !sheetImg.naturalWidth) {
    return false;
  }
  const clampedIdx = Math.max(0, Math.min(frameIdx, spec.totalFrames - 1));
  const col = clampedIdx % spec.cols;
  const row = Math.floor(clampedIdx / spec.cols);
  const sx = col * spec.frameWidth;
  const sy = row * spec.frameHeight;

  const ratio = Math.min(maxW / spec.frameWidth, maxH / spec.frameHeight);
  const dw = spec.frameWidth * ratio;
  const dh = spec.frameHeight * ratio;

  ctx.drawImage(
    sheetImg,
    sx,
    sy,
    spec.frameWidth,
    spec.frameHeight,
    cx - dw / 2,
    cy - dh / 2,
    dw,
    dh
  );
  return true;
}

// Draw trash can dumping animation frame from preloaded RGBA WebP sprite sheet
function drawTrashCanSpriteFrame(
  ctx: CanvasRenderingContext2D,
  sheetImg: HTMLImageElement | undefined,
  spec: SpriteSheetSpec,
  frameIdx: number,
  vidX: number,
  vidY: number,
  vidW: number,
  vidH: number
): boolean {
  if (!sheetImg || !sheetImg.complete || !sheetImg.naturalWidth) {
    return false;
  }
  const clampedIdx = Math.max(0, Math.min(frameIdx, spec.totalFrames - 1));
  const col = clampedIdx % spec.cols;
  const row = Math.floor(clampedIdx / spec.cols);
  const sx = col * spec.frameWidth;
  const sy = row * spec.frameHeight;

  ctx.drawImage(
    sheetImg,
    sx,
    sy,
    spec.frameWidth,
    spec.frameHeight,
    vidX,
    vidY,
    vidW,
    vidH
  );
  return true;
}

export default function GridMap({
  width,
  height,
  characters,
  trashItems,
  trashCans,
  obstacles,
  isExecuting,
  onShowHints,
  customOffsets,
  levelId = 1,
  isMuted = false,
  onToggleMute,
  onBackToDashboard,
}: GridMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Zoom & pan state
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetAtDragStart = useRef({ x: 0, y: 0 });

  // Backpack overlay visibility state
  const [showBackpack, setShowBackpack] = useState(true);

  // State to toggle "Keterangan Urutan Buang Sampah" info card
  const [showUrutanInfo, setShowUrutanInfo] = useState(false);

  // Hover state for trash cans
  const [hoveredCanType, setHoveredCanType] = useState<TrashType | null>(null);
  const [hoveredCanPos, setHoveredCanPos] = useState<{ x: number; topY: number; bottomY: number } | null>(null);
  const hoveredCanTypeRef = useRef<TrashType | null>(null);
  hoveredCanTypeRef.current = hoveredCanType;

  // Mobile viewport detection for responsive tooltip sizing and positioning
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768 || window.innerHeight < 520 || (('ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)) && window.innerWidth < 1024);
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768 || window.innerHeight < 520 || (('ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)) && window.innerWidth < 1024);
      setIsMobile(mobile);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Clear hover on level change
  useEffect(() => {
    setHoveredCanType(null);
    setHoveredCanPos(null);
  }, [levelId]);

  // Custom vertical offset & size scale adjustments
  const [offsets] = useState({
    ...DEFAULT_ELEMENT_OFFSETS,
    ...customOffsets,
  });

  // Preload images (initialized immediately from global preloader cache)
  const [imagesLoaded, setImagesLoaded] = useState(() => Object.keys(PRELOADED_IMAGES).length > 0);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({ ...PRELOADED_IMAGES });

  // Sprite sheet animation timing refs (supports seamless Pause & Resume)
  const lastFrameNowRef = useRef<number>(typeof performance !== 'undefined' ? performance.now() : 0);
  const walkElapsedMsRef = useRef<number>(0);
  const actionElapsedMsRef = useRef<number>(0);
  const canElapsedMsRef = useRef<number>(0);

  // Track active instruction and dumping can across execution frames
  const lastActiveInstructionIdRef = useRef<string | null>(null);
  const lastActiveDumpingCanTypeRef = useRef<TrashType | null>(null);

  // Pause animation timers when execution stops; only reset to frame 0 when not paused mid-run
  useEffect(() => {
    if (!isExecuting) {
      const isPausedMidRun = characters.some(c => c.activeInstructionId !== null);
      if (!isPausedMidRun) {
        walkElapsedMsRef.current = 0;
        actionElapsedMsRef.current = 0;
        canElapsedMsRef.current = 0;
        lastActiveInstructionIdRef.current = null;
        lastActiveDumpingCanTypeRef.current = null;
        lastHorizontalDirsRef.current = {
          ORGANIC: 'RIGHT',
          RECYCLABLE: 'RIGHT',
          B3: 'RIGHT',
        };
      }
    } else {
      lastFrameNowRef.current = typeof performance !== 'undefined' ? performance.now() : 0;
    }
  }, [isExecuting, characters]);

  // Keep track of the last horizontal direction of each character to prevent vertical flipping
  const lastHorizontalDirsRef = useRef<Record<CharacterId, 'LEFT' | 'RIGHT'>>({
    ORGANIC: 'RIGHT',
    RECYCLABLE: 'RIGHT',
    B3: 'RIGHT',
  });

  // Track container dimensions reactively to avoid layout thrashing
  const containerSizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const entries = Object.entries(GRID_IMAGE_SOURCES);
    let loadedCount = 0;

    entries.forEach(([key, src]) => {
      if (PRELOADED_IMAGES[key]) {
        imagesRef.current[key] = PRELOADED_IMAGES[key];
        loadedCount++;
        if (loadedCount === entries.length) {
          setImagesLoaded(true);
        }
        return;
      }
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imagesRef.current[key] = img;
        PRELOADED_IMAGES[key] = img;
        loadedCount++;
        if (loadedCount === entries.length) {
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === entries.length) {
          setImagesLoaded(true);
        }
      };
    });
  }, []);

  // Cell size calculation
  const getCellSize = useCallback((containerW: number, containerH: number) => {
    const padding = 16;
    const availW = containerW - padding * 2;
    const availH = containerH - padding * 2;
    const cellFromW = availW / width;
    const cellFromH = availH / height;
    return Math.max(24, Math.min(cellFromW, cellFromH));
  }, [width, height]);

  // Drawing
  const draw = useCallback(() => {
    // Update last horizontal directions
    characters.forEach(c => {
      if (c.facingDir === 'LEFT' || c.facingDir === 'RIGHT') {
        lastHorizontalDirsRef.current[c.id] = c.facingDir;
      }
    });

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rectW = containerSizeRef.current.width || container.clientWidth || 400;
    const rectH = containerSizeRef.current.height || container.clientHeight || 300;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rectW * dpr;
    canvas.height = rectH * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rectW, rectH);

    const baseCellSize = getCellSize(rectW, rectH);
    const cellSizeVal = baseCellSize * zoom;

    const gridW = cellSizeVal * width;
    const gridH = cellSizeVal * height;

    const padX = (rectW - gridW) / 2 + offset.x;
    const padY = (rectH - gridH) / 2 + offset.y;

    const toScreen = (gx: number, gy: number) => ({
      x: padX + gx * cellSizeVal,
      y: padY + gy * cellSizeVal,
    });

    const getTrailCharacters = (x: number, y: number) =>
      characters.filter(c => c.trailPositions.some(p => p.x === x && p.y === y));

    const findTrash = (x: number, y: number) =>
      trashItems.find(t => t.pos.x === x && t.pos.y === y && !t.collected);

    const findTrashCan = (x: number, y: number) =>
      trashCans.find(tc => tc.pos.x === x && tc.pos.y === y);

    const findObstacle = (x: number, y: number) =>
      obstacles.find(o => o.pos.x === x && o.pos.y === y);

    // 1. Draw Grid Background Image (assets/bg-grid-v2.svg)
    const bgImg = imagesRef.current['bgGrid'];
    if (bgImg) {
      ctx.drawImage(bgImg, padX, padY, width * cellSizeVal, height * cellSizeVal);
    } else {
      // Fallback sky background if image hasn't loaded yet
      const skyGrad = ctx.createLinearGradient(0, padY, 0, padY + height * cellSizeVal);
      skyGrad.addColorStop(0, '#bae6fd');
      skyGrad.addColorStop(1, '#f0f9ff');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(padX, padY, width * cellSizeVal, height * cellSizeVal);
    }

    // 2. Draw grid bottom ground line only
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    const bottomY = Math.round(padY + height * cellSizeVal);
    ctx.fillRect(padX, bottomY, width * cellSizeVal, 2);
    ctx.restore();

    // 3. Draw column numbers (bottom, starting from 1)
    ctx.save();
    const labelFontSize = Math.max(9, Math.min(cellSizeVal * 0.28, 14));
    ctx.font = `bold ${labelFontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    for (let gx = 0; gx < width; gx++) {
      const sx = padX + gx * cellSizeVal + cellSizeVal / 2;
      const sy = padY + height * cellSizeVal + 6;
      ctx.fillText(`${gx + 1}`, sx, sy);
    }
    ctx.restore();

    // Helper function to resolve autotiled or variant rock asset key
    const getRockAssetKey = (obs: ObstacleOnGrid, allObs: ObstacleOnGrid[]) => {
      const isRockOrWall = (gx: number, gy: number) =>
        allObs.some(o => (o.type === 'rock' || o.type === 'wall') && o.pos.x === gx && o.pos.y === gy);

      const x = obs.pos.x;
      const y = obs.pos.y;
      const top = isRockOrWall(x, y - 1);
      const bottom = isRockOrWall(x, y + 1);
      const left = isRockOrWall(x - 1, y);
      const right = isRockOrWall(x + 1, y);

      // Connected rock wall layout (3x3 autotiling grid)
      if (top || bottom || left || right) {
        if (!top && !left && (right || bottom)) return 'rock_1';
        if (!top && left && right) return 'rock_2';
        if (!top && !right && (left || bottom)) return 'rock_3';
        if (top && bottom && !left && right) return 'rock_4';
        if (top && bottom && left && right) return 'rock_5';
        if (top && bottom && !right && left) return 'rock_6';
        if (!bottom && !left && (top || right)) return 'rock_7';
        if (!bottom && left && right) return 'rock_8';
        if (!bottom && !right && (top || left)) return 'rock_9';
        if (top && bottom && !left && !right) return 'rock_5';
        if (left && right && !top && !bottom) return 'rock_2';
      }

      // Standalone single rock/wall obstacle: pick deterministic variant based on position
      const variantIndex = ((x * 7 + y * 13) % 9) + 1;
      return `rock_${variantIndex}`;
    };

    // 5. Draw Obstacles (Placed on the floor / grid)
    obstacles.forEach(obs => {
      const { x: cx, y: cy } = toScreen(obs.pos.x, obs.pos.y);
      const cx2 = cx + cellSizeVal / 2;
      const obsConfig = DEFAULT_ELEMENT_CONFIGS.obstacles[obs.type] || {};
      const yOffset = obsConfig.yOffset ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.obstacle.yOffset;
      const sizeScale = obsConfig.sizeScale ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.obstacle.sizeScale;
      const cy2 = cy + cellSizeVal * yOffset;

      ctx.save();

      // Render WebP rock/wall grid asset if type is rock or wall
      if (obs.type === 'rock' || obs.type === 'wall') {
        const rockKey = getRockAssetKey(obs, obstacles);
        const tileConfig = DEFAULT_ELEMENT_CONFIGS.rockTiles[rockKey] || {};

        const tileYOffset = tileConfig.yOffset ?? yOffset;
        const tileXOffset = tileConfig.xOffset ?? obsConfig.xOffset ?? 0;
        const tileScale   = tileConfig.sizeScale ?? sizeScale;

        const tileCx = cx + cellSizeVal / 2 + cellSizeVal * tileXOffset;
        const tileCy = cy + cellSizeVal * tileYOffset;

        const rockImg = imagesRef.current[rockKey] || imagesRef.current['rock_5'];
        if (rockImg) {
          const obsSize = cellSizeVal * tileScale;

          ctx.save();
          ctx.translate(tileCx, tileCy);

          // Dynamic visual variation: Flip horizontally on alternating coordinates so adjacent tiles are non-uniform
          const shouldFlip = (obs.pos.x * 3 + obs.pos.y * 7) % 2 === 1;
          if (shouldFlip) {
            ctx.scale(-1, 1);
          }

          // Subtle organic angle variation (+- 2.5 degrees) based on grid position
          const angle = (((obs.pos.x * 11 + obs.pos.y * 17) % 5) - 2) * (Math.PI / 180);
          ctx.rotate(angle);

          drawImageContain(ctx, rockImg, 0, 0, obsSize, obsSize);
          ctx.restore();

          ctx.restore();
          return;
        }
      }

      // Fallback emoji rendering for bush/water or un-loaded assets
      ctx.font = `${Math.min(cellSizeVal * sizeScale, 30)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(obs.emoji, cx2, cy2);
      ctx.restore();
    });

    // 6. Draw Trash Items (Placed on the floor, bottom edge aligned to ground)
    trashItems.forEach(t => {
      if (t.collected) return;
      const { x: cx, y: cy } = toScreen(t.pos.x, t.pos.y);
      const cx2 = cx + cellSizeVal / 2;
      const itemConfig = DEFAULT_ELEMENT_CONFIGS.trashItems[t.item.id] || {};
      const yOffset = itemConfig.yOffset ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.trash.yOffset;
      const sizeScale = itemConfig.sizeScale ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.trash.sizeScale;
      const trashSize = cellSizeVal * sizeScale;
      const cy2 = cy + cellSizeVal * yOffset; 
      const trashImg = imagesRef.current[t.item.id];

      ctx.save();
      if (trashImg) {
        drawImageContain(ctx, trashImg, cx2, cy2, trashSize, trashSize);
      } else {
        ctx.font = `${Math.min(trashSize * 0.8, 36)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.item.emoji, cx2, cy2);
      }
      ctx.restore();
    });

    // Advance animation clocks based on frame delta time
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const dt = Math.min(100, Math.max(0, now - lastFrameNowRef.current));
    lastFrameNowRef.current = now;

    // Check if active instruction or active dumping can changed
    const currentActiveInstructionId = characters.find(c => c.activeInstructionId)?.activeInstructionId || null;
    const isNewInstruction = isExecuting && currentActiveInstructionId !== lastActiveInstructionIdRef.current;
    if (isExecuting && isNewInstruction) {
      lastActiveInstructionIdRef.current = currentActiveInstructionId;
      actionElapsedMsRef.current = 0;
      canElapsedMsRef.current = 0;
    }

    if (isExecuting) {
      const anyActing = characters.some(c => c.isPicking || c.isDumping);
      if (anyActing) {
        actionElapsedMsRef.current += dt;
      } else {
        walkElapsedMsRef.current += dt;
      }
    }

    // 7. Draw Player Characters (drawn behind trash cans)
    try {
      characters.forEach(c => {
        const renderX = c.pos.x;
        const renderY = c.pos.y;

        // Map grid coordinates to canvas pixel coordinates
        const cx = padX + renderX * cellSizeVal + cellSizeVal / 2;
        const cy = padY + renderY * cellSizeVal + cellSizeVal / 2;

        drawCharacter(ctx, cx, cy, cellSizeVal, c);
      });
    } catch (e) {
      // Silently catch character rendering errors so grid lines still draw
    }

    // 8. Draw Trash Cans (Placed side-by-side on floor, drawn in front of characters / higher z-index)
    // ONLY animate a trash can when the character is actively dumping valid trash into it (c.isDumping && c.dumpingCanType)
    let activeDumpingCanType: TrashType | null = null;

    const dumpingChar = characters.find(
      c => c.isDumping && c.dumpingCanType && (isExecuting || c.activeInstructionId !== null)
    );
    if (dumpingChar && dumpingChar.dumpingCanType) {
      activeDumpingCanType = dumpingChar.dumpingCanType;
    }

    const isCanTargetChanged = activeDumpingCanType !== lastActiveDumpingCanTypeRef.current;
    if (isCanTargetChanged) {
      lastActiveDumpingCanTypeRef.current = activeDumpingCanType;
      canElapsedMsRef.current = 0;
    } else if (isExecuting && activeDumpingCanType !== null) {
      canElapsedMsRef.current += dt;
    }

    trashCans.forEach(tc => {
      const { x: cx, y: cy } = toScreen(tc.pos.x, tc.pos.y);
      const cx2 = cx + cellSizeVal / 2;
      const canConfig = DEFAULT_ELEMENT_CONFIGS.trashCans[tc.type] || {};
      const yOffset = canConfig.yOffset ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.trashCan.yOffset;
      const sizeScale = canConfig.sizeScale ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.trashCan.sizeScale;
      const canSize = cellSizeVal * sizeScale;
      const cy2 = cy + cellSizeVal * yOffset; 

      const isDumping = tc.type === activeDumpingCanType;
      const sheetKey = `can${tc.type}_sheet`;
      const sheetSpec = SPRITE_SHEET_SPECS[sheetKey];
      const sheetImg = imagesRef.current[sheetKey] || PRELOADED_IMAGES[sheetKey];

      ctx.save();
      let drewSprite = false;
      if (isDumping && sheetSpec && sheetImg) {
        const frameIdx = Math.min(
          sheetSpec.totalFrames - 1,
          Math.floor((canElapsedMsRef.current / 1000) * sheetSpec.fps)
        );

        // Draw animated dumping sprite scaled and aligned to match the WebP asset exactly
        const vidW = canSize * (320 / 359) * (181 / 163);
        const vidH = vidW * (295 / 181);
        const vidX = cx2 - vidW / 2;
        const vidY = (cy2 + canSize / 2) - (286 / 295) * vidH;

        drewSprite = drawTrashCanSpriteFrame(ctx, sheetImg, sheetSpec, frameIdx, vidX, vidY, vidW, vidH);
      }

      if (!drewSprite) {
        const canKey = `${tc.type}_can`;
        const canImg = imagesRef.current[canKey] || PRELOADED_IMAGES[canKey];
        if (canImg) {
          drawImageContain(ctx, canImg, cx2, cy2, canSize, canSize);
        } else {
          ctx.font = `${Math.min(canSize * 0.6, 40)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tc.emoji, cx2, cy2);
        }
      }
      ctx.restore();
    });

  }, [width, height, characters, trashItems, trashCans, obstacles, isExecuting, zoom, offset, getCellSize, imagesLoaded, offsets]);

  // Draw a single character using preloaded RGBA WebP sprite sheets (100% Safari & iOS compatible)
  const drawCharacter = (ctx: CanvasRenderingContext2D, cx: number, cy: number, cellSize: number, character: CharacterRenderData) => {
    const isActiveOrPaused = isExecuting || character.activeInstructionId !== null;
    const isPicking = isActiveOrPaused && Boolean(character.isPicking);
    const isDropping = isActiveOrPaused && Boolean(character.isDumping);

    const charConfig = DEFAULT_ELEMENT_CONFIGS.characters[character.id] || {};
    const yOffset = charConfig.yOffset ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.character.yOffset;
    const scaleW = charConfig.sizeScaleW ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.character.sizeScaleW!;
    const scaleH = charConfig.sizeScaleH ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.character.sizeScaleH!;

    const rx = cx;
    const charW = cellSize * scaleW;
    const charH = cellSize * scaleH;
    const ry = cy + cellSize / 2 - charH / 2 + cellSize * yOffset;

    let activeSpec = SPRITE_SHEET_SPECS.char_walk_sheet;
    let activeFrameIdx = isActiveOrPaused
      ? Math.floor((walkElapsedMsRef.current / 1000) * activeSpec.fps) % activeSpec.totalFrames
      : 0;
    let activeCharW = charW;
    let activeCharH = charH;
    let activeRy = ry;

    if (isDropping) {
      const dropSpec = SPRITE_SHEET_SPECS.char_drop_sheet;
      const dropFrame = Math.floor((actionElapsedMsRef.current / 1000) * dropSpec.fps);
      if (dropFrame < dropSpec.totalFrames) {
        activeSpec = dropSpec;
        activeFrameIdx = dropFrame;
      } else {
        activeSpec = SPRITE_SHEET_SPECS.char_walk_sheet;
        activeFrameIdx = 0;
      }
    } else if (isPicking) {
      const pickSpec = SPRITE_SHEET_SPECS.char_pick_sheet;
      const pickFrame = Math.min(
        pickSpec.totalFrames - 1,
        Math.floor((actionElapsedMsRef.current / 1000) * pickSpec.fps)
      );
      activeSpec = pickSpec;
      activeFrameIdx = pickFrame;
      const pickScale = 0.96;
      activeCharW = charW * pickScale;
      activeCharH = charH * pickScale;
      activeRy = ry + (charH - activeCharH) / 2;
    }

    const activeSheetImg = imagesRef.current[activeSpec.key] || PRELOADED_IMAGES[activeSpec.key];

    ctx.save();
    ctx.translate(rx, activeRy);

    if (character.facingDir === 'LEFT') {
      ctx.scale(-1, 1);
    }

    const drawn = drawSpriteFrameContain(ctx, activeSheetImg, activeSpec, activeFrameIdx, 0, 0, activeCharW, activeCharH);
    if (!drawn) {
      const walkSpec = SPRITE_SHEET_SPECS.char_walk_sheet;
      const walkImg = imagesRef.current[walkSpec.key] || PRELOADED_IMAGES[walkSpec.key];
      drawSpriteFrameContain(ctx, walkImg, walkSpec, 0, 0, 0, charW, charH);
    }
    ctx.restore();
  };

  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  // Continuous animation frame tick using requestAnimationFrame to keep canvas updated smoothly
  useEffect(() => {
    let animId: number;
    const tick = () => {
      drawRef.current();
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Resize observer to track dimensions without triggering layout reflows
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      let width = 0;
      let height = 0;
      for (const entry of entries) {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
      }
      containerSizeRef.current = { width, height };
      drawRef.current();
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Manual wheel listener with { passive: false } to prevent browser warning
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.max(0.3, Math.min(3, prev * delta)));
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && (e.shiftKey || e.metaKey))) {
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      offsetAtDragStart.current = { ...offset };
      e.preventDefault();
    }
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setOffset({
        x: offsetAtDragStart.current.x + dx,
        y: offsetAtDragStart.current.y + dy,
      });
      if (hoveredCanTypeRef.current) {
        setHoveredCanType(null);
        setHoveredCanPos(null);
      }
      return;
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const baseCellSize = getCellSize(rect.width, rect.height);
    const cellSizeVal = baseCellSize * zoom;
    const gridW = cellSizeVal * width;
    const gridH = cellSizeVal * height;
    const padX = (rect.width - gridW) / 2 + offset.x;
    const padY = (rect.height - gridH) / 2 + offset.y;

    // Hit-test trash cans with equal, non-overlapping trigger boundaries
    let foundCan: TrashCanOnGrid | null = null;
    let foundPos: { x: number; topY: number; bottomY: number } | null = null;
    let minCandidateDist = Infinity;

    for (const tc of trashCans) {
      const cellLeft = padX + tc.pos.x * cellSizeVal;
      const cellTop = padY + tc.pos.y * cellSizeVal;
      const canConfig = DEFAULT_ELEMENT_CONFIGS.trashCans[tc.type] || {};
      const yOffset = canConfig.yOffset ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.trashCan.yOffset;
      const sizeScale = canConfig.sizeScale ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.trashCan.sizeScale;
      const canSize = cellSizeVal * sizeScale;
      const cx2 = cellLeft + cellSizeVal / 2;
      const cy2 = cellTop + cellSizeVal * yOffset;

      // Exactly 0.5 cells in each direction: equal hitboxes with no overlap between adjacent cans
      const halfW = cellSizeVal * 0.5;
      const halfH = canSize / 2;
      const left = cx2 - halfW;
      const right = cx2 + halfW;
      const top = cy2 - halfH * 1.35;
      const bottom = cy2 + halfH * 1.15;

      if (mx >= left && mx <= right && my >= top && my <= bottom) {
        const dist = Math.abs(mx - cx2);
        if (dist < minCandidateDist) {
          minCandidateDist = dist;
          foundCan = tc;
          foundPos = {
            x: cx2,
            topY: cy2 - halfH,
            bottomY: cy2 + halfH,
          };
        }
      }
    }

    if (foundCan && foundPos) {
      if (hoveredCanTypeRef.current !== foundCan.type) {
        setHoveredCanType(foundCan.type);
      }
      setHoveredCanPos(foundPos);
    } else {
      if (hoveredCanTypeRef.current !== null) {
        setHoveredCanType(null);
        setHoveredCanPos(null);
      }
    }
  }, [width, height, offset, zoom, trashCans, getCellSize]);

  // Touch tap handler for mobile devices
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mx = touch.clientX - rect.left;
    const my = touch.clientY - rect.top;

    const baseCellSize = getCellSize(rect.width, rect.height);
    const cellSizeVal = baseCellSize * zoom;
    const gridW = cellSizeVal * width;
    const gridH = cellSizeVal * height;
    const padX = (rect.width - gridW) / 2 + offset.x;
    const padY = (rect.height - gridH) / 2 + offset.y;

    let candidateCan: TrashCanOnGrid | null = null;
    let candidatePos: { x: number; topY: number; bottomY: number } | null = null;
    let minCandidateDist = Infinity;

    for (const tc of trashCans) {
      const cellLeft = padX + tc.pos.x * cellSizeVal;
      const cellTop = padY + tc.pos.y * cellSizeVal;
      const canConfig = DEFAULT_ELEMENT_CONFIGS.trashCans[tc.type] || {};
      const yOffset = canConfig.yOffset ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.trashCan.yOffset;
      const sizeScale = canConfig.sizeScale ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.trashCan.sizeScale;
      const canSize = cellSizeVal * sizeScale;
      const cx2 = cellLeft + cellSizeVal / 2;
      const cy2 = cellTop + cellSizeVal * yOffset;

      const halfW = cellSizeVal * 0.55;
      const halfH = canSize / 2;
      const left = cx2 - halfW;
      const right = cx2 + halfW;
      const top = cy2 - halfH * 1.35;
      const bottom = cy2 + halfH * 1.15;

      if (mx >= left && mx <= right && my >= top && my <= bottom) {
        const dist = Math.abs(mx - cx2);
        if (dist < minCandidateDist) {
          minCandidateDist = dist;
          candidateCan = tc;
          candidatePos = {
            x: cx2,
            topY: cy2 - halfH,
            bottomY: cy2 + halfH,
          };
        }
      }
    }

    if (candidateCan && candidatePos) {
      if (hoveredCanTypeRef.current === candidateCan.type) {
        setHoveredCanType(null);
        setHoveredCanPos(null);
      } else {
        setHoveredCanType(candidateCan.type);
        setHoveredCanPos(candidatePos);
      }
    } else {
      if (hoveredCanTypeRef.current !== null) {
        setHoveredCanType(null);
        setHoveredCanPos(null);
      }
    }
  }, [width, height, offset, zoom, trashCans, getCellSize]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
    setHoveredCanType(null);
    setHoveredCanPos(null);
  }, []);

  function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Reset zoom/pan and direction tracking on grid size change
  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    lastHorizontalDirsRef.current = {
      ORGANIC: 'RIGHT',
      RECYCLABLE: 'RIGHT',
      B3: 'RIGHT',
    };
  }, [width, height]);

  // Sum all backpacks for total count
  const totalBackpack = characters.reduce((sum, c) => sum + c.backpack.length, 0);
  const totalCapacity = characters.reduce((sum, c) => sum + c.backpackCapacity, 0);

  return (
    <div className="flex flex-col bg-white border border-[#EED4B7] rounded-2xl sm:rounded-3xl p-0 shadow-xl h-full select-none overflow-visible" id="grid-map-container">
      <div
        ref={containerRef}
        className="flex-1 relative rounded-2xl border border-[#EED4B7]/80 overflow-visible"
        style={{ minHeight: 120, cursor: isDragging.current ? 'grabbing' : (hoveredCanType ? 'pointer' : 'default') }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
      >
        <canvas
          ref={canvasRef}
          className="block w-full bg-[#6DCC7E] h-full rounded-2xl"
        />

        {/* Tooltip Hover Tong Sampah (Asset Image Card) */}
        {hoveredCanType && hoveredCanPos && TRASH_CAN_HOVER_IMAGES[hoveredCanType] && (() => {
          const hoverImg = TRASH_CAN_HOVER_IMAGES[hoveredCanType];
          const containerW = containerSizeRef.current.width || 800;
          
          // Tooltip position centered horizontally on the trash can (allowed to exceed container)
          const posX = hoveredCanPos.x;

          // On mobile: position tooltip BELOW the trash can
          // On desktop: position tooltip ABOVE the trash can
          // Both are allowed to naturally exceed the container boundaries
          const posY = isMobile 
            ? hoveredCanPos.bottomY + 8 
            : hoveredCanPos.topY - 8;
          const transform = isMobile 
            ? 'translateX(-50%)' 
            : 'translate(-50%, -100%)';

          const tooltipWidth = isMobile ? 80 : 176;

          return (
            <div
              className="absolute pointer-events-none z-[60] transition-all duration-150 ease-out animate-fade-in max-w-none"
              style={{
                left: `${posX}px`,
                top: `${posY}px`,
                width: `${tooltipWidth}px`,
                transform,
              }}
            >
              <img
                src={hoverImg}
                alt={`Keterangan ${hoveredCanType}`}
                className="w-full h-auto max-w-none object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)] select-none pointer-events-none block"
                style={{ aspectRatio: '302 / 442' }}
              />
            </div>
          );
        })()}

        {/* Level Badge & Back to Dashboard Button — Pojok Kiri */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 sm:gap-2">
          {onBackToDashboard && (
            <button type="button" onClick={onBackToDashboard} className={`${isMobile ? "h-6.5 px-2 text-[10px] rounded-md" : "h-8 sm:h-10 md:h-11 px-2.5 sm:px-3 text-xs sm:text-sm rounded-lg sm:rounded-xl"} flex items-center gap-1 bg-white/95 hover:bg-white border border-[#EED4B7] text-slate-900 hover:text-black font-extrabold shadow-sm cursor-pointer transition-colors active:scale-95 select-none`} title="Kembali ke Pilih Level">
              <ArrowLeft className={`${isMobile ? "w-3.5 h-3.5" : "w-3.5 h-3.5 sm:w-4 sm:h-4"} text-slate-900`} />
              <span className="hidden sm:inline">Pilih Level</span>
            </button>
          )}
          <div id="level-badge" className={`${isMobile ? "h-6.5 px-2.5 text-xs rounded-md" : "h-8 sm:h-10 md:h-11 px-3 sm:px-4 text-xs sm:text-sm md:text-base lg:text-lg rounded-lg sm:rounded-xl"} flex items-center justify-center bg-[#0192D5] border border-[#017bb3] text-white font-extrabold font-sans tracking-wide shadow-sm select-none`}>
            Level {levelId}
          </div>
        </div>

        {/* Controls Container (Backpack Overlay + Info Urutan + Audio + Help + Zoom) */}
        <div className="absolute top-3 right-3 z-10 flex flex-row gap-1.5 sm:gap-2 items-start">
          <div className="relative flex flex-col items-end gap-1.5">
            <div className="flex flex-row gap-1.5 sm:gap-2 items-center">
              {/* Multi-character Backpack overlay */}
              {showBackpack && (
                <div id="backpack-overlay" className={`${isMobile ? "h-6.5 px-1.5 gap-1 rounded-md" : "h-8 sm:h-10 md:h-11 px-2 sm:px-3 gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl"} flex items-center bg-white/95 backdrop-blur-md border border-[#EED4B7] shadow-sm select-none flex-shrink-0`}>
                  {characters.map(c => {
                    const colors = CHARACTER_COLORS[c.id];
                    return (
                      <div key={c.id} className="flex items-center gap-1 sm:gap-1.5">
                        <Backpack className={`${isMobile ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5"} text-indigo-600`} />
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          {Array.from({ length: c.backpackCapacity }, (_, i) => {
                            const item = c.backpack[i];
                            const isTop = i === c.backpack.length - 1;
                            const discardNum = c.backpack.length - i;
                            return item ? (
                              <div
                                key={item.id}
                                className={`relative flex items-center justify-center rounded p-0.5 transition-all ${
                                  isTop ? 'bg-amber-100 ring-2 ring-amber-500' : 'bg-stone-50'
                                }`}
                                title={`${item.name} (${TRASH_CAN_INFO[item.type]?.label || item.type}) - Urutan Buang #${discardNum}`}
                              >
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className={`${isMobile ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5"} object-contain drop-shadow-xs`}
                                  />
                                ) : (
                                  <span className="text-xs sm:text-base leading-none">{item.emoji}</span>
                                )}
                                <span className={`absolute -top-1 -right-1 bg-amber-600 text-white font-extrabold ${isMobile ? "text-[6.5px] w-2.5 h-2.5" : "text-[8px] w-3 h-3 sm:w-3.5 sm:h-3.5"} rounded-full flex items-center justify-center shadow-xs`}>
                                  {discardNum}
                                </span>
                              </div>
                            ) : (
                              <span
                                key={`empty-${c.id}-${i}`}
                                className={`${isMobile ? "w-3.5 h-3.5" : "w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5"} rounded-xs border border-dashed border-[#EED4B7] bg-[#FEF8F0]`}
                                title="Slot tas kosong"
                              />
                            );
                          })}
                        </div>
                        <span
                          className={`text-[9px] sm:text-xs md:text-sm font-mono font-black ${c.backpack.length === 0 ? 'text-stone-400' : ''}`}
                          style={{ color: c.backpack.length > 0 ? colors.border : undefined }}
                        >
                          {c.backpack.length}/{c.backpackCapacity}
                        </span>
                      </div>
                    );
                  })}
                  {characters.length > 1 && totalBackpack > 0 && (
                    <div className="text-[10px] sm:text-xs md:text-sm text-stone-600 font-mono font-black border-l border-[#EED4B7] pl-1.5">
                      {totalBackpack}/{totalCapacity}
                    </div>
                  )}
                </div>
              )}

              {/* Tombol Keterangan Urutan Buang Sampah */}
              <button
                type="button"
                onClick={() => setShowUrutanInfo(prev => !prev)}
                className={`${isMobile ? "h-8 px-2.5 text-[10px] sm:text-xs rounded-lg gap-1.5" : "h-10 px-3 text-xs sm:text-sm rounded-xl gap-1.5"} flex items-center backdrop-blur-md border font-extrabold shadow-sm cursor-pointer transition-all active:scale-95 flex-shrink-0 ${
                  showUrutanInfo
                    ? 'bg-amber-100 border-amber-400 text-amber-950 ring-1 ring-amber-400'
                    : 'bg-white/95 hover:bg-white border-[#EED4B7] text-stone-700 hover:text-stone-900'
                }`}
                title="Keterangan Urutan Buang Sampah (LIFO)"
              >
                <Info className={`${isMobile ? "w-3.5 h-3.5" : "w-3.5 h-3.5 sm:w-4 sm:h-4"} text-amber-600`} />
                <span className="hidden sm:inline">Urutan Buang</span>
              </button>

              {/* In-Game Audio Toggle Button */}
              {onToggleMute && (
                <button id="arena-audio-toggle" type="button" onClick={onToggleMute} className={`${isMobile ? "w-6.5 h-6.5 rounded-md" : "w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg sm:rounded-xl"} flex items-center justify-center bg-white/90 hover:bg-white border border-[#EED4B7] shadow-sm cursor-pointer transition-colors active:scale-95 flex-shrink-0`} title={isMuted ? "Nyalakan Musik / Suara" : "Matikan Musik / Suara"}>
                  {isMuted ? (
                    <VolumeX className={`${isMobile ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5"} text-rose-500`} />
                  ) : (
                    <Volume2 className={`${isMobile ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5"} text-indigo-650`} />
                  )}
                </button>
              )}

              {/* Guide / Hints Button */}
              {onShowHints && (
                <button type="button" onClick={onShowHints} className={`${isMobile ? "w-6.5 h-6.5 rounded-md" : "w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg sm:rounded-xl"} flex items-center justify-center bg-white/90 hover:bg-white border border-[#EED4B7] text-amber-955 hover:text-indigo-600 shadow-sm cursor-pointer transition-colors active:scale-95 flex-shrink-0`} title="Tampilkan Detail Misi & Petunjuk">
                  <HelpCircle className={`${isMobile ? "w-4.5 h-4.5" : "w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6"}`} />
                </button>
              )}
            </div>

            {/* Dropdown Card Keterangan Urutan Buang */}
            {showUrutanInfo && (
              <div
                id="keterangan-urutan-buang"
                className="w-72 sm:w-84 md:w-96 bg-white/95 backdrop-blur-md border-2 border-amber-300 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-xl flex flex-col gap-2 text-stone-800 animate-fade-in select-none text-left"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-amber-200">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🎒</span>
                    <span className="font-extrabold text-xs sm:text-sm text-amber-950 font-heading">
                      Keterangan Urutan Buang Sampah
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUrutanInfo(false)}
                    className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                    title="Tutup"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-[10px] sm:text-xs leading-relaxed text-stone-700 bg-amber-50/80 p-2 rounded-lg border border-amber-200/80">
                  <div className="font-bold text-amber-900 mb-0.5">📌 Aturan Tumpukan (LIFO / Stack):</div>
                  Sampah yang <strong>terakhir diambil</strong> berada di bagian <strong>teratas tas</strong> dan <strong>wajib dibuang lebih dulu</strong> saat perintah <strong>BUANG</strong> dijalankan.
                </div>

                {/* Dynamic Backpack Sequence */}
                {characters[0]?.backpack.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="text-[10px] sm:text-xs font-bold text-stone-600 flex items-center justify-between">
                      <span>Urutan Pembuangan Isi Tas:</span>
                      <span className="text-[9px] text-stone-400">({characters[0].backpack.length} sampah di tas)</span>
                    </div>
                    <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-0.5 custom-scrollbar">
                      {characters[0].backpack
                        .slice()
                        .reverse()
                        .map((item, idx) => {
                          const bin = TRASH_CAN_INFO[item.type];
                          const isNext = idx === 0;
                          return (
                            <div
                              key={`${item.id}-${idx}`}
                              className={`flex items-center justify-between px-2 py-1 rounded-lg border text-[10px] sm:text-xs ${
                                isNext
                                  ? 'bg-amber-100/90 border-amber-400 font-extrabold text-amber-950 ring-1 ring-amber-400 shadow-xs'
                                  : 'bg-stone-50 border-stone-200 text-stone-600 font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-stone-500 font-bold">#{idx + 1}</span>
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-4 h-4 object-contain" />
                                ) : (
                                  <span>{item.emoji}</span>
                                )}
                                <span>{item.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-stone-400">➔</span>
                                <span
                                  className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white shadow-xs"
                                  style={{ backgroundColor: bin?.color || '#666' }}
                                >
                                  {bin?.label || item.type}
                                </span>
                                {isNext && (
                                  <span className="ml-1 text-[8px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                    Dibuang #1
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 text-[10px] sm:text-xs">
                    <div className="text-stone-500 font-semibold">Petunjuk Level {levelId}:</div>
                    {levelId === 1 && (
                      <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-emerald-900 leading-snug">
                        Ambil <strong>Apel</strong> (x=3) lalu <strong>Kaleng</strong> (x=7). Kaleng terakhir diambil, sehingga dibuang ke <strong>Tong Kuning</strong> (x=14) lebih dulu, baru Apel ke <strong>Tong Hijau</strong> (x=13).
                      </div>
                    )}
                    {levelId === 2 && (
                      <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-amber-950 leading-snug">
                        Ambil <strong>Apel</strong> (x=3), <strong>Kaleng</strong> (x=7), lalu <strong>Baterai</strong> (x=10). Urutan buang: <strong>Baterai</strong> (Tong Merah x=15) ➔ <strong>Kaleng</strong> (Tong Kuning x=14) ➔ <strong>Apel</strong> (Tong Hijau x=13).
                      </div>
                    )}
                    {levelId === 3 && (
                      <div className="bg-rose-50 border border-rose-200 p-2 rounded-lg text-rose-950 leading-snug">
                        Kapasitas tas muat 4 sampah. Ambil Apel, Kaleng, Sayur, Baterai. Urutan buang: <strong>Baterai</strong> (Merah x=15) ➔ <strong>Sayur</strong> (Hijau x=13) ➔ <strong>Kaleng</strong> (Kuning x=14) ➔ <strong>Apel</strong> (Hijau x=13).
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Zoom controls */}
          <div className="flex flex-col gap-1">
            <button type="button" onClick={() => setZoom(prev => Math.min(3, prev * 1.2))} className={`${isMobile ? "w-6 h-6 text-xs rounded-md" : "w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-sm sm:text-lg md:text-xl rounded-lg sm:rounded-xl"} flex items-center justify-center bg-white/90 hover:bg-white border border-[#EED4B7] font-bold text-stone-700 shadow-sm cursor-pointer transition-colors`}>
              +
            </button>
            <button type="button" onClick={() => setZoom(prev => Math.max(0.3, prev / 1.2))} className={`${isMobile ? "w-6 h-6 text-xs rounded-md" : "w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-sm sm:text-lg md:text-xl rounded-lg sm:rounded-xl"} flex items-center justify-center bg-white/90 hover:bg-white border border-[#EED4B7] font-bold text-stone-700 shadow-sm cursor-pointer transition-colors`}>
              −
            </button>
            <button type="button" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} className={`${isMobile ? "w-6 h-6 text-[8px] rounded-md" : "w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-[10px] sm:text-sm md:text-base rounded-lg sm:rounded-xl"} flex items-center justify-center bg-white/90 hover:bg-white border border-[#EED4B7] font-bold text-stone-500 shadow-sm cursor-pointer transition-colors`} title="Reset zoom">
              ⟲
            </button>
            <button type="button" onClick={() => setShowBackpack(prev => !prev)} className={`${isMobile ? "w-6 h-6 rounded-md" : "w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg sm:rounded-xl"} flex items-center justify-center bg-white/90 hover:bg-white border border-[#EED4B7] shadow-sm cursor-pointer transition-colors`} title={showBackpack ? "Sembunyikan status tas" : "Tampilkan status tas"}>
              <Backpack className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} ${showBackpack ? "text-indigo-650" : "text-stone-400"}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
