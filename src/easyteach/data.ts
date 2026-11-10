import type { Format } from "../components/layout";
import { buildTimeline, type Segment } from "../timeline";
import VO_DURATIONS from "./vo-durations.json";

export const NAME = "easyteach";
export const COMPOSITION_ID = "EasyTeaching";
export const FORMATS: Format[] = ["9:16"];
export const FPS = 30;

// Tông dịu cho giáo viên mầm non: xanh ngọc + hồng đào, vàng cho cảnh báo.
export const BRAND = { main: "#2EC4B6", alt: "#FF8FA3", warn: "#FBBF24", bad: "#F87171", ok: "#4ADE80" };
export const BRAND_GRADIENT = `linear-gradient(90deg, #7FE3D8, ${BRAND.main} 45%, ${BRAND.alt})`;

export const REPO_URL = "github.com/MengC-OvO/easy-teaching";

// Nội dung lấy từ README của MengC-OvO/easy-teaching (10/11/2026).
export const SEGMENTS: Segment[] = [
  { id: "p1", start: 0.5, max: 3.2, text: "Cô viết phiếu quan sát cho ba mươi bé đến tận khuya?" },
  { id: "p2", start: 4, max: 5, text: "Kế hoạch hoạt động, nhận xét từng bé, tin nhắn phụ huynh… giấy tờ nhiều hơn giờ chơi với trẻ." },
  { id: "p3", start: 9.5, max: 4.5, text: "Đây là EasyTeaching, trợ lý AI mã nguồn mở dành riêng cho giáo viên mầm non." },
  { id: "p4", start: 14.5, max: 5, text: "Cô chỉ cần kể vắn tắt, AI soạn nháp kế hoạch hoạt động, phiếu quan sát và tin nhắn phụ huynh." },
  { id: "p5", start: 20, max: 3.5, text: "Câu trả lời về chương trình và quy định đều kèm trích dẫn nguồn." },
  { id: "p6", start: 24, max: 4, text: "Điểm hay nhất: AI chỉ soạn nháp, cô bấm duyệt thì mới được lưu." },
  { id: "p7", start: 28.5, max: 4.5, text: "AI không được chẩn đoán trẻ, không tư vấn y tế, và không tự gửi tin cho phụ huynh." },
  { id: "p8", start: 33.5, max: 5, text: "Nhưng nói thật: đây là bản thử nghiệm, theo chương trình mầm non của Úc, giao diện tiếng Anh." },
  { id: "p9", start: 39, max: 4.5, text: "Muốn chạy phải có người biết kỹ thuật cài đặt, và chỉ nên thử với dữ liệu giả." },
  { id: "p10", start: 44, max: 5, text: "Nếu trường cô có bạn làm IT, đây là mẫu tốt để xây trợ lý AI an toàn bằng tiếng Việt." },
  { id: "p11", start: 49.5, max: 3, text: "Lưu lại và gửi cho bạn IT của trường ngay!" },
  {
    id: "p12",
    start: 53,
    max: 7,
    pad: 1.5,
    text: "Theo dõi kênh để có thêm công cụ cho giáo viên. Việc giấy tờ nào làm cô mất thời gian nhất? Bình luận cho mình biết nhé.",
  },
];

export const { starts: STARTS, duration: DURATION_S, beat } = buildTimeline(SEGMENTS, VO_DURATIONS, 60);
