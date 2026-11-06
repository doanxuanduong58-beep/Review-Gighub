import { VideoCompositions } from "./components/layout";
import * as genoffice from "./genoffice/data";
import { GenOfficeVideo } from "./genoffice/Video";

// Mỗi video: một <VideoCompositions> -> một composition cho mỗi khổ trong data.FORMATS.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <VideoCompositions
        id={genoffice.COMPOSITION_ID}
        component={GenOfficeVideo}
        formats={genoffice.FORMATS}
        durationInFrames={Math.round(genoffice.DURATION_S * genoffice.FPS)}
        fps={genoffice.FPS}
      />
    </>
  );
};
