import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Home, ShoppingBag, Package, Tag, Truck, BarChart2, 
  Percent, Award, Users, Cpu, Database, ClipboardCheck, 
  Globe, Sun, Moon, ArrowRight, ShieldCheck, ChevronRight,
  LogOut, Sparkles, CheckCircle2, Clock, Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export interface AdminSlideOverNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isDark: boolean;
  onToggleTheme?: () => void;
  onExitAdmin: () => void;
  onOpenCheckInventory?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  shortLabel: string;
  desc: string;
  icon: React.ElementType;
  badge?: string;
  group: 'pos' | 'inventory' | 'marketing' | 'system';
}

export const AdminSlideOverNav: React.FC<AdminSlideOverNavProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  isDark,
  onToggleTheme,
  onExitAdmin,
  onOpenCheckInventory
}) => {
  const { currentUser, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = React.useState('');

  const NAV_GROUPS: { key: 'pos' | 'inventory' | 'marketing' | 'system'; title: string }[] = [
    { key: 'pos', title: 'Sales & POS Desk' },
    { key: 'inventory', title: 'Inventory & Supply' },
    { key: 'marketing', title: 'Marketing & Banners' },
    { key: 'system', title: 'Administration & System' },
  ];

  const NAV_ITEMS: NavItem[] = [
    { 
      id: 'home', 
      label: "Today's Performance", 
      shortLabel: 'Overview', 
      icon: Home, 
      desc: 'Live daily revenue & activity', 
      badge: 'LIVE',
      group: 'pos' 
    },
    { 
      id: 'billing', 
      label: 'Make Bill (POS Desk)', 
      shortLabel: 'Billing', 
      icon: ShoppingBag, 
      desc: 'Create invoices & print receipts', 
      group: 'pos' 
    },
    { 
      id: 'reports', 
      label: 'Sales Analytics Engine', 
      shortLabel: 'Sales Engine', 
      icon: BarChart2, 
      desc: 'Turnover, revenue & timeframe analytics', 
      group: 'pos' 
    },
    { 
      id: 'reports_analytical', 
      label: 'Reports & Analytical', 
      shortLabel: 'Analytics', 
      icon: Tag, 
      desc: 'Business reports & audit drawers', 
      group: 'pos' 
    },
    { 
      id: 'stock', 
      label: 'Products Stock Manager', 
      shortLabel: 'Stock', 
      icon: Package, 
      desc: 'Inventory pairs & ledgers', 
      group: 'inventory' 
    },
    { 
      id: 'catalogue', 
      label: 'Product Catalogue', 
      shortLabel: 'Catalogue', 
      icon: Tag, 
      desc: 'Articles, sizes, add new items', 
      group: 'inventory' 
    },
    { 
      id: 'wholesale_demand', 
      label: 'Purchase Orders', 
      shortLabel: 'Purchase Orders', 
      icon: Truck, 
      desc: 'Wholesaler demand articles', 
      group: 'inventory' 
    },
    { 
      id: 'offers', 
      label: 'Offers & Clearance Deals', 
      shortLabel: 'Offers', 
      icon: Percent, 
      desc: 'Promotions, discount pairs', 
      group: 'marketing' 
    },
    { 
      id: 'brand_config', 
      label: 'Brand & Media Config', 
      shortLabel: 'Brand Ads', 
      icon: Award, 
      desc: 'Hero videos & category banners', 
      group: 'marketing' 
    },
    { 
      id: 'accounts', 
      label: 'Manage Staff Accounts', 
      shortLabel: 'Staff PINs', 
      icon: Users, 
      desc: 'User roles, permissions & PINs', 
      group: 'system' 
    },
    { 
      id: 'erp', 
      label: 'ERP Settings & Hardware', 
      shortLabel: 'ERP Desk', 
      icon: Cpu, 
      desc: 'Printer setup & cloud sync', 
      group: 'system' 
    },
    { 
      id: 'data_management', 
      label: 'Data & Backup Management', 
      shortLabel: 'Backup', 
      icon: Database, 
      desc: 'Database export & sample data', 
      group: 'system' 
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="admin-slide-over-backdrop" className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop with smooth blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Slide-over Container */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className={`w-screen max-w-sm sm:max-w-md shadow-2xl flex flex-col justify-between border-l transition-colors duration-200 ${
                isDark
                  ? 'bg-zinc-950 border-zinc-800/90 text-zinc-100'
                  : 'bg-[#FAF8F5] border-zinc-300/80 text-zinc-900'
              }`}
            >
              {/* Top Drawer Header */}
              <div className={`px-5 py-4 sm:px-6 sm:py-5 border-b flex items-center justify-between shrink-0 ${
                isDark 
                  ? 'border-zinc-800/80 bg-zinc-900/60' 
                  : 'border-[#E8DFC2] bg-white'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#F3E5AB] via-[#D4AF37] to-[#996515] text-zinc-950 flex items-center justify-center font-black font-serif text-lg shadow-sm shrink-0">
                    P
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="serif-display text-sm sm:text-base font-black tracking-wider uppercase leading-none">
                        PRASHANT
                      </h3>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-widest text-[#C5A059] border border-[#C5A059]/40 uppercase">
                        ERP
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#C5A059] font-bold block mt-0.5">
                      Workspace Navigation
                    </span>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                    isDark
                      ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700'
                      : 'border-zinc-200 bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300'
                  }`}
                  aria-label="Close navigation menu"
                >
                  <X size={17} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Status Ribbon: Live Mode & Current User */}
              <div className={`px-5 py-2.5 sm:px-6 border-b flex items-center justify-between text-xs font-mono shrink-0 ${
                isDark 
                  ? 'border-zinc-800/50 bg-zinc-950/80 text-zinc-400' 
                  : 'border-zinc-200/80 bg-[#F4EFE6] text-zinc-600'
              }`}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-[10px] text-emerald-600 dark:text-emerald-400 tracking-wider">
                    LIVE ADMIN MODE
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  <ShieldCheck size={12} className="text-[#C5A059]" />
                  <span className="truncate max-w-[130px] font-bold">
                    {currentUser?.mobile ? `User: ${currentUser.mobile}` : 'Store Admin'}
                  </span>
                </div>
              </div>

              {/* Search & Quick Filter for Effortless Options Access */}
              <div className="px-4 sm:px-5 pt-3 pb-1 shrink-0">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${
                  isDark 
                    ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200' 
                    : 'bg-white border-[#E5DEC9] text-zinc-800 shadow-2xs'
                }`}>
                  <Search size={15} className="text-[#BFA05D] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search workspace, report, desk..."
                    className="bg-transparent border-none outline-none w-full text-xs font-sans placeholder:text-zinc-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Quick 1-Tap Option Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar scrollbar-none">
                  {[
                    { label: "Today's Summary", id: 'today-summary' },
                    { label: 'New Bill', id: 'billing' },
                    { label: 'Stock', id: 'stock' },
                    { label: 'Wholesale', id: 'wholesale_demand' },
                    { label: 'Reports', id: 'reports' },
                    { label: 'Add Item', id: 'catalogue' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onSelectTab(p.id);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-wider uppercase bg-[#FAF5E6] dark:bg-zinc-800 border border-[#E5DEC9] dark:border-zinc-700 text-[#BFA05D] shrink-0 hover:bg-[#BFA05D] hover:text-zinc-950 transition-colors cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Navigation List */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-2 space-y-5 scrollbar-thin">
                {NAV_GROUPS.map((group) => {
                  const itemsInGroup = NAV_ITEMS.filter((item) => {
                    if (item.group !== group.key) return false;
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    return item.label.toLowerCase().includes(q) || 
                           item.desc.toLowerCase().includes(q) ||
                           item.shortLabel.toLowerCase().includes(q);
                  });
                  if (itemsInGroup.length === 0) return null;

                  return (
                    <div key={group.key} className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 block px-2">
                        {group.title}
                      </span>

                      <div className="space-y-1">
                        {itemsInGroup.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id ||
                            (item.id === 'home' && activeTab === 'today-summary') ||
                            (item.id === 'reports' && activeTab === 'analytics');

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                onSelectTab(item.id);
                                onClose();
                              }}
                              className={`w-full p-2.5 sm:p-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer active:scale-[0.98] ${
                                isActive
                                  ? 'bg-[#C8A155] text-zinc-950 font-black shadow-md shadow-[#C8A155]/20'
                                  : isDark
                                  ? 'hover:bg-zinc-900/80 text-zinc-200 border border-transparent hover:border-zinc-800'
                                  : 'hover:bg-white text-zinc-800 border border-transparent hover:border-zinc-200 shadow-2xs'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                  isActive
                                    ? 'bg-zinc-950 text-[#C5A059]'
                                    : isDark
                                    ? 'bg-zinc-900 text-[#C5A059] border border-zinc-800'
                                    : 'bg-white text-[#C5A059] border border-zinc-200/80 shadow-2xs'
                                }`}>
                                  <Icon size={18} className={isActive ? 'stroke-[2.5]' : 'stroke-[2]'} />
                                </div>
                                <div className="truncate">
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="text-xs sm:text-sm font-bold leading-tight truncate">
                                      {item.label}
                                    </h4>
                                    {item.badge && (
                                      <span className={`text-[8px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                                        isActive 
                                          ? 'bg-zinc-950 text-white' 
                                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                      }`}>
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className={`text-[10px] truncate mt-0.5 ${
                                    isActive ? 'text-zinc-900/80' : 'text-zinc-500 dark:text-zinc-400'
                                  }`}>
                                    {item.desc}
                                  </p>
                                </div>
                              </div>

                              <ChevronRight size={15} className={`shrink-0 ml-2 transition-transform ${
                                isActive ? 'text-zinc-950 translate-x-0.5' : 'text-zinc-400 opacity-60'
                              }`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Warehouse Audit Special Action */}
                {onOpenCheckInventory && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenCheckInventory();
                      }}
                      className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all active:scale-[0.98] cursor-pointer ${
                        isDark 
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20' 
                          : 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center shrink-0">
                          <ClipboardCheck size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black leading-tight">
                            Warehouse Audit Sheet
                          </h4>
                          <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                            Physical shelf-by-shelf pair verification
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={15} className="shrink-0 text-amber-600 dark:text-amber-400" />
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Fixed Action Footer */}
              <div className={`p-4 sm:p-5 border-t space-y-3 shrink-0 ${
                isDark 
                  ? 'border-zinc-800/80 bg-zinc-900/70' 
                  : 'border-[#E8DFC2] bg-white'
              }`}>
                {/* Secondary Toggles Row: Language & Dark Mode */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Language Selector */}
                  <div className={`p-1.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold ${
                    isDark 
                      ? 'border-zinc-800 bg-zinc-950 text-zinc-300' 
                      : 'border-zinc-200 bg-zinc-50 text-zinc-800'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`px-2 py-1 rounded-lg cursor-pointer transition-all ${
                        language === 'en' 
                          ? 'bg-[#C8A155] text-zinc-950 font-black shadow-xs' 
                          : 'hover:text-[#C8A155]'
                      }`}
                    >
                      EN
                    </button>
                    <span className="text-zinc-400 select-none">|</span>
                    <button
                      type="button"
                      onClick={() => setLanguage('mr')}
                      className={`px-2 py-1 rounded-lg cursor-pointer transition-all ${
                        language === 'mr' 
                          ? 'bg-[#C8A155] text-zinc-950 font-black shadow-xs' 
                          : 'hover:text-[#C8A155]'
                      }`}
                    >
                      मराठी
                    </button>
                  </div>

                  {/* Theme Switcher */}
                  {onToggleTheme && (
                    <button
                      type="button"
                      onClick={onToggleTheme}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        isDark 
                          ? 'border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-800' 
                          : 'border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100'
                      }`}
                    >
                      {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-zinc-600" />}
                      <span>{isDark ? 'LIGHT' : 'DARK'}</span>
                    </button>
                  )}
                </div>

                {/* Exit to Customer Storefront button */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onExitAdmin();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C8A155] to-[#B89145] hover:from-[#ba9344] hover:to-[#a98135] text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-amber-500/10"
                >
                  <Globe size={15} />
                  <span>Exit to Customer Store</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
