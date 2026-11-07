import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { HEADER_H, ScreenCard, UrlBar, fitBox, type Box, type CamKey, type Highlight, type Size } from "../components/ScreenCard";
import { SplitLayout, useLayout } from "../components/layout";
import { Bokeh, StepDot } from "../components/fx";
import { Background, C, CheckIcon, fontFamily, useExit } from "../components/ui";
import REPO_SHOT from "../../public/kitviet/repo.json";
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

const Scene: React.FC<{ children: React.ReactNode; accent?: string }> = ({ children, accent = BRAND.red }) => {
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

const Logo: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <Img src={staticFile("kitviet/logo-mark-512.png")} style={{ width: size, height: size, ...style }} />
);

const WindowTitle: React.FC<{ title: string; sub: string }> = ({ title, sub }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, fontWeight: 700, color: C.text, whiteSpace: "nowrap" }}>
    <Logo size={40} />
    {title}
    <span style={{ color: C.muted, fontWeight: 500 }}>· {sub}</span>
  </div>
);

const FILES = [
  { label: "Word", color: "#2B6CF0" },
  { label: "Excel", color: "#1E9B57" },
  { label: "PDF", color: "#E23B3B" },
  { label: "PowerPoint", color: "#E5553A" },
];

// ---------- P1: câu mở đầu ----------
export const Hook: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const line = { fontSize: 116 * k, fontWeight: 900, lineHeight: 1.05, letterSpacing: -3 * k };
  const view = { width: 960, height: 600 };
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", padding: `${190 * k}px 60px`, textAlign: "center", gap: 18 * k }}>
        <div style={{ ...line, ...rise(enter(0)) }}>Nói tiếng Việt</div>
        <div style={{ ...line, fontSize: 100 * k, ...rise(enter(8)) }}>
          <GradientText>ra file chuẩn</GradientText>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 * k, marginTop: 30 * k }}>
          {FILES.map((a, i) => (
            <Pill key={a.label} k={k} style={{ fontSize: 38 * k, padding: `${16 * k}px ${26 * k}px ${16 * k}px ${20 * k}px`, alignSelf: "center", ...rise(enter(beat("p1", 0.45) + i * 5), 30) }}>
              <div style={{ width: 26 * k, height: 26 * k, borderRadius: 8 * k, background: a.color }} />
              {a.label}
            </Pill>
          ))}
        </div>
        <div style={{ marginTop: 50 * k, ...rise(enter(14), 120) }}>
          <ScreenCard
            src="kitviet/guide-0.png"
            page={PAGE}
            view={view}
            keys={[
              { at: 0, cam: { cx: 640, cy: 450, s: view.width / PAGE.width } },
              { at: beat("p1", 0.4), cam: fitBox(box(90, 60, 1040, 540), view, 10) },
            ]}
            accent={BRAND.red}
            header={<WindowTitle title="Kit Việt" sub="Hành chính - Văn phòng" />}
          />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P2: giới thiệu + trang GitHub ----------
export const Intro: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const shot = REPO_SHOT as typeof REPO_SHOT & { about: Box };
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: { cx: 640, cy: 450, s: view.width / shot.page.width } },
    { at: beat("p2", 0.3), cam: fitBox(box(960, 200, 300, 330), view, 20) },
  ];
  return (
    <Scene>
      <SplitLayout
        mediaFrac={0.36}
        head={
          <div style={{ display: "flex", alignItems: "center", gap: 32 * k }}>
            <Logo size={180 * k} style={{ transform: `scale(${enter(0, 11)}) rotate(${interpolate(enter(0, 11), [0, 1], [-20, 0])}deg)` }} />
            <div style={rise(enter(6))}>
              <div style={{ fontSize: 112 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1 }}>
                Kit <GradientText>Việt</GradientText>
              </div>
              <div style={{ fontSize: 42 * k, fontWeight: 500, color: C.muted, marginTop: 12 * k }}>Trợ lý AI tiếng Việt · MIT</div>
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
              highlights={[{ box: box(968, 222, 290, 170), from: beat("p2", 0.4) }]}
              accent={BRAND.red}
              header={<UrlBar url={REPO_URL} muted={C.muted} color={C.text} />}
            />
          </div>
        )}
        foot={
          <div style={{ display: "flex", flexDirection: "column", gap: 24 * k }}>
            <Pill k={k} style={{ fontSize: 76 * k, fontWeight: 900, border: `2px solid ${BRAND.red}88`, ...rise(enter(beat("p2", 0.45))) }}>
              <span>20</span>
              <span style={{ fontSize: 44 * k, fontWeight: 700, color: C.muted }}>bộ theo nghề</span>
            </Pill>
            <Pill k={k} style={{ fontSize: 42 * k, ...rise(enter(beat("p2", 0.7)), 30) }}>
              <CheckIcon size={50 * k} color={BRAND.gold} />
              Bản Free mã nguồn mở · ra mắt 03/11/2026
            </Pill>
          </div>
        }
      />
    </Scene>
  );
};

// ---------- P3: 20 nghề ----------
const JOBS = [
  "Kế toán", "Nhân sự", "Hành chính", "Pháp chế", "Giáo viên", "Y tế", "Xây dựng", "Marketing",
  "Bán hàng online", "Kinh doanh B2B", "Ngân hàng", "Bảo hiểm", "Bất động sản", "Xuất nhập khẩu",
  "Nhà hàng", "Du lịch", "Công nghệ", "Báo chí", "Nghiên cứu", "Nhà máy",
];
const HOT = new Set(["Kế toán", "Hành chính", "Pháp chế"]);

export const Jobs: React.FC = () => {
  const L = useLayout();
  const { k } = L;
  const enter = useEnter();
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${180 * k}px ${L.pad}px`, gap: 44 * k }}>
        <div style={rise(enter(0))}>
          <div style={{ fontSize: 40 * k, fontWeight: 700, letterSpacing: 4 * k, color: BRAND.red }}>MỖI NGHỀ</div>
          <div style={{ fontSize: 96 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05, marginTop: 14 * k }}>
            <GradientText>30–43</GradientText> kỹ năng
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 * k }}>
          {JOBS.map((j, i) => {
            const e = enter(6 + i * 3);
            return (
              <div
                key={j}
                style={{
                  padding: `${18 * k}px ${28 * k}px`,
                  borderRadius: 22 * k,
                  background: HOT.has(j) ? `${BRAND.red}33` : "rgba(255,255,255,0.05)",
                  border: `2px solid ${HOT.has(j) ? BRAND.red : "rgba(255,255,255,0.12)"}`,
                  fontSize: 42 * k,
                  fontWeight: 700,
                  opacity: e,
                  transform: `scale(${interpolate(e, [0, 1], [0.6, 1])})`,
                }}
              >
                {j}
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 40 * k, fontWeight: 500, color: C.muted, ...rise(enter(beat("p3", 0.5)), 20) }}>
          vd: đối chiếu công nợ · soạn hợp đồng
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P4, P5, P7: ảnh thật ----------
export type Feature = {
  tag: string;
  title: string;
  subtitle: string;
  src: string;
  window: [string, string];
  seg: string;
  keys: (view: Size, b: (frac: number) => number) => CamKey[];
  highlights: (b: (frac: number) => number) => Highlight[];
};

export const ADMIN: Feature = {
  tag: "HÀNH CHÍNH - VĂN PHÒNG",
  title: "Công văn, tờ trình",
  subtitle: "Đúng thể thức · xuất sổ ra Excel",
  src: "kitviet/guide-2100.png",
  window: ["Kit Việt", "Văn bản hành chính và văn thư"],
  seg: "p4",
  keys: (view, b) => [
    { at: 0, cam: { cx: 640, cy: 450, s: view.width / PAGE.width } },
    { at: b(0.12), cam: fitBox(box(104, 61, 360, 640), view, 10) },
  ],
  highlights: (b) => [
    { box: box(120, 117, 328, 104), from: b(0.2) },
    { box: box(120, 480, 328, 141), from: b(0.42) },
  ],
};

export const EXAMPLE: Feature = {
  tag: "VÍ DỤ THẬT",
  title: "Làm bảng lương",
  subtitle: "Từ file chấm công → Excel",
  src: "kitviet/readme-7480.png",
  window: ["README", "Ví dụ"],
  seg: "p5",
  keys: (view, b) => [
    { at: 0, cam: { cx: 640, cy: 450, s: view.width / PAGE.width } },
    { at: b(0.12), cam: fitBox(box(60, 150, 850, 180), view, 20) },
  ],
  highlights: (b) => [{ box: box(67, 160, 836, 70), from: b(0.25) }],
};

export const GUARD: Feature = {
  tag: "CHỐNG SAI SÓT",
  title: "Trợ lý gác cổng",
  subtitle: "Chỉ báo lỗi, không tự sửa",
  src: "kitviet/guide-7200.png",
  window: ["Kit Việt", "Trợ lý xếp theo quyền"],
  seg: "p7",
  keys: (view, b) => [
    { at: 0, cam: fitBox(box(104, 120, 1072, 700), view, 10) },
    { at: b(0.15), cam: fitBox(box(915, 130, 270, 460), view, 20) },
  ],
  highlights: (b) => [
    { box: box(923, 138, 253, 64), from: b(0.2) },
    { box: box(923, 234, 253, 176), from: b(0.6) },
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
            <div style={{ fontSize: 40 * k, fontWeight: 700, letterSpacing: 4 * k, color: BRAND.red, ...rise(enter(0), 30) }}>{feature.tag}</div>
            <div style={{ fontSize: 96 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05, marginTop: 14 * k, ...rise(enter(4)) }}>
              {feature.title}
            </div>
          </div>
        }
        media={(b) => (
          <div style={rise(enter(6), 120)}>
            <ScreenCard
              src={feature.src}
              page={PAGE}
              view={viewOf(b)}
              keys={feature.keys(viewOf(b), at)}
              highlights={feature.highlights(at)}
              accent={BRAND.red}
              header={<WindowTitle title={feature.window[0]} sub={feature.window[1]} />}
            />
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 46 * k, ...rise(enter(16), 40) }}>
            <CheckIcon size={54 * k} color={BRAND.red} />
            {feature.subtitle}
          </Pill>
        }
      />
    </Scene>
  );
};

// ---------- P6: luồng bảng lương ----------
const Glyph: React.FC<{ d: string; size: number; color: string }> = ({ d, size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const STEPS = [
  { label: "Duyệt tham số", d: "M4 6h16M4 12h10M4 18h7M17 15l2 2 3-4", at: 0.05 },
  { label: "Kiểm chéo", d: "M4 12l5 5L20 6", at: 0.32 },
  { label: "Che thông tin", d: "M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6zM4 20L20 4", at: 0.58 },
  { label: "File .xlsx", d: "M6 3h9l4 4v14H6zM9 10l5 6M14 10l-5 6", at: 0.85 },
];

export const Flow: React.FC = () => {
  const L = useLayout();
  const { k } = L;
  const enter = useEnter();
  const frame = useCurrentFrame();
  const active = STEPS.reduce((a, s, i) => (frame >= beat("p6", s.at) ? i : a), 0);
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${200 * k}px ${L.pad}px`, gap: 70 * k }}>
        <div style={rise(enter(0))}>
          <div style={{ fontSize: 40 * k, fontWeight: 700, letterSpacing: 4 * k, color: BRAND.red }}>AI LÀM GÌ</div>
          <div style={{ fontSize: 96 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05, marginTop: 14 * k }}>
            Bạn duyệt <GradientText>từng bước</GradientText>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 26 * k }}>
          {STEPS.map((s, i) => {
            const e = enter(beat("p6", s.at));
            const on = i === active;
            return (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 30 * k, opacity: e, transform: `translateX(${interpolate(e, [0, 1], [80, 0])}px)` }}>
                <StepDot icon={<Glyph d={s.d} size={70 * k} color={on ? "#0A0D16" : C.text} />} label="" color={BRAND.red} active={on} size={130} />
                <div style={{ fontSize: 62 * k, fontWeight: 800, color: on ? C.text : C.muted }}>
                  {i + 1}. {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P8: 26 nền tảng ----------
const PLATFORMS = [
  { at: 0.08, label: "Claude" },
  { at: 0.2, label: "Codex" },
  { at: 0.32, label: "Cursor" },
  { at: 0.44, label: "Gemini" },
  { at: 0.56, label: "Copilot" },
  { at: 0.64, label: "Windsurf" },
  { at: 0.72, label: "+20 nữa" },
];

export const Platforms: React.FC = () => {
  const L = useLayout();
  const { k } = L;
  const frame = useCurrentFrame();
  const enter = useEnter();
  const n = interpolate(frame, [beat("p8", 0.5), beat("p8", 0.85)], [0, 26], ease);
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${200 * k}px ${L.pad}px`, gap: 50 * k }}>
        <div style={rise(enter(0))}>
          <div style={{ fontSize: 300 * k, fontWeight: 900, lineHeight: 0.95, letterSpacing: -10 * k, fontVariantNumeric: "tabular-nums" }}>
            <GradientText>{Math.round(n)}</GradientText>
          </div>
          <div style={{ fontSize: 80 * k, fontWeight: 900, marginTop: 10 * k }}>nền tảng AI</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 22 * k }}>
          {PLATFORMS.map((p) => {
            const e = enter(beat("p8", p.at));
            return (
              <div
                key={p.label}
                style={{
                  padding: `${28 * k}px ${40 * k}px`,
                  borderRadius: 28 * k,
                  background: "rgba(255,255,255,0.05)",
                  border: `2px solid ${p.label.startsWith("+") ? BRAND.gold : "rgba(255,255,255,0.12)"}`,
                  fontSize: 54 * k,
                  fontWeight: 700,
                  opacity: e,
                  transform: `scale(${interpolate(e, [0, 1], [0.6, 1])})`,
                }}
              >
                {p.label}
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
  const cmd = "npx github:mochistudio-vn/kitviet init ke-toan --ai claude";
  const typed = Math.round(interpolate(frame, [6, beat("p9", 0.4)], [0, cmd.length], ease));
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: `0 ${L.pad}px ${220 * k}px` }}>
        <Logo size={200 * k} style={{ ...rise(enter(0), 30) }} />
        <div style={{ fontSize: 44 * k, fontWeight: 700, color: C.muted, marginTop: 40 * k, ...rise(enter(2), 30) }}>Cài bằng 1 dòng lệnh:</div>
        <div
          style={{
            marginTop: 26 * k,
            width: "100%",
            padding: `${34 * k}px`,
            borderRadius: 28 * k,
            background: "#0D1117",
            border: `2px solid ${BRAND.red}66`,
            fontFamily: "monospace",
            fontSize: 38 * k,
            color: "#E6EDF3",
            textAlign: "left",
            lineHeight: 1.4,
            minHeight: 150 * k,
            ...rise(enter(4), 40),
          }}
        >
          <span style={{ color: BRAND.gold }}>$ </span>
          {cmd.slice(0, typed)}
          <span style={{ opacity: frame % 30 < 15 ? 1 : 0 }}>▍</span>
        </div>
        <div style={{ fontSize: 120 * k, fontWeight: 900, lineHeight: 1.08, marginTop: 70 * k, letterSpacing: -3 * k, ...rise(enter(beat("p9", 0.45))) }}>
          Lưu lại
          <br />
          <GradientText>& thử ngay!</GradientText>
        </div>
        <Pill k={k} style={{ alignSelf: "center", marginTop: 60 * k, fontSize: 40 * k, fontWeight: 500, ...rise(enter(beat("p9", 0.55)), 30) }}>
          <GithubIcon size={46 * k} />
          {REPO_URL}
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};
