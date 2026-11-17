// node scripts/stills.mjs <Comp> <outPrefix> <f,f,...> [scale]  — CPU (SwiftShader) stills
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [comp, prefix, frames, scale = "0.5"] = process.argv.slice(2);
const browserExecutable = "/opt/pw-browsers/chromium";
const chromiumOptions = { gl: "swangle" };
const t0 = Date.now();
const serveUrl = await bundle({ entryPoint: path.resolve(process.env.ENTRY || "src/index.ts"), publicDir: path.resolve("public") });
console.log("bundle", ((Date.now() - t0) / 1000).toFixed(1) + "s");
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable, chromiumOptions, timeoutInMilliseconds: 300000 });
const onBrowserLog = (l) => { if (l.type === "error") console.log("[err]", l.text.slice(0, 300)); };
for (const f of frames.split(",").map(Number)) {
  const t = Date.now();
  await renderStill({ composition, serveUrl, frame: f, output: `${prefix}${f}.jpg`, imageFormat: "jpeg", jpegQuality: 88, scale: Number(scale), browserExecutable, chromiumOptions, timeoutInMilliseconds: 600000, onBrowserLog });
  console.log("still", f, ((Date.now() - t) / 1000).toFixed(1) + "s");
}
