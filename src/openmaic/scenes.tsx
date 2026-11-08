import { AbsoluteFill, Img, Loop, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { HEADER_H, ScreenCard, UrlBar, type Box, type CamKey, type Size } from "../components/ScreenCard";
import { Bokeh, GrowArrow, StepDot } from "../components/fx";
import { SplitLayout, useLayout } from "../components/layout";
import { SubscribeScene } from "../components/subscribe";
import { Background, C, CheckIcon, StarIcon, fontFamily, useExit } from "../components/ui";
import REPO_SHOT from "../../public/openmaic/repo.json";
import { BRAND, BRAND_GRADIENT, beat } from "./data";

// Mọi kích thước px viết theo thiết kế gốc 1080x1920 rồi nhân `k`.

const useEnter = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (delay: number, damping = 200) => spring({ frame: frame - delay, fps, config: { damping } });
};
const rise = (p: number, px = 50) => ({ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [px, 0])}px)` });
const ease = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t: number) => 1 - Math.pow(1 - t, 3) } as const;

const Grad: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{children}</span>
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

const Scene: React.FC<{ accent?: string; children: React.ReactNode }> = ({ accent = BRAND.main, children }) => {
  const exit = useExit();
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text, opacity: exit }}>
      <Background accent={accent} />
      <Bokeh color={accent} count={10} />
      {children}
    </AbsoluteFill>
  );
};

const Icon: React.FC<{ d: string; size: number; color?: string }> = ({ d, size, color = BRAND.main }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);
const ICONS = {
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  slides: "M2 3h20v14H2zM8 21h8M12 17v4",
  topic: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01",
  key: "M21 2l-2 2m-7.6 7.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8zM15.5 7.5l3 3L22 7l-3-3",
};

const Logo: React.FC<{ width: number }> = ({ width }) => (
  <div style={{ background: "#fff", borderRadius: width * 0.06, padding: `${width * 0.045}px ${width * 0.06}px`, display: "inline-flex" }}>
    <Img src={staticFile("openmaic/logo-horizontal.png")} style={{ width, height: (width * 269) / 1232 }} />
  </div>
);

// ---------- Khung chứa clip giao diện thật (ảnh động gốc trong assets/ của repo, đã chuyển MP4) ----------
type Clip = { src: string; w: number; h: number; seconds: number; from: number; cx: number; cy: number; s: number; title: string };

const VideoCard: React.FC<{ clip: Clip; width: number; height: number; zoomTo?: number }> = ({ clip, width, height, zoomTo = 1.06 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const viewH = height - HEADER_H;
  // Phóng chậm dần (Ken Burns) cho đỡ tĩnh.
  const z = interpolate(frame, [0, durationInFrames], [1, zoomTo]);
  const vw = width * clip.s * z;
  const vh = (vw * clip.h) / clip.w;
  const left = Math.min(0, Math.max(width - vw, width / 2 - clip.cx * vw));
  const top = Math.min(0, Math.max(viewH - vh, viewH / 2 - clip.cy * vh));
  return (
    <div style={{ width, borderRadius: 28, overflow: "hidden", background: "#F7F8FB", border: "2px solid rgba(255,255,255,0.14)", boxShadow: `0 40px 120px rgba(0,0,0,0.55), 0 0 0 1px ${BRAND.main}33` }}>
      <div style={{ height: HEADER_H, display: "flex", alignItems: "center", gap: 22, padding: "0 28px", background: "#0D1117" }}>
        <div style={{ display: "flex", gap: 12 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 20, height: 20, borderRadius: 10, background: c }} />
          ))}
        </div>
        <div style={{ fontSize: 30, fontWeight: 700, color: C.text, whiteSpace: "nowrap" }}>
          OpenMAIC <span style={{ color: C.muted, fontWeight: 500 }}>· {clip.title}</span>
        </div>
      </div>
      <div style={{ position: "relative", width, height: viewH, overflow: "hidden" }}>
        <Loop durationInFrames={Math.round((clip.seconds - clip.from) * fps)}>
          <OffthreadVideo src={staticFile(clip.src)} muted startFrom={Math.round(clip.from * fps)} style={{ position: "absolute", left, top, width: vw, height: vh }} />
        </Loop>
      </div>
    </div>
  );
};

export const CLIPS = {
  python: { src: "openmaic/python.mp4", w: 1910, h: 1086, seconds: 56.5, from: 0.2, cx: 0.36, cy: 0.36, s: 1.55, title: "Python từ số 0" },
  discussion: { src: "openmaic/discussion.mp4", w: 1908, h: 1086, seconds: 32.3, from: 17, cx: 0.55, cy: 0.56, s: 1.15, title: "Thảo luận" },
  slides: { src: "openmaic/slides.mp4", w: 1878, h: 1104, seconds: 7.1, from: 0, cx: 0.38, cy: 0.4, s: 1.35, title: "Bài giảng" },
  quiz: { src: "openmaic/quiz.mp4", w: 1878, h: 1104, seconds: 7.9, from: 4.2, cx: 0.45, cy: 0.42, s: 1.3, title: "Bài kiểm tra" },
  sim: { src: "openmaic/simulation_interactive.mp4", w: 1820, h: 852, seconds: 14, from: 3, cx: 0.42, cy: 0.42, s: 1.15, title: "Mô phỏng" },
  teacher: { src: "openmaic/teacher_action_interative.mp4", w: 1660, h: 938, seconds: 26.8, from: 9, cx: 0.48, cy: 0.42, s: 1.25, title: "Thầy AI dẫn dắt" },
  pbl: { src: "openmaic/pbl.mp4", w: 1906, h: 1088, seconds: 14.1, from: 0, cx: 0.42, cy: 0.38, s: 1.35, title: "Học qua dự án" },
} satisfies Record<string, Clip>;

// ---------- P1: hook — gõ một dòng là có lớp học ----------
const PROMPT = "Dạy tôi Python từ số 0 trong 30 phút";

export const Hook: React.FC = () => {
  const { k, width, pad } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  // Gõ nhanh trong ~1 giây đầu, "Enter" lúc ~1.2s, lớp học bật ra ngay sau.
  const typed = PROMPT.slice(0, Math.round(interpolate(frame, [2, 30], [0, PROMPT.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const sent = frame >= 34;
  const open = enter(36, 14);
  const cardW = width - pad * 2;
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${170 * k}px ${pad}px`, gap: 40 * k }}>
        <div style={{ fontSize: 96 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05, ...rise(enter(0)) }}>
          Gõ một dòng…
          <br />
          <Grad>có cả lớp học!</Grad>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20 * k,
            padding: `${30 * k}px ${34 * k}px`,
            borderRadius: 30 * k,
            background: "rgba(255,255,255,0.06)",
            border: `3px solid ${sent ? BRAND.main : "rgba(255,255,255,0.18)"}`,
            fontSize: 46 * k,
            fontWeight: 700,
            boxShadow: sent ? `0 0 60px ${BRAND.main}66` : "none",
          }}
        >
          <Icon d={ICONS.topic} size={54 * k} />
          <span style={{ flex: 1 }}>
            {typed}
            {!sent && frame % 16 < 9 && <span style={{ color: BRAND.main }}>▍</span>}
          </span>
          <div style={{ width: 76 * k, height: 76 * k, borderRadius: 38 * k, background: BRAND.main, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sent ? 1 - Math.max(0, 6 - (frame - 34)) * 0.04 : 1})` }}>
            <svg width={40 * k} height={40 * k} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
        </div>
        <div style={{ opacity: open, transform: `translateY(${interpolate(open, [0, 1], [120, 0])}px) scale(${interpolate(open, [0, 1], [0.85, 1])})`, transformOrigin: "50% 0" }}>
          <VideoCard clip={CLIPS.python} width={cardW} height={760 * k} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- Cảnh "tính năng": tiêu đề + clip thật + pill ----------
export const ClipScene: React.FC<{ tag: string; title: React.ReactNode; clip: Clip; pill: string; seg: string; accent?: string; extra?: React.ReactNode }> = ({ tag, title, clip, pill, seg, accent, extra }) => {
  const { k } = useLayout();
  const enter = useEnter();
  return (
    <Scene accent={accent}>
      <SplitLayout
        mediaFrac={0.4}
        head={
          <div>
            <div style={{ fontSize: 40 * k, fontWeight: 700, letterSpacing: 4 * k, color: BRAND.main, ...rise(enter(0), 30) }}>{tag}</div>
            <div style={{ fontSize: 96 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05, marginTop: 14 * k, ...rise(enter(4)) }}>{title}</div>
            {extra}
          </div>
        }
        media={(b) => (
          <div style={rise(enter(6), 120)}>
            <VideoCard clip={clip} width={b.width} height={b.height} />
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 46 * k, ...rise(enter(beat(seg, 0.4)), 40) }}>
            <CheckIcon size={54 * k} color={BRAND.ok} />
            {pill}
          </Pill>
        }
      />
    </Scene>
  );
};

// ---------- P3: giới thiệu + trang GitHub ----------
export const Intro: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const shot = REPO_SHOT as typeof REPO_SHOT & { star: Box };
  // About ghi "43.0k stars"; đếm 0 → 43.0.
  const stars = interpolate(frame, [beat("p3", 0.6), beat("p3", 0.88)], [0, 43.0], ease);
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: { cx: 640, cy: 330, s: view.width / 1280 } },
    { at: beat("p3", 0.5), cam: { cx: shot.star.x - 60, cy: shot.star.y + 14, s: 2.2 } },
  ];
  return (
    <Scene>
      <SplitLayout
        mediaFrac={0.34}
        head={
          <div>
            <div style={{ transform: `scale(${enter(0, 12)})`, transformOrigin: "0 50%" }}>
              <Logo width={560 * k} />
            </div>
            <div style={{ fontSize: 50 * k, fontWeight: 800, marginTop: 30 * k, lineHeight: 1.25, ...rise(enter(beat("p3", 0.2))) }}>
              Nhóm nghiên cứu <Grad>Đại học Thanh Hoa</Grad>
            </div>
            <div style={{ fontSize: 36 * k, fontWeight: 500, color: C.muted, marginTop: 8 * k, ...rise(enter(beat("p3", 0.25))) }}>Mã nguồn mở · Giấy phép MIT</div>
          </div>
        }
        media={(b) => (
          <div style={rise(enter(4), 120)}>
            <ScreenCard
              src={shot.file}
              page={{ width: 1280, height: 900 }}
              view={{ width: b.width, height: b.height - HEADER_H }}
              keys={keys({ width: b.width, height: b.height - HEADER_H })}
              highlights={[{ box: shot.star, from: beat("p3", 0.58) }]}
              accent={BRAND.main}
              header={<UrlBar url="github.com/THU-MAIC/OpenMAIC" muted={C.muted} color={C.text} />}
            />
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 80 * k, fontWeight: 900, border: `2px solid ${BRAND.main}66`, ...rise(enter(beat("p3", 0.6))) }}>
            <StarIcon size={66 * k} color={BRAND.warn} />
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{stars.toFixed(1)}K</span>
            <span style={{ fontSize: 40 * k, fontWeight: 500, color: C.muted }}>sao trên GitHub</span>
          </Pill>
        }
      />
    </Scene>
  );
};

// ---------- P4: đầu vào ----------
const INPUTS = [
  { at: 0.05, label: "Chủ đề", color: BRAND.main, icon: ICONS.topic },
  { at: 0.45, label: "PDF", color: "#F87171", icon: ICONS.file },
  { at: 0.58, label: "Word", color: "#60A5FA", icon: ICONS.file },
  { at: 0.7, label: "PowerPoint", color: "#FB923C", icon: ICONS.file },
];

export const Inputs: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${200 * k}px ${60 * k}px`, gap: 40 * k }}>
        <div style={{ fontSize: 100 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05, ...rise(enter(0)) }}>
          Bạn đưa vào
          <br />
          <Grad>gì cũng được</Grad>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 * k, marginTop: 30 * k }}>
          {INPUTS.map((it, i) => {
            const p = enter(beat("p4", it.at), 14);
            return (
              <div
                key={it.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 30 * k,
                  padding: `${34 * k}px ${40 * k}px`,
                  borderRadius: 30 * k,
                  background: "rgba(255,255,255,0.05)",
                  border: `3px solid ${it.color}88`,
                  fontSize: 62 * k,
                  fontWeight: 800,
                  opacity: p,
                  transform: `translateX(${interpolate(p, [0, 1], [i % 2 ? 300 : -300, 0])}px)`,
                }}
              >
                <div style={{ width: 100 * k, height: 100 * k, borderRadius: 24 * k, background: `${it.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon d={it.icon} size={60 * k} color={it.color} />
                </div>
                {it.label}
                {i === 0 && <span style={{ fontSize: 40 * k, color: C.muted, fontWeight: 600 }}>hoặc tài liệu:</span>}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P5: dàn ý → bài giảng ----------
export const Outline: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const arrow = interpolate(frame, [beat("p5", 0.35), beat("p5", 0.5)], [0, 1], ease);
  return (
    <Scene>
      <SplitLayout
        mediaFrac={0.38}
        head={
          <div>
            <div style={{ fontSize: 40 * k, fontWeight: 700, letterSpacing: 4 * k, color: BRAND.main, ...rise(enter(0), 30) }}>AI TỰ LÀM HẾT</div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 * k, marginTop: 40 * k }}>
              <div style={{ opacity: enter(4) }}>
                <StepDot icon={<Icon d={ICONS.list} size={80 * k} color={frame < beat("p5", 0.45) ? "#0A0D16" : BRAND.main} />} label="Dàn ý" color={BRAND.main} active={frame < beat("p5", 0.45)} size={180} />
              </div>
              <GrowArrow w={200 * k} color={BRAND.main} p={arrow} />
              <div style={{ opacity: enter(beat("p5", 0.45)) }}>
                <StepDot icon={<Icon d={ICONS.slides} size={80 * k} color={frame >= beat("p5", 0.45) ? "#0A0D16" : BRAND.main} />} label="Bài giảng + giọng đọc" color={BRAND.alt} active={frame >= beat("p5", 0.45)} size={180} />
              </div>
            </div>
          </div>
        }
        media={(b) => (
          <div style={rise(enter(beat("p5", 0.4)), 120)}>
            <VideoCard clip={CLIPS.slides} width={b.width} height={b.height} />
          </div>
        )}
      />
    </Scene>
  );
};

// ---------- P10: xuất PowerPoint ----------
export const Export: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const file = (ext: string, color: string, delay: number, label: string) => {
    const p = enter(delay, 12);
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 * k, opacity: p, transform: `translateY(${interpolate(p, [0, 1], [200, 0])}px)` }}>
        <div style={{ position: "relative", width: 280 * k, height: 350 * k, borderRadius: 26 * k, background: "#F5F7FB", boxShadow: `0 30px 80px ${color}55` }}>
          <div style={{ position: "absolute", right: 0, top: 0, width: 80 * k, height: 80 * k, background: `linear-gradient(225deg, ${C.bg} 50%, #D9DEE8 50%)`, borderTopRightRadius: 26 * k }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 50 * k, textAlign: "center" }}>
            <span style={{ padding: `${10 * k}px ${24 * k}px`, borderRadius: 14 * k, background: color, color: "#fff", fontSize: 56 * k, fontWeight: 900 }}>{ext}</span>
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ position: "absolute", left: 40 * k, top: (70 + i * 44) * k, width: (i === 2 ? 120 : 180) * k, height: 18 * k, borderRadius: 9 * k, background: "#D9DEE8" }} />
          ))}
        </div>
        <div style={{ fontSize: 40 * k, fontWeight: 700, color: C.muted }}>{label}</div>
      </div>
    );
  };
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${220 * k}px ${60 * k}px`, gap: 90 * k, alignItems: "center" }}>
        <div style={{ fontSize: 40 * k, fontWeight: 700, letterSpacing: 4 * k, color: BRAND.main, ...rise(enter(0), 30) }}>DÀNH CHO GIÁO VIÊN</div>
        <div style={{ fontSize: 100 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05, textAlign: "center", marginTop: -50 * k, ...rise(enter(4)) }}>
          Xuất bài ra
          <br />
          <Grad>PowerPoint</Grad>
        </div>
        <div style={{ display: "flex", gap: 70 * k }}>
          {file(".pptx", "#E2572C", beat("p10", 0.3), "Dạy trên lớp")}
          {file(".html", BRAND.main, beat("p10", 0.5), "Xem offline")}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P11: chi phí ----------
export const Cost: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const card = (icon: string, color: string, title: string, sub: string, delay: number) => {
    const p = enter(delay, 14);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 34 * k, padding: `${44 * k}px ${44 * k}px`, borderRadius: 34 * k, background: `${color}14`, border: `3px solid ${color}88`, ...rise(p, 80) }}>
        <div style={{ width: 120 * k, height: 120 * k, borderRadius: 60 * k, background: `${color}26`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon d={icon} size={70 * k} color={color} />
        </div>
        <div>
          <div style={{ fontSize: 64 * k, fontWeight: 900 }}>{title}</div>
          <div style={{ fontSize: 40 * k, fontWeight: 600, color: C.muted, marginTop: 6 * k }}>{sub}</div>
        </div>
      </div>
    );
  };
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${220 * k}px ${60 * k}px`, gap: 50 * k }}>
        <div style={{ fontSize: 100 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05, ...rise(enter(0)) }}>
          Nói thật về
          <br />
          <Grad>chi phí</Grad>
        </div>
        {card("M20 6L9 17l-5-5", BRAND.ok, "Mã nguồn: miễn phí", "Giấy phép MIT", beat("p11", 0.05))}
        {card(ICONS.key, BRAND.warn, "Tự cài: cần khoá AI", "OpenAI, DeepSeek… có thể tốn phí", beat("p11", 0.45))}
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P12: lưu lại & thử ngay ----------
export const Outro: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const pulse = 1 + Math.sin(frame / 6) * 0.03;
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 360 * k, textAlign: "center" }}>
        <div style={{ transform: `scale(${enter(0, 10) * pulse})` }}>
          <Logo width={620 * k} />
        </div>
        <div style={{ fontSize: 124 * k, fontWeight: 900, lineHeight: 1.08, marginTop: 80 * k, letterSpacing: -3 * k, ...rise(enter(8)) }}>
          Lưu lại
          <br />
          <Grad>& thử ngay!</Grad>
        </div>
        <Pill k={k} style={{ alignSelf: "center", marginTop: 70 * k, fontSize: 44 * k, fontWeight: 600, ...rise(enter(18), 30) }}>
          <svg width={52 * k} height={52 * k} viewBox="0 0 24 24" fill={C.text} style={{ flexShrink: 0 }}>
            <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
          </svg>
          github.com/THU-MAIC/OpenMAIC
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P13: theo dõi + câu hỏi ----------
export const Subscribe: React.FC = () => (
  <SubscribeScene question={"Bạn muốn AI dạy mình\nmôn gì đầu tiên?"} accent={BRAND.main} btnAt={beat("p13", 0.25)} label="+ Theo dõi kênh" />
);
