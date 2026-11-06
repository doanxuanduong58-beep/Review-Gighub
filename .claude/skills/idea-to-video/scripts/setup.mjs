// Cài bộ khung idea-to-video vào một project (mới hoặc có sẵn):
//   node <skill-dir>/scripts/setup.mjs [thư-mục-project] [--skip-python]
// - Chép assets/template vào project, KHÔNG ghi đè file đã có (in ra danh sách bỏ qua).
// - Trộn package.json (scripts + dependencies), chạy npm install.
// - Tải trình duyệt headless của Remotion (~280MB) ngay lúc cài, kèm xử lý đường dẫn quá dài trên Windows.
// - Tạo .venv-tts (Python 3.12 qua uv) và cài vieneu (VieNeu-TTS) cho giọng đọc + numpy/scipy/soundfile cho nhạc.
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const target = resolve(args.find((a) => !a.startsWith("--")) ?? ".");
const skipPython = args.includes("--skip-python");
const template = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "template");
const run = (cmd) => {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd: target, stdio: "inherit" });
};

mkdirSync(target, { recursive: true });
if (process.platform === "win32" && target.length > 80) {
  console.warn(`⚠ Đường dẫn project dài ${target.length} ký tự; Windows giới hạn 260 ký tự cho mỗi file. Setup sẽ tự xử lý trình duyệt của Remotion, nhưng nếu được hãy đặt project ở thư mục ngắn hơn.`);
}

// 1. Chép khung code.
const skipped = [];
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
for (const src of walk(template)) {
  const rel = relative(template, src);
  if (rel === "package.fragment.json") continue;
  const dest = join(target, rel === "gitignore.txt" ? ".gitignore" : rel);
  if (existsSync(dest)) {
    if (rel === "gitignore.txt") {
      // Bổ sung các dòng còn thiếu vào .gitignore có sẵn.
      const have = new Set(readFileSync(dest, "utf8").split(/\r?\n/));
      const add = readFileSync(src, "utf8").split("\n").filter((l) => l && !have.has(l));
      if (add.length) writeFileSync(dest, readFileSync(dest, "utf8").replace(/\n?$/, "\n") + add.join("\n") + "\n");
    } else skipped.push(rel);
    continue;
  }
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest);
}
if (!existsSync(join(target, ".env"))) cpSync(join(template, ".env.example"), join(target, ".env"));

// 2. package.json.
const fragment = JSON.parse(readFileSync(join(template, "package.fragment.json"), "utf8"));
const pkgPath = join(target, "package.json");
const pkg = existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, "utf8")) : { name: "video", version: "1.0.0", private: true };
pkg.type = "module";
pkg.scripts = { ...fragment.scripts, ...pkg.scripts };
pkg.dependencies = { ...pkg.dependencies, ...fragment.dependencies };
pkg.devDependencies = { ...pkg.devDependencies, ...fragment.devDependencies };
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
run("npm install");

// 3. Trình duyệt của Remotion: tải luôn bây giờ (nếu để lần render đầu, nó tải âm thầm vài phút).
run("npx remotion browser ensure");
if (process.platform === "win32") {
  // Đường dẫn tới chrome-headless-shell.exe có thể vượt MAX_PATH 260 ký tự khi project nằm sâu
  // -> spawn ENOENT dù file có thật. Khi đó trỏ Remotion tới đường dẫn ngắn 8.3.
  const findExe = (dir) => {
    if (!existsSync(dir)) return null;
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) {
        const hit = findExe(p);
        if (hit) return hit;
      } else if (name === "chrome-headless-shell.exe") return p;
    }
    return null;
  };
  const exe = findExe(join(target, "node_modules", ".remotion"));
  const configPath = join(target, "remotion.config.ts");
  if (exe && exe.length >= 240 && !existsSync(configPath)) {
    const short = execSync(`cmd /c for %I in ("${exe}") do @echo %~sI`, { encoding: "utf8" }).trim().replace(/\\/g, "/");
    writeFileSync(
      configPath,
      `// Tự tạo bởi setup.mjs: đường dẫn trình duyệt dài ${exe.length} ký tự (> MAX_PATH) nên dùng tên ngắn 8.3.\n` +
        `import { Config } from "@remotion/cli/config";\n\nConfig.setBrowserExecutable("${short}");\n`,
    );
    console.log(`Đường dẫn trình duyệt quá dài (${exe.length} ký tự) — đã tạo remotion.config.ts dùng ${short}`);
  }
}

// 4. Python cho VieNeu-TTS + nhạc.
if (!skipPython) {
  const venvPython = process.platform === "win32" ? ".venv-tts/Scripts/python.exe" : ".venv-tts/bin/python";
  if (existsSync(join(target, venvPython))) {
    console.log(".venv-tts đã có — bỏ qua tạo venv.");
  } else {
    const py = process.platform === "win32" ? "python" : "python3";
    // uv tải được Python 3.12 riêng: tránh lỗi wheel (vd kaldi-native-fbank chưa có cho Python 3.14).
    const PACKAGES = "vieneu numpy scipy soundfile"; // numpy/scipy/soundfile cho scripts/music.py
    let uv;
    try {
      execSync("uv --version", { stdio: "ignore" });
      uv = "uv";
    } catch {
      run(`${py} -m pip install --user uv`);
      uv = `${py} -m uv`;
    }
    run(`${uv} venv .venv-tts --python 3.12`);
    run(`${uv} pip install --python .venv-tts ${PACKAGES}`);
  }
}

console.log("\nXong.");
if (skipped.length) console.log(`Giữ nguyên ${skipped.length} file đã có: ${skipped.join(", ")}`);
console.log("Kiểm tra: npx tsc && npx remotion compositions src/index.ts");
