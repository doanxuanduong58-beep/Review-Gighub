// Chụp một trang web (dark mode, 1280x900 @2x) để dựng cảnh ScreenCard:
//   npm run shoot -- <url> <public/<name>/<file>.png> [--at "tiêu đề mục"] [--find "chữ"]...
//   --at   : cuộn tới heading/chữ này rồi mới chụp (vd mục "Benchmark", code mẫu giữa README)
//   --find : ghi toạ độ phần tử chứa chữ này (lặp lại được) để đặt camera/khoanh sáng
// Ghi thêm <file>.json; MỌI toạ độ tính theo ảnh chụp (CSS px, 0..1280 x 0..900):
//   - trang repo GitHub (đầu trang): nút Star, khung About, nhãn số sao (vd "Star69.8k (69.8k)")
//   - finds[]: { text, box, inShot } — inShot=false nghĩa là phần tử nằm ngoài ảnh
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);
const flagValue = (i: number) => ["--find", "--at", "--hide", "--wait", "--click"].includes(args[i - 1]);
const [url, out] = args.filter((a, i) => !a.startsWith("--") && !flagValue(i));
const finds = args.flatMap((a, i) => (args[i - 1] === "--find" ? [a] : []));
const at = args.find((_, i) => args[i - 1] === "--at");
// --hide "chữ": ẩn popup/khung nổi chứa chữ này (vd hộp "Sign in with Microsoft") trước khi chụp.
const hides = args.flatMap((a, i) => (args[i - 1] === "--hide" ? [a] : []));
// --clean: gỡ mọi lớp phủ cố định lớn (banner cookie dạng iframe, hộp đăng nhập, nền mờ) mà --hide không bắt được.
const clean = args.includes("--clean");
if (!url || !out) {
  console.error('Cách dùng: npm run shoot -- <url> <public/.../file.png> [--at "tiêu đề"] [--find "chữ"]');
  process.exit(1);
}

const CHROME =
  process.env.CHROME_PATH ??
  {
    win32: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    darwin: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  }[process.platform as string] ??
  "/usr/bin/google-chrome";

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
// UA của Chrome thường: UA "HeadlessChrome" bị một số trang (support.google.com, help.openai.com) trả trang trống/chặn.
await page.setUserAgent(
  (await browser.userAgent()).replace("HeadlessChrome", "Chrome"),
);
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
// Một số trang (vd support.google.com) giữ kết nối mở nên không bao giờ "networkidle" — hết giờ thì chụp luôn.
await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 }).catch((e) => {
  if (e?.name !== "TimeoutError") throw e;
  console.warn("Trang chưa yên mạng sau 30s — vẫn chụp.");
});
// --wait <ms>: chờ thêm cho trang dựng nội dung bằng JavaScript.
const wait = Number(args.find((_, i) => args[i - 1] === "--wait") ?? 0);
if (wait) await new Promise((r) => setTimeout(r, wait));
// --click "chữ": bấm phần tử chứa chữ này (vd "Expand all" để mở các mục gập) rồi chờ 1,5s.
for (const text of args.flatMap((a, i) => (args[i - 1] === "--click" ? [a] : []))) {
  const ok = await page.evaluate(`(() => {
    const el = [...document.querySelectorAll("button, a, [role=button], summary")].find((e) => e.textContent.trim() === ${JSON.stringify(text)});
    if (el) el.click();
    return !!el;
  })()`);
  if (!ok) console.warn(`--click: không tìm thấy "${text}"`);
  await new Promise((r) => setTimeout(r, 1500));
}

// Viết bằng chuỗi để tsx không chèn helper (__name) vào code chạy trong trình duyệt.
if (hides.length) {
  const hidden = await page.evaluate(`(() => ${JSON.stringify(hides)}.map((text) => {
    const has = (e) => e.textContent.replace(/\\s+/g, " ").includes(text);
    const el = [...document.querySelectorAll("body *")].find((e) => has(e) && ![...e.children].some(has));
    // Đi lên tới khung nổi gần nhất (position fixed/absolute hoặc role=dialog) rồi ẩn nó.
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const pos = getComputedStyle(n).position;
      if (pos === "fixed" || pos === "absolute" || n.getAttribute("role") === "dialog") {
        n.style.setProperty("display", "none", "important");
        return true;
      }
    }
    return false;
  }))()`) as boolean[];
  hides.forEach((t, i) => !hidden[i] && console.warn(`--hide: không tìm thấy khung nổi chứa "${t}"`));
}
if (clean) {
  const removed = await page.evaluate(`(() => {
    let n = 0;
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (cs.position !== "fixed" && cs.position !== "sticky" && el.tagName !== "IFRAME") continue;
      const r = el.getBoundingClientRect();
      const big = r.width * r.height > window.innerWidth * window.innerHeight * 0.15;
      const z = Number(cs.zIndex) || 0;
      const overlay = el.tagName === "IFRAME" ? cs.position === "fixed" || z > 1000 : big && z > 10;
      if (overlay) { el.style.setProperty("display", "none", "important"); n++; }
    }
    for (const el of [document.documentElement, document.body]) {
      el.style.setProperty("overflow", "auto", "important");
      el.style.setProperty("filter", "none", "important");
    }
    return n;
  })()`);
  console.log(`--clean: gỡ ${removed} lớp phủ`);
}
const scrollToAt = `(() => {
  const at = ${JSON.stringify(at ?? null)};
  if (!at) return true;
  const visible = (el) => el.getBoundingClientRect().width > 0;
  const all = [...document.querySelectorAll("h1, h2, h3, h4, summary, strong, p, td, th, li")];
  const has = (e) => e.textContent.replace(/\\s+/g, " ").includes(at);
  // Không thấy trong các thẻ thường gặp thì lấy phần tử sâu nhất chứa chữ (vd bảng arXiv, bài báo bọc trong div).
  const el = all.find((e) => visible(e) && /^H[1-4]$/.test(e.tagName) && has(e)) ||
    all.find((e) => visible(e) && has(e)) ||
    [...document.querySelectorAll("body *")].find((e) => visible(e) && has(e) && ![...e.children].some(has));
  if (!el) return false;
  // Chừa 120px phía trên: nhiều trang (GitHub) có thanh header dính che mất phần đầu.
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 120);
  // Trang cuộn trong một div (vd trung tâm trợ giúp Intercom) thì window.scrollTo không có tác dụng.
  if (el.getBoundingClientRect().top > 900 || el.getBoundingClientRect().top < 0) {
    el.scrollIntoView({ block: "start" });
    let p = el.parentElement;
    while (p && !(p.scrollHeight > p.clientHeight && /auto|scroll/.test(getComputedStyle(p).overflowY))) p = p.parentElement;
    (p || window).scrollBy(0, -120);
  }
  return true;
})()`;
// Cuộn 3 lần, mỗi lần chờ ảnh lazy-load: ảnh phía trên tải xong sẽ đẩy mục cần chụp xuống dưới.
let scrolled = true;
for (let i = 0; i < 3; i++) {
  scrolled = (await page.evaluate(scrollToAt)) as boolean;
  await new Promise((r) => setTimeout(r, 700));
}
if (!scrolled) console.warn(`Không tìm thấy "${at}" — chụp đầu trang.`);

const boxes = await page.evaluate(`(() => {
  // Toạ độ theo khung nhìn hiện tại = toạ độ trong ảnh chụp.
  const rect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  };
  const inView = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < 900;
  };
  const star = [...document.querySelectorAll("a, button")].find(
    (e) => inView(e) && /^Star\\s*[\\d.,]+k?/.test(e.textContent.trim()),
  );
  const aboutHeading = [...document.querySelectorAll("h2")].find((h) => inView(h) && h.textContent.trim() === "About");
  const about = aboutHeading ? aboutHeading.closest("[class*=sidebarSection]") || aboutHeading.parentElement : null;
  const finds = ${JSON.stringify(finds)}.map((text) => {
    // Phần tử sâu nhất chứa chữ (có thể kèm icon con), không phải mọi tổ tiên của nó.
    const has = (e) => e.textContent.replace(/\\s+/g, " ").includes(text);
    const matches = [...document.querySelectorAll("body *")].filter(
      (e) => e.getBoundingClientRect().width > 0 && has(e) && ![...e.children].some(has),
    );
    const el = matches.find(inView) || matches[0];
    return { text, box: rect(el), inShot: !!el && inView(el) };
  });
  return {
    url: location.href,
    title: document.title,
    star: rect(star),
    starLabel: star ? star.textContent.trim().replace(/\\s+/g, " ") : null,
    about: rect(about),
    finds,
  };
})()`);

mkdirSync(dirname(out), { recursive: true });
await page.screenshot({ path: out });
await browser.close();

const meta = { file: out.replace(/^public\//, ""), page: { width: 1280, height: 900 }, at: at ?? null, ...(boxes as object) };
writeFileSync(out.replace(/\.png$/, ".json"), JSON.stringify(meta, null, 2) + "\n");
console.log(JSON.stringify(meta, null, 2));
