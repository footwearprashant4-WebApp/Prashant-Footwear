import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, X, Check, RotateCcw, Sparkles, ChevronRight, Search, Palette, Tag } from 'lucide-react';
import { Product, Category } from '../types';
import { COLOR_REGISTRY, getColorDef, getAvailableColors, isProductAvailableInSize } from './ProductSection';

interface FloatingFilterPanelProps {
  products: Product[];
  selectedCategory: Category | null;
  selectedSize: number | null;
  selectedBrand: string | null;
  selectedColor: number | string | null;
  onSelectCategory: (category: Category | null) => void;
  onSelectSize: (size: number | null) => void;
  onSelectBrand: (brand: string | null) => void;
  onSelectColor: (colorId: number | string | null) => void;
  onClearAll: () => void;
  theme?: 'dark' | 'light';
  matchingCount: number;
}

export const FloatingFilterPanel: React.FC<FloatingFilterPanelProps> = ({
  products,
  selectedCategory,
  selectedSize,
  selectedBrand,
  selectedColor,
  onSelectCategory,
  onSelectSize,
  onSelectBrand,
  onSelectColor,
  onClearAll,
  theme = 'dark',
  matchingCount,
}) => {
  const isDark = theme !== 'light';
  const [isOpen, setIsOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedSize) count++;
    if (selectedBrand) count++;
    if (selectedColor !== null) count++;
    return count;
  }, [selectedCategory, selectedSize, selectedBrand, selectedColor]);

  // Extract all available brands with product count (based on category/size constraints)
  const availableBrandsWithCount = useMemo(() => {
    const brandMap: Record<string, number> = {};
    products.forEach((p) => {
      // Check if product matches category and size
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      const matchesSize = selectedSize ? isProductAvailableInSize(p, selectedSize) : true;
      const matchesColor = selectedColor !== null 
        ? getAvailableColors(p, selectedSize).some(c => String(c).toLowerCase() === String(selectedColor).toLowerCase()) 
        : true;

      if (matchesCategory && matchesSize && matchesColor && p.brand && p.brand.trim()) {
        const b = p.brand.trim();
        brandMap[b] = (brandMap[b] || 0) + 1;
      }
    });

    return Object.entries(brandMap)
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count);
  }, [products, selectedCategory, selectedSize, selectedColor]);

  // Filtered brands by search
  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return availableBrandsWithCount;
    return availableBrandsWithCount.filter((b) =>
      b.brand.toLowerCase().includes(brandSearch.toLowerCase().trim())
    );
  }, [availableBrandsWithCount, brandSearch]);

  // Extract all available colors with product count
  const availableColorsWithCount = useMemo(() => {
    const colorMap: Record<string, { id: number | string; count: number; sampleProduct?: Product }> = {};

    products.forEach((p) => {
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      const matchesSize = selectedSize ? isProductAvailableInSize(p, selectedSize) : true;
      const matchesBrand = selectedBrand ? p.brand?.toLowerCase() === selectedBrand.toLowerCase() : true;

      if (matchesCategory && matchesSize && matchesBrand) {
        const colors = getAvailableColors(p, selectedSize);
        colors.forEach((cid) => {
          const strKey = String(cid);
          if (!colorMap[strKey]) {
            colorMap[strKey] = { id: cid, count: 0, sampleProduct: p };
          }
          colorMap[strKey].count += 1;
        });
      }
    });

    const result = Object.values(colorMap).map(({ id, count, sampleProduct }) => ({
      id,
      def: getColorDef(id, sampleProduct),
      count,
    }));

    return result.sort((a, b) => b.count - a.count);
  }, [products, selectedCategory, selectedSize, selectedBrand, selectedColor]);

  const activeColorDef = selectedColor !== null ? getColorDef(selectedColor) : null;

  return (
    <>
      {/* Floating Trigger Pill / Floating Dock */}
      <div className="fixed bottom-5 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2">
        {/* Quick Reset Button when filters are active */}
        {activeFilterCount > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={onClearAll}
            title="Reset all filters"
            className={`p-3 rounded-full shadow-xl border cursor-pointer transition-transform hover:scale-105 active:scale-95 flex items-center justify-center ${
              isDark
                ? 'bg-zinc-900/90 text-zinc-300 border-zinc-750 hover:text-rose-400 hover:border-rose-500/40 backdrop-blur-md'
                : 'bg-white/95 text-zinc-600 border-zinc-200 hover:text-rose-600 hover:border-rose-300 shadow-md backdrop-blur-md'
            }`}
          >
            <RotateCcw size={15} />
          </motion.button>
        )}

        {/* Main Floating Filter Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl border font-bold text-xs sm:text-sm tracking-wide cursor-pointer transition-all duration-200 backdrop-blur-xl ${
            activeFilterCount > 0
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 border-amber-400 shadow-amber-500/25 ring-2 ring-amber-400/40'
              : isDark
              ? 'bg-zinc-900/95 text-white border-zinc-700/80 hover:border-amber-400 hover:text-amber-400 shadow-black/60'
              : 'bg-white/95 text-zinc-900 border-zinc-300 hover:border-amber-500 shadow-xl'
          }`}
        >
          <div className="relative">
            <Filter size={16} className={activeFilterCount > 0 ? 'text-zinc-950' : 'text-amber-500'} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            )}
          </div>

          <span className="font-sans font-bold">
            {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Refine & Filter'}
          </span>

          {/* Active filter badges in pill */}
          {selectedBrand && (
            <span className="hidden md:inline-flex text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/20 text-current truncate max-w-[80px]">
              {selectedBrand}
            </span>
          )}
          {activeColorDef && (
            <span
              className="w-3 h-3 rounded-full border border-black/40 shadow-xs shrink-0"
              style={{ backgroundColor: activeColorDef.hex }}
              title={activeColorDef.name}
            />
          )}

          <ChevronRight
            size={14}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
          />
        </motion.button>
      </div>

      {/* Floating Filter Drawer / Popover Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop on mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 md:bg-transparent md:pointer-events-none"
            />

            {/* Floating Filter Card Container */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`fixed bottom-20 sm:bottom-22 right-3 sm:right-6 w-[calc(100vw-24px)] xs:w-[380px] sm:w-[420px] max-h-[80vh] flex flex-col rounded-2xl sm:rounded-3xl border shadow-2xl z-50 overflow-hidden backdrop-blur-2xl ${
                isDark
                  ? 'bg-zinc-950/95 border-zinc-800 text-white shadow-black/80'
                  : 'bg-white/95 border-zinc-200 text-zinc-900 shadow-2xl'
              }`}
            >
              {/* Header */}
              <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
                isDark ? 'border-zinc-850 bg-zinc-900/50' : 'border-zinc-100 bg-zinc-50/50'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Filter size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base tracking-tight flex items-center gap-1.5">
                      <span>Refine Catalogue</span>
                      {activeFilterCount > 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-black">
                          {activeFilterCount} Active
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-zinc-400 font-mono">
                      {matchingCount} {matchingCount === 1 ? 'pair matches' : 'pairs match'} your criteria
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {activeFilterCount > 0 && (
                    <button
                      onClick={onClearAll}
                      className="text-[11px] font-mono font-bold text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-500/10 cursor-pointer transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isDark ? 'border-zinc-800 text-zinc-400 hover:text-white' : 'border-zinc-200 text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Scrollable Filter Content */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 divide-y divide-zinc-800/40">
                {/* 1. Brand Filter Section */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                      <Tag size={13} /> Filter by Brand
                    </label>
                    {selectedBrand && (
                      <button
                        onClick={() => onSelectBrand(null)}
                        className="text-[10px] font-mono text-zinc-400 hover:text-rose-400 cursor-pointer"
                      >
                        Reset Brand
                      </button>
                    )}
                  </div>

                  {/* Brand search input if > 5 brands */}
                  {availableBrandsWithCount.length > 5 && (
                    <div className={`relative flex items-center rounded-xl border px-2.5 py-1.5 ${
                      isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
                    }`}>
                      <Search size={13} className="text-zinc-400 shrink-0 mr-1.5" />
                      <input
                        type="text"
                        placeholder="Search brand (Bata, Nike, Woodland...)"
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        className="w-full bg-transparent text-xs font-mono focus:outline-hidden placeholder:text-zinc-500"
                      />
                      {brandSearch && (
                        <button onClick={() => setBrandSearch('')} className="text-zinc-400 hover:text-zinc-200">
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Brand Chips Grid */}
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    <button
                      onClick={() => onSelectBrand(null)}
                      className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedBrand === null
                          ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-xs'
                          : isDark
                          ? 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                          : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      All Brands
                    </button>

                    {filteredBrands.map(({ brand, count }) => {
                      const isSelected = selectedBrand?.toLowerCase() === brand.toLowerCase();
                      return (
                        <button
                          key={brand}
                          onClick={() => onSelectBrand(isSelected ? null : brand)}
                          className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md font-black'
                              : isDark
                              ? 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-amber-500/50 hover:text-amber-400'
                              : 'bg-zinc-100 text-zinc-800 border-zinc-200 hover:border-amber-400 hover:text-amber-600'
                          }`}
                        >
                          <span>{brand}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            isSelected ? 'bg-black/20 text-zinc-950' : 'text-zinc-400'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}

                    {filteredBrands.length === 0 && (
                      <p className="text-xs text-zinc-500 font-mono py-2">No matching brands found</p>
                    )}
                  </div>
                </div>

                {/* 2. Color Filter Section */}
                <div className="pt-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                      <Palette size={13} /> Filter by Color
                    </label>
                    {selectedColor && (
                      <button
                        onClick={() => onSelectColor(null)}
                        className="text-[10px] font-mono text-zinc-400 hover:text-rose-400 cursor-pointer"
                      >
                        Reset Color
                      </button>
                    )}
                  </div>

                  {/* Color Swatch Tiles */}
                  <div className="grid grid-cols-2 xs:grid-cols-3 gap-1.5">
                    <button
                      onClick={() => onSelectColor(null)}
                      className={`text-xs font-mono font-bold px-2.5 py-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedColor === null
                          ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-xs'
                          : isDark
                          ? 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                          : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <Sparkles size={12} /> All Colors
                    </button>

                    {availableColorsWithCount.map(({ id, def, count }) => {
                      const isSelected = selectedColor !== null && String(selectedColor).toLowerCase() === String(id).toLowerCase();
                      return (
                        <button
                          key={String(id)}
                          onClick={() => onSelectColor(isSelected ? null : id)}
                          className={`text-xs font-mono font-bold px-2.5 py-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                            isSelected
                              ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md ring-2 ring-amber-400/50 font-black'
                              : isDark
                              ? 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                              : 'bg-zinc-100 text-zinc-800 border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/30 shadow-xs shrink-0"
                              style={{ backgroundColor: def.hex }}
                            />
                            <span className="truncate">{def.name}</span>
                          </div>
                          <span className={`text-[10px] shrink-0 font-mono ${
                            isSelected ? 'text-zinc-950 font-black' : 'text-zinc-400'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Quick Department & Size Switcher */}
                <div className="pt-3.5 space-y-2.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                    Category Division
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      onClick={() => {
                        onSelectCategory(null);
                        onSelectSize(null);
                      }}
                      className={`text-xs font-mono font-bold py-1.5 rounded-xl border transition-all cursor-pointer text-center ${
                        selectedCategory === null
                          ? 'bg-amber-500 text-zinc-950 border-amber-400 font-black'
                          : isDark
                          ? 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                          : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      All
                    </button>
                    {(['Men', 'Women', 'Kids'] as Category[]).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          onSelectCategory(selectedCategory === cat ? null : cat);
                          onSelectSize(null);
                        }}
                        className={`text-xs font-mono font-bold py-1.5 rounded-xl border transition-all cursor-pointer text-center ${
                          selectedCategory === cat
                            ? 'bg-amber-500 text-zinc-950 border-amber-400 font-black'
                            : isDark
                            ? 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className={`p-3.5 sm:p-4 border-t flex items-center gap-2 shrink-0 ${
                isDark ? 'border-zinc-850 bg-zinc-900/60' : 'border-zinc-100 bg-zinc-50'
              }`}>
                {activeFilterCount > 0 && (
                  <button
                    onClick={onClearAll}
                    className={`px-3 py-2.5 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
                      isDark
                        ? 'border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-500/30'
                        : 'border-zinc-200 text-zinc-600 hover:text-rose-600 hover:border-rose-300'
                    }`}
                  >
                    Reset
                  </button>
                )}

                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
                >
                  <Check size={15} className="stroke-[3px]" />
                  <span>Show {matchingCount} {matchingCount === 1 ? 'Pair' : 'Pairs'}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
