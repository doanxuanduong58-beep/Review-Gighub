// Tiện ích chung cho các script: nạp cấu hình video theo tên thư mục (src/<name>/data.ts),
// gọi CLI/ffmpeg của Remotion và Python trong .venv-tts.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { Segment } from "../src/timeline";

const WIN = process.platform === "win32";
export const VENV_PYTHON = WIN ? ".venv-tts/Scripts/python.exe" : ".venv-tts/bin/python";

/** Chạy CLI Remotion bằng chính Node đang chạy (không qua npx/shell -> không cảnh báo DEP0190). */
// REMOTION_PUBLIC_DIR: thư mục public riêng (chỉ chứa public/<name>) — bundle chép cả public/ nên file phiên khác
// đang ghi dở làm render chết vì EBUSY (gặp 25/10/2026).
const publicDirArg = (args: string[]) =>
  process.env.REMOTION_PUBLIC_DIR && ["render", "still"].includes(args[0]) ? [`--public-dir=${process.env.REMOTION_PUBLIC_DIR}`] : [];
export const remotion = (args: string[]) =>
  execFileSync(process.execPath, [resolve("node_modules/@remotion/cli/remotion-cli.js"), ...args, ...publicDirArg(args)], { stdio: "inherit" });

/** ffmpeg đi kèm Remotion (khỏi cài riêng). Không có bộ lọc volumedetect/ebur128 — đo độ to bằng loudnorm. */
export const ffmpeg = (args: string[]) => remotion(["ffmpeg", "-y", "-loglevel", "error", ...args]);

export type VideoData = { NAME: string; COMPOSITION_ID: string; FORMATS: string[]; SEGMENTS: Segment[]; DURATION_S: number };

export const listVideos = () =>
  readdirSync("src", { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join("src", d.name, "data.ts")))
    .map((d) => d.name);

export const loadVideo = async (name: string | undefined): Promise<VideoData> => {
  const file = name && resolve("src", name, "data.ts");
  if (!file || !existsSync(file)) {
    console.error(`Không tìm thấy video "${name ?? ""}". Có: ${listVideos().join(", ")}`);
    process.exit(1);
  }
  return import(pathToFileURL(file).href);
};
