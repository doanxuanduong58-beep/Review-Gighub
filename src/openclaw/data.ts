import type { Format } from "../components/layout";
import { buildTimeline, type Segment } from "../timeline";
import VO_DURATIONS from "./vo-durations.json";

export const NAME = "openclaw";
export const COMPOSITION_ID = "OpenClaw";
export const FORMATS: Format[] = ["9:16"];
export const FPS = 30;

// Màu lấy từ logo tôm hùm đỏ của OpenClaw.
export const BRAND = { red: "#FF3B3B", coral: "#FF8A5C" };
export const BRAND_GRADIENT = `linear-gradient(90deg, #FF7A7A, ${BRAND.red} 45%, ${BRAND.coral})`;

export const REPO_URL = "github.com/openclaw/openclaw";

// Nội dung lấy từ README của openclaw/openclaw (07/11/2026): 394k sao, MIT, 185 thư mục extensions/.
export const SEGMENTS: Segment[] = [
  { id: "p1", start: 0.5, max: 5, text: "Trợ lý AI chạy ngay trên máy bạn, và trả lời bạn qua Zalo, Telegram hay WhatsApp?" },
  { id: "p2", start: 6, max: 5, text: "Đó là OpenClaw, dự án mã nguồn mở gần bốn trăm nghìn sao trên GitHub." },
  { id: "p3", start: 11.5, max: 6, text: "Nó trả lời bạn ngay trong app chat quen thuộc: Discord, Slack, Telegram và hơn hai mươi kênh khác." },
  { id: "p4", start: 18, max: 4, text: "Lịch sử, trí nhớ và khoá đăng nhập đều nằm trên máy của bạn." },
  { id: "p5", start: 22.5, max: 5.5, text: "Mô hình chỉ là plugin: Claude, Codex hay mô hình chạy local, muốn đổi lúc nào cũng được." },
  { id: "p6", start: 28.5, max: 5, text: "Repo có sẵn hơn một trăm tám mươi plugin, cùng kho kỹ năng ClawHub để mở rộng thêm." },
  { id: "p7", start: 34, max: 4.5, text: "Cài bằng đúng một dòng lệnh, chạy được trên macOS, Linux và Windows." },
  { id: "p8", start: 39, max: 4, text: "Giấy phép MIT, miễn phí, do một quỹ phi lợi nhuận phát triển." },
  { id: "p9", start: 43.5, max: 3.5, text: "Lưu video lại và cài thử OpenClaw ngay hôm nay!" },
  {
    id: "p10",
    start: 47.5,
    max: 7,
    text: "Đăng ký kênh để xem thêm công cụ AI hay. Bạn muốn trợ lý chạy trên app chat nào? Bình luận cho mình biết nhé.",
    pad: 1.5,
  },
];

export const { starts: STARTS, duration: DURATION_S, beat } = buildTimeline(SEGMENTS, VO_DURATIONS, 55);
