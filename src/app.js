// ============================================================================
// APP — monta páginas, viñetas, bocadillos y el bucle de render.
// ============================================================================
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];
const DPR_MAX = 1.75;
let dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
const coarse = matchMedia('(pointer: coarse)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const YAX = V(0, 1, 0), TMP = V();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
function hashStr(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return ((h >>> 0) % 100000) + 1; }

const stages = new Map();
// efectos vivos encima de cada dibujo (lluvia / brasas)
function artFx(id) {
  if (id === '5-12') return {};
  if (id === '5-11') return { embers: 0xffc080 };
  if (id === 'cover' || /^[123]-/.test(id) || /^4-[1-6]$/.test(id)) return { rain: true, embers: /^1-|cover/.test(id) ? 0xff8a3a : null };
  return { embers: 0xff5ab0 };
}
let fsStage = null;

class Stage {
  constructor(def, fig) {
    this.def = def; this.fig = fig; this.pin = $('.pin', fig); this.canvas = $('canvas', this.pin);
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.seed = hashStr(def.id); this.built = false; this.visible = false; this.w = 1; this.h = 1; this.lastInt = -10;
    this.bubbles = $$('.bub', this.pin).map((el, i) => ({ el, def: def.bub[i] }));
    this.tu = $('.tails-u', this.pin); this.to = $('.tails-o', this.pin);
    this.paths = this.bubbles.map(() => {
      const a = document.createElementNS('http://www.w3.org/2000/svg', 'path'), b = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      this.tu.appendChild(a); this.to.appendChild(b); return [a, b];
    });
    new ResizeObserver(() => this.measure()).observe(this.pin);
    this.measure();
  }
  measure() {
    const r = this.pin.getBoundingClientRect(); this.w = Math.max(1, r.width - 4); this.h = Math.max(1, r.height - 4);
    this.bubBox = this.bubbles.map(b => {
      const w = b.el.offsetWidth, h = b.el.offsetHeight;
      let cx = b.def[2] * this.w, cy = b.def[3] * this.h;
      cx = Math.min(Math.max(cx, w / 2 + 6), this.w - w / 2 - 6); cy = Math.min(Math.max(cy, h / 2 + 6), this.h - h / 2 - 6);
      const rot = b.el.classList.contains('shout') ? -4 : ((((this.seed + b.def[1].length * 7) % 7) - 3) * 0.7);
      b.el.style.transform = `translate(${(cx - w / 2).toFixed(1)}px, ${(cy - h / 2).toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
      return { cx, cy, w, h };
    });
  }
  build() {
    if (this.pending) return;
    if (typeof ART !== 'undefined' && ART[this.def.id]) return this.buildArt();
    const def = this.def;
    this.scene = new THREE.Scene(); this.upd = []; this.envs = [];
    this.camera = new THREE.PerspectiveCamera(def.fov || 40, this.w / this.h, 0.05, 2600);
    const K = new Kit(this);
    try { def.build(K); } catch (e) { console.error('Escena ' + def.id, e); }
    this.anch = K.anch;
    const h = K.home || { pos: [0, 2, 6], tgt: [0, 1.4, 0] };
    this.home = { pos: va(h.pos), tgt: va(h.tgt), fov: h.fov || def.fov || 40 };
    { // pivote de giro: el sujeto, no un punto lejano del cielo
      const dv = this.home.tgt.clone().sub(this.home.pos), dd = dv.length();
      const pv = h.pivot === 'far' ? dd : Math.min(dd, h.pivot || 30);
      this.home.tgt = this.home.pos.clone().addScaledVector(dv.normalize(), pv);
    }
    this.camera.fov = this.home.fov; this.camera.position.copy(this.home.pos); this.camera.lookAt(this.home.tgt); this.camera.updateProjectionMatrix();
    const c = this.controls = new OrbitControls(this.camera, this.pin);
    c.target.copy(this.home.tgt); c.enableDamping = true; c.dampingFactor = 0.085; c.enablePan = false; c.enableZoom = false; c.rotateSpeed = 0.55;
    const dist = this.home.pos.distanceTo(this.home.tgt); c.minDistance = dist * 0.2; c.maxDistance = dist * 3.2;
    c.addEventListener('start', () => { this.lastInt = U.time.value; this.fig.classList.add('touched'); this.resetT = null; });
    c.addEventListener('change', () => { if (!this.resetT) this.lastInt = U.time.value; });
    c.update(); this.setTouch();
    this.built = true; this.fig.classList.add('ready');
  }
  // ---- viñeta dibujada en diorama: fondo rellenado + figuras recortadas, cada capa con su relieve
  buildArt() {
    this.pending = true;
    const def = this.def, info = ART[def.id], L = new THREE.TextureLoader();
    const files = [`art3/${def.id}_b.webp`, `art3/${def.id}_d.png`].concat(info[3] ? [`art3/${def.id}_f.webp`] : []);
    const load = (f, n = 0) => L.loadAsync(f).catch((e) => n < 4 ? new Promise(r => setTimeout(r, 400 * (n + 1))).then(() => load(f, n + 1)) : Promise.reject(e));
    Promise.all(files.map(f => load(f)))
      .then(([back, dep, front]) => this.setupArt(back, dep, front, info))
      .catch((e) => { console.error('Arte ' + def.id, e); (window.__artErr = window.__artErr || []).push(def.id + ': ' + (e && (e.stack || e.message || e.type) || e)); ART[def.id] = null; this.pending = false; this.build(); });
  }
  setupArt(back, dep, front, info) {
    const def = this.def, A = this.A = info[0] / info[1], pad = info[2], P = 1 + 2 * pad, pf = pad / P;
    for (const t of [back, front]) if (t) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); }
    dep.colorSpace = THREE.NoColorSpace;
    const read = (img) => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0); return { w: c.width, h: c.height, d: x.getImageData(0, 0, c.width, c.height).data }; };
    const px = (b, u, v, ch) => b.d[(Math.min(b.h - 1, Math.max(0, Math.round(v * (b.h - 1)))) * b.w + Math.min(b.w - 1, Math.max(0, Math.round(u * (b.w - 1))))) * 4 + ch] / 255;
    const D0 = read(dep.image), F0 = front ? read(front.image) : null;
    this.scene = new THREE.Scene(); this.scene.background = new THREE.Color(0x050302); this.upd = []; this.envs = [];
    this.camera = new THREE.PerspectiveCamera(30, this.w / this.h, 0.01, 60);
    const S = this.S = def.relief ?? (front ? 0.4 : 0.34);
    const VS = `uniform sampler2D dmap; uniform float S, pf, ch, bias; varying vec2 vUv;
      void main(){ vUv = uv; vec2 du = (ch > 0.5) ? vec2(pf) + uv * (1.0 - 2.0 * pf) : uv;
        vec4 dd = texture2D(dmap, du); float d = (ch > 0.5) ? dd.g : dd.r;
        vec3 p = position; p.z += (d - 0.5) * S + bias;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`;
    const FS = `uniform sampler2D map; varying vec2 vUv;
      void main(){ vec4 c = texture2D(map, vUv); if (c.a < 0.04) discard; gl_FragColor = c;
      #include <colorspace_fragment>
      }`;
    const layer = (tex, w, h, ch, bias, transparent) => {
      const geo = new THREE.PlaneGeometry(w, h, 300, Math.max(96, Math.round(300 * h / w)));
      const mat = new THREE.ShaderMaterial({ uniforms: { map: { value: tex }, dmap: { value: dep }, S: { value: S }, pf: { value: pf }, ch: { value: ch }, bias: { value: bias } },
        vertexShader: VS, fragmentShader: FS, transparent, depthWrite: !transparent });
      const m = new THREE.Mesh(geo, mat); m.renderOrder = ch; this.scene.add(m); return m;
    };
    layer(back, A * P, P, 0, 0, false);
    if (front) layer(front, A, 1, 1, 0.012, true);
    const K = new Kit(this), fx = artFx(def.id);
    if (fx.rain) K.rain({ p: [0, 0, 0.32], size: [A * 1.5, 1.5, 0.55], n: 1300, op: 0.18, len: 0.05, speed: 0.55, slant: 0.004 });
    if (fx.embers) K.embers({ p: [0, 0, 0.24], size: [A * 1.4, 1.4, 0.5], color: fx.embers, n: 200, sz: 0.007 });
    this.anch = {};
    for (const [k, uv] of Object.entries(def.ta || {})) {
      const onFront = F0 && px(F0, uv[0], uv[1], 3) > 0.5;
      const du = pf + uv[0] * (1 - 2 * pf), dv = pf + uv[1] * (1 - 2 * pf);
      const d = onFront ? px(D0, du, dv, 1) : px(D0, du, dv, 0);
      const o = new THREE.Object3D(); o.position.set((uv[0] - 0.5) * A, 0.5 - uv[1], (d - 0.5) * S + (onFront ? 0.012 : 0));
      this.scene.add(o); this.anch[k] = o;
    }
    const c = this.controls = new OrbitControls(this.camera, this.pin);
    c.enableDamping = true; c.dampingFactor = 0.085; c.enablePan = false; c.enableZoom = false; c.rotateSpeed = 0.42;
    const az = front ? 0.42 : 0.3, po = front ? 0.22 : 0.17;
    c.minAzimuthAngle = -az; c.maxAzimuthAngle = az; c.minPolarAngle = Math.PI / 2 - po; c.maxPolarAngle = Math.PI / 2 + po;
    c.addEventListener('start', () => { this.lastInt = U.time.value; this.fig.classList.add('touched'); this.resetT = null; });
    c.addEventListener('change', () => { if (!this.resetT) this.lastInt = U.time.value; });
    this.layered = !!front; this.art = true; this.fitArt(true); c.update(); this.setTouch();
    this.built = true; this.pending = false; this.fig.classList.add('ready', 'drawn');
  }
  fitArt(reset) {
    const pa = this.w / this.h, A = this.A, m = this.layered ? 1.2 : 1.15, t = Math.tan(15 * D), c = this.controls;
    const vh = Math.min(1 / m, A / (m * pa)), dist = vh / (2 * t), hw = vh * pa / 2, hh = vh / 2;
    const f = this.def.focus || [0.5, 0.5];
    const fx = Math.max(-(A / 2 - hw * 1.08), Math.min(A / 2 - hw * 1.08, (f[0] - 0.5) * A));
    const fy = Math.max(-(0.5 - hh * 1.08), Math.min(0.5 - hh * 1.08, 0.5 - f[1]));
    const tgt = V(fx, fy, 0), zoom = reset || !this.artDist ? 1 : this.camera.position.distanceTo(c.target) / this.artDist;
    const dir = reset ? V(0, 0, 1) : this.camera.position.clone().sub(c.target).normalize();
    this.home = { pos: tgt.clone().add(V(0, 0, dist)), tgt, fov: 30 };
    this.artAspect = pa; this.artDist = dist; c.minDistance = dist * 0.45; c.maxDistance = dist;
    c.target.copy(tgt); this.camera.position.copy(tgt).addScaledVector(dir, dist * Math.min(1, zoom));
  }
  setTouch() {
    if (!this.controls) return;
    const fs = this.pin.classList.contains('fs');
    this.controls.enableZoom = fs;
    if (coarse) { this.controls.enabled = fs; this.pin.style.touchAction = fs ? 'none' : 'pan-y'; }
  }
  reset() { if (this.built) this.resetT = { t: 0, p0: this.camera.position.clone(), q0: this.controls.target.clone() }; }
  render(dt, t) {
    const pw = Math.max(2, Math.round(this.w * dpr)), ph = Math.max(2, Math.round(this.h * dpr));
    if (this.canvas.width !== pw || this.canvas.height !== ph) { this.canvas.width = pw; this.canvas.height = ph; }
    glSize(pw, ph);
    const cam = this.camera;
    if (Math.abs(cam.aspect - this.w / this.h) > 1e-4) { cam.aspect = this.w / this.h; cam.updateProjectionMatrix(); }
    if (this.art && Math.abs(this.w / this.h - this.artAspect) > 1e-3) this.fitArt(false);
    if (this.resetT) {
      const r = this.resetT; r.t = Math.min(1, r.t + dt / 0.6); const e = 1 - Math.pow(1 - r.t, 3);
      cam.position.lerpVectors(r.p0, this.home.pos, e); this.controls.target.lerpVectors(r.q0, this.home.tgt, e);
      if (r.t >= 1) this.resetT = null;
    }
    this.controls.update();
    for (const e of this.envs) this.scene.add(e);
    for (const f of this.upd) f(t, dt, cam);
    for (const e of this.envs) for (const f of e.userData.upd) f(t, dt, cam);
    const saved = cam.position.clone();
    const idle = Math.min(1, Math.max(0, (t - this.lastInt - 2.5) / 2.5)), amp = reduced ? 0 : (this.layered ? 0.075 : 0.04) * idle;
    if (amp > 0) {
      const off = cam.position.clone().sub(this.controls.target);
      off.applyAxisAngle(YAX, Math.sin(t * 0.33 + this.seed) * amp);
      cam.position.copy(this.controls.target).add(off);
      cam.position.y += Math.sin(t * 0.27 + this.seed * 2) * amp * off.length() * 0.12;
      cam.lookAt(this.controls.target);
    }
    U.H.value = ph;
    renderer.setViewport(0, 0, pw, ph); renderer.setScissor(0, 0, pw, ph);
    renderer.render(this.scene, cam);
    this.ctx.drawImage(renderer.domElement, 0, GL.h - ph, pw, ph, 0, 0, pw, ph);
    this.tails(cam);
    cam.position.copy(saved); cam.lookAt(this.controls.target);
  }
  tails(cam) {
    this.bubbles.forEach((b, i) => {
      const [pu, po] = this.paths[i], box = this.bubBox[i], who = b.def[0];
      const a = who && this.anch && this.anch[who];
      const hide = () => { pu.setAttribute('d', ''); po.setAttribute('d', ''); };
      if (!a || !box) return hide();
      a.getWorldPosition(TMP); TMP.project(cam);
      if (TMP.z > 1 || TMP.z < -1) return hide();
      const ax = (TMP.x * 0.5 + 0.5) * this.w, ay = (-TMP.y * 0.5 + 0.5) * this.h;
      const dx = ax - box.cx, dy = ay - box.cy, L0 = Math.hypot(dx, dy);
      if (L0 < 2) return hide();
      const ux = dx / L0, uy = dy / L0, ea = box.w / 2, eb = box.h / 2;
      const tE = 1 / Math.sqrt((ux / ea) ** 2 + (uy / eb) ** 2);
      const rem = L0 - tE; if (rem < 12) return hide();
      const len = Math.min(rem - Math.min(14, rem * 0.25), Math.max(26, this.h * 0.3));
      const bx = box.cx + ux * tE, by = box.cy + uy * tE, tx = bx + ux * len, ty = by + uy * len;
      const hw = Math.max(5, Math.min(13, Math.min(box.w, box.h) * 0.16)), px = -uy, py = ux, ib = 7;
      const f = (n) => n.toFixed(1);
      pu.setAttribute('d', `M${f(bx - ux * ib + px * hw)},${f(by - uy * ib + py * hw)} L${f(tx)},${f(ty)} L${f(bx - ux * ib - px * hw)},${f(by - uy * ib - py * hw)} Z`);
      const k = 6 / len, hw2 = Math.max(1, hw - 2.2);
      po.setAttribute('d', `M${f(bx - ux * ib + px * hw2)},${f(by - uy * ib + py * hw2)} L${f(bx + ux * 6 + px * hw2 * (1 - k * 1.6))},${f(by + uy * 6 + py * hw2 * (1 - k * 1.6))} L${f(bx + ux * 6 - px * hw2 * (1 - k * 1.6))},${f(by + uy * 6 - py * hw2 * (1 - k * 1.6))} L${f(bx - ux * ib - px * hw2)},${f(by - uy * ib - py * hw2)} Z`);
    });
  }
}

// ---------------------------------------------------------------- DOM
const letter = (t) => String(t).replace(/\*([^*]+)\*/g, '<b class="em">$1</b>');
const plain = (t) => String(t).replace(/\*/g, '');
const SFX2 = { '#ff3d9a': '#8a0a52', '#3fe4ff': '#1550ff', '#ffb23a': '#d33a0a', '#ffffff': '#ff9ad8', '#ffd23a': '#ff5a14' };
function sfxLetters(t, seed) {
  let k = 0;
  return [...t].map(ch => {
    if (ch === ' ') return ' ';
    const i = k++, w = ((seed * 7 + i * 13) % 9) - 4;
    return `<i style="--rr:${(w * 1.6).toFixed(1)}deg;--y:${(((i % 2) ? -1 : 1) * 0.04).toFixed(2)}em;--sc:${(1 + Math.min(i, 8) * 0.025).toFixed(3)}">${ch}</i>`;
  }).join('');
}
function barcodeSVG(seed = 7, h = 34) {
  const r = RNG(seed); let x = 0, bars = '';
  for (let i = 0; i < 46; i++) { const w = 1 + ((r() * 3) | 0); if (i % 2 === 0) bars += `<rect x="${x}" y="0" width="${w}" height="${h}"/>`; x += w; }
  return `<svg viewBox="0 0 ${x} ${h}" preserveAspectRatio="none" aria-hidden="true"><g fill="#000">${bars}</g></svg>`;
}
function panelHTML(def, num) {
  const caps = (def.cap || []).map(([pos, text, cls]) => `<div class="cap ${pos} ${cls || ''}">${letter(text)}</div>`).join('');
  const bubs = (def.bub || []).map(([who, text, x, y, o = {}]) =>
    `<div class="bub${o.shout ? ' shout' : ''}${o.small ? ' small' : ''}" style="max-width:${o.w || 48}%">${o.shout ? `<span>${letter(text)}</span>` : letter(text)}</div>`).join('');
  const sfx = (def.sfx || []).map(([t, x, y, r = -8, sc = 1, c = '#ffd23a'], i) =>
    `<div class="sfx" style="left:${x * 100}%;top:${y * 100}%;--r:${r}deg;--s:${sc};--c:${c};--c2:${SFX2[c] || '#ff5a14'}" aria-label="${esc(t)}">${sfxLetters(t, i + num)}</div>`).join('');
  return `<div class="pin" tabindex="0" aria-label="Viñeta ${num}: ${esc(def.shot || '')}">
    <canvas></canvas><div class="fx"></div>
    <svg class="tails-u" aria-hidden="true"></svg>${caps}${bubs}<svg class="tails-o" aria-hidden="true"></svg>${sfx}
    ${def.hint ? '<span class="hint3d">⟲ ARRASTRA PARA GIRAR EN 3D</span>' : ''}
    <span class="num">${num}</span>
    <div class="desc" hidden><b>${esc(def.shot || '')}</b>${esc(def.desc || '')}</div>
    <button class="close" type="button" aria-label="Cerrar">×</button>
    <div class="tools"><button class="b-info" type="button" aria-label="Descripción de la escena" title="Descripción de la escena">i</button><button class="b-fs" type="button" aria-label="Pantalla completa" title="Pantalla completa">⤢</button></div>
  </div>`;
}
function makePanel(def, num) {
  applyArtMeta(def);
  const fig = document.createElement('figure');
  fig.className = 'panel' + (def.fx ? ' fx-' + def.fx : '');
  if (def.at) {
    const [c0, c1, r0, r1] = def.at;
    fig.style.gridColumn = `${c0} / ${c1}`; fig.style.gridRow = `${r0} / ${r1}`;
    const ar = Math.min(2.2, Math.max(0.72, (c1 - c0) / (r1 - r0)));
    fig.style.setProperty('--ar', ar.toFixed(3));
  }
  fig.innerHTML = panelHTML(def, num);
  fig.dataset.id = def.id;
  const st = new Stage(def, fig); stages.set(def.id, st);
  const pin = st.pin;
  $$('.tools, .close, .desc', pin).forEach(el => el.addEventListener('pointerdown', e => e.stopPropagation()));
  $('.b-info', pin).addEventListener('click', () => { const d = $('.desc', pin); d.hidden = !d.hidden; });
  $('.b-fs', pin).addEventListener('click', () => toggleFS(st));
  $('.close', pin).addEventListener('click', () => toggleFS(st, false));
  pin.addEventListener('dblclick', () => st.reset());
  pin.addEventListener('keydown', (e) => { if (e.key === 'Enter') toggleFS(st); });
  io.observe(fig);
  return fig;
}
function toggleFS(st, on = !st.pin.classList.contains('fs')) {
  if (fsStage && fsStage !== st) toggleFS(fsStage, false);
  st.pin.classList.toggle('fs', on); document.body.classList.toggle('fs-open', on);
  fsStage = on ? st : null; st.setTouch();
  if (on && !st.built) queue.unshift(st);
  requestAnimationFrame(() => st.measure());
}
const io = new IntersectionObserver((ents) => { for (const e of ents) { const st = stages.get(e.target.dataset.id); if (st) st.visible = e.isIntersecting; } }, { rootMargin: '160px' });

const queue = [];
let current = null;
function go(id, push = true) {
  id = String(id);
  if (!$('#pg-' + id)) id = 'portada';
  if (fsStage) toggleFS(fsStage, false);
  $$('.page').forEach(p => { p.hidden = p.dataset.page !== id; });
  $$('#nav button').forEach(b => b.setAttribute('aria-current', String(b.dataset.go === id)));
  current = id;
  queue.length = 0;
  $$('#pg-' + id + ' .panel').forEach(f => { const st = stages.get(f.dataset.id); if (st && !st.built) queue.push(st); });
  if (push) { try { history.replaceState(null, '', '#' + id); } catch (e) { /* sandbox */ } }
  window.scrollTo(0, 0);
  requestAnimationFrame(() => stages.forEach(s => s.measure()));
}

function buildUI() {
  const nav = $('#nav');
  const items = [['portada', 'Portada'], ...STORY.pages.map((p, i) => [String(i + 1), ROMAN[i + 1]]), ['contra', 'Fin'], ['guion', 'Guion']];
  nav.innerHTML = items.map(([k, l]) => `<button type="button" data-go="${k}" ${/^\d$/.test(k) ? `title="Página ${l}"` : ''}>${l}</button>`).join('');
  // portada: cabecera de cómic sobre el diorama
  const coverFig = makePanel(STORY.cover, '');
  $('.pin', coverFig).insertAdjacentHTML('beforeend', `<div class="mast" aria-hidden="true">
    <div class="m-top"><div class="m-issue"><b>Nº</b><strong>1</strong><small>OCT · 2099</small></div><div class="m-pub"><span>Λ</span><small>EDICIONES<br>LAMBDA</small></div></div>
    <div class="m-logo"><small>CRÓNICAS DE</small><span class="neo">NEO</span><span class="esp metal">ESPARTA</span></div>
    <div class="m-ribbon">No hicieron falta trescientos. Bastaron dos.</div>
    <div class="m-burst"><div><span>¡EDICIÓN<br>3D!</span><small>GIRA CADA VIÑETA</small></div></div>
    <div class="m-bottom"><div class="m-names metal">NÉSTOR <i>·</i> LEO</div><div class="m-bar"><div class="barcode">${barcodeSVG(11)}<span>8 431099 000101 · 3,00 €</span></div></div></div>
  </div>`);
  $('#cover-slot').appendChild(coverFig);
  const app = $('#app'), N = STORY.pages.length;
  const hint = coarse ? 'Toca ⤢ en una viñeta para abrirla y girarla en 3D' : 'Arrastra cualquier viñeta para girarla en 3D';
  STORY.pages.forEach((pg, i) => {
    const n = i + 1, sec = document.createElement('section');
    sec.className = 'page comic'; sec.id = 'pg-' + n; sec.dataset.page = String(n); sec.hidden = true;
    const prev = n > 1 ? `<button type="button" class="btn-comic dark" data-go="${n - 1}">◄ Página ${ROMAN[n - 1]}</button>` : `<button type="button" class="btn-comic dark" data-go="portada">◄ Portada</button>`;
    const next = n < N ? `<button type="button" class="btn-comic next" data-go="${n + 1}">Continuará en la página ${ROMAN[n + 1]} ►</button>` : `<button type="button" class="btn-comic red next" data-go="contra">Fin del número 1 ►</button>`;
    sec.innerHTML = `<article class="book">
        <header class="runhead"><span>NEO·ESPARTA</span><span>Nº 1 · OCTUBRE 2099</span><span>PÁGINA ${n}</span></header>
        <div class="chapter"><span class="ch-n">Capítulo ${ROMAN[n]}</span><h2 class="ch-t">${pg.title}</h2><span class="ch-hint">${hint}</span></div>
        <div class="sheet-wrap"><div class="sheet"></div></div>
        <footer class="folio"><span>${n}</span></footer>
      </article>
      <nav class="page-foot">${prev}${next}</nav>`;
    const sheet = $('.sheet', sec);
    pg.panels.forEach((def, k) => { if (n === 1 && k === 0) def.hint = true; sheet.appendChild(makePanel(def, k + 1)); });
    app.appendChild(sec);
  });
  // contraportada
  const back = document.createElement('section'); back.className = 'page back'; back.id = 'pg-contra'; back.dataset.page = 'contra'; back.hidden = true;
  const bimg = (typeof ART !== 'undefined' && ART['5-12']) ? `style="background-image:url('art3/5-12_b.webp')"` : '';
  back.innerHTML = `<article class="backcover">
      <div class="bc-img" ${bimg} role="img" aria-label="Un ojo gigante se abre en el cielo sobre el estadio"></div>
      <div class="bc-body">
        <p class="bc-kicker">Próximamente · Número 2</p>
        <h2 class="bc-title metal">El Ojo</h2>
        <div class="capbox">La Grieta se cerró al amanecer. Pero en la cicatriz del cielo algo ha abierto los ojos, y ahora sabe cómo se llaman un padre de barba gris y un chaval que chuta con el interior del pie.</div>
        <p class="bc-quote">«Esta noche… jugamos en casa.»<cite>— Néstor, capítulo IV</cite></p>
        <dl class="credits">
          <dt>PROTAGONISTAS</dt><dd>Néstor y Leo, padre e hijo</dd>
          <dt>GUION Y STORYBOARD</dt><dd>Cinco páginas, cincuenta viñetas: ver el <a href="#guion">Guion</a></dd>
          <dt>DIBUJO</dt><dd>Ilustraciones generadas con IA a partir de fotos reales</dd>
          <dt>MONTAJE 3D</dt><dd>Cada viñeta separada en capas con su profundidad, girable en el navegador</dd>
        </dl>
        <div class="bc-foot"><span class="age" title="Recomendado a partir de 15 años">+15</span><button type="button" class="btn-comic" data-go="portada">◄ Volver a la portada</button><div class="barcode">${barcodeSVG(23, 40)}<span>8 431099 000101 · Nº 1</span></div></div>
      </div>
    </article>`;
  app.appendChild(back);
  // guion mecanografiado
  const g = document.createElement('section'); g.className = 'page guion'; g.id = 'pg-guion'; g.dataset.page = 'guion'; g.hidden = true;
  g.innerHTML = `<article class="script"><span class="stamp">GUION · Nº 1</span><h2>Guion y storyboard</h2><p class="intro">${STORY.logline}</p>` + STORY.pages.map((pg, i) => {
    const n = i + 1;
    const mini = pg.panels.map((d, k) => `<span style="grid-column:${d.at[0]} / ${d.at[1]};grid-row:${d.at[2]} / ${d.at[3]}" data-jump="${d.id}" title="Viñeta ${k + 1}">${k + 1}</span>`).join('');
    const shots = pg.panels.map((d, k) => {
      const txt = [...(d.cap || []).map(c => `<div class="txt"><em>CARTUCHO</em>${plain(c[1])}</div>`), ...(d.bub || []).map(b => `<div class="txt"><em>${b[0] === 'n' ? 'NÉSTOR' : b[0] === 'l' ? 'LEO' : 'VOZ'}</em>${plain(b[1]).replace(/<br>/g, ' ')}</div>`), ...(d.sfx || []).map(s => `<div class="txt"><em>SFX</em>${s[0]}</div>`)].join('');
      return `<li><span class="n">${k + 1}</span><div><span class="kind">${d.shot}</span><p>${d.desc}</p>${txt}<button type="button" data-jump="${d.id}">Ver la viñeta en 3D →</button></div></li>`;
    }).join('');
    return `<section class="gp"><div><span class="pn">PÁGINA ${ROMAN[n]}</span><h3>${pg.title}</h3><p class="beat">${pg.beat}</p><div class="mini">${mini}</div></div><ol class="shots">${shots}</ol></section>`;
  }).join('') + `</article>`;
  app.appendChild(g);
  // navegación
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]'); if (b) { e.preventDefault(); go(b.dataset.go); return; }
    const j = e.target.closest('[data-jump]');
    if (j) {
      const id = j.dataset.jump, page = id.split('-')[0]; go(page);
      const st = stages.get(id); if (st) setTimeout(() => { st.fig.scrollIntoView({ block: 'center' }); toggleFS(st, true); }, 60);
    }
    const a = e.target.closest('a[href^="#"]'); if (a) { e.preventDefault(); go(a.getAttribute('href').slice(1)); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fsStage) { toggleFS(fsStage, false); return; }
    if (fsStage || e.target.closest('input,textarea')) return;
    const order = ['portada', ...STORY.pages.map((_, i) => String(i + 1)), 'contra', 'guion'], i = order.indexOf(current);
    if (e.key === 'ArrowRight' && i < order.length - 1) go(order[i + 1]);
    if (e.key === 'ArrowLeft' && i > 0) go(order[i - 1]);
  });
}

// ---------------------------------------------------------------- loop
let last = performance.now(), ema = 16, slow = 0, fast = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const raw = now - last; last = now;
  const dt = Math.min(0.05, raw / 1000);
  U.time.value += dt;
  ema = ema * 0.95 + raw * 0.05;
  if (ema > 30) { if (++slow > 60 && dpr > 1) { dpr = Math.max(1, dpr - 0.25); slow = 0; } } else slow = 0;
  if (ema < 17) { if (++fast > 240 && dpr < Math.min(window.devicePixelRatio || 1, DPR_MAX)) { dpr += 0.25; fast = 0; } } else fast = 0;
  if (queue.length) {
    const t0 = performance.now();
    while (queue.length && performance.now() - t0 < 14) { const st = queue.shift(); if (!st.built) st.build(); }
  }
  if (fsStage) { if (fsStage.built) fsStage.render(dt, U.time.value); return; }
  for (const st of stages.values()) if (st.built && st.visible && !st.fig.closest('[hidden]')) st.render(dt, U.time.value);
}

async function start() {
  try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]); } catch (e) { /* sin fuentes */ }
  buildUI();
  const h = (location.hash || '').replace('#', '');
  go(h || 'portada', false);
  requestAnimationFrame(loop);
}
if (location.hostname === 'localhost') window.NE = { stages, go, toggleFS, U, renderAll: () => { U.time.value += 0.016; const list = fsStage ? [fsStage] : [...stages.values()].filter(st => !st.fig.closest('[hidden]')); for (const st of list) { if (!st.built) st.build(); if (st.built) st.render(0.016, U.time.value); } } };
start();
