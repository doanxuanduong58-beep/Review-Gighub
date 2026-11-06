// Xuất một hiệu ứng của Motion Atlas (vendor/motion-atlas, MIT) thành clip MP4 để dùng trong Remotion:
//   npm run atlas -- <KEY> [--dur 6] [--vertical] [--cx 1250] [--loop]
//   npm run atlas -- --list            # in danh sách KEY (mô tả: .claude/skills/idea-to-video/references/atlas.md)
// Ra public/motion-atlas/<KEY>[_v].mp4 (30 fps, không tiếng). Dùng qua <AtlasClip effect="KEY" /> (src/components/atlas.tsx).
// Mỗi hiệu ứng là hàm của thời gian lt ∈ [0, 8) → khung hình xác định, xuất lại luôn ra cùng kết quả.
// --vertical cắt 608×1080 quanh chủ thể (--cx) rồi phóng lên 1080×1920 — hơi mềm.
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";
import { ffmpeg } from "./video";

const args = process.argv.slice(2);
const opt = (name: string) => args[args.indexOf(name) + 1];
const key = args.find((a, i) => !a.startsWith("--") && !["--dur", "--cx"].includes(args[i - 1]));
const list = args.includes("--list");
if (!key && !list) {
  console.error("Cách dùng: npm run atlas -- <KEY> [--dur 6] [--vertical] [--cx 1250] [--loop]   |   npm run atlas -- --list");
  process.exit(1);
}
const dur = args.includes("--dur") ? Number(opt("--dur")) : 6;
const cx = args.includes("--cx") ? Number(opt("--cx")) : 1250;
const vertical = args.includes("--vertical");
const loop = args.includes("--loop");
const FPS = 30;

const CHROME =
  process.env.CHROME_PATH ??
  { win32: "C:/Program Files/Google/Chrome/Application/chrome.exe", darwin: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" }[
    process.platform as string
  ] ??
  "/usr/bin/google-chrome";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--allow-file-access-from-files", "--ignore-gpu-blocklist", "--enable-gpu-rasterization", "--use-angle=default"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
const errors: string[] = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
await page.goto(pathToFileURL(resolve("vendor/motion-atlas/app/index.html")).href);
await page.evaluate("window.ready");

if (list) {
  const rows = (await page.evaluate("listST()")) as string[][];
  for (const [k, cn, en, cat] of rows) console.log(`${k.padEnd(12)} ${cat ?? ""}  ${en ?? ""}  ${cn ?? ""}`);
  await browser.close();
  process.exit(0);
}

const index = (await page.evaluate(`ST.findIndex(s => s.key == ${JSON.stringify(key)})`)) as number;
if (index < 0) {
  console.error(`Không có KEY "${key}" — chạy npm run atlas -- --list`);
  await browser.close();
  process.exit(1);
}

const work = mkdtempSync(join(tmpdir(), `atlas-${key}-`));
const n = Math.round(dur * FPS);
const t0 = Date.now();
for (let f = 0; f < n; f++) {
  const lt = 8 * (((f / n) * (loop ? 2 : 1)) % 1);
  await page.evaluate(`renderST(${index}, ${lt})`);
  await page.screenshot({ path: join(work, `f${String(f).padStart(4, "0")}.jpg`) as `${string}.jpg`, type: "jpeg", quality: 92 });
  if (f % 30 === 0) console.log(`${key} ${f}/${n} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
await browser.close();
if (errors.length) console.warn("Lỗi trong trang:", errors.slice(0, 3).join("\n"));

mkdirSync("public/motion-atlas", { recursive: true });
const out = `public/motion-atlas/${key}${vertical ? "_v" : ""}.mp4`;
const vf = vertical ? `crop=608:1080:${Math.max(0, Math.min(1920 - 608, cx - 304))}:0,scale=1080:1920:flags=lanczos` : "null";
// crf 23: clip nhẹ để bundle Remotion (chép cả public/) không chậm.
ffmpeg(["-framerate", String(FPS), "-i", join(work, "f%04d.jpg"), "-vf", vf, "-c:v", "libx264", "-crf", "23", "-preset", "slow", "-pix_fmt", "yuv420p", out]);
rmSync(work, { recursive: true, force: true });
console.log(`Saved ${out} (${dur}s, ${((Date.now() - t0) / 1000).toFixed(0)}s render)`);
