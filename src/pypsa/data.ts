import type { Format } from "../components/layout";
import { buildTimeline, type Segment } from "../timeline";
import VO_DURATIONS from "./vo-durations.json";

export const NAME = "pypsa";
export const COMPOSITION_ID = "PyPSA";
export const FORMATS: Format[] = ["9:16"];
export const FPS = 30;

// Màu từ logo PyPSA: vàng, đỏ mận, xanh lá, xanh ngọc.
export const BRAND = { main: "#FFC20E", alt: "#2E9BC0", red: "#D0154F", green: "#14874F", ok: "#4ADE80" };
export const BRAND_GRADIENT = `linear-gradient(90deg, #FFD95A, ${BRAND.main} 40%, #4FC3E8)`;

export const REPO_URL = "github.com/PyPSA/PyPSA";

// Nội dung lấy từ README và docs/assets của PyPSA/PyPSA (08/11/2026).
export const SEGMENTS: Segment[] = [
  { id: "p1", start: 0.5, max: 3.2, text: "Tối ưu lưới điện cả châu Âu, chỉ bằng vài dòng Python?" },
  { id: "p2", start: 4, max: 5, text: "Điều độ nguồn, quy hoạch lưới, tích hợp điện gió, điện mặt trời… tính tay thì quá sức." },
  { id: "p3", start: 9.5, max: 5.5, text: "Đây là PyPSA, thư viện mã nguồn mở hơn hai nghìn hai trăm sao, do Đại học Kỹ thuật Berlin dẫn dắt." },
  { id: "p4", start: 15.5, max: 4, text: "Bạn mô tả lưới điện: nút, đường dây, máy phát, phụ tải, kho lưu trữ." },
  { id: "p5", start: 20, max: 4.5, text: "Rồi chỉ một lệnh tối ưu, nó tìm cách vận hành rẻ nhất mà vẫn đúng giới hạn lưới." },
  { id: "p6", start: 25, max: 4.5, text: "Tính trào lưu công suất xoay chiều, một chiều, cả kiểm tra sự cố N trừ một." },
  { id: "p7", start: 30, max: 4.5, text: "Quy hoạch đầu tư dài hạn: nên xây thêm bao nhiêu nguồn, bao nhiêu đường dây." },
  { id: "p8", start: 35, max: 4.5, text: "Mô phỏng cả lượng điện gió bị cắt giảm và pin lưu trữ theo từng giờ." },
  { id: "p9", start: 40, max: 4, text: "Ghép điện với nhiệt, khí hydro, xe điện trong cùng một mô hình." },
  { id: "p10", start: 44.5, max: 4, text: "Cài bằng một dòng lệnh, có sẵn bộ giải tối ưu miễn phí." },
  { id: "p11", start: 49, max: 3.5, text: "Giấy phép MIT, dùng được cả cho dự án thương mại." },
  { id: "p12", start: 53, max: 3, text: "Lưu lại và thử ngay với lưới điện của bạn!" },
  {
    id: "p13",
    start: 56.5,
    max: 7,
    pad: 1.5,
    text: "Theo dõi kênh để có thêm công cụ cho kỹ sư. Bạn đang dùng phần mềm gì để tính lưới điện? Bình luận cho mình biết nhé.",
  },
];

export const { starts: STARTS, duration: DURATION_S, beat } = buildTimeline(SEGMENTS, VO_DURATIONS, 64);
