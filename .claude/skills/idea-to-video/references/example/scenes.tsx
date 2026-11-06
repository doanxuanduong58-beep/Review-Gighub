import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { HEADER_H, ScreenCard, UrlBar, fitBox, parseStarLabel, type Box, type CamKey, type Highlight, type Size } from "../components/ScreenCard";
import { SplitLayout, useLayout } from "../components/layout";
import { Background, C, CheckIcon, StarIcon, fontFamily, useExit } from "../components/ui";
import REPO_SHOT from "../../public/voicestudio/repo.json";
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

const Waveform: React.FC<{ k: number; bars?: number }> = ({ k, bars = 28 }) => {
  const frame = useCurrentFrame();
  const height = 220 * k;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 * k, height, justifyContent: "center" }}>
      {Array.from({ length: bars }, (_, i) => {
        const env = Math.sin((i / (bars - 1)) * Math.PI);
        const wobble = 0.35 + 0.65 * Math.abs(Math.sin(frame / 6 + i * 0.7) * Math.cos(frame / 11 + i * 0.3));
        return (
          <div
            key={i}
            style={{ width: 18 * k, height: Math.max(14 * k, height * env * wobble), borderRadius: 9 * k, background: BRAND_GRADIENT }}
          />
        );
      })}
    </div>
  );
};

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

// Ô media của SplitLayout -> kích thước khung xem trong ScreenCard.
const viewOf = (box: Size): Size => ({ width: box.width, height: box.height - HEADER_H });

// ---------- P1: câu mở đầu ----------
export const Hook: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const exit = useExit();
  const line = { fontSize: 120 * k, fontWeight: 900, lineHeight: 1.05, letterSpacing: -3 * k };
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text, opacity: exit }}>
      <Background accent={BRAND.pink} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", gap: 10 * k }}>
        <div style={{ ...line, ...rise(enter(0)) }}>Giọng AI xịn</div>
        <div style={{ ...line, ...rise(enter(8)) }}>
          <GradientText>như ElevenLabs</GradientText>
        </div>
        <div style={{ margin: `${70 * k}px 0`, opacity: enter(14) }}>
          <Waveform k={k} />
        </div>
        <div style={{ display: "flex", gap: 24 * k, ...rise(enter(40)) }}>
          <Pill k={k}>
            <CheckIcon size={50 * k} color={BRAND.pink} />
            Miễn phí
          </Pill>
          <Pill k={k}>
            <CheckIcon size={50 * k} color={BRAND.pink} />
            Chạy trên máy bạn
          </Pill>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- P2: giới thiệu + trang GitHub ----------
export const Intro: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const exit = useExit();
  const shot = REPO_SHOT as typeof REPO_SHOT & { star: Box };
  // Số sao lấy từ nhãn nút Star trong ảnh chụp ("Star69.8k (69.8k)") để luôn khớp với ảnh.
  // Mốc theo nhịp câu p2: zoom nút Star ở ~37%, số sao đếm 50%→78%.
  const stars = interpolate(frame, [beat("p2", 0.5), beat("p2", 0.78)], [0, parseStarLabel(shot.starLabel)], ease);

  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: { cx: 640, cy: 450, s: view.width / shot.page.width } },
    { at: beat("p2", 0.37), cam: { cx: shot.star.x + shot.star.width / 2, cy: shot.star.y + shot.star.height / 2, s: 2.6 } },
  ];

  return (
    <AbsoluteFill style={{ fontFamily, color: C.text, opacity: exit }}>
      <Background accent={BRAND.pink} />
      <SplitLayout
        mediaFrac={0.36}
        head={
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 36 * k }}>
            <Img
              src={staticFile("voicestudio/logo.png")}
              style={{ width: 190 * k, height: 190 * k, transform: `scale(${enter(0, 11)}) rotate(${interpolate(enter(0, 11), [0, 1], [-20, 0])}deg)` }}
            />
            <div style={rise(enter(6))}>
              <div style={{ fontSize: 112 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1 }}>VoiceStudio</div>
              <div style={{ fontSize: 44 * k, fontWeight: 500, color: C.muted, marginTop: 12 * k }}>Mã nguồn mở · 100% local</div>
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
              highlights={[{ box: shot.star, from: beat("p2", 0.42) }]}
              accent={BRAND.pink}
              header={<UrlBar url={REPO_URL} muted={C.muted} color={C.text} />}
            />
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 76 * k, fontWeight: 900, border: `2px solid ${BRAND.pink}66`, ...rise(enter(beat("p2", 0.5))) }}>
            <StarIcon size={64 * k} color={BRAND.pink} />
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{stars.toFixed(1)}K</span>
            <span style={{ fontSize: 40 * k, fontWeight: 500, color: C.muted }}>sao trên GitHub</span>
          </Pill>
        }
      />
    </AbsoluteFill>
  );
};

// ---------- P3–P5: từng tính năng trên ảnh giao diện thật ----------
const APP_PAGE = { width: 1440, height: 960 };

export type Feature = {
  index: number;
  title: string;
  subtitle: string;
  screen: string; // tên màn hình hiện trên thanh tiêu đề
  src: string;
  seg: string; // id câu thoại của cảnh — mốc tính bằng b(frac) = beat(seg, frac)
  // Camera tính theo khung xem thật (khác nhau giữa khổ dọc và ngang).
  keys: (view: Size, b: (frac: number) => number) => CamKey[];
  highlights: (b: (frac: number) => number) => Highlight[];
};

const box = (x: number, y: number, width: number, height: number): Box => ({ x, y, width, height });
const overview = (view: Size, cx: number) => ({ cx, cy: 480, s: view.height / APP_PAGE.height });

// Toạ độ theo ảnh giao diện 1440x960 trong README.
export const FEATURES: Feature[] = [
  {
    index: 1,
    title: "Nhân bản giọng nói",
    subtitle: "Chỉ cần một đoạn ghi âm mẫu",
    screen: "Voice cloning",
    src: "voicestudio/voice-cloning.png",
    seg: "p3",
    keys: (view, b) => [
      { at: 0, cam: overview(view, 760) },
      { at: b(0.14), cam: fitBox(box(410, 80, 870, 150), view) },
      { at: b(0.52), cam: fitBox(box(900, 790, 380, 110), view, 40) },
    ],
    highlights: (b) => [
      { box: box(424, 82, 290, 36), from: b(0.19), to: b(0.52) },
      { box: box(1003, 818, 208, 40), from: b(0.6) },
    ],
  },
  {
    index: 2,
    title: "Thiết kế giọng mới",
    subtitle: "Mô tả bằng chữ, AI tạo giọng",
    screen: "Voice design",
    src: "voicestudio/voice-design.png",
    seg: "p4",
    keys: (view, b) => [
      { at: 0, cam: overview(view, 560) },
      { at: b(0.18), cam: fitBox(box(62, 120, 305, 210), view) },
      { at: b(0.66), cam: fitBox(box(490, 170, 860, 500), view, 20) },
    ],
    highlights: (b) => [
      { box: box(75, 179, 279, 96), from: b(0.23), to: b(0.66) },
      { box: box(492, 172, 414, 108), from: b(0.72) },
    ],
  },
  {
    index: 3,
    title: "Lồng tiếng video",
    subtitle: "Khớp lời thoại theo thời gian",
    screen: "Video Dubbing Studio",
    src: "voicestudio/dubbing.png",
    seg: "p5",
    keys: (view, b) => [
      { at: 0, cam: overview(view, 860) },
      { at: b(0.16), cam: fitBox(box(512, 228, 870, 470), view, 16) },
      { at: b(0.62), cam: fitBox(box(950, 290, 420, 350), view, 20) },
    ],
    highlights: (b) => [
      { box: box(529, 296, 100, 20), from: b(0.23), to: b(0.62) },
      { box: box(955, 322, 410, 230), from: b(0.68) },
    ],
  },
];

export const FeatureScene: React.FC<{ feature: Feature }> = ({ feature }) => {
  const { k } = useLayout();
  const at = (frac: number) => beat(feature.seg, frac);
  const enter = useEnter();
  const exit = useExit();
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text, opacity: exit }}>
      <Background accent={BRAND.pink} />
      <SplitLayout
        head={
          <div>
            <div style={{ fontSize: 40 * k, fontWeight: 700, letterSpacing: 4 * k, color: BRAND.pink, ...rise(enter(0), 30) }}>
              TÍNH NĂNG 0{feature.index}
            </div>
            <div style={{ fontSize: 100 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05, marginTop: 14 * k, ...rise(enter(4)) }}>
              {feature.title}
            </div>
          </div>
        }
        media={(b) => (
          <div style={rise(enter(6), 120)}>
            <ScreenCard
              src={feature.src}
              page={APP_PAGE}
              view={viewOf(b)}
              keys={feature.keys(viewOf(b), at)}
              highlights={feature.highlights(at)}
              accent={BRAND.pink}
              header={
                <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, fontWeight: 700, color: C.text }}>
                  <Img src={staticFile("voicestudio/logo.png")} style={{ width: 44, height: 44 }} />
                  VoiceStudio
                  <span style={{ color: C.muted, fontWeight: 500 }}>· {feature.screen}</span>
                </div>
              }
            />
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 48 * k, ...rise(enter(16), 40) }}>
            <CheckIcon size={56 * k} color={BRAND.pink} />
            {feature.subtitle}
          </Pill>
        }
      />
    </AbsoluteFill>
  );
};

// ---------- P6: còn nữa ----------
const Icon: React.FC<{ d: string; size: number }> = ({ d, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={BRAND.pink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const MORE = [
  { at: 0.1, label: "Giọng nói → chữ", icon: "M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM19 11a7 7 0 0 1-14 0M12 18v3" },
  { at: 0.29, label: "Làm sách nói", icon: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 7h7" },
  { at: 0.49, label: "MCP cho agent AI", icon: "M9 3v5M15 3v5M7 8h10v4a5 5 0 0 1-10 0zM12 17v4" },
];

export const More: React.FC = () => {
  const L = useLayout();
  const { k } = L;
  const frame = useCurrentFrame();
  const enter = useEnter();
  const exit = useExit();
  // Mốc theo nhịp câu p6: thẻ hiện ở 10% / 29% / 49%, con số đếm 73%→93%.
  const langs = interpolate(frame, [beat("p6", 0.73), beat("p6", 0.93)], [0, 646], ease);

  const list = (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 * k }}>
      {MORE.map((m) => {
        const p = enter(beat("p6", m.at));
        return (
          <div
            key={m.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 34 * k,
              padding: `${36 * k}px ${40 * k}px`,
              borderRadius: 32 * k,
              background: "rgba(255,255,255,0.05)",
              border: "2px solid rgba(255,255,255,0.1)",
              fontSize: 60 * k,
              fontWeight: 700,
              opacity: p,
              transform: `translateX(${interpolate(p, [0, 1], [90, 0])}px)`,
            }}
          >
            <Icon d={m.icon} size={64 * k} />
            {m.label}
          </div>
        );
      })}
    </div>
  );
  const number = (
    <div style={rise(enter(beat("p6", 0.71)))}>
      <div style={{ fontSize: 230 * k, fontWeight: 900, lineHeight: 0.95, letterSpacing: -8 * k, fontVariantNumeric: "tabular-nums" }}>
        <GradientText>{Math.round(langs)}</GradientText>
      </div>
      <div style={{ fontSize: 64 * k, fontWeight: 700, color: C.muted, marginTop: 10 * k }}>ngôn ngữ</div>
    </div>
  );
  const title = (
    <div style={{ fontSize: 110 * k, fontWeight: 900, letterSpacing: -3 * k, ...rise(enter(0)) }}>
      Và <GradientText>còn nữa</GradientText>
    </div>
  );

  return (
    <AbsoluteFill style={{ fontFamily, color: C.text, opacity: exit }}>
      <Background accent={BRAND.peach} />
      {L.landscape ? (
        <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: L.pad, gap: 120 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 60 * k }}>
            {title}
            {list}
          </div>
          {number}
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ padding: `${(L.height / L.width >= 1.7 ? 180 : 70) * k}px ${L.pad}px`, gap: 70 * k }}>
          {title}
          {list}
          {number}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ---------- P7: kêu gọi ----------
export const Outro: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const pulse = 1 + Math.sin(frame / 6) * 0.03;
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text }}>
      <Background accent={BRAND.pink} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <Img src={staticFile("voicestudio/logo.png")} style={{ width: 280 * k, height: 280 * k, transform: `scale(${enter(0, 10) * pulse})` }} />
        <div style={{ display: "flex", gap: 20 * k, marginTop: 60 * k, ...rise(enter(6), 30) }}>
          <Pill k={k}>Không tài khoản</Pill>
          <Pill k={k}>Không cloud</Pill>
        </div>
        <div style={{ fontSize: 124 * k, fontWeight: 900, lineHeight: 1.08, marginTop: 70 * k, letterSpacing: -3 * k, ...rise(enter(40)) }}>
          Lưu lại
          <br />
          <GradientText>& thử ngay!</GradientText>
        </div>
        <Pill k={k} style={{ alignSelf: "center", marginTop: 70 * k, fontSize: 42 * k, fontWeight: 500, ...rise(enter(52), 30) }}>
          <svg width={48 * k} height={48 * k} viewBox="0 0 24 24" fill={C.text}>
            <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
          </svg>
          {REPO_URL}
        </Pill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
