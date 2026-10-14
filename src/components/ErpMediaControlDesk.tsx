import React, { useState, useEffect } from 'react';
import { 
  Smartphone, SlidersHorizontal, Video, Image, Layers, Sparkles, Clock, Upload, CheckCircle, AlertCircle, X, ArrowRight, ArrowLeft, RefreshCw, Check, Edit3, Play, Database, Save, HardDrive, RotateCcw
} from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

export interface ErpMediaControlDeskProps {
  isDark: boolean;
  heroBannerMode: 'images' | 'videos' | 'both';
  updateHeroBannerMode: (mode: 'images' | 'videos' | 'both') => Promise<any>;
  heroImageDuration: number;
  updateHeroImageDuration: (duration: number) => Promise<any>;
  heroImages: Array<{ id: string; name: string; url: string }>;
  updateHeroImageSlot: (slotNum: 1 | 2 | 3 | 4, name: string, url: string, isBase64?: boolean) => Promise<any>;
  heroVideoUrl: string;
  heroVideoUrl2: string;
  heroVideoUrl3: string;
  heroVideoUrl4: string;
  heroVideoHeading: string;
  heroVideoHeading2: string;
  heroVideoHeading3: string;
  heroVideoHeading4: string;
  updateHeroVideoUrl: (url: string, slotNum: 1 | 2 | 3 | 4) => Promise<any>;
  updateHeroVideoHeadingSlot: (heading: string, slotNum: 1 | 2 | 3 | 4) => Promise<any>;
  uploadLocalVideo: (file: File, slotNum: 1 | 2 | 3 | 4) => Promise<any>;
  activeHeroVideoSlot?: 1 | 2 | 3 | 4;
  updateActiveHeroVideoSlot?: (slot: 1 | 2 | 3 | 4) => Promise<any>;
  offersBannerUrl: string;
  updateOffersBannerUrl: (url: string) => Promise<any>;
  offersCategoryBgUrl?: string;
  updateOffersCategoryBgUrl?: (url: string) => Promise<any>;
  categoryThumbMen: string;
  categoryThumbWomen: string;
  categoryThumbKids: string;
  updateCategoryThumbnail: (category: 'Men' | 'Women' | 'Kids', url: string) => Promise<any>;
  saveAllHeroBannerSetup?: (setup: any) => Promise<any>;
}

export const ErpMediaControlDesk: React.FC<ErpMediaControlDeskProps> = ({
  isDark,
  heroBannerMode,
  updateHeroBannerMode,
  heroImageDuration,
  updateHeroImageDuration,
  heroImages,
  updateHeroImageSlot,
  heroVideoUrl,
  heroVideoUrl2,
  heroVideoUrl3,
  heroVideoUrl4,
  heroVideoHeading,
  heroVideoHeading2,
  heroVideoHeading3,
  heroVideoHeading4,
  updateHeroVideoUrl,
  updateHeroVideoHeadingSlot,
  uploadLocalVideo,
  activeHeroVideoSlot = 1,
  updateActiveHeroVideoSlot,
  offersBannerUrl,
  updateOffersBannerUrl,
  offersCategoryBgUrl = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2000&auto=format&fit=crop',
  updateOffersCategoryBgUrl,
  categoryThumbMen,
  categoryThumbWomen,
  categoryThumbKids,
  updateCategoryThumbnail,
  saveAllHeroBannerSetup
}) => {
  // Navigation State: 'main' | 'hero_modes' | 'images' | 'videos' | 'both' | 'offers'
  const [erpPage, setErpPage] = useState<'main' | 'hero_modes' | 'images' | 'videos' | 'both' | 'offers'>('main');

  // Status banners
  const [erpSuccess, setErpSuccess] = useState<string | null>(null);
  const [erpError, setErpError] = useState<string | null>(null);

  // Hero Image Slots Form State
  const [imgSlot1Name, setImgSlot1Name] = useState(() => heroImages.find(i => i.id === 'hero-image-slot-1')?.name || heroImages[0]?.name || 'Prestige Footwear');
  const [imgSlot1Url, setImgSlot1Url] = useState(() => heroImages.find(i => i.id === 'hero-image-slot-1')?.url || heroImages[0]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop');
  
  const [imgSlot2Name, setImgSlot2Name] = useState(() => heroImages.find(i => i.id === 'hero-image-slot-2')?.name || heroImages[1]?.name || 'Urban Sneakers');
  const [imgSlot2Url, setImgSlot2Url] = useState(() => heroImages.find(i => i.id === 'hero-image-slot-2')?.url || heroImages[1]?.url || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop');
  
  const [imgSlot3Name, setImgSlot3Name] = useState(() => heroImages.find(i => i.id === 'hero-image-slot-3')?.name || heroImages[2]?.name || 'Leather Boots');
  const [imgSlot3Url, setImgSlot3Url] = useState(() => heroImages.find(i => i.id === 'hero-image-slot-3')?.url || heroImages[2]?.url || 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1200&auto=format&fit=crop');
  
  const [imgSlot4Name, setImgSlot4Name] = useState(() => heroImages.find(i => i.id === 'hero-image-slot-4')?.name || heroImages[3]?.name || 'Suede Edition');
  const [imgSlot4Url, setImgSlot4Url] = useState(() => heroImages.find(i => i.id === 'hero-image-slot-4')?.url || heroImages[3]?.url || 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=1200&auto=format&fit=crop');

  const [savingImgSlot, setSavingImgSlot] = useState<number | null>(null);

  // Duration State
  const [slideDurationInput, setSlideDurationInput] = useState<number>(heroImageDuration || 5);
  const [isSavingDuration, setIsSavingDuration] = useState(false);

  useEffect(() => {
    if (heroImageDuration) {
      setSlideDurationInput(heroImageDuration);
    }
  }, [heroImageDuration]);

  // Video Form State
  const [erpVideoIndex, setErpVideoIndex] = useState<1 | 2 | 3 | 4>(1);
  const [erpVideoInput, setErpVideoInput] = useState(heroVideoUrl || '');
  const [erpVideoInput2, setErpVideoInput2] = useState(heroVideoUrl2 || '');
  const [erpVideoInput3, setErpVideoInput3] = useState(heroVideoUrl3 || '');
  const [erpVideoInput4, setErpVideoInput4] = useState(heroVideoUrl4 || '');
  const [erpVideoHeadingInput, setErpVideoHeadingInput] = useState(heroVideoHeading || '');
  const [erpVideoHeadingInput2, setErpVideoHeadingInput2] = useState(heroVideoHeading2 || '');
  const [erpVideoHeadingInput3, setErpVideoHeadingInput3] = useState(heroVideoHeading3 || '');
  const [erpVideoHeadingInput4, setErpVideoHeadingInput4] = useState(heroVideoHeading4 || '');
  const [isUpdatingVideo, setIsUpdatingVideo] = useState(false);

  // Sync props when video URLs or headings change
  useEffect(() => {
    if (heroVideoUrl) setErpVideoInput(heroVideoUrl);
  }, [heroVideoUrl]);
  useEffect(() => {
    if (heroVideoUrl2) setErpVideoInput2(heroVideoUrl2);
  }, [heroVideoUrl2]);
  useEffect(() => {
    if (heroVideoUrl3) setErpVideoInput3(heroVideoUrl3);
  }, [heroVideoUrl3]);
  useEffect(() => {
    if (heroVideoUrl4) setErpVideoInput4(heroVideoUrl4);
  }, [heroVideoUrl4]);
  useEffect(() => {
    if (heroVideoHeading) setErpVideoHeadingInput(heroVideoHeading);
  }, [heroVideoHeading]);
  useEffect(() => {
    if (heroVideoHeading2) setErpVideoHeadingInput2(heroVideoHeading2);
  }, [heroVideoHeading2]);
  useEffect(() => {
    if (heroVideoHeading3) setErpVideoHeadingInput3(heroVideoHeading3);
  }, [heroVideoHeading3]);
  useEffect(() => {
    if (heroVideoHeading4) setErpVideoHeadingInput4(heroVideoHeading4);
  }, [heroVideoHeading4]);

  // Offers & Category Form State
  const [offersBannerInput, setOffersBannerInput] = useState(offersBannerUrl || '');
  const [isUpdatingOffersBanner, setIsUpdatingOffersBanner] = useState(false);
  const [offersCategoryBgInput, setOffersCategoryBgInput] = useState(offersCategoryBgUrl || '');
  const [isUpdatingOffersCategoryBg, setIsUpdatingOffersCategoryBg] = useState(false);
  const [categoryThumbMenInput, setCategoryThumbMenInput] = useState(categoryThumbMen || '');
  const [categoryThumbWomenInput, setCategoryThumbWomenInput] = useState(categoryThumbWomen || '');
  const [categoryThumbKidsInput, setCategoryThumbKidsInput] = useState(categoryThumbKids || '');

  useEffect(() => {
    if (offersCategoryBgUrl) {
      setOffersCategoryBgInput(offersCategoryBgUrl);
    }
  }, [offersCategoryBgUrl]);

  // Sub-tab state for Image & Video Hero Banner Hybrid Page: 'both' | 'video' | 'images'
  const [hybridViewTab, setHybridViewTab] = useState<'both' | 'video' | 'images'>('both');
  const [isSavingAllHeroSetup, setIsSavingAllHeroSetup] = useState(false);

  const handleSaveEntireHeroConfig = async () => {
    setIsSavingAllHeroSetup(true);
    setErpError(null);
    try {
      const videoSlots = [
        { slot: 1 as const, url: erpVideoInput || heroVideoUrl, heading: erpVideoHeadingInput || heroVideoHeading },
        { slot: 2 as const, url: erpVideoInput2 || heroVideoUrl2, heading: erpVideoHeadingInput2 || heroVideoHeading2 },
        { slot: 3 as const, url: erpVideoInput3 || heroVideoUrl3, heading: erpVideoHeadingInput3 || heroVideoHeading3 },
        { slot: 4 as const, url: erpVideoInput4 || heroVideoUrl4, heading: erpVideoHeadingInput4 || heroVideoHeading4 },
      ];
      const imageSlots = [
        { slot: 1 as const, name: imgSlot1Name, url: imgSlot1Url },
        { slot: 2 as const, name: imgSlot2Name, url: imgSlot2Url },
        { slot: 3 as const, name: imgSlot3Name, url: imgSlot3Url },
        { slot: 4 as const, name: imgSlot4Name, url: imgSlot4Url },
      ];

      if (saveAllHeroBannerSetup) {
        const res = await saveAllHeroBannerSetup({
          videos: videoSlots,
          images: imageSlots,
          bannerMode: heroBannerMode,
          duration: slideDurationInput
        });
        if (res.success) {
          setErpSuccess('💾 All 4 Hero Videos & 4 Slideshow Images successfully saved and synced to the Firestore Database!');
        } else {
          setErpError(`Save issue: ${res.error}`);
        }
      } else {
        await Promise.all([
          ...videoSlots.map(v => updateHeroVideoUrl(v.url, v.slot)),
          ...videoSlots.map(v => updateHeroVideoHeadingSlot(v.heading, v.slot)),
          ...imageSlots.map(img => updateHeroImageSlot(img.slot, img.name, img.url, img.url.startsWith('data:'))),
          updateHeroBannerMode(heroBannerMode),
          updateHeroImageDuration(slideDurationInput)
        ]);
        setErpSuccess('💾 All 4 Hero Videos & 4 Slideshow Images successfully saved to the Database!');
      }
    } catch (err: any) {
      setErpError(`Failed to save setup to database: ${err.message || String(err)}`);
    } finally {
      setIsSavingAllHeroSetup(false);
    }
  };

  return (
    <div className={`rounded-3xl p-6 md:p-8 space-y-8 animate-fade-in border shadow-xl transition-all ${
      isDark ? 'bg-zinc-900/80 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
    }`}>
      
      {/* Notifications / Feedback Banners */}
      {erpSuccess && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-fade-in shadow-md ${
          isDark ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className={isDark ? 'text-emerald-400 shrink-0' : 'text-emerald-600 shrink-0'} />
            <span className="font-medium">{erpSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setErpSuccess(null)}
            className={`p-1 rounded-lg transition-colors ${
              isDark ? 'text-emerald-400 hover:text-white hover:bg-emerald-900/50' : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100'
            }`}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {erpError && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-fade-in shadow-md ${
          isDark ? 'bg-rose-950/60 border-rose-800/60 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className={isDark ? 'text-rose-400 shrink-0' : 'text-rose-600 shrink-0'} />
            <span className="font-medium">{erpError}</span>
          </div>
          <button
            type="button"
            onClick={() => setErpError(null)}
            className={`p-1 rounded-lg transition-colors ${
              isDark ? 'text-rose-400 hover:text-white hover:bg-rose-900/50' : 'text-rose-700 hover:text-rose-900 hover:bg-rose-100'
            }`}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* PAGE 1: MAIN ERP MEDIA CONTROL DESK HOME PAGE (MINIMAL & UNCOMPLICATED) */}
      {erpPage === 'main' && (
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-6 ${
            isDark ? 'border-zinc-800' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <span className={`p-3 rounded-2xl border ${
                isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                <Smartphone size={24} />
              </span>
              <div>
                <h3 className={`serif-display text-2xl font-bold uppercase tracking-wider ${
                  isDark ? 'text-zinc-100' : 'text-slate-900'
                }`}>
                  ERP Media Control Desk
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Centralized Storefront Presentation & Banner Management Hub
                </p>
              </div>
            </div>

            {/* Active Banner Status Badge */}
            <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-3 text-xs font-bold ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div>
                <span className="text-[10px] font-mono uppercase opacity-70 block">Active Storefront Mode:</span>
                <span className="font-extrabold text-amber-500 uppercase tracking-wide">
                  {heroBannerMode === 'images' ? `📸 Images Hero Banner (${heroImageDuration || 5}s Timer)` : heroBannerMode === 'videos' ? '🎬 Video Hero Banner' : '⚡ Image & Video Hybrid'}
                </span>
              </div>
            </div>
          </div>

          {/* 2 Prominent Main Module Options Cards (Hero Banner Options & Category/Offers) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CARD 1: MANAGE HERO BANNER (Options, Modes, Videos & Images) */}
            <div className={`p-6 md:p-8 rounded-3xl border transition-all flex flex-col justify-between group shadow-lg ${
              isDark
                ? 'bg-gradient-to-b from-amber-500/10 via-zinc-900 to-zinc-900 border-amber-500/30 hover:border-amber-500/60'
                : 'bg-gradient-to-b from-amber-50/80 via-white to-white border-amber-200 hover:border-amber-400 shadow-slate-200/80'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-amber-500 text-black font-black shadow-md shadow-amber-500/20">
                    <SlidersHorizontal size={24} />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase bg-amber-500/20 text-amber-500 border border-amber-500/30">
                    {heroBannerMode === 'images' ? '📸 Images Mode Active' : heroBannerMode === 'videos' ? '🎬 Video Mode Active' : '⚡ Hybrid Mode Active'}
                  </span>
                </div>

                <div>
                  <h4 className={`text-xl font-black uppercase tracking-wider group-hover:text-amber-500 transition-colors ${
                    isDark ? 'text-zinc-100' : 'text-slate-900'
                  }`}>
                    Manage Hero Banner
                  </h4>
                  <p className={`text-xs mt-2.5 leading-relaxed ${
                    isDark ? 'text-zinc-400' : 'text-slate-600'
                  }`}>
                    Configure storefront presentation modes (Images, HD Video Playlist, or Image & Video Hybrid), customize display timers, and manage high-definition media assets.
                  </p>
                </div>

                {/* Sub-features overview pill tags */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold ${
                    isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    📸 4 Slideshow Images
                  </span>
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold ${
                    isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    🎬 4 HD Video Clips
                  </span>
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold ${
                    isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    ⏱️ Custom Slide Timers
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setErpPage('hero_modes')}
                className="mt-6 w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Open Hero Banner Options</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* CARD 2: OFFERS & CATEGORY DIVISION THUMBNAILS */}
            <div className={`p-6 md:p-8 rounded-3xl border transition-all flex flex-col justify-between group shadow-lg ${
              isDark
                ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-slate-200/80'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3.5 rounded-2xl ${
                    isDark ? 'bg-zinc-800 text-amber-400' : 'bg-slate-100 text-amber-700'
                  }`}>
                    <Sparkles size={24} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                    isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    Offers & Covers
                  </span>
                </div>

                <div>
                  <h4 className={`text-xl font-black uppercase tracking-wider group-hover:text-amber-500 transition-colors ${
                    isDark ? 'text-zinc-100' : 'text-slate-900'
                  }`}>
                    Offers & Category Banners
                  </h4>
                  <p className={`text-xs mt-2.5 leading-relaxed ${
                    isDark ? 'text-zinc-400' : 'text-slate-600'
                  }`}>
                    Configure promotional deal banners, sale callouts, and curated cover thumbnails for Men's, Women's, and Kids' footwear divisions.
                  </p>
                </div>

                {/* Sub-features overview pill tags */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold ${
                    isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    🏷️ Promo Deals Banner
                  </span>
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold ${
                    isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    👟 3 Category Divisions
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setErpPage('offers')}
                className={`mt-6 w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  isDark
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                }`}
              >
                <span>Manage Category & Offers</span>
                <ArrowRight size={16} />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PAGE 2: MANAGE HERO BANNER OPTIONS PAGE (3 MODES WITH DISTINCT SET & EDIT ACTIONS) */}
      {erpPage === 'hero_modes' && (
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 ${
            isDark ? 'border-zinc-800' : 'border-slate-200'
          }`}>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setErpPage('main')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer border mb-2 ${
                  isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
              >
                <ArrowLeft size={14} />
                <span>Back to Media Control Desk</span>
              </button>
              <h3 className={`serif-display text-2xl font-black uppercase tracking-wider ${
                isDark ? 'text-zinc-100' : 'text-slate-900'
              }`}>
                Hero Banner Options
              </h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Set the active presentation mode for your storefront or click Edit to configure videos, images, and timers:
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-2xl text-xs font-mono font-black uppercase bg-amber-500 text-black shrink-0">
                3 Modes Available
              </span>
            </div>
          </div>

          {/* Hero Banner Options Presentation Cards */}
          <div className="space-y-4">
            
            {/* OPTION 1: IMAGES HERO BANNER */}
            <div className={`p-6 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md ${
              heroBannerMode === 'images'
                ? isDark
                  ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                  : 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-300 shadow-amber-500/10'
                : isDark
                  ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                  : 'bg-white border-slate-200 hover:border-slate-300'
            }`}>
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3.5 rounded-2xl shrink-0 mt-1 ${
                  heroBannerMode === 'images'
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Image size={24} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className={`text-base font-black uppercase tracking-wider ${
                      isDark ? 'text-zinc-100' : 'text-slate-900'
                    }`}>
                      Images Hero Banner
                    </h4>
                    {heroBannerMode === 'images' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle size={12} /> Active Mode
                      </span>
                    ) : (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'
                      }`}>
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className={`text-xs leading-relaxed max-w-2xl ${
                    isDark ? 'text-zinc-400' : 'text-slate-600'
                  }`}>
                    Displays 4 curated high-resolution slide images with an automated custom slide duration timer ({heroImageDuration || 5}s per slide) and device file uploads.
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] font-mono">
                    <span className={isDark ? 'text-amber-400 font-bold' : 'text-amber-700 font-bold'}>
                      📸 4 Image Slots
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>
                      ⏱️ {heroImageDuration || 5}s Slide Timer
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Set Hero Banner & Edit Hero Banner */}
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                {heroBannerMode === 'images' ? (
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 opacity-90 cursor-default"
                  >
                    <CheckCircle size={14} /> Active Banner
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      await updateHeroBannerMode('images');
                      setErpSuccess('🎉 Storefront mode updated to Images Hero Banner!');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={14} /> Set Hero Banner
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setErpPage('images')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isDark
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700 hover:border-amber-500/50'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300 hover:border-amber-400 shadow-xs'
                  }`}
                >
                  <Edit3 size={14} className="text-amber-500" />
                  <span>Edit Hero Banner</span>
                </button>
              </div>
            </div>

            {/* OPTION 2: VIDEO HERO BANNER */}
            <div className={`p-6 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md ${
              heroBannerMode === 'videos'
                ? isDark
                  ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                  : 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-300 shadow-amber-500/10'
                : isDark
                  ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                  : 'bg-white border-slate-200 hover:border-slate-300'
            }`}>
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3.5 rounded-2xl shrink-0 mt-1 ${
                  heroBannerMode === 'videos'
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Video size={24} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className={`text-base font-black uppercase tracking-wider ${
                      isDark ? 'text-zinc-100' : 'text-slate-900'
                    }`}>
                      Video Hero Banner
                    </h4>
                    {heroBannerMode === 'videos' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle size={12} /> Active Mode
                      </span>
                    ) : (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'
                      }`}>
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className={`text-xs leading-relaxed max-w-2xl ${
                    isDark ? 'text-zinc-400' : 'text-slate-600'
                  }`}>
                    Plays a seamless sequential quad-clip HD video loop playlist across 4 customizable video slots with direct MP4 uploads, streaming URLs, and headline overlays.
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] font-mono">
                    <span className={isDark ? 'text-amber-400 font-bold' : 'text-amber-700 font-bold'}>
                      🎬 4 HD Video Clips
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>
                      📼 Sequential Loop Playback
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Set Hero Banner & Edit Hero Banner */}
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                {heroBannerMode === 'videos' ? (
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 opacity-90 cursor-default"
                  >
                    <CheckCircle size={14} /> Active Banner
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      await updateHeroBannerMode('videos');
                      setErpSuccess('🎉 Storefront mode updated to Video Hero Banner!');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={14} /> Set Hero Banner
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setErpPage('videos')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isDark
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700 hover:border-amber-500/50'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300 hover:border-amber-400 shadow-xs'
                  }`}
                >
                  <Edit3 size={14} className="text-amber-500" />
                  <span>Edit Hero Banner</span>
                </button>
              </div>
            </div>

            {/* OPTION 3: IMAGE & VIDEO HERO BANNER (HYBRID) */}
            <div className={`p-6 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md ${
              heroBannerMode === 'both'
                ? isDark
                  ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                  : 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-300 shadow-amber-500/10'
                : isDark
                  ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                  : 'bg-white border-slate-200 hover:border-slate-300'
            }`}>
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3.5 rounded-2xl shrink-0 mt-1 ${
                  heroBannerMode === 'both'
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Layers size={24} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className={`text-base font-black uppercase tracking-wider ${
                      isDark ? 'text-zinc-100' : 'text-slate-900'
                    }`}>
                      Image & Video Hero Banner
                    </h4>
                    {heroBannerMode === 'both' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle size={12} /> Active Mode
                      </span>
                    ) : (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'
                      }`}>
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className={`text-xs leading-relaxed max-w-2xl ${
                    isDark ? 'text-zinc-400' : 'text-slate-600'
                  }`}>
                    Dual hybrid presentation combining both worlds: plays an introductory HD video clip upon visit before seamlessly transitioning to your 4-image slideshow loop.
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] font-mono">
                    <span className={isDark ? 'text-amber-400 font-bold' : 'text-amber-700 font-bold'}>
                      ⚡ Hybrid: Intro Video + 4 Slides
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>
                      ⏱️ {heroImageDuration || 5}s Slide Timer
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Set Hero Banner & Edit Hero Banner */}
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                {heroBannerMode === 'both' ? (
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 opacity-90 cursor-default"
                  >
                    <CheckCircle size={14} /> Active Banner
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      await updateHeroBannerMode('both');
                      setErpSuccess('🎉 Storefront mode updated to Image & Video Hero Banner!');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={14} /> Set Hero Banner
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setErpPage('both')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isDark
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700 hover:border-amber-500/50'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300 hover:border-amber-400 shadow-xs'
                  }`}
                >
                  <Edit3 size={14} className="text-amber-500" />
                  <span>Edit Hero Banner</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PAGE 3: IMAGES HERO BANNER MANAGEMENT PAGE (4 IMAGES LIMIT + DEVICE UPLOAD + TIMER) */}
      {erpPage === 'images' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Breadcrumb Header */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 ${
            isDark ? 'border-zinc-800' : 'border-slate-200'
          }`}>
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setErpPage('hero_modes')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 cursor-pointer border ${
                    isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  <ArrowLeft size={14} />
                  <span>Hero Options</span>
                </button>
                <span className="text-zinc-500">/</span>
                <button
                  type="button"
                  onClick={() => setErpPage('main')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 cursor-pointer border ${
                    isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  <span>Media Control Desk</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500 text-black">
                  <Image size={22} />
                </div>
                <div>
                  <h3 className={`serif-display text-2xl font-black uppercase tracking-wider ${
                    isDark ? 'text-zinc-100' : 'text-slate-900'
                  }`}>
                    Configure Images Hero Banner
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Configure timer duration and upload up to <strong>4 Hero Images</strong> from local device or web URL.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              <span className="px-3 py-1.5 rounded-2xl text-xs font-mono font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shrink-0">
                <CheckCircle size={14} /> 4 Slots
              </span>
              <button
                type="button"
                disabled={isSavingAllHeroSetup}
                onClick={handleSaveEntireHeroConfig}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSavingAllHeroSetup ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-black" />
                    <span>Saving to DB...</span>
                  </>
                ) : (
                  <>
                    <Database size={14} className="text-black" />
                    <span>💾 Save Images to Database</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* DURATION TIMER PANEL */}
          <div className={`p-5 rounded-3xl border space-y-4 shadow-sm transition-all ${
            isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${
                  isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-200 text-amber-800'
                }`}>
                  <Clock size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                    Hero Image Display Duration Timer
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase bg-amber-500 text-black">
                      {heroImageDuration || 5}s Active
                    </span>
                  </h4>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                    Configure how long each image slide remains on screen before automatically transitioning.
                  </p>
                </div>
              </div>
            </div>

            <div className={`flex flex-wrap items-center justify-between gap-3 pt-3 border-t ${
              isDark ? 'border-amber-500/20' : 'border-amber-200/80'
            }`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-90 mr-1">Quick Presets:</span>
                {[3, 5, 8, 10, 12, 15].map(sec => (
                  <button
                    key={sec}
                    type="button"
                    onClick={async () => {
                      setSlideDurationInput(sec);
                      setIsSavingDuration(true);
                      const res = await updateHeroImageDuration(sec);
                      setIsSavingDuration(false);
                      if (res.success) {
                        setErpSuccess(`🎉 Image display duration set to ${sec} seconds!`);
                      } else {
                        setErpError(res.error || 'Failed to update duration.');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer border ${
                      (heroImageDuration || 5) === sec
                        ? 'bg-amber-500 text-black border-amber-400 shadow-md font-black scale-105'
                        : isDark
                          ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase opacity-90">Custom:</span>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={slideDurationInput}
                  onChange={(e) => setSlideDurationInput(parseInt(e.target.value, 10) || 1)}
                  className={`w-20 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border text-center ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-amber-500'
                      : 'bg-white border-slate-300 text-slate-800 focus:border-amber-500'
                  }`}
                />
                <span className="text-xs font-bold uppercase opacity-90">sec</span>

                <button
                  type="button"
                  disabled={isSavingDuration}
                  onClick={async () => {
                    setIsSavingDuration(true);
                    const res = await updateHeroImageDuration(slideDurationInput);
                    setIsSavingDuration(false);
                    if (res.success) {
                      setErpSuccess(`🎉 Image display duration updated to ${slideDurationInput} seconds!`);
                    } else {
                      setErpError(res.error || 'Failed to update duration.');
                    }
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border shadow-sm ${
                    isDark
                      ? 'bg-amber-500 hover:bg-amber-400 text-black border-amber-400'
                      : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700'
                  }`}
                >
                  {isSavingDuration ? 'Saving...' : 'Set Duration'}
                </button>
              </div>
            </div>
          </div>

          {/* 4 HERO IMAGE SLOTS GRID (LIMIT 4 IMAGES + DEVICE FILE UPLOAD) */}
          <div className="space-y-4">
            <h4 className={`text-sm font-black uppercase tracking-wider ${
              isDark ? 'text-zinc-200' : 'text-slate-900'
            }`}>
              4 Hero Image Slots
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  slotNum: 1,
                  name: imgSlot1Name,
                  setName: setImgSlot1Name,
                  url: imgSlot1Url,
                  setUrl: setImgSlot1Url,
                  defaultUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
                  defaultTitle: 'Prestige Footwear'
                },
                {
                  slotNum: 2,
                  name: imgSlot2Name,
                  setName: setImgSlot2Name,
                  url: imgSlot2Url,
                  setUrl: setImgSlot2Url,
                  defaultUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop',
                  defaultTitle: 'Urban Sneakers'
                },
                {
                  slotNum: 3,
                  name: imgSlot3Name,
                  setName: setImgSlot3Name,
                  url: imgSlot3Url,
                  setUrl: setImgSlot3Url,
                  defaultUrl: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1200&auto=format&fit=crop',
                  defaultTitle: 'Leather Boots'
                },
                {
                  slotNum: 4,
                  name: imgSlot4Name,
                  setName: setImgSlot4Name,
                  url: imgSlot4Url,
                  setUrl: setImgSlot4Url,
                  defaultUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=1200&auto=format&fit=crop',
                  defaultTitle: 'Suede Edition'
                }
              ].map((slot) => {
                const isSaving = savingImgSlot === slot.slotNum;
                return (
                  <div
                    key={slot.slotNum}
                    className={`border rounded-3xl p-5 space-y-4 transition-all flex flex-col justify-between ${
                      isDark ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700' : 'bg-slate-50/90 border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Slot Header */}
                      <div className={`flex items-center justify-between pb-2 border-b ${
                        isDark ? 'border-zinc-800' : 'border-slate-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-black uppercase ${
                            isDark ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-amber-100 border-amber-300 text-amber-800'
                          }`}>
                            IMAGE SLOT {slot.slotNum} OF 4
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono flex items-center gap-1 ${
                            isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-200 text-slate-600'
                          }`}>
                            <Clock size={10} className={isDark ? 'text-amber-400' : 'text-amber-700'} /> {heroImageDuration || 5}s Timer
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold flex items-center gap-1 ${
                          isDark ? 'text-emerald-400' : 'text-emerald-600'
                        }`}>
                          <CheckCircle size={12} /> Ready
                        </span>
                      </div>

                      {/* Live Image Preview Container */}
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800 group shadow-inner">
                        <img
                          src={slot.url || slot.defaultUrl}
                          alt={`Slot ${slot.slotNum}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = slot.defaultUrl;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-3 flex flex-col justify-between pointer-events-none">
                          <span className="text-[8px] font-mono tracking-widest text-amber-400 font-bold uppercase">
                            SLIDE #{slot.slotNum} PREVIEW
                          </span>
                          <p className="text-xs font-extrabold text-white uppercase tracking-wider drop-shadow-md">
                            {slot.name || slot.defaultTitle}
                          </p>
                        </div>
                      </div>

                      {/* Slide Title Input */}
                      <div className="space-y-1">
                        <label className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${
                          isDark ? 'text-zinc-400' : 'text-slate-600'
                        }`}>
                          Slide Overlay Title:
                        </label>
                        <input
                          type="text"
                          value={slot.name}
                          onChange={(e) => slot.setName(e.target.value)}
                          placeholder={`e.g. ${slot.defaultTitle}`}
                          className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-500 font-medium ${
                            isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                          }`}
                        />
                      </div>

                      {/* PROMINENT DEVICE IMAGE UPLOAD BUTTON */}
                      <div className="pt-1">
                        <label className={`w-full py-2.5 px-3 rounded-xl border-2 border-dashed hover:border-amber-500 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs ${
                          isDark ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20' : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                        }`}>
                          <Upload size={16} className="text-amber-500 shrink-0" />
                          <span>Upload Image from Device (PC / Mobile)</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = async () => {
                                const base64 = reader.result as string;
                                slot.setUrl(base64);
                                setSavingImgSlot(slot.slotNum);
                                const res = await updateHeroImageSlot(slot.slotNum as 1 | 2 | 3 | 4, slot.name || slot.defaultTitle, base64, true);
                                setSavingImgSlot(null);
                                if (res.success) {
                                  setErpSuccess(`🎉 Custom image uploaded from device to Hero Slot ${slot.slotNum}!`);
                                } else {
                                  setErpError(`Failed to save image to slot ${slot.slotNum}: ${res.error}`);
                                }
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      </div>

                      {/* Image URL Input */}
                      <div className="space-y-1">
                        <label className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${
                          isDark ? 'text-zinc-400' : 'text-slate-600'
                        }`}>
                          Or Image Web URL:
                        </label>
                        <input
                          type="text"
                          value={slot.url}
                          onChange={(e) => slot.setUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-500 font-mono ${
                            isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                          }`}
                        />
                      </div>

                      {/* Quick Presets */}
                      <div className="pt-1">
                        <p className={`text-[9px] font-mono uppercase tracking-wider mb-1.5 font-bold ${
                          isDark ? 'text-zinc-500' : 'text-slate-500'
                        }`}>
                          Quick Presets:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { title: 'Red Sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop' },
                            { title: 'Urban Grey', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop' },
                            { title: 'Leather Boots', url: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1200&auto=format&fit=crop' },
                            { title: 'Suede Workshop', url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=1200&auto=format&fit=crop' }
                          ].map((preset, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => {
                                slot.setName(preset.title);
                                slot.setUrl(preset.url);
                              }}
                              className={`px-2 py-1 rounded-lg border text-[10px] transition-all cursor-pointer ${
                                isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-500/50' : 'bg-white border-slate-200 text-slate-600 hover:text-amber-700 hover:border-amber-400 shadow-xs'
                              }`}
                            >
                              {preset.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className={`pt-3 border-t ${
                      isDark ? 'border-zinc-800' : 'border-slate-200'
                    }`}>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={async () => {
                          setSavingImgSlot(slot.slotNum);
                          const res = await updateHeroImageSlot(
                            slot.slotNum as 1 | 2 | 3 | 4,
                            slot.name || slot.defaultTitle,
                            slot.url || slot.defaultUrl,
                            slot.url.startsWith('data:')
                          );
                          setSavingImgSlot(null);
                          if (res.success) {
                            setErpSuccess(`🎉 Hero Image Slot ${slot.slotNum} saved successfully!`);
                          } else {
                            setErpError(`Error saving Image Slot ${slot.slotNum}: ${res.error}`);
                          }
                        }}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" /> Saving Slot {slot.slotNum}...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={14} /> Save & Deploy Image Slot {slot.slotNum}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* PAGE 4: VIDEO HERO BANNER MANAGEMENT PAGE */}
      {erpPage === 'videos' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 ${
            isDark ? 'border-zinc-800' : 'border-slate-200'
          }`}>
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setErpPage('hero_modes')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 cursor-pointer border ${
                    isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  <ArrowLeft size={14} />
                  <span>Hero Options</span>
                </button>
                <span className="text-zinc-500">/</span>
                <button
                  type="button"
                  onClick={() => setErpPage('main')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 cursor-pointer border ${
                    isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  <span>Media Control Desk</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500 text-black">
                  <Video size={22} />
                </div>
                <div>
                  <h3 className={`serif-display text-2xl font-black uppercase tracking-wider ${
                    isDark ? 'text-zinc-100' : 'text-slate-900'
                  }`}>
                    Configure Video Loop Hero Banner
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Configure 4 HD video loop clips, overlay headlines, and device MP4 video uploads.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Master Save Button to Database */}
            <button
              type="button"
              disabled={isSavingAllHeroSetup}
              onClick={handleSaveEntireHeroConfig}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
            >
              {isSavingAllHeroSetup ? (
                <>
                  <RefreshCw size={15} className="animate-spin text-black" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Database size={15} className="text-black" />
                  <span>💾 Save All Videos to Database</span>
                </>
              )}
            </button>
          </div>

          {/* Video Slot selector pills & Active Intro Selector */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-4 ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDark ? 'text-zinc-200' : 'text-slate-900'
                }`}>
                  <Video size={16} className={isDark ? 'text-amber-400' : 'text-amber-600'} /> Footwear Video Slots
                </p>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}>
                  Active Store Intro: Slot {activeHeroVideoSlot}
                </span>
              </div>
              <p className={`text-[11px] ${
                isDark ? 'text-zinc-400' : 'text-slate-600'
              }`}>
                Select a slot (1, 2, 3, 4) below to upload a device MP4 or paste a stream URL. You can also set any slot as the primary Intro Video!
              </p>
            </div>

            {/* Video Slot selector pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`flex items-center gap-1.5 p-1 border rounded-xl ${
                isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-200/60 border-slate-300'
              }`}>
                {[1, 2, 3, 4].map((vIdx) => (
                  <button
                    key={vIdx}
                    type="button"
                    onClick={() => setErpVideoIndex(vIdx as 1 | 2 | 3 | 4)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      erpVideoIndex === vIdx
                        ? 'bg-amber-500 text-black font-black shadow-md'
                        : isDark
                          ? 'text-zinc-400 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Slot {vIdx}</span>
                    {activeHeroVideoSlot === vIdx && (
                      <span className="text-[10px]">⭐</span>
                    )}
                  </button>
                ))}
              </div>

              {updateActiveHeroVideoSlot && (
                <button
                  type="button"
                  onClick={async () => {
                    await updateActiveHeroVideoSlot(erpVideoIndex);
                    setErpSuccess(`🎉 Slot ${erpVideoIndex} set as the Active Storefront Intro Video!`);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeHeroVideoSlot === erpVideoIndex
                      ? isDark 
                        ? 'bg-emerald-950 border-emerald-700 text-emerald-300' 
                        : 'bg-emerald-100 border-emerald-300 text-emerald-900'
                      : isDark
                        ? 'bg-zinc-800 hover:bg-amber-500 hover:text-black border-zinc-700 text-amber-400'
                        : 'bg-white hover:bg-amber-500 hover:text-black border-slate-300 text-amber-700 shadow-xs'
                  }`}
                >
                  <Sparkles size={13} />
                  <span>{activeHeroVideoSlot === erpVideoIndex ? `✓ Slot ${erpVideoIndex} is Intro Video` : `Set Slot ${erpVideoIndex} as Intro Video`}</span>
                </button>
              )}
            </div>
          </div>

          {/* Selected Video Slot Configuration Panel */}
          <div className={`border rounded-3xl p-6 space-y-6 ${
            isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50/90 border-slate-200 shadow-sm'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDark ? 'border-zinc-800' : 'border-slate-200'
            }`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                isDark ? 'text-amber-400' : 'text-amber-700'
              }`}>
                <Video size={16} /> Video Slot {erpVideoIndex} Configuration {activeHeroVideoSlot === erpVideoIndex ? '(Active Intro Video)' : ''}
              </h4>
              <span className={`text-[10px] font-mono uppercase ${
                isDark ? 'text-zinc-400' : 'text-slate-500'
              }`}>HERO VIDEO #{erpVideoIndex}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-inner">
                {(() => {
                  const currentVideoSrc = 
                    erpVideoIndex === 1 ? (erpVideoInput || heroVideoUrl) :
                    erpVideoIndex === 2 ? (erpVideoInput2 || heroVideoUrl2) :
                    erpVideoIndex === 3 ? (erpVideoInput3 || heroVideoUrl3) : (erpVideoInput4 || heroVideoUrl4);
                  return (
                    <video
                      key={`${erpVideoIndex}-${currentVideoSrc}`}
                      src={currentVideoSrc}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  );
                })()}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-3 flex flex-col justify-between pointer-events-none">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono tracking-widest text-amber-400 font-bold uppercase">
                      LIVE VIDEO SLOT #{erpVideoIndex} PREVIEW
                    </span>
                    {activeHeroVideoSlot === erpVideoIndex && (
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[9px] font-black uppercase">
                        ACTIVE INTRO
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-extrabold text-white uppercase tracking-wider drop-shadow-md">
                    {
                      erpVideoIndex === 1 ? (erpVideoHeadingInput || heroVideoHeading) :
                      erpVideoIndex === 2 ? (erpVideoHeadingInput2 || heroVideoHeading2) :
                      erpVideoIndex === 3 ? (erpVideoHeadingInput3 || heroVideoHeading3) : (erpVideoHeadingInput4 || heroVideoHeading4)
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Headline input */}
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${
                    isDark ? 'text-zinc-400' : 'text-slate-600'
                  }`}>
                    Hero Overlay Headline text:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={
                        erpVideoIndex === 1 ? erpVideoHeadingInput :
                        erpVideoIndex === 2 ? erpVideoHeadingInput2 :
                        erpVideoIndex === 3 ? erpVideoHeadingInput3 : erpVideoHeadingInput4
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (erpVideoIndex === 1) setErpVideoHeadingInput(val);
                        else if (erpVideoIndex === 2) setErpVideoHeadingInput2(val);
                        else if (erpVideoIndex === 3) setErpVideoHeadingInput3(val);
                        else setErpVideoHeadingInput4(val);
                      }}
                      placeholder="e.g. PERFORMANCE REIMAGINED"
                      className={`flex-1 px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-500 font-medium ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const targetHeading = 
                          erpVideoIndex === 1 ? erpVideoHeadingInput :
                          erpVideoIndex === 2 ? erpVideoHeadingInput2 :
                          erpVideoIndex === 3 ? erpVideoHeadingInput3 : erpVideoHeadingInput4;
                        const res = await updateHeroVideoHeadingSlot(targetHeading.trim(), erpVideoIndex);
                        if (res.success) {
                          setErpSuccess(`Heading for Video Slot ${erpVideoIndex} updated!`);
                        } else {
                          setErpError(`Error updating heading: ${res.error}`);
                        }
                      }}
                      className={`px-4 py-2 rounded-xl border text-xs font-extrabold uppercase transition-all cursor-pointer shrink-0 ${
                        isDark ? 'bg-zinc-800 hover:bg-amber-500 hover:text-black border-zinc-700 text-zinc-200' : 'bg-slate-200 hover:bg-amber-500 hover:text-black border-slate-300 text-slate-800'
                      }`}
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Video URL Control */}
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${
                    isDark ? 'text-zinc-400' : 'text-slate-600'
                  }`}>
                    Direct Web MP4 Video Stream URL:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={
                        erpVideoIndex === 1 ? erpVideoInput :
                        erpVideoIndex === 2 ? erpVideoInput2 :
                        erpVideoIndex === 3 ? erpVideoInput3 : erpVideoInput4
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (erpVideoIndex === 1) setErpVideoInput(val);
                        else if (erpVideoIndex === 2) setErpVideoInput2(val);
                        else if (erpVideoIndex === 3) setErpVideoInput3(val);
                        else setErpVideoInput4(val);
                      }}
                      placeholder="https://assets.mixkit.co/videos/..."
                      className={`flex-1 px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-500 font-mono ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const targetInput = 
                          erpVideoIndex === 1 ? erpVideoInput :
                          erpVideoIndex === 2 ? erpVideoInput2 :
                          erpVideoIndex === 3 ? erpVideoInput3 : erpVideoInput4;
                        const res = await updateHeroVideoUrl(targetInput.trim(), erpVideoIndex);
                        if (res.success) {
                          setErpSuccess(`Video URL for Slot ${erpVideoIndex} deployed!`);
                        } else {
                          setErpError(`Failed to save video URL: ${res.error}`);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-extrabold uppercase transition-all shadow-md shadow-amber-500/10 cursor-pointer shrink-0"
                    >
                      Save URL
                    </button>
                  </div>
                </div>

                {/* Local Video Device Upload */}
                <div className="pt-2">
                  <label className={`w-full py-2.5 px-4 rounded-xl border border-dashed hover:border-amber-500 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isUpdatingVideo
                      ? 'opacity-60 cursor-not-allowed bg-amber-500/10 border-amber-500 text-amber-400'
                      : isDark ? 'bg-zinc-950 border-zinc-700 text-zinc-300 hover:bg-zinc-900' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-xs'
                  }`}>
                    {isUpdatingVideo ? (
                      <RefreshCw size={15} className="animate-spin text-amber-500" />
                    ) : (
                      <Upload size={15} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
                    )}
                    <span>
                      {isUpdatingVideo ? `Uploading & Processing Video for Slot ${erpVideoIndex}...` : `Upload MP4 Video File from Device for Slot ${erpVideoIndex}`}
                    </span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      disabled={isUpdatingVideo}
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUpdatingVideo(true);
                        const localPreview = URL.createObjectURL(file);
                        if (erpVideoIndex === 1) setErpVideoInput(localPreview);
                        else if (erpVideoIndex === 2) setErpVideoInput2(localPreview);
                        else if (erpVideoIndex === 3) setErpVideoInput3(localPreview);
                        else setErpVideoInput4(localPreview);

                        const res = await uploadLocalVideo(file, erpVideoIndex);
                        setIsUpdatingVideo(false);
                        e.target.value = '';
                        if (res.success) {
                          setErpSuccess(`🎉 Device video uploaded and active for Slot ${erpVideoIndex}!`);
                        } else {
                          setErpError(`Failed to upload local video: ${res.error}`);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Footwear Sample Video Presets */}
            <div className={`pt-3 border-t ${
              isDark ? 'border-zinc-800' : 'border-slate-200'
            }`}>
              <p className={`text-[10px] font-mono uppercase tracking-widest font-bold mb-2 ${
                isDark ? 'text-zinc-400' : 'text-slate-600'
              }`}>
                Tested Footwear Video Presets:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Running Track', url: 'https://assets.mixkit.co/videos/preview/mixkit-shoes-on-the-running-track-close-up-34282-large.mp4', heading: 'PERFORMANCE REIMAGINED' },
                  { name: 'Street Sneakers', url: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-pair-of-white-sneakers-43264-large.mp4', heading: 'URBAN STREETWEAR' },
                  { name: 'Leather Boots', url: 'https://assets.mixkit.co/videos/preview/mixkit-feet-of-a-person-walking-with-leather-boots-43266-large.mp4', heading: 'AUTUMN ESSENTIALS' },
                  { name: 'Neon Spotlight', url: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-pair-of-white-sneakers-with-neon-details-43265-large.mp4', heading: 'NEON SPOTLIGHT' }
                ].map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={async () => {
                      if (erpVideoIndex === 1) {
                        setErpVideoInput(preset.url);
                        setErpVideoHeadingInput(preset.heading);
                      } else if (erpVideoIndex === 2) {
                        setErpVideoInput2(preset.url);
                        setErpVideoHeadingInput2(preset.heading);
                      } else if (erpVideoIndex === 3) {
                        setErpVideoInput3(preset.url);
                        setErpVideoHeadingInput3(preset.heading);
                      } else {
                        setErpVideoInput4(preset.url);
                        setErpVideoHeadingInput4(preset.heading);
                      }
                      await updateHeroVideoUrl(preset.url, erpVideoIndex);
                      await updateHeroVideoHeadingSlot(preset.heading, erpVideoIndex);
                      setErpSuccess(`Applied ${preset.name} preset to Slot ${erpVideoIndex}!`);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all group cursor-pointer ${
                      isDark ? 'bg-zinc-950 border-zinc-800 hover:border-amber-500/50' : 'bg-white border-slate-200 hover:border-amber-400 shadow-xs'
                    }`}
                  >
                    <p className={`text-xs font-bold transition-colors ${
                      isDark ? 'text-zinc-200 group-hover:text-amber-400' : 'text-slate-800 group-hover:text-amber-700'
                    }`}>{preset.name}</p>
                    <p className={`text-[9px] font-mono uppercase tracking-wider ${
                      isDark ? 'text-zinc-500' : 'text-slate-500'
                    }`}>{preset.heading}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 4B: DEDICATED HYBRID IMAGE & VIDEO HERO BANNER CONFIGURATION PAGE */}
      {erpPage === 'both' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 ${
            isDark ? 'border-zinc-800' : 'border-slate-200'
          }`}>
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setErpPage('hero_modes')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 cursor-pointer border ${
                    isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  <ArrowLeft size={14} />
                  <span>Hero Options</span>
                </button>
                <span className="text-zinc-500">/</span>
                <button
                  type="button"
                  onClick={() => setErpPage('main')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 cursor-pointer border ${
                    isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  <span>Media Control Desk</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500 text-black">
                  <Layers size={22} />
                </div>
                <div>
                  <h3 className={`serif-display text-2xl font-black uppercase tracking-wider ${
                    isDark ? 'text-zinc-100' : 'text-slate-900'
                  }`}>
                    Configure Image & Video Hero Banner
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Manage both your Intro HD Video clips (up to 4) and your 4-Image Slideshow Loop with custom timer duration.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Master Save Button to Database */}
            <button
              type="button"
              disabled={isSavingAllHeroSetup}
              onClick={handleSaveEntireHeroConfig}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isSavingAllHeroSetup ? (
                <>
                  <RefreshCw size={15} className="animate-spin text-black" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Database size={15} className="text-black" />
                  <span>💾 Save All Setup to Database</span>
                </>
              )}
            </button>
          </div>

          {/* Hybrid Mode Sub-navigation tabs */}
          <div className={`flex flex-wrap gap-2 p-1.5 rounded-2xl border ${
            isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setHybridViewTab('both')}
              className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                hybridViewTab === 'both'
                  ? 'bg-amber-500 text-black font-black shadow-md'
                  : isDark
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Layers size={15} />
              <span>⚡ View Both (Video + Images)</span>
            </button>

            <button
              type="button"
              onClick={() => setHybridViewTab('video')}
              className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                hybridViewTab === 'video'
                  ? 'bg-amber-500 text-black font-black shadow-md'
                  : isDark
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Video size={15} />
              <span>🎬 1. Intro Video Setup</span>
            </button>

            <button
              type="button"
              onClick={() => setHybridViewTab('images')}
              className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                hybridViewTab === 'images'
                  ? 'bg-amber-500 text-black font-black shadow-md'
                  : isDark
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Image size={15} />
              <span>📸 2. Slideshow Images (4 Slots)</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* SECTION 1: HERO BANNER VIDEO SETUP */}
          {/* ======================================================== */}
          {(hybridViewTab === 'both' || hybridViewTab === 'video') && (
            <div className={`border rounded-3xl p-6 space-y-6 ${
              isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50/90 border-slate-200 shadow-sm'
            }`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
                isDark ? 'border-zinc-800' : 'border-slate-200'
              }`}>
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-amber-500 text-black">
                    <Video size={18} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-black uppercase tracking-wider ${
                        isDark ? 'text-zinc-100' : 'text-slate-900'
                      }`}>
                        1. Hero Banner Video Section (Slot {erpVideoIndex} of 4)
                      </h4>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-black uppercase">
                        Sequence (1 → 2 → 3 → 4 → Image Loop)
                      </span>
                    </div>
                    <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      All uploaded videos (up to 4) play in sequence on storefront load. Once all videos finish, the 4-Image Slideshow Loop begins.
                    </p>
                  </div>
                </div>

                {/* Video Slot selector pills & Active Intro Set Button */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className={`flex items-center gap-1.5 p-1 border rounded-xl ${
                    isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-200/60 border-slate-300'
                  }`}>
                    {[1, 2, 3, 4].map((vIdx) => (
                      <button
                        key={vIdx}
                        type="button"
                        onClick={() => setErpVideoIndex(vIdx as 1 | 2 | 3 | 4)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          erpVideoIndex === vIdx
                            ? 'bg-amber-500 text-black font-black shadow-xs'
                            : isDark
                              ? 'text-zinc-400 hover:text-white'
                              : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>Slot {vIdx}</span>
                        {activeHeroVideoSlot === vIdx && (
                          <span className="text-[10px]">⭐</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {updateActiveHeroVideoSlot && (
                    <button
                      type="button"
                      onClick={async () => {
                        await updateActiveHeroVideoSlot(erpVideoIndex);
                        setErpSuccess(`🎉 Slot ${erpVideoIndex} set as the Active Storefront Intro Video!`);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeHeroVideoSlot === erpVideoIndex
                          ? isDark 
                            ? 'bg-emerald-950 border-emerald-700 text-emerald-300' 
                            : 'bg-emerald-100 border-emerald-300 text-emerald-900'
                          : isDark
                            ? 'bg-zinc-800 hover:bg-amber-500 hover:text-black border-zinc-700 text-amber-400'
                            : 'bg-white hover:bg-amber-500 hover:text-black border-slate-300 text-amber-700 shadow-xs'
                      }`}
                    >
                      <Sparkles size={13} />
                      <span>{activeHeroVideoSlot === erpVideoIndex ? `✓ Slot ${erpVideoIndex} is Intro` : `Set as Intro`}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-inner">
                  {(() => {
                    const currentVideoSrc = 
                      erpVideoIndex === 1 ? (erpVideoInput || heroVideoUrl) :
                      erpVideoIndex === 2 ? (erpVideoInput2 || heroVideoUrl2) :
                      erpVideoIndex === 3 ? (erpVideoInput3 || heroVideoUrl3) : (erpVideoInput4 || heroVideoUrl4);
                    return (
                      <video
                        key={`${erpVideoIndex}-${currentVideoSrc}`}
                        src={currentVideoSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    );
                  })()}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-3 flex flex-col justify-between pointer-events-none">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono tracking-widest text-amber-400 font-bold uppercase">
                        LIVE VIDEO SLOT #{erpVideoIndex} PREVIEW
                      </span>
                      {activeHeroVideoSlot === erpVideoIndex && (
                        <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[9px] font-black uppercase">
                          ACTIVE INTRO
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-extrabold text-white uppercase tracking-wider drop-shadow-md">
                      {
                        erpVideoIndex === 1 ? (erpVideoHeadingInput || heroVideoHeading) :
                        erpVideoIndex === 2 ? (erpVideoHeadingInput2 || heroVideoHeading2) :
                        erpVideoIndex === 3 ? (erpVideoHeadingInput3 || heroVideoHeading3) : (erpVideoHeadingInput4 || heroVideoHeading4)
                      }
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Headline input */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${
                      isDark ? 'text-zinc-400' : 'text-slate-600'
                    }`}>
                      Overlay Headline Text:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={
                          erpVideoIndex === 1 ? erpVideoHeadingInput :
                          erpVideoIndex === 2 ? erpVideoHeadingInput2 :
                          erpVideoIndex === 3 ? erpVideoHeadingInput3 : erpVideoHeadingInput4
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (erpVideoIndex === 1) setErpVideoHeadingInput(val);
                          else if (erpVideoIndex === 2) setErpVideoHeadingInput2(val);
                          else if (erpVideoIndex === 3) setErpVideoHeadingInput3(val);
                          else setErpVideoHeadingInput4(val);
                        }}
                        placeholder="e.g. PERFORMANCE REIMAGINED"
                        className={`flex-1 px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-500 font-medium ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const targetHeading = 
                            erpVideoIndex === 1 ? erpVideoHeadingInput :
                            erpVideoIndex === 2 ? erpVideoHeadingInput2 :
                            erpVideoIndex === 3 ? erpVideoHeadingInput3 : erpVideoHeadingInput4;
                          const res = await updateHeroVideoHeadingSlot(targetHeading.trim(), erpVideoIndex);
                          if (res.success) {
                            setErpSuccess(`Heading for Video Slot ${erpVideoIndex} updated!`);
                          } else {
                            setErpError(`Error updating heading: ${res.error}`);
                          }
                        }}
                        className={`px-4 py-2 rounded-xl border text-xs font-extrabold uppercase transition-all cursor-pointer shrink-0 ${
                          isDark ? 'bg-zinc-800 hover:bg-amber-500 hover:text-black border-zinc-700 text-zinc-200' : 'bg-slate-200 hover:bg-amber-500 hover:text-black border-slate-300 text-slate-800'
                        }`}
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Video URL Control */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${
                      isDark ? 'text-zinc-400' : 'text-slate-600'
                    }`}>
                      Direct Web MP4 Video Stream URL:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={
                          erpVideoIndex === 1 ? erpVideoInput :
                          erpVideoIndex === 2 ? erpVideoInput2 :
                          erpVideoIndex === 3 ? erpVideoInput3 : erpVideoInput4
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (erpVideoIndex === 1) setErpVideoInput(val);
                          else if (erpVideoIndex === 2) setErpVideoInput2(val);
                          else if (erpVideoIndex === 3) setErpVideoInput3(val);
                          else setErpVideoInput4(val);
                        }}
                        placeholder="https://assets.mixkit.co/videos/..."
                        className={`flex-1 px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-500 font-mono ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const targetInput = 
                            erpVideoIndex === 1 ? erpVideoInput :
                            erpVideoIndex === 2 ? erpVideoInput2 :
                            erpVideoIndex === 3 ? erpVideoInput3 : erpVideoInput4;
                          const res = await updateHeroVideoUrl(targetInput.trim(), erpVideoIndex);
                          if (res.success) {
                            setErpSuccess(`Video URL for Slot ${erpVideoIndex} deployed!`);
                          } else {
                            setErpError(`Failed to save video URL: ${res.error}`);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-extrabold uppercase transition-all shadow-md shadow-amber-500/10 cursor-pointer shrink-0"
                      >
                        Save URL
                      </button>
                    </div>
                  </div>

                  {/* Local Video Device Upload */}
                  <div className="pt-2">
                    <label className={`w-full py-2.5 px-4 rounded-xl border-2 border-dashed hover:border-amber-500 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isUpdatingVideo
                        ? 'opacity-60 cursor-not-allowed bg-amber-500/10 border-amber-500 text-amber-400'
                        : isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                    }`}>
                      {isUpdatingVideo ? (
                        <RefreshCw size={16} className="animate-spin text-amber-500" />
                      ) : (
                        <Upload size={16} className="text-amber-500" />
                      )}
                      <span>
                        {isUpdatingVideo ? `Uploading & Processing Video for Slot ${erpVideoIndex}...` : `Upload MP4 Video File from Device for Slot ${erpVideoIndex}`}
                      </span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm"
                        disabled={isUpdatingVideo}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsUpdatingVideo(true);
                          const localPreview = URL.createObjectURL(file);
                          if (erpVideoIndex === 1) setErpVideoInput(localPreview);
                          else if (erpVideoIndex === 2) setErpVideoInput2(localPreview);
                          else if (erpVideoIndex === 3) setErpVideoInput3(localPreview);
                          else setErpVideoInput4(localPreview);

                          const res = await uploadLocalVideo(file, erpVideoIndex);
                          setIsUpdatingVideo(false);
                          e.target.value = '';
                          if (res.success) {
                            setErpSuccess(`🎉 Device video uploaded and active for Slot ${erpVideoIndex}!`);
                          } else {
                            setErpError(`Failed to upload local video: ${res.error}`);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Tested Footwear Video Presets */}
              <div className={`pt-3 border-t ${
                isDark ? 'border-zinc-800' : 'border-slate-200'
              }`}>
                <p className={`text-[10px] font-mono uppercase tracking-widest font-bold mb-2 ${
                  isDark ? 'text-zinc-400' : 'text-slate-600'
                }`}>
                  Tested Footwear Video Presets:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { name: 'Running Track', url: 'https://assets.mixkit.co/videos/preview/mixkit-shoes-on-the-running-track-close-up-34282-large.mp4', heading: 'PERFORMANCE REIMAGINED' },
                    { name: 'Street Sneakers', url: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-pair-of-white-sneakers-43264-large.mp4', heading: 'URBAN STREETWEAR' },
                    { name: 'Leather Boots', url: 'https://assets.mixkit.co/videos/preview/mixkit-feet-of-a-person-walking-with-leather-boots-43266-large.mp4', heading: 'AUTUMN ESSENTIALS' },
                    { name: 'Neon Spotlight', url: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-pair-of-white-sneakers-with-neon-details-43265-large.mp4', heading: 'NEON SPOTLIGHT' }
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={async () => {
                        if (erpVideoIndex === 1) {
                          setErpVideoInput(preset.url);
                          setErpVideoHeadingInput(preset.heading);
                        } else if (erpVideoIndex === 2) {
                          setErpVideoInput2(preset.url);
                          setErpVideoHeadingInput2(preset.heading);
                        } else if (erpVideoIndex === 3) {
                          setErpVideoInput3(preset.url);
                          setErpVideoHeadingInput3(preset.heading);
                        } else {
                          setErpVideoInput4(preset.url);
                          setErpVideoHeadingInput4(preset.heading);
                        }
                        await updateHeroVideoUrl(preset.url, erpVideoIndex);
                        await updateHeroVideoHeadingSlot(preset.heading, erpVideoIndex);
                        setErpSuccess(`Applied ${preset.name} preset to Slot ${erpVideoIndex}!`);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all group cursor-pointer ${
                        isDark ? 'bg-zinc-950 border-zinc-800 hover:border-amber-500/50' : 'bg-white border-slate-200 hover:border-amber-400 shadow-xs'
                      }`}
                    >
                      <p className={`text-xs font-bold transition-colors ${
                        isDark ? 'text-zinc-200 group-hover:text-amber-400' : 'text-slate-800 group-hover:text-amber-700'
                      }`}>{preset.name}</p>
                      <p className={`text-[9px] font-mono uppercase tracking-wider ${
                        isDark ? 'text-zinc-500' : 'text-slate-500'
                      }`}>{preset.heading}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 2: HERO BANNER IMAGES SETUP (4 SLOTS + DURATION) */}
          {/* ======================================================== */}
          {(hybridViewTab === 'both' || hybridViewTab === 'images') && (
            <div className="space-y-6">
              {/* Custom Slide Duration Control Panel */}
              <div className={`p-5 rounded-3xl border space-y-4 shadow-sm transition-all ${
                isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${
                      isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-200 text-amber-800'
                    }`}>
                      <Clock size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                        2. Hero Banner Images Slideshow Duration
                      </h4>
                      <p className="text-xs opacity-80 mt-0.5">
                        Set how many seconds each of the 4 hero images stays visible in the slideshow loop.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">Current Speed:</span>
                    <span className={`px-3 py-1 rounded-xl text-xs font-mono font-black border ${
                      isDark ? 'bg-zinc-950 border-amber-500/40 text-amber-400' : 'bg-white border-amber-300 text-amber-800 shadow-xs'
                    }`}>
                      ⏱️ {heroImageDuration || 5} Seconds / Slide
                    </span>
                  </div>
                </div>

                {/* Quick Presets + Custom Seconds Input */}
                <div className={`pt-3 border-t flex flex-wrap items-center justify-between gap-4 ${
                  isDark ? 'border-amber-500/20' : 'border-amber-200'
                }`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider">Quick Presets:</span>
                    {[3, 5, 8, 10, 15].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={async () => {
                          setSlideDurationInput(sec);
                          setIsSavingDuration(true);
                          const res = await updateHeroImageDuration(sec);
                          setIsSavingDuration(false);
                          if (res.success) {
                            setErpSuccess(`🎉 Slideshow image display duration updated to ${sec} seconds!`);
                          } else {
                            setErpError(res.error || 'Failed to update duration.');
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer border ${
                          (heroImageDuration || 5) === sec
                            ? isDark
                              ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                              : 'bg-amber-600 text-white border-amber-700 shadow-md'
                            : isDark
                              ? 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
                              : 'bg-white hover:bg-amber-100 text-slate-700 border-amber-200 shadow-xs'
                        }`}
                      >
                        {sec}s {sec === 15 ? '⚡ (15s Default)' : ''}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={slideDurationInput}
                      onChange={(e) => setSlideDurationInput(Number(e.target.value))}
                      className={`w-20 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold text-center focus:outline-none focus:border-amber-500 ${
                        isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                      }`}
                    />
                    <button
                      type="button"
                      disabled={isSavingDuration}
                      onClick={async () => {
                        if (slideDurationInput < 1) {
                          setErpError('Duration must be at least 1 second.');
                          return;
                        }
                        setIsSavingDuration(true);
                        const res = await updateHeroImageDuration(slideDurationInput);
                        setIsSavingDuration(false);
                        if (res.success) {
                          setErpSuccess(`🎉 Image display duration updated to ${slideDurationInput} seconds!`);
                        } else {
                          setErpError(res.error || 'Failed to update duration.');
                        }
                      }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border shadow-sm ${
                        isDark
                          ? 'bg-amber-500 hover:bg-amber-400 text-black border-amber-400'
                          : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700'
                      }`}
                    >
                      {isSavingDuration ? 'Saving...' : 'Set Duration'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 HERO IMAGE SLOTS GRID */}
              <div className="space-y-4">
                <h4 className={`text-sm font-black uppercase tracking-wider ${
                  isDark ? 'text-zinc-200' : 'text-slate-900'
                }`}>
                  4 Hero Image Slideshow Slots
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      slotNum: 1,
                      name: imgSlot1Name,
                      setName: setImgSlot1Name,
                      url: imgSlot1Url,
                      setUrl: setImgSlot1Url,
                      defaultUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
                      defaultTitle: 'Prestige Footwear'
                    },
                    {
                      slotNum: 2,
                      name: imgSlot2Name,
                      setName: setImgSlot2Name,
                      url: imgSlot2Url,
                      setUrl: setImgSlot2Url,
                      defaultUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop',
                      defaultTitle: 'Urban Sneakers'
                    },
                    {
                      slotNum: 3,
                      name: imgSlot3Name,
                      setName: setImgSlot3Name,
                      url: imgSlot3Url,
                      setUrl: setImgSlot3Url,
                      defaultUrl: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1200&auto=format&fit=crop',
                      defaultTitle: 'Leather Boots'
                    },
                    {
                      slotNum: 4,
                      name: imgSlot4Name,
                      setName: setImgSlot4Name,
                      url: imgSlot4Url,
                      setUrl: setImgSlot4Url,
                      defaultUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=1200&auto=format&fit=crop',
                      defaultTitle: 'Suede Edition'
                    }
                  ].map((slot) => {
                    const isSaving = savingImgSlot === slot.slotNum;
                    return (
                      <div
                        key={slot.slotNum}
                        className={`border rounded-3xl p-5 space-y-4 transition-all flex flex-col justify-between ${
                          isDark ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700' : 'bg-slate-50/90 border-slate-200 hover:border-slate-300 shadow-sm'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Slot Header */}
                          <div className={`flex items-center justify-between pb-2 border-b ${
                            isDark ? 'border-zinc-800' : 'border-slate-200'
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-black uppercase ${
                                isDark ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-amber-100 border-amber-300 text-amber-800'
                              }`}>
                                IMAGE SLOT {slot.slotNum} OF 4
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono flex items-center gap-1 ${
                                isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-200 text-slate-600'
                              }`}>
                                <Clock size={10} className={isDark ? 'text-amber-400' : 'text-amber-700'} /> {heroImageDuration || 5}s Timer
                              </span>
                            </div>
                            <span className={`text-[10px] font-mono font-bold flex items-center gap-1 ${
                              isDark ? 'text-emerald-400' : 'text-emerald-600'
                            }`}>
                              <CheckCircle size={12} /> Ready
                            </span>
                          </div>

                          {/* Live Image Preview Container */}
                          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800 group shadow-inner">
                            <img
                              src={slot.url || slot.defaultUrl}
                              alt={`Slot ${slot.slotNum}`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = slot.defaultUrl;
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-3 flex flex-col justify-between pointer-events-none">
                              <span className="text-[8px] font-mono tracking-widest text-amber-400 font-bold uppercase">
                                SLIDE #{slot.slotNum} PREVIEW
                              </span>
                              <p className="text-xs font-extrabold text-white uppercase tracking-wider drop-shadow-md">
                                {slot.name || slot.defaultTitle}
                              </p>
                            </div>
                          </div>

                          {/* Slide Title Input */}
                          <div className="space-y-1">
                            <label className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${
                              isDark ? 'text-zinc-400' : 'text-slate-600'
                            }`}>
                              Slide Overlay Title:
                            </label>
                            <input
                              type="text"
                              value={slot.name}
                              onChange={(e) => slot.setName(e.target.value)}
                              placeholder={`e.g. ${slot.defaultTitle}`}
                              className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-500 font-medium ${
                                isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                              }`}
                            />
                          </div>

                          {/* PROMINENT DEVICE IMAGE UPLOAD BUTTON */}
                          <div className="pt-1">
                            <label className={`w-full py-2.5 px-3 rounded-xl border-2 border-dashed hover:border-amber-500 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs ${
                              isDark ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20' : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                            }`}>
                              <Upload size={16} className="text-amber-500 shrink-0" />
                              <span>Upload Image from Device (PC / Mobile)</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = async () => {
                                    const base64 = reader.result as string;
                                    slot.setUrl(base64);
                                    setSavingImgSlot(slot.slotNum);
                                    const res = await updateHeroImageSlot(slot.slotNum as 1 | 2 | 3 | 4, slot.name || slot.defaultTitle, base64, true);
                                    setSavingImgSlot(null);
                                    if (res.success) {
                                      setErpSuccess(`🎉 Custom image uploaded from device to Hero Slot ${slot.slotNum}!`);
                                    } else {
                                      setErpError(`Failed to save image to slot ${slot.slotNum}: ${res.error}`);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </label>
                          </div>

                          {/* Image URL Input */}
                          <div className="space-y-1">
                            <label className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${
                              isDark ? 'text-zinc-400' : 'text-slate-600'
                            }`}>
                              Or Image Web URL:
                            </label>
                            <input
                              type="text"
                              value={slot.url}
                              onChange={(e) => slot.setUrl(e.target.value)}
                              placeholder="https://images.unsplash.com/..."
                              className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-500 font-mono ${
                                isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                              }`}
                            />
                          </div>

                          {/* Quick Presets */}
                          <div className="pt-1">
                            <p className={`text-[9px] font-mono uppercase tracking-wider mb-1.5 font-bold ${
                              isDark ? 'text-zinc-500' : 'text-slate-500'
                            }`}>
                              Quick Presets:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { title: 'Red Sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop' },
                                { title: 'Urban Grey', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop' },
                                { title: 'Leather Boots', url: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1200&auto=format&fit=crop' },
                                { title: 'Suede Workshop', url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=1200&auto=format&fit=crop' }
                              ].map((preset, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() => {
                                    slot.setName(preset.title);
                                    slot.setUrl(preset.url);
                                  }}
                                  className={`px-2 py-1 rounded-lg border text-[10px] transition-all cursor-pointer ${
                                    isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-500/50' : 'bg-white border-slate-200 text-slate-600 hover:text-amber-700 hover:border-amber-400 shadow-xs'
                                  }`}
                                >
                                  {preset.title}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Save Button */}
                        <div className={`pt-3 border-t ${
                          isDark ? 'border-zinc-800' : 'border-slate-200'
                        }`}>
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={async () => {
                              setSavingImgSlot(slot.slotNum);
                              const res = await updateHeroImageSlot(
                                slot.slotNum as 1 | 2 | 3 | 4,
                                slot.name || slot.defaultTitle,
                                slot.url || slot.defaultUrl,
                                slot.url.startsWith('data:')
                              );
                              setSavingImgSlot(null);
                              if (res.success) {
                                setErpSuccess(`🎉 Hero Image Slot ${slot.slotNum} saved successfully!`);
                              } else {
                                setErpError(`Error saving Image Slot ${slot.slotNum}: ${res.error}`);
                              }
                            }}
                            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isSaving ? (
                              <>
                                <RefreshCw size={14} className="animate-spin" /> Saving Slot {slot.slotNum}...
                              </>
                            ) : (
                              <>
                                <CheckCircle size={14} /> Save & Deploy Image Slot {slot.slotNum}
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MASTER CLOUD DATABASE SAVE CARD */}
          <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl ${
            isDark
              ? 'bg-gradient-to-r from-amber-500/20 via-zinc-900 to-zinc-900 border-amber-500/40'
              : 'bg-gradient-to-r from-amber-100/90 via-white to-amber-50/60 border-amber-300'
          }`}>
            <div className="space-y-1.5 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500 text-black">
                  <Database size={18} />
                </span>
                <h4 className={`text-base font-black uppercase tracking-wider ${
                  isDark ? 'text-zinc-100' : 'text-slate-900'
                }`}>
                  Permanent Database Sync & Deployment
                </h4>
              </div>
              <p className={`text-xs max-w-xl ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                Saves all 4 video slots (URLs, uploaded files, titles), all 4 slideshow images, timer duration, and active mode directly to the Firestore cloud database for persistent synchronization across all devices.
              </p>
            </div>

            <button
              type="button"
              disabled={isSavingAllHeroSetup}
              onClick={handleSaveEntireHeroConfig}
              className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 transform active:scale-95"
            >
              {isSavingAllHeroSetup ? (
                <>
                  <RefreshCw size={18} className="animate-spin text-black" />
                  <span>Saving All Setup to Database...</span>
                </>
              ) : (
                <>
                  <Save size={18} className="text-black" />
                  <span>💾 Save Complete Setup to Database</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* PAGE 5: OFFERS & CATEGORY COVER THUMBNAILS CONFIGURATION PAGE */}
      {erpPage === 'offers' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 ${
            isDark ? 'border-zinc-800' : 'border-slate-200'
          }`}>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setErpPage('main')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 cursor-pointer border ${
                  isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
              >
                <ArrowLeft size={14} />
                <span>Back to Media Control Desk</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500 text-black">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 className={`serif-display text-2xl font-black uppercase tracking-wider ${
                    isDark ? 'text-zinc-100' : 'text-slate-900'
                  }`}>
                    Offers & Category Division Covers
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Manage storefront promotional deal banners and Men's, Women's, Kids' division thumbnail covers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Offers Section Banner */}
          <div className={`border rounded-3xl p-6 space-y-4 ${
            isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50/90 border-slate-200 shadow-sm'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDark ? 'border-zinc-800' : 'border-slate-200'
            }`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                isDark ? 'text-amber-400' : 'text-amber-700'
              }`}>
                <Sparkles size={16} /> Storefront Offers Banner
              </h4>
              <span className={`text-[10px] font-mono uppercase ${
                isDark ? 'text-zinc-400' : 'text-slate-500'
              }`}>OFFERS SECTION</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-black border border-zinc-800">
                {(() => {
                  const media = offersBannerInput || offersBannerUrl;
                  const isVid = media && (media.startsWith('data:video') || media.endsWith('.mp4') || media.endsWith('.webm') || media.includes('/videos/') || media.includes('mixkit.co'));
                  if (isVid) {
                    return (
                      <video
                        src={media}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    );
                  }
                  return (
                    <img
                      src={media}
                      alt="Offers Banner"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-pair-of-white-sneakers-with-neon-details-43265-large.mp4';
                      }}
                    />
                  );
                })()}
              </div>

              <div className="space-y-3">
                <label className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${
                  isDark ? 'text-zinc-400' : 'text-slate-600'
                }`}>
                  Offers Banner Video / Image URL (16:9 Recommended):
                </label>
                <input
                  type="text"
                  value={offersBannerInput}
                  onChange={(e) => setOffersBannerInput(e.target.value)}
                  placeholder="https://assets.mixkit.co/...mp4 or image URL"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-500 font-mono ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                  }`}
                />

                {/* Device Upload for Offers Banner */}
                <label className={`w-full py-2 px-3 rounded-xl border border-dashed hover:border-amber-500 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  isDark ? 'bg-zinc-950 border-zinc-700 text-zinc-300 hover:bg-zinc-900' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-xs'
                }`}>
                  <Upload size={14} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
                  <span>Upload Offers Video/Image from Device</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async () => {
                        const base64 = reader.result as string;
                        setOffersBannerInput(base64);
                        setIsUpdatingOffersBanner(true);
                        const res = await updateOffersBannerUrl(base64);
                        setIsUpdatingOffersBanner(false);
                        if (res.success) {
                          setErpSuccess('Offers banner media uploaded from device and deployed!');
                        } else {
                          setErpError(`Error updating offers banner: ${res.error}`);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>

                <button
                  type="button"
                  disabled={isUpdatingOffersBanner}
                  onClick={async () => {
                    setIsUpdatingOffersBanner(true);
                    const res = await updateOffersBannerUrl(offersBannerInput.trim());
                    setIsUpdatingOffersBanner(false);
                    if (res.success) {
                      setErpSuccess('Offers banner updated successfully!');
                    } else {
                      setErpError(`Error updating offers banner: ${res.error}`);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-amber-500/10"
                >
                  {isUpdatingOffersBanner ? 'Updating...' : 'Save & Deploy Offers Banner'}
                </button>
              </div>
            </div>
          </div>

          {/* Offer Flow Category Selection Background Image */}
          <div className={`border rounded-3xl p-6 space-y-4 ${
            isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50/90 border-slate-200 shadow-sm'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDark ? 'border-zinc-800' : 'border-slate-200'
            }`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                isDark ? 'text-amber-400' : 'text-amber-700'
              }`}>
                <Image size={16} /> Offer Flow Category Selection Background Image
              </h4>
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-100 text-amber-800'
              }`}>
                CATEGORY SELECTION SCREEN
              </span>
            </div>

            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Customize the background image displayed on the category selection screen when users click &ldquo;Explore Offers&rdquo; (behind the MEN, WOMEN, and KIDS selection buttons).
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              {/* Live Preview Box with 9:16 Ratio and overlaid Category buttons */}
              <div className="relative aspect-[9/16] max-w-[240px] sm:max-w-[280px] mx-auto w-full rounded-3xl overflow-hidden bg-black border border-zinc-800 group shadow-xl flex flex-col justify-between p-4">
                <img
                  src={offersCategoryBgInput || offersCategoryBgUrl}
                  alt="Category Selection Background"
                  className="absolute inset-0 w-full h-full object-cover brightness-[0.45] transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2000&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black/95 pointer-events-none" />

                {/* Live Preview Header */}
                <div className="relative z-10 text-center space-y-1 pt-1">
                  <span className="text-[7px] font-mono tracking-widest text-amber-400 font-black uppercase bg-black/60 px-2 py-0.5 rounded-full border border-amber-400/30">
                    9:16 STOREFRONT PREVIEW
                  </span>
                  <p className="text-xs font-black text-white uppercase tracking-wider">
                    SELECT YOUR CATEGORY
                  </p>
                  <p className="text-[9px] text-zinc-300">
                    Choose a division below
                  </p>
                </div>

                {/* Overlaid 9:16 Stacked Category Buttons */}
                <div className="relative z-10 flex flex-col gap-2 w-full my-auto">
                  {[
                    { name: 'MENS', perk: 'UP TO 40% OFF' },
                    { name: 'WOMENS', perk: 'UP TO 50% OFF' },
                    { name: 'KIDS', perk: 'UP TO 35% OFF' }
                  ].map((cat) => (
                    <div
                      key={cat.name}
                      className="py-2.5 px-3 rounded-xl bg-black/70 border border-amber-400/40 text-white flex items-center justify-between text-left shadow-md backdrop-blur-xs"
                    >
                      <div>
                        <span className="text-amber-400 text-[7px] font-mono font-bold block">{cat.perk}</span>
                        <span className="text-[11px] font-black tracking-wider uppercase">{cat.name}</span>
                      </div>
                      <span className="text-amber-400 text-[9px] font-bold">➔</span>
                    </div>
                  ))}
                </div>

                <div className="relative z-10 text-center pb-0.5">
                  <span className="text-[7px] font-mono text-zinc-400 uppercase tracking-widest">
                    ✨ Workshop Deals
                  </span>
                </div>
              </div>

              {/* Controls and upload */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${
                    isDark ? 'text-zinc-400' : 'text-slate-600'
                  }`}>
                    Category Screen 9:16 Background Image URL:
                  </label>
                  <input
                    type="text"
                    value={offersCategoryBgInput}
                    onChange={(e) => setOffersCategoryBgInput(e.target.value)}
                    placeholder="https://images.unsplash.com/... or data:image URL"
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-500 font-mono ${
                      isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                    }`}
                  />
                </div>

                {/* Device Upload for Category Background */}
                <div>
                  <label className={`w-full py-2.5 px-3 rounded-xl border border-dashed hover:border-amber-500 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isDark ? 'bg-zinc-950 border-zinc-700 text-zinc-300 hover:bg-zinc-900' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-xs'
                  }`}>
                    <Upload size={14} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
                    <span>Upload 9:16 Portrait Image from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUpdatingOffersCategoryBg(true);
                        setErpError(null);
                        setErpSuccess(null);
                        try {
                          // Compress image using HTML5 canvas to guarantee optimal 9:16 storage & speed
                          const compressed = await compressImage(file, 1600, 0.85);
                          setOffersCategoryBgInput(compressed);
                          if (updateOffersCategoryBgUrl) {
                            const res = await updateOffersCategoryBgUrl(compressed);
                            if (res.success) {
                              setErpSuccess('Offer Category 9:16 Background image uploaded from device and deployed!');
                            } else {
                              setErpError(`Error updating category background: ${res.error}`);
                            }
                          }
                        } catch (err: any) {
                          console.error('Image compression upload error:', err);
                          setErpError(`Image processing error: ${err?.message || err}`);
                        } finally {
                          setIsUpdatingOffersCategoryBg(false);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Quick Sample Presets (Tailored for 9:16 Portrait) */}
                <div className="space-y-1">
                  <span className={`text-[9px] font-mono uppercase tracking-wider block font-bold ${
                    isDark ? 'text-zinc-500' : 'text-slate-500'
                  }`}>
                    Curated 9:16 Portrait Presets (Click to Apply):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'Classic Workshop (9:16)', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2000&auto=format&fit=crop' },
                      { name: 'Red Runner (9:16)', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2000&auto=format&fit=crop' },
                      { name: 'Crafted Leather', url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=2000&auto=format&fit=crop' },
                      { name: 'High-Top Street', url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2000&auto=format&fit=crop' },
                      { name: 'Studio Sneaker', url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=2000&auto=format&fit=crop' }
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={async () => {
                          setOffersCategoryBgInput(preset.url);
                          if (updateOffersCategoryBgUrl) {
                            setIsUpdatingOffersCategoryBg(true);
                            const res = await updateOffersCategoryBgUrl(preset.url);
                            setIsUpdatingOffersCategoryBg(false);
                            if (res.success) {
                              setErpSuccess(`Preset "${preset.name}" applied and deployed!`);
                            } else {
                              setErpError(`Error applying preset: ${res.error}`);
                            }
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-medium transition-all cursor-pointer ${
                          offersCategoryBgInput === preset.url
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold'
                            : isDark
                              ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-amber-500/50'
                              : 'bg-white border-slate-200 text-slate-600 hover:text-amber-800 hover:border-amber-400'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons: Save & Deploy + Reset to Default */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isUpdatingOffersCategoryBg}
                    onClick={async () => {
                      if (!offersCategoryBgInput.trim()) {
                        setErpError('Please enter a valid image URL or upload an image file.');
                        return;
                      }
                      if (updateOffersCategoryBgUrl) {
                        setIsUpdatingOffersCategoryBg(true);
                        setErpError(null);
                        setErpSuccess(null);
                        const res = await updateOffersCategoryBgUrl(offersCategoryBgInput.trim());
                        setIsUpdatingOffersCategoryBg(false);
                        if (res.success) {
                          setErpSuccess('Offer Category Background Image updated and deployed successfully!');
                        } else {
                          setErpError(`Error updating category background: ${res.error}`);
                        }
                      }
                    }}
                    className="flex-1 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5"
                  >
                    {isUpdatingOffersCategoryBg ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Saving Background Image...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} /> Save & Deploy Background
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isUpdatingOffersCategoryBg}
                    onClick={async () => {
                      const defaultUrl = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2000&auto=format&fit=crop';
                      setOffersCategoryBgInput(defaultUrl);
                      if (updateOffersCategoryBgUrl) {
                        setIsUpdatingOffersCategoryBg(true);
                        setErpError(null);
                        setErpSuccess(null);
                        const res = await updateOffersCategoryBgUrl(defaultUrl);
                        setIsUpdatingOffersCategoryBg(false);
                        if (res.success) {
                          setErpSuccess('Reset to default category background successfully!');
                        } else {
                          setErpError(`Error resetting category background: ${res.error}`);
                        }
                      }
                    }}
                    className={`px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold uppercase transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1 shrink-0 ${
                      isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                    }`}
                    title="Reset to default workshop background"
                  >
                    <RotateCcw size={13} />
                    <span>Reset Default</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Category Division Cover Thumbnails & Videos */}
          <div className={`border rounded-3xl p-6 space-y-4 ${
            isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50/90 border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-zinc-800">
              <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                isDark ? 'text-amber-400' : 'text-amber-700'
              }`}>
                <Layers size={16} /> Category Division Cover Videos & Thumbnails
              </h4>
              <span className={`text-[10px] font-mono uppercase ${
                isDark ? 'text-zinc-400' : 'text-slate-500'
              }`}>VIDEOS & IMAGES SUPPORTED</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  cat: 'Men' as const, 
                  input: categoryThumbMenInput, 
                  setInput: setCategoryThumbMenInput, 
                  defaultUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop',
                  videoPresets: [
                    { label: 'Sneakers Walk MP4', url: 'https://assets.mixkit.co/videos/preview/mixkit-legs-of-a-man-walking-with-sneakers-43264-large.mp4' },
                    { label: 'Neon Sneakers MP4', url: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-pair-of-white-sneakers-with-neon-details-43265-large.mp4' }
                  ]
                },
                { 
                  cat: 'Women' as const, 
                  input: categoryThumbWomenInput, 
                  setInput: setCategoryThumbWomenInput, 
                  defaultUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop',
                  videoPresets: [
                    { label: 'High Heels Walk MP4', url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-walking-in-black-high-heels-43187-large.mp4' },
                    { label: 'Pink Sneakers MP4', url: 'https://assets.mixkit.co/videos/preview/mixkit-legs-of-a-woman-wearing-pink-sneakers-43266-large.mp4' }
                  ]
                },
                { 
                  cat: 'Kids' as const, 
                  input: categoryThumbKidsInput, 
                  setInput: setCategoryThumbKidsInput, 
                  defaultUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=800&auto=format&fit=crop',
                  videoPresets: [
                    { label: 'Kids Running MP4', url: 'https://assets.mixkit.co/videos/preview/mixkit-feet-of-a-child-running-in-sneakers-43267-large.mp4' },
                    { label: 'Playground Action MP4', url: 'https://assets.mixkit.co/videos/preview/mixkit-kids-playing-and-running-outdoors-43268-large.mp4' }
                  ]
                }
              ].map((item) => {
                const currentMedia = item.input || item.defaultUrl;
                const isMediaVid = currentMedia && (
                  currentMedia.startsWith('data:video') || 
                  currentMedia.endsWith('.mp4') || 
                  currentMedia.endsWith('.webm') || 
                  currentMedia.includes('/videos/') || 
                  currentMedia.includes('mixkit.co') ||
                  currentMedia.includes('.mp4?') ||
                  currentMedia.includes('.webm?')
                );

                return (
                  <div key={item.cat} className={`border rounded-2xl p-4 space-y-3 ${
                    isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black uppercase tracking-wider block ${
                        isDark ? 'text-amber-400' : 'text-amber-700'
                      }`}>
                        {item.cat}'s Division Cover
                      </span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        isMediaVid 
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                          : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isMediaVid ? '▶ Video Active' : 'Image Active'}
                      </span>
                    </div>

                    <div className="aspect-square rounded-xl overflow-hidden bg-black border border-zinc-800 relative">
                      {isMediaVid ? (
                        <video
                          src={currentMedia}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={currentMedia}
                          alt={item.cat}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = item.defaultUrl;
                          }}
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className={`text-[9px] font-mono uppercase tracking-widest font-bold block ${
                        isDark ? 'text-zinc-400' : 'text-slate-600'
                      }`}>
                        Video URL (.mp4/.webm) or Image URL:
                      </label>
                      <input
                        type="text"
                        value={item.input}
                        onChange={(e) => item.setInput(e.target.value)}
                        placeholder="https://...mp4 or image URL"
                        className={`w-full px-3 py-1.5 rounded-lg border text-[11px] font-mono focus:outline-none focus:border-amber-500 ${
                          isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    {/* Quick Video Presets */}
                    <div className="space-y-1">
                      <span className={`text-[8px] font-mono uppercase tracking-wider block font-bold ${
                        isDark ? 'text-zinc-500' : 'text-slate-400'
                      }`}>
                        Quick Video Options:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {item.videoPresets.map((vp) => (
                          <button
                            key={vp.label}
                            type="button"
                            onClick={() => item.setInput(vp.url)}
                            className={`px-2 py-1 rounded text-[9px] font-mono font-bold truncate transition-all text-left cursor-pointer border ${
                              item.input === vp.url 
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                                : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                            }`}
                            title={vp.url}
                          >
                            ▶ {vp.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Device Upload for Category Video / Thumbnail */}
                    <label className={`w-full py-1.5 px-2 rounded-lg border border-dashed hover:border-amber-500 text-[10px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                    }`}>
                      <Upload size={12} className="text-amber-500" />
                      <span>Upload Video / Image from Device</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = async () => {
                            const base64 = reader.result as string;
                            item.setInput(base64);
                            const res = await updateCategoryThumbnail(item.cat, base64);
                            if (res.success) {
                              setErpSuccess(`${item.cat} media cover uploaded from device and deployed!`);
                            } else {
                              setErpError(`Failed to update ${item.cat} cover.`);
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={async () => {
                        const res = await updateCategoryThumbnail(item.cat, item.input.trim());
                        if (res.success) {
                          setErpSuccess(`${item.cat} cover updated successfully!`);
                        } else {
                          setErpError(`Failed to update ${item.cat} cover.`);
                        }
                      }}
                      className={`w-full py-2 rounded-lg text-[11px] font-bold uppercase transition-all cursor-pointer ${
                        isDark ? 'bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-200' : 'bg-slate-200 hover:bg-amber-500 hover:text-black text-slate-800'
                      }`}
                    >
                      Save & Deploy {item.cat} Cover
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
