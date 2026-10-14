import React, { useMemo } from 'react';
import { 
  ArrowLeft, TrendingUp, Calendar, ArrowRight, RotateCcw, 
  Layers, Package, QrCode, Banknote, ArrowUp
} from 'lucide-react';
import { Order, Product, StockLedger } from '../types';

export interface AdminTodayPerformanceViewProps {
  isDark: boolean;
  orders: Order[];
  products: Product[];
  stockLedgers?: StockLedger[];
  onNavigate: (tabId: string) => void;
  onBack: () => void;
}

export const AdminTodayPerformanceView: React.FC<AdminTodayPerformanceViewProps> = ({
  isDark,
  orders = [],
  products = [],
  stockLedgers = [],
  onNavigate,
  onBack
}) => {
  // Current date formatting: "Wed, Sep 9, 2026"
  const formattedTodayDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter today's orders
  const todayOrders = useMemo(() => {
    return (orders || []).filter(o => o.createdAt && o.createdAt.startsWith(todayStr));
  }, [orders, todayStr]);

  // Today's Gross Revenue
  const todayRevenue = useMemo(() => {
    return todayOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [todayOrders]);

  // Today's Units / Pairs Sold
  const todayUnitsSold = useMemo(() => {
    return todayOrders.reduce((sum, o) => {
      return sum + (o.items || []).reduce((iSum, it) => iSum + (Number(it.quantity) || 1), 0);
    }, 0);
  }, [todayOrders]);

  // Today's Returns / Refunds
  const replaceAndRefunds = useMemo(() => {
    return 0;
  }, []);

  // Stock received today (from stock ledgers created today)
  const stockReceivedUnits = useMemo(() => {
    const todayInward = (stockLedgers || []).filter(sl => sl.createdAt && sl.createdAt.startsWith(todayStr));
    return todayInward.reduce((sum, sl) => {
      const u = sl.totalUnits || (sl.items || []).reduce((iSum, it) => iSum + (Number(it.quantity) || 0), 0);
      return sum + u;
    }, 0);
  }, [stockLedgers, todayStr]);

  // Payment Breakdown
  const paymentData = useMemo(() => {
    let upi = 0;
    let cash = 0;

    todayOrders.forEach(o => {
      const pm = (o.paymentMethod || 'cash').toLowerCase();
      const amt = Number(o.totalAmount) || 0;
      if (pm.includes('upi') || pm.includes('qr') || pm.includes('gpay') || pm.includes('phonepe') || pm.includes('online')) {
        upi += amt;
      } else {
        cash += amt;
      }
    });

    const total = upi + cash;
    const upiPercent = total > 0 ? Math.round((upi / total) * 100) : 0;
    const cashPercent = total > 0 ? Math.round((cash / total) * 100) : 0;

    return { upi, cash, upiPercent, cashPercent };
  }, [todayOrders]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-[420px] mx-auto pb-24 px-3 sm:px-4 font-sans select-none">
      
      {/* 1. Header Card: BACK button + TODAY'S PERFORMANCE + LIVE / DATE badges */}
      <div className={`rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 border-[1.5px] shadow-2xs transition-all ${
        isDark 
          ? 'bg-zinc-900 border-zinc-700 text-white' 
          : 'bg-white border-[#141311] text-[#141311]'
      }`}>
        {/* BACK button */}
        <div>
          <button
            type="button"
            onClick={onBack}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-black tracking-wider uppercase flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all ${
              isDark
                ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                : 'bg-white border-[#141311] text-[#141311] hover:bg-zinc-50'
            }`}
          >
            <ArrowLeft size={14} className="stroke-[3]" />
            <span>BACK</span>
          </button>
        </div>

        {/* Title row */}
        <div className="flex items-center gap-2.5 mt-4">
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

      {/* 2. Grid of 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5 mt-4">
        
        {/* Card 1: TODAY'S REVENUE */}
        <div 
          onClick={() => onNavigate('today-invoices')}
          className={`rounded-[24px] sm:rounded-[28px] p-4 border-[1.5px] shadow-2xs flex flex-col justify-between transition-all cursor-pointer hover:border-[#BFA05D] active:scale-[0.99] ${
          isDark 
            ? 'bg-zinc-900 border-zinc-700' 
            : 'bg-white border-[#141311]'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11.5px] sm:text-[12px] font-black tracking-wide text-[#141311] dark:text-zinc-200 uppercase leading-tight font-sans">
                TODAY'S<br />REVENUE
              </span>
              <div className="w-8 h-8 rounded-xl border border-[#DFD1AB] bg-[#FBF7EC] dark:bg-zinc-800 flex items-center justify-center text-[#BFA05D] shrink-0">
                <TrendingUp size={15} className="stroke-[2.5]" />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-2xl sm:text-[26px] font-black font-sans tracking-tight block text-[#141311] dark:text-white">
                ₹{todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('today-invoices');
              }}
              className="w-full py-2 px-2.5 rounded-xl bg-[#F6EFE1] hover:bg-[#ebdcc0] dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-[#DFD1AB] dark:border-zinc-700 text-[#141311] dark:text-zinc-200 text-[10.5px] font-black uppercase tracking-wider flex items-center justify-between cursor-pointer transition-all active:scale-95"
            >
              <span className="truncate">VIEW BILLS LEDGER</span>
              <ArrowRight size={12} className="shrink-0" />
            </button>
          </div>
        </div>

        {/* Card 2: UNITS SOLD */}
        <div 
          onClick={() => onNavigate('today-sold-units')}
          className={`rounded-[24px] sm:rounded-[28px] p-4 border-[1.5px] shadow-2xs flex flex-col justify-between transition-all cursor-pointer hover:shadow-md active:scale-98 ${
          isDark 
            ? 'bg-zinc-900 border-zinc-700' 
            : 'bg-white border-[#141311]'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11.5px] sm:text-[12px] font-black tracking-wide text-[#141311] dark:text-zinc-200 uppercase leading-tight font-sans">
                UNITS<br />SOLD
              </span>
              <div className="w-8 h-8 rounded-xl border border-[#DFD1AB] bg-[#FBF7EC] dark:bg-zinc-800 flex items-center justify-center text-[#BFA05D] shrink-0">
                <Package size={15} className="stroke-[2.5]" />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-2xl sm:text-[26px] font-black font-sans tracking-tight block text-[#141311] dark:text-white">
                {todayUnitsSold}
              </span>
              <span className="text-xs text-[#716A5C] dark:text-zinc-400 font-medium">
                pairs
              </span>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('today-sold-units');
              }}
              className="w-full py-2 px-2.5 rounded-xl bg-[#F6EFE1] hover:bg-[#ebdcc0] dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-[#DFD1AB] dark:border-zinc-700 text-[#141311] dark:text-zinc-200 text-[10.5px] font-black uppercase tracking-wider flex items-center justify-between cursor-pointer transition-all active:scale-95"
            >
              <span className="truncate">VIEW ITEMS SOLD</span>
              <ArrowRight size={12} className="shrink-0" />
            </button>
          </div>
        </div>

        {/* Card 3: REPLACE & REFUNDS */}
        <div 
          onClick={() => onNavigate('today-replace-refunds')}
          className={`rounded-[24px] sm:rounded-[28px] p-4 border-[1.5px] shadow-2xs flex flex-col justify-between transition-all cursor-pointer hover:shadow-md active:scale-98 ${
          isDark 
            ? 'bg-zinc-900 border-zinc-700' 
            : 'bg-white border-[#141311]'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11.5px] sm:text-[12px] font-black tracking-wide text-[#141311] dark:text-zinc-200 uppercase leading-tight font-sans">
                REPLACE &<br />REFUNDS
              </span>
              <div className="w-8 h-8 rounded-full border border-red-200 bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                <RotateCcw size={15} className="stroke-[2.5]" />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-2xl sm:text-[26px] font-black font-sans tracking-tight block text-[#141311] dark:text-white">
                {replaceAndRefunds}
              </span>
              <span className="text-xs text-[#716A5C] dark:text-zinc-400 font-medium">
                items
              </span>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('today-replace-refunds');
              }}
              className="w-full py-2 px-2.5 rounded-xl bg-[#FCEBEB] hover:bg-[#f6d7d7] dark:bg-red-950/30 dark:hover:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-[10.5px] font-black uppercase tracking-wider flex items-center justify-between cursor-pointer transition-all active:scale-95"
            >
              <span className="truncate">VIEW REPL...</span>
              <ArrowRight size={12} className="shrink-0" />
            </button>
          </div>
        </div>

        {/* Card 4: STOCK RECEIVED */}
        <div 
          onClick={() => onNavigate('today-stock-inward')}
          className={`rounded-[24px] sm:rounded-[28px] p-4 border-[1.5px] shadow-2xs flex flex-col justify-between transition-all cursor-pointer hover:shadow-md active:scale-98 ${
          isDark 
            ? 'bg-zinc-900 border-zinc-700' 
            : 'bg-white border-[#141311]'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11.5px] sm:text-[12px] font-black tracking-wide text-[#141311] dark:text-zinc-200 uppercase leading-tight font-sans">
                STOCK<br />RECEIVED
              </span>
              <div className="w-8 h-8 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Layers size={15} className="stroke-[2.5]" />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-2xl sm:text-[26px] font-black font-sans tracking-tight block text-[#141311] dark:text-white">
                {stockReceivedUnits}
              </span>
              <span className="text-xs text-[#716A5C] dark:text-zinc-400 font-medium">
                units
              </span>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('today-stock-inward');
              }}
              className="w-full py-2 px-2.5 rounded-xl bg-[#E8F8F0] hover:bg-[#d4f2e3] dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10.5px] font-black uppercase tracking-wider flex items-center justify-between cursor-pointer transition-all active:scale-95"
            >
              <span className="truncate">VIEW STOCK LEDGER</span>
              <ArrowRight size={12} className="shrink-0" />
            </button>
          </div>
        </div>

      </div>

      {/* 3. FINANCIAL CHANNELS SUMMARY Card */}
      <div className={`mt-4 rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 border-[1.5px] shadow-2xs transition-all ${
        isDark 
          ? 'bg-zinc-900 border-zinc-700' 
          : 'bg-white border-[#141311]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl border border-[#DFD1AB] bg-[#FBF7EC] dark:bg-zinc-800 flex items-center justify-center text-[#141311] dark:text-zinc-200 shrink-0">
              <QrCode size={18} className="stroke-[2]" />
            </div>
            <div>
              <h3 className="font-black text-[13px] sm:text-[14px] uppercase tracking-wider text-[#141311] dark:text-white leading-tight">
                FINANCIAL<br />CHANNELS<br />SUMMARY
              </h3>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl border border-[#DFD1AB] bg-[#FBF7EC] dark:bg-zinc-800 text-[11px] font-mono font-bold text-[#141311] dark:text-zinc-200 text-center shrink-0">
            Realtime<br />Split
          </div>
        </div>

        {/* Channel 1: UPI Transfer */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
            <div className="flex items-center gap-2 text-[#141311] dark:text-zinc-200">
              <QrCode size={15} className="text-zinc-600 dark:text-zinc-400" />
              <span>UPI Transfer</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[#141311] dark:text-white">
                ₹{paymentData.upi.toLocaleString('en-IN')}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#FBF7EC] dark:bg-zinc-800 border border-[#DFD1AB] dark:border-zinc-700 text-[11px] font-mono font-bold text-[#141311] dark:text-zinc-200">
                {paymentData.upiPercent}%
              </span>
            </div>
          </div>

          {/* Progress bar track matching screenshot */}
          <div className="w-full h-3 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 overflow-hidden mt-2 p-0.5">
            <div 
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.max(paymentData.upiPercent, 0)}%` }}
            />
          </div>
        </div>

        {/* Channel 2: Cash Register */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
            <div className="flex items-center gap-2 text-[#141311] dark:text-zinc-200">
              <Banknote size={15} className="text-zinc-600 dark:text-zinc-400" />
              <span>Cash Register</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[#141311] dark:text-white">
                ₹{paymentData.cash.toLocaleString('en-IN')}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#E8F8F0] dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-300">
                {paymentData.cashPercent}%
              </span>
            </div>
          </div>

          {/* Progress bar track matching screenshot */}
          <div className="w-full h-3 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 overflow-hidden mt-2 p-0.5">
            <div 
              className="h-full rounded-full bg-[#BFA05D] transition-all duration-500"
              style={{ width: `${Math.max(paymentData.cashPercent, 0)}%` }}
            />
          </div>
        </div>

      </div>

      {/* 4. Weekly Analytics Note */}
      <div className="my-6">
        <div className="w-full h-px bg-[#141311]/20 dark:bg-zinc-800 mb-4" />
        <p className="text-[12px] sm:text-[13px] font-mono text-[#141311] dark:text-zinc-300 leading-relaxed">
          📅 Weekly analytics update is compiled automatically every Sunday evening.
        </p>
        <div className="w-full h-px bg-[#141311]/20 dark:bg-zinc-800 mt-4" />
      </div>

      {/* 5. BACK TO HOME CONSOLE Button */}
      <div className="mt-6">
        <button
          type="button"
          onClick={onBack}
          className="w-full py-4 rounded-[22px] sm:rounded-[24px] bg-[#BFA25D] hover:bg-[#b0924e] active:scale-[0.98] text-[#141311] font-black text-sm uppercase tracking-wider font-sans shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
        >
          <span>BACK TO HOME CONSOLE</span>
        </button>
      </div>

      {/* 6. Floating Scroll to Top Button matching screenshot (bottom-right circle with upward arrow) */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          type="button"
          onClick={scrollToTop}
          className="w-12 h-12 rounded-full bg-[#141311] hover:bg-zinc-800 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer"
          title="Scroll to top"
        >
          <ArrowUp size={18} className="stroke-[2.8]" />
        </button>
      </div>

    </div>
  );
};
