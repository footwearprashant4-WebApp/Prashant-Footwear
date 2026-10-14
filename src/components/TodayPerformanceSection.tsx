import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, IndianRupee, ShoppingBag, Package, RotateCcw, 
  CreditCard, Smartphone, Coins, Calendar, ArrowRight, Printer, 
  Search, CheckCircle2, Clock, Filter, Eye, AlertCircle, FileText
} from 'lucide-react';
import { Order, Product, StockLedger } from '../types';

interface TodayPerformanceSectionProps {
  isDark: boolean;
  orders: Order[];
  products: Product[];
  stockLedgers: StockLedger[];
  onMakeBill: () => void;
  onViewAllInvoices?: () => void;
}

export const TodayPerformanceSection: React.FC<TodayPerformanceSectionProps> = ({
  isDark,
  orders,
  products,
  stockLedgers,
  onMakeBill,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'upi' | 'card'>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<Order | null>(null);

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const todayFormattedDate = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  // Filter orders created today
  const todayOrders = useMemo(() => {
    return (orders || []).filter(o => {
      if (!o.createdAt) return false;
      return o.createdAt.startsWith(todayStr);
    });
  }, [orders, todayStr]);

  // Today's returned / replaced orders
  const todayReturnedOrders = useMemo(() => {
    return (orders || []).filter(o => {
      const isToday = o.createdAt && o.createdAt.startsWith(todayStr);
      return isToday && ((o as any).isRefundOrder || (o as any).isExchangeOrder);
    });
  }, [orders, todayStr]);

  // Total gross & net sales
  const todayGrossSales = useMemo(() => {
    return todayOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [todayOrders]);

  const todayTotalUnits = useMemo(() => {
    return todayOrders.reduce((sum, o) => {
      return sum + (o.items || []).reduce((iSum, it) => iSum + (Number(it.quantity) || 1), 0);
    }, 0);
  }, [todayOrders]);

  const averageBillValue = useMemo(() => {
    if (todayOrders.length === 0) return 0;
    return Math.round(todayGrossSales / todayOrders.length);
  }, [todayGrossSales, todayOrders.length]);

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    let cash = 0;
    let upi = 0;
    let card = 0;

    todayOrders.forEach(o => {
      const pm = (o.paymentMethod || 'cash').toLowerCase();
      const amt = Number(o.totalAmount) || 0;
      if (pm.includes('upi') || pm.includes('qr') || pm.includes('gpay') || pm.includes('phonepe')) {
        upi += amt;
      } else if (pm.includes('card') || pm.includes('pos')) {
        card += amt;
      } else {
        cash += amt;
      }
    });

    const total = cash + upi + card || 1;

    return {
      cash: { amount: cash, percent: Math.round((cash / total) * 100) },
      upi: { amount: upi, percent: Math.round((upi / total) * 100) },
      card: { amount: card, percent: Math.round((card / total) * 100) },
      total: cash + upi + card
    };
  }, [todayOrders]);

  // Today's Stock Received
  const todayStockAdded = useMemo(() => {
    return (stockLedgers || []).filter(sl => sl.createdAt && sl.createdAt.startsWith(todayStr));
  }, [stockLedgers, todayStr]);

  const todayStockUnitsAdded = useMemo(() => {
    return todayStockAdded.reduce((sum, sl) => sum + (Number(sl.totalUnits) || 0), 0);
  }, [todayStockAdded]);

  // Filtered orders list
  const filteredTodayOrders = useMemo(() => {
    return todayOrders.filter(o => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        o.id.toLowerCase().includes(q) || 
        (o.customerMobile && o.customerMobile.includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q));
      
      const pm = (o.paymentMethod || 'cash').toLowerCase();
      let matchesPayment = true;
      if (paymentFilter === 'cash') matchesPayment = !pm.includes('upi') && !pm.includes('card');
      else if (paymentFilter === 'upi') matchesPayment = pm.includes('upi') || pm.includes('qr');
      else if (paymentFilter === 'card') matchesPayment = pm.includes('card');

      return matchesSearch && matchesPayment;
    });
  }, [todayOrders, searchQuery, paymentFilter]);

  return (
    <div id="today-performance-section" className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Banner & Date Bar */}
      <div className={`p-6 md:p-8 rounded-3xl border transition-all duration-300 shadow-xl ${
        isDark 
          ? 'bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border-zinc-800 text-white' 
          : 'bg-gradient-to-br from-white via-[#FAF7F2] to-amber-50/40 border-[#E8DFC2] text-zinc-900 shadow-amber-900/5'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200/40 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Store Shift
              </span>
              <span className="text-xs font-mono text-zinc-500 flex items-center gap-1">
                <Calendar size={13} />
                {todayFormattedDate}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight font-display">
              Today's Performance & Sales
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Real-time transaction intelligence, collection breakdown, and store counter billing.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="today-make-bill-btn"
              type="button"
              onClick={onMakeBill}
              className="px-5 py-3 rounded-2xl bg-[#C5A059] hover:bg-[#b08e4d] text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-[#C5A059]/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <ShoppingBag size={16} className="stroke-[2.5px]" />
              <span>+ Make New Bill</span>
            </button>
          </div>
        </div>

        {/* 4 Core Summary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-6">
          {/* Revenue */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${
            isDark ? 'bg-zinc-950/60 border-zinc-800/80' : 'bg-white border-zinc-200/80 shadow-xs'
          }`}>
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider font-mono">Today's Revenue</span>
              <div className="p-1.5 rounded-lg bg-[#C5A059]/15 text-[#C5A059]">
                <IndianRupee size={14} className="stroke-[2.5px]" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-[#C5A059]">
              ₹{todayGrossSales.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1 font-mono">
              <span>{todayOrders.length} bills generated</span>
            </div>
          </div>

          {/* Units Sold */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${
            isDark ? 'bg-zinc-950/60 border-zinc-800/80' : 'bg-white border-zinc-200/80 shadow-xs'
          }`}>
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider font-mono">Pairs Sold</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500">
                <TrendingUp size={14} className="stroke-[2.5px]" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-emerald-500">
              {todayTotalUnits} <span className="text-xs sm:text-sm font-bold">Pairs</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1 font-mono">
              <span>Avg ₹{averageBillValue} / bill</span>
            </div>
          </div>

          {/* Stock Ingested */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${
            isDark ? 'bg-zinc-950/60 border-zinc-800/80' : 'bg-white border-zinc-200/80 shadow-xs'
          }`}>
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider font-mono">Stock Inflow</span>
              <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-500">
                <Package size={14} className="stroke-[2.5px]" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-indigo-500">
              +{todayStockUnitsAdded} <span className="text-xs sm:text-sm font-bold">Pairs</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1 font-mono">
              <span>{todayStockAdded.length} purchase ledgers</span>
            </div>
          </div>

          {/* Returns & Exchanges */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${
            isDark ? 'bg-zinc-950/60 border-zinc-800/80' : 'bg-white border-zinc-200/80 shadow-xs'
          }`}>
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider font-mono">Returns / Exch.</span>
              <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-500">
                <RotateCcw size={14} className="stroke-[2.5px]" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-rose-500">
              {todayReturnedOrders.length}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1 font-mono">
              <span>Store counter adjustments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modes Split */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 ${
        isDark ? 'bg-zinc-900/60 border-zinc-800 text-white shadow-xl' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
      }`}>
        <h3 className="text-sm font-black uppercase tracking-wider font-display mb-4 flex items-center gap-2">
          <Coins size={16} className="text-[#C5A059]" />
          <span>Payment Collection Split</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Cash */}
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500 mb-1">
              <span className="flex items-center gap-1.5">
                <Coins size={14} className="text-emerald-500" />
                CASH COLLECTION
              </span>
              <span className="font-mono text-emerald-500">{paymentBreakdown.cash.percent}%</span>
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-500">
              ₹{paymentBreakdown.cash.amount.toLocaleString('en-IN')}
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${paymentBreakdown.cash.percent}%` }} />
            </div>
          </div>

          {/* UPI */}
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500 mb-1">
              <span className="flex items-center gap-1.5">
                <Smartphone size={14} className="text-indigo-500" />
                UPI & QR CODE
              </span>
              <span className="font-mono text-indigo-500">{paymentBreakdown.upi.percent}%</span>
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-indigo-500">
              ₹{paymentBreakdown.upi.amount.toLocaleString('en-IN')}
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${paymentBreakdown.upi.percent}%` }} />
            </div>
          </div>

          {/* Card */}
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500 mb-1">
              <span className="flex items-center gap-1.5">
                <CreditCard size={14} className="text-amber-500" />
                CARD / POS
              </span>
              <span className="font-mono text-amber-500">{paymentBreakdown.card.percent}%</span>
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-amber-500">
              ₹{paymentBreakdown.card.amount.toLocaleString('en-IN')}
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${paymentBreakdown.card.percent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Transactions & Invoices List */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 space-y-5 ${
        isDark ? 'bg-zinc-900/60 border-zinc-800 text-white shadow-xl' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider font-display flex items-center gap-2">
              <FileText size={16} className="text-[#C5A059]" />
              <span>Today's Bills & Invoices</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30">
                {filteredTodayOrders.length} Bills
              </span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Click any transaction to view and print invoice receipt.</p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Bill / Mobile..."
                className={`pl-8 pr-3 py-1.5 rounded-xl text-xs border outline-none font-mono transition-all ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white focus:border-[#C5A059]' : 'bg-slate-50 border-zinc-200 text-zinc-900 focus:border-[#C5A059]'
                }`}
              />
            </div>

            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
              {(['all', 'cash', 'upi', 'card'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentFilter(mode)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                    paymentFilter === mode
                      ? 'bg-[#C5A059] text-zinc-950 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        {filteredTodayOrders.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
              <ShoppingBag size={20} />
            </div>
            <p className="text-xs font-mono text-zinc-500">No transactions recorded for today yet.</p>
            <button
              type="button"
              onClick={onMakeBill}
              className="px-4 py-2 rounded-xl bg-[#C5A059] text-zinc-950 font-bold text-xs uppercase font-mono shadow-sm cursor-pointer hover:bg-[#b08e4d]"
            >
              Start Billing
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className={`border-b text-[10px] uppercase font-black tracking-wider ${
                  isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-500'
                }`}>
                  <th className="pb-3 px-2">Bill ID</th>
                  <th className="pb-3 px-2">Time</th>
                  <th className="pb-3 px-2">Customer</th>
                  <th className="pb-3 px-2">Items</th>
                  <th className="pb-3 px-2">Payment</th>
                  <th className="pb-3 px-2 text-right">Amount</th>
                  <th className="pb-3 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                {filteredTodayOrders.map((order) => {
                  const timeStr = order.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--:--';
                  const totalItems = (order.items || []).reduce((s, it) => s + (it.quantity || 1), 0);
                  const isRefund = (order as any).isRefundOrder;
                  const isExchange = (order as any).isExchangeOrder;

                  return (
                    <tr 
                      key={order.id}
                      className={`transition-colors hover:bg-[#C5A059]/5 ${
                        isDark ? 'text-zinc-200' : 'text-zinc-800'
                      }`}
                    >
                      <td className="py-3 px-2 font-bold text-[#C5A059]">
                        #{order.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 px-2 text-zinc-500">
                        {timeStr}
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <span className="font-sans font-bold block">{order.customerName || 'Walk-in Retail Customer'}</span>
                          <span className="text-[10px] text-zinc-500">{order.customerMobile || '+91 - Store Sale'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-bold text-[10px]">
                          {totalItems} {totalItems === 1 ? 'pair' : 'pairs'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          (order.paymentMethod || 'cash').toLowerCase().includes('upi')
                            ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                            : (order.paymentMethod || 'cash').toLowerCase().includes('card')
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        }`}>
                          {order.paymentMethod || 'CASH'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-sm">
                        ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(order)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold uppercase transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-3xl p-6 max-w-lg w-full shadow-2xl relative flex flex-col max-h-[90vh] ${
            isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-100' : 'bg-white border border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#C5A059]/15 text-[#C5A059]">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase font-display">Invoice Receipt</h4>
                  <p className="text-[10px] font-mono text-zinc-500">#{selectedReceipt.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-4 text-xs font-mono flex-1">
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Customer:</span>
                  <span className="font-bold font-sans">{selectedReceipt.customerName || 'Walk-in Retail'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Mobile:</span>
                  <span className="font-bold">{selectedReceipt.customerMobile || '+91 -'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Date & Time:</span>
                  <span>{new Date(selectedReceipt.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Payment:</span>
                  <span className="font-bold text-[#C5A059] uppercase">{selectedReceipt.paymentMethod}</span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-zinc-500 block">Purchased Articles:</span>
                {(selectedReceipt.items || []).map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                    <div>
                      <div className="font-bold font-sans">{it.name}</div>
                      <div className="text-[10px] text-zinc-500">Size: {it.size} | Qty: {it.quantity}</div>
                    </div>
                    <div className="font-bold text-sm">₹{it.price * it.quantity}</div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-base font-black">
                <span>TOTAL AMOUNT:</span>
                <span className="text-[#C5A059]">₹{selectedReceipt.totalAmount}</span>
              </div>
            </div>

            <div className="pt-4 flex gap-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-[#C5A059]/15 hover:bg-[#C5A059]/25 text-[#C5A059] font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Bill</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#b08e4d] text-zinc-950 font-bold text-xs uppercase cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
