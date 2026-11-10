import type { Format } from "../components/layout";
import { buildTimeline, type Segment } from "../timeline";
import VO_DURATIONS from "./vo-durations.json";

export const NAME = "pascal";
export const COMPOSITION_ID = "Pascal";
export const FORMATS: Format[] = ["9:16"];
export const FPS = 30;

// Tông chạng vạng giống video gốc: cam hoàng hôn + tím, xanh lá cho dấu tích.
export const BRAND = { main: "#F6A26B", alt: "#9B8CFF", ok: "#4ADE80", warn: "#FBBF24" };
export const BRAND_GRADIENT = `linear-gradient(90deg, #FFD3A8, ${BRAND.main} 45%, ${BRAND.alt})`;

export const REPO_URL = "github.com/pascalorg/editor";

// Nội dung lấy từ README, CHANGELOG và docs/media/next-demo của pascalorg/editor (10/11/2026).
export const SEGMENTS: Segment[] = [
  { id: "p1", start: 0.5, max: 3.5, text: "Lật mái, xem xuyên tường, cắt ngang cả ngôi nhà, ngay trên trình duyệt!" },
  { id: "p2", start: 4.5, max: 5.5, text: "Đây là Pascal, phần mềm kiến trúc ba chiều mã nguồn mở, hơn hai mươi lăm nghìn sao trên GitHub." },
  { id: "p3", start: 10.5, max: 4, text: "Vẽ tường, sàn, mái, cửa, phòng và nội thất ngay trong trình duyệt." },
  { id: "p4", start: 15, max: 4.5, text: "Có bản quét ba chiều hiện trạng? Đặt làm nền rồi dựng mô hình BIM đè lên." },
  { id: "p5", start: 20, max: 4.5, text: "Điểm đặc biệt: AI như Claude đọc, sửa và kiểm tra được mô hình qua MCP." },
  { id: "p6", start: 25, max: 4, text: "Chạy trên máy mình bằng một dòng lệnh, dữ liệu nằm ngay trên máy." },
  { id: "p7", start: 29.5, max: 5, text: "Còn đây là bản xem trước thế hệ tiếp theo: một ngôi nhà thật được dựng lại chi tiết." },
  { id: "p8", start: 35, max: 3.5, text: "Cắt ngang để xem kết cấu mái và không gian bên trong." },
  { id: "p9", start: 39, max: 4, text: "Soi xuyên tường để thấy hệ thống kỹ thuật đã được mô hình hoá." },
  { id: "p10", start: 43.5, max: 5, text: "Lưu ý: bản xem trước này chưa có trong bản mã nguồn mở, mới là định hướng sắp tới." },
  { id: "p11", start: 49, max: 5, text: "Mã nguồn mở giấy phép MIT, hợp cho kiến trúc sư, kỹ sư và người quản lý toà nhà." },
  { id: "p12", start: 54.5, max: 3, text: "Lưu lại và thử dựng ngôi nhà đầu tiên của bạn ngay!" },
  {
    id: "p13",
    start: 58,
    max: 7,
    pad: 1.5,
    text: "Theo dõi kênh để có thêm công cụ cho dân xây dựng. Bạn đang dùng Revit, SketchUp hay phần mềm nào? Bình luận cho mình biết nhé.",
  },
];

export const { starts: STARTS, duration: DURATION_S, beat } = buildTimeline(SEGMENTS, VO_DURATIONS, 65);
