import React from 'react';
import { Category } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Footprints } from 'lucide-react';

interface SizeSelectionOverlayProps {
  category: Category | null;
  onClose: () => void;
  onSelectSize: (size: number) => void;
}

export const SizeSelectionOverlay: React.FC<SizeSelectionOverlayProps> = ({
  category,
  onClose,
  onSelectSize,
}) => {
  if (!category) return null;

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

  const sizes = getSizes(category);

  return (
    <AnimatePresence>
      <div id="size-overlay-backdrop" className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
        {/* Outer click listener to close */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]"
        >
          {/* Decorative glowing gradient circle */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-gold/5 rounded-full blur-2xl" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full border border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          {/* Icon and title header */}
          <div className="flex flex-col items-center text-center mt-4">
            <div className="p-3 bg-gold/5 border border-gold/15 text-gold rounded-full mb-4">
              <Footprints size={24} />
            </div>
            
            <h2 className="serif-display text-xl font-bold tracking-tight text-white uppercase">
              SELECT {category}'S SIZE
            </h2>
            <p className="text-xs text-zinc-500 max-w-[280px] mt-1.5 uppercase tracking-wide">
              Region: Standard UK/IN
            </p>
          </div>

          {/* Size Options Grid */}
          <div className="grid grid-cols-4 gap-3 mt-8">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => onSelectSize(size)}
                className="group relative flex items-center justify-center aspect-square rounded-2xl border border-zinc-850 bg-zinc-950 hover:border-gold hover:bg-gold hover:text-black font-mono text-sm font-bold text-zinc-300 transition-all duration-300 active:scale-95 cursor-pointer"
              >
                {size}
                <span className="absolute bottom-1 text-[8px] opacity-0 group-hover:opacity-100 font-bold uppercase transition-opacity">
                  UK/IN
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-900 text-center">
            <p className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase">
              Prashant Footwear Standard Sizing
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
