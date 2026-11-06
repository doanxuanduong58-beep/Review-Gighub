import { loadFont } from "@remotion/google-fonts/BeVietnamPro";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const { fontFamily } = loadFont("normal", {
  weights: ["500", "700", "900"],
  subsets: ["vietnamese", "latin"],
});

export const C = {
  bg: "#0A0D16",
  text: "#F5F7FB",
  muted: "#9AA3B5",
  line: "rgba(255,255,255,0.08)",
};

export const Background: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 60) * 60;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
          backgroundSize: "90px 90px",
          maskImage: "radial-gradient(ellipse at 50% 40%, black 30%, transparent 75%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          left: -10 + drift,
          top: 260,
          background: `radial-gradient(circle, ${accent}2E 0%, ${accent}12 35%, transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Composition giữ chỗ khi project chưa có video nào (Remotion cần ít nhất một). */
export const Placeholder: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg, color: C.muted, fontFamily, fontSize: 48, alignItems: "center", justifyContent: "center" }}>
    Chưa có video — thêm trong src/Root.tsx
  </AbsoluteFill>
);

// Fade out ở cuối mỗi cảnh.
export const useExit = (frames = 10) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return interpolate(frame, [durationInFrames - frames, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

export const StarIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      fill={color}
      d="M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95z"
    />
  </svg>
);

export const CheckIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill={color} opacity={0.18} />
    <path d="M7 12.5l3.2 3.2L17 9" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const BookmarkIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill={color} d="M6 2.5h12a1 1 0 0 1 1 1V21l-7-4.2L5 21V3.5a1 1 0 0 1 1-1z" />
  </svg>
);
