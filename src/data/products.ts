import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // --- MEN ---
  {
    id: 'WL-W5687',
    name: 'Walkaroo Classic Official Sandal',
    brand: 'Walkaroo',
    category: 'Men',
    subCategory: 'Office Wear',
    sizes: [6, 7, 8, 9, 10],
    price: 330,
    description: 'Walkaroo Classic Official Sandal with ergonomic cushioned sole and durable straps.',
    imageUrl: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&auto=format&fit=crop&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80'
    ],
    stock: 60,
    customColorMap: {
      'Brown': { name: 'Brown', hex: '#7C4B27', textClass: 'text-white', bgClass: 'bg-[#7C4B27]', borderClass: 'border-amber-900', badgeClass: 'bg-[#7C4B27] text-white' },
      'Tan': { name: 'Tan', hex: '#B87333', textClass: 'text-white', bgClass: 'bg-[#B87333]', borderClass: 'border-amber-700', badgeClass: 'bg-[#B87333] text-white' },
      'DRK/BROWN': { name: 'DRK/BROWN', hex: '#5A3317', textClass: 'text-white', bgClass: 'bg-[#5A3317]', borderClass: 'border-amber-950', badgeClass: 'bg-[#5A3317] text-white' },
      'S BROWN': { name: 'S BROWN', hex: '#6E4723', textClass: 'text-white', bgClass: 'bg-[#6E4723]', borderClass: 'border-amber-900', badgeClass: 'bg-[#6E4723] text-white' },
      'GREEN': { name: 'GREEN', hex: '#10B981', textClass: 'text-white', bgClass: 'bg-[#10B981]', borderClass: 'border-emerald-700', badgeClass: 'bg-[#10B981] text-white' }
    },
    sizeColorStock: {
      '6': { 'Brown': 11, 'Tan': 11, 'DRK/BROWN': 15, 'S BROWN': 11, 'GREEN': 12 },
      '7': { 'Brown': 11, 'Tan': 11, 'DRK/BROWN': 15, 'S BROWN': 11, 'GREEN': 12 },
      '8': { 'Brown': 11, 'Tan': 11, 'DRK/BROWN': 15, 'S BROWN': 11, 'GREEN': 12 },
      '9': { 'Brown': 11, 'Tan': 11, 'DRK/BROWN': 15, 'S BROWN': 11, 'GREEN': 12 },
      '10': { 'Brown': 11, 'Tan': 11, 'DRK/BROWN': 15, 'S BROWN': 11, 'GREEN': 12 }
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'WAL-WAL8839',
    name: 'Monarch Leather Glider',
    brand: 'Walkmate',
    category: 'Men',
    subCategory: 'Sandals',
    sizes: [7, 8, 9, 10, 11],
    price: 85,
    description: 'Crafted with top-grain distressed leather, dual adjustable brass buckles, and an ergonomic cork footbed that molds to your stride.',
    imageUrl: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&auto=format&fit=crop&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop&q=80'
    ],
    stock: 18,
    createdAt: new Date().toISOString()
  },
  {
    id: 'BAR-BAR1012',
    name: 'Urban Suede Loafer',
    brand: 'Bairathi',
    category: 'Men',
    subCategory: 'Casuals',
    sizes: [6, 7, 8, 9, 10, 11, 12],
    price: 95,
    description: 'Ultra-flexible waxed suede loafers with premium whipstitching and rubber pod outsoles for versatile style and supreme comfort.',
    imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&auto=format&fit=crop&q=80'
    ],
    stock: 30,
    createdAt: new Date().toISOString()
  },
  {
    id: 'PAR-PAR9045',
    name: 'AeroGlide Knit Runner',
    brand: 'Paragon',
    category: 'Men',
    subCategory: 'Shoes',
    sizes: [8, 9, 10, 11, 12],
    price: 110,
    description: 'Engineered breathable knit upper with dynamic carbon-plate responsive cushioning for effortless strides and high-intensity performance.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80'
    ],
    stock: 40,
    createdAt: new Date().toISOString()
  },
  {
    id: 'IND-IND2032',
    name: 'Sovereign Chelsea Boot',
    brand: 'Indus',
    category: 'Men',
    subCategory: 'Others',
    sizes: [7, 8, 9, 10, 11, 12],
    price: 140,
    description: 'Water-resistant premium suede chelsea boots with elasticized side goring and heavy-duty Goodyear welted rubber soles.',
    imageUrl: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&auto=format&fit=crop&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&auto=format&fit=crop&q=80'
    ],
    stock: 15,
    createdAt: new Date().toISOString()
  },

  // --- WOMEN ---
  {
    id: 'YO-YO4955',
    name: 'Verona Leather Pump',
    brand: 'Yono',
    category: 'Women',
    subCategory: 'Office Wear',
    sizes: [5, 6, 7, 8, 9, 10, 11],
    price: 115,
    description: 'Timeless professional pumps featuring block heels, supportive memory-foam insoles, and premium Italian patent leather.',
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=600&auto=format&fit=crop&q=80'
    ],
    stock: 20,
    createdAt: new Date().toISOString()
  },
  {
    id: 'WL-WL3210',
    name: 'Athena Strappy Sling',
    brand: 'Walkaroo',
    category: 'Women',
    subCategory: 'Sandals',
    sizes: [5, 6, 7, 8, 9, 10],
    price: 75,
    description: 'Sleek, multi-strap gladiator-style sandals with fine-brushed gold buckles and a soft cushioned suede wrapping.',
    imageUrl: 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=600&auto=format&fit=crop&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80'
    ],
    stock: 22,
    createdAt: new Date().toISOString()
  },
  {
    id: 'WAL-WAL4456',
    name: 'Stella Velvet Slip-On',
    brand: 'Walkmate',
    category: 'Women',
    subCategory: 'Casuals',
    sizes: [5, 6, 7, 8, 9, 10, 11],
    price: 80,
    description: 'Plush velvet casual flats with a modern pointed toe and lightweight, flexible soles ideal for effortless everyday wear.',
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80'
    ],
    stock: 28,
    createdAt: new Date().toISOString()
  },
  {
    id: 'BAR-BAR7789',
    name: 'Nimbus Cloud Platform Sneaker',
    brand: 'Bairathi',
    category: 'Women',
    subCategory: 'Shoes',
    sizes: [6, 7, 8, 9, 10, 11],
    price: 105,
    description: 'Bold triple-white platform sneakers with premium pebble grain leather overlays and an elevated lightweight foam midsole.',
    imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80'
    ],
    stock: 35,
    createdAt: new Date().toISOString()
  },
  {
    id: 'PAR-PAR1120',
    name: 'Isla Waterproof Ankle Boot',
    brand: 'Paragon',
    category: 'Women',
    subCategory: 'Others',
    sizes: [5, 6, 7, 8, 9, 10, 11],
    price: 135,
    description: 'Waterproof seam-sealed full leather ankle boots with sturdy block heels, rubber lugged traction, and cozy fleece lining.',
    imageUrl: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&auto=format&fit=crop&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&auto=format&fit=crop&q=80'
    ],
    stock: 12,
    createdAt: new Date().toISOString()
  },

  // --- KIDS ---
  {
    id: 'IND-IND6630',
    name: 'Junior Scholars Derby',
    brand: 'Indus',
    category: 'Kids',
    subCategory: 'Office Wear',
    sizes: [6, 7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4],
    price: 65,
    description: 'Smart formal dress shoes for kids. Highly durable scuff-resistant action leather with padded collars for pain-free wear.',
    imageUrl: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&auto=format&fit=crop&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1519417688547-61e5d5338ad4?w=600&auto=format&fit=crop&q=80'
    ],
    stock: 15,
    createdAt: new Date().toISOString()
  },
  {
    id: 'YO-YO7080',
    name: 'Adventure Active Strap',
    brand: 'Yono',
    category: 'Kids',
    subCategory: 'Sandals',
    sizes: [6, 7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4],
    price: 45,
    description: 'All-terrain kids sports sandals with triple hook-and-loop straps, quick-drying neoprene lining, and rubber toe guards.',
    imageUrl: 'https://images.unsplash.com/photo-1519417688547-61e5d5338ad4?w=600&auto=format&fit=crop&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1515645145882-397231a7bc1d?w=600&auto=format&fit=crop&q=80'
    ],
    stock: 24,
    createdAt: new Date().toISOString()
  },
  {
    id: 'WL-WL9945',
    name: 'Playground Canvas Loafer',
    brand: 'Walkaroo',
    category: 'Kids',
    subCategory: 'Casuals',
    sizes: [6, 7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4],
    price: 40,
    description: 'Lightweight canvas slip-on loafers featuring elastic side goring and non-slip flexible vulcanized rubber outsoles.',
    imageUrl: 'https://images.unsplash.com/photo-1515645145882-397231a7bc1d?w=600&auto=format&fit=crop&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&auto=format&fit=crop&q=80'
    ],
    stock: 32,
    createdAt: new Date().toISOString()
  },
  {
    id: 'WAL-WAL1515',
    name: 'Speedster Light-Up Trainer',
    brand: 'Walkmate',
    category: 'Kids',
    subCategory: 'Shoes',
    sizes: [8, 9, 10, 11, 12, 13, 1, 2, 3, 4],
    price: 55,
    description: 'Vibrant sneakers with impact-activated LED lighting, mesh ventilation paneling, and an adjustable strap closure.',
    imageUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&auto=format&fit=crop&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1608256246200-53e635b5538f?w=600&auto=format&fit=crop&q=80'
    ],
    stock: 45,
    createdAt: new Date().toISOString()
  },
  {
    id: 'BAR-BAR6320',
    name: 'RainyDay Yellow Wellies',
    brand: 'Bairathi',
    category: 'Kids',
    subCategory: 'Others',
    sizes: [6, 7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4],
    price: 48,
    description: 'Glossy 100% natural rubber rain boots with easy-on handles, playful design, and a high-traction tread for muddy fun.',
    imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5538f?w=600&auto=format&fit=crop&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&auto=format&fit=crop&q=80'
    ],
    stock: 20,
    createdAt: new Date().toISOString()
  }
];
