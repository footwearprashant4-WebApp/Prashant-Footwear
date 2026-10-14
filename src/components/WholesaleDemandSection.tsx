import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Truck, Plus, Search, Filter, Trash2, Edit3, CheckCircle2, Clock, 
  AlertCircle, ChevronRight, Share2, Printer, Package, Tag, ArrowRight,
  Layers, ShoppingBag, Send, RefreshCw, X, Sparkles, Building2, ExternalLink,
  ArrowLeft, FileText, PlusCircle
} from 'lucide-react';
import { Product } from '../types';
import { StockPurchaseOrderInvoicePage } from './StockPurchaseOrderInvoicePage';

export interface WholesaleDemandItem {
  id: string;
  productId?: string;
  articleCode: string;
  productName: string;
  brand: string;
  category: string;
  sizes: string;
  color: string;
  quantityDemanded: number;
  unitType: 'pairs' | 'cartons' | 'boxes';
  wholesalerName: string;
  status: 'Pending Demand' | 'Ordered to Wholesaler' | 'In Transit' | 'Received in Shop' | 'Cancelled';
  priority: 'Normal' | 'High' | 'Urgent';
  estimatedPricePerPair: number;
  totalEstimatedCost: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

const STORAGE_KEY = 'prashant_wholesale_demands_v1';

export interface WholesaleDemandSectionProps {
  isDark?: boolean;
  products?: Product[];
  onBackToHome?: () => void;
  onOpenCreateOrder?: () => void;
  onOpenCheckInventory?: () => void;
  onOpenInvoicesHistory?: () => void;
}

export const WholesaleDemandSection: React.FC<WholesaleDemandSectionProps> = ({
  isDark = false,
  products: propProducts,
  onBackToHome,
  onOpenCreateOrder,
  onOpenCheckInventory,
  onOpenInvoicesHistory
}) => {
  const contextProducts = useProducts().products;
  const products = propProducts || contextProducts || [];
  const [demands, setDemands] = useState<WholesaleDemandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'mandi_demands'>('home');
  const [internalInvoiceMode, setInternalInvoiceMode] = useState<'create' | 'list' | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [brandFilter, setBrandFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatalogPickerOpen, setIsCatalogPickerOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [editingDemand, setEditingDemand] = useState<WholesaleDemandItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    productId: string;
    articleCode: string;
    productName: string;
    brand: string;
    category: string;
    sizes: string;
    color: string;
    quantityDemanded: number;
    unitType: 'pairs' | 'cartons' | 'boxes';
    wholesalerName: string;
    status: 'Pending Demand' | 'Ordered to Wholesaler' | 'In Transit' | 'Received in Shop' | 'Cancelled';
    priority: 'Normal' | 'High' | 'Urgent';
    estimatedPricePerPair: number;
    notes: string;
  }>({
    productId: '',
    articleCode: '',
    productName: '',
    brand: 'Walkaroo',
    category: 'Men',
    sizes: '6,7,8,9,10',
    color: 'Black',
    quantityDemanded: 12,
    unitType: 'pairs',
    wholesalerName: 'Delhi Wholesale Footwear Market',
    status: 'Pending Demand',
    priority: 'Normal',
    estimatedPricePerPair: 150,
    notes: ''
  });

  // Load demands from Firestore with fallback to LocalStorage
  useEffect(() => {
    let unsubscribe = () => {};

    try {
      const demandsCol = collection(db, 'wholesale_demands');
      unsubscribe = onSnapshot(demandsCol, (snapshot) => {
        const list: WholesaleDemandItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as WholesaleDemandItem);
        });

        // Sort by newest created
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setDemands(list);
        setLoading(false);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch (e) {
          console.error(e);
        }
      }, (error) => {
        console.warn('Firestore offline or read failed, falling back to local storage:', error);
        loadLocalDemands();
      });
    } catch (err) {
      console.warn('Firebase error, using local demands:', err);
      loadLocalDemands();
    }

    return () => unsubscribe();
  }, []);

  const loadLocalDemands = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setDemands(JSON.parse(saved));
      } else {
        // Default sample demands
        const initialSamples: WholesaleDemandItem[] = [
          {
            id: 'DEM-' + Date.now(),
            articleCode: 'WALK-1045',
            productName: 'Walkaroo Men Sports Sandal',
            brand: 'Walkaroo',
            category: 'Men',
            sizes: '6,7,8,9,10',
            color: 'Navy Blue',
            quantityDemanded: 60,
            unitType: 'pairs',
            wholesalerName: 'Agra Wholesale Market',
            status: 'Pending Demand',
            priority: 'High',
            estimatedPricePerPair: 220,
            totalEstimatedCost: 13200,
            notes: 'High customer demand for UK 8 & 9',
            createdAt: new Date().toISOString()
          },
          {
            id: 'DEM-' + (Date.now() - 86400000),
            articleCode: 'PAR-8821',
            productName: 'Paragon Sole Slipper',
            brand: 'Paragon',
            category: 'Women',
            sizes: '4,5,6,7',
            color: 'Red / Brown',
            quantityDemanded: 36,
            unitType: 'pairs',
            wholesalerName: 'Local Distributor Agency',
            status: 'Ordered to Wholesaler',
            priority: 'Normal',
            estimatedPricePerPair: 110,
            totalEstimatedCost: 3960,
            notes: 'Festive season stock backlog',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        setDemands(initialSamples);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSamples));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const saveDemandsState = (updatedList: WholesaleDemandItem[]) => {
    setDemands(updatedList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenAddModal = () => {
    setEditingDemand(null);
    setFormData({
      productId: '',
      articleCode: '',
      productName: '',
      brand: 'Walkaroo',
      category: 'Men',
      sizes: '6,7,8,9,10',
      color: 'Black',
      quantityDemanded: 24,
      unitType: 'pairs',
      wholesalerName: 'Delhi Wholesale Footwear Market',
      status: 'Pending Demand',
      priority: 'Normal',
      estimatedPricePerPair: 180,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSelectFromCatalog = (product: any) => {
    setFormData({
      productId: product.id || '',
      articleCode: product.rawArticleCode || product.id || '',
      productName: product.name || '',
      brand: product.brand || 'Walkaroo',
      category: product.category || 'Men',
      sizes: product.sizes ? product.sizes.join(',') : '6,7,8,9,10',
      color: product.color || 'Default',
      quantityDemanded: 24,
      unitType: 'pairs',
      wholesalerName: 'Primary Wholesaler Market',
      status: 'Pending Demand',
      priority: 'Normal',
      estimatedPricePerPair: product.price ? Math.round(product.price * 0.6) : 150,
      notes: `Demand created from catalog article ${product.id}`
    });
    setIsCatalogPickerOpen(false);
    setIsModalOpen(true);
  };

  const handleEditDemand = (item: WholesaleDemandItem) => {
    setEditingDemand(item);
    setFormData({
      productId: item.productId || '',
      articleCode: item.articleCode,
      productName: item.productName,
      brand: item.brand,
      category: item.category,
      sizes: item.sizes,
      color: item.color,
      quantityDemanded: item.quantityDemanded,
      unitType: item.unitType,
      wholesalerName: item.wholesalerName,
      status: item.status,
      priority: item.priority,
      estimatedPricePerPair: item.estimatedPricePerPair,
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveDemand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName.trim()) {
      alert('Please enter a product name for the demand article');
      return;
    }

    const totalEst = Number(formData.quantityDemanded) * Number(formData.estimatedPricePerPair);
    const demandId = editingDemand ? editingDemand.id : 'DEM-' + Date.now();

    const demandObj: WholesaleDemandItem = {
      id: demandId,
      productId: formData.productId || undefined,
      articleCode: formData.articleCode || 'ART-' + Math.floor(1000 + Math.random() * 9000),
      productName: formData.productName.trim(),
      brand: formData.brand || 'General Wholesaler',
      category: formData.category || 'Men',
      sizes: formData.sizes || 'All Sizes',
      color: formData.color || 'Assorted',
      quantityDemanded: Number(formData.quantityDemanded) || 12,
      unitType: formData.unitType,
      wholesalerName: formData.wholesalerName || 'Wholesale Market',
      status: formData.status,
      priority: formData.priority,
      estimatedPricePerPair: Number(formData.estimatedPricePerPair) || 0,
      totalEstimatedCost: totalEst,
      notes: formData.notes,
      createdAt: editingDemand ? editingDemand.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update state first
    let updated: WholesaleDemandItem[];
    if (editingDemand) {
      updated = demands.map(d => d.id === editingDemand.id ? demandObj : d);
    } else {
      updated = [demandObj, ...demands];
    }
    saveDemandsState(updated);

    // Save to Firestore asynchronously
    try {
      const demandRef = doc(db, 'wholesale_demands', demandId);
      await setDoc(demandRef, { ...demandObj, updatedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }

    setIsModalOpen(false);
  };

  const handleStatusChange = async (id: string, newStatus: WholesaleDemandItem['status']) => {
    const updated = demands.map(d => d.id === id ? { ...d, status: newStatus, updatedAt: new Date().toISOString() } : d);
    saveDemandsState(updated);

    try {
      const demandRef = doc(db, 'wholesale_demands', id);
      await updateDoc(demandRef, { status: newStatus, updatedAt: serverTimestamp() });
    } catch (err) {
      console.warn('Firestore status update error:', err);
    }
  };

  const handleDeleteDemand = async (id: string) => {
    if (!confirm('Are you sure you want to remove this stock demand article?')) return;

    const updated = demands.filter(d => d.id !== id);
    saveDemandsState(updated);

    try {
      await deleteDoc(doc(db, 'wholesale_demands', id));
    } catch (err) {
      console.warn('Firestore delete error:', err);
    }
  };

  // WhatsApp Share Slip Generation
  const handleShareOnWhatsApp = (item?: WholesaleDemandItem) => {
    let text = '';
    if (item) {
      text = `*PRASHANT FOOTWEAR - WHOLESALE STOCK DEMAND*%0A` +
        `----------------------------------------%0A` +
        `*Wholesaler:* ${item.wholesalerName}%0A` +
        `*Article Code:* ${item.articleCode}%0A` +
        `*Product:* ${item.productName}%0A` +
        `*Brand:* ${item.brand}%0A` +
        `*Category:* ${item.category}%0A` +
        `*Sizes:* ${item.sizes}%0A` +
        `*Color:* ${item.color}%0A` +
        `*Quantity Demanded:* ${item.quantityDemanded} ${item.unitType.toUpperCase()}%0A` +
        `*Priority:* ${item.priority}%0A` +
        (item.notes ? `*Notes:* ${item.notes}%0A` : '') +
        `----------------------------------------%0A` +
        `_Please confirm availability and dispatch rate._`;
    } else {
      const pendingItems = demands.filter(d => d.status === 'Pending Demand' || d.status === 'Ordered to Wholesaler');
      if (pendingItems.length === 0) {
        alert('No active pending demands to share.');
        return;
      }
      text = `*PRASHANT FOOTWEAR - CONSOLIDATED WHOLESALE DEMAND SLIP*%0A` +
        `Date: ${new Date().toLocaleDateString('en-IN')}%0A` +
        `----------------------------------------%0A`;

      pendingItems.forEach((d, idx) => {
        text += `${idx + 1}. *[${d.brand}]* ${d.productName} (Art: ${d.articleCode})%0A` +
          `   - Sizes: ${d.sizes} | Color: ${d.color}%0A` +
          `   - Qty Needed: *${d.quantityDemanded} ${d.unitType}*%0A`;
      });
      text += `----------------------------------------%0A` +
        `_Sent via Prashant Footwear Retailer ERP_`;
    }

    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Filtering Logic
  const filteredDemands = demands.filter(d => {
    const matchesSearch = !searchQuery || 
      d.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.articleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.wholesalerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchesBrand = brandFilter === 'All' || d.brand === brandFilter;
    const matchesPriority = priorityFilter === 'All' || d.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesBrand && matchesPriority;
  });

  // Unique brands for filter
  const uniqueBrands = Array.from(new Set(demands.map(d => d.brand))).filter(Boolean);

  // Statistics calculations
  const totalPendingPairs = demands
    .filter(d => d.status === 'Pending Demand' || d.status === 'Ordered to Wholesaler')
    .reduce((sum, d) => sum + d.quantityDemanded, 0);

  const totalEstimatedBudget = demands
    .filter(d => d.status === 'Pending Demand' || d.status === 'Ordered to Wholesaler')
    .reduce((sum, d) => sum + d.totalEstimatedCost, 0);

  const pendingCount = demands.filter(d => d.status === 'Pending Demand').length;
  const inTransitCount = demands.filter(d => d.status === 'In Transit').length;

  if (currentView === 'home') {
    return (
      <div className="w-full max-w-[480px] sm:max-w-[520px] mx-auto pb-16 px-4 sm:px-6 animate-fade-in font-sans">
        {/* 1. Back to Home Navigation Button */}
        <div className="pt-2 pb-5">
          <button
            type="button"
            id="btn-order-stock-back-home"
            onClick={() => {
              if (onBackToHome) onBackToHome();
              else window.history.back();
            }}
            className={`inline-flex items-center gap-2.5 px-5 py-2.5 sm:py-3 rounded-[20px] sm:rounded-[22px] border-[1.5px] shadow-[0_2px_8px_rgba(0,0,0,0.03)] active:scale-95 transition-all cursor-pointer ${
              isDark 
                ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800' 
                : 'bg-white border-zinc-200/90 text-zinc-950 hover:bg-zinc-50'
            }`}
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span className="font-black text-xs sm:text-[13px] tracking-wider uppercase font-sans">
              BACK TO HOME
            </span>
          </button>
        </div>

        {/* 2. Header Card: [PROCUREMENT HUB] Order Stock Management */}
        <div 
          className={`w-full rounded-[28px] sm:rounded-[32px] p-5 sm:p-5.5 border-[1.5px] shadow-[0_4px_20px_rgba(220,180,90,0.06)] flex items-center gap-4 mb-4 ${
            isDark 
              ? 'bg-zinc-900 border-zinc-700' 
              : 'bg-white border-[#EFE5D1]'
          }`}
        >
          {/* Left Icon Squircle in Warm Amber with Delivery Truck */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] sm:rounded-[22px] flex items-center justify-center shrink-0 bg-[#FEF6E6] dark:bg-amber-950/50 border border-[#FDE6B6] dark:border-amber-800/60 text-[#D98A17] dark:text-amber-400 shadow-2xs">
            <Truck className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
          </div>

          {/* Center Content */}
          <div className="min-w-0 flex-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] sm:text-[11px] font-black tracking-wider uppercase bg-[#FEF5E3] dark:bg-amber-950/80 border border-[#FDE4B0] dark:border-amber-800/60 text-[#C67E14] dark:text-amber-400 mb-1 leading-none font-sans">
              PROCUREMENT HUB
            </span>
            <h1 className="text-[20px] sm:text-[23px] font-black font-display tracking-tight text-zinc-950 dark:text-white leading-tight">
              Purchase Orders
            </h1>
          </div>
        </div>

        {/* 3. Workspace Action Buttons Stack */}
        <div className="space-y-3.5 sm:space-y-4">
          
          {/* Card 1: Create New Order (Build purchase order & generate invoice) */}
          <button
            type="button"
            id="btn-order-stock-create-order"
            onClick={() => {
              if (onOpenCreateOrder) {
                onOpenCreateOrder();
              } else {
                setInternalInvoiceMode('create');
              }
            }}
            className={`w-full rounded-[26px] sm:rounded-[28px] p-4 sm:p-4.5 border-[1.5px] shadow-[0_3px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 text-left active:scale-[0.985] transition-all cursor-pointer ${
              isDark 
                ? 'bg-zinc-900 border-zinc-700 hover:border-zinc-500' 
                : 'bg-white border-zinc-200/90 hover:border-zinc-400'
            }`}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] sm:rounded-[22px] flex items-center justify-center shrink-0 bg-[#FFF5E7] dark:bg-amber-950/40 border border-[#FDE0B4] dark:border-amber-800/60 text-[#D88916] dark:text-amber-400 shadow-2xs">
              <PlusCircle className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[17px] sm:text-[18.5px] font-black font-display tracking-tight text-zinc-950 dark:text-white leading-tight">
                Create New Order
              </h3>
              <p className="text-[12.5px] sm:text-[13.5px] mt-1 font-medium font-sans text-zinc-500 dark:text-zinc-400 leading-snug">
                Build purchase order & generate invoice
              </p>
            </div>
            <div className="shrink-0 pr-1 text-[#D88916] dark:text-amber-400">
              <ArrowRight className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.4]" />
            </div>
          </button>

          {/* Card 2: Check Store Inventory (Search articles & live stock levels) */}
          <button
            type="button"
            id="btn-order-stock-check-inventory"
            onClick={() => {
              if (onOpenCheckInventory) {
                onOpenCheckInventory();
              }
            }}
            className={`w-full rounded-[26px] sm:rounded-[28px] p-4 sm:p-4.5 border-[1.5px] shadow-[0_3px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 text-left active:scale-[0.985] transition-all cursor-pointer ${
              isDark 
                ? 'bg-zinc-900 border-zinc-700 hover:border-zinc-500' 
                : 'bg-white border-zinc-200/90 hover:border-zinc-400'
            }`}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] sm:rounded-[22px] flex items-center justify-center shrink-0 bg-[#EEFBF5] dark:bg-emerald-950/40 border border-[#C5F3DC] dark:border-emerald-800/60 text-[#0E9F6E] dark:text-emerald-400 shadow-2xs">
              <svg 
                viewBox="0 0 24 24" 
                className="w-7 h-7 sm:w-8 sm:h-8" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="m16.5 9.4-9-5.16a1.8 1.8 0 0 0-1.8 0L3 5.8a1.8 1.8 0 0 0-.9 1.56v7.28a1.8 1.8 0 0 0 .9 1.56l2.75 1.56a1.8 1.8 0 0 0 1.8 0l8.95-5.16a1.8 1.8 0 0 0 .9-1.56V7.84a1.8 1.8 0 0 0-.9-1.56l-2.75-1.56a1.8 1.8 0 0 0-1.8 0z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[17px] sm:text-[18.5px] font-black font-display tracking-tight text-zinc-950 dark:text-white leading-tight">
                Check Store Inventory
              </h3>
              <p className="text-[12.5px] sm:text-[13.5px] mt-1 font-medium font-sans text-zinc-500 dark:text-zinc-400 leading-snug">
                Search articles & live stock levels
              </p>
            </div>
            <div className="shrink-0 pr-1 text-[#0E9F6E] dark:text-emerald-400">
              <ArrowRight className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.4]" />
            </div>
          </button>

          {/* Card 3: Order Invoices History (View & print previous purchase invoices) */}
          <button
            type="button"
            id="btn-order-stock-invoices-history"
            onClick={() => {
              if (onOpenInvoicesHistory) {
                onOpenInvoicesHistory();
              } else {
                setInternalInvoiceMode('list');
              }
            }}
            className={`w-full rounded-[26px] sm:rounded-[28px] p-4 sm:p-4.5 border-[1.5px] shadow-[0_3px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 text-left active:scale-[0.985] transition-all cursor-pointer ${
              isDark 
                ? 'bg-zinc-900 border-zinc-700 hover:border-zinc-500' 
                : 'bg-white border-zinc-200/90 hover:border-zinc-400'
            }`}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] sm:rounded-[22px] flex items-center justify-center shrink-0 bg-[#EDF5FE] dark:bg-sky-950/40 border border-[#C3DCFD] dark:border-sky-800/60 text-[#2B7FFF] dark:text-sky-400 shadow-2xs">
              <FileText className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[17px] sm:text-[18.5px] font-black font-display tracking-tight text-zinc-950 dark:text-white leading-tight">
                Order Invoices History
              </h3>
              <p className="text-[12.5px] sm:text-[13.5px] mt-1 font-medium font-sans text-zinc-500 dark:text-zinc-400 leading-snug">
                View & print previous purchase invoices
              </p>
            </div>
            <div className="shrink-0 pr-1 text-[#2B7FFF] dark:text-sky-400">
              <ArrowRight className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.4]" />
            </div>
          </button>

          {/* Card 4: Wholesale Demand Articles (Mandi Demand Desk & WhatsApp Slips) */}
          <button
            type="button"
            id="btn-order-stock-wholesale-demands"
            onClick={() => setCurrentView('mandi_demands')}
            className={`w-full rounded-[26px] sm:rounded-[28px] p-4 sm:p-4.5 border-[1.5px] shadow-[0_3px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 text-left active:scale-[0.985] transition-all cursor-pointer ${
              isDark 
                ? 'bg-zinc-900 border-zinc-700 hover:border-zinc-500' 
                : 'bg-white border-zinc-200/90 hover:border-zinc-400'
            }`}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] sm:rounded-[22px] flex items-center justify-center shrink-0 bg-[#F5F0FF] dark:bg-purple-950/40 border border-[#E3D1FC] dark:border-purple-800/60 text-[#7E3AF2] dark:text-purple-400 shadow-2xs">
              <Layers className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[17px] sm:text-[18.5px] font-black font-display tracking-tight text-zinc-950 dark:text-white leading-tight">
                Wholesale Demand Articles
              </h3>
              <p className="text-[12.5px] sm:text-[13.5px] mt-1 font-medium font-sans text-zinc-500 dark:text-zinc-400 leading-snug">
                Mandi demand slip & WhatsApp sharing
              </p>
            </div>
            <div className="shrink-0 pr-1 text-[#7E3AF2] dark:text-purple-400">
              <ArrowRight className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.4]" />
            </div>
          </button>

        </div>

        {/* Full Page Stock Order Invoice Page overlay */}
        {internalInvoiceMode && (
          <StockPurchaseOrderInvoicePage
            products={products}
            isDark={isDark}
            mode={internalInvoiceMode}
            onBack={() => setInternalInvoiceMode(null)}
            onSaveInvoice={async () => {
              setInternalInvoiceMode(null);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back to Order Stock Hub Navigation */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setCurrentView('home')}
          className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-[20px] border-[1.5px] shadow-[0_2px_8px_rgba(0,0,0,0.03)] active:scale-95 transition-all cursor-pointer ${
            isDark 
              ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800' 
              : 'bg-white border-zinc-200/90 text-zinc-950 hover:bg-zinc-50'
          }`}
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span className="font-black text-xs tracking-wider uppercase font-sans">
            BACK TO ORDER STOCK HUB
          </span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-zinc-900 to-amber-950 p-6 sm:p-8 rounded-3xl border border-amber-500/30 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-amber-500/10 backdrop-blur-3xl transform skew-x-12 translate-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-500/30">
              <Truck size={14} /> Retailer to Wholesaler Order Desk
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-sans tracking-tight text-white">
              Purchase Orders (Wholesaler Demands)
            </h2>
            <p className="text-zinc-300 text-xs sm:text-sm max-w-2xl font-sans">
              Manage footwear demand articles for the wholesale market. Add articles directly from your shop’s catalog or introduce new demand articles to order stock efficiently.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCatalogPickerOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
            >
              <Package size={16} /> Select From Product Catalog
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} className="stroke-[3]" /> Add New Demand Article
            </button>
          </div>
        </div>

        {/* Real-time Demand Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-amber-500/20">
          <div className="bg-zinc-950/60 p-3.5 sm:p-4 rounded-2xl border border-amber-500/20">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80 block">Total Pending Demand</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-400 mt-1 block">
              {totalPendingPairs} <span className="text-xs font-normal text-zinc-400">Pairs</span>
            </span>
          </div>

          <div className="bg-zinc-950/60 p-3.5 sm:p-4 rounded-2xl border border-amber-500/20">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">Est. Market Budget</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1 block">
              ₹{totalEstimatedBudget.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-zinc-950/60 p-3.5 sm:p-4 rounded-2xl border border-amber-500/20">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">New Requests</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-white mt-1 block">
              {pendingCount} <span className="text-xs font-normal text-zinc-400">Articles</span>
            </span>
          </div>

          <div className="bg-zinc-950/60 p-3.5 sm:p-4 rounded-2xl border border-amber-500/20">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">In Transit Stock</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-sky-400 mt-1 block">
              {inTransitCount} <span className="text-xs font-normal text-zinc-400">Batches</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by article code, footwear name, brand, wholesaler..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-mono border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3 text-zinc-400 hover:text-zinc-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending Demand">Pending Demand</option>
              <option value="Ordered to Wholesaler">Ordered to Wholesaler</option>
              <option value="In Transit">In Transit</option>
              <option value="Received in Shop">Received in Shop</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Brand Filter */}
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 cursor-pointer"
            >
              <option value="All">All Brands</option>
              {uniqueBrands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
            </select>

            {/* Batch Export / WhatsApp Share */}
            <button
              onClick={() => handleShareOnWhatsApp()}
              className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1.5 cursor-pointer"
              title="Share Pending Demands Slip via WhatsApp"
            >
              <Share2 size={14} /> Send WhatsApp Demand Slip
            </button>
          </div>
        </div>
      </div>

      {/* Demand Articles Listing Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-amber-500" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Wholesaler Demand Articles ({filteredDemands.length})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            Click status to advance demand stage
          </span>
        </div>

        {filteredDemands.length === 0 ? (
          <div className="p-12 text-center space-y-3 text-zinc-500">
            <Package size={48} className="mx-auto opacity-30 text-amber-500" />
            <p className="font-mono text-xs">No wholesaler demand articles found matching filters.</p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Add Demand Article
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-zinc-50 dark:bg-zinc-950/80 text-zinc-500 dark:text-zinc-400 font-mono text-[10px] uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Article / Footwear</th>
                  <th className="py-3 px-4">Brand &amp; Category</th>
                  <th className="py-3 px-4">Sizes &amp; Color</th>
                  <th className="py-3 px-4">Demanded Qty</th>
                  <th className="py-3 px-4">Est. Price / Total</th>
                  <th className="py-3 px-4">Wholesaler Market</th>
                  <th className="py-3 px-4">Status &amp; Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredDemands.map((item) => {
                  const getStatusColor = (st: WholesaleDemandItem['status']) => {
                    switch (st) {
                      case 'Pending Demand': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
                      case 'Ordered to Wholesaler': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
                      case 'In Transit': return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30';
                      case 'Received in Shop': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
                      case 'Cancelled': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
                      default: return 'bg-zinc-100 text-zinc-600';
                    }
                  };

                  const getPriorityBadge = (p: WholesaleDemandItem['priority']) => {
                    if (p === 'Urgent') return <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/15 text-rose-600 border border-rose-500/30">URGENT</span>;
                    if (p === 'High') return <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-600 border border-amber-500/30">HIGH</span>;
                    return <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500">NORMAL</span>;
                  };

                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      {/* Article & Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs">
                          {item.productName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                            Art: {item.articleCode}
                          </span>
                          {item.productId && (
                            <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                              Linked to Catalog
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Brand & Category */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-amber-600 dark:text-amber-400 block text-xs">
                          {item.brand}
                        </span>
                        <span className="text-[10px] text-zinc-500 block font-mono">
                          {item.category}
                        </span>
                      </td>

                      {/* Sizes & Color */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                          UK {item.sizes}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          Color: {item.color}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-black text-amber-600 dark:text-amber-400 text-sm block">
                          {item.quantityDemanded} <span className="text-[10px] text-zinc-400 uppercase">{item.unitType}</span>
                        </span>
                        {getPriorityBadge(item.priority)}
                      </td>

                      {/* Est Price & Total */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-zinc-500 text-[10px] block">
                          @ ₹{item.estimatedPricePerPair} / pair
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                          ₹{item.totalEstimatedCost.toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Wholesaler */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300 block text-xs truncate max-w-[140px]">
                          {item.wholesalerName}
                        </span>
                        {item.notes && (
                          <span className="text-[10px] text-zinc-400 truncate max-w-[140px] block italic">
                            "{item.notes}"
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="relative inline-block">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value as WholesaleDemandItem['status'])}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-extrabold uppercase border cursor-pointer ${getStatusColor(item.status)}`}
                          >
                            <option value="Pending Demand">1. Pending Demand</option>
                            <option value="Ordered to Wholesaler">2. Ordered to Wholesaler</option>
                            <option value="In Transit">3. In Transit</option>
                            <option value="Received in Shop">4. Received in Shop</option>
                            <option value="Cancelled">5. Cancelled</option>
                          </select>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleShareOnWhatsApp(item)}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-colors cursor-pointer"
                            title="Share single demand with wholesaler"
                          >
                            <Share2 size={13} />
                          </button>
                          <button
                            onClick={() => handleEditDemand(item)}
                            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                            title="Edit demand details"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteDemand(item.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors cursor-pointer"
                            title="Delete demand"
                          >
                            <Trash2 size={13} />
                          </button>
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

      {/* MODAL: Add / Edit Demand Article */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-xl w-full shadow-2xl p-6 relative space-y-4 my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <Truck size={20} className="text-amber-500" />
              <h3 className="font-black text-lg text-zinc-900 dark:text-white">
                {editingDemand ? 'Edit Wholesaler Demand Article' : 'Add New Wholesaler Demand Article'}
              </h3>
            </div>

            <form onSubmit={handleSaveDemand} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Product Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Footwear Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="e.g. Walkaroo Men Fancy Sport Sandal"
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-medium"
                  />
                </div>

                {/* Article Code */}
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Article Code / Ref #</label>
                  <input
                    type="text"
                    value={formData.articleCode}
                    onChange={(e) => setFormData({ ...formData, articleCode: e.target.value })}
                    placeholder="e.g. WALK-901"
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-mono"
                  />
                </div>

                {/* Brand */}
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Brand Name</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Walkaroo, Paragon, Sparx"
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>

                {/* Sizes */}
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Sizes Demanded</label>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="e.g. 6,7,8,9,10"
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-mono"
                  />
                </div>

                {/* Color */}
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Color Shade</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g. Black / Tan / Navy"
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>

                {/* Demanded Quantity */}
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Quantity Needed</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.quantityDemanded}
                      onChange={(e) => setFormData({ ...formData, quantityDemanded: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-mono font-bold"
                    />
                    <select
                      value={formData.unitType}
                      onChange={(e) => setFormData({ ...formData, unitType: e.target.value as any })}
                      className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-mono"
                    >
                      <option value="pairs">Pairs</option>
                      <option value="cartons">Cartons</option>
                      <option value="boxes">Boxes</option>
                    </select>
                  </div>
                </div>

                {/* Est Price Per Pair */}
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Est. Wholesaler Price / Pair (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimatedPricePerPair}
                    onChange={(e) => setFormData({ ...formData, estimatedPricePerPair: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-mono"
                  />
                </div>

                {/* Priority */}
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Order Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                {/* Wholesaler Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Wholesaler Name / Market Location</label>
                  <input
                    type="text"
                    value={formData.wholesalerName}
                    onChange={(e) => setFormData({ ...formData, wholesalerName: e.target.value })}
                    placeholder="e.g. Agra Footwear Wholesale Market, Delhi Trader Agency"
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Demand Notes / Backlog Reference</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Customer demand requests, size shortages, or seasonal urgency..."
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Total Calculation Preview */}
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between font-mono">
                <span className="text-amber-800 dark:text-amber-300 font-bold text-xs">Total Estimated Market Budget:</span>
                <span className="text-amber-900 dark:text-amber-200 font-black text-base">
                  ₹{(formData.quantityDemanded * formData.estimatedPricePerPair).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold uppercase tracking-wider cursor-pointer transition-all shadow-md"
                >
                  {editingDemand ? 'Update Demand' : 'Save Demand Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Select Article From Existing Catalog */}
      {isCatalogPickerOpen && (
        <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-3xl w-full shadow-2xl p-6 relative space-y-4 my-8">
            <button
              onClick={() => setIsCatalogPickerOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <Package size={20} className="text-amber-500" />
              <div>
                <h3 className="font-black text-lg text-zinc-900 dark:text-white">
                  Pick Footwear Article From Store Catalog
                </h3>
                <p className="text-xs text-zinc-500 font-sans">
                  Select any existing product from your shop to create a wholesaler demand order for it.
                </p>
              </div>
            </div>

            {/* Catalog Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3 text-zinc-400" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Search catalog by article code, name, brand, category..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-mono border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Catalog Items Grid */}
            <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
              {products
                .filter(p => !catalogSearch || p.name.toLowerCase().includes(catalogSearch.toLowerCase()) || p.id.toLowerCase().includes(catalogSearch.toLowerCase()) || (p.brand && p.brand.toLowerCase().includes(catalogSearch.toLowerCase())))
                .map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectFromCatalog(product)}
                    className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 bg-zinc-50/50 dark:bg-zinc-950/50 hover:bg-amber-500/5 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-500 font-black text-xs font-mono">
                          {product.brand?.slice(0, 3) || 'ART'}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                            {product.name}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                            {product.brand}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 mt-1">
                          <span>Art ID: {product.id}</span>
                          <span>•</span>
                          <span>Category: {product.category}</span>
                          <span>•</span>
                          <span>Stock: {product.stock} pairs</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wider group-hover:scale-105 transition-transform shrink-0"
                    >
                      Select Article &rarr;
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
