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
// Characters always start at the left edge (x=0), rows 2 / 4 / 6
const FIXED_CHARACTERS: Character[] = [
  { id: 'ORGANIC',    name: 'Organik',    color: 'bg-emerald-500', borderColor: 'border-emerald-600', startPos: { x: 0, y: 2 } },
  { id: 'RECYCLABLE', name: 'Daur Ulang', color: 'bg-amber-500',   borderColor: 'border-amber-600',   startPos: { x: 0, y: 4 } },
  { id: 'B3',         name: 'B3',         color: 'bg-red-500',     borderColor: 'border-red-600',     startPos: { x: 0, y: 6 } },
];

// Trash cans always at the right edge (x=7), rows 2 / 4 / 6
const FIXED_TRASH_CANS = [
  { pos: { x: 7, y: 2 }, type: 'ORGANIC'    as const, label: 'Organik',    color: 'bg-emerald-600 border-emerald-500 text-white', emoji: '🟩' },
  { pos: { x: 7, y: 4 }, type: 'RECYCLABLE' as const, label: 'Daur Ulang', color: 'bg-amber-500 border-amber-400 text-white',     emoji: '🟨' },
  { pos: { x: 7, y: 6 }, type: 'B3'         as const, label: 'B3',         color: 'bg-red-600 border-red-500 text-white',          emoji: '🟥' },
];
// ─────────────────────────────────────────────────────────────────────────────

export const LEVELS: GameLevel[] = [
  // ── Level 1 ──────────────────────────────────────────────────────────────
  {
    id: 1,
    name: "1. Pengenalan 3 Karakter",
    description: "Kendalikan 3 karakter pemilah di taman 8×8! Organik (Hijau), Daur Ulang (Kuning), dan B3 (Merah) — masing-masing ambil sampahnya dan buang ke tong yang sesuai!",
    gridSize: { width: 8, height: 8 },
    characters: FIXED_CHARACTERS,
    startPos: { x: 0, y: 2 },
    trashItems: [
      { id: 't1', pos: { x: 2, y: 3 }, item: TRASH_ITEMS.apple },
      { id: 't2', pos: { x: 4, y: 3 }, item: TRASH_ITEMS.can },
      { id: 't3', pos: { x: 6, y: 3 }, item: TRASH_ITEMS.battery },
    ],
    trashCans: FIXED_TRASH_CANS,
    obstacles: [],
    maxCapacity: 3,
    maxInstructions: 42,
    starsThreshold: { three: 37, two: 42 },
    hints: [
      "Klik tab karakter di atas susunan program untuk berganti karakter yang dikontrol.",
      "Setiap karakter hanya bisa mengambil sampah sesuai jenisnya sendiri.",
      "Saat semua program siap, klik Mulai untuk menjalankan 3 karakter bersamaan!",
    ],
    ctInsights: {
      decomposition: "Memecah masalah menjadi 3 program terpisah: satu untuk setiap karakter (Organik, Daur Ulang, B3).",
      pattern:       "Mengenali bahwa setiap karakter memiliki tipe sampah khusus — hijau (organik), kuning (daur ulang), merah (B3).",
      abstraction:   "Fokus pada program per karakter secara independen, mengabaikan pergerakan karakter lain yang berjalan paralel.",
      algorithm:     "Susun algoritma untuk masing-masing karakter: bergerak ke sampah → ambil → bergerak ke tong → buang.",
    },
  },

  // ── Level 2 ──────────────────────────────────────────────────────────────
  {
    id: 2,
    name: "2. Menghindari Karakter Lain",
    description: "Kumpulkan sampah di taman 8×8 secara bersamaan! Berhati-hatilah agar antar karakter tidak saling bertabrakan!",
    gridSize: { width: 8, height: 8 },
    characters: FIXED_CHARACTERS,
    startPos: { x: 0, y: 2 },
    trashItems: [
      { id: 't1', pos: { x: 2, y: 2 }, item: TRASH_ITEMS.banana },
      { id: 't2', pos: { x: 4, y: 4 }, item: TRASH_ITEMS.can },
      { id: 't3', pos: { x: 5, y: 6 }, item: TRASH_ITEMS.bulb },
    ],
    trashCans: FIXED_TRASH_CANS,
    obstacles: [],
    maxCapacity: 3,
    maxInstructions: 38,
    starsThreshold: { three: 28, two: 38 },
    hints: [
      "Semua karakter mulai di kolom kiri (x=0), tong di kolom kanan (x=7).",
      "Hindari bertabrakan antar karakter saat merencanakan rute.",
      "Setiap karakter ambil 1 sampah dan buang ke tong masing-masing.",
    ],
    ctInsights: {
      decomposition: "Memecah tugas menjadi 3 misi paralel: setiap karakter menangani satu jenis sampah dan satu tong.",
      pattern:       "Mengidentifikasi jalur yang dilalui setiap karakter agar tidak terjadi tabrakan di koordinat yang sama pada waktu bersamaan.",
      abstraction:   "Fokus pada navigasi per karakter secara independen sambil mengantisipasi persimpangan rute.",
      algorithm:     "Masing-masing karakter: bergerak ke sampahnya → ambil → navigasi ke tongnya → buang.",
    },
  },

  // ── Level 3 ──────────────────────────────────────────────────────────────
  {
    id: 3,
    name: "3. Rute Berliku",
    description: "Sampah tersebar di berbagai posisi. Karakter Organik, Daur Ulang, dan B3 harus mencari jalur yang paling efisien tanpa menabrak satu sama lain!",
    gridSize: { width: 8, height: 8 },
    characters: FIXED_CHARACTERS,
    startPos: { x: 0, y: 2 },
    trashItems: [
      { id: 't1', pos: { x: 2, y: 1 }, item: TRASH_ITEMS.apple },
      { id: 't2', pos: { x: 2, y: 4 }, item: TRASH_ITEMS.glass },
      { id: 't3', pos: { x: 2, y: 5 }, item: TRASH_ITEMS.paint },
      { id: 't4', pos: { x: 5, y: 2 }, item: TRASH_ITEMS.banana },
      { id: 't5', pos: { x: 5, y: 6 }, item: TRASH_ITEMS.can },
    ],
    trashCans: FIXED_TRASH_CANS,
    obstacles: [],
    maxCapacity: 5,
    maxInstructions: 45,
    starsThreshold: { three: 39, two: 45 },
    hints: [
      "Semua karakter mulai di kiri (x=0), tong di kanan (x=7).",
      "Pilah sampah di bagian tengah dan sesuaikan gerakan agar antar karakter tidak bertabrakan.",
      "Organik dan B3 perlu mengambil sampah di tengah peta secara hati-hati!",
    ],
    ctInsights: {
      decomposition: "Membagi penugasan sampah berdasarkan jenisnya untuk masing-masing karakter.",
      pattern:       "Merencanakan urutan gerak agar sel sibuk tidak dimasuki oleh dua karakter sekaligus.",
      abstraction:   "Fokus pada koordinasi langkah demi langkah per karakter.",
      algorithm:     "Rencanakan per karakter: temukan sampah → ambil → kembali ke tong.",
    },
  },

  // ── Level 4 ──────────────────────────────────────────────────────────────
  {
    id: 4,
    name: "4. Koridor Pemilahan",
    description: "Tiga karakter bekerja bersama membersihkan sampah yang tersebar di berbagai sudut!",
    gridSize: { width: 8, height: 8 },
    characters: FIXED_CHARACTERS,
    startPos: { x: 0, y: 2 },
    trashItems: [
      { id: 't1', pos: { x: 3, y: 2 }, item: TRASH_ITEMS.can },
      { id: 't2', pos: { x: 4, y: 1 }, item: TRASH_ITEMS.glass },
      { id: 't3', pos: { x: 2, y: 4 }, item: TRASH_ITEMS.cd },
      { id: 't4', pos: { x: 5, y: 4 }, item: TRASH_ITEMS.apple },
      { id: 't5', pos: { x: 1, y: 6 }, item: TRASH_ITEMS.carrot },
      { id: 't6', pos: { x: 5, y: 6 }, item: TRASH_ITEMS.battery },
    ],
    trashCans: FIXED_TRASH_CANS,
    obstacles: [],
    maxCapacity: 5,
    maxInstructions: 48,
    starsThreshold: { three: 44, two: 48 },
    hints: [
      "Daur Ulang punya tugas berat — kumpulkan beberapa sampah sebelum ke tong!",
      "Organik dan B3 masing-masing punya sampah di dekat posisi startnya.",
      "Gunakan kapasitas kantong untuk mengangkut beberapa sampah sekaligus.",
    ],
    ctInsights: {
      decomposition: "Memecah rute per karakter: RECYCLABLE kumpulkan di tengah, ORGANIC ambil organik, B3 ambil baterai.",
      pattern:       "Mengenali bahwa Daur Ulang perlu strategi zig-zag, sementara yang lain cukup linear.",
      abstraction:   "Fokus pada program per karakter — beban kerja tidak sama, setiap karakter punya kompleksitas berbeda.",
      algorithm:     "RECYCLABLE: kumpulkan kaleng+botol+CD → buang di (7,4). ORGANIC: kumpulkan apel+wortel → buang di (7,2). B3: ambil baterai → buang di (7,6).",
    },
  },

  // ── Level 5 ──────────────────────────────────────────────────────────────
  {
    id: 5,
    name: "5. Pusat Pemilahan Agung",
    description: "Tantangan utama! 3 karakter, 6 sampah (Organik, Daur Ulang, B3) tersebar di taman 8×8. Susun strategi tanpa bertabrakan!",
    gridSize: { width: 8, height: 8 },
    characters: FIXED_CHARACTERS,
    startPos: { x: 0, y: 2 },
    trashItems: [
      { id: 't1', pos: { x: 2, y: 1 }, item: TRASH_ITEMS.apple },
      { id: 't2', pos: { x: 5, y: 1 }, item: TRASH_ITEMS.can },
      { id: 't3', pos: { x: 2, y: 4 }, item: TRASH_ITEMS.battery },
      { id: 't4', pos: { x: 5, y: 5 }, item: TRASH_ITEMS.paint },
      { id: 't5', pos: { x: 2, y: 6 }, item: TRASH_ITEMS.banana },
      { id: 't6', pos: { x: 5, y: 7 }, item: TRASH_ITEMS.glass },
    ],
    trashCans: FIXED_TRASH_CANS,
    obstacles: [],
    maxCapacity: 6,
    maxInstructions: 62,
    starsThreshold: { three: 56, two: 62 },
    hints: [
      "Organik ambil 2 sampah organik, Daur Ulang ambil 2, B3 ambil 2 — masing-masing ke tong di x=7.",
      "Tong sejajar di kanan (x=7): Hijau y=2, Kuning y=4, Merah y=6.",
      "Pastikan rute pergerakan karakter tidak bertumpuk di langkah yang sama.",
    ],
    ctInsights: {
      decomposition: "3 karakter, 3 zona: ORGANIC ambil organik, RECYCLABLE ambil daur ulang, B3 ambil B3.",
      pattern:       "Semua tong di kolom x=7 — setiap karakter perlu menuju kanan setelah mengumpulkan.",
      abstraction:   "Setiap karakter independen tetapi harus berhati-hati agar tidak saling bertabrakan.",
      algorithm:     "Setiap karakter: ambil sampah jenisnya → buang di tong x=7 yang sesuai.",
    },
  },

  // ── Level 6 ──────────────────────────────────────────────────────────────
  {
    id: 6,
    name: "6. Tantangan Ultimate",
    description: "Puncak tantangan! 3 karakter, 6 sampah semua jenis, peta 8×8. Buktikan penguasaan algoritma multi-karakter!",
    gridSize: { width: 8, height: 8 },
    characters: FIXED_CHARACTERS,
    startPos: { x: 0, y: 2 },
    trashItems: [
      { id: 't1', pos: { x: 2, y: 1 }, item: TRASH_ITEMS.apple },
      { id: 't2', pos: { x: 5, y: 2 }, item: TRASH_ITEMS.can },
      { id: 't3', pos: { x: 2, y: 4 }, item: TRASH_ITEMS.banana },
      { id: 't4', pos: { x: 5, y: 4 }, item: TRASH_ITEMS.glass },
      { id: 't5', pos: { x: 3, y: 6 }, item: TRASH_ITEMS.bulb },
      { id: 't6', pos: { x: 5, y: 6 }, item: TRASH_ITEMS.battery },
    ],
    trashCans: FIXED_TRASH_CANS,
    obstacles: [],
    maxCapacity: 6,
    maxInstructions: 55,
    starsThreshold: { three: 48, two: 55 },
    hints: [
      "Semua karakter mulai di kiri (x=0), tong di kanan (x=7) — rencanakan rute untuk setiap karakter.",
      "Koordinasikan langkah agar tidak terjadi tabrakan di jalur tengah.",
      "B3 perlu mengambil bohlam dan baterai di bagian bawah peta.",
    ],
    ctInsights: {
      decomposition: "3 karakter dengan 3 zona berbeda: ORGANIC (atas), RECYCLABLE (tengah), B3 (bawah).",
      pattern:       "Semua karakter dan tong memiliki posisi tetap di tepi kiri dan kanan — pola yang konsisten di semua level.",
      abstraction:   "Program per karakter berdiri sendiri — jumlah langkah total adalah jumlah langkah ketiga karakter.",
      algorithm:     "ORGANIC: ambil organik → buang di (7,2). RECYCLABLE: ambil daur ulang → buang di (7,4). B3: ambil B3 → buang di (7,6).",
    },
  },
];
