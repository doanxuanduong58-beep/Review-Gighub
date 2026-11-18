import React from "react";
import { Composition } from "remotion";
import { BachDangShort, BACHDANG_FRAMES } from "./videos/bachdang/BachDang";
export const Root: React.FC = () => (
  <Composition id="BachDangShort" component={BachDangShort} durationInFrames={BACHDANG_FRAMES} fps={30} width={1080} height={1920} />
);
