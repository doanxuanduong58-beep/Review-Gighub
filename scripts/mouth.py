"""Độ mở miệng của nhân vật theo âm lượng giọng đọc (lip sync đơn giản).

    python scripts/mouth.py <name> [fps]

Đọc public/<name>/vo/*.mp3 (giải mã bằng ffmpeg của Remotion), tính RMS từng khung hình rồi chuẩn hoá về 0..1
theo phân vị 95 của mỗi câu, làm mượt nhẹ. Ghi src/<name>/mouth.json = { "p1": [0.0, 0.4, ...], ... }.
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf

name = sys.argv[1]
fps = int(sys.argv[2]) if len(sys.argv) > 2 else 30
vo = Path("public") / name / "vo"
out = {}
with tempfile.TemporaryDirectory() as tmp:
    for mp3 in sorted(vo.glob("*.mp3")):
        wav = Path(tmp) / (mp3.stem + ".wav")
        subprocess.run(
            ["npx", "remotion", "ffmpeg", "-loglevel", "error", "-y", "-i", str(mp3), "-ac", "1", "-ar", "16000", str(wav)],
            check=True,
        )
        data, sr = sf.read(wav)
        hop = sr // fps
        n = len(data) // hop
        rms = np.array([np.sqrt(np.mean(data[i * hop : (i + 1) * hop] ** 2)) for i in range(n)])
        ref = np.percentile(rms, 95) or 1.0
        level = np.clip((rms / ref - 0.12) / 0.88, 0, 1)
        # Làm mượt: mở nhanh, khép chậm hơn một chút để miệng không giật.
        smooth = np.zeros_like(level)
        for i, v in enumerate(level):
            prev = smooth[i - 1] if i else 0
            smooth[i] = v if v > prev else prev * 0.55 + v * 0.45
        out[mp3.stem] = [round(float(v), 2) for v in smooth]
Path("src", name, "mouth.json").write_text(json.dumps(out))
print({k: len(v) for k, v in out.items()})
