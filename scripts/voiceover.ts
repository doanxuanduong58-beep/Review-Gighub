// Tạo giọng đọc cho từng đoạn của một video: npm run voiceover -- <name> [p3 p6 ...]
//   Ghi public/<name>/vo/<id>.mp3 và src/<name>/vo-durations.json. Liệt kê id để chỉ tạo lại vài đoạn.
//   TTS_PROVIDER=vieneu (mặc định), edge (miễn phí, cần `pip install edge-tts`), elevenlabs.
//   vieneu = VieNeu-TTS chạy local trong .venv-tts; chọn giọng bằng VIENEU_VOICE.
import "dotenv/config";
import { execFileSync } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { parseMedia } from "@remotion/media-parser";
import { nodeReader } from "@remotion/media-parser/node";
import type { Segment } from "../src/timeline";
import { VENV_PYTHON, ffmpeg, loadVideo } from "./video";

const [projectName, ...only] = process.argv.slice(2);
const { SEGMENTS: ALL } = await loadVideo(projectName);
const SEGMENTS = only.length ? ALL.filter((s) => only.includes(s.id)) : ALL;
const project = { audioDir: `${projectName}/vo` };

const provider = process.env.TTS_PROVIDER ?? "vieneu";

const edge = async (seg: Segment, out: string) => {
  const voice = process.env.EDGE_VOICE ?? "vi-VN-NamMinhNeural";
  const rate = process.env.EDGE_RATE ?? "+10%";
  const args = ["-m", "edge_tts", "--voice", voice, `--rate=${rate}`, "--text", seg.text, "--write-media", out];
  // Dịch vụ Edge thỉnh thoảng trả về NoAudioReceived; thử lại vài lần.
  for (let attempt = 1; ; attempt++) {
    try {
      execFileSync("python", args, { stdio: "pipe" });
      return;
    } catch (err) {
      if (attempt >= 5) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
};

let elevenlabs: (seg: Segment, out: string) => Promise<void>;
if (provider === "elevenlabs") {
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error("Thiếu ELEVENLABS_API_KEY trong .env");
    process.exit(1);
  }
  const voiceId = process.env.ELEVENLABS_VOICE_ID ?? "JBFqnCBsd6RMkjVDRZzb";
  // eleven_multilingual_v2 không hỗ trợ tiếng Việt; dùng eleven_v3 hoặc eleven_flash_v2_5.
  const modelId = process.env.ELEVENLABS_MODEL_ID ?? "eleven_v3";
  const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
  let previousText: string | undefined;
  elevenlabs = async (seg, out) => {
    const audio = await client.textToSpeech.convert(voiceId, {
      text: seg.text,
      modelId,
      languageCode: "vi",
      outputFormat: "mp3_44100_128",
      // eleven_v3 không nhận previous_text.
      previousText: modelId === "eleven_v3" ? undefined : previousText,
    });
    await pipeline(Readable.fromWeb(audio as any), createWriteStream(out));
    previousText = seg.text;
  };
}

mkdirSync(`public/${project.audioDir}`, { recursive: true });

// Cách đọc riêng cho VieNeu (đã nghe thử và chọn). Từ viết tắt mặc định bị đánh vần kiểu Việt
// (MCP -> "mờ xê phê") hoặc đọc dính liền; tách chữ cái trong <en> và ngắt nhịp cho rõ.
const VIENEU_SAY: [RegExp, string][] = [
  // "agent" đọc kiểu Việt "ây giần" (người dùng nghe thử 4 cách và chọn, 21/10/2026).
  [/\bagent AI\b/g, "ây giần <en>A I</en>"],
  [/\bAI agent\b/gi, "<en>A I</en> ây giần"],
  [/\bagents?\b/gi, "ây giần"],
  // "Cowork" mặc định đọc thành "cao-ơk"; tách hai tiếng kiểu Anh.
  [/\bCowork\b/g, "<en>co work</en>"],
  // "FFmpeg" mặc định thành "ép fmpeg"; tách chữ cái kiểu Anh.
  [/\bFFmpeg\b/g, "<en>F F mpeg</en>"],
  // Runtime "Bun" bọc <en> để không đọc kiểu Việt "bun".
  [/\bBun\b/g, "<en>bun</en>"],
  // "OpenMAIC" mặc định thành "open mờ a i xê"; đọc chữ cái kiểu Anh (chưa nghe thử, 08/11/2026).
  [/\bOpenMAIC\b/g, "Open <en>M A I C</en>"],
  // PyPSA: README ghi cách đọc "pipes-ah"; mặc định bị đánh vần "py phê ét a" (08/11/2026, chưa nghe thử).
  [/\bPyPSA\b/g, "<en>pipes ah</en>"],
  // "N trừ một" (tiêu chuẩn N-1): mặc định "nờ"; đọc chữ N kiểu Anh.
  [/\bN trừ một\b/g, "<en>N</en> trừ một"],
  // GCompris (gốc Pháp "J'ai compris"): mặc định "gờ compris"; phiên âm Việt (10/11/2026, chưa nghe thử).
  [/\bGCompris\b/g, "Giê com pờ ri"],
  [/\bKDE\b/g, "<en>K D E</en>"],
  [/\bMCP\b/g, "<en>M C P</en>"],
  [/\bECC\b/g, "<en>E C C</en>"],
  [/\bAPI\b/g, "<en>A P I</en>"],
  [/\bSKILL\.md\b/g, "skill chấm <en>M D</en>"],
  // Mặc định thành "claude dot M D"; đọc giống SKILL.md.
  [/\bCLAUDE\.md\b/g, "Claude chấm <en>M D</en>"],
  // "Andrej" mặc định đọc "en-đrếch"; "Ahndray" ra gần cách đọc gốc "An-đrây" (ɑːn dɹeɪ).
  [/\bAndrej Karpathy\b/g, "<en>Ahndray Karpathy</en>"],
  // Engine Godot: mặc định "ga-đát" (ɡɑːdɑːt); tên chính thức đọc "gâu-đâu".
  [/\bGodot\b/g, "<en>go dough</en>"],
  // Peter Thiel: mặc định đọc âm θ ("thi-ồ"); tên đọc "tiil".
  [/\bThiel\b/g, "<en>teel</en>"],
  // Mặc định bị chuẩn hoá thành "notebook lờ mờ".
  [/\bNotebookLM\b/g, "Notebook <en>L M</en>"],
  // Mặc định bị đánh vần "ét tê a rờ"; công thức STAR đọc như từ "star".
  [/\bSTAR\b/g, "<en>star</en>"],
  // Tên hàm viết hoa bị đánh vần "xê ô phê i lờ ô tê"; đọc như tên sản phẩm Copilot.
  [/\bCOPILOT\b/g, "Copilot"],
  // Gói ChatGPT Go: mặc định đọc kiểu Việt "go" (ɣɔ); bọc <en> để đọc "gâu".
  [/\bgói Go\b/g, "gói <en>Go</en>"],
  // "README" mặc định bị đánh vần "rờ e a đê mờ e".
  [/\bREADME\b/g, "<en>read me</en>"],
  // Sự kiện Google I/O: mặc định chuẩn hoá thành "i trên ô".
  [/\bI\/O\b/g, "<en>I O</en>"],
  // "Graphify" mặc định tách thành "graph · ai-phai"; "graffy fy" ra đúng "gráp-phi-phai".
  [/\bGraphify\b/gi, "<en>graffy fy</en>"],
  // "Qwen" mặc định đánh vần "kiu-wen"; đọc gần cách gọi phổ biến "quen".
  [/\bQwen/gi, "quen "],
  // Số phiên bản "V4.1" bị ngắt thành "vê bốn. một".
  [/\bV(\d+)\.(\d+)\b/g, "vê $1 chấm $2"],
  [/\bMIT\b/g, "<en>M I T</en>"],
  [/\bLM Studio\b/g, "<en>L M</en> studio"],
  // "NVIDIA" mặc định bị đánh vần "N V D A"; viết thường trong <en> ra đúng "en-vi-đi-a".
  [/\bNVIDIA\b/gi, "<en>nvidia</en>"],
  // "n8n" mặc định thành "nờ tám nờ"; tên đọc kiểu Anh "en-eight-en".
  [/\bn8n\b/gi, "<en>n eight n</en>"],
  // "PyPI" mặc định tách thành "py pi" → "pi pi"; đọc đúng "pai-pi-ai".
  [/\bPyPI\b/g, "<en>pie P I</en>"],
  // "AGPL" mặc định đánh vần kiểu Việt "a gờ phê lờ".
  [/\bAGPL\b/g, "<en>A G P L</en>"],
  // Gói PyPI "mpt" của MoneyPrinterTurbo; đánh vần kiểu Anh.
  [/\bmpt\b/g, "<en>M P T</en>"],
  // "SEO" mặc định đọc như một từ "xêu" (sˈɛw); đánh vần kiểu Anh.
  [/\bSEO\b/g, "<en>S E O</en>"],
  // "ekip" bị đọc kiểu Anh "e-kip"; tiếng Việt là "ê kíp".
  [/\bekip\b/gi, "ê kíp"],
  // "micrô" bị đọc kiểu Anh "mai-crâu" (gặp 25/10/2026); tách âm tiết kiểu Việt. Không dùng \b: JS coi "ô" là ký tự ngoài từ.
  [/micrô/gi, "mi cờ rô"],
];
const forVieneu = (text: string) => VIENEU_SAY.reduce((t, [pattern, say]) => t.replace(pattern, say), text);

// VieNeu tải model một lần cho cả video nên chạy hết các đoạn trước, rồi đổi wav sang mp3.
if (provider === "vieneu") {
  // Thư mục tạm riêng cho mỗi lần chạy: tên cố định trong tmpdir() từng bị hai phiên chạy song song ghi đè lẫn nhau.
  const work = mkdtempSync(join(tmpdir(), `vieneu-${projectName}-`));
  const jobsFile = join(work, "jobs.json");
  const wav = (seg: Segment) => join(work, `${seg.id}.wav`);
  writeFileSync(jobsFile, JSON.stringify(SEGMENTS.map((seg) => ({ text: forVieneu(seg.text), out: wav(seg) }))));
  execFileSync(
    VENV_PYTHON,
    [
      "scripts/vieneu_tts.py",
      "--voice",
      process.env.VIENEU_VOICE ?? "Hải Đăng",
      // 0.6 đọc ổn định hơn mặc định 1.0 (đã nghe thử và chọn).
      "--temperature",
      process.env.VIENEU_TEMPERATURE ?? "0.6",
      "--jobs",
      jobsFile,
    ],
    { stdio: "inherit", env: { ...process.env, PYTHONIOENCODING: "utf-8", HF_HUB_DISABLE_SYMLINKS_WARNING: "1" } },
  );
  for (const seg of SEGMENTS) {
    const out = `public/${project.audioDir}/${seg.id}.mp3`;
    ffmpeg(["-i", wav(seg), "-b:a", "192k", out]);
  }
}

// Giữ độ dài các đoạn không tạo lại.
const durationsFile = `src/${projectName}/vo-durations.json`;
const durations: Record<string, number> = only.length && existsSync(durationsFile) ? JSON.parse(readFileSync(durationsFile, "utf8")) : {};
for (const seg of SEGMENTS) {
  const out = `public/${project.audioDir}/${seg.id}.mp3`;
  if (provider === "elevenlabs") await elevenlabs!(seg, out);
  else if (provider === "edge") await edge(seg, out);

  const { durationInSeconds } = await parseMedia({
    src: out,
    reader: nodeReader,
    fields: { durationInSeconds: true },
    acknowledgeRemotionLicense: true,
  });
  const d = durationInSeconds ?? 0;
  durations[seg.id] = Math.round(d * 100) / 100;
  console.log(`${seg.id}: ${d.toFixed(2)}s`);
}

// Video tự căn mốc thời gian theo file này (xem src/timeline.ts).
writeFileSync(durationsFile, JSON.stringify(durations, null, 2) + "\n");
