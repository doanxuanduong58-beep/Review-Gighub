import { VideoCompositions } from "./components/layout";
import * as openclaw from "./openclaw/data";
import { OpenClawVideo } from "./openclaw/Video";

// Mỗi video: một <VideoCompositions> -> một composition cho mỗi khổ trong data.FORMATS.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <VideoCompositions
        id={openclaw.COMPOSITION_ID}
        component={OpenClawVideo}
        formats={openclaw.FORMATS}
        durationInFrames={Math.round(openclaw.DURATION_S * openclaw.FPS)}
        fps={openclaw.FPS}
      />
    </>
  );
};
