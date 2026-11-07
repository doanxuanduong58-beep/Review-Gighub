import type { Format } from "../components/layout";
import { buildTimeline, type Segment } from "../timeline";
import VO_DURATIONS from "./vo-durations.json";

// Video giới thiệu langgenius/dify. Nội dung lấy từ README + trang GitHub (chụp 07/11/2026).
export const NAME = "dify";
export const COMPOSITION_ID = "Dify";
export const FORMATS: Format[] = ["9:16"];
export const FPS = 30;
export const MUSIC_STYLE = "energetic";

// Xanh Dify (#0033FF trong logo) + xanh trời, điểm vàng cho số liệu.
export const BRAND = { blue: "#2F5BFF", sky: "#5CC8FF", yellow: "#FFD23F" };
export const BRAND_GRADIENT = `linear-gradient(90deg, ${BRAND.sky}, ${BRAND.blue} 60%, #8B5CFF)`;

export const REPO_URL = "github.com/langgenius/dify";

export const SEGMENTS: Segment[] = [
  { id: "p1", start: 0.5, max: 4, text: "Muốn tự làm chatbot, trợ lý AI cho công việc, mà không cần viết code?" },
  { id: "p2", start: 4.8, max: 4, text: "Đây là Dify: mã nguồn mở, hơn một trăm sáu mươi nghìn sao trên GitHub." },
  { id: "p3", start: 9.2, max: 3.5, text: "Kéo thả các khối trên một bảng vẽ, là thành một quy trình AI hoàn chỉnh." },
  { id: "p4", start: 13, max: 3.5, text: "Dùng được hàng trăm mô hình: GPT, Claude, Gemini, cả Llama chạy local." },
  { id: "p5", start: 16.8, max: 3.5, text: "Nạp tài liệu PDF, slide của bạn, AI trả lời dựa trên đúng dữ liệu đó." },
  { id: "p6", start: 20.6, max: 3.5, text: "Agent tự chạy lệnh, cài phần mềm, kết nối công cụ qua MCP." },
  { id: "p7", start: 24.4, max: 3.5, text: "Tự cài trên máy chủ của bạn chỉ với Docker, hoặc dùng bản cloud." },
  { id: "p8", start: 28.2, max: 1.6, text: "Lưu lại và thử ngay!" },
  { id: "p9", start: 30.2, max: 5, text: "Đăng ký kênh, và cho mình biết: bạn sẽ dùng Dify để làm gì? Bình luận nhé!", pad: 1.5 },
];

export const { starts: STARTS, duration: DURATION_S, beat } = buildTimeline(SEGMENTS, VO_DURATIONS, 38);
