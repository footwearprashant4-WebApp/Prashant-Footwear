import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // --- MEN ---
  {
    id: 'men-office-1',
    name: 'Prashant Classic Oxford',
    category: 'Men',
    subCategory: 'Office Wear',
    sizes: [6, 7, 8, 9, 10, 11, 12],
    price: 120,
    description: 'Masterfully crafted from full-grain Italian leather, featuring classic brogue details and a cushioned orthotic sole for ultimate office comfort.',
    imageUrl: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&auto=format&fit=crop&q=80',
    stock: 25,
    createdAt: new Date().toISOString()
  },
  {
    id: 'men-sandals-1',
    name: 'Monarch Leather Glider',
    category: 'Men',
    subCategory: 'Sandals',
    sizes: [7, 8, 9, 10, 11],
    price: 85,
    description: 'Crafted with top-grain distressed leather, dual adjustable brass buckles, and an ergonomic cork footbed that molds to your stride.',
    imageUrl: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&auto=format&fit=crop&q=80',
    stock: 18,
    createdAt: new Date().toISOString()
  },
  {
    id: 'men-casuals-1',
    name: 'Urban Suede Loafer',
    category: 'Men',
    subCategory: 'Casuals',
    sizes: [6, 7, 8, 9, 10, 11, 12],
    price: 95,
    description: 'Ultra-flexible waxed suede loafers with premium whipstitching and rubber pod outsoles for versatile style and supreme comfort.',
    imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop&q=80',
    stock: 30,
    createdAt: new Date().toISOString()
  },
  {
    id: 'men-shoes-1',
    name: 'AeroGlide Knit Runner',
    category: 'Men',
    subCategory: 'Shoes',
    sizes: [8, 9, 10, 11, 12],
    price: 110,
    description: 'Engineered breathable knit upper with dynamic carbon-plate responsive cushioning for effortless strides and high-intensity performance.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    stock: 40,
    createdAt: new Date().toISOString()
  },
  {
    id: 'men-others-1',
    name: 'Sovereign Chelsea Boot',
    category: 'Men',
    subCategory: 'Others',
    sizes: [7, 8, 9, 10, 11, 12],
    price: 140,
    description: 'Water-resistant premium suede chelsea boots with elasticized side goring and heavy-duty Goodyear welted rubber soles.',
    imageUrl: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&auto=format&fit=crop&q=80',
    stock: 15,
    createdAt: new Date().toISOString()
  },

  // --- WOMEN ---
  {
    id: 'women-office-1',
    name: 'Verona Leather Pump',
    category: 'Women',
    subCategory: 'Office Wear',
    sizes: [5, 6, 7, 8, 9, 10, 11],
    price: 115,
    description: 'Timeless professional pumps featuring block heels, supportive memory-foam insoles, and premium Italian patent leather.',
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
    stock: 20,
    createdAt: new Date().toISOString()
  },
  {
    id: 'women-sandals-1',
    name: 'Athena Strappy Sling',
    category: 'Women',
    subCategory: 'Sandals',
    sizes: [5, 6, 7, 8, 9, 10],
    price: 75,
    description: 'Sleek, multi-strap gladiator-style sandals with fine-brushed gold buckles and a soft cushioned suede wrapping.',
    imageUrl: 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=600&auto=format&fit=crop&q=80',
    stock: 22,
    createdAt: new Date().toISOString()
  },
  {
    id: 'women-casuals-1',
    name: 'Stella Velvet Slip-On',
    category: 'Women',
    subCategory: 'Casuals',
    sizes: [5, 6, 7, 8, 9, 10, 11],
    price: 80,
    description: 'Plush velvet casual flats with a modern pointed toe and lightweight, flexible soles ideal for effortless everyday wear.',
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
    stock: 28,
    createdAt: new Date().toISOString()
  },
  {
    id: 'women-shoes-1',
    name: 'Nimbus Cloud Platform Sneaker',
    category: 'Women',
    subCategory: 'Shoes',
    sizes: [6, 7, 8, 9, 10, 11],
    price: 105,
    description: 'Bold triple-white platform sneakers with premium pebble grain leather overlays and an elevated lightweight foam midsole.',
    imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80',
    stock: 35,
    createdAt: new Date().toISOString()
  },
  {
    id: 'women-others-1',
    name: 'Isla Waterproof Ankle Boot',
    category: 'Women',
    subCategory: 'Others',
    sizes: [5, 6, 7, 8, 9, 10, 11],
    price: 135,
    description: 'Waterproof seam-sealed full leather ankle boots with sturdy block heels, rubber lugged traction, and cozy fleece lining.',
    imageUrl: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&auto=format&fit=crop&q=80',
    stock: 12,
    createdAt: new Date().toISOString()
  },

  // --- KIDS ---
  {
    id: 'kids-office-1',
    name: 'Junior Scholars Derby',
    category: 'Kids',
    subCategory: 'Office Wear',
    sizes: [6, 7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4],
    price: 65,
    description: 'Smart formal dress shoes for kids. Highly durable scuff-resistant action leather with padded collars for pain-free wear.',
    imageUrl: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&auto=format&fit=crop&q=80',
    stock: 15,
    createdAt: new Date().toISOString()
  },
  {
    id: 'kids-sandals-1',
    name: 'Adventure Active Strap',
    category: 'Kids',
    subCategory: 'Sandals',
    sizes: [6, 7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4],
    price: 45,
    description: 'All-terrain kids sports sandals with triple hook-and-loop straps, quick-drying neoprene lining, and rubber toe guards.',
    imageUrl: 'https://images.unsplash.com/photo-1519417688547-61e5d5338ad4?w=600&auto=format&fit=crop&q=80',
    stock: 24,
    createdAt: new Date().toISOString()
  },
  {
    id: 'kids-casuals-1',
    name: 'Playground Canvas Loafer',
    category: 'Kids',
    subCategory: 'Casuals',
    sizes: [6, 7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4],
    price: 40,
    description: 'Lightweight canvas slip-on loafers featuring elastic side goring and non-slip flexible vulcanized rubber outsoles.',
    imageUrl: 'https://images.unsplash.com/photo-1515645145882-397231a7bc1d?w=600&auto=format&fit=crop&q=80',
    stock: 32,
    createdAt: new Date().toISOString()
  },
  {
    id: 'kids-shoes-1',
    name: 'Speedster Light-Up Trainer',
    category: 'Kids',
    subCategory: 'Shoes',
    sizes: [8, 9, 10, 11, 12, 13, 1, 2, 3, 4],
    price: 55,
    description: 'Vibrant sneakers with impact-activated LED lighting, mesh ventilation paneling, and an adjustable strap closure.',
    imageUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&auto=format&fit=crop&q=80',
    stock: 45,
    createdAt: new Date().toISOString()
  },
  {
    id: 'kids-others-1',
    name: 'RainyDay Yellow Wellies',
    category: 'Kids',
    subCategory: 'Others',
    sizes: [6, 7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4],
    price: 48,
    description: 'Glossy 100% natural rubber rain boots with easy-on handles, playful design, and a high-traction tread for muddy fun.',
    imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5538f?w=600&auto=format&fit=crop&q=80',
    stock: 20,
    createdAt: new Date().toISOString()
  }
];
