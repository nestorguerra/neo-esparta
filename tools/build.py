"""Genera index.html a partir de src/ y del manifiesto de art3/meta.json.

Uso (desde la raíz del repo):  python3 tools/build.py
"""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
IMPORTMAP = '{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}'


def main():
    meta = json.loads((ROOT / "art3" / "meta.json").read_text())
    art = {k: [v["w"], v["h"], v["pad"], 1 if v["layered"] else 0] for k, v in sorted(meta.items())}
    page = (SRC / "page.html").read_text(encoding="utf-8")
    m = re.match(r"(\s*<title>.*?</title>\s*(?:<link[^>]*>\s*)*<style>.*?</style>)", page, re.S)
    head, body = m.group(1), page[m.end():]
    js = "\n".join((SRC / f).read_text(encoding="utf-8") for f in ["core.js", "kit.js", "story.js", "artmeta.js"])
    js += "\nconst ART = " + json.dumps(art) + ";\n" + (SRC / "app.js").read_text(encoding="utf-8")
    doc = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Cómic web de cinco páginas: Néstor y su hijo Leo contra los monstruos de la Grieta. Cada viñeta es un diorama 3D que se puede girar.">
<meta property="og:title" content="NEO·ESPARTA · Nº 1: La Grieta">
<meta property="og:description" content="Néstor y Leo contra la Grieta. Un cómic de 50 viñetas dibujadas con IA y montadas como dioramas 3D.">
<meta property="og:image" content="art3/cover_b.webp">
{head.strip()}
<style>:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}body{{margin:0}}[hidden]{{display:none!important}}</style>
</head>
<body>
{body.strip()}
<script type="importmap">{IMPORTMAP}</script>
<script type="module">
{js}
</script>
</body>
</html>
"""
    (ROOT / "index.html").write_text(doc, encoding="utf-8")
    print("index.html", len(doc), "bytes,", len(art), "viñetas con dibujo")


if __name__ == "__main__":
    main()
