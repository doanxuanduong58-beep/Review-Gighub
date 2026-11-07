import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { MusicBed, Narration } from "../components/audio";
import { Captions } from "../components/fx";
import { SubscribeScene } from "../components/subscribe";
import { BRAND, DURATION_S, FPS, NAME, SEGMENTS, STARTS, beat } from "./data";
import { Effects, Flow, Hook, Music, Outro, Prompt, Release, Repo, Voice } from "./scenes";
import VO_DURATIONS from "./vo-durations.json";

const f = (s: number) => Math.round(s * FPS);

// Cảnh i ↔ SEGMENTS[i]. Hàm thay vì JSX ở cấp module (bundler của Remotion chỉ có React khi render).
const SCENES: (() => React.ReactNode)[] = [
  () => <Hook />,
  () => <Repo />,
  () => <Prompt />,
  () => <Flow />,
  () => <Voice />,
  () => <Music />,
  () => <Effects />,
  () => <Release />,
  () => <Outro />,
  () => <SubscribeScene question={"Bạn muốn AI làm\nvideo về chủ đề gì?"} accent={BRAND.orange} btnAt={beat("p10", 0.25)} />,
];

const sceneStart = [0, ...STARTS.slice(1).map(f)];
const sceneEnd = [...sceneStart.slice(1), f(DURATION_S)];

// Nhạc 140 BPM, trống vào sau nửa ô nhịp: cả khung "đập" nhẹ theo mỗi phách cho cảm giác nhanh, mạnh.
const BEAT_F = (60 / 140) * FPS;
const DRUMS_IN = BEAT_F * 2;

const BeatPunch: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const ph = ((frame % BEAT_F) + BEAT_F) % BEAT_F / BEAT_F;
  const amt = frame < DRUMS_IN ? 0 : Math.exp(-ph * 7);
  return <AbsoluteFill style={{ transform: `scale(${1 + 0.012 * amt})` }}>{children}</AbsoluteFill>;
};

// Chớp sáng + trượt nhanh ở mỗi lần chuyển cảnh.
const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = Math.max(
    0,
    ...sceneStart.slice(1).map((s) => interpolate(frame, [s - 1, s, s + 5], [0, 0.55, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })),
  );
  return <AbsoluteFill style={{ background: "#FFF6E0", opacity: o, pointerEvents: "none" }} />;
};

export const AiVideo: React.FC = () => {
  const audio = { name: NAME, segments: SEGMENTS, starts: STARTS, durations: VO_DURATIONS };
  // Không phụ đề cho câu kêu gọi cuối (đã có chữ to trên màn hình).
  const capSegs = SEGMENTS.slice(0, -1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0D16" }}>
      <BeatPunch>
        {SCENES.map((scene, i) => (
          <Sequence key={i} from={sceneStart[i]} durationInFrames={sceneEnd[i] - sceneStart[i]}>
            {scene()}
          </Sequence>
        ))}
      </BeatPunch>
      <CutFlash />
      <Captions segments={capSegs} starts={STARTS.slice(0, -1)} durations={VO_DURATIONS} accent={BRAND.orange} />
      {/* Nhạc mạnh: dưới lời chỉ giảm ~7 dB thay vì ~15 dB mặc định. */}
      <MusicBed {...audio} open={0.42} underVoice={0.19} />
      <Narration {...audio} />
    </AbsoluteFill>
  );
};
