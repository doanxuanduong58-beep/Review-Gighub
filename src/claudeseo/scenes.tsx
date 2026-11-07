import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HEADER_H, ScreenCard, UrlBar, fitBox, parseStarLabel, type Box, type CamKey, type Highlight, type Size } from "../components/ScreenCard";
import { ChapterTag } from "../components/fx";
import { useLayout } from "../components/layout";
import { C, CheckIcon, StarIcon, fontFamily, useExit } from "../components/ui";
import REPO_SHOT from "../../public/claudeseo/repo.json";
import { BRAND, BRAND_GRADIENT, REPO_URL, beat } from "./data";

// Nửa trên màn hình (0..STAGE_H) là sân khấu nội dung; dải dưới dành cho robot dẫn chuyện + phụ đề (HostBand).
export const STAGE_H = 1290;

const useEnter = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (delay: number, damping = 200) => spring({ frame: frame - delay, fps, config: { damping } });
};
const rise = (p: number, px = 50) => ({ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [px, 0])}px)` });
const ease = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t: number) => 1 - Math.pow(1 - t, 3) } as const;
const box = (x: number, y: number, width: number, height: number): Box => ({ x, y, width, height });

const GradientText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{children}</span>
);

const Pill: React.FC<{ k: number; children: React.ReactNode; style?: React.CSSProperties; color?: string }> = ({ k, children, style, color = BRAND.orange }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 14 * k,
      padding: `${16 * k}px ${30 * k}px ${16 * k}px ${22 * k}px`,
      borderRadius: 999,
      background: "rgba(255,255,255,0.05)",
      border: `2px solid ${color}66`,
      fontSize: 44 * k,
      fontWeight: 700,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Sân khấu: nội dung căn giữa trong vùng trên, mờ dần cuối cảnh. */
const Stage: React.FC<{ children: React.ReactNode; justify?: "center" | "flex-start" }> = ({ children, justify = "flex-start" }) => {
  const { k } = useLayout();
  const exit = useExit();
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text, opacity: exit, height: STAGE_H * k }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: `${150 * k}px ${60 * k}px ${30 * k}px`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: justify,
          gap: 44 * k,
          textAlign: "center",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

const Heading: React.FC<{ k: number; p: number; children: React.ReactNode; size?: number }> = ({ k, p, children, size = 96 }) => (
  <div style={{ fontSize: size * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.08, ...rise(p) }}>{children}</div>
);

const Card: React.FC<{
  k: number;
  src: string;
  page: Size;
  height: number;
  keys: (view: Size) => CamKey[];
  highlights: Highlight[];
  header: React.ReactNode;
  p: number;
}> = ({ k, src, page, height, keys, highlights, header, p }) => {
  const view = { width: 960 * k, height: height * k - HEADER_H };
  return (
    <div style={rise(p, 100)}>
      <ScreenCard src={src} page={page} view={view} keys={keys(view)} highlights={highlights} accent={BRAND.orange} header={header} />
    </div>
  );
};

const CardTitle: React.FC<{ title: string; sub?: string }> = ({ title, sub }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 32, fontWeight: 700, color: C.text }}>
    {title}
    {sub && <span style={{ color: C.muted, fontWeight: 500 }}>· {sub}</span>}
  </div>
);

// ---------- P1: mở đầu ----------
export const Hook: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  // Đồng hồ đếm tới 15 phút (minh hoạ thời gian một lần audit theo README: 10–15 phút).
  const mins = interpolate(frame, [10, 15 + beat("p1", 0.75)], [0, 15], ease);
  const R = 200 * k;
  const circ = 2 * Math.PI * R;
  return (
    <Stage>
      <Heading k={k} p={enter(0)} size={118}>
        Audit SEO
        <br />
        <GradientText>cả website</GradientText>
      </Heading>
      <div style={{ position: "relative", width: R * 2 + 60 * k, height: R * 2 + 60 * k, opacity: enter(6) }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${R * 2 + 60 * k} ${R * 2 + 60 * k}`}>
          <circle cx={R + 30 * k} cy={R + 30 * k} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={28 * k} />
          <circle
            cx={R + 30 * k}
            cy={R + 30 * k}
            r={R}
            fill="none"
            stroke={BRAND.orange}
            strokeWidth={28 * k}
            strokeLinecap="round"
            strokeDasharray={`${(circ * mins) / 15} ${circ}`}
            transform={`rotate(-90 ${R + 30 * k} ${R + 30 * k})`}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 170 * k, fontWeight: 900, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{Math.round(mins)}</div>
          <div style={{ fontSize: 48 * k, fontWeight: 700, color: C.muted }}>phút</div>
        </div>
      </div>
      <Pill k={k} style={rise(enter(15 + beat("p1", 0.6)))}>
        <CheckIcon size={48 * k} color={BRAND.orange} />
        Ngay trong Claude Code
      </Pill>
    </Stage>
  );
};

// ---------- P2: giới thiệu + trang GitHub ----------
export const Intro: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const shot = REPO_SHOT as typeof REPO_SHOT & { star: Box };
  const stars = interpolate(frame, [beat("p2", 0.5), beat("p2", 0.85)], [0, parseStarLabel(shot.starLabel)], ease);
  return (
    <Stage>
      <Heading k={k} p={enter(0)} size={112}>
        Claude <GradientText>SEO</GradientText>
      </Heading>
      <Card
        k={k}
        p={enter(4)}
        src={shot.file}
        page={shot.page}
        height={640}
        keys={(view) => [
          { at: 0, cam: { cx: 640, cy: 450, s: view.width / shot.page.width } },
          { at: beat("p2", 0.4), cam: { cx: shot.star.x - 60, cy: shot.star.y + shot.star.height / 2, s: 2.4 } },
        ]}
        highlights={[{ box: shot.star, from: beat("p2", 0.46) }]}
        header={<UrlBar url={REPO_URL} muted={C.muted} color={C.text} />}
      />
      <Pill k={k} style={{ fontSize: 70 * k, fontWeight: 900, ...rise(enter(beat("p2", 0.5))) }}>
        <StarIcon size={60 * k} color={BRAND.orange} />
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{stars.toFixed(1)}K</span>
        <span style={{ fontSize: 38 * k, fontWeight: 500, color: C.muted }}>sao · MIT</span>
      </Pill>
    </Stage>
  );
};

// ---------- P3: cách dùng — khung hình GIF demo /seo audit (800x450) ----------
export const HowTo: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const b = (f: number) => beat("p3", f);
  return (
    <Stage>
      <div style={rise(enter(0), 20)}>
        <ChapterTag n={1} title="CÁCH DÙNG" color={BRAND.orange} />
      </div>
      <Heading k={k} p={enter(4)}>
        Gõ một lệnh,
        <br />
        <GradientText>nhận kế hoạch</GradientText>
      </Heading>
      <Card
        k={k}
        p={enter(8)}
        src="claudeseo/audit.png"
        page={{ width: 800, height: 450 }}
        height={640}
        keys={(view) => [
          { at: 0, cam: fitBox(box(180, 0, 470, 450), view, 0) },
          { at: b(0.12), cam: fitBox(box(180, 150, 330, 40), view, 20) },
          { at: b(0.5), cam: fitBox(box(196, 245, 320, 100), view, 16) },
        ]}
        highlights={[
          { box: box(186, 162, 120, 15), from: b(0.16), to: b(0.5) },
          { box: box(203, 252, 300, 70), from: b(0.56) },
        ]}
        header={<CardTitle title="Claude Code" sub="/seo audit" />}
      />
    </Stage>
  );
};

// ---------- P4: đội 19 agent, 17 chạy song song ----------
export const Agents: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const n = Math.round(interpolate(frame, [beat("p4", 0.02), beat("p4", 0.3)], [0, 19], ease));
  const runFrom = beat("p4", 0.45);
  return (
    <Stage>
      <div style={rise(enter(0), 20)}>
        <ChapterTag n={2} title="ĐỘI AGENT" color={BRAND.orange} />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 24 * k, ...rise(enter(4)) }}>
        <div style={{ fontSize: 220 * k, fontWeight: 900, lineHeight: 0.95, letterSpacing: -8 * k, fontVariantNumeric: "tabular-nums" }}>
          <GradientText>{n}</GradientText>
        </div>
        <div style={{ fontSize: 64 * k, fontWeight: 800, textAlign: "left", lineHeight: 1.1 }}>
          agent
          <br />
          <span style={{ color: C.muted, fontSize: 46 * k }}>chuyên môn</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 22 * k, width: 900 * k }}>
        {Array.from({ length: 19 }, (_, i) => {
          const p = enter(beat("p4", 0.02) + i * 1.5, 14);
          const running = i < 17 && frame > runFrom + i;
          const pulse = running ? 0.55 + 0.45 * Math.abs(Math.sin((frame + i * 7) / 6)) : 0;
          return (
            <div
              key={i}
              style={{
                height: 110 * k,
                borderRadius: 26 * k,
                background: running ? `rgba(61,220,151,${0.12 + pulse * 0.18})` : "rgba(255,255,255,0.05)",
                border: `2px solid ${running ? BRAND.green : "rgba(255,255,255,0.12)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12 * k,
                opacity: p,
                transform: `scale(${interpolate(p, [0, 1], [0.5, 1])})`,
              }}
            >
              {/* mặt robot nhỏ */}
              <svg width={62 * k} height={52 * k} viewBox="0 0 62 52">
                <rect x="2" y="4" width="58" height="46" rx="16" fill="#DCE2EF" />
                <rect x="9" y="11" width="44" height="32" rx="11" fill="#121828" />
                <rect x="19" y="20" width="7" height="10" rx="3" fill={running ? BRAND.green : C.muted} />
                <rect x="36" y="20" width="7" height="10" rx="3" fill={running ? BRAND.green : C.muted} />
              </svg>
            </div>
          );
        })}
      </div>
      <Pill k={k} color={BRAND.green} style={rise(enter(runFrom))}>
        <span style={{ width: 22 * k, height: 22 * k, borderRadius: 99, background: BRAND.green, display: "inline-block" }} />
        Tới 17 agent chạy song song
      </Pill>
    </Stage>
  );
};

// ---------- P5: những gì được kiểm tra — bảng lệnh /seo trong GIF demo (1280x720) ----------
const CHECKS = ["Kỹ thuật", "Tốc độ", "Nội dung", "Schema", "SEO địa phương"];

export const Checks: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const b = (f: number) => beat("p5", f);
  const row = (y: number) => box(328, y - 11, 404, 22);
  return (
    <Stage>
      <Heading k={k} p={enter(0)}>
        Soát <GradientText>đủ mọi mặt</GradientText>
      </Heading>
      <Card
        k={k}
        p={enter(4)}
        src="claudeseo/commands.png"
        page={{ width: 1280, height: 720 }}
        height={600}
        keys={(view) => [
          { at: 0, cam: fitBox(box(290, 170, 760, 380), view, 0) },
          { at: b(0.1), cam: fitBox(box(320, 300, 420, 230), view, 10) },
        ]}
        highlights={[
          { box: row(343), from: b(0.12), to: b(0.3) },
          { box: row(391), from: b(0.3), to: b(0.5) },
          { box: row(367), from: b(0.5), to: b(0.66) },
          { box: row(415), from: b(0.66) },
        ]}
        header={<CardTitle title="Claude Code" sub="/seo" />}
      />
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 * k, width: 960 * k }}>
        {CHECKS.map((c, i) => (
          <Pill key={c} k={k} style={{ fontSize: 40 * k, ...rise(enter(b(0.08 + i * 0.17)), 30) }}>
            <CheckIcon size={42 * k} color={BRAND.orange} />
            {c}
          </Pill>
        ))}
      </div>
    </Stage>
  );
};

// ---------- P6: AI search (GEO) ----------
const ENGINES = [
  { name: "ChatGPT", at: 0.35 },
  { name: "Perplexity", at: 0.5 },
  { name: "Gemini", at: 0.65 },
  { name: "AI Overviews", at: 0.78 },
];

export const AiSearch: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const W = 960 * k;
  const H = 640 * k;
  const page = { x: W / 2, y: 120 * k };
  // Lưới 2x2 dưới trang web.
  const pos = ENGINES.map((_, i) => ({ x: W * (i % 2 ? 0.74 : 0.26), y: H - (i < 2 ? 250 : 60) * k }));
  return (
    <Stage>
      <div style={rise(enter(0), 20)}>
        <ChapterTag n={3} title="AI SEARCH" color={BRAND.orange} />
      </div>
      <Heading k={k} p={enter(4)}>
        Được AI <GradientText>trích dẫn</GradientText>
      </Heading>
      <div style={{ position: "relative", width: W, height: H }}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {ENGINES.map((e, i) => {
            const p = interpolate(frame, [beat("p6", e.at) - 6, beat("p6", e.at) + 8], [0, 1], ease);
            const x2 = page.x + (pos[i].x - page.x) * p;
            const y2 = page.y + 90 * k + (pos[i].y - 50 * k - page.y - 90 * k) * p;
            const dot = (frame / 20 + i * 0.3) % 1;
            return (
              <g key={e.name} opacity={p}>
                <line x1={page.x} y1={page.y + 90 * k} x2={x2} y2={y2} stroke={BRAND.green} strokeWidth={5 * k} strokeDasharray={`${10 * k} ${10 * k}`} />
                {p > 0.95 && (
                  <circle
                    cx={pos[i].x + (page.x - pos[i].x) * dot}
                    cy={pos[i].y - 50 * k + (page.y + 90 * k - pos[i].y + 50 * k) * dot}
                    r={9 * k}
                    fill={BRAND.green}
                  />
                )}
              </g>
            );
          })}
        </svg>
        {/* Trang web của bạn */}
        <div
          style={{
            position: "absolute",
            left: page.x - 210 * k,
            top: page.y - 90 * k,
            width: 420 * k,
            height: 180 * k,
            borderRadius: 28 * k,
            background: "#F5F7FB",
            color: "#111827",
            padding: 24 * k,
            textAlign: "left",
            ...rise(enter(8), 40),
          }}
        >
          <div style={{ fontSize: 34 * k, fontWeight: 800 }}>Trang của bạn</div>
          {[0.9, 0.7, 0.8].map((w, i) => (
            <div key={i} style={{ marginTop: 14 * k, height: 16 * k, width: `${w * 100}%`, borderRadius: 8 * k, background: "#D5DAE6" }} />
          ))}
        </div>
        {ENGINES.map((e, i) => {
          const p = enter(beat("p6", e.at), 13);
          return (
            <div
              key={e.name}
              style={{
                position: "absolute",
                left: pos[i].x - 160 * k,
                top: pos[i].y - 50 * k,
                width: 320 * k,
                padding: `${22 * k}px 0`,
                borderRadius: 24 * k,
                background: "rgba(61,220,151,0.12)",
                border: `2px solid ${BRAND.green}`,
                fontSize: 40 * k,
                fontWeight: 800,
                opacity: p,
                transform: `scale(${interpolate(p, [0, 1], [0.6, 1])})`,
              }}
            >
              {e.name}
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

// ---------- P7: kết quả thật (theo tác giả) — ảnh "Real results" trong README (1200x751) ----------
export const Results: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const b = (f: number) => beat("p7", f);
  return (
    <Stage>
      <Heading k={k} p={enter(0)}>
        <GradientText>10.8K</GradientText> lượt nhấp
      </Heading>
      <Card
        k={k}
        p={enter(4)}
        src="claudeseo/results.png"
        page={{ width: 1200, height: 751 }}
        height={620}
        keys={(view) => [
          { at: 0, cam: fitBox(box(40, 100, 1120, 600), view, 0) },
          { at: b(0.2), cam: fitBox(box(70, 285, 300, 90), view, 20) },
          { at: b(0.6), cam: fitBox(box(70, 400, 520, 170), view, 16) },
        ]}
        highlights={[
          { box: box(77, 297, 113, 69), from: b(0.26), to: b(0.6) },
          { box: box(100, 414, 460, 140), from: b(0.66) },
        ]}
        header={<CardTitle title="Search Console" sub="claude-seo.md" />}
      />
      <div style={{ display: "flex", gap: 18 * k, ...rise(enter(b(0.6)), 30) }}>
        <Pill k={k} color={BRAND.green}>Sau 12 tuần</Pill>
        <Pill k={k} style={{ color: C.muted, fontWeight: 500 }}>
          Theo tác giả
        </Pill>
      </div>
    </Stage>
  );
};

// ---------- P8: cài 3 lệnh ----------
const COMMANDS = ["/plugin marketplace add AgriciDaniel/claude-seo", "/plugin install claude-seo@agricidaniel-claude-seo", "/seo setup"];

export const Install: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  // Gõ lần lượt 3 lệnh; cảnh có thêm 0,6 giây lặng để người xem kịp đọc.
  const total = beat("p8", 1) + 10;
  const per = total / COMMANDS.length;
  return (
    <Stage>
      <Heading k={k} p={enter(0)}>
        Cài bằng <GradientText>3 lệnh</GradientText>
      </Heading>
      <div
        style={{
          width: 960 * k,
          borderRadius: 28 * k,
          overflow: "hidden",
          background: "#0D1117",
          border: "2px solid rgba(255,255,255,0.12)",
          textAlign: "left",
          ...rise(enter(4), 80),
        }}
      >
        <div style={{ height: 70 * k, display: "flex", alignItems: "center", gap: 12 * k, padding: `0 ${26 * k}px`, background: "#161B22" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 20 * k, height: 20 * k, borderRadius: 99, background: c }} />
          ))}
          <span style={{ marginLeft: 16 * k, fontSize: 30 * k, color: C.muted, fontWeight: 600 }}>Claude Code</span>
        </div>
        <div style={{ padding: `${30 * k}px ${34 * k}px`, display: "flex", flexDirection: "column", gap: 26 * k }}>
          {COMMANDS.map((cmd, i) => {
            const from = 6 + i * per;
            const nChars = Math.max(0, Math.floor(((frame - from) / (per * 0.75)) * cmd.length));
            const shown = cmd.slice(0, nChars);
            const done = nChars >= cmd.length;
            return (
              <div key={cmd} style={{ display: "flex", gap: 18 * k, opacity: frame >= from ? 1 : 0.25 }}>
                <span style={{ color: BRAND.orange, fontSize: 36 * k, fontWeight: 800 }}>{i + 1}</span>
                <span style={{ fontFamily: "monospace", fontSize: 28 * k, color: done ? BRAND.green : C.text, wordBreak: "break-all", lineHeight: 1.35 }}>
                  {shown || (frame >= from ? "" : cmd)}
                  {frame >= from && !done && <span style={{ opacity: Math.floor(frame / 8) % 2 ? 1 : 0 }}>▍</span>}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <Pill k={k} style={rise(enter(beat("p8", 0.5)), 30)}>
        <CheckIcon size={46 * k} color={BRAND.orange} />
        Cần Claude Code 1.0.33+
      </Pill>
    </Stage>
  );
};

// ---------- P9: lưu lại & thử ngay ----------
export const Outro: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  return (
    <Stage justify="center">
      <div style={{ display: "flex", gap: 18 * k, ...rise(enter(0), 30) }}>
        <Pill k={k} color={BRAND.green}>
          <CheckIcon size={46 * k} color={BRAND.green} />
          Miễn phí
        </Pill>
        <Pill k={k}>Mã nguồn mở · MIT</Pill>
      </div>
      <div style={{ fontSize: 130 * k, fontWeight: 900, lineHeight: 1.08, letterSpacing: -3 * k, ...rise(enter(beat("p9", 0.45))) }}>
        Lưu lại
        <br />
        <GradientText>& thử ngay!</GradientText>
      </div>
      <Pill k={k} style={{ fontSize: 38 * k, fontWeight: 500, ...rise(enter(beat("p9", 0.55)), 30) }}>
        <svg width={46 * k} height={46 * k} viewBox="0 0 24 24" fill={C.text}>
          <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
        </svg>
        {REPO_URL}
      </Pill>
    </Stage>
  );
};

// ---------- P10: kêu gọi đăng ký + câu hỏi bình luận ----------
export const Subscribe: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const pulse = 1 + Math.sin(frame / 6) * 0.04;
  const btnAt = beat("p10", 0.15);
  return (
    <Stage justify="center">
      <div
        style={{
          position: "relative",
          width: 960 * k,
          padding: `${44 * k}px ${50 * k}px`,
          borderRadius: 48 * k,
          background: "#F5F7FB",
          color: "#111827",
          fontSize: 70 * k,
          fontWeight: 800,
          lineHeight: 1.25,
          transform: `scale(${enter(0, 14)})`,
        }}
      >
        Website của bạn đang
        <br />
        gặp lỗi SEO nào?
        {/* đuôi bong bóng chỉ xuống robot */}
        <div style={{ position: "absolute", left: 120 * k, bottom: -34 * k, width: 0, height: 0, borderLeft: `${30 * k}px solid transparent`, borderRight: `${30 * k}px solid transparent`, borderTop: `${36 * k}px solid #F5F7FB` }} />
      </div>
      <div style={{ fontSize: 46 * k, fontWeight: 700, color: C.muted, marginTop: 20 * k, ...rise(enter(btnAt * 0.6), 20) }}>💬 Bình luận cho mình biết nhé</div>
      <div
        style={{
          padding: `${30 * k}px ${70 * k}px`,
          borderRadius: 999,
          background: BRAND.orange,
          color: "#0A0D16",
          fontSize: 66 * k,
          fontWeight: 900,
          boxShadow: `0 0 ${60 * k}px ${BRAND.orange}88`,
          transform: `scale(${enter(btnAt, 12) * pulse})`,
        }}
      >
        🔔 Đăng ký kênh
      </div>
    </Stage>
  );
};
