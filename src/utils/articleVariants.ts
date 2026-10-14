import { Product } from '../types';

export interface ColorDef {
  name: string;
  hex: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
}

export const COLOR_REGISTRY: Record<number, ColorDef> = {
  1: { name: 'Black', hex: '#000000', textClass: 'text-white', bgClass: 'bg-black', borderClass: 'border-zinc-850', badgeClass: 'bg-black text-white border-zinc-700' },
  2: { name: 'Brown', hex: '#7C4B27', textClass: 'text-white', bgClass: 'bg-[#7C4B27]', borderClass: 'border-amber-850', badgeClass: 'bg-[#7C4B27] text-white border-[#5a3317]' },
  3: { name: 'Tan', hex: '#B87333', textClass: 'text-white', bgClass: 'bg-[#B87333]', borderClass: 'border-amber-700', badgeClass: 'bg-[#B87333] text-white border-[#91541c]' },
  4: { name: 'White', hex: '#FFFFFF', textClass: 'text-zinc-800', bgClass: 'bg-white', borderClass: 'border-zinc-300', badgeClass: 'bg-white text-zinc-800 border-zinc-350' },
  5: { name: 'Cherry', hex: '#7A1C1C', textClass: 'text-white', bgClass: 'bg-[#7A1C1C]', borderClass: 'border-rose-900', badgeClass: 'bg-[#7A1C1C] text-white border-[#5a1111]' },
  6: { name: 'Olive', hex: '#556B2F', textClass: 'text-white', bgClass: 'bg-[#556B2F]', borderClass: 'border-lime-900', badgeClass: 'bg-[#556B2F] text-white border-[#3e4f22]' },
  7: { name: 'Navy', hex: '#1D2A44', textClass: 'text-white', bgClass: 'bg-[#1D2A44]', borderClass: 'border-indigo-950', badgeClass: 'bg-[#1D2A44] text-white border-[#121c2f]' },
  8: { name: 'Grey', hex: '#6B7280', textClass: 'text-white', bgClass: 'bg-zinc-500', borderClass: 'border-zinc-600', badgeClass: 'bg-zinc-500 text-white border-zinc-600' },
  9: { name: 'Malive', hex: '#9333EA', textClass: 'text-white', bgClass: 'bg-purple-600', borderClass: 'border-purple-800', badgeClass: 'bg-purple-600 text-white border-purple-700' },
  10: { name: 'Maroon', hex: '#800000', textClass: 'text-white', bgClass: 'bg-red-900', borderClass: 'border-red-950', badgeClass: 'bg-red-900 text-white border-red-950' },
  11: { name: 'Green', hex: '#10B981', textClass: 'text-white', bgClass: 'bg-emerald-600', borderClass: 'border-emerald-800', badgeClass: 'bg-emerald-600 text-white border-emerald-700' },
  12: { name: 'Blue', hex: '#2563EB', textClass: 'text-white', bgClass: 'bg-blue-600', borderClass: 'border-blue-800', badgeClass: 'bg-blue-600 text-white border-blue-700' },
  13: { name: 'Yellow', hex: '#F59E0B', textClass: 'text-zinc-900', bgClass: 'bg-amber-500', borderClass: 'border-amber-700', badgeClass: 'bg-amber-500 text-zinc-900 border-amber-600' },
  14: { name: 'Beige', hex: '#D4B996', textClass: 'text-zinc-900', bgClass: 'bg-[#D4B996]', borderClass: 'border-amber-300', badgeClass: 'bg-[#D4B996] text-zinc-900 border-amber-300' },
  15: { name: 'Pink', hex: '#EC4899', textClass: 'text-white', bgClass: 'bg-pink-600', borderClass: 'border-pink-800', badgeClass: 'bg-pink-600 text-white border-pink-700' }
};

export const COMMON_COLOR_HEXES: Record<string, string> = {
  black: '#000000',
  brown: '#7C4B27',
  tan: '#B87333',
  's brown': '#6E4723',
  'drk/brown': '#5A3317',
  'dark brown': '#5A3317',
  'light brown': '#9C6644',
  white: '#FFFFFF',
  cherry: '#7A1C1C',
  olive: '#556B2F',
  navy: '#1D2A44',
  'navy blue': '#1D2A44',
  blue: '#3B82F6',
  'royal blue': '#1E40AF',
  grey: '#6B7280',
  gray: '#6B7280',
  green: '#10B981',
  'olive green': '#556B2F',
  red: '#EF4444',
  maroon: '#800000',
  yellow: '#F59E0B',
  mustard: '#D97706',
  orange: '#F97316',
  beige: '#F5F5DC',
  cream: '#FFFDD0',
  pink: '#EC4899',
  purple: '#8B5CF6',
  malive: '#9333EA',
  lavender: '#A855F7',
  gold: '#D97706',
  silver: '#D1D5DB'
};

export function getHexFromColorName(name: string): string {
  if (!name) return '#6B7280';
  const norm = name.toLowerCase().trim();
  if (COMMON_COLOR_HEXES[norm]) return COMMON_COLOR_HEXES[norm];

  for (const [k, hex] of Object.entries(COMMON_COLOR_HEXES)) {
    if (norm.includes(k)) return hex;
  }
  return '#6B7280';
}

export const getColorDef = (cid: number | string, product?: Product): ColorDef => {
  const strId = String(cid || '').trim();
  if (!strId) {
    return { name: 'Standard', hex: '#6B7280', textClass: 'text-white', bgClass: 'bg-zinc-500', borderClass: 'border-zinc-600', badgeClass: 'bg-zinc-500 text-white' };
  }

  // 1. Check customColorMap on product
  if (product?.customColorMap) {
    if (product.customColorMap[strId]) return product.customColorMap[strId];
    const lowerKey = Object.keys(product.customColorMap).find(k => k.toLowerCase() === strId.toLowerCase());
    if (lowerKey && product.customColorMap[lowerKey]) return product.customColorMap[lowerKey];
  }

  // 2. Check numeric registry
  const numId = Number(strId);
  if (!isNaN(numId) && COLOR_REGISTRY[numId]) {
    return COLOR_REGISTRY[numId];
  }

  // 3. Check registry by name
  const lowerName = strId.toLowerCase();
  for (const regKey of Object.keys(COLOR_REGISTRY)) {
    const def = COLOR_REGISTRY[Number(regKey)];
    if (def && def.name.toLowerCase() === lowerName) {
      return def;
    }
  }

  // 4. Fallback using color hex map
  const hex = getHexFromColorName(strId);
  return {
    name: strId,
    hex,
    textClass: hex === '#FFFFFF' ? 'text-zinc-900' : 'text-white',
    bgClass: 'bg-zinc-700',
    borderClass: 'border-zinc-600',
    badgeClass: 'bg-zinc-700 text-white'
  };
};

/**
 * Extract clean, normalized article code from product (e.g. "W5687", "WAL8839", "1045", "PAR9045")
 */
export function extractArticleCode(product?: Partial<Product> | null): string {
  if (!product) return '';
  const raw = String(
    product.articleCode ||
    product.rawArticleCode ||
    product.barcode ||
    product.id ||
    ''
  ).trim();

  if (!raw) return '';

  // Clean common prefixes and suffixes
  let clean = raw.replace(/^[#\-_/]+/, '').trim().toUpperCase();

  // If ID like "WL-W5687-BRN" or "WAL-WAL8839", strip brand prefix or color suffix if present
  if (clean.includes('-')) {
    const parts = clean.split('-').filter(Boolean);
    // If format is PREFIX-ARTICLE-COLOR (e.g. WL-W5687-BLK), return middle or prefix-middle
    if (parts.length >= 3) {
      const last = parts[parts.length - 1].toLowerCase();
      if (COMMON_COLOR_HEXES[last] || ['blk', 'brn', 'tan', 'wht', 'grn', 'blu', 'red', 'gry'].includes(last)) {
        return parts.slice(0, parts.length - 1).join('-');
      }
    }
  }

  return clean;
}

/**
 * Extract base product name stripped of explicit color suffixes
 * e.g. "Walkaroo Classic Sandal - Tan" -> "Walkaroo Classic Sandal"
 */
export function getBaseArticleName(product?: Partial<Product> | null): string {
  if (!product || !product.name) return '';
  let name = product.name.trim();

  // Strip trailing color mentions like " - Tan", " (Brown)", " [Black]"
  name = name.replace(/\s*[-–/|]\s*(Black|Brown|Tan|White|Cherry|Olive|Navy|Grey|Green|Red|Blue|Maroon|Beige|Cream|Gold|Silver|DRK\/BROWN|S BROWN)\s*$/i, '');
  name = name.replace(/\s*\((Black|Brown|Tan|White|Cherry|Olive|Navy|Grey|Green|Red|Blue|Maroon|Beige|Cream|Gold|Silver|DRK\/BROWN|S BROWN)\)\s*$/i, '');
  name = name.replace(/\s*\[(Black|Brown|Tan|White|Cherry|Olive|Navy|Grey|Green|Red|Blue|Maroon|Beige|Cream|Gold|Silver|DRK\/BROWN|S BROWN)\]\s*$/i, '');

  return name.trim();
}

/**
 * Detect the primary color of a product item (from colorName, title, customColorMap, or colors)
 */
export function detectProductPrimaryColor(product: Product): { name: string; hex: string; id: string | number } {
  // 1. Explicit colorName or colorHex
  if (product.colorName && product.colorName.trim()) {
    const name = product.colorName.trim();
    const hex = product.colorHex || getHexFromColorName(name);
    return { name, hex, id: name };
  }

  // 2. Check product name for embedded color
  const prodName = product.name || '';
  const colorWords = [
    'DRK/BROWN', 'S BROWN', 'Dark Brown', 'Light Brown', 'Navy Blue', 'Olive Green',
    'Black', 'Brown', 'Tan', 'White', 'Cherry', 'Olive', 'Navy', 'Grey', 'Gray',
    'Green', 'Red', 'Blue', 'Maroon', 'Beige', 'Cream', 'Pink', 'Purple', 'Orange', 'Yellow'
  ];

  for (const cw of colorWords) {
    const regex = new RegExp(`\\b${cw.replace('/', '\\/')}\\b`, 'i');
    if (regex.test(prodName)) {
      return { name: cw, hex: getHexFromColorName(cw), id: cw };
    }
  }

  // 3. First key in customColorMap
  if (product.customColorMap && Object.keys(product.customColorMap).length > 0) {
    const firstKey = Object.keys(product.customColorMap)[0];
    const def = product.customColorMap[firstKey];
    return { name: def.name || firstKey, hex: def.hex || getHexFromColorName(firstKey), id: firstKey };
  }

  // 4. First color in colors array
  if (Array.isArray(product.colors) && product.colors.length > 0) {
    const def = getColorDef(product.colors[0], product);
    return { name: def.name, hex: def.hex, id: product.colors[0] };
  }

  // 5. First key in sizeColorStock
  if (product.sizeColorStock) {
    for (const sizeMap of Object.values(product.sizeColorStock)) {
      if (sizeMap && Object.keys(sizeMap).length > 0) {
        const firstCid = Object.keys(sizeMap)[0];
        const def = getColorDef(firstCid, product);
        return { name: def.name, hex: def.hex, id: firstCid };
      }
    }
  }

  return { name: 'Standard', hex: '#6B7280', id: 1 };
}

/**
 * Find all sibling products in the catalogue that belong to the SAME footwear article
 */
export function getArticleSiblingProducts(targetProduct: Product, allProducts: Product[]): Product[] {
  if (!targetProduct) return [];
  if (!Array.isArray(allProducts) || allProducts.length === 0) return [targetProduct];

  const targetArt = extractArticleCode(targetProduct).toLowerCase();
  const targetBaseName = getBaseArticleName(targetProduct).toLowerCase();
  const targetBrand = (targetProduct.brand || '').toLowerCase().trim();
  const targetCat = (targetProduct.category || '').toLowerCase().trim();

  const siblings: Product[] = [];
  const seenIds = new Set<string>();

  // Always include targetProduct
  siblings.push(targetProduct);
  seenIds.add(targetProduct.id);

  for (const p of allProducts) {
    if (!p || seenIds.has(p.id)) continue;

    const pBrand = (p.brand || '').toLowerCase().trim();
    const pCat = (p.category || '').toLowerCase().trim();
    const pArt = extractArticleCode(p).toLowerCase();
    const pBaseName = getBaseArticleName(p).toLowerCase();

    let isMatch = false;

    // Match 1: Exact matching non-empty Article Code within same Brand
    if (targetArt && pArt && targetArt === pArt && (!targetBrand || !pBrand || targetBrand === pBrand)) {
      isMatch = true;
    }

    // Match 2: Matching Base Article Name + Brand + Category
    if (!isMatch && targetBaseName && pBaseName && targetBaseName === pBaseName && targetBrand === pBrand && targetCat === pCat) {
      isMatch = true;
    }

    // Match 3: Matching ID root (e.g. WL-W5687 vs WL-W5687-BLK)
    if (!isMatch && targetProduct.id && p.id) {
      const root1 = targetProduct.id.replace(/[-_](blk|brn|tan|wht|grn|blu|red|gry|black|brown|tan|white).*$/i, '');
      const root2 = p.id.replace(/[-_](blk|brn|tan|wht|grn|blu|red|gry|black|brown|tan|white).*$/i, '');
      if (root1 && root2 && root1.toLowerCase() === root2.toLowerCase()) {
        isMatch = true;
      }
    }

    if (isMatch) {
      seenIds.add(p.id);
      siblings.push(p);
    }
  }

  return siblings;
}

export interface ArticleColorVariant {
  colorId: number | string;
  colorName: string;
  colorHex: string;
  product: Product;
  isDirectProduct: boolean; // True if this variant corresponds to a separate Product record
  imageUrl: string;
  imageUrls: string[];
  stockInSelectedSize: number;
  isAvailableInSelectedSize: boolean;
  availableSizes: number[];
  price: number;
  mrp?: number;
  isCurrent: boolean;
}

/**
 * Returns all available color variants for a footwear article across sibling products and internal color stock.
 * Evaluates stock availability dynamically for the specified size.
 */
export function getArticleAllColorVariants(
  targetProduct: Product,
  allProducts: Product[],
  selectedSize?: number | null,
  activeColorId?: number | string | null
): ArticleColorVariant[] {
  if (!targetProduct) return [];

  const siblings = getArticleSiblingProducts(targetProduct, allProducts);
  const variants: ArticleColorVariant[] = [];
  const seenColorKeys = new Set<string>();

  // Process all sibling products
  for (const sibling of siblings) {
    const isTarget = sibling.id === targetProduct.id;
    const allowedColors = sibling.colors && sibling.colors.length > 0 ? sibling.colors.map(String) : null;

    // Check if sibling has internal sizeColorStock with multiple colors
    const hasSizeColorStock = sibling.sizeColorStock && Object.keys(sibling.sizeColorStock).length > 0;

    if (hasSizeColorStock && sibling.sizeColorStock) {
      // Extract all unique color IDs present in this sibling
      const internalColorIds = new Set<string | number>();

      if (selectedSize) {
        const mapForSize = sibling.sizeColorStock[String(selectedSize)];
        if (mapForSize) {
          Object.entries(mapForSize).forEach(([cidStr, qty]) => {
            if (Number(qty) > 0 && (!allowedColors || allowedColors.includes(String(cidStr)))) {
              const num = Number(cidStr);
              internalColorIds.add(!isNaN(num) ? num : cidStr);
            }
          });
        }
      }

      // If no size or no colors found for specific size, gather across all sizes
      if (internalColorIds.size === 0) {
        Object.values(sibling.sizeColorStock).forEach((szMap) => {
          if (szMap) {
            Object.entries(szMap).forEach(([cidStr, qty]) => {
              if (Number(qty) > 0 && (!allowedColors || allowedColors.includes(String(cidStr)))) {
                const num = Number(cidStr);
                internalColorIds.add(!isNaN(num) ? num : cidStr);
              }
            });
          }
        });
      }

      // If internal color IDs exist in this sibling product
      if (internalColorIds.size > 0) {
        for (const cid of internalColorIds) {
          const cDef = getColorDef(cid, sibling);
          const colorKey = `${cDef.name.trim().toLowerCase()}_${cDef.hex.toLowerCase()}`;

          if (seenColorKeys.has(colorKey)) continue;
          seenColorKeys.add(colorKey);

          // Calculate stock in selected size
          let stockInSize = 0;
          let availableSizes: number[] = [];

          if (selectedSize) {
            const mapForSize = sibling.sizeColorStock[String(selectedSize)];
            stockInSize = mapForSize ? (Number(mapForSize[String(cid)]) || Number(mapForSize[cDef.name]) || 0) : 0;
          } else {
            stockInSize = sibling.stock;
          }

          // Compute all sizes where this color is in stock
          if (Array.isArray(sibling.sizes)) {
            availableSizes = sibling.sizes.filter((sz) => {
              const szMap = sibling.sizeColorStock?.[String(sz)];
              if (!szMap) return false;
              const q = Number(szMap[String(cid)]) || Number(szMap[cDef.name]) || 0;
              return q > 0;
            });
          }

          const isCurrent = isTarget && (activeColorId === null || activeColorId === undefined || String(activeColorId).toLowerCase() === String(cid).toLowerCase());

          variants.push({
            colorId: cid,
            colorName: cDef.name,
            colorHex: cDef.hex,
            product: sibling,
            isDirectProduct: siblings.length > 1,
            imageUrl: sibling.imageUrl,
            imageUrls: sibling.imageUrls && sibling.imageUrls.length > 0 ? sibling.imageUrls : [sibling.imageUrl],
            stockInSelectedSize: stockInSize,
            isAvailableInSelectedSize: stockInSize > 0,
            availableSizes,
            price: sibling.price,
            mrp: (sibling as any).mrp || (sibling as any).originalPrice,
            isCurrent
          });
        }
        continue;
      }
    }

    // Otherwise, treat this sibling as a single-color product variant
    const primaryColor = detectProductPrimaryColor(sibling);
    const colorKey = `${primaryColor.name.trim().toLowerCase()}_${primaryColor.hex.toLowerCase()}`;

    if (seenColorKeys.has(colorKey)) continue;
    seenColorKeys.add(colorKey);

    let stockInSize = sibling.stock;
    let isAvailableInSize = sibling.stock > 0;

    if (selectedSize) {
      if (sibling.sizeStock && String(selectedSize) in sibling.sizeStock) {
        stockInSize = Number(sibling.sizeStock[String(selectedSize)]) || 0;
      } else if (Array.isArray(sibling.sizes)) {
        stockInSize = sibling.sizes.includes(selectedSize) ? sibling.stock : 0;
      } else {
        stockInSize = 0;
      }
      isAvailableInSize = stockInSize > 0;
    }

    const isCurrent = isTarget;

    variants.push({
      colorId: primaryColor.id,
      colorName: primaryColor.name,
      colorHex: primaryColor.hex,
      product: sibling,
      isDirectProduct: true,
      imageUrl: sibling.imageUrl,
      imageUrls: sibling.imageUrls && sibling.imageUrls.length > 0 ? sibling.imageUrls : [sibling.imageUrl],
      stockInSelectedSize: stockInSize,
      isAvailableInSelectedSize: isAvailableInSize,
      availableSizes: sibling.sizes || [],
      price: sibling.price,
      mrp: (sibling as any).mrp || (sibling as any).originalPrice,
      isCurrent
    });
  }

  // Sort variants so current variant is first, or available ones are highlighted
  return variants;
}
