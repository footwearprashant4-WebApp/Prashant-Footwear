import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { Product, Order, Category, SubCategory } from '../types';
import { 
  Plus, Trash2, Edit3, ShoppingCart, RefreshCw, BarChart2, Package, Layers, PlusCircle, Check, 
  AlertTriangle, DollarSign, Receipt, TrendingUp, CheckCircle, Smartphone, Upload, RotateCcw, Video,
  Folder, FolderOpen, Image, HardDrive, Cpu, Laptop, FileImage, Sun, Moon, User, MessageSquare, Zap, Tag,
  Printer, Share2, Percent, FileText, X, ChevronDown, Menu, Globe, Search, Coins, QrCode, Wifi
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const IMAGINARY_DEVICE_FILES = {
  DCIM: [
    {
      name: 'IMG_2026_PRESTIGE_SNEAKERS.JPG',
      size: '1.8 MB',
      resolution: '2400 x 1600',
      camera: 'Leica Q3 (28mm f/1.7)',
      date: '2026-06-15',
      url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop'
    },
    {
      name: 'IMG_2026_SUEDE_RUNWAY.JPG',
      size: '2.1 MB',
      resolution: '3000 x 2000',
      camera: 'Sony A7R V (50mm f/1.2 GM)',
      date: '2026-06-20',
      url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=1200&auto=format&fit=crop'
    },
    {
      name: 'IMG_2026_LEATHER_CLASSICS.JPG',
      size: '1.4 MB',
      resolution: '1920 x 1280',
      camera: 'Fujifilm X-T5 (35mm f/1.4)',
      date: '2026-07-02',
      url: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1200&auto=format&fit=crop'
    }
  ],
  Downloads: [
    {
      name: 'ATHLETIC_RED_LAUNCHER_PROMO.PNG',
      size: '950 KB',
      resolution: '1200 x 800',
      camera: 'Adobe Illustrator Asset',
      date: '2026-07-04',
      url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop'
    },
    {
      name: 'NEON_RUN_ACTIVE_PROMO.PNG',
      size: '1.1 MB',
      resolution: '1440 x 1080',
      camera: 'Figma Export',
      date: '2026-07-05',
      url: 'https://images.unsplash.com/photo-1543508282-6319a3e2621d?q=80&w=1200&auto=format&fit=crop'
    },
    {
      name: 'STREET_SNEAKER_COLLAGE.JPG',
      size: '1.6 MB',
      resolution: '1440 x 1440',
      camera: 'iPhone 15 Pro Max',
      date: '2026-07-01',
      url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1200&auto=format&fit=crop'
    }
  ],
  Workshop: [
    {
      name: 'GOLDEN_SOLE_CRAFT_POSTER.PNG',
      size: '3.2 MB',
      resolution: '3200 x 1800',
      camera: 'Figma Premium Rendering',
      date: '2026-07-03',
      url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1200&auto=format&fit=crop'
    },
    {
      name: 'VINTAGE_STITCH_MACRO_DETAIL.JPG',
      size: '1.2 MB',
      resolution: '1920 x 1080',
      camera: 'Hasselblad X2D 100C',
      date: '2026-06-28',
      url: 'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?q=80&w=1200&auto=format&fit=crop'
    }
  ]
};

interface AdminDashboardProps {
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onToggleAdminMode?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ theme = 'light', onToggleTheme, onToggleAdminMode }) => {
  const isDark = theme === 'dark';
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const { 
    products, 
    orders, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    createOrder, 
    heroVideoUrl, 
    heroVideoUrl2,
    heroVideoSource,
    heroVideoSource2,
    offersBannerUrl,
    categoryThumbMen,
    categoryThumbWomen,
    categoryThumbKids,
    updateHeroVideoUrl, 
    uploadLocalVideo, 
    resetHeroVideo,
    updateOffersBannerUrl,
    updateCategoryThumbnail,
    heroVideos,
    heroImages,
    addHeroVideo,
    deleteHeroVideo,
    addHeroImage,
    deleteHeroImage
  } = useProducts();
  
  // Tabs: 'billing' | 'stock' | 'catalogue' | 'analytics' | 'erp'
  const [activeTab, setActiveTab] = useState<'billing' | 'stock' | 'catalogue' | 'analytics' | 'erp'>('billing');
  
  // --- STOCK FILTER STATE ---
  const [stockFilterMode, setStockFilterMode] = useState<'category' | 'brand'>('category');
  const [selectedStockCategory, setSelectedStockCategory] = useState<'All' | 'Men' | 'Women' | 'Kids'>('Men');
  const [selectedStockBrand, setSelectedStockBrand] = useState<'All' | 'Walkaroo' | 'Walkmate' | 'Paragon' | 'Indus' | 'Bairathi' | 'Yono'>('Walkaroo');

  // Helper to determine product brand deterministically based on product properties
  const getProductBrand = (p: Product): string => {
    const nameLower = p.name.toLowerCase();
    const descLower = (p.description || '').toLowerCase();
    
    if (nameLower.includes('walkaroo') || descLower.includes('walkaroo')) return 'Walkaroo';
    if (nameLower.includes('walkmate') || descLower.includes('walkmate')) return 'Walkmate';
    if (nameLower.includes('paragon') || descLower.includes('paragon')) return 'Paragon';
    if (nameLower.includes('indus') || descLower.includes('indus')) return 'Indus';
    if (nameLower.includes('bairathi') || descLower.includes('bairathi')) return 'Bairathi';
    if (nameLower.includes('yono') || descLower.includes('yono')) return 'Yono';
    
    // Deterministic hash assignment fallback
    const brands = ['Walkaroo', 'Walkmate', 'Paragon', 'Indus', 'Bairathi', 'Yono'];
    let hash = 0;
    for (let i = 0; i < p.id.length; i++) {
      hash = p.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % brands.length;
    return brands[index];
  };

  const [erpVideoIndex, setErpVideoIndex] = useState<1 | 2>(1);
  const [simActiveIndex, setSimActiveIndex] = useState<1 | 2>(1);

  // --- ERP MEDIA CONFIG STATE ---
  const [erpVideoInput, setErpVideoInput] = useState(heroVideoUrl || '');
  const [erpVideoInput2, setErpVideoInput2] = useState(heroVideoUrl2 || '');
  const [offersBannerInput, setOffersBannerInput] = useState(offersBannerUrl || '');
  const [categoryThumbMenInput, setCategoryThumbMenInput] = useState(categoryThumbMen || '');
  const [categoryThumbWomenInput, setCategoryThumbWomenInput] = useState(categoryThumbWomen || '');
  const [categoryThumbKidsInput, setCategoryThumbKidsInput] = useState(categoryThumbKids || '');
  const [isUpdatingCategoryThumbs, setIsUpdatingCategoryThumbs] = useState(false);
  const [isUpdatingOffersBanner, setIsUpdatingOffersBanner] = useState(false);
  const [erpSuccess, setErpSuccess] = useState<string | null>(null);
  const [erpError, setErpError] = useState<string | null>(null);
  const [isUpdatingVideo, setIsUpdatingVideo] = useState(false);
  const [isUpdatingVideo2, setIsUpdatingVideo2] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isUploadingFile2, setIsUploadingFile2] = useState(false);

  // Dynamic Media Database form states
  const [dbVideoName, setDbVideoName] = useState('');
  const [dbVideoUrl, setDbVideoUrl] = useState('');
  const [isAddingDbVideo, setIsAddingDbVideo] = useState(false);
  const [dbVideoSuccess, setDbVideoSuccess] = useState<string | null>(null);
  const [dbVideoError, setDbVideoError] = useState<string | null>(null);

  const [dbImageName, setDbImageName] = useState('');
  const [dbImageUrl, setDbImageUrl] = useState('');
  const [isAddingDbImage, setIsAddingDbImage] = useState(false);
  const [dbImageSuccess, setDbImageSuccess] = useState<string | null>(null);
  const [dbImageError, setDbImageError] = useState<string | null>(null);

  // Offers Banner Input Modes: 'manual' (input URL / local file upload) or 'device' (imaginary device filesystem)
  const [bannerInputMode, setBannerInputMode] = useState<'manual' | 'device'>('manual');
  const [selectedImaginaryFolder, setSelectedImaginaryFolder] = useState<'DCIM' | 'Downloads' | 'Workshop'>('DCIM');
  const [selectedImaginaryFile, setSelectedImaginaryFile] = useState<any>(null);

  // Category Thumbnail Customizer States
  const [selectedCategoryConfig, setSelectedCategoryConfig] = useState<'Men' | 'Women' | 'Kids'>('Men');
  const [catThumbInputMode, setCatThumbInputMode] = useState<'manual' | 'device'>('manual');
  const [selectedCatImaginaryFolder, setSelectedCatImaginaryFolder] = useState<'DCIM' | 'Downloads' | 'Workshop'>('DCIM');
  const [selectedCatImaginaryFile, setSelectedCatImaginaryFile] = useState<any>(null);

  // Sync erp input field with real-time value on load
  React.useEffect(() => {
    if (heroVideoUrl && !heroVideoUrl.startsWith('blob:')) {
      setErpVideoInput(heroVideoUrl);
    }
  }, [heroVideoUrl]);

  React.useEffect(() => {
    if (heroVideoUrl2 && !heroVideoUrl2.startsWith('blob:')) {
      setErpVideoInput2(heroVideoUrl2);
    }
  }, [heroVideoUrl2]);

  React.useEffect(() => {
    if (offersBannerUrl) {
      setOffersBannerInput(offersBannerUrl);
    }
  }, [offersBannerUrl]);

  React.useEffect(() => {
    if (categoryThumbMen) {
      setCategoryThumbMenInput(categoryThumbMen);
    }
  }, [categoryThumbMen]);

  React.useEffect(() => {
    if (categoryThumbWomen) {
      setCategoryThumbWomenInput(categoryThumbWomen);
    }
  }, [categoryThumbWomen]);

  React.useEffect(() => {
    if (categoryThumbKids) {
      setCategoryThumbKidsInput(categoryThumbKids);
    }
  }, [categoryThumbKids]);

  // --- BILLING WORKSPACE STATE ---
  const [billingMobile, setBillingMobile] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [billingArticleNumber, setBillingArticleNumber] = useState('');
  const [billingPrice, setBillingPrice] = useState<number | ''>('');
  const [billingPayment, setBillingPayment] = useState('Cash');
  const [billingItems, setBillingItems] = useState<{ product: Product; size: number; quantity: number }[]>([]);
  const [selectedBillProdId, setSelectedBillProdId] = useState('');
  const [selectedBillSize, setSelectedBillSize] = useState<number | ''>('');
  const [selectedBillQty, setSelectedBillQty] = useState(1);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingSuccess, setBillingSuccess] = useState<string | null>(null);
  const [billingDiscountType, setBillingDiscountType] = useState<'flat' | 'percent'>('flat');
  const [billingDiscountValue, setBillingDiscountValue] = useState<number>(0);
  const [quickAddCategory, setQuickAddCategory] = useState<'All' | 'Men' | 'Women' | 'Kids'>('All');
  const [checkoutReceipt, setCheckoutReceipt] = useState<any>(null);
  const [isArticleDropdownOpen, setIsArticleDropdownOpen] = useState(false);
  const [autoOpenWhatsApp, setAutoOpenWhatsApp] = useState(true);
  const [showNextSteps, setShowNextSteps] = useState(false);

  // --- CATALOGUE FORM STATE ---
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'Men' as Category,
    subCategory: 'Office Wear' as SubCategory,
    sizesStr: '6,7,8,9,10,11,12', // Comma separated sizes
    price: 99,
    stock: 20,
    description: '',
    imageUrl: ''
  });

  // Selected product for size population in billing
  const billingSelectedProduct = products.find(p => p.id === selectedBillProdId);

  // Add Item to Bill (Fast POS Entry)
  const handleAddBillItem = () => {
    if (!billingArticleNumber.trim()) {
      setBillingError('Please enter or search an Article Number.');
      return;
    }
    if (!selectedBillSize) {
      setBillingError('Please select a Size.');
      return;
    }
    if (billingPrice === '' || Number(billingPrice) < 0) {
      setBillingError('Please enter a valid Price.');
      return;
    }

    // Check if there is an existing product with this ID or matched name
    const product = products.find(p => 
      p.id.toLowerCase() === billingArticleNumber.trim().toLowerCase() ||
      p.name.toLowerCase() === billingArticleNumber.trim().toLowerCase()
    );

    let productToAdd: Product;

    if (product) {
      // Check stock
      const existingBillQty = billingItems
        .filter(item => item.product.id === product.id)
        .reduce((sum, item) => sum + item.quantity, 0);

      if (existingBillQty + selectedBillQty > product.stock) {
        setBillingError(`Insufficient stock. Only ${product.stock} available on hand.`);
        return;
      }

      productToAdd = {
        ...product,
        price: Number(billingPrice)
      };
    } else {
      // Create a transient manual product object for POS
      productToAdd = {
        id: `custom-${billingArticleNumber.trim().replace(/\s+/g, '-').toLowerCase()}`,
        name: `Article ${billingArticleNumber.trim().toUpperCase()}`,
        category: 'Men',
        subCategory: 'Others',
        sizes: [Number(selectedBillSize)],
        price: Number(billingPrice),
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
        description: 'Manual POS Quick Entry Style',
        stock: 999,
        createdAt: new Date().toISOString()
      };
    }

    // Add or merge item
    const existingIndex = billingItems.findIndex(
      item => item.product.id === productToAdd.id && item.size === Number(selectedBillSize)
    );

    if (existingIndex > -1) {
      const updated = [...billingItems];
      updated[existingIndex].quantity += selectedBillQty;
      setBillingItems(updated);
    } else {
      setBillingItems([...billingItems, { product: productToAdd, size: Number(selectedBillSize), quantity: selectedBillQty }]);
    }

    setBillingError(null);
    setBillingArticleNumber('');
    setBillingPrice('');
    setSelectedBillSize('');
    setSelectedBillQty(1);
    setSelectedBillProdId('');
    setShowNextSteps(true);
  };

  // Remove Item from Bill
  const handleRemoveBillItem = (index: number) => {
    const updated = [...billingItems];
    updated.splice(index, 1);
    setBillingItems(updated);
    if (updated.length === 0) {
      setShowNextSteps(false);
    }
  };

  // Checkout/Finalize Bill
  const handleCheckoutBill = async () => {
    const finalMobile = billingMobile.trim() || 'Walk-In';
    if (billingItems.length === 0) {
      setBillingError('Add at least one item to invoice.');
      return;
    }

    const orderItems = billingItems.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      category: item.product.category,
      subCategory: item.product.subCategory,
      price: item.product.price,
      quantity: item.quantity,
      size: item.size
    }));

    const subtotal = billingItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const computedDiscount = billingDiscountType === 'percent'
      ? Math.round((subtotal * billingDiscountValue) / 100)
      : billingDiscountValue;
    const finalAmount = Math.max(0, subtotal - computedDiscount);

    const res = await createOrder({
      customerMobile: finalMobile,
      customerName: customerName || 'Walk-in Client',
      items: orderItems,
      totalAmount: finalAmount,
      paymentMethod: billingPayment,
      status: 'completed'
    });

    if (res.success) {
      setBillingSuccess(`Invoice ${res.id} issued successfully!`);
      
       const receiptData = {
        id: res.id,
        customerMobile: finalMobile,
        customerName: customerName || 'Walk-in Client',
        items: orderItems,
        subtotal,
        discount: computedDiscount,
        discountType: billingDiscountType,
        discountValue: billingDiscountValue,
        totalAmount: finalAmount,
        paymentMethod: billingPayment,
        date: new Date().toLocaleString('en-IN')
      };
      setCheckoutReceipt(receiptData);

      // Save credentials for WhatsApp before clearing
      const targetMobile = finalMobile;
      const targetCustomer = customerName || 'Walk-in Client';

      // Always direct to WhatsApp if a valid 10-digit customer mobile is entered
      if (targetMobile && targetMobile !== 'Walk-In' && targetMobile.length === 10) {
        const invoiceLink = `${window.location.origin}/?invoiceId=${res.id}`;
        const waText = `*PRASHANT FOOTWEAR* 🧾%0A----------------------------%0A*Invoice:* ${res.id}%0A*Customer:* ${targetCustomer}%0A*Date:* ${receiptData.date}%0A----------------------------%0A*Items:*%0A${orderItems.map((it: any) => `- ${it.name} (UK ${it.size}) x${it.quantity} = ₹${it.price * it.quantity}`).join('%0A')}%0A----------------------------%0A*Subtotal:* ₹${subtotal}%0A${computedDiscount > 0 ? `*Discount:* -₹${computedDiscount}%0A` : ''}*Grand Total:* *₹${finalAmount}*%0A*Paid via:* ${billingPayment}%0A----------------------------%0A*View and Print Invoice:*%0A${invoiceLink}%0A%0A_Thank you for shopping with us!_ 🙏`;
        
        // Timeout to let checkout receipt state render
        setTimeout(() => {
          window.open(`https://wa.me/91${targetMobile}?text=${waText}`, '_blank');
        }, 300);
      }

      setBillingItems([]);
      setBillingMobile('');
      setCustomerName('');
      setBillingDiscountValue(0);
      setBillingError(null);
      setShowNextSteps(false);
      setTimeout(() => setBillingSuccess(null), 6000);
    } else {
      setBillingError(res.error || 'Failed to issue invoice.');
    }
  };

  // --- STOCK WORKSPACE HANDLERS ---
  const handleQuickRestock = async (id: string, amount: number) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    await updateProduct(id, { stock: prod.stock + amount });
  };

  const handleUpdatePrice = async (id: string, newPrice: number) => {
    if (newPrice < 0) return;
    await updateProduct(id, { price: newPrice });
  };

  // --- CATALOGUE FORM ACTIONS ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const sizes = formData.sizesStr
      .split(',')
      .map(s => Number(s.trim()))
      .filter(s => !isNaN(s) && s > 0);

    const payload = {
      id: formData.id || `footwear-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      subCategory: formData.subCategory,
      sizes,
      price: Number(formData.price),
      stock: Number(formData.stock),
      description: formData.description,
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'
    };

    let res;
    if (editProductId) {
      res = await updateProduct(editProductId, payload);
    } else {
      res = await addProduct(payload);
    }

    if (res.success) {
      setIsAddingProduct(false);
      setEditProductId(null);
      setFormData({
        id: '',
        name: '',
        category: 'Men',
        subCategory: 'Office Wear',
        sizesStr: '6,7,8,9,10,11,12',
        price: 99,
        stock: 20,
        description: '',
        imageUrl: ''
      });
    } else {
      alert(res.error || 'Operation failed.');
    }
  };

  const handleEditClick = (prod: Product) => {
    setFormData({
      id: prod.id,
      name: prod.name,
      category: prod.category,
      subCategory: prod.subCategory,
      sizesStr: prod.sizes.join(','),
      price: prod.price,
      stock: prod.stock,
      description: prod.description || '',
      imageUrl: prod.imageUrl || ''
    });
    setEditProductId(prod.id);
    setIsAddingProduct(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm('Are you absolutely sure you want to delete this footwear from catalogue? This cannot be undone.')) {
      await deleteProduct(id);
    }
  };

  // --- REPORTS / ANALYTICS METRICS ---
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalInvoices = orders.length;
  const totalStockOnHand = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockItems = products.filter(p => p.stock <= 5);

  // Chart data: Sales breakdown by subCategory
  const salesBySubCat = products.map(p => {
    // calculate units sold
    const unitsSold = orders.reduce((sum, o) => {
      const matchedItems = o.items.filter(item => item.productId === p.id);
      return sum + matchedItems.reduce((s, i) => s + i.quantity, 0);
    }, 0);
    return { name: p.name, sub: p.subCategory, value: unitsSold * p.price, units: unitsSold };
  });

  // Consolidate subCategory totals
  const subCategorySalesData = ['Office Wear', 'Sandals', 'Casuals', 'Shoes', 'Others'].map(sub => {
    const total = salesBySubCat
      .filter(item => item.sub === sub)
      .reduce((sum, item) => sum + item.value, 0);
    return { name: sub, sales: total };
  });

  const categoryPieData = ['Men', 'Women', 'Kids'].map(cat => {
    const total = orders.reduce((sum, o) => {
      const itemsInCat = o.items.filter(item => item.category === cat);
      return sum + itemsInCat.reduce((s, i) => s + (i.price * i.quantity), 0);
    }, 0);
    return { name: cat, value: total || 0 };
  });

  const COLORS = ['#C5A059', '#7D6332', '#E2D1B2', '#4B4231', '#9F8450'];

  const filteredStockProducts = products.filter(p => {
    if (stockFilterMode === 'category') {
      if (selectedStockCategory === 'All') return true;
      return p.category === selectedStockCategory;
    } else {
      if (selectedStockBrand === 'All') return true;
      return getProductBrand(p) === selectedStockBrand;
    }
  });

  return (
    <div id="admin-dashboard-container" className={`min-h-screen pt-24 pb-12 px-6 md:px-12 transition-colors duration-500 ${
      isDark ? 'bg-zinc-950 text-white' : 'bg-[#F9F9FB] text-zinc-900'
    }`}>
      {/* Premium UI-Designed Top Bar Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 backdrop-blur-md px-4 sm:px-6 md:px-12 py-3 ${
        isDark 
          ? 'bg-zinc-950/85 border-zinc-900 text-white shadow-xl shadow-black/30' 
          : 'bg-white/90 border-slate-200/60 text-zinc-800 shadow-lg shadow-slate-100/10'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full gap-4">
          {/* Left: Brand Identity & Custom SVG Logo */}
          <div className="flex items-center gap-3 shrink-0 min-w-0">
            {/* Elegant Custom Footwear Logo Container */}
            <div className="relative group flex items-center justify-center">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#C5A059] to-amber-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className={`relative p-1.5 sm:p-2 rounded-xl transition-all duration-300 border ${
                isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'
              }`}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A059]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Styled Elegant Shoe Contour and Star Accent */}
                  <path d="M15 72 C15 72, 28 66, 40 66 C52 66, 64 56, 76 48 C84 43, 89 46, 89 52 C89 60, 81 65, 69 69 C57 73, 28 75, 15 72 Z" fill="url(#designerGoldGrad)" opacity="0.25" />
                  <path d="M12 70 C24 70, 37 60, 50 55 C60 51, 74 47, 86 52 C88 53, 88 56, 84 58 C76 63, 57 70, 32 72" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M54 36 C54 36, 58 43, 59 53" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M47 30 L52 35 L47 40" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  <defs>
                    <linearGradient id="designerGoldGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#C5A059" />
                      <stop offset="50%" stopColor="#F5DFB1" />
                      <stop offset="100%" stopColor="#8C6D31" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Typography Identity */}
            <div className="flex flex-col items-start justify-center min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`serif-display font-black tracking-normal uppercase text-xs sm:text-sm md:text-base leading-none ${
                  isDark ? 'text-white' : 'text-zinc-950'
                }`}>
                  Prashant Admin Panel
                </span>
              </div>
              <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#C5A059] font-black mt-0.5">
                Footwear
              </span>
            </div>
          </div>

          {/* Center: Live Session Capsule (Hidden on mobile, beautifully formatted on desktop) */}
          {currentUser && (
            <div className={`hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-[10px] font-bold select-none transition-all duration-300 ${
              isDark 
                ? 'bg-zinc-900/30 border-zinc-800/80 text-zinc-300 shadow-inner' 
                : 'bg-slate-50 border-slate-200 text-slate-700 shadow-inner'
            }`}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono tracking-wider text-slate-400 dark:text-zinc-500">
                ACTIVE CONSOLE: <strong className={isDark ? 'text-zinc-200' : 'text-slate-800'}>{currentUser.mobile}</strong>
              </span>
            </div>
          )}

          {/* Right: Premium Controls Group */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Toggle */}
            <LanguageToggle isNavbarDark={isDark} />

            {/* Storefront return button */}
            <button
              type="button"
              onClick={() => {
                if (onToggleAdminMode) {
                  onToggleAdminMode();
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="h-8 sm:h-9 px-2.5 sm:px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] text-white text-[9px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-md shadow-indigo-500/15 shrink-0"
              title="Return to Public Storefront"
            >
              <Globe size={12} className="animate-spin-slow text-white" />
              <span className="hidden sm:inline">VIEW STORE</span>
              <span className="inline sm:hidden">STORE</span>
            </button>

            {/* Theme switcher */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm shrink-0 active:scale-[0.97] ${
                  isDark
                    ? 'bg-zinc-900 text-yellow-400 border-zinc-800 hover:text-yellow-300 hover:bg-zinc-800'
                    : 'bg-white text-zinc-600 border-slate-200 hover:text-zinc-950 hover:bg-slate-50'
                }`}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun size={13} className="text-yellow-400" /> : <Moon size={13} />}
              </button>
            )}
          </div>
        </div>
      </header>

      {!isDark && (
        <style>{`
          #admin-dashboard-container {
            background-color: #F9F9FB !important;
            color: #18181b !important;
          }
          #admin-dashboard-container select,
          #admin-dashboard-container input,
          #admin-dashboard-container textarea {
            background-color: #ffffff !important;
            color: #18181b !important;
            border-color: #e4e4e7 !important;
          }
          #admin-dashboard-container select:focus,
          #admin-dashboard-container input:focus,
          #admin-dashboard-container textarea:focus {
            border-color: #18181b !important;
          }
          #admin-dashboard-container .bg-zinc-950 {
            background-color: #F9F9FB !important;
            color: #18181b !important;
          }
          #admin-dashboard-container .bg-zinc-950\\/60,
          #admin-dashboard-container .bg-zinc-950\\/40,
          #admin-dashboard-container .bg-zinc-900\\/30,
          #admin-dashboard-container .bg-zinc-900\\/10 {
            background-color: #ffffff !important;
            border-color: #e4e4e7 !important;
            color: #18181b !important;
          }
          #admin-dashboard-container .border-zinc-900,
          #admin-dashboard-container .border-zinc-800,
          #admin-dashboard-container .border-zinc-800\\/60,
          #admin-dashboard-container .border-zinc-900\\/50 {
            border-color: #e4e4e7 !important;
          }
          #admin-dashboard-container .text-white {
            color: #18181b !important;
          }
          #admin-dashboard-container .text-zinc-100 {
            color: #27272a !important;
          }
          #admin-dashboard-container .text-zinc-200 {
            color: #3f3f46 !important;
          }
          #admin-dashboard-container .text-zinc-300 {
            color: #3f3f46 !important;
          }
          #admin-dashboard-container .text-zinc-400 {
            color: #71717a !important;
          }
          #admin-dashboard-container .bg-zinc-900 {
            background-color: #f4f4f5 !important;
            color: #18181b !important;
            border-color: #e4e4e7 !important;
          }
          #admin-dashboard-container table {
            background-color: #ffffff !important;
            color: #18181b !important;
          }
          #admin-dashboard-container tr {
            border-bottom-color: #e4e4e7 !important;
          }
          #admin-dashboard-container tr:hover {
            background-color: #f4f4f5 !important;
          }
          #admin-dashboard-container th {
            background-color: #f4f4f5 !important;
            color: #27272a !important;
            border-bottom-color: #e4e4e7 !important;
          }
          #admin-dashboard-container td {
            color: #3f3f46 !important;
          }
          #admin-dashboard-container .bg-white.text-black {
            background-color: #18181b !important;
            color: #ffffff !important;
            border-color: #18181b !important;
          }
          #admin-dashboard-container .bg-zinc-900\\/40 {
            background-color: #ffffff !important;
            color: #71717a !important;
            border-color: #e4e4e7 !important;
          }
          #admin-dashboard-container .bg-zinc-900\\/40:hover {
            color: #18181b !important;
            border-color: #18181b !important;
          }
          #admin-dashboard-container .recharts-tooltip-wrapper .recharts-default-tooltip {
            background-color: #ffffff !important;
            border-color: #e4e4e7 !important;
            color: #18181b !important;
          }
        `}</style>
      )}
      {/* Dynamic real-time calculations from orders */}
      {(() => {
        const todayStrStr = new Date().toDateString();
        const todayOrders = orders.filter(o => o.createdAt && new Date(o.createdAt).toDateString() === todayStrStr);
        const todaySalesVal = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const totalRevenueVal = orders.reduce((sum, o) => sum + o.totalAmount, 0);

        return (
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Dynamic Responsive Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Premium ERP Dashboard controls precisely matching the screenshot layout */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* 1. TODAY'S SALES CARD */}
                <div className={`p-6 rounded-[28px] border transition-all duration-300 relative overflow-hidden ${
                  isDark 
                    ? 'bg-zinc-900/60 border-zinc-800 text-white shadow-zinc-950/20' 
                    : 'bg-white border-slate-150 text-slate-800 shadow-lg shadow-slate-100/30'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-black tracking-widest text-slate-400 dark:text-zinc-500 uppercase">
                        TODAY'S SALES
                      </p>
                      <h4 className={`text-2xl sm:text-3xl font-black tracking-tight mt-1.5 font-sans ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                        ₹{todaySalesVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h4>
                    </div>
                    {/* Up Trend Icon Container */}
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner ${
                      isDark ? 'bg-emerald-950/40 text-emerald-400' : 'bg-[#ECFBF6] text-[#10B981]'
                    }`}>
                      <TrendingUp size={18} />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100/60 dark:border-zinc-800/40">
                    <button 
                      onClick={() => { 
                        setActiveTab('analytics');
                        setTimeout(() => {
                          const el = document.getElementById('analytics-invoices-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 150);
                      }} 
                      className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-all text-left"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      Click to see today's invoices
                    </button>
                  </div>
                </div>

                {/* 3. DIRECT WORKSPACE NAVIGATION WIDGET */}
                <div className={`p-6 rounded-[28px] border transition-all duration-300 ${
                  isDark 
                    ? 'bg-zinc-900/40 border-zinc-900' 
                    : 'bg-white border-slate-200/80 shadow-xl shadow-slate-100/10'
                }`}>
                  <div className="flex items-center gap-2.5 mb-5 pl-1">
                    <span className="w-3 h-3 rounded-full bg-blue-500 shadow-md shadow-blue-500/40 animate-pulse" />
                    <h3 className={`text-xs font-black tracking-widest uppercase ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>
                      DIRECT WORKSPACE
                    </h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    
                    {/* MAKE BILL / BILLING WORKSPACE */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('billing');
                        setTimeout(() => {
                          const el = document.getElementById('active-workspace-panel');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          
                          // Auto focus on customer WhatsApp input
                          const input = document.getElementById('customer-whatsapp-input');
                          if (input) {
                            input.focus();
                          }
                        }, 250);
                      }}
                      className={`w-full text-left p-4 rounded-[22px] border transition-all duration-200 flex items-center gap-3.5 cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${
                        activeTab === 'billing'
                          ? isDark 
                            ? 'bg-blue-950/30 border-blue-800/80 shadow-md shadow-blue-950/20' 
                            : 'bg-[#EFF3FE] border-blue-200 shadow-md shadow-blue-100/40'
                          : isDark 
                            ? 'bg-zinc-950/40 border-transparent hover:border-zinc-800' 
                            : 'bg-[#EFF3FE]/40 border-transparent hover:border-blue-100/60'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                        isDark ? 'bg-blue-900/40 text-blue-400' : 'bg-[#DCE7FC] text-[#2F6DF2]'
                      }`}>
                        <Receipt size={18} />
                      </div>
                      <div className="min-w-0 flex-1 font-sans">
                        <p className={`text-[11px] font-black tracking-wider uppercase leading-none ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                          {t('admin.quickBilling')}
                        </p>
                        <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-1 block">
                          {t('admin.billing')}
                        </span>
                      </div>
                    </button>

                    {/* ALL STOCKS / INVENTORY TABLE */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('stock');
                        setTimeout(() => {
                          const el = document.getElementById('active-workspace-panel');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }}
                      className={`w-full text-left p-4 rounded-[22px] border transition-all duration-200 flex items-center gap-3.5 cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${
                        activeTab === 'stock'
                          ? isDark 
                            ? 'bg-purple-950/30 border-purple-800/80 shadow-md shadow-purple-950/20' 
                            : 'bg-[#FDF2F4] border-purple-200 shadow-md shadow-purple-100/40'
                          : isDark 
                            ? 'bg-zinc-950/40 border-transparent hover:border-zinc-800' 
                            : 'bg-[#FDF2F4]/40 border-transparent hover:border-purple-100/60'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                        isDark ? 'bg-purple-900/40 text-purple-400' : 'bg-[#FADCE2] text-[#E91E63]'
                      }`}>
                        <Package size={18} />
                      </div>
                      <div className="min-w-0 flex-1 font-sans">
                        <p className={`text-[11px] font-black tracking-wider uppercase leading-none ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                          {t('admin.products')}
                        </p>
                        <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-1 block">
                          {t('store.stock')}
                        </span>
                      </div>
                    </button>

                    {/* REPORTS / ANALYTICS */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('analytics');
                        setTimeout(() => {
                          const el = document.getElementById('active-workspace-panel');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }}
                      className={`w-full text-left p-4 rounded-[22px] border transition-all duration-200 flex items-center gap-3.5 cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${
                        activeTab === 'analytics'
                          ? isDark 
                            ? 'bg-indigo-950/30 border-indigo-800/80 shadow-md shadow-indigo-950/20' 
                            : 'bg-[#F3EFFF] border-indigo-200 shadow-md shadow-indigo-100/40'
                          : isDark 
                            ? 'bg-zinc-950/40 border-transparent hover:border-zinc-800' 
                            : 'bg-[#F3EFFF]/40 border-transparent hover:border-indigo-100/60'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                        isDark ? 'bg-indigo-900/40 text-indigo-400' : 'bg-[#E5DCFC] text-[#7C4DFF]'
                      }`}>
                        <BarChart2 size={18} />
                      </div>
                      <div className="min-w-0 flex-1 font-sans">
                        <p className={`text-[11px] font-black tracking-wider uppercase leading-none ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                          {t('admin.sales')}
                        </p>
                        <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-1 block">
                          {t('admin.salesHistory')}
                        </span>
                      </div>
                    </button>

                    {/* LIST ITEM / NEW ENTRY */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('catalogue');
                        setEditProductId(null);
                        setFormData({
                          id: '',
                          name: '',
                          category: 'Men',
                          subCategory: 'Office Wear',
                          sizesStr: '6,7,8,9,10,11,12',
                          price: 99,
                          stock: 20,
                          description: '',
                          imageUrl: ''
                        });
                        setIsAddingProduct(true);
                        setTimeout(() => {
                          const el = document.getElementById('active-workspace-panel');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }}
                      className={`w-full text-left p-4 rounded-[22px] border transition-all duration-200 flex items-center gap-3.5 cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${
                        activeTab === 'catalogue'
                          ? isDark 
                            ? 'bg-amber-950/30 border-amber-800/80 shadow-md shadow-amber-950/20' 
                            : 'bg-[#FEF9EC] border-amber-200 shadow-md shadow-amber-100/40'
                          : isDark 
                            ? 'bg-zinc-950/40 border-transparent hover:border-zinc-800' 
                            : 'bg-[#FEF9EC]/40 border-transparent hover:border-amber-100/60'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                        isDark ? 'bg-amber-900/40 text-amber-400' : 'bg-[#FDF0CE] text-[#FFB300]'
                      }`}>
                        <Plus size={18} />
                      </div>
                      <div className="min-w-0 flex-1 font-sans">
                        <p className={`text-[11px] font-black tracking-wider uppercase leading-none ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                          {t('admin.addNewProduct')}
                        </p>
                        <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-1 block">
                          {t('admin.products')}
                        </span>
                      </div>
                    </button>

                    {/* BRAND CONFIG (ERP) */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('erp');
                        setTimeout(() => {
                          const el = document.getElementById('active-workspace-panel');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }}
                      className={`w-full text-left p-4 rounded-[22px] border transition-all duration-200 flex items-center gap-3.5 cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${
                        activeTab === 'erp'
                          ? isDark 
                            ? 'bg-pink-950/30 border-pink-800/80 shadow-md shadow-pink-950/20' 
                            : 'bg-[#FFF0F5] border-pink-200 shadow-md shadow-pink-100/40'
                          : isDark 
                            ? 'bg-zinc-950/40 border-transparent hover:border-zinc-800' 
                            : 'bg-[#FFF0F5]/40 border-transparent hover:border-pink-100/60'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                        isDark ? 'bg-pink-900/40 text-pink-400' : 'bg-[#FFD1E1] text-[#E91E63]'
                      }`}>
                        <Cpu size={18} />
                      </div>
                      <div className="min-w-0 flex-1 font-sans">
                        <p className={`text-[11px] font-black tracking-wider uppercase leading-none ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                          {t('admin.brandConfig')}
                        </p>
                        <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-1 block">
                          {t('admin.brandConfig')}
                        </span>
                      </div>
                    </button>

                  </div>
                </div>

              </div>
              
              {/* Right Column: Active Tab Work Content */}
              <div id="active-workspace-panel" className="lg:col-span-8 w-full space-y-6 scroll-mt-24">
                
                {/* Visual Active Header Identifier */}
                <div className={`p-4 rounded-2xl border flex items-center gap-2.5 ${
                  isDark ? 'bg-zinc-900/20 border-zinc-900/40' : 'bg-slate-50 border-slate-100'
                }`}>
                  <span className={`w-2 h-2 rounded-full animate-ping ${
                    activeTab === 'billing' ? 'bg-blue-500' :
                    activeTab === 'stock' ? 'bg-emerald-500' :
                    activeTab === 'analytics' ? 'bg-indigo-500' :
                    activeTab === 'catalogue' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Active Module: {activeTab === 'billing' ? 'Billing Workspace' :
                                    activeTab === 'stock' ? 'Stock Management' :
                                    activeTab === 'analytics' ? 'Sales analytics & Reports' :
                                    activeTab === 'catalogue' ? 'Products Catalogue' : 'ERP System Settings'}
                  </span>
                </div>


        {/* --- BILLING DESK PANEL --- */}
        {activeTab === 'billing' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
            
            {/* Left: Input Desk & Quick-Add (7 Cols) */}
            <div className={`lg:col-span-7 p-6 md:p-8 space-y-6 border transition-all duration-300 rounded-3xl ${
              isDark 
                ? 'bg-zinc-900/60 border-zinc-800 text-white shadow-2xl shadow-black/20' 
                : 'bg-white border-slate-100 text-slate-900 shadow-xl shadow-slate-100/30'
            }`}>
              
              {/* Header */}
              <div className={`flex items-center justify-between pb-5 border-b ${
                isDark ? 'border-zinc-800' : 'border-slate-100'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl shadow-sm ${
                    isDark ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/40' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    <FileText size={20} className="stroke-[2.5px]" />
                  </div>
                  <div>
                    <h3 className={`font-black uppercase tracking-wider text-sm sm:text-base flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 leading-tight ${
                      isDark ? 'text-zinc-100' : 'text-[#111C44]'
                    }`}>
                      <span>Prashant Footwear</span>
                      <span className={`font-black text-[10px] px-2 py-0.5 rounded-md border tracking-widest ${
                        isDark 
                          ? 'text-indigo-400 border-indigo-900/50 bg-indigo-950/20' 
                          : 'text-[#5A67F2] border-indigo-100/60 bg-indigo-50/50'
                      }`}>BILLING CENTER</span>
                    </h3>
                  </div>
                </div>
                <div className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest font-mono shrink-0 hidden sm:flex items-center gap-1.5 animate-pulse ${
                  isDark
                    ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/50'
                    : 'text-emerald-600 bg-emerald-50 border-emerald-100/80'
                }`}>
                  <Wifi size={10} className="stroke-[2.5px]" /> STATION ONLINE
                </div>
              </div>

              {billingError && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs rounded-2xl font-bold flex items-center gap-2 animate-pulse">
                  <AlertTriangle size={14} className="shrink-0" /> {billingError}
                </div>
              )}
              {billingSuccess && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-2xl font-bold flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" /> {billingSuccess}
                </div>
              )}

              {/* STEP 1: CUSTOMER NAME & WHATSAPP (OPTIONAL) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* CUSTOMER NAME (OPTIONAL) */}
                <div className="space-y-2">
                  <label className={`text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                    isDark ? 'text-zinc-300' : 'text-slate-700'
                  }`}>
                    <User size={14} className={isDark ? 'text-zinc-400' : 'text-slate-400'} /> CUSTOMER NAME
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Walk-in / Enter client name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={`w-full rounded-2xl py-3 px-4 text-xs font-semibold outline-none transition-all duration-300 shadow-sm ${
                        isDark 
                          ? 'bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10' 
                          : 'bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#5A67F2] focus:ring-4 focus:ring-[#5A67F2]/10'
                      }`}
                    />
                  </div>
                </div>

                {/* CUSTOMER WHATSAPP (OPTIONAL) */}
                <div className="space-y-2">
                  <label className={`text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                    isDark ? 'text-zinc-300' : 'text-slate-700'
                  }`}>
                    <MessageSquare size={14} className={isDark ? 'text-zinc-400' : 'text-slate-400'} /> CUSTOMER WHATSAPP
                  </label>
                  <div className="relative">
                    <input
                      id="customer-whatsapp-input"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      value={billingMobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setBillingMobile(val);
                      }}
                      className={`w-full rounded-2xl py-3 px-4 text-xs font-bold font-mono outline-none transition-all duration-300 shadow-sm ${
                        isDark 
                          ? 'bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10' 
                          : 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#5A67F2] focus:ring-4 focus:ring-[#5A67F2]/10'
                      }`}
                    />
                  </div>

                  {/* Direct Whatsapp button action */}
                  {billingMobile.length === 10 && (
                    <div className="flex items-center gap-2 mt-2 animate-fade-in">
                      <button
                        type="button"
                        onClick={() => window.open(`https://wa.me/91${billingMobile}`, '_blank')}
                        className={`py-1.5 px-3 border text-[9px] font-black rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                          isDark
                            ? 'bg-emerald-950/30 hover:bg-emerald-900/30 border-emerald-900/50 text-emerald-400'
                            : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100 text-emerald-700'
                        }`}
                      >
                        <MessageSquare size={12} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} /> Open Chat with {billingMobile}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {showNextSteps ? (
                <div className={`border rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-sm ${
                  isDark ? 'bg-zinc-950/40 border-zinc-800' : 'bg-emerald-50/50 border-emerald-100'
                }`}>
                  <div className="space-y-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-1 border ${
                      isDark ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' : 'bg-emerald-100 border-emerald-200 text-emerald-600'
                    }`}>
                      <Check size={24} className="stroke-[3.5px]" />
                    </div>
                    <h3 className={`text-base sm:text-lg font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>Style Added to Draft Bill!</h3>
                    <p className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Would you like to add another item, or process checkout now?</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3.5 justify-center max-w-md mx-auto">
                    {/* Add One More Item */}
                    <button
                      type="button"
                      onClick={() => setShowNextSteps(false)}
                      className={`flex-1 py-3.5 px-5 rounded-xl border font-black text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-97 ${
                        isDark 
                          ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300' 
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <Plus size={15} className="stroke-[3px]" /> Add One More Item
                    </button>

                    {/* Make Invoice */}
                    <button
                      type="button"
                      onClick={handleCheckoutBill}
                      className="flex-1 py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10 active:scale-97"
                    >
                      <FileText size={15} className="stroke-[2.5px]" /> Make Invoice
                    </button>
                  </div>
                </div>
              ) : (
                /* ⚡ STEP 3: FAST POS ENTRY WORKSPACE */
                <div className={`rounded-3xl p-6 space-y-5 border transition-all duration-300 ${
                  isDark
                    ? 'bg-zinc-950/40 border-zinc-800/80'
                    : 'bg-slate-50/70 border-slate-200/60'
                }`}>
                  
                  {/* Inner Header with Lightning & Plus & Fast POS Entry text */}
                  <div className={`flex items-center justify-between pb-3 border-b ${
                    isDark ? 'border-zinc-800/80' : 'border-slate-200/60'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-lg ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                        <Zap size={14} className="text-amber-500 fill-amber-500/30 animate-pulse" />
                      </div>
                      <span className={`font-black text-[10px] sm:text-xs uppercase tracking-wider ${
                        isDark ? 'text-zinc-300' : 'text-slate-700'
                      }`}>
                        SEARCH OR ADD FOOTWEAR STYLE
                      </span>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-200/60 text-slate-500'
                    }`}>
                      FAST POS ENTRY
                    </span>
                  </div>

                  {/* Inputs Grid */}
                  <div className="space-y-4">
                    
                    {/* Article Number input */}
                    <div className="space-y-1.5 relative">
                      <label className={`text-[10px] font-black uppercase tracking-wider block ${
                        isDark ? 'text-zinc-400' : 'text-slate-600'
                      }`}>
                        ARTICLE NUMBER
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                          <Search size={14} />
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. Style Code or Name"
                          value={billingArticleNumber}
                          onFocus={() => setIsArticleDropdownOpen(true)}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBillingArticleNumber(val);
                            setIsArticleDropdownOpen(true);
                            const matched = products.find(p => p.id.toLowerCase() === val.trim().toLowerCase());
                            if (matched) {
                              setBillingPrice(matched.price);
                              setSelectedBillProdId(matched.id);
                              if (matched.sizes.length > 0) {
                                setSelectedBillSize(matched.sizes[0]);
                              }
                            }
                          }}
                          className={`w-full rounded-2xl py-3 pl-10 pr-10 text-xs font-bold outline-none font-mono transition-all duration-300 shadow-sm ${
                            isDark
                              ? 'bg-zinc-900 border border-zinc-800 text-white focus:border-indigo-500'
                              : 'bg-white border border-slate-200 text-slate-900 focus:border-[#5A67F2]'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setIsArticleDropdownOpen(!isArticleDropdownOpen)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                        >
                          <ChevronDown size={16} className={`transition-transform duration-200 ${isArticleDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      {/* Dropdown list */}
                      {isArticleDropdownOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setIsArticleDropdownOpen(false)} 
                          />
                          <div className={`absolute z-20 w-full rounded-2xl shadow-2xl mt-1.5 overflow-hidden border max-h-[220px] overflow-y-auto divide-y ${
                            isDark 
                              ? 'bg-zinc-900 border-zinc-800 divide-zinc-800/50' 
                              : 'bg-white border-slate-200 divide-slate-100'
                          }`}>
                            {products.filter(p => 
                              !billingArticleNumber || 
                              p.id.toLowerCase().includes(billingArticleNumber.toLowerCase()) ||
                              p.name.toLowerCase().includes(billingArticleNumber.toLowerCase())
                            ).length === 0 ? (
                              <div className="p-4 text-center text-xs text-zinc-400 font-mono uppercase">
                                No Footwear Styles Found
                              </div>
                            ) : (
                              products
                                .filter(p => 
                                  !billingArticleNumber || 
                                  p.id.toLowerCase().includes(billingArticleNumber.toLowerCase()) ||
                                  p.name.toLowerCase().includes(billingArticleNumber.toLowerCase())
                                )
                                .map(p => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                      setBillingArticleNumber(p.id);
                                      setBillingPrice(p.price);
                                      setSelectedBillProdId(p.id);
                                      if (p.sizes.length > 0) {
                                        setSelectedBillSize(p.sizes[0]);
                                      }
                                      setBillingError(null);
                                      setIsArticleDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-3.5 py-3 transition-colors flex justify-between items-center text-xs cursor-pointer gap-2 ${
                                      isDark ? 'hover:bg-zinc-800/60' : 'hover:bg-slate-50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-9 h-9 rounded-lg bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200/50">
                                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className={`font-black truncate uppercase text-[11px] ${
                                          isDark ? 'text-zinc-200' : 'text-slate-800'
                                        }`}>{p.name}</p>
                                        <p className="text-[9px] text-zinc-400 font-mono">ID: {p.id} • Stock: {p.stock} • UK {p.sizes.join(',')}</p>
                                      </div>
                                    </div>
                                    <span className="font-mono font-black text-emerald-500 shrink-0">₹{p.price}</span>
                                  </button>
                                ))
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Grid of Size & Price & Qty */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      {/* Size Selection */}
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-black uppercase tracking-wider block ${
                          isDark ? 'text-zinc-400' : 'text-slate-600'
                        }`}>
                          SIZE
                        </label>
                        <select
                          value={selectedBillSize || ''}
                          onChange={(e) => setSelectedBillSize(Number(e.target.value))}
                          className={`w-full rounded-2xl py-3 px-3 text-xs font-bold outline-none transition-all duration-300 cursor-pointer ${
                            isDark
                              ? 'bg-zinc-900 border border-zinc-800 text-white focus:border-indigo-500'
                              : 'bg-white border border-slate-200 text-slate-900 focus:border-[#5A67F2]'
                          }`}
                        >
                          <option value="">Select Size</option>
                          {billingSelectedProduct ? (
                            billingSelectedProduct.sizes.map(sz => (
                              <option key={sz} value={sz}>UK {sz}</option>
                            ))
                          ) : (
                            [5, 6, 7, 8, 9, 10, 11, 12, 13].map(sz => (
                              <option key={sz} value={sz}>UK {sz}</option>
                            ))
                          )}
                        </select>
                      </div>

                      {/* Price Input (₹) */}
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-black uppercase tracking-wider block ${
                          isDark ? 'text-zinc-400' : 'text-slate-600'
                        }`}>
                          PRICE (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-emerald-500 font-black text-xs font-mono pointer-events-none">
                            ₹
                          </span>
                          <input
                            type="number"
                            placeholder="Price"
                            value={billingPrice}
                            onChange={(e) => setBillingPrice(e.target.value ? Number(e.target.value) : '')}
                            className={`w-full rounded-2xl py-3 pl-7 pr-3 text-xs font-black outline-none font-mono transition-all duration-300 ${
                              isDark
                                ? 'bg-zinc-900 border border-emerald-950/80 text-white focus:border-emerald-500'
                                : 'bg-white border border-emerald-600/80 focus:border-emerald-700 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Quantity Input */}
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-black uppercase tracking-wider block ${
                          isDark ? 'text-zinc-400' : 'text-slate-600'
                        }`}>
                          QTY
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            value={selectedBillQty}
                            onChange={(e) => setSelectedBillQty(Math.max(1, Number(e.target.value)))}
                            className={`w-full rounded-2xl py-3 px-3 text-center font-black text-xs outline-none font-mono transition-all duration-300 ${
                              isDark
                                ? 'bg-zinc-900 border border-zinc-800 text-white focus:border-indigo-500'
                                : 'bg-white border border-slate-200 text-slate-900 focus:border-[#5A67F2]'
                            }`}
                          />
                        </div>
                      </div>

                    </div>

                    {/* Solid green addition button */}
                    <button
                      type="button"
                      onClick={handleAddBillItem}
                      className="w-full py-3.5 rounded-2xl bg-[#00966B] hover:bg-[#007A55] text-white text-xs font-black tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-98"
                    >
                      <Plus size={15} className="stroke-[3.5px]" /> ADD TO DRAFT BILL
                    </button>

                  </div>
                </div>
              )}



              {/* ⚡ STEP 5: SELECT PAYMENT MODE */}
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-wider block ${
                  isDark ? 'text-zinc-400' : 'text-slate-600'
                }`}>
                  [05] SELECT PAYMENT OPTION
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200/60 dark:border-zinc-800/80">
                  {['Cash', 'UPI'].map(pm => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setBillingPayment(pm)}
                      className={`py-3 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        billingPayment === pm 
                          ? 'bg-white dark:bg-zinc-900 text-slate-950 dark:text-white shadow-md font-black border border-slate-200/50 dark:border-zinc-800' 
                          : 'text-slate-500 hover:text-slate-950 dark:hover:text-zinc-300'
                      }`}
                    >
                      {pm === 'Cash' ? (
                        <>
                          <Coins size={12} className="text-amber-500" />
                          <span>💵 CASH</span>
                        </>
                      ) : (
                        <>
                          <QrCode size={12} className="text-indigo-500" />
                          <span>📱 UPI / QR</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right: Digital Thermal Receipt Workstation (5 Cols) */}
            <div className={`lg:col-span-5 border rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 ${
              isDark 
                ? 'bg-zinc-950 border-zinc-900 text-zinc-100' 
                : 'bg-slate-900 border-slate-800 text-white'
            }`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                {/* Header */}
                <h3 className="font-mono text-xs uppercase tracking-widest text-zinc-400 flex items-center justify-between border-b border-zinc-800/80 pb-4">
                  <span className="flex items-center gap-2">
                    <FileText size={14} className="text-gold" /> In-Store Draft Bill
                  </span>
                  <span className="text-zinc-500 font-bold font-mono">
                    {billingItems.length} Styles
                  </span>
                </h3>

                {/* Thermal Ticket Container */}
                <div className="bg-white text-zinc-950 font-mono text-[11px] p-5 rounded-2xl border border-zinc-200 shadow-inner mt-4 overflow-hidden max-h-[360px] overflow-y-auto relative">
                  
                  {/* Real thermal paper serrated/jagged edge effect */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-200/40 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Shop Details */}
                  <div className="text-center space-y-1 mb-4">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider">PRASHANT FOOTWEAR</h4>
                    <p className="text-[9px] text-zinc-500 font-sans">On old Kupwad Road, Lovley Circle Sangli</p>
                    <p className="text-[9px] text-zinc-500 font-sans">Tel: +91 95112 44447</p>
                    <p className="text-[9px] text-zinc-500">---------------------------------------</p>
                    <p className="text-[9px] font-black text-left uppercase">Client: {customerName || 'Walk-in Client'}</p>
                    {billingMobile && <p className="text-[9px] font-black text-left uppercase">Mobile: +91 {billingMobile}</p>}
                    <p className="text-[9px] text-zinc-500">---------------------------------------</p>
                  </div>

                  {/* Items List */}
                  {billingItems.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400 text-[10px] uppercase font-bold">
                      -- NO ITEMS ADDED TO DRAFT --
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between font-black text-[9px] text-zinc-600">
                        <span>ITEM DESCRIPTION</span>
                        <span>QTY/PRICE</span>
                      </div>
                      
                      {billingItems.map((item, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between items-start">
                            <span className="font-black truncate max-w-[140px] uppercase">{item.product.name}</span>
                            <span className="font-black">₹{item.product.price * item.quantity}</span>
                          </div>
                          <div className="flex justify-between text-[9px] text-zinc-500">
                            <span>UK {item.size} • Qty: {item.quantity} x ₹{item.product.price}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveBillItem(idx)}
                              className="text-rose-600 font-extrabold hover:underline uppercase tracking-tight text-[8px] ml-2 cursor-pointer"
                            >
                              [REMOVE]
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Separator */}
                  <div className="text-center text-zinc-400 text-[9px] my-3">
                    ---------------------------------------
                  </div>

                  {/* Tax & Discount Details */}
                  {billingItems.length > 0 && (() => {
                    const sub = billingItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
                    const disc = billingDiscountType === 'percent'
                      ? Math.round((sub * billingDiscountValue) / 100)
                      : billingDiscountValue;
                    const finalVal = Math.max(0, sub - disc);
                    return (
                      <div className="space-y-1.5 text-[10px]">
                        <div className="flex justify-between text-zinc-600 font-bold">
                          <span>SUB-TOTAL:</span>
                          <span>₹{sub}</span>
                        </div>
                        {disc > 0 && (
                          <div className="flex justify-between text-rose-600 font-extrabold">
                            <span>DISCOUNT:</span>
                            <span>-₹{disc}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-black border-t border-zinc-200 pt-2 text-xs text-zinc-950">
                          <span>NET INVOICE TOTAL:</span>
                          <span>₹{finalVal}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Footer message */}
                  <div className="text-center text-[8px] text-zinc-400 mt-5 space-y-1">
                    <p>-- THANK YOU FOR SHOPPING! --</p>
                    <p>GOODS ONCE SOLD WILL NOT BE REFUNDED</p>
                    <p>EXCHANGE WITHIN 7 DAYS WITH VALID BILL</p>
                  </div>

                </div>
              </div>

              {/* Invoice Summary and Checkout Call to Action */}
              {billingItems.length > 0 && (() => {
                const sub = billingItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
                const disc = billingDiscountType === 'percent'
                  ? Math.round((sub * billingDiscountValue) / 100)
                  : billingDiscountValue;
                const finalVal = Math.max(0, sub - disc);
                return (
                  <div className="pt-5 border-t border-zinc-800/80 mt-5 space-y-4">
                    <div className="flex justify-between font-mono text-xs text-zinc-400">
                      <span>DRAFT BILL NET:</span>
                      <span>₹{sub}</span>
                    </div>
                    {disc > 0 && (
                      <div className="flex justify-between font-mono text-xs text-rose-400 font-bold">
                        <span>DISCOUNT DEDUCTION:</span>
                        <span>-₹{disc}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-mono text-base font-black border-t border-zinc-800/40 pt-3">
                      <span className="text-white uppercase tracking-wider text-xs flex items-center">GRAND TOTAL VALUE:</span>
                      <span className="text-gold font-mono text-lg font-black">₹{finalVal}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCheckoutBill}
                      className="w-full py-4 rounded-xl bg-gold hover:bg-yellow-400 text-black font-extrabold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 shadow-xl shadow-gold/10 cursor-pointer active:scale-98"
                    >
                      <Check size={14} className="stroke-[3px]" /> PROCESS INVOICE CHECKOUT
                    </button>
                  </div>
                );
              })()}
            </div>
            </div>

            {/* Receipt Modal Display (checkoutReceipt) */}
            {checkoutReceipt && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full text-zinc-100 shadow-2xl relative flex flex-col justify-between">
                  
                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => setCheckoutReceipt(null)}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all cursor-pointer"
                  >
                    <X size={16} />
                  </button>

                  <div className="space-y-5">
                    {/* Success Icon */}
                    <div className="text-center space-y-1">
                      <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Check size={22} className="stroke-[3px]" />
                      </div>
                      <h4 className="font-extrabold text-sm uppercase tracking-wider text-emerald-400">Invoice Issued Successfully</h4>
                      <p className="text-[10px] font-mono text-zinc-500">Invoice ID: {checkoutReceipt.id}</p>
                    </div>

                    {/* Printable Thermal Receipt Container */}
                    <div id="printable-thermal-receipt" className="bg-white text-zinc-950 font-mono text-[10px] p-4 rounded-xl border border-zinc-300 shadow-inner max-h-[300px] overflow-y-auto">
                      <div className="text-center space-y-0.5 mb-3">
                        <p className="font-extrabold text-xs">PRASHANT FOOTWEAR</p>
                        <p className="text-[8px] text-zinc-500">On old Kupwad Road, Lovley Circle Sangli</p>
                        <p className="text-[8px] text-zinc-500">Tel: +91 95112 44447</p>
                        <p className="text-[8px] text-zinc-500">---------------------------------------</p>
                        <p className="text-[8px] text-left">INVOICE: {checkoutReceipt.id}</p>
                        <p className="text-[8px] text-left">DATE: {checkoutReceipt.date}</p>
                        <p className="text-[8px] text-left">CLIENT: {checkoutReceipt.customerName}</p>
                        <p className="text-[8px] text-left">MOBILE: +91 {checkoutReceipt.customerMobile}</p>
                        <p className="text-[8px] text-zinc-500">---------------------------------------</p>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {checkoutReceipt.items.map((it: any, index: number) => (
                          <div key={index} className="flex justify-between">
                            <span>{it.name} (UK {it.size}) x{it.quantity}</span>
                            <span>₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-[8px] text-zinc-500 text-center my-2">---------------------------------------</p>

                      {/* Totals */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>SUBTOTAL:</span>
                          <span>₹{checkoutReceipt.subtotal}</span>
                        </div>
                        {checkoutReceipt.discount > 0 && (
                          <div className="flex justify-between text-rose-600 font-bold">
                            <span>DISCOUNT:</span>
                            <span>-₹{checkoutReceipt.discount}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-black text-xs border-t border-zinc-200 pt-1.5 mt-1">
                          <span>GRAND TOTAL:</span>
                          <span>₹{checkoutReceipt.totalAmount}</span>
                        </div>
                        <div className="flex justify-between text-[8px] text-zinc-500 mt-1">
                          <span>PAYMENT MODE:</span>
                          <span className="uppercase">{checkoutReceipt.paymentMethod}</span>
                        </div>
                      </div>

                      {/* Barcode Mockup */}
                      <div className="text-center mt-4 pt-2 border-t border-zinc-200 space-y-1">
                        <div className="h-6 w-32 bg-zinc-950 mx-auto flex items-center justify-between px-2 text-[6px] text-white">
                          |||| | ||||| ||| || ||||| | ||||
                        </div>
                        <p className="text-[7px] text-zinc-400">Scan Receipt to Track</p>
                        <p className="text-[7px] text-emerald-600 font-extrabold mt-1">LINK: {window.location.origin}/?invoiceId={checkoutReceipt.id}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {/* Print Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const printContent = document.getElementById('printable-thermal-receipt')?.innerHTML;
                          const win = window.open('', '', 'width=600,height=600');
                          if (win) {
                            win.document.write(`
                              <html>
                                <head>
                                  <title>Prashant Footwear Invoice Receipt</title>
                                  <style>
                                    body { font-family: monospace; padding: 20px; font-size: 12px; line-height: 1.4; color: #000; background: #fff; max-width: 300px; margin: 0 auto; }
                                    .text-center { text-align: center; }
                                    .flex { display: flex; justify-content: space-between; }
                                    .font-black { font-weight: bold; }
                                    .font-bold { font-weight: bold; }
                                    .text-xs { font-size: 12px; }
                                    .text-[8px] { font-size: 10px; }
                                    .my-2 { margin-top: 8px; margin-bottom: 8px; }
                                    .mt-4 { margin-top: 16px; }
                                    .pt-2 { padding-top: 8px; }
                                    .border-t { border-top: 1px dashed #000; }
                                    .text-emerald-600 { color: #10b981; font-weight: bold; }
                                  </style>
                                </head>
                                <body>
                                  ${printContent}
                                  <script>window.print(); window.close();</script>
                                </body>
                              </html>
                            `);
                            win.document.close();
                          }
                        }}
                        className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-97"
                      >
                        <Printer size={14} /> Print Receipt
                      </button>

                      {/* WhatsApp Share Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const invoiceLink = `${window.location.origin}/?invoiceId=${checkoutReceipt.id}`;
                          const waText = `*PRASHANT FOOTWEAR* 🧾%0A----------------------------%0A*Invoice:* ${checkoutReceipt.id}%0A*Customer:* ${checkoutReceipt.customerName}%0A*Date:* ${checkoutReceipt.date}%0A----------------------------%0A*Items:*%0A${checkoutReceipt.items.map((it: any) => `- ${it.name} (UK ${it.size}) x${it.quantity} = ₹${it.price * it.quantity}`).join('%0A')}%0A----------------------------%0A*Subtotal:* ₹${checkoutReceipt.subtotal}%0A${checkoutReceipt.discount > 0 ? `*Discount:* -₹${checkoutReceipt.discount}%0A` : ''}*Grand Total:* *₹${checkoutReceipt.totalAmount}*%0A*Paid via:* ${checkoutReceipt.paymentMethod}%0A----------------------------%0A*View and Print Invoice:*%0A${invoiceLink}%0A%0A_Thank you for shopping with us!_ 🙏`;
                          window.open(`https://wa.me/91${checkoutReceipt.customerMobile}?text=${waText}`, '_blank');
                        }}
                        className="py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Share2 size={14} /> Send WhatsApp
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCheckoutReceipt(null)}
                      className="w-full py-3 rounded-xl bg-gold text-black font-extrabold text-xs uppercase tracking-wider text-center mt-2 cursor-pointer"
                    >
                      Start Fresh Sale
                    </button>

                  </div>
                </div>
              </div>
            )}

            {/* Generated Invoice History Logs */}
            <div className={`border rounded-3xl p-6 md:p-8 space-y-6 ${
              isDark ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white border-slate-200/80 shadow-xl shadow-slate-100/40'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-100 dark:border-zinc-900">
                <div>
                  <h4 className={`text-base font-black uppercase tracking-wider flex items-center gap-2 ${
                    isDark ? 'text-zinc-100' : 'text-slate-950'
                  }`}>
                    <Receipt size={18} className="text-[#5A67F2]" /> GENERATED INVOICE HISTORY LOGS
                  </h4>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">
                    Live history of all local and cloud invoices ({orders.length} total sales)
                  </p>
                </div>
                {orders.length > 0 && (
                  <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-full border border-emerald-100/30">
                    Active Session
                  </span>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <p className="text-sm font-bold text-zinc-400">No invoices generated yet</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Start selling above to generate your first tax invoice</p>
                </div>
              ) : (
                <div className={`divide-y max-h-[500px] overflow-y-auto pr-2 ${
                  isDark ? 'divide-zinc-900/60' : 'divide-slate-100'
                }`}>
                  {[...orders]
                    .sort((a, b) => {
                      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                      return timeB - timeA;
                    })
                    .map((order, idx) => {
                      const isWalkInName = (name?: string) => {
                        if (!name) return true;
                        const n = name.trim().toLowerCase();
                        return n === '' || n === 'walk-in client' || n === 'walk-in' || n === 'walk-in customer' || n === 'walk in' || n === 'walk_in';
                      };

                      const isWalkInMobile = (mobile?: string) => {
                        if (!mobile) return true;
                        const m = mobile.trim().toLowerCase();
                        return m === '' || m === 'walk-in' || m === 'n/a' || m === 'walk-in client' || m === 'walk in' || m === 'none';
                      };

                      const showClient = !isWalkInName(order.customerName);
                      const showMobile = !isWalkInMobile(order.customerMobile);

                      return (
                        <div key={order.id || idx} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className={`font-mono text-xs font-black ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>
                                #{order.id}
                              </span>
                              <span className="font-mono text-[9px] text-zinc-400">
                                {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'N/A'}
                              </span>
                            </div>
                            {(showClient || showMobile) && (
                              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex flex-wrap gap-x-4 gap-y-1">
                                {showClient && (
                                  <span>Client: <strong className={isDark ? 'text-zinc-300' : 'text-slate-700'}>{order.customerName}</strong></span>
                                )}
                                {showMobile && (
                                  <span>Mobile: <strong className={isDark ? 'text-zinc-300' : 'text-slate-700'}>{order.customerMobile}</strong></span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 justify-between md:justify-end shrink-0">
                            <div className="font-mono text-left md:text-right">
                              <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                ₹{order.totalAmount}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* View Action to open the invoice modal in the app */}
                              <button
                                type="button"
                                onClick={() => {
                                  const receiptData = {
                                    id: order.id,
                                    customerMobile: order.customerMobile || 'Walk-In',
                                    customerName: order.customerName || 'Walk-in Client',
                                    items: order.items,
                                    subtotal: order.subtotal || order.items.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0),
                                    discount: order.discount || 0,
                                    totalAmount: order.totalAmount,
                                    paymentMethod: order.paymentMethod,
                                    date: order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN')
                                  };
                                  setCheckoutReceipt(receiptData);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-97"
                                title="Open Tax Invoice"
                              >
                                <FileText size={12} /> View Invoice
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* --- STOCK ROOMS TAB --- */}
        {activeTab === 'stock' && (
          <div id="inventory-table-container" className={`border rounded-3xl p-6 md:p-8 space-y-6 ${
            isDark ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white border-slate-200/80 shadow-xl shadow-slate-100/40'
          }`}>
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
              isDark ? 'border-zinc-900' : 'border-slate-100'
            }`}>
              <div>
                <h3 className={`text-lg font-bold uppercase tracking-tight flex items-center gap-2 ${
                  isDark ? 'text-zinc-100' : 'text-slate-900 font-black'
                }`}>
                  <Package size={18} className="text-gold shrink-0" /> Stock & Inventory Management
                </h3>
                <p className="text-xs text-zinc-500 mt-1">Monitor real-time shoe sizes, current warehouse stock, and change unit pricing instantly.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  Showing {filteredStockProducts.length} of {products.length} Styles
                </span>
              </div>
            </div>

            {/* Elegant UI-Designer Selection Matrix */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${
              isDark ? 'bg-zinc-950/40 border-zinc-900' : 'bg-slate-50/50 border-slate-200/60 shadow-sm'
            } space-y-5`}>
              {/* Category Filter Level */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full"></span>
                  <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Filter By Category
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['Men', 'Women', 'Kids'] as const).map((cat) => {
                    const count = products.filter(p => p.category === cat).length;
                    const isSelected = selectedStockCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedStockCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-2 ${
                          isSelected
                            ? isDark 
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/10' 
                              : 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : isDark
                              ? 'bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-900/80'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                        }`}
                      >
                        <span className="tracking-wide">
                          {cat === 'Men' ? '👨 Men' : cat === 'Women' ? '👩 Women' : '👶 Kids'}
                        </span>
                        <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : isDark ? 'bg-zinc-950 text-zinc-500 border border-zinc-800' : 'bg-slate-100 text-slate-500'
                        }`}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brand Filter Level */}
              <div className="space-y-2 pt-3 border-t border-zinc-200/20 dark:border-zinc-800/40">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-amber-500 rounded-full"></span>
                  <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Filter By Brand
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {(['Walkaroo', 'Walkmate', 'Paragon', 'Indus', 'Bairathi', 'Yono'] as const).map((brand) => {
                    const count = products.filter(p => getProductBrand(p) === brand).length;
                    const isSelected = selectedStockBrand === brand;
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => setSelectedStockBrand(brand)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex flex-col items-center justify-center gap-1 text-center ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/80 text-amber-500 shadow-sm'
                            : isDark
                              ? 'bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-900/80'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                        }`}
                      >
                        <span className="text-[10px] font-black tracking-wider uppercase">{brand}</span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                          isSelected 
                            ? 'bg-amber-500/20 text-amber-500'
                            : isDark ? 'bg-zinc-950 text-zinc-500' : 'bg-slate-50 text-slate-400'
                        }`}>{count} styles</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Inventory table */}
            <div className="overflow-x-auto rounded-2xl border border-zinc-900/10 dark:border-zinc-800/40">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-[10px] font-mono uppercase tracking-widest ${
                    isDark ? 'border-zinc-900 text-zinc-500 bg-zinc-900/10' : 'border-slate-100 text-slate-400 bg-slate-50/50'
                  }`}>
                    <th className="p-4 font-black">Footwear Style / ID</th>
                    <th className="p-4 font-black">Category & Brand</th>
                    <th className="p-4 font-black text-center">Unit Price (₹)</th>
                    <th className="p-4 font-black text-center">In-Stock On Hand</th>
                    <th className="p-4 font-black">Quick Restock Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs ${
                  isDark ? 'divide-zinc-900/60' : 'divide-slate-100'
                }`}>
                  {filteredStockProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center font-mono text-zinc-500">
                        No styles match the chosen category or brand filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStockProducts.map(p => {
                      const isOutOfStock = p.stock === 0;
                      const isLowStock = p.stock > 0 && p.stock <= 5;
                      const currentBrand = getProductBrand(p);
                      return (
                        <tr key={p.id} className={`transition-colors ${
                          isDark ? 'hover:bg-zinc-900/10' : 'hover:bg-slate-50/40'
                        }`}>
                          {/* Name and ID */}
                          <td className="p-4">
                            <div className={`font-bold ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>{p.name}</div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{p.id}</div>
                          </td>

                          {/* Category and Brand */}
                          <td className="p-4">
                            <div className="flex flex-col items-start gap-1.5">
                              <span className={`font-mono text-[9px] px-2.5 py-0.5 rounded-full border leading-none ${
                                isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200/80 text-slate-600'
                              }`}>
                                {p.category} • {p.subCategory}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-amber-500/10 dark:bg-[#C5A059]/10 text-amber-600 dark:text-[#C5A059] px-2 py-0.5 rounded-md border border-amber-500/20 dark:border-[#C5A059]/20">
                                🏷️ {currentBrand}
                              </span>
                            </div>
                          </td>

                          {/* Price Edit field */}
                          <td className="p-4 font-mono text-center">
                            <div className="inline-flex items-center gap-1.5 justify-center">
                              <span className="text-zinc-400 text-xs font-bold">₹</span>
                              <input
                                type="number"
                                value={p.price}
                                onChange={(e) => handleUpdatePrice(p.id, Number(e.target.value))}
                                className={`border rounded-lg px-2.5 py-1.5 w-24 text-gold font-bold text-center outline-none transition-all ${
                                  isDark 
                                    ? 'bg-zinc-950 border-zinc-800 focus:border-gold' 
                                    : 'bg-white border-slate-200 focus:border-slate-500 hover:border-slate-300'
                                }`}
                              />
                            </div>
                          </td>

                          {/* Stock Count */}
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2.5 font-mono">
                              <span className={`font-black text-sm ${
                                isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-500' : (isDark ? 'text-zinc-200' : 'text-slate-900')
                              }`}>
                                {p.stock}
                              </span>
                              {isOutOfStock && (
                                <span className="text-[9px] bg-rose-50 border border-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                                  SOLD OUT
                                </span>
                              )}
                              {isLowStock && (
                                <span className="text-[9px] bg-amber-50 border border-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold animate-pulse">
                                  LOW STOCK
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Restock operations */}
                          <td className="p-4">
                            <div className="flex gap-2">
                              {[5, 10, 20].map(amt => (
                                <button
                                  key={amt}
                                  onClick={() => handleQuickRestock(p.id, amt)}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black font-mono transition-all duration-200 cursor-pointer border ${
                                    isDark
                                      ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white'
                                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950 hover:border-slate-300'
                                  }`}
                                >
                                  +{amt}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- CATALOGUE ADMIN TAB --- */}
        {activeTab === 'catalogue' && (
          <div className="space-y-6">
            <div className={`border rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
              isDark ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white border-slate-200/80 shadow-xl shadow-slate-100/40'
            }`}>
              <div>
                <h3 className={`text-lg font-bold uppercase tracking-tight flex items-center gap-2 ${
                  isDark ? 'text-zinc-100' : 'text-slate-900 font-black'
                }`}>
                  <Layers size={18} className="text-gold shrink-0" /> Catalogue & Products Database
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Add, update or delete boots, sandals, heels and active trainers in the collection.
                </p>
              </div>

              {!isAddingProduct && (
                <button
                  onClick={() => {
                    setEditProductId(null);
                    setFormData({
                      id: '',
                      name: '',
                      category: 'Men',
                      subCategory: 'Office Wear',
                      sizesStr: '6,7,8,9,10,11,12',
                      price: 99,
                      stock: 20,
                      description: '',
                      imageUrl: ''
                    });
                    setIsAddingProduct(true);
                  }}
                  className="flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-black bg-gold hover:bg-gold-hover text-black rounded-xl transition-all uppercase tracking-wider cursor-pointer shadow-lg shadow-gold/10"
                >
                  <PlusCircle size={14} /> Add New Footwear
                </button>
              )}
            </div>

            {/* Add/Edit Product Form overlay */}
            {isAddingProduct && (
              <div className={`border rounded-3xl p-6 md:p-8 ${
                isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-slate-200 shadow-xl shadow-slate-100/40 text-slate-900'
              }`}>
                <h4 className="text-sm font-bold uppercase tracking-widest text-gold mb-6 flex items-center gap-1.5">
                  {editProductId ? '✓ Edit Footwear Registry' : '✦ Register New Footwear'}
                </h4>
                <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-mono uppercase font-bold tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Product Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full border rounded-xl py-2.5 px-3 text-xs outline-none transition-all ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-white' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-400'
                      }`}
                    />
                  </div>

                  {/* ID */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-mono uppercase font-bold tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Product ID (Unique, alphanumeric)</label>
                    <input
                      type="text"
                      placeholder="e.g. men-boot-leather-1"
                      disabled={!!editProductId}
                      required
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      className={`w-full border rounded-xl py-2.5 px-3 text-xs outline-none font-mono disabled:opacity-50 transition-all ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-white' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-400'
                      }`}
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-mono uppercase font-bold tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                      className={`w-full border rounded-xl py-2.5 px-3 text-xs outline-none transition-all ${
                        isDark ? 'bg-zinc-950 border-zinc-850 text-zinc-300 focus:border-white' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-400'
                      }`}
                    >
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Kids">Kids</option>
                    </select>
                  </div>

                  {/* SubCategory */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-mono uppercase font-bold tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Sub-Category</label>
                    <select
                      value={formData.subCategory}
                      onChange={(e) => setFormData({ ...formData, subCategory: e.target.value as SubCategory })}
                      className={`w-full border rounded-xl py-2.5 px-3 text-xs outline-none transition-all ${
                        isDark ? 'bg-zinc-950 border-zinc-850 text-zinc-300 focus:border-white' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-400'
                      }`}
                    >
                      <option value="Office Wear">Office Wear</option>
                      <option value="Sandals">Sandals</option>
                      <option value="Casuals">Casuals</option>
                      <option value="Shoes">Shoes</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  {/* Available Sizes */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-mono uppercase font-bold tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Available Sizes (Comma-separated)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 6,7,8,9,10,11"
                      value={formData.sizesStr}
                      onChange={(e) => setFormData({ ...formData, sizesStr: e.target.value })}
                      className={`w-full border rounded-xl py-2.5 px-3 text-xs outline-none font-mono transition-all ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-white' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-400'
                      }`}
                    />
                  </div>

                  {/* Price and Stock */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-mono uppercase font-bold tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Price (₹)</label>
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className={`w-full border rounded-xl py-2.5 px-3 text-xs outline-none font-mono transition-all ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-white' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-400'
                        }`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-mono uppercase font-bold tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Initial Stock</label>
                      <input
                        type="number"
                        required
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                        className={`w-full border rounded-xl py-2.5 px-3 text-xs outline-none font-mono transition-all ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-white' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Image URL */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className={`text-[10px] font-mono uppercase font-bold tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Footwear Image URL</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className={`w-full border rounded-xl py-2.5 px-3 text-xs outline-none font-mono transition-all ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-white' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-400'
                      }`}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className={`text-[10px] font-mono uppercase font-bold tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Brief Description</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`w-full border rounded-xl py-2.5 px-3 text-xs outline-none transition-all ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-white' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-400'
                      }`}
                    />
                  </div>

                  {/* Buttons */}
                  <div className={`md:col-span-2 flex justify-end gap-3 pt-4 border-t ${isDark ? 'border-zinc-900' : 'border-slate-100'}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingProduct(false);
                        setEditProductId(null);
                      }}
                      className={`px-4 py-2 border text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer transition-all ${
                        isDark ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-slate-950 hover:bg-gold text-white hover:text-black font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
                    >
                      Save Footwear
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List of Catalog Products */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(p => (
                <div key={p.id} className={`border rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-md ${
                  isDark ? 'bg-zinc-900/20 border-zinc-900' : 'bg-white border-slate-200/60 shadow-sm shadow-slate-100/20'
                }`}>
                  <div>
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="aspect-video w-full object-cover rounded-xl mb-3 bg-zinc-900/10"
                    />
                    <div className="flex justify-between items-center gap-2">
                      <span className={`text-[9px] font-mono px-2.5 py-1 rounded-full uppercase font-bold border ${
                        isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        {p.category} • {p.subCategory}
                      </span>
                      <span className="font-mono text-xs font-bold text-gold">₹{p.price}</span>
                    </div>
                    <h4 className={`text-sm font-bold mt-2.5 line-clamp-1 ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>{p.name}</h4>
                    <p className="text-[10px] text-zinc-500 line-clamp-2 mt-1 leading-relaxed">
                      {p.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className={`flex items-center justify-between gap-3 mt-4 pt-3 border-t ${
                    isDark ? 'border-zinc-900/60' : 'border-slate-100'
                  }`}>
                    <span className="font-mono text-[10px] text-zinc-500">
                      Stock: <strong className={isDark ? 'text-zinc-300' : 'text-slate-700'}>{p.stock}</strong>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditClick(p)}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          isDark ? 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-950'
                        }`}
                        title="Edit Style"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(p.id)}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          isDark ? 'bg-zinc-900/40 border-zinc-800 hover:border-rose-900 text-zinc-400 hover:text-rose-400' : 'bg-rose-50/50 border-rose-100 hover:bg-rose-50 text-rose-500 hover:text-rose-700'
                        }`}
                        title="Delete Style"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- REPORTS & STATS TAB --- */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            
            {/* KPI metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Total revenue */}
              <div className={`border rounded-3xl p-6 flex items-center justify-between transition-all ${
                isDark ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white border-slate-200/80 shadow-lg shadow-slate-100/40'
              }`}>
                <div>
                  <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Total Sales Revenue</p>
                  <p className={`text-2xl font-black font-mono mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{totalRevenue}</p>
                </div>
                <div className="p-3 bg-gold/10 border border-gold/20 text-gold rounded-xl">
                  <DollarSign size={20} />
                </div>
              </div>

              {/* Total invoices */}
              <div className={`border rounded-3xl p-6 flex items-center justify-between transition-all ${
                isDark ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white border-slate-200/80 shadow-lg shadow-slate-100/40'
              }`}>
                <div>
                  <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Invoices Issued</p>
                  <p className={`text-2xl font-black font-mono mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalInvoices}</p>
                </div>
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                }`}>
                  <Receipt size={20} />
                </div>
              </div>

              {/* Stock in hand */}
              <div className={`border rounded-3xl p-6 flex items-center justify-between transition-all ${
                isDark ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white border-slate-200/80 shadow-lg shadow-slate-100/40'
              }`}>
                <div>
                  <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Stock On Hand</p>
                  <p className={`text-2xl font-black font-mono mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalStockOnHand}</p>
                </div>
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-100 text-amber-600'
                }`}>
                  <Package size={20} />
                </div>
              </div>

              {/* Low stock indicators */}
              <div className={`border rounded-3xl p-6 flex items-center justify-between transition-all ${
                isDark ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white border-slate-200/80 shadow-lg shadow-slate-100/40'
              }`}>
                <div>
                  <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Low Stock Warnings</p>
                  <p className="text-2xl font-black text-rose-500 font-mono mt-1">{lowStockItems.length}</p>
                </div>
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-rose-50 border-rose-100 text-rose-600'
                }`}>
                  <AlertTriangle size={20} />
                </div>
              </div>

            </div>

            {/* Interactive Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Bar Chart - Sales Revenue by SubCategory */}
              <div className={`border rounded-3xl p-6 flex flex-col justify-between ${
                isDark ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white border-slate-200/80 shadow-xl shadow-slate-100/40'
              }`}>
                <div>
                  <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5 ${
                    isDark ? 'text-zinc-100' : 'text-slate-900 font-black'
                  }`}>
                    <TrendingUp size={16} className="text-gold" /> Sales Revenue (₹) by Sub-Category
                  </h4>
                </div>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subCategorySalesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f2937' : '#f1f5f9'} />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={10} />
                      <YAxis stroke="#6b7280" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDark ? '#09090b' : '#ffffff', 
                          borderColor: isDark ? '#27272a' : '#e2e8f0', 
                          borderRadius: '12px',
                          color: isDark ? '#ffffff' : '#0f172a'
                        }}
                        itemStyle={{ color: '#C5A059', fontSize: '11px' }}
                        labelStyle={{ color: isDark ? '#fff' : '#000', fontSize: '11px' }}
                      />
                      <Bar dataKey="sales" fill="#C5A059" radius={[4, 4, 0, 0]}>
                        {subCategorySalesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart - Revenue by Footwear Category (Men, Women, Kids) */}
              <div className={`border rounded-3xl p-6 flex flex-col justify-between ${
                isDark ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white border-slate-200/80 shadow-xl shadow-slate-100/40'
              }`}>
                <div>
                  <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5 ${
                    isDark ? 'text-zinc-100' : 'text-slate-900 font-black'
                  }`}>
                    <Layers size={16} className="text-indigo-400" /> Revenue Share by Main Category
                  </h4>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="h-[220px] w-full sm:w-[50%]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: isDark ? '#09090b' : '#ffffff', 
                            borderColor: isDark ? '#27272a' : '#e2e8f0', 
                            borderRadius: '12px',
                            color: isDark ? '#ffffff' : '#0f172a'
                          }}
                          itemStyle={{ fontSize: '11px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pie Legend */}
                  <div className="w-full sm:w-[45%] space-y-3 font-mono text-[10px]">
                    {categoryPieData.map((item, idx) => (
                      <div key={item.name} className={`flex items-center justify-between p-2.5 rounded-xl border ${
                        isDark ? 'bg-zinc-950/40 border-zinc-900' : 'bg-slate-50 border-slate-200/50'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className={`${isDark ? 'text-zinc-400' : 'text-slate-600'} font-bold`}>{item.name}</span>
                        </div>
                        <span className={`${isDark ? 'text-zinc-200' : 'text-slate-900'} font-bold`}>₹{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Low stock notifications panel */}
            <div className={`border rounded-3xl p-6 md:p-8 space-y-4 ${
              isDark ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white border-slate-200/80 shadow-xl shadow-slate-100/40'
            }`}>
              <h4 className="text-sm font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5 font-black">
                <AlertTriangle size={16} /> Urgent Inventory Alerts (Low/Out of Stock)
              </h4>
              {lowStockItems.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  ✓ Excellent! All footwear models have healthy stock levels above 5 units.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lowStockItems.map(p => (
                    <div key={p.id} className={`flex items-center justify-between p-3.5 border rounded-2xl ${
                      isDark ? 'bg-rose-500/5 border-rose-900/40' : 'bg-rose-50/50 border-rose-100'
                    }`}>
                      <div>
                        <span className="text-[9px] font-mono text-rose-600 font-bold uppercase">STOCK WARNING</span>
                        <h5 className={`text-xs font-bold mt-0.5 ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>{p.name}</h5>
                      </div>
                      <span className="font-mono text-xs text-rose-600 font-black">
                        {p.stock === 0 ? 'OUT OF STOCK' : `ONLY ${p.stock} LEFT`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Historic Billing Invoices */}
            <div className={`border rounded-3xl p-6 md:p-8 space-y-4 ${
              isDark ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white border-slate-200/80 shadow-xl shadow-slate-100/40'
            }`}>
              <h4 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isDark ? 'text-zinc-100' : 'text-slate-900 font-black'
              }`}>
                <Receipt size={16} className="text-gold" /> Complete Sales Invoices Directory ({orders.length})
              </h4>
              {orders.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-8">
                  No invoices recorded in cloud database yet.
                </p>
              ) : (
                <div className={`divide-y max-h-[300px] overflow-y-auto pr-2 ${
                  isDark ? 'divide-zinc-900/60' : 'divide-slate-100'
                }`}>
                  {orders.map((order, idx) => (
                    <div key={order.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-xs font-bold ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>{order.id}</span>
                          <span className="font-mono text-[9px] text-zinc-500">Billed: {new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-1">
                          Client Mobile: <strong className={isDark ? 'text-zinc-300' : 'text-slate-700'}>{order.customerMobile}</strong> | Pay Method: <strong className={isDark ? 'text-zinc-300' : 'text-slate-700'}>{order.paymentMethod}</strong>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {order.items.map((item, id) => (
                            <span key={id} className={`text-[9px] border px-2 py-0.5 rounded-full font-mono ${
                              isDark ? 'bg-zinc-900/60 text-zinc-400 border-zinc-850' : 'bg-slate-50 text-slate-600 border-slate-200/60'
                            }`}>
                              {item.name} (UK {item.size} x{item.quantity})
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="font-mono text-right shrink-0">
                        <span className="text-[9px] font-bold text-gold bg-gold/5 border border-gold/15 px-2.5 py-1 rounded-full">
                          {order.status.toUpperCase()}
                        </span>
                        <div className={`text-sm font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{order.totalAmount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* --- ERP MEDIA TAB --- */}
        {activeTab === 'erp' && (
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 md:p-8 space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-4 gap-4">
              <div>
                <h3 className="serif-display text-lg font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                  <Smartphone size={18} className="text-gold" /> ERP Media Control Desk
                </h3>
                <p className="text-zinc-500 text-[11px] mt-1">Configure up to two custom footwear loop videos that play sequentially in a seamless playlist.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">
                  V1: {heroVideoSource.toUpperCase()}
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-gold bg-gold/5 border-gold/15">
                  V2: {heroVideoSource2.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Video Slot Selectors */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black">
                Select Video Slot to Configure:
              </label>
              <div className="flex gap-2 p-1 bg-zinc-950/60 border border-zinc-900 rounded-xl max-w-md">
                <button
                  type="button"
                  onClick={() => setErpVideoIndex(1)}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    erpVideoIndex === 1
                      ? 'bg-gold text-black shadow-lg shadow-gold/5'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                >
                  <Video size={14} /> Video 1 (Primary Loop)
                </button>
                <button
                  type="button"
                  onClick={() => setErpVideoIndex(2)}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    erpVideoIndex === 2
                      ? 'bg-gold text-black shadow-lg shadow-gold/5'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                >
                  <Video size={14} /> Video 2 (Sequential Loop)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Form and Preset Controls */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* 1. STATUS MESSAGES */}
                {erpSuccess && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex flex-col gap-1 animate-[fadeIn_0.3s]">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle size={14} /> Configuration Updated Successfully
                    </div>
                    <p className="text-[11px] text-zinc-400 ml-5 leading-relaxed">{erpSuccess}</p>
                  </div>
                )}

                {erpError && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex flex-col gap-1 animate-[fadeIn_0.3s]">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle size={14} /> Action Unsuccessful
                    </div>
                    <p className="text-[11px] text-zinc-400 ml-5 leading-relaxed">{erpError}</p>
                  </div>
                )}

                {/* 2. DUAL UPLOADER PANELS */}
                <div className="space-y-6">
                  
                  {/* Option A: Upload Local Video File */}
                  <div className="bg-zinc-950/60 p-5 rounded-xl border border-zinc-900 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-[10px] font-bold text-gold">A</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                          Option A: Select Local Video File for Video {erpVideoIndex}
                        </h4>
                      </div>
                      <span className="text-[9px] font-mono text-gold font-bold bg-gold/5 px-2 py-0.5 rounded-full border border-gold/10">
                        OFFLINE-PERSISTENT
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Upload an MP4 video clip directly from your device. It will be compressed and cached in local device storage (IndexedDB), ensuring high-speed local streaming offline for Video {erpVideoIndex}.
                    </p>

                    <div className="pt-2">
                      <label className="relative group block w-full py-8 border-2 border-dashed border-zinc-800 hover:border-gold/30 rounded-xl bg-zinc-950/40 text-center cursor-pointer transition-all">
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            if (!file.type.startsWith('video/')) {
                              setErpError('Invalid file format. Please upload a valid MP4 or web-compatible video file.');
                              return;
                            }

                            // Limit size to 100MB
                            if (file.size > 100 * 1024 * 1024) {
                              setErpError('The video file is too large. Please select a clip smaller than 100MB for smooth playback.');
                              return;
                            }

                            if (erpVideoIndex === 1) {
                              setIsUploadingFile(true);
                            } else {
                              setIsUploadingFile2(true);
                            }
                            setErpError(null);
                            setErpSuccess(null);

                            const res = await uploadLocalVideo(file, erpVideoIndex);
                            if (erpVideoIndex === 1) {
                              setIsUploadingFile(false);
                            } else {
                              setIsUploadingFile2(false);
                            }
                            
                            if (res.success) {
                              setErpSuccess(`Device video for Slot ${erpVideoIndex} loaded successfully! The loop sequence is now streaming your local file offline.`);
                              setTimeout(() => setErpSuccess(null), 6000);
                            } else {
                              setErpError(res.error || 'Failed to process local video file.');
                            }
                          }}
                        />
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="p-3 bg-zinc-900 rounded-full group-hover:bg-gold/5 group-hover:text-gold transition-colors">
                            {(erpVideoIndex === 1 ? isUploadingFile : isUploadingFile2) ? (
                              <RefreshCw size={20} className="animate-spin text-gold" />
                            ) : (
                              <Upload size={20} className="text-zinc-400 group-hover:text-gold transition-colors" />
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
                              {(erpVideoIndex === 1 ? isUploadingFile : isUploadingFile2) ? 'Compressing & caching video...' : `Select Video ${erpVideoIndex} from Device`}
                            </span>
                            <p className="text-[10px] text-zinc-500 mt-1">
                              Supports MP4, WebM up to 100MB
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Option B: Direct URL Input */}
                  <div className="bg-zinc-950/60 p-5 rounded-xl border border-zinc-900 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-[10px] font-bold text-gold">B</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                          Option B: Configure Web Stream URL for Video {erpVideoIndex}
                        </h4>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                        CLOUD-DEPLOYED
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Configure a direct public streaming link for Video {erpVideoIndex}. This will be deployed to the cloud for all global customers to experience sequentially.
                    </p>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const targetInput = erpVideoIndex === 1 ? erpVideoInput : erpVideoInput2;
                        if (!targetInput.trim()) {
                          setErpError('URL cannot be empty.');
                          return;
                        }

                        if (erpVideoIndex === 1) {
                          setIsUpdatingVideo(true);
                        } else {
                          setIsUpdatingVideo2(true);
                        }
                        setErpError(null);
                        setErpSuccess(null);

                        const res = await updateHeroVideoUrl(targetInput.trim(), erpVideoIndex);
                        if (erpVideoIndex === 1) {
                          setIsUpdatingVideo(false);
                        } else {
                          setIsUpdatingVideo2(false);
                        }

                        if (res.success) {
                          if (res.isLocalOnly) {
                            setErpSuccess(`Video slot ${erpVideoIndex} updated successfully in this browser! (Saved locally via robust cache fallback)`);
                          } else {
                            setErpSuccess(`Video slot ${erpVideoIndex} URL successfully saved to Firestore settings and deployed globally!`);
                          }
                          setTimeout(() => setErpSuccess(null), 8000);
                        } else {
                          setErpError(res.error || 'Failed to update video URL.');
                        }
                      }}
                      className="space-y-3"
                    >
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                          Direct MP4 / WebM Streaming URL
                        </label>
                        <input
                          type="url"
                          required
                          placeholder="https://example.com/cinematic-shoes.mp4"
                          value={erpVideoIndex === 1 ? erpVideoInput : erpVideoInput2}
                          onChange={(e) => erpVideoIndex === 1 ? setErpVideoInput(e.target.value) : setErpVideoInput2(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-xs outline-none text-zinc-300 focus:border-gold transition-colors font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={erpVideoIndex === 1 ? isUpdatingVideo : isUpdatingVideo2}
                        className="w-full py-3 rounded-xl bg-gold text-black font-extrabold text-xs tracking-widest uppercase transition-all hover:bg-gold-hover flex items-center justify-center gap-1.5 shadow-xl shadow-gold/10 cursor-pointer disabled:opacity-50"
                      >
                        {(erpVideoIndex === 1 ? isUpdatingVideo : isUpdatingVideo2) ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" /> Deploying settings...
                          </>
                        ) : (
                          <>
                            <Check size={14} /> Apply & Deploys URL to Video {erpVideoIndex}
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Preset Controls */}
                  <div className="bg-zinc-950/20 p-5 rounded-xl border border-zinc-900/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <Video size={14} className="text-gold" /> Test Footwear Presets for Slot {erpVideoIndex}
                      </h4>
                      <button
                        type="button"
                        onClick={async () => {
                          setErpError(null);
                          setErpSuccess(null);
                          const res = await resetHeroVideo(erpVideoIndex);
                          if (res.success) {
                            if (erpVideoIndex === 1) {
                              setErpVideoInput('https://assets.mixkit.co/videos/preview/mixkit-shoes-on-the-running-track-close-up-34282-large.mp4');
                            } else {
                              setErpVideoInput2('https://assets.mixkit.co/videos/preview/mixkit-man-walking-with-sneakers-in-the-street-40058-large.mp4');
                            }
                            setErpSuccess(`Reset video slot ${erpVideoIndex} back to default cinematic loop successfully!`);
                            setTimeout(() => setErpSuccess(null), 4000);
                          } else {
                            setErpError(`Failed to reset video slot ${erpVideoIndex}.`);
                          }
                        }}
                        className="text-[10px] font-mono text-zinc-500 hover:text-gold transition-colors flex items-center gap-1 cursor-pointer font-bold uppercase"
                      >
                        <RotateCcw size={12} /> Reset slot {erpVideoIndex}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          title: 'Athletic Track Loop',
                          desc: 'Action footwear close-ups on a running track.',
                          url: 'https://assets.mixkit.co/videos/preview/mixkit-shoes-on-the-running-track-close-up-34282-large.mp4'
                        },
                        {
                          title: 'Street Sneakers Lookbook',
                          desc: 'Casual sneakers and urban street walking pacing.',
                          url: 'https://assets.mixkit.co/videos/preview/mixkit-man-walking-with-sneakers-in-the-street-40058-large.mp4'
                        },
                        {
                          title: 'Autumn Leather Boots',
                          desc: 'Stylish boots stepping on rustic dry autumn leaves.',
                          url: 'https://assets.mixkit.co/videos/preview/mixkit-person-walking-in-boots-on-autumn-leaves-40061-large.mp4'
                        },
                        {
                          title: 'Neon Details Spotlight',
                          desc: 'Highlighting bright neon footwear accents.',
                          url: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-pair-of-white-sneakers-with-neon-details-43265-large.mp4'
                        }
                      ].map((preset) => {
                        const isPresetActive = (erpVideoIndex === 1 ? heroVideoUrl : heroVideoUrl2) === preset.url;
                        return (
                          <button
                            key={preset.url}
                            type="button"
                            onClick={async () => {
                              if (erpVideoIndex === 1) {
                                setErpVideoInput(preset.url);
                              } else {
                                setErpVideoInput2(preset.url);
                              }
                              await updateHeroVideoUrl(preset.url, erpVideoIndex);
                            }}
                            className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-full ${
                              isPresetActive
                                ? 'bg-gold/5 border-gold text-white'
                                : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200'
                            }`}
                          >
                            <div>
                              <p className="text-[11px] font-bold tracking-tight uppercase line-clamp-1">{preset.title}</p>
                              <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2 leading-snug">{preset.desc}</p>
                            </div>
                            <span className="text-[9px] font-mono tracking-widest text-gold mt-2 block font-bold uppercase">
                              {isPresetActive ? '✓ ACTIVE IN SLOT' : `CHOOSE FOR V${erpVideoIndex}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* --- OFFERS SECTION BANNER CONFIGURATION --- */}
                  <div className="bg-zinc-950/60 p-5 rounded-xl border border-zinc-900 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-[10px] font-bold text-gold">C</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                          Option C: Configure Offers Section Banner Thumbnail
                        </h4>
                      </div>
                      <span className="text-[9px] font-mono text-gold font-bold bg-gold/5 px-2 py-0.5 rounded-full border border-gold/10 animate-pulse">
                        DATABASE STORED
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Configure the background banner on the homepage Offers block. Add manually from your local device, enter a direct web URL, or connect and select files directly from an imaginary production device.
                    </p>

                    {/* Banner Input Mode Switcher */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 border border-zinc-900 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setBannerInputMode('manual')}
                        className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          bannerInputMode === 'manual'
                            ? 'bg-zinc-900 text-white border border-zinc-800'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <Upload size={14} /> Add Manually / URL
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBannerInputMode('device');
                          // Pre-select first file on switch
                          if (!selectedImaginaryFile) {
                            setSelectedImaginaryFile(IMAGINARY_DEVICE_FILES.DCIM[0]);
                          }
                        }}
                        className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          bannerInputMode === 'device'
                            ? 'bg-zinc-900 text-gold border border-gold/20'
                            : 'text-zinc-500 hover:text-gold/60'
                        }`}
                      >
                        <Smartphone size={14} /> Imaginary Device
                      </button>
                    </div>

                    {/* MANUALLY ADD / URL INPUT MODE */}
                    {bannerInputMode === 'manual' && (
                      <div className="space-y-4">
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (!offersBannerInput.trim()) {
                              setErpError('Banner URL cannot be empty.');
                              return;
                            }

                            setIsUpdatingOffersBanner(true);
                            setErpError(null);
                            setErpSuccess(null);

                            const res = await updateOffersBannerUrl(offersBannerInput.trim());
                            setIsUpdatingOffersBanner(false);

                            if (res.success) {
                              setErpSuccess('Offers section banner thumbnail successfully saved to Firestore and deployed globally!');
                              setTimeout(() => setErpSuccess(null), 8000);
                            } else {
                              setErpError(res.error || 'Failed to update offers banner URL.');
                            }
                          }}
                          className="space-y-3"
                        >
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                              Direct Image Banner URL (PNG, JPG, WebP)
                            </label>
                            <input
                              type="url"
                              required
                              placeholder="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop"
                              value={offersBannerInput}
                              onChange={(e) => setOffersBannerInput(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-xs outline-none text-zinc-300 focus:border-gold transition-colors font-mono"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isUpdatingOffersBanner}
                            className="w-full py-3 rounded-xl bg-gold text-black font-extrabold text-xs tracking-widest uppercase transition-all hover:bg-gold-hover flex items-center justify-center gap-1.5 shadow-xl shadow-gold/10 cursor-pointer disabled:opacity-50"
                          >
                            {isUpdatingOffersBanner ? (
                              <>
                                <RefreshCw size={14} className="animate-spin" /> Saving to Database...
                              </>
                            ) : (
                              <>
                                <Check size={14} /> Update Offers Banner URL
                              </>
                            )}
                          </button>
                        </form>

                        {/* Drag and Drop / Local File Manual Selector */}
                        <div className="space-y-2">
                          <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold block">
                            Or Add Manually from Local Storage
                          </label>
                          <div className="relative border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-2 group text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                setIsUpdatingOffersBanner(true);
                                setErpError(null);
                                setErpSuccess(null);

                                try {
                                  const reader = new FileReader();
                                  reader.onload = async (event) => {
                                    const base64Url = event.target?.result as string;
                                    if (!base64Url) {
                                      setErpError("Failed to convert image to data URL.");
                                      setIsUpdatingOffersBanner(false);
                                      return;
                                    }
                                    setOffersBannerInput(base64Url);
                                    const res = await updateOffersBannerUrl(base64Url);
                                    if (res.success) {
                                      setErpSuccess('Manual banner image loaded and saved to Firestore!');
                                      setTimeout(() => setErpSuccess(null), 6000);
                                    } else {
                                      setErpError(res.error || 'Failed to save uploaded image.');
                                    }
                                    setIsUpdatingOffersBanner(false);
                                  };
                                  reader.readAsDataURL(file);
                                } catch (err: any) {
                                  setErpError(`File exception: ${err.message || err}`);
                                  setIsUpdatingOffersBanner(false);
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="p-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-gold transition-colors">
                              <Upload size={16} />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-zinc-300">Choose manual image file...</p>
                              <p className="text-[9px] text-zinc-500 font-mono mt-0.5">JPEG, PNG, WebP up to 5MB (Loaded as Base64)</p>
                            </div>
                          </div>
                        </div>

                        {/* Pre-made Banner Presets */}
                        <div className="pt-2">
                          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
                            Quick Premium Presets:
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              {
                                name: 'Prestige Sneakers',
                                url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop'
                              },
                              {
                                name: 'Classic Boots',
                                url: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1200&auto=format&fit=crop'
                              },
                              {
                                name: 'Suede Workshop',
                                url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=1200&auto=format&fit=crop'
                              },
                              {
                                name: 'Athletic Red Look',
                                url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop'
                              }
                            ].map((preset) => {
                              const isActive = offersBannerUrl === preset.url;
                              return (
                                <button
                                  key={preset.url}
                                  type="button"
                                  onClick={async () => {
                                    setOffersBannerInput(preset.url);
                                    await updateOffersBannerUrl(preset.url);
                                  }}
                                  className={`p-2.5 rounded-xl border text-left transition-all text-xs flex items-center gap-3 cursor-pointer ${
                                    isActive
                                      ? 'bg-gold/10 border-gold text-white font-bold ring-1 ring-gold/20'
                                      : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900/40'
                                  }`}
                                >
                                  <img
                                    src={preset.url}
                                    alt={preset.name}
                                    className="w-16 h-12 rounded-lg object-cover shadow-md border border-zinc-800 shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="truncate font-medium">{preset.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* IMAGINARY DEVICE FILE EXPLORER MODE */}
                    {bannerInputMode === 'device' && (
                      <div className="space-y-4">
                        {/* Device connection status */}
                        <div className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-900 rounded-xl">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-mono font-bold uppercase text-zinc-300">
                              Simulated Handset Connected
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                            USB 3.2 DEBUG
                          </span>
                        </div>

                        {/* Simulated Directories tabs */}
                        <div className="flex gap-2.5 overflow-x-auto pb-1">
                          {(['DCIM', 'Downloads', 'Workshop'] as const).map((folder) => {
                            const isFolderActive = selectedImaginaryFolder === folder;
                            return (
                              <button
                                key={folder}
                                type="button"
                                onClick={() => {
                                  setSelectedImaginaryFolder(folder);
                                  setSelectedImaginaryFile(IMAGINARY_DEVICE_FILES[folder][0]);
                                }}
                                className={`py-1.5 px-3 rounded-lg border text-[10px] font-mono uppercase font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                                  isFolderActive
                                    ? 'bg-gold/15 border-gold text-white'
                                    : 'bg-zinc-950/40 border-zinc-900 text-zinc-500 hover:text-zinc-400 hover:border-zinc-800'
                                }`}
                              >
                                {isFolderActive ? <FolderOpen size={12} className="text-gold" /> : <Folder size={12} />}
                                /{folder}
                              </button>
                            );
                          })}
                        </div>

                        {/* File lists of chosen directory */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                          {IMAGINARY_DEVICE_FILES[selectedImaginaryFolder].map((file: any) => {
                            const isFileSelected = selectedImaginaryFile?.name === file.name;
                            const isDeployed = offersBannerUrl === file.url;
                            return (
                              <button
                                key={file.name}
                                type="button"
                                onClick={() => setSelectedImaginaryFile(file)}
                                className={`p-2 rounded-xl border text-left transition-all flex items-center gap-3 relative cursor-pointer group ${
                                  isFileSelected
                                    ? 'bg-zinc-900 border-gold/70 text-white'
                                    : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900/20'
                                }`}
                              >
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="w-16 h-12 rounded-lg object-cover border border-zinc-900 shrink-0 shadow-md"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-[10px] font-bold truncate text-zinc-200 group-hover:text-gold transition-colors">{file.name}</p>
                                  <p className="text-[8px] font-mono text-zinc-500 uppercase mt-0.5">{file.size} • {file.resolution}</p>
                                </div>
                                {isDeployed && (
                                  <span className="absolute top-1 right-1 text-[8px] font-mono uppercase bg-gold/15 text-gold border border-gold/20 px-1 rounded-sm font-bold scale-90">
                                    LIVE
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Selected Imaginary File Metadata & Deployment Sheet */}
                        {selectedImaginaryFile && (
                          <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/2 rounded-full blur-2xl pointer-events-none" />
                            
                            <div className="space-y-2">
                              <span className="text-[8px] font-mono uppercase text-gold font-bold bg-gold/5 border border-gold/15 px-1.5 py-0.5 rounded">
                                Virtual Media Asset Widescreen Preview
                              </span>
                              <div className="relative overflow-hidden rounded-xl border border-zinc-800 shadow-lg group">
                                <img
                                  src={selectedImaginaryFile.url}
                                  alt="Selected preview"
                                  className="w-full h-32 sm:h-40 object-cover z-10 transition-transform duration-500 group-hover:scale-102"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[9px] font-mono text-zinc-300 border border-zinc-800/80">
                                  {selectedImaginaryFile.resolution} ({selectedImaginaryFile.size})
                                </div>
                              </div>
                              <p className="text-xs font-bold text-zinc-200 truncate pt-1">
                                {selectedImaginaryFile.name}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-zinc-900/60 pt-2.5 text-[9px] font-mono text-zinc-500">
                              <div>
                                <span className="text-zinc-600">Storage Path:</span>
                                <p className="text-zinc-400 truncate mt-0.5">/emulated/0/{selectedImaginaryFolder}/{selectedImaginaryFile.name}</p>
                              </div>
                              <div>
                                <span className="text-zinc-600">Date Captured:</span>
                                <p className="text-zinc-400 mt-0.5">{selectedImaginaryFile.date}</p>
                              </div>
                              <div>
                                <span className="text-zinc-600">Resolution Size:</span>
                                <p className="text-zinc-400 mt-0.5">{selectedImaginaryFile.resolution} ({selectedImaginaryFile.size})</p>
                              </div>
                              <div>
                                <span className="text-zinc-600">Exif Lens Profile:</span>
                                <p className="text-zinc-400 mt-0.5 truncate">{selectedImaginaryFile.camera}</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={isUpdatingOffersBanner}
                              onClick={async () => {
                                setIsUpdatingOffersBanner(true);
                                setErpError(null);
                                setErpSuccess(null);

                                const res = await updateOffersBannerUrl(selectedImaginaryFile.url);
                                setIsUpdatingOffersBanner(false);

                                if (res.success) {
                                  setErpSuccess(`Asset "${selectedImaginaryFile.name}" deployed from handset and synchronized to cloud lookbook!`);
                                  setTimeout(() => setErpSuccess(null), 8000);
                                } else {
                                  setErpError(res.error || 'Failed to update offers banner URL.');
                                }
                              }}
                              className="w-full py-3 rounded-xl bg-gold text-black font-extrabold text-xs tracking-widest uppercase transition-all hover:bg-gold-hover flex items-center justify-center gap-1.5 shadow-xl shadow-gold/10 cursor-pointer disabled:opacity-50"
                            >
                              {isUpdatingOffersBanner ? (
                                <>
                                  <RefreshCw size={14} className="animate-spin" /> Transferring via USB Debug...
                                </>
                              ) : (
                                <>
                                  <Check size={14} /> Deploy Selected Imaginary Image
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* --- OFFERS CATEGORY THUMBNAILS CONFIGURATION (MEN, WOMEN, KIDS) --- */}
                  <div className="bg-zinc-950/60 p-5 rounded-xl border border-zinc-900 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-[10px] font-bold text-gold">D</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                          Option D: Configure Offer Category Thumbnails
                        </h4>
                      </div>
                      <span className="text-[9px] font-mono text-gold font-bold bg-gold/5 px-2 py-0.5 rounded-full border border-gold/10 animate-pulse">
                        DATABASE STORED
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Customize the background thumbnails for each of the clearance category buttons (Men, Women, Kids). Add via manual web URL, upload a local file, or fetch assets directly from the connected device filesystem.
                    </p>

                    {/* Category Selector Tabs */}
                    <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-950 border border-zinc-900 rounded-xl">
                      {(['Men', 'Women', 'Kids'] as const).map((cat) => {
                        const isCatActive = selectedCategoryConfig === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setSelectedCategoryConfig(cat);
                            }}
                            className={`py-2 px-1 text-[10px] font-bold rounded-lg transition-all text-center uppercase tracking-wider cursor-pointer ${
                              isCatActive
                                ? 'bg-zinc-900 text-gold border border-zinc-800'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            {cat} Division
                          </button>
                        );
                      })}
                    </div>

                    {/* Banner Input Mode Switcher */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 border border-zinc-900 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setCatThumbInputMode('manual')}
                        className={`py-1.5 px-3 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          catThumbInputMode === 'manual'
                            ? 'bg-zinc-900 text-white border border-zinc-800'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <Upload size={12} /> Add Manually / URL
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCatThumbInputMode('device');
                          if (!selectedCatImaginaryFile) {
                            setSelectedCatImaginaryFile(IMAGINARY_DEVICE_FILES.DCIM[0]);
                          }
                        }}
                        className={`py-1.5 px-3 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          catThumbInputMode === 'device'
                            ? 'bg-zinc-900 text-gold border border-gold/20'
                            : 'text-zinc-500 hover:text-gold/60'
                        }`}
                      >
                        <Smartphone size={12} /> Imaginary Device
                      </button>
                    </div>

                    {/* MANUALLY ADD / URL INPUT MODE */}
                    {catThumbInputMode === 'manual' && (
                      <div className="space-y-4">
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const val = selectedCategoryConfig === 'Men' ? categoryThumbMenInput : selectedCategoryConfig === 'Women' ? categoryThumbWomenInput : categoryThumbKidsInput;
                            if (!val.trim()) {
                              setErpError('Category image URL cannot be empty.');
                              return;
                            }

                            setIsUpdatingCategoryThumbs(true);
                            setErpError(null);
                            setErpSuccess(null);

                            const res = await updateCategoryThumbnail(selectedCategoryConfig, val.trim());
                            setIsUpdatingCategoryThumbs(false);

                            if (res.success) {
                              setErpSuccess(`${selectedCategoryConfig} thumbnail successfully saved to Firestore and deployed globally!`);
                              setTimeout(() => setErpSuccess(null), 8000);
                            } else {
                              setErpError(res.error || `Failed to update ${selectedCategoryConfig} thumbnail URL.`);
                            }
                          }}
                          className="space-y-3"
                        >
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                              Direct Image URL for {selectedCategoryConfig} Division
                            </label>
                            <input
                              type="url"
                              required
                              placeholder="https://images.unsplash.com/...f"
                              value={selectedCategoryConfig === 'Men' ? categoryThumbMenInput : selectedCategoryConfig === 'Women' ? categoryThumbWomenInput : categoryThumbKidsInput}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (selectedCategoryConfig === 'Men') setCategoryThumbMenInput(val);
                                else if (selectedCategoryConfig === 'Women') setCategoryThumbWomenInput(val);
                                else setCategoryThumbKidsInput(val);
                              }}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-xs outline-none text-zinc-300 focus:border-gold transition-colors font-mono"
                            />
                          </div>

                          <div className="flex gap-2.5">
                            <button
                              type="submit"
                              disabled={isUpdatingCategoryThumbs}
                              className="flex-1 py-3 rounded-xl bg-gold text-black font-extrabold text-xs tracking-widest uppercase transition-all hover:bg-gold-hover flex items-center justify-center gap-1.5 shadow-xl shadow-gold/10 cursor-pointer disabled:opacity-50"
                            >
                              {isUpdatingCategoryThumbs ? (
                                <>
                                  <RefreshCw size={14} className="animate-spin" /> Updating Database...
                                </>
                              ) : (
                                <>
                                  <Check size={14} /> Update {selectedCategoryConfig} Image
                                </>
                              )}
                            </button>
                            
                            <button
                              type="button"
                              onClick={async () => {
                                setIsUpdatingCategoryThumbs(true);
                                setErpError(null);
                                setErpSuccess(null);
                                let defaultUrl = '';
                                if (selectedCategoryConfig === 'Men') {
                                  defaultUrl = 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop';
                                  setCategoryThumbMenInput(defaultUrl);
                                } else if (selectedCategoryConfig === 'Women') {
                                  defaultUrl = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop';
                                  setCategoryThumbWomenInput(defaultUrl);
                                } else {
                                  defaultUrl = 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=800&auto=format&fit=crop';
                                  setCategoryThumbKidsInput(defaultUrl);
                                }
                                const res = await updateCategoryThumbnail(selectedCategoryConfig, defaultUrl);
                                setIsUpdatingCategoryThumbs(false);
                                if (res.success) {
                                  setErpSuccess(`Reset ${selectedCategoryConfig} thumbnail to factory default.`);
                                  setTimeout(() => setErpSuccess(null), 5000);
                                }
                              }}
                              className="px-4 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 text-xs flex items-center justify-center cursor-pointer"
                            >
                              Reset
                            </button>
                          </div>
                        </form>

                        {/* Drag and Drop / Local File Manual Selector for category */}
                        <div className="space-y-2">
                          <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold block">
                            Or Upload {selectedCategoryConfig} Image from Your Device
                          </label>
                          <div className="relative border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-2 group text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                setIsUpdatingCategoryThumbs(true);
                                setErpError(null);
                                setErpSuccess(null);

                                try {
                                  const reader = new FileReader();
                                  reader.onload = async (event) => {
                                    const base64Url = event.target?.result as string;
                                    if (!base64Url) {
                                      setErpError("Failed to convert image to data URL.");
                                      setIsUpdatingCategoryThumbs(false);
                                      return;
                                    }
                                    if (selectedCategoryConfig === 'Men') setCategoryThumbMenInput(base64Url);
                                    else if (selectedCategoryConfig === 'Women') setCategoryThumbWomenInput(base64Url);
                                    else setCategoryThumbKidsInput(base64Url);
                                    
                                    const res = await updateCategoryThumbnail(selectedCategoryConfig, base64Url);
                                    if (res.success) {
                                      setErpSuccess(`Manual ${selectedCategoryConfig} image loaded and saved to Firestore!`);
                                      setTimeout(() => setErpSuccess(null), 6000);
                                    } else {
                                      setErpError(res.error || 'Failed to save uploaded image.');
                                    }
                                    setIsUpdatingCategoryThumbs(false);
                                  };
                                  reader.readAsDataURL(file);
                                } catch (err: any) {
                                  setErpError(`File exception: ${err.message || err}`);
                                  setIsUpdatingCategoryThumbs(false);
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="p-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-gold transition-colors">
                              <Upload size={16} />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-zinc-300">Choose manual image file...</p>
                              <p className="text-[9px] text-zinc-500 font-mono mt-0.5">JPEG, PNG, WebP up to 5MB (Loaded as Base64)</p>
                            </div>
                          </div>
                        </div>

                        {/* Pre-made Category Presets */}
                        <div className="pt-2">
                          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
                            Quick Division Presets:
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {(selectedCategoryConfig === 'Men' ? [
                              { name: 'Men Suede Workshop', url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop' },
                              { name: 'Men Prestige Active', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop' },
                            ] : selectedCategoryConfig === 'Women' ? [
                              { name: 'Women Suede Heels', url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop' },
                              { name: 'Women Luxury Walk', url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop' },
                            ] : [
                              { name: 'Kids Orthopedic Care', url: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=800&auto=format&fit=crop' },
                              { name: 'Kids Playground Run', url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=800&auto=format&fit=crop' },
                            ]).map((preset) => {
                              const currentVal = selectedCategoryConfig === 'Men' ? categoryThumbMen : selectedCategoryConfig === 'Women' ? categoryThumbWomen : categoryThumbKids;
                              const isActive = currentVal === preset.url;
                              return (
                                <button
                                  key={preset.url}
                                  type="button"
                                  onClick={async () => {
                                    if (selectedCategoryConfig === 'Men') setCategoryThumbMenInput(preset.url);
                                    else if (selectedCategoryConfig === 'Women') setCategoryThumbWomenInput(preset.url);
                                    else setCategoryThumbKidsInput(preset.url);
                                    await updateCategoryThumbnail(selectedCategoryConfig, preset.url);
                                  }}
                                  className={`p-2 rounded-xl border text-left transition-all text-xs flex items-center gap-2 cursor-pointer ${
                                    isActive
                                      ? 'bg-gold/10 border-gold text-white font-bold ring-1 ring-gold/20'
                                      : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900/40'
                                  }`}
                                >
                                  <img
                                    src={preset.url}
                                    alt={preset.name}
                                    className="w-12 h-10 rounded-lg object-cover shadow-md border border-zinc-800 shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="truncate text-[10px] font-medium">{preset.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* IMAGINARY DEVICE FILE EXPLORER MODE */}
                    {catThumbInputMode === 'device' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-900 rounded-xl">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-mono font-bold uppercase text-zinc-300">
                              Simulated Handset Connected
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                            USB 3.2 DEBUG
                          </span>
                        </div>

                        {/* Simulated Directories tabs */}
                        <div className="flex gap-2.5 overflow-x-auto pb-1">
                          {(['DCIM', 'Downloads', 'Workshop'] as const).map((folder) => {
                            const isFolderActive = selectedCatImaginaryFolder === folder;
                            return (
                              <button
                                key={folder}
                                type="button"
                                onClick={() => {
                                  setSelectedCatImaginaryFolder(folder);
                                  setSelectedCatImaginaryFile(IMAGINARY_DEVICE_FILES[folder][0]);
                                }}
                                className={`py-1.5 px-3 rounded-lg border text-[10px] font-mono uppercase font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                                  isFolderActive
                                    ? 'bg-gold/15 border-gold text-white'
                                    : 'bg-zinc-950/40 border-zinc-900 text-zinc-500 hover:text-zinc-400 hover:border-zinc-800'
                                }`}
                              >
                                {isFolderActive ? <FolderOpen size={12} className="text-gold" /> : <Folder size={12} />}
                                /{folder}
                              </button>
                            );
                          })}
                        </div>

                        {/* File lists of chosen directory */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                          {IMAGINARY_DEVICE_FILES[selectedCatImaginaryFolder].map((file: any) => {
                            const isFileSelected = selectedCatImaginaryFile?.name === file.name;
                            const currentVal = selectedCategoryConfig === 'Men' ? categoryThumbMen : selectedCategoryConfig === 'Women' ? categoryThumbWomen : categoryThumbKids;
                            const isDeployed = currentVal === file.url;
                            return (
                              <button
                                key={file.name}
                                type="button"
                                onClick={() => setSelectedCatImaginaryFile(file)}
                                className={`p-2 rounded-xl border text-left transition-all flex items-center gap-3 relative cursor-pointer group ${
                                  isFileSelected
                                    ? 'bg-zinc-900 border-gold/70 text-white'
                                    : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900/20'
                                }`}
                              >
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="w-16 h-12 rounded-lg object-cover border border-zinc-900 shrink-0 shadow-md"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-[10px] font-bold truncate text-zinc-200 group-hover:text-gold transition-colors">{file.name}</p>
                                  <p className="text-[8px] font-mono text-zinc-500 uppercase mt-0.5">{file.size} • {file.resolution}</p>
                                </div>
                                {isDeployed && (
                                  <span className="absolute top-1 right-1 text-[8px] font-mono uppercase bg-gold/15 text-gold border border-gold/20 px-1 rounded-sm font-bold scale-90">
                                    LIVE
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Selected Imaginary File Metadata & Deployment Sheet */}
                        {selectedCatImaginaryFile && (
                          <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/2 rounded-full blur-2xl pointer-events-none" />
                            
                            <div className="space-y-2">
                              <span className="text-[8px] font-mono uppercase text-gold font-bold bg-gold/5 border border-gold/15 px-1.5 py-0.5 rounded">
                                Virtual Media Asset Widescreen Preview
                              </span>
                              <div className="relative overflow-hidden rounded-xl border border-zinc-800 shadow-lg group">
                                <img
                                  src={selectedCatImaginaryFile.url}
                                  alt="Selected preview"
                                  className="w-full h-32 sm:h-40 object-cover z-10 transition-transform duration-500 group-hover:scale-102"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[9px] font-mono text-zinc-300 border border-zinc-800/80">
                                  {selectedCatImaginaryFile.resolution} ({selectedCatImaginaryFile.size})
                                </div>
                              </div>
                              <p className="text-xs font-bold text-zinc-200 truncate pt-1">
                                {selectedCatImaginaryFile.name}
                              </p>
                            </div>

                            <button
                              type="button"
                              disabled={isUpdatingCategoryThumbs}
                              onClick={async () => {
                                setIsUpdatingCategoryThumbs(true);
                                setErpError(null);
                                setErpSuccess(null);

                                if (selectedCategoryConfig === 'Men') setCategoryThumbMenInput(selectedCatImaginaryFile.url);
                                else if (selectedCategoryConfig === 'Women') setCategoryThumbWomenInput(selectedCatImaginaryFile.url);
                                else setCategoryThumbKidsInput(selectedCatImaginaryFile.url);

                                const res = await updateCategoryThumbnail(selectedCategoryConfig, selectedCatImaginaryFile.url);
                                setIsUpdatingCategoryThumbs(false);

                                if (res.success) {
                                  setErpSuccess(`Asset "${selectedCatImaginaryFile.name}" deployed from handset to ${selectedCategoryConfig} clearance button!`);
                                  setTimeout(() => setErpSuccess(null), 8000);
                                } else {
                                  setErpError(res.error || 'Failed to update category thumbnail URL.');
                                }
                              }}
                              className="w-full py-3 rounded-xl bg-gold text-black font-extrabold text-xs tracking-widest uppercase transition-all hover:bg-gold-hover flex items-center justify-center gap-1.5 shadow-xl shadow-gold/10 cursor-pointer disabled:opacity-50"
                            >
                              {isUpdatingCategoryThumbs ? (
                                <>
                                  <RefreshCw size={14} className="animate-spin" /> Transferring via USB Debug...
                                </>
                              ) : (
                                <>
                                  <Check size={14} /> Deploy to {selectedCategoryConfig} Category
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>

              </div>

              {/* Right Column: Live Device Simulator Preview */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="w-full max-w-[280px] space-y-3">
                  <div className="text-center">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black">
                      Live Dual-Loop Simulator
                    </span>
                  </div>

                  {/* Elegant smartphone mockup frame */}
                  <div className="relative w-full aspect-[9/16] rounded-[36px] border-[12px] border-zinc-900 bg-zinc-950 overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]">
                    {/* Speaker Grill */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-zinc-900 rounded-full z-20 flex items-center justify-center">
                      <div className="w-8 h-1 bg-zinc-800 rounded-full" />
                    </div>

                    {/* Camera lens hole */}
                    <div className="absolute top-2.5 left-1/3 transform -translate-x-1/2 w-2 h-2 bg-zinc-800 rounded-full z-20" />

                    {/* Real-time video player inside phone mock */}
                    {heroVideoUrl ? (
                      <div className="absolute inset-0 w-full h-full bg-zinc-950">
                        <video
                          key={simActiveIndex === 1 ? heroVideoUrl : heroVideoUrl2}
                          autoPlay
                          loop={!heroVideoUrl2 || heroVideoUrl === heroVideoUrl2}
                          muted
                          playsInline
                          onEnded={() => {
                            if (heroVideoUrl2 && heroVideoUrl2 !== heroVideoUrl) {
                              setSimActiveIndex((prev) => (prev === 1 ? 2 : 1));
                            }
                          }}
                          className="w-full h-full object-cover brightness-[0.7] scale-100"
                          src={simActiveIndex === 1 ? heroVideoUrl : heroVideoUrl2}
                        />
                        {/* Mock Lookbook Overlay info */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/30 flex flex-col justify-end p-4 text-center">
                          <span className="text-[8px] font-mono tracking-widest text-gold uppercase">
                            SIM PREVIEW: VIDEO {simActiveIndex} / 2
                          </span>
                          <span className="text-[7px] text-zinc-500 font-mono block">
                            ({(simActiveIndex === 1 ? heroVideoSource : heroVideoSource2).toUpperCase()})
                          </span>
                          <h5 className="serif-display text-base font-bold text-white uppercase mt-1">
                            Precision Steps
                          </h5>
                          <p className="text-[8px] text-white/55 uppercase tracking-wider font-light mt-1">
                            Loops sequentially when ended
                          </p>
                          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-3">
                            <div className="w-1/2 h-full bg-gold rounded-full animate-[pulse_1.5s_infinite]" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-950">
                        <Smartphone size={24} className="text-zinc-700 animate-pulse" />
                        <span className="text-[10px] font-mono text-zinc-600 uppercase mt-2">
                          Waiting for video source stream...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* --- PERSISTENT MEDIA DATABASE SECTION (STRICT LIMIT OF 4 PER TYPE) --- */}
            <div className="border-t border-zinc-900 pt-8 mt-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="serif-display text-md font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                    <HardDrive size={18} className="text-gold" /> Cloud Media Assets Database
                  </h4>
                  <p className="text-zinc-500 text-[11px] mt-1">
                    Manage persistent video loops and promotional banner images. Strictly capped at a maximum of 4 items each.
                  </p>
                </div>
                <div className="flex gap-4 shrink-0 text-xs font-mono text-zinc-400">
                  <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-900">
                    <span className="text-zinc-500">Videos:</span>
                    <span className={`font-bold ${heroVideos.length >= 4 ? 'text-red-400' : 'text-gold'}`}>
                      {heroVideos.length} / 4
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-900">
                    <span className="text-zinc-500">Images:</span>
                    <span className={`font-bold ${heroImages.length >= 4 ? 'text-red-400' : 'text-gold'}`}>
                      {heroImages.length} / 4
                    </span>
                  </div>
                </div>
              </div>

              {/* Status alerts */}
              {(dbVideoSuccess || dbVideoError || dbImageSuccess || dbImageError) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(dbVideoSuccess || dbVideoError) && (
                    <div className={`p-4 text-xs rounded-xl border ${
                      dbVideoError 
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                      <div className="flex items-center gap-2 font-bold uppercase">
                        {dbVideoError ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                        Video DB Status
                      </div>
                      <p className="mt-1 text-zinc-400 text-[11px] font-mono">{dbVideoError || dbVideoSuccess}</p>
                    </div>
                  )}

                  {(dbImageSuccess || dbImageError) && (
                    <div className={`p-4 text-xs rounded-xl border ${
                      dbImageError 
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                      <div className="flex items-center gap-2 font-bold uppercase">
                        {dbImageError ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                        Image DB Status
                      </div>
                      <p className="mt-1 text-zinc-400 text-[11px] font-mono">{dbImageError || dbImageSuccess}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* --- VIDEOS DATABASE COLUMN --- */}
                <div className="bg-zinc-950/40 p-5 rounded-2xl border border-zinc-900 space-y-5">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <Video size={14} className="text-gold" /> Saved Videos ({heroVideos.length}/4)
                    </h5>
                  </div>

                  {/* Videos Grid */}
                  {heroVideos.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-zinc-900 rounded-xl bg-zinc-950/20">
                      <p className="text-[11px] text-zinc-600 font-mono">No custom videos stored in the database yet.</p>
                      <p className="text-[10px] text-zinc-500 mt-1">Use the entry form below to add up to 4 video loops.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {heroVideos.map((video) => (
                        <div key={video.id} className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 space-y-2.5 relative group overflow-hidden">
                          <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={async () => {
                                setDbVideoSuccess(null);
                                setDbVideoError(null);
                                const res = await deleteHeroVideo(video.id);
                                if (res.success) {
                                  setDbVideoSuccess(`Video "${video.name}" deleted from database successfully.`);
                                  setTimeout(() => setDbVideoSuccess(null), 5000);
                                } else {
                                  setDbVideoError(res.error || "Failed to delete video.");
                                }
                              }}
                              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/10 transition-colors cursor-pointer"
                              title="Delete Video"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="aspect-[16/9] bg-zinc-900 rounded-lg overflow-hidden relative">
                            {/* Short inline preview player */}
                            <video
                              src={video.url}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                            />
                            {video.isBase64 && (
                              <span className="absolute bottom-1 right-1 text-[8px] font-mono bg-gold/20 border border-gold/30 text-gold font-bold px-1 py-0.5 rounded uppercase">
                                BASE64
                              </span>
                            )}
                          </div>

                          <div>
                            <p className="text-[11px] font-bold text-zinc-200 truncate">{video.name}</p>
                            <p className="text-[9px] font-mono text-zinc-600 truncate mt-0.5">{video.id}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-zinc-900">
                            <button
                              type="button"
                              onClick={async () => {
                                setErpSuccess(null);
                                setErpError(null);
                                const res = await updateHeroVideoUrl(video.url, 1);
                                if (res.success) {
                                  setErpSuccess(`Successfully deployed "${video.name}" to Video Slot 1!`);
                                } else {
                                  setErpError(res.error || "Failed to deploy video to Slot 1.");
                                }
                              }}
                              className="py-1 px-2 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors text-[9px] font-mono uppercase font-bold cursor-pointer text-center"
                            >
                              Deploy V1
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                setErpSuccess(null);
                                setErpError(null);
                                const res = await updateHeroVideoUrl(video.url, 2);
                                if (res.success) {
                                  setErpSuccess(`Successfully deployed "${video.name}" to Video Slot 2!`);
                                } else {
                                  setErpError(res.error || "Failed to deploy video to Slot 2.");
                                }
                              }}
                              className="py-1 px-2 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors text-[9px] font-mono uppercase font-bold cursor-pointer text-center"
                            >
                              Deploy V2
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Video Form */}
                  {heroVideos.length < 4 ? (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!dbVideoName.trim() || !dbVideoUrl.trim()) {
                          setDbVideoError("Name and URL are required.");
                          return;
                        }
                        setIsAddingDbVideo(true);
                        setDbVideoSuccess(null);
                        setDbVideoError(null);

                        const res = await addHeroVideo(dbVideoName.trim(), dbVideoUrl.trim(), false);
                        setIsAddingDbVideo(false);

                        if (res.success) {
                          setDbVideoSuccess(`Video "${dbVideoName}" added to lookbook database successfully.`);
                          setDbVideoName('');
                          setDbVideoUrl('');
                          setTimeout(() => setDbVideoSuccess(null), 5000);
                        } else {
                          setDbVideoError(res.error || "Failed to save video to database.");
                        }
                      }}
                      className="bg-zinc-950 p-4 rounded-xl border border-zinc-900/50 space-y-3.5"
                    >
                      <div className="text-[10px] font-mono uppercase font-black text-zinc-400 tracking-wider">
                        Add New Video Loop
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-500 uppercase font-bold">Video Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Autumn Suede Boot Pacing"
                            value={dbVideoName}
                            onChange={(e) => setDbVideoName(e.target.value)}
                            className="w-full bg-zinc-905 border border-zinc-800 rounded-lg py-2 px-3 text-[11px] outline-none text-zinc-300 focus:border-gold transition-colors font-sans"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-500 uppercase font-bold">Streaming MP4 URL</label>
                          <input
                            type="url"
                            required
                            placeholder="https://assets.mixkit.co/videos/preview/..."
                            value={dbVideoUrl}
                            onChange={(e) => setDbVideoUrl(e.target.value)}
                            className="w-full bg-zinc-905 border border-zinc-800 rounded-lg py-2 px-3 text-[11px] outline-none text-zinc-300 focus:border-gold transition-colors font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isAddingDbVideo}
                        className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-gold hover:text-black border border-zinc-800 hover:border-gold text-zinc-300 text-[10px] font-mono uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isAddingDbVideo ? (
                          <>
                            <RefreshCw size={12} className="animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <PlusCircle size={12} /> Add to Database Video Shelf
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950 text-center">
                      <p className="text-[11px] text-red-400 font-mono font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 justify-center">
                        <AlertTriangle size={14} /> Database Video Limit Reached
                      </p>
                      <p className="text-[10px] text-zinc-500 leading-relaxed mt-1">
                        Your database is fully populated with 4 videos. If you want to add a new video, you must delete an existing one first.
                      </p>
                    </div>
                  )}
                </div>

                {/* --- IMAGES DATABASE COLUMN --- */}
                <div className="bg-zinc-950/40 p-5 rounded-2xl border border-zinc-900 space-y-5">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <Image size={14} className="text-gold" /> Saved Images ({heroImages.length}/4)
                    </h5>
                  </div>

                  {/* Images Grid */}
                  {heroImages.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-zinc-900 rounded-xl bg-zinc-950/20">
                      <p className="text-[11px] text-zinc-600 font-mono">No custom images stored in the database yet.</p>
                      <p className="text-[10px] text-zinc-500 mt-1">Use the entry form below to add up to 4 banner pictures.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {heroImages.map((image) => (
                        <div key={image.id} className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 space-y-2.5 relative group overflow-hidden">
                          <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={async () => {
                                setDbImageSuccess(null);
                                setDbImageError(null);
                                const res = await deleteHeroImage(image.id);
                                if (res.success) {
                                  setDbImageSuccess(`Image "${image.name}" deleted from database successfully.`);
                                  setTimeout(() => setDbImageSuccess(null), 5000);
                                } else {
                                  setDbImageError(res.error || "Failed to delete image.");
                                }
                              }}
                              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/10 transition-colors cursor-pointer"
                              title="Delete Image"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="aspect-[16/9] bg-zinc-900 rounded-lg overflow-hidden relative">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {image.isBase64 && (
                              <span className="absolute bottom-1 right-1 text-[8px] font-mono bg-gold/20 border border-gold/30 text-gold font-bold px-1 py-0.5 rounded uppercase">
                                BASE64
                              </span>
                            )}
                          </div>

                          <div>
                            <p className="text-[11px] font-bold text-zinc-200 truncate">{image.name}</p>
                            <p className="text-[9px] font-mono text-zinc-600 truncate mt-0.5">{image.id}</p>
                          </div>

                          <button
                            type="button"
                            onClick={async () => {
                              setErpSuccess(null);
                              setErpError(null);
                              const res = await updateOffersBannerUrl(image.url);
                              if (res.success) {
                                setErpSuccess(`Successfully deployed "${image.name}" as Offers Section Background Banner!`);
                              } else {
                                setErpError(res.error || "Failed to deploy image as Offers Banner.");
                              }
                            }}
                            className="w-full py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors text-[9px] font-mono uppercase font-bold cursor-pointer text-center"
                          >
                            Set as Offers Banner
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Image Form */}
                  {heroImages.length < 4 ? (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!dbImageName.trim() || !dbImageUrl.trim()) {
                          setDbImageError("Name and URL are required.");
                          return;
                        }
                        setIsAddingDbImage(true);
                        setDbImageSuccess(null);
                        setDbImageError(null);

                        const res = await addHeroImage(dbImageName.trim(), dbImageUrl.trim(), false);
                        setIsAddingDbImage(false);

                        if (res.success) {
                          setDbImageSuccess(`Image "${dbImageName}" added to lookbook database successfully.`);
                          setDbImageName('');
                          setDbImageUrl('');
                          setTimeout(() => setDbImageSuccess(null), 5000);
                        } else {
                          setDbImageError(res.error || "Failed to save image to database.");
                        }
                      }}
                      className="bg-zinc-950 p-4 rounded-xl border border-zinc-900/50 space-y-3.5"
                    >
                      <div className="text-[10px] font-mono uppercase font-black text-zinc-400 tracking-wider">
                        Add New Banner Image
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-500 uppercase font-bold">Image Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Prestige Crimson Promo"
                            value={dbImageName}
                            onChange={(e) => setDbImageName(e.target.value)}
                            className="w-full bg-zinc-905 border border-zinc-800 rounded-lg py-2 px-3 text-[11px] outline-none text-zinc-300 focus:border-gold transition-colors font-sans"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-500 uppercase font-bold">Image Direct URL</label>
                          <input
                            type="url"
                            required
                            placeholder="https://images.unsplash.com/..."
                            value={dbImageUrl}
                            onChange={(e) => setDbImageUrl(e.target.value)}
                            className="w-full bg-zinc-905 border border-zinc-800 rounded-lg py-2 px-3 text-[11px] outline-none text-zinc-300 focus:border-gold transition-colors font-mono"
                          />
                        </div>
                      </div>

                      {/* Or load quickly from Imaginary Device connection if they clicked one */}
                      {selectedImaginaryFile && (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/50 border border-zinc-900 text-[10px]">
                          <div className="flex items-center gap-1.5 truncate text-zinc-400">
                            <span className="text-[8px] font-mono bg-zinc-800 text-gold px-1 rounded">DEVICE</span>
                            <span className="truncate">{selectedImaginaryFile.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setDbImageName(selectedImaginaryFile.name.replace('.JPG', '').replace('.PNG', '').replace(/_/g, ' '));
                              setDbImageUrl(selectedImaginaryFile.url);
                            }}
                            className="text-gold font-mono text-[9px] font-bold uppercase hover:underline shrink-0"
                          >
                            Use This File
                          </button>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isAddingDbImage}
                        className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-gold hover:text-black border border-zinc-800 hover:border-gold text-zinc-300 text-[10px] font-mono uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isAddingDbImage ? (
                          <>
                            <RefreshCw size={12} className="animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <PlusCircle size={12} /> Add to Database Image Shelf
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950 text-center">
                      <p className="text-[11px] text-red-400 font-mono font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 justify-center">
                        <AlertTriangle size={14} /> Database Image Limit Reached
                      </p>
                      <p className="text-[10px] text-zinc-500 leading-relaxed mt-1">
                        Your database is fully populated with 4 images. If you want to add a new image, you must delete an existing one first.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}

          </div>
        </div>

      </div>
      );
    })()}
    </div>
  );
};
