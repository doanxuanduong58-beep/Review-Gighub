import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { HEADER_H, ScreenCard, UrlBar, fitBox, type Box, type CamKey, type Size } from "../components/ScreenCard";
import { Bokeh, GrowArrow, Stamp, StepDot } from "../components/fx";
import { SplitLayout, useLayout } from "../components/layout";
import { Background, C, CheckIcon, fontFamily, useExit } from "../components/ui";
import SHOT from "../../public/aivideo/github.json";
import { BRAND, BRAND_GRADIENT, REPO_URL, beat } from "./data";

// Thiết kế gốc 1080x1920, mọi kích thước nhân `k`. Nhịp nhanh: phần tử vào bằng spring cứng (damping thấp),
// mốc đặt theo beat() của câu thoại để khớp lời.

const useEnter = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (delay: number, damping = 14) => spring({ frame: frame - delay, fps, config: { damping, stiffness: 220 } });
};
const rise = (p: number, px = 60) => ({ opacity: Math.min(1, p * 1.4), transform: `translateY(${interpolate(p, [0, 1], [px, 0])}px)` });
const pop = (p: number) => ({ opacity: Math.min(1, p * 2), transform: `scale(${interpolate(p, [0, 1], [0.4, 1])})` });
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const GradientText: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", ...style }}>
    {children}
  </span>
);

const Pill: React.FC<{ k: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ k, children, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 14 * k,
      padding: `${18 * k}px ${30 * k}px`,
      borderRadius: 999,
      background: "rgba(255,255,255,0.06)",
      border: "2px solid rgba(255,255,255,0.14)",
      fontSize: 44 * k,
      fontWeight: 700,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

const Label: React.FC<{ k: number; children: React.ReactNode; p: number }> = ({ k, children, p }) => (
  <div style={{ fontSize: 40 * k, fontWeight: 800, letterSpacing: 6 * k, color: BRAND.yellow, ...rise(p, 30) }}>{children}</div>
);

const Scene: React.FC<{ accent?: string; children: React.ReactNode }> = ({ accent = BRAND.orange, children }) => {
  const exit = useExit(6);
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text, opacity: exit }}>
      <Background accent={accent} />
      <Bokeh color={accent} />
      {children}
    </AbsoluteFill>
  );
};

const Waveform: React.FC<{ k: number; bars?: number; height?: number; speed?: number }> = ({ k, bars = 30, height = 220, speed = 1 }) => {
  const frame = useCurrentFrame() * speed;
  const h = height * k;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 * k, height: h, justifyContent: "center" }}>
      {Array.from({ length: bars }, (_, i) => {
        const env = Math.sin((i / (bars - 1)) * Math.PI);
        const wobble = 0.3 + 0.7 * Math.abs(Math.sin(frame / 4 + i * 0.7) * Math.cos(frame / 7 + i * 0.3));
        return <div key={i} style={{ width: 16 * k, height: Math.max(12 * k, h * env * wobble), borderRadius: 8 * k, background: BRAND_GRADIENT }} />;
      })}
    </div>
  );
};

// ---------- P1: hook ----------
export const Hook: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  // Chữ "100%" đập theo phách nhạc (140 BPM ≈ 12.86 frame/phách).
  const beatPhase = (frame % (1800 / 140)) / (1800 / 140);
  const thump = 1 + 0.05 * Math.exp(-beatPhase * 6) * Math.min(1, frame / 8);
  const items = [
    { at: 0.32, label: "Kịch bản" },
    { at: 0.5, label: "Giọng đọc" },
    { at: 0.64, label: "Nhạc nền" },
  ];
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", gap: 20 * k, paddingBottom: 220 * k }}>
        <div style={{ fontSize: 54 * k, fontWeight: 700, color: C.muted, ...rise(enter(0)) }}>Video bạn đang xem</div>
        <div style={{ fontSize: 260 * k, fontWeight: 900, lineHeight: 0.95, letterSpacing: -10 * k, opacity: Math.min(1, enter(4) * 2) }}>
          <div style={{ transform: `scale(${interpolate(enter(4, 9), [0, 1], [2.2, 1]) * thump})` }}>
            <GradientText>100%</GradientText>
          </div>
        </div>
        <div style={{ fontSize: 130 * k, fontWeight: 900, letterSpacing: -4 * k, ...rise(enter(10)) }}>AI LÀM</div>
        <div style={{ margin: `${40 * k}px 0`, opacity: enter(12) }}>
          <Waveform k={k} height={150} />
        </div>
        <div style={{ display: "flex", gap: 20 * k }}>
          {items.map((it) => (
            <Pill key={it.label} k={k} style={{ fontSize: 42 * k, ...pop(enter(beat("p1", it.at), 10)) }}>
              <CheckIcon size={46 * k} color={BRAND.yellow} />
              {it.label}
            </Pill>
          ))}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P2: repo trên GitHub ----------
const viewOf = (box: Size): Size => ({ width: box.width, height: box.height - HEADER_H });
const ROW: Box = { x: 32, y: 363, width: 904, height: 40 };
const FOLDER: Box = { x: 68, y: 370, width: 196, height: 27 };

export const Repo: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: { cx: 640, cy: 450, s: view.width / SHOT.page.width } },
    { at: beat("p2", 0.18), cam: fitBox({ x: 20, y: 140, width: 940, height: 280 }, view) },
    { at: beat("p2", 0.55), cam: fitBox({ x: 40, y: 340, width: 420, height: 90 }, view) },
  ];
  return (
    <Scene>
      <SplitLayout
        mediaFrac={0.4}
        head={
          <div>
            <Label k={k} p={enter(0)}>BÍ MẬT NẰM Ở ĐÂY</Label>
            <div style={{ fontSize: 112 * k, fontWeight: 900, letterSpacing: -4 * k, lineHeight: 1.05, marginTop: 12 * k, ...rise(enter(3)) }}>
              <GradientText>idea-to-video</GradientText>
            </div>
          </div>
        }
        media={(box) => (
          <div style={rise(enter(2), 160)}>
            <ScreenCard
              src={SHOT.file}
              page={SHOT.page}
              view={viewOf(box)}
              keys={keys(viewOf(box))}
              highlights={[
                { box: ROW, from: beat("p2", 0.3), to: beat("p2", 0.55) },
                { box: FOLDER, from: beat("p2", 0.68) },
              ]}
              accent={BRAND.yellow}
              header={<UrlBar url="github.com/…/Review-Gighub" muted={C.muted} color={C.text} from={2} />}
            />
          </div>
        )}
        foot={
          <Pill k={k} style={{ alignSelf: "flex-start", fontSize: 50 * k, ...rise(enter(beat("p2", 0.45)), 40) }}>
            <span style={{ fontSize: 50 * k }}>⚡</span>
            Skill cho <span style={{ color: BRAND.orange }}>Claude Code</span>
          </Pill>
        }
      />
    </Scene>
  );
};

// ---------- P3: chỉ cần một ý tưởng / link ----------
const PROMPT = "Làm video giới thiệu repo này, nhạc nền mạnh, nhịp nhanh";

export const Prompt: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const typed = Math.round(interpolate(frame, [6, beat("p3", 0.8)], [0, PROMPT.length], clamp));
  const caret = Math.floor(frame / 8) % 2 === 0;
  return (
    <Scene accent={BRAND.cyan}>
      <AbsoluteFill style={{ padding: `${170 * k}px ${60 * k}px`, gap: 50 * k }}>
        <div>
          <Label k={k} p={enter(0)}>BẠN CHỈ CẦN</Label>
          <div style={{ fontSize: 108 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05, marginTop: 12 * k, ...rise(enter(3)) }}>
            Một ý tưởng
            <br />
            <GradientText>hoặc một link</GradientText>
          </div>
        </div>
        <div
          style={{
            borderRadius: 40 * k,
            background: "#141A28",
            border: `2px solid ${BRAND.cyan}55`,
            boxShadow: `0 30px 80px ${BRAND.cyan}22`,
            padding: `${44 * k}px ${48 * k}px`,
            ...rise(enter(5), 120),
          }}
        >
          <div style={{ fontSize: 34 * k, fontWeight: 700, color: C.muted, marginBottom: 20 * k }}>Claude Code</div>
          <div style={{ fontSize: 58 * k, fontWeight: 700, lineHeight: 1.3, minHeight: 230 * k }}>
            {PROMPT.slice(0, typed)}
            <span style={{ opacity: caret ? 1 : 0, color: BRAND.cyan }}>▍</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 * k, marginTop: 24 * k, ...pop(enter(beat("p3", 0.55), 10)) }}>
            <div
              style={{
                fontSize: 36 * k,
                fontWeight: 700,
                padding: `${12 * k}px ${24 * k}px`,
                borderRadius: 16 * k,
                background: `${BRAND.cyan}22`,
                color: BRAND.cyan,
              }}
            >
              🔗 youtube.com/shorts/…
            </div>
          </div>
        </div>
        <div style={{ fontSize: 32 * k, color: C.muted, fontWeight: 500, opacity: enter(10) }}>* Yêu cầu thật đã tạo ra video này</div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P4: nghiên cứu → kịch bản → duyệt ----------
export const Flow: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const steps = [
    { at: 0.05, icon: "🔎", label: "Nghiên cứu" },
    { at: 0.3, icon: "📝", label: "Kịch bản" },
    { at: 0.62, icon: "👀", label: "Bạn duyệt" },
  ];
  const arrow = (from: number, to: number) => interpolate(frame, [beat("p4", from), beat("p4", to)], [0, 1], clamp);
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${170 * k}px ${60 * k}px`, gap: 90 * k }}>
        <div>
          <Label k={k} p={enter(0)}>AI TỰ LÀM</Label>
          <div style={{ fontSize: 108 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05, marginTop: 12 * k, ...rise(enter(3)) }}>
            Từ ý tưởng
            <br />
            <GradientText>tới kịch bản</GradientText>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 * k }}>
          {steps.map((s, i) => {
            const p = enter(beat("p4", s.at), 10);
            const active = frame >= beat("p4", s.at) && (i === steps.length - 1 || frame < beat("p4", steps[i + 1].at));
            return (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 * k }}>
                <div style={pop(p)}>
                  <StepDot icon={s.icon} label={s.label} color={BRAND.orange} active={active} size={190} />
                </div>
                {i < steps.length - 1 && (
                  <div style={{ marginBottom: 50 * k }}>
                    <GrowArrow w={90 * k} color={BRAND.yellow} p={arrow(steps[i].at + 0.05, steps[i + 1].at)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 * k }}>
          <div style={{ transform: `scale(${1.6 * k})` }}>
            <Stamp text="ĐÃ DUYỆT ✓" color="#4ADE80" at={beat("p4", 0.85)} rotate={-7} />
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P5: giọng đọc tiếng Việt local ----------
export const Voice: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  return (
    <Scene accent={BRAND.cyan}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", gap: 40 * k, paddingBottom: 240 * k }}>
        <Label k={k} p={enter(0)}>GIỌNG ĐỌC</Label>
        <div style={{ fontSize: 140 * k, fontWeight: 900, letterSpacing: -5 * k, lineHeight: 1, ...rise(enter(2)) }}>
          Tiếng <GradientText>Việt</GradientText>
        </div>
        <div style={{ opacity: enter(4) }}>
          <Waveform k={k} bars={34} height={280} speed={1.4} />
        </div>
        <div style={{ display: "flex", gap: 20 * k }}>
          <Pill k={k} style={pop(enter(beat("p5", 0.35), 10))}>
            💻 Chạy trên máy
          </Pill>
          <Pill k={k} style={{ border: `2px solid ${BRAND.yellow}`, color: BRAND.yellow, ...pop(enter(beat("p5", 0.7), 10)) }}>
            0đ
          </Pill>
        </div>
        <div style={{ fontSize: 36 * k, color: C.muted, fontWeight: 600, opacity: enter(beat("p5", 0.5)) }}>VieNeu-TTS · giọng Hải Đăng</div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P6: nhạc nền tự tổng hợp ----------
export const Music: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const beatLen = 1800 / 140;
  const bars = 16;
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", gap: 50 * k, paddingBottom: 240 * k }}>
        <Label k={k} p={enter(0)}>NHẠC NỀN</Label>
        <div style={{ fontSize: 110 * k, fontWeight: 900, letterSpacing: -4 * k, lineHeight: 1.05, ...rise(enter(2)) }}>
          Tự tổng hợp
          <br />
          <GradientText>bằng code</GradientText>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14 * k, height: 320 * k }}>
          {Array.from({ length: bars }, (_, i) => {
            // Cột nảy theo phách nhạc thật (140 BPM), lệch pha theo vị trí.
            const ph = ((frame + i * 3) % beatLen) / beatLen;
            const level = 0.25 + 0.75 * Math.exp(-ph * 4) * (0.6 + 0.4 * Math.abs(Math.sin(i * 1.7)));
            const grow = Math.min(1, enter(4 + i, 12));
            return (
              <div
                key={i}
                style={{ width: 40 * k, height: 320 * k * level * grow, borderRadius: 10 * k, background: i % 3 === 0 ? BRAND.yellow : BRAND_GRADIENT }}
              />
            );
          })}
        </div>
        <div style={{ transform: `scale(${1.5 * k})`, marginTop: 30 * k }}>
          <Stamp text="KHÔNG BẢN QUYỀN" color={BRAND.yellow} at={beat("p6", 0.6)} rotate={-6} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P7: 138 hiệu ứng + mọi khổ ----------
const ATLAS = { width: 1800, height: 1506 };

export const Effects: React.FC = () => {
  const { k, width } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const count = Math.round(interpolate(frame, [2, beat("p7", 0.4)], [0, 138], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) }));
  const viewW = width - 120 * k;
  const viewH = 560 * k;
  const s = (viewW / ATLAS.width) * 1.7;
  const panX = interpolate(frame, [0, beat("p7", 1)], [0, -(ATLAS.width * s - viewW)], clamp);
  const panY = interpolate(frame, [0, beat("p7", 1)], [0, -(ATLAS.height * s - viewH) * 0.6], clamp);
  const formats = [
    { r: "9:16", w: 54, h: 96, at: 0.55 },
    { r: "16:9", w: 128, h: 72, at: 0.66 },
    { r: "1:1", w: 84, h: 84, at: 0.74 },
    { r: "4:5", w: 76, h: 95, at: 0.82 },
  ];
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${150 * k}px ${60 * k}px`, gap: 36 * k }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 24 * k, ...rise(enter(0)) }}>
          <div style={{ fontSize: 230 * k, fontWeight: 900, letterSpacing: -10 * k, lineHeight: 0.9, fontVariantNumeric: "tabular-nums" }}>
            <GradientText>{count}</GradientText>
          </div>
          <div style={{ fontSize: 64 * k, fontWeight: 800, lineHeight: 1.1 }}>
            hiệu ứng
            <br />
            chuyển động
          </div>
        </div>
        <div
          style={{
            width: viewW,
            height: viewH,
            borderRadius: 32 * k,
            overflow: "hidden",
            border: "2px solid rgba(255,255,255,0.14)",
            position: "relative",
            ...rise(enter(3), 140),
          }}
        >
          <Img
            src={staticFile("aivideo/atlas-1.jpg")}
            style={{ position: "absolute", left: 0, top: 0, width: ATLAS.width * s, height: ATLAS.height * s, transform: `translate(${panX}px, ${panY}px)` }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: `0 ${10 * k}px` }}>
          {formats.map((f) => (
            <div key={f.r} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 * k, ...pop(enter(beat("p7", f.at), 10)) }}>
              <div style={{ width: f.w * 1.5 * k, height: f.h * 1.5 * k, borderRadius: 12 * k, border: `5px solid ${BRAND.yellow}`, background: `${BRAND.orange}22` }} />
              <div style={{ fontSize: 40 * k, fontWeight: 800 }}>{f.r}</div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P8: gói đăng bài ----------
const TREE = [
  { at: 0.05, depth: 0, icon: "📁", text: "release/ten-video/" },
  { at: 0.3, depth: 1, icon: "🎬", text: "video-9x16.mp4" },
  { at: 0.45, depth: 1, icon: "🖼️", text: "thumbnail-9x16.png" },
  { at: 0.62, depth: 1, icon: "📝", text: "dang-bai.md" },
  { at: 0.72, depth: 2, icon: "", text: "tiêu đề · mô tả · #hashtag" },
];

export const Release: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  return (
    <Scene accent={BRAND.cyan}>
      <AbsoluteFill style={{ padding: `${170 * k}px ${60 * k}px`, gap: 60 * k }}>
        <div>
          <Label k={k} p={enter(0)}>CUỐI CÙNG</Label>
          <div style={{ fontSize: 112 * k, fontWeight: 900, letterSpacing: -4 * k, lineHeight: 1.05, marginTop: 12 * k, ...rise(enter(3)) }}>
            Cả gói
            <br />
            <GradientText>đăng bài</GradientText>
          </div>
        </div>
        <div
          style={{
            borderRadius: 36 * k,
            background: "#0F1420",
            border: "2px solid rgba(255,255,255,0.12)",
            padding: `${44 * k}px ${44 * k}px`,
            display: "flex",
            flexDirection: "column",
            gap: 26 * k,
            fontFamily: "ui-monospace, Menlo, monospace",
            ...rise(enter(4), 120),
          }}
        >
          {TREE.map((row) => {
            const p = enter(beat("p8", row.at), 12);
            return (
              <div
                key={row.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20 * k,
                  marginLeft: row.depth * 60 * k,
                  fontSize: (row.depth === 2 ? 38 : 50) * k,
                  fontWeight: 700,
                  color: row.depth === 0 ? BRAND.yellow : row.depth === 2 ? C.muted : C.text,
                  // Font monospace hệ thống thiếu dấu tiếng Việt -> dòng chữ Việt dùng Be Vietnam Pro.
                  ...(row.depth === 2 ? { fontFamily } : {}),
                  opacity: p,
                  transform: `translateX(${interpolate(p, [0, 1], [80, 0])}px)`,
                }}
              >
                {row.depth > 0 && <span style={{ color: C.muted }}>{row.depth === 1 ? "├─" : "└"}</span>}
                {row.icon && <span>{row.icon}</span>}
                {row.text}
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
  const pulse = 1 + Math.sin(frame / 4) * 0.03;
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", gap: 60 * k, paddingBottom: 200 * k }}>
        <div style={{ fontSize: 150 * k, fontWeight: 900, lineHeight: 1.02, letterSpacing: -5 * k, transform: `scale(${interpolate(enter(0, 9), [0, 1], [1.8, 1]) * pulse})`, opacity: Math.min(1, enter(0) * 2) }}>
          Lưu lại
          <br />
          <GradientText>& thử ngay!</GradientText>
        </div>
        <Pill k={k} style={{ fontSize: 34 * k, fontWeight: 600, ...rise(enter(4), 40) }}>
          <svg width={44 * k} height={44 * k} viewBox="0 0 24 24" fill={C.text}>
            <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
          </svg>
          {REPO_URL}
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};
