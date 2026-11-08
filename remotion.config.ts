// Môi trường cloud: không tải được Chrome Headless Shell của Remotion, và bản headless shell không tin CA của proxy
// (lỗi tải font Google). Dùng Chromium đầy đủ cài sẵn — đọc được kho chứng chỉ NSS đã cấu hình.
import { Config } from "@remotion/cli/config";

Config.setBrowserExecutable("/opt/pw-browsers/chromium-1243/chrome-linux64/chrome");
