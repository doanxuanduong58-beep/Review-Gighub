import { loadFont } from "@remotion/google-fonts/Baloo2";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { HEADER_H, ScreenCard, UrlBar, fitBox, parseStarLabel, type Box, type CamKey, type Size } from "../components/ScreenCard";
import { SplitLayout, useLayout } from "../components/layout";
import { useExit } from "../components/ui";
import SHOT from "../../public/mpt/github.json";
import { P, REPO_URL, beat } from "./data";

// Phong cách dễ thương: nền kem chấm bi, thẻ "sticker" viền nâu đậm + bóng đổ khối, mọi thứ nảy (spring mềm),
// linh vật máy in tự vẽ. Thiết kế gốc 1080x1920, nhân `k`.

export const { fontFamily: cute } = loadFont("normal", { weights: ["600", "700", "800"], subsets: ["vietnamese", "latin"] });

const useBounce = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (delay: number, damping = 8) => spring({ frame: frame - delay, fps, config: { damping, stiffness: 180, mass: 0.7 } });
};
const pop = (p: number) => ({ opacity: Math.min(1, p * 3), transform: `scale(${Math.max(0, p)})` });
const drop = (p: number, px = 120) => ({ opacity: Math.min(1, p * 3), transform: `translateY(${interpolate(p, [0, 1], [-px, 0])}px)` });
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- Nền ----------
const SHAPES = [
  { x: 0.08, y: 0.12, s: 70, c: P.pink, kind: "star" },
  { x: 0.88, y: 0.08, s: 56, c: P.butter, kind: "dot" },
  { x: 0.92, y: 0.42, s: 64, c: P.mint, kind: "heart" },
  { x: 0.06, y: 0.55, s: 50, c: P.lilac, kind: "dot" },
  { x: 0.85, y: 0.78, s: 72, c: P.sky, kind: "star" },
  { x: 0.12, y: 0.86, s: 58, c: P.butter, kind: "heart" },
];

const Shape: React.FC<{ kind: string; size: number; color: string }> = ({ kind, size, color }) => {
  if (kind === "dot") return <div style={{ width: size, height: size, borderRadius: "50%", background: color, border: `${size * 0.08}px solid ${P.ink}` }} />;
  const d =
    kind === "star"
      ? "M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z"
      : "M12 21s-7.5-4.6-9.6-9.2C.9 8.2 3.2 4.5 6.8 4.5c2.1 0 3.6 1.2 5.2 3 1.6-1.8 3.1-3 5.2-3 3.6 0 5.9 3.7 4.4 7.3C19.5 16.4 12 21 12 21z";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d={d} fill={color} stroke={P.ink} strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  );
};

export const CuteBg: React.FC<{ tint?: string }> = ({ tint = P.pink }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const { k } = useLayout();
  return (
    <AbsoluteFill style={{ background: P.cream }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${tint}33 ${7 * k}px, transparent ${8 * k}px)`,
          backgroundSize: `${70 * k}px ${70 * k}px`,
          backgroundPosition: `${(frame * 0.6) % (70 * k)}px ${(frame * 0.6) % (70 * k)}px`,
        }}
      />
      <div style={{ position: "absolute", width: 900 * k, height: 900 * k, borderRadius: "50%", left: -300 * k, top: -250 * k, background: `${tint}22` }} />
      <div style={{ position: "absolute", width: 800 * k, height: 800 * k, borderRadius: "50%", right: -320 * k, bottom: -200 * k, background: `${P.mint}22` }} />
      {SHAPES.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: s.x * width,
            top: s.y * height + Math.sin(frame / 18 + i) * 14 * k,
            transform: `rotate(${Math.sin(frame / 25 + i * 2) * 14}deg)`,
            opacity: 0.85,
          }}
        >
          <Shape kind={s.kind} size={s.s * k} color={s.c} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ---------- Sticker / chữ ----------
export const Sticker: React.FC<{ k: number; bg?: string; children: React.ReactNode; style?: React.CSSProperties; radius?: number }> = ({
  k,
  bg = "#FFFFFF",
  children,
  style,
  radius = 36,
}) => (
  <div
    style={{
      background: bg,
      border: `${6 * k}px solid ${P.ink}`,
      borderRadius: radius * k,
      boxShadow: `0 ${10 * k}px 0 ${P.ink}`,
      color: P.ink,
      fontFamily: cute,
      ...style,
    }}
  >
    {children}
  </div>
);

const Chip: React.FC<{ k: number; bg: string; children: React.ReactNode; style?: React.CSSProperties; size?: number }> = ({ k, bg, children, style, size = 50 }) => (
  <Sticker k={k} bg={bg} radius={999} style={{ display: "inline-flex", alignItems: "center", gap: 12 * k, padding: `${10 * k}px ${32 * k}px`, fontSize: size * k, fontWeight: 800, whiteSpace: "nowrap", ...style }}>
    {children}
  </Sticker>
);

/** Chữ to có viền nâu đậm (kiểu chữ dán). */
const Bubble: React.FC<{ k: number; size: number; color?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ k, size, color = "#FFFFFF", children, style }) => (
  <div
    style={{
      fontFamily: cute,
      fontSize: size * k,
      fontWeight: 800,
      lineHeight: 1.05,
      color,
      WebkitTextStroke: `${size * 0.09 * k}px ${P.ink}`,
      paintOrder: "stroke fill",
      textShadow: `0 ${size * 0.08 * k}px 0 ${P.ink}`,
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------- Linh vật: chú máy in tí hon ----------
export const Printer: React.FC<{ size: number; wave?: boolean; shake?: number }> = ({ size, wave = false, shake = 0 }) => {
  const frame = useCurrentFrame();
  const blink = frame % 75 > 70;
  const bob = Math.sin(frame / 7) * 6;
  const jiggle = Math.sin(frame * 1.8) * 4 * shake;
  const arm = wave ? Math.sin(frame / 3.5) * 28 : 0;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible", transform: `translateY(${bob}px) rotate(${jiggle}deg)` }}>
      {/* giấy phía sau */}
      <rect x="55" y="18" width="90" height="50" rx="8" fill="#FFFFFF" stroke={P.ink} strokeWidth="6" />
      <path d="M70 36h60M70 50h40" stroke={P.pink} strokeWidth="6" strokeLinecap="round" />
      {/* tay */}
      <g transform={`rotate(${-arm} 30 110)`}>
        <path d="M30 110 Q8 95 14 70" stroke={P.ink} strokeWidth="8" fill="none" strokeLinecap="round" />
        <circle cx="14" cy="66" r="10" fill={P.butter} stroke={P.ink} strokeWidth="5" />
      </g>
      <path d="M170 110 Q192 120 186 140" stroke={P.ink} strokeWidth="8" fill="none" strokeLinecap="round" />
      <circle cx="186" cy="144" r="10" fill={P.butter} stroke={P.ink} strokeWidth="5" />
      {/* thân */}
      <rect x="25" y="58" width="150" height="110" rx="30" fill={P.pink} stroke={P.ink} strokeWidth="7" />
      <rect x="25" y="138" width="150" height="30" rx="14" fill="#FF9BC8" stroke={P.ink} strokeWidth="7" />
      <rect x="55" y="146" width="90" height="10" rx="5" fill={P.ink} />
      {/* mặt */}
      {blink ? (
        <>
          <path d="M66 98q8 6 16 0" stroke={P.ink} strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M118 98q8 6 16 0" stroke={P.ink} strokeWidth="6" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="74" cy="98" rx="9" ry="12" fill={P.ink} />
          <ellipse cx="126" cy="98" rx="9" ry="12" fill={P.ink} />
          <circle cx="77" cy="93" r="3.5" fill="#FFF" />
          <circle cx="129" cy="93" r="3.5" fill="#FFF" />
        </>
      )}
      <ellipse cx="56" cy="118" rx="11" ry="7" fill="#FF4F93" opacity="0.6" />
      <ellipse cx="144" cy="118" rx="11" ry="7" fill="#FF4F93" opacity="0.6" />
      <path d="M88 116q12 12 24 0" stroke={P.ink} strokeWidth="6" fill="#FF4F93" strokeLinecap="round" />
      {/* chân */}
      <rect x="45" y="166" width="22" height="16" rx="6" fill={P.ink} />
      <rect x="133" y="166" width="22" height="16" rx="6" fill={P.ink} />
    </svg>
  );
};

const Scene: React.FC<{ tint?: string; children: React.ReactNode }> = ({ tint, children }) => {
  const exit = useExit(6);
  return (
    <AbsoluteFill style={{ fontFamily: cute, color: P.ink, opacity: exit }}>
      <CuteBg tint={tint} />
      {children}
    </AbsoluteFill>
  );
};

const Note: React.FC<{ k: number; p: number; children: React.ReactNode }> = ({ k, p, children }) => (
  <div style={{ fontSize: 32 * k, color: P.soft, fontWeight: 700, opacity: p }}>{children}</div>
);

const Thumb: React.FC<{ k: number; src: string; w: number; rot?: number; style?: React.CSSProperties }> = ({ k, src, w, rot = 0, style }) => (
  <div style={{ transform: `rotate(${rot}deg)`, ...style }}>
    <Sticker k={k} radius={28} style={{ overflow: "hidden", width: w * k, height: w * k * (16 / 9), padding: 0 }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </Sticker>
  </div>
);

// ---------- P1: gõ chủ đề → ra video ----------
const TOPIC = "Bí quyết pha cà phê ngon ☕";

export const Hook: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const b = useBounce();
  const typed = Math.round(interpolate(frame, [4, beat("p1", 0.4)], [0, [...TOPIC].length], clamp));
  const printAt = beat("p1", 0.5);
  const paper = interpolate(frame, [printAt, printAt + 18], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const shaking = frame > beat("p1", 0.4) && frame < printAt + 10 ? 1 : 0;
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", padding: `${150 * k}px ${60 * k}px`, gap: 40 * k }}>
        <div style={{ textAlign: "center", ...drop(b(0)) }}>
          <Bubble k={k} size={112}>Gõ chủ đề</Bubble>
          <Bubble k={k} size={112} color={P.pink}>
            ➜ ra video!
          </Bubble>
        </div>
        <Sticker k={k} style={{ width: 900 * k, padding: `${26 * k}px ${36 * k}px`, fontSize: 52 * k, fontWeight: 700, ...pop(b(3, 10)) }}>
          <span style={{ color: P.soft, fontSize: 34 * k, display: "block" }}>Chủ đề video</span>
          {[...TOPIC].slice(0, typed).join("")}
          <span style={{ opacity: Math.floor(frame / 8) % 2 ? 0 : 1, color: P.pink }}>|</span>
        </Sticker>
        <div style={{ position: "relative", width: 900 * k, height: 900 * k, display: "flex", justifyContent: "center" }}>
          {/* thẻ video in ra: video mẫu thật trong README */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 250 * k,
              transform: `translate(-50%, ${interpolate(paper, [0, 1], [-200, 180]) * k}px) rotate(${interpolate(paper, [0, 1], [0, -6])}deg) scale(${interpolate(paper, [0, 1], [0.4, 1])})`,
              opacity: paper > 0 ? 1 : 0,
            }}
          >
            <Thumb k={k} src="mpt/15-en-portrait-coffee-science.jpg" w={250} />
          </div>
          <div style={{ position: "absolute", top: 0, ...pop(b(6, 9)) }}>
            <Printer size={420 * k} shake={shaking} />
          </div>
          <div style={{ position: "absolute", right: 30 * k, top: 690 * k, ...pop(b(printAt + 14, 7)) }}>
            <Chip k={k} bg={P.butter} size={44}>
              Xong rồi! ✨
            </Chip>
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P2: giới thiệu + GitHub ----------
const viewOf = (box: Size): Size => ({ width: box.width, height: box.height - HEADER_H });

export const Intro: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const b = useBounce();
  const shot = SHOT as typeof SHOT & { star: Box };
  const stars = interpolate(frame, [beat("p2", 0.55), beat("p2", 0.88)], [0, parseStarLabel(shot.starLabel)], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: { cx: 640, cy: 450, s: view.width / shot.page.width } },
    { at: beat("p2", 0.45), cam: fitBox({ x: 960, y: 170, width: 300, height: 64 }, view) },
  ];
  return (
    <Scene tint={P.mint}>
      <SplitLayout
        mediaFrac={0.34}
        head={
          <div style={{ textAlign: "center", ...drop(b(0)) }}>
            <Chip k={k} bg={P.mint} size={42} style={{ marginBottom: 20 * k }}>
              Mã nguồn mở · MIT
            </Chip>
            <Bubble k={k} size={96}>MoneyPrinter</Bubble>
            <Bubble k={k} size={96} color={P.butter}>
              Turbo 💸
            </Bubble>
          </div>
        }
        media={(box) => (
          <div style={pop(b(4, 11))}>
            <Sticker k={k} style={{ overflow: "hidden", padding: 0 }}>
              <ScreenCard
                src={shot.file}
                page={shot.page}
                view={viewOf({ width: box.width - 12 * k, height: box.height })}
                keys={keys(viewOf({ width: box.width - 12 * k, height: box.height }))}
                highlights={[{ box: shot.star, from: beat("p2", 0.5) }]}
                accent={P.butter}
                header={<UrlBar url={REPO_URL} muted="#9AA3B5" color="#F5F7FB" from={2} />}
              />
            </Sticker>
          </div>
        )}
        foot={
          <div style={{ display: "flex", justifyContent: "center", ...pop(b(beat("p2", 0.5), 7)) }}>
            <Sticker k={k} bg={P.butter} radius={999} style={{ display: "flex", alignItems: "center", gap: 20 * k, padding: `${14 * k}px ${44 * k}px` }}>
              <span style={{ fontSize: 80 * k, transform: `rotate(${Math.sin(frame / 5) * 12}deg)`, display: "inline-block" }}>⭐</span>
              <span style={{ fontSize: 110 * k, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{Math.round(stars)}K</span>
              <span style={{ fontSize: 44 * k, fontWeight: 700 }}>sao</span>
            </Sticker>
          </div>
        }
      />
    </Scene>
  );
};

// ---------- P3: AI tự làm từng bước ----------
const STEPS = [
  { at: 0.04, icon: "📝", label: "Kịch bản", bg: P.pink },
  { at: 0.22, icon: "🎬", label: "Cảnh quay", bg: P.sky },
  { at: 0.4, icon: "🎙️", label: "Lồng tiếng", bg: P.mint },
  { at: 0.58, icon: "💬", label: "Phụ đề", bg: P.butter },
  { at: 0.76, icon: "🎵", label: "Nhạc nền", bg: P.lilac },
];

export const Steps: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const b = useBounce();
  return (
    <Scene tint={P.lilac}>
      <AbsoluteFill style={{ alignItems: "center", padding: `${150 * k}px ${60 * k}px`, gap: 44 * k }}>
        <div style={{ textAlign: "center", ...drop(b(0)) }}>
          <Bubble k={k} size={104}>AI tự làm</Bubble>
          <Bubble k={k} size={104} color={P.mint}>
            hết luôn!
          </Bubble>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 26 * k, width: 960 * k }}>
          {STEPS.map((s, i) => {
            const p = b(beat("p3", s.at), 7);
            const wiggle = Math.sin(frame / 6 + i) * 3;
            return (
              <div key={s.label} style={{ ...pop(p), transform: `${pop(p).transform} rotate(${(i % 2 ? 3 : -3) + wiggle}deg)` }}>
                <Sticker k={k} bg={s.bg} style={{ width: 290 * k, padding: `${22 * k}px 0`, textAlign: "center" }}>
                  <div style={{ fontSize: 90 * k, lineHeight: 1.1 }}>{s.icon}</div>
                  <div style={{ fontSize: 46 * k, fontWeight: 800 }}>{s.label}</div>
                </Sticker>
              </div>
            );
          })}
        </div>
        <div style={pop(b(4, 9))}>
          <Printer size={300 * k} shake={frame > beat("p3", 0.8) ? 1 : 0} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P4: giao diện web thật, bấm 1 nút ----------
const WEBUI = { file: "mpt/webui-en.jpg", page: { width: 2550, height: 1776 } };
const GENERATE: Box = { x: 3, y: 1651, width: 2544, height: 79 };

export const WebUI: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const b = useBounce();
  const clickAt = beat("p4", 0.8);
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: { cx: 1275, cy: 888, s: view.width / WEBUI.page.width } },
    { at: beat("p4", 0.2), cam: fitBox({ x: 20, y: 200, width: 1300, height: 700 }, view, 10) },
    { at: beat("p4", 0.5), cam: fitBox({ x: 700, y: 1500, width: 1150, height: 330 }, view, 10) },
  ];
  // Con trỏ bay tới nút rồi bấm (toạ độ theo màn hình, trong khung media).
  const cur = interpolate(frame, [beat("p4", 0.55), clickAt], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const press = frame >= clickAt && frame < clickAt + 5 ? 0.85 : 1;
  const ripple = interpolate(frame, [clickAt, clickAt + 15], [0, 1], clamp);
  return (
    <Scene tint={P.sky}>
      <SplitLayout
        mediaFrac={0.36}
        head={
          <div style={{ textAlign: "center", ...drop(b(0)) }}>
            <Bubble k={k} size={104}>Bấm 1 nút</Bubble>
            <Bubble k={k} size={104} color={P.sky}>
              là xong!
            </Bubble>
          </div>
        }
        media={(box) => {
          const view = viewOf({ width: box.width - 12 * k, height: box.height });
          return (
            <div style={{ position: "relative", ...pop(b(3, 11)) }}>
              <Sticker k={k} style={{ overflow: "hidden", padding: 0 }}>
                <ScreenCard
                  src={WEBUI.file}
                  page={WEBUI.page}
                  view={view}
                  keys={keys(view)}
                  highlights={[{ box: GENERATE, from: beat("p4", 0.6) }]}
                  accent={P.pink}
                  header={<UrlBar url="localhost:8501 · WebUI" muted="#9AA3B5" color="#F5F7FB" from={2} />}
                />
              </Sticker>
              <div
                style={{
                  position: "absolute",
                  left: interpolate(cur, [0, 1], [box.width * 0.9, box.width * 0.5]),
                  top: interpolate(cur, [0, 1], [box.height * 0.2, HEADER_H + view.height * 0.62]),
                  opacity: frame > beat("p4", 0.5) ? 1 : 0,
                }}
              >
                <div style={{ position: "absolute", left: -60 * k, top: -60 * k, width: 120 * k, height: 120 * k, borderRadius: "50%", border: `${6 * k}px solid ${P.pink}`, opacity: ripple > 0 ? 1 - ripple : 0, transform: `scale(${0.3 + ripple})` }} />
                <svg width={80 * k} height={80 * k} viewBox="0 0 24 24" style={{ transform: `scale(${press})`, transformOrigin: "0 0" }}>
                  <path d="M4 2l15 11-6.5 1.2 3.6 6.8-2.6 1.4-3.6-6.8L5 20z" fill="#FFFFFF" stroke={P.ink} strokeWidth={1.8} strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          );
        }}
        foot={
          <div style={{ display: "flex", justifyContent: "center", gap: 18 * k, flexWrap: "wrap" }}>
            {["WebUI", "API", "CLI", "AI Agent"].map((t, i) => (
              <Chip key={t} k={k} bg={[P.pink, P.mint, P.butter, P.lilac][i]} size={44} style={pop(b(beat("p4", 0.15 + i * 0.1), 8))}>
                {t}
              </Chip>
            ))}
          </div>
        }
      />
    </Scene>
  );
};

// ---------- P5: mọi khổ, đăng thẳng lên mạng xã hội ----------
const GALLERY = ["mpt/09-en-portrait-future-robotics.jpg", "mpt/11-en-portrait-small-habits.jpg", "mpt/15-en-portrait-coffee-science.jpg", "mpt/07-zh-portrait-space-exploration.jpg"];

export const Formats: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const b = useBounce();
  const fan = interpolate(frame, [4, beat("p5", 0.4)], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const formats = [
    { r: "9:16", w: 60, h: 106, bg: P.pink },
    { r: "16:9", w: 140, h: 79, bg: P.sky },
    { r: "1:1", w: 96, h: 96, bg: P.mint },
  ];
  const platforms = [
    { t: "TikTok", at: 0.5, bg: P.ink, c: "#FFFFFF" },
    { t: "YouTube Shorts", at: 0.6, bg: "#FF5A5A", c: "#FFFFFF" },
    { t: "Instagram", at: 0.7, bg: P.lilac, c: P.ink },
  ];
  return (
    <Scene tint={P.butter}>
      <AbsoluteFill style={{ alignItems: "center", padding: `${150 * k}px ${50 * k}px`, gap: 36 * k }}>
        <div style={{ textAlign: "center", ...drop(b(0)) }}>
          <Bubble k={k} size={100}>Dọc, ngang</Bubble>
          <Bubble k={k} size={100} color={P.butter}>
            hay vuông đều được
          </Bubble>
        </div>
        <div style={{ position: "relative", width: 980 * k, height: 560 * k }}>
          {GALLERY.map((src, i) => {
            const rot = (i - 1.5) * 12 * fan;
            const x = (i - 1.5) * 190 * fan;
            return (
              <div key={src} style={{ position: "absolute", left: "50%", top: 10 * k + Math.abs(i - 1.5) * 26 * fan * k, transform: `translateX(calc(-50% + ${x * k}px))` }}>
                <Thumb k={k} src={src} w={270} rot={rot} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 34 * k }}>
          {formats.map((f, i) => (
            <div key={f.r} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 * k, ...pop(b(beat("p5", 0.1 + i * 0.12), 7)) }}>
              <div style={{ width: f.w * k, height: f.h * k, borderRadius: 14 * k, background: f.bg, border: `${6 * k}px solid ${P.ink}`, boxShadow: `0 ${8 * k}px 0 ${P.ink}` }} />
              <div style={{ fontSize: 40 * k, fontWeight: 800 }}>{f.r}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 28 * k }}>
          {platforms.map((p) => (
            <Chip key={p.t} k={k} bg={p.bg} size={38} style={{ color: p.c, ...pop(b(beat("p5", p.at), 14)) }}>
              {p.t}
            </Chip>
          ))}
        </div>
        <Note k={k} p={b(10)}>* Video mẫu do MoneyPrinterTurbo làm (ảnh trong README)</Note>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P6: có lựa chọn miễn phí ----------
export const Free: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const b = useBounce();
  const items = [
    { at: 0.1, t: "🎬 Pexels", bg: P.mint },
    { at: 0.25, t: "🎬 Pixabay", bg: P.sky },
    { at: 0.6, t: "🎙️ Edge TTS", bg: P.pink },
  ];
  const stampAt = beat("p6", 0.75);
  const sp = b(stampAt, 6);
  return (
    <Scene tint={P.mint}>
      <AbsoluteFill style={{ alignItems: "center", padding: `${150 * k}px ${60 * k}px`, gap: 50 * k }}>
        <div style={{ textAlign: "center", ...drop(b(0)) }}>
          <Bubble k={k} size={100}>Cảnh quay & giọng</Bubble>
          <Bubble k={k} size={100} color={P.mint}>
            có bản miễn phí
          </Bubble>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 * k }}>
          {items.map((it, i) => (
            <div key={it.t} style={{ display: "flex", alignItems: "center", gap: 22 * k, ...pop(b(beat("p6", it.at), 7)) }}>
              <Chip k={k} bg={it.bg} size={60}>
                {it.t}
              </Chip>
              <span style={{ fontSize: 64 * k, display: "inline-block", transform: `translateY(${Math.abs(Math.sin(frame / 5 + i)) * -16 * k}px)` }}>🪙</span>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 20 * k,
            marginBottom: 70 * k,
            transform: `rotate(-10deg) scale(${interpolate(sp, [0, 1], [2.4, 1])})`,
            opacity: frame >= stampAt ? Math.min(1, sp * 2) : 0,
          }}
        >
          <Sticker k={k} bg={P.butter} style={{ padding: `${10 * k}px ${50 * k}px`, fontSize: 120 * k, fontWeight: 800, letterSpacing: 4 * k }}>
            FREE 0đ
          </Sticker>
        </div>
        <Note k={k} p={b(8)}>* AI viết kịch bản cần khoá API, hoặc chạy Ollama trên máy</Note>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P7: lưu lại & thử ngay ----------
export const Outro: React.FC = () => {
  const { k } = useLayout();
  const b = useBounce();
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 40 * k, paddingBottom: 180 * k }}>
        <div style={pop(b(0, 8))}>
          <Printer size={360 * k} wave />
        </div>
        <div style={{ textAlign: "center", ...pop(b(2, 7)) }}>
          <Bubble k={k} size={130}>Lưu lại</Bubble>
          <Bubble k={k} size={130} color={P.pink}>
            & thử ngay!
          </Bubble>
        </div>
        <div style={pop(b(5, 9))}>
          <Chip k={k} bg="#FFFFFF" size={34}>
            🔗 {REPO_URL}
          </Chip>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P8: đăng ký + câu hỏi ----------
export const Subscribe: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const b = useBounce();
  const btnAt = beat("p8", 0.2);
  const pulse = 1 + Math.sin(frame / 5) * 0.05;
  return (
    <Scene tint={P.lilac}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 50 * k, padding: `0 ${60 * k}px ${200 * k}px` }}>
        <div style={{ position: "relative", ...pop(b(0, 9)) }}>
          <Sticker k={k} style={{ padding: `${40 * k}px ${46 * k}px`, textAlign: "center", fontSize: 76 * k, fontWeight: 800, lineHeight: 1.15 }}>
            Bạn muốn làm video
            <br />
            về <span style={{ color: P.pink }}>chủ đề gì?</span> 🤔
          </Sticker>
          <div style={{ position: "absolute", left: 120 * k, bottom: -38 * k, width: 0, height: 0, borderLeft: `${30 * k}px solid transparent`, borderRight: `${30 * k}px solid transparent`, borderTop: `${40 * k}px solid ${P.ink}` }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 30 * k, marginTop: 20 * k }}>
          <div style={pop(b(4, 9))}>
            <Printer size={220 * k} wave />
          </div>
          <div style={{ fontSize: 46 * k, fontWeight: 800, color: P.ink, ...pop(b(btnAt * 0.6, 9)) }}>💬 Bình luận nhé!</div>
        </div>
        <div style={{ opacity: pop(b(btnAt, 7)).opacity, transform: `scale(${Math.max(0, b(btnAt, 7)) * pulse})` }}>
          <Sticker k={k} bg={P.pink} radius={999} style={{ padding: `${22 * k}px ${64 * k}px`, fontSize: 72 * k, fontWeight: 800, color: "#FFFFFF", WebkitTextStroke: `${3 * k}px ${P.ink}`, paintOrder: "stroke fill" }}>
            🔔 Đăng ký kênh
          </Sticker>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
