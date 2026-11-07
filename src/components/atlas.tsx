// Hiệu ứng minh hoạ từ Motion Atlas (vendor/motion-atlas, MIT — github.com/skylarzzzz/motion-atlas).
// KHÔNG dùng làm nền video (người dùng bỏ nền Atlas 25/10/2026) — chỉ làm hình minh hoạ trong khung, như một ảnh/clip.
// Clip xuất bằng `npm run atlas -- KEY --dur 8` (ngang) vào public/motion-atlas/KEY.mp4; danh mục: idea-to-video/references/atlas.md.
import { Loop, OffthreadVideo, staticFile, useVideoConfig } from "remotion";

/**
 * Clip hiệu ứng trong khung bo góc (16:9), lặp lại. `width` px; `rate` < 1 làm chậm; `from` (giây) bắt đầu giữa clip.
 * `seconds` = độ dài clip đã xuất (mặc định 8).
 */
export const AtlasClip: React.FC<{ effect: string; width: number; rate?: number; from?: number; seconds?: number; style?: React.CSSProperties }> = ({
  effect,
  width,
  rate = 1,
  from = 0,
  seconds = 8,
  style,
}) => {
  const { fps } = useVideoConfig();
  return (
    <div style={{ width, height: (width * 9) / 16, borderRadius: 24, overflow: "hidden", border: "2px solid rgba(255,255,255,0.15)", boxShadow: "0 40px 120px rgba(0,0,0,0.55)", ...style }}>
      <Loop durationInFrames={Math.round((seconds / rate) * fps)}>
        <OffthreadVideo src={staticFile(`motion-atlas/${effect}.mp4`)} muted playbackRate={rate} startFrom={Math.round(from * fps)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </Loop>
    </div>
  );
};
