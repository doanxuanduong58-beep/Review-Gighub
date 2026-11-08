import type { Format } from "../components/layout";
import { buildTimeline, type Segment } from "../timeline";
import VO_DURATIONS from "./vo-durations.json";

export const NAME = "openmaic";
export const COMPOSITION_ID = "OpenMAIC";
export const FORMATS: Format[] = ["9:16"];
export const FPS = 30;

// Xanh dương tươi + tím: gợi lớp học công nghệ, thân thiện.
export const BRAND = { main: "#5B8CFF", alt: "#A78BFA", ok: "#4ADE80", warn: "#FBBF24" };
export const BRAND_GRADIENT = `linear-gradient(90deg, #8FB3FF, ${BRAND.main} 45%, ${BRAND.alt})`;

export const REPO_URL = "github.com/THU-MAIC/OpenMAIC";

// Nội dung lấy từ README và assets/ của THU-MAIC/OpenMAIC (08/11/2026).
export const SEGMENTS: Segment[] = [
  { id: "p1", start: 0.5, max: 3.2, text: "Gõ một dòng chữ, AI mở cho bạn nguyên một lớp học riêng." },
  { id: "p2", start: 4, max: 4.5, text: "Có thầy giáo AI giảng bài, có cả bạn học AI cùng thảo luận với bạn." },
  { id: "p3", start: 9, max: 5.5, text: "Đây là OpenMAIC, của nhóm nghiên cứu Đại học Thanh Hoa, gần bốn mươi ba nghìn sao trên GitHub." },
  { id: "p4", start: 15, max: 4.5, text: "Chỉ cần nhập chủ đề, hoặc tải lên tài liệu PDF, Word, PowerPoint của bạn." },
  { id: "p5", start: 20, max: 4.5, text: "AI tự lên dàn ý, rồi biến từng mục thành bài giảng có slide và giọng đọc." },
  { id: "p6", start: 25, max: 4, text: "Học xong có bài kiểm tra, AI chấm điểm và nhận xét ngay." },
  { id: "p7", start: 29.5, max: 4.5, text: "Chỗ nào khó hiểu thì có mô phỏng tương tác để bạn tự tay làm thí nghiệm." },
  { id: "p8", start: 34.5, max: 4.5, text: "Thầy giáo AI còn chỉ vào từng chỗ quan trọng, gợi ý đúng lúc bạn cần." },
  { id: "p9", start: 39.5, max: 4, text: "Muốn làm dự án? Chọn một vai, cùng nhóm AI làm theo từng mốc." },
  { id: "p10", start: 44, max: 4, text: "Giáo viên có thể xuất cả bài ra file PowerPoint để dạy trên lớp." },
  { id: "p11", start: 48.5, max: 5, text: "Mã nguồn mở, miễn phí; nếu tự cài, bạn cần khoá dùng mô hình AI của riêng mình." },
  { id: "p12", start: 54, max: 3, text: "Lưu lại và thử ngay với chủ đề bạn đang muốn học!" },
  {
    id: "p13",
    start: 57.5,
    max: 7,
    pad: 1.5,
    text: "Theo dõi kênh để có thêm công cụ hay. Bạn muốn AI dạy mình môn gì đầu tiên? Bình luận cho mình biết nhé.",
  },
];

export const { starts: STARTS, duration: DURATION_S, beat } = buildTimeline(SEGMENTS, VO_DURATIONS, 65);
