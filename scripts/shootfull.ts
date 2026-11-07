// Chụp khung 1280×900 (@2x) ở toạ độ y bất kỳ của trang — dùng khi `npm run shoot -- --at` không cuộn tới được
// (trang cuộn trong một div, chữ nằm trong mục thu gọn, popup che):
//   npm run shootfull -- <url> public/<name>/<prefix> [y1 y2 ...] [--find "chữ"]...
//   -> <prefix>-preview.png (8000px đầu trang, thu nhỏ — xem để chọn y) và <prefix>-<y>.png (khung bắt đầu ở CSS y)
//   --find in ra toạ độ CSS (cả trang) của phần tử sâu nhất chứa chữ, để chọn y và đặt vùng khoanh.
// Chụp bằng clip của trình duyệt (không cắt từ ảnh cả trang): trang rất dài (hàng chục nghìn px) vẫn chụp được.
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);
const finds = args.filter((_, i) => args[i - 1] === "--find");
const pos = args.filter((a, i) => a !== "--find" && args[i - 1] !== "--find");
const [url, prefix, ...ys] = pos;
if (!url || !prefix) {
  console.error('Cách dùng: npm run shootfull -- <url> public/<name>/<prefix> [y1 y2 ...] [--find "chữ"]');
  process.exit(1);
}
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: [...(process.env.HTTPS_PROXY ? [`--proxy-server=${process.env.HTTPS_PROXY}`] : []), ...(process.getuid?.() === 0 ? ["--no-sandbox"] : [])] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
// "domcontentloaded" + chờ cố định: networkidle hay treo ở trang có chat widget / analytics.
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await new Promise((r) => setTimeout(r, 8000));
await page.evaluate(`document.querySelectorAll("details").forEach((d) => (d.open = true))`);
mkdirSync(dirname(prefix), { recursive: true });

const height = (await page.evaluate("document.documentElement.scrollHeight")) as number;
console.log(`Trang cao ${height} CSS px`);
for (const text of finds) {
  // Chuỗi code (không phải hàm) — tsx chèn helper __name vào hàm được serialize.
  const box = (await page.evaluate(`(() => {
    const t = ${JSON.stringify(text)};
    const has = (e) => e.textContent.replace(/\\s+/g, " ").includes(t);
    const el = [...document.querySelectorAll("body *")].find((e) => has(e) && ![...e.children].some(has));
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)];
  })()`)) as number[] | null;
  console.log(`  "${text}": ${box ? `x=${box[0]} y=${box[1]} w=${box[2]} h=${box[3]}` : "không tìm thấy"}`);
}
if (!ys.length) {
  const h = Math.min(height, 8000);
  await page.screenshot({ path: `${prefix}-preview.png`, clip: { x: 0, y: 0, width: 1280, height: h, scale: 0.4 }, captureBeyondViewport: true });
  console.log(`${prefix}-preview.png: ${h}px đầu trang, thu nhỏ 0.4 (toạ độ CSS = px ảnh ÷ 0.4)`);
}
for (const y of ys.map(Number)) {
  await page.screenshot({ path: `${prefix}-${y}.png`, clip: { x: 0, y, width: 1280, height: 900 }, captureBeyondViewport: true });
  console.log(`  ${prefix}-${y}.png  (CSS y=${y}..${y + 900}; toạ độ trong khung = y trang − ${y})`);
}
await browser.close();
