import type { Format } from "../components/layout";
import { buildTimeline, type Segment } from "../timeline";
import VO_DURATIONS from "./vo-durations.json";

export const NAME = "hermes";
export const COMPOSITION_ID = "HermesAgent";
export const FORMATS: Format[] = ["9:16"];
export const FPS = 30;

// Vàng/cam theo banner "HERMES-AGENT", xanh theo áo choàng linh vật.
export const BRAND = { gold: "#FFC531", amber: "#FF9A1F", blue: "#4C7DFF" };
export const BRAND_GRADIENT = `linear-gradient(90deg, #FFE27A, ${BRAND.gold} 45%, ${BRAND.amber})`;

export const REPO_URL = "github.com/NousResearch/hermes-agent";

// Nội dung lấy từ README của NousResearch/hermes-agent (07/11/2026): 261k sao, MIT.
export const SEGMENTS: Segment[] = [
  { id: "p1", start: 0.5, max: 5, text: "Một trợ lý AI càng dùng càng giỏi, vì nó tự học từ chính công việc bạn giao?" },
  { id: "p2", start: 6, max: 6, text: "Đó là Hermes Agent của Nous Research, mã nguồn mở, hơn hai trăm sáu mươi nghìn sao trên GitHub." },
  { id: "p3", start: 12.5, max: 6, text: "Làm xong việc khó, nó tự viết lại thành kỹ năng, rồi cải thiện kỹ năng đó qua mỗi lần dùng." },
  { id: "p4", start: 19, max: 4.5, text: "Nó tìm lại được các cuộc trò chuyện cũ, và hiểu bạn hơn sau mỗi phiên." },
  { id: "p5", start: 24, max: 5.5, text: "Nhắn cho nó qua Telegram, Discord, Slack hay WhatsApp, tất cả từ một cổng duy nhất." },
  { id: "p6", start: 30, max: 5, text: "Hẹn giờ bằng lời thường: báo cáo mỗi sáng, sao lưu mỗi đêm, nó tự chạy." },
  { id: "p7", start: 35.5, max: 5.5, text: "Dùng mô hình nào cũng được, chạy trên máy chủ năm đô một tháng hay cả cụm GPU." },
  { id: "p8", start: 41.5, max: 4.5, text: "Cài bằng một dòng lệnh, chạy được trên Linux, macOS và cả Windows." },
  { id: "p9", start: 46.5, max: 4.5, text: "Mã nguồn mở, giấy phép MIT. Lưu video lại và cài thử Hermes ngay!" },
  {
    id: "p10",
    start: 51.5,
    max: 7,
    text: "Đăng ký kênh để xem thêm công cụ AI hay. Bạn muốn giao cho Hermes việc gì đầu tiên? Bình luận cho mình biết nhé.",
    pad: 1.5,
  },
];

export const { starts: STARTS, duration: DURATION_S, beat } = buildTimeline(SEGMENTS, VO_DURATIONS, 60);
