"""Đọc văn bản bằng VieNeu-TTS (chạy local trên CPU).

Nhận file JSON [{"text": ..., "out": ...}], tải model một lần rồi ghi từng file wav.
    .venv-tts/Scripts/python scripts/vieneu_tts.py --voice "Hải Đăng" --jobs jobs.json
"""

import argparse
import json
import sys
import time

from vieneu import Vieneu


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--voice", default="Hải Đăng")
    parser.add_argument("--jobs", help="file JSON chứa danh sách {text, out}")
    parser.add_argument("--temperature", type=float, default=1.0, help="thấp hơn = đọc ổn định hơn")
    parser.add_argument("--list-voices", action="store_true")
    args = parser.parse_args()

    tts = Vieneu()
    if args.list_voices:
        for label, voice_id in tts.list_preset_voices():
            print(f"{label}\t{voice_id}")
        return

    with open(args.jobs, encoding="utf-8-sig") as f:
        jobs = json.load(f)
    for job in jobs:
        start = time.time()
        audio = tts.infer(job["text"], voice=args.voice, temperature=args.temperature)
        tts.save(audio, job["out"])
        seconds = len(audio) / tts.sample_rate
        print(f"{job['out']}: {seconds:.2f}s audio in {time.time() - start:.1f}s", file=sys.stderr, flush=True)


if __name__ == "__main__":
    main()
