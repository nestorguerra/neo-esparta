// ============================================================================
// STORY — guion, storyboard y construcción 3D de cada viñeta.
// ============================================================================
const Y = 140;                                  // altura de la azotea
const T0 = [-18, -1.5, -40];                    // el Coloso en el canal
const RIFT = { p: [40, Y + 150, -420], h: 230, w: 44, seed: 3 };
const wpos = (o, x = 0, y = 0, z = 0) => o.localToWorld(V(x, y, z));
const headOf = (j) => j.head.localToWorld(V(0, 0.11, 0));
const fwd = (j, extra = 0) => { const a = j.root.rotation.y + extra * D; return V(Math.sin(a), 0, Math.cos(a)); };
function faceCam(K, j, dist, o = {}) {
  const h = headOf(j), f = fwd(j, o.ang || 0);
  const c = h.clone().addScaledVector(f, dist); c.y += o.dy || 0;
  const t = h.clone(); t.y += o.ty || 0;
  if (o.side) { const s = V(f.z, 0, -f.x).multiplyScalar(o.side); c.add(s); t.addScaledVector(s, o.tside ?? 0.3); }
  K.cam(c.toArray(), t.toArray(), o.fov || 34);
}
function roof(K, o = {}) {
  K.sky('storm', o.sky); K.envRooftop();
  K.rift(Object.assign({}, RIFT, o.rift || {}));
  K.rain({ p: o.rainP || [0, Y + 10, -6], size: [40, 30, 40] });
  K.embers({ p: [0, Y + 8, -8], size: [46, 24, 46] });
}
function street(K, o = {}) {
  K.sky('street', o.sky); K.envStreet();
  K.rain({ p: o.rainP || [0, 9, -6], size: [34, 22, 34], op: 0.26 });
  K.embers({ p: [0, 5, -8], size: [36, 12, 36], color: 0xff7a2a, n: 260 });
}
function canyon(K, o = {}) {
  K.sky('night', o.sky); K.envCanyon();
  K.rain({ p: [0, 46, 0], size: [30, 24, 30], op: 0.22, slant: 0.0, len: 0.06 });
  K.streaks({ p: [0, 46, 0], dir: [0, 0, 1], size: [16, 90, 16], n: 360, op: 0.3, len: 0.25, speed: 2.2 });
}
function arena(K, o = {}) {
  K.sky(o.sky || 'arena'); K.envStadium();
  if (o.core !== false) K.core({ p: [0, 14, 0], r: 5 });
  if (o.rift !== false) K.rift({ p: [0, 360, -160], h: 260, w: 50, seed: 8, nb: 7 });
  K.embers({ p: o.eP || [0, 6, 10], size: [60, 14, 60], color: 0xff5ab0, n: 320 });
}
function meteors(K, n, seed, o = {}) {
  const r = RNG(seed), R = RIFT.p;
  for (let i = 0; i < n; i++) {
    const a = [R[0] + (r() - 0.5) * 70, R[1] + (r() - 0.5) * 90, R[2] + (r() - 0.5) * 30];
    const b = [(r() - 0.5) * 380 + (o.dx || 0), 30 + r() * 90, -70 - r() * 280];
    const mid = [(a[0] + b[0]) / 2 + (r() - 0.5) * 40, (a[1] + b[1]) / 2 + 35, (a[2] + b[2]) / 2];
    const full = new THREE.CatmullRomCurve3([va(a), va(mid), va(b)]);
    const k = 0.45 + r() * 0.5, pts = [];
    for (let s = 0; s <= 14; s++) pts.push(full.getPoint(k * s / 14));
    K.trail(pts, 0xff2f8a, 1.0 + r() * 1.4, 0.9);
    const hd = pts[pts.length - 1];
    K.glowAt(hd.toArray(), 0xff5ac0, 16 + r() * 10, 0.9, 6);
    if (r() < 0.6) { const f = K.flyer({ p: hd.toArray(), s: 3.2 + r() * 2, flap: 0.3 }); f.quaternion.setFromUnitVectors(V(0, 0, 1), full.getTangent(k)); }
    if (o.impacts !== false && r() < 0.6) { K.glowAt(b, 0xffa040, 40, 0.75, 3); K.burst(b, 0xffb060, 14, 120, 0.5); }
  }
}
// Moto: devuelve la base para colocar jinetes.
function bikeRig(K, o = {}) {
  const B = o.p || [0, 45, 0];
  K.bike({ p: B, ry: 180, rz: o.bank || 0 });
  const n = K.nestor(o.npose || 'ride', { p: [B[0], B[1] + 0.36 - 1.045 + 0.06, B[2] + 0.18], ry: 180, face: o.nface });
  let l = null;
  if (o.leo !== false) l = K.leo(o.lpose || 'rideBack', Object.assign({ p: [B[0], B[1] + 0.36 - 0.815 + 0.06, B[2] + 0.88], ry: 180 }, o.lopt || {}));
  return { n, l, B };
}
function crack(K, p, n = 10, seed = 2) {
  const r = RNG(seed), m = toon(0x050404);
  for (let i = 0; i < n; i++) { const a = r() * 360, len = 1.2 + r() * 2.6; const g = put(K.root, G.b(), m, [p[0] + Math.sin(a * D) * len / 2, 0.02, p[2] + Math.cos(a * D) * len / 2], [0.07, 0.03, len], [0, a, 0], false); }
  put(K.root, G.cyl(1, 1, 24), m, [p[0], 0.015, p[2]], [1.1, 0.02, 1.1], 0, false);
}
function ringOf(K, n, R, c = [0, 0], o = {}) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + (o.off || 0), x = c[0] + Math.cos(a) * R, z = c[1] + Math.sin(a) * R;
    out.push(K.crawler({ p: [x, 0, z], ry: Math.atan2(c[0] - x, c[1] - z) / D, jaw: 30 + (i % 3) * 10 }));
  }
  return out;
}
function hordeField(K, o) {
  const r = RNG(o.seed || 4), L = [];
  for (let i = 0; i < o.n; i++) {
    const x = o.x[0] + r() * (o.x[1] - o.x[0]), z = o.z[0] + r() * (o.z[1] - o.z[0]);
    L.push([x, z, (o.ry ?? 0) + (r() - 0.5) * 50, 0.85 + r() * 0.4, (r() - 0.5) * 16, 0]);
  }
  K.horde(L);
}

const STORY = {
  logline: 'Néstor, un guerrero de lanza y escudo, y su hijo Leo, de once años, con un disco de bronce y mucha zurda, defienden Neo-Esparta de los monstruos que caen por una grieta dimensional. Estética de <em>300</em> (cielos de bronce, capas rojas, contraluces y cámara lenta) dentro de una megaciudad de lluvia y neones a lo <em>Blade Runner</em>. Lectores de 15 a 19 años. Cinco páginas, cincuenta viñetas, una noche.',
  cover: {
    id: 'cover', shot: 'Portada · contrapicado heroico',
    desc: 'Néstor y Leo en lo alto de la torre, lanza en alto y disco en guardia. Detrás, la Grieta sangra luz magenta sobre un cielo de bronce. Lluvia, brasas y capas rojas al viento.',
    build(K) {
      roof(K, { rift: { p: [6, Y + 70, -250], h: 200, w: 46 } });
      const n = K.nestor('heroic', { p: [-0.45, Y, -11], ry: 8, capeP: { billow: 0.45, amp: 0.1, lift: 24, freq: 3 } });
      K.leo('fight', { p: [0.75, Y, -10.55], ry: -12 });
      meteors(K, 5, 9, { impacts: false });
      K.cam([0.45, Y + 0.75, -3.0], [0.15, Y + 2.75, -11], 40);
      K.light(1, 0xff3d9a, 18, [0.2, Y + 3.5, -14.5], 10);
    },
  },
  pages: [
    // ======================================================== PÁGINA I
    {
      title: 'La Grieta',
      beat: 'Neo-Esparta, 2099. En lo alto de una torre, Néstor y Leo ven abrirse la Grieta sobre la ciudad. Por ella caen los umbríos. Padre e hijo se miran, se encogen de hombros y saltan al vacío.',
      panels: [
        {
          id: '1-1', at: [1, 13, 1, 6], shot: 'Gran plano general',
          desc: 'La megaciudad bajo la lluvia: torres negras, neones cian y magenta, chimeneas de fuego en el horizonte y una pirámide colosal. El cielo de bronce está rasgado por la Grieta. En la azotea, dos siluetas diminutas con capa roja.',
          cap: [['tl', 'Neo·Esparta. Año 2099.'], ['br', 'La ciudad que nunca duerme. Esta noche, tampoco podrá cerrar los ojos.']],
          build(K) {
            roof(K, { rainP: [-6, Y + 10, -8] });
            K.nestor('heroic', { p: [-0.7, Y, -13.4], ry: 180 });
            K.leo('stand', { p: [0.7, Y, -13.4], ry: 180 });
            meteors(K, 6, 1);
            K.cam([-7, Y + 4.2, 4], [-1, Y + 15, -60], 38, 22);
          },
        },
        {
          id: '1-2', at: [1, 5, 6, 9], shot: 'Primerísimo primer plano',
          desc: 'La cara de Néstor bajo la lluvia, barba entrecana empapada, la mirada fija en el cielo. La luz magenta de la Grieta le recorta el perfil.',
          bub: [['n', 'Ha vuelto a *abrirse*.', 0.3, 0.18]],
          build(K) {
            roof(K);
            const n = K.nestor('lookUp', { p: [0, Y, 0], ry: 180, spear: false, shield: false, pose: { neck: [-6, 0, 0], head: [-10, 0, 0] } });
            faceCam(K, n, 1.05, { dy: 0.02, side: -0.32, ty: 0.0, tside: 0.12, fov: 30 });
            const h = headOf(n); K.light(1, 0xff2f8a, 6, [h.x + 0.4, h.y + 1.2, h.z - 2], 8);
            K.rain({ p: [h.x, h.y, h.z - 1.2], size: [4, 4, 4], n: 900, op: 0.32 });
          },
        },
        {
          id: '1-3', at: [5, 9, 6, 9], shot: 'Plano medio corto',
          desc: 'Leo, once años, se ajusta el guantelete. Chispas cian en la muñeca. Pelo mojado sobre la cara y el disco de bronce a la espalda.',
          bub: [['l', '¿*Cuántos* esta vez?', 0.7, 0.16]],
          build(K) {
            roof(K);
            const l = K.leo('gauntlet', { p: [0, Y, 0], ry: 180 });
            const h = headOf(l), w = wpos(l.lWr, 0, -0.03, 0);
            K.cam([h.x - 0.6, h.y - 0.16, h.z - 1.3], [h.x - 0.05, h.y - 0.26, h.z], 36);
            K.burst(w.toArray(), 0x3fe4ff, 0.22, 90, 0.012);
            K.glowAt(w.toArray(), 0x3fe4ff, 0.3, 0.8, 14);
            K.light(1, 0x3fe4ff, 0.5, [w.x, w.y - 0.15, w.z - 0.35], 1.5);
          },
        },
        {
          id: '1-4', at: [9, 13, 6, 12], shot: 'Contrapicado',
          desc: 'Desde la espalda de Néstor, la Grieta se abre como una herida. Una garra del tamaño de un edificio asoma por el desgarro entre relámpagos.',
          sfx: [['KRRRAAAK!', 0.52, 0.44, -12, 0.9, '#ff3d9a']],
          build(K) {
            K.sky('storm'); K.envRooftop();
            K.rift({ p: [8, Y + 115, -260], h: 210, w: 44, claw: true, seed: 3, nb: 9 });
            K.rain({ p: [0, Y + 10, -6], size: [40, 30, 40] }); K.embers({ p: [0, Y + 8, -8], size: [46, 24, 46] });
            K.nestor('heroic', { p: [0.45, Y, -12.4], ry: 180 });
            K.cam([0, Y + 0.9, -9.1], [5, Y + 62, -200], 50, 8);
          },
        },
        {
          id: '1-5', at: [1, 9, 9, 12], shot: 'Plano americano, tres cuartos',
          desc: 'Néstor en pie, lanza y escudo con la lambda espartana. La capa restalla en el viento. Ni un músculo de la cara se mueve.',
          bub: [['n', 'Los *suficientes* para que merezca la pena.', 0.74, 0.22, { w: 34 }]],
          build(K) {
            roof(K);
            const n = K.nestor('heroic', { p: [0, Y, -12], ry: 180, capeP: { billow: 0.5, amp: 0.12, lift: 30, freq: 3 } });
            const h = headOf(n);
            K.cam([h.x + 2.3, h.y - 0.55, h.z - 2.25], [h.x - 0.85, h.y - 0.55, h.z + 0.3], 34);
          },
        },
        {
          id: '1-6', at: [1, 7, 12, 16], shot: 'Plano general picado',
          desc: 'Lluvia de monstruos: decenas de umbríos alados caen sobre la ciudad dejando estelas magenta. Los impactos encienden las azoteas.',
          cap: [['bl', 'Los llaman umbríos. Vienen de una dimensión sin luz. Y tienen hambre de la nuestra.']],
          build(K) {
            roof(K);
            meteors(K, 13, 2);
            K.cam([34, Y + 34, -36], [8, 90, -300], 50, 40);
          },
        },
        {
          id: '1-7', at: [7, 13, 12, 16], shot: 'Plano dorsal',
          desc: 'Padre e hijo de espaldas, al borde de la azotea, mirando el caos. Capas rojas, la ciudad a sus pies.',
          bub: [['l', 'Mamá dijo que volviéramos para *cenar*.', 0.7, 0.18, { w: 42 }], ['n', 'Entonces no hay *tiempo* que perder.', 0.27, 0.4, { w: 40 }]],
          build(K) {
            roof(K);
            K.nestor('heroic', { p: [-0.55, Y, -13.6], ry: 180 });
            K.leo('stand', { p: [0.6, Y, -13.6], ry: 180 });
            meteors(K, 5, 3);
            K.cam([0.3, Y + 1.6, -9.6], [0, Y + 2.6, -40], 42, 5);
          },
        },
        {
          id: '1-8', at: [1, 13, 16, 21], shot: 'Splash · picado sobre el hombro',
          desc: 'El salto, visto desde el borde de la azotea: Néstor y Leo se lanzan al vacío, capas hacia arriba, lanza y disco preparados. Debajo, la ciudad en llamas; delante, la Grieta y la lluvia de monstruos. Líneas cinéticas.',
          fx: 'speed',
          bub: [['n', '¡A POR ELLOS!', 0.24, 0.22, { shout: true }]],
          build(K) {
            roof(K, { rainP: [0, Y - 5, -20] });
            K.nestor('leap', { p: [-1.1, Y - 3.4, -19.2], ry: 180, rx: 34 });
            K.leo('leapL', { p: [1.2, Y - 2.6, -18.4], ry: 180, rx: 26 });
            meteors(K, 7, 4);
            K.cam([0.3, Y + 0.9, -15.6], [0, Y - 7, -32], 52, 6);
          },
        },
      ],
    },
    // ======================================================== PÁGINA II
    {
      title: 'El Muro',
      beat: 'Aterrizan en el barrio de los canales. Una manada de rastreros carga calle abajo. Néstor levanta su muro de energía y Leo convierte el disco en un arma. Cubren la huida de los civiles hasta quedar rodeados, espalda con espalda.',
      panels: [
        {
          id: '2-1', at: [1, 8, 1, 5], shot: 'Plano medio contrapicado',
          desc: 'Aterrizaje de superhéroe: Néstor clava rodilla y puño en el asfalto, que se agrieta en estrella. Onda expansiva, cascotes y charcos que saltan. Leo cae agachado a su lado.',
          sfx: [['BOOOOM!', 0.5, 0.2, -6, 1.1, '#ffb23a']],
          build(K) {
            street(K);
            K.nestor('land', { p: [0, 0, 0], ry: 180 });
            K.leo('crouch', { p: [1.7, 0, 0.7], ry: 196 });
            K.rings({ p: [0, 0.06, 0], dir: [0, 1, 0], r: 7, n: 3, color: 0xffc070, speed: 0.5, tube: 0.03 });
            K.debris({ p: [0, 0, 0], n: 50, R: 3.5, h: 2.2, size: 0.3 });
            K.burst([0, 0.3, 0], 0xffb060, 3, 140, 0.05);
            crack(K, [0.2, 0, 0.2]);
            K.cam([1.6, 0.55, -4.4], [0.55, 0.85, 0], 42);
            K.light(1, 0xffa040, 8, [0, 0.6, -0.6], 8);
          },
        },
        {
          id: '2-2', at: [8, 13, 1, 5], shot: 'Plano general, cámara baja',
          desc: 'La manada de rastreros carga calle abajo hacia la cámara: seis patas, ojos magenta, fauces abiertas. Neones reflejados en el asfalto mojado.',
          cap: [['tl', 'Rastreros. Seis patas. Cuarenta dientes. Cero miedo.']],
          build(K) {
            street(K);
            [[0, -8, 0], [-3, -11, 8], [3.2, -12, -10], [-1, -15, 4], [4, -17, -6], [-4.5, -19, 10], [1.5, -21, 0], [-2, -25, 6]].forEach(([x, z, ry], i) => K.crawler({ p: [x, 0, z], ry, jaw: 26 + i * 4 }));
            K.cam([0.6, 0.45, -3.6], [0, 1.15, -14], 44);
            K.light(1, 0xff4ab8, 26, [0, 3, -9], 18); K.light(2, 0x3fe4ff, 18, [3, 2, -16], 16);
          },
        },
        {
          id: '2-3', at: [1, 5, 5, 9], shot: 'Plano dorsal, tres cuartos',
          desc: 'Néstor afianza los pies y alza el escudo: un muro hexagonal de energía cian se despliega en arco delante de él. Los rastreros llegan al galope.',
          bub: [['n', '¡ESCUDO!', 0.28, 0.2, { shout: true }]],
          sfx: [['VMMMM', 0.7, 0.72, 6, 0.55, '#3fe4ff']],
          build(K) {
            street(K);
            K.nestor('brace', { p: [0, 0, 0], ry: 180 });
            K.hexWall({ p: [0, 0, 0], ry: 180, r: 2.4, h: 3.0, arc: 150 });
            [[0.5, -6.5, 0], [-2.5, -8.5, 10], [2.8, -10, -12], [-0.8, -12.5, 4]].forEach(([x, z, ry]) => K.crawler({ p: [x, 0, z], ry, jaw: 40 }));
            K.cam([2.6, 1.7, 3.0], [0, 1.35, -3], 46);
            K.light(1, 0x3fe4ff, 10, [0, 1.5, -2], 9);
          },
        },
        {
          id: '2-4', at: [5, 9, 5, 9], shot: 'Plano lateral, impacto',
          desc: 'Un rastrero se estampa contra el muro. Estallido de chispas cian, el hexágono ondula. Néstor ni retrocede.',
          fx: 'impact',
          sfx: [['KRANG!', 0.4, 0.24, -10, 0.95, '#3fe4ff']],
          build(K) {
            street(K);
            K.nestor('brace', { p: [0, 0, 0], ry: 180 });
            K.hexWall({ p: [0, 0, 0], ry: 180, r: 2.4, h: 3.0, arc: 150 });
            K.crawler({ p: [0.1, 0.9, -3.9], ry: 0, pitch: -26, jaw: 55, bob: false });
            [[-2, -8, 10], [2.5, -9.5, -8]].forEach(([x, z, ry]) => K.crawler({ p: [x, 0, z], ry, jaw: 40 }));
            K.burst([0.1, 1.6, -2.4], 0xbff8ff, 1.3, 220, 0.04);
            K.glowAt([0.1, 1.6, -2.35], 0x3fe4ff, 3.2, 0.9, 12);
            K.cam([5.8, 1.5, -1.5], [0, 1.3, -2.4], 42);
            K.light(1, 0x3fe4ff, 14, [0.1, 1.6, -2.2], 8);
          },
        },
        {
          id: '2-5', at: [9, 13, 5, 12], shot: 'Contrapicado vertical',
          desc: 'Leo se impulsa en el hombro de su padre y vuela por encima del muro, disco en mano, el pelo al viento. Néstor aguanta abajo.',
          bub: [['l', '¡Préstame el *hombro*!', 0.36, 0.1]],
          build(K) {
            street(K);
            K.nestor('brace', { p: [0, 0, 0], ry: 180 });
            K.hexWall({ p: [0, 0, 0], ry: 180, r: 2.4, h: 3.0, arc: 150 });
            K.leo('leapL', { p: [0.3, 2.0, -0.55], ry: 180, rx: 48 });
            K.cam([1.4, 0.7, -4.7], [0.25, 2.1, -0.4], 52);
          },
        },
        {
          id: '2-6', at: [1, 9, 9, 12], shot: 'Plano general',
          desc: 'El disco de Leo traza una estela cian que rebota entre tres rastreros: uno, dos, tres. Chispas magenta en cada golpe.',
          sfx: [['ZING!', 0.25, 0.6, -10, 0.45, '#3fe4ff'], ['ZING!', 0.62, 0.45, 8, 0.45, '#3fe4ff'], ['ZING!', 0.44, 0.22, -4, 0.45, '#3fe4ff']],
          build(K) {
            street(K);
            const l = K.leo('throw', { p: [1, 0, -3.2], ry: 180 });
            const hand = wpos(l.rWr, 0, -0.04, 0);
            const C = [[-3, -9], [3.5, -12.5], [-1.5, -16]];
            C.forEach(([x, z]) => K.crawler({ p: [x, 0, z], ry: Math.atan2(1 - x, -3.2 - z) / D, jaw: 45 }));
            const pts = [hand, V(-3, 1.3, -8.4), V(3.5, 1.3, -11.9), V(-1.5, 1.4, -15.3), V(0.5, 2.4, -11)];
            K.trail(pts, 0x3fe4ff, 0.06, 1);
            K.discAt([0.5, 2.4, -11], [0.3, 1, 0.2], 1.2);
            C.forEach(([x, z]) => K.burst([x, 1.3, z + 0.6], 0xff2fa8, 0.9, 120, 0.03));
            K.cam([-6.5, 3.2, 1.5], [0.2, 1.1, -9], 40);
          },
        },
        {
          id: '2-7', at: [1, 5, 12, 16], shot: 'Plano medio',
          desc: 'Leo atrapa el disco de vuelta sin mirarlo. Media sonrisa de chulería. Detrás, los rastreros abatidos humean.',
          bub: [['l', '¿Lo has visto? ¡*Triple rebote*!', 0.3, 0.16, { w: 52 }]],
          build(K) {
            street(K);
            const l = K.leo('catchDisc', { p: [0, 0, 0], ry: -18 });
            K.trail([V(-3, 3.5, -6), V(-1.5, 2.6, -2.5), wpos(l.rWr, 0, -0.04, 0)], 0x3fe4ff, 0.04, 0.9);
            [[-2, -7, 30], [2.5, -10, -50]].forEach(([x, z, ry]) => K.crawler({ p: [x, 0, z], ry, rz: 160, jaw: 70, bob: false, glow: false }));
            K.pts({ p: [0, 1, -8], n: 80, color: 0x8a8a8a, sz: 0.35, mode: 0, size: [6, 4, 6] });
            faceCam(K, l, 2.7, { dy: -0.3, ang: -18, ty: -0.42, fov: 38 });
          },
        },
        {
          id: '2-8', at: [5, 13, 12, 16], shot: 'Plano lateral bajo',
          desc: 'Un rastrero salta sobre ellos y Néstor lo ensarta en el aire con la lanza de plasma. Estallido magenta. Ni le mira.',
          sfx: [['SHHRAKK!', 0.68, 0.2, 8, 0.8, '#ff3d9a']],
          bub: [['n', 'Lo he visto. Ahora *mira tú*.', 0.24, 0.8, { w: 38 }]],
          build(K) {
            street(K);
            const n = K.nestor('thrust', { p: [0, 0, 0], ry: 180 });
            const tip = wpos(n.spear, 0, 2.7, 0);
            K.crawler({ p: [tip.x - 0.2, tip.y - 1.05, tip.z - 0.9], ry: 0, pitch: -38, jaw: 65, bob: false });
            K.burst(tip.toArray(), 0xff2fa8, 1.6, 220, 0.05);
            K.glowAt(tip.toArray(), 0xff4ab8, 3, 0.9, 10);
            K.cam([4.2, 0.85, -0.6], [0.3, 1.5, -1.5], 42);
            K.light(1, 0xff2fa8, 12, tip.toArray(), 8);
          },
        },
        {
          id: '2-9', at: [1, 8, 16, 21], shot: 'Plano general desde el canal',
          desc: 'Cientos de civiles cruzan el puente del canal con paraguas luminosos, huyendo. Sobre ellos, un neón griego parpadea: ΣΠΑΡΤΗ.',
          cap: [['tl', 'Detrás de ellos, cuatrocientas personas. Delante, el infierno.']],
          build(K) {
            street(K, { rainP: [-18, 6, 34] });
            const r = RNG(5);
            for (let i = 0; i < 14; i++) K.civilian({ p: [-24.5 + r() * 12, 0.5, 24 + r() * 4], ry: -90 + (r() - 0.5) * 30, seed: i + 1 });
            K.cam([-16.5, 1.0, 38.5], [-18, 2.2, 26], 42);
            K.light(1, 0xffb070, 40, [-18, 5, 26], 22); K.light(2, 0xff4ab8, 20, [-26, 6, 22], 18);
          },
        },
        {
          id: '2-10', at: [8, 13, 16, 21], shot: 'Picado, tres cuartos',
          desc: 'Rodeados. Ocho rastreros cierran el círculo. Néstor y Leo, espalda con espalda, cada uno mirando a un lado. El mismo gesto.',
          bub: [['n', '*Espalda con espalda*, Leo.', 0.26, 0.12], ['l', 'Como *siempre*, papá.', 0.74, 0.3]],
          build(K) {
            street(K);
            K.nestor('guard', { p: [0.3, 0, 0.1], ry: 160 });
            K.leo('fight', { p: [-0.35, 0, -0.2], ry: -20 });
            ringOf(K, 8, 4.6, [0, 0], { off: 0.3 });
            K.cam([3.0, 2.9, 3.6], [0, 0.95, 0], 46);
            K.light(1, 0xffb070, 22, [1, 5, 2], 14); K.light(2, 0xff4ab8, 20, [-3, 2, -3], 12);
          },
        },
      ],
    },
    // ======================================================== PÁGINA III
    {
      title: 'El Coloso',
      beat: 'Del canal emerge el Coloso de Umbra y atrapa a Leo con un tentáculo. Néstor libera la Voz, un rugido sónico que parte el tentáculo, y atrapa a su hijo en el aire. El monstruo se hunde. No está vencido.',
      panels: [
        {
          id: '3-1', at: [1, 13, 1, 6], shot: 'Gran plano general',
          desc: 'El canal estalla. El Coloso de Umbra se alza veinte metros sobre el agua: corona de cuernos, un único ojo de fuego, tentáculos como torres. Padre e hijo, diminutos, en la orilla.',
          sfx: [['GROOOOAAARR!', 0.3, 0.17, -6, 0.9, '#ff3d9a']],
          build(K) {
            street(K);
            K.titan({ p: T0, ry: 24, jaw: 30 });
            K.pts({ p: [-18, 5, -38], n: 600, color: 0xcfe8ff, sz: 0.14, mode: 1, size: [18, 16, 18] });
            K.rings({ p: [-18, -1.4, -40], dir: [0, 1, 0], r: 22, n: 3, color: 0xcfe8ff, speed: 0.35, tube: 0.02, op: 0.6 });
            K.nestor('guard', { p: [0.5, 0, 0], ry: 204 });
            K.leo('fight', { p: [1.9, 0, 0.6], ry: 204 });
            K.cam([5.5, 1.4, 9], [-12, 10.5, -32], 50);
            K.light(1, 0xffc040, 90, [-14, 22, -28], 60); K.light(2, 0xff4ab8, 70, [-6, 6, -30], 40);
          },
        },
        {
          id: '3-2', at: [1, 5, 6, 13], shot: 'Contrapicado extremo',
          desc: 'Desde el asfalto, el Coloso tapa el cielo. Los neones de las fachadas le llegan por los tobillos.',
          cap: [['tl', 'Algunos monstruos se esconden debajo de la cama.'], ['bl', 'Este, debajo de la ciudad.', 'red']],
          build(K) {
            street(K);
            K.titan({ p: T0, ry: 24, jaw: 18 });
            K.cam([-7, 0.4, -20], [-17, 19, -38], 58);
            K.light(1, 0xffc040, 90, [-13, 22, -27], 60); K.light(2, 0xff4ab8, 60, [-8, 4, -28], 40);
          },
        },
        {
          id: '3-3', at: [5, 13, 6, 10], shot: 'Plano medio aéreo',
          desc: 'Un tentáculo atrapa a Leo por la cintura y lo eleva a nueve metros. Leo patalea. Al fondo, el ojo del Coloso lo observa.',
          bub: [['l', '¡¡PAPÁ!!', 0.22, 0.22, { shout: true }]],
          build(K) {
            street(K);
            K.titan({ p: T0, ry: 24, jaw: 30 });
            const L0 = [-8, 9, -24];
            K.leo('grabbed', { p: [L0[0], L0[1] - 0.815, L0[2]], ry: 200 });
            const mB = toon(0x221630);
            K.tentacle(K.root, [[-14, 8, -34], [-14.5, 14, -31], [-10.5, 13.5, -26], [L0[0] - 0.6, L0[1] + 0.4, L0[2] - 0.5], [L0[0], L0[1] + 0.02, L0[2] - 0.22]], 0.9, mB, { taper: 0.8 });
            put(K.root, G.tor(0.32, 24), mB, [L0[0], L0[1] + 0.02, L0[2]], [0.2, 0.2, 0.55], [90, 0, 0]);
            put(K.root, G.tor(0.3, 24), mB, [L0[0], L0[1] + 0.18, L0[2]], [0.18, 0.18, 0.5], [80, 0, 10]);
            K.cam([-3.2, 8.3, -18], [-9.2, 9.6, -27], 46);
            K.light(1, 0xffc040, 40, [-6, 12, -20], 20); K.light(2, 0xff4ab8, 50, [-12, 16, -30], 40);
          },
        },
        {
          id: '3-4', at: [5, 8, 10, 13], shot: 'Primer plano',
          desc: 'Néstor. La lluvia le corre por la cara. Ya no está enfadado: está otra cosa.',
          bub: [['n', '*Suéltalo.*', 0.32, 0.17]],
          build(K) {
            street(K);
            K.titan({ p: T0, ry: 24, jaw: 30 });
            const n = K.nestor('heroic', { p: [0.5, 0, 0], ry: 204, face: 'angry', spear: false, shield: false, pose: { head: [-2, 0, 0], neck: [0, 0, 0] } });
            faceCam(K, n, 0.85, { dy: -0.14, side: 0.2, ty: -0.03, fov: 34 });
            const h = headOf(n); K.light(1, 0xff2f8a, 6, [h.x - 1, h.y + 0.6, h.z - 1.5], 6);
            K.rain({ p: h.toArray(), size: [4, 4, 4], n: 900, op: 0.3 });
          },
        },
        {
          id: '3-5', at: [8, 13, 10, 16], shot: 'Contrapicado lateral',
          desc: 'LA VOZ. Néstor ruge con los brazos abiertos. Anillos sónicos salen de su boca y cruzan la calle; los cristales de las fachadas revientan.',
          bub: [['n', '¡¡SUÉLTALOOO!!', 0.5, 0.1, { shout: true, w: 80 }]],
          cap: [['bl', 'Hay voces que mueven a miles. La de Néstor, además, rompe cosas.']],
          build(K) {
            street(K);
            K.titan({ p: T0, ry: 24, jaw: 40 });
            const n = K.nestor('roar', { p: [0.5, 0, 0], ry: 204 });
            const m = wpos(n.mouth), tgt = V(-15, 15, -33), dir = tgt.clone().sub(m).normalize();
            K.rings({ p: m.toArray(), dir: dir.toArray(), travel: 22, r: 6, r0: 0.3, n: 8, speed: 0.55, color: 0xfff0d8, tube: 0.09, op: 1 });
            K.glowAt(m.toArray(), 0xfff0d8, 1.2, 0.8, 12);
            K.pts({ p: [11.2, 9, -12], n: 260, color: 0xcff8ff, sz: 0.09, mode: 1, size: [2, 14, 30] });
            K.pts({ p: [-38.8, 9, -12], n: 200, color: 0xcff8ff, sz: 0.09, mode: 1, size: [2, 14, 30] });
            const f = fwd(n, -80), h = headOf(n), ahead = fwd(n);
            K.cam([h.x + f.x * 3.6, 0.8, h.z + f.z * 3.6], [h.x + ahead.x * 1.6, h.y - 0.1, h.z + ahead.z * 1.6], 54);
            K.light(1, 0xffe6c0, 14, [m.x + dir.x * 1.5, m.y + 0.5, m.z + dir.z * 1.5], 8);
          },
        },
        {
          id: '3-6', at: [1, 8, 13, 16], shot: 'Plano general aéreo',
          desc: 'El tentáculo se desintegra en jirones y polvo magenta. Leo cae, brazos abiertos, contra la lluvia.',
          sfx: [['KRSSSHH!', 0.66, 0.3, 6, 0.75, '#ff3d9a']],
          build(K) {
            street(K);
            K.titan({ p: T0, ry: 24, jaw: 40 });
            K.tentacle(K.root, [[-14, 8, -34], [-14.5, 14, -31], [-12.2, 14, -27.5]], 0.9, toon(0x221630), { taper: 0.35 });
            K.debris({ p: [-10.5, 12.2, -25.5], n: 34, R: 3, h: 3, size: 0.55, color: 0x221630 });
            K.burst([-10.5, 13.2, -25.5], 0xff2fa8, 4, 320, 0.08);
            K.leo('fall', { p: [-8, 6.2, -23], ry: 160 });
            K.cam([-3.6, 6.6, -17.6], [-8.2, 7.6, -24], 44);
            K.light(1, 0xff4ab8, 50, [-10, 12, -25], 20); K.light(2, 0xffc040, 30, [-5, 8, -19], 14);
          },
        },
        {
          id: '3-7', at: [1, 6, 16, 21], shot: 'Plano medio en el aire',
          desc: 'Néstor salta y atrapa a Leo en pleno vuelo. Un brazo bajo las rodillas, otro en la espalda. Las capas se enredan.',
          fx: 'speed',
          build(K) {
            street(K);
            K.titan({ p: T0, ry: 24, jaw: 30 });
            const n = K.nestor('catch', { p: [-5.3, 4.0, -19.6], ry: -100, rx: 8 });
            const f = fwd(n), c = wpos(n.spine, 0, 0.28, 0).addScaledVector(f, 0.32);
            K.leo('held', { p: [c.x, c.y - 0.82, c.z], ry: -100 + 90, rz: -10 });
            K.streaks({ p: [-5, 6, -19.6], dir: [0.5, 1, 0.1], size: [5, 14, 5], n: 200, op: 0.35 });
            K.cam([-1.7, 4.8, -16.2], [-5.4, 5.4, -19.6], 44);
            K.light(1, 0xffc890, 20, [-2.5, 6, -17], 10);
          },
        },
        {
          id: '3-8', at: [6, 13, 16, 19], shot: 'Plano medio, dos personajes',
          desc: 'De vuelta en el suelo. Néstor apoya la mano en el hombro de Leo. Leo, brazos cruzados, finge que no ha pasado miedo.',
          bub: [['l', 'Has *tardado*.', 0.18, 0.22], ['n', 'Te estaba dejando *lucirte*.', 0.8, 0.2, { w: 34 }]],
          build(K) {
            street(K);
            K.nestor('shoulderHand', { p: [0.34, 0, 0], ry: -6 });
            K.leo('armsCrossed', { p: [-0.42, 0, 0.12], ry: 10 });
            K.cam([0.05, 1.42, 3.5], [-0.05, 1.42, 0], 30);
          },
        },
        {
          id: '3-9', at: [6, 13, 19, 21], shot: 'Plano detalle, a ras de agua',
          desc: 'El canal vuelve a la calma. A ras de agua, entre la espuma, el ojo de fuego del Coloso se abre otra vez.',
          cap: [['tl', 'No estaba vencido.'], ['br', 'Estaba llamando a los demás.', 'red']],
          build(K) {
            street(K);
            K.titan({ p: [-18, -22.6, -38], ry: 24, headPitch: -30 });
            K.pts({ p: [-18, -1.3, -35], n: 90, color: 0xbff8ff, sz: 0.06, mode: 0, size: [7, 1.2, 7] });
            K.rings({ p: [-18, -1.52, -35.5], dir: [0, 1, 0], r: 7, n: 3, color: 0xff6ad0, speed: 0.22, op: 0.5, tube: 0.02 });
            K.glowAt([-18, -2.4, -34], 0xffb040, 18, 0.9, 2); K.glowAt([-18, -1.55, -34], 0xff6a20, 7, 0.7, 3);
            K.cam([-18.4, 0.7, -21.5], [-18, -1.8, -35], 34);
          },
        },
      ],
    },
    // ======================================================== PÁGINA IV
    {
      title: 'El Estadio',
      beat: 'En moto aérea por el cañón de neones, el brazal de Néstor localiza el ancla de la Grieta: el Estadio Central. Leo derriba a los alados que les persiguen. Dentro, cien mil umbríos llenan las gradas. Néstor se planta solo ante la marea.',
      panels: [
        {
          id: '4-1', at: [1, 9, 1, 5], shot: 'Plano general en movimiento',
          desc: 'La moto aérea cruza el cañón de rascacielos a doscientos por hora. Néstor pilota, Leo detrás. Neones verticales, tráfico volador y lluvia en horizontal.',
          fx: 'speed',
          sfx: [['VRRRAAAMMM!', 0.7, 0.78, -4, 0.8, '#3fe4ff']],
          build(K) {
            canyon(K);
            bikeRig(K);
            K.cam([2.4, 44.5, -6], [0, 45.6, 0.2], 40);
            K.light(1, 0x3fe4ff, 6, [0, 44.6, -1.5], 6);
          },
        },
        {
          id: '4-2', at: [9, 13, 1, 5], shot: 'Plano detalle',
          desc: 'El brazal de Néstor proyecta un holograma: ANCLA DIMENSIONAL DETECTADA. Estadio Central, 2,3 km. Energía al 312%.',
          bub: [['n', 'El ancla de la Grieta está en el *Estadio Central*.', 0.5, 0.14, { w: 74, small: true }]],
          build(K) {
            canyon(K);
            const { n } = bikeRig(K, { npose: 'hud', nface: 'neutral' });
            const w = wpos(n.lEl, 0, -0.2, 0), h = headOf(n), f = fwd(n), side = V(f.z, 0, -f.x);
            const hp = w.clone().add(V(0, 0.2, 0)).lerp(h, 0.15);
            const c = hp.clone().addScaledVector(f, 0.62).addScaledVector(side, 0.16); c.y += 0.04;
            K.holo(hp.toArray(), Math.atan2(c.x - hp.x, c.z - hp.z) / D, -6, 0.4);
            K.light(1, 0x3fe4ff, 0.3, hp.toArray(), 1.2);
            K.cam(c.toArray(), hp.clone().lerp(h, 0.35).toArray(), 44);
          },
        },
        {
          id: '4-3', at: [1, 5, 5, 9], shot: 'Primer plano',
          desc: 'Leo, agarrado a su padre, el pelo azotado por el viento. Se le ilumina la cara: conoce ese estadio.',
          bub: [['l', '¿El estadio? ¡Me conozco *cada palmo* de ese césped!', 0.5, 0.15, { w: 80, small: true }]],
          build(K) {
            canyon(K);
            const { l } = bikeRig(K, { lpose: 'rideBack', lopt: { face: 'smile', pose: { neck: [-26, 20, 0] } } });
            const h = headOf(l);
            K.cam([h.x - 0.85, h.y - 0.05, h.z - 0.42], [h.x, h.y - 0.02, h.z], 36);
          },
        },
        {
          id: '4-4', at: [5, 13, 5, 9], shot: 'Plano subjetivo hacia atrás',
          desc: 'Mirando hacia atrás: una bandada de alados persigue la moto entre las torres, alas membranosas y ojos magenta.',
          build(K) {
            canyon(K);
            bikeRig(K);
            [[-2.2, 47.2, 6.5], [2.2, 48.3, 9], [-0.6, 49.4, 12.5], [3.4, 46.6, 15], [-3.8, 48.8, 18], [0.8, 50.6, 22]].forEach(([x, y, z], i) => K.flyer({ p: [x, y, z], ry: 180 + (i % 2 ? 10 : -10), rx: -12, s: 1.7 }));
            K.cam([0.7, 46.6, 1.9], [0, 48.0, 12], 48);
            K.light(1, 0xff4ab8, 30, [0, 50, 10], 18); K.light(2, 0x3fe4ff, 10, [0, 46, 2], 6);
          },
        },
        {
          id: '4-5', at: [1, 8, 9, 13], shot: 'Plano lateral',
          desc: 'Leo se pone de pie sobre el sillín, de cara a los perseguidores, y lanza el disco hacia atrás con un revés perfecto.',
          bub: [['l', '¡Agárrate, papá!', 0.3, 0.16]],
          build(K) {
            canyon(K);
            const B = [0, 45, 0];
            K.bike({ p: B, ry: 180 });
            K.nestor('ride', { p: [0, 45 + 0.36 - 1.045 + 0.06, 0.18], ry: 180 });
            const l = K.leo('throw', { p: [0, 45.33, 0.9], ry: 0 });
            const hand = wpos(l.rWr, 0, -0.04, 0);
            K.trail([hand, V(0.6, 46.6, 4), V(1.2, 47.2, 8)], 0x3fe4ff, 0.05, 1);
            K.discAt([1.2, 47.2, 8], [0, 1, 0.2], 1.2);
            K.flyer({ p: [2, 48, 13], ry: 190, s: 1.2 });
            K.cam([3.8, 46.1, 0.9], [0.1, 46.2, 1.4], 42);
          },
        },
        {
          id: '4-6', at: [8, 13, 9, 13], shot: 'Plano medio, impacto',
          desc: 'El disco atraviesa a un alado, que revienta en una nube de esquirlas y luz magenta. Otro esquiva por los pelos.',
          sfx: [['SPLAKK!', 0.36, 0.3, -10, 0.9, '#ff3d9a']],
          fx: 'impact',
          build(K) {
            canyon(K);
            K.burst([1, 48, 14], 0xff2fa8, 3.2, 300, 0.07);
            K.glowAt([1, 48, 14], 0xff4ab8, 7, 0.9, 8);
            K.debris({ p: [1, 47, 14], n: 26, R: 2.2, h: 2, size: 0.3, color: 0x241730 });
            K.trail([V(-2, 47, 8), V(1, 48, 14), V(3, 48.6, 20)], 0x3fe4ff, 0.05, 1);
            K.discAt([3, 48.6, 20], [0.2, 1, 0], 1.2);
            K.flyer({ p: [-2.6, 49.2, 17], ry: 160, rz: 40, s: 1.2 });
            K.cam([3.4, 47.4, 9], [1, 48, 14.5], 46);
          },
        },
        {
          id: '4-7', at: [1, 13, 13, 17], shot: 'Gran plano general',
          desc: 'El Estadio Central: un anillo colosal entre rascacielos. Del centro del campo sube una columna de luz magenta hasta la Grieta. La moto, una chispa cian, se acerca.',
          cap: [['tl', 'El Estadio Central. Cien mil asientos.'], ['br', 'Esta noche, todos ocupados.', 'red']],
          build(K) {
            arena(K, { eP: [0, 30, 0] });
            const g = K.bike({ p: [150, 45, 170], ry: -140, trail: false });
            K.trail([V(260, 60, 300), V(200, 52, 230), V(150, 45, 170)], 0x3fe4ff, 0.9, 1);
            K.glowAt([150, 45, 170], 0x3fe4ff, 10, 0.9, 6);
            K.cam([190, 250, 230], [0, 20, 0], 36, 'far');
          },
        },
        {
          id: '4-8', at: [1, 6, 17, 21], shot: 'Contraplano, gradas',
          desc: 'Dentro. Las gradas rojas están llenas: miles de ojos magenta les miran en silencio. Padre e hijo, pequeños, sobre el césped.',
          bub: [['l', '…Hala.', 0.72, 0.84, { small: true }]],
          build(K) {
            arena(K);
            K.nestor('heroic', { p: [-0.6, 0, 30], ry: 0 });
            K.leo('stand', { p: [0.6, 0, 30.2], ry: 6 });
            K.cam([0.6, 1.3, 25.5], [0, 16, 70], 52, 6);
          },
        },
        {
          id: '4-9', at: [6, 13, 17, 19], shot: 'Plano medio, perfil',
          desc: 'Néstor se gira hacia Leo, serio. Leo responde de memoria.',
          bub: [['n', 'Leo, ¿te acuerdas de lo que te *enseñé*?', 0.74, 0.22, { w: 40, small: true }], ['l', '¿Que nunca hay que *rendirse*?', 0.24, 0.28, { w: 32, small: true }]],
          build(K) {
            arena(K);
            K.nestor('talk', { p: [-23.45, 0, 30], ry: -90 });
            K.leo('stand', { p: [-24.45, 0, 30], ry: 90, pose: { neck: [-8, 0, 0] } });
            K.cam([-23.95, 1.45, 33.4], [-23.95, 1.42, 30], 30);
          },
        },
        {
          id: '4-10', at: [6, 13, 19, 21], shot: 'Primer plano, dos personajes',
          desc: 'Media sonrisa de Néstor. Leo pone los ojos en blanco y sonríe también.',
          bub: [['n', 'No. Que se chuta con el *interior del pie*.', 0.7, 0.3, { w: 44, small: true }]],
          build(K) {
            arena(K);
            const n = K.nestor('talk', { p: [-23.45, 0, 30], ry: -90, face: 'smile', shield: false });
            K.leo('stand', { p: [-24.45, 0, 30], ry: 90, face: 'smile', pose: { neck: [-8, 0, 0] } });
            const h = headOf(n);
            K.cam([h.x - 0.45, h.y - 0.12, h.z + 2.3], [h.x - 0.5, h.y - 0.16, h.z], 30);
          },
        },
        {
          id: '4-11', at: [1, 13, 21, 26], shot: 'Gran plano general dorsal',
          desc: 'Néstor solo frente a la marea. Escudo al frente, lanza sobre el hombro, la capa roja contra el resplandor del Núcleo. Cientos de rastreros bajan de las gradas. Leo espera su momento a un lado.',
          bub: [['n', 'Yo te abro *hueco*. Tú, a *puerta*.', 0.2, 0.22, { w: 26, small: true }], ['n', '¡ESTA NOCHE… JUGAMOS EN CASA!', 0.68, 0.16, { shout: true, w: 44 }]],
          build(K) {
            arena(K, { eP: [0, 4, 12] });
            K.nestor('guard', { p: [0, 0, 22], ry: 180, capeP: { billow: 0.5, lift: 30, amp: 0.1, freq: 3 } });
            K.leo('fight', { p: [-3.2, 0, 25], ry: 165 });
            hordeField(K, { n: 140, x: [-34, 34], z: [-26, 14], ry: 0, seed: 7 });
            K.cam([1.6, 0.85, 27.4], [0, 2.6, 5], 46);
          },
        },
      ],
    },
    // ======================================================== PÁGINA V
    {
      title: 'Golazo',
      beat: 'Néstor abre hueco a lanza y escudo; Leo corre la banda hasta el Núcleo. El Coloso se planta delante como un portero y Néstor le clava la lanza en el ojo. Leo convierte su disco en plasma y chuta. Gol. La Grieta se cierra. Amanece. Pero algo, en el cielo, abre un ojo.',
      panels: [
        {
          id: '5-1', at: [1, 8, 1, 5], shot: 'Plano lateral en movimiento',
          desc: 'La carga. Néstor arrolla a la horda escudo por delante; rastreros volando por los aires, cascotes de césped, chispas.',
          sfx: [['¡¡AAAARGH!!', 0.72, 0.2, 6, 0.7, '#ffb23a']],
          cap: [['bl', 'Uno contra mil. Las cuentas no salían. A Néstor nunca le gustaron las matemáticas.']],
          build(K) {
            arena(K);
            K.nestor('charge', { p: [0, 0, 10], ry: 180 });
            K.crawler({ p: [0.3, 1.5, 7.4], rx: -55, ry: 20, jaw: 70, bob: false });
            K.crawler({ p: [-1.6, 2.6, 6.2], rz: 120, ry: -40, jaw: 60, bob: false });
            K.crawler({ p: [1.8, 0.5, 6.8], rz: -40, ry: 70, jaw: 50, bob: false });
            hordeField(K, { n: 40, x: [-12, 12], z: [-14, 4], ry: 0, seed: 3 });
            K.debris({ p: [0, 0, 7.5], n: 40, R: 2.5, h: 2.5, size: 0.25, color: 0x2a3418 });
            K.burst([0.2, 1.3, 8.1], 0xffd080, 1.5, 160, 0.04);
            K.cam([4.6, 1.0, 9.6], [0, 1.25, 8.6], 44);
          },
        },
        {
          id: '5-2', at: [8, 13, 1, 5], shot: 'Plano frontal en carrera',
          desc: 'Leo corre por la banda esquivando garras. Un alado se le echa encima; él ni frena.',
          build(K) {
            arena(K);
            const ry = Math.atan2(-30, -33) / D;
            K.leo('run', { p: [30, 0, 33], ry });
            K.flyer({ p: [31.5, 3.2, 36], ry: ry - 20, rx: 25, s: 1.1 });
            K.crawler({ p: [27.8, 0, 35.5], ry: ry + 70, jaw: 60 });
            K.cam([27.2, 1.15, 29.9], [30, 1.05, 33], 44);
          },
        },
        {
          id: '5-3', at: [1, 5, 5, 9], shot: 'Contrapicado',
          desc: 'El Núcleo: una esfera de energía viva sobre el círculo central, unida a la Grieta por una columna de luz. Relámpagos lamen el césped.',
          build(K) {
            arena(K);
            K.cam([7, 1.6, 16], [0, 12.5, 0], 54);
          },
        },
        {
          id: '5-4', at: [5, 13, 5, 9], shot: 'Plano general dorsal',
          desc: 'El Coloso surge del césped detrás del Núcleo, cubriendo la portería. Leo, diminuto, se detiene un segundo.',
          bub: [['l', 'Ah, genial. Un *portero*.', 0.78, 0.6, { w: 30 }]],
          build(K) {
            arena(K);
            K.titan({ p: [-6, -6, -18], ry: 22, jaw: 26 });
            K.debris({ p: [-6, 0, -12], n: 40, R: 10, h: 4, size: 0.9, color: 0x2a3418 });
            K.leo('stand', { p: [12, 0, 20], ry: -149 });
            K.cam([15.5, 1.3, 25.5], [-3, 12, -6], 48);
          },
        },
        {
          id: '5-5', at: [1, 10, 9, 13], shot: 'Plano dorsal, tres cuartos',
          desc: 'Néstor lanza la lanza con todo el cuerpo, como Leónidas. La lanza cruza el campo dejando una estela cian directa al ojo del Coloso.',
          bub: [['n', '¡LEO, AHORA!', 0.24, 0.2, { shout: true }]],
          build(K) {
            arena(K);
            K.titan({ p: [-6, -6, -18], ry: 22, jaw: 26 });
            const E = wpos(K.titanEye, 0, 0.35, 3.8);
            const P0 = V(22, 0, 6), ry = Math.atan2(E.x - P0.x, E.z - P0.z) / D;
            const n = K.nestor('release', { p: P0.toArray(), ry });
            const hand = wpos(n.rWr, 0, -0.04, 0);
            const mid = hand.clone().lerp(E, 0.55); mid.y += 2.5;
            K.trail([hand, mid], 0x3fe4ff, 0.07, 1);
            const s = K.spear(); s.position.copy(mid); s.quaternion.setFromUnitVectors(V(0, 1, 0), E.clone().sub(mid).normalize()); K.add(s);
            const f = fwd(n), sd = V(f.z, 0, -f.x);
            K.cam([P0.x - f.x * 4.2 + sd.x * 1.6, 1.5, P0.z - f.z * 4.2 + sd.z * 1.6], [P0.x + f.x * 12, 5.5, P0.z + f.z * 12], 50);
            K.light(1, 0x3fe4ff, 6, [hand.x, hand.y + 0.5, hand.z], 6);
          },
        },
        {
          id: '5-6', at: [10, 13, 9, 13], shot: 'Plano detalle',
          desc: 'La lanza se clava en el ojo del Coloso. Estallido de fuego y luz. El gigante se dobla.',
          sfx: [['SHKUNK!', 0.5, 0.78, -8, 0.7, '#ffb23a']],
          build(K) {
            arena(K);
            K.titan({ p: [-6, -6, -18], ry: 22, jaw: 50 });
            const E = wpos(K.titanEye, 0, 0.35, 3.8), Ein = wpos(K.titanEye, 0, 0.35, 3.0);
            const from = V(22, 1.8, 6), dir = Ein.clone().sub(from).normalize();
            const s = K.spear(); s.position.copy(Ein).addScaledVector(dir, -2.7); s.quaternion.setFromUnitVectors(V(0, 1, 0), dir); K.add(s);
            K.burst(E.toArray(), 0xffa040, 3, 260, 0.08); K.glowAt(E.toArray(), 0xffd060, 10, 0.9, 8);
            K.cam([E.x + 5.5, E.y + 1.2, E.z + 7], [E.x + 0.4, E.y - 0.5, E.z], 40);
          },
        },
        {
          id: '5-7', at: [1, 6, 13, 17], shot: 'Plano medio de perfil',
          desc: 'Leo en guardia baja, como en un kata. El disco gira delante de su puño y se convierte en una bola de plasma cian.',
          bub: [['l', 'Con el *interior del pie*…', 0.3, 0.14, { small: true }]],
          build(K) {
            arena(K);
            const l = K.leo('lunge', { p: [0, 0, 0], ry: 90 });
            const f = wpos(l.lWr, 0, -0.04, 0).add(V(0.38, 0.02, 0));
            K.plasma(f.toArray(), 0.22);
            K.burst(f.toArray(), 0x9ff8ff, 0.9, 120, 0.02);
            K.light(1, 0x3fe4ff, 6, f.toArray(), 4);
            K.cam([0.25, 1.0, 3.3], [0.3, 0.98, 0], 40);
          },
        },
        {
          id: '5-8', at: [6, 13, 13, 17], shot: 'Plano detalle, cámara baja',
          desc: 'La volea. El pie de Leo golpea la bola de plasma de lleno. Anillos de energía, el césped se levanta.',
          fx: 'speed',
          sfx: [['¡¡GOOOOLAAAZOOOO!!', 0.5, 0.2, -6, 0.75, '#ffd23a']],
          build(K) {
            arena(K);
            const l = K.leo('kick', { p: [0, 0.25, 0], ry: 90 });
            const b = wpos(l.rAn, 0, -0.03, 0.14).add(V(0.22, 0, 0));
            K.plasma(b.toArray(), 0.24);
            K.rings({ p: b.toArray(), dir: [1, 0.1, 0], travel: 4, r: 1.6, r0: 0.2, n: 5, speed: 1.2, color: 0x9ff8ff, tube: 0.04 });
            K.streaks({ p: [b.x - 3, b.y, b.z], dir: [-1, 0, 0], size: [2, 10, 2], n: 160, op: 0.4 });
            K.debris({ p: [0, 0, 0], n: 30, R: 1.4, h: 0.8, size: 0.12, color: 0x2a3418 });
            K.light(1, 0x3fe4ff, 8, b.toArray(), 5);
            K.cam([b.x + 1.9, 0.45, b.z + 2.0], [b.x - 0.35, b.y + 0.2, b.z], 46);
          },
        },
        {
          id: '5-9', at: [1, 13, 17, 21], shot: 'Gran plano general',
          desc: 'La bola de plasma atraviesa el Núcleo, que estalla en una esfera de luz blanca. Ondas de choque barren el estadio; la silueta del Coloso se deshace.',
          sfx: [['KA-BOOOOOM!', 0.5, 0.17, -4, 1.0, '#ffffff']],
          build(K) {
            arena(K, { core: false });
            K.titan({ p: [-6, -6, -18], ry: 22, jaw: 50 });
            const c = K.core({ p: [0, 18, 0], r: 24, c1: 0xffe0f6, c2: 0xff2fa8, bolts: false });
            K.glowAt([0, 18, 0], 0xffffff, 260, 0.75, 1.5); K.glowAt([0, 18, 0], 0xff4ab8, 420, 0.5, 1.1);
            K.rings({ p: [0, 2, 0], dir: [0, 1, 0], r: 120, n: 4, speed: 0.35, color: 0xffd0f0, tube: 0.012 });
            K.rings({ p: [0, 14, 0], dir: [0.3, 0.2, 1], r: 60, n: 3, speed: 0.45, color: 0x9ff8ff, tube: 0.015 });
            K.trail([V(40, 1, 30), V(18, 8, 14), V(0, 14, 0)], 0x9ff8ff, 0.6, 1);
            K.burst([-6, 12, -12], 0xff2fa8, 20, 400, 0.4);
            K.cam([150, 150, 150], [0, 18, 0], 42, 'far');
          },
        },
        {
          id: '5-10', at: [1, 6, 21, 25], shot: 'Contrapicado al cielo',
          desc: 'Desde el césped, a través del anillo del techo: la Grieta se encoge sobre sí misma hasta ser una línea.',
          cap: [['bl', 'Y la Grieta, por primera vez en su eterna existencia, tuvo miedo.']],
          build(K) {
            arena(K, { core: false, rift: false });
            K.rift({ p: [0, 300, -150], h: 240, w: 50, thin: 0.14, seed: 8, nb: 4 });
            K.rings({ p: [0, 300, -150], dir: [0, -0.9, 0.45], r: 140, n: 4, speed: -0.3, color: 0xffb0f4, tube: 0.01 });
            K.cam([0, 2, 12], [0, 300, -150], 52, 14);
          },
        },
        {
          id: '5-11', at: [6, 13, 21, 25], shot: 'Plano dorsal, amanecer',
          desc: 'Amanece. De vuelta en lo alto de su torre, padre e hijo se sientan en el borde con las piernas colgando. La ciudad humea bajo un sol de bronce. El brazo de Néstor sobre los hombros de Leo.',
          bub: [['n', 'Buen partido, *campeón*.', 0.2, 0.14, { small: true }], ['l', '¿Llegamos a *cenar*?', 0.6, 0.3, { small: true }], ['n', 'Llegamos a *desayunar*.', 0.8, 0.12, { small: true }]],
          build(K) {
            K.sky('dawn', { sunDir: [0.15, 0.06, -1], key: [0xffe0b0, 3.0, [0.15, 0.35, -1]], rim: [0xff9a60, 1.6, [0.3, 0.3, 1]] });
            K.envRooftop();
            K.embers({ p: [0, Y + 4, -30], size: [50, 20, 50], color: 0xffc080, n: 220 });
            K.pts({ p: [0, Y - 30, -160], n: 300, color: 0x6a5048, sz: 2.4, mode: 0, size: [300, 120, 200] });
            K.nestor('sitArm', { p: [-0.42, Y + 1.25 - 1.045 + 0.06, -15.08], ry: 180 });
            K.leo('sit', { p: [0.45, Y + 1.25 - 0.815 + 0.06, -15.05], ry: 180, face: 'smile' });
            K.cam([0.6, Y + 0.95, -11.4], [0, Y + 10, -48], 50, 5);
          },
        },
        {
          id: '5-12', at: [1, 13, 25, 29], shot: 'Gran plano general, cielo',
          desc: 'El cielo de la mañana conserva una cicatriz. Y en ella, despacio, se abre un ojo.',
          cap: [['bc', 'Continuará…', 'big red']],
          build(K) {
            K.sky('omen'); K.envStadium();
            K.rift({ p: [0, 560, -330], h: 360, w: 18, thin: 0.06, bolts: false, seed: 4 });
            K.skyEye({ p: [0, 560, -325], s: 150, open: 0.5 });
            K.nestor('lookUp', { p: [29.4, 0, 146], ry: 180, spear: { dir: [0.03, 1, 0.06], grip: 'ground' }, shield: 'back' });
            K.leo('lookUp', { p: [30.7, 0, 146.3], ry: 188 });
            K.embers({ p: [30, 6, 140], size: [40, 14, 40], color: 0xffa060, n: 160 });
            K.cam([31.4, 1.4, 152.4], [6, 420, -330], 56, 8);
          },
        },
      ],
    },
  ],
};
