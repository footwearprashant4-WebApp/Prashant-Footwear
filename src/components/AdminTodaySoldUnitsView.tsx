import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, TrendingUp, Calendar, Search, X, 
  Package, ShoppingBag, Receipt, ArrowRight
} from 'lucide-react';
import { Order, Product } from '../types';

export interface AdminTodaySoldUnitsViewProps {
  isDark: boolean;
  orders: Order[];
  products?: Product[];
  onBackToSummary: () => void;
  onNavigate?: (tabId: string) => void;
}

export interface SoldUnitItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  size: number;
  quantity: number;
  price: number;
  time: string;
  customerName?: string;
  customerMobile?: string;
  paymentMethod?: string;
}

export const AdminTodaySoldUnitsView: React.FC<AdminTodaySoldUnitsViewProps> = ({
  isDark,
  orders = [],
  products = [],
  onBackToSummary,
  onNavigate
}) => {
  // Current date formatting matching reference: "Wed, Sep 9, 2026"
  const formattedTodayDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter orders created today
  const todayOrders = useMemo(() => {
    return (orders || []).filter(o => o.createdAt && o.createdAt.startsWith(todayStr));
  }, [orders, todayStr]);

  // Extract all items sold today
  const todaySoldItems: SoldUnitItem[] = useMemo(() => {
    const itemsList: SoldUnitItem[] = [];
    todayOrders.forEach(order => {
      (order.items || []).forEach((item, idx) => {
        itemsList.push({
          id: `${order.id}-${idx}`,
          orderId: order.id,
          productId: item.productId,
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          customerName: order.customerName,
          customerMobile: order.customerMobile,
          paymentMethod: order.paymentMethod
        });
      });
    });
    return itemsList;
  }, [todayOrders]);

  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered items based on search query
  const filteredSoldItems = useMemo(() => {
    if (!searchQuery.trim()) return todaySoldItems;
    const q = searchQuery.toLowerCase().trim();
    return todaySoldItems.filter(item => {
      const matchName = (item.name || '').toLowerCase().includes(q);
      const matchProductId = (item.productId || '').toLowerCase().includes(q);
      const matchOrder = (item.orderId || '').toLowerCase().includes(q);
      const matchCustomer = (item.customerName || '').toLowerCase().includes(q);
      return matchName || matchProductId || matchOrder || matchCustomer;
    });
  }, [todaySoldItems, searchQuery]);

  // Metric 1: Unique Styles count
  const uniqueStylesCount = useMemo(() => {
    const set = new Set(filteredSoldItems.map(it => it.name.trim().toLowerCase()));
    return set.size;
  }, [filteredSoldItems]);

  // Metric 2: Total pairs sold
  const totalPairsSold = useMemo(() => {
    return filteredSoldItems.reduce((sum, it) => sum + (it.quantity || 1), 0);
  }, [filteredSoldItems]);

  // Metric 3: Total Value (₹)
  const totalValue = useMemo(() => {
    return filteredSoldItems.reduce((sum, it) => sum + ((it.price || 0) * (it.quantity || 1)), 0);
  }, [filteredSoldItems]);

  return (
    <div className="w-full max-w-[420px] mx-auto pb-24 px-3 sm:px-4 font-sans select-none animate-fade-in">
      
      {/* 1. Top Header Card: TODAY'S PERFORMANCE (matching exact reference image) */}
      <div className={`rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 border-[1.5px] shadow-2xs transition-all ${
        isDark 
          ? 'bg-zinc-900 border-zinc-700 text-white' 
          : 'bg-white border-[#141311] text-[#141311]'
      }`}>
        {/* Title row */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border border-[#DFD1AB] bg-[#FBF7EC] dark:bg-zinc-800 flex items-center justify-center text-[#BFA05D] shrink-0">
            <TrendingUp size={16} className="stroke-[2.5]" />
          </div>
          <h1 className="font-serif font-black text-lg sm:text-[19px] tracking-tight uppercase leading-none text-[#141311] dark:text-white">
            TODAY'S PERFORMANCE
          </h1>
        </div>

        {/* Badges: LIVE and Date */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {/* LIVE pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-black tracking-wider bg-[#E5F7ED] dark:bg-emerald-950/60 text-[#138054] dark:text-emerald-400 border border-[#B1E8C9] dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>LIVE</span>
          </div>

          {/* Date pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-tight bg-[#FBF2E3] dark:bg-amber-950/40 text-[#5F4A24] dark:text-amber-300 border border-[#E9D9BF] dark:border-amber-900/60">
            <Calendar size={13} className="text-[#C45E28]" />
            <span>{formattedTodayDate}</span>
          </div>
        </div>
      </div>

      {/* 2. Sub-Header: Back Arrow + TODAY'S SOLD UNITS LEDGER */}
      <div className="flex items-start gap-3 mt-6">
        {/* Rounded square back button */}
        <button
          type="button"
          onClick={onBackToSummary}
          className={`w-11 h-11 rounded-2xl border-[1.5px] flex items-center justify-center cursor-pointer shadow-2xs active:scale-95 transition-all shrink-0 ${
            isDark
              ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
              : 'bg-white border-[#141311] text-[#141311] hover:bg-zinc-50'
          }`}
          title="Back to Today's Summary"
        >
          <ArrowLeft size={18} className="stroke-[2.5]" />
        </button>

        {/* Title and metadata */}
        <div className="flex-1">
          <h2 className="font-sans font-black text-[17px] sm:text-[18px] tracking-tight text-[#141311] dark:text-white uppercase leading-snug">
            TODAY'S SOLD UNITS<br />LEDGER
          </h2>
          <p className="font-mono text-xs sm:text-[12.5px] text-[#141311] dark:text-zinc-300 mt-1">
            Itemized real-time catalog of products sold today.
          </p>
        </div>
      </div>

      {/* 3. Horizontal Divider */}
      <div className="w-full h-px bg-zinc-300 dark:bg-zinc-700 my-5" />

      {/* 4. Search bar */}
      <div className={`rounded-2xl border-[1.5px] px-3.5 py-3 flex items-center gap-2.5 transition-all ${
        isDark
          ? 'bg-zinc-900 border-zinc-700 text-white'
          : 'bg-white border-[#DCD1B7] text-[#141311]'
      }`}>
        <Search size={18} className="text-[#141311] dark:text-zinc-400 shrink-0 stroke-[2.2]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sold items by product name"
          className="bg-transparent border-none outline-none w-full font-mono text-xs sm:text-[13px] text-[#141311] dark:text-white placeholder:text-zinc-400"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* 5. Metrics Badges (matching reference exact layout) */}
      <div className="mt-4 space-y-2">
        {/* Row 1: Unique Styles & Total pairs sold */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Unique Styles Badge */}
          <div className={`px-4 py-2 rounded-2xl border flex items-center gap-1.5 shadow-2xs ${
            isDark 
              ? 'bg-zinc-900 border-zinc-700 text-zinc-300' 
              : 'bg-white border-zinc-400 text-[#141311]'
          }`}>
            <span className="font-sans font-medium text-xs sm:text-[13px]">Unique Styles:</span>
            <span className="font-sans font-black text-xs sm:text-[13px] text-[#141311] dark:text-white">
              {uniqueStylesCount}
            </span>
          </div>

          {/* Total pairs sold Badge */}
          <div className={`px-4 py-2 rounded-2xl border flex items-center gap-1.5 shadow-2xs ${
            isDark 
              ? 'bg-zinc-900 border-zinc-700 text-zinc-300' 
              : 'bg-white border-zinc-400 text-[#141311]'
          }`}>
            <span className="font-sans font-medium text-xs sm:text-[13px]">Total pairs sold:</span>
            <span className="font-sans font-black text-xs sm:text-[13px] text-[#141311] dark:text-white">
              {totalPairsSold}
            </span>
          </div>
        </div>

        {/* Row 2: Total Value Badge */}
        <div>
          <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border shadow-2xs ${
            isDark 
              ? 'bg-zinc-900 border-zinc-700 text-zinc-300' 
              : 'bg-white border-zinc-400 text-[#141311]'
          }`}>
            <span className="font-sans font-medium text-xs sm:text-[13px]">Total Value:</span>
            <span className="font-sans font-black text-xs sm:text-[13px] text-[#141311] dark:text-white">
              ₹{totalValue.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Empty State / Items Container (matching reference image) */}
      {filteredSoldItems.length === 0 ? (
        <div className={`mt-5 rounded-[28px] sm:rounded-[32px] border p-8 sm:p-10 min-h-[170px] flex items-center justify-center text-center transition-all ${
          isDark
            ? 'border-zinc-700 bg-zinc-900/40'
            : 'border-zinc-300 bg-white/40'
        }`}>
          <p className="font-mono text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 max-w-[280px] leading-relaxed">
            No sold items found matching search criteria.
          </p>
        </div>
      ) : (
        /* Itemized list of products sold today */
        <div className="mt-5 space-y-2.5">
          {filteredSoldItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border-[1.5px] p-4 shadow-2xs flex flex-col justify-between gap-2.5 transition-all ${
                isDark 
                  ? 'bg-zinc-900 border-zinc-700 text-white' 
                  : 'bg-white border-zinc-300 text-[#141311]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-sans font-black text-xs sm:text-[13px] uppercase truncate text-[#141311] dark:text-white">
                    {item.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-zinc-500 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-[#8C6929] dark:text-amber-400 border border-amber-200/60 font-bold">
                      Size: {item.size}
                    </span>
                    <span>Qty: <strong className="text-[#141311] dark:text-white">{item.quantity} pairs</strong></span>
                    <span>•</span>
                    <span>₹{item.price} each</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-black text-sm text-emerald-600 block">
                    ₹{item.price * item.quantity}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {item.time}
                  </span>
                </div>
              </div>

              {/* Bill footer metadata */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10.5px] font-mono text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <Receipt size={12} className="text-[#BFA05D]" />
                  <span>Bill #{item.orderId.slice(0, 8).toUpperCase()}</span>
                </div>
                <div>
                  {item.customerName || 'Walk-in'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 7. Bottom Horizontal Divider */}
      <div className="w-full h-px bg-zinc-300 dark:bg-zinc-700 my-6" />

      {/* 8. Bottom Button: [ ← BACK TO SUMMARY ] */}
      <div>
        <button
          type="button"
          onClick={onBackToSummary}
          className={`py-2.5 px-5 rounded-2xl border-[1.5px] font-sans font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xs active:scale-95 transition-all cursor-pointer ${
            isDark
              ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800'
              : 'bg-white border-[#141311] text-[#141311] hover:bg-zinc-50'
          }`}
        >
          <ArrowLeft size={16} className="stroke-[2.5]" />
          <span>BACK TO SUMMARY</span>
        </button>
      </div>

    </div>
  );
};
