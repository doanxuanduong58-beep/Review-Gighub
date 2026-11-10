import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HEADER_H, ScreenCard, UrlBar, type Box, type CamKey, type Size } from "../components/ScreenCard";
import { Bokeh } from "../components/fx";
import { SplitLayout, useLayout } from "../components/layout";
import { SubscribeScene } from "../components/subscribe";
import { Background, C, CheckIcon, StarIcon, fontFamily, useExit } from "../components/ui";
import REPO_SHOT from "../../public/k12skills/repo.json";
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
const Num: React.FC<{ k: number; n: number; color?: string }> = ({ k, n, color = BRAND.main }) => (
  <div style={{ width: 92 * k, height: 92 * k, borderRadius: 46 * k, background: color, color: "#1A0F08", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56 * k, fontWeight: 900, flexShrink: 0 }}>{n}</div>
);

const Icon: React.FC<{ d: string; size: number; color?: string }> = ({ d, size, color = BRAND.main }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);
const ICONS = {
  plan: "M8 2v4M16 2v4M3 9h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  tiers: "M3 20h4V12H3zM10 20h4V7h-4zM17 20h4V3h-4z",
  check: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  prep: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  warn: "M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01",
  printer: "M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z",
};

// Tờ giấy trắng (tài liệu) dùng chung.
const Paper: React.FC<{ k: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ k, children, style }) => (
  <div style={{ background: "#FBFAF7", color: "#1F2937", borderRadius: 22 * k, boxShadow: "0 30px 90px rgba(0,0,0,0.5)", padding: `${36 * k}px ${40 * k}px`, ...style }}>{children}</div>
);

// ---------- P1: hook — 40 em, 3 trình độ ----------
const TIER_COLORS = [BRAND.alt, BRAND.green, BRAND.purple];
export const Hook: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const split = interpolate(frame, [30, 60], [0, 1], ease);
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 200 * k, textAlign: "center" }}>
        <div style={{ position: "relative", width: 900 * k, height: 760 * k }}>
          {Array.from({ length: 40 }, (_, i) => {
            const tier = i % 3;
            const col = i % 8, row = Math.floor(i / 8);
            const gx = 120 * k + col * 95 * k, gy = 120 * k + row * 105 * k;
            // sau khi tách: 3 cột theo trình độ
            const idx = Math.floor(i / 3);
            const tx = 78 * k + tier * 300 * k + (idx % 3) * 70 * k, ty = 60 * k + Math.floor(idx / 3) * 120 * k;
            const p = enter(i * 0.6, 14);
            const x = interpolate(split, [0, 1], [gx, tx]);
            const y = interpolate(split, [0, 1], [gy, ty]);
            const color = split > 0.05 ? TIER_COLORS[tier] : "#CBD5E1";
            return <div key={i} style={{ position: "absolute", left: x, top: y, width: 62 * k, height: 62 * k, borderRadius: 31 * k, background: color, transform: `scale(${p})`, boxShadow: `0 0 20px ${color}55` }} />;
          })}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "space-around", opacity: split, fontSize: 40 * k, fontWeight: 800 }}>
            <span style={{ color: BRAND.alt }}>Dưới chuẩn</span>
            <span style={{ color: BRAND.green }}>Đạt chuẩn</span>
            <span style={{ color: BRAND.purple }}>Nâng cao</span>
          </div>
        </div>
        <div style={{ fontSize: 100 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.08, marginTop: 40 * k, ...rise(enter(2)) }}>
          40 em · <Grad>3 trình độ</Grad>
          <br />
          soạn sao kịp?
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P2: thiếu giờ ----------
const PILE = [
  { at: 0.02, label: "Soạn giáo án", icon: ICONS.plan, rot: -3 },
  { at: 0.2, label: "Chia bài theo trình độ", icon: ICONS.tiers, rot: 3 },
  { at: 0.4, label: "Kiểm tra em hiểu chưa", icon: ICONS.check, rot: -2 },
];
export const Busy: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const bar = interpolate(frame, [beat("p2", 0.3), beat("p2", 0.9)], [1, 0.12], ease);
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${210 * k}px ${60 * k}px`, gap: 50 * k }}>
        <Title k={k} p={enter(0)} size={96}>
          Ngày nào cũng
          <br />
          <Grad>thiếu giờ</Grad>
        </Title>
        <div style={{ position: "relative", height: 560 * k }}>
          {PILE.map((c, i) => {
            const p = enter(beat("p2", c.at), 12);
            return (
              <div key={c.label} style={{ position: "absolute", left: 30 * k, right: 30 * k, bottom: i * 170 * k, display: "flex", alignItems: "center", gap: 30 * k, padding: `${38 * k}px ${44 * k}px`, borderRadius: 28 * k, background: "#1A2030", border: `2px solid ${BRAND.main}55`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", fontSize: 56 * k, fontWeight: 800, opacity: Math.min(1, p * 2), transform: `translateY(${interpolate(p, [0, 1], [-800, 0])}px) rotate(${c.rot}deg)` }}>
                <Icon d={c.icon} size={66 * k} />
                {c.label}
              </div>
            );
          })}
        </div>
        <div style={rise(enter(beat("p2", 0.3)), 30)}>
          <div style={{ fontSize: 42 * k, fontWeight: 700, color: C.muted, marginBottom: 18 * k }}>Thời gian còn lại trong ngày</div>
          <div style={{ height: 40 * k, borderRadius: 20 * k, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ width: `${bar * 100}%`, height: "100%", borderRadius: 20 * k, background: bar < 0.35 ? "#F87171" : BRAND.ok }} />
          </div>
        </div>
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
  const stars = interpolate(frame, [beat("p3", 0.55), beat("p3", 0.85)], [0, 623], ease);
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: { cx: 640, cy: 330, s: view.width / 1280 } },
    { at: beat("p3", 0.5), cam: { cx: shot.star.x - 60, cy: shot.star.y + 14, s: 2.2 } },
  ];
  return (
    <Scene>
      <SplitLayout
        mediaFrac={0.32}
        head={
          <div>
            <div style={{ fontSize: 100 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.02, ...rise(enter(0)) }}>
              K12 <Grad>Teacher Skills</Grad>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18 * k, marginTop: 30 * k, fontSize: 46 * k, fontWeight: 800, ...rise(enter(beat("p3", 0.3))) }}>
              <span>Anthropic</span>
              <span style={{ color: BRAND.main }}>×</span>
              <span>Learning Commons</span>
            </div>
            <div style={{ fontSize: 36 * k, color: C.muted, fontWeight: 600, marginTop: 8 * k, ...rise(enter(beat("p3", 0.35))) }}>Công ty làm ra Claude · tổ chức giáo dục</div>
          </div>
        }
        media={(b) => (
          <div style={rise(enter(4), 120)}>
            <ScreenCard src={shot.file} page={{ width: 1280, height: 900 }} view={{ width: b.width, height: b.height - HEADER_H }} keys={keys({ width: b.width, height: b.height - HEADER_H })} highlights={[{ box: shot.star, from: beat("p3", 0.58) }]} accent={BRAND.main} header={<UrlBar url="github.com/anthropics/k12-teacher-skills" muted={C.muted} color={C.text} />} />
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

// ---------- P4: 4 kỹ năng ----------
const SKILLS = [
  { label: "Soạn giáo án", icon: ICONS.plan },
  { label: "Chia 3 mức trình độ", icon: ICONS.tiers },
  { label: "Kiểm tra nhanh (Toán)", icon: ICONS.check },
  { label: "Chuẩn bị bài", icon: ICONS.prep },
];
export const Four: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${220 * k}px ${60 * k}px`, gap: 30 * k }}>
        <Title k={k} p={enter(0)} size={100}>
          <Grad>4 kỹ năng</Grad> AI
        </Title>
        <div style={{ height: 20 * k }} />
        {SKILLS.map((s, i) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 30 * k, padding: `${30 * k}px ${36 * k}px`, borderRadius: 30 * k, background: "rgba(255,255,255,0.05)", border: `2px solid ${BRAND.main}55`, fontSize: 56 * k, fontWeight: 800, ...rise(enter(beat("p4", 0.1 + i * 0.15)), 60) }}>
            <Num k={k} n={i + 1} />
            {s.label}
            <div style={{ flex: 1 }} />
            <Icon d={s.icon} size={60 * k} />
          </div>
        ))}
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P5: soạn giáo án (nội dung lấy từ example_lesson.json) ----------
export const LessonPlan: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const ROWS = [
    ["Granola bars", "6 bars for $3.00", "8 bars for $3.60"],
    ["Juice", "4 bottles for $6.00", "5 bottles for $8.00"],
    ["Rice", "2-lb bag for $3.50", "5-lb bag for $8.00"],
  ];
  const tabs = ["Giáo án", "Phiếu học tập", "Mẫu quan sát"];
  const active = frame < beat("p5", 0.55) ? 0 : frame < beat("p5", 0.75) ? 1 : 2;
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${170 * k}px ${60 * k}px`, gap: 30 * k }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 * k, ...rise(enter(0)) }}>
          <Num k={k} n={1} />
          <div style={{ fontSize: 84 * k, fontWeight: 900, letterSpacing: -2 * k }}>
            Soạn <Grad>giáo án</Grad>
          </div>
        </div>
        <div style={{ display: "flex", gap: 14 * k, ...rise(enter(4), 20) }}>
          {tabs.map((t, i) => (
            <div key={t} style={{ padding: `${12 * k}px ${24 * k}px`, borderRadius: 999, fontSize: 36 * k, fontWeight: 800, background: i === active ? BRAND.main : "rgba(255,255,255,0.06)", color: i === active ? "#1A0F08" : C.text, border: `2px solid ${BRAND.main}88` }}>
              {t}
            </div>
          ))}
        </div>
        <Paper k={k} style={rise(enter(beat("p5", 0.1), 14), 80)}>
          <div style={{ fontSize: 30 * k, fontWeight: 700, color: "#6B7280" }}>Grade 6 · Mathematics · 50 min</div>
          <div style={{ fontSize: 44 * k, fontWeight: 900, marginTop: 8 * k }}>Unit rate — which deal is better?</div>
          <div style={{ fontSize: 28 * k, color: "#6B7280", marginTop: 4 * k }}>Standard 6.RP.A.2</div>
          <div style={{ marginTop: 22 * k, padding: `${18 * k}px ${22 * k}px`, borderRadius: 14 * k, background: "#FFF4EC", borderLeft: `${8 * k}px solid ${BRAND.main}`, fontSize: 32 * k, lineHeight: 1.4 }}>
            <b>Try this together:</b> Store A: 2 bottles for $3.00. Store B: 4 bottles for $5.00. Circle the better deal…
          </div>
          <div style={{ marginTop: 22 * k, borderRadius: 12 * k, overflow: "hidden", border: "2px solid #E5E7EB", fontSize: 28 * k }}>
            <div style={{ display: "flex", background: "#F3F4F6", fontWeight: 800 }}>
              {["Item", "FreshMart", "ValueGro"].map((h) => (
                <div key={h} style={{ flex: 1, padding: `${10 * k}px ${14 * k}px` }}>{h}</div>
              ))}
            </div>
            {ROWS.map((r, i) => (
              <div key={i} style={{ display: "flex", borderTop: "1px solid #E5E7EB", opacity: frame >= beat("p5", 0.3 + i * 0.1) ? 1 : 0 }}>
                {r.map((c, j) => (
                  <div key={j} style={{ flex: 1, padding: `${10 * k}px ${14 * k}px` }}>{c}</div>
                ))}
              </div>
            ))}
          </div>
        </Paper>
        <Note k={k} text="* Trích giáo án mẫu có sẵn trong repo (example_lesson.json)" />
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P6: chia 3 mức ----------
const TIERS = [
  { label: "Dưới chuẩn", sub: "Thêm gợi ý, chia nhỏ bước", color: BRAND.alt },
  { label: "Đạt chuẩn", sub: "Bài gốc", color: BRAND.green },
  { label: "Nâng cao", sub: "Thêm thử thách", color: BRAND.purple },
];
export const Tiers: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const spread = interpolate(frame, [beat("p6", 0.2), beat("p6", 0.45)], [0, 1], ease);
  return (
    <Scene accent={BRAND.alt}>
      <AbsoluteFill style={{ padding: `${170 * k}px ${60 * k}px`, gap: 40 * k }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 * k, ...rise(enter(0)) }}>
          <Num k={k} n={2} />
          <div style={{ fontSize: 84 * k, fontWeight: 900, letterSpacing: -2 * k }}>
            Chia <Grad>3 mức</Grad>
          </div>
        </div>
        <div style={{ position: "relative", height: 820 * k }}>
          {TIERS.map((t, i) => {
            const x = interpolate(spread, [0, 1], [300 * k, i * 320 * k]);
            const r = interpolate(spread, [0, 1], [0, (i - 1) * 4]);
            return (
              <div key={t.label} style={{ position: "absolute", left: x, top: 40 * k + i * 20 * k * (1 - spread), width: 320 * k, transform: `rotate(${r}deg)` }}>
                <Paper k={k} style={{ padding: `${26 * k}px ${24 * k}px`, borderTop: `${14 * k}px solid ${t.color}`, height: 600 * k }}>
                  <div style={{ fontSize: 36 * k, fontWeight: 900, color: t.color }}>{t.label}</div>
                  <div style={{ fontSize: 26 * k, color: "#6B7280", marginTop: 6 * k, minHeight: 70 * k }}>{t.sub}</div>
                  {[90, 75, 85, 60, 80, 50].map((w, j) => (
                    <div key={j} style={{ height: 16 * k, borderRadius: 8 * k, background: j === 0 ? `${t.color}55` : "#E5E7EB", marginTop: 26 * k, width: `${w}%` }} />
                  ))}
                </Paper>
              </div>
            );
          })}
        </div>
        <Pill k={k} style={{ fontSize: 44 * k, marginTop: -60 * k, ...rise(enter(beat("p6", 0.65)), 30) }}>
          <CheckIcon size={52 * k} color={BRAND.ok} />
          Giữ nguyên nội dung cốt lõi
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P7: kiểm tra nhanh môn Toán ----------
const OPTS = [
  { t: "A. $1.50 mỗi chai", ok: true },
  { t: "B. $3.00 mỗi chai", why: "nhầm tổng tiền với giá 1 chai" },
  { t: "C. $0.67 mỗi chai", why: "chia ngược số chai cho số tiền" },
];
export const Check: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  return (
    <Scene accent={BRAND.purple}>
      <AbsoluteFill style={{ padding: `${170 * k}px ${60 * k}px`, gap: 30 * k }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 * k, ...rise(enter(0)) }}>
          <Num k={k} n={3} />
          <div style={{ fontSize: 80 * k, fontWeight: 900, letterSpacing: -2 * k }}>
            Kiểm tra <Grad>nhanh</Grad>
          </div>
        </div>
        <Paper k={k} style={rise(enter(6), 60)}>
          <div style={{ fontSize: 40 * k, fontWeight: 800, lineHeight: 1.35 }}>Cửa hàng A bán 2 chai nước giá $3.00. Giá một chai là bao nhiêu?</div>
          {OPTS.map((o, i) => (
            <div key={o.t} style={{ marginTop: 22 * k, padding: `${18 * k}px ${22 * k}px`, borderRadius: 14 * k, border: `3px solid ${o.ok ? "#22C55E" : "#E5E7EB"}`, background: o.ok ? "#ECFDF5" : "#fff", ...rise(enter(beat("p7", 0.2 + i * 0.12)), 20) }}>
              <div style={{ fontSize: 38 * k, fontWeight: 800 }}>{o.t}</div>
              {o.why && (
                <div style={{ marginTop: 8 * k, display: "inline-block", padding: `${4 * k}px ${16 * k}px`, borderRadius: 999, background: "#FEF3C7", color: "#92400E", fontSize: 28 * k, fontWeight: 800, opacity: enter(beat("p7", 0.6 + i * 0.08)) }}>
                  Lỗi sai thường gặp: {o.why}
                </div>
              )}
            </div>
          ))}
        </Paper>
        <Note k={k} text="* Ví dụ minh hoạ · kỹ năng này chỉ dành cho môn Toán" />
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P8: chuẩn bị bài ----------
export const Prep: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const bubble = (who: "ai" | "me", text: string, p: number) => (
    <div style={{ display: "flex", justifyContent: who === "me" ? "flex-end" : "flex-start", ...rise(p, 30) }}>
      <div style={{ maxWidth: "84%", padding: `${22 * k}px ${30 * k}px`, borderRadius: 30 * k, background: who === "me" ? BRAND.main : "rgba(255,255,255,0.08)", color: who === "me" ? "#1A0F08" : C.text, border: who === "me" ? "none" : "2px solid rgba(255,255,255,0.12)", fontSize: 38 * k, fontWeight: who === "me" ? 700 : 500, lineHeight: 1.35 }}>{text}</div>
    </div>
  );
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${170 * k}px ${60 * k}px`, gap: 26 * k }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 * k, ...rise(enter(0)) }}>
          <Num k={k} n={4} />
          <div style={{ fontSize: 80 * k, fontWeight: 900, letterSpacing: -2 * k }}>
            Chuẩn bị <Grad>bài</Grad>
          </div>
        </div>
        {bubble("ai", "Cô thử làm bài chính của tiết học trước nhé. Em nào dễ sai ở bước nào?", enter(beat("p8", 0.1)))}
        {bubble("me", "Chắc các em sẽ so tổng tiền thay vì giá một chai.", enter(beat("p8", 0.3)))}
        <Paper k={k} style={{ ...rise(enter(beat("p8", 0.5), 14), 60), padding: `${26 * k}px ${32 * k}px` }}>
          <div style={{ fontSize: 36 * k, fontWeight: 900 }}>Ghi chú chuẩn bị</div>
          <div style={{ fontSize: 28 * k, color: "#6B7280" }}>200–300 chữ · chỉ dành cho cô</div>
          {[85, 70, 90, 55].map((w, j) => (
            <div key={j} style={{ height: 14 * k, borderRadius: 7 * k, background: "#E5E7EB", marginTop: 20 * k, width: `${w}%` }} />
          ))}
        </Paper>
        <Note k={k} text="* Ví dụ minh hoạ" />
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P9: file Word ----------
export const Word: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  return (
    <Scene accent={BRAND.alt}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 280 * k, gap: 60 * k, textAlign: "center" }}>
        <Title k={k} p={enter(0)} size={104}>
          File <Grad>Word</Grad>
          <br />
          in được ngay
        </Title>
        <div style={{ display: "flex", gap: 30 * k }}>
          {["Giáo án", "Phiếu HS", "Quan sát"].map((t, i) => {
            const p = enter(beat("p9", 0.15 + i * 0.12), 12);
            return (
              <div key={t} style={{ width: 250 * k, height: 320 * k, borderRadius: 22 * k, background: "#F5F7FB", position: "relative", boxShadow: "0 24px 60px rgba(0,0,0,0.45)", opacity: p, transform: `translateY(${interpolate(p, [0, 1], [160, Math.sin((frame + i * 20) / 18) * 8])}px)` }}>
                <div style={{ position: "absolute", left: 24 * k, top: 30 * k, padding: `${8 * k}px ${16 * k}px`, borderRadius: 10 * k, background: "#2B579A", color: "#fff", fontSize: 40 * k, fontWeight: 900 }}>.docx</div>
                {[0, 1, 2].map((r) => (
                  <div key={r} style={{ position: "absolute", left: 24 * k, top: (130 + r * 40) * k, width: (r === 2 ? 120 : 190) * k, height: 16 * k, borderRadius: 8 * k, background: "#D9DEE8" }} />
                ))}
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 22 * k, fontSize: 34 * k, fontWeight: 800, color: "#1F2937" }}>{t}</div>
              </div>
            );
          })}
        </div>
        <div style={{ ...rise(enter(beat("p9", 0.55)), 30) }}>
          <Icon d={ICONS.printer} size={140 * k} color={BRAND.alt} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P10: lưu ý chương trình Mỹ ----------
export const Caveat: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const msg = "Soạn theo chương trình GDPT 2018 của Việt Nam, trả lời bằng tiếng Việt nhé.";
  const typed = msg.slice(0, Math.round(interpolate(frame, [beat("p10", 0.45), beat("p10", 0.85)], [0, msg.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  return (
    <Scene accent={BRAND.warn}>
      <AbsoluteFill style={{ padding: `${200 * k}px ${60 * k}px`, gap: 40 * k }}>
        <Tag k={k} p={enter(0)} color={BRAND.warn}>LƯU Ý QUAN TRỌNG</Tag>
        <div style={{ display: "flex", alignItems: "center", gap: 26 * k, padding: `${32 * k}px ${36 * k}px`, borderRadius: 30 * k, background: "rgba(251,191,36,0.1)", border: "3px solid rgba(251,191,36,0.6)", ...rise(enter(4)) }}>
          <Icon d={ICONS.warn} size={76 * k} color={BRAND.warn} />
          <div>
            <div style={{ fontSize: 54 * k, fontWeight: 900 }}>Chuẩn kiến thức của Mỹ</div>
            <div style={{ fontSize: 36 * k, fontWeight: 600, color: C.muted }}>Toán, Ngữ văn Anh, Khoa học, Xã hội</div>
          </div>
        </div>
        <Title k={k} p={enter(beat("p10", 0.3))} size={84}>
          Cô dặn thêm <Grad>một câu</Grad>
        </Title>
        <div style={{ display: "flex", justifyContent: "flex-end", opacity: enter(beat("p10", 0.4)) }}>
          <div style={{ maxWidth: "90%", padding: `${28 * k}px ${34 * k}px`, borderRadius: 34 * k, borderBottomRightRadius: 8 * k, background: BRAND.main, color: "#1A0F08", fontSize: 44 * k, fontWeight: 700, lineHeight: 1.4, minHeight: 120 * k }}>
            {typed}
            {typed.length < msg.length && <span style={{ opacity: 0.6 }}>▍</span>}
          </div>
        </div>
        <Note k={k} text="* Mẹo của kênh, chưa kiểm chứng kết quả với chương trình Việt Nam" />
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P11: cài ở đâu ----------
export const Where: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const card = (title: string, sub: string, color: string, p: number) => (
    <div style={{ padding: `${40 * k}px ${44 * k}px`, borderRadius: 32 * k, background: `${color}14`, border: `3px solid ${color}AA`, ...rise(p, 60) }}>
      <div style={{ fontSize: 50 * k, fontWeight: 900, whiteSpace: "nowrap" }}>{title}</div>
      <div style={{ fontSize: 38 * k, fontWeight: 600, color: C.muted, marginTop: 8 * k }}>{sub}</div>
    </div>
  );
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${240 * k}px ${60 * k}px`, gap: 40 * k }}>
        <Title k={k} p={enter(0)} size={100}>
          Dùng <Grad>ở đâu?</Grad>
        </Title>
        <div style={{ height: 10 * k }} />
        {card("Cài vào Claude", "Mã nguồn mở · Apache-2.0", BRAND.main, enter(beat("p11", 0.15)))}
        {card("Có sẵn trong Claude for Teachers", "Gói Claude dành cho giáo viên", BRAND.alt, enter(beat("p11", 0.5)))}
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
        <div style={{ fontSize: 110 * k, fontWeight: 900, letterSpacing: -3 * k, transform: `scale(${enter(0, 10) * pulse})` }}>
          K12 <Grad>Teacher Skills</Grad>
        </div>
        <div style={{ fontSize: 124 * k, fontWeight: 900, lineHeight: 1.08, marginTop: 80 * k, letterSpacing: -3 * k, ...rise(enter(8)) }}>
          Lưu lại
          <br />
          <Grad>& thử ngay!</Grad>
        </div>
        <Pill k={k} style={{ alignSelf: "center", marginTop: 70 * k, fontSize: 38 * k, fontWeight: 600, ...rise(enter(18), 30) }}>
          <svg width={50 * k} height={50 * k} viewBox="0 0 24 24" fill={C.text} style={{ flexShrink: 0 }}>
            <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
          </svg>
          github.com/anthropics/k12-teacher-skills
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P13: theo dõi + câu hỏi ----------
export const Subscribe: React.FC = () => (
  <SubscribeScene question={"Cô muốn AI giúp\nsoạn môn gì nhất?"} accent={BRAND.main} btnAt={beat("p13", 0.25)} label="+ Theo dõi kênh" />
);
