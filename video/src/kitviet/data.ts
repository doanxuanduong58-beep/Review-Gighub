import type { Format } from "../components/layout";
import { buildTimeline, type Segment } from "../timeline";
import VO_DURATIONS from "./vo-durations.json";

export const NAME = "kitviet";
export const COMPOSITION_ID = "KitViet";
export const FORMATS: Format[] = ["9:16"];
export const FPS = 30;

// Màu theo logo Kit Việt (đỏ + sao vàng).
export const BRAND = { red: "#E3342A", gold: "#F5B82E" };
export const BRAND_GRADIENT = `linear-gradient(90deg, #FF8A7A, ${BRAND.red} 45%, ${BRAND.gold})`;

export const REPO_URL = "github.com/mochistudio-vn/kitviet";

// Nội dung lấy từ README + HUONG-DAN.html của mochistudio-vn/kitviet (07/11/2026): 20 nghề, 30–43 skill/bộ,
// 26 nền tảng, MIT; có bản Pro trả phí. Ra mắt 03/11/2026 (15 sao — không nêu số sao).
export const SEGMENTS: Segment[] = [
  { id: "p1", start: 0.5, max: 5, text: "Giao việc cho AI bằng tiếng Việt, nhận lại file Word, Excel đúng thể thức." },
  { id: "p2", start: 5.9, max: 5.5, text: "Đó là Kit Việt, bộ trợ lý AI tiếng Việt cho hai mươi nghề, bản miễn phí là mã nguồn mở." },
  { id: "p3", start: 11.8, max: 5, text: "Mỗi nghề có hơn ba mươi kỹ năng, như đối chiếu công nợ, lập dự toán hay soạn hợp đồng." },
  { id: "p4", start: 17.2, max: 5.5, text: "Riêng hành chính văn phòng: soạn công văn, tờ trình đúng thể thức, xuất sổ công văn ra Excel." },
  { id: "p5", start: 23.1, max: 4.5, text: "Ví dụ: bảo AI làm bảng lương tháng mười từ file chấm công, rồi xuất ra Excel." },
  { id: "p6", start: 28.0, max: 5, text: "Nó đưa bảng tham số để bạn duyệt, kiểm chéo tổng thu nhập, che tên và số tài khoản." },
  { id: "p7", start: 33.4, max: 5.5, text: "Có trợ lý gác cổng chỉ được báo lỗi, không tự sửa, và kỹ năng kiểm tra chống bịa số liệu." },
  { id: "p8", start: 39.3, max: 4.5, text: "Chạy trên Claude, Codex, Cursor, Gemini và hơn hai mươi nền tảng AI khác." },
  { id: "p9", start: 44.2, max: 3.5, text: "Cài bằng một dòng lệnh. Lưu lại và thử ngay!", pad: 1.2 },
  { id: "p10", start: 48.1, max: 6, text: "Theo dõi kênh để xem thêm, và bình luận: bạn làm nghề gì, muốn AI giúp việc nào nhất nhé?", pad: 1.5 },
];

export const { starts: STARTS, duration: DURATION_S, beat } = buildTimeline(SEGMENTS, VO_DURATIONS, 56);
