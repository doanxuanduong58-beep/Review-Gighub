import { AbsoluteFill, Sequence } from "remotion";
import { MusicBed, Narration } from "../components/audio";
import { Captions } from "../components/fx";
import { SubscribeScene } from "../components/subscribe";
import { BRAND, DURATION_S, FPS, NAME, SEGMENTS, STARTS, beat } from "./data";
import { ADMIN, EXAMPLE, FeatureScene, Flow, GUARD, Hook, Intro, Jobs, Outro, Platforms } from "./scenes";
import VO_DURATIONS from "./vo-durations.json";

const f = (s: number) => Math.round(s * FPS);

// Mỗi cảnh ứng với một đoạn thoại; hàm thay vì JSX ở cấp module.
const SCENES: (() => React.ReactNode)[] = [
  () => <Hook />,
  () => <Intro />,
  () => <Jobs />,
  () => <FeatureScene feature={ADMIN} />,
  () => <FeatureScene feature={EXAMPLE} />,
  () => <Flow />,
  () => <FeatureScene feature={GUARD} />,
  () => <Platforms />,
  () => <Outro />,
  () => (
    <SubscribeScene
      question={"Bạn làm nghề gì?\nMuốn AI giúp việc nào?"}
      accent={BRAND.red}
      btnAt={beat("p10", 0.35)}
      label="🔔 Theo dõi kênh"
    />
  ),
];

const sceneStart = [0, ...STARTS.slice(1).map(f)];
const sceneEnd = [...sceneStart.slice(1), f(DURATION_S)];

export const KitVietVideo: React.FC = () => {
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
