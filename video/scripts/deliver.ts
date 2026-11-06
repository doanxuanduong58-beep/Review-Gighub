// Đóng gói thành phẩm để đăng: npm run deliver -- <name> [--render]
//   release/<name>/
//     <name>-9x16.mp4, <name>-16x9.mp4 …   video từng khổ (đã chuẩn hoá -14 LUFS)
//     thumbnail-9x16.png …                  ảnh bìa từng khổ (khung hình cuối cảnh mở đầu, hoặc THUMB_FRAME trong data.ts)
//     dang-bai.md                           tiêu đề, mô tả, hashtag từng nền tảng (từ src/<name>/post.md) + thông số file
// --render: render lại trước khi đóng gói (mặc định chỉ render khổ nào chưa có file).
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { loadVideo, remotion } from "./video";

const [name, ...flags] = process.argv.slice(2);
const data = (await loadVideo(name)) as Awaited<ReturnType<typeof loadVideo>> & { STARTS?: number[]; FPS?: number; THUMB_FRAME?: number; SERIES?: string };
const postFile = `src/${name}/post.md`;
if (!existsSync(postFile)) {
  console.error(`Thiếu ${postFile} — viết tiêu đề, mô tả, hashtag cho từng nền tảng trước (xem skill idea-to-video, bước 8).`);
  process.exit(1);
}

const slugs = data.FORMATS.map((f) => f.replace(":", "x"));
const missing = slugs.filter((s) => !existsSync(`out/${name}-${s}.mp4`));
if (flags.includes("--render") || missing.length) {
  const only = flags.includes("--render") ? [] : data.FORMATS.filter((f) => missing.includes(f.replace(":", "x")));
  execFileSync(process.execPath, [resolve("node_modules/tsx/dist/cli.mjs"), "scripts/render.ts", name, ...only], { stdio: "inherit" });
}

// Video thuộc một series (SERIES trong data.ts) thì gom vào release/<series>/<name>/.
const dir = data.SERIES ? `release/${data.SERIES}/${name}` : `release/${name}`;
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });

// Ảnh bìa: cuối cảnh mở đầu (lúc chữ hook đã hiện đủ), trừ khi data.ts chỉ định THUMB_FRAME.
const fps = data.FPS ?? 30;
const thumbFrame = data.THUMB_FRAME ?? Math.max(0, Math.round(((data.STARTS?.[1] ?? 3) - 0.4) * fps));

// ffprobe in thông tin ra stderr.
const probe = (file: string) =>
  spawnSync(process.execPath, [resolve("node_modules/@remotion/cli/remotion-cli.js"), "ffprobe", file], { encoding: "utf8" }).stderr ?? "";
const rows: string[] = [];
for (const [i, slug] of slugs.entries()) {
  const src = `out/${name}-${slug}.mp4`;
  const file = `${name}-${slug}.mp4`;
  copyFileSync(src, `${dir}/${file}`);
  remotion(["still", process.env.REMOTION_ENTRY ?? "src/index.ts", `${data.COMPOSITION_ID}-${slug}`, `${dir}/thumbnail-${slug}.png`, `--frame=${thumbFrame}`, "--log=error", `--props={"thumbnail":true}`]);
  const info = probe(src);
  const dur = info.match(/Duration: (\d+):(\d+):([\d.]+)/);
  const secs = dur ? Number(dur[1]) * 3600 + Number(dur[2]) * 60 + Number(dur[3]) : NaN;
  const mb = (statSync(src).size / 1024 / 1024).toFixed(1);
  rows.push(`| ${data.FORMATS[i]} | \`${file}\` | \`thumbnail-${slug}.png\` | ${secs.toFixed(1)}s | ${mb} MB |`);
}

const header = [
  `# ${name} — gói đăng bài`,
  "",
  `Tạo lúc ${new Date().toLocaleString("vi-VN")}. Âm thanh chuẩn hoá -14 LUFS, 48 kHz.`,
  "",
  "| Khổ | Video | Ảnh bìa | Thời lượng | Dung lượng |",
  "|---|---|---|---|---|",
  ...rows,
  "",
  "---",
  "",
].join("\n");
writeFileSync(`${dir}/dang-bai.md`, header + readFileSync(postFile, "utf8"));
console.log(`Saved ${dir}/ (${slugs.length} video, ${slugs.length} ảnh bìa, dang-bai.md)`);
