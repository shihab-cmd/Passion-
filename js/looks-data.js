/* ==========================================================================
   PASSION — "Try the Look"  ·  DATA FILE (18 Looks Configured)
   ========================================================================== */

window.PASSION_CONFIG = {
  brand: 'Passion',
  locale: 'en-US',
  currency: 'USD',

  /* "Complete the look" bundle discount. 0.10 = 10% off. Set 0 to hide it. */
  bundleDiscount: 0.10,

  /* Carousel auto-advance */
  autoplay: true,
  autoplayDelay: 5600,          // ms per look

  /* true  → clicking a model opens the look AND the panel together.
     false → two-step: model focuses with pins first, panel opens on tap. */
  panelOpensWithLook: true,

  /* 'soft'  → very light grey wash + floor 
     'white' → pure white stage */
  stageStyle: 'soft',
};

window.PASSION_LOOKS = [
  {
    id: 'look-01',
    title: 'The City Edit',
    model: 'assets/models/model1.png',
    alt: 'Model in look 1',
    feetOffset: 0,
    products: [
      { id: 'p-101', brand: 'Passion', name: 'Oversized Crewneck', price: 129, image: 'assets/products/p-101.svg', pin: { x: 50, y: 26 } },
      { id: 'p-102', brand: 'Passion', name: 'Wide-Leg Denim',     price: 149, image: 'assets/products/p-102.svg', pin: { x: 40, y: 60 } },
      { id: 'p-103', brand: 'Passion Studio', name: 'Court Runner',  price: 139, image: 'assets/products/p-103.svg', pin: { x: 31, y: 95 } },
    ],
  },
  {
    id: 'look-02',
    title: 'Gallery Opening',
    model: 'assets/models/model2.png',
    alt: 'Model in look 2',
    feetOffset: 0,
    products: [
      { id: 'p-201', brand: 'Passion', name: 'Heavyweight Tee',    price: 59,  image: 'assets/products/p-201.svg', pin: { x: 50, y: 26 } },
      { id: 'p-202', brand: 'Passion', name: 'Washed Wide Jeans',  price: 159, image: 'assets/products/p-202.svg', pin: { x: 40, y: 60 } },
      { id: 'p-203', brand: 'Passion Studio', name: 'Low Court',   price: 129, image: 'assets/products/p-203.svg', pin: { x: 31, y: 95 } },
    ],
  },
  {
    id: 'look-03',
    title: 'Weekend Field',
    model: 'assets/models/model3.png',
    alt: 'Model in look 3',
    feetOffset: 0,
    products: [
      { id: 'p-301', brand: 'Passion', name: 'Olive Knit Sweater', price: 139, image: 'assets/products/p-301.svg', pin: { x: 50, y: 26 } },
      { id: 'p-302', brand: 'Passion', name: 'Relaxed Trouser',    price: 129, image: 'assets/products/p-302.svg', pin: { x: 40, y: 60 } },
      { id: 'p-303', brand: 'Passion Studio', name: 'Trail Sneaker', price: 149, image: 'assets/products/p-303.svg', pin: { x: 31, y: 95 } },
    ],
  },
  {
    id: 'look-04',
    title: 'Studio Day',
    model: 'assets/models/model4.png',
    alt: 'Model in look 4',
    feetOffset: 0,
    products: [
      { id: 'p-401', brand: 'Passion', name: 'Black Logo Tee',      price: 69,  image: 'assets/products/p-401.svg', pin: { x: 50, y: 27 } },
      { id: 'p-402', brand: 'Passion', name: 'Light Wash Baggy',    price: 159, image: 'assets/products/p-402.svg', pin: { x: 40, y: 60 } },
      { id: 'p-403', brand: 'Passion Studio', name: 'Court Classic', price: 129, image: 'assets/products/p-403.svg', pin: { x: 31, y: 95 } },
    ],
  },
  {
    id: 'look-05',
    title: 'Late Autumn',
    model: 'assets/models/model5.png',
    alt: 'Model in look 5',
    feetOffset: 0,
    products: [
      { id: 'p-501', brand: 'Passion', name: 'Burgundy Crewneck',   price: 135, image: 'assets/products/p-501.svg', pin: { x: 50, y: 26 } },
      { id: 'p-502', brand: 'Passion', name: 'Charcoal Trouser',    price: 139, image: 'assets/products/p-502.svg', pin: { x: 40, y: 60 } },
      { id: 'p-503', brand: 'Passion Studio', name: 'Derby Sneaker', price: 159, image: 'assets/products/p-503.svg', pin: { x: 31, y: 95 } },
    ],
  },
  {
    id: 'look-06',
    title: 'Soft Grey',
    model: 'assets/models/model6.png',
    alt: 'Model in look 6',
    feetOffset: 0,
    products: [
      { id: 'p-601', brand: 'Passion', name: 'Cloud Grey Sweater',  price: 125, image: 'assets/products/p-601.svg', pin: { x: 50, y: 26 } },
      { id: 'p-602', brand: 'Passion', name: 'Pale Blue Jeans',     price: 149, image: 'assets/products/p-602.svg', pin: { x: 40, y: 60 } },
      { id: 'p-603', brand: 'Passion Studio', name: 'Court White',   price: 129, image: 'assets/products/p-603.svg', pin: { x: 31, y: 95 } },
    ],
  },
  {
    id: 'look-07',
    title: 'Noir Evening',
    model: 'assets/models/model7.png',
    alt: 'Model in look 7',
    feetOffset: 0,
    products: [
      { id: 'p-701', brand: 'Passion', name: 'Silk Black Shirt',    price: 155, image: 'assets/products/p-201.svg', pin: { x: 50, y: 26 } },
      { id: 'p-702', brand: 'Passion', name: 'Tailored Black Pant', price: 169, image: 'assets/products/p-202.svg', pin: { x: 40, y: 60 } },
    ],
  },
  {
    id: 'look-08',
    title: 'Urban Minimal',
    model: 'assets/models/model8.png',
    alt: 'Model in look 8',
    feetOffset: 0,
    products: [
      { id: 'p-801', brand: 'Passion', name: 'Minimalist Hoodie',   price: 115, image: 'assets/products/p-101.svg', pin: { x: 50, y: 26 } },
      { id: 'p-802', brand: 'Passion', name: 'Slim Jogger',         price: 99,  image: 'assets/products/p-102.svg', pin: { x: 40, y: 60 } },
    ],
  },
  {
    id: 'look-09',
    title: 'Sunset Walk',
    model: 'assets/models/model9.png',
    alt: 'Model in look 9',
    feetOffset: 0,
    products: [
      { id: 'p-901', brand: 'Passion', name: 'Sand Linen Shirt',    price: 110, image: 'assets/products/p-301.svg', pin: { x: 50, y: 26 } },
      { id: 'p-902', brand: 'Passion', name: 'Linen Shorts',        price: 85,  image: 'assets/products/p-302.svg', pin: { x: 40, y: 60 } },
    ],
  },
  {
    id: 'look-10',
    title: 'Modern Tailor',
    model: 'assets/models/model10.png',
    alt: 'Model in look 10',
    feetOffset: 0,
    products: [
      { id: 'p-1001', brand: 'Passion', name: 'Structured Blazer',  price: 249, image: 'assets/products/p-401.svg', pin: { x: 50, y: 26 } },
      { id: 'p-1002', brand: 'Passion', name: 'Pleated Trouser',    price: 159, image: 'assets/products/p-402.svg', pin: { x: 40, y: 60 } },
    ],
  },
  {
    id: 'look-11',
    title: 'Casual Friday',
    model: 'assets/models/model11.png',
    alt: 'Model in look 11',
    feetOffset: 0,
    products: [
      { id: 'p-1101', brand: 'Passion', name: 'Oxford Cotton Shirt', price: 119, image: 'assets/products/p-501.svg', pin: { x: 50, y: 26 } },
      { id: 'p-1102', brand: 'Passion', name: 'Dark Denim',         price: 139, image: 'assets/products/p-502.svg', pin: { x: 40, y: 60 } },
    ],
  },
  {
    id: 'look-12',
    title: 'Highland Tweed',
    model: 'assets/models/model12.png',
    alt: 'Model in look 12',
    feetOffset: 0,
    products: [
      { id: 'p-1201', brand: 'Passion', name: 'Tweed Jacket',       price: 229, image: 'assets/products/p-601.svg', pin: { x: 50, y: 26 } },
      { id: 'p-1202', brand: 'Passion', name: 'Wool Pant',          price: 149, image: 'assets/products/p-602.svg', pin: { x: 40, y: 60 } },
    ],
  },
  {
    id: 'look-13',
    title: 'Athletic Luxe',
    model: 'assets/models/model13.png',
    alt: 'Model in look 13',
    feetOffset: 0,
    products: [
      { id: 'p-1301', brand: 'Passion', name: 'Performance Tee',    price: 65,  image: 'assets/products/p-101.svg', pin: { x: 50, y: 26 } },
      { id: 'p-1302', brand: 'Passion', name: 'Track Pants',        price: 109, image: 'assets/products/p-102.svg', pin: { x: 40, y: 60 } },
    ],
  },
  {
    id: 'look-14',
    title: 'Monochrome Drift',
    model: 'assets/models/model14.png',
    alt: 'Model in look 14',
    feetOffset: 0,
    products: [
      { id: 'p-1401', brand: 'Passion', name: 'White Knit Top',     price: 120, image: 'assets/products/p-201.svg', pin: { x: 50, y: 26 } },
      { id: 'p-1402', brand: 'Passion', name: 'White Utility Pant', price: 150, image: 'assets/products/p-202.svg', pin: { x: 40, y: 60 } },
    ],
  },
  {
    id: 'look-15',
    title: 'Vintage Soul',
    model: 'assets/models/model15.png',
    alt: 'Model in look 15',
    feetOffset: 0,
    products: [
      { id: 'p-1501', brand: 'Passion', name: 'Retro Cardigan',     price: 135, image: 'assets/products/p-301.svg', pin: { x: 50, y: 26 } },
      { id: 'p-1502', brand: 'Passion', name: 'Corduroy Pant',      price: 125, image: 'assets/products/p-302.svg', pin: { x: 40, y: 60 } },
    ],
  },
  {
    id: 'look-16',
    title: 'Rain & City',
    model: 'assets/models/model16.png',
    alt: 'Model in look 16',
    feetOffset: 0,
    products: [
      { id: 'p-1601', brand: 'Passion', name: 'Waterproof Trench',  price: 289, image: 'assets/products/p-401.svg', pin: { x: 50, y: 26 } },
      { id: 'p-1602', brand: 'Passion', name: 'Weatherproof Chino', price: 129, image: 'assets/products/p-402.svg', pin: { x: 40, y: 60 } },
    ],
  },
  {
    id: 'look-17',
    title: 'Neon Pulse',
    model: 'assets/models/model17.png',
    alt: 'Model in look 17',
    feetOffset: 0,
    products: [
      { id: 'p-1701', brand: 'Passion', name: 'Graphic Accent Tee', price: 75,  image: 'assets/products/p-501.svg', pin: { x: 50, y: 26 } },
      { id: 'p-1702', brand: 'Passion', name: 'Dark Cargo Pant',    price: 159, image: 'assets/products/p-502.svg', pin: { x: 40, y: 60 } },
    ],
  },
  {
    id: 'look-18',
    title: 'Grand Finale',
    model: 'assets/models/model18.png',
    alt: 'Model in look 18',
    feetOffset: 0,
    products: [
      { id: 'p-1801', brand: 'Passion', name: 'Signature Overcoat', price: 320, image: 'assets/products/p-601.svg', pin: { x: 50, y: 26 } },
      { id: 'p-1802', brand: 'Passion', name: 'Formal Cashmere Pant', price: 180, image: 'assets/products/p-602.svg', pin: { x: 40, y: 60 } },
    ],
  },
];
