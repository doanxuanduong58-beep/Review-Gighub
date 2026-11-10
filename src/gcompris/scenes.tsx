import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { HEADER_H, ScreenCard, UrlBar, type Box, type CamKey, type Size } from "../components/ScreenCard";
import { Bokeh, Stamp } from "../components/fx";
import { SplitLayout, useLayout } from "../components/layout";
import { SubscribeScene } from "../components/subscribe";
import { Background, C, CheckIcon, fontFamily, useExit } from "../components/ui";
import REPO_SHOT from "../../public/gcompris/repo.json";
import { BRAND, BRAND_GRADIENT, beat } from "./data";

// Mọi kích thước px viết theo thiết kế gốc 1080x1920 rồi nhân `k`.

const useEnter = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (delay: number, damping = 200) => spring({ frame: frame - delay, fps, config: { damping } });
};
const rise = (p: number, px = 50) => ({ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [px, 0])}px)` });
const ease = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t: number) => 1 - Math.pow(1 - t, 3) } as const;

const Grad: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{children}</span>
);

const Pill: React.FC<{ k: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ k, children, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignSelf: "flex-start",
      alignItems: "center",
      gap: 16 * k,
      padding: `${18 * k}px ${32 * k}px ${18 * k}px ${22 * k}px`,
      borderRadius: 999,
      background: "rgba(255,255,255,0.05)",
      border: "2px solid rgba(255,255,255,0.1)",
      fontSize: 44 * k,
      fontWeight: 700,
      ...style,
    }}
  >
    {children}
  </div>
);

const Scene: React.FC<{ accent?: string; children: React.ReactNode }> = ({ accent = BRAND.main, children }) => {
  const exit = useExit();
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text, opacity: exit }}>
      <Background accent={accent} />
      <Bokeh color={accent} count={10} />
      {children}
    </AbsoluteFill>
  );
};

const Tag: React.FC<{ k: number; p: number; children: React.ReactNode; color?: string }> = ({ k, p, children, color = BRAND.main }) => (
  <div style={{ fontSize: 40 * k, fontWeight: 700, letterSpacing: 4 * k, color, ...rise(p, 30) }}>{children}</div>
);
const Title: React.FC<{ k: number; p: number; children: React.ReactNode; size?: number }> = ({ k, p, children, size = 96 }) => (
  <div style={{ fontSize: size * k, fontWeight: 900, letterSpacing: -3 * k, lineHeight: 1.08, marginTop: 14 * k, ...rise(p) }}>{children}</div>
);

const Icon: React.FC<{ d: string; size: number; color?: string }> = ({ d, size, color = BRAND.main }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);

const Logo: React.FC<{ width: number }> = ({ width }) => (
  <div style={{ display: "inline-flex", background: "#fff", borderRadius: width * 0.06, padding: `${width * 0.03}px ${width * 0.05}px` }}>
    <Img src={staticFile("gcompris/logo-full.svg")} style={{ width, height: (width * 216) / 600 }} />
  </div>
);

// Ảnh chụp màn hình chính thức (fastlane/metadata của repo) trong khung bo góc, phóng chậm.
const Shot: React.FC<{ src: string; width: number; height: number; p: number; pos?: string; label?: string; k: number }> = ({ src, width, height, p, pos = "50% 50%", label, k }) => {
  const frame = useCurrentFrame();
  const z = 1 + frame * 0.0012;
  return (
    <div style={{ position: "relative", width, height, borderRadius: 28 * k, overflow: "hidden", border: "3px solid rgba(255,255,255,0.18)", boxShadow: "0 30px 90px rgba(0,0,0,0.5)", opacity: p, transform: `scale(${interpolate(p, [0, 1], [0.8, 1])})` }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${z})` }} />
      {label && (
        <div style={{ position: "absolute", left: 18 * k, bottom: 18 * k, padding: `${8 * k}px ${22 * k}px`, borderRadius: 999, background: "rgba(10,13,22,0.82)", fontSize: 36 * k, fontWeight: 800 }}>
          {label}
        </div>
      )}
    </div>
  );
};

// ---------- P1: hook — ứng dụng đầy quảng cáo ----------
const ADS = [
  { at: 4, x: 0.06, y: 0.1, w: 0.7, text: "TẢI NGAY!!!", color: "#FF3B5C" },
  { at: 12, x: 0.25, y: 0.34, w: 0.68, text: "MUA GÓI VIP", color: "#8B5CF6" },
  { at: 20, x: 0.04, y: 0.55, w: 0.75, text: "XEM QUẢNG CÁO\nĐỂ CHƠI TIẾP", color: "#F59E0B" },
  { at: 28, x: 0.2, y: 0.74, w: 0.72, text: "NẠP TIỀN NGAY", color: "#10B981" },
];

export const Hook: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const W = 640 * k, H = 1020 * k;
  const shake = frame > 4 && frame < 40 ? Math.sin(frame * 1.7) * 5 : 0;
  return (
    <Scene accent={BRAND.pink}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 170 * k, gap: 40 * k }}>
        <div style={{ fontSize: 104 * k, fontWeight: 900, letterSpacing: -3 * k, textAlign: "center", lineHeight: 1.05, ...rise(enter(0)) }}>
          Đầy <span style={{ color: "#FF5D8F" }}>quảng cáo?</span>
        </div>
        <div style={{ position: "relative", width: W, height: H, borderRadius: 60 * k, background: "#1A2030", border: `${14 * k}px solid #2A3245`, overflow: "hidden", transform: `translateX(${shake}px)` }}>
          {/* màn hình trò chơi trẻ em tự vẽ */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#7CC8FF, #BDE6FF 60%, #7BD389 60%)" }} />
          <div style={{ position: "absolute", left: W * 0.35, top: H * 0.42, width: W * 0.3, height: W * 0.3, borderRadius: "50%", background: "#FFD23F" }} />
          {ADS.map((a, i) => {
            const p = enter(a.at, 10);
            if (frame < a.at) return null;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: a.x * W,
                  top: a.y * H,
                  width: a.w * W,
                  padding: `${26 * k}px ${20 * k}px`,
                  borderRadius: 22 * k,
                  background: a.color,
                  boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
                  fontSize: 40 * k,
                  fontWeight: 900,
                  textAlign: "center",
                  whiteSpace: "pre",
                  lineHeight: 1.2,
                  transform: `scale(${p}) rotate(${(i % 2 ? 3 : -3)}deg)`,
                }}
              >
                <div style={{ position: "absolute", right: 10 * k, top: 4 * k, fontSize: 26 * k, opacity: 0.8 }}>✕</div>
                {a.text}
              </div>
            );
          })}
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: frame >= 52 ? "rgba(10,13,22,0.72)" : "transparent" }}>
            <div style={{ transform: "scale(1.9)" }}>
              <Stamp text="DỪNG LẠI!" at={52} color="#FF5D8F" rotate={-10} />
            </div>
          </AbsoluteFill>
        </div>
        <div style={{ fontSize: 28 * k, color: C.muted, fontStyle: "italic" }}>* Hình minh hoạ</div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P2: nhu cầu của cô ----------
const NEEDS = [
  { at: 0.12, label: "Học mà chơi", color: BRAND.alt },
  { at: 0.42, label: "An toàn cho bé", color: BRAND.green },
  { at: 0.68, label: "Không tốn đồng nào", color: BRAND.main },
];
export const Needs: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${240 * k}px ${60 * k}px`, gap: 44 * k }}>
        <Title k={k} p={enter(0)} size={100}>
          Cô cần <Grad>trò chơi</Grad>
          <br />
          như thế nào?
        </Title>
        <div style={{ height: 30 * k }} />
        {NEEDS.map((n) => {
          const p = enter(beat("p2", n.at), 13);
          return (
            <div key={n.label} style={{ display: "flex", alignItems: "center", gap: 30 * k, padding: `${36 * k}px ${42 * k}px`, borderRadius: 32 * k, background: `${n.color}1C`, border: `3px solid ${n.color}AA`, fontSize: 64 * k, fontWeight: 900, opacity: p, transform: `translateX(${interpolate(p, [0, 1], [160, 0])}px)` }}>
              <div style={{ width: 96 * k, height: 96 * k, borderRadius: 48 * k, background: n.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CheckIcon size={60 * k} color="#0A0D16" />
              </div>
              {n.label}
            </div>
          );
        })}
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P3: giới thiệu ----------
export const Intro: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  const shot = REPO_SHOT as typeof REPO_SHOT & { star: Box };
  const keys = (view: Size): CamKey[] => [
    { at: 0, cam: { cx: 640, cy: 330, s: view.width / 1280 } },
  ];
  return (
    <Scene>
      <SplitLayout
        mediaFrac={0.32}
        head={
          <div>
            <div style={{ transform: `scale(${enter(0, 12)})`, transformOrigin: "0 50%" }}>
              <Logo width={560 * k} />
            </div>
            <div style={{ fontSize: 52 * k, fontWeight: 800, marginTop: 30 * k, lineHeight: 1.25, ...rise(enter(beat("p3", 0.35))) }}>
              Mã nguồn mở · cộng đồng <Grad>KDE</Grad>
            </div>
          </div>
        }
        media={(b) => (
          <div style={rise(enter(4), 120)}>
            <ScreenCard
              src={shot.file}
              page={{ width: 1280, height: 900 }}
              view={{ width: b.width, height: b.height - HEADER_H }}
              keys={keys({ width: b.width, height: b.height - HEADER_H })}
              accent={BRAND.main}
              header={<UrlBar url="github.com/gcompris/GCompris-qt" muted={C.muted} color={C.text} />}
            />
          </div>
        )}
        foot={
          <Pill k={k} style={{ fontSize: 76 * k, fontWeight: 900, border: `2px solid ${BRAND.main}66`, ...rise(enter(beat("p3", 0.65))) }}>
            <span>👶</span>
            <span>2–10 tuổi</span>
          </Pill>
        }
      />
    </Scene>
  );
};

// ---------- P4: hơn 200 trò chơi ----------
const TOPICS = [
  { label: "Toán", color: BRAND.alt },
  { label: "Chữ cái", color: BRAND.pink },
  { label: "Khoa học", color: BRAND.green },
  { label: "Âm nhạc", color: BRAND.main },
  { label: "Chuột & phím", color: "#A78BFA" },
  { label: "Logic", color: "#F87171" },
];
export const Count: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const n = interpolate(frame, [2, beat("p4", 0.5)], [0, 205], ease);
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 * k, gap: 30 * k, textAlign: "center" }}>
        <div style={{ fontSize: 320 * k, fontWeight: 900, lineHeight: 0.95, letterSpacing: -10 * k, fontVariantNumeric: "tabular-nums", transform: `scale(${enter(0, 12)})` }}>
          <Grad>{Math.round(n)}</Grad>
        </div>
        <div style={{ fontSize: 76 * k, fontWeight: 900, ...rise(enter(6)) }}>trò chơi học tập</div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 22 * k, width: 980 * k, marginTop: 60 * k }}>
          {TOPICS.map((t, i) => (
            <div key={t.label} style={{ padding: `${16 * k}px ${28 * k}px`, borderRadius: 999, background: `${t.color}22`, border: `3px solid ${t.color}`, fontSize: 46 * k, fontWeight: 800, ...rise(enter(beat("p4", 0.45 + i * 0.07)), 30) }}>
              {t.label}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P5–P7: bộ ảnh trò chơi thật ----------
type Card = { src: string; label: string; pos?: string };
const Gallery: React.FC<{ seg: string; tag: string; title: React.ReactNode; big: Card; small: [Card, Card]; accent?: string }> = ({ seg, tag, title, big, small, accent }) => {
  const { k, width, pad } = useLayout();
  const enter = useEnter();
  const W = width - pad * 2;
  const sw = (W - 24 * k) / 2;
  return (
    <Scene accent={accent}>
      <AbsoluteFill style={{ padding: `${170 * k}px ${pad}px`, gap: 30 * k }}>
        <Tag k={k} p={enter(0)}>{tag}</Tag>
        <Title k={k} p={enter(4)} size={88}>{title}</Title>
        <div style={{ marginTop: 20 * k }}>
          <Shot k={k} src={big.src} width={W} height={W * 0.5625} p={enter(beat(seg, 0.08), 14)} pos={big.pos} label={big.label} />
        </div>
        <div style={{ display: "flex", gap: 24 * k }}>
          <Shot k={k} src={small[0].src} width={sw} height={sw * 0.78} p={enter(beat(seg, 0.38), 14)} pos={small[0].pos} label={small[0].label} />
          <Shot k={k} src={small[1].src} width={sw} height={sw * 0.78} p={enter(beat(seg, 0.6), 14)} pos={small[1].pos} label={small[1].label} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

export const Basics: React.FC = () => (
  <Gallery
    seg="p5"
    tag="MẦM · CHỒI"
    title={<>Đếm, màu sắc,<br /><Grad>hình khối</Grad></>}
    big={{ src: "gcompris/turtle.png", label: "Tập đếm" }}
    small={[
      { src: "gcompris/hexagon.png", label: "Màu sắc", pos: "50% 30%" },
      { src: "gcompris/shapes.png", label: "Hình khối", pos: "50% 22%" },
    ]}
  />
);

export const Skills: React.FC = () => (
  <Gallery
    seg="p6"
    tag="KỸ NĂNG"
    title={<>Chuột, mê cung,<br /><Grad>âm nhạc</Grad></>}
    accent={BRAND.alt}
    big={{ src: "gcompris/xylophone.png", label: "Gõ đàn" }}
    small={[
      { src: "gcompris/maze.png", label: "Mê cung" },
      { src: "gcompris/dots.png", label: "Nối điểm" },
    ]}
  />
);

export const Science: React.FC = () => (
  <Gallery
    seg="p7"
    tag="LÁ · TIỂU HỌC"
    title={<>Nhà khoa học <Grad>nhỏ</Grad></>}
    accent={BRAND.green}
    big={{ src: "gcompris/colormix.png", label: "Pha màu" }}
    small={[
      { src: "gcompris/clock.png", label: "Xem giờ", pos: "50% 45%" },
      { src: "gcompris/balance.png", label: "Cân bằng", pos: "50% 25%" },
    ]}
  />
);

// ---------- P8: độ khó 1–6 sao ----------
const STAR = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z";
const GROUPS = [
  { label: "Lớp mầm", stars: "★1–2", color: BRAND.green, at: 0.35 },
  { label: "Lớp chồi", stars: "★2–3", color: BRAND.alt, at: 0.5 },
  { label: "Lớp lá", stars: "★3–4", color: BRAND.main, at: 0.65 },
];
export const Difficulty: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  return (
    <Scene>
      <AbsoluteFill style={{ padding: `${220 * k}px ${60 * k}px`, gap: 50 * k }}>
        <Tag k={k} p={enter(0)}>CÔ TỰ CHỌN</Tag>
        <Title k={k} p={enter(4)} size={100}>
          Độ khó <Grad>1 → 6 sao</Grad>
        </Title>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 * k }}>
          {Array.from({ length: 6 }, (_, i) => {
            const on = frame >= beat("p8", 0.05 + i * 0.05);
            return (
              <svg key={i} width={140 * k} height={140 * k} viewBox="0 0 24 24" style={{ transform: `scale(${on ? 1 : 0.8})` }}>
                <path d={STAR} fill={on ? BRAND.main : "rgba(255,255,255,0.08)"} stroke={BRAND.main} strokeWidth={1} />
              </svg>
            );
          })}
        </div>
        {GROUPS.map((g) => (
          <div key={g.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${30 * k}px ${42 * k}px`, borderRadius: 30 * k, background: `${g.color}1C`, border: `3px solid ${g.color}AA`, fontSize: 58 * k, fontWeight: 900, ...rise(enter(beat("p8", g.at)), 40) }}>
            {g.label}
            <span style={{ color: g.color }}>{g.stars}</span>
          </div>
        ))}
        <div style={{ fontSize: 30 * k, color: C.muted, fontStyle: "italic" }}>* Gợi ý chia nhóm của kênh, cô điều chỉnh theo lớp</div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P9: chưa có tiếng Việt ----------
export const Language: React.FC = () => {
  const { k, width, pad } = useLayout();
  const enter = useEnter();
  const W = width - pad * 2;
  return (
    <Scene accent={BRAND.alt}>
      <AbsoluteFill style={{ padding: `${200 * k}px ${pad}px`, gap: 40 * k }}>
        <Tag k={k} p={enter(0)} color={BRAND.alt}>NÓI THẬT VỚI CÔ</Tag>
        <div style={{ display: "flex", alignItems: "center", gap: 26 * k, padding: `${30 * k}px ${36 * k}px`, borderRadius: 30 * k, background: "rgba(251,191,36,0.1)", border: "3px solid rgba(251,191,36,0.6)", fontSize: 54 * k, fontWeight: 800, ...rise(enter(4)) }}>
          <Icon d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01" size={70 * k} color="#FBBF24" />
          Chưa có tiếng Việt
        </div>
        <Title k={k} p={enter(beat("p9", 0.45))} size={92}>
          Nhưng <Grad>nhìn hình</Grad>
          <br />
          là bé chơi được
        </Title>
        <div style={{ display: "flex", gap: 24 * k, marginTop: 10 * k }}>
          <Shot k={k} src="gcompris/flower.png" width={(W - 24 * k) / 2} height={380 * k} p={enter(beat("p9", 0.5), 14)} />
          <Shot k={k} src="gcompris/memory.png" width={(W - 24 * k) / 2} height={380 * k} p={enter(beat("p9", 0.62), 14)} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P10: nền tảng ----------
const PLATFORMS = [
  { label: "Windows", d: "M3 5l8-1.2V11H3zM13 3.5L21 2v9h-8zM3 13h8v7.2L3 19zM13 13h8v9l-8-1.5z", fill: true },
  { label: "Mac", d: "M4 5h16v11H4zM2 19h20", fill: false },
  { label: "Linux", d: "M12 3a4 4 0 0 0-4 4v4l-3 6h14l-3-6V7a4 4 0 0 0-4-4zM9 21h6", fill: false },
  { label: "Android", d: "M5 10h14v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zM7 10a5 5 0 0 1 10 0M3 11v5M21 11v5M9 7h.01M15 7h.01", fill: false },
];
export const Platforms: React.FC = () => {
  const { k } = useLayout();
  const enter = useEnter();
  return (
    <Scene accent={BRAND.green}>
      <AbsoluteFill style={{ padding: `${240 * k}px ${60 * k}px`, gap: 60 * k }}>
        <Title k={k} p={enter(0)} size={100}>
          Cài được <Grad>mọi máy</Grad>
        </Title>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 * k }}>
          {PLATFORMS.map((pl, i) => (
            <div key={pl.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 * k, padding: `${40 * k}px 0`, borderRadius: 32 * k, background: "rgba(255,255,255,0.05)", border: "2px solid rgba(255,255,255,0.12)", ...rise(enter(beat("p10", 0.12 + i * 0.12)), 50) }}>
              <svg width={110 * k} height={110 * k} viewBox="0 0 24 24" fill={pl.fill ? BRAND.alt : "none"} stroke={BRAND.alt} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d={pl.d} />
              </svg>
              <div style={{ fontSize: 50 * k, fontWeight: 800 }}>{pl.label}</div>
            </div>
          ))}
        </div>
        <Pill k={k} style={{ alignSelf: "center", fontSize: 56 * k, fontWeight: 900, border: `3px solid ${BRAND.ok}88`, ...rise(enter(beat("p10", 0.72)), 40) }}>
          <CheckIcon size={60 * k} color={BRAND.ok} />
          Hoàn toàn miễn phí
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P11: lưu lại & cài thử ----------
export const Outro: React.FC = () => {
  const { k } = useLayout();
  const frame = useCurrentFrame();
  const enter = useEnter();
  const pulse = 1 + Math.sin(frame / 6) * 0.03;
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 360 * k, textAlign: "center" }}>
        <div style={{ transform: `scale(${enter(0, 10) * pulse})` }}>
          <Logo width={600 * k} />
        </div>
        <div style={{ fontSize: 120 * k, fontWeight: 900, lineHeight: 1.08, marginTop: 80 * k, letterSpacing: -3 * k, ...rise(enter(8)) }}>
          Lưu lại
          <br />
          <Grad>& cài thử ngay!</Grad>
        </div>
        <Pill k={k} style={{ alignSelf: "center", marginTop: 70 * k, fontSize: 42 * k, fontWeight: 600, ...rise(enter(18), 30) }}>
          <svg width={52 * k} height={52 * k} viewBox="0 0 24 24" fill={C.text} style={{ flexShrink: 0 }}>
            <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
          </svg>
          github.com/gcompris/GCompris-qt
        </Pill>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- P12: theo dõi + câu hỏi ----------
export const Subscribe: React.FC = () => (
  <SubscribeScene question={"Lớp cô dùng máy tính\nhay máy tính bảng?"} accent={BRAND.main} btnAt={beat("p12", 0.25)} label="+ Theo dõi kênh" />
);
