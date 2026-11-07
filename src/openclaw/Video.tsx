import { AbsoluteFill, Sequence } from "remotion";
import { MusicBed, Narration } from "../components/audio";
import { Captions } from "../components/fx";
import { SubscribeScene } from "../components/subscribe";
import { BRAND, DURATION_S, FPS, NAME, SEGMENTS, STARTS, beat } from "./data";
import { CHANNELS_FEATURE, FeatureScene, Hook, INSTALL_FEATURE, Intro, License, MODELS_FEATURE, Outro, Plugins, Privacy } from "./scenes";
import VO_DURATIONS from "./vo-durations.json";

const f = (s: number) => Math.round(s * FPS);

// Cảnh i ↔ SEGMENTS[i]. Hàm thay vì JSX ở cấp module: bundler của Remotion chỉ có `React` khi đang render.
const SCENES: (() => React.ReactNode)[] = [
  () => <Hook />,
  () => <Intro />,
  () => <FeatureScene feature={CHANNELS_FEATURE} />,
  () => <Privacy />,
  () => <FeatureScene feature={MODELS_FEATURE} />,
  () => <Plugins />,
  () => <FeatureScene feature={INSTALL_FEATURE} />,
  () => <License />,
  () => <Outro />,
  () => <SubscribeScene question={"Bạn muốn trợ lý chạy\ntrên app chat nào?"} accent={BRAND.red} btnAt={beat("p10", 0.15)} />,
];

const sceneStart = [0, ...STARTS.slice(1).map(f)];
const sceneEnd = [...sceneStart.slice(1), f(DURATION_S)];

export const OpenClawVideo: React.FC = () => {
  const audio = { name: NAME, segments: SEGMENTS, starts: STARTS, durations: VO_DURATIONS };
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0D16" }}>
      {SCENES.map((scene, i) => (
        <Sequence key={i} from={sceneStart[i]} durationInFrames={sceneEnd[i] - sceneStart[i]}>
          {scene()}
        </Sequence>
      ))}
      <Captions segments={SEGMENTS.slice(0, -1)} starts={STARTS.slice(0, -1)} durations={VO_DURATIONS} accent={BRAND.red} />
      <MusicBed {...audio} />
      <Narration {...audio} />
    </AbsoluteFill>
  );
};
