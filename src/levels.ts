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
// Only 1 Character: Robot Pemilah starting at x=0, y=3
const FIXED_CHARACTERS: Character[] = [
  { id: 'ORGANIC', name: 'Robot Pemilah', color: 'bg-indigo-650', borderColor: 'border-indigo-800', startPos: { x: 0, y: 3 } },
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
    name: "1. Pengenalan Robot Pemilah",
    description: "Kendalikan Robot Pemilah di area taman bebas! Ambil sampah yang berserakan di tanah (Apel dan Kaleng) lalu buang ke tong sampah yang sesuai di sisi kanan!",
    gridSize: { width: 16, height: 4 },
    characters: FIXED_CHARACTERS,
    startPos: { x: 0, y: 3 },
    trashItems: [
      { id: 't1', pos: { x: 4, y: 3 }, item: TRASH_ITEMS.apple },
      { id: 't2', pos: { x: 8, y: 3 }, item: TRASH_ITEMS.can },
    ],
    trashCans: FIXED_TRASH_CANS,
    obstacles: [],
    maxCapacity: 3,
    maxInstructions: 30,
    starsThreshold: { three: 19, two: 24 },
    hints: [
      "Robot dapat menampung maksimal 3 sampah sekaligus di dalam tas.",
      "Gunakan tombol KANAN untuk berjalan, AMBIL untuk memungut, dan BUANG di atas tong yang tepat di ujung kanan.",
      "Cukup lakukan 1 perjalanan untuk mengumpulkan kedua sampah sebelum membuangnya.",
    ],
    ctInsights: {
      decomposition: "Memecah perjalanan menjadi: ambil apel → ambil kaleng → buang kaleng di tong kuning → buang apel di tong hijau.",
      pattern:       "Mengetahui letak tong sampah: Hijau (x=13) untuk organik, Kuning (x=14) untuk daur ulang.",
      abstraction:   "Fokus pada rute terpendek yang menghubungkan sampah dan tong.",
      algorithm:     "Gerak ke (4,3) ambil → gerak ke (8,3) ambil → gerak ke tong kuning (14,3) buang → gerak ke tong hijau (13,3) buang.",
    },
  },

  // ── Level 2 ──────────────────────────────────────────────────────────────
  {
    id: 2,
    name: "2. Belajar Melompat",
    description: "Rencanakan rute Robot Pemilah untuk mengumpulkan Apel dan Kaleng sambil melompati rintangan batu dan semak di tanah!",
    gridSize: { width: 16, height: 4 },
    characters: FIXED_CHARACTERS,
    startPos: { x: 0, y: 3 },
    trashItems: [
      { id: 't1', pos: { x: 4, y: 3 }, item: TRASH_ITEMS.apple },
      { id: 't2', pos: { x: 8, y: 3 }, item: TRASH_ITEMS.can },
    ],
    trashCans: FIXED_TRASH_CANS,
    obstacles: [
      { pos: { x: 6, y: 3 }, type: 'rock', emoji: '🪨' },
      { pos: { x: 10, y: 3 }, type: 'bush', emoji: '🌿' },
    ],
    maxCapacity: 3,
    maxInstructions: 35,
    starsThreshold: { three: 25, two: 30 },
    hints: [
      "Gunakan perintah JUMP/LONCAT (tombol ATAS) dikombinasikan dengan arah KANAN untuk melompati rintangan.",
      "Lompati batu (🪨) di x=6 dan semak (🌿) di x=10.",
      "Pilah sampah di tong daur ulang (kuning) di x=14 dan tong organik (hijau) di x=13.",
    ],
    ctInsights: {
      decomposition: "Membagi rute menjadi: jalan kanan, lompat melewati rintangan, ambil sampah, lalu antar ke tong.",
      pattern:       "Melihat batu dan semak menghalangi jalan mendatar, mengharuskan lompatan udara.",
      abstraction:   "Mengabaikan sisa area kosong dan fokus pada penempatan perintah loncat sebelum posisi x=6 dan x=10.",
      algorithm:     "Gerak ke (4,3) ambil → lompat melewati x=6 → gerak ke (8,3) ambil → lompat melewati x=10 → antar ke tong kuning (14,3) & hijau (13,3).",
    },
  },

  // ── Level 3 ──────────────────────────────────────────────────────────────
  {
    id: 3,
    name: "3. Tiga Jenis Sampah",
    description: "Tantangan meningkat! Kumpulkan tiga jenis sampah (Apel, Kaleng, dan Baterai) sekaligus lalu buang ke masing-masing tong yang sesuai!",
    gridSize: { width: 16, height: 4 },
    characters: FIXED_CHARACTERS,
    startPos: { x: 0, y: 3 },
    trashItems: [
      { id: 't1', pos: { x: 3, y: 3 }, item: TRASH_ITEMS.apple },
      { id: 't2', pos: { x: 7, y: 3 }, item: TRASH_ITEMS.can },
      { id: 't3', pos: { x: 11, y: 3 }, item: TRASH_ITEMS.battery },
    ],
    trashCans: FIXED_TRASH_CANS,
    obstacles: [],
    maxCapacity: 3,
    maxInstructions: 35,
    starsThreshold: { three: 26, two: 31 },
    hints: [
      "Tas Anda muat pas 3 sampah. Kumpulkan ketiganya sekaligus sebelum menuju area tong.",
      "Urutan pembuangan: Baterai di tong merah (x=15), Kaleng di kuning (x=14), Apel di hijau (x=13).",
    ],
    ctInsights: {
      decomposition: "Ambil 3 sampah berurutan, lalu buang ke 3 tong berurutan di sisi kanan.",
      pattern:       "Mengurutkan aksi pembuangan dari merah (x=15) lalu mundur ke kuning (x=14) dan hijau (x=13) agar langkah efisien.",
      abstraction:   "Fokus pada koordinat target sampah dan tong untuk menyusun pergerakan linear.",
      algorithm:     "Ambil di x=3 → ambil di x=7 → ambil di x=11 → buang di x=15 → buang di x=14 → buang di x=13.",
    },
  },

  // ── Level 4 ──────────────────────────────────────────────────────────────
  {
    id: 4,
    name: "4. Kapasitas Terbatas",
    description: "Ada 4 sampah di taman, tetapi kapasitas tas Anda hanya 3! Anda harus mengosongkan tas terlebih dahulu ke tong sebelum mengambil sampah sisa!",
    gridSize: { width: 16, height: 4 },
    characters: FIXED_CHARACTERS,
    startPos: { x: 0, y: 3 },
    trashItems: [
      { id: 't1', pos: { x: 3, y: 3 }, item: TRASH_ITEMS.apple },
      { id: 't2', pos: { x: 5, y: 3 }, item: TRASH_ITEMS.banana },
      { id: 't3', pos: { x: 7, y: 3 }, item: TRASH_ITEMS.can },
      { id: 't4', pos: { x: 10, y: 3 }, item: TRASH_ITEMS.battery },
    ],
    trashCans: FIXED_TRASH_CANS,
    obstacles: [],
    maxCapacity: 3,
    maxInstructions: 45,
    starsThreshold: { three: 42, two: 47 },
    hints: [
      "Ambil 3 sampah pertama (Apel, Pisang, Kaleng), lalu buang ke tong hijau & kuning di x=13 & x=14.",
      "Setelah tas kosong, kembali untuk mengambil Baterai (B3) di x=10 dan buang ke tong merah di x=15.",
      "Mengambil sampah keempat saat tas penuh akan memicu error!",
    ],
    ctInsights: {
      decomposition: "Memecah tugas: trip 1 (ambil 3 sampah, buang di x=13/14), trip 2 (kembali ambil baterai di x=10, buang di x=15).",
      pattern:       "Menyadari batasan kapasitas tas (3) mengharuskan adanya loop perjalanan kembali ke belakang.",
      abstraction:   "Memprioritaskan pembersihan sampah terdekat agar sisa kapasitas tas dapat dikelola secara optimal.",
      algorithm:     "Ambil apel di x=3 → ambil pisang di x=5 → ambil kaleng di x=7 → buang di x=13 & 14 → kembali ke x=10 ambil baterai → buang di x=15.",
    },
  },

  // ── Level 5 ──────────────────────────────────────────────────────────────
  {
    id: 5,
    name: "5. Lompat Ganda",
    description: "Kumpulkan 3 sampah yang tersebar sambil melompati rintangan batu dan semak yang menghalangi jalan!",
    gridSize: { width: 16, height: 4 },
    characters: FIXED_CHARACTERS,
    startPos: { x: 0, y: 3 },
    trashItems: [
      { id: 't1', pos: { x: 3, y: 3 }, item: TRASH_ITEMS.carrot },
      { id: 't2', pos: { x: 7, y: 3 }, item: TRASH_ITEMS.glass },
      { id: 't3', pos: { x: 11, y: 3 }, item: TRASH_ITEMS.paint },
    ],
    trashCans: FIXED_TRASH_CANS,
    obstacles: [
      { pos: { x: 5, y: 3 }, type: 'rock', emoji: '🪨' },
      { pos: { x: 9, y: 3 }, type: 'bush', emoji: '🌿' },
    ],
    maxCapacity: 3,
    maxInstructions: 40,
    starsThreshold: { three: 30, two: 35 },
    hints: [
      "Gunakan kombinasi pergerakan melompat (JUMP + KANAN) untuk melewati rintangan x=5 dan x=9.",
      "Kumpulkan semua sampah lalu buang di tong sebelah kanan.",
    ],
    ctInsights: {
      decomposition: "Jalan ke x=3 ambil → lompat melewati x=5 → ambil di x=7 → lompat melewati x=9 → ambil di x=11 → buang di tong.",
      pattern:       "Setiap rintangan diletakkan di antara dua buah sampah, sehingga membutuhkan kombo jalan-lompat-jalan.",
      abstraction:   "Fokus mencari letak rintangan dan menyisipkan aksi loncat sebelum koordinat rintangan tersebut.",
      algorithm:     "Ambil di x=3 → lompat batu → ambil di x=7 → lompat semak → ambil di x=11 → buang di tong merah (15), kuning (14), hijau (13).",
    },
  },

  // ── Level 6 ──────────────────────────────────────────────────────────────
  {
    id: 6,
    name: "6. Pemilahan Agung Terakhir",
    description: "Tantangan Terakhir! Pilah 6 buah sampah yang tersebar di taman dengan merencanakan 2 kali putaran angkut secara efisien dan melompati rintangan!",
    gridSize: { width: 16, height: 4 },
    characters: FIXED_CHARACTERS,
    startPos: { x: 0, y: 3 },
    trashItems: [
      { id: 't1', pos: { x: 2, y: 3 }, item: TRASH_ITEMS.apple },
      { id: 't2', pos: { x: 4, y: 3 }, item: TRASH_ITEMS.carrot },
      { id: 't3', pos: { x: 3, y: 3 }, item: TRASH_ITEMS.can },
      { id: 't4', pos: { x: 5, y: 3 }, item: TRASH_ITEMS.glass },
      { id: 't5', pos: { x: 8, y: 3 }, item: TRASH_ITEMS.paint },
      { id: 't6', pos: { x: 9, y: 3 }, item: TRASH_ITEMS.battery },
    ],
    trashCans: FIXED_TRASH_CANS,
    obstacles: [
      { pos: { x: 6, y: 3 }, type: 'rock', emoji: '🪨' },
      { pos: { x: 11, y: 3 }, type: 'bush', emoji: '🌿' },
    ],
    maxCapacity: 3,
    maxInstructions: 80,
    starsThreshold: { three: 57, two: 65 },
    hints: [
      "Rencanakan putaran pertama untuk mengambil 3 sampah di bagian kiri (Apel, Wortel, Kaleng) lalu buang ke tong.",
      "Rencanakan putaran kedua untuk mengambil sisa sampah di bagian kanan (Gelas, Kaleng Cat, Baterai) lalu bersihkan semuanya.",
    ],
    ctInsights: {
      decomposition: "Membagi 6 sampah menjadi 2 kloter pengumpulan (3 sampah per kloter) untuk mematuhi kapasitas tas.",
      pattern:       "Mengelompokkan sampah berdasarkan letak geografis (kiri vs kanan) untuk meminimalkan langkah bolak-balik.",
      abstraction:   "Mengabaikan jalur rumit dan fokus pada 2 putaran bersih: kumpulkan kloter 1 → buang → kumpulkan kloter 2 → buang.",
      algorithm:     "Kloter 1: ambil di x=2, x=3, x=4 → buang di x=13 & 14. Kloter 2: ambil di x=5, x=8, x=9 → buang di x=13, 14, 15.",
    },
  },
];
