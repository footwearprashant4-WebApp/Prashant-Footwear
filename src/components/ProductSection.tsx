import React from 'react';
import { Product, Category, SubCategory } from '../types';
import { motion } from 'motion/react';
import { Filter, Eye, AlertTriangle, Check, ShoppingBag, Footprints, Home, ArrowLeft, Tag, Gift, Sparkles, Copy, Percent, Sun, Moon } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

interface ProductSectionProps {
  products: Product[];
  selectedCategory: Category | null;
  selectedSize: number | null;
  onClearFilters: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: number) => void;
  onSelectCategory?: (category: Category | null) => void;
  onSelectSize?: (size: number | null) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  isOfferFlowActive: boolean;
  setIsOfferFlowActive: (active: boolean) => void;
  offerFlowStep: 'category' | 'size' | 'results';
  setOfferFlowStep: (step: 'category' | 'size' | 'results') => void;
  offerFlowCategory: Category | null;
  setOfferFlowCategory: (category: Category | null) => void;
  offerFlowSize: number | null;
  setOfferFlowSize: (size: number | null) => void;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  products,
  selectedCategory,
  selectedSize,
  onClearFilters,
  onSelectProduct,
  onAddToCart,
  onSelectCategory,
  onSelectSize,
  theme = 'dark',
  onToggleTheme,
  isOfferFlowActive,
  setIsOfferFlowActive,
  offerFlowStep,
  setOfferFlowStep,
  offerFlowCategory,
  setOfferFlowCategory,
  offerFlowSize,
  setOfferFlowSize
}) => {
  const isDark = theme !== 'light';
  const { offersBannerUrl, categoryThumbMen, categoryThumbWomen, categoryThumbKids } = useProducts();

  // Sub-categories list defined in the blueprint
  const subCategories: SubCategory[] = ['Office Wear', 'Sandals', 'Casuals', 'Shoes', 'Others'];

  // Determine size options based on category
  const getSizes = (cat: Category): number[] => {
    switch (cat) {
      case 'Men':
        return [6, 7, 8, 9, 10, 11, 12];
      case 'Women':
        return [5, 6, 7, 8, 9, 10, 11];
      case 'Kids':
        return [6, 7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4];
      default:
        return [];
    }
  };

  // Filter products based on selectedCategory and selectedSize
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchesSize = selectedSize ? p.sizes.includes(selectedSize) : true;
    return matchesCategory && matchesSize;
  });

  // Group products by sub-category
  const getProductsBySubCategory = (subCat: SubCategory) => {
    return filteredProducts.filter((p) => p.subCategory === subCat);
  };

  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);
  const [showOffers, setShowOffers] = React.useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const offers = [
    {
      id: 'welcome15',
      title: 'WELCOME PRIVILEGE',
      discount: '15% OFF YOUR ORDER',
      description: 'Acquire premium craftsmanship with exclusive savings on your inaugural order. Complementary premium leather nourishment wax included with delivery.',
      code: 'WELCOME15',
      tag: 'FIRST ACQUISITION',
      badgeColor: 'border-gold/20 text-gold bg-gold/5',
      icon: Gift,
    },
    {
      id: 'eliteboots',
      title: 'MONSOON PRESTIGE',
      discount: '₹1,500 IMMEDIATE SAVINGS',
      description: 'Unlock special workshop privileges on all active-comfort boots and weatherproof terrain loafers. Engineered water repellent treatments included.',
      code: 'ELITEBOOTS',
      tag: 'SEASONAL EDITION',
      badgeColor: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5',
      icon: Percent,
    },
    {
      id: 'craftvip',
      title: 'MEMBERS MONOGRAM',
      discount: 'FREE GOLD EMBOSSING',
      description: 'Personalize each masterpiece with complimentary hand-pressed golden initials engraving and personalized comfort sizing consultation.',
      code: 'CRAFTVIP',
      tag: 'VIP MEMBERS',
      badgeColor: 'border-purple-500/20 text-purple-400 bg-purple-500/5',
      icon: Sparkles,
    },
    {
      id: 'fastship',
      title: 'FLEET COMPLIMENTARY',
      discount: 'FREE INSURED SHIPPING',
      description: 'Receive elite cedar-scented box packaging and overnight global delivery completely complimentary on all investments exceeding ₹10,000.',
      code: 'FASTSHIP',
      tag: 'FLEET PRIVILEGE',
      badgeColor: 'border-blue-500/20 text-blue-400 bg-blue-500/5',
      icon: Tag,
    }
  ];

  // ---------------------------------------------------------
  // CUSTOM OFFER WIZARD FLOW (DEAD STOCK / OUT OF STOCK HANDLER)
  // ---------------------------------------------------------

  // Step 1: Choose Division
  if (isOfferFlowActive && offerFlowStep === 'category') {
    const categoryMetaData = {
      Men: {
        num: '01',
        image: categoryThumbMen,
        badge: 'CRAFT CODES',
        perk: 'SAVE UP TO 40%',
        description: 'Bespoke hand-sewn Goodyear brogues, calibrated lightweight active running soles, and resilient outdoor heritage boots.',
        count: '32 ACTIVE DESIGNS'
      },
      Women: {
        num: '02',
        image: categoryThumbWomen,
        badge: 'ATELIER SPECIALS',
        perk: 'SAVE UP TO 50%',
        description: 'Elegant hand-lasted lifestyle loafers, couture block heels, and weather-defying performance-lined storm boots.',
        count: '24 ACTIVE DESIGNS'
      },
      Kids: {
        num: '03',
        image: categoryThumbKids,
        badge: 'JUNIOR ARCHIVE',
        perk: 'SAVE UP TO 35%',
        description: 'Ergonomically engineered orthopedic supports, ultra-resilient playground-tested classics, and flexible fit sandals.',
        count: '18 ACTIVE DESIGNS'
      }
    };

    return (
      <section
        id="products-section"
        className={`py-12 px-6 md:px-12 relative border-t transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-b from-[#0b0b0c] via-[#0e0e11] to-[#0a0a0b] text-white border-zinc-900/60' 
            : 'bg-gradient-to-b from-[#f9f9fb] via-[#f3f3f6] to-[#f8f8fa] text-zinc-900 border-zinc-200'
        }`}
      >
        {/* Subtle Decorative Ambient Glow on Dark Theme */}
        {isDark && (
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        )}

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Top Elegant Breadcrumbs & Progress Steps */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-zinc-500/10 dark:border-zinc-800/40">
            {/* Back to Home Button (Compacted) */}
            <button
              onClick={() => {
                setIsOfferFlowActive(false);
                setOfferFlowCategory(null);
                setOfferFlowStep('category');
              }}
              className={`text-[9px] font-mono tracking-widest uppercase font-black flex items-center gap-1.5 px-4 py-2 rounded-xl border transition-all duration-300 active:scale-95 cursor-pointer shadow-md hover:shadow-gold/5 ${
                isDark
                  ? 'bg-zinc-900/80 text-white border-zinc-800/70 hover:border-gold hover:text-gold'
                  : 'bg-white text-zinc-800 border-zinc-200/80 hover:border-gold hover:text-gold'
              }`}
            >
              <ArrowLeft size={10} className="text-gold" />
              Back to Home Page
            </button>

            {/* Steps indicator replaced with "Choose Category" */}
            <div className="text-[10px] font-mono tracking-[0.2em] font-black text-gold bg-gold/5 border border-gold/15 px-3 py-1.5 rounded-lg uppercase">
              Choose Category
            </div>
          </div>

          {/* Category Cards (Redesigned to be extremely compact for single-frame view) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {(['Men', 'Women', 'Kids'] as Category[]).map((cat) => {
              const meta = categoryMetaData[cat];
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setOfferFlowCategory(cat);
                    setOfferFlowStep('size');
                  }}
                  className={`group relative h-[240px] rounded-2xl overflow-hidden text-left border transition-all duration-500 cursor-pointer flex flex-col justify-end p-5 shadow-xl hover:shadow-gold/5 ${
                    isDark 
                      ? 'border-zinc-900/60 bg-[#121215]/50 hover:border-gold/40' 
                      : 'border-zinc-200 bg-white hover:border-gold/55'
                  }`}
                >
                  {/* Category Card Background Photo */}
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <img
                      src={meta.image}
                      alt={`${cat} Collection`}
                      className="w-full h-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-105 brightness-[0.8] group-hover:brightness-[0.9]"
                      referrerPolicy="no-referrer"
                    />
                    {/* Sophisticated overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/90 transition-opacity duration-300 group-hover:opacity-90" />
                  </div>

                  {/* Top floating badge tags (Compacted) */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <span className="text-[7px] font-mono font-black tracking-widest text-gold bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full border border-gold/15 uppercase shadow-sm">
                      {meta.badge}
                    </span>
                    <span className="text-[7px] font-mono font-black tracking-widest text-white bg-red-600/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-red-500/10 uppercase shadow-sm">
                      {meta.perk}
                    </span>
                  </div>

                  {/* Monogram Index Plate [ 01 ] (Compacted) */}
                  <div className="absolute top-1/2 left-6 -translate-y-1/2 opacity-15 group-hover:opacity-30 transition-opacity duration-500 select-none">
                    <span className="font-mono text-5xl font-extralight text-white tracking-widest">
                      {meta.num}
                    </span>
                  </div>

                  {/* Body Content Info Block (Optimized for small space) */}
                  <div className="relative z-10 space-y-3">
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-gold font-bold uppercase tracking-[0.15em] block">
                        {meta.count}
                      </span>
                      
                      <div className="flex items-baseline gap-2">
                        <h3 className="serif-display text-2xl md:text-3xl font-extrabold uppercase text-white tracking-wider flex items-center gap-2">
                          {cat}
                        </h3>
                      </div>

                      {/* Accent gold bar on hover */}
                      <div className="w-6 group-hover:w-12 transition-all duration-500 h-[1.5px] bg-gold rounded" />

                      <p className="text-[10px] leading-relaxed text-zinc-300/80 font-sans font-light mt-1 line-clamp-2">
                        {meta.description}
                      </p>
                    </div>

                    {/* Interactive Call-to-action (Compacted) */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                      <span className="text-[8px] font-mono uppercase tracking-[0.12em] text-zinc-400 group-hover:text-gold transition-colors font-bold">
                        Configure Sizing Desk
                      </span>
                      <span className="text-xs text-gold transform translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300 font-bold">
                        ➔
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Trust/Promo Bar */}
          <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left ${
            isDark 
              ? 'bg-zinc-950/40 border-zinc-900/60' 
              : 'bg-white border-zinc-200/80 shadow-sm'
          }`}>
            <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
              * Active liquidations are certified original workshop samples. Each pair features lifetime material craftsmanship support and sizing guarantees.
            </p>
            <span className="text-[9px] font-mono font-bold tracking-widest text-gold shrink-0 bg-gold/5 border border-gold/15 px-3 py-1 rounded">
              LIFETIME WARRANTY
            </span>
          </div>
        </div>
      </section>
    );
  }

  // Step 2: Choose Sizing
  if (isOfferFlowActive && offerFlowStep === 'size' && offerFlowCategory) {
    const sizes = getSizes(offerFlowCategory);
    return (
      <section
        id="products-section"
        className={`py-16 px-6 md:px-12 relative border-t transition-colors duration-500 ${
          isDark ? 'bg-transparent text-white border-zinc-900/20' : 'bg-transparent text-zinc-900 border-zinc-200'
        }`}
      >
        <div className="max-w-4xl mx-auto text-center space-y-10 py-12">
          {/* Back Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                setOfferFlowStep('category');
                setOfferFlowCategory(null);
              }}
              className={`text-xs font-mono tracking-widest uppercase font-bold flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 active:scale-95 cursor-pointer shadow-md ${
                isDark
                  ? 'bg-zinc-900/60 text-white border-zinc-800 hover:border-gold hover:text-gold shadow-black/40'
                  : 'bg-white text-zinc-800 border-zinc-200 hover:border-gold hover:text-gold shadow-zinc-100'
              }`}
            >
              <ArrowLeft size={14} className="text-gold" />
              Back to Divisions
            </button>

            <span className={`hidden sm:inline ${isDark ? 'text-zinc-800' : 'text-zinc-300'}`}>|</span>

            <span className={`text-xs font-mono uppercase tracking-widest font-black px-4 py-2 rounded-full ${
              isDark 
                ? 'bg-zinc-900/40 text-gold/90 border border-gold/15' 
                : 'bg-gold/5 text-gold border border-gold/20'
            }`}>
              Selected: {offerFlowCategory} Division
            </span>
          </div>

          <div className="space-y-3">
            <span className="font-mono text-[10px] text-gold uppercase tracking-widest font-black px-4 py-1.5 rounded-full bg-gold/5 border border-gold/15 inline-block">
              OFFER ACTIVATOR • STEP 2 OF 2
            </span>
            <h2 className={`serif-display text-3xl md:text-5xl font-bold tracking-tight uppercase ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}>
              SELECT SIZE FOR CLEARANCE
            </h2>
            <p className={`text-sm max-w-md mx-auto leading-relaxed ${
              isDark ? 'text-zinc-500' : 'text-zinc-600'
            }`}>
              We match dead-stock liquidation and warehouse specials based strictly on your precise foot size to guarantee premium comfort.
            </p>

            {/* Elegant inline theme switcher option for the second step */}
            {onToggleTheme && (
              <div className="flex flex-col items-center gap-2 pt-2">
                <span className={`text-[10px] font-mono uppercase tracking-widest font-black ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Preferred Environment Theme
                </span>
                <div className={`inline-flex items-center gap-1 p-1 rounded-xl border ${isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white border-zinc-200'} shadow-md`}>
                  <button
                    type="button"
                    onClick={() => !isDark && onToggleTheme()}
                    className={`py-1.5 px-4 rounded-lg text-[10px] font-mono uppercase font-black transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                      isDark
                        ? 'bg-zinc-900 text-white border border-zinc-800 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
                    <Moon size={12} className="text-blue-400" /> Dark View
                  </button>
                  <button
                    type="button"
                    onClick={() => isDark && onToggleTheme()}
                    className={`py-1.5 px-4 rounded-lg text-[10px] font-mono uppercase font-black transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                      !isDark
                        ? 'bg-gold/15 text-gold border border-gold/25 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Sun size={12} className="text-yellow-500" /> Light View
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sizing Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4 max-w-2xl mx-auto pt-4">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => {
                  setOfferFlowSize(size);
                  setOfferFlowStep('results');
                }}
                className={`group relative flex flex-col items-center justify-center aspect-square rounded-2xl border transition-all duration-300 active:scale-95 cursor-pointer shadow-lg hover:shadow-gold/5 ${
                  isDark
                    ? 'border-zinc-900 bg-zinc-950/60 text-white hover:border-gold hover:bg-gold hover:text-black'
                    : 'border-zinc-200 bg-white text-zinc-800 hover:border-gold hover:bg-gold hover:text-black shadow-sm'
                }`}
              >
                <span className="font-mono text-lg font-black tracking-tight">{size}</span>
                <span className={`text-[8px] group-hover:text-black/60 font-bold uppercase tracking-wider font-mono mt-0.5 ${
                  isDark ? 'text-zinc-500' : 'text-zinc-400'
                }`}>
                  UK/IN
                </span>
                
                <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full group-hover:bg-black/20 ${
                  isDark ? 'bg-zinc-800' : 'bg-zinc-200'
                }`} />
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Step 3: Offer Catalogue Results
  if (isOfferFlowActive && offerFlowStep === 'results' && offerFlowCategory && offerFlowSize) {
    const offerFlowProducts = products.filter(
      (p) => p.category === offerFlowCategory && p.sizes.includes(offerFlowSize)
    );

    // Get clearance products (stock <= 3, handles out of stock as well)
    let clearanceProducts = offerFlowProducts.filter((p) => p.stock <= 3);
    if (clearanceProducts.length === 0 && offerFlowProducts.length > 0) {
      // Fallback: take the lowest stock items to populate the offers section
      clearanceProducts = [...offerFlowProducts]
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 2);
    }

    // Regular products are the rest
    const regularProducts = offerFlowProducts.filter(
      (p) => !clearanceProducts.some((cp) => cp.id === p.id)
    );

    return (
      <section
        id="products-section"
        className={`py-16 px-6 md:px-12 min-h-screen relative border-t transition-colors duration-500 ${
          isDark ? 'bg-transparent text-white border-zinc-900/20' : 'bg-transparent text-zinc-900 border-zinc-200'
        }`}
      >
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header & Reset navigation */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b pb-6 border-zinc-800/10 dark:border-zinc-800/40 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[10px] text-gold uppercase tracking-widest font-black px-3 py-1 rounded-full bg-gold/5 border border-gold/15">
                  LIVE OFFER RESULTS
                </span>
                <span className={`text-xs font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400 font-bold'}`}>
                  • Size UK/IN {offerFlowSize}
                </span>
              </div>
              <h2 className={`serif-display text-2xl md:text-3.5xl font-black uppercase tracking-tight ${
                isDark ? 'text-white' : 'text-zinc-900'
              }`}>
                {offerFlowCategory}'s Liquidation Catalog
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setOfferFlowStep('category');
                  setOfferFlowCategory(null);
                  setOfferFlowSize(null);
                }}
                className={`text-xs font-bold font-mono px-4 py-2 rounded-xl border transition-all duration-300 flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                  isDark
                    ? 'bg-zinc-900/60 text-white border-zinc-800 hover:border-gold hover:text-gold'
                    : 'bg-white text-zinc-800 border-zinc-200 hover:border-gold hover:text-gold'
                }`}
              >
                <ArrowLeft size={13} /> CHANGE DIVISION
              </button>

              <button
                onClick={() => {
                  setOfferFlowStep('size');
                  setOfferFlowSize(null);
                }}
                className={`text-xs font-bold font-mono px-4 py-2 rounded-xl border transition-all duration-300 flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                  isDark
                    ? 'bg-zinc-900/60 text-white border-zinc-800 hover:border-gold hover:text-gold'
                    : 'bg-white text-zinc-800 border-zinc-200 hover:border-gold hover:text-gold'
                }`}
              >
                UK/IN SIZE: {offerFlowSize} ⚙
              </button>

              <button
                onClick={() => {
                  setIsOfferFlowActive(false);
                  setOfferFlowCategory(null);
                  setOfferFlowSize(null);
                  if (onClearFilters) onClearFilters();
                }}
                className="text-xs font-bold tracking-wider text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/5 px-4 py-2 rounded-xl cursor-pointer transition-all"
              >
                RESET & SHOW ALL
              </button>
            </div>
          </div>

          {/* 1. TOP OFFERS SECTION (Clearance / Out-of-Stock handle / Dead Stock) */}
          <div className="space-y-6">
            <div className={`p-4 md:p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              isDark 
                ? 'bg-gradient-to-r from-amber-500/10 via-gold/5 to-transparent border-amber-500/20' 
                : 'bg-gradient-to-r from-amber-500/5 via-gold/5 to-transparent border-amber-500/30'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-xl border border-amber-500/20">
                  <Percent className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <h3 className={`font-mono text-sm uppercase tracking-wider font-black ${
                    isDark ? 'text-amber-400' : 'text-amber-800'
                  }`}>
                    Artisan Sizing Liquidation & Out of Stock Solutions
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    Immediate clearance price reductions and custom backorder privileges mapped to your size.
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-mono uppercase tracking-widest font-black px-3 py-1.5 rounded-full border ${
                isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-500/10 text-amber-800 border-amber-500/25'
              }`}>
                {clearanceProducts.length} Exclusive Deals
              </span>
            </div>

            {clearanceProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {clearanceProducts.map((product) => {
                  const isOutOfStock = product.stock === 0;
                  const isDeadStock = product.stock > 0 && product.stock <= 3;
                  const originalPrice = product.price;
                  // 20% discount on clearance/dead stock items to clear inventory
                  const discountedPrice = Math.floor(product.price * 0.8);

                  return (
                    <motion.div
                      key={`clearance-${product.id}`}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className={`relative rounded-3xl border p-6 flex flex-col md:flex-row gap-6 overflow-hidden group transition-all duration-300 ${
                        isDark
                          ? 'bg-zinc-950/60 border-amber-500/30 hover:border-gold/60 shadow-[0_8px_30px_rgba(245,158,11,0.06)]'
                          : 'bg-white border-amber-500/40 hover:border-gold hover:shadow-xl'
                      }`}
                    >
                      {/* Special gold ribbon indicator */}
                      <div className="absolute top-0 right-0 w-28 h-28 overflow-hidden pointer-events-none">
                        <div className="absolute top-3 right-[-35px] w-[140px] rotate-45 text-center font-mono text-[9px] font-black uppercase tracking-widest bg-amber-500 text-black py-1 shadow-md">
                          {isOutOfStock ? 'PRE-ORDER' : 'CLEARANCE'}
                        </div>
                      </div>

                      {/* Image container */}
                      <div className={`relative w-full md:w-40 aspect-square rounded-2xl overflow-hidden shrink-0 ${
                        isDark ? 'bg-zinc-900' : 'bg-zinc-50'
                      }`} onClick={() => onSelectProduct(product)}>
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                        />
                      </div>

                      {/* Info block */}
                      <div className="flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono uppercase text-amber-500 font-black">
                              {product.subCategory}
                            </span>
                            <span className={`text-[8px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded ${
                              isDark ? 'bg-zinc-900 text-zinc-400' : 'bg-zinc-100 text-zinc-600'
                            }`}>
                              SIZE {offerFlowSize}
                            </span>
                          </div>

                          <h4 className={`serif-display text-lg font-black uppercase line-clamp-1 group-hover:text-gold transition-colors ${
                            isDark ? 'text-white' : 'text-zinc-900'
                          }`}>
                            {product.name}
                          </h4>

                          {/* Problem-Solver description (Dead stock / Out of stock handling) */}
                          <p className={`text-xs leading-relaxed ${
                            isDark ? 'text-zinc-400' : 'text-zinc-600'
                          }`}>
                            {isOutOfStock ? (
                              <span className="text-rose-400 font-medium">
                                Currently out of stock. Book now on custom backorder with an immediate 20% discount. Dispatched in 7 days.
                              </span>
                            ) : isDeadStock ? (
                              <span className="text-amber-400 font-medium">
                                Only {product.stock} final pairs left in warehouse. High-comfort craft offered at 20% off to clear workshop space.
                              </span>
                            ) : (
                              <span>
                                Sizing spotlight exclusive. Handcrafted leatherwork featuring precision comfort and complimentary premium shoe care wax.
                              </span>
                            )}
                          </p>

                          {/* Dynamic Extra Perks */}
                          <div className={`text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 ${
                            isDark ? 'text-zinc-500' : 'text-zinc-500'
                          }`}>
                            <Sparkles size={11} className="text-gold animate-bounce" />
                            <span>Gift wax & cedar box included</span>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="flex items-center justify-between gap-4 pt-2 border-t border-zinc-800/20 dark:border-zinc-800/40">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-mono text-zinc-500">SPECIAL PRIVILEGE PRICE</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-zinc-500 line-through font-mono">
                                ₹{originalPrice}
                              </span>
                              <span className="text-lg font-black text-gold font-mono">
                                ₹{discountedPrice}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              onAddToCart({
                                ...product,
                                price: discountedPrice,
                                name: isOutOfStock 
                                  ? `${product.name} (Backorder Offer)` 
                                  : `${product.name} (Size ${offerFlowSize} Clearance)`
                              }, offerFlowSize);
                            }}
                            className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer ${
                              isDark
                                ? 'bg-white text-black hover:bg-gold hover:text-black shadow-black/20'
                                : 'bg-zinc-900 text-white hover:bg-gold hover:text-black shadow-zinc-200/50'
                            }`}
                          >
                            <ShoppingBag size={12} />
                            {isOutOfStock ? 'PRE-ORDER NOW' : 'SECURE OFFER'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className={`text-center py-8 rounded-2xl border border-dashed ${
                isDark ? 'border-zinc-900 text-zinc-500' : 'border-zinc-200 text-zinc-600'
              }`}>
                No dead stock or out-of-stock items in this size. See active catalog below.
              </div>
            )}
          </div>

          {/* 2. REGULAR ACTIVE INVENTORY CATALOGUE */}
          <div className="space-y-6 pt-6">
            <div className="border-b pb-3 border-zinc-800/10 dark:border-zinc-800/40">
              <h3 className={`serif-display text-xl font-bold uppercase tracking-wide ${
                isDark ? 'text-zinc-300' : 'text-zinc-800'
              }`}>
                Standard Active Inventory ({offerFlowSize})
              </h3>
              <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Premium, fully-stocked footwear collections ready for immediate priority dispatch.
              </p>
            </div>

            {regularProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {regularProducts.map((product) => {
                  const isLowStock = product.stock > 0 && product.stock <= 5;
                  const isOutOfStock = product.stock === 0;

                  return (
                    <motion.div
                      key={`regular-${product.id}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`group border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                        isDark
                          ? 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800'
                          : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-xl text-zinc-900'
                      }`}
                    >
                      {/* Image Preview Container */}
                      <div className={`relative aspect-square w-full overflow-hidden cursor-pointer ${
                        isDark ? 'bg-zinc-900/60' : 'bg-zinc-50'
                      }`} onClick={() => onSelectProduct(product)}>
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Hover Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                          <span className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3.5 py-2 rounded-full shadow-xl border ${
                            isDark
                              ? 'text-white bg-zinc-900/80 backdrop-blur-md border-zinc-800'
                              : 'text-zinc-800 bg-white/95 backdrop-blur-md border-zinc-200'
                          }`}>
                            <Eye size={12} /> View Details
                          </span>
                        </div>

                        {/* Category Tag */}
                        <span className={`absolute top-3 left-3 backdrop-blur-md text-[10px] font-mono tracking-wider font-bold px-2 py-1 rounded-md border uppercase ${
                          isDark
                            ? 'bg-zinc-900/80 text-zinc-400 border-zinc-800/80'
                            : 'bg-white/90 text-zinc-600 border-zinc-200'
                        }`}>
                          {product.category}
                        </span>

                        {/* Stock Badges */}
                        {isOutOfStock && (
                          <span className="absolute top-3 right-3 bg-rose-500/90 text-black text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-md uppercase">
                            OUT OF STOCK
                          </span>
                        )}
                        {isLowStock && (
                          <span className="absolute top-3 right-3 bg-amber-500/95 text-black text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-md uppercase flex items-center gap-1 animate-pulse">
                            <AlertTriangle size={10} /> ONLY {product.stock} LEFT
                          </span>
                        )}
                      </div>

                      {/* Product Meta */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono uppercase ${
                              isDark ? 'text-zinc-500' : 'text-zinc-400 font-bold'
                            }`}>
                              {product.subCategory}
                            </span>
                            <span className="text-sm font-bold text-gold font-mono">
                              ₹{product.price}
                            </span>
                          </div>
                          <h4 className={`text-base font-bold transition-colors tracking-tight line-clamp-1 ${
                            isDark ? 'text-zinc-200 group-hover:text-white' : 'text-zinc-800 group-hover:text-gold'
                          }`}>
                            {product.name}
                          </h4>
                        </div>

                        {/* Sizing tags container */}
                        <div className="mt-4">
                          <p className={`text-[10px] font-mono mb-1.5 uppercase tracking-wider ${
                            isDark ? 'text-zinc-500' : 'text-zinc-400 font-bold'
                          }`}>
                            Sizing Mappings:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {product.sizes.map((sz) => {
                              const isSelected = sz === offerFlowSize;
                              return (
                                <span
                                  key={sz}
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                                    isSelected
                                      ? 'bg-gold text-black font-black'
                                      : isDark
                                        ? 'bg-zinc-900/60 text-zinc-400 border border-zinc-800/60'
                                        : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                                  }`}
                                >
                                  {sz}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Action button */}
                        <div className="mt-5">
                          {isOutOfStock ? (
                            <button
                              disabled
                              className={`w-full py-2.5 rounded-xl border text-xs font-bold tracking-wider uppercase cursor-not-allowed ${
                                isDark
                                  ? 'border-zinc-800 text-zinc-500 bg-zinc-950/20'
                                  : 'border-zinc-200 text-zinc-400 bg-zinc-50'
                              }`}
                            >
                              OUT OF STOCK
                            </button>
                          ) : (
                            <button
                              onClick={() => onAddToCart(product, offerFlowSize)}
                              className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors duration-300 flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer ${
                                isDark
                                  ? 'bg-white text-black hover:bg-gold hover:text-black shadow-black/20'
                                  : 'bg-zinc-900 text-white hover:bg-gold hover:text-black shadow-zinc-200/50'
                              }`}
                            >
                              <ShoppingBag size={13} />
                              ADD TO CART
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className={`text-center py-12 border border-dashed rounded-3xl max-w-md mx-auto ${
                isDark ? 'border-zinc-800 bg-zinc-950/10' : 'border-zinc-300 bg-white'
              }`}>
                <p className={isDark ? 'text-zinc-500' : 'text-zinc-600 font-medium'}>
                  No other standard items matching size {offerFlowSize} in {offerFlowCategory} division.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Render Category Select / Offers Screen (if no category chosen yet)
  if (!selectedCategory) {
    return (
      <section
        id="products-section"
        className={`py-16 px-6 md:px-12 relative border-t transition-colors duration-500 ${
          isDark ? 'bg-transparent text-white border-zinc-900/20' : 'bg-transparent text-zinc-900 border-zinc-200'
        }`}
      >
        <div className="max-w-4xl mx-auto">
          {/* Single Featured Banner Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`relative p-8 md:p-16 rounded-3xl border text-center overflow-hidden cursor-pointer group transition-all duration-300 ${
              isDark
                ? 'border-gold/30 bg-zinc-950/40 hover:bg-zinc-950/60 shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
                : 'border-gold/40 bg-white hover:bg-zinc-50/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]'
            }`}
            onClick={() => {
              setIsOfferFlowActive(true);
              setOfferFlowStep('category');
              setOfferFlowCategory(null);
              setOfferFlowSize(null);
            }}
          >
            {/* Background Image Banner with Dark overlay for text readability */}
            {offersBannerUrl && (
              <div className="absolute inset-0 z-0">
                <img
                  src={offersBannerUrl}
                  alt="Offers Banner"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 dark:bg-black/30 transition-colors duration-300 group-hover:bg-black/10 dark:group-hover:bg-black/15" />
              </div>
            )}

            {/* Top ambient glow gradient */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent z-10" />
            
            <div className="relative z-10 space-y-6 max-w-2xl mx-auto flex flex-col items-center">
              {/* Dynamic tag icon/sparkles */}
              <div className={`p-4 rounded-full border ${
                isDark ? 'bg-gold/10 border-gold/35 text-gold' : 'bg-gold/20 border-gold/40 text-gold-400'
              } animate-pulse`}>
                <Sparkles className="w-6 h-6" />
              </div>

              <p className="text-xs md:text-sm font-mono tracking-widest uppercase transition-colors flex items-center gap-2 text-gold font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {showOffers ? 'Click to hide workshop privileges' : 'Click to reveal workshop privileges'}
                <motion.span
                  animate={{ y: showOffers ? -2 : 2 }}
                  transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.8 }}
                >
                  ▼
                </motion.span>
              </p>
            </div>
          </motion.div>

          {/* Expanded Offers list */}
          {showOffers && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="mt-12 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-2">
                {offers.map((offer, idx) => {
                  const IconComponent = offer.icon;
                  const isCopied = copiedCode === offer.code;

                  return (
                    <motion.div
                      key={offer.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`relative p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
                        isDark
                          ? 'border-zinc-900/80 bg-zinc-950/30 hover:border-gold/20 shadow-md'
                          : 'border-zinc-200 bg-white hover:border-gold shadow-sm'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className={`text-[8px] font-mono uppercase tracking-widest font-black px-2 py-0.5 rounded-full border ${offer.badgeColor}`}>
                            {offer.tag}
                          </span>
                          <IconComponent className="w-4 h-4 text-gold/60" />
                        </div>

                        <div className="space-y-1">
                          <p className={`text-[9px] font-mono tracking-wider transition-colors uppercase ${
                            isDark ? 'text-zinc-500' : 'text-zinc-400'
                          }`}>
                            {offer.title}
                          </p>
                          <h4 className={`serif-display text-lg font-black uppercase ${
                            isDark ? 'text-white' : 'text-zinc-900'
                          }`}>
                            {offer.discount}
                          </h4>
                          <p className={`text-[11px] leading-relaxed transition-colors ${
                            isDark ? 'text-zinc-400' : 'text-zinc-500'
                          }`}>
                            {offer.description}
                          </p>
                        </div>
                      </div>

                      {/* Code block */}
                      <div className="mt-6 pt-4 border-t border-dashed flex items-center justify-between gap-4 border-zinc-800/20 dark:border-zinc-800/40">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-mono text-zinc-500">COUPON CODE</span>
                          <span className={`text-xs font-mono font-bold tracking-wider ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>
                            {offer.code}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Avoid closing the parent banner when clicking copy
                            handleCopyCode(offer.code);
                          }}
                          className={`px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider font-bold transition-all duration-300 flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-500 text-white'
                              : isDark
                                ? 'bg-zinc-900 hover:bg-gold hover:text-black text-white'
                                : 'bg-zinc-100 hover:bg-gold hover:text-black text-zinc-800'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check size={11} />
                              COPIED
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              COPY CODE
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </section>
    );
  }

  // Render Size Select Screen (if category chosen, but no size selected yet)
  if (selectedCategory && !selectedSize) {
    const sizes = getSizes(selectedCategory);
    return (
      <section
        id="products-section"
        className={`py-24 px-6 md:px-12 relative border-t transition-colors duration-500 ${
          isDark ? 'bg-transparent text-white border-zinc-900/20' : 'bg-transparent text-zinc-900 border-zinc-200'
        }`}
      >
        <div className="max-w-3xl mx-auto text-center space-y-10 py-12">
          {/* Breadcrumb / Back Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                if (onSelectCategory) onSelectCategory(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`text-xs font-mono tracking-widest uppercase font-bold flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-300 active:scale-95 cursor-pointer shadow-md ${
                isDark
                  ? 'bg-zinc-900/60 text-white border-zinc-800 hover:border-gold hover:text-gold shadow-black/40'
                  : 'bg-white text-zinc-800 border-zinc-200 hover:border-gold hover:text-gold shadow-zinc-100'
              }`}
            >
              <Home size={14} className="text-gold" />
              Go Back to Home
            </button>

            <span className={`hidden sm:inline ${isDark ? 'text-zinc-800' : 'text-zinc-300'}`}>|</span>

            <span className={`text-xs font-mono uppercase tracking-widest font-black px-4 py-2 rounded-full ${
              isDark 
                ? 'bg-zinc-900/40 text-gold/90 border border-gold/15' 
                : 'bg-gold/5 text-gold border border-gold/20'
            }`}>
              {selectedCategory}'s Collection
            </span>
          </div>

          <div className="space-y-3">
            <span className="font-mono text-[10px] text-gold uppercase tracking-widest font-black">
              Step of Precision
            </span>
            <h2 className={`serif-display text-3xl md:text-5xl font-bold tracking-tight uppercase ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}>
              SELECT YOUR UK/IN SIZE
            </h2>
            <p className={`text-sm max-w-md mx-auto leading-relaxed ${
              isDark ? 'text-zinc-500' : 'text-zinc-600'
            }`}>
              We curate the lookbook dynamically. Select your preferred shoe size to instantly reveal the custom active inventory.
            </p>
          </div>

          {/* Sizing Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4 max-w-2xl mx-auto pt-4">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => {
                  if (onSelectSize) onSelectSize(size);
                }}
                className={`group relative flex flex-col items-center justify-center aspect-square rounded-2xl border transition-all duration-300 active:scale-95 cursor-pointer shadow-lg hover:shadow-gold/5 animate-fade-in ${
                  isDark
                    ? 'border-zinc-900 bg-zinc-950/60 text-white hover:border-gold hover:bg-gold hover:text-black'
                    : 'border-zinc-200 bg-white text-zinc-800 hover:border-gold hover:bg-gold hover:text-black shadow-sm'
                }`}
              >
                <span className="font-mono text-lg font-black tracking-tight">{size}</span>
                <span className={`text-[8px] group-hover:text-black/60 font-bold uppercase tracking-wider font-mono mt-0.5 ${
                  isDark ? 'text-zinc-500' : 'text-zinc-400'
                }`}>
                  UK/IN
                </span>
                
                {/* Micro badge indicator */}
                <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full group-hover:bg-black/20 ${
                  isDark ? 'bg-zinc-800' : 'bg-zinc-200'
                }`} />
              </button>
            ))}
          </div>

          <div className="pt-6">
            <p className={`text-[10px] font-mono uppercase tracking-widest ${
              isDark ? 'text-zinc-600' : 'text-zinc-500'
            }`}>
              Standard Fitting • Free Exchanges & Returns
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="products-section"
      className={`py-24 px-6 md:px-12 min-h-screen relative border-t transition-colors duration-500 ${
        isDark ? 'bg-transparent text-white border-zinc-900/20' : 'bg-transparent text-zinc-900 border-zinc-200'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="font-mono text-[10px] text-gold uppercase tracking-widest font-bold">
              Premium Collection
            </span>
            <h2 className={`serif-display text-3xl md:text-4xl font-bold tracking-tight uppercase mt-1 ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}>
              THE CATALOGUE
            </h2>
          </div>

          {/* Active Filter Indicators */}
          {(selectedCategory || selectedSize) && (
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-xs font-mono flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                isDark
                  ? 'text-zinc-500 bg-zinc-900/50 border border-zinc-850'
                  : 'text-zinc-600 bg-zinc-100 border border-zinc-200'
              }`}>
                <Filter size={12} /> ACTIVE FILTERS:
              </span>
              {selectedCategory && (
                <button
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(null);
                  }}
                  className="text-xs font-bold font-sans bg-gold text-black hover:bg-gold/90 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                  title="Click to change division"
                >
                  Category: {selectedCategory} <span className="text-[9px] opacity-70 font-normal ml-1 font-mono">(Change)</span>
                </button>
              )}
              {selectedSize && (
                <button
                  onClick={() => {
                    if (onSelectSize) onSelectSize(null);
                  }}
                  className="text-xs font-bold font-sans border border-gold/40 text-gold bg-gold/10 hover:bg-gold/20 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                  title="Click to change size"
                >
                  UK/IN Size: {selectedSize} <span className={`text-[9px] font-normal ml-1 font-mono ${
                    isDark ? 'text-zinc-400' : 'text-zinc-600'
                  }`}>(Change)</span>
                </button>
              )}
              <button
                onClick={onClearFilters}
                className="text-xs font-bold tracking-wider text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/5 px-3 py-1.5 rounded-lg cursor-pointer transition-all"
              >
                RESET FILTERS
              </button>
            </div>
          )}
        </div>

        {/* Categories Sections Grid */}
        <div className="space-y-16">
          {subCategories.map((subCat) => {
            const subCatProducts = getProductsBySubCategory(subCat);
            if (subCatProducts.length === 0) return null;

            return (
              <div key={subCat} className="space-y-6">
                {/* Sub-category Header */}
                <div className={`flex items-center gap-4 border-b pb-3 ${
                  isDark ? 'border-zinc-900' : 'border-zinc-200'
                }`}>
                  <h3 className={`serif-display text-lg md:text-xl font-bold tracking-wide uppercase ${
                    isDark ? 'text-zinc-200' : 'text-zinc-800'
                  }`}>
                    {subCat}
                  </h3>
                  <span className={`font-mono text-xs px-2 py-0.5 rounded-full border ${
                    isDark
                      ? 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                  }`}>
                    {subCatProducts.length} {subCatProducts.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Sub-category Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {subCatProducts.map((product) => {
                    const isLowStock = product.stock > 0 && product.stock <= 5;
                    const isOutOfStock = product.stock === 0;

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                        className={`group border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                          isDark
                            ? 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800'
                            : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-xl text-zinc-900'
                        }`}
                      >
                        {/* Image Preview Container */}
                        <div className={`relative aspect-square w-full overflow-hidden cursor-pointer ${
                          isDark ? 'bg-zinc-900/60' : 'bg-zinc-50'
                        }`} onClick={() => onSelectProduct(product)}>
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Hover Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                            <span className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3.5 py-2 rounded-full shadow-xl border ${
                              isDark
                                ? 'text-white bg-zinc-900/80 backdrop-blur-md border-zinc-800'
                                : 'text-zinc-800 bg-white/95 backdrop-blur-md border-zinc-200'
                            }`}>
                              <Eye size={12} /> View Details
                            </span>
                          </div>

                          {/* Category Tag */}
                          <span className={`absolute top-3 left-3 backdrop-blur-md text-[10px] font-mono tracking-wider font-bold px-2 py-1 rounded-md border uppercase ${
                            isDark
                              ? 'bg-zinc-900/80 text-zinc-400 border-zinc-800/80'
                              : 'bg-white/90 text-zinc-600 border-zinc-200'
                          }`}>
                            {product.category}
                          </span>

                          {/* Stock Badges */}
                          {isOutOfStock && (
                            <span className="absolute top-3 right-3 bg-rose-500/90 text-black text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-md uppercase">
                              OUT OF STOCK
                            </span>
                          )}
                          {isLowStock && (
                            <span className="absolute top-3 right-3 bg-amber-500/95 text-black text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-md uppercase flex items-center gap-1 animate-pulse">
                              <AlertTriangle size={10} /> ONLY {product.stock} LEFT
                            </span>
                          )}
                        </div>

                        {/* Product Meta */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-mono uppercase ${
                                isDark ? 'text-zinc-500' : 'text-zinc-400 font-bold'
                              }`}>
                                {product.subCategory}
                              </span>
                              <span className="text-sm font-bold text-gold font-mono">
                                ₹{product.price}
                              </span>
                            </div>
                            <h4 className={`text-base font-bold transition-colors tracking-tight line-clamp-1 ${
                              isDark ? 'text-zinc-200 group-hover:text-white' : 'text-zinc-800 group-hover:text-gold'
                            }`}>
                              {product.name}
                            </h4>
                          </div>

                          {/* Sizing tags container */}
                          <div className="mt-4">
                            <p className={`text-[10px] font-mono mb-1.5 uppercase tracking-wider ${
                              isDark ? 'text-zinc-500' : 'text-zinc-400 font-bold'
                            }`}>
                              Available Sizes (UK/IN):
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {product.sizes.map((sz) => {
                                const isSelected = sz === selectedSize;
                                return (
                                  <span
                                    key={sz}
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                                      isSelected
                                        ? 'bg-gold text-black font-black'
                                        : isDark
                                          ? 'bg-zinc-900/60 text-zinc-400 border border-zinc-800/60'
                                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                                    }`}
                                  >
                                    {sz}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* Action button */}
                          <div className="mt-5">
                            {isOutOfStock ? (
                              <button
                                disabled
                                className={`w-full py-2.5 rounded-xl border text-xs font-bold tracking-wider uppercase cursor-not-allowed ${
                                  isDark
                                    ? 'border-zinc-800 text-zinc-500 bg-zinc-950/20'
                                    : 'border-zinc-200 text-zinc-400 bg-zinc-50'
                                }`}
                              >
                                OUT OF STOCK
                              </button>
                            ) : (
                              <button
                                onClick={() => onAddToCart(product, selectedSize || product.sizes[0])}
                                className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors duration-300 flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer ${
                                  isDark
                                    ? 'bg-white text-black hover:bg-gold hover:text-black shadow-black/20'
                                    : 'bg-zinc-900 text-white hover:bg-gold hover:text-black shadow-zinc-200/50'
                                }`}
                              >
                                <ShoppingBag size={13} />
                                ADD TO CART
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State Fallback */}
        {filteredProducts.length === 0 && (
          <div className={`text-center py-20 border border-dashed rounded-3xl max-w-md mx-auto ${
            isDark ? 'border-zinc-800 bg-zinc-950/20' : 'border-zinc-300 bg-white shadow-sm'
          }`}>
            <p className={isDark ? 'text-zinc-500' : 'text-zinc-600 font-medium'}>
              No products found matching the chosen criteria.
            </p>
            <button
              onClick={onClearFilters}
              className="mt-4 text-xs font-bold tracking-widest text-gold border border-gold/30 hover:border-gold px-4 py-2 rounded-lg bg-gold/5 hover:bg-gold/10 transition-all cursor-pointer"
            >
              SHOW ALL COLLECTION
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
