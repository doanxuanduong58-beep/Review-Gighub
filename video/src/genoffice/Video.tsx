import { AbsoluteFill, Sequence } from "remotion";
import { MusicBed, Narration } from "../components/audio";
import { Captions } from "../components/fx";
import { SubscribeScene } from "../components/subscribe";
import { BRAND, DURATION_S, FPS, NAME, SEGMENTS, STARTS, beat } from "./data";
import { CLI_FEATURE, FEATURES, FeatureScene, Hook, Intro, Local, Outro } from "./scenes";
import VO_DURATIONS from "./vo-durations.json";

const f = (s: number) => Math.round(s * FPS);

// Mỗi cảnh ứng với một đoạn thoại; cảnh đổi đúng lúc đoạn tiếp theo bắt đầu.
// Hàm thay vì JSX ở cấp module: bundler của Remotion chỉ có `React` khi đang render.
const SCENES: (() => React.ReactNode)[] = [
  () => <Hook />,
  () => <Intro />,
  ...FEATURES.map((feature) => () => <FeatureScene feature={feature} />),
  () => <Local />,
  () => <FeatureScene feature={CLI_FEATURE} />,
  () => <Outro />,
  () => (
    <SubscribeScene
      question={"Bạn muốn AI sửa\nWord, Excel hay slide?"}
      accent={BRAND.violet}
      btnAt={beat("p11", 0.35)}
      label="🔔 Theo dõi kênh"
    />
  ),
];

const sceneStart = [0, ...STARTS.slice(1).map(f)];
const sceneEnd = [...sceneStart.slice(1), f(DURATION_S)];

export const GenOfficeVideo: React.FC = () => {
  const audio = { name: NAME, segments: SEGMENTS, starts: STARTS, durations: VO_DURATIONS };
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0D16" }}>
      {SCENES.map((scene, i) => (
        <Sequence key={i} from={sceneStart[i]} durationInFrames={sceneEnd[i] - sceneStart[i]}>
          {scene()}
        </Sequence>
      ))}
      {/* Phụ đề cho mọi câu trừ câu kêu gọi cuối. */}
      <Captions segments={SEGMENTS.slice(0, -1)} starts={STARTS.slice(0, -1)} durations={VO_DURATIONS} accent={BRAND.violet} />
      <MusicBed {...audio} />
      <Narration {...audio} />
    </AbsoluteFill>
  );
};
