import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { HEADER_H, ScreenCard, UrlBar, fitBox, parseStarLabel, type Box, type CamKey, type Highlight, type Size } from "../components/ScreenCard";
import { SplitLayout, useLayout } from "../components/layout";
import { Bokeh } from "../components/fx";
import { Background, C, CheckIcon, StarIcon, fontFamily, useExit } from "../components/ui";
import REPO_SHOT from "../../public/genoffice/repo.json";
import { BRAND, BRAND_GRADIENT, REPO_URL, beat } from "./data";

// Mọi kích thước px viết theo thiết kế gốc 1080x1920 rồi nhân `k` (xem useLayout) để vừa mọi khổ.

const useEnter = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (delay: number, damping = 200) => spring({ frame: frame - delay, fps, config: { damping } });
};
const rise = (p: number, px = 50) => ({ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [px, 0])}px)` });
const ease = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t: number) => 1 - Math.pow(1 - t, 3) } as const;

const GradientText: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", ...style }}>
    {children}
  </span>
);

const Pill: React.FC<{ k: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ k, children, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignSelf: "flex-start",
      alignItems: "center",
      gap: 16 * k,
      padding: `${18 * k}px ${32 * k}px ${18 * k}px ${22 * k}px`,
      borderRadius: 999,
      background: "rgba(255,255,255,0.05)",
      border: "2px solid rgba(255,255,255,0.1)",
      fontSize: 44 * k,
      fontWeight: 700,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

const Logo: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <Img
    src={staticFile("genoffice/app-icon.png")}
    style={{ width: size, height: size, borderRadius: size * 0.22, boxShadow: `0 0 ${size * 0.4}px ${BRAND.violet}55`, ...style }}
  />
);

const Scene: React.FC<{ children: React.ReactNode; accent?: string; fade?: boolean }> = ({ children, accent = BRAND.violet, fade = true }) => {
  const exit = useExit();
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text, opacity: fade ? exit : 1 }}>
      <Background accent={accent} />
      <Bokeh color={accent} count={10} />
      {children}
    </AbsoluteFill>
  );
};

// Ô media của SplitLayout -> kích thước khung xem trong ScreenCard.
const viewOf = (box: Size): Size => ({ width: box.width, height: box.height - HEADER_H });
const box = (x: number, y: number, width: number, height: number): Box => ({ x, y, width, height });

// Chip ứng dụng (màu theo ảnh bìa chính thức).
const APPS = [
  { label: "Word", color: "#2B6CF0" },
  { label: "Excel", color: "#1E9B57" },
  { label: "PowerPoint", color: "#E5553A" },
  { label: "PDF", color: "#E23B3B" },
];

// ---------- P1: câu mở đầu ----------
const HERO_PAGE = { width: 2400, height: 1260 };

export const Hook: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const line = { fontSize: 128 * k, fontWeight: 900, lineHeight: 1.05, letterSpacing: -3 * k };
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", padding: `${190 * k}px 60px`, textAlign: "center", gap: 18 * k }}>
        <div style={{ ...line, ...rise(enter(0)) }}>Office + AI</div>
        <div style={{ ...line, fontSize: 104 * k, ...rise(enter(8)) }}>
          <GradientText>mã nguồn mở</GradientText>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 * k, marginTop: 40 * k }}>
          {APPS.map((a, i) => (
            <Pill key={a.label} k={k} style={{ fontSize: 38 * k, padding: `${16 * k}px ${26 * k}px ${16 * k}px ${20 * k}px`, alignSelf: "center", ...rise(enter(beat("p1", 0.45) + i * 5), 30) }}>
              <div style={{ width: 26 * k, height: 26 * k, borderRadius: 8 * k, background: a.color }} />
              {a.label}
            </Pill>
          ))}
        </div>
        <div style={{ marginTop: 60 * k, ...rise(enter(14), 120) }}>
          <ScreenCard
            src="genoffice/hero.webp"
            page={HERO_PAGE}
            view={{ width: 960, height: 520 }}
            keys={[
              { at: 0, cam: { cx: 1200, cy: 630, s: 960 / 2400 } },
              { at: beat("p1", 0.3), cam: fitBox(box(110, 90, 830, 400), { width: 960, height: 520 }, 30) },
            ]}
            accent={BRAND.violet}
            header={<UrlBar url="genoffice.ai" muted={C.muted} color={C.text} />}
          />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P2: giới thiệu + trang GitHub ----------
export const Intro: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const shot = REPO_SHOT as typeof REPO_SHOT & { star: Box };
  // Số sao lấy từ nhãn nút Star trong ảnh chụp ("Star11.8k (11.8k)") để luôn khớp với ảnh.
  const stars = interpolate(frame, [beat("p2", 0.5), beat("p2", 0.8)], [0, parseStarLabel(shot.starLabel)], ease);
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: { cx: 640, cy: 450, s: view.width / shot.page.width } },
    { at: beat("p2", 0.35), cam: { cx: shot.star.x + shot.star.width / 2 - 60, cy: shot.star.y + shot.star.height / 2, s: 2.4 } },
  ];
  return (
    <Scene>
      <SplitLayout
        mediaFrac={0.36}
        head={
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 36 * k }}>
            <Logo
              size={180 * k}
              style={{ transform: `scale(${enter(0, 11)}) rotate(${interpolate(enter(0, 11), [0, 1], [-20, 0])}deg)` }}
            />
            <div style={rise(enter(6))}>
              <div style={{ fontSize: 112 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1 }}>GenOffice</div>
              <div style={{ fontSize: 44 * k, fontWeight: 500, color: C.muted, marginTop: 12 * k }}>Mã nguồn mở · Apache-2.0</div>
            </div>
          </div>
        }
        media={(b) => (
          <div style={rise(enter(4), 120)}>
            <ScreenCard
              src={shot.file}
              page={shot.page}
              view={viewOf(b)}
              keys={keys(viewOf(b))}
              highlights={[{ box: shot.star, from: beat("p2", 0.42) }]}
              accent={BRAND.violet}
              header={<UrlBar url={REPO_URL} muted={C.muted} color={C.text} />}
            />
          </div>
        )}
        foot={
          <div style={{ display: "flex", flexDirection: "column", gap: 26 * k }}>
            <Pill k={k} style={{ fontSize: 76 * k, fontWeight: 900, border: `2px solid ${BRAND.violet}88`, ...rise(enter(beat("p2", 0.5))) }}>
              <StarIcon size={64 * k} color={BRAND.violet} />
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{stars.toFixed(1)}K</span>
              <span style={{ fontSize: 40 * k, fontWeight: 500, color: C.muted }}>sao trên GitHub</span>
            </Pill>
            <Pill k={k} style={{ fontSize: 44 * k, ...rise(enter(beat("p2", 0.72)), 30) }}>
              <CheckIcon size={52 * k} color={BRAND.pink} />
              Ra mắt 31/07/2026
            </Pill>
          </div>
        }
      />
    </Scene>
  );
};

// ---------- P3–P7, P9: tính năng trên ảnh giao diện thật ----------
export type Feature = {
  tag: string;
  title: React.ReactNode;
  subtitle: string;
  file: string; // tên file hiện trên thanh tiêu đề
  dot: string; // màu biểu tượng ứng dụng
  src: string;
  page: Size;
  seg: string;
  keys: (view: Size, b: (frac: number) => number) => CamKey[];
  highlights: (b: (frac: number) => number) => Highlight[];
};

const APP_PAGE = { width: 2400, height: 1530 };
const overview = (view: Size, cx: number, page: Size = APP_PAGE) => ({ cx, cy: page.height / 2, s: view.height / page.height });

// Toạ độ theo ảnh giao diện 2400x1530 trong README (docs/assets/readme).
export const FEATURES: Feature[] = [
  {
    tag: "WORD",
    title: "Sửa Word bằng lời",
    subtitle: "AI sửa thẳng vào tài liệu",
    file: "Company Overview.docx",
    dot: "#2B6CF0",
    src: "genoffice/docs-ai.webp",
    page: APP_PAGE,
    seg: "p3",
    keys: (view, b) => [
      { at: 0, cam: overview(view, 1100) },
      { at: b(0.15), cam: fitBox(box(40, 330, 580, 860), view, 20) },
      { at: b(0.58), cam: fitBox(box(980, 1080, 1020, 250), view, 30) },
    ],
    highlights: (b) => [
      { box: box(170, 330, 430, 150), from: b(0.22), to: b(0.58) },
      { box: box(985, 1090, 1010, 235), from: b(0.64) },
    ],
  },
  {
    tag: "WORD",
    title: "Hoàn tác 1 chạm",
    subtitle: "Mỗi lượt AI sửa đều lưu lại",
    file: "Company Overview.docx",
    dot: "#2B6CF0",
    src: "genoffice/docs-ai.webp",
    page: APP_PAGE,
    seg: "p4",
    keys: (view, b) => [
      { at: 0, cam: fitBox(box(40, 330, 580, 860), view, 20) },
      { at: b(0.4), cam: fitBox(box(40, 980, 600, 260), view, 30) },
    ],
    highlights: (b) => [{ box: box(180, 1172, 150, 50), from: b(0.5) }],
  },
  {
    tag: "EXCEL",
    title: "Công thức thật",
    subtitle: "Không phải số dán sẵn",
    file: "Sales Orders 2026.xlsx",
    dot: "#1E9B57",
    src: "genoffice/sheets-ai.webp",
    page: APP_PAGE,
    seg: "p5",
    keys: (view, b) => [
      { at: 0, cam: overview(view, 1250) },
      { at: b(0.2), cam: fitBox(box(688, 400, 965, 373), view, 30) },
      { at: b(0.62), cam: fitBox(box(699, 800, 1221, 580), view, 20) },
    ],
    highlights: (b) => [
      { box: box(688, 400, 965, 373), from: b(0.3), to: b(0.62) },
      { box: box(705, 810, 1210, 555), from: b(0.7) },
    ],
  },
  {
    tag: "POWERPOINT",
    title: "1 dòng → cả bộ slide",
    subtitle: "Ra file .pptx sửa tiếp được",
    file: "Aurora Home.pptx",
    dot: "#E5553A",
    src: "genoffice/slides-cover.webp",
    page: APP_PAGE,
    seg: "p6",
    keys: (view, b) => [
      { at: 0, cam: fitBox(box(160, 410, 440, 300), view, 30) },
      { at: b(0.45), cam: fitBox(box(630, 300, 1700, 930), view, 10) },
    ],
    highlights: (b) => [
      { box: box(173, 421, 419, 285), from: b(0.08), to: b(0.45) },
      { box: box(635, 307, 160, 1147), from: b(0.6) },
    ],
  },
  {
    tag: "PDF",
    title: "Sửa chữ trên PDF",
    subtitle: "Đổi PDF → Word ngay trên máy",
    file: "Helios Q2 Business Review.pdf",
    dot: "#E23B3B",
    src: "genoffice/pdf-edit.webp",
    page: APP_PAGE,
    seg: "p7",
    keys: (view, b) => [
      { at: 0, cam: overview(view, 1500) },
      { at: b(0.15), cam: fitBox(box(1050, 1040, 1120, 300), view, 30) },
      { at: b(0.6), cam: fitBox(box(900, 160, 520, 130), view, 40) },
    ],
    highlights: (b) => [
      { box: box(1056, 1053, 1109, 293), from: b(0.22), to: b(0.6) },
      { box: box(947, 181, 107, 91), from: b(0.62) },
      { box: box(1195, 181, 152, 91), from: b(0.78) },
    ],
  },
];

const CLI_PAGE = { width: 1562, height: 780 };
export const CLI_FEATURE: Feature = {
  tag: "DÒNG LỆNH",
  title: "Cho Claude Code",
  subtitle: "Lệnh genoffice + skill có sẵn",
  file: "Settings · Integrations",
  dot: BRAND.violet,
  src: "genoffice/cli-integrations.webp",
  page: CLI_PAGE,
  seg: "p9",
  keys: (view, b) => [
    { at: 0, cam: overview(view, 781, CLI_PAGE) },
    { at: b(0.35), cam: fitBox(box(190, 370, 580, 115), view, 30) },
  ],
  highlights: (b) => [{ box: box(192, 380, 540, 95), from: b(0.45) }],
};

export const FeatureScene: React.FC<{ feature: Feature }> = ({ feature }) => {
  const { k } = useLayout();
  const at = (frac: number) => beat(feature.seg, frac);
  const enter = useEnter();
  return (
    <Scene>
      <SplitLayout
        head={
          <div>
            <div style={{ fontSize: 40 * k, fontWeight: 700, letterSpacing: 4 * k, color: BRAND.violet, ...rise(enter(0), 30) }}>
              {feature.tag}
            </div>
            <div style={{ fontSize: 96 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05, marginTop: 14 * k, ...rise(enter(4)) }}>
              {feature.title}
            </div>
          </div>
        }
        media={(b) => (
          <div style={rise(enter(6), 120)}>
            <ScreenCard
              src={feature.src}
              page={feature.page}
              view={viewOf(b)}
              keys={feature.keys(viewOf(b), at)}
              highlights={feature.highlights(at)}
              accent={BRAND.violet}
              header={
                <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, fontWeight: 700, color: C.text, whiteSpace: "nowrap" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: feature.dot }} />
                  GenOffice
                  <span style={{ color: C.muted, fontWeight: 500 }}>· {feature.file}</span>
                </div>
              }
            />
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 48 * k, ...rise(enter(16), 40) }}>
            <CheckIcon size={56 * k} color={BRAND.violet} />
            {feature.subtitle}
          </Pill>
        }
      />
    </Scene>
  );
};

// ---------- P8: file ở máy bạn + chọn AI ----------
const PROVIDERS = [
  { at: 0.42, label: "Claude" },
  { at: 0.5, label: "Gemini" },
  { at: 0.56, label: "OpenAI" },
  { at: 0.62, label: "DeepSeek" },
  { at: 0.68, label: "Qwen" },
  { at: 0.74, label: "Mô hình local" },
];

const LaptopIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={BRAND.violet} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="11" rx="1.5" />
    <path d="M2 19h20M10 8.5l2 2 3-3.5" />
  </svg>
);

export const Local: React.FC = () => {
  const L = useLayout();
  const { k } = L;
  const enter = useEnter();
  return (
    <Scene accent={BRAND.pink}>
      <AbsoluteFill style={{ padding: `${200 * k}px ${L.pad}px`, gap: 56 * k }}>
        <div style={{ display: "flex", alignItems: "center", gap: 36 * k, ...rise(enter(0)) }}>
          <LaptopIcon size={170 * k} />
          <div style={{ fontSize: 96 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05 }}>
            File ở
            <br />
            <GradientText>máy bạn</GradientText>
          </div>
        </div>
        <div style={{ fontSize: 50 * k, fontWeight: 500, color: C.muted, ...rise(enter(beat("p8", 0.3)), 30) }}>
          AI dùng khoá của bạn:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24 * k }}>
          {PROVIDERS.map((p) => {
            const e = enter(beat("p8", p.at));
            return (
              <div
                key={p.label}
                style={{
                  padding: `${30 * k}px ${44 * k}px`,
                  borderRadius: 30 * k,
                  background: "rgba(255,255,255,0.05)",
                  border: `2px solid ${p.label === "Mô hình local" ? BRAND.pink : "rgba(255,255,255,0.12)"}`,
                  fontSize: 58 * k,
                  fontWeight: 700,
                  opacity: e,
                  transform: `scale(${interpolate(e, [0, 1], [0.6, 1])})`,
                }}
              >
                {p.label}
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 40 * k, fontWeight: 500, color: C.muted, ...rise(enter(beat("p8", 0.85)), 20) }}>
          + nhiều nhà cung cấp khác
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P10: kêu gọi ----------
const GithubIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={C.text}>
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
  </svg>
);

export const Outro: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const pulse = 1 + Math.sin(frame / 6) * 0.03;
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", paddingBottom: 200 * k }}>
        <Logo size={260 * k} style={{ transform: `scale(${enter(0, 10) * pulse})` }} />
        <div style={{ display: "flex", gap: 20 * k, marginTop: 60 * k }}>
          {["macOS", "Windows", "Linux"].map((p, i) => (
            <Pill key={p} k={k} style={{ ...rise(enter(4 + i * 5), 30) }}>
              {p}
            </Pill>
          ))}
        </div>
        <div style={{ fontSize: 124 * k, fontWeight: 900, lineHeight: 1.08, marginTop: 70 * k, letterSpacing: -3 * k, ...rise(enter(beat("p10", 0.5))) }}>
          Lưu lại
          <br />
          <GradientText>& thử ngay!</GradientText>
        </div>
        <Pill k={k} style={{ alignSelf: "center", marginTop: 70 * k, fontSize: 42 * k, fontWeight: 500, ...rise(enter(beat("p10", 0.6)), 30) }}>
          <GithubIcon size={48 * k} />
          {REPO_URL}
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};
