import type { Format } from "../components/layout";
import { buildTimeline, type Segment } from "../timeline";
import VO_DURATIONS from "./vo-durations.json";

export const NAME = "k12skills";
export const COMPOSITION_ID = "K12Skills";
export const FORMATS: Format[] = ["9:16"];
export const FPS = 30;

// Tông cam đất (gợi Claude) + xanh dương, xanh lá, tím cho 3 mức trình độ.
export const BRAND = { main: "#E07A4F", alt: "#5B9BFF", green: "#4ADE80", purple: "#A78BFA", warn: "#FBBF24", ok: "#4ADE80" };
export const BRAND_GRADIENT = `linear-gradient(90deg, #F5B08F, ${BRAND.main} 45%, #F2C14E)`;

export const REPO_URL = "github.com/anthropics/k12-teacher-skills";

// Nội dung lấy từ README và plugin/skills của anthropics/k12-teacher-skills (10/11/2026).
export const SEGMENTS: Segment[] = [
  { id: "p1", start: 0.5, max: 3.2, text: "Lớp bốn mươi em, ba trình độ, soạn bài sao cho kịp?" },
  { id: "p2", start: 4, max: 5, text: "Soạn giáo án, chia bài theo trình độ, kiểm tra xem các em hiểu chưa… ngày nào cũng thiếu giờ." },
  { id: "p3", start: 9.5, max: 5.5, text: "Đây là K12 Teacher Skills, bộ kỹ năng dạy học của công ty làm ra Claude, làm cùng tổ chức Learning Commons." },
  { id: "p4", start: 15.5, max: 3, text: "Bốn kỹ năng, cho bốn việc cô làm mỗi ngày." },
  { id: "p5", start: 19, max: 4.5, text: "Một: soạn giáo án hoàn chỉnh, kèm phiếu học tập và mẫu quan sát lớp." },
  { id: "p6", start: 24, max: 5, text: "Hai: chia một bài thành ba mức, dưới chuẩn, đạt chuẩn và nâng cao, giữ nguyên nội dung cốt lõi." },
  { id: "p7", start: 29.5, max: 5, text: "Ba: soạn một đến ba câu kiểm tra nhanh môn Toán, đáp án nhiễu lấy từ lỗi sai thường gặp." },
  { id: "p8", start: 35, max: 4, text: "Bốn: cùng cô chuẩn bị trước giờ lên lớp, rồi để lại một ghi chú ngắn." },
  { id: "p9", start: 39.5, max: 3, text: "Kết quả là file Word, chỉnh sửa và in được ngay." },
  { id: "p10", start: 43, max: 5.5, text: "Lưu ý: chuẩn kiến thức theo chương trình Mỹ, nên cô dặn AI bám chương trình Việt Nam và trả lời tiếng Việt." },
  { id: "p11", start: 49, max: 4.5, text: "Mã nguồn mở, cài được vào Claude, hoặc có sẵn trong gói Claude dành cho giáo viên." },
  { id: "p12", start: 54, max: 3, text: "Lưu lại và thử soạn bài tuần sau với AI ngay!" },
  {
    id: "p13",
    start: 57.5,
    max: 7,
    pad: 1.5,
    text: "Theo dõi kênh để có thêm công cụ cho giáo viên. Cô muốn AI giúp soạn môn gì nhất? Bình luận cho mình biết nhé.",
  },
];

export const { starts: STARTS, duration: DURATION_S, beat } = buildTimeline(SEGMENTS, VO_DURATIONS, 64);
