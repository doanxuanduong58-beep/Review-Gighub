import type { Format } from "../components/layout";
import { buildTimeline, type Segment } from "../timeline";
import VO_DURATIONS from "./vo-durations.json";

export const NAME = "eduskills";
export const COMPOSITION_ID = "EduSkills";
export const FORMATS: Format[] = ["9:16"];
export const FPS = 30;

// Tông ấm (phấn vàng + cam) cho cảm giác gần gũi lớp học.
export const BRAND = { main: "#FFB547", alt: "#FF7A59", ok: "#4ADE80", bad: "#F28B82" };
export const BRAND_GRADIENT = `linear-gradient(90deg, #FFD27A, ${BRAND.main} 45%, ${BRAND.alt})`;

export const REPO_URL = "github.com/GarethManning/education-agent-skills";

// Nội dung lấy từ README, skills/ và docs/EXCLUSIONS.md của GarethManning/education-agent-skills (08/11/2026).
export const SEGMENTS: Segment[] = [
  { id: "p1", start: 0.5, max: 3.2, text: "Mười một giờ đêm rồi, giáo án ngày mai vẫn chưa xong?" },
  { id: "p2", start: 4, max: 5, text: "Soạn bài, ra đề, làm thang chấm điểm, rồi phân hoá cho từng em… việc cứ chồng lên mãi." },
  { id: "p3", start: 9.5, max: 5, text: "Nhờ AI thì nhanh thật, nhưng câu trả lời nhiều khi chung chung, chẳng biết dựa vào đâu." },
  { id: "p4", start: 15, max: 4.5, text: "Đây là Education Agent Skills, kho mã nguồn mở gần một nghìn sao trên GitHub." },
  { id: "p5", start: 20, max: 4.5, text: "Bên trong có một trăm sáu mươi lăm kỹ năng cho AI, chia thành hai mươi lĩnh vực giảng dạy." },
  { id: "p6", start: 25, max: 4.5, text: "Từ lên kế hoạch bài, tạo câu hỏi ôn tập, đến viết thang điểm và hỗ trợ học sinh yếu." },
  { id: "p7", start: 30, max: 4.5, text: "Điểm đáng quý: mỗi kỹ năng đều ghi rõ nghiên cứu gốc và mức độ bằng chứng." },
  { id: "p8", start: 35, max: 4.5, text: "Những thứ thiếu căn cứ, như dạy theo phong cách học, tác giả thẳng tay loại bỏ." },
  { id: "p9", start: 40, max: 4, text: "Dùng rất dễ: mở một kỹ năng, chép đoạn lệnh, dán vào AI quen dùng." },
  { id: "p10", start: 44.5, max: 4, text: "Nội dung gốc bằng tiếng Anh, nhưng chỉ cần dặn AI trả lời bằng tiếng Việt." },
  { id: "p11", start: 49, max: 5, text: "Vài phút sau đã có bản nháp lịch ôn tập theo tuần, thầy cô chỉ cần xem lại và chỉnh." },
  { id: "p12", start: 54.5, max: 3, text: "Lưu lại video và thử ngay với bài dạy tuần này!" },
  {
    id: "p13",
    start: 58,
    max: 7,
    pad: 1.5,
    text: "Theo dõi kênh để có thêm công cụ hay. Thầy cô cần AI giúp nhất việc gì: soạn bài, ra đề hay chấm bài? Bình luận cho mình biết nhé.",
  },
];

export const { starts: STARTS, duration: DURATION_S, beat } = buildTimeline(SEGMENTS, VO_DURATIONS, 66);
