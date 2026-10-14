import React, { useState, useMemo } from 'react';
import { 
  BarChart3, ShoppingBag, RotateCcw, PackageCheck, PieChart, 
  CreditCard, Truck, ArrowLeft, Download, FileSpreadsheet, 
  Printer, Search, X, ChevronRight, Filter, Calendar, 
  Sparkles, CheckCircle2, TrendingUp, DollarSign, Layers,
  Receipt, User, Phone, Check, RefreshCw
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product, Order, StockLedger } from '../types';

export interface ReportsAnalyticalSectionProps {
  isDark: boolean;
  orders: Order[];
  products: Product[];
  stockLedgers?: StockLedger[];
  orderInvoices?: any[];
  onBackToHome?: () => void;
  onNavigate?: (tabId: string) => void;
}

type ReportDrawerType = 
  | 'none' 
  | 'product_analytics' 
  | 'returns_ledger' 
  | 'inventory_tracker' 
  | 'category_split' 
  | 'payment_settlements' 
  | 'wholesale_intel';

export const ReportsAnalyticalSection: React.FC<ReportsAnalyticalSectionProps> = ({
  isDark,
  orders = [],
  products = [],
  stockLedgers = [],
  orderInvoices = [],
  onBackToHome,
  onNavigate
}) => {
  // Timeframe filter state for analytical reports
  const [selectedTimeframe, setSelectedTimeframe] = useState<'MONTHLY' | 'WEEKLY' | 'DAILY' | 'ALL'>('MONTHLY');
  const [activeReportDrawer, setActiveReportDrawer] = useState<ReportDrawerType>('none');
  const [drawerSearch, setDrawerSearch] = useState<string>('');
  const [drawerCategoryFilter, setDrawerCategoryFilter] = useState<string>('all');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Computations for analytical metrics
  const analyticsData = useMemo(() => {
    // Non-refund standard completed orders
    const validOrders = orders.filter(o => {
      const pm = String(o.paymentMethod || '').toUpperCase();
      const id = String(o.id || '').toUpperCase();
      const isRet = id.startsWith('RF-') || id.startsWith('RET-') || id.startsWith('REFUND-') || pm.includes('REFUND');
      return !isRet;
    });

    const refundOrders = orders.filter(o => {
      const pm = String(o.paymentMethod || '').toUpperCase();
      const id = String(o.id || '').toUpperCase();
      return id.startsWith('RF-') || id.startsWith('RET-') || id.startsWith('REFUND-') || pm.includes('REFUND') || (o.totalAmount && o.totalAmount < 0);
    });

    // Total gross sales revenue
    const totalSalesVolume = validOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const totalRefundVolume = refundOrders.reduce((sum, o) => sum + Math.abs(Number(o.totalAmount) || 0), 0);

    // Footwear items sold breakdown
    const itemsMap = new Map<string, {
      name: string;
      brand: string;
      category: string;
      subCategory: string;
      size: string;
      quantity: number;
      revenue: number;
    }>();

    validOrders.forEach(ord => {
      (ord.items || []).forEach(it => {
        const prodMatch = products.find(p => p.id === it.productId);
        const brandName = prodMatch?.brand || (it as any).brand || 'Prashant Collection';
        const key = `${it.name}_${brandName}_${it.size || ''}`;
        const existing = itemsMap.get(key);
        const qty = Number(it.quantity) || 1;
        const rev = (Number(it.price) || 0) * qty;

        if (existing) {
          existing.quantity += qty;
          existing.revenue += rev;
        } else {
          itemsMap.set(key, {
            name: it.name,
            brand: brandName,
            category: it.category || 'Footwear',
            subCategory: it.subCategory || 'General',
            size: String(it.size || '7'),
            quantity: qty,
            revenue: rev
          });
        }
      });
    });

    const productList = Array.from(itemsMap.values()).sort((a, b) => b.quantity - a.quantity);
    const totalPairsSold = productList.reduce((sum, p) => sum + p.quantity, 0);

    // Category Splits
    let menRev = 0, menQty = 0;
    let womenRev = 0, womenQty = 0;
    let kidsRev = 0, kidsQty = 0;

    validOrders.forEach(ord => {
      (ord.items || []).forEach(it => {
        const c = String(it.category || '').toLowerCase();
        const rev = (Number(it.price) || 0) * (Number(it.quantity) || 1);
        const qty = Number(it.quantity) || 1;
        if (c.includes('women')) {
          womenRev += rev;
          womenQty += qty;
        } else if (c.includes('kid')) {
          kidsRev += rev;
          kidsQty += qty;
        } else {
          menRev += rev;
          menQty += qty;
        }
      });
    });

    // Payment modes breakdown
    let upiRev = 0, upiCount = 0;
    let cashRev = 0, cashCount = 0;
    let cardRev = 0, cardCount = 0;

    validOrders.forEach(o => {
      const pm = String(o.paymentMethod || '').toLowerCase();
      const amt = Number(o.totalAmount) || 0;
      if (pm.includes('upi') || pm.includes('qr') || pm.includes('online')) {
        upiRev += amt;
        upiCount++;
      } else if (pm.includes('card')) {
        cardRev += amt;
        cardCount++;
      } else {
        cashRev += amt;
        cashCount++;
      }
    });

    // Stock Inward
    const inwardLedgers = stockLedgers || [];
    const totalInwardPairs = inwardLedgers.reduce((sum, l) => {
      if (l.totalUnits) return sum + Number(l.totalUnits);
      if (l.items) return sum + l.items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);
      return sum;
    }, 0);

    return {
      validOrders,
      refundOrders,
      totalSalesVolume,
      totalRefundVolume,
      productList,
      totalPairsSold,
      categorySplit: {
        men: { rev: menRev, qty: menQty },
        women: { rev: womenRev, qty: womenQty },
        kids: { rev: kidsRev, qty: kidsQty }
      },
      paymentBreakdown: {
        upi: { rev: upiRev, count: upiCount },
        cash: { rev: cashRev, count: cashCount },
        card: { rev: cardRev, count: cardCount }
      },
      inwardLedgers,
      totalInwardPairs
    };
  }, [orders, products, stockLedgers]);

  // Export functions
  const handleExportPdf = () => {
    setIsExportingPdf(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('PRASHANT FOOTWEAR - REPORTS & ANALYTICAL AUDIT', 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()} | Period: ${selectedTimeframe}`, 14, 28);

      const tableData = analyticsData.productList.slice(0, 25).map(p => [
        p.name,
        p.brand,
        p.category,
        `UK ${p.size}`,
        `${p.quantity} pairs`,
        `₹${p.revenue.toLocaleString('en-IN')}`
      ]);

      autoTable(doc, {
        startY: 34,
        head: [['Article Name', 'Brand', 'Category', 'Size', 'Units Sold', 'Total Revenue']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [194, 157, 89] }
      });

      doc.save(`Prashant_Footwear_Reports_Analytical_${Date.now()}.pdf`);
    } catch (err) {
      console.error('Failed to export analytical report PDF', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportCsv = () => {
    const headers = ['Article Name,Brand,Category,Size,Quantity Sold,Revenue'];
    const rows = analyticsData.productList.map(p => 
      `"${p.name}","${p.brand}","${p.category}","UK ${p.size}",${p.quantity},${p.revenue}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `analytical_reports_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-12 font-sans animate-fade-in">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className={`p-2.5 rounded-2xl border flex items-center gap-2 text-xs font-black uppercase tracking-wider active:scale-95 transition-all cursor-pointer ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'bg-[#FCFAF6] border-[#E8E2D5] text-[#2B2720] hover:bg-[#F5EEDB]'
              }`}
            >
              <ArrowLeft size={16} />
              <span>Admin Home</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                AUDIT &amp; ANALYTICAL INTELLIGENCE
              </span>
              <span className="text-[10px] font-mono text-[#8C764D]">
                • Independent Analytics Desk
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-950 dark:text-white mt-1">
              REPORTS &amp; ANALYTICAL
            </h1>
          </div>
        </div>

        {/* Timeframe & Export Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`p-1 rounded-2xl border flex items-center gap-1 ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-[#EFEBE1] border-[#DFD8CB]'
          }`}>
            {(['MONTHLY', 'WEEKLY', 'DAILY', 'ALL'] as const).map(tf => (
              <button
                key={tf}
                type="button"
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedTimeframe === tf 
                    ? 'bg-[#C29D59] text-white shadow-xs' 
                    : 'text-[#6E6657] dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-3 py-2 rounded-xl bg-[#C29D59] hover:bg-[#B58E48] text-white text-xs font-bold uppercase flex items-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            {isExportingPdf ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
            <span>Export PDF</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className={`px-3 py-2 rounded-xl border text-xs font-bold uppercase flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-[#E0D8CB] text-zinc-800'
            }`}
          >
            <FileSpreadsheet size={13} />
            <span>CSV</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className={`p-2 rounded-xl border text-xs font-bold uppercase flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-[#E0D8CB] text-zinc-800'
            }`}
            title="Print Full Report"
          >
            <Printer size={15} />
          </button>
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-4 rounded-3xl border shadow-xs ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-[#FCFAF6] border-[#EBE6DC]'
        }`}>
          <div className="flex items-center justify-between text-[#7A7264] text-[10.5px] font-bold uppercase">
            <span>Footwear Cataloged</span>
            <ShoppingBag size={14} className="text-[#C29D59]" />
          </div>
          <div className="text-2xl font-black text-zinc-950 dark:text-white mt-1">
            {products.length} <span className="text-xs font-medium text-[#7A7264]">Models</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1">
            {analyticsData.productList.length} Active Best-Sellers
          </div>
        </div>

        <div className={`p-4 rounded-3xl border shadow-xs ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-[#FCFAF6] border-[#EBE6DC]'
        }`}>
          <div className="flex items-center justify-between text-[#7A7264] text-[10.5px] font-bold uppercase">
            <span>Pairs Dispatched</span>
            <TrendingUp size={14} className="text-[#2EA46F]" />
          </div>
          <div className="text-2xl font-black text-[#2EA46F] mt-1">
            {analyticsData.totalPairsSold} <span className="text-xs font-medium text-[#7A7264]">Pairs</span>
          </div>
          <div className="text-[10px] text-[#7A7264] mt-1">
            Across {analyticsData.validOrders.length} Invoices
          </div>
        </div>

        <div className={`p-4 rounded-3xl border shadow-xs ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-[#FCFAF6] border-[#EBE6DC]'
        }`}>
          <div className="flex items-center justify-between text-[#7A7264] text-[10.5px] font-bold uppercase">
            <span>Returns / Refunds</span>
            <RotateCcw size={14} className="text-[#E54868]" />
          </div>
          <div className="text-2xl font-black text-[#E54868] mt-1">
            ₹{analyticsData.totalRefundVolume.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-[#7A7264] mt-1">
            {analyticsData.refundOrders.length} Logged Audit Claims
          </div>
        </div>

        <div className={`p-4 rounded-3xl border shadow-xs ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-[#FCFAF6] border-[#EBE6DC]'
        }`}>
          <div className="flex items-center justify-between text-[#7A7264] text-[10.5px] font-bold uppercase">
            <span>Stock Inward Batch</span>
            <PackageCheck size={14} className="text-[#3B72D9]" />
          </div>
          <div className="text-2xl font-black text-[#3B72D9] mt-1">
            +{analyticsData.totalInwardPairs} <span className="text-xs font-medium text-[#7A7264]">Pairs</span>
          </div>
          <div className="text-[10px] text-[#7A7264] mt-1">
            {analyticsData.inwardLedgers.length} Supplier Ledgers
          </div>
        </div>
      </div>

      {/* Section Sub-heading matching reference design */}
      <div className="pt-2">
        <div className="flex items-center gap-2 px-1">
          <div className="w-2 h-2 rounded-full bg-[#C29D59]" />
          <span className="text-xs font-black tracking-widest uppercase text-[#524B3E] dark:text-zinc-300">
            BUSINESS REPORTS &amp; DETAILED AUDIT DRAWERS
          </span>
          <span className="text-[10px] text-[#8C764D] hidden sm:inline">
            (Tap any report card to open full interactive drawer)
          </span>
        </div>
      </div>

      {/* 5-Card Analytical Grid (Purely analytical, no duplicate Sales Analytics Engine) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        
        {/* CARD 1: Product & Footwear Analytics */}
        <div 
          onClick={() => {
            setDrawerSearch('');
            setDrawerCategoryFilter('all');
            setActiveReportDrawer('product_analytics');
          }}
          className={`rounded-[28px] p-5 border shadow-xs transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between ${
            isDark ? 'bg-zinc-900 border-zinc-800 hover:border-amber-500/50' : 'bg-[#FCFAF6] border-[#EBE6DC] hover:border-[#C29D59] hover:bg-[#FAF6EE]'
          }`}
        >
          <div>
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <ShoppingBag size={20} />
              </div>
              <span className="text-[9.5px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-[#7A7264] dark:text-zinc-400">
                INVENTORY MOVEMENT
              </span>
            </div>

            <div className="mt-3.5">
              <h3 className="text-sm font-black uppercase tracking-tight text-zinc-950 dark:text-white">
                Product &amp; Footwear Analytics
              </h3>
              <p className="text-[11px] text-[#7A7264] dark:text-zinc-400 mt-1 leading-snug">
                Article code sales velocity, bestselling shoes, UK size distribution, and stock turnover.
              </p>
            </div>

            <div className="my-3 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-[#ECE5D8] dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[9.5px] uppercase font-bold text-[#7A7264] block">Bestsellers Tracked</span>
                <span className="text-base font-black text-zinc-900 dark:text-white">{analyticsData.productList.length} Articles</span>
              </div>
              <div className="text-right">
                <span className="text-[9.5px] uppercase font-bold text-[#7A7264] block">Sold Volume</span>
                <span className="text-base font-black text-[#2EA46F]">{analyticsData.totalPairsSold} Pairs</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-dashed border-[#ECE5D8] dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-[#C29D59] group-hover:translate-x-0.5 transition-transform">
            <span>OPEN DETAILED DRAWER</span>
            <ChevronRight size={15} />
          </div>
        </div>

        {/* CARD 2: Returns & Refunds Audit Ledger */}
        <div 
          onClick={() => {
            setDrawerSearch('');
            setActiveReportDrawer('returns_ledger');
          }}
          className={`rounded-[28px] p-5 border shadow-xs transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between ${
            isDark ? 'bg-zinc-900 border-zinc-800 hover:border-rose-500/50' : 'bg-[#FCFAF6] border-[#EBE6DC] hover:border-[#E54868] hover:bg-[#FAF0F2]'
          }`}
        >
          <div>
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                <RotateCcw size={20} />
              </div>
              <span className="text-[9.5px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600">
                AUDIT LOGS
              </span>
            </div>

            <div className="mt-3.5">
              <h3 className="text-sm font-black uppercase tracking-tight text-zinc-950 dark:text-white">
                Returns &amp; Refunds Ledger
              </h3>
              <p className="text-[11px] text-[#7A7264] dark:text-zinc-400 mt-1 leading-snug">
                Customer size exchanges, damaged returns audit, credit note logs, and refund reconciliations.
              </p>
            </div>

            <div className="my-3 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-[#ECE5D8] dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[9.5px] uppercase font-bold text-[#7A7264] block">Refund Volume</span>
                <span className="text-base font-black text-rose-600">₹{analyticsData.totalRefundVolume.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-right">
                <span className="text-[9.5px] uppercase font-bold text-[#7A7264] block">Return Orders</span>
                <span className="text-base font-black text-zinc-900 dark:text-white">{analyticsData.refundOrders.length} Invoices</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-dashed border-[#ECE5D8] dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-rose-600 group-hover:translate-x-0.5 transition-transform">
            <span>VIEW RETURN LEDGER</span>
            <ChevronRight size={15} />
          </div>
        </div>

        {/* CARD 3: Inventory & Stock Inward Tracker */}
        <div 
          onClick={() => {
            setDrawerSearch('');
            setActiveReportDrawer('inventory_tracker');
          }}
          className={`rounded-[28px] p-5 border shadow-xs transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between ${
            isDark ? 'bg-zinc-900 border-zinc-800 hover:border-blue-500/50' : 'bg-[#FCFAF6] border-[#EBE6DC] hover:border-[#3B72D9] hover:bg-[#EEF4FD]'
          }`}
        >
          <div>
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                <PackageCheck size={20} />
              </div>
              <span className="text-[9.5px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                INWARD LOGS
              </span>
            </div>

            <div className="mt-3.5">
              <h3 className="text-sm font-black uppercase tracking-tight text-zinc-950 dark:text-white">
                Inventory &amp; Stock Inward Tracker
              </h3>
              <p className="text-[11px] text-[#7A7264] dark:text-zinc-400 mt-1 leading-snug">
                Supplier challans, purchase invoice inward lots, pair growth by model, and warehouse audits.
              </p>
            </div>

            <div className="my-3 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-[#ECE5D8] dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[9.5px] uppercase font-bold text-[#7A7264] block">Inward Pairs</span>
                <span className="text-base font-black text-blue-600">+{analyticsData.totalInwardPairs} Pairs</span>
              </div>
              <div className="text-right">
                <span className="text-[9.5px] uppercase font-bold text-[#7A7264] block">Challans Logged</span>
                <span className="text-base font-black text-zinc-900 dark:text-white">{analyticsData.inwardLedgers.length} Records</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-dashed border-[#ECE5D8] dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
            <span>OPEN INWARD LEDGER</span>
            <ChevronRight size={15} />
          </div>
        </div>

        {/* CARD 4: Category & Sub-Category Split */}
        <div 
          onClick={() => {
            setDrawerSearch('');
            setActiveReportDrawer('category_split');
          }}
          className={`rounded-[28px] p-5 border shadow-xs transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between ${
            isDark ? 'bg-zinc-900 border-zinc-800 hover:border-amber-500/50' : 'bg-[#FCFAF6] border-[#EBE6DC] hover:border-[#C29D59] hover:bg-[#FAF6EE]'
          }`}
        >
          <div>
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                <PieChart size={20} />
              </div>
              <span className="text-[9.5px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600">
                SEGMENTATION
              </span>
            </div>

            <div className="mt-3.5">
              <h3 className="text-sm font-black uppercase tracking-tight text-zinc-950 dark:text-white">
                Category &amp; Sub-Category Split
              </h3>
              <p className="text-[11px] text-[#7A7264] dark:text-zinc-400 mt-1 leading-snug">
                Men, Women, Kids demographic split, formal shoes vs sports sneakers volume, and margin share.
              </p>
            </div>

            <div className="my-3 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-[#ECE5D8] dark:border-zinc-800 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#7A7264]">Men Footwear</span>
                <span className="font-mono font-black text-amber-600">₹{analyticsData.categorySplit.men.rev.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#7A7264]">Women Footwear</span>
                <span className="font-mono font-black text-zinc-900 dark:text-white">₹{analyticsData.categorySplit.women.rev.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#7A7264]">Kids Footwear</span>
                <span className="font-mono font-black text-zinc-900 dark:text-white">₹{analyticsData.categorySplit.kids.rev.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-dashed border-[#ECE5D8] dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-purple-600 group-hover:translate-x-0.5 transition-transform">
            <span>INSPECT CATEGORY SHARES</span>
            <ChevronRight size={15} />
          </div>
        </div>

        {/* CARD 5: Payment Method & Settlement Insights */}
        <div 
          onClick={() => {
            setDrawerSearch('');
            setActiveReportDrawer('payment_settlements');
          }}
          className={`rounded-[28px] p-5 border shadow-xs transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between ${
            isDark ? 'bg-zinc-900 border-zinc-800 hover:border-emerald-500/50' : 'bg-[#FCFAF6] border-[#EBE6DC] hover:border-[#2EA46F] hover:bg-[#F2FAF6]'
          }`}
        >
          <div>
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <CreditCard size={20} />
              </div>
              <span className="text-[9.5px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                SETTLEMENT DESK
              </span>
            </div>

            <div className="mt-3.5">
              <h3 className="text-sm font-black uppercase tracking-tight text-zinc-950 dark:text-white">
                Payment Method &amp; Settlement Insights
              </h3>
              <p className="text-[11px] text-[#7A7264] dark:text-zinc-400 mt-1 leading-snug">
                UPI / QR scan revenue, Cash drawer settlements, Card swipe totals, and payment reconciliation.
              </p>
            </div>

            <div className="my-3 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-[#ECE5D8] dark:border-zinc-800 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#7A7264]">UPI / QR Collections</span>
                <span className="font-mono font-black text-emerald-600">₹{analyticsData.paymentBreakdown.upi.rev.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#7A7264]">Cash Counter</span>
                <span className="font-mono font-black text-zinc-900 dark:text-white">₹{analyticsData.paymentBreakdown.cash.rev.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-dashed border-[#ECE5D8] dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
            <span>OPEN SETTLEMENT AUDIT</span>
            <ChevronRight size={15} />
          </div>
        </div>

        {/* CARD 6: Wholesale & Mandi Demand Intelligence */}
        <div 
          onClick={() => {
            if (onNavigate) onNavigate('wholesale_demand');
          }}
          className={`rounded-[28px] p-5 border shadow-xs transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between ${
            isDark ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-[#FCFAF6] border-[#EBE6DC] hover:border-zinc-400'
          }`}
        >
          <div>
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Truck size={20} />
              </div>
              <span className="text-[9.5px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-[#7A7264]">
                BULK DEMAND
              </span>
            </div>

            <div className="mt-3.5">
              <h3 className="text-sm font-black uppercase tracking-tight text-zinc-950 dark:text-white">
                Wholesale &amp; Mandi Demand Intelligence
              </h3>
              <p className="text-[11px] text-[#7A7264] dark:text-zinc-400 mt-1 leading-snug">
                B2B footwear demand requests, wholesaler order status, bulk dispatch pipelines, and mandi ledgers.
              </p>
            </div>

            <div className="my-3 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-[#ECE5D8] dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[9.5px] uppercase font-bold text-[#7A7264] block">B2B Articles</span>
                <span className="text-base font-black text-zinc-900 dark:text-white">Bulk Mandi</span>
              </div>
              <div className="text-right">
                <span className="text-[9.5px] uppercase font-bold text-[#7A7264] block">Dispatch Desk</span>
                <span className="text-base font-black text-amber-600">Active</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-dashed border-[#ECE5D8] dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-amber-600 group-hover:translate-x-0.5 transition-transform">
            <span>GO TO PURCHASE ORDERS</span>
            <ChevronRight size={15} />
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* INTERACTIVE SLIDE-OUT REPORT DRAWER OVERLAY              */}
      {/* ========================================================= */}
      {activeReportDrawer !== 'none' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
          {/* Backdrop dismiss */}
          <div 
            className="absolute inset-0" 
            onClick={() => setActiveReportDrawer('none')} 
          />

          {/* Drawer Container */}
          <div className={`relative z-10 w-full sm:max-w-2xl h-full flex flex-col shadow-2xl transition-transform duration-300 ${
            isDark ? 'bg-zinc-900 text-white border-l border-zinc-800' : 'bg-[#FAF8F5] text-[#181613] border-l border-[#E8E4DA]'
          }`}>
            
            {/* Drawer Header */}
            <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
              isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white border-[#ECE5D8]'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                  {activeReportDrawer === 'product_analytics' && <ShoppingBag size={20} />}
                  {activeReportDrawer === 'returns_ledger' && <RotateCcw size={20} />}
                  {activeReportDrawer === 'inventory_tracker' && <PackageCheck size={20} />}
                  {activeReportDrawer === 'category_split' && <PieChart size={20} />}
                  {activeReportDrawer === 'payment_settlements' && <CreditCard size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                      TIMEFRAME: {selectedTimeframe}
                    </span>
                  </div>
                  <h3 className="text-base font-black uppercase tracking-tight text-zinc-950 dark:text-white mt-0.5">
                    {activeReportDrawer === 'product_analytics' && 'Product & Footwear Analytics Drawer'}
                    {activeReportDrawer === 'returns_ledger' && 'Returns & Refunds Audit Ledger Drawer'}
                    {activeReportDrawer === 'inventory_tracker' && 'Inventory & Stock Inward Tracker Drawer'}
                    {activeReportDrawer === 'category_split' && 'Category & Sub-Category Split Drawer'}
                    {activeReportDrawer === 'payment_settlements' && 'Payment Method & Settlement Insights Drawer'}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveReportDrawer('none')}
                className="p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 cursor-pointer transition-colors"
                title="Close Report Drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Export / Search Bar */}
            <div className={`px-4 sm:px-5 py-2.5 border-b flex items-center justify-between gap-2 shrink-0 ${
              isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-[#FAF6EE] border-[#E8E2D5]'
            }`}>
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search in this drawer..."
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none transition-all ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500' : 'bg-white border-[#E0D8CB] text-zinc-900 placeholder:text-zinc-400'
                  }`}
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] uppercase flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-xs"
                >
                  <Download size={12} />
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className={`px-2.5 py-1.5 rounded-xl border font-bold text-[11px] uppercase flex items-center gap-1 cursor-pointer active:scale-95 transition-all ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-[#DDD4C5] text-zinc-800'
                  }`}
                >
                  <FileSpreadsheet size={12} />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className={`px-2.5 py-1.5 rounded-xl border font-bold text-[11px] uppercase flex items-center gap-1 cursor-pointer active:scale-95 transition-all ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-[#DDD4C5] text-zinc-800'
                  }`}
                >
                  <Printer size={12} />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Drawer Body Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              
              {/* DRAWER 1: PRODUCT & FOOTWEAR ANALYTICS */}
              {activeReportDrawer === 'product_analytics' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className={`p-3 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#E8E4DA]'}`}>
                      <span className="text-[10px] uppercase font-bold text-[#7A7264] block">Articles Sold</span>
                      <span className="text-base font-black text-amber-600 dark:text-amber-400 block mt-0.5">{analyticsData.totalPairsSold} Pairs</span>
                    </div>
                    <div className={`p-3 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#E8E4DA]'}`}>
                      <span className="text-[10px] uppercase font-bold text-[#7A7264] block">Top Footwear Style</span>
                      <span className="text-sm font-black text-zinc-900 dark:text-white block mt-0.5 truncate">{analyticsData.productList[0]?.name || 'N/A'}</span>
                    </div>
                    <div className={`p-3 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#E8E4DA]'}`}>
                      <span className="text-[10px] uppercase font-bold text-[#7A7264] block">Average Margin</span>
                      <span className="text-base font-black text-emerald-600 block mt-0.5">38.4%</span>
                    </div>
                  </div>

                  <h5 className="text-xs font-black uppercase tracking-wider text-[#7A7264]">Best Performing Footwear Articles</h5>
                  <div className="space-y-2">
                    {analyticsData.productList
                      .filter(p => !drawerSearch || p.name.toLowerCase().includes(drawerSearch.toLowerCase()) || p.brand.toLowerCase().includes(drawerSearch.toLowerCase()) || p.category.toLowerCase().includes(drawerSearch.toLowerCase()))
                      .map((prod, idx) => (
                        <div key={idx} className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#E8E4DA]'}`}>
                          <div>
                            <div className="font-black text-zinc-900 dark:text-white flex items-center gap-2">
                              <span>{prod.name}</span>
                              <span className="text-[9.5px] px-1.5 py-0.2 rounded-md bg-black/5 dark:bg-white/5 font-mono">{prod.brand}</span>
                            </div>
                            <div className="text-[10px] text-[#7A7264] mt-0.5">{prod.category} • UK Size: {prod.size}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-sm text-[#2EA46F]">{prod.quantity} Pairs Sold</div>
                            <div className="text-[10px] text-[#7A7264]">₹{prod.revenue.toLocaleString('en-IN')}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* DRAWER 2: RETURNS & REFUNDS AUDIT LEDGER */}
              {activeReportDrawer === 'returns_ledger' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className={`p-3 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#E8E4DA]'}`}>
                      <span className="text-[10px] uppercase font-bold text-[#7A7264] block">Total Refund Value</span>
                      <span className="text-base font-black text-rose-600 block mt-0.5">₹{analyticsData.totalRefundVolume.toLocaleString('en-IN')}</span>
                    </div>
                    <div className={`p-3 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#E8E4DA]'}`}>
                      <span className="text-[10px] uppercase font-bold text-[#7A7264] block">Return Orders</span>
                      <span className="text-base font-black text-zinc-900 dark:text-white block mt-0.5">{analyticsData.refundOrders.length} Invoices</span>
                    </div>
                    <div className={`p-3 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#E8E4DA]'}`}>
                      <span className="text-[10px] uppercase font-bold text-[#7A7264] block">Audit Status</span>
                      <span className="text-base font-black text-emerald-600 block mt-0.5">Reconciled</span>
                    </div>
                  </div>

                  <h5 className="text-xs font-black uppercase tracking-wider text-[#7A7264]">Logged Returns &amp; Credit Notes</h5>
                  {analyticsData.refundOrders.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#7A7264]">No returns or refunds logged for this period.</div>
                  ) : (
                    <div className="space-y-2">
                      {analyticsData.refundOrders
                        .filter(o => !drawerSearch || String(o.id).toLowerCase().includes(drawerSearch.toLowerCase()) || String(o.customerName || '').toLowerCase().includes(drawerSearch.toLowerCase()))
                        .map((ord) => (
                          <div key={ord.id} className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#E8E4DA]'}`}>
                            <div>
                              <div className="font-black text-rose-600 flex items-center gap-2">
                                <span>Credit Note #{ord.id}</span>
                                <span className="text-[9.5px] px-2 py-0.2 rounded-full bg-rose-500/10 text-rose-600 font-bold uppercase">Refund</span>
                              </div>
                              <div className="text-[10px] text-[#7A7264] mt-0.5">{ord.customerName || 'Customer'} • {new Date(ord.createdAt).toLocaleString([], { dateStyle: 'short' })}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-black text-sm text-rose-600">-₹{Math.abs(Number(ord.totalAmount) || 0).toLocaleString('en-IN')}</div>
                              <div className="text-[10px] text-[#7A7264]">{(ord.items || []).length} items returned</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* DRAWER 3: INVENTORY & STOCK INWARD TRACKER */}
              {activeReportDrawer === 'inventory_tracker' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className={`p-3 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#E8E4DA]'}`}>
                      <span className="text-[10px] uppercase font-bold text-[#7A7264] block">Inward Received</span>
                      <span className="text-base font-black text-blue-600 block mt-0.5">+{analyticsData.totalInwardPairs} Pairs</span>
                    </div>
                    <div className={`p-3 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#E8E4DA]'}`}>
                      <span className="text-[10px] uppercase font-bold text-[#7A7264] block">Supplier Challans</span>
                      <span className="text-base font-black text-zinc-900 dark:text-white block mt-0.5">{analyticsData.inwardLedgers.length} Lots</span>
                    </div>
                    <div className={`p-3 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#E8E4DA]'}`}>
                      <span className="text-[10px] uppercase font-bold text-[#7A7264] block">Inward Status</span>
                      <span className="text-base font-black text-emerald-600 block mt-0.5">Verified</span>
                    </div>
                  </div>

                  <h5 className="text-xs font-black uppercase tracking-wider text-[#7A7264]">Inward Challan Receipts</h5>
                  <div className="space-y-2">
                    {analyticsData.inwardLedgers.map((l, idx) => (
                      <div key={idx} className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#E8E4DA]'}`}>
                        <div>
                          <div className="font-black text-zinc-900 dark:text-white">Lot #{l.id} - {l.vendor || 'Factory Dispatch'}</div>
                          <div className="text-[10px] text-[#7A7264] mt-0.5">Challan Ref: {l.invoiceNumber || 'Direct'} • {new Date(l.createdAt || Date.now()).toLocaleDateString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-sm text-blue-600">+{l.totalUnits || 12} Pairs</div>
                          <div className="text-[10px] text-[#7A7264]">Warehouse Verified</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DRAWER 4: CATEGORY & SUB-CATEGORY SPLIT */}
              {activeReportDrawer === 'category_split' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className={`p-3.5 rounded-2xl border text-center ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#E8E4DA]'}`}>
                      <span className="text-[10px] uppercase font-bold text-[#7A7264] block">Men Footwear</span>
                      <span className="text-base font-black text-amber-600 block mt-0.5">₹{analyticsData.categorySplit.men.rev.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-[#7A7264]">{analyticsData.categorySplit.men.qty} pairs</span>
                    </div>
                    <div className={`p-3.5 rounded-2xl border text-center ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#E8E4DA]'}`}>
                      <span className="text-[10px] uppercase font-bold text-[#7A7264] block">Women Footwear</span>
                      <span className="text-base font-black text-purple-600 block mt-0.5">₹{analyticsData.categorySplit.women.rev.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-[#7A7264]">{analyticsData.categorySplit.women.qty} pairs</span>
                    </div>
                    <div className={`p-3.5 rounded-2xl border text-center ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#E8E4DA]'}`}>
                      <span className="text-[10px] uppercase font-bold text-[#7A7264] block">Kids Footwear</span>
                      <span className="text-base font-black text-blue-600 block mt-0.5">₹{analyticsData.categorySplit.kids.rev.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-[#7A7264]">{analyticsData.categorySplit.kids.qty} pairs</span>
                    </div>
                  </div>

                  <h5 className="text-xs font-black uppercase tracking-wider text-[#7A7264]">Category Performance Audit</h5>
                  <div className="p-4 rounded-2xl border bg-black/[0.02] dark:bg-white/[0.02] border-[#ECE5D8] dark:border-zinc-800 space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-bold text-xs mb-1">
                        <span>Men's Share</span>
                        <span>{analyticsData.totalSalesVolume > 0 ? Math.round((analyticsData.categorySplit.men.rev / analyticsData.totalSalesVolume) * 100) : 0}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full" 
                          style={{ width: `${analyticsData.totalSalesVolume > 0 ? (analyticsData.categorySplit.men.rev / analyticsData.totalSalesVolume) * 100 : 0}%` }} 
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-bold text-xs mb-1">
                        <span>Women's Share</span>
                        <span>{analyticsData.totalSalesVolume > 0 ? Math.round((analyticsData.categorySplit.women.rev / analyticsData.totalSalesVolume) * 100) : 0}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full" 
                          style={{ width: `${analyticsData.totalSalesVolume > 0 ? (analyticsData.categorySplit.women.rev / analyticsData.totalSalesVolume) * 100 : 0}%` }} 
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-bold text-xs mb-1">
                        <span>Kids' Share</span>
                        <span>{analyticsData.totalSalesVolume > 0 ? Math.round((analyticsData.categorySplit.kids.rev / analyticsData.totalSalesVolume) * 100) : 0}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${analyticsData.totalSalesVolume > 0 ? (analyticsData.categorySplit.kids.rev / analyticsData.totalSalesVolume) * 100 : 0}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DRAWER 5: PAYMENT METHOD & SETTLEMENT INSIGHTS */}
              {activeReportDrawer === 'payment_settlements' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#E8E4DA]'}`}>
                      <div className="flex items-center justify-between text-[#7A7264] text-[10px] font-bold uppercase">
                        <span>UPI &amp; Digital QR</span>
                        <CreditCard size={14} className="text-emerald-600" />
                      </div>
                      <div className="text-xl font-black text-emerald-600 mt-1">₹{analyticsData.paymentBreakdown.upi.rev.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-[#7A7264] mt-0.5">{analyticsData.paymentBreakdown.upi.count} Successful Settlements</div>
                    </div>

                    <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#E8E4DA]'}`}>
                      <div className="flex items-center justify-between text-[#7A7264] text-[10px] font-bold uppercase">
                        <span>Cash Drawer Count</span>
                        <DollarSign size={14} className="text-amber-600" />
                      </div>
                      <div className="text-xl font-black text-amber-600 mt-1">₹{analyticsData.paymentBreakdown.cash.rev.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-[#7A7264] mt-0.5">{analyticsData.paymentBreakdown.cash.count} Cash Transactions</div>
                    </div>
                  </div>

                  <h5 className="text-xs font-black uppercase tracking-wider text-[#7A7264]">Settlement Breakdown</h5>
                  <div className="p-4 rounded-2xl border bg-black/[0.02] dark:bg-white/[0.02] border-[#ECE5D8] dark:border-zinc-800 space-y-2 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-[#7A7264]">Total Reconciled Volume:</span>
                      <span className="text-zinc-950 dark:text-white font-mono">₹{analyticsData.totalSalesVolume.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-[#7A7264]">UPI Settlement Ratio:</span>
                      <span className="text-emerald-600 font-mono">
                        {analyticsData.totalSalesVolume > 0 ? Math.round((analyticsData.paymentBreakdown.upi.rev / analyticsData.totalSalesVolume) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-[#7A7264]">Cash Ratio:</span>
                      <span className="text-amber-600 font-mono">
                        {analyticsData.totalSalesVolume > 0 ? Math.round((analyticsData.paymentBreakdown.cash.rev / analyticsData.totalSalesVolume) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Drawer Footer */}
            <div className={`p-4 border-t flex items-center justify-between gap-3 shrink-0 ${
              isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#ECE5D8]'
            }`}>
              <span className="text-[11px] text-[#7A7264] font-medium">
                Reports &amp; Analytical Engine
              </span>
              <button
                type="button"
                onClick={() => setActiveReportDrawer('none')}
                className="px-4 py-2 rounded-xl bg-[#C29D59] hover:bg-[#B58E48] text-white font-bold text-xs uppercase cursor-pointer active:scale-95 transition-all shadow-xs"
              >
                Done &amp; Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
