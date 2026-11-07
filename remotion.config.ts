// Môi trường cloud chặn remotion.media: dùng chrome-headless-shell có sẵn trên máy.
import { Config } from "@remotion/cli/config";
import { existsSync } from "node:fs";

const LOCAL = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
if (existsSync(LOCAL)) Config.setBrowserExecutable(LOCAL);
