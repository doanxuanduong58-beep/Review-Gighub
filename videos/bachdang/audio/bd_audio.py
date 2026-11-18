# Sound for "Cái bẫy dưới sông Bạch Đằng": an original score (war drums + bamboo-flute-like fife over a pentatonic
# pad, tempo rising toward the trap, dead silence before the crack) and synthesized SFX, mixed under the Vietnamese
# voice (gain only). Music is ducked -3 dB on speech; SFX sit -6 dB; master to -15 LUFS integrated, <= -1.2 dBTP.
# Usage: .venv-tts/bin/python bd_audio.py <templates/audio dir> <voice dir> <out dir>
import sys, os, json
import numpy as np
sys.path.insert(0, sys.argv[1])
from scipy import ndimage
from dsp import SR, ns, tt, rng, lp, hp, bp, peq, pan, st, place, fades, widen, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav, phase, modal, colored, smooth_noise
import instruments as I
import sfx_gen as G

VOICE, OUT = sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)
DUR = 2055 / 30
N = ns(DUR)
W = json.load(open(os.path.join(VOICE, "words.json"), encoding="utf-8"))

# ---- word times (same as story.ts) ----
go, flash = 2.86, 4.6
lanThuBa = [7.89, 8.15, 8.27]
danhChim, khongCom, duongVe = 12.5, 13.76, 16.08
dong, chit, nuocLen, bienMat = 27.77, 28.11, 29.55, 30.33
raDanh, thua, hamDoi = 33.0, 34.08, 34.7
trieuRut, troiLen, sau, macKet = 36.53, 38.29, 40.35, 41.11
khongMay, batSong = 44.35, 45.51
keoDi, sauTran, nua = 52.62, 53.69, 55.83
cuoc = 63.38; HOE = cuoc + 0.2
caiBay = 64.79

music = np.zeros((2, N)); sfx = np.zeros((2, N))

# ======================= MUSIC =======================
# D minor pentatonic (D F G A C) - a folk flavour without quoting any tune
def m(n): return 440.0 * 2 ** ((n - 69) / 12)
SC = [62, 65, 67, 69, 72, 74, 77, 79, 81, 84]
def drum(t, vel=0.8, f=72.0, g=1.0):        # trống: deep skin + slap
    place(music, pan(I.timpani(f, vel, rng(int(t * 100)), 1.6) * 0.9, 0.0), t, g)
def rim(t, vel=0.5, g=1.0):                  # wooden rim / clapper (mõ-like)
    r = rng(int(t * 1000) + 3)
    y = modal(0.25, [(1180, 1.0, 0.03), (2650, 0.5, 0.015), (3900, 0.25, 0.008)], r) * vel
    place(music, pan(y * 0.5, 0.25), t, g)
def flute(t, d, n, vel=0.55, p=-0.2, g=1.0):
    place(music, pan(I.fife(m(n), d, vel, rng(int(t * 77) + n)), p), t, g)
def padc(t, d, notes, vel=0.35, g=1.0):
    place(music, I.pad([m(x) for x in notes], d, vel, rng(int(t)), 0.8, 1.2, 800), t, g)

def pulse(t0, t1, bpm0, bpm1, vel=0.7, rims=True):
    """drum pulse: boom on beats 1 and 3, rim on 2 and 4, tempo ramps bpm0 -> bpm1"""
    t, k = t0, 0
    while t < t1:
        u = (t - t0) / max(1e-6, t1 - t0)
        bpm = bpm0 + (bpm1 - bpm0) * u
        if k % 2 == 0: drum(t, vel * (1.0 if k % 4 == 0 else 0.8), 70 if k % 4 == 0 else 82)
        elif rims: rim(t, 0.55 * vel)
        t += 60 / bpm; k += 1

def phrase(t0, notes, beat, vel=0.55, octave=0):
    """notes = [(beats from start, length in beats, scale degree)]"""
    for b, l, dg in notes:
        flute(t0 + b * beat, l * beat * 0.95, SC[dg] + 12 * octave, vel)

MOTIF = [(0, 1, 3), (1, 0.5, 4), (1.5, 0.5, 3), (2, 1, 2), (3, 1, 0), (4, 1.5, 1), (5.5, 0.5, 2), (6, 2, 3)]
MOTIF2 = [(0, 0.5, 5), (0.5, 0.5, 4), (1, 1, 3), (2, 1, 4), (3, 1, 2), (4, 2, 3)]

# A: hook - one big "tùng" on "gỗ", a flute call, cymbal into the flash
flute(0.3, 1.6, 74, 0.45); flute(1.95, 0.8, 72, 0.4)
drum(3.16, 1.0, 62, 1.4); drum(3.86, 0.7, 70)
place(music, pan(I.cymbal(0.55, rng(9), 2.0), 0.1), flash - 0.05, 0.8)
# B: the invasion + Vân Đồn + camp: steady pulse 96 bpm, motif twice, pad
pulse(4.8, 16.5, 96, 100, 0.65)
beat = 60 / 96
phrase(5.0, MOTIF, beat); phrase(10.0, MOTIF2, beat, 0.5); phrase(13.8, [(0, 2, 2), (2, 2, 1), (4, 3, 0)], beat, 0.45)
padc(4.8, 11.6, [50, 57, 62], 0.3)
# C: golden hill - the long flute note (sáo ngân), soft drone, no drums
padc(16.6, 7.8, [50, 57, 62, 69], 0.32)
flute(17.1, 3.4, 81, 0.5); flute(20.7, 1.2, 79, 0.4); flute(22.0, 2.3, 81, 0.42)
# D: stakes -> lure -> chase: drums accelerate 100 -> 150 bpm, the motif climbs
pulse(24.35, 36.4, 100, 150, 0.75)
b2 = 60 / 112
phrase(24.6, MOTIF, b2, 0.5); phrase(31.3, MOTIF2, 60 / 132, 0.55, 0); phrase(34.6, MOTIF, 60 / 148, 0.58, 0)
padc(24.35, 12.0, [50, 57, 62], 0.28)
# E: ebb - a roll swelling into a dead stop 0.35 s before the crack
for tr, v in I.snare_roll(36.5, 40.0, 0.15, 0.95, rng(5), rate=22):
    place(music, pan(I.timpani(66, v * 0.6, rng(int(tr * 1000)), 0.5), 0.0), tr, 0.8)
flute(36.6, 1.2, 74, 0.45); flute(37.9, 1.2, 77, 0.5); flute(39.0, 1.0, 79, 0.55)
STOP = sau - 0.35
music[:, ns(STOP):ns(sau + 5.9)] *= 0.0
# G: the carpet - light plucked figure + flute, a little rim on the yank
for k in range(12):
    t = 46.6 + k * 0.55
    if t > keoDi - 0.2: break
    place(music, pan(I.pluck(m(SC[[0, 2, 3, 2, 4, 3][k % 6]] - 12), 0.45, rng(k + 50), 0.8), -0.3), t)
flute(47.0, 0.6, 74, 0.35); flute(49.4, 0.6, 77, 0.35); flute(51.0, 0.9, 79, 0.38)
rim(keoDi, 0.8); drum(keoDi + 0.05, 0.6, 90)
# H: victory - three rounds of drums (trống ba hồi) + a flute fanfare
for h in range(3):
    t0 = sauTran + 0.05 + h * 0.75
    for k in range(4): drum(t0 + k * 0.13, 0.55 + 0.1 * k, 78)
drum(nua, 1.0, 64, 1.3)
place(music, pan(I.cymbal(0.45, rng(12), 1.8), 0.1), nua, 0.6)
phrase(sauTran + 0.2, [(0, 0.5, 5), (0.5, 0.5, 7), (1, 1.5, 8), (3, 2, 7)], 0.32, 0.5)
# I: golden mud - soft flute over a pad
padc(56.4, 3.4, [50, 57, 65], 0.28)
flute(56.8, 1.8, 74, 0.35); flute(58.7, 0.9, 72, 0.32)
# J: 2019 - a light plucked loop, stops dead on the hoe
for k in range(30):
    t = 59.6 + k * 0.42
    if t > HOE - 0.05: break
    place(music, pan(I.pluck(m(SC[[0, 3, 2, 4, 3, 1][k % 6]]), 0.4, rng(k + 90), 0.7), 0.25), t)
padc(59.6, HOE - 59.6 - 0.1, [50, 57, 62], 0.22)
music[:, ns(HOE):ns(caiBay - 0.2)] *= 0.0
# K: the last flute note
flute(caiBay + 0.6, 2.6, 74, 0.45); flute(67.0, 1.4, 69, 0.38)
padc(caiBay + 0.4, DUR - caiBay - 0.4, [50, 57, 62], 0.2)
# hall
music = 0.85 * music + 0.25 * convolve_st(music, make_ir(1.6, 3))[:, :N]

# ======================= SFX =======================
def S(x, t, g=1.0, p=0.0):
    x = np.asarray(x)
    place(sfx, pan(x, p) if x.ndim == 1 else x, t, g)
def bed(t0, t1, kind="water", g=1.0):
    d = t1 - t0
    x = G.water_bed(d + 0.6, rng(int(t0)), 1.0, 0.8) if kind == "water" else G.breeze(d + 0.6, rng(int(t0)), 1.0, 0.15, 850)
    x = st(x)[:, :ns(d)]
    k = ns(0.3); env = np.ones(x.shape[1]); env[:k] = np.linspace(0, 1, k); env[-k:] = np.linspace(1, 0, k)
    place(sfx, x * env, t0, g)
def wood_knock(t, f=900, g=1.0, p=0.0):  # cộp / cốp
    r = rng(int(t * 997))
    y = modal(0.35, [(f, 1.0, 0.05), (f * 2.3, 0.6, 0.025), (f * 3.9, 0.3, 0.012)], r) + bp(r.standard_normal(ns(0.35)), 600, 6000) * np.exp(-tt(0.35) / 0.003)
    y += np.exp(-tt(0.35) / 0.05) * np.sin(phase(f * 0.18)) * 0.8
    S(y, t, g, p)
def splash_small(t, g=0.5, p=0.0):
    S(G.splash_big(rng(int(t * 31)))[: ns(1.4)] * 0.6, t, g, p)
def growl(t, d=1.4, g=0.5):
    tq = tt(d); r = rng(int(t * 10))
    f = 75 + 25 * np.sin(2 * np.pi * 1.7 * tq) + 10 * smooth_noise(len(tq), r, 6)
    y = np.sin(phase(f)) + 0.6 * np.sin(2 * phase(f)) + 0.3 * r.standard_normal(len(tq))
    y = bp(y, 60, 700) * np.sin(np.pi * tq / d) ** 0.7 * (0.7 + 0.3 * np.sin(2 * np.pi * 9 * tq))
    S(y, t, g, 0.2)

bed(0, flash, "water", 0.8); bed(9.0, 13.62, "water", 0.8); bed(13.62, 16.6, "wind", 0.6); bed(16.6, 24.35, "wind", 0.8)
bed(24.35, 46.2, "water", 0.85); bed(46.2, 56.4, "wind", 0.45); bed(56.4, 59.5, "water", 0.6); bed(59.5, DUR, "wind", 0.6)
S(G.whoosh(0.7, rng(2), 0.45), flash - 0.45, 0.5)
for t in lanThuBa: wood_knock(t, 640, 0.9)                         # flags stamped onto the map
for k in range(5): splash_small(danhChim + 0.15 * k + 0.75, 0.45, -0.3 + 0.15 * k)  # rice sacks
growl(14.0, 1.5, 0.6); growl(15.2, 1.1, 0.45)
for t in [dong - 2.7, dong - 1.8, dong - 0.9, dong, chit, chit + 0.6]: wood_knock(t, 420, 0.9, -0.2)  # driving stakes
x = G.whoosh(1.4, rng(4), 0.6, 200, 1400, 1.0, 0.4, 0.4); S(x, nuocLen - 0.1, 0.9)  # the water rushes in
S(st(G.water_bed(1.6, rng(44), 1.4, 1.6)), nuocLen, 0.9)
for k in range(6): S(G.hurrah(rng(60 + k), 140 + 30 * k, 1.0 + 0.03 * k), raDanh + 0.12 * k, 0.25, -0.5 + 0.2 * k)  # Đại Việt shout
for k in range(8): S(G.hurrah(rng(80 + k), 110 + 20 * k, 1.05), hamDoi + 0.1 * k, 0.3, 0.4 - 0.1 * k)              # the chase
S(G.creak(1.6, rng(7), 90, 140), troiLen + 0.4, 0.45, 0.2)                                                          # hulls settle
S(G.wood_crack(rng(8)), sau, 1.25); S(G.timber_tear(rng(9), 0.9), sau + 0.08, 0.9)                                # RẮC
for k in range(5): S(G.whoa(rng(100 + k)), sau + 0.25 + 0.15 * k, 0.35, -0.6 + 0.3 * k)
S(G.wood_crack(rng(10)) * 0.6, macKet, 0.8, -0.3); S(G.wood_crack(rng(11)) * 0.5, macKet + 0.35, 0.6, 0.3)
splash_small(sau + 0.5, 0.5); splash_small(macKet + 0.3, 0.4, -0.4)
S(G.bird_chirps(1.2, rng(13), 2.5, "sparrow")[: ns(1.0)] * 0.5, khongMay - 0.6, 0.6, 0.4)                          # the lone bird
S(G.whoosh(0.6, rng(14), 0.35, 500, 3500), keoDi - 0.25, 0.9)                                                         # xoẹt
for k in range(4):                                                                                                    # digging thuds
    t = HOE - 0.9 * (4 - k) + 0.54
    if t > 59.6: S(lp(rng(k).standard_normal(ns(0.2)), 400) * np.exp(-tt(0.2) / 0.03) * 1.2, t, 0.6)
wood_knock(HOE, 760, 1.6)                                                                                             # CỐP
S(G.bird_chirps(3.0, rng(15), 0.6, "sparrow") * 0.07, 59.8, 1.0, 0.5)
sfx = 0.9 * sfx + 0.15 * convolve_st(sfx, make_ir(1.2, 21))[:, :N]

# ======================= MIX =======================
v, sr = read_wav(os.path.join(VOICE, "voice.wav"))
v = st(v)[:, :N]; v = np.pad(v, ((0, 0), (0, N - v.shape[1])))
vI = integrated(v)
speak = np.zeros(N, bool)
for w in W: speak[ns(w["s"] - 0.08):ns(w["e"] + 0.12)] = True
speak = ndimage.binary_closing(speak, iterations=ns(0.3))
duck = np.where(speak, 10 ** (-3 / 20), 1.0)
duck = ndimage.uniform_filter1d(duck, ns(0.12))
mI, sI = integrated(music), integrated(sfx)
gm = 10 ** ((vI - 10.0 - mI) / 20)   # music bed ~10 LU under the voice ("+3 dB" standard over the old -13)
gs = 10 ** ((vI - 12.0 - sI) / 20)   # effects ~12 LU under on average, peaks (crack, cốp) well above
mix = v + music * gm * duck + sfx * gs
G0 = 10 ** ((-15.0 - integrated(mix)) / 20)
mix *= G0
pk = np.max(np.abs(mix))
ceil = 10 ** (-2.4 / 20)
if pk > ceil:  # soft-knee peak control
    env = ndimage.maximum_filter1d(np.max(np.abs(mix), 0), ns(0.004))
    env = ndimage.uniform_filter1d(np.maximum(env, ceil), ns(0.006))
    mix *= np.minimum(1.0, ceil / env)
write_wav(os.path.join(OUT, "mix.wav"), mix)
write_wav(os.path.join(OUT, "stem_music.wav"), music * gm * duck * G0)
write_wav(os.path.join(OUT, "stem_sfx.wav"), sfx * gs * G0)
print(f"mix {integrated(mix):.2f} LUFS, TP {true_peak(mix):.2f} dBTP, voice {integrated(v * G0):.1f}, len {mix.shape[1] / SR:.3f}s")
