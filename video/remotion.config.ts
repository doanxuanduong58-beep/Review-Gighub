// Phiên cloud không tải được trình duyệt của Remotion (remotion.media bị chặn) -> dùng headless shell có sẵn.
import { Config } from "@remotion/cli/config";

Config.setBrowserExecutable("/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell");
