import { VideoCompositions } from "./components/layout";
import * as aivideo from "./aivideo/data";
import { AiVideo } from "./aivideo/Video";
import * as dify from "./dify/data";
import { DifyVideo } from "./dify/Video";
import * as mpt from "./mpt/data";
import { MptVideo } from "./mpt/Video";

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
      <VideoCompositions
        id={dify.COMPOSITION_ID}
        component={DifyVideo}
        formats={dify.FORMATS}
        durationInFrames={Math.round(dify.DURATION_S * dify.FPS)}
        fps={dify.FPS}
      />
      <VideoCompositions
        id={mpt.COMPOSITION_ID}
        component={MptVideo}
        formats={mpt.FORMATS}
        durationInFrames={Math.round(mpt.DURATION_S * mpt.FPS)}
        fps={mpt.FPS}
      />
    </>
  );
};
