import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useLayout } from "./layout";
import { Background, C, fontFamily } from "./ui";

/**
 * Cảnh cuối: câu hỏi gợi bình luận (bong bóng chat) + nút "Đăng ký kênh" nhịp đập.
 * Nút tự vẽ trung tính — không giả nút của YouTube/TikTok. Đặt sau cảnh Outro (Outro phải mờ dần, bỏ fade={false}).
 *   question: "\n" là chỗ ngắt dòng có chủ ý.   btnAt: frame trong cảnh lúc nút hiện (vd beat("p13", 0.45)).
 */
export const SubscribeScene: React.FC<{ question: string; accent: string; btnAt: number; label?: string }> = ({
  question,
  accent,
  btnAt,
  label = "🔔 Đăng ký kênh",
}) => {
  const L = useLayout();
  const { k } = L;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = (delay: number, damping = 200) => spring({ frame: frame - delay, fps, config: { damping } });
  const pulse = 1 + Math.sin(frame / 6) * 0.04;
  const bubble = enter(0, 14);
  const hint = enter(btnAt * 0.6);
  const btn = enter(btnAt, 12);
  // Dòng dài (> ~19 ký tự ở 72px) bị rớt một chữ lẻ ở khổ dọc -> thu nhỏ chữ theo dòng dài nhất.
  const text = question.replace(/\\n/g, "\n");
  const longest = Math.max(...text.split("\n").map((l) => l.length));
  const qSize = 72 * k * Math.min(1, 19 / longest);
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text }}>
      <Background accent={accent} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: L.pad }}>
        <div style={{ width: L.landscape ? 1300 : "100%", display: "flex", flexDirection: "column", gap: 60 * k }}>
          <div
            style={{
              position: "relative",
              padding: `${44 * k}px ${50 * k}px`,
              borderRadius: 48 * k,
              background: "#F5F7FB",
              color: "#111827",
              fontSize: qSize,
              fontWeight: 900,
              lineHeight: 1.2,
              textAlign: "center",
              whiteSpace: "pre",
              opacity: bubble,
              transform: `scale(${interpolate(bubble, [0, 1], [0.7, 1])})`,
            }}
          >
            {/* question="a\nb" trong thuộc tính JSX giữ nguyên chữ "\n" — đổi về ngắt dòng thật. */}
            {text}
            <div
              style={{
                position: "absolute",
                left: 90 * k,
                bottom: -34 * k,
                width: 0,
                height: 0,
                borderLeft: `${34 * k}px solid transparent`,
                borderRight: `${34 * k}px solid transparent`,
                borderTop: `${40 * k}px solid #F5F7FB`,
              }}
            />
          </div>
          <div
            style={{
              fontSize: 54 * k,
              fontWeight: 700,
              textAlign: "center",
              color: C.muted,
              opacity: hint,
              transform: `translateY(${interpolate(hint, [0, 1], [30, 0])}px)`,
            }}
          >
            💬 Bình luận cho mình biết nhé
          </div>
          <div style={{ display: "flex", justifyContent: "center", opacity: btn, transform: `scale(${btn * pulse})` }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24 * k,
                padding: `${30 * k}px ${64 * k}px`,
                borderRadius: 999,
                background: accent,
                color: "#0A0D16",
                fontSize: 64 * k,
                fontWeight: 900,
                boxShadow: `0 0 ${60 * k}px ${accent}88`,
              }}
            >
              {label}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
