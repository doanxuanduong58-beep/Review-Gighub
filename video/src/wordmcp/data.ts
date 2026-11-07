import type { Format } from "../components/layout";
import { buildTimeline, type Segment } from "../timeline";
import VO_DURATIONS from "./vo-durations.json";

export const NAME = "wordmcp";
export const COMPOSITION_ID = "WordMcp";
export const FORMATS: Format[] = ["9:16"];
export const FPS = 30;

// Màu xanh Word.
export const BRAND = { blue: "#4C8DFF", sky: "#7CC4FF" };
export const BRAND_GRADIENT = `linear-gradient(90deg, #A9D4FF, ${BRAND.sky} 35%, ${BRAND.blue})`;

export const REPO_URL = "github.com/GongRzhe/Office-Word-MCP-Server";

// Nội dung lấy từ README + mã nguồn của GongRzhe/Office-Word-MCP-Server (07/11/2026):
// 2.1K sao, MIT, 54 công cụ (@mcp.tool trong word_document_server/main.py), archived 03/03/2026.
export const SEGMENTS: Segment[] = [
  { id: "p1", start: 0.5, max: 5, text: "Bảo Claude một câu, nó tự làm cả file Word có trang bìa, mục lục và hình ảnh." },
  { id: "p2", start: 5.9, max: 5, text: "Đó là Office Word MCP Server, hơn hai nghìn sao trên GitHub, mã nguồn mở miễn phí." },
  { id: "p3", start: 11.3, max: 4.5, text: "Nó là cầu nối giữa trợ lý AI và file Word, thông qua giao thức MCP." },
  { id: "p4", start: 16.2, max: 4.5, text: "Ví dụ: bảo Claude tìm tin tức trên mạng, rồi làm thành file Word có ảnh minh hoạ." },
  { id: "p5", start: 21.1, max: 4.5, text: "Claude tự gọi từng công cụ: tạo file, thêm tiêu đề, rồi thêm đoạn văn." },
  { id: "p6", start: 26.0, max: 4.5, text: "Kết quả là một tài liệu hoàn chỉnh, có bảng, mục lục và hình minh hoạ." },
  { id: "p7", start: 30.9, max: 6, text: "Có tới năm mươi tư công cụ: định dạng chữ, bảng, chú thích, chuyển sang PDF, cả đặt mật khẩu." },
  { id: "p8", start: 37.3, max: 4.5, text: "Lưu ý: repo đã ngừng cập nhật từ tháng ba, nhưng vẫn cài và dùng được." },
  { id: "p9", start: 42.2, max: 5.5, text: "Cài bằng một dòng lệnh, khai báo trong Claude Desktop là dùng ngay. Lưu lại và thử ngay!" },
  { id: "p10", start: 48.1, max: 6, text: "Theo dõi kênh để xem thêm, và bình luận: bạn muốn AI viết loại tài liệu nào nhất nhé?", pad: 1.5 },
];

export const { starts: STARTS, duration: DURATION_S, beat } = buildTimeline(SEGMENTS, VO_DURATIONS, 56);
