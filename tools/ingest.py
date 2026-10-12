"""Importa los dibujos de ~/Desktop/NeoEsparta_kit/dibujos a art/panels (portada -> cover)."""
from pathlib import Path
from PIL import Image
SRC = Path.home() / "Desktop/NeoEsparta_kit/dibujos"
DST = Path(__file__).resolve().parent / "panels"
DST.mkdir(exist_ok=True)
new = []
for f in sorted(SRC.iterdir()):
    if f.suffix.lower() not in (".png", ".jpg", ".jpeg", ".webp") or f.stem.startswith("ficha_"):
        continue
    pid = "cover" if f.stem == "portada" else f.stem
    out = DST / f"{pid}.png"
    if out.exists() and out.stat().st_mtime >= f.stat().st_mtime:
        continue
    Image.open(f).convert("RGB").save(out)
    new.append(str(out))
print("\n".join(new) if new else "sin dibujos nuevos")
