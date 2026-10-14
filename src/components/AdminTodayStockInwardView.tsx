import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, TrendingUp, Calendar, Search, X, 
  Layers, PackagePlus, FileText, ArrowRight, CheckCircle2
} from 'lucide-react';
import { Product, StockLedger } from '../types';

export interface AdminTodayStockInwardViewProps {
  isDark: boolean;
  stockLedgers?: StockLedger[];
  products?: Product[];
  onBackToSummary: () => void;
  onNavigate?: (tabId: string) => void;
}

export interface InwardRecordDisplayItem {
  id: string;
  refId: string;
  type: 'supplier' | 'replaced';
  title: string;
  source: string;
  units: number;
  time: string;
  itemsDetail: string;
}

export const AdminTodayStockInwardView: React.FC<AdminTodayStockInwardViewProps> = ({
  isDark,
  stockLedgers = [],
  products = [],
  onBackToSummary,
  onNavigate
}) => {
  // Active Tab: 'all' (All Inward Stock) vs 'supplier' (Supplier Invoices)
  const [activeTab, setActiveTab] = useState<'all' | 'supplier'>('all');

  // Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // Formatted date matching reference: "Thu, Sep 10, 2026"
  const formattedTodayDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter today's stock ledgers
  const todayInwardItems: InwardRecordDisplayItem[] = useMemo(() => {
    const list: InwardRecordDisplayItem[] = [];

    (stockLedgers || []).forEach(ledger => {
      const isToday = ledger.createdAt && ledger.createdAt.startsWith(todayStr);
      if (!isToday) return;

      const isReplaced = Boolean(ledger.isReplacedPair);
      const totalUnits = ledger.totalUnits || (ledger.items || []).reduce((s, it) => s + (Number(it.quantity) || 0), 0);
      const itemsSummary = (ledger.items || []).map(it => `${it.name} (Sz: ${it.size}, Qty: ${it.quantity})`).join(', ');

      list.push({
        id: ledger.id,
        refId: ledger.id.slice(0, 8).toUpperCase(),
        type: isReplaced ? 'replaced' : 'supplier',
        title: isReplaced ? 'Restocked Replaced Pair' : (ledger.notes || 'Supplier Stock Inward'),
        source: isReplaced ? `Order #${(ledger.originalOrderId || '').slice(0, 6)}` : (ledger.operatorMobile || 'Main Supplier Delivery'),
        units: totalUnits,
        time: new Date(ledger.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        itemsDetail: itemsSummary || 'Standard product inventory'
      });
    });

    return list;
  }, [stockLedgers, todayStr]);

  // Separate records for counts
  const supplierCount = useMemo(() => {
    return todayInwardItems.filter(item => item.type === 'supplier').length;
  }, [todayInwardItems]);

  const replacedCount = useMemo(() => {
    return todayInwardItems.filter(item => item.type === 'replaced').length;
  }, [todayInwardItems]);

  // Filtered by sub tab
  const subTabFiltered = useMemo(() => {
    if (activeTab === 'supplier') {
      return todayInwardItems.filter(item => item.type === 'supplier');
    }
    return todayInwardItems;
  }, [todayInwardItems, activeTab]);

  // Filtered by search query
  const searchFiltered = useMemo(() => {
    if (!searchQuery.trim()) return subTabFiltered;
    const q = searchQuery.toLowerCase().trim();
    return subTabFiltered.filter(item => {
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchSource = (item.source || '').toLowerCase().includes(q);
      const matchRef = (item.refId || '').toLowerCase().includes(q);
      const matchDetail = (item.itemsDetail || '').toLowerCase().includes(q);
      return matchTitle || matchSource || matchRef || matchDetail;
    });
  }, [subTabFiltered, searchQuery]);

  // Metric 1: Inward Records count
  const inwardRecordsCount = searchFiltered.length;

  // Metric 2: Total Units Added (+X pairs)
  const totalUnitsAdded = useMemo(() => {
    return searchFiltered.reduce((sum, it) => sum + (it.units || 0), 0);
  }, [searchFiltered]);

  // Metric 3: Breakdown counts in current filtered set
  const filteredSupplierCount = useMemo(() => {
    return searchFiltered.filter(it => it.type === 'supplier').length;
  }, [searchFiltered]);

  const filteredReplacedCount = useMemo(() => {
    return searchFiltered.filter(it => it.type === 'replaced').length;
  }, [searchFiltered]);

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

      {/* 2. Sub-Header: Back Arrow + TODAY'S STOCK INWARD LEDGER */}
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
            TODAY'S STOCK INWARD<br />LEDGER
          </h2>
          <p className="font-mono text-xs sm:text-[12.5px] text-[#141311] dark:text-zinc-300 mt-1 leading-snug">
            Live supplier stock inward & restocked replace pair intake register.
          </p>
        </div>
      </div>

      {/* 3. Horizontal Divider */}
      <div className="w-full h-px bg-zinc-300 dark:bg-zinc-700 my-5" />

      {/* 4. Black Segmented Pill Container: [ All Inward Stock (0) ] [ Supplier Invoices (0) ] */}
      <div className="bg-[#141311] dark:bg-black rounded-2xl p-1 flex items-center shadow-md">
        {/* Tab 1: All Inward Stock */}
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-sans font-black text-[11px] sm:text-xs uppercase tracking-wider text-center transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#E58A13] text-[#141311] shadow-xs'
              : 'bg-transparent text-zinc-400 hover:text-white'
          }`}
        >
          All Inward Stock ({todayInwardItems.length})
        </button>

        {/* Tab 2: Supplier Invoices */}
        <button
          type="button"
          onClick={() => setActiveTab('supplier')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-sans font-black text-[11px] sm:text-xs uppercase tracking-wider text-center transition-all cursor-pointer ${
            activeTab === 'supplier'
              ? 'bg-[#E58A13] text-[#141311] shadow-xs'
              : 'bg-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Supplier Invoices ({supplierCount})
        </button>
      </div>

      {/* 5. Search Bar matching reference exact style */}
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
          placeholder="Search supplier ref, replace invo"
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

      {/* 6. Metric Badges (matching reference exact layout) */}
      <div className="mt-4 space-y-2">
        {/* Pill 1: Inward Records */}
        <div>
          <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border shadow-2xs ${
            isDark 
              ? 'bg-zinc-900 border-zinc-700 text-zinc-300' 
              : 'bg-white border-zinc-400 text-[#141311]'
          }`}>
            <span className="font-sans font-medium text-xs sm:text-[13px]">Inward Records:</span>
            <span className="font-sans font-black text-xs sm:text-[13px] text-[#141311] dark:text-white">
              {inwardRecordsCount} entries
            </span>
          </div>
        </div>

        {/* Pill 2: Total Units Added */}
        <div>
          <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border shadow-2xs ${
            isDark 
              ? 'bg-zinc-900 border-zinc-700 text-zinc-300' 
              : 'bg-white border-zinc-400 text-[#141311]'
          }`}>
            <span className="font-sans font-medium text-xs sm:text-[13px]">Total Units Added:</span>
            <span className="font-sans font-black text-xs sm:text-[13px] text-[#141311] dark:text-white">
              +{totalUnitsAdded} pairs
            </span>
          </div>
        </div>

        {/* Pill 3: Breakdown */}
        <div>
          <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border shadow-2xs ${
            isDark 
              ? 'bg-zinc-900 border-zinc-700 text-zinc-300' 
              : 'bg-white border-zinc-400 text-[#141311]'
          }`}>
            <span className="font-sans font-medium text-xs sm:text-[13px]">Breakdown:</span>
            <span className="font-sans font-black text-xs sm:text-[13px] text-[#141311] dark:text-white">
              {filteredSupplierCount} supplier + {filteredReplacedCount} replaced
            </span>
          </div>
        </div>
      </div>

      {/* 7. Empty State Box (with dashed border & stacked layers icon matching reference screenshot) */}
      {searchFiltered.length === 0 ? (
        <div className={`mt-5 rounded-[28px] sm:rounded-[32px] border border-dashed p-8 sm:p-10 flex flex-col items-center justify-center text-center transition-all ${
          isDark
            ? 'border-zinc-700 bg-zinc-900/40'
            : 'border-zinc-400 bg-[#FAF9F5]'
        }`}>
          {/* Stacked layers icon */}
          <div className="text-zinc-600 dark:text-zinc-400 mb-3 flex items-center justify-center">
            <Layers size={42} className="stroke-[1.8]" />
          </div>

          <h3 className="font-sans font-black text-sm uppercase tracking-wider text-[#141311] dark:text-white">
            NO ADDED STOCK RECORDS FOUND
          </h3>

          <p className="font-sans text-xs sm:text-[12.5px] text-zinc-600 dark:text-zinc-400 max-w-[280px] mt-2 leading-relaxed">
            There are no added stock invoices or restocked replaced pairs matching your filter & search query.
          </p>
        </div>
      ) : (
        /* List of inward records if present */
        <div className="mt-5 space-y-2.5">
          {searchFiltered.map((record, idx) => (
            <div
              key={`inward-rec-${record.id}-${idx}`}
              className={`rounded-2xl border-[1.5px] p-4 shadow-2xs flex flex-col justify-between gap-2.5 transition-all ${
                isDark 
                  ? 'bg-zinc-900 border-zinc-700 text-white' 
                  : 'bg-white border-zinc-300 text-[#141311]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-sans font-black text-xs sm:text-[13px] uppercase truncate text-[#141311] dark:text-white">
                    {record.title}
                  </div>
                  <div className="text-[11.5px] font-mono text-zinc-500 mt-0.5">
                    Source: {record.source}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 mt-1 line-clamp-1">
                    {record.itemsDetail}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60">
                    +{record.units} pairs
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 block mt-1">
                    {record.time}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10.5px] font-mono text-zinc-500">
                <span>Ref #{record.refId}</span>
                <span className="capitalize">{record.type} intake</span>
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
