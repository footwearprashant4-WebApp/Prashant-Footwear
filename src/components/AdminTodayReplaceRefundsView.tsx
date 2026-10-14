import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, TrendingUp, Calendar, Search, X, 
  RotateCcw, RefreshCw, AlertCircle
} from 'lucide-react';
import { Order, Product } from '../types';

export interface AdminTodayReplaceRefundsViewProps {
  isDark: boolean;
  orders: Order[];
  products?: Product[];
  onBackToSummary: () => void;
  onNavigate?: (tabId: string) => void;
}

export interface ReturnCaseItem {
  id: string;
  orderId: string;
  customerName: string;
  customerMobile: string;
  itemName: string;
  itemSize: number;
  quantity: number;
  value: number;
  type: 'EXCHANGE' | 'REFUND';
  reason: string;
  time: string;
}

export const AdminTodayReplaceRefundsView: React.FC<AdminTodayReplaceRefundsViewProps> = ({
  isDark,
  orders = [],
  products = [],
  onBackToSummary,
  onNavigate
}) => {
  // Current active tab between REPLACE / EXCHANGE and REFUNDS
  const [activeSubTab, setActiveSubTab] = useState<'EXCHANGE' | 'REFUND'>('EXCHANGE');

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Date formatting matching reference screenshot: "Wed, Sep 9, 2026"
  const formattedTodayDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter today's return/exchange and refund records
  const { exchangeItems, refundItems } = useMemo(() => {
    const exList: ReturnCaseItem[] = [];
    const refList: ReturnCaseItem[] = [];

    orders.forEach(order => {
      const isToday = order.createdAt && order.createdAt.startsWith(todayStr);
      if (!isToday) return;

      if ((order.status as string) === 'refunded' || (order as any).refundAmount) {
        (order.items || []).forEach((it, idx) => {
          refList.push({
            id: `${order.id}-ref-${idx}`,
            orderId: order.id,
            customerName: order.customerName || 'Walk-in',
            customerMobile: order.customerMobile || '-',
            itemName: it.name,
            itemSize: it.size,
            quantity: it.quantity,
            value: it.price * it.quantity,
            type: 'REFUND',
            reason: (order as any).returnReason || 'Customer requested return',
            time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        });
      } else if ((order.status as string) === 'exchanged' || (order as any).isExchange) {
        (order.items || []).forEach((it, idx) => {
          exList.push({
            id: `${order.id}-ex-${idx}`,
            orderId: order.id,
            customerName: order.customerName || 'Walk-in',
            customerMobile: order.customerMobile || '-',
            itemName: it.name,
            itemSize: it.size,
            quantity: it.quantity,
            value: it.price * it.quantity,
            type: 'EXCHANGE',
            reason: (order as any).exchangeReason || 'Size / style exchange',
            time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        });
      }
    });

    return { exchangeItems: exList, refundItems: refList };
  }, [orders, todayStr]);

  // Current list based on active sub tab
  const activeItems = activeSubTab === 'EXCHANGE' ? exchangeItems : refundItems;

  // Filter based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return activeItems;
    const q = searchQuery.toLowerCase().trim();
    return activeItems.filter(item => {
      const matchName = (item.itemName || '').toLowerCase().includes(q);
      const matchCust = (item.customerName || '').toLowerCase().includes(q);
      const matchOrder = (item.orderId || '').toLowerCase().includes(q);
      const matchReason = (item.reason || '').toLowerCase().includes(q);
      return matchName || matchCust || matchOrder || matchReason;
    });
  }, [activeItems, searchQuery]);

  // Metric 1: Total Cases
  const totalCasesCount = filteredItems.length;

  // Metric 2: Approximate Value
  const approximateValue = useMemo(() => {
    return filteredItems.reduce((sum, it) => sum + (it.value || 0), 0);
  }, [filteredItems]);

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

      {/* 2. Sub-Header: Back Arrow + TODAY'S REPLACE / EXCHANGE LEDGER */}
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

        {/* Title and subtitle */}
        <div className="flex-1">
          <h2 className="font-sans font-black text-[17px] sm:text-[18px] tracking-tight text-[#141311] dark:text-white uppercase leading-snug">
            TODAY'S REPLACE /<br />EXCHANGE LEDGER
          </h2>
          <p className="font-mono text-xs sm:text-[12.5px] text-[#141311] dark:text-zinc-300 mt-1 leading-snug">
            Real-time tracking of replaced/exchanged and refunded items.
          </p>
        </div>
      </div>

      {/* 3. Horizontal Divider */}
      <div className="w-full h-px bg-zinc-300 dark:bg-zinc-700 my-5" />

      {/* 4. Segmented Tabs: REPLACE / EXCHANGE (0) vs REFUNDS (0) */}
      <div className={`rounded-2xl border p-1.5 flex gap-2 shadow-2xs ${
        isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-zinc-300'
      }`}>
        {/* Tab 1: REPLACE / EXCHANGE */}
        <button
          type="button"
          onClick={() => setActiveSubTab('EXCHANGE')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-sans font-black text-[11px] sm:text-xs uppercase tracking-wider text-center leading-tight transition-all cursor-pointer ${
            activeSubTab === 'EXCHANGE'
              ? 'bg-[#FCE7F0] dark:bg-rose-950/60 border border-[#E8B2C8] dark:border-rose-800 text-[#141311] dark:text-rose-100 shadow-2xs'
              : 'bg-white dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 text-[#52525B] dark:text-zinc-300 hover:bg-zinc-50'
          }`}
        >
          <span>REPLACE / EXCHANGE</span>
          <span className="block text-[11px] mt-0.5">({exchangeItems.length})</span>
        </button>

        {/* Tab 2: REFUNDS */}
        <button
          type="button"
          onClick={() => setActiveSubTab('REFUND')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-sans font-black text-[11px] sm:text-xs uppercase tracking-wider text-center leading-tight transition-all cursor-pointer ${
            activeSubTab === 'REFUND'
              ? 'bg-[#FCE7F0] dark:bg-rose-950/60 border border-[#E8B2C8] dark:border-rose-800 text-[#141311] dark:text-rose-100 shadow-2xs'
              : 'bg-white dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 text-[#52525B] dark:text-zinc-300 hover:bg-zinc-50'
          }`}
        >
          <span>REFUNDS</span>
          <span className="block text-[11px] mt-0.5">({refundItems.length})</span>
        </button>
      </div>

      {/* 5. Search Bar */}
      <div className={`mt-4 rounded-2xl border-[1.5px] px-3.5 py-3 flex items-center gap-2.5 transition-all ${
        isDark
          ? 'bg-zinc-900 border-zinc-700 text-white'
          : 'bg-white border-[#DCD1B7] text-[#141311]'
      }`}>
        <Search size={18} className="text-[#141311] dark:text-zinc-400 shrink-0 stroke-[2.2]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search returned/refunded items..."
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

      {/* 6. Metrics Badges (matching reference exact layout) */}
      <div className="mt-4 space-y-2">
        {/* Pill 1: Total Cases */}
        <div>
          <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border shadow-2xs ${
            isDark 
              ? 'bg-zinc-900 border-zinc-700 text-zinc-300' 
              : 'bg-white border-zinc-400 text-[#141311]'
          }`}>
            <span className="font-sans font-medium text-xs sm:text-[13px]">Total Cases:</span>
            <span className="font-sans font-black text-xs sm:text-[13px] text-[#141311] dark:text-white">
              {totalCasesCount} records
            </span>
          </div>
        </div>

        {/* Pill 2: Approximate Value */}
        <div>
          <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border shadow-2xs ${
            isDark 
              ? 'bg-zinc-900 border-zinc-700 text-zinc-300' 
              : 'bg-white border-zinc-400 text-[#141311]'
          }`}>
            <span className="font-sans font-medium text-xs sm:text-[13px]">Approximate Value:</span>
            <span className="font-sans font-black text-xs sm:text-[13px] text-[#141311] dark:text-white">
              ₹{approximateValue.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* 7. Empty State Box or Return Items List */}
      {filteredItems.length === 0 ? (
        <div className={`mt-5 rounded-[28px] sm:rounded-[32px] border p-8 sm:p-10 flex flex-col items-center justify-center text-center transition-all ${
          isDark
            ? 'border-zinc-700 bg-zinc-900/40'
            : 'border-zinc-300 bg-white/40'
        }`}>
          {/* Circular return arrow icon matching reference */}
          <div className="text-zinc-500 dark:text-zinc-400 mb-3 flex items-center justify-center">
            <RotateCcw size={40} className="stroke-[1.8]" />
          </div>

          <h3 className="font-sans font-black text-sm uppercase tracking-wider text-[#141311] dark:text-white">
            NO RETURNS FOUND
          </h3>

          <p className="font-sans text-xs sm:text-[12.5px] text-zinc-600 dark:text-zinc-400 max-w-[260px] mt-1.5 leading-relaxed">
            There are no returns registered for today matching your search query.
          </p>
        </div>
      ) : (
        /* List of active return / exchange cases */
        <div className="mt-5 space-y-2.5">
          {filteredItems.map((item) => (
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
                    {item.itemName}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-zinc-500 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200/60 font-bold">
                      Size: {item.itemSize}
                    </span>
                    <span>Qty: <strong className="text-[#141311] dark:text-white">{item.quantity} pairs</strong></span>
                    <span>•</span>
                    <span>₹{item.value}</span>
                  </div>
                  <div className="text-[10.5px] font-mono text-zinc-400 mt-1">
                    Reason: {item.reason}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/60">
                    {item.type}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 block mt-1">
                    {item.time}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10.5px] font-mono text-zinc-500">
                <span>Bill #{item.orderId.slice(0, 8).toUpperCase()}</span>
                <span>{item.customerName} ({item.customerMobile})</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 8. Bottom Horizontal Divider */}
      <div className="w-full h-px bg-zinc-300 dark:bg-zinc-700 my-6" />

      {/* 9. Bottom Button: [ ← BACK TO SUMMARY ] */}
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
