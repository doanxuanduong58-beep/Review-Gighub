import { VideoCompositions } from "./components/layout";
import * as genoffice from "./genoffice/data";
import { GenOfficeVideo } from "./genoffice/Video";
import * as wordmcp from "./wordmcp/data";
import { WordMcpVideo } from "./wordmcp/Video";
import * as kitviet from "./kitviet/data";
import { KitVietVideo } from "./kitviet/Video";

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
      <VideoCompositions
        id={wordmcp.COMPOSITION_ID}
        component={WordMcpVideo}
        formats={wordmcp.FORMATS}
        durationInFrames={Math.round(wordmcp.DURATION_S * wordmcp.FPS)}
        fps={wordmcp.FPS}
      />
      <VideoCompositions
        id={kitviet.COMPOSITION_ID}
        component={KitVietVideo}
        formats={kitviet.FORMATS}
        durationInFrames={Math.round(kitviet.DURATION_S * kitviet.FPS)}
        fps={kitviet.FPS}
      />
    </>
  );
};
