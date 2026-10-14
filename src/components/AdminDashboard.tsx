import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, ShoppingBag, Package, Tag, Truck, BarChart2, 
  Percent, Award, Users, Cpu, Database, Sun, Moon, 
  ArrowLeft, Clock, Menu, X
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { Product, Order, StockLedger } from '../types';

// Modular Management Sub-components
import { TodayPerformanceSection } from './TodayPerformanceSection';
import { BillingDeskSection } from './BillingDeskSection';
import { StockManagementSection } from './StockManagementSection';
import { CatalogueManagementSection } from './CatalogueManagementSection';
import { AccountsManagementSection } from './AccountsManagementSection';
import { OffersManagementSection } from './OffersManagementSection';
import { BrandManagementSection } from './BrandManagementSection';
import { WholesaleDemandSection } from './WholesaleDemandSection';
import { MonthlyReportSection } from './MonthlyReportSection';
import { DataManagementSection } from './DataManagementSection';
import { ErpMediaControlDesk } from './ErpMediaControlDesk';
import { StockPurchaseOrderInvoicePage } from './StockPurchaseOrderInvoicePage';
import { CheckInventoryPage } from './CheckInventoryPage';
import { AdminMobileHomeView } from './AdminMobileHomeView';
import { AdminTodayPerformanceView } from './AdminTodayPerformanceView';
import { AdminTodayInvoicesView } from './AdminTodayInvoicesView';
import { AdminTodaySoldUnitsView } from './AdminTodaySoldUnitsView';
import { AdminTodayReplaceRefundsView } from './AdminTodayReplaceRefundsView';
import { AdminTodayStockInwardView } from './AdminTodayStockInwardView';
import { AdminSlideOverNav } from './AdminSlideOverNav';
import { AdminTopBar } from './AdminTopBar';

export interface AdminDashboardProps {
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onToggleAdminMode?: () => void;
  initialTab?: string;
  onClose?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  theme = 'light',
  onToggleTheme,
  onToggleAdminMode,
  initialTab = 'home',
  onClose
}) => {
  const isDark = theme === 'dark';
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const {
    products,
    orders,
    stockLedgers,
    addProduct,
    updateProduct,
    deleteProduct,
    createOrder,
    createStockLedger,
    heroBannerMode,
    updateHeroBannerMode,
    heroImageDuration,
    updateHeroImageDuration,
    heroImages,
    updateHeroImageSlot,
    heroVideoUrl,
    heroVideoUrl2,
    heroVideoUrl3,
    heroVideoUrl4,
    heroVideoHeading,
    heroVideoHeading2,
    heroVideoHeading3,
    heroVideoHeading4,
    updateHeroVideoUrl,
    updateHeroVideoHeadingSlot,
    uploadLocalVideo,
    activeHeroVideoSlot,
    updateActiveHeroVideoSlot,
    offersBannerUrl,
    updateOffersBannerUrl,
    offersCategoryBgUrl,
    categoryThumbMen,
    categoryThumbWomen,
    categoryThumbKids,
    updateCategoryThumbnail
  } = useProducts();

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (initialTab === 'billing-tab') return 'billing';
    if (initialTab === 'stock-tab') return 'stock';
    if (initialTab === 'reports-tab') return 'reports';
    return initialTab || 'home';
  });

  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isCatalogueAdding, setIsCatalogueAdding] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const isHomeTab = activeTab === 'home' || activeTab === 'today-summary' || activeTab === 'today-invoices' || activeTab === 'today-sold-units' || activeTab === 'today-replace-refunds' || activeTab === 'today-stock-inward' || activeTab === 'billing';

  // Full page modal states
  const [activeFullPageInvoice, setActiveFullPageInvoice] = useState<{ mode: 'add' | 'list' } | null>(null);
  const [isCheckInventoryPageOpen, setIsCheckInventoryPageOpen] = useState(false);

  // Live clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Synchronize when initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      if (initialTab === 'billing-tab') setActiveTab('billing');
      else if (initialTab === 'stock-tab') setActiveTab('stock');
      else if (initialTab === 'reports-tab') setActiveTab('reports');
      else setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Primary Navigation Definition
  const NAV_ITEMS = useMemo(() => [
    { id: 'home', label: "Today's Performance", shortLabel: 'Overview', icon: Home, desc: 'Daily Stats & Alerts' },
    { id: 'today-summary', label: "Today's Performance", shortLabel: 'Today', icon: Home, desc: 'Live Performance Metrics' },
    { id: 'today-invoices', label: "Invoices Generated Today", shortLabel: 'Invoices', icon: ShoppingBag, desc: 'Live Invoices Ledger' },
    { id: 'billing', label: 'Billing Desk', shortLabel: 'Make Bill', icon: ShoppingBag, desc: 'POS Desk & Invoices' },
    { id: 'stock', label: 'Stock Manager', shortLabel: 'Stock', icon: Package, desc: 'Inventory & Ledgers' },
    { id: 'catalogue', label: 'Catalogue', shortLabel: 'Catalogue', icon: Tag, desc: 'Articles & Models' },
    { id: 'wholesale_demand', label: 'Wholesale Demand', shortLabel: 'Mandi', icon: Truck, desc: 'Bulk Shop Orders' },
    { id: 'reports', label: 'Sales Reports', shortLabel: 'Reports', icon: BarChart2, desc: 'Monthly Analytics' },
    { id: 'offers', label: 'Offers & Deals', shortLabel: 'Offers', icon: Percent, desc: 'Promos & Clearances' },
    { id: 'brand_config', label: 'Brand Config', shortLabel: 'Brand', icon: Award, desc: 'Banners & Video Ads' },
    { id: 'accounts', label: 'Manage Accounts', shortLabel: 'Staff', icon: Users, desc: 'User Roles & PINs' },
    { id: 'erp', label: 'ERP Config', shortLabel: 'ERP', icon: Cpu, desc: 'Media & System Settings' },
    { id: 'data_management', label: 'Data Management', shortLabel: 'Data', icon: Database, desc: 'Sample Reset & Backup' }
  ], []);

  const handleExitAdmin = () => {
    if (onToggleAdminMode) onToggleAdminMode();
    else if (onClose) onClose();
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      isDark ? 'bg-zinc-950 text-zinc-100' : isHomeTab ? 'bg-[#FAF7F0] text-[#141311]' : 'bg-[#FAF8F5] text-zinc-900'
    }`}>
      {/* Universal Sticky Top Bar Matching Reference Image */}
      <div className="sticky top-0 z-40 shadow-xs">
        <AdminTopBar
          isDark={isDark}
          activeTab={activeTab}
          currentTitle={NAV_ITEMS.find(n => n.id === activeTab)?.label}
          isNavOpen={isNavMenuOpen}
          onToggleNav={() => setIsNavMenuOpen(!isNavMenuOpen)}
          onCloseNav={() => setIsNavMenuOpen(false)}
          onOpenMenu={() => setIsNavMenuOpen(true)}
          onSelectTab={(tabId) => {
            if (tabId === 'catalogue_add') {
              setIsCatalogueAdding(true);
              setActiveTab('catalogue');
            } else {
              setIsCatalogueAdding(false);
              setActiveTab(tabId);
            }
            setIsNavMenuOpen(false);
          }}
          onToggleTheme={onToggleTheme || (() => {})}
          onExitAdmin={handleExitAdmin}
          onNavigateHome={() => {
            setActiveTab('home');
            setIsCatalogueAdding(false);
            setIsNavMenuOpen(false);
          }}
        />
      </div>



      {/* Main Content Area */}
      <main className={`max-w-7xl mx-auto ${isHomeTab ? 'px-2 sm:px-4 py-2 sm:py-3' : 'px-4 sm:px-6 lg:px-8 py-6 sm:py-8'}`}>
        {/* 1. Exact Mobile Home UI matching uploaded screenshot */}
        {activeTab === 'home' && (
          <AdminMobileHomeView
            isDark={isDark}
            orders={orders}
            products={products}
            onNavigate={(tabId) => {
              if (tabId === 'catalogue_add') {
                setIsCatalogueAdding(true);
                setActiveTab('catalogue');
              } else {
                setIsCatalogueAdding(false);
                setActiveTab(tabId);
              }
            }}
            onExitAdmin={handleExitAdmin}
            onToggleTheme={onToggleTheme || (() => {})}
            onOpenMenu={() => setIsNavMenuOpen(true)}
          />
        )}

        {/* 1b. Today's Performance View matching user reference screenshot */}
        {activeTab === 'today-summary' && (
          <AdminTodayPerformanceView
            isDark={isDark}
            orders={orders}
            products={products}
            stockLedgers={stockLedgers}
            onNavigate={(tabId) => {
              setIsCatalogueAdding(false);
              setActiveTab(tabId);
            }}
            onBack={() => setActiveTab('home')}
          />
        )}

        {/* 1c. Today's Invoices Generated View matching reference screenshot */}
        {activeTab === 'today-invoices' && (
          <AdminTodayInvoicesView
            isDark={isDark}
            orders={orders}
            onBackToSummary={() => setActiveTab('today-summary')}
            onNavigate={(tabId) => {
              setIsCatalogueAdding(false);
              setActiveTab(tabId);
            }}
          />
        )}

        {/* 1d. Today's Sold Units Ledger View matching reference screenshot */}
        {activeTab === 'today-sold-units' && (
          <AdminTodaySoldUnitsView
            isDark={isDark}
            orders={orders}
            products={products}
            onBackToSummary={() => setActiveTab('today-summary')}
            onNavigate={(tabId) => {
              setIsCatalogueAdding(false);
              setActiveTab(tabId);
            }}
          />
        )}

        {/* 1e. Today's Replace / Exchange Ledger View matching reference screenshot */}
        {activeTab === 'today-replace-refunds' && (
          <AdminTodayReplaceRefundsView
            isDark={isDark}
            orders={orders}
            products={products}
            onBackToSummary={() => setActiveTab('today-summary')}
            onNavigate={(tabId) => {
              setIsCatalogueAdding(false);
              setActiveTab(tabId);
            }}
          />
        )}

        {/* 1f. Today's Stock Inward Ledger View matching reference screenshot */}
        {activeTab === 'today-stock-inward' && (
          <AdminTodayStockInwardView
            isDark={isDark}
            stockLedgers={stockLedgers}
            products={products}
            onBackToSummary={() => setActiveTab('today-summary')}
            onNavigate={(tabId) => {
              setIsCatalogueAdding(false);
              setActiveTab(tabId);
            }}
          />
        )}

        {/* 2. Billing & POS Desk */}
        {activeTab === 'billing' && (
          <BillingDeskSection
            products={products}
            orders={orders}
            isDark={isDark}
            onCreateOrder={createOrder}
            onUpdateProduct={updateProduct}
            onBackToHome={() => setActiveTab('home')}
            onNavigate={(tabId) => {
              setIsCatalogueAdding(false);
              setActiveTab(tabId);
            }}
          />
        )}

        {/* 3. Stock Management */}
        {activeTab === 'stock' && (
          <StockManagementSection
            products={products}
            isDark={isDark}
            onUpdateProduct={updateProduct}
            onOpenAddInvoice={() => setActiveFullPageInvoice({ mode: 'add' })}
            onOpenInvoicesList={() => setActiveFullPageInvoice({ mode: 'list' })}
            onOpenCheckInventory={() => setIsCheckInventoryPageOpen(true)}
            onGoToWholesaleDemand={() => setActiveTab('wholesale_demand')}
            onBackToHome={() => setActiveTab('home')}
            onAddNewProduct={() => {
              setIsCatalogueAdding(true);
              setActiveTab('catalogue');
            }}
            stockLedgers={stockLedgers}
            onCreateStockLedger={createStockLedger}
          />
        )}

        {/* 4. Catalogue Management */}
        {activeTab === 'catalogue' && (
          <CatalogueManagementSection
            products={products}
            isDark={isDark}
            onAddProduct={addProduct}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
            initialIsAdding={isCatalogueAdding}
          />
        )}

        {/* 5. Order Stock Management (Wholesale Demand) */}
        {activeTab === 'wholesale_demand' && (
          <WholesaleDemandSection
            isDark={isDark}
            products={products}
            onBackToHome={() => setActiveTab('home')}
            onOpenCreateOrder={() => setActiveFullPageInvoice({ mode: 'add' })}
            onOpenCheckInventory={() => setIsCheckInventoryPageOpen(true)}
            onOpenInvoicesHistory={() => setActiveFullPageInvoice({ mode: 'list' })}
          />
        )}

        {/* 6. Sales Reports & Analytics */}
        {(activeTab === 'reports' || activeTab === 'analytics') && (
          <MonthlyReportSection
            isDark={isDark}
            orders={orders}
            products={products}
            stockLedgers={stockLedgers}
            onBackToHome={() => setActiveTab('home')}
          />
        )}

        {/* 7. Promotional Offers & Clearance */}
        {activeTab === 'offers' && (
          <OffersManagementSection
            products={products}
            isDark={isDark}
            onUpdateProduct={updateProduct}
          />
        )}

        {/* 8. Brand Configuration */}
        {activeTab === 'brand_config' && (
          <BrandManagementSection theme={isDark ? 'dark' : 'light'} />
        )}

        {/* 9. Accounts & Staff Management */}
        {activeTab === 'accounts' && (
          <AccountsManagementSection isDark={isDark} />
        )}

        {/* 10. ERP Media & Settings */}
        {activeTab === 'erp' && (
          <ErpMediaControlDesk
            isDark={isDark}
            heroBannerMode={heroBannerMode}
            updateHeroBannerMode={updateHeroBannerMode}
            heroImageDuration={heroImageDuration}
            updateHeroImageDuration={updateHeroImageDuration}
            heroImages={heroImages}
            updateHeroImageSlot={updateHeroImageSlot}
            heroVideoUrl={heroVideoUrl}
            heroVideoUrl2={heroVideoUrl2}
            heroVideoUrl3={heroVideoUrl3}
            heroVideoUrl4={heroVideoUrl4}
            heroVideoHeading={heroVideoHeading}
            heroVideoHeading2={heroVideoHeading2}
            heroVideoHeading3={heroVideoHeading3}
            heroVideoHeading4={heroVideoHeading4}
            updateHeroVideoUrl={updateHeroVideoUrl}
            updateHeroVideoHeadingSlot={updateHeroVideoHeadingSlot}
            uploadLocalVideo={uploadLocalVideo}
            activeHeroVideoSlot={activeHeroVideoSlot}
            updateActiveHeroVideoSlot={updateActiveHeroVideoSlot}
            offersBannerUrl={offersBannerUrl}
            updateOffersBannerUrl={updateOffersBannerUrl}
            offersCategoryBgUrl={offersCategoryBgUrl}
            categoryThumbMen={categoryThumbMen}
            categoryThumbWomen={categoryThumbWomen}
            categoryThumbKids={categoryThumbKids}
            updateCategoryThumbnail={updateCategoryThumbnail}
          />
        )}

        {/* 11. Data Management */}
        {activeTab === 'data_management' && (
          <DataManagementSection
            isDark={isDark}
            onRefreshParentState={() => {}}
          />
        )}
      </main>

      {/* Full-Screen Modals */}
      {/* 1. Add / View Purchase Invoice */}
      {activeFullPageInvoice && (
        <StockPurchaseOrderInvoicePage
          products={products}
          isDark={isDark}
          mode={activeFullPageInvoice.mode === 'add' ? 'create' : 'list'}
          onBack={() => setActiveFullPageInvoice(null)}
          onSaveInvoice={async (invoice) => {
            await createStockLedger({
              items: (invoice.items || []).map(it => ({
                productId: it.productId,
                name: it.productName,
                productName: it.productName,
                articleCode: it.articleCode,
                brand: it.brand,
                size: it.size || '7',
                color: it.colorName,
                colorId: 1,
                quantity: it.quantityPairs,
                purchaseRate: it.costPricePerPair,
                mrp: it.costPricePerPair
              })),
              totalUnits: invoice.totalPairs || 0,
              status: 'completed',
              notes: `Supplier: ${invoice.supplierName} | Bill No: ${invoice.invoiceNumber} | Total: ₹${invoice.totalAmount}`
            });
            setActiveFullPageInvoice(null);
          }}
        />
      )}

      {/* 2. Check Inventory Full Page */}
      {isCheckInventoryPageOpen && (
        <CheckInventoryPage
          products={products}
          isDark={isDark}
          onClose={() => setIsCheckInventoryPageOpen(false)}
          onOpenCreateOrder={() => {
            setIsCheckInventoryPageOpen(false);
            setActiveFullPageInvoice({ mode: 'add' });
          }}
          onUpdateProductStock={async (prodId, newSizeStock, newTotalStock) => {
            await updateProduct(prodId, {
              sizeStock: newSizeStock,
              stock: newTotalStock
            });
          }}
        />
      )}
    </div>
  );
};
