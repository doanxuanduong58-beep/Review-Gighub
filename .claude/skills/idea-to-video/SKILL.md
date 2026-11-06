---
name: idea-to-video
description: Biến một ý tưởng thành gói đăng bài hoàn chỉnh — thư mục gồm video (nhiều khổ), ảnh bìa và tiêu đề / mô tả / hashtag cho YouTube, TikTok, Reels, Shorts. Video có giọng đọc tiếng Việt, nhạc nền và hình thật, ở khổ dọc 9:16 (TikTok / Reels / Shorts), ngang 16:9 (YouTube), vuông 1:1 hoặc 4:5, độ dài tuỳ nội dung — phân tích ý tưởng, nghiên cứu chủ đề, viết kịch bản + bảng phân cảnh cho người dùng duyệt, rồi dựng bằng Remotion, giọng VieNeu-TTS chạy local miễn phí, nhạc tự tổng hợp không bản quyền, render MP4 chuẩn -14 LUFS. Dùng skill này bất cứ khi nào người dùng muốn "làm video", "làm clip", "video giới thiệu / review / promo / explainer" về một repo GitHub, tool, app, sản phẩm, thư viện AI hay một chủ đề, hoặc đưa một link/ý tưởng và bảo "làm video về cái này", "dựng video ngắn", "video TikTok giới thiệu X", "video YouTube giải thích Y" — kể cả khi họ không nhắc Remotion, giọng đọc hay kịch bản. Không dùng cho chỉnh sửa video quay sẵn hay hoạt hình vẽ tay.
---

# Ý tưởng → video

Quy trình đúc kết từ một video thật (giới thiệu repo VoiceStudio, 7 cảnh, xuất cả 9:16 / 16:9 / 1:1).
Mục tiêu là video người xem tin được: số liệu đúng nguồn, hình là giao diện thật, giọng Việt nghe tự nhiên.
Phần lớn công sức nên dành cho **phân tích, tư liệu và kịch bản** — dựng hình là phần dễ khi kịch bản đã đúng.

Viết cho người dùng bằng tiếng Việt, ngắn gọn; dùng bảng khi trình kịch bản / lựa chọn.

Video **hướng dẫn cầm tay chỉ việc** (bấm nút nào, gõ gì trên giao diện thật của một app) → dùng skill
`tutorial-video` (cùng project, cùng lệnh), không làm theo quy trình dưới đây.

## 0. Môi trường

Cần: Node ≥ 20, Chrome (chụp trang), Python ≥ 3.10 (VieNeu-TTS và tổng hợp nhạc).

Nếu project chưa có `src/components/layout.tsx` và `scripts/voiceover.ts` thì cài bộ khung:

```bash
node <skill-dir>/scripts/setup.mjs <thư-mục-project>
```

Script chép khung code vào project (không ghi đè file đã có, in ra file bị bỏ qua), trộn `package.json`,
chạy `npm install`, tạo `.venv-tts` (Python 3.12 qua `uv`) và cài `vieneu`. Lần đầu VieNeu tải model (vài trăm MB).

Lệnh có sẵn (`<name>` = tên thư mục video trong `src/`):

| Lệnh | Việc |
|---|---|
| `npm run shoot -- <url> public/<name>/<file>.png [--at "tiêu đề"] [--find "chữ"]` | Chụp trang (dark mode, 1280×900 @2x) + `<file>.json` (toạ độ theo ảnh): nút Star, khung About, nhãn số sao, chữ cần tìm. `--at` cuộn tới một mục giữa trang trước khi chụp |
| `npm run shootfull -- <url> public/<name>/<prefix> [y1 y2]` | Chụp **cả trang** rồi cắt khung 1280×900 ở toạ độ y — khi `shoot --at` không cuộn tới được (trang cuộn trong div, mục thu gọn, popup). Chạy không có y trước để xem `<prefix>-preview.png` rồi chọn y |
| `npm run voiceover -- <name> [p3 p6]` | Giọng từng đoạn → `public/<name>/vo/*.mp3` + `src/<name>/vo-durations.json` (liệt kê id để chỉ tạo lại vài đoạn) |
| `npm run music -- <name>` | Nhạc nền đúng độ dài video → `public/<name>/music.mp3` |
| `npm run render -- <name> [16:9]` | Render mọi khổ (hoặc khổ được liệt kê) + chuẩn hoá âm lượng → `out/<name>-9x16.mp4`… Số tab render song song tự tính theo RAM đang trống trước mỗi khổ — không đặt cứng `REMOTION_CONCURRENCY` |
| `npm run deliver -- <name> [--render]` | **Thành phẩm cuối**: `release/<name>/` gồm video mọi khổ, ảnh bìa từng khổ, `dang-bai.md` (tiêu đề, mô tả, hashtag) |
| `npx remotion still src/index.ts <ID>-9x16 out/x.png --frame=N` | Chụp 1 khung hình để kiểm tra |

## 1. Phân tích ý tưởng

Từ lời người dùng, xác định (tự suy ra nếu được; chỉ hỏi khi thiếu thứ quyết định nội dung):

- **Chủ thể** và link chính thức.
- **Thông điệp chính**: người xem nhớ được 1 điều gì? (vd "giọng AI như ElevenLabs mà miễn phí, chạy local").
- **Người xem** và **nơi đăng** → quyết định **khổ hình** và **độ dài**:

| Nơi đăng | Khổ | Gợi ý độ dài |
|---|---|---|
| TikTok / Reels / Shorts | `9:16` | 20–60s, mỗi cảnh 1 ý |
| Feed Facebook / Instagram | `4:5` hoặc `1:1` | 30–90s |
| YouTube, slide, màn hình ngang | `16:9` | Tuỳ nội dung — vài phút cũng được |

  Độ dài **không giới hạn**: nó là kết quả của nội dung (số câu thoại × độ dài đọc), không phải con số định trước.
  **Mặc định video ngắn chỉ render `9:16`** (`FORMATS = ["9:16"]`). Chỉ thêm `16:9` khi người dùng yêu cầu, hoặc khi
  phân tích thấy nên có bản ngang (video dài > 3 phút, nội dung cho YouTube/màn hình ngang) — lúc đó **hỏi** người dùng
  khi trình kịch bản, đừng tự thêm. Mỗi khổ thêm là một lần render (tốn RAM, thời gian) và một lượt soát ảnh tĩnh.
  Bố cục vẫn viết co giãn (`useLayout`, `SplitLayout`) để sau này thêm khổ chỉ cần sửa `FORMATS` rồi render lại.
- **Kêu gọi cuối (CTA)** — luôn có đủ 2 phần:
  1. **Hành động với nội dung**: lưu lại / thử ngay / link.
  2. **Đăng ký kênh + tương tác**: mời đăng ký (YouTube) hoặc theo dõi (TikTok/Reels), và một **câu hỏi gợi bình luận**
     gắn với chủ đề (vd "Bạn hay dán gì vào AI nhất? Bình luận cho mình biết nhé"). Câu hỏi phải cụ thể, trả lời được
     trong vài chữ — tránh câu chung chung "bạn nghĩ sao?".
  - Hai câu cuối không cùng kết bằng "nhé" (nghe thừa, lặp): "nhé" chỉ để ở câu kêu gọi bình luận; câu "lưu lại"
    kết bằng "!" hoặc "." (vd "Lưu lại và thử ngay!").

## 2. Nghiên cứu và tư liệu thật

Người xem video công nghệ rất nhạy với số liệu sai và ảnh minh hoạ "bịa":

- Đọc README / trang chủ / docs chính thức. Số sao: `gh api repos/<owner>/<repo>` hoặc nhãn trong ảnh chụp.
- **Hình theo thứ tự ưu tiên**: ảnh giao diện chính thức (thường trong `docs/`, `assets/`, ảnh README) → ảnh chụp trang
  thật bằng `npm run shoot` → đồ hoạ tự vẽ (icon, chữ, sóng âm, số lớn). Không dựng giao diện giả.
- Repo dạng SDK/CLI/thư viện thường không có ảnh giao diện: chụp **các mục trong README/docs** làm hình cho từng tính năng
  — bảng benchmark, đoạn code mẫu, danh sách giọng/model — bằng `npm run shoot -- <url> <file> --at "tên mục"`,
  rồi zoom vào ô/dòng đáng chú ý.
- Nguồn là **PDF** (báo cáo, hướng dẫn chính thức): render trang thành ảnh 2560px và lấy toạ độ câu cần khoanh bằng
  `pypdfium2` (`page.render(scale=2560/w)`, `textpage.search(câu).get_next()` → `get_charbox`); số trang ghi theo số
  in trên tài liệu. Bài viết có **sơ đồ gốc** thì tải ảnh gốc về dùng trực tiếp — rõ hơn ảnh chụp trang.
- Tải ảnh/logo vào `public/<name>/`; đọc kích thước ảnh trước khi đặt toạ độ camera.
- Người dùng gửi **video của người khác để tham khảo hiệu ứng**: chỉ học kỹ thuật chung (phụ đề, nhịp chuyển động,
  so sánh, sơ đồ luồng) rồi làm theo phong cách của kênh — không chép nét đặc trưng của họ (mã hex trôi, ô icon
  gradient cạnh tiêu đề, huy hiệu "VS", khung ngắm 4 góc…). Tải bằng `yt-dlp --js-runtimes node`, tách khung hình để xem.
- Ghi lại claim nào **chưa kiểm được** và nói rõ với người dùng. Có bản trả phí thì nói "bản mã nguồn mở miễn phí",
  đừng nói "miễn phí" chung chung.

## 3. Kịch bản + bảng phân cảnh → người dùng duyệt

Trình bảng trước khi tạo giọng (sửa kịch bản lúc này rẻ nhất):

| # | Lời đọc | Chữ trên màn hình | Hình |
|---|---|---|---|

- Mỗi câu một ý, 8–20 từ. Câu đầu là **hook**; **hai câu cuối** là kêu gọi: một câu "lưu lại / thử ngay", một câu "đăng ký kênh + câu hỏi bình luận" (không gộp quá dài vào một câu — giọng đọc sẽ vội). Video dài: chia **chương** (mỗi chương mở bằng
  một cảnh tiêu đề ngắn) và đổi kiểu cảnh xen kẽ để không lặp — cùng một kiểu cảnh quá 3 lần liền là dấu hiệu nhàm.
- Viết số bằng chữ trong lời đọc ("gần bảy mươi nghìn sao"); trên màn hình dùng số ("69.8K").
- Hạn chế tiếng Anh; khi buộc dùng, xem `references/voice.md` (VieNeu đọc từ viết tắt, "AI", "agent"…).
- Chữ trên màn hình ngắn hơn lời đọc, ≤ 30 ký tự/dòng ở khổ dọc.

**Hình phải sinh động**, không chỉ chữ: mỗi ý trừu tượng có một minh hoạ chuyển động (khung chat gõ dần, thanh tiến
độ, cầu thang cấp độ, vòng lặp có chấm chạy, hai vòng tròn hợp nhất…), xen kẽ với ảnh chụp nguồn có khoanh sáng.
Ví dụ/số liệu tự đặt ghi "* Ví dụ minh hoạ" ngay trên khung.

**Phụ đề theo từ** (`Captions` trong `src/components/fx.tsx`) bật mặc định cho mọi câu trừ câu kêu gọi cuối; nội dung
cảnh chừa đáy (~260px ở 9:16) để phụ đề không đè. Bộ hiệu ứng `fx.tsx`: `Bokeh` (đốm sáng nền), `ChapterTag`
("01 ── TÊN CHƯƠNG"), `SplitCompare` (so sánh chia đôi, nghiêng về bên thắng), `StepDot` + `GrowArrow` (sơ đồ luồng),
`Stamp` (con dấu). Ví dụ đầy đủ: `src/chatcowork/` trong project gốc.

**Hiệu ứng minh hoạ Motion Atlas** (138 mẫu, `vendor/motion-atlas`, MIT): ý trừu tượng không có ảnh thật thì tra
`references/atlas.md` (danh mục tiếng Việt theo chủ đề + ảnh `references/atlas-*.jpg`), chọn hiệu ứng theo **ý nghĩa câu
thoại** (vd "chia nhỏ rồi gộp" → MURMUR, "giá tăng" → CANDLES), ghi KEY vào cột Hình để duyệt; sau duyệt xuất đúng KEY đó
(`npm run atlas -- KEY --dur 8`) và đặt `<AtlasClip effect="KEY" width={…} />` trong cảnh như một clip minh hoạ.
**Không dùng làm nền video** — nền giữ `Background` + `Bokeh` như cũ (người dùng chọn 25/10/2026).

Các kiểu cảnh đã có sẵn (bố cục, toạ độ, nhịp trong `references/scenes.md`):
Hook (chữ lớn + sóng âm) · Giới thiệu (logo + trang GitHub, zoom nút Star, số sao đếm lên) ·
Tính năng (ảnh giao diện thật, camera zoom + khoanh sáng) · Danh sách + con số lớn · Kết (CTA + link).

## 4. Dựng

1. Chép video mẫu `references/example/` vào `src/<name>/` (`data.ts`, `scenes.tsx`, `Video.tsx` — đổi tên component
   `VoiceStudioVideo` theo video), tạo `src/<name>/vo-durations.json` = `{}`, rồi sửa:
   - `data.ts`: `NAME` (= tên thư mục), `COMPOSITION_ID`, `FORMATS` (mặc định `["9:16"]`; thêm `"16:9"` khi người dùng đồng ý), `SEGMENTS`
     (id `p1…pN`, `text` = lời đọc; `start`/`max` chỉ dùng khi chưa có giọng), `BRAND` lấy màu từ logo.
   - `scenes.tsx`: nội dung từng cảnh. Mảng cảnh trong `Video.tsx` phải khớp số đoạn thoại (cảnh i ↔ `SEGMENTS[i]`).
     Ảnh của video mẫu là 1440×960 (`APP_PAGE`); ảnh của bạn khác kích thước thì đổi theo.
2. Đăng ký trong `src/Root.tsx` bằng `<VideoCompositions id component formats durationInFrames fps />` (bỏ Placeholder).
3. `npx tsc` phải sạch.

**Bố cục co giãn theo khổ** — đây là điều kiện để một video xuất được nhiều khổ:
- Viết mọi kích thước px theo thiết kế gốc 1080×1920 rồi nhân `k` từ `useLayout()` (`k` = 1 ở 9:16, nhỏ hơn ở khổ thấp).
- Cảnh "chữ + hình" dùng `SplitLayout` (`head`, `media(box)`, `foot`): dọc/vuông xếp trên–dưới, ngang chia trái–phải.
  `media` nhận kích thước ô thật; khung xem ScreenCard = ô trừ `HEADER_H`.
- Camera ScreenCard tính theo khung xem thật: viết `keys` dạng hàm `(view) => CamKey[]` và dùng `fitBox(box, view)`.
- Cảnh không có ảnh (danh sách, con số) tự chia: `L.landscape ? row : column`.

Mốc thời gian **tự căn theo độ dài giọng đọc** (`src/timeline.ts`): cảnh bắt đầu đúng lúc câu của nó bắt đầu.
Trong cảnh, đặt mốc bằng `beat("p3", 0.4)` (frame lúc câu p3 đọc được 40%) thay vì số frame cố định — giọng đổi thì
mốc tự co giãn. Các bước camera nên xong trước ~70% câu. Vùng zoom phải hẹp hơn ~½ khung đang thấy, nếu không camera
gần như đứng yên; `fitBox` tự chặn zoom ở 2.5× để ảnh không mờ.

Khổ ngang: cột chữ chỉ rộng ~42% màn hình, tiêu đề 100px dài hơn ~12 ký tự sẽ xuống dòng — đặt chỗ ngắt có chủ ý
(`{L.landscape ? <br /> : " "}`) để không rớt một chữ lẻ.

## 5. Giọng đọc

Mặc định VieNeu-TTS v3 Turbo, giọng **Hải Đăng**, temperature 0.6 (`.env`: `TTS_PROVIDER=vieneu`,
`VIENEU_VOICE`, `VIENEU_TEMPERATURE`). Chạy `npm run voiceover -- <name>`.

Khi người dùng chê cách đọc một từ/cụm: tạo **vài bản thử** của riêng câu đó (đặt tên file nói rõ cách đọc) để họ
nghe và chọn. Sau khi chọn, **dùng đúng file đã duyệt** (mp3 vào `public/<name>/vo/<id>.mp3`, cập nhật
`vo-durations.json`) thay vì tạo lại — mỗi lần tạo VieNeu cho ngữ điệu hơi khác. Rồi ghi cách đọc đã chọn vào
`VIENEU_SAY` trong `scripts/voiceover.ts` để lần sau tự áp dụng. Chi tiết và các bẫy phát âm: `references/voice.md`.

**Trước khi tạo giọng, kiểm phiên âm của tên sản phẩm và mọi từ tiếng Anh** (lệnh trong `references/voice.md`) —
tên lai như "VieNeu" bị tách thành "vie neu" rồi đọc kiểu Anh "vai nu". Sửa bằng một quy tắc trong `VIENEU_SAY`.

## 6. Kiểm tra bằng khung hình tĩnh

Trước khi render cả video, chụp 1 khung hình mỗi cảnh **ở từng khổ** tại lúc camera đã dừng (gần cuối cảnh) và
**xem ảnh**: chữ tiếng Việt đủ dấu, không rớt dòng lẻ chữ, không tràn mép (khổ ngang hay tràn cột chữ), vòng sáng đúng
chỗ, số liệu khớp ảnh chụp. Frame bắt đầu cảnh i = `30 × (0.5 + Σ(dur + 0.35))` của các câu trước.

## 7. Nhạc, render, bàn giao

```bash
npm run music -- <name>      # chạy lại mỗi khi độ dài video đổi
npm run render -- <name>     # out/<name>-<khổ>.mp4, -14 LUFS, 48 kHz
npx remotion ffprobe out/<name>-9x16.mp4   # phải có cả luồng video và audio
# đo độ to (ffmpeg của Remotion không có ebur128/volumedetect):
npx remotion ffmpeg -i out/<name>-9x16.mp4 -vn -af loudnorm=I=-14:print_format=json -f null -
```

Nhạc tự tổng hợp (`scripts/music.py`) nên không vướng bản quyền; dài bao nhiêu cũng được (đổi vòng hợp âm mỗi 8 ô
nhịp, có đoạn nghỉ mỗi 16 ô). `MusicBed` tự giảm nhạc ~15 dB khi có lời.

## 8. Đóng gói đăng bài — đầu ra cuối cùng

Mỗi lần đi từ ý tưởng tới sản phẩm, **kết quả trả cho người dùng là một thư mục** `release/<name>/`, không phải các file
rời trong `out/`. Viết `src/<name>/post.md` rồi chạy `npm run deliver -- <name>` (tự render khổ nào chưa có file):

```
release/<name>/
  <name>-9x16.mp4, <name>-16x9.mp4 …   video từng khổ
  thumbnail-9x16.png …                  ảnh bìa (khung cuối cảnh mở đầu, phụ đề tự tắt; đặt THUMB_FRAME trong data.ts để chọn khung khác)
  dang-bai.md                           bảng thông số file + nội dung post.md
```

Video thuộc **một series** (người dùng nói sẽ làm nhiều tập cùng chủ đề): thêm `export const SERIES = "<tên-series>"` vào
`data.ts` → deliver gom vào `release/<tên-series>/<name>/`. Các tập sau của cùng series dùng đúng tên series đó.
**Chỉ đặt `SERIES` khi người dùng nói rõ video đó thuộc seri** — chủ đề giống seri trước KHÔNG có nghĩa là cùng seri.
Không chắc thì hỏi (AskUserQuestion) khi trình kịch bản; mặc định là video lẻ, không viết "tập sau", "seri" trong lời đọc.

`post.md` viết bằng tiếng Việt, mỗi nền tảng một mục, nội dung để trong khối ``` cho dễ sao chép:
- **YouTube (16:9)**: tiêu đề (≤ 100 ký tự, có từ khoá chính), mô tả (tóm tắt, mục lục/ý chính, câu lệnh hay lệnh cài
  nếu có, **link nguồn**, ngày lấy số liệu, dòng cuối "🔔 Đăng ký kênh…" + câu hỏi bình luận), hashtag, ô **Thẻ (tags)** cách nhau bằng dấu phẩy.
- **Câu hỏi ghim bình luận** (mục riêng trong `post.md`): đúng câu hỏi ở cuối video, để ghim làm bình luận đầu tiên.
- **TikTok / Reels / YouTube Shorts (9:16)**: chú thích ngắn (hook + 3–5 ý bằng emoji + kêu gọi lưu lại + theo dõi kênh
  + câu hỏi bình luận), 6–10 hashtag;
  Shorts thêm `#Shorts`. Video > 3 phút không đăng Shorts được — ghi rõ.
- **Lưu ý trước khi đăng**: claim chưa kiểm chứng, ví dụ minh hoạ, nội dung nên tránh, số liệu có ngày hết hạn.
  Luôn có dòng: **mỗi nền tảng chỉ đăng một bản** — YouTube chọn 16:9 *hoặc* Shorts 9:16, không cả hai (kênh từng bị
  YouTube gỡ bản dọc khi đăng cả hai, 10/2026); bản còn lại cho TikTok/Reels. Nhắc bật "Nội dung bị thay đổi/tổng hợp"
  vì giọng đọc là AI. Nguồn có giấy phép phi thương mại (CC BY-NC…) thì ghi rõ để cân nhắc khi kênh kiếm tiền.
Mẫu: `references/post-example.md`.

Khi bàn giao, nói rõ: đường dẫn thư mục `release/<name>/`, thời lượng, những gì đã kiểm (ảnh tĩnh, ffprobe) và **chưa kiểm** (bạn không
nghe được audio — nói thẳng là chưa nghe), claim nào chưa xác minh, và lệnh để sửa tiếp.

## Khi gặp lỗi

`references/troubleshooting.md` — các lỗi đã gặp thật: `React is not defined` khi đặt JSX ở cấp module, PowerShell làm
hỏng tiếng Việt khi pipe vào Python, `__name is not defined` trong `page.evaluate`, `kaldi-native-fbank` trên
Python 3.14, render chậm vì `filter: blur`, giới hạn gói Free của ElevenLabs…
