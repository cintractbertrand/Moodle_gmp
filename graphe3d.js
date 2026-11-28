/* Constellation 3D des notions du site Maths GMP.
   Module autonome : import('./graphe3d.js').then(m => m.ouvrir()).
   Données : graphe.json (généré par outils/graphe_json.py). Bibliothèques chargées à la demande (esm.sh). */
const V3 = '0.187.0';
const LIBS = () => Promise.all([
  import(`https://esm.sh/3d-force-graph@1.80.3?deps=three@${V3}`),
  import(`https://esm.sh/three@${V3}`),
  import(`https://esm.sh/three@${V3}/examples/jsm/postprocessing/UnrealBloomPass.js`),
  import(`https://esm.sh/three-spritetext@1.10.0?deps=three@${V3}`)
]);
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

export async function ouvrir() {
  if (ui) { ui.show(); return; }
  ui = await construire();
}

async function construire() {
  if (!document.getElementById('cst-css')) { const st = document.createElement('style'); st.id = 'cst-css'; st.textContent = CSS; document.head.appendChild(st); }
  const root = document.createElement('div'); root.className = 'cst'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Constellation des notions');
  root.innerHTML = `<div class="cst-stage"></div>
  <div class="cst-load">Allumage des étoiles…</div>
  <div class="cst-top glass"><h2>✦ Constellation</h2><div class="cst-q"><input type="search" placeholder="Rechercher une notion, un chapitre…" aria-label="Rechercher" autocomplete="off"><ul class="cst-ac glass" role="listbox"></ul></div><button class="cst-x" title="Revenir au site (Échap)" aria-label="Fermer">✕</button></div>
  <div class="cst-leg glass">${Object.entries(SEMC).map(([s, c]) => `<span style="color:${c}"><i></i><span style="color:#e6f1ff">${s}</span></span>`).join('')}<span><b></b>prérequis</span><span><b style="background:#ffbe78;box-shadow:0 0 6px #ffbe78"></b>outil commun</span></div>
  <div class="cst-hint">Glisser : tourner · molette / pincer : zoom · clic : explorer</div>
  <aside class="cst-pn glass" aria-live="polite"></aside>`;
  document.body.appendChild(root);
  const $ = (s) => root.querySelector(s);
  let G = null, hov = null, sel = null; const hiN = new Set(), hiL = new Set(); const prevOverflow = document.body.style.overflow;
  const show = () => { root.style.display = ''; document.body.style.overflow = 'hidden'; requestAnimationFrame(() => root.classList.add('on')); if (G) { G.resumeAnimation(); ctr().autoRotate = !sel; } };
  const hide = () => { root.classList.remove('on'); document.body.style.overflow = prevOverflow; setTimeout(() => { if (!root.classList.contains('on')) { root.style.display = 'none'; G && G.pauseAnimation(); } }, 450); };
  show();
  $('.cst-x').onclick = hide;

  let data, libs;
  try { [data, libs] = await Promise.all([fetch('graphe.json?v=2').then((r) => r.json()), LIBS()]); }
  catch (e) { $('.cst-load').textContent = 'Connexion nécessaire pour la vue 3D.'; return { show }; }
  const [{ default: ForceGraph3D }, THREE, { UnrealBloomPass }, { default: SpriteText }] = libs;

  // ---------- données ----------
  const byId = new Map(data.nodes.map((n) => [n.id, n]));
  const out = new Map(), inc = new Map();
  for (const l of data.links) { (out.get(l.source) || out.set(l.source, []).get(l.source)).push(l); (inc.get(l.target) || inc.set(l.target, []).get(l.target)).push(l); }
  // chaque semestre = une constellation, à distance des autres (parcours en arc S1 -> S6)
  const ANC = { S1: [-400, 30, 0], S2: [-150, -60, 130], S3: [110, 50, -70], S4: [330, -50, 110], S6: [480, 80, -60] };
  const ancre = (k) => { let ns = []; const f = (al) => { for (const n of ns) { const a = ANC[n.sem]; if (!a) continue; const kk = (n.type === 'chapitre' ? k : k * .45) * al; n.vx += (a[0] - n.x) * kk; n.vy += (a[1] - n.y) * kk; n.vz += (a[2] - n.z) * kk; } }; f.initialize = (x) => { ns = x; }; return f; };
  const R = { semestre: 9, chapitre: 5.2, notion: 2.3 };

  // ---------- scène ----------
  const mob = mobile();
  G = ForceGraph3D({ controlType: 'orbit', rendererConfig: { antialias: !mob, alpha: false, powerPreference: 'high-performance' } })($('.cst-stage'))
    .backgroundColor(BG).showNavInfo(false)
    .graphData(data)
    .nodeId('id').nodeVal((n) => R[n.type] ** 2 / 4)
    .nodeLabel((n) => `<b>${esc(n.label)}</b>${n.type === 'notion' ? '<br><span style="opacity:.7">' + esc(n.chapLabel) + '</span>' : n.type === 'semestre' ? '<br><span style="opacity:.7">' + esc(n.sub) + '</span>' : ''}`)
    .nodeThreeObject(nodeObj).nodeThreeObjectExtend(false)
    .linkCurvature((l) => l.type === 'hierarchie' ? 0 : .25).linkCurveRotation((l) => l.type === 'hierarchie' ? 0 : (l.why || '').length % 6)
    .linkOpacity(1).linkResolution(mob ? 4 : 6)
    .linkColor(linkColor).linkWidth(linkWidth)
    .linkDirectionalParticles(partN).linkDirectionalParticleSpeed(partV).linkDirectionalParticleWidth(partW).linkDirectionalParticleColor((l) => l.type === 'outil' ? '#ffbe78' : PRE).linkDirectionalParticleResolution(6)
    .linkDirectionalArrowLength((l) => l.type === 'prerequis' ? 2.4 : 0).linkDirectionalArrowRelPos(.92).linkDirectionalArrowColor(() => 'rgba(125,249,255,.75)')
    .enableNodeDrag(false).warmupTicks(120).cooldownTicks(160)
    .onNodeHover((n) => { hov = n || null; $('.cst-stage').style.cursor = n ? 'pointer' : ''; majSurbrillance(); })
    .onNodeClick((n) => choisir(n, true))
    .onBackgroundClick(() => { if (sel) { sel = null; panneau(); majSurbrillance(); } });
  const ctr = () => G.controls();
  G.d3Force('charge').strength((n) => n.type === 'notion' ? -30 : -130);
  G.d3Force('link').distance((l) => l.type === 'hierarchie' ? 18 : 120).strength((l) => l.type === 'hierarchie' ? .9 : l.type === 'prerequis' ? .012 : .006);
  G.d3Force('ancre', ancre(.05));
  G.renderer().setPixelRatio(Math.min(devicePixelRatio || 1, mob ? 1.5 : 2));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), mob ? 1.35 : 1.65, .5, .42);
  G.postProcessingComposer().addPass(bloom);
  G.renderer().outputColorSpace = THREE.LinearSRGBColorSpace; // évite le double encodage sRGB du composer (fond gris)
  const portrait = innerHeight > innerWidth; G.cameraPosition({ x: 0, y: portrait ? 260 : 140, z: Math.max(640, Math.min(1500, 400 / (.364 * innerWidth / innerHeight))) });
  const c = ctr(); c.autoRotate = true; c.autoRotateSpeed = .55; c.enableDamping = true; c.dampingFactor = .08; c.minDistance = 25; c.maxDistance = 1400;
  c.addEventListener('start', () => { c.autoRotate = false; });

  // champ d'étoiles + poussière lumineuse
  { const mk = (n, rMin, rMax, size, col, op) => { const p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const v = new THREE.Vector3().randomDirection().multiplyScalar(rMin + Math.random() * (rMax - rMin)); p.set([v.x, v.y * .7, v.z], i * 3); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); return new THREE.Points(g, new THREE.PointsMaterial({ color: col, size, sizeAttenuation: true, transparent: true, opacity: op, depthWrite: false })); };
    G.scene().add(mk(mob ? 900 : 1800, 700, 2200, 2.2, 0x9fb6ff, .55)); G.scene().add(mk(mob ? 160 : 320, 60, 330, 1.1, 0x7df9ff, .35)); }

  // ---------- objets 3D des nœuds ----------
  const geo = { s: new THREE.SphereGeometry(1, 28, 20), r: new THREE.TorusGeometry(1, .018, 8, 96) };
  const rings = [];
  function nodeObj(n) {
    const col = new THREE.Color(SEMC[n.sem] || '#ffffff'); const g = new THREE.Group(); const r = R[n.type];
    const core = new THREE.Mesh(geo.s, new THREE.MeshBasicMaterial({ color: n.type === 'notion' ? col.clone().lerp(new THREE.Color('#ffffff'), .35) : col, transparent: true }));
    core.scale.setScalar(r); g.add(core); n.__mats = [core.material];
    if (n.type === 'chapitre') { // noyau atomique : orbites électroniques
      for (let k = 0; k < 2; k++) { const ring = new THREE.Mesh(geo.r, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .55 })); ring.scale.setScalar(r * 2.4 + k * 3); ring.rotation.set(Math.PI / 2 + k * 1.05, k * .7, 0); g.add(ring); n.__mats.push(ring.material);
        const el = new THREE.Mesh(geo.s, new THREE.MeshBasicMaterial({ color: '#ffffff' })); el.scale.setScalar(1.1); ring.add(el); el.position.set(1, 0, 0); el.scale.setScalar(1.1 / (r * 2.4 + k * 3)); rings.push({ ring, sp: .6 + k * .35 }); }
    }
    if (n.type === 'chapitre') {
      const t = new SpriteText(n.label, 7.5, 'rgba(178,198,232,.9)'); t.fontWeight = '600'; t.fontFace = 'system-ui, Segoe UI, sans-serif'; t.material.depthWrite = false; t.position.y = r + 12; g.add(t); n.__mats.push(t.material);
    }
    if (n.type === 'notion') { // intitulé affiché seulement quand la notion est liée à l'élément choisi
      const txt = n.label.length > 42 ? n.label.slice(0, 40) + '…' : n.label;
      const t = new SpriteText(txt, 3.6, 'rgba(200,215,240,.95)'); t.fontFace = 'system-ui, Segoe UI, sans-serif'; t.backgroundColor = 'rgba(5,8,17,.6)'; t.padding = [1.6, .8]; t.borderRadius = 1.5;
      t.material.depthWrite = false; t.material.depthTest = false; t.renderOrder = 10; t.position.y = r + 5; t.visible = false; g.add(t); n.__lab = t;
    }
    n.__base = n.__mats.map((m) => m.opacity ?? 1); return g;
  }
  // animation légère : électrons, halos, respiration de la sélection
  let t0 = performance.now(); let fpsN = 0, fpsT = performance.now() + 4000, allege = false; // mesure après le démarrage
  (function anim() {
    requestAnimationFrame(anim); if (!root.classList.contains('on')) return;
    const t = (performance.now() - t0) / 1000;
    for (const { ring, sp } of rings) ring.rotation.z = t * sp;
    for (const n of data.nodes) if (n.__halo) { n.__halo.lookAt(G.camera().position); n.__halo.scale.setScalar(R.chapitre * (1.9 + .12 * Math.sin(t * 2 + n.id.length))); }
    if (sel && sel.__threeObj) sel.__threeObj.scale.setScalar(1 + .12 * Math.sin(t * 4));
    fpsN++; const now = performance.now(); if (now < fpsT) fpsN = 0; else if (now - fpsT > 2000) { const fps = fpsN * 1000 / (now - fpsT); fpsN = 0; fpsT = now; if (fps < 40 && !allege) { allege = true; G.renderer().setPixelRatio(1); bloom.strength *= .85; } }
  })();

  // ---------- surbrillance ----------
  function voisinage(n) { hiN.clear(); hiL.clear(); if (!n) return; hiN.add(n);
    for (const l of data.links) { const s = l.source.id ?? l.source, t = l.target.id ?? l.target; if (s === n.id || t === n.id) { hiL.add(l); hiN.add(byId.get(s)); hiN.add(byId.get(t)); } } }
  function linkColor(l) { const on = hiL.has(l), any = hiN.size > 0;
    if (l.type === 'prerequis') return on ? 'rgba(125,249,255,.5)' : any ? 'rgba(125,249,255,.06)' : 'rgba(125,249,255,.3)';
    if (l.type === 'outil') return on ? 'rgba(255,190,120,.45)' : any ? 'rgba(255,190,120,.05)' : 'rgba(255,190,120,.22)';
    const c = SEMC[(l.source.sem || byId.get(l.source)?.sem)] || '#8fa8ff'; if (l.niveau === 'semestre') return any ? 'rgba(255,255,255,.04)' : 'rgba(220,230,255,.16)'; return on ? c : any ? 'rgba(120,140,190,.05)' : hexA(c, .22); }
  function linkWidth(l) { return hiL.has(l) ? (l.type === 'hierarchie' ? .5 : .65) : (l.type === 'prerequis' ? .45 : l.type === 'outil' ? .35 : .25); }
  function partN(l) { return l.type === 'hierarchie' ? 0 : hiL.has(l) ? (l.type === 'prerequis' ? 3 : 2) : hiN.size ? 0 : (l.type === 'prerequis' ? 1 : 0); }
  function partV(l) { return hiL.has(l) ? .011 : .0045; }
  function partW(l) { return hiL.has(l) ? 1.5 : 1.1; }
  function hexA(h, a) { const c = new THREE.Color(h); return `rgba(${c.r * 255 | 0},${c.g * 255 | 0},${c.b * 255 | 0},${a})`; }
  function majSurbrillance() {
    voisinage(hov || sel); const any = hiN.size > 0;
    for (const n of data.nodes) if (n.__lab) n.__lab.visible = any && hiN.has(n);
    for (const n of data.nodes) if (n.__mats) n.__mats.forEach((m, i) => { m.opacity = !any || hiN.has(n) ? n.__base[i] : n.__base[i] * .12; });
    G.linkColor(linkColor).linkWidth(linkWidth).linkDirectionalParticles(partN).linkDirectionalParticleSpeed(partV).linkDirectionalParticleWidth(partW);
  }

  // ---------- caméra cinématique ----------
  function voler(n) {
    const d = n.type === 'notion' ? 170 : 240; const cp = G.camera().position; // garder l'angle de vue actuel
    let dx = cp.x - n.x, dy = cp.y - n.y, dz = cp.z - n.z; const L = Math.hypot(dx, dy, dz) || 1; dx /= L; dy /= L; dz /= L;
    const p = { x: n.x + dx * d, y: n.y + dy * d, z: n.z + dz * d };
    c.autoRotate = false; G.cameraPosition(p, { x: n.x, y: n.y, z: n.z }, 1700);
  }
  function choisir(n, fly) { if (!n) return; sel = n; panneau(); majSurbrillance(); if (fly) voler(n); }

  // ---------- panneau HUD ----------
  function panneau() {
    const pn = $('.cst-pn'); if (!sel) { pn.classList.remove('on'); return; }
    const n = sel, col = SEMC[n.sem] || '#7df9ff'; const nb = n.nb || {};
    const T = { semestre: 'Semestre', chapitre: 'Chapitre', notion: 'Notion' }[n.type];
    const cnt = n.type === 'semestre' ? [[nb.chap, 'chapitres'], [nb.notions, 'notions']] : [[nb.n1 ?? 0, 'questions N1'], [nb.n2 ?? 0, 'automatismes N2 · nombres variables'], [nb.n3 ?? 0, 'exercices N3']];
    const rel = (arr, side, titre) => { const L = (arr || []).filter((l) => l.type !== 'hierarchie').sort((a, b) => (a.type === 'outil') - (b.type === 'outil')); if (!L.length) return ''; return `<h4>${titre}</h4>` + L.map((l) => { const o = byId.get(side === 's' ? (l.source.id ?? l.source) : (l.target.id ?? l.target)); return `<button data-go="${esc(o.id)}">${l.type === 'outil' ? '<span class="cst-o">outil</span> ' : ''}${esc(o.label)}<em>${esc(l.why || '')}${l.preuve ? ' · repéré dans ' + l.preuve + ' passages du site' : ''}</em></button>`; }).join(''); };
    const kids = (out.get(n.id) || []).filter((l) => l.type === 'hierarchie' && l.niveau !== 'semestre').map((l) => byId.get(l.target.id ?? l.target));
    pn.innerHTML = `<button class="px" aria-label="Fermer le panneau">✕</button><span class="cst-badge" style="color:${col}">${esc(n.semLabel || n.sem)}</span><span class="cst-type">${T}</span>
      <h3>${esc(n.label)}</h3><div class="sub">${esc(n.type === 'notion' ? n.chapLabel : n.type === 'semestre' ? n.sub : (nb.notions || 0) + ' notions')}</div>
      <div class="cst-cnt" style="grid-template-columns:repeat(${cnt.length},1fr)">${cnt.map(([v, t]) => `<div><b>${v ?? 0}</b><span>${t}</span></div>`).join('')}</div>
      <div class="cst-act"><button class="cst-btn" data-h="${esc(n.cours)}" style="--c:${col}">Ouvrir le cours</button><button class="cst-btn b2" data-h="${esc(n.exos)}">Lancer les exercices</button></div>
      <div class="cst-rel">${rel(inc.get(n.id), 's', "S'appuie sur")}${rel(out.get(n.id), 't', 'Sert pour')}${kids.length ? '<h4>' + (n.type === 'semestre' ? 'Chapitres' : 'Notions') + '</h4>' + kids.map((o) => `<button data-go="${esc(o.id)}">${esc(o.label)}</button>`).join('') : ''}</div>`;
    pn.classList.add('on');
    pn.querySelector('.px').onclick = () => { sel = null; panneau(); majSurbrillance(); };
    pn.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => choisir(byId.get(b.dataset.go), true));
    pn.querySelectorAll('[data-h]').forEach((b) => b.onclick = () => allerA(b.dataset.h));
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
  root.tabIndex = -1; root.focus({ preventScroll: true });

  // ---------- taille ----------
  const fit = () => { G.width(innerWidth).height(innerHeight); bloom.setSize(innerWidth, innerHeight); };
  addEventListener('resize', fit); fit();
  setTimeout(() => $('.cst-load').classList.add('off'), 250);
  return { show };
}
