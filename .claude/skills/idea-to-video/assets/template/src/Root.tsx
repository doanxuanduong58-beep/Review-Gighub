import { Composition } from "remotion";
import { VideoCompositions } from "./components/layout";
import { Placeholder } from "./components/ui";
// import * as myvideo from "./myvideo/data";
// import { MyVideo } from "./myvideo/Video";

// Mỗi video: một <VideoCompositions> -> một composition cho mỗi khổ trong data.FORMATS.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/*
      <VideoCompositions
        id={myvideo.COMPOSITION_ID}
        component={MyVideo}
        formats={myvideo.FORMATS}
        durationInFrames={Math.round(myvideo.DURATION_S * myvideo.FPS)}
        fps={myvideo.FPS}
      />
      */}
      <Composition id="Placeholder" component={Placeholder} durationInFrames={30} fps={30} width={1080} height={1920} />
    </>
  );
};
