import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { Product } from '../types';
import { HoverZoomImage } from './HoverZoomImage';

export const getProductImages = (product: Product): string[] => {
  if (!product) return [];
  const list = [
    product.imageUrl,
    ...(product.imageUrls || []),
  ].filter((url): url is string => Boolean(url && typeof url === 'string' && url.trim().length > 0));
  return Array.from(new Set(list));
};

interface SwipeableProductThumbnailProps {
  product: Product;
  onClick?: () => void;
  className?: string;
  imageClassName?: string;
  containerClassName?: string;
  zoomScale?: number;
  objectFit?: 'contain' | 'cover';
  theme?: 'dark' | 'light';
  badgeOverlay?: React.ReactNode;
  showMultiBadge?: boolean;
  imageCountPosition?: 'bottom-right' | 'top-right';
}

export const SwipeableProductThumbnail: React.FC<SwipeableProductThumbnailProps> = ({
  product,
  onClick,
  className = '',
  imageClassName = '',
  containerClassName = '',
  zoomScale = 1.6,
  objectFit = 'cover',
  theme = 'dark',
  badgeOverlay,
  showMultiBadge = false,
  imageCountPosition = 'bottom-right',
}) => {
  const images = useMemo(() => getProductImages(product), [product]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(0);
  const [isHovered, setIsHovered] = useState(false);

  // Touch & drag gesture tracking
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef<boolean>(false);
  const isDragging = useRef<boolean>(false);
  const mouseStartX = useRef<number | null>(null);

  const totalImages = images.length;
  const currentImage = images[currentIndex] || product.imageUrl;

  const handleNext = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (totalImages <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalImages);
  };

  const handlePrev = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (totalImages <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // --- TOUCH HANDLERS ---
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.touches[0].clientX - touchStartX.current;
    const diffY = e.touches[0].clientY - touchStartY.current;

    // Detect horizontal swipe vs vertical scroll
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 15) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartX.current;

    if (isSwiping.current && Math.abs(diffX) > 35 && totalImages > 1) {
      if (diffX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // --- MOUSE DRAG HANDLERS ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (totalImages <= 1) return;
    mouseStartX.current = e.clientX;
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseStartX.current === null) return;
    const diffX = e.clientX - mouseStartX.current;
    if (Math.abs(diffX) > 15) {
      isDragging.current = true;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartX.current === null) return;
    const diffX = e.clientX - mouseStartX.current;
    if (isDragging.current && Math.abs(diffX) > 35 && totalImages > 1) {
      if (diffX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    mouseStartX.current = null;
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // If it was a swipe gesture, do not trigger product click
    if (isSwiping.current || isDragging.current) {
      isSwiping.current = false;
      isDragging.current = false;
      return;
    }
    if (onClick) {
      onClick();
    }
  };

  // Slide Animation Variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0,
    }),
  };

  return (
    <div
      className={`relative select-none overflow-hidden group/carousel ${containerClassName}`}
      onClick={handleContainerClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        mouseStartX.current = null;
      }}
    >
      {/* Animated Image Canvas */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 400, damping: 30 },
            opacity: { duration: 0.18 },
          }}
          className="w-full h-full absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <HoverZoomImage
            src={currentImage}
            alt={`${product.name} - View ${currentIndex + 1}`}
            className={`w-full h-full ${objectFit === 'contain' ? 'object-contain' : 'object-cover'} ${imageClassName}`}
            containerClassName="w-full h-full flex items-center justify-center"
            zoomScale={zoomScale}
          />
        </motion.div>
      </AnimatePresence>

      {/* Multiple Images Indicator Badge - Positioned at bottom right by default so it never clashes with top-left OFFER and top-right % OFF badges */}
      {totalImages > 1 && showMultiBadge && (
        <div className={`absolute z-25 pointer-events-none ${
          imageCountPosition === 'top-right' ? 'top-2 right-2' : 'bottom-2 right-2 sm:bottom-2.5 sm:right-2.5'
        }`}>
          <span className="bg-black/80 backdrop-blur-md text-white font-mono text-[9px] px-1.5 py-0.5 rounded-md border border-white/20 flex items-center gap-1 shadow-md font-bold">
            <Layers size={10} className="text-amber-400" />
            <span>{currentIndex + 1}/{totalImages}</span>
          </span>
        </div>
      )}

      {/* Side Arrow Navigation Buttons (Shown if > 1 image) */}
      {totalImages > 1 && (
        <>
          {/* Prev Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous product image"
            className={`absolute left-1.5 top-1/2 -translate-y-1/2 z-30 p-1 sm:p-1.5 rounded-full backdrop-blur-md border shadow-lg transition-all duration-200 cursor-pointer ${
              isHovered ? 'opacity-90 scale-100' : 'opacity-0 sm:opacity-0 group-hover/carousel:opacity-90 scale-95'
            } ${
              theme === 'dark'
                ? 'bg-zinc-900/85 text-white border-zinc-700 hover:bg-amber-500 hover:text-black hover:border-amber-400'
                : 'bg-white/90 text-zinc-900 border-zinc-200 hover:bg-amber-500 hover:text-black hover:border-amber-400'
            }`}
          >
            <ChevronLeft size={14} className="stroke-[2.5px]" />
          </button>

          {/* Next Arrow */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next product image"
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 z-30 p-1 sm:p-1.5 rounded-full backdrop-blur-md border shadow-lg transition-all duration-200 cursor-pointer ${
              isHovered ? 'opacity-90 scale-100' : 'opacity-0 sm:opacity-0 group-hover/carousel:opacity-90 scale-95'
            } ${
              theme === 'dark'
                ? 'bg-zinc-900/85 text-white border-zinc-700 hover:bg-amber-500 hover:text-black hover:border-amber-400'
                : 'bg-white/90 text-zinc-900 border-zinc-200 hover:bg-amber-500 hover:text-black hover:border-amber-400'
            }`}
          >
            <ChevronRight size={14} className="stroke-[2.5px]" />
          </button>

          {/* Swipe Dots Pagination Bar */}
          <div className="absolute bottom-2 inset-x-0 z-30 flex items-center justify-center gap-1.5 pointer-events-auto">
            <div className="bg-black/60 backdrop-blur-md px-2 py-0.8 rounded-full flex items-center gap-1 border border-white/10 shadow-md">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleDotClick(e, idx)}
                  aria-label={`Go to image ${idx + 1}`}
                  className={`transition-all duration-200 rounded-full cursor-pointer ${
                    idx === currentIndex
                      ? 'w-3 h-1.5 bg-amber-400 shadow-xs'
                      : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/90'
                  }`}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Render custom badge overlay if passed */}
      {badgeOverlay}
    </div>
  );
};
