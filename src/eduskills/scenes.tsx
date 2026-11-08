import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { HEADER_H, ScreenCard, UrlBar, fitBox, type Box, type CamKey, type Size } from "../components/ScreenCard";
import { Bokeh, GrowArrow, StepDot, Stamp } from "../components/fx";
import { SplitLayout, useLayout } from "../components/layout";
import { SubscribeScene } from "../components/subscribe";
import { Background, C, CheckIcon, StarIcon, fontFamily, useExit } from "../components/ui";
import REPO_SHOT from "../../public/eduskills/repo.json";
import { BRAND, BRAND_GRADIENT, REPO_URL, beat } from "./data";

// Mọi kích thước px viết theo thiết kế gốc 1080x1920 rồi nhân `k`.

const useEnter = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (delay: number, damping = 200) => spring({ frame: frame - delay, fps, config: { damping } });
};
const rise = (p: number, px = 50) => ({ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [px, 0])}px)` });
const ease = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t: number) => 1 - Math.pow(1 - t, 3) } as const;

const Grad: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", ...style }}>{children}</span>
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

const Scene: React.FC<{ accent?: string; children: React.ReactNode; fade?: boolean }> = ({ accent = BRAND.main, children, fade = true }) => {
  const exit = useExit();
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text, opacity: fade ? exit : 1 }}>
      <Background accent={accent} />
      <Bokeh color={accent} count={10} />
      {children}
    </AbsoluteFill>
  );
};

const Note: React.FC<{ k: number; text?: string }> = ({ k, text = "* Ví dụ minh hoạ" }) => (
  <div style={{ fontSize: 30 * k, fontWeight: 500, color: C.muted, fontStyle: "italic" }}>{text}</div>
);

const viewOf = (box: Size): Size => ({ width: box.width, height: box.height - HEADER_H });
const box = (x: number, y: number, width: number, height: number): Box => ({ x, y, width, height });
const SHOT_PAGE = { width: 1280, height: 900 };

const Logo: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <Img src={staticFile("eduskills/logo.svg")} style={{ width: size, height: size, ...style }} />
);

const RepoHeader: React.FC<{ screen: string }> = ({ screen }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 700, color: C.text, whiteSpace: "nowrap" }}>
    <Logo size={40} />
    education-agent-skills
    <span style={{ color: C.muted, fontWeight: 500 }}>· {screen}</span>
  </div>
);

const Icon: React.FC<{ d: string; size: number; color?: string }> = ({ d, size, color = BRAND.main }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const ICONS = {
  plan: "M8 2v4M16 2v4M3 9h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM8 14h3M8 18h6",
  quiz: "M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z",
  rubric: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  help: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  open: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
  copy: "M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
  paste: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6v4H9zM9 14l2 2 4-4",
};

// Khung chat tự vẽ (không giả giao diện của sản phẩm cụ thể).
const Bubble: React.FC<{ k: number; who: "me" | "ai"; text: string; p: number; typed?: number; style?: React.CSSProperties }> = ({ k, who, text, p, typed = 1, style }) => {
  const shown = text.slice(0, Math.round(text.length * Math.max(0, Math.min(1, typed))));
  const me = who === "me";
  return (
    <div style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start", ...rise(p, 40), ...style }}>
      <div
        style={{
          maxWidth: "86%",
          padding: `${28 * k}px ${36 * k}px`,
          borderRadius: 36 * k,
          borderBottomRightRadius: me ? 8 * k : 36 * k,
          borderBottomLeftRadius: me ? 36 * k : 8 * k,
          background: me ? BRAND.main : "rgba(255,255,255,0.08)",
          border: me ? "none" : "2px solid rgba(255,255,255,0.12)",
          color: me ? "#1A1206" : C.text,
          fontSize: 44 * k,
          fontWeight: me ? 700 : 500,
          lineHeight: 1.4,
        }}
      >
        {!me && <div style={{ fontSize: 30 * k, fontWeight: 800, color: BRAND.main, marginBottom: 8 * k }}>Trợ lý AI</div>}
        {shown}
        {typed < 1 && <span style={{ opacity: 0.6 }}>▍</span>}
      </div>
    </div>
  );
};

// ---------- P1: hook — 11 giờ đêm ----------
const ClockFace: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  // Kim phút chạy nhanh từ 58 → 60 phút (tới đúng 23:00).
  const min = interpolate(frame, [0, 45], [58, 60], ease);
  const hour = 10 + min / 60;
  const hand = (deg: number, len: number, w: number, color: string) => (
    <div
      style={{
        position: "absolute",
        left: size / 2 - w / 2,
        top: size / 2 - len,
        width: w,
        height: len,
        borderRadius: w,
        background: color,
        transformOrigin: `${w / 2}px ${len}px`,
        transform: `rotate(${deg}deg)`,
      }}
    />
  );
  return (
    <div style={{ position: "relative", width: size, height: size, borderRadius: "50%", border: `${size * 0.035}px solid ${BRAND.main}`, background: "rgba(255,181,71,0.06)", boxShadow: `0 0 ${size * 0.25}px ${BRAND.main}44` }}>
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: size / 2 - 3,
            top: size * 0.06,
            width: 6,
            height: size * 0.07,
            background: i % 3 === 0 ? C.text : C.muted,
            transformOrigin: `3px ${size * 0.44}px`,
            transform: `rotate(${i * 30}deg)`,
            borderRadius: 3,
          }}
        />
      ))}
      {hand((hour % 12) * 30, size * 0.26, size * 0.045, C.text)}
      {hand(min * 6, size * 0.38, size * 0.025, BRAND.alt)}
      <div style={{ position: "absolute", left: size / 2 - 12, top: size / 2 - 12, width: 24, height: 24, borderRadius: 12, background: BRAND.main }} />
    </div>
  );
};

export const Hook: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const min = Math.floor(interpolate(frame, [0, 45], [58, 60], ease));
  const time = min >= 60 ? "23:00" : `22:${min}`;
  const shake = frame > 45 && frame < 60 ? Math.sin(frame * 2.2) * 8 : 0;
  return (
    <Scene accent={BRAND.alt}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 230 * k, textAlign: "center" }}>
        <div style={{ transform: `scale(${enter(0, 12)})` }}>
          <ClockFace size={420 * k} />
        </div>
        <div style={{ fontSize: 210 * k, fontWeight: 900, letterSpacing: -6 * k, marginTop: 40 * k, fontVariantNumeric: "tabular-nums", transform: `translateX(${shake}px)` }}>
          <Grad>{time}</Grad>
        </div>
        <div style={{ fontSize: 96 * k, fontWeight: 900, lineHeight: 1.12, letterSpacing: -2 * k, marginTop: 20 * k, ...rise(enter(6)) }}>
          Giáo án ngày mai
          <br />
          <span style={{ color: BRAND.alt }}>vẫn chưa xong?</span>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P2: việc chồng chất ----------
const PILE = [
  { at: 0.02, label: "Soạn bài", icon: ICONS.plan, rot: -4 },
  { at: 0.12, label: "Ra đề", icon: ICONS.quiz, rot: 3 },
  { at: 0.24, label: "Thang chấm điểm", icon: ICONS.rubric, rot: -2 },
  { at: 0.4, label: "Phân hoá từng em", icon: ICONS.help, rot: 4 },
];

export const Pile: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const bar = interpolate(frame, [beat("p2", 0.15), beat("p2", 0.85)], [1, 0.12], ease);
  return (
    <Scene accent={BRAND.alt}>
      <AbsoluteFill style={{ padding: `${200 * k}px ${60 * k}px`, gap: 60 * k }}>
        <div style={{ fontSize: 100 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05, ...rise(enter(0)) }}>
          Việc cứ <Grad>chồng lên</Grad>
        </div>
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
                  fontSize: 58 * k,
                  fontWeight: 800,
                  opacity: Math.min(1, p * 2),
                  transform: `translateY(${interpolate(p, [0, 1], [-900, 0])}px) rotate(${c.rot}deg)`,
                }}
              >
                <Icon d={c.icon} size={64 * k} />
                {c.label}
              </div>
            );
          })}
        </div>
        <div style={rise(enter(beat("p2", 0.15)), 30)}>
          <div style={{ fontSize: 42 * k, fontWeight: 700, color: C.muted, marginBottom: 18 * k }}>Thời gian cho học trò</div>
          <div style={{ height: 40 * k, borderRadius: 20 * k, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ width: `${bar * 100}%`, height: "100%", borderRadius: 20 * k, background: bar < 0.3 ? BRAND.bad : BRAND.ok }} />
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P3: AI trả lời chung chung ----------
export const Generic: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const typed = interpolate(frame, [beat("p3", 0.2), beat("p3", 0.6)], [0, 1], ease);
  return (
    <Scene accent={BRAND.main}>
      <AbsoluteFill style={{ padding: `${200 * k}px ${60 * k}px`, gap: 44 * k }}>
        <div style={{ fontSize: 96 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.08, ...rise(enter(0)) }}>
          Nhanh… nhưng
          <br />
          <Grad>dựa vào đâu?</Grad>
        </div>
        <Bubble k={k} who="me" text="Gợi ý cách dạy bài Tế bào cho lớp 9?" p={enter(6)} />
        <Bubble
          k={k}
          who="ai"
          p={enter(beat("p3", 0.15))}
          typed={typed}
          text="Thầy cô có thể tổ chức hoạt động nhóm, kết hợp trò chơi và đa dạng phương pháp để học sinh hứng thú hơn…"
        />
        <div style={{ display: "flex", justifyContent: "center", marginTop: 30 * k }}>
          <Stamp text="THIẾU CĂN CỨ" at={beat("p3", 0.68)} color={BRAND.bad} />
        </div>
        <Note k={k} />
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P4: giới thiệu + trang GitHub ----------
export const Intro: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const shot = REPO_SHOT as typeof REPO_SHOT & { star: Box };
  const stars = interpolate(frame, [beat("p4", 0.5), beat("p4", 0.8)], [0, Number((shot.starLabel ?? "").match(/\((\d+)\)/)?.[1] ?? 0)], ease);
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: { cx: 640, cy: 330, s: view.width / 1280 } },
    { at: beat("p4", 0.4), cam: { cx: shot.star.x - 60, cy: shot.star.y + 14, s: 2.2 } },
  ];
  return (
    <Scene>
      <SplitLayout
        mediaFrac={0.36}
        head={
          <div style={{ display: "flex", alignItems: "center", gap: 36 * k }}>
            <div style={{ width: 190 * k, height: 190 * k, borderRadius: 44 * k, background: "#1A2030", border: `3px solid ${BRAND.main}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transform: `scale(${enter(0, 11)})` }}>
              <Logo size={140 * k} />
            </div>
            <div style={rise(enter(6))}>
              <div style={{ fontSize: 84 * k, fontWeight: 900, letterSpacing: -2 * k, lineHeight: 1.02 }}>
                Education
                <br />
                <Grad>Agent Skills</Grad>
              </div>
              <div style={{ fontSize: 40 * k, fontWeight: 500, color: C.muted, marginTop: 12 * k }}>Mã nguồn mở · Miễn phí</div>
            </div>
          </div>
        }
        media={(b) => (
          <div style={rise(enter(4), 120)}>
            <ScreenCard
              src={shot.file}
              page={SHOT_PAGE}
              view={viewOf(b)}
              keys={keys(viewOf(b))}
              highlights={[{ box: shot.star, from: beat("p4", 0.48) }]}
              accent={BRAND.main}
              header={<UrlBar url="github.com/GarethManning/…" muted={C.muted} color={C.text} />}
            />
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 80 * k, fontWeight: 900, border: `2px solid ${BRAND.main}66`, ...rise(enter(beat("p4", 0.5))) }}>
            <StarIcon size={66 * k} color={BRAND.main} />
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(stars)}</span>
            <span style={{ fontSize: 40 * k, fontWeight: 500, color: C.muted }}>sao trên GitHub</span>
          </Pill>
        }
      />
    </Scene>
  );
};

// ---------- P5: 165 kỹ năng / 20 lĩnh vực ----------
const DOM_TABLE = box(64, 218, 838, 680);
const DOM_ROW7 = box(64, 718, 838, 84);

export const Numbers: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const skills = interpolate(frame, [beat("p5", 0.05), beat("p5", 0.5)], [0, 165], ease);
  const domains = interpolate(frame, [beat("p5", 0.55), beat("p5", 0.85)], [0, 20], ease);
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: fitBox(DOM_TABLE, view, 10) },
    { at: beat("p5", 0.6), cam: fitBox(box(64, 600, 838, 300), view, 10) },
  ];
  const big = (v: number, label: string, p: number) => (
    <div style={{ flex: 1, ...rise(p) }}>
      <div style={{ fontSize: 200 * k, fontWeight: 900, lineHeight: 0.95, letterSpacing: -8 * k, fontVariantNumeric: "tabular-nums" }}>
        <Grad>{Math.round(v)}</Grad>
      </div>
      <div style={{ fontSize: 52 * k, fontWeight: 800, color: C.text, marginTop: 6 * k }}>{label}</div>
    </div>
  );
  return (
    <Scene>
      <SplitLayout
        mediaFrac={0.4}
        head={
          <div style={{ display: "flex", gap: 30 * k }}>
            {big(skills, "kỹ năng cho AI", enter(0))}
            {big(domains, "lĩnh vực dạy học", enter(beat("p5", 0.5)))}
          </div>
        }
        media={(b) => (
          <div style={rise(enter(beat("p5", 0.3)), 120)}>
            <ScreenCard
              src="eduskills/dom-7250.png"
              page={SHOT_PAGE}
              view={viewOf(b)}
              keys={keys(viewOf(b))}
              highlights={[{ box: DOM_ROW7, from: beat("p5", 0.72) }]}
              accent={BRAND.main}
              header={<RepoHeader screen="README" />}
            />
          </div>
        )}
      />
    </Scene>
  );
};

// ---------- P6: làm được gì ----------
const USES = [
  { at: 0.02, label: "Lên kế hoạch bài", icon: ICONS.plan },
  { at: 0.22, label: "Câu hỏi ôn tập", icon: ICONS.quiz },
  { at: 0.5, label: "Viết thang điểm", icon: ICONS.rubric },
  { at: 0.7, label: "Hỗ trợ học sinh yếu", icon: ICONS.help },
];

export const Uses: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${200 * k}px ${60 * k}px`, gap: 34 * k }}>
        <div style={{ fontSize: 104 * k, fontWeight: 900, letterSpacing: -3 * k, marginBottom: 30 * k, ...rise(enter(0)) }}>
          AI giúp <Grad>được gì?</Grad>
        </div>
        {USES.map((u) => {
          const p = enter(beat("p6", u.at));
          return (
            <div
              key={u.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 34 * k,
                padding: `${38 * k}px ${42 * k}px`,
                borderRadius: 32 * k,
                background: "rgba(255,255,255,0.05)",
                border: `2px solid ${BRAND.main}44`,
                fontSize: 62 * k,
                fontWeight: 800,
                opacity: p,
                transform: `translateX(${interpolate(p, [0, 1], [120, 0])}px)`,
              }}
            >
              <div style={{ width: 110 * k, height: 110 * k, borderRadius: 28 * k, background: `${BRAND.main}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon d={u.icon} size={66 * k} />
              </div>
              {u.label}
            </div>
          );
        })}
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P7: có nguồn nghiên cứu ----------
const EV_STRENGTH = box(371, 730, 860, 37);
const EV_SOURCES = box(371, 772, 860, 42);

export const Evidence: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: { cx: 820, cy: 560, s: view.width / 1000 } },
    { at: beat("p7", 0.3), cam: fitBox(box(371, 700, 760, 130), view, 16) },
  ];
  return (
    <Scene>
      <SplitLayout
        head={
          <div>
            <div style={{ fontSize: 40 * k, fontWeight: 700, letterSpacing: 4 * k, color: BRAND.main, ...rise(enter(0), 30) }}>ĐIỂM ĐÁNG QUÝ</div>
            <div style={{ fontSize: 96 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05, marginTop: 14 * k, ...rise(enter(4)) }}>
              Có <Grad>nghiên cứu gốc</Grad>
            </div>
          </div>
        }
        media={(b) => (
          <div style={rise(enter(6), 120)}>
            <ScreenCard
              src="eduskills/skill.png"
              page={SHOT_PAGE}
              view={viewOf(b)}
              keys={keys(viewOf(b))}
              highlights={[
                { box: EV_STRENGTH, from: beat("p7", 0.55) },
                { box: EV_SOURCES, from: beat("p7", 0.4) },
              ]}
              accent={BRAND.main}
              header={<RepoHeader screen="Retrieval Practice" />}
            />
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 46 * k, ...rise(enter(beat("p7", 0.5)), 40) }}>
            <CheckIcon size={54 * k} color={BRAND.ok} />
            Mức bằng chứng: <span style={{ color: BRAND.ok }}>Mạnh</span>
          </Pill>
        }
      />
    </Scene>
  );
};

// ---------- P8: loại bỏ "phong cách học" ----------
const EX_HEAD = box(370, 118, 495, 34);
const EX_STATUS = box(370, 174, 145, 24);

export const Excluded: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: { cx: 820, cy: 330, s: view.width / 1000 } },
    { at: beat("p8", 0.25), cam: fitBox(box(360, 110, 560, 120), view, 16) },
  ];
  return (
    <Scene accent={BRAND.alt}>
      <SplitLayout
        head={
          <div>
            <div style={{ fontSize: 40 * k, fontWeight: 700, letterSpacing: 4 * k, color: BRAND.bad, ...rise(enter(0), 30) }}>THIẾU CĂN CỨ → LOẠI</div>
            <div style={{ fontSize: 92 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.05, marginTop: 14 * k, ...rise(enter(4)) }}>
              “Phong cách học”
            </div>
          </div>
        }
        media={(b) => (
          <div style={{ position: "relative", ...rise(enter(6), 120) }}>
            <ScreenCard
              src="eduskills/excl.png"
              page={SHOT_PAGE}
              view={viewOf(b)}
              keys={keys(viewOf(b))}
              highlights={[
                { box: EX_HEAD, from: beat("p8", 0.35) },
                { box: EX_STATUS, from: beat("p8", 0.5) },
              ]}
              accent={BRAND.bad}
              header={<RepoHeader screen="EXCLUSIONS.md" />}
            />
            <div style={{ position: "absolute", right: 30 * k, bottom: 40 * k }}>
              <Stamp text="ĐÃ LOẠI" at={beat("p8", 0.62)} color={BRAND.bad} />
            </div>
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 40 * k, ...rise(enter(beat("p8", 0.4)), 40) }}>
            Có ghi rõ lý do và nghiên cứu phản bác
          </Pill>
        }
      />
    </Scene>
  );
};

// ---------- P9: 3 bước ----------
const STEPS = [
  { at: 0.25, label: "Mở kỹ năng", icon: ICONS.open },
  { at: 0.5, label: "Chép lệnh", icon: ICONS.copy },
  { at: 0.75, label: "Dán vào AI", icon: ICONS.paste },
];

export const Steps: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${260 * k}px ${60 * k}px`, gap: 120 * k, alignItems: "center" }}>
        <div style={{ fontSize: 110 * k, fontWeight: 900, letterSpacing: -3 * k, textAlign: "center", ...rise(enter(0)) }}>
          Dùng <Grad>rất dễ</Grad>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 * k }}>
          {STEPS.map((s, i) => {
            const p = enter(beat("p9", s.at) - 8, 14);
            const active = frame >= beat("p9", s.at) && (i === STEPS.length - 1 || frame < beat("p9", STEPS[i + 1].at));
            return (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 14 * k }}>
                {i > 0 && <GrowArrow w={90 * k} color={BRAND.main} p={interpolate(frame, [beat("p9", s.at) - 12, beat("p9", s.at)], [0, 1], ease)} />}
                <div style={{ opacity: p, transform: `scale(${interpolate(p, [0, 1], [0.6, 1])})` }}>
                  <StepDot icon={<Icon d={s.icon} size={90 * k} color={active ? "#0A0D16" : BRAND.main} />} label={s.label} color={BRAND.main} active={active} size={200} />
                </div>
              </div>
            );
          })}
        </div>
        <Pill k={k} style={{ alignSelf: "center", fontSize: 44 * k, ...rise(enter(beat("p9", 0.8)), 30) }}>
          <CheckIcon size={52 * k} color={BRAND.ok} />
          Không cần cài đặt
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P10: dặn trả lời tiếng Việt ----------
export const Vietnamese: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const typed = interpolate(frame, [beat("p10", 0.45), beat("p10", 0.8)], [0, 1], ease);
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${200 * k}px ${60 * k}px`, gap: 44 * k }}>
        <div style={{ fontSize: 40 * k, fontWeight: 700, letterSpacing: 4 * k, color: BRAND.main, ...rise(enter(0), 30) }}>MẸO NHỎ</div>
        <div style={{ fontSize: 92 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.08, ...rise(enter(4)) }}>
          Gốc tiếng Anh?
          <br />
          <Grad>Dặn một câu là xong</Grad>
        </div>
        <Bubble k={k} who="me" p={enter(beat("p10", 0.15))} text="[Dán đoạn lệnh kỹ năng…] Chủ đề: Tế bào, lớp 9, 8 tuần." style={{ marginTop: 40 * k }} />
        <Bubble k={k} who="me" p={enter(beat("p10", 0.42))} typed={typed} text="Trả lời bằng tiếng Việt nhé." />
        <Note k={k} />
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P11: lịch ôn tập ----------
const WEEKS = ["Bài mới", "Bài mới", "Ôn T1", "Bài mới", "Ôn T2", "Ôn T1", "Bài mới", "Ôn tổng"];

export const Schedule: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${180 * k}px ${60 * k}px`, gap: 36 * k }}>
        <div style={{ fontSize: 92 * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.08, ...rise(enter(0)) }}>
          Bản nháp lịch ôn tập
          <br />
          <Grad>trong vài phút</Grad>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 * k, marginTop: 20 * k }}>
          {WEEKS.map((w, i) => {
            const p = enter(beat("p11", 0.1 + i * 0.065), 14);
            const review = w.startsWith("Ôn");
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: `${26 * k}px ${32 * k}px`,
                  borderRadius: 24 * k,
                  background: review ? `${BRAND.main}22` : "rgba(255,255,255,0.05)",
                  border: `2px solid ${review ? BRAND.main : "rgba(255,255,255,0.12)"}`,
                  fontSize: 42 * k,
                  fontWeight: 800,
                  opacity: p,
                  transform: `scale(${interpolate(p, [0, 1], [0.8, 1])})`,
                }}
              >
                <span style={{ color: C.muted }}>Tuần {i + 1}</span>
                <span style={{ color: review ? BRAND.main : C.text }}>{w}</span>
              </div>
            );
          })}
        </div>
        <Pill k={k} style={{ fontSize: 44 * k, ...rise(enter(beat("p11", 0.7)), 30) }}>
          <CheckIcon size={52 * k} color={BRAND.ok} />
          Thầy cô xem lại & chỉnh
        </Pill>
        <Note k={k} />
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
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 300 * k, textAlign: "center" }}>
        <div style={{ width: 260 * k, height: 260 * k, borderRadius: 60 * k, background: "#1A2030", border: `4px solid ${BRAND.main}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${enter(0, 10) * pulse})` }}>
          <Logo size={190 * k} />
        </div>
        <div style={{ fontSize: 124 * k, fontWeight: 900, lineHeight: 1.08, marginTop: 70 * k, letterSpacing: -3 * k, ...rise(enter(8)) }}>
          Lưu lại
          <br />
          <Grad>& thử ngay!</Grad>
        </div>
        <Pill k={k} style={{ alignSelf: "center", marginTop: 70 * k, fontSize: 36 * k, fontWeight: 600, textAlign: "left", ...rise(enter(18), 30) }}>
          <svg width={52 * k} height={52 * k} viewBox="0 0 24 24" fill={C.text} style={{ flexShrink: 0 }}>
            <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
          </svg>
          <span>
            github.com/GarethManning/
            <br />
            education-agent-skills
          </span>
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P13: theo dõi + câu hỏi ----------
export const Subscribe: React.FC = () => (
  <SubscribeScene question={"Thầy cô cần AI giúp gì nhất?\nSoạn bài, ra đề\nhay chấm bài?"} accent={BRAND.main} btnAt={beat("p13", 0.2)} label="+ Theo dõi kênh" />
);

export { REPO_URL };
