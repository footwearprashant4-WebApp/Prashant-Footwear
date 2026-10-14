import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ShoppingBag, Plus, Search, Filter, Edit3, Trash2, CheckCircle2, 
  Image as ImageIcon, Upload, X, Check, ArrowRight, IndianRupee,
  Layers, Tag, Sparkles, AlertCircle, RefreshCw, QrCode, SlidersHorizontal, Eye
} from 'lucide-react';
import { Product, Category, SubCategory } from '../types';

const BRANDS_LIST = [
  'Walkaroo', 'VKC Pride', 'Paragon', 'Aqualite', 'Campus', 
  'Sparx', 'Relaxo', 'Liberty', 'Action', 'Flite', 'Puma', 'Nike', 'Adidas', 'Other'
];

const CATEGORIES: Category[] = ['Men', 'Women', 'Kids'];
const SUB_CATEGORIES: SubCategory[] = ['Office Wear', 'Sandals', 'Casuals', 'Shoes', 'Stylish Wear', 'Fashionable', 'Others'];
const AVAILABLE_SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

interface CatalogueManagementSectionProps {
  products: Product[];
  isDark: boolean;
  onAddProduct: (product: Omit<Product, 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  onDeleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  initialIsAdding?: boolean;
}

export const CatalogueManagementSection: React.FC<CatalogueManagementSectionProps> = ({
  products,
  isDark,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  initialIsAdding = false,
}) => {
  const [isAdding, setIsAdding] = useState(initialIsAdding);

  useEffect(() => {
    if (initialIsAdding) {
      setIsAdding(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [initialIsAdding]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | Category>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Deletion confirm modal
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    brand: string;
    customBrand: string;
    category: Category;
    subCategory: SubCategory;
    rawArticleCode: string;
    price: number;
    mrp: number;
    description: string;
    imageUrl: string;
    imageUrls: string[];
    sizes: number[];
    sizeStock: Record<string, number>;
  }>({
    name: '',
    brand: 'Walkaroo',
    customBrand: '',
    category: 'Men',
    subCategory: 'Casuals',
    rawArticleCode: '',
    price: 499,
    mrp: 699,
    description: '',
    imageUrl: '',
    imageUrls: [],
    sizes: [6, 7, 8, 9, 10],
    sizeStock: { '6': 10, '7': 15, '8': 20, '9': 15, '10': 10 }
  });

  const [customSizeInput, setCustomSizeInput] = useState('');

  const handleAddCustomProductSize = () => {
    if (!customSizeInput.trim()) return;
    const num = parseFloat(customSizeInput.trim());
    if (!isNaN(num)) {
      if (!formData.sizes.includes(num)) {
        setFormData(prev => ({
          ...prev,
          sizes: [...prev.sizes, num].sort((a, b) => a - b),
          sizeStock: { ...prev.sizeStock, [String(num)]: prev.sizeStock[String(num)] || 10 }
        }));
      }
    }
    setCustomSizeInput('');
  };

  const availableBrands = useMemo(() => {
    const set = new Set<string>(BRANDS_LIST);
    products.forEach(p => {
      if (p.brand) set.add(p.brand);
    });
    return ['All', ...Array.from(set).sort()];
  }, [products]);

  // Open Edit Mode
  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    const brand = product.brand || 'Walkaroo';
    const isStandardBrand = BRANDS_LIST.includes(brand);

    setFormData({
      name: product.name,
      brand: isStandardBrand ? brand : 'Other',
      customBrand: isStandardBrand ? '' : brand,
      category: product.category,
      subCategory: product.subCategory,
      rawArticleCode: product.rawArticleCode || product.articleCode || '',
      price: product.price,
      mrp: product.mrp || Math.round(product.price * 1.25),
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      imageUrls: product.imageUrls || (product.imageUrl ? [product.imageUrl] : []),
      sizes: product.sizes || [6, 7, 8, 9, 10],
      sizeStock: product.sizeStock || {}
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset form
  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: 'Walkaroo',
      customBrand: '',
      category: 'Men',
      subCategory: 'Casuals',
      rawArticleCode: '',
      price: 499,
      mrp: 699,
      description: '',
      imageUrl: '',
      imageUrls: [],
      sizes: [6, 7, 8, 9, 10],
      sizeStock: { '6': 10, '7': 15, '8': 20, '9': 15, '10': 10 }
    });
  };

  // Image Upload via FileReader
  const handleImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const base64 = loadEvt.target?.result as string;
        if (base64) {
          setFormData(prev => {
            const nextList = [...prev.imageUrls, base64];
            return {
              ...prev,
              imageUrl: prev.imageUrl || base64,
              imageUrls: nextList
            };
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Save or Update Product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter product name.');
      return;
    }

    const effectiveBrand = formData.brand === 'Other' 
      ? (formData.customBrand.trim() || 'Custom')
      : formData.brand;

    const brandPrefix = effectiveBrand.slice(0, 3).toUpperCase();
    const cleanRawCode = formData.rawArticleCode.trim().toUpperCase() || Math.random().toString(36).substring(2, 6).toUpperCase();
    const articleCode = `${brandPrefix}-${cleanRawCode}`;

    const totalStock = Object.values(formData.sizeStock).reduce((s, v) => s + Math.max(0, Number(v) || 0), 0);
    const discountPct = formData.mrp > formData.price 
      ? Math.round(((formData.mrp - formData.price) / formData.mrp) * 100)
      : 0;

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        // Update
        const res = await onUpdateProduct(editingProduct.id, {
          name: formData.name.trim(),
          brand: effectiveBrand,
          category: formData.category,
          subCategory: formData.subCategory,
          rawArticleCode: cleanRawCode,
          articleCode: articleCode,
          price: Number(formData.price),
          mrp: Number(formData.mrp),
          discountPercentage: discountPct,
          description: formData.description.trim(),
          imageUrl: formData.imageUrl || (formData.imageUrls[0] || ''),
          imageUrls: formData.imageUrls,
          sizes: formData.sizes,
          sizeStock: formData.sizeStock,
          stock: totalStock,
          updatedAt: new Date().toISOString()
        });

        if (res.success) {
          setSuccessToast(`Updated "${formData.name}" successfully!`);
          setTimeout(() => setSuccessToast(null), 3000);
          handleCancelForm();
        } else {
          alert(res.error || 'Failed to update product');
        }
      } else {
        // Add
        const newProductPayload: Omit<Product, 'createdAt'> = {
          id: `prod-${Date.now()}`,
          name: formData.name.trim(),
          brand: effectiveBrand,
          category: formData.category,
          subCategory: formData.subCategory,
          rawArticleCode: cleanRawCode,
          articleCode: articleCode,
          price: Number(formData.price),
          mrp: Number(formData.mrp),
          discountPercentage: discountPct,
          description: formData.description.trim() || `${effectiveBrand} ${formData.category} ${formData.subCategory}`,
          imageUrl: formData.imageUrl || (formData.imageUrls[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80'),
          imageUrls: formData.imageUrls.length > 0 ? formData.imageUrls : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80'],
          sizes: formData.sizes,
          sizeStock: formData.sizeStock,
          stock: totalStock
        };

        const res = await onAddProduct(newProductPayload);
        if (res.success) {
          setSuccessToast(`Added "${formData.name}" to Catalogue!`);
          setTimeout(() => setSuccessToast(null), 3000);
          handleCancelForm();
        } else {
          alert(res.error || 'Failed to add product');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error saving product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete product
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const res = await onDeleteProduct(productToDelete.id);
      if (res.success) {
        setSuccessToast(`Deleted "${productToDelete.name}" from catalog.`);
        setTimeout(() => setSuccessToast(null), 3000);
        setProductToDelete(null);
      } else {
        alert(res.error || 'Failed to delete product');
      }
    } catch (e) {
      alert('Error deleting product');
    }
  };

  // Filtered catalogue list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const pBrand = p.brand || 'Walkaroo';
      const matchesSearch = !q || 
        p.name.toLowerCase().includes(q) || 
        p.id.toLowerCase().includes(q) || 
        pBrand.toLowerCase().includes(q) ||
        (p.articleCode && p.articleCode.toLowerCase().includes(q)) ||
        (p.rawArticleCode && p.rawArticleCode.toLowerCase().includes(q));

      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesBrand = selectedBrand === 'All' || pBrand === selectedBrand;

      return matchesSearch && matchesCat && matchesBrand;
    });
  }, [products, searchQuery, selectedCategory, selectedBrand]);

  return (
    <div id="catalogue-management-section" className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-[100] animate-bounce px-4 py-3 rounded-2xl bg-emerald-600 text-white font-mono text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-400">
          <CheckCircle2 size={16} />
          <span>{successToast}</span>
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
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30 flex items-center gap-1">
                <Tag size={12} />
                Footwear Articles Master
              </span>
              <span className="text-xs font-mono text-zinc-500">
                {products.length} Active Shoes in Store
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight font-display">
              Catalogue Management
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Add new footwear models, configure high-res photos, set size ranges, MRP & retail pricing.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {!isAdding ? (
              <button
                id="catalogue-add-btn"
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setIsAdding(true);
                }}
                className="px-5 py-3 rounded-2xl bg-[#C5A059] hover:bg-[#b08e4d] text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-[#C5A059]/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Plus size={16} className="stroke-[3px]" />
                <span>+ Add New Article</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-4 py-2.5 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase cursor-pointer"
              >
                Close Editor
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Product Form Panel */}
      {isAdding && (
        <form onSubmit={handleSubmit} className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-2xl transition-all ${
          isDark ? 'bg-zinc-900/80 border-zinc-800 text-white' : 'bg-white border-[#E8DFC2] text-zinc-900'
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-[#C5A059]/15 text-[#C5A059]">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h3 className="font-black text-base uppercase font-display">
                  {editingProduct ? `Edit Article: ${editingProduct.name}` : 'Add New Footwear Article'}
                </h3>
                <p className="text-xs font-mono text-zinc-500">
                  {editingProduct ? 'Update photos, pricing, and article specification' : 'Register brand, article code, sizes, and pricing'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancelForm}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Brand */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">Brand Name</label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                }`}
              >
                {BRANDS_LIST.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {formData.brand === 'Other' && (
                <input
                  type="text"
                  placeholder="Enter Custom Brand Name..."
                  value={formData.customBrand}
                  onChange={(e) => setFormData(prev => ({ ...prev, customBrand: e.target.value }))}
                  className={`w-full mt-2 p-2.5 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                  }`}
                />
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">Target Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Category }))}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                }`}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* SubCategory */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">Footwear Type / Sub-Category</label>
              <select
                value={formData.subCategory}
                onChange={(e) => setFormData(prev => ({ ...prev, subCategory: e.target.value as SubCategory }))}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                }`}
              >
                {SUB_CATEGORIES.map(sc => (
                  <option key={sc} value={sc}>{sc}</option>
                ))}
              </select>
            </div>

            {/* Article Name */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">Product / Shoe Model Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Walkaroo Men Casual Slip-On Sandal"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            {/* Raw Article Code */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">Article Number / Code</label>
              <input
                type="text"
                placeholder="e.g. 5203 or ART-90"
                value={formData.rawArticleCode}
                onChange={(e) => setFormData(prev => ({ ...prev, rawArticleCode: e.target.value }))}
                className={`w-full p-2.5 rounded-xl border text-xs font-mono uppercase outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            {/* Pricing: MRP & Selling Price */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">MRP (Printed ₹)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.mrp}
                onChange={(e) => setFormData(prev => ({ ...prev, mrp: Number(e.target.value) }))}
                className={`w-full p-2.5 rounded-xl border text-xs font-mono font-bold outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">Retail Selling Price (₹)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                className={`w-full p-2.5 rounded-xl border text-xs font-mono font-bold outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            {/* Discount Display */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">Calculated Discount</label>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono text-xs font-black">
                {formData.mrp > formData.price
                  ? `${Math.round(((formData.mrp - formData.price) / formData.mrp) * 100)}% OFF`
                  : '0% (Sold at MRP)'}
              </div>
            </div>
          </div>

          {/* Sizes Selection & Quantities */}
          <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <label className="text-[11px] font-black uppercase font-mono text-zinc-500 block">
                  Allotted Sizes & Initial Stock Matrix
                </label>
                <span className="text-[10px] text-zinc-400 font-mono">Allot sizes for this article to enable stock inwards</span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const newSizes = [6, 7, 8, 9, 10];
                    const newStock: Record<string, number> = {};
                    newSizes.forEach(s => { newStock[String(s)] = formData.sizeStock[String(s)] ?? 10; });
                    setFormData(prev => ({ ...prev, sizes: newSizes, sizeStock: newStock }));
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 cursor-pointer"
                >
                  Men (6-10)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newSizes = [4, 5, 6, 7, 8];
                    const newStock: Record<string, number> = {};
                    newSizes.forEach(s => { newStock[String(s)] = formData.sizeStock[String(s)] ?? 10; });
                    setFormData(prev => ({ ...prev, sizes: newSizes, sizeStock: newStock }));
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 cursor-pointer"
                >
                  Women (4-8)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newSizes = [1, 2, 3, 4, 5];
                    const newStock: Record<string, number> = {};
                    newSizes.forEach(s => { newStock[String(s)] = formData.sizeStock[String(s)] ?? 10; });
                    setFormData(prev => ({ ...prev, sizes: newSizes, sizeStock: newStock }));
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 cursor-pointer"
                >
                  Kids (1-5)
                </button>
              </div>
            </div>

            {/* Size checkboxes */}
            <div className="flex flex-wrap gap-1.5 items-center">
              {Array.from(new Set([...AVAILABLE_SIZES, ...formData.sizes])).sort((a, b) => a - b).map(sz => {
                const isSelected = formData.sizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setFormData(prev => ({
                          ...prev,
                          sizes: prev.sizes.filter(s => s !== sz)
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          sizes: [...prev.sizes, sz].sort((a, b) => a - b),
                          sizeStock: { ...prev.sizeStock, [String(sz)]: prev.sizeStock[String(sz)] || 10 }
                        }));
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFA000] text-[#141311] shadow-2xs font-black'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Size {sz}
                  </button>
                );
              })}
            </div>

            {/* Add Custom / Other Size manually */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                step="0.5"
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                placeholder="Other Size (e.g. 14, 15)"
                className="w-40 px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono font-bold outline-none text-zinc-900 dark:text-white focus:border-[#FFA000]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomProductSize();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomProductSize}
                disabled={!customSizeInput.trim()}
                className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-750 text-zinc-800 dark:text-zinc-200 hover:bg-[#FFA000] hover:text-black text-xs font-sans font-bold cursor-pointer disabled:opacity-40 transition-colors"
              >
                + Allot Other Size
              </button>
            </div>

            {/* Size-wise stock quantities */}
            {formData.sizes.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2 pt-2">
                {formData.sizes.map(sz => (
                  <div key={sz} className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
                    <span className="text-[10px] font-bold text-zinc-500 block">Size {sz} Qty</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.sizeStock[String(sz)] ?? 0}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                        setFormData(prev => ({
                          ...prev,
                          sizeStock: { ...prev.sizeStock, [String(sz)]: val }
                        }));
                      }}
                      className={`w-full text-center py-1 mt-1 rounded border text-xs font-mono font-bold outline-none ${
                        isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-zinc-900'
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Photos & Upload */}
          <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">
                Product Photos & High-Res Gallery
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <Upload size={12} />
                <span>Upload From Device</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageFiles}
                className="hidden"
              />
            </div>

            {/* Direct Image URL input */}
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Or paste direct image URL (https://...)..."
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                className={`flex-1 p-2.5 rounded-xl border text-xs font-mono outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                }`}
              />
              <button
                type="button"
                onClick={() => {
                  if (formData.imageUrl && !formData.imageUrls.includes(formData.imageUrl)) {
                    setFormData(prev => ({
                      ...prev,
                      imageUrls: [...prev.imageUrls, prev.imageUrl]
                    }));
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-[#C5A059] text-zinc-950 font-bold text-xs uppercase cursor-pointer"
              >
                Add URL
              </button>
            </div>

            {/* Thumbnails list */}
            {formData.imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.imageUrls.map((img, idx) => (
                  <div key={idx} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-700">
                    <img src={img} alt="Product" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const next = formData.imageUrls.filter((_, i) => i !== idx);
                        setFormData(prev => ({
                          ...prev,
                          imageUrls: next,
                          imageUrl: next[0] || ''
                        }));
                      }}
                      className="absolute top-1 right-1 p-0.5 rounded bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleCancelForm}
              className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-500 font-bold text-xs uppercase cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#b08e4d] text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-[#C5A059]/25 disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Check size={14} className="stroke-[3px]" />
              )}
              <span>{editingProduct ? 'Save Changes' : 'Publish Article'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Catalogue Explorer & Products List */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 space-y-5 ${
        isDark ? 'bg-zinc-900/60 border-zinc-800 text-white shadow-xl' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
      }`}>
        {/* Search & Filters */}
        <div className="space-y-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Model Name, Article Code (5203), Brand..."
                className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border outline-none font-mono transition-all ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white focus:border-[#C5A059]' : 'bg-slate-50 border-zinc-200 text-zinc-900 focus:border-[#C5A059]'
                }`}
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-[#C5A059] text-zinc-950 shadow-xs' : 'text-zinc-500'
                }`}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-[#C5A059] text-zinc-950 shadow-xs' : 'text-zinc-500'
                }`}
              >
                Table
              </button>
            </div>
          </div>

          {/* Category & Brand Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {(['All', 'Men', 'Women', 'Kids'] as const).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === c
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                      : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold">Brand:</span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className={`text-xs font-mono py-1 px-3 rounded-lg border outline-none cursor-pointer ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800'
                }`}
              >
                {availableBrands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Display (Grid vs Table) */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <ShoppingBag size={24} className="mx-auto text-zinc-400" />
            <p className="text-xs font-mono text-zinc-500">No products found matching the criteria.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => {
              const brand = product.brand || 'Walkaroo';
              const totalStock = Number(product.stock) || (product.sizeStock ? Object.values(product.sizeStock).reduce((s, v) => s + (Number(v) || 0), 0) : 0);

              return (
                <div 
                  key={product.id}
                  className={`rounded-2xl border p-4 flex flex-col justify-between transition-all hover:shadow-lg ${
                    isDark ? 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700' : 'bg-slate-50/70 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Thumbnail */}
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 relative">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <ShoppingBag size={24} />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 text-white font-mono text-[9px] font-bold uppercase backdrop-blur-xs">
                        {brand}
                      </span>
                    </div>

                    {/* Meta */}
                    <div>
                      <h4 className="font-bold text-xs font-sans line-clamp-1">{product.name}</h4>
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-1">
                        <span>{product.articleCode || product.rawArticleCode || product.id}</span>
                        <span>{product.category} • {product.subCategory}</span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-sm text-[#C5A059]">₹{product.price}</span>
                        {product.mrp && product.mrp > product.price && (
                          <span className="text-[10px] text-zinc-400 line-through">₹{product.mrp}</span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold font-mono ${totalStock > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {totalStock} in stock
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(product)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Edit3 size={11} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductToDelete(product)}
                      className="p-1 rounded-lg hover:bg-rose-500/20 text-zinc-400 hover:text-rose-500 cursor-pointer transition-all"
                      title="Delete Product"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className={`border-b text-[10px] uppercase font-black tracking-wider ${
                  isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-500'
                }`}>
                  <th className="pb-3 px-2">Article</th>
                  <th className="pb-3 px-2">Category</th>
                  <th className="pb-3 px-2 text-right">Selling Price</th>
                  <th className="pb-3 px-2 text-right">MRP</th>
                  <th className="pb-3 px-2 text-center">Stock</th>
                  <th className="pb-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                {filteredProducts.map(product => {
                  const totalStock = Number(product.stock) || (product.sizeStock ? Object.values(product.sizeStock).reduce((s, v) => s + (Number(v) || 0), 0) : 0);
                  return (
                    <tr key={product.id} className="hover:bg-[#C5A059]/5 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <img src={product.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                          <div>
                            <span className="font-sans font-bold block">{product.name}</span>
                            <span className="text-[10px] text-[#C5A059]">{product.brand} • {product.articleCode || product.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">{product.category} / {product.subCategory}</td>
                      <td className="py-3 px-2 text-right font-bold text-[#C5A059]">₹{product.price}</td>
                      <td className="py-3 px-2 text-right text-zinc-400">₹{product.mrp || '-'}</td>
                      <td className="py-3 px-2 text-center font-bold">{totalStock}</td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(product)}
                            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(product)}
                            className="p-1 rounded hover:bg-rose-500/20 text-zinc-400 hover:text-rose-500 cursor-pointer"
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

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 ${
            isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-100' : 'bg-white border border-slate-200 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center">
              <h4 className="font-black text-base uppercase font-display">Delete Article?</h4>
              <p className="text-xs text-zinc-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-zinc-900 dark:text-white">"{productToDelete.name}"</span>? This will remove it from the catalog and inventory counters.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-500 font-bold text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
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
