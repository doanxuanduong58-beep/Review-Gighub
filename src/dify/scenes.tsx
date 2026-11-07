import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { HEADER_H, ScreenCard, UrlBar, fitBox, parseStarLabel, type Box, type CamKey, type Size } from "../components/ScreenCard";
import { Bokeh } from "../components/fx";
import { SplitLayout, useLayout } from "../components/layout";
import { Background, C, CheckIcon, StarIcon, fontFamily, useExit } from "../components/ui";
import SHOT from "../../public/dify/github.json";
import { BRAND, BRAND_GRADIENT, REPO_URL, beat } from "./data";

// Thiết kế gốc 1080x1920, nhân `k`. Nhịp nhanh: spring cứng, mốc theo beat() của câu thoại.

const useEnter = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (delay: number, damping = 14) => spring({ frame: frame - delay, fps, config: { damping, stiffness: 220 } });
};
const rise = (p: number, px = 60) => ({ opacity: Math.min(1, p * 1.4), transform: `translateY(${interpolate(p, [0, 1], [px, 0])}px)` });
const pop = (p: number) => ({ opacity: Math.min(1, p * 2), transform: `scale(${interpolate(p, [0, 1], [0.4, 1])})` });
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = { ...clamp, easing: (t: number) => 1 - Math.pow(1 - t, 3) };

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
      alignSelf: "flex-start",
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
  <div style={{ fontSize: 40 * k, fontWeight: 800, letterSpacing: 6 * k, color: BRAND.sky, ...rise(p, 30) }}>{children}</div>
);

const Title: React.FC<{ k: number; p: number; children: React.ReactNode; size?: number }> = ({ k, p, children, size = 108 }) => (
  <div style={{ fontSize: size * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05, marginTop: 12 * k, ...rise(p) }}>{children}</div>
);

const Scene: React.FC<{ accent?: string; children: React.ReactNode }> = ({ accent = BRAND.blue, children }) => {
  const exit = useExit(6);
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text, opacity: exit }}>
      <Background accent={accent} />
      <Bokeh color={accent} />
      {children}
    </AbsoluteFill>
  );
};

const Note: React.FC<{ k: number; p: number; children: React.ReactNode }> = ({ k, p, children }) => (
  <div style={{ fontSize: 32 * k, color: C.muted, fontWeight: 500, opacity: p }}>{children}</div>
);

const viewOf = (box: Size): Size => ({ width: box.width, height: box.height - HEADER_H });
const README_HEADER = (url: string) => <UrlBar url={url} muted={C.muted} color={C.text} from={2} />;

// ---------- P1: hook ----------
export const Hook: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const strike = interpolate(frame, [beat("p1", 0.75), beat("p1", 0.88)], [0, 1], clamp);
  const bubbles = [
    { at: 0.18, text: "🤖 Chatbot CSKH", x: -230, y: -560, rot: -6 },
    { at: 0.32, text: "📄 Trợ lý tài liệu", x: 210, y: -430, rot: 5 },
    { at: 0.46, text: "⚙️ Tự động hoá", x: -190, y: 420, rot: 4 },
  ];
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", paddingBottom: 200 * k }}>
        {bubbles.map((b) => (
          <div
            key={b.text}
            style={{
              position: "absolute",
              left: "50%",
              top: "46%",
              transform: `translate(calc(-50% + ${b.x * k}px), ${b.y * k}px) rotate(${b.rot}deg)`,
            }}
          >
            <div
              style={{
                padding: `${22 * k}px ${34 * k}px`,
                borderRadius: 36 * k,
                background: "#F5F7FB",
                color: "#111827",
                fontSize: 46 * k,
                fontWeight: 800,
                whiteSpace: "nowrap",
                boxShadow: `0 20px 60px ${BRAND.blue}55`,
                ...pop(enter(beat("p1", b.at), 9)),
              }}
            >
              {b.text}
            </div>
          </div>
        ))}
        <div style={{ fontSize: 150 * k, fontWeight: 900, lineHeight: 1, letterSpacing: -5 * k, ...rise(enter(0)) }}>Tự làm</div>
        <div style={{ fontSize: 190 * k, fontWeight: 900, lineHeight: 1.05, letterSpacing: -7 * k, transform: `scale(${interpolate(enter(4, 9), [0, 1], [1.8, 1])})`, opacity: Math.min(1, enter(4) * 2) }}>
          <GradientText>app AI</GradientText>
        </div>
        <div style={{ position: "relative", marginTop: 40 * k, ...rise(enter(beat("p1", 0.6))) }}>
          <Pill k={k} style={{ fontSize: 60 * k, alignSelf: "center" }}>
            Không cần viết <span style={{ position: "relative", color: BRAND.yellow }}>
              code
              <span style={{ position: "absolute", left: -6 * k, top: "52%", height: 8 * k, width: `calc(${strike * 100}% + ${12 * k}px)`, background: "#FF4D6D", borderRadius: 4 * k }} />
            </span>
          </Pill>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P2: giới thiệu + GitHub ----------
export const Intro: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const shot = SHOT as typeof SHOT & { star: Box };
  const stars = interpolate(frame, [beat("p2", 0.5), beat("p2", 0.85)], [0, parseStarLabel(shot.starLabel)], easeOut);
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: { cx: 640, cy: 450, s: view.width / shot.page.width } },
    { at: beat("p2", 0.4), cam: fitBox({ x: 990, y: 170, width: 270, height: 64 }, view) },
  ];
  return (
    <Scene>
      <SplitLayout
        mediaFrac={0.36}
        head={
          <div style={{ display: "flex", alignItems: "center", gap: 36 * k }}>
            <div style={{ background: "#F4F4F4", borderRadius: 36 * k, padding: `${18 * k}px ${26 * k}px`, ...pop(enter(0, 10)) }}>
              <Img src={staticFile("dify/logo.png")} style={{ width: 300 * k, display: "block" }} />
            </div>
            <div style={rise(enter(5))}>
              <div style={{ fontSize: 56 * k, fontWeight: 900, lineHeight: 1.1 }}>Mã nguồn mở</div>
              <div style={{ fontSize: 40 * k, fontWeight: 600, color: C.muted, marginTop: 8 * k }}>Nền tảng làm app AI</div>
            </div>
          </div>
        }
        media={(box) => (
          <div style={rise(enter(3), 140)}>
            <ScreenCard
              src={shot.file}
              page={shot.page}
              view={viewOf(box)}
              keys={keys(viewOf(box))}
              highlights={[{ box: shot.star, from: beat("p2", 0.45) }]}
              accent={BRAND.yellow}
              header={README_HEADER(REPO_URL)}
            />
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 84 * k, fontWeight: 900, border: `2px solid ${BRAND.yellow}88`, ...rise(enter(beat("p2", 0.48)), 40) }}>
            <StarIcon size={70 * k} color={BRAND.yellow} />
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(stars)}K</span>
            <span style={{ fontSize: 42 * k, fontWeight: 600, color: C.muted }}>sao GitHub</span>
          </Pill>
        }
      />
    </Scene>
  );
};

// ---------- P3: workflow kéo thả (sơ đồ minh hoạ tự vẽ) ----------
const NODES = [
  { icon: "▶", label: "Bắt đầu", x: 160, y: 0 },
  { icon: "🧠", label: "LLM", x: 600, y: 200 },
  { icon: "🔎", label: "Tìm tài liệu", x: 160, y: 400 },
  { icon: "💬", label: "Trả lời", x: 600, y: 600 },
];

export const Workflow: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const W = 960;
  const nodeW = 340;
  const nodeH = 120;
  const at = (i: number) => beat("p3", 0.05 + i * 0.17);
  const center = (n: (typeof NODES)[number]) => ({ x: n.x, y: n.y + nodeH / 2 });
  // Chấm sáng chạy dọc quy trình sau khi các khối đã nối xong.
  const runP = interpolate(frame, [beat("p3", 0.72), beat("p3", 1.05)], [0, NODES.length - 1], clamp);
  const seg = Math.min(NODES.length - 2, Math.floor(runP));
  const a = center(NODES[seg]);
  const b = center(NODES[seg + 1]);
  const t = runP - seg;
  return (
    <Scene accent={BRAND.sky}>
      <AbsoluteFill style={{ padding: `${150 * k}px ${60 * k}px`, gap: 50 * k }}>
        <div>
          <Label k={k} p={enter(0)}>WORKFLOW</Label>
          <Title k={k} p={enter(3)}>
            Kéo thả <GradientText>là xong</GradientText>
          </Title>
        </div>
        <div style={{ position: "relative", width: W * k, height: 740 * k, alignSelf: "center" }}>
          <svg width={W * k} height={740 * k} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {NODES.slice(1).map((n, i) => {
              const p0 = center(NODES[i]);
              const p1 = center(n);
              const len = interpolate(frame, [at(i + 1) - 4, at(i + 1) + 6], [0, 1], clamp);
              const x = p0.x + (p1.x - p0.x) * len;
              const y = p0.y + (p1.y - p0.y) * len;
              return <line key={i} x1={p0.x * k} y1={p0.y * k} x2={x * k} y2={y * k} stroke={BRAND.sky} strokeWidth={6 * k} strokeDasharray={`${14 * k} ${10 * k}`} strokeDashoffset={-frame * 2} />;
            })}
            {frame >= beat("p3", 0.72) && (
              <circle cx={(a.x + (b.x - a.x) * t) * k} cy={(a.y + (b.y - a.y) * t) * k} r={18 * k} fill={BRAND.yellow} style={{ filter: `drop-shadow(0 0 ${16 * k}px ${BRAND.yellow})` }} />
            )}
          </svg>
          {NODES.map((n, i) => {
            const p = enter(at(i), 10);
            const lit = frame >= beat("p3", 0.72) && runP >= i - 0.15;
            return (
              <div
                key={n.label}
                style={{
                  position: "absolute",
                  left: (n.x - nodeW / 2) * k,
                  top: n.y * k,
                  width: nodeW * k,
                  height: nodeH * k,
                  borderRadius: 28 * k,
                  background: "#141A28",
                  border: `3px solid ${lit ? BRAND.yellow : BRAND.blue}`,
                  boxShadow: lit ? `0 0 ${40 * k}px ${BRAND.yellow}66` : `0 20px 50px ${BRAND.blue}33`,
                  display: "flex",
                  alignItems: "center",
                  gap: 20 * k,
                  padding: `0 ${28 * k}px`,
                  fontSize: 46 * k,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  ...pop(p),
                }}
              >
                <span style={{ fontSize: 50 * k }}>{n.icon}</span>
                {n.label}
              </div>
            );
          })}
        </div>
        <Note k={k} p={enter(8)}>* Sơ đồ minh hoạ, không phải giao diện Dify</Note>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P4: hàng trăm mô hình (ảnh lưới nhà cung cấp trong README) ----------
const README_FEATURES = { file: "dify/full-3780.png", page: { width: 1280, height: 900 } };
const PROVIDERS: Box = { x: 62, y: 288, width: 845, height: 158 };
const AGENT: Box = { x: 60, y: 600, width: 850, height: 95 };

export const Models: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: fitBox({ x: 40, y: 180, width: 900, height: 300 }, view) },
    { at: beat("p4", 0.3), cam: fitBox({ x: 62, y: 285, width: 430, height: 165 }, view, 10) },
    { at: beat("p4", 0.62), cam: fitBox({ x: 480, y: 285, width: 430, height: 165 }, view, 10) },
  ];
  const names = ["GPT", "Claude", "Gemini", "Llama"];
  return (
    <Scene>
      <SplitLayout
        mediaFrac={0.3}
        head={
          <div>
            <Label k={k} p={enter(0)}>MÔ HÌNH AI</Label>
            <Title k={k} p={enter(3)} size={96}>
              <span style={{ whiteSpace: "nowrap" }}>
                Hàng <GradientText>trăm</GradientText> mô hình
              </span>
            </Title>
          </div>
        }
        media={(box) => (
          <div style={rise(enter(2), 140)}>
            <ScreenCard
              src={README_FEATURES.file}
              page={README_FEATURES.page}
              view={viewOf(box)}
              keys={keys(viewOf(box))}
              highlights={[{ box: PROVIDERS, from: 6, to: beat("p4", 0.3) }]}
              accent={BRAND.blue}
              header={README_HEADER("README · Key features")}
            />
          </div>
        )}
        foot={
          <div style={{ display: "flex", flexWrap: "wrap", gap: 18 * k }}>
            {names.map((n, i) => (
              <Pill key={n} k={k} style={{ fontSize: 46 * k, ...pop(enter(beat("p4", 0.35 + i * 0.13), 10)) }}>
                {n}
              </Pill>
            ))}
          </div>
        }
      />
    </Scene>
  );
};

// ---------- P5: RAG — hỏi đáp trên tài liệu (minh hoạ) ----------
export const Rag: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const files = [
    { t: "PDF", c: "#FF4D6D", at: 0.05 },
    { t: "PPT", c: "#FF9F43", at: 0.15 },
    { t: "DOC", c: BRAND.sky, at: 0.25 },
  ];
  const absorb = (at: number) => interpolate(frame, [beat("p5", at), beat("p5", at + 0.22)], [0, 1], easeOut);
  const answer = "Hợp đồng gia hạn 12 tháng, báo trước 30 ngày.";
  const typed = Math.round(interpolate(frame, [beat("p5", 0.62), beat("p5", 0.95)], [0, answer.length], clamp));
  return (
    <Scene accent={BRAND.sky}>
      <AbsoluteFill style={{ padding: `${150 * k}px ${60 * k}px`, gap: 50 * k }}>
        <div>
          <Label k={k} p={enter(0)}>RAG</Label>
          <Title k={k} p={enter(3)}>
            Hỏi đáp <GradientText>tài liệu</GradientText>
          </Title>
        </div>
        <div style={{ position: "relative", height: 330 * k, display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
          {files.map((f, i) => {
            const p = absorb(f.at);
            const x = (i - 1) * 250 * (1 - p);
            const y = -200 * (1 - p);
            return (
              <div
                key={f.t}
                style={{
                  position: "absolute",
                  bottom: 120 * k,
                  width: 150 * k,
                  height: 190 * k,
                  borderRadius: 18 * k,
                  background: "#F5F7FB",
                  borderTop: `${26 * k}px solid ${f.c}`,
                  color: f.c,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 44 * k,
                  fontWeight: 900,
                  transform: `translate(${x * k}px, ${y * k}px) scale(${1 - p * 0.6})`,
                  opacity: frame < beat("p5", f.at) ? 0 : 1 - p * 0.9,
                }}
              >
                {f.t}
              </div>
            );
          })}
          <div
            style={{
              width: 520 * k,
              padding: `${26 * k}px 0`,
              borderRadius: 28 * k,
              background: `linear-gradient(135deg, ${BRAND.blue}, #6B4DFF)`,
              textAlign: "center",
              fontSize: 46 * k,
              fontWeight: 900,
              boxShadow: `0 0 ${60 * k * absorb(0.25)}px ${BRAND.sky}`,
              ...pop(enter(2, 10)),
            }}
          >
            📚 Kho tri thức
          </div>
        </div>
        <div
          style={{
            alignSelf: "flex-end",
            maxWidth: 860 * k,
            borderRadius: `${40 * k}px ${40 * k}px ${10 * k}px ${40 * k}px`,
            background: "#141A28",
            border: `2px solid ${BRAND.sky}66`,
            padding: `${34 * k}px ${40 * k}px`,
            ...rise(enter(beat("p5", 0.55)), 60),
          }}
        >
          <div style={{ fontSize: 50 * k, fontWeight: 700, lineHeight: 1.3, minHeight: 130 * k }}>{answer.slice(0, typed)}</div>
          <div style={{ marginTop: 18 * k, fontSize: 34 * k, fontWeight: 700, color: BRAND.sky, opacity: typed >= answer.length ? 1 : 0 }}>📎 Nguồn: hop-dong.pdf · trang 3</div>
        </div>
        <Note k={k} p={enter(8)}>* Ví dụ minh hoạ</Note>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P6: Agent (đoạn mô tả thật trong README) ----------
export const Agent: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: fitBox({ x: 40, y: 560, width: 900, height: 280 }, view) },
    { at: beat("p6", 0.2), cam: fitBox({ x: 55, y: 592, width: 470, height: 100 }, view, 6) },
    { at: beat("p6", 0.6), cam: fitBox({ x: 440, y: 592, width: 470, height: 100 }, view, 6) },
  ];
  const chips = [
    { at: 0.15, t: "⌨️ Chạy lệnh" },
    { at: 0.35, t: "📦 Cài phần mềm" },
    { at: 0.65, t: "🔌 Công cụ · MCP" },
  ];
  return (
    <Scene>
      <SplitLayout
        mediaFrac={0.3}
        head={
          <div>
            <Label k={k} p={enter(0)}>AGENT</Label>
            <Title k={k} p={enter(3)}>
              Tự làm <GradientText>việc</GradientText>
            </Title>
          </div>
        }
        media={(box) => (
          <div style={rise(enter(2), 140)}>
            <ScreenCard
              src={README_FEATURES.file}
              page={README_FEATURES.page}
              view={viewOf(box)}
              keys={keys(viewOf(box))}
              highlights={[{ box: AGENT, from: beat("p6", 0.1) }]}
              accent={BRAND.yellow}
              header={README_HEADER("README · 5. Agent")}
            />
          </div>
        )}
        foot={
          <div style={{ display: "flex", flexDirection: "column", gap: 18 * k }}>
            {chips.map((c) => (
              <Pill key={c.t} k={k} style={{ fontSize: 50 * k, ...rise(enter(beat("p6", c.at), 12), 40) }}>
                {c.t}
              </Pill>
            ))}
          </div>
        }
      />
    </Scene>
  );
};

// ---------- P7: tự cài bằng Docker (khối lệnh thật trong README) ----------
const README_START = { file: "dify/full-3150.png", page: { width: 1280, height: 900 } };
const COMPOSE: Box = { x: 65, y: 326, width: 838, height: 72 };

export const Deploy: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: fitBox({ x: 40, y: 60, width: 900, height: 420 }, view) },
    { at: beat("p7", 0.25), cam: fitBox({ x: 60, y: 320, width: 440, height: 85 }, view, 10) },
  ];
  return (
    <Scene accent={BRAND.sky}>
      <SplitLayout
        mediaFrac={0.3}
        head={
          <div>
            <Label k={k} p={enter(0)}>TỰ CÀI ĐẶT</Label>
            <Title k={k} p={enter(3)}>
              Máy chủ <GradientText>của bạn</GradientText>
            </Title>
          </div>
        }
        media={(box) => (
          <div style={rise(enter(2), 140)}>
            <ScreenCard
              src={README_START.file}
              page={README_START.page}
              view={viewOf(box)}
              keys={keys(viewOf(box))}
              highlights={[{ box: COMPOSE, from: beat("p7", 0.3) }]}
              accent={BRAND.yellow}
              header={README_HEADER("README · Quick start")}
            />
          </div>
        )}
        foot={
          <div style={{ display: "flex", gap: 18 * k, alignItems: "center" }}>
            <Pill k={k} style={{ fontSize: 50 * k, ...pop(enter(beat("p7", 0.35), 10)) }}>
              🐳 Docker
            </Pill>
            <span style={{ fontSize: 40 * k, color: C.muted, fontWeight: 700, opacity: enter(beat("p7", 0.6)) }}>hoặc</span>
            <Pill k={k} style={{ fontSize: 50 * k, ...pop(enter(beat("p7", 0.7), 10)) }}>
              ☁️ Cloud
            </Pill>
          </div>
        }
      />
    </Scene>
  );
};

// ---------- P8: lưu lại & thử ngay ----------
export const Outro: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const pulse = 1 + Math.sin(frame / 4) * 0.03;
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", gap: 56 * k, paddingBottom: 200 * k }}>
        <div style={{ background: "#F4F4F4", borderRadius: 40 * k, padding: `${20 * k}px ${30 * k}px`, ...pop(enter(0, 10)) }}>
          <Img src={staticFile("dify/logo.png")} style={{ width: 380 * k, display: "block" }} />
        </div>
        <div style={{ fontSize: 140 * k, fontWeight: 900, lineHeight: 1.02, letterSpacing: -5 * k, transform: `scale(${interpolate(enter(2, 9), [0, 1], [1.7, 1]) * pulse})`, opacity: Math.min(1, enter(2) * 2) }}>
          Lưu lại
          <br />
          <GradientText>& thử ngay!</GradientText>
        </div>
        <Pill k={k} style={{ alignSelf: "center", fontSize: 42 * k, fontWeight: 600, ...rise(enter(5), 40) }}>
          <svg width={48 * k} height={48 * k} viewBox="0 0 24 24" fill={C.text}>
            <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
          </svg>
          {REPO_URL}
        </Pill>
        <div style={{ display: "flex", gap: 16 * k, ...rise(enter(7), 30) }}>
          <Pill k={k} style={{ fontSize: 38 * k }}>
            <CheckIcon size={42 * k} color={BRAND.sky} />
            Workflow
          </Pill>
          <Pill k={k} style={{ fontSize: 38 * k }}>
            <CheckIcon size={42 * k} color={BRAND.sky} />
            RAG
          </Pill>
          <Pill k={k} style={{ fontSize: 38 * k }}>
            <CheckIcon size={42 * k} color={BRAND.sky} />
            Agent
          </Pill>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
