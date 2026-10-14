import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, TrendingUp, Calendar, Search, ChevronDown, 
  Receipt, Printer, Phone, User, CheckCircle2, Clock, 
  Eye, X, Banknote, QrCode
} from 'lucide-react';
import { Order } from '../types';
import { formatInvoiceNumber } from './BillingDeskSection';

export interface AdminTodayInvoicesViewProps {
  isDark: boolean;
  orders: Order[];
  onBackToSummary: () => void;
  onNavigate?: (tabId: string) => void;
}

export const AdminTodayInvoicesView: React.FC<AdminTodayInvoicesViewProps> = ({
  isDark,
  orders = [],
  onBackToSummary,
  onNavigate
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

  // Filter orders created today
  const todayOrders = useMemo(() => {
    return (orders || []).filter(o => o.createdAt && o.createdAt.startsWith(todayStr));
  }, [orders, todayStr]);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'upi' | 'card'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'pos' | 'wholesale' | 'store'>('all');

  // Selected invoice for preview / printing
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Order | null>(null);

  // Filtered orders list
  const filteredInvoices = useMemo(() => {
    return todayOrders.filter(inv => {
      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const idMatch = inv.id.toLowerCase().includes(q);
        const nameMatch = (inv.customerName || '').toLowerCase().includes(q);
        const phoneMatch = (inv.customerMobile || '').includes(q);
        if (!idMatch && !nameMatch && !phoneMatch) return false;
      }

      // Payment filter
      if (paymentFilter !== 'all') {
        const pm = (inv.paymentMethod || '').toLowerCase();
        if (paymentFilter === 'cash' && !pm.includes('cash')) return false;
        if (paymentFilter === 'upi' && !pm.includes('upi') && !pm.includes('qr')) return false;
        if (paymentFilter === 'card' && !pm.includes('card')) return false;
      }

      return true;
    });
  }, [todayOrders, searchQuery, paymentFilter, typeFilter]);

  const handlePrint = (order: Order) => {
    setSelectedInvoiceForPrint(order);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <div className="w-full max-w-[420px] mx-auto pb-24 px-3 sm:px-4 font-sans select-none">
      
      {/* 1. Header Card: TODAY'S PERFORMANCE (matching exact reference screenshot) */}
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

      {/* 2. Sub-Header: Back Arrow + INVOICES GENERATED TODAY */}
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
          <h2 className="font-sans font-black text-base sm:text-[17px] uppercase tracking-tight text-[#141311] dark:text-white leading-tight">
            INVOICES GENERATED TODAY
          </h2>

          {/* Invoices Count Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border border-[#DFD1AB] dark:border-zinc-700 bg-[#FBF7EC] dark:bg-zinc-800 mt-1.5">
            <Banknote size={13} className="text-[#BFA05D]" />
            <span className="font-mono font-bold text-xs text-[#141311] dark:text-zinc-200">
              {todayOrders.length} Invoices
            </span>
          </div>

          {/* Subtitle */}
          <p className="font-mono text-[11.5px] sm:text-[12px] text-zinc-600 dark:text-zinc-400 mt-1 leading-snug">
            Manage, search, or print thermal invoice records.
          </p>
        </div>
      </div>

      {/* 3. TOTAL INVOICES TODAY: 0 Card */}
      <div className={`mt-5 rounded-2xl border-[1.5px] py-2.5 px-4 shadow-2xs ${
        isDark 
          ? 'bg-zinc-900 border-zinc-700' 
          : 'bg-white border-[#141311]'
      }`}>
        <div className="font-mono font-black text-xs sm:text-[13px] tracking-wide uppercase text-[#141311] dark:text-white">
          TOTAL INVOICES TODAY: {todayOrders.length}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-zinc-300 dark:bg-zinc-800 my-4" />

      {/* 4. Filter & Search Controls */}
      <div className="space-y-2.5">
        {/* Search Input */}
        <div className={`rounded-2xl border-[1.5px] px-3.5 py-2.5 flex items-center gap-2.5 ${
          isDark 
            ? 'bg-zinc-900 border-zinc-700 text-white' 
            : 'bg-[#FAF8F5] border-[#DFD1AB] text-[#141311]'
        }`}>
          <Search size={16} className="text-zinc-500 dark:text-zinc-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Invoice #, Client Name, Mo"
            className="bg-transparent border-none outline-none w-full font-mono text-xs sm:text-[13px] text-[#141311] dark:text-white placeholder:text-zinc-400"
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

        {/* Payment Filter Dropdown */}
        <div className="relative">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className={`w-full rounded-2xl border-[1.5px] px-4 py-2.5 appearance-none font-mono text-xs sm:text-[13px] font-bold cursor-pointer outline-none ${
              isDark 
                ? 'bg-zinc-900 border-zinc-700 text-white' 
                : 'bg-white border-[#DFD1AB] text-[#141311]'
            }`}
          >
            <option value="all">All Payments</option>
            <option value="cash">Cash Register</option>
            <option value="upi">UPI Transfer</option>
            <option value="card">Card / POS</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
            <ChevronDown size={16} />
          </div>
        </div>

        {/* Invoice Types Filter Dropdown */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className={`w-full rounded-2xl border-[1.5px] px-4 py-2.5 appearance-none font-mono text-xs sm:text-[13px] font-bold cursor-pointer outline-none ${
              isDark 
                ? 'bg-zinc-900 border-zinc-700 text-white' 
                : 'bg-white border-[#DFD1AB] text-[#141311]'
            }`}
          >
            <option value="all">All Invoice Types</option>
            <option value="pos">Retail POS Desk</option>
            <option value="wholesale">Wholesale Demand</option>
            <option value="store">Storefront Orders</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* 5. Invoices List or Exact Reference Empty State */}
      <div className="mt-4">
        {filteredInvoices.length === 0 ? (
          /* Exact matching dashed box empty state */
          <div className={`rounded-[28px] sm:rounded-[32px] border-2 border-dashed p-10 sm:p-12 flex flex-col items-center justify-center text-center transition-all min-h-[220px] ${
            isDark 
              ? 'border-zinc-700 bg-zinc-900/30' 
              : 'border-zinc-300 bg-white/50'
          }`}>
            {/* Styled receipt icon with currency symbol matching reference */}
            <div className="w-14 h-16 flex items-center justify-center text-zinc-300 dark:text-zinc-600 mb-2">
              <svg width="44" height="50" viewBox="0 0 48 54" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-zinc-300 dark:stroke-zinc-600">
                <path d="M6 5C6 4.44772 6.44772 4 7 4H41C41.5523 4 42 4.44772 42 5V48L38 45L34 48L30 45L26 48L22 45L18 48L14 45L10 48L6 45V5Z" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                <path d="M24 15V37M18 20.5C18 18.5 20.2 17 24 17C27.8 17 30 18.5 30 21.2C30 24.5 18 24 18 28.5C18 32 20.5 33 24 33C27.5 33 30 31.5 30 29" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <p className="font-mono text-xs sm:text-[13px] font-bold text-[#141311] dark:text-zinc-300 leading-snug max-w-[260px]">
              No matching today's invoices found.
            </p>
          </div>
        ) : (
          /* List of invoices when orders exist */
          <div className="space-y-3">
            {filteredInvoices.map((inv) => {
              const timeStr = inv.createdAt 
                ? new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Today';
              const itemCount = (inv.items || []).reduce((s, i) => s + (Number(i.quantity) || 1), 0);
              const pm = (inv.paymentMethod || 'CASH').toUpperCase();

              return (
                <div
                  key={inv.id}
                  className={`rounded-2xl border-[1.5px] p-4 transition-all ${
                    isDark 
                      ? 'bg-zinc-900 border-zinc-700' 
                      : 'bg-white border-[#141311]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs sm:text-sm text-[#141311] dark:text-white">
                          {formatInvoiceNumber(inv.id, inv.createdAt)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {inv.status || 'Completed'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 mt-1">
                        <Clock size={12} />
                        <span>{timeStr}</span>
                        <span>•</span>
                        <span>{itemCount} pair{itemCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-sm sm:text-base text-[#141311] dark:text-white block">
                        ₹{(Number(inv.totalAmount) || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="inline-block text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-[#FAF5E6] text-[#BFA05D] border border-[#DFD1AB] mt-0.5">
                        {pm}
                      </span>
                    </div>
                  </div>

                  {/* Customer info */}
                  {(inv.customerName || inv.customerMobile) && (
                    <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-600 dark:text-zinc-400">
                      <span className="truncate">{inv.customerName || 'Walk-in Customer'}</span>
                      <span className="shrink-0">{inv.customerMobile || ''}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePrint(inv)}
                      className="flex-1 py-1.5 px-3 rounded-xl border border-[#141311] dark:border-zinc-700 bg-[#FAF7F0] dark:bg-zinc-800 text-[#141311] dark:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Printer size={13} />
                      <span>Print Thermal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceForPrint(inv)}
                      className="py-1.5 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-bold cursor-pointer active:scale-95"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-zinc-300 dark:bg-zinc-800 my-6" />

      {/* 6. BACK TO SUMMARY Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onBackToSummary}
          className={`px-6 py-3 rounded-2xl border-[1.5px] font-mono font-black text-xs uppercase tracking-wider shadow-2xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer ${
            isDark
              ? 'bg-zinc-900 border-zinc-700 text-zinc-100 hover:bg-zinc-800'
              : 'bg-white border-[#141311] text-[#141311] hover:bg-zinc-50'
          }`}
        >
          <ArrowLeft size={14} className="stroke-[2.5]" />
          <span>BACK TO SUMMARY</span>
        </button>
      </div>

      {/* Thermal Invoice Modal */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-zinc-950 w-full max-w-sm rounded-2xl shadow-2xl p-5 border border-zinc-200 font-mono text-xs">
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <span className="font-bold text-sm">Thermal Invoice Preview</span>
              <button 
                type="button"
                onClick={() => setSelectedInvoiceForPrint(null)}
                className="p-1 hover:bg-zinc-100 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-center py-2">
              <div className="font-black text-base font-serif">PRASHANT FOOTWEAR</div>
              <div className="text-[11px] text-zinc-500">Retail & Wholesale Footwear</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">GST: 27AABCP1234F1Z5</div>
            </div>

            <div className="border-t border-b border-dashed py-2 my-2 space-y-1">
              <div className="flex justify-between">
                <span>Invoice:</span>
                <span className="font-bold font-mono">{formatInvoiceNumber(selectedInvoiceForPrint.id, selectedInvoiceForPrint.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{selectedInvoiceForPrint.createdAt ? new Date(selectedInvoiceForPrint.createdAt).toLocaleDateString() : 'Today'}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{selectedInvoiceForPrint.customerName || 'Walk-in'}</span>
              </div>
              {selectedInvoiceForPrint.customerMobile && (
                <div className="flex justify-between">
                  <span>Mobile:</span>
                  <span>{selectedInvoiceForPrint.customerMobile}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5 my-2">
              {(selectedInvoiceForPrint.items || []).map((it, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span className="truncate pr-2">{it.name || `Article ${it.productId}`} (Sz {it.size || 7}) x{it.quantity}</span>
                  <span className="font-bold">₹{((Number(it.price) || 0) * (Number(it.quantity) || 1)).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed pt-2 mt-2 space-y-1 font-bold">
              <div className="flex justify-between text-sm">
                <span>TOTAL AMOUNT:</span>
                <span>₹{(Number(selectedInvoiceForPrint.totalAmount) || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>Payment Mode:</span>
                <span className="uppercase">{selectedInvoiceForPrint.paymentMethod || 'CASH'}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-zinc-400 mt-4 pt-2 border-t">
              Thank you for shopping with us!
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-[#C5A059] text-zinc-950 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Bill</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedInvoiceForPrint(null)}
                className="py-2.5 px-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
