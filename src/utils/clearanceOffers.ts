import { Product, Category } from '../types';
import { isProductAvailableInSize, getSizePairCount } from '../components/ProductSection';

export const CLEARANCE_OFFERS_STORAGE_KEY = 'prashant_product_clearance_offers';
export const CLEARANCE_OFFERS_EVENT = 'prashant_clearance_offers_updated';

export interface ClearanceOfferPair {
  id: string;
  productId: string;
  product: Product;
  originalPrice: number;
  offerPrice: number;
  discountPercentage: number;
  badgeTag: string;
  stockPairsInSize: number;
  note: string;
  isDeadStock?: boolean;
  clearanceReason?: string;
}

export const DEFAULT_CLEARANCE_DEALS = [
  {
    id: 'clr-001',
    productId: 'PAR-PAR9045',
    category: 'Men',
    mrp: 1499,
    discountPercentage: 40,
    offerPrice: 899,
    badgeTag: '40% DEAD STOCK CLEARANCE',
    note: 'Stored > 6 months in warehouse. 40% liquidation discount to clear stock.',
    source: 'dead_stock',
    status: 'active',
    stockAgeDays: 210
  },
  {
    id: 'clr-002',
    productId: 'WAL-WAL8839',
    category: 'Men',
    mrp: 1299,
    discountPercentage: 30,
    offerPrice: 909,
    badgeTag: '30% WAREHOUSE CLEARANCE',
    note: 'Special clearance offer on unsold stock.',
    source: 'dead_stock',
    status: 'active',
    stockAgeDays: 195
  },
  {
    id: 'clr-003',
    productId: 'BAR-BAR1012',
    category: 'Men',
    mrp: 999,
    discountPercentage: 50,
    offerPrice: 499,
    badgeTag: '50% MEGA CLEARANCE',
    note: 'Ethnic footwear inventory liquidation.',
    source: 'dead_stock',
    status: 'active',
    stockAgeDays: 240
  },
  {
    id: 'clr-004',
    productId: 'YO-YO4955',
    category: 'Women',
    mrp: 1199,
    discountPercentage: 45,
    offerPrice: 659,
    badgeTag: '45% ATELIER CLEARANCE',
    note: 'Designer inventory clearance to make room for new collection.',
    source: 'dead_stock',
    status: 'active',
    stockAgeDays: 200
  },
  {
    id: 'clr-005',
    productId: 'WL-WL3210',
    category: 'Women',
    mrp: 899,
    discountPercentage: 35,
    offerPrice: 584,
    badgeTag: '35% WAREHOUSE LIQUIDATION',
    note: 'Final batch stock liquidation. Fast clearance price.',
    source: 'dead_stock',
    status: 'active',
    stockAgeDays: 190
  }
];

export const getClearanceOfferPairs = (
  allProducts: Product[],
  category?: Category | string | null,
  size?: number | string | null
): ClearanceOfferPair[] => {
  if (!allProducts || allProducts.length === 0) return [];

  // 1. Load active deals from localStorage
  let activeDeals: any[] = [];
  try {
    const cached = localStorage.getItem(CLEARANCE_OFFERS_STORAGE_KEY);
    if (cached !== null) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        activeDeals = parsed;
      }
    } else {
      activeDeals = DEFAULT_CLEARANCE_DEALS;
    }
  } catch (e) {
    activeDeals = DEFAULT_CLEARANCE_DEALS;
  }

  // If there are no configured active deals, return empty array (do not inject unwanted products)
  if (!activeDeals || activeDeals.length === 0) {
    return [];
  }

  const offerPairs: ClearanceOfferPair[] = [];
  const addedProductIds = new Set<string>();

  // 2. Map strictly from the active configured deals
  for (const deal of activeDeals) {
    if (deal.status === 'inactive' || deal.status === 'paused') continue;

    // Find product in catalog
    const prod = allProducts.find(
      (p) =>
        (deal.productId && p.id && p.id.toLowerCase() === deal.productId.toLowerCase()) ||
        (deal.productId && p.barcode && p.barcode.toLowerCase() === deal.productId.toLowerCase()) ||
        (deal.productName && p.name && p.name.toLowerCase() === deal.productName.toLowerCase())
    );

    if (!prod) continue;
    if (addedProductIds.has(prod.id)) continue;

    // Apply category filter if specified and not 'All'
    if (
      category &&
      typeof category === 'string' &&
      category.trim().toLowerCase() !== 'all' &&
      category.trim() !== ''
    ) {
      if (prod.category && prod.category.toLowerCase() !== category.trim().toLowerCase()) {
        continue;
      }
    }

    // Apply size availability filter if specified and not 'all'
    if (
      size !== undefined &&
      size !== null &&
      size !== 'all' &&
      size !== 'All' &&
      String(size).trim() !== ''
    ) {
      const numericSize = Number(size);
      if (!isNaN(numericSize) && numericSize > 0) {
        if (!isProductAvailableInSize(prod, numericSize)) {
          continue;
        }
      }
    }

    addedProductIds.add(prod.id);

    const discountPct =
      deal.discountPercentage !== undefined && deal.discountPercentage !== null
        ? Number(deal.discountPercentage)
        : 30;
    const originalPrice = Number(deal.mrp) || prod.price || 999;
    const offerPrice =
      deal.offerPrice !== undefined && deal.offerPrice !== null
        ? Number(deal.offerPrice)
        : Math.max(1, Math.round(originalPrice * (1 - discountPct / 100)));
    const stockInSize =
      size && size !== 'all' && size !== 'All' && !isNaN(Number(size))
        ? (getSizePairCount(prod, Number(size)) || prod.stock || 1)
        : (prod.stock || 1);

    const isDead =
      deal.source === 'dead_stock' ||
      (deal.stockAgeDays !== undefined && deal.stockAgeDays >= 180);

    offerPairs.push({
      id: deal.id || `clr-${prod.id}`,
      productId: prod.id,
      product: prod,
      originalPrice,
      offerPrice,
      discountPercentage: discountPct,
      badgeTag:
        deal.badgeTag ||
        (isDead
          ? `DEAD STOCK CLEARANCE (${discountPct}% OFF)`
          : `SPECIAL OFFER (${discountPct}% OFF)`),
      stockPairsInSize: stockInSize,
      note:
        deal.note ||
        `Special offer deal${size && size !== 'all' ? ` for size UK/IN ${size}` : ''} at ₹${offerPrice} (${discountPct}% OFF).`,
      isDeadStock: isDead,
      clearanceReason: isDead ? 'Dead Stock Liquidation' : 'Special Offer Deal'
    });
  }

  return offerPairs;
};

export const getManagedProductOffers = (): any[] => {
  try {
    const cached = localStorage.getItem(CLEARANCE_OFFERS_STORAGE_KEY);
    if (cached !== null) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {}
  return DEFAULT_CLEARANCE_DEALS;
};

export const getTopOfferProductsList = (
  allProducts: Product[],
  category?: Category | null,
  size?: number | null
): ClearanceOfferPair[] => {
  return getClearanceOfferPairs(allProducts, category, size);
};

