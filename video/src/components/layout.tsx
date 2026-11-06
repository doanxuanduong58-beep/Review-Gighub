import { AbsoluteFill, Composition, useVideoConfig } from "remotion";

// Khổ hình hỗ trợ. Mỗi video khai báo FORMATS trong data.ts; mỗi khổ là một composition
// `<COMPOSITION_ID>-<slug>` (vd VoiceStudio-9x16) và render ra out/<name>-<slug>.mp4.
export const FORMAT_SIZES = {
  "9:16": { width: 1080, height: 1920 }, // TikTok, Reels, Shorts
  "4:5": { width: 1080, height: 1350 }, // Feed Facebook/Instagram
  "1:1": { width: 1080, height: 1080 },
  "16:9": { width: 1920, height: 1080 }, // YouTube, slide, màn hình ngang
} as const;
export type Format = keyof typeof FORMAT_SIZES;
export const formatSlug = (f: Format) => f.replace(":", "x");

/** Đăng ký một video ở mọi khổ nó khai báo (dùng trong Root.tsx). */
export const VideoCompositions: React.FC<{
  id: string;
  component: React.FC;
  formats: readonly Format[];
  durationInFrames: number;
  fps: number;
}> = ({ id, component, formats, durationInFrames, fps }) => (
  <>
    {formats.map((f) => (
      <Composition
        key={f}
        id={`${id}-${formatSlug(f)}`}
        component={component}
        durationInFrames={durationInFrames}
        fps={fps}
        {...FORMAT_SIZES[f]}
      />
    ))}
  </>
);

export type Layout = {
  width: number;
  height: number;
  landscape: boolean;
  /** Hệ số cỡ chữ/khoảng cách: 1 = thiết kế gốc cho 1080x1920. Nhân mọi kích thước px với `k`. */
  k: number;
  /** Lề ngoài (px đã nhân k). */
  pad: number;
};

export const useLayout = (): Layout => {
  const { width, height } = useVideoConfig();
  const landscape = width > height * 1.2;
  const ratio = height / width;
  // Khổ càng thấp thì chữ càng phải nhỏ để nội dung xếp dọc vẫn vừa chiều cao.
  const k = landscape ? 0.9 : ratio >= 1.7 ? 1 : ratio >= 1.2 ? 0.8 : 0.72;
  return { width, height, landscape, k, pad: (landscape ? 110 : 60) * (landscape ? 1 : width / 1080) };
};

/**
 * Bố cục "chữ + hình":
 *  - khổ dọc/vuông: head ở trên, media ở giữa, foot ở dưới
 *  - khổ ngang: head + foot cột trái, media cột phải chiếm hết chiều cao
 * `media` nhận kích thước ô (px) để dựng ScreenCard vừa khít.
 */
export const SplitLayout: React.FC<{
  head: React.ReactNode;
  media: (box: { width: number; height: number }) => React.ReactNode;
  foot?: React.ReactNode;
  /** Tỉ lệ chiều cao dành cho media ở khổ dọc (mặc định theo khổ). */
  mediaFrac?: number;
}> = ({ head, media, foot, mediaFrac }) => {
  const L = useLayout();
  if (L.landscape) {
    const gap = 80;
    // Media chiếm 58% bề ngang còn lại; cột chữ co theo phần còn lại (minWidth 0 để chữ xuống dòng thay vì tràn).
    const mediaW = Math.round((L.width - L.pad * 2 - gap) * 0.58);
    return (
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: L.pad, gap }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 40 * L.k, justifyContent: "center" }}>
          {head}
          {foot}
        </div>
        <div style={{ width: mediaW, flexShrink: 0 }}>{media({ width: mediaW, height: L.height - L.pad * 2 })}</div>
      </AbsoluteFill>
    );
  }
  const tall = L.height / L.width >= 1.7;
  const frac = mediaFrac ?? (tall ? 0.46 : L.height / L.width >= 1.2 ? 0.5 : 0.52);
  return (
    <AbsoluteFill
      style={{
        flexDirection: "column",
        justifyContent: "flex-start",
        padding: `${(tall ? 150 : 70) * L.k}px ${L.pad}px`,
        gap: 50 * L.k,
      }}
    >
      {head}
      <div>{media({ width: L.width - L.pad * 2, height: Math.round(L.height * frac) })}</div>
      {foot}
    </AbsoluteFill>
  );
};
