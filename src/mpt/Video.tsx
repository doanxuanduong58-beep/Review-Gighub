import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { MusicBed, Narration } from "../components/audio";
import { Captions } from "../components/fx";
import { useLayout } from "../components/layout";
import { DURATION_S, FPS, NAME, P, SEGMENTS, STARTS } from "./data";
import { Formats, Free, Hook, Intro, Outro, Steps, Subscribe, WebUI, cute } from "./scenes";
import VO_DURATIONS from "./vo-durations.json";

const f = (s: number) => Math.round(s * FPS);

// Cảnh i ↔ SEGMENTS[i]. Hàm thay vì JSX ở cấp module.
const SCENES: (() => React.ReactNode)[] = [
  () => <Hook />,
  () => <Intro />,
  () => <Steps />,
  () => <WebUI />,
  () => <Formats />,
  () => <Free />,
  () => <Outro />,
  () => <Subscribe />,
];

const sceneStart = [0, ...STARTS.slice(1).map(f)];
const sceneEnd = [...sceneStart.slice(1), f(DURATION_S)];

// Nhạc "cute" 124 BPM, nửa ô đầu chỉ có giai điệu: cả khung nảy nhẹ theo phách.
const BEAT_F = (60 / 124) * FPS;
const BouncePulse: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const ph = (frame % BEAT_F) / BEAT_F;
  const amt = frame < BEAT_F * 2 ? 0 : Math.exp(-ph * 6);
  return <AbsoluteFill style={{ transform: `scale(${1 + 0.008 * amt}) translateY(${-4 * amt}px)` }}>{children}</AbsoluteFill>;
};

// Chuyển cảnh: vòng tròn màu kẹo xoè ra từ giữa rồi thu lại.
const COLORS = [P.pink, P.mint, P.butter, P.lilac, P.sky];
const CircleWipe: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const r = Math.hypot(width, height) / 2;
  const i = sceneStart.slice(1).findIndex((s) => frame >= s - 5 && frame < s + 6);
  if (i < 0) return null;
  const s = sceneStart[i + 1];
  const p = interpolate(frame, [s - 5, s, s + 6], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ width: r * 2 * p, height: r * 2 * p, borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
    </AbsoluteFill>
  );
};

const CuteCaptions: React.FC = () => {
  const { k } = useLayout();
  return (
    <Captions
      segments={SEGMENTS.slice(0, -1)}
      starts={STARTS.slice(0, -1)}
      durations={VO_DURATIONS}
      accent={P.butter}
      theme={{
        font: cute,
        text: P.ink,
        activeText: P.ink,
        box: { background: "#FFFFFF", border: `${5 * k}px solid ${P.ink}`, boxShadow: `0 ${8 * k}px 0 ${P.ink}`, textShadow: "none", borderRadius: 999, padding: `${4 * k}px ${34 * k}px` },
      }}
    />
  );
};

export const MptVideo: React.FC = () => {
  const audio = { name: NAME, segments: SEGMENTS, starts: STARTS, durations: VO_DURATIONS };
  return (
    <AbsoluteFill style={{ backgroundColor: P.cream }}>
      <BouncePulse>
        {SCENES.map((scene, i) => (
          <Sequence key={i} from={sceneStart[i]} durationInFrames={sceneEnd[i] - sceneStart[i]}>
            {scene()}
          </Sequence>
        ))}
      </BouncePulse>
      <CircleWipe />
      <CuteCaptions />
      <MusicBed {...audio} open={0.38} underVoice={0.15} />
      <Narration {...audio} />
    </AbsoluteFill>
  );
};
