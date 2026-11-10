import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HEADER_H, ScreenCard, UrlBar, fitBox, type Box, type CamKey, type Size } from "../components/ScreenCard";
import { Bokeh, GrowArrow, StepDot } from "../components/fx";
import { SplitLayout, useLayout } from "../components/layout";
import { SubscribeScene } from "../components/subscribe";
import { Background, C, CheckIcon, fontFamily, useExit } from "../components/ui";
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
  <div style={{ fontSize: size * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.08, marginTop: 14 * k, ...rise(p) }}>{children}</div>
);
const Note: React.FC<{ k: number; text?: string }> = ({ k, text = "* Ví dụ minh hoạ" }) => (
  <div style={{ fontSize: 30 * k, fontWeight: 500, color: C.muted, fontStyle: "italic" }}>{text}</div>
);

const Icon: React.FC<{ d: string; size: number; color?: string }> = ({ d, size, color = BRAND.main }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);
const ICONS = {
  doc: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5",
  plan: "M8 2v4M16 2v4M3 9h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  msg: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  ai: "M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4z",
  check: "M20 6L9 17l-5-5",
  save: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
  warn: "M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01",
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
};

const box = (x: number, y: number, width: number, height: number): Box => ({ x, y, width, height });
const viewOf = (b: Size): Size => ({ width: b.width, height: b.height - HEADER_H });

// ---------- P1: hook — 30 phiếu quan sát tới khuya ----------
export const Hook: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const n = Math.round(interpolate(frame, [4, 60], [1, 30], ease));
  const late = frame >= 50;
  return (
    <Scene accent={BRAND.alt}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 200 * k, textAlign: "center" }}>
        <div style={{ position: "relative", width: 620 * k, height: 720 * k }}>
          {Array.from({ length: 8 }, (_, i) => {
            const p = enter(i * 6, 14);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 60 * k + (i % 2 ? 14 : -10) * k,
                  bottom: i * 34 * k,
                  width: 500 * k,
                  height: 620 * k,
                  borderRadius: 22 * k,
                  background: "#F5F7FB",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                  opacity: p,
                  transform: `translateY(${interpolate(p, [0, 1], [-400, 0])}px) rotate(${(i % 3) - 1 * 2}deg)`,
                  padding: 40 * k,
                  textAlign: "left",
                  color: "#1F2937",
                }}
              >
                <div style={{ fontSize: 40 * k, fontWeight: 900 }}>Phiếu quan sát</div>
                {[0, 1, 2, 3, 4, 5].map((r) => (
                  <div key={r} style={{ height: 18 * k, borderRadius: 9 * k, background: "#D9DEE8", marginTop: 34 * k, width: `${90 - r * 9}%` }} />
                ))}
              </div>
            );
          })}
          <div style={{ position: "absolute", right: -20 * k, top: -40 * k, width: 230 * k, height: 230 * k, borderRadius: 115 * k, background: BRAND.alt, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: `0 0 60px ${BRAND.alt}88`, color: "#2A0A12" }}>
            <div style={{ fontSize: 110 * k, fontWeight: 900, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{n}</div>
            <div style={{ fontSize: 34 * k, fontWeight: 800 }}>phiếu</div>
          </div>
        </div>
        <div style={{ fontSize: 96 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.08, marginTop: 50 * k, ...rise(enter(4)) }}>
          Viết tới <span style={{ color: late ? BRAND.alt : C.text }}>{late ? "23:00" : "22:5" + Math.min(9, Math.floor(frame / 6))}</span>
          <br />
          <Grad>vẫn chưa xong?</Grad>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P2: giấy tờ chồng chất ----------
const PILE = [
  { at: 0.02, label: "Kế hoạch hoạt động", icon: ICONS.plan, rot: -3 },
  { at: 0.2, label: "Nhận xét từng bé", icon: ICONS.eye, rot: 3 },
  { at: 0.38, label: "Tin nhắn phụ huynh", icon: ICONS.msg, rot: -2 },
];
export const Paperwork: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const bar = interpolate(frame, [beat("p2", 0.3), beat("p2", 0.9)], [1, 0.15], ease);
  return (
    <Scene accent={BRAND.alt}>
      <AbsoluteFill style={{ padding: `${210 * k}px ${60 * k}px`, gap: 50 * k }}>
        <Title k={k} p={enter(0)} size={92}>
          Giấy tờ <Grad>nhiều hơn</Grad>
          <br />
          giờ chơi với trẻ
        </Title>
        <div style={{ position: "relative", height: 560 * k }}>
          {PILE.map((c, i) => {
            const p = enter(beat("p2", c.at), 12);
            return (
              <div key={c.label} style={{ position: "absolute", left: 30 * k, right: 30 * k, bottom: i * 170 * k, display: "flex", alignItems: "center", gap: 30 * k, padding: `${38 * k}px ${44 * k}px`, borderRadius: 28 * k, background: "#1A2030", border: `2px solid ${BRAND.main}55`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", fontSize: 58 * k, fontWeight: 800, opacity: Math.min(1, p * 2), transform: `translateY(${interpolate(p, [0, 1], [-800, 0])}px) rotate(${c.rot}deg)` }}>
                <Icon d={c.icon} size={66 * k} />
                {c.label}
              </div>
            );
          })}
        </div>
        <div style={rise(enter(beat("p2", 0.3)), 30)}>
          <div style={{ fontSize: 42 * k, fontWeight: 700, color: C.muted, marginBottom: 18 * k }}>Thời gian chơi với trẻ</div>
          <div style={{ height: 40 * k, borderRadius: 20 * k, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ width: `${bar * 100}%`, height: "100%", borderRadius: 20 * k, background: bar < 0.35 ? BRAND.bad : BRAND.ok }} />
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P3: giới thiệu ----------
export const Intro: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: { cx: 640, cy: 330, s: view.width / 1280 } },
    { at: beat("p3", 0.45), cam: fitBox(box(960, 250, 320, 140), view, 10) },
  ];
  return (
    <Scene>
      <SplitLayout
        mediaFrac={0.34}
        head={
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 30 * k, ...rise(enter(0)) }}>
              <div style={{ width: 150 * k, height: 150 * k, borderRadius: 40 * k, background: `${BRAND.main}22`, border: `3px solid ${BRAND.main}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon d={ICONS.ai} size={90 * k} />
              </div>
              <div style={{ fontSize: 100 * k, fontWeight: 900, letterSpacing: -3 * k }}>
                <Grad>EasyTeaching</Grad>
              </div>
            </div>
            <div style={{ fontSize: 52 * k, fontWeight: 800, marginTop: 30 * k, lineHeight: 1.25, ...rise(enter(beat("p3", 0.3))) }}>Trợ lý AI cho giáo viên mầm non</div>
            <div style={{ fontSize: 38 * k, fontWeight: 500, color: C.muted, marginTop: 8 * k, ...rise(enter(beat("p3", 0.4))) }}>Mã nguồn mở · Giấy phép MIT</div>
          </div>
        }
        media={(b) => (
          <div style={rise(enter(4), 120)}>
            <ScreenCard
              src="easyteach/repo.png"
              page={{ width: 1280, height: 900 }}
              view={viewOf(b)}
              keys={keys(viewOf(b))}
              highlights={[{ box: box(976, 300, 260, 70), from: beat("p3", 0.55) }]}
              accent={BRAND.main}
              header={<UrlBar url="github.com/MengC-OvO/easy-teaching" muted={C.muted} color={C.text} />}
            />
          </div>
        )}
      />
    </Scene>
  );
};

// ---------- P4: kể vắn tắt → AI soạn nháp ----------
const Bubble: React.FC<{ k: number; text: string; p: number }> = ({ k, text, p }) => (
  <div style={{ display: "flex", justifyContent: "flex-end", ...rise(p, 40) }}>
    <div style={{ maxWidth: "86%", padding: `${28 * k}px ${36 * k}px`, borderRadius: 36 * k, borderBottomRightRadius: 8 * k, background: BRAND.main, color: "#06231F", fontSize: 42 * k, fontWeight: 700, lineHeight: 1.4 }}>{text}</div>
  </div>
);
const DRAFT = [
  ["Hoạt động", "Xếp khối, góc xây dựng"],
  ["Bé làm được", "Xếp tháp 6 khối, đếm to từng khối"],
  ["Gợi ý tiếp", "Thử xếp theo màu, đếm đến 10"],
];
export const Draft: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${170 * k}px ${60 * k}px`, gap: 36 * k }}>
        <Tag k={k} p={enter(0)}>CÔ KỂ VẮN TẮT</Tag>
        <Title k={k} p={enter(4)} size={88}>
          AI <Grad>soạn nháp</Grad> giúp cô
        </Title>
        <Bubble k={k} p={enter(8)} text="Bé An hôm nay tự xếp tháp 6 khối, vừa xếp vừa đếm to." />
        <div style={{ padding: `${34 * k}px ${40 * k}px`, borderRadius: 32 * k, background: "rgba(255,255,255,0.06)", border: `2px solid ${BRAND.main}66`, ...rise(enter(beat("p4", 0.3)), 60) }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 * k }}>
            <div style={{ fontSize: 46 * k, fontWeight: 900 }}>Phiếu quan sát</div>
            <div style={{ padding: `${8 * k}px ${22 * k}px`, borderRadius: 999, background: `${BRAND.warn}22`, border: `2px solid ${BRAND.warn}`, color: BRAND.warn, fontSize: 32 * k, fontWeight: 800 }}>BẢN NHÁP</div>
          </div>
          {DRAFT.map(([h, v], i) => {
            const show = frame >= beat("p4", 0.38 + i * 0.12);
            return (
              <div key={h} style={{ display: "flex", gap: 20 * k, padding: `${16 * k}px 0`, borderTop: "1px solid rgba(255,255,255,0.1)", opacity: show ? 1 : 0.15 }}>
                <div style={{ width: 250 * k, flexShrink: 0, fontSize: 36 * k, fontWeight: 800, color: BRAND.main }}>{h}</div>
                <div style={{ fontSize: 38 * k, fontWeight: 600 }}>{v}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 18 * k, ...rise(enter(beat("p4", 0.75)), 30) }}>
          {["Kế hoạch hoạt động", "Tin nhắn phụ huynh"].map((t) => (
            <div key={t} style={{ padding: `${12 * k}px ${24 * k}px`, borderRadius: 999, background: `${BRAND.main}1F`, border: `2px solid ${BRAND.main}88`, fontSize: 36 * k, fontWeight: 700 }}>
              + {t}
            </div>
          ))}
        </div>
        <Note k={k} />
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P5: có trích dẫn nguồn ----------
export const Citations: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  return (
    <Scene accent={BRAND.alt}>
      <AbsoluteFill style={{ padding: `${230 * k}px ${60 * k}px`, gap: 44 * k }}>
        <Title k={k} p={enter(0)} size={96}>
          Có <Grad>trích dẫn nguồn</Grad>
        </Title>
        <div style={{ padding: `${36 * k}px ${40 * k}px`, borderRadius: 32 * k, background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.14)", fontSize: 42 * k, lineHeight: 1.5, ...rise(enter(6), 60) }}>
          <div style={{ fontSize: 30 * k, fontWeight: 800, color: BRAND.main, marginBottom: 10 * k }}>Trợ lý AI</div>
          Học qua chơi là trọng tâm của chương trình: trẻ khám phá, thử nghiệm và giải quyết vấn đề khi chơi…
          <div style={{ display: "flex", gap: 16 * k, marginTop: 24 * k, flexWrap: "wrap" }}>
            {["Nguồn: EYLF", "Nguồn: NQS", "Quy định trường"].map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 * k, padding: `${10 * k}px ${22 * k}px`, borderRadius: 14 * k, background: `${BRAND.main}22`, border: `2px solid ${BRAND.main}`, fontSize: 34 * k, fontWeight: 800, ...rise(enter(beat("p5", 0.35 + i * 0.13)), 20) }}>
                <Icon d={ICONS.doc} size={36 * k} />
                {s}
              </div>
            ))}
          </div>
        </div>
        <Note k={k} text="* Ví dụ minh hoạ · EYLF, NQS là khung chương trình mầm non của Úc" />
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P6: AI soạn → cô duyệt → lưu ----------
const STEPS = [
  { at: 0.15, label: "AI soạn nháp", icon: ICONS.ai },
  { at: 0.5, label: "Cô duyệt", icon: ICONS.check },
  { at: 0.75, label: "Mới được lưu", icon: ICONS.save },
];
export const Approval: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const pulse = 1 + Math.sin(frame / 5) * 0.05;
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${250 * k}px ${50 * k}px`, gap: 100 * k, alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <Tag k={k} p={enter(0)}>ĐIỂM HAY NHẤT</Tag>
          <Title k={k} p={enter(4)} size={100}>
            <Grad>Cô quyết định</Grad>
          </Title>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 * k }}>
          {STEPS.map((s, i) => {
            const p = enter(beat("p6", s.at) - 8, 14);
            const active = frame >= beat("p6", s.at) && (i === 2 || frame < beat("p6", STEPS[i + 1].at));
            return (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10 * k }}>
                {i > 0 && <GrowArrow w={80 * k} color={BRAND.main} p={interpolate(frame, [beat("p6", s.at) - 12, beat("p6", s.at)], [0, 1], ease)} />}
                <div style={{ opacity: p, transform: `scale(${interpolate(p, [0, 1], [0.6, 1])})` }}>
                  <StepDot icon={<Icon d={s.icon} size={86 * k} color={active ? "#06231F" : BRAND.main} />} label={s.label} color={BRAND.main} active={active} size={190} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: `${30 * k}px ${80 * k}px`, borderRadius: 999, background: BRAND.ok, color: "#052E16", fontSize: 64 * k, fontWeight: 900, boxShadow: `0 0 60px ${BRAND.ok}66`, transform: `scale(${frame >= beat("p6", 0.5) ? pulse : 0.9})`, opacity: enter(beat("p6", 0.45)) }}>
          ✓ Duyệt
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P7: những điều AI không được làm ----------
const TABLE = box(65, 114, 830, 184);
const L3 = box(65, 262, 830, 37);
export const Boundaries: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: fitBox(TABLE, view, 10) },
    { at: beat("p7", 0.55), cam: fitBox(box(65, 230, 830, 120), view, 10) },
  ];
  return (
    <Scene accent={BRAND.bad}>
      <SplitLayout
        mediaFrac={0.26}
        head={
          <div>
            <Tag k={k} p={enter(0)} color={BRAND.bad}>RANH GIỚI AN TOÀN</Tag>
            <Title k={k} p={enter(4)} size={88}>
              AI <span style={{ color: BRAND.bad }}>không được</span>
            </Title>
          </div>
        }
        media={(b) => (
          <div style={rise(enter(6), 120)}>
            <ScreenCard src="easyteach/safe-4330.png" page={{ width: 1280, height: 900 }} view={viewOf(b)} keys={keys(viewOf(b))} highlights={[{ box: L3, from: beat("p7", 0.6) }]} accent={BRAND.bad} header={<div style={{ fontSize: 30, fontWeight: 700, color: C.text }}>README · Safety boundary</div>} />
          </div>
        )}
        foot={
          <div style={{ display: "flex", flexDirection: "column", gap: 20 * k }}>
            {["Chẩn đoán trẻ", "Tư vấn y tế", "Tự gửi tin cho phụ huynh"].map((t, i) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 22 * k, fontSize: 54 * k, fontWeight: 900, ...rise(enter(beat("p7", 0.08 + i * 0.22)), 30) }}>
                <div style={{ width: 70 * k, height: 70 * k, borderRadius: 35 * k, background: BRAND.bad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 * k, color: "#2A0A0A" }}>✕</div>
                {t}
              </div>
            ))}
          </div>
        }
      />
    </Scene>
  );
};

// ---------- P8: nói thật về hạn chế ----------
const LIMITS = [
  { at: 0.2, title: "Bản thử nghiệm", sub: "Chưa phát hành chính thức" },
  { at: 0.45, title: "Chương trình mầm non Úc", sub: "Theo khung EYLF, NQS" },
  { at: 0.72, title: "Giao diện tiếng Anh", sub: "Chưa có tiếng Việt" },
];
export const Limits: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  return (
    <Scene accent={BRAND.warn}>
      <AbsoluteFill style={{ padding: `${220 * k}px ${60 * k}px`, gap: 40 * k }}>
        <Title k={k} p={enter(0)} size={100}>
          Nhưng <span style={{ color: BRAND.warn }}>nói thật</span>
        </Title>
        <div style={{ height: 10 * k }} />
        {LIMITS.map((l) => (
          <div key={l.title} style={{ display: "flex", alignItems: "center", gap: 30 * k, padding: `${34 * k}px ${40 * k}px`, borderRadius: 30 * k, background: "rgba(251,191,36,0.1)", border: "3px solid rgba(251,191,36,0.6)", ...rise(enter(beat("p8", l.at)), 60) }}>
            <Icon d={ICONS.warn} size={76 * k} color={BRAND.warn} />
            <div>
              <div style={{ fontSize: 56 * k, fontWeight: 900 }}>{l.title}</div>
              <div style={{ fontSize: 38 * k, fontWeight: 600, color: C.muted, marginTop: 4 * k }}>{l.sub}</div>
            </div>
          </div>
        ))}
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P9: cần người kỹ thuật + dữ liệu giả ----------
export const Tech: React.FC = () => {
  const { k, width, pad } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const cmd = "docker compose up --build -d";
  const typed = cmd.slice(0, Math.round(interpolate(frame, [6, beat("p9", 0.45)], [0, cmd.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  return (
    <Scene accent={BRAND.warn}>
      <AbsoluteFill style={{ padding: `${220 * k}px ${pad}px`, gap: 50 * k }}>
        <Title k={k} p={enter(0)} size={92}>
          Cần người
          <br />
          <Grad>biết kỹ thuật</Grad>
        </Title>
        <div style={{ width: width - pad * 2, borderRadius: 28, overflow: "hidden", background: "#0F141C", border: "2px solid rgba(255,255,255,0.12)", ...rise(enter(4), 60) }}>
          <div style={{ height: HEADER_H, display: "flex", alignItems: "center", gap: 12, padding: "0 28px", background: "#0A0E14" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <div key={c} style={{ width: 20, height: 20, borderRadius: 10, background: c }} />
            ))}
            <div style={{ fontSize: 30, fontWeight: 700, color: C.muted, marginLeft: 10 }}>terminal</div>
          </div>
          <div style={{ padding: `${30 * k}px ${36 * k}px`, fontFamily: "'DejaVu Sans Mono', monospace", fontSize: 38 * k, color: "#E6EDF3" }}>
            <span style={{ color: "#7A8599" }}>$ </span>
            {typed}
            <div style={{ color: "#7A8599", marginTop: 12 * k, opacity: frame > beat("p9", 0.45) ? 1 : 0 }}>+ Python, PostgreSQL, Redis, khoá API…</div>
          </div>
        </div>
        <Pill k={k} style={{ fontSize: 48 * k, border: `3px solid ${BRAND.warn}88`, ...rise(enter(beat("p9", 0.65)), 40) }}>
          <Icon d={ICONS.warn} size={56 * k} color={BRAND.warn} />
          Chỉ thử với dữ liệu giả
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P10: mẫu để làm bản tiếng Việt ----------
export const Vietnam: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const arrow = interpolate(frame, [beat("p10", 0.4), beat("p10", 0.6)], [0, 1], ease);
  const node = (label: string, sub: string, color: string, p: number, flag?: boolean) => (
    <div style={{ width: 380 * k, padding: `${40 * k}px ${20 * k}px`, borderRadius: 34 * k, background: `${color}1A`, border: `3px solid ${color}`, textAlign: "center", opacity: p, transform: `scale(${interpolate(p, [0, 1], [0.7, 1])})` }}>
      {flag ? (
        <svg width={150 * k} height={100 * k} viewBox="0 0 30 20" style={{ borderRadius: 8 * k }}>
          <rect width="30" height="20" fill="#DA251D" />
          <path d="M15 4l1.76 5.4h5.68l-4.6 3.34 1.76 5.4L15 14.8l-4.6 3.34 1.76-5.4-4.6-3.34h5.68z" fill="#FFCD00" />
        </svg>
      ) : (
        <Icon d={ICONS.ai} size={100 * k} color={color} />
      )}
      <div style={{ fontSize: 46 * k, fontWeight: 900, marginTop: 14 * k }}>{label}</div>
      <div style={{ fontSize: 32 * k, fontWeight: 600, color: C.muted }}>{sub}</div>
    </div>
  );
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${230 * k}px ${60 * k}px`, gap: 80 * k, alignItems: "center" }}>
        <Title k={k} p={enter(0)} size={92}>
          <div style={{ textAlign: "center" }}>
            Mẫu tốt cho
            <br />
            <Grad>bạn IT của trường</Grad>
          </div>
        </Title>
        <div style={{ display: "flex", alignItems: "center", gap: 20 * k }}>
          {node("EasyTeaching", "mẫu an toàn", BRAND.main, enter(beat("p10", 0.15)))}
          <GrowArrow w={120 * k} color={BRAND.main} p={arrow} />
          {node("Bản tiếng Việt", "trợ lý cho cô", BRAND.alt, enter(beat("p10", 0.55)), true)}
        </div>
        <Pill k={k} style={{ alignSelf: "center", fontSize: 42 * k, ...rise(enter(beat("p10", 0.7)), 30) }}>
          <CheckIcon size={50 * k} color={BRAND.ok} />
          Mã nguồn MIT: được sửa, dùng lại
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P11: lưu lại & gửi bạn IT ----------
export const Outro: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const pulse = 1 + Math.sin(frame / 6) * 0.03;
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 360 * k, textAlign: "center" }}>
        <div style={{ width: 240 * k, height: 240 * k, borderRadius: 64 * k, background: `${BRAND.main}22`, border: `4px solid ${BRAND.main}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${enter(0, 10) * pulse})` }}>
          <Icon d={ICONS.ai} size={150 * k} />
        </div>
        <div style={{ fontSize: 116 * k, fontWeight: 900, lineHeight: 1.08, marginTop: 80 * k, letterSpacing: -3 * k, ...rise(enter(8)) }}>
          Lưu lại
          <br />
          <Grad>& gửi bạn IT!</Grad>
        </div>
        <Pill k={k} style={{ alignSelf: "center", marginTop: 70 * k, fontSize: 40 * k, fontWeight: 600, ...rise(enter(18), 30) }}>
          <svg width={50 * k} height={50 * k} viewBox="0 0 24 24" fill={C.text} style={{ flexShrink: 0 }}>
            <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
          </svg>
          github.com/MengC-OvO/easy-teaching
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P12: theo dõi + câu hỏi ----------
export const Subscribe: React.FC = () => (
  <SubscribeScene question={"Việc giấy tờ nào làm cô\nmất thời gian nhất?"} accent={BRAND.main} btnAt={beat("p12", 0.25)} label="+ Theo dõi kênh" />
);

