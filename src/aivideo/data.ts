import type { Format } from "../components/layout";
import { buildTimeline, type Segment } from "../timeline";
import VO_DURATIONS from "./vo-durations.json";

// Video giới thiệu repo doanxuanduong58-beep/Review-Gighub (skill idea-to-video cho Claude Code).
export const NAME = "aivideo";
export const COMPOSITION_ID = "AiVideo";
export const FORMATS: Format[] = ["9:16"];
export const FPS = 30;

// Cam Claude + vàng điện: hợp nhạc mạnh, nhịp nhanh.
export const BRAND = { orange: "#FF7A45", yellow: "#FFD23F", cyan: "#3DDCFF" };
export const BRAND_GRADIENT = `linear-gradient(90deg, ${BRAND.yellow}, ${BRAND.orange} 55%, #FF4D6D)`;

export const REPO_URL = "github.com/doanxuanduong58-beep/Review-Gighub";

// Nội dung lấy từ .claude/skills/idea-to-video/SKILL.md của repo.
export const SEGMENTS: Segment[] = [
  { id: "p1", start: 0.5, max: 4.5, text: "Video bạn đang xem: kịch bản, giọng đọc, nhạc nền, tất cả đều do AI tự làm." },
  { id: "p2", start: 5.2, max: 3.5, text: "Bí mật nằm trong repo này, một skill cho Claude Code." },
  { id: "p3", start: 9, max: 3, text: "Bạn chỉ cần đưa một ý tưởng, hoặc một đường link." },
  { id: "p4", start: 12.4, max: 4, text: "AI tự nghiên cứu, viết kịch bản, rồi đưa bạn duyệt trước khi dựng." },
  { id: "p5", start: 16.8, max: 3.5, text: "Giọng đọc tiếng Việt chạy ngay trên máy, hoàn toàn miễn phí." },
  { id: "p6", start: 20.6, max: 3.2, text: "Nhạc nền tự tổng hợp bằng code, không lo bản quyền." },
  { id: "p7", start: 24.2, max: 4.5, text: "Một trăm ba mươi tám hiệu ứng chuyển động, xuất mọi khổ từ dọc tới ngang." },
  { id: "p8", start: 29, max: 4, text: "Cuối cùng là cả gói đăng bài: video, ảnh bìa, tiêu đề và hashtag." },
  { id: "p9", start: 33.4, max: 1.6, text: "Lưu lại và thử ngay!" },
  { id: "p10", start: 35.3, max: 5, text: "Đăng ký kênh, và cho mình biết: bạn muốn AI làm video về chủ đề gì? Bình luận nhé!", pad: 1.5 },
];

export const { starts: STARTS, duration: DURATION_S, beat } = buildTimeline(SEGMENTS, VO_DURATIONS, 42);

// Nhạc mạnh, nhịp nhanh (scripts/music.py --style energetic).
export const MUSIC_STYLE = "energetic";
