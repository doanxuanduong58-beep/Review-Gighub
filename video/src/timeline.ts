// pad: giây lặng thêm sau câu (vd để người xem kịp đọc câu lệnh trên màn hình).
export type Segment = { id: string; start: number; max: number; text: string; pad?: number };

const LEAD_S = 0.5;
const GAP_S = 0.35;
const TAIL_S = 0.8;

// Nếu đã có giọng đọc (npm run voiceover ghi vo-durations.json), căn mốc theo độ dài thật;
// nếu chưa, dùng mốc của kịch bản.
export const buildTimeline = (segments: Segment[], durations: Record<string, number>, fallbackDuration: number) => {
  const hasVo = segments.every((s) => durations[s.id]);
  const starts: number[] = [];
  let cursor = LEAD_S;
  for (const seg of segments) {
    starts.push(hasVo ? cursor : seg.start);
    cursor += (durations[seg.id] ?? 0) + GAP_S + (seg.pad ?? 0);
  }
  const duration = hasVo ? Math.ceil((cursor - GAP_S + TAIL_S) * 10) / 10 : fallbackDuration;
  // beat(id, 0.4) = frame trong cảnh của câu `id` lúc đã đọc được 40% — đặt mốc animation theo nhịp lời
  // thay vì số frame cố định (giọng nhanh/chậm thì mốc tự co giãn theo).
  const beat = (id: string, frac: number, fps = 30) => {
    const seg = segments.find((s) => s.id === id);
    const d = durations[id] ?? seg?.max ?? 3;
    return Math.round(d * frac * fps);
  };
  return { starts, duration, beat };
};
