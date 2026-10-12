"""Diorama de capas: separa cada dibujo en fondo + figuras (personajes y monstruos).

- Figuras: recorte por saliencia (BiRefNet).
- Fondo: lo que había detrás de las figuras se rellena con LaMa y se añade un margen reflejado.
- Profundidad (Depth Anything V2): R = fondo rellenado, G = figuras.

Para cada art/panels/<id>.png escribe en art/web3/: <id>_b.webp, <id>_f.webp (si hay figuras),
<id>_d.png y una vista previa _mask_<id>.jpg; meta.json resume cada viñeta.
Uso: python layers.py CARPETA_MODELOS [ids...]
"""
import json, sys
from pathlib import Path
import cv2
import numpy as np
import onnxruntime as ort
from PIL import Image

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "web3"; OUT.mkdir(exist_ok=True)
MEAN = np.array([0.485, 0.456, 0.406], np.float32); STD = np.array([0.229, 0.224, 0.225], np.float32)
MAXW = 1536          # lado largo del dibujo publicado
PAD = 0.12           # margen reflejado del fondo (por lado, fracción)
# piezas que el recorte automático pierde (escudo dentro del muro de energía): (cx, cy, rx, ry) normalizados
EXTRA = {'2-3': [(0.465, 0.5, 0.09, 0.19)], '2-5': [(0.57, 0.63, 0.08, 0.14)]}


def depth(sess, rgb):
    h, w = rgb.shape[:2]; s = 728 / min(w, h)
    nw, nh = int(round(w * s / 14)) * 14, int(round(h * s / 14)) * 14
    x = cv2.resize(rgb, (nw, nh), interpolation=cv2.INTER_CUBIC).astype(np.float32) / 255.0
    x = ((x - MEAN) / STD).transpose(2, 0, 1)[None]
    d = sess.run(None, {sess.get_inputs()[0].name: x})[0].squeeze()
    d = cv2.resize(d, (w, h), interpolation=cv2.INTER_CUBIC)
    lo, hi = np.percentile(d, 1), np.percentile(d, 99.5)
    return np.clip((d - lo) / max(1e-6, hi - lo), 0, 1)


def saliency(sess, rgb):
    h, w = rgb.shape[:2]
    x = cv2.resize(rgb, (1024, 1024), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0
    x = ((x - MEAN) / STD).transpose(2, 0, 1)[None]
    y = sess.run(None, {sess.get_inputs()[0].name: x})[0].squeeze()
    y = 1 / (1 + np.exp(-y))
    return cv2.resize(y, (w, h), interpolation=cv2.INTER_LINEAR)


def lama(sess, rgb, hole):
    h, w = rgb.shape[:2]
    x = cv2.resize(rgb, (512, 512), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0
    m = (cv2.resize(hole, (512, 512), interpolation=cv2.INTER_NEAREST) > 0).astype(np.float32)
    out = sess.run(None, {"image": x.transpose(2, 0, 1)[None], "mask": m[None, None]})[0][0].transpose(1, 2, 0)
    if out.max() <= 1.5:
        out = out * 255
    return cv2.resize(np.clip(out, 0, 255).astype(np.uint8), (w, h), interpolation=cv2.INTER_CUBIC)


def process(S, pid):
    im = Image.open(ROOT / "panels" / f"{pid}.png").convert("RGB")
    im.thumbnail((MAXW, MAXW), Image.LANCZOS)
    rgb = np.asarray(im).copy(); h, w = rgb.shape[:2]
    d = depth(S["depth"], rgb)
    sal = saliency(S["sal"], rgb)
    m = (sal > 0.5).astype(np.uint8)
    k = max(3, w // 300) | 1
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((k * 2 + 1, k * 2 + 1), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    keep = np.zeros(n, bool); keep[1:] = st[1:, cv2.CC_STAT_AREA] > m.size * 0.003
    m = keep[lab].astype(np.uint8)
    for cx, cy, rx, ry in EXTRA.get(pid, []):
        cv2.ellipse(m, (int(cx * w), int(cy * h)), (int(rx * w), int(ry * h)), 0, 0, 360, 1, -1)
    grown = np.zeros_like(m)
    if m.any():
        # crecer el recorte con lo que está pegado al personaje y a su misma profundidad (capa, escudo, lanza)
        t_low = float(np.percentile(d[m > 0], 10)) - 0.09
        near = cv2.dilate(m, np.ones((w // 7 | 1, w // 7 | 1), np.uint8))
        cand = ((d >= t_low) & (near > 0)).astype(np.uint8) | m
        n2, lab2, _, _ = cv2.connectedComponentsWithStats(cand, 8)
        ok = np.zeros(n2, bool); ok[np.unique(lab2[m > 0])] = True; ok[0] = False
        m2 = ok[lab2].astype(np.uint8)
        m2 = cv2.morphologyEx(m2, cv2.MORPH_OPEN, np.ones((k, k), np.uint8)) | m
        grown = (m2 & (1 - m)).astype(np.uint8)
        m = m2
    cov = float(m.mean())
    layered = 0.015 < cov < 0.72
    d8 = (d * 255).astype(np.uint8)
    px, py = int(round(w * PAD)), int(round(h * PAD))
    df = np.zeros_like(d8)
    if layered:
        kd = max(5, w // 90)
        hole = cv2.dilate(m, np.ones((kd, kd), np.uint8))
        fill = lama(S["lama"], rgb, hole)
        soft = cv2.GaussianBlur(hole.astype(np.float32), (0, 0), kd * 0.25)[..., None]
        back = (rgb * (1 - soft) + fill * soft).astype(np.uint8)
        sc = 0.5
        db = cv2.inpaint(cv2.resize(d8, None, fx=sc, fy=sc), cv2.resize(hole, None, fx=sc, fy=sc, interpolation=cv2.INTER_NEAREST), 15, cv2.INPAINT_TELEA)
        db = cv2.resize(db, (w, h), interpolation=cv2.INTER_CUBIC)
        fmin = float(np.percentile(d8[m > 0], 15)) if m.any() else 255.0
        db = np.where(hole > 0, np.minimum(db, max(0.0, fmin - 18)), db).astype(np.uint8)
        db = cv2.GaussianBlur(db, (0, 0), w / 300)
        df = cv2.GaussianBlur(d8, (0, 0), w / 600)
        a = np.clip((sal - 0.35) / 0.3, 0, 1) * cv2.dilate(m, np.ones((5, 5), np.uint8))
        a = np.maximum(a, cv2.GaussianBlur(grown.astype(np.float32), (0, 0), 1.2))
        front = np.dstack([rgb, (a * 255).astype(np.uint8)])
        Image.fromarray(front).save(OUT / f"{pid}_f.webp", quality=82, method=4)
    else:
        back = rgb
        db = cv2.GaussianBlur(d8, (0, 0), w / 400)
    back_p = cv2.copyMakeBorder(back, py, py, px, px, cv2.BORDER_REFLECT_101)
    db_p = cv2.copyMakeBorder(db, py, py, px, px, cv2.BORDER_REFLECT_101)
    Image.fromarray(back_p).save(OUT / f"{pid}_b.webp", quality=80, method=4)
    dd = np.dstack([db_p, cv2.copyMakeBorder(df, py, py, px, px, cv2.BORDER_CONSTANT, value=0), np.zeros_like(db_p)])
    Image.fromarray(dd).resize((dd.shape[1] // 2, dd.shape[0] // 2), Image.BILINEAR).save(OUT / f"{pid}_d.png", optimize=True)
    prev = rgb.copy(); prev[m == 0] = (prev[m == 0] * 0.22).astype(np.uint8)
    pv = np.hstack([cv2.resize(prev, (w // 3, h // 3)), cv2.resize(back, (w // 3, h // 3))])
    Image.fromarray(pv).save(OUT / f"_mask_{pid}.jpg", quality=70)
    return {"w": w, "h": h, "pad": PAD, "fg": round(cov, 3), "layered": bool(layered)}


def main():
    md = Path(sys.argv[1])
    S = {k: ort.InferenceSession(str(md / f), providers=["CPUExecutionProvider"]) for k, f in
         [("depth", "depth_v2_base.onnx"), ("sal", "birefnet_lite.onnx"), ("lama", "lama_fp32.onnx")]}
    ids = sys.argv[2:] or sorted(p.stem for p in (ROOT / "panels").glob("*.png"))
    mf = OUT / "meta.json"; meta = json.loads(mf.read_text()) if mf.exists() else {}
    for pid in ids:
        meta[pid] = process(S, pid); print(pid, meta[pid], flush=True)
        mf.write_text(json.dumps(meta, indent=1))


if __name__ == "__main__":
    main()
