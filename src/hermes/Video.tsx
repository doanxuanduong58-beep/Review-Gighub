import { AbsoluteFill, Sequence } from "remotion";
import { MusicBed, Narration } from "../components/audio";
import { Captions } from "../components/fx";
import { SubscribeScene } from "../components/subscribe";
import { BRAND, DURATION_S, FPS, NAME, SEGMENTS, STARTS, beat } from "./data";
import { CHANNELS_FEATURE, CRON_FEATURE, FeatureScene, Hook, INSTALL_FEATURE, Intro, LearningLoop, Memory, Outro, RunAnywhere } from "./scenes";
import VO_DURATIONS from "./vo-durations.json";

const f = (s: number) => Math.round(s * FPS);

// Cảnh i ↔ SEGMENTS[i]. Hàm thay vì JSX ở cấp module: bundler của Remotion chỉ có `React` khi đang render.
const SCENES: (() => React.ReactNode)[] = [
  () => <Hook />,
  () => <Intro />,
  () => <LearningLoop />,
  () => <Memory />,
  () => <FeatureScene feature={CHANNELS_FEATURE} />,
  () => <FeatureScene feature={CRON_FEATURE} />,
  () => <RunAnywhere />,
  () => <FeatureScene feature={INSTALL_FEATURE} />,
  () => <Outro />,
  () => <SubscribeScene question={"Bạn muốn giao cho Hermes\nviệc gì đầu tiên?"} accent={BRAND.gold} btnAt={beat("p10", 0.15)} />,
];

const sceneStart = [0, ...STARTS.slice(1).map(f)];
const sceneEnd = [...sceneStart.slice(1), f(DURATION_S)];

export const HermesVideo: React.FC = () => {
  const audio = { name: NAME, segments: SEGMENTS, starts: STARTS, durations: VO_DURATIONS };
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0D16" }}>
      {SCENES.map((scene, i) => (
        <Sequence key={i} from={sceneStart[i]} durationInFrames={sceneEnd[i] - sceneStart[i]}>
          {scene()}
        </Sequence>
      ))}
      <Captions segments={SEGMENTS.slice(0, -1)} starts={STARTS.slice(0, -1)} durations={VO_DURATIONS} accent={BRAND.gold} />
      <MusicBed {...audio} />
      <Narration {...audio} />
    </AbsoluteFill>
  );
};
