import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  QrCode, Package, ShoppingCart, PlusCircle, CheckCircle, AlertTriangle, 
  Trash2, Plus, Minus, FileText, Printer, ArrowLeft, Check, Sparkles, X
} from 'lucide-react';
import { Product, Category, SubCategory } from '../types';
import { Html5Qrcode } from 'html5-qrcode';

interface BarcodeScanWorkspaceProps {
  products: Product[];
  isDark: boolean;
  billingItems: { product: Product; size: number; colorId?: number; quantity: number }[];
  setBillingItems: React.Dispatch<React.SetStateAction<{ product: Product; size: number; colorId?: number; quantity: number }[]>>;
  addProduct: (payload: any) => Promise<{ success: boolean; id?: string; error?: string }>;
  updateProduct: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  createOrder: (order: any) => Promise<{ success: boolean; id?: string; error?: string }>;
  initialScanMode?: 'make-bill' | 'add-product';
  autoStartCamera?: boolean;
  onBack: () => void;
  adminCameraPermission?: 'pending' | 'granted' | 'denied';
  onRequestCameraPermission?: () => void;
}

// Synthesize pleasant success sound
const playScanSuccessBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, audioCtx.currentTime);
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.18);
  } catch (e) {
    console.warn("Beep failed", e);
  }
};

// Synthesize alert warning sound
const playScanErrorBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  } catch (e) {
    console.warn("Beep failed", e);
  }
};

const BRAND_TO_CODE: Record<string, string> = {
  'Walkaroo': 'WL',
  'Walkmate': 'WAL',
  'Bairathi': 'BAR',
  'Paragon': 'PAR',
  'Indus': 'IND',
  'Yono': 'YO'
};

const CODE_TO_BRAND: Record<string, string> = {
  'WL': 'Walkaroo',
  'WAL': 'Walkmate',
  'BAR': 'Bairathi',
  'PAR': 'Paragon',
  'IND': 'Indus',
  'YO': 'Yono'
};

export const BarcodeScanWorkspace: React.FC<BarcodeScanWorkspaceProps> = ({
  products,
  isDark,
  billingItems,
  setBillingItems,
  addProduct,
  updateProduct,
  createOrder,
  initialScanMode,
  autoStartCamera,
  onBack,
  adminCameraPermission = 'pending',
  onRequestCameraPermission
}) => {
  // Modes: 'make-bill' | 'add-product'
  const [scanMode, setScanMode] = useState<'make-bill' | 'add-product'>(initialScanMode || 'make-bill');
  const [scannedText, setScannedText] = useState('');
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [flashBeam, setFlashBeam] = useState(false);

  useEffect(() => {
    if (initialScanMode) {
      setScanMode(initialScanMode);
    }
  }, [initialScanMode]);

  useEffect(() => {
    if (autoStartCamera !== undefined) {
      if (autoStartCamera && adminCameraPermission === 'granted') {
        setIsCameraActive(true);
      }
    }
  }, [autoStartCamera, adminCameraPermission]);

  // Bill Mode Local States
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [billingQty, setBillingQty] = useState(1);
  const [fastBillingPayment, setFastBillingPayment] = useState('');
  const [fastBillingError, setFastBillingError] = useState<string | null>(null);
  const [isProcessingFastCheckout, setIsProcessingFastCheckout] = useState(false);
  const [billingSuccessReceipt, setBillingSuccessReceipt] = useState<any | null>(null);

  // Color helper functions for fast billing
  const getScanWorkspaceColorDef = (colorId: number, product?: any) => {
    const COLOR_REGISTRY: Record<number, { name: string; hex: string }> = {
      1: { name: 'Black', hex: '#18181b' },
      2: { name: 'Tan / Brown', hex: '#78350f' },
      3: { name: 'Navy Blue', hex: '#1e3a8a' },
      4: { name: 'White', hex: '#f8fafc' },
      5: { name: 'Grey / Slate', hex: '#64748b' },
      6: { name: 'Olive Green', hex: '#3f6212' },
      7: { name: 'Cherry / Red', hex: '#991b1b' },
      8: { name: 'Beige / Cream', hex: '#d97706' },
      9: { name: 'Mustard Yellow', hex: '#eab308' },
    };
    if (product && product.customColorMap && product.customColorMap[colorId]) {
      const c = product.customColorMap[colorId];
      return { name: c.name || `Color #${colorId}`, hex: c.hex || '#000000' };
    }
    return COLOR_REGISTRY[colorId] || { name: `Color #${colorId}`, hex: '#6366f1' };
  };

  const getAvailableColorsForScanProduct = (p: Product | null): number[] => {
    if (!p) return [];
    if (p.colors && p.colors.length > 0) {
      return p.colors;
    }
    const colorSet = new Set<number>();

    if (p.sizeColorStock && Object.keys(p.sizeColorStock).length > 0) {
      Object.values(p.sizeColorStock).forEach(sizeMap => {
        if (sizeMap) {
          Object.entries(sizeMap).forEach(([cidStr, qty]) => {
            if (Number(qty) > 0) {
              colorSet.add(Number(cidStr));
            }
          });
        }
      });
    }

    if (colorSet.size === 0 && p.sizeColorStock && Object.keys(p.sizeColorStock).length > 0) {
      Object.values(p.sizeColorStock).forEach(sizeMap => {
        if (sizeMap) {
          Object.keys(sizeMap).forEach(cidStr => {
            colorSet.add(Number(cidStr));
          });
        }
      });
    }

    if (colorSet.size === 0) return [1];
    return Array.from(colorSet);
  };

  const getAvailableSizesForScanProductAndColor = (p: Product | null, colorId: number | null): number[] => {
    if (!p) return [5, 6, 7, 8, 9, 10, 11, 12, 13];
    const cidStr = String(colorId || 1);

    if (p.sizeColorStock && Object.keys(p.sizeColorStock).length > 0) {
      const availableSizes: number[] = [];
      Object.entries(p.sizeColorStock).forEach(([sizeStr, colorMap]) => {
        if (colorMap) {
          const stockForColor = Number(colorMap[cidStr]) || 0;
          if (stockForColor > 0) {
            availableSizes.push(Number(sizeStr));
          }
        }
      });

      if (availableSizes.length > 0) {
        return availableSizes.sort((a, b) => a - b);
      }
    }

    if (p.sizeStock && Object.keys(p.sizeStock).length > 0) {
      const sizesWithStock = Object.entries(p.sizeStock)
        .filter(([_, qty]) => Number(qty) > 0)
        .map(([sStr]) => Number(sStr))
        .sort((a, b) => a - b);
      if (sizesWithStock.length > 0) return sizesWithStock;
    }

    if (p.sizes && p.sizes.length > 0) {
      return [...p.sizes].sort((a, b) => a - b);
    }

    return [5, 6, 7, 8, 9, 10, 11, 12, 13];
  };

  const matchedColors = useMemo(() => {
    return getAvailableColorsForScanProduct(matchedProduct);
  }, [matchedProduct]);

  useEffect(() => {
    if (matchedProduct && matchedColors.length > 0) {
      if (!selectedColor || !matchedColors.includes(selectedColor)) {
        setSelectedColor(matchedColors[0]);
      }
    } else {
      setSelectedColor(null);
    }
  }, [matchedProduct, matchedColors]);

  const matchedAvailableSizes = useMemo(() => {
    return getAvailableSizesForScanProductAndColor(matchedProduct, selectedColor);
  }, [matchedProduct, selectedColor]);

  useEffect(() => {
    if (matchedProduct && matchedAvailableSizes.length > 0) {
      if (!selectedSize || !matchedAvailableSizes.includes(selectedSize)) {
        setSelectedSize(matchedAvailableSizes[0]);
      }
    }
  }, [matchedProduct, selectedColor, matchedAvailableSizes]);

  // Register/Restock Mode Local States
  const [restockQty, setRestockQty] = useState(1);
  const [newPrice, setNewPrice] = useState<number | ''>('');
  
  // Register New Product Form States
  const [regBrand, setRegBrand] = useState('Walkaroo');
  const [regArticleCode, setRegArticleCode] = useState('');
  const [regName, setRegName] = useState('');
  const [regCategory, setRegCategory] = useState<Category>('Men');
  const [regSubCategory, setRegSubCategory] = useState<SubCategory>('Office Wear');
  const [regSizesStr, setRegSizesStr] = useState('6,7,8,9,10,11,12');
  const [regPrice, setRegPrice] = useState<number>(499);
  const [regStock, setRegStock] = useState<number>(24);
  const [regDescription, setRegDescription] = useState('');

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const [isCameraActive, setIsCameraActive] = useState((autoStartCamera && adminCameraPermission === 'granted') || false);
  const [isScanningForArticleCode, setIsScanningForArticleCode] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<{ code: string; time: number } | null>(null);

  // Maintain reference to the latest handler to prevent stale closures inside third-party async camera callbacks
  const handleCameraDecodedTextRef = useRef<(decodedText: string) => void>(() => {});

  // Camera scanned value callback handler
  const handleCameraDecodedText = (decodedText: string) => {
    const cleanText = decodedText.trim();
    if (!cleanText) return;

    // Duplicate detection check
    const now = Date.now();
    if (lastScanRef.current && lastScanRef.current.code === cleanText && (now - lastScanRef.current.time) < 2200) {
      return; // Cooldown to prevent multi-scanning the same shoe item in immediate frames
    }
    lastScanRef.current = { code: cleanText, time: now };

    setScannedText(cleanText);
    setFlashBeam(true);
    setTimeout(() => setFlashBeam(false), 300);

    setHasSearched(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isScanningForArticleCode) {
      playScanSuccessBeep();
      if (navigator.vibrate) {
        navigator.vibrate([100]);
      }
      
      let parsedBrand = regBrand;
      let parsedArticle = cleanText;

      if (cleanText.includes('-')) {
        const parts = cleanText.split('-');
        const prefix = parts[0].toUpperCase();
        if (CODE_TO_BRAND[prefix]) {
          parsedBrand = CODE_TO_BRAND[prefix];
          parsedArticle = parts.slice(1).join('-');
        }
      }

      setRegBrand(parsedBrand);
      setRegArticleCode(parsedArticle);
      setSuccessMessage(`Scanned successfully! Issued Article Code: "${parsedArticle}" for ${parsedBrand}`);
      setIsCameraActive(false);
      setIsScanningForArticleCode(false);
      return;
    }

    const found = products.find(p => 
      p.id.toLowerCase() === cleanText.toLowerCase() ||
      p.id.split('-').slice(1).join('-').toLowerCase() === cleanText.toLowerCase()
    );

    if (found) {
      playScanSuccessBeep();
      if (navigator.vibrate) {
        navigator.vibrate([100]);
      }
      setMatchedProduct(found);

      if (scanMode === 'make-bill') {
        // Direct automatic billing as requested by user!
        const sizeToAdd = selectedSize !== null ? selectedSize : (found.sizes && found.sizes.length > 0 ? found.sizes[0] : 7);
        
        setBillingItems(prev => {
          const existingIndex = prev.findIndex(
            item => item.product.id === found.id && item.size === sizeToAdd
          );

          if (existingIndex > -1) {
            return prev.map((item, i) => 
              i === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
            );
          } else {
            return [...prev, { product: found, size: sizeToAdd, quantity: 1 }];
          }
        });

        setSuccessMessage(`Directly Added: "${found.name}" (UK Size ${sizeToAdd}) to Draft Bill!`);
      } else {
        // Add/Edit mode
        setSelectedSize(found.sizes && found.sizes.length > 0 ? found.sizes[0] : null);
        setNewPrice(found.price);
        setRestockQty(1);
        setBillingQty(1);
        setSuccessMessage(`Product found: "${found.name}". Stock: ${found.stock} units.`);
        setIsCameraActive(false); // Stop camera to let them restock
      }
    } else {
      playScanErrorBeep();
      if (navigator.vibrate) {
        navigator.vibrate([100, 100]);
      }
      setMatchedProduct(null);

      if (scanMode === 'add-product') {
        // Auto prepopulate registry form
        let parsedBrand = 'Walkaroo';
        let parsedArticle = cleanText;

        if (cleanText.includes('-')) {
          const parts = cleanText.split('-');
          const prefix = parts[0].toUpperCase();
          if (CODE_TO_BRAND[prefix]) {
            parsedBrand = CODE_TO_BRAND[prefix];
            parsedArticle = parts.slice(1).join('-');
          }
        }
        setRegBrand(parsedBrand);
        setRegArticleCode(parsedArticle);
        setSuccessMessage(`New code detected! Prepared form for adding to database: ${cleanText}`);
        setIsCameraActive(false); // Stop camera to let them configure the fresh product
      } else {
        setErrorMessage(`Product code "${cleanText}" was not found in stock. Switch to "Add/Edit Product" to register it first.`);
      }
    }
  };

  handleCameraDecodedTextRef.current = handleCameraDecodedText;

  useEffect(() => {
    if (isCameraActive) {
      if (adminCameraPermission !== 'granted') {
        setIsCameraActive(false);
        if (onRequestCameraPermission) {
          onRequestCameraPermission();
        }
        return;
      }
      const html5QrCode = new Html5Qrcode("mobile-barcode-reader");
      html5QrCodeRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: (width, height) => {
            const boxWidth = Math.min(width * 0.85, 300);
            const boxHeight = Math.min(height * 0.45, 140);
            return {
              x: (width - boxWidth) / 2,
              y: (height - boxHeight) / 2,
              width: boxWidth,
              height: boxHeight
            };
          }
        },
        (decodedText) => {
          handleCameraDecodedTextRef.current(decodedText);
        },
        () => {
          // Silent frame read missed
        }
      ).catch(err => {
        console.error("Camera access failed", err);
        setErrorMessage("Could not launch camera scanner. Please grant camera permission or enter code manually.");
        setIsCameraActive(false);
      });
    }

    return () => {
      if (html5QrCodeRef.current) {
        const scanner = html5QrCodeRef.current;
        html5QrCodeRef.current = null;
        if (scanner.isScanning) {
          scanner.stop().catch(e => console.error("Error stopping camera", e));
        }
      }
    };
  }, [isCameraActive, scanMode, adminCameraPermission, onRequestCameraPermission]);

  // Keep input focused automatically
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [scanMode, billingSuccessReceipt]);

  // Handle Barcode Scanned Event (usually ends with Enter key)
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = scannedText.trim();
    if (!cleanText) return;

    setFlashBeam(true);
    setTimeout(() => setFlashBeam(false), 300);

    // Search product
    // Barcode can match exact product ID, or raw code, or case-insensitive contains
    const found = products.find(p => 
      p.id.toLowerCase() === cleanText.toLowerCase() ||
      p.id.split('-').slice(1).join('-').toLowerCase() === cleanText.toLowerCase()
    );

    setHasSearched(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (found) {
      playScanSuccessBeep();
      if (navigator.vibrate) {
        navigator.vibrate([100]);
      }
      setMatchedProduct(found);

      if (scanMode === 'make-bill') {
        // Direct automatic billing as requested by user!
        const sizeToAdd = selectedSize !== null ? selectedSize : (found.sizes && found.sizes.length > 0 ? found.sizes[0] : 7);
        
        setBillingItems(prev => {
          const existingIndex = prev.findIndex(
            item => item.product.id === found.id && item.size === sizeToAdd
          );

          if (existingIndex > -1) {
            return prev.map((item, i) => 
              i === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
            );
          } else {
            return [...prev, { product: found, size: sizeToAdd, quantity: 1 }];
          }
        });

        setSuccessMessage(`Directly Added: "${found.name}" (UK Size ${sizeToAdd}) to Draft Bill!`);
        // Reset the input immediately for subsequent scans!
        setScannedText('');
      } else {
        // Pre-populate fields for other modes
        setSelectedSize(found.sizes && found.sizes.length > 0 ? found.sizes[0] : null);
        setNewPrice(found.price);
        setRestockQty(1);
        setBillingQty(1);
        setSuccessMessage(`Product found: "${found.name}". Stock: ${found.stock} units.`);
      }
    } else {
      playScanErrorBeep();
      if (navigator.vibrate) {
        navigator.vibrate([100, 100]);
      }
      setMatchedProduct(null);

      // Try parsing scanned code for quick registration
      if (scanMode === 'add-product') {
        let parsedBrand = 'Walkaroo';
        let parsedArticle = cleanText;

        if (cleanText.includes('-')) {
          const parts = cleanText.split('-');
          const prefix = parts[0].toUpperCase();
          if (CODE_TO_BRAND[prefix]) {
            parsedBrand = CODE_TO_BRAND[prefix];
            parsedArticle = parts.slice(1).join('-');
          }
        }
        setRegBrand(parsedBrand);
        setRegArticleCode(parsedArticle);
        // Auto update product name
        const activeQuality = 'Premium';
        const activeType = 'Casual Wear';
        const parts = [parsedBrand, activeQuality, activeType, `for ${regCategory.toLowerCase()}`].filter(Boolean);
        const generatedName = parts.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        setRegName(generatedName);
        setSuccessMessage(`New code detected! Prepared form for adding to database: ${cleanText}`);
      } else {
        setErrorMessage(`Product code "${cleanText}" was not found in stock. Switch to "Add/Edit Product" to register it first.`);
      }
    }
  };

  // Fast registration name generator
  useEffect(() => {
    const activeQuality = 'Premium';
    const activeType = 'Casual Wear';
    const parts = [regBrand, activeQuality, activeType, `for ${regCategory.toLowerCase()}`].filter(Boolean);
    const generatedName = parts.join(' ')
      .split(/\s+/)
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    setRegName(generatedName);
  }, [regBrand, regCategory]);

  // Reset the scanner workstation
  const resetScanner = () => {
    setScannedText('');
    setMatchedProduct(null);
    setHasSearched(false);
    setErrorMessage(null);
    setSuccessMessage(null);
    setSelectedSize(null);
    setBillingQty(1);
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  // Add selected item to the draft bill
  const handleAddToBill = () => {
    if (!matchedProduct) return;
    if (selectedSize === null) {
      setErrorMessage('Please select a size first.');
      return;
    }

    // Add to parent billingItems
    const existingIndex = billingItems.findIndex(
      item => item.product.id === matchedProduct.id && 
              item.size === selectedSize && 
              item.colorId === (selectedColor || undefined)
    );

    if (existingIndex > -1) {
      setBillingItems(billingItems.map((item, i) => 
        i === existingIndex ? { ...item, quantity: item.quantity + billingQty } : item
      ));
    } else {
      setBillingItems([...billingItems, { 
        product: matchedProduct, 
        size: selectedSize, 
        colorId: selectedColor || undefined,
        quantity: billingQty 
      }]);
    }

    const colorDef = selectedColor ? getScanWorkspaceColorDef(selectedColor, matchedProduct) : null;
    setSuccessMessage(`Added ${billingQty}x of "${matchedProduct.name}" (UK ${selectedSize}${colorDef ? ` - ${colorDef.name}` : ''}) to Draft Bill!`);
    
    // Clear and focus next scan immediately
    setTimeout(() => {
      resetScanner();
    }, 1200);
  };

  // Complete fast checkout and make invoice
  const handleFastInvoiceCheckout = async () => {
    if (isProcessingFastCheckout) return;

    if (billingItems.length === 0) {
      setFastBillingError('Please add at least one product to the bill before checkout.');
      return;
    }

    if (!fastBillingPayment) {
      setFastBillingError('Please choose a Payment Option (Cash or UPI) to proceed.');
      return;
    }

    setFastBillingError(null);
    setIsProcessingFastCheckout(true);

    try {
      const orderItems = billingItems.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        category: item.product.category,
        subCategory: item.product.subCategory,
        price: item.product.price,
        quantity: item.quantity,
        size: item.size
      }));

      const totalAmount = billingItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

      const res = await createOrder({
        customerMobile: 'Walk-In',
        customerName: 'Walk-in Client',
        items: orderItems,
        totalAmount,
        paymentMethod: fastBillingPayment,
        status: 'completed'
      });

      if (res.success) {
        setBillingSuccessReceipt({
          id: res.id,
          items: orderItems,
          totalAmount,
          paymentMethod: fastBillingPayment,
          date: new Date().toLocaleString('en-IN')
        });
        // Clear draft billing items
        setBillingItems([]);
        setFastBillingPayment('');
      } else {
        setFastBillingError(res.error || 'Failed to process fast invoice checkout.');
      }
    } catch (err: any) {
      setFastBillingError(err?.message || 'Failed to process invoice checkout.');
    } finally {
      setIsProcessingFastCheckout(false);
    }
  };

  // Quick Restock & Price update from Scanner
  const handleQuickUpdateProduct = async () => {
    if (!matchedProduct) return;

    const finalPrice = newPrice === '' ? matchedProduct.price : Number(newPrice);
    const addedStock = Number(restockQty);
    const finalStock = matchedProduct.stock + addedStock;

    const res = await updateProduct(matchedProduct.id, {
      price: finalPrice,
      stock: finalStock
    });

    if (res.success) {
      setSuccessMessage(`Successfully updated inventory for ${matchedProduct.name}! New Stock: ${finalStock} units, New Price: ₹${finalPrice}`);
      // Refresh current matched product view
      setMatchedProduct({
        ...matchedProduct,
        price: finalPrice,
        stock: finalStock
      });
      setRestockQty(1);
    } else {
      setErrorMessage(res.error || 'Failed to update product details.');
    }
  };

  // Register completely new product
  const handleRegProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sizes = regSizesStr
      .split(',')
      .map(s => Number(s.trim()))
      .filter(s => !isNaN(s) && s > 0);

    const brandCode = BRAND_TO_CODE[regBrand] || 'WL';
    const cleanRawCode = regArticleCode.trim().toUpperCase();
    const finalProductId = `${brandCode}-${cleanRawCode}`;

    const payload = {
      id: finalProductId,
      name: regName,
      brand: regBrand,
      category: regCategory,
      subCategory: regSubCategory,
      sizes,
      price: Number(regPrice),
      stock: Number(regStock),
      description: regDescription,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
      colors: [1]
    };

    const res = await addProduct(payload);
    if (res.success) {
      setSuccessMessage(`Successfully registered & stocked "${regName}" as ID: ${finalProductId}!`);
      setMatchedProduct(payload as any);
      setScannedText(finalProductId);
    } else {
      setErrorMessage(res.error || 'Failed to register product.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Info Banner */}
      <div className={`p-4 md:p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
        isDark 
          ? 'bg-zinc-900/40 border-zinc-850 text-white' 
          : 'bg-white border-slate-150 text-slate-900 shadow-sm shadow-slate-100/30'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-md shadow-emerald-500/50" />
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <QrCode size={18} className="text-gold" /> Barcode Scanning Center
            </h3>
          </div>
          <p className="text-xs text-zinc-500 pl-4">
            Perform lighting fast checkout billing or update product stocks using USB/laser scanners.
          </p>
        </div>
        
        {/* Back navigation button */}
        <button
          type="button"
          onClick={onBack}
          className={`px-4.5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto ${
            isDark 
              ? 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900 hover:border-zinc-700' 
              : 'bg-slate-50 border-slate-200 text-slate-750 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <ArrowLeft size={13} /> Back to Dashboard
        </button>
      </div>

      {/* Operation selector tabs */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => {
            setScanMode('make-bill');
            resetScanner();
          }}
          className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
            scanMode === 'make-bill'
              ? 'bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/40 shadow-lg shadow-amber-500/5'
              : isDark ? 'bg-zinc-900/25 border-zinc-850 hover:bg-zinc-900/40' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ShoppingCart size={20} className={scanMode === 'make-bill' ? 'text-amber-500' : 'text-zinc-500'} />
          <h4 className={`text-xs font-black uppercase tracking-widest ${
            scanMode === 'make-bill' ? 'text-amber-500' : isDark ? 'text-zinc-300' : 'text-slate-700'
          }`}>
            Make a Bill
          </h4>
          <p className="text-[10px] text-zinc-500 max-w-[200px]">
            Scan footwear article codes to compile draft items and generate instantly completed bills.
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setScanMode('add-product');
            resetScanner();
          }}
          className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
            scanMode === 'add-product'
              ? 'bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/40 shadow-lg shadow-amber-500/5'
              : isDark ? 'bg-zinc-900/25 border-zinc-850 hover:bg-zinc-900/40' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Package size={20} className={scanMode === 'add-product' ? 'text-amber-500' : 'text-zinc-500'} />
          <h4 className={`text-xs font-black uppercase tracking-widest ${
            scanMode === 'add-product' ? 'text-amber-500' : isDark ? 'text-zinc-300' : 'text-slate-700'
          }`}>
            Add/Edit Product
          </h4>
          <p className="text-[10px] text-zinc-500 max-w-[200px]">
            Scan and instantly restock items, update price tags, or register completely fresh codes.
          </p>
        </button>
      </div>

      {/* Layout Split: Left scanner terminal, Right work list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: The Laser Scan Reader (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Inject style tag for continuous scrolling barcode laser line */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scan-laser {
              0% { top: 4%; }
              50% { top: 96%; }
              100% { top: 4%; }
            }
            .laser-scanner-line {
              animation: scan-laser 2s infinite linear;
            }
          `}} />

          <div className={`p-6 border rounded-3xl relative overflow-hidden transition-all duration-300 ${
            isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-slate-200 shadow-xl shadow-slate-100/40'
          }`}>
            
            {/* Visual Laser Scanner Beam simulation */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-600/60 shadow-[0_0_10px_#dc2626] animate-pulse z-10" />
            {flashBeam && (
              <div className="absolute inset-0 bg-red-600/10 z-0 transition-opacity duration-300 animate-pulse pointer-events-none" />
            )}

            <div className="space-y-4 relative z-20">
              <div className="flex justify-between items-center">
                <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  [01] Laser Scan Input Terminal
                </h3>
                
                {/* Active scan status indicator badge */}
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    isCameraActive ? 'bg-emerald-500 animate-ping shadow-md shadow-emerald-500/40' : isInputFocused ? 'bg-emerald-500 shadow-md shadow-emerald-500/40' : 'bg-amber-500 animate-pulse shadow-md shadow-amber-500/40'
                  }`} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    {isCameraActive ? 'Camera Live' : isInputFocused ? 'Scanner Ready' : 'Focus Needed'}
                  </span>
                </div>
              </div>

              {/* CAMERA SCANNER VIEWPORT */}
              {isCameraActive ? (
                <div className="relative mt-2 overflow-hidden rounded-2xl border border-zinc-800 bg-black aspect-[4/3] max-w-md mx-auto">
                  <div id="mobile-barcode-reader" className="w-full h-full" />
                  
                  {/* CSS-animated scanning laser beam overlay */}
                  <div className="absolute inset-x-0 h-0.5 bg-rose-500/80 shadow-[0_0_12px_#ef4444] z-10 pointer-events-none laser-scanner-line" />
                  
                  {/* Camera Controls Overlay */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCameraActive(false);
                        setIsScanningForArticleCode(false);
                      }}
                      className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-md shadow-rose-950/50 cursor-pointer"
                    >
                      🛑 Close Camera
                    </button>
                  </div>
                  
                  {/* Frame lines like a camera viewfinder */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-500 pointer-events-none" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-500 pointer-events-none" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-amber-500 pointer-events-none" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber-500 pointer-events-none" />

                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-3 py-1 rounded-full text-[8px] font-bold tracking-wider uppercase pointer-events-none z-10 whitespace-nowrap">
                    {isScanningForArticleCode ? "📷 Scanning Article Barcode" : "Hold shoe barcode steady in center"}
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (adminCameraPermission === 'granted') {
                        setIsCameraActive(true);
                      } else if (onRequestCameraPermission) {
                        onRequestCameraPermission();
                      } else {
                        setIsCameraActive(true);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 hover:text-amber-400 font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-amber-500/5 hover:scale-[1.01] cursor-pointer"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    📱 Open Mobile Camera Scanner
                  </button>
                </div>
              )}

              {/* Scan Barcode Form */}
              <form onSubmit={handleBarcodeSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    value={scannedText}
                    onChange={(e) => setScannedText(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    placeholder="SCAN BARCODE / ARTICLE CODE (e.g. WL-2035)..."
                    className={`w-full font-mono text-sm tracking-widest rounded-xl py-4.5 pl-12 pr-24 border outline-none transition-all ${
                      isDark 
                        ? 'bg-zinc-900 border-zinc-800 text-gold placeholder-zinc-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15'
                    }`}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <QrCode size={18} className="text-zinc-500" />
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {scannedText && (
                      <button
                        type="button"
                        onClick={resetScanner}
                        className="p-1 px-2.5 rounded-lg text-[9px] font-bold tracking-wider uppercase bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest bg-gold text-black hover:bg-gold-hover transition-all cursor-pointer"
                    >
                      Locate
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-500 italic pl-1 flex items-center gap-1.5">
                  <span>💡</span>
                  <span>Keep this input focused. Scan any shoe barcode or press Enter after typing an Article Code.</span>
                </p>
              </form>

              {/* Error or Success notification cards */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium flex items-center gap-2.5">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center justify-between gap-2.5 animate-fade-in">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle size={15} className="shrink-0" />
                    <span className="break-words">{successMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSuccessMessage(null)}
                    className="p-1 hover:bg-emerald-500/20 active:bg-emerald-500/30 rounded-lg transition-colors shrink-0 text-emerald-400 cursor-pointer"
                    title="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* DYNAMIC SCANNED MATCH RENDER AREA */}
          {matchedProduct ? (
            <div className={`p-6 border rounded-3xl space-y-5 animate-fade-in ${
              isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-slate-200 shadow-xl shadow-slate-100/40'
            }`}>
              
              <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
                <div className="space-y-1">
                  <span className="text-[8px] tracking-widest uppercase bg-amber-500/10 text-amber-500 font-extrabold px-2 py-0.5 rounded border border-amber-500/20">
                    {matchedProduct.brand || 'Walkaroo'}
                  </span>
                  <h3 className={`text-sm font-black uppercase tracking-tight mt-1.5 ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                    {matchedProduct.name}
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    REGISTRY CODE: {matchedProduct.id}
                  </p>
                </div>

                {matchedProduct.imageUrl && (
                  <img
                    src={matchedProduct.imageUrl}
                    alt={matchedProduct.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover border border-zinc-800 shrink-0"
                  />
                )}
              </div>

              {/* SUB OPERATION FIELDS BASED ON ACTIVE MODE */}
              {scanMode === 'make-bill' ? (
                <div className="space-y-4">
                  {/* COLOR SELECTION */}
                  {matchedColors.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                          Choose Color {matchedColors.length > 1 ? `(${matchedColors.length} Available)` : ''}
                        </label>
                        {selectedColor && (
                          <span className="text-[10px] font-mono text-amber-500 font-bold">
                            {getScanWorkspaceColorDef(selectedColor, matchedProduct).name}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {matchedColors.map(cid => {
                          const cdef = getScanWorkspaceColorDef(cid, matchedProduct);
                          const isSelected = selectedColor === cid;

                          let colorStock = 0;
                          if (matchedProduct?.sizeColorStock) {
                            Object.values(matchedProduct.sizeColorStock).forEach(sm => {
                              if (sm) colorStock += Number(sm[String(cid)]) || 0;
                            });
                          } else {
                            colorStock = matchedProduct?.stock || 0;
                          }

                          return (
                            <button
                              key={cid}
                              type="button"
                              onClick={() => setSelectedColor(cid)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                                isSelected
                                  ? 'bg-amber-500 text-black border-amber-400 font-black shadow-sm'
                                  : isDark
                                    ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span
                                className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                                style={{ backgroundColor: cdef.hex }}
                              />
                              <span>{cdef.name}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-black ${
                                isSelected ? 'bg-black/20 text-black' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                              }`}>
                                {colorStock} pcs
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* SIZE SELECTION */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                        Choose Available Size
                      </label>
                      {selectedColor && (
                        <span className="text-[9px] font-mono text-emerald-500 font-bold">
                          For {getScanWorkspaceColorDef(selectedColor, matchedProduct).name}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {matchedAvailableSizes.map(sz => {
                        let szStock = 0;
                        if (matchedProduct) {
                          if (matchedProduct.sizeColorStock && selectedColor) {
                            szStock = Number(matchedProduct.sizeColorStock[String(sz)]?.[String(selectedColor)]) || 0;
                          } else if (matchedProduct.sizeStock) {
                            szStock = Number(matchedProduct.sizeStock[String(sz)]) || 0;
                          } else {
                            szStock = matchedProduct.stock;
                          }
                        }
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSelectedSize(sz)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer border gap-1 ${
                              selectedSize === sz 
                                ? 'bg-gold text-black font-black scale-105 border-gold shadow-sm' 
                                : isDark ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                            }`}
                          >
                            <span>UK {sz}</span>
                            {szStock > 0 && (
                              <span className={`text-[9px] font-mono opacity-80 ${selectedSize === sz ? 'text-black font-black' : 'text-emerald-500'}`}>
                                ({szStock})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                        Billing Qty
                      </label>
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200/50 dark:border-zinc-800">
                        <button
                          type="button"
                          disabled={billingQty <= 1}
                          onClick={() => setBillingQty(prev => prev - 1)}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-950 flex items-center justify-center hover:scale-102 cursor-pointer disabled:opacity-40"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="flex-1 text-center font-bold text-xs">{billingQty}</span>
                        <button
                          type="button"
                          onClick={() => setBillingQty(prev => prev + 1)}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-950 flex items-center justify-center hover:scale-102 cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                        Price Tag
                      </label>
                      <div className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-black text-amber-500">
                        ₹{matchedProduct.price}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToBill}
                    className="w-full py-4.5 rounded-xl bg-gold hover:bg-gold-hover text-black font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10 active:scale-98"
                  >
                    <ShoppingCart size={14} className="stroke-[3px]" /> Add to Draft Bill
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* FAST STOCK RESTOCK / PRICE PARAMETERS */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                        Add New Stock (+Units)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={restockQty}
                        onChange={(e) => setRegStock(Number(e.target.value))}
                        className={`w-full rounded-xl py-2.5 px-3 text-xs outline-none transition-all ${
                          isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-100' : 'bg-slate-100 border border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                        Update Retail Price (₹)
                      </label>
                      <input
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className={`w-full rounded-xl py-2.5 px-3 text-xs outline-none transition-all ${
                          isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-100' : 'bg-slate-100 border border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-2xl flex justify-between text-[11px] text-zinc-400">
                    <span>CURRENT DATABASE STATUS:</span>
                    <span className="font-bold text-zinc-300 font-mono">Stock: {matchedProduct.stock} | Price: ₹{matchedProduct.price}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickUpdateProduct}
                    className="w-full py-4.5 rounded-xl bg-gold hover:bg-gold-hover text-black font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10 active:scale-98"
                  >
                    <CheckCircle size={14} className="stroke-[3px]" /> Update Product Database
                  </button>
                </div>
              )}

            </div>
          ) : (
            // No Matched Product Screen
            hasSearched && !errorMessage && scanMode === 'add-product' ? (
              <div className={`p-6 border rounded-3xl space-y-5 animate-fade-in ${
                isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-slate-200 shadow-xl shadow-slate-100/40'
              }`}>
                <div className="flex items-start gap-2.5 text-amber-500 text-xs font-semibold">
                  <Sparkles size={16} className="shrink-0 animate-spin" />
                  <span>Unregistered Code! Fill the details to instantly Register & Stock:</span>
                </div>

                {/* Form to Register Product */}
                <form onSubmit={handleRegProductSubmit} className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl p-3">
                    TARGET REGISTER ID: {BRAND_TO_CODE[regBrand] || 'WL'}-{regArticleCode.toUpperCase()}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Brand</label>
                    <select
                      value={regBrand}
                      onChange={(e) => setRegBrand(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs outline-none text-zinc-100"
                    >
                      {Object.keys(BRAND_TO_CODE).map(br => (
                        <option key={br} value={br}>{br}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Article Code</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsScanningForArticleCode(true);
                          setIsCameraActive(true);
                          setErrorMessage(null);
                          setSuccessMessage("Mobile camera active. Scan any product barcode to set this Article Code.");
                        }}
                        className="text-[8px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25 transition-all hover:scale-102"
                      >
                        📷 Scan/Issue Code
                      </button>
                    </div>
                    <input
                      type="text"
                      value={regArticleCode}
                      onChange={(e) => setRegArticleCode(e.target.value.toUpperCase())}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs outline-none text-zinc-100 font-mono"
                      placeholder="e.g. 2035"
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Product Title Case Name</label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs outline-none text-zinc-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Category</label>
                    <select
                      value={regCategory}
                      onChange={(e) => setRegCategory(e.target.value as Category)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs outline-none text-zinc-100"
                    >
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Kids">Kids</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Sub-Category</label>
                    <select
                      value={regSubCategory}
                      onChange={(e) => setRegSubCategory(e.target.value as SubCategory)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs outline-none text-zinc-100"
                    >
                      <option value="Office Wear">Office Wear</option>
                      <option value="Sandals">Sandals</option>
                      <option value="Casuals">Casuals</option>
                      <option value="Shoes">Shoes</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Available Sizes (Comma Separated)</label>
                    <input
                      type="text"
                      value={regSizesStr}
                      onChange={(e) => setRegSizesStr(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs outline-none text-zinc-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Retail Price (₹)</label>
                    <input
                      type="number"
                      value={regPrice}
                      onChange={(e) => setRegPrice(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs outline-none text-zinc-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Initial Stock</label>
                    <input
                      type="number"
                      value={regStock}
                      onChange={(e) => setRegStock(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs outline-none text-zinc-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="col-span-2 mt-2 py-4 rounded-xl bg-gold hover:bg-gold-hover text-black font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/15"
                  >
                    <PlusCircle size={14} /> REGISTER & ADD TO STOCK
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-zinc-800/60 rounded-3xl text-zinc-500 space-y-4">
                <div className="space-y-2">
                  <QrCode size={30} className="mx-auto text-zinc-600 animate-pulse" />
                  <p className="text-xs font-black uppercase tracking-widest">Awaiting Barcode Input</p>
                  <p className="text-[10px] text-zinc-600">Scan or type any product barcode code to view interactive operations here.</p>
                </div>
                <div className="pt-3 border-t border-zinc-900/30">
                  <button
                    type="button"
                    onClick={() => {
                      setMatchedProduct(null);
                      setHasSearched(true);
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      setRegArticleCode('');
                      setRegName('');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-amber-500 hover:text-amber-400 border border-zinc-800 text-[10px] font-black uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  >
                    📝 Create New Product from Scratch
                  </button>
                </div>
              </div>
            )
          )}

        </div>

        {/* RIGHT COLUMN: Bill Summary & Live Receipt (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Fast draft invoice billing tracker */}
          {scanMode === 'make-bill' && (
            <div className={`p-6 border rounded-3xl flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 ${
              isDark 
                ? 'bg-zinc-950 border-zinc-900 text-zinc-100' 
                : 'bg-slate-900 border-slate-800 text-white'
            }`}>
              
              <div className="space-y-6">
                <h3 className="font-mono text-xs uppercase tracking-widest text-zinc-400 flex items-center justify-between border-b border-zinc-800/80 pb-4">
                  <span className="flex items-center gap-2">
                    <FileText size={14} className="text-gold" /> Fast Scanner Invoice Desk
                  </span>
                  <span className="text-zinc-500 font-bold font-mono">
                    {billingItems.length} items
                  </span>
                </h3>

                {/* Draft Bill items list */}
                {billingItems.length === 0 ? (
                  <div className="py-12 text-center text-zinc-500 space-y-2">
                    <ShoppingCart size={24} className="mx-auto opacity-30 text-gold" />
                    <p className="text-[10px] font-black uppercase tracking-wider">Draft Invoice is Empty</p>
                    <p className="text-[9px] text-zinc-600">Scan and add items above to start compiling a customer checkout bill.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                    {billingItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-xs font-mono gap-4 border-b border-zinc-800/40 pb-2">
                        <div className="space-y-1">
                          <p className="font-black text-zinc-100 leading-tight">
                            {item.product.name}
                          </p>
                          <p className="text-[9px] text-zinc-500">
                            Size: UK {item.size} | Qty: {item.quantity} x ₹{item.product.price}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-zinc-100">
                            ₹{item.product.price * item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setBillingItems(prev => prev.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pricing summary */}
                {billingItems.length > 0 && (() => {
                  const sub = billingItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
                  return (
                    <div className="border-t border-zinc-800/80 pt-4 space-y-4">
                      
                      {/* Subtotal */}
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-zinc-400 font-bold">FAST CHECKOUT SUB:</span>
                        <span className="font-black text-zinc-200">₹{sub}</span>
                      </div>

                      {/* PAYMENT OPTION MANDATORY INPUT */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                            Select Payment Method (Mandatory)
                          </label>
                          {!fastBillingPayment && (
                            <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest animate-pulse">
                              * Select option
                            </span>
                          )}
                        </div>
                        <div className={`grid grid-cols-2 gap-2 bg-zinc-900/50 p-1 rounded-xl border transition-all duration-300 ${
                          !fastBillingPayment
                            ? 'border-rose-500/50 ring-2 ring-rose-500/15'
                            : 'border-zinc-800'
                        }`}>
                          {['Cash', 'UPI'].map(pm => (
                            <button
                              key={pm}
                              type="button"
                              onClick={() => {
                                setFastBillingPayment(pm);
                                setFastBillingError(null);
                              }}
                              className={`py-2 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                fastBillingPayment === pm 
                                  ? 'bg-gold text-black shadow-md font-black border border-gold' 
                                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-transparent'
                              }`}
                            >
                              {pm === 'Cash' ? '💵 Cash' : '📱 UPI'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* FAST CHECKOUT ERROR WARNING */}
                      {fastBillingError && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-[10px] font-medium flex items-center gap-2">
                          <AlertTriangle size={12} className="shrink-0" />
                          <span>{fastBillingError}</span>
                        </div>
                      )}

                      {/* FINAL ACTIONS */}
                      <div className="pt-2">
                        <button
                          type="button"
                          disabled={isProcessingFastCheckout}
                          onClick={handleFastInvoiceCheckout}
                          className={`w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-97 ${
                            isProcessingFastCheckout ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          {isProcessingFastCheckout ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>PROCESSING INVOICE...</span>
                            </>
                          ) : (
                            <>
                              <Check size={14} className="stroke-[3.5px]" /> PROCESS INVOICE CHECKOUT
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  );
                })()}

              </div>
            </div>
          )}

          {/* If not fast billing, maybe a helpful stock instruction banner */}
          {scanMode === 'add-product' && (
            <div className={`p-6 border rounded-3xl ${
              isDark ? 'bg-zinc-950 border-zinc-900 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600 shadow-sm'
            } text-xs leading-relaxed space-y-3`}>
              <h4 className={`font-black uppercase tracking-widest text-[10px] ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                Barcode Inventory Quick Tips
              </h4>
              <ul className="space-y-2 list-disc pl-4 text-[10px]">
                <li>Barcodes are generated as <code className="font-mono text-amber-500 bg-amber-500/5 px-1 py-0.5 rounded">BRANDCODE-ARTICLE</code> (e.g. <code className="font-mono text-amber-500">WL-2035</code>).</li>
                <li>Scanning an unregistered code automatically detects the brand prefix (e.g., <code className="font-mono text-amber-500">WAL-</code> is Walkmate).</li>
                <li>Quick stock increases apply to overall registry stock instantly in the Firestore cloud database.</li>
              </ul>
            </div>
          )}

        </div>

      </div>

      {/* COMPLETED SUCCESS INVOICE MODAL / RECEIPT CARD */}
      {billingSuccessReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className={`rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border relative space-y-5 my-8 ${
            isDark ? 'bg-zinc-950 border-zinc-850 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-500/20">
                <CheckCircle size={24} className="stroke-[2.5px]" />
              </div>
              <h3 className={`text-lg font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Invoice Checkout Succeeded!
              </h3>
              <p className="text-[10px] text-zinc-500">
                INVOICE ID: <strong className="font-mono text-gold">{billingSuccessReceipt.id}</strong>
              </p>
            </div>

            {/* Thermal style printed bill summary */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 space-y-4 font-mono text-[10.5px]">
              <div className="text-center border-b border-dashed border-zinc-700/60 pb-3 space-y-1">
                <h4 className="font-black text-xs uppercase text-gold">PRASHANT FOOTWEAR</h4>
                <p className="text-[8px] text-zinc-500 uppercase">Premium Footwear Retail Depot</p>
                <p className="text-[8.5px] text-zinc-400 font-bold">{billingSuccessReceipt.date}</p>
              </div>

              {/* Items Table */}
              <div className="space-y-2.5 border-b border-dashed border-zinc-700/60 pb-3">
                <div className="flex justify-between font-black text-zinc-400 text-[9px] uppercase tracking-wider">
                  <span>Item & Size</span>
                  <span>Qty & Sub</span>
                </div>
                {billingSuccessReceipt.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between leading-tight text-zinc-200">
                    <span className="truncate max-w-[180px]">{it.name} (UK {it.size})</span>
                    <span>{it.quantity}x = ₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1 pb-3">
                <div className="flex justify-between font-black text-xs border-t border-zinc-800 pt-2 mt-1">
                  <span>GRAND TOTAL:</span>
                  <span className="text-gold">₹{billingSuccessReceipt.totalAmount}</span>
                </div>
                <div className="flex justify-between text-[8px] text-zinc-500">
                  <span>PAID VIA METHOD:</span>
                  <span className="uppercase text-zinc-300 font-bold">{billingSuccessReceipt.paymentMethod}</span>
                </div>
              </div>

              {/* Barcode Mockup */}
              <div className="text-center pt-2 border-t border-dashed border-zinc-700/60 space-y-1">
                <div className="h-6 w-32 bg-zinc-950 mx-auto flex items-center justify-between px-2 text-[6px] text-white select-none">
                  |||| | ||||| ||| || ||||| | ||||
                </div>
                <p className="text-[7.5px] text-zinc-500">Prashant Footwear Scan Tracking ID</p>
              </div>
            </div>

            {/* Print and Close buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="py-3 rounded-xl bg-gold text-black font-black text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer hover:bg-gold-hover transition-all"
              >
                <Printer size={13} /> Print Bill
              </button>
              <button
                type="button"
                onClick={() => {
                  setBillingSuccessReceipt(null);
                  resetScanner();
                }}
                className={`py-3 rounded-xl font-black text-xs tracking-wider uppercase cursor-pointer transition-colors text-center ${
                  isDark ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Close Desk
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
