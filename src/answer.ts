/**
 * Puzzle Pemrograman: Pemilah Sampah v2 - Kunci Jawaban & Panduan Solusi Lengkap (Level 1 - 3)
 * Konsep: Algoritma Pemrograman, Struktur Data Tumpukan (Stack / Strict FILO), & Computational Thinking
 * 
 * Sinkronisasi Penuh:
 * • Level 1: 18 Langkah (threeStarThreshold: 18)
 * • Level 2: 21 Langkah (threeStarThreshold: 21)
 * • Level 3: 24 Langkah (threeStarThreshold: 24)
 * (Level makin besar, jumlah langkah bertambah secara konsisten dan progresif: 18 -> 21 -> 24)
 * 
 * 🌐 Live URL Demo: https://glenrioariesto.github.io/puzzle-pemrograman-pemilah-sampah-v2/
 * 📂 Repository: https://github.com/glenrioariesto/puzzle-pemrograman-pemilah-sampah-v2
 */

import { CommandAction, TrashType } from './types';

export interface StepActionDetail {
  step: number;
  action: CommandAction;
  actionLabel: string;
  posX: number;
  posY: number;
  backpack: string[];
  description: string;
}

export interface LevelSolutionAnswer {
  levelId: number;
  name: string;
  difficulty: 'Mudah' | 'Sedang' | 'Tantangan';
  liveUrl: string;
  optimalStepsCount: number;
  threeStarThreshold: number;
  twoStarThreshold: number;
  commands: CommandAction[];
  commandSequenceIndonesian: string[];
  strategySummary: string;
  stackExplanation: string;
  trashItemsCollected: {
    name: string;
    type: TrashType;
    gridX: number;
    destinationCan: string;
    destinationCanX: number;
  }[];
  computationalThinking: {
    decomposition: string;
    pattern: string;
    abstraction: string;
    algorithm: string;
  };
  stepByStepGuide: StepActionDetail[];
}

export const puzzlePemilahSampahAnswers: LevelSolutionAnswer[] = [
  // ── LEVEL 1 ─────────────────────────────────────────────────────────────────
  {
    levelId: 1,
    name: '1. Pemilahan Dasar & Tumpukan Tas',
    difficulty: 'Mudah',
    liveUrl: 'https://glenrioariesto.github.io/puzzle-pemrograman-pemilah-sampah-v2/',
    optimalStepsCount: 18,
    threeStarThreshold: 18,
    twoStarThreshold: 22,
    commands: [
      'RIGHT', 'RIGHT', 'RIGHT', 'PICK',
      'RIGHT', 'UP', 'RIGHT', 'PICK',
      'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DROP',
      'LEFT', 'DROP'
    ],
    commandSequenceIndonesian: [
      'Kanan', 'Kanan', 'Kanan', 'Ambil Sampah',
      'Kanan', 'Atas (Loncat)', 'Kanan', 'Ambil Sampah',
      'Kanan', 'Kanan', 'Kanan', 'Kanan', 'Kanan', 'Kanan', 'Kanan', 'Buang Sampah',
      'Kiri', 'Buang Sampah'
    ],
    strategySummary: 'Ambil Apel di x=3, maju ke x=4 lalu gunakan tombol LONCAT (Atas) untuk melompati batu di x=5 dan mendarat di x=6. Ambil Kaleng Minuman di x=7. Karena Kaleng Minuman berada di urutan teratas tumpukan tas (Strict FILO), buang terlebih dahulu ke Tong Daur Ulang Kuning di x=14, kemudian mundur 1 langkah ke x=13 untuk membuang Apel ke Tong Organik Hijau (Tepat 18 langkah, 100% sinkron target 3 Bintang).',
    stackExplanation: 'Sistem tas ransel menggunakan prinsip Strict FILO (First-In, Last-Out) / LIFO (Last-In, First-Out). Apel diambil pertama kali (First In, berada di dasar tas), kemudian Kaleng Minuman diambil kedua (Last In, berada di puncak tas). Maka, saat berada di area tong sampah, Kaleng Minuman (puncak tas) WAJIB dibuang lebih dulu ke Tong Daur Ulang (x=14) sebelum Apel dapat dikeluarkan (Last Out) ke Tong Organik (x=13).',
    trashItemsCollected: [
      { name: 'Apel', type: 'ORGANIC', gridX: 3, destinationCan: 'Tong Organik (Hijau)', destinationCanX: 13 },
      { name: 'Kaleng Minuman', type: 'RECYCLABLE', gridX: 7, destinationCan: 'Tong Daur Ulang (Kuning)', destinationCanX: 14 }
    ],
    computationalThinking: {
      decomposition: '1) Bergerak ke x=3 dan ambil Apel. 2) Lewati rintangan batu di x=5 dengan melompat dari x=4 ke x=6. 3) Ambil Kaleng di x=7. 4) Bergerak ke Tong Kuning (x=14) buang Kaleng. 5) Mundur ke Tong Hijau (x=13) buang Apel.',
      pattern: 'Pola tumpukan tas: Sampah yang diambil paling akhir harus diproses pertama kali (Strict FILO).',
      abstraction: 'Fokus pada lintasan horizontal x=0 hingga x=15 pada baris y=3.',
      algorithm: 'Kanan 3x -> Ambil -> Kanan 1x -> Loncat -> Kanan 1x -> Ambil -> Kanan 7x -> Buang -> Kiri 1x -> Buang.'
    },
    stepByStepGuide: [
      { step: 1,  action: 'RIGHT', actionLabel: 'Kanan',        posX: 1,  posY: 3, backpack: [],                             description: 'Maju ke x=1' },
      { step: 2,  action: 'RIGHT', actionLabel: 'Kanan',        posX: 2,  posY: 3, backpack: [],                             description: 'Maju ke x=2' },
      { step: 3,  action: 'RIGHT', actionLabel: 'Kanan',        posX: 3,  posY: 3, backpack: [],                             description: 'Tiba di posisi Apel (x=3)' },
      { step: 4,  action: 'PICK',  actionLabel: 'Ambil Sampah', posX: 3,  posY: 3, backpack: ['Apel (Organik)'],             description: 'Mengambil Apel, masuk ke dasar tas ransel' },
      { step: 5,  action: 'RIGHT', actionLabel: 'Kanan',        posX: 4,  posY: 3, backpack: ['Apel (Organik)'],             description: 'Maju ke x=4, bersiap melompati batu di x=5' },
      { step: 6,  action: 'UP',    actionLabel: 'Atas (Loncat)',posX: 6,  posY: 3, backpack: ['Apel (Organik)'],             description: 'Melompati batu di x=5, mendarat di x=6' },
      { step: 7,  action: 'RIGHT', actionLabel: 'Kanan',        posX: 7,  posY: 3, backpack: ['Apel (Organik)'],             description: 'Tiba di posisi Kaleng Minuman (x=7)' },
      { step: 8,  action: 'PICK',  actionLabel: 'Ambil Sampah', posX: 7,  posY: 3, backpack: ['Apel', 'Kaleng (Daur Ulang)'], description: 'Mengambil Kaleng Minuman, menjadi tumpukan teratas tas' },
      { step: 9,  action: 'RIGHT', actionLabel: 'Kanan',        posX: 8,  posY: 3, backpack: ['Apel', 'Kaleng'],             description: 'Maju menuju area pemilahan tong sampah' },
      { step: 10, action: 'RIGHT', actionLabel: 'Kanan',        posX: 9,  posY: 3, backpack: ['Apel', 'Kaleng'],             description: 'Maju ke x=9' },
      { step: 11, action: 'RIGHT', actionLabel: 'Kanan',        posX: 10, posY: 3, backpack: ['Apel', 'Kaleng'],             description: 'Maju ke x=10' },
      { step: 12, action: 'RIGHT', actionLabel: 'Kanan',        posX: 11, posY: 3, backpack: ['Apel', 'Kaleng'],             description: 'Maju ke x=11' },
      { step: 13, action: 'RIGHT', actionLabel: 'Kanan',        posX: 12, posY: 3, backpack: ['Apel', 'Kaleng'],             description: 'Maju ke x=12' },
      { step: 14, action: 'RIGHT', actionLabel: 'Kanan',        posX: 13, posY: 3, backpack: ['Apel', 'Kaleng'],             description: 'Melewati Tong Hijau (x=13) karena Kaleng teratas tidak cocok' },
      { step: 15, action: 'RIGHT', actionLabel: 'Kanan',        posX: 14, posY: 3, backpack: ['Apel', 'Kaleng'],             description: 'Tiba di Tong Daur Ulang Kuning (x=14)' },
      { step: 16, action: 'DROP',  actionLabel: 'Buang Sampah', posX: 14, posY: 3, backpack: ['Apel (Organik)'],             description: 'Membuang Kaleng Minuman ke Tong Kuning' },
      { step: 17, action: 'LEFT',  actionLabel: 'Kiri',         posX: 13, posY: 3, backpack: ['Apel (Organik)'],             description: 'Mundur 1 langkah ke Tong Organik Hijau (x=13)' },
      { step: 18, action: 'DROP',  actionLabel: 'Buang Sampah', posX: 13, posY: 3, backpack: [],                             description: 'Membuang Apel ke Tong Hijau. Tas bersih & Level Selesai!' }
    ]
  },

  // ── LEVEL 2 ─────────────────────────────────────────────────────────────────
  {
    levelId: 2,
    name: '2. Tiga Jenis Sampah & Urutan Tumpukan',
    difficulty: 'Sedang',
    liveUrl: 'https://glenrioariesto.github.io/puzzle-pemrograman-pemilah-sampah-v2/',
    optimalStepsCount: 21,
    threeStarThreshold: 21,
    twoStarThreshold: 25,
    commands: [
      'RIGHT', 'RIGHT', 'RIGHT', 'PICK',
      'RIGHT', 'UP', 'RIGHT', 'PICK',
      'RIGHT', 'UP', 'PICK',
      'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DROP',
      'LEFT', 'DROP',
      'LEFT', 'DROP'
    ],
    commandSequenceIndonesian: [
      'Kanan', 'Kanan', 'Kanan', 'Ambil Sampah',
      'Kanan', 'Atas (Loncat)', 'Kanan', 'Ambil Sampah',
      'Kanan', 'Atas (Loncat)', 'Ambil Sampah',
      'Kanan', 'Kanan', 'Kanan', 'Kanan', 'Kanan', 'Buang Sampah',
      'Kiri', 'Buang Sampah',
      'Kiri', 'Buang Sampah'
    ],
    strategySummary: 'Kumpulkan 3 jenis sampah secara berurutan: Apel di x=3 -> loncat batu x=5 -> Kaleng Minuman di x=7 -> loncat batu x=9 (mendarat di x=10) -> langsung ambil Baterai Bekas di x=10. Urutan tumpukan tas (FILO): [Bawah: Apel | Kaleng | Atas: Baterai]. Berjalan lurus ke Tong Merah B3 (x=15) dan buang Baterai, lalu mundur bertahap ke Tong Kuning (x=14) buang Kaleng, dan mundur ke Tong Hijau (x=13) buang Apel (Tepat 21 langkah, 100% sinkron target 3 Bintang).',
    stackExplanation: 'Kapasitas maksimal tas adalah 3 sampah. Karena urutan pengambilan adalah Apel (1st) -> Kaleng (2nd) -> Baterai (3rd), maka tumpukan tas Strict FILO dari atas ke bawah adalah: [Atas: Baterai (B3) | Tengah: Kaleng (Daur Ulang) | Bawah: Apel (Organik)]. Urutan buang mundur yang sinkron dengan posisi tong adalah: x=15 (Tong B3) -> x=14 (Tong Daur Ulang) -> x=13 (Tong Organik).',
    trashItemsCollected: [
      { name: 'Apel', type: 'ORGANIC', gridX: 3, destinationCan: 'Tong Organik (Hijau)', destinationCanX: 13 },
      { name: 'Kaleng Minuman', type: 'RECYCLABLE', gridX: 7, destinationCan: 'Tong Daur Ulang (Kuning)', destinationCanX: 14 },
      { name: 'Baterai Bekas', type: 'B3', gridX: 10, destinationCan: 'Tong B3 (Merah)', destinationCanX: 15 }
    ],
    computationalThinking: {
      decomposition: '1) Ambil Apel (x=3). 2) Loncat batu ke-1 (x=5) & ambil Kaleng (x=7). 3) Loncat batu ke-2 (x=9) & ambil Baterai (x=10). 4) Buang berturut-turut di x=15, mundur ke x=14, mundur ke x=13.',
      pattern: 'Pola mundur teratur (15 -> 14 -> 13) saat membuang sampah mengeliminasi langkah bolak-balik yang tidak perlu sehingga tepat 21 langkah.',
      abstraction: 'Memetakan urutan tumpukan FILO secara inversi langsung dengan posisi tong di ujung kanan panggung.',
      algorithm: 'Kanan 3x -> Ambil -> Kanan 1x -> Loncat -> Kanan 1x -> Ambil -> Kanan 1x -> Loncat -> Ambil -> Kanan 5x -> Buang -> Kiri 1x -> Buang -> Kiri 1x -> Buang.'
    },
    stepByStepGuide: [
      { step: 1,  action: 'RIGHT', actionLabel: 'Kanan',        posX: 1,  posY: 3, backpack: [],                                     description: 'Maju ke x=1' },
      { step: 2,  action: 'RIGHT', actionLabel: 'Kanan',        posX: 2,  posY: 3, backpack: [],                                     description: 'Maju ke x=2' },
      { step: 3,  action: 'RIGHT', actionLabel: 'Kanan',        posX: 3,  posY: 3, backpack: [],                                     description: 'Tiba di Apel (x=3)' },
      { step: 4,  action: 'PICK',  actionLabel: 'Ambil Sampah', posX: 3,  posY: 3, backpack: ['Apel (Organik)'],                     description: 'Mengambil Apel (dasar tas)' },
      { step: 5,  action: 'RIGHT', actionLabel: 'Kanan',        posX: 4,  posY: 3, backpack: ['Apel (Organik)'],                     description: 'Maju ke x=4 sebelum batu ke-1' },
      { step: 6,  action: 'UP',    actionLabel: 'Atas (Loncat)',posX: 6,  posY: 3, backpack: ['Apel (Organik)'],                     description: 'Melompati batu x=5, mendarat di x=6' },
      { step: 7,  action: 'RIGHT', actionLabel: 'Kanan',        posX: 7,  posY: 3, backpack: ['Apel (Organik)'],                     description: 'Tiba di Kaleng Minuman (x=7)' },
      { step: 8,  action: 'PICK',  actionLabel: 'Ambil Sampah', posX: 7,  posY: 3, backpack: ['Apel', 'Kaleng (Daur Ulang)'],         description: 'Mengambil Kaleng Minuman' },
      { step: 9,  action: 'RIGHT', actionLabel: 'Kanan',        posX: 8,  posY: 3, backpack: ['Apel', 'Kaleng'],                     description: 'Maju ke x=8 sebelum batu ke-2' },
      { step: 10, action: 'UP',    actionLabel: 'Atas (Loncat)',posX: 10, posY: 3, backpack: ['Apel', 'Kaleng'],                     description: 'Melompati batu x=9, mendarat persis di atas Baterai (x=10)' },
      { step: 11, action: 'PICK',  actionLabel: 'Ambil Sampah', posX: 10, posY: 3, backpack: ['Apel', 'Kaleng', 'Baterai (B3)'],      description: 'Mengambil Baterai Bekas (puncak tas)' },
      { step: 12, action: 'RIGHT', actionLabel: 'Kanan',        posX: 11, posY: 3, backpack: ['Apel', 'Kaleng', 'Baterai'],             description: 'Maju ke x=11 menuju tong B3' },
      { step: 13, action: 'RIGHT', actionLabel: 'Kanan',        posX: 12, posY: 3, backpack: ['Apel', 'Kaleng', 'Baterai'],             description: 'Maju ke x=12' },
      { step: 14, action: 'RIGHT', actionLabel: 'Kanan',        posX: 13, posY: 3, backpack: ['Apel', 'Kaleng', 'Baterai'],             description: 'Melewati x=13' },
      { step: 15, action: 'RIGHT', actionLabel: 'Kanan',        posX: 14, posY: 3, backpack: ['Apel', 'Kaleng', 'Baterai'],             description: 'Melewati x=14' },
      { step: 16, action: 'RIGHT', actionLabel: 'Kanan',        posX: 15, posY: 3, backpack: ['Apel', 'Kaleng', 'Baterai'],             description: 'Tiba di Tong Merah B3 (x=15)' },
      { step: 17, action: 'DROP',  actionLabel: 'Buang Sampah', posX: 15, posY: 3, backpack: ['Apel', 'Kaleng'],                     description: 'Membuang Baterai Bekas ke Tong B3' },
      { step: 18, action: 'LEFT',  actionLabel: 'Kiri',         posX: 14, posY: 3, backpack: ['Apel', 'Kaleng'],                     description: 'Mundur ke Tong Kuning Daur Ulang (x=14)' },
      { step: 19, action: 'DROP',  actionLabel: 'Buang Sampah', posX: 14, posY: 3, backpack: ['Apel (Organik)'],                     description: 'Membuang Kaleng Minuman ke Tong Kuning' },
      { step: 20, action: 'LEFT',  actionLabel: 'Kiri',         posX: 13, posY: 3, backpack: ['Apel (Organik)'],                     description: 'Mundur ke Tong Hijau Organik (x=13)' },
      { step: 21, action: 'DROP',  actionLabel: 'Buang Sampah', posX: 13, posY: 3, backpack: [],                                     description: 'Membuang Apel ke Tong Hijau. Selesai Sempurna 3 Bintang!' }
    ]
  },

  // ── LEVEL 3 ─────────────────────────────────────────────────────────────────
  {
    levelId: 3,
    name: '3. Rintangan Tiga Batu & Manajemen Tumpukan',
    difficulty: 'Tantangan',
    liveUrl: 'https://glenrioariesto.github.io/puzzle-pemrograman-pemilah-sampah-v2/',
    optimalStepsCount: 26,
    threeStarThreshold: 26,
    twoStarThreshold: 30,
    commands: [
      'RIGHT', 'PICK',
      'UP', 'PICK',
      'RIGHT', 'UP', 'RIGHT', 'PICK',
      'RIGHT', 'UP',
      'RIGHT', 'RIGHT', 'RIGHT',
      'DROP',
      'RIGHT', 'DROP',
      'LEFT', 'DROP',
      'LEFT', 'LEFT', 'PICK',
      'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DROP'
    ],
    commandSequenceIndonesian: [
      'Kanan', 'Ambil Sampah',
      'Atas (Loncat)', 'Ambil Sampah',
      'Kanan', 'Atas (Loncat)', 'Kanan', 'Ambil Sampah',
      'Kanan', 'Atas (Loncat)',
      'Kanan', 'Kanan', 'Kanan',
      'Buang Sampah',
      'Kanan', 'Buang Sampah',
      'Kiri', 'Buang Sampah',
      'Kiri', 'Kiri', 'Ambil Sampah',
      'Kanan', 'Kanan', 'Kanan', 'Kanan', 'Buang Sampah'
    ],
    strategySummary: 'Tantangan Puncak Grand Master! Kapasitas tas TETAP 3 sampah, sedangkan di arena terdapat 4 jenis sampah. Pemain ditantang menerapkan strategi Dua Fase (Two-Trip Strategy): Trip 1 mengumpulkan 3 sampah pertama (Apel di x=1, Kaleng di x=3, Sayur di x=7), lalu melompati batu ke-3 di x=9 menuju tong sampah dan membuang ketiganya sesuai aturan Strict FILO (Tong Hijau x=13 -> Tong Kuning x=14 -> Tong Hijau x=13) hingga tas kosong. Trip 2 melangkah mundur ke x=11 mengambil Baterai Bekas, lalu maju ke Tong Merah x=15 untuk membuangnya (Tepat 26 Langkah, Rekor 3 Bintang!).',
    stackExplanation: 'Kapasitas maksimal tas tetap dipertahankan 3 slot untuk melatih batasan memori (Buffer/Resource Constraint). Karena terdapat 4 sampah, seluruh sampah tidak muat sekaligus dalam 1 kali perjalanan. Pemain harus mengosongkan tas terlebih dahulu (Trip 1) sebelum dapat kembali mengambil sampah terakhir (Trip 2). Pada setiap trip, aturan Strict FILO (First-In, Last-Out) wajib dipenuhi.',
    trashItemsCollected: [
      { name: 'Apel', type: 'ORGANIC', gridX: 1, destinationCan: 'Tong Organik (Hijau)', destinationCanX: 13 },
      { name: 'Kaleng Minuman', type: 'RECYCLABLE', gridX: 3, destinationCan: 'Tong Daur Ulang (Kuning)', destinationCanX: 14 },
      { name: 'Sayur', type: 'ORGANIC', gridX: 7, destinationCan: 'Tong Organik (Hijau)', destinationCanX: 13 },
      { name: 'Baterai Bekas', type: 'B3', gridX: 11, destinationCan: 'Tong B3 (Merah)', destinationCanX: 15 }
    ],
    computationalThinking: {
      decomposition: 'Trip 1: Kumpulkan 3 sampah (Apel, Kaleng, Sayur) -> Buang di Tong x=13, x=14, x=13. Trip 2: Mundur ke x=11 ambil Baterai -> Buang di Tong Merah x=15.',
      pattern: 'Pola Pemrosesan Dua Fase (Batching / Two-Trip): Menyelesaikan masalah saat kapasitas penyimpan sementara (buffer tas = 3) lebih kecil daripada total data yang harus diproses (4 sampah).',
      abstraction: 'Memilih 3 sampah pertama untuk kloter pengiriman pertama, dan menyisakan Baterai di x=11 yang letaknya paling dekat dengan area tong sampah.',
      algorithm: 'Trip 1: Kanan 1x -> Ambil -> Loncat -> Ambil -> Kanan 1x -> Loncat -> Kanan 1x -> Ambil -> Kanan 1x -> Loncat -> Kanan 3x -> Buang -> Kanan 1x -> Buang -> Kiri 1x -> Buang. Trip 2: Kiri 2x -> Ambil -> Kanan 4x -> Buang (Total 26 Langkah).'
    },
    stepByStepGuide: [
      { step: 1,  action: 'RIGHT', actionLabel: 'Kanan',        posX: 1,  posY: 3, backpack: [],                                     description: 'Maju ke x=1 (posisi Apel)' },
      { step: 2,  action: 'PICK',  actionLabel: 'Ambil Sampah', posX: 1,  posY: 3, backpack: ['Apel (Organik)'],                     description: 'Mengambil Apel (tas 1/3)' },
      { step: 3,  action: 'UP',    actionLabel: 'Atas (Loncat)',posX: 3,  posY: 3, backpack: ['Apel (Organik)'],                     description: 'Melompati batu x=2, mendarat di Kaleng (x=3)' },
      { step: 4,  action: 'PICK',  actionLabel: 'Ambil Sampah', posX: 3,  posY: 3, backpack: ['Apel', 'Kaleng (Daur Ulang)'],         description: 'Mengambil Kaleng Minuman (tas 2/3)' },
      { step: 5,  action: 'RIGHT', actionLabel: 'Kanan',        posX: 4,  posY: 3, backpack: ['Apel', 'Kaleng'],                     description: 'Maju ke x=4 sebelum batu ke-2 di x=5' },
      { step: 6,  action: 'UP',    actionLabel: 'Atas (Loncat)',posX: 6,  posY: 3, backpack: ['Apel', 'Kaleng'],                     description: 'Melompati batu x=5, mendarat di x=6' },
      { step: 7,  action: 'RIGHT', actionLabel: 'Kanan',        posX: 7,  posY: 3, backpack: ['Apel', 'Kaleng'],                     description: 'Tiba di Sayur (x=7)' },
      { step: 8,  action: 'PICK',  actionLabel: 'Ambil Sampah', posX: 7,  posY: 3, backpack: ['Apel', 'Kaleng', 'Sayur (Organik)'],  description: 'Mengambil Sayur (Tas PENUH 3/3!)' },
      { step: 9,  action: 'RIGHT', actionLabel: 'Kanan',        posX: 8,  posY: 3, backpack: ['Apel', 'Kaleng', 'Sayur'],             description: 'Maju ke x=8 sebelum batu ke-3 di x=9' },
      { step: 10, action: 'UP',    actionLabel: 'Atas (Loncat)',posX: 10, posY: 3, backpack: ['Apel', 'Kaleng', 'Sayur'],             description: 'Melompati batu x=9, mendarat di x=10' },
      { step: 11, action: 'RIGHT', actionLabel: 'Kanan',        posX: 11, posY: 3, backpack: ['Apel', 'Kaleng', 'Sayur'],             description: 'Melewati Baterai di x=11 (tas penuh, diambil nanti)' },
      { step: 12, action: 'RIGHT', actionLabel: 'Kanan',        posX: 12, posY: 3, backpack: ['Apel', 'Kaleng', 'Sayur'],             description: 'Maju ke x=12' },
      { step: 13, action: 'RIGHT', actionLabel: 'Kanan',        posX: 13, posY: 3, backpack: ['Apel', 'Kaleng', 'Sayur'],             description: 'Tiba di Tong Organik Hijau (x=13)' },
      { step: 14, action: 'DROP',  actionLabel: 'Buang Sampah', posX: 13, posY: 3, backpack: ['Apel', 'Kaleng'],                     description: 'Membuang Sayur (puncak tas) ke Tong Hijau' },
      { step: 15, action: 'RIGHT', actionLabel: 'Kanan',        posX: 14, posY: 3, backpack: ['Apel', 'Kaleng'],                     description: 'Maju ke Tong Daur Ulang Kuning (x=14)' },
      { step: 16, action: 'DROP',  actionLabel: 'Buang Sampah', posX: 14, posY: 3, backpack: ['Apel (Organik)'],                     description: 'Membuang Kaleng Minuman ke Tong Kuning' },
      { step: 17, action: 'LEFT',  actionLabel: 'Kiri',         posX: 13, posY: 3, backpack: ['Apel (Organik)'],                     description: 'Mundur ke Tong Organik Hijau (x=13)' },
      { step: 18, action: 'DROP',  actionLabel: 'Buang Sampah', posX: 13, posY: 3, backpack: [],                                     description: 'Membuang Apel ke Tong Hijau (Trip 1 Selesai, Tas KOSONG 0/3!)' },
      { step: 19, action: 'LEFT',  actionLabel: 'Kiri',         posX: 12, posY: 3, backpack: [],                                     description: 'Trip 2: Mundur ke x=12 menuju sisa sampah' },
      { step: 20, action: 'LEFT',  actionLabel: 'Kiri',         posX: 11, posY: 3, backpack: [],                                     description: 'Tiba di posisi Baterai Bekas (x=11)' },
      { step: 21, action: 'PICK',  actionLabel: 'Ambil Sampah', posX: 11, posY: 3, backpack: ['Baterai Bekas (B3)'],                 description: 'Mengambil Baterai Bekas (tas 1/3)' },
      { step: 22, action: 'RIGHT', actionLabel: 'Kanan',        posX: 12, posY: 3, backpack: ['Baterai Bekas (B3)'],                 description: 'Maju ke x=12' },
      { step: 23, action: 'RIGHT', actionLabel: 'Kanan',        posX: 13, posY: 3, backpack: ['Baterai Bekas (B3)'],                 description: 'Melewati x=13' },
      { step: 24, action: 'RIGHT', actionLabel: 'Kanan',        posX: 14, posY: 3, backpack: ['Baterai Bekas (B3)'],                 description: 'Melewati x=14' },
      { step: 25, action: 'RIGHT', actionLabel: 'Kanan',        posX: 15, posY: 3, backpack: ['Baterai Bekas (B3)'],                 description: 'Tiba di Tong Merah B3 (x=15)' },
      { step: 26, action: 'DROP',  actionLabel: 'Buang Sampah', posX: 15, posY: 3, backpack: [],                                     description: 'Membuang Baterai Bekas ke Tong Merah. Rekor 26 Langkah 3 Bintang!' }
    ]
  }
];

export const projectMeta = {
  title: 'Puzzle Pemrograman: Pemilah Sampah v2',
  url: 'https://glenrioariesto.github.io/puzzle-pemrograman-pemilah-sampah-v2/',
  github: 'https://github.com/glenrioariesto/puzzle-pemrograman-pemilah-sampah-v2',
  version: '2.0.0',
  description: 'Tantangan game edukasi pemrograman visual pemilah sampah dengan logika struktur data Strict FILO (Stack), rintangan lompatan, dan computational thinking.'
};
