#!/bin/bash
# per config: 1-frame run (startup) and 9-frame run; marginal = (t9 - t1) / 8
cd /workspace/bachdang-remotion
run() { local P="$1" S="$2"; local a b
  a=$(PROPS="$P" timeout 900 node scripts/clip.mjs BachDangShort out/prof.mp4 100 100 $S 1 2>&1 | grep -oP "^done \K[0-9]+")
  b=$(PROPS="$P" timeout 1500 node scripts/clip.mjs BachDangShort out/prof.mp4 100 108 $S 1 2>&1 | grep -oP "^done \K[0-9]+")
  echo "CFG $P scale=$S t1=$a t9=$b per=$(( (b - a) / 8 ))s"; }
run '{"post":{"msaa":2}}' 1
run '{"post":{"msaa":2,"ink":false}}' 1
run '{"post":{"msaa":2,"lens":false,"bloom":false}}' 1
run '{"post":{"msaa":2,"dpr":0.5}}' 0.5
