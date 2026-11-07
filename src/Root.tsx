import { VideoCompositions } from "./components/layout";
import * as openclaw from "./openclaw/data";
import { OpenClawVideo } from "./openclaw/Video";
import * as hermes from "./hermes/data";
import { HermesVideo } from "./hermes/Video";
import * as claudeseo from "./claudeseo/data";
import { ClaudeSeoVideo } from "./claudeseo/Video";

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
      <VideoCompositions
        id={hermes.COMPOSITION_ID}
        component={HermesVideo}
        formats={hermes.FORMATS}
        durationInFrames={Math.round(hermes.DURATION_S * hermes.FPS)}
        fps={hermes.FPS}
      />
      <VideoCompositions
        id={claudeseo.COMPOSITION_ID}
        component={ClaudeSeoVideo}
        formats={claudeseo.FORMATS}
        durationInFrames={Math.round(claudeseo.DURATION_S * claudeseo.FPS)}
        fps={claudeseo.FPS}
      />
    </>
  );
};
