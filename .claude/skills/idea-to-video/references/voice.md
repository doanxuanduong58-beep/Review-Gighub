# Giọng đọc

## VieNeu-TTS (mặc định)

- Repo `pnnbao97/VieNeu-TTS`, license Apache-2.0. SDK `vieneu` mặc định dùng **v3 Turbo** (48 kHz), chạy CPU qua
  ONNX, không cần PyTorch. Khoảng 2× thời gian thực trên CPU laptop (câu 4 giây mất ~4 giây).
  v2 cần extra `legacy` (PyTorch) — chỉ dùng khi người dùng yêu cầu đúng v2. v4 không mở mã.
- Cài trong `.venv-tts` (Python 3.12). Python 3.14 trên Windows chưa có wheel `kaldi-native-fbank` → dùng `uv`
  để tạo venv 3.12 (`setup.mjs` đã làm việc này).
- Gọi trực tiếp: `.venv-tts/Scripts/python scripts/vieneu_tts.py --voice "Hải Đăng" --temperature 0.6 --jobs jobs.json`
  (`jobs.json` = `[{"text": "...", "out": "a.wav"}]`; ghi file JSON bằng Node/Python, **đừng pipe tiếng Việt qua
  PowerShell** — nó làm hỏng dấu). `--list-voices` để xem 25 giọng.
- `temperature` 0.6 cho giọng ổn định, ít "diễn"; 1.0 (mặc định của SDK) sinh động hơn nhưng dễ đọc lệch từ tiếng Anh.

### Giọng nên thử trước (10 giọng tác giả chọn)

Nam Bắc: **Hải Đăng** (tự nhiên — đã được chọn cho video VoiceStudio), Thiện Minh, Thiền Tâm Đức (kể chuyện), Adam bựa.
Nữ Bắc: Mai Anh (tin tức), Trúc Ly, Ngọc Huyền. Miền Trung: Quang Sơn, Ngọc Trân. Miền Nam: Thùy Dung.

Khi người dùng chưa chọn giọng: tạo cùng một câu (câu có cả tiếng Việt và tên riêng tiếng Anh) với 6–10 giọng,
đặt file `out/vo-samples/<nhóm>/<tên giọng>.wav`, đưa bảng cho người dùng chọn.

### Phát âm — các bẫy đã gặp

VieNeu chuyển chữ thành phiên âm bằng `sea-g2p`. Kiểm tra trước khi tạo giọng (vài giây, không cần model). Ghi đoạn
sau ra một file `.py` ngoài project rồi chạy bằng **`.venv-tts/Scripts/python -X utf8 <file>.py "câu 1" "câu 2"`**
(`-X utf8` bắt buộc trên Windows — console cp1252 làm `print` tiếng Việt bị lỗi; đừng dùng `-I` vì nó bỏ qua
`PYTHONIOENCODING`):

```python
import sys
from vieneu_utils.phonemize_text import phonemize_batch
from sea_g2p import Normalizer
norm = Normalizer(lang="vi")
for text in sys.argv[1:]:
    n = norm.normalize(text)
    print(text, "| norm:", n, "| ipa:", phonemize_batch([n], skip_normalize=True)[0])
```

Đọc dòng `ipa`: âm tiếng Việt có số thanh (`ˈaː2`), âm tiếng Anh có dạng IPA Anh (`ˈeɪdʒənt`). Hai phương án có `ipa`
giống hệt nhau thì nghe sẽ y như nhau — đừng tạo cả hai.

| Chữ | Mặc định | Cách đã chọn |
|---|---|---|
| Tên riêng tiếng Anh (ElevenLabs, GitHub, cloud…) | Phiên âm tiếng Anh đúng, giọng Việt đọc hơi lơ lớ | Giữ nguyên; người dùng chấp nhận được |
| `AI` (đứng riêng, trong mọi câu) | Bộ chuẩn hoá tự thành `<en>a i</en>` → "ây · ai" theo âm tiếng Anh | **Giữ nguyên — người dùng đã chọn.** Có người nghe thấy hơi khựng; đã thử "ây ai" kiểu Việt và đổi thành "chatbot" (video cvai, 18/10/2026), người dùng vẫn chọn cách mặc định. Không cần quy tắc trong `VIENEU_SAY`; nếu người dùng chê lại thì đưa lại 3 phương án này |
| `<en>AI ...</en>` (bọc cả cụm có AI) | "AI" bị đọc thành chữ **"ai"** tiếng Việt | Đừng bọc AI theo kiểu này |
| `MCP`, `API` | Đánh vần kiểu Việt "mờ xê phê" | `<en>M C P</en>` (tách chữ cái) |
| `agent` / `AI agent` | Đọc kiểu Anh "ây-dừnt", nghe lơ lớ (người dùng chê 21/10/2026) | Phiên âm Việt **"ây giần"** (nghe thử 4 cách: kiểu Anh, "ây giần", "ây dừn", "tác tử" → chọn "ây giần"); `VIENEU_SAY` tự đổi mọi chữ agent/agents, "agent AI" → `ây giần <en>A I</en>`. Chữ trên màn hình giữ "Agent" |
| Tên lai Việt–Anh (`VieNeu`) | Tách "vie neu" rồi đọc kiểu Anh "vai nu" | Phiên âm tay theo cách tác giả đọc, vd `[/VieNeu-TTS/g, "Vi Niu <en>T T S</en>"]`; chưa rõ cách đọc thì nói với người dùng |
| Chữ "gộp" (gặp 20/10/2026) | Nghe thành "gục", tạo lại nhiều lần vẫn vậy | Dùng từ đồng nghĩa "ghép"; tên nút Combine đọc là "Kết hợp" |
| "OpenAI" | Nghe thành "hút bên AI" | Tránh đọc tên công ty; nói "trang trợ giúp của ChatGPT" / "công ty làm ra ChatGPT" |
| "Cowork" (gặp 22/10/2026) | Đọc liền thành "cao-ơk" | `VIENEU_SAY`: `<en>co work</en>` (tách hai tiếng) |
| "Graphify" (gặp 24/10/2026) | Tách "graph · ai-phai" (`ɡɹˈæf ˈaɪfaɪ`) | `VIENEU_SAY`: `<en>graffy fy</en>` → `ɡɹˈæfi fˈaɪ` ("gráp-phi-phai"); chưa nghe thử |
| "Anthropic" | Dễ đọc lơ lớ | Chỉ để trên màn hình; lời đọc nói "công ty làm ra Claude" |
| "CLAUDE.md" (gặp 31/10/2026) | "claude dot M D" | `VIENEU_SAY`: "Claude chấm <en>M D</en>" (giống SKILL.md) |
| "Andrej Karpathy" (gặp 31/10/2026) | "Andrej" đọc kiểu Anh "en-đrếch" (`ændɹɛdʒ`) | `VIENEU_SAY`: `<en>Ahndray Karpathy</en>` → `ɑːn dɹeɪ kɑːɹpəθi` (gần "An-đrây"); chưa nghe thử |
| "Godot" (gặp 31/10/2026) | "ga-đát" (`ɡɑːdɑːt`) | `VIENEU_SAY`: `<en>go dough</en>` → "gâu-đâu" (cách đọc chính thức); chưa nghe thử |
| "Thiel" (Peter Thiel, gặp 31/10/2026) | Âm θ "thi-ồ" (`θiːl`) | `VIENEU_SAY`: `<en>teel</en>` → "tiil"; Whisper nghe thành "Teo", chưa nghe thử |
| Số "bảy mươi tư" sau chữ "Kèm" (gặp 31/10/2026) | Lần tạo đầu Whisper nghe thành "Kem mình tư" | Tạo lại riêng câu đó (`npm run voiceover -- <name> p09`) rồi kiểm lại bằng Whisper |

Các thay thế này nằm trong `VIENEU_SAY` (`scripts/voiceover.ts`) và chỉ áp dụng cho VieNeu — ElevenLabs/Edge
sẽ đọc nguyên văn thẻ `<en>`. Chữ trên màn hình đổi theo lời nếu lời đọc bị viết lại (vd "MCP cho agent AI").

Khi một từ vẫn chưa ổn: tạo 3–4 phương án trong cùng một câu (tách chữ cái, phiên âm kiểu Việt "em xi pi",
ngắt nhịp bằng dấu phẩy, đảo trật tự từ, hoặc thay bằng từ tiếng Việt như "trợ lý AI") và để người dùng chọn.
Nếu phiên âm của hai phương án giống hệt nhau thì đừng tạo cả hai — nghe sẽ y như nhau.

## Dùng lại bản đã duyệt

```bash
npx remotion ffmpeg -y -i "out/vo-samples/.../ban-da-chon.wav" -b:a 192k public/<name>/vo/p6.mp3
```

Rồi cập nhật `p6` trong `src/<name>/vo-durations.json` (đo bằng `npx remotion ffprobe`), chạy lại
`npm run music -- <name>` và `npm run render -- <name>`. Hoặc tạo lại riêng một đoạn: `npm run voiceover -- <name> p6`.

## Nhà cung cấp khác (`TTS_PROVIDER`)

- `edge` — Microsoft Edge TTS (`pip install edge-tts`), miễn phí, không cần key, 2 giọng Việt
  (`vi-VN-NamMinhNeural`, `vi-VN-HoaiMyNeural`). Dịch vụ không chính thức, thỉnh thoảng lỗi `NoAudioReceived`
  (script đã tự thử lại). Đọc chậm hơn nhịp TikTok → `EDGE_RATE=+10%`.
- `elevenlabs` — cần `ELEVENLABS_API_KEY` (bắt đầu bằng `sk_`; chuỗi hex 64 ký tự là *ID* của key, không dùng được).
  Gói **Free**: chỉ dùng được giọng *premade* qua API (giọng thư viện như các giọng Việt Nhật/Thắm/Mai bị chặn 402,
  Voice Design qua API bị chặn 403). `eleven_multilingual_v2` **không** hỗ trợ tiếng Việt → dùng `eleven_v3`.
  Key cần quyền Text to Speech (+ Voices: Read để liệt kê giọng).
