import { Audio, Sequence, getStaticFiles, interpolate, staticFile, useVideoConfig } from "remotion";
import type { Segment } from "../timeline";

// Quy ước file: public/<name>/vo/<segment id>.mp3 và public/<name>/music.mp3
// (do `npm run voiceover -- <name>` và `npm run music -- <name>` tạo ra).

type Props = { name: string; segments: Segment[]; starts: number[]; durations: Record<string, number> };

/** Phát từng đoạn giọng đọc đúng mốc thời gian. Đoạn nào chưa có file thì bỏ qua. */
export const Narration: React.FC<Props> = ({ name, segments, starts }) => {
  const { fps } = useVideoConfig();
  const available = new Set(getStaticFiles().map((file) => file.name));
  return (
    <>
      {segments.map((seg, i) => {
        const file = `${name}/vo/${seg.id}.mp3`;
        if (!available.has(file)) return null;
        return (
          <Sequence key={seg.id} from={Math.round(starts[i] * fps)}>
            <Audio src={staticFile(file)} />
          </Sequence>
        );
      })}
    </>
  );
};

// Nhạc nền: to khi không có lời, nhỏ ~15 dB dưới giọng đọc khi có lời.
// Khoảng nghỉ ngắn giữa các câu (< MERGE_GAP_S) giữ mức nhỏ để nhạc không nhấp nhô.
const MUSIC_OPEN = 0.3;
const MUSIC_UNDER_VOICE = 0.09;
const MERGE_GAP_S = 1;
const RAMP = 8;

/** Nhạc nền tự giảm âm lượng (ducking) khi có giọng đọc. */
export const MusicBed: React.FC<Props & { open?: number; underVoice?: number }> = ({
  name,
  segments,
  starts,
  durations,
  open = MUSIC_OPEN,
  underVoice = MUSIC_UNDER_VOICE,
}) => {
  const { fps } = useVideoConfig();
  const file = `${name}/music.mp3`;
  if (!getStaticFiles().some((f) => f.name === file)) return null;

  const f = (s: number) => Math.round(s * fps);
  const speech = segments.reduce<[number, number][]>((ranges, seg, i) => {
    const d = durations[seg.id];
    if (!d) return ranges;
    const range: [number, number] = [f(starts[i]), f(starts[i] + d)];
    const last = ranges[ranges.length - 1];
    if (last && range[0] - last[1] < f(MERGE_GAP_S)) last[1] = range[1];
    else ranges.push(range);
    return ranges;
  }, []);

  const volume = (frame: number) => {
    // 1 = đang có lời, 0 = không; chuyển mượt trong RAMP frame.
    const duck = Math.max(
      0,
      ...speech.map(([a, b]) =>
        interpolate(frame, [a - RAMP, a, b, b + RAMP], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      ),
    );
    return open + (underVoice - open) * duck;
  };

  return <Audio src={staticFile(file)} volume={volume} />;
};
