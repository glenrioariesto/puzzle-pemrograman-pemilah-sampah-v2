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
import { Backpack, HelpCircle } from 'lucide-react';
import { GridPos, TrashOnGrid, TrashCanOnGrid, ObstacleOnGrid, TrashItem, CharacterId, CommandAction, TrashType } from '../../../types';

import tongOrganik from '../../../../assets/Wadah Sampah Hijau.webp';
import tongAnorganik from '../../../../assets/Wadah Sampah Kuning.webp';
import tongB3 from '../../../../assets/Wadah Sampah Merah.webp';

// WebM assets for trash can buang (DROP) animation
import canOrganikWebm from '../../../../assets/wadah_sampah_hijau.webm';
import canAnorganikWebm from '../../../../assets/wadah_sampah_kuning.webm';
import canB3Webm from '../../../../assets/wadah_sampah_merah.webm';

import charOrganikWalk from '../../../../assets/char_organik_walk.webm';
import charOrganikPick from '../../../../assets/char_organik_pick.webm';
import charOrganikBuangWebm from '../../../../assets/char_organik_buang.webm';
import charOrganikBuangMp4 from '../../../../assets/char_organik_buang.mp4';

// Import trash item SVG assets
import svgApel from '../../../../assets/apel.svg';
import svgBaterai from '../../../../assets/baterai.svg';
import svgBotolAir from '../../../../assets/botol-air.svg';
import svgKalengBesi from '../../../../assets/kaleng-besi.svg';
import svgKalengMinuman from '../../../../assets/kaleng-minuman.svg';
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
    character: { yOffset: 0.25, sizeScale: 1.0, sizeScaleW: 1.15, sizeScaleH: 2.30 },
    trash:     { yOffset: 0.80, sizeScale: 0.45 },
    trashCan:  { yOffset: 0.50, sizeScale: 0.85 },
    obstacle:  { yOffset: 0.50, xOffset: 0, sizeScale: 1.20 },
  },

  // Specific settings per character ID
  characters: {
    ORGANIC:    { yOffset: 0.25, sizeScaleW: 1.15, sizeScaleH: 2.30 },
    RECYCLABLE: { yOffset: 0.25, sizeScaleW: 1.15, sizeScaleH: 2.30 },
    B3:         { yOffset: 0.25, sizeScaleW: 1.15, sizeScaleH: 2.30 },
  },

  // Specific settings per trash item ID
  trashItems: {
    apple:     { yOffset: 0.80, sizeScale: 0.45 },
    banana:    { yOffset: 0.80, sizeScale: 0.45 },
    sayur:     { yOffset: 0.80, sizeScale: 0.45 },
    can:       { yOffset: 0.80, sizeScale: 0.45 },
    botolAir:  { yOffset: 0.80, sizeScale: 0.45 },
    kertasKoran: { yOffset: 0.80, sizeScale: 0.45 },
    battery:   { yOffset: 0.80, sizeScale: 0.45 },
    kalengBesi: { yOffset: 0.80, sizeScale: 0.45 },
    bulb:      { yOffset: 0.80, sizeScale: 0.45 },
  },

  // Specific settings per trash can type
  trashCans: {
    ORGANIC:    { yOffset: 0.50, sizeScale: 0.85 },
    RECYCLABLE: { yOffset: 0.50, sizeScale: 0.85 },
    B3:         { yOffset: 0.50, sizeScale: 0.85 },
    RESIDUE:    { yOffset: 0.50, sizeScale: 0.85 },
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
}

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

// Draw video with object-fit: contain (centered, aspect-ratio preserved) and chroma key green screen removal
function drawVideoContain(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  cx: number,
  cy: number,
  maxW: number,
  maxH: number,
  chromaCanvas: HTMLCanvasElement | null
) {
  const naturalW = video.videoWidth  || maxW;
  const naturalH = video.videoHeight || maxH;
  // Guard: skip if dimensions are invalid (video not ready)
  if (naturalW <= 0 || naturalH <= 0) return;
  const ratio = Math.min(maxW / naturalW, maxH / naturalH);
  const dw = naturalW * ratio;
  const dh = naturalH * ratio;

  if (chromaCanvas) {
    const cCtx = chromaCanvas.getContext('2d');
    if (cCtx) {
      // Set offscreen canvas size to match natural video size for high quality keying
      if (chromaCanvas.width !== naturalW || chromaCanvas.height !== naturalH) {
        chromaCanvas.width = naturalW;
        chromaCanvas.height = naturalH;
      }
      
      // Draw raw frame
      cCtx.drawImage(video, 0, 0, naturalW, naturalH);
      
      // Perform chroma key pixel filter to remove blue background
      const imgData = cCtx.getImageData(0, 0, naturalW, naturalH);
      const data = imgData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Blue chroma key filter: Blue must be dominant
        if (b > 80 && b > r * 1.25 && b > g * 1.25) {
          data[i + 3] = 0; // Set opacity to 0 (make transparent)
        }
      }
      
      cCtx.putImageData(imgData, 0, 0);
      
      // Draw key-filtered offscreen canvas frame onto main canvas
      ctx.drawImage(chromaCanvas, cx - dw / 2, cy - dh / 2, dw, dh);
      return;
    }
  }

  // Fallback to raw drawing if offscreen canvas fails
  ctx.drawImage(video, cx - dw / 2, cy - dh / 2, dw, dh);
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

  // Custom vertical offset & size scale adjustments
  const [offsets] = useState({
    ...DEFAULT_ELEMENT_OFFSETS,
    ...customOffsets,
  });

  // Preload images
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});

  // WebM animation refs for the green robot
  const walkVideoRef = useRef<HTMLVideoElement | null>(null);
  const pickVideoRef = useRef<HTMLVideoElement | null>(null);
  const dropVideoRef = useRef<HTMLVideoElement | null>(null);
  const chromaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Video refs for trash can buang (DROP) animations
  const canVideosRef = useRef<Record<string, HTMLVideoElement | null>>({
    ORGANIC: null,
    RECYCLABLE: null,
    B3: null,
  });

  if (!chromaCanvasRef.current && typeof document !== 'undefined') {
    chromaCanvasRef.current = document.createElement('canvas');
  }

  useEffect(() => {
    const walkVid = document.createElement('video');
    walkVid.src = charOrganikWalk;
    walkVid.loop = true;
    walkVid.muted = true;
    walkVid.playsInline = true;
    walkVid.setAttribute('webkit-playsinline', 'true');
    walkVid.preload = 'auto';
    // Seek to the first frame once data is ready so idle character is visible
    walkVid.addEventListener('loadeddata', () => {
      walkVid.currentTime = 0;
    });
    walkVid.load();
    walkVideoRef.current = walkVid;

    const pickVid = document.createElement('video');
    pickVid.src = charOrganikPick;
    pickVid.loop = false;
    pickVid.muted = true;
    pickVid.playsInline = true;
    pickVid.setAttribute('webkit-playsinline', 'true');
    pickVid.preload = 'auto';
    pickVid.load();
    pickVideoRef.current = pickVid;

    const dropVid = document.createElement('video');
    dropVid.loop = false;
    dropVid.muted = true;
    dropVid.playsInline = true;
    dropVid.setAttribute('webkit-playsinline', 'true');
    dropVid.preload = 'auto';

    const sDropWebm = document.createElement('source');
    sDropWebm.src = charOrganikBuangWebm;
    sDropWebm.type = 'video/webm';
    dropVid.appendChild(sDropWebm);

    const sDropMp4 = document.createElement('source');
    sDropMp4.src = charOrganikBuangMp4;
    sDropMp4.type = 'video/mp4';
    dropVid.appendChild(sDropMp4);

    dropVid.load();
    dropVideoRef.current = dropVid;

    // Create trash can drop animation videos (WebM only)
    const createCanVideo = (webmSrc: string) => {
      const vid = document.createElement('video');
      vid.loop = false;
      vid.muted = true;
      vid.playsInline = true;
      vid.setAttribute('webkit-playsinline', 'true');
      vid.preload = 'auto';

      const sWebm = document.createElement('source');
      sWebm.src = webmSrc;
      sWebm.type = 'video/webm';
      vid.appendChild(sWebm);

      vid.load();
      return vid;
    };

    const orgVid = createCanVideo(canOrganikWebm);
    const recVid = createCanVideo(canAnorganikWebm);
    const b3Vid = createCanVideo(canB3Webm);

    canVideosRef.current = {
      ORGANIC: orgVid,
      RECYCLABLE: recVid,
      B3: b3Vid,
    };

    return () => {
      walkVid.pause();
      pickVid.pause();
      dropVid.pause();
      orgVid.pause();
      recVid.pause();
      b3Vid.pause();
    };
  }, []);

  // Track active instruction and dumping can across execution frames
  const lastActiveInstructionIdRef = useRef<string | null>(null);
  const lastActiveDumpingCanTypeRef = useRef<TrashType | null>(null);

  // Reset all videos whenever execution stops or resets
  useEffect(() => {
    if (!isExecuting) {
      if (walkVideoRef.current) {
        walkVideoRef.current.pause();
        walkVideoRef.current.currentTime = 0;
      }
      if (pickVideoRef.current) {
        pickVideoRef.current.pause();
        pickVideoRef.current.currentTime = 0;
      }
      if (dropVideoRef.current) {
        dropVideoRef.current.pause();
        dropVideoRef.current.currentTime = 0;
      }
      Object.values(canVideosRef.current).forEach(v => {
        if (v) {
          v.pause();
          v.currentTime = 0;
        }
      });
      lastActiveInstructionIdRef.current = null;
      lastActiveDumpingCanTypeRef.current = null;
    }
  }, [isExecuting]);

  // Keep track of the last horizontal direction of each character to prevent vertical flipping
  const lastHorizontalDirsRef = useRef<Record<CharacterId, 'LEFT' | 'RIGHT'>>({
    ORGANIC: 'RIGHT',
    RECYCLABLE: 'RIGHT',
    B3: 'RIGHT',
  });

  // Track container dimensions reactively to avoid layout thrashing
  const containerSizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const sources: Record<string, string> = {
      ORGANIC_can: tongOrganik,
      RECYCLABLE_can: tongAnorganik,
      B3_can: tongB3,

      // Trash items (keyed by the exact item.id used in levels.ts TRASH_ITEMS)
      banana: svgKulitPisang,
      sayur: svgSayur,
      apple: svgApel,
      can: svgKalengMinuman,
      botolAir: svgBotolAir,
      kertasKoran: svgKertasKoran,
      battery: svgBaterai,
      kalengBesi: svgKalengBesi,
      bulb: svgLampu,
      bgGrid: bgGrid,

      // Rock & Wall grid assets
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

    let loadedCount = 0;
    const entries = Object.entries(sources);
    
    entries.forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imagesRef.current[key] = img;
        loadedCount++;
        if (loadedCount === entries.length) {
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        console.error('Failed to load image:', src);
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
        ctx.font = `${Math.min(trashSize * 0.8, 20)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.item.emoji, cx2, cy2);
      }
      ctx.restore();
    });

    // Check if active instruction or active dumping can changed
    const currentActiveInstructionId = characters.find(c => c.activeInstructionId)?.activeInstructionId || null;
    const isNewInstruction = isExecuting && currentActiveInstructionId !== lastActiveInstructionIdRef.current;
    if (isExecuting && isNewInstruction) {
      lastActiveInstructionIdRef.current = currentActiveInstructionId;
    }

    // 7. Draw Player Characters (drawn behind trash cans)
    try {
      characters.forEach(c => {
        let renderX = c.pos.x;
        let renderY = c.pos.y;

        // Sync WebM animation states for character
        const walkVideo = walkVideoRef.current;
        const pickVideo = pickVideoRef.current;
        const dropVideo = dropVideoRef.current;
        const isPicking = isExecuting && c.activeAction === 'PICK';
        const isDropping = isExecuting && c.activeAction === 'DROP';
        const isActing = isPicking || isDropping;

        if (walkVideo) {
          if (isExecuting && !isActing) {
            if (walkVideo.paused) {
              walkVideo.play().catch(() => {});
            }
          } else {
            if (!walkVideo.paused) {
              walkVideo.pause();
            }
            if (!isExecuting) {
              walkVideo.currentTime = 0;
            }
          }
        }

        if (pickVideo) {
          if (isPicking) {
            if (isNewInstruction) {
              pickVideo.currentTime = 0;
              pickVideo.play().catch(() => {});
            }
          } else {
            if (!pickVideo.paused) {
              pickVideo.pause();
            }
            pickVideo.currentTime = 0;
          }
        }

        if (dropVideo) {
          if (isDropping) {
            if (isNewInstruction) {
              dropVideo.currentTime = 0;
              dropVideo.play().catch(() => {});
            }
          } else {
            if (!dropVideo.paused) {
              dropVideo.pause();
            }
            dropVideo.currentTime = 0;
          }
        }

        // Map grid coordinates to canvas pixel coordinates
        const cx = padX + renderX * cellSizeVal + cellSizeVal / 2;
        const cy = padY + renderY * cellSizeVal + cellSizeVal / 2;

        drawCharacter(ctx, cx, cy, cellSizeVal, c);
      });
    } catch (e) {
      // Silently catch character rendering errors so grid lines still draw
    }

    // 8. Draw Trash Cans (Placed side-by-side on floor, drawn in front of characters / higher z-index)
    // Determine the SINGLE active trash can receiving the DROP action
    // Only ONE trash can video may run at any time across the entire grid
    let activeDumpingCanType: TrashType | null = null;
    let minDumpingDistance = Infinity;

    if (isExecuting) {
      const droppingCharacters = characters.filter(c => c.activeAction === 'DROP');
      if (droppingCharacters.length > 0) {
        const activeChar = droppingCharacters[0];
        trashCans.forEach(tc => {
          const dx = Math.abs(tc.pos.x - activeChar.pos.x);
          const dy = Math.abs(tc.pos.y - activeChar.pos.y);
          const dist = Math.hypot(dx, dy);

          // Maximum reach tolerance to prevent false triggers across neighboring bins (bins are spaced by 1.0 unit)
          if (dx <= 0.65 && dy <= 1.0 && dist < minDumpingDistance) {
            minDumpingDistance = dist;
            activeDumpingCanType = tc.type;
          }
        });
      }
    }

    const isCanTargetChanged = activeDumpingCanType !== lastActiveDumpingCanTypeRef.current;
    if (isCanTargetChanged) {
      lastActiveDumpingCanTypeRef.current = activeDumpingCanType;
    }

    trashCans.forEach(tc => {
      const { x: cx, y: cy } = toScreen(tc.pos.x, tc.pos.y);
      const cx2 = cx + cellSizeVal / 2;
      const canConfig = DEFAULT_ELEMENT_CONFIGS.trashCans[tc.type] || {};
      const yOffset = canConfig.yOffset ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.trashCan.yOffset;
      const sizeScale = canConfig.sizeScale ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.trashCan.sizeScale;
      const canSize = cellSizeVal * sizeScale;
      const cy2 = cy + cellSizeVal * yOffset; 

      // Strict single-can check: ONLY the single closest can to the dropping character plays
      const isDumping = tc.type === activeDumpingCanType;
      const canVid = canVideosRef.current[tc.type];

      ctx.save();
      if (isDumping && canVid) {
        if (isNewInstruction || isCanTargetChanged) {
          canVid.currentTime = 0;
          canVid.play().catch(() => {});
        }

        // Draw animated dumping video scaled and aligned to match the WebP asset exactly
        const vidW = canSize * (320 / 359) * (181 / 163);
        const vidH = vidW * (295 / 181);
        const vidX = cx2 - vidW / 2;
        const vidY = (cy2 + canSize / 2) - (286 / 295) * vidH;

        ctx.drawImage(canVid, vidX, vidY, vidW, vidH);
      } else {
        if (canVid && !canVid.paused) {
          canVid.pause();
          canVid.currentTime = 0;
        }
        const canKey = `${tc.type}_can`;
        const canImg = imagesRef.current[canKey];
        if (canImg) {
          drawImageContain(ctx, canImg, cx2, cy2, canSize, canSize);
        } else {
          ctx.font = `${Math.min(canSize * 0.6, 28)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tc.emoji, cx2, cy2);
        }
      }
      ctx.restore();
    });

  }, [width, height, characters, trashItems, trashCans, obstacles, isExecuting, zoom, offset, getCellSize, imagesLoaded, offsets]);

  // Draw a single character using WebM video animation with chroma key
  const drawCharacter = (ctx: CanvasRenderingContext2D, cx: number, cy: number, cellSize: number, character: CharacterRenderData) => {
    const isPicking = character.activeAction === 'PICK';
    const isDropping = character.activeAction === 'DROP';

    const charConfig = DEFAULT_ELEMENT_CONFIGS.characters[character.id] || {};
    const yOffset = charConfig.yOffset ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.character.yOffset;
    const scaleW = charConfig.sizeScaleW ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.character.sizeScaleW!;
    const scaleH = charConfig.sizeScaleH ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.character.sizeScaleH!;

    const rx = cx;
    const charW = cellSize * scaleW;
    const charH = cellSize * scaleH;
    const ry = cy + cellSize / 2 - charH / 2 + cellSize * yOffset;

    // Select active video: drop video for DROP, pick video for PICK, walk video otherwise
    let activeVideo = walkVideoRef.current;
    let activeCharW = charW;
    let activeCharH = charH;
    let activeRy = ry;

    if (isDropping) {
      activeVideo = dropVideoRef.current || pickVideoRef.current;
    } else if (isPicking) {
      activeVideo = pickVideoRef.current;
      // Scale pick animation to match walk and buang state (~96%)
      const pickScale = 0.96;
      activeCharW = charW * pickScale;
      activeCharH = charH * pickScale;
      // Align feet to ground so character doesn't float
      activeRy = ry + (charH - activeCharH) / 2;
    }

    if (activeVideo) {
      ctx.save();
      ctx.translate(rx, activeRy);

      // Flip character horizontally if facing left
      if (character.facingDir === 'LEFT') {
        ctx.scale(-1, 1);
      }

      drawVideoContain(ctx, activeVideo, 0, 0, activeCharW, activeCharH, chromaCanvasRef.current);
      ctx.restore();
    }
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

    const gx = Math.floor((mx - padX) / cellSizeVal);
    const gy = Math.floor((my - padY) / cellSizeVal);


  }, [width, height, offset, zoom, characters, trashItems, trashCans, obstacles, getCellSize]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
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
    <div className="flex flex-col bg-white border border-[#EED4B7] rounded-2xl sm:rounded-3xl p-0 shadow-xl h-full select-none" id="grid-map-container">
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden rounded-2xl border border-[#EED4B7]/80"
        style={{ minHeight: 120, cursor: isDragging.current ? 'grabbing' : 'default' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <canvas
          ref={canvasRef}
          className="block w-full bg-[#6DCC7E] h-full"
        />

        {/* Level Badge — Pojok Kiri */}
        <div
          id="level-badge"
          className="absolute top-3 left-3 z-10 h-8 sm:h-10 md:h-11 flex items-center justify-center bg-[#0192D5] border border-[#017bb3] rounded-lg sm:rounded-xl px-3 sm:px-4 text-white font-extrabold text-xs sm:text-sm md:text-base lg:text-lg font-sans tracking-wide shadow-sm select-none"
        >
          Level {levelId}
        </div>

        {/* Controls Container (Backpack Overlay + Help + Zoom) */}
        <div className="absolute top-3 right-3 z-10 flex flex-row gap-1.5 sm:gap-2 items-start">
          {/* Multi-character Backpack overlay — Disamping kiri tombol Tampilkan Detail Misi & Petunjuk, ukuran h-8 */}
          {showBackpack && (
            <div
              id="backpack-overlay"
              className="h-8 sm:h-10 md:h-11 flex items-center gap-1.5 sm:gap-2 bg-white/95 backdrop-blur-md border border-[#EED4B7] rounded-lg sm:rounded-xl px-2 sm:px-3 shadow-sm select-none flex-shrink-0"
            >
              {characters.map(c => {
                const colors = CHARACTER_COLORS[c.id];
                return (
                  <div key={c.id} className="flex items-center gap-1 sm:gap-1.5">
                    <Backpack className="w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 text-indigo-600" />
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      {Array.from({ length: c.backpackCapacity }, (_, i) => {
                        const item = c.backpack[i];
                        return item ? (
                          item.image ? (
                            <img
                              key={item.id}
                              src={item.image}
                              alt={item.name}
                              className="w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 object-contain drop-shadow-xs"
                            />
                          ) : (
                            <span key={item.id} className="text-xs sm:text-base leading-none">{item.emoji}</span>
                          )
                        ) : (
                          <span
                            key={`empty-${c.id}-${i}`}
                            className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 rounded-xs border border-dashed border-[#EED4B7] bg-[#FEF8F0]"
                          />
                        );
                      })}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs md:text-sm font-mono font-black ${c.backpack.length === 0 ? 'text-stone-400' : ''}`}
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

          {/* Guide / Hints Button (Only visible if callback exists) */}
          {onShowHints && (
            <button
              type="button"
              onClick={onShowHints}
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center bg-white/90 hover:bg-white border border-[#EED4B7] rounded-lg sm:rounded-xl text-amber-955 hover:text-indigo-600 shadow-sm cursor-pointer transition-colors active:scale-95 flex-shrink-0"
              title="Tampilkan Detail Misi & Petunjuk"
            >
              <HelpCircle className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
            </button>
          )}

          {/* Zoom controls */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center bg-white/90 hover:bg-white border border-[#EED4B7] rounded-lg sm:rounded-xl text-sm sm:text-lg md:text-xl font-bold text-stone-700 shadow-sm cursor-pointer transition-colors"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoom(prev => Math.max(0.3, prev / 1.2))}
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center bg-white/90 hover:bg-white border border-[#EED4B7] rounded-lg sm:rounded-xl text-sm sm:text-lg md:text-xl font-bold text-stone-700 shadow-sm cursor-pointer transition-colors"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center bg-white/90 hover:bg-white border border-[#EED4B7] rounded-lg sm:rounded-xl text-[10px] sm:text-sm md:text-base font-bold text-stone-500 shadow-sm cursor-pointer transition-colors"
              title="Reset zoom"
            >
              ⟲
            </button>
            <button
              type="button"
              onClick={() => setShowBackpack(prev => !prev)}
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center bg-white/90 hover:bg-white border border-[#EED4B7] rounded-lg sm:rounded-xl shadow-sm cursor-pointer transition-colors"
              title={showBackpack ? "Sembunyikan status tas" : "Tampilkan status tas"}
            >
              <Backpack className={`w-4 h-4 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 ${showBackpack ? 'text-indigo-650' : 'text-stone-400'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
