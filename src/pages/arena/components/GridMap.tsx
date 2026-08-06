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
import { GridPos, TrashOnGrid, TrashCanOnGrid, ObstacleOnGrid, TrashItem, CharacterId, CommandAction } from '../../../types';

import tongOrganik from '../../../../assets/wadah-hijau.svg';
import tongAnorganik from '../../../../assets/wadah-kuning.svg';
import charOrganikWalk from '../../../../assets/char_organik_walk.webm';
import charOrganikPick from '../../../../assets/char_organik_pick.webm';
import tongB3 from '../../../../assets/wadah-merah.svg';

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
import bgGrid from '../../../../assets/bg-grid.webp';

export interface CharacterRenderData {
  id: CharacterId;
  pos: GridPos;
  facingDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  trailPositions: GridPos[];
  backpack: TrashItem[];
  backpackCapacity: number;
  activeAction?: CommandAction | null;
}

export interface ElementSetting {
  yOffset: number;   // Multiplier for vertical positioning relative to cell size
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
  // Per-Trash Item settings (by item.id: banana, apple, carrot, can, glass, cd, battery, paint, bulb)
  trashItems: Record<string, Partial<ElementSetting>>;
  // Per-Trash Can settings (by type: ORGANIC, RECYCLABLE, B3, RESIDUE)
  trashCans: Record<string, Partial<ElementSetting>>;
  // Per-Obstacle settings (by type: rock, bush, wall, water)
  obstacles: Record<string, Partial<ElementSetting>>;
} = {
  defaultCategory: {
    character: { yOffset: 0.25, sizeScale: 1.0, sizeScaleW: 1.15, sizeScaleH: 2.30 },
    trash:     { yOffset: 0.80, sizeScale: 0.45 },
    trashCan:  { yOffset: 0.50, sizeScale: 0.85 },
    obstacle:  { yOffset: 0.20, sizeScale: 0.60 },
  },

  // Specific settings per character ID
  characters: {
    ORGANIC:    { yOffset: 0.25, sizeScaleW: 1.15, sizeScaleH: 2.30 },
    RECYCLABLE: { yOffset: 0.25, sizeScaleW: 1.15, sizeScaleH: 2.30 },
    B3:         { yOffset: 0.25, sizeScaleW: 1.15, sizeScaleH: 2.30 },
  },

  // Specific settings per trash item ID
  trashItems: {
    apple:   { yOffset: 0.80, sizeScale: 0.45 },
    banana:  { yOffset: 0.80, sizeScale: 0.45 },
    carrot:  { yOffset: 0.80, sizeScale: 0.45 },
    can:     { yOffset: 0.80, sizeScale: 0.45 },
    glass:   { yOffset: 0.80, sizeScale: 0.45 },
    cd:      { yOffset: 0.80, sizeScale: 0.45 },
    battery: { yOffset: 0.80, sizeScale: 0.45 },
    paint:   { yOffset: 0.80, sizeScale: 0.45 },
    bulb:    { yOffset: 0.80, sizeScale: 0.45 },
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
    rock:  { yOffset: 0.20, sizeScale: 0.60 },
    bush:  { yOffset: 0.20, sizeScale: 0.60 },
    wall:  { yOffset: 0.20, sizeScale: 0.60 },
    water: { yOffset: 0.20, sizeScale: 0.60 },
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
}

const CHARACTER_COLORS: Record<CharacterId, { bg: string; border: string; eye: string; label: string }> = {
  ORGANIC: {
    bg: '#10B981', // emerald-500
    border: '#047857', // emerald-700
    eye: '#ffffff',
    label: 'Tukang Sampah',
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

const CHARACTER_EMOJIS: Record<CharacterId, string> = {
  ORGANIC: '🧹',
  RECYCLABLE: '🎒',
  B3: '🗑️',
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
  const chromaCanvasRef = useRef<HTMLCanvasElement | null>(null);

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

    return () => {
      walkVid.pause();
      pickVid.pause();
    };
  }, []);

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

      // Trash items
      banana: svgKulitPisang,
      carrot: svgSayur,
      apple: svgApel,
      can: svgKalengMinuman,
      glass: svgBotolAir,
      cd: svgKertasKoran,
      battery: svgBaterai,
      paint: svgKalengBesi,
      bgGrid: bgGrid,
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

    // 1. Draw Grid Background Image (assets/bg-grid.webp)
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

    // 2. Draw thin grid lines using fillRect
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    // Vertical lines
    for (let gx = 0; gx <= width; gx++) {
      const lx = Math.round(padX + gx * cellSizeVal);
      ctx.fillRect(lx, padY, 1, height * cellSizeVal);
    }
    // Horizontal lines
    for (let gy = 0; gy <= height; gy++) {
      const ly = Math.round(padY + gy * cellSizeVal);
      ctx.fillRect(padX, ly, width * cellSizeVal, 1);
    }
    ctx.restore();

    // 3. Draw column numbers (top)
    ctx.save();
    const labelFontSize = Math.max(9, Math.min(cellSizeVal * 0.28, 14));
    ctx.font = `bold ${labelFontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    for (let gx = 0; gx < width; gx++) {
      const sx = padX + gx * cellSizeVal + cellSizeVal / 2;
      const sy = padY - 4;
      ctx.fillText(`${gx}`, sx, sy);
    }
    ctx.restore();

    // 4. Draw row numbers (left)
    ctx.save();
    ctx.font = `bold ${labelFontSize}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    for (let gy = 0; gy < height; gy++) {
      const sx = padX - 4;
      const sy = padY + gy * cellSizeVal + cellSizeVal / 2;
      ctx.fillText(`${gy}`, sx, sy);
    }
    ctx.restore();

    // 5. Draw Obstacles (Placed on the floor)
    obstacles.forEach(obs => {
      const { x: cx, y: cy } = toScreen(obs.pos.x, obs.pos.y);
      const cx2 = cx + cellSizeVal / 2;
      const obsConfig = DEFAULT_ELEMENT_CONFIGS.obstacles[obs.type] || {};
      const yOffset = obsConfig.yOffset ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.obstacle.yOffset;
      const sizeScale = obsConfig.sizeScale ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.obstacle.sizeScale;
      const cy2 = cy + cellSizeVal * yOffset;

      ctx.save();
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

    // 7. Draw Trash Cans (Placed side-by-side on floor, bottom edge aligned to ground)
    trashCans.forEach(tc => {
      const { x: cx, y: cy } = toScreen(tc.pos.x, tc.pos.y);
      const cx2 = cx + cellSizeVal / 2;
      const canConfig = DEFAULT_ELEMENT_CONFIGS.trashCans[tc.type] || {};
      const yOffset = canConfig.yOffset ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.trashCan.yOffset;
      const sizeScale = canConfig.sizeScale ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.trashCan.sizeScale;
      const canSize = cellSizeVal * sizeScale;
      const cy2 = cy + cellSizeVal * yOffset; 
      const canKey = `${tc.type}_can`;
      const canImg = imagesRef.current[canKey];

      ctx.save();
      if (canImg) {
        drawImageContain(ctx, canImg, cx2, cy2, canSize, canSize);
      } else {
        ctx.font = `${Math.min(canSize * 0.6, 28)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tc.emoji, cx2, cy2);
      }
      ctx.restore();
    });

    // 8. Draw Player Characters (wrapped in try-catch to prevent errors from blocking grid lines)
    try {
      characters.forEach(c => {
        let renderX = c.pos.x;
        let renderY = c.pos.y;

        // Sync WebM animation states for character
        const walkVideo = walkVideoRef.current;
        const pickVideo = pickVideoRef.current;
        const isPicking = c.activeAction === 'PICK' || c.activeAction === 'DROP';
        const isMoving = isExecuting && (c.activeAction === 'LEFT' || c.activeAction === 'RIGHT' || c.activeAction === 'UP');

        if (walkVideo) {
          if (isMoving && !isPicking) {
            if (walkVideo.paused) walkVideo.play().catch(() => {});
          } else {
            if (!walkVideo.paused) {
              walkVideo.pause();
              walkVideo.currentTime = 0;
            }
          }
        }

        if (pickVideo) {
          if (isPicking) {
            if (pickVideo.paused && !pickVideo.ended) {
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

        // Map grid coordinates to canvas pixel coordinates
        const cx = padX + renderX * cellSizeVal + cellSizeVal / 2;
        const cy = padY + renderY * cellSizeVal + cellSizeVal / 2;

        drawCharacter(ctx, cx, cy, cellSizeVal, c);
      });
    } catch (e) {
      // Silently catch character rendering errors so grid lines still draw
    }

  }, [width, height, characters, trashItems, trashCans, obstacles, isExecuting, zoom, offset, getCellSize, imagesLoaded, offsets]);

  // Draw a single character using WebM video animation with chroma key
  const drawCharacter = (ctx: CanvasRenderingContext2D, cx: number, cy: number, cellSize: number, character: CharacterRenderData) => {
    const isPicking = character.activeAction === 'PICK' || character.activeAction === 'DROP';

    const charConfig = DEFAULT_ELEMENT_CONFIGS.characters[character.id] || {};
    const yOffset = charConfig.yOffset ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.character.yOffset;
    const scaleW = charConfig.sizeScaleW ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.character.sizeScaleW!;
    const scaleH = charConfig.sizeScaleH ?? DEFAULT_ELEMENT_CONFIGS.defaultCategory.character.sizeScaleH!;

    const rx = cx;
    const charW = cellSize * scaleW;
    const charH = cellSize * scaleH;
    const ry = cy + cellSize / 2 - charH / 2 + cellSize * yOffset;

    // Render using WebM video asset
    const activeVideo = isPicking ? pickVideoRef.current : walkVideoRef.current;
    if (activeVideo) {
      ctx.save();
      ctx.translate(rx, ry);

      // Flip character horizontally if facing left
      if (character.facingDir === 'LEFT') {
        ctx.scale(-1, 1);
      }

      drawVideoContain(ctx, activeVideo, 0, 0, charW, charH, chromaCanvasRef.current);
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

        {/* Controls Container (Help + Zoom + Backpack) */}
        <div className="absolute top-3 right-3 z-10 flex flex-row gap-1.5 items-start">
          {/* Guide / Hints Button (Only visible if callback exists) */}
          {onShowHints && (
            <button
              type="button"
              onClick={onShowHints}
              className="w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white border border-[#EED4B7] rounded-lg text-amber-955 hover:text-indigo-600 shadow-sm cursor-pointer transition-colors active:scale-95"
              title="Tampilkan Detail Misi & Petunjuk"
            >
              <HelpCircle className="w-4.5 h-4.5" />
            </button>
          )}

          {/* Zoom controls */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
              className="w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white border border-[#EED4B7] rounded-lg text-sm font-bold text-stone-700 shadow-sm cursor-pointer transition-colors"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoom(prev => Math.max(0.3, prev / 1.2))}
              className="w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white border border-[#EED4B7] rounded-lg text-sm font-bold text-stone-700 shadow-sm cursor-pointer transition-colors"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
              className="w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white border border-[#EED4B7] rounded-lg text-[10px] font-bold text-stone-500 shadow-sm cursor-pointer transition-colors"
              title="Reset zoom"
            >
              ⟲
            </button>
            <button
              type="button"
              onClick={() => setShowBackpack(prev => !prev)}
              className="w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white border border-[#EED4B7] rounded-lg shadow-sm cursor-pointer transition-colors"
              title={showBackpack ? "Sembunyikan status tas" : "Tampilkan status tas"}
            >
              <Backpack className={`w-4 h-4 ${showBackpack ? 'text-indigo-650' : 'text-stone-400'}`} />
            </button>
          </div>
        </div>



        {/* Multi-character Backpack overlay */}
        {showBackpack && (
          <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-sm border border-[#EED4B7] rounded-xl px-3 py-2 shadow-lg" id="backpack-overlay">
            {characters.map(c => {
              const colors = CHARACTER_COLORS[c.id];
              return (
                <div key={c.id} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: colors.bg }}
                  />
                  <span className="text-xs">{CHARACTER_EMOJIS[c.id]}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: c.backpackCapacity }, (_, i) => {
                      const item = c.backpack[i];
                      return item ? (
                        item.image ? (
                          <img key={item.id} src={item.image} alt={item.name} className="w-3.5 h-3.5 object-contain" />
                        ) : (
                          <span key={item.id} className="text-xs">{item.emoji}</span>
                        )
                      ) : (
                        <span key={`empty-${c.id}-${i}`} className="w-3 h-3 rounded border border-dashed border-[#EED4B7] bg-[#FEF8F0]"></span>
                      );
                    })}
                  </div>
                  <span className={`text-[8px] font-mono font-bold ${c.backpack.length === 0 ? 'text-stone-400' : ''}`} style={{ color: c.backpack.length > 0 ? colors.border : undefined }}>
                    {c.backpack.length}/{c.backpackCapacity}
                  </span>
                </div>
              );
            })}
            {characters.length > 1 && totalBackpack > 0 && (
              <div className="text-[8px] text-stone-500 font-mono text-right border-t border-[#EED4B7]/50 pt-1 mt-0.5">
                Total: {totalBackpack}/{totalCapacity}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
