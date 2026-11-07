import { Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export type Size = { width: number; height: number };
export type Box = { x: number; y: number; width: number; height: number };
export type Cam = { cx: number; cy: number; s: number };
// Camera chuyển sang `cam` bắt đầu từ frame `at` (frame đầu tiên của key đầu là vị trí xuất phát).
export type CamKey = { at: number; cam: Cam };
export type Highlight = { box: Box; from: number; to?: number };

const MOVE_FRAMES = 30;
/** Chiều cao thanh tiêu đề của ScreenCard: view.height = chiều cao ô - HEADER_H. */
export const HEADER_H = 84;

// Giữ khung xem nằm trong ảnh chụp.
const clampCam = ({ cx, cy, s }: Cam, page: Size, view: Size): Cam => {
  const halfW = Math.min(view.width / s / 2, page.width / 2);
  const halfH = Math.min(view.height / s / 2, page.height / 2);
  return {
    s,
    cx: Math.min(Math.max(cx, halfW), page.width - halfW),
    cy: Math.min(Math.max(cy, halfH), page.height - halfH),
  };
};

const mix = (a: Cam, b: Cam, t: number): Cam => ({
  cx: a.cx + (b.cx - a.cx) * t,
  cy: a.cy + (b.cy - a.cy) * t,
  // Nội suy scale theo log để zoom đều tay.
  s: Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * t),
});

/** "Star69.8k (69.8k)" -> 69.8 (nghìn sao); "Star812 (812)" -> 0.812. */
export const parseStarLabel = (label: string | null | undefined): number => {
  const m = label?.match(/\(([\d.,]+)(k?)\)/i);
  if (!m) return 0;
  const n = Number(m[1].replace(/,/g, ""));
  return m[2] ? n : n / 1000;
};

/**
 * Camera vừa khít một vùng của ảnh, chừa lề `pad` (đơn vị px của ảnh).
 * Zoom bị chặn ở `maxScale` (ảnh @2x zoom quá ~2.5× bắt đầu mờ). Muốn bước camera có tác dụng thì
 * vùng phải hẹp hơn ~½ khung đang thấy — vùng rộng cho s≈1, gần như đứng yên.
 */
export const fitBox = (box: Box, view: Size, pad = 24, maxScale = 2.5): Cam => ({
  cx: box.x + box.width / 2,
  cy: box.y + box.height / 2,
  s: Math.min(maxScale, view.width / (box.width + pad * 2), view.height / (box.height + pad * 2)),
});

export const ScreenCard: React.FC<{
  src: string;
  page: Size;
  view: Size;
  keys: CamKey[];
  highlights?: Highlight[];
  accent: string;
  header: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ src, page, view, keys, highlights = [], accent, header, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (at: number) => spring({ frame: frame - at, fps, config: { damping: 200 }, durationInFrames: MOVE_FRAMES });

  const cams = keys.map((k) => clampCam(k.cam, page, view));
  const cam = cams.slice(1).reduce((acc, c, i) => mix(acc, c, t(keys[i + 1].at)), cams[0]);
  const pulse = 1 + Math.sin(frame / 4) * 0.05;

  return (
    <div
      style={{
        width: view.width,
        borderRadius: 28,
        overflow: "hidden",
        background: "#161B22",
        border: "2px solid rgba(255,255,255,0.12)",
        boxShadow: `0 40px 120px rgba(0,0,0,0.55), 0 0 0 1px ${accent}22`,
        ...style,
      }}
    >
      <div style={{ height: HEADER_H, display: "flex", alignItems: "center", gap: 22, padding: "0 28px", background: "#0D1117" }}>
        <div style={{ display: "flex", gap: 12 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 20, height: 20, borderRadius: 10, background: c }} />
          ))}
        </div>
        {header}
      </div>

      <div style={{ position: "relative", width: view.width, height: view.height, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            width: page.width,
            height: page.height,
            transformOrigin: "0 0",
            transform: `translate(${view.width / 2 - cam.cx * cam.s}px, ${view.height / 2 - cam.cy * cam.s}px) scale(${cam.s})`,
          }}
        >
          <Img src={staticFile(src)} style={{ width: page.width, height: page.height }} />
          {highlights.map((h, i) => {
            const opacity = Math.min(t(h.from), h.to === undefined ? 1 : 1 - t(h.to));
            // Kích thước viền tính theo px trên màn hình (chia cho mức zoom) để ảnh lớn bị thu nhỏ
            // vẫn có vòng sáng rõ, ảnh zoom to thì viền không bị phình.
            const px = (n: number) => n / cam.s;
            const pad = px(14);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: h.box.x - pad,
                  top: h.box.y - pad,
                  width: h.box.width + pad * 2,
                  height: h.box.height + pad * 2,
                  borderRadius: px(22),
                  border: `${px(7)}px solid ${accent}`,
                  boxShadow: `0 0 ${px(40)}px ${accent}`,
                  opacity,
                  transform: `scale(${pulse})`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Thanh địa chỉ gõ dần từng ký tự.
export const UrlBar: React.FC<{ url: string; from?: number; muted: string; color: string }> = ({ url, from = 8, muted, color }) => {
  const frame = useCurrentFrame();
  const typed = Math.round(Math.min(Math.max((frame - from) / 26, 0), 1) * url.length);
  const host = url.indexOf("/") + 1;
  return (
    <div
      style={{
        flex: 1,
        height: 54,
        borderRadius: 27,
        background: "rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "0 24px",
        fontSize: 32,
        fontWeight: 500,
        color,
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth={2.4}>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
      <span>
        <span style={{ color: muted }}>{url.slice(0, Math.min(typed, host))}</span>
        {url.slice(host, typed)}
      </span>
    </div>
  );
};
