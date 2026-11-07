import { AbsoluteFill, getInputProps, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Segment } from "../timeline";
import { useLayout } from "./layout";
import { C, fontFamily } from "./ui";

// Hiệu ứng dùng chung theo phong cách riêng của kênh: phụ đề theo từ, đốm sáng nền, nhãn chương đánh số,
// so sánh chia đôi màn hình, đường dẫn luồng, con dấu.

// ---------- Phụ đề theo từ ----------
export type Word = { w: string; t0: number; t1: number };

/**
 * Chia lời đọc thành từ và ước lượng thời điểm từng từ theo số ký tự (tiếng Việt mỗi chữ ~ một âm tiết),
 * cộng thêm khoảng nghỉ ở dấu phẩy / dấu chấm. Không cần nhận dạng giọng nói, nên không bao giờ sai chữ.
 */
export const timeWords = (text: string, start: number, dur: number): Word[] => {
  const raw = text.split(/\s+/).filter(Boolean);
  const weight = (w: string) => 1 + w.length * 0.12 + (/[,:;]$/.test(w) ? 0.9 : /[.!?]$/.test(w) ? 1.4 : 0);
  const total = raw.reduce((s, w) => s + weight(w), 0);
  let t = start;
  return raw.map((w) => {
    const d = (weight(w) / total) * dur;
    const word = { w, t0: t, t1: t + d };
    t += d;
    return word;
  });
};

/** Gom từ thành cụm 3–5 chữ, ngắt ở dấu câu để cụm đọc tự nhiên. */
export const chunkWords = (words: Word[], max = 5): Word[][] => {
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= max || /[,.!?:;]$/.test(w.w)) {
      chunks.push(cur);
      cur = [];
    }
  }
  if (cur.length) chunks.push(cur);
  return chunks;
};

/**
 * Phụ đề dưới khung: mỗi lần một cụm, từ đang đọc được một mảng màu `accent` trượt theo (kiểu bút dạ quang).
 * Đặt trong Video.tsx sau các cảnh, cùng segments/starts/durations với Narration.
 */
export const Captions: React.FC<{ segments: Segment[]; starts: number[]; durations: Record<string, number>; accent?: string }> = ({
  segments,
  starts,
  durations,
  accent = "#D97757",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();
  const { k } = L;
  const t = frame / fps;
  // Ảnh bìa (deliver gửi --props={"thumbnail":true}) không cần phụ đề.
  if ((getInputProps() as { thumbnail?: boolean }).thumbnail) return null;
  const i = segments.findIndex((s, idx) => t >= starts[idx] && t < starts[idx] + (durations[s.id] ?? 0) + 0.25);
  if (i < 0) return null;
  const seg = segments[i];
  const words = timeWords(seg.text, starts[i], durations[seg.id] ?? 0);
  const chunks = chunkWords(words);
  const chunk = chunks.find((c) => t < c[c.length - 1].t1 + 0.05) ?? chunks[chunks.length - 1];
  const rise = interpolate(t - chunk[0].t0, [0, 0.15], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: (L.landscape ? 56 : 200) * k, pointerEvents: "none" }}>
      <div
        style={{
          fontFamily,
          fontSize: (L.landscape ? 54 : 52) * k,
          fontWeight: 800,
          color: C.text,
          textAlign: "center",
          maxWidth: L.width - L.pad * 2,
          lineHeight: 1.5,
          padding: `${6 * k}px ${22 * k}px`,
          borderRadius: 18 * k,
          background: "rgba(5,8,14,0.72)",
          textShadow: "0 3px 14px rgba(0,0,0,0.9)",
          transform: `translateY(${rise}px)`,
          opacity: interpolate(rise, [0, 16], [1, 0.2]),
        }}
      >
        {chunk.map((w, j) => {
          const on = t >= w.t0 && t < w.t1 + 0.04;
          return (
            <span key={j}>
            {j > 0 ? " " : ""}
            <span
              style={{
                padding: `0 ${6 * k}px`,
                borderRadius: 8 * k,
                background: on ? accent : "transparent",
                color: on ? "#0A0D16" : C.text,
                textShadow: on ? "none" : undefined,
              }}
            >
              {w.w}
            </span>
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Đốm sáng nền ----------
const rand = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/** Vài đốm sáng mờ (bokeh) lớn nhỏ khác nhau, trôi lên chậm và lắc nhẹ. Đặt sau Background. */
export const Bokeh: React.FC<{ count?: number; color: string }> = ({ count = 14, color }) => {
  const frame = useCurrentFrame();
  const L = useLayout();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: count }, (_, i) => {
        const size = (20 + rand(i + 5) * 70) * L.k;
        const speed = 0.2 + rand(i + 9) * 0.4;
        const x = rand(i + 1) * L.width + Math.sin(frame / 50 + i) * 30 * L.k;
        const y = ((((rand(i + 3) * (L.height + size)) - frame * speed) % (L.height + size)) + L.height + size) % (L.height + size) - size;
        const c = i % 3 === 0 ? "#ffffff" : color;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${c}55 0%, ${c}10 55%, transparent 70%)`,
              opacity: 0.35 + 0.25 * Math.sin(frame / 30 + i),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- Nhãn chương đánh số ----------
/** "01 ── Chat là trò chuyện": số lớn viền, gạch ngang mọc ra, tiêu đề trượt vào. */
export const ChapterTag: React.FC<{ n: number; title: string; color: string }> = ({ n, title, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { k } = useLayout();
  const p = spring({ frame, fps, config: { damping: 18 } });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 * k }}>
      <div style={{ fontFamily, fontSize: 64 * k, fontWeight: 900, color: "transparent", WebkitTextStroke: `${2.5 * k}px ${color}`, lineHeight: 1 }}>
        {String(n).padStart(2, "0")}
      </div>
      <div style={{ width: 70 * k * p, height: 5 * k, borderRadius: 3 * k, background: color }} />
      <div style={{ fontFamily, fontSize: 44 * k, fontWeight: 800, color, letterSpacing: 2 * k, opacity: p, transform: `translateX(${(1 - p) * 30}px)`, whiteSpace: "nowrap" }}>
        {title.toUpperCase()}
      </div>
    </div>
  );
};

// ---------- So sánh chia đôi ----------
type Side = { icon: string; title: string; lines: string[]; color: string };
/**
 * Hai nửa màn so sánh, đường chia giữa có chữ "hay". `lean` (-1…1) nghiêng đường chia về một bên
 * để nhấn bên thắng (1 = bên phải rộng hơn).
 */
export const SplitCompare: React.FC<{ left: Side; right: Side; at?: number; lean?: number; titleSize?: number }> = ({ left, right, at = 0, lean = 0, titleSize = 72 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();
  const { k } = L;
  const p = spring({ frame: frame - at, fps, config: { damping: 16 } });
  const tilt = spring({ frame: frame - at - 20, fps, config: { damping: 20 } }) * lean;
  const h = (L.landscape ? 420 : 520) * k;
  const lw = 50 - tilt * 12;
  const half = (s: Side, align: "left" | "right", dim: number) => (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: align === "left" ? "flex-start" : "flex-end", padding: `0 ${40 * k}px`, opacity: dim }}>
      <div style={{ fontSize: 100 * k, lineHeight: 1 }}>{s.icon}</div>
      <div style={{ fontFamily, fontSize: titleSize * k, fontWeight: 900, color: s.color, marginTop: 10 * k }}>{s.title}</div>
      {s.lines.map((l) => (
        <div key={l} style={{ fontFamily, fontSize: 38 * k, fontWeight: 700, color: C.text, textAlign: align, lineHeight: 1.35 }}>
          {l}
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ position: "relative", height: h, borderRadius: 36 * k, overflow: "hidden", display: "flex", opacity: p }}>
      <div style={{ position: "absolute", inset: 0, width: `${lw}%`, background: `linear-gradient(135deg, ${left.color}38, ${left.color}0A)` }} />
      <div style={{ position: "absolute", inset: 0, left: `${lw}%`, background: `linear-gradient(225deg, ${right.color}38, ${right.color}0A)` }} />
      <div style={{ position: "relative", display: "flex", width: "100%" }}>
        <div style={{ width: `${lw}%`, display: "flex", transform: `translateX(${(1 - p) * -60}px)` }}>{half(left, "left", lean > 0 ? 1 - tilt * 0.45 : 1)}</div>
        <div style={{ width: `${100 - lw}%`, display: "flex", transform: `translateX(${(1 - p) * 60}px)` }}>{half(right, "right", lean < 0 ? 1 + tilt * 0.45 : 1)}</div>
      </div>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${lw}%`, width: 4 * k, background: "rgba(255,255,255,0.7)", transform: `scaleY(${p})` }} />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: `${lw}%`,
          transform: "translate(-50%,-50%)",
          padding: `${8 * k}px ${18 * k}px`,
          borderRadius: 999,
          background: C.bg,
          border: "3px solid rgba(255,255,255,0.7)",
          fontFamily,
          fontSize: 34 * k,
          fontWeight: 800,
          color: C.text,
          opacity: p,
        }}
      >
        hay
      </div>
    </div>
  );
};

// ---------- Đường dẫn luồng ----------
/** Mũi tên nét liền mọc dần (p = 0…1), đầu mũi tên tam giác. */
export const GrowArrow: React.FC<{ w: number; color: string; p: number }> = ({ w, color, p }) => {
  const { k } = useLayout();
  const t = 6 * k;
  return (
    <svg width={w} height={t * 5} style={{ overflow: "visible", flexShrink: 0 }}>
      <line x1={0} y1={t * 2.5} x2={Math.max(0, w * p - t * 2)} y2={t * 2.5} stroke={color} strokeWidth={t} strokeLinecap="round" />
      {p > 0.05 && <polygon points={`${w * p},${t * 2.5} ${w * p - t * 3},${t * 0.5} ${w * p - t * 3},${t * 4.5}`} fill={color} />}
    </svg>
  );
};

/** Ô tròn chứa icon + nhãn, viền sáng khi `active`. */
export const StepDot: React.FC<{ icon: React.ReactNode; label: string; color: string; active?: boolean; size?: number }> = ({ icon, label, color, active = false, size = 130 }) => {
  const frame = useCurrentFrame();
  const { k } = useLayout();
  const s = size * k;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 * k }}>
      <div style={{ position: "relative", width: s, height: s }}>
        {active && (
          <div style={{ position: "absolute", inset: -12 * k, borderRadius: "50%", border: `3px solid ${color}`, opacity: 1 - ((frame % 30) / 30), transform: `scale(${1 + ((frame % 30) / 30) * 0.25})` }} />
        )}
        <div
          style={{
            width: s,
            height: s,
            borderRadius: "50%",
            background: active ? color : "#151A26",
            border: `3px solid ${color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: s * 0.46,
            fontWeight: 900,
            color: active ? "#0A0D16" : C.text,
          }}
        >
          {icon}
        </div>
      </div>
      <div style={{ fontFamily, fontSize: 32 * k, fontWeight: 800, color: C.text, textAlign: "center", whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
};

// ---------- Con dấu ----------
/** Con dấu chữ nghiêng, đóng xuống từ to → nhỏ (vd "CHỈ GÓI TRẢ PHÍ"). */
export const Stamp: React.FC<{ text: string; color?: string; at: number; rotate?: number }> = ({ text, color = "#F28B82", at, rotate = -8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { k } = useLayout();
  const p = spring({ frame: frame - at, fps, config: { damping: 9, mass: 0.6 } });
  if (frame < at) return null;
  return (
    <div
      style={{
        display: "inline-block",
        padding: `${10 * k}px ${26 * k}px`,
        border: `${5 * k}px double ${color}`,
        borderRadius: 10 * k,
        color,
        fontFamily,
        fontSize: 46 * k,
        fontWeight: 900,
        letterSpacing: 3 * k,
        whiteSpace: "nowrap",
        transform: `rotate(${rotate}deg) scale(${interpolate(p, [0, 1], [2.2, 1])})`,
        opacity: Math.min(1, p * 1.5),
      }}
    >
      {text}
    </div>
  );
};
