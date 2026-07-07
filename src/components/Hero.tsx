import React from 'react';
import { Category } from '../types';
import { motion } from 'motion/react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

interface HeroProps {
  onSelectCategory: (category: Category) => void;
  onScrollToProducts: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSelectCategory, onScrollToProducts }) => {
  const { heroVideoUrl, heroVideoUrl2, heroVideos, heroImages } = useProducts();
  const [scrollY, setScrollY] = React.useState(0);
  const [playlistIndex, setPlaylistIndex] = React.useState(0);
  const [imageIndex, setImageIndex] = React.useState(0);

  // Playlists
  const videoPlaylist = heroVideos.length > 0 
    ? heroVideos.map(v => v.url) 
    : [heroVideoUrl, heroVideoUrl2].filter(Boolean);

  const imagePlaylist = heroImages.length > 0 ? heroImages.map(img => img.url) : [];

  const hasVideos = videoPlaylist.length > 0;
  const hasImages = imagePlaylist.length > 0;

  // Use image slideshow if we have custom images and NO custom database videos
  const showImages = hasImages && heroVideos.length === 0;

  const activeVideoUrl = videoPlaylist[playlistIndex] || 'https://assets.mixkit.co/videos/preview/mixkit-shoes-on-the-running-track-close-up-34282-large.mp4';
  const activeImageUrl = imagePlaylist[imageIndex] || '';

  // Track page scroll position for dynamic background dimming
  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Timer for image slideshow (5 seconds per slide)
  React.useEffect(() => {
    if (!showImages || imagePlaylist.length <= 1) return;
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % imagePlaylist.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [showImages, imagePlaylist.length]);

  const handleVideoEnded = () => {
    if (videoPlaylist.length > 1) {
      setPlaylistIndex((prev) => (prev + 1) % videoPlaylist.length);
    }
  };

  const shouldLoop = videoPlaylist.length <= 1;

  // Keep the background video bright, clear, and unblurred on scroll as requested
  const scrollProgress = Math.min(scrollY / 400, 1);
  const dynamicBrightness = 1.0;
  const dynamicOverlayOpacity = 0.10;
  const dynamicBlur = 0;

  return (
    <section
      id="hero-section"
      className="relative min-h-screen bg-transparent flex flex-col justify-center items-center overflow-hidden pt-16 px-4 md:px-0"
    >
      {/* Fixed Background Asset with Scroll-Reactive Dimming */}
      <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        {showImages ? (
          <motion.img
            key={activeImageUrl}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.6, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            src={activeImageUrl}
            alt="Hero Background Slideshow"
            className="w-full h-full object-cover scale-100 transition-all duration-300"
            style={{ filter: 'blur(3px)' }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <video
            key={activeVideoUrl}
            autoPlay
            loop={shouldLoop}
            muted
            playsInline
            preload="auto"
            onEnded={handleVideoEnded}
            className="w-full h-full object-cover scale-100 transition-all duration-300"
            style={{ filter: 'blur(3px)' }}
            src={activeVideoUrl}
          />
        )}
        {/* Dynamic Solid Darkening Layer */}
        <div 
          className="absolute inset-0 bg-black transition-opacity duration-300" 
          style={{ opacity: dynamicOverlayOpacity }}
        />
        {/* Subtle Luxury Gradient Overlay for Top Branding & Bottom Fade (kept constant and light so video is always visible clearly) */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/40 pointer-events-none transition-opacity duration-300"
          style={{ opacity: 0.25 }}
        />
        {/* Permanent top dark gradient overlay for transparent navbar legibility */}
        <div 
          className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 via-black/20 to-transparent pointer-events-none z-10"
        />
      </div>

      {/* Cinematic Viewport Container (9:16 glass frame) */}
      <div
        id="cinematic-viewport"
        className="relative w-full max-w-[450px] aspect-[9/16] rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] border border-white/10 bg-zinc-950/40 group"
      >
        {/* Real-time media layer inside glass frame */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {showImages ? (
            <motion.img
              key={`frame-${activeImageUrl}`}
              initial={{ opacity: 0.2, scale: 1.15 }}
              animate={{ opacity: 1, scale: 1.02 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              src={activeImageUrl}
              alt="Cinematic Slideshow"
              className="w-full h-full object-cover brightness-100 scale-100 transition-all duration-300"
              style={{ filter: 'none', transform: 'translateZ(0)' }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <video
              key={`frame-${activeVideoUrl}`}
              autoPlay
              loop={shouldLoop}
              muted
              playsInline
              preload="auto"
              onEnded={handleVideoEnded}
              className="w-full h-full object-cover brightness-100 scale-100 transition-all duration-300"
              style={{ filter: 'none', transform: 'translateZ(0)' }}
              src={activeVideoUrl}
            />
          )}
        </div>

        {/* Overlay Dark Gradients for typography legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Lower Third Category Controls (Thumb-Friendly for Mobile) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col items-center text-center">
          {/* Explore Catalogue link positioned above 'Shop Men' */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={onScrollToProducts}
            className="flex flex-col items-center gap-1 cursor-pointer group mb-4"
          >
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 group-hover:text-gold transition-colors">
              EXPLORE CATALOGUE
            </span>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ChevronDown size={12} className="text-zinc-500 group-hover:text-gold transition-colors" />
            </motion.div>
          </motion.div>

          {/* Primary Categories Grid (Men, Women, Kids) */}
          <div className="w-full flex flex-col space-y-3">
            {(['Men', 'Women', 'Kids'] as Category[]).map((category, index) => {
              return (
                <motion.button
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  onClick={() => onSelectCategory(category)}
                  className="w-full py-3.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-all duration-300 cursor-pointer border glass-panel text-white border-white/10 hover:bg-white hover:text-black hover:border-white shadow-lg shadow-black/20"
                >
                  Shop {category}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
