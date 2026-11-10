import type { Format } from "../components/layout";
import { buildTimeline, type Segment } from "../timeline";
import VO_DURATIONS from "./vo-durations.json";

export const NAME = "opentakeoff";
export const COMPOSITION_ID = "OpenTakeoff";
export const FORMATS: Format[] = ["9:16"];
export const FPS = 30;

// Màu thương hiệu OpenTakeoff: xanh ngọc (badge #62d4dc) + xanh đậm; vàng cho nét chì đề xuất.
export const BRAND = { main: "#62D4DC", alt: "#5B8CFF", ok: "#4ADE80", warn: "#FBBF24", bad: "#F87171" };
export const BRAND_GRADIENT = `linear-gradient(90deg, #A5F0F4, ${BRAND.main} 45%, ${BRAND.alt})`;

export const REPO_URL = "github.com/Kentucky-ai/opentakeoff";

// Nội dung lấy từ README, docs/USER_GUIDE.md và docs/img của Kentucky-ai/opentakeoff (10/11/2026).
export const SEGMENTS: Segment[] = [
  { id: "p1", start: 0.5, max: 3.5, text: "Đưa bản vẽ PDF cho AI, nó tự đo diện tích từng phòng cho bạn!" },
  { id: "p2", start: 4.5, max: 5, text: "Bóc khối lượng là bước đầu của mọi hồ sơ dự thầu, mà đo tay từng phòng thì rất mất thời gian." },
  { id: "p3", start: 10, max: 5, text: "Đây là OpenTakeoff, phần mềm bóc khối lượng mã nguồn mở, gần tám trăm sao trên GitHub." },
  { id: "p4", start: 15.5, max: 4, text: "Kéo bản vẽ vào, đặt tỉ lệ, rồi khoanh từng phòng theo mép tường." },
  { id: "p5", start: 20, max: 4.5, text: "Phần mềm tự tính diện tích, chiều dài, số lượng, kèm danh sách vật tư cần mua." },
  { id: "p6", start: 25, max: 4.5, text: "Điểm đặc biệt: AI như Claude điều khiển được qua MCP, với sáu mươi hai công cụ." },
  { id: "p7", start: 30, max: 4.5, text: "Nhưng AI chỉ đề xuất nét chì, người thật bấm duyệt mới thành số liệu chính thức." },
  { id: "p8", start: 35, max: 4, text: "Không chắc thì nó nói không chắc, chứ không bịa ra một con số cho đẹp." },
  { id: "p9", start: 39.5, max: 4, text: "Xuất bản vẽ PDF đã đánh dấu, báo cáo, và cả bảng dự toán Excel." },
  { id: "p10", start: 44, max: 5.5, text: "Có hệ mét, mét vuông, nhưng giao diện tiếng Anh, và tính năng một cú bấm đo phòng đang tạm khoá." },
  { id: "p11", start: 50, max: 4.5, text: "Chạy ngay trên trình duyệt, không cần đăng ký, bản vẽ không bị tải lên đâu cả." },
  { id: "p12", start: 55, max: 3, text: "Lưu lại và thử bóc khối lượng bản vẽ tiếp theo của bạn ngay!" },
  {
    id: "p13",
    start: 58.5,
    max: 7,
    pad: 1.5,
    text: "Theo dõi kênh để có thêm công cụ cho dân xây dựng. Bạn đang bóc khối lượng bằng phần mềm gì? Bình luận cho mình biết nhé.",
  },
];

export const { starts: STARTS, duration: DURATION_S, beat } = buildTimeline(SEGMENTS, VO_DURATIONS, 66);
