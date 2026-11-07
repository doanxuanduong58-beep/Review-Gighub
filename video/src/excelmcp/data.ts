import type { Format } from "../components/layout";
import { buildTimeline, type Segment } from "../timeline";
import VO_DURATIONS from "./vo-durations.json";

export const NAME = "excelmcp";
export const COMPOSITION_ID = "ExcelMcp";
export const FORMATS: Format[] = ["9:16"];
export const FPS = 30;

// Màu xanh lá theo logo Excel MCP Server.
export const BRAND = { green: "#2FBF71", mint: "#7BE3A8" };
export const BRAND_GRADIENT = `linear-gradient(90deg, #B6F2CF, ${BRAND.mint} 35%, ${BRAND.green})`;

export const REPO_URL = "github.com/haris-musa/excel-mcp-server";

// Nội dung lấy từ README, TOOLS.md và docs/index.html (excelmcpserver.com) của haris-musa/excel-mcp-server
// (07/11/2026): 4.3K sao, MIT, 46 công cụ, không cần Microsoft Excel.
export const SEGMENTS: Segment[] = [
  { id: "p1", start: 0.5, max: 5.5, text: "Bảo AI một câu, nó tự tạo file Excel có bảng, công thức và biểu đồ, không cần cài Excel." },
  { id: "p2", start: 6.4, max: 5.5, text: "Đó là Excel MCP Server, hơn bốn nghìn ba trăm sao trên GitHub, mã nguồn mở miễn phí." },
  { id: "p3", start: 12.3, max: 4, text: "Dùng được với Claude, Cursor, Codex và nhiều trợ lý AI khác." },
  { id: "p4", start: 16.7, max: 4.5, text: "Chỉ cần nói việc: làm bảng từ file CSV, thêm biểu đồ doanh thu theo tháng." },
  { id: "p5", start: 21.6, max: 4, text: "Hay tạo PivotTable theo khu vực và tháng, có cả slicer để lọc." },
  { id: "p6", start: 26.0, max: 5.5, text: "Công thức được tính sẵn dù file chưa từng mở bằng Excel, còn truy được số sai đến từ đâu." },
  { id: "p7", start: 31.9, max: 4, text: "File hai trăm nghìn dòng vẫn đọc và sửa chỉ trong vài giây." },
  { id: "p8", start: 36.3, max: 5.5, text: "Có bốn mươi sáu công cụ, từ biểu đồ, định dạng có điều kiện đến danh sách thả xuống." },
  { id: "p9", start: 42.2, max: 3.5, text: "Cài bằng một dòng lệnh. Lưu lại và thử ngay!", pad: 1.2 },
  { id: "p10", start: 47.3, max: 6, text: "Theo dõi kênh để xem thêm, và bình luận: bạn muốn AI làm giúp việc gì trên Excel nhất nhé?", pad: 1.5 },
];

export const { starts: STARTS, duration: DURATION_S, beat } = buildTimeline(SEGMENTS, VO_DURATIONS, 56);
