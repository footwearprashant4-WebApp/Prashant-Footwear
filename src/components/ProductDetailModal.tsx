import React, { useState } from 'react';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Shield, Truck, Sparkles, ShoppingCart } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState<number>(product.sizes[0]);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div id="detail-modal-backdrop" className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
        {/* Click outside overlay */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-8 overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.9)] flex flex-col md:flex-row gap-8"
        >
          {/* Decorative glowing background */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-gold/5 rounded-full blur-3xl" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full border border-zinc-900 bg-zinc-900/40 text-zinc-400 hover:text-white hover:border-zinc-800 transition-colors z-10 cursor-pointer"
          >
            <X size={16} />
          </button>

          {/* Left: Interactive Image Portfolio */}
          <div className="w-full md:w-[45%] shrink-0">
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-900/40">
              <img
                src={product.imageUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-4 left-4 bg-zinc-950/80 backdrop-blur-md border border-zinc-850 text-[10px] font-mono tracking-widest uppercase font-bold text-zinc-400 px-3 py-1.5 rounded-lg">
                Category: {product.category}
              </span>
            </div>
          </div>

          {/* Right: Core Meta and Actions */}
          <div className="flex-1 flex flex-col justify-between py-2 text-left">
            <div className="space-y-4">
              {/* Product Heading */}
              <div>
                <span className="text-[10px] font-mono text-gold uppercase tracking-widest font-black">
                  {product.category}'s {product.subCategory}
                </span>
                <h3 className="serif-display text-xl md:text-2xl font-bold uppercase text-white tracking-tight mt-1">
                  {product.name}
                </h3>
                <span className="font-mono text-lg font-bold text-gold mt-2 block">
                  ₹{product.price}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                {product.description || 'A timeless representation of style and athletic performance, built with the highest-grade stitching, bespoke footbed modeling, and wear-resistant vulcanized outer treads.'}
              </p>

              {/* Specs checklist */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                  <Shield size={12} className="text-gold shrink-0" />
                  <span>Premium Cushioned Sole</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                  <Truck size={12} className="text-gold shrink-0" />
                  <span>Free Express Shipping</span>
                </div>
              </div>

              {/* Size Selectors */}
              <div className="pt-4 border-t border-zinc-900/60">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-bold block mb-2.5">
                  Choose Sizing (UK/IN):
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => {
                    const isSelected = sz === selectedSize;
                    return (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`font-mono text-xs font-bold w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gold text-black border-gold font-black shadow-lg shadow-gold-muted'
                            : 'bg-zinc-900/40 border-zinc-850 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CTA action button */}
            <div className="pt-6 mt-6 border-t border-zinc-900">
              {product.stock === 0 ? (
                <button
                  disabled
                  className="w-full py-4 rounded-xl border border-zinc-850 text-zinc-500 text-xs font-bold uppercase cursor-not-allowed text-center bg-zinc-950/20 font-mono"
                >
                  OUT OF STOCK IN ALL SIZES
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isAdded}
                  className={`w-full py-4 rounded-xl font-bold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
                    isAdded
                      ? 'bg-gold text-black font-black'
                      : 'bg-white hover:bg-gold hover:text-black text-black active:scale-95'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check size={14} /> ADDED TO BASKET!
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={13} /> ADD TO SHOPPING BAG
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
