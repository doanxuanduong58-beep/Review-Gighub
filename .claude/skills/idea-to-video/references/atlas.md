# Motion Atlas — hiệu ứng minh hoạ theo nội dung

138 hiệu ứng viết bằng code (`vendor/motion-atlas`, MIT, github.com/skylarzzzz/motion-atlas). Dùng làm **hình minh hoạ
chuyển động trong khung** cho một ý của câu thoại — như một ảnh/clip — qua `<AtlasClip effect="KEY" width={…} />`
(`src/components/atlas.tsx`).

**Không dùng làm nền video** (người dùng bỏ nền Atlas 25/10/2026, giữ nền thường `Background` + `Bokeh`). NEURAL và INFINITY
đã bị người dùng loại — không đề xuất.

**Ảnh xem nhanh**: `atlas-1.jpg` (POOL…CUBES), `atlas-2.jpg` (INFINITY…DOMINO), `atlas-3.jpg` (PINWHEEL…GLOBE) cùng thư mục —
mở bằng Read trước khi chọn. Ảnh tĩnh không cho thấy chuyển động; đọc cột mô tả.

## Cách dùng

1. Khi viết kịch bản, cảnh nào cần minh hoạ một ý trừu tượng mà không có ảnh thật, tìm trong bảng dưới theo **ý nghĩa câu
   thoại**: "chia nhỏ rồi gộp lại" → MURMUR; "giá tăng" → CANDLES; "tự động hoá dây chuyền" → DOMINO; "tiết kiệm thời gian"
   → HOURGLASS. Ghi KEY vào cột **Hình** của bảng phân cảnh để người dùng duyệt. 1–3 cảnh mỗi video là đủ.
2. Sau khi duyệt, xuất **chỉ** KEY đã chọn, bản ngang (~30 s): `npm run atlas -- KEY --dur 8`. Khung 16:9 nên dùng được ở
   mọi khổ video, không cần bản dọc.
3. Đặt `<AtlasClip>` trong cảnh như một ScreenCard (cạnh chữ/chip, chừa đáy cho phụ đề). Ghi nguồn
   "Hiệu ứng: Motion Atlas (MIT)" trong post.md.
4. Kiểm khung tĩnh: hiệu ứng phải đang ở đoạn "đẹp" khi câu được đọc — chỉnh `from` (giây) nếu cần.

Lưu ý: `ISOFAB` lỗi trong repo gốc. Mẫu có chữ Hán / chữ trang trí lạc nội dung (cột Lưu ý) — tránh.

## Theo chủ đề

### AI, máy học, công nghệ
| KEY | Mô tả | Lưu ý |
|---|---|---|
| PCB | Bảng mạch xanh, đường đồng gập 45°, tín hiệu chạy | Chip in chữ "OPUS-55·A1" |
| POINTKNOT | Nút thắt từ hàng trăm nghìn hạt sáng, xoay chậm — mô hình, dữ liệu | |
| HELIX | Chuỗi xoắn kép từ hàng trăm nghìn điểm lao về xa — khoa học, dữ liệu | |
| HUDRING | HUD khoa học viễn tưởng, vòng chia độ quay, số nhảy — tốc độ, chỉ số | Có số "98 SYNC %" |
| TESSERACT | Siêu khối 4 chiều lật trong ra ngoài — khái niệm trừu tượng | |
| GRAVITY | Lưới không–thời gian bị khối cầu đè trũng — sức ảnh hưởng | |
| SCOPE | Dao động ký vẽ hình Lissajous — tín hiệu, âm thanh | |
| RADAR | Radar quét, điểm sáng hiện rồi tắt — tìm kiếm, phát hiện | |
| CRT | TV đèn hình cũ, sọc màu rồi nhiễu — cũ vs mới | Chữ "TEST SIGNAL" |
| GLITCH | Áp phích nhiễu tín hiệu, lệch RGB — lỗi, sự cố, bảo mật | Chữ "SIGNAL LOST" |
| MOLECULE | Mô hình phân tử caffeine xoay | |

### Tìm kiếm, văn bản, viết
| KEY | Mô tả | Lưu ý |
|---|---|---|
| TYPESEA | Biển chữ cái gợn sóng — tìm kiếm, văn bản, ngôn ngữ | Chữ Latin rời |
| SPLITFLAP | Bảng lật chữ sân bay — tin tức, viết, kết quả | Chữ Latin |
| BOOKS | Chồng sách bìa vải — học, tài liệu | |
| GLYPHSPHERE / POEM / BRUSH | Chữ Hán | Tránh |

### Mạng lưới, toàn cầu, kết nối
| KEY | Mô tả | Lưu ý |
|---|---|---|
| GLOBE | Địa cầu đường nét, bình minh, tuyến bay toả đi — toàn cầu, ra mắt | |
| FLIGHTS | Bản đồ chấm, tuyến bay bật thành vòng cung — kết nối, lan toả | |
| WINDMAP | Hạt chảy theo gió — luồng dữ liệu, xu hướng | |
| MURMUR | Đàn chim tụ thành dải lụa đổi hình — **chia nhỏ → gộp**, cộng đồng | |
| STRINGART | Sợi chỉ vòng theo bảng cửu chương, đường cong tự hiện — thuật toán, quy luật | |

### Dữ liệu, tài chính
| KEY | Mô tả | Lưu ý |
|---|---|---|
| CANDLES | Nến chứng khoán mọc dần, đường trung bình, cột khối lượng — tài chính, tăng trưởng | |
| ISOTYPE | Biểu đồ hình người sáng dần | Số năm |
| CUBES | Khối lập phương lật thành sóng đổi màu — dữ liệu, chuyển đổi | |
| SANKEY | Biểu đồ luồng chia nhánh | Nhãn chữ Hán |

### Ấn tượng, vũ trụ, kịch tính
| KEY | Mô tả |
|---|---|
| SATURNX | Nhật thực sau sao Thổ, mặt trời loé ra, camera lùi lộ hành tinh — "wow", ra mắt |
| BLACKHOLE | Hố đen, đĩa bồi tụ bẻ cong ánh sáng — hút sự chú ý |
| ECLIPSE / SATURN / NEBULA | Nhật thực, sao Thổ, tinh vân |
| LASER | Tia laser quét qua khói — cao trào, sự kiện |
| LIGHTNING | Tia chớp trong mây giông — bất ngờ, cảnh báo |
| FIREWORK / CONFETTI | Pháo hoa / giấy màu nổ — ăn mừng, cột mốc |
| COLORINK | Bốn dòng mực màu va nhau trong nước — sáng tạo, hợp nhất |

### Thời gian, quy trình, chuỗi phản ứng
| KEY | Mô tả |
|---|---|
| HOURGLASS | Đồng hồ cát chảy — thời gian, hạn chót |
| TOURBILLON | Bánh răng đồng hồ cơ — cơ chế, vận hành |
| DOMINO | Domino đổ dây chuyền theo xoắn ốc — tự động hoá, hiệu ứng dây chuyền |
| PENDULUM | Con lắc lệch pha tạo sóng — đồng bộ, nhịp |
| KINETIC | Mảnh gỗ treo nhấp nhô như sóng — cơ chế tinh vi |
| TUMBLE / ASCENT / STAIRWELL | Khối lăn xuống bậc / bậc thang đi lên / cầu thang xoắn sâu — từng bước, tiến bộ, đào sâu |
| ARCADE | Hành lang vòm vô tận — nhiều lựa chọn |

### So sánh, logic
| KEY | Mô tả |
|---|---|
| CHESS | Tàn cuộc cờ, quân tốt sắp phong cấp — chiến lược |
| PENROSE / MOBIUS / OPTIC | Tam giác không thể / dải Möbius / ảo giác sọc — nghịch lý, đánh lừa |
| PRISM | Lăng kính tách ánh sáng — phân tích |
| CARDS / DICE | Bài tây xoè / xúc xắc lăn — mánh, may rủi |

### Cảm xúc, kết
| KEY | Mô tả |
|---|---|
| LANTERN | Đèn trời bay lên — hy vọng, lời chúc |
| FIREFLY / JELLY / STARTRAIL / AURORAX | Đom đóm / sứa / vệt sao / cực quang — nhẹ nhàng |
| DANDELION | Bồ công anh tung hạt — lan toả, chia sẻ |
| CANDLE | Hành lang nến — ấm, tưởng nhớ |

### Đời sống, thiết kế, chất liệu (phần lớn nền sáng)
GLASS, MEMPHIS, RISO, CONSTRUCT, CHROME, CLAY, FOLD, SEQUIN, MARBLES, LATTE, DONUTS, CITRUS, TOMATO, VINYL, BALLOONS, ISLANDS,
PINWHEEL, REGATTA, POOL, DUNE, SHORE, WHEAT, BAMBOO, RAINPOND, KOI, ZEN, SAKURA, CRANES, DROPLET, SUCCULENT, TREERING,
MUSHROOMS, PEACOCK, HONEY, SILK, GOLDLEAF, MARBLE, QUILT, PILLS, ROPE, LINKS, VASE, CAIRN, SPIRAL, ORBS, TERRACE, PEARLS,
LAVA, MOIRE, GUILLOCHE, SPIRO, RIBBON, WIREWAVE, INKWATER, EBRU, TERRAZZO, MOSAIC, STAMPS, COUTURE, DECO, CONTOUR, RELIEF,
THERM, LED, ORBITAL — xem ảnh `atlas-*.jpg`. Hoa văn mang chất Trung Hoa (XIANGYUN, QINGHUA, EMBROID) — tránh nếu lạc chủ đề.
