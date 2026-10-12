// ============================================================================
// NEO·ESPARTA — motor de viñetas 3D (un único WebGLRenderer que pinta cada
// viñeta en su propio <canvas> 2D). Todo es geometría procedural.
// ============================================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

const D = Math.PI / 180;
const U = { time: { value: 0 }, H: { value: 600 } };
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const va = (a) => (a && a.isVector3) ? a.clone() : new THREE.Vector3(a[0], a[1], a[2]);

function RNG(seed = 1) {
  let s = (Math.imul(seed | 0, 2654435761) >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

// ---------------------------------------------------------------- renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', alpha: false });
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.setScissorTest(true);
const GL = { w: 0, h: 0 };
function glSize(w, h) {
  if (w > GL.w || h > GL.h) {
    GL.w = Math.max(w, GL.w); GL.h = Math.max(h, GL.h);
    renderer.setSize(GL.w, GL.h, false);
  }
}

// ---------------------------------------------------------------- materials
const gradMap = (() => {
  const t = new THREE.DataTexture(new Uint8Array([22, 74, 150, 255]), 4, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true;
  return t;
})();
const MATS = new Map();
const mc = (k, f) => { let m = MATS.get(k); if (!m) { m = f(); MATS.set(k, m); } return m; };
const toon = (c, o = {}) => mc('t' + c + JSON.stringify(o), () => new THREE.MeshToonMaterial({ color: c, gradientMap: gradMap, ...o }));
const flat = (c, o = {}) => mc('f' + c + JSON.stringify(o), () => new THREE.MeshBasicMaterial({ color: c, toneMapped: false, ...o }));
const addm = (c, op = 1, o = {}) => mc('a' + c + '|' + op + JSON.stringify(o), () => new THREE.MeshBasicMaterial({
  color: c, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false, ...o }));
const std = (c, r = 0.5, m = 0.2, o = {}) => mc('s' + c + '|' + r + '|' + m + JSON.stringify(o), () => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...o }));

// Tinta: contorno por casco invertido con grosor constante en pantalla.
const inkMat = new THREE.ShaderMaterial({
  uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { k: { value: 0.0042 }, inkC: { value: new THREE.Color(0x060302) } }]),
  vertexShader: /* glsl */`
    #include <common>
    #include <fog_pars_vertex>
    uniform float k;
    void main(){
      vec3 p = position; vec3 nn = normal;
      #ifdef USE_INSTANCING
        p = (instanceMatrix * vec4(p, 1.0)).xyz; nn = mat3(instanceMatrix) * nn;
      #endif
      vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
      vec3 n = normalize(normalMatrix * nn);
      float d = clamp(-mvPosition.z, 0.6, 45.0);
      mvPosition.xyz += n * k * d;
      gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }`,
  fragmentShader: /* glsl */`
    #include <common>
    #include <fog_pars_fragment>
    uniform vec3 inkC;
    void main(){
      gl_FragColor = vec4(inkC, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
    }`,
  side: THREE.BackSide, fog: true,
});
const SMOOTH = new WeakMap();
function smoothOf(g) {
  let s = SMOOTH.get(g);
  if (!s) {
    s = g.clone();
    for (const k of Object.keys(s.attributes)) if (k !== 'position') s.deleteAttribute(k);
    s = mergeVertices(s, 1e-4); s.computeVertexNormals(); SMOOTH.set(g, s);
  }
  return s;
}
function mk(g, m, ink = true) {
  const o = new THREE.Mesh(g, m);
  if (ink) o.add(new THREE.Mesh(smoothOf(g), inkMat));
  return o;
}
// put(parent, geo, mat, pos, scale, rotDeg, ink)
function put(parent, g, m, p = [0, 0, 0], s = 1, r = 0, ink = true) {
  const o = mk(g, m, ink);
  o.position.set(p[0], p[1], p[2]);
  if (typeof s === 'number') o.scale.setScalar(s); else o.scale.set(s[0], s[1], s[2]);
  if (r) o.rotation.set(r[0] * D, r[1] * D, r[2] * D, r[3] || 'XYZ');
  parent.add(o); return o;
}
function J(p, x = 0, y = 0, z = 0) { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; }

// ---------------------------------------------------------------- geometry cache
const GC = new Map();
const gc = (k, f) => { let g = GC.get(k); if (!g) { g = f(); GC.set(k, g); } return g; };
const G = {
  s: () => gc('s', () => new THREE.SphereGeometry(1, 24, 16)),
  sl: () => gc('sl', () => new THREE.SphereGeometry(1, 12, 8)),
  b: () => gc('b', () => new THREE.BoxGeometry(1, 1, 1)),
  cap: (r, l) => gc(`c${r.toFixed(3)}|${l.toFixed(3)}`, () => new THREE.CapsuleGeometry(r, Math.max(l, 0.001), 6, 14)),
  cyl: (t, b, s = 18) => gc(`y${t}|${b}|${s}`, () => new THREE.CylinderGeometry(t, b, 1, s)),
  cone: (s = 12) => gc('k' + s, () => new THREE.ConeGeometry(1, 1, s)),
  tor: (t = 0.08, s = 32, arc = Math.PI * 2) => gc(`o${t}|${s}|${arc}`, () => new THREE.TorusGeometry(1, t, 10, s, arc)),
  plane: () => gc('pl', () => new THREE.PlaneGeometry(1, 1)),
  sky: () => gc('sky', () => new THREE.SphereGeometry(900, 40, 20)),
};

// Hornea un grupo estático: fusiona mallas por material (menos draw calls).
function bake(root) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const groups = new Map(); const kill = [];
  const visit = (o, dyn) => {
    dyn = dyn || !!o.userData.dyn;
    if (o.isMesh && !dyn && !o.isInstancedMesh && o !== root) {
      const m = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld);
      const g = o.geometry.clone(); g.applyMatrix4(m);
      const key = o.material.uuid;
      if (!groups.has(key)) groups.set(key, { mat: o.material, list: [] });
      groups.get(key).list.push(g); kill.push(o);
    }
    for (const c of o.children.slice()) visit(c, dyn);
  };
  visit(root, false);
  for (const o of kill) if (o.parent) o.parent.remove(o);
  const out = [];
  for (const { mat, list } of groups.values()) {
    const merged = mergeGeometries(list, false);
    list.forEach(g => g.dispose());
    if (!merged) continue;
    const mesh = new THREE.Mesh(merged, mat); root.add(mesh); out.push(mesh);
  }
  return out;
}

// ---------------------------------------------------------------- textures
const TEX = new Map();
const tc = (k, f) => { let t = TEX.get(k); if (!t) { t = f(); TEX.set(k, t); } return t; };
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); draw(x, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
const glowTex = () => tc('glow', () => canvasTex(128, 128, (x, w, h) => {
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.18, 'rgba(255,255,255,0.6)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.16)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, w, h);
}));
const streakTex = () => tc('streak', () => canvasTex(64, 256, (x, w, h) => {
  const g = x.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.15, 'rgba(255,255,255,0.75)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  const g2 = x.createLinearGradient(0, 0, w, 0);
  g2.addColorStop(0, 'rgba(0,0,0,1)'); g2.addColorStop(0.5, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,1)');
  x.globalCompositeOperation = 'destination-out'; x.fillStyle = g2; x.fillRect(0, 0, w, h);
}));
function winTex(v) {
  return tc('win' + v, () => {
    const r = RNG(100 + v * 7);
    const pals = [['#ffb35c', '#ffd9a0', '#ff8a3c', '#ffe9c8'], ['#5ee8ff', '#a9f4ff', '#3aa8ff', '#ffd9a0'], ['#ff5fc8', '#ffd0a0', '#7fe9ff', '#ffb35c']];
    const t = canvasTex(256, 512, (x, w, h) => {
      x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
      const cols = 8, rows = 16, cw = w / cols, ch = h / rows;
      for (let j = 0; j < rows; j++) {
        const rowLit = r() < 0.25;
        for (let i = 0; i < cols; i++) {
          if (r() < (rowLit ? 0.25 : 0.7)) continue;
          const pal = pals[v];
          x.globalAlpha = 0.25 + r() * 0.75; x.fillStyle = pal[(r() * pal.length) | 0];
          x.fillRect(i * cw + cw * 0.16, j * ch + ch * 0.2, cw * 0.68, ch * 0.52);
        }
      }
      x.globalAlpha = 1;
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
function signTex(text, color, o = {}) {
  return tc('sg|' + text + color + JSON.stringify(o), () => {
    const fs = o.fs || 110;
    const font = `${o.weight || 700} ${fs}px ${o.font || '"Barlow Condensed", "Arial Narrow", Arial, sans-serif'}`;
    const m = document.createElement('canvas').getContext('2d'); m.font = font;
    const vertical = !!o.vertical;
    const chars = [...text];
    const tw = vertical ? fs * 1.1 : m.measureText(text).width;
    const th = vertical ? chars.length * fs * 1.02 : fs * 1.1;
    const pad = o.box ? 46 : 30;
    const w = Math.ceil(tw + pad * 2), h = Math.ceil(th + pad * 2);
    const tex = canvasTex(w, h, (x) => {
      x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.shadowColor = color; x.shadowBlur = 28; x.lineWidth = 6; x.strokeStyle = color;
      if (o.box) { x.strokeRect(12, 12, w - 24, h - 24); x.strokeRect(12, 12, w - 24, h - 24); }
      x.fillStyle = color;
      const draw = () => {
        if (vertical) chars.forEach((ch, i) => x.fillText(ch, w / 2, pad + fs * 0.55 + i * fs * 1.02));
        else x.fillText(text, w / 2, h / 2 + fs * 0.04);
      };
      draw(); draw();
      x.shadowBlur = 0; x.fillStyle = 'rgba(255,255,255,0.88)';
      x.globalAlpha = 0.55; draw(); x.globalAlpha = 1;
    });
    return { tex, aspect: w / h };
  });
}

// ---------------------------------------------------------------- GLSL
const NOISE = /* glsl */`
  float h3(vec3 p){ p = fract(p*0.3183099 + 0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float n3(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
    return mix(mix(mix(h3(i+vec3(0.,0.,0.)), h3(i+vec3(1.,0.,0.)), f.x), mix(h3(i+vec3(0.,1.,0.)), h3(i+vec3(1.,1.,0.)), f.x), f.y),
               mix(mix(h3(i+vec3(0.,0.,1.)), h3(i+vec3(1.,0.,1.)), f.x), mix(h3(i+vec3(0.,1.,1.)), h3(i+vec3(1.,1.,1.)), f.x), f.y), f.z); }
  float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++){ s += a*n3(p); p = p*2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s; }
`;

function skyMat(P) {
  return new THREE.ShaderMaterial({
    uniforms: {
      cTop: { value: new THREE.Color(P.top) }, cMid: { value: new THREE.Color(P.mid) }, cBot: { value: new THREE.Color(P.bot) },
      cSun: { value: new THREE.Color(P.sun) }, cCloud: { value: new THREE.Color(P.cloud) },
      sunDir: { value: va(P.sunDir).normalize() }, sunAmt: { value: P.sunAmt }, cloudAmt: { value: P.cloudAmt }, time: U.time,
    },
    vertexShader: `varying vec3 vDir; void main(){ vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = vec4(p.xy, p.w*0.99995, p.w); }`,
    fragmentShader: /* glsl */`
      uniform vec3 cTop, cMid, cBot, cSun, cCloud, sunDir; uniform float sunAmt, cloudAmt, time;
      varying vec3 vDir;
      ${NOISE}
      void main(){
        vec3 d = normalize(vDir); float h = d.y;
        vec3 col = mix(cMid, cTop, smoothstep(0.0, 0.6, h));
        col = mix(cBot, col, smoothstep(-0.22, 0.01, h));
        float sd = max(dot(d, sunDir), 0.0);
        col += cSun * (pow(sd, 5.0)*0.5 + pow(sd, 48.0)*1.3) * sunAmt;
        vec3 q = vec3(d.x*2.0, d.y*7.0, d.z*2.0) + vec3(time*0.012, 0.0, time*0.008);
        float n = fbm(q*1.3);
        float band = smoothstep(-0.03, 0.1, h) * (1.0 - smoothstep(0.42, 0.95, h));
        float cl = smoothstep(0.44, 0.74, n) * band * cloudAmt;
        vec3 cc = mix(cCloud, cSun*0.9, pow(sd, 3.0)*0.7);
        col = mix(col, cc, cl);
        col *= 1.0 - 0.38*smoothstep(0.58, 0.82, n)*band*cloudAmt;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    side: THREE.BackSide, depthWrite: false, fog: false,
  });
}

// Líneas animadas (lluvia, estelas de velocidad)
function lineFxMat(o = {}) {
  const k = 'lfx' + JSON.stringify(o);
  return mc(k, () => new THREE.ShaderMaterial({
    uniforms: { time: U.time, col: { value: new THREE.Color(o.color ?? 0xd9e2ea) }, op: { value: o.op ?? 0.3 },
      sp: { value: o.speed ?? 0.9 }, len: { value: o.len ?? 0.045 }, sl: { value: o.slant ?? 0.006 } },
    vertexShader: /* glsl */`
      attribute float aE; attribute float aS; uniform float time, sp, len, sl; varying float vE;
      void main(){ vec3 p = position; float s = 0.75 + aS*0.6;
        p.y = fract(p.y + 0.5 - time*sp*s) - 0.5;
        p.y += aE*len; p.x += aE*sl; vE = aE;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform vec3 col; uniform float op; varying float vE;
      void main(){ gl_FragColor = vec4(col, op*(0.1 + 0.9*vE));
      #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
}
function lineFxGeo(n, seed = 1) {
  return gc('lfg' + n + '|' + seed, () => {
    const r = RNG(seed), pos = new Float32Array(n * 6), e = new Float32Array(n * 2), s = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      const x = r() - 0.5, y = r() - 0.5, z = r() - 0.5, q = r();
      pos.set([x, y, z, x, y, z], i * 6); e[i * 2] = 0; e[i * 2 + 1] = 1; s[i * 2] = s[i * 2 + 1] = q;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aE', new THREE.BufferAttribute(e, 1)); g.setAttribute('aS', new THREE.BufferAttribute(s, 1));
    g.boundingSphere = new THREE.Sphere(V(), 1); return g;
  });
}

// Partículas: 0 suben (brasas), 1 caen, 2 explosión radial, 3 parpadeo estático
function ptsMat(color, size, mode) {
  return mc(`pm${color}|${size}|${mode}`, () => new THREE.ShaderMaterial({
    defines: { MODE: mode },
    uniforms: { time: U.time, H: U.H, col: { value: new THREE.Color(color) }, size: { value: size } },
    vertexShader: /* glsl */`
      attribute float aS; attribute vec3 aD; uniform float time, H, size; varying float vA;
      void main(){ vec3 p = position; float a = 1.0;
        #if MODE == 0
          p.y = fract(p.y + 0.5 + time*(0.012 + aS*0.022)) - 0.5;
          p.x += sin(time*0.6 + aS*31.0)*0.03; p.z += cos(time*0.5 + aS*17.0)*0.03;
          a = smoothstep(-0.5, -0.32, p.y) * (1.0 - smoothstep(0.32, 0.5, p.y)) * (0.55 + 0.45*sin(time*4.0 + aS*50.0));
        #elif MODE == 1
          p.y = fract(p.y + 0.5 - time*(0.05 + aS*0.08)) - 0.5;
          a = smoothstep(-0.5, -0.3, p.y) * (1.0 - smoothstep(0.3, 0.5, p.y));
        #elif MODE == 2
          float k = fract(time*0.42 + aS);
          p = aD * (0.15 + k*0.85); a = (1.0 - k) * (1.0 - k);
        #else
          a = 0.55 + 0.45*sin(time*(1.5 + aS*3.0) + aS*40.0);
        #endif
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = clamp(size * (0.45 + aS) * H / max(-mv.z, 0.1), 0.0, 90.0);
        vA = a; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */`
      uniform vec3 col; varying float vA;
      void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.05, d);
        gl_FragColor = vec4(col*(1.0 + a*0.8), a*vA);
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
}
function ptsGeo(n, seed, list) {
  const r = RNG(seed);
  const pos = new Float32Array(n * 3), s = new Float32Array(n), d = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    if (list) pos.set(list[i], i * 3); else pos.set([r() - 0.5, r() - 0.5, r() - 0.5], i * 3);
    s[i] = r();
    const u = r() * 2 - 1, a = r() * Math.PI * 2, q = Math.sqrt(1 - u * u), m = 0.35 + r() * 0.65;
    d.set([q * Math.cos(a) * m, u * m, q * Math.sin(a) * m], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aS', new THREE.BufferAttribute(s, 1)); g.setAttribute('aD', new THREE.BufferAttribute(d, 3));
  g.computeBoundingSphere(); return g;
}

// Estela brillante a lo largo de un tubo (uv.x = recorrido)
function trailMat(color, op = 1) {
  return mc('tr' + color + op, () => new THREE.ShaderMaterial({
    uniforms: { time: U.time, col: { value: new THREE.Color(color) }, op: { value: op } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */`
      uniform vec3 col; uniform float time, op; varying vec2 vUv;
      void main(){ float x = vUv.x; float a = pow(x, 1.4) * (0.72 + 0.28*sin(x*70.0 - time*22.0));
        vec3 c = col*(1.0 + x*1.6) + vec3(1.0)*pow(x, 7.0)*1.2;
        gl_FragColor = vec4(c, a*op);
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  }));
}

// Muro de energía hexagonal
function hexMat(color) {
  return mc('hex' + color, () => new THREE.ShaderMaterial({
    uniforms: { time: U.time, col: { value: new THREE.Color(color) } },
    vertexShader: /* glsl */`varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: /* glsl */`
      uniform vec3 col; uniform float time; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      float hd(vec2 p){ p = abs(p); return max(dot(p, normalize(vec2(1.0, 1.732))), p.x); }
      void main(){
        vec2 uv = vUv * vec2(26.0, 9.0);
        vec2 r = vec2(1.0, 1.732); vec2 h = r*0.5;
        vec2 a = mod(uv, r) - h; vec2 b = mod(uv - h, r) - h;
        vec2 gv = dot(a,a) < dot(b,b) ? a : b;
        float e = 0.5 - hd(gv);
        float line = smoothstep(0.07, 0.0, e);
        float fres = pow(1.0 - abs(dot(vN, vV)), 2.0);
        float pulse = 0.5 + 0.5*sin(time*4.0 - vUv.y*12.0 + vUv.x*8.0);
        float edge = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x) * smoothstep(0.0, 0.06, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
        float al = (line*(0.55 + 0.45*pulse) + 0.1 + fres*0.5) * edge;
        gl_FragColor = vec4(col*(0.7 + line*1.8), al);
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  }));
}

// Núcleo / bola de plasma
function coreMat(c1, c2) {
  return mc('core' + c1 + c2, () => new THREE.ShaderMaterial({
    uniforms: { time: U.time, c1: { value: new THREE.Color(c1) }, c2: { value: new THREE.Color(c2) } },
    vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); vP = position; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: /* glsl */`
      uniform vec3 c1, c2; uniform float time; varying vec3 vN; varying vec3 vV; varying vec3 vP;
      ${NOISE}
      void main(){ float f = 1.0 - abs(dot(vN, vV));
        float n = fbm(normalize(vP)*2.6 + vec3(0.0, time*0.9, time*0.4));
        vec3 c = mix(c2, c1, n) * (0.5 + 1.8*n) + c1*pow(f, 2.0)*2.4 + vec3(1.0)*smoothstep(0.58, 0.85, n)*0.9;
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  }));
}

// Haz de luz (columna, foco)
function beamMat(color, op = 0.6) {
  return mc('beam' + color + op, () => new THREE.ShaderMaterial({
    uniforms: { time: U.time, col: { value: new THREE.Color(color) }, op: { value: op } },
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ vUv = uv; vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: /* glsl */`
      uniform vec3 col; uniform float time, op; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(abs(dot(vN, vV)), 1.6);
        float fl = 0.8 + 0.2*sin(vUv.y*40.0 - time*6.0);
        float a = f * op * pow(1.0 - vUv.y, 1.3) * fl;
        gl_FragColor = vec4(col*1.4, a);
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
  }));
}

const SPR = new Map();
function glow(color, size = 1, op = 1) {
  const key = color + '|' + op;
  let m = SPR.get(key);
  if (!m) {
    m = new THREE.SpriteMaterial({ map: glowTex(), color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false });
    SPR.set(key, m);
  }
  const s = new THREE.Sprite(m); s.scale.setScalar(size); return s;
}

// Cajas con UV escaladas para las ventanas
function boxGeo(w, h, d, x, y, z, us = 24, vs = 48) {
  const g = new THREE.BoxGeometry(w, h, d); const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    const f = (i / 4) | 0; const su = f < 2 ? d : w, sv = (f === 2 || f === 3) ? d : h;
    uv.setXY(i, uv.getX(i) * su / us, uv.getY(i) * sv / vs);
  }
  g.translate(x, y, z); return g;
}
function bldMat(v, dim = 1) {
  return mc('bld' + v + '|' + dim, () => new THREE.MeshToonMaterial({ color: 0x15171d, gradientMap: gradMap, emissive: 0xffffff, emissiveMap: winTex(v), emissiveIntensity: 1.5 * dim }));
}
