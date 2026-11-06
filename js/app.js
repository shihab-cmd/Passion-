/* ==========================================================================
   PASSION — "Try the Look" Engine & Store Routing
   ========================================================================== */
(() => {
  'use strict';

  const CFG = Object.assign({
    brand: 'Passion', locale: 'en-US', currency: 'USD',
    bundleDiscount: 0.10, autoplay: true, autoplayDelay: 5600,
    panelOpensWithLook: true, stageStyle: 'soft', spacing: 1,
  }, window.PASSION_CONFIG || {});

  const LOOKS = Array.isArray(window.PASSION_LOOKS) ? window.PASSION_LOOKS : [];
  const N = LOOKS.length;
  if (!N) return;

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

  // Pages & Detail Elements
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

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (cur, tgt, rate, dt) => cur + (tgt - cur) * (1 - Math.exp(-rate * dt));
  const mod = (i) => ((i % N) + N) % N;
  const pad2 = (n) => String(n).padStart(2, '0');
  const wrapD = (d) => { d = mod(d); return d > N / 2 ? d - N : d; };
  const fmt = new Intl.NumberFormat(CFG.locale, { style: 'currency', currency: CFG.currency });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const depthScale   = (a) => a <= 1 ? 1 - 0.13 * a : Math.max(0.5, 0.87 - 0.10 * (a - 1));
  const depthBlur    = (a) => a <= 1 ? a * 0.7 : 0.7 + (a - 1) * 4.6;
  const depthOpacity = (a) => a <= 1 ? 1 - 0.08 * a : a <= 2 ? 0.92 - 0.40 * (a - 1) : Math.max(0, 0.52 * (1 - (a - 2) / 0.62));

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
    panelOpen: false, bag: [],
    cur: -1, last: 0, busy: false,
    W: 0, Hs: 0, mobile: false, floorY: 0, Hc: 0, S1: 0, S2: 0, sheetH: 0,
    geoReady: false, lastFocusEl: null,
    currentView: 'runway',
    currentProduct: null
  };
  let raf = 0;

  // DOM Build Runway
  const items = LOOKS.map((look, i) => {
    const el = document.createElement('article');
    el.className = 'look';
    const pins = (look.products || []).map((p, k) => p.pin
      ? `<button class="pin" type="button" tabindex="-1" data-k="${k}" data-n="${k + 1}" style="left:${p.pin.x}%;top:${p.pin.y}%;--i:${k}"></button>`
      : '').join('');

    el.innerHTML =
      `<div class="shadow" style="--feet:${Number(look.feetOffset) || 0}"><i class="sh sh--ambient"></i><i class="sh sh--core"></i><i class="sh sh--contact"></i></div>` +
      `<img class="look__img" alt="${esc(look.alt || look.title)}" draggable="false">` +
      `<button class="look__hit" type="button" data-i="${i}"></button>` +
      `<div class="pins">${pins}</div>`;

    const img = el.querySelector('.look__img');
    const it = { el, img, shadow: el.querySelector('.shadow'), hit: el.querySelector('.look__hit'), aspect: 0.4, w: 0, look };
    img.addEventListener('load', () => { if (img.naturalWidth) { it.aspect = img.naturalWidth / img.naturalHeight; sizeItems(); kick(); } });
    img.src = look.model;
    looksEl.appendChild(el);
    return it;
  });

  const idxBtns = LOOKS.map((look, i) => {
    const li = document.createElement('li');
    const title = look.title || `Look ${i + 1}`;
    li.innerHTML = `<button class="idx" type="button" data-i="${i}"><span class="idx__bar"><i></i></span><span class="idx__label"><b>${pad2(i + 1)}</b><em>${esc(title)}</em></span></button>`;
    indexEl.appendChild(li);
    return li.firstElementChild;
  });
  const idxFills = idxBtns.map((b) => b.querySelector('.idx__bar i'));

  function measure() {
    const r = stage.getBoundingClientRect();
    S.W = r.width; S.Hs = r.height;
    S.mobile = window.innerWidth <= 760;
    S.floorY = S.Hs - (S.mobile ? 100 : 110);
    S.Hc = S.mobile ? clamp(S.floorY - 160, 260, 520) : clamp(S.floorY * 0.82, 380, 720);
    const sp = CFG.spacing || 1;
    S.S1 = S.mobile ? S.W * 0.48 * sp : S.Hc * 0.52 * sp;
    S.S2 = S.mobile ? S.W * 0.16 * sp : S.Hc * 0.22 * sp;
    runway.style.setProperty('--floor-y', S.floorY + 'px');
    sizeItems();
    if (!S.geoReady) { const g = focusGeo(); S.fcx = g.cx; S.fFloor = g.floor; S.fH = g.h; S.geoReady = true; }
  }
  function sizeItems() { items.forEach((it) => { it.w = S.Hc * it.aspect; it.el.style.width = it.w + 'px'; it.el.style.height = S.Hc + 'px'; }); }
  function focusGeo() {
    const panelW = S.mobile ? 0 : Math.min(420, window.innerWidth);
    const cx = (!S.mobile && S.panelOpen) ? (S.W - panelW) / 2 : S.W / 2;
    const floor = (S.mobile && S.panelOpen) ? S.Hs - S.sheetH - 16 : S.floorY;
    const h = clamp(floor - (S.mobile ? 84 : 124), 180, 780);
    return { cx, floor, h };
  }

  function kick() { if (!raf) { S.last = performance.now(); raf = requestAnimationFrame(frame); } }
  function frame(t) {
    raf = 0;
    const dt = clamp((t - S.last) / 1000 || 0.016, 0.001, 0.05);
    S.last = t; step(dt);
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
    S.fcx = damp(S.fcx, g.cx, 4.6 * RM, dt); S.fFloor = damp(S.fFloor, g.floor, 4.6 * RM, dt); S.fH = damp(S.fH, g.h, 4.6 * RM, dt);

    if (S.introOn && S.intro < 1) S.intro = Math.min(1, S.intro + dt / 2.1);

    if (S.playing && !S.userPaused && S.introOn && S.intro >= 0.6 && !S.dragging && !S.focusTarget && !document.hidden) {
      S.progress += dt / (CFG.autoplayDelay / 1000);
      if (S.progress >= 1) { S.progress = 0; S.target = Math.round(S.target) + 1; }
    }

    drawItems();
    updateIndex();
    busy = moving || S.focus !== S.focusTarget || (S.playing && !S.userPaused);
    S.busy = busy;
  }

  function drawItems() {
    const { W, Hc, S1, S2, floorY } = S;
    const f = S.focus; const v = clamp(S.vel, -3, 3);
    const centerIdx = mod(Math.round(S.pos));

    items.forEach((it, i) => {
      const d = wrapD(i - S.pos), a = Math.abs(d);
      let s = depthScale(a), x = Math.sign(d) * (S1 * Math.min(a, 1) + S2 * Math.max(0, a - 1)), y = -Math.min(a, 3) * 0.018 * Hc;
      let blur = depthBlur(a), op = depthOpacity(a);

      if (i === S.active && f > 0) {
        s = lerp(s, S.fH / Hc, f); x = lerp(x, S.fcx - W / 2, f); y = lerp(y, S.fFloor - floorY, f);
        blur = lerp(blur, 0, f); op = lerp(op, 1, f);
      }

      const el = it.el;
      el.style.transform = `translate3d(${(W / 2 + x - it.w / 2).toFixed(2)}px, ${(floorY + y - Hc).toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
      el.style.opacity = op.toFixed(3);
      el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
      el.style.zIndex = String(100 - Math.round(a * 10) + (i === S.active && f > 0 ? 50 : 0));
    });
  }

  function updateIndex() {
    const cur = S.focusTarget ? S.active : mod(Math.round(S.target));
    if (cur !== S.cur) {
      S.cur = cur; S.progress = 0;
      idxBtns.forEach((b, i) => b.classList.toggle('is-active', i === cur));
    }
    if (idxFills[cur]) idxFills[cur].style.setProperty('--p', S.playing ? S.progress.toFixed(4) : 1);
  }

  // View Switcher Router
  function showView(view) {
    runway.hidden = true;
    productsPage.hidden = true;
    productDetail.hidden = true;
    aboutPage.hidden = true;
    contactPage.hidden = true;
    document.body.classList.remove('is-page');

    if (S.focusTarget) closeLook();
    closeCart();
    nav.classList.remove('is-menu');

    S.currentView = view;
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
      if (view === 'products') { productsPage.hidden = false; renderProductsShowcase(); }
      else if (view === 'product') { productDetail.hidden = false; }
      else if (view === 'about') { aboutPage.hidden = false; }
      else if (view === 'contact') { contactPage.hidden = false; }
    }
    window.scrollTo(0, 0);
  }

  // Showcase Products Generator
  function getAllProducts() {
    const map = new Map();
    LOOKS.forEach(look => {
      (look.products || []).forEach(p => {
        if (!map.has(p.name)) {
          map.set(p.name, {
            id: p.id || p.name,
            name: p.name,
            price: Number(p.price) || 0,
            image: p.image,
            brand: p.brand || CFG.brand,
            description: `Bring the past into the future with a bold look inspired by classic aesthetics. Crafted with premium materials for maximum comfort.`
          });
        }
      });
    });
    return Array.from(map.values());
  }

  function renderProductsShowcase() {
    const products = getAllProducts();
    productsGrid.innerHTML = products.map(p => `
      <article class="product-card" data-id="${esc(p.id)}">
        <div class="product-card__img">
          <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">
        </div>
        <div class="product-card__body">
          <h3 class="product-card__name">${esc(p.name)}</h3>
          <div class="product-card__price">${fmt.format(p.price)}</div>
          <div class="product-card__rating">★ 4.8</div>
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
    detailImg.src = product.image;
    detailName.textContent = product.name;
    detailPrice.textContent = fmt.format(product.price);
    detailDesc.textContent = product.description;
    showView('product');
  }

  // Cart Management
  function addToBag(product) {
    const item = S.bag.find(i => i.name === product.name);
    if (item) item.qty += 1;
    else S.bag.push({ name: product.name, price: product.price, image: product.image, qty: 1 });
    updateCartUI();
  }

  function updateCartUI() {
    const totalQty = S.bag.reduce((s, i) => s + i.qty, 0);
    cartCount.hidden = totalQty === 0;
    cartCount.textContent = totalQty;

    if (!S.bag.length) {
      cartList.innerHTML = `<li style="padding:30px;text-align:center;color:#888;">Your bag is empty</li>`;
    } else {
      cartList.innerHTML = S.bag.map(i => `
        <li class="cart-item">
          <img src="${esc(i.image)}" alt="">
          <div>
            <div style="font-weight:600;font-size:13px;">${esc(i.name)}</div>
            <div style="font-size:12px;color:#666;">${i.qty} × ${fmt.format(i.price)}</div>
          </div>
          <div style="font-weight:700;">${fmt.format(i.price * i.qty)}</div>
        </li>
      `).join('');
    }
    const total = S.bag.reduce((s, i) => s + i.price * i.qty, 0);
    cartTotal.textContent = fmt.format(total);
  }

  function openCart() { cartDrawer.classList.add('is-open'); cartOverlay.classList.add('is-open'); }
  function closeCart() { cartDrawer.classList.remove('is-open'); cartOverlay.classList.remove('is-open'); }

  // Event Listeners
  document.querySelectorAll('[data-view]').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); showView(el.dataset.view); });
  });

  cartBtn.addEventListener('click', openCart);
  closeCartBtn.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  backToProducts.addEventListener('click', () => showView('products'));

  detailAddBtn.addEventListener('click', () => { if (S.currentProduct) { addToBag(S.currentProduct); toast(`${S.currentProduct.name} added to cart`); } });
  orderNowBtn.addEventListener('click', () => { if (S.currentProduct) { addToBag(S.currentProduct); openCart(); } });

  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('is-on');
    setTimeout(() => toastEl.classList.remove('is-on'), 2200);
  }

  // Look Interaction & Control buttons
  const goTo = (i) => { S.target += wrapD(i - S.target); kick(); };
  prevBtn.addEventListener('click', () => { S.target = Math.round(S.target) - 1; kick(); });
  nextBtn.addEventListener('click', () => { S.target = Math.round(S.target) + 1; kick(); });
  idxBtns.forEach(b => b.addEventListener('click', () => goTo(+b.dataset.i)));

  function openLook(i) {
    S.active = mod(i); S.target = S.active;
    const look = items[S.active].look;
    lookNo.textContent = `Look ${pad2(S.active + 1)}`; lookName.textContent = look.title;
    renderPanel(look);
    runway.classList.add('is-look');
    S.focusTarget = 1; openPanel(); kick();
  }

  function closeLook() {
    runway.classList.remove('is-look', 'has-panel');
    S.focusTarget = 0; S.panelOpen = false; kick();
  }

  function openPanel() { S.panelOpen = true; runway.classList.add('has-panel'); }
  closeBtn.addEventListener('click', closeLook);

  function renderPanel(look) {
    const list = look.products || [];
    panelList.innerHTML = list.map((p, k) => `
      <li class="item">
        <div class="item__thumb"><img src="${esc(p.image)}"></div>
        <div><div style="font-weight:600">${esc(p.name)}</div><div>${fmt.format(p.price)}</div></div>
        <button class="add" type="button">+</button>
      </li>`).join('');

    panelList.querySelectorAll('.add').forEach((btn, k) => {
      btn.addEventListener('click', () => { addToBag(list[k]); toast(`${list[k].name} added to bag`); });
    });
  }

  items.forEach((it, i) => it.hit.addEventListener('click', () => {
    if (mod(Math.round(S.target)) === i) openLook(i); else goTo(i);
  }));

  burger.addEventListener('click', () => nav.classList.toggle('is-menu'));

  // Initial Boot
  measure();
  drawItems();
  S.introOn = true;
  showView('runway');
  updateCartUI();
})();
