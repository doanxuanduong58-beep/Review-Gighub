import type { Format } from "../components/layout";
import { buildTimeline, type Segment } from "../timeline";
import VO_DURATIONS from "./vo-durations.json";

// NAME: thư mục trong src/ và public/; COMPOSITION_ID: id đăng ký trong Root.tsx.
export const NAME = "genoffice";
export const COMPOSITION_ID = "GenOffice";
export const FORMATS: Format[] = ["9:16"];
export const FPS = 30;

// Màu lấy theo ảnh bìa chính thức (chữ "suite" tím → hồng).
export const BRAND = { violet: "#8B6CFF", pink: "#E05ACB" };
export const BRAND_GRADIENT = `linear-gradient(90deg, #B39CFF, ${BRAND.violet} 45%, ${BRAND.pink})`;

export const REPO_URL = "github.com/genspark-ai/genoffice";

// Nội dung lấy từ README của genspark-ai/genoffice (06/11/2026): 11.8K sao, Apache-2.0, macOS/Windows/Linux.
export const SEGMENTS: Segment[] = [
  { id: "p1", start: 0.5, max: 5, text: "Có một bộ Office miễn phí, để AI tự sửa Word, Excel, PowerPoint ngay trong file." },
  { id: "p2", start: 5.9, max: 5, text: "Đó là GenOffice, gần mười hai nghìn sao trên GitHub chỉ sau ba tháng." },
  { id: "p3", start: 11.3, max: 4.5, text: "Mở file Word, bảo AI viết lại một đoạn, nó sửa thẳng vào tài liệu." },
  { id: "p4", start: 16.2, max: 4.5, text: "Mỗi lần AI sửa đều lưu lại, không ưng thì bấm một nút là quay về." },
  { id: "p5", start: 21.1, max: 4.5, text: "Với Excel, một câu lệnh là có bảng tổng hợp, công thức thật và biểu đồ." },
  { id: "p6", start: 26.0, max: 4.5, text: "Gõ một dòng yêu cầu, nó lên dàn ý và dựng cả bộ slide PowerPoint." },
  { id: "p7", start: 30.9, max: 5, text: "Còn PDF thì sửa chữ ngay trên trang, hoặc chuyển sang Word ngay trên máy." },
  { id: "p8", start: 36.3, max: 5.5, text: "File nằm trên máy bạn, AI thì dùng khoá Claude, Gemini, hay mô hình chạy local đều được." },
  { id: "p9", start: 42.2, max: 4.5, text: "Có cả dòng lệnh để Claude Code tự tạo và sửa file Office giúp bạn." },
  { id: "p10", start: 47.1, max: 4, text: "Chạy được trên Mac, Windows và Linux. Lưu lại và thử ngay!" },
  { id: "p11", start: 51.5, max: 6, text: "Theo dõi kênh để xem thêm, và bình luận: bạn muốn AI sửa Word, Excel hay slide nhất nhé?", pad: 1.5 },
];

export const { starts: STARTS, duration: DURATION_S, beat } = buildTimeline(SEGMENTS, VO_DURATIONS, 59);
