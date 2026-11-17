// node scripts/clip.mjs <Comp> <out.mp4> <from> <to> [scale] [concurrency]
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [comp, out, from, to, scale = "1", conc = "2"] = process.argv.slice(2);
const browserExecutable = "/opt/pw-browsers/chromium";
const chromiumOptions = { gl: "swangle" };
const serveUrl = await bundle({ entryPoint: path.resolve(process.env.ENTRY || "src/index.ts"), publicDir: path.resolve("public") });
const inputProps = process.env.PROPS ? JSON.parse(process.env.PROPS) : {};
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable, chromiumOptions, timeoutInMilliseconds: 600000, inputProps });
const t0 = Date.now(); let last = 0;
await renderMedia({ composition, serveUrl, codec: "h264", crf: 16, outputLocation: out, frameRange: [Number(from), Number(to)], scale: Number(scale),
  concurrency: Number(conc), inputProps, browserExecutable, chromiumOptions, timeoutInMilliseconds: 900000, muted: true,
  onProgress: ({ renderedFrames }) => { if (renderedFrames - last >= 5) { last = renderedFrames; console.log(renderedFrames, ((Date.now() - t0) / 1000).toFixed(0) + "s"); } } });
console.log("done", ((Date.now() - t0) / 1000).toFixed(0) + "s", process.env.PROPS || "");
