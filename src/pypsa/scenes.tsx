import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { HEADER_H, ScreenCard, UrlBar, fitBox, type Box, type CamKey, type Size } from "../components/ScreenCard";
import { Bokeh, Stamp } from "../components/fx";
import { SplitLayout, useLayout } from "../components/layout";
import { SubscribeScene } from "../components/subscribe";
import { Background, C, CheckIcon, StarIcon, fontFamily, useExit } from "../components/ui";
import REPO_SHOT from "../../public/pypsa/repo.json";
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

const Tag: React.FC<{ k: number; p: number; children: React.ReactNode; color?: string }> = ({ k, p, children, color = BRAND.main }) => (
  <div style={{ fontSize: 40 * k, fontWeight: 700, letterSpacing: 4 * k, color, ...rise(p, 30) }}>{children}</div>
);
const Title: React.FC<{ k: number; p: number; children: React.ReactNode; size?: number }> = ({ k, p, children, size = 96 }) => (
  <div style={{ fontSize: size * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.06, marginTop: 14 * k, ...rise(p) }}>{children}</div>
);

const Icon: React.FC<{ d: string; size: number; color?: string }> = ({ d, size, color = BRAND.main }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);
const ICONS = {
  bolt: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  wind: "M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2M17.5 8a2.5 2.5 0 1 1 2 4H2",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  heat: "M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z",
  car: "M5 17h14M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0M3 17V11l2-5h14l2 5v6",
  drop: "M12 2.7l5.7 5.7a8 8 0 1 1-11.3 0z",
};

const Logo: React.FC<{ width: number }> = ({ width }) => <Img src={staticFile("pypsa/logo.png")} style={{ width, height: (width * 497) / 1600 }} />;

const DocHeader: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 700, color: C.text, whiteSpace: "nowrap" }}>
    Tài liệu PyPSA <span style={{ color: C.muted, fontWeight: 500 }}>· {title}</span>
  </div>
);

const box = (x: number, y: number, width: number, height: number): Box => ({ x, y, width, height });
const viewOf = (b: Size): Size => ({ width: b.width, height: b.height - HEADER_H });

// Ảnh gốc trong docs/assets/images (kích thước px thật).
const EUROPE = { src: "pypsa/europe.png", page: { width: 1760, height: 1540 } };
const EU_MAP = box(36, 168, 1320, 1204);
const EU_CENTRAL = box(380, 560, 640, 460);
const EU_LEGEND = box(1380, 1200, 380, 145);
const LMP = { src: "pypsa/lmp.png", page: { width: 2500, height: 1000 } };
const STACKED = { src: "pypsa/stacked.png", page: { width: 3600, height: 1800 } };
const CURTAIL = { src: "pypsa/curtail.png", page: { width: 3000, height: 1500 } };
const STORAGE = { src: "pypsa/storage.png", page: { width: 3600, height: 1800 } };

// ---------- P1: hook — lưới điện châu Âu ----------
export const Hook: React.FC = () => {
  const { k, width, pad } = useLayout();
  const enter = useEnter();
  const view = { width: width - pad * 2, height: 940 * k };
  const keys: CamKey[] = [
    { at: 0, cam: fitBox(EU_MAP, view, 0) },
    { at: 30, cam: fitBox(EU_CENTRAL, view, 0) },
  ];
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${170 * k}px ${pad}px`, gap: 40 * k }}>
        <div style={{ fontSize: 88 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.08, whiteSpace: "nowrap", ...rise(enter(0)) }}>
          Lưới điện cả châu Âu
          <br />
          <Grad>vài dòng Python?</Grad>
        </div>
        <div style={{ transform: `scale(${interpolate(enter(2, 14), [0, 1], [0.8, 1])})`, opacity: enter(2) }}>
          <ScreenCard src={EUROPE.src} page={EUROPE.page} view={view} keys={keys} accent={BRAND.main} header={<DocHeader title="256 nút" />} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P2: việc quá sức ----------
const PILE = [
  { at: 0.02, label: "Điều độ nguồn", icon: ICONS.bolt, rot: -4 },
  { at: 0.17, label: "Quy hoạch lưới", icon: ICONS.grid, rot: 3 },
  { at: 0.36, label: "Điện gió", icon: ICONS.wind, rot: -2 },
  { at: 0.5, label: "Điện mặt trời", icon: ICONS.sun, rot: 4 },
];

export const Pile: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  return (
    <Scene accent={BRAND.red}>
      <AbsoluteFill style={{ padding: `${200 * k}px ${60 * k}px`, gap: 50 * k }}>
        <Title k={k} p={enter(0)} size={100}>
          Tính tay thì <span style={{ color: "#FF6B8B" }}>quá sức</span>
        </Title>
        <div style={{ position: "relative", height: 760 * k }}>
          {PILE.map((c, i) => {
            const p = enter(beat("p2", c.at), 12);
            return (
              <div
                key={c.label}
                style={{
                  position: "absolute",
                  left: 40 * k,
                  right: 40 * k,
                  bottom: i * 165 * k,
                  display: "flex",
                  alignItems: "center",
                  gap: 30 * k,
                  padding: `${36 * k}px ${44 * k}px`,
                  borderRadius: 28 * k,
                  background: "#1A2030",
                  border: `2px solid ${BRAND.main}55`,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                  fontSize: 60 * k,
                  fontWeight: 800,
                  opacity: Math.min(1, p * 2),
                  transform: `translateY(${interpolate(p, [0, 1], [-900, 0])}px) rotate(${c.rot}deg)`,
                }}
              >
                <Icon d={c.icon} size={66 * k} />
                {c.label}
              </div>
            );
          })}
          <div style={{ position: "absolute", right: 30 * k, top: 0 }}>
            <Stamp text="QUÁ SỨC" at={beat("p2", 0.78)} color="#FF6B8B" />
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P3: giới thiệu + GitHub ----------
export const Intro: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const shot = REPO_SHOT as typeof REPO_SHOT & { star: Box };
  const stars = interpolate(frame, [beat("p3", 0.3), beat("p3", 0.6)], [0, 2.2], ease);
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: { cx: 640, cy: 330, s: view.width / 1280 } },
    { at: beat("p3", 0.25), cam: { cx: shot.star.x - 60, cy: shot.star.y + 14, s: 2.2 } },
  ];
  return (
    <Scene>
      <SplitLayout
        mediaFrac={0.34}
        head={
          <div>
            <div style={{ transform: `scale(${enter(0, 12)})`, transformOrigin: "0 50%" }}>
              <Logo width={520 * k} />
            </div>
            <div style={{ fontSize: 44 * k, fontWeight: 700, color: C.muted, marginTop: 20 * k, ...rise(enter(6)) }}>Python for Power System Analysis</div>
            <div style={{ fontSize: 52 * k, fontWeight: 800, marginTop: 22 * k, ...rise(enter(beat("p3", 0.65))) }}>
              Dẫn dắt: <Grad>ĐH Kỹ thuật Berlin</Grad>
            </div>
          </div>
        }
        media={(b) => (
          <div style={rise(enter(4), 120)}>
            <ScreenCard
              src={shot.file}
              page={{ width: 1280, height: 900 }}
              view={viewOf(b)}
              keys={keys(viewOf(b))}
              highlights={[{ box: shot.star, from: beat("p3", 0.3) }]}
              accent={BRAND.main}
              header={<UrlBar url="github.com/PyPSA/PyPSA" muted={C.muted} color={C.text} />}
            />
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 80 * k, fontWeight: 900, border: `2px solid ${BRAND.main}66`, ...rise(enter(beat("p3", 0.3))) }}>
            <StarIcon size={66 * k} color={BRAND.main} />
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{stars.toFixed(1)}K</span>
            <span style={{ fontSize: 40 * k, fontWeight: 500, color: C.muted }}>sao trên GitHub</span>
          </Pill>
        }
      />
    </Scene>
  );
};

// ---------- Khung code (đoạn mẫu trong README) ----------
type Tok = [string, string];
const KW = "#C792EA", STR = "#C3E88D", NUM = "#F78C6C", FN = "#82AAFF", TX = "#E6EDF3", CM = "#7A8599";
const CODE: Tok[][] = [
  [["import", KW], [" pypsa", TX]],
  [["n ", TX], ["=", KW], [" pypsa.", TX], ["Network", FN], ["()", TX]],
  [["n.", TX], ["add", FN], ["(", TX], ['"Bus"', STR], [", ", TX], ['"mybus"', STR], [")", TX]],
  [["n.", TX], ["add", FN], ["(", TX], ['"Load"', STR], [", ", TX], ['"myload"', STR], [", p_set", TX], ["=", KW], ["100", NUM], [")", TX]],
  [["n.", TX], ["add", FN], ["(", TX], ['"Generator"', STR], [", ", TX], ['"mygen"', STR], [",", TX]],
  [["      p_nom", TX], ["=", KW], ["100", NUM], [", marginal_cost", TX], ["=", KW], ["20", NUM], [")", TX]],
];

const CodeCard: React.FC<{ k: number; lines: Tok[][]; progress: number; width: number; title: string; fontSize?: number }> = ({ k, lines, progress, width, title, fontSize = 34 }) => {
  const total = lines.reduce((s, l) => s + l.reduce((a, t) => a + t[0].length, 0), 0);
  let budget = Math.round(total * Math.max(0, Math.min(1, progress)));
  return (
    <div style={{ width, borderRadius: 28, overflow: "hidden", background: "#0F141C", border: "2px solid rgba(255,255,255,0.12)", boxShadow: "0 40px 120px rgba(0,0,0,0.55)" }}>
      <div style={{ height: HEADER_H, display: "flex", alignItems: "center", gap: 22, padding: "0 28px", background: "#0A0E14" }}>
        <div style={{ display: "flex", gap: 12 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 20, height: 20, borderRadius: 10, background: c }} />
          ))}
        </div>
        <div style={{ fontSize: 30, fontWeight: 700, color: C.muted }}>{title}</div>
      </div>
      <div style={{ padding: `${30 * k}px ${36 * k}px`, fontFamily: "'DejaVu Sans Mono', 'Courier New', monospace", fontSize: fontSize * k, lineHeight: 1.6, minHeight: 80 * k }}>
        {lines.map((line, i) => {
          if (budget <= 0 && i > 0) return <div key={i}>&nbsp;</div>;
          return (
            <div key={i} style={{ whiteSpace: "pre" }}>
              {line.map((t, j) => {
                const take = Math.max(0, Math.min(t[0].length, budget));
                budget -= take;
                return (
                  <span key={j} style={{ color: t[1] }}>
                    {t[0].slice(0, take)}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- P4: mô tả lưới ----------
const PARTS = ["Nút", "Đường dây", "Máy phát", "Phụ tải", "Lưu trữ"];
export const Describe: React.FC = () => {
  const { k, width, pad } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const progress = interpolate(frame, [6, beat("p4", 0.9)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Scene accent={BRAND.alt}>
      <AbsoluteFill style={{ padding: `${180 * k}px ${pad}px`, gap: 40 * k }}>
        <Tag k={k} p={enter(0)}>BƯỚC 1</Tag>
        <Title k={k} p={enter(4)}>
          Mô tả <Grad>lưới điện</Grad>
        </Title>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 * k }}>
          {PARTS.map((t, i) => (
            <div key={t} style={{ padding: `${12 * k}px ${26 * k}px`, borderRadius: 999, background: `${BRAND.alt}22`, border: `2px solid ${BRAND.alt}88`, fontSize: 40 * k, fontWeight: 700, ...rise(enter(beat("p4", 0.25 + i * 0.13)), 20) }}>
              {t}
            </div>
          ))}
        </div>
        <div style={rise(enter(6), 80)}>
          <CodeCard k={k} lines={CODE} progress={progress} width={width - pad * 2} title="mô hình.py" />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P5: một lệnh tối ưu ----------
export const Optimize: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const typed = interpolate(frame, [4, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: fitBox(box(0, 0, 3600, 1800), view, 0) },
    { at: beat("p5", 0.55), cam: fitBox(box(400, 0, 2200, 1500), view, 0) },
  ];
  return (
    <Scene>
      <SplitLayout
        mediaFrac={0.34}
        head={
          <div>
            <Tag k={k} p={enter(0)}>BƯỚC 2</Tag>
            <div style={{ marginTop: 30 * k, ...rise(enter(2), 40) }}>
              <CodeCard k={k} lines={[[["n.", TX], ["optimize", FN], ["()", TX]]]} progress={typed} width={560 * k} title="một lệnh" fontSize={58} />
            </div>
            <Title k={k} p={enter(beat("p5", 0.35))} size={84}>
              Vận hành <Grad>rẻ nhất</Grad>
            </Title>
          </div>
        }
        media={(b) => (
          <div style={rise(enter(beat("p5", 0.3)), 120)}>
            <ScreenCard src={STACKED.src} page={STACKED.page} view={viewOf(b)} keys={keys(viewOf(b))} accent={BRAND.main} header={<DocHeader title="Công suất phát theo giờ" />} />
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 44 * k, ...rise(enter(beat("p5", 0.6)), 40) }}>
            <CheckIcon size={52 * k} color={BRAND.ok} />
            Vẫn đúng giới hạn lưới
          </Pill>
        }
      />
    </Scene>
  );
};

// ---------- Cảnh ảnh tài liệu: tiêu đề + ảnh + pill ----------
const DocScene: React.FC<{
  seg: string;
  tag: string;
  title: React.ReactNode;
  img: { src: string; page: Size };
  header: string;
  keys: (view: Size, b: (f: number) => number) => CamKey[];
  highlights?: (b: (f: number) => number) => { box: Box; from: number }[];
  pill: string;
  accent?: string;
  mediaFrac?: number;
}> = ({ seg, tag, title, img, header, keys, highlights, pill, accent, mediaFrac = 0.42 }) => {
  const { k } = useLayout();
  const enter = useEnter();
  const b = (f: number) => beat(seg, f);
  return (
    <Scene accent={accent}>
      <SplitLayout
        mediaFrac={mediaFrac}
        head={
          <div>
            <Tag k={k} p={enter(0)}>{tag}</Tag>
            <Title k={k} p={enter(4)} size={84}>{title}</Title>
          </div>
        }
        media={(m) => (
          <div style={rise(enter(6), 120)}>
            <ScreenCard src={img.src} page={img.page} view={viewOf(m)} keys={keys(viewOf(m), b)} highlights={highlights?.(b)} accent={BRAND.main} header={<DocHeader title={header} />} />
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 44 * k, ...rise(enter(b(0.4)), 40) }}>
            <CheckIcon size={52 * k} color={BRAND.ok} />
            {pill}
          </Pill>
        }
      />
    </Scene>
  );
};

export const PowerFlow: React.FC = () => (
  <DocScene
    seg="p6"
    tag="TRÀO LƯU CÔNG SUẤT"
    title={<>AC/DC · <Grad>N-1</Grad></>}
    img={LMP}
    header="Mang tải đường dây · Giá nút"
    keys={(v, b) => [
      { at: 0, cam: fitBox(box(0, 0, 1250, 1000), v, 0) },
      { at: b(0.55), cam: fitBox(box(1250, 0, 1250, 1000), v, 0) },
    ]}
    pill="Newton-Raphson, mạng AC và DC"
  />
);

export const Expansion: React.FC = () => (
  <DocScene
    seg="p7"
    tag="QUY HOẠCH DÀI HẠN"
    title={<>Xây thêm <Grad>bao nhiêu?</Grad></>}
    img={EUROPE}
    header="Mở rộng lưới châu Âu"
    keys={(v, b) => [
      { at: 0, cam: fitBox(box(0, 160, 1760, 1220), v, 0) },
      { at: b(0.5), cam: fitBox(box(1040, 1150, 720, 230), v, 10) },
    ]}
    highlights={(b) => [{ box: EU_LEGEND, from: b(0.62) }]}
    pill="Nguồn, lưu trữ, đường dây"
  />
);

// ---------- P8: cắt giảm gió + lưu trữ (2 biểu đồ) ----------
export const Curtail: React.FC = () => {
  const { k, width, pad } = useLayout();
  const enter = useEnter();
  const w = width - pad * 2;
  const v = { width: w, height: 400 * k };
  return (
    <Scene accent={BRAND.alt}>
      <AbsoluteFill style={{ padding: `${170 * k}px ${pad}px`, gap: 36 * k }}>
        <Tag k={k} p={enter(0)}>TỪNG GIỜ MỘT</Tag>
        <Title k={k} p={enter(4)} size={80}>
          Cắt giảm gió & <Grad>lưu trữ</Grad>
        </Title>
        <div style={rise(enter(beat("p8", 0.1)), 100)}>
          <ScreenCard src={CURTAIL.src} page={CURTAIL.page} view={v} keys={[{ at: 0, cam: fitBox(box(150, 0, 2800, 1500), v, 0) }]} accent={BRAND.main} header={<DocHeader title="Điện gió bị cắt giảm" />} />
        </div>
        <div style={rise(enter(beat("p8", 0.55)), 100)}>
          <ScreenCard src={STORAGE.src} page={STORAGE.page} view={v} keys={[{ at: 0, cam: fitBox(box(150, 0, 3300, 1800), v, 0) }]} accent={BRAND.main} header={<DocHeader title="Thuỷ điện tích năng" />} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P9: ghép ngành (giống hình logo) ----------
const NODES = [
  { label: "Nhiệt", icon: ICONS.heat, color: BRAND.red, x: 0.17, y: 0.14, at: 0.25 },
  { label: "Khí hydro", icon: ICONS.drop, color: BRAND.alt, x: 0.83, y: 0.14, at: 0.4 },
  { label: "Xe điện", icon: ICONS.car, color: BRAND.green, x: 0.5, y: 0.86, at: 0.55 },
];
export const Coupling: React.FC = () => {
  const { k, width, pad } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const W = width - pad * 2;
  const H = 860 * k;
  const cx = W / 2, cy = H * 0.4;
  const R = 112 * k;
  return (
    <Scene accent={BRAND.green}>
      <AbsoluteFill style={{ padding: `${190 * k}px ${pad}px`, gap: 40 * k }}>
        <Tag k={k} p={enter(0)}>GHÉP NGÀNH NĂNG LƯỢNG</Tag>
        <Title k={k} p={enter(4)} size={84}>
          Một mô hình,
          <br />
          <Grad>nhiều ngành</Grad>
        </Title>
        <div style={{ position: "relative", width: W, height: H }}>
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            {NODES.map((n) => {
              const p = interpolate(frame, [beat("p9", n.at), beat("p9", n.at) + 12], [0, 1], ease);
              const x2 = n.x * W, y2 = n.y * H;
              return <line key={n.label} x1={cx} y1={cy} x2={cx + (x2 - cx) * p} y2={cy + (y2 - cy) * p} stroke={n.color} strokeWidth={18 * k} strokeLinecap="round" />;
            })}
          </svg>
          {[{ label: "Điện", icon: ICONS.bolt, color: BRAND.main, x: 0.5, y: 0.4, at: 0 }, ...NODES].map((n, i) => {
            const p = enter(beat("p9", n.at), 12);
            const r = i === 0 ? R * 1.2 : R;
            return (
              <div key={n.label} style={{ position: "absolute", left: n.x * W - r, top: n.y * H - r, width: 2 * r, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${p})` }}>
                <div style={{ width: 2 * r, height: 2 * r, borderRadius: r, background: n.color, border: `${8 * k}px solid ${C.bg}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 60px ${n.color}66` }}>
                  <Icon d={n.icon} size={r * 0.9} color="#fff" />
                </div>
                <div style={{ fontSize: 44 * k, fontWeight: 800, marginTop: 10 * k, whiteSpace: "nowrap" }}>{n.label}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P10: cài đặt ----------
export const Install: React.FC = () => {
  const { k, width, pad } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const typed = interpolate(frame, [6, beat("p10", 0.35)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const done = frame >= beat("p10", 0.45);
  const lines: Tok[][] = [
    [["$ ", CM], ["pip install pypsa", TX]],
    ...(done ? ([[["✓ Successfully installed pypsa", "#4ADE80"]]] as Tok[][]) : []),
  ];
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${220 * k}px ${pad}px`, gap: 50 * k }}>
        <Tag k={k} p={enter(0)}>CÀI ĐẶT</Tag>
        <Title k={k} p={enter(4)} size={104}>
          Chỉ <Grad>một dòng lệnh</Grad>
        </Title>
        <div style={rise(enter(4), 60)}>
          <CodeCard k={k} lines={lines} progress={done ? 1 : typed * 0.5} width={width - pad * 2} title="terminal" fontSize={46} />
        </div>
        <Pill k={k} style={{ fontSize: 44 * k, ...rise(enter(beat("p10", 0.55)), 40) }}>
          <CheckIcon size={52 * k} color={BRAND.ok} />
          Kèm bộ giải miễn phí HiGHS
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P11: giấy phép ----------
export const License: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  return (
    <Scene accent={BRAND.green}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 380 * k, textAlign: "center", gap: 50 * k }}>
        <div style={{ fontSize: 240 * k, fontWeight: 900, letterSpacing: -6 * k, transform: `scale(${enter(0, 11)})` }}>
          <Grad>MIT</Grad>
        </div>
        <div style={{ fontSize: 72 * k, fontWeight: 900, lineHeight: 1.15, ...rise(enter(beat("p11", 0.35))) }}>
          Dùng được cả cho
          <br />
          dự án thương mại
        </div>
        <Pill k={k} style={{ alignSelf: "center", fontSize: 40 * k, ...rise(enter(beat("p11", 0.55)), 30) }}>
          <CheckIcon size={48 * k} color={BRAND.ok} />
          Mã nguồn mở · miễn phí
        </Pill>
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
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 380 * k, textAlign: "center" }}>
        <div style={{ transform: `scale(${enter(0, 10) * pulse})` }}>
          <Logo width={600 * k} />
        </div>
        <div style={{ fontSize: 124 * k, fontWeight: 900, lineHeight: 1.08, marginTop: 80 * k, letterSpacing: -3 * k, ...rise(enter(8)) }}>
          Lưu lại
          <br />
          <Grad>& thử ngay!</Grad>
        </div>
        <Pill k={k} style={{ alignSelf: "center", marginTop: 70 * k, fontSize: 46 * k, fontWeight: 600, ...rise(enter(18), 30) }}>
          <svg width={52 * k} height={52 * k} viewBox="0 0 24 24" fill={C.text} style={{ flexShrink: 0 }}>
            <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
          </svg>
          github.com/PyPSA/PyPSA
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P13: theo dõi + câu hỏi ----------
export const Subscribe: React.FC = () => (
  <SubscribeScene question={"Bạn đang dùng phần mềm gì\nđể tính lưới điện?"} accent={BRAND.main} btnAt={beat("p13", 0.25)} label="+ Theo dõi kênh" />
);
