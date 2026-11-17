#!/bin/bash
# frames 100-111: 12 frames per config; first frames include world build
cd /workspace/bachdang-remotion
for P in '{"post":{"msaa":0}}' '{"post":{"msaa":0,"ink":false}}' '{"post":{"msaa":0,"lens":false,"bloom":false}}' '{"post":{"msaa":0,"ink":false,"lens":false,"bloom":false,"grade":false}}'; do
  PROPS="$P" timeout 900 node scripts/clip.mjs BachDangShort out/prof.mp4 100 111 1 1 2>&1 | grep -E "^(6|12|done)"
done
