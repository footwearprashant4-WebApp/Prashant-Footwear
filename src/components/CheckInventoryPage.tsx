import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, Search, Package, Check, Save, Printer, 
  AlertTriangle, Filter, CheckCircle2, IndianRupee, RotateCcw,
  SlidersHorizontal, X, Plus, Minus, Download, Eye, FileSpreadsheet,
  Barcode, Boxes, TrendingDown, Layers, ShoppingBag, Sparkles,
  AlertCircle, ArrowUpDown, ChevronDown, CheckSquare, Square,
  RefreshCw, FileText, ChevronRight, History, ShieldAlert,
  Edit3, ArrowRight, Zap, Store, Tag
} from 'lucide-react';
import { Product, Category, SubCategory } from '../types';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  productId: string;
  articleCode: string;
  productName: string;
  previousStock: number;
  newStock: number;
  variance: number;
  reason: string;
  notes?: string;
}

interface CheckInventoryPageProps {
  products: Product[];
  isDark?: boolean;
  onClose: () => void;
  onOpenCreateOrder?: () => void;
  onUpdateProductStock: (productId: string, newSizeStock: Record<string, number>, newTotalStock: number) => Promise<void>;
}

const AUDIT_STORAGE_KEY = 'store_inventory_audit_log_v1';
const STANDARD_SIZES = [5, 6, 7, 8, 9, 10, 11, 12];

export const CheckInventoryPage: React.FC<CheckInventoryPageProps> = ({
  products,
  isDark = false,
  onClose,
  onOpenCreateOrder,
  onUpdateProductStock
}) => {
  // Navigation & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState<'All' | Category>('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'low' | 'out'>('all');
  const [sortBy, setSortBy] = useState<'stock_asc' | 'stock_desc' | 'code_asc' | 'price_desc' | 'price_asc'>('stock_asc');
  const [viewMode, setViewMode] = useState<'cards' | 'matrix' | 'audit_sheet'>('cards');
  const [expandedProductIds, setExpandedProductIds] = useState<Record<string, boolean>>({});

  // Dropdown Popovers state (Matching Inventory Database in Products Stock)
  const [showBrandFilter, setShowBrandFilter] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);

  const toggleExpandProduct = (id: string) => {
    setExpandedProductIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getProductColorHex = (p: Product): string => {
    if (p.colorHex && typeof p.colorHex === 'string') return p.colorHex;

    if (p.customColorMap) {
      const firstEntry = Object.values(p.customColorMap)[0];
      if (firstEntry && typeof firstEntry.hex === 'string') return firstEntry.hex;
    }

    let rawColor = '';
    if (typeof p.colorName === 'string' && p.colorName.trim()) {
      rawColor = p.colorName.trim();
    } else if (typeof (p as any).color === 'string' && (p as any).color.trim()) {
      rawColor = (p as any).color.trim();
    } else if (p.customColorMap) {
      const keys = Object.keys(p.customColorMap);
      if (keys.length > 0) rawColor = keys[0];
    } else if (typeof p.name === 'string') {
      rawColor = p.name;
    }

    const cName = rawColor.toLowerCase();
    if (cName.includes('purple') || cName.includes('lavender') || cName.includes('violet') || cName.includes('magenta')) return '#9333EA';
    if (cName.includes('black') || cName.includes('dark')) return '#18181B';
    if (cName.includes('brown') || cName.includes('tan') || cName.includes('coffee') || cName.includes('camel')) return '#92400E';
    if (cName.includes('blue') || cName.includes('navy')) return '#2563EB';
    if (cName.includes('red') || cName.includes('maroon') || cName.includes('cherry')) return '#DC2626';
    if (cName.includes('green') || cName.includes('olive')) return '#15803D';
    if (cName.includes('grey') || cName.includes('gray')) return '#64748B';
    if (p.category === 'Women') return '#C026D3';
    if (p.category === 'Men') return '#18181B';
    return '#FFA000';
  };

  // Barcode / Scanner simulation modal
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedCodeInput, setScannedCodeInput] = useState('');

  // Local edit buffer: productId -> Record<sizeString, quantity>
  const [editedStocks, setEditedStocks] = useState<Record<string, Record<string, number>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Audit Adjustment Reason Modal
  const [auditTargetProduct, setAuditTargetProduct] = useState<Product | null>(null);
  const [auditReason, setAuditReason] = useState('Physical Store Shelf Count');
  const [auditNotes, setAuditNotes] = useState('');

  // Audit History Modal
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Product Detail Preview / Adjustment Modal
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  // Load audit history from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) {
        setAuditLogs(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load audit history', e);
    }
  }, []);

  const saveAuditLog = (entry: AuditLogEntry) => {
    try {
      const updated = [entry, ...auditLogs].slice(0, 100);
      setAuditLogs(updated);
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save audit log', e);
    }
  };

  // Category counts for quick category chips
  const menCount = useMemo(() => products.filter(p => p.category === 'Men').length, [products]);
  const womenCount = useMemo(() => products.filter(p => p.category === 'Women').length, [products]);
  const kidsCount = useMemo(() => products.filter(p => p.category === 'Kids').length, [products]);

  // Brands list
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      const b = p.brand || 'Walkaroo';
      if (b) set.add(b);
    });
    return Array.from(set).sort();
  }, [products]);

  // Footwear types / SubCategories list
  const availableFootwearTypes = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      const subCat = p.subCategory || (p.name.toLowerCase().includes('sandal') ? 'Sandals' : p.name.toLowerCase().includes('office') ? 'Office Wear' : p.name.toLowerCase().includes('slipper') ? 'Slippers' : 'Footwear');
      set.add(subCat);
    });
    return Array.from(set).sort();
  }, [products]);

  // Global Store Inventory Metrics
  const storeMetrics = useMemo(() => {
    let totalStockPairs = 0;
    let totalValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let inStockCount = 0;

    products.forEach(p => {
      const stock = Number(p.stock) || (p.sizeStock ? Object.values(p.sizeStock).reduce((s, v) => s + (Number(v) || 0), 0) : 0);
      totalStockPairs += stock;
      totalValuation += stock * (p.price || 0);

      if (stock === 0) {
        outOfStockCount++;
      } else if (stock <= 12) {
        lowStockCount++;
      } else {
        inStockCount++;
      }
    });

    const totalDozens = Math.round((totalStockPairs / 12) * 10) / 10;

    return {
      totalArticles: products.length,
      totalStockPairs,
      totalDozens,
      totalValuation,
      lowStockCount,
      outOfStockCount,
      inStockCount
    };
  }, [products]);

  // Filtered & Sorted Product Items
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const pBrand = p.brand || 'Walkaroo';
      const subCat = p.subCategory || (p.name.toLowerCase().includes('sandal') ? 'Sandals' : p.name.toLowerCase().includes('office') ? 'Office Wear' : p.name.toLowerCase().includes('slipper') ? 'Slippers' : 'Footwear');
      
      const matchesSearch = !q || 
        p.name.toLowerCase().includes(q) || 
        p.id.toLowerCase().includes(q) || 
        pBrand.toLowerCase().includes(q) ||
        (p.articleCode && p.articleCode.toLowerCase().includes(q)) ||
        (p.rawArticleCode && p.rawArticleCode.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.toLowerCase().includes(q));

      const matchesBrand = selectedBrand === 'All' || pBrand === selectedBrand;
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSubCat = selectedSubCategory === 'All' || subCat === selectedSubCategory;

      const currentSizeMap = editedStocks[p.id] || p.sizeStock || {};
      const totalStock = Object.keys(currentSizeMap).length > 0
        ? Object.values(currentSizeMap).reduce((s, v) => s + (Number(v) || 0), 0)
        : (Number(p.stock) || 0);

      let matchesStock = true;
      if (stockStatusFilter === 'out') {
        matchesStock = totalStock === 0;
      } else if (stockStatusFilter === 'low') {
        matchesStock = totalStock > 0 && totalStock <= 12;
      } else if (stockStatusFilter === 'in_stock') {
        matchesStock = totalStock > 12;
      }

      return matchesSearch && matchesBrand && matchesCat && matchesSubCat && matchesStock;
    }).sort((a, b) => {
      const stockA = Object.values(editedStocks[a.id] || a.sizeStock || {}).reduce((s, v) => s + (Number(v) || 0), Number(a.stock) || 0);
      const stockB = Object.values(editedStocks[b.id] || b.sizeStock || {}).reduce((s, v) => s + (Number(v) || 0), Number(b.stock) || 0);

      if (sortBy === 'stock_asc') return stockA - stockB;
      if (sortBy === 'stock_desc') return stockB - stockA;
      if (sortBy === 'code_asc') return (a.articleCode || a.id).localeCompare(b.articleCode || b.id);
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      return 0;
    });
  }, [products, searchQuery, selectedBrand, selectedCategory, selectedSubCategory, stockStatusFilter, sortBy, editedStocks]);

  // Handle direct size stock adjustment (+1 / -1 / input)
  const handleSizeStockChange = (productId: string, size: string, value: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setEditedStocks(prev => {
      const currentMap = prev[productId] || { ...(prod.sizeStock || {}) };
      return {
        ...prev,
        [productId]: {
          ...currentMap,
          [size]: Math.max(0, value)
        }
      };
    });
  };

  // Quick Pack Fill: e.g. Add 1 Dozen (12 pairs assorted) or Reset
  const handleApplyPresetPack = (productId: string, preset: 'add_1_dozen' | 'add_6_pairs' | 'zero') => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const currentMap = { ...(editedStocks[productId] || prod.sizeStock || {}) };
    const availableSizes = prod.sizes || [6, 7, 8, 9, 10];

    if (preset === 'zero') {
      availableSizes.forEach(s => {
        currentMap[String(s)] = 0;
      });
    } else if (preset === 'add_1_dozen') {
      // Standard assortment: 6:2, 7:3, 8:3, 9:2, 10:2 = 12 pairs
      const ratio: Record<string, number> = { '6': 2, '7': 3, '8': 3, '9': 2, '10': 2 };
      availableSizes.forEach(s => {
        const add = ratio[String(s)] || 2;
        currentMap[String(s)] = (Number(currentMap[String(s)]) || 0) + add;
      });
    } else if (preset === 'add_6_pairs') {
      // 1 pair per size
      availableSizes.forEach(s => {
        currentMap[String(s)] = (Number(currentMap[String(s)]) || 0) + 1;
      });
    }

    setEditedStocks(prev => ({
      ...prev,
      [productId]: currentMap
    }));
  };

  // Direct quick save for a product
  const handleSaveProduct = async (prod: Product, reason?: string, notes?: string) => {
    const newSizeStock = editedStocks[prod.id] || prod.sizeStock || {};
    const newTotal = Object.values(newSizeStock).reduce((s, v) => s + (Number(v) || 0), 0);
    const prevTotal = Number(prod.stock) || (prod.sizeStock ? Object.values(prod.sizeStock).reduce((s, v) => s + (Number(v) || 0), 0) : 0);

    setIsSaving(true);
    try {
      await onUpdateProductStock(prod.id, newSizeStock, newTotal);
      
      // Save Audit Log
      const entry: AuditLogEntry = {
        id: 'AUD-' + Date.now(),
        timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
        productId: prod.id,
        articleCode: prod.articleCode || prod.id,
        productName: prod.name,
        previousStock: prevTotal,
        newStock: newTotal,
        variance: newTotal - prevTotal,
        reason: reason || 'Floor Stock Audit',
        notes: notes || undefined
      };
      saveAuditLog(entry);

      setSavedSuccessMsg(`Synced stock for "${prod.name}" • Total: ${newTotal} Pairs (${(newTotal/12).toFixed(1)} Doz)`);
      setTimeout(() => setSavedSuccessMsg(null), 3500);

      // Clean from buffer
      setEditedStocks(prev => {
        const next = { ...prev };
        delete next[prod.id];
        return next;
      });

      setAuditTargetProduct(null);
    } catch (e) {
      console.error(e);
      alert('Error updating stock on database');
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes for a product
  const handleDiscardChanges = (productId: string) => {
    setEditedStocks(prev => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  // Export CSV report
  const handleExportCSV = () => {
    const headers = ['Article Code', 'Product Name', 'Brand', 'Category', 'SubCategory', 'Wholesale Price', 'MRP', 'Stock Pairs', 'Stock Dozens', 'Stock Value (INR)', 'Stock Health'];
    const rows = filteredProducts.map(p => {
      const currentMap = editedStocks[p.id] || p.sizeStock || {};
      const stock = Object.values(currentMap).reduce((s, v) => s + (Number(v) || 0), Number(p.stock) || 0);
      const doz = (stock / 12).toFixed(1);
      const val = stock * (p.price || 0);
      const health = stock === 0 ? 'Out of Stock' : stock <= 12 ? 'Low Stock' : 'In Stock';
      return [
        `"${p.articleCode || p.id}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.brand || 'Walkaroo'}"`,
        `"${p.category}"`,
        `"${p.subCategory}"`,
        p.price,
        p.mrp || p.price,
        stock,
        doz,
        val,
        `"${health}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Store_Inventory_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick Barcode submit
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedCodeInput.trim()) return;
    setSearchQuery(scannedCodeInput.trim());
    setIsScannerOpen(false);
    setScannedCodeInput('');
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${
      isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-[#FAF8F5] text-zinc-900'
    }`}>
      {/* Toast Notification */}
      {savedSuccessMsg && (
        <div className="fixed top-20 right-6 z-[100] animate-bounce px-4 py-3 rounded-2xl bg-emerald-600 text-white font-mono text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-400">
          <CheckCircle2 size={16} />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-all ${
        isDark ? 'bg-zinc-950/95 border-zinc-800 text-white' : 'bg-white/95 border-zinc-200 text-zinc-900 shadow-xs'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Back Button & Heading */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className={`p-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  isDark ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200' : 'bg-slate-100 border-zinc-200 hover:bg-slate-200 text-zinc-800'
                }`}
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h1 className="font-black text-sm sm:text-base uppercase tracking-wider font-display leading-tight truncate">
                    Store Inventory & Live Stock Audit
                  </h1>
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono text-[#D88916] dark:text-amber-400 font-bold block truncate">
                  Walkaroo & Footwear Sizing Matrix • Live Floor Stock
                </span>
              </div>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex items-center gap-2">
              {/* Order Low Stock Button */}
              {onOpenCreateOrder && (
                <button
                  type="button"
                  onClick={onOpenCreateOrder}
                  className="px-3 sm:px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                  title="Create Purchase Order for low stock articles"
                >
                  <ShoppingBag size={14} className="stroke-[2.5]" />
                  <span className="hidden md:inline">Create Purchase Order</span>
                  <span className="md:hidden">Order</span>
                  {storeMetrics.lowStockCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-zinc-950 text-amber-400 rounded-full text-[10px] font-mono font-bold">
                      {storeMetrics.lowStockCount}
                    </span>
                  )}
                </button>
              )}

              {/* Barcode Quick Scan */}
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer"
                title="Barcode / SKU Quick Scanner"
              >
                <Barcode size={15} />
                <span className="hidden sm:inline">Scan SKU</span>
              </button>

              {/* Audit History Drawer */}
              <button
                type="button"
                onClick={() => setIsHistoryOpen(true)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer"
                title="View stock count audit history log"
              >
                <History size={15} />
                <span className="hidden lg:inline">Audit Log</span>
              </button>

              {/* CSV Export */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer"
                title="Export Store Inventory to CSV"
              >
                <Download size={15} />
                <span className="hidden lg:inline">Export</span>
              </button>

              {/* Print Sheet */}
              <button
                type="button"
                onClick={() => window.print()}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer"
                title="Print Physical Inventory Audit Sheet"
              >
                <Printer size={15} />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* 1. STORE INVENTORY OVERVIEW KPI CARDS */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Card 1: Total SKUs */}
          <div
            className={`p-4 rounded-2xl border text-left ${
              isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Total Articles</span>
              <Boxes size={16} className="text-blue-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-display tracking-tight text-zinc-900 dark:text-white">
              {storeMetrics.totalArticles}
            </div>
            <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
              Unique Footwear SKUs
            </span>
          </div>

          {/* Card 2: Total Pairs in Live Stock */}
          <div
            className={`p-4 rounded-2xl border text-left ${
              isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Live Inventory</span>
              <Package size={16} className="text-emerald-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-display tracking-tight text-emerald-600 dark:text-emerald-400">
              {storeMetrics.totalStockPairs.toLocaleString('en-IN')} <span className="text-xs font-mono font-bold text-zinc-500">Pairs</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
              ≈ {storeMetrics.totalDozens} Dozens / Cartons
            </span>
          </div>

          {/* Card 3: Store Inventory Valuation */}
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Stock Valuation</span>
              <IndianRupee size={16} className="text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-display tracking-tight text-amber-600 dark:text-amber-400 truncate">
              ₹{storeMetrics.totalValuation.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
              Calculated at MRP / Rates
            </span>
          </div>

          {/* Card 4: Low Stock Alert (< 12 Pairs) */}
          <div
            className={`p-4 rounded-2xl border text-left ${
              isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Low Stock (≤12)
              </span>
              <AlertTriangle size={16} className="text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-display tracking-tight text-amber-600 dark:text-amber-400">
              {storeMetrics.lowStockCount} <span className="text-xs font-mono font-bold text-zinc-500">SKUs</span>
            </div>
            <span className="text-[10px] font-mono text-amber-500/80 block mt-0.5">
              Need Wholesaler Re-order
            </span>
          </div>

          {/* Card 5: Out of Stock (0 Pairs) */}
          <div
            className={`col-span-2 lg:col-span-1 p-4 rounded-2xl border text-left ${
              isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Out of Stock (0)
              </span>
              <ShieldAlert size={16} className="text-rose-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-display tracking-tight text-rose-600 dark:text-rose-400">
              {storeMetrics.outOfStockCount} <span className="text-xs font-mono font-bold text-zinc-500">SKUs</span>
            </div>
            <span className="text-[10px] font-mono text-rose-500/80 block mt-0.5">
              Immediate Restock Required
            </span>
          </div>
        </section>

        {/* 2. INVENTORY DATABASE CONTROL & FILTER PANEL (EXACT MATCH TO PRODUCTS STOCK INVENTORY DATABASE) */}
        <section className={`p-3 sm:p-4 rounded-2xl border shadow-2xs space-y-2.5 ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-[#E8DEC7] text-zinc-900'
        }`}>
          {/* Top: Compact Search Bar with Integrated Result Count */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search article code or product name..."
                className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-[13px] font-mono border outline-none transition-all ${
                  isDark 
                    ? 'bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500 focus:border-[#FFA000]' 
                    : 'bg-zinc-50/80 border-[#E2D8C3] text-zinc-900 placeholder-zinc-400 focus:border-[#FFA000] focus:bg-white'
                }`}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Live Count Pill */}
            <div className={`shrink-0 px-2.5 py-2 rounded-xl border text-[11px] font-mono font-bold flex items-center gap-1 ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-indigo-400' : 'bg-[#FAF7F0] border-[#E8DEC7] text-[#4F46E5]'
            }`}>
              <span>{filteredProducts.length}</span>
              <span className="text-[10px] text-zinc-500 font-sans font-medium">products</span>
            </div>
          </div>

          {/* Middle: Horizontal Category Chips (Single Scrollable Line) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar -mx-0.5 px-0.5">
            {/* All */}
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-[#4F46E5] text-white shadow-xs'
                  : isDark 
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700' 
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200/70 border border-zinc-200/80'
              }`}
            >
              <span>⚡ All</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                selectedCategory === 'All' ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
              }`}>
                {products.length}
              </span>
            </button>

            {/* Men */}
            <button
              type="button"
              onClick={() => setSelectedCategory('Men')}
              className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'Men'
                  ? 'bg-[#4F46E5] text-white shadow-xs'
                  : isDark 
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700' 
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200/70 border border-zinc-200/80'
              }`}
            >
              <span>👨 Men</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                selectedCategory === 'Men' ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
              }`}>
                {menCount}
              </span>
            </button>

            {/* Women */}
            <button
              type="button"
              onClick={() => setSelectedCategory('Women')}
              className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'Women'
                  ? 'bg-[#4F46E5] text-white shadow-xs'
                  : isDark 
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700' 
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200/70 border border-zinc-200/80'
              }`}
            >
              <span>👩 Women</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                selectedCategory === 'Women' ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
              }`}>
                {womenCount}
              </span>
            </button>

            {/* Kids */}
            <button
              type="button"
              onClick={() => setSelectedCategory('Kids')}
              className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'Kids'
                  ? 'bg-[#4F46E5] text-white shadow-xs'
                  : isDark 
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700' 
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200/70 border border-zinc-200/80'
              }`}
            >
              <span>👶 Kids</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                selectedCategory === 'Kids' ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
              }`}>
                {kidsCount}
              </span>
            </button>
          </div>

          {/* Bottom: Quick Dropdowns (Brand & Type) + Stock Pills + Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F0EBE0] dark:border-zinc-800">
            <div className="flex flex-wrap items-center gap-2">
              {/* By Brand Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowBrandFilter(!showBrandFilter);
                    setShowTypeFilter(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-sans font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedBrand !== 'All'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200 font-bold'
                      : isDark 
                        ? 'bg-zinc-950 border-zinc-700 text-zinc-300 hover:bg-zinc-800' 
                        : 'bg-zinc-50 border-[#E2D8C3] text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <Tag size={12} className={selectedBrand !== 'All' ? 'text-amber-600' : 'text-zinc-400'} />
                  <span>{selectedBrand === 'All' ? 'Brand' : selectedBrand}</span>
                  <ChevronDown size={12} className="text-zinc-400" />
                </button>

                {/* Popover Backdrop */}
                {showBrandFilter && (
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setShowBrandFilter(false)} 
                  />
                )}

                {/* Brand Popover */}
                {showBrandFilter && (
                  <div className="absolute top-full left-0 mt-1.5 w-48 p-1.5 bg-white dark:bg-zinc-900 border border-[#E8DEC7] dark:border-zinc-700 rounded-xl shadow-xl z-30 space-y-0.5">
                    <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase px-2 py-1">
                      Filter by Brand
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBrand('All');
                        setShowBrandFilter(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-sans font-medium flex items-center justify-between cursor-pointer ${
                        selectedBrand === 'All'
                          ? 'bg-[#FFA000] text-[#141311] font-bold'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200'
                      }`}
                    >
                      <span>All Brands</span>
                      {selectedBrand === 'All' && <Check size={13} className="stroke-[3]" />}
                    </button>
                    {availableBrands.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          setSelectedBrand(b);
                          setShowBrandFilter(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-sans font-medium flex items-center justify-between cursor-pointer ${
                          selectedBrand === b
                            ? 'bg-[#FFA000] text-[#141311] font-bold'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200'
                        }`}
                      >
                        <span>{b}</span>
                        {selectedBrand === b && <Check size={13} className="stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Type of Footwear Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowTypeFilter(!showTypeFilter);
                    setShowBrandFilter(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-sans font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedSubCategory !== 'All'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold'
                      : isDark 
                        ? 'bg-zinc-950 border-zinc-700 text-zinc-300 hover:bg-zinc-800' 
                        : 'bg-zinc-50 border-[#E2D8C3] text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <span>👟</span>
                  <span>{selectedSubCategory === 'All' ? 'Type' : selectedSubCategory}</span>
                  <ChevronDown size={12} className="text-zinc-400" />
                </button>

                {/* Popover Backdrop */}
                {showTypeFilter && (
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setShowTypeFilter(false)} 
                  />
                )}

                {/* Footwear Type Popover */}
                {showTypeFilter && (
                  <div className="absolute top-full left-0 mt-1.5 w-52 p-1.5 bg-white dark:bg-zinc-900 border border-[#E8DEC7] dark:border-zinc-700 rounded-xl shadow-xl z-30 space-y-0.5 max-h-56 overflow-y-auto">
                    <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase px-2 py-1">
                      Footwear Type
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubCategory('All');
                        setShowTypeFilter(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-sans font-medium flex items-center justify-between cursor-pointer ${
                        selectedSubCategory === 'All'
                          ? 'bg-[#FFA000] text-[#141311] font-bold'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200'
                      }`}
                    >
                      <span>All Types</span>
                      {selectedSubCategory === 'All' && <Check size={13} className="stroke-[3]" />}
                    </button>
                    {availableFootwearTypes.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setSelectedSubCategory(t);
                          setShowTypeFilter(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-sans font-medium flex items-center justify-between cursor-pointer ${
                          selectedSubCategory === t
                            ? 'bg-[#FFA000] text-[#141311] font-bold'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200'
                        }`}
                      >
                        <span>{t}</span>
                        {selectedSubCategory === t && <Check size={13} className="stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-1 border-l pl-2 border-zinc-200 dark:border-zinc-800">
                {[
                  { id: 'all', label: 'All', count: storeMetrics.totalArticles },
                  { id: 'in_stock', label: 'Healthy', count: storeMetrics.inStockCount },
                  { id: 'low', label: 'Low', count: storeMetrics.lowStockCount },
                  { id: 'out', label: 'Out', count: storeMetrics.outOfStockCount }
                ].map(st => {
                  const isActive = stockStatusFilter === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setStockStatusFilter(st.id as any)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        isActive
                          ? 'bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-2xs'
                          : isDark
                          ? 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                          : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
                      }`}
                    >
                      <span>{st.label}</span>
                      <span className="px-1 py-0.2 rounded-full text-[9px] bg-black/10 dark:bg-white/20">
                        {st.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: View Mode Toggle & Reset */}
            <div className="flex items-center gap-2 ml-auto">
              {/* View Mode Switcher */}
              <div className={`flex items-center p-0.5 rounded-xl border ${
                isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold cursor-pointer transition-all ${
                    viewMode === 'cards'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Visual Cards
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('matrix')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold cursor-pointer transition-all ${
                    viewMode === 'matrix'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Size Matrix Table
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('audit_sheet')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold cursor-pointer transition-all ${
                    viewMode === 'audit_sheet'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Shelf Audit Sheet
                </button>
              </div>

              {/* Reset Filters button if active */}
              {(selectedBrand !== 'All' || selectedSubCategory !== 'All' || selectedCategory !== 'All' || searchQuery || stockStatusFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBrand('All');
                    setSelectedSubCategory('All');
                    setSelectedCategory('All');
                    setSearchQuery('');
                    setStockStatusFilter('all');
                  }}
                  className="px-2.5 py-1 rounded-xl text-xs font-mono text-zinc-500 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={11} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 3. INVENTORY DATABASE CONTENT VIEW */}

        {/* --- VIEW MODE 1: VISUAL CARDS GRID (EXACT MATCH TO INVENTORY DATABASE IN PRODUCTS STOCK) --- */}
        {viewMode === 'cards' && (
          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <div className={`text-center py-16 space-y-3 rounded-[32px] border p-8 ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-[#E8DEC7]'
              }`}>
                <Package size={32} className="mx-auto text-zinc-400" />
                <div className="font-sans font-bold text-sm text-zinc-700 dark:text-zinc-300">
                  No shoe articles match the filter criteria.
                </div>
                <p className="text-xs font-mono text-zinc-500">
                  Try clearing search terms or selecting "All Categories" to view your entire store inventory.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedBrand('All');
                    setSelectedSubCategory('All');
                    setStockStatusFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#FFA000] text-[#141311] font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw size={13} />
                  <span>Show All Products</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => {
                  const brand = product.brand || 'Walkaroo';
                  const currentSizeMap = editedStocks[product.id] || product.sizeStock || {};
                  const totalStock = Object.keys(currentSizeMap).length > 0
                    ? Object.values(currentSizeMap).reduce((s, v) => s + (Number(v) || 0), 0)
                    : (Number(product.stock) || 0);
                  const colorHex = getProductColorHex(product);
                  const isExpanded = !!expandedProductIds[product.id];
                  const subCat = product.subCategory || (product.name.toLowerCase().includes('sandal') ? 'Sandals' : product.name.toLowerCase().includes('office') ? 'Office Wear' : product.name.toLowerCase().includes('slipper') ? 'Slippers' : 'Footwear');
                  const isDirty = Boolean(editedStocks[product.id]);

                  return (
                    <div
                      key={product.id}
                      id={`inventory-card-${product.id}`}
                      className={`rounded-[32px] border p-5 sm:p-6 shadow-xs space-y-3.5 transition-all ${
                        isDirty
                          ? 'ring-2 ring-amber-500/80 bg-amber-500/5 border-amber-500/50'
                          : isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-[#E8DEC7] text-zinc-900'
                      }`}
                    >
                      {/* Row 1: Title & Price */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-sans font-black text-base sm:text-lg text-[#141311] dark:text-white leading-snug">
                            {product.name}
                          </h3>
                          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Article: {product.articleCode || product.rawArticleCode || product.id}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-sans font-black text-xl sm:text-2xl text-[#141311] dark:text-white">
                            ₹{product.price}
                          </span>
                        </div>
                      </div>

                      {/* Row 2: Category • Subcategory Pill and Brand Pill */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-sans font-bold border ${
                          isDark 
                            ? 'bg-zinc-800 border-zinc-700 text-zinc-300' 
                            : 'bg-[#F4F1EA] border-[#E2D8C3] text-zinc-700'
                        }`}>
                          {product.category || 'All'} • {subCat}
                        </span>

                        <span className={`px-3 py-1 rounded-full text-xs font-sans font-black uppercase tracking-wider flex items-center gap-1.5 border shadow-2xs ${
                          isDark
                            ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                            : 'bg-white border-blue-600 text-blue-700'
                        }`}>
                          <Tag size={13} className="stroke-[2.5]" />
                          <span>{brand}</span>
                        </span>

                        {isDirty && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-black animate-pulse">
                            Unsaved Count
                          </span>
                        )}
                      </div>

                      {/* Row 3: Inner Box matching reference image */}
                      <div className={`rounded-[24px] border p-4 sm:p-5 space-y-4 ${
                        isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-[#F7F4EC] border-[#E8DEC7]'
                      }`}>
                        <div className="flex items-center justify-between gap-4">
                          {/* Left Side: Color dot pill + Total Products Units */}
                          <div className="space-y-2">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border shadow-2xs ${
                              isDark 
                                ? 'bg-zinc-900 border-emerald-800/80 text-emerald-300' 
                                : 'bg-white border-emerald-300 text-emerald-800'
                            }`}>
                              <span 
                                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs" 
                                style={{ backgroundColor: colorHex }}
                              />
                              <span className="font-mono font-bold text-xs">
                                {totalStock} Units
                              </span>
                            </div>

                            <div>
                              <span className="text-xs font-sans font-bold text-zinc-500 dark:text-zinc-400 block">
                                Total Products:
                              </span>
                              <span className="font-mono font-black text-xl sm:text-2xl text-[#00875A] dark:text-emerald-400 block leading-tight mt-0.5">
                                {totalStock} Units
                              </span>
                            </div>
                          </div>

                          {/* Right Side: Product Image Box */}
                          <div className="flex flex-col items-center">
                            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-2 flex items-center justify-center relative shadow-2xs overflow-hidden">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <Package size={32} className="text-zinc-300 dark:text-zinc-600" />
                              )}

                              {/* Brand sticker in top right of thumbnail box */}
                              <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-rose-600 text-white rounded text-[8px] font-black uppercase tracking-tighter shadow-2xs">
                                {brand.slice(0, 8)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* SHOW ALL Button (Matching reference image) */}
                        <button
                          type="button"
                          onClick={() => toggleExpandProduct(product.id)}
                          className="w-full py-3 px-4 rounded-2xl bg-[#FFA000] hover:bg-[#ff9500] active:scale-[0.99] text-[#141311] font-sans font-black text-xs sm:text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                        >
                          <Eye size={16} className="stroke-[2.5]" />
                          <span>{isExpanded ? 'HIDE DETAILS' : 'SHOW ALL'}</span>
                        </button>

                        {/* Expanded Section: Size breakdown & Quick actions */}
                        {isExpanded && (
                          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                            <div className="text-[11px] font-mono font-bold uppercase text-zinc-500">
                              Available Sizes & Stock Breakdown:
                            </div>
                            
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                              {(product.sizes || STANDARD_SIZES).map(sz => {
                                const szQty = currentSizeMap[String(sz)] ?? 0;
                                return (
                                  <div
                                    key={sz}
                                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center space-y-0.5 ${
                                      szQty > 0
                                        ? isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-[#E8DEC7]'
                                        : 'bg-zinc-100/60 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 opacity-60'
                                    }`}
                                  >
                                    <span className="text-[10px] font-sans font-bold text-zinc-500">UK {sz}</span>
                                    <span className={`text-xs font-mono font-black ${szQty > 0 ? 'text-[#00875A] dark:text-emerald-400' : 'text-rose-500'}`}>
                                      {szQty} Units
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Clean Action controls */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                              <button
                                type="button"
                                onClick={() => setPreviewProduct(product)}
                                className="px-3.5 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-sans font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                              >
                                <Edit3 size={13} />
                                <span>Adjust Stock</span>
                              </button>

                              {isDirty && (
                                <button
                                  type="button"
                                  onClick={() => handleSaveProduct(product)}
                                  disabled={isSaving}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                                >
                                  <Save size={13} />
                                  <span>Save Count</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- VIEW MODE 2: SIZE MATRIX TABLE --- */}
        {viewMode === 'matrix' && (
          <div className={`rounded-3xl border overflow-hidden transition-all ${
            isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            {/* Table Header Bar */}
            <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
              isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-slate-50/80 border-zinc-200'
            }`}>
              <div className="flex items-center gap-2">
                <Store size={16} className="text-[#D88916] dark:text-amber-400" />
                <span className="font-bold font-mono text-xs uppercase tracking-wider">
                  Store Article Size Matrix ({filteredProducts.length} Articles)
                </span>
              </div>
              <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  &gt; 3 Pairs
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  1-3 Pairs (Low)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  0 Pairs (Out)
                </span>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Package size={40} className="mx-auto text-zinc-400 stroke-[1.5]" />
                <h3 className="font-bold text-sm">No articles match your filter criteria</h3>
                <p className="text-xs text-zinc-500">Try adjusting your search query, brand, or stock status.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedBrand('All');
                    setSelectedCategory('All');
                    setSelectedSubCategory('All');
                    setStockStatusFilter('all');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-xs font-mono font-bold cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className={`border-b text-[10px] uppercase font-black tracking-wider ${
                      isDark ? 'bg-zinc-950/80 border-zinc-800 text-zinc-400' : 'bg-slate-100/90 border-zinc-200 text-zinc-500'
                    }`}>
                      <th className="py-3.5 px-4">Article / Shoe</th>
                      <th className="py-3.5 px-3">Brand & Category</th>
                      <th className="py-3.5 px-3 text-right">Price (₹)</th>
                      <th className="py-3.5 px-3">Size-Wise Live Stock (Pairs)</th>
                      <th className="py-3.5 px-3 text-center">Total Stock</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                    {filteredProducts.map(product => {
                      const currentSizeMap = editedStocks[product.id] || product.sizeStock || {};
                      const totalCalculated = Object.values(currentSizeMap).reduce((s, v) => s + (Number(v) || 0), 0);
                      const isDirty = Boolean(editedStocks[product.id]);
                      const sizesList = product.sizes && product.sizes.length > 0 ? product.sizes : STANDARD_SIZES;
                      const dozensCalculated = (totalCalculated / 12).toFixed(1);

                      return (
                        <tr key={product.id} className={`transition-colors ${
                          isDirty ? 'bg-amber-500/10' : isDark ? 'hover:bg-zinc-900/40' : 'hover:bg-slate-50/80'
                        }`}>
                          {/* Article Name */}
                          <td className="py-3 px-4 font-bold">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full shrink-0 border border-black/10" 
                                style={{ backgroundColor: getProductColorHex(product) }}
                              />
                              <div>
                                <span className="font-sans text-xs block leading-tight text-zinc-900 dark:text-white">
                                  {product.name}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  {product.articleCode || product.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Brand & Category */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 mr-1.5">
                              {product.brand || 'Walkaroo'}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {product.category}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-3 text-right font-bold text-zinc-900 dark:text-white">
                            ₹{product.price}
                          </td>

                          {/* Size-Wise Matrix Controls */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {sizesList.map(sz => {
                                const val = Number(currentSizeMap[String(sz)] ?? 0);
                                return (
                                  <div
                                    key={sz}
                                    className={`flex items-center rounded-lg border text-[11px] font-mono font-bold transition-all ${
                                      val > 3
                                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                        : val > 0
                                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                        : 'border-rose-500/30 bg-rose-500/5 text-rose-500/70 opacity-60'
                                    }`}
                                  >
                                    <span className="px-1.5 py-1 text-[10px] bg-black/5 dark:bg-white/5 border-r border-black/10 dark:border-white/10 text-zinc-500">
                                      {sz}
                                    </span>

                                    {/* Decrement Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleSizeStockChange(product.id, String(sz), Math.max(0, val - 1))}
                                      className="px-1 py-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 transition-all cursor-pointer"
                                      title="Decrease stock"
                                    >
                                      <Minus size={11} />
                                    </button>

                                    {/* Direct Input */}
                                    <input
                                      type="number"
                                      min="0"
                                      value={val}
                                      onChange={(e) => handleSizeStockChange(product.id, String(sz), Math.max(0, parseInt(e.target.value) || 0))}
                                      className="w-8 px-0.5 py-1 text-center font-bold font-mono outline-none bg-transparent text-[11px]"
                                    />

                                    {/* Increment Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleSizeStockChange(product.id, String(sz), val + 1)}
                                      className="px-1 py-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 transition-all cursor-pointer"
                                      title="Increase stock"
                                    >
                                      <Plus size={11} />
                                    </button>
                                  </div>
                                );
                              })}

                              {/* Quick Pack Presets */}
                              <div className="relative group">
                                <button
                                  type="button"
                                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 cursor-pointer flex items-center gap-1"
                                  title="Quick Pack adjustments"
                                >
                                  <Zap size={10} className="text-amber-500" />
                                  <span>Pack</span>
                                </button>
                                <div className="absolute right-0 top-full mt-1 z-30 hidden group-hover:flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-1.5 w-36 text-[10px]">
                                  <button
                                    type="button"
                                    onClick={() => handleApplyPresetPack(product.id, 'add_1_dozen')}
                                    className="p-1.5 text-left rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold"
                                  >
                                    +1 Dozen (12 Pairs)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleApplyPresetPack(product.id, 'add_6_pairs')}
                                    className="p-1.5 text-left rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold"
                                  >
                                    +6 Pairs (1 each)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleApplyPresetPack(product.id, 'zero')}
                                    className="p-1.5 text-left rounded-lg hover:bg-rose-500/10 text-rose-500 font-bold"
                                  >
                                    Reset to 0
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Total Stock */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider block ${
                              totalCalculated === 0
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                : totalCalculated <= 12
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {totalCalculated} Pairs
                            </span>
                            <span className="text-[9px] font-mono text-zinc-400 block mt-0.5">
                              ≈ {dozensCalculated} Doz
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {isDirty ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveProduct(product)}
                                    disabled={isSaving}
                                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer shadow-md transition-all active:scale-95"
                                    title="Save new count directly"
                                  >
                                    <Save size={12} />
                                    <span>Save</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setAuditTargetProduct(product)}
                                    className="p-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 cursor-pointer"
                                    title="Save with Audit Reason & Notes"
                                  >
                                    <Edit3 size={12} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDiscardChanges(product.id)}
                                    className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 cursor-pointer"
                                    title="Discard unsaved changes"
                                  >
                                    <X size={12} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  {totalCalculated <= 12 && onOpenCreateOrder && (
                                    <button
                                      type="button"
                                      onClick={onOpenCreateOrder}
                                      className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-all"
                                      title="Order this low-stock article"
                                    >
                                      <ShoppingBag size={11} />
                                      <span>Order</span>
                                    </button>
                                  )}
                                  <span className="text-[10px] text-zinc-400 font-mono">
                                    Synced
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW MODE 3: PHYSICAL SHELF AUDIT SHEET (PRINT-READY) --- */}
        {viewMode === 'audit_sheet' && (
          <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
            isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-black font-display uppercase tracking-tight">
                  Footwear Store Physical Shelf Count Audit Sheet
                </h2>
                <p className="text-xs text-zinc-500 font-mono">
                  Walk the store aisles to verify system stock vs physical shelf count.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-black text-xs uppercase flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Printer size={15} />
                  <span>Print Floor Checklist</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border border-zinc-300 dark:border-zinc-700">
                <thead>
                  <tr className="bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-300 dark:border-zinc-700 font-black">
                    <th className="py-3 px-4">Article Code</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-3">Brand</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-center">System Pairs</th>
                    <th className="py-3 px-4 text-center">Physical Count (Aisle)</th>
                    <th className="py-3 px-4 text-center">Auditor Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredProducts.map(p => {
                    const currentMap = editedStocks[p.id] || p.sizeStock || {};
                    const systemStock = Object.values(currentMap).reduce((s, v) => s + (Number(v) || 0), Number(p.stock) || 0);

                    return (
                      <tr key={p.id}>
                        <td className="py-2.5 px-4 font-bold">{p.articleCode || p.id}</td>
                        <td className="py-2.5 px-4 font-sans font-medium">{p.name}</td>
                        <td className="py-2.5 px-3">{p.brand || 'Walkaroo'}</td>
                        <td className="py-2.5 px-3">{p.category}</td>
                        <td className="py-2.5 px-3 text-center font-black">{systemStock}</td>
                        <td className="py-2.5 px-4 text-center border-l border-r border-zinc-200 dark:border-zinc-800">
                          <div className="w-24 h-6 border-b border-dashed border-zinc-400 mx-auto" />
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <div className="w-28 h-6 border-b border-dashed border-zinc-300 mx-auto" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL 1: AUDIT REASON & DISCREPANCY LOGGING MODAL --- */}
      {auditTargetProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className={`w-full max-w-lg rounded-3xl border p-6 space-y-5 shadow-2xl ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-amber-500" />
                <h3 className="font-bold text-base uppercase font-display">
                  Confirm Stock Adjustment Audit
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAuditTargetProduct(null)}
                className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                <div className="font-bold font-sans text-sm">{auditTargetProduct.name}</div>
                <div className="text-zinc-500">Article: {auditTargetProduct.articleCode || auditTargetProduct.id}</div>
                <div className="text-amber-600 dark:text-amber-400 font-bold pt-1">
                  New Audit Total: {Object.values(editedStocks[auditTargetProduct.id] || {}).reduce((s, v) => s + (Number(v) || 0), 0)} Pairs
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                  Adjustment Reason:
                </label>
                <select
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none font-sans text-xs cursor-pointer ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-200 text-zinc-900'
                  }`}
                >
                  <option value="Physical Store Shelf Count">Physical Store Shelf Count (Audit Verification)</option>
                  <option value="Damaged / Defective Stock">Damaged / Defective Stock Removed</option>
                  <option value="Sample / Display Unit">Sample / Display Unit Shift</option>
                  <option value="Wholesale Transfer / Discrepancy">Wholesale Transfer Discrepancy</option>
                  <option value="Customer Return Stock Shift">Customer Return Stock Shift</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                  Audit Notes / Remarks (Optional):
                </label>
                <textarea
                  rows={2}
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  placeholder="e.g. Recounted box on shelf 3 rack B..."
                  className={`w-full p-2.5 rounded-xl border outline-none font-sans text-xs ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-200 text-zinc-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setAuditTargetProduct(null)}
                className="px-4 py-2 rounded-xl border font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveProduct(auditTargetProduct, auditReason, auditNotes)}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Check size={15} />
                <span>Save Stock Audit Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: AUDIT HISTORY LOG DRAWER MODAL --- */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className={`w-full max-w-xl h-full p-6 space-y-6 overflow-y-auto shadow-2xl ${
            isDark ? 'bg-zinc-950 border-l border-zinc-800 text-white' : 'bg-white border-l border-zinc-200 text-zinc-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-4 border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <History size={18} className="text-amber-500" />
                <h3 className="font-bold text-base uppercase font-display">
                  Stock Audit History Log ({auditLogs.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {auditLogs.length === 0 ? (
              <div className="text-center py-12 space-y-2 text-zinc-400">
                <History size={36} className="mx-auto stroke-[1.5]" />
                <p className="text-xs font-mono">No stock audit logs recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {auditLogs.map(log => (
                  <div
                    key={log.id}
                    className={`p-3.5 rounded-2xl border space-y-1.5 ${
                      isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-slate-50 border-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="font-sans text-sm text-zinc-900 dark:text-white">{log.productName}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                        log.variance > 0
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : log.variance < 0
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          : 'bg-zinc-500/15 text-zinc-500'
                      }`}>
                        {log.variance > 0 ? `+${log.variance}` : log.variance} Pairs
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span>Article: {log.articleCode}</span>
                      <span>{log.timestamp}</span>
                    </div>

                    <div className="text-[11px] font-sans text-zinc-600 dark:text-zinc-300">
                      Reason: <span className="font-semibold text-amber-600 dark:text-amber-400">{log.reason}</span>
                    </div>

                    {log.notes && (
                      <div className="text-[10px] italic text-zinc-400 pt-0.5">
                        "{log.notes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 3: BARCODE SKU SCANNER SIMULATOR MODAL --- */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className={`w-full max-w-md rounded-3xl border p-6 space-y-5 shadow-2xl ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Barcode size={20} className="text-amber-500" />
                <h3 className="font-bold text-base uppercase font-display">
                  Scan Footwear Barcode / SKU
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScannerOpen(false)}
                className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleBarcodeSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-950 text-emerald-400 font-mono text-center space-y-2 border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Scanner Ready</div>
                <div className="text-sm font-bold animate-pulse">|||||||| ||| ||||| |||||||</div>
                <div className="text-[10px] text-zinc-400">Point USB barcode reader or type SKU number below</div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1 font-mono">
                  Enter Article Code / Barcode ID:
                </label>
                <input
                  type="text"
                  autoFocus
                  value={scannedCodeInput}
                  onChange={(e) => setScannedCodeInput(e.target.value)}
                  placeholder="e.g. WALK-1045 or 890123456789"
                  className={`w-full p-3 rounded-xl border outline-none font-mono text-sm ${
                    isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-slate-50 border-zinc-200 text-zinc-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Search size={14} />
                  <span>Locate Article</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: ADJUST STOCK DETAIL MODAL --- */}
      {previewProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className={`w-full max-w-lg rounded-3xl border p-6 space-y-5 shadow-2xl ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-amber-500" />
                <h3 className="font-bold text-base uppercase font-display">
                  Adjust Article Size Breakdown
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80">
                <div className="w-14 h-14 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-1 flex items-center justify-center shrink-0">
                  {previewProduct.imageUrl ? (
                    <img src={previewProduct.imageUrl} alt={previewProduct.name} className="w-full h-full object-contain" />
                  ) : (
                    <Package size={24} className="text-zinc-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm font-sans">{previewProduct.name}</h4>
                  <p className="text-xs font-mono text-zinc-500">Article: {previewProduct.articleCode || previewProduct.id}</p>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Price: ₹{previewProduct.price}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-2">
                  Update Size Stock Quantity:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(previewProduct.sizes || STANDARD_SIZES).map(sz => {
                    const currentMap = editedStocks[previewProduct.id] || previewProduct.sizeStock || {};
                    const val = Number(currentMap[String(sz)] ?? 0);
                    return (
                      <div key={sz} className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-zinc-500">UK Size {sz}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <button
                            type="button"
                            onClick={() => handleSizeStockChange(previewProduct.id, String(sz), Math.max(0, val - 1))}
                            className="w-6 h-6 rounded bg-zinc-200 dark:bg-zinc-800 font-bold flex items-center justify-center text-xs hover:bg-zinc-300 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-mono font-black text-sm w-6 text-center">{val}</span>
                          <button
                            type="button"
                            onClick={() => handleSizeStockChange(previewProduct.id, String(sz), val + 1)}
                            className="w-6 h-6 rounded bg-zinc-200 dark:bg-zinc-800 font-bold flex items-center justify-center text-xs hover:bg-zinc-300 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="px-4 py-2 rounded-xl border font-bold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSaveProduct(previewProduct);
                  setPreviewProduct(null);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Save size={14} />
                <span>Save Stock</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
