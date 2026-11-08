import { AbsoluteFill, Sequence } from "remotion";
import { MusicBed, Narration } from "../components/audio";
import { Captions } from "../components/fx";
import { BRAND, DURATION_S, FPS, NAME, SEGMENTS, STARTS } from "./data";
import { Evidence, Excluded, Generic, Hook, Intro, Numbers, Outro, Pile, Schedule, Steps, Subscribe, Uses, Vietnamese } from "./scenes";
import VO_DURATIONS from "./vo-durations.json";

const f = (s: number) => Math.round(s * FPS);

// Mỗi cảnh ứng với một đoạn thoại (cảnh i ↔ SEGMENTS[i]).
const SCENES: (() => React.ReactNode)[] = [
  () => <Hook />,
  () => <Pile />,
  () => <Generic />,
  () => <Intro />,
  () => <Numbers />,
  () => <Uses />,
  () => <Evidence />,
  () => <Excluded />,
  () => <Steps />,
  () => <Vietnamese />,
  () => <Schedule />,
  () => <Outro />,
  () => <Subscribe />,
];

const sceneStart = [0, ...STARTS.slice(1).map(f)];
const sceneEnd = [...sceneStart.slice(1), f(DURATION_S)];

export const EduSkillsVideo: React.FC = () => {
  const audio = { name: NAME, segments: SEGMENTS, starts: STARTS, durations: VO_DURATIONS };
  // Không phụ đề cho câu kêu gọi cuối.
  const capSegs = SEGMENTS.slice(0, -1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0D16" }}>
      {SCENES.map((scene, i) => (
        <Sequence key={i} from={sceneStart[i]} durationInFrames={sceneEnd[i] - sceneStart[i]}>
          {scene()}
        </Sequence>
      ))}
      <Captions segments={capSegs} starts={STARTS.slice(0, -1)} durations={VO_DURATIONS} accent={BRAND.alt} />
      <MusicBed {...audio} />
      <Narration {...audio} />
    </AbsoluteFill>
  );
};
