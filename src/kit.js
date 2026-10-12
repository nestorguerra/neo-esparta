// ============================================================================
// KIT — cielos, ciudad, personajes (Néstor, Leo), monstruos y efectos.
// ============================================================================
const SKY = {
  storm: { top: 0x150805, mid: 0x823816, bot: 0x1c0b06, sun: 0xff7a30, sunDir: [-0.25, 0.1, -1], sunAmt: 1.0, cloud: 0x2c1209, cloudAmt: 1,
    fog: 0x4a2010, fogD: 0.0030, hemi: [0x9a7058, 0x120806, 0.7], key: [0xffd2a8, 2.5, [-0.55, 0.75, -0.6]], rim: [0xff4a8a, 3.4, [0.45, 0.35, 1]] },
  street: { top: 0x0b0605, mid: 0x60301a, bot: 0x0b0605, sun: 0xff6a2a, sunDir: [0.2, 0.08, -1], sunAmt: 0.7, cloud: 0x1e0e08, cloudAmt: 0.9,
    fog: 0x2e1810, fogD: 0.0105, hemi: [0x9a7a68, 0x0c0706, 1.0], key: [0xffc898, 2.6, [-0.5, 0.9, 0.3]], rim: [0x3fe4ff, 4.0, [0.6, 0.4, -0.8]] },
  night: { top: 0x04060c, mid: 0x221430, bot: 0x05050a, sun: 0xff2f9a, sunDir: [0.3, 0.06, -1], sunAmt: 0.7, cloud: 0x140c20, cloudAmt: 0.8,
    fog: 0x1c1028, fogD: 0.0075, hemi: [0x6a6090, 0x0a0608, 0.8], key: [0xbfe6ff, 2.0, [0.7, 0.9, 0.4]], rim: [0xff3db0, 4.2, [-0.4, 0.3, -1]] },
  arena: { top: 0x050409, mid: 0x401236, bot: 0x080508, sun: 0xff2fa8, sunDir: [0, 0.5, -0.4], sunAmt: 0.9, cloud: 0x1c0a1a, cloudAmt: 0.8,
    fog: 0x22102a, fogD: 0.0042, hemi: [0x8a7088, 0x0c0608, 0.8], key: [0xfff0e0, 2.4, [0.3, 1, 0.4]], rim: [0xff2fa8, 4.0, [-0.3, 0.5, -1]] },
  dawn: { top: 0x2c3c60, mid: 0xe88a48, bot: 0x2c1a12, sun: 0xffe2a0, sunDir: [1, 0.07, 0.1], sunAmt: 1.5, cloud: 0x9a5848, cloudAmt: 0.95,
    fog: 0xa87048, fogD: 0.0024, hemi: [0xc0a088, 0x2a1810, 0.9], key: [0xffe0b0, 3.0, [1, 0.35, 0.15]], rim: [0xff9a60, 2.0, [-1, 0.3, -0.2]] },
  omen: { top: 0x1a0c10, mid: 0xc0603a, bot: 0x241410, sun: 0xffb070, sunDir: [1, 0.05, 0.2], sunAmt: 1.1, cloud: 0x4a2020, cloudAmt: 1,
    fog: 0x7a4030, fogD: 0.0022, hemi: [0xa08070, 0x2a1410, 0.85], key: [0xffd0a8, 2.6, [1, 0.3, 0.2]], rim: [0xff3d6a, 2.6, [-0.4, 0.4, -1]] },
};

const BODY = {
  n: { thigh: 0.47, shin: 0.46, legR: 0.07, hipW: 0.1, torso: 0.56, chestW: 0.215, taper: 0.66, dep: 0.62, shW: 0.225, shY: 0.48, upA: 0.30, foA: 0.27, armR: 0.054, head: 0.126, neck: 0.08, foot: 0.13 },
  l: { thigh: 0.35, shin: 0.35, legR: 0.05, hipW: 0.075, torso: 0.42, chestW: 0.15, taper: 0.8, dep: 0.64, shW: 0.165, shY: 0.36, upA: 0.235, foA: 0.215, armR: 0.038, head: 0.122, neck: 0.06, foot: 0.1 },
};
const COL = {
  n: { skin: 0xc08866, hair: 0x37312d, hair2: 0x9a948c, beard: 0x3a2d25, beardG: 0x857a70, armor: 0x1c1e24, armor2: 0x30343d, cape: 0xa3121b },
  l: { skin: 0xc99a7a, hair: 0x4a2e1c, hair2: 0x7a5234, armor: 0x16181d, armor2: 0x282d37, cape: 0xb3151d },
};

// Poses (grados). Personaje mirando a +Z. Brazo/pierna adelante = X negativo.
const STAND = { lSh: [0, 0, 8], rSh: [0, 0, -8], lEl: [-12, 0, 0], rEl: [-12, 0, 0], lHip: [0, 0, 4], rHip: [0, 0, -4], lAn: [0, 0, -4], rAn: [0, 0, 4] };
const POSES = {
  stand: { ...STAND },
  lookUp: { ...STAND, neck: [-10, 0, 0], head: [-16, 0, 0] },
  lookDown: { ...STAND, neck: [12, 0, 0], head: [14, 0, 0] },
  heroic: { spine: [-5, 0, 0], neck: [-3, 0, 0], head: [-5, 0, 0],
    rSh: [-12, 0, -18], rEl: [-80, 0, 0], lSh: [-30, 0, 26], lEl: [-84, 0, 0],
    lHip: [-3, 0, 13], rHip: [3, 0, -13], lKn: [5, 0, 0], rKn: [5, 0, 0], lAn: [0, 0, -13], rAn: [0, 0, 13],
    spear: { dir: [0.03, 1, 0.06], grip: 'ground' }, shield: { dir: [0.5, 0, 1] } },
  guard: { spine: [12, -10, 0], neck: [-8, 8, 0], head: [-6, 0, 0],
    lSh: [-62, 0, 18], lEl: [-62, 0, 0], rSh: [-150, 0, -30], rEl: [-75, 0, 0],
    lHip: [-28, 0, 8], lKn: [26, 0, 0], lAn: [4, 0, -8], rHip: [22, 0, -10], rKn: [18, 0, 0], rAn: [-10, 0, 10],
    spear: { dir: [0, -0.15, 1], grip: 0.6 }, shield: { dir: [0.15, 0.05, 1] } },
  brace: { spine: [22, 0, 0], neck: [-16, 0, 0], head: [-8, 0, 0],
    lSh: [-78, 0, 14], lEl: [-58, 0, 0], rSh: [-25, 0, -25], rEl: [-60, 0, 0],
    lHip: [-38, 0, 10], lKn: [44, 0, 0], lAn: [-6, 0, -10], rHip: [28, 0, -10], rKn: [12, 0, 0], rAn: [-12, 0, 10],
    spear: { dir: [0.1, 0.35, 1], grip: 0.35 }, shield: { dir: [0, 0.05, 1] }, cape: { billow: 0.4, lift: 25 } },
  thrust: { spine: [14, -25, 0], neck: [-10, 20, 0], head: [-5, 0, 0],
    rSh: [-84, 0, -4], rEl: [-6, 0, 0], lSh: [-40, 0, 35], lEl: [-80, 0, 0],
    lHip: [-40, 0, 6], lKn: [45, 0, 0], rHip: [30, 0, -8], rKn: [8, 0, 0], rAn: [-15, 0, 0],
    spear: { dir: [0.05, 0.3, 1], grip: 0.3 }, shield: { dir: [0.6, 0, 0.8] }, cape: { billow: 0.45, lift: 30 } },
  roar: { spine: [-12, 0, 0], neck: [-8, 0, 0], head: [-16, 0, 0],
    lSh: [8, 0, 62], lEl: [-55, 0, 0], rSh: [8, 0, -62], rEl: [-55, 0, 0],
    lHip: [-6, 0, 16], rHip: [6, 0, -16], lKn: [14, 0, 0], rKn: [14, 0, 0], lAn: [0, 0, -16], rAn: [0, 0, 16],
    face: 'roar', spear: false, shield: 'back', cape: { billow: 0.7, amp: 0.12, lift: 45, freq: 4 } },
  land: { spine: [32, 0, 0], neck: [-30, 0, 0], head: [-12, 0, 0],
    lHip: [-82, 0, 10], lKn: [96, 0, 0], lAn: [-14, 0, 0],
    rHip: [8, 0, -8], rKn: [112, 0, 0], rAn: [42, 0, 0],
    rSh: [-38, 0, -10], rEl: [-4, 0, 0], lSh: [28, 0, 42], lEl: [-24, 0, 0],
    spear: { hand: 'l', dir: [0.35, 0.2, -1], grip: 0.5 }, shield: 'back', cape: { lift: 60, billow: 0.5 } },
  crouch: { spine: [30, 0, 0], neck: [-25, 0, 0], lHip: [-70, 0, 12], lKn: [100, 0, 0], lAn: [-25, 0, 0],
    rHip: [-20, 0, -14], rKn: [110, 0, 0], rAn: [20, 0, 0], lSh: [-40, 0, 30], lEl: [-40, 0, 0], rSh: [20, 0, -50], rEl: [-30, 0, 0] },
  leap: { air: true, spine: [18, 0, 0], neck: [-26, 0, 0], head: [-10, 0, 0],
    lHip: [-72, 0, 12], lKn: [92, 0, 0], rHip: [16, 0, -10], rKn: [72, 0, 0], lAn: [-10, 0, 0], rAn: [22, 0, 0],
    rSh: [-158, 0, -22], rEl: [-30, 0, 0], lSh: [-58, 0, 42], lEl: [-62, 0, 0],
    spear: { dir: [0, 0.45, 1], grip: 0.55 }, shield: { dir: [0.45, 0.2, 1] }, cape: { lift: 118, billow: 0.55, flare: 0.8, amp: 0.16, freq: 5 } },
  leapL: { air: true, spine: [15, 0, 0], neck: [-22, 0, 0], lHip: [-82, 0, 10], lKn: [104, 0, 0], rHip: [12, 0, -10], rKn: [88, 0, 0],
    lSh: [-150, 0, 38], lEl: [-20, 0, 0], rSh: [-32, 0, -70], rEl: [-30, 0, 0], disc: { hand: 'r', dir: [0, 0.3, 1] }, cape: { lift: 115, billow: 0.4, flare: 0.7, amp: 0.14, freq: 5 } },
  throw: { spine: [10, 25, 0], neck: [-5, -22, 0], rSh: [-88, 0, -35], rEl: [-8, 0, 0], lSh: [-20, 0, 55], lEl: [-40, 0, 0],
    lHip: [-35, 0, 6], lKn: [40, 0, 0], rHip: [25, 0, -8], rKn: [15, 0, 0], rAn: [-12, 0, 0], disc: false, cape: { billow: 0.3, lift: 30 } },
  catchDisc: { ...STAND, rSh: [-150, 0, -24], rEl: [-34, 0, 0], lSh: [-10, 0, 20], lEl: [-70, 0, 0], neck: [-4, 8, 0],
    lHip: [-8, 0, 8], rHip: [6, 0, -8], disc: { hand: 'r', dir: [0, 0, 1] }, face: 'smile' },
  gauntlet: { ...STAND, neck: [10, 0, 0], head: [8, 0, 0], lSh: [-35, 0, 8], lEl: [-108, 0, 0], rSh: [-44, 0, -12], rEl: [-96, 0, 0] },
  fight: { spine: [10, 15, 0], neck: [-8, -15, 0], lHip: [-25, 0, 12], lKn: [30, 0, 0], rHip: [15, 0, -12], rKn: [20, 0, 0],
    lSh: [-62, 0, 20], lEl: [-50, 0, 0], rSh: [-30, 0, -25], rEl: [-95, 0, 0], disc: { hand: 'l', dir: [0.3, 0, 1] } },
  run: { spine: [18, 0, 0], neck: [-14, 0, 0], lHip: [-55, 0, 4], lKn: [45, 0, 0], rHip: [35, 0, -4], rKn: [82, 0, 0], rAn: [30, 0, 0],
    lSh: [38, 0, 10], lEl: [-80, 0, 0], rSh: [-55, 0, -10], rEl: [-85, 0, 0], cape: { lift: 55, billow: 0.5, amp: 0.1, freq: 5 } },
  charge: { spine: [20, 0, 0], neck: [-16, 0, 0], lHip: [-55, 0, 4], lKn: [45, 0, 0], rHip: [35, 0, -4], rKn: [82, 0, 0], rAn: [30, 0, 0],
    lSh: [-76, 0, 15], lEl: [-55, 0, 0], rSh: [-20, 0, -22], rEl: [-70, 0, 0],
    spear: { dir: [0, 0.18, 1], grip: 0.45 }, shield: { dir: [0, 0, 1] }, cape: { lift: 70, billow: 0.6, amp: 0.12, freq: 5 } },
  grabbed: { air: true, spine: [-15, 0, 10], neck: [-12, 0, 0], head: [-8, 12, 0], lSh: [-160, 0, 30], lEl: [-40, 0, 0], rSh: [-100, 0, -60], rEl: [-50, 0, 0],
    lHip: [-30, 0, 12], lKn: [60, 0, 0], rHip: [10, 0, -8], rKn: [30, 0, 0], face: 'shout', disc: false, cape: { lift: 20, amp: 0.1, freq: 4 } },
  fall: { air: true, spine: [-25, 0, 0], neck: [-10, 0, 0], lSh: [-40, 0, 110], rSh: [-40, 0, -110], lEl: [-30, 0, 0], rEl: [-30, 0, 0],
    lHip: [-30, 0, 20], lKn: [60, 0, 0], rHip: [-10, 0, -20], rKn: [40, 0, 0], face: 'shout', disc: false, cape: { lift: 160, amp: 0.14, freq: 5 } },
  catch: { air: true, spine: [8, 0, 0], neck: [-6, 0, 0], lSh: [-78, 0, 12], lEl: [-55, 0, 0], rSh: [-78, 0, -12], rEl: [-55, 0, 0],
    lHip: [-55, 0, 8], lKn: [85, 0, 0], rHip: [10, 0, -8], rKn: [60, 0, 0], spear: 'back', shield: 'back', cape: { lift: 110, amp: 0.14, freq: 5 } },
  held: { air: true, spine: [18, 0, 0], neck: [-5, 0, 0], lHip: [-88, 0, 10], lKn: [92, 0, 0], rHip: [-80, 0, -10], rKn: [84, 0, 0],
    lSh: [-62, 0, 30], lEl: [-82, 0, 0], rSh: [-44, 0, -20], rEl: [-62, 0, 0], disc: 'back' },
  ride: { air: true, spine: [38, 0, 0], neck: [-30, 0, 0], head: [-8, 0, 0], lHip: [-75, 0, 14], lKn: [95, 0, 0], rHip: [-75, 0, -14], rKn: [95, 0, 0],
    lAn: [-20, 0, 0], rAn: [-20, 0, 0], lSh: [-62, 0, 14], lEl: [-35, 0, 0], rSh: [-62, 0, -14], rEl: [-35, 0, 0],
    spear: 'back', shield: 'back', cape: { lift: 92, billow: 0.25, amp: 0.2, freq: 8 } },
  rideBack: { air: true, spine: [30, 0, 0], neck: [-22, 0, 0], lHip: [-75, 0, 18], lKn: [95, 0, 0], rHip: [-75, 0, -18], rKn: [95, 0, 0],
    lAn: [-20, 0, 0], rAn: [-20, 0, 0], lSh: [-55, 0, 8], lEl: [-50, 0, 0], rSh: [-55, 0, -8], rEl: [-50, 0, 0], cape: { lift: 92, amp: 0.2, freq: 8 } },
  hud: { air: true, spine: [28, 0, 0], neck: [-6, 14, 0], head: [12, 8, 0], lHip: [-75, 0, 14], lKn: [95, 0, 0], rHip: [-75, 0, -14], rKn: [95, 0, 0],
    lSh: [-62, 0, -8], lEl: [-118, 0, 0], rSh: [-62, 0, -14], rEl: [-35, 0, 0], spear: 'back', shield: 'back', face: 'neutral', cape: { lift: 88, amp: 0.2, freq: 8 } },
  lunge: { spine: [4, 0, 0], neck: [-4, 0, 0], lHip: [-52, 0, 0], lKn: [62, 0, 0], lAn: [-10, 0, 0], rHip: [36, 0, 0], rKn: [6, 0, 0], rAn: [-22, 0, 0],
    lSh: [-88, 0, -6], lEl: [-4, 0, 0], rSh: [-150, 0, -35], rEl: [-75, 0, 0], disc: false, face: 'angry', cape: { lift: 40, billow: 0.4, amp: 0.1, freq: 4 } },
  kick: { air: true, spine: [-28, 0, 12], neck: [24, 0, 0], rHip: [-98, 0, -10], rKn: [6, 0, 0], rAn: [30, 0, 0], lHip: [20, 0, 8], lKn: [72, 0, 0],
    lSh: [-40, 0, 85], lEl: [-20, 0, 0], rSh: [30, 0, -75], rEl: [-20, 0, 0], disc: false, face: 'shout', cape: { lift: 120, amp: 0.15, freq: 6 } },
  sit: { air: true, lHip: [-88, 0, 6], lKn: [80, 0, 0], rHip: [-88, 0, -6], rKn: [86, 0, 0], spine: [8, 0, 0],
    lSh: [-28, 0, 10], lEl: [-42, 0, 0], rSh: [-28, 0, -10], rEl: [-42, 0, 0], spear: false, shield: false, cape: { billow: 0.05, lift: 0, amp: 0.03, freq: 1 } },
  sitArm: { air: true, lHip: [-88, 0, 6], lKn: [80, 0, 0], rHip: [-88, 0, -6], rKn: [86, 0, 0], spine: [6, 0, 0], neck: [0, -18, 0],
    lSh: [-28, 0, 10], lEl: [-42, 0, 0], rSh: [-40, -10, -82], rEl: [-20, -40, 0], spear: false, shield: false, face: 'smile', cape: { billow: 0.05, lift: 0, amp: 0.03, freq: 1 } },
  release: { spine: [25, 30, 0], neck: [-20, -25, 0], rSh: [-118, 0, -15], rEl: [-5, 0, 0], lSh: [-30, 0, 50], lEl: [-40, 0, 0],
    lHip: [-45, 0, 5], lKn: [40, 0, 0], rHip: [30, 0, -5], rKn: [25, 0, 0], rAn: [-20, 0, 0], spear: false, shield: { dir: [0.8, 0, 0.3] }, face: 'roar', cape: { billow: 0.55, lift: 45 } },
  shoulderHand: { ...STAND, rSh: [-22, 0, -40], rEl: [-34, 0, 0], neck: [6, -18, 0], spear: { hand: 'l', dir: [0.05, 1, 0.05], grip: 'ground' }, shield: 'back', face: 'smile' },
  armsCrossed: { ...STAND, lSh: [-40, 0, 14], lEl: [-112, -20, 0], rSh: [-36, 0, -14], rEl: [-108, 20, 0], face: 'smile' },
  talk: { ...STAND, lSh: [-30, 0, 18], lEl: [-70, 0, 0], neck: [4, 20, 0], spear: { dir: [0.03, 1, 0.06], grip: 'ground' }, shield: 'back' },
};

function lerpC(a, b, t) { return new THREE.Color(a).lerp(new THREE.Color(b), t).getHex(); }
const ENV = new Map();

class Kit {
  constructor(st) {
    this.st = st; this.scene = st.scene; this.root = st.scene; this.upd = st.upd; this.anch = {}; this.rng = RNG(st.seed || 1);
    const L = this.L = {
      hemi: new THREE.HemisphereLight(0xffffff, 0x000000, 1),
      key: new THREE.DirectionalLight(0xffffff, 2),
      rim: new THREE.DirectionalLight(0xffffff, 2),
      p1: new THREE.PointLight(0xffffff, 0, 40, 1.4),
      p2: new THREE.PointLight(0xffffff, 0, 40, 1.4),
    };
    this.scene.add(L.hemi, L.key, L.key.target, L.rim, L.rim.target, L.p1, L.p2);
  }
  add(o) { this.root.add(o); return o; }
  on(f) { this.upd.push(f); }
  cam(pos, tgt, fov, pivot) { this.home = { pos, tgt, fov, pivot }; }
  light(i, color, intensity, p, dist = 40) { const l = this.L['p' + i]; l.color.set(color); l.intensity = intensity; l.distance = dist; l.position.set(p[0], p[1], p[2]); return l; }

  sky(name, o = {}) {
    const P = this.P = Object.assign({}, SKY[name], o);
    const m = new THREE.Mesh(G.sky(), skyMat(P)); m.renderOrder = -10; m.frustumCulled = false;
    this.scene.add(m); this.upd.push((t, dt, cam) => m.position.copy(cam.position));
    this.scene.fog = new THREE.FogExp2(P.fog, P.fogD);
    this.scene.background = new THREE.Color(P.bot);
    const L = this.L;
    L.hemi.color.set(P.hemi[0]); L.hemi.groundColor.set(P.hemi[1]); L.hemi.intensity = P.hemi[2];
    L.key.color.set(P.key[0]); L.key.intensity = P.key[1]; L.key.position.copy(va(P.key[2]).normalize().multiplyScalar(100));
    L.rim.color.set(P.rim[0]); L.rim.intensity = P.rim[1]; L.rim.position.copy(va(P.rim[2]).normalize().multiplyScalar(100));
    return P;
  }

  shared(key, fn) {
    let env = ENV.get(key);
    if (!env) {
      env = new THREE.Group(); env.userData.upd = [];
      const r = this.root, u = this.upd, rng = this.rng;
      this.root = env; this.upd = env.userData.upd; this.rng = RNG(key.length * 97);
      fn(); this.root = r; this.upd = u; this.rng = rng;
      ENV.set(key, env);
    }
    this.st.envs.push(env); this.scene.add(env);
    return env;
  }

  // ------------------------------------------------------------ city pieces
  city(o) {
    const r = RNG(o.seed || 3), lists = [[], [], []], tops = [];
    for (let i = 0; i < o.n; i++) {
      const a = r() * Math.PI * 2, d = o.rMin + Math.sqrt(r()) * (o.rMax - o.rMin);
      const x = (o.cx || 0) + Math.cos(a) * d, z = (o.cz || 0) + Math.sin(a) * d;
      if (o.avoid && o.avoid(x, z)) continue;
      const w = 12 + r() * 22, dp = 12 + r() * 22;
      const h = o.hMin + Math.pow(r(), o.hPow || 1.8) * (o.hMax - o.hMin);
      const v = (r() * 3) | 0, y0 = o.y0 || 0;
      lists[v].push(boxGeo(w, h, dp, x, y0 + h / 2, z));
      if (r() < 0.4) {
        const h2 = h * (0.12 + r() * 0.3), s = 0.45 + r() * 0.3;
        lists[v].push(boxGeo(w * s, h2, dp * s, x, y0 + h + h2 / 2, z)); tops.push([x, y0 + h + h2, z]);
        if (r() < 0.5) lists[v].push(boxGeo(1, h2 * 0.6, 1, x, y0 + h + h2 + h2 * 0.3, z));
      } else tops.push([x, y0 + h, z]);
    }
    for (let v = 0; v < 3; v++) if (lists[v].length) this.add(new THREE.Mesh(mergeGeometries(lists[v]), bldMat(v, o.dim || 1)));
    if (o.beacons !== false) {
      const pts = tops.filter(() => r() < 0.4).map(p => [p[0], p[1] + 2, p[2]]);
      if (pts.length) this.ptsList(pts, 0xff3030, 2.2, 3);
    }
    return tops;
  }
  skyline(o) {
    const r = RNG(o.seed || 9), list = [];
    for (let i = 0; i < o.n; i++) {
      const a = r() * Math.PI * 2, d = o.rMin + r() * (o.rMax - o.rMin);
      const w = 20 + r() * 50, h = o.hMin + Math.pow(r(), 1.5) * (o.hMax - o.hMin);
      list.push(boxGeo(w, h, w, Math.cos(a) * d + (o.cx || 0), h / 2, Math.sin(a) * d + (o.cz || 0)));
      if (r() < 0.3) list.push(boxGeo(2, h * 0.25, 2, Math.cos(a) * d + (o.cx || 0), h * 1.12, Math.sin(a) * d + (o.cz || 0)));
    }
    const m = new THREE.Mesh(mergeGeometries(list), mc('skl' + o.color, () => new THREE.MeshBasicMaterial({ color: o.color, fog: false })));
    m.renderOrder = -5; this.add(m);
  }
  pyramid(p, s = 1) {
    const g = new THREE.ConeGeometry(110 * s, 190 * s, 4, 1); g.rotateY(Math.PI / 4);
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 12, uv.getY(i) * 5);
    g.translate(p[0], p[1] + 95 * s, p[2]);
    this.add(new THREE.Mesh(g, bldMat(0, 0.8)));
    const tip = glow(0xffc070, 30 * s, 0.8); tip.position.set(p[0], p[1] + 192 * s, p[2]); this.add(tip);
  }
  flames(list) {
    for (const p of list) {
      put(this.root, G.cyl(1, 1.3, 10), toon(0x15161a), [p[0], p[1] / 2, p[2]], [2.2, p[1], 2.2], 0, false);
      const f = glow(0xff8a2a, 22, 1); f.position.set(p[0], p[1] + 6, p[2]); this.add(f);
      const f2 = glow(0xffe0a0, 9, 1); f2.position.set(p[0], p[1] + 3, p[2]); this.add(f2);
      const ph = this.rng() * 10;
      this.on(t => { const k = 1 + Math.sin(t * 13 + ph) * 0.12 + Math.sin(t * 7.3 + ph) * 0.1; f.scale.set(20 * k, 30 * k, 1); f.position.y = p[1] + 8 * k; });
    }
  }
  traffic(o) {
    const r = RNG(o.seed || 21), body = toon(0x23262d);
    for (let i = 0; i < o.n; i++) {
      const car = new THREE.Group();
      put(car, G.s(), body, [0, 0, 0], [0.9, 0.42, 2.2], 0, false);
      const hd = glow(0xfff0d0, 3, 0.9); hd.position.set(0, 0, 2.3); car.add(hd);
      const tl = glow(0xff2a2a, 2.2, 0.9); tl.position.set(0, 0, -2.3); car.add(tl);
      this.add(car);
      if (o.lane) {
        const x = o.lane.x[0] + r() * (o.lane.x[1] - o.lane.x[0]), y = o.lane.y[0] + r() * (o.lane.y[1] - o.lane.y[0]);
        const dir = r() < 0.5 ? 1 : -1, sp = (18 + r() * 25) * dir, z0 = r() * 800, len = 800;
        car.rotation.y = dir > 0 ? 0 : Math.PI;
        this.on(t => { car.position.set(x, y, ((z0 + t * sp) % len + len) % len - 600); });
      } else {
        const R = o.r[0] + r() * (o.r[1] - o.r[0]), y = o.y[0] + r() * (o.y[1] - o.y[0]), sp = (0.02 + r() * 0.04) * (r() < 0.5 ? 1 : -1), ph = r() * 6.28;
        this.on(t => { const a = ph + t * sp; car.position.set((o.cx || 0) + Math.cos(a) * R, y + Math.sin(t * 0.3 + ph) * 2, (o.cz || 0) + Math.sin(a) * R); car.rotation.y = Math.atan2(-Math.sin(a) * sp, Math.cos(a) * sp); });
      }
    }
  }
  searchlight(p, color = 0xfff2d8, ph = 0) {
    const g = J(this.root, p[0], p[1], p[2]);
    const geo = gc('slg', () => { const c = new THREE.CylinderGeometry(14, 0.6, 320, 24, 1, true); c.translate(0, 160, 0); return c; });
    const b = new THREE.Mesh(geo, beamMat(color, 0.22)); g.add(b);
    this.on(t => g.rotation.set(0.42 + 0.22 * Math.sin(t * 0.21 + ph), t * 0.12 + ph, 0.3 * Math.sin(t * 0.17 + ph)));
  }
  sign(text, color, p, ry = 0, h = 2, o = {}) {
    const { tex, aspect } = signTex(text, color, o);
    const mat = mc('sgm' + tex.uuid, () => new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide, fog: false }));
    const m = new THREE.Mesh(G.plane(), mat);
    m.scale.set(h * aspect, h, 1); m.position.set(p[0], p[1], p[2]); m.rotation.y = ry * D; this.add(m);
    if (o.flicker) { const ph = this.rng() * 50; this.on(t => { m.visible = Math.sin(t * 23 + ph) > -0.92 || Math.sin(t * 3.1 + ph) > 0.4; }); }
    if (o.refl) { // reflejo falso en el suelo mojado
      const rm = mc('rf' + color, () => new THREE.MeshBasicMaterial({ map: streakTex(), color, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      const r = new THREE.Mesh(G.plane(), rm); r.rotation.set(-Math.PI / 2, 0, ry * D + Math.PI);
      const len = Math.min(p[1] * 1.4, 14);
      r.scale.set(h * aspect * 0.8, len, 1); r.position.set(p[0] + Math.sin(ry * D) * len / 2, o.reflY ?? 0.03, p[2] + Math.cos(ry * D) * len / 2); this.add(r);
    }
    return m;
  }
  ptsList(list, color, size, mode = 3) {
    const g = ptsGeo(list.length, list.length, list);
    const p = new THREE.Points(g, ptsMat(color, size, mode)); p.frustumCulled = false; this.add(p); return p;
  }
  pts(o) {
    const g = ptsGeo(o.n || 300, o.seed || 7);
    const p = new THREE.Points(g, ptsMat(o.color ?? 0xff8a3a, o.sz ?? 0.06, o.mode ?? 0));
    p.position.set(...(o.p || [0, 0, 0])); const s = o.size || [30, 20, 30]; p.scale.set(s[0], s[1], s[2]);
    p.frustumCulled = false; this.add(p); return p;
  }
  embers(o = {}) { return this.pts(Object.assign({ n: 400, color: 0xff8a3a, sz: 0.05, mode: 0, size: [40, 26, 40] }, o)); }
  burst(p, color, R = 1, n = 160, sz = 0.05) { return this.pts({ p, n, color, sz, mode: 2, size: [R, R, R], seed: (p[0] * 13 + p[2] * 7) | 0 }); }
  rain(o = {}) {
    const m = new THREE.LineSegments(lineFxGeo(o.n || 2600, o.seed || 3), lineFxMat({ color: o.color ?? 0xcfd8e4, op: o.op ?? 0.28, speed: o.speed ?? 0.9, len: o.len ?? 0.05, slant: o.slant ?? 0.008 }));
    m.position.set(...(o.p || [0, 0, 0])); m.scale.set(...(o.size || [40, 30, 40])); m.frustumCulled = false; this.add(m); return m;
  }
  streaks(o) {
    const m = new THREE.LineSegments(lineFxGeo(o.n || 400, o.seed || 11), lineFxMat({ color: o.color ?? 0xffffff, op: o.op ?? 0.35, speed: o.speed ?? 1.6, len: o.len ?? 0.2, slant: 0 }));
    m.position.set(...o.p); m.scale.set(...(o.size || [12, 60, 12]));
    m.quaternion.setFromUnitVectors(V(0, -1, 0), va(o.dir).normalize()); m.frustumCulled = false; this.add(m); return m;
  }
  glowAt(p, color, size = 1, op = 1, pulse = 0) {
    const s = glow(color, size, op); s.position.set(p[0], p[1], p[2]); this.add(s);
    if (pulse) { const ph = this.rng() * 9; this.on(t => s.scale.setScalar(size * (1 + Math.sin(t * pulse + ph) * 0.18))); }
    return s;
  }
  rings(o) {
    const g = J(this.root, ...o.p); g.quaternion.setFromUnitVectors(V(0, 0, 1), va(o.dir || [0, 1, 0]).normalize());
    const n = o.n || 3, sp = o.speed || 0.6, op = o.op ?? 0.9;
    for (let i = 0; i < n; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: o.color ?? 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide, fog: false });
      const ring = new THREE.Mesh(G.tor(o.tube || 0.04, 64), mat); g.add(ring);
      this.on(t => {
        const k = (((t * sp + i / n) % 1) + 1) % 1;
        if (o.travel) { ring.position.z = k * o.travel; ring.scale.setScalar((o.r0 || 0.2) + k * o.r); }
        else ring.scale.setScalar(o.r * (0.08 + k));
        mat.opacity = Math.pow(1 - k, 1.4) * op;
      });
    }
    return g;
  }
  trail(pts, color, radius = 0.06, op = 1) {
    const curve = new THREE.CatmullRomCurve3(pts.map(va));
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(32, pts.length * 18), radius, 8, false), trailMat(color, op));
    this.add(m); return curve;
  }
  bolt(a, b, color = 0xffb0f4, o = {}) {
    const A = va(a), B = va(b), n = o.seg || 14, pos = new Float32Array((n + 1) * 3);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, blending: THREE.AdditiveBlending, toneMapped: false, fog: false, depthWrite: false });
    const line = new THREE.Line(geo, mat); line.frustumCulled = false; this.add(line);
    const amp = o.amp ?? A.distanceTo(B) * 0.07, rr = RNG(o.seed || ((A.x * 31 + B.y * 7) | 0) + 3); let last = -1;
    const regen = () => {
      for (let i = 0; i <= n; i++) {
        const t = i / n, p = A.clone().lerp(B, t);
        if (i > 0 && i < n) { const s = Math.sin(Math.PI * t) * amp; p.x += (rr() - 0.5) * s * 2; p.y += (rr() - 0.5) * s * 2; p.z += (rr() - 0.5) * s * 2; }
        pos.set([p.x, p.y, p.z], i * 3);
      }
      geo.attributes.position.needsUpdate = true;
    };
    regen();
    this.on(t => { const k = Math.floor(t * (o.rate || 11)); if (k !== last) { last = k; regen(); mat.opacity = rr() < 0.3 ? 0.12 : 1; } });
    return line;
  }
  hexWall(o) {
    const r = o.r || 2.6, h = o.h || 3.2, arc = (o.arc || 140) * D;
    const geo = new THREE.CylinderGeometry(r, r, h, 48, 1, true, -arc / 2, arc);
    const m = new THREE.Mesh(geo, hexMat(o.color ?? 0x3fe4ff));
    const g = J(this.root, ...o.p); g.rotation.y = (o.ry || 0) * D; m.position.y = h / 2 - 0.15; g.add(m);
    return g;
  }
  debris(o) {
    const n = o.n || 40, r = RNG(o.seed || 5), geo = G.b();
    const im = new THREE.InstancedMesh(geo, toon(o.color ?? 0x2c2824), n), ink = new THREE.InstancedMesh(smoothOf(geo), inkMat, n);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, d = (o.R || 2) * Math.sqrt(r());
      const p = V(o.p[0] + Math.cos(a) * d, o.p[1] + r() * (o.h || 1.5), o.p[2] + Math.sin(a) * d);
      e.set(r() * 6, r() * 6, r() * 6); q.setFromEuler(e);
      const s = (o.size || 0.25) * (0.3 + r() * 0.9);
      m.compose(p, q, V(s, s * (0.5 + r()), s * (0.6 + r() * 0.6))); im.setMatrixAt(i, m); ink.setMatrixAt(i, m);
    }
    im.frustumCulled = ink.frustumCulled = false; this.add(im); this.add(ink);
  }

  // ------------------------------------------------------------ environments
  envRooftop() {
    return this.shared('roof', () => {
      const Y = 140;
      this.city({ n: 300, rMin: 34, rMax: 380, hMin: 30, hMax: 235, seed: 11, avoid: (x, z) => Math.abs(x) < 28 && Math.abs(z) < 28 });
      this.skyline({ n: 110, rMin: 430, rMax: 560, hMin: 70, hMax: 320, color: 0x1c0d07, seed: 4 });
      this.skyline({ n: 80, rMin: 600, rMax: 760, hMin: 90, hMax: 380, color: 0x3a1a0c, seed: 5 });
      this.pyramid([-300, 0, -380], 1.1);
      this.flames([[180, 70, -260], [230, 90, -300], [-120, 60, 280], [320, 80, 120]]);
      this.add(new THREE.Mesh(boxGeo(30, Y, 30, 0, Y / 2, 0, 10, 20), bldMat(1, 0.55)));
      const mRoof = toon(0x2a2a2e), mTrim = toon(0x4c3c2c), mDark = toon(0x16171b);
      put(this.root, G.b(), mRoof, [0, Y + 0.15, 0], [30.4, 0.3, 30.4], 0, false);
      for (const s of [1, -1]) {
        put(this.root, G.b(), mTrim, [0, Y + 0.7, s * 15], [30.4, 1.1, 0.45]);
        put(this.root, G.b(), mTrim, [s * 15, Y + 0.7, 0], [0.45, 1.1, 30.4]);
      }
      for (const [x, z, w, d] of [[9, 7, 3, 2.2], [-9.5, 8, 2.6, 3], [10, -4, 2.2, 2.2], [-10, -2, 3.2, 2], [3, 11, 4, 2]]) {
        put(this.root, G.b(), mDark, [x, Y + 0.95, z], [w, 1.6, d]);
        put(this.root, G.cyl(1, 1, 16), toon(0x35373d), [x, Y + 1.8, z], [Math.min(w, d) * 0.35, 0.12, Math.min(w, d) * 0.35]);
      }
      put(this.root, G.cyl(1, 1, 8), mDark, [-11, Y + 9, -11], [0.18, 18, 0.18], 0, false);
      put(this.root, G.cyl(1, 1, 8), mDark, [-11, Y + 6, -11], [0.6, 0.3, 0.6], 0, false);
      const bl = this.glowAt([-11, Y + 18.3, -11], 0xff2020, 2.4); this.on(t => { bl.visible = Math.sin(t * 3) > 0; });
      put(this.root, G.tor(0.03, 64), flat(0x7a5a30), [0, Y + 0.32, 3], [5, 5, 1], [90, 0, 0], false);
      for (const [x, z] of [[-14.6, -14.6], [14.6, -14.6], [-14.6, 14.6], [14.6, 14.6]]) this.glowAt([x, Y + 1.4, z], 0xffa040, 1.2);
      this.sign('NEO·ESPARTA', '#3fe4ff', [46, Y + 18, -38], -55, 6, { box: true });
      this.sign('ΛΕΩΝ', '#ff3d9a', [-52, Y - 10, -44], 40, 8, { flicker: true });
      this.sign('300', '#ffb23a', [60, Y + 40, 30], -110, 10, { box: true });
      this.sign('ΣΠΑΡΤΗ', '#ff3d9a', [-40, Y + 30, 50], 140, 7);
      this.traffic({ n: 16, r: [55, 260], y: [Y - 30, Y + 50], seed: 4 });
      this.searchlight([120, 90, -180], 0xfff2d8, 0); this.searchlight([-160, 60, -120], 0xffd0f0, 2); this.searchlight([60, 100, 220], 0xd8f4ff, 4);
    });
  }
  envStreet() {
    return this.shared('street', () => {
      const r = RNG(77);
      const gm = std(0x15161a, 0.32, 0.5);
      const g1 = new THREE.Mesh(new THREE.PlaneGeometry(76, 700), gm); g1.rotation.x = -Math.PI / 2; g1.position.set(26, 0, 0); this.add(g1);
      const g2 = new THREE.Mesh(new THREE.PlaneGeometry(50, 700), gm); g2.rotation.x = -Math.PI / 2; g2.position.set(-49, 0, 0); this.add(g2);
      const wm = std(0x081018, 0.06, 0.85, { transparent: true, opacity: 0.86 });
      const wa = new THREE.Mesh(new THREE.PlaneGeometry(12, 700), wm); wa.rotation.x = -Math.PI / 2; wa.position.set(-18, -1.6, 0); wa.renderOrder = 2; this.add(wa);
      const bot = new THREE.Mesh(new THREE.PlaneGeometry(12, 700), std(0x050607, 1, 0)); bot.rotation.x = -Math.PI / 2; bot.position.set(-18, -7, 0); this.add(bot);
      put(this.root, G.b(), toon(0x2a2420), [-12.15, -3.5, 0], [0.3, 7, 700], 0, false);
      put(this.root, G.b(), toon(0x2a2420), [-23.85, -3.5, 0], [0.3, 7, 700], 0, false);
      put(this.root, G.b(), toon(0x3a3028), [-12.3, 0.08, 0], [0.6, 0.16, 700], 0, false);
      put(this.root, G.b(), toon(0x3a3028), [-23.7, 0.08, 0], [0.6, 0.16, 700], 0, false);
      // marcas de carril luminosas
      const dash = []; for (let z = -340; z < 340; z += 6) dash.push(boxGeo(0.18, 0.02, 2.6, 0, 0.01, z));
      this.add(new THREE.Mesh(mergeGeometries(dash), flat(0x2a8aa0)));
      // casas del canal (frontales con gablete) + torres
      const lists = [[], [], []], gables = [];
      for (const side of [1, -1]) {
        let z = -340;
        while (z < 340) {
          const w = 7 + r() * 9, d = 14 + r() * 10, tall = r() < 0.18;
          const h = tall ? 70 + r() * 110 : 14 + r() * 22;
          const x = side > 0 ? 12 + d / 2 : -40 - d / 2;
          const v = (r() * 3) | 0;
          lists[v].push(boxGeo(d, h, w, x, h / 2, z + w / 2));
          if (!tall && r() < 0.75) { const gg = new THREE.ConeGeometry(w * 0.72, w * 0.55, 4, 1); gg.rotateY(Math.PI / 4); gg.scale(d / w * 0.98, 1, 1); gg.translate(x, h + w * 0.27, z + w / 2); gables.push(gg); }
          z += w + (r() < 0.2 ? 2 + r() * 4 : 0.2);
        }
      }
      for (let v = 0; v < 3; v++) this.add(new THREE.Mesh(mergeGeometries(lists[v]), bldMat(v, 1)));
      this.add(new THREE.Mesh(mergeGeometries(gables), toon(0x1a1416)));
      // escaparates
      for (const side of [1, -1]) for (let z = -120; z < 120; z += 9 + r() * 8) {
        const c = [0xffb35c, 0x3fe4ff, 0xff4fb0, 0xffe0a0][(r() * 4) | 0];
        put(this.root, G.b(), flat(c, { transparent: true, opacity: 0.55 }), [side > 0 ? 11.95 : -39.95, 1.6, z], [0.1, 2.2, 3 + r() * 3], 0, false);
      }
      this.city({ n: 220, rMin: 110, rMax: 430, hMin: 70, hMax: 300, seed: 8, avoid: (x) => x > -100 && x < 80, beacons: true });
      this.skyline({ n: 90, rMin: 470, rMax: 620, hMin: 90, hMax: 340, color: 0x1e0f0a, seed: 12 });
      this.flames([[-160, 80, -260], [140, 90, -300]]);
      // puentes
      for (const bz of [26, -72]) {
        put(this.root, G.b(), toon(0x2c2622), [-18, 0.25, bz], [13, 0.5, 6]);
        put(this.root, G.tor(0.09, 24, Math.PI), toon(0x2c2622), [-18, -0.1, bz], [5.8, 2.4, 30], 0, false);
        for (const s of [1, -1]) {
          put(this.root, G.b(), toon(0x3c3028), [-18, 1.0, bz + s * 2.9], [13, 0.12, 0.12], 0, false);
          for (let x = -23; x <= -13; x += 2.5) put(this.root, G.b(), toon(0x3c3028), [x, 0.75, bz + s * 2.9], [0.08, 1.0, 0.08], 0, false);
          for (const x of [-24.2, -11.8]) { put(this.root, G.cyl(1, 1, 8), toon(0x1c1c20), [x, 2, bz + s * 2.9], [0.08, 4, 0.08], 0, false); this.glowAt([x, 4.1, bz + s * 2.9], 0xffc070, 2.2); }
        }
      }
      // farolas del muelle
      for (let z = -150; z < 150; z += 16) { put(this.root, G.cyl(1, 1, 8), toon(0x1c1c20), [-10.8, 2.6, z], [0.07, 5.2, 0.07], 0, false); this.glowAt([-10.8, 5.3, z], 0xffb060, 2.6); }
      for (let z = -150; z < 150; z += 22) { put(this.root, G.cyl(1, 1, 8), toon(0x1c1c20), [10.6, 3, z], [0.07, 6, 0.07], 0, false); this.glowAt([10.6, 6.1, z], 0x9fe8ff, 2.2); }
      // neones
      const S = [
        ['ΣΠΑΡΤΗ', '#ff3d9a', [11.85, 8.5, -14], -90, 2.6, { box: true, refl: true }],
        ['BAR TERMÓPILAS', '#3fe4ff', [11.85, 4.6, 7], -90, 1.4, { refl: true }],
        ['ΛΕΩΝ', '#ffb23a', [11.85, 13, 22], -90, 3.2, { flicker: true }],
        ['NOODLES Δ', '#ff5050', [11.85, 4.2, -32], -90, 1.4, { refl: true }],
        ['HOTEL AQUILES', '#c07bff', [11.85, 11, -48], -90, 1.6, { box: true }],
        ['300', '#ff3d9a', [11.85, 18, -70], -90, 5],
        ['ΑΘΗΝΑ', '#3fe4ff', [-39.85, 10, 30], 90, 3, { box: true }],
        ['NEO·ESPARTA', '#ffb23a', [-39.85, 6, -6], 90, 2.2, { refl: true, reflY: 0.03 }],
        ['ΣΠΑΡΤΗ', '#ff3d9a', [-39.85, 15, 16], 90, 4, { vertical: false, flicker: true }],
        ['FARMACIA 24H', '#4aff9a', [-39.85, 4, -40], 90, 1.4],
        ['ΩΜΕΓΑ', '#3fe4ff', [11.85, 26, 48], -90, 4, { box: true }],
      ];
      for (const s of S) this.sign(...s);
      this.sign('ΛΕΩΝ', '#3fe4ff', [11.4, 16, -24], -90, 1.4, { vertical: true, fs: 90 });
      this.sign('ΝΕΣΤΩΡ', '#ff3d9a', [11.4, 15, 36], -90, 1.4, { vertical: true, fs: 90 });
      this.traffic({ n: 18, lane: { x: [-30, 30], y: [26, 70] }, seed: 9 });
      this.searchlight([60, 60, -200], 0xfff2d8, 1); this.searchlight([-140, 70, -150], 0xffd0f0, 3);
      this.pts({ p: [20, 2, -10], n: 60, color: 0x9a9a9a, sz: 0.4, mode: 0, size: [2, 6, 2], seed: 3 });
    });
  }
  envCanyon() {
    return this.shared('canyon', () => {
      const r = RNG(31), lists = [[], [], []];
      const gnd = new THREE.Mesh(new THREE.PlaneGeometry(400, 1200), std(0x0c0d11, 0.4, 0.4)); gnd.rotation.x = -Math.PI / 2; gnd.position.set(0, 0, -200); this.add(gnd);
      for (const side of [1, -1]) {
        let z = 160;
        while (z > -760) {
          const w = 14 + r() * 26, d = 22 + r() * 20, h = 80 + Math.pow(r(), 1.4) * 210, gap = r() < 0.25 ? 6 + r() * 10 : 0.5;
          const fx = side * (17 + r() * 5), x = fx + side * d / 2, v = (r() * 3) | 0;
          lists[v].push(boxGeo(d, h, w, x, h / 2, z - w / 2));
          if (r() < 0.65) {
            const cols = ['#ff3d9a', '#3fe4ff', '#ffb23a', '#c07bff', '#ff5050'], c = cols[(r() * 5) | 0];
            const words = ['ΣΠΑΡΤΗ', 'ΛΕΩΝ', 'NEO·ESPARTA', '300', 'ΑΘΗΝΑ', 'ΤΕΡΜΟΠΥΛΑΙ', 'ΝΕΣΤΩΡ', 'BAR ΔΕΛΤΑ', 'ΩΜΕΓΑ'];
            const word = words[(r() * words.length) | 0], vert = r() < 0.45;
            this.sign(word, c, [fx - side * 0.3, 26 + r() * 70, z - w * (0.2 + r() * 0.6)], side > 0 ? -90 : 90, vert ? 2.4 : 3 + r() * 3, { vertical: vert, fs: vert ? 90 : 110, flicker: r() < 0.2 });
          }
          z -= w + gap;
        }
      }
      for (let v = 0; v < 3; v++) this.add(new THREE.Mesh(mergeGeometries(lists[v]), bldMat(v, 1.1)));
      for (let i = 0; i < 9; i++) {
        const z = -40 - i * 80 - r() * 30, y = 70 + r() * 90;
        put(this.root, G.b(), toon(0x1c1d22), [0, y, z], [60, 3, 5], 0, false);
        put(this.root, G.b(), flat(0x3fe4ff), [0, y - 1.55, z], [60, 0.12, 0.2], 0, false);
      }
      this.skyline({ n: 90, rMin: 450, rMax: 650, hMin: 120, hMax: 380, color: 0x0e0816, seed: 14, cz: -200 });
      this.traffic({ n: 26, lane: { x: [-10, 10], y: [20, 120] }, seed: 13 });
      this.searchlight([0, 0, -320], 0xd8f4ff, 2);
    });
  }
  envStadium() {
    return this.shared('stadium', () => {
      // césped
      const pitch = canvasTex(1024, 690, (x, w, h) => {
        for (let i = 0; i < 14; i++) { x.fillStyle = i % 2 ? '#3a4a24' : '#33421f'; x.fillRect(i * w / 14, 0, w / 14 + 1, h); }
        const s = w / 110; x.strokeStyle = 'rgba(225,225,210,0.55)'; x.lineWidth = 3;
        const L = (x0, y0, ww, hh) => x.strokeRect((x0 + 2.5) * s, (y0 + 2) * s, ww * s, hh * s);
        L(0, 0, 105, 68); x.beginPath(); x.moveTo((52.5 + 2.5) * s, 2 * s); x.lineTo((52.5 + 2.5) * s, 70 * s); x.stroke();
        x.beginPath(); x.arc(55 * s, 36 * s, 9.15 * s, 0, Math.PI * 2); x.stroke();
        L(0, 13.84, 16.5, 40.32); L(88.5, 13.84, 16.5, 40.32); L(0, 24.84, 5.5, 18.32); L(99.5, 24.84, 5.5, 18.32);
        x.fillStyle = '#eee'; x.beginPath(); x.arc(55 * s, 36 * s, 4, 0, 7); x.fill();
      });
      const pm = new THREE.Mesh(new THREE.PlaneGeometry(110, 74), toon(0xffffff, {})); pm.material = new THREE.MeshToonMaterial({ map: pitch, gradientMap: gradMap });
      pm.rotation.x = -Math.PI / 2; this.add(pm);
      const out = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), std(0x0d0e12, 0.6, 0.2)); out.rotation.x = -Math.PI / 2; out.position.y = -0.05; this.add(out);
      // porterías
      for (const s of [1, -1]) {
        const gx = s * 52.5, wm = toon(0xeeeeea);
        for (const z of [-3.66, 3.66]) put(this.root, G.cyl(1, 1, 10), wm, [gx, 1.22, z], [0.07, 2.44, 0.07], 0, false);
        put(this.root, G.cyl(1, 1, 10), wm, [gx, 2.44, 0], [0.07, 7.4, 0.07], [90, 0, 0], false);
        put(this.root, G.b(), mc('net', () => new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.25 })), [gx + s * 1, 1.22, 0], [2, 2.44, 7.32], 0, false);
      }
      const g = J(this.root, 0, 0, 0); g.scale.z = 0.8;
      // grada (lathe)
      const prof = [[64, 0], [64, 1.8]];
      for (let i = 0; i <= 6; i++) prof.push([65 + i * 3.5, 2.2 + i * 2.97]);
      prof.push([87.5, 20.6], [88.5, 23]);
      for (let i = 0; i <= 7; i++) prof.push([89.5 + i * 3.5, 23.5 + i * 3.2]);
      prof.push([116.5, 47.5], [118, 0]);
      const NP = prof.length - 1;
      const seats = canvasTex(2048, 512, (x, w, h) => {
        const V2Y = (v) => (1 - v) * h;
        x.fillStyle = '#7a0f15'; x.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 5) { x.fillStyle = 'rgba(0,0,0,0.38)'; x.fillRect(0, y, w, 1.6); }
        for (let u = 0; u < w; u += 42) { x.fillStyle = 'rgba(30,10,10,0.8)'; x.fillRect(u, 0, 3, h); }
        // anuncios LED (pared delantera)
        x.fillStyle = '#05080c'; x.fillRect(0, V2Y(1 / NP), w, V2Y(0) - V2Y(1 / NP));
        x.font = '700 15px "Barlow Condensed", Arial'; x.fillStyle = '#3fe4ff'; x.textBaseline = 'middle';
        for (let u = 0; u < w; u += 220) x.fillText('NEO·ESPARTA FC  ·  ΛΕΩΝ  ·  300', u + 8, (V2Y(1 / NP) + V2Y(0)) / 2);
        // banda de palcos
        const a = 9 / NP, b = 11 / NP;
        x.fillStyle = '#0a0a0e'; x.fillRect(0, V2Y(b), w, V2Y(a) - V2Y(b));
        for (let u = 0; u < w; u += 18) { x.fillStyle = Math.random() < 0.6 ? '#ffd9a0' : '#3fe4ff'; x.globalAlpha = 0.4 + Math.random() * 0.5; x.fillRect(u, V2Y(b) + 6, 10, (V2Y(a) - V2Y(b)) - 12); }
        x.globalAlpha = 1;
        // muro exterior
        x.fillStyle = '#101218'; x.fillRect(0, 0, w, V2Y((NP - 1) / NP));
        for (let u = 0; u < w; u += 32) { x.fillStyle = '#ff2fa8'; x.globalAlpha = 0.7; x.fillRect(u, 0, 3, V2Y((NP - 1) / NP)); }
        x.globalAlpha = 1;
        // letras en asientos blancos (invertidas: se ven desde dentro)
        const words = [['ESPARTA', 0.5], ['ΛΕΩΝ', 0.0], ['300', 0.25], ['300', 0.75]];
        const yTop = V2Y(18 / NP), yBot = V2Y(12 / NP);
        for (const [word, uc] of words) {
          x.save(); x.translate(uc * w, (yTop + yBot) / 2); x.scale(-1, 1);
          x.font = `900 ${Math.round((yBot - yTop) * 0.95)}px "Barlow Condensed", Arial`; x.textAlign = 'center'; x.textBaseline = 'middle';
          x.fillStyle = '#e8e2d8'; x.fillText(word, 0, 0);
          if (uc === 0) { x.translate(-w, 0); x.fillText(word, 0, 0); x.translate(2 * w, 0); x.fillText(word, 0, 0); }
          x.restore();
        }
      });
      const lathe = new THREE.LatheGeometry(prof.map(p => new THREE.Vector2(p[0], p[1])), 128);
      const bowl = new THREE.Mesh(lathe, new THREE.MeshToonMaterial({ map: seats, gradientMap: gradMap, side: THREE.DoubleSide }));
      g.add(bowl);
      // techo
      const mT = toon(0x1a1b20);
      put(g, G.tor(0.012, 96), mT, [0, 57, 0], [80, 80, 60], [90, 0, 0], false);
      put(g, G.tor(0.01, 96), mT, [0, 47.6, 0], [117, 117, 60], [90, 0, 0], false);
      const truss = [];
      for (let i = 0; i < 64; i++) { const a = i / 64 * Math.PI * 2; const bx = new THREE.BoxGeometry(26, 0.6, 0.6); bx.rotateZ(-0.12); bx.translate(93, 55.5, 0); bx.rotateY(a); truss.push(bx); }
      g.add(new THREE.Mesh(mergeGeometries(truss), mT));
      const ring = new THREE.Mesh(new THREE.RingGeometry(80, 105, 96, 1), toon(0x121318, { side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = 56.5; g.add(ring);
      for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2; put(g, G.b(), mT, [Math.cos(a) * 106, 51.5, Math.sin(a) * 106], [0.7, 10, 0.7], 0, false); }
      for (let i = 0; i < 24; i++) {
        const a = i / 24 * Math.PI * 2, x = Math.cos(a) * 80, z = Math.sin(a) * 80;
        put(g, G.b(), flat(0xfff6e0), [x, 56, z], [2.4, 0.8, 2.4], 0, false);
        const s = glow(0xfff2dc, 14, 0.75); s.position.set(x, 55.5, z); g.add(s);
      }
      put(g, G.tor(0.004, 128), flat(0xff2fa8), [0, 30, 0], [118.4, 118.4, 300], [90, 0, 0], false);
      put(g, G.tor(0.004, 128), flat(0x3fe4ff), [0, 12, 0], [118.4, 118.4, 300], [90, 0, 0], false);
      // público: siluetas + ojos
      const r = RNG(19), N = 2600, eyes = [];
      const blob = gc('blob', () => { const a = new THREE.SphereGeometry(0.55, 8, 6); a.scale(1, 1.25, 0.9); const b = new THREE.SphereGeometry(0.32, 8, 6); b.translate(0, 0.85, 0.1); const c = new THREE.ConeGeometry(0.09, 0.5, 5); c.translate(0.22, 1.25, 0); const d = c.clone(); d.translate(-0.44, 0, 0); return mergeGeometries([a.toNonIndexed(), b.toNonIndexed(), c.toNonIndexed(), d.toNonIndexed()]); });
      const im = new THREE.InstancedMesh(blob, toon(0x1a1020), N); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
      for (let i = 0; i < N; i++) {
        const tier = r() < 0.45 ? [65, 86, 2.2, 20] : [89.5, 114, 23.5, 46];
        const t = r(), rad = tier[0] + t * (tier[1] - tier[0]), y = tier[2] + t * (tier[3] - tier[2]) + 0.7;
        const a = r() * Math.PI * 2, x = Math.cos(a) * rad, z = Math.sin(a) * rad;
        q.setFromAxisAngle(V(0, 1, 0), Math.atan2(-x, -z)); const s = 0.8 + r() * 0.5;
        m4.compose(V(x, y, z), q, V(s, s, s)); im.setMatrixAt(i, m4);
        const nx = -x / rad, nz = -z / rad, tx = -nz * 0.17 * s, tz = nx * 0.17 * s;
        eyes.push([x + nx * 0.4 + tx, y + 0.9 * s, z + nz * 0.4 + tz], [x + nx * 0.4 - tx, y + 0.9 * s, z + nz * 0.4 - tz]);
      }
      im.frustumCulled = false; g.add(im);
      const ep = new THREE.Points(ptsGeo(eyes.length, 5, eyes), ptsMat(0xff3df2, 0.16, 3)); ep.frustumCulled = false; g.add(ep);
      // ciudad alrededor
      this.city({ n: 260, rMin: 175, rMax: 520, hMin: 40, hMax: 260, seed: 23 });
      this.skyline({ n: 90, rMin: 560, rMax: 720, hMin: 90, hMax: 360, color: 0x160a14, seed: 24 });
      this.flames([[260, 80, -320], [-300, 90, 200]]);
      this.traffic({ n: 14, r: [140, 300], y: [40, 110], seed: 33 });
    });
  }

  // ------------------------------------------------------------ heroes
  hero(kind, poseName, o = {}) {
    const N = kind === 'n', B = BODY[kind], C = COL[kind];
    const P = Object.assign({}, POSES[poseName] || POSES.stand, o.pose || {});
    const face = o.face || P.face || (N ? 'angry' : 'neutral');
    const m = {
      skin: toon(C.skin), hair: toon(C.hair), hair2: toon(C.hair2), armor: toon(C.armor), armor2: toon(C.armor2),
      bronze: toon(0x94673a), bronzeHi: toon(0xc8995a), leather: toon(0x2c1c12), boot: toon(0x17181c),
      eye: toon(0x140b08), sclera: toon(0xb8a890), mouth: toon(0x2a0b08), neon: flat(0x3fe4ff),
      beard: toon(N ? C.beard : C.hair), beardG: toon(N ? C.beardG : C.hair),
    };
    const root = new THREE.Group(); const j = { root };
    const hipY = B.thigh + B.shin + 0.075 + 0.04;
    j.hips = J(root, 0, hipY, 0);
    const cw = B.chestW, T = B.torso, dz = cw * B.dep;
    put(j.hips, G.s(), m.armor, [0, 0, 0], [cw * B.taper * 1.1, 0.12, cw * B.taper * B.dep * 1.25]);
    // piernas
    for (const s of [1, -1]) {
      const L = s > 0 ? 'l' : 'r';
      const hp = j[L + 'Hip'] = J(j.hips, s * B.hipW, -0.04, 0);
      put(hp, G.cap(B.legR, B.thigh - B.legR), m.armor, [0, -B.thigh / 2, 0]);
      put(hp, G.s(), m.armor, [0, -B.thigh * 0.36, B.legR * 0.12], [B.legR * 1.12, B.thigh * 0.32, B.legR * 1.08], 0, false);
      const kn = j[L + 'Kn'] = J(hp, 0, -B.thigh, 0);
      put(kn, G.s(), m.bronze, [0, 0, B.legR * 0.62], [B.legR * 0.8, B.legR * 0.85, B.legR * 0.6]);
      put(kn, G.cap(B.legR * 0.8, B.shin - B.legR), m.armor, [0, -B.shin / 2, 0]);
      put(kn, G.cyl(1, 0.75), N ? m.bronze : m.armor2, [0, -B.shin * 0.46, B.legR * 0.1], [B.legR * 1.08, B.shin * 0.66, B.legR * 1.02]);
      if (!N) put(kn, G.b(), m.neon, [0, -B.shin * 0.45, B.legR * 1.1], [0.012, B.shin * 0.5, 0.01], 0, false);
      const an = j[L + 'An'] = J(kn, 0, -B.shin, 0);
      put(an, G.s(), m.boot, [0, -0.032, B.foot * 0.3], [B.legR * 0.95, 0.045, B.foot * 0.78]);
      if (!N) put(an, G.s(), toon(0xe8e4dc), [0, -0.062, B.foot * 0.3], [B.legR * 1.02, 0.018, B.foot * 0.82]);
    }
    // torso
    j.spine = J(j.hips, 0, 0.05, 0);
    put(j.spine, G.cyl(1, B.taper), m.armor, [0, T * 0.5, 0], [cw, T, dz]);
    put(j.spine, G.s(), m.armor, [0, T * 0.86, -dz * 0.04], [cw * 0.99, T * 0.2, dz * 1.02]);
    if (N) {
      for (const s of [1, -1]) put(j.spine, G.s(), m.bronze, [s * cw * 0.42, T * 0.74, dz * 0.48], [cw * 0.48, T * 0.15, dz * 0.5]);
      put(j.spine, G.s(), m.bronze, [0, T * 0.4, dz * 0.42], [cw * 0.6, T * 0.3, dz * 0.58]);
      for (const y of [0.3, 0.44]) put(j.spine, G.b(), m.armor, [0, T * y, dz * 0.99], [cw * 0.72, 0.008, 0.03], 0, false);
      put(j.spine, G.b(), m.armor, [0, T * 0.38, dz * 1.02], [0.008, T * 0.36, 0.03], 0, false);
      for (const s of [1, -1]) put(j.spine, G.b(), m.neon, [s * 0.014, T * 0.6, dz * 0.93], [0.011, 0.075, 0.012], [0, 0, s * 22], false);
      for (let i = -3; i <= 3; i++) {
        const a = i * 26, rr = cw * B.taper * 1.05;
        put(j.hips, G.b(), m.leather, [Math.sin(a * D) * rr, -0.07, Math.cos(a * D) * rr * B.dep * 1.25], [0.07, 0.2, 0.016], [-10, a, 0, 'YXZ']);
      }
      put(j.hips, G.tor(0.2, 28), toon(0x9a2c18), [0, 0.075, 0], [cw * B.taper * 1.06, cw * B.taper * B.dep * 1.32, 0.22], [90, 0, 0]);
    } else {
      put(j.spine, G.s(), m.armor2, [0, T * 0.68, dz * 0.42], [cw * 0.82, T * 0.24, dz * 0.62]);
      put(j.spine, G.cyl(1, 1, 20), m.bronze, [0, T * 0.7, dz * 1.04], [0.032, 0.012, 0.032], [90, 0, 0]);
      put(j.spine, G.tor(0.16, 20), m.neon, [0, T * 0.7, dz * 1.06], [0.036, 0.036, 0.4], 0, false);
      for (const s of [1, -1]) put(j.spine, G.b(), m.neon, [s * cw * 0.55, T * 0.42, dz * 0.92], [0.01, T * 0.32, 0.01], [0, 0, s * -12], false);
      put(j.hips, G.tor(0.2, 28), m.armor2, [0, 0.07, 0], [cw * B.taper * 1.06, cw * B.taper * B.dep * 1.3, 0.25], [90, 0, 0]);
      put(j.hips, G.b(), m.neon, [0, 0.07, cw * B.taper * B.dep * 1.32], [0.04, 0.02, 0.01], 0, false);
      put(j.spine, G.tor(0.3, 20), toon(C.cape), [0, T * 0.99, -0.005], [cw * 0.5, dz * 0.8, 0.16], [90, 0, 0]);
    }
    // cabeza
    j.neck = J(j.spine, 0, T, 0);
    put(j.neck, G.cyl(0.9, 1), m.skin, [0, B.neck * 0.3, 0.005], [B.head * (N ? 0.55 : 0.45), B.neck * 1.8, B.head * (N ? 0.55 : 0.47)]);
    j.head = J(j.neck, 0, B.neck, 0);
    const r = B.head, H = j.head;
    put(H, G.s(), m.skin, [0, r * 0.95, 0.01], [r * 0.84, r * 1.0, r * 0.95]);
    if (!N) put(H, G.s(), m.skin, [0, r * 0.62, r * 0.26], [r * 0.62, r * 0.55, r * 0.64], 0, false);
    for (const s of [1, -1]) put(H, G.s(), m.skin, [s * r * 0.82, r * 0.9, -r * 0.04], [r * 0.11, r * 0.21, r * 0.15]);
    put(H, G.s(), m.skin, [0, r * 0.84, r * 0.92], [r * 0.12, r * 0.22, r * 0.15], [-12, 0, 0]);
    put(H, G.s(), m.skin, [0, r * 1.1, r * 0.72], [r * 0.6, r * 0.11, r * 0.24], 0, false);
    const ey = r * (N ? 0.98 : 0.93), ex = r * 0.31, ez = r * (N ? 0.85 : 0.84);
    for (const s of [1, -1]) {
      put(H, G.sl(), m.sclera, [s * ex, ey, ez - r * 0.012], [r * (N ? 0.15 : 0.19), r * (N ? 0.07 : 0.12), r * 0.065], 0, false);
      put(H, G.sl(), m.eye, [s * ex, ey - r * 0.005, ez + r * 0.028], [r * (N ? 0.095 : 0.11), r * (N ? 0.072 : 0.115), r * 0.05], 0, false);
    }
    const ang = { angry: 16, roar: 24, smile: 2, shout: -12, neutral: 6 }[face] ?? 6;
    for (const s of [1, -1]) put(H, G.b(), m.hair, [s * r * 0.31, r * (N ? 1.14 : 1.1), r * 0.86], [r * 0.4, r * (N ? 0.09 : 0.06), r * 0.1], [0, 0, s * ang], false);
    if (N) {
      put(H, G.s(), m.beard, [0, r * 0.44, r * 0.1], [r * 0.87, r * 0.58, r * 0.84]);
      put(H, G.s(), m.beard, [0, r * 0.14, r * 0.36], [r * 0.56, r * 0.44, r * 0.46]);
      put(H, G.s(), m.beardG, [0, -r * 0.04, r * 0.5], [r * 0.3, r * 0.22, r * 0.24], 0, false);
      for (const s of [1, -1]) put(H, G.s(), m.beardG, [s * r * 0.52, r * 0.34, r * 0.46], [r * 0.16, r * 0.2, r * 0.2], 0, false);
      put(H, G.s(), m.beard, [0, r * 0.69, r * 0.93], [r * 0.38, r * 0.1, r * 0.14], 0, false);
      // pelo: ondas hacia atrás, canas en las sienes
      put(H, G.s(), m.hair, [0, r * 1.22, -r * 0.26], [r * 0.94, r * 0.74, r * 0.96]);
      put(H, G.s(), m.hair, [0, r * 0.95, -r * 0.58], [r * 0.84, r * 0.7, r * 0.52]);
      for (let i = 0; i < 4; i++) put(H, G.s(), i === 1 || i === 3 ? m.hair2 : m.hair, [(i % 2 ? -1 : 1) * r * 0.1, r * (1.66 - i * 0.06), r * (0.36 - i * 0.3)], [r * 0.6, r * 0.27, r * 0.42], [-12 + i * 6, 0, (i % 2 ? 8 : -8)]);
      for (const s of [1, -1]) put(H, G.s(), m.hair2, [s * r * 0.6, r * 1.36, -r * 0.18], [r * 0.3, r * 0.3, r * 0.62], [0, s * 10, s * -14]);
      put(H, G.s(), m.hair, [r * 0.22, r * 1.5, r * 0.7], [r * 0.32, r * 0.16, r * 0.24], [-30, 0, -24], false);
    } else {
      put(H, G.s(), m.hair, [0, r * 1.24, -r * 0.2], [r * 0.93, r * 0.76, r * 0.98]);
      for (const s of [1, -1]) put(H, G.s(), m.hair, [s * r * 0.4, r * 1.52, r * 0.56], [r * 0.44, r * 0.24, r * 0.32], [10, 0, s * -34]);
      for (const s of [1, -1]) put(H, G.s(), m.hair2, [s * r * 0.62, r * 1.18, r * 0.5], [r * 0.2, r * 0.36, r * 0.24], [0, 0, s * -18]);
      for (const s of [1, -1]) put(H, G.s(), m.hair, [s * r * 0.84, r * 0.78, -r * 0.08], [r * 0.25, r * 0.8, r * 0.66], [0, 0, s * 6]);
      put(H, G.s(), m.hair, [0, r * 0.7, -r * 0.52], [r * 0.92, r * 0.95, r * 0.55]);
      for (const s of [1, -1]) put(H, G.s(), m.hair, [s * r * 0.72, r * 0.02, -r * 0.2], [r * 0.34, r * 0.36, r * 0.52], [0, 0, s * -20]);
      put(H, G.s(), m.hair2, [r * 0.3, r * 1.8, r * 0.1], [r * 0.35, r * 0.15, r * 0.5], 0, false);
    }
    // boca
    const open = face === 'roar' || face === 'shout';
    if (face === 'smile') put(H, G.tor(0.2, 12, Math.PI * 0.8), m.mouth, [r * 0.02, r * 0.6, N ? r * 1.0 : r * 0.9], [r * 0.15, r * 0.1, r * 0.1], [0, 0, 196], false);
    else put(H, G.s(), m.mouth, [0, r * (open ? 0.5 : 0.57), N ? r * 0.99 : r * 0.84], [r * (open ? 0.26 : 0.18), r * (open ? 0.2 : 0.028), r * 0.1], 0, false);
    if (open) put(H, G.b(), toon(0xe8e0d0), [0, r * 0.66, N ? r * 1.05 : r * 0.92], [r * 0.3, r * 0.05, r * 0.04], 0, false);
    j.mouth = J(H, 0, r * 0.6, r * 1.05);
    // brazos
    for (const s of [1, -1]) {
      const L = s > 0 ? 'l' : 'r';
      const sh = j[L + 'Sh'] = J(j.spine, s * B.shW, B.shY, 0);
      if (N) { put(sh, G.s(), m.bronze, [s * 0.012, 0.02, 0], [0.092, 0.07, 0.088]); put(sh, G.s(), m.armor2, [s * 0.025, -0.035, 0], [0.085, 0.045, 0.08]); }
      else put(sh, G.s(), m.armor2, [s * 0.008, 0.01, 0], [0.065, 0.055, 0.065]);
      put(sh, G.cap(B.armR, B.upA - B.armR), N ? m.skin : m.armor, [0, -B.upA / 2, 0]);
      if (N) put(sh, G.s(), m.skin, [0, -B.upA * 0.42, B.armR * 0.2], [B.armR * 1.12, B.upA * 0.3, B.armR * 1.1], 0, false);
      const el = j[L + 'El'] = J(sh, 0, -B.upA, 0);
      put(el, G.cap(B.armR * 0.88, B.foA - B.armR), N ? m.skin : m.armor, [0, -B.foA / 2, 0]);
      put(el, G.cyl(1, 0.86), N ? m.bronze : m.armor2, [0, -B.foA * 0.56, 0], [B.armR * 1.2, B.foA * 0.62, B.armR * 1.2]);
      if (!N) put(el, G.tor(0.15, 20), m.neon, [0, -B.foA * 0.8, 0], [B.armR * 1.24, B.armR * 1.24, 0.4], [90, 0, 0], false);
      if (N && s > 0) put(el, G.b(), m.neon, [B.armR * 1.12, -B.foA * 0.6, 0], [0.012, 0.06, 0.04], 0, false);
      const wr = j[L + 'Wr'] = J(el, 0, -B.foA, 0);
      put(wr, G.s(), N ? m.skin : m.armor2, [0, -0.04, 0.004], [B.armR * 0.98, 0.052, B.armR * 0.86]);
    }
    // capa
    if (o.cape !== false && P.cape !== false) {
      const cp = Object.assign({ lift: 8, amp: 0.05, freq: 2.0, billow: N ? 0.22 : 0.14, flare: 0.45, sway: 0.04 }, P.cape || {}, o.capeP || {});
      const cw2 = N ? 0.6 : 0.34, cl = N ? 1.42 : 0.7;
      const geo = new THREE.PlaneGeometry(cw2, cl, 6, 12); geo.translate(0, -cl / 2, 0);
      const base = Float32Array.from(geo.attributes.position.array);
      const an = J(j.spine, 0, B.shY + 0.04, -dz - 0.015); an.rotation.x = cp.lift * D;
      const cape = new THREE.Mesh(geo, toon(C.cape, { side: THREE.DoubleSide })); cape.userData.dyn = true; an.add(cape);
      for (const s of [1, -1]) put(an, G.s(), m.bronzeHi, [s * cw2 * 0.45, -0.01, 0.02], [0.03, 0.03, 0.02]);
      const ph = this.rng() * 10, pa = geo.attributes.position;
      const upd = (t) => {
        for (let i = 0; i < pa.count; i++) {
          const x0 = base[i * 3], y0 = base[i * 3 + 1], d = -y0 / cl, xn = x0 / (cw2 / 2);
          const wave = Math.sin(t * cp.freq - d * 4.5 + xn * 1.3 + ph) * cp.amp * d;
          const x = x0 * (1 + d * cp.flare) + Math.sin(t * cp.freq * 0.6 + d * 2.5 + ph) * cp.sway * d;
          const z = -cp.billow * d * d + wave - (1 - xn * xn) * 0.04 * d + xn * xn * 0.08 * (1 - d);
          pa.setXYZ(i, x, y0, z);
        }
        pa.needsUpdate = true; geo.computeVertexNormals();
      };
      upd(0); this.on(upd);
    }
    // pose
    for (const k in P) if (Array.isArray(P[k]) && j[k]) j[k].rotation.set(P[k][0] * D, P[k][1] * D, P[k][2] * D);
    root.updateMatrixWorld(true);
    if (!P.air) {
      let min = Infinity;
      for (const L of ['l', 'r']) {
        min = Math.min(min, j[L + 'An'].localToWorld(V(0, -0.077, B.foot * 0.55)).y, j[L + 'An'].localToWorld(V(0, -0.077, -0.02)).y);
        min = Math.min(min, j[L + 'Kn'].localToWorld(V(0, 0, B.legR * 0.62)).y - B.legR * 0.8);
      }
      j.hips.position.y -= min; root.updateMatrixWorld(true);
    }
    // armas
    const fist = (L) => j[L + 'Wr'].localToWorld(V(0, -0.04, 0));
    const sp = o.spear !== undefined ? o.spear : P.spear;
    const shd = o.shield !== undefined ? o.shield : P.shield;
    const backAt = (z) => j.spine.localToWorld(V(0, T * 0.55, -dz - z));
    const backDir = () => j.spine.localToWorld(V(0, T * 0.55, -1)).sub(backAt(0)).normalize();
    if (N && sp) {
      const g = this.spear();
      if (sp === 'back') {
        const p = backAt(0.12), up = j.spine.localToWorld(V(0.4, T * 0.55 + 1, -dz - 0.12)).sub(p).normalize();
        g.position.copy(p).addScaledVector(up, -1.25); g.quaternion.setFromUnitVectors(V(0, 1, 0), up);
      } else {
        const hand = fist(sp.hand || 'r'), dir = va(sp.dir).normalize(), L = 2.5;
        let grip = sp.grip; if (grip === 'ground') grip = Math.min(0.75, hand.y / (L * Math.max(dir.y, 0.2)));
        g.position.copy(hand).addScaledVector(dir, -grip * L); g.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
      }
      root.add(g); j.spear = g;
    }
    if (N && shd) {
      const g = this.shieldObj();
      if (shd === 'back') { g.position.copy(backAt(0.07)); g.quaternion.setFromUnitVectors(V(0, 0, 1), backDir()); }
      else { const a = j.lEl.localToWorld(V(0, -B.foA * 0.5, 0)); const dir = va(shd.dir).normalize(); g.position.copy(a).addScaledVector(dir, 0.1); g.quaternion.setFromUnitVectors(V(0, 0, 1), dir); }
      root.add(g); j.shield = g;
    }
    const dc = o.disc !== undefined ? o.disc : P.disc;
    if (!N && dc !== false) {
      const g = this.disc();
      if (!dc || dc === 'back') { g.position.copy(backAt(0.04)); g.quaternion.setFromUnitVectors(V(0, 0, 1), backDir()); }
      else { const hand = fist(dc.hand || 'r'); const dir = va(dc.dir).normalize(); g.position.copy(hand).addScaledVector(dir, 0.035); g.quaternion.setFromUnitVectors(V(0, 0, 1), dir); }
      root.add(g); j.disc = g;
    }
    bake(root);
    const p = o.p || [0, 0, 0];
    root.position.set(p[0], p[1], p[2]);
    root.rotation.set((o.rx || 0) * D, (o.ry || 0) * D, (o.rz || 0) * D, 'YXZ');
    if (o.s) root.scale.setScalar(o.s);
    this.add(root); root.updateMatrixWorld(true);
    this.anch[kind] = j.mouth;
    return j;
  }
  nestor(pose, o) { return this.hero('n', pose, o); }
  leo(pose, o) { return this.hero('l', pose, o); }
  spear() {
    const g = new THREE.Group(), L = 2.5;
    put(g, G.cyl(1, 1, 10), toon(0x2a2420), [0, L / 2, 0], [0.017, L, 0.017]);
    put(g, G.cyl(1, 1, 10), toon(0xb27a3a), [0, L * 0.46, 0], [0.022, 0.32, 0.022]);
    put(g, G.cone(4), toon(0x9a6a32), [0, -0.06, 0], [0.025, 0.14, 0.025], [180, 0, 0]);
    put(g, G.cyl(1, 1, 8), toon(0xb27a3a), [0, L + 0.02, 0], [0.03, 0.05, 0.03]);
    put(g, G.s(), flat(0x8ff6ff), [0, L + 0.22, 0], [0.042, 0.22, 0.012]);
    const gl = glow(0x3fe4ff, 0.8, 0.9); gl.position.set(0, L + 0.22, 0); g.add(gl);
    return g;
  }
  shieldObj() {
    const g = new THREE.Group(), R = 0.5;
    put(g, G.cyl(1, 1, 40), toon(0xb27a3a), [0, 0, 0], [R, 0.06, R], [90, 0, 0]);
    put(g, G.tor(0.08, 48), toon(0xdba560), [0, 0, 0.02], [R, R, 1.2]);
    for (const s of [1, -1]) put(g, G.b(), toon(0x8e1218), [s * R * 0.2, -R * 0.05, 0.035], [R * 0.13, R * 1.1, 0.02], [0, 0, s * 22], false);
    put(g, G.tor(0.025, 64), flat(0x3fe4ff), [0, 0, 0.04], [R * 0.86, R * 0.86, 1], 0, false);
    return g;
  }
  disc() {
    const g = new THREE.Group(), R = 0.27;
    put(g, G.cyl(1, 1, 36), toon(0x9c6a34), [0, 0, 0], [R, 0.035, R], [90, 0, 0]);
    put(g, G.tor(0.09, 40), toon(0xdba560), [0, 0, 0.01], [R, R, 1]);
    put(g, G.tor(0.05, 40), flat(0x3fe4ff), [0, 0, 0.022], [R * 0.62, R * 0.62, 1], 0, false);
    put(g, G.cyl(1, 1, 24), flat(0xbff8ff), [0, 0, 0.02], [R * 0.22, 0.01, R * 0.22], [90, 0, 0], false);
    g.add(glow(0x3fe4ff, 0.9, 0.55));
    return g;
  }
  discAt(p, dir = [0, 1, 0], glowS = 1.4) {
    const g = this.disc(); g.position.set(p[0], p[1], p[2]); g.quaternion.setFromUnitVectors(V(0, 0, 1), va(dir).normalize());
    this.add(g); this.glowAt(p, 0x3fe4ff, glowS, 0.8, 9); return g;
  }
  // civil (silueta sencilla con paraguas luminoso)
  civilian(o) {
    const g = new THREE.Group(), r = RNG(o.seed || 1), coat = toon([0x2a2a30, 0x3a2a22, 0x22262e, 0x30242a][(r() * 4) | 0]);
    const legs = J(g, 0, 0.85, 0);
    for (const s of [1, -1]) { const l = J(legs, s * 0.09, 0, 0); l.rotation.x = s * 30 * D; put(l, G.cap(0.06, 0.75), toon(0x15161a), [0, -0.42, 0]); }
    const body = J(g, 0, 0.85, 0); body.rotation.x = 14 * D;
    put(body, G.cyl(0.6, 1, 10), coat, [0, 0.35, 0], [0.24, 0.8, 0.17]);
    put(body, G.s(), toon(0xb07a58), [0, 0.92, 0.02], [0.1, 0.12, 0.1]);
    put(body, G.s(), toon(0x1a1416), [0, 0.98, -0.01], [0.105, 0.09, 0.105]);
    if (o.umbrella !== false) {
      const c = [0x3fe4ff, 0xff3d9a, 0xffb23a, 0xc07bff][(r() * 4) | 0];
      put(body, G.cyl(1, 1, 6), flat(c), [0.18, 1.1, 0.1], [0.012, 0.9, 0.012], 0, false);
      const um = put(body, G.cone(10), toon(0x15151a, { transparent: true, opacity: 0.85 }), [0.18, 1.6, 0.1], [0.62, 0.22, 0.62], 0, false);
      put(body, G.tor(0.02, 24), flat(c), [0.18, 1.5, 0.1], [0.62, 0.62, 1], [90, 0, 0], false);
      const gl = glow(c, 1.2, 0.5); gl.position.set(0.18, 1.3, 0.1); body.add(gl);
    }
    bake(g); g.position.set(...o.p); g.rotation.y = (o.ry || 0) * D; this.add(g); return g;
  }

  // ------------------------------------------------------------ monsters
  monMats() {
    return { B: toon(0x3c2a4c, { emissive: 0x1a0620 }), Dk: toon(0x221830, { emissive: 0x0e0414 }), Bone: toon(0x8e7a84), Eye: flat(0xff3df2), Glow: flat(0xff2fa8), Teeth: toon(0xd8c4a0) };
  }
  crawler(o = {}) {
    const g = new THREE.Group(), M = this.monMats();
    const body = J(g, 0, 0.8, 0); body.rotation.x = (o.pitch || 0) * D;
    put(body, G.s(), M.B, [0, 0, 0], [0.55, 0.42, 0.95]);
    put(body, G.s(), M.B, [0, -0.05, -0.85], [0.42, 0.36, 0.6]);
    for (const z of [0.45, 0.05, -0.35, -0.75]) put(body, G.s(), M.Dk, [0, 0.28 - Math.abs(z) * 0.08, z], [0.48 - Math.abs(z) * 0.1, 0.2, 0.32]);
    for (let i = 0; i < 6; i++) {
      const z = 0.55 - i * 0.3;
      put(body, G.cone(6), M.Bone, [0, 0.46 - i * 0.03, z], [0.07, 0.44 - i * 0.04, 0.07], [-35, 0, 0]);
      for (const s of [1, -1]) put(body, G.cone(5), M.Bone, [s * 0.38, 0.28, z], [0.05, 0.26, 0.05], [-30, 0, s * -38]);
    }
    const head = J(body, 0, 0.05, 0.95); head.rotation.x = (o.head || 0) * D;
    put(head, G.s(), M.B, [0, 0, 0.1], [0.34, 0.26, 0.42]);
    put(head, G.s(), M.Dk, [0, 0.12, 0.05], [0.3, 0.14, 0.38]);
    for (const s of [1, -1]) put(head, G.cone(6), M.Bone, [s * 0.2, 0.18, -0.05], [0.05, 0.38, 0.05], [-62, 0, s * -25]);
    for (const [ex, ey, ez] of [[0.12, 0.1, 0.42], [0.2, 0.06, 0.33], [0.07, 0.17, 0.36]]) for (const s of [1, -1]) put(head, G.sl(), M.Eye, [s * ex, ey, ez], 0.042, 0, false);
    const jaw = J(head, 0, -0.08, 0.05); jaw.rotation.x = (o.jaw ?? 28) * D;
    put(jaw, G.s(), M.B, [0, -0.06, 0.25], [0.28, 0.08, 0.38]);
    for (let i = 0; i < 5; i++) {
      const t = i / 4 - 0.5;
      put(jaw, G.cone(5), M.Teeth, [t * 0.36, 0.02, 0.4 + Math.abs(t) * -0.2], [0.022, 0.1, 0.022], 0, false);
      put(head, G.cone(5), M.Teeth, [t * 0.36, -0.13, 0.44 + Math.abs(t) * -0.2], [0.024, 0.12, 0.024], [180, 0, 0], false);
    }
    put(head, G.sl(), M.Glow, [0, -0.13, 0.3], [0.12, 0.05, 0.14], 0, false);
    const lp = o.legs || 0;
    for (const s of [1, -1]) for (const [z, splay] of [[0.55, 35], [0.0, 0], [-0.55, -35]]) {
      const hip = J(body, s * 0.42, -0.05, z); hip.rotation.set(0, -s * splay * D + lp * s * D, s * 130 * D);
      put(hip, G.cap(0.06, 0.55), M.B, [0, -0.32, 0]);
      const kn = J(hip, 0, -0.64, 0); kn.rotation.z = s * -112 * D;
      put(kn, G.cap(0.045, 1.0), M.Dk, [0, -0.55, 0]);
      put(kn, G.cone(5), M.Bone, [0, -1.12, 0], [0.04, 0.2, 0.04], [180, 0, 0]);
    }
    put(body, G.cone(8), M.B, [0, 0.0, -1.55], [0.17, 0.7, 0.17], [-100, 0, 0]);
    put(body, G.cone(6), M.Bone, [0, 0.1, -2.0], [0.07, 0.35, 0.07], [-110, 0, 0]);
    bake(g);
    if (o.add === false) return g;
    g.position.set(...(o.p || [0, 0, 0])); g.rotation.set((o.rx || 0) * D, (o.ry || 0) * D, (o.rz || 0) * D, 'YXZ'); g.scale.setScalar(o.s || 1);
    this.add(g);
    if (o.bob !== false) { const y0 = g.position.y, ph = this.rng() * 9; this.on(t => { g.position.y = y0 + Math.sin(t * 5 + ph) * 0.035; }); }
    if (o.glow !== false) { const e = glow(0xff2fa8, 1.1 * (o.s || 1), 0.5); e.position.set(0, 0.9, 1.3); g.add(e); }
    return g;
  }
  horde(list, o = {}) {
    const proto = this.crawler({ add: false, jaw: 32 });
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    for (const c of proto.children) {
      if (!c.isMesh) continue;
      const im = new THREE.InstancedMesh(c.geometry, c.material, list.length);
      list.forEach((p, i) => { e.set((p[4] || 0) * D, (p[2] || 0) * D, 0, 'YXZ'); q.setFromEuler(e); const s = p[3] || 1; m4.compose(V(p[0], p[5] || 0, p[1]), q, V(s, s, s)); im.setMatrixAt(i, m4); });
      im.frustumCulled = false; this.add(im);
    }
  }
  flyer(o = {}) {
    const g = new THREE.Group(), M = this.monMats();
    put(g, G.s(), M.B, [0, 0, 0], [0.28, 0.26, 0.75]);
    put(g, G.s(), M.Dk, [0, 0.12, 0.1], [0.24, 0.14, 0.6]);
    const head = J(g, 0, 0.08, 0.75);
    put(head, G.s(), M.B, [0, 0, 0], [0.2, 0.17, 0.28]);
    put(head, G.cone(6), M.Bone, [0, -0.03, 0.4], [0.07, 0.38, 0.06], [90, 0, 0]);
    for (const s of [1, -1]) { put(head, G.sl(), M.Eye, [s * 0.1, 0.07, 0.2], 0.035, 0, false); put(head, G.sl(), M.Eye, [s * 0.15, 0.03, 0.12], 0.028, 0, false); put(head, G.cone(5), M.Bone, [s * 0.1, 0.14, -0.12], [0.04, 0.3, 0.04], [-70, 0, 0]); }
    for (let i = 0; i < 5; i++) put(g, G.cone(6), M.B, [0, -0.02, -0.75 - i * 0.32], [0.12 - i * 0.02, 0.4, 0.12 - i * 0.02], [-90, 0, 0]);
    put(g, G.cone(5), M.Glow, [0, -0.02, -2.4], [0.06, 0.3, 0.06], [-90, 0, 0], false);
    for (const s of [1, -1]) { const l = J(g, s * 0.12, -0.2, 0.1); l.rotation.x = 40 * D; put(l, G.cap(0.03, 0.4), M.Dk, [0, -0.22, 0]); }
    const shape = gc('wing', () => {
      const sh = new THREE.Shape(); const P = [[0, 0.15], [0.5, 0.42], [1.2, 0.58], [2.0, 0.48], [2.7, 0.12], [2.25, -0.05], [2.05, -0.32], [1.65, -0.14], [1.32, -0.46], [0.95, -0.24], [0.55, -0.52], [0.12, -0.36]];
      sh.moveTo(...P[0]); for (const p of P.slice(1)) sh.lineTo(...p); sh.closePath();
      const geo = new THREE.ShapeGeometry(sh); geo.rotateX(Math.PI / 2); return geo;
    });
    const ph = this.rng() * 9, wm = toon(0x4a2a5a, { side: THREE.DoubleSide, emissive: 0x2a0630 });
    for (const s of [1, -1]) {
      const w = J(g, s * 0.18, 0.1, 0.1); w.userData.dyn = true;
      const mesh = new THREE.Mesh(shape, wm); mesh.scale.x = s; w.add(mesh);
      for (const [x, z] of [[2.7, 0.12], [2.05, -0.32], [1.32, -0.46], [0.55, -0.52]]) {
        const bone = new THREE.Mesh(G.b(), M.Bone), len = Math.hypot(x, z);
        bone.scale.set(len, 0.035, 0.035); bone.position.set(s * x / 2, 0.01, z / 2); bone.rotation.y = Math.atan2(-z, s * x); w.add(bone);
      }
      const amp = o.flap ?? 0.55;
      this.on(t => { w.rotation.z = s * (Math.sin(t * 7 + ph) * amp + 0.15); });
    }
    bake(g);
    g.position.set(...(o.p || [0, 0, 0])); g.rotation.set((o.rx || 0) * D, (o.ry || 0) * D, (o.rz || 0) * D, 'YXZ'); g.scale.setScalar(o.s || 1);
    this.add(g);
    const e = glow(0xff2fa8, 1.2 * (o.s || 1), 0.5); e.position.set(0, 0.1, 0.95); g.add(e);
    const y0 = g.position.y; this.on(t => { g.position.y = y0 + Math.sin(t * 7 + ph + 1.2) * 0.12 * (o.s || 1); });
    return g;
  }
  tentacle(parent, pts, r0, mat, o = {}) {
    const curve = new THREE.CatmullRomCurve3(pts.map(va));
    const seg = o.seg || 48, rad = 10;
    const geo = new THREE.TubeGeometry(curve, seg, r0, rad, false);
    const pos = geo.attributes.position, c = V(), v = V();
    for (let i = 0; i <= seg; i++) {
      const u = i / seg; curve.getPointAt(u, c); const f = 1 - (o.taper ?? 0.85) * u;
      for (let k = 0; k <= rad; k++) { const idx = i * (rad + 1) + k; v.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(f).add(c); pos.setXYZ(idx, v.x, v.y, v.z); }
    }
    geo.computeVertexNormals();
    parent.add(mk(geo, mat));
    if (o.suckers !== false) for (let i = 3; i < seg - 6; i += 4) {
      const u = i / seg; curve.getPointAt(u, c); const f = 1 - (o.taper ?? 0.85) * u;
      put(parent, G.sl(), o.sMat || this.monMats().Bone, [c.x, c.y - r0 * f * 0.85, c.z], [r0 * f * 0.35, r0 * f * 0.2, r0 * f * 0.35], 0, false);
    }
    return curve;
  }
  titan(o = {}) {
    const g = new THREE.Group(), M = this.monMats(), mB = toon(0x3c2a4c, { emissive: 0x1c0622 }), mD = toon(0x241a32, { emissive: 0x0e0414 }), mBone = toon(0x96828c);
    put(g, G.s(), mB, [0, 3, 0], [9, 9, 7]);
    put(g, G.s(), mB, [0, 12, 1], [6.6, 7.2, 5.2]);
    for (let i = 0; i < 5; i++) for (const s of [1, -1]) put(g, G.s(), mBone, [s * 2.4, 14.5 - i * 1.9, 5.3 - i * 0.2], [2.3 - i * 0.15, 0.45, 0.9], [0, 0, s * (12 + i * 4)]);
    for (const s of [1, -1]) {
      put(g, G.s(), mD, [s * 6.2, 15.5, 0], [3.6, 3.0, 3.6]);
      for (let k = 0; k < 4; k++) put(g, G.cone(7), mBone, [s * (5 + k * 0.9), 18 - k * 0.4, -1 + k * 0.6], [0.45, 3.2 - k * 0.4, 0.45], [-20, 0, s * -(20 + k * 12)]);
    }
    const head = J(g, 0, 19.5, 3.4); head.rotation.x = (o.headPitch ?? -8) * D;
    put(head, G.s(), mB, [0, 0, 0], [3.4, 2.8, 4.2]);
    put(head, G.s(), mD, [0, 1.25, 1.5], [3.0, 1.0, 2.6]);
    for (let i = -3; i <= 3; i++) put(head, G.cone(8), mBone, [i * 0.95, 2.1 - Math.abs(i) * 0.25, -0.6 - Math.abs(i) * 0.25], [0.38, 3.8 - Math.abs(i) * 0.4, 0.38], [-28 - Math.abs(i) * 4, 0, -i * 12]);
    put(head, G.s(), flat(0xffd860), [0, 0.35, 3.75], [1.3, 1.05, 0.6]);
    put(head, G.b(), flat(0x200400), [0, 0.35, 4.3], [0.2, 1.6, 0.12], 0, false);
    put(head, G.tor(0.08, 40), flat(0xff6a20), [0, 0.35, 4.05], [1.15, 0.92, 1], 0, false);
    const eg = glow(0xffc040, 9, 0.7); eg.position.set(0, 0.35, 4.6); head.add(eg);
    const jaw = J(head, 0, -1.3, 0.6); jaw.rotation.x = (o.jaw ?? 22) * D;
    put(jaw, G.s(), mB, [0, -0.6, 2.2], [2.6, 0.9, 3.0]);
    for (let i = -4; i <= 4; i++) {
      put(jaw, G.cone(6), M.Teeth, [i * 0.5, 0.1, 4.3 - Math.abs(i) * 0.25], [0.18, 1.0, 0.18], 0, false);
      put(head, G.cone(6), M.Teeth, [i * 0.52, -1.35, 4.4 - Math.abs(i) * 0.25], [0.2, 1.2, 0.2], [180, 0, 0], false);
    }
    put(head, G.s(), M.Glow, [0, -1.6, 3.2], [1.7, 0.4, 1.3], 0, false);
    const tents = o.tents || [
      [[4, 8, 4], [10, 11, 9], [14, 18, 10], [12, 25, 6], [8, 27, 4]],
      [[-4, 8, 4], [-11, 12, 8], [-16, 17, 6], [-17, 24, 1], [-13, 28, -1]],
      [[6, 4, 2], [13, 3, 6], [19, 7, 10], [22, 13, 8]],
      [[-6, 4, 2], [-14, 2, 7], [-20, 6, 9], [-24, 12, 5]],
      [[3, 2, -5], [8, 6, -12], [10, 14, -16], [6, 20, -18]],
      [[-3, 2, -5], [-9, 7, -11], [-12, 15, -12], [-9, 21, -10]],
    ];
    for (const t of tents) this.tentacle(g, t, o.tr || 1.3, mB, {});
    bake(g);
    if (o.extra) o.extra(g);
    g.position.set(...(o.p || [0, 0, 0])); g.rotation.set(0, (o.ry || 0) * D, 0); g.scale.setScalar(o.s || 1);
    this.add(g);
    const ry0 = g.rotation.y, ph = this.rng() * 9;
    this.on(t => { g.rotation.z = Math.sin(t * 0.5 + ph) * 0.015; g.rotation.y = ry0 + Math.sin(t * 0.33 + ph) * 0.02; });
    g.updateMatrixWorld(true);
    this.titanEye = head;
    return g;
  }

  // ------------------------------------------------------------ set pieces
  rift(o = {}) {
    const p = o.p || [0, 200, -300], h = o.h || 160, w = o.w || 30;
    const g = J(this.root, ...p), r = RNG(o.seed || 17);
    const shape = new THREE.Shape(), n = 18, L = [], R = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, y = -h / 2 + t * h, wd = w / 2 * Math.pow(Math.sin(Math.PI * t), 0.75) * (o.thin || 1);
      L.push([-wd * (0.55 + r() * 0.6) + (r() - 0.5) * w * 0.12, y]); R.push([wd * (0.55 + r() * 0.6) + (r() - 0.5) * w * 0.12, y]);
    }
    shape.moveTo(...L[0]); for (const q of L.slice(1)) shape.lineTo(...q); for (const q of R.reverse()) shape.lineTo(...q);
    const geo = new THREE.ShapeGeometry(shape);
    const lay = [[1.6, 1.08, addm(0xff2f8a, 0.35)], [1.0, 1.0, flat(0xff3a6a, { fog: false })], [0.42, 0.9, flat(0xffe2f6, { fog: false })]];
    lay.forEach(([sx, sy, mat], i) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, 1); m.position.z = i * 0.5; g.add(m); });
    const g1 = glow(0xff2fa8, h * 1.3, 0.55); g.add(g1); const g2 = glow(0xffd0f0, h * 0.45, 0.6); g.add(g2);
    this.on(t => { g1.scale.setScalar(h * 1.3 * (1 + Math.sin(t * 2.2) * 0.06)); });
    if (o.bolts !== false) {
      const bg = J(g, 0, 0, 0);
      for (let i = 0; i < (o.nb || 6); i++) {
        const a = r() * Math.PI * 2, y = (r() - 0.5) * h * 0.7, len = h * (0.25 + r() * 0.35);
        const A = [Math.cos(a) * w * 0.3, y, 1], B = [Math.cos(a) * len, y + Math.sin(a) * len * 0.6, 1];
        const r0 = this.root; this.root = bg; this.bolt(A, B, 0xffb0f4, { amp: len * 0.12, seed: i + 3 }); this.root = r0;
      }
    }
    if (o.claw) this.claw(g, h);
    this.on((t, dt, cam) => { g.rotation.y = Math.atan2(cam.position.x - g.position.x, cam.position.z - g.position.z); });
    return g;
  }
  claw(g, h) {
    const mB = toon(0x1a1222), c = J(g, 0, h * 0.05, 4);
    put(c, G.s(), mB, [0, 0, 0], [h * 0.12, h * 0.1, h * 0.1]);
    for (let i = 0; i < 4; i++) {
      const a = (i - 1.5) * 0.45;
      const pts = [[Math.sin(a) * h * 0.06, -h * 0.02, h * 0.04], [Math.sin(a) * h * 0.16, -h * 0.12, h * 0.16], [Math.sin(a) * h * 0.2, -h * 0.3, h * 0.2], [Math.sin(a) * h * 0.17, -h * 0.42, h * 0.12]];
      this.tentacle(c, pts, h * 0.025, mB, { taper: 0.95, suckers: false, seg: 24 });
    }
  }
  core(o = {}) {
    const p = o.p || [0, 14, 0], R = o.r || 5;
    const m = new THREE.Mesh(gc('coreS', () => new THREE.SphereGeometry(1, 48, 32)), coreMat(o.c1 ?? 0xff2fa8, o.c2 ?? 0x2a0030));
    m.position.set(...p); m.scale.setScalar(R); this.add(m);
    this.glowAt(p, o.c1 ?? 0xff2fa8, R * 7, 0.7, 2); this.glowAt(p, 0xffffff, R * 2.4, 0.6, 3);
    for (let i = 0; i < 3; i++) {
      const ring = put(this.root, G.tor(0.02, 96), flat(i === 1 ? 0x3fe4ff : 0xff6ad0), p, [R * (1.5 + i * 0.35), R * (1.5 + i * 0.35), R], 0, false);
      const ax = i * 1.1; this.on(t => ring.rotation.set(t * (0.4 + i * 0.2) + ax, t * (0.3 - i * 0.15), ax));
    }
    if (o.beam !== false) {
      const b = new THREE.Mesh(gc('beamG', () => { const c = new THREE.CylinderGeometry(1, 1, 1, 32, 1, true); c.translate(0, 0.5, 0); return c; }), beamMat(0xff4ab8, 0.85));
      b.position.set(p[0], p[1], p[2]); b.scale.set(R * 0.55, 600, R * 0.55); this.add(b);
    }
    if (o.bolts !== false) for (let i = 0; i < 5; i++) { const a = i * 1.3; this.bolt(p, [p[0] + Math.cos(a) * R * 4, 0.2, p[2] + Math.sin(a) * R * 4], 0xffb0f4, { seed: i + 11, amp: R * 0.5 }); }
    this.light(2, o.c1 ?? 0xff2fa8, 60, p, R * 14);
    return m;
  }
  plasma(p, R = 0.32) {
    const m = new THREE.Mesh(gc('coreS', () => new THREE.SphereGeometry(1, 48, 32)), coreMat(0x7ff6ff, 0x0a3a60));
    m.position.set(...p); m.scale.setScalar(R); this.add(m);
    this.glowAt(p, 0x3fe4ff, R * 9, 0.85, 6); this.glowAt(p, 0xffffff, R * 3, 0.9, 9);
    for (let i = 0; i < 2; i++) { const ring = put(this.root, G.tor(0.03, 64), flat(0x9ff8ff), p, R * (1.5 + i * 0.4), 0, false); this.on(t => ring.rotation.set(t * 2 + i, t * 1.4 * (i ? -1 : 1), 0)); }
    return m;
  }
  bike(o = {}) {
    const g = new THREE.Group(), mD = toon(0x1c1e24), mBr = toon(0xb27a3a);
    put(g, G.s(), mD, [0, 0, 0], [0.42, 0.3, 1.55]);
    put(g, G.s(), mBr, [0, 0.12, 0.85], [0.3, 0.2, 0.75]);
    put(g, G.s(), addm(0x3fe4ff, 0.25, { side: THREE.DoubleSide }), [0, 0.32, 0.95], [0.26, 0.14, 0.4], [-25, 0, 0], false);
    put(g, G.s(), toon(0x2c1c12), [0, 0.28, -0.35], [0.22, 0.08, 0.75]);
    put(g, G.cyl(1, 1, 8), mD, [0, 0.42, 0.55], [0.022, 0.75, 0.022], [0, 0, 90], false);
    for (const s of [1, -1]) {
      put(g, G.cyl(1, 0.8, 16), mD, [s * 0.4, -0.05, -1.05], [0.17, 0.6, 0.17], [90, 0, 0]);
      put(g, G.tor(0.12, 24), flat(0x3fe4ff), [s * 0.4, -0.05, -1.37], [0.15, 0.15, 1], 0, false);
      put(g, G.b(), mBr, [s * 0.3, -0.1, 0.4], [0.05, 0.12, 1.4]);
      const gl = glow(0x3fe4ff, 1.4, 0.95); gl.position.set(s * 0.4, -0.05, -1.45); g.add(gl);
    }
    put(g, G.b(), flat(0xff2a3a), [0, 0.05, -1.55], [0.5, 0.04, 0.03], 0, false);
    bake(g);
    g.position.set(...(o.p || [0, 0, 0])); g.rotation.set((o.rx || 0) * D, (o.ry || 0) * D, (o.rz || 0) * D, 'YXZ');
    this.add(g);
    const under = glow(0x3fe4ff, 3, 0.5); under.position.set(0, -0.4, 0); g.add(under);
    if (o.trail !== false) {
      g.updateMatrixWorld(true);
      for (const s of [1, -1]) { const a = g.localToWorld(V(s * 0.4, -0.05, -1.45)), b = g.localToWorld(V(s * 0.4, -0.05, -14)); this.trail([b, a], 0x3fe4ff, 0.12, 0.9); }
    }
    return g;
  }
  holo(p, ry = 0, rx = 0, w = 0.55) {
    const tex = tc('hud', () => canvasTex(512, 360, (x, W, H) => {
      x.strokeStyle = '#3fe4ff'; x.fillStyle = '#3fe4ff'; x.lineWidth = 3; x.shadowColor = '#3fe4ff'; x.shadowBlur = 12;
      x.strokeRect(10, 10, W - 20, H - 20);
      x.font = '700 30px "Barlow Condensed", Arial'; x.fillText('ANCLA DIMENSIONAL DETECTADA', 30, 52);
      x.font = '600 22px "Barlow Condensed", Arial'; x.fillText('ESTADIO CENTRAL · 2,3 KM · NIVEL Ω', 30, 86);
      x.beginPath(); x.ellipse(256, 220, 150, 90, 0, 0, Math.PI * 2); x.stroke();
      x.beginPath(); x.ellipse(256, 220, 100, 58, 0, 0, Math.PI * 2); x.stroke();
      x.fillStyle = '#ff3d9a'; x.shadowColor = '#ff3d9a'; x.beginPath(); x.arc(256, 220, 14, 0, 7); x.fill();
      x.strokeStyle = '#ff3d9a'; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(256, 220, 26 + i * 16, 0, 7); x.stroke(); }
      x.fillStyle = '#3fe4ff'; x.shadowColor = '#3fe4ff'; x.font = '700 20px "Barlow Condensed", Arial'; x.fillText('ENERGÍA ▲ 312%', 360, 330);
      for (let i = 0; i < 12; i++) x.fillRect(30 + i * 14, 320 - (i * 37 % 60), 8, 10 + (i * 37 % 60));
    }));
    const m = new THREE.Mesh(G.plane(), mc('holo', () => new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide, fog: false })));
    m.scale.set(w, w * 0.7, 1); m.position.set(...p); m.rotation.set(rx * D, ry * D, 0, 'YXZ'); this.add(m);
    this.on(t => { m.material.opacity = 0.75 + 0.25 * Math.sin(t * 30) * Math.sin(t * 7); });
    return m;
  }
  skyEye(o = {}) {
    const p = o.p || [0, 260, -500], s = o.s || 60;
    const g = J(this.root, ...p);
    const sh = new THREE.Shape(); sh.moveTo(-1, 0); sh.quadraticCurveTo(0, 0.62, 1, 0); sh.quadraticCurveTo(0, -0.62, -1, 0);
    const geo = new THREE.ShapeGeometry(sh, 24);
    const a = new THREE.Mesh(geo, flat(0x2a0806, { fog: false })); a.scale.set(s, s * (o.open ?? 0.55), 1); g.add(a);
    const iris = new THREE.Mesh(gc('irisG', () => new THREE.CircleGeometry(1, 40)), flat(0xff4a2a, { fog: false })); iris.scale.setScalar(s * 0.26); iris.position.z = 0.5; g.add(iris);
    const pup = new THREE.Mesh(G.plane(), flat(0x050000, { fog: false })); pup.scale.set(s * 0.06, s * 0.26, 1); pup.position.z = 1; g.add(pup);
    const gl = glow(0xff3a20, s * 2.4, 0.5); g.add(gl);
    const lid = new THREE.Mesh(gc('lidG', () => { const q = new THREE.Shape(); q.moveTo(-1.15, 0); q.quadraticCurveTo(0, 0.85, 1.15, 0); q.quadraticCurveTo(0, 0.7, -1.15, 0); return new THREE.ShapeGeometry(q, 24); }), flat(0x120403, { fog: false }));
    lid.scale.set(s, s * 0.8, 1); lid.position.z = 1.5; g.add(lid);
    const lid2 = lid.clone(); lid2.scale.y = -s * 0.8; g.add(lid2);
    this.on((t, dt, cam) => { g.lookAt(cam.position); const k = 1 + Math.sin(t * 0.8) * 0.04; iris.scale.setScalar(s * 0.26 * k); });
    return g;
  }
}
