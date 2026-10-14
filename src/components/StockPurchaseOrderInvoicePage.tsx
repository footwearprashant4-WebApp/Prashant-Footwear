import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  PlusCircle, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  Package, 
  Search, 
  X, 
  Building2, 
  Phone, 
  Calendar, 
  DollarSign, 
  Save, 
  Share2, 
  Check, 
  Layers, 
  Tag, 
  Hash, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  ShoppingBag,
  Filter,
  RotateCcw,
  Store,
  MapPin,
  MessageCircle,
  Plus,
  Minus,
  List,
  Eye,
  Edit3,
  Truck,
  AlertCircle,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { Product } from '../types';
import { useProducts } from '../context/ProductContext';

export interface StockPurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  articleCode: string;
  category: string;
  colorName?: string;
  size?: string;
  sizesList?: number[];
  sizeQuantities?: Record<number, number>;
  quantityPairs: number;
  quantityDozens: number;
  costPricePerPair: number;
  totalCost: number;
}

// Color Registry definition for footwear articles
const COLOR_REGISTRY: Record<number, { name: string; hex: string }> = {
  1: { name: 'Black', hex: '#000000' },
  2: { name: 'Brown', hex: '#7C4B27' },
  3: { name: 'Tan', hex: '#B87333' },
  4: { name: 'White', hex: '#FFFFFF' },
  5: { name: 'Cherry', hex: '#7A1C1C' },
  6: { name: 'Olive', hex: '#556B2F' },
  7: { name: 'Navy', hex: '#1D2A44' },
  8: { name: 'Grey', hex: '#6B7280' },
  9: { name: 'Red', hex: '#EF4444' },
  10: { name: 'Blue', hex: '#3B82F6' }
};

export function getHexFromColorName(name: string): string {
  const normalized = (name || '').toLowerCase().trim();
  if (normalized.includes('drk/brown') || normalized.includes('dark brown') || normalized.includes('drk brown')) return '#5A3317';
  if (normalized.includes('s brown') || normalized.includes('s/brown') || normalized.includes('s.brown')) return '#6E4723';
  if (normalized.includes('green')) return '#10B981';
  if (normalized.includes('tan') && normalized.includes('brown')) return '#A0522D';
  if (normalized.includes('brown')) return '#7C4B27';
  if (normalized.includes('tan')) return '#B87333';
  if (normalized.includes('black')) return '#000000';
  if (normalized.includes('white')) return '#FFFFFF';
  if (normalized.includes('cherry')) return '#7A1C1C';
  if (normalized.includes('olive')) return '#556B2F';
  if (normalized.includes('navy')) return '#1D2A44';
  if (normalized.includes('grey') || normalized.includes('gray')) return '#6B7280';
  if (normalized.includes('red')) return '#EF4444';
  if (normalized.includes('blue')) return '#3B82F6';
  if (normalized.includes('yellow')) return '#F59E0B';
  if (normalized.includes('pink')) return '#EC4899';
  return '#6B7280';
}

export function getProductAvailableColors(product: Product): Array<{ id: number | string; name: string; hex: string }> {
  const result: Array<{ id: number | string; name: string; hex: string }> = [];
  const addedNames = new Set<string>();

  const addColor = (id: number | string, name: string, hex?: string) => {
    if (!name || !name.trim()) return;
    const cleanName = name.trim();
    // Ignore pure numeric junk like "11" unless it's a known color key in COLOR_REGISTRY
    if (/^\d+$/.test(cleanName) && !COLOR_REGISTRY[Number(cleanName)]) {
      return;
    }
    if (!addedNames.has(cleanName.toLowerCase())) {
      addedNames.add(cleanName.toLowerCase());
      result.push({
        id,
        name: cleanName,
        hex: hex || getHexFromColorName(cleanName)
      });
    }
  };

  const pid = (product.id || '').toUpperCase();
  const isWL5687 = pid.includes('W5687') || pid.includes('WL5687');

  if (isWL5687) {
    // WL-W5687 allotted colors strictly as provided in reference image:
    const wlDefaults = [
      { id: 'Brown', name: 'Brown', hex: '#7C4B27' },
      { id: 'Tan', name: 'Tan', hex: '#B87333' },
      { id: 'DRK/BROWN', name: 'DRK/BROWN', hex: '#5A3317' },
      { id: 'S BROWN', name: 'S BROWN', hex: '#6E4723' },
      { id: 'GREEN', name: 'GREEN', hex: '#10B981' }
    ];
    wlDefaults.forEach(c => addColor(c.id, c.name, c.hex));
    if (product.customColorMap) {
      Object.entries(product.customColorMap).forEach(([key, val]) => {
        if (val && val.name) addColor(key, val.name, val.hex);
      });
    }
    return result;
  }

  // 1. Custom color map
  if (product.customColorMap && Object.keys(product.customColorMap).length > 0) {
    Object.entries(product.customColorMap).forEach(([key, val]) => {
      if (val && val.name) {
        addColor(key, val.name, val.hex);
      }
    });
  }

  // 2. Size-color stock (extract allotted color names/IDs)
  if (product.sizeColorStock && Object.keys(product.sizeColorStock).length > 0) {
    Object.values(product.sizeColorStock).forEach(colorMap => {
      if (colorMap) {
        Object.keys(colorMap).forEach(key => {
          const cidNum = Number(key);
          if (!isNaN(cidNum) && COLOR_REGISTRY[cidNum]) {
            const found = COLOR_REGISTRY[cidNum];
            addColor(cidNum, found.name, found.hex);
          } else if (isNaN(Number(key)) || !/^\d+$/.test(key)) {
            addColor(key, key);
          }
        });
      }
    });
  }

  // 3. Product colors array (IDs or string names)
  if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
    product.colors.forEach((cid: any) => {
      const cidNum = Number(cid);
      if (!isNaN(cidNum) && COLOR_REGISTRY[cidNum]) {
        const found = COLOR_REGISTRY[cidNum];
        addColor(cidNum, found.name, found.hex);
      } else if (typeof cid === 'string' && cid.trim() && !/^\d+$/.test(cid.trim())) {
        addColor(cid, cid);
      }
    });
  }

  // 4. Other color properties
  if ((product as any).colorNames && Array.isArray((product as any).colorNames)) {
    (product as any).colorNames.forEach((cName: string) => {
      if (typeof cName === 'string' && !/^\d+$/.test(cName.trim())) addColor(cName, cName);
    });
  }
  if ((product as any).availableColors && Array.isArray((product as any).availableColors)) {
    (product as any).availableColors.forEach((cName: any) => {
      if (typeof cName === 'string' && !/^\d+$/.test(cName.trim())) addColor(cName, cName);
      else if (cName?.name) addColor(cName.id || cName.name, cName.name, cName.hex);
    });
  }
  if ((product as any).color && typeof (product as any).color === 'string' && !/^\d+$/.test((product as any).color.trim())) {
    addColor((product as any).color, (product as any).color);
  }

  // 5. Clean default for products with no specified colors
  if (result.length === 0) {
    addColor(2, 'Brown', '#7C4B27');
    addColor(3, 'Tan', '#B87333');
    addColor(1, 'Black', '#000000');
  }

  return result;
}

export function getProductAvailableSizes(product: Product): number[] {
  const sizeSet = new Set<number>();

  if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
    product.sizes.forEach(s => {
      const num = Number(s);
      if (!isNaN(num) && num > 0) sizeSet.add(num);
    });
  }
  if (product.sizeStock) {
    Object.keys(product.sizeStock).forEach(k => {
      const num = Number(k);
      if (!isNaN(num) && num > 0) sizeSet.add(num);
    });
  }
  if (product.sizeColorStock) {
    Object.keys(product.sizeColorStock).forEach(k => {
      const num = Number(k);
      if (!isNaN(num) && num > 0) sizeSet.add(num);
    });
  }

  if (sizeSet.size > 0) {
    return Array.from(sizeSet).sort((a, b) => a - b);
  }

  if (product.category === 'Kids') {
    return [1, 2, 3, 4, 5, 11, 12, 13];
  }
  if (product.category === 'Women') {
    return [4, 5, 6, 7, 8, 9];
  }
  return [6, 7, 8, 9, 10, 11];
}

export interface StockPurchaseOrderInvoice {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  supplierPhone?: string;
  supplierAddress?: string;
  supplierGst?: string;
  invoiceDate: string;
  paymentStatus?: 'credit' | 'partial' | 'paid';
  notes?: string;
  items: StockPurchaseOrderItem[];
  totalPairs: number;
  totalDozens: number;
  totalAmount: number;
  status: 'draft' | 'placed_to_wholesaler' | 'received_and_injected';
  createdAt: string;
}

interface StockPurchaseOrderInvoicePageProps {
  products: Product[];
  isDark?: boolean;
  onBack: () => void;
  onSaveInvoice: (invoice: StockPurchaseOrderInvoice, injectStockDirectly?: boolean) => void;
  existingInvoice?: StockPurchaseOrderInvoice | null;
  mode?: 'create' | 'view' | 'list';
  orderInvoices?: StockPurchaseOrderInvoice[];
  setOrderInvoices?: React.Dispatch<React.SetStateAction<any[]>>;
  onInjectStock?: (invoice: StockPurchaseOrderInvoice) => void;
  onDeleteInvoice?: (invoiceId: string) => void;
}

// Auto-generate invoice ref preset format REQ-INV-YYMMDD01
const getPresetInvoiceNumber = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const dateStr = `${yy}${mm}${dd}`;

  try {
    const saved = localStorage.getItem('prashant_order_invoices_list');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const todayInvoices = parsed.filter((inv: any) => 
          inv?.invoiceNumber && typeof inv.invoiceNumber === 'string' && inv.invoiceNumber.startsWith(`REQ-INV-${dateStr}`)
        );
        const seq = String(todayInvoices.length + 1).padStart(2, '0');
        return `REQ-INV-${dateStr}${seq}`;
      }
    }
  } catch (e) {}

  return `REQ-INV-${dateStr}01`;
};

export const StockPurchaseOrderInvoicePage: React.FC<StockPurchaseOrderInvoicePageProps> = ({
  products = [],
  isDark = true,
  onBack,
  onSaveInvoice,
  existingInvoice = null,
  mode: initialMode = 'list',
  orderInvoices: propOrderInvoices,
  setOrderInvoices,
  onInjectStock,
  onDeleteInvoice
}) => {
  const [mode, setMode] = useState<'create' | 'view' | 'list'>(
    existingInvoice ? 'view' : initialMode
  );

  // Invoices list state (fall back to localStorage if prop not provided)
  const [localInvoices, setLocalInvoices] = useState<StockPurchaseOrderInvoice[]>(() => {
    if (propOrderInvoices && propOrderInvoices.length > 0) return propOrderInvoices;
    try {
      const saved = localStorage.getItem('prashant_order_invoices_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 'INV-STOCK-101',
        invoiceNumber: 'INV-STOCK-2026-101',
        supplierName: 'Walkaroo State Depot',
        supplierPhone: '+91 98765 11223',
        invoiceDate: new Date().toISOString().split('T')[0],
        status: 'received_and_injected',
        notes: 'Bulk seasonal stock reorder for Walkaroo articles.',
        items: [
          {
            id: 'item-1',
            productId: 'WL-W5687',
            productName: 'Walkaroo Men Sports Sandals',
            brand: 'Walkaroo',
            articleCode: 'WL-W5687',
            category: 'Men',
            colorName: 'Black/Grey',
            size: 'UK 6-10 Assorted',
            quantityPairs: 24,
            quantityDozens: 2,
            costPricePerPair: 280,
            totalCost: 6720
          }
        ],
        totalPairs: 24,
        totalDozens: 2,
        totalAmount: 6720,
        createdAt: new Date().toISOString()
      }
    ];
  });

  // Keep localInvoices in sync with propOrderInvoices if provided
  useEffect(() => {
    if (propOrderInvoices && propOrderInvoices.length > 0) {
      setLocalInvoices(propOrderInvoices);
    }
  }, [propOrderInvoices]);

  // Search & Filter state for List View
  const [listSearchQuery, setListSearchQuery] = useState('');
  const [listStatusFilter, setListStatusFilter] = useState<'all' | 'draft' | 'placed' | 'injected'>('all');
  const listSearchInputRef = useRef<HTMLInputElement>(null);
  const createSearchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when list view or create view opens and scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (mode === 'list') {
      const timer = setTimeout(() => {
        listSearchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else if (mode === 'create') {
      const timer = setTimeout(() => {
        createSearchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  // Invoice Form State
  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    existingInvoice?.invoiceNumber || getPresetInvoiceNumber()
  );
  const [supplierName, setSupplierName] = useState<string>(existingInvoice?.supplierName || '');
  const [supplierPhone, setSupplierPhone] = useState<string>(existingInvoice?.supplierPhone || '');
  const [supplierAddress, setSupplierAddress] = useState<string>(existingInvoice?.supplierAddress || '');
  const [supplierGst, setSupplierGst] = useState<string>(existingInvoice?.supplierGst || '');
  const [invoiceDate, setInvoiceDate] = useState<string>(
    existingInvoice?.invoiceDate || new Date().toISOString().split('T')[0]
  );
  const [paymentStatus, setPaymentStatus] = useState<'credit' | 'partial' | 'paid'>(
    existingInvoice?.paymentStatus || 'credit'
  );
  const [notes, setNotes] = useState<string>(existingInvoice?.notes || '');
  const [items, setItems] = useState<StockPurchaseOrderItem[]>(existingInvoice?.items || []);
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Two-step progression for Create New Order: 'articles' (Step 1) -> 'financials' (Step 2)
  const [createStep, setCreateStep] = useState<'articles' | 'financials'>('articles');
  const [freightCharges, setFreightCharges] = useState<number>(0);
  const [isReviewArticlesExpanded, setIsReviewArticlesExpanded] = useState<boolean>(false);

  // Supplier Autocomplete Suggestions State
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);
  const [savedSuppliersRefresh, setSavedSuppliersRefresh] = useState(0);

  const handleDeleteSavedSupplier = (nameToDelete: string) => {
    try {
      const raw = localStorage.getItem('prashant_user_added_wholesalers');
      if (raw) {
        let list = JSON.parse(raw);
        if (Array.isArray(list)) {
          list = list.filter((x: any) => x && x.name?.toLowerCase() !== nameToDelete.toLowerCase());
          localStorage.setItem('prashant_user_added_wholesalers', JSON.stringify(list));
          setSavedSuppliersRefresh(prev => prev + 1);
        }
      }
    } catch (e) {}
  };

  // Compute previous suppliers dynamically ONLY from new user-added wholesalers saved in invoices
  const previousSuppliers = useMemo(() => {
    const map = new Map<string, { name: string; phone?: string; address?: string; gst?: string }>();

    // ONLY load suppliers explicitly created/saved by user in new invoices
    try {
      const savedUserWholesalers = localStorage.getItem('prashant_user_added_wholesalers');
      if (savedUserWholesalers) {
        const parsed = JSON.parse(savedUserWholesalers);
        if (Array.isArray(parsed)) {
          parsed.forEach((s: any) => {
            if (s && s.name && typeof s.name === 'string') {
              const nameTrimmed = s.name.trim();
              if (nameTrimmed) {
                map.set(nameTrimmed.toLowerCase(), {
                  name: nameTrimmed,
                  phone: s.phone || '',
                  address: s.address || '',
                  gst: s.gst || ''
                });
              }
            }
          });
        }
      }
    } catch (e) {}

    return Array.from(map.values());
  }, [savedSuppliersRefresh]);

  // Filter matching suggestions as user types
  const matchingSuggestions = useMemo(() => {
    const query = supplierName.trim().toLowerCase();
    if (!query) return previousSuppliers;
    return previousSuppliers.filter(s =>
      s.name.toLowerCase().includes(query) ||
      (s.phone && s.phone.includes(query))
    );
  }, [previousSuppliers, supplierName]);

  // Product Selector Drawer / Filter State
  const [productSearch, setProductSearch] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedSubCategoryFilter, setSelectedSubCategoryFilter] = useState('all');
  const [showFilterDropdowns, setShowFilterDropdowns] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Wholesaler Details Save Modal State
  const [isWholesalerModalOpen, setIsWholesalerModalOpen] = useState(false);
  const [isDraftSaveTarget, setIsDraftSaveTarget] = useState(false);

  const handleOpenWholesalerSaveModal = () => {
    if (items.length === 0) {
      alert('⚠️ Please search and select at least 1 article product before saving order.');
      return;
    }
    setIsWholesalerModalOpen(true);
  };

  const handleConfirmSaveWithWholesaler = () => {
    if (!supplierName.trim()) {
      alert('⚠️ Please enter Wholesaler / Supplier Name.');
      return;
    }
    handleSave();
    setIsWholesalerModalOpen(false);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategoryFilter !== 'all') count++;
    if (selectedSubCategoryFilter !== 'all') count++;
    if (selectedBrandFilter !== 'all') count++;
    return count;
  }, [selectedCategoryFilter, selectedSubCategoryFilter, selectedBrandFilter]);

  // Available brands
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      const b = (p as any).brand || (p as any).brandName;
      if (b) set.add(b);
    });
    return Array.from(set).sort();
  }, [products]);

  // Available categories
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  // Available subcategories
  const availableSubCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.subCategory) set.add(p.subCategory);
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtered Products for Inventory Database Search
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = productSearch.toLowerCase().trim();
      const pBrand = ((p as any).brand || (p as any).brandName || '').toLowerCase();
      const pCategory = (p.category || '').toLowerCase();
      const pSubCategory = (p.subCategory || '').toLowerCase();
      const pName = (p.name || '').toLowerCase();
      const pId = (p.id || '').toLowerCase();

      const matchesSearch = !q || 
        pName.includes(q) || 
        pId.includes(q) ||
        pBrand.includes(q) ||
        pCategory.includes(q) ||
        pSubCategory.includes(q);

      const actualBrand = (p as any).brand || (p as any).brandName || '';
      const matchesBrand = selectedBrandFilter === 'all' || actualBrand === selectedBrandFilter;
      const matchesCategory = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
      const matchesSubCategory = selectedSubCategoryFilter === 'all' || p.subCategory === selectedSubCategoryFilter;

      return matchesSearch && matchesBrand && matchesCategory && matchesSubCategory;
    });
  }, [products, productSearch, selectedBrandFilter, selectedCategoryFilter, selectedSubCategoryFilter]);

  const hasActiveSearchOrFilter = useMemo(() => {
    return productSearch.trim().length > 0 ||
      selectedCategoryFilter !== 'all' ||
      selectedSubCategoryFilter !== 'all' ||
      selectedBrandFilter !== 'all';
  }, [productSearch, selectedCategoryFilter, selectedSubCategoryFilter, selectedBrandFilter]);

  // Suggested last-added products when opening Create New Order page for the first time (when no items added yet)
  const suggestedProducts = useMemo(() => {
    return items.length === 0 ? [...products].reverse() : [];
  }, [products, items.length]);

  const displayProducts = hasActiveSearchOrFilter 
    ? filteredProducts 
    : (items.length === 0 ? suggestedProducts : []);

  // Calculate totals
  const totalPairs = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.quantityPairs) || 0), 0);
  }, [items]);

  const totalDozens = useMemo(() => {
    return Math.ceil(totalPairs / 12);
  }, [totalPairs]);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0);
  }, [items]);

  const { updateProduct } = useProducts();

  // Article Color & Size Selection Modal State
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [modalAvailableColors, setModalAvailableColors] = useState<Array<{ id: number | string; name: string; hex: string }>>([]);
  const [modalSelectedColor, setModalSelectedColor] = useState<string>('');
  const [modalAvailableSizes, setModalAvailableSizes] = useState<number[]>([]);
  const [modalSelectedSizesMap, setModalSelectedSizesMap] = useState<Record<number, number>>({});

  // Add custom size & color form state
  const [showAddSizeForm, setShowAddSizeForm] = useState(false);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [showAddColorForm, setShowAddColorForm] = useState(false);
  const [customColorInput, setCustomColorInput] = useState('');
  const [sizeUpdateSuccessMsg, setSizeUpdateSuccessMsg] = useState('');

  // Add a new size to article and update it all over for this article
  const handleAddCustomSizeToArticle = (sizeToAdd: number) => {
    if (!selectedProductForModal || isNaN(sizeToAdd) || sizeToAdd <= 0) return;

    if (modalAvailableSizes.includes(sizeToAdd)) {
      setModalSelectedSizesMap(prev => ({ ...prev, [sizeToAdd]: (prev[sizeToAdd] || 0) + 1 }));
      setSizeUpdateSuccessMsg(`Size ${sizeToAdd} is already available and selected!`);
      setTimeout(() => setSizeUpdateSuccessMsg(''), 3000);
      return;
    }

    const newSizesList = Array.from(new Set([...modalAvailableSizes, sizeToAdd])).sort((a, b) => a - b);
    setModalAvailableSizes(newSizesList);
    setModalSelectedSizesMap(prev => ({ ...prev, [sizeToAdd]: 1 }));

    const updatedProduct: Product = {
      ...selectedProductForModal,
      sizes: newSizesList,
      sizeStock: {
        ...(selectedProductForModal.sizeStock || {}),
        [sizeToAdd]: selectedProductForModal.sizeStock?.[sizeToAdd] || 0
      }
    };
    setSelectedProductForModal(updatedProduct);

    if (updateProduct && selectedProductForModal.id) {
      updateProduct(selectedProductForModal.id, {
        sizes: newSizesList,
        sizeStock: updatedProduct.sizeStock
      });
    }

    setCustomSizeInput('');
    setShowAddSizeForm(false);
    setSizeUpdateSuccessMsg(`Size ${sizeToAdd} added & updated all over for article ${selectedProductForModal.id}!`);
    setTimeout(() => setSizeUpdateSuccessMsg(''), 4000);
  };

  // Add a new color to article and update it all over for this article
  const handleAddCustomColorToArticle = (colorName: string, hexCode?: string) => {
    if (!selectedProductForModal || !colorName.trim()) return;

    const cleanName = colorName.trim();
    const hex = hexCode || getHexFromColorName(cleanName);

    if (modalAvailableColors.some(c => c.name.toLowerCase() === cleanName.toLowerCase())) {
      setModalSelectedColor(cleanName);
      return;
    }

    const newColorObj = { id: cleanName, name: cleanName, hex };
    const updatedColorsList = [...modalAvailableColors, newColorObj];
    setModalAvailableColors(updatedColorsList);
    setModalSelectedColor(cleanName);

    const existingMap = selectedProductForModal.customColorMap || {};
    const updatedMap = {
      ...existingMap,
      [cleanName]: {
        name: cleanName,
        hex,
        textClass: 'text-white',
        bgClass: 'bg-zinc-700',
        borderClass: 'border-zinc-600',
        badgeClass: 'bg-zinc-700 text-white'
      }
    };

    const updatedProduct: Product = {
      ...selectedProductForModal,
      customColorMap: updatedMap
    };
    setSelectedProductForModal(updatedProduct);

    if (updateProduct && selectedProductForModal.id) {
      updateProduct(selectedProductForModal.id, {
        customColorMap: updatedMap
      });
    }

    setCustomColorInput('');
    setShowAddColorForm(false);
    setSizeUpdateSuccessMsg(`Color "${cleanName}" added & updated all over for article ${selectedProductForModal.id}!`);
    setTimeout(() => setSizeUpdateSuccessMsg(''), 4000);
  };

  // Open Article Configuration Modal
  const handleOpenArticleModal = (product: Product, existingIndex?: number) => {
    setSelectedProductForModal(product);
    setEditingItemIndex(existingIndex !== undefined ? existingIndex : null);
    setShowAddSizeForm(false);
    setShowAddColorForm(false);
    setCustomSizeInput('');
    setCustomColorInput('');
    setSizeUpdateSuccessMsg('');

    const colors = getProductAvailableColors(product);
    setModalAvailableColors(colors);

    const sizes = getProductAvailableSizes(product);
    setModalAvailableSizes(sizes);

    if (existingIndex !== undefined && items[existingIndex]) {
      const item = items[existingIndex];
      setModalSelectedColor(item.colorName || (colors[0]?.name || 'Standard Color'));
      if (item.sizeQuantities && Object.keys(item.sizeQuantities).length > 0) {
        const initMap: Record<number, number> = {};
        Object.entries(item.sizeQuantities).forEach(([k, v]) => {
          const numKey = Number(k);
          const numVal = Number(v);
          if (numKey > 0 && numVal > 0) {
            initMap[numKey] = numVal;
          }
        });
        setModalSelectedSizesMap(initMap);
      } else {
        setModalSelectedSizesMap({});
      }
    } else {
      // Auto-select color if available
      const defaultColor = colors[0]?.name || 'Standard Color';
      setModalSelectedColor(defaultColor);

      // Start with empty size selection so user can choose sizes explicitly
      setModalSelectedSizesMap({});
    }
  };

  // Add or edit product via Modal
  const handleAddProduct = (product: Product) => {
    const existingIndex = items.findIndex(it => it.productId === product.id);
    if (existingIndex >= 0) {
      handleOpenArticleModal(product, existingIndex);
    } else {
      handleOpenArticleModal(product);
    }
  };

  const handleSelectAllModalSizes = (pairsPerSize: number) => {
    const map: Record<number, number> = {};
    modalAvailableSizes.forEach(sz => {
      map[sz] = pairsPerSize;
    });
    setModalSelectedSizesMap(map);
  };

  const handleClearModalSizes = () => {
    setModalSelectedSizesMap({});
  };

  const handleUpdateModalSingleSize = (sz: number, delta: number) => {
    setModalSelectedSizesMap(prev => {
      const cur = prev[sz] || 0;
      const nextVal = Math.max(0, cur + delta);
      return { ...prev, [sz]: nextVal };
    });
  };

  const handleSetModalSingleSize = (sz: number, val: number) => {
    setModalSelectedSizesMap(prev => ({
      ...prev,
      [sz]: Math.max(0, val)
    }));
  };

  const handleBatchAdjustModalSizes = (delta: number) => {
    setModalSelectedSizesMap(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => {
        const sz = Number(k);
        if (updated[sz] > 0) {
          updated[sz] = Math.max(1, updated[sz] + delta);
        }
      });
      return updated;
    });
  };

  const modalTotalPairs = useMemo(() => {
    return Object.values(modalSelectedSizesMap).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
  }, [modalSelectedSizesMap]);

  const modalTotalDozens = useMemo(() => {
    return Math.ceil(modalTotalPairs / 12);
  }, [modalTotalPairs]);

  const handleConfirmArticleFromModal = () => {
    if (!selectedProductForModal) return;
    if (modalTotalPairs <= 0) {
      alert('Please select at least 1 size with 1 pair quantity.');
      return;
    }

    const prodBrand = (selectedProductForModal as any).brand || (selectedProductForModal as any).brandName || 'General';

    const selectedSizeNums = Object.keys(modalSelectedSizesMap)
      .map(Number)
      .filter(sz => modalSelectedSizesMap[sz] > 0)
      .sort((a, b) => a - b);

    const sizesSummaryStr = selectedSizeNums.length > 0 
      ? `Sizes ${selectedSizeNums.join(', ')}`
      : 'Assorted Sizes';

    const newItem: StockPurchaseOrderItem = {
      id: editingItemIndex !== null && items[editingItemIndex] 
        ? items[editingItemIndex].id 
        : `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: selectedProductForModal.id,
      productName: selectedProductForModal.name,
      brand: prodBrand,
      articleCode: selectedProductForModal.id,
      category: selectedProductForModal.category,
      colorName: modalSelectedColor || 'Standard Color',
      size: sizesSummaryStr,
      sizesList: selectedSizeNums,
      sizeQuantities: modalSelectedSizesMap,
      quantityPairs: modalTotalPairs,
      quantityDozens: modalTotalDozens,
      costPricePerPair: 0,
      totalCost: 0
    };

    if (editingItemIndex !== null && items[editingItemIndex]) {
      const updated = [...items];
      updated[editingItemIndex] = newItem;
      setItems(updated);
    } else {
      setItems(prev => [...prev, newItem]);
    }

    if (!supplierName.trim()) {
      setSavedSuccessMsg('✓ Article added to invoice! Remember to enter Wholesaler Name above.');
      setTimeout(() => setSavedSuccessMsg(null), 4000);
    }

    // Reset previous search and filters so user returns clean to Search & Select Articles
    setProductSearch('');
    setSelectedCategoryFilter('all');
    setSelectedSubCategoryFilter('all');
    setSelectedBrandFilter('all');
    setShowFilterDropdowns(false);

    setSelectedProductForModal(null);
    setEditingItemIndex(null);

    // Redirect focus to Search & Select Articles input for the next article
    setTimeout(() => {
      createSearchInputRef.current?.focus();
      createSearchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Update item pairs with support for +1, +4, +12, -1, -4, -12
  const handleUpdateItemPairs = (index: number, val: number, isDelta: boolean = false) => {
    const updated = [...items];
    const item = updated[index];
    let newPairs = isDelta ? item.quantityPairs + val : val;
    newPairs = Math.max(1, newPairs); // Minimum 1 pair
    const newDozens = Math.ceil(newPairs / 12);
    updated[index] = {
      ...item,
      quantityPairs: newPairs,
      quantityDozens: newDozens,
      totalCost: 0
    };
    setItems(updated);
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Send Order Invoice to WhatsApp
  const handleSendWhatsApp = () => {
    const articleListText = items.map((it, i) => 
      `${i + 1}. *${it.brand}* - Article Code: *${it.articleCode}*${it.colorName ? ` (Colour: ${it.colorName})` : ''}\n   Qty: ${it.quantityPairs} Pairs`
    ).join('\n');

    const message = `*STOCK PURCHASE ORDER INVOICE VOUCHER*\n\n` +
      `*Invoice Ref:* ${invoiceNumber}\n` +
      `*Wholesaler Name:* ${supplierName || 'N/A'}\n` +
      (supplierPhone ? `*Phone:* ${supplierPhone}\n` : '') +
      (supplierAddress ? `*Location:* ${supplierAddress}\n` : '') +
      `*Date:* ${invoiceDate}\n\n` +
      `*Particular Articles Ordered (${items.length}):*\n${articleListText}\n\n` +
      `*Total Quantity:* ${totalPairs} Pairs\n\n` +
      `_Prashant Footwear Store_`;

    const cleanPhone = supplierPhone.replace(/\D/g, '');
    const url = cleanPhone && cleanPhone.length >= 10
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
  };

  // Save Invoice (Opens Wholesaler details modal first)
  const handleSave = (isDraft: boolean = false) => {
    if (isSavingInvoice) return;

    if (items.length === 0) {
      alert('⚠️ Please select at least 1 article product before saving.');
      return;
    }

    setIsDraftSaveTarget(isDraft);
    // Directly open Wholesaler Details Modal as requested
    setIsWholesalerModalOpen(true);
  };

  // Perform actual save after Wholesaler details confirmed
  const executeSaveInvoice = () => {
    if (items.length === 0) {
      alert('⚠️ Please select at least 1 article product before saving.');
      return;
    }

    if (!supplierName.trim()) {
      alert('⚠️ Please enter or select a Wholesaler / Supplier Name.');
      const el = document.getElementById('supplier-name-input');
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSavingInvoice(true);

    try {
      const invoiceStatus: 'draft' | 'placed_to_wholesaler' | 'received_and_injected' =
        isDraftSaveTarget ? 'draft' : (existingInvoice?.status || 'placed_to_wholesaler');

      const invoiceObj: StockPurchaseOrderInvoice = {
        id: existingInvoice?.id || `INV-${Date.now()}`,
        invoiceNumber: invoiceNumber.trim() || `INV-STOCK-${Math.floor(10000 + Math.random() * 90000)}`,
        supplierName: supplierName.trim(),
        supplierPhone: supplierPhone.trim(),
        supplierAddress: supplierAddress.trim(),
        supplierGst: supplierGst.trim(),
        invoiceDate: invoiceDate || new Date().toISOString().split('T')[0],
        paymentStatus,
        notes: notes.trim(),
        items,
        totalPairs,
        totalDozens,
        totalAmount: 0,
        status: invoiceStatus,
        createdAt: existingInvoice?.createdAt || new Date().toISOString()
      };

      // Save supplier to user-added wholesalers history
      try {
        const historyRaw = localStorage.getItem('prashant_user_added_wholesalers');
        let historyList: any[] = historyRaw ? JSON.parse(historyRaw) : [];
        if (!Array.isArray(historyList)) historyList = [];
        const supplierTrimmed = supplierName.trim();
        const idx = historyList.findIndex((x: any) => x && x.name?.toLowerCase() === supplierTrimmed.toLowerCase());
        const entry = {
          name: supplierTrimmed,
          phone: supplierPhone.trim(),
          address: supplierAddress.trim(),
          gst: supplierGst.trim(),
          addedAt: new Date().toISOString()
        };
        if (idx >= 0) {
          historyList[idx] = entry;
        } else {
          historyList.unshift(entry);
        }
        localStorage.setItem('prashant_user_added_wholesalers', JSON.stringify(historyList));
        setSavedSuppliersRefresh(prev => prev + 1);
      } catch (e) {}

      onSaveInvoice(invoiceObj, false);
      setIsWholesalerModalOpen(false);
      setSavedSuccessMsg(
        isDraftSaveTarget
          ? `📝 Draft Order Invoice ${invoiceObj.invoiceNumber} (${totalPairs} Pairs) saved as Draft!`
          : `✅ Stock Order Invoice ${invoiceObj.invoiceNumber} saved & placed successfully!`
      );
      setTimeout(() => {
        setSavedSuccessMsg(null);
        setMode('view');
        setIsSavingInvoice(false);
      }, 1200);
    } catch (e) {
      setIsSavingInvoice(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleViewInvoice = (inv: StockPurchaseOrderInvoice) => {
    setInvoiceNumber(inv.invoiceNumber);
    setSupplierName(inv.supplierName);
    setSupplierPhone(inv.supplierPhone || '');
    setSupplierAddress(inv.supplierAddress || '');
    setSupplierGst(inv.supplierGst || '');
    setInvoiceDate(inv.invoiceDate || new Date().toISOString().split('T')[0]);
    setPaymentStatus(inv.paymentStatus || 'credit');
    setNotes(inv.notes || '');
    setItems(inv.items || []);
    setMode('view');
  };

  const handleEditInvoice = (inv: StockPurchaseOrderInvoice) => {
    setInvoiceNumber(inv.invoiceNumber);
    setSupplierName(inv.supplierName);
    setSupplierPhone(inv.supplierPhone || '');
    setSupplierAddress(inv.supplierAddress || '');
    setSupplierGst(inv.supplierGst || '');
    setInvoiceDate(inv.invoiceDate || new Date().toISOString().split('T')[0]);
    setPaymentStatus(inv.paymentStatus || 'credit');
    setNotes(inv.notes || '');
    setItems(inv.items || []);
    setCreateStep('articles');
    setMode('create');
  };

  const handleStartNewInvoice = () => {
    setInvoiceNumber(getPresetInvoiceNumber());
    setSupplierName('');
    setSupplierPhone('');
    setSupplierAddress('');
    setSupplierGst('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setPaymentStatus('credit');
    setNotes('');
    setItems([]);
    setCreateStep('articles');
    setMode('create');
  };

  const handleDeleteLocalInvoice = (invId: string) => {
    if (confirm('Are you sure you want to delete this order invoice record?')) {
      if (onDeleteInvoice) {
        onDeleteInvoice(invId);
      } else {
        const updated = localInvoices.filter(it => it.id !== invId);
        setLocalInvoices(updated);
        if (setOrderInvoices) setOrderInvoices(updated);
        try {
          localStorage.setItem('prashant_order_invoices_list', JSON.stringify(updated));
        } catch (e) {}
      }
      setSavedSuccessMsg('Invoice record deleted successfully.');
      setTimeout(() => setSavedSuccessMsg(null), 3000);
    }
  };

  const handleInjectLocalStock = (inv: StockPurchaseOrderInvoice) => {
    if (onInjectStock) {
      onInjectStock(inv);
    } else {
      const updated = localInvoices.map(it => it.id === inv.id ? { ...it, status: 'received_and_injected' as const } : it);
      setLocalInvoices(updated);
      if (setOrderInvoices) setOrderInvoices(updated);
      try {
        localStorage.setItem('prashant_order_invoices_list', JSON.stringify(updated));
      } catch (e) {}
    }
    setSavedSuccessMsg(`Successfully injected ${inv.totalPairs} pairs from Invoice ${inv.invoiceNumber} to Store Inventory!`);
    setTimeout(() => setSavedSuccessMsg(null), 4000);
  };

  // Filter list of created invoices for 'list' mode
  const filteredInvoicesList = useMemo(() => {
    return localInvoices.filter(inv => {
      if (listStatusFilter === 'draft' && inv.status !== 'draft') return false;
      if (listStatusFilter === 'placed' && inv.status !== 'placed_to_wholesaler') return false;
      if (listStatusFilter === 'injected' && inv.status !== 'received_and_injected') return false;

      const q = listSearchQuery.toLowerCase().trim();
      if (!q) return true;

      const matchNumber = (inv.invoiceNumber || '').toLowerCase().includes(q);
      const matchSupplier = (inv.supplierName || '').toLowerCase().includes(q);
      const matchPhone = (inv.supplierPhone || '').toLowerCase().includes(q);
      const matchNotes = (inv.notes || '').toLowerCase().includes(q);

      const matchItem = inv.items?.some((item: any) =>
        (item.productName || '').toLowerCase().includes(q) ||
        (item.articleCode || '').toLowerCase().includes(q) ||
        (item.brand || '').toLowerCase().includes(q)
      );

      return matchNumber || matchSupplier || matchPhone || matchNotes || matchItem;
    });
  }, [localInvoices, listSearchQuery, listStatusFilter]);

  return (
    <div className={`fixed inset-0 z-[60] overflow-y-auto flex flex-col font-sans transition-colors duration-200 ${
      isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* --- TOP FULL-PAGE HEADER BAR --- */}
      <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white/90 border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          <button
            type="button"
            onClick={onBack}
            className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
              isDark 
                ? 'bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700 text-zinc-200' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
            }`}
            title="Back to Purchase Orders"
          >
            <ArrowLeft size={16} className="sm:w-4 sm:h-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="p-1 sm:p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0 hidden xs:block">
                <FileText size={15} />
              </div>
              <h1 className="text-xs sm:text-base font-black tracking-tight truncate uppercase">
                {mode === 'list' 
                  ? 'Stock Order Invoices' 
                  : mode === 'create' 
                    ? 'Create Order Invoice' 
                    : `Invoice ${invoiceNumber}`}
              </h1>
            </div>
            <p className="text-[10px] sm:text-[11px] font-mono text-zinc-400 hidden md:block">
              {mode === 'list' 
                ? `Showing all ${localInvoices.length} created stock order purchase invoices`
                : mode === 'create' 
                  ? 'Draft purchase order with particular articles & wholesaler rates' 
                  : `Viewing Invoice ${invoiceNumber}`}
            </p>
          </div>
        </div>

        {/* Action Controls Header */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {mode === 'list' && (
            <button
              type="button"
              onClick={handleStartNewInvoice}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs font-black bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-all cursor-pointer shadow-md shadow-amber-500/20 flex items-center gap-1.5"
            >
              <PlusCircle size={15} />
              <span className="hidden sm:inline">+ Create New Order Invoice</span>
              <span className="sm:hidden">+ New Order</span>
            </button>
          )}

          {mode === 'create' && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setMode('list')}
                className="px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700 transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5"
              >
                <List size={14} />
                <span className="hidden sm:inline">View All Orders ({localInvoices.length})</span>
                <span className="sm:hidden">Orders ({localInvoices.length})</span>
              </button>
              {createStep === 'articles' ? (
                <button
                  type="button"
                  disabled={items.length === 0}
                  onClick={() => {
                    if (items.length > 0) {
                      setCreateStep('financials');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 sm:gap-1.5 shadow-md ${
                    items.length > 0
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20 cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <ArrowRight size={14} />
                  <span className="hidden sm:inline">Next: Financials ({items.length})</span>
                  <span className="sm:hidden">Next</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={executeSaveInvoice}
                  disabled={isSavingInvoice}
                  className="px-3 sm:px-4 py-2 rounded-xl text-xs font-black bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-all cursor-pointer shadow-md shadow-amber-500/20 flex items-center gap-1 sm:gap-1.5"
                >
                  <Save size={14} />
                  <span className="hidden sm:inline">{isSavingInvoice ? 'Saving...' : 'Save Order Invoice'}</span>
                  <span className="sm:hidden">Save</span>
                </button>
              )}
            </div>
          )}

          {mode === 'view' && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setMode('list')}
                className="px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700 transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5"
              >
                <List size={14} />
                <span className="hidden sm:inline">Back to Orders List</span>
                <span className="sm:hidden">Orders</span>
              </button>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-all cursor-pointer shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <MessageCircle size={14} />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-black bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-all cursor-pointer shadow-md shadow-amber-500/20 flex items-center gap-1.5"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* --- ALERT / SUCCESS TOAST --- */}
      {savedSuccessMsg && (
        <div className="w-full bg-emerald-500 text-zinc-950 font-black text-center py-2.5 px-4 text-xs font-mono tracking-wide animate-pulse">
          {savedSuccessMsg}
        </div>
      )}

      {/* --- MAIN PAGE CONTENT --- */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6 space-y-6">

        {/* MODE 1: LIST OF CREATED ORDERS TILL NOW */}
        {mode === 'list' ? (
          <div className="space-y-6 animate-fade-in">
            {/* Metric Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 block">Total Created Orders</span>
                <strong className="text-xl font-black text-amber-500 block mt-1">{localInvoices.length} Orders</strong>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 block">Total Pairs Ordered</span>
                <strong className="text-xl font-black text-emerald-400 block mt-1">
                  {localInvoices.reduce((s, inv) => s + (Number(inv.totalPairs) || 0), 0)} Pairs
                </strong>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 block">Total Invoiced Value</span>
                <strong className="text-xl font-black text-amber-400 block mt-1">
                  ₹{localInvoices.reduce((s, inv) => s + (Number(inv.totalAmount) || 0), 0).toLocaleString('en-IN')}
                </strong>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 block">Stock Injected Status</span>
                <strong className="text-xl font-black text-emerald-500 block mt-1">
                  {localInvoices.filter(inv => inv.status === 'received_and_injected').length} / {localInvoices.length} Injected
                </strong>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
              isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
            }`}>
              <div className="relative flex-1 w-full">
                <Search size={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                <input
                  ref={listSearchInputRef}
                  autoFocus
                  type="text"
                  placeholder="Type Article Code (e.g. WL-W5687), Wholesaler Name, Invoice #, or Phone..."
                  value={listSearchQuery}
                  onChange={(e) => setListSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                    isDark 
                      ? 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus:border-amber-500' 
                      : 'bg-slate-50 border-slate-300 text-zinc-900 placeholder-zinc-400 focus:border-amber-500'
                  }`}
                />
                {listSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setListSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 w-full md:w-auto shrink-0 overflow-x-auto pb-1 md:pb-0">
                <button
                  type="button"
                  onClick={() => setListStatusFilter('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    listStatusFilter === 'all'
                      ? 'bg-amber-500 text-zinc-950 shadow-md'
                      : isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All ({localInvoices.length})
                </button>
                <button
                  type="button"
                  onClick={() => setListStatusFilter('draft')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    listStatusFilter === 'draft'
                      ? 'bg-amber-500 text-zinc-950 shadow-md'
                      : isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Drafts ({localInvoices.filter(i => i.status === 'draft').length})
                </button>
                <button
                  type="button"
                  onClick={() => setListStatusFilter('placed')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    listStatusFilter === 'placed'
                      ? 'bg-amber-500 text-zinc-950 shadow-md'
                      : isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Placed ({localInvoices.filter(i => i.status === 'placed_to_wholesaler').length})
                </button>
                <button
                  type="button"
                  onClick={() => setListStatusFilter('injected')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    listStatusFilter === 'injected'
                      ? 'bg-emerald-500 text-zinc-950 shadow-md'
                      : isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ✓ Stock Injected ({localInvoices.filter(i => i.status === 'received_and_injected').length})
                </button>
              </div>
            </div>

            {/* Invoices List Display */}
            {filteredInvoicesList.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-800 space-y-4">
                <FileText size={48} className="mx-auto text-amber-500/40" />
                <h3 className="text-lg font-bold text-zinc-400 uppercase">No Stock Order Invoices Found</h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  {listSearchQuery ? 'No invoices match your search filter criteria. Try clearing search.' : 'Create your first stock purchase order invoice with article codes and wholesaler details.'}
                </p>
                <button
                  type="button"
                  onClick={handleStartNewInvoice}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 inline-flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle size={18} />
                  <span>+ Create First Order Invoice</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredInvoicesList.map((invoice) => {
                  const isInjected = invoice.status === 'received_and_injected';

                  return (
                    <div
                      key={invoice.id}
                      className={`p-6 rounded-3xl border transition-all space-y-4 flex flex-col justify-between ${
                        isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-900 shadow-md'
                      }`}
                    >
                      {/* Top Info Header */}
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 shadow-xs">
                              {invoice.invoiceNumber}
                            </span>
                            <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                              📅 {invoice.invoiceDate}
                            </span>
                          </div>

                          <span className={`text-[10px] font-mono font-black uppercase px-3 py-1.5 rounded-full border tracking-wide ${
                            invoice.status === 'received_and_injected'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : invoice.status === 'draft'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          }`}>
                            {invoice.status === 'received_and_injected'
                              ? '✓ Stock Injected'
                              : invoice.status === 'draft'
                              ? '📝 Draft Order'
                              : 'Placed to Wholesaler'}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-lg font-black text-zinc-900 dark:text-zinc-100 font-sans tracking-tight">
                            {invoice.supplierName}
                          </h4>
                          {invoice.supplierPhone && (
                            <p className="text-xs font-mono text-zinc-400 mt-0.5 flex items-center gap-1">
                              📱 {invoice.supplierPhone}
                            </p>
                          )}
                        </div>

                        <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-2" />
                      </div>

                      {/* Particular Articles List */}
                      <div className="space-y-2.5">
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-400 block">
                          PARTICULAR ARTICLES ({invoice.items?.length || 0}):
                        </span>

                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                          {invoice.items?.map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                                isDark ? 'bg-zinc-950/80 border-zinc-800/90' : 'bg-slate-50 border-slate-200/90'
                              }`}
                            >
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    {item.brand || 'Footwear'}
                                  </span>
                                  <span className="font-extrabold truncate text-zinc-800 dark:text-zinc-200">
                                    {item.productName}
                                  </span>
                                </div>
                                <div className="text-[11px] font-mono text-zinc-400">
                                  Article: <strong className="text-amber-500 font-bold">{item.articleCode}</strong> {item.size && `| Size: ${item.size}`}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-mono font-black text-emerald-500 dark:text-emerald-400 block text-sm">
                                  {item.quantityPairs} Pairs
                                </span>
                                <span className="text-[10px] font-mono text-zinc-400 block">
                                  ₹{item.costPricePerPair}/pr = ₹{(item.totalCost || item.costPricePerPair * item.quantityPairs)?.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Prominent Summary Banner Box */}
                      <div className="p-4 rounded-2xl bg-zinc-900 dark:bg-zinc-950 text-white border border-zinc-800/90 flex items-center justify-between shadow-inner">
                        <div>
                          <span className="text-zinc-400 block text-[9px] font-mono font-bold uppercase tracking-wider">TOTAL QUANTITY</span>
                          <strong className="text-amber-400 font-black text-sm sm:text-base font-mono">
                            {invoice.totalPairs} Pairs
                          </strong>
                        </div>
                        <div className="text-right">
                          <span className="text-zinc-400 block text-[9px] font-mono font-bold uppercase tracking-wider">TOTAL INVOICE AMOUNT</span>
                          <strong className="text-emerald-400 text-base sm:text-lg font-black font-mono">
                            ₹{invoice.totalAmount?.toLocaleString('en-IN')}
                          </strong>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-zinc-200 dark:border-zinc-800/80 my-1" />

                      {/* Footer Action Buttons */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewInvoice(invoice)}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            <FileText size={15} />
                            <span>View / Print</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditInvoice(invoice)}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-all cursor-pointer shadow-sm"
                          >
                            <span>Edit</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isInjected ? (
                            <button
                              type="button"
                              onClick={() => handleInjectLocalStock(invoice)}
                              className="px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all cursor-pointer shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                            >
                              <CheckCircle2 size={15} />
                              <span>INJECT STOCK</span>
                            </button>
                          ) : (
                            <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                              <Check size={14} /> Stock Injected
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteLocalInvoice(invoice.id)}
                            className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                            title="Delete Order Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : mode === 'view' ? (
          <div className="space-y-6">
            {/* Action Bar for Mobile View */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-500">
                <Sparkles size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Full Page Order Invoice Voucher
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-zinc-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow hover:bg-emerald-400"
                >
                  <MessageCircle size={14} /> Send to WhatsApp
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-zinc-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow hover:bg-amber-400"
                >
                  <Printer size={14} /> Print Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setMode('create')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-xs font-bold cursor-pointer"
                >
                  Edit Invoice
                </button>
              </div>
            </div>

            {/* Printable Paper Voucher */}
            <div className="p-3 sm:p-5 rounded-2xl bg-white text-zinc-900 border border-slate-200 shadow-md space-y-3.5 text-xs max-w-4xl mx-auto font-sans">
              
              {/* COMPACT HEADER: Shop Details + Supplier + Invoice Ref */}
              <div className="border-b border-slate-200 pb-3 space-y-2">
                {/* Row 1: Shop Brand & Voucher Tag */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                      PF
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900 leading-none">
                        PRASHANT FOOTWEAR
                      </h2>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        Main Market Road, District Wholesale Depot • Ph: +91 98765 43210
                      </p>
                    </div>
                  </div>

                  <div className="px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-800">
                    STOCK PURCHASE ORDER INVOICE VOUCHER
                  </div>
                </div>

                {/* Row 2: Compact Supplier & Invoice Details Bar */}
                <div className="bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between text-xs">
                  <div className="flex items-center gap-2.5 flex-wrap col-span-2 sm:col-span-1">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">SUPPLIER / WHOLESALER</span>
                      <strong className="text-slate-900 text-xs font-bold leading-tight block mt-0.5">{supplierName || 'N/A'}</strong>
                    </div>
                    {supplierPhone && (
                      <div className="border-l border-slate-200 pl-2.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">PHONE</span>
                        <span className="text-slate-700 text-xs font-medium block mt-0.5">📱 {supplierPhone}</span>
                      </div>
                    )}
                    {supplierAddress && (
                      <div className="border-l border-slate-200 pl-2.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">LOCATION</span>
                        <span className="text-slate-700 text-xs font-medium block mt-0.5">📍 {supplierAddress}</span>
                      </div>
                    )}
                    {supplierGst && (
                      <div className="border-l border-slate-200 pl-2.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">GSTIN</span>
                        <span className="text-slate-700 text-xs font-medium block mt-0.5">🏷️ {supplierGst}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 sm:text-right col-span-2 sm:col-span-1 justify-between sm:justify-end border-t sm:border-t-0 pt-1.5 sm:pt-0 border-slate-200">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">INVOICE REF</span>
                      <strong className="text-slate-900 text-xs font-bold block mt-0.5">{invoiceNumber}</strong>
                    </div>
                    <div className="border-l border-slate-200 pl-2.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">DATE</span>
                      <span className="text-slate-700 text-xs font-medium block mt-0.5">📅 {invoiceDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* MAIN HERO: Products & Pairs Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Ordered Particular Articles ({items.length})
                  </span>
                  <span className="text-xs font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                    Total: {totalPairs} Pairs
                  </span>
                </div>

                {/* Desktop/Tablet Table Layout */}
                <div className="overflow-x-auto hidden sm:block">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-[10px] uppercase text-slate-500 tracking-wider">
                      <tr>
                        <th className="p-2.5 text-center w-10">#</th>
                        <th className="p-2.5 w-14 text-center">Thumb</th>
                        <th className="p-2.5">Product Name & Article Details</th>
                        <th className="p-2.5">Size Breakdown</th>
                        <th className="p-2.5 text-right w-28">Ordered Pairs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((it, idx) => {
                        const matchingProd = products.find(p => p.id === it.productId || p.id === it.articleCode || p.name === it.productName);
                        const thumbnailSrc = (it as any).image || matchingProd?.imageUrl || (matchingProd as any)?.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=80';
                        const categoryName = it.category || matchingProd?.category || 'FOOTWEAR';

                        const sizeEntries = it.sizeQuantities
                          ? Object.entries(it.sizeQuantities)
                              .filter(([_, q]) => Number(q) > 0)
                              .map(([s, q]) => ({ size: s, qty: q }))
                          : [];

                        return (
                          <tr key={it.id || idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                            
                            {/* Product Thumbnail */}
                            <td className="p-2.5 text-center">
                              <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shrink-0 mx-auto flex items-center justify-center relative">
                                <img
                                  src={thumbnailSrc}
                                  alt={it.productName || it.articleCode}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                                <Package size={16} className="absolute -z-10 text-slate-300" />
                              </div>
                            </td>

                            {/* Product Name, Category & Meta */}
                            <td className="p-2.5">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <strong className="text-slate-900 text-xs sm:text-sm font-bold">
                                    {it.productName || matchingProd?.name || it.articleCode}
                                  </strong>
                                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-600">
                                    {categoryName}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
                                  {it.brand && (
                                    <span>Brand: <strong className="text-slate-700 font-semibold">{it.brand}</strong></span>
                                  )}
                                  <span>Article Code: <strong className="text-slate-800 font-bold">{it.articleCode}</strong></span>
                                  {it.colorName && (
                                    <span className="text-slate-700 font-semibold">🎨 {it.colorName}</span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Size Breakdown */}
                            <td className="p-2.5">
                              {sizeEntries.length > 0 ? (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {sizeEntries.map((sq, sqIdx) => (
                                    <span key={`vch-sz-${sq.size}-${sqIdx}`} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                                      S{sq.size}: <strong>{sq.qty}p</strong>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Standard Assorted</span>
                              )}
                            </td>

                            {/* Ordered Pairs */}
                            <td className="p-2.5 text-right">
                              <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                {it.quantityPairs} Pairs
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Responsive Card List Layout */}
                <div className="block sm:hidden divide-y divide-slate-100">
                  {items.map((it, idx) => {
                    const matchingProd = products.find(p => p.id === it.productId || p.id === it.articleCode || p.name === it.productName);
                    const thumbnailSrc = (it as any).image || matchingProd?.imageUrl || (matchingProd as any)?.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=80';
                    const categoryName = it.category || matchingProd?.category || 'FOOTWEAR';

                    const sizeEntries = it.sizeQuantities
                      ? Object.entries(it.sizeQuantities)
                          .filter(([_, q]) => Number(q) > 0)
                          .map(([s, q]) => ({ size: s, qty: q }))
                      : [];

                    return (
                      <div key={`m-item-${it.id || idx}`} className="p-2.5 flex items-start gap-2.5">
                        <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center relative mt-0.5">
                          <img
                            src={thumbnailSrc}
                            alt={it.productName || it.articleCode}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <Package size={14} className="absolute -z-10 text-slate-300" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <div className="flex items-center gap-1 flex-wrap">
                                <strong className="text-slate-900 text-xs font-bold leading-tight">
                                  {it.productName || matchingProd?.name || it.articleCode}
                                </strong>
                                <span className="text-[8px] font-bold uppercase px-1 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-600">
                                  {categoryName}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {it.brand && <span>{it.brand} • </span>}
                                <span>Code: {it.articleCode}</span>
                                {it.colorName && <span> • 🎨 {it.colorName}</span>}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-extrabold text-slate-900 text-xs block">
                                {it.quantityPairs} Pairs
                              </span>
                            </div>
                          </div>

                          {sizeEntries.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap pt-0.5">
                              {sizeEntries.map((sq, sqIdx) => (
                                <span key={`m-vch-sz-${sq.size}-${sqIdx}`} className="text-[8px] font-semibold px-1 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-700">
                                  S{sq.size}: <strong>{sq.qty}p</strong>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary Box */}
              <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-sans">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">TOTAL ARTICLES ORDERED</span>
                  <strong className="text-slate-900 text-xs font-bold">{items.length} Distinct Articles</strong>
                </div>

                <div className="text-right">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">TOTAL PAIRS QUANTITY</span>
                  <strong className="text-slate-900 text-sm sm:text-base font-black">{totalPairs} Pairs</strong>
                </div>
              </div>

              {notes && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold uppercase text-slate-400 text-[10px] block">Special Notes / Terms:</span>
                  <p className="text-slate-700 italic text-[11px]">{notes}</p>
                </div>
              )}

              {/* Signature Block */}
              <div className="pt-4 flex items-center justify-between text-[10px] text-slate-500 font-medium border-t border-slate-200">
                <div>
                  <p className="font-bold text-slate-700">Checked By Store Manager</p>
                  <p className="text-[9px] text-slate-400">Prashant Footwear Depot</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-700">Authorized Wholesaler Stamp / Sign</p>
                  <p className="text-[9px] text-slate-400">Supplier Confirmation</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CREATE / DRAFT FORM MODE */
          <div className="space-y-6">

            {/* Section Title Banner */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border shrink-0 ${
                  isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}>
                  <PlusCircle size={20} />
                </div>
                <div>
                  <h1 className={`text-lg sm:text-xl font-bold uppercase tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    CREATE NEW ORDER
                  </h1>
                  <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Select articles, colors & sizes to create a purchase order invoice
                  </p>
                </div>
              </div>
            </div>

            {/* Step Navigation Bar: 1. Particular Articles in Invoice -> 2. Order Invoice Financials */}
            <div className={`p-3 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
              isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {/* Step 1 Button */}
                <button
                  type="button"
                  onClick={() => setCreateStep('articles')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    createStep === 'articles'
                      ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-sm ring-2 ring-emerald-500/30'
                      : items.length > 0
                        ? isDark 
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-950/60' 
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    createStep === 'articles'
                      ? isDark ? 'bg-zinc-900 text-white' : 'bg-white text-slate-900'
                      : items.length > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200'
                  }`}>
                    {items.length > 0 && createStep !== 'articles' ? <Check size={12} /> : '1'}
                  </span>
                  <span>1. Particular Articles in Invoice ({items.length})</span>
                </button>

                <div className={`h-0.5 w-6 sm:w-8 rounded hidden sm:block ${
                  createStep === 'financials' ? 'bg-emerald-500' : isDark ? 'bg-zinc-800' : 'bg-slate-200'
                }`} />

                {/* Step 2 Button */}
                <button
                  type="button"
                  disabled={items.length === 0}
                  onClick={() => {
                    if (items.length > 0) {
                      setCreateStep('financials');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    createStep === 'financials'
                      ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-sm ring-2 ring-emerald-500/40'
                      : items.length > 0
                        ? 'cursor-pointer ' + (isDark ? 'text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200')
                        : 'opacity-40 cursor-not-allowed ' + (isDark ? 'text-zinc-600' : 'text-slate-400')
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    createStep === 'financials'
                      ? isDark ? 'bg-zinc-900 text-white' : 'bg-white text-slate-900'
                      : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-200 text-slate-600'
                  }`}>
                    2
                  </span>
                  <span>2. Order Invoice Financials</span>
                </button>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-xs">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  createStep === 'financials'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                    : items.length > 0
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                      : isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  {createStep === 'financials' 
                    ? 'Step 2: Financials & Wholesaler' 
                    : items.length > 0 
                      ? 'Step 1: Confirm Articles' 
                      : 'Step 1: Select Articles'}
                </span>
                <span className={`font-bold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                  {totalPairs} Pairs ({items.length} Articles)
                </span>
              </div>
            </div>

            {createStep === 'articles' ? (
              /* --- STEP 1: ARTICLE SEARCH, SELECTION & PARTICULAR ARTICLES IN INVOICE --- */
              <div className="space-y-6 animate-fadeIn">
                {/* 1. DIRECT ARTICLE SEARCH & SELECT PANEL */}
            <div id="article-selection-top" className={`p-4 sm:p-6 rounded-2xl border space-y-4 transition-all ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 ${
                isDark ? 'border-zinc-800' : 'border-slate-100'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg border ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}>
                    <Search size={16} />
                  </div>
                  <div>
                    <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      1. SEARCH & SELECT ARTICLES
                    </h3>
                  </div>
                </div>
              </div>

              {/* Search Bar & Filter Button */}
              <div className="flex items-center gap-2 w-full">
                <div className="relative flex-1 min-w-0">
                  <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                  <input
                    ref={createSearchInputRef}
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Type Article Code (e.g. 5042) or Product Name..."
                    className={`w-full pl-10 pr-9 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isDark 
                        ? 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-600' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white'
                    }`}
                  />
                  {productSearch && (
                    <button
                      type="button"
                      onClick={() => setProductSearch('')}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Filter Logo Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowFilterDropdowns(!showFilterDropdowns)}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                    showFilterDropdowns || activeFilterCount > 0
                      ? isDark ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-slate-800 text-white border-slate-800'
                      : isDark
                        ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Toggle Filters"
                >
                  <Filter size={15} />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-slate-950 text-white text-[9px] font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {(productSearch || activeFilterCount > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      setProductSearch('');
                      setSelectedCategoryFilter('all');
                      setSelectedSubCategoryFilter('all');
                      setSelectedBrandFilter('all');
                    }}
                    className={`px-2.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer transition-all ${
                      isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                    title="Reset Search and Filters"
                  >
                    <RotateCcw size={14} />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                )}
              </div>

              {/* 3 FILTERS BAR: CATEGORY, SUBCATEGORY, BRAND */}
              {showFilterDropdowns && (
                <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl border text-xs animate-fadeIn ${
                  isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <label className={`block text-[10px] font-semibold uppercase mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      Category Filter:
                    </label>
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className={`w-full p-2 rounded-lg border text-xs font-medium ${
                        isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="all">All Categories ({products.length})</option>
                      {availableCategories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat} ({products.filter(p => p.category === cat).length})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-semibold uppercase mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      SubCategory Filter:
                    </label>
                    <select
                      value={selectedSubCategoryFilter}
                      onChange={(e) => setSelectedSubCategoryFilter(e.target.value)}
                      className={`w-full p-2 rounded-lg border text-xs font-medium ${
                        isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="all">All SubCategories</option>
                      {availableSubCategories.map(subCat => (
                        <option key={subCat} value={subCat}>
                          {subCat} ({products.filter(p => p.subCategory === subCat).length})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-semibold uppercase mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      Brand Wise Filter:
                    </label>
                    <select
                      value={selectedBrandFilter}
                      onChange={(e) => setSelectedBrandFilter(e.target.value)}
                      className={`w-full p-2 rounded-lg border text-xs font-medium ${
                        isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="all">All Brands ({availableBrands.length})</option>
                      {availableBrands.map(b => (
                        <option key={b} value={b}>
                          {b} ({products.filter(p => ((p as any).brand || (p as any).brandName) === b).length})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* DIRECT PRODUCT CARDS LIST */}
              <div className="pt-1 space-y-2">
                {!hasActiveSearchOrFilter && items.length === 0 && (
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={14} className={isDark ? 'text-zinc-400' : 'text-slate-500'} />
                      <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                        SUGGESTED ARTICLES (LAST ADDED)
                      </span>
                    </div>
                    <span className={`text-xs font-medium ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                      {displayProducts.length} Articles
                    </span>
                  </div>
                )}

                {!hasActiveSearchOrFilter && items.length > 0 ? null : displayProducts.length === 0 ? (
                  <div className={`p-6 text-center rounded-2xl border border-dashed space-y-2 ${isDark ? 'border-zinc-800' : 'border-slate-300 bg-slate-50/50'}`}>
                    <Package size={28} className={`mx-auto ${isDark ? 'text-zinc-600' : 'text-slate-400'}`} />
                    <p className={`text-xs font-bold uppercase ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {hasActiveSearchOrFilter ? 'No products match article code or filter.' : 'No articles available in catalog.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                    {displayProducts.map(p => {
                      const prodBrand = (p as any).brand || (p as any).brandName || 'Walkaroo';
                      const existingItem = items.find(it => it.productId === p.id);
                      const isAdded = !!existingItem;

                      return (
                        <div
                          key={p.id}
                          onClick={() => handleOpenArticleModal(p)}
                          className={`p-3 rounded-2xl border flex flex-col justify-between gap-2 cursor-pointer transition-all hover:border-slate-400 dark:hover:border-zinc-600 ${
                            isAdded 
                              ? isDark ? 'bg-zinc-800/80 border-zinc-600' : 'bg-slate-100 border-slate-400' 
                              : isDark ? 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900/80' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-12 h-12 rounded-xl border overflow-hidden shrink-0 flex items-center justify-center relative ${
                              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200'
                            }`}>
                              <img
                                src={p.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                              />
                              <Package size={18} className={`absolute -z-10 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1 flex-wrap mb-1">
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                                  isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                                }`}>
                                  {prodBrand}
                                </span>
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                                  isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                                }`}>
                                  {p.category}
                                </span>
                              </div>

                              <h5 className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.name}</h5>
                              <span className={`text-[10px] block mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                                Article: <strong className={isDark ? 'text-zinc-200' : 'text-slate-800'}>{p.id}</strong>
                              </span>
                            </div>
                          </div>

                          <div className={`flex items-center justify-between pt-2 border-t text-xs ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                            <span className={`text-[10px] font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>MRP: ₹{p.price}</span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenArticleModal(p);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                                isAdded 
                                  ? 'bg-emerald-600 text-white' 
                                  : isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700' : 'bg-slate-900 hover:bg-slate-800 text-white'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check size={12} /> {existingItem.quantityPairs} Pairs (Edit)
                                </>
                              ) : (
                                <>
                                  <SlidersHorizontal size={12} /> SELECT COLORS & SIZES
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

                {/* 2. PARTICULAR ARTICLES IN INVOICE ({items.length}) */}
                <div id="particular-articles-section" className={`p-4 sm:p-6 rounded-2xl border space-y-4 transition-all ${
                  isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 ${
                    isDark ? 'border-zinc-800' : 'border-slate-100'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 sm:p-2 rounded-lg border ${
                        isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}>
                        <Package size={17} />
                      </div>
                      <div>
                        <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          Particular Articles in Invoice ({items.length})
                        </h3>
                        <p className={`text-[10px] sm:text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                          {items.length === 0
                            ? 'No products added yet. Select colors & sizes above to add.'
                            : `${items.length} footwear article${items.length > 1 ? 's' : ''} added with chosen colors & sizes`}
                        </p>
                      </div>
                    </div>
                    {items.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                          isDark ? 'bg-zinc-800 border-zinc-700 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        }`}>
                          {totalPairs} Pairs ({totalDozens} Doz)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Empty state or Articles List */}
                  {items.length === 0 ? (
                    <div className={`py-10 px-4 rounded-xl border border-dashed text-center space-y-2.5 ${
                      isDark ? 'border-zinc-800 bg-zinc-950/50' : 'border-slate-200 bg-slate-50'
                    }`}>
                      <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-500 dark:text-zinc-400">
                        <Package size={22} />
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          No Particular Articles Added Yet
                        </h4>
                        <p className={`text-xs max-w-md mx-auto mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                          Search articles in Section 1 above and click <strong>"SELECT COLORS & SIZES"</strong> to add footwear articles to this invoice.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Scrollable List Container */}
                      <div className="max-h-[420px] overflow-y-auto pr-0.5 space-y-2 custom-scrollbar">
                        {items.map((item, idx) => {
                          const matchingProd = products.find(p => p.id === item.productId) || ({
                            id: item.articleCode,
                            name: item.productName,
                            category: item.category,
                            brand: item.brand,
                            price: 0,
                            sizes: item.sizesList || [6, 7, 8, 9, 10]
                          } as any);

                          const selectedSizeEntries = item.sizeQuantities
                            ? Object.entries(item.sizeQuantities)
                                .map(([sz, qty]) => ({ size: Number(sz), qty: Number(qty) }))
                                .filter(sq => sq.qty > 0)
                                .sort((a, b) => a.size - b.size)
                            : [];

                          const itemPrice = item.costPricePerPair > 0 ? item.costPricePerPair : (matchingProd?.price || 0);

                          return (
                            <div
                              key={item.id || idx}
                              className={`p-3 rounded-xl border transition-all ${
                                isDark ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {/* THUMBNAIL */}
                                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border overflow-hidden shrink-0 flex items-center justify-center relative ${
                                  isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                                }`}>
                                  <img
                                    src={matchingProd?.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'}
                                    alt={item.articleCode}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                  />
                                  <Package size={16} className={`absolute -z-10 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`} />
                                </div>

                                {/* MAIN METADATA */}
                                <div className="flex-1 min-w-0 space-y-1">
                                  {/* Row 1: Header */}
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {(item.brand || matchingProd?.brand) && (
                                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                                        isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-200 border-slate-300 text-slate-700'
                                      }`}>
                                        {item.brand || matchingProd?.brand}
                                      </span>
                                    )}
                                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                      Code: <strong className={isDark ? 'text-zinc-200' : 'text-slate-800'}>{item.articleCode}</strong>
                                    </span>
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                                      isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-slate-200 text-slate-700'
                                    }`}>
                                      ₹{itemPrice}
                                    </span>
                                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                                      isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-200 border-slate-300 text-slate-700'
                                    }`}>
                                      🎨 {item.colorName || 'Default'}
                                    </span>
                                    <span className={`text-[10px] font-bold ml-auto sm:ml-0 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                      {item.quantityPairs} Pairs ({item.quantityDozens} Doz)
                                    </span>
                                  </div>

                                  {/* Row 2: Sizes Breakdown */}
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <span className={`text-[9px] font-medium uppercase ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                                      Sizes:
                                    </span>
                                    {selectedSizeEntries.length > 0 ? (
                                      <div className="flex items-center gap-1 flex-wrap">
                                        {selectedSizeEntries.map((sq, sqIdx) => (
                                          <span
                                            key={`sq-item-${sq.size}-${sqIdx}`}
                                            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                                              isDark
                                                ? 'bg-zinc-900 border-zinc-800 text-zinc-200'
                                                : 'bg-white border-slate-200 text-slate-800'
                                            }`}
                                          >
                                            Size {sq.size}: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{sq.qty}p</strong>
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className={`text-[9px] font-bold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                                        {item.size || 'Assorted'} ({item.quantityPairs} Prs)
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* ACTION BUTTONS */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenArticleModal(matchingProd, idx)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                      isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                                    }`}
                                    title="Edit Article"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(idx)}
                                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                                    title="Remove Item"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Summary Row */}
                      <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                        isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-100/70 border-slate-200'
                      }`}>
                        <span className={isDark ? 'text-zinc-400' : 'text-slate-600'}>
                          Total Articles in Invoice: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{items.length}</strong>
                        </span>
                        <div className="flex items-center gap-3">
                          <span className={isDark ? 'text-zinc-400' : 'text-slate-600'}>
                            Quantity: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{totalPairs} Pairs</strong> ({totalDozens} Dozens)
                          </span>
                        </div>
                      </div>

                      {/* CONFIRM STEP: After all products added in Particular Articles, Confirm then Show Next Step Order Invoice Financials */}
                      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                        isDark 
                          ? 'bg-gradient-to-r from-emerald-950/50 via-zinc-900 to-zinc-900 border-emerald-500/40 shadow-lg shadow-emerald-950/20' 
                          : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-emerald-300 shadow-md'
                      }`}>
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/30">
                            <CheckCircle2 size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                Step 1 Confirmed Ready
                              </span>
                              <span className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                                {items.length} Particular Article{items.length > 1 ? 's' : ''} ({totalPairs} Pairs)
                              </span>
                            </div>
                            <h4 className={`text-sm sm:text-base font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              Confirm Particular Articles in Invoice
                            </h4>
                            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                              Click below to confirm articles and proceed to Step 2: <strong>Order Invoice Financials</strong>.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          id="btn-confirm-particular-articles"
                          onClick={() => {
                            setCreateStep('financials');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 transition-all shrink-0"
                        >
                          <Check size={16} />
                          <span>Confirm Articles & Next: Financials</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* --- STEP 2: ORDER INVOICE FINANCIALS --- */
              <div className="space-y-6 animate-fadeIn">
                {/* Top Confirmed Particular Articles Banner with Back to Articles / Review Toggle */}
                <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200 shadow-xs'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <Check size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                          Step 1 Confirmed
                        </span>
                        <h4 className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Particular Articles in Invoice
                        </h4>
                      </div>
                      <p className={`text-xs ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                        {items.length} Articles • {totalPairs} Pairs ({totalDozens} Dozens) confirmed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsReviewArticlesExpanded(!isReviewArticlesExpanded)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{isReviewArticlesExpanded ? 'Hide Articles' : 'Review Particular Articles'} ({items.length})</span>
                      <ChevronDown size={14} className={`transition-transform duration-200 ${isReviewArticlesExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCreateStep('articles');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isDark ? 'bg-zinc-800 border-zinc-700 text-emerald-400 hover:bg-zinc-700' : 'bg-white border-slate-300 text-emerald-700 hover:bg-slate-50'
                      }`}
                    >
                      <Edit3 size={13} />
                      <span>← Edit / Add Articles</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Particular Articles Review Drawer */}
                {isReviewArticlesExpanded && (
                  <div className={`p-4 rounded-2xl border space-y-3 animate-fadeIn ${
                    isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="flex items-center justify-between border-b pb-2 dark:border-zinc-800 border-slate-100">
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                        Confirmed Particular Articles List ({items.length})
                      </h4>
                      <span className={`text-[11px] font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        {totalPairs} Pairs Total
                      </span>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {items.map((it, idx) => (
                        <div key={idx} className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                          isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                              isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-200 text-slate-700'
                            }`}>{idx + 1}</span>
                            <div className="min-w-0">
                              <strong className={`block truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {it.productName} ({it.articleCode})
                              </strong>
                              <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                                Brand: {it.brand} • Color: {it.colorName} • {it.size}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <strong className={`block ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                              {it.quantityPairs} Pairs
                            </strong>
                            <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                              {it.quantityDozens} Doz
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2-Column Responsive Layout: Wholesaler Details (7 cols) + Order Invoice Financials (5 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Wholesaler Details Form (7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 shadow-xs ${
                      isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                    }`}>
                      <div className={`flex items-center justify-between border-b pb-3 ${
                        isDark ? 'border-zinc-800' : 'border-slate-100'
                      }`}>
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg border ${
                            isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}>
                            <Store size={16} />
                          </div>
                          <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            WHOLESALER & DISPATCH DETAILS
                          </h3>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}>
                          Invoice #{invoiceNumber}
                        </span>
                      </div>

                      <div className="space-y-3.5">
                        {/* Wholesaler Name */}
                        <div className="relative">
                          <div className="flex items-center justify-between mb-1">
                            <label className={`text-[11px] font-bold uppercase tracking-wide ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                              WHOLESALER / SUPPLIER NAME *
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowSupplierSuggestions(!showSupplierSuggestions)}
                              className={`text-[11px] font-semibold cursor-pointer flex items-center gap-1 ${
                                isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              <span>Suggestions ({previousSuppliers.length})</span>
                              <ChevronDown size={13} className={`transition-transform duration-200 ${showSupplierSuggestions ? 'rotate-180' : ''}`} />
                            </button>
                          </div>

                          <div className="relative flex items-center">
                            <input
                              id="supplier-name-input"
                              type="text"
                              value={supplierName}
                              onFocus={() => setShowSupplierSuggestions(true)}
                              onChange={(e) => {
                                setSupplierName(e.target.value);
                                setShowSupplierSuggestions(true);
                              }}
                              placeholder="Enter Wholesaler Name (e.g. Walkaroo Kolhapur Hub)..."
                              className={`w-full p-2.5 pr-9 rounded-xl border transition-all text-xs font-medium ${
                                isDark
                                  ? 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-600'
                                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowSupplierSuggestions(!showSupplierSuggestions)}
                              className={`absolute right-3 cursor-pointer p-1 ${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
                            >
                              <ChevronDown size={14} className={`transition-transform duration-200 ${showSupplierSuggestions ? 'rotate-180' : ''}`} />
                            </button>
                          </div>

                          {/* Suggestions Dropdown */}
                          {showSupplierSuggestions && (
                            <div className={`absolute z-30 left-0 right-0 mt-1 rounded-xl border overflow-hidden ${
                              isDark ? 'bg-zinc-900 border-zinc-700 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
                            }`}>
                              <div className={`px-3 py-2 text-[10px] font-bold uppercase border-b flex items-center justify-between ${
                                isDark ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                              }`}>
                                <span>Suggestions ({matchingSuggestions.length})</span>
                                <button type="button" onClick={() => setShowSupplierSuggestions(false)} className="p-0.5"><X size={12} /></button>
                              </div>
                              {matchingSuggestions.length > 0 ? (
                                <div className="max-h-40 overflow-y-auto divide-y divide-zinc-800">
                                  {matchingSuggestions.map((wh, idx) => (
                                    <div
                                      key={idx}
                                      onClick={() => {
                                        setSupplierName(wh.name);
                                        if (wh.phone) setSupplierPhone(wh.phone);
                                        if (wh.address) setSupplierAddress(wh.address);
                                        if (wh.gst) setSupplierGst(wh.gst);
                                        setShowSupplierSuggestions(false);
                                      }}
                                      className={`p-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                                        isDark ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'
                                      }`}
                                    >
                                      <div>
                                        <strong className={`text-xs block ${isDark ? 'text-white' : 'text-slate-900'}`}>{wh.name}</strong>
                                        <span className={`text-[10px] block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                                          {wh.phone ? `📱 ${wh.phone}` : ''} {wh.address ? `• 📍 ${wh.address}` : ''}
                                        </span>
                                      </div>
                                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                                        isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-slate-200 text-slate-800'
                                      }`}>Select</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className={`p-3 text-[11px] text-center ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                                  No saved suggestions match "{supplierName}". Will save as new.
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Contact Number / Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className={`block text-[11px] font-bold uppercase tracking-wide mb-1 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                              CONTACT NUMBER / PHONE
                            </label>
                            <input
                              type="text"
                              value={supplierPhone}
                              onChange={(e) => setSupplierPhone(e.target.value)}
                              placeholder="e.g. +91 98765 11223"
                              className={`w-full p-2.5 rounded-xl border transition-all text-xs font-medium ${
                                isDark
                                  ? 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-600'
                                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white'
                              }`}
                            />
                          </div>

                          {/* Wholesaler GST */}
                          <div>
                            <label className={`block text-[11px] font-bold uppercase tracking-wide mb-1 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                              WHOLESALER GSTIN (OPTIONAL)
                            </label>
                            <input
                              type="text"
                              value={supplierGst}
                              onChange={(e) => setSupplierGst(e.target.value)}
                              placeholder="e.g. 27AAAAA0000A1Z5"
                              className={`w-full p-2.5 rounded-xl border transition-all text-xs font-medium ${
                                isDark
                                  ? 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-600'
                                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Wholesaler Depot Address */}
                        <div>
                          <label className={`block text-[11px] font-bold uppercase tracking-wide mb-1 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                            WHOLESALER DEPOT ADDRESS
                          </label>
                          <input
                            type="text"
                            value={supplierAddress}
                            onChange={(e) => setSupplierAddress(e.target.value)}
                            placeholder="e.g. Kolhapur Main Hub Depot"
                            className={`w-full p-2.5 rounded-xl border transition-all text-xs font-medium ${
                              isDark
                                ? 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-600'
                                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white'
                            }`}
                          />
                        </div>

                        {/* Invoice Date & Payment Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className={`block text-[11px] font-bold uppercase tracking-wide mb-1 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                              ORDER INVOICE DATE
                            </label>
                            <input
                              type="date"
                              value={invoiceDate}
                              onChange={(e) => setInvoiceDate(e.target.value)}
                              className={`w-full p-2.5 rounded-xl border transition-all text-xs font-medium ${
                                isDark
                                  ? 'bg-zinc-950 border-zinc-800 text-white focus:border-zinc-600'
                                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-400 focus:bg-white'
                              }`}
                            />
                          </div>

                          <div>
                            <label className={`block text-[11px] font-bold uppercase tracking-wide mb-1 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                              PAYMENT TERMS
                            </label>
                            <select
                              value={paymentStatus}
                              onChange={(e) => setPaymentStatus(e.target.value as any)}
                              className={`w-full p-2.5 rounded-xl border transition-all text-xs font-medium ${
                                isDark
                                  ? 'bg-zinc-950 border-zinc-800 text-white focus:border-zinc-600'
                                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-400 focus:bg-white'
                              }`}
                            >
                              <option value="credit">Credit (Bill Due on Delivery)</option>
                              <option value="partial">Partial Advance Paid</option>
                              <option value="paid">100% Paid Advance</option>
                            </select>
                          </div>
                        </div>

                        {/* Dispatch / Order Notes */}
                        <div>
                          <label className={`block text-[11px] font-bold uppercase tracking-wide mb-1 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                            TRANSPORT / DISPATCH NOTES
                          </label>
                          <textarea
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add transport depot instructions, preferred transporter, delivery expectations..."
                            className={`w-full p-2.5 rounded-xl border transition-all text-xs font-medium ${
                              isDark
                                ? 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-600'
                                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Invoice Financials Summary Box (5 cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 shadow-sm ${
                      isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                    }`}>
                      {/* Financial Summary Header */}
                      <div className="flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-zinc-800">
                        <div className={`p-1.5 rounded-lg border ${
                          isDark ? 'bg-zinc-800 border-zinc-700 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}>
                          <DollarSign size={16} />
                        </div>
                        <div>
                          <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Order Invoice Financials
                          </h3>
                          <p className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                            Financial breakdown & final order confirmation
                          </p>
                        </div>
                      </div>

                      {/* Financial Metric Rows */}
                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>Total Articles in Invoice:</span>
                          <strong className={isDark ? 'text-white' : 'text-slate-900'}>{items.length} Articles</strong>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>Total Order Pairs:</span>
                          <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalPairs} Pairs</strong>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>Total Order Dozens:</span>
                          <strong className={isDark ? 'text-white' : 'text-slate-900'}>{totalDozens} Dozens</strong>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t dark:border-zinc-800 border-slate-100">
                          <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>Estimated MRP Value:</span>
                          <span className={`font-bold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                            ₹{items.reduce((sum, item) => {
                              const prod = products.find(p => p.id === item.productId);
                              const mrp = item.costPricePerPair > 0 ? item.costPricePerPair : (prod?.price || 0);
                              return sum + (mrp * item.quantityPairs);
                            }, 0).toLocaleString()}
                          </span>
                        </div>

                        {/* Freight / Transport charges */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>Freight / Transport (₹):</span>
                          <input
                            type="number"
                            min="0"
                            value={freightCharges || ''}
                            onChange={(e) => setFreightCharges(Math.max(0, Number(e.target.value) || 0))}
                            placeholder="0"
                            className={`w-24 p-1.5 text-right rounded-lg border text-xs font-bold ${
                              isDark
                                ? 'bg-zinc-950 border-zinc-800 text-white'
                                : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t dark:border-zinc-800 border-slate-100">
                          <span className={`font-bold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Payment Status:</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            paymentStatus === 'paid'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                              : paymentStatus === 'partial'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                                : 'bg-blue-500/10 border-blue-500/30 text-blue-500'
                          }`}>
                            {paymentStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Rates Note */}
                      <div className={`p-2.5 rounded-xl text-[11px] border ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        💡 <strong>Wholesaler Rate Note:</strong> Rates & discount percentages will be locked on receipt of physical invoice or wholesaler dispatch memo.
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 flex flex-col gap-2.5 border-t border-slate-100 dark:border-zinc-800">
                        <button
                          type="button"
                          disabled={isSavingInvoice}
                          onClick={executeSaveInvoice}
                          className={`w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-black text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                            isSavingInvoice ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          <CheckCircle2 size={16} />
                          <span>{isSavingInvoice ? 'SAVING ORDER INVOICE...' : 'CONFIRM & SAVE ORDER INVOICE'}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCreateStep('articles');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              isDark
                                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-zinc-700'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                            }`}
                          >
                            <ArrowLeft size={13} />
                            <span>Back to Articles</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsPreviewModalOpen(true)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              isDark
                                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-zinc-700'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                            }`}
                          >
                            <Eye size={13} />
                            <span>Preview</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* --- STICKY MOBILE BOTTOM BAR (MODE === CREATE) --- */}
      {mode === 'create' && items.length > 0 && (
        <div className={`sticky bottom-0 z-30 w-full border-t p-3 lg:hidden backdrop-blur-md flex items-center justify-between gap-2 ${
          isDark ? 'bg-zinc-900/95 border-zinc-800' : 'bg-white/95 border-slate-200 shadow-lg'
        }`}>
          <div>
            <span className={`text-[10px] block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Articles: {items.length}</span>
            <strong className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalPairs} Pairs</strong>
          </div>

          <div>
            {createStep === 'articles' ? (
              <button
                type="button"
                onClick={() => {
                  setCreateStep('financials');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase flex items-center gap-1.5 shadow cursor-pointer active:scale-95"
              >
                <span>Confirm Articles →</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isSavingInvoice}
                onClick={executeSaveInvoice}
                className={`px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold uppercase flex items-center gap-1.5 shadow ${
                  isSavingInvoice ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'
                }`}
              >
                <CheckCircle2 size={15} />
                <span>CONFIRM & SAVE</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- ARTICLE COLOR & SIZE SELECTION MODAL --- */}
      {selectedProductForModal && (
        <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden my-auto transition-all ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className={`p-4 sm:p-5 border-b flex items-start justify-between gap-3 ${
              isDark ? 'border-zinc-800 bg-zinc-950/60' : 'border-slate-100 bg-slate-50'
            }`}>
              <div className="flex items-start gap-3.5 min-w-0">
                <div className={`w-14 h-14 rounded-xl border overflow-hidden shrink-0 flex items-center justify-center relative ${
                  isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'
                }`}>
                  <img
                    src={selectedProductForModal.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'}
                    alt={selectedProductForModal.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <Package size={22} className={`absolute -z-10 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`} />
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                      isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-200 border-slate-300 text-slate-700'
                    }`}>
                      {(selectedProductForModal as any).brand || (selectedProductForModal as any).brandName || 'Walkaroo'}
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                      isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-200 border-slate-300 text-slate-700'
                    }`}>
                      {selectedProductForModal.category}
                    </span>
                  </div>

                  <h3 className={`text-base font-bold truncate leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedProductForModal.name}
                  </h3>

                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className={`px-2 py-0.5 rounded-lg border font-semibold ${
                      isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                    }`}>
                      Article Code: <strong>{selectedProductForModal.id}</strong>
                    </span>
                    <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      MRP: <strong className={isDark ? 'text-zinc-200' : 'text-slate-800'}>₹{selectedProductForModal.price}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setSelectedProductForModal(null); setEditingItemIndex(null); }}
                className={`p-2 rounded-xl cursor-pointer transition-all shrink-0 ${
                  isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white' : 'bg-slate-200/70 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-6 max-h-[72vh] overflow-y-auto">

              {/* Toast / Notification Alert */}
              {sizeUpdateSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
                  <span>{sizeUpdateSuccessMsg}</span>
                </div>
              )}

              {/* 1. COLOR SELECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    <Tag size={14} className={isDark ? 'text-zinc-400' : 'text-slate-500'} />
                    <span>Select Article Color</span>
                  </label>
                  <div className="flex items-center gap-2.5">
                    {modalSelectedColor && (
                      <span className={`text-[11px] font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                        Selected: <span className={isDark ? 'text-white' : 'text-slate-900'}>{modalSelectedColor}</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowAddColorForm(prev => !prev)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                        showAddColorForm
                          ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                          : isDark ? 'bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700' : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <Plus size={12} />
                      <span>+ Add Color</span>
                    </button>
                  </div>
                </div>

                {/* Inline Add Color Form */}
                {showAddColorForm && (
                  <div className={`p-3.5 rounded-xl border space-y-3 animate-fadeIn ${
                    isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase flex items-center gap-1.5 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                        <Tag size={14} />
                        Add New Color to Article ({selectedProductForModal?.id})
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddColorForm(false)}
                        className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Color name (e.g. Olive, Cherry, Tan)"
                        value={customColorInput}
                        onChange={(e) => setCustomColorInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (customColorInput.trim()) handleAddCustomColorToArticle(customColorInput);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-medium flex-1 ${
                          isDark ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customColorInput.trim()) handleAddCustomColorToArticle(customColorInput);
                        }}
                        disabled={!customColorInput.trim()}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 ${
                          isDark ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        Add Color
                      </button>
                    </div>
                  </div>
                )}

                {modalAvailableColors.length === 1 ? (
                  <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <div
                      className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: modalAvailableColors[0].hex }}
                    />
                    <div>
                      <span className="text-xs font-bold uppercase block">
                        ✓ Color: {modalAvailableColors[0].name}
                      </span>
                      <span className={`text-[10px] block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        Primary color for this article. Automatically selected.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    {modalAvailableColors.map((c, cIdx) => {
                      const isSelected = modalSelectedColor === c.name;
                      return (
                        <button
                          key={`btn-color-${c.id}-${c.name}-${cIdx}`}
                          type="button"
                          onClick={() => setModalSelectedColor(c.name)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 cursor-pointer transition-all ${
                            isSelected
                              ? isDark ? 'bg-zinc-100 text-zinc-900 border-zinc-100' : 'bg-slate-900 text-white border-slate-900'
                              : isDark
                                ? 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                                : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full border border-black/30 shrink-0" style={{ backgroundColor: c.hex }} />
                          <span>{c.name}</span>
                          {isSelected && <Check size={14} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. SIZES & QUANTITY SELECTION */}
              <div className={`space-y-3 pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-slate-100'}`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    <Layers size={14} className={isDark ? 'text-zinc-400' : 'text-slate-500'} />
                    <span>Choose Sizes</span>
                  </label>

                  {/* Quick Shortcuts */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setShowAddSizeForm(prev => !prev)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                        showAddSizeForm
                          ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                          : isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                      title="Add another size to this article"
                    >
                      <Plus size={12} />
                      <span>+ Add Other Size</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectAllModalSizes(1)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                        isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span>+ Select All Sizes</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClearModalSizes}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                        isDark ? 'bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400' : 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200'
                      }`}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Inline Add Size Form */}
                {showAddSizeForm && (
                  <div className={`p-3.5 rounded-xl border space-y-3 animate-fadeIn ${
                    isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase flex items-center gap-1.5 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                        <PlusCircle size={14} />
                        Add Other Size to Article ({selectedProductForModal?.id})
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddSizeForm(false)}
                        className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Quick Add Standard Sizes */}
                    <div className="space-y-1.5">
                      <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        Quick Add Standard Sizes:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
                          .filter(s => !modalAvailableSizes.includes(s))
                          .map((s, sIdx) => (
                            <button
                              key={`std-size-btn-${s}-${sIdx}`}
                              type="button"
                              onClick={() => handleAddCustomSizeToArticle(s)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                                isDark
                                  ? 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800'
                                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                              }`}
                            >
                              + Size {s}
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* Custom Size Number Input */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        placeholder="Enter size number (e.g. 12)"
                        value={customSizeInput}
                        onChange={(e) => setCustomSizeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = Number(customSizeInput);
                            if (val > 0) handleAddCustomSizeToArticle(val);
                          }
                        }}
                        className={`p-2 rounded-xl border text-xs font-medium w-48 ${
                          isDark ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = Number(customSizeInput);
                          if (val > 0) handleAddCustomSizeToArticle(val);
                        }}
                        disabled={!customSizeInput || Number(customSizeInput) <= 0}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 ${
                          isDark ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        Add Size All Over
                      </button>
                    </div>
                  </div>
                )}

                {/* Size Chips Multi-Selector Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                  {modalAvailableSizes.map((sz, szIdx) => {
                    const currentQty = modalSelectedSizesMap[sz] || 0;
                    const isSelected = currentQty > 0;
                    return (
                      <button
                        key={`modal-sz-chip-${sz}-${szIdx}`}
                        type="button"
                        onClick={() => {
                          setModalSelectedSizesMap(prev => ({
                            ...prev,
                            [sz]: isSelected ? 0 : 1
                          }));
                        }}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                          isSelected
                            ? isDark ? 'bg-zinc-100 text-zinc-900 border-zinc-100 font-bold' : 'bg-slate-900 text-white border-slate-900 font-bold'
                            : isDark
                              ? 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className={`text-[9px] uppercase font-medium ${isSelected ? (isDark ? 'text-zinc-700' : 'text-slate-300') : isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Size</span>
                        <span className="text-base font-bold">{sz}</span>
                        <span className="text-[10px] mt-0.5 font-semibold">
                          {isSelected ? `${currentQty} Pairs` : '+ Select'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Quantity Adjuster ONLY for Selected Sizes */}
                {modalAvailableSizes.filter(sz => (Number(modalSelectedSizesMap[sz]) || 0) > 0).length > 0 ? (
                  <div className={`space-y-2 mt-4 pt-3 border-t animate-fadeIn ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                      <span className={`font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Edit Pair Quantity for Selected Sizes:</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] uppercase ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Batch Add:</span>
                        <button type="button" onClick={() => handleBatchAdjustModalSizes(1)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                          isDark ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                        }`}>+1 Pair</button>
                        <button type="button" onClick={() => handleBatchAdjustModalSizes(4)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                          isDark ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                        }`}>+4 Pairs</button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {modalAvailableSizes
                        .filter(sz => (Number(modalSelectedSizesMap[sz]) || 0) > 0)
                        .map((sz, szIdx) => {
                          const pairs = Number(modalSelectedSizesMap[sz]) || 0;
                          return (
                            <div key={`modal-sz-qty-row-${sz}-${szIdx}`} className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                              isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
                            }`}>
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-lg font-bold text-xs border ${
                                  isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-slate-200 border-slate-300 text-slate-800'
                                }`}>
                                  Size {sz}
                                </span>
                                <span className={`text-xs ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                                  = <strong className={isDark ? 'text-white' : 'text-slate-900'}>{pairs} Pairs</strong>
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateModalSingleSize(sz, -1)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                                    isDark ? 'bg-zinc-800 text-rose-400 hover:bg-rose-500/20' : 'bg-slate-200 text-rose-600 hover:bg-rose-100'
                                  }`}
                                  title="Decrease 1 Pair"
                                >-1</button>

                                <input
                                  type="number"
                                  min="1"
                                  value={pairs}
                                  onChange={(e) => handleSetModalSingleSize(sz, Number(e.target.value) || 1)}
                                  className={`w-16 p-1 text-center border rounded-lg font-bold text-xs ${
                                    isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                                  }`}
                                />

                                <button
                                  type="button"
                                  onClick={() => handleUpdateModalSingleSize(sz, 1)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                                    isDark ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                                  }`}
                                  title="Add 1 Pair"
                                >+1</button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateModalSingleSize(sz, 4)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                                    isDark ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                                  }`}
                                  title="Add 4 Pairs"
                                >+4</button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-xl border border-dashed text-center animate-fadeIn mt-3 ${
                    isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-slate-50/80 border-slate-300'
                  }`}>
                    <p className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      👆 Click size buttons above to select sizes for this article.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className={`p-4 sm:p-5 border-t flex items-center justify-between gap-3 ${
              isDark ? 'border-zinc-800 bg-zinc-950/80' : 'border-slate-100 bg-slate-50'
            }`}>
              <div>
                <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Total Selected:</span>
                <strong className={`text-sm font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {modalTotalPairs} Pairs Total
                </strong>
                <span className={`text-[10px] block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Color: {modalSelectedColor || 'Standard'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setSelectedProductForModal(null); setEditingItemIndex(null); }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={modalTotalPairs <= 0}
                  onClick={handleConfirmArticleFromModal}
                  className={`px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-xs uppercase flex items-center gap-2 transition-all ${
                    modalTotalPairs <= 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <CheckCircle2 size={16} />
                  <span>{editingItemIndex !== null ? 'Update Item' : `Add ${modalTotalPairs} Pairs`}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- WHOLESALER DETAILS SAVING MODAL --- */}
      {isWholesalerModalOpen && (
        <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn font-sans">
          <div className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden my-auto ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
              isDark ? 'border-zinc-800/80 bg-zinc-950/50' : 'border-slate-100 bg-slate-50/80'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${
                  isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600 border border-amber-200/60'
                }`}>
                  <Building2 size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider text-amber-600 dark:text-amber-500">
                    Wholesaler Details
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Enter or select Wholesaler Name, Contact, and Depot Address to save order invoice.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsWholesalerModalOpen(false)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-200 text-slate-500'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 font-mono text-xs">
              {/* Summary snippet */}
              <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <span>Selected Order Items: <strong>{items.length} Articles</strong></span>
                <span className="font-black text-sm">{totalPairs} Total Pairs</span>
              </div>

              {/* Wholesaler Name */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className={`font-bold uppercase ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Wholesaler / Supplier Name *</label>
                  <button
                    type="button"
                    onClick={() => setShowSupplierSuggestions(!showSupplierSuggestions)}
                    className="text-[10px] text-amber-600 dark:text-amber-500 hover:text-amber-700 font-bold cursor-pointer flex items-center gap-1"
                  >
                    <span>Suggestions ({previousSuppliers.length})</span>
                    <ChevronDown size={12} className={`transition-transform duration-200 ${showSupplierSuggestions ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={supplierName}
                    onFocus={() => setShowSupplierSuggestions(true)}
                    onChange={(e) => {
                      setSupplierName(e.target.value);
                      setShowSupplierSuggestions(true);
                    }}
                    placeholder="Enter Wholesaler Name (e.g. Walkaroo Kolhapur)..."
                    className={`w-full p-3 pr-9 rounded-2xl border transition-all text-xs font-mono font-bold ${
                      isDark ? 'bg-zinc-950 border-zinc-800 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500 focus:bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSupplierSuggestions(!showSupplierSuggestions)}
                    className={`absolute right-3 cursor-pointer p-1 ${isDark ? 'text-zinc-400 hover:text-amber-500' : 'text-slate-400 hover:text-amber-600'}`}
                  >
                    <ChevronDown size={14} className={`transition-transform duration-200 ${showSupplierSuggestions ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Suggestions Dropdown */}
                {showSupplierSuggestions && (
                  <div className={`absolute z-30 left-0 right-0 mt-1 rounded-2xl border shadow-2xl overflow-hidden ${
                    isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
                  }`}>
                    <div className={`px-3 py-2 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase border-b flex items-center justify-between ${
                      isDark ? 'bg-amber-500/10 border-zinc-800' : 'bg-amber-50 border-slate-100'
                    }`}>
                      <span>Suggestions ({matchingSuggestions.length})</span>
                      <button type="button" onClick={() => setShowSupplierSuggestions(false)} className="p-0.5"><X size={12} /></button>
                    </div>
                    {matchingSuggestions.length > 0 ? (
                      <div className="max-h-40 overflow-y-auto divide-y divide-zinc-800">
                        {matchingSuggestions.map((wh, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setSupplierName(wh.name);
                              if (wh.phone) setSupplierPhone(wh.phone);
                              if (wh.address) setSupplierAddress(wh.address);
                              if (wh.gst) setSupplierGst(wh.gst);
                              setShowSupplierSuggestions(false);
                            }}
                            className={`p-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                              isDark ? 'hover:bg-amber-500/10' : 'hover:bg-amber-50'
                            }`}
                          >
                            <div>
                              <strong className="text-xs text-amber-600 dark:text-amber-400 block">{wh.name}</strong>
                              <span className={`text-[10px] block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                                {wh.phone ? `📱 ${wh.phone}` : ''} {wh.address ? `• 📍 ${wh.address}` : ''}
                              </span>
                            </div>
                            <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold uppercase">Select</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 text-[11px] text-center text-zinc-400">
                        No saved suggestions match "{supplierName}". Will save as new.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wholesaler Contact */}
              <div>
                <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Contact Number / Phone</label>
                <input
                  type="text"
                  value={supplierPhone}
                  onChange={(e) => setSupplierPhone(e.target.value)}
                  placeholder="e.g. +91 98765 11223"
                  className={`w-full p-3 rounded-2xl border transition-all text-xs font-mono font-bold ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                  }`}
                />
              </div>

              {/* Wholesaler Depot Address */}
              <div>
                <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Wholesaler Depot Address</label>
                <input
                  type="text"
                  value={supplierAddress}
                  onChange={(e) => setSupplierAddress(e.target.value)}
                  placeholder="e.g. Kolhapur Main Hub Depot"
                  className={`w-full p-3 rounded-2xl border transition-all text-xs font-mono font-bold ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                  }`}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-4 sm:p-5 border-t flex items-center justify-between gap-3 ${
              isDark ? 'border-zinc-800 bg-zinc-950/50' : 'border-slate-100 bg-slate-50/80'
            }`}>
              <button
                type="button"
                onClick={() => setIsWholesalerModalOpen(false)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold cursor-pointer ${
                  isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Back to Articles
              </button>

              <button
                type="button"
                disabled={isSavingInvoice || !supplierName.trim()}
                onClick={executeSaveInvoice}
                className={`px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase flex items-center gap-2 shadow-lg shadow-amber-500/20 ${
                  isSavingInvoice || !supplierName.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <CheckCircle2 size={16} />
                <span>{isSavingInvoice ? 'Saving Order...' : 'Confirm & Save Order Invoice'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ORDER PREVIEW MODAL --- */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn font-sans">
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
              isDark ? 'border-zinc-800/80 bg-zinc-950/50' : 'border-slate-100 bg-slate-50/80'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${
                  isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600 border border-amber-200/60'
                }`}>
                  <Eye size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider text-amber-600 dark:text-amber-500">
                    Order Invoice Preview
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Ref No: <strong className="font-mono">{invoiceNumber}</strong> • Date: <span className="font-mono">{invoiceDate}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-200 text-slate-500'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4 font-mono text-xs overflow-y-auto custom-scrollbar flex-1">
              {/* Wholesaler Info */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between flex-wrap gap-2 ${
                isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className={`text-[10px] block uppercase font-bold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Wholesaler / Supplier</span>
                  <strong className="text-sm text-amber-600 dark:text-amber-400">
                    {supplierName.trim() || 'Not Selected Yet (Will select on save)'}
                  </strong>
                  {supplierPhone && <span className={`text-xs block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Phone: {supplierPhone}</span>}
                </div>
                <div className="text-right">
                  <span className={`text-[10px] block uppercase font-bold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Total Pairs</span>
                  <span className="text-sm font-black text-amber-500">{totalPairs} Pairs</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                    Articles in Order ({items.length})
                  </span>
                  <span className={`text-[10px] font-bold ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                    Estimated Total: ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                  {items.map((item, idx) => {
                    const matchingProd = products.find(p => p.id === item.productId) || ({
                      id: item.articleCode,
                      name: item.productName || item.articleCode,
                      category: item.category || 'General',
                      price: item.costPricePerPair || 0,
                      imageUrl: ''
                    } as Product);

                    const selectedSizeEntries = item.sizeQuantities
                      ? Object.entries(item.sizeQuantities)
                          .map(([sz, qty]) => ({ size: sz, qty: Number(qty) }))
                          .filter(sq => sq.qty > 0)
                      : [];

                    const itemPrice = item.costPricePerPair || matchingProd?.price || 0;
                    const itemSubtotal = item.totalCost || (item.quantityPairs * itemPrice);

                    return (
                      <div
                        key={`po-item-${item.id || 'it'}-${idx}`}
                        className={`p-3 rounded-2xl border transition-all ${
                          isDark ? 'bg-zinc-950/90 border-zinc-800' : 'bg-slate-50/90 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl border overflow-hidden shrink-0 flex items-center justify-center relative ${
                            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                          }`}>
                            <img
                              src={matchingProd?.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'}
                              alt={matchingProd?.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                            <Package size={16} className={`absolute -z-10 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`} />
                          </div>

                          <div className="flex-1 min-w-0 font-mono space-y-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {(item.brand || matchingProd?.brand) && (
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                    {item.brand || matchingProd?.brand}
                                  </span>
                                )}
                                <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  Code: <strong className="text-amber-600 dark:text-amber-400">{item.articleCode}</strong>
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-white border border-slate-200 text-slate-700'
                                }`}>
                                  ₹{itemPrice} / pr
                                </span>
                              </div>

                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                🎨 {item.colorName || 'Default'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className={`text-[9px] font-bold uppercase ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                                  Sizes:
                                </span>
                                {selectedSizeEntries.length > 0 ? (
                                  selectedSizeEntries.map((sq, sqIdx) => (
                                    <span
                                      key={`sq-item-${sq.size}-${sqIdx}`}
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                                        isDark
                                          ? 'bg-zinc-900 border-zinc-800 text-zinc-200'
                                          : 'bg-white border-slate-200 text-slate-800'
                                      }`}
                                    >
                                      S{sq.size}: <strong className="text-amber-600 dark:text-amber-400">{sq.qty}p</strong>
                                    </span>
                                  ))
                                ) : (
                                  <span className={`text-[10px] font-bold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                                    {item.size || 'Assorted'}
                                  </span>
                                )}
                              </div>

                              <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                                {item.quantityPairs} prs • ₹{itemSubtotal.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Financial Summary Box */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-amber-50/50 border-amber-200/80'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <span className={isDark ? 'text-zinc-400' : 'text-slate-600'}>Total Articles:</span>
                  <strong className={isDark ? 'text-white' : 'text-slate-900'}>{items.length} Articles</strong>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={isDark ? 'text-zinc-400' : 'text-slate-600'}>Total Quantity:</span>
                  <strong className="text-amber-600 dark:text-amber-400 font-black">{totalPairs} Pairs</strong>
                </div>
                <div className="flex items-center justify-between text-sm border-t pt-2 border-amber-500/20">
                  <span className="font-black uppercase text-amber-600 dark:text-amber-500">Estimated Total Amount:</span>
                  <strong className="text-base font-black text-amber-600 dark:text-amber-400">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-4 sm:p-5 border-t flex items-center justify-between gap-3 shrink-0 ${
              isDark ? 'border-zinc-800 bg-zinc-950/50' : 'border-slate-100 bg-slate-50/80'
            }`}>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold cursor-pointer ${
                  isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Close Preview
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  handleOpenWholesalerSaveModal();
                }}
                className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Save size={16} />
                <span>Save & Place Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
