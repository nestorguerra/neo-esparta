"""Crea el kit para generar los dibujos a mano en ChatGPT (~/Desktop/NeoEsparta_kit)."""
import html, json, re, shutil
from pathlib import Path
from prompts import PANELS, NESTOR, LEO, MON, CITY, SAFE, STYLE, CLOSE

ROOT = Path(__file__).resolve().parent
KIT = Path.home() / "Desktop/NeoEsparta_kit"
REFS = {
    "nestor_cara_1.jpg": "ref/nestor_face_1.jpg", "nestor_cara_2.jpg": "ref/nestor_face_2.jpg",
    "nestor_cuerpo.jpg": "ref/nestor_3.jpg", "nestor_oficina.jpg": "ref/nestor_4.jpg",
    "leo_cara_1.jpg": "ref/leo_face_1.jpg", "leo_cara_2.jpg": "ref/leo_face_2.jpg",
    "leo_cuerpo_1.jpg": "ref/leo_1.jpg", "leo_cuerpo_2.jpg": "ref/leo_2.jpg",
}
story = (ROOT.parent / "src/story.js").read_text()
ES = {m.group(1): (m.group(2), m.group(3)) for m in re.finditer(r"id: '([^']+)'.*?shot: '([^']+)',\s*desc: '([^']+)'", story, re.S)}
PAGE_TITLES = ["La Grieta", "El Muro", "El Coloso", "El Estadio", "Golazo"]


def fmt(ar):
    if ar >= 1.2: return "Landscape 3:2 image.", "Horizontal 3:2"
    if ar <= 0.8: return "Portrait 2:3 image.", "Vertical 2:3"
    return "Square 1:1 image.", "Cuadrado 1:1"


def fname(pid):
    return "portada" if pid == "cover" else pid


def attachments(pid, who):
    a = []
    if "N" in who: a.append("dibujos/ficha_nestor.png")
    if "L" in who: a.append("dibujos/ficha_leo.png")
    if pid in CLOSE:
        if "N" in who: a += ["referencias/nestor_cara_1.jpg", "referencias/nestor_cara_2.jpg"]
        if "L" in who: a += ["referencias/leo_cara_1.jpg", "referencias/leo_cara_2.jpg"]
    if not a and pid != "1-1": a.append("dibujos/1-1.png")
    return a


def chat_prompt(pid, ar, who, mons, scene):
    f_en, _ = fmt(ar)
    p = [f_en]
    att = []
    if "N" in who: att.append("the attached character sheet of NÉSTOR")
    if "L" in who: att.append("the attached character sheet of LEO")
    if att:
        extra = " and the attached photos of the real face" if pid in CLOSE else ""
        p.append("Use " + " and ".join(att) + extra + " as the exact reference for faces, hair, beard and costumes; keep them identical.")
    elif pid != "1-1":
        p.append("Match the art style of the attached reference panel exactly (do not copy its composition or content).")
    p.append("Comic panel: " + scene)
    if "N" in who: p.append(NESTOR)
    if "L" in who: p.append(LEO)
    for m in mons: p.append(MON[m])
    p.append(CITY)
    if ar >= 3.0: p.append(SAFE["strip"])
    elif ar >= 2.0: p.append(SAFE["wide"])
    p.append(STYLE)
    return " ".join(p)


def sheet_prompt(who):
    if who == "N":
        return ("Landscape 3:2 image. Character model sheet for a graphic novel, based on the real man in the attached photos: keep his face clearly "
                "recognizable (same face shape, nose, eyes, beard and hairline). Show the SAME character four times on a plain dark sepia paper "
                "background: a large head-and-shoulders portrait on the left, then full-body front view, three-quarter view and back view. "
                + NESTOR + " " + STYLE)
    return ("Landscape 3:2 image. Character model sheet for a graphic novel, based on the real boy in the attached photos: keep his face clearly "
            "recognizable (same face shape, nose, eyes, eyebrows and hair). Show the SAME character four times on a plain dark sepia paper "
            "background: a large head-and-shoulders portrait on the left, then full-body front view, three-quarter view and back view. "
            + LEO + " " + STYLE)


def card(item):
    chips = "".join(
        f'<figure class="chip"><img src="{html.escape(a)}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{{className:\'miss\',textContent:\'aún no existe\'}}))"><figcaption>{html.escape(a.split("/")[-1])}</figcaption></figure>'
        for a in item["att"]) or '<p class="none">Sin adjuntos: solo pega el texto.</p>'
    return f'''<article class="card" id="c-{item["key"]}" data-key="{item["key"]}">
  <header><span class="num">{html.escape(item["label"])}</span><div><h3>{html.escape(item["title"])}</h3><p class="desc">{html.escape(item["desc"])}</p></div>
  <label class="done"><input type="checkbox" data-done="{item["key"]}"> Hecha</label></header>
  <div class="meta"><span><b>Formato</b> {item["fmt"]}</span><span><b>Guárdala como</b> <code>dibujos/{item["file"]}.png</code></span></div>
  <div class="att"><b>Adjunta</b>{chips}</div>
  <div class="prompt"><textarea readonly rows="5" id="t-{item["key"]}">{html.escape(item["prompt"])}</textarea>
  <button type="button" data-copy="t-{item["key"]}">Copiar texto</button></div>
</article>'''


def main():
    KIT.mkdir(exist_ok=True); (KIT / "dibujos").mkdir(exist_ok=True); (KIT / "referencias").mkdir(exist_ok=True)
    for dst, src in REFS.items():
        shutil.copy(ROOT / src, KIT / "referencias" / dst)
    items = [
        {"key": "ficha_nestor", "label": "F1", "title": "Ficha de personaje: Néstor", "desc": "Néstor cuatro veces (retrato, frente, tres cuartos y espalda) con la armadura espartana futurista.",
         "fmt": "Horizontal 3:2", "file": "ficha_nestor", "att": ["referencias/nestor_cara_1.jpg", "referencias/nestor_cara_2.jpg", "referencias/nestor_cuerpo.jpg", "referencias/nestor_oficina.jpg"], "prompt": sheet_prompt("N")},
        {"key": "ficha_leo", "label": "F2", "title": "Ficha de personaje: Leo", "desc": "Leo cuatro veces (retrato, frente, tres cuartos y espalda) con el traje negro y cian y el disco de bronce.",
         "fmt": "Horizontal 3:2", "file": "ficha_leo", "att": ["referencias/leo_cara_1.jpg", "referencias/leo_cara_2.jpg", "referencias/leo_cuerpo_1.jpg", "referencias/leo_cuerpo_2.jpg"], "prompt": sheet_prompt("L")},
    ]
    order = [p for p in PANELS if p[0] == "1-1"] + [p for p in PANELS if p[0] not in ("1-1", "cover")] + [p for p in PANELS if p[0] == "cover"]
    for pid, ar, who, mons, scene in order:
        shot, desc = ES.get(pid, ("", ""))
        items.append({"key": pid, "label": "Portada" if pid == "cover" else pid, "title": shot, "desc": desc, "fmt": fmt(ar)[1],
                      "file": fname(pid), "att": attachments(pid, who), "prompt": chat_prompt(pid, ar, who, mons, scene)})
    groups = [("Paso 1 · Fichas de personaje", items[:2])]
    panels = items[2:]
    groups.append(("Paso 2 · Viñeta de estilo", [i for i in panels if i["key"] == "1-1"]))
    for n, t in enumerate(PAGE_TITLES, 1):
        groups.append((f"Página {n} · {t}", [i for i in panels if i["key"].startswith(f"{n}-") and i["key"] != "1-1"]))
    groups.append(("Para terminar · Portada", [i for i in panels if i["key"] == "cover"]))
    body = "".join(f'<section><h2>{html.escape(g)}</h2>{"".join(card(i) for i in its)}</section>' for g, its in groups)
    total = len(items)
    page = TEMPLATE.replace("{{BODY}}", body).replace("{{TOTAL}}", str(total))
    (KIT / "GUIA.html").write_text(page, encoding="utf-8")
    print("kit listo:", KIT, total, "imágenes")


TEMPLATE = r'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kit de dibujos NEO·ESPARTA</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Barlow+Condensed:wght@500;600;700&display=swap">
<style>
:root { color-scheme: dark;
  /* Layout: guía de producción en una columna; cada tarjeta = una imagen a generar. */
  --bg: #0d0a08; --card: #17110d; --line: rgba(196,138,69,.35); --fg: #ecdfc6; --muted: #a8937a; --bronze: #c48a45; --blood: #c0191f; --ok: #59c27a;
  --display: 'Cinzel', Georgia, serif; --ui: 'Barlow Condensed', 'Arial Narrow', sans-serif; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg); font-family: var(--ui); font-size: 17px; line-height: 1.45; padding-inline: 16px; padding-block: 0 60px; }
main { max-width: 980px; margin-inline: auto; }
.top { position: sticky; top: 0; z-index: 5; background: rgba(13,10,8,.94); border-bottom: 1px solid var(--line); margin-inline: -16px; padding: 10px 16px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
.top strong { font-family: var(--display); letter-spacing: .08em; }
.bar { flex: 1; min-width: 160px; height: 8px; background: #2a2018; border-radius: 4px; overflow: hidden; }
.bar i { display: block; height: 100%; width: 0; background: var(--ok); transition: width .3s; }
h1 { font-family: var(--display); font-weight: 900; font-size: clamp(28px, 5vw, 44px); margin: 28px 0 8px; text-wrap: balance; }
.intro { color: #d9cbb0; max-width: 70ch; }
.steps { display: grid; gap: 10px; margin: 18px 0 8px; padding: 0; list-style: none; counter-reset: s; }
.steps li { background: var(--card); border: 1px solid var(--line); padding: 10px 14px; counter-increment: s; display: grid; grid-template-columns: 34px minmax(0,1fr); gap: 10px; }
.steps li::before { content: counter(s); font-family: var(--display); font-weight: 900; color: var(--blood); font-size: 22px; }
.tips { border-left: 3px solid var(--bronze); padding: 6px 14px; color: #d9cbb0; margin: 16px 0 0; }
h2 { font-family: var(--display); font-size: 22px; margin: 40px 0 12px; color: var(--bronze); letter-spacing: .04em; }
.card { background: var(--card); border: 1px solid var(--line); padding: 14px; margin-bottom: 14px; }
.card.is-done { border-color: var(--ok); opacity: .62; }
.card header { display: grid; grid-template-columns: 72px minmax(0,1fr) auto; gap: 12px; align-items: start; }
.num { font-family: var(--display); font-weight: 900; font-size: 22px; color: var(--blood); }
h3 { margin: 0; font-size: 15px; letter-spacing: .1em; text-transform: uppercase; color: #7fe3f5; }
.desc { margin: 2px 0 0; }
.done { white-space: nowrap; font-weight: 700; cursor: pointer; }
.meta { display: flex; flex-wrap: wrap; gap: 6px 22px; margin: 10px 0; color: var(--muted); }
.meta b { color: var(--fg); margin-right: 4px; }
code { font-family: ui-monospace, Menlo, monospace; font-size: 14px; color: #ffd27a; }
.att { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-start; }
.att > b { width: 100%; }
.chip { margin: 0; width: 104px; }
.chip img { width: 104px; height: 78px; object-fit: cover; border: 1px solid var(--line); display: block; }
.chip figcaption { font-size: 13px; color: var(--muted); overflow-wrap: anywhere; }
.miss { display: grid; place-items: center; width: 104px; height: 78px; border: 1px dashed var(--line); color: var(--muted); font-size: 13px; text-align: center; }
.none { margin: 0; color: var(--muted); }
.prompt { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 10px; margin-top: 12px; align-items: start; }
textarea { width: 100%; background: #0b0807; color: #d8ccb6; border: 1px solid var(--line); padding: 8px; font: 13px/1.4 ui-monospace, Menlo, monospace; resize: vertical; }
button { background: var(--blood); color: #fff; border: 0; padding: 10px 14px; font: 700 15px var(--ui); letter-spacing: .06em; cursor: pointer; }
button.ok { background: var(--ok); color: #0d0a08; }
:focus-visible { outline: 2px solid #7fe3f5; outline-offset: 2px; }
@media (max-width: 640px) { .card header { grid-template-columns: minmax(0,1fr); } .prompt { grid-template-columns: minmax(0,1fr); } }
</style></head>
<body>
<div class="top"><strong>NEO·ESPARTA</strong><div class="bar"><i id="prog"></i></div><span id="count">0 / {{TOTAL}}</span></div>
<main>
<h1>Kit de dibujos para ChatGPT</h1>
<p class="intro">Cada tarjeta es una imagen. Copia el texto, adjunta las imágenes que se indican, genera en ChatGPT y guarda el resultado en la carpeta <code>dibujos</code> con el nombre exacto. Marca «Hecha» para llevar la cuenta (se recuerda en este navegador).</p>
<ol class="steps">
  <li><span><b>Fichas primero.</b> Genera las dos fichas de personaje con las fotos de <code>referencias</code>. Enséñamelas antes de seguir: si el parecido no convence, lo ajustamos aquí.</span></li>
  <li><span><b>Luego la viñeta de estilo (1-1).</b> Las viñetas sin Néstor ni Leo usan <code>1-1.png</code> como referencia de estilo, para que todo el cómic tenga la misma mano.</span></li>
  <li><span><b>Después, página a página.</b> Para cada viñeta: chat nuevo, adjunta las fichas que indique, pega el texto y genera. Si te gusta, descárgala y guárdala con su nombre; si no, pídele «otra versión».</span></li>
  <li><span><b>Avísame cuando tengas una página completa.</b> Yo calculo la profundidad, coloco los bocadillos y la publico; no hace falta esperar a tener las 53.</span></li>
</ol>
<p class="tips">Trucos: un chat nuevo por viñeta evita que se mezclen escenas. Si ChatGPT te pide esperar, para un rato y sigue luego. Si rechaza usar las fotos de Leo, genera su ficha sin ellas (solo con el texto) y avísame. Da igual si se descarga como .png, .jpg o .webp: guárdalo con el nombre indicado y yo lo convierto.</p>
{{BODY}}
</main>
<script>
const K = 'ne-kit-done';
let done = {}; try { done = JSON.parse(localStorage.getItem(K) || '{}'); } catch (e) {}
function paint() {
  let n = 0;
  document.querySelectorAll('.card').forEach(c => { const on = !!done[c.dataset.key]; c.classList.toggle('is-done', on); c.querySelector('[data-done]').checked = on; if (on) n++; });
  document.getElementById('count').textContent = n + ' / {{TOTAL}}';
  document.getElementById('prog').style.width = (100 * n / {{TOTAL}}) + '%';
}
document.addEventListener('change', e => { const k = e.target.dataset.done; if (!k) return; done[k] = e.target.checked; try { localStorage.setItem(K, JSON.stringify(done)); } catch (x) {} paint(); });
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-copy]'); if (!b) return;
  const t = document.getElementById(b.dataset.copy);
  try { await navigator.clipboard.writeText(t.value); } catch (x) { t.focus(); t.select(); try { document.execCommand('copy'); } catch (y) {} }
  b.textContent = 'Copiado ✓'; b.classList.add('ok'); setTimeout(() => { b.textContent = 'Copiar texto'; b.classList.remove('ok'); }, 1800);
});
paint();
</script>
</body></html>'''

if __name__ == "__main__":
    main()
