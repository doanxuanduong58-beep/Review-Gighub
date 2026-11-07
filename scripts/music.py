"""Tổng hợp nhạc nền bằng code (không dùng nhạc có bản quyền).

    .venv-tts/Scripts/python scripts/music.py --seconds 31 --out public/voicestudio/music.wav

Điện tử nhẹ, 110 BPM, giọng La thứ: pad hợp âm, arpeggio, sub bass, kick/clap/hi-hat nhẹ.
Độ dài bất kỳ: cứ 8 ô nhịp đổi vòng hợp âm (Am–F–C–G ↔ F–G–Em–Am), cứ 16 ô nhịp có 2 ô
"nghỉ" bỏ trống và bass để video dài không bị đơn điệu. Mở đầu chỉ có pad + arpeggio, fade-out ở cuối.
Âm lượng chuẩn hoá về đỉnh -1 dBFS; mức nghe và ducking dưới giọng đọc chỉnh trong Remotion.
"""

import argparse

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48_000
BPM = 110
BEAT = 60 / BPM
BAR = 4 * BEAT

# Hai vòng hợp âm, mỗi hợp âm một ô nhịp (MIDI); bass là nốt gốc tương ứng.
PROGRESSIONS = [
    ([[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], [45, 41, 48, 43]),  # Am F C G
    ([[53, 57, 60], [55, 59, 62], [52, 55, 59], [57, 60, 64]], [41, 43, 40, 45]),  # F G Em Am
]


def hz(midi: float) -> float:
    return 440.0 * 2 ** ((midi - 69) / 12)


def env_adsr(n: int, a: float, d: float, s: float, r: float) -> np.ndarray:
    t = np.arange(n) / SR
    total = n / SR
    e = np.where(t < a, t / a, s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    release = np.clip((total - t) / r, 0, 1)
    return e * release


def saw(freq: float, n: int, detune: float = 0.0, phase: float = 0.0) -> np.ndarray:
    t = np.arange(n) / SR
    f = freq * (1 + detune)
    return 2 * ((t * f + phase) % 1) - 1


def lowpass(x: np.ndarray, cutoff: float) -> np.ndarray:
    sos = butter(2, min(cutoff, SR / 2 - 100), btype="low", fs=SR, output="sos")
    return sosfilt(sos, x)


def add(buf: np.ndarray, start: float, sig: np.ndarray) -> None:
    i = int(start * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


def render(seconds: float) -> np.ndarray:
    n = int(seconds * SR)
    pad = np.zeros(n)
    arp = np.zeros(n)
    bass = np.zeros(n)
    drums = np.zeros(n)
    rng = np.random.default_rng(7)

    bars = int(np.ceil(seconds / BAR))
    for b in range(bars):
        t0 = b * BAR
        chords, roots = PROGRESSIONS[(b // 8) % 2]
        chord, root = chords[b % 4], roots[b % 4]
        # Đoạn nghỉ: 2 ô cuối của mỗi 16 ô (trừ khi đó là phần kết bài).
        breakdown = b % 16 >= 14 and (b + 1) * BAR < seconds - 2 * BAR

        # Pad: 3 nốt, mỗi nốt 2 sóng saw lệch nhẹ cho dày.
        length = int(BAR * SR) + int(0.3 * SR)
        voice = sum(saw(hz(m), length, d, rng.random()) for m in chord for d in (-0.004, 0.004))
        pad_sig = lowpass(voice, 1400) * env_adsr(length, 0.35, 1.0, 0.8, 0.4) * 0.08
        add(pad, t0, pad_sig)

        # Arpeggio nốt móc kép, lên quãng tám.
        notes = [chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[1] + 12]
        for k in range(8):
            m = notes[k % 4] + (12 if k >= 4 and b % 2 else 0)
            ln = int(BEAT / 2 * SR)
            tri = np.abs(saw(hz(m), ln)) * 2 - 1
            add(arp, t0 + k * BEAT / 2, lowpass(tri, 3500) * env_adsr(ln, 0.005, 0.12, 0.0, 0.05) * 0.10)

        if breakdown:
            continue

        # Sub bass: sóng sin, đánh theo phách.
        for k in range(4):
            ln = int(BEAT * 0.9 * SR)
            t = np.arange(ln) / SR
            sig = np.sin(2 * np.pi * hz(root) * t) * env_adsr(ln, 0.01, 0.25, 0.5, 0.08) * 0.28
            add(bass, t0 + k * BEAT, sig)

        for k in range(4):
            tb = t0 + k * BEAT
            # Kick ở phách 1 và 3.
            if k in (0, 2):
                ln = int(0.35 * SR)
                t = np.arange(ln) / SR
                f = 50 + 90 * np.exp(-t * 35)
                kick = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 0.55
                add(drums, tb, kick)
            # Clap ở phách 2 và 4.
            if k in (1, 3):
                ln = int(0.18 * SR)
                t = np.arange(ln) / SR
                noise = rng.standard_normal(ln)
                clap = sosfilt(butter(2, [900, 3500], btype="band", fs=SR, output="sos"), noise) * np.exp(-t * 22) * 0.22
                add(drums, tb, clap)
            # Hi-hat ở nửa phách.
            ln = int(0.05 * SR)
            t = np.arange(ln) / SR
            hat = sosfilt(butter(2, 7000, btype="high", fs=SR, output="sos"), rng.standard_normal(ln)) * np.exp(-t * 80) * 0.07
            add(drums, tb + BEAT / 2, hat)

    t = np.arange(n) / SR
    # Mở đầu: chỉ pad + arp trong 2 ô nhịp, trống và bass vào sau.
    intro = np.clip((t - 2 * BAR + 0.2) / 0.2, 0, 1)
    mix_l = pad + arp * 0.8 + (bass + drums) * intro
    mix_r = pad + arp * 1.2 + (bass + drums) * intro
    stereo = np.stack([mix_l, mix_r], axis=1)

    fade_in = np.clip(t / 0.6, 0, 1)
    fade_out = np.clip((seconds - t) / 2.0, 0, 1)
    stereo *= (fade_in * fade_out)[:, None]
    stereo = np.tanh(stereo * 1.2)  # bo mềm đỉnh
    return stereo / np.max(np.abs(stereo)) * 10 ** (-1 / 20)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--seconds", type=float, required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    sf.write(args.out, render(args.seconds), SR)
    print(f"Saved {args.out} ({args.seconds:.1f}s)")


if __name__ == "__main__":
    main()
