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


# ---------- Kiểu "energetic": nhạc mạnh, nhịp nhanh ----------
# 140 BPM, La thứ. Kick mọi phách (four-on-the-floor), bass saw nảy ở nửa phách và nén theo kick (sidechain),
# hợp âm supersaw đánh nhát, hi-hat móc kép, clap + snare phách 2/4. Cứ 8 ô nhịp: ô cuối dồn trống + tiếng
# "vút" lên, ô đầu đoạn mới có cú nện (impact). Vào trống gần như ngay (sau nửa ô) để video ngắn không bị chậm.
E_BPM = 140
E_BEAT = 60 / E_BPM
E_BAR = 4 * E_BEAT


def _kick(rng: np.random.Generator) -> np.ndarray:
    ln = int(0.32 * SR)
    t = np.arange(ln) / SR
    f = 48 + 160 * np.exp(-t * 40)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)
    click = rng.standard_normal(ln) * np.exp(-t * 400) * 0.4
    return np.tanh((body + click) * 2.2) * 0.75


def _snare(rng: np.random.Generator, gain: float = 1.0) -> np.ndarray:
    ln = int(0.22 * SR)
    t = np.arange(ln) / SR
    noise = sosfilt(butter(2, [1200, 8000], btype="band", fs=SR, output="sos"), rng.standard_normal(ln)) * np.exp(-t * 18)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.5
    return (noise * 0.5 + tone) * 0.45 * gain


def _hat(rng: np.random.Generator, open_: bool = False) -> np.ndarray:
    ln = int((0.16 if open_ else 0.04) * SR)
    t = np.arange(ln) / SR
    return sosfilt(butter(2, 8000, btype="high", fs=SR, output="sos"), rng.standard_normal(ln)) * np.exp(-t * (25 if open_ else 110)) * (0.14 if open_ else 0.09)


def render_energetic(seconds: float) -> np.ndarray:
    n = int(seconds * SR)
    rng = np.random.default_rng(11)
    drums, bass, chords, lead, fx = (np.zeros(n) for _ in range(5))
    side = np.ones(n)  # đường nén theo kick
    kick = _kick(rng)
    bars = int(np.ceil(seconds / E_BAR))
    lead_pattern = [0, None, 2, None, 1, None, 2, 0, None, 2, None, 1, 2, None, 1, None]

    for b in range(bars):
        t0 = b * E_BAR
        chord_set, roots = PROGRESSIONS[(b // 8) % 2]
        chord, root = chord_set[b % 4], roots[b % 4]
        fill = b % 8 == 7 and (b + 1) * E_BAR < seconds - E_BAR
        drop = b % 8 == 0 and b > 0

        # Kick mọi phách (ô dồn trống: bỏ 2 phách cuối để snare roll chiếm chỗ).
        for k in range(4):
            if fill and k >= 2:
                continue
            tb = t0 + k * E_BEAT
            add(drums, tb, kick)
            i = int(tb * SR)
            ln = int(E_BEAT * 0.9 * SR)
            j = min(n, i + ln)
            if i < n:
                env = 1 - 0.85 * np.exp(-np.arange(j - i) / SR * 9)
                side[i:j] = np.minimum(side[i:j], env)

        # Clap/snare phách 2 và 4.
        for k in (1, 3):
            if not (fill and k == 3):
                add(drums, t0 + k * E_BEAT, _snare(rng))

        # Hi-hat móc kép, hat mở ở nửa phách.
        for k in range(16):
            add(drums, t0 + k * E_BEAT / 4, _hat(rng, open_=(k % 4 == 2)))

        # Dồn trống nửa ô cuối: snare móc kép to dần + tiếng vút lên.
        if fill:
            for k in range(8):
                add(drums, t0 + 2 * E_BEAT + k * E_BEAT / 4, _snare(rng, 0.4 + 0.12 * k))
            ln = int(E_BAR * SR)
            t = np.arange(ln) / SR
            sweep = sosfilt(butter(2, 3000, btype="high", fs=SR, output="sos"), rng.standard_normal(ln))
            add(fx, t0, sweep * (t / t[-1]) ** 2 * 0.22)

        # Cú nện đầu đoạn mới: sub trầm rơi + crash.
        if drop:
            ln = int(1.2 * SR)
            t = np.arange(ln) / SR
            boom = np.sin(2 * np.pi * np.cumsum(30 + 60 * np.exp(-t * 6)) / SR) * np.exp(-t * 2.5) * 0.6
            crash = sosfilt(butter(2, 5000, btype="high", fs=SR, output="sos"), rng.standard_normal(ln)) * np.exp(-t * 3) * 0.18
            add(fx, t0, boom + crash)

        # Bass saw nảy ở móc kép (trừ nhát trùng kick), lọc thấp cho chắc.
        for k in range(16):
            if k % 4 == 0:
                continue
            ln = int(E_BEAT / 4 * 0.9 * SR)
            m = root - 12 + (12 if k % 4 == 2 else 0)
            sig = (saw(hz(m), ln, -0.003) + saw(hz(m), ln, 0.003)) * 0.5
            add(bass, t0 + k * E_BEAT / 4, lowpass(sig, 900) * env_adsr(ln, 0.003, 0.08, 0.6, 0.02) * 0.32)

        # Hợp âm supersaw đánh nhát ở nửa phách.
        for k in range(4):
            ln = int(E_BEAT * 0.45 * SR)
            sig = sum(saw(hz(m + 12), ln, d, rng.random()) for m in chord for d in (-0.008, 0.0, 0.008))
            add(chords, t0 + k * E_BEAT + E_BEAT / 2, lowpass(sig, 4200) * env_adsr(ln, 0.004, 0.15, 0.3, 0.05) * 0.07)

        # Giai điệu pluck móc kép (nghỉ ở ô dồn trống).
        if not fill:
            for k, idx in enumerate(lead_pattern):
                if idx is None:
                    continue
                ln = int(E_BEAT / 4 * 0.95 * SR)
                m = chord[idx] + 24 - (12 if b % 2 and k > 8 else 0)
                sq = np.sign(np.sin(2 * np.pi * hz(m) * np.arange(ln) / SR))
                add(lead, t0 + k * E_BEAT / 4, lowpass(sq, 5000) * env_adsr(ln, 0.002, 0.07, 0.15, 0.02) * 0.05)

    t = np.arange(n) / SR
    intro = np.clip((t - E_BAR / 2 + 0.05) / 0.05, 0, 1)  # nửa ô đầu chỉ hợp âm + giai điệu
    music = (bass + chords) * side
    mix_l = drums * intro + music * intro + chords * 0.3 * (1 - intro) + lead * 0.8 + fx
    mix_r = drums * intro + music * intro + chords * 0.3 * (1 - intro) + lead * 1.2 + fx
    stereo = np.stack([mix_l, mix_r], axis=1)
    fade_out = np.clip((seconds - t) / 1.2, 0, 1)
    stereo *= (np.clip(t / 0.05, 0, 1) * fade_out)[:, None]
    stereo = np.tanh(stereo * 1.8)  # bão hoà cho dày, to
    return stereo / np.max(np.abs(stereo)) * 10 ** (-1 / 20)


# ---------- Kiểu "cute": dễ thương, tươi vui ----------
# 124 BPM, Đô trưởng (C–G–Am–F). Xylophone/glockenspiel chơi giai điệu nảy, marimba đánh hợp âm nửa phách,
# bass pluck nảy, kick mềm phách 1-3, vỗ tay + búng tay phách 2-4, shaker móc kép nhẹ, cứ 4 ô có tiếng "boing".
C_BPM = 124
C_BEAT = 60 / C_BPM
C_BAR = 4 * C_BEAT
CUTE_PROG = [([60, 64, 67], 48), ([55, 59, 62], 43), ([57, 60, 64], 45), ([53, 57, 60], 41)]  # C G Am F
# Giai điệu 2 ô (bậc trong hợp âm + nốt thêm), None = nghỉ; lặp với biến thể.
CUTE_MELODY = [0, None, 2, 1, None, 2, 4, None, 2, None, 1, 0, None, 1, 2, None]


def _bell(freq: float, dur: float, gain: float) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    # Thanh kim loại: các bội không điều hoà, tắt nhanh -> tiếng xylophone/glockenspiel.
    sig = np.sin(2 * np.pi * freq * t) * np.exp(-t * 7) + 0.35 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t * 14) + 0.12 * np.sin(2 * np.pi * freq * 5.4 * t) * np.exp(-t * 25)
    return sig * np.clip(t / 0.002, 0, 1) * gain


def _marimba(freq: float, dur: float, gain: float) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    mod = np.sin(2 * np.pi * freq * 4 * t) * 1.2 * np.exp(-t * 30)
    return np.sin(2 * np.pi * freq * t + mod) * np.exp(-t * 10) * gain


def render_cute(seconds: float) -> np.ndarray:
    n = int(seconds * SR)
    rng = np.random.default_rng(5)
    drums, bass, keys, bells, fx = (np.zeros(n) for _ in range(5))
    bars = int(np.ceil(seconds / C_BAR))

    for b in range(bars):
        t0 = b * C_BAR
        chord, root = CUTE_PROG[b % 4]

        # Kick mềm phách 1, 3 (+ nảy thêm ở "và" của phách 2 cho vui tai).
        for tb in (0, 2 * C_BEAT, 1.5 * C_BEAT):
            ln = int(0.25 * SR)
            t = np.arange(ln) / SR
            f = 55 + 110 * np.exp(-t * 45)
            add(drums, t0 + tb, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 12) * (0.55 if tb != 1.5 * C_BEAT else 0.3))
        # Vỗ tay + búng tay phách 2, 4.
        for k in (1, 3):
            ln = int(0.15 * SR)
            t = np.arange(ln) / SR
            clap = sosfilt(butter(2, [1000, 4000], btype="band", fs=SR, output="sos"), rng.standard_normal(ln)) * np.exp(-t * 28) * 0.18
            snap = np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90) * 0.15
            add(drums, t0 + k * C_BEAT, clap + snap)
        # Shaker móc kép.
        for k in range(16):
            ln = int(0.06 * SR)
            t = np.arange(ln) / SR
            sh = sosfilt(butter(2, 6000, btype="high", fs=SR, output="sos"), rng.standard_normal(ln)) * np.sin(np.pi * t / t[-1]) * (0.03 if k % 2 else 0.015)
            add(drums, t0 + k * C_BEAT / 4, sh)

        # Bass pluck nảy: gốc ở phách 1, quãng 8 ở "và" của 2, quãng 5 ở phách 4.
        for tb, m in ((0, root), (1.5 * C_BEAT, root + 12), (2 * C_BEAT, root), (3 * C_BEAT, root + 7), (3.5 * C_BEAT, root + 12)):
            ln = int(C_BEAT * 0.45 * SR)
            t = np.arange(ln) / SR
            sig = (np.sin(2 * np.pi * hz(m) * t) + 0.3 * np.sin(2 * np.pi * hz(m) * 2 * t)) * np.exp(-t * 9)
            add(bass, t0 + tb, sig * 0.32)

        # Marimba hợp âm ở nửa phách.
        for k in range(4):
            for m in chord:
                add(keys, t0 + k * C_BEAT + C_BEAT / 2, _marimba(hz(m), 0.35, 0.06))

        # Giai điệu xylophone theo hợp âm (ô chẵn đi lên, ô lẻ đi xuống) — vào ngay từ đầu cho bắt tai.
        for k, idx in enumerate(CUTE_MELODY):
            if idx is None:
                continue
            base = chord[0] + 12
            m = base + [0, 4, 7, 12, 9][idx] if b % 2 == 0 else base + [12, 7, 4, 9, 7][idx]
            add(bells, t0 + k * C_BEAT / 4, _bell(hz(m), 0.5, 0.17))

        # "Boing" lò xo mỗi 4 ô.
        if b % 4 == 3:
            ln = int(0.35 * SR)
            t = np.arange(ln) / SR
            f = 300 + 500 * t / t[-1] + 40 * np.sin(2 * np.pi * 18 * t)
            add(fx, t0 + 3.5 * C_BEAT, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) * 0.12)

    t = np.arange(n) / SR
    intro = np.clip((t - C_BAR / 2 + 0.05) / 0.05, 0, 1)
    mix_l = (drums + bass + keys * 1.1) * intro + bells * 0.8 + fx
    mix_r = (drums + bass + keys * 0.9) * intro + bells * 1.2 + fx
    stereo = np.stack([mix_l, mix_r], axis=1)
    fade_out = np.clip((seconds - t) / 1.2, 0, 1)
    stereo *= (np.clip(t / 0.05, 0, 1) * fade_out)[:, None]
    stereo = np.tanh(stereo * 1.4)
    return stereo / np.max(np.abs(stereo)) * 10 ** (-1 / 20)


STYLES = {"chill": render, "energetic": render_energetic, "cute": render_cute}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--seconds", type=float, required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--style", choices=sorted(STYLES), default="chill")
    args = parser.parse_args()
    sf.write(args.out, STYLES[args.style](args.seconds), SR)
    print(f"Saved {args.out} ({args.seconds:.1f}s, {args.style})")


if __name__ == "__main__":
    main()
