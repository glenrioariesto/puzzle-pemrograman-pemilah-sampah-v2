import os
import subprocess
import re
import sys

# Directory configuration for this project
assets_dir = r"C:\Project\puzle-pemrograman-pemilah-sampah-versi-2\assets"
src_dir = r"C:\Project\puzle-pemrograman-pemilah-sampah-versi-2\src"

def check_ffmpeg():
    try:
        subprocess.run(['ffmpeg', '-version'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True
    except FileNotFoundError:
        return False

def convert_videos():
    if not check_ffmpeg():
        print("Error: FFmpeg is not installed or not in PATH.")
        sys.exit(1)

    # 1. Find all MP4 files in assets directory
    mp4_files = []
    for root, _, files in os.walk(assets_dir):
        for file in files:
            if file.lower().endswith('.mp4'):
                mp4_files.append(os.path.join(root, file))

    if not mp4_files:
        print("No MP4 files found in the assets directory.")
        return

    print(f"Found {len(mp4_files)} MP4 files to convert.\n")
    print("-" * 65)

    converted_count = 0
    for mp4_path in mp4_files:
        webm_path = os.path.splitext(mp4_path)[0] + '.webm'
        print(f"Converting: {os.path.basename(mp4_path)} -> {os.path.basename(webm_path)}")
        
        # FFmpeg command for web-optimized VP9/Opus WebM conversion
        cmd = [
            'ffmpeg', '-y', '-i', mp4_path,
            '-c:v', 'libvpx-vp9', '-crf', '32', '-b:v', '0',
            '-c:a', 'libopus', '-b:a', '128k',
            webm_path
        ]
        
        try:
            result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            if result.returncode == 0:
                print(f"[SUCCESS] Converted {os.path.basename(mp4_path)}")
                os.remove(mp4_path)
                print(f"  Deleted original MP4 file.")
                converted_count += 1
            else:
                print(f"[ERROR] Failed to convert {os.path.basename(mp4_path)}")
                print(result.stderr.decode('utf-8', errors='ignore'))
        except Exception as e:
            print(f"[ERROR] Exception occurred during conversion: {e}")
        print("-" * 65)

    # 2. Update code references in src/ from .mp4 to .webm
    if converted_count > 0:
        print("\nUpdating code references in src/...")
        pattern = re.compile(r"(['\"](?:[^'\"]+/)?assets/[^'\"]+?\.)(mp4)(['\"])")
        modified_files = 0
        for root, _, files in os.walk(src_dir):
            for file in files:
                if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.css')):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        new_content, count = pattern.subn(r"\1webm\3", content)
                        if count > 0:
                            with open(file_path, 'w', encoding='utf-8') as f:
                                f.write(new_content)
                            print(f"Updated {count} references in {file_path}")
                            modified_files += 1
                    except Exception as e:
                        print(f"Error updating file {file_path}: {e}")
                        
        print(f"\nConversion Summary: Successfully converted {converted_count} videos and updated references in {modified_files} files.")
    else:
        print("\nNo videos were converted.")

if __name__ == "__main__":
    convert_videos()
