import type { Format } from "../components/layout";
import { buildTimeline, type Segment } from "../timeline";
import VO_DURATIONS from "./vo-durations.json";

// NAME: thư mục trong src/ và public/; COMPOSITION_ID: id đăng ký trong Root.tsx.
export const NAME = "voicestudio";
export const COMPOSITION_ID = "VoiceStudio";
// Khổ cần xuất; khổ đầu tiên là khổ chính. Mỗi khổ -> composition "VoiceStudio-9x16"...
export const FORMATS: Format[] = ["9:16", "16:9", "1:1"];
export const FPS = 30;

export const BRAND = { pink: "#FF5C93", peach: "#FFB38A" };
export const BRAND_GRADIENT = `linear-gradient(90deg, #FF9EC1, ${BRAND.pink} 45%, ${BRAND.peach})`;

export const REPO_URL = "github.com/debpalash/VoiceStudio";

// Nội dung lấy từ README của debpalash/VoiceStudio.
export const SEGMENTS: Segment[] = [
  { id: "p1", start: 0.5, max: 4, text: "Muốn có giọng AI xịn như ElevenLabs, mà miễn phí và chạy ngay trên máy mình?" },
  { id: "p2", start: 5.0, max: 5, text: "Đây là VoiceStudio: mã nguồn mở, gần bảy mươi nghìn sao trên GitHub." },
  { id: "p3", start: 10.5, max: 3.5, text: "Nhân bản giọng nói chỉ từ một đoạn ghi âm mẫu." },
  { id: "p4", start: 14.5, max: 5, text: "Không có giọng ưng ý? Mô tả bằng chữ, nó thiết kế giọng mới cho bạn." },
  { id: "p5", start: 20.0, max: 5, text: "Lồng tiếng video sang ngôn ngữ khác, lời thoại khớp theo thời gian." },
  {
    id: "p6",
    start: 25.5,
    max: 7.5,
    text: "Còn có chuyển giọng nói thành chữ, làm sách nói, kết nối các agent AI qua MCP, với sáu trăm bốn mươi sáu ngôn ngữ.",
  },
  { id: "p7", start: 33.5, max: 3.5, text: "Không tài khoản, không cloud. Lưu lại và thử ngay nhé!" },
];

export const { starts: STARTS, duration: DURATION_S, beat } = buildTimeline(SEGMENTS, VO_DURATIONS, 38);
