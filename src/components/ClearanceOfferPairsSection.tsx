import React from 'react';
import { Product, Category } from '../types';
import { ClearanceOfferPair } from '../utils/clearanceOffers';
import { getColorDef, getAvailableColors } from './ProductSection';
import { HoverZoomImage } from './HoverZoomImage';
import { SwipeableProductThumbnail } from './SwipeableProductThumbnail';
import { Sparkles, ShoppingBag, Eye, Percent, Flame, AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { useProducts, getBrandConfigForProduct } from '../context/ProductContext';

interface ClearanceOfferPairsSectionProps {
  offerPairs: ClearanceOfferPair[];
  category?: Category | null;
  size?: number | null;
  onAddToCart: (product: Product, size: number) => void;
  onSelectProduct: (product: Product) => void;
  isDark: boolean;
  onCategoryChange?: () => void;
  onSizeChange?: () => void;
}

export const ClearanceOfferPairsSection: React.FC<ClearanceOfferPairsSectionProps> = ({
  offerPairs,
  category,
  size,
  onAddToCart,
  onSelectProduct,
  isDark,
}) => {
  const { brandConfigs } = useProducts();

  if (!offerPairs || offerPairs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6 pt-2">
      {/* Clearance Section Header Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
          isDark
            ? 'bg-gradient-to-r from-amber-500/15 via-gold/10 to-zinc-950 border-amber-500/30 shadow-lg shadow-amber-500/5'
            : 'bg-gradient-to-r from-amber-100/80 via-amber-50 to-white border-amber-300 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border flex items-center justify-center shrink-0 ${
              isDark
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-amber-500/15 text-amber-900 border-amber-400/40'
            }`}
          >
            <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest font-black px-2 py-0.5 rounded-full bg-amber-500 text-black shadow-xs">
                TOP ON RECOMMENDATION
              </span>
              <span className={`text-[10px] sm:text-xs font-mono font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                {size ? `• Size UK/IN ${size}` : '• Exclusive Clearance'}{category ? ` (${category})` : ' (All Divisions)'}
              </span>
            </div>
            <h3
              className={`serif-display text-base sm:text-lg md:text-xl font-black uppercase tracking-tight mt-0.5 ${
                isDark ? 'text-white' : 'text-zinc-900'
              }`}
            >
              OFFERS CATALOGUE • Stock Clearance Deals
            </h3>
            <p className={`text-[11px] sm:text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              High-priority stock clearance pairs suggested according to size availability to clear warehouse stock first.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[10px] sm:text-xs font-mono uppercase tracking-wider font-black px-3 py-1.5 rounded-full border ${
              isDark
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}
          >
            {offerPairs.length} {offerPairs.length === 1 ? 'Clearance Deal' : 'Clearance Deals'}
          </span>
        </div>
      </div>

      {/* Recommended Offer Pairs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {offerPairs.map((pair) => {
          const product = pair.product;
          const savings = pair.originalPrice - pair.offerPrice;
          const isLowStock = pair.stockPairsInSize > 0 && pair.stockPairsInSize <= 3;
          const isOutOfStock = pair.stockPairsInSize === 0;
          const clearanceBrandConfig = getBrandConfigForProduct(product, brandConfigs);

          return (
            <motion.div
              key={pair.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, scale: 1.015 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className={`relative rounded-2xl sm:rounded-3xl border overflow-hidden transition-all duration-300 flex flex-col justify-between group shadow-lg ${
                isDark
                  ? 'bg-gradient-to-b from-zinc-950 via-zinc-900/90 to-zinc-950 border-amber-500/30 hover:border-gold hover:shadow-gold/10'
                  : 'bg-white border-amber-400/60 hover:border-gold hover:shadow-xl'
              }`}
            >
              {/* Top Ribbon Badge */}
              <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden pointer-events-none z-20">
                <div className="absolute top-4 right-[-32px] w-[140px] rotate-45 text-center font-mono text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-400 text-black py-1 shadow-md">
                  {pair.discountPercentage}% OFF
                </div>
              </div>

              {/* Swipeable Image Preview Container (Perfect 1:1 Square Ratio for 1000x1000px and square product photography) */}
              <SwipeableProductThumbnail
                product={product}
                onClick={() => onSelectProduct(product)}
                objectFit="contain"
                theme={isDark ? 'dark' : 'light'}
                zoomScale={1.5}
                imageClassName="w-full h-full object-contain p-2 sm:p-3 transition-transform duration-500 group-hover:scale-105"
                containerClassName={`relative aspect-square w-full overflow-hidden cursor-pointer ${
                  isDark ? 'bg-zinc-900/90' : 'bg-gradient-to-b from-zinc-100/90 to-zinc-50'
                }`}
                badgeOverlay={
                  <>
                    {/* Brand Logo - Bottom-Left Corner (Prominently sized high-definition white card) */}
                    <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
                      {clearanceBrandConfig && clearanceBrandConfig.logoUrl ? (
                        <div
                          title={clearanceBrandConfig.brandName}
                          className="h-12 sm:h-14 px-4 sm:px-5 py-1.5 rounded-2xl bg-white shadow-xl border border-zinc-200/90 ring-2 ring-black/5 flex items-center justify-center max-w-[150px] sm:max-w-[175px] shrink-0 transition-transform duration-200 group-hover:scale-105"
                        >
                          <img
                            src={clearanceBrandConfig.logoUrl}
                            alt={clearanceBrandConfig.brandName}
                            className="h-8 sm:h-9 max-h-9 w-auto max-w-[125px] sm:max-w-[150px] object-contain shrink-0 filter drop-shadow-xs"
                            loading="eager"
                          />
                        </div>
                      ) : product.brand ? (
                        <span className="text-xs sm:text-sm font-mono uppercase font-black px-4 py-2 rounded-2xl bg-white/95 text-zinc-900 shadow-xl border border-zinc-200">
                          {product.brand}
                        </span>
                      ) : null}
                    </div>

                    {/* Diagonal Corner Ribbon - Top-Right (% OFF Tag matching reference) */}
                    {pair.discountPercentage > 0 && (
                      <div className="absolute top-0 right-0 w-24 h-24 sm:w-28 sm:h-28 overflow-hidden pointer-events-none z-20">
                        <div className="absolute top-[16px] -right-[32px] sm:top-[20px] sm:-right-[30px] w-[120px] sm:w-[130px] transform rotate-45 bg-[#ff9900] text-black font-black font-mono text-[9px] sm:text-[10.5px] py-1 text-center shadow-md tracking-wider uppercase leading-tight select-none">
                          {pair.discountPercentage}% OFF
                        </div>
                      </div>
                    )}

                    {/* Hover Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none z-10">
                      <span className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-xl border backdrop-blur-md transition-transform duration-300 group-hover:scale-105 ${
                        isDark
                          ? 'text-white bg-zinc-900/90 border-zinc-700'
                          : 'text-zinc-900 bg-white/95 border-zinc-200'
                      }`}>
                        <Eye size={13} className="text-gold stroke-[2.5px]" /> Quick View
                      </span>
                    </div>
                  </>
                }
              />

              {/* Card Content Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                <div className="space-y-2">
                  {/* Line 1: Brand • Category • SubCategory • Logo */}
                  <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono uppercase tracking-wider">
                    <span className={`font-black ${isDark ? 'text-gold' : 'text-amber-700'}`}>
                      {clearanceBrandConfig?.brandName || product.brand || 'WALKAROO'}
                    </span>
                    <span className="text-zinc-400 font-normal">•</span>
                    <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                      {product.category || category}
                    </span>
                    {product.subCategory && (
                      <>
                        <span className="text-zinc-400 font-normal">•</span>
                        <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                          {product.subCategory}
                        </span>
                      </>
                    )}
                    {clearanceBrandConfig?.logoUrl && (
                      <span className="inline-flex items-center bg-white px-2 py-0.5 rounded-md shadow-2xs border border-zinc-200/90 ml-0.5">
                        <img
                          src={clearanceBrandConfig.logoUrl}
                          alt={clearanceBrandConfig.brandName}
                          className="h-4 sm:h-5 max-h-5 w-auto max-w-[55px] sm:max-w-[65px] object-contain"
                        />
                      </span>
                    )}
                    <span className="text-zinc-400 font-normal">•</span>
                  </div>

                  {/* Line 2: Article Code */}
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <div className="text-xs font-mono">
                      <span className="text-zinc-500">Art: </span>
                      <strong className={`font-black ${isDark ? 'text-zinc-100' : 'text-zinc-950'}`}>
                        {String((product as any).articleCode || (product as any).rawArticleCode || product.barcode || product.id || 'W5687').replace(/^[#\-_/]+/, '').trim().toUpperCase()}
                      </strong>
                    </div>
                  </div>

                  {/* Line 3: Product Name */}
                  <h4
                    onClick={() => onSelectProduct(product)}
                    className={`text-base sm:text-lg font-bold font-sans line-clamp-1 transition-colors cursor-pointer leading-snug ${
                      isDark ? 'text-white group-hover:text-gold' : 'text-zinc-950 group-hover:text-amber-700'
                    }`}
                    title={product.name}
                  >
                    {product.name}
                  </h4>

                  {/* Line 4: Colors List as Pill Badges (Available for this specific size) */}
                  {(() => {
                    const availColorIds = getAvailableColors(product, size);
                    const seen = new Set<string>();
                    const uniqueColors: { name: string; hex: string }[] = [];
                    
                    if (availColorIds.length > 0) {
                      for (const cid of availColorIds) {
                        const cDef = getColorDef(cid, product);
                        const key = cDef.name.trim().toLowerCase();
                        if (!seen.has(key)) {
                          seen.add(key);
                          uniqueColors.push({ name: cDef.name, hex: cDef.hex });
                        }
                      }
                    } else if (product.sizeColorStock && size && product.sizeColorStock[String(size)]) {
                      const sizeMap = product.sizeColorStock[String(size)];
                      Object.entries(sizeMap).forEach(([cid, qty]) => {
                        if (Number(qty) > 0) {
                          const cDef = getColorDef(cid, product);
                          const key = cDef.name.trim().toLowerCase();
                          if (!seen.has(key)) {
                            seen.add(key);
                            uniqueColors.push({ name: cDef.name, hex: cDef.hex });
                          }
                        }
                      });
                    }

                    if (uniqueColors.length === 0) return null;

                    return (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-500">
                          COLORS:
                        </span>
                        {uniqueColors.map((c, cIdx) => (
                          <span
                            key={cIdx}
                            className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 border shadow-2xs ${
                              isDark
                                ? 'bg-zinc-900 border-zinc-700/80 text-zinc-200'
                                : 'bg-zinc-50 border-zinc-200/90 text-zinc-800'
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/25 shrink-0"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span>{c.name}</span>
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Line 5: Divider & Price & Action Buttons */}
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col gap-3">
                  {/* Price Row (Without Save Badge) */}
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 block font-bold mb-0.5">
                        OFFER PRICE
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm sm:text-base font-bold text-zinc-400 line-through font-mono">
                          ₹{pair.originalPrice}
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-amber-500 dark:text-amber-400 font-mono tracking-tight">
                          ₹{pair.offerPrice}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: DETAILS and ADD TO CART */}
                  <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => onSelectProduct(product)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-mono uppercase font-black border transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-2xs ${
                        isDark
                          ? 'bg-zinc-900 text-zinc-200 border-zinc-700 hover:bg-zinc-800 hover:text-white'
                          : 'bg-zinc-100 text-zinc-800 border-zinc-200 hover:bg-zinc-200 hover:text-black'
                      }`}
                    >
                      <Eye size={14} className="shrink-0 stroke-[2.5px]" />
                      <span>DETAILS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const appliedSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : 7);
                        onAddToCart(
                          {
                            ...product,
                            price: pair.offerPrice,
                            name: `${product.name} (Clearance Deal - Size ${appliedSize})`
                          },
                          appliedSize
                        );
                      }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-mono uppercase font-black transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
                        isDark
                          ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/10'
                          : 'bg-black text-white hover:bg-gold hover:text-black'
                      }`}
                    >
                      <ShoppingBag size={14} className="shrink-0 stroke-[2.5px]" />
                      <span>ADD TO CART</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
