#!/usr/bin/env python3
"""Shrink original photos/GIFs into web-ready WebP files.

    python tools/optimize-images.py <source-folder> <name> [max-width]

Every image in <source-folder> is written to assets/img/<name>/<file>.webp
(max-width defaults to 1600px; GIFs become animated WebP at 640px).
Then reference the files from data/projects.json, e.g.
"assets/img/<name>/photo.webp". Needs: pip install pillow
"""
import os
import sys
from PIL import Image, ImageSequence

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXTS = (".jpg", ".jpeg", ".png", ".gif", ".webp", ".tif", ".tiff", ".bmp")


def resize(im, max_w):
    if im.width <= max_w:
        return im
    return im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)


def convert(src, out, max_w):
    im = Image.open(src)
    if src.lower().endswith(".gif") and getattr(im, "n_frames", 1) > 1:
        step = 2 if im.n_frames > 120 else 1  # thin out very long captures
        frames, durations = [], []
        for i, frame in enumerate(ImageSequence.Iterator(im)):
            if i % step:
                continue
            frames.append(resize(frame.convert("RGBA"), min(max_w, 640)))
            durations.append(frame.info.get("duration", 60) * step)
        frames[0].save(out, save_all=True, append_images=frames[1:], duration=durations,
                       loop=0, quality=55, method=4)
    else:
        im = resize(im if im.mode in ("RGB", "RGBA") else im.convert("RGBA" if "A" in im.mode or im.mode == "P" else "RGB"), max_w)
        im.save(out, quality=82, method=5)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    folder, name = sys.argv[1], sys.argv[2]
    max_w = int(sys.argv[3]) if len(sys.argv) > 3 else 1600
    dest = os.path.join(ROOT, "assets", "img", name)
    os.makedirs(dest, exist_ok=True)
    for f in sorted(os.listdir(folder)):
        if not f.lower().endswith(EXTS):
            continue
        out = os.path.join(dest, os.path.splitext(f)[0] + ".webp")
        convert(os.path.join(folder, f), out, max_w)
        print(f"{out}: {os.path.getsize(out) // 1024} KB")
