/* ==========================================================================
   PASSION — "Try the Look"  ·  DATA FILE  (the only file you need to edit)
   --------------------------------------------------------------------------
   1) PASSION_CONFIG  → global behaviour switches
   2) PASSION_LOOKS   → array of looks. Each look = ONE model image + an
                        array of products that model is wearing.

   ── LOOK SHAPE ────────────────────────────────────────────────────────────
   {
     id:         'city-edit',                 // unique, url-safe
     title:      'The City Edit',             // shown in the bottom index + look header
     model:      'assets/models/look-01.png', // FULL-BODY, TRANSPARENT PNG / WebP (see README)
     alt:        'Model in grey crewneck…',   // accessibility text
     feetOffset: 0,                           // optional. % of image height of empty space
                                              // below the shoes (so the shadow sits on the
                                              // soles). 0 when the image is cropped tight.
     products: [
       {
         id:    'p-101',                      // unique across the whole file
         brand: 'Passion',                    // small label above the name
         name:  'Oversized Crewneck',
         price: 129,                          // a NUMBER, no currency symbol
         image: 'assets/products/p-101.png',  // transparent PNG / WebP, any aspect
         pin:   { x: 50, y: 26 },             // where the numbered dot sits ON THE MODEL
                                              // x / y = percent of the model image
                                              // (0,0 = top-left · 100,100 = bottom-right)
         url:   '/products/oversized-crewneck' // optional. Used by the "view" event hook.
       },
       …
     ]
   }

   TIP — finding pin coordinates: open the page with  ?pinhelper  at the end of
   the URL  (e.g. index.html?pinhelper), open any look, then CLICK on the model
   where you want a dot. The x / y values appear on screen and in the console.
   ========================================================================== */

window.PASSION_CONFIG = {
  brand: 'Passion',
  locale: 'en-US',
  currency: 'USD',

  /* "Complete the look" bundle discount. 0.10 = 10 % off. Set 0 to hide it. */
  bundleDiscount: 0.10,

  /* Carousel auto-advance (the original has a pause button). */
  autoplay: true,
  autoplayDelay: 5600,          // ms per look

  /* true  → clicking a model opens the look AND the "In this look" panel together.
     false → two-step like the original video: the model focuses with pins first,
             and the panel opens when a pin (or the model) is tapped. */
  panelOpensWithLook: true,

  /* 'soft'  → very light grey wash + floor (matches the video)
     'white' → pure white stage (use if your art has a white background) */
  stageStyle: 'soft',
};

window.PASSION_LOOKS = [
  {
    id: 'city-edit',
    title: 'The City Edit',
    model: 'assets/models/look-01.svg',
    alt: 'Model in a grey oversized crewneck, blue wide-leg denim and grey sneakers',
    feetOffset: 0,
    products: [
      { id: 'p-101', brand: 'Passion', name: 'Oversized Crewneck', price: 129, image: 'assets/products/p-101.svg', pin: { x: 50, y: 26 } },
      { id: 'p-102', brand: 'Passion', name: 'Wide-Leg Denim',     price: 149, image: 'assets/products/p-102.svg', pin: { x: 40, y: 60 } },
      { id: 'p-103', brand: 'Passion Studio', name: 'Court Runner',  price: 139, image: 'assets/products/p-103.svg', pin: { x: 31, y: 95 } },
    ],
  },
  {
    id: 'gallery-opening',
    title: 'Gallery Opening',
    model: 'assets/models/look-02.svg',
    alt: 'Model in a white tee, washed wide-leg jeans and black sneakers',
    feetOffset: 0,
    products: [
      { id: 'p-201', brand: 'Passion', name: 'Heavyweight Tee',    price: 59,  image: 'assets/products/p-201.svg', pin: { x: 50, y: 26 } },
      { id: 'p-202', brand: 'Passion', name: 'Washed Wide Jeans',  price: 159, image: 'assets/products/p-202.svg', pin: { x: 40, y: 60 } },
      { id: 'p-203', brand: 'Passion Studio', name: 'Low Court',   price: 129, image: 'assets/products/p-203.svg', pin: { x: 31, y: 95 } },
    ],
  },
  {
    id: 'weekend-field',
    title: 'Weekend Field',
    model: 'assets/models/look-03.svg',
    alt: 'Model in an olive sweater, brown trousers and cream sneakers',
    feetOffset: 0,
    products: [
      { id: 'p-301', brand: 'Passion', name: 'Olive Knit Sweater', price: 139, image: 'assets/products/p-301.svg', pin: { x: 50, y: 26 } },
      { id: 'p-302', brand: 'Passion', name: 'Relaxed Trouser',    price: 129, image: 'assets/products/p-302.svg', pin: { x: 40, y: 60 } },
      { id: 'p-303', brand: 'Passion Studio', name: 'Trail Sneaker', price: 149, image: 'assets/products/p-303.svg', pin: { x: 31, y: 95 } },
    ],
  },
  {
    id: 'studio-day',
    title: 'Studio Day',
    model: 'assets/models/look-04.svg',
    alt: 'Model in a black tee, light wide-leg jeans, white sneakers and sunglasses',
    feetOffset: 0,
    products: [
      { id: 'p-401', brand: 'Passion', name: 'Black Logo Tee',      price: 69,  image: 'assets/products/p-401.svg', pin: { x: 50, y: 27 } },
      { id: 'p-402', brand: 'Passion', name: 'Light Wash Baggy',    price: 159, image: 'assets/products/p-402.svg', pin: { x: 40, y: 60 } },
      { id: 'p-403', brand: 'Passion Studio', name: 'Court Classic', price: 129, image: 'assets/products/p-403.svg', pin: { x: 31, y: 95 } },
      { id: 'p-404', brand: 'Passion Eyewear', name: 'Frame 04',     price: 89,  image: 'assets/products/p-404.svg', pin: { x: 50, y: 8 } },
    ],
  },
  {
    id: 'late-autumn',
    title: 'Late Autumn',
    model: 'assets/models/look-05.svg',
    alt: 'Model in a burgundy sweater, grey trousers and black shoes',
    feetOffset: 0,
    products: [
      { id: 'p-501', brand: 'Passion', name: 'Burgundy Crewneck',   price: 135, image: 'assets/products/p-501.svg', pin: { x: 50, y: 26 } },
      { id: 'p-502', brand: 'Passion', name: 'Charcoal Wide Trouser', price: 139, image: 'assets/products/p-502.svg', pin: { x: 40, y: 60 } },
      { id: 'p-503', brand: 'Passion Studio', name: 'Black Derby Sneaker', price: 159, image: 'assets/products/p-503.svg', pin: { x: 31, y: 95 } },
    ],
  },
  {
    id: 'soft-grey',
    title: 'Soft Grey',
    model: 'assets/models/look-06.svg',
    alt: 'Model in a light grey sweater, pale blue jeans and white sneakers',
    feetOffset: 0,
    products: [
      { id: 'p-601', brand: 'Passion', name: 'Cloud Grey Sweater', price: 125, image: 'assets/products/p-601.svg', pin: { x: 50, y: 26 } },
      { id: 'p-602', brand: 'Passion', name: 'Pale Blue Wide Jeans', price: 149, image: 'assets/products/p-602.svg', pin: { x: 40, y: 60 } },
      { id: 'p-603', brand: 'Passion Studio', name: 'Court Low White', price: 129, image: 'assets/products/p-603.svg', pin: { x: 31, y: 95 } },
    ],
  },
];
