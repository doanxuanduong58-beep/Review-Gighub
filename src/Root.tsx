import { VideoCompositions } from "./components/layout";
import * as eduskills from "./eduskills/data";
import { EduSkillsVideo } from "./eduskills/Video";
import * as openmaic from "./openmaic/data";
import { OpenMAICVideo } from "./openmaic/Video";
import * as pypsa from "./pypsa/data";
import { PyPSAVideo } from "./pypsa/Video";

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
      <VideoCompositions
        id={openmaic.COMPOSITION_ID}
        component={OpenMAICVideo}
        formats={openmaic.FORMATS}
        durationInFrames={Math.round(openmaic.DURATION_S * openmaic.FPS)}
        fps={openmaic.FPS}
      />
      <VideoCompositions
        id={pypsa.COMPOSITION_ID}
        component={PyPSAVideo}
        formats={pypsa.FORMATS}
        durationInFrames={Math.round(pypsa.DURATION_S * pypsa.FPS)}
        fps={pypsa.FPS}
      />
    </>
  );
};
