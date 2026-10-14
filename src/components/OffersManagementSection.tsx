import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tag, Plus, Percent, Flame, Sparkles, CheckCircle2, Trash2, 
  Edit3, Calendar, Copy, Check, X, ArrowRight, ShieldCheck, 
  ShoppingBag, Clock, AlertTriangle, IndianRupee, Layers
} from 'lucide-react';
import { Product } from '../types';
import { CLEARANCE_OFFERS_STORAGE_KEY, CLEARANCE_OFFERS_EVENT } from '../utils/clearanceOffers';

export interface PromoOfferDeal {
  id: string;
  title: string;
  code: string;
  discountType: 'percentage' | 'flat' | 'bogo' | 'clearance';
  discountValue: number;
  targetCategory: string;
  targetBrand: string;
  expiryDate: string;
  badgeTag: string;
  status: 'active' | 'paused';
  description?: string;
}

const DEFAULT_OFFERS: PromoOfferDeal[] = [
  {
    id: 'off-001',
    title: 'Walkaroo Festive Special',
    code: 'WALKAROO20',
    discountType: 'percentage',
    discountValue: 20,
    targetCategory: 'All',
    targetBrand: 'Walkaroo',
    expiryDate: '2026-12-31',
    badgeTag: '20% OFF FESTIVE',
    status: 'active',
    description: 'Flat 20% discount on all Walkaroo daily wear sandals and slippers.'
  },
  {
    id: 'off-002',
    title: 'Paragon Buy 1 Get 1 (BOGO)',
    code: 'PARAGONBOGO',
    discountType: 'bogo',
    discountValue: 50,
    targetCategory: 'Men',
    targetBrand: 'Paragon',
    expiryDate: '2026-10-31',
    badgeTag: 'BUY 1 GET 1 FREE',
    status: 'active',
    description: 'Special store counter BOGO deal on selected Paragon men models.'
  },
  {
    id: 'off-003',
    title: 'End of Season Warehouse Clearance',
    code: 'CLEARANCE40',
    discountType: 'clearance',
    discountValue: 40,
    targetCategory: 'All',
    targetBrand: 'All',
    expiryDate: '2026-09-30',
    badgeTag: 'FLAT 40% CLEARANCE',
    status: 'active',
    description: 'Liquidating aged warehouse pairs and end-of-series footwear.'
  }
];

interface OffersManagementSectionProps {
  products: Product[];
  isDark: boolean;
  onUpdateProduct?: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
}

export const OffersManagementSection: React.FC<OffersManagementSectionProps> = ({
  products,
  isDark,
  onUpdateProduct
}) => {
  const [offersList, setOffersList] = useState<PromoOfferDeal[]>(() => {
    try {
      const saved = localStorage.getItem('prashant_managed_offers');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_OFFERS;
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingOffer, setEditingOffer] = useState<PromoOfferDeal | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [dealToDelete, setDealToDelete] = useState<PromoOfferDeal | null>(null);

  // Clearance Quick Markdown Tool state
  const [selectedClearanceProduct, setSelectedClearanceProduct] = useState<string>('');
  const [clearanceDiscount, setClearanceDiscount] = useState<number>(30);
  const [isApplyingClearance, setIsApplyingClearance] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    discountType: 'percentage' as PromoOfferDeal['discountType'],
    discountValue: 20,
    targetCategory: 'All',
    targetBrand: 'All',
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    badgeTag: 'HOT DEAL',
    description: ''
  });

  // Save offers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('prashant_managed_offers', JSON.stringify(offersList));
    } catch (e) {}
  }, [offersList]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    showToast(`Copied code: ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleStartEdit = (deal: PromoOfferDeal) => {
    setEditingOffer(deal);
    setFormData({
      title: deal.title,
      code: deal.code,
      discountType: deal.discountType,
      discountValue: deal.discountValue,
      targetCategory: deal.targetCategory,
      targetBrand: deal.targetBrand,
      expiryDate: deal.expiryDate,
      badgeTag: deal.badgeTag,
      description: deal.description || ''
    });
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingOffer(null);
    setFormData({
      title: '',
      code: '',
      discountType: 'percentage',
      discountValue: 20,
      targetCategory: 'All',
      targetBrand: 'All',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      badgeTag: 'HOT DEAL',
      description: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.code.trim()) {
      alert('Please enter Deal Title and Promo Code.');
      return;
    }

    if (editingOffer) {
      setOffersList(prev => prev.map(d => {
        if (d.id === editingOffer.id) {
          return {
            ...d,
            title: formData.title.trim(),
            code: formData.code.trim().toUpperCase(),
            discountType: formData.discountType,
            discountValue: Number(formData.discountValue),
            targetCategory: formData.targetCategory,
            targetBrand: formData.targetBrand,
            expiryDate: formData.expiryDate,
            badgeTag: formData.badgeTag.trim().toUpperCase(),
            description: formData.description.trim()
          };
        }
        return d;
      }));
      showToast(`Updated deal "${formData.title}"!`);
    } else {
      const newDeal: PromoOfferDeal = {
        id: `off-${Date.now()}`,
        title: formData.title.trim(),
        code: formData.code.trim().toUpperCase(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        targetCategory: formData.targetCategory,
        targetBrand: formData.targetBrand,
        expiryDate: formData.expiryDate,
        badgeTag: formData.badgeTag.trim().toUpperCase() || 'HOT DEAL',
        status: 'active',
        description: formData.description.trim()
      };
      setOffersList(prev => [newDeal, ...prev]);
      showToast(`Published promo deal "${formData.title}"!`);
    }
    handleCancel();
  };

  const toggleDealStatus = (id: string) => {
    setOffersList(prev => prev.map(d => {
      if (d.id === id) {
        const next = d.status === 'active' ? 'paused' : 'active';
        showToast(`Offer is now ${next.toUpperCase()}`);
        return { ...d, status: next };
      }
      return d;
    }));
  };

  const handleDeleteDeal = () => {
    if (!dealToDelete) return;
    setOffersList(prev => prev.filter(d => d.id !== dealToDelete.id));
    showToast(`Deleted deal "${dealToDelete.title}".`);
    setDealToDelete(null);
  };

  // Apply clearance discount to a specific product
  const handleApplyProductClearance = async () => {
    if (!selectedClearanceProduct || !onUpdateProduct) return;
    const targetProd = products.find(p => p.id === selectedClearanceProduct);
    if (!targetProd) return;

    setIsApplyingClearance(true);
    try {
      const origPrice = targetProd.mrp || targetProd.price;
      const discountedPrice = Math.round(origPrice * (1 - clearanceDiscount / 100));

      const res = await onUpdateProduct(targetProd.id, {
        mrp: origPrice,
        price: discountedPrice,
        discountPercentage: clearanceDiscount,
        updatedAt: new Date().toISOString()
      });

      if (res.success) {
        showToast(`Applied ${clearanceDiscount}% clearance discount to "${targetProd.name}" (Now ₹${discountedPrice})!`);
        setSelectedClearanceProduct('');
      } else {
        alert(res.error || 'Failed to update product discount');
      }
    } catch (e) {
      alert('Error updating clearance product');
    } finally {
      setIsApplyingClearance(false);
    }
  };

  return (
    <div id="offers-management-section" className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-[100] animate-bounce px-4 py-3 rounded-2xl bg-emerald-600 text-white font-mono text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-400">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className={`p-6 md:p-8 rounded-3xl border transition-all duration-300 shadow-xl ${
        isDark 
          ? 'bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border-zinc-800 text-white' 
          : 'bg-gradient-to-br from-white via-[#FAF7F2] to-amber-50/30 border-[#E8DFC2] text-zinc-900 shadow-amber-900/5'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                <Flame size={12} />
                Promotions & Discounts
              </span>
              <span className="text-xs font-mono text-zinc-500">
                {offersList.filter(o => o.status === 'active').length} Active Coupons Live
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight font-display">
              Offers & Clearance Deals
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Create coupon codes, launch brand discount campaigns, BOGO deals, and liquidate warehouse clearance stock.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingOffer(null);
              setIsAdding(true);
            }}
            className="px-5 py-3 rounded-2xl bg-[#C5A059] hover:bg-[#b08e4d] text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-[#C5A059]/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95 self-start md:self-auto"
          >
            <Plus size={16} className="stroke-[3px]" />
            <span>+ Create New Offer</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Deal Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-2xl transition-all ${
          isDark ? 'bg-zinc-900/90 border-zinc-800 text-white' : 'bg-white border-[#E8DFC2] text-zinc-900'
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-[#C5A059]/15 text-[#C5A059]">
                <Tag size={20} />
              </div>
              <div>
                <h3 className="font-black text-base uppercase font-display">
                  {editingOffer ? `Edit Deal: ${editingOffer.title}` : 'Create New Promotional Offer'}
                </h3>
                <p className="text-xs font-mono text-zinc-500">
                  Configure promo code, discount %, target brand/category, and badge text.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">Offer Campaign Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Walkaroo Festival 25% Off"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">Coupon Promo Code</label>
              <input
                type="text"
                required
                placeholder="e.g. WALKAROO25"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className={`w-full p-2.5 rounded-xl border text-xs font-mono font-bold tracking-wider outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as any }))}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                }`}
              >
                <option value="percentage">Percentage OFF (%)</option>
                <option value="flat">Flat Cash Discount (₹)</option>
                <option value="bogo">Buy 1 Get 1 Free (BOGO)</option>
                <option value="clearance">Warehouse Clearance Markdown</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">Discount Value (e.g. 25% or ₹200)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.discountValue}
                onChange={(e) => setFormData(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                className={`w-full p-2.5 rounded-xl border text-xs font-mono font-bold outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">Badge Label Tag</label>
              <input
                type="text"
                placeholder="e.g. 25% OFF FESTIVAL"
                value={formData.badgeTag}
                onChange={(e) => setFormData(prev => ({ ...prev, badgeTag: e.target.value.toUpperCase() }))}
                className={`w-full p-2.5 rounded-xl border text-xs font-mono outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">Target Category</label>
              <select
                value={formData.targetCategory}
                onChange={(e) => setFormData(prev => ({ ...prev, targetCategory: e.target.value }))}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                }`}
              >
                <option value="All">All Categories</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">Target Brand</label>
              <select
                value={formData.targetBrand}
                onChange={(e) => setFormData(prev => ({ ...prev, targetBrand: e.target.value }))}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                }`}
              >
                <option value="All">All Brands</option>
                <option value="Walkaroo">Walkaroo</option>
                <option value="VKC Pride">VKC Pride</option>
                <option value="Paragon">Paragon</option>
                <option value="Campus">Campus</option>
                <option value="Sparx">Sparx</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                className={`w-full p-2.5 rounded-xl border text-xs font-mono outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase font-mono text-zinc-500">Terms / Description</label>
            <textarea
              rows={2}
              placeholder="Describe offer conditions, valid models, minimum bill value..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-500 font-bold text-xs uppercase cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#b08e4d] text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-[#C5A059]/25"
            >
              <Check size={14} className="stroke-[3px]" />
              <span>{editingOffer ? 'Save Changes' : 'Publish Offer'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Quick Clearance Markdown Tool */}
      {onUpdateProduct && (
        <div className={`p-6 rounded-3xl border transition-all ${
          isDark ? 'bg-zinc-900/60 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
              <Percent size={16} />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase font-display">
                Quick Clearance Markdown Tool
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                Select any registered shoe article to apply an instant liquidation discount.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <select
              value={selectedClearanceProduct}
              onChange={(e) => setSelectedClearanceProduct(e.target.value)}
              className={`p-2.5 rounded-xl border text-xs font-mono outline-none ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
              }`}
            >
              <option value="">-- Choose Footwear Article --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.brand || 'Walkaroo'}) - MRP ₹{p.mrp || p.price}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500">Discount:</span>
              <div className="flex gap-1">
                {[20, 30, 40, 50].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setClearanceDiscount(pct)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                      clearanceDiscount === pct ? 'bg-[#C5A059] text-zinc-950 font-black' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyProductClearance}
              disabled={!selectedClearanceProduct || isApplyingClearance}
              className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase font-mono flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Flame size={14} />
              <span>Apply Markdown</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Promo Deals Grid */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 space-y-5 ${
        isDark ? 'bg-zinc-900/60 border-zinc-800 text-white shadow-xl' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
      }`}>
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider font-display flex items-center gap-2">
              <Flame size={16} className="text-rose-500" />
              <span>Active Promotions & Store Deals</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Discounts applicable at POS retail counter and customer mobile portal.</p>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-[#C5A059]/15 text-[#C5A059] font-mono text-xs font-bold border border-[#C5A059]/30">
            {offersList.length} Total Offers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offersList.map(deal => {
            const isActive = deal.status === 'active';

            return (
              <div 
                key={deal.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all relative overflow-hidden ${
                  isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-slate-50/70 border-zinc-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-500 border border-rose-500/30">
                      {deal.badgeTag}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleDealStatus(deal.id)}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase cursor-pointer border ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                          : 'bg-zinc-500/15 text-zinc-500 border-zinc-500/30'
                      }`}
                    >
                      {isActive ? 'Active' : 'Paused'}
                    </button>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm font-sans">{deal.title}</h4>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{deal.description}</p>
                  </div>

                  {/* Promo Code Box */}
                  <div className="p-2.5 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-zinc-500 font-mono uppercase block">Coupon Code:</span>
                      <span className="font-mono font-black text-sm text-[#C5A059]">{deal.code}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(deal.code)}
                      className="p-1.5 rounded-lg bg-[#C5A059] hover:bg-[#b08e4d] text-zinc-950 font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode === deal.code ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedCode === deal.code ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Meta */}
                  <div className="text-[10px] font-mono text-zinc-500 space-y-0.5 pt-1">
                    <div>Target: <span className="font-bold text-zinc-700 dark:text-zinc-300">{deal.targetBrand} • {deal.targetCategory}</span></div>
                    <div>Expires: <span className="font-bold text-zinc-700 dark:text-zinc-300">{deal.expiryDate}</span></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(deal)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Edit3 size={11} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDealToDelete(deal)}
                    className="p-1 rounded-lg hover:bg-rose-500/20 text-zinc-400 hover:text-rose-500 cursor-pointer transition-all"
                    title="Delete Deal"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {dealToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 ${
            isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-100' : 'bg-white border border-slate-200 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center">
              <h4 className="font-black text-base uppercase font-display">Delete Offer Deal?</h4>
              <p className="text-xs text-zinc-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-zinc-900 dark:text-white">"{dealToDelete.title}"</span>?
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDealToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-500 font-bold text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDeal}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-rose-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
