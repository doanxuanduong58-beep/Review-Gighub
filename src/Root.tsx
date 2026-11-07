import { VideoCompositions } from "./components/layout";
import * as aivideo from "./aivideo/data";
import { AiVideo } from "./aivideo/Video";

// Mỗi video: một <VideoCompositions> -> một composition cho mỗi khổ trong data.FORMATS.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <VideoCompositions
        id={aivideo.COMPOSITION_ID}
        component={AiVideo}
        formats={aivideo.FORMATS}
        durationInFrames={Math.round(aivideo.DURATION_S * aivideo.FPS)}
        fps={aivideo.FPS}
      />
    </>
  );
};
