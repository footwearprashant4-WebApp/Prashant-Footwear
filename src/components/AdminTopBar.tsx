import React from 'react';
import { 
  Globe, Moon, Sun, Menu, X, Home, CheckCircle2, 
  Tag, Award, Users, Settings, Database, 
  Package, Truck, BarChart2, ShoppingBag 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export interface AdminTopBarProps {
  isDark: boolean;
  onOpenMenu?: () => void;
  isNavOpen?: boolean;
  onToggleNav?: () => void;
  onCloseNav?: () => void;
  onSelectTab?: (tabId: string) => void;
  onToggleTheme: () => void;
  onExitAdmin: () => void;
  activeTab?: string;
  currentTitle?: string;
  onNavigateHome?: () => void;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({
  isDark,
  onOpenMenu,
  isNavOpen = false,
  onToggleNav,
  onCloseNav,
  onSelectTab,
  onToggleTheme,
  onExitAdmin,
  activeTab = 'home',
  onNavigateHome
}) => {
  const { language, setLanguage } = useLanguage();

  const handleToggleMenu = () => {
    if (onToggleNav) {
      onToggleNav();
    } else if (onOpenMenu) {
      onOpenMenu();
    }
  };

  const handleSelectOption = (tabId: string) => {
    if (onSelectTab) {
      onSelectTab(tabId);
    }
    if (onCloseNav) {
      onCloseNav();
    }
  };

  const isDashboardActive = activeTab === 'home' || activeTab === 'today-summary';

  // 6 Primary Navigation Options matching the exact reference image
  const PRIMARY_NAV_OPTIONS = [
    {
      id: 'home',
      title: 'DASHBOARD',
      subtitle: 'Overview & Stats',
      icon: Home,
      isActive: isDashboardActive,
    },
    {
      id: 'offers',
      title: 'OFFERS & DEALS',
      subtitle: 'Promos & Coupons',
      icon: Tag,
      isActive: activeTab === 'offers',
    },
    {
      id: 'brand_config',
      title: 'BRAND CONFIG',
      subtitle: 'Banners & Video Ads',
      icon: Award,
      isActive: activeTab === 'brand_config',
    },
    {
      id: 'accounts',
      title: 'MANAGE ACCOUNTS',
      subtitle: 'User Roles',
      icon: Users,
      isActive: activeTab === 'accounts',
    },
    {
      id: 'erp',
      title: 'ERP CONFIG',
      subtitle: 'System Settings',
      icon: Settings,
      isActive: activeTab === 'erp',
    },
    {
      id: 'data_management',
      title: 'DATA MANAGEMENT',
      subtitle: 'Clear Sample Data',
      icon: Database,
      isActive: activeTab === 'data_management',
    },
  ];

  // Secondary operational desks for quick 1-tap switching
  const QUICK_DESKS = [
    { id: 'billing', label: 'Make Bill (POS)', icon: ShoppingBag },
    { id: 'stock', label: 'Products Stock', icon: Package },
    { id: 'wholesale_demand', label: 'Purchase Orders', icon: Truck },
    { id: 'reports', label: 'Sales Engine', icon: BarChart2 },
    { id: 'reports_analytical', label: 'Reports & Analytics', icon: Tag },
  ];

  return (
    <>
      <header className={`w-full relative z-40 transition-colors border-b ${
        isDark ? 'bg-zinc-950/95 border-zinc-800/80 backdrop-blur-md' : 'bg-[#FAF7F0]/95 border-[#EAE2CE]/80 backdrop-blur-md'
      }`}>
        <div className="max-w-[440px] sm:max-w-xl md:max-w-3xl lg:max-w-7xl mx-auto px-3 sm:px-4 py-2">
          {/* Top Bar Bar Content: Unified single-row on md+, and sleek compact two-tier on mobile */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            
            {/* Tier 1 (Mobile & Desktop): Brand Identity + LIVE MODE badge on the right corner */}
            <div className="flex items-center justify-between gap-3">
              {/* Left: Brand Emblem + Title + Console */}
              <div className="flex items-center gap-2.5">
                {/* Circular White Badge with Golden Shoe Outline */}
                <button
                  type="button"
                  id="btn-admin-brand-home"
                  onClick={() => {
                    if (onNavigateHome) onNavigateHome();
                    if (onCloseNav) onCloseNav();
                  }}
                  title="Prashant Footwear ERP"
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center shrink-0 shadow-2xs transition-transform active:scale-95 cursor-pointer ${
                    isDark 
                      ? 'bg-zinc-900 border-zinc-800 text-[#C69A53]' 
                      : 'bg-white border-[#EAE2CE] text-[#BFA05D]'
                  }`}
                >
                  <svg 
                    className="w-4.5 h-4.5 text-[#BFA05D]" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.6" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M3 15c1.8-.6 3.5-1.2 5.5-1.2 2.3 0 3.8-1.5 5.2-3.3 1-1.3 2.5-2 4.3-2h3c1.1 0 2 .9 2 2v2c0 1.5-1 2.5-2.5 2.5H4.5c-.8 0-1.5-.5-1.5-1z" />
                    <path d="M11.5 10.8c1-1.3 2.3-1.8 4-1.8" />
                    <path d="M3 16h18" strokeWidth="1.2" />
                  </svg>
                </button>

                {/* Brand Title + Console */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span 
                    onClick={() => {
                      if (onNavigateHome) onNavigateHome();
                      if (onCloseNav) onCloseNav();
                    }}
                    className="text-[12.5px] sm:text-[13.5px] font-serif font-black tracking-[0.06em] text-[#BFA05D] uppercase leading-none cursor-pointer select-none whitespace-nowrap"
                  >
                    PRASHANT FOOTWEAR
                  </span>
                  <span className="px-1.5 py-0.5 rounded-[4px] border border-[#DFD1AB] bg-[#FBF7EC] dark:bg-zinc-900 dark:border-zinc-700 text-[#BFA05D] text-[8px] sm:text-[8.5px] font-mono font-bold tracking-wider uppercase leading-none shrink-0">
                    CONSOLE
                  </span>
                </div>
              </div>

              {/* Right Corner: LIVE MODE Badge on Mobile (Visible on right corner, saves space) */}
              <div className="flex items-center md:hidden">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8.5px] font-mono font-bold tracking-wider bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>LIVE MODE</span>
                </div>
              </div>
            </div>

            {/* Tier 2 (Mobile) / Right Controls (Desktop): Action Buttons + Desktop LIVE MODE */}
            <div className="flex items-center justify-between md:justify-end gap-1.5 sm:gap-2">
              {/* Desktop LIVE MODE badge (placed right in corner with action buttons) */}
              <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold tracking-wider bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs mr-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>LIVE MODE</span>
              </div>

              {/* 1. Toggle Button: Golden Close '✕' when open, or White Hamburger '☰' when closed */}
              {isNavOpen ? (
                <button
                  type="button"
                  id="btn-admin-nav-close"
                  onClick={handleToggleMenu}
                  aria-label="Close navigation menu"
                  title="Close navigation"
                  className="h-8 sm:h-9 px-3 rounded-full bg-[#C69A53] hover:bg-[#b58b45] text-[#141311] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all shrink-0 text-xs font-bold"
                >
                  <X size={15} className="stroke-[2.8]" />
                  <span className="hidden sm:inline">CLOSE</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="btn-admin-nav-open"
                  onClick={handleToggleMenu}
                  aria-label="Open navigation menu"
                  title="Open navigation options"
                  className={`h-8 sm:h-9 px-3 rounded-full border flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0 shadow-2xs text-xs font-bold ${
                    isDark 
                      ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800' 
                      : 'bg-white border-[#DFD6C0] text-[#141311] hover:bg-zinc-50'
                  }`}
                >
                  <Menu size={15} className="stroke-[2.5]" />
                  <span className="hidden sm:inline">MENU</span>
                </button>
              )}

              {/* 2. Golden Language Toggle Pill: EN | मराठी */}
              <div className="h-8 sm:h-9 px-3 rounded-full bg-[#C69A53] hover:bg-[#b58b45] text-[#141311] font-bold text-xs shadow-2xs flex items-center gap-1 shrink-0 transition-all font-sans select-none">
                <button
                  type="button"
                  id="btn-admin-lang-en"
                  onClick={() => setLanguage('en')}
                  className={`cursor-pointer transition-all ${
                    language === 'en' 
                      ? 'font-black underline underline-offset-4 decoration-2 text-[#141311]' 
                      : 'text-[#141311]/75 hover:text-[#141311]'
                  }`}
                >
                  EN
                </button>
                <span className="text-[#141311]/40 font-bold px-0.5">|</span>
                <button
                  type="button"
                  id="btn-admin-lang-mr"
                  onClick={() => setLanguage('mr')}
                  className={`cursor-pointer transition-all ${
                    language === 'mr' 
                      ? 'font-black underline underline-offset-4 decoration-2 text-[#141311]' 
                      : 'text-[#141311]/75 hover:text-[#141311]'
                  }`}
                >
                  मराठी
                </button>
              </div>

              {/* 3. Golden Storefront Button */}
              <button
                type="button"
                id="btn-admin-store"
                onClick={onExitAdmin}
                className="h-8 sm:h-9 px-3 sm:px-3.5 rounded-full bg-[#C69A53] hover:bg-[#b58b45] text-[#141311] font-black text-xs uppercase tracking-wider shadow-2xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0"
                title="Exit to customer storefront"
              >
                <Globe size={13} className="stroke-[2.5] text-[#141311]" />
                <span>STORE</span>
              </button>

              {/* 4. Theme Toggle Button */}
              <button
                type="button"
                id="btn-admin-theme"
                onClick={onToggleTheme}
                className={`h-8 sm:h-9 px-3 rounded-full border text-xs font-bold uppercase tracking-wider shadow-2xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0 ${
                  isDark 
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800' 
                    : 'bg-white border-[#DFD6C0] text-[#141311] hover:bg-zinc-50'
                }`}
                title="Toggle Light / Dark Mode"
              >
                {isDark ? (
                  <Sun size={13} className="stroke-[2.5] text-amber-400" />
                ) : (
                  <Moon size={13} className="stroke-[2.5] text-[#141311]" />
                )}
                <span>{isDark ? 'LIGHT' : 'DARK'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Options Expansion (Directly below buttons row matching the exact reference image) */}
          <AnimatePresence>
            {isNavOpen && (
              <motion.div
                id="admin-navigation-options-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                {/* Horizontal Divider Line matching reference image */}
                <div className="w-full h-px bg-[#141311]/15 dark:bg-zinc-800 my-3" />

                {/* Section Title: SELECT NAVIGATION OPTION: */}
                <div className="text-[10.5px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-[#BFA05D] dark:text-[#DFB155] mb-3 px-0.5 font-sans">
                  SELECT NAVIGATION OPTION:
                </div>

                {/* 2-Column Bento Grid matching the exact reference image */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pb-1">
                  {PRIMARY_NAV_OPTIONS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = item.isActive;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        id={`nav-option-${item.id}`}
                        onClick={() => handleSelectOption(item.id)}
                        className={`rounded-2xl p-3.5 sm:p-4 text-left transition-all cursor-pointer active:scale-98 relative ${
                          isSelected
                            ? 'bg-[#C69A53] text-[#141311] border border-[#B68B45] shadow-xs'
                            : isDark
                            ? 'bg-zinc-900 border border-zinc-800 text-zinc-100 hover:border-[#C69A53]'
                            : 'bg-white border border-[#E5DEC9] text-[#141311] hover:border-[#C69A53] shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon 
                            size={18} 
                            className={isSelected ? 'text-[#141311] stroke-[2.4]' : 'text-zinc-600 dark:text-zinc-300 stroke-[2.2]'} 
                          />
                          {isSelected && (
                            <CheckCircle2 size={16} className="text-[#141311] stroke-[2.4]" />
                          )}
                        </div>

                        <span className={`font-black text-xs sm:text-sm uppercase tracking-wider block mt-2 leading-tight ${
                          isSelected ? 'text-[#141311]' : 'text-[#141311] dark:text-white'
                        }`}>
                          {item.title}
                        </span>

                        <span className={`text-[11px] font-medium block mt-0.5 leading-tight ${
                          isSelected ? 'text-[#141311]/80' : 'text-zinc-500 dark:text-zinc-400'
                        }`}>
                          {item.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Desks Row to access core daily operational desks with 1 tap */}
                <div className="mt-3 pt-2.5 border-t border-[#EAE2CE]/80 dark:border-zinc-800/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar scrollbar-none pb-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 shrink-0">
                    Quick Desks:
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {QUICK_DESKS.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        id={`nav-quick-${d.id}`}
                        onClick={() => handleSelectOption(d.id)}
                        className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-wide shrink-0 transition-all cursor-pointer ${
                          activeTab === d.id
                            ? 'bg-[#C69A53] text-[#141311] font-black'
                            : isDark
                            ? 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-[#C69A53]'
                            : 'bg-white border border-[#DFD6C0] text-zinc-700 hover:border-[#BFA05D]'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Backdrop overlay when navigation is open */}
      <AnimatePresence>
        {isNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCloseNav}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30"
          />
        )}
      </AnimatePresence>
    </>
  );
};
