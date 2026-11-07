// Render video ở từng khổ rồi chuẩn hoá âm lượng về -14 LUFS (chuẩn TikTok/Reels/YouTube):
//   npm run render -- <name> [9:16 16:9 ...]   ->  out/<name>-9x16.mp4, out/<name>-16x9.mp4 ...
// Không liệt kê khổ thì render mọi khổ trong FORMATS của src/<name>/data.ts.
import { mkdirSync, rmSync } from "node:fs";
import { availableParallelism, freemem } from "node:os";
import { ffmpeg, loadVideo, remotion } from "./video";

const [name, ...only] = process.argv.slice(2);
const { COMPOSITION_ID, FORMATS } = await loadVideo(name);
const formats = only.length ? FORMATS.filter((f) => only.includes(f)) : FORMATS;
if (!formats.length) {
  console.error(`Không có khổ nào để render. Video "${name}" khai báo: ${FORMATS.join(", ")}`);
  process.exit(1);
}
mkdirSync("out", { recursive: true });

// Số tab Chrome render song song, tính lại trước mỗi khổ theo RAM đang trống (các phiên khác có thể đang render):
// chừa 2 GB cho hệ thống, mỗi tab ~1.5 GB, tối đa nửa số luồng CPU (mặc định của Remotion), tối thiểu 1.
// Đặt REMOTION_CONCURRENCY chỉ khi muốn ép một số cố định.
const GB = 1024 ** 3;
const autoConcurrency = () => Math.max(1, Math.min(Math.floor(availableParallelism() / 2), Math.floor((freemem() / GB - 2) / 1.5)));

for (const format of formats) {
  const slug = format.replace(":", "x");
  const raw = `out/${name}-${slug}-raw.mp4`;
  const out = `out/${name}-${slug}.mp4`;
  const concurrency = process.env.REMOTION_CONCURRENCY ?? autoConcurrency();
  console.log(`Render ${format} với concurrency=${concurrency} (RAM trống ${(freemem() / GB).toFixed(1)} GB)`);
  remotion(["render", process.env.REMOTION_ENTRY ?? "src/index.ts", `${COMPOSITION_ID}-${slug}`, raw, "--log=error", `--concurrency=${concurrency}`]);
  ffmpeg(["-i", raw, "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "256k", out]);
  rmSync(raw);
  console.log(`Saved ${out}`);
}
