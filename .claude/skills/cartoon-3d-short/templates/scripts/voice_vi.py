"""Giọng đọc tiếng Việt cho short hoạt hình: VieNeu-TTS -> voice.wav, faster-whisper -> words.json.

    python voice_vi.py <thư mục voice> [--voice "Hải Đăng"] [--temperature 0.6] [--gap 0.35] [--only p03,p07]

<thư mục voice>/lines.txt: mỗi dòng một câu của kịch bản (dòng trống / dòng bắt đầu bằng # bị bỏ qua).
Ghi ra cùng thư mục:
  lines/pNN.wav   từng câu (giữ lại; --only tạo lại riêng vài câu mà không đụng câu khác)
  voice.wav       các câu nối nhau, cách nhau --gap giây, 48 kHz mono
  words.json      [{"w": "chữ", "s": giây bắt đầu, "e": giây kết thúc}] — mỗi "chữ" là một âm tiết tiếng Việt
  check.md        câu kịch bản vs câu Whisper nghe được, để soát đọc sai

Cần: pip install vieneu faster-whisper numpy soundfile (venv Python 3.12; xem idea-to-video/references/voice.md).
"""

import argparse
import json
import os
import re
import sys

import numpy as np
import soundfile as sf

SR = 48000


def read_lines(folder):
    with open(os.path.join(folder, "lines.txt"), encoding="utf-8-sig") as f:
        return [l.strip() for l in f if l.strip() and not l.strip().startswith("#")]


def tts(lines, folder, voice, temperature, only):
    from vieneu import Vieneu

    os.makedirs(os.path.join(folder, "lines"), exist_ok=True)
    todo = [i for i in range(len(lines))
            if (only and f"p{i + 1:02d}" in only) or
            (not only and not os.path.exists(os.path.join(folder, "lines", f"p{i + 1:02d}.wav")))]
    if not todo:
        return
    t = Vieneu()
    for i in todo:
        out = os.path.join(folder, "lines", f"p{i + 1:02d}.wav")
        t.save(t.infer(lines[i], voice=voice, temperature=temperature), out)
        print(f"p{i + 1:02d}: {lines[i][:60]}", file=sys.stderr, flush=True)


def to_sr(x, sr):
    x = x.mean(axis=1) if x.ndim > 1 else x
    if sr == SR:
        return x
    n = int(round(len(x) * SR / sr))
    return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x)


def join(lines, folder, gap):
    parts, starts, t = [], [], 0.0
    for i in range(len(lines)):
        x, sr = sf.read(os.path.join(folder, "lines", f"p{i + 1:02d}.wav"), dtype="float32")
        x = to_sr(x, sr)
        starts.append(t)
        parts += [x, np.zeros(int(gap * SR), np.float32)]
        t += len(x) / SR + gap
    y = np.concatenate(parts[:-1]).astype(np.float32)
    sf.write(os.path.join(folder, "voice.wav"), y, SR, subtype="PCM_24")
    return y, starts


def norm(s):
    return re.sub(r"[^\w\s]", " ", s.lower()).split()


def align(y, lines, starts, folder):
    from faster_whisper import WhisperModel

    model = WhisperModel(os.environ.get("WHISPER_MODEL", "small"), device="cpu", compute_type="int8")
    y16 = np.interp(np.arange(0, len(y), SR / 16000), np.arange(len(y)), y).astype(np.float32)
    words, rows = [], []
    ends = starts[1:] + [len(y) / SR]
    for i, line in enumerate(lines):
        a, b = starts[i], ends[i]
        seg = y16[int(a * 16000):int(b * 16000)]
        segs, _ = model.transcribe(seg, language="vi", word_timestamps=True, initial_prompt=line,
                                   vad_filter=False, condition_on_previous_text=False)
        heard = []
        for s in segs:
            for w in s.words or []:
                txt = w.word.strip()
                if not txt:
                    continue
                heard.append(txt)
                words.append({"w": txt, "s": round(a + w.start, 3), "e": round(a + w.end, 3), "line": i + 1})
        ok = norm(line) == norm(" ".join(heard))
        rows.append((i + 1, ok, line, " ".join(heard)))
    with open(os.path.join(folder, "words.json"), "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False, indent=1)
    with open(os.path.join(folder, "check.md"), "w", encoding="utf-8") as f:
        f.write("| câu | khớp | kịch bản | Whisper nghe |\n|---|---|---|---|\n")
        for n, ok, l, h in rows:
            f.write(f"| p{n:02d} | {'✓' if ok else '✗ nghe lại'} | {l} | {h} |\n")
    bad = [f"p{n:02d}" for n, ok, *_ in rows if not ok]
    print(f"{len(words)} chữ, {len(y) / SR:.2f} s, {sum(len(norm(l)) for l in lines) / (len(y) / SR):.2f} âm tiết/s"
          + (f"; cần nghe lại: {','.join(bad)}" if bad else "; mọi câu khớp"), file=sys.stderr)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("folder")
    p.add_argument("--voice", default="Hải Đăng")
    p.add_argument("--temperature", type=float, default=0.6)
    p.add_argument("--gap", type=float, default=0.35)
    p.add_argument("--only", default="", help="vd p03,p07: chỉ tạo lại các câu này")
    a = p.parse_args()
    lines = read_lines(a.folder)
    tts(lines, a.folder, a.voice, a.temperature, set(filter(None, a.only.split(","))))
    y, starts = join(lines, a.folder, a.gap)
    align(y, lines, starts, a.folder)


if __name__ == "__main__":
    main()
