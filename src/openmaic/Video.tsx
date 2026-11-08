import { AbsoluteFill, Sequence } from "remotion";
import { MusicBed, Narration } from "../components/audio";
import { Captions } from "../components/fx";
import { BRAND, DURATION_S, FPS, NAME, SEGMENTS, STARTS } from "./data";
import { CLIPS, ClipScene, Cost, Export, Hook, Inputs, Intro, Outline, Outro, Subscribe } from "./scenes";
import VO_DURATIONS from "./vo-durations.json";

const f = (s: number) => Math.round(s * FPS);

// Mỗi cảnh ứng với một đoạn thoại (cảnh i ↔ SEGMENTS[i]).
const SCENES: (() => React.ReactNode)[] = [
  () => <Hook />,
  () => (
    <ClipScene
      seg="p2"
      tag="LỚP HỌC NHIỀU AI"
      title={<>Có thầy, <span style={{ color: BRAND.alt }}>có bạn</span></>}
      clip={CLIPS.discussion}
      pill="Thảo luận cùng bạn học AI"
    />
  ),
  () => <Intro />,
  () => <Inputs />,
  () => <Outline />,
  () => <ClipScene seg="p6" tag="HỌC XONG LÀ KIỂM TRA" title="Chấm điểm ngay" clip={CLIPS.quiz} pill="AI chấm và nhận xét" />,
  () => <ClipScene seg="p7" tag="KHÓ HIỂU? TỰ LÀM THỬ" title="Mô phỏng tương tác" clip={CLIPS.sim} pill="Tự tay làm thí nghiệm" />,
  () => <ClipScene seg="p8" tag="THẦY AI DẪN DẮT" title="Gợi ý đúng lúc" clip={CLIPS.teacher} pill="Chỉ vào chỗ quan trọng" />,
  () => <ClipScene seg="p9" tag="HỌC QUA DỰ ÁN" title="Chọn vai, làm dự án" clip={CLIPS.pbl} pill="Cùng nhóm AI theo từng mốc" />,
  () => <Export />,
  () => <Cost />,
  () => <Outro />,
  () => <Subscribe />,
];

const sceneStart = [0, ...STARTS.slice(1).map(f)];
const sceneEnd = [...sceneStart.slice(1), f(DURATION_S)];

export const OpenMAICVideo: React.FC = () => {
  const audio = { name: NAME, segments: SEGMENTS, starts: STARTS, durations: VO_DURATIONS };
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0D16" }}>
      {SCENES.map((scene, i) => (
        <Sequence key={i} from={sceneStart[i]} durationInFrames={sceneEnd[i] - sceneStart[i]}>
          {scene()}
        </Sequence>
      ))}
      <Captions segments={SEGMENTS.slice(0, -1)} starts={STARTS.slice(0, -1)} durations={VO_DURATIONS} accent={BRAND.main} />
      <MusicBed {...audio} />
      <Narration {...audio} />
    </AbsoluteFill>
  );
};
