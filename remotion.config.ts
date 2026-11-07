// Môi trường cloud chặn remotion.media nên không tải được trình duyệt của Remotion: dùng Chromium có sẵn.
// Bản đầy đủ (không phải chrome-headless-shell) vì nó tin CA của proxy qua kho NSS -> tải được font Google.
import { Config } from "@remotion/cli/config";
import { existsSync } from "node:fs";

const LOCAL = "/opt/pw-browsers/chromium";
if (existsSync(LOCAL)) Config.setBrowserExecutable(LOCAL);
