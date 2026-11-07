import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { HEADER_H, ScreenCard, UrlBar, fitBox, parseStarLabel, type Box, type CamKey, type Highlight, type Size } from "../components/ScreenCard";
import { SplitLayout, useLayout } from "../components/layout";
import { Bokeh, GrowArrow, StepDot } from "../components/fx";
import { Background, C, CheckIcon, StarIcon, fontFamily, useExit } from "../components/ui";
import REPO_SHOT from "../../public/excelmcp/repo.json";
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

// Logo chính thức của Excel MCP Server (icon.png trong repo).
const DocIcon: React.FC<{ size: number }> = ({ size }) => (
  <Img src={staticFile("excelmcp/icon.png")} style={{ width: size, height: size, borderRadius: size * 0.22 }} />
);

const Scene: React.FC<{ children: React.ReactNode; accent?: string }> = ({ children, accent = BRAND.green }) => {
  const exit = useExit();
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text, opacity: exit }}>
      <Background accent={accent} />
      <Bokeh color={accent} count={10} />
      {children}
    </AbsoluteFill>
  );
};

const viewOf = (box: Size): Size => ({ width: box.width, height: box.height - HEADER_H });
const box = (x: number, y: number, width: number, height: number): Box => ({ x, y, width, height });

const PAGE = { width: 1280, height: 900 }; // ảnh chụp @2x, toạ độ theo CSS px

const WindowTitle: React.FC<{ title: string; sub: string }> = ({ title, sub }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, fontWeight: 700, color: C.text, whiteSpace: "nowrap" }}>
    <DocIcon size={40} />
    {title}
    <span style={{ color: C.muted, fontWeight: 500 }}>· {sub}</span>
  </div>
);

// ---------- P1: câu mở đầu ----------
export const Hook: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const line = { fontSize: 120 * k, fontWeight: 900, lineHeight: 1.05, letterSpacing: -3 * k };
  const view = { width: 960, height: 600 };
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", padding: `${190 * k}px 60px`, textAlign: "center", gap: 18 * k }}>
        <div style={{ ...line, ...rise(enter(0)) }}>AI làm Excel</div>
        <div style={{ ...line, fontSize: 104 * k, ...rise(enter(8)) }}>
          <GradientText>giúp bạn</GradientText>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 * k, marginTop: 30 * k }}>
          {["Bảng", "Công thức", "Biểu đồ"].map((t, i) => (
            <Pill key={t} k={k} style={{ fontSize: 42 * k, alignSelf: "center", ...rise(enter(beat("p1", 0.35) + i * 6), 30) }}>
              <CheckIcon size={48 * k} color={BRAND.green} />
              {t}
            </Pill>
          ))}
        </div>
        <Pill k={k} style={{ alignSelf: "center", fontSize: 40 * k, border: `2px solid ${BRAND.green}88`, ...rise(enter(beat("p1", 0.75)), 30) }}>
          ✕ Không cần cài Microsoft Excel
        </Pill>
        <div style={{ marginTop: 40 * k, ...rise(enter(14), 120) }}>
          <ScreenCard
            src="excelmcp/site-0.png"
            page={PAGE}
            view={view}
            keys={[
              { at: 0, cam: { cx: 640, cy: 450, s: view.width / PAGE.width } },
              { at: beat("p1", 0.3), cam: fitBox(box(300, 90, 680, 330), view, 20) },
            ]}
            accent={BRAND.green}
            header={<UrlBar url="excelmcpserver.com" muted={C.muted} color={C.text} />}
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
  const stars = interpolate(frame, [beat("p2", 0.45), beat("p2", 0.72)], [0, parseStarLabel(shot.starLabel)], ease);
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: { cx: 640, cy: 450, s: view.width / shot.page.width } },
    { at: beat("p2", 0.35), cam: { cx: shot.star.x + shot.star.width / 2 - 80, cy: shot.star.y + shot.star.height / 2, s: 2.3 } },
  ];
  return (
    <Scene>
      <SplitLayout
        mediaFrac={0.36}
        head={
          <div style={{ display: "flex", alignItems: "center", gap: 32 * k }}>
            <div style={{ transform: `scale(${enter(0, 11)}) rotate(${interpolate(enter(0, 11), [0, 1], [-20, 0])}deg)` }}>
              <DocIcon size={180 * k} />
            </div>
            <div style={rise(enter(6))}>
              <div style={{ fontSize: 80 * k, fontWeight: 900, letterSpacing: -2 * k, lineHeight: 1.02 }}>
                Excel
                <br />
                <GradientText>MCP Server</GradientText>
              </div>
              <div style={{ fontSize: 42 * k, fontWeight: 500, color: C.muted, marginTop: 12 * k }}>Mã nguồn mở · MIT</div>
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
              accent={BRAND.green}
              header={<UrlBar url={REPO_URL} muted={C.muted} color={C.text} />}
            />
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 76 * k, fontWeight: 900, border: `2px solid ${BRAND.green}88`, ...rise(enter(beat("p2", 0.45))) }}>
            <StarIcon size={64 * k} color={BRAND.green} />
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{stars.toFixed(1)}K</span>
            <span style={{ fontSize: 40 * k, fontWeight: 500, color: C.muted }}>sao trên GitHub</span>
          </Pill>
        }
      />
    </Scene>
  );
};

// ---------- P3: sơ đồ AI ⇄ MCP ⇄ Word ----------
const BotIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="8" width="16" height="11" rx="3" />
    <path d="M12 8V4M9 13h.01M15 13h.01M9.5 16.5h5" />
  </svg>
);
const PlugIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3v5M15 3v5M7 8h10v4a5 5 0 0 1-10 0zM12 17v4" />
  </svg>
);

export const Bridge: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const frame = useCurrentFrame();
  const a1 = interpolate(frame, [beat("p3", 0.25), beat("p3", 0.45)], [0, 1], ease);
  const a2 = interpolate(frame, [beat("p3", 0.5), beat("p3", 0.7)], [0, 1], ease);
  const step = frame < beat("p3", 0.3) ? 0 : frame < beat("p3", 0.6) ? 1 : 2;
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", padding: `${230 * k}px 60px`, gap: 120 * k }}>
        <div style={{ textAlign: "center", ...rise(enter(0)) }}>
          <div style={{ fontSize: 50 * k, fontWeight: 700, letterSpacing: 4 * k, color: BRAND.green }}>CẦU NỐI</div>
          <div style={{ fontSize: 104 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05, marginTop: 14 * k }}>
            AI <GradientText>⇄</GradientText> Excel
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 * k, ...rise(enter(8), 60) }}>
          <StepDot icon={<BotIcon size={110 * k} color={step === 0 ? "#0A0D16" : C.text} />} label="Claude" color={BRAND.green} active={step === 0} size={210} />
          <GrowArrow w={110 * k} color={BRAND.mint} p={a1} />
          <StepDot icon={<PlugIcon size={110 * k} color={step === 1 ? "#0A0D16" : C.text} />} label="MCP Server" color={BRAND.green} active={step === 1} size={210} />
          <GrowArrow w={110 * k} color={BRAND.mint} p={a2} />
          <StepDot icon={<DocIcon size={120 * k} />} label="file .xlsx" color={BRAND.green} active={step === 2} size={210} />
        </div>
        <Pill k={k} style={{ alignSelf: "center", fontSize: 44 * k, ...rise(enter(beat("p3", 0.75)), 30) }}>
          <CheckIcon size={52 * k} color={BRAND.green} />
          Claude · Cursor · Codex…
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P4–P6: ví dụ thật trong README ----------
export type Feature = {
  tag: string;
  title: string;
  subtitle: string;
  src: string;
  page: Size;
  window: [string, string];
  seg: string;
  keys: (view: Size, b: (frac: number) => number) => CamKey[];
  highlights: (b: (frac: number) => number) => Highlight[];
};

export const FEATURES: Feature[] = [
  {
    tag: "CÂU LỆNH MẪU",
    title: "Nói việc bằng lời",
    subtitle: "CSV → bảng + biểu đồ doanh thu",
    src: "excelmcp/site-860.png",
    page: PAGE,
    window: ["excelmcpserver.com", "Quick start"],
    seg: "p4",
    keys: (view, b) => [
      { at: 0, cam: { cx: 640, cy: 450, s: view.width / PAGE.width } },
      { at: b(0.15), cam: fitBox(box(205, 640, 870, 230), view, 20) },
    ],
    highlights: (b) => [{ box: box(210, 648, 860, 78), from: b(0.3) }],
  },
  {
    tag: "CÂU LỆNH MẪU",
    title: "PivotTable + slicer",
    subtitle: "Theo khu vực × tháng, lọc 1 chạm",
    src: "excelmcp/site-1530.png",
    page: PAGE,
    window: ["excelmcpserver.com", "Quick start"],
    seg: "p5",
    keys: (view, b) => [
      { at: 0, cam: fitBox(box(205, 60, 870, 560), view, 10) },
      { at: b(0.15), cam: fitBox(box(205, 60, 870, 160), view, 20) },
    ],
    highlights: (b) => [{ box: box(210, 74, 860, 74), from: b(0.25) }],
  },
  {
    tag: "CÔNG THỨC",
    title: "Không cần Excel",
    subtitle: "~260 hàm · truy số sai từ đâu",
    src: "excelmcp/site-2050.png",
    page: PAGE,
    window: ["excelmcpserver.com", "Features"],
    seg: "p6",
    keys: (view, b) => [
      { at: 0, cam: fitBox(box(205, 140, 870, 700), view, 10) },
      { at: b(0.12), cam: fitBox(box(785, 210, 290, 345), view, 20) },
    ],
    highlights: (b) => [{ box: box(790, 216, 278, 336), from: b(0.2) }],
  },
  {
    tag: "FILE LỚN",
    title: "200.000 dòng",
    subtitle: "Đọc và sửa chỉ vài giây",
    src: "excelmcp/site-2050.png",
    page: PAGE,
    window: ["excelmcpserver.com", "Features"],
    seg: "p7",
    keys: (view, b) => [
      { at: 0, cam: fitBox(box(785, 210, 290, 345), view, 20) },
      { at: b(0.1), cam: fitBox(box(205, 555, 290, 275), view, 20) },
    ],
    highlights: (b) => [{ box: box(210, 563, 278, 261), from: b(0.25) }],
  },
];

export const FeatureScene: React.FC<{ feature: Feature }> = ({ feature }) => {
  const { k } = useLayout();
  const at = (frac: number) => beat(feature.seg, frac);
  const enter = useEnter();
  return (
    <Scene>
      <SplitLayout
        head={
          <div>
            <div style={{ fontSize: 40 * k, fontWeight: 700, letterSpacing: 4 * k, color: BRAND.green, ...rise(enter(0), 30) }}>{feature.tag}</div>
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
              accent={BRAND.green}
              header={<WindowTitle title={feature.window[0]} sub={feature.window[1]} />}
            />
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 46 * k, ...rise(enter(16), 40) }}>
            <CheckIcon size={54 * k} color={BRAND.green} />
            {feature.subtitle}
          </Pill>
        }
      />
    </Scene>
  );
};

// ---------- P8: 46 công cụ ----------
const TOOLS = [
  { at: 0.3, label: "Biểu đồ" },
  { at: 0.4, label: "PivotTable" },
  { at: 0.5, label: "Định dạng có điều kiện" },
  { at: 0.66, label: "Danh sách thả xuống" },
  { at: 0.8, label: "Goal Seek" },
];

export const Tools: React.FC = () => {
  const L = useLayout();
  const { k } = L;
  const frame = useCurrentFrame();
  const enter = useEnter();
  const n = interpolate(frame, [beat("p8", 0.05), beat("p8", 0.3)], [0, 46], ease);
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${200 * k}px ${L.pad}px`, gap: 50 * k }}>
        <div style={rise(enter(0))}>
          <div style={{ fontSize: 300 * k, fontWeight: 900, lineHeight: 0.95, letterSpacing: -10 * k, fontVariantNumeric: "tabular-nums" }}>
            <GradientText>{Math.round(n)}</GradientText>
          </div>
          <div style={{ fontSize: 80 * k, fontWeight: 900, marginTop: 10 * k }}>công cụ cho Excel</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24 * k }}>
          {TOOLS.map((t) => {
            const e = enter(beat("p8", t.at));
            return (
              <div
                key={t.label}
                style={{
                  padding: `${30 * k}px ${44 * k}px`,
                  borderRadius: 30 * k,
                  background: "rgba(255,255,255,0.05)",
                  border: `2px solid ${t.label.includes("thả xuống") ? BRAND.green : "rgba(255,255,255,0.12)"}`,
                  fontSize: 58 * k,
                  fontWeight: 700,
                  opacity: e,
                  transform: `scale(${interpolate(e, [0, 1], [0.6, 1])})`,
                }}
              >
                {t.label}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P9: cài đặt + kêu gọi ----------
const GithubIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={C.text}>
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
  </svg>
);

export const Outro: React.FC = () => {
  const L = useLayout();
  const { k } = L;
  const enter = useEnter();
  const frame = useCurrentFrame();
  const cmd = "claude mcp add excel --scope user -- uvx excel-mcp-server stdio";
  const typed = Math.round(interpolate(frame, [8, beat("p9", 0.35)], [0, cmd.length], ease));
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: `0 ${L.pad}px ${220 * k}px` }}>
        <div style={{ fontSize: 44 * k, fontWeight: 700, color: C.muted, ...rise(enter(0), 30) }}>Cài bằng 1 dòng lệnh:</div>
        <div
          style={{
            marginTop: 30 * k,
            width: "100%",
            padding: `${36 * k}px ${36 * k}px`,
            borderRadius: 28 * k,
            background: "#0D1117",
            border: `2px solid ${BRAND.green}66`,
            fontFamily: "monospace",
            fontSize: 40 * k,
            color: "#E6EDF3",
            textAlign: "left",
            lineHeight: 1.4,
            minHeight: 150 * k,
            ...rise(enter(4), 40),
          }}
        >
          <span style={{ color: BRAND.mint }}>$ </span>
          {cmd.slice(0, typed)}
          <span style={{ opacity: frame % 30 < 15 ? 1 : 0 }}>▍</span>
        </div>
        <div style={{ fontSize: 40 * k, fontWeight: 500, color: C.muted, marginTop: 24 * k, ...rise(enter(beat("p9", 0.3)), 20) }}>
          hoặc tải bản .mcpb cho Claude Desktop
        </div>
        <div style={{ fontSize: 120 * k, fontWeight: 900, lineHeight: 1.08, marginTop: 80 * k, letterSpacing: -3 * k, ...rise(enter(beat("p9", 0.62))) }}>
          Lưu lại
          <br />
          <GradientText>& thử ngay!</GradientText>
        </div>
        <Pill k={k} style={{ alignSelf: "center", marginTop: 60 * k, fontSize: 38 * k, fontWeight: 500, ...rise(enter(beat("p9", 0.7)), 30) }}>
          <GithubIcon size={44 * k} />
          {REPO_URL}
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};
