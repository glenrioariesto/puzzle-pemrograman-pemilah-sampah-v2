import ffmpegPath from 'ffmpeg-static';
import { execSync } from 'child_process';

const mp4Path = 'assets/char_organik_buang.mp4';
const webmPath = 'assets/char_organik_buang.webm';

console.log('Converting char_organik_buang.mp4 to VP9 WebM...');
try {
  execSync(`"${ffmpegPath}" -y -i "${mp4Path}" -c:v libvpx-vp9 -crf 30 -b:v 0 "${webmPath}"`, { stdio: 'inherit' });
  console.log('Conversion successful!');
} catch (e) {
  console.error('Error during conversion:', e);
}
