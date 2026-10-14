import React from 'react';
import { Product, Category, SubCategory } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, Eye, AlertTriangle, Check, ShoppingBag, Footprints, Home, ArrowLeft, Tag, Gift, Sparkles, Copy, Percent, Sun, Moon, Ruler, ShieldCheck, RefreshCw, CheckCircle2, ChevronDown, ChevronUp, Grid, Info, ArrowRight, Flame, Palette, Play } from 'lucide-react';
import { useProducts, getBrandConfigForProduct } from '../context/ProductContext';
import { getArticleAllColorVariants } from '../utils/articleVariants';
import { HoverZoomImage } from './HoverZoomImage';
import { ClearanceOfferPairsSection } from './ClearanceOfferPairsSection';
import { getClearanceOfferPairs, CLEARANCE_OFFERS_EVENT } from '../utils/clearanceOffers';
import { SwipeableProductThumbnail } from './SwipeableProductThumbnail';

export const COLOR_REGISTRY: Record<number, { name: string; hex: string; textClass: string; bgClass: string; borderClass: string; badgeClass: string }> = {
  1: { name: 'Black', hex: '#000000', textClass: 'text-white', bgClass: 'bg-black', borderClass: 'border-zinc-850', badgeClass: 'bg-black text-white border-zinc-700' },
  2: { name: 'Brown', hex: '#7C4B27', textClass: 'text-white', bgClass: 'bg-[#7C4B27]', borderClass: 'border-amber-850', badgeClass: 'bg-[#7C4B27] text-white border-[#5a3317]' },
  3: { name: 'Tan', hex: '#B87333', textClass: 'text-white', bgClass: 'bg-[#B87333]', borderClass: 'border-amber-700', badgeClass: 'bg-[#B87333] text-white border-[#91541c]' },
  4: { name: 'White', hex: '#FFFFFF', textClass: 'text-zinc-800', bgClass: 'bg-white', borderClass: 'border-zinc-300', badgeClass: 'bg-white text-zinc-800 border-zinc-350' },
  5: { name: 'Cherry', hex: '#7A1C1C', textClass: 'text-white', bgClass: 'bg-[#7A1C1C]', borderClass: 'border-rose-900', badgeClass: 'bg-[#7A1C1C] text-white border-[#5a1111]' },
  6: { name: 'Olive', hex: '#556B2F', textClass: 'text-white', bgClass: 'bg-[#556B2F]', borderClass: 'border-lime-900', badgeClass: 'bg-[#556B2F] text-white border-[#3e4f22]' },
  7: { name: 'Navy', hex: '#1D2A44', textClass: 'text-white', bgClass: 'bg-[#1D2A44]', borderClass: 'border-indigo-950', badgeClass: 'bg-[#1D2A44] text-white border-[#121c2f]' },
  8: { name: 'Grey', hex: '#6B7280', textClass: 'text-white', bgClass: 'bg-zinc-500', borderClass: 'border-zinc-600', badgeClass: 'bg-zinc-500 text-white border-zinc-600' }
};

export const getColorDef = (cid: number | string, product?: Product) => {
  const strId = String(cid).trim();
  if (product?.customColorMap) {
    if (product.customColorMap[strId]) return product.customColorMap[strId];
    const lowerKey = Object.keys(product.customColorMap).find(k => k.toLowerCase() === strId.toLowerCase());
    if (lowerKey) return product.customColorMap[lowerKey];
  }
  const numId = Number(strId);
  if (!isNaN(numId) && COLOR_REGISTRY[numId]) {
    return COLOR_REGISTRY[numId];
  }
  const lowerName = strId.toLowerCase();
  for (const regKey of Object.keys(COLOR_REGISTRY)) {
    const def = COLOR_REGISTRY[Number(regKey)];
    if (def && def.name.toLowerCase() === lowerName) {
      return def;
    }
  }
  return { 
    name: strId, 
    hex: strId.toLowerCase() === 'green' ? '#10B981' : '#6B7280', 
    textClass: 'text-white', 
    bgClass: 'bg-zinc-500', 
    borderClass: 'border-zinc-600', 
    badgeClass: 'bg-zinc-500 text-white border-zinc-600' 
  };
};

export const isProductAvailableInSize = (p: Product, sz: number): boolean => {
  if (!p) return false;

  // 1. Must have stock > 0 overall
  if (typeof p.stock === 'number' && p.stock <= 0) return false;

  // 2. Must list the size in its sizes array
  const hasSizeInArray = Array.isArray(p.sizes) && p.sizes.some((s) => Number(s) === Number(sz));
  if (!hasSizeInArray) return false;

  // 3. If sizeColorStock exists and has entries
  if (p.sizeColorStock && Object.keys(p.sizeColorStock).length > 0) {
    const szKey = String(sz);
    const colorStockMap = p.sizeColorStock[szKey];
    if (!colorStockMap || Object.keys(colorStockMap).length === 0) {
      // Size key is missing or empty in sizeColorStock
      return false;
    }
    const allowedColors = p.colors && p.colors.length > 0 ? p.colors.map(String) : null;
    const hasAnyStockInSize = Object.entries(colorStockMap).some(([cidStr, qty]) => {
      const q = Number(qty) || 0;
      const colorAllowed = !allowedColors || allowedColors.includes(String(cidStr));
      return q > 0 && colorAllowed;
    });
    return hasAnyStockInSize;
  }

  // 4. If sizeStock exists and has entries
  if (p.sizeStock && Object.keys(p.sizeStock).length > 0) {
    const szKey = String(sz);
    if (!(szKey in p.sizeStock)) return false;
    const qty = Number(p.sizeStock[szKey]) || 0;
    return qty > 0;
  }

  // 5. Fallback: p.sizes has sz and p.stock > 0
  return true;
};

export const getSizePairCount = (p: Product, sz: number): number => {
  if (!p) return 0;

  // 1. Check sizeColorStock
  if (p.sizeColorStock && p.sizeColorStock[String(sz)]) {
    const colorStockMap = p.sizeColorStock[String(sz)];
    const allowedColors = p.colors && p.colors.length > 0 ? p.colors.map(String) : null;
    let total = 0;
    Object.entries(colorStockMap).forEach(([cidStr, qty]) => {
      const q = Number(qty) || 0;
      if (!allowedColors || allowedColors.includes(String(cidStr))) {
        total += q;
      }
    });
    return total;
  }

  // 2. Check sizeStock
  if (p.sizeStock && String(sz) in p.sizeStock) {
    return Number(p.sizeStock[String(sz)]) || 0;
  }

  // 3. Fallback: if sz is in p.sizes, return p.stock
  if (Array.isArray(p.sizes) && p.sizes.includes(sz)) {
    return p.stock || 0;
  }

  return 0;
};

export const getColorStockInSize = (p: Product, sz: number | null, colorId: number | string): number => {
  if (!p) return 0;
  const strColor = String(colorId);
  if (sz && p.sizeColorStock && p.sizeColorStock[String(sz)]) {
    const colorMap = p.sizeColorStock[String(sz)];
    if (strColor in colorMap) return Number(colorMap[strColor]) || 0;
    const num = Number(strColor);
    if (!isNaN(num) && String(num) in colorMap) return Number(colorMap[String(num)]) || 0;
    const lower = Object.keys(colorMap).find(k => k.toLowerCase() === strColor.toLowerCase());
    if (lower) return Number(colorMap[lower]) || 0;
  }
  return p.stock || 0;
};

export const getAvailableColors = (p: Product, selectedSize?: number | null): (number | string)[] => {
  if (!p) return [];
  const allowedColors = p.colors && p.colors.length > 0 ? p.colors.map(String) : null;

  // 1. If size is selected, check sizeColorStock for that size
  if (selectedSize) {
    const szKey = String(selectedSize);
    if (p.sizeColorStock) {
      const colorStockMap = p.sizeColorStock[szKey] || {};
      const colorIds = Object.entries(colorStockMap)
        .filter(([cidStr, qty]) => Number(qty) > 0 && (!allowedColors || allowedColors.includes(String(cidStr))))
        .map(([cidStr]) => {
          const num = Number(cidStr);
          return !isNaN(num) ? num : cidStr;
        });
      return colorIds;
    }
  }

  // 2. Otherwise check sizeColorStock across all sizes
  if (p.sizeColorStock && Object.keys(p.sizeColorStock).length > 0) {
    const list: (number | string)[] = [];
    Object.values(p.sizeColorStock).forEach((colorStockMap) => {
      if (colorStockMap) {
        Object.entries(colorStockMap).forEach(([cidStr, qty]) => {
          if (Number(qty) > 0 && (!allowedColors || allowedColors.includes(String(cidStr)))) {
            const num = Number(cidStr);
            const val = !isNaN(num) ? num : cidStr;
            if (!list.includes(val)) {
              list.push(val);
            }
          }
        });
      }
    });
    return list;
  }

  // 3. Fallback to p.colors if product stock > 0
  if (p.stock > 0 && p.colors && p.colors.length > 0) {
    return p.colors;
  }

  return [];
};

// 16:9 Aspect Ratio Video Offers Banner with Instant & Scroll-Triggered Autoplay
interface OfferBannerBox169Props {
  offersBannerUrl?: string;
  isDark: boolean;
  onExploreOffers: () => void;
}

const FALLBACK_OFFERS_VIDEOS = [
  'https://assets.mixkit.co/videos/preview/mixkit-holding-a-pair-of-white-sneakers-with-neon-details-43265-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-shoes-on-the-running-track-close-up-34282-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-man-walking-with-sneakers-in-the-street-40058-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-person-walking-in-boots-on-autumn-leaves-40061-large.mp4'
];

const OfferBannerBox169: React.FC<OfferBannerBox169Props> = ({
  offersBannerUrl,
  isDark,
  onExploreOffers,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [videoIndex, setVideoIndex] = React.useState(0);

  // Determine media URL and format
  const resolvedMediaUrl = React.useMemo(() => {
    if (offersBannerUrl && offersBannerUrl.trim().length > 0 && !offersBannerUrl.includes('unsplash.com')) {
      return offersBannerUrl.trim();
    }
    return FALLBACK_OFFERS_VIDEOS[videoIndex % FALLBACK_OFFERS_VIDEOS.length];
  }, [offersBannerUrl, videoIndex]);

  const isVideo = React.useMemo(() => {
    if (!resolvedMediaUrl) return true;
    const lower = resolvedMediaUrl.toLowerCase();
    if (lower.startsWith('data:video') || lower.startsWith('blob:') || lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.includes('/videos/') || lower.includes('mixkit.co') || lower.includes('.mp4?') || lower.includes('.webm?')) {
      return true;
    }
    if (lower.includes('unsplash.com') || lower.startsWith('data:image') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp')) {
      return false;
    }
    return true;
  }, [resolvedMediaUrl]);

  // Safe playback execution helper
  const tryPlayVideo = React.useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.log('Autoplay deferred until user interaction:', err?.message || err);
          });
      }
    }
  }, []);

  // Attempt instant playback on mount & source updates
  React.useEffect(() => {
    if (isVideo) {
      tryPlayVideo();
    }
  }, [isVideo, resolvedMediaUrl, tryPlayVideo]);

  // Autoplay trigger via IntersectionObserver
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || !isVideo) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          tryPlayVideo();
        } else if (!entry.isIntersecting || entry.intersectionRatio < 0.05) {
          if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      },
      {
        threshold: [0.05, 0.15, 0.5, 0.8, 1.0],
      }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [isVideo, tryPlayVideo]);

  const handleVideoError = () => {
    console.warn('Offers video load error, switching to next fallback footwear video...');
    setVideoIndex((prev) => (prev + 1) % FALLBACK_OFFERS_VIDEOS.length);
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onClick={onExploreOffers}
      onMouseEnter={tryPlayVideo}
      onTouchStart={tryPlayVideo}
      className={`relative w-full aspect-[16/9] rounded-3xl overflow-hidden cursor-pointer group shadow-[0_20px_60px_rgba(0,0,0,0.6)] border-2 transition-all duration-500 ${
        isDark 
          ? 'border-gold/40 bg-zinc-950 hover:border-gold hover:shadow-[0_25px_70px_rgba(212,175,55,0.25)]' 
          : 'border-gold/50 bg-zinc-900 hover:border-gold hover:shadow-[0_20px_60px_rgba(212,175,55,0.3)]'
      }`}
    >
      {/* 16:9 Media Canvas (Video or Image) - Crystal Clear */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
        {isVideo ? (
          <video
            ref={videoRef}
            key={resolvedMediaUrl}
            src={resolvedMediaUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-cover brightness-100 transition-transform duration-700 ease-out group-hover:scale-105"
            onLoadedData={tryPlayVideo}
            onCanPlay={tryPlayVideo}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={handleVideoError}
          />
        ) : (
          <img
            src={resolvedMediaUrl}
            alt="Offers Showcase"
            className="w-full h-full object-cover brightness-100 transition-transform duration-700 ease-out group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={() => {
              setVideoIndex((prev) => (prev + 1) % FALLBACK_OFFERS_VIDEOS.length);
            }}
          />
        )}
      </div>

      {/* Subtle play indicator overlay if paused by strict browser autoplay settings */}
      {!isPlaying && isVideo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-14 h-14 rounded-full bg-black/60 border border-gold/40 text-gold flex items-center justify-center backdrop-blur-xs shadow-xl animate-pulse">
            <Play size={24} className="ml-1 fill-gold text-gold" />
          </div>
        </div>
      )}

      {/* Subtle bottom gradient to ensure clean white text legibility without blocking the video */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

      {/* Bottom White Text for Explore Offers */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6 flex items-center justify-center">
        <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-black/40 backdrop-blur-xs border border-white/20 text-white transition-all duration-300 group-hover:bg-black/60 group-hover:border-white/40 group-hover:scale-105 shadow-lg">
          <span className="serif-display text-sm sm:text-base md:text-lg font-bold tracking-widest uppercase text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Explore Offers
          </span>
          <ArrowRight size={16} className="text-white shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </motion.div>
  );
};

interface ProductSectionProps {
  products: Product[];
  selectedCategory: Category | null;
  selectedSize: number | null;
  onClearFilters: () => void;
  onSelectProduct: (product: Product, initialColorId?: number | string) => void;
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
  const { offersBannerUrl, offersCategoryBgUrl, categoryThumbMen, categoryThumbWomen, categoryThumbKids, brandConfigs } = useProducts();

  // Floating Filter Panel state for brand and color refining
  const [selectedBrand, setSelectedBrand] = React.useState<string | null>(null);
  const [selectedColor, setSelectedColor] = React.useState<number | string | null>(null);

  const handleClearAllFilters = () => {
    setSelectedBrand(null);
    setSelectedColor(null);
    onClearFilters();
  };

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

  // Filter products based on selectedCategory, selectedSize, selectedBrand, selectedColor
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      const matchesSize = selectedSize ? isProductAvailableInSize(p, selectedSize) : true;
      const matchesBrand = selectedBrand ? (p.brand?.toLowerCase() === selectedBrand.toLowerCase()) : true;
      const matchesColor = selectedColor !== null 
        ? getAvailableColors(p, selectedSize).some(c => String(c).toLowerCase() === String(selectedColor).toLowerCase()) 
        : true;
      return matchesCategory && matchesSize && matchesBrand && matchesColor;
    });
  }, [products, selectedCategory, selectedSize, selectedBrand, selectedColor]);

  const [offersRevision, setOffersRevision] = React.useState(0);

  React.useEffect(() => {
    const handleOffersUpdate = () => {
      setOffersRevision((prev) => prev + 1);
    };
    window.addEventListener(CLEARANCE_OFFERS_EVENT, handleOffersUpdate);
    window.addEventListener('storage', handleOffersUpdate);
    return () => {
      window.removeEventListener(CLEARANCE_OFFERS_EVENT, handleOffersUpdate);
      window.removeEventListener('storage', handleOffersUpdate);
    };
  }, []);

  // Top Priority Offer Products
  const topOfferPairs = React.useMemo(() => {
    const baseOffers = getClearanceOfferPairs(products, selectedCategory, selectedSize);
    return baseOffers.filter((o) => {
      const matchesBrand = selectedBrand ? (o.product.brand?.toLowerCase() === selectedBrand.toLowerCase()) : true;
      const matchesColor = selectedColor !== null 
        ? getAvailableColors(o.product, selectedSize).some(c => String(c).toLowerCase() === String(selectedColor).toLowerCase()) 
        : true;
      return matchesBrand && matchesColor;
    });
  }, [products, selectedCategory, selectedSize, selectedBrand, selectedColor, offersRevision]);

  const offerProductIdSet = React.useMemo(() => {
    return new Set(topOfferPairs.map((o) => o.productId));
  }, [topOfferPairs]);

  // Group products by sub-category
  const getProductsBySubCategory = (subCat: SubCategory) => {
    return filteredProducts.filter((p) => p.subCategory === subCat);
  };

  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);
  const [showOffers, setShowOffers] = React.useState(false);
  const [showSizeGuide, setShowSizeGuide] = React.useState(false);
  const [hoveredSize, setHoveredSize] = React.useState<number | null>(null);

  const getSizeDetails = (cat: Category | null, sz: number) => {
    if (cat === 'Men') {
      const map: Record<number, { eu: string; us: string; cm: string; popular?: boolean }> = {
        6: { eu: '40', us: '7', cm: '24.5 cm' },
        7: { eu: '41', us: '8', cm: '25.5 cm', popular: true },
        8: { eu: '42', us: '9', cm: '26.5 cm', popular: true },
        9: { eu: '43', us: '10', cm: '27.5 cm', popular: true },
        10: { eu: '44', us: '11', cm: '28.5 cm', popular: true },
        11: { eu: '45', us: '12', cm: '29.5 cm' },
        12: { eu: '46', us: '13', cm: '30.5 cm' },
      };
      return map[sz] || { eu: `${sz + 34}`, us: `${sz + 1}`, cm: `${22 + sz} cm` };
    } else if (cat === 'Women') {
      const map: Record<number, { eu: string; us: string; cm: string; popular?: boolean }> = {
        5: { eu: '38', us: '6', cm: '23.5 cm' },
        6: { eu: '39', us: '7', cm: '24.5 cm', popular: true },
        7: { eu: '40', us: '8', cm: '25.5 cm', popular: true },
        8: { eu: '41', us: '9', cm: '26.5 cm', popular: true },
        9: { eu: '42', us: '10', cm: '27.5 cm' },
        10: { eu: '43', us: '11', cm: '28.5 cm' },
        11: { eu: '44', us: '12', cm: '29.5 cm' },
      };
      return map[sz] || { eu: `${sz + 33}`, us: `${sz + 1}`, cm: `${21 + sz} cm` };
    } else {
      return { eu: `${sz + 28}`, us: `${sz}`, cm: `${14 + sz} cm` };
    }
  };

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
    const bgImage = offersCategoryBgUrl && offersCategoryBgUrl.trim().length > 0
      ? offersCategoryBgUrl.trim()
      : (offersBannerUrl && offersBannerUrl.trim().length > 0 && !offersBannerUrl.includes('mixkit.co') && !offersBannerUrl.endsWith('.mp4')
          ? offersBannerUrl.trim()
          : 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2000&auto=format&fit=crop');

    return (
      <section
        id="products-section"
        className={`pt-24 pb-8 sm:pt-28 sm:pb-12 px-3 sm:px-6 md:px-12 relative border-t transition-all duration-500 ${
          isDark 
            ? 'bg-[#0a0a0c] text-white border-zinc-800' 
            : 'bg-[#f6f6f8] text-zinc-900 border-zinc-300'
        }`}
      >
        {/* Subtle Decorative Ambient Glow on Dark Theme */}
        {isDark && (
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] bg-gold/5 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none -z-10" />
        )}

        <div className="w-full max-w-5xl mx-auto space-y-3 sm:space-y-4">
          {/* Top Page Title: OFFERS CATALOGUE */}
          <div className="text-center pt-1 pb-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-black tracking-widest uppercase text-gold drop-shadow-sm flex items-center justify-center gap-2 sm:gap-4">
              <span className="h-px w-6 sm:w-14 bg-gold/40"></span>
              <span>OFFERS CATALOGUE</span>
              <span className="h-px w-6 sm:w-14 bg-gold/40"></span>
            </h1>
          </div>

          {/* Top Elegant Breadcrumbs & Progress Steps */}
          <div className="flex flex-row items-center justify-between gap-2 sm:gap-6 pb-2 border-b border-zinc-500/10 dark:border-zinc-800/40">
            {/* Back to Home Button */}
            <button
              onClick={() => {
                setIsOfferFlowActive(false);
                setOfferFlowCategory(null);
                setOfferFlowStep('category');
              }}
              className={`text-[9px] sm:text-[10px] font-mono tracking-wider sm:tracking-widest uppercase font-black flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border transition-all duration-300 active:scale-95 cursor-pointer shadow-sm ${
                isDark
                  ? 'bg-zinc-900/80 text-white border-zinc-800/70 hover:border-gold hover:text-gold'
                  : 'bg-white text-zinc-800 border-zinc-200/80 hover:border-gold hover:text-gold'
              }`}
            >
              <ArrowLeft size={11} className="text-gold shrink-0" />
              <span>Back to Home</span>
            </button>

            {/* Offer Section Steps indicator */}
            <div className="text-[8px] sm:text-[10px] font-mono tracking-wider sm:tracking-[0.18em] font-black text-gold bg-gold/10 dark:bg-gold/5 border border-gold/20 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg uppercase flex items-center gap-1.5">
              <span className="hidden xs:inline opacity-80">OFFER SECTION •</span>
              <span>Step 1 • Choose Category</span>
            </div>
          </div>

          {/* 9:16 Ratio Container with Background Image & Category Buttons Overlaid */}
          <div className="w-full max-w-[360px] sm:max-w-[400px] mx-auto aspect-[9/16] relative rounded-3xl overflow-hidden border border-zinc-700/80 dark:border-zinc-800 shadow-2xl flex flex-col justify-between p-5 sm:p-7">
            {/* Background Image - Bright, Vibrant, High Visibility */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src={bgImage}
                alt="Footwear Workshop Collection"
                className="w-full h-full object-cover object-center brightness-100 contrast-105 scale-100 transition-transform duration-1000 hover:scale-105"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2000&auto=format&fit=crop';
                }}
              />
              {/* Balanced subtle vignette for legibility while keeping the background image beautifully clear and prominent */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/70 pointer-events-none" />
            </div>

            {/* Header Content on top of Background Image */}
            <div className="relative z-10 text-center space-y-1.5 pt-2">
              <span className="inline-block text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-[0.22em] text-gold bg-black/60 border border-gold/40 px-3 py-0.5 rounded-full backdrop-blur-md shadow-md">
                OFFER SECTION • WORKSHOP DEALS
              </span>
              <h2 className="serif-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                SELECT YOUR CATEGORY
              </h2>
            </div>

            {/* Middle open space to keep background image completely unobstructed */}
            <div className="flex-1 min-h-[160px] pointer-events-none" />

            {/* Category Buttons Styled Like Home Page Category Buttons */}
            <div className="relative z-10 w-full space-y-2 font-sans mt-auto mb-1">
              {[
                { key: 'Men' as Category, label: "OFFERS FOR MEN'S" },
                { key: 'Women' as Category, label: "OFFERS FOR WOMEN'S" },
                { key: 'Kids' as Category, label: 'OFFERS FOR KIDS' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setOfferFlowCategory(item.key);
                    setOfferFlowStep('size');
                  }}
                  className="w-full py-2 sm:py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer border shadow-lg shadow-black/40 glass-panel text-white border-white/25 hover:bg-white hover:text-black hover:border-white active:scale-98 flex items-center justify-center gap-2 backdrop-blur-md"
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Footer Trust Marker */}
            <div className="relative z-10 text-center pb-1">
              <span className="text-[8px] sm:text-[9px] font-mono text-zinc-200 uppercase tracking-widest font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                ✨ Handcrafted Workshop Footwear
              </span>
            </div>
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
        className={`pt-20 pb-12 sm:pt-24 sm:pb-16 px-3 sm:px-6 md:px-12 relative min-h-[85vh] flex items-center justify-center transition-colors duration-500 ${
          isDark ? 'bg-transparent text-white' : 'bg-transparent text-zinc-900'
        }`}
      >
        {/* Ambient background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[550px] h-[300px] sm:h-[550px] bg-gold/5 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none -z-10" />

        <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Top Page Title: OFFERS CATALOGUE */}
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-black tracking-widest uppercase text-gold drop-shadow-sm flex items-center justify-center gap-2 sm:gap-4">
              <span className="h-px w-6 sm:w-14 bg-gold/40"></span>
              <span>OFFERS CATALOGUE</span>
              <span className="h-px w-6 sm:w-14 bg-gold/40"></span>
            </h1>
          </div>

          {/* Navigation Bar */}
          <div className="flex flex-row items-center justify-between gap-2 sm:gap-6 pb-2 border-b border-zinc-500/10 dark:border-zinc-800/40">
            {/* Back Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setOfferFlowStep('category');
                  setOfferFlowCategory(null);
                }}
                className={`text-[10px] sm:text-xs font-mono tracking-wider uppercase font-bold flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border transition-all duration-300 active:scale-95 cursor-pointer shadow-xs whitespace-nowrap ${
                  isDark
                    ? 'bg-zinc-900/90 text-white border-zinc-800 hover:border-gold hover:text-gold'
                    : 'bg-white text-zinc-800 border-zinc-200 hover:border-gold hover:text-gold'
                }`}
              >
                <ArrowLeft size={12} className="text-gold shrink-0" />
                <span>Categories</span>
              </button>

              <button
                onClick={() => {
                  setIsOfferFlowActive(false);
                  setOfferFlowCategory(null);
                  setOfferFlowStep('category');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`text-[10px] sm:text-xs font-mono tracking-wider uppercase font-bold flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border transition-all duration-300 active:scale-95 cursor-pointer shadow-xs whitespace-nowrap ${
                  isDark
                    ? 'bg-zinc-900/60 text-zinc-300 border-zinc-800 hover:border-gold hover:text-gold'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:border-gold hover:text-gold'
                }`}
              >
                <Home size={12} className="text-gold shrink-0" />
                <span className="hidden xs:inline">Home</span>
              </button>
            </div>

            {/* Selected Category Pill */}
            <div className="text-[9px] sm:text-[11px] font-mono uppercase tracking-wider font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 bg-gold/10 text-gold border border-gold/30 shadow-xs">
              <span className="opacity-80">Division:</span>
              <strong className="font-black">{offerFlowCategory === 'Men' ? "MEN'S" : offerFlowCategory === 'Women' ? "WOMEN'S" : offerFlowCategory}</strong>
            </div>
          </div>

          {/* Luxury Card Container for Size Selection */}
          <div className={`p-5 sm:p-8 rounded-3xl border shadow-xl backdrop-blur-md transition-all duration-300 ${
            isDark
              ? 'bg-zinc-950/80 border-zinc-800/80 shadow-black/50'
              : 'bg-white/95 border-zinc-200/80 shadow-zinc-200/50'
          }`}>
            {/* Header within Card */}
            <div className="text-center space-y-1.5 mb-5 sm:mb-7">
              <span className="inline-block text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-[0.22em] text-gold bg-gold/10 dark:bg-gold/5 border border-gold/30 px-3 py-0.5 rounded-full">
                STEP 2 • CHOOSE YOUR SHOE SIZE
              </span>
              <h2 className="serif-display text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white drop-shadow-xs">
                SELECT SIZE FOR {offerFlowCategory === 'Men' ? "MEN'S" : offerFlowCategory === 'Women' ? "WOMEN'S" : (offerFlowCategory || 'FOOTWEAR')}
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-sans max-w-md mx-auto">
                Tap your exact size to unlock available warehouse liquidation pairs & clearance deals.
              </p>
            </div>

            {/* Elegant Sizing Grid with Modern Luxury Card Styling */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4 max-w-3xl mx-auto">
              {sizes.map((size) => {
                const offerDealsCount = getClearanceOfferPairs(products, offerFlowCategory, size).length;
                const hasOffers = offerDealsCount > 0;

                return (
                  <button
                    key={size}
                    onClick={() => {
                      setOfferFlowSize(size);
                      setOfferFlowStep('results');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`group relative flex flex-col items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all duration-300 active:scale-95 cursor-pointer shadow-md hover:-translate-y-1 hover:shadow-xl ${
                      isDark
                        ? hasOffers
                          ? 'bg-gradient-to-b from-zinc-900/90 to-zinc-950 border-zinc-800 hover:border-gold hover:shadow-gold/10'
                          : 'bg-zinc-950/60 border-zinc-850 hover:border-zinc-700 opacity-80'
                        : hasOffers
                          ? 'bg-gradient-to-b from-white to-amber-50/30 border-zinc-200 hover:border-gold hover:shadow-amber-500/10'
                          : 'bg-zinc-50 border-zinc-200/80 hover:border-zinc-400 opacity-80'
                    }`}
                  >
                    {/* Top Label: UK/IN + Status Dot */}
                    <div className="w-full flex items-center justify-between">
                      <span className={`text-[8px] font-mono font-bold uppercase tracking-wider ${
                        isDark ? 'text-zinc-500 group-hover:text-gold' : 'text-zinc-400 group-hover:text-amber-800'
                      }`}>
                        UK/IN
                      </span>
                      <div className={`w-2 h-2 rounded-full transition-colors ${
                        hasOffers 
                          ? 'bg-gold shadow-xs shadow-gold/60' 
                          : (isDark ? 'bg-zinc-800' : 'bg-zinc-300')
                      }`} />
                    </div>

                    {/* Prominent Size Number */}
                    <span className="serif-display text-2xl sm:text-3xl md:text-3.5xl font-black tracking-tight text-zinc-900 dark:text-white group-hover:text-gold transition-colors my-1.5">
                      {size}
                    </span>

                    {/* Bottom Offer Styles Badge */}
                    <div className={`w-full py-1 px-1.5 rounded-lg text-[8px] sm:text-[9px] font-mono font-black uppercase text-center tracking-tight transition-all duration-300 ${
                      hasOffers
                        ? 'bg-gold/15 text-gold border border-gold/30 group-hover:bg-gold group-hover:text-black'
                        : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/15'
                    }`}>
                      {hasOffers ? `⚡ ${offerDealsCount} ${offerDealsCount === 1 ? 'Style' : 'Styles'}` : '0 Styles'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer Trust Marker */}
            <div className="text-center pt-5 sm:pt-7">
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-bold">
                ✨ Certified Warehouse Clearance • Instant Size Matching
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Step 3: Exclusive Workshop Offer Pairs Results (Filtered purely by Category & Size)
  if (isOfferFlowActive && offerFlowStep === 'results' && offerFlowCategory && offerFlowSize) {
    const clearanceOfferPairs = getClearanceOfferPairs(products, offerFlowCategory, offerFlowSize);

    return (
      <section
        id="products-section"
        className={`pt-20 pb-16 sm:pt-24 sm:pb-24 px-3 sm:px-6 md:px-12 min-h-screen relative border-t transition-colors duration-500 ${
          isDark ? 'bg-transparent text-white border-zinc-900/20' : 'bg-transparent text-zinc-900 border-zinc-200'
        }`}
      >
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          {/* Main Page Title Header */}
          <div className="text-center pt-2 pb-1 space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black tracking-widest uppercase text-gold drop-shadow-sm flex items-center justify-center gap-2 sm:gap-4">
              <span className="h-px w-6 sm:w-16 bg-gold/40"></span>
              <span>OFFERS CATALOGUE</span>
              <span className="h-px w-6 sm:w-16 bg-gold/40"></span>
            </h1>
            <div className="flex items-center justify-center gap-2 flex-wrap text-xs sm:text-sm font-mono text-zinc-400">
              <span className="uppercase font-bold tracking-wider text-amber-500">
                {offerFlowCategory === 'Men' ? "MEN'S COLLECTION" : offerFlowCategory === 'Women' ? "WOMEN'S COLLECTION" : `${offerFlowCategory}'S COLLECTION`}
              </span>
              <span>•</span>
              <span className="font-bold text-zinc-300 dark:text-zinc-300">
                UK/IN SIZE {offerFlowSize}
              </span>
              <span>•</span>
              <span className="text-zinc-500">
                Workshop Liquidation & Dead-stock Clearance
              </span>
            </div>
          </div>

          {/* Interactive Catalogue Header Bar */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border shadow-md transition-all ${
            isDark
              ? 'bg-zinc-950/80 border-zinc-800 shadow-black/40'
              : 'bg-white border-zinc-200/90 shadow-zinc-200/40'
          }`}>
            {/* Top Controls: Back Button, Category & Size Controls, Count Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Back to Home Button */}
                <button
                  onClick={() => {
                    setIsOfferFlowActive(false);
                    setOfferFlowCategory(null);
                    setOfferFlowSize(null);
                    setOfferFlowStep('category');
                    if (onClearFilters) onClearFilters();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border text-xs font-mono font-bold tracking-wide transition-all duration-200 active:scale-95 cursor-pointer shadow-xs whitespace-nowrap ${
                    isDark
                      ? 'bg-zinc-900 text-white border-zinc-800 hover:border-gold hover:text-gold'
                      : 'bg-zinc-50 text-zinc-800 border-zinc-200 hover:border-gold hover:text-gold'
                  }`}
                  title="Back to Home"
                >
                  <Home size={13} className="text-gold shrink-0 stroke-[2.5px]" />
                  <span>Back to Home</span>
                </button>

                {/* Change Category Button */}
                <button
                  onClick={() => {
                    setOfferFlowStep('category');
                    setOfferFlowCategory(null);
                    setOfferFlowSize(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border text-xs font-mono uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer active:scale-95 shadow-xs whitespace-nowrap ${
                    isDark
                      ? 'bg-zinc-900/90 text-zinc-200 border-zinc-800 hover:border-gold/50'
                      : 'bg-amber-50/80 text-zinc-800 border-amber-200/80 hover:border-gold'
                  }`}
                  title="Change Category"
                >
                  <RefreshCw size={12} className="text-gold shrink-0" />
                  <span>Category: <strong className="text-gold">{offerFlowCategory}</strong></span>
                </button>

                {/* Change Size Button */}
                <button
                  onClick={() => {
                    setOfferFlowStep('size');
                    setOfferFlowSize(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border text-xs font-mono uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer active:scale-95 shadow-xs whitespace-nowrap ${
                    isDark
                      ? 'bg-zinc-900/90 text-zinc-200 border-zinc-800 hover:border-gold/50'
                      : 'bg-amber-50/80 text-zinc-800 border-amber-200/80 hover:border-gold'
                  }`}
                  title="Change Size"
                >
                  <Ruler size={12} className="text-gold shrink-0" />
                  <span>Size: <strong className="text-gold">UK/IN {offerFlowSize}</strong></span>
                </button>
              </div>

              {/* Total Available Offers Badge */}
              <div className="flex items-center gap-2">
                <span className={`text-[10px] sm:text-xs font-mono uppercase tracking-wider font-bold px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 ${
                  isDark
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}>
                  <Flame size={12} className="text-amber-500 animate-pulse" />
                  <span>
                    <strong>{clearanceOfferPairs.length}</strong> {clearanceOfferPairs.length === 1 ? 'Offer Pair Available' : 'Offer Pairs Available'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Section Sub-Header / Summary */}
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[9px] sm:text-[10px] text-amber-500 uppercase tracking-widest font-black px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center gap-1">
                <Flame size={11} className="text-amber-500 animate-pulse" /> WORKSHOP PRIVILEGES
              </span>
              <span className={`text-xs font-mono font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                • {offerFlowCategory} • UK/IN Size {offerFlowSize}
              </span>
            </div>

            <h2 className={`serif-display text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}>
              {offerFlowCategory}'s Exclusive Offer Pairs
            </h2>
            <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Certified original workshop clearance pairs and dead-stock liquidation matched strictly to your foot size.
            </p>
          </div>

          {/* Exclusive Offer Pairs Grid - Styled as Exact Catalogue Cards */}
          {clearanceOfferPairs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 pt-2">
              {clearanceOfferPairs.map((pair) => {
                const product = pair.product;
                const isLowStock = pair.stockPairsInSize > 0 && pair.stockPairsInSize <= 3;
                const pairBrandConfig = getBrandConfigForProduct(product, brandConfigs);

                const rawArticle = (product as any).articleCode || (product as any).rawArticleCode || product.barcode || product.id || 'W5687';
                const cleanArticle = String(rawArticle).replace(/^[#\-_/]+/, '').trim().toUpperCase();

                // Extract colors specifically available in this selected size
                const availColorIds = getAvailableColors(product, offerFlowSize);
                const seenColorNames = new Set<string>();
                const uniqueColors: { name: string; hex: string }[] = [];
                
                if (availColorIds.length > 0) {
                  for (const cid of availColorIds) {
                    const cDef = getColorDef(cid, product);
                    const key = cDef.name.trim().toLowerCase();
                    if (!seenColorNames.has(key)) {
                      seenColorNames.add(key);
                      uniqueColors.push({ name: cDef.name, hex: cDef.hex });
                    }
                  }
                } else if (product.sizeColorStock && product.sizeColorStock[String(offerFlowSize)]) {
                  const sizeMap = product.sizeColorStock[String(offerFlowSize)];
                  Object.entries(sizeMap).forEach(([cid, qty]) => {
                    if (Number(qty) > 0) {
                      const cDef = getColorDef(cid, product);
                      const key = cDef.name.trim().toLowerCase();
                      if (!seenColorNames.has(key)) {
                        seenColorNames.add(key);
                        uniqueColors.push({ name: cDef.name, hex: cDef.hex });
                      }
                    }
                  });
                }

                return (
                  <motion.div
                    key={pair.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.25 }}
                    className={`relative rounded-3xl border overflow-hidden transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-xl ${
                      isDark
                        ? 'bg-zinc-950/80 border-zinc-800 hover:border-gold/60 shadow-black/40'
                        : 'bg-white border-zinc-200 hover:border-amber-400 shadow-zinc-100/80'
                    }`}
                  >
                    {/* Top Image Frame with 1:1 Square Ratio and Corner Ribbon */}
                    <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-b from-zinc-50 to-zinc-100/70 dark:bg-zinc-900/90 border-b border-zinc-150 dark:border-zinc-800/80">
                      {/* Diagonal Corner Ribbon - Top-Right (% OFF Tag matching reference) */}
                      {pair.discountPercentage > 0 && (
                        <div className="absolute top-0 right-0 w-24 h-24 sm:w-28 sm:h-28 overflow-hidden pointer-events-none z-20">
                          <div className="absolute top-[16px] -right-[32px] sm:top-[20px] sm:-right-[30px] w-[120px] sm:w-[130px] transform rotate-45 bg-[#ff9900] text-black font-black font-mono text-[9px] sm:text-[10.5px] py-1 text-center shadow-md tracking-wider uppercase leading-tight select-none">
                            {pair.discountPercentage}% OFF
                          </div>
                        </div>
                      )}

                      {/* Footwear Image */}
                      <SwipeableProductThumbnail
                        product={product}
                        onClick={() => onSelectProduct(product)}
                        objectFit="contain"
                        theme={isDark ? 'dark' : 'light'}
                        zoomScale={1.5}
                        imageClassName="w-full h-full object-contain p-4 sm:p-5 transition-transform duration-500 group-hover:scale-105"
                        containerClassName="w-full h-full cursor-pointer flex items-center justify-center"
                        badgeOverlay={
                          <>
                            {/* Brand Logo - Bottom-Left Corner (Prominently sized high-definition white card) */}
                            <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
                              {pairBrandConfig && pairBrandConfig.logoUrl ? (
                                <div
                                  title={pairBrandConfig.brandName}
                                  className="h-12 sm:h-14 px-4 sm:px-5 py-1.5 rounded-2xl bg-white shadow-xl border border-zinc-200/90 ring-2 ring-black/5 flex items-center justify-center max-w-[150px] sm:max-w-[175px] shrink-0 transition-transform duration-200 group-hover:scale-105"
                                >
                                  <img
                                    src={pairBrandConfig.logoUrl}
                                    alt={pairBrandConfig.brandName}
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

                            {/* Hover Overlay */}
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
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                      <div className="space-y-2">
                        {/* Line 1: Brand • Category • SubCategory • Logo */}
                        <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono uppercase tracking-wider">
                          <span className={`font-black ${isDark ? 'text-gold' : 'text-amber-700'}`}>
                            {pairBrandConfig?.brandName || product.brand || 'WALKAROO'}
                          </span>
                          <span className="text-zinc-400 font-normal">•</span>
                          <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                            {product.category || offerFlowCategory}
                          </span>
                          {product.subCategory && (
                            <>
                              <span className="text-zinc-400 font-normal">•</span>
                              <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                                {product.subCategory}
                              </span>
                            </>
                          )}
                          {pairBrandConfig?.logoUrl && (
                            <span className="inline-flex items-center bg-white px-2 py-0.5 rounded-md shadow-2xs border border-zinc-200/90 ml-0.5">
                              <img
                                src={pairBrandConfig.logoUrl}
                                alt={pairBrandConfig.brandName}
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
                              {cleanArticle}
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
                        {uniqueColors.length > 0 && (
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
                        )}
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
                              onAddToCart(
                                {
                                  ...product,
                                  price: pair.offerPrice,
                                  name: `${product.name} (Special Offer - Size ${offerFlowSize})`
                                },
                                offerFlowSize
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
          ) : (
            /* Clean Empty State */
            <div className={`p-8 sm:p-14 text-center rounded-3xl border space-y-4 max-w-xl mx-auto my-8 ${
              isDark ? 'bg-zinc-950/40 border-zinc-800 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700 shadow-sm'
            }`}>
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                <Sparkles size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="serif-display text-lg sm:text-xl font-bold uppercase">
                  No Active Offers in Size UK/IN {offerFlowSize}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
                  All clearance pairs for {offerFlowCategory} in UK/IN Size {offerFlowSize} are currently sold out. Please select another size or explore the regular collection.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={() => {
                    setOfferFlowStep('size');
                    setOfferFlowSize(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-mono uppercase font-bold border transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-zinc-900 text-white border-zinc-800 hover:border-gold hover:text-gold'
                      : 'bg-zinc-100 text-zinc-800 border-zinc-200 hover:border-gold hover:text-gold'
                  }`}
                >
                  Choose Another Size
                </button>

                <button
                  onClick={() => {
                    setIsOfferFlowActive(false);
                    setOfferFlowCategory(null);
                    setOfferFlowSize(null);
                    if (onClearFilters) onClearFilters();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-mono uppercase font-bold bg-amber-500 text-black hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  Browse Regular Collection
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Render Home Category & Workshop Privileges Banner Screen (if no category chosen yet)
  if (!selectedCategory) {
    return (
      <section
        id="products-section"
        className={`py-8 sm:py-16 px-3 sm:px-6 md:px-10 relative border-t transition-colors duration-500 ${
          isDark ? 'bg-transparent text-white border-zinc-900/20' : 'bg-transparent text-zinc-900 border-zinc-200'
        }`}
      >
        <div className="w-full max-w-3xl md:max-w-4xl mx-auto">
          {/* 16:9 Luxury Cinematic Offers Banner */}
          <OfferBannerBox169
            offersBannerUrl={offersBannerUrl}
            isDark={isDark}
            onExploreOffers={() => {
              setIsOfferFlowActive(true);
              setOfferFlowStep('category');
              setOfferFlowCategory(null);
              setOfferFlowSize(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
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
        className={`pt-24 pb-8 sm:pt-28 sm:pb-12 px-3 sm:px-6 relative border-t transition-colors duration-500 ${
          isDark ? 'bg-transparent text-white border-zinc-900/20' : 'bg-transparent text-zinc-900 border-zinc-200'
        }`}
      >
        <div className="w-full max-w-4xl mx-auto">
          {/* Main Glassmorphic Compact Card Container */}
          <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 border transition-all duration-500 shadow-xl relative overflow-hidden backdrop-blur-2xl ${
            isDark 
              ? 'bg-gradient-to-b from-zinc-950/95 via-zinc-900/90 to-zinc-950/95 border-gold/25 shadow-gold/5 ring-1 ring-gold/15' 
              : 'bg-gradient-to-b from-white via-zinc-50/95 to-amber-50/30 border-zinc-200/90 shadow-lg ring-1 ring-zinc-300/60'
          }`}>
            
            {/* Ambient Gold Radial Glow Aura */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Dedicated Top Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 sm:pb-4 border-b border-zinc-800/40 relative z-10">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Back to Home Button */}
                <button
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(null);
                    if (onSelectSize) onSelectSize(null);
                    onClearFilters();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border text-xs font-mono font-bold tracking-wide transition-all duration-200 active:scale-95 cursor-pointer shadow-sm whitespace-nowrap ${
                    isDark
                      ? 'bg-zinc-900 text-white border-zinc-800 hover:border-gold hover:text-gold shadow-black/40'
                      : 'bg-white text-zinc-800 border-zinc-200 hover:border-gold hover:text-gold shadow-zinc-200/50'
                  }`}
                  title="Back to Home"
                >
                  <Home size={14} className="text-gold shrink-0 stroke-[2.5px]" />
                  <span>Back to Home</span>
                </button>

                {/* Change Category Button - Prominent Highlighted Category Badge */}
                <button
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(null);
                    if (onSelectSize) onSelectSize(null);
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border transition-all duration-200 cursor-pointer active:scale-95 shadow-sm whitespace-nowrap ${
                    isDark
                      ? 'bg-zinc-900/95 text-zinc-200 border-gold/40 hover:border-gold hover:bg-zinc-850'
                      : 'bg-amber-50/90 text-zinc-800 border-amber-300 hover:border-gold shadow-amber-100/60'
                  }`}
                  title="Click to Change Category"
                >
                  <RefreshCw size={13} className="text-gold shrink-0" />
                  <span className="text-[11px] sm:text-xs font-mono uppercase font-bold text-zinc-400">Category:</span>
                  <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-black bg-gold px-2.5 py-0.5 rounded-md shadow-xs ring-1 ring-amber-300">
                    {selectedCategory}
                  </span>
                </button>
              </div>
            </div>

            {/* Centered Title Section */}
            <div className="text-center pt-2 pb-3 sm:pb-4 relative z-10 space-y-1">
              <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.2em] font-black px-2.5 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 inline-block">
                STEP 2 • SIZING FILTER
              </span>
              <h2 className={`serif-display text-lg sm:text-2xl md:text-3xl font-black tracking-tight uppercase ${
                isDark ? 'text-white' : 'text-zinc-900'
              }`}>
                SELECT <span className="text-gold font-extrabold">{selectedCategory?.toUpperCase()}'S</span> SIZE
              </h2>
            </div>

            {/* Sizes Grid - Prominently Placed in Initial View Frame */}
            <div className="relative z-10 space-y-3">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 sm:gap-3 max-w-3xl mx-auto">
                {sizes.map((size) => {
                  const details = getSizeDetails(selectedCategory, size);
                  const countForSize = products.filter(
                    (p) => p.category === selectedCategory && isProductAvailableInSize(p, size)
                  ).length;
                  return (
                    <motion.button
                      key={size}
                      whileHover={{ y: -3, scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onMouseEnter={() => setHoveredSize(size)}
                      onMouseLeave={() => setHoveredSize(null)}
                      onClick={() => {
                        if (onSelectSize) onSelectSize(size);
                      }}
                      className={`group relative flex flex-col items-center justify-center p-2.5 min-h-[80px] sm:min-h-[90px] rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer shadow-md ${
                        countForSize === 0 ? 'opacity-50' : ''
                      } ${
                        isDark
                          ? 'border-zinc-800/90 bg-zinc-900/80 text-white hover:border-gold hover:bg-gradient-to-b hover:from-amber-400 hover:to-amber-500 hover:text-black shadow-black/60'
                          : 'border-zinc-200 bg-white text-zinc-900 hover:border-gold hover:bg-gradient-to-b hover:from-amber-400 hover:to-amber-500 hover:text-black shadow-slate-200/60'
                      }`}
                    >
                      {/* Popular Badge */}
                      {details.popular && (
                        <span className="absolute -top-2 px-2 py-0.5 rounded-full text-[7px] font-mono font-black uppercase tracking-wider bg-gold text-black border border-amber-300 shadow-sm">
                          POPULAR
                        </span>
                      )}

                      {/* Main Size Label */}
                      <span className="font-mono text-xl sm:text-2xl font-black tracking-tight block group-hover:scale-105 transition-transform">
                        {size}
                      </span>

                      {/* Available Inventory Badge */}
                      <span className={`text-[8px] font-mono font-bold uppercase tracking-tight group-hover:text-black/80 mt-1 ${
                        countForSize > 0
                          ? isDark ? 'text-emerald-400 font-bold' : 'text-emerald-700 font-bold'
                          : 'text-rose-400'
                      }`}>
                        {countForSize > 0 ? `${countForSize} styles` : '0 styles'}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Live Size Hover Tooltip Banner */}
              <div className={`py-2 px-3 rounded-xl border text-center transition-all max-w-md mx-auto flex items-center justify-center gap-2 ${
                isDark ? 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400' : 'bg-white/80 border-zinc-200 text-zinc-600'
              }`}>
                <Info size={13} className="text-gold shrink-0" />
                <span className="text-[11px] font-mono">
                  {hoveredSize ? (
                    <>
                      Size <strong className="text-gold font-black">{hoveredSize}</strong>: EU {getSizeDetails(selectedCategory, hoveredSize).eu} | US {getSizeDetails(selectedCategory, hoveredSize).us} ({getSizeDetails(selectedCategory, hoveredSize).cm})
                    </>
                  ) : (
                    <>Click your size to load inventory</>
                  )}
                </span>
              </div>

              {/* Size Guide Toggle - Positioned below the note */}
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(!showSizeGuide)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-mono uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap ${
                    showSizeGuide
                      ? 'bg-gold text-black border-gold font-black shadow-gold/20'
                      : isDark
                        ? 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-gold/50 hover:text-white'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:border-gold/50 hover:text-zinc-900'
                  }`}
                >
                  <Ruler size={13} className="shrink-0 text-gold" />
                  <span>{showSizeGuide ? 'Hide Chart' : 'Size Chart'}</span>
                  {showSizeGuide ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>
            </div>

            {/* Expandable Size Conversion Chart Table */}
            {showSizeGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 pt-6 border-t border-zinc-800/50 relative z-10"
              >
                <div className={`p-5 sm:p-6 rounded-2xl border overflow-x-auto ${
                  isDark ? 'bg-zinc-950/90 border-zinc-800' : 'bg-amber-50/70 border-amber-200/80'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <h4 className="text-xs font-mono font-black uppercase tracking-wider text-gold flex items-center gap-2">
                      <Ruler size={14} /> Footwear Fit Matrix ({selectedCategory}'s Collection)
                    </h4>
                    <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
                      Foot Length Measured from Heel to Longest Toe
                    </span>
                  </div>

                  <table className="w-full text-left text-xs font-mono border-collapse min-w-[500px]">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-300 text-zinc-600'}`}>
                        <th className="py-2.5 px-3 font-black">UK / IN</th>
                        <th className="py-2.5 px-3 font-bold">US SIZE</th>
                        <th className="py-2.5 px-3 font-bold">EU SIZE</th>
                        <th className="py-2.5 px-3 font-bold">FOOT LENGTH</th>
                        <th className="py-2.5 px-3 font-bold">FIT GUIDANCE</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-zinc-800/60 text-zinc-300' : 'divide-zinc-200 text-zinc-800'}`}>
                      {sizes.map((sz) => {
                        const d = getSizeDetails(selectedCategory, sz);
                        return (
                          <tr key={sz} className={`hover:bg-gold/15 transition-colors ${hoveredSize === sz ? 'bg-gold/20 font-bold' : ''}`}>
                            <td className="py-2.5 px-3 font-black text-gold">UK {sz}</td>
                            <td className="py-2.5 px-3">US {d.us}</td>
                            <td className="py-2.5 px-3">EU {d.eu}</td>
                            <td className="py-2.5 px-3">{d.cm}</td>
                            <td className="py-2.5 px-3 text-[11px] opacity-80">
                              {d.popular ? '🔥 Most Requested Size (Regular Fit)' : 'Standard Regular Fit'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Footer Trust Badges */}
            <div className="mt-10 pt-6 border-t border-zinc-800/40 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center relative z-10">
              <div className="flex items-center justify-center gap-2 text-[11px] font-mono font-semibold opacity-85">
                <ShieldCheck size={16} className="text-gold" />
                <span>100% True-To-Fit Guarantee</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-[11px] font-mono font-semibold opacity-85">
                <RefreshCw size={16} className="text-gold" />
                <span>Free 7-Day Size Exchanges</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-[11px] font-mono font-semibold opacity-85">
                <CheckCircle2 size={16} className="text-gold" />
                <span>Verified Active Inventory</span>
              </div>
            </div>

          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="products-section"
      className={`scroll-mt-24 py-12 sm:py-20 px-3 sm:px-6 md:px-12 min-h-screen relative border-t transition-colors duration-500 ${
        isDark ? 'bg-transparent text-white border-zinc-900/20' : 'bg-transparent text-zinc-900 border-zinc-200'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-xs" />
              <span className="font-mono text-[10px] sm:text-[11px] text-gold uppercase tracking-widest font-bold">
                Authentic Footwear Collection
              </span>
            </div>
            <h2 className={`serif-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight uppercase ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}>
              THE CATALOGUE
            </h2>
            <p className={`text-xs sm:text-sm mt-1 max-w-xl ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Browse all official styles, verified stock levels, and available colorways.
            </p>
          </div>

          {/* Active Filter Indicators */}
          {(selectedCategory || selectedSize || selectedBrand || selectedColor) && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <span className={`text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border backdrop-blur-md ${
                isDark
                  ? 'text-zinc-400 bg-zinc-900/80 border-zinc-800'
                  : 'text-zinc-700 bg-zinc-100/90 border-zinc-200 shadow-xs'
              }`}>
                <Filter size={11} className="text-gold" /> ACTIVE FILTERS:
              </span>
              {selectedCategory && (
                <button
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(null);
                  }}
                  className="text-[11px] sm:text-xs font-bold font-sans bg-gold text-black hover:bg-gold/90 px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  title="Click to clear category filter"
                >
                  <span>Category: {selectedCategory}</span>
                  <span className="text-[10px] opacity-75 font-mono">✕</span>
                </button>
              )}
              {selectedSize && (
                <button
                  onClick={() => {
                    if (onSelectSize) onSelectSize(null);
                  }}
                  className="text-[11px] sm:text-xs font-bold font-sans border border-gold/50 text-gold bg-gold/10 hover:bg-gold/20 px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer transition-all backdrop-blur-md shadow-xs"
                  title="Click to clear size filter"
                >
                  <span>UK Size: {selectedSize}</span>
                  <span className="text-[10px] opacity-75 font-mono">✕</span>
                </button>
              )}
              {selectedBrand && (
                <button
                  onClick={() => setSelectedBrand(null)}
                  className="text-[11px] sm:text-xs font-bold font-sans border border-amber-400/50 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer transition-all backdrop-blur-md shadow-xs"
                  title="Click to clear brand filter"
                >
                  <Tag size={11} /> <span>Brand: {selectedBrand}</span>
                  <span className="text-[10px] opacity-75 font-mono">✕</span>
                </button>
              )}
              {selectedColor && (
                <button
                  onClick={() => setSelectedColor(null)}
                  className="text-[11px] sm:text-xs font-bold font-sans border border-zinc-700 bg-zinc-800 text-white px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  title="Click to clear color filter"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/50 shadow-xs inline-block"
                    style={{ backgroundColor: getColorDef(selectedColor).hex }}
                  />
                  <span>Color: {getColorDef(selectedColor).name}</span>
                  <span className="text-[10px] opacity-75 font-mono">✕</span>
                </button>
              )}
              <button
                onClick={handleClearAllFilters}
                className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-rose-400 hover:text-rose-300 border border-rose-500/30 hover:border-rose-500/60 bg-rose-500/10 px-3 py-1 sm:py-1.5 rounded-full cursor-pointer transition-all"
              >
                RESET ALL
              </button>
            </div>
          )}
        </div>

        {/* Top Priority Offer Products Section (Balanced Single-Column Recognizable View) */}
        {topOfferPairs.length > 0 && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3.5"
          >
            {/* Offer Section Header */}
            <div className={`flex items-center justify-between border-b pb-2.5 ${
              isDark ? 'border-amber-500/30' : 'border-amber-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-xs">
                  <Tag size={16} className="stroke-[2.5px]" />
                </span>
                <div>
                  <h3 className={`text-xs sm:text-sm md:text-base font-black tracking-wide uppercase ${
                    isDark ? 'text-amber-400' : 'text-amber-700'
                  }`}>
                    SPECIAL OFFERS & DEALS
                  </h3>
                  <p className="text-[10px] sm:text-xs text-zinc-400 font-mono hidden sm:block">
                    Exclusive discounted pairs with verified sizes & colors in stock
                  </p>
                </div>
              </div>

              <span className={`font-mono text-[10px] sm:text-xs px-3 py-1 rounded-full border font-bold ${
                isDark
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-amber-50 text-amber-700 border-amber-200 shadow-xs'
              }`}>
                {topOfferPairs.length} {topOfferPairs.length === 1 ? 'Offer Available' : 'Offers Available'}
              </span>
            </div>

            {/* Grid of 1:1 Square Optimized Special Offer Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {topOfferPairs.map((offer) => {
                const product = offer.product;
                const isOutOfStock = product.stock === 0;
                const savingsAmount = Math.max(0, offer.originalPrice - offer.offerPrice);
                const rawColorIds = getAvailableColors(product, selectedSize);
                
                // Deduplicate colors to avoid repeated swatches
                const seenColorKeys = new Set<string>();
                const uniqueColors: { cid: number | string; def: ReturnType<typeof getColorDef> }[] = [];
                for (const cid of rawColorIds) {
                  const def = getColorDef(cid, product);
                  const key = `${def.name}_${def.hex}`.toLowerCase();
                  if (!seenColorKeys.has(key)) {
                    seenColorKeys.add(key);
                    uniqueColors.push({ cid, def });
                  }
                }

                const offerBrandConfig = getBrandConfigForProduct(product, brandConfigs);

                return (
                  <motion.div
                    key={`top-offer-${offer.id}`}
                    layout
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className={`group border rounded-2xl sm:rounded-3xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-xl ${
                      isDark
                        ? 'bg-zinc-950/80 hover:bg-zinc-900 border-zinc-800 hover:border-gold/60 shadow-black/40'
                        : 'bg-white hover:bg-zinc-50/50 border-zinc-200/90 hover:border-gold/60 text-zinc-900 shadow-zinc-100'
                    }`}
                  >
                    {/* Footwear Thumbnail Frame with 1:1 Square Ratio for 1000x1000px */}
                    <SwipeableProductThumbnail
                      product={product}
                      onClick={() => onSelectProduct(product)}
                      objectFit="contain"
                      theme={theme}
                      imageClassName="w-full h-full object-contain p-3 sm:p-4 transition-transform duration-500 group-hover:scale-105"
                      containerClassName={`relative aspect-square w-full overflow-hidden cursor-pointer ${
                        isDark ? 'bg-zinc-900/90' : 'bg-gradient-to-b from-zinc-100/90 to-zinc-50'
                      }`}
                      zoomScale={1.5}
                      badgeOverlay={
                        <>
                          {/* Brand Logo - Bottom-Left Corner (Larger, High-Definition White Capsule for Clear Recognition) */}
                          <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 z-20 pointer-events-none">
                            {offerBrandConfig && offerBrandConfig.logoUrl ? (
                              <div
                                title={`${offerBrandConfig.brandName}`}
                                className="h-11 sm:h-12 md:h-13 px-4 sm:px-4.5 py-1.5 rounded-xl sm:rounded-2xl bg-white shadow-xl border border-zinc-200/90 ring-2 ring-black/5 flex items-center justify-center max-w-[135px] sm:max-w-[155px] shrink-0 transition-transform duration-200 group-hover:scale-105"
                              >
                                <img
                                  src={offerBrandConfig.logoUrl}
                                  alt={offerBrandConfig.brandName}
                                  className="h-7 sm:h-8 md:h-9 max-h-9 w-auto max-w-[115px] sm:max-w-[135px] object-contain shrink-0 filter drop-shadow-xs"
                                  loading="eager"
                                />
                              </div>
                            ) : product.brand ? (
                              <span className="text-[11px] sm:text-[12px] font-mono uppercase font-black px-4 py-2 rounded-xl sm:rounded-2xl bg-zinc-950/95 text-white backdrop-blur-md border border-zinc-700/80 shadow-xl ring-1 ring-black/10">
                                {product.brand}
                              </span>
                            ) : null}
                          </div>

                          {/* Diagonal Corner Ribbon - Top-Right (% OFF Tag matching reference) */}
                          <div className="absolute top-0 right-0 w-24 h-24 sm:w-28 sm:h-28 overflow-hidden pointer-events-none z-20">
                            <div className="absolute top-[16px] -right-[32px] sm:top-[20px] sm:-right-[30px] w-[120px] sm:w-[130px] transform rotate-45 bg-[#ff9900] text-black font-black font-mono text-[9px] sm:text-[10.5px] py-1 text-center shadow-md tracking-wider uppercase leading-tight select-none">
                              {offer.discountPercentage}% OFF
                            </div>
                          </div>

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none z-10">
                            <span className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-xl border backdrop-blur-md transition-transform duration-300 group-hover:scale-105 ${
                              isDark
                                ? 'text-white bg-zinc-900/90 border-zinc-700'
                                : 'text-zinc-900 bg-white/95 border-zinc-200'
                            }`}>
                              <Eye size={13} className="stroke-[2.5px] text-gold" /> View Details
                            </span>
                          </div>
                        </>
                      }
                    />

                    {/* Middle Details: Brand, Category, Name, Colors & Sizes */}
                    <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-3">
                      <div className="space-y-1.5">
                        {/* Clean Brand & SubCategory Line + Brand Logo after subcategory */}
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-wider">
                          <span className={isDark ? 'text-gold' : 'text-amber-700'}>
                            {offerBrandConfig?.brandName || product.brand || 'FOOTWEAR'}
                          </span>
                          <span className="text-zinc-400 font-normal">•</span>
                          <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                            {product.category}
                          </span>
                          {product.subCategory && (
                            <>
                              <span className="text-zinc-400 font-normal">•</span>
                              <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                                {product.subCategory}
                              </span>
                            </>
                          )}
                          {offerBrandConfig?.logoUrl && (
                            <span className="inline-flex items-center bg-white px-2 py-0.5 rounded-md shadow-xs border border-zinc-200/90 ml-0.5">
                              <img
                                src={offerBrandConfig.logoUrl}
                                alt={offerBrandConfig.brandName}
                                className="h-4 sm:h-4.5 max-h-5 w-auto max-w-[55px] sm:max-w-[65px] object-contain shrink-0"
                                loading="eager"
                              />
                            </span>
                          )}
                        </div>

                        {/* Product Title */}
                        <h4 
                          onClick={() => onSelectProduct(product)}
                          className={`text-sm sm:text-base font-bold line-clamp-1 transition-colors cursor-pointer leading-snug ${
                            isDark ? 'text-zinc-100 group-hover:text-gold' : 'text-zinc-900 group-hover:text-amber-700'
                          }`}
                        >
                          {product.name}
                        </h4>

                        {/* Professional Colors & Size preview */}
                        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap pt-0.5">
                          {/* Colour Swatches */}
                          {uniqueColors.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-zinc-400 font-medium">Colors:</span>
                              <div className="flex items-center gap-1">
                                {uniqueColors.slice(0, 4).map(({ cid, def }) => (
                                  <span
                                    key={String(cid)}
                                    title={def.name}
                                    className="w-3 h-3 rounded-full border border-black/20 shadow-2xs shrink-0"
                                    style={{ backgroundColor: def.hex }}
                                  />
                                ))}
                                {uniqueColors.length > 4 && (
                                  <span className="text-[8px] font-mono text-zinc-500">+{uniqueColors.length - 4}</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Size Info */}
                          {selectedSize ? (
                            <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${
                              isDark ? 'bg-zinc-800/80 border-zinc-700 text-zinc-200' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                            }`}>
                              Size: UK {selectedSize}
                            </span>
                          ) : (
                            product.sizes && product.sizes.length > 0 && (
                              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${
                                isDark ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                              }`}>
                                Size: UK {product.sizes[0]}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-zinc-200/80 dark:border-zinc-800/80 pt-2.5 flex items-center justify-between gap-2">
                        {/* Price Stack */}
                        <div className="flex flex-col">
                          <span className="text-[11px] text-zinc-400 line-through font-mono">
                            MRP ₹{offer.originalPrice}
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className={`text-lg sm:text-xl font-black font-mono ${
                              isDark ? 'text-gold' : 'text-zinc-900'
                            }`}>
                              ₹{offer.offerPrice}
                            </span>
                            {savingsAmount > 0 && (
                              <span className="text-[9px] font-mono text-emerald-600 font-bold">
                                Save ₹{savingsAmount}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Button: View Details */}
                        {isOutOfStock ? (
                          <button
                            disabled
                            className={`px-3.5 py-2 rounded-xl border text-xs font-bold uppercase cursor-not-allowed ${
                              isDark
                                ? 'border-zinc-800 text-zinc-600 bg-zinc-900'
                                : 'border-zinc-200 text-zinc-400 bg-zinc-100'
                            }`}
                          >
                            Sold Out
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const discountedProduct = {
                                ...product,
                                price: offer.offerPrice,
                                originalPrice: offer.originalPrice
                              };
                              onSelectProduct(discountedProduct);
                            }}
                            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-1.5 shadow-xs active:scale-95 cursor-pointer bg-gold hover:bg-gold-light text-black shadow-gold/10 shrink-0"
                          >
                            <Eye size={13} className="shrink-0 stroke-[2.5px]" />
                            <span>View Details</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Categories Sections Grid */}
        <motion.div layout className="space-y-10 sm:space-y-16">
          <AnimatePresence mode="popLayout">
            {subCategories.map((subCat) => {
              const subCatProducts = getProductsBySubCategory(subCat);
              if (subCatProducts.length === 0) return null;

              return (
                <motion.div
                  key={subCat}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Sub-category Header */}
                  <div className={`flex items-center justify-between gap-3 border-b pb-2.5 sm:pb-3.5 ${
                    isDark ? 'border-zinc-850' : 'border-zinc-200'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-4 sm:h-5 bg-gold rounded-full" />
                      <h3 className={`serif-display text-base sm:text-lg md:text-xl font-bold tracking-wide uppercase ${
                        isDark ? 'text-zinc-100' : 'text-zinc-900'
                      }`}>
                        {subCat}
                      </h3>
                    </div>
                    {(() => {
                      // Calculate total items/options rendered in this subcategory
                      let count = 0;
                      subCatProducts.forEach((p) => {
                        if (selectedSize) {
                          let avColors = getAvailableColors(p, selectedSize);
                          if (selectedColor !== null) {
                            avColors = avColors.filter(c => String(c).toLowerCase() === String(selectedColor).toLowerCase());
                          }
                          count += avColors.length > 0 ? avColors.length : 1;
                        } else {
                          count += 1;
                        }
                      });

                      return (
                        <span className={`font-mono text-[10px] sm:text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border font-bold ${
                          isDark
                            ? 'bg-zinc-900/90 text-zinc-300 border-zinc-800'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-200 shadow-xs'
                        }`}>
                          {count} {selectedSize ? (count === 1 ? 'Option' : 'Options') : (count === 1 ? 'Article' : 'Articles')}
                        </span>
                      );
                    })()}
                  </div>

                  {/* E-Cart 2-Column Mobile Grid Layout */}
                  <motion.div
                    layout
                    className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
                  >
                    <AnimatePresence mode="popLayout">
                      {(() => {
                        const items: {
                          key: string;
                          product: Product;
                          colorId?: number | string;
                          colorDef?: ReturnType<typeof getColorDef>;
                          stockInVariant: number;
                          allAvailColorIds: (number | string)[];
                        }[] = [];

                        subCatProducts.forEach((product) => {
                          if (selectedSize) {
                            let availColors = getAvailableColors(product, selectedSize);
                            if (selectedColor !== null) {
                              availColors = availColors.filter(c => String(c).toLowerCase() === String(selectedColor).toLowerCase());
                            }
                            if (availColors.length > 0) {
                              availColors.forEach((cid) => {
                                const variantStock = getColorStockInSize(product, selectedSize, cid);
                                items.push({
                                  key: `${product.id}-${cid}`,
                                  product,
                                  colorId: cid,
                                  colorDef: getColorDef(cid, product),
                                  stockInVariant: variantStock,
                                  allAvailColorIds: availColors,
                                });
                              });
                            } else {
                              items.push({
                                key: product.id,
                                product,
                                stockInVariant: product.stock,
                                allAvailColorIds: [],
                              });
                            }
                          } else {
                            items.push({
                              key: product.id,
                              product,
                              stockInVariant: product.stock,
                              allAvailColorIds: getAvailableColors(product, null),
                            });
                          }
                        });

                        return items.map((item) => {
                          const product = item.product;
                          const itemColorId = item.colorId;
                          const itemColorDef = item.colorDef;
                          const isLowStock = item.stockInVariant > 0 && item.stockInVariant <= 5;
                          const isOutOfStock = item.stockInVariant === 0;
                          const itemBrandConfig = getBrandConfigForProduct(product, brandConfigs);
                          const calculatedDiscount = (product as any).discountPercentage || 
                            ((product as any).originalPrice && (product as any).originalPrice > product.price ? Math.round((((product as any).originalPrice - product.price) / (product as any).originalPrice) * 100) : 0) ||
                            ((product as any).mrp && (product as any).mrp > product.price ? Math.round((((product as any).mrp - product.price) / (product as any).mrp) * 100) : 0) ||
                            (offerProductIdSet.has(product.id) ? 30 : 0);

                          return (
                            <motion.div
                              key={item.key}
                              layout
                              initial={{ opacity: 0, scale: 0.92 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.92 }}
                              whileHover={{ 
                                y: -5, 
                                scale: 1.015,
                                boxShadow: isDark 
                                  ? "0 20px 35px -5px rgba(245,158,11,0.12), 0 10px 20px -5px rgba(0,0,0,0.6)" 
                                  : "0 20px 30px -5px rgba(0,0,0,0.1), 0 10px 15px -5px rgba(0,0,0,0.04)"
                              }}
                              transition={{ type: "spring", stiffness: 350, damping: 22 }}
                              className={`group border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                                isDark
                                  ? 'bg-zinc-950/80 border-zinc-850 hover:border-gold/50 shadow-md'
                                  : 'bg-white border-zinc-200/90 hover:border-gold/50 text-zinc-900 shadow-xs hover:shadow-md'
                              }`}
                            >
                              {/* Swipeable Image Preview Container (Perfect 1:1 Square Ratio for 1000x1000px and square product photography) */}
                              <SwipeableProductThumbnail
                                product={product}
                                onClick={() => onSelectProduct(product, itemColorId)}
                                objectFit="contain"
                                theme={theme}
                                zoomScale={1.5}
                                imageClassName="w-full h-full object-contain p-2 sm:p-3 transition-transform duration-500 group-hover:scale-105"
                                containerClassName={`relative aspect-square w-full overflow-hidden cursor-pointer ${
                                  isDark ? 'bg-zinc-900/90' : 'bg-gradient-to-b from-zinc-100/90 to-zinc-50'
                                }`}
                                badgeOverlay={
                                  <>
                                    {/* Hover Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none z-10">
                                      <span className={`flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-lg border backdrop-blur-md transition-transform duration-300 group-hover:scale-105 ${
                                        isDark
                                          ? 'text-white bg-zinc-900/90 border-zinc-700'
                                          : 'text-zinc-900 bg-white/95 border-zinc-200'
                                      }`}>
                                        <Eye size={13} className="stroke-[2.5px] text-gold" /> Details
                                      </span>
                                    </div>

                                    {/* Diagonal Corner Ribbon - Top-Right (% OFF Tag matching reference) */}
                                    {(calculatedDiscount > 0 || offerProductIdSet.has(product.id)) && (
                                      <div className="absolute top-0 right-0 w-24 h-24 sm:w-28 sm:h-28 overflow-hidden pointer-events-none z-20">
                                        <div className="absolute top-[16px] -right-[32px] sm:top-[20px] sm:-right-[30px] w-[120px] sm:w-[130px] transform rotate-45 bg-[#ff9900] text-black font-black font-mono text-[9px] sm:text-[10.5px] py-1 text-center shadow-md tracking-wider uppercase leading-tight select-none">
                                          {calculatedDiscount > 0 ? calculatedDiscount : 30}% OFF
                                        </div>
                                      </div>
                                    )}

                                    {/* Out of Stock Status */}
                                    {isOutOfStock && (
                                      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 pointer-events-none">
                                        <span className="bg-rose-600 text-white text-[8px] sm:text-[9px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full uppercase shadow-md">
                                          NO STOCK
                                        </span>
                                      </div>
                                    )}
                                  </>
                                }
                               />

                              {/* Product Meta */}
                              <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between gap-2.5">
                                <div className="space-y-1.5 min-w-0">
                                  {/* 1. Brand, Subcategory & Logo (In one line above the product name) */}
                                  <div className="flex items-center justify-between gap-2 min-w-0">
                                    <div className="flex items-center gap-1.5 min-w-0 overflow-hidden text-[10px] font-mono whitespace-nowrap">
                                      <span className={`font-black uppercase tracking-wider shrink-0 ${
                                        isDark ? 'text-gold' : 'text-amber-700'
                                      }`}>
                                        {itemBrandConfig?.brandName || product.brand || 'FOOTWEAR'}
                                      </span>
                                      <span className="text-zinc-400 text-[10px] shrink-0">•</span>
                                      <span className={`uppercase font-semibold truncate min-w-0 ${
                                        isDark ? 'text-zinc-400' : 'text-zinc-500'
                                      }`}>
                                        {product.subCategory || product.category || 'CASUAL'}
                                      </span>
                                    </div>

                                    {itemBrandConfig?.logoUrl && (
                                      <span className="inline-flex items-center bg-white px-1.5 py-0.5 rounded-md shadow-xs border border-zinc-200/90 shrink-0">
                                        <img
                                          src={itemBrandConfig.logoUrl}
                                          alt={itemBrandConfig.brandName}
                                          className="h-3.5 sm:h-4 max-h-4.5 w-auto max-w-[45px] sm:max-w-[55px] object-contain shrink-0"
                                          loading="eager"
                                        />
                                      </span>
                                    )}
                                  </div>

                                  {/* 2. Product Title / Article Name (Wrapped cleanly, line-clamp-2, break-words) */}
                                  <h4 
                                    onClick={() => onSelectProduct(product, itemColorId)}
                                    className={`text-xs sm:text-sm font-bold transition-colors tracking-tight line-clamp-2 leading-snug cursor-pointer break-words min-h-[2.2rem] ${
                                      isDark ? 'text-zinc-100 group-hover:text-gold' : 'text-zinc-900 group-hover:text-amber-700'
                                    }`}
                                    title={product.name}
                                  >
                                    {product.name}
                                  </h4>

                                  {/* 3. Price & Clean Article Code (e.g. Art: WL-W5687) */}
                                  <div className="flex items-baseline justify-between gap-x-2 gap-y-0.5 flex-wrap pt-0.5 min-w-0">
                                    <div className="flex items-baseline gap-1.5 shrink-0">
                                      <span className={`text-sm sm:text-base font-black font-mono tracking-tight ${
                                        isDark ? 'text-gold' : 'text-zinc-900'
                                      }`}>
                                        ₹{product.price}
                                      </span>
                                      {((product as any).mrp || (product as any).originalPrice) && ((product as any).mrp || (product as any).originalPrice) > product.price && (
                                        <span className="text-[10px] font-mono text-zinc-400 line-through">
                                          ₹{(product as any).mrp || (product as any).originalPrice}
                                        </span>
                                      )}
                                    </div>

                                    {(() => {
                                      const rawCode = (product as any).articleCode || (product as any).rawArticleCode || product.barcode || product.id;
                                      const cleanArt = rawCode ? String(rawCode).replace(/^[#\-_/]+/, '').trim() : '';
                                      if (!cleanArt) return null;
                                      return (
                                        <span className={`text-[10px] font-mono shrink-0 whitespace-nowrap text-right ${
                                          isDark ? 'text-zinc-400' : 'text-zinc-500'
                                        }`}>
                                          Art: <strong className={`font-bold uppercase ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{cleanArt}</strong>
                                        </span>
                                      );
                                    })()}
                                  </div>
                                </div>

                                {/* 4. Color & Size Variant Info (Clean Stacked Layout with All Article Colors) */}
                                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
                                  {(() => {
                                    // Get all color variants for this article (across sibling products & internal colors)
                                    const articleVariants = getArticleAllColorVariants(product, products, selectedSize, itemColorId);

                                    return (
                                      <>
                                        {selectedSize ? (
                                          <div className="space-y-1.5 text-xs font-mono">
                                            {/* Row 1: Size Badge & Available Pairs Stock */}
                                            <div className="flex items-center justify-between gap-1 text-[10px]">
                                              <div className="flex items-center gap-1.5 min-w-0">
                                                <span className={`px-2 py-0.5 rounded-md border font-black uppercase shadow-2xs tracking-tight ${
                                                  isDark 
                                                    ? 'bg-zinc-900 border-zinc-750 text-zinc-100' 
                                                    : 'bg-zinc-100 border-zinc-200 text-zinc-900'
                                                }`}>
                                                  UK {selectedSize}
                                                </span>
                                                <span className="font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                                                  {item.stockInVariant > 0 
                                                    ? `(${item.stockInVariant} ${item.stockInVariant === 1 ? 'pair' : 'pairs'})`
                                                    : '(0 pairs)'}
                                                </span>
                                              </div>
                                            </div>

                                            {/* Row 2: Full-Width Active Color Badge with Swatch Dot & Complete Name */}
                                            {itemColorDef && (
                                              <div 
                                                className={`flex items-center gap-1.5 px-2 py-1 rounded-md border w-full text-[10px] font-mono ${
                                                  isDark
                                                    ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300'
                                                    : 'bg-zinc-50 border-zinc-200/90 text-zinc-700'
                                                }`}
                                                title={`Color: ${itemColorDef.name}`}
                                              >
                                                <span className="text-[9px] font-mono font-semibold text-zinc-400 uppercase tracking-wider shrink-0">
                                                  COLOR:
                                                </span>
                                                <span
                                                  className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0 shadow-2xs ring-1 ring-black/10"
                                                  style={{ backgroundColor: itemColorDef.hex }}
                                                />
                                                <span className="font-bold uppercase truncate text-zinc-900 dark:text-zinc-100">
                                                  {itemColorDef.name}
                                                </span>
                                              </div>
                                            )}

                                            {/* Row 3: Sibling Colors Available in this Size */}
                                            {articleVariants.length > 1 && (
                                              <div className="flex items-center gap-1.5 pt-0.5">
                                                <span className="text-[9px] font-mono text-zinc-400 font-medium shrink-0">Available Colours:</span>
                                                <div className="flex items-center gap-1 flex-wrap">
                                                  {articleVariants.map((v) => (
                                                    <button
                                                      key={`${v.product.id}-${v.colorId}`}
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectProduct(v.product, v.colorId);
                                                      }}
                                                      title={`${v.colorName} (${v.isAvailableInSelectedSize ? `${v.stockInSelectedSize} in UK ${selectedSize}` : 'Out of stock in UK ' + selectedSize})`}
                                                      className={`p-0.5 rounded-full border transition-all cursor-pointer ${
                                                        v.isCurrent
                                                          ? 'border-amber-500 ring-1 ring-amber-400 shadow-xs scale-110'
                                                          : v.isAvailableInSelectedSize
                                                            ? 'border-black/30 hover:scale-110 opacity-95'
                                                            : 'border-zinc-400 opacity-40 hover:opacity-80'
                                                      }`}
                                                    >
                                                      <span
                                                        className="w-2.5 h-2.5 rounded-full block border border-black/10"
                                                        style={{ backgroundColor: v.colorHex }}
                                                      />
                                                    </button>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="space-y-1">
                                            {articleVariants.length === 0 ? (
                                              <p className="text-[9px] font-mono text-zinc-500 italic">Standard color</p>
                                            ) : (
                                              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                                                <span className="text-[9px] font-mono text-zinc-400 font-medium">Available Colours:</span>
                                                <div className="flex items-center gap-1 flex-wrap">
                                                  {articleVariants.map((v) => (
                                                    <button
                                                      key={`${v.product.id}-${v.colorId}`}
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectProduct(v.product, v.colorId);
                                                      }}
                                                      title={v.colorName}
                                                      className={`p-0.5 rounded-full border transition-all cursor-pointer ${
                                                        v.isCurrent
                                                          ? 'border-amber-500 ring-1 ring-amber-400 shadow-xs scale-110'
                                                          : 'border-black/30 hover:scale-110 opacity-90'
                                                      }`}
                                                    >
                                                      <span
                                                        className="w-2.5 h-2.5 rounded-full block border border-black/10 shadow-2xs"
                                                        style={{ backgroundColor: v.colorHex }}
                                                      />
                                                    </button>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>

                                {/* 5. Action button */}
                                <div className="pt-0.5">
                                  {isOutOfStock ? (
                                    <button
                                      disabled
                                      className={`w-full py-2 rounded-xl border text-[10px] sm:text-xs font-bold tracking-wider uppercase cursor-not-allowed ${
                                        isDark
                                          ? 'border-zinc-800 text-zinc-600 bg-zinc-950/20'
                                          : 'border-zinc-200 text-zinc-400 bg-zinc-50'
                                      }`}
                                    >
                                      OUT OF STOCK
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => onAddToCart(product, selectedSize || product.sizes[0])}
                                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-1.5 shadow-xs active:scale-95 cursor-pointer ${
                                        isDark
                                          ? 'bg-zinc-900 hover:bg-gold text-zinc-200 hover:text-black border border-zinc-750 hover:border-gold shadow-2xs'
                                          : 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs'
                                      }`}
                                    >
                                      <ShoppingBag size={13} className="shrink-0 stroke-[2.5px]" />
                                      <span className="truncate">Add to Cart</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        });
                      })()}
                    </AnimatePresence>
                  </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

        {/* Empty State Fallback */}
        {filteredProducts.length === 0 && (
          <div className={`text-center py-16 px-6 border rounded-3xl max-w-lg mx-auto backdrop-blur-md shadow-lg ${
            isDark ? 'border-zinc-800 bg-zinc-950/60' : 'border-zinc-200 bg-white/90 shadow-zinc-200/50'
          }`}>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4 shadow-inner">
              <Filter size={24} className="stroke-[2.5px]" />
            </div>
            <h4 className={`serif-display text-lg font-bold uppercase tracking-wide mb-1.5 ${
              isDark ? 'text-zinc-200' : 'text-zinc-900'
            }`}>
              No Matching Styles Found
            </h4>
            <p className={`text-xs sm:text-sm max-w-xs mx-auto mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Try clearing selected size, brand, or color filters to explore our full footwear collection.
            </p>
            <button
              onClick={handleClearAllFilters}
              className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-black bg-gold hover:bg-gold/90 px-5 py-2.5 rounded-full transition-all duration-200 cursor-pointer shadow-md active:scale-95 uppercase font-mono"
            >
              <RefreshCw size={13} className="stroke-[2.5px]" />
              <span>SHOW ALL COLLECTION</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
