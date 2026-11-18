// Our cast as lit flat sprites in the 3D world. Each frame every character asks for a drawing (a key + a draw call);
// the pool keeps one canvas per distinct drawing, so soldiers marching in step share canvases (7 head shapes x 4
// outfits). Characters are yaw-only billboards shaded by cardShade() (scene tint, bright floor, side gradient toward
// the sun, painted crescent in the drawing); standing ones get a soft multiply contact blob. Effects are unlit cards.
// Cards, effects and blobs live on the NOINK layer so the world ink pass never outlines their quads.
import * as THREE from "three";
import {
  Pen, bodyFront, bodySide, fxBurst, fxSplash, fxStars, fxShadow, fxContact, fxRing, fxPuff,
  Outfit, Expr, FrontOpts, SideOpts, VIET, THD_O, NGO_O, OMN_O, YUAN, FARMER_O, INK,
} from "./toon";
import {
  FPS, SHOTS, V3, smooth, clamp01, W, CAMP, THD, FARM, SB, CT, TABLE_H, LOW, HIGH, groundY, tideY, junkPose, boatPose, riceJunk, onJunk,
  OMN_BOW, OMN_MAST, heel, HOE_HIT, hoeK, carpetPull, STAKES,
} from "./story";
import { LIGHTS } from "./lights";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";

// ---------------- canvas pool ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- sprite meshes ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216; // metres per design unit: 1000 units = 2.16 m
export const SU_SWING = 2.3 / 1830; // swing canvas: rope of 1830 units = 2.3 m
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);
/** world roots that hold actors (to find the scene's sun when world.ts does not pass it) */
const ROOTS = new Set<THREE.Object3D>();

/** lit flat character: cardShade() material, receives shadows (dims to the bright floor only), casts its silhouette
 *  when world.ts says so (golden). Drawn after the contact blobs (renderOrder 1). */
export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    // rim width is in output pixels: tell the card shader the render height (1920 = 1080 x 1920 frame)
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
    ROOTS.add(parent);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
/** unlit effect card: hard cut-out (ink drawings), soft see-through (dust, mist) or a multiply ground blob */
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      // no mipmaps: at grazing views the mip chain averages the blob with its white surround and it fades out
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    }
    else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; geo?: "body" | "swing"; roll?: number; size?: [number, number, number];
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean };
/** sun = world direction TOWARD the sun (optional: when absent the scene's shadow-casting light is used) */
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun?: THREE.Vector3 };

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
const vOf = (i: number) => (i * 7 + (i >> 2)) % 4;
/** head-shape seed: 7 shapes, so marching soldiers in step still share canvases */
const seedOf = (i: number) => ((i * 5 + 3) % 7) + 1;
/** drawing resolution by distance: [canvas w, h, scale from the 600 x 1000 design]; sized for the 1440 x 2560 final */
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];

// ---------------- light ----------------
const SUN = new THREE.Vector3(0.5, 0.75, -0.4).normalize();
const tmp = new THREE.Vector3();
let LNAME: "day" | "golden" = "day";
const sunOf = (root: THREE.Object3D) => {
  let s: THREE.DirectionalLight | null = null;
  root.traverse((o) => { if (!s && o instanceof THREE.DirectionalLight && o.castShadow) s = o; });
  return s as THREE.DirectionalLight | null;
};
/** the sun of the world that is calling: the attached root whose sun target sits on this camera's view axis */
const findSun = (cam: CamInfo, out: THREE.Vector3) => {
  if (cam.sun) return out.copy(cam.sun).normalize();
  let best: THREE.DirectionalLight | null = null, err = Infinity;
  for (const r of ROOTS) {
    if (!r.parent) continue;
    const s = sunOf(r);
    if (!s) continue;
    const d = tmp.copy(s.target.position).sub(cam.pos), e = Math.abs(d.dot(cam.right)) / (d.length() || 1);
    if (e < err) { err = e; best = s; }
  }
  return best ? out.copy(best.position).sub(best.target.position).normalize() : out;
};
/** canvas angle the sun comes FROM on an upright card facing the camera, in 45-degree steps (small texture cache) */
const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = SUN.dot(cam.right) * (mirror ? -1 : 1), sy = -SUN.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};

/** front / side view and mirroring for someone at (x, z) walking along (dx, dz); fs = foreshortening of the walk */
const viewOf = (cam: CamInfo, x: number, z: number, dx: number, dz: number) => {
  const tx = cam.pos.x - x, tz = cam.pos.z - z, tl = Math.hypot(tx, tz) || 1;
  const c = (tx * dx + tz * dz) / tl;
  return { side: c < 0.57, mirror: dx * cam.right.x + dz * cam.right.z < 0, fs: Math.round(Math.sqrt(Math.max(0, 1 - c * c)) * 20) / 20 };
};

// ---------------- life: blinks and reaction timing ----------------
/** reference expression and action changes land 0-3 f before the word onset */
const LEAD = 2 / FPS;
/** eyelid 0 open .. 1 shut. Reference: gaps 0.5-2.3 s, 4-frame blink half / shut / shut / half, plus a blink across
 *  every expression swap (the shut frames hide the swap) */
const LID = [0.5, 1, 1, 0.5];
const SWAPS: Record<number, number[]> = {};
const lidAt = (t: number, i: number, swaps: number[] = []) => {
  const f = Math.round(t * FPS);
  for (const ts of swaps) { const k = f - Math.round((ts - LEAD) * FPS) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13)); // next blink 0.5-2.3 s later
  }
  return 0;
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

type Who = { i: number; o: Outfit; okey: string };
/** one character drawing in the 600 x 1000 design space, sized by distance, lit from the scene's sun */
const person = (cam: CamInfo, who: Who, x: number, y: number, z: number, view: { side: boolean; mirror: boolean }, fo: FrontOpts, so: SideOpts, scale = 1): Place & { tierKey: string } => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale;
  const [w, h, k] = tier(d);
  const mirror = view.side && view.mirror, light = light2D(cam, mirror), seed = seedOf(who.i);
  const f2: FrontOpts = { ...fo, light, seed }, s2: SideOpts = { ...so, light, seed };
  const key = view.side ? `S|${who.okey}|${fkey(s2)}` : `F|${who.okey}|${fkey(f2)}`;
  return {
    key, x, y, z, scale, mirror, tierKey: `${w}`,
    draw: (p) => (view.side ? bodySide(p, who.o, s2) : bodyFront(p, who.o, f2)),
    size: [w, h, k],
  };
};

/** ground shadow under a standing / sitting card (review rounds 2-4), multiply, blue-violet: a TIGHT contact pool right under
 *  the feet (~.5 on screen at the core) so nobody floats, plus by day (cards cast no real shadow) a lighter soft tail
 *  stretched AWAY from the sun, length ~1.6 m / tan(sun elevation), capped. Golden: world.ts casts real card shadows. */
const CONTACT: Record<"day" | "golden", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if (LNAME === "day") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, SUN.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h; // feet at v = .2 of the card
    const tc = hexOf(TAIL, k);
    out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c,
      w: 0.72 * sc, h, flat: true, rot });
  }
  const cc = hexOf(CONTACT[LNAME], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc,
    w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};


// ---------------- Bạch Đằng staging ----------------
export type Stage = { places: Place[]; fx: FxPlace[] };
const F0: { side: boolean; mirror: boolean } = { side: false, mirror: false };
const VIETS = [0, 1, 2, 3].map((v) => VIET(v)), YUANS = [0, 1, 2, 3].map((v) => YUAN(v));
const who = (i: number, o: Outfit, okey: string): Who => ({ i, o, okey });
const viet = (i: number) => who(i, VIETS[i % 4], `v${i % 4}`);
const yuan = (i: number) => who(i, YUANS[i % 4], `y${i % 4}`);
const THDW = who(1, THD_O, "thd"), OMNW = who(2, OMN_O, "omn"), FARMW = who(4, FARMER_O, "farm");
const at = (t: number, w: number) => t >= w - LEAD;
const ease = (t: number, a: number, d: number) => smooth((t - a) / d);

/** sepia ghost (Ngô Quyền, 938): a see-through unlit card, alpha quantised so the pool can share canvases */
const ghost = (out: Stage, x: number, y: number, z: number, alpha: number, fo: FrontOpts) => {
  const a = q(alpha, 10);
  if (a <= 0) return;
  out.fx.push({
    key: `ghost|${a}|${fkey(fo)}`, cw: 540, ch: 900, soft: true, x, y: y + 1.026, z, w: 600 * SU, h: 1000 * SU,
    draw: (p) => { p.g.globalAlpha = a; p.g.scale(0.9, 0.9); bodyFront(p, NGO_O, { ...fo, seed: 6 }); },
  });
};
const sack = (p: Pen) => {
  p.poly([[60, 40], [140, 30], [175, 120], [150, 185], [50, 185], [25, 120]], "#c9a46a", 9);
  p.stroke([[70, 52], [130, 46]], 6, "#8a6a3a");
};
const growl = (p: Pen, t: number) => {
  for (let k = 0; k < 3; k++) {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 20; i++) pts.push([30 + i * 12, 60 + k * 45 + 10 * Math.sin(i * 1.4 + t * 9 + k)]);
    p.stroke(pts, 7, INK);
  }
};
const splashAt = (out: Stage, x: number, y: number, z: number, u: number, s = 1) => {
  if (u < 0 || u >= 1) return;
  out.fx.push({ key: `splash${q(u, 30)}`, cw: 800, ch: 800, draw: (p) => fxSplash(p, q(u, 30)), x, y: y + 2.6 * s * 0.45, z, w: 3.2 * s, h: 3.2 * s });
};
const burstAt = (out: Stage, x: number, y: number, z: number, u: number, s = 1) => {
  if (u < 0 || u >= 1) return;
  out.fx.push({ key: `burst${q(u, 30)}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, q(u, 30)), x, y, z, w: 1.5 * s, h: 1.5 * s });
};
const ringAt = (out: Stage, x: number, y: number, z: number, t: number, i: number, w = 1.6) => {
  const u = ((t + hh(i, 7) * 2) % 2.2) / 2.2;
  out.fx.push({ key: `ring${q(u, 30)}`, cw: 600, ch: 600, draw: (p) => fxRing(p, q(u, 30)), x, y: y + 0.03, z, w, h: w, flat: true });
};
/** a person standing on a deck point of a junk (front view, rolled with the hull) */
const onDeck = (out: Stage, cam: CamInfo, w: Who, j: number, id: number, t: number, lp: V3, fo: FrontOpts, sc = 1) => {
  const p = onJunk(j, id, t, lp), r = junkPose(j, id, t).roll;
  const pl = person(cam, w, p[0], p[1], p[2], F0, { mode: "stand", blink: lidAt(t, w.i), ...fo }, {}, sc);
  pl.roll = -r * Math.cos(Math.atan2(cam.pos.x - p[0], cam.pos.z - p[2]));
  out.places.push(pl);
};
const inBoat = (out: Stage, cam: CamInfo, w: Who, b: number, id: number, t: number, dx: number, fo: FrontOpts, sit = false) => {
  const p = boatPose(b, id, t);
  if (!p.vis) return;
  const c = Math.cos(p.yaw), s = Math.sin(p.yaw);
  out.places.push(person(cam, w, p.x + dx * c, p.y + 0.42, p.z - dx * s, F0, { mode: sit ? "sit" : "stand", blink: lidAt(t, w.i), ...fo }, {}));
};
const SAILOR_SPOTS: V3[] = [[-2.5, 2.75, 1.1], [-5.6, 2.75, -1.0], [1.4, 2.75, -1.2], [-0.4, 2.75, 1.4]];

export const stage = (id: number, t: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1];
  LNAME = s.light;
  findSun(cam, SUN);
  switch (id) {
    case 1: { // Ô Mã Nhi, chest out at the bow; two sailors behind
      onDeck(out, cam, OMNW, 0, 1, t, OMN_BOW, { expr: at(t, 1.0) ? "grin" : "smile", tilt: -4, headTilt: -5 });
      SAILOR_SPOTS.slice(0, 2).forEach((lp, k) => onDeck(out, cam, yuan(k + 3), 0, 1, t, lp, { expr: "smile" }));
      break;
    }
    case 2: { // impaled: Ô Mã Nhi hugging the mast, small and far
      onDeck(out, cam, OMNW, 0, 2, t, OMN_MAST, { expr: "shock", wave: 0.6 });
      break;
    }
    case 5: { // Vân Đồn: Trần Khánh Dư with an oar, rowers, the rice going over the side
      inBoat(out, cam, who(8, VIET(1, { hat: "khan", cap: "#c3302c" }), "tkd"), 0, 5, t, 1.2, { prop: "oar", expr: "stern" });
      inBoat(out, cam, viet(9), 0, 5, t, -1.0, { expr: "grin" }, true);
      inBoat(out, cam, viet(10), 1, 5, t, 0.5, { prop: "oar", expr: "stern" });
      const rp = riceJunk(t);
      [0, 1].forEach((k) => {
        const lp: V3 = [-1.5 + 3 * k, 2.75, 0.5 - k];
        const p = onJunk(0, 1, 0, lp); void p;
        const c = Math.cos(rp.yaw), sn = Math.sin(rp.yaw), wx = rp.x + lp[0] * c + lp[2] * sn, wz = rp.z - lp[0] * sn + lp[2] * c;
        out.places.push(person(cam, yuan(20 + k), wx, rp.y + lp[1], wz, F0, { mode: "stand", expr: at(t, W.tkd) ? "shock" : "neutral", blink: lidAt(t, 20 + k), wave: at(t, W.danhChim) ? Math.sin(t * 9 + k) : undefined }, {}));
      });
      for (let k = 0; k < 5; k++) { // sacks tumble from the gunwale into the sea
        const t0 = W.danhChim + 0.15 * k, u = (t - t0) / 0.8;
        if (u < 0) continue;
        const c = Math.cos(rp.yaw), sn = Math.sin(rp.yaw), lx = -3 + 1.6 * k, x0 = rp.x + lx * c - 2.3 * sn, z0 = rp.z - lx * sn - 2.3 * c;
        if (u < 1) out.fx.push({ key: "sack", cw: 200, ch: 200, draw: sack, x: x0 - 1.2 * u * sn, y: HIGH + 2.4 - 3 * u * u, z: z0 - 1.2 * u * c, w: 0.8, h: 0.8, rot: u * 3 + k });
        splashAt(out, x0 - 1.2 * sn, HIGH, z0 - 1.2 * c, (t - t0 - 0.75) / 0.9, 0.8);
      }
      break;
    }
    case 6: { // the hungry camp round an empty pot
      const ring: [number, number, Expr][] = [[-1.5, -0.4, "pained"], [1.4, -0.6, "nervous"], [-0.9, 1.3, "dazed"], [1.0, 1.4, "pained"], [0.1, -1.6, "nervous"], [-2.2, 0.9, "dazed"]];
      ring.forEach(([dx, dz, ex], k) => {
        const x = CAMP[0] + dx, z = CAMP[2] + dz, y = groundY(x, z);
        out.places.push(person(cam, yuan(k), x, y, z, F0, { mode: "sit", expr: ex, blink: lidAt(t, k), look: dx > 0 ? -1 : 1 }, {}));
        blob(out, x, y, z, 1.05, 0.8);
        if (k < 3 && t > W.khongCom + 0.2 && t < W.duongVe) {
          const u = q(((t * 1.2 + k * 0.3) % 1), 20);
          out.fx.push({ key: `growl${u}`, cw: 300, ch: 200, draw: (p) => growl(p, u), x: x + 0.45, y: y + 0.75, z, w: 0.45, h: 0.3 });
        }
      });
      for (let k = 0; k < 14; k++) { // the rest of the army, further back
        const x = CAMP[0] - 6 + (k % 5) * 3.4 + (hh(k, 3) - 0.5), z = CAMP[2] + 4 + Math.floor(k / 5) * 3.2 + (hh(k, 4) - 0.5), y = groundY(x, z);
        out.places.push(person(cam, yuan(k + 6), x, y, z, F0, { mode: "sit", expr: k % 2 ? "pained" : "nervous", blink: lidAt(t, k + 6) }, {}));
        blob(out, x, y, z, 1.05, 0.8);
      }
      break;
    }
    case 7: case 8: { // Trần Hưng Đạo, chin in hand; the ghost of 938 beside him
      const nod = id === 8 ? -6 * Math.sin(Math.PI * clamp01((t - (W.truoc - 0.3)) / 0.6)) : 0;
      out.places.push(person(cam, THDW, THD[0], THD[1], THD[2], F0, { mode: "stand", prop: "chin", expr: id === 8 ? "smile" : "neutral", look: id === 7 ? 1 : -1, blink: lidAt(t, 1), headTilt: nod, facing: id === 7 ? 1 : -1 }, {}));
      blob(out, THD[0], THD[1], THD[2], 1.1, 0.8);
      if (id === 8) {
        const a = 0.72 * smooth((t - (W.ngoQuyen - 0.4)) / 0.7);
        ghost(out, THD[0] - 1.25, THD[1], THD[2] - 0.35, a, { mode: "stand", prop: "stake", expr: "smile", look: 1, facing: 1, headTilt: nod, blink: lidAt(t, 6) });
      }
      break;
    }
    case 9: { // driving stakes at low tide; the tide comes back in and everyone wades off
      if (t > W.nuocLen) break;
      const wy = tideY(9, t), hits = [W.dong, W.chit, W.dong - 0.9, W.dong - 1.8, W.dong - 2.7];
      const mk = (t0: number) => { let k = 0; for (const h of hits) { const u = (t - (h - 0.32)) / 0.32; if (u >= 0 && u <= 1.4) k = Math.max(k, u <= 1 ? u * u : 1 - (u - 1) / 0.4); } return k; };
      const crew: [number, number, Prop2, Expr][] = [[-8.9, -30.6, "stake", "stern"], [-8.0, -30.0, "mallet", "grin"], [-10.4, -29.2, "stake", "neutral"],
        [-4.5, -26.5, "mallet", "stern"], [-13, -25, "stake", "neutral"], [2, -22, "mallet", "grin"], [-16, -20, "mallet", "stern"]];
      crew.forEach(([x, z, pr, ex], k) => {
        const prop: FrontOpts["prop"] = pr === "mallet" ? ["mallet", q(mk(0 + k * 0.13), 12)] : "stake";
        out.places.push(person(cam, viet(k), x, wy - 0.45, z, F0, { mode: "stand", prop, expr: ex, blink: lidAt(t, k), facing: k % 2 ? -1 : 1 }, {}));
        ringAt(out, x, wy, z, t, k, 1.3);
      });
      break;
    }
    case 10: { // the lure: little boats, a wave goodbye; Yuan sailors whooping on the chasing decks
      for (let b = 0; b < 5; b++) {
        inBoat(out, cam, viet(10 + b), b, 10, t, 0.9, { prop: "oar", expr: at(t, W.giaVo) ? "smile" : "stern", wave: b === 2 && at(t, W.thua) ? Math.sin(t * 10) : undefined });
        inBoat(out, cam, viet(20 + b), b, 10, t, -0.9, { expr: at(t, W.giaVo) ? "smile_closed" : "stern" }, true);
      }
      if (t > W.hamDoi - 0.5) for (let j = 0; j < 4; j++) SAILOR_SPOTS.slice(0, j ? 2 : 3).forEach((lp, k) =>
        onDeck(out, cam, j === 0 && k === 0 ? OMNW : yuan(j * 3 + k), j, 10, t, j === 0 && k === 0 ? OMN_BOW : lp, { expr: k % 2 ? "laugh" : "grin" }));
      break;
    }
    case 11: { // the ebb and the crash: deck crews jolt
      for (let j = 0; j < 4; j++) SAILOR_SPOTS.slice(0, 2).forEach((lp, k) =>
        onDeck(out, cam, j === 0 && k === 0 ? OMNW : yuan(j * 3 + k), j, 11, t, j === 0 && k === 0 ? OMN_BOW : lp,
          { expr: at(t, j === 0 ? W.sau : W.macKet) ? "shock" : at(t, W.troiLen) ? "nervous" : "grin", wave: at(t, W.sau) ? Math.sin(t * 12 + k) : undefined }));
      if (t >= W.sau) { const p = onJunk(0, 11, W.sau, [7.5, 0.6, 0]); burstAt(out, p[0], p[1] + 0.4, p[2] - 1.2, (t - W.sau) / 0.45, 2.4); }
      break;
    }
    case 12: { // clinging to the mast; the rope arrives
      const rel = at(t, W.songSot) && !at(t, W.khongMay) ? "relief" : at(t, W.batSong) ? "shock" : "nervous";
      onDeck(out, cam, OMNW, 0, 12, t, OMN_MAST, { expr: rel, wave: 0.8, look: at(t, W.khongMay) ? -1 : 0 });
      inBoat(out, cam, viet(30), 0, 12, t, 0.8, { prop: "rope", expr: "smile" });
      inBoat(out, cam, viet(31), 0, 12, t, -0.7, { prop: "oar", expr: "smile_closed" });
      break;
    }
    case 13: { // the carpet: a soldier at the far end yanks it on "kéo đi"
      const k = carpetPull(t), x = CT[0] - 1.75, z = CT[2] + 0.1;
      out.places.push(person(cam, viet(40), x - 0.35 * k, CT[1], z, F0, { mode: "stand", expr: "neutral", tilt: -9 * k, look: 1, blink: lidAt(t, 40), facing: 1 }, {}));
      blob(out, x - 0.35 * k, CT[1], z, 1.05, 0.8);
      break;
    }
    case 16: { // 2019: the farmer digs, CỐP, then looks at us
      const k = hoeK(t), look = at(t, W.caiBay - 0.2);
      out.places.push(person(cam, FARMW, FARM[0], FARM[1], FARM[2], F0,
        { mode: "stand", prop: ["hoe", q(k, 12)], expr: look ? "neutral" : at(t, HOE_HIT) ? "shock" : "stern", blink: lidAt(t, 4), facing: look ? 0 : 1, look: look ? 0 : 1 }, {}));
      blob(out, FARM[0], FARM[1], FARM[2], 1.1, 0.8);
      if (t >= HOE_HIT) burstAt(out, FARM[0] + 0.62, FARM[1] + 0.3, FARM[2] + 0.35, (t - HOE_HIT) / 0.45, 0.9);
      break;
    }
  }
  return out;
};
type Prop2 = "stake" | "mallet";
export { FPS, STAKES, CT, SB, TABLE_H, LOW, heel, fxPuff, fxStars };
