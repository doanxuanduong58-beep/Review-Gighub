import { AbsoluteFill, Img, Loop, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { HEADER_H, ScreenCard, UrlBar, fitBox, type Box, type CamKey, type Size } from "../components/ScreenCard";
import { Bokeh } from "../components/fx";
import { SplitLayout, useLayout } from "../components/layout";
import { SubscribeScene } from "../components/subscribe";
import { Background, C, CheckIcon, StarIcon, fontFamily, useExit } from "../components/ui";
import REPO_SHOT from "../../public/pascal/repo.json";
import { BRAND, BRAND_GRADIENT, beat } from "./data";

// Mọi kích thước px viết theo thiết kế gốc 1080x1920 rồi nhân `k`.
// Clip *.mp4 trong public/pascal: trích từ video gốc "Pascal Next" (CC BY 4.0, Pascal Group Inc.).

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
  <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 16 * k, padding: `${18 * k}px ${32 * k}px ${18 * k}px ${22 * k}px`, borderRadius: 999, background: "rgba(255,255,255,0.05)", border: "2px solid rgba(255,255,255,0.1)", fontSize: 44 * k, fontWeight: 700, ...style }}>
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

const Tag: React.FC<{ k: number; p: number; children: React.ReactNode; color?: string }> = ({ k, p, children, color = BRAND.main }) => (
  <div style={{ fontSize: 40 * k, fontWeight: 700, letterSpacing: 4 * k, color, ...rise(p, 30) }}>{children}</div>
);
const Title: React.FC<{ k: number; p: number; children: React.ReactNode; size?: number }> = ({ k, p, children, size = 96 }) => (
  <div style={{ fontSize: size * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.08, marginTop: 14 * k, ...rise(p) }}>{children}</div>
);
const Note: React.FC<{ k: number; text: string }> = ({ k, text }) => (
  <div style={{ fontSize: 30 * k, fontWeight: 500, color: C.muted, fontStyle: "italic" }}>{text}</div>
);

const Icon: React.FC<{ d: string; size: number; color?: string }> = ({ d, size, color = BRAND.main }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);
const ICONS = {
  warn: "M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01",
  arch: "M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6",
  eng: "M2 20h20M4 20V10l4-2v12M12 20V6l4-2v16M20 20V12",
  ops: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
};

// Clip video gốc trong khung bo góc, cắt phủ (cover) theo vị trí `pos`, phóng chậm.
const Footage: React.FC<{ src: string; width: number; height: number; k: number; pos?: string; seconds?: number; preview?: boolean; zoom?: number }> = ({ src, width, height, k, pos = "50% 50%", seconds = 6, preview = true, zoom = 1.08 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const z = interpolate(frame, [0, durationInFrames], [1, zoom]);
  return (
    <div style={{ position: "relative", width, height, borderRadius: 30 * k, overflow: "hidden", border: "2px solid rgba(255,255,255,0.16)", boxShadow: "0 40px 120px rgba(0,0,0,0.55)" }}>
      <Loop durationInFrames={Math.round(seconds * fps)}>
        <OffthreadVideo src={staticFile(src)} muted style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${z})` }} />
      </Loop>
      {preview && (
        <div style={{ position: "absolute", left: 18 * k, top: 18 * k, padding: `${8 * k}px ${20 * k}px`, borderRadius: 999, background: "rgba(10,13,22,0.8)", border: `2px solid ${BRAND.warn}`, color: BRAND.warn, fontSize: 30 * k, fontWeight: 800 }}>
          Bản xem trước · Pascal Next
        </div>
      )}
      <div style={{ position: "absolute", right: 14 * k, top: 66 * k, padding: `${4 * k}px ${12 * k}px`, borderRadius: 8 * k, background: "rgba(10,13,22,0.7)", fontSize: 20 * k, color: "rgba(255,255,255,0.85)" }}>Footage: Pascal Group Inc. · CC BY 4.0</div>
    </div>
  );
};

// ---------- P1: hook ----------
const HOOK_WORDS = [
  { at: 0, t: "Lật mái" },
  { at: 0.3, t: "Xuyên tường" },
  { at: 0.55, t: "Cắt ngang" },
];
export const Hook: React.FC = () => {
  const { k, width, pad } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${150 * k}px ${pad}px`, gap: 40 * k }}>
        <div style={{ transform: `scale(${interpolate(enter(0, 14), [0, 1], [0.9, 1])})` }}>
          <Footage src="pascal/hook.mp4" width={width - pad * 2} height={1000 * k} k={k} pos="40% 50%" seconds={6} zoom={1.12} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18 * k }}>
          {HOOK_WORDS.map((w) => {
            const p = enter(beat("p1", w.at), 12);
            return (
              <div key={w.t} style={{ padding: `${16 * k}px ${30 * k}px`, borderRadius: 22 * k, background: frame >= beat("p1", w.at) ? BRAND.main : "transparent", color: "#1A0F08", fontSize: 64 * k, fontWeight: 900, opacity: p, transform: `scale(${interpolate(p, [0, 1], [1.4, 1])})` }}>
                {w.t}
              </div>
            );
          })}
        </div>
        <Title k={k} p={enter(beat("p1", 0.7))} size={76}>
          ngay trên <Grad>trình duyệt!</Grad>
        </Title>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P2: giới thiệu + GitHub ----------
export const Intro: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const shot = REPO_SHOT as typeof REPO_SHOT & { star: Box };
  const stars = interpolate(frame, [beat("p2", 0.55), beat("p2", 0.85)], [0, 25.4], ease);
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: { cx: 640, cy: 330, s: view.width / 1280 } },
    { at: beat("p2", 0.5), cam: { cx: shot.star.x - 60, cy: shot.star.y + 14, s: 2.2 } },
  ];
  return (
    <Scene>
      <SplitLayout
        mediaFrac={0.34}
        head={
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 30 * k, ...rise(enter(0)) }}>
              <Img src={staticFile("pascal/mark.png")} style={{ width: 150 * k, height: 150 * k, borderRadius: 34 * k }} />
              <div style={{ fontSize: 104 * k, fontWeight: 900, letterSpacing: -3 * k }}>
                <Grad>Pascal</Grad>
              </div>
            </div>
            <div style={{ fontSize: 52 * k, fontWeight: 800, marginTop: 28 * k, ...rise(enter(beat("p2", 0.2))) }}>Phần mềm kiến trúc 3D</div>
            <div style={{ fontSize: 38 * k, fontWeight: 600, color: C.muted, marginTop: 6 * k, ...rise(enter(beat("p2", 0.3))) }}>Mã nguồn mở · Giấy phép MIT</div>
          </div>
        }
        media={(b) => (
          <div style={rise(enter(4), 120)}>
            <ScreenCard src={shot.file} page={{ width: 1280, height: 900 }} view={{ width: b.width, height: b.height - HEADER_H }} keys={keys({ width: b.width, height: b.height - HEADER_H })} highlights={[{ box: shot.star, from: beat("p2", 0.58) }]} accent={BRAND.main} header={<UrlBar url="github.com/pascalorg/editor" muted={C.muted} color={C.text} />} />
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 80 * k, fontWeight: 900, border: `2px solid ${BRAND.main}66`, ...rise(enter(beat("p2", 0.55))) }}>
            <StarIcon size={66 * k} color={BRAND.warn} />
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{stars.toFixed(1)}K</span>
            <span style={{ fontSize: 40 * k, fontWeight: 500, color: C.muted }}>sao trên GitHub</span>
          </Pill>
        }
      />
    </Scene>
  );
};

// ---------- P3: các thành phần công trình ----------
const PARTS = ["Tường", "Sàn", "Mái", "Cửa", "Phòng", "Nội thất"];
export const Model: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: fitBox({ x: 0, y: 0, width: 1429, height: 702 }, view, 0) },
    { at: beat("p3", 0.45), cam: fitBox({ x: 480, y: 250, width: 620, height: 440 }, view, 0) },
  ];
  return (
    <Scene accent={BRAND.alt}>
      <SplitLayout
        mediaFrac={0.3}
        head={
          <div>
            <Tag k={k} p={enter(0)} color={BRAND.alt}>BẢN MÃ NGUỒN MỞ</Tag>
            <Title k={k} p={enter(4)} size={88}>
              Dựng công trình
              <br />
              <Grad>trong trình duyệt</Grad>
            </Title>
          </div>
        }
        media={(b) => (
          <div style={rise(enter(6), 120)}>
            <ScreenCard src="pascal/curtain.png" page={{ width: 1429, height: 702 }} view={{ width: b.width, height: b.height - HEADER_H }} keys={keys({ width: b.width, height: b.height - HEADER_H })} accent={BRAND.alt} header={<div style={{ fontSize: 30, fontWeight: 700, color: C.text }}>Tài liệu Pascal <span style={{ color: C.muted, fontWeight: 500 }}>· Vách kính</span></div>} />
          </div>
        )}
        foot={
          <div style={{ display: "flex", flexWrap: "wrap", gap: 18 * k }}>
            {PARTS.map((t, i) => (
              <div key={t} style={{ padding: `${14 * k}px ${30 * k}px`, borderRadius: 999, background: `${BRAND.alt}22`, border: `3px solid ${BRAND.alt}AA`, fontSize: 46 * k, fontWeight: 800, ...rise(enter(beat("p3", 0.05 + i * 0.1)), 20) }}>
                {t}
              </div>
            ))}
          </div>
        }
      />
    </Scene>
  );
};

// ---------- P4: quét hiện trạng → BIM ----------
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1) * 43758.5453;
  return x - Math.floor(x);
};
export const ScanToBim: React.FC = () => {
  const { k, width, pad } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const W = width - pad * 2, H = 820 * k;
  const build = interpolate(frame, [beat("p4", 0.45), beat("p4", 0.85)], [0, 1], ease);
  // mặt bằng chữ L đơn giản (toạ độ tương đối)
  const walls = [
    [0.15, 0.2, 0.85, 0.2],
    [0.85, 0.2, 0.85, 0.55],
    [0.85, 0.55, 0.5, 0.55],
    [0.5, 0.55, 0.5, 0.85],
    [0.5, 0.85, 0.15, 0.85],
    [0.15, 0.85, 0.15, 0.2],
  ];
  return (
    <Scene accent={BRAND.alt}>
      <AbsoluteFill style={{ padding: `${180 * k}px ${pad}px`, gap: 30 * k }}>
        <Tag k={k} p={enter(0)} color={BRAND.alt}>SCAN-TO-BIM</Tag>
        <Title k={k} p={enter(4)} size={84}>
          Quét hiện trạng
          <br />→ <Grad>mô hình BIM</Grad>
        </Title>
        <div style={{ position: "relative", width: W, height: H, borderRadius: 30 * k, background: "#0F1420", border: "2px solid rgba(255,255,255,0.12)", overflow: "hidden", ...rise(enter(6), 60) }}>
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            {Array.from({ length: 900 }, (_, i) => {
              const w = walls[i % walls.length];
              const t = rnd(i);
              const x = (w[0] + (w[2] - w[0]) * t) * W + (rnd(i + 7) - 0.5) * 22 * k;
              const y = (w[1] + (w[3] - w[1]) * t) * H + (rnd(i + 3) - 0.5) * 22 * k;
              const p = interpolate(frame, [i * 0.04, i * 0.04 + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return <circle key={i} cx={x} cy={y} r={2.6 * k} fill={BRAND.alt} opacity={p * (1 - build * 0.6)} />;
            })}
            {walls.map((w, i) => {
              const p = interpolate(build, [i / walls.length, (i + 1) / walls.length], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return <line key={i} x1={w[0] * W} y1={w[1] * H} x2={(w[0] + (w[2] - w[0]) * p) * W} y2={(w[1] + (w[3] - w[1]) * p) * H} stroke={BRAND.main} strokeWidth={22 * k} strokeLinecap="square" opacity={p > 0 ? 1 : 0} />;
            })}
          </svg>
          <div style={{ position: "absolute", left: 24 * k, top: 20 * k, fontSize: 32 * k, fontWeight: 800, color: BRAND.alt, opacity: 1 - build }}>Bản quét 3D (lớp tham chiếu)</div>
          <div style={{ position: "absolute", left: 24 * k, top: 20 * k, fontSize: 32 * k, fontWeight: 800, color: BRAND.main, opacity: build }}>Tường BIM chỉnh sửa được</div>
        </div>
        <Note k={k} text="* Sơ đồ minh hoạ" />
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P5: AI qua MCP ----------
const TOOLS = ["get_site", "create_stair  layout: 'l'", "verify_scene"];
export const Agent: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${180 * k}px ${60 * k}px`, gap: 34 * k }}>
        <Tag k={k} p={enter(0)}>ĐIỂM ĐẶC BIỆT</Tag>
        <Title k={k} p={enter(4)} size={88}>
          AI sửa mô hình
          <br />
          <Grad>qua MCP</Grad>
        </Title>
        <div style={{ display: "flex", justifyContent: "flex-end", ...rise(enter(8), 40) }}>
          <div style={{ maxWidth: "86%", padding: `${28 * k}px ${36 * k}px`, borderRadius: 36 * k, borderBottomRightRadius: 8 * k, background: BRAND.main, color: "#1A0F08", fontSize: 44 * k, fontWeight: 700 }}>Thêm cầu thang chữ L lên tầng 2</div>
        </div>
        <div style={{ padding: `${30 * k}px ${34 * k}px`, borderRadius: 30 * k, background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.14)", ...rise(enter(beat("p5", 0.2)), 40) }}>
          <div style={{ fontSize: 32 * k, fontWeight: 800, color: BRAND.main, marginBottom: 14 * k }}>Claude · gọi công cụ Pascal</div>
          {TOOLS.map((t, i) => {
            const on = frame >= beat("p5", 0.3 + i * 0.18);
            const done = frame >= beat("p5", 0.42 + i * 0.18);
            return (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 18 * k, padding: `${14 * k}px 0`, opacity: on ? 1 : 0.2, fontFamily: "'DejaVu Sans Mono', monospace", fontSize: 36 * k }}>
                <div style={{ width: 40 * k, height: 40 * k, borderRadius: 20 * k, background: done ? BRAND.ok : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>{done && <CheckIcon size={28 * k} color="#052E16" />}</div>
                {t}
              </div>
            );
          })}
        </div>
        <Note k={k} text="* Ví dụ minh hoạ · tên công cụ lấy từ CHANGELOG của repo" />
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P6: chạy trên máy ----------
export const Local: React.FC = () => {
  const { k, width, pad } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const cmd = "npx @pascal-app/cli editor";
  const typed = cmd.slice(0, Math.round(interpolate(frame, [6, beat("p6", 0.45)], [0, cmd.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const done = frame > beat("p6", 0.5);
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${230 * k}px ${pad}px`, gap: 50 * k }}>
        <Title k={k} p={enter(0)} size={96}>
          Chạy trên máy
          <br />
          <Grad>một dòng lệnh</Grad>
        </Title>
        <div style={{ width: width - pad * 2, borderRadius: 28, overflow: "hidden", background: "#0F141C", border: "2px solid rgba(255,255,255,0.12)", ...rise(enter(4), 60) }}>
          <div style={{ height: HEADER_H, display: "flex", alignItems: "center", gap: 12, padding: "0 28px", background: "#0A0E14" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <div key={c} style={{ width: 20, height: 20, borderRadius: 10, background: c }} />
            ))}
            <div style={{ fontSize: 30, fontWeight: 700, color: C.muted, marginLeft: 10 }}>terminal</div>
          </div>
          <div style={{ padding: `${30 * k}px ${36 * k}px`, fontFamily: "'DejaVu Sans Mono', monospace", fontSize: 42 * k, color: "#E6EDF3", lineHeight: 1.6 }}>
            <span style={{ color: "#7A8599" }}>$ </span>
            {typed}
            <div style={{ color: BRAND.ok, opacity: done ? 1 : 0 }}>✓ Editor + MCP đang chạy</div>
            <div style={{ color: "#7A8599", opacity: done ? 1 : 0, fontSize: 34 * k }}>~/.pascal/data/pascal.db</div>
          </div>
        </div>
        <Pill k={k} style={{ fontSize: 46 * k, ...rise(enter(beat("p6", 0.6)), 40) }}>
          <CheckIcon size={52 * k} color={BRAND.ok} />
          Dữ liệu nằm trên máy bạn
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P7–P9: bản xem trước Pascal Next ----------
const NextScene: React.FC<{ seg: string; tag: string; title: React.ReactNode; src: string; pos?: string }> = ({ seg, tag, title, src, pos }) => {
  const { k, width, pad } = useLayout();
  const enter = useEnter();
  return (
    <Scene accent={BRAND.warn}>
      <AbsoluteFill style={{ padding: `${170 * k}px ${pad}px`, gap: 34 * k }}>
        <Tag k={k} p={enter(0)} color={BRAND.warn}>{tag}</Tag>
        <Title k={k} p={enter(4)} size={88}>{title}</Title>
        <div style={{ transform: `scale(${interpolate(enter(beat(seg, 0.05), 14), [0, 1], [0.92, 1])})`, opacity: enter(beat(seg, 0.05)) }}>
          <Footage src={src} width={width - pad * 2} height={1020 * k} k={k} pos={pos} seconds={7} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

export const NextHouse: React.FC = () => (
  <NextScene seg="p7" tag="THẾ HỆ TIẾP THEO" title={<>Ngôi nhà thật <Grad>dựng lại</Grad></>} src="pascal/house.mp4" pos="50% 50%" />
);
export const NextCut: React.FC = () => <NextScene seg="p8" tag="CẮT NGANG" title={<>Kết cấu mái<br /><Grad>& bên trong</Grad></>} src="pascal/cut.mp4" pos="45% 50%" />;
export const NextXray: React.FC = () => <NextScene seg="p9" tag="SOI XUYÊN TƯỜNG" title={<>Hệ thống <Grad>kỹ thuật</Grad></>} src="pascal/xray.mp4" pos="55% 50%" />;

// ---------- P10: lưu ý ----------
export const Caveat: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const row = (ok: boolean, title: string, sub: string, p: number) => (
    <div style={{ display: "flex", alignItems: "center", gap: 28 * k, padding: `${34 * k}px ${40 * k}px`, borderRadius: 30 * k, background: ok ? "rgba(74,222,128,0.08)" : "rgba(251,191,36,0.1)", border: `3px solid ${ok ? "rgba(74,222,128,0.6)" : "rgba(251,191,36,0.6)"}`, ...rise(p, 60) }}>
      {ok ? <CheckIcon size={70 * k} color={BRAND.ok} /> : <Icon d={ICONS.warn} size={70 * k} color={BRAND.warn} />}
      <div>
        <div style={{ fontSize: 52 * k, fontWeight: 900 }}>{title}</div>
        <div style={{ fontSize: 32 * k, fontWeight: 600, color: C.muted, marginTop: 4 * k, whiteSpace: "nowrap" }}>{sub}</div>
      </div>
    </div>
  );
  return (
    <Scene accent={BRAND.warn}>
      <AbsoluteFill style={{ padding: `${230 * k}px ${60 * k}px`, gap: 40 * k }}>
        <Title k={k} p={enter(0)} size={100}>
          <span style={{ color: BRAND.warn }}>Lưu ý</span> nhé
        </Title>
        <div style={{ height: 10 * k }} />
        {row(true, "Bản mã nguồn mở", "Dùng được ngay · MIT", enter(beat("p10", 0.15)))}
        {row(false, "Pascal Next", "Bản xem trước, chưa có trong mã nguồn mở", enter(beat("p10", 0.4)))}
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P11: dành cho ai ----------
const WHO = [
  { label: "Kiến trúc sư", icon: ICONS.arch },
  { label: "Kỹ sư", icon: ICONS.eng },
  { label: "Quản lý toà nhà", icon: ICONS.ops },
];
export const Who: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${230 * k}px ${60 * k}px`, gap: 34 * k }}>
        <div style={{ fontSize: 200 * k, fontWeight: 900, letterSpacing: -6 * k, lineHeight: 1, ...rise(enter(0)) }}>
          <Grad>MIT</Grad>
        </div>
        <div style={{ fontSize: 56 * k, fontWeight: 800, ...rise(enter(6)) }}>Mã nguồn mở, hợp cho:</div>
        {WHO.map((w, i) => (
          <div key={w.label} style={{ display: "flex", alignItems: "center", gap: 30 * k, padding: `${30 * k}px ${40 * k}px`, borderRadius: 30 * k, background: "rgba(255,255,255,0.05)", border: `2px solid ${BRAND.main}55`, fontSize: 58 * k, fontWeight: 800, ...rise(enter(beat("p11", 0.35 + i * 0.15)), 50) }}>
            <Icon d={w.icon} size={70 * k} />
            {w.label}
          </div>
        ))}
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
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 330 * k, textAlign: "center" }}>
        <Img src={staticFile("pascal/mark.png")} style={{ width: 240 * k, height: 240 * k, borderRadius: 56 * k, transform: `scale(${enter(0, 10) * pulse})` }} />
        <div style={{ fontSize: 124 * k, fontWeight: 900, lineHeight: 1.08, marginTop: 80 * k, letterSpacing: -3 * k, ...rise(enter(8)) }}>
          Lưu lại
          <br />
          <Grad>& thử ngay!</Grad>
        </div>
        <Pill k={k} style={{ alignSelf: "center", marginTop: 70 * k, fontSize: 46 * k, fontWeight: 600, ...rise(enter(18), 30) }}>
          <svg width={52 * k} height={52 * k} viewBox="0 0 24 24" fill={C.text} style={{ flexShrink: 0 }}>
            <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
          </svg>
          github.com/pascalorg/editor
        </Pill>
        <div style={{ marginTop: 50 * k, fontSize: 26 * k, color: C.muted, lineHeight: 1.5, ...rise(enter(24), 20) }}>
          Footage: Pascal Group Inc. — Pascal Next · CC BY 4.0
          <br />
          Đã cắt ghép, thêm lời đọc và phụ đề
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P13: theo dõi + câu hỏi ----------
export const Subscribe: React.FC = () => (
  <SubscribeScene question={"Bạn dùng Revit, SketchUp\nhay phần mềm nào?"} accent={BRAND.main} btnAt={beat("p13", 0.25)} label="+ Theo dõi kênh" />
);
