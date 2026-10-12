"""Genera fichas y viñetas con la API de imágenes de OpenAI.

La clave se lee de ~/.config/neo-esparta/openai_key y nunca se imprime.
Uso:
  python gen.py --only nestor_sheet,leo_sheet,style
  python gen.py --dir panels --jobs 3
"""
import argparse, base64, concurrent.futures as cf, json, os, sys, time
from pathlib import Path
import requests
from prompts import jobs

ROOT = Path(__file__).resolve().parent
KEY_FILE = Path.home() / ".config/neo-esparta/openai_key"
MODELS = [m for m in os.environ.get("NE_MODELS", "gpt-image-1.5,gpt-image-1").split(",") if m]
API = "https://api.openai.com/v1/images"
LOG = ROOT / "log.jsonl"


def key():
    if not KEY_FILE.exists():
        sys.exit("Falta la clave: guarda tu clave de OpenAI en ~/.config/neo-esparta/openai_key")
    return KEY_FILE.read_text().strip()


def post(model, job, quality, fidelity=True):
    h = {"Authorization": f"Bearer {key()}"}
    refs = [ROOT / r for r in job["refs"] if (ROOT / r).exists()]
    if refs:
        data = {"model": model, "prompt": job["prompt"], "size": job["size"], "quality": quality, "n": "1", "output_format": "png"}
        if fidelity:
            data["input_fidelity"] = "high"
        files = [("image[]", (p.name, p.open("rb"), "image/png" if p.suffix == ".png" else "image/jpeg")) for p in refs]
        try:
            return requests.post(f"{API}/edits", headers=h, data=data, files=files, timeout=900)
        finally:
            for _, (_, fh, _) in files:
                fh.close()
    body = {"model": model, "prompt": job["prompt"], "size": job["size"], "quality": quality, "n": 1, "output_format": "png", "moderation": "low"}
    return requests.post(f"{API}/generations", headers=h, json=body, timeout=900)


def run(job, quality, force=False):
    out = ROOT / job["dir"] / f"{job['id']}.png"
    if out.exists() and not force:
        return job["id"], "existe"
    last = ""
    for model in MODELS:
        fidelity = True
        for attempt in range(4):
            t0 = time.time()
            try:
                r = post(model, job, quality, fidelity)
            except requests.RequestException as e:
                last = f"red: {e}"; time.sleep(5 * (attempt + 1)); continue
            if r.status_code == 200:
                d = r.json()
                out.write_bytes(base64.b64decode(d["data"][0]["b64_json"]))
                with LOG.open("a") as f:
                    f.write(json.dumps({"id": job["id"], "model": model, "quality": quality, "secs": round(time.time() - t0), "usage": d.get("usage")}) + "\n")
                return job["id"], f"ok ({model}, {round(time.time() - t0)} s)"
            msg = r.text[:600]
            last = f"{r.status_code}: {msg}"
            low = msg.lower()
            if "input_fidelity" in low and fidelity:
                fidelity = False; continue
            if r.status_code in (400, 404) and "model" in low and ("not" in low or "invalid" in low or "does not exist" in low):
                break  # probar el siguiente modelo
            if r.status_code == 429 or r.status_code >= 500:
                time.sleep(10 * (attempt + 1)); continue
            return job["id"], "ERROR " + last
    return job["id"], "ERROR " + last


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="")
    ap.add_argument("--dir", default="")
    ap.add_argument("--quality", default="high")
    ap.add_argument("--jobs", type=int, default=3)
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    js = jobs()
    if a.only:
        ids = set(a.only.split(","))
        js = [j for j in js if j["id"] in ids]
    if a.dir:
        js = [j for j in js if j["dir"] == a.dir]
    print(f"{len(js)} imágenes, calidad {a.quality}", flush=True)
    with cf.ThreadPoolExecutor(a.jobs) as ex:
        for jid, res in ex.map(lambda j: run(j, a.quality, a.force), js):
            print(f"  {jid}: {res}", flush=True)


if __name__ == "__main__":
    main()
