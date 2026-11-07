import { getInputProps, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Segment } from "../timeline";
import { chunkWords, timeWords } from "./fx";
import { useLayout } from "./layout";
import { C, fontFamily } from "./ui";

/**
 * Nhân vật dẫn chuyện: robot linh vật vẽ bằng SVG, đặt trong khung tròn ở góc dưới, phụ đề hiện bên cạnh.
 * Miệng mở theo âm lượng giọng đọc (mouth.json do `npm run mouth -- <name>` tạo), mắt chớp, đầu lắc lư nhẹ.
 * Thiết kế gốc của kênh — không dựa trên nhân vật của kênh khác.
 */

type Mouth = Record<string, number[]>;

/** Độ mở miệng (0..1) ở thời điểm t (giây) của video. */
const mouthAt = (t: number, segments: Segment[], starts: number[], mouth: Mouth, fps: number) => {
  for (let i = 0; i < segments.length; i++) {
    const env = mouth[segments[i].id];
    if (!env) continue;
    const f = Math.floor((t - starts[i]) * fps);
    if (f >= 0 && f < env.length) return env[f];
  }
  return 0;
};

export const Robot: React.FC<{ size: number; open: number; accent: string; eye: string; talking: boolean }> = ({ size, open, accent, eye, talking }) => {
  const frame = useCurrentFrame();
  // Chớp mắt: mỗi ~3,3 giây, nhắm trong 5 khung; thêm một lần chớp đôi lệch nhịp cho tự nhiên.
  const cycle = frame % 100;
  const blink = cycle < 5 || (frame % 230 > 8 && frame % 230 < 12) ? 0.12 : 1;
  // Mắt liếc nhẹ.
  const look = Math.sin(frame / 47) * 4;
  const glow = 0.6 + 0.4 * Math.sin(frame / 7);
  const mouthH = 8 + open * 34;
  const mouthW = 64 - open * 10;
  return (
    <svg width={size} height={size} viewBox="0 0 300 300" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="robot-shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4F6FB" />
          <stop offset="1" stopColor="#C9D1E3" />
        </linearGradient>
        <linearGradient id="robot-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DCE2EF" />
          <stop offset="1" stopColor="#9AA6C2" />
        </linearGradient>
      </defs>
      {/* Thân + vai */}
      <path d="M58 300 C58 238 92 214 150 214 C208 214 242 238 242 300 Z" fill="url(#robot-body)" />
      <rect x="118" y="250" width="64" height="40" rx="10" fill="#1B2236" />
      {/* Kính lúp trên ngực (SEO) */}
      <circle cx="146" cy="268" r="9" fill="none" stroke={accent} strokeWidth="4" />
      <line x1="153" y1="275" x2="162" y2="284" stroke={accent} strokeWidth="4" strokeLinecap="round" />
      {/* Cổ */}
      <rect x="132" y="196" width="36" height="24" rx="6" fill="#8D97B0" />
      {/* Ăng-ten */}
      <line x1="150" y1="52" x2="150" y2="28" stroke="#9AA6C2" strokeWidth="6" strokeLinecap="round" />
      <circle cx="150" cy="22" r="11" fill={accent} opacity={talking ? glow : 0.7} />
      <circle cx="150" cy="22" r="18" fill={accent} opacity={talking ? glow * 0.25 : 0.1} />
      {/* Tai */}
      <rect x="44" y="104" width="22" height="58" rx="10" fill="#9AA6C2" />
      <rect x="234" y="104" width="22" height="58" rx="10" fill="#9AA6C2" />
      {/* Đầu */}
      <rect x="58" y="50" width="184" height="152" rx="52" fill="url(#robot-shell)" />
      {/* Màn hình mặt */}
      <rect x="78" y="70" width="144" height="112" rx="38" fill="#121828" />
      <rect x="84" y="76" width="70" height="10" rx="5" fill="#FFFFFF" opacity="0.08" />
      {/* Mắt */}
      <g transform={`translate(${look} 0)`}>
        <rect x="104" y={112 - 14 * blink} width="24" height={28 * blink} rx="10" fill={eye} />
        <rect x="172" y={112 - 14 * blink} width="24" height={28 * blink} rx="10" fill={eye} />
      </g>
      {/* Má */}
      <circle cx="98" cy="146" r="7" fill={accent} opacity="0.45" />
      <circle cx="202" cy="146" r="7" fill={accent} opacity="0.45" />
      {/* Miệng */}
      <rect x={150 - mouthW / 2} y={150 - mouthH / 2} width={mouthW} height={mouthH} rx={Math.min(mouthH, mouthW) / 2} fill={eye} opacity={0.95} />
      {open > 0.35 && <rect x={150 - mouthW / 2 + 10} y={150 + mouthH / 2 - 8} width={mouthW - 20} height={5} rx={2.5} fill="#121828" opacity="0.5" />}
    </svg>
  );
};

/** Khung tròn chứa robot + phụ đề bên phải, cố định ở dải dưới màn hình (y ≈ 1310..1670 ở 9:16). */
export const HostBand: React.FC<{
  segments: Segment[];
  captionSegments: Segment[];
  starts: number[];
  durations: Record<string, number>;
  mouth: Mouth;
  accent: string;
  eye: string;
  top?: number;
}> = ({ segments, captionSegments, starts, durations, mouth, accent, eye, top = 1310 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { k } = useLayout();
  const t = frame / fps;
  const thumb = (getInputProps() as { thumbnail?: boolean }).thumbnail;
  const open = mouthAt(t, segments, starts, mouth, fps);
  const talking = open > 0.05;
  const enter = spring({ frame: frame - 6, fps, config: { damping: 12 } });
  const bob = Math.sin(frame / 18) * 6 + open * -6;
  const tilt = Math.sin(frame / 31) * 3;
  const D = 340 * k;

  // Phụ đề: cụm 3–4 từ của câu đang đọc, từ đang đọc có nền màu.
  const i = captionSegments.findIndex((s, idx) => t >= starts[idx] && t < starts[idx] + (durations[s.id] ?? 0) + 0.25);
  let caption: React.ReactNode = null;
  if (i >= 0 && !thumb) {
    const seg = captionSegments[i];
    const words = timeWords(seg.text, starts[i], durations[seg.id] ?? 0);
    const chunks = chunkWords(words, 4);
    const chunk = chunks.find((c) => t < c[c.length - 1].t1 + 0.05) ?? chunks[chunks.length - 1];
    const rise = interpolate(t - chunk[0].t0, [0, 0.15], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    caption = (
      <div
        style={{
          fontFamily,
          fontSize: 58 * k,
          fontWeight: 800,
          lineHeight: 1.35,
          color: C.text,
          textShadow: "0 4px 18px rgba(0,0,0,0.9)",
          transform: `translateY(${rise}px)`,
          opacity: interpolate(rise, [0, 18], [1, 0.2]),
        }}
      >
        {chunk.map((w, j) => {
          const on = t >= w.t0 && t < w.t1 + 0.04;
          return (
            <span key={j}>
              {j > 0 ? " " : ""}
              <span style={{ padding: `0 ${8 * k}px`, borderRadius: 10 * k, background: on ? accent : "transparent", color: on ? "#0A0D16" : C.text }}>
                {w.w}
              </span>
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ position: "absolute", left: 50 * k, right: 50 * k, top: top * k, height: D, display: "flex", alignItems: "center", gap: 40 * k }}>
      <div
        style={{
          position: "relative",
          width: D,
          height: D,
          flexShrink: 0,
          borderRadius: "50%",
          overflow: "hidden",
          background: `radial-gradient(circle at 50% 38%, #2A3354, #111729 70%)`,
          border: `${7 * k}px solid ${accent}`,
          boxShadow: `0 0 ${talking ? 60 : 30}px ${accent}66`,
          transform: `scale(${enter})`,
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 26 * k + bob * k, transform: `rotate(${tilt}deg)`, transformOrigin: "50% 90%" }}>
          <Robot size={D - 14 * k} open={open} accent={accent} eye={eye} talking={talking} />
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>{caption}</div>
    </div>
  );
};
