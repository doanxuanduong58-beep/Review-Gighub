import { VideoCompositions } from "./components/layout";
import * as eduskills from "./eduskills/data";
import { EduSkillsVideo } from "./eduskills/Video";

// Mỗi video: một <VideoCompositions> -> một composition cho mỗi khổ trong data.FORMATS.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <VideoCompositions
        id={eduskills.COMPOSITION_ID}
        component={EduSkillsVideo}
        formats={eduskills.FORMATS}
        durationInFrames={Math.round(eduskills.DURATION_S * eduskills.FPS)}
        fps={eduskills.FPS}
      />
    </>
  );
};
