/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameLevel, TrashItem, Character } from './types';

// Import trash item SVG assets
import svgApel from '../assets/apel.svg';
import svgBaterai from '../assets/baterai.svg';
import svgBotolAir from '../assets/botol-air.svg';
import svgKalengBesi from '../assets/kaleng-besi.svg';
import svgKalengMinuman from '../assets/kaleng-minuman.svg';
import svgKertasKoran from '../assets/kertas-koran.svg';
import svgKulitPisang from '../assets/kulit-pisang.svg';
import svgLampu from '../assets/lampu.svg';
import svgSayur from '../assets/sayur.svg';

export const TRASH_ITEMS: { [key: string]: TrashItem } = {
  banana:  { id: 'banana',  name: 'Kulit Pisang',   type: 'ORGANIC',    emoji: '🍌', color: 'text-emerald-500', image: svgKulitPisang },
  carrot:  { id: 'carrot',  name: 'Wortel Busuk',   type: 'ORGANIC',    emoji: '🥕', color: 'text-emerald-500', image: svgSayur },
  apple:   { id: 'apple',   name: 'Sisa Apel',      type: 'ORGANIC',    emoji: '🍎', color: 'text-emerald-500', image: svgApel },
  can:     { id: 'can',     name: 'Kaleng Soda',    type: 'RECYCLABLE', emoji: '🥤', color: 'text-amber-500',   image: svgKalengMinuman },
  glass:   { id: 'glass',   name: 'Botol Kaca',     type: 'RECYCLABLE', emoji: '🍾', color: 'text-amber-500',   image: svgBotolAir },
  cd:      { id: 'cd',      name: 'Kaset CD Bekas', type: 'RECYCLABLE', emoji: '📀', color: 'text-amber-500',   image: svgKertasKoran },
  battery: { id: 'battery', name: 'Baterai Bekas',  type: 'B3',         emoji: '🔋', color: 'text-red-500',     image: svgBaterai },
  paint:   { id: 'paint',   name: 'Kaleng Cat',     type: 'B3',         emoji: '🎨', color: 'text-red-500',     image: svgKalengBesi },
  bulb:    { id: 'bulb',    name: 'Bohlam Lampu',   type: 'B3',         emoji: '💡', color: 'text-red-500',     image: svgLampu },
};

// ─── Fixed layout — identical across ALL levels ───────────────────────────────
// Only 1 Character: Tukang Sampah starting at x=0, y=3
const FIXED_CHARACTERS: Character[] = [
  { id: 'ORGANIC', name: 'Tukang Sampah', color: 'bg-indigo-650', borderColor: 'border-indigo-800', startPos: { x: 0, y: 3 } },
];

// Trash cans side-by-side on the bottom floor (y=3) at the right edge
const FIXED_TRASH_CANS = [
  { pos: { x: 13, y: 3 }, type: 'ORGANIC'    as const, label: 'Organik',    color: 'bg-emerald-600 border-emerald-500 text-white', emoji: '🟩' },
  { pos: { x: 14, y: 3 }, type: 'RECYCLABLE' as const, label: 'Daur Ulang', color: 'bg-amber-500 border-amber-400 text-white',     emoji: '🟨' },
  { pos: { x: 15, y: 3 }, type: 'B3'         as const, label: 'B3',         color: 'bg-red-600 border-red-500 text-white',          emoji: '🟥' },
];

export const LEVELS: GameLevel[] = [
  // ── Level 1 ──────────────────────────────────────────────────────────────
  {
    id: 1,
    name: "1. Pemilahan Dasar & Tumpukan Tas",
    description: "Kendalikan Tukang Sampah untuk mengambil Apel dan Kaleng. Ingat aturan tumpukan tas: Sampah yang TERAKHIR diambil berada di posisi paling atas tas dan HARUS dibuang TERLEBIH DAHULU! Hati-hati ada rintangan batu di jalan!",
    gridSize: { width: 16, height: 4 },
    characters: FIXED_CHARACTERS,
    startPos: { x: 0, y: 3 },
    trashItems: [
      { id: 't1', pos: { x: 3, y: 3 }, item: TRASH_ITEMS.apple }, // 1st diambil (Organik - Dasar Tas)
      { id: 't2', pos: { x: 7, y: 3 }, item: TRASH_ITEMS.can },   // 2nd diambil (Daur Ulang - Teratas Tas)
    ],
    trashCans: FIXED_TRASH_CANS,
    obstacles: [
      { pos: { x: 5, y: 3 }, type: 'rock', emoji: '🪨' },
    ],
    maxCapacity: 3,
    maxInstructions: 30,
    starsThreshold: { three: 19, two: 23 },
    hints: [
      "1. Gunakan perintah LONCAT (tombol ATAS) sebelum posisi x=5 untuk melompati batu 🪨.",
      "2. Aturan Tumpukan: Karena Kaleng 🥤 diambil TERAKHIR (x=7), Kaleng ada di paling atas tas. Buang Kaleng dulu ke Tong Kuning (x=14)!",
      "3. Setelah Kaleng terbuang, baru buang Apel 🍎 ke Tong Hijau (x=13).",
    ],
    ctInsights: {
      decomposition: "Ambil Apel → Loncat Batu → Ambil Kaleng → Jalan ke Tong Kuning (14) buang Kaleng → Mundur ke Tong Hijau (13) buang Apel.",
      pattern:       "Memahami struktur tumpukan: Item terakhir masuk adalah item pertama yang harus diproses/dibuang.",
      abstraction:   "Fokus pada urutan tumpukan sampah di dalam tas ransel.",
      algorithm:     "Kanan 3x → Ambil (Apel) → Kanan 1x → Loncat (Batu) → Kanan 1x → Ambil (Kaleng) → Kanan ke x=14 → Buang (Kaleng) → Kiri ke x=13 → Buang (Apel).",
    },
  },

  // ── Level 2 ──────────────────────────────────────────────────────────────
  {
    id: 2,
    name: "2. Tiga Jenis Sampah & Urutan Tumpukan",
    description: "Ambil 3 jenis sampah (Apel, Kaleng, dan Baterai) sambil melompati rintangan batu 🪨! Karena urutan ambil adalah Apel -> Kaleng -> Baterai, maka Baterai berada di paling atas tas!",
    gridSize: { width: 16, height: 4 },
    characters: FIXED_CHARACTERS,
    startPos: { x: 0, y: 3 },
    trashItems: [
      { id: 't1', pos: { x: 3, y: 3 }, item: TRASH_ITEMS.apple },   // 1st (Organik - Dasar)
      { id: 't2', pos: { x: 7, y: 3 }, item: TRASH_ITEMS.can },     // 2nd (Daur Ulang - Tengah)
      { id: 't3', pos: { x: 10, y: 3 }, item: TRASH_ITEMS.battery }, // 3rd (B3 - Teratas)
    ],
    trashCans: FIXED_TRASH_CANS,
    obstacles: [
      { pos: { x: 5, y: 3 }, type: 'rock', emoji: '🪨' },
      { pos: { x: 9, y: 3 }, type: 'rock', emoji: '🪨' },
    ],
    maxCapacity: 3,
    maxInstructions: 35,
    starsThreshold: { three: 21, two: 25 },
    hints: [
      "1. Lompati batu 🪨 di x=5 dan x=9 menggunakan tombol LONCAT.",
      "2. Urutan tumpukan di tas: [Bawah: Apel 🍎 | Tengah: Kaleng 🥤 | Atas: Baterai 🔋].",
      "3. Urutan membuang yang benar: Buang Baterai ke Tong Merah (x=15) → Buang Kaleng ke Tong Kuning (x=14) → Buang Apel ke Tong Hijau (x=13).",
    ],
    ctInsights: {
      decomposition: "Kumpulkan 3 sampah → Lompati 2 batu → Buang Baterai di Tong Merah (15) → Buang Kaleng di Tong Kuning (14) → Buang Apel di Tong Hijau (13).",
      pattern:       "Pola urutan pembuangan mundur 15 -> 14 -> 13 sangat pas dengan tumpukan tas.",
      abstraction:   "Memetakan tumpukan tas dengan letak fisik tong sampah.",
      algorithm:     "Kanan ke x=3 Ambil → Kanan 1x Loncat x=5 → Ambil x=7 → Kanan 1x Loncat x=9 → Ambil x=10 → Kanan ke x=15 Buang → Kiri ke x=14 Buang → Kiri ke x=13 Buang.",
    },
  },

  // ── Level 3 ──────────────────────────────────────────────────────────────
  {
    id: 3,
    name: "3. Rintangan Ganda & Manajemen Tumpukan",
    description: "Uji keahlian tingkat lanjut! Urutan sampah yang diambil: Baterai B3 (x=3) -> Kaleng (x=7) -> Wortel (x=11). Rencanakan rute pembuangan yang efisien melewati rintangan batu!",
    gridSize: { width: 16, height: 4 },
    characters: FIXED_CHARACTERS,
    startPos: { x: 0, y: 3 },
    trashItems: [
      { id: 't1', pos: { x: 3, y: 3 }, item: TRASH_ITEMS.battery }, // 1st (B3 - Dasar)
      { id: 't2', pos: { x: 7, y: 3 }, item: TRASH_ITEMS.can },     // 2nd (Daur Ulang - Tengah)
      { id: 't3', pos: { x: 11, y: 3 }, item: TRASH_ITEMS.carrot },  // 3rd (Organik - Teratas)
    ],
    trashCans: FIXED_TRASH_CANS,
    obstacles: [
      { pos: { x: 5, y: 3 }, type: 'rock', emoji: '🪨' },
      { pos: { x: 9, y: 3 }, type: 'rock', emoji: '🪨' },
    ],
    maxCapacity: 3,
    maxInstructions: 40,
    starsThreshold: { three: 19, two: 23 },
    hints: [
      "1. Urutan tumpukan di tas: [Bawah: Baterai 🔋 | Tengah: Kaleng 🥤 | Atas: Wortel 🥕].",
      "2. Karena Wortel 🥕 ada di paling atas, Anda harus membuangnya TERLEBIH DAHULU di Tong Hijau (x=13).",
      "3. Setelah Wortel terbuang, baru buang Kaleng 🥤 di Tong Kuning (x=14), lalu Baterai 🔋 di Tong Merah (x=15).",
    ],
    ctInsights: {
      decomposition: "Ambil 3 sampah (Baterai, Kaleng, Wortel) → Lompati rintangan batu → Buang Wortel (13) → Buang Kaleng (14) → Buang Baterai (15).",
      pattern:       "Menyesuaikan alur gerak dengan urutan pembukaan tumpukan tas.",
      abstraction:   "Evaluasi alur pergerakan maju linear dari kiri ke kanan yang sempurna.",
      algorithm:     "Ambil di x=3 → Kanan 1x Loncat x=5 → Ambil di x=7 → Kanan 1x Loncat x=9 → Ambil di x=11 → Kanan ke x=13 Buang (Wortel) → Kanan ke x=14 Buang (Kaleng) → Kanan ke x=15 Buang (Baterai).",
    },
  },
];
