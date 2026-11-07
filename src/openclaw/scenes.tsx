import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { HEADER_H, ScreenCard, UrlBar, fitBox, parseStarLabel, type Box, type CamKey, type Highlight, type Size } from "../components/ScreenCard";
import { Bokeh, Stamp } from "../components/fx";
import { SplitLayout, useLayout } from "../components/layout";
import { Background, C, CheckIcon, StarIcon, fontFamily, useExit } from "../components/ui";
import REPO_SHOT from "../../public/openclaw/repo.json";
import { BRAND, BRAND_GRADIENT, REPO_URL, beat } from "./data";

// Mọi kích thước px viết theo thiết kế gốc 1080x1920 rồi nhân `k` (xem useLayout) để vừa mọi khổ.

const LOGO = "openclaw/logo.png";

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
      ...style,
    }}
  >
    {children}
  </div>
);

const Logo: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <Img src={staticFile(LOGO)} style={{ width: size, height: size, borderRadius: size * 0.24, ...style }} />
);

const Scene: React.FC<{ accent?: string; children: React.ReactNode; fade?: boolean }> = ({ accent = BRAND.red, children, fade = true }) => {
  const exit = useExit();
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text, opacity: fade ? exit : 1 }}>
      <Background accent={accent} />
      <Bokeh color={accent} />
      {children}
    </AbsoluteFill>
  );
};

const viewOf = (box: Size): Size => ({ width: box.width, height: box.height - HEADER_H });

// ---------- P1: câu mở đầu — khung chat minh hoạ ----------
const Bubble: React.FC<{ k: number; me?: boolean; p: number; children: React.ReactNode }> = ({ k, me, p, children }) => (
  <div
    style={{
      alignSelf: me ? "flex-end" : "flex-start",
      display: "flex",
      alignItems: "flex-end",
      gap: 18 * k,
      maxWidth: "88%",
      opacity: p,
      transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px) scale(${interpolate(p, [0, 1], [0.92, 1])})`,
    }}
  >
    {!me && <Logo size={84 * k} style={{ flexShrink: 0 }} />}
    <div
      style={{
        padding: `${26 * k}px ${34 * k}px`,
        borderRadius: 40 * k,
        borderBottomRightRadius: me ? 10 * k : 40 * k,
        borderBottomLeftRadius: me ? 40 * k : 10 * k,
        background: me ? BRAND.red : "rgba(255,255,255,0.09)",
        border: me ? "none" : "2px solid rgba(255,255,255,0.12)",
        fontSize: 46 * k,
        fontWeight: 600,
        lineHeight: 1.3,
      }}
    >
      {children}
    </div>
  </div>
);

const Typing: React.FC<{ text: string; from: number; cps?: number }> = ({ text, from, cps = 1.4 }) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.floor((frame - from) * cps));
  return <>{text.slice(0, n)}</>;
};

const CHANNELS = [
  { label: "Telegram", color: "#29A9EB" },
  { label: "WhatsApp", color: "#25D366" },
  { label: "Zalo", color: "#2F80FF" },
];

export const Hook: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const reply = "Xong! 3 email cần trả lời, 1 lịch họp lúc 15h 🦞";
  const replyAt = 15 + beat("p1", 0.4);
  const channel = Math.min(CHANNELS.length - 1, Math.max(0, Math.floor((frame - 15 - beat("p1", 0.55)) / 12)));
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${190 * k}px ${70 * k}px`, gap: 60 * k }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 112 * k, fontWeight: 900, lineHeight: 1.05, letterSpacing: -3 * k, ...rise(enter(0)) }}>Trợ lý AI</div>
          <div style={{ fontSize: 112 * k, fontWeight: 900, lineHeight: 1.1, letterSpacing: -3 * k, ...rise(enter(8)) }}>
            <GradientText>của riêng bạn</GradientText>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 30 * k,
            padding: 40 * k,
            borderRadius: 48 * k,
            background: "rgba(10,13,22,0.7)",
            border: "2px solid rgba(255,255,255,0.1)",
            ...rise(enter(14), 80),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 * k, fontSize: 38 * k, fontWeight: 700, color: C.muted }}>
            <div style={{ width: 22 * k, height: 22 * k, borderRadius: 99, background: CHANNELS[channel].color }} />
            Chat qua <span style={{ color: CHANNELS[channel].color }}>{CHANNELS[channel].label}</span>
          </div>
          <Bubble k={k} me p={enter(22, 14)}>
            Tóm tắt email hôm nay nhé
          </Bubble>
          <Bubble k={k} p={enter(replyAt - 6, 14)}>
            <Typing text={reply} from={replyAt} />
          </Bubble>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24 * k, ...rise(enter(15 + beat("p1", 0.7))) }}>
          <Pill k={k}>
            <CheckIcon size={50 * k} color={BRAND.red} />
            Chạy trên máy bạn
          </Pill>
        </div>
        <div style={{ textAlign: "center", fontSize: 30 * k, color: C.muted, opacity: enter(30) }}>* Ví dụ minh hoạ</div>
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
  const stars = interpolate(frame, [beat("p2", 0.45), beat("p2", 0.8)], [0, parseStarLabel(shot.starLabel)], ease);
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: { cx: 640, cy: 450, s: view.width / shot.page.width } },
    { at: beat("p2", 0.3), cam: { cx: shot.star.x - 60, cy: shot.star.y + shot.star.height / 2, s: 2.4 } },
  ];
  return (
    <Scene>
      <SplitLayout
        mediaFrac={0.36}
        head={
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 36 * k }}>
            <Logo
              size={190 * k}
              style={{ transform: `scale(${enter(0, 11)}) rotate(${interpolate(enter(0, 11), [0, 1], [-20, 0])}deg)` }}
            />
            <div style={rise(enter(6))}>
              <div style={{ fontSize: 112 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1 }}>OpenClaw</div>
              <div style={{ fontSize: 44 * k, fontWeight: 500, color: C.muted, marginTop: 12 * k }}>Mã nguồn mở · chạy local</div>
            </div>
          </div>
        }
        media={(box) => (
          <div style={rise(enter(4), 120)}>
            <ScreenCard
              src={shot.file}
              page={shot.page}
              view={viewOf(box)}
              keys={keys(viewOf(box))}
              highlights={[{ box: shot.star, from: beat("p2", 0.38) }]}
              accent={BRAND.red}
              header={<UrlBar url={REPO_URL} muted={C.muted} color={C.text} />}
            />
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 76 * k, fontWeight: 900, border: `2px solid ${BRAND.red}66`, ...rise(enter(beat("p2", 0.45))) }}>
            <StarIcon size={64 * k} color={BRAND.red} />
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(stars)}K</span>
            <span style={{ fontSize: 40 * k, fontWeight: 500, color: C.muted }}>sao trên GitHub</span>
          </Pill>
        }
      />
    </Scene>
  );
};

// ---------- Cảnh "ảnh README thật + khoanh sáng" (P3, P5, P7) ----------
// Ảnh readme-4880.png: README trên github.com, CSS px 1280x900 (trang y 4880..5780).
const README = { src: "openclaw/readme-4880.png", page: { width: 1280, height: 900 } };
const box = (x: number, y: number, width: number, height: number): Box => ({ x, y, width, height });

export type Feature = {
  label: string;
  title: string;
  subtitle: string;
  screen: string;
  seg: string;
  keys: (view: Size, b: (frac: number) => number) => CamKey[];
  highlights: (b: (frac: number) => number) => Highlight[];
};

export const CHANNELS_FEATURE: Feature = {
  label: "ĐIỂM 01",
  title: "Hơn 20 kênh chat",
  subtitle: "Discord, Slack, Telegram…",
  screen: "README",
  seg: "p3",
  keys: (view, b) => [
    { at: 0, cam: fitBox(box(40, 40, 1200, 560), view) },
    { at: b(0.12), cam: fitBox(box(60, 85, 840, 100), view, 16) },
    { at: b(0.45), cam: fitBox(box(160, 110, 540, 24), view, 24) },
  ],
  highlights: (b) => [
    { box: box(160, 112, 422, 22), from: b(0.2), to: b(0.62) },
    { box: box(618, 112, 80, 22), from: b(0.66) },
  ],
};

export const MODELS_FEATURE: Feature = {
  label: "ĐIỂM 03",
  title: "Đổi mô hình tuỳ ý",
  subtitle: "Claude · Codex · local",
  screen: "README",
  seg: "p5",
  keys: (view, b) => [
    { at: 0, cam: fitBox(box(40, 180, 1200, 420), view) },
    { at: b(0.12), cam: fitBox(box(60, 195, 840, 60), view, 16) },
    { at: b(0.45), cam: fitBox(box(64, 222, 430, 26), view, 24) },
  ],
  highlights: (b) => [{ box: box(64, 224, 428, 22), from: b(0.2) }],
};

export const INSTALL_FEATURE: Feature = {
  label: "ĐIỂM 05",
  title: "Cài một dòng lệnh",
  subtitle: "macOS · Linux · Windows",
  screen: "Install",
  seg: "p7",
  keys: (view, b) => [
    { at: 0, cam: fitBox(box(40, 420, 1200, 300), view) },
    { at: b(0.12), cam: fitBox(box(64, 540, 420, 50), view, 20) },
    { at: b(0.55), cam: fitBox(box(64, 486, 400, 90), view, 20) },
  ],
  highlights: (b) => [
    { box: box(64, 557, 416, 22), from: b(0.18), to: b(0.58) },
    { box: box(64, 488, 392, 22), from: b(0.62) },
  ],
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
            <div style={{ fontSize: 40 * k, fontWeight: 700, letterSpacing: 4 * k, color: BRAND.red, ...rise(enter(0), 30) }}>{feature.label}</div>
            <div style={{ fontSize: 100 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05, marginTop: 14 * k, ...rise(enter(4)) }}>
              {feature.title}
            </div>
          </div>
        }
        media={(b) => (
          <div style={rise(enter(6), 120)}>
            <ScreenCard
              src={README.src}
              page={README.page}
              view={viewOf(b)}
              keys={feature.keys(viewOf(b), at)}
              highlights={feature.highlights(at)}
              accent={BRAND.red}
              header={
                <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, fontWeight: 700, color: C.text }}>
                  <Logo size={44} />
                  openclaw/openclaw
                  <span style={{ color: C.muted, fontWeight: 500 }}>· {feature.screen}</span>
                </div>
              }
            />
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 48 * k, ...rise(enter(16), 40) }}>
            <CheckIcon size={56 * k} color={BRAND.red} />
            {feature.subtitle}
          </Pill>
        }
      />
    </Scene>
  );
};

// ---------- P4: dữ liệu nằm trên máy bạn ----------
const ITEMS = ["Lịch sử chat", "Trí nhớ", "Khoá đăng nhập"];

export const Privacy: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const lockP = enter(beat("p4", 0.75), 10);
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${170 * k}px ${70 * k}px`, alignItems: "center", gap: 70 * k }}>
        <div style={{ alignSelf: "flex-start" }}>
          <div style={{ fontSize: 40 * k, fontWeight: 700, letterSpacing: 4 * k, color: BRAND.red, ...rise(enter(0), 30) }}>ĐIỂM 02</div>
          <div style={{ fontSize: 100 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05, marginTop: 14 * k, ...rise(enter(4)) }}>
            Dữ liệu ở
            <br />
            <GradientText>trên máy bạn</GradientText>
          </div>
        </div>
        <div style={{ display: "flex", gap: 22 * k, flexWrap: "wrap", justifyContent: "center" }}>
          {ITEMS.map((item, i) => {
            const p = enter(beat("p4", 0.08 + i * 0.2));
            // Mỗi thẻ hiện rồi "rơi" vào laptop.
            const drop = interpolate(frame, [beat("p4", 0.62), beat("p4", 0.78)], [0, 1], ease);
            return (
              <Pill
                key={item}
                k={k}
                style={{
                  alignSelf: "center",
                  fontSize: 46 * k,
                  opacity: p * (1 - drop),
                  transform: `translateY(${interpolate(p, [0, 1], [40, 0]) + drop * 420 * k}px) scale(${1 - drop * 0.5})`,
                }}
              >
                <CheckIcon size={50 * k} color={BRAND.red} />
                {item}
              </Pill>
            );
          })}
        </div>
        <div style={{ position: "relative", width: 720 * k, height: 520 * k, ...rise(enter(6), 80) }}>
          {/* Laptop tự vẽ */}
          <div
            style={{
              position: "absolute",
              left: 60 * k,
              top: 0,
              width: 600 * k,
              height: 400 * k,
              borderRadius: 30 * k,
              border: `${10 * k}px solid #2A3142`,
              background: "linear-gradient(160deg, #141A2A, #0D1220)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Logo size={150 * k} style={{ opacity: 1 - lockP * 0.6 }} />
            <svg
              width={200 * k}
              height={200 * k}
              viewBox="0 0 24 24"
              fill="none"
              stroke={BRAND.coral}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: "absolute", opacity: lockP, transform: `scale(${interpolate(lockP, [0, 1], [1.8, 1])})` }}
            >
              <rect x="4" y="11" width="16" height="10" rx="2" fill="#0D1220" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              <circle cx="12" cy="16" r="1.4" fill={BRAND.coral} />
            </svg>
          </div>
          <div style={{ position: "absolute", left: 0, top: 410 * k, width: 720 * k, height: 34 * k, borderRadius: `0 0 ${30 * k}px ${30 * k}px`, background: "#2A3142" }} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P6: 180+ plugin + ClawHub ----------
const Icon: React.FC<{ d: string; size: number }> = ({ d, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={BRAND.red} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const KINDS = [
  { at: 0.05, label: "Kênh chat", sub: "Zalo, Slack, Matrix…", icon: "M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z" },
  { at: 0.2, label: "Mô hình", sub: "Ollama, Claude, Gemini…", icon: "M12 2 3 7v10l9 5 9-5V7zM3 7l9 5 9-5M12 12v10" },
  { at: 0.62, label: "Kỹ năng ClawHub", sub: "Cài thêm khi cần", icon: "M12 2l3 7h7l-5.5 4.5L18.5 21 12 16.5 5.5 21l2-7.5L2 9h7z" },
];

export const Plugins: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const n = interpolate(frame, [beat("p6", 0.15), beat("p6", 0.5)], [0, 180], ease);
  return (
    <Scene accent={BRAND.coral}>
      <AbsoluteFill style={{ padding: `${170 * k}px ${70 * k}px`, gap: 60 * k }}>
        <div style={{ fontSize: 40 * k, fontWeight: 700, letterSpacing: 4 * k, color: BRAND.red, ...rise(enter(0), 30) }}>ĐIỂM 04</div>
        <div style={rise(enter(beat("p6", 0.12)))}>
          <div style={{ fontSize: 250 * k, fontWeight: 900, lineHeight: 0.95, letterSpacing: -8 * k, fontVariantNumeric: "tabular-nums" }}>
            <GradientText>{Math.round(n)}+</GradientText>
          </div>
          <div style={{ fontSize: 64 * k, fontWeight: 700, color: C.muted, marginTop: 10 * k }}>plugin có sẵn trong repo</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 * k }}>
          {KINDS.map((m) => {
            const p = enter(beat("p6", m.at) + 6);
            return (
              <div
                key={m.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 34 * k,
                  padding: `${32 * k}px ${40 * k}px`,
                  borderRadius: 32 * k,
                  background: "rgba(255,255,255,0.05)",
                  border: "2px solid rgba(255,255,255,0.1)",
                  opacity: p,
                  transform: `translateX(${interpolate(p, [0, 1], [90, 0])}px)`,
                }}
              >
                <Icon d={m.icon} size={64 * k} />
                <div>
                  <div style={{ fontSize: 56 * k, fontWeight: 800 }}>{m.label}</div>
                  <div style={{ fontSize: 38 * k, fontWeight: 500, color: C.muted, marginTop: 4 * k }}>{m.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P8: MIT, miễn phí, quỹ phi lợi nhuận ----------
export const License: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", gap: 60 * k, paddingBottom: 200 * k }}>
        <div style={{ fontSize: 40 * k, fontWeight: 700, letterSpacing: 4 * k, color: BRAND.red, ...rise(enter(0), 30) }}>ĐIỂM 06</div>
        <div style={{ fontSize: 300 * k, fontWeight: 900, lineHeight: 0.9, letterSpacing: -10 * k, ...rise(enter(2)) }}>
          <GradientText>MIT</GradientText>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 26 * k, alignItems: "center" }}>
          <Pill k={k} style={{ alignSelf: "center", fontSize: 56 * k, ...rise(enter(beat("p8", 0.3))) }}>
            <CheckIcon size={60 * k} color={BRAND.red} />
            Miễn phí
          </Pill>
          <Pill k={k} style={{ alignSelf: "center", fontSize: 56 * k, ...rise(enter(beat("p8", 0.55))) }}>
            <CheckIcon size={60 * k} color={BRAND.red} />
            Quỹ phi lợi nhuận
          </Pill>
        </div>
        <div style={{ height: 120 * k, marginTop: 20 * k }}>
          <Stamp text="MÃ NGUỒN MỞ" color={BRAND.coral} at={beat("p8", 0.75)} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P9: lưu lại & thử ngay ----------
export const Outro: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const pulse = 1 + Math.sin(frame / 6) * 0.03;
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", paddingBottom: 160 * k }}>
        <Logo size={260 * k} style={{ transform: `scale(${enter(0, 10) * pulse})` }} />
        <div style={{ fontSize: 124 * k, fontWeight: 900, lineHeight: 1.08, marginTop: 70 * k, letterSpacing: -3 * k, ...rise(enter(8)) }}>
          Lưu lại
          <br />
          <GradientText>& thử ngay!</GradientText>
        </div>
        <Pill k={k} style={{ alignSelf: "center", marginTop: 70 * k, fontSize: 42 * k, fontWeight: 500, ...rise(enter(18), 30) }}>
          <svg width={48 * k} height={48 * k} viewBox="0 0 24 24" fill={C.text}>
            <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
          </svg>
          {REPO_URL}
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};
