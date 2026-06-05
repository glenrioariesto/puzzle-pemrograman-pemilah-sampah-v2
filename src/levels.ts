/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameLevel, TrashItem, RobotCharacter } from './types';

export const TRASH_ITEMS: { [key: string]: TrashItem } = {
  banana: { id: 'banana', name: 'Kulit Pisang', type: 'ORGANIC', emoji: '🍌', color: 'text-emerald-500' },
  carrot: { id: 'carrot', name: 'Wortel Busuk', type: 'ORGANIC', emoji: '🥕', color: 'text-emerald-500' },
  apple: { id: 'apple', name: 'Sisa Apel', type: 'ORGANIC', emoji: '🍎', color: 'text-emerald-500' },
  can: { id: 'can', name: 'Kaleng Soda', type: 'RECYCLABLE', emoji: '🥤', color: 'text-amber-500' },
  glass: { id: 'glass', name: 'Botol Kaca', type: 'RECYCLABLE', emoji: '🍾', color: 'text-amber-500' },
  cd: { id: 'cd', name: 'Kaset CD Bekas', type: 'RECYCLABLE', emoji: '📀', color: 'text-amber-500' },
  battery: { id: 'battery', name: 'Baterai Bekas', type: 'B3', emoji: '🔋', color: 'text-violet-500' },
  paint: { id: 'paint', name: 'Kaleng Cat', type: 'B3', emoji: '🎨', color: 'text-violet-500' },
  bulb: { id: 'bulb', name: 'Bohlam Lampu', type: 'B3', emoji: '💡', color: 'text-violet-500' },
};

// Helper to create default 3 robots with positions overridden per level
function makeRobots(
  organicPos: { x: number; y: number },
  recyclablePos: { x: number; y: number },
  b3Pos: { x: number; y: number }
): RobotCharacter[] {
  return [
    { id: 'ORGANIC', name: 'Robot Organik', color: 'bg-emerald-500', borderColor: 'border-emerald-600', startPos: organicPos },
    { id: 'RECYCLABLE', name: 'Robot Daur Ulang', color: 'bg-amber-500', borderColor: 'border-amber-600', startPos: recyclablePos },
    { id: 'B3', name: 'Robot B3', color: 'bg-violet-500', borderColor: 'border-violet-600', startPos: b3Pos },
  ];
}

export const LEVELS: GameLevel[] = [
  {
    id: 1,
    name: "1. Pengenalan 3 Robot",
    description: "Kendalikan 3 robot pemilah di taman 8x8! Robot Organik (Hijau), Robot Daur Ulang (Kuning), dan Robot B3 (Ungu) — masing-masing ambil sampahnya dan buang ke tong yang sesuai!",
    gridSize: { width: 8, height: 8 },
    robots: makeRobots(
      { x: 0, y: 2 },  // ORGANIC start
      { x: 0, y: 4 },  // RECYCLABLE start
      { x: 0, y: 6 }   // B3 start
    ),
    startPos: { x: 0, y: 2 },
    trashItems: [
      { id: 't1', pos: { x: 2, y: 3 }, item: TRASH_ITEMS.apple },
      { id: 't2', pos: { x: 4, y: 3 }, item: TRASH_ITEMS.can },
      { id: 't3', pos: { x: 6, y: 3 }, item: TRASH_ITEMS.battery }
    ],
    trashCans: [
      { pos: { x: 7, y: 2 }, type: 'ORGANIC', label: 'Organik', color: 'bg-emerald-600 border-emerald-500 text-white', emoji: '🟩' },
      { pos: { x: 7, y: 4 }, type: 'RECYCLABLE', label: 'Daur Ulang', color: 'bg-amber-500 border-amber-400 text-white', emoji: '🟨' },
      { pos: { x: 7, y: 6 }, type: 'B3', label: 'B3', color: 'bg-violet-600 border-violet-500 text-white', emoji: '🟦' }
    ],
    obstacles: [],
    maxCapacity: 3,
    maxInstructions: 22,
    starsThreshold: {
      three: 14,
      two: 22
    },
    hints: [
      "Klik tab robot di atas program stack untuk berganti robot yang dikontrol.",
      "Setiap robot hanya bisa mengambil sampah sesuai jenisnya sendiri.",
      "Saat semua program siap, klik Mulai untuk menjalankan 3 robot bersamaan!"
    ],
    ctInsights: {
      decomposition: "Memecah masalah menjadi 3 program terpisah: satu untuk setiap robot (Organik, Daur Ulang, B3).",
      pattern: "Mengenali bahwa setiap robot memiliki tipe sampah khusus — hijau (organik), kuning (daur ulang), ungu (B3).",
      abstraction: "Fokus pada program per robot secara independen, mengabaikan pergerakan robot lain yang berjalan paralel.",
      algorithm: "Susun algoritma untuk masing-masing robot: bergerak ke sampah → ambil → bergerak ke tong → buang."
    }
  },
  {
    id: 2,
    name: "2. Menghindari Rintangan",
    description: "Taman 8x8 dengan rintangan batu dan air. Tiga robot bekerja bersama mengumpulkan sampah Organik, Daur Ulang, dan B3 yang tersebar!",
    gridSize: { width: 8, height: 8 },
    robots: makeRobots(
      { x: 1, y: 0 },  // ORGANIC start — near banana
      { x: 5, y: 0 },  // RECYCLABLE start — near can
      { x: 7, y: 0 }   // B3 start — near bulb path
    ),
    startPos: { x: 2, y: 2 },
    trashItems: [
      { id: 't1', pos: { x: 1, y: 1 }, item: TRASH_ITEMS.banana },
      { id: 't2', pos: { x: 5, y: 1 }, item: TRASH_ITEMS.can },
      { id: 't3', pos: { x: 7, y: 7 }, item: TRASH_ITEMS.bulb }
    ],
    trashCans: [
      { pos: { x: 1, y: 5 }, type: 'ORGANIC', label: 'Organik', color: 'bg-emerald-600 border-emerald-500 text-white', emoji: '🟩' },
      { pos: { x: 5, y: 5 }, type: 'RECYCLABLE', label: 'Daur Ulang', color: 'bg-amber-500 border-amber-400 text-white', emoji: '🟨' },
      { pos: { x: 7, y: 5 }, type: 'B3', label: 'B3', color: 'bg-violet-600 border-violet-500 text-white', emoji: '🟦' }
    ],
    obstacles: [
      { pos: { x: 3, y: 1 }, type: 'rock', emoji: '🪨' },
      { pos: { x: 3, y: 2 }, type: 'rock', emoji: '🪨' },
      { pos: { x: 2, y: 4 }, type: 'water', emoji: '💧' },
      { pos: { x: 4, y: 4 }, type: 'water', emoji: '💧' }
    ],
    maxCapacity: 3,
    maxInstructions: 38,
    starsThreshold: {
      three: 28,
      two: 38
    },
    hints: [
      "Robot Organik mulai di kiri-atas, Robot Daur Ulang di kanan-atas, Robot B3 di ujung kanan.",
      "Hindari batu (🪨) dan air (💧) — mereka menghalangi gerakan semua robot.",
      "Setiap robot ambil 1 sampah dan buang ke tong masing-masing."
    ],
    ctInsights: {
      decomposition: "Memecah tugas menjadi 3 misi paralel: setiap robot menangani satu jenis sampah dan satu tong.",
      pattern: "Mengidentifikasi bahwa setiap rintangan menghalangi sel tertentu, dan setiap robot harus mencari jalannya sendiri.",
      abstraction: "Fokus pada navigasi per robot secara independen, karena robot tidak saling memengaruhi.",
      algorithm: "Masing-masing robot: bergerak ke sampahnya → ambil → navigasi ke tongnya → buang."
    }
  },
  {
    id: 3,
    name: "3. Abstraksi Rute Efisien",
    description: "Kiri kebun buah, kanan tempat pemilahan — dipisahkan dinding dengan pintu kecil. Robot Organik di kiri, Robot Daur Ulang dan B3 di kanan!",
    gridSize: { width: 8, height: 8 },
    robots: makeRobots(
      { x: 0, y: 0 },  // ORGANIC start — left side
      { x: 6, y: 0 },  // RECYCLABLE start — right side (past wall)
      { x: 6, y: 3 }   // B3 start — right side, near gap level
    ),
    startPos: { x: 0, y: 0 },
    trashItems: [
      { id: 't1', pos: { x: 2, y: 1 }, item: TRASH_ITEMS.apple },
      { id: 't2', pos: { x: 2, y: 3 }, item: TRASH_ITEMS.banana },
      { id: 't3', pos: { x: 2, y: 5 }, item: TRASH_ITEMS.carrot },
      { id: 't4', pos: { x: 6, y: 1 }, item: TRASH_ITEMS.glass },
      { id: 't5', pos: { x: 6, y: 5 }, item: TRASH_ITEMS.paint }
    ],
    trashCans: [
      { pos: { x: 7, y: 3 }, type: 'ORGANIC', label: 'Organik', color: 'bg-emerald-600 border-emerald-500 text-white', emoji: '🟩' },
      { pos: { x: 7, y: 1 }, type: 'RECYCLABLE', label: 'Daur Ulang', color: 'bg-amber-500 border-amber-400 text-white', emoji: '🟨' },
      { pos: { x: 7, y: 5 }, type: 'B3', label: 'B3', color: 'bg-violet-600 border-violet-500 text-white', emoji: '🟦' }
    ],
    obstacles: [
      { pos: { x: 4, y: 0 }, type: 'wall', emoji: '🧱' },
      { pos: { x: 4, y: 1 }, type: 'wall', emoji: '🧱' },
      { pos: { x: 4, y: 2 }, type: 'wall', emoji: '🧱' },
      // gerbang terbuka di y = 3
      { pos: { x: 4, y: 4 }, type: 'wall', emoji: '🧱' },
      { pos: { x: 4, y: 5 }, type: 'wall', emoji: '🧱' },
      { pos: { x: 4, y: 6 }, type: 'wall', emoji: '🧱' },
      { pos: { x: 4, y: 7 }, type: 'wall', emoji: '🧱' }
    ],
    maxCapacity: 5,
    maxInstructions: 40,
    starsThreshold: {
      three: 28,
      two: 38
    },
    hints: [
      "Dinding batu (🧱) membentang vertikal dengan celah terbuka hanya pada baris y = 3.",
      "Robot Organik di kiri harus melewati celah untuk membuang 3 sampah organik ke tong di kanan.",
      "Robot Daur Ulang dan B3 sudah di kanan — program mereka lebih pendek!"
    ],
    ctInsights: {
      decomposition: "Memecah peta menjadi 2 zona: kiri dinding (3 sampah organik, 1 robot) dan kanan dinding (daur ulang + B3, 2 robot).",
      pattern: "Melihat bahwa robot di kanan tidak perlu melewati dinding — mereka sudah di zona yang benar.",
      abstraction: "Setiap robot bekerja independen; Robot Organik perlu navigasi kompleks, sementara yang lain lebih sederhana.",
      algorithm: "Robot Organik: kumpulkan 3 organik di kiri, lewati celah, buang. Robot Daur Ulang: ambil botol kaca, buang. Robot B3: ambil kaleng cat, buang."
    }
  },
  {
    id: 4,
    name: "4. Koridor Pemilahan",
    description: "Koridor panjang 8x8. Tiga robot bekerja bersama membersihkan sampah Daur Ulang, Organik, dan B3 yang tersebar di berbagai sudut!",
    gridSize: { width: 8, height: 8 },
    robots: makeRobots(
      { x: 0, y: 6 },  // ORGANIC start — near carrot
      { x: 0, y: 3 },  // RECYCLABLE start — center corridor
      { x: 6, y: 6 }   // B3 start — near battery
    ),
    startPos: { x: 0, y: 3 },
    trashItems: [
      { id: 't1', pos: { x: 3, y: 3 }, item: TRASH_ITEMS.can },
      { id: 't2', pos: { x: 4, y: 1 }, item: TRASH_ITEMS.glass },
      { id: 't3', pos: { x: 2, y: 4 }, item: TRASH_ITEMS.cd },
      { id: 't4', pos: { x: 5, y: 2 }, item: TRASH_ITEMS.can },
      { id: 't5', pos: { x: 1, y: 7 }, item: TRASH_ITEMS.carrot },
      { id: 't6', pos: { x: 6, y: 7 }, item: TRASH_ITEMS.battery }
    ],
    trashCans: [
      { pos: { x: 7, y: 3 }, type: 'RECYCLABLE', label: 'Daur Ulang', color: 'bg-amber-500 border-amber-400 text-white', emoji: '🟨' },
      { pos: { x: 0, y: 6 }, type: 'ORGANIC', label: 'Organik', color: 'bg-emerald-600 border-emerald-500 text-white', emoji: '🟩' },
      { pos: { x: 7, y: 7 }, type: 'B3', label: 'B3', color: 'bg-violet-600 border-violet-500 text-white', emoji: '🟦' }
    ],
    obstacles: [],
    maxCapacity: 5,
    maxInstructions: 28,
    starsThreshold: {
      three: 20,
      two: 26
    },
    hints: [
      "Robot Daur Ulang punya tugas paling berat — kumpulkan 4 sampah sebelum ke tong!",
      "Robot Organik dan B3 hanya punya 1 sampah masing-masing.",
      "Gunakan kapasitas tas untuk mengangkut beberapa sampah sekaligus."
    ],
    ctInsights: {
      decomposition: "Memecah rute per robot: RECYCLABLE kumpulkan 4 di tengah, ORGANIC ambil wortel di kiri-bawah, B3 ambil baterai di kanan-bawah.",
      pattern: "Mengenali bahwa Robot Daur Ulang perlu strategi zig-zag, sementara yang lain cukup linear.",
      abstraction: "Fokus pada program per robot — beban kerja tidak sama, setiap robot punya kompleksitas berbeda.",
      algorithm: "RECYCLABLE: zig-zag kumpulkan 4 sampah → buang di (7,3). ORGANIC: ambil wortel (1,7) → buang di (0,6). B3: ambil baterai (6,7) → buang di (7,7)."
    }
  },
  {
    id: 5,
    name: "5. Pusat Pemilahan Agung",
    description: "Tantangan utama! 3 robot, 6 sampah (Organik, Daur Ulang, B3) tersebar di taman 8x8. Susun strategi dan koordinasi 3 program sekaligus!",
    gridSize: { width: 8, height: 8 },
    robots: makeRobots(
      { x: 3, y: 0 },  // ORGANIC start — center top
      { x: 6, y: 0 },  // RECYCLABLE start — right top
      { x: 1, y: 0 }   // B3 start — left top
    ),
    startPos: { x: 3, y: 0 },
    trashItems: [
      { id: 't1', pos: { x: 1, y: 1 }, item: TRASH_ITEMS.apple },      // Organik
      { id: 't2', pos: { x: 6, y: 1 }, item: TRASH_ITEMS.can },        // Daur Ulang
      { id: 't3', pos: { x: 1, y: 5 }, item: TRASH_ITEMS.battery },    // B3
      { id: 't4', pos: { x: 6, y: 5 }, item: TRASH_ITEMS.paint },      // B3
      { id: 't5', pos: { x: 2, y: 7 }, item: TRASH_ITEMS.banana },     // Organik
      { id: 't6', pos: { x: 5, y: 7 }, item: TRASH_ITEMS.glass }       // Daur Ulang
    ],
    trashCans: [
      { pos: { x: 3, y: 2 }, type: 'ORGANIC', label: 'Organik', color: 'bg-emerald-600 border-emerald-500 text-white', emoji: '🟩' },
      { pos: { x: 3, y: 5 }, type: 'RECYCLABLE', label: 'Daur Ulang', color: 'bg-amber-500 border-amber-400 text-white', emoji: '🟨' },
      { pos: { x: 3, y: 3 }, type: 'B3', label: 'B3', color: 'bg-violet-600 border-violet-500 text-white', emoji: '🟦' }
    ],
    obstacles: [
      { pos: { x: 0, y: 3 }, type: 'bush', emoji: '🌳' },
      { pos: { x: 7, y: 3 }, type: 'bush', emoji: '🌳' },
      { pos: { x: 2, y: 1 }, type: 'water', emoji: '💧' },
      { pos: { x: 5, y: 1 }, type: 'water', emoji: '💧' },
      { pos: { x: 2, y: 5 }, type: 'water', emoji: '💧' },
      { pos: { x: 5, y: 5 }, type: 'water', emoji: '💧' },
      { pos: { x: 1, y: 3 }, type: 'water', emoji: '💧' },
      { pos: { x: 6, y: 3 }, type: 'water', emoji: '💧' }
    ],
    maxCapacity: 6,
    maxInstructions: 50,
    starsThreshold: {
      three: 32,
      two: 44
    },
    hints: [
      "Robot Organik ambil 2 sampah (atas & bawah kiri), Robot Daur Ulang ambil 2 (atas & bawah kanan), Robot B3 ambil 2 (kiri & kanan bawah).",
      "Tong pemilahan di kolom tengah x=3: Hijau (3,2), Biru/B3 (3,3), Kuning (3,5).",
      "Rintangan air membatasi akses langsung horizontal — cari jalur memutar."
    ],
    ctInsights: {
      decomposition: "3 robot, 3 zona: ORGANIC di kiri, RECYCLABLE di kanan, B3 menyebar di bawah.",
      pattern: "Tong sampah berbaris vertikal di tengah (x=3). Setiap robot punya area sendiri.",
      abstraction: "Setiap robot independen — tidak perlu sinkronisasi karena tidak ada tabrakan.",
      algorithm: "ORGANIC: ambil apel (1,1) & pisang (2,7) → buang di (3,2). RECYCLABLE: ambil kaleng (6,1) & gelas (5,7) → buang di (3,5). B3: ambil baterai (1,5) & cat (6,5) → buang di (3,3)."
    }
  },
  {
    id: 6,
    name: "6. Tantangan Ultimate",
    description: "Puncak tantangan! 3 robot, 6 sampah semua jenis, peta 8x8 penuh rintangan. Buktikan penguasaan algoritma multi-robot!",
    gridSize: { width: 8, height: 8 },
    robots: makeRobots(
      { x: 0, y: 0 },  // ORGANIC start
      { x: 7, y: 0 },  // RECYCLABLE start — right side
      { x: 0, y: 7 }   // B3 start — bottom left
    ),
    startPos: { x: 0, y: 0 },
    trashItems: [
      { id: 't1', pos: { x: 2, y: 1 }, item: TRASH_ITEMS.apple },      // Organik
      { id: 't2', pos: { x: 5, y: 2 }, item: TRASH_ITEMS.can },        // Daur Ulang
      { id: 't3', pos: { x: 1, y: 4 }, item: TRASH_ITEMS.banana },     // Organik
      { id: 't4', pos: { x: 6, y: 5 }, item: TRASH_ITEMS.glass },      // Daur Ulang
      { id: 't5', pos: { x: 3, y: 6 }, item: TRASH_ITEMS.bulb },       // B3
      { id: 't6', pos: { x: 7, y: 7 }, item: TRASH_ITEMS.battery }     // B3
    ],
    trashCans: [
      { pos: { x: 4, y: 0 }, type: 'ORGANIC', label: 'Organik', color: 'bg-emerald-600 border-emerald-500 text-white', emoji: '🟩' },
      { pos: { x: 7, y: 3 }, type: 'RECYCLABLE', label: 'Daur Ulang', color: 'bg-amber-500 border-amber-400 text-white', emoji: '🟨' },
      { pos: { x: 7, y: 7 }, type: 'B3', label: 'B3', color: 'bg-violet-600 border-violet-500 text-white', emoji: '🟦' }
    ],
    obstacles: [
      { pos: { x: 3, y: 2 }, type: 'bush', emoji: '🌳' },
      { pos: { x: 3, y: 3 }, type: 'bush', emoji: '🌳' },
      { pos: { x: 4, y: 4 }, type: 'rock', emoji: '🪨' },
      { pos: { x: 5, y: 4 }, type: 'rock', emoji: '🪨' },
      { pos: { x: 2, y: 6 }, type: 'water', emoji: '💧' },
      { pos: { x: 6, y: 1 }, type: 'water', emoji: '💧' }
    ],
    maxCapacity: 6,
    maxInstructions: 50,
    starsThreshold: {
      three: 30,
      two: 42
    },
    hints: [
      "Robot Organik (kiri-atas) ambil 2 sampah Organik, Robot Daur Ulang (kanan-atas) ambil 2 Daur Ulang, Robot B3 (kiri-bawah) ambil 2 B3.",
      "Semak dan batu memblokir jalur tengah — cari alternatif di tepi.",
      "Robot B3 paling dekat dengan 2 sampah B3 (bohlam & baterai)."
    ],
    ctInsights: {
      decomposition: "3 robot dengan 3 zona berbeda: ORGANIC (utara), RECYCLABLE (timur), B3 (selatan).",
      pattern: "Setiap robot sudah ditempatkan di zona yang sesuai dengan jenis sampahnya.",
      abstraction: "Program per robot berdiri sendiri — jumlah langkah total adalah jumlah langkah ketiga robot.",
      algorithm: "ORGANIC: ambil apel (2,1) & pisang (1,4) → buang di (4,0). RECYCLABLE: ambil kaleng (5,2) & gelas (6,5) → buang di (7,3). B3: ambil bohlam (3,6) & baterai (7,7) → buang di (7,7)."
    }
  }
];
