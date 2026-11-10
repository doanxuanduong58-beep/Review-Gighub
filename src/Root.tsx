import { VideoCompositions } from "./components/layout";
import * as eduskills from "./eduskills/data";
import { EduSkillsVideo } from "./eduskills/Video";
import * as openmaic from "./openmaic/data";
import { OpenMAICVideo } from "./openmaic/Video";
import * as pypsa from "./pypsa/data";
import { PyPSAVideo } from "./pypsa/Video";
import * as gcompris from "./gcompris/data";
import { GComprisVideo } from "./gcompris/Video";
import * as easyteach from "./easyteach/data";
import { EasyTeachingVideo } from "./easyteach/Video";
import * as k12skills from "./k12skills/data";
import { K12SkillsVideo } from "./k12skills/Video";
import * as pascal from "./pascal/data";
import { PascalVideo } from "./pascal/Video";
import * as opentakeoff from "./opentakeoff/data";
import { OpenTakeoffVideo } from "./opentakeoff/Video";

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
      <VideoCompositions
        id={gcompris.COMPOSITION_ID}
        component={GComprisVideo}
        formats={gcompris.FORMATS}
        durationInFrames={Math.round(gcompris.DURATION_S * gcompris.FPS)}
        fps={gcompris.FPS}
      />
      <VideoCompositions
        id={easyteach.COMPOSITION_ID}
        component={EasyTeachingVideo}
        formats={easyteach.FORMATS}
        durationInFrames={Math.round(easyteach.DURATION_S * easyteach.FPS)}
        fps={easyteach.FPS}
      />
      <VideoCompositions
        id={k12skills.COMPOSITION_ID}
        component={K12SkillsVideo}
        formats={k12skills.FORMATS}
        durationInFrames={Math.round(k12skills.DURATION_S * k12skills.FPS)}
        fps={k12skills.FPS}
      />
      <VideoCompositions
        id={pascal.COMPOSITION_ID}
        component={PascalVideo}
        formats={pascal.FORMATS}
        durationInFrames={Math.round(pascal.DURATION_S * pascal.FPS)}
        fps={pascal.FPS}
      />
      <VideoCompositions
        id={opentakeoff.COMPOSITION_ID}
        component={OpenTakeoffVideo}
        formats={opentakeoff.FORMATS}
        durationInFrames={Math.round(opentakeoff.DURATION_S * opentakeoff.FPS)}
        fps={opentakeoff.FPS}
      />
    </>
  );
};
