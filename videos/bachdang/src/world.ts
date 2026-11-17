// The Bạch Đằng world as one three.js scene: sky, estuary with a moving tide, mud bed, banks and hills, limestone
// karsts, the stake field, Yuan junks and Đại Việt boats, the sand table, the carpet-over-spikes table, the Yuan camp,
// Trần Hưng Đạo's hill and the 2019 areca plot. update(id, f, camera) poses everything (pure function of id + f).
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Ray, setSight, prop, quad } from "./build";
import { beam, ctex, rng, grassHD, waterNear, waterFar, cloudHD } from "./paint";
import { Pen } from "./toon";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, LFB, twoTone, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, stage } from "./cast";
import {
  FPS, SHOTS, ShotDef, camAt, V3, groundY, RIVER_W, BANK_Z, BED, LOW, HIGH, BANK, STAKES, tideY, junkPose, boatPose, riceJunk, JUNKS, BOATS,
  SB, CT, CAMP, FARM, THD, TABLE_H, flagDrop, flagPull, redFlag, carpetPull, HOE_HIT, Pose,
} from "./story";

// ---------------- painted textures ----------------
const mudTex = () => ctex("mudHD", 1024, 1024, (g, r) => {
  g.fillStyle = "#8a7356"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = ["#7a654a", "#958063", "#836d51", "#9c8868", "#6f5b42"][Math.floor(r() * 5)];
    g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 6 + r() * 22, 3 + r() * 9, r() * 0.4, 0, 7); g.fill();
  }
  g.strokeStyle = "rgba(60,44,28,.35)"; g.lineWidth = 3;
  for (let i = 0; i < 60; i++) { const x = r() * 1024, y = r() * 1024; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 30, y + 8 * (r() - 0.5), x + 60 + r() * 40, y + 4 * (r() - 0.5)); g.stroke(); }
});
const rockTex = () => ctex("karstHD", 512, 1024, (g, r) => {
  const gr = g.createLinearGradient(0, 0, 0, 1024);
  gr.addColorStop(0, "#9aa08f"); gr.addColorStop(0.5, "#8f9483"); gr.addColorStop(1, "#7d806f");
  g.fillStyle = gr; g.fillRect(0, 0, 512, 1024);
  for (let i = 0; i < 70; i++) { // vertical drip streaks and ledges
    const x = r() * 512, y = r() * 1024, h = 60 + r() * 260;
    g.strokeStyle = r() < 0.5 ? "rgba(70,72,60,.35)" : "rgba(190,195,175,.3)"; g.lineWidth = 3 + r() * 8;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 20, y + h); g.stroke();
  }
  for (let i = 0; i < 90; i++) { g.fillStyle = r() < 0.6 ? "rgba(84,128,62,.55)" : "rgba(98,146,70,.5)"; g.beginPath(); g.ellipse(r() * 512, r() * 1024, 10 + r() * 26, 6 + r() * 12, 0, 0, 7); g.fill(); }
});
const sailTex = (key: string, base: string, line: string) => ctex(key, 512, 512, (g) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = line; g.lineWidth = 10;
  for (let k = 1; k < 7; k++) { g.beginPath(); g.moveTo(0, k * 73); g.quadraticCurveTo(256, k * 73 + 14, 512, k * 73); g.stroke(); }
  g.strokeStyle = "rgba(0,0,0,.18)"; g.lineWidth = 3;
  for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo((k * 512) / 6, 0); g.lineTo((k * 512) / 6, 512); g.stroke(); }
});
const hullTex = (key: string, base: string, stripe: string) => ctex(key, 1024, 256, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 1024, 256);
  g.strokeStyle = "rgba(25,14,8,.55)"; g.lineWidth = 4;
  for (let k = 1; k < 7; k++) { g.beginPath(); g.moveTo(0, k * 36); g.lineTo(1024, k * 36 + (r() - 0.5) * 6); g.stroke(); }
  g.fillStyle = stripe; g.fillRect(0, 10, 1024, 22);
});
const mapTex = () => ctex("sabanMap", 1024, 768, (g, r) => {
  g.fillStyle = "#cdb98c"; g.fillRect(0, 0, 1024, 768);                                   // parchment-sand base
  g.fillStyle = "#6f9fc4"; g.beginPath(); g.moveTo(1024, 0); g.lineTo(1024, 768); g.lineTo(760, 768); g.bezierCurveTo(700, 500, 820, 260, 640, 0); g.fill(); // the sea
  g.strokeStyle = "#6f9fc4"; g.lineWidth = 46; g.lineCap = "round";                        // the river, winding to the sea
  g.beginPath(); g.moveTo(40, 300); g.bezierCurveTo(260, 200, 380, 470, 560, 380); g.bezierCurveTo(660, 330, 700, 420, 780, 420); g.stroke();
  g.lineWidth = 22; g.beginPath(); g.moveTo(300, 330); g.bezierCurveTo(330, 160, 260, 80, 330, 0); g.stroke();
  for (let i = 0; i < 70; i++) { // green land dabs
    const x = r() * 680, y = r() * 768;
    g.fillStyle = r() < 0.5 ? "rgba(110,150,80,.55)" : "rgba(130,165,90,.5)";
    g.beginPath(); g.ellipse(x, y, 20 + r() * 50, 12 + r() * 30, r(), 0, 7); g.fill();
  }
  g.strokeStyle = "rgba(60,40,20,.35)"; g.lineWidth = 4; g.strokeRect(14, 14, 996, 740);
});
const clothTex = () => ctex("carpet", 512, 512, (g) => {
  g.fillStyle = "#2f8fb0"; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "#e2c25a"; g.lineWidth = 18; g.strokeRect(24, 24, 464, 464);
  g.strokeStyle = "rgba(255,255,255,.25)"; g.lineWidth = 6;
  for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(60, 70 + k * 55); g.bezierCurveTo(180, 50 + k * 55, 330, 90 + k * 55, 452, 70 + k * 55); g.stroke(); }
});
const soilTex = () => ctex("soil", 512, 512, (g, r) => {
  g.fillStyle = "#7d5a3c"; g.fillRect(0, 0, 512, 512);
  for (let k = 0; k < 16; k++) { g.fillStyle = k % 2 ? "#6c4c33" : "#8b6847"; g.fillRect(0, k * 32, 512, 18); }
  for (let i = 0; i < 300; i++) { g.fillStyle = r() < 0.5 ? "#5f4330" : "#94714f"; g.beginPath(); g.ellipse(r() * 512, r() * 512, 3 + r() * 6, 2 + r() * 4, 0, 0, 7); g.fill(); }
});
const gaugeTex = () => ctex("gauge", 64, 512, (g) => {
  for (let k = 0; k < 16; k++) { g.fillStyle = k % 2 ? "#f2ead8" : "#c8342f"; g.fillRect(0, k * 32, 64, 32); }
});
const flagTexOf = (col: string) => ctex("flag" + col, 128, 96, (g) => { g.fillStyle = col; g.fillRect(0, 0, 128, 96); g.fillStyle = "rgba(0,0,0,.15)"; g.fillRect(0, 84, 128, 12); });

// ---------------- geometry ----------------
/** heightfield over x0..x1, z0..z1, sampling groundY, uv in metres / tile */
const terrain = (x0: number, x1: number, zs: number[], dx: number, tile: number, yf = groundY) => {
  const nx = Math.round((x1 - x0) / dx) + 1, nz = zs.length, pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const x = x0 + i * dx, z = zs[j]; pos.push(x, yf(x, z), z); uv.push(x / tile, z / tile); }
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};
const range = (a: number, b: number, n: number) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
/** ship hull: U sections lofted along x (bow at +x), keel at y = 0, sheer rising at both ends, stern higher */
const hullGeo = (len: number, hw: number, top: number, sternUp: number) => {
  const NS = 28, NU = 10, pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const L = len / 2;
  for (let i = 0; i <= NS; i++) {
    const x = -L + (len * i) / NS, u = x / L;
    const w = hw * Math.max(0.08, Math.sqrt(Math.max(0, 1 - Math.abs(u) ** (u > 0 ? 2.2 : 3.5)))), bot = 0.85 * Math.abs(u) ** 3;
    const tp = top + 0.55 * u * u + (u < -0.6 ? sternUp * ((-u - 0.6) / 0.4) : 0);
    for (let k = 0; k <= NU; k++) {
      const th = -Math.PI / 2 + (Math.PI * k) / NU, z = w * Math.sin(th), y = bot + (tp - bot) * (1 - Math.cos(th)) ** 0.7;
      pos.push(x, y, z); uv.push((x + L) / 4, (k / NU) * 2);
    }
  }
  for (let i = 0; i < NS; i++) for (let k = 0; k < NU; k++) { const a = i * (NU + 1) + k, b = a + 1, c = a + NU + 1, d = c + 1; idx.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};
const deckGeo = (len: number, hw: number, y: number) => {
  const s = new THREE.Shape(), L = len / 2 - 0.3, N = 20;
  for (let i = 0; i <= N; i++) { const x = -L + (2 * L * i) / N, u = x / (len / 2); s.lineTo(x, (hw - 0.15) * Math.max(0.08, Math.sqrt(Math.max(0, 1 - Math.abs(u) ** (u > 0 ? 2.2 : 3.5))))); }
  for (let i = N; i >= 0; i--) { const x = -L + (2 * L * i) / N, u = x / (len / 2); s.lineTo(x, -(hw - 0.15) * Math.max(0.08, Math.sqrt(Math.max(0, 1 - Math.abs(u) ** (u > 0 ? 2.2 : 3.5))))); }
  const g = new THREE.ShapeGeometry(s);
  g.rotateX(-Math.PI / 2); g.translate(0, y, 0); g.scale(1, 1, -1);
  return g;
};
const flagGeo = (w: number, h: number) => { const g = new THREE.PlaneGeometry(w, h, 8, 1); g.translate(w / 2, -h / 2, 0); return g; };

type Ship = { g: THREE.Group; flags: THREE.Mesh[] };
const makeShip = (kind: "junk" | "rice" | "boat", R: THREE.Object3D): Ship => {
  const g = new THREE.Group(), flags: THREE.Mesh[] = [];
  const wood = lam("shipWood", () => ({ map: beam(), color: "#8a6a4a" }));
  const addM = (geo: THREE.BufferGeometry, m: THREE.Material, cast = true) => { const me = new THREE.Mesh(geo, m); me.castShadow = cast; me.receiveShadow = true; g.add(me); return me; };
  if (kind === "boat") {
    addM(hullGeo(7, 0.95, 0.8, 0.2), lam("boatHull", () => ({ map: hullTex("boatHullT", "#7a5236", "#b8392e"), side: THREE.DoubleSide })));
    addM(deckGeo(7, 0.95, 0.5), lam("boatDeck", () => ({ map: beam(), color: "#b08560" })));
    addM(new THREE.CylinderGeometry(0.04, 0.05, 3.2).translate(-2.4, 2.1, 0), wood);
    const f = addM(flagGeo(1.0, 0.7).translate(-2.4, 3.65, 0), lam("flagRed", () => ({ map: flagTexOf("#c8302c"), side: THREE.DoubleSide })), false);
    flags.push(f);
  } else {
    const hullM = lam(kind === "rice" ? "riceHull" : "junkHull", () => ({ map: hullTex(kind + "HullT", "#5e3f2a", kind === "rice" ? "#8a7a4a" : "#2b3a55"), side: THREE.DoubleSide }));
    addM(hullGeo(15, 2.5, 2.6, 1.2), hullM);
    addM(deckGeo(15, 2.5, 2.7), lam("junkDeck", () => ({ map: beam(), color: "#b8946a" })));
    addM(boxGeo(V(-7.0, 2.6, -1.7), V(-4.4, 4.6, 1.7), 0), lam("cabin", () => ({ color: "#6e4a32" }))); // stern castle
    addM(boxGeo(V(-7.3, 4.6, -1.9), V(-4.1, 4.8, 1.9), 0), lam("cabinRoof", () => ({ color: "#3d2c22" })));
    const sail = lam("sailNavy", () => ({ map: sailTex("sailNavyT", "#2e3d5c", "#c9b88a"), side: THREE.DoubleSide }));
    for (const [mx, mh, sw, sh] of [[3.4, 9.5, 4.6, 5.8], [-1.0, 11.5, 5.6, 7.2]] as const) {
      addM(new THREE.CylinderGeometry(0.12, 0.17, mh).translate(mx, 2.7 + mh / 2, 0), wood);
      const sg = new THREE.PlaneGeometry(sw, sh, 6, 6);
      const p = sg.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) p.setZ(i, 0.35 * Math.cos((p.getX(i) / sw) * Math.PI)); // a little belly
      sg.rotateY(Math.PI / 2 - 0.25); sg.translate(mx - 0.4, 2.7 + mh - sh / 2 - 0.4, 0);
      addM(sg, sail);
      const f = addM(flagGeo(1.6, 1.0).translate(mx, 2.7 + mh + 1.0, 0), lam("flagNavy", () => ({ map: flagTexOf("#24324e"), side: THREE.DoubleSide })), false);
      flags.push(f);
    }
    if (kind === "rice") {
      const sackM = lam("sacks", () => ({ color: "#d1ae72" }));
      for (let i = 0; i < 10; i++) addM(new THREE.SphereGeometry(0.42, 10, 8).scale(1, 0.7, 0.8).translate(-3 + (i % 5) * 1.2, 3.0, (Math.floor(i / 5) - 0.5) * 1.1), sackM);
    }
  }
  g.visible = false;
  R.add(g);
  return { g, flags };
};
const poseShip = (s: Ship, p: Pose, t: number) => {
  s.g.visible = p.vis;
  if (!p.vis) return;
  s.g.position.set(p.x, p.y, p.z);
  s.g.rotation.set(0, 0, 0); s.g.rotation.order = "YXZ";
  s.g.rotation.y = p.yaw; s.g.rotation.x = p.roll; s.g.rotation.z = p.pitch;
  for (const f of s.flags) {
    const pp = f.geometry.attributes.position as THREE.BufferAttribute, base = (f.userData.base ??= (pp.array as Float32Array).slice()) as Float32Array;
    for (let i = 0; i < pp.count; i++) {
      const x0 = base[i * 3], u = Math.max(0, x0 - base[0]);
      pp.setZ(i, base[i * 3 + 2] + 0.18 * u * Math.sin(t * 5 - u * 4 + p.x));
    }
    pp.needsUpdate = true;
  }
};

// ---------------- sun disc / clouds (from the bridge world) ----------------
const discTex = () => ctex("sunDisc", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const haloTex = () => ctex("sunHalo", 256, 256, (g) => {
  const im = g.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const u = Math.hypot(x - 127.5, y - 127.5) / 128;
    const a = (0.55 * Math.exp(-((u / 0.25) ** 2)) + 0.35 * Math.exp(-((u / 0.6) ** 2))) * (1 - Math.min(1, Math.max(0, (u - 0.8) / 0.2)));
    const i = (y * 256 + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = 255; im.data[i + 3] = Math.round(255 * Math.min(1, a));
  }
  g.putImageData(im, 0, 0);
});
const SUN_SHOT: Record<number, { az?: number; el?: number }> = { 4: { az: 110, el: 40 }, 7: { az: -60, el: 9 }, 8: { az: 60, el: 9 }, 15: { az: 20, el: 6 } };

const sightLines = (): Ray[] => {
  const out: Ray[] = [];
  for (const s of SHOTS) for (let f = s.a - 8; f < s.b + 8; f += 3) {
    const c = camAt(s.id, Math.max(0, f)), o = V(...c.pos), look = V(...c.look);
    const fw = look.clone().sub(o), len = fw.length();
    fw.normalize();
    const rt = fw.clone().cross(V(0, 1, 0)).normalize(), up = rt.clone().cross(fw);
    const ty = Math.tan((c.fov * Math.PI) / 360), tx = ty * (9 / 16);
    for (const [sx, sy] of [[0, 0], [-0.6, 0], [0.6, 0], [0, 0.6], [0, -0.4]])
      out.push({ o, d: fw.clone().addScaledVector(rt, sx * tx).addScaledVector(up, sy * ty), len, core: sx === 0 && sy === 0 });
  }
  return out;
};

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private WU: Record<string, THREE.IUniform>;
  private water: THREE.Mesh;
  private sunDisc: THREE.Sprite; private sunHalo: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private cloudMaps: Record<"day" | "golden", THREE.Texture[]>;
  private clouds: THREE.Mesh[] = [];
  private junks: Ship[] = []; private boats: Ship[] = []; private rice: Ship;
  private mapFlags: THREE.Group[] = []; private redFlagG: THREE.Group;
  private carpet: THREE.Mesh;
  private stakeHead: THREE.Mesh;
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

  constructor() {
    const R = this.root;
    // ---- sky + light (as the bridge world) ----
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el));
          c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el));
          c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1400, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    R.add(this.sky);
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex(), color: new THREE.Color(6.0, 4.4, 2.4), fog: false, depthWrite: false }));
    this.sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), color: new THREE.Color(1, 1, 1), fog: false, depthWrite: false, depthTest: true, transparent: true, blending: THREE.AdditiveBlending }));
    this.sunDisc.renderOrder = -0.5; this.sunHalo.renderOrder = 5;
    for (const m of [this.sunDisc, this.sunHalo]) { m.frustumCulled = false; m.layers.set(NOINK); R.add(m); }
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    R.add(this.hemi, this.sun, this.sun.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)) };
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2 + 0.3, d = 900 + (i % 3) * 80;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 200 + (i % 4) * 40;
      m.position.set(Math.cos(a) * d, 170 + (i % 4) * 50, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }
    setSight(sightLines());

    // ---- land: mud bed + slopes, grassy banks with hills ----
    const b = new Batch();
    const mud = lam("mudHD", () => ({ map: mudTex() }));
    const grass = lam("grassHD", () => ({ map: grassHD() }));
    const zMud = [...range(-BANK_Z - 1, -RIVER_W, 8), ...range(-RIVER_W + 4, RIVER_W - 4, 12), ...range(RIVER_W, BANK_Z + 1, 8)];
    b.add(terrain(-900, 1000, zMud, 8, 9), mud);
    for (const s of [-1, 1]) {
      const zs = range(BANK_Z - 1.5, 440, 110).map((z) => s * z);
      if (s < 0) zs.reverse();
      b.add(terrain(-900, 1000, zs, 6, 12), grass);
    }
    // ---- karsts: limestone towers with green caps, far round the estuary ----
    const rock = lam("karst", () => ({ map: rockTex() })), r = rng(77);
    const KARSTS: [number, number, number, number][] = [];
    for (let i = 0; i < 46; i++) {
      const a = r() * Math.PI * 2, d = 230 + r() * 520, x = 120 + Math.cos(a) * d, z = Math.sin(a) * d;
      if (Math.abs(z) < 120 || Math.hypot(x - FARM[0], z - FARM[2]) < 140 || Math.hypot(x - SB[0], z - SB[2]) < 90) continue;
      KARSTS.push([x, z, 40 + r() * 90, 14 + r() * 22]);
    }
    for (const [x0, z0] of [[-430, -160], [-470, 170], [-350, -210], [-520, -120]]) KARSTS.push([x0, z0, 60 + r() * 50, 16 + r() * 12]);
    KARSTS.forEach(([x, z, h, rad], k) => {
      const g = new THREE.CylinderGeometry(rad * 0.62, rad, h, 18, 8, false);
      const p = g.attributes.position as THREE.BufferAttribute, rr = rng(k + 5), ph = [rr() * 6, rr() * 6, rr() * 6];
      for (let i = 0; i < p.count; i++) {
        const px = p.getX(i), py = p.getY(i), pz = p.getZ(i), ang = Math.atan2(pz, px), v = py / h + 0.5;
        const n = 1 + 0.12 * Math.sin(3 * ang + ph[0] + 4 * v) + 0.08 * Math.sin(5 * ang + ph[1]) + 0.06 * Math.sin(9 * v + ph[2]);
        const bulge = 1 - 0.25 * Math.max(0, v - 0.75) / 0.25; // rounded shoulder
        p.setXYZ(i, px * n * bulge, py, pz * n * bulge);
      }
      g.computeVertexNormals(); g.translate(x, groundY(x, z) + h / 2 - 2, z);
      b.add(g, rock);
      const cap = new THREE.SphereGeometry(rad * 0.62, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.05, 0.5, 1.05).translate(x, groundY(x, z) + h - 2.5, z);
      b.add(cap, lam("karstCap", () => ({ color: "#5f9a48" })));
    });
    // ---- vegetation: bank trees + mangrove bushes on the slopes ----
    const rv = rng(31);
    for (let i = 0; i < 520; i++) {
      const x = -880 + rv() * 1860, s = rv() < 0.5 ? -1 : 1, near = rv() < 0.45;
      const z = s * (near ? BANK_Z - 6 + rv() * 5 : BANK_Z + 4 + rv() * 120);
      if (Math.hypot(x - FARM[0], z - FARM[2]) < 22 || Math.hypot(x - SB[0], z - SB[2]) < 12 || Math.hypot(x - CT[0], z - CT[2]) < 8 || Math.hypot(x - CAMP[0], z - CAMP[2]) < 14 || Math.hypot(x - THD[0], z - THD[2]) < 9) continue;
      const kind = near ? "plant_bushLarge" : ["tree_oak", "tree_fat", "tree_default", "plant_bushLarge"][Math.floor(rv() * 4)];
      prop(b, {}, kind, x, groundY(x, z) - (near ? 0.3 : 0), z, near ? 1.6 + rv() * 1.4 : 5 + rv() * 6, rv() * 6);
    }
    // ---- the hill: a couple of pines and a red banner beside Trần Hưng Đạo ----
    for (const [dx, dz, h] of [[-7, -6, 7], [-11, 2, 6], [6, -8, 8]] as const) prop(b, {}, "tree_cone", THD[0] + dx, groundY(THD[0] + dx, THD[2] + dz), THD[2] + dz, h, 0);
    b.add(new THREE.CylinderGeometry(0.05, 0.06, 5.5).translate(THD[0] + 2.4, THD[1] + 2.6, THD[2] - 1.8), lam("pole", () => ({ color: "#6e4a32" })));
    // ---- sand table yard ----
    const tableAt = (c: V3, w: number, d: number) => {
      b.add(boxGeo(V(c[0] - w / 2, c[1] + TABLE_H - 0.08, c[2] - d / 2), V(c[0] + w / 2, c[1] + TABLE_H, c[2] + d / 2), 0, true), lam("tableTop", () => ({ map: beam(), color: "#a87a52" })));
      for (const sx of [-1, 1]) for (const sz of [-1, 1])
        b.add(boxGeo(V(c[0] + sx * (w / 2 - 0.15) - 0.06, c[1], c[2] + sz * (d / 2 - 0.15) - 0.06), V(c[0] + sx * (w / 2 - 0.15) + 0.06, c[1] + TABLE_H - 0.08, c[2] + sz * (d / 2 - 0.15) + 0.06)), lam("tableLeg", () => ({ color: "#6e4a32" })));
    };
    tableAt(SB, 3.2, 2.3);
    const mapTop = quad(V(SB[0] - 1.5, SB[1] + TABLE_H + 0.004, SB[2] + 1.05), V(SB[0] + 1.5, SB[1] + TABLE_H + 0.004, SB[2] + 1.05), V(SB[0] + 1.5, SB[1] + TABLE_H + 0.004, SB[2] - 1.05), V(SB[0] - 1.5, SB[1] + TABLE_H + 0.004, SB[2] - 1.05));
    b.add(mapTop, lam("sabanMap", () => ({ map: mapTex() })));
    for (let i = 0; i < 9; i++) { // little karsts + hills modelled on the map
      const x = SB[0] - 1.3 + ((i * 0.37) % 1.4), z = SB[2] - 0.9 + ((i * 0.61) % 1.7);
      b.add(new THREE.ConeGeometry(0.05 + 0.03 * (i % 3), 0.16 + 0.05 * (i % 2), 7).translate(x, SB[1] + TABLE_H + 0.09, z), rock);
    }
    for (const [dx, dz] of [[-0.9, 0.6], [-0.3, -0.7], [0.4, 0.75]] as const)
      b.add(new THREE.SphereGeometry(0.22, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.35, 1).translate(SB[0] + dx, SB[1] + TABLE_H, SB[2] + dz), lam("mapHill", () => ({ color: "#7fa25a" })));
    // yard dressing: a war drum and a weapon rack behind the table, a tent
    b.add(new THREE.CylinderGeometry(0.55, 0.55, 0.7, 20).rotateZ(Math.PI / 2).translate(SB[0] - 2.6, SB[1] + 0.9, SB[2] - 3.2), lam("drum", () => ({ color: "#a8342c" })));
    b.add(new THREE.ConeGeometry(4.2, 4.5, 6).translate(SB[0] + 1.5, SB[1] + 2.25, SB[2] - 9), lam("tentRed", () => ({ color: "#b9473a" })));
    for (let k = 0; k < 5; k++) b.add(new THREE.CylinderGeometry(0.03, 0.03, 2.6).rotateZ(0.12).translate(SB[0] + 3.0 + k * 0.25, SB[1] + 1.3, SB[2] - 3.6), lam("pole", () => ({ color: "#6e4a32" })));
    // map flags: three navy (dropped in, later pulled out) and the red one (planted on the last word)
    const pin = new THREE.CylinderGeometry(0.008, 0.008, 0.32).translate(0, 0.16, 0);
    const mkFlag = (col: string) => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(pin, lam("pin", () => ({ color: "#e6e0d0" }))));
      g.add(new THREE.Mesh(flagGeo(0.16, 0.11).translate(0, 0.32, 0), lam("flag" + col, () => ({ map: flagTexOf(col), side: THREE.DoubleSide }))));
      g.traverse((o) => { o.castShadow = true; o.receiveShadow = true; });
      R.add(g); return g;
    };
    for (let k = 0; k < 3; k++) this.mapFlags.push(mkFlag("#24324e"));
    this.redFlagG = mkFlag("#c8302c"); this.redFlagG.scale.setScalar(1.25);
    // ---- carpet over a bed of spikes ----
    tableAt(CT, 2.6, 1.4);
    const spikes = new THREE.InstancedMesh(new THREE.ConeGeometry(0.035, 0.17, 6).translate(0, 0.085, 0), lam("spike", () => ({ color: "#8a6a48" })), 15 * 7);
    let si = 0;
    for (let i = 0; i < 15; i++) for (let k = 0; k < 7; k++) spikes.setMatrixAt(si++, this.m4.makeTranslation(CT[0] - 1.12 + i * 0.16, CT[1] + TABLE_H, CT[2] - 0.5 + k * 0.165));
    spikes.castShadow = true; spikes.receiveShadow = true; R.add(spikes);
    this.carpet = new THREE.Mesh(boxGeo(V(-1.3, 0, -0.68), V(1.3, 0.03, 0.68), 0, true), lam("carpet", () => ({ map: clothTex() })));
    this.carpet.castShadow = true; this.carpet.receiveShadow = true; R.add(this.carpet);
    // ---- the Yuan camp: empty pot, cold fire, tents, navy banners ----
    const cy0 = groundY(CAMP[0], CAMP[2]);
    b.add(new THREE.CylinderGeometry(0.42, 0.34, 0.45, 20, 1, true).translate(CAMP[0], cy0 + 0.42, CAMP[2]), lam("pot", () => ({ color: "#3a3a40", side: THREE.DoubleSide })));
    b.add(new THREE.TorusGeometry(0.42, 0.04, 6, 20).rotateX(Math.PI / 2).translate(CAMP[0], cy0 + 0.64, CAMP[2]), lam("potRim", () => ({ color: "#2b2b30" })));
    b.add(new THREE.CircleGeometry(0.36, 16).rotateX(-Math.PI / 2).translate(CAMP[0], cy0 + 0.25, CAMP[2]), lam("potIn", () => ({ color: "#1e1e22" })));
    for (let k = 0; k < 5; k++) b.add(new THREE.CylinderGeometry(0.06, 0.06, 0.9).rotateZ(Math.PI / 2).rotateY(k * 1.2).translate(CAMP[0], cy0 + 0.08, CAMP[2]), lam("log", () => ({ color: "#4a3426" })));
    for (const [dx, dz] of [[-9, 10], [-2, 13], [6, 11], [12, 16], [-14, 18]] as const) {
      const x = CAMP[0] + dx, z = CAMP[2] + dz;
      b.add(new THREE.ConeGeometry(3.0, 3.6, 7).translate(x, groundY(x, z) + 1.8, z), lam("tentNavy", () => ({ color: "#3a4a6a" })));
    }
    // ---- 2019: the areca plot (tilled soil, slim palms, a power line for "today") ----
    const soil = lam("soil", () => ({ map: soilTex() }));
    b.add(quad(V(FARM[0] - 9, FARM[1] + 0.02, FARM[2] + 7), V(FARM[0] + 9, FARM[1] + 0.02, FARM[2] + 7), V(FARM[0] + 9, FARM[1] + 0.02, FARM[2] - 9), V(FARM[0] - 9, FARM[1] + 0.02, FARM[2] - 9), 4, 4), soil);
    const trunk = lam("arecaTrunk", () => ({ color: "#b9b29a" })), frond = lam("frond", () => ({ color: "#4f9a3e", side: THREE.DoubleSide }));
    for (let i = 0; i < 22; i++) {
      const x = FARM[0] - 14 + (i % 6) * 5.6 + (rv() - 0.5) * 1.5, z = FARM[2] - 18 + Math.floor(i / 6) * 6 + (rv() - 0.5) * 1.5, h = 8 + rv() * 4;
      if (Math.hypot(x - FARM[0], z - FARM[2]) < 4.5) continue;
      b.add(new THREE.CylinderGeometry(0.11, 0.15, h, 7).translate(x, FARM[1] + h / 2, z), trunk);
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * Math.PI * 2 + rv(), fg = new THREE.PlaneGeometry(2.6, 0.5).translate(1.3, 0, 0).rotateZ(-0.5).rotateY(a).translate(x, FARM[1] + h, z);
        b.add(fg, frond);
      }
    }
    for (let k = 0; k < 4; k++) { // concrete power poles + a sagging line
      const x = FARM[0] - 30 + k * 26, z = FARM[2] - 26;
      b.add(new THREE.CylinderGeometry(0.12, 0.16, 9).translate(x, FARM[1] + 4.5, z), lam("concrete", () => ({ color: "#c9c4b8" })));
      b.add(boxGeo(V(x - 0.9, FARM[1] + 8.4, z - 0.06), V(x + 0.9, FARM[1] + 8.55, z + 0.06)), lam("concrete", () => ({ color: "#c9c4b8" })));
    }
    b.add(boxGeo(V(FARM[0] + 14, FARM[1], FARM[2] - 16), V(FARM[0] + 22, FARM[1] + 3.2, FARM[2] - 10)), lam("houseWall", () => ({ color: "#e9dcc0" })));
    b.add(boxGeo(V(FARM[0] + 13.6, FARM[1] + 3.2, FARM[2] - 16.4), V(FARM[0] + 22.4, FARM[1] + 3.5, FARM[2] - 9.6)), lam("houseRoof", () => ({ color: "#c9775a" })));
    // ---- tide gauge: a striped bamboo pole near the stake field ----
    b.add(new THREE.CylinderGeometry(0.08, 0.08, 4.6, 10).translate(11.6, BED + 2.3, -33.2), lam("gauge", () => ({ map: gaugeTex() })));
    b.build(R);

    // ---- stakes (instanced): lim wood, pointed, leaning upstream ----
    const sg = new THREE.CylinderGeometry(0.85, 1, 1, 8).translate(0, 0.5, 0);
    const tip = new THREE.ConeGeometry(0.85, 1.6, 8).translate(0, 0.8, 0);
    const stakeM = lam("stake", () => ({ map: beam(), color: "#7a5434" }));
    const shaft = new THREE.InstancedMesh(sg, stakeM, STAKES.length), tips = new THREE.InstancedMesh(tip, lam("stakeTip", () => ({ color: "#b48a5a" })), STAKES.length);
    const qn = new THREE.Quaternion(), e = new THREE.Euler();
    STAKES.forEach((s, i) => {
      const len = (s.top - BED + 0.6) / Math.cos(s.lean), ls = len - 1.6 * s.r;
      e.set(0, s.yaw, s.lean, "YXZ"); qn.setFromEuler(e);
      const base = V(s.x + Math.sin(s.lean) * len * 0.5, BED - 0.6, s.z); // keep the tip roughly over its spot
      shaft.setMatrixAt(i, this.m4.compose(base, qn, V(s.r, ls, s.r)));
      const top = V(0, ls, 0).applyQuaternion(qn).add(base);
      tips.setMatrixAt(i, this.m4.compose(top, qn, V(s.r, s.r, s.r)));
    });
    for (const im of [shaft, tips]) { im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; R.add(im); }
    // the farmer's stake head (appears when the hoe hits it)
    this.stakeHead = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.5, 10), stakeM);
    this.stakeHead.position.set(FARM[0] + 0.62, FARM[1] - 0.1, FARM[2] + 0.35); this.stakeHead.rotation.z = 0.35; this.stakeHead.castShadow = true;
    R.add(this.stakeHead);

    // ---- water: one plane, raised and lowered with the tide ----
    const wNear = waterNear(), wFar = waterFar();
    for (const t of [wNear, wFar]) { t.colorSpace = THREE.NoColorSpace; t.anisotropy = 16; t.needsUpdate = true; }
    this.WU = {
      wNearC: { value: new THREE.Color() }, wMidC: { value: new THREE.Color() }, wFarC: { value: new THREE.Color() },
      wCrest: { value: new THREE.Color() }, wTrough: { value: new THREE.Color() }, wGlint: { value: new THREE.Color() },
      wShade: { value: new THREE.Vector3(0.5, 0.56, 0.72) }, wNearTex: { value: wNear }, wFarTex: { value: wFar }, wTime: { value: 0 },
    };
    const waterM = new THREE.MeshLambertMaterial({ color: 0xffffff });
    waterM.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, this.WU);
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWP;")
        .replace("#include <project_vertex>", "#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", WATER_DECL)
        .replace("#include <map_fragment>", WATER_COL)
        .replace("#include <lights_fragment_begin>", "float sunVis = 1.0;\n" + LFB)
        .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\n  reflectedLight.directDiffuse = diffuseColor.rgb * mix(wShade, vec3(1.0), sunVis);\n  reflectedLight.indirectDiffuse = vec3(0.0);");
    };
    waterM.customProgramCacheKey = () => "estuary1";
    const wg = new THREE.PlaneGeometry(1900, BANK_Z * 2 + 10).rotateX(-Math.PI / 2).translate(50, 0, 0);
    this.water = new THREE.Mesh(wg, waterM);
    this.water.receiveShadow = true;
    R.add(this.water);

    // ---- fleets ----
    for (let i = 0; i < JUNKS; i++) this.junks.push(makeShip("junk", R));
    for (let i = 0; i < BOATS; i++) this.boats.push(makeShip("boat", R));
    this.rice = makeShip("rice", R);
  }

  private shotSun(id: number, s: ShotDef, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) {
      const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(s.sunAz ?? SUN_SHOT[id]?.az ?? L.az), el = THREE.MathUtils.degToRad(s.sunEl ?? SUN_SHOT[id]?.el ?? L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, s = SHOTS[id - 1], L = LIGHTS[s.light];
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.1; cam.far = 1800; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- light rig ----
    const K = LOOK[s.light], sunDir = this.shotSun(id, s, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    let Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 6, 110);
    if (s.light === "golden") Rr = Math.max(Rr, 30);
    this.sun.position.copy(focus).addScaledVector(sunDir, 260); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 560; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    // ---- sky, fog, sun disc, clouds ----
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog; scene.background = null;
    const showSun = s.light === "golden";
    this.sunDisc.visible = this.sunHalo.visible = showSun;
    if (showSun) {
      this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 1200);
      this.sunDisc.scale.setScalar(2 * 1200 * Math.tan(THREE.MathUtils.degToRad(1.7)));
      this.sunHalo.position.copy(this.sunDisc.position); this.sunHalo.scale.setScalar(2 * 1200 * Math.tan(THREE.MathUtils.degToRad(24)));
      (this.sunHalo.material as THREE.SpriteMaterial).color.set(L.sunDisc).multiplyScalar(1.3);
    }
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i];
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
      (m.material as THREE.MeshBasicMaterial).map = this.cloudMaps[s.light][i % 4];
    }
    // ---- water ----
    const Wu = this.WU, wc = K.water;
    untone(wc.near, Wu.wNearC.value); untone(wc.mid, Wu.wMidC.value); untone(wc.far, Wu.wFarC.value);
    untone(wc.crest, Wu.wCrest.value); untone(wc.trough, Wu.wTrough.value); untone(wc.glint, Wu.wGlint.value);
    Wu.wShade.value.set(...wc.shade); Wu.wTime.value = t;
    this.water.position.y = tideY(id, t);
    // ---- ships ----
    this.junks.forEach((sh, i) => poseShip(sh, junkPose(i, id, t), t));
    this.boats.forEach((sh, i) => poseShip(sh, boatPose(i, id, t), t));
    poseShip(this.rice, id === 5 ? riceJunk(t) : { x: 0, y: -50, z: 0, yaw: 0, roll: 0, pitch: 0, vis: false }, t);
    // ---- sand table flags ----
    const mapY = SB[1] + TABLE_H;
    const SPOTS: [number, number][] = [[1.1, -0.55], [1.25, 0.1], [0.95, 0.6]];
    this.mapFlags.forEach((g, k) => {
      const [dx, dz] = SPOTS[k];
      let y = mapY, vis = false;
      if (id === 3) { const u = flagDrop(k, t); vis = u > 0; y = mapY + 0.6 * (1 - u); }
      if (id === 14) { const u = flagPull(t); vis = u < 1; y = mapY + 0.7 * u; }
      g.visible = vis; g.position.set(SB[0] + dx, y, SB[2] + dz); g.rotation.set(0, -0.6, 0);
    });
    const ru = id === 14 ? redFlag(t) : 0;
    this.redFlagG.visible = ru > 0; this.redFlagG.position.set(SB[0] - 0.05, mapY + 0.5 * (1 - ru), SB[2] + 0.05); this.redFlagG.rotation.set(0, -0.6, 0);
    // ---- carpet ----
    const ck = id === 13 ? carpetPull(t) : 0;
    this.carpet.position.set(CT[0] - 2.9 * ck, CT[1] + TABLE_H + 0.17 + 0.12 * Math.sin(Math.PI * Math.min(1, ck * 1.4)), CT[2]);
    this.carpet.rotation.z = 0.25 * Math.sin(Math.PI * ck);
    // ---- the farmer's stake ----
    this.stakeHead.visible = id === 16 && t >= HOE_HIT - 0.02;
    // ---- cast + effects ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const st = stage(id, t, { pos: cam.position, right, sun: sunDir });
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      a.mesh.castShadow = L.actorShadow;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused: Fx[] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const ef = this.fx(fi++);
      ef.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      ef.use(!!p.soft);
      ef.mesh.visible = true;
      ef.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) ef.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { ef.mesh.quaternion.copy(cam.quaternion); ef.mesh.rotateZ(p.rot ?? 0); }
      ef.mesh.scale.set(p.w, p.h, 1);
      fused.push(ef);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const ef of fused) ef.bind();
    return focus;
  }
}

const WATER_DECL = `#include <common>
varying vec3 vWP;
uniform vec3 wNearC, wMidC, wFarC, wCrest, wTrough, wGlint, wShade;
uniform sampler2D wNearTex, wFarTex;
uniform float wTime;`;
const WATER_COL = `
  vec3 wV = vWP - cameraPosition;
  float wd = length(wV);
  float wDep = asin(clamp(-wV.y / wd, 0.0, 1.0));
  float wf = 1.0 - smoothstep(0.0, 0.42, wDep);
  vec3 wc = mix(mix(wNearC, wMidC, smoothstep(0.0, 0.55, wf)), wFarC, smoothstep(0.55, 1.0, wf));
  vec2 wp = vWP.xz + vec2(0.35 * wTime, 0.0);
  vec4 mk = mix(texture2D(wNearTex, wp / 8.0), texture2D(wFarTex, wp / 40.0 + 0.37), smoothstep(25.0, 90.0, wd));
  wc = mix(wc, wTrough, mk.g * 0.6);
  wc = mix(wc, wCrest, mk.r * 0.7);
  wc = mix(wc, wGlint, mk.b * (0.3 + 0.5 * wf));
  diffuseColor.rgb = wc;`;
void Pen; void HIGH; void LOW; void BANK;
