// Tổng hợp nhạc nền đúng độ dài video: npm run music -- <name>
//   Ghi public/<name>/music.mp3. Chạy lại mỗi khi độ dài video đổi (sau khi tạo lại giọng đọc).
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { VENV_PYTHON, ffmpeg, loadVideo } from "./video";

const name = process.argv[2];
const { DURATION_S } = await loadVideo(name);
const wav = join(tmpdir(), `music-${name}.wav`);
execFileSync(VENV_PYTHON, ["scripts/music.py", "--seconds", String(DURATION_S), "--out", wav], { stdio: "inherit" });
ffmpeg(["-i", wav, "-b:a", "192k", `public/${name}/music.mp3`]);
console.log(`Saved public/${name}/music.mp3`);
