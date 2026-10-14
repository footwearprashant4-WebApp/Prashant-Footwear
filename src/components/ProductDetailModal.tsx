import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Check,
  Shield,
  Truck,
  Sparkles,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Layers,
  CheckCircle2,
  Tv,
  Award,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Palette,
  AlertCircle,
  Plus,
  Minus,
  FileText,
  Copy
} from 'lucide-react';
import { useProducts, getBrandConfigForProduct } from '../context/ProductContext';
import {
  getArticleAllColorVariants,
  extractArticleCode,
  getColorDef,
  ArticleColorVariant
} from '../utils/articleVariants';

const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}`;
  }
  return url;
};

interface ProductDetailModalProps {
  product: Product | null;
  selectedSize?: number | null;
  initialColorId?: number | string | null;
  theme?: 'dark' | 'light';
  onClose: () => void;
  onAddToCart: (product: Product, size: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  selectedSize: selectedSizeProp,
  initialColorId = null,
  theme = 'light',
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  const isDark = theme === 'dark';
  const { products, brandConfigs } = useProducts();

  // Active product state allows smooth switching between color variants of the same article
  const [activeProduct, setActiveProduct] = useState<Product>(product);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColorId, setSelectedColorId] = useState<number | string | null>(initialColorId ?? null);
  const [isAdded, setIsAdded] = useState(false);

  // Sync active product when the modal is opened with a new product
  useEffect(() => {
    if (product) {
      setActiveProduct(product);
      setCurrentImageIndex(0);
      setSelectedColorId(initialColorId ?? null);
    }
  }, [product, initialColorId]);

  // Determine initial active size from prop or product sizes
  const [activeSize, setActiveSize] = useState<number>(() => {
    if (selectedSizeProp && product.sizes && product.sizes.includes(selectedSizeProp)) {
      return selectedSizeProp;
    }
    return product.sizes?.[0] || 7;
  });

  // Sync size when prop changes
  useEffect(() => {
    if (selectedSizeProp) {
      setActiveSize(selectedSizeProp);
    }
  }, [selectedSizeProp]);

  // Brand Configuration
  const matchedBrand = getBrandConfigForProduct(activeProduct, brandConfigs) || brandConfigs?.[0];

  const brandColor = matchedBrand?.accentColor || (
    matchedBrand?.brandName?.toLowerCase().includes('walkaroo') ? '#BE123C' :
    matchedBrand?.brandName?.toLowerCase().includes('indus') ? '#0D9488' :
    matchedBrand?.brandName?.toLowerCase().includes('walkmate') ? '#0284C7' :
    matchedBrand?.brandName?.toLowerCase().includes('yono') ? '#7C3AED' :
    matchedBrand?.brandName?.toLowerCase().includes('paragon') ? '#1E3A8A' :
    matchedBrand?.brandName?.toLowerCase().includes('sparx') ? '#EA580C' :
    matchedBrand?.brandName?.toLowerCase().includes('bairathi') ? '#92400E' :
    matchedBrand?.brandName?.toLowerCase().includes('action') ? '#B91C1C' :
    matchedBrand?.brandName?.toLowerCase().includes('campus') ? '#059669' :
    '#BE123C'
  );

  const mediaMode = matchedBrand?.displayMediaType || (matchedBrand?.bannerUrl ? 'banner' : (matchedBrand?.videoUrl ? 'video' : 'none'));

  // Get all color variants for this article (includes sibling products and internal colors)
  const articleColors = getArticleAllColorVariants(activeProduct, products, activeSize, selectedColorId);

  // Colors available specifically in the chosen size
  const colorsInStockForSize = articleColors.filter(c => c.isAvailableInSelectedSize);

  // Determine active color variant
  const activeVariant = articleColors.find(c => {
    if (selectedColorId !== null && selectedColorId !== undefined) {
      return String(c.colorId).toLowerCase() === String(selectedColorId).toLowerCase() ||
             c.colorName.toLowerCase() === String(selectedColorId).toLowerCase();
    }
    return c.isCurrent;
  }) || articleColors[0];

  // Build unique array of product images strictly from activeProduct
  const rawImages = [
    activeProduct.imageUrl,
    ...(activeProduct.imageUrls || []),
  ].filter((url): url is string => Boolean(url && typeof url === 'string' && url.trim().length > 0));

  const allImages = Array.from(new Set(rawImages));

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Switch color variant: If it's a sibling product, switch activeProduct and reset images
  const handleSelectColorVariant = (variant: ArticleColorVariant) => {
    setSelectedColorId(variant.colorId);
    if (variant.product && variant.product.id !== activeProduct.id) {
      setActiveProduct(variant.product);
      setCurrentImageIndex(0);
    } else if (variant.imageUrl) {
      const idx = allImages.indexOf(variant.imageUrl);
      if (idx >= 0) {
        setCurrentImageIndex(idx);
      }
    }
  };

  const handleAddToCart = () => {
    onAddToCart(activeProduct, activeSize);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1500);
  };

  const [isColorsExpanded, setIsColorsExpanded] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);

  const rawDescription = activeProduct.description || 
    'A timeless representation of style and athletic performance, built with the highest-grade stitching, bespoke footbed modeling, and wear-resistant vulcanized outer treads.';

  const handleCopyDescription = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(rawDescription);
    setCopiedDesc(true);
    setTimeout(() => setCopiedDesc(false), 2000);
  };

  const KEYWORDS_TO_HIGHLIGHT = [
    'cushioned sole', 'cushioned', 'cushion', 'ergonomic', 'footbed', 'breathable', 
    'stitching', 'vulcanized', 'outer treads', 'treads', 'outsole', 'sole', 
    'traction', 'anti-slip', 'durability', 'durable', 'lightweight', 'leather', 
    'eva sole', 'eva', 'memory foam', 'genuine', 'premium', 'primium', 'all-day', 
    'flexible', 'flexibility', 'comfort', 'comfortable', 'shock absorption', 
    'performance', 'wear-resistant', 'high-grade', 'bespoke', 'highest-grade'
  ];

  const renderHighlightedContent = (text: string) => {
    if (!text) return null;
    const escaped = KEYWORDS_TO_HIGHLIGHT.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return (
      <span className="leading-relaxed">
        {parts.map((part, i) => {
          const isMatch = KEYWORDS_TO_HIGHLIGHT.some(k => k.toLowerCase() === part.toLowerCase());
          if (isMatch) {
            return (
              <span
                key={i}
                className={`inline-flex items-center px-1.5 py-0.5 mx-0.5 my-0.5 rounded-md font-bold text-[11px] tracking-wide shadow-2xs ${
                  isDark
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  const cleanArticle = extractArticleCode(activeProduct);

  // Determine all available sizes across the article or activeProduct
  const availableSizes = activeProduct.sizes && activeProduct.sizes.length > 0 
    ? activeProduct.sizes 
    : [6, 7, 8, 9, 10, 11];

  return (
    <AnimatePresence>
      <div id="detail-modal-backdrop" className={`fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto ${
        isDark ? 'bg-black/95 sm:bg-black/90 backdrop-blur-xl' : 'bg-slate-900/80 sm:bg-slate-900/60 backdrop-blur-md'
      }`}>
        {/* Click outside overlay */}
        <div className="fixed inset-0 hidden sm:block" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 15 }}
          transition={{ type: 'spring', duration: 0.35 }}
          className={`relative w-full h-full sm:h-auto max-w-4xl sm:max-h-[88vh] rounded-none sm:rounded-3xl p-4 sm:p-6 md:p-8 overflow-y-auto shadow-2xl flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 my-0 sm:my-auto scrollbar-thin ${
            isDark 
              ? 'bg-zinc-950 border-0 sm:border sm:border-zinc-850 text-zinc-100 scrollbar-thumb-zinc-800' 
              : 'bg-white border-0 sm:border sm:border-zinc-200 text-zinc-900 scrollbar-thumb-zinc-300'
          }`}
        >
          {/* Decorative glowing background */}
          <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
            isDark ? 'bg-gold/5' : 'bg-amber-500/10'
          }`} />

          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-2.5 rounded-full border transition-colors z-30 cursor-pointer shadow-lg active:scale-95 ${
              isDark 
                ? 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white hover:border-gold' 
                : 'border-zinc-200 bg-zinc-100/90 text-zinc-600 hover:text-zinc-900 hover:border-amber-600 hover:bg-white'
            }`}
            aria-label="Close product view"
          >
            <X size={16} />
          </button>

          {/* Left: Interactive Image Portfolio with Swipe & Multi-Image Carousel (1:1 Square Ratio) */}
          <div className="w-full md:w-[48%] shrink-0 flex flex-col gap-3">
            <div className={`relative aspect-square w-full rounded-2xl overflow-hidden border group flex items-center justify-center ${
              isDark ? 'border-zinc-800 bg-zinc-900/60' : 'border-zinc-200 bg-zinc-50'
            }`}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${activeProduct.id}-${currentImageIndex}`}
                  src={allImages[currentImageIndex] || activeProduct.imageUrl}
                  alt={`${activeProduct.name} view ${currentImageIndex + 1}`}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.22 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, { offset, velocity }) => {
                    const swipeThreshold = 40;
                    if (offset.x < -swipeThreshold || velocity.x < -400) {
                      handleNextImage(); // Swipe left -> Next image
                    } else if (offset.x > swipeThreshold || velocity.x > 400) {
                      handlePrevImage(); // Swipe right -> Previous image
                    }
                  }}
                  className="w-full h-full object-contain select-none cursor-grab active:cursor-grabbing p-1"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>

              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/65 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all shadow-lg active:scale-90 opacity-90 sm:opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
                    aria-label="Previous product image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/65 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all shadow-lg active:scale-90 opacity-90 sm:opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
                    aria-label="Next product image"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Top Category Badge */}
              <span className={`absolute top-3 left-3 backdrop-blur-md border text-[9px] sm:text-[10px] font-mono tracking-widest uppercase font-bold px-2.5 py-1 rounded-lg z-10 ${
                isDark ? 'bg-zinc-950/85 border-zinc-800 text-gold' : 'bg-white/90 border-zinc-200 text-amber-700 shadow-xs'
              }`}>
                {activeProduct.category}
              </span>

              {/* Bottom Swipe Dots Indicator (if multiple images) */}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center pointer-events-auto z-10">
                  <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/10 shadow-md">
                    {allImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentImageIndex(idx)}
                        aria-label={`Go to photo ${idx + 1}`}
                        className={`transition-all duration-200 rounded-full cursor-pointer ${
                          idx === currentImageIndex
                            ? 'w-4 h-1.5 bg-amber-400 shadow-xs'
                            : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/90'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Navigation Row */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer aspect-square bg-white dark:bg-zinc-900 ${
                      idx === currentImageIndex
                        ? 'border-amber-500 shadow-md shadow-amber-500/20 scale-105'
                        : isDark
                          ? 'border-zinc-850 opacity-60 hover:opacity-100 hover:border-zinc-700'
                          : 'border-zinc-200 opacity-70 hover:opacity-100 hover:border-zinc-400'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${activeProduct.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain p-0.5"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Core Meta, Article Info, Sizes & Available Colors */}
          <div className="flex-1 flex flex-col justify-between text-left min-w-0">
            <div className="space-y-3.5 sm:space-y-4">
              {/* Product Heading */}
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  {matchedBrand && (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-wider font-bold shadow-xs ${
                      isDark ? 'bg-zinc-900 border-zinc-750 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-xs'
                    }`}>
                      {matchedBrand.logoUrl && (
                        <img
                          src={matchedBrand.logoUrl}
                          alt={matchedBrand.brandName}
                          className="w-3.5 h-3.5 rounded-full object-cover shrink-0 border border-black/20"
                        />
                      )}
                      <span className="font-black">{matchedBrand.brandName}</span>
                      <ShieldCheck size={12} className="text-emerald-500 shrink-0" />
                    </div>
                  )}
                  <span className={`text-[10px] font-mono uppercase tracking-widest font-black ${
                    isDark ? 'text-gold' : 'text-amber-600'
                  }`}>
                    {activeProduct.category}'s {activeProduct.subCategory}
                  </span>
                  {cleanArticle && (
                    <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border ${
                      isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                    }`}>
                      Article: <strong className={isDark ? 'text-white' : 'text-zinc-900'}>{cleanArticle}</strong>
                    </span>
                  )}
                </div>

                <h3 className={`serif-display text-lg sm:text-2xl font-bold uppercase tracking-tight mt-0.5 pr-8 ${
                  isDark ? 'text-white' : 'text-zinc-900'
                }`}>
                  {activeProduct.name}
                </h3>

                {/* Price Display */}
                <div className="flex items-center gap-3 mt-2">
                  <span className={`font-mono text-base sm:text-xl font-black ${
                    isDark ? 'text-gold' : 'text-amber-700'
                  }`}>
                    ₹{activeProduct.price}
                  </span>
                  {((activeProduct as any).mrp || (activeProduct as any).originalPrice) && ((activeProduct as any).mrp || (activeProduct as any).originalPrice) > activeProduct.price && (
                    <span className="text-xs font-mono text-zinc-400 line-through">
                      ₹{(activeProduct as any).mrp || (activeProduct as any).originalPrice}
                    </span>
                  )}
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                    isDark 
                      ? 'bg-gold/10 text-gold border-gold/20' 
                      : 'bg-amber-500/10 text-amber-800 border-amber-500/30'
                  }`}>
                    Inclusive of All Taxes
                  </span>
                </div>
              </div>

              {/* 1. Selected Size Display (Only Selected Size) */}
              <div className={`p-3 rounded-2xl border flex items-center justify-between font-mono ${
                isDark ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200/90'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    Selected Size:
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-3 py-1 rounded-xl text-xs font-mono font-black border shadow-2xs ${
                    isDark
                      ? 'bg-zinc-950 border-zinc-750 text-gold ring-1 ring-gold/20'
                      : 'bg-white border-amber-300 text-amber-900 ring-1 ring-amber-400/30'
                  }`}>
                    UK {activeSize}
                  </span>
                </div>
              </div>

              {/* 2. AVAILABLE COLORS SECTION (Text Only Initially, Expandable Small Thumbnails on Click) */}
              <div className={`rounded-2xl border transition-all overflow-hidden font-mono ${
                isDark 
                  ? 'bg-zinc-900/80 border-zinc-800/90' 
                  : 'bg-amber-50/40 border-amber-200/80'
              }`}>
                {/* Header/Trigger: Text-only display by default */}
                <button
                  type="button"
                  onClick={() => setIsColorsExpanded(!isColorsExpanded)}
                  className={`w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none ${
                    isColorsExpanded
                      ? (isDark ? 'bg-zinc-900/95 border-b border-zinc-800' : 'bg-white border-b border-amber-200/70 shadow-2xs')
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  aria-expanded={isColorsExpanded}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                      style={{
                        backgroundColor: isDark ? `${brandColor}25` : `${brandColor}15`,
                        color: brandColor
                      }}
                    >
                      <Palette size={15} className="stroke-[2.2px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>
                          Available Colours:
                        </span>
                        <span className={`text-xs font-semibold ${isDark ? 'text-gold' : 'text-amber-700'}`}>
                          {Array.from(new Set(articleColors.map((c) => c.colorName).filter(Boolean))).join(', ') || 'Standard'}
                        </span>
                      </div>
                      <p className={`text-[10.5px] font-normal truncate mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {isColorsExpanded 
                          ? 'Click to collapse color thumbnails' 
                          : `Active: ${activeVariant?.colorName || 'Default'} • Click to view thumbnails & switch color`}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Indicator & Count */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      colorsInStockForSize.length > 0
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                    }`}>
                      {articleColors.length} {articleColors.length === 1 ? 'Colour' : 'Colours'}
                    </span>
                    <div 
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all duration-200 ${
                        isColorsExpanded
                          ? (isDark ? 'bg-zinc-800 text-zinc-100 border-zinc-700' : 'bg-zinc-900 text-white border-zinc-900')
                          : (isDark ? 'bg-zinc-950 text-gold border-zinc-800 hover:border-gold' : 'bg-white text-amber-700 border-zinc-300 hover:border-amber-600 shadow-2xs')
                      }`}
                    >
                      {isColorsExpanded ? <Minus size={13} strokeWidth={2.5} /> : <Plus size={13} strokeWidth={2.5} />}
                    </div>
                  </div>
                </button>

                {/* Expandable Small Thumbnails */}
                <AnimatePresence initial={false}>
                  {isColorsExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 sm:p-3.5 pt-2 space-y-2">
                        <div className="flex items-center justify-between text-[10.5px] font-sans pb-0.5">
                          <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                            Click any color thumbnail to switch to that variant:
                          </span>
                          <span className={`font-bold ${isDark ? 'text-gold' : 'text-amber-700'}`}>
                            Current: {activeVariant?.colorName}
                          </span>
                        </div>

                        {/* Small Color Thumbnails Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {articleColors.map((variant) => {
                            const isSelected = (selectedColorId !== null && (String(variant.colorId).toLowerCase() === String(selectedColorId).toLowerCase() || variant.colorName.toLowerCase() === String(selectedColorId).toLowerCase())) ||
                              (selectedColorId === null && variant.isCurrent);

                            const isAvailableInActiveSize = variant.isAvailableInSelectedSize;

                            return (
                              <button
                                key={`${variant.product.id}-${variant.colorId}`}
                                type="button"
                                onClick={() => handleSelectColorVariant(variant)}
                                className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-xl border text-left transition-all cursor-pointer select-none active:scale-95 group ${
                                  isSelected
                                    ? isDark
                                      ? 'bg-zinc-950 border-gold ring-2 ring-gold/40 shadow-md'
                                      : 'bg-white border-amber-600 ring-2 ring-amber-500/30 shadow-sm'
                                    : isDark
                                      ? 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                                      : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-800 shadow-2xs'
                                } ${!isAvailableInActiveSize ? 'opacity-70' : ''}`}
                              >
                                {/* Small Thumbnail Image */}
                                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden border border-black/10 bg-white shrink-0 flex items-center justify-center">
                                  {variant.imageUrl ? (
                                    <img
                                      src={variant.imageUrl}
                                      alt={variant.colorName}
                                      className="w-full h-full object-contain p-0.5 transition-transform duration-200 group-hover:scale-105"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <span
                                      className="w-4 h-4 rounded-full border border-black/30 shadow-xs"
                                      style={{ backgroundColor: variant.colorHex }}
                                    />
                                  )}
                                  {isSelected && (
                                    <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-gold text-black flex items-center justify-center text-[8px] font-black shadow-xs">
                                      <Check size={9} strokeWidth={3} />
                                    </span>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1">
                                    <span
                                      className="w-2 h-2 rounded-full border border-black/30 shrink-0"
                                      style={{ backgroundColor: variant.colorHex }}
                                    />
                                    <span className="text-[11px] sm:text-xs font-bold uppercase truncate font-mono">
                                      {variant.colorName}
                                    </span>
                                  </div>
                                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400 block truncate font-sans">
                                    {isAvailableInActiveSize
                                      ? `UK ${activeSize} in stock`
                                      : `Out in UK ${activeSize}`}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* DESCRIPTION ACCORDION SECTION */}
              <div 
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isDark 
                    ? 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700' 
                    : 'bg-zinc-50/80 border-zinc-200/90 hover:border-zinc-300'
                }`}
              >
                {/* Header / Trigger: Clickable DESCRIPTION header with Plus / Minus toggle */}
                <button
                  type="button"
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className={`w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none ${
                    isDescExpanded
                      ? (isDark ? 'bg-zinc-900/90 border-b border-zinc-800' : 'bg-white border-b border-zinc-200 shadow-2xs')
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  aria-expanded={isDescExpanded}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs transition-colors"
                      style={{ 
                        backgroundColor: isDark ? `${brandColor}25` : `${brandColor}15`,
                        color: brandColor 
                      }}
                    >
                      <FileText size={15} className="stroke-[2.2px]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black uppercase tracking-wider font-mono">
                          DESCRIPTION
                        </span>
                        <span 
                          className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md border"
                          style={{
                            backgroundColor: isDark ? `${brandColor}20` : `${brandColor}10`,
                            borderColor: isDark ? `${brandColor}40` : `${brandColor}30`,
                            color: brandColor
                          }}
                        >
                          Details & Specs
                        </span>
                      </div>
                      {!isDescExpanded && (
                        <p className={`text-[10.5px] truncate font-medium mt-0.5 ${
                          isDark ? 'text-zinc-400' : 'text-zinc-500'
                        }`}>
                          Click to view full highlighted description, sole & material specs
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Plus / Minus Action Toggle Button */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      {isDescExpanded ? 'Hide' : 'View'}
                    </span>
                    <div 
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all duration-200 ${
                        isDescExpanded
                          ? (isDark ? 'bg-zinc-800 text-zinc-100 border-zinc-700 rotate-180' : 'bg-zinc-900 text-white border-zinc-900 rotate-180')
                          : (isDark ? 'bg-zinc-950 text-gold border-zinc-800 hover:border-gold hover:scale-105' : 'bg-white text-amber-600 border-zinc-300 hover:border-amber-600 hover:scale-105 shadow-2xs')
                      }`}
                    >
                      {isDescExpanded ? <Minus size={14} strokeWidth={2.5} /> : <Plus size={14} strokeWidth={2.5} />}
                    </div>
                  </div>
                </button>

                {/* Collapsible Content */}
                <AnimatePresence initial={false}>
                  {isDescExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="p-3.5 sm:p-4 space-y-3.5">
                        {/* 1. Highlighted Lead Text Callout */}
                        <div 
                          className={`p-3.5 rounded-xl border-l-[3.5px] text-xs leading-relaxed font-sans ${
                            isDark 
                              ? 'bg-zinc-950/80 border-zinc-800/80 text-zinc-200 shadow-inner' 
                              : 'bg-white border-zinc-200 text-zinc-800 shadow-xs'
                          }`}
                          style={{ borderLeftColor: brandColor }}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-zinc-200/60 dark:border-zinc-850">
                            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-400">
                              <Sparkles size={12} style={{ color: brandColor }} />
                              Highlighted Product Story
                            </span>
                            <button
                              type="button"
                              onClick={handleCopyDescription}
                              className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-md border font-medium transition-colors cursor-pointer ${
                                copiedDesc
                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                  : isDark
                                    ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                                    : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300'
                              }`}
                              title="Copy description text"
                            >
                              {copiedDesc ? (
                                <>
                                  <Check size={11} /> Copied!
                                </>
                              ) : (
                                <>
                                  <Copy size={11} /> Copy Text
                                </>
                              )}
                            </button>
                          </div>
                          <div className="font-medium text-xs sm:text-[13px]">
                            {renderHighlightedContent(rawDescription)}
                          </div>
                        </div>

                        {/* 2. Highlight Feature Cards Grid */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                          <div className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                            isDark ? 'bg-zinc-950/50 border-zinc-800/70 text-zinc-300' : 'bg-white border-zinc-200/80 text-zinc-700 shadow-2xs'
                          }`}>
                            <div 
                              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                              style={{ backgroundColor: isDark ? `${brandColor}20` : `${brandColor}15`, color: brandColor }}
                            >
                              <Shield size={12} className="stroke-[2.5px]" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[11px] font-bold block leading-tight truncate">Cushioned Footbed</span>
                              <span className="text-[9.5px] text-zinc-400 block leading-tight">All-day impact relief</span>
                            </div>
                          </div>

                          <div className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                            isDark ? 'bg-zinc-950/50 border-zinc-800/70 text-zinc-300' : 'bg-white border-zinc-200/80 text-zinc-700 shadow-2xs'
                          }`}>
                            <div 
                              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                              style={{ backgroundColor: isDark ? `${brandColor}20` : `${brandColor}15`, color: brandColor }}
                            >
                              <CheckCircle2 size={12} className="stroke-[2.5px]" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[11px] font-bold block leading-tight truncate">Anti-Slip Outsole</span>
                              <span className="text-[9.5px] text-zinc-400 block leading-tight">Vulcanized firm tread</span>
                            </div>
                          </div>

                          <div className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                            isDark ? 'bg-zinc-950/50 border-zinc-800/70 text-zinc-300' : 'bg-white border-zinc-200/80 text-zinc-700 shadow-2xs'
                          }`}>
                            <div 
                              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                              style={{ backgroundColor: isDark ? `${brandColor}20` : `${brandColor}15`, color: brandColor }}
                            >
                              <Layers size={12} className="stroke-[2.5px]" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[11px] font-bold block leading-tight truncate">Precision Stitching</span>
                              <span className="text-[9.5px] text-zinc-400 block leading-tight">Reinforced flexibility</span>
                            </div>
                          </div>

                          <div className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                            isDark ? 'bg-zinc-950/50 border-zinc-800/70 text-zinc-300' : 'bg-white border-zinc-200/80 text-zinc-700 shadow-2xs'
                          }`}>
                            <div 
                              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                              style={{ backgroundColor: isDark ? `${brandColor}20` : `${brandColor}15`, color: brandColor }}
                            >
                              <Award size={12} className="stroke-[2.5px]" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[11px] font-bold block leading-tight truncate">100% Genuine Pair</span>
                              <span className="text-[9.5px] text-zinc-400 block leading-tight">Certified brand standard</span>
                            </div>
                          </div>
                        </div>

                        {/* 3. Key Specifications Matrix */}
                        <div className={`p-3 rounded-xl border text-[11px] font-sans grid grid-cols-2 sm:grid-cols-4 gap-2.5 ${
                          isDark ? 'bg-zinc-950/40 border-zinc-800/60' : 'bg-white/60 border-zinc-200/70'
                        }`}>
                          <div>
                            <span className="text-[9.5px] uppercase font-bold text-zinc-400 block">Article ID</span>
                            <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 truncate block">
                              {cleanArticle || activeProduct.id}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9.5px] uppercase font-bold text-zinc-400 block">Category</span>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate block">
                              {activeProduct.category || 'Footwear'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9.5px] uppercase font-bold text-zinc-400 block">Style / Sub</span>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate block">
                              {activeProduct.subCategory || 'Casual'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9.5px] uppercase font-bold text-zinc-400 block">Available Sizes</span>
                            <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 truncate block">
                              UK {availableSizes.join(', ')}
                            </span>
                          </div>
                        </div>

                        {/* 4. Quick Footwear Care Tip */}
                        <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-[10.5px] ${
                          isDark ? 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400' : 'bg-zinc-100/70 border-zinc-200/70 text-zinc-600'
                        }`}>
                          <span className="font-medium">
                            💡 <strong>Care Advice:</strong> Wipe surface with a clean, dry micro-cloth. Avoid machine soaking.
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsDescExpanded(false)}
                            className="text-[10px] font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline cursor-pointer shrink-0"
                          >
                            Collapse
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Specs checklist */}
              <div className={`grid grid-cols-2 gap-2 sm:gap-3 py-2 border-y ${
                isDark ? 'border-zinc-900 text-zinc-400' : 'border-zinc-200 text-zinc-600'
              }`}>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono">
                  <Shield size={13} className={isDark ? 'text-gold shrink-0' : 'text-amber-600 shrink-0'} />
                  <span>Cushioned Sole</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono">
                  <Truck size={13} className={isDark ? 'text-gold shrink-0' : 'text-amber-600 shrink-0'} />
                  <span>Free Express Shipping</span>
                </div>
              </div>

              {/* Brand Showcase (Configured by Admin) */}
              {matchedBrand && (
                <div 
                  className={`p-3.5 sm:p-4 rounded-2xl border space-y-3 font-sans transition-all ${
                    isDark ? 'bg-zinc-900/90 text-white shadow-lg' : 'bg-white text-zinc-900 shadow-xs'
                  }`}
                  style={{
                    borderColor: isDark ? `${brandColor}40` : `${brandColor}30`,
                  }}
                >
                  {/* Brand Header */}
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {matchedBrand.logoUrl ? (
                        <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 dark:border-zinc-800 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                          <img
                            src={matchedBrand.logoUrl}
                            alt={matchedBrand.brandName}
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs text-white font-bold"
                          style={{ backgroundColor: brandColor }}
                        >
                          {matchedBrand.brandName?.slice(0, 1) || 'B'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span 
                            className="text-xs sm:text-sm font-bold uppercase tracking-tight truncate font-sans"
                            style={{ color: brandColor }}
                          >
                            {matchedBrand.brandName}
                          </span>
                          {matchedBrand.isVerifiedPartner && (
                            <span className="inline-flex items-center gap-0.5 text-[9.5px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold shrink-0">
                              <CheckCircle2 size={10} /> Verified Partner
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate font-sans font-medium">
                          {matchedBrand.tagline || '100% Genuine Authorized Brand Product'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Brand Media Content */}
                  {mediaMode === 'video' && matchedBrand.videoUrl ? (
                    <div 
                      className="relative aspect-video w-full rounded-xl overflow-hidden border bg-black shadow-md"
                      style={{ borderColor: `${brandColor}40` }}
                    >
                      {matchedBrand.videoUrl.includes('youtube.com') || matchedBrand.videoUrl.includes('youtu.be') ? (
                        <iframe
                          src={getYouTubeEmbedUrl(matchedBrand.videoUrl)}
                          title={`${matchedBrand.brandName} Official Commercial`}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={matchedBrand.videoUrl}
                          controls
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                        >
                          Your browser does not support playing brand promo videos.
                        </video>
                      )}
                    </div>
                  ) : mediaMode === 'banner' && matchedBrand.bannerUrl ? (
                    <div 
                      className="relative aspect-[350/150] w-full rounded-xl overflow-hidden border group shadow-sm bg-zinc-950"
                      style={{ borderColor: `${brandColor}30` }}
                    >
                      <img
                        src={matchedBrand.bannerUrl}
                        alt={`${matchedBrand.brandName} Brand Banner`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : null}

                  {/* Trust Badges */}
                  <div className="flex flex-col gap-1.5 pt-0.5">
                    {(matchedBrand.trustBadges || [
                      '100% Original Walkaroo Guarantee',
                      '3 Months of Only Sole Warranty',
                      'All-Day Comfort – Comfortable for everyday wear.',
                      'Stylish Designs – Trendy looks for every occasion.',
                      'Quality Footwear – Made for reliable daily use.',
                      'Affordable Prices – Great value for your money.',
                      'For Everyone – Styles for men, women & kids.'
                    ]).map((badge, idx) => {
                      const hasDash = badge.includes('–') || badge.includes(' - ');
                      let title = badge;
                      let subtitle = '';
                      if (hasDash) {
                        const parts = badge.includes('–') ? badge.split('–') : badge.split(' - ');
                        title = parts[0].trim();
                        subtitle = parts.slice(1).join('–').trim();
                      }

                      return (
                        <div
                          key={idx}
                          className={`text-[10.5px] px-2.5 py-1.5 rounded-xl border flex items-start gap-2 transition-all ${
                            isDark
                              ? 'bg-zinc-950/60 text-zinc-200 border-zinc-800 hover:border-zinc-700'
                              : 'bg-zinc-50 text-zinc-800 border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <ShieldCheck size={13} style={{ color: brandColor }} className="shrink-0 mt-0.5 stroke-[2.5px]" />
                          <div className="flex-1 leading-snug font-sans">
                            {hasDash ? (
                              <span>
                                <strong className="font-semibold" style={{ color: brandColor }}>{title}</strong>
                                <span className={isDark ? 'text-zinc-300' : 'text-zinc-600 font-normal'}> — {subtitle}</span>
                              </span>
                            ) : (
                              <span className="font-medium">{badge}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Warranty Tag and Official Link */}
                  {matchedBrand.warrantyText && (
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-2.5 mt-1 font-sans">
                      <span className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
                        <Award size={14} style={{ color: brandColor }} className="shrink-0 stroke-[2.5px]" /> 
                        <span>{matchedBrand.warrantyText}</span>
                      </span>
                      {matchedBrand.officialWebsite && (
                        <a
                          href={matchedBrand.officialWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10.5px] font-semibold hover:underline flex items-center gap-1 shrink-0 ml-2"
                          style={{ color: brandColor }}
                        >
                          Website <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CTA action button - Sticky bottom container on mobile */}
            <div className={`pt-3 sm:pt-6 mt-4 sm:mt-6 border-t sticky bottom-0 backdrop-blur-md pb-3 sm:pb-1 z-10 -mx-4 -mb-4 px-4 sm:mx-0 sm:mb-0 sm:px-0 ${
              isDark ? 'border-zinc-900 bg-zinc-950/95' : 'border-zinc-200 bg-white/95'
            }`}>
              {activeProduct.stock === 0 ? (
                <button
                  disabled
                  className={`w-full py-3.5 rounded-xl border text-xs font-bold uppercase cursor-not-allowed text-center font-mono ${
                    isDark ? 'border-zinc-850 text-zinc-500 bg-zinc-950/20' : 'border-zinc-200 text-zinc-400 bg-zinc-100'
                  }`}
                >
                  OUT OF STOCK IN ALL SIZES
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdded}
                  className={`w-full py-3.5 sm:py-4 rounded-xl font-bold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
                    isAdded
                      ? 'bg-amber-500 text-black font-black'
                      : isDark
                        ? 'bg-white hover:bg-gold hover:text-black text-black active:scale-95'
                        : 'bg-zinc-900 hover:bg-amber-500 hover:text-black text-white active:scale-95'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check size={15} /> ADDED TO BASKET!
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={14} /> ADD TO SHOPPING BAG (UK {activeSize})
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
