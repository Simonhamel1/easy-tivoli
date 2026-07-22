// Easy Tivoli — intro 3D du logo (Three.js, WebGL)
// Une tuile 3D portant le logo ET tourne face caméra, flotte, puis
// l'overlay s'efface pour révéler le site. Léger : la scène ne tourne
// que pendant l'intro puis se libère. Fallback propre si WebGL/RGM.

import * as THREE from 'three';

const overlay = document.getElementById('intro');
const canvas  = document.getElementById('introCanvas');
const root    = document.documentElement;

const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

// Termine l'intro : déverrouille le scroll, efface l'overlay, prévient le reste du site.
let ended = false;
function finish() {
  if (ended) return;
  ended = true;
  overlay.classList.add('done');
  root.classList.remove('intro-lock');
  document.dispatchEvent(new CustomEvent('intro:done'));
  // retire l'overlay du DOM après la transition d'opacité
  setTimeout(() => overlay && overlay.remove(), 900);
}

// Chemin de secours : pas de WebGL, mouvement réduit, ou erreur → on saute l'intro.
function bail() {
  if (overlay) overlay.remove();
  root.classList.remove('intro-lock');
  document.dispatchEvent(new CustomEvent('intro:done'));
}

if (reduce || !overlay || !canvas) {
  bail();
} else {
  root.classList.add('intro-lock');
  try {
    runIntro();
  } catch (e) {
    console.warn('Intro 3D indisponible :', e);
    bail();
  }
}

function runIntro() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6.2);

  // ---- Lumières : douces + un point mobile pour le reflet ----
  scene.add(new THREE.HemisphereLight(0xffffff, 0x1f2a24, 1.05));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(3, 4, 5);
  scene.add(key);
  const glint = new THREE.PointLight(0x8fd6b4, 2.2, 20);
  glint.position.set(-2, 1, 3);
  scene.add(glint);

  // ---- Champ de particules (profondeur, faible coût) ----
  const pGeo = new THREE.BufferGeometry();
  const COUNT = 220;
  const pos = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 16;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
    pos[i * 3 + 2] = -2 - Math.random() * 8;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({ color: 0x1f4d3a, size: 0.05, transparent: true, opacity: 0.55 })
  );
  scene.add(particles);

  // ---- La tuile logo (BoxGeometry : vraie épaisseur = lecture 3D) ----
  const group = new THREE.Group();
  scene.add(group);

  const tex = new THREE.TextureLoader().load('images/logo.png', () => renderer.render(scene, camera));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const S = 2.1, D = 0.34;                 // taille & épaisseur de la tuile
  const face = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, metalness: 0.15 });
  const edge = new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.5, metalness: 0.3 });
  // ordre BoxGeometry : [px, nx, py, ny, pz, nz] → face avant = pz
  const tile = new THREE.Mesh(
    new THREE.BoxGeometry(S, S, D),
    [edge, edge, edge, edge, face, edge]
  );
  group.add(tile);

  // halo derrière la tuile
  const halo = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 48),
    new THREE.MeshBasicMaterial({ color: 0x14231c, transparent: true, opacity: 0.6 })
  );
  halo.position.z = -0.6;
  group.add(halo);

  // ---- Timeline ----
  const clock = new THREE.Clock();
  const IN = 1.7;      // durée de l'entrée (rotation + arrivée)
  const HOLD = 0.55;   // temps d'arrêt face caméra
  const OUT = 0.6;     // recul + fondu
  const TOTAL = IN + HOLD + OUT;

  const easeOutBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const easeInOut   = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  let fading = false;
  function loop() {
    if (ended) return;
    const t = clock.getElapsedTime();
    const dt = t; // temps absolu

    // idle des particules
    particles.rotation.y = t * 0.04;
    particles.rotation.x = Math.sin(t * 0.2) * 0.05;

    // reflet mobile
    glint.position.x = Math.sin(t * 1.6) * 2.6;
    glint.position.y = Math.cos(t * 1.2) * 1.4;

    if (dt < IN) {
      const k = easeOutBack(Math.min(dt / IN, 1));
      group.rotation.y = (-Math.PI * 0.92) * (1 - k);   // arrive de profil → face
      group.rotation.x = 0.5 * (1 - k);
      group.position.z = -3 * (1 - k);                  // remonte vers la caméra
      group.scale.setScalar(0.6 + 0.4 * k);
    } else if (dt < IN + HOLD) {
      const f = dt - IN;
      group.rotation.y = Math.sin(f * 1.4) * 0.12;      // léger flottement
      group.rotation.x = Math.sin(f * 1.1) * 0.05;
      group.position.y = Math.sin(f * 1.6) * 0.04;
    } else if (dt < TOTAL) {
      const o = (dt - IN - HOLD) / OUT;
      const e = easeInOut(o);
      group.position.z = -3.2 * e;                       // recule
      group.scale.setScalar(1 - 0.15 * e);
      if (!fading) { fading = true; overlay.classList.add('fading'); }
      overlay.style.opacity = String(1 - e);
    } else {
      cleanup();
      finish();
      return;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  // Permet de zapper l'intro (clic / touche / bouton)
  function skip() { cleanup(); finish(); }
  overlay.addEventListener('click', skip);
  window.addEventListener('keydown', e => { if (e.key === 'Escape' || e.key === 'Enter') skip(); });

  function cleanup() {
    window.removeEventListener('resize', onResize);
    tile.geometry.dispose(); face.dispose(); edge.dispose();
    if (tex) tex.dispose();
    pGeo.dispose(); particles.material.dispose();
    halo.geometry.dispose(); halo.material.dispose();
    renderer.dispose();
  }

  // Sécurité : si l'onglet est masqué au chargement, ne bloque pas le site.
  setTimeout(() => { if (!ended) { /* la boucle continue */ } }, 50);
  requestAnimationFrame(loop);
}
