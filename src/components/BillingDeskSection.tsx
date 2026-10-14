import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowLeft, RotateCcw, FileText, User, MessageSquare, 
  Zap, Search, ChevronDown, ChevronLeft, ChevronRight, Plus, Check, Printer, 
  X, ShoppingBag, Trash2, Smartphone, CreditCard, Coins, 
  RefreshCw, CheckCircle2, Barcode, ArrowUp, Package,
  Receipt, Send, Share2, Layers, Calendar, Filter
} from 'lucide-react';
import { Product, Order } from '../types';
import { 
  getColorDef, 
  getHexFromColorName, 
  getArticleSiblingProducts, 
  detectProductPrimaryColor 
} from '../utils/articleVariants';

export interface BillingDeskSectionProps {
  products: Product[];
  orders: Order[];
  isDark: boolean;
  onCreateOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<{ success: boolean; id?: string; error?: string }>;
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  onBackToHome?: () => void;
  onNavigate?: (tabId: string) => void;
}

export interface BillingCartItem {
  product: Product;
  size: number;
  color?: string;
  quantity: number;
  customPrice?: number;
}

// Helper to format invoice number strictly as PF-YYMMDDNN (e.g. PF-26091401)
// PF = Prashant Footwear General Invoice, YY = Year, MM = Month, DD = Date, NN = Today's invoice sequence
export const formatInvoiceNumber = (rawId?: string, createdAt?: string): string => {
  if (!rawId) {
    const d = createdAt ? new Date(createdAt) : new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `PF-${yy}${mm}${dd}01`;
  }
  const clean = rawId.replace(/^#/, '').trim();
  if (/^PF-\d{8}$/.test(clean)) {
    return clean;
  }
  if (clean.startsWith('PF-')) {
    const digits = clean.replace('PF-', '').replace(/\D/g, '');
    if (digits.length >= 8) {
      return `PF-${digits.slice(0, 8)}`;
    }
  }
  const d = createdAt ? new Date(createdAt) : new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const digits = clean.replace(/\D/g, '');
  const seq = digits.length >= 2 ? digits.slice(-2) : '01';
  return `PF-${yy}${mm}${dd}${seq}`;
};

export const BillingDeskSection: React.FC<BillingDeskSectionProps> = ({
  products = [],
  orders = [],
  isDark,
  onCreateOrder,
  onUpdateProduct,
  onBackToHome,
  onNavigate
}) => {
  // Customer inputs matching reference image
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');

  // Selected article & size inputs for the main billing card (Starts empty so user chooses freely)
  const [articleSearchQuery, setArticleSearchQuery] = useState('');
  const [isArticleDropdownOpen, setIsArticleDropdownOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<number>(0);
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
  const [priceInput, setPriceInput] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Cart / Draft Bill state
  const [currentTab, setCurrentTab] = useState<'article_entry' | 'draft_bill'>('article_entry');
  const [draftItems, setDraftItems] = useState<BillingCartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CASH + UPI'>('CASH');
  const [cashGiven, setCashGiven] = useState<number | ''>('');
  const [splitCashAmount, setSplitCashAmount] = useState<number | ''>('');
  const [splitUpiAmount, setSplitUpiAmount] = useState<number | ''>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Final bill state & inline payment option step
  const [isFinalBillModalOpen, setIsFinalBillModalOpen] = useState(false);
  const [isFinalInvoiceStep, setIsFinalInvoiceStep] = useState(false);

  // WhatsApp quick send in receipt
  const [receiptWhatsappInput, setReceiptWhatsappInput] = useState('');

  // Refund & Return desk toggle
  const [showRefundDesk, setShowRefundDesk] = useState(false);
  const [returnSearchQuery, setReturnSearchQuery] = useState('');
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState('Size mismatch / Fitting issue');

  // Fast POS modal
  const [isFastPosOpen, setIsFastPosOpen] = useState(false);
  const [fastBarcodeScan, setFastBarcodeScan] = useState('');

  // Checkout process & modal
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Generated Invoice History Logs filter: 'default' (always shows last 5 invoices by default) | 'today' | 'date'
  const [historyFilterMode, setHistoryFilterMode] = useState<'default' | 'today' | 'date'>('default');
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  // Calendar picker popover/toggle state
  const [isHistoryCalendarOpen, setIsHistoryCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(() => new Date());

  const articleDropdownRef = useRef<HTMLDivElement>(null);
  const sizeDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (articleDropdownRef.current && !articleDropdownRef.current.contains(e.target as Node)) {
        setIsArticleDropdownOpen(false);
      }
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(e.target as Node)) {
        setIsSizeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset payment step if all items are cleared from draft bill
  useEffect(() => {
    if (draftItems.length === 0) {
      setIsFinalInvoiceStep(false);
    }
  }, [draftItems.length]);

  // Recently selected article IDs (persisted to localStorage so last selected item is always suggested first)
  const [recentArticleIds, setRecentArticleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('prashant_last_selected_articles');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Filter products for article search and prioritize last selected items first
  const filteredProducts = useMemo(() => {
    const q = articleSearchQuery.toLowerCase().trim();
    let baseList = products;
    if (q) {
      baseList = products.filter(p => {
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchCode = (p.articleCode || '').toLowerCase().includes(q) || (p.rawArticleCode || '').toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
        const matchBrand = (p.brand || '').toLowerCase().includes(q);
        const matchBarcode = (p.barcode || '').toLowerCase().includes(q);
        return matchName || matchCode || matchBrand || matchBarcode;
      });
    }

    // Sort so that the last selected item (or recent items) appears first in the suggestion list!
    const sorted = [...baseList].sort((a, b) => {
      const aIdx = recentArticleIds.indexOf(a.id);
      const bIdx = recentArticleIds.indexOf(b.id);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return 0;
    });

    return sorted.slice(0, 25);
  }, [products, articleSearchQuery, recentArticleIds]);

  // When final bill modal opens, directly redirect/scroll to payment method selection as requested
  useEffect(() => {
    if (isFinalBillModalOpen) {
      const timer = setTimeout(() => {
        const el = document.getElementById('payment-method-selector');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isFinalBillModalOpen]);

  // When a product is selected
  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setArticleSearchQuery(prod.articleCode || prod.rawArticleCode || prod.id);
    setPriceInput(prod.price || '');
    
    // Track as last selected article (pushed to front)
    setRecentArticleIds(prev => {
      const updated = [prod.id, ...prev.filter(id => id !== prod.id)].slice(0, 15);
      try {
        localStorage.setItem('prashant_last_selected_articles', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Choose available size
    const availableSizes = (prod.sizes || [6, 7, 8, 9, 10]).filter(sz => {
      if (!prod.sizeStock) return true;
      return (prod.sizeStock[String(sz)] ?? 0) > 0;
    });

    if (availableSizes.length > 0) {
      setSelectedSize(availableSizes[0]);
    } else if (prod.sizes && prod.sizes.length > 0) {
      setSelectedSize(prod.sizes[0]);
    } else {
      setSelectedSize(6);
    }

    // Automatically select the 1st available color for this particular footwear article from inventory database
    let initialColor = '';
    if (prod.customColorMap && Object.keys(prod.customColorMap).length > 0) {
      initialColor = Object.values(prod.customColorMap)[0].name;
    } else if (prod.colorName && prod.colorName.trim()) {
      initialColor = prod.colorName.trim();
    } else if (prod.sizeColorStock && Object.keys(prod.sizeColorStock).length > 0) {
      for (const szMap of Object.values(prod.sizeColorStock)) {
        if (szMap && Object.keys(szMap).length > 0) {
          const firstKey = Object.keys(szMap)[0];
          const def = getColorDef(firstKey, prod);
          initialColor = def.name || firstKey;
          break;
        }
      }
    } else if (prod.colors && prod.colors.length > 0) {
      const def = getColorDef(prod.colors[0], prod);
      initialColor = def.name;
    } else {
      const primary = detectProductPrimaryColor(prod);
      initialColor = primary.name;
    }
    setSelectedColor(initialColor || 'Standard');

    setIsArticleDropdownOpen(false);
  };

  // Clear chosen article to choose another freely
  const handleClearArticle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProduct(null);
    setArticleSearchQuery('');
    setPriceInput('');
    setSelectedSize(0);
    setSelectedColor('');
    setIsArticleDropdownOpen(true);
  };

  // Helper to extract color name, hex and summary for any product strictly from inventory
  const getProductColorSummary = (p: Product) => {
    if (p.customColorMap && Object.keys(p.customColorMap).length > 0) {
      const names = Object.keys(p.customColorMap);
      const firstObj = Object.values(p.customColorMap)[0];
      return {
        label: names.slice(0, 3).join(' / ') + (names.length > 3 ? ` +${names.length - 3}` : ''),
        hex: firstObj.hex || '#7C4B27',
        totalColors: names.length
      };
    }
    if (p.colorName) {
      return {
        label: p.colorName,
        hex: p.colorHex || getHexFromColorName(p.colorName),
        totalColors: 1
      };
    }
    if (p.sizeColorStock && Object.keys(p.sizeColorStock).length > 0) {
      const uniqueColors = new Set<string>();
      Object.values(p.sizeColorStock).forEach(szMap => {
        if (szMap) Object.keys(szMap).forEach(k => uniqueColors.add(k));
      });
      if (uniqueColors.size > 0) {
        const arr = Array.from(uniqueColors);
        const firstDef = getColorDef(arr[0], p);
        return {
          label: arr.slice(0, 3).map(k => getColorDef(k, p).name).join(' / ') + (arr.length > 3 ? ` +${arr.length - 3}` : ''),
          hex: firstDef.hex || '#7C4B27',
          totalColors: arr.length
        };
      }
    }
    const detected = detectProductPrimaryColor(p);
    return {
      label: detected.name || 'Standard',
      hex: detected.hex || '#78716C',
      totalColors: 1
    };
  };

  // Selected product color summary
  const selectedProductColorSummary = useMemo(() => {
    if (!selectedProduct) return null;
    return getProductColorSummary(selectedProduct);
  }, [selectedProduct]);

  // Color options for the selected product strictly as per inventory database for this particular article
  const availableColors = useMemo(() => {
    if (!selectedProduct) return [];

    interface ArticleColorOption {
      name: string;
      hex: string;
      stock: number;
      stockInSize?: number;
      totalStock: number;
      isAvailable: boolean;
    }

    const result: ArticleColorOption[] = [];
    const seenNames = new Set<string>();

    const addColorOption = (rawName: string, hexCode?: string, explicitStock?: number) => {
      const cleanName = (rawName || '').trim();
      if (!cleanName) return;
      const lower = cleanName.toLowerCase();
      if (seenNames.has(lower)) return;
      seenNames.add(lower);

      const hex = hexCode || getHexFromColorName(cleanName);

      let stockInSelectedSize = 0;
      let totalStock = 0;

      if (selectedProduct.sizeColorStock && Object.keys(selectedProduct.sizeColorStock).length > 0) {
        if (selectedSize > 0) {
          const szMap = selectedProduct.sizeColorStock[String(selectedSize)];
          if (szMap) {
            stockInSelectedSize = Number(szMap[cleanName] ?? szMap[lower] ?? 0);
            if (stockInSelectedSize === 0) {
              const matchedKey = Object.keys(szMap).find(k => k.toLowerCase() === lower);
              if (matchedKey) stockInSelectedSize = Number(szMap[matchedKey]) || 0;
            }
          }
        }
        totalStock = Object.values(selectedProduct.sizeColorStock).reduce((sum, szMap) => {
          if (!szMap) return sum;
          let qty = Number(szMap[cleanName] ?? szMap[lower] ?? 0);
          if (qty === 0) {
            const matchedKey = Object.keys(szMap).find(k => k.toLowerCase() === lower);
            if (matchedKey) qty = Number(szMap[matchedKey]) || 0;
          }
          return sum + qty;
        }, 0);
      } else if (typeof explicitStock === 'number') {
        stockInSelectedSize = explicitStock;
        totalStock = explicitStock;
      } else {
        if (selectedSize > 0 && selectedProduct.sizeStock) {
          stockInSelectedSize = Number(selectedProduct.sizeStock[String(selectedSize)]) || 0;
        } else {
          stockInSelectedSize = selectedProduct.stock || 0;
        }
        totalStock = selectedProduct.stock || 0;
      }

      const displayStock = selectedSize > 0 ? stockInSelectedSize : totalStock;

      result.push({
        name: cleanName,
        hex,
        stock: displayStock,
        stockInSize: stockInSelectedSize,
        totalStock,
        isAvailable: displayStock > 0
      });
    };

    // 1. Custom color map on the product in inventory database
    if (selectedProduct.customColorMap && Object.keys(selectedProduct.customColorMap).length > 0) {
      Object.values(selectedProduct.customColorMap).forEach(c => {
        if (c && c.name) {
          addColorOption(c.name, c.hex);
        }
      });
    }

    // 2. Size-color stock (colors with quantities in inventory database)
    if (selectedProduct.sizeColorStock && Object.keys(selectedProduct.sizeColorStock).length > 0) {
      Object.values(selectedProduct.sizeColorStock).forEach(szMap => {
        if (szMap) {
          Object.keys(szMap).forEach(k => {
            const def = getColorDef(k, selectedProduct);
            addColorOption(def.name || k, def.hex);
          });
        }
      });
    }

    // 3. Registered colors array on product
    if (selectedProduct.colors && Array.isArray(selectedProduct.colors) && selectedProduct.colors.length > 0) {
      selectedProduct.colors.forEach(cid => {
        const def = getColorDef(cid, selectedProduct);
        addColorOption(def.name, def.hex);
      });
    }

    // 4. Sibling products in inventory database representing other color variants of this same article
    if (products && products.length > 0) {
      const siblings = getArticleSiblingProducts(selectedProduct, products);
      if (siblings.length > 1) {
        for (const sib of siblings) {
          if (sib.id === selectedProduct.id) continue;
          if (sib.customColorMap && Object.keys(sib.customColorMap).length > 0) {
            Object.values(sib.customColorMap).forEach(c => {
              if (c && c.name) addColorOption(c.name, c.hex);
            });
          } else if (sib.colorName) {
            addColorOption(sib.colorName, sib.colorHex || getHexFromColorName(sib.colorName), sib.stock);
          } else {
            const primary = detectProductPrimaryColor(sib);
            if (primary && primary.name && primary.name !== 'Standard') {
              addColorOption(primary.name, primary.hex, sib.stock);
            }
          }
        }
      }
    }

    // 5. Explicit colorName on the selected product
    if (selectedProduct.colorName && selectedProduct.colorName.trim()) {
      addColorOption(selectedProduct.colorName, selectedProduct.colorHex);
    }

    // 6. If no explicit multi-color registry exists for this article, use its verified primary color
    if (result.length === 0) {
      const primary = detectProductPrimaryColor(selectedProduct);
      addColorOption(primary.name, primary.hex, selectedProduct.stock);
    }

    return result;
  }, [selectedProduct, products, selectedSize]);

  // Ensure an available color from inventory is automatically selected whenever an article or size is chosen
  useEffect(() => {
    if (selectedProduct && availableColors.length > 0) {
      const match = availableColors.find(c => c.name.toLowerCase() === (selectedColor || '').toLowerCase());
      if (!match) {
        // Automatically select the first color that is in stock, or the first registered color
        const inStock = availableColors.find(c => c.stock > 0) || availableColors[0];
        setSelectedColor(inStock.name);
      }
    }
  }, [selectedProduct, availableColors, selectedColor]);

  // Current stock for selected product, size and color as per inventory database
  const currentAvailableStock = useMemo(() => {
    if (!selectedProduct) return 0;
    if (selectedProduct.sizeColorStock && selectedSize > 0 && selectedColor) {
      const szMap = selectedProduct.sizeColorStock[String(selectedSize)];
      if (szMap) {
        if (selectedColor in szMap) return Number(szMap[selectedColor]) || 0;
        const lowerKey = Object.keys(szMap).find(k => k.toLowerCase() === selectedColor.toLowerCase());
        if (lowerKey) return Number(szMap[lowerKey]) || 0;
      }
    }
    if (selectedProduct.sizeStock && selectedSize > 0) {
      const szStock = selectedProduct.sizeStock[String(selectedSize)];
      if (typeof szStock === 'number') return szStock;
    }
    if (selectedProduct.stock) {
      return Math.max(1, Math.floor(selectedProduct.stock / (selectedProduct.sizes?.length || 5)));
    }
    return 1;
  }, [selectedProduct, selectedSize, selectedColor]);

  // Add Item to Draft Bill
  const handleAddToDraftBill = () => {
    if (!selectedProduct) {
      setToastMessage('Please select a footwear article first.');
      setIsArticleDropdownOpen(true);
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    const finalSize = selectedSize || (selectedProduct.sizes && selectedProduct.sizes[0]) || 6;
    const finalColor = selectedColor || (availableColors[0]?.name) || selectedProduct.colorName || 'Standard';
    const price = typeof priceInput === 'number' && priceInput > 0 ? priceInput : selectedProduct.price;

    setDraftItems(prev => {
      const existingIdx = prev.findIndex(it => 
        it.product.id === selectedProduct.id && 
        it.size === finalSize && 
        it.color === finalColor
      );
      if (existingIdx >= 0) {
        return prev.map((item, i) => 
          i === existingIdx 
            ? { ...item, quantity: item.quantity + quantity, customPrice: price }
            : item
        );
      } else {
        return [...prev, {
          product: selectedProduct,
          size: finalSize,
          color: finalColor,
          quantity: quantity,
          customPrice: price
        }];
      }
    });

    setToastMessage(`Added ${selectedProduct.name} (UK ${finalSize} • ${finalColor}) x${quantity} to draft bill!`);
    setTimeout(() => setToastMessage(null), 2500);

    // Reset article picker so cashier has clean state
    setSelectedProduct(null);
    setArticleSearchQuery('');
    setPriceInput('');
    setSelectedSize(0);
    setSelectedColor('');
    setQuantity(1);

    // Open draft bill section on a new page immediately!
    setCurrentTab('draft_bill');
    setIsFinalInvoiceStep(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Option 1: Add New Article (switches to article entry page and focuses article search)
  const handleAddNewArticle = () => {
    setIsFinalInvoiceStep(false);
    setSelectedProduct(null);
    setArticleSearchQuery('');
    setPriceInput('');
    setSelectedSize(0);
    setSelectedColor('');
    setQuantity(1);
    setCurrentTab('article_entry');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const el = document.getElementById('billing-article-search-input');
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setIsArticleDropdownOpen(true);
    }, 100);
  };

  // Option 2: Open Draft Bill Page
  const handleOpenFinalInvoice = () => {
    if (draftItems.length === 0) {
      setToastMessage('Please add at least one footwear article to the draft bill first.');
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }
    if (paymentMethod === 'CASH + UPI') {
      const half = Math.floor(netPayable / 2);
      setSplitCashAmount(half);
      setSplitUpiAmount(netPayable - half);
    }
    setIsFinalInvoiceStep(true);
    setCurrentTab('draft_bill');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Draft bill calculations
  const grossSubtotal = useMemo(() => {
    return draftItems.reduce((sum, it) => {
      const itemPrice = typeof it.customPrice === 'number' ? it.customPrice : it.product.price;
      return sum + (itemPrice * it.quantity);
    }, 0);
  }, [draftItems]);

  const discountAmount = useMemo(() => {
    if (discountPercent <= 0) return 0;
    return Math.round((grossSubtotal * discountPercent) / 100);
  }, [grossSubtotal, discountPercent]);

  const netPayable = useMemo(() => {
    return Math.max(0, grossSubtotal - discountAmount);
  }, [grossSubtotal, discountAmount]);

  const changeDue = useMemo(() => {
    if (paymentMethod !== 'CASH' || typeof cashGiven !== 'number') return 0;
    return Math.max(0, cashGiven - netPayable);
  }, [paymentMethod, cashGiven, netPayable]);

  // Helper to construct formatted WhatsApp text for the invoice
  const generateWhatsAppInvoiceText = (order: Order) => {
    const storeName = 'PRASHANT FOOTWEAR';
    const invoiceNumber = formatInvoiceNumber(order.id, order.createdAt);
    const dateStr = new Date(order.createdAt).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://prashantfootwear.com';
    const invoiceLink = `${appOrigin}/?invoice=${invoiceNumber}`;

    let text = `🧾 *${storeName} - TAX INVOICE*\n`;
    text += `Retail Footwear & Wholesale Hub • Sangamner\n`;
    text += `--------------------------------\n`;
    text += `*Invoice No:* ${invoiceNumber}\n`;
    text += `*Date:* ${dateStr}\n`;
    text += `*Customer:* ${order.customerName || 'Walk-in'}${order.customerMobile && order.customerMobile !== 'Walk-in' ? ` (${order.customerMobile})` : ''}\n`;
    text += `--------------------------------\n`;
    text += `👟 *ITEMS PURCHASED:*\n`;

    (order.items || []).forEach((it, idx) => {
      text += `${idx + 1}. *${it.name}*\n`;
      text += `   Size: UK ${it.size}${it.color ? ` | Color: ${it.color}` : ''} | Qty: ${it.quantity} × ₹${it.price} = ₹${it.price * it.quantity}\n`;
    });

    text += `--------------------------------\n`;
    text += `*TOTAL AMOUNT: ₹${order.totalAmount}*\n`;
    text += `*Payment Method:* ${order.paymentMethod}\n`;
    text += `--------------------------------\n`;
    text += `📄 *Digital Invoice Link:*\n${invoiceLink}\n`;
    text += `--------------------------------\n`;
    text += `Thank you for shopping with *Prashant Footwear*! 🙏\n`;
    text += `Please visit again.\n`;
    return text;
  };

  // Helper to trigger WhatsApp dispatch (silently skips if no valid phone provided)
  const triggerSendWhatsApp = (order: Order, phoneToUse?: string) => {
    const rawPhone = (phoneToUse || order.customerMobile || customerWhatsapp || '').trim();
    const digitsOnly = rawPhone.replace(/\D/g, '');
    if (!digitsOnly || digitsOnly.length < 10) {
      return;
    }
    const fullPhone = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;
    const msg = generateWhatsAppInvoiceText(order);
    const waUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  // Complete Order & Generate Bill
  const handleCompleteBill = async () => {
    if (draftItems.length === 0) {
      setToastMessage('Please add at least one footwear item to the draft bill.');
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    setIsCheckingOut(true);
    try {
      const finalPaymentMethod = paymentMethod === 'CASH + UPI'
        ? `CASH + UPI (Cash: ₹${splitCashAmount || 0}, UPI: ₹${splitUpiAmount || 0})`
        : paymentMethod;

      const orderPayload: Omit<Order, 'id' | 'createdAt'> = {
        customerMobile: customerWhatsapp.trim() || 'Walk-in',
        customerName: customerName.trim() || 'Walk-in Customer',
        items: draftItems.map(it => ({
          productId: it.product.id,
          name: it.product.name,
          category: it.product.category,
          subCategory: it.product.subCategory,
          price: typeof it.customPrice === 'number' ? it.customPrice : it.product.price,
          quantity: it.quantity,
          size: it.size,
          color: it.color,
          imageUrl: it.product.imageUrl || (it.product.imageUrls && it.product.imageUrls[0]),
          articleCode: it.product.articleCode || it.product.rawArticleCode
        })),
        totalAmount: netPayable,
        status: 'completed',
        paymentMethod: finalPaymentMethod
      };

      const result = await onCreateOrder(orderPayload);
      if (result.success && result.id) {
        // Deduct inventory
        for (const it of draftItems) {
          if (it.product.id && !it.product.id.startsWith('prod-seco-default')) {
            const currentSizeStock = it.product.sizeStock || {};
            const currentSzQty = currentSizeStock[String(it.size)] || 0;
            const newSzQty = Math.max(0, currentSzQty - it.quantity);
            const newTotalStock = Math.max(0, (it.product.stock || 0) - it.quantity);

            await onUpdateProduct(it.product.id, {
              sizeStock: { ...currentSizeStock, [String(it.size)]: newSzQty },
              stock: newTotalStock
            });
          }
        }

        const finalInvoiceCode = formatInvoiceNumber(result.id, new Date().toISOString());
        const newOrderRecord: Order = {
          ...orderPayload,
          id: finalInvoiceCode,
          createdAt: new Date().toISOString()
        };

        setViewingOrder(newOrderRecord);
        setIsFinalBillModalOpen(false);
        setIsFinalInvoiceStep(false);
        setDraftItems([]);
        setCurrentTab('article_entry');
        const savedPhone = customerWhatsapp.trim();
        setCustomerName('');
        setCustomerWhatsapp('');
        setCashGiven('');
        setSplitCashAmount('');
        setSplitUpiAmount('');
        setDiscountPercent(0);

        // Auto trigger WhatsApp if customer WhatsApp number has 10 digits
        const cleanPhone = savedPhone.replace(/\D/g, '');
        if (cleanPhone.length >= 10) {
          triggerSendWhatsApp(newOrderRecord, cleanPhone);
          setToastMessage(`Invoice ${finalInvoiceCode} created & sent to customer WhatsApp (+91 ${cleanPhone})!`);
        } else {
          // Customer didn't provide a WhatsApp number: skip WhatsApp without prompting
          setToastMessage(`Invoice ${finalInvoiceCode} created successfully!`);
        }
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        setToastMessage(result.error || 'Failed to create invoice.');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err: any) {
      setToastMessage(err.message || 'Error completing invoice.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Base list of orders from props, sorted newest first
  const displayInvoices = useMemo(() => {
    // If real orders exist from cloud / state
    if (orders && orders.length > 0) {
      return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Exact reference invoice logs with historical and today sample invoices
    return [
      {
        id: 'PF-26091402',
        createdAt: '2026-09-14T14:22:10',
        customerName: 'Sanjay Deshmukh',
        customerMobile: '9822012345',
        totalAmount: 499,
        paymentMethod: 'UPI',
        status: 'completed' as const,
        items: [{ productId: 'p5', name: 'VKC Pride Men Comfort Slide', category: 'Men' as any, subCategory: 'Sandals' as any, price: 499, quantity: 1, size: 8 }]
      },
      {
        id: 'PF-26091401',
        createdAt: '2026-09-14T10:45:15',
        customerName: 'Walk-in',
        customerMobile: '9890123456',
        totalAmount: 280,
        paymentMethod: 'CASH',
        status: 'completed' as const,
        items: [{ productId: 'p4', name: 'Paragon Max Slipper', category: 'Men' as any, subCategory: 'Slippers' as any, price: 280, quantity: 1, size: 7 }]
      },
      {
        id: 'PF-26091001',
        createdAt: '2026-09-10T12:51:32',
        customerName: 'Walk-in',
        customerMobile: '9511244447',
        totalAmount: 305,
        paymentMethod: 'CASH',
        status: 'completed' as const,
        items: [{ productId: 'p1', name: 'Walkaroo Classic Sandal', category: 'Men' as any, subCategory: 'Sandals' as any, price: 305, quantity: 1, size: 6 }]
      },
      {
        id: 'PF-26090901',
        createdAt: '2026-09-09T15:14:05',
        customerName: 'Customer',
        customerMobile: 'Walk-in',
        totalAmount: 309,
        paymentMethod: 'UPI',
        status: 'completed' as const,
        items: [{ productId: 'p2', name: 'Walkmate Casual Slipper', category: 'Men' as any, subCategory: 'Sandals' as any, price: 309, quantity: 1, size: 7 }]
      },
      {
        id: 'PF-26082601',
        createdAt: '2026-08-26T14:10:53',
        customerName: 'Walk-in',
        customerMobile: 'Walk-in',
        totalAmount: 379,
        paymentMethod: 'CASH',
        status: 'completed' as const,
        items: [{ productId: 'p3', name: 'SECO Leather Sandal', category: 'Men' as any, subCategory: 'Sandals' as any, price: 379, quantity: 1, size: 8 }]
      },
      {
        id: 'PF-26082001',
        createdAt: '2026-08-20T11:30:42',
        customerName: 'Ganesh More',
        customerMobile: '9423456789',
        totalAmount: 649,
        paymentMethod: 'UPI',
        status: 'completed' as const,
        items: [{ productId: 'p6', name: 'Campus Sporty Runner', category: 'Men' as any, subCategory: 'Shoes' as any, price: 649, quantity: 1, size: 9 }]
      },
      {
        id: 'PF-26081501',
        createdAt: '2026-08-15T16:05:19',
        customerName: 'Walk-in',
        customerMobile: 'Walk-in',
        totalAmount: 220,
        paymentMethod: 'CASH',
        status: 'completed' as const,
        items: [{ productId: 'p7', name: 'Sparx Rubber Thong', category: 'Men' as any, subCategory: 'Slippers' as any, price: 220, quantity: 1, size: 7 }]
      }
    ];
  }, [orders]);

  // Helper to extract YYYY-MM-DD from invoice createdAt
  const getInvoiceDateKey = (createdAt?: string): string => {
    if (!createdAt) return '';
    try {
      const d = new Date(createdAt);
      if (isNaN(d.getTime())) return '';
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    } catch {
      return '';
    }
  };

  const todayDateKey = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Format date key (YYYY-MM-DD) for display: e.g. "14 Sep 2026"
  const formatHeaderDate = (dateKey: string) => {
    try {
      if (!dateKey) return '';
      const [y, m, d] = dateKey.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateKey;
    }
  };

  // Map of YYYY-MM-DD to invoice count for highlighting dates on the calendar
  const invoiceDatesCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    displayInvoices.forEach(inv => {
      const k = getInvoiceDateKey(inv.createdAt);
      if (k) {
        map[k] = (map[k] || 0) + 1;
      }
    });
    return map;
  }, [displayInvoices]);

  // Calendar month data with highlighted dates
  const calendarData = useMemo(() => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{
      dayNumber: number;
      dateKey: string;
      billsCount: number;
      isToday: boolean;
      isSelected: boolean;
      hasBills: boolean;
    }> = [];

    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const billsCount = invoiceDatesCountMap[dateKey] || 0;
      days.push({
        dayNumber: day,
        dateKey,
        billsCount,
        isToday: dateKey === todayDateKey,
        isSelected: historyFilterMode === 'date' && selectedHistoryDate === dateKey,
        hasBills: billsCount > 0,
      });
    }

    const monthTitle = calendarViewDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    return { firstDayIndex, days, year, month, monthTitle };
  }, [calendarViewDate, invoiceDatesCountMap, todayDateKey, historyFilterMode, selectedHistoryDate]);

  // Filtered invoices for the Generated Invoice History Logs section (Always shows last 5 by default, or today, or particular date)
  const filteredHistoryInvoices = useMemo(() => {
    if (historyFilterMode === 'today') {
      return displayInvoices.filter(inv => getInvoiceDateKey(inv.createdAt) === todayDateKey);
    }
    if (historyFilterMode === 'date') {
      return displayInvoices.filter(inv => getInvoiceDateKey(inv.createdAt) === selectedHistoryDate);
    }
    // Default: always show the last 5 invoices
    return displayInvoices.slice(0, 5);
  }, [displayInvoices, historyFilterMode, selectedHistoryDate, todayDateKey]);

  // Return orders list
  const returnOrdersList = useMemo(() => {
    const q = returnSearchQuery.toLowerCase().trim();
    const source = orders.length > 0 ? orders : displayInvoices;
    if (!q) return source.slice(0, 15);
    return source.filter(o => 
      o.id.toLowerCase().includes(q) || 
      (o.customerMobile || '').toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q)
    );
  }, [orders, displayInvoices, returnSearchQuery]);

  // Process refund
  const handleProcessRefund = async (order: Order) => {
    try {
      for (const it of order.items || []) {
        const prod = products.find(p => p.id === it.productId);
        if (prod) {
          const currentSizeStock = prod.sizeStock || {};
          const currentSzQty = currentSizeStock[String(it.size)] || 0;
          await onUpdateProduct(prod.id, {
            sizeStock: { ...currentSizeStock, [String(it.size)]: currentSzQty + it.quantity },
            stock: (prod.stock || 0) + it.quantity
          });
        }
      }

      setToastMessage(`Refund processed for Bill ${order.id} and stock restored!`);
      setTimeout(() => setToastMessage(null), 3500);
      setSelectedOrderForReturn(null);
    } catch (e) {
      alert('Error processing refund');
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto pb-28 px-3 sm:px-4 font-sans select-none animate-fade-in relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 left-4 max-w-sm mx-auto z-[100] px-4 py-3 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-mono text-xs font-bold shadow-2xl flex items-center gap-2 border border-[#BFA05D]">
          <CheckCircle2 size={16} className="text-[#BFA05D] shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Top action row: BACK TO HOME + REFUND & RETURN (Matching Reference Screenshot 1) */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <button
          type="button"
          onClick={() => {
            if (currentTab === 'draft_bill') {
              setCurrentTab('article_entry');
            } else if (showRefundDesk) {
              setShowRefundDesk(false);
            } else if (onBackToHome) {
              onBackToHome();
            } else if (onNavigate) {
              onNavigate('home');
            }
          }}
          className={`flex-1 py-3 px-4 rounded-2xl border-[1.5px] font-sans font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs active:scale-95 transition-all cursor-pointer ${
            isDark
              ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800'
              : 'bg-white border-[#DCD1B7] text-[#141311] hover:bg-zinc-50'
          }`}
        >
          <ArrowLeft size={16} className="stroke-[2.8]" />
          <span>{currentTab === 'draft_bill' ? 'BACK TO ARTICLE SELECTION' : 'BACK TO HOME'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (currentTab === 'draft_bill') {
              setCurrentTab('article_entry');
            }
            setShowRefundDesk(!showRefundDesk);
          }}
          className="flex-1 py-3 px-4 rounded-2xl border-[1.5px] border-[#8E6C28] bg-[#A98239] hover:bg-[#97732e] text-[#141311] font-sans font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs active:scale-95 transition-all cursor-pointer"
        >
          <RotateCcw size={15} className="stroke-[2.8]" />
          <span>{showRefundDesk ? 'MAKE BILL' : 'REFUND & RETURN'}</span>
        </button>
      </div>

      {!showRefundDesk ? (
        currentTab === 'draft_bill' ? (
          /* DEDICATED DRAFT BILL PAGE (Rendered on a new page with clean simple design) */
          <div className="space-y-4 sm:space-y-5">
            <div className={`rounded-3xl sm:rounded-[36px] p-4 sm:p-7 border-[1.5px] shadow-sm transition-all ${
              isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-[#E5DEC9] text-[#141311]'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={handleAddNewArticle}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      isDark 
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' 
                        : 'bg-zinc-50 border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                    }`}
                    title="Back to Article Selection"
                  >
                    <ArrowLeft size={18} className="stroke-[2.5]" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-sans font-black text-base sm:text-lg uppercase tracking-tight text-[#101828] dark:text-white leading-none">
                        DRAFT BILL
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#00875A] dark:text-emerald-300 font-mono font-bold text-[10px]">
                        {draftItems.length} {draftItems.length === 1 ? 'ITEM' : 'ITEMS'}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                      {draftItems.reduce((acc, i) => acc + i.quantity, 0)} pairs total
                    </p>
                  </div>
                </div>

                {draftItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setDraftItems([]);
                      setCurrentTab('article_entry');
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-mono uppercase text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer font-bold border border-rose-200 dark:border-rose-900/60 transition-all"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Customer Info Strip if entered */}
              {(customerName.trim() || customerWhatsapp.trim()) && (
                <div className="mt-3 p-2.5 sm:p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                    {customerName.trim() && (
                      <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                        <User size={13} className="text-zinc-400" />
                        <span className="font-bold text-[#141311] dark:text-white">{customerName.trim()}</span>
                      </div>
                    )}
                    {customerWhatsapp.trim() && (
                      <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                        <MessageSquare size={13} className="text-emerald-600" />
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{customerWhatsapp.trim()}</span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentTab('article_entry');
                      setTimeout(() => {
                        const el = document.getElementById('billing-customer-name-input');
                        if (el) el.focus();
                      }, 100);
                    }}
                    className="text-[11px] font-sans font-bold text-[#00875A] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              )}

              {/* Items List */}
              {draftItems.length > 0 ? (
                <div className="space-y-3 my-4">
                  {draftItems.map((it, idx) => {
                    const itPrice = typeof it.customPrice === 'number' ? it.customPrice : it.product.price;
                    const thumbUrl = it.product.imageUrl || (it.product.imageUrls && it.product.imageUrls[0]);
                    const articleNum = it.product.articleCode || it.product.rawArticleCode || it.product.id;
                    const articleBrand = it.product.brand;
                    const itemTotal = itPrice * it.quantity;

                    return (
                      <div
                        key={`${it.product.id}-${it.size}-${it.color}-${idx}`}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                          isDark 
                            ? 'bg-zinc-950/80 border-zinc-800' 
                            : 'bg-white border-[#E8DEC7] shadow-2xs'
                        }`}
                      >
                        {/* Top Section: Thumbnail + Article Details + Delete Button */}
                        <div className="flex items-start gap-3">
                          {/* Footwear Thumbnail */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 shrink-0 overflow-hidden flex items-center justify-center">
                            {thumbUrl ? (
                              <img 
                                src={thumbUrl} 
                                alt={it.product.name} 
                                referrerPolicy="no-referrer" 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <Package size={22} className="text-zinc-400" />
                            )}
                          </div>

                          {/* Information Details */}
                          <div className="min-w-0 flex-1">
                            {/* Badges & Trash Icon */}
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 font-mono font-bold text-[10px] uppercase tracking-wide shrink-0">
                                  #{articleNum}
                                </span>
                                {articleBrand && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-sans font-bold text-[9.5px] uppercase border border-zinc-200/80 dark:border-zinc-700 shrink-0">
                                    {articleBrand}
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setDraftItems(prev => prev.filter((_, i) => i !== idx));
                                }}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors shrink-0"
                                title="Remove article"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            {/* Product Name */}
                            <h3 className="font-sans font-bold text-xs sm:text-sm text-[#141311] dark:text-white mt-1 leading-snug break-words">
                              {it.product.name}
                            </h3>

                            {/* Variant Specs: UK Size, Color, Rate */}
                            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-300 mt-1.5 flex-wrap">
                              <span className="font-bold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200/70 dark:border-amber-800/70 text-[10.5px]">
                                UK {it.size}
                              </span>
                              {it.color && (
                                <span className="inline-flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/90 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700 text-[10.5px]">
                                  <span 
                                    className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0 shadow-2xs" 
                                    style={{ backgroundColor: it.color.toLowerCase() }} 
                                  />
                                  <span className="capitalize">{it.color}</span>
                                </span>
                              )}
                              <span className="inline-flex items-center text-zinc-600 dark:text-zinc-300 text-[11px] font-semibold">
                                Rate: <strong className="text-emerald-700 dark:text-emerald-400 font-bold ml-1">₹{itPrice}</strong>/pr
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row: Quantity Stepper & Line Item Total */}
                        <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10.5px] font-sans font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                              Qty:
                            </span>
                            <div className="flex items-center rounded-xl border border-zinc-300 dark:border-zinc-700 overflow-hidden bg-zinc-50 dark:bg-zinc-800 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => {
                                  setDraftItems(prev => {
                                    if (prev[idx]?.quantity > 1) {
                                      return prev.map((item, i) => 
                                        i === idx ? { ...item, quantity: item.quantity - 1 } : item
                                      );
                                    } else {
                                      return prev.filter((_, i) => i !== idx);
                                    }
                                  });
                                }}
                                className="w-8 h-8 flex items-center justify-center font-black text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer text-sm active:scale-95 transition-colors"
                                title="Decrease"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-mono font-black text-xs text-[#141311] dark:text-white">
                                {it.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setDraftItems(prev => prev.map((item, i) => 
                                    i === idx ? { ...item, quantity: item.quantity + 1 } : item
                                  ));
                                }}
                                className="w-8 h-8 flex items-center justify-center font-black text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer text-sm active:scale-95 transition-colors"
                                title="Increase"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 block leading-none">
                              {it.quantity} × ₹{itPrice}
                            </span>
                            <span className="font-mono font-black text-base sm:text-lg text-emerald-600 dark:text-emerald-400 leading-tight">
                              ₹{itemTotal}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center space-y-3">
                  <p className="text-sm font-sans text-zinc-500">Draft bill is empty.</p>
                  <button
                    type="button"
                    onClick={handleAddNewArticle}
                    className="py-2.5 px-4 rounded-xl bg-[#00875A] text-white font-sans font-black text-xs uppercase cursor-pointer"
                  >
                    + Add Footwear Article
                  </button>
                </div>
              )}

              {draftItems.length > 0 && (
                <>
                  {/* Total Summary Row */}
                  <div className="mt-4 pt-3.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <span className="font-sans font-black text-xs uppercase text-zinc-500">
                      TOTAL AMOUNT
                    </span>
                    <span className="font-mono font-black text-2xl text-emerald-600 leading-none">
                      ₹{grossSubtotal}
                    </span>
                  </div>

                  {/* Step 1: When user adds article to draft bill, show Add More Articles & Make Final Invoice */}
                  {!isFinalInvoiceStep ? (
                    <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={handleAddNewArticle}
                        className="py-3.5 px-4 rounded-xl sm:rounded-2xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-sans font-bold text-xs uppercase cursor-pointer text-zinc-700 dark:text-zinc-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={16} className="stroke-[3]" />
                        <span>Add More Articles</span>
                      </button>

                      <button
                        type="button"
                        id="btn-make-final-invoice"
                        onClick={handleOpenFinalInvoice}
                        className="py-3.5 px-4 rounded-xl sm:rounded-2xl bg-[#00875A] hover:bg-[#00744d] text-white font-sans font-black text-xs sm:text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer transition-all"
                      >
                        <Receipt size={16} className="text-[#FFA000]" />
                        <span>Make Final Invoice →</span>
                      </button>
                    </div>
                  ) : (
                    /* Step 2: Show Payment Selection ONLY after Make Final Invoice is clicked */
                    <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-sans font-black uppercase tracking-wider text-[#141311] dark:text-white flex items-center gap-1.5">
                          <CreditCard size={15} className="text-[#FFA000]" />
                          <span>PAYMENT METHOD</span>
                        </label>
                        <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          Payable: ₹{netPayable}
                        </span>
                      </div>

                      {/* 3 Payment Options: UPI, Cash, UPI + Cash */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { mode: 'UPI' as const, label: 'UPI', icon: Smartphone },
                          { mode: 'CASH' as const, label: 'Cash', icon: Coins },
                          { mode: 'CASH + UPI' as const, label: 'UPI + Cash', icon: Layers }
                        ].map(pm => {
                          const Icon = pm.icon;
                          const isSel = paymentMethod === pm.mode;
                          return (
                            <button
                              key={pm.mode}
                              type="button"
                              onClick={() => {
                                setPaymentMethod(pm.mode);
                                if (pm.mode === 'CASH + UPI') {
                                  const half = Math.floor(netPayable / 2);
                                  setSplitCashAmount(half);
                                  setSplitUpiAmount(netPayable - half);
                                }
                              }}
                              className={`py-3 px-2 rounded-xl border text-xs font-sans font-black uppercase flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs ${
                                isSel
                                  ? 'bg-[#141311] text-white border-[#141311] ring-2 ring-[#FFA000]'
                                  : isDark
                                  ? 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-850'
                                  : 'bg-zinc-50 text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                              }`}
                            >
                              <Icon size={15} className={isSel ? 'text-[#FFA000]' : 'text-zinc-500'} />
                              <span className="text-[11px] sm:text-xs">{pm.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* UPI details */}
                      {paymentMethod === 'UPI' && (
                        <div className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 text-xs font-sans text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                          <Smartphone size={16} className="text-emerald-600 shrink-0" />
                          <span>UPI Payment • <strong>₹{netPayable}</strong></span>
                        </div>
                      )}

                      {/* Cash details (Simple and clean, no cash tendered clutter) */}
                      {paymentMethod === 'CASH' && (
                        <div className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/30 text-xs font-sans text-amber-900 dark:text-amber-200 flex items-center gap-2">
                          <Coins size={16} className="text-amber-600 shrink-0" />
                          <span>Cash Payment • <strong>₹{netPayable}</strong></span>
                        </div>
                      )}

                      {/* UPI + Cash details */}
                      {paymentMethod === 'CASH + UPI' && (
                        <div className="p-3 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase block mb-1">
                                Cash Amount (₹)
                              </label>
                              <input
                                type="number"
                                value={splitCashAmount}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? '' : Number(e.target.value);
                                  setSplitCashAmount(val);
                                  if (val === '') {
                                    setSplitUpiAmount(netPayable);
                                  } else {
                                    setSplitUpiAmount(Math.max(0, netPayable - val));
                                  }
                                }}
                                placeholder="e.g. 200"
                                className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-xs font-mono font-bold outline-none text-[#141311] dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase block mb-1">
                                UPI Amount (₹)
                              </label>
                              <input
                                type="number"
                                value={splitUpiAmount}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? '' : Number(e.target.value);
                                  setSplitUpiAmount(val);
                                  if (val === '') {
                                    setSplitCashAmount(netPayable);
                                  } else {
                                    setSplitCashAmount(Math.max(0, netPayable - val));
                                  }
                                }}
                                placeholder="e.g. 189"
                                className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-xs font-mono font-bold outline-none text-[#141311] dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bottom Actions: Add More Articles & Done & Generate Invoice */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={handleAddNewArticle}
                          className="py-3.5 px-4 rounded-xl sm:rounded-2xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-sans font-bold text-xs uppercase cursor-pointer text-zinc-700 dark:text-zinc-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus size={16} className="stroke-[3]" />
                          <span>Add More Articles</span>
                        </button>

                        <button
                          type="button"
                          id="btn-confirm-final-invoice"
                          onClick={handleCompleteBill}
                          disabled={isCheckingOut || draftItems.length === 0}
                          className="py-3.5 px-4 rounded-xl sm:rounded-2xl bg-[#00875A] hover:bg-[#00744d] text-white font-sans font-black text-xs sm:text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer transition-all disabled:opacity-50"
                        >
                          {isCheckingOut ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <Check size={16} className="stroke-[3] text-[#FFA000]" />
                          )}
                          <span>Done & Generate Invoice</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Top Quick Status Bar when Draft Bill has items */}
            {draftItems.length > 0 && (
              <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-amber-500/10 border-2 border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShoppingBag size={20} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-black text-xs sm:text-sm uppercase tracking-wider text-emerald-950 dark:text-emerald-100">
                        Draft Bill Active
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-mono font-black text-[11px]">
                        {draftItems.length} {draftItems.length === 1 ? 'Article' : 'Articles'}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-emerald-700 dark:text-emerald-300 font-bold mt-0.5">
                      {draftItems.reduce((acc, i) => acc + i.quantity, 0)} Total Pairs • Total: ₹{grossSubtotal}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentTab('draft_bill');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="py-2.5 px-4 rounded-xl bg-[#00875A] hover:bg-[#00744d] text-white font-sans font-black text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Receipt size={15} className="text-[#FFA000]" />
                    <span>Open Draft Bill ({draftItems.length}) →</span>
                  </button>
                </div>
              </div>
            )}

          {/* 1. ARTICLE SELECTION CARD: Always visible on this same page */}
          <div className={`rounded-[36px] p-6 sm:p-7 border-[1.5px] shadow-2xs transition-all ${
            isDark 
              ? 'bg-zinc-900 border-zinc-700 text-white' 
              : 'bg-white border-[#E5DEC9] text-[#141311]'
          }`}>
            
            {/* Header: Lavender squircle with purple FileText + PRASHANT FOOTWEAR / BILLING CENTER */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] dark:bg-indigo-950/60 border border-[#E0E7FF] dark:border-indigo-900 flex items-center justify-center text-[#4F46E5] shrink-0">
                <FileText size={22} className="stroke-[2.2]" />
              </div>

              <div>
                <h1 className="font-sans font-black text-base sm:text-lg uppercase tracking-tight text-[#101828] dark:text-white leading-none">
                  PRASHANT FOOTWEAR
                </h1>
                <div className="mt-1.5 inline-block">
                  <span className="px-3.5 py-1 rounded-full bg-[#F0F4FF] dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-300 font-sans font-black text-[10.5px] tracking-wider uppercase border border-[#E0E7FF] dark:border-indigo-900">
                    BILLING CENTER
                  </span>
                </div>
              </div>
            </div>

            <div className="border-b border-[#F0EBE0] dark:border-zinc-800 my-5" />

            {/* Field 1: CUSTOMER NAME */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-sans font-black uppercase tracking-wider text-[#141311] dark:text-zinc-200 mb-2">
                <User size={15} className="text-zinc-400 shrink-0 stroke-[2.2]" />
                <span>CUSTOMER NAME</span>
              </label>
              <div className={`rounded-2xl border-[1.5px] px-4 py-3.5 transition-all ${
                isDark
                  ? 'bg-zinc-800/80 border-zinc-700 text-white'
                  : 'bg-white border-[#DCD1B7] text-[#141311]'
              }`}>
                <input
                  id="billing-customer-name-input"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Walk-in / Enter client name"
                  className="bg-transparent border-none outline-none w-full font-sans text-xs sm:text-sm text-[#141311] dark:text-white placeholder:text-zinc-400 font-medium"
                />
              </div>
            </div>

            {/* Field 2: CUSTOMER WHATSAPP */}
            <div className="mt-4">
              <label className="flex items-center gap-1.5 text-xs font-sans font-black uppercase tracking-wider text-[#141311] dark:text-zinc-200 mb-2">
                <MessageSquare size={15} className="text-zinc-400 shrink-0 stroke-[2.2]" />
                <span>CUSTOMER WHATSAPP</span>
              </label>
              <div className={`rounded-2xl border-[1.5px] px-4 py-3.5 transition-all ${
                isDark
                  ? 'bg-zinc-800/80 border-zinc-700 text-white'
                  : 'bg-white border-[#DCD1B7] text-[#141311]'
              }`}>
                <input
                  id="billing-customer-whatsapp-input"
                  type="tel"
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="bg-transparent border-none outline-none w-full font-mono text-xs sm:text-sm text-[#141311] dark:text-white placeholder:text-zinc-400 font-medium"
                />
              </div>
            </div>

            {/* INNER SUBCARD: SEARCH OR ADD FOOTWEAR STYLE */}
            <div className={`rounded-[28px] border-[1.5px] p-4 sm:p-5 mt-5 space-y-4 transition-all ${
              isDark
                ? 'bg-zinc-950/50 border-zinc-800'
                : 'bg-[#FAFAF8] border-[#E8DFC2]'
            }`}>
              
              {/* Header: Yellow Zap Icon + SEARCH OR ADD FOOTWEAR STYLE + Orange FAST POS ENTRY Button */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FFF8E6] dark:bg-amber-950/60 border border-[#F6E0A4] dark:border-amber-800 flex items-center justify-center text-[#E58A13] shrink-0">
                    <Zap size={16} className="fill-[#E58A13]" />
                  </div>
                  <h2 className="font-sans font-black text-xs sm:text-[13px] uppercase tracking-tight text-[#141311] dark:text-white leading-tight">
                    SEARCH OR ADD<br />FOOTWEAR STYLE
                  </h2>
                </div>

                {/* Orange 3-line FAST POS ENTRY button - kept unclickable as requested */}
                <div
                  className="bg-[#FFA000]/75 text-[#141311] font-sans font-black text-[10px] leading-tight px-3 py-2 rounded-xl shadow-2xs text-center uppercase tracking-wide flex flex-col items-center justify-center cursor-not-allowed border border-[#E58A13]/60 shrink-0 select-none opacity-80"
                  title="FAST POS Entry (Inactive)"
                  aria-disabled="true"
                >
                  <span>FAST</span>
                  <span className="flex items-center gap-0.5"><Barcode size={10} className="stroke-[2.5]" /> POS</span>
                  <span>ENTRY</span>
                </div>
              </div>

              {/* Field A: ARTICLE NUMBER */}
              <div className="relative" ref={articleDropdownRef}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-sans font-black uppercase tracking-wider text-[#141311] dark:text-zinc-200">
                    ARTICLE NUMBER
                  </label>
                  {selectedProduct && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      ✓ Article Selected
                    </span>
                  )}
                </div>

                <div 
                  onClick={() => setIsArticleDropdownOpen(true)}
                  className={`rounded-2xl border-[1.5px] px-3.5 py-2.5 flex items-center justify-between gap-2.5 cursor-pointer shadow-2xs transition-all ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-700 text-white'
                      : 'bg-white border-[#DCD1B7] text-[#141311]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {selectedProduct && (selectedProduct.imageUrl || selectedProduct.imageUrls?.[0]) ? (
                      <img 
                        src={selectedProduct.imageUrl || selectedProduct.imageUrls?.[0]} 
                        alt={selectedProduct.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shrink-0 shadow-2xs"
                      />
                    ) : (
                      <Search size={16} className="text-zinc-400 shrink-0 stroke-[2.2]" />
                    )}
                    <input
                      id="billing-article-search-input"
                      type="text"
                      value={articleSearchQuery}
                      onChange={(e) => {
                        setArticleSearchQuery(e.target.value);
                        setIsArticleDropdownOpen(true);
                        if (selectedProduct && selectedProduct.articleCode !== e.target.value && selectedProduct.id !== e.target.value) {
                          setSelectedProduct(null);
                        }
                      }}
                      onFocus={() => setIsArticleDropdownOpen(true)}
                      placeholder="Search article by number, code, name..."
                      className="bg-transparent border-none outline-none w-full font-sans font-black text-xs sm:text-sm text-[#141311] dark:text-white placeholder:text-zinc-400 placeholder:font-normal"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {selectedProduct && (
                      <button
                        type="button"
                        onClick={handleClearArticle}
                        className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                        title="Clear chosen article"
                      >
                        <X size={14} className="stroke-[2.5]" />
                      </button>
                    )}
                    <ChevronDown size={18} className={`text-zinc-400 transition-transform ${isArticleDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Auto-suggest dropdown with full article name, article code, price, and last-selected priority */}
                {isArticleDropdownOpen && (
                  <div className={`absolute left-0 right-0 top-full mt-2 z-40 rounded-2xl border shadow-xl max-h-80 sm:max-h-96 overflow-y-auto p-2 space-y-2 ${
                    isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-zinc-200'
                  }`}>
                    {filteredProducts.length === 0 ? (
                      <div className="p-4 text-center text-xs font-sans text-zinc-500">
                        No matching footwear articles found.
                      </div>
                    ) : (
                      filteredProducts.map((p) => {
                        const totalStock = Number(p.stock) || (p.sizeStock ? Object.values(p.sizeStock).reduce((s, v) => s + (Number(v) || 0), 0) : 0);
                        const code = p.articleCode || p.rawArticleCode || p.id;
                        const thumbUrl = p.imageUrl || (p.imageUrls && p.imageUrls[0]);
                        const isSelected = selectedProduct?.id === p.id;
                        const isLastSelected = recentArticleIds.length > 0 && recentArticleIds[0] === p.id;
                        const isRecent = recentArticleIds.includes(p.id) && !isLastSelected;
                        const brandName = p.brand || 'Walkaroo';
                        const colorInfo = getProductColorSummary(p);
                        const priceValue = p.price || p.mrp || p.originalPrice || 0;

                        return (
                          <div
                            key={p.id}
                            onClick={() => handleSelectProduct(p)}
                            className={`p-2.5 sm:p-3 rounded-2xl flex items-start sm:items-center gap-3 cursor-pointer transition-all border min-h-[56px] active:scale-[0.99] ${
                              isSelected
                                ? isDark 
                                  ? 'bg-amber-950/50 border-[#BFA05D] ring-1 ring-[#BFA05D] shadow-xs' 
                                  : 'bg-amber-50 border-[#BFA05D] ring-1 ring-[#BFA05D] shadow-xs'
                                : isDark 
                                  ? 'bg-zinc-850 hover:bg-zinc-800 border-zinc-700/70' 
                                  : 'bg-white hover:bg-amber-50/70 border-zinc-200/90 shadow-2xs'
                            }`}
                          >
                            {/* Small thumbnail image */}
                            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0 overflow-hidden flex items-center justify-center relative shadow-2xs mt-0.5 sm:mt-0">
                              {thumbUrl ? (
                                <img
                                  src={thumbUrl}
                                  alt={p.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package size={20} className="text-zinc-400" />
                              )}
                            </div>

                            {/* Item Details: Article Number, Full Name, Price, and Metadata */}
                            <div className="min-w-0 flex-1 space-y-1">
                              {/* Row 1: Article Number, Recency Badges, and Price */}
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-mono font-black text-xs sm:text-[13px] text-[#BFA05D] dark:text-amber-400 tracking-wide">
                                    {code}
                                  </span>
                                  {isLastSelected ? (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 font-sans font-black text-[9.5px] uppercase tracking-wider">
                                      ★ Last Selected
                                    </span>
                                  ) : isRecent ? (
                                    <span className="px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-sans font-bold text-[9px] uppercase">
                                      Recent
                                    </span>
                                  ) : null}
                                </div>

                                <div className="font-mono font-black text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 shrink-0">
                                  ₹{priceValue}
                                </div>
                              </div>

                              {/* Row 2: Full Name of the Article (complete without truncation) */}
                              <div className="font-sans font-bold text-xs sm:text-[13px] text-[#141311] dark:text-white leading-snug break-words">
                                {p.name}
                              </div>

                              {/* Row 3: Brand • Color • Stock */}
                              <div className="flex items-center justify-between gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400 pt-0.5 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-sans font-semibold text-zinc-900 dark:text-zinc-200">
                                    {brandName}
                                  </span>
                                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                  <span className="inline-flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                                    <span 
                                      className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0 inline-block" 
                                      style={{ backgroundColor: colorInfo.hex }} 
                                    />
                                    <span>{colorInfo.label}</span>
                                  </span>
                                </div>

                                <span className={`font-mono text-[10.5px] font-semibold shrink-0 ${
                                  totalStock > 0 
                                    ? 'text-zinc-500 dark:text-zinc-400' 
                                    : 'text-rose-500 font-bold'
                                }`}>
                                  {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Field B: COLOR OPTION (Shown only after an article number is selected) */}
              {selectedProduct && availableColors.length > 0 && (
                <div>
                  <div className="mb-2">
                    <label className="text-[11px] font-sans font-black uppercase tracking-wider text-[#141311] dark:text-zinc-200">
                      AVAILABLE COLORS
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {availableColors.map((col) => {
                      const isSel = selectedColor.toUpperCase() === col.name.toUpperCase();
                      return (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => setSelectedColor(col.name)}
                          className={`py-2 px-3.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer select-none text-xs uppercase font-bold ${
                            isSel
                              ? 'bg-[#FFA000] border-2 border-[#D97706] text-[#141311] shadow-xs'
                              : isDark
                              ? 'bg-zinc-900 border border-zinc-700 text-zinc-200 hover:border-zinc-500'
                              : 'bg-white border border-zinc-300 text-zinc-800 hover:border-amber-400 shadow-2xs'
                          }`}
                        >
                          <span className="relative flex items-center justify-center shrink-0">
                            <span 
                              className="w-3.5 h-3.5 rounded-full border border-black/25 shadow-2xs" 
                              style={{ backgroundColor: col.hex }} 
                            />
                            {isSel && (
                              <Check size={9} className="absolute text-zinc-950 font-black stroke-[3.5]" />
                            )}
                          </span>
                          <span>{col.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Field C: SHOE SIZE with Selected Pill */}
              <div ref={sizeDropdownRef} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-sans font-black uppercase tracking-wider text-[#141311] dark:text-zinc-200">
                    SHOE SIZE
                  </span>
                  {selectedProduct && selectedSize > 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#D1FAE5] dark:bg-emerald-950/60 text-[#065F46] dark:text-emerald-400 font-bold text-xs border border-[#A7F3D0] dark:border-emerald-800">
                      Selected: UK {selectedSize}
                    </span>
                  ) : null}
                </div>

                <div
                  onClick={() => {
                    if (selectedProduct) {
                      setIsSizeDropdownOpen(!isSizeDropdownOpen);
                    } else {
                      setIsArticleDropdownOpen(true);
                      setToastMessage('Please choose an article first.');
                      setTimeout(() => setToastMessage(null), 2000);
                    }
                  }}
                  className={`rounded-2xl border-[1.5px] px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-bold cursor-pointer shadow-2xs transition-all ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-700 text-white'
                      : 'bg-white border-[#DCD1B7] text-[#141311]'
                  }`}
                >
                  <span className={!selectedProduct ? 'text-zinc-400 font-normal' : ''}>
                    {selectedProduct && selectedSize > 0 
                      ? `UK ${selectedSize} (${currentAvailableStock} in stock)` 
                      : selectedProduct 
                      ? 'Select shoe size...' 
                      : 'Select article first to choose size'}
                  </span>
                  <ChevronDown size={16} className={`text-zinc-400 transition-transform ${isSizeDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {isSizeDropdownOpen && selectedProduct && (
                  <div className={`absolute left-0 right-0 top-full mt-1.5 z-30 rounded-2xl border shadow-xl p-1.5 space-y-1 ${
                    isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-zinc-200'
                  }`}>
                    {(selectedProduct.sizes && selectedProduct.sizes.length > 0 ? selectedProduct.sizes : [5, 6, 7, 8, 9, 10, 11]).map(sz => {
                      const szStock = selectedProduct?.sizeStock?.[String(sz)] ?? (selectedProduct.stock ? Math.max(1, Math.floor(selectedProduct.stock / 5)) : 2);
                      return (
                        <div
                          key={sz}
                          onClick={() => {
                            setSelectedSize(sz);
                            setIsSizeDropdownOpen(false);
                          }}
                          className={`p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer ${
                            selectedSize === sz
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold'
                              : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <span className="font-bold">UK {sz}</span>
                          <span className="font-mono text-[11px] text-zinc-500">
                            {szStock > 0 ? `${szStock} in stock` : 'Out of stock'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Field D: PRICE (₹) */}
              <div>
                <label className="text-[11px] font-sans font-black uppercase tracking-wider text-[#141311] dark:text-zinc-200 block mb-1.5">
                  PRICE (₹)
                </label>

                <div className={`rounded-2xl border-[1.5px] px-4 py-3 flex items-center gap-2 font-mono text-xs sm:text-sm shadow-2xs transition-all ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-700 text-white'
                    : 'bg-white border-[#DCD1B7] text-[#141311]'
                }`}>
                  <span className="font-black text-[#059669] text-base">₹</span>
                  <input
                    type="number"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value ? Number(e.target.value) : '')}
                    placeholder={selectedProduct ? String(selectedProduct.price) : "e.g. 389"}
                    className="w-full bg-transparent border-none outline-none font-mono font-black text-xs sm:text-sm text-[#141311] dark:text-white placeholder:text-zinc-400 placeholder:font-normal"
                  />
                </div>
              </div>

              {/* Field E: QTY Stepper (-1 | 1 | +1) */}
              <div>
                <label className="text-[11px] font-sans font-black uppercase tracking-wider text-[#141311] dark:text-zinc-200 block mb-1.5">
                  QTY
                </label>

                <div className={`rounded-2xl border-[1.5px] flex items-center overflow-hidden shadow-2xs transition-all ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-700 text-white'
                    : 'bg-white border-[#DCD1B7] text-[#141311]'
                }`}>
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-20 py-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 font-mono font-bold text-xs text-zinc-700 dark:text-zinc-200 border-r border-[#DCD1B7] dark:border-zinc-700 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                  >
                    -1
                  </button>
                  <div className="flex-1 py-3 text-center font-mono font-black text-sm text-[#141311] dark:text-white">
                    {quantity}
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="w-20 py-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 font-mono font-bold text-xs text-zinc-700 dark:text-zinc-200 border-l border-[#DCD1B7] dark:border-zinc-700 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                  >
                    +1
                  </button>
                </div>
              </div>

              {/* Action Button: + ADD TO DRAFT BILL (Emerald green full width button) */}
              <button
                type="button"
                onClick={handleAddToDraftBill}
                className="w-full py-4 px-6 rounded-2xl bg-[#00875A] hover:bg-[#00744d] text-white font-sans font-black text-xs sm:text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm active:scale-98 cursor-pointer transition-all"
              >
                <Plus size={18} className="stroke-[3]" />
                <span>ADD TO DRAFT BILL</span>
              </button>

              {/* Quick view draft bill button if items exist */}
              {draftItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('draft_bill');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full mt-3 py-3 px-4 rounded-2xl border-[1.5px] border-emerald-300 dark:border-emerald-700/60 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 font-sans font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-2xs"
                >
                  <Receipt size={16} className="text-[#00875A]" />
                  <span>View Draft Bill ({draftItems.length} items • ₹{grossSubtotal}) →</span>
                </button>
              )}
            </div>

          </div>

          {/* 2. LOWER CARD: GENERATED INVOICE HISTORY LOGS (SHOW ONLY LAST 5 BY DEFAULT + TODAY & PARTICULAR DATE CHOICES) */}
          <div className={`rounded-[36px] p-6 sm:p-7 border-[1.5px] shadow-2xs transition-all ${
            isDark 
              ? 'bg-zinc-900 border-zinc-700 text-white' 
              : 'bg-white border-[#E5DEC9] text-[#141311]'
          }`}>
            
            {/* Header: Purple squircle document icon + Title + Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] dark:bg-indigo-950/60 border border-[#D0E1FD] dark:border-indigo-800 flex items-center justify-center text-[#4F46E5] shrink-0 mt-0.5">
                  <FileText size={16} className="stroke-[2.2]" />
                </div>

                <div>
                  <h3 className="font-sans font-black text-xs sm:text-sm tracking-tight uppercase leading-snug text-[#141311] dark:text-white">
                    GENERATED INVOICE HISTORY LOGS
                  </h3>
                  <p className="font-mono text-[10px] sm:text-[10.5px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {historyFilterMode === 'today' && `SHOWING TODAY'S INVOICES (${filteredHistoryInvoices.length} FOUND)`}
                    {historyFilterMode === 'date' && `SHOWING INVOICES FOR ${formatHeaderDate(selectedHistoryDate)} (${filteredHistoryInvoices.length} FOUND)`}
                    {historyFilterMode === 'default' && 'LIVE HISTORY OF ALL LOCAL AND CLOUD INVOICES'}
                  </p>
                </div>
              </div>

              {/* Filter Tabs: Today, Particular Date (Defaults to showing last 5 invoices) */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 self-start sm:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => setHistoryFilterMode(prev => prev === 'today' ? 'default' : 'today')}
                  className={`px-3 py-1.5 rounded-xl font-sans font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    historyFilterMode === 'today'
                      ? 'bg-[#141311] text-white dark:bg-amber-400 dark:text-zinc-950 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                  title={historyFilterMode === 'today' ? 'Click to show recent invoices' : "Show today's invoices"}
                >
                  <Calendar size={12} />
                  <span>Today</span>
                  {historyFilterMode === 'today' && <X size={11} className="ml-0.5 opacity-80" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (historyFilterMode === 'date') {
                      setIsHistoryCalendarOpen(prev => !prev);
                    } else {
                      setHistoryFilterMode('date');
                      setIsHistoryCalendarOpen(true);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl font-sans font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    historyFilterMode === 'date'
                      ? 'bg-[#141311] text-white dark:bg-amber-400 dark:text-zinc-950 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                  title={historyFilterMode === 'date' ? 'Click to open or close calendar' : 'Choose particular date'}
                >
                  <Calendar size={12} />
                  <span>{historyFilterMode === 'date' ? formatHeaderDate(selectedHistoryDate) : 'Particular Date'}</span>
                  {historyFilterMode === 'date' && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setHistoryFilterMode('default');
                        setIsHistoryCalendarOpen(false);
                      }}
                      className="ml-0.5 p-0.5 hover:bg-white/20 dark:hover:bg-black/20 rounded-md transition-colors"
                      title="Reset to default 5 invoices"
                    >
                      <X size={11} />
                    </span>
                  )}
                </button>

                {historyFilterMode !== 'default' && (
                  <button
                    type="button"
                    onClick={() => {
                      setHistoryFilterMode('default');
                      setIsHistoryCalendarOpen(false);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-sans font-bold text-[10.5px] uppercase tracking-wider cursor-pointer transition-all"
                    title="Reset to default 5 invoices"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Particular Date Selector & Interactive Highlighted Calendar */}
            {historyFilterMode === 'date' && (
              <div className="mt-3.5 p-3.5 sm:p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/40 dark:bg-indigo-950/25 space-y-3">
                {/* Active Date Bar + Small Calendar Icon Button to toggle calendar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-sans font-black uppercase tracking-wide text-indigo-950 dark:text-indigo-200">
                      Active Date:
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-[#5046E5] text-white text-xs font-mono font-bold shadow-2xs">
                      {formatHeaderDate(selectedHistoryDate)}
                    </span>
                    <span className="text-[11px] font-mono text-indigo-900 dark:text-indigo-300 font-medium">
                      ({filteredHistoryInvoices.length} bill{filteredHistoryInvoices.length === 1 ? '' : 's'} recorded)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Small Calendar Icon Button to select particular date */}
                    <button
                      type="button"
                      onClick={() => setIsHistoryCalendarOpen(prev => !prev)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                      title="Toggle calendar to pick date"
                    >
                      <Calendar size={13} className="text-[#5046E5] dark:text-indigo-400" />
                      <span>{isHistoryCalendarOpen ? 'Hide Calendar' : 'Select Date'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setHistoryFilterMode('default');
                        setIsHistoryCalendarOpen(false);
                      }}
                      className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-sans font-bold cursor-pointer transition-all"
                      title="Back to default 5 invoices"
                    >
                      Back to Last 5
                    </button>
                  </div>
                </div>

                {/* Highlighted Calendar Grid to show dates with bills */}
                {isHistoryCalendarOpen && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-800/80 shadow-xs max-w-md mx-auto sm:mx-0">
                    {/* Month Navigator Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 flex items-center justify-center text-[#5046E5] dark:text-indigo-400">
                          <Calendar size={13} />
                        </div>
                        <h4 className="font-sans font-black text-xs uppercase tracking-wider text-zinc-900 dark:text-white">
                          {calendarData.monthTitle}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCalendarViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
                          title="Previous Month"
                        >
                          <ChevronLeft size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const now = new Date();
                            setCalendarViewDate(now);
                            setSelectedHistoryDate(todayDateKey);
                            setHistoryFilterMode('date');
                          }}
                          className="px-2 py-1 rounded-lg text-[10.5px] font-sans font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 cursor-pointer"
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => setCalendarViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
                          title="Next Month"
                        >
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Weekday Names */}
                    <div className="grid grid-cols-7 gap-1 text-center py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      <span>Su</span>
                      <span>Mo</span>
                      <span>Tu</span>
                      <span>We</span>
                      <span>Th</span>
                      <span>Fr</span>
                      <span>Sa</span>
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {/* Empty spaces before day 1 */}
                      {Array.from({ length: calendarData.firstDayIndex }).map((_, idx) => (
                        <div key={`empty-${idx}`} className="h-9" />
                      ))}

                      {/* Day cells with highlight for dates with bills */}
                      {calendarData.days.map((day) => {
                        return (
                          <button
                            key={day.dateKey}
                            type="button"
                            onClick={() => {
                              setSelectedHistoryDate(day.dateKey);
                              setHistoryFilterMode('date');
                            }}
                            className={`h-9 rounded-xl text-xs font-mono transition-all relative flex flex-col items-center justify-center cursor-pointer ${
                              day.isSelected
                                ? 'bg-[#5046E5] text-white font-black shadow-sm ring-2 ring-indigo-400/50'
                                : day.hasBills
                                ? 'bg-indigo-50 dark:bg-indigo-950/70 border-2 border-[#5046E5] text-[#5046E5] dark:text-indigo-300 font-extrabold shadow-2xs hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                                : day.isToday
                                ? 'border border-amber-400 text-zinc-900 dark:text-white font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium'
                            }`}
                            title={
                              day.hasBills 
                                ? `${formatHeaderDate(day.dateKey)}: ${day.billsCount} invoice${day.billsCount === 1 ? '' : 's'}` 
                                : formatHeaderDate(day.dateKey)
                            }
                          >
                            <span>{day.dayNumber}</span>
                            {/* Dot indicator for dates with bills */}
                            {day.hasBills && (
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  day.isSelected ? 'bg-white' : 'bg-[#5046E5] dark:bg-indigo-400'
                                }`}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Calendar Footer with Legend */}
                    <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10.5px]">
                      <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                        <span className="w-2.5 h-2.5 rounded-md border border-[#5046E5] bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                          <span className="w-1 h-1 rounded-full bg-[#5046E5]" />
                        </span>
                        <span className="font-sans font-medium">Dates with bills highlighted</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsHistoryCalendarOpen(false)}
                        className="font-sans font-bold text-[#5046E5] dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="border-b border-[#F0EBE0] dark:border-zinc-800 my-4" />

            {/* Empty State when no invoices match the selected date or today */}
            {filteredHistoryInvoices.length === 0 ? (
              <div className="py-10 text-center space-y-3 bg-zinc-50/50 dark:bg-zinc-950/40 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 my-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                  <Calendar size={22} />
                </div>
                <div>
                  <p className="text-xs font-sans font-bold text-[#141311] dark:text-white">
                    No invoices found {historyFilterMode === 'today' ? 'for today' : `for ${formatHeaderDate(selectedHistoryDate)}`}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">
                    No billing records exist for this selected date.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setHistoryFilterMode('default')}
                    className="px-3.5 py-1.5 rounded-xl bg-[#141311] dark:bg-zinc-800 text-white text-xs font-sans font-bold cursor-pointer hover:bg-zinc-800 shadow-2xs"
                  >
                    Back to Recent Invoices
                  </button>
                </div>
              </div>
            ) : (
              /* List of Invoices with #PF- ID, date/time, mobile, amount and purple [ VIEW INVOICE ] button */
              <div className="space-y-4">
                {filteredHistoryInvoices.map((inv, idx) => {
                  const timeStr = inv.createdAt 
                    ? new Date(inv.createdAt).toLocaleString('en-IN', { 
                        day: 'numeric', 
                        month: 'numeric', 
                        year: 'numeric', 
                        hour: 'numeric', 
                        minute: 'numeric', 
                        second: 'numeric', 
                        hour12: true 
                      }).toLowerCase()
                    : '10/9/2026, 12:51:32 pm';

                  const invoiceCode = formatInvoiceNumber(inv.id, inv.createdAt);

                  return (
                    <div 
                      key={`inv-item-${inv.id || 'inv'}-${idx}`}
                      className="pb-4 border-b border-[#F0EBE0] dark:border-zinc-800 last:border-b-0 last:pb-0"
                    >
                      {/* Line 1: #PF-26091001 10/9/2026, 12:51:32 pm */}
                      <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
                        <span className="font-black text-[#141311] dark:text-white">
                          {invoiceCode}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-normal">
                          {timeStr}
                        </span>
                      </div>

                      {/* Line 2: MOBILE: 9511244447 */}
                      {inv.customerMobile && inv.customerMobile !== 'Walk-in' && (
                        <div className="font-mono text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
                          MOBILE: {inv.customerMobile}
                        </div>
                      )}

                      {/* Line 3: ₹305 on left, [ VIEW INVOICE ] on right */}
                      <div className="flex items-center justify-between gap-3 mt-2">
                        <span className="font-mono font-black text-lg sm:text-xl text-[#141311] dark:text-white">
                          ₹{inv.totalAmount}
                        </span>

                        <button
                          type="button"
                          onClick={() => setViewingOrder(inv)}
                          className="px-4 py-2.5 rounded-xl bg-[#5046E5] hover:bg-[#4338CA] active:scale-95 text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                        >
                          <FileText size={13} className="stroke-[2.5]" />
                          <span>VIEW INVOICE</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Floating Action Button at bottom right matching reference screenshot (Scroll to top) */}
          <div className="fixed bottom-6 right-6 z-40">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-12 h-12 rounded-full bg-[#141311] text-white flex items-center justify-center shadow-2xl border border-white/20 active:scale-90 cursor-pointer hover:bg-black transition-all"
              title="Scroll to Top"
            >
              <ArrowUp size={20} className="stroke-[2.5]" />
            </button>
          </div>

        </div>
        )
      ) : (
        /* --- REFUND & RETURN DESK VIEW --- */
        <div className={`rounded-[36px] p-6 sm:p-7 border-[1.5px] shadow-2xs transition-all space-y-5 ${
          isDark 
            ? 'bg-zinc-900 border-zinc-700 text-white' 
            : 'bg-white border-[#E5DEC9] text-[#141311]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 shrink-0">
              <RotateCcw size={18} />
            </div>
            <div>
              <h3 className="font-sans font-black text-sm uppercase text-[#141311] dark:text-white leading-tight">
                REFUND & RETURNS DESK
              </h3>
              <p className="text-[11px] font-mono text-zinc-500">
                Search past bills to process footwear return or exchange.
              </p>
            </div>
          </div>

          {/* Search input */}
          <div className={`rounded-2xl border-[1.5px] px-3.5 py-2.5 flex items-center gap-2.5 ${
            isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-[#141311]'
          }`}>
            <Search size={16} className="text-zinc-400 shrink-0" />
            <input
              type="text"
              value={returnSearchQuery}
              onChange={(e) => setReturnSearchQuery(e.target.value)}
              placeholder="Search Bill ID or Mobile..."
              className="bg-transparent border-none outline-none w-full font-mono text-xs sm:text-[13px] text-[#141311] dark:text-white placeholder:text-zinc-400"
            />
          </div>

          {/* Orders list */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {returnOrdersList.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-500 border border-dashed rounded-2xl border-zinc-200 dark:border-zinc-800">
                No matching past invoices found.
              </div>
            ) : (
              returnOrdersList.map(order => (
                <div
                  key={order.id}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2 ${
                    isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-[#FAF8F5] border-[#E8DFC2]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-mono font-bold text-xs text-[#BFA05D]">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-600 dark:text-zinc-300">
                        {order.customerName || 'Walk-in'} • {order.customerMobile}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-xs text-emerald-600 block">
                        ₹{order.totalAmount}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-zinc-500 border-t pt-1.5 border-zinc-200 dark:border-zinc-800">
                    {(order.items || []).map((it, i) => (
                      <div key={i}>
                        • {it.name} (UK {it.size}) x{it.quantity}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOrderForReturn(order)}
                    className="w-full py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 font-mono font-bold text-[11px] uppercase flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                  >
                    <RotateCcw size={12} />
                    <span>Process Return / Restock</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Return Confirmation Modal */}
      {selectedOrderForReturn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border ${
            isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-rose-600">
                <RotateCcw size={18} />
                <h4 className="font-black text-sm uppercase">Confirm Return & Restock</h4>
              </div>
              <button onClick={() => setSelectedOrderForReturn(null)} className="p-1 rounded text-zinc-400 hover:text-zinc-600 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="text-xs space-y-2 font-mono">
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 space-y-1">
                <div>Bill ID: <span className="font-bold text-[#BFA05D]">#{selectedOrderForReturn.id.slice(0, 8).toUpperCase()}</span></div>
                <div>Customer: <span className="font-bold">{selectedOrderForReturn.customerName}</span></div>
                <div>Amount to Refund: <span className="font-bold text-emerald-600">₹{selectedOrderForReturn.totalAmount}</span></div>
              </div>

              <div>
                <label className="text-[10.5px] font-bold uppercase text-zinc-500 block mb-1">Reason for Return:</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-zinc-900'
                  }`}
                >
                  <option value="Size mismatch / Fitting issue">Size mismatch / Fitting issue</option>
                  <option value="Customer preferred different footwear">Customer preferred different footwear</option>
                  <option value="Defective / Manufacturing flaw">Defective / Manufacturing flaw</option>
                  <option value="Full cash refund requested">Full cash refund requested</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedOrderForReturn(null)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 font-bold text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleProcessRefund(selectedOrderForReturn)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check size={14} className="stroke-[3]" />
                <span>Confirm</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MAKE FINAL BILL MODAL */}
      {isFinalBillModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto">
          <div className={`w-full max-w-lg rounded-3xl shadow-2xl border p-5 sm:p-6 my-auto transition-all ${
            isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Receipt size={18} />
                </div>
                <div>
                  <h3 className="font-sans font-black text-sm uppercase tracking-wider">
                    Make Final Bill
                  </h3>
                  <p className="text-[11px] font-sans text-zinc-500">
                    Preview items, select payment & finalize receipt
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFinalBillModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 my-4 max-h-[68vh] overflow-y-auto pr-1 no-scrollbar">
              {/* Item Preview List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-sans font-black uppercase tracking-wider text-zinc-500">
                    Preview Items ({draftItems.length} {draftItems.length === 1 ? 'item' : 'items'})
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {draftItems.reduce((acc, i) => acc + i.quantity, 0)} Total Pairs
                  </span>
                </div>

                <div className="space-y-2 max-h-44 overflow-y-auto p-1">
                  {draftItems.map((it, idx) => {
                    const itPrice = typeof it.customPrice === 'number' ? it.customPrice : it.product.price;
                    const thumbUrl = it.product.imageUrl || (it.product.imageUrls && it.product.imageUrls[0]);
                    return (
                      <div
                        key={`${it.product.id}-${it.size}-${it.color}-${idx}`}
                        className={`p-2.5 rounded-2xl border flex items-center justify-between gap-3 ${
                          isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-zinc-50/80 border-zinc-200'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 shrink-0 overflow-hidden flex items-center justify-center border border-zinc-300 dark:border-zinc-700">
                          {thumbUrl ? (
                            <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package size={16} className="text-zinc-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-sans font-black text-xs text-[#141311] dark:text-white">
                              {it.product.name}
                            </span>
                            {it.product.brand && (
                              <span className="px-1.5 py-0.2 rounded bg-zinc-200/80 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-mono text-[9px] uppercase font-bold">
                                {it.product.brand}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[10.5px] font-mono text-zinc-600 dark:text-zinc-300 flex-wrap">
                            <span className="font-bold text-indigo-700 dark:text-indigo-400">
                              Art: {it.product.articleCode || it.product.rawArticleCode || it.product.id}
                            </span>
                            <span>•</span>
                            <span className="font-bold text-amber-700 dark:text-amber-400">
                              UK {it.size}
                            </span>
                            {it.color && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <span 
                                    className="w-2 h-2 rounded-full border border-black/20" 
                                    style={{ backgroundColor: it.color.toLowerCase() }} 
                                  />
                                  <span>{it.color}</span>
                                </span>
                              </>
                            )}
                            <span>•</span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">
                              ₹{itPrice}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-xl overflow-hidden shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setDraftItems(prev => {
                                if (prev[idx]?.quantity > 1) {
                                  return prev.map((item, i) => 
                                    i === idx ? { ...item, quantity: item.quantity - 1 } : item
                                  );
                                } else {
                                  return prev.filter((_, i) => i !== idx);
                                }
                              });
                            }}
                            className="px-2 py-1 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-mono font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 py-1 text-xs font-mono font-black min-w-[24px] text-center">
                            {it.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setDraftItems(prev => prev.map((item, i) => 
                                i === idx ? { ...item, quantity: item.quantity + 1 } : item
                              ));
                            }}
                            className="px-2 py-1 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-mono font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <div className="font-mono font-black text-xs text-emerald-600 shrink-0 min-w-[50px] text-right">
                          ₹{itPrice * it.quantity}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method Selection: CASH, UPI, CASH + UPI (Directly redirect/selected after added products) */}
              <div id="payment-method-selector" className="scroll-mt-4 pt-1">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-sans font-black uppercase tracking-wider text-[#141311] dark:text-white flex items-center gap-1.5">
                    <CreditCard size={14} className="text-[#FFA000]" />
                    <span>SELECT PAYMENT METHOD</span>
                  </label>
                  <span className="text-[10px] font-mono text-zinc-500">Pick payment mode</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { mode: 'CASH' as const, label: 'CASH', icon: Coins },
                    { mode: 'UPI' as const, label: 'UPI', icon: Smartphone },
                    { mode: 'CASH + UPI' as const, label: 'CASH + UPI', icon: Layers }
                  ].map(pm => {
                    const Icon = pm.icon;
                    const isSel = paymentMethod === pm.mode;
                    return (
                      <button
                        key={pm.mode}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(pm.mode);
                          if (pm.mode === 'CASH + UPI') {
                            const half = Math.floor(netPayable / 2);
                            setSplitCashAmount(half);
                            setSplitUpiAmount(netPayable - half);
                          }
                        }}
                        className={`py-3 px-2 rounded-2xl border text-xs font-mono font-black uppercase flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs ${
                          isSel
                            ? 'bg-[#141311] text-white border-[#141311] ring-2 ring-[#FFA000]'
                            : isDark
                            ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                            : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{pm.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sub-panels for each payment method */}
                {paymentMethod === 'CASH' && (
                  <div className="mt-3 p-3 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/30 text-xs font-sans text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <Coins size={18} className="text-amber-600 shrink-0" />
                    <span>Customer pays exact <strong>₹{netPayable}</strong> in cash at the billing counter.</span>
                  </div>
                )}

                {paymentMethod === 'UPI' && (
                  <div className="mt-3 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-xs font-sans text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                    <Smartphone size={18} className="text-emerald-600 shrink-0" />
                    <span>Customer scans store QR code to pay exact ₹{netPayable} via PhonePe / GPay / Paytm / UPI.</span>
                  </div>
                )}

                {paymentMethod === 'CASH + UPI' && (
                  <div className="mt-3 p-3 rounded-2xl border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30 space-y-2.5">
                    <div className="text-[11px] font-sans font-bold text-amber-900 dark:text-amber-200">
                      Split Payment (Cash + UPI):
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase block mb-1">
                          Cash Amount (₹):
                        </label>
                        <input
                          type="number"
                          value={splitCashAmount}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Number(e.target.value);
                            setSplitCashAmount(val);
                            if (val === '') {
                              setSplitUpiAmount(netPayable);
                            } else {
                              setSplitUpiAmount(Math.max(0, netPayable - val));
                            }
                          }}
                          placeholder="e.g. 200"
                          className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2 text-xs font-mono font-bold outline-none text-[#141311] dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase block mb-1">
                          UPI Amount (₹):
                        </label>
                        <input
                          type="number"
                          value={splitUpiAmount}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Number(e.target.value);
                            setSplitUpiAmount(val);
                            if (val === '') {
                              setSplitCashAmount(netPayable);
                            } else {
                              setSplitCashAmount(Math.max(0, netPayable - val));
                            }
                          }}
                          placeholder="e.g. 189"
                          className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2 text-xs font-mono font-bold outline-none text-[#141311] dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-[11px] font-mono font-bold">
                      <span className="text-zinc-600 dark:text-zinc-300">
                        Cash ₹{splitCashAmount || 0} + UPI ₹{splitUpiAmount || 0}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md ${
                        Number(splitCashAmount || 0) + Number(splitUpiAmount || 0) === netPayable
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}>
                        Total: ₹{Number(splitCashAmount || 0) + Number(splitUpiAmount || 0)} / ₹{netPayable}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Info Section (Optional WhatsApp for automated link) */}
              <div className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-amber-50/30 dark:bg-zinc-950/40 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10.5px] font-sans font-bold uppercase text-zinc-600 dark:text-zinc-300 flex items-center gap-1 mb-1">
                      <User size={12} /> Customer Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahul Patil (or leave blank for Walk-in)"
                      className={`w-full p-2 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-[#141311]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-sans font-bold uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mb-1">
                      <MessageSquare size={12} /> Customer WhatsApp No (Optional)
                    </label>
                    <input
                      type="tel"
                      value={customerWhatsapp}
                      onChange={(e) => setCustomerWhatsapp(e.target.value)}
                      placeholder="e.g. 9876543210 (Optional)"
                      className={`w-full p-2 rounded-xl border text-xs outline-none font-mono ${
                        isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-[#141311]'
                      }`}
                    />
                  </div>
                </div>

                <div className="text-[10.5px] font-sans text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                  <span>
                    When customer WhatsApp number is provided, the invoice link & details will automatically send to WhatsApp when you click Done. If not provided, invoice receipt will generate directly on screen.
                  </span>
                </div>
              </div>

              {/* Bill Totals & Discount */}
              <div className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="text-zinc-500">Gross Subtotal:</span>
                  <span className="font-mono font-bold">₹{grossSubtotal}</span>
                </div>

                {/* Optional Discount */}
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="text-zinc-500">Discount:</span>
                  <div className="flex items-center gap-1.5">
                    {[0, 5, 10].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDiscountPercent(pct)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all ${
                          discountPercent === pct
                            ? 'bg-[#141311] text-white'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                    {discountAmount > 0 && (
                      <span className="font-mono font-bold text-rose-500 text-xs ml-1">
                        -₹{discountAmount}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span className="font-sans font-black text-xs uppercase text-[#141311] dark:text-white">
                    Net Payable Amount:
                  </span>
                  <span className="font-mono font-black text-xl text-emerald-600 dark:text-emerald-400">
                    ₹{netPayable}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center gap-2.5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setIsFinalBillModalOpen(false);
                  handleAddNewArticle();
                }}
                className="py-3 px-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-sans font-bold text-xs uppercase cursor-pointer text-zinc-600 dark:text-zinc-300 active:scale-95 transition-all"
              >
                + Add New Article
              </button>

              <button
                type="button"
                onClick={handleCompleteBill}
                disabled={isCheckingOut || draftItems.length === 0}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#00875A] hover:bg-[#00744d] text-white font-sans font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-98 cursor-pointer transition-all disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Check size={18} className="stroke-[3]" />
                )}
                <span>Done & Generate Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viewing / Tax Invoice Receipt Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white text-zinc-950 w-full max-w-sm rounded-3xl shadow-2xl p-6 border border-zinc-200 font-mono text-xs my-auto">
            <div className="flex items-center justify-between border-b pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Printer size={16} className="text-[#4F46E5]" />
                <span className="font-bold text-sm">Tax Invoice Receipt</span>
              </div>
              <button 
                type="button"
                onClick={() => setViewingOrder(null)}
                className="p-1 hover:bg-zinc-100 rounded-lg cursor-pointer text-zinc-400 hover:text-zinc-700"
              >
                <X size={17} />
              </button>
            </div>

            <div className="text-center py-2">
              <div className="font-black text-base font-serif tracking-tight">PRASHANT FOOTWEAR</div>
              <div className="text-[11px] text-zinc-500">Retail Footwear & Wholesale Hub</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">GST: 27AABCP1234F1Z5 • Sangamner</div>
            </div>

            <div className="border-t border-b border-dashed py-2 my-2 space-y-1">
              <div className="flex justify-between">
                <span>Invoice:</span>
                <span className="font-bold text-[#141311] font-mono">
                  {formatInvoiceNumber(viewingOrder.id, viewingOrder.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span>{new Date(viewingOrder.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{viewingOrder.customerName || 'Walk-in'} ({viewingOrder.customerMobile || 'Direct'})</span>
              </div>
            </div>

            {/* Purchased Items List with Small Product Thumbnails */}
            <div className="space-y-2 my-2.5 max-h-48 overflow-y-auto pr-0.5">
              {(viewingOrder.items || []).map((it, idx) => {
                const matchedProd = products.find(p => p.id === it.productId || p.name === it.name);
                const thumbUrl = (it as any).imageUrl || matchedProd?.imageUrl || (matchedProd?.imageUrls && matchedProd.imageUrls[0]);
                return (
                  <div key={idx} className="flex items-center justify-between text-[11px] gap-2 p-1.5 rounded-xl bg-zinc-50 border border-zinc-100">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-zinc-200 border border-zinc-300 shrink-0 overflow-hidden flex items-center justify-center">
                        {thumbUrl ? (
                          <img src={thumbUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Package size={13} className="text-zinc-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-bold text-zinc-900">{it.name}</div>
                        <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 font-mono">
                          <span>UK {it.size}</span>
                          {(it as any).color && <span>• {(it as any).color}</span>}
                          <span>• {it.quantity}x ₹{it.price}</span>
                        </div>
                      </div>
                    </div>
                    <span className="font-black text-xs font-mono shrink-0">₹{it.price * it.quantity}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-dashed pt-2.5 mt-2.5 space-y-1 font-bold">
              <div className="flex justify-between text-base">
                <span>TOTAL AMOUNT:</span>
                <span className="text-[#00875A]">₹{viewingOrder.totalAmount}</span>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>Payment Mode:</span>
                <span className="uppercase">{viewingOrder.paymentMethod || 'CASH'}</span>
              </div>
            </div>

            {/* WhatsApp notification status if mobile was provided */}
            {viewingOrder.customerMobile && viewingOrder.customerMobile.replace(/\D/g, '').length >= 10 && (
              <div className="mt-3 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[10.5px] font-sans text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>Invoice was sent automatically to WhatsApp (+91 {viewingOrder.customerMobile})!</span>
              </div>
            )}

            {/* Quick send / re-send to WhatsApp input */}
            <div className="mt-3 pt-3 border-t border-dashed border-zinc-200 space-y-2">
              <div className="flex items-center gap-1.5">
                <input
                  type="tel"
                  defaultValue={viewingOrder.customerMobile !== 'Walk-in' && viewingOrder.customerMobile !== 'Direct' ? viewingOrder.customerMobile : ''}
                  onChange={(e) => setReceiptWhatsappInput(e.target.value)}
                  placeholder="Enter WhatsApp No (e.g. 9876543210)"
                  className="flex-1 p-2 rounded-xl border border-zinc-300 font-mono text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const phoneToUse = receiptWhatsappInput.trim() || (viewingOrder.customerMobile !== 'Walk-in' ? viewingOrder.customerMobile : '');
                    triggerSendWhatsApp(viewingOrder, phoneToUse);
                  }}
                  className="py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-sans font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                  title="Send to WhatsApp"
                >
                  <Send size={13} />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Modal Bottom Buttons: Print Invoice & Close */}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-2xl bg-[#141311] hover:bg-zinc-800 text-white font-sans font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                <Printer size={15} />
                <span>Print Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="py-3 px-5 rounded-2xl border border-zinc-200 hover:bg-zinc-50 font-sans font-black text-xs uppercase cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAST POS ENTRY Modal */}
      {isFastPosOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 border ${
            isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Barcode size={18} className="text-[#E58A13]" />
                <h4 className="font-black text-sm uppercase">Fast POS Scanner & Entry</h4>
              </div>
              <button onClick={() => setIsFastPosOpen(false)} className="p-1 rounded text-zinc-400 hover:text-zinc-600 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono font-bold text-zinc-500 block">
                Scan Barcode or Type Article Code:
              </label>
              <div className={`rounded-xl border-[1.5px] px-3 py-2 flex items-center gap-2 ${
                isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-300'
              }`}>
                <Search size={15} className="text-zinc-400" />
                <input
                  type="text"
                  autoFocus
                  value={fastBarcodeScan}
                  onChange={(e) => setFastBarcodeScan(e.target.value)}
                  placeholder="Scan barcode or type code..."
                  className="bg-transparent border-none outline-none w-full font-mono text-xs text-[#141311] dark:text-white"
                />
              </div>

              {/* Quick Pick Products */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                  Quick Select Articles:
                </span>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                  {products.slice(0, 8).map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        handleSelectProduct(p);
                        setIsFastPosOpen(false);
                      }}
                      className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                        isDark ? 'bg-zinc-800/60 border-zinc-700 hover:border-[#BFA05D]' : 'bg-white border-zinc-200 hover:border-[#BFA05D]'
                      }`}
                    >
                      <div className="font-bold text-[11px] truncate">{p.name}</div>
                      <div className="text-[9.5px] font-mono text-[#E58A13]">₹{p.price}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsFastPosOpen(false)}
              className="w-full py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 font-mono text-xs font-bold uppercase cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
