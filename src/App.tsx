import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductProvider, useProducts } from './context/ProductContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SizeSelectionOverlay } from './components/SizeSelectionOverlay';
import { ProductSection } from './components/ProductSection';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { InfoModals } from './components/InfoModals';
import { InvoiceViewer } from './components/InvoiceViewer';
import { Category, Product, CartItem } from './types';
import { Sparkles, ShoppingBag, ArrowUpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function PrashantFootwearApp() {
  const { currentUser, isAdmin } = useAuth();
  const { products, loading } = useProducts();

  // Selected dark or light theme ('dark' | 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Active Category / Size selections for dynamic filtering
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  // Offer Flow states (Dead Stock / Out of Stock Wizard)
  const [isOfferFlowActive, setIsOfferFlowActive] = useState(false);
  const [offerFlowStep, setOfferFlowStep] = useState<'category' | 'size' | 'results'>('category');
  const [offerFlowCategory, setOfferFlowCategory] = useState<Category | null>(null);
  const [offerFlowSize, setOfferFlowSize] = useState<number | null>(null);

  // Modal / overlay trigger states
  const [isSizeOverlayOpen, setIsSizeOverlayOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authPrefill, setAuthPrefill] = useState<{ mobile: string; pass: string } | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [infoModalType, setInfoModalType] = useState<'about' | 'contact' | null>(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [detailInitialColorId, setDetailInitialColorId] = useState<number | string | null>(null);

  // Workspace Mode: Admin Dashboard vs E-Commerce Storefront
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState<string>('home');

  const handleNavigateAdminTab = (tab: string) => {
    setAdminActiveTab(tab);
    setIsAdminMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Shopping Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Show "Scroll to top" button on long scrolls
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [viewingInvoiceId, setViewingInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invId = params.get('invoiceId');
    if (invId) {
      setViewingInvoiceId(invId);
    }
  }, []);

  // Sync Tailwind dark mode class with React theme state
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync admin mode off if user logs out or is no longer an admin
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      setIsAdminMode(false);
    }
  }, [currentUser]);

  // Handle Category click from Hero cinematic viewport
  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setSelectedSize(null); // Reset previous size
    setIsSizeOverlayOpen(false); // Use inline selection instead of popup overlay

    // Smooth scroll to the top of the new size selection page
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Handle Size selection from Overlay
  const handleSelectSize = (size: number) => {
    setSelectedSize(size);
    setIsSizeOverlayOpen(false);

    // Dynamic smooth scroll down to the product catalogue section
    setTimeout(() => {
      const el = document.getElementById('products-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedSize(null);
    setIsOfferFlowActive(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToProducts = () => {
    setIsOfferFlowActive(false);
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToTop = () => {
    setSelectedCategory(null);
    setSelectedSize(null);
    setIsOfferFlowActive(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenOffers = () => {
    setSelectedCategory(null);
    setSelectedSize(null);
    setIsOfferFlowActive(true);
    setOfferFlowStep('category');
    setOfferFlowCategory(null);
    setOfferFlowSize(null);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // --- CART MANAGEMENT ---
  const handleAddToCart = (product: Product, size: number) => {
    const existingIdx = cartItems.findIndex(
      item => item.product.id === product.id && item.selectedSize === size
    );

    if (existingIdx > -1) {
      const updated = [...cartItems];
      updated[existingIdx].quantity += 1;
      setCartItems(updated);
    } else {
      setCartItems([...cartItems, { product, selectedSize: size, quantity: 1 }]);
    }

    // Close product details modal if open and open Cart drawer directly
    setSelectedDetailProduct(null);
    setDetailInitialColorId(null);
    setIsCartDrawerOpen(true);
  };

  const handleUpdateCartQty = (productId: string, size: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId, size);
      return;
    }
    const updated = cartItems.map(item => {
      if (item.product.id === productId && item.selectedSize === size) {
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(updated);
  };

  const handleRemoveCartItem = (productId: string, size: number) => {
    setCartItems(
      cartItems.filter(item => !(item.product.id === productId && item.selectedSize === size))
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (viewingInvoiceId) {
    return (
      <InvoiceViewer 
        invoiceId={viewingInvoiceId} 
        onClose={() => {
          setViewingInvoiceId(null);
          const url = new URL(window.location.href);
          url.searchParams.delete('invoiceId');
          window.history.pushState({}, '', url.toString());
        }} 
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
            Loading Prashant Footwear...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`isolate min-h-screen transition-colors duration-500 selection:bg-emerald-500 ${
      theme === 'dark' 
        ? 'bg-black text-white selection:text-black' 
        : 'bg-[#F9F9FB] text-zinc-900 selection:text-white'
    }`}>
      {/* Premium Header/Navbar */}
      {!isAdminMode && (
        <Navbar
          onOpenAuth={(mode, prefill) => {
            setAuthModalMode(mode || 'login');
            setAuthPrefill(prefill || null);
            setIsAuthModalOpen(true);
          }}
          onScrollToProducts={handleScrollToProducts}
          onScrollToTop={handleScrollToTop}
          onOpenAbout={() => setInfoModalType('about')}
          onOpenContact={() => setInfoModalType('contact')}
          onOpenOffers={handleOpenOffers}
          isAdminMode={isAdminMode}
          onToggleAdminMode={() => setIsAdminMode(!isAdminMode)}
          onNavigateAdminTab={handleNavigateAdminTab}
          cartCount={cartCount}
          onOpenCart={() => setIsCartDrawerOpen(true)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          showThemeToggle={true}
        />
      )}

      {/* Conditionally Render Shop storefront or Admin Workspace Dashboard */}
      <AnimatePresence mode="wait">
        {isAdminMode ? (
          <motion.div
            key="admin-workspace"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <AdminDashboard 
              theme={theme} 
              onToggleTheme={handleToggleTheme} 
              onToggleAdminMode={() => setIsAdminMode(!isAdminMode)} 
              initialTab={adminActiveTab}
            />
          </motion.div>
        ) : (
          <motion.div
            key="storefront"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Cinematic Hero (9:16 vertical loop) */}
            {!selectedCategory && !isOfferFlowActive && (
              <Hero
                onSelectCategory={handleSelectCategory}
                onScrollToProducts={handleScrollToProducts}
              />
            )}

            {/* Dynamic Footwear Catalogue Grid with Sub-sections */}
            <ProductSection
              products={products}
              selectedCategory={selectedCategory}
              selectedSize={selectedSize}
              onClearFilters={handleClearFilters}
              onSelectProduct={(p, initialColorId) => {
                setSelectedDetailProduct(p);
                setDetailInitialColorId(initialColorId ?? null);
              }}
              onAddToCart={handleAddToCart}
              onSelectCategory={setSelectedCategory}
              onSelectSize={setSelectedSize}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              isOfferFlowActive={isOfferFlowActive}
              setIsOfferFlowActive={setIsOfferFlowActive}
              offerFlowStep={offerFlowStep}
              setOfferFlowStep={setOfferFlowStep}
              offerFlowCategory={offerFlowCategory}
              setOfferFlowCategory={setOfferFlowCategory}
              offerFlowSize={offerFlowSize}
              setOfferFlowSize={setOfferFlowSize}
            />

            {/* Immersive Footer */}
            <footer className={`backdrop-blur-xl border-t py-12 text-center text-xs font-mono transition-colors duration-500 ${
              theme === 'dark'
                ? 'bg-black/60 border-zinc-900/30 text-zinc-500'
                : 'bg-zinc-100/80 border-zinc-200 text-zinc-600'
            }`}>
              <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                <span className={`tracking-widest font-black ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-700'}`}>
                  PRASHANT FOOTWEAR © 2026
                </span>
                <div className="flex gap-6 uppercase tracking-wider font-bold">
                  <button onClick={() => setInfoModalType('about')} className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:text-white text-zinc-400' : 'hover:text-zinc-900 text-zinc-600'}`}>About Workshop</button>
                  <button onClick={() => setInfoModalType('contact')} className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:text-white text-zinc-400' : 'hover:text-zinc-900 text-zinc-600'}`}>Service Hotlines</button>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Size Selection Popup Overlay */}
      {isSizeOverlayOpen && (
        <SizeSelectionOverlay
          category={selectedCategory}
          onClose={() => setIsSizeOverlayOpen(false)}
          onSelectSize={handleSelectSize}
        />
      )}

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        prefill={authPrefill}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthPrefill(null);
        }}
      />

      {/* Product Details Portfolio Modal */}
      {selectedDetailProduct && (
        <ProductDetailModal
          product={selectedDetailProduct}
          selectedSize={selectedSize}
          initialColorId={detailInitialColorId}
          theme={theme}
          onClose={() => {
            setSelectedDetailProduct(null);
            setDetailInitialColorId(null);
          }}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Shopping Cart Sliding Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        theme={theme}
        onOpenAuth={() => {
          setIsCartDrawerOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Informational About / Contact Modals */}
      <InfoModals
        isOpen={!!infoModalType}
        onClose={() => setInfoModalType(null)}
        type={infoModalType || 'about'}
      />

      {/* Sticky Quick-Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleScrollToTop}
            className="fixed bottom-6 right-6 p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500 transition-colors shadow-2xl cursor-pointer z-40"
          >
            <ArrowUpCircle size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ProductProvider>
          <PrashantFootwearApp />
        </ProductProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
