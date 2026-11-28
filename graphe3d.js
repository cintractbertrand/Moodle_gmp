/* Constellation 3D des notions du site Maths GMP.
   Module autonome : import('./graphe3d.js').then(m => m.ouvrir()).
   Données : graphe.json (généré par outils/graphe_json.py). Bibliothèques chargées à la demande (esm.sh). */
const V3 = '0.187.0';
const LIBS = () => Promise.all([
  import(`https://esm.sh/3d-force-graph@1.80.3?deps=three@${V3}`),
  import(`https://esm.sh/three@${V3}`),
  import(`https://esm.sh/three@${V3}/examples/jsm/postprocessing/UnrealBloomPass.js`),
  import(`https://esm.sh/three@${V3}/examples/jsm/lines/Line2.js`),
  import(`https://esm.sh/three@${V3}/examples/jsm/lines/LineMaterial.js`),
  import(`https://esm.sh/three@${V3}/examples/jsm/lines/LineGeometry.js`)
]);
const STYLES = [['neon', 'Néon'], ['nebuleuse', 'Nébuleuse'], ['holo', 'Hologramme'], ['papier', 'Papier'], ['sobre', 'Sobre']];
const SEMC = { S1: '#4cc9ff', S2: '#3dffb5', S3: '#ffcf4d', S4: '#ff5fa2', S6: '#b18cff' };
const PRE = '#7df9ff';
const BG = '#050811';
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const mobile = () => matchMedia('(pointer: coarse)').matches || innerWidth < 720;

const CSS = `
.cst{position:fixed;inset:0;z-index:9999;background:${BG};color:#e6f1ff;font:15px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;overflow:hidden;opacity:0;transition:opacity .45s}
.cst.on{opacity:1}.cst-stage{position:absolute;inset:0}
.cst .glass{background:rgba(14,22,44,.45);border:1px solid rgba(125,249,255,.18);backdrop-filter:blur(14px) saturate(140%);-webkit-backdrop-filter:blur(14px) saturate(140%);border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.06)}
.cst-top{position:absolute;top:12px;left:12px;right:12px;display:flex;gap:10px;align-items:center;padding:8px 10px;max-width:760px}
.cst-top h2{margin:0 6px 0 4px;font-size:15px;font-weight:650;letter-spacing:.04em;white-space:nowrap;background:linear-gradient(90deg,#7df9ff,#b18cff);-webkit-background-clip:text;background-clip:text;color:transparent}
.cst-q{flex:1;min-width:0;position:relative}
.cst-q input{width:100%;box-sizing:border-box;background:rgba(5,8,17,.55);border:1px solid rgba(125,249,255,.25);color:#e6f1ff;border-radius:10px;padding:8px 12px;font:inherit;outline:none}
.cst-q input:focus{border-color:#7df9ff;box-shadow:0 0 0 3px rgba(125,249,255,.18),0 0 18px rgba(125,249,255,.25)}
.cst-ac{position:absolute;left:0;right:0;top:calc(100% + 6px);margin:0;padding:6px;list-style:none;max-height:50vh;overflow:auto;display:none}
.cst-ac.on{display:block}.cst-ac li{padding:7px 9px;border-radius:9px;cursor:pointer;display:flex;gap:8px;align-items:baseline}
.cst-ac li.sel,.cst-ac li:hover{background:rgba(125,249,255,.12)}.cst-ac small{opacity:.6;font-size:12px;margin-left:auto;white-space:nowrap}
.cst-ac i{width:8px;height:8px;border-radius:50%;flex:none;box-shadow:0 0 8px currentColor;background:currentColor}
.cst-x{flex:none;width:36px;height:36px;border-radius:50%;border:1px solid rgba(125,249,255,.25);background:rgba(5,8,17,.5);color:#e6f1ff;font-size:18px;cursor:pointer}
.cst-x:hover{border-color:#7df9ff;box-shadow:0 0 14px rgba(125,249,255,.4)}
.cst-leg{position:absolute;left:12px;bottom:12px;padding:8px 12px;font-size:12.5px;display:flex;flex-wrap:wrap;gap:6px 14px;max-width:min(560px,calc(100% - 24px))}
.cst-leg span{display:inline-flex;align-items:center;gap:6px;opacity:.9}.cst-leg i{width:9px;height:9px;border-radius:50%;background:currentColor;box-shadow:0 0 8px currentColor}
.cst-leg b{display:inline-block;width:18px;height:2px;background:${PRE};box-shadow:0 0 6px ${PRE}}
.cst-hint{position:absolute;right:14px;bottom:14px;font-size:12px;opacity:.55;text-align:right;pointer-events:none}
.cst-load{position:absolute;inset:0;display:grid;place-items:center;font-size:14px;letter-spacing:.2em;text-transform:uppercase;color:#7df9ff;text-shadow:0 0 12px #7df9ff}
.cst-load.off{display:none}
.cst-sty{position:absolute;right:12px;bottom:40px;display:flex;gap:2px;padding:4px;font-size:12.5px}
.cst-sty button{background:none;border:0;color:#cfe0f5;padding:5px 9px;border-radius:9px;cursor:pointer;font:inherit}
.cst-sty button.on{background:rgba(125,249,255,.18);color:#fff;box-shadow:inset 0 0 0 1px rgba(125,249,255,.45)}
.cst.clair{color:#1f2a3a}
.cst.clair .glass{background:rgba(255,253,248,.8);border-color:rgba(60,70,90,.18);box-shadow:0 6px 24px rgba(60,50,30,.15)}
.cst.clair .cst-top h2{background:linear-gradient(90deg,#1d4ed8,#7c3aed);-webkit-background-clip:text;background-clip:text}
.cst.clair .cst-q input{background:#fff;color:#1f2a3a;border-color:rgba(60,70,90,.25)}
.cst.clair .cst-x,.cst.clair .cst-pn .px{color:#1f2a3a;background:#fff}
.cst.clair .cst-lb.ch{color:#1f2a3a;text-shadow:0 0 3px #f3ede1,0 0 8px #f3ede1}
.cst.clair .cst-lb.no{color:#1f2a3a;background:rgba(255,253,248,.92)}
.cst.clair .cst-leg span span,.cst.clair .cst-rel button{color:#1f2a3a!important}
.cst.clair .cst-sty button{color:#334155}.cst.clair .cst-sty button.on{background:rgba(29,78,216,.12);color:#1d4ed8;box-shadow:inset 0 0 0 1px rgba(29,78,216,.35)}
.cst.clair .cst-cnt div{background:#fff}.cst.clair .cst-cnt b{color:#1d4ed8;text-shadow:none}.cst.clair .cst-btn{color:#1f2a3a;text-shadow:none;background:#fff}
.cst.clair .cst-hint{color:#334155}
.cst.holo .cst-lb.ch{color:#a5f3fc;font-family:ui-monospace,Consolas,monospace;letter-spacing:.06em;text-transform:uppercase;font-size:12.5px}
@media (max-width:720px){.cst-sty{bottom:auto;top:100px;right:10px;font-size:11.5px}}
.cst-lb.ch.pt{font-size:12.5px;opacity:.85}
.cst-lbs{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.cst-lb{position:absolute;left:0;top:0;white-space:nowrap;transform-origin:50% 100%;will-change:transform;font-weight:600;letter-spacing:.01em;text-shadow:0 0 3px #050811,0 0 8px #050811,0 1px 2px #000;transition:opacity .25s}
.cst-lb.ch{font-size:15px;color:#e8f2ff;border-bottom:1px solid color-mix(in srgb,var(--c) 70%,transparent);padding-bottom:1px}
.cst-lb.no{font-size:13.5px;font-weight:500;color:#d6e4fa;background:rgba(5,8,17,.72);border:1px solid color-mix(in srgb,var(--c) 45%,transparent);border-radius:6px;padding:1px 6px;display:none}
@media (max-width:720px){.cst-lb.ch{font-size:12.5px}.cst-lb.no{font-size:11.5px}}
.cst-pn{position:absolute;top:76px;right:12px;width:min(360px,calc(100% - 24px));padding:16px 16px 14px;transform:translateX(calc(100% + 30px));transition:transform .5s cubic-bezier(.2,.8,.2,1);max-height:calc(100% - 140px);overflow:auto}
.cst-pn.on{transform:none}
.cst-pn h3{margin:6px 0 2px;font-size:18px;line-height:1.25}.cst-pn .sub{opacity:.7;font-size:13px}
.cst-badge{display:inline-block;font-size:11.5px;font-weight:700;letter-spacing:.08em;padding:3px 9px;border-radius:999px;border:1px solid currentColor;box-shadow:0 0 10px currentColor inset,0 0 8px currentColor}
.cst-type{font-size:11px;letter-spacing:.14em;text-transform:uppercase;opacity:.6;margin-left:8px}
.cst-cnt{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}
.cst-cnt div{background:rgba(5,8,17,.5);border:1px solid rgba(125,249,255,.14);border-radius:12px;padding:8px;text-align:center}
.cst-cnt b{display:block;font-size:20px;color:#7df9ff;text-shadow:0 0 10px rgba(125,249,255,.6)}.cst-cnt span{font-size:11px;opacity:.7}
.cst-act{display:flex;gap:8px;flex-wrap:wrap}
.cst-btn{flex:1;min-width:130px;cursor:pointer;font:inherit;font-weight:650;font-size:14px;padding:10px 12px;border-radius:12px;color:#e6fbff;background:rgba(5,8,17,.5);border:1px solid var(--c,#7df9ff);box-shadow:0 0 10px var(--c,#7df9ff),inset 0 0 12px rgba(125,249,255,.15);text-shadow:0 0 8px var(--c,#7df9ff);transition:transform .15s,box-shadow .2s}
.cst-btn:hover{transform:translateY(-1px);box-shadow:0 0 22px var(--c,#7df9ff),inset 0 0 16px rgba(125,249,255,.25)}
.cst-btn.b2{--c:#b18cff}
.cst-rel{margin-top:14px;font-size:13px}.cst-rel h4{margin:10px 0 4px;font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;opacity:.6}
.cst-rel button{display:block;width:100%;text-align:left;background:none;border:0;color:#e6f1ff;padding:5px 6px;border-radius:8px;cursor:pointer;font:inherit}
.cst-o{font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:#ffbe78;border:1px solid rgba(255,190,120,.5);border-radius:6px;padding:0 4px}
.cst-rel button:hover{background:rgba(125,249,255,.1)}.cst-rel em{display:block;font-style:normal;opacity:.55;font-size:12px}
.cst-pn .px{position:absolute;top:8px;right:10px;background:none;border:0;color:#e6f1ff;opacity:.6;font-size:18px;cursor:pointer}
.scene-tooltip{font:13px system-ui,sans-serif!important;background:rgba(14,22,44,.8)!important;border:1px solid rgba(125,249,255,.3);border-radius:8px;padding:4px 8px!important;backdrop-filter:blur(6px)}
@media (max-width:720px){.cst-top h2{display:none}.cst-hint{display:none}.cst-pn{top:auto;bottom:10px;right:10px;left:10px;width:auto;max-height:58%;transform:translateY(calc(100% + 30px))}.cst-pn.on{transform:none}.cst-leg{bottom:auto;top:66px;font-size:11.5px;padding:6px 10px}}
@media (prefers-reduced-motion:reduce){.cst,.cst-pn{transition:none}}
`;

let ui = null; // instance unique

/* Options (toutes facultatives) — le même module sert au site étudiants et à l'atelier GMP :
   data : { nodes, links } déjà prêts (sinon graphe.json est chargé)
   compteurs(n) -> [[valeur, libellé], ...]   boutons(n) -> [[libellé, action], ...]   (action reçoit n, la vue est refermée avant) */
export async function ouvrir(cfg = {}) {
  if (ui) { ui.show(); return; }
  ui = await construire(cfg);
}

async function construire(cfg) {
  if (!document.getElementById('cst-css')) { const st = document.createElement('style'); st.id = 'cst-css'; st.textContent = CSS; document.head.appendChild(st); }
  const root = document.createElement('div'); root.className = 'cst'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Constellation des notions');
  root.innerHTML = `<div class="cst-stage"></div>
  <div class="cst-load">Allumage des étoiles…</div>
  <div class="cst-top glass"><h2>✦ Constellation</h2><div class="cst-q"><input type="search" placeholder="Rechercher une notion, un chapitre…" aria-label="Rechercher" autocomplete="off"><ul class="cst-ac glass" role="listbox"></ul></div><button class="cst-x" title="Revenir au site (Échap)" aria-label="Fermer">✕</button></div>
  <div class="cst-leg glass">${Object.entries(SEMC).map(([s, c]) => `<span style="color:${c}"><i></i><span style="color:#e6f1ff">${s}</span></span>`).join('')}<span><b></b>prérequis</span><span><b style="background:#ffbe78;box-shadow:0 0 6px #ffbe78"></b>outil commun</span></div>
  <div class="cst-sty glass" role="radiogroup" aria-label="Ambiance">${STYLES.map(([k, t]) => `<button data-sty="${k}" title="Ambiance ${t}">${t}</button>`).join('')}</div>
  <div class="cst-hint">Glisser : tourner · molette / pincer : zoom · clic : explorer</div>
  <div class="cst-lbs"></div><aside class="cst-pn glass" aria-live="polite"></aside>`;
  document.body.appendChild(root);
  const $ = (s) => root.querySelector(s);
  const planetes = [], etoiles = []; let style = 'neon', PAL = { pre: '125,249,255', out: '255,190,120' };
  let G = null, hov = null, sel = null, fitDone = false, labs = root.querySelector('.cst-lbs'), pv = null; const hiN = new Set(), hiL = new Set(); const prevOverflow = document.body.style.overflow;
  const show = () => { root.style.display = ''; document.body.style.overflow = 'hidden'; requestAnimationFrame(() => root.classList.add('on')); if (G) { G.resumeAnimation(); ctr().autoRotate = !sel; } };
  const hide = () => { root.classList.remove('on'); document.body.style.overflow = prevOverflow; setTimeout(() => { if (!root.classList.contains('on')) { root.style.display = 'none'; G && G.pauseAnimation(); } }, 450); };
  show();
  $('.cst-x').onclick = hide;

  let data, libs;
  try { [data, libs] = await Promise.all([cfg.data ? Promise.resolve(cfg.data) : fetch('graphe.json?v=3').then((r) => r.json()), LIBS()]); }
  catch (e) { $('.cst-load').textContent = 'Connexion nécessaire pour la vue 3D.'; return { show }; }
  const [{ default: ForceGraph3D }, THREE, { UnrealBloomPass }, { Line2 }, { LineMaterial }, { LineGeometry }] = libs;

  // ---------- données ----------
  pv = new THREE.Vector3();
  const byId = new Map(data.nodes.map((n) => [n.id, n]));
  const EP = { constellation: 3.4, hierarchie: 1.9 }; const rubans = [];
  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), tmpN = new THREE.Vector3(), tmpM = new THREE.Vector3();

  const out = new Map(), inc = new Map();
  for (const l of data.links) { (out.get(l.source) || out.set(l.source, []).get(l.source)).push(l); (inc.get(l.target) || inc.set(l.target, []).get(l.target)).push(l); }
  { const chs = data.nodes.filter((n) => n.type === 'chapitre').sort((a, b) => a.id.localeCompare(b.id));
    for (let k = 1; k < chs.length; k++) if (chs[k].sem === chs[k - 1].sem) data.links.push({ source: chs[k - 1].id, target: chs[k].id, type: 'constellation' }); }
  // chaque semestre = une constellation, à distance des autres (parcours en arc S1 -> S6)
  // spirale en 3D : chaque semestre tourne de 75° et monte d'un étage (S1 en bas, S6 en haut)
  // S1, S2, S3 (le gros du volume horaire) au cœur de la spirale ; S4 et S6, plus courts, en périphérie et en petit
  const POIDS = { S1: 1, S2: 1, S3: 1, S4: .62, S6: .55 };
  const ANC0 = { S1: [-150, -110, 60], S2: [70, -30, 150], S3: [130, 70, -80], S4: [-20, 160, -150], S6: [-190, 175, -30] };
  const ANC = Object.fromEntries(Object.entries(ANC0).map(([k, v]) => [k, v.map((x) => x * .82)])); // rapprochées de 18 %
  const ancre = (k) => { let ns = []; const f = (al) => { for (const n of ns) { const a = ANC[n.sem]; if (!a) continue; const kk = (n.type === 'chapitre' ? k : k * .45) * al; n.vx += (a[0] - n.x) * kk; n.vy += (a[1] - n.y) * kk; n.vz += (a[2] - n.z) * kk; } }; f.initialize = (x) => { ns = x; }; return f; };
  const R0 = { semestre: 9, chapitre: 8.5, notion: 3.6 }; const rOf = (n) => R0[n.type] * (POIDS[n.sem] || 1);

  // ---------- scène ----------
  const mob = mobile();
  G = ForceGraph3D({ controlType: 'orbit', rendererConfig: { antialias: !mob, alpha: false, powerPreference: 'high-performance' } })($('.cst-stage'))
    .backgroundColor(BG).showNavInfo(false)
    .graphData(data)
    .nodeId('id').nodeVal((n) => rOf(n) ** 2 / 4)
    .nodeLabel((n) => `<b>${esc(n.label)}</b>${n.type === 'notion' ? '<br><span style="opacity:.7">' + esc(n.chapLabel) + '</span>' : n.type === 'semestre' ? '<br><span style="opacity:.7">' + esc(n.sub) + '</span>' : ''}`)
    .nodeThreeObject(nodeObj).nodeThreeObjectExtend(false)
    .linkThreeObject(linkObj).linkThreeObjectExtend(false).linkPositionUpdate(linkPos)
    .linkCurvature((l) => l.type === 'hierarchie' ? .15 : l.type === 'constellation' ? .2 : .3).linkCurveRotation((l) => ((l.why || '').length + String(l.source.id ?? l.source).length * 7) % 6.28)
    .linkOpacity(1).linkResolution(mob ? 5 : 8)
    .linkColor(linkColor).linkWidth(linkWidth)
    .linkDirectionalParticleThreeObject(pointNeon).linkDirectionalParticles(partN).linkDirectionalParticleSpeed(partV).linkDirectionalParticleWidth(partW).linkDirectionalParticleColor((l) => `rgb(${l.type === 'outil' ? PAL.out : PAL.pre})`).linkDirectionalParticleResolution(6)
    .linkDirectionalArrowLength(0).linkDirectionalArrowRelPos(.92).linkDirectionalArrowColor(() => `rgba(${PAL.pre},.75)`)
    .enableNodeDrag(false).warmupTicks(120).cooldownTicks(160).onEngineStop(() => { if (!fitDone && !sel) { fitDone = true; cadrerTout(1400); } })
    .onNodeHover((n) => { hov = n || null; $('.cst-stage').style.cursor = n ? 'pointer' : ''; majSurbrillance(); })
    .onNodeClick((n) => choisir(n, true))
    .onBackgroundClick(() => { if (sel) { sel = null; panneau(); majSurbrillance(); } });
  const ctr = () => G.controls();
  G.d3Force('charge').strength((n) => n.type === 'notion' ? -22 : -75);
  G.d3Force('link').distance((l) => l.type === 'hierarchie' ? 18 : l.type === 'constellation' ? 70 : 120).strength((l) => l.type === 'hierarchie' ? .9 : l.type === 'constellation' ? .05 : l.type === 'prerequis' ? .012 : .006);
  G.d3Force('ancre', ancre(.09));
  G.renderer().setPixelRatio(Math.min(devicePixelRatio || 1, mob ? 1.5 : 2));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), mob ? .65 : .8, .35, .45);
  G.postProcessingComposer().addPass(bloom);
  G.renderer().outputColorSpace = THREE.LinearSRGBColorSpace; // évite le double encodage sRGB du composer (fond gris)
  const portrait = innerHeight > innerWidth; G.cameraPosition({ x: 0, y: portrait ? 260 : 140, z: Math.max(640, Math.min(1500, 400 / (.364 * innerWidth / innerHeight))) });
  const c = ctr(); c.autoRotate = true; c.autoRotateSpeed = .3; c.enableDamping = true; c.dampingFactor = .08; c.minDistance = 40; c.maxDistance = 1400; c.zoomSpeed = .35; c.rotateSpeed = .6; c.panSpeed = .6;
  c.addEventListener('start', () => { c.autoRotate = false; });

  const soleil = new THREE.DirectionalLight(0xfff1dd, 2.1), ambiante = new THREE.AmbientLight(0x7080b0, .5); soleil.position.set(-1, .8, 1.2); G.lights([soleil, ambiante]); // remplace l'éclairage par défaut (trop fort)
  // champ d'étoiles + poussière lumineuse
  { const mk = (n, rMin, rMax, size, col, op) => { const p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const v = new THREE.Vector3().randomDirection().multiplyScalar(rMin + Math.random() * (rMax - rMin)); p.set([v.x, v.y * .7, v.z], i * 3); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); return new THREE.Points(g, new THREE.PointsMaterial({ color: col, size, sizeAttenuation: true, transparent: true, opacity: op, depthWrite: false })); };
    etoiles.push(mk(mob ? 900 : 1800, 700, 2200, 2.2, 0x9fb6ff, .55), mk(mob ? 160 : 320, 60, 330, 1.1, 0x7df9ff, .35)); etoiles.forEach((o) => G.scene().add(o)); }
  // nuages de nébuleuse (style « Nébuleuse ») et grille holographique (style « Hologramme »)
  const nebuleuses = [], grille = new THREE.GridHelper(1400, 56, 0x22d3ee, 0x0e4a5a);
  { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d'); const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(.35, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
    const tx = new THREE.CanvasTexture(cv);
    for (const [k, a] of Object.entries(ANC)) for (let j = 0; j < 3; j++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, color: SEMC[k], transparent: true, opacity: (POIDS[k] || 1) < 1 ? .3 : .15, depthWrite: false, blending: THREE.AdditiveBlending })); // S1-S3 plus clairs de nature : nuage plus léger
      const sc = ((POIDS[k] || 1) * 290) * (1 - j * .2); sp.scale.set(sc, sc * .8, 1); sp.position.set(a[0] + (j - 1) * 35, a[1] + (j % 2 ? 20 : -15), a[2] + (j - 1) * 25); sp.visible = false; G.scene().add(sp); nebuleuses.push(sp); } }
  grille.position.y = -150; grille.material.transparent = true; grille.material.opacity = .55; grille.visible = false; G.scene().add(grille);

  // ---------- objets 3D des nœuds ----------
  const geo = { s: new THREE.SphereGeometry(1, 24, 16), p: new THREE.SphereGeometry(1, 48, 32), ring: new THREE.RingGeometry(1.45, 2.35, 96, 1) };
  { const a = geo.ring.attributes, uv = a.uv, ps = a.position; for (let i = 0; i < uv.count; i++) { const x = ps.getX(i), y = ps.getY(i); uv.setXY(i, (Math.hypot(x, y) - 1.45) / .9, .5); } }
  const rnd = (sd) => () => ((sd = (sd * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  function texPlanete(col, seed, gaz) { // bandes nuageuses (géante gazeuse) ou cratères (lune)
    const W = gaz ? 256 : 128, H = W / 2, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d'); const R0 = rnd(seed);
    const c = col.clone(), hsl = {}; c.getHSL(hsl); const tint = (dl, ds = 0) => { const k = new THREE.Color().setHSL((hsl.h + ds + 1) % 1, Math.min(1, hsl.s * .85), Math.max(.05, Math.min(.92, hsl.l + dl))); return '#' + k.getHexString(); };
    x.fillStyle = tint(gaz ? -.12 : -.25); x.fillRect(0, 0, W, H);
    if (gaz) { let y = 0; while (y < H) { const h = 2 + R0() * 10; x.fillStyle = tint((R0() - .45) * .45, (R0() - .5) * .05); x.globalAlpha = .55 + R0() * .45; x.fillRect(0, y, W, h); y += h; }
      x.globalAlpha = .25; for (let k = 0; k < 40; k++) { x.fillStyle = tint(R0() * .3); x.beginPath(); x.ellipse(R0() * W, R0() * H, 6 + R0() * 26, 1 + R0() * 3, 0, 0, 7); x.fill(); }
      x.globalAlpha = .9; x.fillStyle = tint(.18, .03); x.beginPath(); x.ellipse(R0() * W, H * (.3 + R0() * .4), 9, 5, 0, 0, 7); x.fill(); }
    else { x.globalAlpha = .5; for (let k = 0; k < 26; k++) { const rr = 2 + R0() * 9, px = R0() * W, py = R0() * H; x.fillStyle = tint(-.32); x.beginPath(); x.arc(px, py, rr, 0, 7); x.fill(); x.fillStyle = tint(.12); x.beginPath(); x.arc(px - rr * .25, py - rr * .25, rr * .6, 0, 7); x.fill(); } }
    x.globalAlpha = 1; const t = new THREE.CanvasTexture(cv); t.wrapS = THREE.RepeatWrapping; return t;
  }
  function texAnneau(col, seed) {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 4; const x = cv.getContext('2d'); const R0 = rnd(seed + 99);
    for (let i = 0; i < 256; i++) { const a = (.25 + R0() * .6) * Math.sin(Math.PI * i / 256) * (R0() < .08 ? .2 : 1); const k = col.clone().lerp(new THREE.Color('#ffffff'), .3 + R0() * .3);
      x.fillStyle = `rgba(${k.r * 255 | 0},${k.g * 255 | 0},${k.b * 255 | 0},${a.toFixed(3)})`; x.fillRect(i, 0, 1, 4); }
    return new THREE.CanvasTexture(cv);
  }
  function atmosphere(col, force) { return new THREE.ShaderMaterial({ uniforms: { c: { value: col.clone() }, o: { value: force } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 c; uniform float o; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.4); gl_FragColor = vec4(c * 1.2, f * o); }' }); }
  const rings = [];
  function nodeObj(n) {
    const col = new THREE.Color(SEMC[n.sem] || '#ffffff'); const g = new THREE.Group(); const r = rOf(n);
    const seed = [...n.id].reduce((a, ch) => a * 31 + ch.charCodeAt(0) | 0, 7);
    const isCh = n.type === 'chapitre';
    // planète (chapitre) ou lune (notion) : texture procédurale, éclairée, qui tourne sur elle-même
    if (!isCh) { // notion : petit point lumineux néon (non éclairé, fixe), que le halo fait briller
      const pt = new THREE.Mesh(geo.s, new THREE.MeshBasicMaterial({ color: col.clone().lerp(new THREE.Color('#ffffff'), .45), transparent: true }));
      pt.scale.setScalar(r * .55); g.add(pt); n.__mats = [pt.material]; n.__point = pt;
    } else {
    const core = new THREE.Mesh(geo.p, new THREE.MeshStandardMaterial({ map: texPlanete(col, seed, isCh), roughness: .9, metalness: 0,
      emissive: col, emissiveIntensity: .3, transparent: true }));
    core.scale.setScalar(r); core.rotation.z = .25 + (seed % 7) * .06; g.add(core); n.__mats = [core.material]; n.__spin = { m: core, v: .08 + (seed % 5) * .03 }; n.__core = core; planetes.push(n);
    }
    if (isCh) { // atmosphère lumineuse sur le pourtour
      const atm = new THREE.Mesh(geo.p, atmosphere(col, .65)); atm.scale.setScalar(r * 1.22); g.add(atm); n.__atm = atm; n.__mats.push(atm.material);
      if (seed % 3 !== 1) { // un anneau pour deux planètes sur trois
        const ring = new THREE.Mesh(geo.ring, new THREE.MeshBasicMaterial({ map: texAnneau(col, seed), side: THREE.DoubleSide, transparent: true, opacity: .75, depthWrite: false }));
        ring.scale.setScalar(r); ring.rotation.set(Math.PI / 2 - .35 - (seed % 4) * .12, (seed % 5) * .2, 0); g.add(ring); n.__mats.push(ring.material);
      }
    }
    { // étiquette HTML nette (hors 3D, donc pas floutée par le halo)
      const el = document.createElement('div'); el.className = 'cst-lb ' + (isCh ? 'ch' : 'no') + ((POIDS[n.sem] || 1) < 1 ? ' pt' : ''); el.style.setProperty('--c', SEMC[n.sem] || '#7df9ff');
      el.textContent = isCh ? n.label : (n.label.length > 46 ? n.label.slice(0, 44) + '…' : n.label); labs.appendChild(el); n.__el = el; n.__r = r;
    }
    n.__base = n.__mats.map((m) => m.uniforms ? m.uniforms.o.value : (m.opacity ?? 1)); return g;
  }
  // animation légère : électrons, halos, respiration de la sélection
  let t0 = performance.now(); let fpsN = 0, fpsT = performance.now() + 4000, allege = false; // mesure après le démarrage
  (function anim() {
    requestAnimationFrame(anim); if (!root.classList.contains('on')) return;
    const t = (performance.now() - t0) / 1000;
    { // étiquettes : projection puis placement sans chevauchement (élément choisi d'abord, puis ses liens)
      const cam = G.camera(), W = innerWidth, H = innerHeight, any = hiN.size > 0, cp = cam.position; const fy = H / 2 / Math.tan(cam.fov * Math.PI / 360); const L = [];
      for (const n of data.nodes) { const el = n.__el; if (!el || n.x === undefined) continue;
        const show = n.type === 'chapitre' || (any && hiN.has(n)); pv.set(n.x, n.y, n.z); const dist = pv.distanceTo(cp); pv.project(cam);
        if (!show || pv.z > 1 || dist < 8) { if (el.style.display !== 'none') el.style.display = 'none'; continue; }
        if (el.style.display !== 'block') { el.style.display = 'block'; n.__w = 0; }
        if (!n.__w) { n.__w = el.offsetWidth; n.__h = el.offsetHeight; }
        const pr = n === (hov || sel) ? 0 : any && hiN.has(n) ? (n.type === 'notion' ? 1 : 2) : 3;
        L.push({ n, el, pr, dist, x: (pv.x + 1) / 2 * W, y: (1 - pv.y) / 2 * H - (n.__r * 1.9 * fy / dist) - 4 }); }
      L.sort((a, b) => a.pr - b.pr || a.dist - b.dist); const placed = [];
      const hit = (x, y, w, h) => placed.some((r) => x < r[2] && x + w > r[0] && y < r[3] && y + h > r[1]);
      for (const o of L) { const w = o.n.__w + 4, h = o.n.__h + 2; let x = o.x - w / 2, y = o.y - h, ok = !hit(x, y, w, h);
        for (let k = 1; !ok && k <= 4 && o.pr < 3; k++) for (const dy of [-k * h, k * h]) if (!ok && !hit(x, y + dy, w, h)) { y += dy; ok = true; }
        if (!ok) { o.el.style.opacity = 0; continue; } placed.push([x, y, x + w, y + h]);
        o.el.style.transform = `translate(${(x + 2).toFixed(1)}px,${(y + 1).toFixed(1)}px)`;
        o.el.style.opacity = any ? (hiN.has(o.n) ? 1 : .3) : (o.n.type === 'chapitre' ? Math.max(.45, Math.min(1, 900 / o.dist)) : 1); } }
    for (const n of data.nodes) if (n.__spin) n.__spin.m.rotation.y = t * n.__spin.v;
    for (const n of data.nodes) if (n.__halo) { n.__halo.lookAt(G.camera().position); n.__halo.scale.setScalar(R.chapitre * (1.9 + .12 * Math.sin(t * 2 + n.id.length))); }
    if (sel && sel.__threeObj) sel.__threeObj.scale.setScalar(1 + .08 * Math.sin(t * 2));
    fpsN++; const now = performance.now(); if (now < fpsT) fpsN = 0; else if (now - fpsT > 2000) { const fps = fpsN * 1000 / (now - fpsT); fpsN = 0; fpsT = now; if (fps < 40 && !allege) { allege = true; G.renderer().setPixelRatio(1); bloom.strength *= .9; } }
  })();

  // ---------- surbrillance ----------
  const groupe = (n) => n.type === 'chapitre' ? new Set([n.id, ...data.nodes.filter((x) => x.chap === n.id).map((x) => x.id)]) : new Set([n.id]);
  function voisinage(n) { hiN.clear(); hiL.clear(); if (!n) return; hiN.add(n); const G0 = groupe(n);
    for (const l of data.links) { if (l.type === 'constellation') continue; const s = l.source.id ?? l.source, t = l.target.id ?? l.target;
      if (G0.has(s) || G0.has(t)) { hiL.add(l); hiN.add(byId.get(s)); hiN.add(byId.get(t)); } } }
  function linkColor(l) { const on = hiL.has(l), any = hiN.size > 0;
    if (l.type === 'constellation') return hexA(SEMC[l.source.sem || byId.get(l.source)?.sem] || '#8fa8ff', any ? .25 : .7);
    if (l.type === 'prerequis') return `rgba(${PAL.pre},${on ? .75 : any ? .08 : .4})`;
    if (l.type === 'outil') return `rgba(${PAL.out},${on ? .7 : any ? .05 : .22})`;
    const c = SEMC[(l.source.sem || byId.get(l.source)?.sem)] || '#8fa8ff'; if (l.niveau === 'semestre') return any ? 'rgba(255,255,255,.04)' : 'rgba(220,230,255,.16)'; return on ? c : any ? 'rgba(120,140,190,.05)' : hexA(c, .22); }
  function linkWidth() { return 0; } // liens entre notions : filaments fins
  // liens de structure : rubans plats d'épaisseur constante à l'écran (pas de tubes), plus épais entre chapitres
  function linkObj(l) {
    if (!EP[l.type]) return null;
    const geo = new LineGeometry(); geo.setPositions(new Array(13 * 3).fill(0));
    const mat = new LineMaterial({ color: new THREE.Color(SEMC[byId.get(l.source.id ?? l.source)?.sem] || '#8fa8ff'), linewidth: EP[l.type] * (mob ? .8 : 1), transparent: true, opacity: opRuban(l), depthWrite: false });
    mat.resolution.set(innerWidth, innerHeight); const o = new Line2(geo, mat); o.frustumCulled = false; l.__lm = mat; rubans.push(mat); return o;
  }
  function linkPos(o, { start, end }, l) {
    if (!l.__lm) return false; // laisser 3d-force-graph placer les autres liens
    tmpA.set(start.x, start.y, start.z); tmpB.set(end.x, end.y, end.z); tmpM.addVectors(tmpA, tmpB).multiplyScalar(.5);
    tmpN.subVectors(tmpB, tmpA); const L = tmpN.length(); tmpN.cross(new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(L * (l.type === 'constellation' ? .16 : .1));
    tmpM.add(tmpN); const P = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12, u = 1 - t; P.push(u * u * tmpA.x + 2 * u * t * tmpM.x + t * t * tmpB.x, u * u * tmpA.y + 2 * u * t * tmpM.y + t * t * tmpB.y, u * u * tmpA.z + 2 * u * t * tmpM.z + t * t * tmpB.z); }
    o.geometry.setPositions(P); return true;
  }
  function opRuban(l) { const any = hiN.size > 0; const on = l.type === 'hierarchie' ? hiL.has(l) : (hiN.has(byId.get(l.source.id ?? l.source)) && hiN.has(byId.get(l.target.id ?? l.target)));
    return any ? (on ? .85 : .08) : (l.type === 'constellation' ? .75 : .45); }
  function majRubans() { for (const l of data.links) if (l.__lm) l.__lm.opacity = opRuban(l); }
  function partN(l) { return l.type === 'hierarchie' || l.type === 'constellation' ? 0 : hiL.has(l) ? (l.type === 'prerequis' ? 3 : 2) : hiN.size ? 0 : (l.type === 'prerequis' ? 1 : 0); }
  function partV(l) { return hiL.has(l) ? .006 : .0025; }
  function partW(l) { return hiL.has(l) ? 1.5 : 1.1; }
  // particules : petits points lumineux (sprite à halo, mélange additif) au lieu de boules
  const geoPoint = new THREE.SphereGeometry(1, 10, 8);
  function pointNeon(l) { // petite étincelle non éclairée : le halo (bloom) la fait briller comme un point néon
    const m = new THREE.Mesh(geoPoint, new THREE.MeshBasicMaterial({ color: new THREE.Color(`rgb(${l.type === 'outil' ? PAL.out : PAL.pre})`), transparent: true, opacity: .95, depthWrite: false, blending: style === 'papier' ? THREE.NormalBlending : THREE.AdditiveBlending }));
    m.scale.setScalar(hiL.has(l) ? .75 : .55); return m;
  }
  function hexA(h, a) { const x = parseInt(String(h).slice(1), 16); return `rgba(${x >> 16 & 255},${x >> 8 & 255},${x & 255},${a})`; }
  function majSurbrillance() {
    voisinage(hov || sel); const any = hiN.size > 0;
    for (const n of data.nodes) if (n.__mats) n.__mats.forEach((m, i) => { const v = !any || hiN.has(n) ? n.__base[i] : n.__base[i] * .3; if (m.uniforms) m.uniforms.o.value = v; else m.opacity = v; });
    G.linkColor(linkColor).linkWidth(linkWidth).linkDirectionalParticles(partN).linkDirectionalParticleSpeed(partV).linkDirectionalParticleWidth(partW); majRubans();
  }

  // ---------- caméra cinématique ----------
  function cadrerTout(ms) { // vue en biais, en surplomb, qui contient toute la spirale
    const cœur = data.nodes.filter((n) => n.x !== undefined && (POIDS[n.sem] || 1) === 1); if (!cœur.length) return;
    const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; for (const n of cœur) ['x', 'y', 'z'].forEach((k, i) => { mn[i] = Math.min(mn[i], n[k]); mx[i] = Math.max(mx[i], n[k]); });
    const cx = (mn[0] + mx[0]) / 2, cy = (mn[1] + mx[1]) / 2 + 30, cz = (mn[2] + mx[2]) / 2;
    let rad = 0; for (const n of data.nodes) if (n.x !== undefined) rad = Math.max(rad, Math.hypot(n.x - cx, n.y - cy, n.z - cz) * ((POIDS[n.sem] || 1) < 1 ? .9 : 1));
    const cam = G.camera(), vh = cam.fov * Math.PI / 360, hf = Math.atan(Math.tan(vh) * innerWidth / innerHeight);
    const d = rad / Math.sin(Math.min(vh, hf)) * .82;
    if (!isFinite(d) || d < 150) return;
    const az = .6, el = .38; // azimut et élévation de la caméra
    G.cameraPosition({ x: cx + d * Math.cos(el) * Math.sin(az), y: cy + d * Math.sin(el), z: cz + d * Math.cos(el) * Math.cos(az) }, { x: cx, y: cy, z: cz }, ms); c.target.set(cx, cy, cz);
  }
  function voler(n) { // cadrer l'élément ET toutes ses dépendances, en gardant l'angle de vue
    const pts = [n]; const G0 = groupe(n);
    for (const l of data.links) { if (l.type === 'constellation') continue; const s = l.source.id ?? l.source, t = l.target.id ?? l.target; if (G0.has(s)) pts.push(byId.get(t)); if (G0.has(t)) pts.push(byId.get(s)); }
    let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; for (const p of pts) ['x', 'y', 'z'].forEach((k, i) => { mn[i] = Math.min(mn[i], p[k]); mx[i] = Math.max(mx[i], p[k]); });
    const ctrP = new THREE.Vector3((mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2);
    let rad = 40; for (const p of pts) rad = Math.max(rad, ctrP.distanceTo(new THREE.Vector3(p.x, p.y, p.z)) + 12);
    const cam = G.camera(), w = innerWidth, h = innerHeight, mobil = w < 720;
    const vh = (cam.fov * Math.PI / 180) / 2, hf = Math.atan(Math.tan(vh) * w / h);
    const uW = mobil ? 1 : Math.max(.5, (w - 390) / w), uH = mobil ? .42 : 1; // zone libre à côté du panneau
    const half = Math.min(Math.atan(Math.tan(vh) * uH), Math.atan(Math.tan(hf) * uW));
    const d = rad / Math.sin(half) * 1.02;
    // regarder depuis l'extérieur de la spirale (les autres constellations restent derrière), en gardant un peu l'angle actuel
    const gc = new THREE.Vector3(); let nb = 0; for (const x of data.nodes) if (x.x !== undefined) { gc.x += x.x; gc.y += x.y; gc.z += x.z; nb++; } gc.divideScalar(Math.max(1, nb));
    const ext = ctrP.clone().sub(gc); ext.y = 0; const dir = ext.lengthSq() > 1 ? ext.normalize().multiplyScalar(.75).add(cam.position.clone().sub(ctrP).normalize().multiplyScalar(.25)) : cam.position.clone().sub(ctrP).normalize();
    dir.y += .3; dir.normalize();
    const q = cam.quaternion; const right = new THREE.Vector3(1, 0, 0).applyQuaternion(q), up = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    // décaler la visée pour que le groupe tombe au centre de la zone libre
    const tgt = ctrP.clone(); if (mobil) tgt.addScaledVector(up, -(1 - uH) * d * Math.tan(vh)); else tgt.addScaledVector(right, (1 - uW) * d * Math.tan(hf));
    const p = tgt.clone().addScaledVector(dir, d);
    c.autoRotate = false; G.cameraPosition({ x: p.x, y: p.y, z: p.z }, { x: tgt.x, y: tgt.y, z: tgt.z }, 2600);
  }
  function choisir(n, fly) { if (!n) return; sel = n; panneau(); majSurbrillance(); if (fly) voler(n); }

  // ---------- panneau HUD ----------
  function panneau() {
    const pn = $('.cst-pn'); if (!sel) { pn.classList.remove('on'); return; }
    const n = sel, col = SEMC[n.sem] || '#7df9ff'; const nb = n.nb || {};
    const T = { semestre: 'Semestre', chapitre: 'Chapitre', notion: 'Notion' }[n.type];
    const cnt = cfg.compteurs ? cfg.compteurs(n) : n.type === 'semestre' ? [[nb.chap, 'chapitres'], [nb.notions, 'notions']] : [[nb.n1 ?? 0, 'questions N1'], [nb.n2 ?? 0, 'automatismes N2 · nombres variables'], [nb.n3 ?? 0, 'exercices N3']];
    const btns = cfg.boutons ? cfg.boutons(n) : [['Ouvrir le cours', () => allerA(n.cours)], ['Lancer les exercices', () => allerA(n.exos)]];
    const relChap = (c) => { // liens des notions du chapitre vers d'autres chapitres, regroupés
      const G0 = groupe(c); const av = [], ap = [];
      for (const l of data.links) { if (l.type === 'constellation' || l.type === 'hierarchie') continue; const s = byId.get(l.source.id ?? l.source), t = byId.get(l.target.id ?? l.target);
        if (G0.has(t.id) && !G0.has(s.id)) av.push([s, t, l]); else if (G0.has(s.id) && !G0.has(t.id)) ap.push([t, s, l]); }
      const bloc = (L, titre, fl) => { if (!L.length) return ''; L.sort((a, b) => (a[0].chap || '').localeCompare(b[0].chap || '') || (a[2].type === 'outil') - (b[2].type === 'outil'));
        return `<h4>${titre} <span style="opacity:.6">(${L.length})</span></h4>` + L.map(([o, mine, l]) => `<button data-go="${esc(o.id)}">${l.type === 'outil' ? '<span class="cst-o">outil</span> ' : ''}${esc(o.label)} <span style="opacity:.55">· ${esc((o.chapLabel || '').slice(0, 2))}</span><em>${fl} ${esc(mine.label)} — ${esc(l.why || '')}</em></button>`).join(''); };
      return bloc(av, "S'appuie sur", 'pour') + bloc(ap, 'Sert pour', 'depuis'); };
    const rel = (arr, side, titre) => { const L = (arr || []).filter((l) => l.type !== 'hierarchie').sort((a, b) => (a.type === 'outil') - (b.type === 'outil')); if (!L.length) return ''; return `<h4>${titre}</h4>` + L.map((l) => { const o = byId.get(side === 's' ? (l.source.id ?? l.source) : (l.target.id ?? l.target)); return `<button data-go="${esc(o.id)}">${l.type === 'outil' ? '<span class="cst-o">outil</span> ' : ''}${esc(o.label)}<em>${esc(l.why || '')}${l.fiches ? ' · vu dans ' + l.fiches + ' corrigé' + (l.fiches > 1 ? 's' : '') + " de l'atelier" : l.preuve ? ' · repéré dans ' + l.preuve + ' passages du site' : ''}</em></button>`; }).join(''); };
    const kids = (out.get(n.id) || []).filter((l) => l.type === 'hierarchie' && l.niveau !== 'semestre').map((l) => byId.get(l.target.id ?? l.target));
    pn.innerHTML = `<button class="px" aria-label="Fermer le panneau">✕</button><span class="cst-badge" style="color:${col}">${esc(n.semLabel || n.sem)}</span><span class="cst-type">${T}</span>
      <h3>${esc(n.label)}</h3><div class="sub">${esc(n.type === 'notion' ? n.chapLabel : n.type === 'semestre' ? n.sub : (nb.notions || 0) + ' notions')}</div>
      <div class="cst-cnt" style="grid-template-columns:repeat(${cnt.length},1fr)">${cnt.map(([v, t]) => `<div><b>${v ?? 0}</b><span>${t}</span></div>`).join('')}</div>
      <div class="cst-act">${btns.map(([t], i) => `<button class="cst-btn${i ? ' b2' : ''}" data-b="${i}"${i ? '' : ` style="--c:${col}"`}>${esc(t)}</button>`).join('')}</div>
      <div class="cst-rel">${n.type === 'chapitre' ? relChap(n) : rel(inc.get(n.id), 's', "S'appuie sur") + rel(out.get(n.id), 't', 'Sert pour')}${kids.length ? '<h4>' + (n.type === 'semestre' ? 'Chapitres' : 'Notions') + '</h4>' + kids.map((o) => `<button data-go="${esc(o.id)}">${esc(o.label)}</button>`).join('') : ''}</div>`;
    pn.classList.add('on');
    pn.querySelector('.px').onclick = () => { sel = null; panneau(); majSurbrillance(); };
    pn.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => choisir(byId.get(b.dataset.go), true));
    pn.querySelectorAll('[data-b]').forEach((b) => b.onclick = () => { const f = btns[+b.dataset.b][1]; if (cfg.boutons) { hide(); f(n); } else f(); });
  }
  function allerA(h) { hide(); try { history.pushState(null, '', h); } catch (e) { location.hash = h; } if (typeof window.route === 'function') window.route(); scrollTo(0, 0); }

  // ---------- recherche avec autocomplétion ----------
  const inp = $('.cst-q input'), ac = $('.cst-ac'); let items = [], cur = 0;
  const idx = data.nodes.map((n) => ({ n, k: norm(n.label + ' ' + (n.chapLabel || '') + ' ' + (n.sub || '')) }));
  function propose() {
    const q = norm(inp.value.trim()); if (!q) { ac.classList.remove('on'); return; }
    const w = q.split(/\s+/); items = idx.filter((x) => w.every((m) => x.k.includes(m))).sort((a, b) => (a.k.startsWith(q) ? -1 : 0) - (b.k.startsWith(q) ? -1 : 0) || { chapitre: 0, notion: 1, semestre: 2 }[a.n.type] - { chapitre: 0, notion: 1, semestre: 2 }[b.n.type]).slice(0, 8).map((x) => x.n);
    cur = 0; ac.innerHTML = items.length ? items.map((n, i) => `<li role="option" data-i="${i}" class="${i === 0 ? 'sel' : ''}"><i style="color:${SEMC[n.sem]}"></i>${esc(n.label)}<small>${n.type === 'notion' ? esc(n.chapLabel.slice(0, 2)) : n.type}</small></li>`).join('') : '<li style="opacity:.6">Aucun résultat</li>';
    ac.classList.add('on'); ac.querySelectorAll('[data-i]').forEach((li) => li.onmousedown = (e) => { e.preventDefault(); valider(+li.dataset.i); });
  }
  function valider(i) { const n = items[i]; if (!n) return; ac.classList.remove('on'); inp.value = n.label; inp.blur(); choisir(n, true); }
  inp.addEventListener('input', propose); inp.addEventListener('focus', propose); inp.addEventListener('blur', () => setTimeout(() => ac.classList.remove('on'), 120));
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!items.length) return; cur = (cur + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; ac.querySelectorAll('[data-i]').forEach((li) => li.classList.toggle('sel', +li.dataset.i === cur)); }
    else if (e.key === 'Enter') { e.preventDefault(); valider(cur); }
  });
  root.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (ac.classList.contains('on')) ac.classList.remove('on'); else if (sel) { sel = null; panneau(); majSurbrillance(); } else hide(); } });
  function appliquerStyle(k) {
    style = STYLES.some((x) => x[0] === k) ? k : 'neon'; try { localStorage.setItem('cst_style', style); } catch (e) { }
    const S = { // fond, halo (bloom), lumière propre des planètes, atmosphère, étoiles, nébuleuses, grille, fil de fer, palette des liens
      neon: { bg: '#050811', bl: [.8, .35, .45], em: [.3, .45], atm: true, st: true, neb: false, gr: false, fil: false, pal: ['125,249,255', '255,190,120'] },
      nebuleuse: { bg: '#07050f', bl: [.5, .55, .55], em: [.16, .26], atm: true, st: true, neb: true, gr: false, fil: false, pal: ['190,170,255', '255,170,200'] },
      holo: { bg: '#010b12', bl: [.55, .3, .35], em: [.45, .5], lu: [1.2, .3], atm: true, st: false, neb: false, gr: true, fil: true, pal: ['103,232,249', '94,234,212'] },
      papier: { bg: '#fbf8f1', bl: null, em: [.12, .18], lu: [2.8, 1.6], atm: false, st: false, neb: false, gr: false, fil: false, pal: ['30,80,150', '180,95,20'] },
      sobre: { bg: '#0b1020', bl: null, em: [.15, .25], atm: false, st: true, neb: false, gr: false, fil: false, pal: ['148,180,230', '220,180,140'] },
    }[style];
    const lu = S.lu || [2.1, .5]; soleil.intensity = lu[0]; ambiante.intensity = lu[1];
    G.backgroundColor(S.bg); root.style.background = S.bg; root.classList.toggle('clair', style === 'papier'); root.classList.toggle('holo', style === 'holo');
    bloom.enabled = !!S.bl; if (S.bl) { bloom.strength = S.bl[0] * (mob ? .85 : 1); bloom.radius = S.bl[1]; bloom.threshold = S.bl[2]; }
    for (const n of planetes) { const m = n.__core.material; m.wireframe = S.fil; m.emissiveIntensity = n.type === 'chapitre' ? S.em[0] : S.em[1];
      if (S.fil) { m.emissive = new THREE.Color('#22d3ee'); m.color = new THREE.Color('#0e7490'); } else { m.emissive = new THREE.Color(SEMC[n.sem]); m.color = new THREE.Color('#ffffff'); }
      m.needsUpdate = true; if (n.__atm) n.__atm.visible = S.atm; }
    etoiles.forEach((o) => { o.visible = S.st; }); nebuleuses.forEach((o) => { o.visible = S.neb; }); grille.visible = S.gr;
    PAL = { pre: S.pal[0], out: S.pal[1] }; majSurbrillance();
    root.querySelectorAll('[data-sty]').forEach((b) => b.classList.toggle('on', b.dataset.sty === style));
  }
  root.querySelectorAll('[data-sty]').forEach((b) => b.onclick = () => appliquerStyle(b.dataset.sty));
  appliquerStyle((() => { try { return localStorage.getItem('cst_style') || 'nebuleuse'; } catch (e) { return 'nebuleuse'; } })()); // ambiance par défaut : Nébuleuse
  root.tabIndex = -1; root.focus({ preventScroll: true });

  // ---------- taille ----------
  const fit = () => { G.width(innerWidth).height(innerHeight); bloom.setSize(innerWidth, innerHeight); rubans.forEach((m) => m.resolution.set(innerWidth, innerHeight)); };
  addEventListener('resize', fit); fit();
  setTimeout(() => $('.cst-load').classList.add('off'), 250);
  const essaiCadre = () => { if (fitDone || sel) return; if (document.visibilityState !== 'visible' || !root.clientWidth) { setTimeout(essaiCadre, 500); return; } fitDone = true; cadrerTout(1600); };
  setTimeout(essaiCadre, 2600);
  return { show };
}
