import type { Format } from "../components/layout";
import { buildTimeline, type Segment } from "../timeline";
import VO_DURATIONS from "./vo-durations.json";

export const NAME = "gcompris";
export const COMPOSITION_ID = "GCompris";
export const FORMATS: Format[] = ["9:16"];
export const FPS = 30;

// Tông tươi vui cho trẻ: cam, xanh trời, xanh lá.
export const BRAND = { main: "#FF9F1C", alt: "#3BA7FF", green: "#3DDC84", pink: "#FF5D8F", ok: "#4ADE80" };
export const BRAND_GRADIENT = `linear-gradient(90deg, #FFC857, ${BRAND.main} 45%, ${BRAND.pink})`;

export const REPO_URL = "github.com/gcompris/GCompris-qt";

// Nội dung lấy từ README, fastlane/ và src/activities của gcompris/GCompris-qt (10/11/2026).
export const SEGMENTS: Segment[] = [
  { id: "p1", start: 0.5, max: 3.2, text: "Cô ơi, đừng cho bé chơi mấy ứng dụng đầy quảng cáo nữa!" },
  { id: "p2", start: 4, max: 4.5, text: "Cô cần trò chơi vừa học vừa chơi, an toàn, mà không tốn đồng nào." },
  { id: "p3", start: 9, max: 5.5, text: "Đây là GCompris, phần mềm giáo dục mã nguồn mở của cộng đồng KDE, cho bé từ hai đến mười tuổi." },
  { id: "p4", start: 15, max: 3.5, text: "Bên trong có hơn hai trăm trò chơi, chia theo từng chủ đề." },
  { id: "p5", start: 19, max: 4.5, text: "Bé tập đếm, nhận biết màu sắc và hình khối qua những hình vẽ ngộ nghĩnh." },
  { id: "p6", start: 24, max: 4.5, text: "Tập cầm chuột, giải mê cung, ghép hình, gõ đàn như một nhạc công nhí." },
  { id: "p7", start: 29, max: 4.5, text: "Lớn hơn chút thì xem đồng hồ, cân thăng bằng, pha màu như nhà khoa học nhỏ." },
  { id: "p8", start: 34, max: 4.5, text: "Cô chọn độ khó từ một đến sáu sao, hợp với từng nhóm tuổi trong lớp." },
  { id: "p9", start: 39, max: 4.5, text: "Giao diện chưa có tiếng Việt, nhưng đa số trò chỉ cần nhìn hình là bé chơi được." },
  { id: "p10", start: 44, max: 5, text: "Chạy trên máy tính Windows, Mac, Linux và máy tính bảng Android, hoàn toàn miễn phí." },
  { id: "p11", start: 49.5, max: 3, text: "Lưu lại và cài thử cho lớp mình ngay!" },
  {
    id: "p12",
    start: 53,
    max: 7,
    pad: 1.5,
    text: "Theo dõi kênh để có thêm công cụ cho giáo viên. Lớp cô cho bé dùng máy tính hay máy tính bảng? Bình luận cho mình biết nhé.",
  },
];

export const { starts: STARTS, duration: DURATION_S, beat } = buildTimeline(SEGMENTS, VO_DURATIONS, 60);
