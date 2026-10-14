import React, { useState, useEffect, useRef } from 'react';
import { Category } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useLanguage } from '../context/LanguageContext';

interface HeroProps {
  onSelectCategory: (category: Category) => void;
  onScrollToProducts: () => void;
}

const DEFAULT_HERO_IMAGES = [
  { id: 'def-1', name: 'Prestige Footwear', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop', createdAt: new Date().toISOString() },
  { id: 'def-2', name: 'Urban Sneakers', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop', createdAt: new Date().toISOString() },
  { id: 'def-3', name: 'Leather Boots', url: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1200&auto=format&fit=crop', createdAt: new Date().toISOString() },
  { id: 'def-4', name: 'Suede Edition', url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=1200&auto=format&fit=crop', createdAt: new Date().toISOString() }
];

const DEFAULT_HERO_VIDEOS = [
  {
    slot: 1,
    url: 'https://assets.mixkit.co/videos/preview/mixkit-shoes-on-the-running-track-close-up-34282-large.mp4',
    heading: 'Performance Reimagined'
  },
  {
    slot: 2,
    url: 'https://assets.mixkit.co/videos/preview/mixkit-man-walking-with-sneakers-in-the-street-40058-large.mp4',
    heading: 'Urban Streetwear'
  },
  {
    slot: 3,
    url: 'https://assets.mixkit.co/videos/preview/mixkit-person-walking-in-boots-on-autumn-leaves-40061-large.mp4',
    heading: 'Autumn Leather Boots'
  },
  {
    slot: 4,
    url: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-pair-of-white-sneakers-with-neon-details-43265-large.mp4',
    heading: 'Neon Spotlight'
  }
];

export const Hero: React.FC<HeroProps> = ({ onSelectCategory, onScrollToProducts }) => {
  const { 
    heroVideoUrl, 
    heroVideoUrl2,
    heroVideoUrl3,
    heroVideoUrl4,
    heroVideoHeading,
    heroVideoHeading2,
    heroVideoHeading3,
    heroVideoHeading4,
    activeHeroVideoSlot,
    heroVideos, 
    heroImages,
    heroBannerMode,
    heroImageDuration
  } = useProducts();
  const { t } = useLanguage();

  const [imageIndex, setImageIndex] = useState(0);
  const [isPlaybackFinished, setIsPlaybackFinished] = useState(false);
  const [isPulsingCategories, setIsPulsingCategories] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoBuffering, setIsVideoBuffering] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Sequential video playlist: strictly Slot 1 -> Slot 2 -> Slot 3 -> Slot 4
  const videoPlaylist = React.useMemo(() => {
    // Helper to resolve video URL & heading for each slot
    const getSlotData = (
      slotNum: 1 | 2 | 3 | 4,
      slotUrl: string | undefined,
      slotHeading: string | undefined,
      fallbackIndex: number
    ) => {
      // 1. Direct slot setting (uploaded file blob or custom URL)
      let url = slotUrl && slotUrl.trim().length > 0 ? slotUrl.trim() : '';
      let heading = slotHeading && slotHeading.trim().length > 0 ? slotHeading.trim() : '';

      // 2. Check heroVideos collection for this slot index if direct slot is not configured
      if (!url && heroVideos && heroVideos.length > fallbackIndex) {
        url = heroVideos[fallbackIndex].url || '';
        if (!heading) heading = heroVideos[fallbackIndex].heading || heroVideos[fallbackIndex].name || '';
      }

      // 3. Fallback to default high-definition video for this slot
      if (!url) {
        url = DEFAULT_HERO_VIDEOS[fallbackIndex].url;
      }
      if (!heading) {
        heading = DEFAULT_HERO_VIDEOS[fallbackIndex].heading;
      }

      return { slot: slotNum, url, heading };
    };

    return [
      getSlotData(1, heroVideoUrl, heroVideoHeading, 0),
      getSlotData(2, heroVideoUrl2, heroVideoHeading2, 1),
      getSlotData(3, heroVideoUrl3, heroVideoHeading3, 2),
      getSlotData(4, heroVideoUrl4, heroVideoHeading4, 3),
    ];
  }, [
    heroVideoUrl, heroVideoUrl2, heroVideoUrl3, heroVideoUrl4, 
    heroVideoHeading, heroVideoHeading2, heroVideoHeading3, heroVideoHeading4, 
    heroVideos
  ]);

  // Current video index: strictly starts at 0 (Slot 1)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Safely clamp video index within bounds of playlist (0 to 3)
  const safeVideoIndex = currentVideoIndex >= 0 && currentVideoIndex < videoPlaylist.length ? currentVideoIndex : 0;
  const currentVideo = videoPlaylist[safeVideoIndex] || videoPlaylist[0];
  const activeVideoUrl = currentVideo?.url || DEFAULT_HERO_VIDEOS[0].url;
  const activeVideoHeading = currentVideo?.heading || DEFAULT_HERO_VIDEOS[0].heading;

  // Reset video buffer readiness and ensure playback triggers when active URL or index changes
  useEffect(() => {
    setIsVideoReady(false);
    setIsVideoBuffering(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [activeVideoUrl, safeVideoIndex]);

  // Ensure 4 images for slideshow
  const imageList = React.useMemo(() => {
    if (heroImages && heroImages.length >= 4) {
      return heroImages.slice(0, 4);
    }
    if (heroImages && heroImages.length > 0) {
      // Pad with defaults up to 4 items
      const combined = [...heroImages];
      while (combined.length < 4) {
        combined.push(DEFAULT_HERO_IMAGES[combined.length % DEFAULT_HERO_IMAGES.length]);
      }
      return combined;
    }
    return DEFAULT_HERO_IMAGES;
  }, [heroImages]);

  // If banner mode is set to 'images' or video errored, start immediately on slideshow
  const showImagesOnly = heroBannerMode === 'images' || videoError;
  const isDisplayingSlideshow = isPlaybackFinished || showImagesOnly;

  // Exact 15-second timer per image (or admin configured duration)
  const slideDurationSeconds = heroImageDuration && heroImageDuration > 0 ? heroImageDuration : 15;

  // Handle video completion:
  // Strictly plays Video 1 -> Video 2 -> Video 3 -> Video 4 in order.
  // After all 4 videos have finished playing, seamlessly start the 4-Image Slideshow Loop!
  const handleVideoEnded = () => {
    if (heroBannerMode === 'videos') {
      // In pure video loop mode, cycle through all 4 videos indefinitely (1 -> 2 -> 3 -> 4 -> 1...)
      setCurrentVideoIndex((prev) => (prev + 1) % videoPlaylist.length);
    } else {
      // In default/hybrid mode:
      if (currentVideoIndex < videoPlaylist.length - 1) {
        // Advance to next video in sequence (1 -> 2 -> 3 -> 4)
        setCurrentVideoIndex((prev) => prev + 1);
      } else {
        // All 4 uploaded videos have completed sequentially! Switch to continuous 4-image slideshow loop
        setIsPlaybackFinished(true);
      }
    }
  };

  const handleVideoError = (e?: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.warn(`Hero video playback notice on slot ${safeVideoIndex + 1}/${videoPlaylist.length}.`);
    const fallbackUrl = DEFAULT_HERO_VIDEOS[safeVideoIndex]?.url;
    if (videoRef.current && fallbackUrl && videoRef.current.src !== fallbackUrl) {
      videoRef.current.src = fallbackUrl;
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  const handleReplayVideos = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentVideoIndex(0);
    setIsPlaybackFinished(false);
    setIsVideoReady(false);
    setIsVideoBuffering(true);
    setImageIndex(0);
    setVideoError(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  // Preload images into memory to ensure seamless zero-lag cross-fades
  useEffect(() => {
    imageList.forEach((img) => {
      if (img?.url) {
        const imageObj = new Image();
        imageObj.src = img.url;
      }
    });
  }, [imageList]);

  // 15-second infinite slideshow loop
  useEffect(() => {
    if (!isDisplayingSlideshow || imageList.length <= 1) return;

    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % imageList.length);
    }, slideDurationSeconds * 1000);

    return () => clearInterval(interval);
  }, [isDisplayingSlideshow, imageList.length, slideDurationSeconds]);

  const scrollToCategories = () => {
    const el = document.getElementById('hero-category-selector');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      onScrollToProducts();
    }
    setIsPulsingCategories(true);
    setTimeout(() => setIsPulsingCategories(false), 1400);
  };

  const handleBannerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;
    scrollToCategories();
  };

  const currentImage = imageList[imageIndex] || imageList[0];

  return (
    <section
      id="hero-section"
      className="relative w-full h-[100svh] min-h-[100svh] max-h-[100svh] bg-transparent flex flex-col justify-start items-center overflow-hidden pt-14 sm:pt-16 pb-0 px-0"
    >
      {/* Fixed Ambient Background Layer */}
      <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none hidden sm:block">
        <AnimatePresence mode="wait">
          {isDisplayingSlideshow ? (
            <motion.img
              key={`bg-img-${currentImage.url}`}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.65, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              src={currentImage.url}
              alt="Hero Ambient Slideshow"
              className="w-full h-full object-cover scale-100 transition-all duration-300"
              style={{ filter: 'blur(3px)' }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div key="bg-video-container" className="relative w-full h-full">
              {/* Background fallback image screen */}
              <motion.img
                key={`bg-fallback-${imageList[0]?.url}`}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: isVideoReady ? 0.2 : 0.65, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeInOut' }}
                src={imageList[0]?.url || DEFAULT_HERO_IMAGES[0].url}
                alt="Hero Ambient Fallback"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: 'blur(3px)' }}
                referrerPolicy="no-referrer"
              />
              {/* Background ambient video */}
              <motion.video
                key={`bg-video-${safeVideoIndex}-${activeVideoUrl}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: isVideoReady ? 0.7 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.0 }}
                autoPlay
                muted
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                style={{ filter: 'blur(3px)' }}
                src={activeVideoUrl}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Ambient Darkening Overlays */}
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 via-black/20 to-transparent pointer-events-none z-10" />
      </div>

      {/* Cinematic Viewport Container (Edge-to-edge from left to right, full first-view visibility) */}
      <div
        id="cinematic-viewport"
        onClick={handleBannerClick}
        className="relative w-full flex-1 h-[calc(100svh-3.5rem)] max-h-[calc(100svh-3.5rem)] sm:h-[calc(100svh-4rem)] sm:max-h-[calc(100svh-4rem)] rounded-none border-x-0 border-y border-gold/30 shadow-none bg-zinc-950/70 group cursor-pointer flex flex-col justify-between overflow-hidden"
      >
        {/* Media Crossfade Layer */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <AnimatePresence mode="wait">
            {isDisplayingSlideshow ? (
              <motion.div
                key={`frame-img-${currentImage.url}-${imageIndex}`}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1.0] }}
                className="absolute inset-0 w-full h-full"
              >
                <img
                  src={currentImage.url}
                  alt={currentImage.name || 'Hero Image'}
                  className="w-full h-full object-cover brightness-100 transition-all duration-300"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ) : (
              <motion.div
                key={`frame-video-container-${safeVideoIndex}-${activeVideoUrl}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full"
              >
                {/* Image Screen / Buffering Poster with subtle fade-in & soft scale */}
                <motion.div
                  key="hero-video-image-screen"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute inset-0 w-full h-full"
                >
                  <img
                    src={imageList[0]?.url || DEFAULT_HERO_IMAGES[0].url}
                    alt={activeVideoHeading || 'Hero Preview'}
                    className="w-full h-full object-cover brightness-95"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle luxury vignette & dark overlay during buffering */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none" />

                  {/* Perceived Performance Buffering Indicator */}
                  {(!isVideoReady || isVideoBuffering) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
                    >
                      <div className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-gold/30 flex items-center gap-2 shadow-2xl">
                        <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
                        <span className="text-[10px] font-mono tracking-widest text-gold uppercase font-semibold">
                          Buffering HD Video {videoPlaylist.length > 1 ? `(${safeVideoIndex + 1}/${videoPlaylist.length})` : ''}...
                        </span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Intro Video Layer - smoothly fades in over image screen once ready */}
                <video
                  ref={videoRef}
                  key={`frame-video-${safeVideoIndex}-${activeVideoUrl}`}
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
                  onLoadStart={() => setIsVideoBuffering(true)}
                  onWaiting={() => setIsVideoBuffering(true)}
                  onLoadedData={() => {
                    setIsVideoReady(true);
                    setIsVideoBuffering(false);
                  }}
                  onCanPlay={() => {
                    setIsVideoReady(true);
                    setIsVideoBuffering(false);
                  }}
                  onPlaying={() => {
                    setIsVideoReady(true);
                    setIsVideoBuffering(false);
                  }}
                  onEnded={handleVideoEnded}
                  onError={handleVideoError}
                  className={`w-full h-full object-cover brightness-100 transition-opacity duration-700 ease-in-out ${
                    isVideoReady ? 'opacity-100' : 'opacity-0'
                  }`}
                  src={activeVideoUrl}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ambient Bottom Gradient for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

        {/* Lower Third Category Navigation (100% visible in the first front view) */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4 pb-2.5 sm:pb-3.5 flex flex-col items-center text-center z-20">
          {/* Explore Catalogue Anchor */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={onScrollToProducts}
            className="flex flex-col items-center gap-0.5 cursor-pointer group mb-1 font-sans"
          >
            <span className="text-[9px] sm:text-[10px] tracking-widest text-zinc-300 group-hover:text-gold transition-colors font-bold uppercase drop-shadow-md">
              {t('nav.collection')}
            </span>
            <motion.div
              animate={{ y: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ChevronDown size={11} className="text-zinc-400 group-hover:text-gold transition-colors" />
            </motion.div>
          </motion.div>

          {/* Categories Grid (Men, Women, Kids) */}
          <div 
            id="hero-category-selector" 
            className={`w-full max-w-sm sm:max-w-md mx-auto flex flex-col space-y-1.5 font-sans transition-all duration-300 ${
              isPulsingCategories ? 'scale-105 ring-2 ring-gold/60 rounded-3xl p-1 bg-black/50 backdrop-blur-sm' : ''
            }`}
          >
            {(['Men', 'Women', 'Kids'] as Category[]).map((category, index) => {
              const shopKey = `store.shop${category}` as any;
              return (
                <motion.button
                  key={category}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCategory(category);
                  }}
                  className={`w-full py-2 sm:py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer border shadow-lg shadow-black/30 ${
                    isPulsingCategories 
                      ? 'bg-gold text-black border-gold shadow-gold/40' 
                      : 'glass-panel text-white border-white/20 hover:bg-white hover:text-black hover:border-white'
                  }`}
                >
                  {t(shopKey)}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

