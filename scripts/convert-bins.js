import ffmpegPath from 'ffmpeg-static';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const files = [
  { src: 'assets/Wadah Sampah Hijau.mov', outWebm: 'assets/wadah_sampah_hijau.webm', outWebp: 'assets/Wadah Sampah Hijau.webp' },
  { src: 'assets/Wadah Sampah Kuning.mov', outWebm: 'assets/wadah_sampah_kuning.webm', outWebp: 'assets/Wadah Sampah Kuning.webp' },
  { src: 'assets/Wadah Sampai Merah.mov', outWebm: 'assets/wadah_sampah_merah.webm', outWebp: 'assets/Wadah Sampah Merah.webp' },
];

for (const f of files) {
  console.log(`\n========================================`);
  console.log(`Processing: ${f.src}`);
  try {
    const probe = execSync(`"${ffmpegPath}" -i "${f.src}" 2>&1`).toString();
    console.log(probe);
  } catch (e) {
    console.log(e.stdout?.toString() || e.stderr?.toString());
  }

  // Convert ProRes 4444 MOV with Alpha (yuva444p10le or rgba) to VP9 WebM with Alpha channel (yuva420p)
  console.log(`Converting to WebM with alpha: ${f.outWebm}...`);
  try {
    execSync(`"${ffmpegPath}" -y -i "${f.src}" -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0 -b:v 1M "${f.outWebm}"`, { stdio: 'inherit' });
    console.log(`Successfully created ${f.outWebm}`);
  } catch (err) {
    console.error(`Error converting ${f.src}:`, err);
  }
}
