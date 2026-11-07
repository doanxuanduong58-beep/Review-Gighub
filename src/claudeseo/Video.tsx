import { AbsoluteFill, Sequence } from "remotion";
import { MusicBed, Narration } from "../components/audio";
import { Bokeh } from "../components/fx";
import { HostBand } from "../components/host";
import { Background } from "../components/ui";
import { BRAND, DURATION_S, FPS, NAME, SEGMENTS, STARTS } from "./data";
import MOUTH from "./mouth.json";
import { AiSearch, Agents, Checks, Hook, HowTo, Install, Intro, Outro, Results, Subscribe } from "./scenes";
import VO_DURATIONS from "./vo-durations.json";

const f = (s: number) => Math.round(s * FPS);

// Cảnh i ↔ SEGMENTS[i]. Hàm thay vì JSX ở cấp module: bundler của Remotion chỉ có `React` khi đang render.
const SCENES: (() => React.ReactNode)[] = [
  () => <Hook />,
  () => <Intro />,
  () => <HowTo />,
  () => <Agents />,
  () => <Checks />,
  () => <AiSearch />,
  () => <Results />,
  () => <Install />,
  () => <Outro />,
  () => <Subscribe />,
];

const sceneStart = [0, ...STARTS.slice(1).map(f)];
const sceneEnd = [...sceneStart.slice(1), f(DURATION_S)];

export const ClaudeSeoVideo: React.FC = () => {
  const audio = { name: NAME, segments: SEGMENTS, starts: STARTS, durations: VO_DURATIONS };
  return (
    <AbsoluteFill>
      {/* Nền chung cho cả video: nội dung đổi ở nửa trên, robot dẫn chuyện cố định ở dải dưới. */}
      <Background accent={BRAND.orange} />
      <Bokeh color={BRAND.orange} />
      {SCENES.map((scene, i) => (
        <Sequence key={i} from={sceneStart[i]} durationInFrames={sceneEnd[i] - sceneStart[i]}>
          {scene()}
        </Sequence>
      ))}
      <HostBand
        segments={SEGMENTS}
        captionSegments={SEGMENTS.slice(0, -1)}
        starts={STARTS}
        durations={VO_DURATIONS}
        mouth={MOUTH}
        accent={BRAND.orange}
        eye={BRAND.green}
      />
      <MusicBed {...audio} />
      <Narration {...audio} />
    </AbsoluteFill>
  );
};
