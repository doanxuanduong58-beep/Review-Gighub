import { AbsoluteFill, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { HEADER_H, ScreenCard, UrlBar, fitBox, type Box, type CamKey, type Size } from "../components/ScreenCard";
import { Bokeh, GrowArrow, StepDot, Stamp } from "../components/fx";
import { SplitLayout, useLayout } from "../components/layout";
import { SubscribeScene } from "../components/subscribe";
import { Background, C, CheckIcon, StarIcon, fontFamily, useExit } from "../components/ui";
import REPO_SHOT from "../../public/opentakeoff/repo.json";
import { BRAND, BRAND_GRADIENT, beat } from "./data";

// Mọi kích thước px viết theo thiết kế gốc 1080x1920 rồi nhân `k`.
// Ảnh/clip trong public/opentakeoff lấy từ docs/img và web/public/demo của repo.

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
const Note: React.FC<{ k: number; text: string }> = ({ k, text }) => <div style={{ fontSize: 30 * k, fontWeight: 500, color: C.muted, fontStyle: "italic" }}>{text}</div>;

const Icon: React.FC<{ d: string; size: number; color?: string }> = ({ d, size, color = BRAND.main }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);
const ICONS = {
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
  ruler: "M21.3 8.7l-6-6a1 1 0 0 0-1.4 0L2.7 13.9a1 1 0 0 0 0 1.4l6 6a1 1 0 0 0 1.4 0L21.3 10.1a1 1 0 0 0 0-1.4zM7.5 10.5l2 2M10.5 7.5l2 2M13.5 4.5l2 2M4.5 13.5l2 2",
  scale: "M12 3v18M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z",
  trace: "M3 3h18v18H3zM8 8h8v8H8z",
  warn: "M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20",
};

const VideoCard: React.FC<{ src: string; width: number; height: number; k: number; title: string; rate?: number; from?: number; pos?: string }> = ({ src, width, height, k, title, rate = 1, from = 0, pos = "50% 50%" }) => {
  const { fps } = useVideoConfig();
  return (
    <div style={{ width, borderRadius: 28, overflow: "hidden", background: "#0D1117", border: "2px solid rgba(255,255,255,0.14)", boxShadow: `0 40px 120px rgba(0,0,0,0.55), 0 0 0 1px ${BRAND.main}33` }}>
      <div style={{ height: HEADER_H, display: "flex", alignItems: "center", gap: 22, padding: "0 28px", background: "#0A0E14" }}>
        <div style={{ display: "flex", gap: 12 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 20, height: 20, borderRadius: 10, background: c }} />
          ))}
        </div>
        <div style={{ fontSize: 30, fontWeight: 700, color: C.text, whiteSpace: "nowrap" }}>
          OpenTakeoff <span style={{ color: C.muted, fontWeight: 500 }}>· {title}</span>
        </div>
      </div>
      <div style={{ width, height: height - HEADER_H, overflow: "hidden" }}>
        <OffthreadVideo src={staticFile(src)} muted playbackRate={rate} startFrom={Math.round(from * fps)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos }} />
      </div>
    </div>
  );
};

// ---------- P1: hook — AI tự đo bản vẽ ----------
export const Hook: React.FC = () => {
  const { k, width, pad } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const total = interpolate(frame, [40, 95], [0, 743.64], ease);
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${150 * k}px ${pad}px`, gap: 34 * k }}>
        <div style={{ fontSize: 96 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05, ...rise(enter(0)) }}>
          AI tự <Grad>bóc khối lượng</Grad>
        </div>
        <div style={{ transform: `scale(${interpolate(enter(0, 14), [0, 1], [0.9, 1])})` }}>
          <VideoCard src="opentakeoff/agent.mp4" width={width - pad * 2} height={880 * k} k={k} title="AI chạy thật (tua nhanh)" rate={6} from={7} pos="60% 50%" />
        </div>
        <Pill k={k} style={{ fontSize: 84 * k, fontWeight: 900, border: `3px solid ${BRAND.main}88`, ...rise(enter(36), 40) }}>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{total.toFixed(2)}</span>
          <span style={{ fontSize: 44 * k, color: C.muted }}>ft² · 3 phòng</span>
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P2: đo tay mất thời gian ----------
export const Pain: React.FC = () => {
  const { k, width, pad } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const W = width - pad * 2, H = 700 * k;
  const rooms = [
    [0.08, 0.1, 0.3, 0.35],
    [0.4, 0.1, 0.25, 0.35],
    [0.7, 0.1, 0.22, 0.35],
    [0.08, 0.55, 0.45, 0.35],
    [0.6, 0.55, 0.32, 0.35],
  ];
  const hours = Math.floor(interpolate(frame, [0, beat("p2", 0.95)], [8, 17], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <Scene accent={BRAND.warn}>
      <AbsoluteFill style={{ padding: `${200 * k}px ${pad}px`, gap: 40 * k }}>
        <Title k={k} p={enter(0)} size={92}>
          Đo tay từng phòng
          <br />
          <span style={{ color: BRAND.warn }}>rất mất thời gian</span>
        </Title>
        <div style={{ position: "relative", width: W, height: H, borderRadius: 24 * k, background: "#F5F5F0", overflow: "hidden", ...rise(enter(4), 60) }}>
          {rooms.map((r, i) => {
            const done = frame >= beat("p2", 0.15 + i * 0.16);
            return <div key={i} style={{ position: "absolute", left: r[0] * W, top: r[1] * H, width: r[2] * W, height: r[3] * H, border: `${6 * k}px solid #374151`, background: done ? "rgba(98,212,220,0.35)" : "transparent" }} />;
          })}
          <div style={{ position: "absolute", left: rooms[0][0] * W, top: rooms[0][1] * H - 6 * k, width: interpolate(frame % 40, [0, 40], [0, rooms[0][2] * W]), height: 12 * k, background: BRAND.warn }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 * k, fontSize: 64 * k, fontWeight: 900, ...rise(enter(beat("p2", 0.3)), 30) }}>
          <Icon d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2" size={70 * k} color={BRAND.warn} />
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{String(hours).padStart(2, "0")}:00</span>
          <span style={{ fontSize: 40 * k, color: C.muted }}>vẫn đang đo…</span>
        </div>
        <Note k={k} text="* Hình minh hoạ" />
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P3: giới thiệu ----------
export const Intro: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const shot = REPO_SHOT as typeof REPO_SHOT & { star: Box };
  const stars = interpolate(frame, [beat("p3", 0.55), beat("p3", 0.85)], [0, 784], ease);
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
            <div style={{ display: "flex", alignItems: "center", gap: 26 * k, ...rise(enter(0)) }}>
              <Img src={staticFile("opentakeoff/star.png")} style={{ width: 150 * k, height: 150 * k }} />
              <div style={{ fontSize: 96 * k, fontWeight: 900, letterSpacing: -3 * k }}>
                Open<Grad>Takeoff</Grad>
              </div>
            </div>
            <div style={{ fontSize: 52 * k, fontWeight: 800, marginTop: 24 * k, ...rise(enter(beat("p3", 0.25))) }}>Bóc khối lượng từ bản vẽ PDF</div>
            <div style={{ fontSize: 38 * k, fontWeight: 600, color: C.muted, marginTop: 6 * k, ...rise(enter(beat("p3", 0.35))) }}>Mã nguồn mở · AGPL-3.0</div>
          </div>
        }
        media={(b) => (
          <div style={rise(enter(4), 120)}>
            <ScreenCard src={shot.file} page={{ width: 1280, height: 900 }} view={{ width: b.width, height: b.height - HEADER_H }} keys={keys({ width: b.width, height: b.height - HEADER_H })} highlights={[{ box: shot.star, from: beat("p3", 0.58) }]} accent={BRAND.main} header={<UrlBar url="github.com/Kentucky-ai/opentakeoff" muted={C.muted} color={C.text} />} />
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 80 * k, fontWeight: 900, border: `2px solid ${BRAND.main}66`, ...rise(enter(beat("p3", 0.55))) }}>
            <StarIcon size={66 * k} color={BRAND.warn} />
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(stars)}</span>
            <span style={{ fontSize: 40 * k, fontWeight: 500, color: C.muted }}>sao trên GitHub</span>
          </Pill>
        }
      />
    </Scene>
  );
};

// ---------- P4: mở → tỉ lệ → khoanh phòng (video demo gốc) ----------
const STEPS = [
  { at: 0.05, label: "Mở bản vẽ", icon: ICONS.file },
  { at: 0.35, label: "Đặt tỉ lệ", icon: ICONS.scale },
  { at: 0.65, label: "Khoanh phòng", icon: ICONS.trace },
];
export const Flow: React.FC = () => {
  const { k, width, pad } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${170 * k}px ${pad}px`, gap: 40 * k }}>
        <Tag k={k} p={enter(0)}>BA BƯỚC</Tag>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 * k }}>
          {STEPS.map((s, i) => {
            const active = frame >= beat("p4", s.at) && (i === 2 || frame < beat("p4", STEPS[i + 1].at));
            return (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10 * k }}>
                {i > 0 && <GrowArrow w={70 * k} color={BRAND.main} p={interpolate(frame, [beat("p4", s.at) - 10, beat("p4", s.at)], [0, 1], ease)} />}
                <div style={{ opacity: enter(beat("p4", s.at) - 6) }}>
                  <StepDot icon={<Icon d={s.icon} size={70 * k} color={active ? "#06231F" : BRAND.main} />} label={s.label} color={BRAND.main} active={active} size={160} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={rise(enter(4), 80)}>
          {/* demo 30s: tỉ lệ ở ~4s, khoanh phòng ở ~10s → tua 3x từ 2s */}
          <VideoCard src="opentakeoff/first.mp4" width={width - pad * 2} height={700 * k} k={k} title="Lần bóc khối lượng đầu tiên" rate={3} from={2} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P5: báo cáo + vật tư ----------
const REPORT = { width: 1400, height: 875 };
export const Report: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: fitBox({ x: 260, y: 60, width: 880, height: 180 }, view, 10) },
    { at: beat("p5", 0.55), cam: fitBox({ x: 260, y: 515, width: 880, height: 140 }, view, 10) },
  ];
  return (
    <Scene>
      <SplitLayout
        mediaFrac={0.34}
        head={
          <div>
            <Tag k={k} p={enter(0)}>TỰ TÍNH</Tag>
            <Title k={k} p={enter(4)} size={88}>
              Khối lượng
              <br />
              <Grad>+ vật tư cần mua</Grad>
            </Title>
          </div>
        }
        media={(b) => (
          <div style={rise(enter(6), 120)}>
            <ScreenCard src="opentakeoff/report.jpg" page={REPORT} view={{ width: b.width, height: b.height - HEADER_H }} keys={keys({ width: b.width, height: b.height - HEADER_H })} highlights={[{ box: { x: 270, y: 198, width: 860, height: 34 }, from: beat("p5", 0.2), to: beat("p5", 0.55) }, { box: { x: 270, y: 578, width: 860, height: 34 }, from: beat("p5", 0.65) }]} accent={BRAND.main} header={<div style={{ fontSize: 30, fontWeight: 700, color: C.text }}>OpenTakeoff <span style={{ color: C.muted, fontWeight: 500 }}>· Takeoff report</span></div>} />
          </div>
        )}
        foot={
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 * k }}>
            {["Diện tích", "Chiều dài", "Số lượng", "Vật tư"].map((t, i) => (
              <div key={t} style={{ padding: `${14 * k}px ${28 * k}px`, borderRadius: 999, background: `${BRAND.main}1F`, border: `3px solid ${BRAND.main}AA`, fontSize: 44 * k, fontWeight: 800, ...rise(enter(beat("p5", 0.1 + i * 0.12)), 20) }}>
                {t}
              </div>
            ))}
          </div>
        }
      />
    </Scene>
  );
};

// ---------- P6: 62 công cụ MCP ----------
const GROUPS = ["Mở bản vẽ", "Tỉ lệ", "Đo", "Đếm ký hiệu", "Đề xuất", "Báo giá", "Xuất file"];
export const Tools: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const n = interpolate(frame, [beat("p6", 0.5), beat("p6", 0.85)], [0, 62], ease);
  return (
    <Scene accent={BRAND.alt}>
      <AbsoluteFill style={{ padding: `${210 * k}px ${60 * k}px`, gap: 30 * k }}>
        <Tag k={k} p={enter(0)} color={BRAND.alt}>ĐIỂM ĐẶC BIỆT</Tag>
        <Title k={k} p={enter(4)} size={88}>
          AI điều khiển
          <br />
          <Grad>qua MCP</Grad>
        </Title>
        <div style={{ display: "flex", alignItems: "baseline", gap: 24 * k, marginTop: 20 * k, ...rise(enter(beat("p6", 0.45))) }}>
          <div style={{ fontSize: 260 * k, fontWeight: 900, letterSpacing: -8 * k, lineHeight: 0.95, fontVariantNumeric: "tabular-nums" }}>
            <Grad>{Math.round(n)}</Grad>
          </div>
          <div style={{ fontSize: 60 * k, fontWeight: 800 }}>công cụ</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 * k }}>
          {GROUPS.map((g, i) => (
            <div key={g} style={{ padding: `${12 * k}px ${26 * k}px`, borderRadius: 999, background: `${BRAND.alt}22`, border: `2px solid ${BRAND.alt}AA`, fontSize: 40 * k, fontWeight: 700, ...rise(enter(beat("p6", 0.55 + i * 0.05)), 20) }}>
              {g}
            </div>
          ))}
        </div>
        <div style={{ fontFamily: "'DejaVu Sans Mono', monospace", fontSize: 34 * k, color: C.muted, marginTop: 10 * k, ...rise(enter(beat("p6", 0.3)), 20) }}>$ npx -y opentakeoff-mcp</div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P7: nét chì → duyệt ----------
const PLAN = { width: 1400, height: 875 };
export const Review: React.FC = () => {
  const { k, width, pad } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const accepted = frame >= beat("p7", 0.55);
  const view = { width: width - pad * 2, height: 720 * k };
  const keys: CamKey[] = [{ at: 0, cam: fitBox({ x: 440, y: 140, width: 560, height: 260 }, view, 0) }];
  return (
    <Scene accent={BRAND.warn}>
      <AbsoluteFill style={{ padding: `${170 * k}px ${pad}px`, gap: 34 * k }}>
        <Title k={k} p={enter(0)} size={84}>
          AI <span style={{ color: BRAND.warn }}>đề xuất</span>,
          <br />
          người <Grad>duyệt</Grad>
        </Title>
        <div style={{ position: "relative", ...rise(enter(4), 60) }}>
          <ScreenCard src={accepted ? "opentakeoff/accepted.jpg" : "opentakeoff/pending.jpg"} page={PLAN} view={view} keys={keys} accent={BRAND.main} header={<div style={{ fontSize: 30, fontWeight: 700, color: C.text }}>OpenTakeoff <span style={{ color: C.muted, fontWeight: 500 }}>· {accepted ? "Đã duyệt" : "Chờ duyệt"}</span></div>} />
        </div>
        <div style={{ display: "flex", gap: 20 * k }}>
          <div style={{ flex: 1, padding: `${24 * k}px`, borderRadius: 24 * k, border: `3px dashed ${BRAND.warn}`, fontSize: 40 * k, fontWeight: 800, textAlign: "center", opacity: accepted ? 0.4 : 1 }}>Nét chì (AI)</div>
          <div style={{ flex: 1, padding: `${24 * k}px`, borderRadius: 24 * k, background: accepted ? BRAND.ok : "rgba(255,255,255,0.05)", color: accepted ? "#052E16" : C.text, fontSize: 40 * k, fontWeight: 900, textAlign: "center" }}>✓ Người duyệt</div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P8: không bịa số ----------
export const Honest: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${240 * k}px ${60 * k}px`, gap: 50 * k }}>
        <Title k={k} p={enter(0)} size={96}>
          Không chắc
          <br />
          <Grad>thì nói không chắc</Grad>
        </Title>
        <div style={{ padding: `${34 * k}px ${40 * k}px`, borderRadius: 30 * k, background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.14)", fontFamily: "'DejaVu Sans Mono', monospace", fontSize: 38 * k, lineHeight: 1.5, ...rise(enter(beat("p8", 0.2)), 40) }}>
          <div style={{ color: BRAND.warn }}>status: withheld</div>
          <div style={{ color: C.muted, fontFamily }}>Lý do: không đủ chắc chắn</div>
          <div style={{ color: C.muted, fontFamily }}>→ Trả về toạ độ để người kiểm tra</div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 * k }}>
          <div style={{ transform: "scale(1.5)" }}>
            <Stamp text="KHÔNG BỊA SỐ" at={beat("p8", 0.55)} color={BRAND.ok} />
          </div>
        </div>
        <Note k={k} text="* Minh hoạ theo nguyên tắc 'Withheld is an answer' trong README" />
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P9: xuất file ----------
const EXPORTS = [
  { ext: "PDF", label: "Bản vẽ đánh dấu", color: "#E5484D" },
  { ext: "XLSX", label: "Dự toán Excel", color: "#1F9D55" },
  { ext: "CSV", label: "Báo cáo", color: BRAND.alt },
  { ext: "DXF", label: "Bản vẽ CAD", color: BRAND.warn },
];
export const Exports: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  return (
    <Scene accent={BRAND.alt}>
      <AbsoluteFill style={{ padding: `${230 * k}px ${60 * k}px`, gap: 60 * k, alignItems: "center" }}>
        <Title k={k} p={enter(0)} size={100}>
          <div style={{ textAlign: "center" }}>
            Xuất <Grad>đủ loại file</Grad>
          </div>
        </Title>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 * k }}>
          {EXPORTS.map((e, i) => {
            const p = enter(beat("p9", 0.1 + i * 0.15), 12);
            return (
              <div key={e.ext} style={{ width: 420 * k, height: 300 * k, borderRadius: 26 * k, background: "#F5F7FB", position: "relative", boxShadow: "0 24px 60px rgba(0,0,0,0.45)", opacity: p, transform: `translateY(${interpolate(p, [0, 1], [140, Math.sin((frame + i * 20) / 18) * 6])}px)` }}>
                <div style={{ position: "absolute", left: 28 * k, top: 30 * k, padding: `${8 * k}px ${18 * k}px`, borderRadius: 10 * k, background: e.color, color: "#fff", fontSize: 44 * k, fontWeight: 900 }}>{e.ext}</div>
                {[0, 1].map((r) => (
                  <div key={r} style={{ position: "absolute", left: 28 * k, top: (130 + r * 40) * k, width: (r ? 180 : 300) * k, height: 16 * k, borderRadius: 8 * k, background: "#D9DEE8" }} />
                ))}
                <div style={{ position: "absolute", left: 28 * k, bottom: 24 * k, fontSize: 36 * k, fontWeight: 800, color: "#1F2937" }}>{e.label}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P10: lưu ý ----------
export const Notes: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const row = (ok: boolean, title: string, sub: string, p: number) => (
    <div style={{ display: "flex", alignItems: "center", gap: 28 * k, padding: `${32 * k}px ${38 * k}px`, borderRadius: 30 * k, background: ok ? "rgba(74,222,128,0.08)" : "rgba(251,191,36,0.1)", border: `3px solid ${ok ? "rgba(74,222,128,0.6)" : "rgba(251,191,36,0.6)"}`, ...rise(p, 60) }}>
      {ok ? <CheckIcon size={66 * k} color={BRAND.ok} /> : <Icon d={ICONS.warn} size={66 * k} color={BRAND.warn} />}
      <div>
        <div style={{ fontSize: 50 * k, fontWeight: 900 }}>{title}</div>
        <div style={{ fontSize: 34 * k, fontWeight: 600, color: C.muted, marginTop: 4 * k }}>{sub}</div>
      </div>
    </div>
  );
  return (
    <Scene accent={BRAND.warn}>
      <AbsoluteFill style={{ padding: `${220 * k}px ${60 * k}px`, gap: 34 * k }}>
        <Title k={k} p={enter(0)} size={100}>
          <span style={{ color: BRAND.warn }}>Lưu ý</span> nhé
        </Title>
        <div style={{ height: 10 * k }} />
        {row(true, "Có hệ mét", "Gạt ft ↔ m: m², m, m³", enter(beat("p10", 0.05)))}
        {row(false, "Giao diện tiếng Anh", "Chưa có tiếng Việt", enter(beat("p10", 0.4)))}
        {row(false, "One-Click Area tạm khoá", "Đang kiểm tra lại, vẫn khoanh tay được", enter(beat("p10", 0.65)))}
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P11: riêng tư ----------
export const Privacy: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const card = (icon: string, title: string, p: number) => (
    <div style={{ display: "flex", alignItems: "center", gap: 30 * k, padding: `${36 * k}px ${42 * k}px`, borderRadius: 30 * k, background: "rgba(255,255,255,0.05)", border: `2px solid ${BRAND.main}55`, fontSize: 58 * k, fontWeight: 900, ...rise(p, 60) }}>
      <Icon d={icon} size={76 * k} />
      {title}
    </div>
  );
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${240 * k}px ${60 * k}px`, gap: 36 * k }}>
        <Title k={k} p={enter(0)} size={96}>
          Chạy ngay trên
          <br />
          <Grad>trình duyệt</Grad>
        </Title>
        <div style={{ height: 10 * k }} />
        {card(ICONS.globe, "Không cần cài đặt", enter(beat("p11", 0.1)))}
        {card(CHECK_USER, "Không cần đăng ký", enter(beat("p11", 0.3)))}
        {card(ICONS.lock, "Bản vẽ không tải lên", enter(beat("p11", 0.6)))}
      </AbsoluteFill>
    </Scene>
  );
};
const CHECK_USER = "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17 11l2 2 4-4";

// ---------- P12: lưu lại & thử ngay ----------
export const Outro: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const pulse = 1 + Math.sin(frame / 6) * 0.03;
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 330 * k, textAlign: "center" }}>
        <Img src={staticFile("opentakeoff/star.png")} style={{ width: 240 * k, height: 240 * k, transform: `scale(${enter(0, 10) * pulse})` }} />
        <div style={{ fontSize: 124 * k, fontWeight: 900, lineHeight: 1.08, marginTop: 80 * k, letterSpacing: -3 * k, ...rise(enter(8)) }}>
          Lưu lại
          <br />
          <Grad>& thử ngay!</Grad>
        </div>
        <Pill k={k} style={{ alignSelf: "center", marginTop: 70 * k, fontSize: 40 * k, fontWeight: 600, ...rise(enter(18), 30) }}>
          <svg width={50 * k} height={50 * k} viewBox="0 0 24 24" fill={C.text} style={{ flexShrink: 0 }}>
            <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
          </svg>
          github.com/Kentucky-ai/opentakeoff
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P13: theo dõi + câu hỏi ----------
export const Subscribe: React.FC = () => (
  <SubscribeScene question={"Bạn bóc khối lượng\nbằng phần mềm gì?"} accent={BRAND.main} btnAt={beat("p13", 0.25)} label="+ Theo dõi kênh" />
);
