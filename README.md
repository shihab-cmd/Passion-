# Passion — "Try the Look"

A runway-style lookbook page: a looping carousel of full-body models standing on soft floor shadows, numbered pins on each garment, and an **In this look** panel with *Add full look to bag*.

**Stack:** plain HTML + CSS + JavaScript. No build step, no dependencies, no framework.
Open `index.html` by double-clicking it, or drop the folder on any static host.

Why not Swiper / Framer Motion? The effect in the video isn't a normal slider: every model's size, blur, fade, depth and *shadow* is a continuous function of how far it is from the centre. `js/app.js` keeps one floating-point carousel position, eases it toward a target every frame (frame-rate-independent damping), and draws each model from that number. That's what makes the motion feel buttery and lets the shadow react to speed.

---

## Folder structure

```
passion-try-the-look/
├── index.html              page + navbar markup
├── css/styles.css          all styling (shadow = section 3)
├── js/
│   ├── looks-data.js       ← THE ONLY FILE YOU EDIT (config + looks + products)
│   └── app.js              carousel engine, look mode, panel, bag
└── assets/
    ├── models/             full-body model images      (placeholders now)
    └── products/           individual product images   (placeholders now)
```

---

## The data structure

An array of **looks**. Each look has **one model image** and an **array of products**:

```js
window.PASSION_LOOKS = [
  {
    id: 'city-edit',                        // unique, url-safe
    title: 'The City Edit',                 // bottom index + look header
    model: 'assets/models/look-01.png',     // full-body, TRANSPARENT PNG/WebP
    alt: 'Model in grey crewneck, blue wide-leg denim…',
    feetOffset: 0,                          // optional, see "Model images" below
    products: [
      {
        id: 'p-101',                        // unique across the whole file
        brand: 'Passion',
        name: 'Oversized Crewneck',
        price: 129,                         // number, no currency symbol
        image: 'assets/products/p-101.png', // transparent PNG/WebP
        pin: { x: 50, y: 26 },              // dot position ON THE MODEL, in % (0–100)
        url: '/products/oversized-crewneck' // optional
      },
      // …more products (1–6 per look works well)
    ],
  },
  // …more looks (3–10 works well; 6 is what the video shows)
];
```

Only the products of the opened look are ever rendered in the panel. Panel order = pin numbers = array order.

---

## Plugging in your images

### 1 · Model images (`assets/models/`)
| Requirement | Why |
|---|---|
| **Transparent PNG or WebP**, one person, full body, head to shoes | The floor shadow is drawn *behind* the image, so the background must be transparent. |
| **Crop tight to the soles** (no empty space under the shoes) | The shadow is anchored to the bottom edge. If your files have padding below the feet, set `feetOffset` to that padding as a % of image height (e.g. `4`). |
| **Same framing and scale for every model** (same height in frame, same camera distance) | Models are drawn at the same height, so consistent framing keeps the row looking like one set. |
| **About 1200 × 2800 px or taller**, WebP ≈ 250–400 KB | The look is shown at ~1.2× zoom, so higher resolution keeps it crisp on retina screens. |
| Any aspect ratio | Width follows each image automatically. |

> Only have photos on a white background? Cut them out first (Photoshop *Remove Background*, Photopea, or remove.bg). Alternatively set `stageStyle: 'white'` in the config and put the shadow in your image yourself, but transparent cut-outs give the real floating-shadow effect.

### 2 · Product images (`assets/products/`)
Transparent PNG/WebP, any aspect ratio, about 800 px on the long side. They're shown contained inside a light tile, so flat-lay or ghost-mannequin shots both work.

### 3 · Wire them up
1. Drop the files into the folders above.
2. In `js/looks-data.js`, replace the placeholder `.svg` paths with your file names (the shapes above), and replace names, brands and prices.
3. Position the pins (next section).

### 4 · Position the pins
Open `index.html?pinhelper`, click a model to open its look, then **click on the garment** where the dot should sit. The coordinates appear bottom-left (and are copied to your clipboard):

```
pin: { x: 48.2, y: 31.5 }
```

Paste that into the matching product. Pins stay glued to the garment at every size because they are percentages of the image.

---

## Tuning the feel

| What | Where |
|---|---|
| Autoplay on/off, speed | `autoplay`, `autoplayDelay` in `looks-data.js` |
| Bundle discount (shown as strikethrough + total) | `bundleDiscount` (`0` hides it) |
| Panel opens with the look, or on pin tap (as in the video) | `panelOpensWithLook: true / false` |
| Currency / locale | `currency`, `locale` |
| Space between models | `spacing` (default `1`; try `0.85` tighter or `1.2` looser) |
| Slide speed / softness | `app.js` → `step()` → the `4.8` in `const rate` (lower = slower, floatier) |
| How fast side models shrink / blur / fade | `app.js` → `depthScale`, `depthBlur`, `depthOpacity` |
| **Shadow** size, softness, darkness | `styles.css` → `.sh--ambient`, `.sh--core`, `.sh--contact` (3 stacked blurred ellipses) |
| Shadow reaction to movement | `app.js` → `drawItems()` → the `/* SHADOW */` block (trail distance, stretch, hover lift) |

The shadow is three layers: a long soft pool, a mid-density core and a tight contact shadow. While the carousel moves, it trails behind the model and stretches with speed. When you hover the centre model it lifts a few pixels and the shadow tightens.

---

## Connecting your real cart

Every add action fires a DOM event, so you can hook into any cart (Shopify, Stripe, your own API):

```js
document.addEventListener('passion:add-to-bag', (e) => {
  // e.detail = { lookId, products: [{ id, name, price, qty, url }], bundle: true|false, total }
  fetch('/cart/add', { method: 'POST', body: JSON.stringify(e.detail) });
});
```

The navbar badge counts pieces added in the page. Replace `S.bag` in `app.js` if you want to read the count from your backend.

A small console API is also exposed: `Passion.goTo(2)`, `Passion.next()`, `Passion.openLook(3)`, `Passion.closeLook()`.

---

## Controls

Drag or swipe · mouse wheel or trackpad (one gesture = one look) · ← → keys · arrows and numbered index · click a side model to centre it · click the centre model (or its pins) to open it · **Esc** or **X** to close · pause button for autoplay.

## Responsive & accessibility
Desktop-first. At ≤ 760 px the nav collapses into a menu, the carousel shows partial neighbours, and the panel becomes a bottom sheet. Pins and buttons are real `<button>`s with labels, focus rings are visible, and `prefers-reduced-motion` turns off autoplay and shortens animations.

## Notes
* The placeholder figures and products are generated illustrations so the page works out of the box. They are not photography and are meant to be replaced.
* The font (Hanken Grotesk) loads from Google Fonts; offline it falls back to Helvetica/system sans. Self-host it if you need to avoid the external request.
