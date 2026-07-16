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

// Import character assets
import charOrganik from '../../../../assets/hijau-angkat.svg';
import charOrganikAmbil from '../../../../assets/hijau-ambil.svg';
import charAnorganik from '../../../../assets/kuning-angkat.svg';
import charAnorganikAmbil from '../../../../assets/kuning-ambil.svg';
import charB3 from '../../../../assets/merah-angkat.svg';
import charB3Ambil from '../../../../assets/merah-ambil.svg';

// Import trash can assets
import tongOrganik from '../../../../assets/wadah-hijau.svg';
import tongAnorganik from '../../../../assets/wadah-kuning.svg';
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

export interface CharacterRenderData {
  id: CharacterId;
  pos: GridPos;
  facingDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  trailPositions: GridPos[];
  backpack: TrashItem[];
  backpackCapacity: number;
  activeAction?: CommandAction | null;
}

interface GridMapProps {
  width: number;
  height: number;
  characters: CharacterRenderData[];
  trashItems: TrashOnGrid[];
  trashCans: TrashCanOnGrid[];
  obstacles: ObstacleOnGrid[];
  isExecuting: boolean;
  onShowHints?: () => void;
}

const CHARACTER_COLORS: Record<CharacterId, { bg: string; border: string; eye: string; label: string }> = {
  ORGANIC: {
    bg: '#10B981', // emerald-500
    border: '#047857', // emerald-700
    eye: '#ffffff',
    label: 'Robot Pemilah',
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

export default function GridMap({
  width,
  height,
  characters,
  trashItems,
  trashCans,
  obstacles,
  isExecuting,
  onShowHints,
}: GridMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Zoom & pan state
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetAtDragStart = useRef({ x: 0, y: 0 });

  // Tooltip state
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  // Backpack overlay visibility state
  const [showBackpack, setShowBackpack] = useState(true);

  // Preload images
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});

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
      ORGANIC_idle: charOrganik,
      ORGANIC_pick: charOrganikAmbil,
      RECYCLABLE_idle: charAnorganik,
      RECYCLABLE_pick: charAnorganikAmbil,
      B3_idle: charB3,
      B3_pick: charB3Ambil,
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
      bulb: svgLampu,
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

    // Draw Grid Cells
    for (let gy = 0; gy < height; gy++) {
      for (let gx = 0; gx < width; gx++) {
        const cellW = cellSizeVal;
        const cellH = cellSizeVal;
        const gap = 0;
        const { x: cx, y: cy } = toScreen(gx, gy);

        const characterHere = characters.find(c => c.pos.x === gx && c.pos.y === gy);
        const hasCan = findTrashCan(gx, gy);
        const hasObs = findObstacle(gx, gy);

        // Cell background — prioritize character > can > trash > obstacle
        const hasTrashHere = findTrash(gx, gy);
        let bg = COLORS.cellBg;
        let border = COLORS.cellBorder;

        if (characterHere) { bg = COLORS.cellActive; border = COLORS.cellActiveBorder; }
        else if (hasCan) {
          const c = TRASH_TYPE_COLORS[hasCan.type] ?? { bg: COLORS.cellCan, border: COLORS.cellBorder };
          bg = c.bg; border = c.border;
        }
        else if (hasTrashHere) {
          const c = TRASH_TYPE_COLORS[hasTrashHere.item.type] ?? { bg: COLORS.cellBg, border: COLORS.cellBorder };
          bg = c.bg; border = c.border;
        }
        else if (hasObs) { bg = COLORS.cellObstacle; border = COLORS.cellBorder; }

        ctx.fillStyle = bg;
        ctx.strokeStyle = border;
        ctx.lineWidth = 1;
        const r = 6;
        const rx = cx + gap / 2;
        const ry = cy + gap / 2;
        const rw = cellW - gap;
        const rh = cellH - gap;

        // Rounded rect
        ctx.beginPath();
        roundRectPath(ctx, rx, ry, rw, rh, r);
        ctx.fill();
        ctx.stroke();

        // Grid coordinate label (top-left corner of cell)
        if (cellSizeVal >= 28) {
          const coordFontSize = Math.max(7, Math.min(cellSizeVal * 0.18, 13));
          const coordPad = 3;
          ctx.save();
          ctx.font = `${coordFontSize}px monospace`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillStyle = characterHere
            ? 'rgba(180,120,0,0.55)'
            : hasCan
            ? (TRASH_TYPE_COLORS[hasCan.type]?.coord ?? 'rgba(16,100,60,0.40)')
            : hasTrashHere
            ? (TRASH_TYPE_COLORS[hasTrashHere.item.type]?.coord ?? 'rgba(160,130,100,0.45)')
            : 'rgba(160,130,100,0.45)';
          ctx.fillText(`${gx},${gy}`, rx + coordPad + 1, ry + coordPad);
          ctx.restore();
        }

        const cx2 = cx + cellW / 2;
        const cy2 = cy + cellH / 2;

        // Trail dot (only if no character/can/obstacle is here)
        if (!characterHere && !hasCan && !hasObs) {
          const trailCharacters = getTrailCharacters(gx, gy);
          if (trailCharacters.length > 0) {
            // Draw trail as small colored dots
            trailCharacters.forEach((_, idx) => {
              const offsetX = (idx - (trailCharacters.length - 1) / 2) * 6;
              ctx.beginPath();
              ctx.arc(cx2 + offsetX, cy2, 3, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
              ctx.fill();
            });
          }
        }

        // Obstacle emoji
        if (hasObs) {
          ctx.font = `${Math.min(cellSizeVal * 0.55, 28)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(hasObs.emoji, cx2, cy2);
        }

        // Trash item (only if no character is standing here)
        if (hasTrashHere && !characterHere) {
          const trashImg = imagesRef.current[hasTrashHere.item.id];
          if (trashImg) {
            const trashSize = cellSizeVal * 0.65;
            drawImageContain(ctx, trashImg, cx2, cy2, trashSize, trashSize);
          } else {
            ctx.font = `${Math.min(cellSizeVal * 0.5, 24)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(hasTrashHere.item.emoji, cx2, cy2);
          }
        }

        // Trash can
        if (hasCan) {
          const canKey = `${hasCan.type}_can`;
          const canImg = imagesRef.current[canKey];
          if (canImg) {
            const canSize = cellSizeVal * 0.7;
            drawImageContain(ctx, canImg, cx2, cy2 - cellSizeVal * 0.04, canSize, canSize);
          } else {
            ctx.font = `${Math.min(cellSizeVal * 0.45, 24)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(hasCan.emoji, cx2, cy2 - cellSizeVal * 0.08);
          }




          // Character overlap glow — for any character standing on the can
          characters.forEach(c => {
            if (c.pos.x === gx && c.pos.y === gy) {
              const colors = CHARACTER_COLORS[c.id];
              ctx.beginPath();
              ctx.arc(cx2, cy2, cellW * 0.4, 0, Math.PI * 2);
              ctx.strokeStyle = hexToRgba(colors.bg, 0.35);
              ctx.lineWidth = 3;
              ctx.setLineDash([4, 4]);
              ctx.stroke();
              ctx.setLineDash([]);
            }
          });
        }

        // Player characters
        characters.forEach(c => {
          if (c.pos.x === gx && c.pos.y === gy) {
            drawCharacter(ctx, cx2, cy2, cellSizeVal, c);
          }
        });
      }
    }
  }, [width, height, characters, trashItems, trashCans, obstacles, isExecuting, zoom, offset, getCellSize, imagesLoaded]);

  // Draw a single character with its WebP asset or vector fallback
  const drawCharacter = (ctx: CanvasRenderingContext2D, cx: number, cy: number, cellSize: number, character: CharacterRenderData) => {
    const isPicking = character.activeAction === 'PICK' || character.activeAction === 'DROP';
    const characterKey = `${character.id}_${isPicking ? 'pick' : 'idle'}`;
    const characterImg = imagesRef.current[characterKey];

    const rx = cx;
    const ry = cy;

    if (characterImg) {
      ctx.save();
      ctx.translate(rx, ry);

      // SVG asset drawing with contain (preserves aspect ratio)
      const rSize = Math.min(cellSize * 0.85, 56);
      drawImageContain(ctx, characterImg, 0, 0, rSize, rSize);
      ctx.restore();
    } else {
      const colors = CHARACTER_COLORS[character.id];
      const characterSize = Math.min(cellSize * 0.55, 34);
      // Fallback: Vector cleaner avatar (S = Sapu, K = Kantong, T = Tong)
      ctx.save();
      ctx.translate(rx, ry);

      // Body circle
      ctx.fillStyle = colors.bg;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, characterSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Initial letter on fallback avatar
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${characterSize * 0.5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initial = character.id === 'ORGANIC' ? 'S' : character.id === 'RECYCLABLE' ? 'K' : 'T';
      ctx.fillText(initial, 0, 0);

      ctx.restore();
    }
  };

  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
  });

  useEffect(() => {
    drawRef.current();
  }, [draw]);

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

    if (gx >= 0 && gx < width && gy >= 0 && gy < height) {
      const characterHere = characters.find(c => c.pos.x === gx && c.pos.y === gy);
      const hasTrash = trashItems.find(t => t.pos.x === gx && t.pos.y === gy && !t.collected);
      const hasCan = trashCans.find(tc => tc.pos.x === gx && tc.pos.y === gy);
      const hasObs = obstacles.find(o => o.pos.x === gx && o.pos.y === gy);

      if (characterHere || hasTrash || hasCan || hasObs) {
        let text = '';
        if (characterHere) text = `(${gx}, ${gy})`;
        else if (hasTrash) text = `${hasTrash.item.name} — ${hasTrash.item.emoji}`;
        else if (hasCan) text = `Tong ${hasCan.label} ${hasCan.emoji}`;
        else if (hasObs) {
          const obsLabel = hasObs.type === 'rock' ? 'Batu' : hasObs.type === 'water' ? 'Air' : hasObs.type === 'bush' ? 'Semak' : hasObs.type === 'wall' ? 'Dinding' : hasObs.type;
          text = `${obsLabel} ${hasObs.emoji}`;
        }

        // Position tooltip below cursor with safe bounds
        const tx = Math.min(e.clientX - rect.left + 12, rect.width - 160);
        const ty = Math.min(e.clientY - rect.top + 20, rect.height - 32);
        setTooltip({ text, x: tx, y: ty });
      } else {
        setTooltip(null);
      }
    } else {
      setTooltip(null);
    }
  }, [width, height, offset, zoom, characters, trashItems, trashCans, obstacles, getCellSize]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
    setTooltip(null);
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
    <div className="flex flex-col bg-white border border-[#EED4B7] rounded-2xl sm:rounded-3xl p-1 lg:p-6 shadow-xl h-full select-none" id="grid-map-container">
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden rounded-2xl border border-[#EED4B7]/80"
        style={{ minHeight: 280, cursor: isDragging.current ? 'grabbing' : 'default' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-full"
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

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-20 px-2.5 py-1.5 bg-gray-900/90 text-white text-[11px] font-mono rounded-lg pointer-events-none whitespace-nowrap shadow-lg"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.text}
          </div>
        )}

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
