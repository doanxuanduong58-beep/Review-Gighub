# Lỗi đã gặp và cách xử lý

| Triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| Lần đầu `remotion compositions/render` treo vài phút không in gì | Remotion đang tải chrome-headless-shell (~280MB) | `npx remotion browser ensure` trước (setup.mjs đã làm) |
| `spawn ...chrome-headless-shell.exe ENOENT` dù file có thật (Windows) | Đường dẫn > 260 ký tự (MAX_PATH) khi project nằm sâu | Đặt project ở thư mục ngắn, hoặc `remotion.config.ts`: `Config.setBrowserExecutable("<đường dẫn 8.3, dùng />")` — setup.mjs tự tạo khi cần. Lấy tên ngắn: `cmd /c for %I in ("<path>") do @echo %~sI` |
| `print` tiếng Việt lỗi `UnicodeEncodeError` (cp1252) | Console Windows | `python -X utf8` |
| Giọng đọc lời của **video khác**; thời lượng câu thất thường (quá ngắn/dài so với số chữ) | Hai phiên chạy `voiceover` cùng lúc, file tạm `%TEMP%/vieneu-jobs.json`, `vieneu-p01.wav` trùng tên nên ghi đè nhau (gặp 18/10/2026) | Đã sửa: tên file tạm có tên video. Kiểm nội dung bằng chuyển giọng → chữ (faster-whisper `small`, venv riêng; nạp wav 16 kHz bằng `wave` + numpy vì `av` mới lỗi `metadata_errors`). Dấu hiệu nghi: tốc độ lệch xa ~4 âm tiết/giây |
| Chữ `\n` hiện nguyên trên màn hình thay vì xuống dòng | Thuộc tính JSX dạng chuỗi `question="a\nb"` không xử lý escape | Dùng biểu thức `question={"a\nb"}` hoặc hằng số trong `data.ts`; `SubscribeScene` cũng tự đổi `\\n` thành ngắt dòng |
| `ReferenceError: React is not defined` khi `remotion compositions` | JSX đặt ở cấp module (vd mảng `[<Hook />, ...]`) chạy trước khi bundler gắn `React` | Bọc trong hàm: `const SCENES = [() => <Hook />]` rồi gọi `scene()` lúc render |
| `__name is not defined` trong puppeteer `page.evaluate` | tsx/esbuild chèn helper `__name` vào hàm được serialize sang trình duyệt | Truyền code dạng **chuỗi** cho `page.evaluate` (xem `scripts/shoot.ts`) |
| Tiếng Việt thành `?` khi gọi Python từ PowerShell | PowerShell pipe dùng encoding hệ thống | Ghi JSON ra file (Node `writeFileSync`) rồi truyền đường dẫn `--jobs` |
| `kaldi-native-fbank` build fail khi `pip install vieneu` | Chưa có wheel cho Python 3.14 trên Windows | `python -m pip install --user uv` → `python -m uv venv .venv-tts --python 3.12` → `python -m uv pip install --python .venv-tts vieneu` |
| Render cực chậm (>10 phút cho 30s) | `filter: blur(200px)` trên phần tử lớn | Dùng `radial-gradient` thay blur (component `Background` đã làm) |
| Bước chuẩn hoá âm lượng ra 96 kHz | `loudnorm` upsample nội bộ | Thêm `-ar 48000` (đã có trong `scripts/render.ts`) |
| Tham số thêm bị dính vào lệnh cuối trong chuỗi `&&` của npm script | `npm run x -- --flag` nối flag vào cuối | Dùng script Node (`scripts/render.ts`) thay chuỗi `&&` |
| Selector GitHub `#repo-stars-counter-star` không còn | GitHub đổi DOM | Tìm `a, button` có chữ bắt đầu bằng `Star` + số; About = `h2` "About" hiển thị → `[class*=sidebarSection]` |
| `--find` trả về phần tử ở cuối trang | Trùng chữ ở nhiều nơi | Script ưu tiên phần tử nằm trong 900px đầu (`inShot: true`) |
| Edge TTS `NoAudioReceived` | Dịch vụ chập chờn | Thử lại (script đã tự retry 5 lần) |
| ElevenLabs 400 `api_key_id_used_as_api_key` | Dán ID của key | Key thật bắt đầu bằng `sk_` |
| ElevenLabs 402 `paid_plan_required` / 403 `feature_not_available` | Gói Free không dùng giọng thư viện / Voice Design qua API | Dùng giọng premade, VieNeu, hoặc tạo trên web rồi bỏ file vào `public/<name>/vo/` |
| `Model 'eleven_multilingual_v2' does not support language_code 'vi'` | — | `ELEVENLABS_MODEL_ID=eleven_v3` |
| Thư mục mẫu giọng chứa file giống hệt nhau | Vòng lặp vẫn chép file cũ khi lần tạo thất bại | Kiểm tra lỗi trước khi chép; so dung lượng/giờ tạo trước khi đưa người dùng nghe |
| `.env` có tiếng Việt (`VIENEU_VOICE=Hải Đăng`) | — | Ghi `.env` bằng UTF-8 không BOM; `dotenv` đọc được |
| JSON ghi bằng PowerShell `Set-Content -Encoding utf8` lỗi khi import | PowerShell 5.1 thêm BOM | `[IO.File]::WriteAllText(path, text)` |
| Render dừng giữa chừng không in lỗi, hoặc Claude Code báo dừng lệnh nền vì thiếu bộ nhớ | Máy hết RAM (Chrome headless mở nhiều tab, phiên khác cũng render) | `render.ts` tự hạ concurrency theo RAM trống (không đặt cứng `REMOTION_CONCURRENCY`); chờ phiên khác render xong hoặc render từng khổ `npm run render -- <name> 16:9` rồi `npm run deliver -- <name>`. Claude Code vừa dừng vì thiếu RAM thì báo người dùng, đừng tự chạy lại |
| `RangeError: Frame NaN is not finite` ở một cảnh | `focusAt` ít phần tử hơn số vùng `focus` của ảnh chụp → `beat(seg, undefined)` | Cắt bớt `focus` (`shot.focus.slice(0, n)`) hoặc cho đủ `focusAt` |
| `npm run shoot -- --at` ra đầu trang hoặc vùng trống (trang trợ giúp kiểu Intercom, bài có popup) | Trang cuộn trong một div, hoặc chữ nằm trong mục thu gọn | `npm run shootfull` (chụp cả trang, cắt theo y) |
| Ảnh bìa dính một chữ phụ đề lẻ | Khung cuối cảnh mở đầu còn phụ đề | Đã sửa: `deliver` gửi `--props={"thumbnail":true}`, `Captions` tự ẩn |
| Sửa `scripts/voiceover.ts` bằng script `replace` + `assert` lỗi mà lệnh tạo giọng nối sau vẫn chạy | Chuỗi khớp sai (escape `\\b`), assert chỉ dừng bước sửa | Sửa bằng Edit; `grep` quy tắc mới trước khi chạy `voiceover` |
