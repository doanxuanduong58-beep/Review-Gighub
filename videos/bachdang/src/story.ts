// "Cái bẫy dưới sông Bạch Đằng": timeline of the short, timed to the Vietnamese voice (voice/words.json, VieNeu
// "Hải Đăng"). Story physics (tide, fleets, the stuck flagship, stakes being driven, the sand table, the carpet, the
// farmer's hoe) and the camera grammar from the bridge short: slow push-ins on every hold, smootherstep glides of
// 18-40 f, cuts on big reframes, 7-frame flip kicks on impacts, lens blur on close shots only.
export const FPS = 30;
export const TOTAL = 2055; // 68.5 s: voice ends 67.07 s
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;
export const lin = (pts: [number, number][], x: number) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return pts[pts.length - 1][1];
};
const T = (f: number) => f / FPS;

// ---------------- the land ----------------
/** bank height (m) above the high-tide water line; build.ts reads D0 as its default ground height */
export const D0 = 1.2;
export const BANK = D0;
/** river: water and mud bed for |z| < RIVER_W, mud slope up to the bank between RIVER_W and BANK_Z */
export const RIVER_W = 52, BANK_Z = 62;
export const HIGH = 0.0, LOW = -2.3, BED = -2.9;
const HILLS: [number, number, number, number][] = [
  // x, z, height, radius
  [34, -116, 15, 22], [-30, -150, 11, 30], [95, -140, 9, 26], [-120, 130, 14, 34], [10, 150, 10, 30], [160, 120, 12, 32],
  [-380, 150, 8, 30], [-460, 120, 6, 26],
];
export const groundY = (x: number, z: number) => {
  const a = Math.abs(z);
  if (a < RIVER_W) return BED;
  if (a < BANK_Z) { const u = (a - RIVER_W) / (BANK_Z - RIVER_W); return BED + (BANK - BED) * u * u * (3 - 2 * u); }
  let y = BANK;
  for (const [hx, hz, h, r] of HILLS) y += h * Math.exp(-(((x - hx) ** 2 + (z - hz) ** 2) / (r * r)));
  return y;
};

// sets (each far enough from the others that fog and framing keep them apart)
export const THD: V3 = [33, 0, -101];            // Trần Hưng Đạo on the hill above the estuary
THD[1] = groundY(THD[0], THD[2]);
export const SB: V3 = [250, BANK, -100];          // sand table (sa bàn)
export const CT: V3 = [268, BANK, -100];          // carpet over a bed of spikes
export const CAMP: V3 = [-420, BANK, 86];         // Yuan camp, empty pot
export const FARM: V3 = [620, BANK, -120];        // 2019: the farmer's areca plot
export const TABLE_H = 0.95;

// ---------------- stakes ----------------
/** the stake field across the channel: rows every ~2.6 m, leaning upstream (toward -x), tips below high water */
export type Stake = { x: number; z: number; top: number; lean: number; yaw: number; r: number };
const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
export const STAKES: Stake[] = (() => {
  const out: Stake[] = [];
  let i = 0;
  for (let x = -30; x <= 30; x += 2.8) for (let z = -46; z <= 46; z += 2.3) {
    i++;
    const jx = (hh(i, 1) - 0.5) * 1.6, jz = (hh(i, 2) - 0.5) * 1.2;
    out.push({ x: x + jx, z: z + jz, top: -0.55 + 0.35 * hh(i, 3), lean: 0.22 + 0.16 * hh(i, 4), yaw: (hh(i, 5) - 0.5) * 0.5, r: 0.12 + 0.04 * hh(i, 6) });
  }
  return out;
})();

// ---------------- words (s) used for timing ----------------
export const W = {
  go: 2.86, nuocRut: 3.86, flash: 4.6,
  nam: 4.83, lanThuBa: [7.89, 8.15, 8.27], doiChien: 9.37,
  tkd: 11.76, danhChim: 12.5, khongCom: 13.76, quanDong: 14.44, duongVe: 15.88,
  thd: 16.89, bachDang: 20.11,
  ngoQuyen: 22.26, truoc: 23.78,
  hang: 24.55, vot: 26.91, dong: 27.77, chit: 28.11, nuocLen: 29.55, bienMat: 30.33,
  nuocLon: 31.3, raDanh: 33.0, giaVo: 33.7, thua: 34.08, hamDoi: 34.7, duoiTheo: 35.6,
  trieuRut: 36.53, troiLen: 38.29, thuyenTo: 38.95, sau: 40.35, macKet: 41.11,
  mayMan: 42.08, songSot: 43.3, khongMay: 44.35, batSong: 45.51,
  banThay: 46.46, tamTham: 47.84, ta: 49.34, dungGio: 51.2, keoDi: 52.62,
  sauTran: 53.69, khongBaoGio: 55.13, nua: 55.83,
  conNhung: 56.68, namDuoiBun: 57.86, nam2019: 59.7, bacNongDan: 61.06, daoDat: 62.12, cuoc: 63.38, cay: 63.94,
  caiBay: 64.79, batDuoc: 66.55,
};
/** reactions land 0-3 frames before their word */
export const LEAD = 2 / FPS;

// ---------------- shots ----------------
export type Light = "day" | "golden";
export type ShotDef = { id: number; a: number; b: number; light: Light; place: string; sunAz?: number; sunEl?: number };
const fr = (s: number) => Math.round(s * FPS);
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: fr(W.go), light: "day", place: "flagship" },                       // Ô Mã Nhi at the bow, proud
  { id: 2, a: fr(W.go), b: fr(W.flash), light: "day", place: "aftermath" },           // flash-forward: impaled at low tide
  { id: 3, a: fr(W.flash), b: fr(8.5), light: "day", place: "table" },                 // sand table, three blue flags
  { id: 4, a: fr(8.5), b: fr(10.45), light: "day", place: "fleet" },                   // the fleet sails in between karsts
  { id: 5, a: fr(10.45), b: fr(13.62), light: "day", place: "vandon" },                // rice junk sunk at Vân Đồn
  { id: 6, a: fr(13.62), b: fr(16.6), light: "day", place: "camp" },                   // empty pot
  { id: 7, a: fr(16.6), b: fr(20.85), light: "golden", place: "hill" },                // Trần Hưng Đạo on the hill
  { id: 8, a: fr(20.85), b: fr(24.35), light: "golden", place: "hill" },               // Ngô Quyền's ghost
  { id: 9, a: fr(24.35), b: fr(31.05), light: "day", place: "stakes" },                // driving stakes, tide rises
  { id: 10, a: fr(31.05), b: fr(36.3), light: "day", place: "lure" },                  // feigned defeat, the chase
  { id: 11, a: fr(36.3), b: fr(41.9), light: "day", place: "ebb" },                    // ebb: stakes appear, the crash
  { id: 12, a: fr(41.9), b: fr(46.2), light: "day", place: "mast" },                   // lucky / unlucky
  { id: 13, a: fr(46.2), b: fr(53.5), light: "day", place: "carpet" },                 // the carpet over spikes
  { id: 14, a: fr(53.5), b: fr(56.4), light: "day", place: "table" },                  // flags out, red flag in
  { id: 15, a: fr(56.4), b: fr(59.5), light: "golden", place: "mud" },                 // 700 years under the mud
  { id: 16, a: fr(59.5), b: TOTAL, light: "day", place: "farm" },                      // 2019: the farmer's hoe
];
export const XFADE: Record<number, number> = { 7: 8, 15: 10, 16: 8 };
export const FLASH_AT = fr(W.flash) - 2;
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

// ---------------- tide ----------------
export const tideY = (id: number, t: number) => {
  switch (id) {
    case 2: case 12: case 15: return LOW;
    case 9: return lin([[W.nuocLen - 0.2, LOW], [W.bienMat + 0.3, HIGH + 0.05]], t);
    case 11: return lin([[W.trieuRut, HIGH], [W.troiLen + 0.35, LOW + 0.25], [W.sau, LOW]], t);
    default: return HIGH;
  }
};

// ---------------- fleets ----------------
/** Yuan junks (index 0 = Ô Mã Nhi's flagship) and Đại Việt boats. Bow along local +x. */
export type Pose = { x: number; y: number; z: number; yaw: number; roll: number; pitch: number; vis: boolean };
export const JUNKS = 9, BOATS = 5;
/** where each junk ends up in the trap (flagship impaled first, the rest jammed behind it) */
const TRAP: [number, number, number][] = [ // x, z, yaw
  [6, 2, 0.12], [-14, -9, -0.25], [-12, 13, 0.3], [-30, 0, 0.05], [-29, -22, -0.1], [-33, 22, 0.15], [-50, -8, 0.2], [-52, 15, -0.12], [-48, -30, 0.05],
];
const DRAFT = 1.1; // keel depth below the waterline
const bob = (t: number, i: number) => 0.06 * Math.sin(2 * Math.PI * (0.35 * t + hh(i, 7)));
const roll0 = (t: number, i: number) => 0.025 * Math.sin(2 * Math.PI * (0.27 * t + hh(i, 8)));
/** how far the flagship heels over after it hits the stakes */
export const heel = (t: number) => (t < W.sau ? 0 : 0.42 * easeOut((t - W.sau) / 0.55));

export const junkPose = (i: number, id: number, t: number): Pose => {
  const [tx, tz, tyaw] = TRAP[i], wy = tideY(id, t);
  const off: Pose = { x: 0, y: -50, z: 0, yaw: 0, roll: 0, pitch: 0, vis: false };
  switch (id) {
    case 1: { // sailing upriver past the hill at high tide, flagship nearest
      const x = 40 - 2.2 * t - (i ? 18 + 14 * i : 0), z = i ? (i % 2 ? -1 : 1) * (8 + 3 * i) : 4;
      return { x, y: wy - DRAFT + bob(t, i), z, yaw: Math.PI, roll: roll0(t, i), pitch: 0, vis: i < 6 };
    }
    case 2: case 15: { // flash-forward / centuries later: impaled at low tide (15: hulls gone)
      if (id === 15) return off;
      const y = LOW - 0.4 + (i === 0 ? 0.6 : 0.2);
      return { x: tx, y, z: tz, yaw: tyaw, roll: i === 0 ? 0.42 : (hh(i, 9) - 0.5) * 0.3, pitch: i === 0 ? -0.1 : (hh(i, 10) - 0.5) * 0.12, vis: true };
    }
    case 4: { // the fleet enters the estuary from the sea
      const x = 230 - 3 * (t - 8.5) + 20 * Math.floor(i / 3) + 6 * (i % 3), z = ((i % 3) - 1) * 16 + (hh(i, 11) - 0.5) * 6;
      return { x, y: wy - DRAFT + bob(t, i), z, yaw: Math.PI, roll: roll0(t, i), pitch: 0, vis: true };
    }
    case 10: { // the chase: the fleet races downstream (+x) over the hidden stakes
      const k = smooth((t - W.hamDoi + 0.6) / 1.5), sp = 1 + 5 * k;
      const x = tx - 70 + (t - 31) * sp * 0.6 + 6 * k * (t - W.hamDoi), z = tz * 0.8;
      return { x, y: wy - DRAFT + bob(t, i), z, yaw: tyaw * 0.3, roll: roll0(t, i), pitch: 0, vis: true };
    }
    case 11: { // the ebb: the fleet slides into the trap, the flagship hits first (W.sau), the rest pile in
      const arrive = i === 0 ? W.sau : W.macKet - 0.4 + 0.25 * i;
      const u = clamp01((t - (arrive - 4.5)) / 4.5), e = 1 - (1 - u) ** 2;
      const x = tx - 16 * (1 - e), y = Math.max(wy - DRAFT, (i === 0 ? LOW - 0.4 + 0.6 : LOW - 0.2)) + (t < arrive ? bob(t, i) : 0);
      const knock = t > arrive ? 0.06 * Math.exp(-(t - arrive) * 4) * Math.sin((t - arrive) * 40) : 0;
      return { x, y, z: tz, yaw: tyaw * e, roll: (i === 0 ? heel(t) : (t > arrive ? (hh(i, 9) - 0.5) * 0.3 * easeOut((t - arrive) / 0.6) : roll0(t, i))) + knock,
        pitch: i === 0 && t > W.sau ? -0.1 * easeOut((t - W.sau) / 0.5) : 0, vis: true };
    }
    case 12: { // the flagship heeled over, the rest jammed behind
      const y = LOW - 0.4 + (i === 0 ? 0.6 : 0.2);
      return { x: tx, y, z: tz, yaw: tyaw, roll: i === 0 ? 0.42 : (hh(i, 9) - 0.5) * 0.3, pitch: i === 0 ? -0.1 : 0, vis: i < 4 };
    }
    default: return off;
  }
};
/** Vân Đồn rice junk (shot 5): sinks by the stern after the boarding */
export const riceJunk = (t: number): Pose => {
  const s = clamp01((t - W.danhChim) / 1.6);
  return { x: -400, y: HIGH - DRAFT - 1.4 * s * s + bob(t, 20), z: 12, yaw: 0.35, roll: 0.25 * s, pitch: 0.18 * s, vis: true };
};
export const boatPose = (i: number, id: number, t: number): Pose => {
  const off: Pose = { x: 0, y: -50, z: 0, yaw: 0, roll: 0, pitch: 0, vis: false };
  const wy = tideY(id, t);
  switch (id) {
    case 5: { // Trần Khánh Dư's boat closes on the rice junk
      if (i > 1) return off;
      const u = smooth((t - 10.3) / 2.0);
      return { x: -404 - 3.2 * i, y: wy - 0.35 + bob(t, 30 + i), z: -12 + 17.5 * u - 4 * i, yaw: -Math.PI / 2 + 0.08 * i, roll: roll0(t, 30 + i), pitch: 0, vis: true };
    }
    case 10: { // the lure: out, a few blows, turn and run downstream
      const turn = smooth((t - W.thua + 0.2) / 1.0), z = (i - 2) * 9;
      const x = 40 - 10 * smooth((t - 31.1) / 2.2) + 14 * clamp01(t - W.thua) * turn;
      return { x, y: wy - 0.35 + bob(t, 30 + i), z, yaw: Math.PI * (1 - turn), roll: roll0(t, 30 + i), pitch: 0, vis: true };
    }
    case 12: { // a boat comes alongside the stuck flagship with a rope
      if (i > 0) return off;
      const u = smooth((t - W.khongMay) / 1.1);
      return { x: 10.5 - 1.5 * (1 - u), y: LOW - 0.35 + bob(t, 31), z: -4.6 - 3 * (1 - u), yaw: Math.PI * 0.92, roll: roll0(t, 31), pitch: 0, vis: t > W.mayMan + 0.8 };
    }
    default: return off;
  }
};

// ---------------- sand table + carpet + farm ----------------
/** map flags: blue = Yuan arrows (three, dropped in on "lần thứ ba"), red planted at the end */
export const flagDrop = (k: number, t: number) => smooth((t - (W.lanThuBa[k] - 0.2)) / 0.25);
export const flagPull = (t: number) => smooth((t - (W.khongBaoGio - 0.4)) / 0.5);
export const redFlag = (t: number) => smooth((t - (W.nua - 0.35)) / 0.3);
export const carpetPull = (t: number) => easeOut((t - (W.keoDi - 0.45)) / 0.55);
/** the hoe: swings every 0.9 s while digging; the last swing hits the stake (CỐP) */
export const HOE_HIT = W.cuoc + 0.2;
export const hoeK = (t: number) => {
  if (t >= HOE_HIT) return 1;
  const c = ((t - (HOE_HIT - 0.9 * 4)) / 0.9) % 1;
  return c < 0 ? 0 : c < 0.6 ? Math.sin((c / 0.6) * Math.PI * 0.5) ** 2 : 1 - smooth((c - 0.6) / 0.4);
};

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mixC = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mixC(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const F = (s: number) => fr(s);

/** a point on a junk in its own frame (x along the bow, y up from the keel, z to port), at shot id time t */
export const onJunk = (i: number, id: number, t: number, lp: V3): V3 => {
  const p = junkPose(i, id, t);
  const cy = Math.cos(p.yaw), sy = Math.sin(p.yaw), cr = Math.cos(p.roll), sr = Math.sin(p.roll), cp = Math.cos(p.pitch), sp = Math.sin(p.pitch);
  // pitch about local z, roll about local x, then yaw about y
  let [x, y, z] = lp;
  [x, y] = [x * cp - y * sp, x * sp + y * cp];
  [y, z] = [y * cr - z * sr, y * sr + z * cr];
  return [p.x + x * cy + z * sy, p.y + y, p.z - x * sy + z * cy];
};
/** Ô Mã Nhi's spot on the flagship: the bow (shot 1) or clinging to the foremast (shots 12) */
export const OMN_BOW: V3 = [6.3, 2.75, 0];
export const OMN_MAST: V3 = [3.4, 2.75, 0.5];

// shot 1: low 3/4 front of Ô Mã Nhi at the bow; a push-in on "lớn nhất thế giới"
const S1a = (f: number) => { const e = onJunk(0, 1, T(f), add(OMN_BOW, [0, 1.6, 0])); return dolly([e[0] + 6.2, e[1] - 0.9, e[2] + 3.4], e, pushK(f, 0, 0.0025, 0.005, 30), { fov: 38, roll: -0.03 }); };
// shot 2: flash-forward, the flagship heeled on the stakes, low over the water
const S2a = (f: number) => zoom([26, LOW + 1.2, -14], [6, LOW + 1.6, 2], 42, pushK(f, F(W.go), 0.0035), { roll: 0.04 });
// shots 3 + 14: the sand table
const S3a = (f: number) => dolly([SB[0] - 1.9, SB[1] + TABLE_H + 1.55, SB[2] + 2.6], [SB[0] + 0.15, SB[1] + TABLE_H + 0.05, SB[2] - 0.05], pushK(f, F(W.flash), 0.002), { fov: 40 });
const S3b = (f: number) => dolly([SB[0] - 0.9, SB[1] + TABLE_H + 1.0, SB[2] + 1.5], [SB[0] + 0.45, SB[1] + TABLE_H + 0.05, SB[2] - 0.15], pushK(f, F(7.7), 0.0025, 0.006, 30), { fov: 38, roll: 0.03 });
// shot 4: aerial, the fleet between karsts
const S4a = (f: number) => zoom([300, 34, -70], [205, 2, 4], 44, pushK(f, F(8.5), 0.002));
// shot 5: Vân Đồn: the boat closes in, the rice goes over the side
const S5a = (f: number) => dolly([-402, 3.4, -27], [-404.5, 1.8, 6], pushK(f, F(10.45), 0.0022), { fov: 40 });
const S5b = (f: number) => dolly([-396, 2.8, -6], [-401, 2.0, 10], pushK(f, F(12.3), 0.003), { fov: 38, roll: -0.04 });
// shot 6: the empty pot, then the pull back across the hungry camp
const S6a = (f: number) => dolly([CAMP[0] + 2.6, CAMP[1] + 1.5, CAMP[2] - 3.2], [CAMP[0], CAMP[1] + 0.75, CAMP[2]], pushK(f, F(13.62), 0.0025), { fov: 38 });
const S6b = (f: number) => dolly([CAMP[0] + 7.5, CAMP[1] + 4.2, CAMP[2] - 10.5], [CAMP[0] - 1, CAMP[1] + 0.9, CAMP[2] + 2], pushK(f, F(W.quanDong), 0.0015), { fov: 44 });
// shot 7: Trần Hưng Đạo on the hill, chin in hand; glide past him to the river mouth on "Bạch Đằng"
const S7a = (f: number) => dolly([THD[0] - 3.4, THD[1] + 1.9, THD[2] - 4.2], [THD[0] + 0.2, THD[1] + 1.55, THD[2] + 0.2], pushK(f, F(16.6), 0.002), { fov: 38 });
const S7b = (f: number) => dolly([THD[0] - 2.2, THD[1] + 2.6, THD[2] - 5.6], [THD[0] + 14, THD[1] - 6, THD[2] + 60], pushK(f, F(19.6), 0.0015), { fov: 44, roll: 0.03 });
// shot 8: the ghost beside him (two-shot), push on "ba trăm năm mươi năm trước"
const S8a = (f: number) => dolly([THD[0] + 1.0, THD[1] + 1.8, THD[2] + 5.8], [THD[0] - 0.6, THD[1] + 1.35, THD[2]], pushK(f, F(20.85), 0.002, 0.005, 30), { fov: 38 });
// shot 9: low tide, stake drivers; wide over the field; the tide comes in
const S9a = (f: number) => dolly([-5, LOW + 1.6, -36.5], [-8.6, LOW + 1.0, -30.2], pushK(f, F(24.35), 0.0025), { fov: 40, roll: -0.03 });
const S9b = (f: number) => dolly([-9.4, LOW + 1.4, -27.6], [-8.4, LOW + 0.9, -31.3], pushK(f, F(26.8), 0.003), { fov: 36 });
const S9c = (f: number) => dolly([-38, 9, -58], [2, -1.5, -4], pushK(f, F(28.5), 0.0018), { fov: 44 });
// shot 10: the lure (boats from the camera side), then the chasing fleet over the hidden field
const S10a = (f: number) => dolly([58, 1.5, -16], [36, 1.2, -2], pushK(f, F(31.05), 0.002), { fov: 42 });
const S10b = (f: number) => dolly([30, 6, -48], [-18, 1.5, 0], pushK(f, F(W.hamDoi - 0.1), 0.002, 0.005, 30), { fov: 44, roll: 0.03 });
// shot 11: the ebb (tide gauge + stakes), the flagship hits (kick), the pile-up
const S11a = (f: number) => dolly([18, 0.8, -40], [10, -0.6, -31], pushK(f, F(36.3), 0.003), { fov: 40 });
const S11b = (f: number) => dolly([24, 2.6, -24], [6, LOW + 2.4, 2], pushK(f, F(W.thuyenTo - 0.1), 0.0025, 0.006, 30), { fov: 42 });
const S11c = (f: number) => dolly([30, 14, -40], [-12, -1, 0], pushK(f, F(W.macKet - 0.1), 0.002), { fov: 44, roll: -0.03 });
// shot 12: Ô Mã Nhi on the heeled mast; the rope boat slides in for "không may"
const S12a = (f: number) => { const m = onJunk(0, 12, T(f), add(OMN_MAST, [0, 1.6, 0])); return dolly([m[0] + 2.0, m[1] - 0.7, m[2] - 5.6], m, pushK(f, F(41.9), 0.0022), { fov: 38, roll: 0.03 }); };
const S12b = (f: number) => { const m = onJunk(0, 12, T(f), add(OMN_MAST, [0, 0.4, 0])); return dolly([m[0] + 4.6, m[1] - 1.4, m[2] - 7.6], [m[0] + 0.8, m[1] - 0.6, m[2] - 1.5], pushK(f, F(44.2), 0.0025, 0.005, 30), { fov: 40, roll: -0.03 }); };
// shot 13: the carpet table, then the yank
const S13a = (f: number) => dolly([CT[0] + 1.8, CT[1] + 1.9, CT[2] + 2.6], [CT[0], CT[1] + TABLE_H + 0.1, CT[2]], pushK(f, F(46.2), 0.0022), { fov: 40 });
const S13b = (f: number) => dolly([CT[0] + 1.1, CT[1] + 1.35, CT[2] + 2.0], [CT[0] - 0.1, CT[1] + TABLE_H + 0.05, CT[2]], pushK(f, F(W.dungGio - 0.6), 0.003, 0.006, 30), { fov: 38, roll: 0.035 });
// shot 14: back to the table
const S14a = (f: number) => dolly([SB[0] + 1.6, SB[1] + TABLE_H + 1.25, SB[2] + 1.9], [SB[0] + 0.2, SB[1] + TABLE_H + 0.05, SB[2] - 0.05], pushK(f, F(53.5), 0.0022, 0.005, 30), { fov: 38 });
// shot 15: golden, low tide, stake tips in the mud: a slow skim
const S15a = (f: number) => dolly([-34, LOW + 1.1, -44], [-18, LOW + 0.7, -30], pushK(f, F(56.4), 0.0018), { fov: 40, roll: -0.02 });
// shot 16: the farmer digs; CỐP; then he looks into the lens
const S16a = (f: number) => dolly([FARM[0] + 5.5, FARM[1] + 2.0, FARM[2] + 6.5], [FARM[0], FARM[1] + 1.2, FARM[2]], pushK(f, F(59.5), 0.002), { fov: 40 });
const S16b = (f: number) => dolly([FARM[0] + 1.3, FARM[1] + 0.9, FARM[2] + 2.3], [FARM[0] + 0.55, FARM[1] + 0.25, FARM[2] + 0.3], pushK(f, F(W.cuoc - 0.15), 0.003, 0.006, 30), { fov: 36, roll: 0.035 });
const S16c = (f: number) => dolly([FARM[0] + 0.2, FARM[1] + 1.75, FARM[2] + 3.4], [FARM[0], FARM[1] + 1.7, FARM[2]], pushK(f, F(W.caiBay - 0.3), 0.0025, 0.005, 40), { fov: 38 });

export const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1a }],
  2: [{ f: F(W.go), s: S2a }],
  3: [{ f: F(W.flash), s: S3a }, { f: F(7.7), dur: 22, s: S3b }],
  4: [{ f: F(8.5), s: S4a }],
  5: [{ f: F(10.45), s: S5a }, { f: F(12.3), cut: true, s: S5b }],
  6: [{ f: F(13.62), s: S6a }, { f: F(W.quanDong), dur: 30, s: S6b }],
  7: [{ f: F(16.6), s: S7a }, { f: F(19.6), dur: 34, s: S7b }],
  8: [{ f: F(20.85), s: S8a }],
  9: [{ f: F(24.35), s: S9a }, { f: F(26.8), cut: true, s: S9b }, { f: F(28.5), cut: true, s: S9c }],
  10: [{ f: F(31.05), s: S10a }, { f: F(W.hamDoi - 0.1), cut: true, s: S10b }],
  11: [{ f: F(36.3), s: S11a }, { f: F(W.thuyenTo - 0.1), cut: true, s: S11b }, { f: F(W.macKet - 0.1), cut: true, s: S11c }],
  12: [{ f: F(41.9), s: S12a }, { f: F(44.2), cut: true, s: S12b }],
  13: [{ f: F(46.2), s: S13a }, { f: F(W.dungGio - 0.6), dur: 24, s: S13b }],
  14: [{ f: F(53.5), s: S14a }],
  15: [{ f: F(56.4), s: S15a }],
  16: [{ f: F(59.5), s: S16a }, { f: F(W.cuoc - 0.15), cut: true, s: S16b }, { f: F(W.caiBay - 0.3), cut: true, s: S16c }],
};

const KICKS: [number, number][] = [[W.lanThuBa[0], 0.4], [W.lanThuBa[1], 0.4], [W.lanThuBa[2], 0.5], [W.dong, 0.5], [W.chit, 0.5],
  [W.sau, 1.4], [W.macKet, 0.8], [W.keoDi, 0.6], [W.nua, 0.5], [HOE_HIT, 1.2]];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(T(f));
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};

// ---------------- lens ----------------
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [
  { f: 0, cInf: 14 },                 // Ô Mã Nhi CU (focus = look)
  { f: F(W.go), cInf: 0 },            // aftermath wide
  { f: F(W.flash), cInf: 12 },        // sand table (tabletop sharp, the yard soft)
  { f: F(8.5), cInf: 0 },             // aerial fleet
  { f: F(10.45), cInf: 0 },           // Vân Đồn
  { f: F(13.62), cInf: 12 },          // empty pot
  { f: F(W.quanDong), dur: 30, cInf: 6 },
  { f: F(16.6), cInf: 12 },           // Trần Hưng Đạo
  { f: F(19.6), dur: 34, cInf: 0 },
  { f: F(20.85), cInf: 10 },          // two-shot with the ghost
  { f: F(24.35), cInf: 10 },          // stake drivers MS
  { f: F(28.5), cInf: 0 },            // wide field
  { f: F(31.05), cInf: 0 },
  { f: F(41.9), cInf: 12 },           // mast CU
  { f: F(44.2), cInf: 8 },
  { f: F(46.2), cInf: 12 },           // carpet table
  { f: F(53.5), cInf: 12 },           // sand table
  { f: F(56.4), cInf: 5 },            // golden mud
  { f: F(59.5), cInf: 8 },            // farm
  { f: F(W.cuoc - 0.15), cInf: 14 },
  { f: F(W.caiBay - 0.3), cInf: 13 },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
