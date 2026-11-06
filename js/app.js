/* ==========================================================================
   PASSION — "Try the Look"  ·  app.js  (updated)
   Vanilla JS, zero dependencies.

   - Original runway / carousel / pins / shadow / panel logic kept intact
   - Added: view switching (Home / Products / About / Contact)
   - Added: real Cart drawer
   - Added: Products grid + Product detail page
   ========================================================================== */
(() => {
  'use strict';

  /* ======================================================================
     A. CONFIG + HELPERS
     ====================================================================== */
  const CFG = Object.assign({
    brand: 'Passion', locale: 'en-US', currency: 'USD',
    bundleDiscount: 0.10, autoplay: true, autoplayDelay: 5600,
    panelOpensWithLook: true, stageStyle: 'soft', spacing: 1,
  }, window.PASSION_CONFIG || {});

  const LOOKS = Array.isArray(window.PASSION_LOOKS) ? window.PASSION_LOOKS : [];
  const N = LOOKS.length;
  if (!N) { console.warn('[Passion] PASSION_LOOKS is empty — nothing to render.'); return; }

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const RM = REDUCED ? 3 : 1;

  const $ = (id) => document.getElementById(id);
  const runway = $('runway'), stage = $('stage'), looksEl = $('looks'), indexEl = $('index');
  const closeBtn = $('closeBtn'), prevBtn = $('prevBtn'), nextBtn = $('nextBtn'), pauseBtn = $('pauseBtn');
  const panel = $('panel'), panelList = $('panelList'), panelCount = $('panelCount');
  const bundleNote = $('bundleNote'), bundleWas = $('bundleWas'), bundleNow = $('bundleNow');
  const addLookBtn = $('addLookBtn'), toastEl = $('toast'), cartCount = $('cartCount'), cartBtn = $('cartBtn');
  const lookNo = $('lookNo'), lookName = $('lookName'), cursorEl = $('cursor');
  const nav = $('nav'), burger = $('burger'), helperEl = $('pinhelper');
  const PIN_HELPER = /[?&]pinhelper/.test(location.search);

  // New elements
  const productsPage = $('productsPage');
  const productDetail = $('productDetail');
  const aboutPage = $('aboutPage');
  const contactPage = $('contactPage');
  const productsGrid = $('productsGrid');
  const cartDrawer = $('cartDrawer');
  const cartOverlay = $('cartOverlay');
  const cartList = $('cartList');
  const cartTotal = $('cartTotal');
  const closeCartBtn = $('closeCart');
  const checkoutBtn = $('checkoutBtn');
  const backToProducts = $('backToProducts');
  const detailImg = $('detailImg');
  const detailName = $('detailName');
  const detailPrice = $('detailPrice');
  const detailDesc = $('detailDesc');
  const detailAddBtn = $('detailAddBtn');
  const orderNowBtn = $('orderNowBtn');
  const sizeRow = $('sizeRow');
  const colorRow = $('colorRow');
  const profileBtn = $('profileBtn');

  runway.dataset.stage = CFG.stageStyle;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (cur, tgt, rate, dt) => cur + (tgt - cur) * (1 - Math.exp(-rate * dt));
  const mod = (i) => ((i % N) + N) % N;
  const pad2 = (n) => String(n).padStart(2, '0');
  const wrapD = (d) => { d = mod(d); return d > N / 2 ? d - N : d; };
  const fmt = new Intl.NumberFormat(CFG.locale, { style: 'currency', currency: CFG.currency });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---- Depth profile ---- */
  const depthScale   = (a) => a <= 1 ? 1 - 0.13 * a : Math.max(0.5, 0.87 - 0.10 * (a - 1));
  const depthBlur    = (a) => a <= 1 ? a * 0.7 : 0.7 + (a - 1) * 4.6;
  const depthOpacity = (a) => a <= 1 ? 1 - 0.08 * a : a <= 2 ? 0.92 - 0.40 * (a - 1) : Math.max(0, 0.52 * (1 - (a - 2) / 0.62));

  /* ---- Mutable state ---- */
  const S = {
    pos: 0, target: 0, vel: 0,
    focus: 0, focusTarget: 0, active: 0,
    fcx: 0, fFloor: 0, fH: 0,
    intro: REDUCED ? 1 : 0, introOn: false,
    hover: 0, hoverTarget: 0,
    chip: 0, chipTarget: 0, cx: -200, cy: -200, mx: -200, my: -200,
    dragging: false, justDragged: false, pd: null,
    wheelActive: false, wheelBase: 0, wheelAcc: 0, wheelLock: 0, wheelT: 0,
    playing: CFG.autoplay && !REDUCED, userPaused: false, progress: 0,
    panelOpen: false, bag: [],           // ← now an array of items
    cur: -1, last: 0, busy: false,
    W: 0, Hs: 0, mobile: false, floorY: 0, Hc: 0, S1: 0, S2: 0, sheetH: 0,
    geoReady: false, lastFocusEl: null,
    currentView: 'runway',
    currentProduct: null,
    selectedSize: 'S',
    selectedColor: 'Black',
  };
  let raf = 0;

  /* ======================================================================
     B. DOM BUILD (runway)
     ====================================================================== */
  const items = LOOKS.map((look, i) => {
    const el = document.createElement('article');
    el.className = 'look';
    el.setAttribute('role', 'group');
    el.setAttribute('aria-roledescription', 'slide');
    el.setAttribute('aria-label', `Look ${i + 1} of ${N}: ${look.title}`);

    const pins = (look.products || []).map((p, k) => p.pin
      ? `<button class="pin" type="button" tabindex="-1" data-k="\( {k}" data-n=" \){k + 1}" style="left:\( {p.pin.x}%;top: \){p.pin.y}%;--i:${k}" aria-label="Pin ${k + 1}: ${esc(p.name)}"></button>`
      : '').join('');

    el.innerHTML =
      `<div class="shadow" style="--feet:${Number(look.feetOffset) || 0}"><i class="sh sh--ambient"></i><i class="sh sh--core"></i><i class="sh sh--contact"></i></div>` +
      `<img class="look__img" alt="${esc(look.alt || look.title)}" draggable="false" decoding="async">` +
      `<button class="look__hit" type="button" data-i="\( {i}" aria-label=" \){esc(look.title)} — see what's in this look"></button>` +
      `<div class="pins">${pins}</div>`;

    const img = el.querySelector('.look__img');
    const it = { el, img, shadow: el.querySelector('.shadow'), hit: el.querySelector('.look__hit'), aspect: 0.4, w: 0, look };
    img.addEventListener('load', () => { if (img.naturalWidth) { it.aspect = img.naturalWidth / img.naturalHeight; sizeItems(); kick(); } });
    img.addEventListener('error', () => console.warn(`[Passion] Could not load model image: ${look.model}`));
    img.src = look.model;
    looksEl.appendChild(el);
    return it;
  });

  // Bottom index (01 The City Edit ▬▬▬ 02 03 …)
const idxBtns = LOOKS.map((look, i) => {
  const li = document.createElement('li');
  const title = look.title || `Look ${i + 1}`;
  li.innerHTML = `
    <button class="idx" type="button" data-i="${i}" aria-label="Go to look ${i + 1}: ${esc(title)}">
      <span class="idx__bar"><i></i></span>
      <span class="idx__label"><b>\( {pad2(i + 1)}</b><em> \){esc(title)}</em></span>
    </button>`;
  indexEl.appendChild(li);
  return li.firstElementChild;
});
const idxFills = idxBtns.map((b) => b.querySelector('.idx__bar i'));

  /* ======================================================================
     C. MEASURING / GEOMETRY
     ====================================================================== */
function measure() {
  const r = stage.getBoundingClientRect();
  S.W = r.width;
  S.Hs = r.height;
  S.mobile = window.innerWidth <= 760;
  S.sheetH = S.mobile ? Math.min(window.innerHeight * 0.46, 400) : 0;

  // Floor line (where the feet stand)
  S.floorY = S.Hs - (S.mobile ? 100 : 110);

  // Model height – bigger on desktop
  if (S.mobile) {
    S.Hc = clamp(S.floorY - 160, 260, 520);
  } else {
    S.Hc = clamp(S.floorY * 0.82, 380, 720);   // ← bigger models on desktop
  }

  const sp = CFG.spacing || 1;
  S.S1 = S.mobile ? S.W * 0.48 * sp : S.Hc * 0.52 * sp;
  S.S2 = S.mobile ? S.W * 0.16 * sp : S.Hc * 0.22 * sp;

  runway.style.setProperty('--floor-y', S.floorY + 'px');
  sizeItems();

  if (!S.geoReady) {
    const g = focusGeo();
    S.fcx = g.cx;
    S.fFloor = g.floor;
    S.fH = g.h;
    S.geoReady = true;
  }
}
  function sizeItems() {
    items.forEach((it) => { it.w = S.Hc * it.aspect; it.el.style.width = it.w + 'px'; it.el.style.height = S.Hc + 'px'; });
  }
  function focusGeo() {
    const panelW = S.mobile ? 0 : Math.min(420, window.innerWidth);
    const cx = (!S.mobile && S.panelOpen) ? (S.W - panelW) / 2 : S.W / 2;
    const floor = (S.mobile && S.panelOpen) ? S.Hs - S.sheetH - 16 : S.floorY;
    const h = clamp(floor - (S.mobile ? 84 : 124), 180, 780);
    return { cx, floor, h };
  }

  /* ======================================================================
     D. FRAME LOOP
     ====================================================================== */
  function kick() { if (!raf) { S.last = performance.now(); raf = requestAnimationFrame(frame); } }

  function frame(t) {
    raf = 0;
    const dt = clamp((t - S.last) / 1000 || 0.016, 0.001, 0.05);
    S.last = t;
    step(dt);
    if (S.busy) raf = requestAnimationFrame(frame);
  }

  function step(dt) {
    let busy = false;

    const rate = (S.dragging ? 22 : S.wheelActive ? 11 : 4.8) * RM;
    const prev = S.pos;
    S.pos = damp(S.pos, S.target, rate, dt);
    if (Math.abs(S.target - S.pos) < 0.0004) S.pos = S.target;
    S.vel = damp(S.vel, (S.pos - prev) / dt, 15, dt);
    if (Math.abs(S.vel) < 0.003) S.vel = 0;
    const moving = S.pos !== S.target || S.vel !== 0;

    const fPrev = S.focus;
    S.focus = damp(S.focus, S.focusTarget, 4.4 * RM, dt);
    if (Math.abs(S.focusTarget - S.focus) < 0.0006) S.focus = S.focusTarget;
    const g = focusGeo();
    const gPrev = S.fcx + S.fFloor + S.fH;
    S.fcx = damp(S.fcx, g.cx, 4.6 * RM, dt); S.fFloor = damp(S.fFloor, g.floor, 4.6 * RM, dt); S.fH = damp(S.fH, g.h, 4.6 * RM, dt);
    if (Math.abs(S.fcx - g.cx) + Math.abs(S.fFloor - g.floor) + Math.abs(S.fH - g.h) < 0.05) { S.fcx = g.cx; S.fFloor = g.floor; S.fH = g.h; }
    const geoMoving = gPrev !== S.fcx + S.fFloor + S.fH;
    const focusMoving = fPrev !== S.focus || (S.focus > 0 && geoMoving);

    const hPrev = S.hover;
    S.hover = damp(S.hover, S.hoverTarget, 7 * RM, dt);
    if (Math.abs(S.hover - S.hoverTarget) < 0.002) S.hover = S.hoverTarget;

    let intro = false;
    if (S.introOn && S.intro < 1) { S.intro = Math.min(1, S.intro + dt / 2.1); intro = true; }

    if (S.playing && !S.userPaused && S.introOn && S.intro >= 0.6 && !S.dragging && !S.focusTarget && !S.hoverTarget && !document.hidden && !S.wheelActive) {
      S.progress += dt / (CFG.autoplayDelay / 1000);
      if (S.progress >= 1) { S.progress = 0; S.target = Math.round(S.target) + 1; }
    }

    if (moving || focusMoving || intro || S.hover !== S.hoverTarget || hPrev !== S.hover || !S.drawn) {
      drawItems();
      S.drawn = true;
    }

    updateIndex();
    stepChip(dt);

    busy = moving || focusMoving || intro || S.hover !== S.hoverTarget ||
      (S.playing && !S.userPaused) || Math.abs(S.chip - S.chipTarget) > 0.003 ||
      Math.abs(S.cx - S.mx) + Math.abs(S.cy - S.my) > 0.3 || !S.introOn;
    S.busy = busy;
  }

  function drawItems() {
    const { W, Hc, S1, S2, floorY } = S;
    const f = S.focus;
    const v = clamp(S.vel, -3, 3);
    const centerIdx = mod(Math.round(S.pos));

    items.forEach((it, i) => {
      const d = wrapD(i - S.pos), a = Math.abs(d);

      let s = depthScale(a);
      let x = Math.sign(d) * (S1 * Math.min(a, 1) + S2 * Math.max(0, a - 1));
      let y = -Math.min(a, 3) * 0.018 * Hc;
      let blur = depthBlur(a), op = depthOpacity(a);

      const lift = (i === centerIdx && !S.focusTarget) ? S.hover : 0;
      y -= lift * 0.016 * Hc;

      if (i === S.active && f > 0) {
        s = lerp(s, S.fH / Hc, f);
        x = lerp(x, S.fcx - W / 2, f);
        y = lerp(y, S.fFloor - floorY, f);
        blur = lerp(blur, 0, f); op = lerp(op, 1, f);
        it.el.style.setProperty('--inv', (1 / s).toFixed(4));
      } else if (f > 0) {
        op *= (1 - f); blur += f * 10; x += Math.sign(d || 1) * f * S1 * 0.6;
      }

      if (S.intro < 1) {
        const k = clamp(S.intro * 1.55 - a * 0.2, 0, 1), e = 1 - Math.pow(1 - k, 3);
        op *= e; blur += (1 - e) * 16; y += (1 - e) * 22;
      }

      const el = it.el;
      el.style.transform = `translate3d(${(W / 2 + x - it.w / 2).toFixed(2)}px, \( {(floorY + y - Hc).toFixed(2)}px, 0) scale( \){s.toFixed(4)})`;
      el.style.opacity = op.toFixed(3);
      el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
      el.style.zIndex = String(100 - Math.round(a * 10) + (i === S.active && f > 0 ? 50 : 0));
      el.style.visibility = op < 0.004 ? 'hidden' : 'visible';
      el.classList.toggle('is-center', i === centerIdx);

      const sx = 1 + Math.abs(v) * 0.11 - lift * 0.09;
      it.shadow.style.transform = `translate3d(\( {(v * Hc * 0.05).toFixed(1)}px,0,0) scaleX( \){sx.toFixed(3)})`;
      it.shadow.style.opacity = (1 - Math.abs(v) * 0.05 - lift * 0.30).toFixed(3);
    });
  }

  function updateIndex() {
    const cur = S.focusTarget ? S.active : mod(Math.round(S.target));
    if (cur !== S.cur) {
      S.cur = cur; S.progress = 0;
      idxBtns.forEach((b, i) => { b.classList.toggle('is-active', i === cur); i === cur ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current'); });
      idxFills.forEach((el) => el.style.setProperty('--p', 0));
    }
    const p = S.playing ? S.progress : 1;
    idxFills[cur].style.setProperty('--p', p.toFixed(4));
  }

  function stepChip(dt) {
    if (REDUCED && !S.chipTarget) return;
    S.chip = damp(S.chip, S.chipTarget, 12, dt);
    if (Math.abs(S.chip - S.chipTarget) < 0.003) S.chip = S.chipTarget;
    S.cx = damp(S.cx, S.mx, 20, dt); S.cy = damp(S.cy, S.my, 20, dt);
    if (S.chipTarget && S.chip < 0.05) { S.cx = S.mx; S.cy = S.my; }
    cursorEl.style.opacity = S.chip.toFixed(3);
    cursorEl.style.transform = `translate3d(${(S.cx - 33).toFixed(1)}px, \( {(S.cy - 33).toFixed(1)}px, 0) scale( \){(0.5 + 0.5 * S.chip).toFixed(3)})`;
  }

  /* ======================================================================
     E. INPUT (runway)
     ====================================================================== */
  const goTo = (i) => { if (S.focusTarget) return; S.target += wrapD(i - S.target); S.progress = 0; kick(); };
  const next = () => { if (S.focusTarget) return; S.target = Math.round(S.target) + 1; S.progress = 0; kick(); };
  const prevLook = () => { if (S.focusTarget) return; S.target = Math.round(S.target) - 1; S.progress = 0; kick(); };

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prevLook);
  idxBtns.forEach((b) => b.addEventListener('click', () => goTo(+b.dataset.i)));

  pauseBtn.addEventListener('click', () => {
    S.userPaused = !S.userPaused;
    pauseBtn.setAttribute('aria-pressed', String(S.userPaused));
    pauseBtn.setAttribute('aria-label', S.userPaused ? 'Play autoplay' : 'Pause autoplay');
    kick();
  });
  if (!S.playing) pauseBtn.hidden = true;

  items.forEach((it, i) => it.hit.addEventListener('click', (e) => {
    if (S.justDragged) return;
    if (S.focusTarget) {
      if (PIN_HELPER) return pinHelper(e, it);
      if (!S.panelOpen) openPanel();
      return;
    }
    if (mod(Math.round(S.target)) === i) openLook(i); else goTo(i);
  }));

  stage.addEventListener('pointerdown', (e) => {
    if (S.focusTarget || (e.pointerType === 'mouse' && e.button !== 0)) return;
    S.pd = { id: e.pointerId, x: e.clientX, moved: false, start: S.target, samples: [{ x: e.clientX, t: performance.now() }] };
  });
  stage.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') trackChip(e);
    const p = S.pd; if (!p || e.pointerId !== p.id) return;
    const dx = e.clientX - p.x;
    if (!p.moved) {
      if (Math.abs(dx) < 6) return;
      p.moved = true; S.dragging = true; S.hoverTarget = 0; S.chipTarget = 0;
      stage.setPointerCapture(e.pointerId); stage.classList.add('is-dragging');
    }
    S.target = p.start - dx / S.S1;
    const now = performance.now(); p.samples.push({ x: e.clientX, t: now });
    while (p.samples.length > 2 && now - p.samples[0].t > 100) p.samples.shift();
    S.progress = 0; kick();
  });
  const endDrag = (e) => {
    const p = S.pd; if (!p || (e.pointerId !== undefined && e.pointerId !== p.id)) return;
    S.pd = null;
    if (!p.moved) return;
    const a = p.samples[0], b = p.samples[p.samples.length - 1];
    const vPx = (b.x - a.x) / Math.max(1, b.t - a.t);
    const vLooks = -(vPx * 1000) / S.S1;
    const proj = S.target + clamp(vLooks * 0.26, -1.8, 1.8);
    S.target = clamp(Math.round(proj), Math.round(p.start) - 2, Math.round(p.start) + 2);
    S.dragging = false; stage.classList.remove('is-dragging');
    S.justDragged = true; setTimeout(() => { S.justDragged = false; }, 60);
    kick();
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('click', (e) => { if (S.justDragged) { e.stopPropagation(); e.preventDefault(); } }, true);
  stage.addEventListener('pointerleave', () => { S.chipTarget = 0; S.hoverTarget = 0; document.body.classList.remove('has-chip'); kick(); });

  stage.addEventListener('wheel', (e) => {
    if (S.focusTarget) return;
    const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    e.preventDefault();
    const now = performance.now();
    if (now < S.wheelLock) { S.wheelLock = now + 200; return; }
    if (Math.abs(dx) < 3) return;
    if (!S.wheelActive) { S.wheelActive = true; S.wheelBase = Math.round(S.target); S.wheelAcc = 0; }
    S.wheelAcc += dx;
    S.target = S.wheelBase + clamp(S.wheelAcc / (S.S1 * 1.4), -1.4, 1.4);
    S.progress = 0;
    clearTimeout(S.wheelT);
    S.wheelT = setTimeout(() => {
      const delta = S.target - S.wheelBase;
      S.target = S.wheelBase + (Math.abs(delta) > 0.08 ? Math.sign(delta) : 0);
      S.wheelActive = false; S.wheelLock = performance.now() + 380; kick();
    }, 110);
    kick();
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (S.currentView === 'product') { showView('products'); return; }
      if (cartDrawer.classList.contains('is-open')) { closeCart(); return; }
      if (S.focusTarget) { e.preventDefault(); onClose(); }
      return;
    }
    if (S.focusTarget || S.currentView !== 'runway') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prevLook(); }
  });

  function trackChip(e) {
    S.mx = e.clientX; S.my = e.clientY;
    const hit = e.target.closest && e.target.closest('.look__hit');
    const over = !!hit && !S.focusTarget && !S.dragging && +hit.dataset.i === mod(Math.round(S.target));
    S.chipTarget = over ? 1 : 0; S.hoverTarget = over ? 1 : 0;
    document.body.classList.toggle('has-chip', over);
    kick();
  }

  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-menu');
    burger.setAttribute('aria-expanded', String(open));
  });

  /* ======================================================================
     F. LOOK MODE + PANEL
     ====================================================================== */
  function openLook(i) {
    if (S.focusTarget) return;
    S.active = mod(i);
    S.target = S.active;
    S.lastFocusEl = document.activeElement;
    const it = items[S.active], look = it.look;
    lookNo.textContent = `Look ${pad2(S.active + 1)}`; lookName.textContent = look.title;
    renderPanel(look);
    it.el.classList.add('is-focus');
    it.el.querySelectorAll('.pin').forEach((p) => p.tabIndex = 0);
    runway.classList.add('is-look');
    closeBtn.tabIndex = 0; document.querySelector('.lookhead').setAttribute('aria-hidden', 'false');
    S.focusTarget = 1; S.chipTarget = 0; S.hoverTarget = 0; document.body.classList.remove('has-chip');
    if (CFG.panelOpensWithLook) openPanel();
    kick();
  }

  function closeLook() {
    if (!S.focusTarget) return;
    closePanel(true);
    const it = items[S.active];
    it.el.classList.remove('is-focus');
    it.el.querySelectorAll('.pin').forEach((p) => { p.tabIndex = -1; p.classList.remove('is-hot'); });
    runway.classList.remove('is-look');
    closeBtn.tabIndex = -1; document.querySelector('.lookhead').setAttribute('aria-hidden', 'true');
    S.focusTarget = 0; S.progress = 0;
    if (S.lastFocusEl && S.lastFocusEl.focus) try { S.lastFocusEl.focus({ preventScroll: true }); } catch (_) {}
    kick();
  }

  function openPanel() {
    if (S.panelOpen) return;
    S.panelOpen = true; runway.classList.add('has-panel'); panel.setAttribute('aria-hidden', 'false'); kick();
  }
  function closePanel(silent) {
    if (!S.panelOpen) return;
    S.panelOpen = false; runway.classList.remove('has-panel'); panel.setAttribute('aria-hidden', 'true');
    panelList.querySelectorAll('.is-hot').forEach((n) => n.classList.remove('is-hot'));
    if (!silent) kick();
  }
  function onClose() {
    if (S.panelOpen && !CFG.panelOpensWithLook) closePanel(); else closeLook();
  }
  closeBtn.addEventListener('click', onClose);

  function renderPanel(look) {
    const list = look.products || [];
    panelList.innerHTML = list.map((p, k) => `
      <li class="item" data-k="\( {k}" style="--i: \){k}">
        <div class="item__thumb"><img src="\( {esc(p.image)}" alt="" loading="lazy" draggable="false"><span class="item__no"> \){k + 1}</span></div>
        <div class="item__info">
          <span class="item__brand">${esc(p.brand || CFG.brand)}</span>
          <span class="item__name">${esc(p.name)}</span>
          <span class="item__price">${fmt.format(p.price)}</span>
        </div>
        <button class="add" type="button" aria-label="Add ${esc(p.name)} to bag">
          <svg class="i-plus" viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M8 2v12M2 8h12"/></svg>
          <svg class="i-check" viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5l3.2 3.2L13 4.8"/></svg>
        </button>
      </li>`).join('');

    const n = list.length, total = list.reduce((s, p) => s + Number(p.price || 0), 0), disc = CFG.bundleDiscount || 0;
    panelCount.textContent = `${n} ${n === 1 ? 'piece' : 'pieces'}`;
    bundleNote.textContent = disc > 0 ? `Bundle all ${n} and save ${Math.round(disc * 100)}%` : `All ${n} ${n === 1 ? 'piece' : 'pieces'}`;
    bundleWas.hidden = !(disc > 0); bundleWas.textContent = fmt.format(total);
    bundleNow.textContent = fmt.format(total * (1 - disc));
    panelList.scrollTop = 0;
    addLookBtn.classList.remove('is-done');
    addLookBtn.querySelector('.cta__label').textContent = 'Add full look to bag';

    const pins = items[S.active].el.querySelectorAll('.pin');
    panelList.querySelectorAll('.item').forEach((row) => {
      const k = +row.dataset.k, pin = items[S.active].el.querySelector(`.pin[data-k="${k}"]`);
      row.addEventListener('mouseenter', () => pin && pin.classList.add('is-hot'));
      row.addEventListener('mouseleave', () => pin && pin.classList.remove('is-hot'));
      row.querySelector('.add').addEventListener('click', (e) => addOne(list[k], e.currentTarget));
    });
    pins.forEach((pin) => {
      const k = +pin.dataset.k;
      pin.onclick = (e) => { e.stopPropagation(); if (!S.panelOpen) openPanel(); flashRow(k); };
      pin.onmouseenter = () => panelList.querySelector(`.item[data-k="${k}"]`)?.classList.add('is-hot');
      pin.onmouseleave = () => panelList.querySelector(`.item[data-k="${k}"]`)?.classList.remove('is-hot');
    });
  }

  function flashRow(k) {
    const row = panelList.querySelector(`.item[data-k="${k}"]`); if (!row) return;
    panelList.querySelectorAll('.is-hot').forEach((n) => n.classList.remove('is-hot'));
    row.classList.add('is-hot');
    setTimeout(() => row.scrollIntoView({ block: 'nearest', behavior: REDUCED ? 'auto' : 'smooth' }), 120);
    setTimeout(() => row.classList.remove('is-hot'), 1800);
  }

  addLookBtn.addEventListener('click', () => {
    const look = items[S.active].look, list = look.products || [];
    if (!list.length) return;
    list.forEach(p => addToBag(p));
    addLookBtn.classList.add('is-done');
    addLookBtn.querySelector('.cta__label').textContent = 'Added to bag';
    setTimeout(() => { addLookBtn.classList.remove('is-done'); addLookBtn.querySelector('.cta__label').textContent = 'Add full look to bag'; }, 2200);
    toast(`${look.title} added to bag · ${list.length} pieces`);
  });

  /* ======================================================================
     G. CART SYSTEM
     ====================================================================== */
  function addToBag(product, qty = 1) {
    const existing = S.bag.find(i => i.id === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      S.bag.push({
        id: product.id || product.name,
        name: product.name,
        price: Number(product.price) || 0,
        image: product.image,
        brand: product.brand || CFG.brand,
        qty
      });
    }
    updateBagUI();
  }

  function addOne(p, btn) {
    addToBag(p);
    if (btn) {
      btn.classList.add('is-added');
      setTimeout(() => btn.classList.remove('is-added'), 1600);
    }
    toast(`${p.name} added to bag`);
  }

  function updateBagUI() {
    const totalQty = S.bag.reduce((s, i) => s + i.qty, 0);
    cartCount.hidden = totalQty === 0;
    cartCount.textContent = totalQty;
    cartCount.classList.remove('is-bump');
    void cartCount.offsetWidth;
    cartCount.classList.add('is-bump');

    // Render cart list
    if (!S.bag.length) {
      cartList.innerHTML = `<li style="padding:40px 24px;text-align:center;color:var(--muted)">Your bag is empty</li>`;
    } else {
      cartList.innerHTML = S.bag.map(item => `
        <li class="cart-item">
          <img src="${esc(item.image)}" alt="" loading="lazy">
          <div>
            <div class="cart-item__name">${esc(item.name)}</div>
            <div class="cart-item__meta">${item.qty} × ${fmt.format(item.price)}</div>
          </div>
          <div class="cart-item__price">${fmt.format(item.price * item.qty)}</div>
        </li>
      `).join('');
    }

    const total = S.bag.reduce((s, i) => s + i.price * i.qty, 0);
    cartTotal.textContent = fmt.format(total);
  }

  function openCart() {
    cartDrawer.classList.add('is-open');
    cartOverlay.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
  }
  function closeCart() {
    cartDrawer.classList.remove('is-open');
    cartOverlay.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
  }

  cartBtn.addEventListener('click', openCart);
  closeCartBtn.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  checkoutBtn.addEventListener('click', () => {
    if (!S.bag.length) { toast('Your bag is empty'); return; }
    toast('Checkout coming soon');
  });

  /* ======================================================================
     H. VIEW SWITCHING + PRODUCTS
     ====================================================================== */
  function showView(view) {
    // Hide everything first
    runway.hidden = true;
    productsPage.hidden = true;
    productDetail.hidden = true;
    aboutPage.hidden = true;
    contactPage.hidden = true;
    document.body.classList.remove('is-page');

    // Close any open states
    if (S.focusTarget) closeLook();
    closeCart();
    nav.classList.remove('is-menu');
    burger.setAttribute('aria-expanded', 'false');

    S.currentView = view;

    // Update nav active state
    document.querySelectorAll('.nav__links a').forEach(a => {
      a.classList.toggle('is-active', a.dataset.view === view || (view === 'product' && a.dataset.view === 'products'));
    });

    if (view === 'runway') {
      runway.hidden = false;
      document.body.style.overflow = 'hidden';
      kick();
    } else {
      document.body.classList.add('is-page');
      document.body.style.overflow = 'auto';

      if (view === 'products') {
        productsPage.hidden = false;
        renderProductsGrid();
      } else if (view === 'product') {
        productDetail.hidden = false;
      } else if (view === 'about') {
        aboutPage.hidden = false;
      } else if (view === 'contact') {
        contactPage.hidden = false;
      }
    }

    window.scrollTo(0, 0);
  }

  // Collect unique products from all looks
  function getAllProducts() {
    const map = new Map();
    LOOKS.forEach(look => {
      (look.products || []).forEach(p => {
        const key = p.id || p.name;
        if (!map.has(key)) {
          map.set(key, {
            id: key,
            name: p.name,
            price: Number(p.price) || 0,
            image: p.image,
            brand: p.brand || CFG.brand,
            description: p.description || `Premium ${p.name.toLowerCase()} from the Passion collection. Crafted with attention to detail and designed to complete your look.`
          });
        }
      });
    });
    return Array.from(map.values());
  }

  function renderProductsGrid() {
    const products = getAllProducts();
    productsGrid.innerHTML = products.map(p => `
      <article class="product-card" data-id="${esc(p.id)}">
        <div class="product-card__img">
          <img src="\( {esc(p.image)}" alt=" \){esc(p.name)}" loading="lazy">
        </div>
        <div class="product-card__body">
          <h3 class="product-card__name">${esc(p.name)}</h3>
          <div class="product-card__price">${fmt.format(p.price)}</div>
          <div class="product-card__rating">★ 4.5</div>
        </div>
      </article>
    `).join('');

    productsGrid.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const product = getAllProducts().find(p => p.id === id);
        if (product) openProductDetail(product);
      });
    });
  }

  function openProductDetail(product) {
    S.currentProduct = product;
    S.selectedSize = 'S';
    S.selectedColor = 'Black';

    detailImg.src = product.image;
    detailImg.alt = product.name;
    detailName.textContent = product.name;
    detailPrice.textContent = fmt.format(product.price);
    detailDesc.textContent = product.description;

    // Reset size/color buttons
    sizeRow.querySelectorAll('.size').forEach(btn => {
      btn.classList.toggle('is-active', btn.textContent === 'S');
    });
    colorRow.querySelectorAll('.color').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.color === 'Black');
    });

    showView('product');
  }

  // Size & color selection
  sizeRow.addEventListener('click', (e) => {
    const btn = e.target.closest('.size');
    if (!btn) return;
    sizeRow.querySelectorAll('.size').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    S.selectedSize = btn.textContent;
  });
  colorRow.addEventListener('click', (e) => {
    const btn = e.target.closest('.color');
    if (!btn) return;
    colorRow.querySelectorAll('.color').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    S.selectedColor = btn.dataset.color;
  });

  detailAddBtn.addEventListener('click', () => {
    if (!S.currentProduct) return;
    addToBag(S.currentProduct);
    toast(`${S.currentProduct.name} added to bag`);
  });

  orderNowBtn.addEventListener('click', () => {
    if (!S.currentProduct) return;
    addToBag(S.currentProduct);
    openCart();
    toast('Ready for checkout');
  });

  backToProducts.addEventListener('click', () => showView('products'));

  // Nav links
  document.querySelectorAll('[data-view]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const view = el.dataset.view;
      if (view) showView(view);
    });
  });

  profileBtn.addEventListener('click', () => {
    toast('Profile coming soon');
  });

  /* ======================================================================
     I. PIN HELPER + BOOT
     ====================================================================== */
  function pinHelper(e, it) {
    const r = it.hit.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width * 100).toFixed(1);
    const y = ((e.clientY - r.top) / r.height * 100).toFixed(1);
    const txt = `pin: { x: ${x}, y: ${y} }`;
    helperEl.hidden = false; helperEl.textContent = txt;
    console.log('[Passion pin helper]', txt);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(() => { helperEl.textContent = txt + '   (copied)'; }).catch(() => {});
    }
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toast.timeout);
    toast.timeout = setTimeout(() => toastEl.classList.remove('is-on'), 2300);
  }

  // Boot
  measure();
  new ResizeObserver(() => { measure(); S.drawn = false; kick(); }).observe(stage);
  window.addEventListener('resize', () => { measure(); S.drawn = false; kick(); });
  drawItems();

  const ready = Promise.race([
    Promise.all(items.slice(0, 5).map((it) => (it.img.decode ? it.img.decode().catch(() => {}) : Promise.resolve()))),
    new Promise((r) => setTimeout(r, 1400)),
  ]);
  ready.then(() => { sizeItems(); S.introOn = true; kick(); });

  // Start on runway
  showView('runway');
  updateBagUI();

  // Public API
  window.Passion = {
    goTo, next, prev: prevLook, openLook, closeLook,
    getBag: () => S.bag,
    showView
  };
})();