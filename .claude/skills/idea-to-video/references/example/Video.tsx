import { AbsoluteFill, Sequence } from "remotion";
import { MusicBed, Narration } from "../components/audio";
import { DURATION_S, FPS, NAME, SEGMENTS, STARTS } from "./data";
import { FEATURES, FeatureScene, Hook, Intro, More, Outro } from "./scenes";
import VO_DURATIONS from "./vo-durations.json";

const f = (s: number) => Math.round(s * FPS);

// Mỗi cảnh ứng với một đoạn thoại; cảnh đổi đúng lúc đoạn tiếp theo bắt đầu.
// Hàm thay vì JSX ở cấp module: bundler của Remotion chỉ có `React` khi đang render.
const SCENES: (() => React.ReactNode)[] = [
  () => <Hook />,
  () => <Intro />,
  ...FEATURES.map((feature) => () => <FeatureScene feature={feature} />),
  () => <More />,
  () => <Outro />,
];

const sceneStart = [0, ...STARTS.slice(1).map(f)];
const sceneEnd = [...sceneStart.slice(1), f(DURATION_S)];

export const VoiceStudioVideo: React.FC = () => {
  const audio = { name: NAME, segments: SEGMENTS, starts: STARTS, durations: VO_DURATIONS };
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0D16" }}>
      {SCENES.map((scene, i) => (
        <Sequence key={i} from={sceneStart[i]} durationInFrames={sceneEnd[i] - sceneStart[i]}>
          {scene()}
        </Sequence>
      ))}
      <MusicBed {...audio} />
      <Narration {...audio} />
    </AbsoluteFill>
  );
};
