import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { HEADER_H, ScreenCard, UrlBar, fitBox, parseStarLabel, type Box, type CamKey, type Highlight, type Size } from "../components/ScreenCard";
import { Bokeh } from "../components/fx";
import { SplitLayout, useLayout } from "../components/layout";
import { Background, C, CheckIcon, StarIcon, fontFamily, useExit } from "../components/ui";
import REPO_SHOT from "../../public/hermes/repo.json";
import { BRAND, BRAND_GRADIENT, REPO_URL, beat } from "./data";

// Mọi kích thước px viết theo thiết kế gốc 1080x1920 rồi nhân `k` (xem useLayout) để vừa mọi khổ.

const MASCOT = "hermes/hermes.png"; // linh vật pixel chính thức (apps/desktop/public/hermes.png)

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

// Linh vật pixel: giữ nét pixel khi phóng to.
const Mascot: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <Img src={staticFile(MASCOT)} style={{ width: size, height: size, imageRendering: "pixelated", ...style }} />
);

const Tile: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.24,
      background: "linear-gradient(160deg, #1B2340, #0E1426)",
      border: `2px solid ${BRAND.gold}55`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      ...style,
    }}
  >
    <Mascot size={size * 0.86} />
  </div>
);

const Scene: React.FC<{ accent?: string; children: React.ReactNode }> = ({ accent = BRAND.gold, children }) => {
  const exit = useExit();
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text, opacity: exit }}>
      <Background accent={accent} />
      <Bokeh color={accent} />
      {children}
    </AbsoluteFill>
  );
};

const Label: React.FC<{ k: number; p: number; children: React.ReactNode }> = ({ k, p, children }) => (
  <div style={{ fontSize: 40 * k, fontWeight: 700, letterSpacing: 4 * k, color: BRAND.gold, ...rise(p, 30) }}>{children}</div>
);
const Title: React.FC<{ k: number; p: number; children: React.ReactNode }> = ({ k, p, children }) => (
  <div style={{ fontSize: 100 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05, marginTop: 14 * k, ...rise(p) }}>{children}</div>
);

const viewOf = (box: Size): Size => ({ width: box.width, height: box.height - HEADER_H });

// Vòng tròn có chấm sáng chạy quanh — hình ảnh "vòng lặp tự học".
const LoopRing: React.FC<{ r: number; k: number; speed?: number; dots?: number }> = ({ r, k, speed = 90, dots = 1 }) => {
  const frame = useCurrentFrame();
  const size = r * 2 + 60 * k;
  const c = size / 2;
  return (
    <svg width={size} height={size} style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", overflow: "visible" }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke={`${BRAND.gold}33`} strokeWidth={6 * k} />
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke={BRAND.gold}
        strokeWidth={6 * k}
        strokeLinecap="round"
        strokeDasharray={`${r * 1.2} ${r * 10}`}
        strokeDashoffset={-((frame / speed) * 2 * Math.PI * r)}
        style={{ filter: `drop-shadow(0 0 ${12 * k}px ${BRAND.gold})` }}
      />
      {Array.from({ length: dots }, (_, i) => {
        const a = (frame / speed) * 2 * Math.PI + (i * 2 * Math.PI) / dots;
        return <circle key={i} cx={c + r * Math.cos(a)} cy={c + r * Math.sin(a)} r={12 * k} fill="#FFF3C4" />;
      })}
    </svg>
  );
};

// ---------- P1: câu mở đầu ----------
export const Hook: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const line = { fontSize: 128 * k, fontWeight: 900, lineHeight: 1.05, letterSpacing: -3 * k };
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 220 * k, textAlign: "center" }}>
        <div style={{ ...line, ...rise(enter(0)) }}>Càng dùng</div>
        <div style={{ ...line, ...rise(enter(8)) }}>
          <GradientText>càng giỏi</GradientText>
        </div>
        <div style={{ position: "relative", width: 640 * k, height: 640 * k, marginTop: 70 * k, opacity: enter(12) }}>
          <LoopRing r={290 * k} k={k} dots={1} />
          <Mascot size={420 * k} style={{ position: "absolute", left: 110 * k, top: 110 * k, transform: `scale(${enter(14, 11)})` }} />
        </div>
        <div style={{ display: "flex", gap: 24 * k, marginTop: 50 * k, ...rise(enter(15 + beat("p1", 0.6))) }}>
          <Pill k={k}>
            <CheckIcon size={50 * k} color={BRAND.gold} />
            Tự học
          </Pill>
          <Pill k={k}>
            <CheckIcon size={50 * k} color={BRAND.gold} />
            Mã nguồn mở
          </Pill>
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
  const stars = interpolate(frame, [beat("p2", 0.55), beat("p2", 0.85)], [0, parseStarLabel(shot.starLabel)], ease);
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: { cx: 640, cy: 450, s: view.width / shot.page.width } },
    { at: beat("p2", 0.45), cam: { cx: shot.star.x - 60, cy: shot.star.y + shot.star.height / 2, s: 2.4 } },
  ];
  return (
    <Scene>
      <SplitLayout
        mediaFrac={0.36}
        head={
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 36 * k }}>
            <Tile size={190 * k} style={{ transform: `scale(${enter(0, 11)}) rotate(${interpolate(enter(0, 11), [0, 1], [-20, 0])}deg)` }} />
            <div style={rise(enter(6))}>
              <div style={{ fontSize: 104 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1 }}>Hermes Agent</div>
              <div style={{ fontSize: 44 * k, fontWeight: 500, color: C.muted, marginTop: 12 * k }}>Nous Research · MIT</div>
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
              highlights={[{ box: shot.star, from: beat("p2", 0.52) }]}
              accent={BRAND.gold}
              header={<UrlBar url={REPO_URL} muted={C.muted} color={C.text} />}
            />
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 76 * k, fontWeight: 900, border: `2px solid ${BRAND.gold}66`, ...rise(enter(beat("p2", 0.55))) }}>
            <StarIcon size={64 * k} color={BRAND.gold} />
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(stars)}K</span>
            <span style={{ fontSize: 40 * k, fontWeight: 500, color: C.muted }}>sao trên GitHub</span>
          </Pill>
        }
      />
    </Scene>
  );
};

// ---------- P3: vòng lặp tự học ----------
const STEPS = [
  { at: 0.08, icon: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5z", label: "Làm việc khó" },
  { at: 0.35, icon: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z", label: "Viết kỹ năng" },
  { at: 0.65, icon: "M3 17l6-6 4 4 8-8M14 7h7v7", label: "Tự cải thiện" },
];

const StrokeIcon: React.FC<{ d: string; size: number; color: string }> = ({ d, size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export const LearningLoop: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const R = 320 * k;
  const W = 960 * k;
  const H = 900 * k;
  // Ba nút trên vòng tròn: trên cùng, phải dưới, trái dưới.
  const angles = [-90, 30, 150].map((d) => (d * Math.PI) / 180);
  const active = STEPS.reduce((acc, s, i) => (frame >= beat("p3", s.at) ? i : acc), -1);
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${170 * k}px ${60 * k}px`, gap: 40 * k }}>
        <div>
          <Label k={k} p={enter(0)}>VÒNG LẶP TỰ HỌC</Label>
          <Title k={k} p={enter(4)}>
            Tự học thành
            <br />
            <GradientText>kỹ năng</GradientText>
          </Title>
        </div>
        <div style={{ position: "relative", width: W, height: H, opacity: enter(6) }}>
          <LoopRing r={R} k={k} speed={60} />
          <div style={{ position: "absolute", left: W / 2 - 110 * k, top: H / 2 - 110 * k, opacity: enter(beat("p3", 0.75)) }}>
            <Mascot size={220 * k} />
          </div>
          {STEPS.map((s, i) => {
            const p = enter(beat("p3", s.at), 12);
            const on = i === active;
            const x = W / 2 + R * Math.cos(angles[i]);
            const y = H / 2 + R * Math.sin(angles[i]);
            const size = 170 * k;
            return (
              <div
                key={s.label}
                style={{
                  position: "absolute",
                  left: x - 200 * k,
                  top: y - size / 2,
                  width: 400 * k,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14 * k,
                  opacity: p,
                  transform: `scale(${interpolate(p, [0, 1], [0.6, 1])})`,
                }}
              >
                <div
                  style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    background: on ? BRAND.gold : "#151A26",
                    border: `${5 * k}px solid ${BRAND.gold}`,
                    boxShadow: on ? `0 0 ${50 * k}px ${BRAND.gold}88` : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <StrokeIcon d={s.icon} size={86 * k} color={on ? "#0A0D16" : BRAND.gold} />
                </div>
                <div
                  style={{
                    fontSize: 42 * k,
                    fontWeight: 800,
                    textAlign: "center",
                    padding: `${6 * k}px ${18 * k}px`,
                    borderRadius: 16 * k,
                    background: "rgba(10,13,22,0.85)",
                  }}
                >
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P4: trí nhớ — thẻ ghi nhớ minh hoạ ----------
const MEMORIES = [
  { at: 0.05, icon: "M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z", text: "Tìm lại: “lịch họp tuần trước”" },
  { at: 0.45, icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", text: "Bạn thích báo cáo ngắn gọn" },
  { at: 0.65, icon: "M12 8v4l3 3M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z", text: "Bạn làm việc từ 9h sáng" },
];

export const Memory: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const level = interpolate(frame, [beat("p4", 0.4), beat("p4", 0.95)], [0, 1], ease);
  return (
    <Scene accent={BRAND.blue}>
      <AbsoluteFill style={{ padding: `${170 * k}px ${60 * k}px`, gap: 60 * k }}>
        <div>
          <Label k={k} p={enter(0)}>TRÍ NHỚ</Label>
          <Title k={k} p={enter(4)}>
            Nhớ và <GradientText>hiểu bạn</GradientText>
          </Title>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 * k }}>
          {MEMORIES.map((m) => {
            const p = enter(beat("p4", m.at));
            return (
              <div
                key={m.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 30 * k,
                  padding: `${34 * k}px ${40 * k}px`,
                  borderRadius: 32 * k,
                  background: "rgba(255,255,255,0.05)",
                  border: `2px solid ${BRAND.gold}33`,
                  fontSize: 50 * k,
                  fontWeight: 700,
                  opacity: p,
                  transform: `translateX(${interpolate(p, [0, 1], [90, 0])}px)`,
                }}
              >
                <StrokeIcon d={m.icon} size={64 * k} color={BRAND.gold} />
                {m.text}
              </div>
            );
          })}
        </div>
        <div style={{ ...rise(enter(beat("p4", 0.4))) }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 40 * k, fontWeight: 700, color: C.muted }}>
            <span>Mức hiểu bạn</span>
            <span style={{ color: BRAND.gold }}>Phiên {1 + Math.round(level * 4)}</span>
          </div>
          <div style={{ marginTop: 18 * k, height: 34 * k, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ width: `${20 + level * 75}%`, height: "100%", borderRadius: 99, background: BRAND_GRADIENT }} />
          </div>
        </div>
        <div style={{ fontSize: 30 * k, color: C.muted, opacity: enter(20) }}>* Ví dụ minh hoạ</div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- Cảnh "ảnh giao diện thật + khoanh sáng" (P5, P6, P8) ----------
const box = (x: number, y: number, width: number, height: number): Box => ({ x, y, width, height });

export type Feature = {
  label: string;
  title: React.ReactNode;
  subtitle: string;
  screen: string;
  src: string;
  page: Size;
  seg: string;
  keys: (view: Size, b: (frac: number) => number) => CamKey[];
  highlights: (b: (frac: number) => number) => Highlight[];
};

const DASH = { width: 1280, height: 720 }; // ảnh bảng điều khiển trong website/static/img/dashboard
const README = { width: 1280, height: 900 }; // readme-8200.png (trang y 8200..9100)

export const CHANNELS_FEATURE: Feature = {
  label: "KÊNH CHAT",
  title: "Nhắn từ app chat",
  subtitle: "Một cổng cho mọi kênh",
  screen: "Channels",
  src: "hermes/admin-channels.png",
  page: DASH,
  seg: "p5",
  keys: (view, b) => [
    { at: 0, cam: fitBox(box(0, 0, 1280, 720), view, 0) },
    { at: b(0.1), cam: fitBox(box(262, 190, 520, 160), view, 20) },
    { at: b(0.5), cam: fitBox(box(262, 360, 520, 330), view, 20) },
    { at: b(0.8), cam: fitBox(box(258, 140, 520, 40), view, 20) },
  ],
  highlights: (b) => [
    { box: box(276, 200, 160, 50), from: b(0.14), to: b(0.32) },
    { box: box(276, 285, 150, 50), from: b(0.28), to: b(0.46) },
    { box: box(276, 370, 140, 50), from: b(0.42), to: b(0.6) },
    { box: box(276, 624, 160, 50), from: b(0.56), to: b(0.8) },
    { box: box(262, 150, 150, 16), from: b(0.84) },
  ],
};

export const CRON_FEATURE: Feature = {
  label: "TỰ ĐỘNG",
  title: "Tự chạy theo lịch",
  subtitle: "Hẹn giờ bằng lời thường",
  screen: "Sessions",
  src: "hermes/admin-sessions.png",
  page: DASH,
  seg: "p6",
  keys: (view, b) => [
    { at: 0, cam: fitBox(box(0, 0, 1280, 720), view, 0) },
    { at: b(0.12), cam: fitBox(box(262, 76, 560, 60), view, 20) },
    { at: b(0.45), cam: fitBox(box(262, 190, 420, 70), view, 16) },
  ],
  highlights: (b) => [
    { box: box(567, 91, 48, 24), from: b(0.18), to: b(0.45) },
    { box: box(272, 202, 120, 44), from: b(0.52) },
  ],
};

export const INSTALL_FEATURE: Feature = {
  label: "CÀI ĐẶT",
  title: "Một dòng lệnh",
  subtitle: "Linux · macOS · Windows",
  screen: "README · Quick Install",
  src: "hermes/readme-8200.png",
  page: README,
  seg: "p8",
  keys: (view, b) => [
    { at: 0, cam: fitBox(box(40, 20, 880, 480), view) },
    { at: b(0.12), cam: fitBox(box(64, 92, 560, 80), view, 20) },
    { at: b(0.6), cam: fitBox(box(64, 208, 560, 210), view, 20) },
  ],
  highlights: (b) => [
    { box: box(78, 150, 545, 20), from: b(0.18) },
    { box: box(64, 96, 204, 20), from: b(0.4), to: b(0.62) },
    { box: box(64, 212, 290, 22), from: b(0.7) },
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
            <Label k={k} p={enter(0)}>{feature.label}</Label>
            <Title k={k} p={enter(4)}>{feature.title}</Title>
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
              accent={BRAND.gold}
              header={
                <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, fontWeight: 700, color: C.text }}>
                  <Mascot size={48} />
                  Hermes Agent
                  <span style={{ color: C.muted, fontWeight: 500 }}>· {feature.screen}</span>
                </div>
              }
            />
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 48 * k, ...rise(enter(16), 40) }}>
            <CheckIcon size={56 * k} color={BRAND.gold} />
            {feature.subtitle}
          </Pill>
        }
      />
    </Scene>
  );
};

// ---------- P7: mô hình tuỳ chọn, chạy ở đâu cũng được ----------
const RUNS = [
  { at: 0.05, label: "Mô hình tuỳ chọn", sub: "OpenRouter, OpenAI, endpoint riêng…", icon: "M12 2 3 7v10l9 5 9-5V7zM3 7l9 5 9-5M12 12v10" },
  { at: 0.42, label: "Máy chủ $5 / tháng", sub: "Local · Docker · SSH", icon: "M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01" },
  { at: 0.72, label: "Hay cả cụm GPU", sub: "Hoặc serverless: Modal, Daytona", icon: "M6 6h12v12H6zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" },
];

export const RunAnywhere: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  return (
    <Scene accent={BRAND.amber}>
      <AbsoluteFill style={{ padding: `${170 * k}px ${60 * k}px`, gap: 60 * k }}>
        <div>
          <Label k={k} p={enter(0)}>LINH HOẠT</Label>
          <Title k={k} p={enter(4)}>
            Chạy ở
            <br />
            <GradientText>đâu cũng được</GradientText>
          </Title>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 * k }}>
          {RUNS.map((m) => {
            const p = enter(beat("p7", m.at) + 4);
            return (
              <div
                key={m.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 34 * k,
                  padding: `${34 * k}px ${40 * k}px`,
                  borderRadius: 32 * k,
                  background: "rgba(255,255,255,0.05)",
                  border: "2px solid rgba(255,255,255,0.1)",
                  opacity: p,
                  transform: `translateX(${interpolate(p, [0, 1], [90, 0])}px)`,
                }}
              >
                <StrokeIcon d={m.icon} size={72 * k} color={BRAND.gold} />
                <div>
                  <div style={{ fontSize: 58 * k, fontWeight: 800 }}>{m.label}</div>
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

// ---------- P9: lưu lại & thử ngay ----------
export const Outro: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const pulse = 1 + Math.sin(frame / 6) * 0.03;
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", paddingBottom: 160 * k }}>
        <Mascot size={320 * k} style={{ transform: `scale(${enter(0, 10) * pulse})` }} />
        <div style={{ display: "flex", gap: 20 * k, marginTop: 40 * k, ...rise(enter(6), 30) }}>
          <Pill k={k}>Mã nguồn mở</Pill>
          <Pill k={k}>MIT</Pill>
        </div>
        <div style={{ fontSize: 124 * k, fontWeight: 900, lineHeight: 1.08, marginTop: 60 * k, letterSpacing: -3 * k, ...rise(enter(beat("p9", 0.35))) }}>
          Lưu lại
          <br />
          <GradientText>& thử ngay!</GradientText>
        </div>
        <Pill k={k} style={{ alignSelf: "center", marginTop: 60 * k, fontSize: 38 * k, fontWeight: 500, ...rise(enter(beat("p9", 0.45)), 30) }}>
          <svg width={46 * k} height={46 * k} viewBox="0 0 24 24" fill={C.text}>
            <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
          </svg>
          {REPO_URL}
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};
