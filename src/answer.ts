/**
 * Puzzle Pemrograman: Pemilah Sampah v2 - Kunci Jawaban & Panduan Solusi Lengkap (Level 1 - 3)
 * Konsep: Algoritma Pemrograman, Struktur Data Tumpukan (Stack / LIFO), & Computational Thinking
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
    threeStarThreshold: 19,
    twoStarThreshold: 23,
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
    strategySummary: 'Ambil Apel di x=3, maju ke x=4 lalu gunakan tombol LONCAT (Atas) untuk melompati batu di x=5 dan mendarat di x=6. Ambil Kaleng Minuman di x=7. Karena Kaleng Minuman berada di urutan teratas tumpukan tas (LIFO), buang terlebih dahulu ke Tong Daur Ulang Kuning di x=14, kemudian mundur 1 langkah ke x=13 untuk membuang Apel ke Tong Organik Hijau.',
    stackExplanation: 'Sistem tas ransel menggunakan prinsip LIFO (Last-In, First-Out). Apel diambil pertama kali (dasar tas), kemudian Kaleng Minuman diambil kedua (puncak tas). Maka, saat berada di area tong sampah, Kaleng Minuman (puncak tas) WAJIB dibuang lebih dulu ke Tong Daur Ulang (x=14) sebelum Apel dapat dikeluarkan ke Tong Organik (x=13).',
    trashItemsCollected: [
      { name: 'Apel', type: 'ORGANIC', gridX: 3, destinationCan: 'Tong Organik (Hijau)', destinationCanX: 13 },
      { name: 'Kaleng Minuman', type: 'RECYCLABLE', gridX: 7, destinationCan: 'Tong Daur Ulang (Kuning)', destinationCanX: 14 }
    ],
    computationalThinking: {
      decomposition: '1) Bergerak ke x=3 dan ambil Apel. 2) Lewati rintangan batu di x=5 dengan melompat dari x=4 ke x=6. 3) Ambil Kaleng di x=7. 4) Bergerak ke Tong Kuning (x=14) buang Kaleng. 5) Mundur ke Tong Hijau (x=13) buang Apel.',
      pattern: 'Pola tumpukan tas berbanding lurus dengan urutan pembuangan: Sampah yang diambil paling akhir harus diproses pertama kali.',
      abstraction: 'Abaikan baris y=0 hingga y=2 yang kosong, fokus pada posisi horizontal x (0 hingga 15) pada lantai dasar y=3.',
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
    strategySummary: 'Kumpulkan 3 jenis sampah secara berurutan: Apel di x=3 -> loncat batu x=5 -> Kaleng Minuman di x=7 -> loncat batu x=9 (mendarat di x=10) -> langsung ambil Baterai Bekas di x=10. Urutan tumpukan tas menjadi [Apel, Kaleng, Baterai]. Berjalan lurus ke Tong Merah B3 (x=15) dan buang Baterai, lalu mundur bertahap ke Tong Kuning (x=14) buang Kaleng, dan mundur ke Tong Hijau (x=13) buang Apel.',
    stackExplanation: 'Kapasitas maksimal tas adalah 3 sampah. Karena urutan pengambilan adalah Apel -> Kaleng -> Baterai, maka tumpukan tas dari atas ke bawah adalah: [Atas: Baterai (B3) | Tengah: Kaleng (Daur Ulang) | Bawah: Apel (Organik)]. Urutan buang mundur yang sinkron dengan posisi tong adalah: x=15 (Tong B3) -> x=14 (Tong Daur Ulang) -> x=13 (Tong Organik).',
    trashItemsCollected: [
      { name: 'Apel', type: 'ORGANIC', gridX: 3, destinationCan: 'Tong Organik (Hijau)', destinationCanX: 13 },
      { name: 'Kaleng Minuman', type: 'RECYCLABLE', gridX: 7, destinationCan: 'Tong Daur Ulang (Kuning)', destinationCanX: 14 },
      { name: 'Baterai Bekas', type: 'B3', gridX: 10, destinationCan: 'Tong B3 (Merah)', destinationCanX: 15 }
    ],
    computationalThinking: {
      decomposition: '1) Ambil Apel (x=3). 2) Loncat batu ke-1 (x=5) & ambil Kaleng (x=7). 3) Loncat batu ke-2 (x=9) & ambil Baterai (x=10). 4) Buang berturut-turut di x=15, mundur ke x=14, mundur ke x=13.',
      pattern: 'Pola mundur teratur (15 -> 14 -> 13) saat membuang sampah mengeliminasi langkah bolak-balik yang tidak perlu sehingga tepat 21 langkah.',
      abstraction: 'Memetakan urutan tumpukan LIFO secara inversi langsung dengan posisi tong di ujung kanan panggung.',
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
    optimalStepsCount: 18,
    threeStarThreshold: 19,
    twoStarThreshold: 23,
    commands: [
      'RIGHT', 'UP', 'PICK',
      'RIGHT', 'UP', 'RIGHT', 'PICK',
      'RIGHT', 'UP', 'RIGHT', 'PICK',
      'RIGHT', 'RIGHT', 'DROP',
      'RIGHT', 'DROP',
      'RIGHT', 'DROP'
    ],
    commandSequenceIndonesian: [
      'Kanan', 'Atas (Loncat)', 'Ambil Sampah',
      'Kanan', 'Atas (Loncat)', 'Kanan', 'Ambil Sampah',
      'Kanan', 'Atas (Loncat)', 'Kanan', 'Ambil Sampah',
      'Kanan', 'Kanan', 'Buang Sampah',
      'Kanan', 'Buang Sampah',
      'Kanan', 'Buang Sampah'
    ],
    strategySummary: 'Tantangan 3 rintangan batu! Lompati batu pertama di x=2 (mendarat di x=3) dan ambil Baterai Bekas. Maju ke x=4, lompati batu kedua di x=5 (mendarat di x=6), maju ke x=7 dan ambil Kaleng Minuman. Maju ke x=8, lompati batu ketiga di x=9 (mendarat di x=10), maju ke x=11 dan ambil Sayur. Tumpukan tas menjadi [Baterai, Kaleng, Sayur]. Karena Sayur berada di atas, pembuangan dilakukan secara SEARAH MAJU murni tanpa mundur: Tong Hijau (x=13) -> Tong Kuning (x=14) -> Tong Merah (x=15).',
    stackExplanation: 'Urutan sampah yang diambil adalah Baterai (B3) -> Kaleng (Daur Ulang) -> Sayur (Organik). Maka tumpukan tas terbalik menjadi: [Atas: Sayur | Tengah: Kaleng | Bawah: Baterai]. Karena susunan tong di ujung kanan adalah Hijau (13) -> Kuning (14) -> Merah (15), arah pembuangan tumpukan ini berjalan 100% searah ke kanan tanpa perlu melangkah mundur!',
    trashItemsCollected: [
      { name: 'Baterai Bekas', type: 'B3', gridX: 3, destinationCan: 'Tong B3 (Merah)', destinationCanX: 15 },
      { name: 'Kaleng Minuman', type: 'RECYCLABLE', gridX: 7, destinationCan: 'Tong Daur Ulang (Kuning)', destinationCanX: 14 },
      { name: 'Sayur', type: 'ORGANIC', gridX: 11, destinationCan: 'Tong Organik (Hijau)', destinationCanX: 13 }
    ],
    computationalThinking: {
      decomposition: '1) Loncat batu x=2 & ambil Baterai (x=3). 2) Loncat batu x=5 & ambil Kaleng (x=7). 3) Loncat batu x=9 & ambil Sayur (x=11). 4) Buang secara beruntun maju ke x=13, x=14, dan x=15.',
      pattern: 'Ritme gerakan ritmis: Kanan -> Loncat -> Ambil diulang untuk mengatasi 3 rintangan batu, diikuti pergerakan linier maju saat membuang sampah.',
      abstraction: 'Menyinkronkan arah tumpukan tas LIFO dengan letak geografis tong sampah sehingga tidak ada pemborosan langkah mundur sama sekali.',
      algorithm: 'Kanan 1x -> Loncat -> Ambil -> Kanan 1x -> Loncat -> Kanan 1x -> Ambil -> Kanan 1x -> Loncat -> Kanan 1x -> Ambil -> Kanan 2x -> Buang -> Kanan 1x -> Buang -> Kanan 1x -> Buang.'
    },
    stepByStepGuide: [
      { step: 1,  action: 'RIGHT', actionLabel: 'Kanan',        posX: 1,  posY: 3, backpack: [],                                     description: 'Maju ke x=1 sebelum batu ke-1 di x=2' },
      { step: 2,  action: 'UP',    actionLabel: 'Atas (Loncat)',posX: 3,  posY: 3, backpack: [],                                     description: 'Melompati batu x=2, mendarat di posisi Baterai (x=3)' },
      { step: 3,  action: 'PICK',  actionLabel: 'Ambil Sampah', posX: 3,  posY: 3, backpack: ['Baterai Bekas (B3)'],                 description: 'Mengambil Baterai Bekas (dasar tas)' },
      { step: 4,  action: 'RIGHT', actionLabel: 'Kanan',        posX: 4,  posY: 3, backpack: ['Baterai Bekas (B3)'],                 description: 'Maju ke x=4 sebelum batu ke-2 di x=5' },
      { step: 5,  action: 'UP',    actionLabel: 'Atas (Loncat)',posX: 6,  posY: 3, backpack: ['Baterai Bekas (B3)'],                 description: 'Melompati batu x=5, mendarat di x=6' },
      { step: 6,  action: 'RIGHT', actionLabel: 'Kanan',        posX: 7,  posY: 3, backpack: ['Baterai Bekas (B3)'],                 description: 'Tiba di Kaleng Minuman (x=7)' },
      { step: 7,  action: 'PICK',  actionLabel: 'Ambil Sampah', posX: 7,  posY: 3, backpack: ['Baterai', 'Kaleng (Daur Ulang)'],     description: 'Mengambil Kaleng Minuman' },
      { step: 8,  action: 'RIGHT', actionLabel: 'Kanan',        posX: 8,  posY: 3, backpack: ['Baterai', 'Kaleng'],                 description: 'Maju ke x=8 sebelum batu ke-3 di x=9' },
      { step: 9,  action: 'UP',    actionLabel: 'Atas (Loncat)',posX: 10, posY: 3, backpack: ['Baterai', 'Kaleng'],                 description: 'Melompati batu x=9, mendarat di x=10' },
      { step: 10, action: 'RIGHT', actionLabel: 'Kanan',        posX: 11, posY: 3, backpack: ['Baterai', 'Kaleng'],                 description: 'Tiba di Sayur (x=11)' },
      { step: 11, action: 'PICK',  actionLabel: 'Ambil Sampah', posX: 11, posY: 3, backpack: ['Baterai', 'Kaleng', 'Sayur (Organik)'], description: 'Mengambil Sayur (puncak tumpukan tas)' },
      { step: 12, action: 'RIGHT', actionLabel: 'Kanan',        posX: 12, posY: 3, backpack: ['Baterai', 'Kaleng', 'Sayur'],         description: 'Maju ke x=12' },
      { step: 13, action: 'RIGHT', actionLabel: 'Kanan',        posX: 13, posY: 3, backpack: ['Baterai', 'Kaleng', 'Sayur'],         description: 'Tiba di Tong Organik Hijau (x=13)' },
      { step: 14, action: 'DROP',  actionLabel: 'Buang Sampah', posX: 13, posY: 3, backpack: ['Baterai', 'Kaleng'],                 description: 'Membuang Sayur (teratas) ke Tong Hijau' },
      { step: 15, action: 'RIGHT', actionLabel: 'Kanan',        posX: 14, posY: 3, backpack: ['Baterai', 'Kaleng'],                 description: 'Maju ke Tong Daur Ulang Kuning (x=14)' },
      { step: 16, action: 'DROP',  actionLabel: 'Buang Sampah', posX: 14, posY: 3, backpack: ['Baterai Bekas (B3)'],                 description: 'Membuang Kaleng Minuman ke Tong Kuning' },
      { step: 17, action: 'RIGHT', actionLabel: 'Kanan',        posX: 15, posY: 3, backpack: ['Baterai Bekas (B3)'],                 description: 'Maju ke Tong B3 Merah (x=15)' },
      { step: 18, action: 'DROP',  actionLabel: 'Buang Sampah', posX: 15, posY: 3, backpack: [],                                     description: 'Membuang Baterai Bekas ke Tong Merah. Rekor 18 Langkah 3 Bintang!' }
    ]
  }
];

export const projectMeta = {
  title: 'Puzzle Pemrograman: Pemilah Sampah v2',
  url: 'https://glenrioariesto.github.io/puzzle-pemrograman-pemilah-sampah-v2/',
  github: 'https://github.com/glenrioariesto/puzzle-pemrograman-pemilah-sampah-v2',
  version: '2.0.0',
  description: 'Tantangan game edukasi pemrograman visual pemilah sampah dengan logika struktur data LIFO (Stack), rintangan lompatan, dan computational thinking.'
};
