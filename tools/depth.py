"""Mapas de profundidad (Depth Anything V2) y versiones web de cada viñeta.

Para cada art/panels/<id>.png escribe:
  art/web/<id>.webp        dibujo comprimido (máx. 1536 px)
  art/web/<id>_d.png       profundidad 8 bits, cerca = blanco (máx. 768 px)
"""
import sys
from pathlib import Path
import numpy as np
import onnxruntime as ort
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent
MODEL = Path(sys.argv[1]) if len(sys.argv) > 1 else None
MEAN = np.array([0.485, 0.456, 0.406], np.float32)
STD = np.array([0.229, 0.224, 0.225], np.float32)


def infer(sess, im):
    w, h = im.size
    s = 518 / min(w, h)
    nw, nh = int(round(w * s / 14)) * 14, int(round(h * s / 14)) * 14
    x = np.asarray(im.convert("RGB").resize((nw, nh), Image.BICUBIC), np.float32) / 255.0
    x = ((x - MEAN) / STD).transpose(2, 0, 1)[None]
    name = sess.get_inputs()[0].name
    d = sess.run(None, {name: x})[0].squeeze()
    d = (d - d.min()) / max(1e-6, d.max() - d.min())
    return d


def main():
    sess = ort.InferenceSession(str(MODEL), providers=["CPUExecutionProvider"])
    srcs = sys.argv[2:] or sorted(str(p) for p in (ROOT / "panels").glob("*.png"))
    out = ROOT / "web"; out.mkdir(exist_ok=True)
    for sp in srcs:
        sp = Path(sp); pid = sp.stem
        im = Image.open(sp).convert("RGB")
        d = infer(sess, im)
        dm = Image.fromarray((d * 255).astype(np.uint8)).resize(im.size, Image.BICUBIC)
        dm = dm.filter(ImageFilter.GaussianBlur(radius=max(2, im.width // 400)))
        dm.thumbnail((768, 768)); dm.save(out / f"{pid}_d.png", optimize=True)
        web = im.copy(); web.thumbnail((1536, 1536)); web.save(out / f"{pid}.webp", quality=84, method=6)
        print(pid, im.size, "ok", flush=True)


if __name__ == "__main__":
    main()
