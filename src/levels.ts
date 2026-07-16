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
// Only 1 Character: Robot Pemilah
const FIXED_CHARACTERS: Character[] = [
  { id: 'ORGANIC', name: 'Robot Pemilah', color: 'bg-indigo-650', borderColor: 'border-indigo-800', startPos: { x: 0, y: 3 } },
];

// Trash cans at the right edge (x=11), rows 1 / 3 / 5
const FIXED_TRASH_CANS = [
  { pos: { x: 11, y: 1 }, type: 'ORGANIC'    as const, label: 'Organik',    color: 'bg-emerald-600 border-emerald-500 text-white', emoji: '🟩' },
  { pos: { x: 11, y: 3 }, type: 'RECYCLABLE' as const, label: 'Daur Ulang', color: 'bg-amber-500 border-amber-400 text-white',     emoji: '🟨' },
  { pos: { x: 11, y: 5 }, type: 'B3'         as const, label: 'B3',         color: 'bg-red-600 border-red-500 text-white',          emoji: '🟥' },
];
// ─────────────────────────────────────────────────────────────────────────────

export const LEVELS: GameLevel[] = [
  // ── Level 1 ──────────────────────────────────────────────────────────────
  {
    id: 1,
    name: "1. Pengenalan Robot Pemilah",
    description: "Kendalikan Robot Pemilah di taman 12×6! Ambil sampah yang berserakan (Apel dan Kaleng) lalu buang ke tong sampah yang sesuai di sisi kanan!",
    gridSize: { width: 12, height: 6 },
    characters: FIXED_CHARACTERS,
    startPos: { x: 0, y: 3 },
    trashItems: [
      { id: 't1', pos: { x: 3, y: 3 }, item: TRASH_ITEMS.apple },
      { id: 't2', pos: { x: 6, y: 3 }, item: TRASH_ITEMS.can },
    ],
    trashCans: FIXED_TRASH_CANS,
    obstacles: [],
    maxCapacity: 3,
    maxInstructions: 25,
    starsThreshold: { three: 17, two: 22 },
    hints: [
      "Robot dapat menampung maksimal 3 sampah sekaligus di dalam tas.",
      "Gunakan tombol arah untuk bergerak, Ambil untuk memungut, dan Buang di atas tong yang tepat.",
      "Cukup lakukan 1 perjalanan untuk mengumpulkan kedua sampah sebelum membuangnya.",
    ],
    ctInsights: {
      decomposition: "Memecah perjalanan menjadi: ambil apel → ambil kaleng → buang kaleng di tong kuning → buang apel di tong hijau.",
      pattern:       "Mengetahui letak tong sampah: Hijau (y=1) untuk organik, Kuning (y=3) untuk daur ulang.",
      abstraction:   "Mengabaikan kotak kosong lainnya dan fokus pada rute terpendek yang menghubungkan sampah dan tong.",
      algorithm:     "Gerak ke kanan ke apel → ambil → gerak ke kanan ke kaleng → ambil → gerak ke tong kuning → buang → gerak ke tong hijau → buang.",
    },
  },

  // ── Level 2 ──────────────────────────────────────────────────────────────
  {
    id: 2,
    name: "2. Menghindari Rintangan",
    description: "Rencanakan rute Robot Pemilah untuk mengumpulkan Apel dan Kaleng sambil menghindari rintangan batu dan semak di tengah peta!",
    gridSize: { width: 12, height: 6 },
    characters: FIXED_CHARACTERS,
    startPos: { x: 0, y: 3 },
    trashItems: [
      { id: 't1', pos: { x: 4, y: 1 }, item: TRASH_ITEMS.apple },
      { id: 't2', pos: { x: 7, y: 5 }, item: TRASH_ITEMS.can },
    ],
    trashCans: FIXED_TRASH_CANS,
    obstacles: [
      { pos: { x: 4, y: 3 }, type: 'rock', emoji: '🪨' },
      { pos: { x: 7, y: 3 }, type: 'bush', emoji: '🌿' },
    ],
    maxCapacity: 3,
    maxInstructions: 30,
    starsThreshold: { three: 25, two: 30 },
    hints: [
      "Hindari sel yang memiliki rintangan batu (🪨) dan semak (🌿).",
      "Gunakan jalur atas (y=1) terlebih dahulu untuk mengambil Apel, lalu turun ke bawah.",
      "Pilah sampah di tong daur ulang (kuning) di y=3 dan tong organik (hijau) di y=1.",
    ],
    ctInsights: {
      decomposition: "Membagi rute menjadi navigasi menghindari rintangan ke sampah pertama, lalu ke sampah kedua, kemudian ke tong.",
      pattern:       "Melihat rintangan berada di baris tengah (y=3), sehingga robot harus melipir lewat atas atau bawah.",
      abstraction:   "Mengabaikan rintangan yang jauh dari rute dan fokus pada rintangan di koordinat (4,3) dan (7,3).",
      algorithm:     "Naik ke y=1 → gerak ke kanan ke (4,1) → ambil → turun ke y=5 → gerak ke (7,5) → ambil → gerak ke tong kuning (11,3) → buang → naik ke tong hijau (11,1) → buang.",
    },
  },

  // ── Level 3 ──────────────────────────────────────────────────────────────
  {
    id: 3,
    name: "3. Tiga Jenis Sampah",
    description: "Tantangan meningkat! Kumpulkan tiga jenis sampah (Apel, Kaleng, dan Baterai) sekaligus lalu buang ke masing-masing tong yang sesuai!",
    gridSize: { width: 12, height: 6 },
    characters: FIXED_CHARACTERS,
    startPos: { x: 0, y: 3 },
    trashItems: [
      { id: 't1', pos: { x: 3, y: 1 }, item: TRASH_ITEMS.apple },
      { id: 't2', pos: { x: 6, y: 3 }, item: TRASH_ITEMS.can },
      { id: 't3', pos: { x: 9, y: 5 }, item: TRASH_ITEMS.battery },
    ],
    trashCans: FIXED_TRASH_CANS,
    obstacles: [],
    maxCapacity: 3,
    maxInstructions: 35,
    starsThreshold: { three: 27, two: 32 },
    hints: [
      "Tas Anda muat pas 3 sampah. Kumpulkan ketiganya sekaligus sebelum menuju area tong.",
      "Urutan pembuangan yang efisien: Baterai di tong merah (y=5), Kaleng di kuning (y=3), Apel di hijau (y=1).",
    ],
    ctInsights: {
      decomposition: "Rute dibagi 3 tahap pengambilan berturut-turut, diikuti dengan 3 tahap pembuangan berurutan di sisi kanan.",
      pattern:       "Mengurutkan aksi pembuangan dari bawah ke atas (merah → kuning → hijau) untuk meminimalkan langkah berbalik arah.",
      abstraction:   "Fokus pada koordinat target sampah dan tong untuk menyusun pergerakan diagonal/zig-zag.",
      algorithm:     "Gerak ke (3,1) ambil → gerak ke (6,3) ambil → gerak ke (9,5) ambil → gerak ke (11,5) buang → naik ke (11,3) buang → naik ke (11,1) buang.",
    },
  },

  // ── Level 4 ──────────────────────────────────────────────────────────────
  {
    id: 4,
    name: "4. Kapasitas Terbatas",
    description: "Ada 4 sampah di taman, tetapi kapasitas tas Anda hanya 3! Anda harus mengosongkan tas terlebih dahulu ke tong sebelum mengambil sampah sisa!",
    gridSize: { width: 12, height: 6 },
    characters: FIXED_CHARACTERS,
    startPos: { x: 0, y: 3 },
    trashItems: [
      { id: 't1', pos: { x: 2, y: 1 }, item: TRASH_ITEMS.apple },
      { id: 't2', pos: { x: 4, y: 1 }, item: TRASH_ITEMS.banana },
      { id: 't3', pos: { x: 6, y: 3 }, item: TRASH_ITEMS.can },
      { id: 't4', pos: { x: 8, y: 5 }, item: TRASH_ITEMS.battery },
    ],
    trashCans: FIXED_TRASH_CANS,
    obstacles: [],
    maxCapacity: 3,
    maxInstructions: 40,
    starsThreshold: { three: 34, two: 39 },
    hints: [
      "Ambil 3 sampah pertama (Apel, Pisang, Kaleng), lalu buang ke tong hijau & kuning.",
      "Setelah tas kosong, kembali untuk mengambil Baterai (B3) dan buang ke tong merah.",
      "Mengambil sampah keempat saat tas penuh akan memicu error!",
    ],
    ctInsights: {
      decomposition: "Memecah tugas: trip 1 (ambil 3 sampah, buang di x=11), trip 2 (kembali ambil baterai di x=8, buang di x=11).",
      pattern:       "Menyadari batasan kapasitas tas (3) mengharuskan adanya loop perjalanan kembali ke tengah peta.",
      abstraction:   "Memprioritaskan pembersihan sampah terdekat agar sisa kapasitas tas dapat dikelola secara optimal.",
      algorithm:     "Ambil apel di (2,1) → ambil pisang di (4,1) → ambil kaleng di (6,3) → buang di tong hijau (11,1) & kuning (11,3) → kembali ke (8,5) ambil baterai → buang di tong merah (11,5).",
    },
  },

  // ── Level 5 ──────────────────────────────────────────────────────────────
  {
    id: 5,
    name: "5. Labirin Taman",
    description: "Navigasikan robot melewati koridor sempit di antara dinding semak/batu untuk memilah 3 sampah berserakan!",
    gridSize: { width: 12, height: 6 },
    characters: FIXED_CHARACTERS,
    startPos: { x: 0, y: 3 },
    trashItems: [
      { id: 't1', pos: { x: 3, y: 1 }, item: TRASH_ITEMS.carrot },
      { id: 't2', pos: { x: 6, y: 4 }, item: TRASH_ITEMS.glass },
      { id: 't3', pos: { x: 9, y: 1 }, item: TRASH_ITEMS.paint },
    ],
    trashCans: FIXED_TRASH_CANS,
    obstacles: [
      { pos: { x: 4, y: 0 }, type: 'wall', emoji: '🌳' },
      { pos: { x: 4, y: 1 }, type: 'wall', emoji: '🌳' },
      { pos: { x: 4, y: 2 }, type: 'wall', emoji: '🌳' },
      { pos: { x: 7, y: 3 }, type: 'wall', emoji: '🌳' },
      { pos: { x: 7, y: 4 }, type: 'wall', emoji: '🌳' },
      { pos: { x: 7, y: 5 }, type: 'wall', emoji: '🌳' },
    ],
    maxCapacity: 3,
    maxInstructions: 38,
    starsThreshold: { three: 29, two: 34 },
    hints: [
      "Gunakan celah di y=3 untuk melewati rintangan pertama (kolom 4).",
      "Gunakan celah di y=1 atau y=2 untuk melewati rintangan kedua (kolom 7).",
      "Kumpulkan semua sampah lalu buang di tong sebelah kanan.",
    ],
    ctInsights: {
      decomposition: "Membagi pergerakan menjadi segmentasi horizontal melewati celah rintangan pada baris y yang aman.",
      pattern:       "Menemukan pola koridor semak: kolom 4 tertutup di atas, kolom 7 tertutup di bawah.",
      abstraction:   "Fokus mencari celah kosong (4,3) dan (7,1) untuk menyeberangi area peta.",
      algorithm:     "Naik ke (3,1) ambil → turun ke y=3 → lewati (4,3) → turun ke (6,4) ambil → naik ke y=1 → lewati (7,1) → kanan ke (9,1) ambil → buang di tong hijau (11,1), kuning (11,3) & merah (11,5).",
    },
  },

  // ── Level 6 ──────────────────────────────────────────────────────────────
  {
    id: 6,
    name: "6. Pemilahan Agung Terakhir",
    description: "Tantangan Terakhir! Pilah 6 buah sampah yang tersebar di taman dengan merencanakan 2 kali putaran angkut secara efisien!",
    gridSize: { width: 12, height: 6 },
    characters: FIXED_CHARACTERS,
    startPos: { x: 0, y: 3 },
    trashItems: [
      { id: 't1', pos: { x: 2, y: 1 }, item: TRASH_ITEMS.apple },
      { id: 't2', pos: { x: 4, y: 1 }, item: TRASH_ITEMS.carrot },
      { id: 't3', pos: { x: 3, y: 4 }, item: TRASH_ITEMS.can },
      { id: 't4', pos: { x: 5, y: 4 }, item: TRASH_ITEMS.glass },
      { id: 't5', pos: { x: 8, y: 1 }, item: TRASH_ITEMS.paint },
      { id: 't6', pos: { x: 8, y: 4 }, item: TRASH_ITEMS.battery },
    ],
    trashCans: FIXED_TRASH_CANS,
    obstacles: [],
    maxCapacity: 3,
    maxInstructions: 60,
    starsThreshold: { three: 51, two: 58 },
    hints: [
      "Rencanakan putaran pertama untuk mengambil 3 sampah di bagian kiri (misal: Apel, Kaleng, Wortel) lalu buang ke tong.",
      "Rencanakan putaran kedua untuk mengambil sisa sampah di bagian tengah dan kanan (Gelas, Kaleng Cat, Baterai) lalu bersihkan semuanya.",
    ],
    ctInsights: {
      decomposition: "Membagi 6 sampah menjadi 2 kloter pengumpulan (3 sampah per kloter) untuk mematuhi kapasitas tas.",
      pattern:       "Mengelompokkan sampah berdasarkan letak geografis (kiri vs kanan) untuk meminimalkan langkah bolak-balik.",
      abstraction:   "Mengabaikan jalur rumit dan fokus pada 2 putaran bersih: kumpulkan kloter 1 → buang → kumpulkan kloter 2 → buang.",
      algorithm:     "Kloter 1: ambil di (2,1), (3,4), (4,1) → buang di (11,1) & (11,3). Kloter 2: ambil baterai di (8,4), gelas di (5,4), cat di (8,1) → buang di (11,3) & (11,5).",
    },
  },
];
