import type { Format } from "../components/layout";
import { buildTimeline, type Segment } from "../timeline";
import VO_DURATIONS from "./vo-durations.json";

export const NAME = "claudeseo";
export const COMPOSITION_ID = "ClaudeSEO";
export const FORMATS: Format[] = ["9:16"];
export const FPS = 30;

// Cam đất của Claude + xanh lục "tăng hạng" của SEO.
export const BRAND = { orange: "#E8865A", green: "#3DDC97", violet: "#8B7CFF" };
export const BRAND_GRADIENT = `linear-gradient(90deg, #FFB48F, ${BRAND.orange} 50%, #F2C14E)`;

export const REPO_URL = "github.com/AgriciDaniel/claude-seo";

// Nội dung lấy từ README của AgriciDaniel/claude-seo (07/11/2026): 27.1k sao, MIT, 26 sub-skill, 19 agent.
export const SEGMENTS: Segment[] = [
  { id: "p1", start: 0.5, max: 4.5, text: "Kiểm tra SEO cả website chỉ trong mười lăm phút, ngay trong Claude Code?" },
  { id: "p2", start: 5.5, max: 5, text: "Đó là Claude SEO, plugin mã nguồn mở hơn hai mươi bảy nghìn sao trên GitHub." },
  { id: "p3", start: 11, max: 6, text: "Gõ lệnh SEO audit kèm địa chỉ website, nó tự quét rồi đưa kế hoạch sửa lỗi theo thứ tự ưu tiên." },
  { id: "p4", start: 17.5, max: 5, text: "Mười chín agent chuyên môn, tối đa mười bảy agent chạy song song cùng lúc." },
  { id: "p5", start: 23, max: 5, text: "Nó soát kỹ thuật, tốc độ trang, nội dung, schema và cả SEO địa phương." },
  { id: "p6", start: 28.5, max: 5.5, text: "Đặc biệt, nó chấm khả năng trang của bạn được ChatGPT, Perplexity hay Gemini trích dẫn." },
  { id: "p7", start: 34.5, max: 6, text: "Theo tác giả, chính trang của dự án đạt mười nghìn tám trăm lượt nhấp sau mười hai tuần." },
  { id: "p8", start: 41, max: 3, text: "Cài bằng ba lệnh, ngay trong Claude Code.", pad: 0.6 },
  { id: "p9", start: 45, max: 5, text: "Miễn phí với gói Claude Code bạn đang dùng. Lưu lại và thử ngay!" },
  {
    id: "p10",
    start: 50.5,
    max: 7,
    text: "Đăng ký kênh để xem thêm công cụ AI hay. Website của bạn đang gặp lỗi SEO nào? Bình luận cho mình biết nhé.",
    pad: 1.5,
  },
];

export const { starts: STARTS, duration: DURATION_S, beat } = buildTimeline(SEGMENTS, VO_DURATIONS, 58);
