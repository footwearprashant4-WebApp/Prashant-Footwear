import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { User, LogIn, LogOut, Shield, ChevronDown, Menu, X, ShoppingCart, Sun, Moon, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onOpenAuth: (mode?: 'login' | 'register', prefill?: { mobile: string; pass: string }) => void;
  onScrollToProducts: () => void;
  onScrollToTop: () => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
  onOpenOffers: () => void;
  isAdminMode: boolean;
  onToggleAdminMode: () => void;
  cartCount: number;
  onOpenCart: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  showThemeToggle?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onScrollToProducts,
  onScrollToTop,
  onOpenAbout,
  onOpenContact,
  onOpenOffers,
  isAdminMode,
  onToggleAdminMode,
  cartCount,
  onOpenCart,
  theme,
  onToggleTheme,
  showThemeToggle = false
}) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [hasScrolledOnce, setHasScrolledOnce] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Monitor scroll to toggle background transparency dynamically
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolledOnce(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    setHasScrolledOnce(window.scrollY > 20);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isNavbarDark = theme === 'dark' || !hasScrolledOnce || !showThemeToggle;

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        !hasScrolledOnce
          ? 'bg-black border-b border-white/10 py-4 shadow-2xl'
          : !showThemeToggle
            ? 'bg-transparent border-b border-transparent py-4 shadow-none'
            : theme === 'dark'
              ? 'bg-black/45 backdrop-blur-md border-b border-white/5 py-4'
              : 'bg-white/85 backdrop-blur-md border-b border-zinc-200/80 py-4 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between gap-3 sm:gap-6 md:gap-8">
        {/* Left: Brand Logo */}
        <div 
          id="navbar-logo"
          onClick={onScrollToTop}
          className="cursor-pointer flex flex-col items-start leading-none group shrink-0"
        >
          <span className={`serif-display text-2xl md:text-3xl font-extrabold tracking-tighter uppercase transition-colors duration-300 group-hover:text-gold ${
            isNavbarDark 
              ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]' 
              : 'text-zinc-900'
          }`}>
            Prashant
          </span>
          <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-[#C5A059] font-bold mt-0.5 ml-0.5">
            Footwear
          </span>
        </div>

        {/* Center: Desktop Navigation Capsule */}
        <nav 
          id="navbar-menu-desktop" 
          className={`hidden md:flex items-center gap-2 p-1.5 rounded-full font-sans border transition-all duration-500 shrink-0 ${
            isNavbarDark
              ? 'bg-black/50 border-white/15 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]'
              : 'bg-zinc-100 border-zinc-200/80 shadow-inner'
          }`}
        >
          <button
            onClick={onScrollToTop}
            className={`px-5 py-2 text-xs font-extrabold tracking-wider uppercase rounded-full transition-all duration-300 cursor-pointer ${
              isNavbarDark
                ? 'text-zinc-300 hover:text-white hover:bg-white/5'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/5'
            }`}
          >
            {t('nav.home')}
          </button>
          <button
            onClick={onOpenAbout}
            className={`px-5 py-2 text-xs font-extrabold tracking-wider uppercase rounded-full transition-all duration-300 cursor-pointer ${
              isNavbarDark
                ? 'text-zinc-300 hover:text-white hover:bg-white/5'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/5'
            }`}
          >
            {t('nav.about')}
          </button>
          <button
            onClick={onScrollToProducts}
            className={`px-5 py-2 text-xs font-extrabold tracking-wider uppercase rounded-full transition-all duration-300 cursor-pointer ${
              isNavbarDark
                ? 'text-zinc-300 hover:text-white hover:bg-white/5'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/5'
            }`}
          >
            {t('nav.collection')}
          </button>
          <button
            onClick={onOpenOffers}
            className={`px-5 py-2 text-xs font-extrabold tracking-wider uppercase rounded-full transition-all duration-300 cursor-pointer ${
              isNavbarDark
                ? 'text-zinc-300 hover:text-white hover:bg-white/5'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/5'
            }`}
          >
            {t('nav.offers')}
          </button>
          <button
            onClick={onOpenContact}
            className={`px-5 py-2 text-xs font-extrabold tracking-wider uppercase rounded-full transition-all duration-300 cursor-pointer ${
              isNavbarDark
                ? 'text-zinc-300 hover:text-white hover:bg-white/5'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/5'
            }`}
          >
            {t('nav.contact')}
          </button>
          {isAdmin && (
            <button
              onClick={onToggleAdminMode}
              className={`px-5 py-2 text-xs font-black tracking-wider uppercase rounded-full transition-all duration-300 cursor-pointer flex items-center gap-1.5 shadow-[0_2px_10px_-3px_rgba(245,158,11,0.3)] border ${
                isNavbarDark
                  ? 'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:text-amber-300 hover:bg-amber-500/20'
                  : 'text-amber-700 border-amber-500/20 bg-amber-500/5 hover:text-amber-900 hover:bg-amber-500/15'
              }`}
            >
              <Shield size={12} className="animate-pulse text-amber-500" />
              {isAdminMode ? t('nav.customerMode') : t('nav.adminMode')}
            </button>
          )}
        </nav>

        {/* Right: Actions */}
        <div id="navbar-actions" className="flex items-center gap-2 sm:gap-3.5 md:gap-4 lg:gap-5">
          {/* Language Toggle */}
          <LanguageToggle isNavbarDark={isNavbarDark} />

          {/* Theme Toggle Button */}
          {showThemeToggle && (
            <button
              onClick={onToggleTheme}
              className={`flex h-[42px] w-[42px] items-center justify-center rounded-full border transition-all duration-300 cursor-pointer relative ${
                isNavbarDark
                  ? 'border-white/15 bg-black/50 text-yellow-400 hover:text-yellow-300 hover:border-white/30 hover:bg-white/5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] hover:scale-105'
                  : 'border-zinc-200/80 bg-zinc-100 text-zinc-600 hover:text-zinc-950 hover:border-zinc-300 hover:bg-zinc-200/50 shadow-inner hover:scale-105'
              }`}
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          )}

          {/* Cart Icon */}
          {!isAdminMode && cartCount > 0 && (
            <button
              onClick={onOpenCart}
              className={`flex h-[42px] w-[42px] items-center justify-center rounded-full border transition-all duration-300 cursor-pointer relative ${
                isNavbarDark
                  ? 'border-white/15 bg-black/50 text-zinc-100 hover:text-gold hover:border-white/30 hover:bg-white/5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] hover:scale-105'
                  : 'border-zinc-200/80 bg-zinc-100 text-zinc-800 hover:text-gold hover:border-zinc-300 hover:bg-zinc-200/50 shadow-inner hover:scale-105'
              }`}
              title="View Cart"
            >
              <ShoppingCart size={19} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#C5A059] text-[10px] font-black text-black ring-2 ring-black animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* User Auth Profile Logo Dropdown */}
          <div className="relative" id="profile-logo-section">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex h-[42px] w-[42px] items-center justify-center rounded-full border transition-all duration-300 cursor-pointer relative ${
                isNavbarDark
                  ? 'border-white/15 bg-black/50 text-white hover:border-white/30 hover:bg-white/5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] hover:scale-105'
                  : 'border-zinc-200/80 bg-zinc-100 text-zinc-800 hover:border-zinc-300 hover:bg-zinc-200/50 shadow-inner hover:scale-105'
              }`}
              title="Profile Menu"
            >
              {currentUser ? (
                <span className={`text-[12px] font-black tracking-normal leading-none flex items-center justify-center ${
                  currentUser.role === 'admin' ? 'text-amber-500' : 'text-indigo-500'
                }`}>
                  {currentUser.role === 'admin' ? 'PF' : 'U'}
                </span>
              ) : (
                <User size={19} className={isNavbarDark ? 'text-white' : 'text-zinc-800'} />
              )}
              {currentUser && (
                <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-950 animate-pulse" />
              )}
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-[24px] sm:rounded-[32px] border shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] z-50 overflow-hidden text-left backdrop-blur-xl ${
                      theme === 'dark'
                        ? 'bg-zinc-950/95 border-zinc-800/80 text-white shadow-zinc-950/50'
                        : 'bg-white/95 border-slate-200 text-zinc-800 shadow-slate-200/50'
                    }`}
                  >
                    {currentUser ? (
                      // Logged In Options
                      <div className="flex flex-col">
                        {/* Upper Premium Profile Header */}
                        <div className={`px-4 py-3.5 sm:px-5 sm:py-4.5 border-b relative overflow-hidden ${
                          theme === 'dark' 
                            ? 'border-zinc-800 bg-gradient-to-b from-zinc-900/40 to-transparent' 
                            : 'border-slate-100 bg-gradient-to-b from-slate-50 to-transparent'
                        }`}>
                          {/* Radial Ambient Glow */}
                          <div className={`absolute -right-8 -top-8 w-20 h-20 sm:w-24 sm:h-24 rounded-full blur-2xl opacity-20 pointer-events-none ${
                            currentUser.role === 'admin' ? 'bg-amber-500' : 'bg-indigo-500'
                          }`} />

                          <div className="flex items-center gap-2.5 sm:gap-3.5 relative z-10 mt-0.5 sm:mt-1">
                            {/* Animated Avatar Circle */}
                            <div className="relative shrink-0">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-xs sm:text-sm tracking-wider shadow-inner ${
                                currentUser.role === 'admin'
                                  ? 'bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-zinc-950 ring-2 ring-amber-500/20'
                                  : 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white ring-2 ring-indigo-500/20'
                              }`}>
                                {currentUser.role === 'admin' ? 'PF' : 'U'}
                              </div>
                              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 sm:h-3.5 sm:w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-zinc-950">
                                <span className="absolute h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-400 animate-ping" />
                              </span>
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                              <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
                                currentUser.role === 'admin' ? 'text-amber-500' : 'text-indigo-500'
                              }`}>
                                <Sparkles size={8} className="sm:w-2.5 sm:h-2.5" />
                                {currentUser.role === 'admin' ? 'Administrator' : 'Verified Client'}
                              </p>
                              <p className={`text-xs sm:text-[13px] font-bold font-mono tracking-wider truncate mt-0.5 ${
                                theme === 'dark' ? 'text-zinc-100' : 'text-zinc-800'
                              }`}>
                                {currentUser.mobile}
                              </p>
                              <p className="text-[8px] sm:text-[9px] text-zinc-400 font-mono mt-0.5">
                                Joined {new Date(currentUser.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Actions Grid */}
                        <div className="p-1.5 sm:p-2 space-y-1">
                          {/* Switch to Admin / Switch to Shop */}
                          {isAdmin ? (
                            <button
                              type="button"
                              onClick={() => {
                                onToggleAdminMode();
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full group flex items-center justify-between p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-200 text-left font-mono border ${
                                theme === 'dark'
                                  ? 'hover:bg-zinc-900/60 border-transparent hover:border-zinc-800/80 text-zinc-300 hover:text-white'
                                  : 'hover:bg-slate-50 border-transparent hover:border-slate-100 text-zinc-600 hover:text-zinc-900 shadow-sm hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-center gap-2 sm:gap-2.5">
                                <div className={`p-1 sm:p-1.5 rounded-lg sm:rounded-xl transition-colors ${
                                  theme === 'dark' ? 'bg-zinc-900 group-hover:bg-zinc-850' : 'bg-slate-100'
                                }`}>
                                  <Shield size={12} className={isAdminMode ? "text-amber-500" : "text-zinc-400"} />
                                </div>
                                <div className="flex flex-col font-sans">
                                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                                    {isAdminMode ? t('nav.customerMode') : t('nav.adminMode')}
                                  </span>
                                  <span className="text-[8px] sm:text-[9px] text-zinc-400 mt-0.5">{t('nav.adminPanel')}</span>
                                </div>
                              </div>
                              <div className={`w-7 h-4 sm:w-8 sm:h-4.5 rounded-full relative shrink-0 transition-colors ${
                                isAdminMode ? 'bg-amber-500' : 'bg-zinc-700'
                              }`}>
                                <div className={`absolute top-0.5 w-3 sm:w-3.5 h-3 sm:h-3.5 bg-white rounded-full transition-all duration-250 shadow-sm ${
                                  isAdminMode ? 'right-0.5' : 'left-0.5'
                                }`} />
                              </div>
                            </button>
                          ) : (
                            /* Non-admin logged-in users can switch to Admin by logging into the admin account */
                            <button
                              type="button"
                              onClick={() => {
                                logout();
                                if (isAdminMode) onToggleAdminMode();
                                setIsDropdownOpen(false);
                                onOpenAuth('login', { mobile: '9511244447', pass: 'Prashant' });
                              }}
                              className={`w-full group flex items-center justify-between p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-200 text-left font-mono border ${
                                theme === 'dark'
                                  ? 'hover:bg-zinc-900/60 border-transparent hover:border-zinc-800/80 text-zinc-300 hover:text-white'
                                  : 'hover:bg-slate-50 border-transparent hover:border-slate-100 text-zinc-600 hover:text-zinc-900 shadow-sm hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-center gap-2 sm:gap-2.5">
                                <div className={`p-1 sm:p-1.5 rounded-lg sm:rounded-xl transition-colors ${
                                  theme === 'dark' ? 'bg-zinc-900 group-hover:bg-zinc-850' : 'bg-slate-100'
                                }`}>
                                  <Shield size={12} className="text-amber-500" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                                    ADMIN ACCESS
                                  </span>
                                  <span className="text-[8px] sm:text-[9px] text-zinc-400 font-sans mt-0.5">Switch to Terminal</span>
                                </div>
                              </div>
                              <ChevronRight size={12} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
                            </button>
                          )}
                        </div>

                        {/* Footer Section / Log Out */}
                        <div className={`p-1.5 sm:p-2 border-t mt-1 ${
                          theme === 'dark' ? 'border-zinc-900 bg-zinc-950/40' : 'border-slate-100 bg-slate-50/50'
                        }`}>
                          <button
                            type="button"
                            onClick={() => {
                              logout();
                              setIsDropdownOpen(false);
                              if (isAdminMode) onToggleAdminMode(); // exit admin mode on logout
                            }}
                            className="w-full flex items-center justify-between p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-rose-500 hover:bg-rose-500/10 transition-colors text-left"
                          >
                            <span className="flex items-center gap-2 sm:gap-2.5">
                              <LogOut size={12} />
                              LOG OUT
                            </span>
                            <span className="text-[8px] sm:text-[9px] text-rose-500/60 font-mono font-medium">END SESSION</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Guest (Not Logged In) Options
                      <div className="flex flex-col">
                        {/* Upper Premium Guest Header */}
                        <div className={`px-4 py-3 sm:px-5 sm:py-4 border-b relative overflow-hidden ${
                          theme === 'dark' 
                            ? 'border-zinc-800 bg-gradient-to-b from-zinc-900/30 to-transparent' 
                            : 'border-slate-100 bg-gradient-to-b from-slate-50 to-transparent'
                        }`}>
                          {/* Radial Ambient Glow */}
                          <div className="absolute -right-8 -top-8 w-20 h-20 sm:w-24 sm:h-24 rounded-full blur-2xl opacity-15 bg-amber-500 pointer-events-none" />

                          <div className="flex items-center gap-2.5 sm:gap-3 relative z-10">
                            {/* Guest Avatar */}
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gradient-to-tr from-zinc-500 to-zinc-400 text-white font-black text-[10px] sm:text-xs ring-2 ring-zinc-500/10 shrink-0">
                              G
                            </div>
                            <div>
                              <p className={`text-[10px] sm:text-[12px] font-black uppercase tracking-widest ${
                                theme === 'dark' ? 'text-zinc-300' : 'text-slate-800'
                              }`}>
                                Welcome Guest
                              </p>
                              <p className="text-[8px] sm:text-[9px] text-zinc-400 font-sans mt-0.5">Access personalized footwear orders</p>
                            </div>
                          </div>
                        </div>

                        {/* Guest Interactive Grid */}
                        <div className="p-3 sm:p-4 space-y-2 sm:space-y-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              onOpenAuth('login');
                              setIsDropdownOpen(false);
                            }}
                            className="w-full py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl bg-[#005f41] hover:bg-[#004b32] text-white font-black uppercase text-[10px] sm:text-xs tracking-widest flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg shadow-emerald-900/10"
                          >
                            <LogIn size={12} />
                            LOG IN
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onOpenAuth('register');
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl border font-black uppercase text-[10px] sm:text-xs tracking-widest flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                              theme === 'dark'
                                ? 'border-zinc-800 text-zinc-200 hover:bg-zinc-900'
                                : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                            }`}
                          >
                            <User size={12} />
                            CREATE ACCOUNT
                          </button>
                        </div>

                        {/* Shortcut to Admin Panel */}
                        <div className={`p-2 sm:p-2.5 border-t ${
                          theme === 'dark' ? 'border-zinc-900 bg-zinc-950/40' : 'border-slate-100 bg-slate-50/50'
                        }`}>
                          <button
                            type="button"
                            onClick={() => {
                              onOpenAuth('login', { mobile: '9511244447', pass: 'Prashant' });
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full group flex items-center justify-between p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all duration-200 text-left font-mono border ${
                              theme === 'dark'
                                ? 'hover:bg-zinc-900/60 border-transparent hover:border-zinc-800/80 text-amber-500'
                                : 'hover:bg-slate-50 border-transparent hover:border-slate-100 text-amber-600'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                              <Shield size={12} className="animate-pulse" />
                              ADMIN PANEL
                            </span>
                            <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 sm:px-2 rounded-full bg-amber-500/10 border border-amber-500/20 font-black uppercase tracking-widest">
                              SHORTCUT
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden flex h-[42px] w-[42px] items-center justify-center rounded-full border transition-all duration-300 cursor-pointer relative ${
              isNavbarDark
                ? 'border-white/15 bg-black/50 text-white hover:border-white/30 hover:bg-white/5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] hover:scale-105'
                : 'border-zinc-200/80 bg-zinc-100 text-zinc-800 hover:border-zinc-300 hover:bg-zinc-200/50 shadow-inner hover:scale-105'
            }`}
          >
            {isMobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden border-t px-6 py-4 flex flex-col gap-4 ${
              theme === 'dark'
                ? 'border-zinc-900 bg-black/95 text-zinc-300'
                : 'border-zinc-200 bg-white/95 text-zinc-700 shadow-xl'
            }`}
          >
            <button
              onClick={() => {
                onScrollToTop();
                setIsMobileMenuOpen(false);
              }}
              className={`text-left text-sm font-semibold tracking-wider uppercase transition-colors ${
                theme === 'dark' ? 'hover:text-white' : 'hover:text-gold'
              }`}
            >
              {t('nav.home')}
            </button>
            <button
              onClick={() => {
                onOpenAbout();
                setIsMobileMenuOpen(false);
              }}
              className={`text-left text-sm font-semibold tracking-wider uppercase transition-colors ${
                theme === 'dark' ? 'hover:text-white' : 'hover:text-gold'
              }`}
            >
              {t('nav.about')}
            </button>
            <button
              onClick={() => {
                onScrollToProducts();
                setIsMobileMenuOpen(false);
              }}
              className={`text-left text-sm font-semibold tracking-wider uppercase transition-colors ${
                theme === 'dark' ? 'hover:text-white' : 'hover:text-gold'
              }`}
            >
              {t('nav.collection')}
            </button>
            <button
              onClick={() => {
                onOpenOffers();
                setIsMobileMenuOpen(false);
              }}
              className={`text-left text-sm font-semibold tracking-wider uppercase transition-colors ${
                theme === 'dark' ? 'hover:text-white' : 'hover:text-gold'
              }`}
            >
              {t('nav.offers')}
            </button>
            <button
              onClick={() => {
                onOpenContact();
                setIsMobileMenuOpen(false);
              }}
              className={`text-left text-sm font-semibold tracking-wider uppercase transition-colors ${
                theme === 'dark' ? 'hover:text-white' : 'hover:text-gold'
              }`}
            >
              {t('nav.contact')}
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  onToggleAdminMode();
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left text-sm font-bold tracking-wider uppercase transition-colors flex items-center gap-2 border-t pt-3 border-zinc-800/20 ${
                  theme === 'dark' ? 'text-amber-400 hover:text-amber-300' : 'text-amber-700 hover:text-amber-900'
                }`}
              >
                <Shield size={14} className="text-amber-500" />
                {isAdminMode ? t('nav.customerMode') : t('nav.adminMode')}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
