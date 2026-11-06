# Cảnh, bố cục và camera

Nền tối `#0A0D16` + lưới mờ + quầng màu thương hiệu (`Background`). Font Be Vietnam Pro (đủ dấu tiếng Việt).
Mã đầy đủ: `example/scenes.tsx` (chạy được ở 9:16, 16:9 và 1:1).

## Khổ hình (`src/components/layout.tsx`)

| Khổ | Kích thước | `k` | `SplitLayout` |
|---|---|---|---|
| `9:16` | 1080×1920 | 1 | dọc: head → media (46% chiều cao) → foot; chừa ~400px cuối cho caption của app |
| `4:5` | 1080×1350 | 0.8 | dọc, media 50% |
| `1:1` | 1080×1080 | 0.72 | dọc, media 52% — ô media thấp, chọn vùng camera rộng ngang |
| `16:9` | 1920×1080 | 0.9 | ngang: cột chữ trái (co giãn, `minWidth: 0`) + media phải (58% bề ngang) |

Số px trong bảng bố cục bên dưới là thiết kế gốc 9:16 — trong code luôn nhân `k`.
Cụm chữ dài ở cột trái khổ ngang (logo + tên) cần `flexWrap: "wrap"` để xuống dòng thay vì tràn sang media.

## Component dùng chung (`src/components/`)

| Component | Dùng cho |
|---|---|
| `Background accent` | Nền mọi cảnh |
| `useExit()` | Fade-out 10 frame cuối cảnh |
| `ScreenCard` | Khung cửa sổ (đèn đỏ/vàng/xanh + `header`) chứa ảnh chụp, camera di chuyển theo `keys`, khoanh sáng `highlights` |
| `UrlBar` | Thanh địa chỉ gõ dần, đặt trong `header` của ScreenCard |
| `fitBox(box, view, pad)` | Camera vừa khít một vùng của ảnh |
| `parseStarLabel(label)` | "Star69.8k (69.8k)" → 69.8 — pill số sao luôn khớp ảnh chụp |
| `Narration`, `MusicBed` | Giọng đọc theo mốc + nhạc nền tự ducking (đặt cuối composition) |
| `useLayout()`, `SplitLayout`, `VideoCompositions` | Bố cục theo khổ; đăng ký composition cho từng khổ |
| `HEADER_H` | Chiều cao thanh tiêu đề ScreenCard (khung xem = ô media − HEADER_H) |
| `SubscribeScene question accent btnAt` (`subscribe.tsx`) | Cảnh kêu gọi cuối: bong bóng câu hỏi + nút "Đăng ký kênh". Viết `question={"dòng 1\ndòng 2"}` (biểu thức, không dùng chuỗi thuộc tính) |
| `Captions segments starts durations accent` (`fx.tsx`) | Phụ đề theo cụm 3–5 từ, từ đang đọc có nền màu chạy theo (ước lượng theo số ký tự, không cần nhận dạng giọng). Đặt sau các cảnh trong `Video.tsx`; tự ẩn khi xuất ảnh bìa |
| `Bokeh color` | Đốm sáng mờ trôi lên — đặt ngay sau `Background` |
| `ChapterTag n title color` | Nhãn chương "01 ── TÊN CHƯƠNG" (số viền rỗng, gạch mọc ra) |
| `SplitCompare left right lean` | So sánh hai lựa chọn chia đôi khung, chữ "hay" ở giữa; `lean=±1` nghiêng về bên được khuyên |
| `StepDot` + `GrowArrow` | Sơ đồ luồng: vòng tròn icon (sóng lan khi `active`) nối bằng mũi tên mọc dần |
| `Stamp text at` | Con dấu viền kép đóng xuống (vd "CHỈ GÓI TRẢ PHÍ") |

`ScreenCard` dùng hệ toạ độ **CSS px của ảnh** (ảnh chụp bằng `npm run shoot` là 1280×900; ảnh giao diện tải
về thì dùng kích thước thật, vd 1440×960). `keys: [{at, cam}]` — key đầu là vị trí xuất phát; mỗi key sau bắt đầu
di chuyển ở frame `at`, mất 30 frame. `highlights: [{box, from, to?}]` hiện vòng sáng màu `accent`.

## Bố cục từng cảnh (thiết kế gốc 9:16, đã kiểm tra trên ảnh tĩnh ở cả 3 khổ)

| Cảnh | Bố cục | Ghi chú |
|---|---|---|
| Hook | 2 dòng chữ 120px giữa màn hình (dòng 2 gradient) + sóng âm + 2 pill | Câu hỏi đánh vào nhu cầu |
| Giới thiệu | Logo 190px + tên 112px ở top 170 → ScreenCard trang GitHub (view 960×620, top 470) → pill số sao (top 1240) | Camera: toàn trang (s=0.75) → nút Star (s=2.6) ở frame 40, khoanh sáng frame 45; số sao đếm frame 55–85 |
| Tính năng | Nhãn "TÍNH NĂNG 0X" + tiêu đề 100px (top 150) → ScreenCard ảnh giao diện (view 960×820, top 420) → pill mô tả (top 1380) | Thanh tiêu đề: logo + "Tên · Màn hình". Camera 3 bước: toàn cảnh → vùng chính → chi tiết |
| Và còn nữa | Tiêu đề 110px → 3 thẻ icon + chữ 60px xuất hiện lần lượt → con số lớn 230px gradient đếm lên | Thẻ xuất hiện khớp lúc lời đọc nhắc tới |
| Kết | Logo 280px nhịp đập → 2 pill → "Lưu lại & thử ngay!" 124px → pill link repo có icon GitHub | |
| Kêu gọi đăng ký (cảnh cuối) | Nút "🔔 Đăng ký" / "+ Theo dõi" nhịp đập + câu hỏi bình luận chữ lớn trong khung bong bóng chat | Đặt sau cảnh "Lưu lại"; giữ ≥ 2 giây sau khi đọc xong để người xem kịp bấm. Không vẽ giả nút của YouTube/TikTok — dùng nút tự vẽ trung tính |

## Nhịp thời gian theo độ dài câu

Mỗi cảnh dài bằng câu thoại của nó + 0.35s. Đặt mốc trong cảnh theo độ dài thật (`vo-durations.json`), không theo
con số cố định — giọng đọc nhanh làm cảnh ngắn đi và bước camera cuối có thể không kịp hiện.

| Độ dài câu | Key 2 (zoom vùng chính) | Key 3 (chi tiết) | Highlight cuối hiện ≥ |
|---|---|---|---|
| ~2.5s (75 frame) | 10 | 38 | 30 frame trước khi hết cảnh |
| ~3.5s (105 frame) | 15–20 | 55–60 | |
| ~4–5s (120–150 frame) | 20–30 | 75–95 | |

## Lỗi bố cục hay gặp

- Chữ tiếng Việt rớt dòng lẻ một chữ ("agent" một mình dòng 2) → rút gọn chữ hoặc `whiteSpace: "nowrap"` + giảm cỡ.
- Pill mô tả > ~30 ký tự ở 48px sẽ rớt 2 dòng.
- Zoom ảnh 1440px lên > 2× bắt đầu mờ — chấp nhận được cho nút/khung, tránh zoom chữ nhỏ quá 2.5×.
- Pill đặt sau cụm chữ ghép ("+38K / tháng sao") đọc ngược → tách đơn vị riêng (`starUnit`).
- Bố cục để trống ~400px cuối màn hình là có chủ ý: TikTok/Reels phủ caption và nút ở đó.
