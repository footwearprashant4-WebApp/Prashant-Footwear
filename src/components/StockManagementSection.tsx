import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Package, Plus, Search, Filter, AlertTriangle, CheckCircle2, 
  IndianRupee, Layers, FileText, QrCode, Edit3, ArrowRight,
  TrendingDown, TrendingUp, RefreshCw, ShoppingCart, Eye, Check, X,
  Building2, Hash, Sparkles, SlidersHorizontal, ArrowLeft,
  Receipt, Database, PlusCircle, Trash2, ClipboardList, Calendar,
  ChevronDown, Minus, Tag
} from 'lucide-react';
import { Product, Category, SubCategory } from '../types';
import { AddedStockHistoryView } from './AddedStockHistoryView';
import { COLOR_REGISTRY, getHexFromColorName } from '../utils/articleVariants';

// Color codes mapping to ensure numeric codes (like 9 for Malive) resolve to their real footwear color names
const COLOR_CODE_MAP: Record<string, { name: string; hex: string }> = {
  '1': { name: 'BLACK', hex: '#18181B' },
  '2': { name: 'BROWN', hex: '#7C4B27' },
  '3': { name: 'TAN', hex: '#B87333' },
  '4': { name: 'WHITE', hex: '#F8FAFC' },
  '5': { name: 'CHERRY', hex: '#7A1C1C' },
  '6': { name: 'OLIVE', hex: '#556B2F' },
  '7': { name: 'NAVY', hex: '#1D2A44' },
  '8': { name: 'GREY', hex: '#6B7280' },
  '9': { name: 'MALIVE', hex: '#9333EA' },
  '10': { name: 'MAROON', hex: '#800000' },
  '11': { name: 'GREEN', hex: '#10B981' },
  '12': { name: 'BLUE', hex: '#2563EB' },
  '13': { name: 'YELLOW', hex: '#F59E0B' },
  '14': { name: 'BEIGE', hex: '#D4B996' },
  '15': { name: 'PINK', hex: '#EC4899' }
};

export interface InwardStockItem {
  id: string;
  productId: string;
  productName: string;
  articleCode: string;
  brand: string;
  imageUrl?: string;
  category?: string;
  size: string | number;
  color?: string;
  quantity: number;
  costPrice: number;
}

interface StockManagementSectionProps {
  products: Product[];
  isDark: boolean;
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  onOpenAddInvoice?: () => void;
  onOpenInvoicesList?: () => void;
  onOpenCheckInventory?: () => void;
  onGoToWholesaleDemand?: () => void;
  onBackToHome?: () => void;
  onAddNewProduct?: () => void;
  stockLedgers?: any[];
  onCreateStockLedger?: (ledger: any) => Promise<{ success: boolean; id?: string; error?: string }>;
}

export const StockManagementSection: React.FC<StockManagementSectionProps> = ({
  products = [],
  isDark,
  onUpdateProduct,
  onOpenAddInvoice,
  onOpenInvoicesList,
  onOpenCheckInventory,
  onGoToWholesaleDemand,
  onBackToHome,
  onAddNewProduct,
  stockLedgers = [],
  onCreateStockLedger
}) => {
  // Main Navigation Tabs matching reference image:
  // 1. ADD STOCK, 2. INVENTORY DATABASE, 3. ADDED STOCK HISTORY
  const [activeStockTab, setActiveStockTab] = useState<'add_stock' | 'database' | 'history'>('add_stock');

  // --- ADD STOCK FORM STATE ---
  const [styleSearch, setStyleSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string | number>('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [inwardQuantity, setInwardQuantity] = useState<number>(1);
  const [inwardCostPrice, setInwardCostPrice] = useState<number>(0);

  // Helper to generate next unique invoice reference number: Add-YYMMDDXX (e.g. Add-26091801)
  // where YYMMDD is the 2-digit year, month, date, and XX is the 2-digit count of added stock invoice on that day
  const getNextInvoiceReference = () => {
    const d = new Date();
    const yy = d.getFullYear().toString().slice(-2);
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    const datePrefix = `Add-${yy}${mm}${dd}`;

    try {
      let maxSeq = 0;
      const historyKey = 'prashant_added_stock_history';
      const stored = localStorage.getItem(historyKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((rec: any) => {
            const ref = String(rec.id || rec.reference || '');
            if (ref.startsWith(datePrefix)) {
              const suffix = ref.slice(datePrefix.length);
              const num = parseInt(suffix, 10);
              if (!isNaN(num) && num > maxSeq) {
                maxSeq = num;
              }
            }
          });
        }
      }

      if (Array.isArray(stockLedgers)) {
        stockLedgers.forEach((l: any) => {
          const ref = String(l.reference || l.id || '');
          if (ref.startsWith(datePrefix)) {
            const suffix = ref.slice(datePrefix.length);
            const num = parseInt(suffix, 10);
            if (!isNaN(num) && num > maxSeq) {
              maxSeq = num;
            }
          }
        });
      }

      const nextSeq = (maxSeq + 1).toString().padStart(2, '0');
      return `${datePrefix}${nextSeq}`;
    } catch (e) {}
    return `${datePrefix}01`;
  };

  // Active Invoice Reference Number state (e.g. Add-26091801)
  const [invoiceRefNumber, setInvoiceRefNumber] = useState<string>(() => getNextInvoiceReference());

  // Inward Goods Receipt / Draft Stock Invoice
  const [inwardItems, setInwardItems] = useState<InwardStockItem[]>([]);
  const [supplierName, setSupplierName] = useState('Walkaroo Wholesaler / Main Depot');
  // Purchase invoice reference is optional and has no pre-text
  const [challanNumber, setChallanNumber] = useState('');
  const [isSubmittingInward, setIsSubmittingInward] = useState(false);
  // Operator name: blank by default, previous mock suggestions removed, only suggests names entered from now on
  const [operatorName, setOperatorName] = useState('');
  const [showOperatorSuggestions, setShowOperatorSuggestions] = useState(false);
  const operatorDropdownRef = useRef<HTMLDivElement>(null);
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>({});

  // Real operator history starting from now (all hardcoded previous defaults cleared)
  const [operatorHistory, setOperatorHistory] = useState<string[]>(() => {
    try {
      localStorage.removeItem('prashant_previous_operators');
      const stored = localStorage.getItem('prashant_operators_from_now');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean);
      }
    } catch (e) {}
    return [];
  });

  // Close operator suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (operatorDropdownRef.current && !operatorDropdownRef.current.contains(e.target as Node)) {
        setShowOperatorSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manual extra size input and permanent allotment toggle
  const [manualSizeInput, setManualSizeInput] = useState('');
  const [allotNewSizePermanently, setAllotNewSizePermanently] = useState(true);

  // Custom colors added by user
  const [customColorsByProduct, setCustomColorsByProduct] = useState<Record<string, { name: string; hex: string }[]>>({});
  const [showAddColorInput, setShowAddColorInput] = useState(false);
  const [newColorInput, setNewColorInput] = useState('');

  // Format size labels as (Uk 06), (Uk 07), etc. matching user reference image
  const formatSizeLabel = (sz: string | number) => {
    const s = String(sz).trim();
    const num = parseInt(s, 10);
    if (!isNaN(num) && num >= 0 && num < 10 && !s.includes('.')) {
      return `(Uk 0${num})`;
    }
    return `(Uk ${s})`;
  };

  // --- DATABASE VIEW STATE (Matching Reference Image) ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | Category>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [showBrandFilter, setShowBrandFilter] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [stockLevelFilter, setStockLevelFilter] = useState<'all' | 'low' | 'out' | 'healthy'>('all');
  const [expandedProductIds, setExpandedProductIds] = useState<Record<string, boolean>>({});

  const toggleExpandProduct = (productId: string) => {
    setExpandedProductIds(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // Category counts for badges in filter tabs
  const menCount = useMemo(() => products.filter(p => (p.category || '').toLowerCase() === 'men').length, [products]);
  const womenCount = useMemo(() => products.filter(p => (p.category || '').toLowerCase() === 'women').length, [products]);
  const kidsCount = useMemo(() => products.filter(p => (p.category || '').toLowerCase() === 'kids').length, [products]);

  // Available footwear types (e.g. Sandals, Office Wear, Slippers, Casual, etc.)
  const availableFootwearTypes = useMemo(() => {
    const types = new Set<string>();
    products.forEach(p => {
      const pName = (p.name || '').toLowerCase();
      if (p.subCategory) types.add(p.subCategory);
      else if (pName.includes('sandal')) types.add('Sandals');
      else if (pName.includes('office') || pName.includes('formal')) types.add('Office Wear');
      else if (pName.includes('slipper') || pName.includes('chappal')) types.add('Slippers');
      else if (pName.includes('casual') || pName.includes('sneaker')) types.add('Casual');
      else if (pName.includes('clog')) types.add('Clogs');
      else if (pName.includes('boot')) types.add('Boots');
    });
    // Ensure common footwear types exist
    ['Sandals', 'Office Wear', 'Slippers', 'Casual', 'Formal'].forEach(t => types.add(t));
    return Array.from(types).sort();
  }, [products]);

  // Authentic color dot helper to match reference image (e.g. purple for women sandals, black for office wear)
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
    if (p.category === 'Women') return '#C026D3'; // Vibrant Purple / Magenta as shown in reference image
    if (p.category === 'Men') return '#18181B'; // Jet Black as shown in reference image
    return '#FFA000';
  };

  // Quick Stock Edit Modal State
  const [editingStockProduct, setEditingStockProduct] = useState<Product | null>(null);
  const [editedSizeStock, setEditedSizeStock] = useState<Record<string, number>>({});
  const [isSavingStock, setIsSavingStock] = useState(false);
  const [stockSuccessMsg, setStockSuccessMsg] = useState<string | null>(null);

  // Barcode Preview Modal State
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);

  // Toggle state for showing all / other shoe sizes
  const [showOtherSizes, setShowOtherSizes] = useState(false);

  // Toggle state for custom footwear styles dropdown with thumbnails
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const styleDropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (styleDropdownRef.current && !styleDropdownRef.current.contains(e.target as Node)) {
        setIsStyleDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Selected product object for Add Stock form
  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || null;
  }, [products, selectedProductId]);

  // Allotted sizes for selected product
  const allottedSizes = useMemo(() => {
    if (!selectedProduct) return ['6', '7', '8', '9'];
    if (selectedProduct.sizes && selectedProduct.sizes.length > 0) {
      return selectedProduct.sizes.map(String);
    }
    if (selectedProduct.sizeStock && Object.keys(selectedProduct.sizeStock).length > 0) {
      return Object.keys(selectedProduct.sizeStock).sort((a, b) => Number(a) - Number(b));
    }
    return ['6', '7', '8', '9'];
  }, [selectedProduct]);

  // Available colors for selected product (with proper names, hex codes, and sibling variants)
  const availableProductColors = useMemo(() => {
    if (!selectedProduct) return [{ name: 'MALIVE', hex: '#9333EA' }];
    const list: { name: string; hex: string }[] = [];
    const seen = new Set<string>();

    const addColor = (rawName?: string | number, hex?: string) => {
      if (rawName === undefined || rawName === null) return;
      const strRaw = String(rawName).trim();
      if (!strRaw) return;

      let name = strRaw;
      let colorHex = hex;

      // 1. Resolve numeric IDs to genuine color names (e.g. 9 -> MALIVE, 1 -> BLACK)
      if (COLOR_CODE_MAP[strRaw]) {
        name = COLOR_CODE_MAP[strRaw].name;
        if (!colorHex) colorHex = COLOR_CODE_MAP[strRaw].hex;
      } else if (!isNaN(Number(strRaw)) && COLOR_REGISTRY[Number(strRaw)]) {
        name = COLOR_REGISTRY[Number(strRaw)].name.toUpperCase();
        if (!colorHex) colorHex = COLOR_REGISTRY[Number(strRaw)].hex;
      }

      // 2. Prevent purely numeric strings from ever being displayed as a color name
      if (/^\d+$/.test(name)) {
        name = selectedProduct.category === 'Women' ? 'MALIVE' : 'BLACK';
        if (!colorHex) colorHex = selectedProduct.category === 'Women' ? '#9333EA' : '#18181B';
      }

      const key = name.toUpperCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        if (!colorHex) {
          colorHex = getHexFromColorName(key);
        }
        list.push({ name: key, hex: colorHex });
      }
    };

    // A. Custom Color Map on product
    if (selectedProduct.customColorMap) {
      Object.entries(selectedProduct.customColorMap).forEach(([cName, cDef]) => {
        addColor(cDef.name || cName, cDef.hex);
      });
    }

    // B. Explicit colorName & colorHex
    if (selectedProduct.colorName) addColor(selectedProduct.colorName, selectedProduct.colorHex);
    if ((selectedProduct as any).color) addColor((selectedProduct as any).color);

    // C. Colors array
    if (Array.isArray(selectedProduct.colors)) {
      selectedProduct.colors.forEach((c: any) => addColor(c));
    }
    if (Array.isArray((selectedProduct as any).colorNames)) {
      (selectedProduct as any).colorNames.forEach((cn: any) => addColor(cn));
    }

    // D. Colors from sizeColorStock
    if (selectedProduct.sizeColorStock) {
      Object.values(selectedProduct.sizeColorStock).forEach((szMap: any) => {
        if (szMap && typeof szMap === 'object') {
          Object.keys(szMap).forEach(cKey => addColor(cKey));
        }
      });
    }

    // E. Sibling variants with same article code
    const currentCode = (selectedProduct.articleCode || selectedProduct.rawArticleCode || '').toLowerCase().trim();
    if (currentCode) {
      products.forEach(p => {
        const pCode = (p.articleCode || p.rawArticleCode || '').toLowerCase().trim();
        if (pCode === currentCode && p.id !== selectedProduct.id) {
          if (p.customColorMap) {
            Object.entries(p.customColorMap).forEach(([cName, cDef]) => addColor(cDef.name || cName, cDef.hex));
          }
          if (p.colorName) addColor(p.colorName, p.colorHex);
          if ((p as any).color) addColor((p as any).color);
          if (Array.isArray(p.colors)) p.colors.forEach((c: any) => addColor(c));
        }
      });
    }

    // F. User custom added colors in this session
    if (customColorsByProduct[selectedProduct.id]) {
      customColorsByProduct[selectedProduct.id].forEach(c => addColor(c.name, c.hex));
    }

    // G. Embedded colors in title or description
    const textToCheck = `${selectedProduct.name} ${selectedProduct.description || ''}`.toUpperCase();
    const commonFootwearColors = [
      'MALIVE', 'PURPLE', 'LAVENDER', 'BLACK', 'BROWN', 'TAN', 'CHERRY', 'NAVY', 
      'WHITE', 'GREY', 'RED', 'BLUE', 'OLIVE', 'GREEN', 'MAROON', 'BEIGE', 'PINK'
    ];
    commonFootwearColors.forEach(cw => {
      if (new RegExp(`\\b${cw}\\b`).test(textToCheck)) {
        addColor(cw);
      }
    });

    // H. If fewer than 2 colors found, provide standard popular category color variants
    if (list.length < 2) {
      if (selectedProduct.category === 'Women') {
        ['MALIVE', 'BLACK', 'CHERRY', 'TAN'].forEach(c => addColor(c));
      } else {
        ['BLACK', 'BROWN', 'TAN', 'NAVY'].forEach(c => addColor(c));
      }
    }

    return list;
  }, [selectedProduct, products, customColorsByProduct]);

  // Handler to add custom color for this article
  const handleAddCustomColor = async () => {
    if (!newColorInput.trim() || !selectedProduct) return;
    const raw = newColorInput.trim().toUpperCase();
    const hex = getHexFromColorName(raw);

    setCustomColorsByProduct(prev => ({
      ...prev,
      [selectedProduct.id]: [...(prev[selectedProduct.id] || []), { name: raw, hex }]
    }));

    setSelectedColor(raw);
    setNewColorInput('');
    setShowAddColorInput(false);

    try {
      const existingMap = selectedProduct.customColorMap || {};
      const updatedMap = {
        ...existingMap,
        [raw]: {
          name: raw,
          hex,
          textClass: 'text-white',
          bgClass: 'bg-zinc-800',
          borderClass: 'border-zinc-700',
          badgeClass: 'bg-zinc-800 text-white'
        }
      };
      await onUpdateProduct(selectedProduct.id, {
        customColorMap: updatedMap
      });
    } catch (e) {}
  };

  // Handler to add a manual custom size and optionally allot it permanently to this article
  const handleAddManualSize = async () => {
    if (!manualSizeInput.trim() || !selectedProduct) return;
    const sz = manualSizeInput.trim();

    // Select the size and give it a default quantity
    setSelectedSizes(prev => (prev.includes(sz) ? prev : [...prev, sz]));
    setSizeQuantities(prev => ({ ...prev, [sz]: prev[sz] || 1 }));

    // If user selected to allot permanently to this article
    if (allotNewSizePermanently) {
      const numericSize = parseFloat(sz);
      const existingSizes = (selectedProduct.sizes || []).map(Number).filter(n => !isNaN(n));
      if (!isNaN(numericSize) && !existingSizes.includes(numericSize)) {
        const updatedSizes = [...existingSizes, numericSize].sort((a, b) => a - b);
        try {
          await onUpdateProduct(selectedProduct.id, {
            sizes: updatedSizes
          });
          // Mutate local reference so allotted list reflects immediately
          selectedProduct.sizes = updatedSizes;
          setStockSuccessMsg(`Size ${sz} allotted permanently to ${selectedProduct.articleCode || selectedProduct.name}!`);
          setTimeout(() => setStockSuccessMsg(null), 3500);
        } catch (e) {
          console.error(e);
        }
      }
    }

    setManualSizeInput('');
  };

  // Helper to get color hex
  const getColorHex = (colorName: string): string => {
    if (!colorName) return '#92400E';
    const found = availableProductColors.find(c => c.name.toUpperCase() === colorName.toUpperCase());
    if (found) return found.hex;
    const lk = colorName.toLowerCase();
    if (lk.includes('brown') || lk.includes('tan')) return '#92400E';
    if (lk.includes('black')) return '#18181B';
    if (lk.includes('purple') || lk.includes('malive')) return '#9333EA';
    if (lk.includes('cherry') || lk.includes('red')) return '#DC2626';
    if (lk.includes('blue') || lk.includes('navy')) return '#2563EB';
    if (lk.includes('white')) return '#E2E8F0';
    return '#92400E';
  };

  // Active Color Hex calculation
  const activeColorHex = useMemo(() => {
    return getColorHex(selectedColor);
  }, [selectedColor, availableProductColors]);

  // When selected product changes, reset size and color defaults
  useEffect(() => {
    if (selectedProduct) {
      const sizes = allottedSizes.length > 0 ? allottedSizes.map(String) : ['6', '7', '8', '9', '10'];
      const initialSize = sizes[0] || '6';
      setSelectedSize(initialSize);
      // Pre-select only the single starting size, user can select any other sizes manually
      setSelectedSizes([initialSize]);

      // Initialize quantity for the starting size
      const qtyMap: Record<string, number> = {};
      qtyMap[initialSize] = 1;
      setSizeQuantities(qtyMap);

      if (availableProductColors.length > 0) {
        setSelectedColor(availableProductColors[0].name);
      } else {
        setSelectedColor(selectedProduct.category === 'Women' ? 'MALIVE' : 'BROWN');
      }

      const estCost = Math.round((selectedProduct.price || 0) * 0.65);
      setInwardCostPrice(estCost || 250);
    } else {
      setSelectedSize('');
      setSelectedSizes([]);
      setSelectedColor('');
      setSizeQuantities({});
      setInwardCostPrice(0);
    }
  }, [selectedProduct, allottedSizes, availableProductColors]);

  // Toggle multiple product sizes selection
  const handleToggleSize = (sz: string | number) => {
    const s = String(sz);
    setSelectedSizes(prev => {
      if (prev.includes(s)) {
        const next = prev.filter(x => x !== s);
        if (next.length > 0) {
          setSelectedSize(next[0]);
        } else {
          setSelectedSize('');
        }
        return next;
      } else {
        const next = [...prev, s];
        setSelectedSize(s);
        setSizeQuantities(q => ({
          ...q,
          [s]: q[s] || 1
        }));
        return next;
      }
    });
  };

  // Select all allotted sizes at once
  const handleSelectAllAllottedSizes = () => {
    const all = (allottedSizes.length > 0 ? allottedSizes : ['6', '7', '8', '9', '10']).map(String);
    setSelectedSizes(all);
    if (all.length > 0) setSelectedSize(all[0]);
    setSizeQuantities(q => {
      const next = { ...q };
      all.forEach(s => {
        if (!next[s]) next[s] = 1;
      });
      return next;
    });
  };

  // Clear size selection
  const handleClearSelectedSizes = () => {
    setSelectedSizes([]);
    setSelectedSize('');
  };

  // Grouped Inward Articles for clear display in the Stock Invoice
  interface GroupedInwardArticle {
    groupKey: string;
    productId: string;
    productName: string;
    articleCode: string;
    brand: string;
    imageUrl?: string;
    color: string;
    items: InwardStockItem[];
    totalQuantity: number;
  }

  const groupedInwardArticles = useMemo<GroupedInwardArticle[]>(() => {
    const groups: Record<string, GroupedInwardArticle> = {};
    inwardItems.forEach(item => {
      const key = `${item.productId}__${item.color || 'Standard'}`;
      if (!groups[key]) {
        groups[key] = {
          groupKey: key,
          productId: item.productId,
          productName: item.productName,
          articleCode: item.articleCode,
          brand: item.brand,
          imageUrl: item.imageUrl,
          color: item.color || 'Standard',
          items: [],
          totalQuantity: 0
        };
      }
      groups[key].items.push(item);
      groups[key].totalQuantity += item.quantity;
    });
    return Object.values(groups);
  }, [inwardItems]);

  // Adjust quantity of a specific size in the added stock invoice
  const handleUpdateInwardItemQty = (itemId: string, delta: number) => {
    setInwardItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  // Remove a specific size of an article from the added stock invoice
  const handleRemoveInwardItemById = (itemId: string) => {
    setInwardItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Remove an entire footwear article from the added stock invoice
  const handleRemoveArticleGroup = (groupKey: string) => {
    setInwardItems(prev => prev.filter(item => `${item.productId}__${item.color || 'Standard'}` !== groupKey));
  };

  // Total units and unique items in active draft invoice
  const currentInvoiceUnits = useMemo(() => {
    const activeUnits = selectedProduct && selectedSizes.length > 0
      ? selectedSizes.reduce((sum, sz) => sum + (sizeQuantities[sz] || inwardQuantity || 1), 0)
      : 0;
    const queuedUnits = inwardItems.reduce((sum, it) => sum + it.quantity, 0);
    return activeUnits + queuedUnits;
  }, [selectedProduct, selectedSizes, sizeQuantities, inwardQuantity, inwardItems]);

  const currentInvoiceUniqueItems = useMemo(() => {
    const activeCount = selectedProduct && selectedSizes.length > 0 ? selectedSizes.length : 0;
    return activeCount + inwardItems.length;
  }, [selectedProduct, selectedSizes, inwardItems]);

  const currentInvoiceArticleCount = useMemo(() => {
    const setOfArticles = new Set<string>();
    inwardItems.forEach(it => setOfArticles.add(it.productId));
    if (selectedProduct && selectedSizes.length > 0) {
      setOfArticles.add(selectedProduct.id);
    }
    return setOfArticles.size;
  }, [inwardItems, selectedProduct, selectedSizes]);

  // Extract unique brands
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach(p => {
      if (p.brand) brands.add(p.brand);
      else brands.add('Walkaroo');
    });
    return ['All', ...Array.from(brands).sort()];
  }, [products]);

  // Filtered styles for the Select Footwear Style dropdown in Card 1
  const selectableProducts = useMemo(() => {
    const q = styleSearch.toLowerCase().trim();
    if (!q) return products;
    return products.filter(p => {
      const code = (p.articleCode || p.rawArticleCode || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      const brand = (p.brand || 'walkaroo').toLowerCase();
      return code.includes(q) || name.includes(q) || brand.includes(q) || p.id.toLowerCase().includes(q);
    });
  }, [products, styleSearch]);

  // Inventory Totals
  const inventoryStats = useMemo(() => {
    let totalPairs = 0;
    let totalValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach(p => {
      const stock = Number(p.stock) || (p.sizeStock ? Object.values(p.sizeStock).reduce((s, v) => s + (Number(v) || 0), 0) : 0);
      totalPairs += stock;
      totalValuation += stock * (p.price || 0);

      if (stock === 0) {
        outOfStockCount++;
      } else if (stock > 0 && stock < 15) {
        lowStockCount++;
      }
    });

    return {
      totalPairs,
      totalValuation,
      lowStockCount,
      outOfStockCount,
      totalArticles: products.length
    };
  }, [products]);

  // Filtered Products for Inventory Database Tab
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

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesBrand = selectedBrand === 'All' || pBrand.toLowerCase() === selectedBrand.toLowerCase();

      const pType = (p.subCategory || '').toLowerCase();
      const pName = p.name.toLowerCase();
      const matchesType = selectedSubCategory === 'All' || 
        pType === selectedSubCategory.toLowerCase() || 
        pName.includes(selectedSubCategory.toLowerCase());

      const stock = Number(p.stock) || (p.sizeStock ? Object.values(p.sizeStock).reduce((s, v) => s + (Number(v) || 0), 0) : 0);
      let matchesStockLevel = true;
      if (stockLevelFilter === 'low') matchesStockLevel = stock > 0 && stock < 15;
      else if (stockLevelFilter === 'out') matchesStockLevel = stock === 0;
      else if (stockLevelFilter === 'healthy') matchesStockLevel = stock >= 15;

      return matchesSearch && matchesCategory && matchesBrand && matchesType && matchesStockLevel;
    });
  }, [products, searchQuery, selectedCategory, selectedBrand, selectedSubCategory, stockLevelFilter]);

  // Add Item(s) to Draft Stock Invoice (Supports multiple selected sizes)
  const handleAddItemToInvoice = () => {
    if (!selectedProduct) {
      alert('Please select a footwear style first.');
      return;
    }

    const sizesToInward = selectedSizes.length > 0 
      ? selectedSizes 
      : (selectedSize ? [String(selectedSize)] : (allottedSizes.length > 0 ? [String(allottedSizes[0])] : ['7']));

    if (sizesToInward.length === 0) {
      alert('Please select at least one shoe size.');
      return;
    }

    const timestamp = Date.now();
    let totalAddedUnits = 0;
    const newItems: InwardStockItem[] = sizesToInward.map((sz, idx) => {
      const qty = sizeQuantities[sz] || inwardQuantity || 1;
      totalAddedUnits += qty;
      return {
        id: `${selectedProduct.id}-${sz}-${selectedColor || 'Standard'}-${timestamp}-${idx}`,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        articleCode: selectedProduct.articleCode || selectedProduct.rawArticleCode || selectedProduct.id,
        brand: selectedProduct.brand || 'Walkaroo',
        imageUrl: selectedProduct.imageUrl || (selectedProduct.imageUrls && selectedProduct.imageUrls[0]),
        category: selectedProduct.category,
        size: sz,
        color: selectedColor || 'Standard',
        quantity: qty,
        costPrice: inwardCostPrice || Math.round((selectedProduct.price || 300) * 0.65)
      };
    });

    setInwardItems(prev => [...prev, ...newItems]);

    // Clear active product selection on left so user can pick the next footwear article
    setSelectedProductId('');
    setSelectedSizes([]);
    setSizeQuantities({});
    setInwardQuantity(1);

    setStockSuccessMsg(
      sizesToInward.length === 1
        ? `Added ${selectedProduct.name} (Size ${sizesToInward[0]} • ${totalAddedUnits} pairs) to Stock Invoice!`
        : `Added ${selectedProduct.name} (${sizesToInward.length} sizes • ${totalAddedUnits} pairs) to Stock Invoice!`
    );
    setTimeout(() => setStockSuccessMsg(null), 3500);
  };

  // Remove Item from Draft Stock Invoice
  const handleRemoveInvoiceItem = (index: number) => {
    setInwardItems(prev => prev.filter((_, i) => i !== index));
  };

  // Confirm and Inward Stock to Inventory
  const handleConfirmInwardStock = async () => {
    // Collect active items from current selection if any
    const activeSelectedItems: InwardStockItem[] = (selectedProduct && selectedSizes.length > 0)
      ? selectedSizes.map((sz, idx) => ({
          id: `${selectedProduct.id}-${sz}-${selectedColor || 'Standard'}-${Date.now()}-${idx}`,
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          articleCode: selectedProduct.articleCode || selectedProduct.rawArticleCode || selectedProduct.id,
          brand: selectedProduct.brand || 'Walkaroo',
          imageUrl: selectedProduct.imageUrl || (selectedProduct.imageUrls && selectedProduct.imageUrls[0]),
          category: selectedProduct.category,
          size: sz,
          color: selectedColor || 'Standard',
          quantity: sizeQuantities[sz] || inwardQuantity || 1,
          costPrice: inwardCostPrice || Math.round((selectedProduct.price || 300) * 0.65)
        }))
      : [];

    const allItemsToCommit = [...inwardItems, ...activeSelectedItems];

    if (allItemsToCommit.length === 0) {
      alert('Please select a footwear style and size before confirming stock import.');
      return;
    }
    setIsSubmittingInward(true);

    try {
      // Group quantities by product ID
      const productUpdatesMap: Record<string, { sizeDeltas: Record<string, number>; totalAdded: number }> = {};

      allItemsToCommit.forEach(item => {
        if (!productUpdatesMap[item.productId]) {
          productUpdatesMap[item.productId] = { sizeDeltas: {}, totalAdded: 0 };
        }
        const szKey = String(item.size);
        productUpdatesMap[item.productId].sizeDeltas[szKey] = (productUpdatesMap[item.productId].sizeDeltas[szKey] || 0) + item.quantity;
        productUpdatesMap[item.productId].totalAdded += item.quantity;
      });

      // Update each product in database
      for (const [prodId, data] of Object.entries(productUpdatesMap)) {
        const prod = products.find(p => p.id === prodId);
        if (!prod) continue;

        const currentSizeStock = { ...(prod.sizeStock || {}) };
        Object.entries(data.sizeDeltas).forEach(([sz, delta]) => {
          currentSizeStock[sz] = (currentSizeStock[sz] || 0) + delta;
        });

        const newTotalStock = Object.values(currentSizeStock).reduce((sum, v) => sum + (Number(v) || 0), 0);

        await onUpdateProduct(prodId, {
          sizeStock: currentSizeStock,
          stock: newTotalStock,
          updatedAt: new Date().toISOString(),
          lastStockAddedAt: new Date().toISOString()
        });
      }

      // Record in stock ledgers if available
      const totalPairsInwarded = allItemsToCommit.reduce((sum, it) => sum + it.quantity, 0);
      const totalCostValue = allItemsToCommit.reduce((sum, it) => sum + (it.quantity * it.costPrice), 0);

      // Save operatorName to operatorHistory list (only real operator names used from now on)
      if (operatorName.trim()) {
        try {
          const key = 'prashant_operators_from_now';
          const existing: string[] = JSON.parse(localStorage.getItem(key) || '[]');
          const nextList = Array.from(new Set([operatorName.trim(), ...existing]));
          localStorage.setItem(key, JSON.stringify(nextList));
          setOperatorHistory(nextList);
        } catch (e) {}
      }

      const assignedInvoiceRef = invoiceRefNumber || getNextInvoiceReference();
      const effectiveSupplier = operatorName.trim() || supplierName || 'Warehouse Incharge';

      if (onCreateStockLedger) {
        await onCreateStockLedger({
          items: allItemsToCommit.map(it => ({
            productId: it.productId,
            name: it.productName,
            productName: it.productName,
            articleCode: it.articleCode,
            brand: it.brand,
            size: String(it.size),
            color: it.color,
            colorId: 1,
            quantity: it.quantity,
            purchaseRate: it.costPrice,
            mrp: it.costPrice
          })),
          totalUnits: totalPairsInwarded,
          status: 'completed',
          supplier: effectiveSupplier,
          operator: operatorName.trim() || undefined,
          operatorMobile: operatorName.trim() || undefined,
          reference: assignedInvoiceRef,
          notes: challanNumber.trim()
            ? `Stock Inwarded via Stock Manager (${totalPairsInwarded} pairs) • Purchase Inv: ${challanNumber.trim()}`
            : `Stock Inwarded via Stock Manager (${totalPairsInwarded} pairs)`
        });
      }

      // Also store to local stock ledger history fallback
      try {
        const historyKey = 'prashant_added_stock_history';
        const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
        const uniqueKey = `local-${assignedInvoiceRef}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const newRecord = {
          uniqueKey,
          id: assignedInvoiceRef,
          reference: assignedInvoiceRef,
          purchaseInvoiceRef: challanNumber.trim() || undefined,
          date: new Date().toISOString(),
          operator: operatorName.trim() || 'Staff Incharge',
          supplier: effectiveSupplier,
          totalPairs: totalPairsInwarded,
          totalCost: totalCostValue,
          itemsCount: allItemsToCommit.length,
          items: allItemsToCommit
        };
        const updatedList = [newRecord, ...existing];
        localStorage.setItem(historyKey, JSON.stringify(updatedList));
        setLocalHistoryRecords(updatedList);
      } catch (e) {}

      // Reset form & generate next reference like Add-26091802
      setInwardItems([]);
      setSelectedProductId('');
      setSelectedSizes([]);
      setSizeQuantities({});
      setChallanNumber('');
      const nextRef = getNextInvoiceReference();
      setInvoiceRefNumber(nextRef);
      setStockSuccessMsg(`Successfully inwarded ${totalPairsInwarded} units to inventory for Invoice ${assignedInvoiceRef}!`);
      setTimeout(() => setStockSuccessMsg(null), 4000);
    } catch (e) {
      console.error(e);
      alert('Error updating stock. Please check connection and try again.');
    } finally {
      setIsSubmittingInward(false);
    }
  };

  // Quick Stock Adjust Modal Handlers
  const handleOpenStockEditor = (product: Product) => {
    setEditingStockProduct(product);
    const initialMap: Record<string, number> = {};
    (product.sizes || [6, 7, 8, 9, 10]).forEach(sz => {
      initialMap[String(sz)] = product.sizeStock?.[String(sz)] || 0;
    });
    setEditedSizeStock(initialMap);
  };

  const handleSaveStock = async () => {
    if (!editingStockProduct) return;
    setIsSavingStock(true);
    try {
      const totalNewStock = Object.values(editedSizeStock).reduce((sum, v) => sum + Math.max(0, Number(v) || 0), 0);
      const res = await onUpdateProduct(editingStockProduct.id, {
        sizeStock: editedSizeStock,
        stock: totalNewStock,
        updatedAt: new Date().toISOString(),
        lastStockAddedAt: new Date().toISOString()
      });

      if (res.success) {
        setStockSuccessMsg(`Stock updated for ${editingStockProduct.name} (${totalNewStock} pairs)!`);
        setTimeout(() => setStockSuccessMsg(null), 3500);
        setEditingStockProduct(null);
      } else {
        alert(res.error || 'Failed to update stock');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating stock');
    } finally {
      setIsSavingStock(false);
    }
  };

  // Queue product from database into Add Stock form
  const handleQueueFromDatabase = (product: Product, size?: string | number) => {
    setSelectedProductId(product.id);
    if (size) {
      setSelectedSize(size);
      setSelectedSizes([String(size)]);
    } else if (product.sizes && product.sizes.length > 0) {
      setSelectedSizes([String(product.sizes[0])]);
    }
    setActiveStockTab('add_stock');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Local storage history records
  const [localHistoryRecords, setLocalHistoryRecords] = useState<any[]>(() => {
    try {
      const historyKey = 'prashant_added_stock_history';
      const stored = localStorage.getItem(historyKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map((rec: any, idx: number) => ({
            ...rec,
            uniqueKey: rec.uniqueKey || `local-${rec.id || 'INW'}-${rec.date || ''}-${idx}`
          }));
        }
      }
    } catch (e) {}
    return [];
  });

  // Re-sync local storage records when switching to history tab
  useEffect(() => {
    if (activeStockTab === 'history') {
      try {
        const historyKey = 'prashant_added_stock_history';
        const stored = localStorage.getItem(historyKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setLocalHistoryRecords(parsed.map((rec: any, idx: number) => ({
              ...rec,
              uniqueKey: rec.uniqueKey || `local-${rec.id || 'INW'}-${rec.date || ''}-${idx}`
            })));
          }
        }
      } catch (e) {}
    }
  }, [activeStockTab]);

  return (
    <div id="stock-management-section" className="w-full max-w-xl sm:max-w-2xl lg:max-w-4xl mx-auto pb-20 px-3 sm:px-4 space-y-4 sm:space-y-5 animate-fade-in font-sans">
      
      {/* Toast Notification */}
      {stockSuccessMsg && (
        <div className="fixed top-20 right-4 sm:right-6 z-[100] animate-bounce px-4 py-3 rounded-2xl bg-emerald-600 text-white font-mono text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-400">
          <CheckCircle2 size={16} />
          <span>{stockSuccessMsg}</span>
        </div>
      )}

      {/* 1. Top Navigation: BACK TO HOME button */}
      <div className="pt-2">
        <button
          type="button"
          id="btn-stock-back-home"
          onClick={() => {
            if (onBackToHome) onBackToHome();
            else window.history.back();
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-sans font-black uppercase tracking-wider shadow-2xs active:scale-95 transition-all cursor-pointer ${
            isDark 
              ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800' 
              : 'bg-white border-[#E8DEC7] text-[#141311] hover:bg-zinc-50'
          }`}
        >
          <ArrowLeft size={16} className="stroke-[2.5]" />
          <span>BACK TO HOME</span>
        </button>
      </div>

      {/* 2. Header Title: STOCK & INVENTORY MANAGEMENT */}
      <div className="flex items-center gap-3 pt-2">
        <div className="w-10 h-10 rounded-xl bg-amber-100/70 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/80 flex items-center justify-center shrink-0 text-[#FFA000]">
          <Package size={22} className="stroke-[2.2]" />
        </div>
        <div>
          <h1 className="font-sans font-black text-xl sm:text-2xl uppercase tracking-tight text-[#141311] dark:text-white leading-[1.1]">
            STOCK & INVENTORY<br />MANAGEMENT
          </h1>
        </div>
      </div>

      {/* 3. Action Button: + ADD NEW PRODUCT */}
      <button
        type="button"
        id="btn-stock-add-new-product"
        onClick={() => {
          if (onAddNewProduct) {
            onAddNewProduct();
          } else if (onOpenAddInvoice) {
            onOpenAddInvoice();
          }
        }}
        className="w-full py-3.5 px-4 rounded-2xl bg-[#FFA000] hover:bg-[#ff9500] text-[#141311] font-sans font-black text-xs sm:text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
      >
        <Plus size={18} className="stroke-[3]" />
        <span>ADD NEW PRODUCT</span>
      </button>

      {/* 4. Subtle Horizontal Divider */}
      <div className="border-t border-[#E8DEC7] dark:border-zinc-800 my-1" />

      {/* 5. Segmented Tab Bar matching Reference Image: ADD STOCK | INVENTORY DATABASE | ADDED STOCK HISTORY */}
      <div className={`p-1.5 rounded-2xl border grid grid-cols-3 gap-1.5 shadow-2xs ${
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-[#F2ECE1] border-[#E2D8C3]'
      }`}>
        <button
          type="button"
          id="tab-add-stock"
          onClick={() => setActiveStockTab('add_stock')}
          className={`py-3 px-2 rounded-xl text-xs font-sans font-black uppercase tracking-tight flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeStockTab === 'add_stock'
              ? 'bg-white dark:bg-zinc-800 text-[#141311] dark:text-white shadow-xs border border-[#E8DEC7] dark:border-zinc-700'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
          }`}
        >
          <Receipt size={15} className={activeStockTab === 'add_stock' ? 'text-[#FFA000]' : 'text-zinc-400'} />
          <span className="text-[11px] sm:text-xs text-center leading-tight">ADD STOCK</span>
        </button>

        <button
          type="button"
          id="tab-inventory-database"
          onClick={() => setActiveStockTab('database')}
          className={`py-3 px-2 rounded-xl text-xs font-sans font-black uppercase tracking-tight flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeStockTab === 'database'
              ? 'bg-white dark:bg-zinc-800 text-[#141311] dark:text-white shadow-xs border border-[#E8DEC7] dark:border-zinc-700'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
          }`}
        >
          <Database size={15} className={activeStockTab === 'database' ? 'text-[#FFA000]' : 'text-zinc-400'} />
          <span className="text-[11px] sm:text-xs text-center leading-tight">INVENTORY DATABASE</span>
        </button>

        <button
          type="button"
          id="tab-stock-history"
          onClick={() => setActiveStockTab('history')}
          className={`py-3 px-2 rounded-xl text-xs font-sans font-black uppercase tracking-tight flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeStockTab === 'history'
              ? 'bg-white dark:bg-zinc-800 text-[#141311] dark:text-white shadow-xs border border-[#E8DEC7] dark:border-zinc-700'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
          }`}
        >
          <Layers size={15} className={activeStockTab === 'history' ? 'text-[#FFA000]' : 'text-zinc-400'} />
          <span className="text-[11px] sm:text-xs text-center leading-tight">ADDED STOCK HISTORY</span>
        </button>
      </div>

      {/* =========================================================================
          VIEW 1: ADD STOCK (The exact view from the user's reference image)
         ========================================================================= */}
      {activeStockTab === 'add_stock' && (
        <div className="space-y-4 sm:space-y-5 animate-fade-in">
          
          {/* CARD 1: ADD A STOCK LIST */}
          <div className={`rounded-[32px] border p-5 sm:p-6 shadow-xs space-y-4 ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-[#E8DEC7]'
          }`}>
            
            {/* Header */}
            <div className="flex items-center gap-2">
              <PlusCircle size={18} className="text-[#FFA000] shrink-0 stroke-[2.5]" />
              <h2 className="font-sans font-black text-sm sm:text-base uppercase tracking-wider text-[#141311] dark:text-white">
                ADD A STOCK LIST
              </h2>
            </div>

            {/* Label: SELECT FOOTWEAR STYLE */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                  SELECT FOOTWEAR STYLE
                </label>
                {styleSearch && (
                  <span className="text-[10px] font-mono text-[#FFA000] font-bold">
                    {selectableProducts.length} matching {selectableProducts.length === 1 ? 'article' : 'articles'}
                  </span>
                )}
              </div>

              {/* Input 1: Search Input with Live Suggestions */}
              <div ref={searchContainerRef} className="relative">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    id="input-search-article-number"
                    value={styleSearch}
                    onFocus={() => {
                      if (styleSearch.trim().length > 0) {
                        setShowSearchSuggestions(true);
                      }
                    }}
                    onChange={(e) => {
                      setStyleSearch(e.target.value);
                      setShowSearchSuggestions(true);
                    }}
                    placeholder="Search Article Number..."
                    className={`w-full pl-10 pr-16 py-3 rounded-2xl text-xs font-mono border outline-none transition-all ${
                      isDark 
                        ? 'bg-zinc-950 border-zinc-700 text-white focus:border-[#FFA000]' 
                        : 'bg-white border-[#E2D8C3] text-zinc-900 focus:border-[#FFA000]'
                    }`}
                  />
                  {styleSearch && (
                    <button
                      type="button"
                      id="btn-clear-article-search"
                      onClick={() => {
                        setStyleSearch('');
                        setSelectedProductId('');
                        setShowSearchSuggestions(false);
                      }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer transition-colors"
                      title="Clear search"
                    >
                      CLEAR
                    </button>
                  )}
                </div>

                {/* Live Auto-Suggest Articles matching the Search Query */}
                {showSearchSuggestions && styleSearch.trim().length > 0 && (
                  <div className={`absolute left-0 right-0 top-full mt-1.5 z-40 rounded-2xl border p-2.5 space-y-1.5 shadow-xl transition-all ${
                    isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#E8DEC7]'
                  }`}>
                    <div className="flex items-center justify-between px-1.5 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="text-[10px] font-sans font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                        <Sparkles size={12} className="text-[#FFA000]" />
                        <span>Suggested Articles ({selectableProducts.length})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSearchSuggestions(false)}
                        className="text-[10px] font-mono text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        ✕ Close
                      </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-1.5 pr-0.5">
                      {selectableProducts.length === 0 ? (
                        <div className="py-4 text-center text-xs text-zinc-400 italic">
                          No footwear articles found matching "{styleSearch}".
                        </div>
                      ) : (
                        selectableProducts.map((p) => {
                          const code = p.articleCode || p.rawArticleCode || p.id;
                          const brand = p.brand || 'Walkaroo';
                          const totalStock = Number(p.stock) || (p.sizeStock ? Object.values(p.sizeStock).reduce((s, v) => s + (Number(v) || 0), 0) : 0);
                          const isCurrentlySelected = p.id === selectedProductId;

                          return (
                            <div
                              key={`suggest-${p.id}`}
                              onClick={() => {
                                setSelectedProductId(p.id);
                                setStyleSearch(code);
                                setShowSearchSuggestions(false);
                                setIsStyleDropdownOpen(false);
                              }}
                              className={`p-2 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                                isCurrentlySelected
                                  ? 'border-[#FFA000] bg-amber-500/10 dark:bg-amber-500/15'
                                  : isDark
                                  ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-zinc-200'
                                  : 'bg-white border-zinc-200/90 hover:border-[#FFA000]/60 hover:bg-amber-50/40 text-zinc-800'
                              }`}
                            >
                              <div className="w-11 h-11 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-1 flex items-center justify-center shrink-0 relative overflow-hidden shadow-2xs">
                                {p.imageUrl ? (
                                  <img
                                    src={p.imageUrl}
                                    alt={p.name}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <Package size={18} className="text-zinc-300 dark:text-zinc-600" />
                                )}
                                <div className="absolute top-0 right-0 px-1 py-0.2 bg-rose-600 text-white text-[7px] font-black uppercase rounded-bl tracking-tighter">
                                  {brand.slice(0, 5)}
                                </div>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-mono font-black text-xs text-[#4F46E5] dark:text-indigo-400">
                                    #{code}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[9px] font-sans font-bold text-zinc-600 dark:text-zinc-300 uppercase">
                                    {brand}
                                  </span>
                                  <span className="text-[9px] font-sans text-zinc-400">
                                    • {p.category || 'Footwear'}
                                  </span>
                                </div>
                                <div className="font-sans font-bold text-xs text-[#141311] dark:text-white truncate mt-0.5">
                                  {p.name}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono">
                                  <span className={`font-bold ${totalStock > 0 ? 'text-[#00875A] dark:text-emerald-400' : 'text-rose-500'}`}>
                                    Stock: {totalStock} Pairs
                                  </span>
                                  <span className="text-zinc-300 dark:text-zinc-600">•</span>
                                  <span className="font-bold text-zinc-700 dark:text-zinc-300">
                                    ₹{p.price}
                                  </span>
                                </div>
                              </div>

                              <div className="shrink-0 pl-1">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-sans font-bold uppercase transition-all ${
                                  isCurrentlySelected
                                    ? 'bg-[#FFA000] text-[#141311]'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-[#FFA000] hover:text-[#141311]'
                                }`}>
                                  {isCurrentlySelected ? 'Selected' : 'Select'}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Input 2: Dropdown Selector with Small Footwear Thumbnails */}
              <div ref={styleDropdownRef} className="mt-2.5 relative">
                <button
                  type="button"
                  id="btn-choose-footwear-style"
                  onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
                  className={`w-full p-2.5 sm:p-3 pr-10 rounded-2xl text-xs font-sans font-bold border outline-none text-left flex items-center gap-3 transition-all cursor-pointer ${
                    isStyleDropdownOpen || selectedProduct
                      ? 'border-[#FFA000] ring-1 ring-[#FFA000]/30' 
                      : 'border-[#E2D8C3] hover:border-[#FFA000]'
                  } ${
                    isDark ? 'bg-zinc-950 text-zinc-200' : 'bg-white text-zinc-800'
                  }`}
                >
                  {selectedProduct ? (
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                        {selectedProduct.imageUrl ? (
                          <img
                            src={selectedProduct.imageUrl}
                            alt={selectedProduct.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Package size={16} className="text-zinc-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-mono font-black text-xs text-[#4F46E5] dark:text-indigo-400 mr-1.5">
                          #{selectedProduct.articleCode || selectedProduct.rawArticleCode || selectedProduct.id}
                        </span>
                        <span className="font-sans font-bold text-xs text-[#141311] dark:text-white truncate">
                          {selectedProduct.name}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-zinc-500 dark:text-zinc-400 font-sans font-bold text-xs py-1">
                      -- Choose Footwear Style / Article --
                    </span>
                  )}
                  <ChevronDown
                    size={18}
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 transition-transform duration-200 ${
                      isStyleDropdownOpen ? 'rotate-180 text-[#FFA000]' : ''
                    }`}
                  />
                </button>

                {/* Footwear Styles Dropdown Menu with Small Thumbnails */}
                {isStyleDropdownOpen && (
                  <div className={`absolute left-0 right-0 top-full mt-1.5 z-40 rounded-2xl border p-2 shadow-2xl transition-all ${
                    isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#E8DEC7]'
                  }`}>
                    <div className="flex items-center justify-between px-2 py-1 border-b border-zinc-100 dark:border-zinc-800 mb-1.5">
                      <span className="text-[10px] font-sans font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Select Footwear Style ({selectableProducts.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsStyleDropdownOpen(false)}
                        className="text-[10px] font-mono text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        ✕ Close
                      </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-1 pr-0.5">
                      {selectableProducts.map((p) => {
                        const code = p.articleCode || p.rawArticleCode || p.id;
                        const brand = p.brand || 'Walkaroo';
                        const totalStock = Number(p.stock) || (p.sizeStock ? Object.values(p.sizeStock).reduce((s, v) => s + (Number(v) || 0), 0) : 0);
                        const isSelected = p.id === selectedProductId;

                        return (
                          <div
                            key={`dropdown-style-${p.id}`}
                            onClick={() => {
                              setSelectedProductId(p.id);
                              setStyleSearch(code);
                              setIsStyleDropdownOpen(false);
                              setShowSearchSuggestions(false);
                            }}
                            className={`p-2 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#FFA000] bg-amber-500/10 dark:bg-amber-500/15'
                                : isDark
                                ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-zinc-200'
                                : 'bg-white border-zinc-200/80 hover:border-[#FFA000]/60 hover:bg-amber-50/40 text-zinc-800'
                            }`}
                          >
                            {/* Small Thumbnail with Brand Badge */}
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-0.5 flex items-center justify-center shrink-0 relative overflow-hidden shadow-2xs">
                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <Package size={16} className="text-zinc-300 dark:text-zinc-600" />
                              )}
                              <div className="absolute top-0 right-0 px-1 py-0.2 bg-rose-600 text-white text-[6.5px] font-black uppercase rounded-bl tracking-tighter">
                                {brand.slice(0, 5)}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono font-black text-xs text-[#4F46E5] dark:text-indigo-400">
                                  #{code}
                                </span>
                                <span className="px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-[8.5px] font-sans font-bold text-zinc-600 dark:text-zinc-300 uppercase">
                                  {brand}
                                </span>
                                <span className="text-[8.5px] font-sans text-zinc-400">
                                  • {p.category || 'Footwear'}
                                </span>
                              </div>
                              <div className="font-sans font-bold text-xs text-[#141311] dark:text-white truncate mt-0.5">
                                {p.name}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono">
                                <span className={`font-bold ${totalStock > 0 ? 'text-[#00875A] dark:text-emerald-400' : 'text-rose-500'}`}>
                                  Stock: {totalStock} Pairs
                                </span>
                                <span className="text-zinc-300 dark:text-zinc-600">•</span>
                                <span className="font-bold text-zinc-700 dark:text-zinc-300">
                                  MRP ₹{p.price}
                                </span>
                              </div>
                            </div>

                            {/* Select indicator */}
                            <div className="shrink-0 pl-1">
                              {isSelected ? (
                                <span className="px-2 py-0.5 rounded-md bg-[#FFA000] text-[#141311] text-[9.5px] font-sans font-black uppercase">
                                  Selected
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[9.5px] font-sans font-bold uppercase hover:bg-[#FFA000] hover:text-[#141311]">
                                  Choose
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Showing X of Y styles found */}
              <div className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 pt-1.5 pl-0.5">
                Showing {selectableProducts.length} of {products.length} styles found.
              </div>

              {/* =========================================================================
                  SELECTED PRODUCT PREVIEW CARD (Matches User Reference Image Exactly)
                 ========================================================================= */}
              {!selectedProduct ? (
                <p className="text-xs text-zinc-400 italic mt-3 pl-1">
                  Please choose or search an article above to inward stock...
                </p>
              ) : (
                <div className="space-y-4 pt-3">
                  
                  {/* Article Card with Thumbnail & Tags matching image */}
                  <div className={`rounded-3xl border p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 transition-all shadow-2xs ${
                    isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-white border-[#E8DEC7]'
                  }`}>
                    {/* Left: Thumbnail Box with border & brand sticker */}
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-2 flex items-center justify-center shrink-0 relative overflow-hidden shadow-2xs">
                      {selectedProduct.imageUrl ? (
                        <img
                          src={selectedProduct.imageUrl}
                          alt={selectedProduct.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Package size={32} className="text-zinc-300 dark:text-zinc-600" />
                      )}
                      <div className="absolute top-1 right-2 font-sans italic font-black text-[10px] text-rose-600 select-none tracking-tight">
                        {selectedProduct.brand || 'Walkaroo'}
                      </div>
                    </div>

                    {/* Right: Product Details & Badges */}
                    <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
                      <h3 className="font-sans font-black text-sm sm:text-base uppercase tracking-tight text-[#141311] dark:text-white leading-snug">
                        {selectedProduct.name}
                      </h3>
                      
                      <div className="font-sans font-black text-xs uppercase tracking-wider text-[#FFA000] dark:text-amber-400">
                        ARTICLE CODE: {selectedProduct.articleCode || selectedProduct.rawArticleCode || selectedProduct.id}
                      </div>

                      {/* Tag badges stacked/wrapped */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF7F0] dark:bg-zinc-800 border border-[#E8DEC7] dark:border-zinc-700 text-xs font-sans font-bold text-zinc-700 dark:text-zinc-300">
                          <span>📁</span>
                          <span>{selectedProduct.category || 'Women'} / {selectedProduct.subCategory || 'Sandals'}</span>
                        </span>
                        
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF7F0] dark:bg-zinc-800 border border-[#E8DEC7] dark:border-zinc-700 text-xs font-sans font-bold text-zinc-700 dark:text-zinc-300">
                          <span>🏷️</span>
                          <span>{selectedProduct.brand || 'Walkaroo'}</span>
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF7F0] dark:bg-zinc-800 border border-[#E8DEC7] dark:border-zinc-700 text-xs font-sans font-bold text-zinc-700 dark:text-zinc-300">
                          <span>📦</span>
                          <span>Stock: {Number(selectedProduct.stock) || (selectedProduct.sizeStock ? Object.values(selectedProduct.sizeStock).reduce((s, v) => s + (Number(v) || 0), 0) : 0)} Units</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SELECT COLOR OPTION */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                        SELECT COLOR OPTION
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAddColorInput(!showAddColorInput)}
                        className="text-[10px] font-sans font-bold text-[#D97706] dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Plus size={12} />
                        <span>{showAddColorInput ? 'Cancel' : '+ Add / Other Color'}</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {availableProductColors.map((col) => {
                        const isSel = selectedColor.toUpperCase() === col.name.toUpperCase();
                        return (
                          <button
                            key={col.name}
                            type="button"
                            onClick={() => setSelectedColor(col.name)}
                            className={`py-2 px-4 rounded-xl border-2 flex items-center gap-2.5 transition-all cursor-pointer font-sans font-black text-xs uppercase tracking-wider ${
                              isSel
                                ? 'border-[#FFA000] bg-[#FFF8E7] dark:bg-amber-950/40 text-[#9A6700] dark:text-amber-300 shadow-2xs ring-1 ring-[#FFA000]/30'
                                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: col.hex }}
                            />
                            <span>{col.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {showAddColorInput && (
                      <div className="p-3 rounded-xl border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={newColorInput}
                          onChange={(e) => setNewColorInput(e.target.value)}
                          placeholder="e.g. Cherry, Peach, Beige, Malive"
                          className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-sans uppercase outline-none focus:border-[#FFA000] flex-1 text-zinc-900 dark:text-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomColor();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomColor}
                          disabled={!newColorInput.trim()}
                          className="px-3 py-1.5 rounded-lg bg-[#FFA000] hover:bg-[#E68A00] text-[#141311] font-sans font-bold text-xs uppercase disabled:opacity-50 cursor-pointer"
                        >
                          Add Color
                        </button>
                      </div>
                    )}
                  </div>

                  {/* SELECT SHOE SIZE (Supports multi-size selection like reference image) */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-sans font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400 block">
                          SELECT SHOE SIZE
                        </label>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[10.5px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
                          {allottedSizes.length} Allotted
                        </span>
                      </div>

                      {/* Quick actions without extra summary text */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAllAllottedSizes}
                          className="px-2.5 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[11px] font-sans font-bold text-zinc-700 dark:text-zinc-300 hover:bg-[#FFA000] hover:text-black transition-colors cursor-pointer"
                        >
                          Select All
                        </button>
                        {selectedSizes.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearSelectedSizes}
                            className="px-2.5 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[11px] font-sans font-bold text-zinc-500 hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* + + Add / Show Other Sizes button */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setShowOtherSizes(!showOtherSizes)}
                        className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 font-sans font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <span className="text-zinc-400 font-mono">+ +</span>
                        <span>{showOtherSizes ? 'Hide Other Sizes' : 'Add / Show Other Sizes'}</span>
                      </button>
                    </div>

                    {/* Sub-label with green dot */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        ALLOTTED PRODUCT SIZES (REGISTERED)
                      </span>
                    </div>

                    {/* Size Cards matching reference image exactly */}
                    <div className="flex flex-wrap gap-2.5">
                      {allottedSizes.map((sz) => {
                        const isSel = selectedSizes.includes(String(sz));
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleToggleSize(sz)}
                            className={`w-15 h-16 sm:w-16 sm:h-17 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xs select-none active:scale-95 ${
                              isSel
                                ? 'border-[#FFA000] bg-[#FEF9EE] dark:bg-amber-950/40 ring-1 ring-[#FFA000]/40'
                                : 'border-[#334155] dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-[#FFA000]'
                            }`}
                          >
                            <span className={`font-sans font-black text-lg sm:text-xl leading-none ${
                              isSel ? 'text-[#B45309] dark:text-amber-300' : 'text-[#1E293B] dark:text-zinc-100'
                            }`}>
                              {sz}
                            </span>
                            <span className="text-[9px] font-sans font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-1">
                              ALLOTTED
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Expanded Extra Sizes & Manual Custom Size Allotment */}
                    {showOtherSizes && (
                      <div className="p-3.5 sm:p-4 rounded-2xl border border-dashed border-amber-300 dark:border-amber-700/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-3.5 mt-2">
                        {/* 1. Unallotted Standard UK Sizes */}
                        <div>
                          <span className="text-[10.5px] font-sans font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 block mb-1.5">
                            Additional Standard UK Sizes (Click to toggle):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {['1', '2', '3', '4', '5', '10', '11', '12', '13'].filter(s => !allottedSizes.includes(s)).map((sz) => {
                              const isSel = selectedSizes.includes(String(sz));
                              return (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => handleToggleSize(sz)}
                                  className={`w-13 h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                                    isSel
                                      ? 'border-[#FFA000] bg-[#FEF9EE] dark:bg-amber-950/60 text-[#B45309] dark:text-amber-300 font-black shadow-2xs'
                                      : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                                  }`}
                                >
                                  <span className="font-sans font-black text-sm leading-none">{sz}</span>
                                  <span className="text-[8px] font-mono text-zinc-400 mt-0.5">EXTRA</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 2. Add Custom Size Manually Form */}
                        <div className="pt-2 border-t border-dashed border-amber-200 dark:border-amber-800/60 space-y-2">
                          <label className="text-[10.5px] font-sans font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block">
                            Add Custom Size Manually:
                          </label>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <input
                              type="text"
                              value={manualSizeInput}
                              onChange={(e) => setManualSizeInput(e.target.value)}
                              placeholder="e.g. 5, 11, 12, or 4.5"
                              className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono font-bold text-zinc-900 dark:text-white outline-none focus:border-[#FFA000] w-full sm:w-48"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddManualSize();
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleAddManualSize}
                              disabled={!manualSizeInput.trim()}
                              className="px-4 py-2 rounded-xl bg-[#FFA000] hover:bg-[#E68A00] text-[#141311] font-sans font-black text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer transition-all shrink-0 shadow-2xs"
                            >
                              + Add & Select Size
                            </button>
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer pt-0.5 select-none">
                            <input
                              type="checkbox"
                              checked={allotNewSizePermanently}
                              onChange={(e) => setAllotNewSizePermanently(e.target.checked)}
                              className="w-4 h-4 rounded text-[#FFA000] focus:ring-[#FFA000] accent-[#FFA000] cursor-pointer"
                            />
                            <span className="text-xs font-sans text-zinc-600 dark:text-zinc-300">
                              Also allot this size permanently for article ({selectedProduct.articleCode || selectedProduct.rawArticleCode || selectedProduct.name})
                            </span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* INWARD QUANTITY & ADD ITEM matching Reference Image */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                        INWARD QUANTITY
                      </label>
                      <span className="text-[10.5px] font-mono text-zinc-400">
                        Rate: ₹{inwardCostPrice || Math.round((selectedProduct.price || 300) * 0.65)} / pair
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quantity Stepper */}
                      <div className={`flex items-center rounded-2xl border overflow-hidden shadow-2xs h-12 ${
                        isDark ? 'bg-zinc-950 border-zinc-700' : 'bg-white border-[#E2D8C3]'
                      }`}>
                        <button
                          type="button"
                          onClick={() => setInwardQuantity(prev => Math.max(1, prev - 1))}
                          className="w-11 h-full flex items-center justify-center font-black text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-colors cursor-pointer text-lg"
                          title="Decrease quantity"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={inwardQuantity}
                          onChange={(e) => setInwardQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-14 text-center font-mono font-black text-base outline-none bg-transparent text-[#141311] dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setInwardQuantity(prev => prev + 1)}
                          className="w-11 h-full flex items-center justify-center font-black text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-colors cursor-pointer text-lg"
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* ADD ITEM Button */}
                      <button
                        type="button"
                        id="btn-add-item-to-stock-invoice"
                        onClick={handleAddItemToInvoice}
                        disabled={!selectedProduct || selectedSizes.length === 0}
                        className={`flex-1 h-12 px-6 rounded-2xl font-sans font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs ${
                          selectedProduct && selectedSizes.length > 0
                            ? 'bg-[#FFA000] hover:bg-[#ff9500] text-[#141311] cursor-pointer active:scale-98'
                            : 'bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-400 cursor-not-allowed'
                        }`}
                      >
                        <PlusCircle size={18} className={selectedProduct && selectedSizes.length > 0 ? 'stroke-[2.5]' : 'stroke-[2] text-zinc-400'} />
                        <span>
                          ADD TO STOCK INVOICE {selectedSizes.length > 0 ? `(${selectedSizes.length} SIZES • ${selectedSizes.reduce((s, sz) => s + (sizeQuantities[sz] || inwardQuantity || 1), 0)} PAIRS)` : ''}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CARD 2: ADD A STOCK INVOICE (Matching User Reference Image) */}
          <div className={`rounded-[32px] border border-t-4 border-t-[#FFA000] p-5 sm:p-6 shadow-xs space-y-4 ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-[#E8DEC7]'
          }`}>
            
            {/* Top Bar: INWARD GOODS RECEIPT & STATUS */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-sans font-black text-[#FFA000] uppercase tracking-[0.15em] block">
                    INWARD GOODS RECEIPT
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#FFA000]/15 border border-[#FFA000]/40 font-mono font-black text-[11px] text-[#D97706] dark:text-[#FFA000] tracking-wider">
                    {invoiceRefNumber}
                  </span>
                </div>
                <h2 className="font-sans font-black text-base sm:text-xl uppercase text-[#141311] dark:text-white mt-0.5 tracking-tight">
                  ADD A STOCK INVOICE
                </h2>
              </div>

              <div className="text-right">
                <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                  STATUS
                </span>
                <span className={`inline-flex items-center gap-1.5 mt-1 px-3 py-0.5 rounded-full font-mono font-black text-[10.5px] uppercase tracking-wider ${
                  currentInvoiceUnits > 0
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
                    : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${currentInvoiceUnits > 0 ? 'bg-[#D97706] animate-pulse' : 'bg-zinc-400'}`} />
                  {currentInvoiceUnits > 0 ? `IN-PROGRESS (${currentInvoiceUnits} PAIRS)` : 'EMPTY'}
                </span>
              </div>
            </div>

            {/* Dashed Separator Line */}
            <div className="border-t border-dashed border-zinc-300 dark:border-zinc-700 my-2" />

            {/* Content: Empty State or Active Articles List */}
            {groupedInwardArticles.length === 0 && (!selectedProduct || selectedSizes.length === 0) ? (
              /* EMPTY STATE */
              <div className="py-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mx-auto text-zinc-400">
                  <Receipt size={28} className="stroke-[1.8]" />
                </div>

                <h3 className="font-sans font-black text-sm sm:text-base uppercase tracking-wider text-[#141311] dark:text-white">
                  STOCK LIST IS EMPTY
                </h3>

                <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-sm mx-auto italic leading-relaxed">
                  Select a footwear article and choose shoe sizes in the left panel to add them to this stock invoice.
                </p>
              </div>
            ) : (
              /* ACTIVE GOODS RECEIPT INTERFACE (Matching Reference Image) */
              <div className="space-y-4 pt-1">
                
                {/* 1. COMMITTED ARTICLES IN DRAFT INVOICE (All added articles and their sizes clearly shown) */}
                {groupedInwardArticles.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-sans font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        ADDED ARTICLES ({groupedInwardArticles.length} ARTICLE{groupedInwardArticles.length > 1 ? 'S' : ''})
                      </span>
                      <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {inwardItems.reduce((s, it) => s + it.quantity, 0)} Total Pairs
                      </span>
                    </div>

                    {groupedInwardArticles.map((group, gIdx) => {
                      const articleColorHex = getColorHex(group.color);
                      return (
                        <div
                          key={`inward-group-${group.groupKey}`}
                          className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-3.5 sm:p-4 space-y-3.5 shadow-2xs"
                        >
                          {/* Top Row: Article Number + Thumbnail + Title/Code + Total Pairs + Delete */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {/* Thumbnail with brand watermark */}
                              <div className="w-14 h-14 rounded-2xl bg-[#F8F9FA] dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-750 p-1 flex items-center justify-center shrink-0 relative overflow-hidden shadow-2xs">
                                {group.imageUrl ? (
                                  <img
                                    src={group.imageUrl}
                                    alt={group.productName}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <Package size={22} className="text-zinc-300 dark:text-zinc-600" />
                                )}
                                <div className="absolute top-0.5 right-1 font-sans italic font-black text-[7px] text-rose-600 select-none tracking-tight">
                                  {group.brand || 'Walkaroo'}
                                </div>
                              </div>

                              {/* Title & Article Code */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono font-black text-[9.5px] text-zinc-600 dark:text-zinc-300 uppercase">
                                    ARTICLE #{gIdx + 1}
                                  </span>
                                </div>
                                <h3 className="font-sans font-black text-sm sm:text-base text-zinc-900 dark:text-white leading-tight truncate">
                                  {group.productName}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  <span className="text-[11px] font-sans font-black text-[#D97706] dark:text-amber-400 uppercase tracking-wide">
                                    ARTICLE:
                                  </span>
                                  <span className="text-[11.5px] font-mono font-black text-[#D97706] dark:text-amber-400">
                                    {group.articleCode}
                                  </span>
                                  <span className="text-zinc-300 dark:text-zinc-600 text-xs">•</span>
                                  <span className="text-xs font-sans font-medium text-zinc-600 dark:text-zinc-300">
                                    {group.brand || 'Walkaroo'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: +X Units Pill + Delete Article button */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="px-3 py-1 rounded-xl bg-[#ECFDF5] dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 font-mono font-black text-xs sm:text-sm shadow-2xs">
                                +{group.totalQuantity} Pairs
                              </span>

                              <button
                                type="button"
                                onClick={() => handleRemoveArticleGroup(group.groupKey)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                                title="Remove this entire article from invoice"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>

                          {/* Inner Container: Color Row & Size Breakdown */}
                          <div className="rounded-2xl border border-[#E8DEC7] dark:border-zinc-750 bg-[#FAF7F0] dark:bg-zinc-950/50 p-3 sm:p-4 space-y-2.5">
                            {/* Color Header */}
                            <div className="flex items-center justify-between pb-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-2xs"
                                  style={{ backgroundColor: articleColorHex }}
                                />
                                <span className="font-sans font-black text-xs uppercase tracking-wide text-zinc-800 dark:text-zinc-200">
                                  Color: {group.color}
                                </span>
                              </div>
                              <span className="font-mono font-bold text-xs text-zinc-500 dark:text-zinc-400">
                                {group.items.length} Size{group.items.length > 1 ? 's' : ''} ({group.totalQuantity} pairs)
                              </span>
                            </div>

                            {/* Size Rows Clearly Shown */}
                            <div className="space-y-2">
                              {group.items.map((it) => (
                                <div
                                  key={`inward-item-${it.id}`}
                                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-750 bg-white dark:bg-zinc-900 shadow-2xs transition-all"
                                >
                                  {/* Left: Size Label clearly displayed */}
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-black text-xs sm:text-sm text-[#A855F7] dark:text-purple-400">
                                      {formatSizeLabel(it.size)}
                                    </span>
                                    <span className="text-[11px] font-sans font-medium text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                                      (Size {it.size})
                                    </span>
                                  </div>

                                  {/* Right: Quantity controls + Remove */}
                                  <div className="flex items-center gap-2 sm:gap-2.5">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateInwardItemQty(it.id, -1)}
                                      className="w-7 h-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center font-mono font-black text-zinc-700 dark:text-zinc-200 text-sm active:scale-90 transition-all cursor-pointer"
                                      title="Decrease quantity"
                                    >
                                      -
                                    </button>

                                    <span className="font-mono font-black text-sm sm:text-base text-emerald-700 dark:text-emerald-400 min-w-8 text-center">
                                      {it.quantity}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() => handleUpdateInwardItemQty(it.id, 1)}
                                      className="w-7 h-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center font-mono font-black text-zinc-700 dark:text-zinc-200 text-sm active:scale-90 transition-all cursor-pointer"
                                      title="Increase quantity"
                                    >
                                      +
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleRemoveInwardItemById(it.id)}
                                      className="w-7 h-7 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 hover:text-rose-500 flex items-center justify-center font-mono font-bold text-base active:scale-90 transition-all cursor-pointer ml-1"
                                      title="Remove this size from invoice"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. ARTICLE CURRENTLY SELECTED ON LEFT (Draft in progress or ready to add) */}
                {selectedProduct && selectedSizes.length > 0 && (
                  <div className="rounded-3xl border-2 border-dashed border-[#FFA000]/60 bg-[#FFFDF5] dark:bg-amber-950/20 p-3.5 sm:p-4 space-y-3.5 shadow-2xs">
                    {/* Header: Currently Selected / Staged */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-950 border border-amber-200 dark:border-amber-800/60 p-1 flex items-center justify-center shrink-0 relative overflow-hidden shadow-2xs">
                          {selectedProduct.imageUrl ? (
                            <img
                              src={selectedProduct.imageUrl}
                              alt={selectedProduct.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Package size={22} className="text-zinc-300 dark:text-zinc-600" />
                          )}
                          <div className="absolute top-0.5 right-1 font-sans italic font-black text-[7px] text-rose-600 select-none tracking-tight">
                            {selectedProduct.brand || 'Walkaroo'}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700 font-mono font-black text-[9.5px] text-amber-800 dark:text-amber-300 uppercase">
                              {groupedInwardArticles.length > 0 ? 'NEXT ARTICLE BEING ADDED' : 'ARTICLE (DRAFT CONFIGURATION)'}
                            </span>
                          </div>
                          <h3 className="font-sans font-black text-sm sm:text-base text-zinc-900 dark:text-white leading-tight truncate">
                            {selectedProduct.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-[11px] font-sans font-black text-[#D97706] dark:text-amber-400 uppercase tracking-wide">
                              ARTICLE:
                            </span>
                            <span className="text-[11.5px] font-mono font-black text-[#D97706] dark:text-amber-400">
                              {selectedProduct.articleCode || selectedProduct.rawArticleCode || selectedProduct.id}
                            </span>
                            <span className="text-zinc-300 dark:text-zinc-600 text-xs">•</span>
                            <span className="text-xs font-sans font-medium text-zinc-600 dark:text-zinc-300">
                              {selectedProduct.brand || 'Walkaroo'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Units Pill + Deselect */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 font-mono font-black text-xs sm:text-sm shadow-2xs">
                          +{selectedSizes.reduce((sum, sz) => sum + (sizeQuantities[sz] || inwardQuantity || 1), 0)} Pairs
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProductId('');
                            setSelectedSizes([]);
                            setSizeQuantities({});
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                          title="Deselect article"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Sizes Breakdown */}
                    <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-zinc-950/50 p-3 sm:p-4 space-y-2.5">
                      <div className="flex items-center justify-between pb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-2xs"
                            style={{ backgroundColor: activeColorHex }}
                          />
                          <span className="font-sans font-black text-xs uppercase tracking-wide text-zinc-800 dark:text-zinc-200">
                            Color: {selectedColor || 'Standard'}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-xs text-zinc-500 dark:text-zinc-400">
                          {selectedSizes.length} Size{selectedSizes.length > 1 ? 's' : ''} Selected
                        </span>
                      </div>

                      <div className="space-y-2">
                        {selectedSizes.map((sz) => {
                          const qty = sizeQuantities[sz] || inwardQuantity || 1;
                          return (
                            <div
                              key={`staged-size-${sz}`}
                              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-amber-200/80 dark:border-zinc-750 bg-white dark:bg-zinc-900 shadow-2xs transition-all"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-xs sm:text-sm text-[#A855F7] dark:text-purple-400">
                                  {formatSizeLabel(sz)}
                                </span>
                                <span className="text-[11px] font-sans font-medium text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                                  (Size {sz})
                                </span>
                              </div>

                              <div className="flex items-center gap-2 sm:gap-2.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSizeQuantities(prev => ({
                                      ...prev,
                                      [sz]: Math.max(1, (prev[sz] || inwardQuantity || 1) - 1)
                                    }));
                                  }}
                                  className="w-7 h-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center font-mono font-black text-zinc-700 dark:text-zinc-200 text-sm active:scale-90 transition-all cursor-pointer"
                                  title="Decrease quantity"
                                >
                                  -
                                </button>

                                <span className="font-mono font-black text-sm sm:text-base text-emerald-700 dark:text-emerald-400 min-w-8 text-center">
                                  {qty}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSizeQuantities(prev => ({
                                      ...prev,
                                      [sz]: (prev[sz] || inwardQuantity || 1) + 1
                                    }));
                                  }}
                                  className="w-7 h-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center font-mono font-black text-zinc-700 dark:text-zinc-200 text-sm active:scale-90 transition-all cursor-pointer"
                                  title="Increase quantity"
                                >
                                  +
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSizes(prev => prev.filter(s => s !== sz));
                                  }}
                                  className="w-7 h-7 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 hover:text-rose-500 flex items-center justify-center font-mono font-bold text-base active:scale-90 transition-all cursor-pointer ml-1"
                                  title="Remove this size"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Button to add this article into the list */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleAddItemToInvoice}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#FFA000] hover:bg-[#ff9500] text-[#141311] font-sans font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all shadow-2xs"
                        >
                          <PlusCircle size={16} className="stroke-[2.5]" />
                          <span>Add Article & Sizes To Invoice List</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}


                {/* Dashed Separator Line */}
                <div className="border-t border-dashed border-zinc-300 dark:border-zinc-700 my-2" />

                {/* 2. OPERATOR NAME FIELD with Click-to-Suggest Dropdown (Only names from now) */}
                <div className="space-y-1.5" ref={operatorDropdownRef}>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-sans font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400 block">
                      OPERATOR NAME
                    </label>
                    {operatorHistory.length > 0 && (
                      <span className="text-[10px] font-mono text-zinc-400">
                        {operatorHistory.length} saved name{operatorHistory.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={operatorName}
                      onClick={() => setShowOperatorSuggestions(true)}
                      onFocus={() => setShowOperatorSuggestions(true)}
                      onChange={(e) => {
                        setOperatorName(e.target.value);
                        setShowOperatorSuggestions(true);
                      }}
                      placeholder="Enter operator or staff name (Click for saved suggestions)"
                      className={`w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-sans font-medium border outline-none transition-all ${
                        isDark
                          ? 'bg-zinc-950 border-zinc-700 text-white focus:border-[#FFA000]'
                          : 'bg-white border-[#E2D8C3] text-zinc-900 focus:border-[#FFA000]'
                      }`}
                    />

                    {/* Dropdown Suggestions List shown on click/focus */}
                    {showOperatorSuggestions && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-40 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden max-h-52 overflow-y-auto">
                        {operatorHistory.length > 0 ? (
                          <div className="py-1">
                            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                              Recent Operators (From Now)
                            </div>
                            {operatorHistory
                              .filter(name => !operatorName || name.toLowerCase().includes(operatorName.toLowerCase()))
                              .map((name) => (
                                <button
                                  key={`drop-${name}`}
                                  type="button"
                                  onClick={() => {
                                    setOperatorName(name);
                                    setShowOperatorSuggestions(false);
                                  }}
                                  className="w-full text-left px-4 py-2.5 hover:bg-[#FFF8E7] dark:hover:bg-amber-950/40 text-xs sm:text-sm font-sans font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between transition-colors cursor-pointer"
                                >
                                  <span>{name}</span>
                                  <span className="text-[10px] font-mono text-[#D97706] dark:text-amber-400">Select</span>
                                </button>
                              ))}
                          </div>
                        ) : (
                          <div className="p-3 text-center">
                            <p className="text-xs font-sans text-zinc-500 dark:text-zinc-400">
                              No previous operator suggestions yet.
                            </p>
                            <p className="text-[11px] font-sans text-zinc-400 mt-0.5">
                              Type a name here and it will be remembered for future entries.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. PURCHASE INVOICE REF (OPTIONAL, NO PRE-TEXT) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-sans font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400 block">
                      PURCHASE INVOICE REF <span className="text-[10px] font-normal text-zinc-400 font-mono">(OPTIONAL)</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={challanNumber}
                    onChange={(e) => setChallanNumber(e.target.value)}
                    placeholder="Enter purchase invoice or challan reference (Optional)"
                    className={`w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-sans font-medium border outline-none transition-all ${
                      isDark
                        ? 'bg-zinc-950 border-zinc-700 text-white focus:border-[#FFA000]'
                        : 'bg-white border-[#E2D8C3] text-zinc-900 focus:border-[#FFA000]'
                    }`}
                  />
                </div>

                {/* 4. TOTALS SUMMARY BOX */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-3 ${
                  isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-[#F8F9FA] border-zinc-200'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-[10.5px] font-sans font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        INVOICE REF:
                      </span>
                      <span className="font-mono font-black text-xs text-[#D97706] dark:text-[#FFA000]">
                        {invoiceRefNumber}
                      </span>
                    </div>
                    <span className="font-sans font-black text-sm sm:text-base text-zinc-900 dark:text-white block">
                      {currentInvoiceArticleCount} Unique Article{currentInvoiceArticleCount !== 1 ? 's' : ''} ({currentInvoiceUniqueItems} size lots)
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] sm:text-[10.5px] font-sans font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                      TOTAL UNITS TO IMPORT
                    </span>
                    <span className="font-mono font-black text-2xl sm:text-3xl text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                      {currentInvoiceUnits} Pairs
                    </span>
                  </div>
                </div>

                {/* 5. CONFIRM & IMPORT STOCK BUTTON */}
                <button
                  type="button"
                  id="btn-confirm-import-stock"
                  onClick={handleConfirmInwardStock}
                  disabled={isSubmittingInward || currentInvoiceUnits === 0}
                  className="w-full py-4 px-6 rounded-2xl bg-[#00875A] hover:bg-[#00744D] text-white font-sans font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md active:scale-[0.99] cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSubmittingInward ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={20} className="stroke-[2.5]" />
                  )}
                  <span>CONFIRM & IMPORT STOCK ({invoiceRefNumber})</span>
                </button>

              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: INVENTORY DATABASE (Matching user's reference image)
         ========================================================================= */}
      {activeStockTab === 'database' && (
        <div className="space-y-4">
          {/* Main Filter & Search Card - Streamlined & Compact */}
          <div className={`p-3 sm:p-4 rounded-2xl border shadow-2xs space-y-2.5 ${
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

            {/* Bottom: Quick Dropdowns (Brand & Type) + Reset */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#F0EBE0] dark:border-zinc-800">
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

              {/* Reset Filters button if any filter is active */}
              {(selectedBrand !== 'All' || selectedSubCategory !== 'All' || selectedCategory !== 'All' || searchQuery || stockLevelFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBrand('All');
                    setSelectedSubCategory('All');
                    setSelectedCategory('All');
                    setSearchQuery('');
                    setStockLevelFilter('all');
                  }}
                  className="ml-auto px-2.5 py-1.5 rounded-xl text-xs font-mono text-zinc-500 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={11} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Product Cards List (Exact Match to Reference Image) */}
          {filteredProducts.length === 0 ? (
            <div className={`text-center py-16 space-y-3 rounded-[32px] border p-8 ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-[#E8DEC7]'
            }`}>
              <Package size={32} className="mx-auto text-zinc-400" />
              <div className="font-sans font-bold text-sm text-zinc-700 dark:text-zinc-300">
                No shoe articles match the filter criteria.
              </div>
              <p className="text-xs font-mono text-zinc-500">
                Try clearing search terms or selecting "All Products" to view your entire inventory.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedBrand('All');
                  setSelectedSubCategory('All');
                  setStockLevelFilter('all');
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
                const totalStock = Number(product.stock) || (product.sizeStock ? Object.values(product.sizeStock).reduce((s, v) => s + (Number(v) || 0), 0) : 0);
                const colorHex = getProductColorHex(product);
                const isExpanded = !!expandedProductIds[product.id];
                const subCat = product.subCategory || (product.name.toLowerCase().includes('sandal') ? 'Sandals' : product.name.toLowerCase().includes('office') ? 'Office Wear' : product.name.toLowerCase().includes('slipper') ? 'Slippers' : 'Footwear');

                return (
                  <div
                    key={product.id}
                    id={`inventory-card-${product.id}`}
                    className={`rounded-[32px] border p-5 sm:p-6 shadow-xs space-y-3.5 transition-all ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-[#E8DEC7] text-zinc-900'
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
                          
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {(product.sizes || [6, 7, 8, 9, 10]).map(sz => {
                              const szQty = product.sizeStock?.[String(sz)] ?? 0;
                              return (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => handleQueueFromDatabase(product, sz)}
                                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center ${
                                    szQty > 0
                                      ? isDark ? 'bg-zinc-900 border-zinc-700 hover:border-[#FFA000]' : 'bg-white border-[#E8DEC7] hover:border-[#FFA000]'
                                      : 'bg-zinc-100/60 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 opacity-60'
                                  }`}
                                  title={`Click to queue Size ${sz} into Add Stock`}
                                >
                                  <span className="text-[10px] font-sans font-bold text-zinc-500">UK {sz}</span>
                                  <span className={`text-xs font-mono font-black ${szQty > 0 ? 'text-[#00875A] dark:text-emerald-400' : 'text-rose-500'}`}>
                                    {szQty} Units
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Quick Action buttons */}
                          <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => handleQueueFromDatabase(product)}
                              className="px-3 py-1.5 rounded-xl bg-[#FFA000]/20 hover:bg-[#FFA000]/30 text-amber-900 dark:text-[#FFA000] font-sans font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer transition-all"
                            >
                              <span>📋</span>
                              <span>Queue to Inward</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenStockEditor(product)}
                              className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-sans font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                            >
                              <Edit3 size={13} />
                              <span>Adjust Stock</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setBarcodeProduct(product)}
                              className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-sans font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                            >
                              <QrCode size={13} />
                              <span>Barcode</span>
                            </button>
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

      {/* =========================================================================
          VIEW 3: ADDED STOCK HISTORY (Past inward ledgers / purchase receipts)
         ========================================================================= */}
      {activeStockTab === 'history' && (
        <AddedStockHistoryView
          isDark={isDark}
          stockLedgers={stockLedgers}
          products={products}
          localHistoryRecords={localHistoryRecords}
          onOpenAddStock={() => {
            setActiveStockTab('add_stock');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* =========================================================================
          MODALS: QUICK ADJUST PER SIZE & BARCODE PREVIEW
         ========================================================================= */}
      
      {/* Quick Adjust Stock Modal */}
      {editingStockProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-3xl p-6 max-w-md w-full shadow-2xl relative flex flex-col ${
            isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-100' : 'bg-white border border-[#E8DEC7] text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FFA000]/15 text-[#FFA000]">
                  <Package size={18} />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase font-sans">{editingStockProduct.name}</h4>
                  <p className="text-[10px] font-mono text-zinc-500">
                    {editingStockProduct.brand} • {editingStockProduct.articleCode || editingStockProduct.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStockProduct(null)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs font-mono">
              <div className="text-[11px] font-black uppercase text-zinc-500">
                Adjust Quantities (Pairs per Size):
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(editingStockProduct.sizes || [6, 7, 8, 9, 10]).map(sz => {
                  const qty = editedSizeStock[String(sz)] ?? 0;
                  return (
                    <div 
                      key={sz}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 ${
                        isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="font-bold text-xs">Size {sz}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditedSizeStock(prev => ({ ...prev, [String(sz)]: Math.max(0, qty - 1) }))}
                          className="w-6 h-6 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold flex items-center justify-center cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-700"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={qty}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                            setEditedSizeStock(prev => ({ ...prev, [String(sz)]: val }));
                          }}
                          className={`w-10 text-center py-0.5 rounded border text-xs font-bold font-mono outline-none ${
                            isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-zinc-900'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setEditedSizeStock(prev => ({ ...prev, [String(sz)]: qty + 1 }))}
                          className="w-6 h-6 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold flex items-center justify-center cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Calculation */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between font-bold text-sm">
                <span>Calculated Total Pairs:</span>
                <span className="text-[#FFA000] font-mono text-base font-black">
                  {Object.values(editedSizeStock).reduce((s, v) => s + Math.max(0, Number(v) || 0), 0)} Pairs
                </span>
              </div>
            </div>

            <div className="pt-4 flex gap-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingStockProduct(null)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-500 font-bold text-xs uppercase cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStock}
                disabled={isSavingStock}
                className="flex-1 py-2.5 rounded-xl bg-[#FFA000] hover:bg-[#ff9500] text-[#141311] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSavingStock ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Check size={14} className="stroke-[3px]" />
                )}
                <span>Save Stock</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode / QR Preview Modal */}
      {barcodeProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 ${
            isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-100' : 'bg-white border border-slate-200 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-[#FFA000]/15 text-[#FFA000] flex items-center justify-center mx-auto">
              <QrCode size={24} />
            </div>
            <div>
              <h4 className="font-black text-base uppercase font-sans">{barcodeProduct.name}</h4>
              <p className="text-xs font-mono text-zinc-500">{barcodeProduct.brand} • ₹{barcodeProduct.price}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white text-black inline-block mx-auto border shadow-inner">
              <div className="font-mono text-lg font-black tracking-widest">
                |||| | ||||| || |||
              </div>
              <div className="text-[10px] font-mono font-bold mt-1">
                {barcodeProduct.articleCode || barcodeProduct.id}
              </div>
            </div>

            <p className="text-[11px] font-mono text-zinc-500">
              Scan with mobile camera or laser barcode scanner at the billing desk.
            </p>

            <button
              type="button"
              onClick={() => setBarcodeProduct(null)}
              className="w-full py-2.5 rounded-xl bg-[#FFA000] text-[#141311] font-bold text-xs uppercase cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
