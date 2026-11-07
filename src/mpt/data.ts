import type { Format } from "../components/layout";
import { buildTimeline, type Segment } from "../timeline";
import VO_DURATIONS from "./vo-durations.json";

// Video giới thiệu harry0703/MoneyPrinterTurbo, phong cách dễ thương. Nội dung từ README-en.md (07/11/2026).
export const NAME = "mpt";
export const COMPOSITION_ID = "MoneyPrinterTurbo";
export const FORMATS: Format[] = ["9:16"];
export const FPS = 30;
export const MUSIC_STYLE = "cute";
export const VOICE = "Ngọc Huyền";
export const VOICE_TEMPO = 1.08;

// Pastel: nền kem, hồng kẹo, bạc hà, vàng bơ, tím oải hương; viền nâu đậm kiểu sticker.
export const P = {
  cream: "#FFF6EC",
  pink: "#FF7EB6",
  mint: "#5FD8B4",
  butter: "#FFD45C",
  lilac: "#B79CFF",
  sky: "#7CC8FF",
  ink: "#3B2A3F",
  soft: "#8C7A8F",
};

export const REPO_URL = "github.com/harry0703/MoneyPrinterTurbo";

export const SEGMENTS: Segment[] = [
  { id: "p1", start: 0.5, max: 4.5, text: "Chỉ cần gõ một chủ đề, là có ngay một video ngắn hoàn chỉnh. Thật luôn đó!" },
  { id: "p2", start: 5.3, max: 4.5, text: "Đây là MoneyPrinterTurbo: mã nguồn mở, hơn một trăm bốn mươi nghìn sao trên GitHub." },
  { id: "p3", start: 10.2, max: 4, text: "AI tự viết kịch bản, tìm cảnh quay, lồng tiếng, thêm phụ đề và nhạc nền." },
  { id: "p4", start: 14.6, max: 3.5, text: "Mọi thứ chỉnh trên một giao diện web dễ dùng, bấm một nút là xong." },
  { id: "p5", start: 18.5, max: 4, text: "Xuất video dọc, ngang hay vuông, đăng thẳng lên TikTok, YouTube Shorts." },
  { id: "p6", start: 22.9, max: 3, text: "Kho cảnh quay và giọng đọc đều có lựa chọn miễn phí." },
  { id: "p7", start: 26.3, max: 1.6, text: "Lưu lại và thử ngay!" },
  { id: "p8", start: 28.3, max: 5, text: "Đăng ký kênh, và kể mình nghe: bạn muốn làm video về chủ đề gì? Bình luận nhé!", pad: 1.5 },
];

export const { starts: STARTS, duration: DURATION_S, beat } = buildTimeline(SEGMENTS, VO_DURATIONS, 36);
